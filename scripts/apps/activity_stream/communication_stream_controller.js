/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Communication Stream Controller
 *
 * Main class for controlling communication stream UI behavior
 *
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/apps/activity_stream/models/activity_stream_source.js
 * @depends path=/resources/scripts/apps/activity_stream/views/communication_stream_reading_pane_view.js
 * @depends path=/resources/scripts/apps/activity_stream/views/communication_stream_list_view.js
 * @depends path=/resources/scripts/apps/activity_stream_builder/models/builder_services.js
 * @depends path=/resources/scripts/apps/discussion_app/models/discussion_rest_source.js
 * @depends path=/resources/scripts/apps/activity_stream/activity_notifier.js
 * @depends path=/resources/scripts/jive/acclaim.js
 * @depends path=/resources/scripts/apps/like/models/like_source.js
 * @depends path=/resources/scripts/apps/like/like.js
 * @depends path=/resources/scripts/apps/comment_app/models/comment.js
 * @depends path=/resources/scripts/apps/comment_app/models/comment_count.js
 * @depends path=/resources/scripts/apps/comment_app/models/comment_source.js
 * @depends path=/resources/scripts/apps/content/polls/widget/models/widget_source.js
 * @depends path=/resources/scripts/apps/shared/models/meta_source.js
 * @depends path=/resources/scripts/apps/shared/views/menu_view.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/jquery/jquery.placeheld.js
 * @depends path=/resources/scripts/jquery/ui/ui.draggable.js
 *
 * @depends template=jive.polls.widget.soy.*
 * @depends template=jive.eae.inbox.filtermenu
 * @depends template=jive.eae.inbox.jsDraggableHelper
 * @depends template=jive.eae.inbox.commStreamList
 */

jive.namespace('ActivityStream');

/**
 * Controller for EAE communications stream
 *
 * @class
 */
define('jive.ActivityStream.CommunicationStreamControllerMain', [
    'jquery'
], function($) {
    return jive.oo.Class.extend(function(protect) {
        this.init = function (options) {
            var communicationsController = this;
            this.ie7 = $.browser.msie && $.browser.version < 8;
            if (this.ie7) {
                $.fx.off = true;
                $(document).unbind('selectstart.draggable').bind('selectstart.draggable', function(e) {
                    if (communicationsController.resizingList) {
                        e.preventDefault();
                    }
                });
            }
    
            // local vars
            this.streamType = "communications";
            this.userId = window._jive_effective_user_id;
            this.rteOptions = options.rteOptions;
            this.contextObjectType =  options.contextObjectType;
            this.contextObjectID = options.contextObjectID;
            this.i18n = options.i18n;
            // each tab will have to keep track of it's own last save refresh time to know the baseline time to get new activities on autoUpdate
            this.savedRefreshTime = options.savedRefreshTime;
            this.lastViewedObjectType = options.lastViewedObjectType;
            this.lastViewedObjectID = options.lastViewedObjectID;
            this.streamID = options.streamID;
            this.savedItemLoaded = false;
            this.filterType = options.filterType;
            this.queryParam = null;
            this.dmEnabled = options.dmEnabled;
            this.viewType = options.viewType;
            this.listHeight = options.listHeight;
            this.newUserMode = options.newUserMode;
            this.draftWallEntry = null;
            this.commentServiceOptions = {
                listAction: '',
                location: 'jive-comments',
                commentMode: 'comments',
                isPrintPreview: false
            };
            this.$filterLinks = $('#communications-filterlinks');
            this.$filterMenuButton = $('#communications-filter-trigger');
    
            //storing a list of recently unread
            this.clearUnreadSinceLastUpdate();
            jive.switchboard.addListener('inbox.unread', function(objectType, objectId, linkedDOMID) {
                communicationsController.addUnreadItem(objectType, objectId);
            });
    
            // services
            this.disscusionService = new jive.DiscussionApp.DiscussionRestSource();
            this.microbloggingService = new jive.MicroBlogging.MicroBloggingSource();
            this.liking = new jive.Liking.LikeSource({});
            this.metaService = new jive.MetaSource();
            this.listService = new jive.ActivityStream.StreamSource();
            this.trackingService = new jive.ActivityStream.BuilderServices();
    
            // views
            this.readingPaneView = new jive.ActivityStream.CommunicationStreamReadingPaneView(
                {selector:'#j-js-communications-exp',
                 rteOptions: this.rteOptions,
                 viewType:this.viewType,
                 i18n: this.i18n,
                 streamType: this.streamType});
    
            this.communicationsList = new jive.ActivityStream.CommunicationStreamListView({
                selector:'#j-communications-list',
                data: options.data,
                i18n: this.i18n,
                filterType: this.filterType,
                savedItemLoaded: this.savedItemLoaded,
                viewType: this.viewType,
                streamType: this.streamType,
                newUserMode: this.newUserMode,
                instanceName: this.rteOptions.communityName});
    
            // filter menu
            this.menuView = new jive.MenuView(
                this.buildFilterMenu.bind(communicationsController),
                '#communications-filter-trigger',
                { darkPopover: true }
            );
    
            this.attachListHandlers(this.communicationsList);
    
            this.readingPaneView.addListener('replySubmit', function(replyData, callback, errorCallback){
                var textBody = $(replyData.body).text();
                communicationsController.disscusionService.createMessage(replyData).addCallback(function(data) {
                    data.content.text = textBody;
                    callback(data);
                }).addErrback(function(message, status) {
                    errorCallback(message, status);
                });
            }).addListener('commentSubmit', function(replyData, callback, errorCallback){
                communicationsController.commentServiceOptions.resourceID = replyData.ID;
                communicationsController.commentServiceOptions.resourceType = replyData.typeID;
                communicationsController.commentServiceOptions.contentObject = {document:replyData.ID,
                                                                       version:replyData.version};
                var commentMode = "comments";
                if (replyData.isBackChannelComment) {
                    commentMode = "backchannel";
                }
                communicationsController.commentServiceOptions.commentMode = commentMode;
                communicationsController.commentService = new jive.CommentApp.CommentSource(communicationsController.commentServiceOptions);
                var comment = new jive.CommentApp.Comment({body:replyData.body, commentMode:commentMode, parentCommentID: replyData.parentCommentID});
    
                communicationsController.commentService.save(comment).addCallback(function(data) {
                    callback(data);
                }).addErrback(function(message, status) {
                    errorCallback(message, status);
                });
            }).addListener('getFullContent', function(objectData, callback) {
                if (objectData.containerType && objectData.containerID) {
                    var pollSource = new jive.PollWidget.WidgetSource({containerType: objectData.containerType, containerID: objectData.containerID});
                    pollSource.getPollByID(objectData.objectID, {
                        success: function(poll) {
                            if (poll) {
                                var pollOptions = {
                                    containerType: objectData.containerType,
                                    containerID: objectData.containerID,
                                    widgetID: jive.soy.func.randomString(),
                                    moreUrl: '#',
                                    createUrl: '#',
                                    canCreatePoll: false,
                                    poll: poll,
                                    location: 'activity-stream'
                                }
                                var pollResult = {html: jive.polls.widget.soy.main(pollOptions),
                                                  extraData: pollOptions};
                                callback(pollResult);
                            }
                        }
                    });
                }
                else {
                    communicationsController.listService.getFullContent(objectData.objectType, objectData.objectID).addCallback(function(data) {
                        callback(data);
                    });
                }
            }).addListener('getFullReplies', function(objectData, fullRepliesRequest, callback) {
                communicationsController.listService.getFullReplies(objectData.objectType, objectData.objectID, fullRepliesRequest).addCallback(function(fullRepliesResponse) {
                    callback(fullRepliesResponse);
                });
            }).addListener('backToList', function(promise) {
                communicationsController.setListVisible(true);
            }).addListener('selectAdjacentItem', function(selectPrevious) {
                communicationsController.communicationsList.selectAdjacentItem(selectPrevious);
            });
    
            //
            // filtering/general inbox dynamic pane functionality
            //
    
            // remove current filter button
            $('#filters-applied a.js-remove-filter').click(function(e) {
                communicationsController.toggleFilterSelectedBar();
                if ($.inArray('unread', communicationsController.filterType) != -1) {
                    communicationsController.filterType = ['unread']
                }
                else {
                    communicationsController.filterType = ['all'];
                }
                communicationsController.loadStream();
                e.preventDefault();
            });
    
            // full/split pane toggles
            $('#j-comm-activity-list .j-js-inbox-pane-toggle').click(function(e) {
                communicationsController.changeViewType($(this));
                e.preventDefault();
            });
    
            // pane sizing draggable
            var $commsList = $('#j-communications-list'),
                commListOffset = $commsList.offset();
            $('#js-ibx-resize').draggable({
                axis: "y",
                handle: ".js-ibx-resize-ctrl",
                containment: [commListOffset.left, commListOffset.top + 100, 10000000, 10000000],
                revert: false,
                distance: (communicationsController.ie7 ? 0 : 10),
                opacity: 0.3,
                zIndex: 5000,
                helper: function(){return jive.eae.inbox.jsDraggableHelper();},
                start: function(e) {
                    communicationsController.resizingList = true;
                },
                stop: function(e, ui) {
                    var $commsList = $('#j-communications-list'),
                        newHeight = Math.floor(ui.position.top - $commsList.position().top);
                    $commsList.height(newHeight);
                    communicationsController.listHeight = newHeight;
                    communicationsController.listService.saveInboxListHeight(newHeight);
                    communicationsController.resizingList = false;
                    communicationsController.communicationsList.pokeInfiScroll();
                }
            });
    
            // click handler for the unread checkbox
            $('#j-filter-bar input:checkbox').unbind('click').click(function(){
                var $this = $(this),
                    filterToSave;
                $this.prop('disabled', true);
                if ($this.is(":checked")) {
                    filterToSave = 'unread';
                    communicationsController.filterType.push(filterToSave);
                    var allIndex = $.inArray('all', communicationsController.filterType);
                    if (allIndex != -1) {
                        communicationsController.filterType.splice(allIndex,1);
                    }
                }
                else {
                    filterToSave = 'all';
                    communicationsController.filterType.push(filterToSave);
                    var unreadIndex = $.inArray('unread', communicationsController.filterType);
                    if (unreadIndex != -1) {
                        communicationsController.filterType.splice(unreadIndex,1);
                    }
                }
                communicationsController.loadStream(function() {
                    $this.prop('disabled', false);
                });
                // only save 'unread' or 'all' filters for the next load, not the sub-filters
                communicationsController.listService.saveActiveStreamFilter('communications', filterToSave);
            });
    
            // send DM button
            $('#j-js-inbox-send-dm').click(function(e) {
                if (jive.DirectMessaging) {
                    jive.DirectMessaging.create().showModal();
                }
                e.preventDefault();
            });
    
            this.communicationsList.postRender();
            this.readingPaneView.postRender();
    
            // re-select the last viewed inbox item, if possible
            if (this.lastViewedObjectType && this.lastViewedObjectID) {
                var $itemLastViewed =
                    $("#j-communications-list div.j-comm-entry[id^=communications_" +
                        this.lastViewedObjectType + "_" + this.lastViewedObjectID + "_]");
                if ($itemLastViewed.length) {
                    var promise = new jive.conc.Promise();
                    promise.addCallback(function() {
                        communicationsController.savedItemLoaded = true;
                        communicationsController.communicationsList.setSavedItemLoaded(true);
                    });
                    this.communicationsList.forceSelectItem($itemLastViewed,
                        options.fromHomeMenu, this.viewType == 'split' || options.fromHomeMenu, promise);
                }
                else {
                    this.readingPaneView.defaultView();
                    this.savedItemLoaded = true;
                    this.communicationsList.setSavedItemLoaded(true);
                }
            }
            else {
                this.readingPaneView.defaultView();
                this.savedItemLoaded = true;
                this.communicationsList.setSavedItemLoaded(true);
            }
    
            // Inbox user filter
            var $participantFilter = $("#personFilter");
            $participantFilter.placeHeld();
            this.autocomplete = new jive.UserPicker.Main({
                placeholder: $participantFilter.attr('placeholder'),
                emailAllowed: false,
                userAllowed: true,
                listAllowed: false,
                browseAllowed: false,
                resultListAllowed: false,
                multiple: false,
                $input: $participantFilter
            });
    
            this.autocomplete.addListener("selectedUsersChanged",
                function(data){
                    if (data.changes && data.changes.added) {
                        var addedUser = data.changes.added;
                        communicationsController.queryParam = addedUser.id;
                        if ($.inArray('unread', communicationsController.filterType) != -1) {
                            communicationsController.filterType = ['user', 'unread'];
                        }
                        else {
                            communicationsController.filterType = ['user'];
                        }
                        // JIVE-17328 - After selecting a user, but before the .loadStream call returns,
                        // if the user hits escape, in FF, the pending XHR request will be cancelled and user
                        // left with loading spinner.  While this can be a problem for all aborted XHR requests in FF that
                        // add a spinner, will fix for this case for now.
                        $(document).bind('keydown.whileInboxLoading', function(e) {
                            switch(e.keyCode ? e.keyCode : e.which) { // add check for e.which (firefox)
                                case 27:
                                    // KEY: escape
                                    e.preventDefault();
                                    break;
                            }
                        });
                        communicationsController.loadStream(function() {
                            $(document).unbind('keydown.whileInboxLoading');
                        });
                        communicationsController.toggleFilterSelectedBar(addedUser.displayName);
                    }
                });
    
            // polling listener
            this.commsPollHandler = function(data) {
                communicationsController.autoUpdate(data);
            }
    
            jive.ActivityStream.activityNotifier.addListener('activityStream.poll', this.commsPollHandler);
        };
    
        this.toggleFilterSelectedBar = function(filterName) {
            var communicationsController = this,
                $filterSelectedBar = $('#filters-applied');
    
            if (filterName) {
                $filterSelectedBar.fadeOut('fast', function() {
                    // There's no way to specifically filter on a user in this case
                    if ($.inArray('all', communicationsController.filterType) != -1) {
                        communicationsController.autocomplete.reset();
                    }
                    else {
                        if ($.inArray('user', communicationsController.filterType) == -1) {
                            $('#personFilter').hide();
                        }
                        $filterSelectedBar.find('.j-act-filter-display-name').text(filterName);
                        $filterSelectedBar.fadeIn('fast');
                    }
                });
            }
            else {
                $filterSelectedBar.fadeOut('fast', function() {
                    communicationsController.autocomplete.reset();
                });
            }
        };
    
        this.loadStream = function(callback) {
            var communicationsController = this,
                $currentList = $('#j-communications-list');
    
            communicationsController.spinner = new jive.loader.LoaderView();
            communicationsController.spinner.prependTo(communicationsController.getDynamicPaneArea());
    
            if (communicationsController.filterType.length != 1 ||
                ($.inArray('all', communicationsController.filterType) == -1 &&
                 $.inArray('unread', communicationsController.filterType) == -1)) {
                $('.j-not-all-read-controls').addClass('j-js-hide-mark-all-read-controls');
            }
            else {
                $('.j-not-all-read-controls').removeClass('j-js-hide-mark-all-read-controls');
            }
    
            if (!communicationsController.filterType) {
                communicationsController.filterType = ['all'];
            }
            communicationsController.listService.list(
                {objectType:communicationsController.contextObjectType,
                 objectID:communicationsController.contextObjectID,
                 streamSource: communicationsController.streamType,
                 streamID: communicationsController.streamID,
                 filterType:communicationsController.filterType,
                 queryParam:communicationsController.queryParam,
                 timestamp: '0'}).addCallback(
                function(data) {
                    communicationsController.hideExpandedView();
                    var $newList =
                        $(jive.eae.inbox.commStreamList({
                            activityStream: data.activityStream,
                            filterType: communicationsController.filterType,
                            mobileUI: communicationsController.rteOptions.mobileUI,
                            viewType: communicationsController.viewType,
                            listHeight: communicationsController.listHeight,
                            newUserMode: communicationsController.newUserMode,
                            instanceName:communicationsController.rteOptions.communityName
                        }));
                    $currentList.replaceWith($newList);
                    communicationsController.communicationsList.tearDown();
                    communicationsController.communicationsList = new jive.ActivityStream.CommunicationStreamListView({
                        selector:'#j-communications-list',
                        i18n:communicationsController.i18n,
                        data:data.activityStream4JS,
                        streamType:'communications',
                        filterType:communicationsController.filterType,
                        rteOptions: communicationsController.rteOptions,
                        savedItemLoaded: communicationsController.savedItemLoaded,
                        viewType:communicationsController.viewType,
                        newUserMode:communicationsController.newUserMode,
                        instanceName:communicationsController.rteOptions.communityName});
    
                    communicationsController.communicationsList.postRender();
                    communicationsController.attachListHandlers(communicationsController.communicationsList);
                    communicationsController.spinner.getContent().remove();
                    communicationsController.spinner.destroy();
                    if (callback) {
                        callback();
                    }
                }
            );
    
        };
    
        this.attachListHandlers = function(streamList) {
            var communicationsController = this;
            streamList.addListener('replySubmit', function(replyData, callback, errorCallback){
                var textBody = $(replyData.body).text();
                communicationsController.disscusionService.createMessage(replyData).addCallback(function(data) {
                    data.content.text = textBody;
                    callback(data);
                // Run a callback when an error occurs during
                // the server call.
                }).addErrback(function(message, status) {
                    errorCallback(message, status);
                });
            }).addListener('commentSubmit', function(replyData, callback, errorCallback){
                communicationsController.commentServiceOptions.resourceID = replyData.ID;
                communicationsController.commentServiceOptions.resourceType = replyData.typeID;
                communicationsController.commentServiceOptions.contentObject = {document:replyData.ID,
                                                       version:replyData.version
                                                       };
    
                communicationsController.commentService = new jive.CommentApp.CommentSource(communicationsController.commentServiceOptions);
                var comment = new jive.CommentApp.Comment({body:replyData.body, commentMode:'comments', parentCommentID:replyData.parentCommentID});
    
                communicationsController.commentService.save(comment).addCallback(function(data) {
                    callback(data);
    
                // Run a callback when an error occurs during
                // the server call.
                }).addErrback(function(message, status) {
                    errorCallback(message, status);
                });
            }).addListener('linkURLMatch', function(url, promise){
                communicationsController.metaService.createLink(url).addCallback(function(data) {
                    promise.emitSuccess(data);
                }).addErrback(function(message, status) {
                    promise.emitError(message, status);
                });
            }).addListener('getLikeData', function(type, id, callback){
                communicationsController.liking.getLikeData(type, id).addCallback(function(data) {
                    callback(type, id, data);
                });
            }).addListener('loadMore', function(beforeThisTime, callback){
                communicationsController.listService.getMore(
                    {objectType:communicationsController.contextObjectType,
                     objectID:communicationsController.contextObjectID,
                     streamSource: communicationsController.streamType,
                     streamID: communicationsController.streamID,
                     filterType: communicationsController.filterType,
                     queryParam:communicationsController.queryParam,
                     timestamp: beforeThisTime}).addCallback(function(data) {
                        callback(data);
                    });
            }).addListener('track', function(objectData, promise) {
                communicationsController.trackingService.addItemsToStream(
                    promise,
                    [{type : objectData.objectType, id : objectData.objectID }],
                    communicationsController.streamID,
                    {}
                );
            }).addListener('untrack', function(objectData, promise) {
                communicationsController.trackingService.removeItemsFromStream(
                    promise,
                    [{type : objectData.objectType, id : objectData.objectID }],
                    communicationsController.streamID,
                    {}
                );
            }).addListener('getFullContent', function(objectData, callback) {
                if (objectData.containerType && objectData.containerID) {
                    var pollSource = new jive.PollWidget.WidgetSource({containerType: objectData.containerType, containerID: objectData.containerID});
                    pollSource.getPollByID(objectData.objectID, {
                        success: function(poll) {
                            if (poll) {
                                var pollOptions = {
                                    containerType: objectData.containerType,
                                    containerID: objectData.containerID,
                                    widgetID: jive.soy.func.randomString(),
                                    moreUrl: '#',
                                    createUrl: '#',
                                    canCreatePoll: false,
                                    poll: poll,
                                    location: 'activity-stream'
                                }
                                var pollResult = {html: jive.polls.widget.soy.main(pollOptions),
                                    extraData: pollOptions};
                                callback(pollResult);
                            }
                        }
                    });
                }
                else {
                    communicationsController.listService.getFullContent(objectData.objectType, objectData.objectID).addCallback(function(data) {
                        callback(data);
                    });
                }
            }).addListener('getFullReplies', function(objectData, fullRepliesRequest, callback) {
                communicationsController.listService.getFullReplies(objectData.objectType, objectData.objectID, fullRepliesRequest).addCallback(function(fullRepliesResponse) {
                    callback(fullRepliesResponse);
                });
            }).addListener('saveLastViewedItem', function(objectType, objectID) {
                communicationsController.listService.saveActiveCommunicationsItem(objectType, objectID).addCallback(function() {
                });
            }).addListener('fillInTheGaps', function(objectData, fillInTheGapRequest, callback) {
                communicationsController.listService.fillInTheGaps(objectData.objectType, objectData.objectID, fillInTheGapRequest).addCallback(function(fillInTheGapResponse) {
                    callback(fillInTheGapResponse);
                });
            }).addListener('fillInStreamItem', function(objectType, objectID, timestamp, count, promise) {
                var fillActivityRequest = {
                    streamSource: communicationsController.streamType,
                    streamID: communicationsController.streamID,
                    timestamp: timestamp,
                    fullContent: false,
                    pageSize: count
                };
                communicationsController.listService.fillActivity(objectType, objectID, fillActivityRequest, promise);
            }).addListener('refreshReadingPane', function($newStreamItem, renderedDataObject, itemidwithoutcontainer, callback) {
                communicationsController.readingPaneView.refresh($newStreamItem, renderedDataObject, itemidwithoutcontainer, callback);
            }).addListener('showReadingPaneData', function($data, objectData, streamItemView, promise) {
                communicationsController.loadingStreamItem = true;
                promise.addCallback(function() {
                    if (communicationsController.viewType == 'full') {
                        communicationsController.setListVisible(false);
                    }
                    communicationsController.loadingStreamItem = false;
                });
                communicationsController.readingPaneView.showReadingPaneData($data, objectData, streamItemView, promise);
            }).addListener('showReadingPane', function(promise) {
                if (communicationsController.viewType == 'full') {
                    communicationsController.setListVisible(false);
                }
                promise.emitSuccess();
            }).addListener('showRTE', function(itemData, $replyActivity, promise) {
                communicationsController.readingPaneView.showRTE(itemData, $replyActivity, promise);
            }).addListener('backToList', function() {
                communicationsController.setListVisible(true);
            });
    
        };
    
        this.attachListEventListener = function(event, handler) {
            this.communicationsList.addListener(event, handler);
        };
    
        this.autoUpdate = function(data) {
            var communicationsController = this;
            if (!communicationsController.loadingStreamItem) {
                if (communicationsController.savedRefreshTime) {
                    communicationsController.lastRefreshTime = Number(communicationsController.savedRefreshTime);
                    communicationsController.savedRefreshTime = 0;
                }
                if (data.newActivityCounts[communicationsController.streamType] &&
                    data.newActivityCounts[communicationsController.streamType][communicationsController.streamID+''] &&
                    $('#j-comm-activity-list').is(':visible')) {
                    this.spinner = new jive.loader.LoaderView({size: 'small'});
                    this.spinner.prependTo($('#j-js-communications'));
                    var spinner = this.spinner;
                    communicationsController.listService.list(
                        {objectType:communicationsController.contextObjectType,
                         objectID:communicationsController.contextObjectID,
                         streamSource: communicationsController.streamType,
                         streamID: communicationsController.streamID,
                         filterType:communicationsController.filterType,
                         queryParam:communicationsController.queryParam,
                         timestamp: communicationsController.lastRefreshTime + ''}).addCallback(function(data) {
                            communicationsController.lastRefreshTime = data.activityStream.timepoints.last;
                            if (data.activityStream.activityContainerList.length) {
                                communicationsController.communicationsList.refresh(data);
                            }
                            spinner.getContent().remove();
                            spinner.destroy();
                        });
                }
    
                communicationsController.updateUnreadMarkers(data.fullCounts.communications.unreadItems);
    
            }
        };
    
        this.getLastLoadTime = function(){
            return Number(Number(this.savedRefreshTime) == 0 ? this.lastRefreshTime : this.savedRefreshTime);
        }
    
        this.hideStream = function() {
            var communicationsController = this;
            $('#j-js-communications').hide();
        };
    
        this.hideExpandedView = function() {
            this.readingPaneView.collapseReadingPane();
        };
    
        protect.buildFilterMenu = function() {
            var communicationsController = this;
            var $menu = $(jive.eae.inbox.filtermenu({
                dmEnabled: communicationsController.dmEnabled
            }));
            // click handler for the filter type link
            $('a', $menu).click(function(e){
                var filterName = $(this).attr('data-filterName'),
                    filterDisplayName = $(this).text();
                if ($.inArray('unread', communicationsController.filterType) != -1) {
                    communicationsController.filterType = [filterName, 'unread'];
                }
                else {
                    communicationsController.filterType = [filterName];
                }
                communicationsController.loadStream();
                communicationsController.toggleFilterSelectedBar(filterDisplayName);
                $menu.trigger('close');
                e.preventDefault();
            });
            return $menu;
        };
    
        this.addUnreadItem = function(objectType, objectId){
            this.unreadSinceLastUpdate.push({objectType: objectType, objectId: objectId})
        }
    
        this.getUnreadSinceLastUpdate = function(){
            return this.unreadSinceLastUpdate;
        }
    
        this.clearUnreadSinceLastUpdate =function(){
            this.unreadSinceLastUpdate = [];
        }
    
        this.updateUnreadMarkers = function(unreadItems) {
            var communicationsController = this;
            if (unreadItems.length < 51) {
                // we know the exact set of unreadItems for this user
                communicationsController.communicationsList.updateUnreadMarkers(unreadItems);
            }
            this.clearUnreadSinceLastUpdate();
        };
    
        this.setListVisible = function(listVisible) {
            var communicationsController = this,
                $commsView = $('#j-js-communications');
            if ($commsView.length) {
                if (listVisible) {
                    $commsView.removeClass('j-list-hidden').addClass('j-list-visible');
                }
                else {
                    $commsView.removeClass('j-list-visible').addClass('j-list-hidden');
                    $(window).scrollTop(0);
                }
                communicationsController.communicationsList.setListVisible(listVisible);
            }
        };
    
        this.changeViewType = function($link) {
            var communicationsController = this,
                newType = $link.data('type'),
                $commsView = $('#j-js-communications'),
                $commsList = $('#j-communications-list');
            if (communicationsController.viewType != newType) {
                communicationsController.viewType = newType;
                if (newType == 'full') {
                    communicationsController.listHeight = $commsList.height();
                    $commsView.removeClass('j-split-view').addClass('j-full-view');
                    $commsList.css('height', '100%');
                }
                else {
                    communicationsController.setListVisible(true);
                    $commsView.removeClass('j-full-view').addClass('j-split-view');
                    $commsList.height(communicationsController.listHeight);
                }
                communicationsController.listService.saveInboxViewType(newType);
                communicationsController.readingPaneView.switchViewType(newType);
                communicationsController.communicationsList.switchViewType(newType);
    
                $commsView.find('a.j-js-inbox-pane-toggle').removeClass('j-active');
                $link.addClass('j-active');
            }
        };
    
        // handle the re-selection of the Inbox in the home left nav (make sure list view is showing if in full-pane mode)
        this.homeNavClicked = function() {
            var communicationsController = this;
            communicationsController.setListVisible(true);
        };
    
        this.getDynamicPaneArea = function() {
            return $('#j-dynamic-pane');
        };
    
        this.tearDown = function() {
            jive.ActivityStream.activityNotifier.removeListener('activityStream.poll', this.commsPollHandler);
        };
    });
});
    
