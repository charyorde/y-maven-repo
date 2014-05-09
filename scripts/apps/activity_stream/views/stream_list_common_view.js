/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 *
 * @depends i18nKeys=rte.toggle_display
 * @depends i18nKeys=rte.edit.disabled
 * @depends i18nKeys=rte.edit.disabled.desc
 * @depends i18nKeys=post.alwaysUseThisEditor.tab
 */
jive.namespace('ActivityStream');

jive.ActivityStream.StreamListCommonView = jive.AbstractView.extend(function(protect, _super) {
    this.init = function (options) {
        _super.init.call(this, options);
        this.streamListItems = [];
        this.data = options.data;
        this.itemsByDomID = {};
        this.i18n = options.i18n;
        this.streamType = options.streamType;
        this.filterType = options.filterType;
        this.timepoints = options.timepoints;
        this.lastViewedObjectType = options.lastViewedObjectType;
        this.lastViewedObjectID = options.lastViewedObjectID;
        this.maxLoadMoreTimes = (($j.browser.msie && $j.browser.version < 8) ? 9 : 0); // max pages for IE7
        this.numTimesLoadedMore = 0;
        this.keyNavLocked = false;
    };

    protect.postRender = jive.oo._abstract;

    protect.initStreamItem = jive.oo._abstract;

    protect.refresh = jive.oo._abstract;

    this.hide = function(){
        this.getContent().hide();
    };

    this.show = function(){
        this.getContent().show();
    };

    this.tearDown = function() {
        $j(window).unbind('scroll.autoLoad');
    };
});
