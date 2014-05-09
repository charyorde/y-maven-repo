/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @param coreContainer
 * @depends path=/resources/scripts/jquery/jquery.ba-bbq.js
 */
jive.namespace('Apps');

/**
 * @param options
 */
jive.Apps.AppsCanvas = $Class.extend({
    init: function(coreContainer) {
        // app canvas stuff to be wired in here!
        this.cc = coreContainer;
    },

    /**
     * Parse the hash of the current Canvas window to get the view params.
     *
     * The current code only support parsing deep link for canvas,
     * @return the JSON object of the view params or null if not available.
     */
    parseCanvasViewParams: function() {
        var token = null;
        var hash = window.location.hash || "";
        var currentCanvasUrl = window.location.href;
        if (/%(22|7B)/i.test(hash)) hash = decodeURIComponent(hash);
        // regex-fu, de-mystified:
        //   canvas[^;:]*        -- matches the canvas subview name
        //   [\{\}:,]            -- matches valid JSON punctuation characters
        //   \s+                 -- because whitespace is legal in JSON
        //   true|false|null     -- valid literal values in JSON
        //   0                   -- zero is a valid number
        //   -?[1-9]+(\.[0-9]+)? -- matches signed integer and floating point literals
        //   "(\\.|[^"]+)*"      -- matches a string literal: containing any char after a backslash, or any non-quote
        var match = /(canvas[^:;&]*)(:(([\{\}:,]|\s+|true|false|null|0|-?[1-9]+(\.[0-9]+)?|"(\\.|[^"]+)*")+))?/
            .exec(hash);
        var params = null, view = null, rawToken = null;
        if (match) {
            try {
                var paramsString = match[3];
                if (paramsString) {
                    params = paramsString && paramsString != "{}" ? JSON.parse(paramsString) : null;
                }
                view = match[1] || null;
                rawToken = match[0];
            }
            catch(e) {
                params = view = rawToken = null;
            }
            token = { params: params, view: view, rawToken: rawToken, canvasUrl: currentCanvasUrl };
        }

        return token;
    },

    /**
     * Update the passed URL to include the view params in the hash,
     *
     * @param view
     * @param params
     * @param currentUrl
     */
    updateUrlWithViewParams: function(view, params, currentUrl) {
        var newTokenBuffer = [];
        newTokenBuffer.push(view ? view : "canvas");
        if (params && Object.keys(params).length > 0) {
            newTokenBuffer.push(JSON.stringify(params));
        }
        var newToken = newTokenBuffer.join(":");

        var token = this.parseCanvasViewParams();
        var url = currentUrl || window.location.href;
        var hash = url.indexOf("#") > 0 ? url.substring(url.indexOf("#") + 1) : "";
        if (token && token.rawToken) {
            hash = hash.replace(token.rawToken, newToken);
        }
        else if (hash) {
            hash = hash + ";" + newToken;
        }
        else {
            hash = newToken;
        }
        if (url.indexOf("#") > 0) {
            url = url.substring(0, url.indexOf("#")) + "#" + hash;
        }
        else {
            url = url + "#" + hash;
        }
        return url;
    }
});