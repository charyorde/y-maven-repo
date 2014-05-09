/**
 * View of selected places.
 */
jive.gui.PlacesGui = function(control, widgetID, i18nMap, widgetType, preferredView, preferredFilter, placesCache){

	var that = this;

    // REST endpoints
    var PREFERRED_VIEW_ENDPOINT = jive.rest.url("/places/view");
    var PREFERRED_FILTER_ENDPOINT = jive.rest.url("/places/filter");
    var SEARCH_ENDPOINT = jive.rest.url("/places/search/");

    // register this view with the model for callbacks
    placesCache.addListener(that);

    var activeTab = "spaces";
    // activate the appropriate accordian bar
    if ("HOMEPAGE" == widgetType ) {
        activeTab = "spaces;"
    } else if (preferredView) {
        activeTab = preferredView;
        if ('search' == preferredView) {
            setTimeout(function() {
                $j('.jive-widget-places-search input:text:visible:enabled:first').focus();
            }, 500);
        }
    } else {
        activeTab = "yours";
    }

    var observedActive = false;
    var availableTabs = $j("#jive-accordion-container_" + widgetID + " [id^='jive-accordion-toggle-']").map(function() {
        var val = this.id.substring('jive-accordion-toggle-'.length)
        if (val == activeTab) {
            observedActive = true;
        }
        return val;
    });

    console.log(activeTab, observedActive, availableTabs);
    if (!observedActive) {
        // Resort to using the first toggle if our default to activate is not present
        activeTab = availableTabs[0];
    }
    console.log(activeTab);

    // initialize the accordion and its listeners.

    $j("#jive-accordion-container_"+widgetID).accordion({active: "#jive-accordion-toggle-"+activeTab, 
                                                        change: function(e, ui) {
                                                              if (ui.newHeader.attr("id")=="jive-accordion-toggle-search") {
                                                                  $j("#jive-accordion-toggle-search").next().find("input:text:visible:enabled:first").focus();
                                                              }
                                                         }});

    $j('#jive-accordion-container_' + widgetID).each(function() {

        $j(this).find('.jive-accordion-places-filter').find('.jive-places-filter-entry').each(function() {
            var tokens = $j(this).attr('id').split("_");
            var type = tokens[0] + "_" + tokens[1];
            $j(this).click(function() {
                that.filterPlaces($j(this), type);
                $j.post(PREFERRED_FILTER_ENDPOINT, {'id': type});
                return false;
            });

        });
        // set listeners for scroll events
        $j(this).find('.jive-accordion-content').find('.jive-scrollable').scroll(function() {
            that.scroller($j(this));
        });
    });

    // clearsearch
    var clearSearch = function() {

        $j("#container-search-input_" + widgetID).val('');
        $j("#jive-places-search-results_" + widgetID).hide();
        return false;
    };

    // search handling
    var doSubmit = function() {
        var searchBoxValue = $j('#container-search-input_' + widgetID).val();
        if (searchBoxValue.length > 1) {
            $j("#jive-search-loading_" + widgetID).show();
            $j("#jive-places-search-results_" + widgetID).hide();

            var searchParams = {'showDescription': false};

            $j.getJSON(SEARCH_ENDPOINT + searchBoxValue, searchParams, function(data) {
                var containerAutoComplete = new JiveContainerAutoComplete(searchBoxValue,
                        '', '', '', '', "#places_search_" + widgetID, '', 'false', i18nMap.get('widget.places.noresults.text'));

                containerAutoComplete.clearPlaces();
                containerAutoComplete.loadExternalPlaces(data);
                $j("#jive-search-loading_" + widgetID).hide();
                $j("#jive-places-search-results_" + widgetID).show();
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
        switch (key) {
            case jive.Event.KEY_RETURN:
                doSubmit();
                event.preventDefault();
                break;
        }
    });

    // callback functions from the model
    this.loadPlaces = function(type){
        //done, load up the dom
        if (type.name.match(/^FOLLOWED/)) {
            that.populatePlaces();
        }
        else {
            that.populateContainers(type);
        }
    };

    this.beginLoadingPlaces = function(){
        // spinner, to be implemented
    };

    this.doneLoadingPlaces = function(placesArgs, currentPosition){
        // type, currentPosition, placeID, parentID, slide
        // update DOM with "more" content

        if (placesArgs.type.name == "COMMUNITY") {
            // get the div for this community, write the li's add onClick event, slideForward
            // for links to child spaces.
            var theList = placesCache.getPlaces(placesArgs.type);
            var sliced = theList.slice(currentPosition, theList.length);

            if (placesArgs.communityID <= 1) {
                that.populateSpaces(sliced, $j("#COMMUNITY_list_" + widgetID));
            }
            else {
                that.populateSpaces(sliced, $j("#places-spaces-list_" + widgetID + "_" + placesArgs.communityID));
            }
            
            // slide to the child panel
            if (placesArgs.slide && placesArgs.widgetID == widgetID) {
                var $parentPanel;
                if (placesArgs.parentID <= 1) {
                    $parentPanel = $j("#slider-root_" + widgetID);
                }
                else {
                    $parentPanel = $j("#slider-sub_" + widgetID + "_" + placesArgs.parentID);
                }
                var $childPanel = $j("#slider-sub_" + widgetID + "_" + placesArgs.communityID);

                that.slideForward($j("#place-space-list-entry_" + widgetID + "_" + placesArgs.communityID), $parentPanel, $childPanel);
            }
        }
        else {
            var theList = placesCache.getPlaces(placesArgs.type);
            var sliced = theList.slice(currentPosition, theList.length);
            that.addListEntries(sliced, $j('#' + placesArgs.type.name + '_list_' + widgetID));
        }
    };

    this.loadingPlacesFailed = function(){
        // error message
    };

    // slider functions
    this.slideReset = function slideReset() {
        $j('.jive-slider-sub').hide();
        $j('.jive-slider-sub').css({left:'200px'});
        $j('.jive-slider-root').css({left:'0px'});
        $j('.jive-slider-root').show();
        /* TODO: reset scrollbars to the top for all UL's */
    };

    this.slideReset = function slideReset() {
        $j('.jive-slider-sub').hide();
        $j('.jive-slider-sub').css({left:'200px'});
        $j('.jive-slider-root').css({left:'0px'});
        $j('.jive-slider-root').show();
        /* TODO: reset scrollbars to the top for all UL's */
    };

    function animation_duration($panel) {
        var base_duration = 158.25;
        var multiplier = 0.75;
        // Larger panels get longer animation times.
        return base_duration + ($panel.width() * multiplier);
    };

    this.slideForward = function slideForward($self, $panel1, $panel2) {
        // set up the proper widths and such for the width of the column.
        var columnWidth = $panel1.width(),
            duration = animation_duration($panel1);
        $panel2.css({left: columnWidth});

        // animate out panel1
        $panel1.animate({
            left: (-1 * columnWidth)
        }, duration, function() { $j(this).hide(); });
        // animate in panel2
        $panel2.show().animate({left: '0px'}, duration);

    };

    this.slideBack = function slideBack($self, $panel2, $panel1) {
        var duration = animation_duration($panel2);
        $self.parent().addClass('');
        $panel2.animate({
            left: '225px'}, duration,
            function() {
                $panel2.hide();
            });
        $panel1.show().animate({left: '0px'}, duration);
    };

    this.filterPlaces = function filterPlaces($self, type) {
        $self.parents('.jive-accordion-places-filter').find('li a').removeClass('selected');
        $self.parents('div.jive-accordion-content').find('ul.yourplaces').hide();
        $self.addClass('selected');
        $j('#' + type + '_list_' + widgetID).show();
    };

    // initialize the selcted preferred filter
    if (preferredFilter) {
        $j('#jive-accordion-container_' + widgetID).find('.jive-accordion-places-filter').find('.jive-places-filter-entry').each(function() {
            var tokens = $j(this).attr('id').split("_");
            var type = tokens[0] + "_" + tokens[1];
            if (preferredFilter == type) {
                that.filterPlaces($j(this), type);
            }
        });
    }

    // loads the appropriate your places divs.
    this.populatePlaces = function populatePlaces() {

        // type is in the ID of each UL, parse it out
        $j('#jive-widget-places-yours_' + widgetID).find('.jive-scrollable').each(function() {
            var tokens = $j(this).attr('id').split("_");
            var type = tokens[0] + "_" + tokens[1];
            var entries = placesCache.getPlaces({'name':type});
            if (!entries || entries.length == 0) {
                // empty i18n message
                $j(this).append('<li><p class="empty">' + i18nMap.get(type) + '</p></li>');
            }
            else {
                that.addListEntries(placesCache.getPlaces({'name':type}), $j(this));
            }
        });
    };

    // loads community, group, and project browse sections
    this.populateContainers = function populateContainers(type) {
        if (type.name == 'COMMUNITY') {
            // add root, sublist logic and event handlers
            var entries = placesCache.getPlaces(type);
            if (!entries || entries.length == 0) {
                // empty i18n message
                $j('#COMMUNITY_list_' + widgetID).append('<li><p class="empty">' + i18nMap.get(type.name) + '</p></li>');
            }
            else {
                that.populateSpaces(placesCache.getPlaces(type), $j('#COMMUNITY_list_' + widgetID));
            }
        }
        else {
            var entries = placesCache.getPlaces(type);
            if (!entries || entries.length == 0) {
                $j('#' + type.name + '_list_' + widgetID).append('<li><p class="empty">' + i18nMap.get(type.name) + '</p></li>');
            }
            else {
                that.addListEntries(placesCache.getPlaces(type), $j('#' + type.name + '_list_' + widgetID));
            }
        }
    };

    // loads a list of spaces/communities.
    this.populateSpaces = function populateSpaces(theList, $list) {

        for (var i = 0; i < theList.length; i++) {
            var place = theList[i];
            // don't think we need this check, just in case.
            if ($list.find('#place-space-list-entry_' + widgetID + '_'+ place.ID).length > 0) {
                return false;
            }
            var $listItem = $j("<li id='place-space-list-entry_" + widgetID + "_" + place.ID + "' class='place-space-list-entry clearfix'></li>");
            $listItem.append(that.createObjectLink(place));

            // Create the more link to child communities
            if (place.parent == "true" || place.parent == true) {
                var viewSubspacesText = i18nMap.get("VIEW_SUBSPACES_MESSAGE");
                var $moreLink = $j("<a href='#' class='jive-slider-link' id='jive-slider-link_" + place.id +
                                   "' title='" + viewSubspacesText + " " + place.name +  "'>" + viewSubspacesText + "<span class='jive-icon-med jive-icon-arrow-right'></span></a>");

                $moreLink.bind("click", place, function(e) {

                    var place = e.data;
                    // check to see if we've already populated the sublist div
                    if ($j('#jive-space-slider_' + widgetID).find("#slider-sub_" + widgetID + "_" + place.ID).length > 0) {

                        var $parentPanel;
                        if (place.parentID <= 1) {
                            $parentPanel = $j("#slider-root_" + widgetID);
                        }
                        else {
                            $parentPanel = $j("#slider-sub_" + widgetID + "_" + place.parentID);
                        }
                        var $childPanel = $j("#slider-sub_" + widgetID + "_" + place.ID);
                        that.slideForward($j("#place-space-list-entry_" + widgetID + "_" + place.ID), $parentPanel, $childPanel);
                        return false;
                    }
                    else {
                        // create the sublist div of child communities for this community
                        var $subListDiv = $j("<div class='jive-slider-sub' id='slider-sub_" + widgetID + "_" + place.ID + "' style='display: none'></div>");
                        $j('#jive-space-slider_' + widgetID).append($subListDiv);

                        var $backSpan = $j("<span class='jive-space-current'><strong>" + place.name + "</strong></span>");
                        var $backLink = $j("<a href='#' class='jive-slider-link jive-slider-link-back' title='Back'><span class='jive-icon-med jive-icon-arrow-left'></span>" + i18nMap.get("BACK_TEXT") + "</a>");

                        $backLink.click(function() {
                            var $parentPanel;
                            if (place.parentID <= 1) {
                                $parentPanel = $j("#slider-root_" + widgetID);
                            }
                            else {
                                $parentPanel = $j("#slider-sub_" + widgetID + "_" + place.parentID);
                            }
                            that.slideBack($backLink, $subListDiv, $parentPanel);
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
                        placesCache.morePlaces({'type':place.type, 'page': 0, 'communityID':place.ID, 'parentID':place.parentID, 'slide':true, 'widgetID':widgetID});
                        return false;
                    }
                });
                $listItem.append($moreLink);
            }
            $list.append($listItem);
        }
    };

    // generic function for adding list entries for everything except Communities
    this.addListEntries = function addListEntries(theList, $list) {
        for (var i = 0; i < theList.length; i++) {
            var place = theList[i];
            var $listItem = $j("<li class='clearfix'></li>");
            $listItem.append(that.createObjectLink(place));
            $list.append($listItem);
        }
    };

    this.createObjectLink = function createObjectLink(place) {

        var $objectLink = $j("<a href='" + place.objectURL + "' class='jivecontainerTT-hover-container'" + " data-objectId='" + place.ID + "' data-objectType='" + place.objectType + "'></a>");

        // escape the place name by calling text
        var $nameSpan = $j("<span class='jive-places-name'></span>");
        $nameSpan.text(place.name);

        var $iconSpan = $j("<span class='jive-icon-med " + place.iconCssClass + "'></span>");
        $objectLink.append($iconSpan);
        $objectLink.append($nameSpan);

        if (place.visibleToPartner) {
            var $externallyVisible = $j("<span class='jive-icon-med jive-icon-partner' title='"+i18nMap.get('partner.browse.ext_access')+"'></span>");
            $objectLink.append($externallyVisible);
        }

        return $objectLink;
    };

    // refer to http://yelotofu.com/2008/10/jquery-how-to-tell-if-youre-scroll-to-bottom
    // apparently scrollHeight isn't WC3 compliant, so an alternate but trickier solution is posted.
    this.scroller = function scroller($list) {

        if ($list[0].scrollHeight - $list.scrollTop() == $list.outerHeight()){

            // grab the current number of list elements
            var count = $list.find('li').length;
            if (count % 30 == 0) {
                // fetch the appropriate content
                var listID = $list.attr('id');
                var type;
                if (listID.match(/^FOLLOWED/)) {
                    var tokens = listID.split("_");
                    type = tokens[0] + "_" + tokens[1];
                }
                else {
                    type = listID.split("_")[0];
                }

                // grab the place ID for community lists
                var placeID = -1;
                if ($list.parent().attr('id').match(/^slider-sub_/)) {
                    placeID =  $list.parent().attr('id').split("_")[2];
                    type = "COMMUNITY";
                }
                var page = count / 30;
                placesCache.morePlaces({'type':{'name':type}, 'page':page, 'communityID':placeID, 'parentID': -1});
            }
        }
    };

    this.resetPlaces = function resetPlaces(type) {

        // clear out all the <li>'s in the appropriate list

        if (type.name.match(/^FOLLOWED/)) {
            $j('#jive-widget-places-yours_' + widgetID).find('.jive-scrollable').each(function() {
                $j(this).empty();
            });
        }
    };
};

define('jive.gui.PlacesGui', function() {
    return jive.gui.PlacesGui;
});
