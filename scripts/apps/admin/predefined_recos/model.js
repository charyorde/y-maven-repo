/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace("PredefinedRecos");

/**
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */

jive.PredefinedRecos.PredefinedRecoSource = jive.RestService.extend(function(protect) {
    protect.PREDEFINED_RECOS_ENDPOINT = jive.rest.admin.url("/recommendations");

    this.add = function(url, promise) {
        var endpoint = this.PREDEFINED_RECOS_ENDPOINT + '/predefined/save';

        return this.commonAjaxRequest(promise, 'POST', {url:endpoint, contentType: "text/plain", data:url});
    },
    this.remove = function(type, id, promise) {
        var endpoint = this.PREDEFINED_RECOS_ENDPOINT + '/predefined/' + type + '/' + id + '/delete';

        return this.commonAjaxRequest(promise, 'POST', {url:endpoint});
    }
});