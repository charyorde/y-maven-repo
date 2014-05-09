/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint laxbreak: true */
/*global containerType containerID */

jive.namespace('Navbar.Menu.Satellite');  // Creates the namespace if it does not already exist.

/**
 * Entry point for the Navbar.Menu.Satellite App.
 *
 * @param {jQuery|DOMElement|String} buttonSelector reference or selector to the menu button
 * @param {jQuery|DOMElement|String} menuSelector reference or selector to the menu container
 *
 * @depends path=/resources/scripts/apps/navbar/menu/satellite/models/satellite_source.js
 * @depends path=/resources/scripts/apps/navbar/menu/satellite/views/sat_nav_view.js
 * @depends path=/resources/scripts/apps/navbar/menu/main.js
 */
jive.Navbar.Menu.Satellite.Main = jive.Navbar.Menu.Main.extend(function(protect, _super) {

    this.init = function(buttonSelector, menuSelector, menuOpts) {
        var main = this;
        _super.init.call(this, buttonSelector, menuSelector, menuOpts);
    };

    protect.buildListView = function (buttonSelector, menuSelector, menuOpts) {
        return new jive.Navbar.Menu.Satellite.View(buttonSelector, menuSelector, menuOpts);
    };

    protect.buildItemSource = function() {
        return new jive.Navbar.Menu.Satellite.Source();
    };

    protect.sourceParams = function() {
        return {
            containerType : containerType,
            containerID : containerID };
    };

});
