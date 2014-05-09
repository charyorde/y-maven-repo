/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 **/
define('jive.JAF.Configuration.MsgPoster', ['jquery'], function($j) {
return jive.oo.Class.extend(function(protect) {

    this.post_message = function( key, style  ) {
        var msg = jive.apps.configure.renderAppDataErrorMessage({messageKeys: [key] });
        $j("<p/>").html(msg).message({"style":style});
    };

});
});
