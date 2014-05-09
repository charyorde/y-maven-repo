/*globals jive soy soydata */

jive.namespace('i18n');

/* ensure i18n keymap only gets defined on initial page load  */
if(!jive.i18n.keyMaps) {

    /**
     * Notes about dependencies... This file depends on soydata.js, which depends on goog_stub.js.  We declare a dependency on goog_stub.js here
     * instead of within soydata.js since our dependency mechanism is proprietary and since soydata.js a third party library (which we should avoid
     * modifying unless there is a compelling reason).
     *
     * @depends path=/resources/scripts/soy/goog_stub.js
     * @depends path=/resources/scripts/soy/soydata.js
     */
    jive.i18n = {
        /**
         * This function is intended to be called as a soy template.  It takes an
         * data object and an output stream.  It assumes that the property 'string'
         * on the data object is an i18n string.  The other properties on the data
         * object are used as replacements strings for placeholders in the i18n
         * string.
         *
         * If any property names on the data object are lowercase English words for
         * numbers then the values of those properties will be placed in
         * placeholder positions in the i18n string with the numeral representation
         * of the same number.  Property names with other forms will be placed in
         * placeholder positions with the same names.  For example:
         *
         *     jive.i18n.soy({
         *         string: "Please {0} the {1} with your {2}. {thanks}",
         *         zero: "click",
         *         one: "box",
         *         two: "mouse",
         *         thanks: "Thank you!"
         *     }, output)
         *
         * Produces the output:
         *
         *     Please click the box with your mouse. Thank you!
         *
         * Appends the resulting interpolated i18n string to the soy
         * output stream.
         */
        soy: function(data, output) {
            var numbers = {
                'zero': 0,
                'one': 1,
                'two': 2,
                'three': 3,
                'four': 4,
                'five': 5,
                'six': 6
            };

            var string = data.string, replacements = [];

            Object.keys(data).forEach(function(k) {
                if (typeof numbers[k] != 'undefined' &&
                    typeof replacements[numbers[k]] == 'undefined') {
                    replacements[numbers[k]] = data[k];  // map string keys to ints
                }
            });

            // Render interpolated string to the soy output stream.
            output.append(jive.i18n.i18nText(string, replacements));
        },

        /**
         * Function to obtain msg from a msgKey, used for client side soy templates to obtains messages from dynamic i18n
         * keys
         * @param msgKey
         */
        getMsg:function(msgKey){
            var maps = jive.i18n.keyMaps, msg;

            for (var i = 0; i < maps.length; i += 1) {
                msg = maps[i][msgKey];
                if (msg) {
                    // Copy keys into the first map to optimize access to
                    // frequently accessed keys.
                    if (i > 0) { maps[0][msgKey] = msg; }
                    return msg;
                }
            }

            return msgKey;
        },

        /**
         * Adds a msg key and value to the client side i18n object.  Eventually this will be automatically added by the
         * java SoyResourceParser class
         * @param msgKey
         * @param msgValue
         */
        addMsg:function(msgKey, msgValue){
            jive.i18n.keyMaps[0][msgKey] = msgValue;
        },

        /**
         * Variation of addMsg optimized for registering multiple keys.
         * Keys should be given as a map of keys to translated strings.
         */
        addMsgs: function(msgs) {
            // For maximum performance just collect all given maps instead
            // of merging them.
            jive.i18n.keyMaps.unshift(msgs);
        },

        /**
         * Creates a dynamic URL with the appropriate context for loading static content.
         * Output is the same as resource.url.
         */
        i18nText:function(message, args) {
            var arg;
            for (var idx = 0; idx < args.length; idx++) {
                arg = args[idx];
                if (typeof arg != 'undefined') {
                    message = String(message).replace('{' + idx + "}", soy.$$escapeHtml(arg));
                }
            }
            return new soydata.SanitizedHtml(message);
        },

        /**
         * Represents a subset of the key-value pairs from various resource
         * bundle property files.  Populated by annotations in soy files.
         */
        keyMaps: [{}]
    };
}
