/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.Filters.Invitation
 *
 * Main class for controlling interactions in browse view when a user is invited.
 *
 * @depends path=/resources/scripts/apps/filters/main.js
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 * @depends template=jive.invite.browseThumbnailLink
 * @depends template=jive.invite.browseDetailLink
 */

jive.namespace('Filters');

jive.Filters.Invitation = jive.Filters.Main.extend(function(protect, _super) {

    this.init = function(options) {
        _super.init.call(this, options);
        var main = this;

        jive.switchboard.addListener('invitation.create', function() {
            //if current filter is "all" or child of it, reload page
            var filterID = main.getState().filterID;
            if (filterID.length > 0 && filterID[0].indexOf('all') === 0){
                main.loadPage(main.getState(), true);
            }
        });
    };
});
