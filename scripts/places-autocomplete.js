function JiveContainerAutoComplete( query, resultFilterBeanName, allowedContainerIds, rootContainerID, rootContainerType, target, clickStrategy, showDescription, noResultsText ) {

    var that = this;

    // REST endpoints
    var ALL_PLACE_TYPES_ENDPOINT = jive.rest.url("/places/types/ordered");
    var SEARCH_ENDPOINT = jive.rest.url("/places/search/");

    this.showDetail = "true";

    this.query = query;
    this.resultFilterBeanName = resultFilterBeanName;
    this.allowedContainerIds  = allowedContainerIds;
    this.rootContainerID = rootContainerID;
    this.rootContainerType = rootContainerType;
    this.target = target;
    this.clickStrategy = clickStrategy;
    this.showDescription = showDescription;
    this.noResultsText = noResultsText;

    var types;

    // initialize listeners
    // set listeners for scroll events
    $j('.search-results-scrollable').scroll(function() {
        that.doScroll($j(this));
    });

    // generic function for adding list entries for everything except Communities
    this.addListEntries = function addListEntries(theList, $list) {

        for (var i = 0; i < theList.length; i++) {
            var place = theList[i];
            var $listItem = $j("<li class='clearfix' id='" + place.objectType + "_" + place.ID + "'></li>");
            $listItem.append(this.createObjectLink(place));

            $list.append($listItem);
            $list.removeClass('j-striped');
            $list.find('li:even').addClass('j-striped');
        }
    };

    this.createObjectLink = function createObjectLink(place) {
        var $objectLink;
        if ( place.disabledPlace == "true" ) {
             $objectLink = $j("<span></span>");
        } else {
            var $linkClass = this.showDetail == "true" ? "jivecontainerTT-hover-container" : "";
            if ( place.onClickJs && place.onClickJs.length > 0 ) {
                $objectLink = $j("<a href='#' class='" + $linkClass + " no-underline' onclick='" + place.onClickJs + "'); return false;'></a>");
            } else {
                $objectLink = $j("<a href='" + place.objectURL + "' class='" + $linkClass + " no-underline'></a>");
            }
        }

        // escape the place name by calling text
        var $nameSpan = $j("<span class='jive-places-name'></span>");
        $nameSpan.text(place.name);

        var $iconSpan = $j("<span class='jive-icon-med " + place.iconCssClass + "'></span>");
        $objectLink.append($iconSpan);
        $objectLink.append($nameSpan);

        if ( this.showDetail == "true" ) {
            $objectLink.bind("mouseover", function() {
                quickcontainersummary.getContainerTooltip(place.ID, place.objectType);
            });

            $objectLink.mouseout(function() {
                quickcontainersummary.cancelTooltip();
            });
        }

        if ( this.showDescription == 'true' ) {
            var $descSpan = $j("<span class='font-color-meta-light'>" + place.description + "</span>");

            return $j.merge($objectLink, $descSpan);
        } else {
            return $objectLink;
        }
    };

    this.clearPlaces = function() {
        $j(this.target).empty();
    };

    this.loadPlaces = function( places, target ) {
        this.addListEntries( places, $j(target) );
    };

    this.doLoadExternalPlaces = function(all) {
        var entries = all.placesCollection;

        if (!entries || entries.length == 0) {
            $j(this.target).append("<li>" + this.noResultsText + "</li>");
        }

        for (var i = 0; i < entries.length; i++) {

            var list = entries[i].places;
            that.loadPlaces(list, this.target);
        }

    };

    this.loadExternalPlaces = function( all ) {

        if(!types) { //populate the cache if necessary

            $j.getJSON(ALL_PLACE_TYPES_ENDPOINT, function(data) {
                types = data.placetype;
            });
        }
        that.doLoadExternalPlaces(all);
    };

    this.doScroll = function($list) {
        if ($list[0].scrollHeight - $list.scrollTop() == $list.outerHeight())
        {
            // grab the current number of list elements
            var count = $list.find('li').length;
            if (count % 30 == 0) {
                // fetch the appropriate content

                var params = {};
                if(this.resultFilterBeanName) params['resultFilterBeanName'] = this.resultFilterBeanName;
                if(this.allowedContainerIds) params['allowedContainerIds'] = this.allowedContainerIds;
                if(this.rootContainerID) params['rootContainerID'] = this.rootContainerID;
                if(this.rootContainerType) params['rootContainerType'] = this.rootContainerType;
                if(count) params['startPos'] = count;
                if(this.maxReturned) params['maxReturned'] = this.maxReturned;
                if(this.clickStrategy) params['clickStrategy'] = this.clickStrategy;               

                $j.getJSON(SEARCH_ENDPOINT + query, params, function(data) {
                    $j.each(data.placesCollection, function(idx, value) {
                        that.loadPlaces(value.places, that.target );
                    });
                });
            }
        }
    };
}
