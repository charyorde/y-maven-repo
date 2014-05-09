/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/* The following variables should be set for this script:
    originalRange - slider range (0, 1, 2) before edits, used for cancelling
    currentRange - slider range (0, 1, 2)
    statusLow - i18n text for low status
    statusMedium - i18n text for medium status
    statusHigh - i18n text for high status
    projectID - projectID of the project
    alertMsg - invalid characters alert message
    originalProjectHtml - status text html, used for cancelling
*/
/**
 * Project Status Widget
 *
 * @requires {jive.model.ProjectController} projectControl (instantiated in project-status.ftl)
 * @see /skin/WEB-INF/classes/template/widget/project-status.ftl
 */
(function() {
    var $form, i18n ={},
        // cssKey, statusId, and text are set up on DOM ready
        allStatuses = {
            complete : { code : 99,  sliderValue: 99,  isComplete: true },
            high     : { code :  2,  sliderValue: 97,  isComplete: false },
            low      : { code :  0,  sliderValue:  1,  isComplete: false },
            med      : { code :  1,  sliderValue: 49,  isComplete: false }
        };


    /*
     * Utility functions
     */
    /**
     * Get the current status in the UI
     *
     * @returns {object}
     */
    function getCurrentStatus() {
        return getStatusByCode($j('#j-currentStatus').val());
    }

    /**
     * When passed a slider value, return the corresponding status object from allStatuses
     *
     * @param {number} value
     * @returns {object}
     */
    function getStatusBySliderValue(value) {
        if (value > 97) { return allStatuses.complete; }
        if (value < 33) { return allStatuses.low;      }
        if (value > 65) { return allStatuses.high;     }

        return allStatuses.med;
    }

    /**
     * When passed a numeric code, returns the corresponding status object from allStatuses
     *
     * @param {number} value
     * @returns {object}
     * @throws {Error} throws an error if the value passed doesn't correspond to a known status code
     */
    function getStatusByCode(value) {
        var code      = parseInt(value, 10),
            statusKey = Object.keys(allStatuses).filter(function(key) {
                return allStatuses[key].code === code;
            }).shift();

        if (!statusKey) {
            throw new Error('Unexpected status code');
        }

        return allStatuses[statusKey];
    }

    /**
     * Updates the UI to indicate a particular state
     *
     * @param {object} status on of the entries in allStatuses
     * @param {boolean} inEditMode
     */
    function setStatusHeading(status, inEditMode) {
        var $icon    = $j('<span class="jive-icon-big" />').addClass('jive-icon-project-status-' + status.cssKey),
            text     = document.createTextNode(status.text),
            $heading = $j('#jive-widget-project-status-header')
                .attr('class', 'j-js-edit-project-status proj-status proj-status-' + status.cssKey);

        $heading.html('');
        if (inEditMode) {
            $heading = $j('<a href="#"><em class="font-color-normal" /></a>').appendTo($heading);
            $heading.find('em').text($form.data('i18nUpdate')).prepend(' ');
        }

        // order is important here
        $heading.prepend(text).prepend($icon);
    }


    /*
     * Event handlers
     */
    /**
     * Toggles the project status in and out of a completed state
     */
    function toggleProjectCompletion() {
        var currentStatus = getCurrentStatus(),
            fade          = currentStatus.isComplete ? 'fadeIn' : 'fadeOut',
            newStatus;


        if (!currentStatus.isComplete) {
            newStatus = allStatuses.complete;
        } else {
            // the project has been marked as complete
            var sliderValue = $j('#jive-slider-track').data('value');

            // sliderValue is null if the slider has not yet been used. in this case default to On Track (high)
            newStatus = isNaN(sliderValue) ? getStatusByCode(sliderValue) : allStatuses.high;
        }

        // Show/hide the slider, update the heading and the currentStatus input
        $j('#jive-slider-track')[fade]('fast');
        $j(this).toggleClass('complete incomplete');
        setStatusHeading(newStatus);
        $j('#j-currentStatus').val(newStatus.code);
    }

    /**
     * Takes the UI out of edit mode
     */
    function close() {
        var $current      = $j('#j-currentStatus').val($j('#j-persistedStatus').val()),
            currentStatus = getStatusByCode($current.val());
        setStatusHeading(currentStatus, true);

        $j('#jive-widget-project-status-body').fadeOut('fast', function() {
            $j('#status-description-small').val('');
            $form.find('.j-project-status-description').show();
            var $a = $j(this).find('.j-js-update-completion-status').removeClass('complete incomplete')
                .addClass(currentStatus.isComplete ? 'complete' : 'incomplete');
            $j('#jive-slider-track').toggle(!currentStatus.isComplete);
        });
    }

    /**
     * Puts the UI into edit mode
     */
    function edit() {
        var currentStatus = getCurrentStatus();

        $j('#jive-widget-project-status').toggleClass('locked unlocked');
        setStatusHeading(currentStatus, false);
        $j('#jive-widget-project-status-body').fadeIn('fast');
        $j("#status-description-small").focus();
        $form.find('.j-project-status-description').hide();

        // Create a new slider
        var $slider = $j('#jive-slider-track').data('value', null).slider({
            min   : 0,
            max   : 97,
            value : Math.min(currentStatus.sliderValue, 97),
            slide : function(_, ui) {
                var value = parseInt(ui.value, 10);
                    value = value >= 0 && value <= 100 ? value : 0;

                var status = getStatusBySliderValue(value);
                if (status.code !== $slider.data('value')) {
                    $slider.data('value', status.code);
                    setStatusHeading(status, false);
                    $j('#j-currentStatus').val(getStatusBySliderValue(value).code);
                }
            }
        });
    }

    /**
     * Saves the project status and description
     */
    function save() {
        var description = $j.trim($j('#status-description-small').val()),
            statusCode  = $j('#j-currentStatus').val();

        $j('#j-persistedStatus').val(statusCode);
        $j('#jive-current-project-status-body').text(description);

        // save the status
        projectControl.doStatus(description, statusCode, $form.data('projectId'));

        // reset the widget
        close();
    }

    /**
     * Returns a click handler which prevents default then calls the callback provided
     *
     * @param {function} callback
     * @returns {function}
     */
    function mute(callback) {
        return function(e) {
            e.preventDefault();
            callback.apply(this, arguments);
        }
    }


    /*
     * Initialize the component on DOM ready
     */
    $j(function() {
        $form = $j('#project-status-form');

        // set the cssKey, statusId, and text variables
        $j.each(allStatuses, function(statusId) {
            this.cssKey   = statusId;
            this.statusId = statusId;
            this.text     = $form.data('i18n-status-' + statusId);
        });

        // click events
        $form.find('.j-js-update-completion-status').click(mute(toggleProjectCompletion));
        $form.on('click', '.j-js-edit-project-status', mute(edit));
        $form.find('.j-js-cancel').click(mute(close));
        $form.submit(mute(save));

        // Hovering over the header should indicate that it's clickable (if the widget is editable)
        $j('#jive-widget-project-status-header').hover(
            // over
            function() {
                var $header = $j(this);
                if ($header.find('a').length > 0) {
                    // the widget is editable
                    $header.addClass('j-stat-edit');
                }
            },

            // out
            function() { $j(this).removeClass('j-stat-edit'); }
        );
    });
})();
