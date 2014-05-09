jive.namespace('DirectMessaging');

/**
 * @depends path=/resources/scripts/apps/microblogging/status_input_common_controller.js
 */
jive.DirectMessaging.MicroBloggingController = jive.MicroBlogging.CommonController.extend(function(protect) {
    this.getMessageObject = function() {
        var message = { message: this.microbloggingView.getMessage() };
        if (this.draftWallEntry && this.draftWallEntry.wallentry) {
            message = $j.extend(true, this.draftWallEntry.wallentry, message);
        }

        return message;
    };

    protect.initMBView = function() {
        // setup microblogging view here
        var container = $j('#jive-modal-direct-messaging');
        this.microbloggingView = new jive.DirectMessaging.MicroBloggingView({
            selector:'#statusInputs-direct-message-text',
            idPostfix:'mbASHeader',
            atMentionBtn:container.find('a.jive-js-mention-button'),
            imgAttachmentBtn:container.find('a.jive-js-imgattach-button'),
            submitBtn: container.find('a.js-direct-messaging-form-submitBtn')
        });
    };

    protect.createDraft = function(callback, promise){
        var self = this;
        this.microbloggingService.createDraft({objectType:14, objectID:1}, {wallentry: {privateDM: true}})
            .addCallback(function(data) {
                self.draftWallEntry = data;
                callback();
            }).addErrback(function(message, status) {
                promise.emitError(message, status);
            });
    };
});
