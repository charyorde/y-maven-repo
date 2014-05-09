/**
 * Provides common functionality for recommendation controllers.
 *
 * @depends path=/resources/scripts/jive/util.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 *
 * @param {jQuery} $container
 */

jive.namespace('RecommendationApp').Controller = function($container) {
    var self = jive.conc.observable({});


    
    /**
     * Returns a jQuery object containing a module body. If the optional "selector" parameter is provided, this function
     * searches for selector within the module body and returns it.
     *
     * @param {string} [selector]
     * @return {jQuery}
     */
    self.getBody = function(selector) {
        var $body = $container.find('[data-module-body="true"]');
        return selector ? $body.find(selector) : $body;
    };


    /**
     * Compares two arrays of recommendation objects to each other.
     *
     * @param {array} current
     * @param {array|null} previous
     * @param {boolean} [considerOrder=false]
     * @returns {boolean}
     */
    self.shouldUpdate = function(current, previous, considerOrder) {
        var shouldUpdate = previous === null || current.length > 0 || previous.length > 0,
            idMap = {};

        if (shouldUpdate && previous !== null && current.length === previous.length) {
            current.forEach(function(obj, i) {
                idMap[obj.id] = i;
            });

            shouldUpdate = !previous.every(function(obj, i) {
                var isSimilar = idMap.hasOwnProperty(obj.id);
                if (considerOrder) {
                    isSimilar = idMap[obj.id] === i;
                }

                return isSimilar;
            });
        }

        return shouldUpdate;
    };

    
    // construct
    // listen for click events on matching elements
    $container.delegate('[data-event]', 'click', function(e) {
        e.preventDefault();
        var payload = $j.extend({ $target: $j(this) }, jive.util.extractDataAttributes(this));
        self.emit(payload.event, payload);
    });

    return self;
};