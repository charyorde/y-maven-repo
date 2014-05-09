/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*extern jive $j */

jive.namespace('PollWidget');

jive.PollWidget.WidgetSource = function(options) {

   var  containerID     = options.containerID,
        containerType   = options.containerType,
        POLL_ENDPOINT   = jive.rest.url("/polls"),
        VOTE_ENDPOINT   = POLL_ENDPOINT + "/",
        NAV_ENDPOINT    = POLL_ENDPOINT + "/" + containerType + "/" + containerID + "/",
        poll;

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

    function getPoll(index, options) {

        options = normalizeOptions(options);

        $j.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: NAV_ENDPOINT + index,
            dataType: "json",
            success: function(data) {
                if (typeof options.success == 'function') {
                    poll = data;
                    options.success.call(index, poll);
                }
            },
            error: function(data) {
                if (typeof options.error == 'function') {
                    options.error.call(poll, data);
                }
            }
        });
    }

    function getPollByID(id, options) {

        options = normalizeOptions(options);

        $j.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: VOTE_ENDPOINT + id + '/getBean',
            dataType: "json",
            success: function(data) {
                if (typeof options.success == 'function') {
                    poll = data;
                    options.success.call(id, poll);
                }
            },
            error: function(data) {
                if (typeof options.error == 'function') {
                    options.error.call(poll, data);
                }
            }
        });
    }


    function vote(pollID, optionID, options) {

        options = normalizeOptions(options);

        $j.ajax({
            type: "POST",
            url: VOTE_ENDPOINT + pollID + "/votes",
            dataType: "json",
            data: {optionID:optionID},
            success: function(data) {
                if (typeof options.success == 'function') {
                    poll = data;
                    options.success.call(pollID, poll);
                }
            },
            error: function(data) {
                if (typeof options.error == 'function') {
                    options.error.call(poll, data);
                }
            }
        });


    }

     /* Public methods */

    this.getPoll = getPoll;
    this.getPollByID = getPollByID;
    this.vote = vote;

}