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
 * Represents json data returned from and sent to the stream count rest service
 *
 * @class
 *
 * @depends path=/resources/scripts/jquery/jquery.oo.js 
 */
jive.ActivityStream.ActivityStreamExclusion = $Class.extend({
    init: function(options) {
        this.action = options.excludeAction;
        this.userID = options.userID;
        this.interactedObjectType = options.interactedObjectType;
        this.interactedObjectID = options.interactedObjectID;
    },

    setObjectType: function(objType) {
        this.objectType = objType;
    },

    setObjectID: function(objID) {
        this.objectID = objID;
    },
    
    setContentType: function(contentType) {
        this.contentType = contentType;
    }
});
