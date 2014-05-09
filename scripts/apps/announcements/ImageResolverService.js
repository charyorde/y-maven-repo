/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Announcements');

/**
 * Resolves images for a given URL
 *
 * @class
 *
 * @extends jive.RestService
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.Announcements.ImageResolverService = jive.RestService.extend(function(protect, _super){
    protect.resourceType = "imagesFor";
    protect.pluralizedResourceType = "imagesFor";

    protect.init = function(options) {
        _super.init.call(this, options);

        this.defaultParams = {
            containerType: options.containerType
        };
    };

});
