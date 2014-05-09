/*globals localStorage */

/**
 * Simple event emitting object that acts as a message bus for communication
 * between JavaScript components that are not directly related.
 *
 * This implementation uses localStorage in browsers that support it to
 * dispatch events to all open windows on the same origin.
 *
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 */
(function() {
var localStorageAvailable = (function() {
    try {
        return !!localStorage.getItem;
    } catch(e) {
        return false;
    }
})();

if (localStorageAvailable) {
    jive.switchboard = jive.switchboard || (function() {
        var switchboard = {}
          , emitted = {}
          , eventsKey = 'jive.switchboard'
          , interval;

        // Calculates an identifier to uniquely identify each event regardless
        // of which window it originated in.
        function newUuid() {
          return Math.floor(Math.random() * 100000).toString();
        }

        // Retrieves shared queue of events from localStorage.
        function getEvents() {
            var raw = localStorage.getItem(eventsKey);
            var events;

            try {
                events = raw ? JSON.parse(raw) : [];
            } catch(e) {
                if (e instanceof SyntaxError) {
                    events = [];
                } else {
                    throw e;
                }
            }

            // Make sure that events is an array in case localStorage gets into
            // an inconsistent state.
            if (jQuery.isArray(events)) {
                return events;
            } else {
                return [];
            }
        }

        jive.conc.observable(switchboard);

        var baseEmit = switchboard.emit;

        switchboard.emit = function(event/*, eventParams */) {
            var events = getEvents()
              , expires
              , newEvent;

            // Set up an expiry time for the event record.
            expires = new Date();
            expires.setMilliseconds(expires.getMilliseconds() + 5000);

            newEvent = {
                  type: event,
                  params: Array.prototype.slice.call(arguments, 0),
                  uuid: newUuid(),
                  expires: expires.getTime()
              };

            // Keep a record that this window has already dispatched this
            // event.
            emitted[newEvent.uuid] = newEvent;

            // Push the new event into localStorage so that it can be accessed
            // by other windows.
            events.push(newEvent);
            localStorage.setItem(eventsKey, JSON.stringify(events));

//            console.log("switchboard event: " + event, JSON.parse(JSON.stringify(newEvent.params)));

            // Emit the event in this window.  Serialize and de-serialize event
            // parameters so that behavior will be the same as when the event
            // is dispatched to a different window.
            return baseEmit.apply(switchboard, JSON.parse(JSON.stringify(newEvent.params)));
        };

        function checkForEvents(storageEvent) {
            var now = (new Date()).getTime()
              , unfilteredEvents = getEvents();

            // Filter out old events.
            var events = unfilteredEvents.filter(function(event) {
                return event.expires > now;
            });

            // Update localStorage after filtering events to keep storage size
            // from increasing over time.  But update if it is necessary to
            // prevent this function from being called over and over again by
            // the 'storage' event.
            if (unfilteredEvents.length != events.length) {
                localStorage.setItem(eventsKey, JSON.stringify(events));
            }

            events.forEach(function(event) {
                // Emit the event if this window has not already done so.
                if (!emitted[event.uuid]) {
                    baseEmit.apply(switchboard, event.params);

                    // Note that this window has now emitted the event.
                    emitted[event.uuid] = event;
                }
            });

            // Clean up the map of emitted event references by removing old
            // references.  This prevents memory usage from increasing over
            // time.
            Object.keys(emitted).forEach(function(key) {
                if (emitted[key].expires < now) {
                    delete emitted[key];
                }
            });

            // If an event object is given that means that this function was
            // invoked by the 'storage' event binding.  That means that we can
            // dispense with the interval check.  That is unless this is IE
            // where the 'storage' event does not fire reliably.
            if (typeof storageEvent === 'object' && storageEvent.type === 'storage' && !jQuery.browser.msie) {
                clearInterval(interval);
            }
        }

        // get all events on tab init and mark as already emitted
        jQuery.each(getEvents(), function(index, event) {
            emitted[event.uuid] = event;
        });

        // Periodically check for events from other windows.
        interval = setInterval(checkForEvents, 333);

        // Check for events from other windows when the 'storage' event fires.
        jQuery(window).bind('storage', checkForEvents);

        return switchboard;
    })();

} else {
    jive.switchboard = jive.switchboard || (function() {
        var switchboard = {};
        jive.conc.observable(switchboard);
        return switchboard;
    })();
}
})();
