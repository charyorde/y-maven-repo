/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Represent an item in the activity stream list
 *
 * @depends path=/resources/scripts/apps/activity_stream/views/stream_item_common_view.js
 * @depends path=/resources/scripts/apps/activity_stream/models/fill_in_the_gap_request.js
 * @depends path=/resources/scripts/jive/rte/renderedContent.js
 * @depends path=/resources/scripts/jive/rte/rte_wrap.js
 * @depends path=/resources/scripts/jive/model/control.js lazy=true
 * @depends path=/resources/scripts/jive/rte/ImageService.js lazy=true
 * @depends path=/resources/scripts/jive/rte/FormService.js lazy=true
 * @depends path=/resources/scripts/jive/rte/EntitlementService.js lazy=true
 * @depends template=jive.eae.acclaim.*
 * @depends template=jive.eae.common.loadingSpinner
 * @depends template=jive.eae.common.jsI18nHelper
 * @depends template=jive.eae.common.subactivity
 * @depends template=jive.eae.common.rteTextArea
 * @depends template=jive.eae.common.rtePanel
 * @depends template=jive.eae.common.replyingToText
 * @depends template=jive.eae.common.replyCountText
 * @depends template=jive.eae.common.microRTEContainer
 * @depends template=jive.eae.activitystream.groupedActivityStreamItem
 * @depends template=jive.eae.activitystream.collapsedActivityStreamExcerpt
 * @depends template=jive.eae.activitystream.expandedActivityStreamItemView
 * @depends template=jive.eae.activitystream.activityStreamFullContentView
 * @depends template=jive.eae.activitystream.hideUnhideMenu
 * @depends template=jive.eae.activitystream.hiddenActivityView
 * @depends template=jive.eae.activitystream.expViewParentReplyLink
 * @depends template=jive.eae.activitystream.activityStreamExpandContent
 * @depends template=jive.DiscussionApp.soy.rteMsgQuote
 * @depends template=jive.discussions.soy.qDisplayInlineAnswers
 * @depends dwr=WikiTextConverter
 */
jive.namespace('ActivityStream');

jive.ActivityStream.ActivityStreamItemView = jive.ActivityStream.StreamItemCommonView.extend(function(protect, _super) {
    this.init = function (options) {
        _super.init.call(this, options);
        this.hideData = {objectType: parseInt(this.hideDataArr[1], 10),
                         objectID: parseInt(this.hideDataArr[2], 10),
                         containerType: parseInt(this.hideDataArr[3], 10),
                         containerID: parseInt(this.hideDataArr[4], 10)};

        this.subActivitiesByDomID = {};
        this.originalCommentIDs = [];
        this.activityListLength = this.data.activityList.length;
        for (var i = this.activityListLength - 1; i >= 0; i--) {
            this.subActivitiesByDomID[this.data.activityList[i].content.domIDPostfix] = this.data.activityList[i];
        }

        this.fullRepliesLoaded = false;
        this.autoFilledOnExpand = false;
        this.fullContentContainerInitialized = false;
        this.replacedCollapsedActivity = null;
        this.rteLoading = false;
    };

    this.getSoyTemplate = function(data){
        return jive.eae.activitystream.groupedActivityStreamItem(data);
    };

    this.handleClick = function(e, $targetParents, streamItemListView) {
        var streamItemView = this,
            $target = $j(e.target),
            defaultAction = false,
            $content = streamItemView.getContent();

        if ($targetParents.filter('.j-expand-comments').length) {
            streamItemView.expandClickHandler($targetParents.filter('.j-expand-comments').first(), e);
        }
        else if ($target.hasClass('j-reply-rte')) {
            var promise = new jive.conc.Promise();
            streamItemView.replyRTE($target, $targetParents, promise, streamItemListView);
        }
        else if ($targetParents.filter('a.j-js-show-full-act').length) {
            $this = $targetParents.filter('a.j-js-show-full-act').first();
            var $node = $this.closest('.j-act-node'),
                nodeID = $node.attr('id'),
                nodeIDPostfix = nodeID.split('-')[nodeID.split('-').length-1],
                subActivityData = streamItemView.subActivitiesByDomID[nodeIDPostfix],
                objectID = $node.attr('data-objectid'),
                objectType = $node.attr('data-objecttype'),
                $fullExcerpt = $node.find('div.j-excerpt-full-html-content'),
                $fullExcerptContainer = $node.find('div.j-act-sub-preview'),
                $stub = $node.find('div.j-excerpt'),
                $loadingSpinner = $j(jive.eae.common.loadingSpinner());

            $this.closest('.j-act-preview-control').after($loadingSpinner);
            if (subActivityData && subActivityData.parentActivity) {
                //special case for attempting to preview a creation activity, instead, get the content preview using the title preview link
                // note, with the 6.0 upgrade, creation activities should not longer ever appear in the sub activity list, so this
                // case should never be hit.
                $loadingSpinner.remove();
                $content.find('.j-js-show-full-content').click();
            }
            else {
                $node.addClass('j-expanded');
                if ($fullExcerpt.html()) {
                    $fullExcerptContainer.show();
                    $stub.hide();
                    $loadingSpinner.remove();
                }
                else {
                    // get the full activity content from rest call
                    streamItemView.emit('getFullContent', {objectType: objectType,
                                                           objectID: objectID,
                                                           containerType: '',
                                                           containerID: ''}, function(data) {
                        $fullExcerpt.html(data.html);
                        $loadingSpinner.remove();
                        $stub.hide();
                        jive.rte.renderedContent.emit("renderedContent", $fullExcerptContainer);
                        $fullExcerptContainer.show();
                    });
                }
                $this.closest('.j-act-preview-control').addClass('j-previewing');
            }
        }
        else if ($targetParents.filter('a.j-js-hide-full-act').length) {
            $this = $targetParents.filter('a.j-js-hide-full-act').first();
            $node = $this.closest('.j-act-node');
            $fullExcerptContainer = $node.find('div.j-act-sub-preview');
            $stub = $node.find('div.j-excerpt');
            $this.closest('.j-act-preview-control').removeClass('j-previewing');
            $node.removeClass('j-expanded');
            $fullExcerptContainer.hide();
            $stub.show();
        }
        else if ($targetParents.filter('a.j-js-show-full-content').length) {
            $this = $targetParents.filter('a.j-js-show-full-content').first();
            objectType = $this.attr('data-objectType');
            objectID = $this.attr('data-objectID');
            var containerType = $this.attr('data-containerType'),
                containerID = $this.attr('data-containerID'),
                $fullContentContainer = $content.find('div.js-full-content-container');

            if (!streamItemView.fullContentContainerInitialized) {
                 $fullContentContainer.html(jive.eae.activitystream.activityStreamFullContentView({
                    activityContainer: streamItemView.data,
                    user: streamItemView.viewingUserData,
                    streamType: streamItemView.streamType,
                    filterType: streamItemView.filterType,
                    canCreateMbImage: streamItemView.canCreateMbImage,
                    canCreateMbVideo: streamItemView.canCreateMbVideo,
                    mbCreationModerated: streamItemView.mbCreationModerated
                 }));
                 streamItemView.fullContentContainerInitialized = true;
            }
            var $fullContentView = $content.find('div.js-full-content-body');
            $loadingSpinner = $j(jive.eae.common.loadingSpinner());

            $this.before($loadingSpinner);
            if (!$fullContentView.html()) {
                $this.hide();
                streamItemView.emit('getFullContent', {objectType: objectType,
                                                       objectID: objectID,
                                                       containerType: containerType,
                                                       containerID: containerID}, function(data) {
                    // if the collapsed excerpt of the stream entry is the parent creation activity,
                    // hide it since we're going to show the full content now
                    var $streamItemCollapsedView = $content.find('div.j-act-coll-view');
                    if ($streamItemCollapsedView.length) {
                        var collapsedExcerpts = $streamItemCollapsedView.children('.j-act-node'),
                            collapsedExcerptsLength = collapsedExcerpts.length;
                        for (var i = 0; i < collapsedExcerptsLength; i++) {
                            var $collapsedExcerpt = $j(collapsedExcerpts[i]),
                                collapsedExcerptID = $collapsedExcerpt.attr('id'),
                                collapsedExcerptData =
                                    streamItemView.subActivitiesByDomID[collapsedExcerptID.split('-')[collapsedExcerptID.split('-').length-1]];
                            if ($collapsedExcerpt.is(':visible') &&
                                collapsedExcerptData &&
                                collapsedExcerptData.parentActivity &&
                                !$collapsedExcerpt.children('div.j-js-collapsed').hasClass('j-mod')) {
                                $collapsedExcerpt.hide();
                            }
                        }
                    }
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

                    $fullContentContainer.show();

                    $loadingSpinner.remove();
                    $this.next('a.j-js-hide-full-content').show();
                    $content.addClass('j-act-tl-preview');
                    jive.rte.renderedContent.emit("renderedContent", $fullContentContainer);
                });
            }
            else {
                // if the collapsed excerpt of the stream entry is the parent creation activity,
                // hide it since we're going to show the full content now
                $streamItemCollapsedView = $content.find('div.j-act-coll-view');
                if ($streamItemCollapsedView.length) {
                    collapsedExcerpts = $streamItemCollapsedView.children('.j-act-node');
                    collapsedExcerptsLength = collapsedExcerpts.length;
                    for (i = 0; i < collapsedExcerptsLength; i++) {
                        $collapsedExcerpt = $j(collapsedExcerpts[i]);
                        collapsedExcerptID = $collapsedExcerpt.attr('id');
                        collapsedExcerptData =
                            streamItemView.subActivitiesByDomID[collapsedExcerptID.split('-')[collapsedExcerptID.split('-').length-1]];
                        if ($collapsedExcerpt.is(':visible') &&
                            collapsedExcerptData &&
                            collapsedExcerptData.parentActivity &&
                            !$collapsedExcerpt.children('div.j-js-collapsed').hasClass('j-mod')) {
                            $collapsedExcerpt.hide();
                        }
                    }
                }

                $fullContentContainer.show();

                $this.hide();
                $this.next('a.j-js-hide-full-content').show();
                $loadingSpinner.remove();
                $content.addClass('j-act-tl-preview');
            }
        }
        else if ($targetParents.filter('a.j-js-hide-full-content').length) {
            var $this = $targetParents.filter('a.j-js-hide-full-content').first()
                $fullContentContainer = $content.find('div.js-full-content-container');

            $fullContentContainer.hide();

            $content.find('a.j-js-hide-full-content').each(function() {
                if ($j(this).prev('a.j-js-show-full-content').length) {
                    $j(this).hide();
                }
            });
            $content.removeClass('j-act-tl-preview');
            // if the collapsed excerpt of the stream entry is the parent creation activity,
            // show it since we're going to hide the full content now
            var $streamItemCollapsedView = $content.find('div.j-act-coll-view');
            if ($streamItemCollapsedView.length) {
                var collapsedExcerpts = $streamItemCollapsedView.children('.j-act-node'),
                    collapsedExcerptsLength = collapsedExcerpts.length;
                for (var i = 0; i < collapsedExcerptsLength; i++) {
                    var $collapsedExcerpt = $j(collapsedExcerpts[i]),
                        collapsedExcerptID = $collapsedExcerpt.attr('id'),
                        collapsedExcerptData =
                            streamItemView.subActivitiesByDomID[collapsedExcerptID.split('-')[collapsedExcerptID.split('-').length-1]];
                    // don't try and re-show collapsed excerpts while in the expanded view (edge case for user stream only)
                    if (!$collapsedExcerpt.is(':visible') &&
                        !$content.find('div.j-act-exp-view').is(':visible') &&
                        collapsedExcerptData &&
                        collapsedExcerptData.parentActivity &&
                        !$collapsedExcerpt.children('div.j-js-collapsed').hasClass('j-mod')) {
                        $collapsedExcerpt.show();
                    }
                }
            }
            $content.find('a.j-js-show-full-content').show();
        }
        else if ($target.hasClass('j-act-hidemenu')) {
            var $hideMenuButton = $target;
            $content.addClass('j-js-hide-popover-showing j-hide-popover-showing');
            streamItemView.emit('unhidemenu', streamItemView.hideData,
                function(data){
                    var alreadyHidden = false;
                    if (data.exclusionRules['item'] || data.exclusionRules['context'] || data.exclusionRules['type-context']) {
                        alreadyHidden = true;
                    }
                    var $hideMenu = $j(jive.eae.activitystream.hideUnhideMenu({
                                        activityContainer: streamItemView.data,
                                        streamType: streamItemView.streamType,
                                        alreadyHidden: alreadyHidden}));

                    // click handler for the item's hide link
                    $hideMenu.find('a.j-act-hidelink').click(function(e){
                        streamItemView.emit('hide', 'item', streamItemView.hideData, true);
                        $hideMenu.trigger('close');
                        e.preventDefault();
                    });

                        // click handler for the other hide links in the item's hide popover menu
                    $hideMenu.find('a.j-js-hide').click(function(e) {
                        var $this = $j(this);
                        if ($this.hasClass('j-js-context')) {
                            streamItemView.emit('hide', 'context', streamItemView.hideData, true);
                        }
                        else if ($this.hasClass('j-js-type-from-context')) {
                            streamItemView.emit('hide', 'type-context', streamItemView.hideData, true);
                        }
                        //mimic popover remove function
                        $hideMenu.trigger('close');
                        e.preventDefault();
                    });

                    $hideMenu.popover({context: $hideMenuButton, darkPopover: true, onClose:
                        function() {
                            $content.removeClass('j-js-hide-popover-showing j-hide-popover-showing');
                        }
                    });
                }
            );
        }
        else if ($targetParents.filter('a.j-js-show-older').length) {
            $this = $targetParents.filter('a.j-js-show-older').first();
            var $expView = $content.find('div.j-act-exp-view'),
                $workingExpView = $expView.clone(true);
            if (!$this.hasClass('j-js-loading')) {
                $this.addClass('j-js-loading');
                $this.append(jive.eae.common.loadingSpinner());
                streamItemView.fillInMyGaps($workingExpView, function () {
                    $workingExpView.hide();
                    $expView.after($workingExpView);
                    $expView.remove();
                    $workingExpView.show();
                    var $slideInDiv = $workingExpView.find(".j-js-slide-in");
                    if ($slideInDiv.length) {
                        $slideInDiv.show();
                        var $subActsToShow = $workingExpView.find('div.j-js-sub-act-to-show');
                        $subActsToShow.unwrap();
                        $subActsToShow.removeClass('j-js-sub-act-to-show');
                    }
                    $this.removeClass('j-js-loading');
                    $this.find('.j-loading-spinner').remove();
                });
            }
        }
        else {
            defaultAction = streamItemView.handleClickCommon($target, e, $targetParents, $content);
        }

        if (defaultAction &&
            jive.rte.mobileUI &&
            e.type == 'touchend' &&
            !streamItemView.getContent().hasClass('j-act-active') &&
            streamItemView.getContent().find('.j-expand-comments').length) {
            // if we're mobile browsing and you click somewhere else on the item, attempt to expand the activities
            streamItemView.expandClickHandler(streamItemView.getContent().find('.j-expand-comments').first(), e);
        }

        $j('.j-act-entry').removeClass('j-act-active');
        $content.addClass('j-act-active');
        return defaultAction;
    };

    this.postRender = function(){
        var streamItemView = this,
            $content = this.getContent();

        if (streamItemView.data.jiveObject.typeWallEntry) {
            // resize attachment view, to add scrolly arrows, if necessary
            var attachContainerID = 'collapsed-attachmentContainer-'+streamItemView.data.jiveObject.domIDPostfix;
            if (attachContainerID in jive.MicroBlogging.AttachmentView.views) {
                jive.MicroBlogging.AttachmentView.views[attachContainerID].resize();
            }
        }
        // emit renderedContent rte event so that the pre-loaded "embedded app experience"
        // links can function and attachments can lightbox.
        jive.rte.renderedContent.emit("renderedContent", $content);
    };

    this.expandClickHandler = function (expandLink, e){
        var streamItemView = this,
            $this = expandLink;

        if (!$this.hasClass('j-js-loading')) {
            $this.addClass('j-js-loading');
            var $article = $this.closest('div.j-act-entry'),
                $loadingSpinner = $j(jive.eae.common.loadingSpinner()),
                $expView = $article.find('div.j-act-exp-view'),
                digestItem = $article.hasClass('j-act-grouped'),
                objectType = $article.attr('data-objectType'),
                objectID = $article.attr('data-objectID'),
                containerType = $article.attr('data-containerType'),
                containerID = $article.attr('data-containerID'),
                $workingExpView;
            $this.find('.jive-icon-arrow-down-focus').hide().after($loadingSpinner);

            if (digestItem) {
                // latest likes, social news, app digests
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
                        $article.find('.j-act-g-list').append(streamItemView.buildExpandedView({
                            activityList: data.items,
                            jiveObject: {expandedActivityStreamViewTemplate:streamItemView.data.jiveObject.expandedActivityStreamViewTemplate}
                        }));
                        if (!data.hasMore) {
                            $article.find('div.j-preview-trigger').remove();
                        }
                        $article.addClass('j-js-expanded j-act-expanded');
                        $loadingSpinner.remove();
                        $this.find('.jive-icon-arrow-down').show();
                        $this.removeClass('j-js-loading');
                    });
                }
                else {
                    $article.addClass('j-js-expanded j-act-expanded');
                    $loadingSpinner.remove();
                    $this.find('.jive-icon-arrow-down').show();
                    $this.removeClass('j-js-loading');
                }
            }
            else {
                if ($expView.length && !$expView.html()) {
                    $workingExpView = streamItemView.buildExpandedView(streamItemView.data);
                }
                else {
                    $workingExpView = $expView.clone(true);
                }

                // get the full html/liking data for all existing activities
                streamItemView.getFullReplies($workingExpView, function() {
                    if ($workingExpView.length) {
                        //show expanded view
                        var $showAllLink = $article.find('a.j-show-more'),
                            $subActivityList = $workingExpView.find('.j-sub-activity-items');
                        if ($workingExpView.css('display') == 'none') {
                            var $subActivities = $subActivityList.children('.j-act-node');
                            if (streamItemView.data.jiveObject.objectType != 1500 &&
                                !streamItemView.data.jiveObject.typeTask &&
                                !streamItemView.autoFilledOnExpand) {
                                // auto fill in the gaps on expand to get the first set of sub activities
                                streamItemView.fillInMyGaps($workingExpView, function () {
                                    streamItemView.autoFilledOnExpand = true;
                                    streamItemView.switchExpandedCollapsedViews('expanded', $workingExpView);
                                    $this.removeClass('j-js-loading');
                                    $loadingSpinner.remove();
                                    $this.find('.jive-icon-arrow-down').show();
                                });
                            }
                            else {
                                if (streamItemView.data.jiveObject.objectType == 1500 ||
                                    streamItemView.data.jiveObject.typeTask) {
                                    // on expand, simply show the hidden activities on view switch
                                    $j($subActivities).each(function() {
                                        $j(this).show();
                                    });
                                }
                                else {
                                    // already auto filled on first expand
                                    var numLoadedComments = streamItemView.data.activityList.filter(function(activity) {
                                        return (activity.content.typeComment || activity.content.typeMessage);
                                    }).length;
                                    if (numLoadedComments < streamItemView.data.replyCount) {
                                        // i think we need to do this as well if there are any still-hidden sub-activities that are not comments/replies

                                        // make sure to show the "show more" link
                                        $workingExpView.find('.j-show-older').show();
                                    }
                                }
                                // show whatever is in the expanded view
                                streamItemView.switchExpandedCollapsedViews('expanded', $workingExpView);
                                $this.removeClass('j-js-loading');
                                $loadingSpinner.remove();
                                $this.find('.jive-icon-arrow-down').show();
                            }
                        }
                        else {
                            streamItemView.switchExpandedCollapsedViews('collapsed');
                            $this.removeClass('j-js-loading');
                            $loadingSpinner.remove();
                            $this.find('.jive-icon-arrow-down').show();
                        }
                    }
                    else {
                        $this.removeClass('j-js-loading');
                        $loadingSpinner.remove();
                        $this.find('.jive-icon-arrow-down').show();
                    }
                });
            }
        }
        e.preventDefault();
    };

    this.replyRTE = function($target, $targetParents, promise, streamItemListView) {
        var streamItemView = this,
            $content = streamItemView.getContent(),
            $replyableActivity = $target.closest('.j-act-rte-replyable'),
            data = {},
            id = $replyableActivity.attr('id'),
            idPostfix = id.split('-')[id.split('-').length-1],
            subActivityData = streamItemView.subActivitiesByDomID[idPostfix],
            $bottomParentReplyLink = $targetParents.filter('.j-act-parent-reply-view');
        if (!streamItemView.rteLoading) {
            streamItemView.rteLoading = true;
            promise.addCallback(function () {
                streamItemView.rteLoading = false;
            });

            if ($bottomParentReplyLink.length) {
                $bottomParentReplyLink.find('.j-act-replyto').hide();
            }
            else {
                // show bottom parent reply link, if hidden
                $content.find('.j-act-replyto').show();
            }
            data.parent = {};
            if (subActivityData &&
                (subActivityData.content.typeComment ||
                 subActivityData.content.typeMessage ||
                 subActivityData.content.typeExternalActivity)) {
                // if we're replying to a comment or discussion reply, set the correct activity data that we're replying
                // to.  (If sub-activity is actually a message, but the creation message of a thread, the type will be
                // "typeThread", so we should be safe)
                data.type = "sub";
                data.activity = subActivityData;
                if (!subActivityData.content.typeExternalActivity) {
                    // don't attempt to quote app activity from rte
                    var $renderedContentContainer =
                        $replyableActivity.find('.j-excerpt-full-html-content .jive-rendered-content');
                    if ($renderedContentContainer.length) {
                        data.htmlContent = $j.trim($renderedContentContainer.html());
                    }
                    else {
                        data.htmlContent = $j.trim($replyableActivity.find('.j-excerpt').html());
                    }
                }
            }
            else {
                data.type = "parent";
                // only need parent author when replying to parent
                data.parent.originalAuthor = streamItemView.data.originalAuthor;
                var parentContent = '';
                if (streamItemView.data.jiveObject.typeThread) {
                    // if a discussion ONLY, attempt to set whatever content we have of the root message to
                    // the htmlContent param, for rte quoting only.
                    var $article = streamItemView.getContent(),
                        $parentHTMLContainer = $article.find('.js-full-content-body .jive-rendered-content');
                    if ($parentHTMLContainer.length) {
                        parentContent = $j.trim($parentHTMLContainer.html());
                    }
                    else {
                        parentContent = $j.trim($article.find('.j-excerpt-slug').html());
                    }
                }
                data.htmlContent = parentContent;
            }

            data.idPostfix = idPostfix;
            data.viewingUser = streamItemView.viewingUserData;
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

            data.objectID = $replyableActivity.attr('data-objectid');
            data.objectType = $replyableActivity.attr('data-objecttype');
            data.objectVisibility = $replyableActivity.attr('data-extvisible');
            if (streamItemListView) {
                streamItemListView.emit('formReady', data);
            }
            streamItemView.showRTE(data, $replyableActivity, promise);
        }
    };

    this.switchExpandedCollapsedViews = function(switchTo, $workingExpView) {
        var streamItemView = this,
            $content = streamItemView.getContent(),
            $collapsedView = $content.find('div.j-act-coll-view'),
            $expView = $content.find('div.j-act-exp-view'),
            $expViewParentReplyLink = $content.find('#exp-parent-reply-'+streamItemView.data.jiveObject.domIDPostfix),
            $showOlderLinkContainer = $content.find('.j-show-older'),
            moveRTE = false,
            $rteWrap;
        if (switchTo == 'expanded') {
            $content.find('.j-expand').text(jive.eae.common.jsI18nHelper({key: 'eae.stream.showfewercomments'}));
            if ($showOlderLinkContainer.data('more')) {
                $showOlderLinkContainer.show();
            }
            var $collapsedRTE = $collapsedView.find('div.j-panel-rte');
            if ($collapsedRTE.length && $collapsedRTE.is(':visible')) {
                moveRTE = true;
            }
            $collapsedView.hide();
            $workingExpView.show();
            $expView.replaceWith($workingExpView);
            if (moveRTE) {
                var rteHTML = streamItemView.rteView.getHTML();
                var $collapsedNode = $collapsedView.find('div.j-act-node'),
                    collapsedObjectType = $collapsedNode.data('objecttype'),
                    collapsedObjectID = $collapsedNode.data('objectid'),
                    $expandedNodeMatch = $workingExpView.find('div.j-act-node[data-objecttype='+collapsedObjectType+'][data-objectid='+collapsedObjectID+']'),
                    promise = new jive.conc.Promise();
                promise.addCallback(function() {
                    streamItemView.rteView.setHTML(rteHTML);
                });
                var $replyLink = $expandedNodeMatch.find('.j-reply-rte'),
                    $replyLinkParents = $replyLink.add($replyLink.parents());
                streamItemView.replyRTE($replyLink, $replyLinkParents, promise);
            }
            if (!$expViewParentReplyLink.length) {
                $expViewParentReplyLink =
                    $j(jive.eae.activitystream.expViewParentReplyLink({activityContainer: streamItemView.data}));
                $collapsedView.after($expViewParentReplyLink);
            }
            $expViewParentReplyLink.show();
            $content.addClass('j-js-expanded j-act-expanded');
        }
        else if (switchTo == 'collapsed') {
            $content.find('.j-expand').text(jive.eae.common.jsI18nHelper({key: 'eae.stream.showmorecomments'}));
            $showOlderLinkContainer.hide();
            if ($expViewParentReplyLink.length) {
                $expViewParentReplyLink.hide();
            }
            var $expandedRTE = $expView.find('div.j-panel-rte'),
                expandedRTEVisible = $expandedRTE.is(':visible');
            if ($expandedRTE.length && expandedRTEVisible) {
                $rteWrap = $expandedRTE.closest('div.j-panel-rte-wrap');
                var $replyToNode = $rteWrap.prev('div.j-act-node');
                $collapsedNode = $collapsedView.find('div.j-act-node');
                if ($replyToNode.length &&
                    $replyToNode.data('objecttype') == $collapsedNode.data('objecttype') &&
                    $replyToNode.data('objectid') == $collapsedNode.data('objectid')) {
                    moveRTE = true;
                }
            }
            $expView.hide();
            $collapsedView.show();
            if (moveRTE) {
                var rteHTML = streamItemView.rteView.getHTML(),
                    promise = new jive.conc.Promise();
                promise.addCallback(function() {
                    streamItemView.rteView.setHTML(rteHTML);
                });
                var $replyLink = $collapsedNode.find('.j-reply-rte'),
                    $replyLinkParents = $replyLink.add($replyLink.parents());
                streamItemView.replyRTE($replyLink, $replyLinkParents, promise);
            }
            else if ($expandedRTE.length && expandedRTEVisible) {
                //remove the RTE since any already entered text will be gone and the RTE will be frozen if they expand again
                $rteWrap.remove();
            }
            $content.removeClass('j-js-expanded j-act-expanded');
        }
    };

    this.fillInMyGaps = function($workingExpView, callback) {
        var streamItemView = this,
            fillInTheGapRequest =
                new jive.ActivityStream.FillInTheGapRequest({originalIDs: streamItemView.originalCommentIDs,
                                                             timestamp:   streamItemView.gapTimestamp,
                                                             fullContent: true,
                                                             pageSize: 5}),
            $article = streamItemView.getContent(),
            objectType,
            objectID = (streamItemView.data.jiveObject.typeThread ?
                        streamItemView.data.jiveObject.threadID :
                        streamItemView.data.jiveObject.id),
            $showOlderLinkContainer = $article.find('.j-show-older');

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

        streamItemView.emit('fillInTheGaps', {objectType: objectType,
                                              objectID: objectID}, fillInTheGapRequest, function(data) {
            var $subActivitiesList;

            if (!data.hasMore) {
                $showOlderLinkContainer.hide();
                $showOlderLinkContainer.data('more', false);
                // make sure all possible sub-activities are showing at this point (might be some bookmark/modify
                // activities hidden if they were earliest)
                $subActivitiesList = $workingExpView.find('.j-act-node');
                $j($subActivitiesList).each(function() {
                    var $subActivity = $j(this);
                    if ($subActivity.css('display') == 'none') {
                        if ($workingExpView.css('display') != 'none') {
                            $subActivity.addClass('j-js-sub-act-to-show');
                        }
                        else {
                            jive.rte.renderedContent.emit("renderedContent", $subActivity);
                            $subActivity.show();
                        }
                    }
                });
            }
            else {
                $showOlderLinkContainer.show();
                $showOlderLinkContainer.data('more', true);
                streamItemView.gapTimestamp = data.items[data.items.length-1].creationDate;
            }
            var dataItemsLength = data.items.length;
            $subActivitiesList = $workingExpView.find('.j-sub-activity-items').clone();

            // activities come back in reverse creation time order
            for (var i = 0; i < dataItemsLength; i++) {
                var newActivityObj = data.items[i],
                    inserted = false,
                    activityListLength = streamItemView.data.activityList.length;
                for (var existingListIndex = 0; existingListIndex < activityListLength; existingListIndex++) {
                    var iterActivity = streamItemView.data.activityList[existingListIndex];
                    if (parseInt(iterActivity.creationDate, 10) > parseInt(newActivityObj.creationDate, 10)) {
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
                        $newExcerpt.find('.j-act-preview-control').hide();
                        $newExcerpt.addClass('j-js-sub-act-to-show');
                        if (existingListIndex == 0) {
                            $subActivitiesList.prepend($newExcerpt);
                            // the existing was created later than this new one, make sure the existing is now visible
                            // (might be a hidden bookmark or mod activity inserted on page load)
                            var $iterActivityDomItem =
                                $subActivitiesList.find('#node-collapsed-'+iterActivity.content.domIDPostfix);
                            if ($iterActivityDomItem.css('display') == 'none') {
                                // Must use css check here instead of :visible because could be hidden by the whole
                                // exp list being hidden
                                $iterActivityDomItem.addClass('j-js-sub-act-to-show');
                            }
                        }
                        else {
                            var $subActivityToInsertAfter =
                                $subActivitiesList.find('#node-collapsed-'+streamItemView.data.activityList[existingListIndex-1].content.domIDPostfix);
                            if ($subActivityToInsertAfter.length) {
                                $subActivityToInsertAfter.after($newExcerpt);
                            }
                            else {
                                // the activity list item might not actually exist in the sub activity list iff it is
                                // the creation activity
                                $subActivitiesList.prepend($newExcerpt);
                            }
                        }
                        jive.rte.renderedContent.emit("renderedContent", $newExcerpt);
                        // added to activity list, length and indexes of items changed
                        streamItemView.data.activityList.splice(existingListIndex,0,newActivityObj);
                        break;
                    }
                }
                if (!inserted) {
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
                    $newExcerpt.find('.j-act-preview-control').hide();
                    $newExcerpt.addClass('j-js-sub-act-to-show');
                    $subActivitiesList.append($newExcerpt);
                    jive.rte.renderedContent.emit("renderedContent", $newExcerpt);
                }
            }
            var $subActsToShow = $subActivitiesList.find("div.j-js-sub-act-to-show");
            if ($j.browser.msie && $j.browser.version <= 7 ) {
                streamItemView.replaceAroundRTE($workingExpView.find('.j-sub-activity-items'), $subActivitiesList);
            }
            else {
                if ($workingExpView.css('display') != 'none') {
                    $subActsToShow.wrapAll('<div class="j-js-slide-in" style="display:none"/>');
                }
                else {
                    $subActsToShow.css('display', 'block');
                }
                streamItemView.replaceAroundRTE($workingExpView.find('.j-sub-activity-items'), $subActivitiesList);
            }
            $subActsToShow.removeClass('j-js-sub-act-to-show');
            streamItemView.postRender();
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

    this.getFullReplies = function($workingExpView, callback) {
        var streamItemView = this,
            $article = streamItemView.getContent();

        if (streamItemView.data.jiveObject.objectType == 1500) {
            // for StreamChannel objects, we still need to get the liking data for the StreamEntry sub-activities
            streamItemView.getLikeData($workingExpView, function () {
                streamItemView.fullRepliesLoaded = true;
                callback();
            });
        }
        else {
            streamItemView.fullRepliesLoaded = true;
            callback();
        }
    };

    // attached to the click of a non-MB reply link
    this.showRTE = function(contentData, $replyActivity, promise){
        var streamItemView = this,
            $article = $replyActivity.closest('div.j-act-entry'),
            $rteView = $article.find('div.j-panel-rte');
        if (!$rteView.length) {
            var $rtePanel = $j(jive.eae.common.rtePanel({
                user: streamItemView.viewingUserData,
                hideGuestURLField: (streamItemView.data.jiveObject.typeThread ? true : false),
                externallyVisible: contentData.objectVisibility
            }));
            $rteView = $rtePanel.find('div.j-panel-rte');
            $article.find('div.j-act-coll-view').after($rtePanel);
        }

        function startupRte(){
            var $rteForm = $article.find("div.j-panel-rte-wrap").detach();
            $replyActivity.after($rteForm);
            var $rteLoading = $rteForm.find("div.j-panel-rte-loading");
            streamItemView.rteSpinner = new jive.loader.LoaderView();
            streamItemView.rteSpinner.appendTo($rteLoading);
            $rteLoading.show();
            streamItemView.initRTE($article, contentData, promise);
        }
        if ($rteView.is(":visible")) {
            $rteView.hide();
            $article.find(".jive-comment-error").hide();
            if (!$replyActivity.next().hasClass('j-panel-rte-wrap')) {
                startupRte();
            }
            else {
                promise.emitSuccess();
            }
        }
        else {
            startupRte();
        }
    };

     // slide the RTE into view.  Called by RTEWrap when the RTE is successfully initialized.
    this.slideOpenRTE = function (cb) {
        var streamItemView = this,
            $rteLocation = $j('#'+streamItemView.rteLocation),
            $rtePanel = $rteLocation.find("div.j-panel-rte"),
            $rteLoading = $rteLocation.find("div.j-panel-rte-loading");
        $rteLoading.hide();
        streamItemView.rteSpinner.getContent().remove();
        streamItemView.rteSpinner.destroy();
        $rtePanel.css('position', 'static');
        $rtePanel.show('fast', cb);
    };

    // initialize the RTE with the data provided.  The data provided will route the post of the form to the correct
    // web service and supply the correct data.
    this.initRTE = function($article, contentData, promise) {
        var idPostfix = contentData.idPostfix,
            replyData = {},
            streamItemView = this,
            containerType = null,
            containerID = null,
            typeID = null,
            subject = null,
            messageID = null,
            forumThreadID = null,
            statusInputType = null,
            contentID = null,
            parentCommentID = null,
            version = null,
            author = null,
            imagesEnabled = false;

        $article.css({zIndex: "5"});

        streamItemView.resetRTE($article);

        statusInputType = (contentData.parent.jiveObject.typeThread ? 'discussionReply' : 'inlineComment');
        if (contentData.type == 'sub') {
            containerType = contentData.activity.containerObjectType;
            containerID = contentData.activity.containerObjectID;
            if (statusInputType == 'discussionReply') {
                subject = jive.util.unescapeHTML(contentData.activity.content.subject);
                forumThreadID = contentData.parent.jiveObject.threadID;
                messageID = contentData.activity.content.id;
                // resolves to same images enabled check done on a discussion page.
                // (forum-macros.ftl -> isWikiImagesEnabled ->
                //  WikiUtils.isWikiImageSyntaxEnabled(container) (always true) &&
                //  action.hasPermissionsToUploadImages() ->
                // AttachmentPermHelper.getCanCreateImageAttachment(rootMessage) )
                imagesEnabled = contentData.parent.jiveObject.imagesEnabled;
            }
            else if (contentData.parent.jiveObject.typeExternalActivity && !contentData.activity.content.typeComment) {
                contentID = contentData.objectID;
                typeID = contentData.objectType;
                // resolves to same images enabled check done for comments on content page
                // (global images enabled && CommentPermHelper.getCanInsertImage())
                imagesEnabled = streamItemView.rteOptions.hasImagePerms;
            }
            else {
                contentID = contentData.parent.jiveObject.id;
                typeID = contentData.parent.jiveObject.objectType;
                // resolves to same images enabled check done for comments on content page
                // (global images enabled && CommentPermHelper.getCanInsertImage())
                imagesEnabled = streamItemView.rteOptions.hasImagePerms;
                if (contentData.activity.content.id != contentData.parent.jiveObject.id ||
                    contentData.activity.content.objectType != contentData.parent.jiveObject.objectType) {
                    parentCommentID = contentData.activity.content.id;
                }
                if (contentData.parent.jiveObject.versionNumber) {
                    version = contentData.parent.jiveObject.versionNumber;
                }
            }
            author = contentData.activity.activityUser;
            $article.find("div.j-js-reply-to").html(jive.eae.common.replyingToText({type: 'user', object:author, visible:(contentData.objectVisibility == 'true')}));
        }
        else {
            containerType = contentData.parent.container.type;
            containerID = contentData.parent.container.id;
            if (statusInputType == 'discussionReply') {
                subject = jive.util.unescapeHTML(contentData.parent.jiveObject.subject);
                forumThreadID = contentData.parent.jiveObject.threadID;
                messageID = contentData.parent.jiveObject.id;
                author = contentData.parent.originalAuthor;
                // resolves to same images enabled check done on a discussion page.
                // (forum-macros.ftl -> isWikiImagesEnabled ->
                //  WikiUtils.isWikiImageSyntaxEnabled(container) (always true) &&
                //  action.hasPermissionsToUploadImages() ->
                // AttachmentPermHelper.getCanCreateImageAttachment(rootMessage) )
                imagesEnabled = contentData.parent.jiveObject.imagesEnabled;
                $article.find("div.j-js-reply-to").html(jive.eae.common.replyingToText({type: 'user', object:author, visible:(contentData.objectVisibility == 'true')}));
            }
            else if (contentData.parent.jiveObject.typeExternalActivity) {
                contentID = contentData.objectID;
                typeID = contentData.objectType;
                // resolves to same images enabled check done for comments on content page
                // (global images enabled && CommentPermHelper.getCanInsertImage())
                imagesEnabled = streamItemView.rteOptions.hasImagePerms;
                $article.find("div.j-js-reply-to").html(jive.eae.common.replyingToText({type: 'content', object:{}, visible:(contentData.objectVisibility == 'true')}));
            }
            else {
                contentID = contentData.parent.jiveObject.id;
                typeID = contentData.parent.jiveObject.objectType;
                if (contentData.parent.jiveObject.versionNumber) {
                    version = contentData.parent.jiveObject.versionNumber;
                }
                // resolves to same images enabled check done for comments on content page
                // (global images enabled && CommentPermHelper.getCanInsertImage())
                imagesEnabled = streamItemView.rteOptions.hasImagePerms;
                $article.find("div.j-js-reply-to").html(jive.eae.common.replyingToText({type: 'content', object:contentData.parent.jiveObject, visible:(contentData.objectVisibility == 'true')}));
            }
            author = contentData.parent.originalAuthor;
        }
        if (contentData.htmlContent) {
            window._jive_gui_quote_text = jive.DiscussionApp.soy.rteMsgQuote({
                i18n: {
                    postGuestWroteLabel: jive.i18n.getMsg("post.guest_wrote.label"),
                    postUserWroteLabel: jive.i18n.getMsg("post.user_wrote.label")
                },
                userName: typeof((window._jive_current_user))!='undefined' && (window._jive_current_user.ID == author.id) ? author.username : author.displayName,
                isAnonymous: author.anonymous,
                msgBody:contentData.htmlContent});
        }
        else {
            window._jive_gui_quote_text = '';
        }
        window._jive_video_picker__url = "?container="+containerID+"&containerType="+containerType;
        jive.rte.multiRTE = new Array();
        window.editor = new jive.ext.y.HashTable();

        var jiveControl = null,
            imageService = null,
            entitlementService = null,
            formService = null;

        define(['jive.model.Controller', 'jive.rte.EntitlementService', 'jive.rte.ImageService', 'jive.rte.FormService'],
        function(JiveModelController, JiveRTEEntitlementService, JiveRTEImageService, JiveRTEFormService) {
            jiveControl = new JiveModelController();

            entitlementService = new JiveRTEEntitlementService({
                objectID: (streamItemView.data.jiveObject.typeThread ? streamItemView.data.jiveObject.threadID : streamItemView.data.jiveObject.id),
                objectType: (streamItemView.data.jiveObject.typeThread ? 1 : streamItemView.data.jiveObject.objectType),
                entitlement: "VIEW"
            });

            imageService = new JiveRTEImageService({
                objectId: -1,
                objectType: -1,
                containerId: containerID,
                containerType: containerType
            });

            formService = new JiveRTEFormService({
                $form: $article.find("form.j-panel-rte-view"),
                formSubmitHandler: function() {
                    $j(this).find('input[type=submit]').prop('disabled', true);
                    replyData.body = streamItemView.rteView.getHTML();
                    replyData.name = '';
                    replyData.email = '';
                    var $nameField = $article.find(".replyGuestName"),
                        $emailField = $article.find(".replyGuestEmail"),
                        $urlField = $article.find(".replyGuestUrl"),
                        $errorNotification = $article.find(".jive-comment-error");
                    if (!replyData.body.length) {
                        $errorNotification.html(jive.eae.common.jsI18nHelper({key: 'cmnt.cannot_be_empty.text'})).show();
                        $j(this).find('input[type=submit]').prop('disabled', false);
                        return;
                    }
                    else if ($nameField.length && !$nameField.val()) {
                        if (statusInputType=='discussionReply') {
                            $errorNotification.html(jive.eae.common.jsI18nHelper({key: 'forum.thrd.name_required.text'})).show();
                        }
                        else {
                            $errorNotification.html(jive.eae.common.jsI18nHelper({key: 'cmnt.name_required.text'})).show();
                        }
                        $j(this).find('input[type=submit]').prop('disabled', false);
                        return;
                    }
                    else if ($emailField.length && !$emailField.val()) {
                        if (statusInputType=='discussionReply') {
                            $errorNotification.html(jive.eae.common.jsI18nHelper({key: 'forum.thrd.email_required.text'})).show();
                        }
                        else {
                            $errorNotification.html(jive.eae.common.jsI18nHelper({key: 'cmnt.email_required.text'})).show();
                        }
                        $j(this).find('input[type=submit]').prop('disabled', false);
                        return
                    }
                    else {
                        $errorNotification.hide();
                    }

                    // for un-authenticated comments
                    if ($nameField.length) {
                        replyData.name = $nameField.val();
                        replyData.email = $emailField.val();
                    }

                    if (statusInputType=='discussionReply') {
                        replyData.subject = subject;
                        replyData.forumThreadID = forumThreadID;
                        replyData.ID = messageID;
                        streamItemView.emit('replySubmit', replyData, function(data) {
                            $article.css("z-index", 0);
                            // show bottom parent reply link, if hidden
                            $article.find('.j-act-replyto').show();
                            $article.find("div.j-panel-rte").toggle(function() {
                                if (streamItemView.rteView) {
                                    streamItemView.resetRTE($article);
                                }
                            });
                            streamItemView.renderReply(idPostfix, data, statusInputType);
                        }, function (msg, status) {
                            $errorNotification.html(msg).show();
                        });
                    }
                    else {
                        replyData.ID = contentID;
                        replyData.typeID = typeID;
                        if ($nameField.length) {
                            replyData.url = $urlField.val();
                        }
                        if (streamItemView.data.activityList.length &&
                            streamItemView.data.activityList[0].content.commentContentResource &&
                            streamItemView.data.activityList[0].content.commentContentResource.objectType == 129) {
                            replyData.isBackChannelComment = true;
                        }
                        if (parentCommentID) {
                            replyData.parentCommentID = parentCommentID;
                        }
                        if (version) {
                            replyData.version = version;
                        }

                        streamItemView.emit('commentSubmit', replyData, function(data) {
                            $article.css("z-index", 0);
                            // show bottom parent reply link, if hidden
                            $article.find('.j-act-replyto').show();
                            $article.find("div.j-panel-rte").toggle(function() {
                                if (streamItemView.rteView) {
                                    streamItemView.resetRTE($article);
                                }
                            });
                            streamItemView.renderReply(idPostfix, data, statusInputType);
                        }, function (msg, status) {
                            $errorNotification.html(msg).show();
                        });
                    }
                }
            });

            var rteOptions = {
                $element            : $article.find("textarea.wysiwygtext"),
                controller          : jiveControl,
                preset              : "stream-narrow",
                preferredMode       : streamItemView.rteOptions.preferredMode,
                startMode           : streamItemView.rteOptions.startMode,
                mobileUI            : streamItemView.rteOptions.mobileUI,
                isEditing           : streamItemView.rteOptions.isEditing,
                toggleText          : jive.eae.common.jsI18nHelper({key: 'rte.toggle_display'}),
                alwaysUseTabText    : jive.eae.common.jsI18nHelper({key: 'post.alwaysUseThisEditor.tab'}),
                editDisabledText    : jive.eae.common.jsI18nHelper({key: 'rte.edit.disabled'}),
                editDisabledSummary : jive.eae.common.jsI18nHelper({key: 'rte.edit.disabled.desc'}),
                communityName       : streamItemView.rteOptions.communityName,
                images_enabled      : imagesEnabled,
                theme_advanced_resizing : false,
                // setting the height of the RTE manually
                height              : 175,
                onReady             : function(){
                    streamItemView.slideOpenRTE(function(){
                        streamItemView.rteView.focus();
                        streamItemView.rteView.autoReposition();
                        promise.emitSuccess();
                    });
                },
                services: {
                    imageService: imageService,
                    formService: formService,
                    entitlementService: entitlementService
                }
            };

            streamItemView.rteLocation = $article.attr('id');
            streamItemView.rteView = new jive.rte.RTEWrap(rteOptions);
        });


        $article.find('a.j-panel-hide-rte-link').unbind();
        $article.find('a.j-panel-hide-rte-link').click(function (e) {
            $article.find(".jive-comment-error").hide();
            $article.css("z-index", 0);
            // show bottom parent reply link, if hidden
            $article.find('.j-act-replyto').show();
            streamItemView.resetRTE($article);
            e.preventDefault();
        });

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
                $microRteView.show();
                view.focus();
            }
        }
        else {
            $microRteView.detach();
            $replyableContainer.after($microRteView);
            $microRteView.show();
            view.focus();
        }
    };

    // clear out RTE data and reset for next call
    this.resetRTE = function ($article) {
        $article.find("div.j-panel-rte").hide();
        if (this.rteView) {
            this.rteView.destroy();
            this.rteView = null;
        }
        if ($j('textarea.wysiwygtext', $article).length) {
            $j('textarea.wysiwygtext', $article).remove();
        }
        if ($article.find(".replyGuestName").length) {
            $article.find(".replyGuestName").val('');
            $article.find(".replyGuestEmail").val('');
            $article.find(".replyGuestUrl").val('');
        }
        $article.find("div.j-js-reply-to").empty();
        $article.find("form[name=jive-comment-post-form] input[type=submit]").prop('disabled', false);
        $article.find("form[name=jive-comment-post-form]").prepend(jive.eae.common.rteTextArea());
    };

    /**
     * renders an inline reply, complicated because the post-reply behavior is different for different stream types
     */
    this.renderReply = function(idPostfix, data, type){

        var streamItemView = this,
            $content = streamItemView.getContent(),
            normalizedData;

        if(type == 'mbComment'){
            replyToAuthor = streamItemView.data.originalAuthor;
            normalizedData = streamItemView.convertDataToActivity(data,
                {content:
                    {typeWallEntryComment: (streamItemView.data.jiveObject.typeWallEntry) ? true : false,
                    typeComment:true,
                    parentAuthor:replyToAuthor,
                    domIDPostfix:jive.soy.func.randomString()},
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
                replyToAuthor = streamItemView.data.author;
            }
            normalizedData = streamItemView.convertDataToActivity(data,
                {content:
                        {domIDPostfix:jive.soy.func.randomString(),
                         parentAuthor: replyToAuthor,
                         jsAppActivityRepliedToData: jsAppActivityRepliedToData,
                         typeComment:true},
                activityData:{domIDPostfix:jive.soy.func.randomString()}});
            // set special var for which app entry we replied to
        }
        // make sure html version of reply is wrapped for padding of lists
        normalizedData.content.html = streamItemView.shiv("<div class='jive-rendered-content'>"+
            normalizedData.content.html+"</div>");
        // convert htmlfragment object to string, for IE rendering
        normalizedData.content.html = $j('<div>').append($j(normalizedData.content.html).clone()).remove().html();
        var activityContainer = streamItemView.data;
        activityContainer.replyCount = streamItemView.data.replyCount + 1;
        activityContainer.numCurrent = streamItemView.data.numCurrent + 1;
        activityContainer.numCurrentSubActivities = streamItemView.data.numCurrentSubActivities + 1;
        activityContainer.activityList.push(normalizedData);

        var $currentItemsList = $content.find('.j-sub-activity-items'),
            $expandButton = $content.find('.j-expand-comments'),
            $newExpandedExcerpt =
                $j(jive.eae.common.subactivity(
                    {
                        activity: normalizedData,
                        activityContainer:activityContainer,
                        isHidden: false,
                        user: streamItemView.viewingUserData,
                        streamType: streamItemView.streamType,
                        addedInline: true,
                        hideStub: true,
                        forceCurrent: false,
                        canCreateMbImage: false, //doesn't matter
                        canCreateMbVideo: false, //doesn't matter
                        mbCreationModerated: false //doesn't matter
                    }
                ));

        if (normalizedData.moderated && !$currentItemsList.length) {
            var $workingExpView = streamItemView.buildExpandedView(activityContainer);
            $content.find('.j-act-exp-view').replaceWith($workingExpView);
            $currentItemsList = $content.find('.j-sub-activity-items');
        }

        // if there's no sub activity items yet, the item hasn't been expanded and the comment will get "filled in"
        // on expansion anyway
        if ($currentItemsList.length) {
            $currentItemsList.append($newExpandedExcerpt);
            jive.rte.renderedContent.emit("renderedContent", $newExpandedExcerpt);
        }

        var $expandBar = $content.find('.j-act-expand-bar');
        if (!$expandButton.length) {
            var $newExpandButton = $j(jive.eae.activitystream.activityStreamExpandContent({
                activityContainer:activityContainer,
                streamType: streamItemView.streamType,
                filterType: streamItemView.filterType
            }));
            $expandBar.append($newExpandButton);
        }
        $expandBar.show();

        // We shouldn't add this reply to the originalCommentIDs anymore so that it'll get pulled in correctly
        // on "show more",
        //streamItemView.originalCommentIDs.push(normalizedData.content.id);
        streamItemView.subActivitiesByDomID[normalizedData.content.domIDPostfix] = normalizedData;

        var $newCollapsedExcerpt = $j(jive.eae.activitystream.collapsedActivityStreamExcerpt({
            activityContainer:activityContainer,
            activity: normalizedData,
            streamType: streamItemView.streamType,
            filterType: streamItemView.filterType,
            hidden: false,
            user: streamItemView.viewingUserData,
            hideStub: false,
            canCreateMbImage: false, //doesn't matter
            canCreateMbVideo: false, //doesn't matter
            mbCreationModerated: false, //doesn't matter
            time: normalizedData.creationTime
        }));
        $newCollapsedExcerpt.hide();

        var $collView = $content.find('div.j-act-coll-view'),
            $oldCollapsedExcerpts = $collView.children('.j-act-node');

        $collView.append($newCollapsedExcerpt);

        if ($oldCollapsedExcerpts.length) {
            $oldCollapsedExcerpts.remove();
        }
        $newCollapsedExcerpt.show();

        var $commentCountText = streamItemView.getContent().find('.j-act-replycount');
        $content.find('.j-new-count').remove();
        $commentCountText.each(function() {
            $j(this).replaceWith(jive.eae.common.replyCountText({
                activityContainer: streamItemView.data,
                streamType: streamItemView.streamType,
                showCurrentCount: (streamItemView.streamType == 'user' || streamItemView.streamType == 'all') &&
                    $j.inArray('all', streamItemView.filterType) != -1}));

        });
        $content.addClass('j-replied-to');
        streamItemView.postRender();
    };

    this.hideMe = function(type, hide) {
        var streamItemView = this,
            $content = streamItemView.getContent();
        if (hide) {
            var $hideView = $content.find('div.j-act-hidden');
            $hideView.attr('data-hidBy', type);
            $hideView.html(jive.eae.activitystream.hiddenActivityView({activityContainer: streamItemView.data,
                                                                       type: type}));
            // click handler for the item's unhide link (after hiding, before refresh)
            $hideView.find('a.j-js-unhide').unbind().click(function(e){
                var type = $j(this).closest('.j-act-hidden').attr('data-hidBy');
                streamItemView.emit('hide', type, streamItemView.hideData, false);
                e.preventDefault();
            });
            // click handler for the item's dismiss item link (after hiding, before refresh)
            $hideView.find('a.j-js-dismiss').unbind().click(function(e){
                $hideView.hide();
                e.preventDefault();
            });
            $hideView.show();
        }
        else {
            var $hideView = $content.find('div.j-act-hidden');
            $hideView.attr('data-hidBy', '');
            $hideView.hide();
        }
    };

    this.hideMicroRTEInput = function(idPostfix, callback){
        var $statusInputContainer = $j('#microRTEContainer_'+idPostfix),
            view = this.initMicroRTEView(idPostfix, $statusInputContainer),
            content = $statusInputContainer.closest('div.j-act-entry');
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

    this.buildExpandedView = function (activityContainer) {
        var streamItemView = this,
            $newExpandedView = $j(jive.eae.activitystream.expandedActivityStreamItemView({
                activityContainer: activityContainer,
                user: streamItemView.viewingUserData,
                streamType: streamItemView.streamType,
                canCreateMbImage: streamItemView.canCreateMbImage,
                canCreateMbVideo: streamItemView.canCreateMbVideo,
                mbCreationModerated: streamItemView.mbCreationModerated
            }));
        jive.rte.renderedContent.emit("renderedContent", $newExpandedView);
        return $newExpandedView;
    };
});


