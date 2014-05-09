/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Displays a menu using a dark popover.
 *
 * @class
 * @param {Function|jQuery|DOMElement} template function that generates content to
 * display in the menu, or just content to display
 * @param {jQuery|DOMElement} control element that should open and close
 * the menu on click
 * @param {Object} [menuOpts] options to pass to jQuery#popover()
 *
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/jquery/jquery.popover.js
 */
jive.MenuView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    protect.init = function(template, control, menuOpts) {
        var view = this;

        this.template = typeof template == 'function' ? template : function() {
            return template;
        };

        this.$control = $(control);
        this.$control.click(function(event) {
            var $menu, $link = $(this);

            // close the menu if it is already open
            if ($link.data('menu')) {
                $link.data('menu').trigger('close');

            // open the menu if it is not open yet
            } else {
                $menu = view.template();

                $menu.popover($.extend({
                    context: $link,
                    onClose: function() {
                        $link.removeData('menu');
                        view.emit('close');
                    }
                }, menuOpts || {}));

                $link.data('menu', $menu);
                view.emit('open');
            }

            event.preventDefault();
        });
    };

    /**
     * Closes any open menus.
     */
    this.close = function() {
        this.$control.each(function() {
            var $link = $(this);

            if ($link.data('menu')) {
                $link.data('menu').trigger('close');
            }
        });
    };
});
