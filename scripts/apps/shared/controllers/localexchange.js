/*globals localStorage */

/**
 * Simple event emitting object that acts as a message bus for communication between JavaScript components that are not
 * directly related.
 *
 * This implementation does not use local storage so is only available to the same window or tab.
 *
 * @extends jive.conc.observable
 */
(function() {
    jive.localexchange = jive.localexchange || (function() {
        var localexchange = {};
        jive.conc.observable(localexchange);
        return localexchange;
    })();
})();
