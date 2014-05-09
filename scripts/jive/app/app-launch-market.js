/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */


jive.namespace('Apps');
/*globals $j */

/**
 * @param options
 * @depends path=/resources/scripts/jquery/jquery.ba-bbq.js
 * @depends template=jive.nav.menu.apps.instances.renderAppInstanceLink
 */
jive.AppMarketLaunch = $Class.extend({
    /////// initialization

    /**
     * @param options
     */
    init: function(options) {
        var _app_launch = this;
        this.appLaunchView = options.appLaunchView;

    },

    showAppMarket: function(dataOrView) {
        if(window.appContainer) {
            window.appContainer.handleMarketContext(dataOrView);
        }
    },

    addApp: function(data) {
        var content = $j(jive.nav.menu.apps.instances.renderAppInstanceLink({appLink: data}));
        this.appLaunchView.showLaunchPad();
        $j(this.appLaunchView.$menu).find('#j-quick-launch-apps-list').fadeIn(200).append(content);
    }

});
