/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Onboarding');

/**
 * @depends path=/resources/scripts/apps/onboarding/views/basics_view.js lazy=true
 * @depends path=/resources/scripts/apps/onboarding/views/contribute_view.js lazy=true
 * @depends path=/resources/scripts/apps/onboarding/views/explore_view.js lazy=true
 * @depends path=/resources/scripts/apps/onboarding/models/onboarding_source.js lazy=true
 * @depends path=/resources/scripts/jquery/jquery.ba-bbq.js
 * @depends template=jive.onboarding.onboardingProgress
 * @depends template=jive.onboarding.postHideViewTip
 */
define('jive.onboarding.Main', [
    'jquery'
], function($) {
    return jive.oo.Class.extend(function(protect) {
        this.init = function(options) {
            var main = this;
            main.resourcesInitialized = false;
            var queryParams = $.deparam.querystring();
            if (queryParams.fromQ == 856595828 ||
                queryParams.fromQ == -1790695889 ||
                queryParams.fromQ == -775000491) {
                main.initResources(false, queryParams);
            }
        };

        this.initResources = function(postRender, queryParams) {
            var main = this;
            define([
                'jive.onboarding.BasicsView',
                'jive.onboarding.ExploreView',
                'jive.onboarding.ContributeView',
                'jive.onboarding.Source'], function(BasicsView, ExploreView, ContributeView, Source) {
                main.source = new Source();
                main.streamConfigSource = new jive.ActivityStream.BuilderServices();
                main.basicsView = new BasicsView({
                    selector: '#j-basics',
                    questID: 856595828,
                    queryParams: queryParams
                });
                main.attachViewListeners(main.basicsView);
                main.exploreView = new ExploreView({
                    selector: '#j-explore',
                    questID: -1790695889,
                    queryParams: queryParams
                });
                main.attachViewListeners(main.exploreView);
                main.contributeView = new ContributeView({
                    selector: '#j-contribute',
                    questID: -775000491,
                    queryParams: queryParams
                });
                main.attachViewListeners(main.contributeView);
                if (postRender) {
                    main.basicsView.postRender({selector: '#j-basics'});
                    main.exploreView.postRender({
                        selector: '#j-explore',
                        instanceName: main.instanceName});
                    main.contributeView.postRender({selector: '#j-contribute'});
                }
                main.resourcesInitialized = true;
            });
        };

        this.postPageRender = function(options) {
            var main = this,
                onStateUpdate = function(viewData) {
                    var $newProgressBar = $(jive.onboarding.onboardingProgress({
                            percentComplete: viewData.percentComplete
                        }));
                    $('#j-onboarding-progress').replaceWith($newProgressBar);
                    if (viewData.percentComplete == 100) {
                        $('#j-onboarding .j-onb-quest-header .js-hide-onb').show();
                    }
                };
            main.instanceName = options.instanceName;
            main.initResources(true, {});
            // close any tips that might be hanging around (comment/like tips from quests when
            // hitting "Back" button in browser, for example)
            $('div.js-onboarding-tip').remove();
            jive.switchboard.removeListener('onboarding.state.update', onStateUpdate)
                .addListener('onboarding.state.update', onStateUpdate);
            $('#j-onboarding').on('click', '.js-hide-onb', function(e) {
                e.preventDefault();
                main.source.setOnboardingVisible(false).addCallback(function() {
                    jive.HomeNav.GlobalController.hideView('onboarding');
                    var $tip = $(jive.onboarding.postHideViewTip());
                    $tip.popover({
                        context: $('#j-satNav')
                    });
                    $j('body').one('click', function() {
                        $tip.trigger('close');
                    });
                });
            }).on('click', '.js-onb-show-intro-modal', function(e) {
                e.preventDefault();
                jive.HomeNav.GlobalController.showOnboardingIntroModal(true);
            });
        };

        this.attachViewListeners = function(newView) {
            var main = this;
            newView.addListener('getStepData', function(questID, step, promise) {
                main.source.getStepData(questID, step, promise);
            }).addListener('markStepComplete', function(questID, step) {
                main.source.markStepComplete(questID, step);
            }).addListener('clearActiveQuest', function() {
                main.initActiveQuestID();
            }).addListener('getAllQuestProgressData', function(promise) {
                main.source.initializeView().addCallback(function(data) {
                    promise.emitSuccess(data);
                });
            }).addListener('followObjects', function(objList, stepID, promise) {
                main.streamConfigSource.manageAssociations(objList, {fromQ: '856595828', qstep: stepID}).addCallback(
                    function(data) {
                        promise.emitSuccess(data);
                    }
                );
            }).addListener('updateUserProfile', function(interestsVal, bioVal, promise) {
                main.source.updateUserProfile(interestsVal, bioVal, promise);
            });
            return main;
        };
    });
});
