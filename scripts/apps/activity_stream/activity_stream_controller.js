/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * ActivityStream
 *
 * Main class for controlling activity stream UI behavior
 *
 * @depends path=/resources/scripts/apps/activity_stream/views/activity_stream_list_view.js
 * @depends path=/resources/scripts/apps/activity_stream/models/activity_stream_source.js
 * @depends path=/resources/scripts/apps/activity_stream/models/activity_stream_exclusion.js
 * @depends path=/resources/scripts/apps/activity_stream/models/activity_stream_exclusion_info.js
 * @depends path=/resources/scripts/apps/activity_stream/models/activity_stream_exclusion_rules.js
 * @depends path=/resources/scripts/apps/discussion_app/models/discussion_rest_source.js
 * @depends path=/resources/scripts/jive/acclaim.js
 * @depends path=/resources/scripts/apps/like/models/like_source.js
 * @depends path=/resources/scripts/apps/like/like.js
 * @depends path=/resources/scripts/apps/comment_app/models/comment.js
 * @depends path=/resources/scripts/apps/comment_app/models/comment_count.js
 * @depends path=/resources/scripts/apps/comment_app/models/comment_source.js
 * @depends path=/resources/scripts/apps/shared/models/meta_source.js
 * @depends path=/resources/scripts/apps/content/polls/widget/models/widget_source.js
 *
 * @depends template=jive.polls.widget.soy.*
 * @depends template=jive.eae.activitystream.streamSpecificFilters
 * @depends template=jive.eae.activitystream.filterMenu
 */

jive.namespace('ActivityStream');

/**
 * Controller for EAE activity Stream
 *
 * @class
 *
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/apps/activity_stream/activity_notifier.js
 */
define('jive.ActivityStream.ActivityStreamControllerMain', [
    'jquery'
], function($) {
    return jive.oo.Class.extend(function(protect) {
        // Mix in observable to make this class an event emitter.
        jive.conc.observable(this);

        this.init = function (options) {
            var streamController = this;
            jive.ActivityStreamApp = jive.ActivityStreamApp || {};
            jive.ActivityStreamApp.instance = this;
            this.ie7 = $.browser.msie && $.browser.version < 8;
            if (this.ie7) {
                $.fx.off = true;
            }
            this.userId = window._jive_effective_user_id;
            this.commentServiceOptions = {
                listAction: '',
                location: 'jive-comments',
                commentMode: 'comments',
                isPrintPreview: false
            };
            this.listService = new jive.ActivityStream.StreamSource();
            this.disscusionService = new jive.DiscussionApp.DiscussionRestSource();
            this.microbloggingService = new jive.MicroBlogging.MicroBloggingSource();
            this.liking = new jive.Liking.LikeSource({});
            this.metaService = new jive.MetaSource();
            // used to keep track of draft wall entry
            this.draftWallEntry = null;

            if (options) {
                this.setOptions(options);
                this.streamList = new jive.ActivityStream.ActivityStreamListView(
                    {selector:'#j-stream-item-list'+(this.widgetID ? '-'+this.widgetID : ''),
                    data: options.data,
                    streamType:this.streamType,
                    filterType:this.filterType,
                    timepoints: options.timepoints,
                    rteOptions: this.rteOptions,
                    widgetID: this.widgetID,
                    connectionsInfoClosed: this.connectionsInfoClosed,
                    infoType: this.infoType,
                    infoUser: this.infoUser});
                this.attachListHandlers(this.streamList);
                this.streamList.postRender();
                this.emit('clearUpdates', this.streamType, this.streamID);
            }
            this.asPollHandler = function(data) {
                streamController.showUpdates(data);
            };

            if (this.streamType != 'context' && this.streamType != 'profile') {
                jive.ActivityStream.activityNotifier.addListener('activityStream.poll', this.asPollHandler);
            }
        };

        this.setOptions = function(options) {
            var streamController = this;
            streamController.rteOptions = options.rteOptions;
            streamController.mobileUI = options.rteOptions.mobileUI;
            streamController.contextObjectType =  options.contextObjectType;
            streamController.contextObjectID = options.contextObjectID;
            streamController.streamType = options.streamType;
            streamController.streamID = options.streamID;
            streamController.tabViewSelector = options.tabViewSelector;
            streamController.getMoreStreamType = options.getMoreStreamType;
            streamController.widgetID = options.widgetID;
            streamController.filterType = options.filterType ? options.filterType : ['all'];
            streamController.canViewStatusUpdates = options.canViewStatusUpdates;
            streamController.recommenderEnabled = options.recommenderEnabled;
            streamController.connectionsInfoClosed = options.connectionsInfoClosed;
            streamController.infoType = options.infoType;
            streamController.infoUser = options.infoUser;
        };


        this.attachListHandlers = function(streamList) {
            var streamController = this;

            streamController.getDynamicPaneArea().off().on('click', 'button.j-js-edit-stream', function(e) {
                // for the Edit Connections Stream button in info box when Connections stream is empty
                streamController.emitP('loadBuilderView', streamController.streamID);
                e.preventDefault();
            }).on('click', '#as-filter-trigger', function(e) {
                // a drop-down style filter control is on the page
                var $button = $(this),
                    $menu = $(jive.eae.activitystream.filterMenu());
                $('a', $menu).click(function(e2){
                    var $filterLink = $(this),
                        filterDisplayName = $filterLink.text();
                    streamController.filterStream($filterLink);
                    $menu.trigger('close');
                    e2.preventDefault();
                });
                $menu.popover({
                    context:$button
                });
                e.preventDefault();
            }).on('click', '#filterlinks a', function(e){
                // regular list of filter links is on the page
                var $this = $(this);
                    streamController.filterStream($(this));
                $('#filterlinks a').removeClass('j-sub-selected font-color-normal');
                $this.addClass('j-sub-selected font-color-normal');
                e.preventDefault();
            }).on('click', '#filters-applied a.js-remove-filter', function(e) {
                streamController.toggleFilterSelectedBar();
                streamController.filterType = ['all'];
                if (streamController.spinner) {
                    streamController.spinner.getContent().remove();
                    streamController.spinner.destroy();
                }
                streamController.spinner = new jive.loader.LoaderView();
                streamController.spinner.prependTo(streamController.getDynamicPaneArea());
                var promise = new jive.conc.Promise();
                promise.addCallback(function() {
                    streamController.spinner.getContent().remove();
                    streamController.spinner.destroy();
                });
                streamController.loadStream(streamController.streamType, streamController.streamID, false, promise);
                e.preventDefault();
            });

            streamList.addListener('replySubmit', function(replyData, callback, errorCallback){
                var textBody = $(replyData.body).text();
                streamController.disscusionService.createMessage(replyData).addCallback(function(data) {
                    // set text for rendering stub, html should be set by service
                    data.content.text = textBody;
                    callback(data);
                    jive.switchboard.emit('activity.stream.comment.created');
                // Run a callback when an error occurs during
                // the server call.
                }).addErrback(function(message, status) {
                    errorCallback(message, status);
                });
            }).addListener('commentSubmit', function(replyData, callback, errorCallback){
                streamController.commentServiceOptions.resourceID = replyData.ID;
                streamController.commentServiceOptions.resourceType = replyData.typeID;
                streamController.commentServiceOptions.contentObject = {document:replyData.ID,
                                                                        version:replyData.version};
                var commentMode = "comments";
                if (replyData.isBackChannelComment) {
                    commentMode = "backchannel";
                }
                streamController.commentServiceOptions.commentMode = commentMode;
                streamController.commentService = new jive.CommentApp.CommentSource(streamController.commentServiceOptions);
                var comment = new jive.CommentApp.Comment({body:replyData.body,
                                                           commentMode:commentMode,
                                                           parentCommentID:replyData.parentCommentID,
                                                           name:replyData.name,
                                                           email:replyData.email,
                                                           url:replyData.url});
                streamController.commentService.save(comment).addCallback(function(data) {
                    callback(data);
                    jive.switchboard.emit('activity.stream.comment.created');
                // Run a callback when an error occurs during
                // the server call.
                }).addErrback(function(message, status) {
                    errorCallback(message, status);
                    return false;
                });
            }).addListener('getLikeData', function(type, id, callback){
                streamController.liking.getLikeData(type, id).addCallback(function(data) {
                    callback(type, id, data);
                });
            }).addListener('unhidemenu', function(data, callback) {
                var exclusionItemInfo = new jive.ActivityStream.ActivityStreamExclusionInfo({
                    userID:streamController.userId, objectType:data.objectType, objectID:data.objectID,
                    containerType:data.containerType, containerID:data.containerID,
                    interactedObjectType:data.objectType, interactedObjectID:data.objectID});
                streamController.listService.exclusionRules(exclusionItemInfo).addCallback(function(data) {
                    callback(data);
                });
            }).addListener('hide', function(type, data, hide, rehide, callback){
                var excludeAction = 'exclude';
                if (!hide) {
                    excludeAction = 'include';
                }
                var exclusionData = new jive.ActivityStream.ActivityStreamExclusion({
                    userID:streamController.userId, excludeAction: excludeAction,
                    interactedObjectType: data.objectType, interactedObjectID: data.objectID});
                if (type == 'item') {
                    exclusionData.setObjectType(data.objectType);
                    exclusionData.setObjectID(data.objectID);
                }
                else if (type == 'context') {
                    exclusionData.setObjectType(data.containerType);
                    exclusionData.setObjectID(data.containerID);
                }
                else if (type == 'type-context') {
                    exclusionData.setObjectType(data.containerType);
                    exclusionData.setObjectID(data.containerID);
                    exclusionData.setContentType(data.objectType);
                }
                streamController.listService.exclude(type, exclusionData).addCallback(function (data) {
                    callback(type, data, hide, rehide);
                });
            }).addListener('loadMore', function(beforeThisTime, callback){
                streamController.listService.getMore(
                    {objectType:streamController.contextObjectType,
                     objectID:streamController.contextObjectID,
                     streamSource: streamController.streamType,
                     streamID: streamController.streamID || '0',
                     filterType:streamController.filterType,
                     timestamp: beforeThisTime,
                     includeUpdateCount: false}).addCallback(function(data) {
                        callback(data);
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
                    streamController.listService.getFullContent(objectData.objectType, objectData.objectID).addCallback(function(data) {
                        callback(data);
                    });
                }
            }).addListener('getFullReplies', function(objectData, fullRepliesRequest, callback) {
                streamController.listService.getFullReplies(objectData.objectType, objectData.objectID, fullRepliesRequest).addCallback(function(fullRepliesResponse) {
                    callback(fullRepliesResponse);
                });
            }).addListener('fillInTheGaps', function(objectData, fillInTheGapRequest, callback) {
                streamController.listService.fillInTheGaps(objectData.objectType, objectData.objectID, fillInTheGapRequest).addCallback(function(fillInTheGapResponse) {
                    callback(fillInTheGapResponse);
                });
            }).addListener('fillInStreamItem', function(objectType, objectID, timestamp, count, promise) {
                var fillActivityRequest = {
                    streamSource: streamController.streamType,
                    streamID: streamController.streamID || '0',
                    timestamp: timestamp,
                    fullContent: false,
                    pageSize: count
                };
                streamController.listService.fillActivity(objectType, objectID, fillActivityRequest, promise);
            }).addListener('updateStream', function(promise) {
                streamController.spinner = new jive.loader.LoaderView();
                streamController.spinner.prependTo(streamController.getDynamicPaneArea());
                streamController.listService.list(
                    {objectType:streamController.contextObjectType,
                     objectID:streamController.contextObjectID,
                     streamSource: streamController.streamType,
                     streamID: streamController.streamID || '0',
                     filterType:streamController.filterType,
                     timestamp: '0',
                     includeUpdateCount: false}).addCallback(function(data) {
                     streamController.emit('clearUpdates', streamController.streamType, streamController.streamID);
                     streamController.getDynamicPaneArea().find('.j-js-updates-since-refresh').remove();
                     data.filterType = streamController.filterType;
                     streamController.spinner.getContent().remove();
                     streamController.spinner.destroy();
                     promise.emitSuccess(data);
                });
            });
        };

        this.filterStream = function($link) {
            var streamController = this,
                filterName = $link.attr('data-filterName');

            if ($.inArray(filterName, streamController.filterType) == -1) {
                streamController.filterType = [filterName];
                if (streamController.spinner) {
                    streamController.spinner.getContent().remove();
                    streamController.spinner.destroy();
                }
                streamController.spinner = new jive.loader.LoaderView();
                streamController.spinner.prependTo(streamController.getDynamicPaneArea());
                var promise = new jive.conc.Promise();
                promise.addCallback(function() {
                    streamController.spinner.getContent().remove();
                    streamController.spinner.destroy();
                });
                streamController.loadStream(streamController.streamType, streamController.streamID, false, promise);
            }
        };

        this.toggleFilterSelectedBar = function(filterName) {
            var streamController = this,
                $filterSelectedBar = $('#filters-applied');
            if ($filterSelectedBar.length) {
                if (filterName) {
                    $filterSelectedBar.fadeOut('fast', function() {
                        if ($.inArray('all', streamController.filterType) == -1) {
                            $filterSelectedBar.find('.j-act-filter-display-name').text(filterName);
                            $filterSelectedBar.fadeIn('fast');
                        }
                    });
                }
                else {
                    $filterSelectedBar.fadeOut('fast');
                }
            }
        };

        this.loadStream = function(streamType, streamID, includeUpdateCount, promise) {
            var streamController = this;

            if (!streamController.filterType) {
                streamController.filterType = ['all'];
            }
            streamController.listService.list(
                {objectType:streamController.contextObjectType,
                 objectID:streamController.contextObjectID,
                 streamSource: streamType,
                 streamID: streamID || '0',
                 filterType: streamController.filterType,
                 timestamp: '0',
                 includeUpdateCount: includeUpdateCount || false}, promise).addCallback(
                function(data) {
                    data.streamType = streamController.streamType = streamType;
                    streamController.streamID = streamID;
                    data.filterType = streamController.filterType;
                    data.connectionsInfoClosed = streamController.connectionsInfoClosed;
                    data.infoType = streamController.infoType;
                    data.infoUser = streamController.infoUser;
                    streamController.streamList.refresh(data);
                    streamController.getDynamicPaneArea().find('.j-act-header').replaceWith(jive.eae.activitystream.streamSpecificFilters({
                        streamDisplayName: data.streamDisplayName,
                        streamType: streamType,
                        selectedFilter: streamController.filterType,
                        recommenderEnabled: streamController.recommenderEnabled,
                        canViewStatusUpdates: streamController.canViewStatusUpdates,
                        numUpdatesSinceRefresh: (includeUpdateCount ? data.numUpdatesSinceRefresh: 0)
                    }));
                    if ($.inArray('all', streamController.filterType) != -1) {
                        streamController.emit('clearUpdates', streamType, streamID);
                    }
                    if (promise) {
                        promise.emitSuccess(data.streamDisplayName);
                    }
                }
            );
        };

        this.showUpdates = function(data) {
            var streamController = this;
            if (data.newActivityCounts[streamController.streamType] &&
                data.newActivityCounts[streamController.streamType][streamController.streamID] &&
                $.inArray('all', streamController.filterType) != -1 &&
                $('#j-activity-page').is(':visible')) {
                streamController.streamList.showUpdates(data.newActivityCounts[streamController.streamType][streamController.streamID]);
            }
        };

        this.getDynamicPaneArea = function() {
            return $('#j-dynamic-pane');
        };

        this.tearDown = function() {
            jive.ActivityStream.activityNotifier.removeListener('activityStream.poll', this.asPollHandler);
        };

        this.addActivityStreamListViewListener = function(event, listener) {
            this.streamList.addListener(event, listener);
        };
    });
});
