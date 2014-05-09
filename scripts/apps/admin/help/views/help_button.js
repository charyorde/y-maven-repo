/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('admin.Help');  // Creates the jive.Filters namespace if it does not already exist.

/**
 * Handles help buttons that appear in admin pages.  This code replaces
 * supernote.js.
 */
jive.admin.Help.HelpButton = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    protect.init = function(buttonSelector) {
        var view = this;

        buttonSelector = buttonSelector || '.js-help-button a';

        $(document).delegate(buttonSelector, 'click', function(event) {
            var rawTopics = $(this).data('topics')
              , topics = typeof rawTopics == 'string' ? JSON.parse(rawTopics) : rawTopics
              , url = topics.length > 0 ? topics[0].url : "";

            if (url) {
                view.popup(url, 'Help');
            }

            event.preventDefault();
        });
    };


    protect.popup = function(href, windowname) {
        var originalName = window.name;
        window.name = 'main';
        var helpWindow = window.open(href, windowname, 
                    'width=800,height=600,left=-200,top=-200,scrollbars=yes,dependent=yes,status=no,location=no');
        window.name = originalName;
    };
});
