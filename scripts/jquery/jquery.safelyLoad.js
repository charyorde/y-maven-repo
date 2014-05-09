/*jslint browser:true evil:true */
/*extern jQuery */

/**
 * IE does not handle JavaScript includes or inline scripts in dynamically
 * injected HTML well.  This is a special case of jQuery.load() that loads and
 * evaluates JavaScript in a separate step if necessary.
 *
 * @depends path=/resources/scripts/jive/util.js
 * @param {string} url
 * @param {object} [params={}] optional jQuery ajax parameters
 * @param {function} [callback=jQuery.noop] optional callback function
 * @return {jQuery}
 */
(function($) {
    $.fn.safelyLoad = function(url, params, callback) {
        var args          = Array.prototype.slice.call(arguments, 1), // exclude the 'url' argument
            selector      = '';


        /*
         * Normalize the arguments
         */
        // url and selector
        if (url.indexOf(' ') > -1) {
            // the url here can also contain selectors just like urls passed to jQuery.load (http://api.jquery.com/load/)
            selector = url.split(/\s+/);
            url      = selector.shift();
            selector = selector.join(' ');
        }

        // params and callback
        params   = { url: url };
        callback = $.noop;

        if (args.length === 1) {
            // either 'params' OR 'callback' was passed
            if (typeof args[0] === 'function') {
                callback = args.shift();
            } else {
                params   = $.extend({ url: url }, args.shift());
            }
        } else if (args.length > 0) {
            // 'params' AND 'callback' were both passed
            params   = $.extend({ url: url }, args.shift());
            callback = args.shift();
        }

        params.type = !params.type && 'data' in params ? 'POST' : params.type;



        /*
         * Make the ajax call
         */
        var that = this;
        that.xhrObj = $.ajax($.extend({}, $.fn.safelyLoad.defaults, params, { complete : function(res, status) {
                // If successful, inject the HTML into all the matched elements
                if ( status === "success" || status === "notmodified" ) {
                    var htmlAndScripts = jive.util.separateScripts(res.responseText)
                      , html = htmlAndScripts[0]
                      , scripts = htmlAndScripts[1];

                    that.html(selector ?
                        // Create a dummy div to hold the results
                        jQuery("<div>")
                            // inject the contents of the document in, removing the scripts
                            // to avoid any 'Permission Denied' errors in IE
                            .append(html)

                            // Locate the specified elements
                            .find(selector) :

                        // If not, just inject the full result
                        html);

                    // Execute embedded scripts.
                    scripts(function() {
                        // After all scripts are loaded invoke the callback
                        // given to `safelyLoad()`.
                        that.each(callback, [res.responseText, status, res]);
                    });

                } else {
                    that.each(callback, [res.responseText, status, res]);
                }
            }
        }));


        return that.xhrObj;
    };

    $.fn.safelyLoad.defaults = {
        data     : {},
        dataType : 'html',
        type     : 'GET'
    };
})(jQuery);
