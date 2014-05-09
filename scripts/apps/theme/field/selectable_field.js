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
 * Selectable field control
 *
 * @param {jQuery} $input
 * @returns {object} an object with a setValue method
 *
 * @depends path=/resources/scripts/jquery/jquery.label.js
 */
jive.Theme.SelectableField = function($input) {
    var $context = $input.closest('.j-theme-submenu');


    /**
     * Sync the class attribute of a label given the state if that label's $input.
     */
    var setLabelStyles = function() {
        $input.closest('.button-list').each(function() {
            var $list = $j(this),
                index = $list.find(':checkbox, :radio').index($input[0]);

            $list.closest('.j-form-row').find('.singleItemList .item')
                .removeClass('selected').eq(index).addClass('selected');
        });

        if ($input.is(':radio')) {
            $context.find('input[name=' + $input.attr('name') + ']').label().removeClass('checked');
        }
        $input.label().toggleClass('checked', $input.is(':checked'));
    };


    $input.change(function() {
        setLabelStyles();
        $input.trigger('cssUpdate');
    });


    return {
        /**
         * @param {mixed} value
         * @public
         */
        setValue : function(value) {
            var checked = !!value;
            if ($input.is(':radio')) {
                checked = $input.val() === value;
            }

            if (checked) {
                $input.prop('checked', true);
                setLabelStyles();
            }
        }
    };
};
