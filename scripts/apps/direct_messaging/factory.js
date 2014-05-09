jive.namespace('DirectMessaging');

/**
 * @depends path=/resources/scripts/apps/browse/user/model/user_source.js
 * @depends path=/resources/scripts/apps/direct_messaging/main.js
 * @param options
 * @return {jive.DirectMessaging.Main}
 */
jive.DirectMessaging.create = function(options) {
    var userModel = new jive.Browse.User.ItemSource(),
        model = new jive.DirectMessaging.MessageSource(userModel, options),
        view = new jive.DirectMessaging.CreateMessageView();

    return new jive.DirectMessaging.Main(model, view);
}

jive.DirectMessaging.sendMessageToUserIds = function(userIds) {
    var promise = new jive.conc.Promise(),
        controller = jive.DirectMessaging.create();

    promise.addCallback($j.proxy(controller.showModal, controller));
    controller.addRecipientsById(userIds, promise);
}

jive.DirectMessaging.isContentTypeEqualTo = function(value) {
    return value + '' === '109016030';
}