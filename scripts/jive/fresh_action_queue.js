/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*
 * Manages a set of asynchronous actions that need to be resolved in the
 * same order that they were initiated.
 *
 * For example, in a typeahead search a number of ajax requests may be
 * made in rapid succession, one for each user keystroke.  If we update
 * a suggestions list when each response is received, it is important
 * that those updates are performed in order.  Otherwise a correct
 * suggestion may appear briefly, but may disappear when the list is
 * redrawn with stale data.
 *
 * This class manages a queue of promises in the order that they were
 * given.  After any promise is resolved or failed, any earlier promises
 * in the queue are ignored.  Adding a new promise to the queue does not
 * prevent callbacks on earlier promises from running as long as the
 * earlier promises resolve before the new promise.
 *
 * To use the queue, create an instance of FreshActionQueue and use the
 * push() method to append promises.  The push() method will return
 * a new promise that resolves iff the original promise is still fresh
 * when it resolves.  FreshActionQueue will never prevent callbacks on
 * the original promise from running - only callbacks on the promise
 * returned by push() are screened for freshness.
 *
 * [1]: http://wiki.commonjs.org/wiki/Promises/A
 *
 * Example:
 *
 *     var queue = new FreshActionQueue();
 *
 *     $('#someInput').on('keydown', function() {
 *         var suggestionsPromise = getSuggestions(this.value);
 *         queue.push(suggestionsPromise).then(function(suggestions) {
 *             show(suggestions);
 *         });
 *     });
 *
 * FreshActionQueue can accept any promise implementation that is
 * compatible with the [Promises/A][1] CommonJS proposal.  That includes
 * jQuery deferreds and promises, and jive.conc.Promise instances.
 */
define('jive.conc.FreshActionQueue', ['jquery'], function($) {
    return function FreshActionQueue() {
        var queue = [];

        function push(promise) {
            var deferred = new $.Deferred();

            queue.push(promise);

            function resolveIfFresh() {
                var pos = queue.lastIndexOf(promise);

                // Make sure promise has not been bumped from the queue.
                if (pos > -1) {
                    // All preceding promises in the queue are now stale.
                    // So we remove them along with the promise that is
                    // resolved below.
                    queue = queue.slice(pos+1);

                    promise.then(
                        function() { deferred.resolve.apply(deferred, arguments); },
                        function() { deferred.reject.apply(deferred, arguments); }
                    );
                }
            }
            promise.then(resolveIfFresh, resolveIfFresh, function() { deferred.notify.apply(deferred, arguments); });

            return deferred.promise();
        }

        return {
            push: push
        };
    };
});
