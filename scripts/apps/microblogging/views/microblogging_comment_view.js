/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/**
 * General view for status input box, makes use of microblogging status input component
 *
 * @depends path=/resources/scripts/apps/microblogging/views/status_input_common_view.js
 * @depends path=/resources/scripts/jive/rte/EntitlementService.js
 * @depends template=jive.statusinput.mention_warnings.jsI18nHelper
 * @depends i18nKeys=tinymce.jivemention.no_notification
 * @depends i18nKeys=tinymce.jivemention.secret_group
 * @depends i18nKeys=tinymce.jivemention.restricted_conten
 */

jive.namespace('MicroBlogging');

jive.MicroBlogging.MicroBloggingCommentView = jive.MicroBlogging.CommonView.extend(function(protect, _super) {
    this.init = function (options) {
        options.allowTagCreation = false;
        _super.init.call(this, options);
        this.options = options;
        this.supportAttachements = false;
        this.viewingUserData = options.viewingUserData;
    };

    this.postRender = function(){
        _super.postRender.call(this);
        // TODO shouldn't have to do this, but until we get the dynamic soy templates working correctly, adding this fix
        this.$formElem.closest('article').find('div.eae-reply-avatar').html(
            jive.shared.displayutil.avatar($j.extend(this.viewingUserData, {
                                   size: 32,
                                   useLinks: true,
                                   showHover: true})));
    };
    
    protect.getSoyTemplate = function(data){
        return jive.statusinput.containers.microbloggingCommentStatusInput(data);
    };

    this.createWaitingViewElem = function(){
        this.$waitingViewElem = this.getContent();
    };

    this.createFormElem = function(){
        this.$formElem = this.getContent().find('form');
    };

    this.renderResponse = function(data){
        _super.renderResponse.call(this, data);
        this.resetStatusInput();
    };

    this.getDataFromDom = function(){
        var bodyData = this.normalizeData();
        return {body:'<body>' + bodyData + '</body>',
            ID:this.$formElem.find('input:[name=contentID]').val(),
            typeID:this.$formElem.find('input:[name=typeID]').val()};
    };

    this.handleAtMentionResult = function (id, name) {
        var that = this;
        if (id && id.split("-").length == 2) {
            var mentionObjectType = id.split("-")[0],
                mentionObjectID = id.split("-")[1];

            var entitlementService = new jive.rte.EntitlementService({
                objectID: this.options.entitlementObjectID || 0,
                objectType: this.options.entitlementObjectType || 0,
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
    };
});
