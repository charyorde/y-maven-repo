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
 * Interface to user relationship list (labels) REST service
 *
 * @class
 * @extends jive.RestResource
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.UserRelationshipListSource = jive.RestService.extend(function(protect) {

    protect.resourceType = "userrelationshiplist";

    this.getListsForMember = function(memberID){
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {
            url: this.RESOURCE_ENDPOINT + "/members/" + memberID
        });
    };

    this.getListMembers = function(listID){
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {
            url: this.RESOURCE_ENDPOINT + "/" + listID + "/members"
        });
    };

    this.addListMember = function(listID, userID) {
        return this.commonAjaxRequest(new jive.conc.Promise(), 'PUT', {
            url: this.RESOURCE_ENDPOINT + "/" + listID + "/members",
            data: userID
        });
    };

    this.removeListMember = function(listID, userID){
        return this.commonAjaxRequest(new jive.conc.Promise(), 'DELETE', {
            url: this.RESOURCE_ENDPOINT + "/" + listID + "/members/" + userID
        });
    };

});
