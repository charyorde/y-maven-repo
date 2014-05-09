/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2009 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Creates a URL for invoking internal REST services.
 */
jive.rest = (function() {

    // the _jive_base_url is currently defined in /template/decorator/default/header-javascript-global-params.ftl
    var REST_BASE_URL = _jive_base_url + "/__services/v2/rest";

    return {
        url: function(path) {
            return REST_BASE_URL + path;
        },
        admin: {
            url: function(path) {
                return REST_BASE_URL + "/admin" + path;

            }
        }
    };

})();

jive.rest.corev3 = (function() {

    // the _jive_base_url is currently defined in /template/decorator/default/header-javascript-global-params.ftl
    var REST_BASE_URL = _jive_base_url + "/api/core/v3";

    return {
        url: function(path) {
            return REST_BASE_URL + path;
        }
    };

})();

jive.cached_rest = (function() {

    // the _jive_base_url is currently defined in /template/decorator/default/header-javascript-global-params.ftl
    var CACHED_REST_BASE_URL = _jive_base_url + window.CS_RESOURCE_BASE_URL + "/__services/v2/rest";

    return {
        url: function(path) {
            return CACHED_REST_BASE_URL + path;
        }
    };

})();

/**
 * Creates a dynamic URL with the appropriate  context for loading dynamic content.
 * Output is the same as s.url.
 */
jive.app.url = (function() {

    // the _jive_base_url is currently defined in /template/decorator/default/header-javascript-global-params.ftl
    var BASE_URL = _jive_base_url;

    return function(options, opt_sb) {
        var output = opt_sb || new soy.StringBuilder();
        output.append(BASE_URL + options.path);
        if (!opt_sb) {
            return output.toString();
        }
    };

})();

/**
 * Creates a dynamic URL with the appropriate context for loading static content.
 * Output is the same as resource.url.
 */
jive.resource = (function() {

    // the _jive_resource_url is currently defined in /template/decorator/default/header-javascript-global-params.ftl
    var urlFunc;
    if (typeof(_jive_resource_url) != "undefined") {
        var RESOURCE_URL = _jive_resource_url;

        urlFunc = function(options, opt_sb) {
            var output = opt_sb || new soy.StringBuilder();
            output.append(RESOURCE_URL + options.path);
            if (!opt_sb) {
                return output.toString();
            }
        };
    }
    else {
        urlFunc = function() {
            throw "the global variable _jive_resource_url is undefined.";
        };
    }

    return {
        url: urlFunc
    };

})();

/**
 * Creates a JSON object from a string, removing the "throws..." clause from the beginning of calls to the
 * internal REST API.
 */
jive.json = (function() {

    var parse = function(data) {

        var escaped = data.replace(/^throw [^;]*;/, '');
        return JSON.parse(escaped);
    };

    return {
        parse: parse
    };

})();

jive.api = (function() {
    var DEFAULT_VERSION = "v1";
    var REST_BASE_URL = _jive_base_url + "/__services/v2/rest";

    var APPS_BASE = "apps";

    return {
        apps: function(path, version) {
            version = version ? version : DEFAULT_VERSION;

            return REST_BASE_URL + "/" + APPS_BASE + "/" + version + "/" + path;
        }
    };
})();

jive.secure = (function() {
    var path = /^\//, scheme = /^[a-z]+:/i;

    return function(url) {
        if (url.match(path)) {
            return 'https://'+ location.host + url;
        } else if (url.match(scheme)) {
            return url.replace(scheme, 'https:');
        }
    };
})();

