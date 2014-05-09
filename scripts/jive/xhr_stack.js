/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Manages a last in, first out stack of jqXHR objects. Fires success/failure events when the most recently added
 * object resolves.
 *
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 */
define('jive.XhrStack', function() {
    return function() {
        var instance      = jive.conc.observable({}),
            lastRequestId = 0,
            deferred;


        /**
         * Resolves a jqXHR object
         *
         * @param {number} requestId
         * @param {mixed} [data]
         * @param {string} resolution success|failure
         * @private
         */
        var resolve = function(requestId, data, resolution) {
            if (requestId === lastRequestId) {
                instance.emit.apply(instance, Array.prototype.slice.call(arguments, 2));
            }
        };


        /**
         * Adds a jqXHR object to the stack
         *
         * @param {jQuery.jqXHR} jqXHR
         * @param {mixed} [data] any extra data to be passed as the last argument to the success/failure callbacks
         * @public
         * @return {instance}
         */
        instance.add = function(jqXHR, data) {
            lastRequestId = lastRequestId + 1;
            instance.empty();
            deferred = jqXHR;

            var success = resolve.curry(lastRequestId, data, 'success'),
                failure = resolve.curry(lastRequestId, data, 'failure');
            deferred.then(success).fail(failure);

            return instance;
        };

        /**
         * Clears the entire stack
         *
         * @public
         * @return {instance}
         */
        instance.empty = function() {
            deferred && deferred.abort();
            deferred = undefined;

            return instance;
        };



        return instance;
    };
});
