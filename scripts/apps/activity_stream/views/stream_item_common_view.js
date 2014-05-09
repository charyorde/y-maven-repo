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
 * @depends path=/resources/scripts/apps/content/polls/widget/main.js
 * @depends path=/resources/scripts/apps/microblogging/status_input_comment_controller.js
 * @depends path=/resources/scripts/apps/microblogging/status_input_repost_controller.js
 * @depends path=/resources/scripts/apps/microblogging/views/microblogging_comment_view.js
 * @depends path=/resources/scripts/apps/microblogging/views/repost_view.js
 * @depends path=/resources/scripts/apps/shared/views/form_waiting_view.js
 * @depends path=/resources/scripts/conversion/previewable-binary-lightbox.js
 * @depends template=jive.eae.common.repostModal
 * @depends template=jive.eae.acclaim.*
 * @depends template=jive.eae.poll.common.voteCount
 * @depends template=jive.eae.common.jsI18nHelper
 */


jive.namespace('ActivityStream');

jive.ActivityStream.StreamItemCommonView = jive.AbstractView.extend(function(protect, _super) {
    this.init = function (options) {
        _super.init.call(this, options);
        this.replyViews = {};
        this.mbCommentControllers = {};
        this.articleID = options.id;
        this.hideDataArr = options.id.split("_");
        this.unhideData = {itemHidden: false, contextHidden: false, contextTypeHidden: false};
        this.repostController = null;
        this.isLikeDataPopulated = false;
        this.data = options.data;
        this.viewingUserData = options.viewingUserData;
        this.streamType = options.streamType;
        this.filterType = options.filterType;
        this.rteOptions = options.rteOptions;
        this.gapTimestamp = 0;
        this.canCreateMbImage = options.canCreateMbImage;
        this.canCreateMbVideo = options.canCreateMbVideo;
        this.mobileUI = jive.rte.mobileUI;
        this.mbCreationModerated = options.mbCreationModerated;
    };

    protect.getSoyTemplate = jive.oo._abstract;

    protect.expandClickHandler = jive.oo._abstract;

    protect.handleClick = jive.oo._abstract;

    this.expandCollapseTargetCheck = function (e){
        // we only want handle click events from certain targets
        // returns true if we don't want to expand/collapse
        // avoid anchors, inputs, contentEditable elements, avatar images, inline status inputs, and status input elements.
        return $j(e.target).is('a');
    };

    this.handleClickCommon = function ($target, e, $targetParents, $content) {
        var streamItemView = this,
            defaultAction = false;

        if (!$content) {
            $content = streamItemView.getContent();
        }

        if ($target.hasClass('j-js-show-grouped-users')) {
            var $otherUsersLink = $target,
                $otherUsersMenu = $j('div.j-js-grouped-users[data-linkedID=' + $otherUsersLink.attr('data-linkedID') + ']');
            $otherUsersMenu.popover({context: $otherUsersLink, destroyOnClose: false});
            $otherUsersMenu.closest('div.js-pop').css({'z-index': 1004});
        }
        else if ($target.hasClass('j-repost')) {
            var object = streamItemView.data.jiveObject;
            var $modal = $j(jive.eae.common.repostModal({
                object: object,
                author: object.user,
                canCreateMbImage: streamItemView.canCreateMbImage,
                canCreateMbVideo: streamItemView.canCreateMbVideo,
                canAtMention: !jive.rte.mobileUI,
                mbCreationModerated: streamItemView.mbCreationModerated
            }));
            // Creating a jquery object from the output of this soy template surprisingly creates an
            // array of 3 objects: the modal div, as expected, and 2 script objects from the script tags
            // in the output.  Using this array as-is actually creates a lightbox init for each of the objects,
            // which triplicates the js work and leads to weird js issues.  Filtering out to only use the actual
            // html div as the modal object.
            $modal = $modal.filter('.j-repost-modal');
            var $formElem = $j('.j-act-reply-form > form', $modal),
                idPostfix = $formElem.attr('id').split('-')[$formElem.attr('id').split('-').length-1];

            $modal.lightbox_me({destroyOnClose: true, centered: true,
                onLoad:function(){
                    streamItemView.repostController = new jive.MicroBlogging.RepostController({viewOptions:{
                        selector: '#jive-js-repost-modal .j-eae-repost-form',
                        idPostfix: idPostfix,
                        atMentionBtn: $modal.find('a.jive-js-mention-button'),
                        imgAttachmentBtn: $modal.find('a.jive-js-imgattach-button'),
                        submitBtn: $modal.find('a.j-status-input-submit')},
                        manuallyRenderView: true
                    });

                    streamItemView.repostController.renderView();
                    streamItemView.repostController.getMicrobloggingView().focus();
                    jive.bindLightboxMedia();
                }
            });
        }
        else if ($targetParents.filter('[id^=showMicroRTE_]').length) {
            var $target = $targetParents.filter('[id^=showMicroRTE_]').first();
            streamItemView.showMicroInput($target);
        }
        else if ($targetParents.filter('.j-attach-anchor').length && $targetParents.filter('.j-attached-document').length) {
            // show lightbox viewer for attached documents (doc uploads only, for now)
            // parse docID from the actual doc url on the anchor
            var $target = $targetParents.filter('.j-attach-anchor').first(),
                docID = $target.attr('href').split('-')[$target.attr('href').split('-').length-1],
                url = _jive_base_url + '/conversion-viewer-overlay.jspa?objectID='+docID+'&objectType=102';
            showPreviewableBinary(url,'');
        }
        else {
            defaultAction = true;
        }
        return defaultAction;
    };

    protect.initMicroRTEView = function(idPostfix, $statusInputContainer){
        var streamItemView = this;
        if (!streamItemView.replyViews[idPostfix]){
            var $formElem = $statusInputContainer.find('.j-act-reply-form > form'),
                type = 'mbComment',
                parentSel = ' #microRTEContainer_'+idPostfix,
                selector = parentSel + ' .j-js-mb-comment',
                entitlementObjectID = $formElem.find('input[name=contentID]').val(),
                entitlementObjectType = $formElem.find('input[name=typeID]').val();

            if (!streamItemView.mbCommentControllers[idPostfix]) {
                streamItemView.mbCommentControllers[idPostfix] = new jive.MicroBlogging.CommentController({viewOptions:{
                        selector:selector,
                        idPostfix:idPostfix,
                        atMentionBtn: $formElem.find('a.jive-js-mention-button'),
                        submitBtn: $formElem.find('a.j-status-input-submit'),
                        cancelBtn: $formElem.find('a.j-status-input-cancel'),
                        $guestUserName:$statusInputContainer.find('.jive-reply-post-anonymous .replyGuestName'),
                        $guestUserEmail:$statusInputContainer.find('.jive-reply-post-anonymous .replyGuestEmail'),
                        $guestUserURL:$statusInputContainer.find('.jive-reply-post-anonymous .replyGuestUrl'),
                        viewingUserData: streamItemView.viewingUserData,
                        entitlementObjectID: entitlementObjectID,
                        entitlementObjectType: entitlementObjectType
                    }});
                streamItemView.mbCommentControllers[idPostfix].addListener('submitSuccess', function(data, promise){
                    streamItemView.renderReply(idPostfix, data, type);
                    jive.switchboard.emit('activity.stream.comment.created');
                }).addListener('cancel', function() {
                    streamItemView.hideMicroRTEInput(idPostfix);
                });
                streamItemView.replyViews[idPostfix] = streamItemView.mbCommentControllers[idPostfix].getMicrobloggingView();
            }
        }
        return streamItemView.replyViews[idPostfix];
    };



    /**
     * converts posted comment data to activity obj
     * @param data - posted comment data
     */
    protect.convertDataToActivity = function(data, options) {
        if(!options){
            options = {};
        }

        if(!options.content){
            options.content = {};
        }
        var commentDiv = $j(data.body)[1];
        var commentText = '';
        var commentHTML = '';

        commentHTML = $j(commentDiv).html();
        commentText = $j(commentDiv).text();
        var newDate = new Date();
        var activityUser = $j.extend(true, {}, this.viewingUserData);
        if (data.name && activityUser.anonymous) {
            // set the guest-supplied name in the activity user object
            activityUser.username = data.name;
            activityUser.displayName = data.name;
        }
        var activityData = {"activityUser":activityUser,
                            "type":"created",
                            "content":$j.extend({
                                "commentContentResource": {
                                    "id":this.data.jiveObject.id,
                                    "jiveObjectURL":"",
                                    "objectType":this.data.jiveObject.objectType,
                                    "jiveObjectCSS":this.data.jiveObject.jiveObjectCSS,
                                    "activityTemplate":null,
                                    "groupedActivityTemplate":null,
                                    "domIDPostfix":""
                                },
                                "id":data.id,
                                "parentAuthor":null,
                                "subject":data.body,
                                "text":commentText,
                                // special html param for rendering html correctly in reply, client side only
                                "html":commentHTML,
                                "contentTypeFeatureName": jive.eae.common.jsI18nHelper({key: 'eae.stream.comments'}),
                                "activityTemplate":null,
                                "groupedActivityTemplate":null},
                                options.content),
                            "read":false,
                            "creationDate":newDate.getTime(),
                            "creationTime":jive.eae.common.jsI18nHelper({key: 'global.less_than_a_minute_ago'}),
                            "targetObjectID":data.id,
                            "targetObjectType":105,
                            "containerObjectID":this.data.container.id,
                            "containerObjectType":this.data.container.type,
                            "current":true,
                            "domIDPostfix":"",
                            "likable":true,
                            "liked":false,
                            "likeCount":0,
                            "groupedModifiers":[],
                            "moderated": data.moderated};
        return $j.extend(activityData, options.activityData);
    };

    /**
     * renders an inline reply, complicated because the post-reply behavior is different for different stream types
     */
    protect.renderReply = jive.oo._abstract;

    this.determineHidden = function(type, data, hide) {
        if (data.interactedObjectID == this.hideData.objectID && data.interactedObjectType == this.hideData.objectType) {
            this.hideMe(type, hide);
        }
    };

    /**
     * Gets the liking data from the server about sub-activities of this stream item.  Normally, this data is
     * retrieved when getFullReplies is called, but just for StreamChannels, since getFullReplies isn't called, this
     * method is still used to get the liking data.
     */
    this.getLikeData = function($workingExpView, callback) {
        var streamItemView = this,
            excerptDataArr = [];
        // get all ids/types for all excerpts and add to array
        $workingExpView.find('div[id^=node-collapsed-]').each(function () {
            var objID = $j(this).attr('data-objectID'),
                objType =  $j(this).attr('data-objectType');
            excerptDataArr.push({id:objID, type:objType});
        });
        // send data array to controller for data gathering
        streamItemView.emit('getLikeData', excerptDataArr, function(type, id, data) {
            $j('div[id^=node-][data-objectID=' + id + '][data-objectType=' + type + ']', $workingExpView).each(function() {
                var $likingControl = $j('.j-js-liking-control', $j(this));
                if ($likingControl.length) {
                    var $container = $likingControl.find('.js-acclaim-container');
                    $likingControl.html(jive.eae.acclaim.likeControl({
                        canLike    : !!$container.data('canLike'),
                        liked      : !!data.acclaim.vote,
                        likeCount  : data.acclaim.scoreDisplay,
                        objectId   : id,
                        objectType : type,
                        showIcon   : !!$container.data('showicon'),
                        type       : 'mini'
                    }));
                }
            });
        });

        if (callback) {
            callback();
        }
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

    this.getID = function () {
        return this.articleID;
    };

    this.getParentTimestamp = function () {
        return this.data.parentTimestamp;
    }
});


