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
 * Numeric field control
 *
 * @param {jQuery} $input
 * @returns {object} an object with a setValue method
 */
jive.Theme.NumericField = function($input) {
    var isValid = function(value) {
        var min  = $input.data('min') || -Infinity,
            max  = $input.data('max') || Infinity;

        return value > min && value < max;
    };


    $input.bind('keyup paste change', function() {
        var payload = isValid($input.val()) ? [$input.val()] : [];
        $input.trigger('cssUpdate', payload);
    });


    return {
        /**
         * @param {mixed} value
         * @public
         */
        setValue : function(value) {
            isValid(value) && $input.val(value);
        }
    };
};