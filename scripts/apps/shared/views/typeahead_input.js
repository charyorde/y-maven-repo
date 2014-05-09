/**
 * Displays a text input that emits a 'change' event when its value is updated
 * by the user.
 *
 * This class adapts code from jquery.suggest
 *
 * @class
 * @extends jive.conc.observable
 * @param {jQuery|DOMElement|String} element reference or selector for input element
 * @param {Object} options paramaters to customize the view
 * @config {number} minLength minimum length for the input value - shorter values will not trigger an event
 * @config {number|Function} delay time in milliseconds to wait between
 * the user entering a keystroke and the 'change' event firing - or
 * a function that takes the input value and returns a delay value
 *
 * @depends path=/resources/scripts/lib/core_ext/function.js
 */
jive.TypeaheadInput = jive.oo.Class.extend(function(protect) {
    var $ = jQuery;

    jive.conc.observable(this);

    protect.init = function(element, options) {
        var view = this;

        options = options || {};

        this.element = $(element);
        this.minLength = options.minLength || 2;
        this.delay = options.delay || 333;
        this.suppressEnterKey = options.suppressEnterKey;

        var handler = this.processKey.bind(this);

        if ($.browser.mozilla) {
            this.element.keypress(function(e) {
                handler(e);
            });
        } else {
            this.element.keydown(function(e) {
                handler(e);
            });
        }

        // Capture event that is emitted when the little "x" in the search box
        // is clicked and other actions that might trigger a change.
        this.element.bind('search change', handler);

        this.element.focus(function() {
            view.focused = true;
            view.startWatch(handler);
        });

        this.element.blur(function() {
            view.focused = false;
            view.stopWatch(handler);
        });
        
        // Determine placeholder text based on element attribute in browsers
        // that do not natively support placeholder text for search inputs.
        if (!('placeholder' in $('<input>')[0])) {
            this.placeholder = this.element.attr('placeholder');

            // While we are at it, retrieve the class that the jQuery placeheld
            // plugin adds to the input when placeholder text is displayed.
            this.placeheldClass = ((this.element.data('placeHeld') || {}).options || {}).className;
        }

        // Delay may be given as a function.
        var delay = this.delay;
        this.getDelay = $.isFunction(delay) ? this.delay : function() {
            return delay;
        };

        this.isClear = effectivelyClear(this.minLength, this.element.val());
    };

    this.val = function(v) {
        if (this.focused && typeof v != 'undefined') {
            // do not update value while the input has focus

        } else if (v === "" && this.placeholder) {
            this.element.val(this.placeholder);
            this.element.addClass(this.placeheldClass);

        } else {
            return this.element.val.apply(this.element, arguments);
        }
    };

    protect.processKey = function(e) {
        var value = this.element.val()
          , view = this;

        if (e && e.which == '13' && view.suppressEnterKey) {
            e.preventDefault();
        }

        if (value !== this.prevValue) {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(function(){
                view.emitChange(view.element.val());
            }, this.getDelay(value));

            this.prevValue = value;
        }
    };

    protect.emitChange = function(value) {
        if (!this.isClear && effectivelyClear(this.minLength, value)) {
            this.emit('clear');
            this.isClear = true;
        } else if (value.length >= this.minLength && !this.placeheld()) {
            this.emit('change', value);
            this.isClear = false;
        }
    };

    function effectivelyClear(minLength, value) {
        return $.trim(value) === '' || value.length < minLength;
    }

    protect.placeheld = function() {
        if (this.placeholder && this.placeheldClass) {
            return this.element.val() === this.placeholder && this.element.hasClass(this.placeheldClass);
        } else {
            return false;
        }
    };

    protect.startWatch = function(handler) {
        var view = this;
        this.stopWatch(handler);
        this.watchTimeout = setTimeout(function() {
            handler();
            view.startWatch(handler);
        }, 333);
    };

    protect.stopWatch = function() {
        clearTimeout(this.watchTimeout);
    };
});
