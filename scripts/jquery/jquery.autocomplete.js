/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*
 * Renders content in an autocomplete widget intended to be shown next
 * to a text input.
 *
 * @depends path=/resources/scripts/jquery/jquery.pop.js
 */

(function($) {

    function position($context) {
        return {
            top: $context.offset().top + $context.outerHeight(),
            left: $context.offset().left,
            'min-width': $context.width()
        };
    }

    $.fn.autocomplete = function(options) {
        var opts = $.extend({}, $.fn.autocomplete.defaults, options);

        this.each(function() {
            var $context = opts.context,
                $self = $(this),
                $container = $('body'),
                $autocomplete = $('<div class="j-pop j-autocomplete" />').addClass(opts.addClass);

            $autocomplete
                .append($self.show().addClass("j-pop-main j-menu"))
                .css(position($context))
                .appendTo($container);

            $self.autoclose($.extend({}, opts, {
                onClose: removeAutocomplete,
                decoration: $autocomplete
            }));

            function removeAutocomplete(event) {
                $autocomplete.remove();
                opts.onClose.apply($self);
            }
        });

        return this;
    };

    $.fn.autocomplete.defaults = {
        addClass: null,
        context: $(),
        onClose: $.noop
    };

})(jQuery);
