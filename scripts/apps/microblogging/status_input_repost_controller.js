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
 * @depends template=jive.eae.common.repostModalSuccess
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/apps/microblogging/status_input_common_controller.js
 * @depends path=/resources/scripts/apps/microblogging/views/repost_view.js
 */
jive.MicroBlogging.RepostController = jive.MicroBlogging.CommonController.extend(function(protect, _super) {
    this.init = function (options) {
        _super.init.call(this, options);
        this.submitURLParams = {objectType:2020, objectID:1001};
    };

    protect.initMBView = function(){
        // setup microblogging view here
        this.microbloggingView = new jive.MicroBlogging.RepostView(this.viewOptions);
    };

    protect.submitServiceCall = function(data, promise){
        var self = this;
        if(this.draftWallEntry == null){
            this.microbloggingService.repost({'wallEntryID':data.wallEntryID}, data.wallentry.message)
                .addCallback(function(data) {
                    self.submitSuccessCallback(data, promise);
                }).addErrback(function(message, status) {
                    self.submitErrCallback(message, status, promise);
                });
        } else {
            _super.submitServiceCall.call(this, data, promise);
        }
    };

    protect.createDraft = function(callback, promise){
        var self = this;
        this.microbloggingService.createRepostDraft({wallEntryID:this.draftData.wallEntryID}, this.draftData.wallentry.message)
            .addCallback(function(data) {
                self.draftWallEntry = data;
                callback();
            }).addErrback(function(message, status) {
                promise.emitError(message, status);
            });
    };

    protect.submitSuccessCallback = function(data, promise){
        _super.submitSuccessCallback.call(this, data, promise);
        $j('div.j-repost-modal').trigger('close');
        $j(jive.eae.common.repostModalSuccess({wallentry: data.wallentry})).message({style: 'success'});
    };
});
