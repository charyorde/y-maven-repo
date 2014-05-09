/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('sso.confirm');

/**
 * @class
 * @extends jive.RestService
 * @depends path=/resources/scripts/jive/rest.js
 */
jive.sso.confirm.Model = jive.RestService.extend(function(protect) {

    protect.resourceType = "sso";
    protect.pluralizedResourceType = protect.resourceType;

    this.save = function save(data) {
        var url = this.RESOURCE_ENDPOINT + '/save/';
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url: url, data: JSON.stringify(data)});
    };
});
