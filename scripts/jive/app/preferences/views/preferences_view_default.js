/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

define('jive.JAF.PreferencesView', ['jquery'], function($j) {
return jive.oo.Class.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    protect.init = function(domTarget) {
        this.domTarget = domTarget;
    };

    this.create_message = function( key, style ) {
        var msg = jive.apps.preferences.renderAppDataErrorMessage({messageKeys: [key] });
        return {"message":msg, "style":style};
    };

    this.edit_app_preferences = function( app, appPrefView ) {
        var self = this;
        var instanceAppID = app.instanceAppID;

        if ( !appPrefView.preferences || appPrefView.preferences.length < 1 ) {
            self.emit( 'app.service.wire.nav.hide' );
            this.domTarget.html('');
            this.domTarget.append( $j(jive.apps.preferences.renderNoPreferences()) );
        } else {
            var modalDiv = $j(jive.apps.preferences.renderPreferences( {
                instanceAppID : instanceAppID,
                appPreferences: appPrefView.preferences.length ? appPrefView.preferences : [appPrefView.preferences]
            }));

            var focus = function() {
                var inputs = modalDiv.find(".jive-widget-edit-elem-url");
                if (inputs.length) $j(inputs.get(0)).focus();
            };

            self.emit("app.service.wire.submit", {
                callback: function() {
                    self.emit("app.preferences.save", modalDiv.find("form") );
                }
            });

            this.domTarget.html('');
            this.domTarget.append( modalDiv );
        }

    };

});
});
