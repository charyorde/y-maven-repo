/**
 * jive.CommentApp.CommentView
 *
 * View class representing a single comment.  Create an instance of this class
 * with a DOM element representing a comment as an argument.  The instance will
 * set up event listeners for that comment and will provide rendering helpers.
 *
 * Mixes in jive.conc.observable.
 *
 * Events:
 * - edit   (commentID): Fires when the comment's "edit" link is clicked.
 * - delete (commentID): Fires when the comment's "delete" link is clicked.
 * - reply  (commentID): Fires when the comment's "reply" link is clicked.
 * - remove (commentID): Fires when the comment is removed from the DOM.
 */

/*jslint browser:true */
/*extern jive $j */

jive.namespace('CommentApp');

jive.CommentApp.CommentView = function(commentElement, options) {
    // Mixes in `addListener` and `emit` methods so that other classes can
    // listen to events from this one.
    jive.conc.observable(this);

    var commentID = options.id,
        $commentElement = $j(commentElement),
        isThreaded = options.isThreaded,
        i18n = options.i18n,
        that = this;

    /**
     * remove()
     *
     * Removes the associated comment from the DOM.  Fires a 'remove' event
     * after the comment is removed.
     */
    function remove() {
        // highlight and fade before doing ajax call, feels snappier
        $commentElement.fadeOut(function() {
            $j(this).remove();
        });
        this.emit('remove', commentID);
        return this;
    }

    /**
     * displayPreview(html)
     *
     * Displays the given html in the preview area of the comment div.
     */
    function displayPreview(html) {
        $commentElement.find('[class*=comment-preview]').html(html).fadeIn();
    }

    /**
     * getDOMElement()
     *
     * Returns the DOM element that was given when the instance was
     * constructed.  If a selector was given to the constructor instead of an
     * element returns the actual element as a jQuery object.
     */
    function getDOMElement() {
        return $commentElement;
    }

    /**
     * setQuotedMsg
     */
    function setQuotedMsg(userName, isAnonymous, $msgElem){
        if(!$msgElem){
            $msgElem = $commentElement;
        }
        var msgBody = $msgElem.find('.jive-rendered-content').html();
        jive.SharedViews.RteView.setMiniRTEQuotedMsg(userName, i18n, isAnonymous, msgBody);
    }

    /**
     * showCommentEdit
     *
     */
    function showCommentEdit(){
        // hide portions of comment ui that does not apply to edit
        $commentElement.find('.jive-comment-meta:first, #comment-body-' + commentID +
            ', #comment-action-div-' + commentID).hide();
        $commentElement.find('.jive-comment-meta:first').after(
                '<p class="jive-js-edit-title jive-comment-meta font-color-meta-light">' +
                i18n.cmntEditingTitle +
                '</p>');
    }

    /**
     * hideCommentEdit
     */
    function hideCommentEdit(){
        $commentElement.find('.jive-comment-meta:first, #comment-body-' + commentID +
            ', #comment-action-div-' + commentID).show();
        $commentElement.find('.jive-js-edit-title').remove();
    }

    /**
     * getCommentID
     */
    function getCommentID(){
        return commentID;
    }

    /**
     * username
     *
     * Returns the username of the user that wrote this comment.
     */
    function username() {
        return $commentElement.find('.jive-username-link:first').text();
    }

    /**
     * append
     *
     * Appends given content as a child of this comment.  In threaded
     * discussions this appends an indented child.  Otherwise places content
     * after this comment in a flat list.
     */
    function append(html) {
        var target;
        if (isThreaded) {
            target = $commentElement.find('ul.jive-comment:first');

            // If this comment does not have any children yet we may need to
            // create a new list to contain the given content.
            if (target.length === 0) {
                target = $j('<ul/>', {
                    'class': 'jive-comment clearfix jive-comment-threaded jive-comment-indent-1'
                });
                $commentElement.append(target);
            }
            target.append(html);

        } else {
            $commentElement.parent().append(html);
        }
    }

    /**
     * indent()
     *
     * Returns the indent level of this comment as an integer number of pixels.
     */
    function indent() {
        var parents = $commentElement.parents().andSelf().filter('ul.jive-comment').toArray();
        // The top-level comment is defined to have an indent level of 0.  So
        // exclude the oldest parent from the calculation.
        return parents.slice(1).reduce(function(margin, parent) {
            return margin + parseInt($j(parent).css('margin-left'), 10);
        }, 0);
    }

    /* ** public interface ** */

    this.remove          = remove;
    this.displayPreview  = displayPreview;
    this.getDOMElement   = getDOMElement;
    this.setQuotedMsg    = setQuotedMsg;
    this.getCommentID    = getCommentID;
    this.username        = username;
    this.showCommentEdit = showCommentEdit;
    this.hideCommentEdit = hideCommentEdit;
    this.append          = append;
    this.indent          = indent;
};
