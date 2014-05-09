/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint undef:true */
/*global jive $j */

/**
 * Interface to user relationship (follow/connections/friends) REST service
 *
 * @class
 * @extends jive.RestResource
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.UserRelationshipSource = jive.RestService.extend(function(protect) {

    protect.resourceType = "userrelationship";

    this.follow = function(userID, message){
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {
            url: this.RESOURCE_ENDPOINT + "/" + userID
            //TODO: deal with message...
        });
    };

    this.unfollow = function(userID){
        return this.commonAjaxRequest(new jive.conc.Promise(), 'DELETE', {
            url: this.RESOURCE_ENDPOINT + "/" + userID
        });
    };

    this.orgCreate = function(userID, relationshipType, message){
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {
            url: this.RESOURCE_ENDPOINT + "/orgchart/" + relationshipType + "/" + userID
            //TODO: deal with message...
        });
    };

    this.orgRetire = function(relationshipID){
        return this.commonAjaxRequest(new jive.conc.Promise(), 'DELETE', {
            url: this.RESOURCE_ENDPOINT + "/orgchart/" + relationshipID
        });
    };

});
