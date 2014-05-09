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
 * @param {jive.Theme.ThemeSource} source
 */
define('jive.Theme.PaletteCollection', ['jive.Theme.ThemeSource'], function(Source) {
    return function PaletteCollection() {
        var self      = jive.conc.observable({}),
            data      = [],
            current   = null,
            published = null,
            source    = new Source();


        /**
         * Clones an object
         *
         * @param {object} target
         * @private
         * @returns {object}
         */
        var clone = function(target) {
            return $j.extend(true, {}, target);
        };

        /**
         * Returns an array of palettes for a given type
         *
         * @param {string} type custom|predefined
         * @private
         * @returns {array}
         * @throws {TypeError} If the argument is an unrecognized type
         */
        var filterByType = function(type) {
            type = (type || '').toLowerCase();
            if (!/^custom|predefined$/.test(type)) {
                throw new TypeError('Invalid filter type');
            }

            return self.delineateByType()[type];
        };

        /**
         * Returns a saved palette by paletteID
         *
         * @param {number} paletteID
         * @private
         * @returns {object} a palette object
         * @throws {Error} If the id is not found or the data is corrupt
         */
        var byId = function(paletteID) {
            var filtered = data.filter(function(item) {
                return item.paletteID === paletteID;
            });

            if (filtered.length === 0) {
                throw new Error('Invalid paletteID');
            } else if (filtered.length > 1) {
                throw new Error('Multiple palettes were found for paletteID: ' + paletteID);
            }

            return filtered[0];
        };



        /**
         * Sets the current palette by paletteID
         *
         * @param {number} paletteID
         * @public
         * @returns {instance}
         */
        self.activate = function(paletteID) {
            var palette = byId(paletteID);
            current = clone(palette);

            return self.emit('paletteChange');
        };

        /**
         * Breaks out palettes into an object where they are organized by type
         *
         * @public
         * @returns {object} { custom: [], predefined: [] }
         */
        self.delineateByType = function() {
            var output = { custom: [], predefined: [] };

            data.forEach(function(item) {
                if (item.paletteID > 0) {
                    var stack = item.predefined ? output.predefined : output.custom;
                    stack.push(item);
                }
            });

            return output;
        };

        /**
         * Retrieves all CSS values for the current palette
         *
         * @public
         * @returns {object}
         */
        self.getCssValues = function() {
            return clone(current.values);
        };

        self.get = function(cssKey) {
            return current.values[cssKey];
        };

        /**
         * Sets CSS values by name
         *
         * @param {object} values
         * @public
         * @returns {instance}
         */
        self.setCssValues = function(values) {
            $j.each(values, function(key, value) {
                current.values[key] = value;
            });

            return self.emit('cssChange', values);
        };

        /**
         * Removes CSS values from the current palette by name
         *
         * @param {string[]} [names] each argument passed to this method is a string indicating the CSS key to be deleted
         * @public
         * @returns {instance}
         */
        self.unsetCssValue = function() {
            var values = {};

            for (var i=0; i < arguments.length; i++) {
                var key = arguments[i];
                delete current.values[key];
                values[key] = '';
            }

            return self.emit('cssChange', values);
        };

        /**
         * Gets the paletteID of the current palette
         *
         * @public
         * @returns {number}
         */
        self.getActiveId = function() {
            return current.paletteID;
        };

        /**
         * Gets the name of the current palette
         *
         * @public
         * @returns {string}
         */
        self.getActiveName = function() {
            return current.name;
        };

        /**
         * Returns and array of all custom palette names
         *
         * @public
         * @returns {string[]}
         */
        self.getCustomPaletteNames = function() {
            return filterByType('custom').map(function(item) {
                return item.name;
            });
        };

        /**
         * Returns the published palette
         *
         * @public
         * @returns {object}
         */
        self.getPublished = function() {
            return clone(published);
        };

        /**
         * Returns the paletteID of the published palette
         *
         * @public
         * @returns {number}
         */
        self.getPublishedId = function() {
            return self.getPublished().paletteID;
        };

        /**
         * Deletes a palette by paletteID
         *
         * @param {number} paletteID
         * @public
         * @returns {jQuery.Promise}
         */
        self.deletePalette = function(paletteID) {
            var deferred  = $j.Deferred(),
                isCurrent = paletteID === self.getActiveId();

            source.deletePalette(paletteID).then(function() {
                if (isCurrent) {
                    current.paletteID = 0;
                    current.name      = '';
                }

                self.refresh().then(deferred.resolve.bind(deferred));
            });

            return deferred.promise();
        };

        /**
         * Publishes the current palette
         *
         * @public
         * @returns {jQuery.Promise}
         */
        self.publish = function() {
            var deferred = $j.Deferred();

            self.stopPreview().then(function() {
                self.saveAndPublish(current.name).then(deferred.resolve.bind(deferred));
            });

            return deferred.promise();
        };

        /**
         * Saves the current palette
         *
         * @param {string} name the new|existing name of the palette being saved
         * @public
         * @returns {jQuery.Promise} the deferred emits the saved palette object on success
         */
        self.save = function(name) {
            var deferred = $j.Deferred();

            current.name = name;
            if (current.predefined) {
                current.predefined = false;
            }

            // if a custom palette with the same name already exists, overwrite it
            filterByType('custom').some(function(item) {
                if (item.name === current.name) {
                    item.values = current.values;
                    current = clone(item);
                    return true;
                }
            });

            source.save(current).then(function(savedPalette) {
                current = clone(savedPalette);
                self.refresh().then(deferred.resolve.bind(deferred, savedPalette));
            });

            return deferred.promise();
        };

        /**
         * Saves and publishes the current palette
         *
         * @param {string} name the new|existing name of the palette being saved
         * @public
         * @returns {jQuery.Promise}
         */
        self.saveAndPublish = function(name) {
            var deferred = $j.Deferred();

            self.save(name).then(function() {
                source.publish(current.paletteID).then(function() {
                    self.refresh().then(deferred.resolve.bind(deferred));
                });
            });

            return deferred.promise();
        };

        /**
         * Saves a palette and sets it to previewed
         *
         * @param {string} name the new|existing name of the palette being saved
         * @public
         * @returns {jQuery.Promise}
         */
        self.startPreview = function(name) {
            var deferred = $j.Deferred();

            self.save(name).then(function() {
                source.preview(current.paletteID, 'start').then(deferred.resolve.bind(deferred));
            });

            return deferred.promise();
        };


        /**
         * Stops preview on the current palette
         *
         * @public
         * @returns {jQuery.Promise}
         */
        self.stopPreview = function() {
            return source.preview(current.paletteID, 'stop');
        };

        /**
         * Fetches all saved palettes and the currently published palette
         *
         * @public
         * @returns {jQuery.Promise}
         */
        self.refresh = (function() {
            var inProgress = false,
                deferred;

            return function() {
                if (!deferred) {
                    deferred = $j.Deferred();
                }

                if (!inProgress) {
                    inProgress = true;
                    $j.when(source.get(), source.getPublishedPalette()).then(function() {
                        data = arguments[0][0];
                        published = arguments[1][0];
                        if (published === null) {
                            // if there is no published palette, default to the first predefined palette
                            published = clone(filterByType('predefined')[0]);
                        }

                        if (current === null) {
                            // if there is no current palette, default to the published palette
                            current = clone(published);
                        }

                        inProgress = false;
                        deferred.resolve();
                        deferred = undefined;
                    });
                }

                return deferred;
            }
        })();


        return self;
    };
});