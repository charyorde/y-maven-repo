/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends path=/resources/scripts/jive/app/preferences/views/preferences_view_default.js
 * @depends path=/resources/scripts/jive/app/preferences/models/preferences_model.js
 */
define('jive.JAF.Preferences',
['jive.JAF.Preferences.Model',
 'jive.JAF.PreferencesView'],
function(Model, View) {
return jive.oo.Class.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    protect.init = function(app, domTarget ) {
        this.source = new Model();
        var appPref = this;

        this.defaultView = new View(domTarget);

        this.defaultView.addListener('app.service.wire.submit', function(data) {
            appPref.emit("app.service.wire.submit", data);
        });
        this.defaultView.addListener('app.service.wire.cancel', function(data) {
            appPref.emit("app.service.wire.cancel", data);
        });
        this.defaultView.addListener('app.service.wire.none' );

        this.source.addListener('app.preferences.get.pref.view', function(appPrefView) {
            if (appPrefView.customView) {
                // if custom view, emit to signal this fact
                appPref.emit('app.service.wire.none' );
                appPref.emit('app.preferences.get.custom.view', appPrefView.viewUrl );
            } else {
                appPref.defaultView.addListener( "app.preferences.save", function(prefs) {
                    appPref.source.setPreferences(prefs);
                });

                appPref.defaultView.edit_app_preferences( app, appPrefView );
            }
        });

        this.source.addListener('app.preferences.set.all', function() {
            appPref.emit(
                'app.preferences.default.saved',
                {message:"Your preferences have been saved."}
            );
        });

        this.source.getPreferencesView( app.instanceAppID );
    };

});
});
