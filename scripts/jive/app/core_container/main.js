/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('JAF.CoreContainer');

/**
 * This is the entry point for the JAF.CoreContainer.Main class.
 * This singleton controller does not remember state of "current" app.
 * Information about the content in which the app is to appear is available in options.editedContentBean
 * after initEditContext is called.
 *
 * @class
 * @param {Object} options used to initialize the core container.
 *
 * @depends path=/resources/scripts/jive/app/app-file-uploader.js
 * @depends path=/resources/scripts/jive/app/oauth/main.js
 * @depends path=/resources/scripts/jive/app/core_container/views/credentials_view.js
 * @depends path=/resources/scripts/jive/app/core_container/views/services_view.js
 * @depends path=/resources/scripts/jive/app/core_container/models/appscontainer_model.js
 * @depends path=/resources/scripts/jive/app/core_container/views/canvas_view.js lazy=true
 * @depends path=/resources/scripts/jive/app/core_container/market_events.js
 * @depends path=/resources/scripts/jive/app/core_container/views/modal_view.js
 * @depends path=/resources/scripts/jive/app/core_container/navigate_app.js
 * @depends path=/resources/scripts/jive/app/preferences/models/preferences_model.js
 *
 * @depends template=jive.apps.alerts.* scope=client
 * @depends i18nKeys=appframework.app.*
 */
define('jive.JAF.CoreContainer.Main',
['jive.AppFileUploader',
 'jive.JAF.Configuration.OAuthMain',
 'jive.JAF.CoreContainer.AppCredentialsView',
 'jive.JAF.CoreContainer.AppServicesView',
 'jive.JAF.CoreContainer.AppsContainerModel',
 'jive.JAF.CoreContainer.MarketEvents',
 'jive.JAF.CoreContainer.ModalView',
 'jive.JAF.Preferences.Model'],
function(AppFileUploader, OAuthMain, AppCredentialsView, AppServicesView, AppsContainerModel, MarketEvents,
         ModalView, PreferencesModel) {
jive.JAF.CoreContainer.Main = jive.oo.Class.extend(function(protect) {
    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    var _ = jive.JAF.CoreContainer;  // Creates a shortcut for referring to the app namespace.
    var ActionOriginEnum = {}; // list of origins from where an app was invoked, Possible origins are sidebar, rte, artifact(stream, content, etc.) or simply from URL for canvas
    var pendingActions = {};  // pending contributed actions to be run but waiting for gadget to render
    var marketEvents = new MarketEvents();
    var artifactHelper = new jive.Apps.RteArtifacts();

    this.init = function(options) {
        this.options = options = options  || {};

        // Check if OpenSocial common container namespace exists
        if((typeof osapi === 'undefined') || (typeof osapi.container === 'undefined')) {
           return;
        }

        //  Initialize OpenSocial's common container
        this.initializeOpenSocialCommonContainer(options);

        // Note: both modal and canvas views are singletons as well, all gadget communication will have the view
        // and app metadata they should work with kept in the gadget site. See the structure JiveSiteData
        this.modalView = new ModalView(this.commonContainer, options);
        jQuery.extend(ActionOriginEnum, this.modalView.getActionOriginEnum());

        // singleton model
        this.model = new AppsContainerModel(this.commonContainer, options);

        // register rpc handlers
        this.rpcRegister();

        // wired up events handlers
        this.initializeEventHandlers();

        osapi = osapi || {};
        osapi.jive = osapi.jive || {};
        osapi.jive.corev3 = osapi.jive.corev3 || {};
        osapi.jive.corev3.extensions = osapi.jive.corev3.extensions || {};

        var queue = [];

        osapi.jive.corev3.extensions.runWhenReady = function (fn) {
            queue.push(fn);
        };
        this.model.addListener('container.token.refreshed', function () {
            for (var i = 0; i < queue.length; i++) {
                jive.conc.nextTick(queue[i]);
            }
            delete osapi.jive.corev3.extensions.runWhenReady;
        });
    };

    protect.initializeOpenSocialCommonContainer = function(options) {
        //  OpenSocial's common container
        this.commonContainer = new osapi.container.Container(this.createConfig(options));

        // override osapi.container.Service.prototype.getLanguage and getCountry functions
        osapi.container.Service.prototype.getLanguage = function() {
            try {
                var jiveLocale = _jive_locale;
                return jiveLocale.split('_')[0] || "all";
            }
            catch (e) {
                return "all";
            }
        };

        osapi.container.Service.prototype.getCountry = function() {
            try {
                var jiveLocale = _jive_locale;
                return jiveLocale.split('_')[1] || "ALL";
            }
            catch (e) {
                return "ALL";
            }
        }
    };

    /*
     * Called whenever a content is created or edited
     */
    this.initEditContext = function(contentBean) {
        this.options.editedContentBean = contentBean;
        var contentInfo = contentBean.appContextBean;
        if(contentInfo) {
            this.editContext = {
                jive: {
                    content: {
                        type: contentInfo.coreAPIType,
                        id: contentInfo.containerId < 0 ? 0 : contentInfo.containerId
                    }
                }
            };
        }
    };

    protect.initializeEventHandlers = function () {
        var main = this;

        // Add default listeners to all Modal View ActionOriginEnum
        $j.each(ActionOriginEnum, function(index, origin) {
            main.modalView.addListener(origin, function(actionInfo) {
                main.handleRunAction(actionInfo, origin);
            });
        });

        this.applyAppReloadHandlers( this.modalView );

        ////////////////////////////////////////////////////////////////////////////////////////////
        this.modalView.addListener('app.services.show', function(appUUID) {
            if(main.servicesView && main.servicesView.isActive()) return;
            if(main.servicesView) delete main.servicesView;
            if(appUUID) {
                main.model.getApp(appUUID).addCallback(function(app) {
                    // get the app, and on retrieve setup the services view
                    main.servicesView = new AppServicesView(app, main.commonContainer, main.options);

                    main.servicesView.addListener( 'app.reload', function() {
                        main.reloadApp();
                    });

                    // fetch the market app
                    main.model.getAppsMarketApp().addCallback(function(marketApp) {
                        main.servicesView.setMarketApp(marketApp);

                        main.servicesView.addListener('app.services.close', function() {
                            main.modalView.destroySettings();
                            if ( app.developerModel ) {
                                main.modalView.setSparkline(app.developerModel.getMonitorState());
                            }
                        });

                        main.modalView.invokeSettings( main.servicesView );
                    });
                });
            }
        });

        ////////////////////////////////////////////////////////////////////////////////////////////
        this.modalView.addListener('app.chrome.close', function() {
            delete main.servicesView;
            if ( main.credentialsView ) {
                main.credentialsView.cleanup();
                delete main.credentialsView;
            }
            main.servicesView = null;
            main.credentialsView = null;
            main.oauthView = null;
        });

        ////////////////////////////////////////////////////////////////////////////////////////////
        marketEvents.addListener("show_information", function(opts, appIframe, rpcArgs) {
            main.sendNotification(rpcArgs, opts);
        });

        marketEvents.addListener('app_install', function(installData, ifr, rpcArgs) {
            var app = $j.isArray(installData) ? (installData.length ? installData[0] : null) : installData;
            if(main.postInstallActionRun) {
                var actionInfo = main.postInstallActionRun.actionInfo;
                var origin = main.postInstallActionRun.origin;

                var postAnimationAction = function() {
                    if(main.postInstallActionRun && app && actionInfo && origin && app.appUUID === app.appUUID) {
                        delete main.postInstallActionRun;
                        main.handleRunAction(actionInfo, origin);
                        main.postInstallActionRun = null;
                    }
                    jive.switchboard.removeListener('app.install.animation.ended', postAnimationAction);
                };

                jive.switchboard.addListener('app.install.animation.ended', postAnimationAction);
                // if for some reason animation never fired, we will fall back with a timeout
                // Fix animation time cost:
                // (initialDelay) 500 + (delayAfterPlacedInLauncher) 250
                // + (targetSlide) 750 + (iconSweep) 2500
                // + (post animation delay for any callback to finish) 250= 4250 ms
                setTimeout(postAnimationAction, 4250);
            } else {
                var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
                var mvcView = site.jiveData.mvcView;

                // let the right view handle the install
                main.model.cacheApp(app, false);
                mvcView.handleAppsMarketInstall(app);
            }

            // following an install we pre-load some of the app's resources so the browser caches them
            // this helps with faster launching of app.
        });

        ////////////////////////////////////////////////////////////////////////////////////////////
        // app alert handlers
        main.applyAppAlertHandlers( main.modalView );

        ///////////////////////////////////////////////////////////////////////////////////////////
        // oauth handlers
        main.applyOAuthHandlers( main.modalView );

        ////////////////////////////////////////////////////////////////////////////////////////////
        // refresh handlers
        main.applyRefreshHandlers( main.modalView );

        ////////////////////////////////////////////////////////////////////////////////////////////
        // credentials challenge handlers
        main.applyCredentialsHandlers( main.modalView );


        $j(document).ready(function() {
            main.modalView.documentReady();
        });
    };

    protect.applyAppReloadHandlers = function( target ) {
        var main = this;
        var cleanup = function() {
            // cleanup
            if (main.oauthView) {
                delete main.oauthView;
            }
            if (main.servicesView) {
                delete main.servicesView;
            }
            if (main.credentialsView) {
                delete main.credentialsView;
            }
        };
        target.addListener('app.reload', function(useCached) {
            cleanup();

            // reload the app
            main.reloadApp(useCached);
        });
    };

    protect.applyOAuthHandlers = function( target ) {
        var main = this;
        target.addListener('app.oauth.show', function(args) {

            if (main.oauthView) {
                // only one of these at a time!
                return;
            }

            // create new oauth instance
            main.oauthView = new OAuthMain(
                args.app,
                args.options.alias,
                args.options.redirectURI,
                args.options.windowChars,
                args.callback  );

            target.invokeOauthDance( main.oauthView );

            main.oauthView.addListener( "popup.closed", function() {
                delete main.oauthView;
            });
        });
    };

    protect.applyRefreshHandlers = function( target ) {
        var main = this;

        target.addListener('app.services.refresh', function(refreshAnchorNode) {
            var appUUID = $j(refreshAnchorNode).attr('data-appuuid');
            var endpoint = $j(refreshAnchorNode).attr('data-endpoint');
            main.model.refreshApp(endpoint,
                function() {
                    target.refresh();
                },
                function() {
                    target.displayRefreshMsg(false);
                }
            );
        });

    };

    protect.applyCredentialsHandlers = function( target ) {
        var main = this;

        target.addListener('app.credentials.show', function( options ) {

            if (main.credentialsView) {
                // noop if the credentials view already exists
                return;
            }

            // create a credentials instance
            main.credentialsView = new AppCredentialsView(options);

            // invoke the UI
            target.invokeCredentials( main.credentialsView );

            // close the app modal on error -- may only use the app if credentials are successfully provided
            main.credentialsView.addListener('app.credentials.complete.error', function() {
                target.closeModal();
            });

            // revoke overlay on success
            main.credentialsView.addListener('app.credentials.complete.success', function() {
                target.destroyCredentials();
                delete main.credentialsView;
            });

            main.credentialsView.addListener( 'app.service.message', function( message ) {
                target.sendNotification(message);
            });
        });
    };

    protect.applyAppAlertHandlers = function ( target ) {
        var main = this;
        target.addListener( 'app.remove.banned', function( app, successCallback, errorCallback  ) {
            main.model.appRemove("ban", app.id, successCallback, errorCallback );
            jive.switchboard.emit("apps_market.apps_have_changed");
        });
        target.addListener( 'app.remove.blacklisted', function( app, successCallback, errorCallback  ) {
            main.model.appRemove("blacklist", app.id, successCallback, errorCallback );
            jive.switchboard.emit("apps_market.apps_have_changed");
        });
        target.addListener( 'app.remove.throttle.violation', function(app, successCallback, errorCallback) {
            main.model.acknowledgeThrottle(app.id,
                function() {
                    successCallback();
                    main.reloadApp(false);
                },
                errorCallback );
        });
        target.addListener( 'app.hide', function(app, successCallback, errorCallback) {
            main.model.appHide( app.id, successCallback, errorCallback );
            jive.switchboard.emit("apps_market.apps_have_changed");
        });
        target.addListener( 'app.refresh', function() {
            main.reloadApp(false);
        });
        target.addListener('app.delete', function(app, successCallback, errorCallback ) {
            main.model.deleteApp(app.appInstanceUUID, successCallback, errorCallback );
            jive.switchboard.emit("apps_market.apps_have_changed");
        });

    };

    // register supported rpc events
    protect.rpcRegister = function() {
        var self = this;
        this.commonContainer.rpcRegister("actions.bindAction", self.bindAction.bind(self));
        this.commonContainer.rpcRegister("maximize_app", self.maximizeApp.bind(self));
        this.commonContainer.rpcRegister("set_pref", self.setPref.bind(self));
        this.commonContainer.rpcRegister("set_title", self.setTitle.bind(self));
        this.commonContainer.rpcRegister("close_app", self.closeApp.bind(self));
        this.commonContainer.rpcRegister("editor_insert", self.editorInsert.bind(self));
        this.commonContainer.rpcRegister("send_notification", self.sendNotification.bind(self));
        this.commonContainer.rpcRegister("request_place_picker", self.initPlacePicker.bind(self));
        this.commonContainer.rpcRegister("request_user_picker", self.initUserPicker.bind(self));
        this.commonContainer.rpcRegister("requestNavigateTo", self.requestNavigateTo.bind(self));
        this.commonContainer.rpcRegister("request_upload_app_data_media_item", self.requestNavigateTo.bind(self));
        this.commonContainer.rpcRegister("request_core_api_upload", self.requestCoreApiUploadMediaItem.bind(self));
        this.commonContainer.rpcRegister("actions", this.router.bind(self));
        this.commonContainer.rpcRegister("resize_iframe", this.resizeContainerHeight.bind(self));
        this.commonContainer.rpcRegister("resize_iframe_width", this.resizeContainerWidth.bind(self));
        this.commonContainer.rpcRegister("scroll_into_view", this.scrollIntoView.bind(self));
        this.commonContainer.rpcRegister("get_canvas_dimensions", this.getCanvasDimensions.bind(self));
        this.commonContainer.rpcRegister("fire_market_events", this.fireMarketEvents.bind(self));
        this.commonContainer.rpcRegister("build_artifact_markup", this.buildArtifactMarkup.bind(self));
        this.commonContainer.rpcRegister("host_app_icon", this.uploadAppIcon.bind(self));

        // for connects
        this.commonContainer.rpcRegister("gather_oauth_credentials", self.gatherOAuthCredentials.bind(self));
        this.commonContainer.rpcRegister("halt_app", self.gatherCredentials.bind(self));

        // for custom user prefs
        this.commonContainer.rpcRegister("editing_finished", self.editingFinished.bind(self));
        this.commonContainer.rpcRegister("editing_canceled", self.editingCanceled.bind(self));

        // Override the ee_gadget_rendered to avoid undefined error in non core container rendering.
        this.commonContainer.rpcRegister('ee_gadget_rendered', this.eeGadgetRendered.bind(self));

        // register default rpc handler as no-op
        gadgets.rpc.registerDefault(function(rpcArgs) {});
    };

    this.initActionLinkContext = function(context) {
        this.actionLinkContext = {
            jive: {
                content: {
                    type: context.coreAPIType,
                    id: context.id
                }
            }
        };
    };

    /**
     * This function will load the canvas view javascript. In defines an anonymous AMD module that will cause the
     * Javascript to be loaded via ajax at call time. See https://brewspace.jiveland.com/docs/DOC-78139 for more
     * information on how this works.
     * @param viewMetaData
     */
    this.renderCanvasView = function(viewMetaData) {
        var self = this;
        define(['jive.JAF.CoreContainer.CanvasView'], function(CanvasView) {
            protect.loadCanvasView(self, CanvasView);

            // lets grab the deep link if any
            var viewParams = null;
            if(viewMetaData.viewParamsToken !== null) {
                var token = viewMetaData.viewParamsToken;
                if(token.view !== null) {
                    viewMetaData.appInstanceView.view = token.view;
                }
                if(token.params !== null) {
                    viewParams = token.params;
                }
            }

            // optionally prepare market embedded context
            if ( viewMetaData.isMarketApp ) {
                // build market context
                viewMetaData.marketContext = self.buildMarketContext(
                    viewMetaData.appInstanceView,
                    self.canvasView,
                    viewMetaData.marketInitialToken);

                    viewMetaData.marketContext = self.canvasView.getEmbeddedContext(viewMetaData.marketContext.embeddedID);
                    viewMetaData.marketContext.target.view = "default";
            }

            var authToken = shindig.auth.getSecurityToken();
            // if the security token already exists, then directly initiate canvas rendering
            // otherwise make it dependent on security refresh
            var sendToView = function(token) {
                // check if token is empty
                if(!!token) {
                    self.model.cacheApp(viewMetaData.appInstanceView, viewMetaData.isMarketApp);
                    self.canvasView.render(viewMetaData.appInstanceView, viewParams, viewMetaData.marketContext,
                        function(appSite) {
                            // pendingActions[actionInfo.actionId] = appSite.getActiveGadgetHolder().getIframeId();
                        }
                    );
                }
                else {
                    // at this point the page just need to be reload because there is nothing canvas app could do
                    window.location.reload();
                }
            };

            if (authToken) {
                sendToView(authToken);
            } else {
                self.model.addListener( 'container.token.refreshed', sendToView );
            }
        });
    };

    protect.loadCanvasView = function(main, CanvasView) {
        if(typeof(main.canvasView) == 'undefined') {
            main.canvasView = new CanvasView(main.commonContainer, {});
            jQuery.extend(ActionOriginEnum, main.canvasView.getActionOriginEnum());

            main.applyAppReloadHandlers( main.canvasView );
            main.applyAppAlertHandlers( main.canvasView );
            main.applyOAuthHandlers( main.canvasView );
            main.applyRefreshHandlers( main.canvasView );
            main.applyCredentialsHandlers( main.canvasView );

            main.canvasView.addListener('app.services.show', function(app) {
                // noop if servies view already exists
                if(main.servicesView && main.servicesView.isActive()) return;

                main.servicesView = new AppServicesView(app, main.commonContainer, main.options);
                main.model.getAppsMarketApp().addCallback(function(marketApp) {
                    main.servicesView.setMarketApp(marketApp);
                    main.canvasView.invokeSettings( main.servicesView, app );

                    main.servicesView.addListener('app.services.close', function() {
                        main.canvasView.destroySettings();
                        if ( app.developerModel ) {
                            main.canvasView.setSparkline(app.developerModel.getMonitorState());
                        }
                    }) ;
                });

                main.servicesView.addListener( 'app.reload', function() {
                    main.reloadApp();
                });
            });

            main.canvasView.addListener('app.canvas.modal.close', function() {
                delete main.servicesView;
                if ( main.credentialsView ) {
                    main.credentialsView.cleanup();
                    delete main.credentialsView;
                }
                main.servicesView = null;
                main.credentialsView = null;
                main.oauthView = null;
            });
        }
    };

    // create config to setup the Shindig common container instance.
    protect.createConfig = function(options) {
        options = options || {};

        // set default config
        var config = {};
        config[osapi.container.ServiceConfig.API_PATH] = jive.app.url({path:'/gadgets/api/rpc'});

        if(typeof(window.__JAF_DEBUG) !== 'undefined' && window.__JAF_DEBUG === 1) {
            config[osapi.container.ContainerConfig.RENDER_DEBUG] = true;
        } else {
            config[osapi.container.ContainerConfig.RENDER_DEBUG] = false;
        }

        // check for common container config in the options passed
        for (var key in osapi.container.ContainerConfig) {
            if(osapi.container.ContainerConfig.hasOwnProperty(key)) {
                if(options.hasOwnProperty(key)) {
                    config[key] = options[key];
                }
            }
        }

        return config;
    };

    // Hijacked function to handle RPC calls from the gadgets side
    // TODO: Update shindig and register only bindAction
    // eg: gadgets.rpc.register("actions.bindAction", function(actionObject) { self.bindAction(actionObject); });
    protect.router = function(rpcArgs, channel) {
        switch (channel) {
            case 'bindAction':
                this.bindAction(rpcArgs, rpcArgs['a'][1]);
                break;
            case 'runAction':
            case 'removeAction':
            case 'getActionsByPath':
            case 'getActionsByDataType':
            case 'addShowActionListener':
            case 'addHideActionListener':
                break;
        }
    };


    protect.bindAction = function(rpcArgs, actionObj) {
        if(pendingActions[actionObj.id]) {
            // run action
            // gadgets.rpc.call(pendingActions[actionObj.id], 'actions.runAction', null, actionObj.id, this.commonContainer.selection.getSelection());
            var actionData = {};
            actionData.actionId = actionObj.id;
            actionData.selectionObj = this.commonContainer.selection.getSelection();
            gadgets.rpc.call(pendingActions[actionObj.id], 'actions', null, 'runAction', actionData);
            delete pendingActions[actionObj.id];
        }
    };

    /**
     * The main function tp handle all actions for Apps in modal view, when in doubt set break point here.
     *
     * @param actionInfo
     * @param origin
     */
    protect.handleRunAction = function(actionInfo, origin) {

        // neutralize action running if anonymous or external collaborator
        if (window._jive_current_user.anonymous || window._jive_current_user.partner) {
            return;
        }

        var main = this;
        delete this.postInstallActionRun;
        this.model.getApp(actionInfo.appUUID, actionInfo.appInstanceUUID).addCallback(function(app) {
            main.preCacheAppResources(app);
            app.appURL = typeof(actionInfo.appURL) !== "undefined" ? actionInfo.appURL : app.appURL;
            app.view = actionInfo.view;
            app.actionHeight = (app.heightByView && app.heightByView[actionInfo.view]) || app.height;
            app.actionWidth  = (app.widthByView && app.widthByView[actionInfo.view]) || app.width;
            app.actionLabel = actionInfo.label;
            main.runAction(app, actionInfo, origin);
        }).addErrback(function(market) {
            // only invoke market app if app is not a development app!
            if (market && actionInfo && actionInfo.appUUID) {

                if ( console ) {
                    console.log( "App URL passed to market:", actionInfo.url );
                }

                main.handleMarketContext({
                    experience: "marketapp",
                    appUUID: actionInfo.appUUID,
                    embeddedID: actionInfo.embeddedID,
                    isDevelopmentApp: actionInfo.isDevelopment || false,
                    alternateUrl: actionInfo.url
                });
                main.postInstallActionRun = { actionInfo: actionInfo, origin: origin };
            }
        });
    };

    /**
     * Execute an Action once we have JAF App metadata.
     *
     * @param app
     * @param actionInfo
     * @param origin
     */
    protect.runAction = function(app, actionInfo, origin) {
        var selection = this.setSelection(actionInfo, origin);

        // render modal app
        this.modalView.render(app, actionInfo, selection, function(appSite)
            {
                pendingActions[actionInfo.actionId] =
                    appSite.getActiveGadgetHolder().getIframeId();
            });
    };

    protect.setSelection = function(actionInfo, origin) {
        var selection;
        switch(origin) {
            case ActionOriginEnum.CONTENT:
                break;
            case ActionOriginEnum.LINK:
                selection = this.actionLinkContext;
                break;
            case ActionOriginEnum.RTE:
                selection = this.determineContainerContext();
                selection.jive.rte = this.determineRTEContext();
                if (actionInfo.currentArtifact) {
                    $j.extend(selection, actionInfo.currentArtifact);
                }
                selection.actionId = actionInfo.actionId;
                break;
        }

        this.commonContainer.selection.setSelection(selection);
        return selection;
    };

    protect.determineContainerContext = function() {
        var contContext = $j.extend(true, {}, this.editContext || this.actionLinkContext);
        if(jive.discussions && jive.discussions.instance) {
            // if it is a discussion thread, then the edit context
            // is different from the content, that is core.Message not core.Discussion
            contContext.jive.content.type = "osapi.jive.core.Discussion";
            contContext.jive.content.id = jive.discussions.instance.getObjectId();
        }

        if(this.modalView.getCommentContext() != null) {
            // creating/editing a comment on a root piece of content, id/type should be different than root in RTE
            contContext.jive.content = $j.extend(this.modalView.getCommentContext().content, {
                parent: contContext.jive.content
            });
        }
        else if(this.modalView.getInboxEntryContext() != null) {
            contContext.jive.content = this.modalView.getInboxEntryContext().content;
        }
        else if(this.modalView.getActivityStreamContext() != null) {
            contContext.jive.content = this.modalView.getActivityStreamContext().content;
        }
        else if(jive.advancedComment && jive.advancedComment.instance) {
            var appContext = jive.advancedComment.instance.getAppContext();
            $j.extend(contContext.jive.content, {
                id: jive.advancedComment.instance.getObjectId(),
                parent: {
                    id: appContext.containerId,
                    type: appContext.coreAPIType
                },
                type: 'osapi.jive.core.Message'
            });
            $j.extend(contContext.jive.content, function(contentParent) {
                return contentParent ?
                {
                    inReplyTo: {
                        id: contentParent.id,
                        type: 'osapi.jive.core.Message'
                    }
                } : {};
            }(jive.advancedComment.instance.getParent()));
        }
        else {
            // creating/editing a root piece of content, id/type should be the same as root in RTE
            var context = this.editContext ? this.editContext.jive : undefined;
            context = context || this.actionLinkContext.jive;
            $j.extend(contContext.jive, context);
        }
        return contContext;
    };

    protect.determineRTEContext = function() {
        return this.rteContext;
    };

    protect.maximizeApp = function(rpcArgs) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
        site.jiveData.mvcView.maximizeApp(site);
    };

    protect.initPlacePicker = function(rpcArgs, options) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
        site.jiveData.mvcView.initPlacePicker(options, rpcArgs.callback);
    };

    protect.initUserPicker = function(rpcArgs, options) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
        site.jiveData.mvcView.initUserPicker(options, rpcArgs.callback);
    };

    protect.requestNavigateTo = function(rpcArgs, view, data, callback ) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];

        // set the desired view
        site.jiveData.app.view = view;
        site.jiveData.mvcView.requestNavigateTo(site.jiveData.app, site, view, data, callback);
    };

    protect.gatherCredentials = function(rpcArgs, options ) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
        var app = site.jiveData.app;
        site.jiveData.mvcView.emit(
            'app.credentials.show',
            { "app": app, "callback": rpcArgs.callback, "args": options }
        );
    };

    protect.gatherOAuthCredentials = function( rpcArgs, options ) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
        var app = site.jiveData.app;
        site.jiveData.mvcView.emit(
            'app.oauth.show',
            { "app": app, "callback": rpcArgs.callback, "options": options }
        );
    };

    protect.requestCoreApiUpload = function(rpcArgs, key, options, token) {
        options = options || {};
        new AppFileUploader(this, key, options, token, rpcArgs.callback);
    };

    protect.requestCoreApiUploadMediaItem = function(rpcArgs, key, options, token) {
        this.requestCoreApiUpload( rpcArgs, key, options, token );
    };

    protect.setPref = function(rpcArgs, editToken, key, value) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
        var app = site.jiveData.app;
        var prefModel = new PreferencesModel();
        prefModel.setPref(app.instanceAppID, key, value);
    };

    protect.setTitle = function(rpcArgs, title) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
        var app = site.jiveData.app;
        site.jiveData.mvcView.setTitle(title);
    };

    /**
     * RPC Handler for "editing_finished", invoked from feature "jive-custom-settings-1-0-0"'s
     * opensocial.editingDone api.
     *
     * The successful invocation notifies users with app message, closes services view/dialog
     * and reloads an app.
     *
     * @param rpcArgs
     * @param options
     */
    protect.editingFinished = function(rpcArgs, options) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
        var app = site.jiveData.app;

        if (options && options.message) {
            site.jiveData.mvcView.emit("app.service.message", {"message":options.message});
        }
        site.jiveData.mvcView.emit("app.services.close");
        this.reloadApp();

    };

    /**
     * RPC Handler for "editing_canceled", invoked from feature "jive-custom-settings-1-0-0"'s
     * opensocial.editingCanceled api.
     *
     * The successful invocation notifies users with app message, closes services view/dialog
     *
     * @param rpcArgs
     * @param options
     */
    protect.editingCanceled = function (rpcArgs, options) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
        var app = site.jiveData.app;
        if (options && options.message) {
            site.jiveData.mvcView.emit("app.service.message", {"message":options.message});
        }
        // Cancel should close the dialog and return to app view.
        site.jiveData.mvcView.emit("app.services.close");


    };

    protect.scheduleModalClose = function(view, options ) {
        jive.conc.nextTick(function () {
            var doClose = function () {
                view.closeModal(options);
            };
            if (jive.Navbar.Menu.Apps.whenAnimationStarts) {
                jive.Navbar.Menu.Apps.whenAnimationStarts().always(doClose);
            }
            else {
                doClose();
            }
            if (jive.Navbar.Menu.Apps.whenAnimationEnds) {
                jive.Navbar.Menu.Apps.whenAnimationEnds();
            }
        });
    };

    // NOTE: This RPC function should be used by apps in the modal mode
    protect.editorInsert = function(rpcArgs, options) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
        var view = site.jiveData.mvcView;
        if(typeof(options.html) !== 'undefined' && this.appActionDataPromise) {
            var artifactHelper = new jive.Apps.RteArtifacts();
            artifactHelper.makeArtifactURLsAbsolute(options, site.jiveData.app);
            this.appActionDataPromise.resolve(options, rpcArgs, this.options.editedContentBean);
        }

        protect.scheduleModalClose(view, options);
    };

    // NOTE: This RPC function should be used by apps in the modal mode
    protect.closeApp = function(rpcArgs, options) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
        var view = site.jiveData.mvcView;
        if(typeof(options.navigateTo) !== 'undefined') {
            if(/^http(s)?\:\/\//i.test(options.navigateTo)) {
                var baseContext = gadgets.io.getProxyUrl().split('?')[0].replace(/\/gadgets\/proxy/, '');
                if(!options.navigateTo.startsWith(baseContext)) {
                    console.error("Error: Unable to navigation to external URL: " + options.navigateTo);
                    delete options.navigateTo;
                }
            }
        }
        if(typeof(options.data || options.html) !== 'undefined' && this.appActionDataPromise) {
            var artifactHelper = new jive.Apps.RteArtifacts();
            artifactHelper.makeArtifactURLsAbsolute(options.data, site.jiveData.app);
            this.appActionDataPromise.resolve(options.data, rpcArgs, this.options.editedContentBean);
        }

        protect.scheduleModalClose(view, options);
    };

    protect.sendNotification = function(rpcArgs, options) {
        var site = rpcArgs ? rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY] : null;
        options = options || {};
        if(typeof(options.message) !== 'undefined') {
            if(typeof(options.severity) !== 'undefined') {
                options.severity = options.severity.toLowerCase();
                if(!(options.severity in {'error':1, 'info':1, 'success':1})) {
                    throw "Invalid severity: must be 'error', 'info' or 'success'";
                }
            }
        }

        if ( site ) {
            var view = site.jiveData.mvcView;
            view.sendNotification(options);
        } else {
            // this can happen when market fires a show_information event
            options = options || {};

            // show message
            var message = options.message;
            var severity = options.severity || "info";
            if(typeof(message) != 'undefined') {
                $j("<p/>").html(message).message({"style":severity});
            }
        }
    };

    /** Reloads the application in the modal or canvas views
     * typically called after user preferences or admin settings are saved.
     * Application should be reloaded using original view, view params and selection/context
     */
    this.reloadApp = function(useCachedApp) {
        var self = this;
        function reloadViews() {
            if ( self.modalView ) {
                self.modalView.reload(function(appSite, actionInfo) {
                    pendingActions[actionInfo.actionId] = appSite.getActiveGadgetHolder().getIframeId();
                });
            }

            if ( self.canvasView ) {
                self.canvasView.reload();
            }
        }

        if(useCachedApp) {
            reloadViews();
        } else {
            var app = this.modalView.getRenderedApp() || ( this.canvasView && this.canvasView.getRenderedApp() );
            if( app ) {
                app.outdated = true;
                this.model.getApp(app.appUUID).addCallback(function(app) {
                    self.preCacheAppResources(app);
                    reloadViews();
                });
            }
        }
    };

    // start loading concat resources for this app
    this.preCacheAppResources = function(app) {
        var appId = app.appUUID;
        var appUrl = encodeURIComponent(app.appURL);
        $j('body').append('<iframe src="' + jive.app.url({ path: '/gadgets/concatresources'}) + '?appId=' + appId + '&gadget=' + appUrl + '" width="1px" height="1px"></iframe>');
    };

    /**
     * An app action was selected in RTE the plug-in
     * @param jqListObject - obtain app info from this element
     * @param rteContext - add/replace properties from here to current rteContext
     * @param appActionDataPromise - the promise fulfilled once app creates the new artifact
     */
    this.handleRTEActionSelect = function(jqListObject, rteContext, appActionDataPromise) {
        this.appActionDataPromise = appActionDataPromise;
        this.rteContext = rteContext;
        this.modalView.handleCreateActionSelect(jqListObject, ActionOriginEnum.RTE);
    };

    /**
     * An app artifact is being edited in RTE
     * @param actionEntry - obtain app info from this element
     * @param rteContext - add/replace properties from here to current rteContext
     * @param currentArtifact - teh app artifact being edited
     * @param appActionDataPromise - the promise fulfilled once app creates the new artifact
     */
    this.handleRTEActionContextEdit = function(actionEntry, rteContext, currentArtifact, appActionDataPromise) {
        this.appActionDataPromise = appActionDataPromise;
        this.rteContext = rteContext;
        var opts = {
            actionId: actionEntry.id,
            appURL: actionEntry.appURL,
            appInstanceUUID: actionEntry.appInstanceUUID,
            appUUID: actionEntry.appUUID,
            label: actionEntry.label,
            selectionType: "",
            selectionID: "",
            view: actionEntry.view,
            currentArtifact: currentArtifact
        };
        this.modalView.handleEditActionSelect(opts, ActionOriginEnum.RTE);
    };

    /**
     * Will be called to render apps market if core container fails to get the app instance for user based on app UUID.
     *
     * @param dataOrView An optional string to pass to the market to indicate
     *     initial context.
     * @param dataOrView.experience the experience string to coerce the market
     *     to the expected presentation
     * @param dataOrView.appUUID the app UUID the market should present
     * @param dataOrView.appFilter the app UUID the market should present
     * @param dataOrView.embeddedID the embedded artifact id, used to pass a
     *     proper Jive context.
     * @param dataOrView.view the gadget view to open the market in
     */
    this.handleMarketContext = function (dataOrView) {
        var self = this;
        var $ifr = null;
        this.appActionDataPromise = $j.Deferred();
        this.appActionDataPromise.done(function(marketResponse, rpcArgs) {
            if (marketResponse) {
                $ifr = $j("#" + rpcArgs.f);
                self.fireMarketEventsImpl(marketResponse.events, $ifr, rpcArgs);
            }
        });
        var onShow = function() {
            marketEvents.emit("market_shown");
        };
        var onClose = function() {
            marketEvents.emit("market_hidden");
        };

        // Supporting old GWT apps market to apss context as view params.
        var viewParams = {};
        if (typeof dataOrView === "string") {
            viewParams.initialToken = dataOrView;
        } else if (dataOrView) {
            viewParams = dataOrView;
        } else {
            viewParams = {};
        }

        // Lets render apps market to let user install the app
        self.model.getAppsMarketApp().addCallback(function(app) {
            var marketActionInfo = self.buildMarketContext( app, self.modalView, dataOrView );
            self.modalView.render(app, marketActionInfo, null, onShow, onClose, viewParams);
        });
    };

    this.buildMarketContext = function (app, ctxView, dataOrView) {
        var context = this.buildJiveContextForMarket(dataOrView);
        if (typeof dataOrView === "string") {
            this.hackInitialTokenIntoMarketContext(dataOrView, context.market);
        }
        var marketActionInfo = ctxView.prepareMarketContext(context);
        if (dataOrView && dataOrView.view) {
            var embeddedContext = ctxView.getEmbeddedContext(marketActionInfo.embeddedID);
            if(embeddedContext) {
                embeddedContext.target.view = dataOrView.view;
            }
        }
        return marketActionInfo;
    };

    /**
     * The object returned here is an instance of
     * jive.JAF.CoreContainer.MarketEvents and mixes in jive.conc.observable.
     * The returned object supports the method:
     * addListener(eventName, function(){...})
     */
    this.getMarketEvents = function() {
        return marketEvents;
    };

    protect.buildJiveContextForMarket = function (options) {
        // we keep the "jive" portion of the context, but strip other parts that
        // may be sensitive if broadcast to other apps.
        var eeCtx = options &&
            options.embeddedID &&
                    this.modalView.getEmbeddedContext(options.embeddedID);
        var jCtx = (eeCtx && eeCtx.jive) ? $j.extend({}, eeCtx.jive) : {};
        jCtx.market = {
            experience: options.experience || "default"
        };
        if (options.appUUID) {
            jCtx.market.appUUID = options.appUUID;
        }
        if (options.appFilter) {
            jCtx.market.appFilter = options.appFilter;
        }
        if (options.appShortName) {
            jCtx.market.appShortName = options.appShortName;
        }
        if (options.isDevelopmentApp) {
            jCtx.market.isDevelopmentApp = options.isDevelopmentApp;
        }
        if (options.alternateUrl) {
            jCtx.market.alternateUrl= options.alternateUrl;
        }
        return jCtx;
    };

    protect.hackInitialTokenIntoMarketContext = function (initialToken, marketContext) {
        var args = initialToken.split(";");
        marketContext.experience = args[0] || "default";
        for (var i = 1; i < args.length; i++) {
            var param = args[i].split("=", 2);
            if (param[1])  {
                if (param[0] == "uuid") {
                    marketContext.appUUID = param[1];
                } else if (param[0] == "name") {
                    marketContext.appFilter = param[1];
                }
            }
        }
    };

    /**
     *  TODO:  Add in UI controls in portlet header to remove gadget from the app landing page.
     *  @param gadgetSite
     */
    this.removeAppFromPage = function(gadgetSite) {
        this.commonContainer.closeGadget(gadgetSite);
    };

    protect.eeGadgetRendered = function(rpcArgs) {
        var gadgetSite = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];

        if(gadgetSite) {
            var renderParams = gadgetSite.currentGadgetHolder_.renderParams_;
            var eeDataModel = renderParams.eeDataModel;
            return eeDataModel ? eeDataModel.context : null;
        } else {
            // TODO: return the context for the particular link, keyed off the embeddedID
            var latestContext = this.modalView.getEmbeddedContext('latest');
            if(latestContext) {
                return latestContext;
            } else {
                return {};
            }
        }
    };

    /**
     * Resize the app iframe. Intended to be called via the gadget with gadgets.window.adjustHeight();
     * The arguments come in as RPC arguments.
     * @param rpcArgs The RPC arguments
     * @param height
     */
    protect.resizeContainerHeight = function(rpcArgs, height) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
        if ( !site ) {
            return;
        }
        site.jiveData.mvcView.resizeContainerHeight(height, true, site);
    };

    /**
     * Resize the app iframe. Intended to be called via the gadget with gadgets.window.adjustWidth();
     * The arguments come in as RPC arguments.
     * @param rpcArgs The RPC arguments
     * @param width
     */
    protect.resizeContainerWidth = function(rpcArgs, width) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
        if ( !site ) {
            return;
        }
        site.jiveData.mvcView.resizeContainerWidth(width, true);

        if (rpcArgs.callback)
            rpcArgs.callback.call();

    };

    protect.scrollIntoView = function(rpcArgs) {
        var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
        var appFrameID = rpcArgs.f;
        var scrollOptions = rpcArgs.a[0] || {};
        site.jiveData.mvcView.scrollIntoView(appFrameID, scrollOptions);
    };

    protect.getCanvasDimensions = function(rpcArgs) {
        var view = $j(window);
        var w = view.width();
        var h = view.height();
        var frame = $j("#" + rpcArgs.f);
        var chrome = frame.parents(".js-app-chrome");
        if (chrome.length) {
            // reduce available canvas size by the width of the chrome.
            w -= (chrome.outerWidth() - frame.innerWidth());
            h -= (chrome.outerHeight() - frame.innerHeight());
        }
        rpcArgs.callback({width:w,height:h});
    };


    protect.ensureHasMarketFeature = function(iframeId) {
        if (!$j("#" + iframeId ).data("hasMarketFeature")) {
            throw "Unauthorized call to market restricted RPC function";
        }
    };

    /**
     * Indicates that apps have changed. This method should only be called by the apps market.
     * @param rpcArgs The RPC arguments
     * @param rpcArgs.f The DOM id of the iframe in which this app lives
     * @param marketEvents The market events passed to container
     */
    protect.fireMarketEvents = function(rpcArgs, marketEvents) {
        this.ensureHasMarketFeature(rpcArgs.f);
        if (marketEvents && marketEvents.events) {
            this.fireMarketEventsImpl(marketEvents.events, $j("#" + rpcArgs.f), rpcArgs);
        }
    };

    protect.fireMarketEventsImpl = function(events, ifr, rpcArgs) {
        if (events && events.length) {
            for (var i = 0, l = events.length; i < l; ++i) {
                var event = events[i];
                if (event && event.eventName) {
                    marketEvents.emit(event.eventName, event.eventData, ifr, rpcArgs);
                }
            }
        }
    };

    protect.buildArtifactMarkup = function(rpcArgs, options) {
        artifactHelper.buildArtifactMarkup(rpcArgs, options);
    };

    protect.uploadAppIcon = function(rpcArgs, options) {
        var site = rpcArgs ? rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY] : null;

        var callback = rpcArgs.callback;
        var app = site.jiveData.app;

        var iconUrl = options.iconUrl;
        var promise = artifactHelper.uploadArtifactIcon( iconUrl, app.appInstanceUUID );
        promise.addCallback( function( localJiveIconUrl ) {
            callback( localJiveIconUrl );
        }).addErrback( function( response ) {
            if ( console ) {
                console.log('error uploading ' + iconUrl, response );
            }
            callback(); // call back with empty local url in case of error
        });
    };

});
return jive.JAF.CoreContainer.Main;
});
