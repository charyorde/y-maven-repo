/*
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * The overlay app settings view.
 * Automatically resizes the modal container where the app whose services are to be rendered is housed
 * @class
 * @extends jive.JAF.CoreContainer.AppsContainerView
 * @param {Object} commonContainer
 * @param {Object} options
 *
 * @depends path=/resources/scripts/jive/app/core_container/views/appscontainer_view.js
 * @depends path=/resources/scripts/jive/app/configure/main.js
 * @depends path=/resources/scripts/jive/app/preferences/main.js
 * @depends path=/resources/scripts/apps/shared/views/loader_view.js
 */
define('jive.JAF.CoreContainer.AppServicesView',
['jquery',
 'jive.JAF.CoreContainer.AppsContainerView',
 'jive.JAF.Configuration.ConfigureMainV2',
 'jive.JAF.Preferences'],
function($j, AppsContainerView, ConfigureMainV2, Preferences) {
return AppsContainerView.extend(function(protect, _super) {

    jive.conc.observable(this);

    var currentView;
    var serviceSites;

    this.init = function (app, commonContainer, options) {
        _super.init.call(this, commonContainer, options);
        this.app = app;
        this.commonContainer = commonContainer;
        this.options = options;
        this.serviceSites = [];
    };

    this.setMarketApp = function(marketApp) {
        this.marketApp = marketApp;
    };

    this.isActive = function() {
        return $j('#app-services-container').length ? true : false;
    };

    this.createUI = function() {
        return $j(jive.apps.container.servicesView( {app: this.app}));
    };

    this.activate = function() {
        this.determineLeftNavItems(this.app);
        this.registerLeftNavHandlers();

        ////////////////////////////////////////////////////////////////////////
        // Selected nav state
        $j('.j-modal-nav li a').click(function(e) {
            $j(this).parent("li").addClass("selected")
                .siblings('li').removeClass("selected");
        });

        // by default, hide the footer
        this.hideNav();

        // by default, About should be selected
        $j('#j-app-svcs-about').click();

    };

    protect.determineLeftNavItems = function(app) {
        // system prefs (admin settings) tab's visibility is already determines in the Soy file
        // user-preferences
        $j('#j-app-svcs-settings').parent().show();

        // only show user settings if available
        if ( !app.userPrefsAvailable ) {
            $j("#j-app-svcs-settings").hide();
        }

        // only show configuration if available
        if ( !app.configurationAvailable || app.configurationError ) {
            $j("#j-app-svcs-config").hide();
        }
    };

    protect.hideNav = function() {
        $j("#app-services-container .j-modal-footer").hide();
    };

    protect.showNav = function() {
        $j("#app-services-container .j-modal-footer").show();
    };

    protect.wireButtonListeners = function( target ) {
        var self = this;
        target.addListener( 'app.service.wire.submit', function(data ) {
            self.showNav();
            $j("#j-app-services-submit").click( data.callback );
        });
        target.addListener( 'app.service.wire.cancel', function(data ) {
            self.showNav();
            $j("#j-app-services-cancel").click( data.callback );
        });
        target.addListener( 'app.service.wire.nav.show', function() {
            self.showNav();
        });
        target.addListener( 'app.service.wire.nav.hide', function() {
            self.hideNav();
        });
    };

    this.prepareDetail = function() {
        var siteElem = $j('#app-services-detail');
        siteElem.html('');
        return siteElem;
    };

    protect.registerLeftNavHandlers = function() {
        var self = this;

        ////////////////////////////////////////////////////////////////////////////////
        // System Settings (Only if app has system-settings view and the user is admin)
        if ($j('#j-app-sys-settings').length == 1) {
            $j('#j-app-sys-settings').click(function(event) {
                self.hideNav();

                var viewKey = 'sys-settings-view';
                var siteElem = self.prepareDetail();
                self.setCurrentSettingsView(viewKey);
                var site = self.prepareSiteViewIfRequired(viewKey, siteElem[0]);

                self.showSpinner(siteElem);
                self.requestNavigateTo(self.app, site, "system-settings", null, function(gadgetInfo) {
                    site.jiveData = new JiveSiteData(self, self.app, {});
                    site.jiveData.setGadgetMetaData(gadgetInfo);
                });
                self.emit("app.navigate.admin-settings");
                event.preventDefault();
            });
        }

        ////////////////////////////////////////////////////////////////////////
        // Settings
        $j('#j-app-svcs-settings').click(function(event) {

            self.hideNav();

            var viewParams = {};
            var viewKey = 'user-settings-view';
            var $siteElem = self.prepareDetail();
            self.setCurrentSettingsView(viewKey);
            var preferencesController = new Preferences( self.app, $siteElem );

            self.wireButtonListeners( preferencesController );

            preferencesController.addListener( 'app.preferences.get.custom.view', function( viewUrl ) {
                var siteElement = $siteElem[0];
                var site = self.prepareSiteViewIfRequired(viewKey, siteElement);
                self.showSpinner($siteElem);
                self.requestNavigateTo(self.app, site, "user-prefs", null, function(gadgetInfo) {
                    site.jiveData = new JiveSiteData(self, self.app, {});
                    site.jiveData.setGadgetMetaData(gadgetInfo);
                });
            });

            preferencesController.addListener('app.preferences.default.saved', function(message) {
                self.servicesClose();
                self.sendNotification( { "severity":"info", "message": message.message });
                self.emit("app.reload" );
            });
            self.emit("app.navigate.user-prefs");
            event.preventDefault();
        });

        ////////////////////////////////////////////////////////////////////////
        // Configure
        $j('#j-app-svcs-config').click(function(event) {

            var siteElem = self.prepareDetail();
            var viewKey = 'app-service-config-view';
            self.setCurrentSettingsView(viewKey);

            var configurationController = new ConfigureMainV2({
                app: self.app,
                domTarget: siteElem
            });

            self.wireButtonListeners( configurationController );

            configurationController.addListener( 'app.configure.success', function() {
                self.servicesClose();
                var msg = jive.apps.container.renderMessage({messageKey: 'appframework.app.configure.success' });
                self.sendNotification( { "severity":"info", "message": msg} );
                self.emit("app.reload" );
            });

            configurationController.addListener( 'app.configure.failed', function() {
                var msg = jive.apps.container.renderMessage({messageKey: 'appframework.app.configure.failure' });
                self.sendNotification( { "severity":"error", "message": msg} );
            });
            self.emit("app.navigate.configure");
            event.preventDefault();
        });

        ////////////////////////////////////////////////////////////////////////
        // Developer
        $j('#j-app-svcs-developer').click(function(event) {
            self.hideNav();

            var viewKey = 'app-developer-view';
            self.setCurrentSettingsView(viewKey);
            var siteElem = self.prepareDetail();
            var app = self.app;

            if(typeof(app.developerModel) == 'undefined') {
                app.developerModel = new jive.JAF.Configuration.DeveloperModel();
            }
            var developerController = new jive.JAF.Configuration.Developer({
                app: app,
                domTarget: siteElem
            });
            self.emit("app.navigate.developer");
            event.preventDefault();
        });

        ////////////////////////////////////////////////////////////////////////
        // About
        $j('#j-app-svcs-about').click(function(event) {
            var viewKey = 'app-about-view';
            if (self.currentView == viewKey) {
                return;
            }
            self.hideNav();
            var siteElem = self.prepareDetail();
            self.setCurrentSettingsView(viewKey);
            var site = self.prepareSiteViewIfRequired(viewKey, siteElem[0]);

            if (self.app.aboutViewAvailable) {
                self.requestNavigateTo(self.app, site, "about", null, function(gadgetInfo) {
                    site.jiveData = new JiveSiteData(self, self.app, {});
                    site.jiveData.setGadgetMetaData(gadgetInfo);
                });
            } else {
                // Prepare site for app about view launch from market
                // Prepare jive context and market experience
                var jCtx = {};
                if (self.app.appUUID) {
                    jCtx.market = {
                        experience: "about"
                    };
                    jCtx.market.appUUID = self.app.appUUID;
                } else {
                    jCtx.market = {
                        experience: "default"
                    };
                }
                var embeddedId = self.prepareMarketContext(jCtx);
                var marketContext = self.getEmbeddedContext(embeddedId.embeddedID);
                marketContext.target.view = "embedded";

                self.renderAppEE_(siteElem[0], self.marketApp, marketContext, function(site, response) {
                    aboutSite = site;
                    aboutSite.jiveData = new JiveSiteData(self, self.marketApp, {});
                    aboutSite.jiveData.setEEContext(marketContext);
                    aboutSite.jiveData.setGadgetMetaData(response);
                    var appFrame = siteElem.find('iframe');
                    appFrame.removeData();
                    if (self.marketApp.marketFeatureAvailable) {
                        // this is an apps market iframe
                        appFrame.data("hasMarketFeature", true);
                    }
                    appFrame.css({height: '500px', width: '450px' });
                });
            }
            self.emit("app.navigate.about");
            event.preventDefault();
        });

        ///////////////////////////////////////////////////////////////////////////////////
        // close
        var closeHandler = function(event) {
            self.servicesClose();
            event.preventDefault();
        };

        $j('.j-modal-back-top').click(closeHandler);
        $j('#j-app-services-cancel').click(closeHandler);
    };

    protect.servicesClose = function(event) {
        this.setCurrentSettingsView(null);
        this.emit("app.services.close");
    };

    this.setCurrentSettingsView = function (viewKey) {
        if (this.currentView != viewKey) {
            if (this.serviceSites[viewKey]) {
                this.commonContainer.closeGadget(this.serviceSites[viewKey]);
                this.currentView = null;
                this.serviceSites[viewKey] = null;
            }
        }
        this.currentView = viewKey;

    };

    this.prepareSiteViewIfRequired = function (viewKey, siteElement) {
        var cachedSite = this.serviceSites[viewKey];
        if( cachedSite ) {
            return cachedSite;
        }

        this.serviceSites[viewKey] = this.commonContainer.newGadgetSite(siteElement);
        this.currentView = viewKey;

        return this.serviceSites[viewKey];
    };

    this.requestNavigateTo = function( app, gadgetSite, view, viewParams, callback ) {
        app.view = view;
        this.renderApp_(gadgetSite, app, callback, viewParams);
    };

    protect.showSpinner = function(siteElem) {
        var spinner = new jive.loader.LoaderView({size: 'small', inline: true});
        spinner.appendTo($j(siteElem));
        spinner.show();
    };
});
});
