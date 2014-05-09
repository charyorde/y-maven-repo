/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('HomeNav');

/**
 * Controller for Home page left navigation section
 *
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/apps/activity_stream_builder/activity_stream_builder_controller.js lazy=true
 * @depends path=/resources/scripts/apps/activity_stream_builder/models/builder_services.js
 * @depends path=/resources/scripts/apps/activity_stream/models/activity_stream_source.js
 * @depends path=/resources/scripts/apps/activity_stream/models/activity_stream_exclusion.js
 * @depends path=/resources/scripts/apps/action_queue/models/action_queue_source.js
 * @depends path=/resources/scripts/apps/onboarding/models/onboarding_source.js
 * @depends path=/resources/scripts/apps/shared/models/location_state.js
 * @depends path=/resources/scripts/apps/home/views/nav_links_view.js
 * @depends path=/resources/scripts/jquery/jquery.safelyLoad.js
 * @depends path=/resources/scripts/apps/microblogging/status_input_mb_controller.js
 *
 *
 * @depends template=jive.home.dynamicPaneContents
 * @depends template=jive.inbox.dynamicPaneContents
 * @depends template=jive.eae.actionqueue.actionsDynamicPane
 * @depends template=jive.moderation.moderationDynamicPane
 * @depends template=jive.onboarding.*
 * @depends i18nKeys=userbar.welcome.gtitle
 * @depends i18nKeys=onboarding.page.title
 * @depends i18nKeys=inbox.moderation.tab
 * @depends i18nKeys=nav.bar.actions.link
 * @depends i18nKeys=nav.bar.inbox.link
 */
define('jive.HomeNav.Controller', [
    'jquery',
    'jive.ActivityStream.BuilderController'
], function($, ASBController) {
    return jive.oo.Class.extend(function(protect) {
        this.init = function (options) {
            var homeNavController = this;

            homeNavController.buildingStream = {};
            homeNavController.selectedLinkID = options.selectedLinkID;
            homeNavController.sysDefaultHomeNavView = options.sysDefaultHomeNavView;
            homeNavController.onbIntroModalType = options.onbIntroModalType;
            homeNavController.instanceName = options.instanceName;
            homeNavController.mode = '';
            if (homeNavController.selectedLinkID == 'jive-nav-link-activity' ||
                $('#' + homeNavController.selectedLinkID).hasClass('j-js-as-nav-item')) {
                homeNavController.mode = 'activity';
            }
            else if (homeNavController.selectedLinkID == 'jive-nav-link-communications') {
                homeNavController.mode = 'communications';
            }
            else if (homeNavController.selectedLinkID == 'jive-nav-link-actions') {
                homeNavController.mode = 'actions';
            }
            else if (homeNavController.selectedLinkID == 'jive-nav-link-dashboard') {
                homeNavController.mode = 'dashboard';
            }
            else if (homeNavController.selectedLinkID == 'jive-nav-link-moderation') {
                homeNavController.mode = 'moderation';
            }
            else if (homeNavController.selectedLinkID == 'jive-nav-link-get-started') {
                homeNavController.mode = 'onboarding';
            }

            homeNavController.streamService = new jive.ActivityStream.StreamSource();
            homeNavController.actionsService = new jive.ActionQueue.ListSource();
            homeNavController.builderService = new jive.ActivityStream.BuilderServices();
            homeNavController.onboardingService = new jive.Onboarding.Source();
            homeNavController.locationState = jive.locationState;

            homeNavController.supportPushState = !!(window.history && window.history.pushState);
            options.supportPushState = homeNavController.supportPushState;

            homeNavController.locationState.addListener('change', homeNavController.loadView.bind(homeNavController))
                .addListener('noChange', homeNavController.loadView.bind(homeNavController));

            homeNavController.linksView = new jive.HomeNav.LinksView(options);
            homeNavController.linksView.postRender();

            homeNavController.linksView.addListener('loadView',
                function(type, streamID, promise) {
                    var params = {};
                    if (type == 'all' || type == 'custom' || type == 'watches' || type == 'connections') {
                        if (type != 'all') {
                            params = {streamSource: type,
                                      streamID: streamID};
                        }
                        homeNavController.locationState.setState(params, '', 'activity');
                    }
                    else if (type == 'communications') {
                        homeNavController.locationState.setState(params, '', 'inbox');
                    }
                    else if (type == 'actions') {
                        homeNavController.locationState.setState(params, '', 'actions');
                    }
                    else if (type == 'moderation') {
                        homeNavController.locationState.setState(params, '', 'moderation');
                    }
                    else if (type == 'dashboard') {
                        homeNavController.locationState.setState(params, '', 'welcome');
                    }
                    else if (type == 'onboarding') {
                        homeNavController.locationState.setState(params, '', 'get-started');
                    }
                    promise.emitSuccess();

                }).addListener('loadBuilderView', function(streamID, promise) {
                    homeNavController.loadBuilderView(streamID).addCallback(function(svb) {
                        if (streamID == 'new') {
                            var params = {streamSource: 'custom',
                                streamID: svb.configuration.id,
                                newStream: true};
                            homeNavController.locationState.setState(params, '', 'activity');
                        }
                        promise.emitSuccess();
                    });
                }).addListener('closeBuilder', function(promise) {
                    $('body').removeClass('j-stream-building');
                    homeNavController.spinner = new jive.loader.LoaderView();
                    homeNavController.spinner.appendTo(homeNavController.getDynamicPaneArea());
                    jive.ActivityStream.GlobalBuilderController.closeBuilder();
                    homeNavController.loadActivityStream(homeNavController.buildingStream.configuration.source,
                        homeNavController.buildingStream.configuration.id);
                    homeNavController.buildingStream = {};
                    promise.emitSuccess();
                }).addListener('pin', function(linkID, promise) {
                    homeNavController.builderService.pinHomeNav(linkID, promise);
                }).addListener('deleteStream', function(streamID, promise) {
                    homeNavController.builderService.deleteStream(streamID, promise);
                }).addListener('saveStreamName', function(configObj, promise) {
                    homeNavController.builderService.modifyConfig(configObj).addCallback(function(data) {
                        promise.emitSuccess(data);
                    });
                });

            this.accessibility = new jive.Accessibility({
                scope: homeNavController.linksView.getContent(),
                otherActions: [jive.Accessibility.focusRingAction(homeNavController.linksView.getContent())]
            });
    //        jive.Accessibility.main.addHotkey("s", false, false, false, jive.Accessibility.focusAction($("#jive-nav-link-activity a")));

            $(document).ready(function() {
                // Make sure that this is executed asynchronously to prevent race
                // conditions in init() methods in classes that mix in this trait.
                jive.conc.nextTick(function() {
                    // If we're in a non-push state enabled browser and there are params in the location hash on load,
                    // process the location hash and switch views.
                    var startingState = homeNavController.locationState.getEphemeralState(),
                        path = '';
                    if (Object.keys(startingState).length && startingState['nPLoc']) {
                        path = startingState['nPLoc'];
                        delete startingState['nPLoc'];
                        homeNavController.locationState.setState(startingState, '', path);
                        homeNavController.linksView.forceUpdateSelectedNavItem(startingState, path);
                    }
                });
            });

            if (options.showOnbIntroModal) {
                homeNavController.showOnboardingIntroModal(false);
            }
        };

        this.loadView = function(params, description, url) {
            var homeNavController = this,
                newRoot,
                promise = new jive.conc.Promise();

            if (homeNavController.loadViewPromise) {
                homeNavController.loadViewPromise.cancel();
            }

            homeNavController.loadViewPromise = promise;

            // non-push state enabled browsers will have this special param set to a url path if the url path is
            // supposed to be updated
            if (params['nPLoc']) {
                newRoot = params['nPLoc'];
            }
            else {
                newRoot = url.split("/").slice(-1)[0];
                var queryParamIndex = newRoot.indexOf("?");
                if (queryParamIndex == -1) {
                    queryParamIndex = newRoot.indexOf("#");
                }
                if (queryParamIndex != -1) {
                    newRoot = newRoot.substring(0, queryParamIndex);
                }
            }
            if (homeNavController.spinner) {
                homeNavController.spinner.getContent().remove();
                homeNavController.spinner.destroy();
            }

            if (newRoot == "activity" && !params.newStream) {
                var streamSource = 'all';
                if (params.streamSource) {
                    streamSource = params.streamSource;
                }
                if (homeNavController.mode == "builder") {
                    $('body').removeClass('j-stream-building');
                    homeNavController.linksView.setEditMode(false);
                    homeNavController.buildingStream = {};
                    jive.ActivityStream.GlobalBuilderController.closeBuilder();
                }
                homeNavController.loadActivityStream(streamSource, params.streamID || 0, homeNavController.loadViewPromise);
            }
            else {
                if (homeNavController.mode == "builder" && !params.newStream) {
                    $('body').removeClass('j-stream-building');
                    homeNavController.linksView.setEditMode(false);
                    homeNavController.buildingStream = {};
                    jive.ActivityStream.GlobalBuilderController.closeBuilder();
                }
                if (newRoot == 'inbox') {
                    homeNavController.loadCommunications(homeNavController.loadViewPromise);
                }
                else if (newRoot.indexOf('actions') != -1 || newRoot == 'tasks' || newRoot == 'archived') {
                    // could be actions, actions/archived, or actions/tasks for non-push state browsers
                    homeNavController.loadActions(newRoot, homeNavController.loadViewPromise);
                    // for updating selected nav link
                    newRoot = 'actions';
                }
                else if (newRoot == 'moderation') {
                    homeNavController.loadModeration();
                }
                else if (newRoot == 'welcome') {
                    homeNavController.loadDashboard(homeNavController.loadViewPromise);
                }
                else if (newRoot == 'get-started') {
                    if (homeNavController.linksView.getViewItem('onboarding').length) {
                        homeNavController.loadOnboarding(homeNavController.loadViewPromise);
                    }
                    else {
                        jive.locationState.setState({}, '', 'activity');
                        $('html, body').animate({ scrollTop: 0 }, 'fast');
                    }
                }
            }
            homeNavController.linksView.forceUpdateSelectedNavItem(params, newRoot);
        };

        this.activityStreamControllerInitialized = function() {
            var homeNavController = this;
            jive.switchboard.emit('activity.stream.controller.initialized');
            jive.ActivityStream.GlobalActivityStreamController.addListener('clearUpdates',
                function(streamType, streamID) {
                    homeNavController.linksView.clearUpdates(streamType, streamID);
                }).addListener('loadBuilderView', function(streamID) {
                    homeNavController.loadBuilderView(streamID);
                });
        };

        this.loadBuilderView = function(streamID) {
            var homeNavController = this;
            homeNavController.spinner = new jive.loader.LoaderView();
            homeNavController.spinner.appendTo(homeNavController.getDynamicPaneArea());

            if (!jive.ActivityStream.GlobalBuilderController) {
                jive.ActivityStream.GlobalBuilderController = new ASBController();
                jive.ActivityStream.GlobalBuilderController.addListener('removeStream', function(data) {
                    homeNavController.linksView.removeDeletedStream(data);
                });
            }
            var promise = new jive.conc.Promise();
            promise.addCallback(function(svb) {
                homeNavController.mode = 'builder';
                $('body').addClass('j-stream-building');
                homeNavController.buildingStream = svb;
                homeNavController.linksView.postBuilderLoad(svb);
                if (homeNavController.spinner) {
                    homeNavController.spinner.getContent().remove();
                    homeNavController.spinner.destroy();
                }
            });
            jive.ActivityStream.GlobalBuilderController.loadStream(streamID, promise);
            return promise;
        };

        this.loadActivityStream = function(streamType, streamID, promise) {
            var homeNavController = this;
            homeNavController.spinner = new jive.loader.LoaderView();
            homeNavController.spinner.prependTo(homeNavController.getDynamicPaneArea());

            if (homeNavController.mode != 'activity') {
                homeNavController.streamService.initializeView(streamType, streamID, promise).addCallback(function(viewData) {
                    var $newDynamicPaneData = $(jive.home.dynamicPaneContents(viewData));
                    homeNavController.getDynamicPaneArea().html($newDynamicPaneData);
                    homeNavController.linksView.clearUpdates(streamType, streamID);
                    if (homeNavController.spinner) {
                        homeNavController.spinner.getContent().remove();
                        homeNavController.spinner.destroy();
                    }
                    homeNavController.updatePageTitle(viewData.streamDisplayName);
                    jive.dispatcher.dispatch('activity.stream.view.initialized');
                    if (jive.partner && jive.partner.actionPage) {
                        jive.partner.actionPage.loadGroups();
                    }
                    homeNavController.mode = 'activity';
                });
            }
            else {
                promise.addCallback(function(viewData) {
                    homeNavController.updatePageTitle(viewData.streamDisplayName);
                    if (homeNavController.spinner) {
                        homeNavController.spinner.getContent().remove();
                        homeNavController.spinner.destroy();
                    }
                    homeNavController.mode = 'activity';
                });
                jive.ActivityStream.GlobalActivityStreamController.loadStream(streamType, streamID, streamType != 'all', promise);
            }
        };

        this.loadCommunications = function(promise) {
            var homeNavController = this;
            homeNavController.spinner = new jive.loader.LoaderView();
            homeNavController.spinner.prependTo(homeNavController.getDynamicPaneArea());
            homeNavController.streamService.initializeView("communications", 0, promise).addCallback(function(viewData) {
                var $newDynamicPaneData = $(jive.inbox.dynamicPaneContents(viewData));
                homeNavController.getDynamicPaneArea().html($newDynamicPaneData);
                homeNavController.spinner.getContent().remove();
                homeNavController.spinner.destroy();
                if (viewData.pollCounts) {
                    jive.switchboard.emit('activityStream.poll', viewData.pollCounts);
                }
                homeNavController.mode = 'communications';
            });
            homeNavController.updatePageTitle(jive.i18n.getMsg('nav.bar.inbox.link'));
        };

        this.loadActions = function(newRoot, promise) {
            var homeNavController = this;
            var tabID = 'jive-aq-pending';
            if (newRoot.indexOf('tasks') != -1) {
                tabID = 'jive-tasks'
            }
            else if (newRoot.indexOf('archived') != -1) {
                tabID = 'jive-aq-archived'
            }
            if (homeNavController.mode != 'actions') {
                homeNavController.spinner = new jive.loader.LoaderView();
                homeNavController.spinner.prependTo(homeNavController.getDynamicPaneArea());
                homeNavController.actionsService.initializeView(tabID, promise).addCallback(function(viewData) {
                    var $newDynamicPaneData = $(jive.eae.actionqueue.actionsDynamicPane(viewData));
                    homeNavController.getDynamicPaneArea().html($newDynamicPaneData);
                    homeNavController.updatePageTitle(jive.i18n.getMsg('nav.bar.actions.link'));
                    homeNavController.spinner.getContent().remove();
                    homeNavController.spinner.destroy();
                    homeNavController.mode = 'actions';
                });
            }
            else {
                promise.addCallback(function() {
                    homeNavController.updatePageTitle(jive.i18n.getMsg('nav.bar.actions.link'));
                    homeNavController.mode = 'actions';
                });
                jive.ActionQueue.Controller.loadView(tabID, promise);
            }
        };

        this.loadModeration = function() {
            var homeNavController = this;
            homeNavController.spinner = new jive.loader.LoaderView();
            homeNavController.spinner.prependTo(homeNavController.getDynamicPaneArea());
            var $newDynamicPaneData = $(jive.moderation.moderationDynamicPane());
            homeNavController.getDynamicPaneArea().html($newDynamicPaneData);
            homeNavController.spinner.getContent().remove();
            homeNavController.spinner.destroy();
            homeNavController.mode = 'moderation';
            homeNavController.updatePageTitle(jive.i18n.getMsg('inbox.moderation.tab'));
        };

        this.loadDashboard = function(promise) {
            var homeNavController = this;
            homeNavController.spinner = new jive.loader.LoaderView();
            homeNavController.spinner.prependTo(homeNavController.getDynamicPaneArea());
            var xhrObj = homeNavController.getDynamicPaneArea().safelyLoad(jive.app.url({path:'/welcome-dynamic.jspa'}), {},
                function(pageData, responseText, response) {
                    if (responseText != "abort" && (
                            response.status == 401 ||
                            response.status == 403 ||
                            response.status == 4026 ||
                            response.status === 0)) {
                        location.reload();
                    }
                    homeNavController.mode = 'dashboard';
                }
            );
            promise.addCancelback(function() {
                xhrObj.abort();
            });
            homeNavController.updatePageTitle(jive.i18n.getMsg('userbar.welcome.gtitle'));
        };

        this.loadOnboarding = function(promise) {
            var homeNavController = this;
            homeNavController.spinner = new jive.loader.LoaderView();
            homeNavController.spinner.prependTo(homeNavController.getDynamicPaneArea());
            homeNavController.onboardingService.initializeView(promise).addCallback(function(viewData) {
                var $newDynamicPaneData = $(jive.onboarding.dynamicPaneContents({viewData: viewData}));
                homeNavController.getDynamicPaneArea().html($newDynamicPaneData);
                homeNavController.spinner.getContent().remove();
                homeNavController.spinner.destroy();
                homeNavController.mode = 'onboarding';
            });
            homeNavController.updatePageTitle(jive.i18n.getMsg('onboarding.page.title'));
        };

        this.updatePageTitle = function(newTitle) {
            document.title = document.title.replace(/(\(.*\)\s*|^)(.*?)(\s\||$)/, "$1" + newTitle + "$3");
        };

        this.decrementNewCount = function(streamType, decCount) {
            this.linksView.decrementNavCount(streamType, decCount);
        };

        this.hideView = function(source) {
            this.linksView.hideView(source);
        };

        this.showOnboardingIntroModal = function(redisplay) {
            var homeNavController = this,
                $modal = $(jive.onboarding.introModal({
                type: homeNavController.onbIntroModalType,
                userDisplayName: window._jive_current_user.displayName,
                instanceName: homeNavController.instanceName,
                redisplay: redisplay
            }));
            $modal.lightbox_me({
                destroyOnClose: true,
                centered: true,
                onLoad: function() {
                    $modal.on('click', '#j-onb-accept', function(e) {
                        e.preventDefault();
                        if (homeNavController.mode != "onboarding") {
                            homeNavController.locationState.setState({}, '', 'get-started');
                        }
                        $modal.trigger('close');
                        $('html, body').animate({ scrollTop: 0 }, 'fast');
                    }).on('click', '#j-onb-default', function(e) {
                        e.preventDefault();
                        if (homeNavController.onbIntroModalType == 'new_user') {
                            homeNavController.onboardingService.newUserExploreOnOwn();
                            $('#' + homeNavController.sysDefaultHomeNavView + " a").click();
                        }
                        $modal.trigger('close');
                        $('html, body').animate({ scrollTop: 0 }, 'fast');
                        var $tip = $(jive.onboarding.postExploreOnMyOwnTip({
                            instanceName: homeNavController.instanceName
                        }));
                        $tip.popover({
                            context: $('#jive-nav-link-get-started'),
                            position: 'right'
                        });
                    });
                }
            });
        };

        this.getDynamicPaneArea = function() {
            return $('#j-dynamic-pane');
        }
    });
});
