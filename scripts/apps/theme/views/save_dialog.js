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
 */

define('jive.Theme.SaveDialog', ['jquery'], function($) {
    return function SaveDialog(soy) {
        var self          = jive.conc.observable({}),
            paletteNames  = {},
            published     = null,
            inPreviewMode = false,
            $dialog,
            $find;


        var getName = function() {
            return $.trim($find('#theme-name').val());
        };

        var cancel = function(e) {
            e.preventDefault();
            $dialog.trigger('close');

            // just to be safe
            paletteNames  = {};
            published     = null;
            inPreviewMode = false;
            $dialog = $find = undefined;
        };

        var save = function(e) {
            var name = getName();
            e.preventDefault();

            if (name) {
                self.emit('save', name, $find('#publish-toggle').is(':checked'), inPreviewMode ? 'preview' : 'edit');
                $dialog.trigger('close');
            } else {
                $(soy.themeNameRequiredMessage()).message({ style: 'warn' });
            }
        };

        var isCustomPaletteNamePublished = function(name) {
            return paletteNames.hasOwnProperty(name) && published.name === name && !published.predefined;
        };

        var updateSavePublishWarning = function() {
            var showWarning = isCustomPaletteNamePublished(getName()) && !inPreviewMode;
            $find('#save-publish-warning').toggle(showWarning);
            $find('#save-publish-message').toggle(!showWarning);
        };

        var syncUI = function() {
            var name          = getName(),
                isPublished   = isCustomPaletteNamePublished(name),
                disableSave   = false;


            // messaging
            $find('#save-name-warning').html(function() {
                if (isPublished && inPreviewMode) {
                    disableSave = true;
                    return soy.changeThemeName({ text: name });
                } else if (paletteNames.hasOwnProperty(name) || isPublished) {
                    return soy.saveDialogWarning({ text: name });
                }

                return '';
            });


            // checkbox state
            var $label    = $find('#publish-switch'),
                $checkbox = $find('#publish-toggle');

            if (isPublished) {
                $label.removeClass('switch-on switch-off');
                $checkbox.prop('checked', true);
            } else if ($label.hasClass('switch-lock')) {
                $checkbox.prop('checked', false);
            }

            $label.toggleClass('switch-lock', isPublished);
            $checkbox.prop('disabled', isPublished);


            // save button
            var $save = $find('#theme-save');
            $save.prop('disabled', disableSave);
            // text
            if (inPreviewMode) {
                $save.text(soy.saveAndContinue());
            } else if (isPublished) {
                $save.text(soy.saveAndPublish());
            } else {
                $save.text(soy.save());
            }

            // publish descriptive text
            updateSavePublishWarning();

            // sync checkbox css class
            var checked = $checkbox.is(':checked');
            $find('#publish-switch').not('.switch-lock').toggleClass('switch-on', checked).toggleClass('switch-off', !checked);
        };


        self.setCustomPaletteNames = function(_paletteNames) {
            paletteNames = {};
            (_paletteNames || []).forEach(function(name) {
                paletteNames[name] = true;
            });

            return self;
        };

        self.setPublishedPalette = function(palette) {
            published = palette;
            return self;
        };

        /**
         * Set the current mode
         *
         * @param {object} value self.DEFAULT|self.PREVIEW
         * @returns {self}
         */
        self.setMode = function(_mode) {
            _mode = (_mode || '').toLowerCase();
            if (!/^edit|preview$/.test(_mode)) {
                throw new TypeError('Invalid mode');
            }
            inPreviewMode = _mode !== 'edit';

            return self;
        };

        /**
         * Shows the save dialog
         *
         * @returns {self}
         */
        self.show = function(name) {
            $dialog = $(soy.saveDialog({ name: name }));
            $dialog.toggleClass('previewMode', inPreviewMode);

            $find = $dialog.find.bind($dialog);

            $find('form').submit(save);
            $find('#theme-save').click(save);
            $find('#publish-toggle').change(syncUI.aritize(0));
            $find('#theme-cancel-save').click(cancel);

            var $name = $find('#theme-name');
            $name.bind('keyup paste', syncUI.aritize(0));

            syncUI();

            // focusing on the name field doesn't work unless we do it after the modal has been loaded
            $dialog.lightbox_me({
                destroyOnClose : true,
                onLoad         : function() {
                    $name.focus();
                    updateSavePublishWarning();
                }
            });


            return self;
        };


        return self;
    }
});
