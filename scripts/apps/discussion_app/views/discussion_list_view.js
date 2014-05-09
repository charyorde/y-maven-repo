/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.DiscussionApp.DiscussionListView
 *
 * Handles interface events for the overall discussion interface.  Delegates
 * handling of forms and individual discussions to instances of
 * jive.DiscussionApp.FormView and jive.DiscussionApp.DiscussionView respectively.
 *
 * The main purpose of this class is to manage other view classes.  Thus it
 * forms part of a view hierarchy.  It listens for events from nested views and
 * either handles those events or bubbles them up to the controller as
 * necessary.
 *
 * To use create an instance of this class with a DOM element containing a list
 * of discussions as an argument.
 *
 * Mixes in jive.conc.observable.
 *
 * @depends path=/resources/scripts/apps/content/draft/main.js
 *
 * Events:
 * - saveDiscussion (formValues): Fires when a discussion form is submitted, passes
 *   form values as a parameter.
 * - previewDiscussion (formValues, discussionView): Fires when the 'preview' button
 *   in a discussion form is clicked - not yet implemented.
 * - deleteDiscussion (discussionView, discussionID): Fires when a discussion's "delete"
 *   link is clicked - not yet implemented.
 * - sortChange (sort): Fires when the user selects a new sort criteria - not
 *   yet implemented.
 * - addDiscussion (): Fires when the list's "Add a discussion" link is clicked
 *   - not yet implemented.
 */

// TODO reuse code in CommentApp.CommentListView
jive.namespace('DiscussionApp');

jive.DiscussionApp.DiscussionListView = function(container, options) {
    // Mixes in `addListener` and `emit` methods so that other classes can
    // listen to events from this one.
    jive.conc.observable(this);
    var that = this;

    var form,
        rteView,
        listView = this,
        i18n = options.i18n,
        numRepliesSincePageLoad = 0,
        $container,
        autoId = 1;

    this._getValues = function() {
        var vals = {};
        form.find("[name='mobileEditor'],[name='containerType'],[name='container'],[name='thread'],[name='reply'],[name='message'],[name='postedFromGUIEditor'],[name='subject'],[name^='message.post'],[name='inlinePost'],[name='imageFile']")
                .each(
                    function() {
                        var key = $j(this).attr("name");
                        // handle keys with multiple instances properly (imageFile for example)
                        if ((key in vals)) {
                            var old = vals[key];
                            vals[key] = [];
                            if ($j.isArray(old)) {
                                $j.each(old, function(index, value) {
                                    vals[key].push(value);
                                });
                            }
                            else {
                                vals[key].push(old);
                            }
                            vals[key].push($j(this).val());
                        }
                        else {
                            vals[key] = $j(this).val();
                        }
                    }
                );
        var ansQuestionVal = form.find("[name='ansQuestion']:checked");
        if(ansQuestionVal.length > 0)
            vals.ansQuestion = ansQuestionVal.val();

        return $j.extend(vals, { body : rteView.getHTML() });
    };

    function template() {
        return $j('<div></div>').html($j("#rte-template").html());
    }

    /**
     * Renders a discussion form that is appended to the given DOM container.
     *
     * This is a generic function that abstracts some common code.  Call
     * renderPostForm or renderEditForm instead of calling this function
     * directly.
     */
    function renderForm($target, opts) {


        if(rteView){
            // reset the RTE
            console.log("reusing RTE", rteView);
            rteView.setHTML("");
            rteView.focus();
        }else{
            var textAreaId = "wysiwygtext" + autoId;
            ++autoId;

            $target.append(template());
            $target.find("textarea").attr("id", textAreaId);

            var entitlementService = new jive.rte.EntitlementService({
                objectID: options.resourceID,
                objectType: options.resourceType,
                entitlement: "VIEW"
            });

            var imageService = new jive.rte.ImageService({
                objectId: -1,
                objectType: -1,
                containerId: options.containerID,
                containerType: options.containerType
            });

            var formService = new jive.rte.FormService({
                $form: $j("#" + textAreaId).closest("form"),
                formSubmitHandler: function() {
                    hideError();
                    // Configure ajax settings to serialize array values in the old
                    // way.  E.g. "tags=foo&tags=bar" instead of
                    // "tags[]=foo&tags[]=bar".
                    // This is required so that the submitted form fields which have
                    // multiple values submit correctly (imageFile for example)
                    var traditional = $j.ajaxSettings.traditional;
                    $j.ajaxSettings.traditional = true;
                    //grab guest fields
                    var $guestNameField = $j("#reply-author");
                    var guestName = $guestNameField.val();
                    var $guestEmailField = $j("#reply-email");
                    var guestEmail = $guestEmailField.val();
                    var formVals = that._getValues();
                    //validate if guest
                    if ($guestNameField.length > 0 && $j.trim(guestName) === ""){
                        $j('<p/>', { text: jive.DiscussionApp.soy.replyErrorMessage({key:'forum.thrd.name_required.text'})}).message({ style: 'error' });
                        return false;
                    } else if ($guestEmailField.length > 0 && $j.trim(guestEmail) === ""){
                        $j('<p/>', { text: jive.DiscussionApp.soy.replyErrorMessage({key:'forum.thrd.email_required.text'})}).message({ style: 'error' });
                        return false;
                    } else if ($j.trim(formVals.body) === ""){
                        $j('<p/>', { text: jive.DiscussionApp.soy.replyErrorMessage({key:'post.err.pls_enter_body.text'})}).message({ style: 'error' });
                        return false;
                    } else {
                        formVals = $j.extend(formVals, {
                            name: guestName,
                            email: guestEmail
                        });
                    }

                    that._formWaitingView.disableForm();
                    listView.emit('saveDiscussion', formVals, function() {
                        that._formWaitingView.enableForm();

                        // Restore previous ajax settings.
                        $j.ajaxSettings.traditional = traditional;
                    });
                    return false;
                }
            });

            var isGuest = $j("#reply-author").length > 0;

            var rteOptions = $j.extend({
                $element      : $j("#" + textAreaId),
                isEditing     : false,
                onReady       : function(){
                    if(options.rteOptions.onReady){
                        options.rteOptions.onReady();
                    }
                    jive.conc.nextTick(function(){
                        rteView.focus();
                    });

                    if (!isGuest) {
                        var autosaveOptions = {
                            selector: form,
                            objectType: 105, //comment
                            draftObjectType: options.resourceType,
                            draftObjectID: options.resourceID,
                            editorId: textAreaId,
                            pushStateEnabled: false
                        };

                        new jive.draft.Main(autosaveOptions);
                    }

                },
                services: {
                    imageService: imageService,
                    formService: formService,
                    entitlementService: entitlementService
                }
            }, options.rteOptions);

            rteView = new jive.rte.RTEWrap(rteOptions);

            form = rteOptions.$element.parents("form");

            // Register listeners for form events.
            form.find(".jive-form-button-cancel").click(function() {
                closeForm();
                rteView.destroy();
                rteView = null;
            });
            setAdvEditorLnk(opts);
        }

        form.find("[name=message]").val(opts.parentDiscussionID);
        listView.emit('formReady', {
            discussionId: opts.resourceID,
            parentMessageId: opts.parentDiscussionID,
            isReply: opts.isReply
        });
    }

    function setAdvEditorLnk(options){
        that._advEditorLnk = options.advEditorLnk;
        getAdvEditorLnkElem().click(function(){
            setAdvEditorLinkWithBody();
            return false;
        });
    }
    function getAdvEditorLnkElem(){
        return $container.parent().find(".advEditor");
    }
    function setAdvEditorLinkWithBody(){
        var body = rteView.getHTML();
        if(body != null && body.length > 0){
            body = "&unsanitaryBody=" + encodeURIComponent(body);
        }
        that._formWaitingView.disableForm();
        jive.util.createAndSubmitDynamicForm({url:that._advEditorLnk + body, method:'post'});
    }

    /**
     * Renders a post form attached to the given discussionView element.  This
     * type of form is used for submitting new discussions and replies.
     */
    function renderPostForm(replyTo) {
        // Remove any existing comment forms before rendering a new one.
        closeForm();

        replyTo.setQuotedMsg(replyTo.username, i18n, replyTo.isAnonymous);

        var formOpts = $j.extend({
            parentDiscussionID: replyTo.messageID,
            advEditorLnk: replyTo.advEditorLnk,
            isReply: replyTo.isReply,
            replySubject: replyTo.replySubject,
            userName:     replyTo.username
        }, options);

        // Display form area.
        var target = showFormArea(replyTo);

        return renderForm(target, formOpts);
    }

    /**
     * Given a DOM element returns an instance of
     * jive.DiscussionApp.DiscussionView representing the content of that
     * element.
     */
    function messageView(element) {
        var container = $j(element).closest('.jive-thread-message, .j-thread-post, #jive-thread-reply-footer');
        if (container.length > 0) {
            return new jive.DiscussionApp.DiscussionView(container);
        } else {
            return null;
        }
    }

    /**
     * Performs initialization that has to be re-run every time the discussion
     * is refreshed.
     */
    function reInitialize() {
        $j('.jive-thread-reply-hidden').closest('.reply').css('background-position', 'left -55px');
    }

    /**
     * Hooks up click handlers for message reply links.
     */
    function initializeDiscussions() {
        $container.find('a.discussionAdd').live('click', function() {
            var view = messageView(this);
            renderPostForm(view);
            return false;
        });

        reInitialize();
    }

    /**
     * displayError(msg)
     *
     * Displays the given error in the active form's error notification area.
     */
    function displayError(msg) {
        $container.find('.jive-js-addReply #post-error-table > #post-error-subject').html(msg).show().parent().slideDown();
    }

    /**
     * displayLoginError()
     *
     * Displays a login error in the active form's error notification area.  Handles cases where the server is down
     * or user's session has timed out or is invalidated.
     */
    function displayLoginError() {
        // remove # character otherwise page will not reload.  Set the location to the current window location so
        // that the user is properly redirected.
        displayError(jive.i18n.sub(i18n.globalLoginRequired, '<a href="' + encodeURI(window.location).replace(/#.*$/, '') + '">', '</a>'));
    }

    function hideError(){
        $container.find('.jive-js-addReply #post-error-table').slideUp().find('#post-error-subject').html('').hide();
    }

    /**
     * displaySuccess(msg, doScroll)
     *
     * Displays the given message at the top of the page with a check mark next
     * to it.
     * @param msg Message being displayed.
     * @param doScroll if true, scroll up to the message.
     */
    function displaySuccess(msg, doScroll) {
        $j('#success-moderation-edit')
        .html('<div><span class="jive-icon-med jive-icon-warn"></span>' + msg + '</div>')
        .fadeIn('normal', function() {
            if (doScroll) {
                $j.scrollTo($j('#success-moderation-edit'), 'slow', {offset: {top:-20, left:0}} );
            }
        });
    }

    /**
     * hideSuccess
     *
     * Hides success message
     */
    function hideSuccess() {
        $j('#success-moderation-edit').hide();
    }

    /**
     * Given an instance of jive.DiscussionApp.DiscussionView determines the
     * position where a reply form should be placed.  The return value is a
     * jQuery instance that a form can be appended to.
     */
    function formPosition(replyTo) {
        var messageElem = !replyTo.isReply ? $container.find('ul.jive-discussion-replies:first > li:last') :
                                             replyTo.getDOMElement().closest('li.reply');

        var useMessageElemParentForAppend = true;

        // case where we have no comments yet
        if (messageElem.length === 0 && !replyTo.isReply) {
            messageElem = $j('<ul class="jive-discussion-replies jive-discussion-flat jive-discussion-indent-0"/>');
            $container.append(messageElem);

            useMessageElemParentForAppend = false;
        }

        var appendElem;
        if (options.isThreaded && replyTo.isReply) {
            appendElem = messageElem.find('ul.jive-discussion-replies:first > li:last');

            // case where this comment current has no children
            if(appendElem.length == 0){
                appendElem = $j('<ul class="jive-discussion-replies jive-discussion-flat jive-discussion-indent-1"/>');
                messageElem.append(appendElem);
                return appendElem;
            } else {
                return appendElem.parent();
            }

        } else {
            appendElem = useMessageElemParentForAppend ? messageElem.parent() : messageElem;
            return appendElem;
        }
    }

    /**
     * Given an instance of jive.DiscussionApp.DiscussionView renders markup
     * for displaying a post form area for replying to the given message and
     * returns a reference to the position where an instance of
     * jive.DiscussionApp.RteView should be rendered.
     */
    function showFormArea(replyTo) {

        var templateElem = $container.find('.jive-js-addReply');
        if(templateElem.length > 0){
            templateElem.remove();
            if(rteView){
                rteView.destroy();
                rteView = null;
            }
        }
        templateElem = $j(jive.DiscussionApp.soy.renderReply({
            userName: replyTo.username,
            messageID: replyTo.messageID,
            i18n: i18n,
            anonymous: options.isAnonymous,
            moderated: options.isModerated
        }));

        // Get a position for the form area and draw it there.
        formPosition(replyTo).append(templateElem);

        /* un-indent the inline reply form (in order to show the RTE as wide as possible) */
        var messageIndent = replyTo.indent();
        $j('.addReply').css('margin-left', -messageIndent +'px');

        that._formWaitingView    = new jive.shared.FormWaitingView($container.find('.jive-js-addReply'),
            {i18n:options.i18n, containerPadding:messageIndent, bgCssClass:'jive-form-waiting-disable-bg-discusssions'});

        // Show the form area and scroll it into view.
        templateElem.fadeIn('fast');
        $j.scrollTo(templateElem, 'slow', {offset: {top:-40, left:0} });

        return templateElem.find('.jive-discussion-post');
    }

    /**
     * closeForm()
     *
     * If a discussion form is displayed, this method closes it.  Only one form
     * may be displayed at a time.
     */
    function closeForm() {

        var $elem = $container.find('.jive-js-addReply');
        var $elemParent = $elem.parent();

        $elem.fadeOut('fast', function(){
            if($elemParent.children().length == 0){
                // remove parent ul element if it's empty, otherwise unwanted whitespace will show up in IE
                $elemParent.hide();
            }
        });
    }

    /**
     * redisplayReplies - redisplay the replies after a post from the inline rte
     * @param newReply - the new reply object returned from the service call
     */
    function redisplayReplies(newReply){
        rteView.destroy();
        rteView = null;

        // Preserve rating display if it exists.  Detach it before
        // updating $container html to preserve event handlers.
        var rating = $container.find('.jive-content-rating').detach();
        // Prevents script from executing again when this element is re-added.
        rating.find('script').remove();

        $j.ajax({
            url: _jive_base_url + "/inline-message.jspa?message=" + newReply.id,
            async: false,
            success: function(data) {
                $container.closest('.j-column-wrap-l').replaceWith($j(data));
                $container = $j('#jive-thread-messages-container');
                jive.rte.renderedContent.emit("renderedContent", $container);
            }
        });

        $container.find('.jive-content-rating').replaceWith(rating);

        // initialize the new dom
        reInitialize();

        
    }

    /**
     * displayModeratedMessage - update the discussion with a "in moderation" message after a post from the inilne RTE.
     * @param moderatedMessage - portion of the dom in the response that contains the "message being moderated" message.
     */
    function displayModeratedMessage(moderatedMessage){
        moderatedMessage = moderatedMessage || $j('<p>').html(options.i18n.postSuccessText);
        var doScroll = numRepliesSincePageLoad <= 0;
        displaySuccess(moderatedMessage.html(), doScroll);
        numRepliesSincePageLoad+=1;
    }

    /**
     * scrollToLatestMsg - scrolls to the latest message in the thread
     */
    function scrollToLatestMsg(){
        // move to the newly created message
        $j('a.localScroll').first().click();
    }

    /**
     * getBaseFormElem()
     *
     * Simple util method to get base form element
     */
    function getBaseFormElem(){
        return $container.find('#discussionForm-baseDiscussionForm');
    }

    /* ** public interface ** */

    this.displayError   = displayError;
    this.displayLoginError   = displayLoginError;
    this.displaySuccess = displaySuccess;
    this.hideSuccess = hideSuccess;
    this.scrollToLatestMsg = scrollToLatestMsg;
    this.redisplayReplies = redisplayReplies;
    this.displayModeratedMessage = displayModeratedMessage;

    /* ** initialization ** */

    $j(document).ready(function() {
        $container = $j(container);
        // initialize
        initializeDiscussions();
    });
};
