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
 * Main class for controlling interactions in browse view when "your" filter is applied in the bookmarks view.
 *
 * @depends path=/resources/scripts/apps/filters/main.js
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 * @depends path=/resources/scripts/apps/filters/view/bookmarked_item_grid_view.js
 */

jive.namespace('Filters');

jive.Filters.Bookmarked = jive.Filters.Main.extend(function(protect, _super) {

    this.init = function(options) {
        options.itemGridClass = jive.Filters.BookmarkedItemGridView;
        _super.init.call(this, options);
        var main = this;

        //after bookmark edits, rebuild view
        jive.switchboard.addListener('bookmark.update', function(bookmark) {
            main.loadPage(main.getState(), true);
        });

        //if current filter is "your (bookmarks)" or child of it, reload page
        jive.switchboard.addListener('bookmark.destroy', function(obj) {
            var filterID = main.getState().filterID;
            if (filterID.length > 0 && filterID[0].indexOf('user') === 0){
                main.removeGridItem({id: obj.id, type: 800});
            }
        });
    };
});
