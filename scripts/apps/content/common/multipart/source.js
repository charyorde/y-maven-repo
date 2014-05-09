/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('content.common.multipart');

/**
 * @class
 * @extends jive.RestService
 * @depends path=/resources/scripts/jive/rest.js
 */
jive.content.common.multipart.Model = jive.RestService.extend(function(protect) {

    protect.resourceType = "multipart/progress";
    protect.pluralizedResourceType = protect.resourceType;

});

