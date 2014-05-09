/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Handles persistence calls back to the server on the behalf of credentials.
 * @class
 */
define('jive.JAF.CoreContainer.CredentialsModel', ['jquery'], function($j) {
return jive.oo.Class.extend(function(protect) {
    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    protect.init = function(options) {
        var self = this;
        this.alias = options.alias;
    };

    this.get_credentials = function( instanceAppID, alias ) {
        var promise = new jive.conc.Promise();
        var ENDPOINT = jive.api.apps("instances/" + instanceAppID + "/credentials_setup?aliases=" + alias);
        $j.ajax( {
            url: ENDPOINT,
            type: 'GET',
            success: function( credentialsSetup ) {
                promise.emitSuccess( credentialsSetup );
            }
        } );

        return promise;
    };

    this.persist = function( instanceAppID, data ) {
        var self = this;
        var appConfig = {
            "instanceAppID": instanceAppID,
            "services": data.services
        };

        $j.ajax({
            type: "PUT",
            url: jive.api.apps("instances/update_credentials"),
            data: JSON.stringify(appConfig),
            contentType: "application/json",
            dataType: "json",
            success: function(_data) {
                var result = { alias: self.alias };
                self.emit("app.credentials.persisted.success", result);
            },
            error: function( err ) {
                var result = { alias: self.alias, error: {} };
                result.error.code = err.status ? err.status : 500;
                result.error.message = err.statusText;
                if (err.response && err.response.startsWith("{")) {
                    var response = JSON.parse(err.response);
                    if (response.message) {
                        result.error.message = response.message;
                    }
                }
                self.emit("app.credentials.persisted.failed", result);
            }
        });
    };

});
});


