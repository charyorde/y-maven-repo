/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('draft');

/**
 * @class
 * @extends jive.RestService
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 * @depends path=/resources/scripts/jive/rest.js
 */
jive.draft.Model = jive.RestService.extend(function(protect) {

    protect.resourceType = 'draft';
    protect.pluralizedResourceType = protect.resourceType;

    this.save = function(data) {
        return this.commonAjaxRequest(new jive.conc.Promise(), 'PUT', {
            url: this.RESOURCE_ENDPOINT + "/" + data.id,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data)});
    };

    this.create = function(data) {
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {
            url: this.RESOURCE_ENDPOINT,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data)});
    };

    this.display = function(id) {
        return this.get(id);
    };
});
