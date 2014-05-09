/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Menu.Apps.Instances');

/**
 * Handles UI for a list of bookmark items
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/navbar/menu/view/abstract_list.js
 * @depends path=/resources/scripts/jive/app/app-launch-market.js
 * @depends path=/resources/scripts/jquery/jquery.path.js
 * @depends template=jive.nav.menu.apps.instances.content
 */
jive.Navbar.Menu.Apps.Instances.ListView = jive.Navbar.Menu.AbstractListView.extend(function(protect) {
    var $ = jQuery;

    this.render = function(data) {
        this.stripDomain(data);
        var content = $(jive.nav.menu.apps.instances.content({links: data}));
        this.$menu.html(content);
        var appsMarketLaunch = new jive.AppMarketLaunch({appLaunchView: this});
        window.appsMarketLaunchPad = appsMarketLaunch;

        var launchAppsMarket = function(event) {
                                    window.location = jive.app.url({ path: '/apps/market' });
                                };
        $(this.$menu).find('#app-launch-market').unbind('click').click(launchAppsMarket);
        $(this.$menu).find('.js-launch-app-market').unbind('click').click(launchAppsMarket);


        $(this.$menu).find('#app-launch-your-apps').unbind('click').click(function(event) {
            window.location = jive.app.url({ path: '/apps/market/yourApps' });
        });

        var view = this;
        jive.switchboard.addListener("at", function(appView, options) {
            view.animateInstall(appView, options);
        });
    };

    this.showLaunchPad = function() {
        var self = this;
        self.$button.click();
    };

    this.toggleButton = function(count){
        var self = this;
        if (count > 0){
            self.$button.show();
        } else {
            self.$button.hide();
        }
    };

    protect.stripDomain = function(data) {
        // Images and Link in App Quick Launcher are absolute, causes login prompts and mixed content warnings. See JIVE-15593.
        // Remove the http(s)://domain(:port) part from 1. url, largeIconSrc & iconSrc
        var domainRegEx = /^https?:\/\/.+?\//;
        if(data && data.length) {
            for(var i = 0; i < data.length; ++i) {
                data[i].url = data[i].url.replace(domainRegEx, '/');
                data[i].iconSrc = data[i].iconSrc.replace(domainRegEx, '/');
                data[i].largeIconSrc = data[i].largeIconSrc.replace(domainRegEx, '/');
                data[i].favIconSrc = data[i].favIconSrc.replace(domainRegEx, '/');
            }
        }
    };
});
