/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ActionQueue');

/**
 * Represents json data returned from and sent to the action queue performAction rest service
 *
 * @class
 *
 * @depends path=/resources/scripts/jquery/jquery.oo.js 
 */
jive.ActionQueue.ActionResult = $Class.extend({
    init: function(userID, itemID, actionCode, message) {
        this.userID = userID;
        this.itemID = itemID;
        this.actionCode = actionCode;
        this.message = message;
    }
});

