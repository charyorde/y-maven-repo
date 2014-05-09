/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Theme');

/**
 * Interface to theming REST service.
 * @depends path=/resources/scripts/jive/rest.js
 */
define('jive.Theme.ThemeSource', ['jquery'], function($) {
    return function ThemeSource() {
        /**
         * Performs an ajax request
         *
         * @param {string} type (DELETE|GET|POST|PUT)
         * @param {string} path
         * @param {object|string} [data={}]
         * @param {object} [settings={}]
         * @returns {jive.conc.Promise}
         */
        var request = function(type, path, data, settings) {
            var deferred        = $.Deferred(),
                defaultSettings = {
                    contentType: 'application/json; charset=utf-8',
                    data     : data || {},
                    dataType : 'json',
                    success  : deferred.resolve.bind(deferred),
                    timeout  : 30000,
                    type     : type.toUpperCase(),
                    url      : jive.rest.url(path)
                };

            $.ajax($.extend({}, defaultSettings, settings || {}));

            return deferred.promise();
        };


        /**
         * @param {object} data a palette object
         * @public
         * @returns {jQuery.Deferred}
         */
        this.save = function(data) {
            return request('put', '/palettes', JSON.stringify(data), { cache: false });
        };

        /**
         * @public
         * @returns {jQuery.Deferred}
         */
        this.get = function() {
            return request('get', '/palettes', {}, { cache: false });
        };

        /**
         * @public
         * @returns {jQuery.Deferred}
         */
        this.getPublishedPalette = function() {
            return request('get', '/palettes/published', {}, { cache: false });
        };

        /**
         * @param {number} paletteID
         * @public
         * @returns {jQuery.Deferred}
         */
        this.deletePalette = function(paletteID) {
            return request('delete', '/palettes/' + paletteID);
        };

        /**
         * @param {number} paletteID
         * @param {string} state start|stop
         * @public
         * @returns {jQuery.Deferred}
         */
        this.preview = function(paletteID, state) {
            return request('post', '/palettes/' + paletteID + '/preview/' + state);
        };

        /**
         * @param {number} paletteID
         * @public
         * @returns {jQuery.Deferred}
         */
        this.publish = function(paletteID) {
            return request('post', '/palettes/' + paletteID + '/publish');
        };
    };
});
