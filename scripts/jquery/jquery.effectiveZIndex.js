/**
 * jQuery plugin for inspecting z-indexes and stacking contexts
 *
 * This plugin defines three methods: effectiveZIndex(),
 * stackingContexts(), and stackingContext().
 *
 * effectiveZIndex([options]) : Returns the effective z-index of the
 * receiver.  By default this is the z-index of the element according to
 * the body stacking context.  If you want the z-index relative to
 * a more specific context then give an options object with a "context"
 * option, which should be the element that defines the stacking context
 * that you want to work in.  Or you can give a "relativeTo" option
 * instead, which takes an element and returns the z-index of the
 * receiver in the smallest stacking context that contains both the
 * receiver and the "relativeTo" element.
 *
 * stackingContexts([options]) : Returns all of the elements that
 * contain the receiver and that define new stacking contexts, including
 * body, ordered from innermost to outermost element.  Accepts an
 * options object; if a "relativeTo" option is given only contexts that
 * contain both the receiver and the "relativeTo" value will be
 * returned.
 *
 * stackingContext([options]) : Works just like stackingContexts()
 * except that this method only returns the smallest stacking context
 * that contains the receiver, or that contains both the receiver and
 * the "relativeTo" element if a "relativeTo" option is given.
 *
 * Examples:
 *
 *     var zIndex = $modalA.effectiveZIndex({ relativeTo: $modalB });
 *
 *     $menu.css('z-index', $modalA.effectiveZIndex({ relativeTo: $menu }) + 5);
 *
 * Requires jQuery 1.6 or later and ECMAScript 5 array methods.  You can
 * add the necessary array methods to a browser that does not support
 * ECMAScript 5 using a polyfill, such as:
 * https://github.com/jivesoftware/jiverscripts/blob/master/src/compat/array.js
 *
 * @depends path=/resources/scripts/lib/jiverscripts/src/compat/array.js
 */
(function($) {
    var indexExp = /^-?\d+$/;

    function isPositioned($elem) {
        var pos = $elem.css('position');
        return pos == 'absolute' || pos == 'relative' || pos == 'fixed';
    }

    function hasZIndex($elem) {
        var index = $elem.css('z-index');
        return typeof index == 'number' || (index && index.match(indexExp));
    }

    // TODO: Gecko browsers create new stacking contexts for elements
    // with opacity less than 1.
    // https://developer.mozilla.org/en/Understanding_CSS_z-index/The_stacking_context
    function isStackingContext($elem) {
        return (isPositioned($elem) && hasZIndex($elem)) || $elem.is('body');
    }

    function contains(elemA, $elemB) {
        return $elemB.toArray().every(function(b) {
            return $.contains(elemA, b);
        });
    }

    jQuery.fn.effectiveZIndex = function(options) {
        var $context;

        if (options && options.context) {
            $context = $(options.context);
        } else if (options && options.relativeTo) {
            $context = this.stackingContexts(options);
        } else {
            $context = $('body');
        }

        var ancestors = []
          , current = this;
        while (current.length > 0) {
            if (current[0] !== $context[0]) {
                ancestors.push(current);
            } else {
                break;
            }
            current = current.parent();
        }

        // The ancestors array contains the receiver element(s) with all
        // any ancestors that are contained inside $context in order
        // from innermost to outermost element.  This expression
        // iterates over that array and returns the z-index value of the
        // last element that has a z-index value.  If none of the
        // elements examined have a z-index value, returns 0 as the
        // default.
        return ancestors.reduce(function(zIndex, elem) {
            var $elem = $(elem);

            if (isStackingContext($elem)) {
                return parseInt($elem.css('z-index'), 10);
            } else {
                return zIndex;
            }
        }, 0);
    };

    jQuery.fn.stackingContexts = function(options) {
        var $related = (options && options.relativeTo) ? $(options.relativeTo) : this;
        var $self = this;
        var commonContexts = this.parents().filter(function() {
            var $elem = $(this)
              , isCommon = contains(this, $self) && contains(this, $related);

            return isCommon && isStackingContext($elem);
        });

        return commonContexts;
    };

    jQuery.fn.stackingContext = function(options) {
        return this.stackingContexts(options).filter(':first');
    };
})(jQuery);
