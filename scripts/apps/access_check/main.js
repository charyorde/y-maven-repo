/**
 * jive.AccessCheckApp.Main
 *
 * Main class for checking user access to a specific container
 *
 */

jive.namespace('AccessCheckApp');

jive.AccessCheckApp.Main = jive.oo.Class.extend(function(protect) {

	this.init = function(options) {
		var main = this;

		this.objectID = options.objectID;
		this.objectType = options.objectType;
		this.i18n = options.i18n;

		this.accessSource = new jive.AccessCheckApp.AccessCheckSource(options);

		this.accessView = new jive.AccessCheckApp.AccessCheckView(options);

		this.accessView.addListener('checkAccess', function(type, id, userID, promise) {
            // If a single objectID was not specified when the app was created, use the id
            // passed to this listener, which comes from the data-objectid attribute on the
            // clicked element.
            var objType = main.objectType;
            if (!objType) {
                objType = type;
            }
            var objId = main.objectID;
            if (!objId) {
                objId = id;
            }
            var objUserId = userID;
			main.accessSource.checkAccess( {
				objectType : objType,
				objectID : objId,
                userID : objUserId
			}).addCallback(function(data) {
				promise.emitSuccess(data);
			}).addErrback(function(error, status) {
				promise.emitError(error, status);
			});
		});
	}
});
