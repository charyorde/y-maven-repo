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
 * Color field control
 *
 * @param {jQuery} $input
 * @returns {object} an object with a setValue method
 */
jive.Theme.ColorField = function($input) {
    var $housing         = $input.closest('.j-js-housing'),
        $display         = $housing.find('.j-js-color-display'),
        $info            = $housing.find('.j-js-color-info'),
        canBeTransparent = $input.data('can-be-transparent'),
        // use objects to uniquely identify the current state. works because {} !== {} (not identical)
        DEFAULT     = {},
        VALID       = {},
        INVALID     = {},
        TRANSPARENT = {};


    /**
     * Format a string value as a hexidecimal
     *
     * @param {string} value
     * @returns {string} a hexidecimal value with leading pound sign (#)
     */
    var formatAsHex = function(value) {
        if (!isHex(value)) {
            throw 'Invalid argument: ' + (value || '');
        }

        // not using value.substr(-6) here because it isn't supported properly in IE < 9
        return '#' + value.replace('#', '');
    };

    /**
     * Test a string value to see if is a valid hexidecimal
     *
     * @param {string} value
     * @returns {boolean}
     */
    var isHex = function(value) {
        return /^#?(([a-f\d]){3}){1,2}$/i.test(value || '');
    };

    /**
     * Returns the proper color values by state
     *
     * @param {object} state (DEFAULT|VALID|INVALID|TRANSPARENT)
     * @returns {string}
     */
    var getColorForState = function(state) {
        if (state === VALID) {
            return formatAsHex($input.val());
        } else if (state === TRANSPARENT) {
            return 'transparent';
        }

        return '';
    };

    /**
     * Determine the state of the current color widget by a value. One of four objects may be returned to indicate the state:
     *    DEFAULT      - value is empty
     *    VALID        - value is a valid hex
     *    INVALID      - value is not a valid hex
     *    TRANSPARENT  - value is invalid, but defaults to transparent
     *
     * @param {string} value
     * @returns {object} returns one of four values: DEFAULT, VALID, INVALID or TRANSPARENT.
     */
    var getState = function(value) {
        value = $j.trim(value);

        if (!value) {
            // unless an input can be transparent, its default state is DEFAULT
            return canBeTransparent ? TRANSPARENT : DEFAULT;
        } else if (value.toLowerCase() === 'transparent') {
            return TRANSPARENT;
        }

        return isHex(value) ? VALID : INVALID;
    };

    /**
     * Updates the non-$input parts of the color widget.
     *
     * @param {object} state DEFAULT|VALID|INVALID|TRANSPARENT
     * @param {number} duration the duration of the color display animation
     */
    var updateDisplay = function(state, duration) {
        var color       = getColorForState(state),
            currentText = $info.text(),
            newText     = '';

        // update the color block
        $display.css('backgroundColor', color);
        $housing.toggleClass('transparent', state === TRANSPARENT);

        // dim the color display if it is invalid or empty
        if (state === VALID || state === TRANSPARENT) {
            $display.stop().css('opacity', 1).css('backgroundColor', color);
        } else {
            $display.stop().css('backgroundColor', color).animate({ opacity: .3 }, duration);
        }


        /*
         * There are three possible transitions here:
         *  - no text -> text (fade in)
         *  - text    -> no text (fade out)
         *  - text    -> different text (fade out, replace text, fade in)
         */
        if (state !== VALID) {
            newText = state === TRANSPARENT ? jive.theme.colorTransparent() : jive.theme.colorInvalid();
        }

        // update the text hint
        if (!currentText && newText) {
            // fade in
            $info.text(newText).fadeIn(duration);
        } else if (currentText && !newText) {
            // fade out
            $info.fadeOut(duration, $info.text.bind($info, ''));
        } else if (currentText && newText && currentText !== newText) {
            // fade out, replace, fade in
            $info.fadeOut(duration, function() {
                $info.text(newText).fadeIn(duration);
            });
        }

    };

    // color input update event
    $input.bind('keyup paste change', function(e) {
        var state = getState($input.val()),
            color = getColorForState(state);

        updateDisplay(state, 'fast');
        $input.trigger('cssUpdate', [color]);
    });


    return {
        /**
         * @param {string} value
         * @public
         */
        setValue : function(value) {
            var status = getState(value);

            if (status === VALID) {
                var color = formatAsHex(value).replace('#', '');
                $input.val(color);
            }

            updateDisplay(status, 0);
        }
    };
};