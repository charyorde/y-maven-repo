/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/**
 * jive.Trial.Main
 *
 * Main class for trial javascript
 *
 */
jive.namespace('Trial');

/**
 * Entry point for the Trial App.
 *
 * @depends path=/resources/scripts/apps/trial/views/trial_view.js
 * @depends path=/resources/scripts/apps/trial/views/trial_tip_helper.js
 * @depends path=/resources/scripts/apps/trial/models/trial_panel_source.js
 */
define('jive.trial.PanelMain', [
    'jquery',
    'jive.trial.PanelView',
    'jive.trial.TipHelper',
    'jive.trial.PanelSource'
], function($, PanelView, TipHelper, PanelSource) {
    return jive.oo.Class.extend(function(protect) {
        this.init = function(options) {
            var main = this;
            this.daysRemaining = options.daysRemaining;
            this.trialAdmin = options.trialAdmin;
            this.trialAdminData = options.trialAdminData;
            this.instanceURL = options.instanceURL;
            this.communityName = options.communityName;

            this.initActiveQuestID();

            this.trialView = new PanelView(options);
            this.trialTipHelper = new TipHelper(options);
            this.trialSource = new PanelSource();

            this.trialView.addListener('loadPanel', function(promise) {
                main.trialSource.get('panel').addCallback(function(data) {
                    data.daysRemaining = main.daysRemaining;
                    data.trialAdmin = main.trialAdmin;
                    data.trialAdminData = main.trialAdminData;
                    data.instanceURL = main.instanceURL;
                    promise.emitSuccess(data);
                });
            }).addListener('saveLastViewedQuest', function(questName) {
                main.trialSource.saveLastViewedQuest(questName);
            }).addListener('saveProgress', function(newestItemTime) {
                main.trialSource.saveProgress(newestItemTime);
            }).addListener('clearUserTipQueue', function() {
                main.trialSource.clearUserTipQueue();
            });

            this.trialTipHelper.addListener('shouldSetupPage', function(questID, step, promise) {
                promise.addCallback(function(shouldShow) {
                    if (shouldShow) {
                        main.activeQuestID = questID;
                        main.activeQuestStep = step;
                    }
                    else {
                        main.initActiveQuestID();
                    }
                });
                main.trialSource.getShouldShowTips(questID, step, promise);
            }).addListener('clearActiveQuest', function() {
                main.initActiveQuestID();
            }).addListener('getAllQuestProgressData', function(promise) {
                main.trialSource.get('panel').addCallback(function(data) {
                    promise.emitSuccess(data);
                });
            });

            jive.dispatcher.listen("trial.updatePercentComplete", function() {
                main.trialSource.get('percentComplete').addCallback(function(data) {
                    if (data.newProgress > 0) {
                        jive.switchboard.emit('trial.updatePercentComplete', data);
                    }
                });
            });

            jive.switchboard.addListener('trial.updatePercentComplete', function(data) {
                main.updateProgressBar(data);
            });

            if (options.showTrialPanelImmediately) {
                this.trialView.loadPanel();
            }
        };

        protect.initActiveQuestID = function() {
            this.activeQuestID = '';
            this.activeQuestStep = null;
        };

        protect.updateProgressBar = function(data) {
            this.trialView.updateProgressBar(data);
        };

        // the "active" quest id and step in that quest can be fetched by other js that may need this data in order
        // to set the correct flags in its own views/models
        this.getActiveQuestAndStep = function() {
            return {activeQuestID: this.activeQuestID,
                    activeQuestStep: this.activeQuestStep};
        };
    });
});
