/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*globals kjs $j */

jive.namespace('DiscussionApp');

/**
 * jive.DiscussionApp.Main
 *
 * JavaScript code to handle comments an various content types.
 *
 * This is the main entry point of the DiscussionApp.  This class acts as a
 * controller.  It instantiates a model layer in the form of
 * jive.DiscussionApp.DiscussionSource and a view layer as
 * jive.DiscussionApp.DiscusssionListView.
 *
 * As a controller, jive.DiscussionApp.Main registers event listeners on the view
 * layer via the jive.conc.observable mixin.  It coordinates UI <-> server
 * interactions when any events occur.
 *
 * This class has no public methods.
 * @depends path=/resources/scripts/apps/discussion_app/models/discussion.js
 * @depends path=/resources/scripts/apps/discussion_app/models/discussion_rest_source.js
 * @depends path=/resources/scripts/apps/discussion_app/models/question_source.js
 * @depends path=/resources/scripts/apps/discussion_app/views/discussion_list_view.js
 * @depends path=/resources/scripts/apps/discussion_app/views/question_view.js
 */
jive.DiscussionApp.Main = function(options) {
    var resourceID        = options.resourceID,
        resourceType      = options.resourceType,
        resourceVersionID = options.resourceVersionID,
        listAction        = options.listAction,
        isModerated       = options.isModerated,
        isThreaded        = options.isThreaded,
        defaultSort       = options.sort || 'datedesc',
        i18n              = options.i18n,
        discussionSource,
        discussionListView,
        questionSource,
        questionView,
        containerSelector = "#jive-thread-messages-container";

    /* ** initialization ** */

    discussionSource = new jive.DiscussionApp.DiscussionRestSource(options);

    discussionListView = new jive.DiscussionApp.DiscussionListView(containerSelector, options);

    discussionListView
    .addListener('saveDiscussion', function(formValues, callBackFn) {
        var discussion = new jive.DiscussionApp.Discussion(formValues),
            listView = this;

        discussionSource.createMessage({
            forumThreadID: discussion.thread,
            ID: discussion.message,
            subject: discussion.subject,
            body: discussion.body,
            name: discussion.name,
            email: discussion.email
        })
        .addCallback(function(data) {
            discussionListView.redisplayReplies(data.content);

            if(questionSource){
                questionSource.getQuestion(questionView.renderAll);
            }

            discussionListView.scrollToLatestMsg();

            if (data.moderated) {
                discussionListView.displayModeratedMessage();
            }
        }).addErrback(function(error, status){
                discussionListView.displayError(error);
                discussionListView._formWaitingView.enableForm();
        });
    });

    discussionListView.addListener('formReady', function() {

    });

    // If this discussion is a question initialize the question view & source classes.
    if(options.question) {
        questionSource = new jive.DiscussionApp.QuestionSource(resourceID);

        questionView = new jive.DiscussionApp.QuestionView(resourceID, questionSource, i18n);

        $j(document).ready(function() {
            questionSource.getQuestion(questionView.renderAll);
        });
    }

    $j(document).ready(function() {
        // Start loading RTE for best performance.
        define(['jive.rte'], $j.noop);
    });

    this.addDiscussionListViewListener = function(event, listener) {
        discussionListView.addListener(event, listener);
    };
};

