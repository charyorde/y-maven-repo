/*jslint browser:true */
/*extern jive $j */
/*extern quickcontainersummary JiveContainerAutoComplete */

/**
 * View of selected places.
 * @depends path=/resources/scripts/places-autocomplete.js
 * @depends path=/resources/scripts/lib/event.js
 */
jive.gui.SpaceBrowserGui = function(control, widgetID, i18nMap, widgetType, view, showDetail, rootSpaceID, spacesCache){
    // i18nMap is keyed by the Places.Type java enum string

    var that = this;

    var $slider = $j('#jive-space-slider_' + widgetID);
    var $spacesContainer = $slider.find('.jive-spaces-container');
    var $visibleList;

    // REST endpoint
    var SEARCH_ENDPOINT = jive.rest.url("/places/search/");

    spacesCache.addListener(that);

    // Animated slide to given spaces list.
    function slideTo($element) {
        var base_duration = 25.25;
        var multiplier = 0.50;
        // Larger panels get longer animation times.
        var animation_duration = base_duration + ($element.width() * multiplier);
        $slider.scrollTo($element, animation_duration);
        $visibleList = $element;
    }

    function slideReset() {
        $slider.scrollTo(0);
        $visibleList = null;
    }

    // activate the appropriate accordian bar
    $j('.space-browser-spaces-tree div.jive-accordion-content').show();

    if ( view == 'small' ) {
        $j('.space-browser-spaces-search h4').addClass('jive-accordion-toggle-active');
        $j('.space-browser-spaces-search').show();
    }
    // initialize the accordion and its listeners.
    $j('#jive-accordion-container_' + widgetID).each(function() {
        $j(this).find('.jive-accordion h4').click(function() {
            /* if clicking on an exposed panel header */
            if ( $j(this).hasClass('jive-accordion-toggle-active') ) {
                /* if clicking on an open accordion header, do nothing  */
                /* unless it's spaces, then reset view to first panel  */
                if ( $j(this).parents('.jive-icon-spaces-spaces') ) {
                    slideReset();
                }
            }
        });

        // set listeners for scroll events
        $j(this).find('.jive-accordion-content').find('.space-browser-scrollable_' + widgetID).scroll(function() {
            that.scroller($j(this));
        });
    });

    // clearsearch
    var clearSearch = function() {
        $j("#container-search-input_" + widgetID).val('');
        $j('#space-browser-search-results_' + widgetID).hide();
        $slider.show();

        if ( view == 'large' ) {
            $j('#content-block-title').html( i18nMap.get('global.communities') );
            $j('#content-block-search-clear').prop('disabled', true);
        }
        return false;
    };

    // search handling
    var doSubmit = function() {
        var searchBoxValue = $j("#container-search-input_" + widgetID).val();
        if ( searchBoxValue.length > 1 ) {
            $slider.hide();
            $j("#jive-search-loading_" + widgetID).show();
            $j('#space-browser-search-results_' + widgetID).hide();

            var searchParams = {"allowedContainerIds":$j('#allowedContainerIds').val(),
                "resultFilterBeanName":$j('#resultFilterBeanName').val(),
                "rootContainerID":$j('#rootContainerID').val(),
                "rootContainerType":$j('#rootContainerType').val(),
                "showDescription":$j('#showDescription').val()
            };            

            $j.getJSON(SEARCH_ENDPOINT + searchBoxValue, searchParams, function(data) {
                var containerAutoComplete = new JiveContainerAutoComplete(searchBoxValue, $j('#resultFilterBeanName').val(),
                        $j('#allowedContainerIds').val(), $j('#rootContainerID').val(),  $j('#rootContainerType').val(),
                        "#places_search_" + widgetID, '', 'false', i18nMap.get('widget.places.noresults.text'));

                containerAutoComplete.clearPlaces();
                containerAutoComplete.loadExternalPlaces(data);
                $j("#jive-search-loading_" + widgetID).hide();
                $j('#space-browser-search-results_' + widgetID).show();

                if ( view == 'large' ) {
                    $j('#content-block-title').html( i18nMap.get('global.search.results') );
                    $j('#content-block-search-clear').prop('disabled', false);
                }
            });
        }

        if ( searchBoxValue.length < 1 ) {
             clearSearch();
        }
    };

    $j("#container-search-input_" + widgetID).delayedObserver(doSubmit, 0.5);

    // submit when enter is pressed, but block the form submit by preventing the
    // event from propogating
    $j("#container-search-input_" + widgetID).keypress(function(event) {
        var key = event.which || event.keyCode;
        if (key === jive.Event.KEY_RETURN) {
            doSubmit();
            event.preventDefault();
        }
    });

    // clear search
    $j('#clearsearch_' + widgetID).click( clearSearch );
    if ( view == 'large' ) {
        $j('#content-block-search-clear').click( clearSearch );
    }

    // Lock size of spaces lists to width of scrollable container.
    $slider.width($slider.parent().width());  // Set $slider to a specific width to make IE6 happy.
    $spacesContainer.children().width($slider.width());
    $j(window).bind('resize', function() {
        // IE sometimes calls the resize handler prior to $slider having a parent in the dom, just ignore if there is no
        // parent
        if($slider.parent().length > 0){
            $slider.width($slider.parent().width());  // Set $slider to a specific width to make IE6 happy.
            $spacesContainer.children().width($slider.width());
            if ($visibleList) { $slider.scrollTo($visibleList); }
        }
    });

    // callback functions from the model
    this.loadPlaces = function(type){
        if ( "COMMUNITY" != type.name ) {
            return;
        }

        //done, load up the dom
        that.populateContainers(type);
    };

    this.beginLoadingPlaces = function(){
        // spinner, to be implemented
    };

    this.doneLoadingPlaces = function(placesArgs, currentPosition){
        // type, currentPosition, placeID, parentID, slide
        // update DOM with "more" content

        // get the div for this community, write the li's add onClick event, slideForward
        // for links to child spaces.
        var theList = spacesCache.getPlaces(placesArgs.type);
        var sliced = theList.slice(currentPosition, theList.length);
        var $list;

        if (placesArgs.communityID <= 1 || placesArgs.communityID == rootSpaceID ) {
            $list = $j("#COMMUNITY_list_" + widgetID);
            that.populateSpaces(sliced, $list);
        }
        else {
            $list = $j("#places-spaces-list_" + widgetID + "_" + placesArgs.communityID);
            that.populateSpaces(sliced, $list);
        }

        // slide to the child panel
        if (placesArgs.slide && placesArgs.widgetID == widgetID) {
            slideTo($list.closest('div'));
        }
    };

    this.loadingPlacesFailed = function(){
        // error message
    };

    // loads community browse sections
    this.populateContainers = function populateContainers(type) {
        // add root, sublist logic and event handlers
        var entries = spacesCache.getPlaces(type);
        if (!entries || entries.length === 0) {
            // empty i18n message
            $j('#COMMUNITY_list_' + widgetID).append('<li><p class="empty">' + i18nMap.get(type.name) + '</p></li>');
        }
        else {
            that.populateSpaces(spacesCache.getPlaces(type), $j('#COMMUNITY_list_' + widgetID));
        }
    };

    // Expands width of the container that holds all of the spaces lists if
    // necessary.  Each list is displayed in a 'float:left' div, so the
    // container must be larger than the combined widths of all lists to
    // display them side-by-side horizontally.
    function expandScrollableArea() {
        var available   = $spacesContainer.width(),
            columnWidth = $slider.width(),
            required = ($spacesContainer.children().length + 1) * columnWidth;

        if (required >= available) {
            $spacesContainer.width(required * 2);
        }
    }

    function appendSubList($after, place) {
        // Remove any existing spaces lists that are hidden to the right of the
        // current column.
        $after.nextAll().remove();

        // If necessary, expand size of the scrollable area to hold the new
        // SubList.
        expandScrollableArea();

        // create the sublist div of child communities for this community
        var $subListDiv = $j("<div class='jive-slider-sub' id='slider-sub_" + widgetID + "_" + place.ID + "'></div>");
        $subListDiv.width($slider.width());
        $spacesContainer.append($subListDiv);

        var $backSpan;

        $backSpan = $j("<span class='jive-space-current'><strong>" + place.name + "</strong></span>");

        var $backLink = $j("<a href='#' class='jive-slider-link jive-slider-link-back'><span class='jive-icon-med jive-icon-arrow-left'></span>" + i18nMap.get("community.list.spaces.navigate.back") + "</a>");
        $backLink.attr("title", i18nMap.get("community.list.spaces.navigate.back"));

        $backLink.click(function() {
            slideTo($subListDiv.prev());
            return false;
        });


        $backSpan.append($backLink);
        $subListDiv.append($backSpan);


        var $childList = $j("<ul id='places-spaces-list_" + widgetID + "_" + place.ID + "' class='j-place-list clearfix'></ul>");
        $subListDiv.append($childList);

        // add the scroll event listener for the new list
        $childList.scroll(function() {
            that.scroller($j(this));
        });

        // load up the child communities from the model, the results will be populated into the child UL
        spacesCache.morePlaces({'type':place.type, 'page': 0, 'communityID':place.ID, 'parentID':place.parentID, 'slide':true, 'widgetID':widgetID});
    }

    // loads a list of spaces/communities.
    this.populateSpaces = function populateSpaces(theList, $list) {
        var i, place, $listItem, $moreLabel, $moreLink;

        for (i = 0; i < theList.length; i++) {
            place = theList[i];
            // don't think we need this check, just in case.
            if ($list.find('#place-space-list-entry_' + widgetID + '_'+ place.ID).length > 0) {
                return false;
            }

            $listItem = $j("<li id='place-space-list-entry_" + widgetID + "_" + place.ID + "' class='place-space-list-entry clearfix'></li>");
            $listItem.append(that.createObjectLink(place));

            // Create the more link to child communities
            if (place.parent == "true" || place.parent === true ) {


                $moreLabel = i18nMap.get("communities.view.subspaces");

                var viewSubspacesText = i18nMap.get('your.places.subspaces.message');
                var $moreLink = $j("<a href='#' class='jive-slider-link' id='jive-slider-link_" + place.id +
                               "' title='" + viewSubspacesText + " " + place.name +  "'>" + $moreLabel + "<span class='jive-icon-med jive-icon-arrow-right'></span></a>");

                $moreLink.bind("click", place, function(e) {

                    var place = e.data;
                    var $targetSub = $slider.find("#slider-sub_" + widgetID + "_" + place.ID);

                    // check to see if we've already populated the sublist div
                    if ($targetSub.length > 0) {
                        slideTo($targetSub);
                        return false;
                    }
                    else {
                        appendSubList($list.parent(), place);
                        return false;
                    }
                });
                $listItem.append($moreLink);
            }
            $list.append($listItem);
            if ( view == 'large' ) {
                $list.removeClass('j-striped');
                $list.find('li:even').addClass('j-striped');
            }
        }
    };

    // generic function for adding list entries for everything except Communities
    this.addListEntries = function addListEntries(theList, $list) {
        for (var i = 0; i < theList.length; i++) {
            var place = theList[i];
            var $listItem = $j("<li></li>");
            $listItem.append(that.createObjectLink(place));
            $list.append($listItem);
        }
    };

    this.createObjectLink = function createObjectLink(place) {
        var $objectLink;
        if ( place.disabledPlace == "true" ) {
             $objectLink = $j("<span/>");
        } else if (place.viewableByUser) {
            var $linkClass = showDetail == "true" ? "jivecontainerTT-hover-container" : "";
            var $underline = view == 'large' ? " no-underline" : "";
            if ( place.onClickJs && place.onClickJs.length > 0 ) {
                $objectLink = $j("<a href='#' class='" + $linkClass + $underline + "' onclick='" + place.onClickJs + "'); return false;'></a>");
            } else {
                $objectLink = $j("<a href='" + place.objectURL + "' class='" + $linkClass + $underline + "'></a>");
            }
        } else {
            $objectLink = $j("<span class='jive-places-unauthorized'/>");
            $objectLink.attr("title", i18nMap.get("community.list.spaces.unauthorized.tooltip"));
        }

        // escape the place name by calling text
        var $nameSpan = $j("<span class='jive-places-name'/>");
        $nameSpan.text(place.name);

        var $iconSpan = $j("<span class='jive-icon-med " + place.iconCssClass + "'></span>");
        $objectLink.append($iconSpan);
        $objectLink.append($nameSpan);

        if ( showDetail == "true" && place.viewableByUser) {
            $objectLink.bind("mouseover", function() {
                quickcontainersummary.getContainerTooltip(place.ID, place.objectType);
            });

            $objectLink.mouseout(function() {
                quickcontainersummary.cancelTooltip();
            });
        }
        if ( view == 'large' && place.description != null) {
            var $descSpan = $j("<span/>", { "class": "font-color-meta-light" }).text(place.description);
            return $j.merge($objectLink, $descSpan);
        } else {
            return $objectLink;
        }
    };

    // refer to http://yelotofu.com/2008/10/jquery-how-to-tell-if-youre-scroll-to-bottom
    // apparently scrollHeight isn't WC3 compliant, so an alternate but trickier solution is posted.
    this.scroller = function scroller($list) {

        if ($list[0].scrollHeight - $list.scrollTop() == $list.outerHeight()){

            // grab the current number of list elements
            var count = $list.find('li').length;
            if (count % 30 === 0) {
                // fetch the appropriate content
                var listID = $list.attr('id');
                var type = listID.split("_")[0];

                // grab the place ID for community lists
                var placeID = rootSpaceID;
                if ($list.parent().attr('id').match(/^slider-sub_/)) {
                    placeID =  $list.parent().attr('id').split("_")[2];
                    type = "COMMUNITY";
                }
                var page = count / 30;
                spacesCache.morePlaces({'type':{'name':type}, 'page':page, 'communityID':placeID, 'parentID': rootSpaceID });
            }
        }
    };

    this.resetPlaces = function resetPlaces(type) {
        // noop
    };

};


define('jive.gui.SpaceBrowserGui', function() {
    return jive.gui.SpaceBrowserGui;
});
