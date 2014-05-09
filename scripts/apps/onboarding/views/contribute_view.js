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
 * @depends template=jive.onboarding.quests.contribute.*
 * @depends path=/resources/scripts/apps/shared/models/location_state.js
 */
define('jive.onboarding.ContributeView', [
    'jquery'
], function($) {
    return jive.AbstractView.extend(function(protect) {
        this.init = function(options) {
            var view = this;
            view.questID = options.questID;
            view.setupPageTips(options.queryParams, '', window.location.href);
            jive.locationState.addListener('change', view.setupPageTips.bind(view));
        };

        this.postRender = function(options) {
            var view = this;
            view.$viewHeader = $(options.selector);
            view.$viewContainer = $(options.selector+'-body');

            view.$viewContainer.on('click', '#j-contribute-step-1-trigger, #j-contribute-step-2-trigger', function(e) {
                var $step = $(this).closest('.js-quest-step');
                $('html, body').animate({ scrollTop: 0 }, 'fast');
                jive.locationState.setState({
                    fromQ: view.questID,
                    qstep: $step.data('step')}, '', 'activity');
                e.preventDefault();
            });

            var onStateUpdate = function(viewData) {
                for (var i = 0, stepsLength = viewData.quests[2].steps.length; i < stepsLength; i++) {
                    var step = viewData.quests[2].steps[i],
                        stepID = step.id,
                        $stepCompletion =
                            view.$viewContainer.find('div.js-quest-step[data-step='+stepID+'] .js-do-step');
                    if (step.state == 'completed') {
                        $stepCompletion.addClass('completed');
                    }
                }
            };
            jive.switchboard.removeListener('onboarding.state.update', onStateUpdate)
                .addListener('onboarding.state.update', onStateUpdate);
        };

        this.setupPageTips = function(params, description, url) {
            var view = this,
                fromQuest = params.fromQ,
                step = params.qstep || '1';

            if (fromQuest == view.questID) {
                if (step == '1') {
                    var postASInit = function() {
                        var commentCreated = function() {
                            view.closeTip();
                            $commentLinkHighlight.remove();
                            $('html, body').animate({ scrollTop: 0 }, 'fast');
                            var $tip = $(jive.onboarding.quests.contribute.pageTips({
                                step:step, renderLocation:'banner_post_comment'}));
                            var $body = $('body');
                            $body.append($tip);
                            $body.on('click.postConfirmationTip', function(e) {
                                var $target = $(e.target);
                                if (!$target.closest('.js-onboarding-tip').length ||
                                    $target.hasClass('js-back-to-onb')) {
                                    $body.off('click.postConfirmationTip');
                                    view.closeTip();
                                    if ($target.hasClass('js-back-to-onb')) {
                                        jive.locationState.setState({}, '', 'get-started');
                                    }
                                }
                            });
                            view.emitP('getAllQuestProgressData').addCallback(function(viewData) {
                                jive.switchboard.emit('onboarding.state.update', viewData);
                            });
                            jive.switchboard.removeListener('activity.stream.comment.created', commentCreated);

                        }
                        var $activityStreamHeader = $('#j-activity-page .j-act-header h1');
                        if ($activityStreamHeader.length) {
                            var page = 'all-activity';
                            $('body').append($(jive.onboarding.quests.contribute.pageTips({
                                step: step,
                                renderLocation:'stream_header'
                            })));
                            var $commentLinkHighlight =
                                $('<style type="text/css"> a.j-reply-micro, a.j-reply-rte { background: #e28044; ' +
                                'color: #fff !important; font-weight: bold; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; padding: 2px 5px; margin: -2px;} </style>');
                            $commentLinkHighlight.appendTo($activityStreamHeader);
                            jive.switchboard.addListener('activity.stream.comment.created', commentCreated);
                        }
                        jive.switchboard.removeListener('activity.stream.controller.initialized', postASInit);
                    }
                    jive.switchboard.addListener('activity.stream.controller.initialized', postASInit);
                }
                else if (step == '2') {
                    var postASInit = function() {
                        var $activityStreamHeader = $('#j-activity-page .j-act-header h1');
                        if ($activityStreamHeader.length) {
                            var page = 'all-activity',
                                activity_stream_mb_view = jive.ActivityStream.MBController.getMicrobloggingView();;
                            jive.ActivityStream.MBController.addListener('submitSuccess', function() {
                                view.closeTip();
                                var $tip = $(jive.onboarding.quests.contribute.pageTips({
                                    step:step, renderLocation:'banner_post_mb'}));
                                var $body = $('body');
                                $body.append($tip);
                                $body.on('click.postConfirmationTip', function(e) {
                                    var $target = $(e.target);
                                    if (!$target.closest('.js-onboarding-tip').length ||
                                        $target.hasClass('js-back-to-onb')) {
                                        $body.off('click.postConfirmationTip');
                                        view.closeTip();
                                        if ($target.hasClass('js-back-to-onb')) {
                                            jive.locationState.setState({}, '', 'get-started');
                                        }
                                    }
                                });
                                view.emitP('getAllQuestProgressData').addCallback(function(viewData) {
                                    jive.switchboard.emit('onboarding.state.update', viewData);
                                });
                            });
                            var $mbBodyTip = $(jive.onboarding.quests.contribute.pageTips({
                                step:step, renderLocation:'mb_body'}));
                            $('#statusInputs-mb-header-editor').prepend($mbBodyTip);
                            var $atMentionTip = $(jive.onboarding.quests.contribute.pageTips({
                                step:step, renderLocation:'at_mention_btn'})).hide();
                            $('#status-input-actions-mb-header-editor a.jive-js-mention-button').after($atMentionTip);
                            activity_stream_mb_view.addListener('focus', function() {
                                $mbBodyTip.hide();
                                $atMentionTip.show();
                            }).addListener('cancel', function() {
                                $mbBodyTip.show();
                                $atMentionTip.hide();
                            });
                        }
                        jive.switchboard.removeListener('activity.stream.controller.initialized', postASInit);
                    };
                    jive.switchboard.addListener('activity.stream.controller.initialized', postASInit);
                }
                else if (step == '3') {
                    if ($('#jive-compose-title').length) {
                        var page = 'create-discussion';
                        $('body').addClass('j-quest-active');
                        var $form = $('#create-discussion');
                        $form.append('<input type="hidden" name="fromQuest" value="'+view.questID+'" />');
                        $form.append('<input type="hidden" name="qstep" value="'+step+'" />');
                        $('#jive-compose-title').prepend( $(jive.onboarding.quests.contribute.pageTips({step:step, renderLocation:'create-subject'})));
                        $('div.jive-editor-panel').prepend($(jive.onboarding.quests.contribute.pageTips({step:step, renderLocation:'create-body'})));
                        $('#js-people').before($(jive.onboarding.quests.contribute.pageTips({step:step, renderLocation:'create-publishbar'})));
                        $('#submitButton').before($(jive.onboarding.quests.contribute.pageTips({step:step, renderLocation:'create-post'})));
                        $('#js-people').click();
                        if ($.browser.msie && $.browser.version < 9) {
                            $('#js-people').change();
                        }
                    }
                    else if ($('#jive-thread-messages-container').length) {
                        var page = 'view-discussion';
                        var $tip = $(jive.onboarding.quests.contribute.pageTips({step:step, renderLocation: page}));
                        $('#jive-thread-messages-container').prepend($tip);
                        var $body = $('body');
                        $body.on('click.postConfirmationTip', function(e) {
                            var $target = $(e.target);
                            if (!$target.closest('.js-onboarding-tip').length ||
                                $target.hasClass('js-back-to-onb')) {
                                $body.off('click.postConfirmationTip');
                                view.closeTip();
                                if ($target.hasClass('js-back-to-onb')) {
                                    var url = jive.app.url({ path: '/get-started'} );
                                    window.location = url;
                                }
                            }
                        });
                    }
                }
                else if (step == '4') {
                    if ($('#create-document').length) {
                        var page = 'create-document',
                            $createDocForm = $('#create-document');
                        $createDocForm.append('<input type="hidden" name="fromQuest" value="'+view.questID+'" />');
                        $createDocForm.append('<input type="hidden" name="qstep" value="'+step+'" />');
                        $('body').addClass('j-quest-active');
                        var $selPeopleRadio = $('#js-place');
                        $selPeopleRadio.click();
                        if ($.browser.msie && $.browser.version < 9) {
                            $selPeopleRadio.change();
                        }
                        $('#jive-compose-title').prepend( $(jive.onboarding.quests.contribute.pageTips({
                            step:step, renderLocation:'create-subject'})));
                        $('div.jive-editor-panel').prepend($(jive.onboarding.quests.contribute.pageTips({
                            step:step, renderLocation:'create-body'})));
                        $selPeopleRadio.before($(jive.onboarding.quests.contribute.pageTips({
                            step:step, renderLocation:'create-publishbar'})));
                        $('#submitButton').before($(jive.onboarding.quests.contribute.pageTips({
                            step:step, renderLocation:'create-post'})));
                    }
                    else if (window.location.href.indexOf('/docs/DOC') != -1) {
                        page = 'view-document';
                        $tip = $(jive.onboarding.quests.contribute.pageTips({step:step, renderLocation: page}));
                        $('div.doc-page').prepend($tip);
                        var $body = $('body');
                        $body.on('click.postConfirmationTip', function(e) {
                            var $target = $(e.target);
                            if (!$target.closest('.js-onboarding-tip').length ||
                                $target.hasClass('js-back-to-onb')) {
                                $body.off('click.postConfirmationTip');
                                view.closeTip();
                                if ($target.hasClass('js-back-to-onb')) {
                                    var url = jive.app.url({ path: '/get-started'} );
                                    window.location = url;
                                }
                            }
                        });
                    }
                }
            }

            // mark step 5 (Jive Anywhere) step complete when they go to the page and Jive Anywhere section
            // is enabled (visible)
            if (url.indexOf('tools.jspa') != -1 &&
                $('#jiveanywhere_div').length) {
                view.emit('markStepComplete', view.questID, '5');
            }
        };

        this.closeTip = function(location) {
            var view = this;
            var selString = 'div.js-onboarding-tip[data-fromq='+view.questID+']';
            if (location) {
                selString += '[data-location='+location+']';
            }
            var $tips = $(selString);
            if ($tips.length) {
                $tips.each(function() {
                    var $tip = $(this);
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
