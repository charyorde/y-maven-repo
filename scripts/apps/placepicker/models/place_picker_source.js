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

jive.namespace('Placepicker');  // Creates the jive.Placepicker namespace if it does not already exist.

/**
 * Interface to history REST service filtered to return only places.
 *
 * @extends jive.RestService
 * @param {Object} options
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.Placepicker.PlacePickerSource = jive.RestService.extend(function(protect, _super) {
    protect.resourceType = "placepicker";

    protect.init = function(picker, options) {
        options = options || {};
        _super.init.call(this, options);

        $j.extend(this.defaultParams, {
            containerType: options.containerType,
            containerID: options.containerID
        });

        this.RESOURCE_ENDPOINT =  jive.rest.url("/placepicker/" + picker);
    };
});
