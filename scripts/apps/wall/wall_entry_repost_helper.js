/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Wall');

/**
 * Used by microblogging Wall related pages for rendering the repost form and submitting status reposts.
 *
 * See status-list.ftl or view-single-entry.ftl under the microblogging directories for example usage.
 */

jive.Wall.RepostHelper = jive.Wall.Main.extend({
    init:function(options){
        this._super($j.extend({submitBtnID:'.j-repost-submit', focusOnRdy:true}, options));
        this._statusID = options.statusID;
        this.formWaitingView = new jive.shared.FormWaitingView($j('#jive-js-repost-modal').find('.jive-modal-content'));
    },
    getStatusInputVals:function(){
        return this._wallStatusInputs.getSubmitVals(this.statusInputID);
    },
    resetStatusInput:function(){
        this._wallStatusInputs.resetText(this.statusInputID);
    },
    _initWallSource:function(options){
        // don't associate a wall source with RepostHelper object, just use static post methods
    },
    _getEntry: function(callback) {
        // override this function to use static post method
        if (this._wallEntry != null) {
            callback(this._wallEntry);
        }
        else {
            var that = this;
            var createDraftCallback = function(entry) {
                that._wallEntry = entry;
                callback(that._wallEntry);
            };
            jive.Wall.RepostHelper.submitRepostDraft(this._statusID, createDraftCallback);
        }
    },
    _initEditorView:function(options){
        this._wallEditorView = new jive.Wall.EditorView(options.editorContainer,
                $j.extend({notificationContainer:$j(options.editorContainer)},options));
    },
    displaySuccessMsg:function(modal, entry, closeCallback){
        this._wallEditorView.entryPublishedRepost(modal, entry, closeCallback);
    },
    enableForm:function(){
        this.formWaitingView.enableForm();
    },
    disableForm:function(){
        this.formWaitingView.disableForm();
    }
});

/**
 * Binds the Repost anchors' click functions to show their associated forms.
 *
 * @depends template=jive.wall.statusInputActionContainer
 */
jive.Wall.RepostHelper.bindRepostAnchors = function (options) {
    $j('a.j-repost').live('click', function () {
        /*
         *  lightbox_me appends the element to the DOM.  To ensure that we don't have multiple ids in the DOM, remove the
         *  original modal elements from the DOM and put them back after the modal has been closed and destroyed.
         */
        var $repostItem = $j(this).closest('li.j-repost-item'),
            $modal = $repostItem.find('.j-repost-modal').remove().find('script').remove().end(),
            $original = $j('<div/>').append($modal).html(),
            statusID = $repostItem.attr('data-statusid'),
            mbCreationModerated = $repostItem.attr('mb-creation-moderated');
            
        $modal.attr('id', 'jive-js-repost-modal');

        $modal.lightbox_me({destroyOnClose: true, centered: true,
            onLoad:function(){
                jive.Wall.RepostHelper.initRepost(statusID);
                jive.bindLightboxMedia();
            },

            onClose: $repostItem.append.bind($repostItem, $original)
        });

        // Populate form
        if ($repostItem.find(".repost-form").length < 1 ) {
            $modal.find('div#j-repost-form-placeholder-' + statusID).append(
                jive.wall.repostForm({
                    statusID: statusID,
                    canCreateImage: options.canCreateImage,
                    i18n: options.i18n,
                    canAtMention: !jive.rte.mobileUI,
                    mbCreationModerated: mbCreationModerated == "true"
                })
            );
        }



        return false;   // prevents browser from going to anchor's target (top of page)
    });
};

/**
 * Posts the shared status to the REST web service
 */
jive.Wall.RepostHelper.submitRepost = function (statusID) {
    jive.Wall.RepostHelper.helpers[statusID].disableForm();
    if(jive.Wall.RepostHelper.helpers[statusID].wallentry){
        // draft has all ready been created just publish the draft
        jive.Wall.RepostHelper.submitRepostCommon(statusID, jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST_DRAFT_PUB);
    } else {
        jive.Wall.RepostHelper.submitRepostCommon(statusID, jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST);
    }

    return false;
};

/**
 * Posts the shared status to the REST web service
 */
jive.Wall.RepostHelper.submitRepostDraft = function (statusID, callback) {
    jive.Wall.RepostHelper.submitRepostCommon(statusID, jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST_DRAFT, callback);

    return false;
};

jive.Wall.RepostHelper.submitRepostCommon = function (statusID, type, callback) {
    var SERVICE_ENDPOINT = jive.rest.url("/wall"),
        REPOST_ENDPOINT = SERVICE_ENDPOINT + "/repost/" + statusID;
    var wallentry = jive.Wall.RepostHelper.helpers[statusID].wallentry;
    var data;

    if (type == jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST_DRAFT_PUB){
        REPOST_ENDPOINT = SERVICE_ENDPOINT + "/" + wallentry.containerType + "/" + wallentry.containerID;
        wallentry.message = jive.Wall.RepostHelper.getDataUtil(statusID);
        data = JSON.stringify({wallentry: wallentry});
    } else {
        data = jive.Wall.RepostHelper.getDataUtil(statusID); 
        if (type == jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST_DRAFT){
            REPOST_ENDPOINT += "/draft";
        }
    }
    $j.ajax({
        type: "POST",
        url: REPOST_ENDPOINT,
        dataType:"json",
        data: data,
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            if(type == jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST_DRAFT){
                // store data for later
                jive.Wall.RepostHelper.helpers[statusID].wallentry = data.wallentry;
                callback(data.wallentry);
            } else {
                jive.Wall.RepostHelper.helpers[statusID].enableForm();
                // remove body from from returned data
                if(data.wallentry.message){
                    data.wallentry.message = data.wallentry.message.replace(/<\/?body>/gi, "");
                }
                // normalize properties data
                data.wallentry = jive.Wall.VideoLinkMetaSource.normalizeData(data.wallentry);
                // Grab reference to modal so that we can close the light box on dismiss
                var $modal = $j('#jive-js-repost-modal');

                // Signal success to user
                jive.Wall.RepostHelper.helpers[statusID].displaySuccessMsg($modal, data.wallentry, function(){$modal.trigger('close');});
            }
        },
        error: function(data) {
            jive.Wall.RepostHelper.helpers[statusID].enableForm();

            try{
                var response = JSON.parse(data.responseText);
                jive.Wall.RepostHelper.helpers[statusID].displayError(response.error.message);
            } catch(e){
                jive.Wall.RepostHelper.helpers[statusID].displayError();
            }
        }
    });
};

jive.Wall.RepostHelper.getDataUtil = function(statusID){
    return jive.Wall.RepostHelper.helpers[statusID].getStatusInputVals();
};
jive.Wall.RepostHelper.helpers = {};
jive.Wall.RepostHelper.initRepost = function(statusID, options){
    // hack to deal with static methods in wall_entry_comment_helper and wall_entry_repost_helper
    var meta = [
            {
                id: "j-wall-meta-link",
                view: jive.Wall.LinkMetaView,
                container: "j-wall-meta-link-container",
                service: jive.Wall.LinkMetaSource
            },
            {
                id: "j-wall-meta-image",
                view: jive.Wall.ImageMetaView,
                container: "j-wall-meta-image-container",
                service: jive.Wall.ImageMetaSource,
                viewType:jive.Wall.MetaView.TYPE_STATUS_COMMENT
            },
            {
                id: "j-wall-meta-video-link",
                view: jive.Wall.ImageMetaView,
                container: "j-wall-meta-video-container",
                service: jive.Wall.VideoLinkMetaSource,
                viewType:jive.Wall.MetaView.TYPE_STATUS_COMMENT
            }];
    if (!options) {
        options = [];
    }
    options.meta = meta;

    jive.Wall.RepostHelper.helpers[statusID] = new jive.Wall.RepostHelper($j.extend({
        editorContainer:'#jive-js-repost-modal',
        domContainerId:'jive-js-repost-modal',
        statusInputIdPostfix:jive.Wall.RepostHelper.INPUT_PREFIX + statusID,
        statusID:statusID}, options));
};

jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST = 1;
jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST_DRAFT = 2;
jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST_DRAFT_PUB = 3;

jive.Wall.RepostHelper.INPUT_PREFIX = 's-r-input-';
