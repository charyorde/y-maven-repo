/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.content.polls.OptionView
 *
 * View class representing a single poll option.  Create an instance of this class
 * with a DOM element representing a poll option as an argument.  The instance will
 * set up event listeners for that poll option and will provide rendering helpers.
 *
 * Mixes in jive.conc.observable.
 *
 * Events:
 * - moveUp     (optionID): Fires when the poll option's "up" link is clicked.
 * - moveDown   (optionID): Fires when the poll option's "down" link is clicked.
 * - delete     (optionID): Fires when the poll option's "delete" link is clicked.
 * - addLink    (optionID): Fires when the poll option's "add link" icon is clicked.
 * - addImage   (optionID): Fires when the poll option's "add image" icon is clicked.
 * - addVideo   (optionID): Fires when the poll option's "add video" icon is clicked.
 */

/*jslint browser:true */
/*extern jive $j */

/**
 * @depends template=jive.polls.option.soy.*
 */

jive.namespace('content.polls');

jive.content.polls.OptionView = function(optionElement, options) {

    // Mixes in `addListener` and `emit` methods so that other classes can
    // listen to events from this one.
    jive.conc.observable(this);

    var optionID,
        optionIndex,
        edit = options.edit,
        that = this;

    /**
     * remove()
     *
     * Fires a 'remove' event.
     */
    function remove() {
        $j(optionElement).fadeOut();
        that.emit('remove', optionID);
        return this;
    }

    /**
     * Displays the option again if it cannot be removed due to a server side error.
     */
    function removeError() {
        $j(optionElement).fadeIn();
    }

    /**
     * Remove is successful, remove the element.
     */
    function removeSuccess() {
        $j(optionElement).remove();
    }

    function promptRemove() {

        // grab the option text and number of votes out of the dom
        var optionText = $j(optionElement).find('.j-choice').val();

        // check to see if the prompt has already been rendered and remove it as the option text may have changed
        if ($j("#jive-modal-delete-poll-option-" + optionID).length > 0) {
            $j("#jive-modal-delete-poll-option-" + optionID).remove();
        }

        var output = jive.polls.option.soy.deletePrompt({optionID:optionID, optionText:optionText});
        $j('#jive-poll-options').append($j(output));

        $j("#jive-modal-delete-poll-option-" + optionID).lightbox_me({closeSelector: ".jive-modal-close, .close"});

        $j("#poll-option-delete-submit-button-" + optionID).click(function() {
            that.remove();
        });
    }

    /**
     * resetIndex()
     *
     * Resets the click handlers and the DOM to adjust to a re-order.
     */
    function setIndex(newIndex) {
        optionIndex = newIndex;
        ($j(optionElement).find('.jive-opt-index')).val(newIndex);
        ($j(optionElement).find('.js-poll-option-count').html(++newIndex));
        return this;
    }


    /**
     * getDOMElement()
     *
     * Returns the DOM element that was given when the instance was
     * constructed.  If a selector was given to the constructor instead of an
     * element returns the actual element as a jQuery object.
     */
    function getDOMElement() {
        return $j(optionElement);
    }

    /* ** public interface ** */

    this.remove         = remove;
    this.promptRemove   = promptRemove;
    this.removeSuccess  = removeSuccess;
    this.removeError    = removeError;
    this.getDOMElement  = getDOMElement;
    this.setIndex       = setIndex;

    $j(document).ready(function() {
        optionID = ($j(optionElement).attr('id') || '').split('-').last();
        optionIndex = ($j(optionElement).find('.jive-opt-index')).val();

        $j(optionElement).find('.poll-option-delete').click(function() {
            if (edit) {
                promptRemove();
            }
            else {
                remove();
            }
            return false;
        });
    });
    
}
