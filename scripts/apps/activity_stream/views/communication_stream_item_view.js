/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Represent an item in the activity stream list
 *
 * @depends path=/resources/scripts/jive/rte/renderedContent.js
 * @depends path=/resources/scripts/apps/activity_stream/views/stream_item_common_view.js
 * @depends path=/resources/scripts/apps/activity_stream/models/full_replies_request.js
 * @depends path=/resources/scripts/apps/usercollaboration/user_collaboration_controller.js
 * @depends path=/resources/scripts/apps/read_tracking/main.js
 * @depends template=jive.eae.acclaim.*
 * @depends template=jive.eae.inbox.groupedCommStreamItem
 * @depends template=jive.eae.inbox.commListItemView
 * @depends template=jive.eae.inbox.expandedCommItemView
 * @depends template=jive.eae.inbox.collaboratorParticipantsModal
 * @depends template=jive.eae.inbox.collaboratorParticipantsI18NHelper
 * @depends template=jive.eae.inbox.showMoreEllipses
 * @depends template=jive.eae.common.loadingSpinner
 * @depends template=jive.eae.common.jsI18nHelper
 * @depends template=jive.eae.common.subactivity
 * @depends template=jive.eae.common.activityContentText
 * @depends template=jive.eae.common.replyCountText
 * @depends template=jive.eae.common.microRTEContainer
 * @depends template=jive.eae.activitystream.expandedActivityStreamItemView
 * @depends template=jive.discussions.soy.qDisplayInlineAnswers
 */

jive.namespace('ActivityStream');

jive.ActivityStream.CommunicationStreamItemView = jive.ActivityStream.StreamItemCommonView.extend(function(protect, _super) {
    this.init = function (options) {
        _super.init.call(this, options);
        // num current should never be 0 for a comm stream item, but if it is due to a deletion, replying to an object
        // before it enters the commstream, or random reason, we'll always have one item set current for us manually
        // in the stream, so set the num current to 1
        if (this.data.numCurrent == 0) {
            this.data.numCurrent = 1;
        }
        this.hideData = {objectType: parseInt(this.hideDataArr[1]),
                         objectID: parseInt(this.hideDataArr[2]),
                         containerType: parseInt(this.hideDataArr[3]),
                         containerID: parseInt(this.hideDataArr[4])};

        this.subActivitiesByDomID = {};
        this.originalCommentIDs = [];

        this.newUserMode = options.newUserMode;
        this.instanceName = options.instanceName;

        this.activityListLength = this.data.activityList.length;

        for (var i = this.activityListLength - 1; i >= 0; i--) {
            this.subActivitiesByDomID[this.data.activityList[i].content.domIDPostfix] = this.data.activityList[i];
            if (this.data.activityList[i].content.typeMessage || this.data.activityList[i].content.typeComment) {
                this.originalCommentIDs.push(this.data.activityList[i].content.id);
            }
            else if (this.data.activityList[i].content.typeMention) {
                this.originalCommentIDs.push(this.data.activityList[i].content.context.id);
            }
        }
        this.latestUpTimestamp = this.data.activityList.length ?
                                 this.data.activityList[this.data.activityList.length-1].creationDate :
                                 0;
        this.fullRepliesLoaded = false;
        this.expandInProgress = false;
        this.expandedDataInitialized = false;
        this.passedLatestUpActivity = false;
    };

    this.getSoyTemplate = function(data){
        return jive.eae.inbox.groupedCommStreamItem(data);
    };

    this.handleClick = function(e, $targetParents, viewType, promise) {
        var streamItemView = this,
            $target = $j(e.target),
            $article = $target.closest('div.j-js-ibx-item'),
            defaultAction = false;

        if ($targetParents.filter('a.j-js-read-trigger').length) {
            // The rest of the read tracking handling is handled elsewhere (i.e. - read_tracking_view.js)
            streamItemView.data.read = true;
        }
        else if ($targetParents.filter('a.j-js-unread-trigger').length) {
            streamItemView.data.read = false;
        }

        if ($targetParents.filter('div.j-comm-entry').length) {
            defaultAction = streamItemView.expandClickHandler(e, true, (viewType == 'full' || !$article.hasClass('j-act-active')), promise);
        }
        else if ($target.hasClass('js-act-addrecipients')) {
            var $collabModal = $j(jive.eae.inbox.collaboratorParticipantsModal()),
                currentParticipantIDs = {};
                for (var i = 0, participantsLength = streamItemView.data.participants.length; i < participantsLength; i++) {
                    currentParticipantIDs[streamItemView.data.participants[i].id] = '';
                }
            streamItemView.userCollaborationController = new jive.UserCollaboration.Main({
                participants: streamItemView.data.participants,
                objectuser: streamItemView.data.jiveObject.user,
                currentUser: streamItemView.viewingUserData,
                item: streamItemView.data.jiveObject,
                participantsInput: $collabModal.find('#participants'),
                form: $collabModal.find('form'),
                finishedCallback: function(users) {
                    for(var i = 0; i < users.length; i++){
                        if (!(users[i].id in currentParticipantIDs)) {
                            streamItemView.data.participants.push(users[i]);
                        }
                    }
                    $article.find('.j-author-act').html(jive.eae.inbox.collaboratorParticipantsI18NHelper({
                        activityContainer: streamItemView.data,
                        user: streamItemView.viewingUserData
                        }
                    ));
                }
            });
            $collabModal.lightbox_me({closeSelector: ".jive-modal-close-top, .close"});
        }
        else if ($targetParents.filter('.j-reply-rte').length) {
            streamItemView.replyRTE($target, $targetParents);
        }
        else if ($targetParents.filter('a.j-js-show-full-content').length){
            var $target = $targetParents.filter('a.j-js-show-full-content').first(),
                objectType = $target.attr('data-objectType'),
                objectID = $target.attr('data-objectID'),
                containerType = $target.attr('data-containerType'),
                containerID = $target.attr('data-containerID'),
                $expView = $target.closest('div.j-act-exp-view'),
                $fullContentView = $expView.find('div.js-full-content-body'),
                $fullContentContainer = $expView.find('div.js-full-content-container');

            $target.append(jive.eae.common.loadingSpinner());

            if (!$fullContentView.html()) {
                streamItemView.emit('getFullContent', {objectType: objectType,
                                                       objectID: objectID,
                                                       containerType: containerType,
                                                       containerID: containerID}, function(data) {
                    $fullContentView.html(data.html);
                    if (data.extraData.poll) {
                        // init poll view, if necessary
                        streamItemView.initPollView(data.extraData, $fullContentContainer);
                    }
                    else if (data.extraData.questionData && (data.extraData.questionData.correctAnswer || data.extraData.questionData.helpfulAnswers.length)) {
                        // show "correct answer", etc. if question data is present
                        var questionStateEnum = {open : 'open', resolved : 'resolved', assumed_resolved : 'assumed_resolved'},
                            $questionHTML = $j(jive.discussions.soy.qDisplayInlineAnswers({
                                question:data.extraData.questionData,
                                questionStateEnum:questionStateEnum,
                                i18n:{
                                    correctAnswer: jive.eae.common.jsI18nHelper({key: 'forum.thrd.correct_answer.link'}),
                                    byWord: jive.eae.common.jsI18nHelper({key: 'global.by'}),
                                    onWord: jive.eae.common.jsI18nHelper({key: 'global.on'}),
                                    helpfulAnswers: jive.eae.common.jsI18nHelper({key: 'question.helpfulAnswers.text'}),
                                    helpfulAnswer: jive.eae.common.jsI18nHelper({key: 'forum.thrd.helpful_answer.link'}),
                                    seeThisAnswer: jive.eae.common.jsI18nHelper({key: 'question.seeThisAnswer.text'})
                                },
                                currentUserPartner : _jive_current_user.partner
                            }));
                        $fullContentView.append($questionHTML);
                    }

                    $fullContentContainer.fadeIn('fast');
                    $expView.find('div.j-act-header-slug').hide();
                    $target.find('.j-loading-spinner').remove();
                    $target.hide();
                    $target.next('a.j-js-hide-full-content').show();
                    jive.rte.renderedContent.emit("renderedContent", $fullContentView);
                });
            }
            else {
                $fullContentContainer.fadeIn('fast');
                $expView.find('div.j-act-header-slug').hide();
                $target.find('.j-loading-spinner').remove();
                $target.hide();
                $target.next('a.j-js-hide-full-content').show();
            }
        }
        else if ($targetParents.filter('a.j-js-hide-full-content').length) {
            $target = $targetParents.filter('a.j-js-hide-full-content').first();
            $expView = $target.closest('div.j-act-exp-view');
            $fullContentContainer = $expView.find('div.js-full-content-container');

            $fullContentContainer.hide();
            $expView.find('div.j-act-header-slug').show();
            $target.hide();
            $target.prev('a.j-js-show-full-content').show();
        }
        else if ($targetParents.filter('a.j-js-show-older').length) {
            $this = $targetParents.filter('a.j-js-show-older').first();

            if (!$this.hasClass('j-js-loading')) {
                $this.addClass('j-js-loading');
                $this.append(jive.eae.common.loadingSpinner());

                if ($article.hasClass('j-act-grouped')) {
                    // only latest acclaim
                    objectType = $article.attr('data-objectType');
                    objectID = $article.attr('data-objectID');
                    var earliestActivityTime = null,
                        $hiddenItems = $article.find('li.j-act-g-item').filter(function() {
                            var $lineItem = $j(this),
                                parenttime = $lineItem.data('timestamp');
                            if (!earliestActivityTime || parenttime < earliestActivityTime) {
                                earliestActivityTime = parenttime;
                            }
                            return $j(this).css('display') == 'none';
                        }),
                        hiddenItemCount = $hiddenItems.length,
                        extraItemCountToFillIn = 5;
                    if (hiddenItemCount) {
                        // there were digest line items that were hidden (because the server returned more than 5), show
                        // them at this point and possibly pull in a few more to make at least 5 items appear on expand
                        $hiddenItems.show();
                        extraItemCountToFillIn = ((5 - hiddenItemCount) > 0 ? (5 - hiddenItemCount) : 0)
                    }
                    if (extraItemCountToFillIn) {
                        streamItemView.emitP('fillInStreamItem', objectType, objectID, earliestActivityTime, extraItemCountToFillIn).addCallback(function(data) {
                            $article.find('.j-act-g-list').append(streamItemView.buildMoreDigestItems({
                                activityList: data.items,
                                jiveObject: {expandedActivityStreamViewTemplate:streamItemView.data.jiveObject.expandedActivityStreamViewTemplate}
                            }));
                            if (!data.hasMore) {
                                $article.find('div.j-preview-trigger').remove();
                            }
                            $this.find('.j-loading-spinner').remove();
                            $this.removeClass('j-js-loading');
                        });
                    }
                    else {
                        $this.find('.j-loading-spinner').remove();
                        $this.removeClass('j-js-loading');
                    }
                }
                else {
                    if (streamItemView.data.jiveObject.objectType == 1500) {
                        $expView = $target.closest('div.j-act-exp-view');
                        var $subActivityList = $expView.find('.j-sub-activity-items'),
                            subActivities = $subActivityList.find("[id^=node-collapsed-]"),
                            subActivitiesLength = subActivities.length;
                        for (i = 0; i < subActivitiesLength; i++) {
                            var $subActivity = $j(subActivities[i]);
                            $subActivity.show();
                        }
                        $this.hide();
                        $this.removeClass('j-js-loading');
                        $this.find('.j-loading-spinner').remove();
                    }
                    else {
                        streamItemView.getEarlierSubActivities(5, function () {
                            $this.removeClass('j-js-loading');
                            $this.find('.j-loading-spinner').remove();
                        });
                    }
                }
            }
        }
        else if ($targetParents.filter('a.j-act-track-comms').length) {
            var $this = $targetParents.filter('a.j-act-track-comms').first();
            streamItemView.emitP('track', streamItemView.hideData).addCallback(function(){
                $this.hide();
                $this.parent().find('a.j-act-untrack').show();
            });
        }
        else if ($targetParents.filter('a.j-act-untrack').length) {
            var $this = $targetParents.filter('a.j-act-untrack').first();
            streamItemView.emitP('untrack', streamItemView.hideData).addCallback(function(){
                $this.hide();
                $this.parent().find('a.j-act-track-comms').show();
            });
        }
        else if ($targetParents.filter('a.js-status-legend-link').length) {
            var $link = $targetParents.filter('a.js-status-legend-link').first(),
                $legend = $article.find('.js-acclaim-legend');
            if ($legend.length) {
                $legend.popover({
                    context: $link,
                    putBack: true,
                    destroyOnClose: false
                });
            }
        }
        else {
            var $container = '';
            if ($target.closest('#j-js-communications-exp').length) {
                $container = $j('#j-js-communications-exp');
            }
            defaultAction = streamItemView.handleClickCommon($target, e, $targetParents, $container);
            if (promise) {
                promise.emitSuccess();
            }
        }
        return defaultAction;
    };

    this.expandClickHandler = function (e, markRead, showExpView, promise){
        var streamItemView = this,
            $article = streamItemView.getContent(),
            $readingPane = $j('#j-js-communications-exp'),
            $readingPaneExpView = $readingPane.find('div.j-act-exp-view'),
            expLinkedID = '',
            readingPaneRefreshInProgress = false;

        if (e && streamItemView.expandCollapseTargetCheck(e)){
            promise.emitSuccess();
            return true;
        }

        if ($readingPaneExpView.length) {
            expLinkedID = $readingPaneExpView.attr('data-linkedID');
            readingPaneRefreshInProgress = $readingPane.data('refreshing');
        }

        if (!streamItemView.expandInProgress && !readingPaneRefreshInProgress && showExpView) {
            streamItemView.expandInProgress = true;
            var $expView = $article.find('div.j-act-exp-view');

            if (!$expView.length) {
                // generate expanded view on demand on first expand instead of finding the shell after pageload
                $expView = $j(jive.eae.inbox.expandedCommItemView({
                        activityContainer: streamItemView.data,
                        user: streamItemView.viewingUserData,
                        streamType: 'communications',
                        filterType: streamItemView.filterType,
                        canCreateMBImage: streamItemView.canCreateMBImage,
                        canCreateMBVideo: streamItemView.canCreateMBVideo,
                        mobileUI: streamItemView.mobileUI,
                        newUserMode: streamItemView.newUserMode,
                        instanceName: streamItemView.instanceName,
                        mbCreationModerated: streamItemView.mbCreationModerated
                    }));
                // for embedded app experiences, make sure to call renderedContent on the new expanded view
                jive.rte.renderedContent.emit("renderedContent", $expView);
            }
            else {
                $expView.detach();
            }

            if ($expView.length && expLinkedID != $expView.attr('data-linkedID')) {
                streamItemView.spinner = new jive.loader.LoaderView({size: 'small'});
                streamItemView.spinner.prependTo($article);
                var spinner = streamItemView.spinner,
                    immediateFillInTheGapsPageSize = 0;
                streamItemView.getFullReplies($expView, function() {
                    var objectType = $article.attr('data-objectType'),
                        objectID = $article.attr('data-objectID'),
                        containerType = $article.attr('data-containerType'),
                        containerID = $article.attr('data-containerID');

                    if (!streamItemView.expandedDataInitialized) {
                        var $subActivityList = $expView.find('.j-sub-activity-items'),
                            subActivities = $subActivityList.find("[id^=node-collapsed-]"),
                            numLoadedComments = streamItemView.data.activityList.filter(function(activity) {
                                    return (activity.content.typeComment || activity.content.typeMessage ||
                                        activity.content.typeMention);
                                }).length,
                            subActivitiesLength = subActivities.length,
                            showEarlier = false;

                        for(var i = 0; i < subActivitiesLength; i++) {
                            var $subActivity = $j(subActivities[i]);
                            if (!$subActivity.attr('data-current')) {
                                $subActivity.hide();
                                showEarlier = true;
                            }
                            else {
                                $subActivity.show();
                            }
                        }
                        if (showEarlier || (numLoadedComments < streamItemView.data.replyCount &&
                                            streamItemView.data.jiveObject.objectType != 1500)) {
                            // 1500 is a StreamChannel, and StreamChannels aren't "suppposed" to have replies,
                            // but apparently the replyCount can be non-zero
                            $expView.find('a.j-js-show-older').show();
                            if (streamItemView.data.jiveObject.objectType != 1500) {
                                immediateFillInTheGapsPageSize = 2;
                            }
                        }
                    }

                    var prevArticleExists = $article.prev().length,
                        nextArticleExists = $article.next().length; //includes load more

                    if (streamItemView.data.jiveObject.typeShare) {
                        // change the objectType/ID to that of the shared object so the reading pane can pull the
                        // full html of the shared object correctly.
                        objectType = streamItemView.data.jiveObject.sharedObject.objectType;
                        objectID = streamItemView.data.jiveObject.sharedObject.id;
                    }
                    streamItemView.emitP('showReadingPaneData', $expView, {objectType: objectType,
                                                                           objectID: objectID,
                                                                           containerType: containerType,
                                                                           containerID: containerID,
                                                                           prevArticleExists: prevArticleExists,
                                                                           nextArticleExists: nextArticleExists,
                                                                           immediateFillInTheGapsPageSize: immediateFillInTheGapsPageSize}).addCallback(function() {
                        $j('#j-communications-list').children('div.j-js-ibx-item').removeClass('j-act-active');
                        $article.addClass('j-act-active');
                        // resize attachment view, to add scrolly arrows, if necessary
                        if (streamItemView.data.jiveObject.typeWallEntry) {
                            var attachContainerID = 'collapsed-attachmentContainer-'+streamItemView.data.jiveObject.domIDPostfix;
                            if (attachContainerID in jive.MicroBlogging.AttachmentView.views) {
                                jive.MicroBlogging.AttachmentView.views[attachContainerID].resize();
                            }
                        }
                        streamItemView.expandedDataInitialized = true;
                        spinner.getContent().remove();
                        spinner.destroy();
                        if (markRead) {
                            jive.ReadTracking.readController.markRead($article.find('a.j-js-read-trigger'));
                        }
                        streamItemView.expandInProgress = false;
                        // not sure why this is needed, as we fire renderedContent when fetching full replies,
                        // but sometimes images in replies in the reading pane don't get lightboxed correctly
                        // without this extra emit here.
                        jive.rte.renderedContent.emit("renderedContent", $expView);
                        promise.emitSuccess();
                    });
                });
                var domObjectType = $article.attr('id').split("_")[1],
                    domObjectID = $article.attr('id').split("_")[2];
                streamItemView.emit('saveLastViewedItem', domObjectType, domObjectID);
            }
            else if (expLinkedID == $expView.attr('data-linkedID')) {
                // data in expanded view is already this object's exp view, just make sure the exp view is showing.
                // (only hits this if view is full view)
                streamItemView.emitP('showReadingPane').addCallback(function() {
                    if (markRead) {
                        jive.ReadTracking.readController.markRead($article.find('a.j-js-read-trigger'));
                    }
                    streamItemView.expandInProgress = false;
                    promise.emitSuccess();
                });
            }
            else {
                streamItemView.expandInProgress = false;
                promise.emitSuccess();
            }
        }
        else if (!streamItemView.expandInProgress && !readingPaneRefreshInProgress && markRead) {
            jive.ReadTracking.readController.markRead($article.find('a.j-js-read-trigger'));
            promise.emitSuccess();
        }
        else if (promise) {promise.emitSuccess();}
        if (e) {
            e.preventDefault();
        }
    };

    this.replyRTE = function($target, $targetParents) {
        var streamItemView = this,
            $replyableActivity = $target.closest('.j-act-rte-replyable'),
            data = {},
            $expView = $replyableActivity.closest('div.j-act-exp-view'),
            id = $replyableActivity.attr('id'),
            idPostfix = id.split('-')[id.split('-').length-1],
            $bottomParentReplyLink = $targetParents.filter('.j-act-parent-reply-view');
        if (!streamItemView.rteLoading) {
            streamItemView.rteLoading = true;
            if ($bottomParentReplyLink.length) {
                $bottomParentReplyLink.find('.j-act-replyto').hide();
            }
            data.streamItemIdentifier = $expView.attr('data-linkedID');
            data.idPostfix = idPostfix;
            data.viewingUser = streamItemView.viewingUserData;
            data.parent = {};

            if ($replyableActivity.hasClass("j-js-mention-rte")) {
                // special case for replying to a place @mention, need to build up the data structures to send to the
                // rte handler manually.
                data.objectID = streamItemView.data.activityList[0].content.context.id;
                data.objectType = streamItemView.data.activityList[0].content.context.objectType;
                if (streamItemView.data.activityList[0].content.context.id !=
                    streamItemView.data.activityList[0].content.context.parentObjectID ||
                    streamItemView.data.activityList[0].content.context.objectType !=
                    streamItemView.data.activityList[0].content.context.parentObjectType) {
                    data.type = "sub";
                    data.activity = {};
                    data.activity.activityUser = streamItemView.data.activityList[0].activityUser;
                    data.activity.containerObjectType =
                        streamItemView.data.activityList[0].content.context.parentContainerID;
                    data.activity.containerObjectID =
                        streamItemView.data.activityList[0].content.context.parentContainerType;
                    data.activity.content = {};
                    data.activity.content.subject = streamItemView.data.activityList[0].content.context.name;
                    data.activity.content.id = streamItemView.data.activityList[0].content.context.id;
                }
                else {
                    data.type = "parent";
                }
                data.parent.container = {};
                data.parent.container.id = streamItemView.data.activityList[0].content.context.parentContainerID;
                data.parent.container.type = streamItemView.data.activityList[0].content.context.parentContainerType;
                data.parent.jiveObject = {};
                data.parent.jiveObject.subject = streamItemView.data.activityList[0].content.context.name;
                data.parent.jiveObject.id = streamItemView.data.activityList[0].content.context.parentObjectID;
                data.parent.jiveObject.objectType =
                    streamItemView.data.activityList[0].content.context.parentObjectType;
                data.parent.jiveObject.threadID = streamItemView.data.activityList[0].content.context.threadID;
                data.parent.jiveObject.typeThread =
                    streamItemView.data.activityList[0].content.context.parentTypeDiscussion;
                data.parent.jiveObject.versionNumber =
                    streamItemView.data.activityList[0].content.context.versionNumber;
                data.parent.jiveObject.url = streamItemView.data.activityList[0].content.context.jiveObjectURL;
                data.parent.originalAuthor = streamItemView.data.activityList[0].activityUser;
                var $parentHTMLContainer = $expView.find('.js-full-content-body .jive-rendered-content');
                data.htmlContent = $j.trim($parentHTMLContainer.html());
            }
            else {
                var subActivityData = streamItemView.subActivitiesByDomID[idPostfix];
                if (subActivityData &&
                    (subActivityData.content.typeComment ||
                    subActivityData.content.typeMessage ||
                    subActivityData.content.typeMention ||
                    subActivityData.content.typeExternalActivity)) {
                    data.type = "sub";
                    data.activity = subActivityData;
                    if (!subActivityData.content.typeExternalActivity) {
                        // don't attempt to quote app activity from rte
                        data.htmlContent =
                            $replyableActivity.find('.j-excerpt-full-html-content .jive-rendered-content').html();
                    }
                }
                else {
                    data.type = "parent";
                    var parentContent = '';
                    if (streamItemView.data.jiveObject.typeThread) {
                        // if a discussion ONLY, attempt to set whatever content we have of the root message to
                        // the htmlContent param, for rte quoting only.
                        $parentHTMLContainer = $expView.find('.js-full-content-body .jive-rendered-content');
                        if ($parentHTMLContainer.length) {
                            parentContent = $j.trim($parentHTMLContainer.html());
                        }
                        else {
                            parentContent = $j.trim($expView.find('.j-act-header-slug').html());
                        }
                    }
                    data.htmlContent = parentContent;
                    // change to last replyable link (if necessary) to use RTE on bottom of reading pane always for parent replies
                    $replyableActivity = $expView.find('div.j-act-rte-replyable').last();
                    $replyableActivity.find('.j-act-replyto').hide();
                }

                if (data.activity &&
                    data.activity.content.jsAppActivityRepliedToData &&
                    data.activity.content.jsAppActivityRepliedToData.id) {
                    //adjust parent data for the user self-replying to a comment against a grouped app activity
                    data.parent.jiveObject = {};
                    data.parent.jiveObject.id = data.activity.content.jsAppActivityRepliedToData.id;
                    data.parent.jiveObject.objectType = data.activity.content.jsAppActivityRepliedToData.objectType;
                }
                else {
                    data.parent.jiveObject = streamItemView.data.jiveObject;
                }

                data.parent.container = streamItemView.data.container;
                data.parent.originalAuthor = streamItemView.data.originalAuthor;
                data.objectID = $replyableActivity.attr('data-objectid');
                data.objectType = $replyableActivity.attr('data-objecttype');
                data.objectVisibility = $replyableActivity.attr('data-extvisible');

            }
            streamItemView.emitP('showRTE', data, $replyableActivity).addCallback(function () {
                streamItemView.rteLoading = false;
            });
        }
    };

    this.getEarlierSubActivities = function (pageSize, callback) {
        var streamItemView = this,
            fillInTheGapRequest = new jive.ActivityStream.FillInTheGapRequest({
                originalIDs: streamItemView.originalCommentIDs,
                timestamp:   streamItemView.gapTimestamp,
                fullContent: true,
                pageSize: pageSize + 1   //we're going to have to fetch one more to see if it's earlier than the
                                         // latest "up" item
            }),
            objectType,
            objectID = (streamItemView.data.jiveObject.typeThread ?
                        streamItemView.data.jiveObject.threadID :
                        streamItemView.data.jiveObject.id),
            $readingPaneContent = $j('#j-js-communications-exp div.j-act-ibx-exp-list');

        if (streamItemView.data.jiveObject.typeThread) {
            objectType = 1;
        }
        else if (streamItemView.data.activityList.length &&
                 streamItemView.data.activityList[0].content.commentContentResource &&
                 streamItemView.data.activityList[0].content.commentContentResource.objectType == 129) {
            // author comments against a doc (backchannel)
            objectType = 129;
        }
        else {
            objectType = streamItemView.data.jiveObject.objectType;
        }

        streamItemView.emit('fillInTheGaps', {objectType: objectType, objectID: objectID}, fillInTheGapRequest,
            function(data) {
            if (!streamItemView.passedLatestUpActivity) {
                streamItemView.passedLatestUpActivity = data.foundAnOriginal
            }
            if (!data.hasMore) {
                $readingPaneContent.find('a.j-js-show-older').hide();
                // make sure all possible sub-activities are showing at this point (might be some bookmark/modify/etc.
                // activities hidden if they were earliest)
                var $subActivities = $readingPaneContent.find('.j-sub-activity-items [id^=node-collapsed-]');
                $j($subActivities).each(function() {
                    $j(this).show();
                });
                streamItemView.passedLatestUpActivity = true;
            }
            else {
                $readingPaneContent.find('a.j-js-show-older').show();
                streamItemView.gapTimestamp = data.items[data.items.length-2].creationDate;
            }

            var dataItemsLength = data.items.length,
                $subActivitiesList = $readingPaneContent.find('.j-sub-activity-items').clone();
            // activities come back in reverse creation time order (newest to oldest)
            for (var i = 0; i < dataItemsLength; i++) {
                var newActivityObj = data.items[i],
                    inserted = false,
                    activityListLength = streamItemView.data.activityList.length;

                if (i == (dataItemsLength - 1)) {
                    if (newActivityObj.creationDate <= streamItemView.latestUpTimestamp) {
                        streamItemView.passedLatestUpActivity = true;
                        if (data.hasMore) {
                            break;
                        }
                    }
                    else if (data.hasMore) {
                        break;
                    }
                }

                //loop through existing activity items in earliest to latest order
                for (var existingListIndex = 0; existingListIndex < activityListLength; existingListIndex++) {
                    var iterActivity = streamItemView.data.activityList[existingListIndex];
                    if (parseInt(iterActivity.creationDate) > parseInt(newActivityObj.creationDate)) {
                        inserted = true;

                        streamItemView.subActivitiesByDomID[newActivityObj.content.domIDPostfix] = newActivityObj;
                        var $newExcerpt =
                            $j(jive.eae.common.subactivity(
                                {
                                    activity: newActivityObj,
                                    activityContainer:streamItemView.data,
                                    isHidden: false,
                                    user: streamItemView.viewingUserData,
                                    streamType: streamItemView.streamType,
                                    hideStub: true,
                                    addedInline: false,
                                    forceCurrent: false,
                                    canCreateMbImage: false, //doesn't matter
                                    canCreateMbVideo: false, //doesn't matter
                                    mbCreationModerated: false //doesn't matter
                                }
                            ));

                        if (existingListIndex == 0) {
                            $subActivitiesList.prepend($newExcerpt);
                            jive.rte.renderedContent.emit("renderedContent", $newExcerpt);
                            // the existing was created later than this new one, make sure the existing is now visible (might be a hidden bookmark or mod activity inserted on page load)
                            var $iterActivityDomItem = $subActivitiesList.find('#node-collapsed-'+iterActivity.content.domIDPostfix);
                            if ($iterActivityDomItem.css('display') == 'none') {
                                $iterActivityDomItem.css('display', 'block');
                            }
                        }
                        else {
                            $subActivitiesList.find('#node-collapsed-'+streamItemView.data.activityList[existingListIndex].content.domIDPostfix).before($newExcerpt);
                        }
                        // added to activity list, length and indexes of items changed
                        streamItemView.data.activityList.splice(existingListIndex,0,newActivityObj);
                        break;
                    }
                }
                if (!inserted) {
                    // new activity must be newer than all items in the existing list.
                    streamItemView.data.activityList.push(newActivityObj);
                    streamItemView.subActivitiesByDomID[newActivityObj.content.domIDPostfix] = newActivityObj;
                    $newExcerpt =
                        $j(jive.eae.common.subactivity(
                            {
                                activity: newActivityObj,
                                activityContainer:streamItemView.data,
                                isHidden: false,
                                user: streamItemView.viewingUserData,
                                streamType: streamItemView.streamType,
                                hideStub: true,
                                addedInline: false,
                                forceCurrent: false,
                                canCreateMbImage: false, //doesn't matter
                                canCreateMbVideo: false, //doesn't matter
                                mbCreationModerated: false //doesn't matter
                            }
                        ));
                    $subActivitiesList.append($newExcerpt);
                    jive.rte.renderedContent.emit("renderedContent", $newExcerpt);
                }
            }
            $subActivitiesList.find('div.js-ellipses').remove();
            if (!streamItemView.passedLatestUpActivity) {
                $newExcerpt.before(jive.eae.inbox.showMoreEllipses());
            }
            streamItemView.replaceAroundRTE($readingPaneContent.find('.j-sub-activity-items'), $subActivitiesList);
            if (callback) callback();
        });
    };

    this.replaceAroundRTE = function($liveActivityItems, $subActivitiesList) {
        var $liveRTE = $liveActivityItems.find('div.j-panel-rte-wrap'),
            rteIndex = $subActivitiesList.find('div.j-panel-rte-wrap').index();
        if ($liveRTE.length && rteIndex >= 0) {
            $liveRTE.prevAll().remove();
            $liveRTE.before($subActivitiesList.children().slice(0, rteIndex));
            $liveRTE.nextAll().remove();
            $liveRTE.after($subActivitiesList.children().slice(1)); //rte is now at index 0
        }
        else {
            $liveActivityItems.replaceWith($subActivitiesList);
        }
    };

    this.getFullReplies = function($expView, callback) {
        var streamItemView = this;

        if (!streamItemView.fullRepliesLoaded &&
            !streamItemView.data.jiveObject.typeMention &&
            !streamItemView.data.jiveObject.typeInboxEntry && // collaborator notification
            !streamItemView.data.jiveObject.typeAnnouncement &&
            !streamItemView.data.jiveObject.typeTask &&
            streamItemView.data.jiveObject.objectType != 1500 && //StreamChannel (no replies allowed on load). StreamEntry can have comments on load.
            streamItemView.originalCommentIDs.length) {
            var fullRepliesRequest = new jive.ActivityStream.FullRepliesRequest({originalIDs: streamItemView.originalCommentIDs}),
                objectType,
                objectID = (streamItemView.data.jiveObject.typeThread ? streamItemView.data.jiveObject.threadID : streamItemView.data.jiveObject.id);

            if (streamItemView.data.jiveObject.typeThread) {
                objectType = 1;
            }
            else if (streamItemView.data.activityList.length &&
                     streamItemView.data.activityList[0].content.commentContentResource &&
                     streamItemView.data.activityList[0].content.commentContentResource.objectType == 129) {
                objectType = 129;
            }
            else {
                objectType = streamItemView.data.jiveObject.objectType;
            }

            streamItemView.emit('getFullReplies', {objectType: objectType, objectID: objectID}, fullRepliesRequest, function(data) {
                var loadedActivitiesLength = data.items.length;
                for (var i = 0; i < loadedActivitiesLength; i++) {
                    var loadedActivity = data.items[i],
                        $subActivitiesList = $expView.find('.j-sub-activity-items'),
                        replyType = (streamItemView.data.jiveObject.typeThread ? loadedActivity.content.objectType : loadedActivity.targetObjectType),
                        replyId   = (streamItemView.data.jiveObject.typeThread ? loadedActivity.content.id : loadedActivity.targetObjectID),
                        $existingReply = $subActivitiesList.find('[id^=node-collapsed-][data-objectID="'+replyId+'"][data-objectType="'+replyType+'"]');
                    if ($existingReply.length) {
                        $existingReply.find('div.j-excerpt-full-html-content').html(
                            jive.eae.common.activityContentText({activity: loadedActivity, noAutoescape: true}));
                        var $likingControl = $existingReply.find('.j-js-liking-control');
                        if ($likingControl.length) {
                            var $container = $likingControl.find('.js-acclaim-container');
                            $likingControl.html(jive.eae.acclaim.likeControl({
                                canLike    : !!$container.data('canLike'),
                                liked      : loadedActivity.liked,
                                likeCount  : loadedActivity.likeCount,
                                objectId   : replyId,
                                objectType : replyType,
                                showIcon   : !!$container.data('showicon'),
                                type       : 'mini'
                            }));
                        }
                    }
                }
                streamItemView.fullRepliesLoaded = true;
                callback();
            });
        }
        else if (streamItemView.data.jiveObject.objectType == 1500) {
            // for StreamChannel objects, we still need to get the liking data for the StreamEntry sub-activities
            streamItemView.getLikeData($expView, function () {
                streamItemView.fullRepliesLoaded = true;
                callback();
            });
        }
        else {
            streamItemView.fullRepliesLoaded = true;
            callback();
        }
    };

    /**
     * renders an inline reply, complicated because the post-reply behavior is different for different stream types
     */
    this.renderReply = function(idPostfix, data, type){

        var streamItemView = this,
            normalizedData;
        if(type == 'mbComment'){
            replyToAuthor = streamItemView.data.originalAuthor;
            normalizedData = streamItemView.convertDataToActivity(data,
                {content:
                    {typeWallEntryComment: (streamItemView.data.jiveObject.typeWallEntry) ? true : false,
                     typeShareComment: (streamItemView.data.jiveObject.typeShare) ? true : false,
                     typeDMComment: (streamItemView.data.jiveObject.typeDirectMessage) ? true : false,
                     typeComment:true,
                     parentAuthor:replyToAuthor,
                     domIDPostfix:jive.soy.func.randomString(),
                     objectType:105},
                activityData:{domIDPostfix:jive.soy.func.randomString()}});
            streamItemView.hideMicroRTEInput(idPostfix);
        } else if (type == 'discussionReply') {
            normalizedData = data;
            normalizedData.likable = true;
            normalizedData.current = true;
        } else {
            var replyToAuthor,
                jsAppActivityRepliedToData = {},
                subActivityRepliedTo = streamItemView.subActivitiesByDomID[idPostfix];

            if (subActivityRepliedTo) {
                replyToAuthor = subActivityRepliedTo.activityUser;
                if (subActivityRepliedTo.content.objectType == 1501) {
                    // if we just replied to an app activity (StreamEntry), save this info
                    // in the comment object to correctly handle replying to this same comment
                    // (only a problem with "grouped" app activity in AS's, since the parent is the app, which
                    //  is un-replyable)
                    jsAppActivityRepliedToData.id = subActivityRepliedTo.content.id;
                    jsAppActivityRepliedToData.objectType = subActivityRepliedTo.content.objectType;
                }
            }
            else {
                replyToAuthor = streamItemView.data.originalAuthor;
            }
            normalizedData = streamItemView.convertDataToActivity(data,
                {content:
                        {domIDPostfix:jive.soy.func.randomString(),
                         parentAuthor:replyToAuthor,
                         jsAppActivityRepliedToData: jsAppActivityRepliedToData,
                         typeComment:true},
                activityData:{domIDPostfix:jive.soy.func.randomString()}});
        }
        // make sure reply is wrapped for padding of lists
        normalizedData.content.html = streamItemView.shiv("<div class='jive-rendered-content'>"+
            normalizedData.content.html+"</div>");
        // convert htmlfragment object to string, for IE rendering
        normalizedData.content.html = $j('<div>').append($j(normalizedData.content.html).clone()).remove().html();
        streamItemView.data.replyCount = streamItemView.data.replyCount + 1;
        streamItemView.data.numCurrent = streamItemView.data.numCurrent + 1;
        streamItemView.data.numCurrentSubActivities = streamItemView.data.numCurrentSubActivities + 1;
        streamItemView.data.read = true;
        var activityContainer = streamItemView.data;
        activityContainer.activityList.push(normalizedData);
        streamItemView.originalCommentIDs.push(normalizedData.content.id);
        streamItemView.subActivitiesByDomID[normalizedData.content.domIDPostfix] = normalizedData;

        if (streamItemView.data.jiveObject.typeMention) {
            //special case for rendering @mention reply
            var $expList = $j('#j-js-communications-exp div.j-act-ibx-exp-list'),
                $mentionReply = $j(jive.eae.mention.common.atMentionReply({data: normalizedData,
                                                                             containerData: streamItemView.data}));
            jive.rte.renderedContent.emit("renderedContent", $mentionReply);
            $expList.append($mentionReply);
        }
        else {
            var $currentItemsList = $j('#j-js-communications-exp .j-sub-activity-items');
            var $newExcerpt =
                $j(jive.eae.common.subactivity(
                    {
                        activity: normalizedData,
                        activityContainer:activityContainer,
                        isHidden: true,
                        user: streamItemView.viewingUserData,
                        streamType: streamItemView.streamType,
                        hideStub: true,
                        addedInline: true,
                        forceCurrent: false,
                        canCreateMbImage: false, //doesn't matter
                        canCreateMbVideo: false, //doesn't matter
                        mbCreationModerated: false //doesn't matter
                    }
                ));

            $currentItemsList.append($newExcerpt);
            streamItemView.getContent().addClass('j-replied-to');

            var $newCollapsedExcerpt = $j(jive.eae.inbox.commListItemView({
                activityContainer:activityContainer,
                activity: normalizedData,
                streamType: streamItemView.streamType,
                hidden: false,
                user: streamItemView.viewingUserData,
                time: normalizedData.creationTime,
                renderLocation: 'inbox'
            }));

            var $oldCollapsedExcerpt = streamItemView.getContent().find('div.j-act-coll-view');
            $oldCollapsedExcerpt.fadeOut('fast', function() {
                $oldCollapsedExcerpt.html($newCollapsedExcerpt);
                $oldCollapsedExcerpt.show();
            });

            if (!$j('#j-js-communications-exp h4.j-act-new-activity-title').is(':visible')) {
                $j('#j-js-communications-exp h4.j-act-new-activity-title').fadeIn('fast');
            }

            $newExcerpt.fadeIn('fast');
            jive.rte.renderedContent.emit("renderedContent", $newExcerpt);
        }
        var $commentCountText = $j('#j-js-communications-exp').find('.j-act-replycount');
        if ($commentCountText.length) {
            $commentCountText.replaceWith(jive.eae.common.replyCountText({
                activityContainer: streamItemView.data,
                streamType: streamItemView.streamType,
                showCurrentCount: true}));
        }

    };

    this.showMicroInput = function ($link) {
        var streamItemView = this,
            linkID = $link.attr('id'),
            idPostfix = linkID.split('_')[linkID.split('_').length-1],
            $replyableContainer = $link.closest("div.j-js-microrte-replyable"),
            $microRteView = $j('#microRTEContainer_'+idPostfix),
            $bottomParentReplyLink = $link.closest('.j-act-parent-reply-view');
        if ($bottomParentReplyLink.length) {
            $bottomParentReplyLink.find('.j-act-replyto').hide();
        }

        if (!$microRteView.length) {
            $microRteView = $j(jive.eae.common.microRTEContainer({
                object: streamItemView.data.jiveObject,
                activityContainer: streamItemView.data,
                user: window._jive_current_user,
                canAtMention: !streamItemView.mobileUI
            }));
            $replyableContainer.after($microRteView);
        }

        var view = streamItemView.initMicroRTEView(idPostfix, $microRteView);

        if ($microRteView.is(":visible")) {
            streamItemView.hideMicroRTEInput(idPostfix);
            if (!$replyableContainer.next().hasClass('j-act-micro-rte')) {
                $microRteView.detach();
                $replyableContainer.after($microRteView);
                $microRteView.fadeIn('fast');
                view.focus();
            }
        }
        else {
            $microRteView.detach();
            $replyableContainer.after($microRteView);
            $microRteView.fadeIn('fast');
            view.focus();
        }
    };

    this.getActivityContainer = function () {
        return this.data;
    };

    this.appendSubActivity = function (subActivity) {
        this.data.activityList.push(subActivity);
        this.subActivitiesByDomID[subActivity.content.domIDPostfix] = subActivity;
    };

    this.appendOriginalCommentID = function (newCommentID) {
        this.originalCommentIDs.push(newCommentID);
    };

    this.getIDWithoutContainer = function() {
        return this.getID().split("_").slice(0,3).join("_");
    };

    this.updateID = function(id) {
        this.articleID = id;
        this.hideDataArr = id.split("_");
        this.hideData = {objectType: parseInt(this.hideDataArr[1]),
                         objectID: parseInt(this.hideDataArr[2]),
                         containerType: parseInt(this.hideDataArr[3]),
                         containerID: parseInt(this.hideDataArr[4])};
    };

    this.incrementReplyCounts = function(replyCountInc, currentCountInc, currentSubActCountInc) {
        this.data.replyCount += replyCountInc;
        this.data.numCurrent += currentCountInc;
        this.data.numCurrentSubActivities += currentSubActCountInc;
    };

    this.hideMicroRTEInput = function(idPostfix, callback){
        var $statusInputContainer = $j('#microRTEContainer_'+idPostfix),
            view = this.initMicroRTEView(idPostfix, $statusInputContainer),
            content = $statusInputContainer.closest('div.j-js-ibx-item');
        if (view) {
            $statusInputContainer.hide();
            view.resetStatusInput();
            // show bottom parent reply link, if hidden
            content.find('.j-act-replyto').show();
            if (callback) {callback();}
        }
        else if (callback){
            callback();
        }
    };

    this.buildMoreDigestItems = function(activityContainer) {
        var streamItemView = this;
        // reusing activity stream expanded items template for rendering more digest items
        return $j(jive.eae.activitystream.expandedActivityStreamItemView({
            activityContainer: activityContainer,
            user: streamItemView.viewingUserData,
            streamType: 'communications',
            canCreateMbImage: streamItemView.canCreateMbImage,
            canCreateMbVideo: streamItemView.canCreateMbVideo,
            mbCreationModerated: streamItemView.mbCreationModerated
        }));
    };
});

