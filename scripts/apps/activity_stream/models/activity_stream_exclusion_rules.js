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
jive.ActivityStream.ActivityStreamExclusionRules = $Class.extend({
    init: function(options) {
        this.exclusionRules = options.exclusionRules;
    }
});
