/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('SSOAdminApp');

/**
 * @class
 * @extends jive.RestService
 * @depends path=/resources/scripts/jive/rest.js
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.SSOAdminApp.ExternalLoginModel = jive.RestService.extend(function(protect) {

    protect.resourceType = "admin/sso/external-login";
    protect.pluralizedResourceType = protect.resourceType;

    this.save = function save(data) {
        var url = this.RESOURCE_ENDPOINT + '/save/';
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url: url, data: Object.toJSON ? Object.toJSON(data) : JSON.stringify(data)});
    };
});
