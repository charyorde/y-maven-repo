if (!jive.dispatcher) {
    jive.dispatcher = (function($, listeners, dispatcher) {
        /**
         * Listens for events by name
         *
         * @param {string|string[]} eventNames a single event name or an array of event names
         * @param {function} callback called when the event is dispatched:
         *      context (this): HTMLElement
         *      arguments: payload (object), event name (string), context (HTMLElement)
         * @returns jive.dispatcher
         */
        dispatcher.listen = function(eventNames, callback) {
            ($.isArray(eventNames) ? eventNames : [eventNames]).forEach(function(event) {
                listeners.hasOwnProperty(event) || (listeners[event] = []);
                listeners[event].push(callback);
            });

            return dispatcher;
        };

        /**
         * Dispatches a command
         *
         * @param {string} event
         * @param {object} payload
         * @param {HTMLElement} [context] optional, defaults to the window object
         */
        dispatcher.dispatch = function(event, payload, context) {
            var i      = 0,
                length = (listeners[event] || []).length;
            context = arguments.length > 2 ? context : window;

            while (i < length) {
                listeners[event][i++].call(context, payload, event, context);
            }
        };


        /*
         * Listens to all clicks on the document for elements with the data-command attribute. If a click is detected, a command
         * is dispatched to any listeners.
         */
        $(document).on('click', '[data-command]', function(e) {
            var $element = $j(this),
                data     = $element.data();

            e.preventDefault();
            dispatcher.dispatch(data.command, data, $element);
        });


        return dispatcher;
    })(jQuery, {}, {});
}