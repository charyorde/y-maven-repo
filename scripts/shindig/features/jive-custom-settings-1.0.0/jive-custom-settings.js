/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/* jive-custom-settings.js */

jive.namespace('opensocial', {


    editingDone: function(message, refreshApp) {
            var args = { message : message, refreshApp: true };
            gadgets.rpc.call( null, "editing_finished", null, args );
    },

    editingCanceled: function(message) {
        var args = { message : message };
        gadgets.rpc.call( null, "editing_canceled", null, args );
    }

});
