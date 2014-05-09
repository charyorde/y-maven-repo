/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ActivityStream');

/**
 * Represents json data returned from and sent to the exclusion service
 *
 * @class
 *
 * @depends path=/resources/scripts/jquery/jquery.oo.js
 */
jive.ActivityStream.ActivityStreamExclusionInfo = $Class.extend({
    init: function(options) {
        this.userID = options.userID;
        this.objectType = options.objectType;
        this.objectID = options.objectID;
        this.containerType = options.containerType;
        this.containerID = options.containerID;
        this.interactedObjectType = options.interactedObjectType;
        this.interactedObjectID = options.interactedObjectID;
    }
});
