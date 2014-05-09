/*
 * Scripts in this file are to specifically support Soy functions.
 *
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('soy.func');

/**
 * Creates a dynamic URL with the appropriate context for loading static content.
 * Output is the same as resource.url.
 */
jive.soy.func.resourceUrl = (function() {
    /**
     * If path doesn't begin with a forward slash add one.
     * @param path
     */
    function prefixSlash(path) {
        return path.replace(/^[^\/]/, '/');
    }

    return function(baseUrl, appversion, externalResource, path) {
        if (!baseUrl){
            baseUrl = "/";
        }

        // Handle stripping a leading slash from path and appversion.
        var base = externalResource ? externalResource : baseUrl
          , barepath = path.indexOf(base) === 0 ? path.replace(base, '') : path
          , version = appversion.indexOf(base) === 0 ? appversion.replace(base, '') : appversion;

        return base + version + barepath;
    };
})();

/**
 * NOTE: this is to support the SOY BuildUrlFunction.
 * @param map An object literal mapping keys to values.
 */
jive.soy.func.buildParameterString = function(map) {
    if (map) {
        return $j.param(map);
    }
    else {
        return "";
    }
};

/**
 * Builds a full url
 *
 * @param base site-wide base path (ie: /jive)
 * @param data the given path (ie: /some/path?maybe=withParams)
 * @returns {string}
 */
jive.soy.func.normalizeUrl = (function() {
    var protocol = /^[a-z]+:/i
      , leadingSlash = /^\/+/
      , trailingSlash = /\/+$/;

    return function(base, path) {
        var baseWithTrailingSlash = (!base.match(base +'\/$')) ? base + '/' : base;
        // Prepend site base path and a preceding slash if they are not
        // already present and if the URL is not already
        // fully-qualified.
        if (!path.match(protocol) && path.match(leadingSlash) && path.indexOf(baseWithTrailingSlash) !== 0) {
            // remove trailing slashes from base
            base = base.replace(trailingSlash, '');
            // remove leading slashes from path
            path = path.replace(leadingSlash, '');

            return base + '/' + path;
        } else {
            return path;
        }
    };
})();

/**
 * returns a random string that's useful for creating unique dom ids
 */
jive.soy.func.randomString = function() {
    // create a random number then convert it to string use base 36
    // finally remove decimal
    // see http://en.wikipedia.org/wiki/Base_36
    return Math.random().toString(36).replace('.', '');
};

/**
 * evaluates a soy template with the ability to catch exception and fail gracefully
 */
jive.soy.func.eval = function(templateName, failGracefully, devMode, opt_data, opt_sb) {
    var template = templateName.split('.').reduce(function(ref, part) {
        return ref ? ref[part] : null;
    }, window);

    if (!template){
        return "ERROR: no template found for " + templateName;
    } else {
        try {
            // If opt_sb is given then the return value of the template
            // will be undefined.  Substitute an empty string here so
            // that we do not see "undefined" in template outputs.
            return template(opt_data, opt_sb) || "";
        }
        catch(err) {
            if (failGracefully) {
                if (devMode) {
                    return err + " params:" +  JSON.stringify(opt_data);
                }
                else {
                    return "";
                }
            }
            else {
                throw err;
            }
        }
    }
};
