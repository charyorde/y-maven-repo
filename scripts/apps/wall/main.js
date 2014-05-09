/*jslint browser:true */
/*extern jive $j */

/**
 * @depends i18nKeys=we.form.posted.*
 */
jive.namespace('Wall');

/**
 * Make sure we only include this file once per page load.  If we do not have this block here there are 2 cases where
 * this script could be loaded multiple times:
 * 1) When resource combined is false behavior could be different from when it's on, ideally the behavior should be the same.
 * 2)  If an ajax request is made for an ftl with javascript includes the file will be reloaded (assuming it was already
 * loaded on page load)
 *
 * At a later date we can roll this work into namespace or a new function that is similar to namespace
 */
if(!jive.Wall.Main){

jive.Wall.Main = $Class.extend({
    init:function(options){
        var that = this;

        this._meta = options.meta || [];
        this.statusInputID = 'message-' + options.statusInputIdPostfix;
        this._statusInputIdPostfix = options.statusInputIdPostfix;
        this._submitBtnID = options.submitBtnID || '.j-submit-mb';
        this._initEditorView(options);
        this._initStatusInput(options);
        this._initWallSource(options);

        // Set up handlers after StatusInput instance is fully initialized.
        this._wallStatusInputs.addListener('ready', function() {
            that._setupStatusInputObservableHandlers();
            that._setupEditorViewObservableHandlers();
            that._setupMetaBtns(options);

            that._wireUpAtMentionBtn(options);
            // The wall entry object currently being manipulated by the user in the editor. Until the user has either attached
            // something or started to type something that necessitates a draft to be created this will be null.
            that._wallEntry = null;
            var metaViews = [];

            that._meta.forEach(function(metaItem) {
                that.initMeta(metaItem, metaViews, options, that._wallEditorView.getContainer(), function(callback) {
                    that._getEntry(callback);
                });
            });
            that._wallStatusInputs.getStatusInput(that.statusInputID).triggerOnFocusAnimation();
        });
    },
    displayInfo:function(msg){
      this._wallEditorView.entryPublishedInfo(msg);
    },
    displayWarn:function(msg){
      this._wallEditorView.entryPublishedWarn(msg);
    },
    displayError:function(msg){
      this._wallEditorView.entryPublishedError(msg);
    },
    _initEditorView:function(options){
        this._wallEditorView = new jive.Wall.EditorView(options.editorContainer,
                $j.extend({notificationContainer:$j(options.editorContainer).parent()},options));
    },
    _setupEditorViewObservableHandlers:function(){
        var that = this;
        // temporary until we get a wall view
        var publishCallback = function(entry) {
            that._wallEditorView.enableForm();
            if (entry.status == "AWAITING_MODERATION") {
                that.displayWarn(jive.i18n.getMsg('we.form.posted.moderation'));
            } else {
                that._wallEditorView.entryPublished(entry);
            }
            that._wallStatusInputs.resetText(that.statusInputID);
            that.emit('reset');
            that._wallEntry = null;
        };

        var publishErrorCallback = function(response){
            that._wallEditorView.enableForm();
            that.displayError(response);
        };

        this._wallEditorView.addListener("submit", function() {
            var values = {message:that._wallStatusInputs.getSubmitVals(that.statusInputID)};
            if (that._wallEntry) {
                $j.extend(true, that._wallEntry, values);
            }
            else {
                that._wallEntry = values;
            }
            that._wallSource.publish(that._wallEntry, publishCallback, publishErrorCallback);
        });
    },
    _initStatusInput:function(options){
        this._wallStatusInputs = new jive.MicroBlogging.StatusInputs(
            '#statusInputs-' + options.statusInputIdPostfix,
            {idPostfix:options.statusInputIdPostfix,
                focusOnRdy: options.focusOnRdy,
                mobileUI: options.mobileUI,
                maxCharCount: options.maxCharCount});
    },
    _setupStatusInputObservableHandlers:function(){
        var that = this;
        this._wallStatusInputs.getStatusInput(this.statusInputID).addListener('imageURLMatch', function(url){
                that.emit('imageURLMatch', url);
            }).addListener('youtubeURLMatch', function(url){
                that.emit('youtubeURLMatch', url);
            }).addListener('linkURLMatch', function(url){
                that.emit('linkURLMatch', url,
                    function(meta) {
                        that._wallStatusInputs.getStatusInput(that.statusInputID).swapLinkFor(url,meta);
                    });
            }).addListener('characterLenMsg', function(action, params){
                that._wallEditorView.handleCharacterLenMsg(action, params);
            }).addListener('dataError', function(response){
                that.displayError();
            });

        var $attachContainer = this._wallEditorView.getContainer().find(".j-attach-action-container");
        var $submitmessage = this._wallEditorView.getContainer().find(this._submitBtnID);
        this._wallStatusInputs.getStatusInput(this.statusInputID).addListener('focus', function(){
            // $submitmessage may always be visible, $attachContainer is guaranteed to be hidden 
            if($attachContainer.is(":hidden")){
                $submitmessage.css({opacity: 0})
                        .show()
                        .animate({opacity: 1});
                if (($j.browser.msie && $j.browser.version < 7)) {
                    $attachContainer.show();
                } else {
                    $attachContainer.css({opacity: 0, height:1})
                        .show()
                        .animate({ height: '24px'}, 200, 'linear', function() {
                            $j(this).animate({opacity: 1}, 300, 'linear');
                            $j(this).css('height', 'auto');
                        });
                }

                $attachContainer.parent('.j-wall-form').next('.j-mb-last-update').addClass('.j-mb-last-update-active');
            }
        });
    },
    _setupMetaBtns:function(options){
        var $container = $j('#' + options.domContainerId);
    },
    _initWallSource:function(options){
        this._wallSource = new jive.Wall.WallSource(options);
    },
    _wireUpAtMentionBtn:function(options){
        // no need to create a separate view class for the at mentions button
        // just wire up the click handler here
        var that = this;
        $j('#' + options.domContainerId).find('a.jive-js-mention-button').click(function(e){
            that._wallStatusInputs.getStatusInput(that.statusInputID).handleAtMentionButtonClick();
            e.stopPropagation();
        });
    },
    /**
     * Some actions require a draft in order to be able to occur, for instance adding MetaContent. This function takes
     * a callback and passes the draft to it when it has been created.
     *
     * @param callback the callback which will be called with one parameter, the created draft, after it has been
     * created.
     */
    _getEntry: function(callback) {
        // objectType and objectId will be set if we have a draft
        if (this._wallEntry != null && this._wallEntry.objectType && this._wallEntry.objectId) {
            callback(this._wallEntry);
        }
        else {
            var that = this;
            var createDraftCallback = function(entry) {
                that._wallEntry = entry;
                callback(that._wallEntry);
            };
            this._wallSource.createDraft(createDraftCallback);
        }
    }
});


// declare initMeta here so that it can be mixed into other classes, most notably jive.Wall.CommentHelper
/**
 * Initializes the views for editing meta information for a wall entry. Listeners are added for when the views are
 * activated, deactivated and completed by the user.
 *
 * @param meta the MetaContentView being initialized
 */
jive.Wall.Main.prototype.initMeta = function initMeta(meta, metaViews, options, $editorContainer, getEntry) {
    var metaView = new meta.view(meta.id, meta.container, $editorContainer, options, meta.viewType);
    var metaSource = new meta.service(options);
    metaViews.push(metaView);
    var isVideoMetaView = metaSource instanceof jive.Wall.VideoLinkMetaSource;
    var isImageMetaView = metaView instanceof jive.Wall.ImageMetaView && !isVideoMetaView;
    var isLinkMetaView = metaSource instanceof jive.Wall.LinkMetaSource;
    var that = this;

    if (typeof this.notificationView == 'undefined') {
        this.notificationView = new jive.shared.NotificationView($editorContainer, {info:'.jive-info-box:first',
            warn:'.jive-warn-box:first',
            error:'.jive-error-box:first'});
    }

    if (isLinkMetaView) {
        this.addListener('linkURLMatch', function(url, metaCreatedCallback) {
            metaSource.create(meta, url, metaCreatedCallback);
        });
    } else if(isImageMetaView){
        this.addListener('imageURLMatch', function(url){
            // handle image add from url case
            var data = metaView.getDataForURLImage(url);
            var metaErrorCallback = function(data, statusText, errorThrown){
                metaView.error(data, statusText, errorThrown);
            };
            var metaCreatedCallback = function(meta) {
                metaView.add(meta, url);
            };
            var entryCallback = function(entry) {
                metaSource.create(entry, data, metaCreatedCallback, metaErrorCallback, true);
            };
            metaView.add([]);
            // the user has completed adding their MetaContent we need to retrieve a draft in order to attach it.
            metaView.formSubmitted();
            getEntry(entryCallback);
        }).addListener('reset', function(){
            metaView.reset();
        });
    } else if(isVideoMetaView){
        this.addListener('youtubeURLMatch', function(url){
            // handle youtube url case
            var data = {videoURL:url};
            var metaErrorCallback = function(data, statusText, errorThrown){
                metaView.error(data, statusText, errorThrown);
            };
            var metaCreatedCallback = function(meta) {
                metaView.add(meta, url);
            };
            var entryCallback = function(entry) {
                metaSource.create(entry, data, metaCreatedCallback, metaErrorCallback, true);
            };
            // the user has completed adding their MetaContent we need to retrieve a draft in order to attach it.
            metaView.formSubmitted()
            getEntry(entryCallback);
        });

    }
    
    metaView.addListener('removeImage', function(id){
        metaSource.remove(id);
        metaView.remove(id);
    });

    metaView.addListener('activated', function() {
        for (var i = 0; i < metaViews.length; i++) {
            if (metaViews[i] !== metaView) {
                metaViews[i].hide();
            }
        }
        metaView.show();
    }).addListener('deactivated', function() {
        metaView.hide();
    });

    metaView.addListener('error', function(message) {
        that.notificationView.error(message);
    }).addListener('warn', function(message) {
        that.notificationView.warn(message);
    }).addListener('info', function(message) {
        that.notificationView.info(message);
    });

    if(!isVideoMetaView){
        metaView.addListener('completed', function(data) {
            var metaFailedCallback = function(data, statusText, errorThrown) {
                metaView.error(data, statusText, errorThrown);
            };
            // called when image uploads succesfully
            var metaCreatedCallback = function(meta) {
                metaView.add(meta);
            };
            var entryCallback = function(entry) {
                metaSource.create(entry, data, metaCreatedCallback, metaFailedCallback);
            };
            // the user has completed adding their MetaContent we need to retrieve a draft in order to attach it.
            metaView.formSubmitted()
            getEntry(entryCallback);
        });
    }
};

// Mixes in `addListener` and `emit` methods so that other classes can
// listen to events from this one.
jive.conc.observable(jive.Wall.Main.prototype);

// attachments types
jive.Wall.Main.ATTACHMENT_TYPE_IMAGE = '111';
// video is really type ExternalURL
jive.Wall.Main.ATTACHMENT_TYPE_VIDEO = '801';
// comment type
jive.Wall.Main.COMMENT_TYPE = '105';
// document type
jive.Wall.Main.DOCUMENT_TYPE = '102';

// placing static methods here for now, should refactor this at a later date
// This is called when the form is submitted. Binds to all the comments for the slide down effect when clicked.
jive.Wall.Main.bindComments = function(wallEntryTypeID, options) {
    var guardKey = wallEntryTypeID + options.canComment + options.canCreateImage;

    // This property check prevents handlers from being bound redundantly if
    // this method is called more than once with the same arguments.
    if (!arguments.callee[guardKey]) {
        /* show comments action */
        $j(".j-view-comments:not(.j-disabled)").live("click",function() {
            var $commentWrapper = $j(this).closest('td').find('.j-inline-comment-wrapper');
            var sID = $commentWrapper.find('.jive-comment-container').attr('data-statusid');

            if ($commentWrapper.find(".comment-form").length < 1 ) {
                $commentWrapper.find('ul').append(
                    jive.wall.commentForm({
                        statusID: sID,
                        user: _jive_current_user,
                        canComment: options.canComment,
                        canCreateImage: options.canCreateImage,
                        canAtMention: !jive.rte.mobileUI
                    })
                );
                jive.Wall.CommentHelper.initComment(sID, {wallEntryTypeID:wallEntryTypeID});
            }
            if (($j.browser.msie && $j.browser.version < 7)) {
                $commentWrapper.show();
            } else {
                $commentWrapper.slideToggle(300);                
            }

            return false;
        });

        arguments.callee[guardKey] = true;
    }
};

jive.Wall.Main.bindRepostAndComments = function(wallEntryTypeID, url){
    // This property check prevents handlers from being bound redundantly if
    // this method is called more than once with the same arguments.
    if (!arguments.callee[wallEntryTypeID + url]) {
        $j('.js-mb-comment-form').live("submit", function(event) {
            jive.Wall.CommentHelper.submitComment(this, wallEntryTypeID, url);
            event.preventDefault();
        });
        $j('.j-comment-delete').live("click", function(event) {
            jive.Wall.CommentHelper.destroyComment($j(this).attr('commentid'));
            event.preventDefault();
        });

        $j('.j-repost-submit, .js-mb-repost-form').live("click submit", function(event) {
            jive.Wall.RepostHelper.submitRepost($j(this).data('status-id') || $j(this).attr('data-statusid'));
            event.preventDefault();
        });

        arguments.callee[wallEntryTypeID + url] = true;
    }
};

jive.Wall.Main.bindRowHover = function(){
    // The `alreadyCalled` property check prevents handlers from being bound
    // redundantly if this method is called more than once.
    if (!arguments.callee.alreadyCalled) {
        // handle hover over row
        $j('.jive-table-activity tr').live('mouseenter', function() {
            $j(this).find('.jive-activity-action a').removeClass('font-color-meta-light');
            $j(this).find('.jive-activity-action .jive-icon-comment-grey').removeClass('jive-icon-comment-grey').addClass('jive-icon-comment');
            $j(this).find('.jive-icon-like-grey').removeClass('jive-icon-like-grey').addClass('jive-icon-like');
            $j(this).find('.jive-icon-permalink').removeClass('jive-icon-permalink').addClass('jive-icon-permalink-active');
        }).live('mouseleave', function() {
            $j(this).find('.jive-activity-action a').addClass('font-color-meta-light');
            $j(this).find('.jive-activity-action .jive-icon-comment').removeClass('jive-icon-comment').addClass('jive-icon-comment-grey');
            $j(this).find('.jive-icon-like').removeClass('jive-icon-like').addClass('jive-icon-like-grey');
            $j(this).find('.jive-icon-permalink-active').removeClass('jive-icon-permalink-active').addClass('jive-icon-permalink');
        });
        $j('.jive-icon-permalink, .jive-icon-permalink-active').live('mouseenter', function() {
            $j(this).addClass('jive-icon-permalink-hover');
        }).live('mouseleave', function() {
            $j(this).removeClass('jive-icon-permalink-hover');
        });

        arguments.callee.alreadyCalled = true;
    }
};
    
}
