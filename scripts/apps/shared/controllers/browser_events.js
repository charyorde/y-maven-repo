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

    var enableLogging = false;
    var activeEvents = [];
    var possibleEvents = {};
    var active = null;
    var heartbeat = {isPacemaker:false,handle:null};
    var wait = window._jive_browser_event_polling_delay || 30000; // default wait 30s
    var lastActivity = new Date().getTime();
    var pendingPoll = false;
    var sleepInterval = 600; // seconds -- polling goes to sleep after 10 minutes

    /////////////////////////////////////////////////////////////////
    // one time initialization
    (function () {
        for (var i = 0, l = window._jive_browser_event.providers.length; i < l; ++i) {
            var eventName = window._jive_browser_event.providers[i];
            possibleEvents[eventName] = true;
        }
    })();
    jive.switchboard.addListener("newListener", function(event) {
        if (possibleEvents[event] && activeEvents.indexOf(event) < 0) {
            activeEvents.push(event);
        }
    });
    jive.switchboard.addListener("user.idle", function(idle, last) {
        if (enableLogging) console.log("user is idle, last activity was " + idle + "s ago");
        lastActivity = Math.max(lastActivity, Number(last));
        if (pendingPoll && idle == 0) {
            if (enableLogging) console.log("waking up, resume polling");
            pollServer();
        }
    });

    /////////////////////////////////////////////////////////////////
    // election stuff
    (function () {
        var activeElectionId = 0;
        var invalidatePriorElection = $j.noop;

        function clearHeartbeat() {
            if (heartbeat.handle) {
                if (heartbeat.isPacemaker) {
                    window.clearInterval(heartbeat.handle);
                    heartbeat.isPacemaker = false;
                } else {
                    window.clearTimeout(heartbeat.handle);
                }
                heartbeat.handle = null;
            }
        }

        jive.switchboard.addListener("browserWindow.heartbeat", function() {
            if (heartbeat.isPacemaker) return; // I'm the one making the heartbeat, ignore it.
            if (enableLogging) console.log("I heard the heartbeat");
            clearHeartbeat();
            heartbeat.handle = window.setTimeout(function() {
                if (enableLogging) console.log("Cardiac arrest, triggering an election");
                heartbeat.handle = null;
                triggerElection();
            }, 120000);
        });

        function handleElection(election) {
            // trash any prior elections
            if (election.id < activeElectionId) {
                return; // election was invalid before it started
            }
            if (enableLogging) console.log("responding to election", election);
            activeElectionId = Math.max(activeElectionId, election.id);
            invalidatePriorElection();
            invalidatePriorElection = function() {
                invalidatePriorElection = $j.noop;
                markInvalid();
            };

            // trash polling operations if I'm currently responsible
            if (active) {
                window.clearTimeout(active);
                active = null;
            }
            clearHeartbeat(); // no heartbeats during the election process

            var isValid = window.setTimeout(function() {
                if (enableLogging) console.log("I am the the winner of the election", election, updatedEvents);
                // I'm still here, I must have won the election
                isValid = null;
                markInvalid(); // de-register the voteListener
                activeEvents = updatedEvents; // update the list of events we poll
                previousEvents = previousEvents || {}; // set to {} if I am the first window
                active = window.setTimeout(pollServer, wait); // get to work
                // start the heartbeat
                heartbeat.handle = window.setInterval(function() {
                    if (enableLogging) console.log("Sending heartbeat");
                    jive.switchboard.emit("browserWindow.heartbeat");
                }, 90000);
                heartbeat.isPacemaker = true;
            }, 5000);

            function markInvalid() {
                if (isValid) {
                    if (enableLogging) console.log("I concede the election", election);
                    window.clearTimeout(isValid);
                    isValid = null;
                }
                if (voteListener) {
                    jive.switchboard.removeListener("browserWindow.vote", voteListener);
                    voteListener = null
                }
            }

            // Rebuild activeEvents during the election
            activeEvents = [];
            var updatedEvents = window._jive_browser_event.providers.filter(function(event) {
                return jive.switchboard.listeners(event).length > 0;
            });
            var myVote = {
                previousEvents: previousEvents,
                myEvents: updatedEvents,
                tieBreaker: Math.random(),
                electionId: election.id
            };
            previousEvents = null;
            if (enableLogging) console.log("submitting my vote", myVote);
            var voteListener = function(vote) {
                if (!isValid) return; // election has already been decided
                if (vote.electionId == myVote.electionId) {
                    previousEvents = previousEvents || vote.previousEvents;
                    if (vote.tieBreaker > myVote.tieBreaker) {
                        markInvalid();
                    } else {
                        updatedEvents = updatedEvents.concat(vote.myEvents).unique();
                    }
                }
            };

            jive.switchboard.addListener("browserWindow.vote", voteListener);
            jive.switchboard.emit("browserWindow.vote", myVote);
        }
        jive.switchboard.addListener("browserWindow.elect", handleElection);

        function triggerElection() {
            var election = {
                since: window._jive_browser_event.since,
                id: new Date().getTime() + Math.random()
            };
            jive.switchboard.emit("browserWindow.elect", election);
            pendingPoll = false;
        }

        // elections are triggered when a window opens, and again when it closes.
        $j(window).load(triggerElection).unload(function() {
            jive.switchboard.removeListener("browserWindow.elect", handleElection);
            triggerElection();
        });
    })();


    /////////////////////////////////////////////////////////////////
    // polling stuff
    var browserEventPollURL = jive.app.url({path:"/__services/v2/rest/browserEvents/"});
    var previousEvents = null;
    function pollServer() {
        active = null;

        var start = new Date().getTime();
        var idlePeriod = ((start - lastActivity) / 1000.0);
        if (idlePeriod > sleepInterval) {
            if (enableLogging) console.log("idle for " + idlePeriod + "s, going to sleep");
            pendingPoll = true;
            return;
        }
        pendingPoll = false;
        var countScope;

        var documentURL = document.URL;
        var isAnAllCountAction = documentURL.match(/\/inbox|\/welcome|\/activity/g);

        if(isAnAllCountAction != null) {
            countScope = "all";
        }
        else {
            countScope = "inboxandactions";
        }

        var query = window._jive_browser_event.since + "?e=" + encodeURIComponent(activeEvents.join(",")) + "&c=" + countScope;
        if (enableLogging) console.log("idle for " + idlePeriod + "s, polling server:", query);
        $j.ajax({
            type: "GET",
            url: browserEventPollURL + query,
            contentType: "application/json",
            dataType: "json",
            success: function(data) {
                if (!(data && data.events)) return;
                var now = new Date().getTime();
                wait = data.wait || wait;
                window._jive_browser_event.since = data.now + start - now;
                var currentEvents = {};
                for (var i = 0, l = data.events.length; i < l; ++i) {
                    var wrapper = data.events[i];
                    var key = wrapper.providerName + "[" + wrapper.id + "]@" + wrapper.timestamp;
                    currentEvents[key] = true;
                    if (previousEvents && previousEvents[key]) continue; // skip duplicates
                    if (enableLogging) console.log("Distributing event to switchboard", wrapper.event);
                    jive.switchboard.emit(wrapper.providerName, wrapper.event);
                }
                previousEvents = currentEvents;
                var delay = start + wait - now;
                active = window.setTimeout(pollServer, Math.max(delay, 5000)); // always wait at least 5 seconds
            },
            complete: function() {
                if (active == null) {
                    wait = Math.min(wait * 2, 3600000); // 1 hour max interval
                    active = window.setTimeout(pollServer, wait);
                }
            }
        });
    }
})();
