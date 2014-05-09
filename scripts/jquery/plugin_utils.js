/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends path=/resources/scripts/jquery/jquery.js
 */
;(function($) {
    $.pluginUtils = {
        declare : function(id, Constructor, defaults) {
            if (typeof $.fn[id] === 'function') {
                throw new Error("A jQuery plugin named '" + id + "' already exists");
            }

            $.fn[id] = function() {
                var options = $.isPlainObject(arguments[0])    ? arguments[0] : {},
                    method  = typeof arguments[0] === 'string' ? arguments[0] : undefined,
                    args    = [].slice.call(arguments, 1);

                return this.each(function() {
                    var $this   = $(this),
                        instance = $this.data(id);

                    if (!instance) {
                        $this.data(id, (instance = new Constructor(this, options)));
                    }

                    // set the default options
                    var data = $.extend({}, $this.data(), options);
                    delete data[id];
                    $.each(data, function(option, value) {
                        instance.options[option] = value;
                    });

                    // call a method on the instance, if applicable
                    if (method) {
                        instance[method].apply(instance, args);
                    }
                });
            };

            $.fn[id].Constructor = Constructor;
            $.fn[id].defaults    = defaults || {};


            return $.fn[id];
        }
    };
})(jQuery);
