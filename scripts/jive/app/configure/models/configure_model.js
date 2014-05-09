/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 **/
define('jive.JAF.Configuration.ConfigureModel', ['jquery'], function($j) {
return jive.oo.Class.extend(function(protect) {
    // emit events
    jive.conc.observable(this);

    protect.init = function() {
    };

    this.persist_configuration = function( appConfig ) {
        var self = this;
        $j.ajax({
            type: "PUT",
            url: jive.api.apps("instances/"),
            data: JSON.stringify(appConfig),
            contentType: "application/json",
            dataType: "json",
            success: function(data) {
                // let listeners know that the configuration is complete.
                self.emit('app.configure.success');
            }, error: function( err ) {
                // let listeners know that the configuration has failed.
                self.emit('app.configure.failed');
            }
        });
    };

    this.get_configuration_data = function( instanceAppID ) {
        var self = this;
        var ENDPOINT = jive.api.apps("instances/" + instanceAppID + "/config_setup");
        $j.getJSON(ENDPOINT, function(data) {
            self.emit('app.got.configure.data', data );
        });
    };

});
});
