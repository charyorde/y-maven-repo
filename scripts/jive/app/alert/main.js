/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends path=/resources/scripts/jive/app/alert/views/blocking_alert_view.js
 **/
define('jive.JAF.Alerts.AlertMainV2',
['jive.JAF.Alerts.BlockingView'],
function(BlockingView) {
return jive.oo.Class.extend(function(protect) {
    // emit events
    jive.conc.observable(this);

    protect.init = function( app, targetDomElement ) {
        this.app = app;
        this.targetDomElement = targetDomElement;
        this.blockingAlerts = this.app.blockingAlerts;
    };

    this.hasBlockingAlerts = function() {
        return this.blockingAlerts.length > 0;
    };

    this.getApp = function() {
        return this.app;
    };

    this.getActiveAlert = function() {
        return this.hasBlockingAlerts ? this.blockingAlerts[0] : false;
    };

    this.applyBlock = function( targetDomElement, app, alert ) {
        app = app || this.app;

        targetDomElement = targetDomElement ? targetDomElement : this.targetDomElement;
        if ( !targetDomElement ) {
            // no target; nothing to do
            return;
        }

        alert = alert || this.getActiveAlert();
        if ( !alert ) {
            // nothing to do if no  alerts
            return;
        }

        var self = this;
        var view = new BlockingView( app );
        var alertDom = view.applyBlockingAlert( targetDomElement, alert );

        // forward any view emits
        view.addListener( "app.block", function(data) {
            self.emit("app.block", data );
        });

        return alertDom;
    };

    this.routeActionClicks = function(data,
                                      configDialogLaunchCallback,
                                      removeAppCallbackSuccess,
                                      removeAppCallbackFailure,
                                      emitter

        ) {
        if ( data.type == 'app.launch.config' ) {
            configDialogLaunchCallback( this );
        } else if ( data.type == 'app.launch.market' || data.type == 'launch.market.app.profile' ) {
            window.location = window._jive_base_url + "/apps/market/marketapp/" + data.app.appUUID;
        } else if ( data.type == 'launch.market.faq' ) {
            window.open( window._jive_base_url + "/apps/market/marketfaq/" + data.app.appUUID, "fullscreen=yes");
        } else if ( data.type == 'app.launch.account' ) {
            window.location = window._jive_base_url + "/apps/market/marketuser/" + data.app.appUUID;
        } else {
            var successCallback = function() {};
            var failureCallback = function() {};

            if ( data.type == 'app.remove.banned'
                || data.type == 'app.remove.blacklisted'
                || data.type == 'app.delete'
                || data.type == 'app.hide' ) {
                successCallback = removeAppCallbackSuccess;
                failureCallback = removeAppCallbackFailure;
            }

            // the rest are just passed through
            emitter.emit(data.type, data.app, successCallback, failureCallback );
        }
    };

});
});
