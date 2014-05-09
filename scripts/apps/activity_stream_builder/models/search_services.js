/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ActivityStream');

/**
 * @depends path=/resources/scripts/apps/browse/user/model/user_source.js
 * @depends path=/resources/scripts/apps/browse/container/model/container_source.js
 * @depends path=/resources/scripts/apps/browse/activity/model/activity_source.js
 *
 */
jive.ActivityStream.SearchServices = jive.RestService.extend(function(protect, _super) {
    protect.resourceType = "stream-config";
    protect.pluralizedResourceType = protect.resourceType;

    this.init = function () {
        _super.init.call(this);
        var searchServices = this;
        searchServices.userSource = new jive.Browse.User.ItemSource();
        searchServices.placeSource = new jive.Browse.Container.ItemSource();
        searchServices.activitySource = new jive.Activity.ItemSource();
    };

    this.getBreadcrumbBean = function(objectType, objectID, promise) {
        var searchServices = this;
        searchServices.placeSource.getBreadcrumbBean({containerType: objectType, containerID: objectID}).addCallback(function(data) {
            promise.emitSuccess(data);
        });
    };

    this.search = function(options, promise) {
        var searchServices = this,
            type = options.type,
            filterID = options.subfilters,
            startIndex = options.start,
            maxResults = options.maxResults + 1,
            searchParams = {},
            searchesSuccessful = 0,
            comboResultData = {};
        if (type == 'people-places') {
            //combo search
            searchParams = {
                query: options.value,
                filterID: filterID.people,
                filterGroupID: 'asbPeople',
                start: startIndex,
                numResults: maxResults,
                propertyNames: ['avatarID', 'profileImage', 'profile', 'connections']
            };
            searchServices.userSource.findAll(searchParams).addCallback(function(data) {
                searchesSuccessful++;
                comboResultData.people = data.items;
                if (searchesSuccessful == 2) {
                    promise.emitSuccess(comboResultData, options);
                }
            });
            var queryTerm = (options.value ? options.value + '*' : options.value);
            var placeSearchParams = {
                query: queryTerm,
                filterID: filterID.places,
                filterGroupID: 'asbPlaces',
                start: startIndex,
                numResults: maxResults
            };
            searchServices.placeSource.findAll(placeSearchParams).addCallback(function(data) {
                searchesSuccessful++;
                comboResultData.places = data.items;
                if (searchesSuccessful == 2) {
                    promise.emitSuccess(comboResultData, options);
                }
            });
        }
        else if (type == 'people') {
            searchParams = {
                query: options.value,
                filterID: filterID,
                filterGroupID: 'asbPeople',
                start: startIndex,
                numResults: maxResults,
                propertyNames: ['avatarID', 'profileImage', 'profile', 'connections']
            };
            searchServices.userSource.findAll(searchParams).addCallback(function(data) {
                promise.emitSuccess({'people':data.items}, options);
            });
        }
        else if (type == 'places') {
            queryTerm = (options.value ? options.value + '*' : options.value);
            searchParams = {
                query: queryTerm,
                filterID: filterID,
                filterGroupID: 'asbPlaces',
                start: startIndex,
                numResults: maxResults
            };
            searchServices.placeSource.findAll(searchParams).addCallback(function(data) {
                promise.emitSuccess({'places':data.items}, options);
            });
        }
        else if (type == 'suggested') {
            var url = searchServices.RESOURCE_ENDPOINT + '/getSearchSuggestions';
            this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url}).addCallback(function(data) {
                promise.emitSuccess(data, options);
            });
        }
    };

    this.getFollowerList = function(params, promise) {
        var searchServices = this;
        searchServices.activitySource.getContentActivityUsers({
            activityType: params.activityType,
            objectType: params.objectType,
            objectID: params.objectID},
            params.start,
            params.count
        ).addCallback(function(data) {
            promise.emitSuccess(data);
        });
    };
});
