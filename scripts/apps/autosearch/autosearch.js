/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/**
 * @depends path=/resources/scripts/apps/autosearch/popup.js
 * @depends path=/resources/scripts/apps/autosearch/progressmeter.js
 * @depends path=/resources/scripts/apps/autosearch/list.js
 * @depends path=/resources/scripts/apps/autosearch/search_source.js
 * @depends path=/resources/scripts/apps/autosearch/activity_source.js
 * @depends path=/resources/scripts/apps/autosearch/content_source.js
 * @depends path=/resources/scripts/apps/autosearch/people_source.js
 * @depends path=/resources/scripts/apps/autosearch/place_source.js
 * @depends path=/resources/scripts/apps/shared/models/bookmark_source.js
 * @depends path=/resources/scripts/apps/shared/views/typeahead_input.js
 * @depends path=/resources/scripts/jive/fresh_action_queue.js
 * @depends path=/resources/scripts/jive/search/search-metrics.js
 * @depends path=/resources/scripts/jive/search/search.js
 * @depends path=/resources/scripts/jquery/jquery.utils.js
 * @depends path=/resources/scripts/jquery/jquery.view.js
 * @depends path=/resources/scripts/jquery/jquery.placeheld.js
 * @depends template=jive.autosearch.overlay scope=client
 * @depends template=jive.autosearch.spotlightPopup scope=client
 * @depends template=jive.autosearch.spotlightView scope=client
 * @depends template=jive.autosearch.results scope=client
 */
define(
    "jive.component.AutoSearchView",
    [
        'jquery',
        'jive.component.autosearch.SearchSource',
        'jive.component.autosearch.ActivitySource',
        'jive.component.autosearch.ContentSource',
        'jive.component.autosearch.PeopleSource',
        'jive.component.autosearch.PlaceSource',
        'jive.component.list',
        'jive.component.PopupView',
        'jive.component.ProgressMeterView',
        'jive.conc.FreshActionQueue'],
    function ($, SearchSource, ActivitySource, ContentSource, PeopleSource, PlaceSource, list, PopupView, ProgressMeterView, FreshActionQueue)
    {
        var autosearch = {};

        autosearch.init = function(){
            var $document = $(document);
            $("input[data-component='autosearch']").placeHeld();

            //attach listeners
            $document.on("focus.autosearchview", "input[data-component='autosearch']",
                function(event){
                    var $search = $(this);
                    $search.parent().addClass("focused");
                    var search = $search.view(AutoSearchView);
                    if(!(search.getPopup().getState() == "visible")){
                        search.renderView();//render current view
                        search.loadViewContent();// load current view data
                    }
                }
            );

            //global switchboard listener
            jive.switchboard.addListener('bookmark.create', function(bookmark) {
                //TODO this could move into the actual search element view
                var $searches = $("#j-spotlight-search");
                $searches.addClass("j-bookmark-created");
                $searches.append(jive.autosearch.overlay({type: 'bookmark'}));
                var $overlays = $searches.find(".j-tooltip");
                $overlays.fadeIn(250);
                setTimeout(
                    function(){
                        $searches.removeClass("j-bookmark-created");
                        $overlays.fadeOut(250, function() {
                            $(this).remove();
                        });
                    },
                    1500
                );
            });

        };

        var AutoSearchView =  jive.oo.Class.extend(
            function(protect){
                protect.init = function(element){
                    this.$element = $(element);
                    this.loadingQueue = new FreshActionQueue();
                    this.searchSource = new SearchSource();//considering using the jive.search JS library instead of a custom source
                    this.activitySource = new ActivitySource();
                    this.contentSource = new ContentSource();
                    this.peopleSource = new PeopleSource();
                    this.placeSource = new PlaceSource();
                    this.bookmarkSource = new jive.BookmarkSource();//TODO need to pull this in with the defines functionality
                    this.metrics = new jive.search.SearchMetrics('spotlight-search');//TODO need to pull this in with the defines functionality
                    this.$element.attr("maxlength", 250);//set programatically to make sure it never goes over a reasonable limit
                    if (this.$element.data("container")) {
                        var containerSplit = this.$element.data("container").split(":");
                        this.containerType = parseInt(containerSplit[0]);
                        this.containerId = parseInt(containerSplit[1]);
                        this.containerBrowseId = parseInt(this.$element.data("container-browseid"));
                        // initialize these values to the best of our ability
                        this.filterType = "place";
                        this.filter = [ "/places/" + this.containerBrowseId ];
                        this.displayName = this.$element.data("container-name");
                        this.forceFiltered = true;
                    }
                    else {
                        this.containerType = jive.global.containerType;
                        this.containerId = jive.global.containerID;
                        this.containerBrowseId = jive.global.containerBrowseId;
                    }

                    //TODO this could have problems due to the asynchronous of the events
                    //on initialization of object we need to get information about current location
                    //if currently viewing a person we need to get the person object to get display name
                    //values come from jive constants
                    if (this.containerType == 3) {
                        //use person service to get person
                        this.peopleSource.get(this.containerId).addCallback(
                            function(data){
                                if(data){
                                    formatResult("people", data);
                                    this.filterType = "author";
                                    this.filter = new RegExp("/[^/]*/[^/]*$").exec(data.resources.self.ref);
                                    this.displayName = data.displayName;
                                }
                            }.bind(this)
                        );
                    }
                    //if not a person, try to get the place object
                    else if (this.containerType != 2020) {
                        this.placeSource.get(this.containerBrowseId).addCallback(
                            function(data){
                                if(data && !(data.type == 'space' && data.parent == null)){
                                    this.filterType = "place";
                                    this.filter = new RegExp("/[^/]*/[^/]*$").exec(data.resources.self.ref);
                                    this.displayName = data.name;
                                }
                            }.bind(this)
                        );
                    }

                    var search = this;
                    //get a the input field as a TypeaheadInput object for handling change events
                    this.input = new jive.TypeaheadInput(element);
                    this.input.addListener("change",
                        search.change.bind(search)
                    );
                    this.input.addListener("clear",
                        search.clear.bind(search)
                    );

                    //event for capturing keys entered into the input field
                    this.$element.on("keyup",  function(event){
                        search.key(event.which);
                    });
                    //this is instead of on blur to close the popup but only works on keydown since keyup takes place in a different element
                    this.$element.on("keydown",  function(event){
                        if(event.which == $.keyCode.TAB){
                            search.getPopup().hide();
                        }
                    });

                    //bind events to clear button if there is one

                    var $clearButton = $("[data-type='clear'][data-field='"+ this.$element.get(0).id + "']");
                    $clearButton.on("click",
                        function(event){
                            search.$element.focus();
                            search.$element.val("");
                            search.setView(null);
                            search.renderView();
                            search.loadViewContent();
                            $(this).removeClass("j-active");
                        }
                    );

                    var $searchButton = $("[data-type='search'][data-field='"+ this.$element.get(0).id + "']");
                    $searchButton.on("click",
                        function(event){
                            search.navigateToSearchPage();
                        }
                    );


                    this.$element.on("click",
                        function(event){
                            event.stopPropagation();
                            var $search = $(this);
                               $search.parent().addClass("focused");
                               var search = $search.view(AutoSearchView);
                               if(!(search.getPopup().getState() == "visible")){
                                   search.renderView();//render current view
                                   search.loadViewContent();// load current view data
                               }
                        }
                    );
                    this.$element.on("blur", function(event){$(this).parent().removeClass("focused");});
                };
                this.toString = function(){return "[object AutoSearchView]";};

                protect.getCurrentView = function(){
                    var view = this.currentView;
                    if(view == null){
                        view = this.getDefaultView();
                    }
                    return view;
                };
                protect.getDefaultView = function(){
                    //if frequent is availabe return it
                    //else if bookmarks available return it
                    //else return null;
                    var availableViews = this.getAvailableViews();
                    if(availableViews["frequent"]){
                        return "frequent";
                    } else if(availableViews["bookmarks"]) {
                        return "bookmarks";
                    } else {
                        return null;
                    }
                };

                this.getPopupElement = function(){
                    var popupElement = this.$element.data("popupElement");//look for stored popup element
                    if(!popupElement){
                        var popupReference = this.$element.data("popup");//find element by linked if if provided
                        var $popupElement;
                        if(popupReference){
                            $popupElement = $("#" + popupReference);
                        } else {
                            $popupElement = $(jive.autosearch.spotlightPopup());//generate popup if does not already exist
                            this.$element.after($popupElement);
                        }
                        popupElement = $popupElement.get(0);
                        this.$element.data("popupElement", popupElement);
                    }
                    return popupElement;
                };

                protect.getSearchTerm = function(){
                    return this.$element.val();
                };
                this.activateItem = function(item){//this method is currently for search metrics only
                    var $item = $(item);
                    if(!$item.hasClass('more') && this.getCurrentView() == "all" || this.getCurrentView() == "filtered"){//only run this if we are in a search view
                        var index = $item.closest("[data-component='listitem']").prevAll("[data-component='listitem']").length;
                        var type = $item.closest("div[data-type]").attr("data-type");
                        this.metrics.setChoice(type, index, $item.get(0).href);
                    }
                };
                /**
                 * Returns the current PopupView object associated with this search
                 */
                this.getPopup = function(){
                    return $(this.getPopupElement()).view(AutoSearchPopupView);
                };
                this.hidePopup = function(){
                    this.getPopup().hide();
                };
                this.showPopup = function(force){
                    var popup = this.getPopup();
                    if(!$(this.getPopupElement()).is(":visible") || force){
                        var anchor = this.anchor ? $(this.anchor) : null;
                        if(anchor == null){
                            anchor = this.$element.data("popup-anchor");
                            anchor = anchor ? $("#" + anchor): this.$element;
                        }
                        this.getPopup().show(this.$element.get(0), anchor);
                    }
                };
                this.setAnchor = function(node){
                    this.anchor = node;
                };
                /**
                 * Returns the current List element associated with this search
                 */
                protect.getListElement = function(){
                    var $popup = $(this.getPopupElement());
                    return $popup.find("[data-component='list']").get(0);
                };

                protect.specify = function(type, promise, params){
                    return promise.pipe(function(data){return {type : type, params: params, data: data};});
                };
                protect.loadFrequentlyViewed = function(){
                    var promises = [];
                    promises.push(this.specify("content", this.activitySource.queryFrequent("content", 10)));
                    promises.push(this.specify("people", this.activitySource.queryFrequent("people", 10)));
                    promises.push(this.specify("places", this.activitySource.queryFrequent("places", 10)));
                    return promises;
                };
                protect.loadBookmarks = function(){
                    var deferred = new $.Deferred();
                    this.contentSource.query({type : "favorite", author: "/people/" + _jive_current_user.ID}, 10).then(
                        //TODO this needs to handle errors as well as success
                        function(data){deferred.resolve(data);}
                    );
                    return [this.specify("content", deferred)];
                };
                protect.loadHistory = function(){
                    var promises = [];
                    promises.push(this.specify("content", this.activitySource.queryRecent("content", 10)));
                    promises.push(this.specify("people", this.activitySource.queryRecent("people", 10)));
                    promises.push(this.specify("places", this.activitySource.queryRecent("places", 10)));
                    return promises;
                };
                protect.executeSearch = function(){
                    var promises = [];
                    //executes each search asynchronously for each type
                    promises.push(this.performSearchQuery("content"));
                    if(this.getCurrentView() != 'filtered'){
                        promises.push(this.performSearchQuery("people"));
                        promises.push(this.performSearchQuery("places"));
                    }
                    return promises;
                };

                protect.performSearchQuery = function(type){
                    var searchTerm = $.trim(this.getSearchTerm()) + '*';
                    var filter = null;
                    if(this.getCurrentView() == 'filtered'){
                        filter = {};
                        filter[this.filterType] = this.filter;
                    }
                    //build params for metrics
                    var queryType = type == "content" ? "contents" : type;//fixes plurality for search service query
                    var params = this.searchSource.createParams(searchTerm, filter, "relevanceDesc", 10);
                    var query = new jive.search.SearchMetricsQuery("/api/core/v3/search/" + queryType + "?" + $.param(params));//create search query
                    this.metrics.addQuery(query, queryType);//add metrics
                    return this.specify(type, this.searchSource.query(queryType, searchTerm, filter, "relevanceDesc", 10).then(
                        this.processSearchResult.bind(this, query)
                    ), {searchTerm : searchTerm, filterType : this.filterType, filter: this.filter});
                };

                protect.processSearchResult = function(metricsQuery, data){
                    metricsQuery.setReturnedDate(new Date().getTime());
                    metricsQuery.addResults(data.list.map(toMetricInfo));
                };

                function toMetricInfo(result) {
                    return {
                        id: result.id,
                        type: result.type
                    }
                }

                this.deleteBookmark = function(id){
                    var promise = new jive.conc.Promise();
                    this.bookmarkSource.destroy(id).addCallback(function() {
                        jive.switchboard.emit('bookmark.destroy', jQuery.extend({}, {id: id}));
                        promise.emitSuccess();
                    });
                    return promise;
                };

                //this is copied from search-page.js and modified
                function formatResult(facet, result) {
                    if(result.type == 'favorite' && result.favoriteObject.type != 'url'){//added this to handle internal bookmarks
                        result = result.favoriteObject;

                        // figure out whether to display external access warning
                        result.displayExternalAccess = (!_jive_current_user.partner) && result.visibleToExternalContributors;

                    }
                    if (facet == 'content') {
                        if(result.published){
                            result.publishedDate = parseDate(result.published).getTime();
                        }
                        if(result.updated){
                            result.updatedDate = parseDate(result.updated).getTime();
                        }
                        // 2011-09-19T20:38:23.423+0000

                        // set name to use for display
                        if (result.author && !result.author.displayName) {
                            result.author.displayName = result.author.name.formatted || result.author.jive.username;
                        }
                        if(result.type == "file" && result.binaryURL){
                            result.extension = result.binaryURL.split('.').slice(-1).join('.').toLowerCase();
                        }
                        if(!result.subject && result.highlightSubject){
                            result.subject = result.highlightSubject;
                        }
                        if(!result.subject && result.parentContent){
                            result.subject = result.parentContent.name;
                        }
                        result.subject = $("<div>" + result.subject + "</div>").text();//strip markup from subject if there is any

                        // figure out whether to display external access warning
                        result.displayExternalAccess = (!_jive_current_user.partner) && result.visibleToExternalContributors;
                    } else if (facet == 'people') {
                        //format title and department
                        if (result.jive && result.jive.profile && result.jive.profile instanceof Array) {
                            $(result.jive.profile).each(function(i, field) {
                                if (field.jive_label == "Title") {
                                    result.title = field.value;
                                } else if (field.jive_label == "Department") {
                                    result.department = field.value;
                                }
                            });
                        }
                        // set name to use for display
                        if (!result.displayName) {
                            result.displayName = result.name.formatted || result.jive.username;
                        }
                        // figure out whether to display external contributor warning
                        result.displayExternalContributor = (!_jive_current_user.partner) && result.jive && result.jive.externalContributor;
                    } else {
                        result.displayExternalAccess = (!_jive_current_user.partner) && result.visibleToExternalContributors;
                    }
                }
                function parseDate(almostISOString) {
                    // from 2011-09-19T20:38:23.954+0000 to 2011-09-19T20:38:23.954Z the ecmascript standard
                    var isoString = almostISOString.replace(/\+\d+/, 'Z');
                    var date = new Date(isoString);
                    if (isNaN(date.getTime())) {
                        // from 2011-09-19T20:38:23.954Z to 2011/09/19 20:38:23 GMT the lame hack for IE
                        var formatForIE7etall = isoString.replace(/-/, '/').replace('T', ' ').replace(/\.\d+Z/, ' GMT');
                        date = new Date(formatForIE7etall);
                    }
                    return date;
                }

                protect.getAvailableViews = function(){
                    var views = {
                        bookmarks: !this.$element.is("[data-hidetypes~='bookmarks']"),
                        frequent: !this.$element.is("[data-hidetypes~='frequent']"),
                        recent: !this.$element.is("[data-hidetypes~='recent']"),
                        all: !this.$element.is("[data-hidetypes~='all']"),
                        filtered: this.filterType ? !this.$element.is( "[data-hidetypes~='filtered']") : false
                    };
                    return views;
                };
                /**
                 * Renders the current active view
                 * @param view a soy template for the view to render
                 */
                this.renderView = function(){
                    var currentView = this.getCurrentView();
                    if(currentView){//do not show any view if currentView is null
                        var $popupElement = $(this.getPopupElement());
                        $popupElement.empty();
                        $popupElement.append(jive.autosearch.spotlightView({view : currentView, availableViews : this.getAvailableViews(), filterDisplayName : this.displayName, communityName: this.$element.attr("data-community-name")}));
                        this.showPopup();//will show the popup if it is not already showing
                    } else {
                        this.hidePopup();
                    }
                };

                protect.startLoad = function(){
                    var $list = $(this.getPopupElement());
                    var $loading = $list.find("[data-component='loadingpanel']");
                    var $progressMeters = $list.find("[data-component='progressmeter']");
                    if($loading.length){
                        $progressMeters = $loading.find("[data-component='progressmeter']");
                    }
                    $progressMeters.each(function(index, item){$(item).view(ProgressMeterView).start();});
                };

                protect.endLoad = function(){
                    var $list = $(this.getPopupElement());
                    var $progressMeters = $list.find("[data-component='progressmeter']");
                    $progressMeters.each(function(index, item){$(item).view(ProgressMeterView).stop();});
                };

                this.loadViewContent = function(){
                    //start the indicator of progress
                    //call request to load data which will return an array of promisses
                    //combine those promises into a when
                    //push the when onto the loadingQueue
                    //add a then to the promise returned from the loading queue that
                    var currentView = this.getCurrentView();
                    var promises;
                    this.startLoad();
                    switch(currentView){
                        case "frequent":
                            promises = this.loadFrequentlyViewed();
                            break;
                        case "recent":
                            promises = this.loadHistory();
                            break;
                        case "bookmarks":
                            promises = this.loadBookmarks();
                            break;
                        case "all":
                        case "filtered":
                            promises = this.executeSearch();
                            break;
                    }
                    if(promises && promises.length){
                        var search = this;
                        var searchTerm = $.trim(this.getSearchTerm()) + '*';
                        this.loadingQueue.push($.when.apply($, promises))
                            .then(function(){search.processResult(currentView, searchTerm, Array.prototype.slice.call(arguments));});
                    }

                };

                protect.processResult = function(renderView, searchTerm, data){
                    if(renderView == this.getCurrentView()){
                        //console.debug("rendering view " + renderView);
                        this.endLoad();
                        var params = {view: renderView, searchTerm : searchTerm, filterType : this.filterType, filter: this.filter, results: {}};
                        if(data != null){
                            data.forEach(
                                function(result){
                                    if(result && result.data && result.data.list){
                                        result.data.list.forEach(
                                            function(item){
                                                formatResult(result.type, item);
                                            }
                                        );
                                        params.results[result.type] = result.data.list;
                                    }
                                }
                            );
                        }
                        //console.debug(params.results);
                        $(this.getListElement()).empty().append(jive.autosearch.results(params));
                        this.showPopup(true);
                    }
                    else {
                        //console.debug("Received Result for " + renderView + " while current view is " + this.getCurrentView());
                    }
                };

                /**
                 * sets a
                 * @param view
                 */
                this.setView = function(view){
                    this.currentView = view;
                };
                /**
                 * processes a single key press on the search element
                 * @param key
                 */
                this.key = function(keyCode){
                    //these key events do nothing so immediately return
                    switch(keyCode) {
                        case $.keyCode.LEFT:
                        case $.keyCode.RIGHT:
                        case $.keyCode.HOME:
                        case $.keyCode.END:
                        case $.keyCode.PAGE_UP:
                        case $.keyCode.PAGE_DOWN:
                        case $.keyCode.TAB:
                            return false;
                    }

                    var popup = this.getPopup();
                    if(keyCode == $.keyCode.ENTER){
                        var listElement = this.getListElement();
                        var selectedElement = listElement ? $(listElement).view(list.ListView).getSelectedElement() : null;
                        if (selectedElement != null && popup.getState() == 'visible') {
                            var $link = $(selectedElement).find("a:first");
                            var href = $link.attr('href');
                            if(href == "#"){
                                $link.click();
                            } else {
                                window.location = href;
                            }
                        } else {
                            this.navigateToSearchPage();
                        }
                        return false;
                    }
                    var currentView = this.getCurrentView();
                    if(popup.getState() == 'visible'){
                        var activeList = $(this.getListElement()).view(list.ListView);//this is attempting to bind when the list does not exist and could be a problem

                        //handle moving around and selecting the result
                        switch(keyCode) {
                            case $.keyCode.UP:
                                activeList.incriment(-1);
                                return false;
                            case $.keyCode.DOWN:
                                activeList.incriment(1);
                                return false;
                            case $.keyCode.ESCAPE:
                                popup.hide();
                                return false;
                        }

                        var $clearButton = $("[data-type='clear'][data-field='"+ this.$element.get(0).id + "']");
                        if(this.getSearchTerm().length){
                            $clearButton.addClass("j-active");
                        } else {
                            $clearButton.removeClass("j-active");
                        }
                    }

                };

                protect.change = function(){
                    //if not currently a search view, switch to view all
                    var currentView = this.getCurrentView();
                    if(currentView != "all" && currentView != "filtered"){
                        if (this.forceFiltered) {
                            this.setView("filtered");
                        }
                        else {
                            this.setView("all");
                        }
                        this.renderView();
                    }

                    this.loadViewContent();

                };

                protect.clear = function(){
                    var currentView = this.getCurrentView();
                    if(currentView == "all" || currentView == "filtered"){
                        this.setView(null);
                        this.renderView();
                    }

                    this.loadViewContent();

                };

                /**
                 * sends the browser to the dedicated search page.
                 */
                this.navigateToSearchPage = function() {
                    var query = {};

                    if(this.getSearchTerm().length > 0){
                        query["q"]=this.getSearchTerm();
                    }
                    if(this.getCurrentView() == 'filtered'){
                        query[this.filterType] =  this.filter;
                    }

                    window.location = _jive_base_url + "/search.jspa" + "?" + $.param(query);
                };
            }
        );
        AutoSearchView.toString = function(){return "[wrapper AutoSearchView]";};
        AutoSearchView.getBindName = function(){return "AutoSearchView";};

        var AutoSearchPopupView = PopupView.extend(
            function(protect){
                protect.init = function(element){
                    this.$element = $(element);
                    var popup = this;
                    //on binding this as a view we add the events just need to make sure this is not bound more than once
                    //might be able to handle duplication by scoping and using off before on

                    ///this event handles switching between views
                    this.$element.on("click","[data-component='popup'] [data-component='button'][data-view]",
                       function(event){
                           event.preventDefault();
                           var $button = $(this);
                           if(!$button.hasClass("j-active")){
                               var search = $(popup.getTrigger()).view(AutoSearchView);
                               search.setView($button.data("view"));//switch view
                               search.renderView();//render view
                               search.loadViewContent();// load data
                           }
                       }
                    );

                    //this handles clicking the more expansion button
                    this.$element.on("click", "[data-component='button'][data-command='more']",
                        function(event){
                            event.preventDefault();
                            var $button = $(this);
                            $button.closest("ol").find("li.j-inactive").removeClass("j-inactive");
                            $button.closest("li").addClass("j-inactive");
                        }
                    );

                    //this handels the bookmark removal
                    this.$element.on("click", "[data-component='button'][data-command='remove']",
                        function(event){
                            event.preventDefault();
                            var $button = $(this);
                            var $trigger = $($button.closest("[data-component='popup']").view(AutoSearchPopupView).getTrigger());
                            var $listItem = $button.closest("[data-component='listitem']");
                            var search = $trigger.view(AutoSearchView);
                            var id = $button.data("id");
                            //might want to move the delete bookmark to the popup to keep there from needing to be this reference
                            search.deleteBookmark(id).addCallback(
                                function(){
                                    $listItem.fadeOut('fast', function() {
                                        $listItem.remove();
                                    });
                                }
                            );
                        }
                    );

                    //This is for tracking search metrics
                    this.$element.on("click", "[data-component='popup'] ol [data-component='listitem'] a",
                        function(event){
                            var $item = $(this);
                            var $trigger = $($item.closest("[data-component='popup']").view(AutoSearchPopupView).getTrigger());
                            $trigger.view(AutoSearchView).activateItem(this);
                        }
                    );

                    this.$element.on("click",
                        function(event){
                            var search = popup.getTrigger();
                            var scroll = $(window).scrollTop();
                            $(search).focus();
                            $(window).scrollTop(scroll);
                        }
                    );

                };
            }
        );
        AutoSearchPopupView.toString = function(){return "[wrapper AutoSearchPopupView]";};
        AutoSearchPopupView.getBindName = PopupView.getBindName.bind(AutoSearchPopupView);

        autosearch.init();

        return AutoSearchView;
    }
);