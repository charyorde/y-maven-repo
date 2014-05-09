/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends path=/resources/scripts/jive/app/configure/views/configure_view.js
 * @depends path=/resources/scripts/jive/app/configure/models/configure_model.js
 **/
define('jive.JAF.Configuration.ConfigureMainV2',
['jive.JAF.Configuration.ConfigureView', 'jive.JAF.Configuration.ConfigureModel'],
function(ConfigureView, ConfigureModel) {
return jive.oo.Class.extend(function(protect) {
    // emit events
    jive.conc.observable(this);

    protect.init = function( options ) {

        var self = this;

        var app = options.app;
        this.domTarget = options.domTarget;
        this.instanceAppID = app.instanceAppID;

        this.model = new ConfigureModel();

        this.model.addListener( 'app.got.configure.data', function(configSetupData) {

            // create the configure view
            self.configureView = new ConfigureView(
                app,
                configSetupData,
                self.domTarget
            );

            // persist on save configuration from view
            self.configureView.addListener( "app.save_configuration", function(services) {
                var appConfig = {
                    "instanceAppID": self.instanceAppID,
                    "services": services
                };
                self.model.persist_configuration( appConfig );
            });

            // propagate out cancel configuration event
            self.configureView.addListener('app.cancel_configuration', function() {
                self.emit("app.configure.cancel", self.instanceAppID );
            });

            self.configureView.addListener('app.service.wire.submit', function(data) {
                self.emit("app.service.wire.submit", data);
            });
            self.configureView.addListener('app.service.wire.cancel', function(data) {
                self.emit("app.service.wire.cancel", data);
            });

        });

        // launch
        this.model.get_configuration_data( this.instanceAppID );

        // propagate out the configure success and failure events
        this.model.addListener( 'app.configure.success', function() {
            self.emit("app.configure.success", self.instanceAppID );
        });
        this.model.addListener( 'app.configure.failed', function() {
            self.emit("app.configure.failed", self.instanceAppID );
        });

    };

});
});
