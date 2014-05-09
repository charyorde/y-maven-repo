/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Trial');

/**
 * @depends template=jive.trial.*
 * @depends path=/resources/scripts/wistia/E-v1.js
 */
define('jive.trial.PanelView', [
    'jquery'
], function($) {
    return jive.AbstractView.extend(function(protect) {

        // Mixes in `addListener` and `emit` methods so that other classes can
        // listen to events from this one.
        jive.conc.observable(this);

        this.init = function(options) {
            var view = this;
            this.trialBannerID = "#jive-trial-banner";
            this.trialPanelID = "#jive-trial-panel";
            this.trialLoadingID = "#jive-trial-panel-loading";
            this.trialHelpLinkID = "#jive-trial-help-link";
            this.trialHelpPanelID = "#jive-trial-help-panel";

            this.trialProgress = options.trialProgress;

            var $banner = $j(view.trialBannerID),
                $panel = $j(view.trialPanelID),
                $helplink = $j(view.trialHelpLinkID),
                $helppanel = $j(view.trialHelpPanelID);

            if ($banner) {
                $banner.click(function(e) {
                    if (jive.Trial.ModalController) {
                        jive.Trial.ModalController.closeModal();
                    }
                    if ($helppanel.is('.j-active')) {
                        $j("#jive-trial-curtain, #jive-trial-help-panel").removeClass("j-active");
                        protect.setJiveHelpCopy(true);
                    }
                    if ($panel.is('.j-active')) {
                        view.closePanel();
                    }
                    else {
                        view.loadPanel();

                    }
                    e.preventDefault();
                });

                // for any links on the page that are supposed to pop the panel/quest
                $j(document).delegate('a[data-showq]', 'click', function(e) {
                    var questID = $j(this).data('showq');
                    $j('div.js-trial-tip').remove();
                    $j('html, body').animate({ scrollTop: 0 }, 'fast', null, function() {
                        view.loadPanel(questID);
                    });
                    e.preventDefault();
                });
                if (view.trialProgress.questCompletionTips.userTips.length) {
                    view.showProgressTips(view.trialProgress.questCompletionTips);
                }
                if (view.trialProgress.newProgress > 0) {
                    var $progressBarCompleted = $j('#j-trial-progress-bar-completed');
                    view.emit('saveProgress', view.trialProgress.newestItemTime);
                    view.flashProgressUpdate($progressBarCompleted, 3, view.trialProgress.newProgress);
                }
            }

            if ($helplink) {
                $helplink.click(function() {
                    $panel.is('.j-active') && view.closePanel();

                    var isActive = $helppanel.is('.j-active');
                    $j('#jive-trial-help-link').toggleClass('open', !isActive);
                    $j("#jive-trial-curtain, #jive-trial-help-panel").toggleClass('j-active', !isActive);
                    protect.setJiveHelpCopy(isActive);

                    isActive || $helplink.find('.j-js-chat-indicator').hide();

                    return false;
                });
            }

            /*
             * Live Chat
             */
            // open links in a new tab/window
            $j('#jive-trial-help-panel a').click(function(e) {
                e.preventDefault();
                window.open(this.getAttribute('href'));
            });

            // JIVE-13876 unread chat indicator
            $j('#jive-trial-help-panel iframe').load(function() {
                this.contentWindow.jQuery('body').on('onMessageToVisitor', function() {
                    if (!$j('#jive-trial-help-panel').is('.j-active')) {
                        $j('#jive-trial-help-link .j-js-chat-indicator').show();
                    }
                });
            });

            // close button
            $j('#jive-trial-help-panel .close').click(function(e) {
                e.preventDefault();
                $helplink.click();
            });
        };

        this.loadPanel = function(questID) {
            var view = this,
                $panel = $j(view.trialPanelID);
            view.emitP('loadPanel').addCallback(function(data) {
                if (questID) {
                    data.lastViewedQuest = null;
                }
                $panel.empty().append(jive.trial.panel({data: data}));
                view.initPanelJavascript(data);
                $j("#jive-trial-curtain, #jive-trial-panel, #jive-trial-banner").addClass("j-active");
                if (questID) {
                    $j("div.j-goal-nav a[data-questname="+questID+"]").click();
                }
            });
        };

        this.closePanel = function() {
            var view = this,
                $panel = $j(view.trialPanelID);
            $j("#jive-trial-curtain, #jive-trial-panel, #jive-trial-banner").removeClass("j-active");
            view.videoTeardown();
            $panel.empty();
        };

        this.initPanelJavascript = function(data) {
            var view = this,
                gallery = $j(".j-panel.trial .j-goal-container"),
                figContainer = $j(".j-goals", gallery),
                figures = $j("div.section", gallery),
                galLength = figures.length,
                figSize = 100;

            if (galLength > 0) {
                // initiate
                view.trialVideos = [];
                view.trialVideos.push(Wistia.embed("6f7950d404", {
                      videoWidth: "570",
                      videoHeight: "365",
                      controlsVisibleOnLoad: true
                }));
                view.trialVideos.push(Wistia.embed("b8c47e6cac", {
                      videoWidth: "570",
                      videoHeight: "365",
                      controlsVisibleOnLoad: true
                }));
                view.trialVideos.push(Wistia.embed("a26f53f98e", {
                      videoWidth: "570",
                      videoHeight: "365",
                      controlsVisibleOnLoad: true
                }));
                view.trialVideos.push(Wistia.embed("9a4efbeb33", {
                      videoWidth: "570",
                      videoHeight: "365",
                      controlsVisibleOnLoad: true
                }));
                figContainer.css({
                    width : (100 * galLength) + "%"
                });
                figures.css({
                    width : (100 / galLength) + "%"
                });
                if (data.lastViewedQuest) {
                    var $navLink = $j("div.j-goal-nav").find('a[data-questname='+data.lastViewedQuest+']');
                    var lIndex = $navLink.parent("li").index();
                    view.goToPane(lIndex, figContainer, figSize);
                }
                $j("div.j-goal-nav").delegate("a", "click", function(e) {
                    var lIndex = $j(this).parent("li").index();
                    view.goToPane(lIndex, figContainer, figSize);
                    view.pauseVideos();
                    $j(".j-active", $j(".j-goal-nav")).removeClass("j-active");
                    $j(this).parent("li").addClass("j-active");
                    view.emit("saveLastViewedQuest", $j(this).data('questname')+"");
                    e.preventDefault();
                });

                $j('div.j-quest-tasks').delegate('li.j-available', 'click', function(e) {
                    if (!$j(e.target).is("a")){//this allows links to be embedded in a step
                        e.preventDefault();
                        var $stepAction = $j(this).data('stepaction');
                        if ($stepAction) {
                            switch($stepAction) {
                                case "mobile_modal":
                                    view.popMobileTaskModal();
                                    break;
                                default:
                                    window.location = $stepAction;
                            }
                        }
                    }
                }).delegate('a.j-js-show-grouped-users', 'click', function(e) {
                    var $otherUsersLink = $j(this),
                        $otherUsersMenu = $j('div.j-js-grouped-users[data-linkedID=' + $otherUsersLink.attr('data-linkedID') + ']');
                    $otherUsersMenu.popover({context: $otherUsersLink, destroyOnClose: false});
                    $otherUsersMenu.closest('div.js-pop').css({'z-index': 1004});

                    e.preventDefault();
                });
            }

            $j(document).bind('click.trialPanelOpen', function(e) {
                var $target = $j(e.target);
                if (!$target.closest('#jive-trial-panel').length &&
                    // person tooltips
                    !$target.closest('div.jive-tooltip2').length &&
                    // grouped users popover
                    !$target.closest('div.js-pop').length &&
                    // mobile modal
                    !$target.closest('div.jive-modal').length &&
                    !$target.closest('div.js_lb_overlay').length) {
                    view.closePanel();
                    $j(document).unbind('click.trialPanelOpen');
                }
            });
        };

        this.pauseVideos = function() {
            var view = this,
                videoListLength = view.trialVideos.length;
            for (var i = 0; i < videoListLength; i++) {
                view.trialVideos[i].pause();
            }
        };

        this.videoTeardown = function() {
            var view = this,
                videoListLength = view.trialVideos.length;
            for (var i = 0; i < videoListLength; i++) {
                view.trialVideos[i].remove();
            }
        };

        this.goToPane = function goToPane(paneIndex, figContainer, figSize) {
            figContainer.css({
                "left" : -(figSize * ($j(this.trialPanelID + ' div.section').eq(paneIndex).index())) + "%"
            });
            var $navItem = $j(this.trialPanelID + ' div.j-goal-nav li').eq(paneIndex),
                $arrow = $j(this.trialPanelID + ' span.selectedArrow');
            $arrow.css({
                "left" : $navItem.position().left + ($navItem.width() / 2) - ($arrow.width()/2) + 'px'
            });
        };

        this.updateProgressBar = function(data) {
            var view = this,
                $progressBarContainer = $j('#jive-trial-banner div.j-progress-bar-container'),
                $progressBarCompleted = $j('#j-trial-progress-bar-completed');
            view.emit('saveProgress', data.newestItemTime);
            if ($progressBarCompleted.is(':animated')) {
                $progressBarCompleted.stop().clearQueue();
            }
            $progressBarContainer.data('currentprogress', data.currentProgress);
            $progressBarContainer.find('.js-displayed-percent').text(data.currentProgress + '%');
            $progressBarCompleted.title = data.currentProgress;
            if (data.questCompletionTips.userTips.length) {
                view.showProgressTips(data.questCompletionTips);
            }
            view.flashProgressUpdate($progressBarCompleted, 3, data.newProgress);
        };

        this.flashProgressUpdate = function($item, flashCount, delta, curFlashCount) {
            var view = this;
            if (curFlashCount == undefined) {
                curFlashCount = 0;
            }
            var origWidth = $item.width();
            var stepWidth = Math.round($item.closest('.j-index-holder').width()*(delta/100));
            if (curFlashCount < flashCount) {
                $item.delay(400).animate({width: '+='+stepWidth}, 0).delay(400).animate({width: '-='+stepWidth}, 0, null, function() {
                    view.flashProgressUpdate($item, flashCount, delta, curFlashCount+1);
                });
            }
            else {
                $item.width(origWidth+stepWidth);
            }
        };

        this.showProgressTips = function(questCompletionTips) {
            var view = this,
                nextQuestID = null;
            if (questCompletionTips.userTips.length) {
                $j('div.js-trial-tip').remove();
                for (var i = 0, questListLength = questCompletionTips.questCompletionData.length; i < questListLength;
                        i++) {
                    if (!questCompletionTips.questCompletionData[i].completed) {
                        nextQuestID = questCompletionTips.questCompletionData[i].questID;
                        break;
                    }
                }
            }
            for (i = 0, tipsLength = questCompletionTips.userTips.length; i < tipsLength; i++) {
                if (questCompletionTips.userTips[i] != 'jive.trial.quests.fewerMeetings.questReadyToComplete' || tipsLength == 1) {
                    // suppress the "done waiting" tip if other tips are in the queue
                    var $tip = $j(jive.trial.renderProgressTip({'template':questCompletionTips.userTips[i],'nextQuestID':nextQuestID}));
                    $tip.delegate('#quest-complete-close', 'click', function(e) {
                        e.preventDefault();
                        $j('div.js-trial-tip').remove();
                    });
                    $j(view.trialBannerID).after($tip);
                    view.emit('clearUserTipQueue');
                }
            }
            $j('html, body').animate({ scrollTop: 0 }, 'fast');
            $j(view.trialBannerID).one('click', function() {
                $j('div.js-trial-tip').remove();
            });
        };

        this.popMobileTaskModal = function() {
            var view = this;

            var activateModal = $j(jive.trial.quests.stayInTouch.mobileModal({}));
            var opts = {
                closeSelector: ".close",
                modalCSS: {top: '100px'},
                destroyOnClose: true
            };
            activateModal.lightbox_me(opts);
            activateModal.delegate(".js-qr-code-whats-this", "click", function(event) {
                event.preventDefault();
                if (view.whatsThisVisible) {
                    view.hideWhatsThisMessage();
                } else {
                    view.showWhatsThisMessage($j(this));
                }
            });
        };

        /**
         * @param {boolean} inDefaultState if true, sets copy of Jive Help menu back to it's default state. If false, sets it to its active state.
         */
        protect.setJiveHelpCopy = function(inDefaultState) {
            var copy = inDefaultState ? jive.trial.openHelp() : jive.trial.closeHelp();
            $j('#jive-trial-help-link .j-js-title').text(copy);
        };

        protect.showWhatsThisMessage = function($link) {
            var self = this;
            this.whatsThisVisible = true;
            $j("#js-qr-code-whats-this").popover({
                context:$link,
                destroyOnClose:false,
                onClose: function() {
                    self.whatsThisVisible = false;
                }
            });
        };

        protect.hideWhatsThisMessage = function() {
            $j("#js-qr-code-whats-this").trigger("close");
        };
    });
});
