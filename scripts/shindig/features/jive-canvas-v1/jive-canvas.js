/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/* jive-canvas.js */

jive.namespace('canvas', {

    getCanvasDimensions: function( callback ) {
        gadgets.rpc.call( null, "get_canvas_dimensions", callback );
    },

    scrollIntoView: function( options ) {
        gadgets.rpc.call( null, "scroll_into_view", null, options );
    }
});
