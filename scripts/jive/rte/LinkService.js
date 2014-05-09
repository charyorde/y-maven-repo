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
 * REST (ish) service for resolving links and filling in their titles.
 *
 * @class
 *
 * @extends jive.RestService
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.rte.LinkService = jive.RestService.extend(function(protect){
    protect.resourceType = "rteLink";

    this.resolve = function(href){
        var that = this;
        return that.commonAjaxRequest(new jive.conc.Promise(), "GET", {
            url: that.getUrl({href: href})
        });
    };

    protect.getUrl = function(params){
        //add defaultParams as query params.
        var paramMap = $j.extend({}, this.defaultParams, params || {});
        var queryStr = "?" + $j.param(paramMap);

        return this.RESOURCE_ENDPOINT + queryStr;
    };
});
