/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Handles all requests to show users associated with certain types of acclaim. These types include:
 *      - bookmarks
 *      - children
 *      - connections (following)
 *      - followers
 *      - likes
 *      - members (of a group)
 *
 * @depends path=/resources/scripts/apps/browse/activity/info/main.js
 * @depends path=/resources/scripts/jive/dispatcher.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 */
if (!jive.acclaim) {
    jive.acclaim = (function($) {
        var acclaim       = jive.conc.observable({}),
            userDisplay   = new jive.Activity.Info.Main(),
            acclaimEvents = {
                showBookmarks   : 'bookmark',
                showChildren    : 'children',
                showConnections : 'connections',
                showFollowers   : 'follow',
                showLikes       : 'like',
                showMembers     : 'membership'
            };

        jive.dispatcher.listen(Object.keys(acclaimEvents), function(payload, event) {
            payload = $.extend({ activityType: acclaimEvents[event] }, payload);
                delete payload.count;
                delete payload.command;
            var params = $.extend({ objectID: payload.objectId }, payload);
                delete params.objectId;

            acclaim.emit('beforeFetch', payload);
            userDisplay.showUsers(params, 0).addCallback(function(response) {
                acclaim.emit('afterFetch', $.extend({ totalCount: response.totalCount }, payload));
            }).addErrback(function() {
                acclaim.emit('afterFetch', payload);
            });
        });


        return acclaim;
    })(jQuery);
}
