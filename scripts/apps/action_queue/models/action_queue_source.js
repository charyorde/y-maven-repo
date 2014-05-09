/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ActionQueue');

/**
 * ActionQueue REST service.
 *
 * @class
 * @extends jive.RestService
 * @param {Object}  options
 *
 * @depends path=/resources/scripts/jive/rest.js
 */
jive.ActionQueue.ListSource = jive.RestService.extend(function(protect) {
    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    /**
     * Set to "action-queue"; configures the REST endpoints that instances of this
     * class connect to.
     *
     * @name resourceType
     * @fieldOf jive.ActionQueue.ListSource#
     * @type string
     * @protected
     */
    protect.resourceType = "action-queue";
    /**
     * Don't want a pluralizedResourceType, set this to resourceType
     *
     * @name pluralizedResourceType
     * @fieldOf jive.ActionQueue.ListSource#
     * @type string
     * @protected
     */
    protect.pluralizedResourceType = protect.resourceType;

    this.initializeView = function(tabID, promise) {
        var url = this.RESOURCE_ENDPOINT + '/initializeView';

        protect.displayGenericErrorMessages = false;
        if (!promise) {
            promise = new jive.conc.Promise();
        }
        return this.commonAjaxRequest(promise, 'GET', {url:url, data: {tabID: tabID}}).addErrback(function(message, status) {
            if (status == 401 || status == 403 || status == 4026 || status === 0) {
                location.reload();
            }
        }).always(function() {
            protect.displayGenericErrorMessages = true;
        });
    };

    this.filter = function(archived) {
        var url = this.RESOURCE_ENDPOINT + '/filter';
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url, data: {archived: archived}});
    };

    /**
     * Loads a list of activity for a particular user, using userId
     *
     * @methodOf jive.ActionQueue.ListSource#
     * @param {Object}  resource Contains property String userId, that specifies the user's id
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.list = function() {
        var url = this.RESOURCE_ENDPOINT + '/list';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET',
            {url:url});
    };

    /**
     * Loads a list of actions for a particular user before the specified time, using userId
     *
     * @methodOf jive.ActionQueue.ListSource#
     * @param {Object}  resource Contains property String userId, that specifies the user's id
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.getMore = function(beforeTime, numResults, archived) {
        var url = this.RESOURCE_ENDPOINT + '/list/before';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET',
            {url:url, data: {beforeThisTime:beforeTime, numResults: numResults, archived: archived}});
    };

    /**
     * Fetches the new count of activities unread for a particular activity stream page
     *
     * @methodOf jive.ActionQueue.ListSource#
     * @param {Object}  resource Contains property Strings userId, itemId, actionCode
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.performAction = function(resource) {
        var url = this.RESOURCE_ENDPOINT + '/performAction';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: JSON.stringify(resource)},
            resource);
    };


});
