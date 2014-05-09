/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Main entry point for supporting the connects credentials gathering flow.
 *
 * @depends path=/resources/scripts/jive/app/credentials/views/credentials_form.js
 * @depends path=/resources/scripts/jive/app/credentials/models/credentials_model.js
 **/
define('jive.JAF.Configuration.CredentialsMainV2',
['jive.JAF.Configuration.CredentialsForm',
 'jive.JAF.CoreContainer.CredentialsModel'],
function(CredentialsForm, CredentialsModel) {
return jive.oo.Class.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    protect.init = function(options) {
        var self = this;

        var instanceAppID = options.instanceAppID;
        var serviceAlias = options.serviceAlias;
        self.completionCallback = options.completionCallback;

        this.model = new CredentialsModel({ alias: options.serviceAlias });

        var domTarget = options.domTarget;

        //////////////
        this.view = new CredentialsForm({
            "domTarget": domTarget
        });

        this.view.addListener( "app.credentials_done", function(data) {
            self.model.persist( instanceAppID, data );
        } );

        this.view.addListener( "app.credentials_cancelled", function() {
            self.emitFailure( "The user denied this operation." );
        } );

        /////////////
        this.model.get_credentials( instanceAppID, serviceAlias ).addCallback( function(credentialsSetup) {
            // initialize view on retrieving setup data
            self.view.render( credentialsSetup );
        });

        this.model.addListener("app.credentials.persisted.success", function(result) {
            self.view.msgSuccess(result);
            self.completionCallback(result);
        });

        this.model.addListener("app.credentials.persisted.failed", function(result) {
            self.view.msgFailed(result);
            self.completionCallback(result);
        });

    };

    this.emitFailure = function( msg ) {
        var self = this;
        var result = { alias: self.serviceAlias };
        result.error = { code: 401, message: msg };
        self.view.msgCancelled(result);
        self.completionCallback(result);
    };

    this.activate = function() {
        this.view.activate();
    };

    this.completed = function() {
        return this.view.completed();
    }

});
});
