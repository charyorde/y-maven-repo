/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * A jQuery plugin that finds matching labels for a group of input/select/textarea elements.
 */

(function($) {
    $.fn.label = function(selector) {
        var $result = $(),
            $labelsWithForAttribute = $('label').filter('[for]');

        this.filter(':input').not('button').each(function() {
            var $input = $(this),
                $ancestorLabel = $input.closest('label');

            if ($ancestorLabel.length > 0) {
                // $input is a child of a <label>
                $result = $result.add($ancestorLabel);
            } else if ($input.is('[id]')) {
                $labelsWithForAttribute.filter('[for=' + $input.attr('id')).each(function() {
                    // found a <label> with a 'for' attribute that references $input
                    $result = $result.add(this);
                    return false;
                });
            }
        });


        return selector ? $result.filter(selector) : $result;
    };
})(jQuery);
