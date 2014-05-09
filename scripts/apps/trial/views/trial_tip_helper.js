/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/**
 * This object is used to add a few tooltip-like notes to a particular page, if the user got to that page through
 * a quest.  Also will execute some JS on the page necessary to get the page to show up how we want it when going
 * through the trial panel workflow
 *
 * @depends path=/resources/scripts/jquery/jquery.ba-bbq.js
 * @depends template = jive.trial.quests.fewerMeetings.tips
 * @depends template = jive.trial.quests.lessEmail.tips
 * @depends template = jive.trial.quests.stayInTouch.tips
 * @depends template = jive.trial.quests.communityFeedback.tips
 */

define('jive.trial.TipHelper', [
    'jquery'
], function($) {
    return jive.AbstractView.extend(function(protect) {

        // Mixes in `addListener` and `emit` methods so that other classes can
        // listen to events from this one.
        jive.conc.observable(this);


        this.init = function(options) {
            var helper = this,
                queryParams = $j.deparam.querystring(),
                fromQuest = queryParams.fromQ,
                step = queryParams.qstep || 0;

            helper.communityName = options.communityName;
            if (fromQuest) {
                helper.setupPage(fromQuest, step);
            }
        };

        this.setupPage = function(fromQuest, step) {
            var helper = this;
            helper.emitP('shouldSetupPage', fromQuest, step).addCallback(function(shouldShow) {
                if (shouldShow || (fromQuest == '1136237887' && step == 1) || (fromQuest == '1421684247' && step == 0)) {

                    if (!shouldShow) {
                        //auto increments to the next step in any of the expection cases in the prior conditional (quest 1 and 3)
                        // for the special case of quest 3, second step (which can be auto-completed if the user
                        // does the first step correctly), attempt to move on to the 3rd step if it is ready and the
                        // user successfully skipped over the second step
                        helper.setupPage(fromQuest, parseInt(step, 10) + 1);
                    }
                    else {
                        if (fromQuest == '-1261617267') {
                            // fewer meetings
                            if (step == 0) {
                                helper.fewerMeetingsStep0(fromQuest, step);
                            }
                            else if (step == 1) {
                                helper.fewerMeetingsStep1(fromQuest);
                            }
                            else if (step == 2) {
                                helper.fewerMeetingsStep2(fromQuest);
                            }
                        } else if (fromQuest == '1136237887') {
                            // less email
                            if (step == 0) {
                                helper.lessEmailStep0(fromQuest, step);
                            }
                            else if (step == 1 && shouldShow) {
                                helper.lessEmailStep1(fromQuest, step);
                            }
                            else if ((step == 1 && !shouldShow) || step == 2) {
                                helper.lessEmailStep2();
                            }
                        } else if (fromQuest == '1836538113') {
                            // stay in touch
                            if (step == 0) {
                                helper.stayInTouchStep0(fromQuest);
                            }
                            else if (step == 1) {
                                helper.stayInTouchStep1(fromQuest);
                            }
                        } else if (fromQuest == '355022612') {
                            //community feedback discussion
                            helper.communityFeedbackTips(fromQuest);
                        } else if (fromQuest == '1421684247') {
                            // teamwork
                            if (step == 0) {
                                helper.createSocialGroupTips(fromQuest, step);
                            }
                            else if (step == 1) {
                                helper.uploadDocumentTips(fromQuest, step);
                            }
                            else if (step == 2) {
                                helper.inviteTips(fromQuest, step);
                            }
                        }
                    }
                }
            });
        };

        this.fewerMeetingsStep0 = function(fromQuest, step) {
            var helper = this;
            if ($j('#jive-compose-title').length) {
                var page = 'create-discussion';
                $j('body').addClass('j-quest-active');
                var $form = $j('#create-discussion');
                $form.append('<input type="hidden" name="fromQuest" value="'+fromQuest+'" />');
                $form.append('<input type="hidden" name="qstep" value="'+step+'" />');
                $form.append('<input type="hidden" name="markAsQuestion" value="true" />');
                $j('#jive-compose-title').prepend( $j(jive.trial.quests.fewerMeetings.tips({pageID:page, renderLocation:'subject'})));
                $j('div.jive-editor-panel').prepend($j(jive.trial.quests.fewerMeetings.tips({pageID:page, renderLocation:'body'})));
                $j('#js-all').before($j(jive.trial.quests.fewerMeetings.tips({pageID:page, renderLocation:'publishbar', communityName: helper.communityName})));
                $j('#submitButton').before($j(jive.trial.quests.fewerMeetings.tips({pageID:page, renderLocation:'post'})));
                $j('#js-all').click();
                if ($j.browser.msie && $j.browser.version < 9) {
                    $j('#js-all').change();
                }
            }
        };

        this.fewerMeetingsStep1 = function(fromQuest) {
            var helper = this;
            if ($j('ul.j-social-actions').length) {
                var page = 'view-discussion';
                $j('ul.j-social-actions').before($j(jive.trial.quests.fewerMeetings.tips({pageID:page, renderLocation:'share'})));
                jive.dispatcher.listen('trial.share.modal.loaded', function() {
                    $j('div.js_lb_overlay').addClass('j-quest-active');
                    $j('#share-users').before($j(jive.trial.quests.fewerMeetings.tips({pageID:page, renderLocation:'share.modal.users'})));
                    $j('#jive-send-content-not-message').before($j(jive.trial.quests.fewerMeetings.tips({pageID:page, renderLocation:'share.modal.message'})));
                    $j('#share-content-submit').before($j(jive.trial.quests.fewerMeetings.tips({pageID:page, renderLocation:'share.modal.submit'})));
                });
                jive.dispatcher.listen('trial.share.created', function() {
                    // post-share, waiting for a reply...
                    helper.closeTip(fromQuest);
                    helper.emit('clearActiveQuest');
                    helper.emitP('getAllQuestProgressData').addCallback(function (data) {
                        var nextQuestID = '';
                        for (var i = 0, questListLength = data.quests.length; i < questListLength; i++) {
                            if (data.quests[i].stepsComplete == 0) {
                                nextQuestID = data.quests[i].id+'';
                                break;
                            }
                        }
                        var $tip = $j(jive.trial.quests.fewerMeetings.tips({pageID:page, renderLocation:'banner', nextQuestID: nextQuestID}));
                        $j('#jive-trial-banner').after($tip);
                        $j('#jive-trial-banner').one('click', function() {
                            $j('div.js-trial-tip').remove();
                        });
                    });
                });
            }
        };

        this.fewerMeetingsStep2 = function() {
            if ($j('div.jive-thread-reply-btn-helpful').length) {
                var page = 'view-discussion';
                $j('div.jive-thread-reply-btn-helpful').first().after($j(jive.trial.quests.fewerMeetings.tips({pageID:page, renderLocation:'answer'})));
            }
        };

        this.lessEmailStep0 = function(fromQuest, step) {
            if ($j('#create-document').length) {
                var page = 'create-document',
                    $createDocForm = $j('#create-document');
                $createDocForm.append('<input type="hidden" name="fromQuest" value="'+fromQuest+'" />');
                $createDocForm.append('<input type="hidden" name="qstep" value="'+step+'" />');
                $j('body').addClass('j-quest-active');
                var $selPeopleRadio = $j('#js-people');
                $selPeopleRadio.click();
                if ($j.browser.msie && $j.browser.version < 9) {
                    $selPeopleRadio.change();
                }
                $j('#jive-compose-title').prepend( $j(jive.trial.quests.lessEmail.tips({pageID:page, renderLocation:'subject'})));
                $j('div.jive-editor-panel').prepend($j(jive.trial.quests.lessEmail.tips({pageID:page, renderLocation:'body'})));
                $selPeopleRadio.before($j(jive.trial.quests.lessEmail.tips({pageID:page, renderLocation:'publishbar'})));
                $j('#submitButton').before($j(jive.trial.quests.lessEmail.tips({pageID:page, renderLocation:'post'})));
            }
        };

        this.lessEmailStep1 = function(fromQuest, step) {
            if ($j('#jive-link-edit2 a').length) {
                var page = 'view-document';
                var $editLink = $j('#jive-link-edit2 a');
                $editLink.attr('href', $editLink.attr('href') + '&fromQ='+fromQuest+'&qstep='+step);
                var tip = $j(jive.trial.quests.lessEmail.tips({pageID:page, renderLocation:'edit'}));
                            $j(tip).popover(
                                {context: $editLink,
                                 position: 'left',
                                 darkPopover: true,
                                 destroyOnClose: false,
                                 putBack: true,
                                 addClass: 'j-qtip',
                                 closeOnClick: false});
            }
            else if ($j('#edit-document').length) {
                page = 'edit-document';
                $j('body').addClass('j-quest-active');
                var $selPeopleRadio = $j('#js-people'),
                    $skipDownTip = $j(jive.trial.quests.lessEmail.tips({pageID:page, renderLocation:'skip-down'})),
                    $preSelectTip = $j(jive.trial.quests.lessEmail.tips({pageID:page, renderLocation:'publishbar-preselect'}));
                $j('#edit-document').prepend($skipDownTip);
                $selPeopleRadio.before($preSelectTip);
                $selPeopleRadio.change(function() {
                    $skipDownTip.remove();
                    $preSelectTip.remove();
                    $selPeopleRadio.before($j(jive.trial.quests.lessEmail.tips({pageID:page, renderLocation:'publishbar'})));
                    $j('#submitButton').before($j(jive.trial.quests.lessEmail.tips({pageID:'create-document', renderLocation:'post'})));
                });
            }
        };

        this.lessEmailStep2 = function() {
            var helper = this;
            if ($j('#jive-body-main header span.jive-shared-list').length) {
                var page = 'view-document';
                var $collaboratorUserList = $j('#jive-body-main header span.jive-shared-list');
                helper.emitP('getAllQuestProgressData').addCallback(function (data) {
                    var nextQuestID = '';
                    for (var i = 0, questListLength = data.quests.length; i < questListLength; i++) {
                        if (data.quests[i].stepsComplete == 0) {
                            nextQuestID = data.quests[i].id+'';
                            break;
                        }
                    }
                    var $tip = $j(jive.trial.quests.lessEmail.tips({pageID:page, renderLocation:'collaborators', nextQuestID: nextQuestID}));
                    $j('#jive-trial-banner').one('click', function() {
                        $j('div.js-trial-tip').remove();
                    });
                    $collaboratorUserList.append($tip);
                });
            }
        };

        this.stayInTouchStep0 = function(fromQuest) {
            var tipHelper = this,
                activity_stream_mb_view = jive.ActivityStream.MBController.getMicrobloggingView();
            if (activity_stream_mb_view) {
                var page = 'all-activity';
                jive.ActivityStream.MBController.addListener('submitSuccess', function() {
                    tipHelper.closeTip(fromQuest);
                    jive.dispatcher.dispatch("trial.updatePercentComplete");
                    $j('#jive-trial-banner').after($j(jive.trial.quests.stayInTouch.tips({pageID:page, renderLocation:'banner_post_mb'})));
                    $j('#jive-trial-banner').one('click', function(e) {
                        e.preventDefault();
                        $j('div.js-trial-tip').remove();
                    });
                });
                var $mbBodyTip = $j(jive.trial.quests.stayInTouch.tips({pageID:page, renderLocation:'mb_body'}));
                $j('#statusInputs-mb-header-editor').prepend($mbBodyTip);
                var $atMentionTip = $j(jive.trial.quests.stayInTouch.tips({pageID:page, renderLocation:'at_mention_btn'})).hide();
                $j('#status-input-actions-mb-header-editor a.jive-js-mention-button').after($atMentionTip);
                activity_stream_mb_view.addListener('focus', function() {
                    $mbBodyTip.hide();
                    $atMentionTip.show();
                }).addListener('cancel', function() {
                    $mbBodyTip.show();
                    $atMentionTip.hide();
                });
            }
        };

        this.stayInTouchStep1 = function(fromQuest) {
            var helper = this;
            if ($j('#j-activity-page .j-act-header h1').length) {
                var page = 'all-activity';
                $j('#j-activity-page .j-act-header h1').after($j(jive.trial.quests.stayInTouch.tips({pageID:page, renderLocation:'stream_header'})));
                var $likeLinkHighlight = $j('<style type="text/css"> a.jive-acclaim-likelink.like{ background: #e28044; color: #fff !important; font-weight: bold; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; padding: 2px 5px; margin: -2px;} </style>');
                $likeLinkHighlight.appendTo("head");
                jive.dispatcher.listen('trial.like.created', function() {
                    helper.closeTip(fromQuest);
                    $likeLinkHighlight.remove();
                    helper.emit('clearActiveQuest');
                    $j('html, body').animate({ scrollTop: 0 }, 'fast');
                    $j('#jive-trial-banner').after($j(jive.trial.quests.stayInTouch.tips({pageID:page, renderLocation:'banner_post_like'})));
                    $j('#jive-trial-banner').one('click', function(e) {
                        e.preventDefault();
                        $j('div.js-trial-tip').remove();
                    });
                });
            }
        };

        this.communityFeedbackTips = function(fromQuest) {
            var $form = $j('#create-discussion'),
                $publicRadio = $j('#js-all'),
                $visRadios = $j('#js-publishbar-select input[type=radio]');
            if ($form.length) {
                var page = 'create-discussion';
                $j('body').addClass('j-quest-active');
                $form.append('<input type="hidden" name="markAsQuestion" value="true" />');
                $form.append('<input type="hidden" name="fromQuest" value="'+fromQuest+'" />');
                $publicRadio.click();
                if ($j.browser.msie && $j.browser.version < 9) {
                    $publicRadio.change();
                }
                $visRadios.attr('disabled', 'disabled');
                $visRadios.each(function() {
                    $j(this).attr('name', $j(this).attr('name') + '.disabled');
                });
                $publicRadio.after('<input type="hidden" name="publishBar.visibility" value="all"/>');
                $j('div.jive-editor-panel').prepend($j(jive.trial.quests.communityFeedback.tips({pageID:page, renderLocation:'body'})));
            }
        };

        this.createSocialGroupTips = function(fromQuest, step) {
            var tipHelper = this, page;
            if ($j("body.j-body-yourplaces").length) {
                page = 'places';
                $j("#jive-body").prepend($j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'body'})));
                var url = jive.app.url({path: '/create-group!input.jspa?fromQ=' + fromQuest + '&qstep=0'});
                $j("#js-teamwork-create-group-link").attr('href', url);
                jive.switchboard.addListener('sgroup.member.join', function() {
                    // step 0 is now complete, move on to step 1
                    $j('#js-teamwork-join-tip').hide();
                    tipHelper.uploadDocumentTips(fromQuest, 1);
                    jive.dispatcher.dispatch("trial.updatePercentComplete");
                });
            }
            else if ($j("#jive-link-joinSocialGroup").length) {
                page = 'place';
                var _private = false;
                if(!$j(".j-bigtab-nav").length){
                    _private = true;
                }

                var $joinSocialGroup = $j("#jive-link-joinSocialGroup").filter(':visible');
                if ($joinSocialGroup) {
                    if ($joinSocialGroup.hasClass('j-ask-join') && _private) {
                        _private = "ask-to-join";
                    }
                    else if (_private) {
                        _private = "join";
                    }
                    $joinSocialGroup.before($j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'join-link', 'private': _private})));
                    jive.switchboard.addListener('sgroup.member.join', function() {
                        // step 0 is now complete, move on to step 1
                        $j('#js-teamwork-join-tip').hide();
                        tipHelper.uploadDocumentTips(fromQuest, 1);
                        jive.dispatcher.dispatch("trial.updatePercentComplete");
                    });
                }
            }
            else if ($j("#jive-socialgroup-desc").length) {
                page = 'create-group';
                $j('body').addClass('j-quest-active');
                var $groupName = $j("#jive-socialgroup-name");
                $groupName.prepend($j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'group-name'})));
                $j("#jive-socialgroup-desc").prepend($j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'group-desc'})));
                $j("input.j-btn-callout").before($j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'submit'})));
            }
        };

        this.uploadDocumentTips = function(fromQuest, step) {
            var $uploadActionItem = $j("#jive-link-createDocument-upload"), page, $tip;

            //Viewing places browse page
            if ($j("body.j-body-yourplaces").length) {
                page = 'places';
                $tip = $j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'banner'}));
                $tip.delegate('#quest-complete-close', 'click', function(e) {
                    e.preventDefault();
                    $j('div.js-trial-tip').remove();
                });
                $j('#jive-trial-banner').after($tip);
                $j('#jive-trial-banner').one('click', function(e) {
                    e.preventDefault();
                    $j('div.js-trial-tip').remove();
                });
            }
            //Viewing Social Group you have file upload privilages on
            else if ($uploadActionItem.length) {
                $uploadActionItem.find('a').attr('href', $uploadActionItem.find('a').attr('href') + '&fromQ=' + fromQuest + '&qstep=' + step);
                page = "place";
                $tip = $j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'upload-link'}));

                $tip.find('a.j-navlink-highlight').attr('href', $uploadActionItem.find('a').attr('href'));
                $j($tip).popover(
                    {context: $uploadActionItem,
                     position: 'left',
                     darkPopover: true,
                     destroyOnClose: false,
                     putBack: true,
                     addClass: 'j-upload-tip',
                     closeOnClick: false});
            }
            //viewing Social Group you are pending privialges on
            else if($j("body.j-body-place").length){
                page = 'place';
                $tip = $j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'banner'}));
                $tip.delegate('#quest-complete-close', 'click', function(e) {
                    e.preventDefault();
                    $j('div.js-trial-tip').remove();
                });
                $j('#jive-trial-banner').after($tip);
                $j('#jive-trial-banner').one('click', function(e) {
                    e.preventDefault();
                    $j('div.js-trial-tip').remove();
                });
            }
            //Viewing document upload page
            else if ($j(".jive-create-doc").length) {
                page = "upload";
                $j('body').addClass('j-quest-active');
                $j(".jive-create-doc").prepend($j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'choose-file'})));
                $j("#js-publishbar-visibility").before($j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'choose-place'})));
                $j("#submitButton").before($j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'submit'})));
            }
        };

        this.inviteTips = function(fromQuest, step) {
            //Group Page
            if ($j('#jive-link-inviteToGroup a').length) {
                var page = "place";
                $j('#jive-link-inviteToGroup a').trigger('click');
                $j('div.js_lb_overlay').addClass('j-quest-active');
                $j('#invitees').before($j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'invite.modal.users'})));
                $j('#jive-invite-message-content').before($j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'invite.modal.message'})));
                $j('#jive-invite-button').before($j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'invite.modal.submit'})));

                $j('#jive-modal-invite').on('close', function() {
                    jive.dispatcher.dispatch("trial.updatePercentComplete");
                });
            }
            // Document Page
            else if ($j('div.doc-page').length) {
                var helper = this;
                helper.emitP('shouldSetupPage', fromQuest, step-1).addCallback(function(shouldShow) {
                    var page = "view-document";
                    //file added to correct group
                    if (!shouldShow) {
                        helper.closeTip(fromQuest);
                        var $tip = $j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'banner'}));
                        $tip.delegate('#post-upload-tip-close', 'click', function(e) {
                            e.preventDefault();
                            $j('div.js-trial-tip').remove();
                        });
                        $j('#jive-trial-banner').after($tip);
                        $j('#jive-trial-banner').one('click', function(e) {
                            e.preventDefault();
                            $j('div.js-trial-tip').remove();
                        });
                    }
                    //file added with incorrect visibility
                    else {
                        page = 'view-document';
                        var $editLink = $j('#jive-link-edit a');
                        $editLink.attr('href', $editLink.attr('href') + '?fromQ='+fromQuest+'&qstep='+(step-1));
                        var tip = $j(jive.trial.quests.teamwork.tips({pageID:page, renderLocation:'edit'}));
                            $j(tip).popover(
                                {context: $editLink,
                                 position: 'left',
                                 darkPopover: true,
                                 destroyOnClose: false,
                                 putBack: true,
                                 addClass: 'j-qtip',
                                 closeOnClick: false});
                    }
                });
            }
        };

        this.closeTip = function(fromQuest, location) {
            var selString = 'div.js-trial-tip[data-fromq='+fromQuest+']';
            if (location) {
                selString += '[data-location='+location+']';
            }
            var $tips = $j(selString);
            if ($tips.length) {
                $tips.each(function() {
                    var $tip = $j(this);
                    var $popoverContainer = $tip.closest('div.js-pop').length;
                    if ($popoverContainer.length) {
                        $popoverContainer.trigger('close');
                        $popoverContainer.remove();
                    }
                    else {
                        $tip.remove();
                    }
                });
            }
        };
    });
});
