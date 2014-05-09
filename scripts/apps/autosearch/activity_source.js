/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/**
 * Interface to history REST service.
 *
 * @extends jive.DeferredRestService
 * @depends path=/resources/scripts/apps/shared/models/deferred_rest_service.js
 */
define(
    "jive.component.autosearch.ActivitySource",
    ['jquery'],
    function ($)
    {

        return jive.DeferredRestService.extend(
            function(protect) {

                protect.resourceType = "search";

                this.init = function(options) {
                    this.RESOURCE_ENDPOINT =  _jive_base_url + "/api/core/v3/activities/";
                };

                this.queryFrequent = function(type, count){
                    var data = {};
                    data.count = count;
                    var url = this.RESOURCE_ENDPOINT + "frequent/" + type;
                    return this.commonAjaxRequest(new $.Deferred(), 'GET', {
                                url: url,
                                data: data
                            });
                };

                this.queryRecent = function(type, count ){
                    var data = {};
                    data.count = count;
                    var url = this.RESOURCE_ENDPOINT + "recent/" + type;
                    return this.commonAjaxRequest(new $.Deferred(), 'GET', {
                                url: url,
                                data: data
                            });
                };
            }
        );
    }
);