/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * An instance of the MarketEvents object exists in every CoreContainer.Main
 * object. This object acts as an event switchboard for routing events
 * generated from the apps market.
 *
 * @depends path=/resources/scripts/apps/navbar/menu/apps/instances/animated_install.js
 */
define('jive.JAF.CoreContainer.MarketEvents', function() {
return jive.oo.Class.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    this.init = function() {
        var self = this;
        this.addListener("market_hidden", this.marketClose.bind(this));
        this.addListener("app_install", this.appInstall.bind(this));
        this.addListener("app_uninstall", this.appUninstall.bind(this));

        // "show_information" is handled in the main container class.
        // This line is here to remind developers that event exists.
        // this.addListener("show_information", not_handled_here );
    };

    protect.marketClose = function() {

    };

    protect.appInstall = function(installedApp, ifr, rpcArgs) {
        jive.switchboard.emit("apps_market.apps_have_changed");
    };

    protect.appUninstall = function(uninstalledApp, ifr, rpcArgs) {
        jive.switchboard.emit("apps_market.apps_have_changed");
    };
});
});
