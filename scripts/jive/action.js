/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2009 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Creates a URL for invoking an action.
 */
jive.action = (function() {

    // the _jive_base_url is currently defined in header-javascript.ftl
    var BASE_URL = _jive_base_url + "/";

    return {
        url: function(action, params) {
            var queryString = "";
            Object.keys(params).forEach(function(key) {
                queryString += key + "=" + params[key] + "&";
            });
            if (queryString.length > 0) {
                queryString = "?" + queryString.slice(0, queryString.length - 1);
            }
            return BASE_URL + action + ".jspa" + queryString;
        }
    };

})();