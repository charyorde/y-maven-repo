/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.ReadTracking.Main
 *
 * Main class for controlling read tracking in the activity stream.
 * 
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js 
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js 
 * @depends path=/resources/scripts/apps/read_tracking/models/read_tracking_source.js
 * @depends path=/resources/scripts/apps/read_tracking/views/read_tracking_view.js
 *
 */

jive.namespace('ReadTracking');

jive.ReadTracking.Main = jive.oo.Class.extend(function(protect) {

	this.init = function(options) {
		var main = this;

		this.i18n = options.i18n;

		this.readTrackingSource = new jive.ReadTracking.ReadTrackingSource(options);
		this.readTrackingView = new jive.ReadTracking.ReadTrackingView(options);

		this.readTrackingView.addListener('markRead', function(objectType, objectID, linkedDOMID, markRead) {
			main.readTrackingSource.save(objectType, objectID, markRead)
            .addCallback(function() {
                jive.switchboard.emit((markRead ? 'inbox.read' : 'inbox.unread'), objectType, objectID, linkedDOMID);
			});
		}).addListener('markAllRead', function() {
            var asOf = jive.ActivityStream.GlobalCommunicationStreamController.getLastLoadTime();
            main.readTrackingSource.markAllRead(asOf).addCallback(function() {
                jive.switchboard.emit('inbox.markAllRead');
                jive.ActivityStream.GlobalCommunicationStreamController.getUnreadSinceLastUpdate().forEach(
                    function(item, index){
                        //here we fire and forget these request since they are just to clean up a rare circumstance
                        main.readTrackingSource.save(item.objectType, item.objectId, true);
                    }
                );
                jive.ActivityStream.GlobalCommunicationStreamController.clearUnreadSinceLastUpdate();
            });
        });
	};

    this.attachReadActions = function() {
        this.readTrackingView.postRender();
    }

    this.markRead = function($link) {
        this.readTrackingView.markRead($link);
    }

    this.markUnread = function($link) {
        this.readTrackingView.markUnread($link);
    }

    this.markAllRead = function($link) {
        this.readTrackingView.markAllRead($link);
    }
});
