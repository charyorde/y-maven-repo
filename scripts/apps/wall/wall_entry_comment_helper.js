/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends i18nKeys=we.form.posted.*
 */
jive.namespace('Wall');

/**
 * Used by microblogging Wall related pages for rendering the comment form, posting comments, and retrieving
 * updates.
 *
 * See status-list.ftl or view-single-entry.ftl under the microblogging directories for example usage.
 *
 * @depends template=jive.statusinput.mention_warnings.jsI18nHelper
 * @depends template=jive.wall.deleteCommentConfirmation
 * @depends i18nKeys=tinymce.jivemention.no_notification
 * @depends i18nKeys=tinymce.jivemention.secret_group
 * @depends i18nKeys=tinymce.jivemention.restricted_conten
 */
jive.Wall.CommentHelper = function(options) {
    var commentStatusInputs = new jive.MicroBlogging.StatusInputs('#statusInputs-' + options.statusInputIdPostfix,
    {idPostfix:options.statusInputIdPostfix,
        allowTagCreation:false});
    var mobileUI = options.mobileUI || jive.rte.mobileUI;

    var statusInputID = 'message-' + options.statusInputIdPostfix;
    var notificationView = new jive.shared.NotificationView($j('#' + statusInputID)
            .parents('.jive-comment-content:first'), {info:'.jive-info-box:first',
        warn:'.jive-warn-box:first',
        error:'.jive-error-box:first'});
    var formWaitingView = new jive.shared.FormWaitingView($j('#statusInputs-' + options.statusInputIdPostfix)
            .parents('.jive-comment-content'));
    this.getStatusInputVals = function() {
        return commentStatusInputs.getSubmitVals(statusInputID);
    };

    this.resetStatusInput = function() {
        commentStatusInputs.resetText(statusInputID);
        for (var i in commentStatusInputs.statusInputs) {
            commentStatusInputs.statusInputs[i].getContainer().css("minHeight", 0);
        }
    };
    var that = this;

    commentStatusInputs.addListener('ready', function() {
        if (commentStatusInputs && commentStatusInputs.getStatusInput(statusInputID)) {
            if (mobileUI && options.container.find('a.jive-js-wall-mention-button, a.jive-js-mention-button').length) {
                options.container.find('a.jive-js-wall-mention-button, a.jive-js-mention-button').remove();
            }
            commentStatusInputs.getStatusInput(statusInputID).addListener('characterLenMsg', function(action, params) {
                jive.Wall.EditorView.handleCharacterLenMsg(action, params, options.container);
            }).addListener('atMentionFinished', function(id, name) {
                if (id && id.split("-").length == 2) {
                    var mentionObjectType = id.split("-")[0],
                        mentionObjectID = id.split("-")[1];

                    // user was mentioned, check entitlement
                    var entitlementService = new jive.rte.EntitlementService({
                        objectID: options.entitlementObjectID || 0,
                        objectType: options.entitlementObjectType || 0,
                        entitlement: "VIEW"
                    });

                    if (entitlementService && mentionObjectType) {
                        entitlementService.checkEntitlement(mentionObjectType, mentionObjectID).addCallback(function(entitled) {
                            if (!entitled) {
                                var warning_message = '';
                                if (mentionObjectType == 3) {
                                    warning_message = jive.statusinput.mention_warnings.jsI18nHelper({key:'tinymce.jivemention.no_notification'});
                                }
                                else if (mentionObjectType == 700) {
                                    warning_message = jive.statusinput.mention_warnings.jsI18nHelper({key:'tinymce.jivemention.secret_group'});
                                }
                                else {
                                    warning_message = jive.statusinput.mention_warnings.jsI18nHelper({key:'tinymce.jivemention.restricted_content'});
                                }
                                $j('<p>'+name+' '+warning_message+'</p>').message({style: 'warn'});
                            }
                        });
                    }
                }
            });
            // no need to create a separate view class for the at mentions button
            // just wire up the click handler here
            options.container.find('a.jive-js-wall-mention-button, a.jive-js-mention-button').click(function(e) {
                commentStatusInputs.getStatusInput(statusInputID).handleAtMentionButtonClick(e);
                e.stopPropagation();
            });
        }
    });

    var defaultOptions = {
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType:"json"
    };

    this.enableForm = function() {
        formWaitingView.enableForm();
    };

    this.disableForm = function() {
        formWaitingView.disableForm();
    };

    this.displayModeration = function() {
        notificationView.warn(jive.i18n.getMsg('we.form.posted.moderation'));
    };

    this.displayError = function(text) {
        notificationView.error(text);
    };

    // The comment object currently being manipulated by the user in the editor. Until the user has either attached
    // something or started to type something that necessitates a draft to be created this will be null.
    var comment = null;

    /**
     * Some actions require a draft in order to be able to occur, for instance adding MetaContent. This function takes
     * a callback and passes the draft to it when it has been created.
     *
     * @param callback the callback which will be called with one parameter, the created draft, after it has been
     * created.
     */
    function getEntry(callback) {
        if (comment != null) {
            callback(comment);
        }
        else {
            var createDraftCallback = function(entry) {
                comment = entry;
                callback(comment);
            };
            jive.Wall.CommentHelper.submitCommentDraft(createDraftCallback, options.wallEntryTypeID,
                    options.statusInputIdPostfix);
        }
    }

    // mixin initMeta from wall app
    this.initMeta = jive.Wall.Main.prototype.initMeta;
    // initialze meta objects passed in as options.meta
    var metaViews = [], meta = options.meta || [];
    meta.forEach(function(metaItem) {
        that.initMeta(metaItem, metaViews, options, options.container, getEntry);
    });
};

/**
 * Renders the wall entry comment form template
 */
jive.Wall.CommentHelper.renderCommentFormTemplate = function (wallEntryID, options) {
    var $commentWrapper = $j.find('.j-inline-comment-wrapper');

    var sID = $j($commentWrapper).find('.jive-comment-container').attr('data-statusid');
    if ($j($commentWrapper).find(".comment-form").length < 1) {
        $j($commentWrapper).find('ul').append(jive.wall.commentForm({
            statusID: sID,
            user: _jive_current_user,
            canComment: options.canComment,
            canCreateImage: options.canCreateImage,
            canAtMention: !jive.rte.mobileUI,
            visibleToExtCollaborator: options.visibleToExtCollaborator
        }));
        jive.Wall.CommentHelper.initComment(sID, {wallEntryTypeID:wallEntryID,
                                                 entitlementObjectID:options.entitlementObjectID,
                                                 entitlementObjectType:options.entitlementObjectType});
    }

    return false;
};

jive.Wall.CommentHelper.displayModeration = function (wallEntryID) {
    jive.Wall.CommentHelper.helpers[wallEntryID].displayModeration();
};

/**
 * Posts the comment to the rest service and then reloads the nearest wall comment listing.
 */
jive.Wall.CommentHelper.submitComment = function (button, wallEntryTypeID, url) {
    // Get the form id from the submit id attribute
    var formID = $j(button).data('status-id') || $j(button).attr('id');
    jive.Wall.CommentHelper.helpers[formID].disableForm();
    //Use that to determine reference the correct CommentHelper instance
    var COMMENT_ENDPOINT = jive.rest.url("/comments");
    var POST_COMMENT_ENDPOINT = COMMENT_ENDPOINT + "/" + wallEntryTypeID + "/" + formID;

    $j(function() {
        $j.ajax({
            type: "POST",
            url: POST_COMMENT_ENDPOINT,
            dataType:"json",
            data: JSON.stringify(jive.Wall.CommentHelper.getDataParams(formID)),
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                // re-enable the form
                jive.Wall.CommentHelper.helpers[formID].enableForm();
                jive.Wall.CommentHelper.helpers[formID].resetStatusInput();
                if (!data.moderated) {
                    // Reload the comment list to show the new comment immediately
                    jive.Wall.CommentHelper.reloadComments(formID, wallEntryTypeID, url);
                }
                else {
                    jive.Wall.CommentHelper.displayModeration(formID);
                }
            },
            error: function(data) {
                // re-enable the form
                jive.Wall.CommentHelper.helpers[formID].enableForm();
                jive.Wall.CommentHelper.helpers[formID].displayError(JSON.parse(data.responseText).error.message);
            }
        });
    });

    return false;
};

/**
 * Posts the comment draft to the rest service api
 * @param statusID
 * @param wallEntryTypeID
 * @param url
 */
jive.Wall.CommentHelper.submitCommentDraft = function(callback, wallEntryTypeID, wallEntryID) {
    var options = {
        url: jive.rest.url("/comments") + "/" + wallEntryTypeID + "/" + wallEntryID + "/draft",
        data: JSON.stringify(jive.Wall.CommentHelper.getDataParams(wallEntryID)),
        success: function(data) {
            // nomalize data
            data.comment.objectType = jive.Wall.Main.COMMENT_TYPE;
            data.comment.objectId = data.comment.commentID;
            callback(data.comment);
        },
        error: function(data) {
            var response = JSON.parse(data.responseText);
        },
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType:"json"
    };
    $j.ajax(options);
};
/**
 * Reloads the comment listing.
 *
 * @param statusID the status whose comments to reload
 */
jive.Wall.CommentHelper.reloadComments = function (statusID, wallEntryTypeID, url) {
    $j.ajax({
        type: "GET",
        url: url,
        dataType: "html",
        data: {
            id: statusID,
            type: wallEntryTypeID
        },
        success: function(html) {
            // Save the comment form for re-use
            var commentForm = $j('#wall-comments-' + statusID).find('li.comment-form');
            // Replace the comment list with the updated comment list
            $j('#wall-comments-' + statusID).replaceWith(html);
            // Restore the comment form
            $j(commentForm).find('.jive-form-element-textarea').val('');
            commentForm.appendTo($j('#wall-comments-' + statusID));
            jive.Wall.CommentHelper.initComment(statusID, {wallEntryTypeID:wallEntryTypeID});
        },
        error: function(data) {
            console.log("Failed to reload comments.");
        }
    });
};

/**
 * Deletes the comment and removes its associated list entry from the nearest wall comment listing.
 */
jive.Wall.CommentHelper.destroyComment = function (commentID) {
    // TODO destroy created objects?
    $j(jive.wall.deleteCommentConfirmation()).lightbox_me(
        {closeSelector: ".jive-modal-close, .close",
        onLoad: function() {
            $j('#we-comment-delete-submit-button').click(function(e) {
                var COMMENT_ENDPOINT = jive.rest.url("/comments") + "/" + commentID;
                $j.ajax({
                    type: "DELETE",
                    url: COMMENT_ENDPOINT,
                    success: function(data) {
                        // Remove the comment from the list of comments
                        $j('li#comment-' + commentID).hide();
                    },
                    error: function(data) {
                        jive.Wall.CommentHelper.helpers[formID].displayError(JSON.parse(data.responseText).error.message);
                    }
                });
                e.preventDefault();
            });
        }
    });
    return false;
};

jive.Wall.CommentHelper.getDataParams = function(commentID) {
    return {comment: {
        parentCommentID: -1,    // No parent comment
        body: jive.Wall.CommentHelper.helpers[commentID].getStatusInputVals(),
        name: $j("#comment-author").val(),
        email: $j("#comment-email").val(),
        URL: $j("#comment-url").val(),
        commentMode: $j("#comment-mode").val()
    }
    };
};
jive.Wall.CommentHelper.helpers = {};
jive.Wall.CommentHelper.initComment = function(statusID, options) {
    // hack to deal with static methods in wall_entry_comment_helper and wall_entry_repost_helper
    var meta = [
        {
            id: "j-wall-meta-image",
            view: jive.Wall.ImageMetaView,
            container: "jive-comment-content",
            service: jive.Wall.ImageMetaSource,
            viewType:jive.Wall.MetaView.TYPE_STATUS_COMMENT
        },
        {
            id: "j-wall-meta-video-link",
            view: jive.Wall.ImageMetaView,
            container: "jive-comment-content",
            service: jive.Wall.VideoLinkMetaSource,
            viewType:jive.Wall.MetaView.TYPE_STATUS_COMMENT
        }
    ];
    options.meta = meta;
    var container = $j('#wall-comments-' + statusID).find('li.comment-form');
    jive.Wall.CommentHelper.helpers[statusID] = new jive.Wall.CommentHelper($j
            .extend({statusInputIdPostfix:statusID, container:container}, options));
};

jive.conc.observable(jive.Wall.CommentHelper.prototype);
