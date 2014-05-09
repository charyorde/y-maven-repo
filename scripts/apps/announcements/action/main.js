/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j */

jive.namespace('AnnouncementsAction');

/**
 * Provides simple actions for the announcements list. 
 * These actions can be performed without having to load the manage modal with RTE.
 *
 * @depends path=/resources/scripts/apps/announcements/action/views/announcement_action_view.js
 * @depends path=/resources/scripts/apps/announcements/announcement_source.js
 */
jive.AnnouncementsAction.Main = jive.oo.Class.extend(function(protect) {

    this.init = function(options) {
        var main = this;
        main.view = new jive.AnnouncementsAction.ActionView(options);
        main.source = new jive.Announcements.Source();

        main.view.addListener('expire', function(id, promise) {
            main.source.expire(id).addCallback(function(){
                promise.emitSuccess();
            });
        });

        main.view.addListener('remove', function(id, promise) {
            main.source.destroy(id).addCallback(function(){
                promise.emitSuccess();
            });
        });
        
        main.view.addListener('dismiss', function(id, promise) {
            main.source.dismiss(id).addCallback(function(){
                promise.emitSuccess();
            });
        });        

    };

});
