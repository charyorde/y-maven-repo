/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Theme');

/**
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 * @depends path=/resources/scripts/jquery/jquery.form.js
 * @param {jive.theme} soy
 * @param {function} fieldFactory
 */
define('jive.Theme.MenuView', ['jquery'], function($) {
    return function MenuView(soy, fieldFactory) {
        var self        = jive.conc.observable({}),
            adjustment  = { top: 0, left: 0 },
            cssValues   = {},
            menuId      = '',
            orientation = 'below',
            soyData     = {},
            $menu       = null,
            $node       = null;


        /**
         * Attach all menu events
         */
        var attachEvents = function() {
            // buttons
            $menu.find('button').click(function() {
                var $this = $(this);

                $this.closest('ul').children().removeClass('active');
                $this.closest('li').addClass('active');

                $this.trigger('cssUpdate');
            });

            // open/close sliding menu sections
            $menu.find('.disclosure-item').click(function() {
                $(this).toggleClass('open').next().slideToggle(400);
            });

            // background position widgets
            $menu.find('.backgroundPosition a').click(function(e) {
                e.preventDefault();

                var $td = $(this).closest('td');
                $td.addClass('selected')
                    .closest('table').find('td.selected').not($td).removeClass('selected');
            });

            $menu.find('a[data-action]').click(function(e) {
                e.preventDefault();
                var data = $(this).data();

                switch (data.action) {
                    case 'changeImage':
                        resetCustomImageControl(this);
                        $(this).closest('form').find(':file, [data-widget-type=fileName]').each(function() {
                            var $this = $(this),
                                name  = $this.is(':file') ? $this.data('image-name') : $this.attr('name');

                            if ($this.is(':file')) {
                                self.emit('imageFileReset', name);
                            }
                        });

                        break;

                    case 'deleteTheme':
                        if (window.confirm(soy.confirmThemeDelete({ themeName: data.name }))) {
                            self.emit('delete', data.id);
                        }
                        break;

                    case 'setCssValue':
                        var $this       = $(this),
                            $selectable = $this.closest('.j-js-selectable');

                        if ($selectable.length > 0) {
                            activateItem($selectable);
                        } else {
                            var name = $this.addClass('active').data('name');
                            $('[data-name=' + name + ']').not(this).removeClass('active');
                        }

                        $(this).trigger('cssUpdate');
                        break;

                    case 'setTheme':
                        self.reset();
                        self.emit('setSkin', data.id);
                        break;
                }
            });
        };

        /**
         * Sync the fields in the $menu with their corresponding CSS values
         */
        var populateMenu = function() {
            // build field objects from inputs
            $menu.find(':input').each(function() {
                var $input = $(this),
                    value  = cssValues[$input.attr('name')];
                fieldFactory($input, cssValues).setValue(value);
            });

            // populate the buttonStyle buttons and certain anchor controls
            $menu.find('a[data-action=setCssValue], button[data-name=buttonStyle]').each(function() {
                var $this = $(this),
                    data  = $this.data();

                // add the 'active' class to the anchor if its value has been set
                if (cssValues.hasOwnProperty(data.name) && cssValues[data.name] === data.value) {
                    var $listItem = $this.parent();
                    if ($listItem.is('.j-js-selectable')) {
                        activateItem($listItem);
                    } else {
                        $this.addClass('active');
                    }

                    // bgPosition needs it's parent to have the class 'selected'
                    $this.filter('[data-type=bgPosition]').parent().addClass('selected');
                }
            });
        };

        var activateItem = function($item) {
            $item.closest('.j-js-selectableList').children().removeClass('active');
            return $item.addClass('active');
        };

        var resetCustomImageControl = function(referenceNode) {
            var $form = $(referenceNode).closest('form');
            $form.removeClass('inProgress complete').addClass('default').find('.filename').text('');
            $form.find(':file, [data-widget-type=fileName]').val('');

            return $form;
        };

        var handleCssUpdate = function(e, data) {
            var $target  = $(e.target),
                name     = $target.data('name') || $target.attr('name');

            if (data === '') {
                // unset this css value
                self.emit('deleteCssValue', name);
            } else {
                var hash = $.extend({}, $.isPlainObject(data) ? data : {});

                // handle special cases
                switch (true) {
                    case $target.is('a, button'):
                        hash[name] = $target.data('value');
                        break;

                    case $target.is(':text, :radio:checked'):
                        hash[name] = data || $target.val();
                        break;

                    case $target.is(':checkbox'):
                        if ($target.is(':checked')) {
                            hash[name] = true;
                        } else {
                            hash = {};
                            self.emit('deleteCssValue', name);
                        }
                        break;
                }

                self.emit('updateCssValues', hash);
            }

            return false;
        };

        var handleImageUpload = function(e, file) {
            var values = {};
            values[file.id]          = file.url;
            values[file.id + 'Url']  = file.displayUrl;
            values[file.id + 'Name'] = file.name;
            values[file.id] = file.url;

            // logo needs special treatment
            if (file.id === 'headerLogo') {
                values.headerLogo    = file.url;
                values.headerLogoUrl = file.displayUrl;
                self.emit('logoImageUpdated', values);
            }

            $(e.target).trigger('cssUpdate', values);

            return false;
        };


        self.setAdjustment = function(_adjustment) {
            adjustment = _adjustment;
            return self;
        };

        self.setCssValues = function(values) {
            cssValues = values;
            return self;
        };

        self.setMenuId = function(_menuId) {
            menuId = _menuId;
            return self;
        };

        self.setOrientation = function(_orientation) {
            orientation = _orientation;
            return self;
        };

        self.setReferenceNode = function(_$node) {
            $node = _$node;
            return self;
        };

        self.setSoyData = function(data) {
            soyData = data || {};
            return self;
        };

        self.reset = function() {
            $('.js-pop > :eq(0)').trigger('close');
            adjustment  = { top: 0, left: 0 };
            cssValues   = {};
            $menu       = null;
            $node       = null;
            menuId      = '';
            orientation = 'below';
            soyData     = {};

            return self;
        };

        self.show = function() {
            $menu = $(soy[menuId](soyData));

            populateMenu();
            attachEvents();

            $menu.bind('cssUpdate', handleCssUpdate);
            $menu.bind('imageUploaded', handleImageUpload);

            $menu.popover({
                closeOtherPopovers : true,
                context            : $node,
                position           : orientation || 'below'
            });

            // adjust top offset
            $menu.closest('.js-pop').offset(function(_, coords) {
                return {
                    left : coords.left + adjustment.left,
                    top  : coords.top + adjustment.top
                };
            });


            return self;
        };

        self.update = function() {
            $menu.html($(soy[menuId](soyData)).html());

            populateMenu();
            attachEvents();
        };



        return self;
    };
});
