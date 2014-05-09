/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends path=/resources/scripts/apps/activity_stream/views/stream_list_common_view.js
 * @depends path=/resources/scripts/apps/activity_stream/views/activity_stream_item_view.js
 * @depends path=/resources/scripts/jquery/jquery.trash.js
 * @depends template=jive.eae.activitystream.activityStreamList
 * @depends template=jive.eae.activitystream.maxPagesReached
 * @depends template=jive.eae.activitystream.streamMarkup
 * @depends template=jive.eae.activitystream.updatedMarker
 * @depends template=jive.eae.activitystream.newUpdates
 */
jive.namespace('ActivityStream');

jive.ActivityStream.ActivityStreamListView = jive.ActivityStream.StreamListCommonView.extend(function(protect, _super) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    this.init = function (options) {
        var streamList = this;
        _super.init.call(this, options);
        this.rteOptions = options.rteOptions;
        this.earliestItemParentTime = 0;
        this.touchmoving = false;
        this.updateCount = 0;
        this.ie7 = $j.browser.msie && $j.browser.version < 8;
        this.connectionsInfoClosed = options.connectionsInfoClosed;
        this.infoType = options.infoType;
        this.infoUser = options.infoUser;
        this.streamType = options.streamType;

        this.loadMoreInProgress = false;
        this.autoLoadMoreTimesLeft = 4;
        this.autoLoadPxHeight = 1000;

        if (this.streamType != 'context' &&
            !($j.browser.msie && $j.browser.version < 8)) {
            $j(window).bind('scroll.autoLoad', function () {
                if (streamList.autoLoadMoreTimesLeft &&
                    streamList.getContent().is(":visible") &&
                    !streamList.loadMoreInProgress &&
                    $j(window).scrollTop() >= ($j(document).height() - $j(window).height() - streamList.autoLoadPxHeight) &&
                    streamList.getContent().find('.j-js-load-more')) {
                    streamList.autoLoadMoreTimesLeft--;
                    streamList.getContent().find('.j-js-load-more').click();
                }
            });
        }
    };

    this.getSoyTemplate = function(data){
        return jive.eae.activitystream.activityStreamList(data);
    };

    this.postRender = function() {
        var streamList = this,
            $streamListContent = streamList.getContent(),
            streamItems = $streamListContent.children('div.j-act-entry'),
            streamItemsLength = streamItems.length;
        for (var i = 0; i < streamItemsLength; i++) {
            streamList.initStreamItem($j(streamItems[i]), i, true);
        }

        $streamListContent.delegate('.j-js-update-btn', 'click', function(e) {
            streamList.emitP('updateStream').addCallback(function(data) {
                streamList.refresh(data);
            });
            e.preventDefault();
        });

        $streamListContent.bind('click touchend touchmove', function(e) {
            if (e.type == 'touchmove') {
                streamList.touchmoving = true;
            }
            else if (e.type == 'touchend' && streamList.touchmoving) {
                streamList.touchmoving = false;
            }
            else {
                var $target = $j(e.target),
                    $targetParents = $target.add($target.parents()),
                    $streamItem = $target.closest('div.j-act-entry'),
                    defaultAction = true;

                if ($streamItem.length) {
                    defaultAction = streamList.itemsByDomID[$streamItem.attr('id')].handleClick(e, $targetParents, streamList);
                }
                else if ($targetParents.filter('.j-js-load-more').length && !streamList.loadMoreInProgress &&
                    (!streamList.maxLoadMoreTimes || (streamList.numTimesLoadedMore < streamList.maxLoadMoreTimes))) {
                    streamList.loadMoreInProgress = true;
                    var moreLink = $targetParents.filter('.j-js-load-more').first();
                    this.spinner = new jive.loader.LoaderView({size: 'small', showLabel: false});
                    this.spinner.appendTo(moreLink);
                    var spinner = this.spinner;

                    moreLink.find('.j-more-label').hide();
                    streamList.emit('loadMore', '' + streamList.earliestItemParentTime, function(data) {
                        if (data.activityStream4JS.activityContainerList.length) {
                            data.streamType = streamList.streamType;
                            data.filterType = streamList.filterType;
                            streamList.data = data.activityStream4JS;
                            streamList.timepoints = data.activityStream4JS.timepoints;
                            var renderedData = $j(streamList.getSoyTemplate(data));
                            if (renderedData.filter('.j-act-streaminfo').length) {
                                // remove the stream help text from the rendered loaded items
                                renderedData.splice(0,1);
                            }
                            streamList.numTimesLoadedMore++;
                            if (renderedData.filter('a.j-js-load-more').length &&
                                streamList.numTimesLoadedMore == streamList.maxLoadMoreTimes) {
                                renderedData.splice(renderedData.length-1,1);
                                renderedData = renderedData.add(jive.eae.activitystream.maxPagesReached());
                            }
                            streamList.append(renderedData);
                            renderedData.hide();
                            renderedData.fadeIn(2000);

                            if (spinner) {
                                spinner.getContent().fadeOut(200, function() {
                                    spinner.getContent().remove();
                                    spinner.destroy();
                                });
                            }
                            moreLink.find('.j-more-label').show();

                            var renderedDataItems = renderedData.filter('div.j-act-entry'),
                                renderedDataItemsLength = renderedDataItems.length;
                            for (var i = 0; i < renderedDataItemsLength; i++) {
                                streamList.initStreamItem($j(renderedDataItems[i]), i, true);
                            }

                            if (streamList.streamType != 'context' && streamList.streamType != 'profile' &&
                                (!streamList.maxLoadMoreTimes || streamList.numTimesLoadedMore < 3)) {
                                streamList.setUpdatedMarker($streamListContent);
                            }
                        }
                        moreLink.remove();
                        streamList.loadMoreInProgress = false;
                    });
                    e.preventDefault();
                }
                if (defaultAction) return true;
                e.preventDefault();
            }
        });
    };

    this.initStreamItem = function($listElem, streamItemIndex, doAppend){

        // setup click and hover behaviour
        var streamList = this,
            itemData = streamList.data.activityContainerList[streamItemIndex],
            itemIDAttr = $listElem.attr('id'),
            streamItem = new jive.ActivityStream.ActivityStreamItemView({selector: streamList.selector + '  #' + itemIDAttr,
                                                                        id: itemIDAttr,
                                                                        data: itemData,
                                                                        viewingUserData: streamList.data.viewingUser,
                                                                        streamType: streamList.streamType,
                                                                        filterType: streamList.filterType,
                                                                        rteOptions: streamList.rteOptions,
                                                                        canCreateMbImage: streamList.data.canCreateMbImage,
                                                                        canCreateMbVideo: streamList.data.canCreateMbVideo,
                                                                        mbCreationModerated: streamList.data.mbCreationModerated});

        streamList.itemsByDomID[itemIDAttr] = streamItem;
        if (parseInt(itemData.parentTimestamp) < streamList.earliestItemParentTime || streamList.earliestItemParentTime == 0) {
            streamList.earliestItemParentTime = parseInt(itemData.parentTimestamp);
        }
        streamItem.addListener('replySubmit', function(replyData, successHandler, errorHandler){
            streamList.emit('replySubmit', replyData, successHandler, errorHandler);
        }).addListener('commentSubmit', function(replyData, successHandler, errorHandler){
            streamList.emit('commentSubmit', replyData, successHandler, errorHandler);
        }).addListener('mbCommentSubmit', function(replyData, successHandler, errorHandler){
            streamList.emit('mbCommentSubmit', replyData, successHandler, errorHandler);
        }).addListener('repostSubmit', function(replyData, successHandler, errorHandler){
            streamList.emit('repostSubmit', replyData, successHandler, errorHandler);
        }).addListener('linkURLMatch', function(url, promise){
            streamList.emit('linkURLMatch', url, promise);
        }).addListener('getLikeData', function(objData, callback){
            for (var i=0; i < objData.length; i++) {
                streamList.emit('getLikeData', objData[i].type, objData[i].id, callback);
            }
        }).addListener('getFullContent', function(objectData, callback){
            streamList.emit('getFullContent', objectData, callback);
        }).addListener('getFullReplies', function(objectData, fullRepliesRequest, callback){
            streamList.emit('getFullReplies', objectData, fullRepliesRequest, callback);
        }).addListener('hide', function(type, data, hide, rehide){
            streamList.emit('hide', type, data, hide, rehide, function(type, data, hide, rehide) {
                var newHide = hide;
                if (rehide) {
                    newHide = false;
                }
                for (var i = 0; i < streamList.streamListItems.length; i++) {
                    streamList.streamListItems[i].determineHidden(type, data, newHide);
                }
            });
        }).addListener('unhidemenu', function(data, callback) {
            streamList.emit('unhidemenu', data, callback);
        }).addListener('unhide', function(data, unhideData) {
            streamList.emit('unhide', data, unhideData, function(data, unhideData) {
                for (var i = 0; i < streamList.streamListItems.length; i++) {
                    if (unhideData.itemHidden) {
                        streamList.streamListItems[i].determineHidden('item', data, true);
                    }
                    if (unhideData.contextTypeHidden) {
                        streamList.streamListItems[i].determineHidden('type-context', data, true);
                    }
                    if (unhideData.contextHidden) {
                        streamList.streamListItems[i].determineHidden('context', data, true);
                    }
                }
            });
        }).addListener('fillInTheGaps', function(objectData, fillInTheGapRequest, callback){
            streamList.emit('fillInTheGaps', objectData, fillInTheGapRequest, callback)
        }).addListener('fillInStreamItem', function(objectType, objectID, timestamp, count, promise) {
            streamList.emit('fillInStreamItem', objectType, objectID, timestamp, count, promise);
        });

        streamItem.postRender();

        if (doAppend) {
            streamList.streamListItems.push(streamItem) ;
        }
        else {
            return streamItem;
        }
    };

   /**
    * Method to add new items to the start of the list.  Also called on initial async load of list or when a reload of list is forced.
    */
    this.refresh = function(data) {
        var streamList = this,
            streamListContent = streamList.getContent();

        streamList.streamType = data.streamType;
        streamList.filterType = data.filterType;
        streamList.data = data.activityStream4JS;
        streamList.timepoints = data.activityStream4JS.timepoints;
        streamList.updateCount = 0;
        streamList.autoLoadMoreTimesLeft = 4;
        streamList.earliestItemParentTime = 0;
        streamList.numTimesLoadedMore = 0;

        streamList.showUpdates(0);

        // clear out existing list
        streamListContent.emptyAndTrash();
        var $newStreamListMarkup = $j(jive.eae.activitystream.streamMarkup(data));
        streamListContent.prepend($newStreamListMarkup);

        var streamItemsLength = streamList.streamListItems.length;
        for(var j = 0; j < streamItemsLength; j++) {
            var oldItem = streamList.streamListItems.splice(0,1);
            delete(oldItem);
        }

        var renderedDataItems = $newStreamListMarkup.filter('div.j-act-entry'),
            tempItemArray = [],
            renderedDataItemsLength = renderedDataItems.length;
        for (var i = 0; i < renderedDataItemsLength; i++) {
            var streamItemView = streamList.initStreamItem($j(renderedDataItems[i]), i, false);
            tempItemArray.push(streamItemView);
        }

        streamList.streamListItems = tempItemArray.concat(streamList.streamListItems);

        if (streamList.streamType != 'context' && streamList.streamType != 'profile') {
            streamList.setUpdatedMarker(streamListContent);
        }
    };

    this.removeUpdatedMarkers = function() {
        var streamListContent = this.getContent();
        $j('#j-as-updated-last').remove();
        $j('#j-as-updated-prev').remove();
        streamListContent.find('div.j-last-updated').removeClass('j-last-updated');
        streamListContent.find('div.j-prev-updated').removeClass('j-prev-updated');
    };

    this.setUpdatedMarker = function(renderedData) {
        var updatedItems = [],
            prevUpdatedItems = [],
            streamList = this,
            collectUpdatedItems = function(i){
                var thisParentTimestamp = streamList.itemsByDomID[$j(this).attr('id')].getParentTimestamp();
                if ($j.inArray('all', streamList.filterType) != -1 &&
                    parseInt(thisParentTimestamp)) {
                    if (parseInt(thisParentTimestamp) > streamList.timepoints['prev']) {
                        updatedItems.unshift($j(this));
                    }
                    if (parseInt(thisParentTimestamp) > streamList.timepoints['prev2']) {
                        prevUpdatedItems.unshift($j(this));
                    }
                }
            };

        renderedData.find('div.j-act-entry').each(collectUpdatedItems);

        var updatedItemsLength = updatedItems.length,
            prevUpdatedItemsLength = prevUpdatedItems.length;

        if (updatedItemsLength) {
            streamList.removeUpdatedMarkers();
            if (!(updatedItems[0].next().length && $j(updatedItems[0].next()[0]).hasClass('j-js-load-more'))) {
                updatedItems[0].append(jive.eae.activitystream.updatedMarker({type: 'last'}));
                updatedItems[0].addClass('j-last-updated');
            }
            updatedItems = [];
        }
        // don't put the "End of previous updates" line if it would be right after the "End of new updates" line
        if (prevUpdatedItemsLength && (prevUpdatedItemsLength != updatedItemsLength)) {
            if (!(prevUpdatedItems[0].next().length && $j(prevUpdatedItems[0].next()[0]).hasClass('j-js-load-more'))) {
                prevUpdatedItems[0].append(jive.eae.activitystream.updatedMarker({type: 'prev'}));
                prevUpdatedItems[0].addClass('j-prev-updated');
            }
            prevUpdatedItems = [];
        }
    };

    this.showUpdates = function(count) {
        var streamList = this,
            content = streamList.getContent(),
            $updateButton = content.find('#j-updates');
        if (count == 0) {
            $updateButton.hide();
            $updateButton.html(jive.eae.activitystream.newUpdates({count:count}));
        }
        else {
            $updateButton.html(jive.eae.activitystream.newUpdates({count:count}));
            if (count > 0 && streamList.updateCount == 0) {
                $updateButton.animate({
                    height: 'toggle'

                }, {
                    duration: 600
                });
            }
        }
        streamList.updateCount = count;
    };
});
