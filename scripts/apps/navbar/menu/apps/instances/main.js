/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Menu.Apps.Instances');  // Creates the namespace if it does not already exist.

/**
 * Entry point for the Apps Instances App.
 *
 * @param {jQuery|DOMElement|String}buttonSelector reference or selector to the menu button
 * @param {jQuery|DOMElement|String} menuSelector reference or selector to the menu container
 *
 * @depends path=/resources/scripts/apps/navbar/menu/apps/instances/views/instance_list.js
 * @depends path=/resources/scripts/apps/shared/models/app_instance_source.js
 * @depends path=/resources/scripts/apps/navbar/menu/main.js
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 */
jive.Navbar.Menu.Apps.Instances.Main = jive.Navbar.Menu.Main.extend(function(protect, _super) {

    var _ = jive.Navbar.Menu.Apps.Instances;  // Creates a shortcut for referring to the app namespace.

    this.init = function(buttonSelector, menuSelector, menuOpts) {
        _super.init.call(this, buttonSelector, menuSelector, menuOpts);
        var main = this;  // Captures a reference to this instance.

        // check for apps container  exists
        if(window.appContainer) {
            window.appContainer.getMarketEvents().addListener('app_install' , function(installData, ifr) {
                var offset = ifr && ifr.offset();
                if ($j.isArray(installData)) {
                    for (var i = 0, l = installData.length; i < l; ++i) {
                        exec(installData[i]);
                    }
                } else {
                    exec(installData);
                }
                function exec (installData) {
                    jive.Navbar.Menu.Apps.animatedInstall(installData, offset).addErrback(function () {
                        // animation did not run, fall back to showing the menu;
                        main.invalidate();
                        // show a message
                        var msg = jive.apps.container.renderMessage({messageKey: 'appframework.app.installed'});
                        $j("<p/>").html(msg).message({"style":"info"});
                    });
                }
            });

            window.appContainer.getMarketEvents().addListener('show_app_detail', function(data) {
                if (data && data.appUUID) {
                    var appUrl = jive.app.url({ path: '/apps/market/marketapp/' }) +data.appUUID;
                    window.open(appUrl);
                }

            });
        }

        // invalidate menu if a dashboard is removed
        jive.switchboard.addListener('apps_market.apps_have_changed', function() {
            main.invalidate();
        });

    };

    this.buildListView = function (buttonSelector, menuSelector, menuOpts) {
        return new _.ListView(buttonSelector, menuSelector, menuOpts);
    };

    this.buildItemSource = function() {
        return new jive.AppInstanceSource();
    };

    protect.sourceParams = function() {
        return { 'ts': new Date().getTime() };
    };

});
