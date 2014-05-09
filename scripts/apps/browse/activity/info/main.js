/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Activity.Info');  // Creates the jive.OrgChart namespace if it does not already exist.

/**
 * Displays users who have acted on a piece of content
 *
 * @depends path=/resources/scripts/apps/browse/activity/info/views/activity_info_view.js
 * @depends path=/resources/scripts/apps/browse/activity/model/activity_source.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/promise.js
 */
jive.Activity.Info.Main = jive.oo.Class.extend(function(protect) {
    this.init = function() {
        // private variables
        this.pageSize = 20;

        // Set up component instances.
        this.source = new jive.Activity.ItemSource();
        this.view = new jive.Activity.Info.ActivityInfoView({ pageSize: this.pageSize });

        // listen for load more event (endless scroll)
        var self = this;
        this.view.addListener('loadUsersFromIndex', function(params, startIndex, promise) {
            self.source.getContentActivityUsers(params, startIndex, self.pageSize).addCallback(function(response) {
                promise.emitSuccess(response);
            });
        });
    };

    /**
     * Asynchronously gathers a list of users corresponding to a set of parameters.
     *
     * @param {object} params
     * @param {string} params.activityType bookmark|children|connections|follow|like|membership
     * @param {string|number} objectID
     * @param {string|number} objectType
     * @param startIndex
     * @returns {Promise}
     */
    this.showUsers = function(params, startIndex) {
        var view    = this.view,
            promise = new jive.conc.Promise();
        
        this.source.getContentActivityUsers(params, startIndex, this.pageSize).addCallback(function(response) {
            view.showUsers(response, params);
            promise.emitSuccess($j.extend({ totalCount: response.totalCount }, params));
        }).addErrback(function() {
            promise.emitError();
        });


        return promise;
    };
});
