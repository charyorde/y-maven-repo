/*
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * The overlay app settings view.
 * Automatically resizes the modal container where the app whose services are to be rendered is housed
 * @class
 * @extends jive.oo.Class
 * @param {Object} options
 *
 * @depends path=/resources/scripts/jive/app/credentials/main.js
 */
define('jive.JAF.CoreContainer.AppCredentialsView',
['jquery', 'jive.JAF.Configuration.CredentialsMainV2'],
function($j, CredentialsMainV2) {
return jive.oo.Class.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    //
    this.init = function ( options ) {
        this.app = options.app;
        this.serviceAlias = options.args.alias;
        this.callback = options.callback;
        this.completed = false;
    };

    this.getApp = function() {
        return this.app;
    };

    this.createUI = function() {
        var self = this;
        this.ui = $j( jive.apps.container.credentialsView() );
        this.credentialsMain = new CredentialsMainV2(
            {
                "domTarget" : self.ui,
                "instanceAppID": self.app.instanceAppID,
                "serviceAlias": self.serviceAlias,
                "completionCallback": function(result) {

                    self.callback( result );

                    if ( result.error ) {
                        self.emit("app.credentials.complete.error");
                    } else {
                        self.emit("app.credentials.complete.success");
                    }
                }
            }
        );

        return this.ui;
    };

    this.activate = function() {
        if ( !this.credentialsMain ) {
            return;
        }

        var self = this;
        window.setTimeout( function() {
            self.credentialsMain.activate();
        }, 350);
    };

    this.cleanup = function() {
        if ( !this.credentialsMain.completed() ) {
            this.credentialsMain.emitFailure( "The user cancelled this operation"  );
            this.emit("app.service.message", { "severity": "warn", "message": "You may not be able to use this app until you provide credentials."});
        }
    };

});
});