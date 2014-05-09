
/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
$j(window).load(function() {
    var LOCAL_STORAGE_KEY = "jive.tabs",
        HEARTBEAT_INTERVAL = 5000,
        HEARTBEAT_FAILURE_THRESHOLD = 15000,
        iAmTheMaster = false,
        myTabId = new Date().getTime() + Math.random(),
        sMyTabId = myTabId + '',
        logging = false,
        heartbeat = {},
        sLastTabsSeen = "",
        myLocalStorage = (function() {
            var fakeLocalStorage = {
                setItem : function(key, value) {
                    this.key = value;
                },
                getItem : function(key) {
                    return this.key;
                }
            };
            try {
                return (!!localStorage.getItem ? localStorage : fakeLocalStorage);
            } catch(e) {
                return fakeLocalStorage;
            }
        })();

    // set up unload handler
    $j(window).unload(function() {
        if (logging) console.log('unloading tab');
        // handle the exiting/refreshing of a tab
        var jiveTabs = myLocalStorage.getItem(LOCAL_STORAGE_KEY);
        try {
            jiveTabs = jiveTabs ? JSON.parse(jiveTabs) : {};
        }
        catch (e) {
            jiveTabs = {};
        }
        if (jiveTabs[sMyTabId]) {
            // remove myself from the tab map
            delete jiveTabs[sMyTabId];
        }
        // set modified tab map, will trigger the storage event on the other tabs to sync up and promote a new
        // master, if necessary
        if (iAmTheMaster) {
            destroySocketHolder();
        }
        myLocalStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jiveTabs));
    });

    if (logging) console.log("my tab id is: " + sMyTabId);

    function tabSync() {
        // function that's called on init of the tab and every time the storage event fires, makes sure this
        // tab is present in the tabs map and determine if a new master is needed
        var jiveTabs = myLocalStorage.getItem(LOCAL_STORAGE_KEY);
        if (sLastTabsSeen === "" || sLastTabsSeen !== jiveTabs) {
            // short circuit if tab map hasn't changed
            if (jiveTabs === undefined || jiveTabs === null || jiveTabs === "" || jiveTabs === "{}") {
                // tab map is empty/new or we have manually reset it due to error, i'm first so add myself as master
                jiveTabs = {};
                jiveTabs[sMyTabId] = {
                    id: myTabId,
                    m: true
                };
                sLastTabsSeen = JSON.stringify(jiveTabs);
                myLocalStorage.setItem(LOCAL_STORAGE_KEY, sLastTabsSeen);
                clearHeartbeat();
                createSocketHolder();
            }
            else {
                try {
                    sLastTabsSeen = jiveTabs;
                    jiveTabs = jiveTabs ? JSON.parse(jiveTabs) : {};
                    var masterExists = false,
                        amIEarliest = true,
                        doIExist = false,
                        iChangedTheMap = false;
                    for (var sTabId in jiveTabs) {
                        if (jiveTabs[sTabId].id) {
                            masterExists = masterExists || jiveTabs[sTabId].m;
                            doIExist = doIExist || (myTabId == jiveTabs[sTabId].id);
                            amIEarliest = amIEarliest && (myTabId <= jiveTabs[sTabId].id);
                        }
                    }
                    if (!doIExist) {
                        // add me to the map
                        jiveTabs[sMyTabId] = {
                            id: myTabId,
                            m: false
                        };
                        iChangedTheMap = true;
                    }
                    if (!masterExists && amIEarliest) {
                        // no master currently in map, i have the earliest ts, so i am the master
                        jiveTabs[sMyTabId].m = true;
                        iChangedTheMap = true
                    }
                    if (iChangedTheMap) {
                        sLastTabsSeen = JSON.stringify(jiveTabs);
                        myLocalStorage.setItem(LOCAL_STORAGE_KEY, sLastTabsSeen);
                        if (iAmTheMaster && jiveTabs[sMyTabId].m == false) {
                            // for some error case, i was the master, but i got usurped, shut down socket
                            destroySocketHolder();
                        }
                        if (jiveTabs[sMyTabId].m == true) {
                            // i am the new master, get to it
                            createSocketHolder();
                        }
                        else {
                            // i'm not the master, start listening for heartbeats
                            clearHeartbeat();
                            heartbeat.handle = window.setTimeout(function() {
                                // if this code is hit, we haven't heard a heartbeat in time, something must have gone wrong, reset tabs
                                // which triggers all tabs to resync
                                if (logging) console.log("Cardiac arrest, triggering an election");
                                myLocalStorage.setItem(LOCAL_STORAGE_KEY, '{}');
                                tabSync();
                            }, HEARTBEAT_FAILURE_THRESHOLD);
                        }
                    }
                }
                catch (e) {
                    // json parse error, clear out tab map and make me master
                    jiveTabs = {};
                    jiveTabs[sMyTabId] = {
                        id: myTabId,
                        m: true
                    };
                    sLastTabsSeen = JSON.stringify(jiveTabs);
                    myLocalStorage.setItem(LOCAL_STORAGE_KEY, sLastTabsSeen);
                    clearHeartbeat();
                    createSocketHolder();
                }
            }
        }
    }

    tabSync();

    $j(window).bind('storage.socketHolderListener', function(e) {
        tabSync();
    });

    function clearHeartbeat() {
        if (heartbeat.handle) {
            if (iAmTheMaster) {
                window.clearInterval(heartbeat.handle);
            } else {
                window.clearTimeout(heartbeat.handle);
            }
            heartbeat.handle = null;
        }
    }

    jive.switchboard.addListener("socketHolder.heartbeat", function() {
        // the master tab sent out a heartbeat
        if (iAmTheMaster) return; // I'm the one making the heartbeat, ignore it.
        if (logging) console.log("I heard the heartbeat");
        // reset heartbeat timeout
        clearHeartbeat();
        heartbeat.handle = window.setTimeout(function() {
            // if this code is hit, we haven't heard a heartbeat in time, something must have gone wrong, reset tabs
            // which triggers all tabs to resync
            if (logging) console.log("Cardiac arrest, triggering an election");
            myLocalStorage.setItem(LOCAL_STORAGE_KEY, '{}');
            tabSync();
        }, HEARTBEAT_FAILURE_THRESHOLD);
    });

    function createSocketHolder() {
        // code that is run by a new declared master.  Create the socket, handle socket messages,
        // and pump out heartbeats
        iAmTheMaster = true;
        if (logging) console.log("it's A-ME!");
        // TODO: code that creates the socket connection
        heartbeat.handle = window.setInterval(function() {
            if (logging) console.log("Sending heartbeat");
            jive.switchboard.emit("socketHolder.heartbeat");
        }, HEARTBEAT_INTERVAL);
    }

    function destroySocketHolder() {
        // code that tears down the master
        clearHeartbeat();
        iAmTheMaster = false;
        if (logging) console.log("tearing down socket holder");
        // TODO: code that tears down the socket connection
    }
});

