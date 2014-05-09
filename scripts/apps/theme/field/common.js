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
 * A factory that returns field objects.
 *
 * @depends path=/resources/scripts/apps/theme/field/color_field.js
 * @depends path=/resources/scripts/apps/theme/field/file_field.js
 * @depends path=/resources/scripts/apps/theme/field/numeric_field.js
 * @depends path=/resources/scripts/apps/theme/field/selectable_field.js
 * @depends path=/resources/scripts/apps/theme/field/text_field.js
 *
 * @param {jQuery} $input an input element
 * @param {object} cssValues
 * @returns {object} an object with a setValue method
 */

jive.Theme.getFieldObject = function($input, cssValues) {
    var type = $input.data('widget-type') || '',
        map  = {
            color      : jive.Theme.ColorField,
            file       : jive.Theme.FileField,
            number     : jive.Theme.NumericField,
            selectable : jive.Theme.SelectableField,
            text       : jive.Theme.TextField
        };


    /**
     * Return a field object for the $input
     *
     * @param {function} constructor
     * @returns {object} an object with a setValue method
     */
    var getField = function(constructor) {
        if (!$input.data('control')) {
            $input.data('control', constructor($input, cssValues));
        }

        return $input.data('control');
    };


    // determine the proper field type for the given $input
    if ($input.is(':text') && type in map) {
        return getField(map[$input.data('widget-type')]);
    } else if ($input.is(':checkbox, :radio')) {
        return getField(map.selectable);
    } else if ($input.is(':file')) {
        return getField(map.file);
    }


    // return null object if no supported field type was found
    return { setValue : $j.noop };
};