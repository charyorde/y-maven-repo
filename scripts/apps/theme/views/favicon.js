/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Theme');

/**
 * Manages the favicon
 *
 * @depends path=/resources/scripts/jive/util.js
 * @param {jive.Theme.PaletteCollection} palettes
 */
define('jive.Theme.Favicon', function() {
    return function Favicon(palettes) {
        var self         = {},
            DEFAULT_ICON = '/favicon.ico',
            lastUrl      = '';


        /**
         * Syncs the favicon with the currently edited theme's favicon state
         *
         * @returns {instance}
         */
        self.sync = function() {
            var values    = palettes.getCssValues(),
                type      = values.faviconType,
                customUrl = values.faviconImageUrl,
                url       = DEFAULT_ICON;

            // determine the proper state of the favicon
            if (type === 'custom' && customUrl) {
                // custom
                url = customUrl;
            }

            // only update the favicon url if it is different from the last favicon url
            if (url !== lastUrl) {
                jive.util.setFavicon(url);
                lastUrl = url;
            }


            return self;
        };


        return self;
    };
});