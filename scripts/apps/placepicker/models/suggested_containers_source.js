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
 * @config {string} contentType The type of content to create that we need a container for
 * @config {string} containerType The type of the current container
 * @config {string} containerID The id of the current container
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.Placepicker.SuggestedContainersSource = jive.RestService.extend(function(protect, _super) {
    protect.resourceType = "container";

    protect.init = function(options) {
        _super.init.call(this, options);

        $j.extend(this.defaultParams, {
            containerType: options.containerType,
            containerID: options.containerID
        });

        this.RESOURCE_ENDPOINT =  jive.rest.url("/containers/suggested");
    };
});

