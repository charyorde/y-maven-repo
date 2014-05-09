/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('admin.conversion.manage');

/**
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/promise.js
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 * @depends path=/resources/scripts/jive/json-security.js
 */
jive.admin.conversion.manage.Model = jive.RestService.extend(function(protect) {

    protect.resourceType = protect.pluralizedResourceType = "conversion/manage";

    this.getInFlightConversions = function getInFlightConversions() {
        var url = this.RESOURCE_ENDPOINT + '/inflightConversions';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url: url});
    };


    this.getErrorConversions = function getErrorConversions() {
        var url = this.RESOURCE_ENDPOINT + '/errorConversions';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url: url});
    };
});
