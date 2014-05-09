/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
(function() {
    var jiveHomeLocation = shindig.uri(window.location.href);
    if(!!window.__JAF_DEBUG && window.__JAF_DEBUG == 1) {
        window.__API_URI = shindig.uri('/../gadgets/js/jive-core-container:container:core:rpc:open-views:dynamic-height:selection:actions.js?c=1&debug=1&container=default');
    } else {
        window.__API_URI = shindig.uri('/../gadgets/js/jive-core-container:container:core:rpc:open-views:dynamic-height:selection:actions.js?c=1&container=default');
    }
    window.__API_URI.resolve(jiveHomeLocation);
    window.__CONTAINER = "default";
})();
