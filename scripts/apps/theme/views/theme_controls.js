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
 * @param {jQuery} $dom
 * @param {jive.theme} soy
 */
define('jive.Theme.ThemeControls', ['jquery'], function($) {
    return function ThemeControls($dom, soy) {
        var self    = jive.conc.observable({}),
            enabled = false;


        self.enable = function() {
            enabled = true;
            return self;
        };

        self.disable = function() {
            enabled = false;
            return self;
        };

        self.setMode = function(mode) {
            mode = (mode || '').toLowerCase();
            if (!/^edit|preview$/.test(mode)) {
                throw new TypeError('Invalid argument: mode');
            }

            $dom.html(soy.themeControls({ mode: mode }));

            return self;
        };


        // attach events
        $dom.delegate('a', 'click', function(e) {
            e.preventDefault();
            if (enabled) {
                self.emit($(this).data('event'));
            }
        });


        return self;
    }
});
