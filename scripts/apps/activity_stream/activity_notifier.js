/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ActivityStream');

/**
 * Notifies listeners when the counts have been updated. This notification can be turned on and off for the current page.
 *
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 */

jive.ActivityStream.activityNotifier = (function(self) {
    var enabled = true,
        pollCount = 0;

    function notify() {
        if (enabled && pollCount != 1) {
            // Skip the 2nd poll call.  This is because each page load will immediately initialize it's activity poll data
            // through an ajax call.  Browser events polling will kick in 5 seconds after a page/tab is loaded
            // (a new "election" will have taken place and the polling will restart in the election winner's tab.)
            // The second poll being 5 seconds after the first can lead to a quick UI change that can confuse the user.
            self.emit.apply(self, arguments);
        }
        pollCount++;
    }


    self.enable = function() {
        enabled = true;
    };

    self.disable = function() {
        enabled = false;
    };

    self.getPollCount = function() {
        return pollCount;
    };

    // listen for the poll events
    if (!window._jive_current_user.anonymous) {
        jive.switchboard.addListener('activityStream.poll', notify.curry('activityStream.poll'));
    }


    return self;
})(jive.conc.observable({}));