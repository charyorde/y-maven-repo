/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('MicroBlogging');

/**
 * Controller for EAE activity Stream
 *
 * @class
 *
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/apps/microblogging/status_input_common_controller.js
 * @depends path=/resources/scripts/apps/microblogging/views/microblogging_comment_view.js
 * @depends template=jive.statusinput.mention_warnings.jsI18nHelper
 */
jive.MicroBlogging.CommentController = jive.MicroBlogging.CommonController.extend(function(protect, _super) {
    this.init = function (options) {
        _super.init.call(this, options);
        this.$guestUserName = options.viewOptions.$guestUserName;
        this.$guestUserEmail = options.viewOptions.$guestUserEmail;
        this.$guestUserURL = options.viewOptions.$guestUserURL;
        this.commentServiceOptions = {
            listAction: '',
            location: 'jive-comments',
            commentMode: 'comments',
            isPrintPreview: false
        };
    };

    protect.initMBView = function(){
        // setup microblogging view here
        this.microbloggingView = new jive.MicroBlogging.MicroBloggingCommentView(this.viewOptions);
    };

    protect.submitHandler = function(data, promise){
        data.name = '';
        data.email = '';
        var $nameField = this.$guestUserName,
            $emailField = this.$guestUserEmail,
            $urlField = this.$guestUserURL;
        if ($nameField.length && !$nameField.val()) {
            promise.emitError(jive.statusinput.mention_warnings.jsI18nHelper({key: 'cmnt.name_required.text'}), 500);
            return;
        }
        else if ($emailField.length && !$emailField.val()) {
            promise.emitError(jive.statusinput.mention_warnings.jsI18nHelper({key: 'cmnt.email_required.text'}), 500);
            return
        }
        // for un-authenticated comments
        if ($nameField.length) {
            data.name = $nameField.val();
            data.email = $emailField.val();
            data.url = $urlField.val();
        }
        this.commentServiceOptions.resourceID = data.ID;
        this.commentServiceOptions.resourceType = data.typeID;
        this.commentServiceOptions.contentObject = {document:data.ID,
                                                    version:data.version
                                                   };
        this.commentService = new jive.CommentApp.CommentSource(this.commentServiceOptions);
        var comment = new jive.CommentApp.Comment({body:data.body,
                                                   commentMode:'comments',
                                                   name:data.name,
                                                   email:data.email,
                                                   url:data.url}),
            self = this;

        this.commentService.save(comment).addCallback(function(data) {
            // render response
            promise.emitSuccess(data);
            self.emitP('submitSuccess', data);
        // Run a callback when an error occurs during
        // the server call.
        }).addErrback(function(message, status) {
            promise.emitError(message, status);
            self.emitP('submitError', message, status);
        });
    }

});
