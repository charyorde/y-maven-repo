/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */


jive.namespace('PollWidget');

/**
 * @depends path=/resources/scripts/apps/content/polls/widget/models/widget_source.js
 * @depends path=/resources/scripts/apps/content/polls/widget/views/widget_view.js
 */
jive.PollWidget.Main = function(options) {

    var containerType       = options.containerType,
        containerID         = options.containerID,
        widgetID            = options.widgetID,
        moreUrl             = options.moreUrl,
        createUrl			= options.createUrl,
        canCreatePoll		= options.canCreatePoll,
        pollID              = options.pollID,
        pollIndex           = options.pollIndex,
        widgetSource,
        widgetView;

    /* ** initialization ** */

    widgetSource = new jive.PollWidget.WidgetSource({containerType: containerType, containerID: containerID});

    widgetView = new jive.PollWidget.WidgetView('#poll-container-' + widgetID, {
        moreUrl:moreUrl, widgetID:widgetID, createUrl:createUrl, pollID: pollID, pollIndex: pollIndex });

    widgetView
    .addListener('next', function(nextIndex) {

        // load up the next poll
        widgetSource.getPoll(nextIndex, {

            success: function(poll) {
                widgetView.setContent(poll);
                widgetView.next();
            },
            error: function() {
                var response = jive.json.parse(data.responseText);
                widgetView.displayError(response.message);
            }
        });
    })
    .addListener('previous', function(previousIndex) {

        // load up the previous poll
        widgetSource.getPoll(previousIndex, {

            success: function(poll) {
                widgetView.setContent(poll);
                widgetView.previous();
            },
            error: function() {
                var response = jive.json.parse(data.responseText);
                widgetView.displayError(response.message);
            }
        });
    })
    .addListener('vote', function(pollID, optionID, index) {

        widgetSource.vote(pollID, optionID, {
            success: function(poll) {
                // override the index with the current index value
                widgetView.setContent($j.extend({ index: index }, poll));
                widgetView.vote(poll);
            },
            error: function() {
                var response = jive.json.parse(data.responseText);
                widgetView.displayError(response.message);
            }
        });
    });

};