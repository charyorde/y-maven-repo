/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Browse.Content');
/**
 * Interface to work content REST service.
 *
 * @extends jive.RestService
 */
jive.Browse.Content.ItemSource = jive.RestService.extend(function(protect) {
    protect.resourceType = "content";
    protect.pluralizedResourceType = protect.resourceType;
    protect.putOnUpdate = true;
});
