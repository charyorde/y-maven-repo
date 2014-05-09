/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

(function($){
    $.placeHeld = function(el, options){
        var base = this;
        base.$el = $(el);
        base.el = el;
        base.$el.data("placeHeld", base);
        base.placeholderText = base.$el.attr("placeholder");

        base.init = function(){
            base.options = $.extend({},$.placeHeld.defaultOptions, options);
            base.$el.bind('blur', base.holdPlace).bind('focus', base.releasePlace).trigger('blur');
            base.$el.parents('form').bind('submit', base.clearPlace);
        };
        // Hold with the default value attribute
        base.holdPlace = function() {
            var value = base.$el.val();
            if (!value) base.$el.val(base.placeholderText).addClass(base.options.className);
        };
        // Refill with the default value attribute
        base.releasePlace = function() {
            var value = base.$el.val();
            if (value == base.placeholderText) base.$el.val('').removeClass(base.options.className);
        };
        // Refill with the default value attribute
        base.clearPlace = function() {
            var value = base.$el.val();
            if (value == base.placeholderText && base.$el.hasClass(base.options.className)) base.$el.val('');
        };
        base.init();
    };

    $.placeHeld.defaultOptions = { className: "placeheld" };

    $.fn.placeHeld = function(options) {

        // Check for placeholder attribute support
        if (!!("placeholder" in $('<input>')[0])) return;

        return this.each(function() {
            (new $.placeHeld(this, options));
        });
    };

    $(function() {
        $("input[placeholder]").placeHeld();
    });
})(jQuery);
