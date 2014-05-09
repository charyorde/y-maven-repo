/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('MembershipApp');

/**
 * jive.MembershipApp.MembershipSource
 * 
 * Data Model class for interacting with server side REST operations.
 */
jive.MembershipApp.MembershipSource = jive.RestService.extend(function(protect) {

    protect.resourceType = "socialgroup";

    /**
     * Adds a social group member on the server
     *
     * @methodOf jive.RestService#
     * @param {Object}  resource    object representing a resource to create or update
     * @config {string} [id]    ID of the resource to update; if no ID is given a new resource is created
     * @returns {jive.conc.Promise} promise that is fulfilled when the resource is successfully saved
     */
    this.save = function(resource) {
        var promise = new jive.conc.Promise(),
            source = this;

        var data = $j.deparam.querystring().fromQ;
        $j.ajax({
            type: "POST",
            url: this.RESOURCE_ENDPOINT + "/" + resource.objectID + "/members" ,
            dataType: "json",
            data: data,
            contentType: "application/json; charset=utf-8",
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
    
    this.get = function(resource) {
    	
    	var promise = new jive.conc.Promise(),
        source = this;

	    // Serialize resource data.
	    var data = {};
	    data[this.resourceType] = resource;
	
	    $j.ajax({
	        type: "GET",
	        url: this.RESOURCE_ENDPOINT + "/" + resource.objectID + "/memberInfo",
	        dataType: "json",
	        data: JSON.stringify(data),
	        contentType: "application/json; charset=utf-8",
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
    }

	/**
     * Deletes the membership from the server.
     *
     * @methodOf jive.RestService#
     * @param {Object}  resource    object representing a resource to remove from the server
     * @returns {jive.conc.Promise} promise that is fulfilled when the resource is successfully deleted
     */
    this.destroy = function(resource) {
        var promise = new jive.conc.Promise();

        $j.ajax({
            type: "DELETE",
            url: this.RESOURCE_ENDPOINT + "/" + resource.objectID + "/members",
            success: function() {
                promise.emitSuccess();
            },
            error: function(xhr) {
                promise.emitError(null, xhr.status);
            }
        });

        return promise;
    };
});
