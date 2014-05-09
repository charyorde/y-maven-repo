/*globals microbloggingController */

jive.namespace('DirectMessaging');

jive.DirectMessaging.CreateMessageView = function() {
    // private
    jive.conc.observable(this);
    var microBloggingController = {}, $modal, userQueue = [];

    function serialize($form) {
        var userIDs = $form.find('input[name=share-users]').val().split(/\s*,\s*/);
        return $j.extend(microbloggingController.getMessageObject(), { userIDs: userIDs });
    }

    // public
    this.notifyError = function(errorMessage) {
        $j('<p />').html(errorMessage).message({ style: 'error' });
    };

    this.notifySuccess = function() {
        $j(jive.soy.direct_messaging.successMessage()).message({style: 'success'});
    };

    this.setRecipients = function(recipients) {
        userQueue = recipients.concat([]);
        return this;
    };

    this.hideModal = function() {
        $modal.trigger('close');
        return this;
    };

    this.lockSubmit = function() {
        $modal.find('input.js-direct-messaging-form-submitBtn').prop('disabled', true);
    };

    this.unlockSubmit = function() {
        $modal.find('input.js-direct-messaging-form-submitBtn').prop('disabled', false);
    };

    this.openModal = function() {
        // create modal
        var view = this;
        $modal = $j(jive.soy.direct_messaging.modal());
        var $input = $modal.find('input[type=text]').eq(0); // text input for user picker

        $modal.lightbox_me({destroyOnClose: true,
                            onLoad: function() {
                                $input.focus();
                            }});

        jive.DirectMessaging.CreateMessageView.initializeUserPicker($input).setUsers(userQueue);
        userQueue = [];


        // microblogging controller
        microbloggingController = jive.DirectMessaging.CreateMessageView.initializeMicroBloggingController();

        // capture form submit and emit an event
        $modal.find('form.j-form').submit((function(e, self) {
            view.lockSubmit();
            self.emit('form-submit', serialize($j(this)));
            e.preventDefault();
        }).partial(undefined, this));
    };
};


jive.DirectMessaging.CreateMessageView.initializeMicroBloggingController = function() {
    return new jive.DirectMessaging.MicroBloggingController();
};

jive.DirectMessaging.CreateMessageView.initializeUserPicker = function($input) {
    return new jive.UserPicker.Main({
        multiple: true,
        listAllowed: true,
        emailAllowed: false,
        canInvitePartners: true,
        $input : $input,
        relatedMessage : $j(jive.soy.direct_messaging.notRelated())
    });
};
