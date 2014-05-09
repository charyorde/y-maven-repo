


/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('FollowApp');

jive.FollowApp.FollowSource = jive.RestService.extend(function(protect) {
    protect.resourceType = "follow";

    /**
     * Deletes the follow from the server.
     *
     * @methodOf jive.RestService#
     * @param {Object}  resource    object representing a resource to remove from the server
     * @returns {jive.conc.Promise} promise that is fulfilled when the resource is successfully deleted
     */
    this.destroy = function(resource) {
        var promise = new jive.conc.Promise();

        $j.ajax({
            type: "DELETE",
            url: this.RESOURCE_ENDPOINT + "/" + resource.objectType + "/" + resource.objectID,
            success: function() {
                promise.emitSuccess();
            },
            error: function(xhr) {
                promise.emitError(null, xhr.status);
            },
            timeout: 30000
        });

        return promise;
    };
});
