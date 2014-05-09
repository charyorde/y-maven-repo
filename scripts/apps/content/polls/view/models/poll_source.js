/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*extern jive $j */

jive.namespace('PollView');

jive.PollView.PollSource = function(options) {

    var pollID          = options.pollID,
        POLL_ENDPOINT  = jive.rest.url("/polls"),
        VOTE_ENDPOINT   = POLL_ENDPOINT + "/",
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
            }
        });
    }

    /* Public methods */

    this.vote = vote;
}