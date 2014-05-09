/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * This utility polls the server at a regular interval. It also handles
 * elections to determine which browser window will actually check the server
 * for events.
 */
(function() {

    var lastUserActivity = new Date().getTime();
    var lastReportedUserActivity = 0;
    var nextReportOfSecondsIdle = 10;
    var maxReportOfSecondsIdle = 86400;
    var active = true;

    jQuery(document).bind("mousemove keydown", function() {
        lastUserActivity = new Date().getTime();
    });
    jive.switchboard.addListener("user.idle", function(idle, last) {
        active = active && last <= lastReportedUserActivity;
    });

    window.setInterval(function() {
        if (lastReportedUserActivity < lastUserActivity) {
            lastReportedUserActivity = lastUserActivity;
            nextReportOfSecondsIdle = 10;
            active = true;
            jive.switchboard.emit("user.idle", 0, lastReportedUserActivity);
            return; // not idle
        } else if (!active || nextReportOfSecondsIdle >= maxReportOfSecondsIdle) {
            // I'm not the most recently active window or its been too long
            return;
        }
        var seconds = Math.round((new Date().getTime() - lastUserActivity) / 1000.0);
        if (seconds > nextReportOfSecondsIdle) {
            while (seconds > nextReportOfSecondsIdle &&
                   nextReportOfSecondsIdle < maxReportOfSecondsIdle) {
                nextReportOfSecondsIdle = nextReportOfSecondsIdle * 2;
            }
            jive.switchboard.emit("user.idle", nextReportOfSecondsIdle, lastReportedUserActivity);
        }
    }, 1000);
})();
