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
 * File field control
 *
 * @param {jQuery} $input
 * @param {object} cssValues
 * @returns {object} an object with a setValue method
 * @depends path=/resources/scripts/jquery/jquery.form.js
 */
jive.Theme.FileField = function($input, cssValues) {
    var imageId = $input.attr('data-image-name'),
        $form   = $input.closest('form'),
        $clone  = $input.clone();


    /**
     * Attaches change event to file input
     */
    var attachFileEvents = function() {
        $input.change(function() {
            setState('inProgress').submit();
        });
    };

    /**
     * Determine the file name for an uploaded file. Truncate to 18 characters and append a horizontal ellipsis if too long.
     *
     * @returns {string} the file name
     */
    var getFileName = function() {
        var name     = $input.val().split(/(\/|\\)/).pop(),
            fileName = name.split('.'),
            LIMIT    = 18;

        if (fileName[0].length > LIMIT) {
            fileName[0] = fileName[0].substr(0, LIMIT);
            name = fileName.join('&hellip;');
        }

        return name;
    };

    /**
     * Set the current state of the form
     *
     * @param {string} state (default|inProgress|complete)
     * @returns {jQuery} $form
     */
    var setState = function(state) {
        // valid states: default, inProgress or complete
        return $form.removeClass('default inProgress complete').addClass(state);
    };

    /**
     * Handle file upload errors
     *
     * @param {string} message
     */
    var uploadError = function(message) {
        $j('<p />').text(message).message({ style: 'error' });
        setState('default');
    };

    /**
     * Handle file upload success
     *
     * @param {object} file
     */
    var uploadSuccess = function(file) {
        var name = getFileName();

        setState('complete').find('.filename').html(name);
        $form.trigger('imageUploaded', [$j.extend({ name: name }, file)]);
    };


    var uploadComplete = function(response) {
        if (response.result === 'success') {
            uploadSuccess(response.file);
        } else {
            uploadError(response.message);
        }

        $input = $clone.clone();
        $form.find(':file').replaceWith($input);
        attachFileEvents();
    };



    /*
     * constructor
     */
    attachFileEvents();
    $form.ajaxForm({
        dataType : 'json',
        success  : uploadComplete
    });


    // show the file name if an image has already been uploaded
    var fileName = cssValues[imageId + 'Name'];
    if (fileName) {
        // a file has been uploaded. change the state of the form
        $form.find('[data-widget-type=fileName]').val(fileName);
        setState('complete').find('.filename').html(fileName);
    }


    return {
        /**
         * @param {mixed} value
         * @public
         */
        setValue : $j.noop
    };
};