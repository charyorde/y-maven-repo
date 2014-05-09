/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Activity');
/**
 * Interface to aci content REST service.
 *
 * @extends jive.RestService
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.Activity.ItemSource = jive.RestService.extend(function(protect) {
    protect.resourceType = "activity";
    protect.pluralizedResourceType = protect.resourceType;

     /**
     * Get a list of users who have liked, commented on, or bookmarked a piece of content.
     *
     * /activity/users/{activityType}/{objectType}/{objectID}
     */
    this.getContentActivityUsers = function(params, start, count) {
        var options = {
            cache : false,

            data : {
                count: count,
                start: start
            },

            url : [this.RESOURCE_ENDPOINT, 'users', params.activityType, params.objectType, params.objectID].join('/')
        };

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', options);
    };
});
