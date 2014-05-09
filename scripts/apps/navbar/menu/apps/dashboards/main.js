/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Menu.Apps.Dashboards');  // Creates the namespace if it does not already exist.

/**
 * Entry point for the Apps Dashboards App.
 *
 * @param {jQuery|DOMElement|String}buttonSelector reference or selector to the menu button
 * @param {jQuery|DOMElement|String} menuSelector reference or selector to the menu container
 *
 * @depends path=/resources/scripts/apps/navbar/menu/apps/dashboards/views/dashboard_list.js
 * @depends path=/resources/scripts/apps/shared/models/app_dashboard_source.js
 * @depends path=/resources/scripts/apps/navbar/menu/main.js
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 */
jive.Navbar.Menu.Apps.Dashboards.Main = jive.Navbar.Menu.Main.extend(function(protect, _super) {

    var _ = jive.Navbar.Menu.Apps.Dashboards;  // Creates a shortcut for referring to the app namespace.

    this.init = function(buttonSelector, menuSelector, menuOpts) {
        _super.init.call(this, buttonSelector, menuSelector, menuOpts);
        var main = this;  // Captures a reference to this instance.

        // invalidate the menu when the user creates a dashboard
        jive.switchboard.addListener('dashboard.create', function(info) {
            main.listView.toggleButton(info.count);
            main.invalidate();
        });

        // invalidate the menu when the user edits a dashboard
        jive.switchboard.addListener('dashboard.edit', function(info) {
            main.invalidate();
        });

        //invalidate menu if a dashboard is removed
        jive.switchboard.addListener('dashboard.destroy', function(info) {
            main.listView.toggleButton(info.count);
            main.invalidate();
        });

        //invalidate menu if a dashboard is reordered
        jive.switchboard.addListener('dashboard.reorder', function(info) {
            main.invalidate();
        });
    };

    this.buildListView = function (buttonSelector, menuSelector, menuOpts) {
        return new _.ListView(buttonSelector, menuSelector, menuOpts);
    };

    this.buildItemSource = function() {
        return new jive.AppDashboardSource();
    };
});
