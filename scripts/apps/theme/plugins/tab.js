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
 * @depends path=/resources/scripts/jquery/plugin_utils.js
 */
;(function($) {
    function Tab(element, options) {
        this.element = $(element);
        this.options = $.extend({}, $.fn.tab.defaults, options || {});
    }

    Tab.prototype = {
        constructor: Tab,

        show: function() {
            var instance  = this,
                $target   = this.element,
                $li       = this.element.closest('li'),
                eventInfo = { relatedTarget : $li.siblings('.' + this.options.activeClass)[0] };

            function shown() {
                var activeClass = instance.options.activeClass;

                instance.element.closest('li').addClass(activeClass).siblings().removeClass(activeClass);
                $(instance.element.data('target')).addClass(activeClass).siblings().removeClass(activeClass);

                instance.element.trigger(new $.Event('shown', eventInfo));
            }

            $li.not('.' + this.options.activeClass).each(function() {
                if (!instance.options.async) {
                    $target.trigger(new $.Event('show', eventInfo));
                    shown();
                } else {
                    var deferred = new $.Deferred();
                    deferred.then(shown);
                    $target.trigger(new $.Event('show', eventInfo), deferred);
                }
            });

            return this.element;
        }
    };


    // build the plugin
    $.pluginUtils.declare('tab', Tab, {
        activeClass : 'active',
        async       : false
    });


    // Data API
    $(function() {
        $(document.body).filter('.data-api').on('click.tab.data-api', '[data-plugin=tab]', function(e) {
            e.preventDefault();
            var $target = $(this);
            if ($target.is('a[href=#]')) {
                e.preventDefault();
            }

            $target.tab('show');
        });
    })
})(jQuery);
