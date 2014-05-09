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
 * @extends jive.RestService
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
define(
    "jive.component.autosearch.ContentSource",
    ['jquery'],
    function($)
    {

        return jive.RestService.extend(
            function(protect) {

                protect.resourceType = "search";

                this.init = function(options) {

                    this.suppressGenericErrorMessages();
                    this.RESOURCE_ENDPOINT =  _jive_base_url + "/api/core/v3/contents";
                };

                this.query = function(filters, count){
                    var data = {};
                    data.count = count;
                    data.filter = [];
                    if(filters){
                        for(var key in filters){
                            //TODO need to get this to handle array values in filters
                            data.filter.push(key + "(" +filters[key]+ ")");
                        }
                    }
                    var url = this.RESOURCE_ENDPOINT;
                    return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {
                                url: url,
                                data: data
                            });
                };
            }
        );
    }
);