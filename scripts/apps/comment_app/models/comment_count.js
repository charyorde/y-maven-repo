/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('CommentApp');

/**
 * Comment count REST service.
 *
 * @class
 * @extends jive.RestService
 * @param {Object}  options
 *
 * @depends path=/resources/scripts/jive/rest.js
 */
jive.CommentApp.CommentCount = jive.RestService.extend(function(protect) {
    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    /**
     * Set to "comments"; configures the REST endpoints that instances of this
     * class connect to.
     *
     * @name resourceType
     * @fieldOf jive.CommentApp.CommentCount#
     * @type string
     * @protected
     */
    protect.resourceType = "comments";
    /**
     * Don't want a pluralizedResourceType, set this to resourceType
     *
     * @name pluralizedResourceType
     * @fieldOf jive.CommentApp.CommentCount#
     * @type string
     * @protected
     */
    protect.pluralizedResourceType = protect.resourceType;

    /**
     * Given an object type and object ID it will fetch the number of comments for that object.
     *
     * @methodOf jive.CommentApp.CommentSource#
     * @param {Number} objectType the type of the object
     * @param {Number} objectID the ID of the object
     * @returns {jive.conc.Promise} promise that is fulfilled when the data is retrieved
     */
    this.getCommentCount = function(objectType, objectID) {
        var url = this.RESOURCE_ENDPOINT + '/' + objectType + '/' + objectID;

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url});
    }

});
