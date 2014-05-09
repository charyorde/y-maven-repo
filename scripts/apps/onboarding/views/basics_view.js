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
 * @depends template=jive.onboarding.quests.basics.*
 * @depends template=jive.people.profile.streamsAssociatedCount
 * @depends path=/resources/scripts/apps/filters/view/item_grid_view.js
 * @depends path=/resources/scripts/apps/socialgroup/membership/main.js
 * @depends path=/resources/scripts/apps/follows/main.js
 * @depends path=/resources/scripts/jquery/jquery.placeheld.js
 */
define('jive.onboarding.BasicsView', [
    'jquery',
    'jive.filters.ItemGridView',
    'jive.membershipApp.Main',
    'jive.followApp.Main'
], function($, ItemGridView, MembershipApp, FollowApp) {
    return jive.AbstractView.extend(function(protect) {
        this.init = function(options) {
            var view = this;
            view.questID = options.questID;
            view.followApp = null;
        };

        this.postRender = function(options) {
            var view = this;
            view.$viewHeader = $(options.selector);
            view.$viewContainer = $(options.selector+'-body');

            view.$viewContainer.on('click', '.js-do-step', function(e) {
                var $doStepLink = $(this),
                    $stepContainer = $doStepLink.closest('.js-quest-step'),
                    stepID = $stepContainer.data('step');
                if (stepID == '1') {
                    // now static content for step 1
                    var $stepModal = $(jive.onboarding.quests.basics.stepModal({
                        step: stepID,
                        viewData: {}
                    }));
                    $stepModal.lightbox_me({
                        destroyOnClose: true,
                        centered: true,
                        onLoad: function() {
                            view.emit('markStepComplete', view.questID, stepID);
                        }
                    });
                }
                else {
                    view.emitP('getStepData', view.questID, stepID).addCallback(function(viewData) {
                        var $stepModal = $(jive.onboarding.quests.basics.stepModal({
                            step: stepID,
                            viewData: viewData
                        }));
                        if (stepID == '3' && (viewData.interests || viewData.bio)) {
                            view.prevInterestsVal = viewData.interests || "";
                            view.prevBioVal = viewData.bio || "";
                            view.saveProfileData(view.prevInterestsVal, view.prevBioVal);
                        }
                        else if (stepID == '2') {
                            var $cardContainer = $stepModal.find('#j-onb-followable-suggestions');
                            $cardContainer.delegate('a.js-create-direct-message', 'click', function(e) {
                                e.preventDefault();
                                var userID = $(this).closest('[data-object-id]').attr('data-object-id');
                                jive.DirectMessaging.sendMessageToUserIds([userID]);
                            });
                            var $cardList = $cardContainer.find('.j-browse-thumbnails');
                            $cardList.css({
                                width : (100 * viewData.suggestedPeople.length) + "%"
                            });
                            if (viewData.suggestedPeople.length > 3) {
                                view.scrollPage = 1;
                                var $scrollArrows = $stepModal.find('.j-onb-scrollarrow').show();
                                $scrollArrows.on('click', function(e) {
                                    e.preventDefault();
                                    view.scrollSuggestions($cardList, $(e.target), viewData.suggestedPeople, 3);
                                });
                            }
                        }
                        $stepModal.lightbox_me({
                            destroyOnClose: true,
                            centered: true,
                            onLoad: function() {
                                view.emit('markStepComplete', view.questID, stepID);
                                var $cardContainer = $('#j-onb-followable-suggestions');
                                if (!view.followApp) {
                                    view.followApp = new FollowApp({i18n:null});
                                }
                                view.itemGridView = new ItemGridView({
                                    baseSelector: '#j-onb-followable-suggestions',
                                    noInitVGrid: true
                                });
                                if (stepID == '3') {
                                    $('#j-onb-interests').placeHeld();
                                    $('#j-onb-bio').placeHeld();
                                    var interests = new jive.TypeaheadInput('#j-onb-interests', {
                                            delay: 500
                                        }),
                                        bio = new jive.TypeaheadInput('#j-onb-bio', {
                                            delay: 500
                                        });

                                    interests.addListener('change', view.typeAheadChangeDetected.bind(view))
                                        .addListener('clear', view.typeAheadChangeDetected.bind(view));
                                    bio.addListener('change', view.typeAheadChangeDetected.bind(view))
                                        .addListener('clear', view.typeAheadChangeDetected.bind(view));
                                }

                                $stepModal.on('click', '.js-follow-these', function(e) {
                                    e.preventDefault();
                                    var requestObjList = [];
                                    $stepModal.find('.j-thumb-back').each(function() {
                                        var $thumbBack = $(this),
                                            $followControls = $thumbBack.find('.j-js-follow-controls');
                                        if (!$followControls.length) {
                                            $followControls = $thumbBack.find('.js-follow-user-link');
                                            var $startFollow = $followControls.find('a.js-follow');
                                        }
                                        else {
                                            $startFollow = $followControls.find('.start-follow a');
                                        }
                                        if ($startFollow.length && $startFollow.css('display') != 'none') {
                                            var $card = $startFollow.closest('.js-browse-thumbnail'),
                                                objectType = $card.data('object-type'),
                                                id = $card.data('object-id'),
                                                streamsAssocCount = $followControls.data('streamsassoc');
                                            requestObjList.push({
                                                objectType: objectType,
                                                id: id,
                                                itemStreamCounts: streamsAssocCount
                                            });
                                        }
                                    });
                                    if (requestObjList.length) {
                                        view.emitP('followObjects', requestObjList, stepID).addCallback(function(dataList) {
                                            for (var i = 0, dataListLength = dataList.length; i < dataListLength; i++) {
                                                var data = dataList[i],
                                                    streams = data.streams,
                                                // every time they click the follow button, they will automatically be following the object in at least
                                                // one stream, so make sure to change the link
                                                    $thumb = $('.js-browse-thumbnail[data-object-type='+
                                                        data.associatedObjectType + '][data-object-id=' +
                                                        data.associatedObjectID + ']'),
                                                    $followControls = $thumb.find('.j-js-follow-controls');
                                                if (!$followControls.length) {
                                                    $followControls = $thumb.find('.js-follow-user-link');
                                                    var $startFollow = $followControls.find('a.js-follow'),
                                                        $followingLink = $followControls.find('a.js-following');
                                                }
                                                else {
                                                    $startFollow = $followControls.find('.start-follow a');
                                                    $followingLink = $followControls.find('.following a');
                                                }
                                                $startFollow.hide();
                                                var oldStreamsAssocCount = $followControls.data('streamsassoc');
                                                var newAssocStreamCount = 0;
                                                for (var j = 0, streamsLength = streams.length; j < streamsLength; j++) {
                                                    if (streams[j].selected) {
                                                        newAssocStreamCount++;
                                                    }
                                                }
                                                if (newAssocStreamCount != oldStreamsAssocCount) {
                                                    $followControls.data('streamsassoc', newAssocStreamCount);
                                                    $followingLink.find('.j-js-streams-assoc-count').replaceWith(jive.people.profile.streamsAssociatedCount({
                                                        count: newAssocStreamCount,
                                                        renderLocation: $followControls.data('location')
                                                    }));
                                                }
                                                $followingLink.show();
                                                if ($followControls.find('.j-js-friend-list-chooser-container')) {
                                                    $followControls.find('a.js-connection-label-btn').show();
                                                }
                                            }
                                            $stepModal.find('.js-done-following').show();
                                        });
                                    }
                                });
                            },
                            onClose: function() {
                                view.followApp.tearDown();
                                if (view.membershipApp) view.membershipApp.tearDown();
                                view.followApp = null;
                                view.membershipApp = null;
                            }
                        })
                    });
                }
                e.preventDefault();
            });
            var onStateUpdate = function(viewData) {
                for (var i = 0, stepsLength = viewData.quests[0].steps.length; i < stepsLength; i++) {
                    var step = viewData.quests[0].steps[i],
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

        this.scrollSuggestions = function($cardList, $link, items, itemsShowingCount)  {
            var view = this;
            if (!$link.hasClass('disabled') && !view.scrolling) {
                view.scrolling = true;
                var goNext = -1;
                if (!$link.hasClass('next')) {
                    goNext = 1;
                }
                view.scrollPage = view.scrollPage - goNext;
                var cardListLeft = ($cardList.find('li').first().outerWidth(true) * itemsShowingCount * (view.scrollPage - 1) * -1);
                $cardList.css({
                    "left" : cardListLeft + 'px'
                });
                if (Math.ceil(items.length / itemsShowingCount) == view.scrollPage) {
                    $('.j-onb-scrollarrow.next').addClass('disabled');
                    $('.j-onb-scrollarrow.prev').removeClass('disabled');
                }
                else if (view.scrollPage == 1) {
                    $('.j-onb-scrollarrow.next').removeClass('disabled');
                    $('.j-onb-scrollarrow.prev').addClass('disabled');
                }
                else {
                    $('.j-onb-scrollarrow.next').removeClass('disabled');
                    $('.j-onb-scrollarrow.prev').removeClass('disabled');
                }
                setTimeout(function() {view.scrolling = false;}, 500);
            }
        }

        this.typeAheadChangeDetected = function() {
            var view = this,
                $interests = $('#j-onb-interests'),
                $bio = $('#j-onb-bio'),
                interestsVal = $interests.val(),
                bioVal = $bio.val();
            if (interestsVal != view.prevInterestsVal ||
                bioVal != view.prevBioVal) {
                if (interestsVal.length > 3500) {
                    $('.j-onboarding-prof-maxchars').hide();
                    var $error = $(jive.onboarding.quests.basics.tooManyCharsError());
                    $interests.after($error);
                    $error.delay(2000).fadeOut('slow');
                }
                else if (bioVal.length > 3500) {
                    $('.j-onboarding-prof-maxchars').hide();
                    $error = $(jive.onboarding.quests.basics.tooManyCharsError());
                    $bio.after($error);
                    $error.delay(2000).fadeOut('slow');
                }
                else {
                    view.saveProfileData(interestsVal, bioVal);
                }
            }
        }

        this.saveProfileData = function(interests, bio) {
            var view = this,
                change = false;
            if (interests != view.prevInterestsVal ||
                bio != view.prevBioVal) {
                view.prevInterestsVal = interests;
                view.prevBioVal = bio;
                change = true;
            }
            var $spinner = $('#j-profile-spinner');
            $spinner.show();
            view.emitP('updateUserProfile', interests, bio).addCallback(function(data) {
                var $profileRecoSection = $('#j-onb-profile-recos'),
                    $scrollArrows = $profileRecoSection.find('.j-onb-scrollarrow'),
                    $suggestionsContainer = $profileRecoSection.find('#j-onb-followable-suggestions');
                if (data && data.suggestedPlaces && data.suggestedPlaces.length && (interests || bio)) {
                    $suggestionsContainer.html(jive.browse.grid.itemGrid({
                        itemViewID: 'thumb',
                        browseViewID: 'j-onb-followable-suggestions',
                        itemGridDetailsColumns: {},
                        hierarchyViewSupported: false,
                        items: data.suggestedPlaces
                    }));
                    view.membershipApp = new MembershipApp({});
                    if (data.suggestedPlaces.length == 1) {
                        $suggestionsContainer.find('ul.j-browse-thumbnails').append(
                            jive.onboarding.quests.basics.placeholderItem()
                        );
                    }
                    var $cardList = $suggestionsContainer.find('.j-browse-thumbnails');
                    $cardList.css({
                        width : (100 * Math.ceil(data.suggestedPlaces.length/2)) + "%"
                    });
                    $scrollArrows.off('click').on('click', function(e) {
                        e.preventDefault();
                        view.scrollSuggestions($cardList, $(e.target), data.suggestedPlaces, 2);
                    });
                    if (data.suggestedPlaces.length > 2) {
                        view.scrollPage = 1;
                        $('.j-onb-scrollarrow.next').removeClass('disabled');
                        $('.j-onb-scrollarrow.prev').addClass('disabled');
                        $scrollArrows.show();
                    }
                    else {
                        $scrollArrows.hide();
                    }
                    $profileRecoSection.fadeIn('fast');
                }
                else if (interests || bio) {
                    $scrollArrows.hide();
                    $suggestionsContainer.html(jive.onboarding.quests.basics.noSuggestions({
                        type: data.suggestedPlacesExist ? 'possibleSuggestionsExist' : 'noPossibleSuggestionsExist'
                    }));
                }
                else {
                    $scrollArrows.hide();
                    $suggestionsContainer.html(jive.onboarding.quests.basics.noSuggestions({type: 'placeholder'}));
                }
                $spinner.hide();
                if (change) {
                    $('#j-onboarding-saved').show().delay(2000).fadeOut('slow');
                }
            });
        }
    });
});
