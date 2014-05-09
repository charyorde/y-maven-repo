/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*
 * Some common code for jquery.popover.js, jquery.lightbox_me.js, and
 * jquery.autocomplete.js.
 */

(function($) {

    function autoclose(options) {
        var opts = $.extend({}, autoclose.defaults, options),
            $self = this,
            decoration = opts.decoration || $self;

        $self.bind('close', removePop);
        $self.delegate(opts.closeSelector, 'click', removePop);
        $(window).keyup(observeKeyPress);

        function removePop(event) {
            $(".popover-iframe-interceptor").remove();
            $self.unbind('close', removePop);
            $self.undelegate(opts.closeSelector, 'click', removePop);
            $(opts.closeOnClickSelector).unbind('click', clickOutsidePop);
            $(window).unbind('keyup', observeKeyPress);

            if (!event || event.type != 'close') {
                // In case any other listeners are bound to the close event
                // and this invocation of removePopover() was triggered by
                // a click event or something.
                $self.trigger('close');
            }

            if (event && event.type == 'close') {
                /* stops propagation of the "close" event, in case there are any other close events
                * listening in...for example, the lightbox plugin!
                 */
                event.stopPropagation();
            }

            if (event && event.type == 'click') {
                event.preventDefault();
            }

            return opts.onClose.call(this, event);
        }

        function clickOutsidePop(event) {
            var isContained = $(event.target).closest(decoration).length > 0;

            var isInDom =
                $(event.target).is(opts.closeOnClickSelector) ||
                $(event.target).parents(opts.closeOnClickSelector).length > 0;

            if (!isContained && isInDom) {
                $self.trigger('close');
            }
        }

        function observeKeyPress(e) {
            if ((e.keyCode == 27 || (e.DOM_VK_ESCAPE == 27 && e.which === 0)) && opts.closeEsc) {
                $self.trigger('close');
            }
        }

        if (opts.closeOnClick) {
            setTimeout(function() {
                if (opts.clickOverlay) {
                    $('iframe:visible').each(function() {
                        var me = $(this);
                        var position = me.position();
                        var css = {
                            "position": "absolute",
                            "padding": "0",
                            "marign": "0",
                            "z-index": "990",
                            "top": position.top + "px",
                            "left": position.left + "px",
                            "width": me.outerWidth() + "px",
                            "height": me.outerHeight() + "px"
                        };
                        $("<div/>").addClass("popover-iframe-interceptor").css(css).insertAfter(me);
                    });
                }

                // Bind body click event after a delay to prevent click that
                // initially caused the popover to open from causing it to
                // immediately close.
                $(opts.closeOnClickSelector).click(clickOutsidePop);
            }, 0);
        }
    }

    autoclose.defaults = {
        clickOverlay: true,  // draws invisible rectangles over iframes to intercept click events
        closeEsc: true,      // should pop close when the escape key is pressed?
        closeOnClick: true,  // should pop close when clicking elsewhere in the page?
        closeOnClickSelector: 'body',
        closeSelector: '.close',  // clicking elements in pop that match this selector will close pop
        decoration: null,         // ancestor of content - clicking outside of this element will trigger 'close'
        onClose: $.noop           // callback to invoke when 'close' event occurs
    };

    $.fn.autoclose = autoclose;

})(jQuery);
