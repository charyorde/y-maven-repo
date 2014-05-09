jive.model.PlacesCache = function(control) {

    var that = this;

    // REST endpoints
    var ALL_PLACE_TYPES_ENDPOINT = jive.rest.url("/places/types/ordered");
    var FOLLOWED_PLACE_TYPES_ENDPOINT = jive.rest.url("/places/types/followed");
    var FOLLOWED_PLACES_ENDPOINT = jive.rest.url("/places/followed");
    var PLACES_ENDPOINT = jive.rest.url("/places/");

    // All configured place types
    var types;

    // cache of all places: FollowedPlaces, Communities, Groups, Projects
    var cache;

    this.initCacheData = function(placeTypes) {
        cache = new jive.ext.y.HashTable();
        for (var i = 0; i < placeTypes.length; i++) {
            cache.put(placeTypes[i].name, new Array());
        }
    };

    this.loadPlacesCache = function(list, type) {
        // currentPosition is based on the type argument
        var currentPosition = cache.get(type.name).length;
        for (var i = 0; i < list.length; i++) {
            var place = list[i];
            // use the place.type.name for obtaining the cache, since followed types
            // are combined in one list when loaded.
            var placesCache = cache.get(place.type.name);
            placesCache.push(place);
            cache.put(place.type.name, placesCache);
        }
        return currentPosition;
    };

    this.doLoadExternalPlaces = function(all) {
        try
        {
            var entries = all.placesCollection;

            for (var i = 0; i < entries.length; i++) {
                var entryType = entries[i].placeType;
                var list = entries[i].places;
                if (list && list.length) {
                    that.loadPlaces(list, entryType);
                }
                that.notifyLoadPlaces(entryType);
            }
        }
        catch(e) {
            that.notifyLoadFail();
        }
        return null;
    };

    this.getPlaces = function(type) {
        return cache.get(type.name);
    };

    var initialized = false;
    this.isInitialized = function() {
        return initialized;
    };

    // loop over list of place objects, place in the appropriate cache.
    this.loadPlaces = function(list, type) {
        return that.loadPlacesCache(list, type); //currentPosition
    };

    // fetches more places for the specified type
    this.morePlaces = function(placesArgs) {
        that.notifyLoadBegin();

        if (placesArgs.type.name.startsWith("FOLLOWED")) {

            $j.getJSON(FOLLOWED_PLACES_ENDPOINT, {'page': placesArgs.page}, function(data) {
                var currentPosition = that.loadPlaces(data.place, placesArgs.type);
                if (placesArgs.refreshAllFollowedTypes) {

                    $j.getJSON(FOLLOWED_PLACE_TYPES_ENDPOINT, function(data) {
                        for (var i = 0; i < data.placetype.length; i++) {
                            that.notifyLoadFinish({'type':data.placetype[i], 'startIndex': 0});
                        }
                    });
                }
                else
                {
                    that.notifyLoadFinish(placesArgs, currentPosition);
                }
            });
        }
        else if ("COMMUNITY" == placesArgs.type.name) {

            $j.getJSON(PLACES_ENDPOINT
                    + 'COMMUNITY', {'communityID': placesArgs.communityID, 'page': placesArgs.page}, function(data) {
                var currentPosition = that.loadPlaces(data.place, placesArgs.type);
                that.notifyLoadFinish(placesArgs, currentPosition);
            });
        }
        else
        { //custom container types
            $j.getJSON(PLACES_ENDPOINT + placesArgs.type.name, {'page':placesArgs.page}, function(data) {
                var currentPosition = that.loadPlaces(data.place, placesArgs.type);
                that.notifyLoadFinish(placesArgs, currentPosition);
            });
        }

    };

    this.loadExternalPlaces = function(placesArgs) {
        initialized = true;
        if (!types) {
            $j.getJSON(ALL_PLACE_TYPES_ENDPOINT, function(data) {
                types = data.placetype;
                that.initCacheData(types);
                return loadHelper();
            });
        }
        else {
            return loadHelper();
        }

        function loadHelper() {
            if (placesArgs) {
                // load up spaces for a specific type, primarily used by the Space Browser
                $j.getJSON(PLACES_ENDPOINT + placesArgs.type.name, placesArgs, function(data) {
                    that.loadPlaces(data.place, placesArgs.type);
                    return that.notifyLoadPlaces(placesArgs.type);
                });
            }
            else {
                // load up all places for all place types, primarily used by the Places Widget
                $j.getJSON(PLACES_ENDPOINT, function(data) {
                    return that.doLoadExternalPlaces(data);
                });
            }
        }
    };

    this.doReloadPlaces = function() {

        $j.getJSON(FOLLOWED_PLACE_TYPES_ENDPOINT, function(data) {
            that.notifyResetPlaces({"name":"FOLLOWED_ALL"});

            for (var i = 0; i < data.placetype.length; i++) {
                cache.put(data.placetype[i].name, new Array());
            }
            that.morePlaces({'type':{'name':"FOLLOWED_ALL"}, 'page':-1, 'refreshAllFollowedTypes':true});
        });

    };

    this.reloadPlaces = function(type) {

        // currently only implemented for Followed places, since communities, groups, and projects
        // don't need to dynamically refresh.
        if (type.name.startsWith("FOLLOWED")) {
            that.doReloadPlaces();
        }
    };

    /******************************************
     * listener functions
     ******************************************/
    this.addListener = function(list) {
        listeners.push(list);
    };

    var listeners = new Array();
    var working = 0;
    var listener_actions = new Array();
    /**
     * act must be a thunk (a function without arguments)
     * it will be executed after either
     * notifyLoadFinish or notifyLoadFail
     */
    this.addListenerAction = function(act) {
        listener_actions.push(act);
    };

    /**
     * private
     * executes all the listener actions
     */
    this.executeListenerActions = function() {
        while (listener_actions.length > 0) {
            listener_actions[0]();
            listener_actions.splice(0, 1);
        }
    };

    this.removeListener = function(list) {
        if (working == 0) {
            for (var i = 0; i < listeners.length; i++) {
                if (listeners[i] == list) {
                    listeners.splice(i, 1);
                }
            }
        }
        else
        {
            that.addListenerAction(function(list) {
                return function() {
                    that.removeListener(list);
                };
            }(list));
        }
    };

    /**
     * notification functions
     */
    this.notifyLoadPlaces = function(type) {
        working++;
        for (var i = 0; i < listeners.length; i++) {
            listeners[i].loadPlaces(type);
        }
        working--;
        that.executeListenerActions();
    };

    this.notifyLoadBegin = function() {
        working++;
        for (var i = 0; i < listeners.length; i++) {
            listeners[i].beginLoadingPlaces();
        }
        working--;
        that.executeListenerActions();
    };

    this.notifyLoadFinish = function(placesArgs, currentPosition) {
        working++;
        for (var i = 0; i < listeners.length; i++) {
            listeners[i].doneLoadingPlaces(placesArgs, currentPosition);
        }
        working--;
        that.executeListenerActions();
    };

    this.notifyLoadFail = function() {
        working++;
        for (var i = 0; i < listeners.length; i++) {
            listeners[i].loadingPlacesFailed();
        }
        working--;
        that.executeListenerActions();
    };

    this.notifyResetPlaces = function(type) {
        working++;
        for (var i = 0; i < listeners.length; i++) {
            listeners[i].resetPlaces(type);
        }
        working--;
        that.executeListenerActions();
    };

};

define('jive.model.PlacesCache', function() {
    return jive.model.PlacesCache;
});
