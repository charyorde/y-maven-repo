/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('MicroBlogging');

/**
 * MicroBlogging REST service.
 *
 * @class
 * @extends jive.RestService
 * @param {Object}  options
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.MicroBlogging.MicroBloggingSource = jive.RestService.extend(function(protect) {
    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    /**
     * Set to "activity-stream"; configures the REST endpoints that instances of this
     * class connect to.
     *
     * @name resourceType
     * @fieldOf jive.MicroBlogging.MicroBloggingSource#
     * @type string
     * @protected
     */
    protect.resourceType = "wall";
    /**
     * Don't want a pluralizedResourceType, set this to resourceType
     *
     * @name pluralizedResourceType
     * @fieldOf jive.MicroBlogging.MicroBloggingSource#
     * @type string
     * @protected
     */
    protect.pluralizedResourceType = protect.resourceType;

    /**
     * Publishes the wall entry to the system.
     *
     * @methodOf jive.MicroBlogging.MicroBloggingSource#
     * @param {Object} urlParams object containaing key value pairs for url params
     * @param {Object}  resource Contains properties objectType, objectID, and wallEntryBean
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.publishEntry = function(urlParams, resource){
        var url = this.RESOURCE_ENDPOINT + '/' + urlParams.objectType + '/' + urlParams.objectID + (urlParams.trackingID ? '?sr='+urlParams.trackingID : '');

        if (jive.Trial && jive.Trial.Controller) {
            // a jive trial is going on, need to possibly send extra query params if this mb post is part of a certain quest.
            var activeQuestData = jive.Trial.Controller.getActiveQuestAndStep();
            if (activeQuestData.activeQuestID == '1836538113' && activeQuestData.activeQuestStep == 0) {
                resource.wallentry.fromQuest = activeQuestData.activeQuestID;
            }
        }
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: JSON.stringify(resource)}, resource);
    };

    /**
     * Creates a draft Wall Entry object. Creating a draft is needed when a user wants to attach or associate other objects
     * with a new Wall Entry without publishing it.
     *
     * @methodOf jive.MicroBlogging.MicroBloggingSource#
     * @param {Object} urlParams object containaing key value pairs for url params
     * @param {Object}  resource Contains properties containerType, containerID, and wallEntryBean
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.createDraft = function(urlParams, resource){
        var url = this.RESOURCE_ENDPOINT + '/' + urlParams.objectType + '/' + urlParams.objectID + '/draft';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: JSON.stringify(resource)}, resource);
    };

    /**
     * Creates a new wall entry that is a repost of a wall entry with the specified id.
     *
     * @methodOf jive.MicroBlogging.MicroBloggingSource#
     * @param {Object}  resource Contains properties wallEntryID and body
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.repost = function(urlParams, resource){
        var url = this.RESOURCE_ENDPOINT + '/repost/' + urlParams.wallEntryID;

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: resource},resource);
    };

    /**
     * Creates a repost draft.
     *
     * @methodOf jive.MicroBlogging.MicroBloggingSource#
     * @param {Object}  resource Contains properties wallEntryID and body
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.createRepostDraft = function(urlParams, resource){
        var url = this.RESOURCE_ENDPOINT + '/repost/' + urlParams.wallEntryID + '/draft';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: JSON.stringify(resource)},resource);
    };
});
