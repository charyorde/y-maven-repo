/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends template=jive.inbox.readingPaneDefault scope=client
 * @depends template=jive.eae.acclaim.*
 * @depends template=jive.DiscussionApp.soy.rteMsgQuote scope=client
 * @depends template=jive.eae.poll.common.voteCount
 * @depends template=jive.eae.common.activityContentText
 * @depends template=jive.eae.common.replyCountText
 * @depends template=jive.eae.common.jsI18nHelper
 * @depends template=jive.eae.common.rteTextArea
 * @depends template=jive.eae.common.rtePanel
 * @depends template=jive.eae.common.replyingToText
 * @depends template=jive.discussions.soy.qDisplayInlineAnswers
 * @depends path=/resources/scripts/apps/content/polls/widget/main.js
 * @depends path=/resources/scripts/jive/rte/renderedContent.js
 * @depends path=/resources/scripts/jive/rte/rte_wrap.js
 * @depends path=/resources/scripts/jive/model/control.js lazy=true
 * @depends path=/resources/scripts/jive/rte/ImageService.js lazy=true
 * @depends path=/resources/scripts/jive/rte/FormService.js lazy=true
 * @depends path=/resources/scripts/jive/rte/EntitlementService.js lazy=true
 * @depends i18nKeys=post.guest_wrote.label
 * @depends i18nKeys=post.user_wrote.label
 * @depends dwr=WikiTextConverter
 */
jive.namespace('ActivityStream');

jive.ActivityStream.CommunicationStreamReadingPaneView = jive.AbstractView.extend(function(protect, _super) {

    this.init = function(options) {
        var readingPane = this;
        _super.init.call(this, options);
        this.rteOptions = options.rteOptions;
        this.i18n = options.i18n;
        this.currentStreamItemView = null;
        this.mobileUI = this.rteOptions.mobileUI;
        this.ie7 = $j.browser.msie && $j.browser.version < 8;
        this.delay = (function(){
            var timer = 0;
            return function(callback, ms){
                clearTimeout (timer);
                timer = setTimeout(callback, ms);
            };
        })();
        this.viewType = options.viewType;
    };

    this.getSoyTemplate = function(){
        return jive.inbox.streamReadingPanes();
    };

    this.postRender = function() {
        var readingPane = this,
            $readingPaneContent = readingPane.getContent();
        $readingPaneContent.delegate('.j-js-mention-reply-dismiss', 'click', function() {
            $j(this).closest('div.j-js-mention-reply').fadeOut('fast');
        });

        $readingPaneContent.bind('click touchend', function(e) {
            var defaultAction = false;
            if (readingPane.currentStreamItemView) {
                var $target = $j(e.target),
                    $targetParents = $target.add($target.parents());
                if (readingPane.viewType == 'full' && $target.is('#j-back-to-list')) {
                    readingPane.emitP('backToList').addCallback(function() {
                        $readingPaneContent.hide();
                    });
                }
                else if ($target.is('a.j-pagination-next')) {
                    readingPane.emit('selectAdjacentItem', false);
                }
                else if ($target.is('a.j-pagination-prev')) {
                    readingPane.emit('selectAdjacentItem', true);
                }
                else {
                    defaultAction = readingPane.currentStreamItemView.handleClick(e, $targetParents);
                }
            }
            if (defaultAction) return true;
            e.preventDefault();
        });
    };

    this.refresh = function($newStreamExpView, renderedDataObject, itemidwithoutcontainer, callback) {
        var readingPane = this,
            newSubActivities = []; // holds new sub-activities' data
        if (readingPane.currentStreamItemView) {
            // special case for an updated item being the item expanded in the reading pane.  Update the reading pane manually to avoid
            // the user losing a comment they're about to enter or other issues, very complex keeping everything in line.
            var newActivities = [], // holds new sub-activities' markup
                newCommentIDs = [],
                $content = readingPane.getContent(),
                $readingPaneSubActivities = $content.find('.j-sub-activity-items'), // sub activities in the current reading pane
                oldStreamItemData = readingPane.currentStreamItemView; // stream item object of the item being displayed in reading pane

            var $expView = $content.find('div.j-act-exp-view'),
                newLinkedID = $newStreamExpView.attr('data-linkedID');
            if (newLinkedID != $expView.attr('data-linkedID')) {
                // if the content has moved containers since page refresh, the id of the item may have changed
                $expView.attr('data-linkedID', newLinkedID);
                readingPane.currentStreamItemView.updateID(newLinkedID);
            }
            var $updatedSubActivityList = $newStreamExpView.find('.j-sub-activity-items .j-act-node'),
                updatedSubActivitiesLength = $updatedSubActivityList.length;

            if (renderedDataObject.jiveObject.typeLatestAcclaim) {
                var $newAcclaimLIs = $newStreamExpView.find('li.j-act-g-item').show();
                $content.find('ul.j-act-g-list').prepend($newAcclaimLIs);
                // also update latest acclaim leaderboard
                readingPane.emit('getFullContent', renderedDataObject.jiveObject, function(data) {
                    $content.find('div.js-full-content-body').html(data.html);
                });
                callback(itemidwithoutcontainer, renderedDataObject.activityList);
            }
            else {
                for (var updatedSubActivitiesIndex = 0; updatedSubActivitiesIndex < updatedSubActivitiesLength; updatedSubActivitiesIndex++) {
                    var $updatedActivity = $j($updatedSubActivityList[updatedSubActivitiesIndex]),
                        $expandedActivity = $readingPaneSubActivities.find('div[data-objectid=' +
                                            $updatedActivity.attr('data-objectid') + '][data-objecttype=' +
                                            $updatedActivity.attr('data-objecttype') + ']');
                    // Search for the updated activity in the set of activities currently in the reading pane, if it doesn't exist, we have to add it manually and push the activity data to the
                    // stream item object (if it's a comment/reply, probably don't need to if it's a mod or bookmark or StreamEntry)
                    if (!$expandedActivity.length) {
                        var newSubActID = $updatedActivity.attr('data-objectid'),
                            renderedDataObjectActivityListLength = renderedDataObject.activityList.length; //length of the activityList in new activitycontainer;
                        // add the data object to the list of new activities to be manually added to the streamItem object on callback
                        for(var renderedDataActivityListIndex = 0; renderedDataActivityListIndex < renderedDataObjectActivityListLength; renderedDataActivityListIndex++) {
                            var renderedDataActivity = renderedDataObject.activityList[renderedDataActivityListIndex];
                            if (newSubActID == renderedDataObject.activityList[renderedDataActivityListIndex].content.id) {
                                newSubActivities.push(renderedDataActivity);
                                if (renderedDataActivity.content.typeComment || renderedDataActivity.content.typeMessage) {
                                    newCommentIDs.push(newSubActID);
                                    // make sure this new comment isn't re-fetched when getting earlier comments on "show earlier" click
                                    readingPane.currentStreamItemView.appendOriginalCommentID(newSubActID);
                                    readingPane.currentStreamItemView.incrementReplyCounts(1,0,0);
                                }
                                break;
                            }
                        }
                        readingPane.currentStreamItemView.incrementReplyCounts(0,1,1);
                        // push the dom object into the list of new activities to be appended manually in the reading pane
                        newActivities.push($updatedActivity);
                    }
                }
                if (newCommentIDs.length) {
                    // now fire off request to get the full HTML and liking data of the new comment/reply activities
                    var fullRepliesRequest = new jive.ActivityStream.FullRepliesRequest({originalIDs: newCommentIDs}),
                        oldActivityContainer = oldStreamItemData.getActivityContainer(),
                        parentType = (oldActivityContainer.jiveObject.typeThread ? 1 : oldActivityContainer.jiveObject.objectType),
                        parentID = (oldActivityContainer.jiveObject.typeThread ? oldActivityContainer.jiveObject.threadID : oldActivityContainer.jiveObject.id);

                    readingPane.emit('getFullReplies', {objectType: parentType, objectID: parentID}, fullRepliesRequest, function(data) {
                        var newCommentDataLength = data.items.length,
                            newCommentDataByID = {},
                            newActivitiesLength = newActivities.length,
                            $loadedActivity;
                        for (var i = 0; i < newCommentDataLength; i++) {
                            newCommentDataByID[data.items[i].content.id+''] = data.items[i];
                        }
                        for (i = 0; i < newActivitiesLength; i++) {
                            $loadedActivity = newActivities[i];
                            var loadedActivityData = newCommentDataByID[$loadedActivity.attr('data-objectid')];
                            if (loadedActivityData && (loadedActivityData.content.typeComment ||
                                                       loadedActivityData.content.typeMessage)) {
                                $loadedActivity.find('div.j-excerpt-full-html-content').html(
                                    jive.eae.common.activityContentText({
                                        activity: loadedActivityData,
                                        noAutoescape: true
                                    })
                                );
                                jive.rte.renderedContent.emit("renderedContent", $loadedActivity);
                                // liking data needs re-rendering for all but latest activity, just re-render all of em.
                                var $likingControl = $loadedActivity.find('.j-js-liking-control');
                                if ($likingControl.length) {
                                    var $container = $likingControl.find('.js-acclaim-container');
                                    $likingControl.html(jive.eae.acclaim.likeControl({
                                        canLike    : !!$container.data('canLike'),
                                        liked      : loadedActivityData.liked,
                                        likeCount  : loadedActivityData.likeCount,
                                        objectId   : loadedActivityData.content.id,
                                        objectType : loadedActivityData.content.objectType,
                                        showIcon   : $container.data('showicon'),
                                        type       : 'mini'
                                    }));
                                }
                                $loadedActivity.hide();
                                $readingPaneSubActivities.append($loadedActivity);
                                $loadedActivity.show();
                            }
                            else {
                                $loadedActivity.hide();
                                $readingPaneSubActivities.append($loadedActivity);
                                $loadedActivity.show();
                            }
                        }
                        callback(itemidwithoutcontainer, newSubActivities);
                    });
                    var $commentCountText = $j('#j-js-communications-exp').find('.j-act-replycount');
                    if ($commentCountText.length) {
                        $commentCountText.replaceWith(jive.eae.common.replyCountText({
                            activityContainer: readingPane.currentStreamItemView.getActivityContainer(),
                            streamType: 'communications',
                            showCurrentCount: false}));
                    }
                }
                else {
                    if (newActivities.length) {
                        $updatedActivity = newActivities.shift();
                        $updatedActivity.hide();
                        jive.rte.renderedContent.emit("renderedContent", $updatedActivity);
                        $readingPaneSubActivities.append($updatedActivity);
                        $updatedActivity.show();
                    }
                    callback(itemidwithoutcontainer, newSubActivities);
                }
            }
        }
        else {
            callback(itemidwithoutcontainer, newSubActivities);
        }
    };

    // function that will take the $expandedData and show it in the readingPane.  Handles replacing data
    // currently in the readingPane back in the stream if necessary
    this.showReadingPaneData = function($expandedData, objectData, streamItemView, promise){
        var readingPane = this,
            $drawer = readingPane.getContent(),
            $subActivityList = $expandedData.find('.j-sub-activity-items');

        var $dataShowingExp = $drawer.find('div.j-act-exp-view'),
            expDataIdentifier = $dataShowingExp.attr('data-linkedID');



        var isMB = !!$expandedData.find('div.j-act-mb').length,
            isShare = !!$expandedData.find('div.j-act-share').length, //shares should now always show the full
                                                                      // content body of the shared object
            isDM = !!$expandedData.find('div.j-act-dm').length,
            $fullContentBody = $expandedData.find('div.js-full-content-body'),
            $fullContentView = $expandedData.find('div.js-full-content-container');
        if ((!$subActivityList.children('.j-act-node').length || isShare) &&
                $fullContentView.length &&
                !$fullContentBody.html()
                && !isMB
                && !isDM) {
            // must be non-mb, non-share, non-dm creation activity only, show full content panel
            readingPane.emit('getFullContent', objectData, function(data) {
                $fullContentBody.html(data.html);
                jive.rte.renderedContent.emit("renderedContent", $fullContentBody);
                if (data.extraData.poll) {
                    // init poll view, if necessary
                    readingPane.initPollView(data.extraData, $fullContentView);
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
                $fullContentView.show();
                $expandedData.find('div.j-act-header-slug').hide();
                $expandedData.find('a.j-js-show-full-content').hide();
                $expandedData.find('a.j-js-hide-full-content').show();
            });
        }
        readingPane.currentStreamItemView = streamItemView;

        if (objectData.immediateFillInTheGapsPageSize) {
            //replace the expanded data back in the list
            $dataShowingExp.hide();
            readingPane.resetRTE($drawer);
            $dataShowingExp.detach();
            if (expDataIdentifier) {
                $j('#' + expDataIdentifier + ' .j-js-act-content').append($dataShowingExp);
            }
            $drawer.append($expandedData);
            readingPane.currentStreamItemView.getEarlierSubActivities(objectData.immediateFillInTheGapsPageSize, function() {
                $expandedData.show();
                promise.emitSuccess();
            });
        }
        else {
            //replace the expanded data back in the list
            $dataShowingExp.hide();
            readingPane.resetRTE($drawer);
            $dataShowingExp.detach();
            if (expDataIdentifier) {
                $j('#' + expDataIdentifier + ' .j-js-act-content').append($dataShowingExp);
            }
            $drawer.append($expandedData);
            $expandedData.show();
            promise.emitSuccess();
        }


        var $paginators = $drawer.find('.j-pagination-prevnext');
        if (objectData.prevArticleExists) {
            $paginators.removeClass('j-prev-disabled').addClass('j-prev-enabled');
        }
        else {
            $paginators.removeClass('j-prev-enabled').addClass('j-prev-disabled');
        }
        if (objectData.nextArticleExists) {
            $paginators.removeClass('j-next-disabled').addClass('j-next-enabled');
        }
        else {
            $paginators.removeClass('j-next-enabled').addClass('j-next-disabled');
        }
    };

    // attached to the click of a non-MB reply link
    this.showRTE = function(contentData, $replyActivity, promise){
        var readingPane = this,
            $drawer = $replyActivity.closest('div.j-act-exp-view'),
            $rteView = $drawer.find('div.j-panel-rte');
        if (!$rteView.length) {
            var $rtePanel = $j(jive.eae.common.rtePanel({
                user: window._jive_current_user,
                hideGuestURLField: (readingPane.currentStreamItemView.getActivityContainer().jiveObject.typeThread ? true : false),
                externallyVisible: contentData.objectVisibility
            }));
            $rteView = $rtePanel.find('div.j-panel-rte');
            $drawer.children('div.j-js-ibx-item').append($rtePanel);
        }
        if ($rteView.is(":visible")) {
            // show bottom parent reply link, if hidden
            $drawer.find('.j-act-replyto').show();
            $drawer.find("div.j-panel-rte").hide();
            $drawer.find(".jive-comment-error").hide();
            if (!$replyActivity.next().hasClass('j-panel-rte-wrap')) {
                var $rteForm = $drawer.find("div.j-panel-rte-wrap").detach();
                $replyActivity.after($rteForm);
                var $rteLoading = $rteForm.find("div.j-panel-rte-loading");
                readingPane.rteSpinner = new jive.loader.LoaderView();
                readingPane.rteSpinner.appendTo($rteLoading);
                $rteLoading.show();
                readingPane.initRTE($drawer, contentData, promise);
            }
            else {
                promise.emitSuccess();
            }
        }
        else {
            $rteForm = $drawer.find("div.j-panel-rte-wrap").detach();
            $replyActivity.after($rteForm);
            $rteLoading = $rteForm.find("div.j-panel-rte-loading");
            readingPane.rteSpinner = new jive.loader.LoaderView();
            readingPane.rteSpinner.appendTo($rteLoading);
            $rteLoading.show();
            readingPane.initRTE($drawer, contentData, promise);
        }
    };

    // slide the RTE into view.  Called by RTEWrap when the RTE is successfully initialized.
    this.slideOpenRTE = function (cb) {
        var readingPane = this,
            $readingPaneContent = readingPane.getContent(),
            $rteLocation = $readingPaneContent.find("div.j-panel-rte"),
            $rteWrap = $readingPaneContent.find("div.j-panel-rte-wrap"),
            $rteLoading = $readingPaneContent.find("div.j-panel-rte-loading");
        $rteLoading.hide();
        readingPane.rteSpinner.getContent().remove();
        readingPane.rteSpinner.destroy();
        $rteLocation.css('position', 'static');
        $rteLocation.show('fast', cb);
        if ($rteWrap.is(':last-child')) {
            $j(window).scrollTop($j(document).height());
        }
    };

    // initialize the RTE with the data provided.  The data provided will route the post of the form to the correct
    // web service and supply the correct data.
    this.initRTE = function($drawer, contentData, promise) {
        var idPostfix = contentData.idPostfix,
            replyData = {},
            readingPane = this,
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

        readingPane.resetRTE($drawer);

        statusInputType = (contentData.parent.jiveObject.typeThread ? 'discussionReply' : 'inlineComment');

        if (contentData.type == 'sub') {
            containerType = contentData.activity.containerObjectType;
            containerID = contentData.activity.containerObjectID;
            if (statusInputType == 'discussionReply') {
                forumThreadID = contentData.parent.jiveObject.threadID;
                if (contentData.activity.content.typeMention) {
                    // since @mentions of you now become the replyable activities (if current),
                    // fish out the parent reply id/subj if replying to a mention
                    subject = jive.util.unescapeHTML(contentData.activity.content.context.subject);
                    messageID = contentData.activity.content.context.id;
                }
                else {
                    subject = jive.util.unescapeHTML(contentData.activity.content.subject);
                    messageID = contentData.activity.content.id;
                }
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
                imagesEnabled = readingPane.rteOptions.hasImagePerms;
            }
            else {
                contentID = contentData.parent.jiveObject.id;
                typeID = contentData.parent.jiveObject.objectType;
                // resolves to same images enabled check done for comments on content page
                // (global images enabled && CommentPermHelper.getCanInsertImage())
                imagesEnabled = readingPane.rteOptions.hasImagePerms;
                if (contentData.activity.content.id != contentData.parent.jiveObject.id ||
                    contentData.activity.content.objectType != contentData.parent.jiveObject.objectType) {
                    // since @mentions of you now become the replyable activities (if current),
                    // fish out the parent comment id if replying to a mention
                    parentCommentID = (contentData.activity.content.typeMention ?
                        contentData.activity.content.context.id:
                        contentData.activity.content.id);
                }
                if (contentData.parent.jiveObject.versionNumber) {
                    version = contentData.parent.jiveObject.versionNumber;
                }
            }
            author = contentData.activity.activityUser;
            $drawer.find("div.j-js-reply-to").html(jive.eae.common.replyingToText({
                type: 'user',
                object:author,
                externallyVisible:(contentData.objectVisibility == 'true')
            }));
        }
        else {
            containerType = contentData.parent.container.type;
            containerID = contentData.parent.container.id;
            author = contentData.parent.originalAuthor;
            if (statusInputType == 'discussionReply') {
                subject = jive.util.unescapeHTML(contentData.parent.jiveObject.subject);
                forumThreadID = contentData.parent.jiveObject.threadID;
                messageID = contentData.parent.jiveObject.id;
                // resolves to same images enabled check done on a discussion page.
                // (forum-macros.ftl -> isWikiImagesEnabled ->
                //  WikiUtils.isWikiImageSyntaxEnabled(container) (always true) &&
                //  action.hasPermissionsToUploadImages() ->
                // AttachmentPermHelper.getCanCreateImageAttachment(rootMessage) )
                imagesEnabled = contentData.parent.jiveObject.imagesEnabled;
                $drawer.find("div.j-js-reply-to").html(jive.eae.common.replyingToText({
                    type: 'user',
                    object:author,
                    externallyVisible: (contentData.objectVisibility == 'true')
                }));
            }
            else if (contentData.parent.jiveObject.typeExternalActivity) {
                contentID = contentData.objectID;
                typeID = contentData.objectType;
                // resolves to same images enabled check done for comments on content page
                // (global images enabled && CommentPermHelper.getCanInsertImage())
                imagesEnabled = readingPane.rteOptions.hasImagePerms;
                $drawer.find("div.j-js-reply-to").html(jive.eae.common.replyingToText({
                    type: 'content',
                    object:{},
                    externallyVisible:(contentData.objectVisibility == 'true')
                }));
            }
            else {
                contentID = contentData.parent.jiveObject.id;
                typeID = contentData.parent.jiveObject.objectType;
                // resolves to same images enabled check done for comments on content page
                // (global images enabled && CommentPermHelper.getCanInsertImage())
                imagesEnabled = readingPane.rteOptions.hasImagePerms;
                if (contentData.parent.jiveObject.versionNumber) {
                    version = contentData.parent.jiveObject.versionNumber;
                }
                $drawer.find("div.j-js-reply-to").html(jive.eae.common.replyingToText({
                    type: 'content',
                    object:contentData.parent.jiveObject,
                    externallyVisible:(contentData.objectVisibility == 'true')
                }));
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
                objectID: (contentData.parent.jiveObject.typeThread ? contentData.parent.jiveObject.threadID : contentData.parent.jiveObject.id),
                objectType: (contentData.parent.jiveObject.typeThread ? 1 : contentData.parent.jiveObject.objectType),
                entitlement: "VIEW"
            });

            imageService = new JiveRTEImageService({
                objectId: -1,
                objectType: -1,
                containerId: containerID,
                containerType: containerType
            });

            formService = new JiveRTEFormService({
                $form: $drawer.find("form.j-panel-rte-view"),
                formSubmitHandler: function() {
                    $j(this).find('input[type=submit]').prop('disabled', true);
                    replyData.body = readingPane.rteView.getHTML();
                    var $errorNotification = $drawer.find(".jive-comment-error")
                    if (!replyData.body.length) {
                        $errorNotification.html(readingPane.i18n.empty_comment).show();
                        $j(this).find('input[type=submit]').prop('disabled', false);
                        return;
                    }
                    else {
                        $errorNotification.hide();
                    }

                    if (statusInputType=='discussionReply') {
                        replyData.subject = subject;
                        replyData.forumThreadID = forumThreadID;
                        replyData.ID = messageID;
                        readingPane.emit('replySubmit', replyData, function(data) {
                            // show bottom parent reply link, if hidden
                            $drawer.find('.j-act-replyto').show();
                            $drawer.find("div.j-panel-rte").slideToggle('fast', function() {
                                if (readingPane.rteView) {
                                    readingPane.resetRTE($drawer);
                                }
                            });
                            readingPane.currentStreamItemView.renderReply(idPostfix, data, statusInputType);
                        }, function (msg, status) {
                            $errorNotification.html(msg).show();
                        });
                    }
                    else {
                        replyData.ID = contentID;
                        replyData.typeID = typeID;
                        var activityContainer = readingPane.currentStreamItemView.getActivityContainer();
                        // Activity list *might* be empty if it's just the creation activity in the original list,
                        // in which case it couldn't be a backchannel comment list anyway
                        if (activityContainer.activityList.length &&
                            activityContainer.activityList[0].content.commentContentResource &&
                            activityContainer.activityList[0].content.commentContentResource.objectType == 129) {
                            replyData.isBackChannelComment = true;
                        }

                        if (parentCommentID) {
                            replyData.parentCommentID = parentCommentID;
                        }
                        if (version) {
                            replyData.version = version;
                        }
                        readingPane.emit('commentSubmit', replyData, function(data) {
                            // show bottom parent reply link, if hidden
                            $drawer.find('.j-act-replyto').show();
                            $drawer.find("div.j-panel-rte").slideToggle('fast', function() {
                                if (readingPane.rteView) {
                                    readingPane.resetRTE($drawer);
                                }
                            });
                            readingPane.currentStreamItemView.renderReply(idPostfix, data, statusInputType);
                        }, function (msg, status) {
                            $errorNotification.html(msg).show();
                        });
                    }
                }
            });
            var rteOptions = {
                $element            : $drawer.find("textarea.wysiwygtext"),
                controller          : jiveControl,
                preset              : "stream-narrow",
                preferredMode       : readingPane.rteOptions.preferredMode,
                startMode           : readingPane.rteOptions.startMode,
                mobileUI            : readingPane.rteOptions.mobileUI,
                isEditing           : readingPane.rteOptions.isEditing,
                toggleText          : jive.i18n.getMsg('rte.toggle_display'),
                alwaysUseTabText    : jive.i18n.getMsg('post.alwaysUseThisEditor.tab'),
                editDisabledText    : jive.i18n.getMsg('rte.edit.disabled'),
                editDisabledSummary : jive.i18n.getMsg('rte.edit.disabled.desc'),
                communityName       : readingPane.rteOptions.communityName,
                theme_advanced_resizing : false,
                // setting the height of the RTE manually
                height              : 175,
                images_enabled      : imagesEnabled,
                onReady             : function(){
                    readingPane.slideOpenRTE(function(){
                        readingPane.rteView.focus();
                        readingPane.rteView.autoReposition();
                        promise.emitSuccess();
                    });
                },
                services: {
                    imageService: imageService,
                    formService: formService,
                    entitlementService: entitlementService
                }
            };

            readingPane.rteLocation = $drawer.attr('data-linkedID');
            readingPane.rteView = new jive.rte.RTEWrap(rteOptions);
        });


        $drawer.find('a.j-panel-hide-rte-link').unbind();
        $drawer.find('a.j-panel-hide-rte-link').click(function (e) {
            $drawer.find(".jive-comment-error").hide();
            // show bottom parent reply link, if hidden
            $drawer.find('.j-act-replyto').show();
            readingPane.resetRTE($drawer);
            e.preventDefault();
        });
    };

    // clear out RTE data and reset for next call
    this.resetRTE = function ($drawer) {
        $drawer.find("div.j-panel-rte").hide();
        if (this.rteView) {
            this.rteView.destroy();
            this.rteView = null;
        }
        if ($j('textarea.wysiwygtext', $drawer).length) {
            $j('textarea.wysiwygtext', $drawer).remove();
        }
        $drawer.find("div.j-js-reply-to").empty();
        $drawer.find("form[name=jive-comment-post-form] input[type=submit]").prop('disabled', false);
        $drawer.find("form[name=jive-comment-post-form]").prepend(jive.eae.common.rteTextArea());
    };

    // collapse the drawer data  (shows default text)
    this.collapseReadingPane = function() {
        var readingPane = this,
            $drawer = readingPane.getContent(),
            $dataShowingExp = $drawer.find('div.j-act-exp-view'),
            $defaultText = $j(jive.inbox.readingPaneDefault({}));
        $dataShowingExp.remove();
        $j('#j-communications-list').children('div.j-js-ibx-item').removeClass('j-act-active');
        $drawer.append($defaultText);
        readingPane.currentStreamItemView = null;
    };

    this.getActivityList = function() {
        return this.getContent().find('div.j-act-ibx-exp-list');
    };

    this.initPollView = function (pollOptions, $fullContentContainer) {
        // pollOptions param only used for polls, make sure the vote count is up-to-date
        if (pollOptions) {
            if ($j.browser.msie) {
                // ie won't run this js inline when creating the poll markup
                var opts = {
                    containerType : pollOptions.containerType,
                    containerID : pollOptions.containerID,
                    widgetID : pollOptions.widgetID,
                    moreUrl : pollOptions.moreUrl,
                    createUrl : pollOptions.createUrl,
                    canCreatePoll : pollOptions.canCreatePoll,
                    pollID : pollOptions.poll.id,
                    pollIndex : pollOptions.poll.index
                };
                new jive.PollWidget.Main(opts);
            }
            if (pollOptions.poll.votesCount) {
                var $voteCount = $fullContentContainer.find('.j-act-poll-votect');
                $voteCount.html(jive.eae.poll.common.voteCount({numOfVotes: pollOptions.poll.votesCount}));
            }
        }
    };


    this.defaultView = function () {
        var $content = this.getContent();
        $content.find('div.j-act-exp-view').show();
    };

    this.switchViewType = function(newType) {
        var readingPane = this;
        readingPane.viewType = newType;
    };

    this.hidePane = function(promise) {
        var readingPane = this,
            $drawer = readingPane.getContent();
        $drawer.hide();
        if (promise) {
            promise.emitSuccess();
        }
    }
});
