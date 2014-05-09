/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('PollView');

jive.PollView.Main = function(options) {

    var pollID          = options.pollID,
        pollView,
        pollSource;

    pollSource = new jive.PollView.PollSource({pollID: pollID});
    pollView = new jive.PollView.PollFormView('.jive-body-poll', {pollID:pollID});

    pollView.addListener('vote', function(pollID, optionID) {

        pollSource.vote(pollID, optionID, {
            success: function(poll) {
                // override the index with the current index value
                pollView.setContent(poll);
                pollView.vote();
            },
            error: function() {
                // TODO: implement getErrorMessage()
                var error = poll.getErrorMessage();
                pollView.displayError(error);
            }
        });
    });    

}