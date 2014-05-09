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
 * @depends path=/resources/scripts/jquery/ui/ui.droppable.js
 * @depends template=jive.eae.activitystream.builder.*
 */
jive.ActivityStream.BuilderStreamAssociationsView = jive.AbstractView.extend(function(protect) {

    this.init = function (options) {
        var streamAssocView = this;
        streamAssocView.currentStream = options.selectedStream;
        streamAssocView.bidirectional = options.bidirectional;
        streamAssocView.droppableOptions = {
            hoverClass: "bout-to-drop",
            tolerance: 'pointer',
            activeClass: "drag-in-progress",
            drop: function(event, ui) {
                var $droppedItems = $j('#j-js-asb-results').find('.ui-multidraggable'),
                    addedItemDescriptors = [];
                $droppedItems.each(function() {
                    var item = $j(this),
                        id = item.data('id'),
                        type = item.data('objecttype'),
                        currentStreamAssocCount = item.find('.j-js-asb-search-item-assocs .j-js-specifics').data('streamids').length;

                    addedItemDescriptors.push({type: type, id: id, sc: currentStreamAssocCount});

                });
                if (addedItemDescriptors.length) {
                    streamAssocView.addItems(addedItemDescriptors);
                }
            }
        };
    };

    this.getContent = function() {
        return $j('#current-stream');
    };

    this.getContentHeader = function() {
        return $j('#stream-header');
    };

    this.getContentList = function() {
        return $j('#stream-contents');
    };

    this.postRender = function(options) {
        var streamAssocView = this,
            content = streamAssocView.getContent(),
            assocList = streamAssocView.getContentList();

        // handle drop of search results onto stream boxes
        assocList.droppable(streamAssocView.droppableOptions);

        content.delegate('.j-js-asb-search-item-assocs', 'click', function(e) {
            e.preventDefault();
            var $button = $j(this);
            // put in slight delay so that any stream name just edited can be saved server side
            setTimeout(function() {
                var $assdItem = $button.closest('.j-js-specified-item'),
                    objectType = $assdItem.data('objecttype'),
                    objectID = $assdItem.data('id'),
                    $connectionSpecificsElem = $button.find('.j-js-specifics'),
                    labelsShown = $connectionSpecificsElem.data('labelsshown'),
                    labelData = $connectionSpecificsElem.data('labeldata'),
                    removeAllAssnI18nKey = 'eae.activitystream.builder.followlink.removeall';
                if (streamAssocView.bidirectional) {
                    removeAllAssnI18nKey = 'profile.friends.remove.link';
                }

                streamAssocView.emitP('getItemAssociations', objectType, objectID).addCallback(function (streams) {
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
                                    $followCountLink = $assdItem.find('.j-js-followers-link'),
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
                                streamAssocView.emitP('removeAllAssociations', $menu.data('objecttype'), $menu.data('objectid'), appliedLabelIDs).addCallback(function () {
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

                                streamAssocView.emitP('setItemAssociations',
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
                                            if (streamID == streamAssocView.currentStream.configuration.id) {
                                                $streamsPopover.trigger('close');
                                            }
                                        }
                                    });
                            });
                        }
                    });
                });
            },100);
        });

        // handle click of stream item removal button
        content.delegate('.j-js-remove-item', 'click', function(e) {
            var $button = $j(this),
                $object = $button.closest('li.j-js-specified-item'),
                objectType = $object.data('objecttype'),
                objectID = $object.data('id');
            var itemData = streamAssocView.search(objectType, objectID),
                obj = {type: objectType,
                       id: objectID},
                streamAssociatedCount = 0,
                streamAssociatedCounts = {};
            streamAssociatedCounts[objectType+''] = {};
            if (objectType != 3) {
                streamAssociatedCount = itemData.prop.followInfo.streamsAssociatedBean.streamIDs.length;
            }
            else {
                streamAssociatedCount = itemData.prop.connections.streamsAssociatedBean.streamIDs.length;
            }
            streamAssociatedCounts[objectType+''][objectID+''] = streamAssociatedCount;
            streamAssocView.emitP('setItemAssociations', streamAssocView.currentStream.configuration.id, [obj], false, streamAssociatedCounts);
            e.preventDefault();
        });

        content.delegate('.j-js-type-toggle a', 'click', function(e) {
            var $button = $j(this),
                newType = $button.data('type');
            streamAssocView.switchView(newType);
            e.preventDefault();
        });

        // handle click of config checkboxes
        content.delegate('.j-js-emails', 'click', function(e) {
            var $link = $j(this);
            if ($link.data('selected') == true) {
                streamAssocView.currentStream.configuration.receiveEmails = false;
            }
            else {
                streamAssocView.currentStream.configuration.receiveEmails = true;
            }
            streamAssocView.emitP('updateStreamConfig', streamAssocView.currentStream.configuration).addCallback(function() {
                $link.replaceWith(jive.eae.activitystream.builder.emailOption({configuration: streamAssocView.currentStream.configuration}));
            });
            e.preventDefault();
        });

        // handle click of delete stream button
        content.delegate('.j-js-delete-stream', 'click', function(e) {
            var streamID = streamAssocView.currentStream.configuration.id,
                $modal = $j(jive.eae.activitystream.builder.deleteStreamModal({streamID: streamID}));
            $modal.lightbox_me({destroyOnClose: true, centered: true,
                onLoad:function(){
                    $modal.delegate('#stream-delete-submit-button', 'click', function(e2) {
                        var $button = $j(this),
                            streamID = $button.data('id');
                            streamAssocView.emitP('deleteStream', streamID).addCallback(function() {
                                $modal.trigger('close');
                            });
                        e2.preventDefault();
                    });
                }
            });
            e.preventDefault();
        });

        jive.switchboard.addListener('associations.destroy', function(streamViewBean) {
            if (streamViewBean.configuration.id == streamAssocView.currentStream.configuration.id) {
                streamAssocView.removeItemsFromView(streamViewBean.specifiedPeople.concat(streamViewBean.specifiedPlaces));
            }
            else {
                streamAssocView.handleSwitchboardModifies('remove', streamViewBean);
            }
        });

        jive.switchboard.addListener('associations.create', function(streamViewBean) {
            if (streamViewBean.configuration.id == streamAssocView.currentStream.configuration.id) {
                streamAssocView.addItemsToView(streamViewBean);
            }
            else {
                streamAssocView.handleSwitchboardModifies('create', streamViewBean);
            }
        });

        jive.switchboard.addListener('follow.destroy', function(obj) {
            streamAssocView.removeItemsFromView([{id: obj.objectID,
                                                  type: obj.objectType}]);
        });
    };

    this.reload = function(streamViewBean) {
        var streamAssocView = this,
            content = streamAssocView.getContent();

        content.fadeOut('fast', function() {
            streamAssocView.currentStream = streamViewBean;
            content.html(jive.eae.activitystream.builder.streamAssociationList({streamViewBean: streamViewBean}));
            content.fadeIn('fast', function() {
                streamAssocView.getContentList().droppable(streamAssocView.droppableOptions);
            });
        });
    };

    this.search = function(objectType, objectID, andRemove, replaceItem) {
        var streamAssocView = this,
            streamViewStream = streamAssocView.currentStream,
            result = false,
            i = 0;
        if (objectType == 3) {
            for (var itemsLength = streamViewStream.specifiedPeople.length; i < itemsLength; i++) {
                if (streamViewStream.specifiedPeople[i].id == objectID &&
                    streamViewStream.specifiedPeople[i].type == objectType) {
                    if (andRemove) {
                        result = streamViewStream.specifiedPeople.splice(i,1);
                    }
                    else if (replaceItem) {
                        streamViewStream.specifiedPeople[i] = replaceItem;
                        result = replaceItem;
                    }
                    else {
                        result = streamViewStream.specifiedPeople[i];
                    }
                    break;
                }
            }
        }
        else if (objectType == 600 || objectType == 700 || objectType == 14) {
            for (var itemsLength = streamViewStream.specifiedPlaces.length; i < itemsLength; i++) {
                if (streamViewStream.specifiedPlaces[i].id == objectID &&
                    streamViewStream.specifiedPlaces[i].type == objectType) {
                    if (andRemove) {
                        result = streamViewStream.specifiedPlaces.splice(i,1);
                    }
                    else if (replaceItem) {
                        streamViewStream.specifiedPlaces[i] = replaceItem;
                        result = replaceItem;
                    }
                    else {
                        result = streamViewStream.specifiedPlaces[i];
                    }
                    break;
                }
            }
        }
        return result;
    };

    this.addItems = function(itemDescriptors) {
        var streamAssocView = this,
            itemStreamCounts = {};
        for (var i = 0, itemDesciptorsLength = itemDescriptors.length; i < itemDesciptorsLength; i++) {
            var type = itemDescriptors[i].type+'',
                id = itemDescriptors[i].id+'';
            if (!itemStreamCounts[type]) {
                itemStreamCounts[type] = {};
            }
            itemStreamCounts[type][id] = itemDescriptors[i].sc;
        }
        streamAssocView.emitP('setItemAssociations', streamAssocView.currentStream.configuration.id, itemDescriptors, true, itemStreamCounts);
    };

    this.addItemsToView = function(streamViewBean) {
        var streamAssocView = this,
            content = streamAssocView.getContentList(),
            $renderedSpecifiedItem,
            newPeople = streamViewBean.specifiedPeople,
            newPlaces = streamViewBean.specifiedPlaces,
            peopleActuallyAddedCount = 0,
            placesActuallyAddedCount = 0;
        for (var i = 0, addedPeopleLength = newPeople.length; i < addedPeopleLength; i++) {
            if (!streamAssocView.search(newPeople[i].type, newPeople[i].id, false)) {
                streamAssocView.currentStream.specifiedPeople.push(newPeople[i]);
                $renderedSpecifiedItem = $j(jive.eae.activitystream.builder.specifiedObject({
                    object: newPeople[i],
                    justAdded: true
                }));
                content.find('ul.j-js-assoc-list[data-type=people]').prepend($renderedSpecifiedItem);
                var peopleCountHtml = content.find('span.j-js-people-count').first(),
                    peopleCount = parseInt(peopleCountHtml.text());
                peopleCountHtml.html(++peopleCount);
                peopleActuallyAddedCount++;
            }
        }

        for (var j = 0, addedPlacesLength = newPlaces.length; j < addedPlacesLength; j++) {
            if (!streamAssocView.search(newPlaces[j].type, newPlaces[j].id, false)) {
                streamAssocView.currentStream.specifiedPlaces.push(newPlaces[j]);
                $renderedSpecifiedItem = $j(jive.eae.activitystream.builder.specifiedObject({
                    object: newPlaces[j],
                    justAdded: true
                }));
                content.find('ul.j-js-assoc-list[data-type=places]').prepend($renderedSpecifiedItem);
                var placesCountHtml = content.find('span.j-js-places-count').first(),
                    placesCount = parseInt(placesCountHtml.text());
                placesCountHtml.html(++placesCount);
                placesActuallyAddedCount++;
            }
        }

        if (peopleActuallyAddedCount && !placesActuallyAddedCount) {
            streamAssocView.switchView('people');
        }
        else if (!peopleActuallyAddedCount && placesActuallyAddedCount) {
            streamAssocView.switchView('places');
        }

        if (peopleActuallyAddedCount || placesActuallyAddedCount) {
            streamAssocView.flashBgColor(content, 1, '#e9f3ff', 400);
        }
    };

    this.possiblyUpdateItemData = function(streamViewBean) {
        var streamAssocView = this,
            newPeople = streamViewBean.specifiedPeople,
            newPlaces = streamViewBean.specifiedPlaces;
        for (var i = 0, addedPeopleLength = newPeople.length; i < addedPeopleLength; i++) {
            streamAssocView.search(newPeople[i].type, newPeople[i].id, false, newPeople[i]);
        }
        for (var j = 0, addedPlacesLength = newPlaces.length; j < addedPlacesLength; j++) {
            streamAssocView.search(newPlaces[j].type, newPlaces[j].id, false, newPlaces[i]);
        }
    };

    this.handleSwitchboardModifies = function(action, streamViewBean) {
        var streamAssocView = this,
            content = streamAssocView.getContent(),
            items = streamViewBean.specifiedPeople.concat(streamViewBean.specifiedPlaces),
            itemsLength = items.length;

        for (var i = 0; i < itemsLength; i++) {
            var item = items[i],
                $searchResultItem = content.find('li.j-js-specified-item[data-objecttype='+item.type+'][data-id='+item.id+']');
            streamAssocView.search(item.type, item.id, false, item);
            if ($searchResultItem.length) {
                var $oldStreamAssocButtonDetails = $searchResultItem.find('.j-js-asb-search-item-assocs .j-js-specifics');
                if ($oldStreamAssocButtonDetails.length) {
                    var origStreamIDs = $oldStreamAssocButtonDetails.data('streamids'),
                        assocWithComms = $oldStreamAssocButtonDetails.data('assocwithcomms');
                    if (action == 'create') {
                        var $successMessage;
                        if ($j.inArray(streamViewBean.configuration.id, origStreamIDs) == -1) {
                            origStreamIDs.push(streamViewBean.configuration.id);
                            if (streamViewBean.configuration.source.toLowerCase() == 'communications') {
                                assocWithComms = streamViewBean.configuration.id;
                            }
                        }
                    }
                    else {
                        var index = $j.inArray(streamViewBean.configuration.id, origStreamIDs);
                        if (index != -1) {
                            origStreamIDs.splice(index, 1);
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

    this.flashBgColor = function($item, flashCount, flashColor, flashSpeed, curFlashCount) {
        var streamAssocView = this;
        if (curFlashCount == undefined) {
            curFlashCount = 0;
        }
        if (curFlashCount < flashCount) {
            var origBgColor = $item.css('background-color');
            $item.animate({backgroundColor: flashColor}, flashSpeed)
                 .animate({backgroundColor: origBgColor}, flashSpeed, null, function() {
                streamAssocView.flashBgColor($item, flashCount, flashColor, flashSpeed, curFlashCount+1);
            });
        }
        else {
            $item.css('background-color', '');
        }
    };

    this.removeItemsFromView = function(items) {
        var streamAssocView = this,
            content = streamAssocView.getContentList(),
            itemsLength = items.length;

        for (var i = 0; i < itemsLength; i++) {
            var item = items[i],
                actuallyRemoved = streamAssocView.search(item.type, item.id, true);
            if (actuallyRemoved) {
                if (item.type == 3) {
                    var peopleCountHtml = content.find('span.j-js-people-count').first(),
                        peopleCount = parseInt(peopleCountHtml.text());
                    peopleCountHtml.html(--peopleCount);
                }
                else if (item.type == 14 ||
                         item.type == 600 ||
                         item.type == 700) {
                    var placesCountHtml = content.find('span.j-js-places-count').first(),
                        placesCount = parseInt(placesCountHtml.text());
                    placesCountHtml.html(--placesCount);
                }
                content.find('li.j-js-specified-item[data-objecttype='+item.type+'][data-id='+item.id+']').remove();
            }
        }
    };

    this.switchView = function(newViewType) {
        var streamAssocView = this,
            content = streamAssocView.getContentList(),
            $button = content.find('.j-js-type-toggle a[data-type='+newViewType+']');
        if (!$button.hasClass('j-js-selected')) {
            content.find('.j-js-type-toggle a').removeClass('j-js-selected selected');
            $button.addClass('j-js-selected selected');
            content.find('ul.j-js-assoc-list:visible').hide();
            content.find('ul.j-js-assoc-list[data-type='+newViewType+']').show();
        }
    };

    this.expandToFill = function() {
        var streamAssocView = this,
            content = streamAssocView.getContentList(),
            streamElementsHeight = $j('#stream-elements').height();
        if (content.height() < streamElementsHeight) {
            content.height(streamElementsHeight);
        }
        else {
            content.css('height', '');
        }
    };
});
