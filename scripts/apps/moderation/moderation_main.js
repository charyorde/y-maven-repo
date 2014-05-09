/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint laxbreak: true */

jive.namespace('Moderation');  // Creates the namespace if it does not already exist.

/**
 * Entry point for the Moderation App.
 *
 * @depends path=/resources/scripts/apps/moderation/views/inbox_view.js
 * @depends dwr=ModerationNote
 */
define('jive.Moderation.Main', [
    'jquery'
], function($) {
    return jive.oo.Class.extend(function(protect) {
        protect.init = function(options) {
            var main = this;
            this.inboxView = new jive.Moderation.InboxView(options);
    
            //handle pagination
            this.inboxView.addListener('paginate', function(url, promise) {
                $.get(url, function(data) {
                    promise.emitSuccess(data);
                });
            });
    
            //handle filtering
            this.inboxView.addListener('filter', function(form) {
                form.ajaxSubmit({target: this.$moderationContainer})
            });
    
            this.inboxView.addListener('note', function(workflowID, userID, formValue){
                ModerationNote.leaveNote(workflowID, userID, formValue);
            });
    
            //preload on init
            if (options.initUrl) {
                main.spinner = new jive.loader.LoaderView();
                main.spinner.appendTo($('#j-dynamic-pane'));
                $.get(options.initUrl, function(data) {
                    main.inboxView.update(data);
                    main.spinner.remove().destroy();
                });
            }
        };
    });
});
