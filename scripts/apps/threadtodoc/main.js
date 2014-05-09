/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint laxbreak: true */

jive.namespace('ThreadToDoc');  // Creates the jive.ThreadToDoc namespace if it does not already exist.

/**
 * Entry point for the ThreadToDoc App.
 *
 * @depends path=/resources/scripts/apps/threadtodoc/views/threadtodoc_view.js
 * @depends path=/resources/scripts/apps/threadtodoc/models/threadtodoc_source.js
 * @depends path=/resources/scripts/apps/placepicker/main.js
 */

jive.ThreadToDoc.Main = jive.oo.Class.extend(function(protect) {

    protect.init = function(options) {
        var main = this;

        // placepicker specific
        this.objectType = options.objectType;
        this.objectID = options.objectID;
        this.personalContainerTitleKey = options.personalContainerTitleKey;
        this.personalContainerCaptionKey = options.personalContainerCaptionKey;
        this.searchPlaceholderKey = options.searchPlaceholderKey;
        this.containerType = options.containerType;
        this.containerID = options.containerID;

        // implementation specific
        this.maxMessages = options.maxMessages;
        this.threadMessageCount = options.threadMessageCount;

        this.threadToDocView = new jive.ThreadToDoc.ThreadToDocView();

        // Begin loading the place picker
        this.threadToDocView.addListener('browse', function(data) {

            if (main.threadMessageCount > main.maxMessages) {
                main.threadToDocView.maxMessagesExceeded(data);
            }
            else {
                var threadToDocSource = new jive.ThreadToDoc.ThreadToDocSource();
                threadToDocSource.save({
                    threadID: main.objectID,
                    containerType: main.containerType,
                    containerID: main.containerID
                }).addCallback(function(redirect) {
                    window.location = redirect;
                });
            }
        });

     };

});
