/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('EAEAdmin');

/**
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/promise.js
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 * @depends path=/resources/scripts/jive/json-security.js
 */
jive.EAEAdmin.EAESource = jive.RestService.extend(function(protect) {

    protect.resourceType = "admin/activity-upgrade";
    protect.pluralizedResourceType = 'admin/activity-upgrade';

    this.getCurrentProgress = function() {
        var url = this.RESOURCE_ENDPOINT + '/progress';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url: url});
    };
});
