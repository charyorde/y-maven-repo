/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.DiscussionApp.QuestionView
 *
 * Handles interface events for the question interface within the discussion functionality.
 *
 * Mixes in jive.conc.observable.
 *
 */

jive.namespace('DiscussionApp');

/**
 * Constructor for the View class for Question functionality in Discussions.
 *
 * @param resourceId threadID (in this case).
 * @param questionSourceCallback QuestionSource instance (model class).
 * @param i18n object with internationalized strings.
 */
jive.DiscussionApp.QuestionView = function(resourceId, questionSourceCallback, i18n) {

    // Mixes in `addListener` and `emit` methods so that other classes can
    // listen to events from this one.
    jive.conc.observable(this);

    var that = this;

    var t;

    /**
     * This is the client side representation of the enum Question.State in the core application.
     * The values of this object should always reflect the string values of the enum to work properly.
     *
     * Unfortunately IE8 doesn't support 'const' keyword
     */
    var questionStateEnum = {open : 'open', resolved : 'resolved', assumed_resolved : 'assumed_resolved'};


    /**
     * Re-render (or initialize) all client side question related mark up for this page.
     *
     * @param question question object with data from the server.
     */
    function renderAll(question) {
        // update answer bar
        renderQuestionStateMessage(question);

        // inject correct / helpful answer
        renderInlineAnswers(question);

        // cycle through messages, update buttons
        renderResponses(question);

        if ($j.browser.msie && $j.browser.version < 7) {
            $j('#jive-thread-messages-container').hide().show();
        }

   }

    /**
     * UI handler for markAsHelpful action.
     *
     * @param container the button that was clicked.
     * @param question question object with data from the server.
     */
    function markAsHelpful(container, question) {

        var helpfulCount = question.numHelpful;
        var maxHelpfulCount = question.totalNumHelpful;
        var helpfulCountRemaining = maxHelpfulCount-helpfulCount;

        // inject correct / helpful answer
        renderInlineAnswers(question);

        // if no helpful answers left to mark, update all rendering since a lot will likely need to be modified.
        if (helpfulCountRemaining == 0)  {
            // cycle through messages, update buttons
            renderResponses(question);
        }
        // otherwise no need to traverse all page.
        else {
            var replyDiv = container.closest('.js-thread-post-wrapper');
            renderReply(replyDiv, question);
        }

        /* display the 'helpful answers remaining' message (if more than 1 left) */
        $j(container).closest('.jive-thread-reply-btn').append(jive.discussions.soy.qHelpfulAnswerFadeOutText({question:question, i18n:i18n}));

        clearTimeout(t);
        t = setTimeout(function() { $j(".helpfulRemaining").fadeOut(200, function() { $j(this).remove(); }); }, 3000);
        /* end */

        return false;
    }

    /**
     * UI handler for unMarkAsHelpful action.
     *
     * @param container the button that was clicked.
     * @param question question object with data from the server.
     */
    function unMarkAsHelpful(container, question) {

        var helpfulCount = question.numHelpful;
        var maxHelpfulCount = question.totalNumHelpful;
        var helpfulCountRemaining = maxHelpfulCount-helpfulCount;

        // if only one helpful answer remaining, we transitioned from having no helpful answers available,
        // update all rendering since a lot will likely need to be modified.
        if (helpfulCountRemaining == 1)  {
            // cycle through messages, update buttons
            renderResponses(question);
        }
        // otherwise no need to traverse all page.
        else {
            var replyDiv = $j(container.closest('.js-thread-post-wrapper'));
            renderReply(replyDiv, question);
        }

        // inject correct / helpful answer
        renderInlineAnswers(question);

        return false;
    }

    /**
     * This method cycles through the messages (using 'jive-thread-reply-body' class, which occurs once per message).
     * Applies renderReply to each message, which does appropriate answer-related mark up. 
     *
     * @param question question object with data from the server.
     */
    function renderResponses(question) {
        // iterate through replies
        $j('.js-thread-post-wrapper').each(function() {
            renderReply($j(this), question);
        });
    }

    /**
     * Wrapper method to display reply answer mark up.
     * Extract messageId, then delegate processing to renderAnswerButton and renderReplyDetails.
     *
     * @param container js-thread-post-wrapper div for the current message
     * @param question question object with data from the server.
     */
    function renderReply(container, question) {
        // retrieve message ID.
        var messageIdStrVal = $j(container).find('a:first').attr('name');
        var messageId = parseInt(messageIdStrVal, 10);
        
        // update reply render
        renderReplyDetails(container, messageId, question);
        // update buttons
        renderAnswerButtons($j(container).find('section'), messageId, question);

    }

    /**
     * Renders 'mark answer' buttons in a message.
     * - If this is the Correct Answer, display Unmark as Correct button
     * - If this is a Helpful Answer, display Unmark as Helpful button
     * - Else, display:
     *      - Correct Answer button if question hasn't been resolved.
     *      - Helpful Answer button if question has helpful answers remaining to be awarded.
     *
     * @param container message div, should be 'jive-thread-reply-message'
     * @param messageId messageId for message being updated.
     */
    function renderAnswerButtons(messageContent, messageId, question) {
        if (question.canManageQuestionState) {
            var helpfulCount = question.numHelpful;
            var maxHelpfulCount = question.totalNumHelpful;
            var helpfulCountRemaining = maxHelpfulCount-helpfulCount;
            var $parentHeader = $j(messageContent).closest('.j-thread-post').find('header');
            var $dotted = $parentHeader.find('.j-dotted-star');
            var button = $j(messageContent).find('.jive-thread-reply-btn');

            if ($parentHeader.find('.j-dotted-star').length == 0)
                $parentHeader.append('<span class="j-dotted-star j-ui-elem"/>');

            if (button.length == 0) {
                $j(messageContent.append($j("<div>").addClass('jive-thread-reply-btn')));
                button = $j(messageContent).find('.jive-thread-reply-btn');
            }

            var $helpfulStar = $parentHeader.find('.j-helpful-star');
            button.empty();
            $dotted.unbind();
            // First two conditionals: answer already marked.
            if (question.correctAnswer && messageId == question.correctAnswer.ID) {
                button.append(jive.discussions.soy.qUnmarkAsCorrect({question:question, i18n:i18n}));
                button.find('.jive-thread-reply-btn-correct-unmark').click(function() {
                    questionSourceCallback.unMarkAsCorrect(messageId, that.renderAll);
                    return false;
                });
            }
            else if (question.helpfulAnswers && (containsAnswer(question.helpfulAnswers, messageId))) {
                button.append(jive.discussions.soy.qUnmarkAsHelpful({question:question, i18n:i18n}));
                button.find('.jive-thread-reply-btn-helpful-unmark').click(function() {
                    questionSourceCallback.unMarkAsHelpful(messageId, that.unMarkAsHelpful.bind(that, $j(button)));
                    return false;
                });
                $helpfulStar.click(function(e) {
                    questionSourceCallback.markAsCorrect(messageId, that.renderAll);
                    e.preventDefault();
                })
            }
            // Answer not marked.
            else {
                if (question.questionState!='resolved' &&
                        !(question.helpfulAnswers && (containsAnswer(question.helpfulAnswers, messageId)))) {
                    button.append(jive.discussions.soy.qMarkAsCorrect({question:question, i18n:i18n}));
                    button.find('.jive-thread-reply-btn-correct').add($helpfulStar).click(function() {
                        questionSourceCallback.markAsCorrect(messageId, function(question) {
                            that.renderAll(question);
                            jive.dispatcher.dispatch("trial.updatePercentComplete");
                        });
                        return false;
                    });
                }
                if (helpfulCountRemaining>0) {
                    button.append(jive.discussions.soy.qMarkAsHelpful({question:question, i18n:i18n}));
                    button.find('.jive-thread-reply-btn-helpful').add($dotted).click(function() {
                        questionSourceCallback.markAsHelpful(messageId, that.markAsHelpful.bind(that, $j(button)));
                        return false;
                    });

                }
            }





        }
    }

    /**
     * This method is for rendering the rest of the reply answer mark up, aside from buttons.
     * - Helpful / Correct Answer label.
     * - Helpful / Correct Answer color bars.
     *
     * @param container currently points to jive-thread-reply-body
     * @param messageId messageId being processed.
     * @param question question json object with data from the server.
     */
    function renderReplyDetails(container, messageId, question) {

        var reply = $j(container).closest('.js-thread-post-wrapper');
        if(question.correctAnswer && messageId == question.correctAnswer.ID) {
            // add the Correct Answer color bar & Helpful Answer label if it's not already there.
            if (!reply.is('.j-correct')) {
                // add the Correct Answer color bar.
                reply.addClass('j-correct');
                // add the Correct Answer label
                $j(container).find('header h6').prepend(jive.discussions.soy.qCorrectAnswer({question:question, i18n:i18n}));
                // add the Correct Answer star
                if ($j(container).find('.j-correct-star').length < 1) {
                    $j(container).find('header').append('<a class="j-star j-correct-star j-ui-elem"></a>');
                    $j(container).find('.j-star').addClass('popped');
                }
            }
        }
        else if(question.helpfulAnswers && (containsAnswer(question.helpfulAnswers, messageId))) {
            // add the Helpful Answer color bar & Helpful Answer label if it's not already there.
            if (!reply.is('.j-helpful')) {
                // color bar
                reply.addClass('j-helpful');
                // add the Helpful Answer label
                $j(container).find('header h6').prepend(jive.discussions.soy.qHelpfulAnswer({question:question, i18n:i18n}));
                // add the Helpful Answer star
                if ($j(container).find('.j-helpful-star').length < 1) {
                    $j(container).find('header').append('<a class="j-star j-helpful-star j-ui-elem"></a>');
                    $j(container).find('.j-star').addClass('popped');
                }
            }
        }
        else {
            // remove CSS classes, correct/helpful answer label.
            reply.removeClass('j-correct');
            reply.removeClass('j-helpful');
            reply.find('.thisCorrect').remove();
            reply.find('.thisHelpful').remove();
            reply.find('.j-star').remove();
        }
        
    }

    /**
     * Render question state message (Answered, Not Answered, Assumed Answered).
     *
     * @param question question object with data from the server.
     */
    function renderQuestionStateMessage(question) {
        if (question.questionState == 'open') {
            $j('.jive-answer-type-answered').remove();
            $j('.jive-answer-type-assumedanswered').remove();
        }
        else if (question.questionState == 'assumedResolved') {
            $j('.jive-answer-type-answered').remove();
            $j('.jive-answer-type-notanswered').remove();
        }
        else
        {
            $j('.jive-answer-type-assumedanswered').remove();
            $j('.jive-answer-type-notanswered').remove();
        }
        $j('.js-original-header h1').after(jive.discussions.soy.qDisplayQuestionStateMessage({question:question, questionStateEnum:questionStateEnum, i18n:i18n}));
        if (question.questionState == 'open') {
            $j('.jive-answer-type-notanswered').find('em').find('a').click(function() {
                    questionSourceCallback.markAssumedAnswered(that.renderQuestionStateMessage);
            });
        }
    }

    /**
     * Render Inline Correct & Helpful answers as appropriate.
     *
     * @param question question object with data from the server.
     */
    function renderInlineAnswers(question) {
        $j('div.j-answer-rollup').remove();
        // If this is not a threaded (aka it is paginated) discussion,
        // Some of the Correct / Helpful messages might not be on the same page.
        if (!question.threaded) {
            processMessageLinksForFlatView(question);
        }
        var $inlineAnswers = $j(jive.discussions.soy.qDisplayInlineAnswers({
            question:question,
            questionStateEnum:questionStateEnum,
            i18n:i18n,
            currentUserPartner : _jive_current_user.partner}));

        $j('.j-original-message').append($inlineAnswers);

        jive.rte.renderedContent.emit("renderedContent", $inlineAnswers);

//        I believe these are obsolete
//        $j("a[href='#j-answer-rollup']").click(function(e) {e.preventDefault(); });
//        $j('.jive-question-info-link').click(function() {
//            $j.scrollTo('#j-answer-rollup', 'fast', {offset: {top: -80, left: 0}});
//        });

    }

    /**
     * In flat view with pagination,
     * traverses the DOM to determine which of the Correct or Helpful answers are on this page.
     * For replies on this page, the inline answer link will be displayed as "#ID" to prevent page reloading.
     * For replies not on this page, the inline answer link will be displayed as full message URL. 
     *
     * @param question
     */
    function processMessageLinksForFlatView(question) {
        if (question.correctAnswer && !messageOnPage(question.correctAnswer.ID)) {
            question.correctAnswer.useFullURL = true;
        }

        question.helpfulAnswers && question.helpfulAnswers.some(
                function(answer) {
                      if (!messageOnPage(answer.ID)) {
                          answer.useFullURL = true;
                      }
                });
    }

    /**
     * Returns true if the message is on the current page.
     * NOTE: function should only be used for flat views (question.threaded = false),
     * all messages will be displayed for threaded views.
     *
     * @param messageID Message id.
     */
    function messageOnPage(messageID) {
        return ($j("a[name='" + messageID + "']").length > 0);
    }

    /**
     * Helper method to see if messageId is a helpful answer.
     *
     * @param helpfulAnswers array of MessageBean json objects.
     * @param messageId message ID being checked.
     */
    function containsAnswer(helpfulAnswers, messageId) {
        return helpfulAnswers && helpfulAnswers.some(
                function(answer)
                {
                    return answer.ID == messageId;
                });
    }


    this.renderAll = renderAll;
    this.renderInlineAnswers = renderInlineAnswers;
    this.markAsHelpful = markAsHelpful;
    this.unMarkAsHelpful = unMarkAsHelpful;
    this.renderQuestionStateMessage = renderQuestionStateMessage;
    this.renderResponses = renderResponses;
    this.renderReply = renderReply;
    this.renderAnswerButtons = renderAnswerButtons;
    this.renderReplyDetails = renderReplyDetails;
};

/* END ------------------------------------------------------------------------------------------------ */
/* Mark/Unmark as Helpful/Correct */
/* ---------------------------------------------------------------------------------------------------- */

