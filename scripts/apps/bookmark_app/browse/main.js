/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends path=/resources/scripts/apps/filters/main.js
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 * @depends template=jive.browse.bookmark.*
 */

jive.namespace('BookmarkApp.browse');

jive.BookmarkApp.browse.Main = jive.Filters.Main.extend(function(protect, _super) {

     protect.init = function(options) {
         var main = this;
         _super.init.call(this, options);

         jive.switchboard.addListener('bookmark.update', function(bookmark) {
             main.loadPage(main.getState(), true);
        });
     };

});
