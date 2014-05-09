/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Stream flipper
 *
 * @depends path=/resources/scripts/apps/share/models/core_deferred.js lazy=true
 * @depends path=/resources/scripts/apps/announcements/flipper/views/announcement_flipper_view.js
 * @depends template=jive.announcements.announcementFlipperControls
 * @depends template=jive.announcements.announcementFlipperContent
 */
define('jive.Announcements.Flipper.Main', [
    'jive.CoreV3.Deferred',
    'jive.Announcements.Flipper.AnnouncementFlipper'
], function(Deferred, AnnouncementFlipper) {
return function(options){
    var core = new Deferred();

    core.getObject(options.containerType, options.containerId).pipe(function(container){
        return core.runQuery(container.getAnnouncements({count: 100, activeOnly: true}));
    }).pipe(core.slurp).pipe(function(announcements){
        var valid = [],
            now = new Date().getTime(),
            view;

        for(var i = 0; i < announcements.length; ++i){
            if(announcements[i].status && announcements[i].status.toLowerCase() == "published"){
                valid.push(announcements[i]);
            }
        }

        valid.sort(function(left, right){
            return right.sortKey - left.sortKey;
        });

        if(valid.length > 0) {
            $j("#j-announcement-carousel").show();

            var controls = jive.announcements.announcementFlipperControls({
                announcements: valid
            });

            $j("#j-announcement-controls").html(controls);

            var list = jive.announcements.announcementFlipperContent({
                announcements: valid
            });

            $j("#j-announcement-flipper").html(list);
            view = new AnnouncementFlipper();

            $j("#j-announcement-title").show();
        }
        else {
            $j("#j-announcement-title").remove();
            $j("#j-announcement-carousel").remove();
        }
    });
};
});
