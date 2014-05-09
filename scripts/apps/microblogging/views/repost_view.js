/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * EAE comment status input box container, makes use of microblogging status input component
 *
 * @depends path=/resources/scripts/apps/microblogging/views/status_input_common_view.js
 * @depends template=jive.statusinput.mention_warnings.jsI18nHelper
 */

jive.namespace('MicroBlogging');

jive.MicroBlogging.RepostView = jive.MicroBlogging.CommonView.extend(function(protect, _super) {
    this.init = function (options) {
        this.options = options;
        _super.init.call(this, options);
        this.myId =  0;
    };

    protect.getSoyTemplate = function(data){
        return jive.statusinput.containers.repostStatusInput(data);
    };

    this.createWaitingViewElem = function(){
        this.$waitingViewElem = this.getContent();
    };

    this.createFormElem = function(){
        var content = this.getContent();
        this.$formElem = content.find('form');
        this.$imageFormElem = content.find('div.j-meta-image-container form');
    };

    this.getDataFromDom = function(){
        var messageData = this.normalizeData();
        return {"wallentry":{"message":messageData},
            "wallEntryID":this.$formElem.find('input:[name=contentID]').val()};
    };

    this.renderResponse = function(data){
        _super.renderResponse.call(this, data);
        this.renderResponseCommon(data);
    };

    this.getDraftData = function(){
        return this.getDataFromDom();
    };

    this.handleAtMentionResult = function (id, name) {
        var that = this;
        if (id && id.split("-").length == 2) {
            var mentionObjectType = id.split("-")[0],
                mentionObjectID = id.split("-")[1];
            if (mentionObjectType != 3) {
                // Don't need to do user entitlement check for mb posts as everyone can see mb posts.  Just check for secret group/restricted content.

                // dummy entitlement service
                var entitlementService = new jive.rte.EntitlementService({
                    objectID: 0,
                    objectType: 0,
                    entitlement: "VIEW"
                });

                if (entitlementService) {
                    entitlementService.checkEntitlement(mentionObjectType, mentionObjectID).addCallback(function(entitled) {
                        if (!entitled) {
                            var warning_message = '';
                            if (mentionObjectType == 700) {
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
        }
    };
});
