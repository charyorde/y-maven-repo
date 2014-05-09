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
 * @depends template=jive.onboarding.quests.explore.*
 * @depends path=/resources/scripts/apps/shared/models/location_state.js
 */
define('jive.onboarding.ExploreView', [
    'jquery'
], function($) {
    return jive.AbstractView.extend(function(protect) {
        this.init = function(options) {
            var view = this;
            view.questID = options.questID;
            view.setupPageTips(options.queryParams);
            jive.locationState.addListener('change', view.setupPageTips.bind(view));
        };

        this.postRender = function(options) {
            var view = this;
            view.$viewHeader = $(options.selector);
            view.$viewContainer = $(options.selector+'-body');
            view.instanceName = options.instanceName;
            view.$viewContainer.on('click', '#j-explore-step-1-trigger', function(e) {
                view.showTourTip(0);
                e.preventDefault();
            }).on('click', '#j-explore-step-3-trigger', function(e) {
                $j('html, body').animate({ scrollTop: 0 }, 'fast');
                jive.locationState.setState({
                    fromQ: view.questID,
                    qstep: '3'}, '', 'activity');
                e.preventDefault();
            }).on('click', '#j-explore-step-5-trigger', function(e) {
                view.emitP('getStepData', view.questID, "5").addCallback(function(viewData) {
                    if (viewData.oAuthEnabled) {
                        var url = jive.app.url({ path: viewData.mobileUrl} );
                        url = $.param.querystring(url, {"fromQ": view.questID, "qstep": 5});
                        window.location = url;
                    }
                    else {
                        view.popMobileTaskModal(viewData);
                    }
                });

                e.preventDefault();
            });
            var onStateUpdate = function(viewData) {
                for (var i = 0, stepsLength = viewData.quests[1].steps.length; i < stepsLength; i++) {
                    var step = viewData.quests[1].steps[i],
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

        this.showTourTip = function(index) {
            var view = this,
                $tip = $(jive.onboarding.quests.explore.tourTip({
                    index: index,
                    instanceName: view.instanceName
                })),
                $body = $('body');
            if (index == 7) {
                view.emit('markStepComplete', view.questID, '1');
            }
            var $tourModal = $('#onboarding-tour');
            if ($tourModal.length) {
                $('#j-onb-tour-arrow').remove();
                $tourModal.html($tip.html());
                $body.removeClass('j-onb-tour-'+(index-1)+' j-onb-tour-'+(index+1));
                var $tipArrow = $tourModal.find('#j-onb-tour-arrow').detach();
                if ($tipArrow.length) {
                    var top, left, $context;
                    switch (index) {
                        case 1:
                            $context = $('#jive-nav-link-home');
                            top = $context.offset().top - 40;
                            left = $context.offset().left + $context.width() - 35;
                            $tipArrow.offset({top: top, left: left});
                            break;
                        case 2:
                            $context = $('#navCreate');
                            top = $context.offset().top - 40;
                            left = $context.offset().left + $context.width() - 35;
                            $tipArrow.offset({top: top, left: left});
                            break;
                        case 3:
                            $context = $('#jive-nav-link-activity');
                            top = $context.offset().top - 27;
                            left = $context.offset().left - 30;
                            $tipArrow.offset({top: top, left: left});
                            break;
                        case 4:
                            $context = $('#jive-nav-link-connections');
                            top = $context.offset().top - 27;
                            left = $context.offset().left - 30;
                            $tipArrow.offset({top: top, left: left});
                            break;
                        case 5:
                            $context = $('#jive-nav-link-communications');
                            top = $context.offset().top - 27;
                            left = $context.offset().left - 30;
                            $tipArrow.offset({top: top, left: left});
                            break;
                        case 6:
                            $context = $('#jive-nav-link-actions');
                            top = $context.offset().top - 22;
                            left = $context.offset().left - 30;
                            $tipArrow.offset({top: top, left: left});
                            break;
                    }
                    $('body').append($tipArrow.css('position','absolute').show());
                }
                $tourModal.off('click.pagination').on('click.pagination', '.js-prev-tip', function(e) {
                    e.preventDefault();
                    view.showTourTip(index-1);
                }).on('click.pagination', '.js-next-tip', function(e) {
                    e.preventDefault();
                    view.showTourTip(index+1);
                });
            }
            else {
                $tip.lightbox_me({
                    destroyOnClose: true,
                    modalCSS: {top: '120px'},
                    showOverlay: false,
                    onClose: function() {
                        $body.removeClass('j-onb-tour-0 j-onb-tour-1 j-onb-tour-2 j-onb-tour-3 j-onb-tour-4 j-onb-tour-5 j-onb-tour-6 j-onb-tour-7');
                        $('#j-onb-tour-arrow').remove();
                    },
                    onLoad: function() {
                        $tip.on('click.pagination', '.js-next-tip', function(e) {
                            e.preventDefault();
                            view.showTourTip(index+1);
                        });
                    }
                });
            }
            $j('html, body').animate({ scrollTop: 0 }, 'fast');
            $body.addClass('j-onb-tour-'+index);
        };

        this.setupPageTips = function(params, description, url) {
            var view = this,
                fromQuest = params.fromQ,
                step = params.qstep || '1';

            if (fromQuest == view.questID) {
                if (step == '3') {
                    var postASInit = function() {
                        var likeRecorded = function(like, objectType, objectID) {
                            if (like) {
                                view.closeTip();
                                $likeLinkHighlight.remove();
                                $j('html, body').animate({ scrollTop: 0 }, 'fast');
                                var $tip = $j(jive.onboarding.quests.explore.pageTips({step:step, renderLocation:'banner_post_like'}));
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
                                jive.switchboard.removeListener('acclaim.recorded', likeRecorded);
                            }
                        }
                        var $activityStreamHeader = $j('#j-activity-page .j-act-header h1');
                        if ($activityStreamHeader.length) {
                            var page = 'all-activity';
                            $('body').append($j(jive.onboarding.quests.explore.pageTips({
                                step: step,
                                renderLocation:'stream_header'
                            })));
                            var $likeLinkHighlight = $j('<style type="text/css"> a.jive-acclaim-likelink.like{ background: #e28044; ' +
                                'color: #fff !important; font-weight: bold; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; padding: 2px 5px; margin: -2px;} </style>');
                            $likeLinkHighlight.appendTo($activityStreamHeader);
                            jive.switchboard.addListener('acclaim.recorded', likeRecorded);
                        }
                        jive.switchboard.removeListener('activity.stream.controller.initialized', postASInit);
                    }
                    jive.switchboard.addListener('activity.stream.controller.initialized', postASInit);
                }
                else if (step == '4') {
                    if ($j("body.j-body-yourplaces").length) {
                        var page = 'places';
                        $j("#jive-body").prepend($j(jive.onboarding.quests.explore.pageTips({step:step, renderLocation:'places'})));
                        var url = jive.app.url({path: '/create-group!input.jspa'});
                        $j("#js-onboarding-create-group-link").attr('href', url);
                        jive.switchboard.addListener('sgroup.member.join', function() {
                            $j('#js-join-tip').remove();
                            var $tip = $j(jive.onboarding.quests.explore.pageTips({step:step, renderLocation:'places-success'}));
                            $j("#jive-body").prepend($tip);
                            $tip.on('click', '.js-back-to-onb', function () {
                                var url = jive.app.url({ path: '/get-started'} );
                                window.location = url;
                            });
                        });
                    }
                }
            }
        };

        this.popMobileTaskModal = function(viewData) {
            var view = this;
            var activateModal = $j(jive.onboarding.quests.explore.mobileModal({url: viewData.mobileUrl}));
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

        this.closeTip = function(location) {
            var view = this;
            var selString = 'div.js-onboarding-tip[data-fromq='+view.questID+']';
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
