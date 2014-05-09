/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ActivityStream');

/**
 * Activity Stream REST service.
 *
 * @class
 * @extends jive.RestService
 * @param {Object}  options
 *
 * @depends path=/resources/scripts/jive/rest.js
 * @depends path=/resources/scripts/apps/activity_stream/models/fill_in_the_gap_request.js
 * @depends path=/resources/scripts/apps/activity_stream/models/full_replies_request.js
 * @depends template=jive.eae.latestAcclaim.extraContent
 */
jive.ActivityStream.StreamSource = jive.RestService.extend(function(protect) {

    /**
     * Set to "activity-stream"; configures the REST endpoints that instances of this
     * class connect to.
     *
     * @name resourceType
     * @fieldOf jive.ActivityStream.StreamSource#
     * @type string
     * @protected
     */
    protect.resourceType = "activity-stream";

    /**
     * Don't want a pluralizedResourceType, set this to resourceType
     *
     * @name pluralizedResourceType
     * @fieldOf jive.ActivityStream.StreamSource#
     * @type string
     * @protected
     */
    protect.pluralizedResourceType = protect.resourceType;

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    /**
     * Fetches the data necessary to render the entire dynamic pane in the OneHome page, with the stream specified
     *
     * @methodOf jive.ActivityStream.StreamSource#
     * @param {Object} streamID - ID of the stream to fetch the data for
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.initializeView = function(streamType, streamID, promise) {
        var url = this.RESOURCE_ENDPOINT + '/initializeView',
            request = {objectType: 3,
                objectID: window._jive_current_user.ID,
                streamSource: streamType,
                streamID: streamID || 0,
                filterType: ['all'],
                timestamp: 0
            };

        protect.displayGenericErrorMessages = false;
        if (!promise) {
            promise = new jive.conc.Promise();
        }
        return this.commonAjaxRequest(promise, 'POST', {url:url, data: JSON.stringify(request)}).addErrback(function(message, status) {
            if (status == 401 || status == 403 || status == 4026 || status === 0) {
                location.reload();
            }
        }).always(function() {
                protect.displayGenericErrorMessages = true;
            });
    };

    /**
     * Loads a list of activity for a particular user, using userId
     *
     * @methodOf jive.ActivityStream.StreamSource#
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.list = function(resource, promise){
        var url = this.RESOURCE_ENDPOINT + '/list';

        protect.displayGenericErrorMessages = false;
        if (!promise) {
            promise = new jive.conc.Promise();
        }
        return this.commonAjaxRequest(promise, 'POST', {url:url, data: JSON.stringify(resource)}).addErrback(function(message, status) {
            if (status == 401 || status == 403 || status == 4026 || status === 0) {
                location.reload();
            }
        }).always(function() {
                protect.displayGenericErrorMessages = true;
            });
    };

    /**
     * Loads a list of activity for a particular user, using userId
     *
     * @methodOf jive.ActivityStream.StreamSource#
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.getMore = function(resource){
        var url = this.RESOURCE_ENDPOINT + '/list/before';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: JSON.stringify(resource)});
    };

    /**
     * marks an item or item context as excluded (hidden) in the stream
     *
     * @methodOf jive.ActivityStream.StreamSource#
     * @param {jive.ActivityStream.ActivityStreamExclusion}  exclusion data
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.exclude = function(type, resource){
        var url = this.RESOURCE_ENDPOINT + '/exclusions/object/set';
        if (type != 'item') {
            url = this.RESOURCE_ENDPOINT + '/exclusions/context/set';
        }
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: JSON.stringify(resource)},resource);
    };

    /**
     *
     * @param {String} tabId the tab id to persist
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.saveActiveStreamTab = function(tabId) {
        var url = this.RESOURCE_ENDPOINT + '/activetab/save';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', { url: url, data: tabId });
    };

    /**
     *
     * @param {String} streamType the stream type to persist the filter for
     * @param {String} filter the filter to persist
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.saveActiveStreamFilter = function(streamType, filter) {
        var url = this.RESOURCE_ENDPOINT + '/activefilter/save/' + streamType;

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', { url: url, data: filter });
    };

    /**
     *
     * @param {String} tabId the tab id to persist
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.saveActiveCommunicationsItem = function(objectType, objectID) {
        var url = this.RESOURCE_ENDPOINT + '/activeitem/save/' + objectType + '/' + objectID;

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', { url: url});
    };

    /**
     *
     * @param {String} streamName the stream name to save the last refresh time of
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.saveRefreshTime = function(streamName) {
        var url = this.RESOURCE_ENDPOINT + '/refreshtime/save';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', { url: url, data: streamName });
    };

    /**
     * Retrieves exclusion info for a particular item in the stream
     *
     * @methodOf jive.ActivityStream.StreamSource#
     * @param {jive.ActivityStream.ActivityStreamExclusionInfo} resource - stream item information for exclusions
     * @returns {jive.conc.Promise} promise that is fulfilled when the exclusion rules are ready
     */
    this.exclusionRules = function(resource) {
        var url = this.RESOURCE_ENDPOINT + '/exclusions/list';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: JSON.stringify(resource)}, resource);
    };

    /**
     * Removes all applicable exclusions for a particular item in the stream
     *
     * @methodOf jive.ActivityStream.StreamSource#
     * @param {jive.ActivityStream.ActivityStreamExclusionInfo} resource - stream item information for the object
     * @returns {jive.conc.Promise} promise that is fulfilled when the exclusions have been removed
     */
    this.removeExclusions = function(resource) {
        var url = this.RESOURCE_ENDPOINT + '/exclusions/remove';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: JSON.stringify(resource)}, resource);
    };

    /**
     * Fetches the various counts of activities
     *
     * @methodOf jive.ActivityStream.StreamSource#
     * @returns {jive.conc.Promise} promise that is fulfilled when the count of activities is ready
     */
    this.newCount = function(){
        var url;
        var documentURL = document.URL;
        var isAnAllCountAction = documentURL.match(/\/inbox|\/welcome|\/activity/g);

        if(isAnAllCountAction != null) {
            url = this.RESOURCE_ENDPOINT + '/new/count/all';
        }
        else {
            url = this.RESOURCE_ENDPOINT + '/new/count/inboxandactions';
        }

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url});
    };

    /**
     * Get the full content of a content object or activity
     *
     * @methodOf jive.ActivityStream.StreamSource#
     * @param {Number} objectType the type of the object content to get
     * @param {Number} objectID the ID of the object content to get
     * @returns {jive.conc.Promise} promise that is fulfilled when the object content is retrieved
     */
    this.getFullContent = function(objectType, objectID) {
        var promise = new jive.conc.Promise(),
            url = '';
        if (objectType == 1150305777) {
            // get special content for latest acclaim and render
            url = this.RESOURCE_ENDPOINT + '/acclaim';
            this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url}).addCallback(function(data) {
                var latestAcclaimHTML = jive.eae.latestAcclaim.extraContent({
                    data: data,
                    currentUserID: window._jive_current_user.ID,
                    currentUserPartner: window._jive_current_user.partner});
                promise.emitSuccess({html:latestAcclaimHTML, extraData: {}});
            });
            return promise;
        }
        else {
            url = this.RESOURCE_ENDPOINT + '/fullcontent/' + objectType + '/' + objectID;
            return this.commonAjaxRequest(promise, 'GET', {url:url});
        }
    };

    /**
     * Get the list of rendered replies for a content object or activity based on the passed in IDs.
     *
     * @methodOf jive.ActivityStream.StreamSource#
     * @param {Number} objectType the type of the object to get replies for
     * @param {Number} objectID the ID of the object to get replies for
     * @param {jive.ActivityStream.FullRepliesRequest} resource - list of reply IDs to load up and render
     * @returns {jive.conc.Promise} promise that is fulfilled when the object replies are retrieved
     */
    this.getFullReplies = function(objectType, objectID, resource) {
        var url = this.RESOURCE_ENDPOINT + '/fullreplies/' + objectType + '/' + objectID;

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: JSON.stringify(resource)}, resource);
    };

    /**
     * Get a list comments/replies for an object that occured before the timestamp that is
     * passed in. This will "fill in the gaps" for any object that may be missing context for replies.
     *
     * @methodOf jive.ActivityStream.StreamSource#
     * @param {Number} objectType the type of the object replies to get
     * @param {Number} objectID the ID of the object replies to get
     * @param {jive.ActivityStream.FillInTheGapRequest} resource - list of original comments displayed and the timestamp of the oldest comment
     * @returns {jive.conc.Promise} promise that is fulfilled when the object replies are retrieved
     */
    this.fillInTheGaps = function(objectType, objectID, resource) {
        var url = this.RESOURCE_ENDPOINT + '/fillinthegaps/' + objectType + '/' + objectID;

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: JSON.stringify(resource)}, resource);
    };

    /**
     * Get a list subactivities for an object in a particular stream that occured before the timestamp that is
     * passed in.
     *
     * @methodOf jive.ActivityStream.StreamSource#
     * @param {Number} objectType the type of the object replies to get
     * @param {Number} objectID the ID of the object replies to get
     * @param {jive.ActivityStream.FillActivityRequest} resource
     * @param {jive.conc.Promise} promise
     */
    this.fillActivity = function(objectType, objectID, resource, promise) {
        var url = this.RESOURCE_ENDPOINT + '/fillactivity/' + objectType + '/' + objectID;

        return this.commonAjaxRequest(promise, 'POST', {url:url, data: JSON.stringify(resource)});
    };

    this.getHiddenRules = function(promise) {
        var url = this.RESOURCE_ENDPOINT + '/exclusions/list';

        return this.commonAjaxRequest(promise, 'GET', {url:url});
    };

    this.saveInboxViewType = function(viewType) {
        var url = this.RESOURCE_ENDPOINT + '/inbox/viewtype/save';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: viewType});
    };

    this.saveInboxListHeight = function(newHeight) {
        var url = this.RESOURCE_ENDPOINT + '/inbox/listheight/save';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: JSON.stringify(newHeight)});
    };

    this.getGlobalNavMenu = function() {
        var url = this.RESOURCE_ENDPOINT + '/global/nav/menu';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url});
    }
});
