/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ActivityStream');

/**
 *
 * @extends jive.AbstractView
 *
 * @depends template=jive.eae.activitystream.builder.*
 * @depends template=jive.shared.breadcrumb.contextPopover
 * @depends template=jive.soy.acclaim.renderAcclaimModal
 * @depends path=/resources/scripts/jquery/ui/ui.selectable.js
 * @depends path=/resources/scripts/jquery/ui/ui.multidraggable.js
 */
jive.ActivityStream.BuilderSearchResultsView = jive.AbstractView.extend(function(protect) {
    this.init = function (options) {
        var searchResultsView = this;

        searchResultsView.ie7 = $j.browser.msie && $j.browser.version < 8;
        if (searchResultsView.ie7) {
            $j(document).unbind('selectstart.draggable').bind('selectstart.draggable', function(e) {
                if (searchResultsView.resizingList) {
                    e.preventDefault();
                }
            });
        }

        searchResultsView.followerPageCount = 20;
        searchResultsView.cancelSelectClasses = '.j-js-asb-search-item-assocs, .j-js-add-to-current, .j-js-breadcrumb-button, .j-js-followers-link';
        searchResultsView.MULTIDRAG_OPTIONS = {
            cancel: searchResultsView.cancelSelectClasses,
            revert: false,
            distance: (searchResultsView.ie7 ? 0 : 50),
            opacity: 1.0,
            zIndex: 5000,
            helper: function() {
                return jive.eae.activitystream.builder.jsDraggableHelper({count: searchResultsView.getContent().find('.ui-multidraggable').length});
            },
            cursorAt: {bottom: 35, left: -20},
            start: function(e) {
                searchResultsView.resizingList = true;
            },
            stop: function(e) {
                searchResultsView.resizingList = false;
            }
        };
        searchResultsView.selectedStream = options.selectedStream;
        searchResultsView.approvalsEnabled = options.approvalsEnabled;
        searchResultsView.bidirectional = options.bidirecitonal;

    };

    this.getContent = function() {
        return $j('#j-js-asb-results');
    };

    this.postRender = function() {
        var searchResultsView = this,
            content = searchResultsView.getContent();

        searchResultsView.$suggestionsPage = $j('#j-asb-suggested');
        searchResultsView.$peoplePlacesPage = $j('#j-asb-people-places');
        searchResultsView.$peopleSection = searchResultsView.$peoplePlacesPage.find('.j-js-people-results');
        searchResultsView.$placesSection = searchResultsView.$peoplePlacesPage.find('.j-js-places-results');

        jive.switchboard.addListener('associations.destroy', function(streamViewBean) {
            searchResultsView.handleSwitchboardModifies('remove', streamViewBean);
        });

        jive.switchboard.addListener('associations.create', function(streamViewBean) {
            searchResultsView.handleSwitchboardModifies('create', streamViewBean);
        });

        jive.switchboard.addListener('follow.destroy', function(obj) {
            searchResultsView.handleSwitchboardFollows('remove', obj);
        });

        jive.switchboard.addListener('follow.create', function(obj) {
            searchResultsView.handleSwitchboardFollows('create', obj);
        });

        jive.switchboard.addListener('follow.user', function(obj) {
            searchResultsView.handleSwitchboardFollows('create', {objectType: 3, objectID: obj.id});
        });

        // Looks to be correctly handled by follow.destroy
//        jive.switchboard.addListener('unfollow.user', function(obj) {
//            searchResultsView.handleSwitchboardFollows('remove', {objectType: 3, objectID: obj.id});
//        });

        content.delegate('.j-js-followers-link', 'click', function(e) {
            e.stopPropagation();
            var $button = $j(this),
                $searchResult = $button.closest('.j-js-search-result'),
                objectType = $searchResult.data('objecttype'),
                objectID = $searchResult.data('id'),
                params = {activityType: 'follow',
                          objectType: objectType,
                          objectID: objectID,
                          count: searchResultsView.followerPageCount,
                          start: 0};
            searchResultsView.emitP('getFollowersData', params).addCallback(function (data) {
                var soyParams = searchResultsView.buildSoyParams(data, params),
                    $followers = searchResultsView.renderFollowersModal(soyParams),
                    options = {
                        destroyOnClose : true,
                        centered       : true
                    },
                $followerModal = $followers.lightbox_me(options);
                // attach endless scroll
                $followerModal.find('.jive-modal-content').endlessScroll({
                    fireDelay : false,
                    callback  : function(i) {
                        if (soyParams.moreResults) {
                            params.start = searchResultsView.followerPageCount * i;
                            searchResultsView.emitP('getFollowersData', params).addCallback(function(userData) {
                                searchResultsView.appendUsersToFollowersModal($followerModal, userData, soyParams);
                            });
                        }
                    }
                });
            });
            e.preventDefault();
        });

        content.delegate('.j-js-asb-search-item-assocs', 'click', function(e) {
            e.preventDefault();
            var $button = $j(this);
            // put in slight delay so that any stream name just edited can be saved server side
            setTimeout(function() {
                var $searchResult = $button.closest('.j-js-search-result'),
                    objectType = $searchResult.data('objecttype'),
                    objectID = $searchResult.data('id'),
                    $connectionSpecificsElem = $button.find('.j-js-specifics'),
                    labelsShown = $connectionSpecificsElem.data('labelsshown'),
                    labelData = $connectionSpecificsElem.data('labeldata'),
                    removeAllAssnI18nKey = 'eae.activitystream.builder.followlink.removeall';
                    if (searchResultsView.bidirectional) {
                        removeAllAssnI18nKey = 'profile.friends.remove.link';
                    }

                searchResultsView.emitP('getItemAssociations', objectType, objectID).addCallback(function (streams) {
                    var $streamsPopover = $j(jive.eae.activitystream.builder.followInStreamsMenu({
                        objectType: objectType,
                        objectID: objectID,
                        streams: streams,
                        removeAllAssnI18nKey: removeAllAssnI18nKey
                    }));
                    $streamsPopover.popover({
                        context: $button,
                        destroyOnClose: true,
                        putBack: false,
                        closeOtherPopovers: true,
                        closeOnClickSelector: ':not(.j-js-asb-search-item-assocs)',
                        onLoad: function() {
                            $streamsPopover.delegate('a.j-js-remove-all-assns', 'click', function(e) {
                                var $streamLink = $j(this),
                                    $menu = $streamLink.closest('.j-js-follow-in-streams-menu'),
                                    $followCountLink = $searchResult.find('.j-js-followers-link'),
                                    labelsShown = $followCountLink.data('labelsshown'),
                                    labelData = $followCountLink.data('labeldata');
                                //pass along selected labels, for users, if applicable
                                var appliedLabelIDs = [];
                                if (labelsShown && labelData && labelData.length) {
                                    for (var i = 0, labelsLength = labelData.length; i < labelsLength; i++) {
                                        if (labelData[i].targetUserAMember) {
                                            appliedLabelIDs.push(labelData[i].id);
                                        }
                                    }
                                }
                                searchResultsView.emitP('removeAllAssociations', $menu.data('objecttype'), $menu.data('objectid'), appliedLabelIDs).addCallback(function () {
                                    $streamsPopover.trigger('close');
                                });
                                e.preventDefault();
                            });
                            $streamsPopover.delegate('input', 'change', function(e) {
                                var $checkbox = $j(this),
                                    $connectionSpecificsElem = $button.find('.j-js-specifics'),
                                    currentNumStreamsAssoc = $connectionSpecificsElem.data('streamids').length,
                                    streamID = $checkbox.val(),
                                    checked = $checkbox.is(":checked"),
                                    currentNumStreamsAssocData = {};
                                    currentNumStreamsAssocData[objectType] = {};
                                    currentNumStreamsAssocData[objectType][objectID] = currentNumStreamsAssoc;

                                searchResultsView.emitP('setItemAssociations',
                                                        streamID,
                                                        [{type:objectType, id:objectID}],
                                                        checked,
                                                        currentNumStreamsAssocData
                                                        ).addCallback(function() {
                                        if (checked) {
                                            $checkbox.closest('label').addClass('selected');
                                        }
                                        else {
                                            $checkbox.closest('label').removeClass('selected');
                                        }
                                    });
                            });
                        }
                    });
                });
            },100);
        });

        $j('#stream-elements').delegate('.j-js-add-to-current', 'click', function(e) {
            var $button = $j(this),
                $selectedItems = $button.closest('.j-js-search-result'),
                objList = [],
                currentNumStreamsAssocData = {},
                objectType,
                objectID,
                currentStreamAssocCount;

            for (var i = 0, itemsLength = $selectedItems.length; i < itemsLength; i++) {
                var $searchResult = $j($selectedItems[i]);
                objectType = $searchResult.data('objecttype'),
                objectID = $searchResult.data('id'),
                currentStreamAssocCount = $searchResult.find('.j-js-asb-search-item-assocs .j-js-specifics').data('streamids').length;
                objList.push({type:objectType, id:objectID});
                currentNumStreamsAssocData[objectType] = {};
                currentNumStreamsAssocData[objectType][objectID] = currentStreamAssocCount;
            }
            if (objList.length) {
                searchResultsView.emitP('setItemAssociations',
                                        null,
                                        objList,
                                        true,
                                        currentNumStreamsAssocData).addCallback(function() {});
            }
            e.preventDefault();
        });

        content.delegate(searchResultsView.cancelSelectClasses, 'mousedown', function(e){
            e.stopPropagation();
        });
        content.delegate('li.j-js-draggable', 'mousedown', function(e){
            $j(e.currentTarget).addClass('mousingdown');
        });
        content.delegate('li.j-js-draggable', 'mouseup', function(e){
            $j(e.currentTarget).removeClass('mousingdown');
        });
        content.delegate('li.j-js-draggable', 'click', function(e){
            e.preventDefault();
        });


        content.find('li.j-js-draggable').multidraggable(searchResultsView.MULTIDRAG_OPTIONS);
    };

    this.renderFollowersModal = function(soyParams) {
        return $j(jive.soy.acclaim.renderAcclaimModal(soyParams));
    };

    this.buildSoyParams = function(userData, params) {
        return {
            activityType       : params.activityType,
            bidirectionalGraph : userData.bidirectionalGraph,
            currentUserID      : userData.currentUserID,
            currentUserPartner : userData.currentUserPartner,
            moreResults        : userData.moreResults,
            objectID           : params.objectID,
            objectType         : params.objectType,
            totalCount         : userData.totalCount,
            users              : userData.items,
            youID              : userData.currentUserID,
            youPartner         : userData.currentUserPartner
       };
    };

    this.appendUsersToFollowersModal = function($modal, userData, soyParams) {
        var users = userData && userData.items ? userData.items : [];
        if (users.length > 0) {
            $modal.find('.j-js-private-bookmark-notification').remove();
            //grab rows from rendered table with same id as the currently visible table
            var $tbody = $modal.find('.jive-modal-content tbody:visible');
            var tableId = $tbody.parent().attr('id');
            var $renderedModal = this.renderFollowersModal($j.extend({}, soyParams, { users: users }));
            var $rows = $renderedModal.find('table#' + tableId + ' tr');
            $tbody.append($rows.clone());
        }
    };

    this.handleSwitchboardModifies = function(action, streamViewBean) {
        var searchResultsView = this,
            content = searchResultsView.getContent(),
            items = streamViewBean.specifiedPeople.concat(streamViewBean.specifiedPlaces),
            itemsLength = items.length;

        for (var i = 0; i < itemsLength; i++) {
            var item = items[i],
                $searchResultItem = content.find('li.j-js-search-result[data-objecttype='+item.type+'][data-id='+item.id+']:visible');
            if ($searchResultItem.length) {
                var $oldStreamAssocButtonDetails = $searchResultItem.find('.j-js-asb-search-item-assocs .j-js-specifics');
                if ($oldStreamAssocButtonDetails.length) {
                    var origStreamIDs = $oldStreamAssocButtonDetails.data('streamids'),
                        assocWithComms = $oldStreamAssocButtonDetails.data('assocwithcomms');
                    if (action == 'create') {
                        var $successMessage;
                        if ($j.inArray(streamViewBean.configuration.id, origStreamIDs) == -1) {
                            origStreamIDs.push(streamViewBean.configuration.id);
                            if (searchResultsView.selectedStream.configuration.id == streamViewBean.configuration.id) {
                                $searchResultItem.addClass('j-in-current-stream');
                            }
                            if (streamViewBean.configuration.source.toLowerCase() == 'communications') {
                                assocWithComms = streamViewBean.configuration.id;
                            }
                            $successMessage = $j(jive.eae.activitystream.builder.jsAddBtnSuccessMessage({type: 'new'}));
                        }
                        else {
                            $successMessage = $j(jive.eae.activitystream.builder.jsAddBtnSuccessMessage({type: 'repeat'}));
                        }
                        if (searchResultsView.selectedStream.configuration.id == streamViewBean.configuration.id) {
                            $searchResultItem.find('.j-js-add-to-current').after($successMessage);
                            $successMessage.slideDown('fast').delay(2000).slideUp('fast', function() {
                                $j(this).remove();
                            });
                        }
                    }
                    else {
                        var index = $j.inArray(streamViewBean.configuration.id, origStreamIDs);
                        if (index != -1) {
                            origStreamIDs.splice(index, 1);
                            if (searchResultsView.selectedStream.configuration.id == streamViewBean.configuration.id) {
                                $searchResultItem.removeClass('j-in-current-stream');
                            }
                            if (streamViewBean.configuration.source.toLowerCase() == 'communications') {
                                assocWithComms = 0;
                            }
                        }
                    }
                    var newConnectionInfo = {streamsAssociatedBean: {associatedWithCommunications: assocWithComms,
                                                                     streamIDs: origStreamIDs}};
                    $oldStreamAssocButtonDetails.replaceWith(
                        jive.eae.activitystream.builder.streamsAssociatedButtonDetails(
                            {connectionData: newConnectionInfo}));
                }
            }
        }
    };

    this.handleSwitchboardFollows = function(action, obj) {
        var searchResultsView = this,
            content = searchResultsView.getContent(),
            $searchResultItem = content.find('li.j-js-search-result[data-objecttype='+obj.objectType+'][data-id='+obj.objectID+']:visible');
        if ($searchResultItem.length) {
            var $followCountLink = $searchResultItem.find('.j-js-followers-link');
            if ($followCountLink.length) {
                var oldCount = $followCountLink.data('activity-count');
                if (action == 'create' && (obj.objectType != 3 || obj.objectID != window._jive_current_user.ID)) {
                    $followCountLink.data('activity-count', oldCount+1);
                    $followCountLink.html(''+(oldCount+1));
                    $followCountLink.data('following', true);
                }
                else {
                    if ($followCountLink.data('following') && (obj.objectType != 3 || obj.objectID != window._jive_current_user.ID)) {
                        $followCountLink.data('following', false);
                        $followCountLink.data('activity-count', oldCount-1);
                        $followCountLink.html(''+(oldCount-1));
                        if (obj.objectType == 3) {
                            // this is a full relationship break with the user, need to possibly disable item
                            if (searchResultsView.approvalsEnabled) {
                                $searchResultItem.removeClass().addClass('j-disabled');
                            }
                        }
                    }
                    $searchResultItem.find('.j-js-asb-search-item-assocs').html(
                        jive.eae.activitystream.builder.streamsAssociatedButtonDetails({
                            connectionData: {
                                streamsAssociatedBean: {
                                    streamIDs: [],
                                    associatedWithCommunications: false
                                }
                            }
                        })
                    );
                    $searchResultItem.removeClass('j-in-current-stream');
                }
            }
        }
    };

    this.updateResults = function(data, options) {
        var searchResultsView = this,
            searchType = options.type;
        if (searchType == 'suggested') {
            var $newSuggestionsView = $j(jive.eae.activitystream.builder.suggestedView({
                currentStreamID: searchResultsView.selectedStream.configuration.id,
                allResults: data}));
            searchResultsView.$suggestionsPage.html($newSuggestionsView);
            searchResultsView.$suggestionsPage.find('li.j-js-draggable')
                .click(function(e){e.preventDefault()})
                .multidraggable(searchResultsView.MULTIDRAG_OPTIONS);
            if (!searchResultsView.$suggestionsPage.is(':visible')) {
                searchResultsView.$suggestionsPage.show();
                searchResultsView.$peoplePlacesPage.hide();
            }
        }
        else {
            var items = [],
                $newResultItems,
                hasMore = false;
            if (searchType == 'people-places' &&
                (data.people.length == 0 || (data.people.length == 1 && data.people[0].id == window._jive_effective_user_id)) &&
                data.places.length == 0 &&
                options.start == 0 &&
                options.value == '' &&
                options.subfilters.people == 'all' &&
                options.subfilters.places == 'all') {
                // no results returned on a full browse search, show "no results" copy
                searchResultsView.$peoplePlacesPage.find('#people-places-search-results').hide();
                searchResultsView.$peoplePlacesPage.find('.j-notmuch-here').show();
            }
            else {
                if (searchType == 'people' || searchType == 'people-places') {
                    items = data.people;
                    if (items.length > options.maxResults) {
                        hasMore = true;
                        items.splice(options.maxResults, 1);
                    }
                    // remove old Show More link, if there is one.  New one will be created, if applicable
                    searchResultsView.$peopleSection.find('.j-js-show-more-results').remove();

                    if (options.start != 0) {
                        $newResultItems = $j(jive.eae.activitystream.builder.searchResultItems({
                            currentStreamID: searchResultsView.selectedStream.configuration.id,
                            items: items}));
                        searchResultsView.$peopleSection.find('ul').append($newResultItems);
                    }
                    else {
                        $newResultItems = $j(jive.eae.activitystream.builder.searchResultsSection({
                            currentStreamID: searchResultsView.selectedStream.configuration.id,
                            type: 'people',
                            items: items}));
                        searchResultsView.$peopleSection.html($newResultItems);
                    }
                    if (hasMore) {
                        searchResultsView.$peopleSection.append(jive.eae.activitystream.builder.showMoreResultsButton({type: 'people'}));
                    }
                    searchResultsView.$peopleSection.find('li.j-js-draggable')
                        .click(function(e){e.preventDefault()})
                        .multidraggable(searchResultsView.MULTIDRAG_OPTIONS);

                }
                if (searchType == 'places' || searchType == 'people-places') {
                    hasMore = false;
                    items = data.places;
                    if (items.length > options.maxResults) {
                        hasMore = true;
                        items.splice(options.maxResults, 1);
                    }
                    // remove old Show More link, if there is one.  New one will be created, if applicable
                    searchResultsView.$placesSection.find('.j-js-show-more-results').remove();

                    if (options.start != 0) {
                        $newResultItems = $j(jive.eae.activitystream.builder.searchResultItems({
                            currentStreamID: searchResultsView.selectedStream.configuration.id,
                            items: items}));
                        searchResultsView.$placesSection.find('ul').append($newResultItems);
                    }
                    else {
                        $newResultItems = $j(jive.eae.activitystream.builder.searchResultsSection({
                            currentStreamID: searchResultsView.selectedStream.configuration.id,
                            type: 'places',
                            items: items}));
                        searchResultsView.$placesSection.html($newResultItems);
                    }
                    if (hasMore) {
                        searchResultsView.$placesSection.append(jive.eae.activitystream.builder.showMoreResultsButton({type: 'places'}));
                    }
                    searchResultsView.$placesSection.find('li.j-js-draggable')
                        .click(function(e){e.preventDefault()})
                        .multidraggable(searchResultsView.MULTIDRAG_OPTIONS);
                }
                searchResultsView.$peoplePlacesPage.find('.j-notmuch-here').hide();
                searchResultsView.$peoplePlacesPage.find('#people-places-search-results').show();
            }
            if (!searchResultsView.$peoplePlacesPage.is(':visible')) {
                searchResultsView.$suggestionsPage.hide();
                searchResultsView.$peoplePlacesPage.show();
            }
        }
    };

    this.updateSelectedStream = function(selectedStream) {
        var searchResultsView = this;
        searchResultsView.selectedStream = selectedStream;
        searchResultsView.getContent().find('li.j-js-draggable').each(function() {
            var $searchResult = $j(this);
            $searchResult.removeClass('j-in-current-stream');
            if ($j.inArray(selectedStream.configuration.id, $searchResult.find('.j-js-specifics').data('streamids')) != -1) {
                $searchResult.addClass('j-in-current-stream');
            }
        });
    };

    this.clearSelections = function() {
        var searchResultsView = this,
            content = searchResultsView.getContent();
        content.find('li.j-js-draggable').removeClass('ui-selected ui-multidraggable push mousingdown');
    };
});
