/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Handle the DOM interaction and gadget rendering via common container.
 *
 * @class
 * @extends jive.JAF.CoreContainer.AppsContainerView
 * @param {Object} commonContainer
 * @param {Object} options
 *
 * @depends path=/resources/scripts/jive/app/core_container/views/appscontainer_view.js
 * @depends path=/resources/scripts/jive/app/core_container/views/modal_comment_provider.js
 * @depends path=/resources/scripts/jive/app/core_container/site_data.js
 * @depends path=/resources/scripts/jive/app/alert/main.js
 */
define('jive.JAF.CoreContainer.ModalView',
['jquery',
 'jive.JAF.CoreContainer.AppsContainerView',
 'jive.JAF.Alerts.AlertMainV2',
 'jive.JAF.CoreContainer.CommentProvider'
],
function($j, AppsContainerView, AlertMainV2, CommentProvider) {
return AppsContainerView.extend(function(protect, _super) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    var ActionOriginEnum = { LINK: 'app.link.run', RTE: 'app.rte.run', CONTENT: 'app.content.run' };
    var $modal;
    var appSite; // GadgetSite where app is rendered.
    var mostRecentContentSize = { width: 0, height: 0 };

    this.init = function (commonContainer, options) {
        _super.init.call(this, commonContainer, options);
        this.commentContext = null;
        this.activityStreamContext = null;
        this.modalCommentProvider = new CommentProvider();
        var self = this;

        this.modalCommentProvider.addListener('modifyRenderedContent', function($renderedContent, opts) {
            self.modifyRenderedContent($renderedContent, opts );
        });

        this.resizeToLatest = function() {

            if (mostRecentContentSize.width)
                self.resizeContainerWidth(mostRecentContentSize.width, false);

            if (mostRecentContentSize.height)
                self.resizeContainerHeight(mostRecentContentSize.height, false);

        };
        $j(window).bind('resize', this.resizeToLatest);
        $j(window).bind('scroll', function() {
            self.recenterModal(false);
        });

        // prevents errors if events are seen before the frame says it is finished loading
        // this sometimes happens in IE7 & IE8
        var frameCSS = null;
        self.appFrame = {
            css: function(name,value) {
                var css = name;
                if (arguments.length = 2) {
                    css = {};
                    css[name] = value;
                }
                frameCSS = $j.extend(frameCSS || {}, css);
            },
            animate: function(css) {
                frameCSS = $j.extend(frameCSS || {}, css);
            },
            applyCSS: function(iframe) {
                iframe.css(frameCSS);
                frameCSS = null;
            }
        }
    };

    protect.handleAppAlert = function( appAlertWrapper ) {
        // in the case of modal view, app alerts are shown right away,
        // except for configuration.
        // for configuration, show this right away.
        // all other alerts remain blocking the modal.

        var appAlert = appAlertWrapper.getActiveAlert();
        var self = this;

        // in call cases, hide the top nav
        self.hideChromeNav();
        $j(".j-modal-back-top").hide();

        protect.revokeStaticModalDimensions();

        // only configuration dialog supported for now
        if ( appAlert.code == 1000 || appAlert.code == 1010 ) {
            this.handleConfigurationDialog( appAlertWrapper, {
                configureCallback: function( success ) {
                    self.restoreChromeNav();
                    self.restoreStaticDimensions();
                }
            } );
            self.recenterModal( false );
            return;
        }

        // if not configuration, apply the blocking alert
        appAlertWrapper.applyBlock();

        self.recenterModal( false );

        protect.setStaticDimensions( 650, 280, false );

        // launch on demand - clicking on the alert action buttons
        appAlertWrapper.addListener("app.block", function(data) {
            appAlertWrapper.routeActionClicks( data,
                function() {
                    self.handleConfigurationDialog( appAlertWrapper );
                },
                function() {
                    self.closeModal();
                },
                function() {
                    self.closeModal();
                    var msg = jive.apps.container.renderMessage({messageKey: 'error.general' });
                    self.sendNotification( { "severity":"error", "message": msg} );
                },
                self
            );
        });
    };

    /*
     * Register handlers for action contributed links
     */
    this.documentReady = function() {
        var self = this;
        // action link click events to call runAction() on
        $j('li[name="os-action-link"] a').click(function(event) {
            var li = $j(event.target).closest('li');
            self.handleCreateActionSelect(li, ActionOriginEnum.LINK);
            event.preventDefault();
        });

        this.modalCommentProvider.addListeners();
    };

    this.getCommentContext = function() {
        return this.modalCommentProvider.getCommentContext();
    };

    this.getActivityStreamContext = function() {
        return this.modalCommentProvider.getActivityStreamContext();
    };

    this.getInboxEntryContext = function() {
        return this.modalCommentProvider.getInboxEntryContext();
    };

    this.getActionOriginEnum = function() {
        return ActionOriginEnum;
    };

    /**
     * an element from dropdown was selected
     * @param jqListObject this is the LI element in the action list dropdown
     * @param origin
     */
    this.handleCreateActionSelect = function(jqListObject, origin) {
        var li = jqListObject;
        this.fireActionEvent(origin, {
            actionId: li.attr('actionid'),
            appURL: li.attr('appURL'),
            appInstanceUUID: li.attr('appInstanceUUID'),
            appUUID: li.attr('appUUID'),
            label: $j.trim(li.find('a span.label').text()),
            selectionType: li.attr('selectionType'),
            selectionID: li.attr('selectionID'),
            view: li.attr('view')
        });
    };

    /**
     * @param options.actionId {string} the action id from the gadget's action contribution
     * @param options.appURL {string} the url of the app's gadget.xml
     * @param options.appInstanceUUID {string} the UUID of the current user's installed app
     * @param options.appUUID {string} the UUID of the current app
     * @param options.label {string} the label from the gadget's action contribution
     * @param options.selectionType {string} ?
     * @param options.selectionID {string} ?
     * @param options.view {string} the view from the gadget's action contribution
     * @param options.currentArtifact {object} the active app artifact being edited
     * @param origin {string} one of the values defined in ActionOriginEnum
     */
    this.handleEditActionSelect = function (options, origin) {
        this.fireActionEvent(origin, options);
    };

    protect.fireActionEvent = function(origin, options) {
        this.emit(origin, options);
    };

    this.handleEmbeddedView = function(jqLinkObject, origin, embeddedID) {
        var a = jqLinkObject;
        this.emit(origin, {
            appUUID: a.attr('__appuuid'),
            isDevelopment: a.hasClass('j-apps-developerApp'),
            label: $j.trim(a.text()),
            context: JSON.parse(a.attr('__context') || "{}"),
            view: a.attr('__view'),
            url: a.attr('__url') || '',
            embeddedID: embeddedID
        });
    };

    this.filterTitle = function( realTitle, maxWidth ) {
        var maxTitleLength = ( maxWidth ? maxWidth : mostRecentContentSize.width) / 8 - 9;
        realTitle = realTitle.length > maxTitleLength ? ( realTitle.substring(0, maxTitleLength) + " ..." ) : realTitle;
        return realTitle;
    };

    this.resetTitle = function(app, maxWidth ) {
        if (!(this.fullTitle || app || appSite)) {
            return; // can't update the title, not enough info
        }
        var realTitle = this.fullTitle ? this.fullTitle : this.getRealTitle( app ? app : appSite.jiveData.app);
        realTitle = this.filterTitle( realTitle, maxWidth );
        this.setModalTitle( realTitle );
    };

    /**
     * Render app in a modal iframe window
     *
     * @param app
     * @param actionInfo
     * @param opt_callback
     * @param opt_closeCallback
     * @param opt_viewParams
     */
    this.render = function(app, actionInfo, selection, opt_callback, opt_closeCallback, opt_viewParams) {
        var self = this;

        // cache the parameter values so they can be reapplied if the app is refreshed.
        var callback = opt_callback || function() {};
        var viewParams = opt_viewParams || {};
        var embeddedID = (actionInfo && actionInfo.embeddedID) ? actionInfo.embeddedID : "";
        var context = self.getEmbeddedContext(embeddedID);

        var onModalLoad = function() {
            self.resetTitle(app);

            // focus on the settings gear so that input will not be sent to the underlying artifact (document, etc).
            $j('#jive-app-settings').focus();
            var siteHtmlElem = $modal.find('.jive-modal-content')[0];

            if (context && context.target.type && context.target.type === "embed") {
                var rendered = self.renderAppEE_(siteHtmlElem, app, context, function(site, response) {
                    appSite = site;
                    site.jiveData = new JiveSiteData(self, app, viewParams);
                    site.jiveData.setGadgetMetaData(response);
                    site.jiveData.setActionInfo(actionInfo);
                    site.jiveData.setEEContext(context);
                    self.renderModalCallback(response, site, app, callback);
                    self.registerModalEventHandlers();
                    if ( requiresRecenter ) {
                        self.recenterModal();
                    }
                }, viewParams);

                if ( !rendered ) {
                    // store context for future reload
                    appSite = self.commonContainer.newGadgetSite(siteHtmlElem);
                    appSite.jiveData = new JiveSiteData(self, app, viewParams);
                    appSite.jiveData.setSelection(selection);
                    appSite.jiveData.setActionInfo(actionInfo);
                    appSite.jiveData.setEEContext(context);
                }
            } else {
                appSite = self.commonContainer.newGadgetSite(siteHtmlElem);
                appSite.jiveData = new JiveSiteData(self, app, viewParams);
                appSite.jiveData.setSelection(selection);
                appSite.jiveData.setActionInfo(actionInfo);
                self.renderApp_(appSite, app, function(response) {
                    appSite.jiveData.setGadgetMetaData(response);
                    self.renderModalCallback(response, appSite, app, callback);
                    self.registerModalEventHandlers();
                    if ( requiresRecenter ) {
                        self.recenterModal();
                    }
                }, viewParams);
            }

            self.enableSparkline(app);
        };

        if(!$modal) {
            this.html = $j(jive.apps.container.chromeApp({ 'app': app }));
            var target = this.html.find('#j-app-modal-parent');

            // compute initial modal height & width so it doesn't have to grow to expected dimensions
            var view = app.view;
            if (context && context.target) {
                view =  context.target.view ? context.target.view : "embedded";
            }

            var dimensions = this.computeAppDimensions(app, view);
            var width = dimensions.width;
            var height = dimensions.height;

            var requiresRecenter = true;

            if ( width > 0 ) {
                requiresRecenter = false;
                target.css({width: (width + 'px') });
            }
            if ( height > 0 ) {
                requiresRecenter = false;
                target.css({height: (height + 'px') });
            }

            mostRecentContentSize.height = dimensions.isMaximum ? 'max' : height;
            mostRecentContentSize.width = dimensions.isMaximum ? 'max' : width;

            $modal = this.html.lightbox_me({
                closeSelector: '.close', destroyOnClose: true, centered:true, modalCSS:{top: '0px'},
                onLoad: function() { jive.conc.nextTick(onModalLoad.bind(self)); },
                onClose: function() {
                    $modal = null;
                    self.closeApp_(true, true);
                    self.rendered = false;
                    if (typeof opt_closeCallback === "function") {
                        opt_closeCallback();
                    }
                }
            });
        } else {
            onModalLoad();
            this.restoreStaticDimensions();
        }
    };

    this.setTitle = function(title) {
        this.fullTitle = title;
        this.setModalTitle( this.filterTitle(title) );
    };

    protect.registerModalEventHandlers = function() {
        var self = this;
        // compensate for IE7 iframe height inconsistency with other browsers.
        // other browsers have a 3px bottom margin on iframes, so it is
        // set to margin-bottom: -3px in jive.css to compensate. IE7 actually doesn't have it
        if ($j.browser.msie && $j.browser.version < 8) {
            self.appFrame.css({marginBottom: 0});
        }

        $j(".j-modal-gear-top").unbind('click').click(function(event) {
            // hide
            self.hideChromeNav();
            var appUUID = $j(event.currentTarget).attr('data-appuuid');
            self.emit("app.services.show", appUUID);
            event.preventDefault();
        });
        $j(".j-modal-refresh-top").unbind('click').click(function(event) {
            self.emit("app.services.refresh", event.currentTarget);
            event.preventDefault();
        });
    };

    protect.restoreChromeNav = function() {
        $j(".j-modal-gear-top").show();
        $j(".j-modal-refresh-top").show();
        $j(".j-modal-back-top").hide();

        protect.setSparklineVisibility(true);
    };

    protect.hideChromeNav = function() {
        $j(".j-modal-gear-top").hide();
        $j(".j-modal-refresh-top").hide();
        $j(".j-modal-back-top").show();

        protect.setSparklineVisibility(false);
    };

    /*
     * Maximize the app modal dialog to fill the user's browser window and stays maximized on resize or scroll
     */
    this.maximizeApp = function() {
        var self = this;
        this.resizeMax(false);
    };

    /**
     * Resize to maximum. Can be animated or not. Animation is used for initial maximation (see maximizeApp).
     * Non-animation is used when resizing or scrolling the window.
     * @param animate boolean Whether resize/repositioning logic should be animated
     */
    this.resizeMax = function(animate) {
        this.resizeContainerHeight('max', animate);
        this.resizeContainerWidth('max', animate);
    };

    this.getRenderedApp = function() {
        return appSite ? appSite.jiveData.app : null;
    };

    this.reload = function(reloadStartedCallback) {
        if(!appSite) return;
        var jiveSiteData = appSite.jiveData;
        this.closeApp_(false, false);

        jiveSiteData.app.view = jiveSiteData.getAppView();
        this.render(jiveSiteData.app, jiveSiteData.getActionInfo(), jiveSiteData.getSelection(),
            function(newAppSite) {
                reloadStartedCallback(newAppSite, jiveSiteData.getActionInfo());
            },
            null, jiveSiteData.viewParams);
    };

    /**
     * Close the app's modal and perform any necessary navigation.
     */
    this.closeModal = function(options) {
        options = options || {};

        this.closeApp_(true, true);

        // close the app
        this.html.find('.close').click();
        $modal = null;
        this.rendered = false;

        // navigate if necessary
        if(typeof(options.navigateTo) != 'undefined') {
            var navigateTo = options.navigateTo;
            if( !(/^http(s)?\:\/\//i.test(navigateTo)) ) {
                // deal with relative URLs
                if ( !navigateTo.startsWith('/') ) {
                    navigateTo = '/' + navigateTo;
                }

                if ( !navigateTo.startsWith(window._jive_base_url) ) {
                    navigateTo = window._jive_base_url + navigateTo;
                }
            }

            window.location.href = navigateTo;
        }
    };

    this.closeApp_ = function(emitClose, clearDimensions) {
        if(emitClose) this.emit("app.chrome.close");

        // tell cc to close the gadget site
        if(appSite) {
            this.commonContainer.closeGadget(appSite);
        }
        appSite = null;

        // clear modal state
        if(clearDimensions) {
            this.html.find('#j-app-modal-parent').css({width:'', height:''});
            mostRecentContentSize = { width: 0, height: 0 };
            this.appStaticDimensions = null;
            this.notPrimary = false;
            this.fullTitle = null;
        }
    };

    /**
     * Return the height of the surrounding dialog chrome
     */
    protect.getChromeHeight = function() {
        if(!this.rendered) {
            return 43; // if not yet rendered, guess 43, height of dialog chrome at time of coding
        }
        var containerHeight = this.html.outerHeight();
        var iframeHeight    = this.appFrame.height();
        return containerHeight - iframeHeight;
    };

    /**
     * Return the width of the surrounding dialog chrome
     */
    protect.getChromeWidth = function() {
        if(!this.rendered) {
            return 10; // if not yet rendered, guess 10, width of dialog chrome at time of coding
        }
        var containerWidth = this.html.outerWidth();
        var iframeWidth    = this.appFrame.width();
        return containerWidth - iframeWidth;
    };

    /**
     * Calculate maximum app dialog height based on current window height
     */
    this.getMaximumHeight = function() {
        return $j(window).height() - protect.getChromeHeight();
    };

    /**
     * Calculate maximum app dialog width based on current window height
     */
    this.getMaximumWidth = function() {
        return $j(window).width() - protect.getChromeWidth();
    };

    /**
     * Resize the iframe of the app to the given height
     *  @param newIframeHeight   integer   height the iframe should be, or 'max' for maximum window height
     *  @param animate   boolean   whether resize should be animated or instant
     */
    this.resizeContainerHeight = function(newIframeHeight, animate) {
        animate = !($j.browser.msie && $j.browser.version < 9) && animate;

        if ( this.notPrimary ) {
            // resizing only has effect on the primary app surface
            return;
        }

        if ( newIframeHeight !== 'max' && newIframeHeight < this.bounds.minHeight ) {
            newIframeHeight = this.bounds.minHeight;
        }

        var currentHeight = $j('#j-app-modal-parent iframe').height();
        if ( currentHeight === newIframeHeight ) {
            return;
        }

        if ( newIframeHeight !== "max" && newIframeHeight > this.bounds.maxHeight ) {
            newIframeHeight = 'max';
        }

        var chromeHeight = protect.getChromeHeight(),
            minHeight = this.bounds.minHeight,
            maxHeight = this.getMaximumHeight();

        var wasMax = newIframeHeight === 'max';
        if(wasMax) {
            newIframeHeight = maxHeight;
        }

        // remember value for future resize events
        mostRecentContentSize.height = wasMax ? "max" : newIframeHeight;

        var self = this;
        var modalHeight;

        animate = animate && newIframeHeight < ( maxHeight / 2 );   // animation seems to break if the
                                                                    // target size is greater than 1/2 max size, so turn it off

        if ( animate ) {
            $j('#j-app-modal-parent')[animate ? 'animate' : 'css']({height:(newIframeHeight + "px")}, {duration: 100, queue: false });
            modalHeight = Math.min(Math.max(newIframeHeight, minHeight), maxHeight);

            self.lastResizeTs = new Date().getTime();
            self.html.animate({position: 'fixed', top: '50%', marginTop: $j(self.html).outerHeight()/-2},{duration: 100, queue: false});
            self.html.animate({marginTop: (modalHeight / -2) - chromeHeight/2 }, {duration: 100, queue: false});
            self.appFrame.animate({height: modalHeight}, {duration: 100, queue: false});
        } else {
            $j('#j-app-modal-parent').css({height:(newIframeHeight + "px")});
            modalHeight = Math.min(Math.max(newIframeHeight, minHeight), maxHeight);

            self.lastResizeTs = new Date().getTime();
            self.html.css({position: 'fixed', top: '50%', marginTop: $j(self.html).outerHeight()/-2});
            self.html.css({marginTop: (modalHeight / -2) - chromeHeight/2 });
            self.appFrame.css({height: modalHeight});
        }

    };

    /**
     * Resize the iframe of the app to the given width
     *  @param newIframeWidth    integer    the width the iframe should be, or 'max' for maximum window width
     *  @param animate    boolean   whether resize should be animated or instant
     */
    this.resizeContainerWidth = function(newIframeWidth, animate) {
        animate = !($j.browser.msie && $j.browser.version < 9) && animate;

        if ( this.notPrimary ) {
            // resizing only has effect on the primary app surface
            return;
        }

        if ( newIframeWidth !== 'max' && newIframeWidth < this.bounds.minWidth ) {
            newIframeWidth = this.bounds.minWidth;
        }

        var currentWidth = $j('#j-app-modal-parent iframe').width();
        if ( currentWidth === newIframeWidth ) {
            return;
        }

        if ( newIframeWidth !== "max" && newIframeWidth > this.bounds.maxWidth ) {
            newIframeWidth = 'max';
        }

        var minWidth = this.bounds.minWidth,
            maxWidth = this.getMaximumWidth();

        var wasMax = newIframeWidth === 'max';
        if( wasMax ) {
            newIframeWidth = maxWidth;
        }

        // remember value for future resize events
        mostRecentContentSize.width = wasMax ? "max" : newIframeWidth;

        var self = this;
        var outerWidth = $j(self.html).outerWidth();

        if ( animate ) {
            $j('#j-app-modal-parent')[animate ? 'animate' : 'css']({width:(newIframeWidth + "px")},{duration: 100, queue: false });
            modalWidth = Math.min(Math.max(newIframeWidth, minWidth), maxWidth);

            self.lastResizeTs = new Date().getTime();
            self.html.animate({position: 'fixed', left: '50%', marginLeft: $j(self.html).outerWidth()/-2}, {duration: 100, queue: false});
            self.html.animate({marginLeft: (modalWidth / -2)-4}, {duration: 100, queue: false});
            self.appFrame.animate({width: modalWidth}, {duration: 100, queue: false});
            self.resetTitle();
        } else {
            $j('#j-app-modal-parent').css({width:(newIframeWidth + "px")});
            modalWidth = Math.min(Math.max(newIframeWidth, minWidth), maxWidth);

            self.lastResizeTs = new Date().getTime();
            self.html.css({position: 'fixed', left: '50%', marginLeft: outerWidth/-2});
            self.html.css({marginLeft: (modalWidth / -2)-4});
            self.appFrame.css({width: modalWidth});
            self.resetTitle();
        }

    };

    protect.renderModalCallback = function(response, site, app, opt_callback) {
        var self = this;
        var callback = opt_callback || function() {};

//        alert(JSON.stringify(response));
        if (response.error) {
            // TODO: error info?
        }
        else {
            var iframe = $modal.find('iframe');
            if (self.appFrame.applyCSS) {
                self.appFrame.applyCSS(iframe);
            }
            self.appFrame = iframe;
            self.appFrame.removeData();
            if (app.marketFeatureAvailable) {
                // this is an apps market iframe
                self.appFrame.data("hasMarketFeature", true);
                $j(".j-modal-gear-top").hide();
            }

            // if using the special height/width of 9999, switch to maximized mode
            if (app.actionHeight === 9999 && app.actionWidth === 9999) {
                self.appFrame.css({height: self.getMaximumHeight(), width: self.getMaximumWidth});
                self.resetTitle();
            }
            else {
                // bound height and width to fall within min/max
                if ( app.actionHeight && app.actionWidth ) {
                    self.appFrame.css({height: self.boundedHeight(app.actionHeight ?  app.actionHeight : 0 ),
                        width: self.boundedWidth(app.actionWidth)});
                }
            }

            self.rendered = true;

            callback.call(self, site);
        }
    };

    this.requestNavigateTo = function(app, gadgetSite, view, viewParams, callback) {
        var modalView = this;
        if ( view.indexOf( "canvas") == 0 ) {
            //
            // if CANVAS mode, load URL, redirect go there
            //
            var url = app.url;

            if (view || viewParams) {
                var tokenBuffer = [];
                if (view) tokenBuffer.push(view);
                else tokenBuffer.push("canvas");
                if (viewParams && Object.keys(viewParams).length > 0) tokenBuffer.push(JSON.stringify(viewParams));
                url += "#" + tokenBuffer.join(":");
            }
            window.location = url;
        } else {
            // otherwise we're some kind of embedded view
            app.view = view;
            gadgetSite.jiveData = new JiveSiteData(modalView, app, viewParams);
            this.renderApp_(gadgetSite, app, function(response) {
                modalView.renderModalCallback(response, gadgetSite, app, callback);
            }, viewParams);
        }
    };

    this.scrollIntoView = function(appFrameID, scrollOptions) {
        var options =  scrollOptions || {};
        var bottomOffset = options.bottomOffset;
        var verticalAlignment = options.verticalAlignment == null ? "bottom" : options.verticalAlignment;
        var appFrameContainer = $j("#" + appFrameID).parents(".js-app-chrome");
        var offsetTop;
        if (verticalAlignment === "top") {
            offsetTop = -8; // just below the top of the window
        } else if (verticalAlignment === "center" || verticalAlignment === "middle") {
            offsetTop = (20 + appFrameContainer.height() - $j(window).height()) / 2;
        } else if (isFinite(verticalAlignment)) {
            offsetTop = Number(verticalAlignment);
        } else {
            // default to the bottom
            bottomOffset = isFinite(bottomOffset) ? Number(bottomOffset) : 0;
            offsetTop = 5 - bottomOffset + appFrameContainer.height() - $j(window).height();
        }
        $j.scrollTo(appFrameContainer, {duration:500,offset:{left:0,top:offsetTop}});
    };

    protect.restoreAppIframe = function() {
        var self = this;
        // 1. remove modal content
        this.html.find(".j-app-modal-content").remove();

        // 2. restore static dimensions
        protect.restoreStaticDimensions();

        // 3. restore the running app iframe
        $j('#j-app-modal-parent iframe').css({ "display":"block"});

        // 4. recenter the modal
        this.recenterModal( false );
    };

    protect.resizeModal = function( height, width, animate ) {
        animate = !($j.browser.msie && $j.browser.version < 9) && animate;

        var resize_target = this.html.find(".j-app-modal-content");

        // reposition
        this.html.css({
            position: 'fixed',
            top: '50%',
            marginTop: this.html.outerHeight()/-2,
            left: '50%',
            marginLeft: this.html.outerWidth()/-2
        });

        // move the modal
        this.html[animate ? 'animate' : 'css']({
            marginLeft: width / -2,
            marginTop: height / -2}, {duration: 300, queue: false}
        );

        // resize the target within the modal
        resize_target[animate ? 'animate' : 'css']({width: width,height: height}, {duration: 300, queue: false});
    };

    protect.recenterModal = function( animate ) {
        protect.recenter( $j("#jive-modal-appAction"), animate );
    };

    /**
     * Adds the S & C interface.
     * @param appServiceController
     */
    this.invokeSettings = function( appServiceController ) {
        var self = this;

        protect.invokeNonPrimarySurface( self, function() {
            protect.revokeStaticModalDimensions();

            self.hideChromeNav();

            // 1. hide running app iframe, since its no longer the active modal component
            $j('#j-app-modal-parent iframe').css({ "display": "none" } );

            // 2. generate UI
            var $html = appServiceController.createUI();
            $j('#j-app-modal-parent').append($html);

            // 3. resize the active modal component (the S & C container)
            self.resizeModal( 550, 600, false );

            self.resetTitle(null, 500);

            // 4. activate controller
            appServiceController.activate();
        } );
    };

    /**
     * Destroys the S & C interface.
     */
    this.destroySettings = function() {
        this.notPrimary = false;
        this.restoreChromeNav();
        this.restoreAppIframe();
        this.resetTitle();
    };

    /**
     * This sets up the modal to host the credentials UI provided by the credentials controller
     * that is passed in.
     * @param credentialsController
     */
    this.invokeCredentials = function(credentialsController) {
        var self = this;

        protect.invokeNonPrimarySurface( self, function() {
            //
            self.hideChromeNav();

            //
            protect.revokeStaticModalDimensions();

            // 1. hide running app iframe, its no longer the active modal component
            $j('#j-app-modal-parent iframe').css({ "display":"none" } );

            // 2. generate UI
            var $html = credentialsController.createUI();
            $j('#j-app-modal-parent').append($html);
            $j(".j-modal-back-top").hide();

            // 3. resize the modal
            self.resizeModal( 200, 540, true );

            self.resetTitle(null, 480 );

            credentialsController.activate();
        } );
    };

    /**
     * This removes the credentials UI, and restores the currently running app.
     */
    this.destroyCredentials = function() {
        this.notPrimary = false;
        this.restoreChromeNav();
        this.restoreAppIframe();
        this.resetTitle();
    };

    this.invokeOauthDance = function( oauthController ) {
        var self = this;

        protect.invokeNonPrimarySurface( self, function () {
            self.hideChromeNav();

            // 0.
            protect.revokeStaticModalDimensions();

            // 1. hide running app iframe, its no longer the active modal component
            $j('#j-app-modal-parent iframe').css({ "display":"none" } );
            $j(".j-modal-back-top").hide();

            // 2. generate UI
            var app = oauthController.getApp();
            var alerts = new AlertMainV2( app );

            // formulate oauth blocking alert
            var alert = { appTitle:app.title, code:2060, message:"", creator:"", errorMessage: "", iconSrc:app.iconSrc };

            // apply the blocking alert
            var target = $j('#j-app-modal-parent');
            var blockingDom = alerts.applyBlock( target, app, alert );

            // recent the modal
            self.recenterModal( false );

            // launch the external service popup
            oauthController.launch_popup( $j(blockingDom) );

            // setup handler for what happens when the external service popup is closed:
            oauthController.addListener('popup.closed', function() {
                // clear overlay
                $j(blockingDom).remove();
                self.restoreChromeNav();
                self.restoreAppIframe();

                protect.restoreStaticDimensions();
                self.notPrimary = false;

                oauthController.invokeCallback();
            });
        } );
    };

    protect.invokeNonPrimarySurface = function( self, toRun ) {
        if ( self.notPrimary ) {
            // can't invoke if already not primary
            return false;
        }

        self.notPrimary = true;

        protect.delayedRunner( toRun,
            150,
            function() {
                var now = new Date().getTime();
                return ( !self.lastResizeTs || now - self.lastResizeTs > 300 );
            }
        );
    };

    /**
     * This method is used to show/hide the sparkline. When the settings & configuration panel is displayed, the
     * sparkline is hidden. When the app is rendered, the sparkline is shown if it is enabled.
     * @param isVisible Should the sparkline be visible?
     */
    protect.setSparklineVisibility = function(isVisible) {
        var sparkline = $j('.j-app-sparkline');
        if(this.sparklineEnabled && isVisible) {
            sparkline.show();
        } else {
            sparkline.hide();
        }
    };

    protect.revokeStaticModalDimensions = function( animate, callback ) {
        animate = !($j.browser.msie && $j.browser.version < 9) && animate;

        var target = $j('#j-app-modal-parent');
        this.appStaticDimensions = {
            width: target.width() + "px",
            height: target.height() + "px"
        };

        target[animate ? 'animate' : 'css']({
            width:'', height:''
        }, 300, callback || function() {} );
    };

    protect.restoreStaticDimensions = function( animate, callback ) {
        if (this.appStaticDimensions) {
            protect.setStaticDimensions( this.appStaticDimensions.width, this.appStaticDimensions.height, animate );
        }
    };

    protect.setStaticDimensions = function( width, height,animate  ) {
        animate = !($j.browser.msie && $j.browser.version < 9) && animate;

        var target = $j('#j-app-modal-parent');

        if ( animate ) {
            target.animate({
                width: width,
                height: height
            }, 300, callback || function() {} );
        } else {
            target.width( width ).height( height );
        }
    };

    /**
     * This is the function which sets up an embedded view to appear on clicking an app artifact
     * containing an embedded view.
     * @param $renderedContent
     * @param opts
     */
    this.modifyRenderedContent = function($renderedContent, opts) {
        var view = this;

        // Register handler for app action invoked by clicking on an artifact when a content is being viewed

        $j(document)
            .off('click.embeddedAppArtifact')
            .on('click.embeddedAppArtifact', 'a.jive_macro_appEmbeddedView', function(e) {
            var $this = $j(this);

            // make sure context is something other than "{}"
            var context = view.buildEmbedContext($this);

            // make sure view is present and not blank
            var appUUID = $this.attr('__appuuid') || "";
            var actionId = $this.attr('__action_id') || "";
            var embeddedID = $this.attr("id") || String(Math.random());
            view.setEmbeddedContext(embeddedID, context);

            // TODO: this is a workaround until we can associate the context with a particular link
            view.setEmbeddedContext('latest', context);

            if(appUUID.length == 36 && context.target && context.target.type == "embed") {
                e.preventDefault();
                view.handleEmbeddedView($this, ActionOriginEnum.CONTENT, embeddedID);
            }
        });
        var ee = this.getEmbeddedExperienceToShowOnLoad();
        if (ee) {
            var activeView = $renderedContent.find('.jive_macro_appEmbeddedView').filter("#" + ee);
            if (activeView.length > 1) {
                activeView = $j(activeView[0]);
            }
            if (activeView.length == 1) {
                jive.conc.nextTick(function() {activeView.click()});
            }
        }
    };

    protect.getEmbeddedExperienceToShowOnLoad = function() {
        if (typeof this.embeddedExperienceToShowOnLoad === "undefined") {
            this.embeddedExperienceToShowOnLoad = "";
            var m = /^#([a-zA-Z0-9_-]+)$/.exec(window.location.hash || "");
            if (!m) {
                m = /[?&]ee=([a-zA-Z0-9_-]+)(&|$)/.exec(window.location.search);
            }
            this.embeddedExperienceToShowOnLoad = m ? m[1] : null;
        }
        return this.embeddedExperienceToShowOnLoad;
    };

    protect.buildEmbedContext = function (link) {
        var result = {};
        var targetType = link.attr("__view") || link.attr("__context")
            ? "embed"
            : link.attr("href") ? "url" : "none";
        switch (targetType) {
            case "embed":
                var appView = link.attr("__view") || "embedded";
                result.target = {
                    type: "embed",
                    view: appView
                };
                var context = link.attr("__context");
                if (context) {
                    result.target.context = JSON.parse(context);
                }
                break;
            case "url":
                result.target = {
                    type: "url",
                    url: link.attr("href")
                };
                break;
        }

        var displayType = link.hasClass("jive-link-app-preview")
            ? "image"
            : "text";
        switch (displayType) {
            case "image":
                var img = link.find("> img");
                result.display = {
                    type: "image",
                    previewImage: img.attr("src")
                };
                var label = img.attr("title");
                if (label) {
                    result.display.label = label;
                }
                break;
            case "text":
                result.display = {
                    type: "text",
                    label: link.text() || ""
                };
                if (link.hasClass("jive-link-app-icon")) {
                    result.display.icon = link.attr("__icon");
                }
                break;
        }

        result.actionId = link.attr("__action_id") || "";
        result.jive = JSON.parse(link.attr("data-jive-context") || "{}");
        return result;
    };

    /**
     * Modal app dimensions are bound to maximum and minimum heights.
     * @param app
     * @param view
     */
    this.computeAppDimensions = function( app, view ) {
        var dimensions = _super.computeAppDimensions.call(this, app, view);
        var isMaximum = dimensions.isMaximum, width = dimensions.width, height = dimensions.height;

        if ( isMaximum ) {
            height = this.getMaximumHeight();
            width = this.getMaximumWidth();
        } else {
            if ( width ) {
                width = this.boundedWidth( width );
            }
            if ( height ) {
                height = this.boundedHeight( height );
            }
        }

        width = width < this.bounds.minWidth ? this.bounds.minWidth : width;
        height = height < this.bounds.minHeight ? this.bounds.minHeight : height;

        return {
            height: height,
            width: width,
            isMaximum: isMaximum
        }
    };


});
});
