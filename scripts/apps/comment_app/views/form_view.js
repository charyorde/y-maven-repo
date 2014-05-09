/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.CommentApp.FormView
 *
 * Handles rendering comment post forms and handles RTE setup and teardown.
 * Create an instance of this class with a DOM element container as an argument
 * to render a form.  Call the `remove` method to get rid of the form.
 *
 * @depends path=/resources/scripts/apps/content/draft/main.js
 * @depends template=jive.DiscussionApp.soy.replyErrorMessage
 */

/*jslint undef:true browser:true laxbreak:true */
/*global jive $j $Class tinymce jiveControl _jive_base_url WikiTextConverter DWRTimeout */

jive.namespace('CommentApp');

jive.CommentApp.FormView = jive.oo.Class.extend(function(protect, _super){

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    this.init = function(container, options) {
        this._parentCommentID = options.parentCommentID;
        this._commentMode     = options.commentMode;
        if(!this._postBlock) this._postBlock       = $j("#jive-comment-post-block");
        this._itemAuthorID    = "comment-author";
        this._itemBodyID      = "commentBody";
        this._itemEmailID     = "comment-email";
        this._itemURLID       = "comment-url";
        this._container       = $j(container);
        this._initFormWaitingView(options.i18n);
        this.rteView = null;

        this.options = options;

        this._render();
    };

    /* ** public methods ** */

    /**
     * getParentCommentID()
     *
     * Returns the parent comment or message id
     */
    this.getParentCommentID = function(){
        return this._parentCommentID;
    };


    /* ** protected methods ** */

    //noinspection JSUnusedLocalSymbols
    protect._initFormWaitingView = function(i18n){
        this._formWaitingView = new jive.shared.FormWaitingView(this._container.parents('.jive-js-addReply'),
            {containerPadding:0});
    };

    protect.focus = function() {
        if (this._isAnonymous) {
            $j("#" + this._itemAuthorID).focus();
        } else {
            _super.focus.call(this);
        }
    };

    protect._getValues = function() {
        return {
            body: this.rteView.getHTML(),
            mobileEditor :this.rteView.isMobileOnly(),
            name: $j("#" + this._itemAuthorID).val(),
            email: $j("#" + this._itemEmailID).val(),
            url: $j("#" + this._itemURLID).val(),
            parentCommentID: this._parentCommentID,
            commentMode: this._commentMode
        };
    };

    protect._postHandler = function() {
        var that = this;
        if (that._validateComment()){

            that._formWaitingView.disableForm();

            that.emitP('post', that._getValues()).addCallback(function() {
                that._formWaitingView.enableForm();
            }).addErrback(function() {
                that._formWaitingView.enableForm();
            });
        }

        return false;
    };

     protect._validateComment = function(){
        var formVals = this._getValues();
        if (this.options.isAnonymous && $def(formVals.name) && $j.trim(formVals.name) === ""){
            $j('<p/>', { text: jive.DiscussionApp.soy.replyErrorMessage({key:'forum.thrd.name_required.text'})}).message({ style: 'error' });
            return false;
        } else if (this.options.isAnonymous && $def(formVals.email) && $j.trim(formVals.email) === ""){
            $j('<p/>', { text: jive.DiscussionApp.soy.replyErrorMessage({key:'forum.thrd.email_required.text'})}).message({ style: 'error' });
            return false;
        } else if ($j.trim(formVals.body) === ""){
            $j('<p/>', { text: jive.DiscussionApp.soy.replyErrorMessage({key:'post.err.pls_enter_body.text'})}).message({ style: 'error' });
            return false;
        } else {
            return true;
        }
    };

    protect._initFormControls = function($container, $id){};

    protect._isEdit = function(){
        return false;
    };

    protect._render = function() {
        var template = this._template();

        var id = "wysiwyg_id_" + jive.CommentApp.FormView.id;
        jive.CommentApp.FormView.id++;

        template.find("textarea").attr('id', id);
        this._container.append(template);

        this._initFormControls(this._container, id);

        var that = this;

        var entitlementService = new jive.rte.EntitlementService({
            objectID: that.options.resourceID,
            objectType: that.options.resourceType,
            entitlement: "VIEW"
        });

        var imageService = new jive.rte.ImageService({
            objectId: -1,
            objectType: -1,
            containerId: that.options.containerID,
            containerType: that.options.containerType
        });

        var form = $j("#" + id).closest("form");

        var formService = new jive.rte.FormService({
            $form: form,
            formSubmitHandler: function() {
                return that._postHandler();
            }
        });

        var rteOptions = $j.extend({
            $element      : $j("#" + id),
            isEditing     : this._isEdit,
            onReady       : function(){
                if(that.options.rteOptions.onReady){
                    that.options.rteOptions.onReady();
                }
                jive.conc.nextTick(function(){
                    that.rteView.focus();
                });

                if (!that.options.isAnonymous) {
                    var autosaveOptions = {
                        selector: form,
                        objectType: 105, //comment
                        draftObjectType: that.options.resourceType,
                        draftObjectID: that.options.resourceID,
                        editorId: id,
                        pushStateEnabled: false
                    };

                    new jive.draft.Main(autosaveOptions);
                }
            },
            services: {
                imageService: imageService,
                formService: formService,
                entitlementService: entitlementService
            }
        }, this.options.rteOptions);

        this.rteView = new jive.rte.RTEWrap(rteOptions);

        // Listen to click events on form buttons.
        this._container.find("form")
        .find('[name=cancel]').click(function() {
            that.emit('cancel', that._getValues());
            return false;
        });

    };

    protect._template = function() {
        return $j('<div></div>').html(
            this._postBlock.html()
        );
    };

    /**
     * remove()
     *
     * Removes the form from the DOM and tears down the RTE, if appropriate.
     */
    this.remove = function() {
        var id = this.rteView.getID();
        if(this.rteView) {
            this.rteView.killYourself();
            this.rteView.destroy();  // Tear down the RTE.
        }
        window.editor.clear(id);  // Remove reference to RTE from window.editor hash.
        jive.rte.multiRTE = jive.rte.multiRTE.filter(function(e) {
            return e != id;
        });
        // JIVE-2360: using this instead of jQuery.remove() to resolve this ticket, and also for performance reasons
        this._container.find('form').parent().html('');
        $j(window).unbind("unload", this._unloadCallback);
        this.emit('remove');
    }
});

jive.CommentApp.FormView.id = 0;
