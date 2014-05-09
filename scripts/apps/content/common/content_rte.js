/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('content.common');

/**
 * @depends path=/resources/scripts/jquery/jquery.oo.js
 * @depends path=/resources/scripts/jive/rte/rte_wrap.js
 * @depends path=/resources/scripts/apps/content/draft/main.js
 * @depends dwr=JiveSpellChecker
 *
 * @depends i18nKeys=rte.toggle_display
 * @depends i18nKeys=post.alwaysUseThisEditor.tab
 * @depends i18nKeys=rte.edit.disabled
 * @depends i18nKeys=rte.edit.disabled.desc
 */
ContentRTE = $Class.extend({

    init: function(options) {
        var $ = jQuery;
        this.options = $.extend({
            autoSave: {
            },
            rteOptions: {}
        }, options);
        this.options.autoSave.properties = $.merge(['publishBar'], this.options.autoSave.properties || {});
        this.options.rteOptions = $.extend({
            preset: 'thread'
        }, this.options.rteOptions);
        options = this.options;

        var bean = this.options.actionBean; // com.jivesoftware.community.content.action.beans.BaseContentActionBean
        var editorId = 'wysiwygtext';
        var body = $('#' + editorId);
        var form = body.closest("form");
        var containerType = (bean.containerContextBean) ? bean.containerContextBean.container.objectType : -1;
        var containerID = (bean.containerContextBean) ? bean.containerContextBean.container.objectID : 0;
        var videoPickerURL = bean.videoPickerURL;

        var rteServices = {
            entitlementService: new jive.rte.EntitlementService({
                objectType: containerType,
                objectID: containerID,
                entitlement: "VIEW"
            }),
            formService: new jive.rte.FormService({
                $form: form
            })
        };

        rteServices.attachmentService = new jive.rte.FormAttachmentService({
            container: form,
            name: 'attachFile',
            attachments: bean.attachments,
            $form: form,
            maxSize: bean.attachmentConfigActionBean.maxAttachmentSize,
            maxFiles: bean.attachmentConfigActionBean.maxAttachments,
            allowByDefault: bean.attachmentConfigActionBean.allowByDefault,
            attachmentExtensions: bean.attachmentConfigActionBean.attachmentExtensions,
            hasAttachPerms: bean.hasAttachPerms
        });

        if(bean.contentType == 1) {
            var contentType = 2;
            var contentId = (bean.rootMessageID ? bean.rootMessageID : -1);
        }

        rteServices.imageService = new jive.rte.ImageService({
            objectId: (contentId ? contentId : bean.objectID) || -1,
            objectType: (contentType ? contentType : bean.contentType) || -1,
            containerType: containerType,
            containerId: containerID
        });

        window._jive_video_picker__url = videoPickerURL;

        var rteOptions = $.extend({
            $element: body,
            preferredMode: bean.preferredMode,
            toggleText: jive.i18n.getMsg('rte.toggle_display'),
            alwaysUseTabText: jive.i18n.getMsg('post.alwaysUseThisEditor.tab'),
            images_enabled: bean.hasImagePerms,
            services: rteServices,
            //Needed for iOS older than 5.0
            mobileUI: bean.mobileUI,
            isEditing: !bean.create,
            communityName: bean.communityName,
            editDisabledText: jive.i18n.getMsg('rte.edit.disabled'),
            editDisabledSummary: jive.i18n.getMsg('rte.edit.disabled.desc')
        }, this.options.rteOptions);

        var autosave;

        /*
         * We need to register our form submit handler immediately (as opposed to on RTE onReady) in order to prevent
         * a race condition where a different submit handler gets the RTE content before the call to save().
         */
        var saveEditor = function(e) {
            var value = window.editor.get(editorId).getHTML();
            body.val(value);

            /*
             * The purpose of the pause is to make sure that after the user has attempted a submit, draft saves arent
             * attempted.  There are a couple of acceptable caveats regarding this.  If the client side validation fails
             * (empty field for example), autosave will be paused.  This is acceptable because they will be posting the
             * content right after they fix it.  For all content types, this is usually just an empty field.
             */
            if (!bean.guest) {
                autosave.pause();
            }
        };
        form.submit(saveEditor);

        rteOptions.onReady = function() {
            if (!bean.guest) {
                var autosaveOptions = {
                    selector: form,
                    objectType: bean.contentType,
                    //specifying the container will be default for create pages
                    draftObjectType: containerType,
                    draftObjectID: containerID,
                    editorId: editorId,
                    subject: 'subject'
                };

                //if the object id is present, that means this is an edit page. draft type and id will be the actual content object
                if (bean.objectID) {
                    autosaveOptions.draftObjectType = bean.contentType;
                    autosaveOptions.draftObjectID = bean.objectID;
                }

                autosave = new jive.draft.Main($.extend(autosaveOptions, options.autoSave));
            }
        };

        this.rte = new jive.rte.RTEWrap(rteOptions);
    },

    focusOnGUIEditor: function(callEvent) {
        var keycode = callEvent.keyCode;
        if (keycode == 9 && !callEvent.shiftKey) { // tab
            this.rte.focus();
            return false;
        }
    }
});



