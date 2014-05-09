/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Browse.User');
/**
 * Interface to user REST service.
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 * @depends path=/resources/scripts/lib/core_ext/array.js
 * @extends jive.RestService
 */
jive.Browse.User.ItemSource = jive.RestService.extend(function(protect) {
    protect.resourceType = "user";

    this.findAll = function(params) {
        var userFlag = (params.userID) ? params.userID : "current";
        var url = this.RESOURCE_ENDPOINT + "/" + userFlag + "/browse";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url, data:params || {}});
    };

    /**
     * Gets org chart users
     */
    this.findAllOrgChart = function(params) {
        var userFlag = (params.userID) ? params.userID : "current";
        var url = this.RESOURCE_ENDPOINT + "/" + userFlag + "/orgchart";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url, data:params || {}});
    };

    /**
     * Gets number of direct reports for a given user.
     */
    this.getDirectReportCount = function(params) {
        var url = this.RESOURCE_ENDPOINT + "/" + params.userID + "/directreports/count";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url, data:{}});
    };

    /**
     * Gets direct reports for a given user.
     */
    this.getDirectReports = function(params) {
        var url = this.RESOURCE_ENDPOINT + "/" + params.userID + "/directreports";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url, data:{}});
    };

    /**
     * Get a user property.
     */
    this.getUserProperty = function(params) {
       var url = this.RESOURCE_ENDPOINT + "/" + params.userID + "/prop/" + params.propName;
       return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url, data:{}});
    };

    /**
     * Set a user property.
     */
    this.setUserProperty = function(params) {
       var url = this.RESOURCE_ENDPOINT + "/" + params.userID + "/prop/" + params.propName;
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data:params.propValue});
    };

    /**
     * Set a user property.
     */
    this.removeUserProperty = function(params) {
        var url = this.RESOURCE_ENDPOINT + "/" + params.userID + "/prop/" + params.propName;
        return this.commonAjaxRequest(new jive.conc.Promise(), 'DELETE', {url:url});
    };
});