/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Filters');  // Creates the jive.Filters namespace if it does not already exist.

/**
 * Interface to REST service for tag completions.
 *
 * @extends jive.RestService
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.Filters.TagSuggestions = jive.RestService.extend(function(protect, _super) {
    protect.resourceType = "tag";

    protect.init = function(options) {
        _super.init.call(this, options);
        this.RESOURCE_ENDPOINT = jive.rest.url("/tags/search");
    };

    this.get = function(id, params) {
        return this.commonAjaxRequest(new jive.conc.Promise(), 'get', {
            data : $j.extend({ query : encodeURIComponent(id) + '*' }, params || {}),
            url  : this.RESOURCE_ENDPOINT
        });
    };
});
