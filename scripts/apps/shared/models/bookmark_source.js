/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint undef:true */
/*global jive $j */

/**
 * Interface to bookmarks REST service
 *
 * @class
 * @extends jive.RestResource
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.BookmarkSource = jive.RestService.extend(function(protect) {
    /**
     * @override
     */
    protect.resourceType = "bookmark";
});
