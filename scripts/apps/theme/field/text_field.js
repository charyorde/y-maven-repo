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
 * Textual field control
 *
 * @param {jQuery} $input
 * @returns {object} an object with a setValue method
 */
jive.Theme.TextField = function($input) {
    $input.bind('keyup paste change', function() {
        $input.trigger('cssUpdate');
    });

    return {
        /**
         * @param {mixed} value
         * @public
         */
        setValue : $input.val.bind($input)
    };
};