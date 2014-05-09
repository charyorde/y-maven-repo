/*
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Handle the DOM interaction and gadget rendering via common container.
 *
 * @class
 * @extends jive.AbstractView
 * @param {Object} commonContainer
 * @param {Object} options

 * @depends path=/resources/scripts/jive/app/configure/main.js
 * @depends path=/resources/scripts/jive/app/placepicker/main.js
 * @depends path=/resources/scripts/jive/app/alert/main.js
 */
define('jive.JAF.CoreContainer.AppsContainerView',
['jive.JAF.Configuration.ConfigureMainV2',
 'jive.Apps.PlacePicker.Main',
 'jive.JAF.Alerts.AlertMainV2'],
function(ConfigureMainV2, PlacePicker, AlertMainV2) {
return jive.AbstractView.extend(function(protect) {

    // emit events
    jive.conc.observable(this);

    var embeddedContexts = {};

    this.getEmbeddedContext = function(embeddedID) {
        return embeddedContexts[embeddedID];
    };

    this.setEmbeddedContext = function(embeddedID, context) {
        embeddedContexts[embeddedID] = context;
    };

    this.deleteEmbeddedContext = function(embeddedID) {
        delete embeddedContexts[embeddedID];
    };

    this.prepareMarketContext = function(jiveContext) {
        embeddedContexts["market-app"] = {
            target: {
                type: "embed"
            },
            jive: jiveContext
        };
        return {
            embeddedID: "market-app"
        };
    };

    this.init = function (commonContainer, options) {
        this.commonContainer = commonContainer;
        this.options = options;

        // define min/max bounds to prevent ridiculously huge or small dialogs
        this.bounds = {
            maxWidth:  1200,
            maxHeight: 1200,
            minWidth:  350,
            minHeight: 150
        };

        this.addListener( 'app.apply.alert', this.handleAppAlert );
    };

    // Override-able function
    this.render = function() {
        // default no-op
    };

    /**
     * Override-able function
     */
    this.handleAppsMarketInstall = function() {
        // default no-op
    };

    /**
     * Render app based on app URL using the Shindig common container.
     *
     * @param site
     * @param app
     * @param opt_callback
     * @param opt_viewParams
     */
    this.renderApp_ = function(site, app, opt_callback, opt_viewParams) {
        var self = this;

        if ( !site )  {
            // can't do anything without a site
            return;
        }

        var alertWrapper = new AlertMainV2( app, $j(site.currentGadgetEl_) );
        if ( alertWrapper.hasBlockingAlerts() ) {
            self.emit('app.apply.alert', alertWrapper );
        } else {

            // Prepare render params
            var renderParams = this.createRenderParams_(app);

            var appURL = app.appURL;
            var callback = opt_callback || function() {};
            var viewParams = opt_viewParams || {};

            // render the app
            this.commonContainer.navigateGadget(site, appURL, viewParams, renderParams, callback);
        }
    };

    /**
     * Render app as EE mode
     *
     * @param element
     * @param app
     * @param eeContext
     * @param opt_callback
     * @param opt_viewParams
     */
    this.renderAppEE_ = function(element, app, eeContext, opt_callback, opt_viewParams) {
        var alertWrapper = new AlertMainV2( app, element );
        if ( alertWrapper.hasBlockingAlerts() ) {
            this.emit('app.apply.alert', alertWrapper );
            return false;
        } else {
            var appUrl = app.appURL || '';
            this.getAppFeatures(appUrl, function(features) {
                this.renderAppEE_impl(element, app, eeContext, features, opt_callback, opt_viewParams);
            });
            return true;
        }
    };

    // impl of rendering embedded experience app in modal mode.
    this.renderAppEE_impl = function(element, app, eeContext, features, opt_callback, opt_viewParams) {
        // Prepare EE model
        eeContext = eeContext || {};

        // check if opensocial-2.5 feature is required or there exist specificationVersion param about version spec
        // should be respected is added to embedded-experiences feature.
        // This will be used to support backward compatibility for app context passing and EE data model.
        var isOSFeatureRequired = this.isOpenSocialFeatureRequired('2.5', (features || {}), 'embedded-experiences');

        // Build EE data model
        var eeDataModel = protect.constructEEDataModel(app, eeContext);

        // Update context if necessary
        if(isOSFeatureRequired) {
            eeContext= protect.constructOpenSocialEEContext(eeContext);

            // update the EE model context attribute
            if(!!eeContext.appContext) {
                eeDataModel.context = eeContext.appContext;
            }
        }

        // Prepare render params
        var renderParams = this.createRenderParams_(app);

        var callback = opt_callback || function() {};

        // Prepare view params
        var viewParams = opt_viewParams || {};

        // render the app in EE
        var eeRenderParams = {};
        eeRenderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS] = renderParams;
        eeRenderParams[osapi.container.ee.RenderParam.GADGET_VIEW_PARAMS] = viewParams;
        this.commonContainer.ee.navigate(element, eeDataModel, eeRenderParams, callback, eeContext.containerContext);
    };

    /**
     * Construct OpenSocial compliance format of context passed to embedded experience apps
     * @param jiveEEContext
     * @return {Object} The context object following OpenSocial 2.5 EE spec.
     */
    protect.constructOpenSocialEEContext = function(jiveEEContext) {
        var eeContext = {};

        // Build associated context from context.jive.content
        if(jiveEEContext.jive && jiveEEContext.jive.content) {
            eeContext.containerContext = {};
            eeContext.containerContext[osapi.container.ee.Context.ASSOCIATED_CONTEXT] = {};
            eeContext.containerContext[osapi.container.ee.Context.ASSOCIATED_CONTEXT] = jiveEEContext.jive.content;

            // Copy the Jive context
            //eeContext.containerContext.jive = jafEEContext.jive;

        }

        // Copy app specific context (see DOCS-74530 in the "Artifact Target" section)
        if(jiveEEContext && jiveEEContext.target && jiveEEContext.target.context) {
            eeContext.appContext = jiveEEContext.target.context;
        }

        return eeContext;
    };

    /**
     * Construct the OpenSocial EE data model suggested by the spec.
     * @param app
     * @param jiveEEContext {Object} the JAF formatted EE Context
     * @return {Object} The right EE data model object
     */
    protect.constructEEDataModel = function (app, jiveEEContext) {
        var appUrl = app.appURL;
        var view = app.view;
        var eeDataModel = {};
        eeDataModel.gadget = appUrl;
        eeDataModel.context = jiveEEContext;

        // Build preferredExperience section
        if(jiveEEContext && (jiveEEContext.target || jiveEEContext.display)) {
            var eeContextDisplay = jiveEEContext.display || {};
            var eeContextTarget = jiveEEContext.target || {};

            // Follow OpenSocial spec for target type of embed as gadget
            if(eeContextTarget.type && eeContextTarget.type === 'embed') {
                eeContextTarget.type = osapi.container.ee.TargetType.GADGET;
            }

            eeDataModel[osapi.container.ee.DataModel.PREFERRED_EXPERIENCE] =
                {display : eeContextDisplay, target : eeContextTarget};

            // Check if we need to inject view
            if(jiveEEContext.target && !jiveEEContext.target.hasOwnProperty('view')) {
                jiveEEContext.target.view = app.view;
            }
        }

        return eeDataModel;
    };

    /**
     * Returns the rendered dimensions of the given app and view. Returns JSON structure describing
     * width, height, and isMaximum (denoted by special width/height 9999/9999).
     * @param app
     * @param view optional view parameter
     */
    this.computeAppDimensions = function( app, view ) {
        // height by view
        var safeView;
        if ( view ) {
            safeView = view.replace('.', '_');
        }

        var height = ( safeView && app.heightByView && app.heightByView[safeView] ) || app.height || app.actionHeight;
        var width = ( safeView && app.widthByView && app.widthByView[safeView] ) || app.width || app.actionWidth;
        var isMaximum = false;

        if ( height === 9999 && width === 9999 ) {
            isMaximum = true;
        }

        return {
            height: height,
            width: width,
            isMaximum: isMaximum
        }
    };

    protect.createRenderParams_ = function(app) {
      // Prepare render params
      var RenderParam =  osapi.container.RenderParam;
      var renderParams = {};
      var view = app.view;

      renderParams[RenderParam.VIEW]  = view;
      var dimensions = this.computeAppDimensions(app, view);

      renderParams[RenderParam.HEIGHT] = dimensions.height;
      renderParams[RenderParam.WIDTH] = dimensions.width;
      renderParams[RenderParam.USER_PREFS] = app.userPrefs;

      // if the debug flag sets to false then lets check if we need to disable cache bc Shindig common container sets
      // nocache to true for debug mode in the osapi.container.Container.navigateGadget function.
      if(typeof(window.__JAF_DEBUG) !== 'undefined' && window.__JAF_DEBUG === 0) {
        renderParams[RenderParam.NO_CACHE]  = app.hasOwnProperty(RenderParam.NO_CACHE) ? app.nocache : false;
      }

      return renderParams;
    };

    /**
     * Calculate the real title to be used.
     *
     * @param app
     * @param altTitle
     * @return {String} real title to be used in modal mode.
     */
    this.getRealTitle = function(app, altTitle) {
        var realTitle = "";
        if((app.title || altTitle) && app.actionLabel) {
            realTitle =  (altTitle ? altTitle : app.title) + " : " + app.actionLabel;
        }
        else if (app.title || altTitle) {
            realTitle = altTitle ? altTitle : app.title;
        }
        else if (app.actionLabel) {
            realTitle = app.actionLabel;
        }
        return realTitle;
    };

    /**
     * Function to preload the app if needed and return to callback the list of features.
     * The callback will be called and passed to first argument a list of features :
     *   {"embedded-experiences":{"name":"embedded-experiences","params":{},"required":true}, ...}
     * or:
     *   {"error":"ERROR MESSAGE"}
     * @param appUrl
     * @param callback
     */
    this.getAppFeatures = function(appUrl, callback) {
        var self = this;
        this.commonContainer.preloadGadget(appUrl, function(result) {
            if (!result[appUrl] || result[appUrl].error) {
                //There was an error preloading the gadget URL
                callback.call(self, {"error" : result[appUrl].error});
            }
            else {
                // get 'features' result property
                var features = {};
                var modulePrefs =  result[appUrl]['modulePrefs'];
                if(modulePrefs && modulePrefs.features) {
                    features = modulePrefs.features;
                }
                callback.call(self, features);
            }
        });
    };

    /**
     * Check if specific OpenSocial feature is required with the app.
     *
     * @param version
     * @param features
     * @param paramFromFeature
     * @return true if required or false otherwise
     */
    this.isOpenSocialFeatureRequired = function(version, features, paramFromFeature) {
        var openSocialFeature = 'opensocial-' + version;
        var feature = features[openSocialFeature] || null;
        if(feature && feature.required) {
            return true;
        }

        // if false or undefined lets check "specificationVersion" param for a feature
        if (paramFromFeature) {
            var featureForParam = features[paramFromFeature] || null;
            if (featureForParam && featureForParam.params.specificationVersion) {
                var specVersion = featureForParam.params.specificationVersion;
                specVersion = $j.trim(specVersion.toString());

                // Just compare the major and minor spec parts
                if (specVersion.length > version.length) {
                    specVersion = specVersion.substring(0, version.length);
                }
                if(specVersion === version) {
                    return true;
                }
            }
        }

        return false;
    };

    // ********** Default implementation of RPC handlers (views may override) ************** //

    /**
     * Display a notification to the user
     * @param options  object
     * @param options.message  the string to display to the user
     * @param options.severity   defaults to 'info', and can also be 'success' or 'error'
     */
    this.sendNotification = function(options) {
        options = options || {};

        // show message
        var message = options.message;
        var severity = options.severity || "info";
        if(typeof(message) != 'undefined') {
            $j("<p/>").html(message).message({"style":severity});
        }
    };

    this.setTitle = function() {
    };

    this.maximizeApp = function() {
    };

    this.reload = function() {
    };

    this.closeApp = function() {
    };

    this.resizeContainerHeight = function() {
    };

    this.resizeContainerWidth = function() {
    };

    this.requestNavigateTo = function() {
    };

    this.scrollIntoView = function() {

    };

    this.handleAppAlert = function(appAlertWrapper) {
    };

    /**
     * Invoke the place picker widget.
     * @param options
     * @param callback
     */
    this.initPlacePicker = function(options, callback) {
        var placePicker = new PlacePicker(options);
        placePicker.showPicker(callback);
    };

    /**
     * Invoke the people picker widget.
     * @param options
     * @param gadgetCallback
     */
    this.initUserPicker = function(options, gadgetCallback) {
        var defaults = {
            multiple: false // whether to allow user to select multiple users
        };
        options = $j.extend(defaults, options);

        var selectPeopleView = new jive.UserPicker.SelectPeopleView();

        var selectPeopleCallback = function(data) {
            selectPeopleView.close(); // close the modal when finished
            gadgetCallback(data);
        };

        selectPeopleView
            .setOptions(options)
            .addListener('select', selectPeopleCallback)
            .open();
    };

    this.invokeCredentials = function() {
    };

    this.destroyCredentials = function() {
    };

    this.invokeSettings = function() {
    };

    this.destroySettings = function() {
    };

    this.closeModal = function(options) {
    };

    /**
     * Helper function used to set title in the header for modal views.
     * @param title
     */
    this.setModalTitle = function(title) {
        protect.setWhichModalTitle();
        whichTitle.text(title);
    };

    // TODO: Just need to get element for .js-app-title-main ?
    protect.setWhichModalTitle = function() {
        var selector = ".js-app-title-main";
        var titles = $j(".js-app-title > *");
        whichTitle = selector ? titles.filter(selector) : null;
    };

    /**
     * If the provided app is a development app, add a sparkline to the chrome.
     * @param app {Object} The app for which a sparkline may be added.
     */
    protect.enableSparkline = function(app) {
        if(app.developmentApp) {
            this.sparklineEnabled = true;
            var sparklineTimeoutHandle = null;
            $j('.j-app-sparkline').show();
            $j('.j-app-sparkline').hover(function() {
                me = $j(this);
                img = $j("img", me);
                if (sparklineTimeoutHandle) window.clearInterval(sparklineTimeoutHandle);
                sparklineTimeoutHandle = window.setInterval(function() {
                    me.css("background-image", "url(" + img.attr("src").replace(/ts=\d+/, "ts=" + new Date().getTime()) + ")");
                }, 250);
            }, function() {
                if (sparklineTimeoutHandle) window.clearInterval(sparklineTimeoutHandle);
                sparklineTimeoutHandle = null;
                me.css("background-image", "");
            });
        } else {
            this.sparklineEnabled = false;
        }
    };

    /**
     * Cause the app to refresh and display an appropriate message to the user.
     */
    this.refresh = function() {
        this.emit("app.reload");
        this.displayRefreshMsg(true);
    };

    /**
     * Display the refresh message.
     * @param isSuccess
     * @param callback
     */
    this.displayRefreshMsg = function(isSuccess, callback) {
        var style = isSuccess ? 'info' : 'error';
        var msgKey = isSuccess ? 'appframework.app.development.refresh' : 'error.general';
        var msg = jive.apps.container.renderMessage({messageKey: msgKey});

        this.sendNotification( {"message": msg, "severity": style });
    };

    this.handleConfigurationDialog = function(appAlertWrapper, options) {
        var self = this;
        var app = appAlertWrapper.getApp();
        var $html = $j(jive.apps.container.blockingAlertView());

        if ( app.configurationError ) {
            // hide submit button if cannot submit (due to configuration error)
            $html.find("#j-app-blocking-alert-submit").hide();
            $html.find("#j-app-blocking-alert-cancel").addClass('j-btn-callout');
        }

        var configurationController = new ConfigureMainV2({
            app: app,
            domTarget: $html.find("#app-blocking-alert-detail")
        });

        configurationController.addListener( 'app.service.wire.cancel', function(data ) {
            $j("#j-app-blocking-alert-cancel").click( function() {
                var msg = jive.apps.container.renderMessage({messageKey: 'appframework.app.configure.cancel' });
                self.sendNotification( { "severity":"warn", "message": msg} );
                $j(".j-modal-close-top").click();
            });
        });

        configurationController.addListener( 'app.service.wire.submit', function(data ) {
            $j("#j-app-blocking-alert-submit").click( data.callback );
        });

        configurationController.addListener( 'app.configure.success', function() {
            var msg = jive.apps.container.renderMessage({messageKey: 'appframework.app.configure.success' });
            self.sendNotification( { "severity":"info", "message": msg} );
            if ( options && options.configureCallback ) {
                options.configureCallback(true);
            }
            self.emit('app.reload', false);
        });

        configurationController.addListener( 'app.configure.failed', function() {
            var msg = jive.apps.container.renderMessage({messageKey: 'appframework.app.configure.failure' });
            self.sendNotification( { "severity":"error", "message": msg} );
            if ( options && options.configureCallback ) {
                options.configureCallback(false);
            }
        });

        // 1. hide running app iframe, since its no longer the active modal component
        $j('#j-app-modal-parent iframe').css({ "display": "none" } );

        // 2. generate UI
        $j('#j-app-modal-parent').append($html);

    };

    this.resizeModal = function( height, width, animate ) {
    };

    this.restoreChromeNav = function() {
    };

    this.hideChromeNav = function() {
    };

    this.getRenderedApp = function() {
    };

    this.getMaximumHeight = function() {
    };

    this.getMaximumWidth = function() {
    };

    /**
     * Bound height to fall within min/max
     */
    this.boundedHeight = function(height) {
        height = (height + '').match(/\d+/)[0] / 1; // get the number part
        var val = Math.min(Math.max(height, this.bounds.minHeight), this.bounds.maxHeight);
        return val;
    };

    /**
     * Bound width to fall within min/max
     */
    this.boundedWidth = function(width) {
        width = (width + '').match(/\d+/)[0] / 1; // get only the number part
        var val = Math.min(Math.max(width,  this.bounds.minWidth),  this.bounds.maxWidth);
        return val;
    };

    protect.delayedRunner = function( toRun, interval, predicate ) {
        var startTs = new Date().getTime();
        var ref = window.setInterval( function() {
            var now = new Date().getTime();
            // will fire no matter what after 1.5 seconds
            if ( now - startTs > 1500 ||  predicate() ) {
                toRun();
                window.clearInterval(ref);
            }
        }, interval );
    };

    protect.recenter = function( modal, animate ) {
        animate = !($j.browser.msie && $j.browser.version < 9) && animate;

        var height = modal.height();
        var width = modal.width();

        // reposition
        modal.css({
            position: 'fixed',
            top: '50%',
            marginTop: modal.outerHeight()/-2,
            left: '50%',
            marginLeft: modal.outerWidth()/-2
        });

        if ( animate ) {
            modal.animate({
                    marginLeft: width / -2,
                    marginTop: height / -2},
                {duration: 300, queue: false}
            );
        } else {
            modal.css({
                    marginLeft: width / -2,
                    marginTop: height / -2},
                {duration: 300, queue: false}
            );
        }
    };

});
});
