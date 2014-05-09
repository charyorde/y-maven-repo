/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/**
 * jive.CommentApp.EditFormView
 *
 * This is a subclass of jive.CommentApp.FormView.  It renders comment edit
 * forms instead of comment post forms.  This class requires that an `id`
 * option be passed into the constructor options object.  Otherwise usage and
 * interfaces are the same as jive.CommentApp.FormView.
 */

/*extern jive $j tinymce jiveControl setPreferredEditorMode getEditorMode refreshLinks */
/*globals preferredMode currentMode */

jive.namespace('CommentApp');

jive.CommentApp.EditFormView = jive.CommentApp.FormView.extend(function(protect, _super){
    this.init = function(container, options) {
        this._id    = options.id;  // SBS system id for the given comment
        this._postBlock       = $j("#jive-comment-edit-block");
        _super.init.call(this, container, options);
    };

    protect._initFormWaitingView = function(i18n){
        this._formWaitingView = new jive.shared.FormWaitingView($j(this._container).parents('.jive-comment-content'),
            {containerPadding:0});
    };

    protect._initFormControls = function($container, $id){
        var body = $container.find('.jive-comment-rte-source').val();
        var commentName  =  $container.find('[name=commentGuestName]').val();
        var commentEmail = $container.find('[name=commentGuestEmail]').val();
        var commentURL   = $container.find('[name=commentGuestUrl]').val();

        if(commentName || commentEmail || commentURL){
            $container.find('.jive-comment-rte-source').val();
            $container.find('.jive-comment-post-anonymous [name=name]').val(commentName);
            $container.find('.jive-comment-post-anonymous [name=email]').val(commentEmail);
            $container.find('.jive-comment-post-anonymous [name=url]').val(commentURL);
            $container.find(".jive-comment-post-anonymous").show();
        }else{
            $container.find(".jive-comment-post-anonymous").hide();
        }

        $j('#' + $id).val(body);
    };

    protect._isEdit = function(){
        return true;
    };

    protect._getValues = function() {
        return {
            body:  this.rteView.getHTML(),
            mobileEditor :this.rteView.isMobileOnly(),
            name:  this._container.find('[name=name]').val(),
            email: this._container.find('[name=email]').val(),
            url:   this._container.find('[name=url]').val(),
            id:    this._id
        };
    };
});
