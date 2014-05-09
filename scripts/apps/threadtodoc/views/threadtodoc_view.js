/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('ThreadToDoc');

/**
 * Handles move content UI.
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.placepicker.* scope=client
 */
jive.ThreadToDoc.ThreadToDocView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery
        , _ = jive.Move.Content;

    protect.init = function() {

        var view = this;

        $(document).ready(function() {

            // move link click events for content and project pages
            $('#jive-link-wiki a').click(function(event) {
                view.emit('browse');
                event.preventDefault();
            });
        });
    };

    this.maxMessagesExceeded = function(data) {

        var view = this;
        if (confirm(jive.threadtodoc.maxMessagesExceeded())) {
            view.emit('confirm', data);
        }
    };

});