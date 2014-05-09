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
    "jive.component.autosearch.SearchSource",
    ['jquery'],
    function ($)
    {

        return jive.DeferredRestService.extend(
            function(protect) {

                protect.resourceType = "search";

                this.init = function(options) {

                    this.RESOURCE_ENDPOINT =  _jive_base_url + "/api/core/v3/search";
                };
                this.createParams = function(searchTerm, filters, sort, count, page){
                    var data = {};
                    data.sort = sort;
                    data.count = count;
                    data.filter = [];
                    if(filters){
                        for(var key in filters){
                            //TODO need to get this to handle array values in filters
                            data.filter.push(key + "(" +filters[key]+ ")");
                        }
                    }
                    if(searchTerm){
                        data.filter.push("search(" + searchTerm + ")");
                    }
                    return data;
                };

                this.query = function(type, searchTerm, filters, sort, count, page){
                    var data = this.createParams(searchTerm, filters, sort, count, page);
                    if(type === "contents"){
                        data.collapse = true;
                    }
                    var url = this.RESOURCE_ENDPOINT + "/" + type;
                    return this.commonAjaxRequest(new $.Deferred(), 'GET', {
                                url: url,
                                data: data
                            });
                };
            }
        );
    }
);