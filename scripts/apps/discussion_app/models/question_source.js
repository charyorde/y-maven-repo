/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.DiscussionApp.QuestionSource
 *
 * Model class that encapsulates the server interface for retrieving and
 * updating Question state.
 *
 * To use create an instance of DiscussionSource, giving it the resourceType and
 * resourceID of the content that Discussions will be attached to.  Use methods of
 * the instance to look up and save Discussions.
 */

jive.namespace('DiscussionApp');

jive.DiscussionApp.QuestionSource = function(resourceID) {

    var DISCUSSION_REST_ENDPOINT = jive.rest.url("/message/" + resourceID),
        DISCUSSION_REST_GET_QUESTION_ENDPOINT = DISCUSSION_REST_ENDPOINT + "/question";

    /**
     * Most of the methods in this class can take either a success callback or
     * an object representing a success callback and an error callback.  This
     * function handles either case: it returns a normalized form, an object.
     */
    function normalizeOptions(options) {
        if (typeof options == 'function') {
            options = { success: options };
        }
        return options;
    }

    /**
     * getQuestion(options)
     *
     * Loads JSON question data for the given resource from the server.
     * Results from the server are passed to the given success callback.
     *
     * @param callback (Object/Function): success function callback or an object with a success and an error callback
     */
    function getQuestion(callback) {
        callback = normalizeOptions(callback);

        $j.ajax({
            type: "GET",
            url: DISCUSSION_REST_GET_QUESTION_ENDPOINT,
            dataType: "json",
            data: {
                
            },
            success: function(json) {
                callback.success(json);
            },
            error: function(data) {
                if (typeof callback.error == 'function') {
                    callback.error.call(null, data);
                }
            }
        });

        return this;
    }

    /**
     * markAsHelpful(messageId, container, callback)
     *
     * Marks the message with messageId as helpful answer.
     *
     * @param messageId messageId of the Helpful answer.
     * @param callback UI handler function to update the UI.
     */
    function markAsHelpful(messageId, callback) {
        callback = normalizeOptions(callback);

        $j.ajax({
            type: "POST",
            url: DISCUSSION_REST_ENDPOINT + "/" + messageId + "/helpful",
            dataType: "json",
            data: {

            },
            success: function(json) {
                callback.success(json);
            },
            error: function(data) {
                if (typeof callback.error == 'function') {
                    callback.error.call(null, data);
                }
            }
        });
    }

    /**
     * markAsAssumedAnswered(callback)
     *
     * Marks the question as assumed answered.
     *
     * @param callback UI handler function to update the UI.
     */
    function markAssumedAnswered(callback) {
        callback = normalizeOptions(callback);

        $j.ajax({
            type: "POST",
            url: DISCUSSION_REST_ENDPOINT + "/assumedanswered",
            dataType: "json",
            data: {

            },
            success: function(json) {
                callback.success(json);
            },
            error: function(data) {
                if (typeof callback.error == 'function') {
                    callback.error.call(null, data);
                }
            }
        });
    }

    /**
     * markAsCorrect(messageId, callback)
     *
     * Marks the message with messageId as correct answer.
     *
     * @param messageId messageId of the Correct answer.
     * @param callback UI handler function to update the UI.
     */
    function markAsCorrect(messageId, callback) {
        callback = normalizeOptions(callback);

        $j.ajax({
            type: "POST",
            url: DISCUSSION_REST_ENDPOINT + "/" + messageId + "/correct",
            dataType: "json",
            data: {

            },
            success: function(json) {
                callback.success(json);
            },
            error: function(data) {
                if (typeof callback.error == 'function') {
                    callback.error.call(null, data);
                }
            }
        });
    }

    /**
     * unMarkAsHelpful(messageId, container, callback)
     *
     * Unmarks the message with messageId as helpful or correct.
     *
     * @param messageId messageId of Helpful or Correct answer to unmark as such.
     * @param callback UI handler function to update the UI.
     */
    function unMarkAsHelpful(messageId, callback) {
        callback = normalizeOptions(callback);

        $j.ajax({
            type: "POST",
            url: DISCUSSION_REST_ENDPOINT + "/" + messageId + "/unmark",
            dataType: "json",
            data: {

            },
            success: function(json) {
                callback.success(json);
            },
            error: function(data) {
                if (typeof callback.error == 'function') {
                    callback.error.call(null, data);
                }
            }
        });
    }

    /**
     * unMarkAsCorrect(messageId, callback)
     *
     * Un marks the answer as correct.
     *
     * @param messageId message being updated.
     * @param callback UI handler function to update the UI.
     */
    function unMarkAsCorrect(messageId, callback) {
        callback = normalizeOptions(callback);

        $j.ajax({
            type: "POST",
            url: DISCUSSION_REST_ENDPOINT + "/" + messageId + "/unmark",
            dataType: "json",
            data: {

            },
            success: function(json) {
                callback.success(json);
            },
            error: function(data) {
                if (typeof callback.error == 'function') {
                    callback.error.call(null, data);
                }
            }
        });
    }

    this.getQuestion = getQuestion;
    this.markAsHelpful = markAsHelpful;
    this.markAsCorrect = markAsCorrect;
    this.markAssumedAnswered = markAssumedAnswered;
    this.unMarkAsHelpful = unMarkAsHelpful;
    this.unMarkAsCorrect = unMarkAsCorrect;
};
