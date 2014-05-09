/*globals jive jQuery $j Node kjs */

jive.namespace('util');

/**
 * jive.util
 *
 * Namespace for a collection of utility methods.
 */
(function($) {
    function isNode(item) {
        // Just using item instanceof Node, fails in IE.  Use some duck type
        // checking to determine whether the item is a node
        return typeof item == "object" && "nodeType" in item && item.nodeType === 1 && item.cloneNode;
    }

    function successfulPromise() {
        var promise = new jive.conc.Promise();
        promise.emitSuccess.apply(promise, arguments);
        return promise;
    }

    jive.util = {

        /**
         * escapeHTML(input) -> string
         * - input: may be any element but strings, jQuery instances, or Node
         *   instances are encouraged
         *
         * Given a string as input returns the same string with any HTML
         * content escaped.
         *
         * Given a jQuery instance or an instance of Node returns the HTML
         * representation of the given instance.  Nothing is escaped in this
         * case.
         *
         * Given any other value converts the value to a string by calling its
         * `toString()` method, escapes any HTML content, and returns the
         * result.
         */
        escapeHTML: function(input) {
            if (input instanceof $ || isNode(input)) {
                return $('<div/>').html(input).html();
            } else {
                return $('<div/>').text(String(input)).html();
            }
        },

        /**
         * unescapeHTML(input) -> string
         * - input(String): string containing HTML entities
         *
         * Performs the reverse operation of escapeHTML().  Given a string as
         * input returns the same string with any HTML entities replaced with
         * the characters that they represent.
         */
        unescapeHTML: function(input) {
            return $('<div/>').html(String(input)).text();
        },

        /**
         * Converts an array of elements in to an array of the values of each element (generally intended for form
         * elements.
         * - elems(Array): containing elements that have associated values retrievable with the .val() jquery function
         *                  -- these are usually form elements.
         */
        convertElementsToValues: function(elems) {
            var values = [];
            $.each($(elems), function() {
                values.push($(this).val());
            });

            return values;
        },

        /**
         * Dynamically create a form based on a url
         * @param options: Object with the following properties
         *      url - url to use
         *      method - method form should use, uses get by default
         */
        createDynamicForm:function(options){
            var $form = $j('<form />');
            if(options.method.toLowerCase() != 'get'){
                $form.attr('method', options.method);
            }
            var urlParts = options.url.split(/[&?]/);
            $form.attr('action', urlParts[0]);
            // remove non params
            urlParts.shift();
            // for each param, add param to the form as a hidden element
            urlParts.forEach(function(element){
                var paramKeyVal = element.split(/[=]/);
                $form.append($j('<input name="' + paramKeyVal[0] + '" type="hidden"/>').val(decodeURIComponent(paramKeyVal[1])));
            });

            return $form;
        },
        /**
         * Create a dynamic form and submit it
         * @param options: Object with the following properties
         *      url - url to use
         *      method - method form should use, uses get by default
         */
        createAndSubmitDynamicForm:function(options){
            jive.util.createDynamicForm(options).appendTo($j(document.body)).submit();
        },

        /*
         * Given a form token name fetches a token and emits success on
         * its return promise when the token is ready.
         *
         * The promise is emitted with a token object of the form:
         * { "jive.token.name": <name>, <name>: <value> }
         */
        securedPost: function(tokenName) {
            var promise = new jive.conc.Promise();

            $j.ajax({
                url: jive.rest.url('/legacy_token/'+ tokenName),
                type: 'POST',
                dataType: 'json',
                success: function(tokens) {
                    var token = { 'jive.token.name': tokenName };
                    token[tokenName] = tokens[0];

                    promise.emitSuccess(token);
                },
                error: function(xhr, textStatus, errorThrown) {
                    promise.emitError(xhr, textStatus, errorThrown);
                }
            });

            return promise;
        },

        securedForm: function(form) {
            var $form = $j(form)
              , tokenName = form.find('input[name="jive.token.name"]').val();

            var tokenPromise = tokenName ? jive.util.securedPost(tokenName) : successfulPromise({});

            return tokenPromise.map(function(token) {
                $form.find('input[name="'+ tokenName +'"]').val(token[tokenName]);
                return $form;
            });
        },

        /**
         * truncateStr - simple function to truncate a string and add an ellipsis or other string
         * @param str - string to truncate
         * @param maxChars - Optional, defaults to 49, number of characters to truncate the string to
         * @param appendStr - Optional, defaults to '...', string to append to the end of the truncated string 
         */
        truncateStr:function(str, maxChars, appendStr){
            maxChars = maxChars || 49;
            appendStr = appendStr || '...';

            return str.length >  maxChars ? str.substring(0, maxChars) + appendStr : str;
        },
        /**
         * lazyLoadJSBySels - used to dynamically load a set of scripts when a particular event occurs
         * on any element that matches the elements in the selector arrray
         * @param selectorArray - array of selectors to apply event to
         * @param evtType - type of event that will trigger lazy load
         * @param requireNS - namespace used to dynamically load js files
         * @param jsLoadedHandler - optional, handler called when js files are loaded
         */
        lazyLoadJSBySels:function(selectorArray, evtType, requireNS, jsLoadedHandler){
            $j(document).ready(function() {
                var activated = false;

                $j(selectorArray.join(', ')).one(evtType, function(event) {
                    var link = $j(this);
                    if (!activated) {
                        define([requireNS], function() {
                            if(jsLoadedHandler){
                                jsLoadedHandler();
                            }
                            link.trigger(event.type);
                        });
                        activated = true;
                    }

                    if (event.type == 'click' || event.type == 'submit') {
                        event.preventDefault();
                    }
                });
            });
        },
        /**
         * lazyLoadJSByFns - Used to dynamically load a set of scripts when a particular function is called.
         * Function can be namespaced or in the global window space. 
         * @param triggerFns - Array of strings representing functions that when called will dynamically load js files.
         * Functions can be name spaced.
         * @param requireNS - namespace used to dynamically load js files
         * @param jsLoadedHandler - optional, handler called when js files are loaded
         */
        lazyLoadJSByFns:function(triggerFns, requireNS, jsLoadedHandler){
            $j(document).ready(function() {
                triggerFns.forEach(function(triggerFn){
                    var activated = false;
                    var namespaceParts = triggerFn.split('.');
                    var fnStr = namespaceParts.pop();
                    // add fn to window namespace
                    jive.namespace.apply(window, [namespaceParts.join('.')]);
                    // helper function to get reference to a namespace from an array of strings
                    function getNSRef(nsArray){
                        return nsArray.reduce(function(prevVal, currentVal){
                            return prevVal[currentVal];
                        }, window);
                    }
                    // get reference to newly created namespace
                    var namespaceRef = getNSRef(namespaceParts);

                    // point to function
                    namespaceRef[fnStr] = function(){
                        define([requireNS], function() {
                                if (!activated) {
                                    if(jsLoadedHandler){
                                        jsLoadedHandler();
                                    }
                                    getNSRef(namespaceParts)[fnStr](arguments);
                                    activated = true;
                                }
                            });
                    };
                });
            });
        },

        /**
         * extractDataAttributes
         *
         * Takes a DOM element as an argument and returns a hash of its data attributes with the
         *      "data-" prefix removed. If ignoreCamelization is false (default) the returned string is camel-cased.
         *
         * Does type coercion values if they match the following patterns:
         *      "true" => true
         *      "false" => false
         *
         *
         * @deprecated Use jQuery.data instead
         * @param element the DOM node to inspect for data attributes
         * @param ignoreCamelization {boolean}
         * @requires String.prototype.camelize
         */

        extractDataAttributes: (function(dataPattern, boolPattern, jsonPattern) {
            /*
             * Filters based on value. Could be made more robust in the future to handle values other than just
             * booleans.  Coercing numbers to be numbers rather than strings comes to mind.
             */
            function filter(value) {
                if (boolPattern.test(value)) {
                    return value === 'true' ? true : false;
                } else if (jsonPattern.test(value)) {
                    return JSON.parse(value);
                } else {
                    return value;
                }
            }


            return function(element, ignoreCamelization) {
                var output = {};

                $j.each($j(element)[0].attributes, function() {
                    if (dataPattern.test(this.name)) {
                        var name = this.name.replace(dataPattern, '');
                        !ignoreCamelization && (name = name.camelize());

                        output[name] = filter(this.value);
                    }
                });

                return output;
            }
        })(/^data-/, /^(true|false)$/i, /^\{/i),

        /**
         * Given a string representing HTML parses script tags and removes them.
         * Returns a two-element array where the first element is the input html
         * with script tags removed and the second element is a function that will
         * execute the parsed script tags when invoked.
         */
        separateScripts: (function() {
            var scriptTag = /(<script[^>]*>)([\s\S]*?)<\/script>/ig,
                scriptSrc = /\s+src=["']([^'">]+)['"]/i,
                scriptType = /\s+type=["']([^'">]+)['"]/i,
                jsType = /^text\/javascript/i;

            return function(html, discardScripts) {
                var depCounter = 0;

                // Produces a unique token that can be used to represent
                // a KJS dependency.
                function makeDep() {
                    depCounter += 1;
                    return 'separateScripts-dep-'+ (new Date()).getTime() +'-'+ depCounter;
                }

                // Track dependencies list with initial trigger dependency.
                var firstDep = makeDep()
                  , deps = [firstDep];

                var withoutScripts = html.replace(scriptTag, function(match, openingTag, body) {
                    var type = (openingTag.match(scriptType) || [])[1]
                      , src = (openingTag.match(scriptSrc) || [])[1]
                      , thisDep;

                    if (!type || type.match(jsType)) {
                        if (src && !discardScripts) {
                            // Loads the script and runs it after the previous
                            // script external has run.  Also depends on
                            // firstDep to ensure that the script will not be
                            // run until the function returned from this
                            // function is invoked.
                            kjs.load(src, deps.slice(-1).concat(firstDep));

                            // Add each external script as a dependency of the next
                            // external or inline script.
                            deps.push(src.split('?')[0]);
                        } else if (body && !discardScripts) {
                            thisDep = makeDep();

                            // Runs the inline script after the previous external
                            // script has run.  Also depends on
                            // firstDep to ensure that the script will not be
                            // run until the function returned from this
                            // function is invoked.
                            kjs.run($.globalEval.bind($, body), deps.slice(-1).concat(firstDep), [thisDep]);

                            // Add an auto-generated dependency on each
                            // inline script to make sure that all
                            // scripts run in order.
                            deps.push(thisDep);
                        }

                        return '';
                    } else {
                        // Preserve non-JavaScript script tags.
                        return match;
                    }
                });

                return [withoutScripts, function(callback) {
                    if (callback) {
                        kjs.run(callback, deps.slice(-1).concat(firstDep));
                    }

                    kjs.sat(firstDep);  // Sets parsed scripts running.
                }];
            };
        })(),

        withoutScripts: function(html) {
            var htmlAndScripts = jive.util.separateScripts(html, true);
            return htmlAndScripts[0];
        },

        /**
         * Attempts to fit long strings without natural breaks into their containing dom nodes.
         *
         * @param {string} myText
         * @param {jQuery} $inside
         * @param {jQuery} $outside
         */
        fitTextWithinNode: function(myText, $inside, $outside) {
            var lower = 0
              , upper = myText.length
              , length = upper
              , threshold = length * 0.20  // accept a 20% margin of error on text size
              , lastLength;
    
            /* remove text until it fits */
            do {
                if (length < myText.length) {
                    $inside.text(myText.slice(0, length) +'\u2026');
                } else {
                    $inside.text(myText.slice(0, length));
                }

                if (($inside.outerHeight() > $outside.outerHeight()) || $inside.outerWidth() > $outside.outerWidth()) {
                    upper = length;
                } else {
                    lower = length;
                }

                lastLength = length;
                length = Math.floor((lower + upper) / 2);
            } while (lower < upper - threshold || lastLength != lower);
        },

        /**
         * Updates the favicon url.
         *
         * @param path {string} the url for the new icon
         */
        setFavicon : function(path) {
            // Just updating href attributes does not work in all browsers.
            $j('link[rel~=shortcut]').remove();
            $j('<link rel="shortcut icon" type="image/x-icon" />').attr('href', path).appendTo('head');
        },

        /**
         * Test to see if this string matches the argument regardless of case.  Both strings are trimmed before comparison.
         *
         * @return true if the strings match.
         **/
        equalsIgnoreCaseAndPadding: function(a, b) {
            return a && b && a.toLowerCase().trim() == b.toLowerCase().trim();
        }
    };
})(jQuery);
