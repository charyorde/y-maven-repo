/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.CommentApp.CommentListView
 *
 * Handles interface events for the overall comment interface.  Delegates
 * handling of forms and individual comments to instances of
 * jive.CommentApp.FormView and jive.CommentApp.CommentView respectively.
 *
 * The main purpose of this class is to manage other view classes.  Thus it
 * forms part of a view hierarchy.  It listens for events from nested views and
 * either handles those events or bubbles them up to the controller as
 * necessary.
 *
 * To use create an instance of this class with a DOM element containing a listf
 * of comments as an argument.
 *
 * Mixes in jive.conc.observable.
 *
 * Events:
 * - saveComment (formValues): Fires when a comment form is submitted, passes
 *   form values as a parameter.
 * - previewComment (formValues, commentView): Fires when the 'preview' button
 *   in a comment form is clicked.
 * - deleteComment (commentView, commentID): Fires when a comment's "delete"
 *   link is clicked.
 * - sortChange (sort): Fires when the user selects a new sort criteria.
 * - addComment (): Fires when the list's "Add a comment" link is clicked.
 *
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 */

/*jslint browser:true undef:true */
/*global jive $j window */

jive.namespace('CommentApp');

jive.CommentApp.CommentListView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    // Mixes in `addListener` and `emit` methods so that other classes can
    // listen to events from this one.
    jive.conc.observable(this);

    this.init = function(containerID, options) {
        var listView = this;

        this.container  = '#' + containerID;
        this.containerID = containerID;
        this.isThreaded = options.isThreaded;
        this.i18n       = options.i18n;
        this.options    = options;

        $(document).ready(function() {
            // Notify controller when the user selects a new sort criteria.
            $(listView.container).delegate('#inline-comment-sort', 'change', function() {
                listView.emit('sortChange', $(this).val());
            });

            listView.bindEvents();
        });
    };

    this.getContent = function() {
        return $(this.container);
    };

    /**
     * closeForm()
     *
     * If a comment form is displayed, this method closes it.  Only one form
     * may be displayed at a time.
     */
    this.closeForm = function() {
        if (this.form) {
            this.form.remove();
            this.form = null;
            $('.jive-comment-add-link').show();
            this.emit('formClosed');
        }
    };

    /**
     * Renders a comment form that is appended to the given DOM container.
     *
     * This is a generic function that abstracts some common code.  Call
     * renderPostForm or renderEditForm instead of calling this function
     * directly.
     */
    this.renderForm = function(formKlass, target, commentView, options) {
        var listView = this;

        // Remove any existing comment forms before rendering a new one.
        this.closeForm();

        // Display form container
        var isEditFormView = formKlass === jive.CommentApp.EditFormView;
        if (isEditFormView) {
            this.hideShowCommentForm(commentView.getDOMElement(), false);
        } else {
            this.hideShowCommentForm(null, false);
        }
        // Hide the bottom 'Add a comment' link
        $('.jive-comment-add-link').hide();
        // Render the new form.
        this.form = new formKlass(target, options);
        target.parent(".jive-rendered-content").removeClass("jive-rendered-content");

        // Register listeners for form events.
        this.proxyListener(this.form, 'post', 'saveComment', function(_, promise) {
            promise.addCallback(function() {
                listView.closeForm();  // Close the form after a successful post.
            }).addErrback(function(message, status) {
                listView.displayError(message, status);
            });
        });
        this.proxyListener(this.form, 'post', 'savedComment');

        this.proxyListener(this.form, 'cancel', 'cancelComment', function() {
            listView.closeForm();
            listView.hideShowCommentForm(null, true);
        });

        this.form.addListener('remove', function() {
            if (isEditFormView) {
                commentView.hideCommentEdit();
            }
        });
    };

    /**
     * Renders a post form attached to the given commentView element.  If no
     * commentView instance is given renders a form at the end of the comment
     * list.  This type of form is used for submitting replies and new
     * comments.
     */
    protect.renderPostForm = function(commentView, options) {
        var postForm;
        if (!options) {
            options = commentView;
            commentView = null;
            postForm = this.newCommentForm();
        } else {
            postForm = this.replyCommentForm(commentView);
        }
        var target = $(postForm).find('.jive-comment-post');
        // Add form container and renderForm
        return this.renderForm(jive.CommentApp.FormView, target, commentView, $.extend({i18n:this.i18n}, options));
    };

    /**
     * Renders an edit form attached to the given commentView element and
     * populates the form with the associated comment's data.
     */
    protect.renderEditForm = function(commentView, options) {
        var target = $(commentView.getDOMElement());
        if (!target.is('.jive-comment-edit')) {
            target = target.find('.jive-comment-edit:first');
        }
        return this.renderForm(jive.CommentApp.EditFormView, target, commentView, options);
    };

    /**
     * Creates an instance of CommentView for each comment in the given DOM
     * container.
     *
     * In addition a special CommentView instance is created for the
     * '#jive-content-post-comments' div.  This instance represents the "new
     * comment" area.
     */
    protect.bindEvents = function() {
        var listView = this;

        function commentID(element) {
            return $(element).closest('.jive-comment-actions').attr('data-comment-id');
        }

        function commentView(element) {
            var container = $(element).closest('li[id^=comment-]');
            return (new jive.CommentApp.CommentView(container, $.extend({ id: commentID(element) }, listView.options)));
        }

        function getUserNameHelper(replyToElem){
            return $(replyToElem).attr('commentusername');
        }

        function quoteHelper(replyToElem, view, userName, useReplyToElem){
            var $replyToElem = $(replyToElem);
            // length will be zero if comment is top level and has no parents.
            if($replyToElem.length === 0){
                window._jive_gui_quote_text = "";
            } else {
                var isAnon = $replyToElem.attr('data-isAnonymous').toLowerCase() == 'true';
                view.setQuotedMsg(userName, isAnon, (useReplyToElem ? $replyToElem.parents('li:first'): null));
            }
        }

        // Hook up event handlers for individual comment actions.  This one
        // handles editing a comment.
        var $container = $(this.container);
        $container.delegate('.jive-comment-actions a:has(.commentEdit)', 'click', function(event) {
            // remove any previous forms
            listView.hideShowCommentForm(null, true);
            var commentId = commentID(this);
            // get correct element for setting quote text
            // parent id is stored in element
            var parentId = $(this).attr('data-parentID');
            var emitData = { 'id': commentId };
            if(parentId) {
                $.extend(emitData, {'inReplyTo': {'id': parentId }});
            }
            listView.emit('editComment', emitData);
            var view = commentView(this),
                $replyToLink = $('#comment-' + parentId).find('a:has(.commentAdd):first'),
                userName = getUserNameHelper($replyToLink);
            // set quote text
            quoteHelper($replyToLink, view, userName, true);
            view.showCommentEdit();
            listView.renderEditForm(view, $.extend({ id: commentID(this) }, listView.options));
            event.preventDefault();
        });

        // Deleting a comment.
        $container.delegate('.jive-comment-actions a:has(.commentDelete)', 'click', function(event) {
            listView.emit('deleteComment', commentView(this), commentID(this));
            event.preventDefault();
        });

        // Replying to a comment.
        $container.delegate('.jive-comment-actions a:has(.commentAdd)', 'click', function(event) {
            var commentId = commentID(this);
            var emitData = {'id': 0, 'inReplyTo': {'id': commentId }};
            listView.emit('replyComment', emitData);
            var userName = getUserNameHelper(this), view = commentView(this);

            quoteHelper(this, view, userName);
            listView.updateBaseCommentUsername(userName);
            listView.renderPostForm(view, $.extend({ parentCommentID: commentID(this) }, listView.options));

            event.preventDefault();
        });

        // Render a comment form when one of the "Add a comment" links
        // is clicked.
        $container.delegate('.js-add-comment', 'click', function(event) {
            listView.emit('createComment', { 'id': 0 });
            window._jive_gui_quote_text = "";
            listView.updateBaseCommentUsername('');
            listView.renderPostForm(listView.options);
            $('.jive-create-comment p.jive-comment-meta').hide();
            event.preventDefault();
        });
    };

    /**
     * scrollToPermalink()
     *
     * Checks the location hash for a comment ID and scrolls that comment into view.
     */
    protect.scrollToPermalink = function() {
        var hash = (window.location.hash.match(/^#([^\/].+)$/) || [])[1];
        var target = hash ? $(this.container + ' a[name="'+ hash +'"], ' + this.container + ' [id="'+ hash +'"]') : $();
        if (target.length > 0) {
            if (!this.getContent().is(":visible") && window.tabView) {
                window.tabView.setVisibility(this.containerID, true);
                window.tabView.switchTo(this.containerID);
            }
            $.scrollTo(target, 200, { offset: { top: -20, left: -200 } });
        }
    };

    /**
     * setContent(html)
     *
     * Renders a list of comments.  The `html` argument should be a collection
     * of comments rendered as HTML.
     */
    this.setContent = function(html) {
        var $container = $(this.container).html(html);
        this.scrollToPermalink();

        jive.rte.renderedContent.emit("renderedContent", $container);
    };

    /**
     * displayError(msg)
     *
     * Displays the given error in the active form's error notification area.
     */
    this.displayError = function(msg, status) {
        // check status to see if user needs to re-login
        if (status == 401 || status == 403 || status == 4026 || status === 0) {
            // remove # character otherwise page will not reload.  Set the location to the current window location so
            // that the user is properly redirected.
            msg = jive.i18n.sub(this.i18n.globalLoginRequired, '<a href="' + encodeURI(window.location).replace(/#.*$/, '') + '">', '</a>');
        }
        msg = msg || this.i18n.globalAjaxError;
        $('#jive-comment-error').html(msg).show();
    };

    /**
     * displayError(msg)
     *
     * Displays the given message at the top of the page with a check mark next
     * to it.
     */
    this.displaySuccess = function(msg) {
        $('#success-moderation-edit')
        .html('<div><span class="jive-icon-med jive-icon-warn"></span>' + msg + '</div>')
        .show();
        $.scrollTo($('#success-moderation-edit'), 'slow', {offset: {top:-40, left:0} });
    };

    /**
     * setPreviewButtonText(text)
     *
     * Sets the text of the 'preview' button in the active form.
     */
    this.setPreviewButtonText = function(text) {
        // preview functionality has been removed from the RTE, uncomment this and other lines to re-enable
        /*return this.form && this.form.setPreviewButtonText(text);*/
    };

    /**
     * Scrolls the top of the comments list into view.
     */
    this.scrollTo = function(speed) {
        var scrollTarget = $(this.container);
        if (!this.inView(scrollTarget)) {
            $.scrollTo($(this.container), speed || 200, { offset: { top: -30, left: 0 } });
        }
    };

    protect.inView = function(elem) {
        var docViewTop = $(window).scrollTop()
          , docViewBottom = docViewTop + $(window).height()

          , elemTop = $(elem).offset().top;

        return ((elemTop >= docViewTop) && (elemTop <= docViewBottom));
    };

    /**
     * hideShowCommentForm
     *
     * Simple util method to hide or show the comment form
     * $elem - element to hide or show
     * hide - boolean, true to hide, false to show
     */
    protect.hideShowCommentForm = function($elem, hide) {
        $elem = $elem || $(this.container).find('.jive-js-addReply');
        if ($elem.length === 0) { return; }
        if (hide) {
            $elem.fadeOut('fast').remove();
        } else {
            $elem.fadeIn('fast');
            $.scrollTo($elem, 'slow', {offset: {top:-100, left:0}, axis: 'y' });
        }
    };

    /**
     * listElement
     *
     * Returns the top-level comment list element.  In flat view there will
     * only be one such list element.  In threaded mode there may be nested
     * lists.
     */
    protect.listElement = function() {
        var elem = $(this.container).find('ul.jive-comment:first');
        if (elem.length === 0) {
            elem = $('<ul/>', {
                'class': 'jive-comment jive-comment-threaded clearfix jive-comment-indent-0'
            });
            $(this.container).find('.jive-comment-container').html(elem);
        }
        return elem;
    };

    /**
     * append
     *
     * Appends given content as a child of this list.
     */
    protect.append = function(content) {
        this.listElement().append(content);
    };

    /**
     * newCommentForm
     *
     * Renders a form for composing a new top-level comment.
     * @return a jQuery instance representing a comment form
     */
    protect.newCommentForm = function() {
        // remove any previous forms
        this.hideShowCommentForm(null, true);
        var formContent = $(jive.CommentApp.soy.renderReply({
            i18n: this.i18n
        }));
        this.append(formContent);
        return formContent;
    };

    /**
     * replyCommentForm
     *
     * Renders a form for composing a reply to an existing comment.
     * @param commentView - CommentView instance representing the parent comment
     * @return a jQuery instance representing a comment form
     */
    protect.replyCommentForm = function(commentView) {
        // remove any previous forms
        this.hideShowCommentForm(null, true);
        var formContent = $(jive.CommentApp.soy.renderReply({
            commentID: commentView.getCommentID(),
            username: commentView.username(),
            i18n: this.i18n
        }));

        // Append the form as a child of the given commentView.
        commentView.append(formContent);

        if (this.isThreaded) {
            /* un-indent the inline reply form (in order to show the RTE as wide as possible) */
            var commentIndent = commentView.indent(),
                formIndent = parseInt(formContent.parent().css('margin-left'), 10);
            formContent.css('margin-left', -commentIndent -formIndent +'px');
        }

        return formContent;
    };

    /**
     * getBaseFormElem()
     *
     * Simple util method to get base form element
     */
    protect.getBaseFormElem = function(){
        return $(this.container).find('.baseCommentForm');
    };

    /**
     * updateBaseCommentUsername(commentUsername)
     *
     * Simple util method to get base form element
     */
    protect.updateBaseCommentUsername = function(commentUsername){
        if(!this.isThreaded){
            this.getBaseFormElem().find('.replyToName').html(commentUsername);
        }
    };

    /**
     * Adds a transition spinner that should be executed prior to setting the html list content.
     */
    this.beforeListLoad = function() {
        $(this.container).append('<div class="j-loader-box">' + this.i18n.loading + '</div>');
    };
});
