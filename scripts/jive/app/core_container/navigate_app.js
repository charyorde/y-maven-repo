/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('JAF.CoreContainer');

/**
 * Provide management functions for Apps view navigation and url manipulation in the JAF core container.
 *
 * @class
 */
define('jive.JAF.CoreContainer.NavigateApp', function() {
    return jive.oo.Class.extend(function(protect) {
        var canvasToken = {};
        var canvasAppsUUIDRegEx = /(\/apps\/)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/;
        var canvasAppsAppPathRegEx = /(\/apps\/)([a-zA-Z0-9\/\-._]{1,120})/;

        this.init = function(options) {
        };

        /**
         * Store the latest token from view params in the url with the key is the url of the current location.
         * @key {String} key The url key that contains the view params. Need to get the /apps/app-path or /apps/UUID
         * @param {Object} canvasToken
         */
        this.setCanvasToken = function(token) {
            canvasToken = token;
        };

        /**
         * @param {String} key the URL that need to be mined to get
         * @return the latest token parsed form view params URL hash
         */
        this.getCanvasToken = function() {
            return canvasToken;
        };

        /**
         * Get the app-path or appUUId from the current URL if any.
         *
         * @param {String} currentUrl
         * @return {String} will return app-path or appUUID if any or null if not there.
         */
        this.getCanvasAppInfoFromUrl = function(currentUrl) {
            var targetUrl = currentUrl || window.location.pathname;
            var match = canvasAppsUUIDRegEx.exec(targetUrl);
            if (match !== null) {
                return match[2];
            }
            match = canvasAppsAppPathRegEx.exec(targetUrl);
            if (match != null) {
                return match[2];
            }

            return null;
        };

        /**
         * Mine the action queue id from URL.
         *
         * @param {Object} viewParams initial view params
         * @return {Object} the combined view params containing action queue as jive_aq property
         */
        this.addActionQueueItemToViewParams = function(viewParams) {
            var combinedViewParams = (typeof(viewParams) !== 'undefined' && viewParams !== null) ? viewParams : {};

            // get the current URL query params
            var match = /&aq=([1-9]\d*)/.exec(window.location.search + " " + window.location.hash);
            if(match) {
                var aqValue = match[1];
                combinedViewParams.jive_aq = aqValue;
            }

            return combinedViewParams;
        }
    })
});
