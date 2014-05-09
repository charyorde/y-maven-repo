/**
 * jQuery.squeezable-tabbar
 *
 * @projectDescription Dynamically shrinks widths of elements to fit in available space.
 *
 * @author Ed Venaglia
 *
 * @id jQuery.squeezable_tabbar
 * @id jQuery.fn.squeezable_tabbar
 * @param {Object, String} options Configuration options or the string "unbind" to stop responding to events.
 *	 @option {Array} rules An array of objects containing the following properties:
 *           - {String} technique One of "uniform" (default), "longest-first" or "percentile"
 *           - {String} selector A jQuery selector to locate the child elements to have their styles adjusted.
 *           - {Object} css A map with css styles as keys, and numbers as properties. The number is a value from 0 to 1
 *                          indicating what percentage of pixels to apply to the corresponding style attribute.
 *	 @option {Number} padding A value indicating a fixed number of pixels to compute as padding within the container.
 *                            This value effectively reduces the amount of space you wish to allow elements to fit within.
 *	 @option {String} selector A jQuery selector to locate the contained elements that need to be resized. (default: "> *")
 *	 @option {String} toolTipTitleSelector A jQuery selector to select text to use for a tool tip. (default: null)
 *	 @option {Number} toolTipThreshold If tabs are squeezed by more than this amount, a title attribute will be added to the tab element. (default: 0)
 *	 @option {Boolean} squeezeOnWindowResize Set to true (default), to invoke the "squeeze" event when the window is resized.
 *	 @option {Boolean} forceOnWindowResize Set to true to invoke the "forceSqueeze" event instead of "squeeze" (default:false)
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * Every DOM element matched by the containing jQuery object will be extended to add "squeeze" and "forceSqueeze" events.
 * Fire these events using jQuery(...).trigger("squeeze") to resize the container manually.
 *
 * Note: Events execute asynchronously, after a short delay. This is done to prevent hefty calculations occurring in rapid succession.
 */
(function($) {

    $.fn.squeezable_tabbar = function(options) {

        if (options === "unbind") {
            return this.each(function() {
                var container = $(this);
                doAdjust(false, container, true);
                container.unbind("squeeze")
                         .unbind("forceSqueeze")
                         .removeClass("squeezable")
                         .removeClass("squeeze-on-window-resize")
                         .removeAttr("data-squeezableFullWidth")
                         .removeAttr("data-squeezableEvent");
            });
        }

        function valueOf(property) {
            return parseInt(property) || 0; //Number(/-?\d+(\.\d+)?/.exec(property)[0]);
        }

        function getDashboardTabWidths (forceSizeRecalculation, container) {
            var widths = [];
            var totalWidth = 0;
            var wipeCss = {"width":"","max-width":"","min-width":"","visibility":"hidden"};
            $(options.selector, container).each(function() {
                var me = $(this);
                var width;
                width = forceSizeRecalculation ? null : me.attr("data-squeezableFullWidth");
                if (!width) {
                    // some clone madness because IE7 doesn't quite handle the clone operation properly.
                    var clone = $j($j('<div/>').append(me.clone()).remove().html());
                    clone.attr("id", "temp-element-for-width-calculation").appendTo(container);
                    var dummy = $("#temp-element-for-width-calculation");
                    dummy.css(wipeCss).find("*").css(wipeCss);
                    width = dummy.outerWidth(true);
                    dummy.remove();
                    me.attr("data-squeezableFullWidth", width);
                }
                else {
                    width = Number(width);
                }
                widths.push(width);
                totalWidth += width;
            });
            widths.totalWidth = totalWidth;
            return widths;
        }

        function computeLongestFirstAdjustments(widths, pixels) {
            var widthsAscending = widths.concat().sort(function(a,b){return a-b;});
            var widthsDelta = $.map(widthsAscending, function(value,i) {
                return i > 0 ? value - widthsAscending[i - 1] : value;
            });
            var multiplier = 1;
            var maxWidth = widthsAscending[widthsAscending.length - 1];
            pixels = 0 - pixels; // pixels are negative
            while (pixels > 0) {
                var delta = widthsDelta.pop();
                var possible = delta * multiplier;
                if (possible > pixels) {
                    maxWidth -= pixels / multiplier;
                    break;
                }
                pixels -= possible;
                maxWidth -= delta;
                multiplier++;
            }

            var subpixelError = 0;
            return $.map(widths, function(width) {
                if (width < maxWidth) return 0;
                var newWidth = Math.round(maxWidth + subpixelError);
                subpixelError = (maxWidth + subpixelError) - newWidth;
                return newWidth - width;
            });
        }

        /**
         * Adjusts the tab selected tab items by the specified number of pixels.
         * Since the typical intent here is to reduce the tab widths, the passed
         * value will always be negative.
         * <p>
         * An adjustment definition contains a selector property that defines which
         * children of the tab to modify. A css property contains key/value pairs
         * indicating how much to adjust each css value for each pixel to adjust.
         * <p>
         * <strong>Note:</strong> This adjustment is cumulative, so successive
         * calls with the same value will continue to adjust the size, so to reset
         * the size, it is necessary to invoke this method once passing null.
         * @param tabItems jQuery object containing the tab items to adjust.
         * @param widths an array of tab widths, in pixels.
         * @param ruleName the name of the rule being applied
         * @param adjustDefs and array ot adjust definitions to apply.
         * @param pixels How many pixels to adjust total width by, may be null to
         *     remove any adjustment.
         */
        function adjustCss(tabItems, widths, ruleName, adjustDefs, pixels) {
            var seq = 0;
            var work = {widths:widths,pixels:pixels,changes:{}, adjustDefs:adjustDefs};
            function toString() {
                return this.property + ":(" + this.oldValue + "->" + this.newValue + ")";
            }
            function addChange(index, adjustDef, element, property, oldValue, newValue) {
                if (options.debug !== true) return;
                var name = adjustDef.name || (ruleName + "[" + index + "]");
                var key = element.attr("id") || name + "_" + seq++;
                var cs = work.changes[key] || (work.changes[key] = []);
                cs.push({ property: property, oldValue: oldValue, newValue: newValue, name: name, toString: toString});
            }
            $.each(adjustDefs, function(adjustDefIndex, adjustDef) {
                var elements;
                if (pixels == null) {
                    elements = tabItems;
                    if (adjustDef.selector) elements = elements.find(adjustDef.selector);
                    elements.each(function () {
                        var thisElement = $(this);
                        var cssToApply = {};
                        $.each(adjustDef.css, function(key) {
                            cssToApply[key] = "";
                            addChange(adjustDefIndex, adjustDef, thisElement, key, thisElement.css(key), cssToApply[key]);
                        });
                        thisElement.css(cssToApply);
                    });
                } else {
                    switch (adjustDef.technique || "uniform") {
                        case "percentile":
                            tabItems.each(function () {
                                var thisTabItem = $(this);
                                var thisElement = thisTabItem;
                                if (adjustDef.selector) {
                                    thisElement = thisElement.find(adjustDef.selector);
                                }
                                if (thisElement.length == 0) {
                                    return;
                                } // nothing selected
                                var pixAdjust = pixels * (Number(thisTabItem.attr("data-squeezableFullWidth")) / widths.totalWidth);
                                var dither = 0;
                                var cssToApply = {};
                                $.each(adjustDef.css, function(key, value) {
                                    var adj = Math.round(pixAdjust * value + dither);
                                    dither = (pixAdjust * value + dither) - adj;
                                    cssToApply[key] = (valueOf(thisElement.css(key)) + adj) + "px";
                                    addChange(adjustDefIndex, adjustDef, thisElement, key, thisElement.css(key), cssToApply[key]);
                                });
                                thisElement.css(cssToApply);
                            });
                            break;
                        case "longest-first":
                            var adjustments = computeLongestFirstAdjustments(widths, pixels);
                            tabItems.each(function (i) {
                                var thisElement = $(this);
                                if (adjustDef.selector) {
                                    thisElement = thisElement.find(adjustDef.selector);
                                }
                                if (thisElement.length == 0) {
                                    return;
                                } // nothing selected
                                var pixAdjust = adjustments[i];
                                var cssToApply = {};
                                $.each(adjustDef.css, function(key, value) {
                                    cssToApply[key] = (valueOf(thisElement.css(key)) + pixAdjust * value) + "px";
                                    addChange(adjustDefIndex, adjustDef, thisElement, key, thisElement.css(key), cssToApply[key]);
                                });
                                thisElement.css(cssToApply);
                            });
                            break;
                        case "uniform":
                            elements = tabItems;
                            if (adjustDef.selector) {
                                elements = elements.find(adjustDef.selector);
                            }
                            var dither = 0;
                            elements.each(function () {
                                var thisElement = $(this);
                                var pixAdjust = (pixels / elements.length) + dither;
                                var intAdjust = Math.round(pixAdjust);
                                dither = pixAdjust - intAdjust;
                                var cssToApply = {};
                                var partDither = 0;
                                $.each(adjustDef.css, function(key, value) {
                                    var partAdjust = intAdjust * value + partDither;
                                    var intPartAdjust = Math.round(partAdjust);
                                    partDither = partAdjust - intPartAdjust;
                                    cssToApply[key] = (valueOf(thisElement.css(key)) + intPartAdjust) + "px";
                                    addChange(adjustDefIndex, adjustDef, thisElement, key, thisElement.css(key), cssToApply[key]);
                                });
                                thisElement.css(cssToApply);
                            });
                            break;
                    }
                }
            });
            if (options.debug === true) {
                console.log("Adjust Width: ", work);
            }
        }

        function getPadding() {
            var padding = options.padding;
            if (typeof padding === "function") padding = padding();
            if (padding && padding.jquery) padding = padding.outerWidth();
            padding = isFinite(padding) ? Number(padding) : 0;
            return padding;
        }

        function doAdjust(forceSizeRecalculation, container, clearAll) {
            var widths = clearAll ? {length:0,totalWidth:0} : getDashboardTabWidths(forceSizeRecalculation, container);
            var availableWidth = clearAll || container.innerWidth() - getPadding();
            var tabItems = $(options.selector, container);
            var requiredWidthReduction = clearAll || widths.totalWidth - availableWidth;

            // remove any currently applied padding adjustments
            adjustCss(tabItems, widths, "all", allRules, null);
            if (clearAll) return;

            // check widths, compute a strategy
            for (var i = 0, j = allGroupedRules.length; i < j && requiredWidthReduction > 0; ++i) {
                var rule = allGroupedRules[i];
                var reduceBy = requiredWidthReduction;
                var maxReduceBy = rule.maxAdjust * widths.length;
                if (rule.maxAdjust && rule.maxAdjust > 0 && reduceBy > maxReduceBy) {
                    reduceBy = maxReduceBy;
                }
                requiredWidthReduction -= maxReduceBy;
                adjustCss(tabItems, widths, rule.name, rule.rules, 0 - reduceBy);
            }

            if (options.toolTipTitleSelector) {
                tabItems.each(function() {
                    var tabItem = $(this);
                    var shrink = Number(tabItem.attr("data-squeezableFullWidth")) - tabItem.outerWidth();
                    var title;
                    if (shrink > options.toolTipThreshold &&
                        (title = tabItem.find(options.toolTipTitleSelector).text())) {
                        tabItem.attr("title", title);
                    } else {
                        tabItem.removeAttr("title");
                    }
                });
            }
        }

        function flattenRules() {
            var lastGroup = {name:"default-rule", rules:[]}; // contains all simple rules
            for (var i = 0, j = options.rules.length; i <= j; ++i) {
                var rule = i < j ? options.rules[i] : lastGroup;
                if (!rule.hasOwnProperty("rules")) {
                    lastGroup.rules.push(rule);
                    continue;
                }
                if (rule.rules.length == 0) continue;
                allGroupedRules.push(rule);
                $.each(rule.rules, function(i,rule) { allRules.push(rule) });
            }
        }

        var allRules = [];
        var allGroupedRules = [];

        options = $.extend({}, $.fn.squeezable_tabbar.defaults, options);
        flattenRules();

        // wire the window resize handler if it has not been bound.
        if (!$.fn.squeezable_tabbar.resizeHandler.bound) {
            $.fn.squeezable_tabbar.resizeHandler.bound = true;
            $(window).resize($.fn.squeezable_tabbar.resizeHandler);
        }

        return this.each(function() {

            function requestResize(force) {
                if (pendingAdjustment) {
                    window.clearTimeout(pendingAdjustment);
                }
                forceSizeRecalculation |= Boolean(force);
                pendingAdjustment = window.setTimeout(function() {
                    pendingAdjustment = null;
                    if (container.hasClass("squeezable")) {
                        doAdjust(forceSizeRecalculation, container, false);
                    }
                    forceSizeRecalculation = false;
                }, 250);
            }

            var container = $(this);
            var pendingAdjustment = null;
            var forceSizeRecalculation = false;
            var unbind = false;

            container.addClass("squeezable")
                     .unbind("squeeze")
                     .unbind("forceSqueeze")
                     .bind("squeeze", function() { requestResize(false); })
                     .bind("forceSqueeze", function() { requestResize(true); });
            if (options.squeezeOnWindowResize) {
                container.addClass("squeeze-on-window-resize")
                         .attr("data-squeezableEvent", options.forceOnWindowResize ? "forceSqueeze" : "squeeze");
            } else {
                container.removeClass("squeeze-on-window-resize")
                         .removeAttr("data-squeezableEvent");
            }

            requestResize(true);
        });
    };

    $.fn.squeezable_tabbar.resizeHandler = function() {
        $(".squeeze-on-window-resize[data-squeezableEvent]").each(function() {
            var squeezable = $(this);
            squeezable.trigger(squeezable.attr("data-squeezableEvent"));
        })
    };

    $.fn.squeezable_tabbar.defaults = {
        rules: [{ technique: "longest-first", selector: "> *", css: {"width": 1} }],
        padding: 0,
        selector: "> *",
        squeezeOnWindowResize: true,
        forceOnWindowResize: false,
        toolTipTitleSelector: null,
        toolTipThreshold: 0,
        debug: false
    };
})(jQuery);
