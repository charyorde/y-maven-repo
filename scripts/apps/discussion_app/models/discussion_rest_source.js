/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('DiscussionApp');

/**
 * Discussion REST service, will eventually replace discussion_source.js when we have more functionality in the server
 * side discussion rest service.
 *
 * @class
 * @extends jive.RestService
 * @param {Object}  options
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.DiscussionApp.DiscussionRestSource = jive.RestService.extend(function(protect) {
    /**
     * Set to "discussion"; configures the REST endpoints that instances of this
     * class connect to.
     *
     * @name resourceType
     * @fieldOf jive.DiscussionApp.DiscussionRestSource#
     * @type string
     * @protected
     */
    protect.resourceType = "message";

    /**
     * Don't want a pluralizedResourceType, set this to resourceType
     *
     * @name pluralizedResourceType
     * @fieldOf jive.DiscussionApp.DiscussionRestSource#
     * @type string
     * @protected
     */
    protect.pluralizedResourceType = protect.resourceType;

    /**
     * Creates a new discussion message
     *
     * @methodOf jive.DiscussionApp.DiscussionRestSource#
     */
    this.createMessage = function(resource){
        var url = this.RESOURCE_ENDPOINT + '/' + resource.forumThreadID + '/' + resource.ID,
            name = resource.name,
            email = resource.email;
        delete resource['name'];
        delete resource['email'];
        var data = JSON.stringify(resource);
        if (name) {
            // name supplied by user, must be guest reply
            url += '/guest';
            data = {'messageBean': resource,
                    'guestUserName': name,
                    'guestUserEmail': email};
            data = JSON.stringify(data);
        }

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: data});
    };
});