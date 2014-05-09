/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint undef:true laxbreak:true */
/*global jive $j */

/**
 * Interface to history REST service filtered to return only places.
 *
 * @extends jive.RestService
 * @depends path=/resources/scripts/apps/shared/models/history_source.js
 */
jive.RecentPlacesSource = jive.HistorySource.extend(function(protect, _super) {
    protect.init = function(options) {
        _super.init.call(this, $j.extend({ filterID: '9003' }, options));
    };
});
