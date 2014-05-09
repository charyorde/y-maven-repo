/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends path=/resources/scripts/jive/app/oauth/views/oauthoverlay.js
 * @depends path=/resources/scripts/jive/app/oauth/views/oauthpopup.js
 **/
define('jive.JAF.Configuration.OAuthMain',
['jive.JAF.Configuration.OAuthOverlay',
 'jive.JAF.Configuration.OAuthPopup'],
function(OAuthOverlay, OAuthPopup) {
return jive.oo.Class.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    this.init = function(app, alias, redirectURI, windowChars, callback ) {
        this.app = app;
        this.alias = alias;
        this.redirectURI = redirectURI;
        this.windowchars = windowChars;
        this.callback = callback;
    };

    this.getApp = function() {
        return this.app;
    };

    this.invokeCallback = function() {
        if ( this.callback ) {
            this.callback();
        }
    };

    protect.create_popup = function() {
        var self = this;
        var popupWrapper = new OAuthPopup( this.redirectURI, this.windowChars );
        var callback = this.callback;
        var app = this.app;
        popupWrapper.addListener( "popup.opened", function() {
            self.container.hideGrant();
            self.container.showWaiting();

            // propagate the event
            self.emit("popup.opened", app);
        });

        popupWrapper.addListener( "popup.closed", function() {
            self.container.hideWaiting();
            var result = { authorized: true };
            callback( result );

            // propagate the event
            self.emit("popup.closed", app);
        });

        return popupWrapper;
    };

    this.launch_popup = function( container ) {
        this.popupWrapper = this.create_popup();
        this.container = new OAuthOverlay( this.popupWrapper, container, this.alias );
        var app = this.app;
        this.container.addListener("oauth.approved", function() {
            var error = container.find("#_error");
            var errorDescription = container.find("#_errorDescription");
            var authorized = !(error.length > 0 || errorDescription.length > 0);
            var alias = container.find("#_alias").attr("value");
            var result = { alias: alias };
            if ( !authorized ) {
                result.error = {  code: error.attr("value"), message: errorDescription.attr("value") };
            }
            callback( result );

            // propagate the event
            self.emit("oauth.approved", app);
        });
    };

    this.authorization_done = function( error, errorDescription ) {
        var iframeContainer = $j( "#j-app-view-" + this.app.id );
        var authContainer = iframeContainer.find(".j-oauth-authorize");
        if ( error ) {
            authContainer.append("<input type='hidden' id='_error' value='" + error + "'/>");
        }
        if ( errorDescription ) {
            authContainer.append("<input type='hidden' id='_errorDescription' value='" + errorDescription + "'/>");
        }
        iframeContainer.find(".j-error-msg-oauth-approved-btn").click();
    };

});
});
