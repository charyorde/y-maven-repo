/**
 * @depends path=/resources/scripts/apps/browse/user/model/user_source.js
 * @depends path=/resources/scripts/apps/direct_messaging/controllers/micro_blogging_controller.js
 * @depends path=/resources/scripts/apps/direct_messaging/factory.js
 * @depends path=/resources/scripts/apps/direct_messaging/models/message_source.js
 * @depends path=/resources/scripts/apps/direct_messaging/views/create_message_view.js
 * @depends path=/resources/scripts/apps/direct_messaging/views/micro_blogging_view.js
 * @depends path=/resources/scripts/apps/microblogging/status_input_common_controller.js
 * @depends path=/resources/scripts/apps/microblogging/views/status_input_common_view.js
 * @depends path=/resources/scripts/apps/userpicker/main.js
 * @depends template=jive.soy.direct_messaging.*
 */
jive.namespace('DirectMessaging');

jive.DirectMessaging.Main = function(model, view) {
    // private
    function failure(errorMessage) {
        view.unlockSubmit();
        view.notifyError(errorMessage);
    }

    function success() {
        view.hideModal();
        view.notifySuccess();
    }


    // public methods
    this.onSubmit = function(payload) {
        model.sendMessage(payload).addCallback(success).addErrback(failure);
        return this;
    };

    /**
     * Converts an array of userIds to an array of users asynchronously.  If you want to take an action after the
     * users have been loaded you must pass a promise as the second argument. Since this method is asynchronous we're not
     * using the fluent interface here (returning this).
     *
     * @param {array} recipients a list of user ids
     * @param {Promise} promise (optional) called after the users have been loaded
     */
    this.addRecipientsById = function(userIds, promise) {
        promise = promise || new jive.conc.Promise();
        model.getUsersByIds(userIds).addCallback(function(users) {
            view.setRecipients(users);
            promise.emitSuccess();
        });
    };

    this.showModal = function() {
        view.openModal();
        return this;
    };

    this.hideModal = function() {
        view.hideModal();
        return this;
    };


    // constuctor
    view.addListener('form-submit', this.onSubmit.bind(this));
};
