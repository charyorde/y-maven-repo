/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.DiscussionApp.DiscussionView
 *
 * View class representing a single discussion.  Create an instance of this class
 * with a DOM element representing a discussion as an argument.  The instance will
 * set up event listeners for that discussion and will provide rendering helpers.
 *
 * Mixes in jive.conc.observable.
 *
 * Events:
 * - edit   (discussionID): Fires when the discussion's "edit" link is clicked - not yet implemented.
 * - delete (discussionID): Fires when the discussion's "delete" link is clicked - not yet implemented.
 * - reply  (discussionID): Fires when the discussion's "reply" link is clicked - not yet implemented.
 * - remove (discussionID): Fires when the discussion is removed from the DOM.
 */

jive.namespace('DiscussionApp');

jive.DiscussionApp.DiscussionView = function(discussionElement) {
    // Mixes in `addListener` and `emit` methods so that other classes can
    // listen to events from this one.
    jive.conc.observable(this);

    var $discussionElement = $j(discussionElement),
        self = this;

    /**
     * remove()
     *
     * Removes the associated discussion from the DOM.  Fires a 'remove' event
     * after the discussion is removed.
     */
    function remove() {
        // highlight and fade before doing ajax call, feels snappier
        $discussionElement.fadeOut(function() {
            $j(this).remove();
        });
        self.emit('remove', self.messageID);
        return self;
    }

    /**
     * displayPreview(html)
     *
     * Displays the given html in the preview area of the discussion div.
     */
    function displayPreview(html) {
        $discussionElement.find('[class*=discussion-preview]').html(html).fadeIn();
    }

    /**
     * getDOMElement()
     *
     * Returns the DOM element that was given when the instance was
     * constructed.  If a selector was given to the constructor instead of an
     * element returns the actual element as a jQuery object.
     */
    function getDOMElement() {
        return $discussionElement;
    }

    /**
     * setQuotedMsg
     *
     * @return Message in qouted form for use int the mini-RTE
     */
    function setQuotedMsg(userName, i18n, isAnonymous){
        var msgBody = $discussionElement.find('.jive-rendered-content').html();
        jive.SharedViews.RteView.setMiniRTEQuotedMsg(userName, i18n, isAnonymous, msgBody);
    }

    /**
     * indent()
     *
     * Returns the indent level of this message as an integer number of pixels.
     */
    function indent() {
        var parents = $discussionElement.parents().andSelf().filter('li.reply').toArray();
        // The top-level message is defined to have an indent level of 0.  So
        // exclude the oldest parent from the calculation.
        return parents.slice(1).reduce(function(margin, parent) {
            var $parent = $j(parent);
            return margin + parseInt($parent.css('margin-left'),  10) +
                            parseInt($parent.css('padding-left'), 10);
        }, 0);
    }

    /* ** public interface ** */

    this.remove         = remove;
    this.displayPreview = displayPreview;
    this.getDOMElement  = getDOMElement;
    this.setQuotedMsg   = setQuotedMsg;
    this.indent         = indent;

    /* ** initialization ** */
    (function(pub) {
        var link = $discussionElement.find('a.discussionAdd');

        /* ** public attributes ** */
        pub.messageID    = link.attr('data-messageID');
        pub.username     = link.attr('data-discussionusername');
        pub.isReply      = (link.attr('data-isReply') || '').toLowerCase() === 'true';
        pub.replySubject = link.attr('data-replySubject');
        pub.isAnonymous  = (link.attr('data-isAnonymous') || '').toLowerCase() === 'true';
        pub.advEditorLnk = link.attr('data-advEditorLnk');
    })(this);
};
