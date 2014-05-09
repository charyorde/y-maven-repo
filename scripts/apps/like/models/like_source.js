/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Liking');

/**
 * Liking REST service.
 *
 * @class
 * @extends jive.RestService
 * @param {Object}  options
 *
 * @depends path=/resources/scripts/jive/rest.js
 */
jive.Liking.LikeSource = jive.RestService.extend(function(protect) {
    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    /**
     * Set to "acclaim"; configures the REST endpoints that instances of this
     * class connect to.
     *
     * @name resourceType
     * @fieldOf jive.Liking.LikeSource#
     * @type string
     * @protected
     */
    protect.resourceType = "acclaim";
    /**
     * Don't want a pluralizedResourceType, set this to resourceType
     *
     * @name pluralizedResourceType
     * @fieldOf jive.Liking.LikeSource#
     * @type string
     * @protected
     */
    protect.pluralizedResourceType = protect.resourceType;

  /**
     * Fetches the number of likes for an objectType and objectID
     *
     * @methodOf jive.Liking.LikeSource#
     * @param {Number}  objectType the type of content object
     * @param {Number} objectID the ID of the content object
     * @returns {jive.conc.Promise} promise that is fulfilled when the data is ready
     */
    this.getLikes = function(objectType, objectID){
        var url = this.RESOURCE_ENDPOINT + '/' + objectType + '/' + objectID + '/scoredisplay';
        var likeType = 'like';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data:{ratingType:likeType}});
    };

  /**
     * determines if the object is liked by the user
     *
     * @methodOf jive.Liking.LikeSource#
     * @param {Number}  objectType the type of content object
     * @param {Number} objectID the ID of the content object
     * @returns {jive.conc.Promise} promise that is fulfilled when the data is ready
     */
    this.getLikeData = function(objectType, objectID){
        var url = this.RESOURCE_ENDPOINT + '/' + objectType + '/' + objectID;
        var likeType = 'like';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url, data:{ratingType:likeType}});
    };

  /**
     * determines if the object is liked by the user
     *
     * @methodOf jive.Liking.LikeSource#
     * @param {Number}  objectType the type of content object
     * @param {Number} objectID the ID of the content object
     * @returns {jive.conc.Promise} promise that is fulfilled when the data is ready
     */
    this.setLiked = function(like, objectType, objectID){
        var url, data,
            likeType = 'like',
            voteVal  = 1,
            promise = new jive.conc.Promise();

        if (like) {
            var trialQueryParams = '';
            data = {ratingType:likeType, voteValue:voteVal};
            if (jive.Trial && jive.Trial.Controller) {
                // a jive trial is going on, need to possibly send extra query params if this "like" is part of a certain quest.
                var activeQuestData = jive.Trial.Controller.getActiveQuestAndStep();
                if (activeQuestData.activeQuestID == '1836538113' && activeQuestData.activeQuestStep == 1) {
                    data.fromQuest = activeQuestData.activeQuestID;
                    promise.addCallback(function() {
                        jive.dispatcher.dispatch("trial.like.created");
                        jive.dispatcher.dispatch("trial.updatePercentComplete");
                    });
                }
            }
            url = '/' + this.resourceType + '/' + objectType + '/' + objectID + '/addvote';
        }
        else{
            url = '/' + this.resourceType + '/' + objectType + '/' + objectID + '/removevote';
            data = {ratingType:likeType};
        }
        $j.post(jive.rest.url(url), data, function() {
            promise.emitSuccess();
        });
        return promise;
    };

});
