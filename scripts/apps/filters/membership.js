/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.UserRelationshipList.Main
 *
 * Main class for controlling interactions in browse view when "member" filter is applied.
 *
 * @depends path=/resources/scripts/apps/filters/main.js
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 */

jive.namespace('Filters');

jive.Filters.Membership = jive.Filters.Main.extend(function(protect, _super) {

    this.init = function(options) {
        _super.init.call(this, options);
        var main = this;

        jive.switchboard.addListener('sgroup.member.leave', function(groupId) {
            //if current filter is "member" or child of it, reload page
            var filterID = main.getState().filterID;
            if (filterID.length > 0 && filterID[0].indexOf('member') == 0){
                main.removeGridItem({id: groupId, type: 700});
            }
        });
    };
});
