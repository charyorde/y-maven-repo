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
 * @depends path=/resources/scripts/apps/activity_stream/views/communication_stream_item_view.js
 * @depends template=jive.eae.inbox.commStreamListItems
 * @depends template=jive.eae.inbox.expandedCommItemView
 * @depends template=jive.eae.inbox.inboxLoadMoreBtn
 * @depends dwr=WikiTextConverter
 */
jive.namespace('ActivityStream');

jive.ActivityStream.CommunicationStreamListView = jive.ActivityStream.StreamListCommonView.extend(function(protect, _super) {
    this.init = function (options) {
        _super.init.call(this, options);
        this.savedItemLoaded = options.savedItemLoaded;
        this.earliestItemParentTime = 0;
        this.mobileUI = jive.rte.mobileUI;
        this.ie7 = $j.browser.msie && $j.browser.version < 8;
        this.loadMoreInProgress = false;
        this.autoLoadMoreTimesLeft = 4;
        this.autoLoadPxHeight = 200;
        this.viewType = options.viewType;
        this.newUserMode = options.newUserMode;
        this.instanceName = options.instanceName;
        this.listVisible = true;
        this.itemClicked = false;
    };

    this.postRender = function() {
        var streamList = this,
            $streamListContent = streamList.getContent();
        // setup click and hover behaviour
        var streamItems = $streamListContent.children('div.j-js-ibx-item'),
            streamItemsLength = streamItems.length;
        for (var i = 0; i < streamItemsLength; i++) {
            streamList.initStreamItem($j(streamItems[i]), i, true);
        }
        $streamListContent.unbind();
        $streamListContent.bind('click touchend', function(e) {
            var $target = $j(e.target),
                $targetParents = $target.add($target.parents()),
                $streamItem = $target.closest('div.j-js-ibx-item'),
                defaultAction = false;
            if ($streamItem.length && !streamList.itemClicked && streamList.savedItemLoaded) {
                streamList.itemClicked = true;
                var promise = new jive.conc.Promise();
                promise.addCallback(function() {
                    streamList.itemClicked = false;
                });
                defaultAction = streamList.itemsByDomID[$streamItem.attr('id').split("_").slice(0,3).join("_")].handleClick(e, $targetParents, streamList.viewType, promise);
            }
            else if ($targetParents.filter('.j-js-load-more').length) {
                streamList.loadMore($target);
            }
            if (defaultAction) return true;
            e.preventDefault();
        });

        if (!streamList.mobileUI && !streamList.ie7) {

            $j(document).unbind('click.inboxNav');
            $j(document).bind('click.inboxNav', function(e) {
                if ($j('#jive-nav-link-communications').hasClass('selected')) {
                    if (!$j(e.target).closest('#j-communications-list').length) {
                        $streamListContent.removeClass('j-js-focused');
                    }
                    else {
                        $streamListContent.addClass('j-js-focused');
                    }
                }
            });

            $j(document).unbind('keydown.inboxNav');
            $j(document).bind('keydown.inboxNav', function(e) {
                if ($j('#jive-nav-link-communications').hasClass('selected') &&
                    $j(e.target).is('body, html, #j-js-communications-exp') &&
                    (($streamListContent.hasClass('j-js-focused') && streamList.viewType == 'split') ||
                        streamList.viewType == 'full')) {
                    switch(e.keyCode ? e.keyCode : e.which) { // add check for e.which (firefox)
                        case 13:
                            // KEY: enter
                            if (streamList.listVisible && streamList.viewType == 'full' &&
                                streamList.isKeyNavUnlocked()) {
                                var currentArticle = $streamListContent.find('div.j-js-ibx-item.j-act-active');
                                if (currentArticle.length) {
                                    var promise = new jive.conc.Promise();
                                    promise.addCallback(function() {
                                        streamList.unlockKeyNav();
                                    });
                                    streamList.forceSelectItem(currentArticle, true, true, promise);
                                }
                            }
                            e.preventDefault();
                            break;
                        case 27:
                        case 8:
                            // KEY: escape
                            // KEY: backspace
                            if (!streamList.listVisible &&
                                streamList.isKeyNavUnlocked()) {
                                streamList.emit('backToList');
                                streamList.unlockKeyNav();
                            }
                            e.preventDefault();
                            break;
                        case 38:
                            // KEY: up
                            if (streamList.listVisible) {
                                streamList.selectAdjacentItem(true);
                            }
                            e.preventDefault();
                            break;
                        case 40:
                            // KEY: down
                            // find the currently selected article
                            if (streamList.listVisible) {
                                streamList.selectAdjacentItem(false);
                            }
                            e.preventDefault();
                            break;
                        case 37:
                            // KEY: left
                            if (!streamList.listVisible) {
                                streamList.selectAdjacentItem(true);
                            }
                            e.preventDefault();
                            break;
                        case 39:
                            // KEY: right
                            if (!streamList.listVisible) {
                                streamList.selectAdjacentItem(false);
                            }
                            e.preventDefault();
                            break;
                    }
                }
                return true;
            });
            streamList.attachInfiScroll();
        }
        else {
            var $loadMoreButton = $streamListContent.find('.j-js-load-more');
            if ($loadMoreButton.length && !$loadMoreButton.find('.j-more-label').length) {
                $loadMoreButton.html(jive.eae.inbox.inboxLoadMoreBtn({labelType: 'text'}));
            }
        }
    };

    this.forceSelectItem = function($item, markRead, expandItem, promise) {
        var streamList = this,
            itemIDWithoutContainer = $item.attr('id').split("_").slice(0,3).join("_"),
            streamListItem = streamList.itemsByDomID[itemIDWithoutContainer];
        if (!promise) {
            promise = new jive.conc.Promise();
        }
        if (streamListItem) {
            if (!$item.hasClass('j-act-active')) {
                $j('#j-communications-list').children('div.j-js-ibx-item.j-act-active').removeClass('j-act-active');
                $item.addClass('j-act-active');
            }
            streamListItem.expandClickHandler(null, markRead, expandItem, promise);
            streamList.scrollItemIntoView($item);
        }
        else {
            promise.emitSuccess();
        }
    };

    this.loadMore = function($link) {
        var streamList = this,
            promise = new jive.conc.Promise();
        streamList.loadMoreInProgress = true;
        var $moreLink = $link.closest('.j-js-load-more'),
            $moreLinkLabel = $moreLink.find('.j-more-label');
        if ($moreLinkLabel.length) {
            $moreLinkLabel.replaceWith(jive.eae.inbox.inboxLoadMoreBtn({labelType: 'spinner'}));
        }
        $moreLink.addClass('j-append-active');
        streamList.emit('loadMore', '' + streamList.earliestItemParentTime, function(data) {
            if (data.activityStream4JS.activityContainerList.length) {
                data.streamType = streamList.streamType;
                if (streamList.mobileUI || streamList.ie7 || streamList.autoLoadMoreTimesLeft == 0) {
                    data.loadMoreLabelType = 'text';
                }
                else {
                    data.loadMoreLabelType = 'spinner';
                }
                streamList.data = data.activityStream4JS;
                var renderedData = $j(jive.eae.inbox.commStreamListItems(data));
                streamList.append(renderedData);
                renderedData.hide();
                renderedData.fadeIn(2000);
                $moreLink.removeClass('j-append-active');
                var newItems = renderedData.filter('div.j-comm-entry'),
                    newItemsLength = newItems.length;
                for (var i = 0; i < newItemsLength; i++) {
                    streamList.initStreamItem($j(newItems[i]), i, true);
                }
            }
            $moreLink.remove();
            streamList.loadMoreInProgress = false;
            streamList.pokeInfiScroll();
            promise.emitSuccess();
        });
        return promise;
    };

    this.selectAdjacentItem = function(selectPrevious, postLoadMore) {
        var streamList = this,
            $content = streamList.getContent();
        if (streamList.isKeyNavUnlocked() || postLoadMore) {
            var currentArticle = $content.find('div.j-act-active');
            // if the current article exists, load the prev one, if not, set prev to the first article
            var adjArticle = [];
            if (currentArticle.length) {
                if (selectPrevious && currentArticle.prev().length) {
                    adjArticle = currentArticle.prev();
                }
                else if (!selectPrevious) {
                    if (currentArticle.next('.j-comm-entry').length) {
                        adjArticle = currentArticle.next();
                    }
                    else if (currentArticle.next('.j-js-load-more').length) {
                        if (!streamList.loadMoreInProgress) {
                            streamList.loadMore(currentArticle.next()).addCallback(function() {
                                streamList.selectAdjacentItem(false, true);
                            });
                        }
                        else {
                            streamList.unlockKeyNav();
                        }
                    }
                    else {
                        // last item in list
                        streamList.unlockKeyNav();
                    }
                }
                else {
                    streamList.unlockKeyNav();
                }
            }
            // if the adjacent article exists, select it
            if (adjArticle.length) {
                var promise = new jive.conc.Promise();
                promise.addCallback(function() {
                    streamList.unlockKeyNav();
                });
                streamList.forceSelectItem(adjArticle, true, (streamList.viewType == 'split' || !streamList.listVisible), promise);
            }
        }
    };

    this.scrollItemIntoView = function($item) {
        var streamList = this,
            $scrollContainer;
        if (streamList.viewType == 'split') {
            $scrollContainer = streamList.getContent();
            if ($item.position().top >= $scrollContainer.height()) {
                $scrollContainer.scrollTop(($scrollContainer.scrollTop() + $scrollContainer.height()) +
                    ($item.position().top-$scrollContainer.height()));
            }
            else if ($item.position().top <= 0) {
                $scrollContainer.scrollTop(($scrollContainer.scrollTop() + $item.position().top));
            }
        }
        else {
            $scrollContainer = $j(window);
            if ($item.offset().top >= $scrollContainer.height()+$scrollContainer.scrollTop()) {
                $scrollContainer.scrollTop(($scrollContainer.scrollTop() + $scrollContainer.height()) +
                    ($item.offset().top-($scrollContainer.height()+$scrollContainer.scrollTop())));
            }
            else if ($item.offset().top <= $scrollContainer.scrollTop()) {
                $scrollContainer.scrollTop($item.offset().top);
            }
        }
    };

    this.isKeyNavUnlocked = function(){
        var streamList = this;
        if (!streamList.keyNavLocked) {
            streamList.keyNavLocked = true;
            return true;
        }
        else {
            return false;
        }
    };

    this.unlockKeyNav = function(){
        var streamList = this;
        streamList.keyNavLocked = false;
    };

    this.initStreamItem = function($listElem, streamItemIndex, doAppend){

        // setup click and hover behaviour
        var streamList = this,
            content = streamList.getContent(),
            itemData = streamList.data.activityContainerList[streamItemIndex],
            itemIDWithoutContainer = $listElem.attr('id').split("_").slice(0,3).join("_"),
            streamItem = new jive.ActivityStream.CommunicationStreamItemView({
                selector: this.selector + '  #' + $listElem.attr('id'),
                id: $listElem.attr('id'),
                data: itemData,
                i18n: streamList.i18n,
                viewingUserData: streamList.data.viewingUser,
                streamType: streamList.streamType,
                filterType: streamList.filterType,
                canCreateMbImage: streamList.data.canCreateMbImage,
                canCreateMbVideo: streamList.data.canCreateMbVideo,
                newUserMode: streamList.newUserMode,
                instanceName: streamList.instanceName,
                mbCreationModerated: streamList.data.mbCreationModerated
            });

        streamList.itemsByDomID[itemIDWithoutContainer] = streamItem;
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
            }).addListener('showReadingPaneData', function($data, objectData, promise) {
                streamList.emit('showReadingPaneData', $data, objectData, streamItem, promise);
            }).addListener('showReadingPane', function(promise) {
                streamList.emit('showReadingPane', promise);
            }).addListener('getFullContent', function(objectData, callback){
                streamList.emit('getFullContent', objectData, callback);
            }).addListener('getFullReplies', function(objectData, fullRepliesRequest, callback){
                streamList.emit('getFullReplies', objectData, fullRepliesRequest, callback);
            }).addListener('showRTE', function(itemData, $replyActivity, promise){
                streamList.emit('showRTE', itemData, $replyActivity, promise);
            }).addListener('track', function(objectData, promise) {
                streamList.emit('track', objectData, promise);
            }).addListener('untrack', function(objectData, promise) {
                streamList.emit('untrack', objectData, promise);
            }).addListener('saveLastViewedItem', function(objectType, objectID) {
                streamList.emit('saveLastViewedItem', objectType, objectID);
            }).addListener('fillInTheGaps', function(objectData, fillInTheGapRequest, callback){
                streamList.emit('fillInTheGaps', objectData, fillInTheGapRequest, callback)
            }).addListener('fillInStreamItem', function(objectType, objectID, timestamp, count, promise){
                streamList.emit('fillInStreamItem', objectType, objectID, timestamp, count, promise)
            });

        streamItem.postRender();
        var streamItemsLength = this.streamListItems.length;
        for(var j = 0; j < streamItemsLength; j++) {
            if (this.streamListItems[j].getID() == itemIDWithoutContainer) {
                var oldItem = this.streamListItems.splice(j,1);
                delete(oldItem);
                break;
            }
        }
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
        var streamList = this;
        data.streamType = streamList.streamType;
        data.filterType = streamList.filterType;
        if (streamList.mobileUI || streamList.ie7) {
            data.loadMoreLabelType = 'text';
        }
        else {
            data.loadMoreLabelType = 'spinner';
        }
        var renderedData = $j(jive.eae.inbox.commStreamListItems(data)),
            slideInNew = true,
            readingPaneActivityContainerIdTrunc = '',
            readingPaneStreamItemObject = null,
            renderedActivityItems = renderedData.filter('div.j-comm-entry'),
            renderedActivityItemsLength = renderedActivityItems.length,
            $streamListContent = streamList.getContent();
        streamList.data = data.activityStream4JS;

        if (!$streamListContent.children('div.j-js-ibx-item').length) {
            slideInNew = false;
        }

        for (var renderedDataIndex = 0; renderedDataIndex < renderedActivityItemsLength; renderedDataIndex++) {
            var $newStreamItem = $j(renderedActivityItems[renderedDataIndex]),
                renderedDataObject = streamList.data.activityContainerList[renderedDataIndex], //data from server consisting of new activitycontainer
                itemid = $newStreamItem.attr('id'),
                itemidwithoutcontainer = itemid.split("_").slice(0,3).join("_"),
                keepStreamItemObject = false,
                $readingPane = streamList.getDrawer(),
                drawerLinkedIDAttr = $readingPane.find('div.j-act-exp-view').attr('data-linkedID'),
                drawerLinkedIDAttrWithoutContainer = "none";

            if (drawerLinkedIDAttr) {
                drawerLinkedIDAttrWithoutContainer = drawerLinkedIDAttr.split("_").slice(0,3).join("_");
            }

            if (drawerLinkedIDAttrWithoutContainer && drawerLinkedIDAttrWithoutContainer == itemidwithoutcontainer) {
                $readingPane.data('refreshing', true);
                var $newStreamItemExpView = $j(jive.eae.inbox.expandedCommItemView({
                    activityContainer: renderedDataObject,
                    user: streamList.data.viewingUser,
                    streamType: 'communications',
                    filterType: streamList.filterType,
                    canCreateMBImage: streamList.data.canCreateMbImage,
                    canCreateMBVideo: streamList.data.canCreateMBVideo,
                    mobileUI: streamList.mobileUI,
                    mbCreationModerated: streamList.data.mbCreationModerated
                }));

                streamList.emit('refreshReadingPane', $newStreamItemExpView, renderedDataObject, itemidwithoutcontainer, function(itemidwithoutcontainer, newSubActivities) {
                    if (newSubActivities.length) {
                        for (var i = 0; i<newSubActivities.length; i++) {
                            streamList.itemsByDomID[itemidwithoutcontainer].appendSubActivity(newSubActivities[i]);
                        }
                    }
                    $readingPane.data('refreshing', false);
                });
                readingPaneActivityContainerIdTrunc = itemidwithoutcontainer;
                keepStreamItemObject = true;
            } // done checking for updates to reading pane

            // remove the stale item from the existing stream
            $streamListContent.find('div[id^='+itemidwithoutcontainer+']').remove();

            var streamItemsLength = streamList.streamListItems.length;
            for(var j = 0; j < streamItemsLength; j++) {
                if (streamList.streamListItems[j].getIDWithoutContainer() == itemidwithoutcontainer) {
                    var oldItem = streamList.streamListItems.splice(j,1)[0];
                    if (!keepStreamItemObject) {
                        delete(oldItem);
                    }
                    else {
                        readingPaneStreamItemObject = oldItem;
                    }
                    break;
                }
            }
        }
        if ($j(renderedData[renderedData.length-1]).hasClass('j-js-load-more')) {
            // if the update items coming in includes a load more link, need to clear out existing list.
            $streamListContent.find('div.j-js-ibx-item, a.j-js-load-more').remove();
            streamItemsLength = streamList.streamListItems.length;
            for(j = 0; j < streamItemsLength; j++) {
                oldItem = streamList.streamListItems.splice(0,1);
                delete(oldItem);
            }
            streamList.autoLoadMoreTimesLeft = 4;
            streamList.earliestItemParentTime = 0;
        }

        // prepend all new items to the stream

        $streamListContent.prepend(renderedData);
        $j('#j-js-communications').show();
        if (renderedActivityItems.length && $streamListContent.find(".j-act-empty-list").length) {
            $streamListContent.find(".j-act-empty-list").remove();
        }

        var tempItemArray = [],
            renderedDataDomItems = renderedData.filter('div.j-comm-entry'),
            renderedDataDomItemsLength = renderedDataDomItems.length;
        for (var i = 0; i < renderedDataDomItemsLength; i++) {
            var $updatedItem = $j(renderedDataDomItems[i]),
                streamItemView;
            if ($updatedItem.attr('id').split("_").slice(0,3).join("_") == readingPaneActivityContainerIdTrunc) {
                streamItemView = readingPaneStreamItemObject;
                var $updatedActiveItem = $streamListContent.find('[id^='+readingPaneActivityContainerIdTrunc+']');
                if ($updatedActiveItem.length) {
                    $updatedActiveItem.addClass('j-act-active');
                }
            }
            else {
                streamItemView = streamList.initStreamItem($updatedItem, i, false);
            }
            tempItemArray.push(streamItemView);
        }
        streamList.streamListItems = tempItemArray.concat(streamList.streamListItems);
        streamList.pokeInfiScroll();
    };

    this.pokeInfiScroll = function() {
        var streamList = this
            , $streamListContent = streamList.getContent();
        if (!streamList.mobileUI && !streamList.ie7) {
            $j(window).trigger('scroll.inboxAutoLoad');
            $streamListContent.trigger('scroll');
        }
        else {
            var $loadMoreButton = $streamListContent.find('.j-js-load-more');
            if ($loadMoreButton.length && !$loadMoreButton.find('.j-more-label').length) {
                $loadMoreButton.html(jive.eae.inbox.inboxLoadMoreBtn({labelType: 'text'}));
            }
        }
    };

    this.updateUnreadMarkers = function(unreadItems) {
        if (unreadItems.length == 1 && unreadItems[0].id == 0 && unreadItems[0].objectType == 0) {
            // marker indicating unread polling is disabled
            return;
        }
        var streamList = this,
            streamItems = streamList.getContent().find("div[id^=communications]"),
            streamItemsLength = streamItems.length,
            drawerItem = streamList.getDrawer().find("div.j-act-exp-view"),
            drawerItemLinkedID = drawerItem.attr('data-linkedID'),
            drawerItemType = 0,
            drawerItemID = 0;

        if (drawerItem.length && drawerItemLinkedID) {
            drawerItemType = drawerItemLinkedID.split('_')[1],
                drawerItemID = drawerItemLinkedID.split('_')[2];
        }

        for (var i = 0; i < streamItemsLength; i++) {
            var $streamItem = $j(streamItems[i]),
                isUnread = $streamItem.hasClass('j-act-unread'),
                streamItemType = $streamItem.attr('id').split("_")[1],
                streamItemID = $streamItem.attr('id').split("_")[2],
                inUnreadArray = false;
            for (var j = 0, unreadItemsLength = unreadItems.length; j < unreadItemsLength; j++) {
                var unreadItem = unreadItems[j];
                if (unreadItem.id == streamItemID &&
                    unreadItem.objectType == streamItemType) {
                    inUnreadArray = true;
                    break;
                }
            }
            if (!isUnread && inUnreadArray) {
                // update to unread
                $streamItem.removeClass('j-act-read').addClass('j-act-unread');
                if (drawerItemID && drawerItemID == streamItemID && drawerItemType == streamItemType) {
                    drawerItem.removeClass('j-act-read').addClass('j-act-unread');
                    drawerItemID = 0;
                }
            }
            else if (isUnread && !inUnreadArray) {
                // update to read
                $streamItem.removeClass('j-act-unread').addClass('j-act-read');
                if (drawerItemID && drawerItemID == streamItemID && drawerItemType == streamItemType) {
                    drawerItem.removeClass('j-act-unread').addClass('j-act-read');
                    drawerItemID = 0;
                }
            }
        }
    };

    this.attachInfiScroll = function() {
        var streamList = this,
            $streamListContent = streamList.getContent(),
            infiScrollInit = function() {
                if (streamList.viewType == 'full') {
                    $streamListContent.unbind('scroll');
                    $j(window).bind('scroll.inboxAutoLoad', function () {
                        if (streamList.autoLoadMoreTimesLeft &&
                            $streamListContent.is(":visible") &&
                            !streamList.loadMoreInProgress &&
                            $j(window).scrollTop() >= (($streamListContent.height() + $streamListContent.offset().top) - $j(window).height() - streamList.autoLoadPxHeight) &&
                            $streamListContent.find('.j-js-load-more')) {
                            streamList.autoLoadMoreTimesLeft--;
                            $streamListContent.find('.j-js-load-more').click();
                        }
                    });
                    // trigger a scroll event to auto load more items on page load, if close enough to bottom of screen
                    $j(window).trigger('scroll.inboxAutoLoad');
                }
                else {
                    $j(window).unbind('scroll.inboxAutoLoad');
                    $streamListContent.scroll(function() {
                        if (streamList.autoLoadMoreTimesLeft &&
                            !streamList.loadMoreInProgress &&
                            (($streamListContent.scrollTop() + $streamListContent.height()) > ($streamListContent[0].scrollHeight - streamList.autoLoadPxHeight)) &&
                            $streamListContent.find('.j-js-load-more')) {
                            streamList.autoLoadMoreTimesLeft--;
                            $streamListContent.find('.j-js-load-more').click();
                        }
                    });
                    // trigger a scroll event to auto load more items on page load, if scrolled close enough to bottom of
                    // list
                    $streamListContent.trigger('scroll');
                }
            };
        // global, set in footer-javascript.ftl
        if (!jive.onLoadEventComplete) {
            $j(window).load(infiScrollInit);
        }
        else {
            infiScrollInit();
        }
    };

    this.switchViewType = function(newType) {
        var streamList = this,
            content = streamList.getContent();
        streamList.viewType = newType;
        // make sure list is showing
        var $selectedItem = content.find('div.j-act-active');
        if (newType == 'split') {
            $selectedItem = content.find('div.j-act-active');
            if (streamList.getDrawer().find('div.j-panel-instructions').length &&
                $selectedItem.length) {
                // no currently expanded item in reading pane, make sure the item selected
                // expands into reading pane.
                streamList.forceSelectItem($selectedItem, true, true);
            }
            else if ($selectedItem.length) {
                streamList.scrollItemIntoView($selectedItem);
            }
        }
        else if ($selectedItem.length) {
            streamList.scrollItemIntoView($selectedItem);
        }
        streamList.attachInfiScroll();
    };

    this.setListVisible = function(listVisible) {
        var streamList = this;
        streamList.listVisible = listVisible;
    };

    this.setSavedItemLoaded = function(savedItemLoaded) {
        this.savedItemLoaded = savedItemLoaded;
    };

    this.getDrawer = function() {
        return $j('#j-js-communications-exp');
    };

});
