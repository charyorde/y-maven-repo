/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint undef:true laxbreak:true */
/*global jive $j */

jive.namespace('PublishBar');  // Creates the jive.PublishBar namespace if it does not already exist.

/**
 * Interface to history REST service filtered to return only places.
 *
 * @extends jive.RestService
 * @param {Object} options
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.PublishBar.PublishBarSource = jive.RestService.extend(function(protect, _super) {
    protect.resourceType = "container";

    protect.init = function(options) {
        options = options || {};
        _super.init.call(this, options);

        this.RESOURCE_ENDPOINT =  jive.rest.url("/publishbar");
    };
});
