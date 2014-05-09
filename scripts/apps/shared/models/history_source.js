/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Interface to history REST service.
 *
 * @extends jive.RestService
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.HistorySource = jive.RestService.extend(function(protect) {
    protect.resourceType = "history";
    protect.pluralizedResourceType = protect.resourceType;
});
