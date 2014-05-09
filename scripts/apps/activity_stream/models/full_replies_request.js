/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ActivityStream');

/**
 * Represents json data sent to the full replies rest service
 *
 * @class
 *
 * @depends path=/resources/scripts/jquery/jquery.oo.js
 */

jive.ActivityStream.FullRepliesRequest = $Class.extend({
    init: function(options) {
        this.originalIDs = options.originalIDs;
    }
});
