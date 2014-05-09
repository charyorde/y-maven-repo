/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('AccessCheckApp');

jive.AccessCheckApp.AccessCheckSource = jive.RestService.extend(function(protect) {

    protect.resourceType = "container";

    /**
     * Checks the user access on the server
     *
     * @methodOf jive.RestService#
     * @param {Object}  resource    object representing a resource to remove from the server
     * @returns {jive.conc.Promise} promise that is fulfilled when the resource is successfully deleted
     */
    this.checkAccess = function(resource) {
        var promise = new jive.conc.Promise();

        $j.ajax({
            type: "GET",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            url: this.RESOURCE_ENDPOINT + "/" + resource.objectType + "/" + resource.objectID + "/access/" + resource.userID,
            success: function(data, textStatus, xhr) {
                promise.emitSuccess(data);
            },
            error: function(data, textStatus, xhr) {
                try {
                    var jsonResp  = $j.parseJSON(data.responseText);

                    if (jsonResp && jsonResp.error && jsonResp.error.message) {
                        promise.emitError(jsonResp.error.message, jsonResp.error.code);
                    }
               }
                catch(_) {
                    promise.emitError(null, data && data.status);
                }
            }
        });

        return promise;
    };

});
