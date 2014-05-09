/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace("rte");

/**
 * REST (ish) service for managing images embedded in content.
 *
 * @class
 *
 * @extends jive.RestService
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.rte.EntitlementService = jive.RestService.extend(function(protect, _super){
    protect.pluralizedResourceType = "emention/restrictedView";

    protect.init = function(options){

        _super.init.call(this, options);

        protect.options = options;

        this.defaultParams = {
            editingObjectID: options.objectID,
            editingObjectType: options.objectType,
            entitlement: options.entitlement
        };

    };

    this.checkEntitlement = function(mentionedObjectType, mentionedObjectID, validUserIDs){
        var that = this;
        var promise = new jive.conc.Promise();

        if (validUserIDs != undefined && mentionedObjectType == 3) {
            // we have a passed in list of valid user IDs, if a user was mentioned and they aren't
            // in the list, return false
            promise.emitSuccess(validUserIDs.indexOf(mentionedObjectID) != -1);
        }
        else if (mentionedObjectType && mentionedObjectID) {
            that.commonAjaxRequest(promise, 'GET', {
                url: that.getUrl(mentionedObjectType, mentionedObjectID),
                contentType: "text/plain",
                processData: false
            });
        }
        return promise;
    };

    protect.getUrl = function(mentionedObjectType, mentionedObjectID){
        //add defaultParams as query params.
        var query = [];
        for(var key in this.defaultParams){
            query.push(key + "=" + this.defaultParams[key]);
        }
        query.push("mentionedObjectType=" + encodeURI(mentionedObjectType));
        query.push("mentionedObjectID=" + encodeURI(mentionedObjectID));

        var queryStr = encodeURI("?" + query.join("&"));
        return this.RESOURCE_ENDPOINT + queryStr;
    };
});

define('jive.rte.EntitlementService', function() {
    return jive.rte.EntitlementService;
});
