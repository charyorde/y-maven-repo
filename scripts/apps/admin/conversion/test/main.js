/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ConversionAdminTest');

/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/promise.js
 * @depends path=/resources/scripts/jive/i18n.js
 * @depends path=/resources/scripts/soy/soyutils.js
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */

jive.ConversionAdmin.Main = jive.RestService.extend(function(protect, _super) {

    protect.resourceType = protect.pluralizedResourceType = 'office/status';

    this.init = function(options) {
        var main = this;
        _super.init.call(this, options);
        protect.conversionMetaDataID = options.conversionMetaDataID;
    };

    this.getConversionStatus = function() {
        var url = this.RESOURCE_ENDPOINT + '/' + this.conversionMetaDataID;

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url: url});
    };
});
