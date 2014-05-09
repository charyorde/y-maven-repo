/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Renders Canvas View.
 * Only one instance of this class should exist in a page
 *
 * @class
 * @extends jive.JAF.CoreContainer.AppsContainerView
 * @param {Object} commonContainer
 * @param {Object} options
 *
 * @depends path=/resources/scripts/jive/app/core_container/views/appscontainer_view.js
 * @depends path=/resources/scripts/jive/app/core_container/site_data.js
 * @depends path=/resources/scripts/jive/app/core_container/navigate_app.js
 * @depends path=/resources/scripts/jive/app/alert/main.js
 */
define('jive.JAF.CoreContainer.CanvasView',
['jquery',
 'jive.JAF.CoreContainer.AppsContainerView',
 'jive.JAF.Alerts.AlertMainV2',
 'jive.JAF.CoreContainer.NavigateApp'],
function($j, AppsContainerView, AlertMainV2, NavigateApp) {
    return AppsContainerView.extend(function(protect, _super) {

        // Mix in observable to make this class an event emitter.
        jive.conc.observable(this);

        var ActionOriginEnum = { CANVAS: 'app.canvas.run' }; // not emitted yet, when is TBD
        var canvasSite;
        var navigateApp = new NavigateApp();

        this.init = function (commonContainer, options) {
            var self = this;
            _super.init.call(this, commonContainer, options);
        };

        this.getActionOriginEnum = function() {
            return ActionOriginEnum;
        };

        protect.handleAppAlert = function( appAlertWrapper ) {
            var self = this;

            var launchConfigurationDialog = function() {
                var app = appAlertWrapper.getApp();
                if ( !app.configurationError ) {
                    self.renderModal( app, function() {
                        self.emit("app.canvas.modal.close");
                    } );

                    self.handleConfigurationDialog(appAlertWrapper, {
                        modalWidth: 650, modalHeight: 500,
                        configureCallback: function( success ) {
                            if ( success ) {
                                self.closeModal();
                            }
                        }
                    });
                }
            };

            appAlertWrapper.applyBlock();

            // launch right away if necessary
            var appAlert = appAlertWrapper.getActiveAlert();
            if ( appAlert.code == 1000 || appAlert.code == 1010 ) {
                launchConfigurationDialog();
            } else {
                self.hideChromeNav();
            }

            // launch on demand - clicking on the alert action buttons
            appAlertWrapper.addListener("app.block", function(data) {
                appAlertWrapper.routeActionClicks( data,
                    function() {
                        launchConfigurationDialog();
                    },
                    function() {
                        window.location = window._jive_base_url + "/";
                    },
                    function() {
                        var msg = jive.apps.container.renderMessage({messageKey: 'error.general' });
                        self.sendNotification( { "severity":"error", "message": msg} );
                    },
                    self
                );
            });

        };

        this.render = function(app, viewParams, context, renderCompleteCallback) {
            var siteHtmlElem = $j('.j-app-canvas')[0];
            var self = this;

            // Try to combine passed view params with query parameters
            var combinedViewParams = navigateApp.addActionQueueItemToViewParams(viewParams);

            // Storing the app info which is either appUUID or app-path from the user-agent URL
            var appInfo = navigateApp.getCanvasAppInfoFromUrl();
            if(appInfo !== null) {
                var params =  (combinedViewParams !== null) ? combinedViewParams : {};
                navigateApp.setCanvasToken({appInfo : appInfo, view: app.view, params: params});
            }

            if ( context ) {
                // Ideally we should not be calling EE for rendering canvas view.
                // But market needs context and the only way we can send it is through EE
                this.renderAppEE_(siteHtmlElem, app, context, function(site, response) {
                    canvasSite = site;
                    site.jiveData = new JiveSiteData(self, app, combinedViewParams);
                    site.jiveData.setEEContext(context);
                    site.jiveData.setGadgetMetaData(response);
                    var iframe = $j(site.getActiveGadgetHolder().getIframeElement());
                    iframe.attr('width', "100%");
                    if (app.marketFeatureAvailable) {
                        // this is an apps market iframe
                        iframe.data("hasMarketFeature", true);
                    }
                    renderCompleteCallback.call( site );
                });

            } else {
                canvasSite = this.commonContainer.newGadgetSite(siteHtmlElem);
                var site = canvasSite;
                site.jiveData = new JiveSiteData(this, app);
                this.loadAppIframe(app, site, combinedViewParams, renderCompleteCallback);
            }

            $j("#j-canvas-app-refresh-btn").unbind('click').click( function(event) {
                self.emit('app.services.refresh', event.currentTarget);
                event.preventDefault();
            });

            $j("#j-canvas-app-delete-btn").unbind('click').click( function(event) {
                self.emit('app.delete', app,
                    function() {
                        window.location = window._jive_base_url + "/";
                    },
                    function() {
                        self.displayRefreshMsg(false);
                    } );
                event.preventDefault();
            });

            protect.enableSparkline(app);

            // wire up app preferences
            // unbind first because render can be called multiple times due to reload.
            $j("#j-canvas-app-preference-btn").unbind('click').click( function(event) {
                // emit a signal so that the controller can finish wiring up the preferences
                self.emit("app.services.show", app);
                event.preventDefault();
            });
        };

        this.getRenderedApp = function() {
            return canvasSite && canvasSite.jiveData ? canvasSite.jiveData.app : null;
        };

        this.reload = function() {
            if(!canvasSite) return;
            var jiveSiteData = canvasSite.jiveData;
            this.commonContainer.closeGadget(canvasSite);
            jiveSiteData.app.view = jiveSiteData.getAppView();
            this.render(jiveSiteData.app, jiveSiteData.viewParams, jiveSiteData.getEEContext());
        };

        this.setTitle = function(title) {
            if(!canvasSite) return;
            this.altTitle = title;
            var jiveSiteData = canvasSite.jiveData;
            $j(".js-canvas-app-title").text(title || jiveSiteData.app.title || "");
        };

        this.requestNavigateTo = function( app, site, view, data, callback ) {
            var self = this;
            self.loadAppIframe( app, site, data, callback );
        };

        this.loadAppIframe = function(app, site, viewParams, callback) {
            var self = this;
            self.renderApp_(site, app, function(gadgetInfo) {
                site.jiveData = new JiveSiteData(self, app, viewParams);
                site.jiveData.setGadgetMetaData(gadgetInfo);

                var iframe = $j(site.getActiveGadgetHolder().getIframeElement());
                iframe.attr('width', "100%");

                // FOR Dev Tool or Dev Console APP we need to activate the market events
                if (app.marketFeatureAvailable) {
                    // this is an apps market iframe
                    iframe.data("hasMarketFeature", true);
                } else {
                    if ( $j.browser.msie && $j.browser.version < 8 ) {
                        // ie7 has a problem with removing the scrolling attribute from an iframe
                        // just ensure that its set to scrolling 'no'
                        iframe.attr("scrolling", 'no');
                    } else {
                        iframe.removeAttr('scrolling');
                    }
                    iframe.attr('overflow','auto');
                }
                // iframe.attr('height', $j.browser.webkit ? "100%" : "750px");
                if ( callback ) {
                    callback( gadgetInfo );
                }
            }, viewParams);
        };

        /**
         * Implementation of resizing height for canvas view.
         *
         * @param newIframeHeight
         * @param animate
         * @param site
         */
        this.resizeContainerHeight = function(newIframeHeight, animate, site) {
            var $iframe = $j(site.getActiveGadgetHolder().getIframeElement());

            if(newIframeHeight === 'max') {
                newIframeHeight = this.getMaximumHeight();
            }

            $iframe[animate ? 'animate' : 'css']({height: (newIframeHeight + 'px')}, {duration: 300, queue: false});
        };

        this.maximizeApp = function(site) {
            this.resizeContainerHeight("max", false, site);
        };

        /**
         * Calculate maximum app dialog height based on current window height
         */
        this.getMaximumHeight = function() {
            return $j(window).height();
        };

        /**
         * Calculate maximum app dialog width based on current window height
         */
        this.getMaximumWidth = function() {
            return $j(window).width();
        };

        this.scrollIntoView = function(appFrameID, scrollOptions) {
            var options =  scrollOptions || {};
            var bottomOffset = options.bottomOffset;
            var verticalAlignment = options.verticalAlignment == null ? "bottom" : options.verticalAlignment;
            var appFrameContainer = $j("#" + appFrameID).parents(".j-app-canvas");
            var offsetTop;
            if (verticalAlignment === "top") {
                offsetTop = -8; // just below the top of the window
            } else if (verticalAlignment === "center" || verticalAlignment === "middle") {
                offsetTop = (20 + appFrameContainer.height() - $j(window).height()) / 2;
            } else if (isFinite(verticalAlignment)) {
                offsetTop = Number(verticalAlignment);
                if (offsetTop < 0) {
                    if (appFrameContainer.offset().top) {
                        offsetTop = -appFrameContainer.offset().top;
                    }
                }
            } else {
                // default to the bottom
                bottomOffset = isFinite(bottomOffset) ? Number(bottomOffset) : 0;
                offsetTop = bottomOffset + appFrameContainer.height() - $j(window).height() - $j(".j-canvas-preference-container").height() - 15;
            }
            $j.scrollTo(appFrameContainer, {duration:500,offset:{left:0,top:offsetTop}});
        };

        /**
         * Internal function used to render modal dialog for settings in Canvas view.
         * @param app
         * @param onCloseCallback
         */
        this.renderModal = function( app, onCloseCallback ) {
            var self = this;
            this.html = $j(jive.apps.container.canvasConfigurationModal({ 'app': app }));

            var onModalLoad = function(app, altTitle) {
                var realTitle = self.getRealTitle(app, altTitle);

                var maxTitleLength = (  $j("#j-app-modal-parent").width() / 8 ) - 8;
                realTitle = realTitle.length > maxTitleLength ?  realTitle.substring(0, maxTitleLength) + " ..." : realTitle;

                self.setModalTitle(realTitle);

                var outsideOfWindow = $j(window).height() + $j(document).scrollTop()
                                     - ( $j("#jive-canvas-modal").offset().top + $j("#jive-canvas-modal").outerHeight() ) < 0;
                if ( outsideOfWindow ) {
                    protect.recenter( $modal, false );
                }
            };

            var $modal = this.html.lightbox_me({
                closeSelector: '.close',
                destroyOnClose: true,
                centered: true,
                modalCSS: {top: '0px'},
                onLoad: function() {onModalLoad(app, self.altTitle); },
                onClose: onCloseCallback || function() {}
            });
        };

        /**
         * Adds the S & C interface.
         * @param appServiceController
         */
        this.invokeSettings = function( appServiceController, app ) {
            this.renderModal(app);

            // 1. generate UI
            var $html = appServiceController.createUI();
            $j('#j-app-modal-parent').append($html);

            // 2. resize the modal to fit new presentation
            var height = 550;
            var width = 600;
            $j("#j-app-modal-parent").css( {"height": height, "width": width} );

            // 3. activate controller
            appServiceController.activate();
        };

        /**
         * Destroys the S & C interface.
         */
        this.destroySettings = function() {
            this.closeModal();
        };

        /**
         * Adds the credentials interface.
         * @param credentialsController
         */
        this.invokeCredentials = function( credentialsController ) {
            var self = this;
            // 0. render the host modal
            this.renderModal( credentialsController.getApp(), function() {
                self.emit("app.canvas.modal.close");
            } );

            // 1. generate UI
            var $html = credentialsController.createUI();
            $j('#j-app-modal-parent').append($html);

            credentialsController.activate();

            // 2. resize the modal to fit new presentation
            this.resizeModal( 260, 600, false );
       };

        /**
         * Destroys the credentials interface
         */
        this.destroyCredentials = function() {
            this.closeModal();
        };

        this.resizeModal = function( height, width, animate ) {
            $j("#j-app-modal-parent").css( {"height": height, "width": width} );
        };

        /**
         * Creates the 3-legged oauth connects dance interface
         * @param oauthController
         */
        this.invokeOauthDance = function( oauthController ) {
            var self = this;

            var canvas = $j(".j-app-canvas");
            $j(".j-app-canvas iframe").hide();
            var app = oauthController.getApp();
            var alerts = new AlertMainV2( app, canvas );

            var alert = {
                appTitle: app.title,
                code: 2060,
                message: "",
                creator: "",
                errorMessage: "",
                iconSrc: app.iconSrc };

            var blockingDom = alerts.applyBlock( canvas, app, alert );

            oauthController.launch_popup( $j(blockingDom) );

            oauthController.addListener('popup.closed', function() {
                // clear overlay
                $j(blockingDom).remove();
                $j(".j-app-canvas iframe").show();

                oauthController.invokeCallback();
            });
        };

        protect.closeModal = function() {
            if(this.html && this.html.find && this.html.find("a.close")) {
                this.html.find("a.close").click();
            }
        };

        this.restoreChromeNav = function() {
            $j(".j-canvas-app-chromeopts").show();
        };

        this.hideChromeNav = function() {
            $j(".j-canvas-app-chromeopts").hide();
        };

        /**
         * Handle app_install market event.
         * @param installedApp
         */
        this.handleAppsMarketInstall = function(installedApp) {
            var appInfo = navigateApp.getCanvasAppInfoFromUrl();
            var canvasToken = navigateApp.getCanvasToken();
            var viewParams = null;
            // lets check if the current app canvas URL has been tried to be rendered when apps market shows up.
            if(canvasToken !== null && canvasToken.hasOwnProperty('appInfo') && canvasToken.appInfo == appInfo) {
                // if exist now compare with installed app
                if(appInfo !== null && appInfo === installedApp.appUUID || appInfo === installedApp.appPath) {
                    installedApp.view = canvasToken.view;
                    viewParams = canvasToken.params;

                    // set default view to canvas if not being set
                    if(typeof installedApp.view === 'undefined' || installedApp.view === null) {
                        installedApp.view = "canvas";
                    }
                    if(!canvasSite) return;
                    this.commonContainer.closeGadget(canvasSite);
                    this.render(installedApp, viewParams);
                }
            }

            // clear the app token cache
            navigateApp.setCanvasToken({});
        };
    });
});
