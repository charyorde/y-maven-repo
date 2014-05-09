/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */


/**
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/jive/app/oauth/views/gadgets-oauth-popup.js
 */
define('jive.JAF.Configuration.OAuthPopup', function(PopupDialog) {
return jive.AbstractView.extend(function(protect) {

    this.init = function ( popupURI, windowChars ) {
        var self = this;
//        alert( this.gup( popupURI, "state" ) );

        this.popupURI = popupURI;
        this.windowChars = windowChars;
        //        this.oauthPopup = new gadgets.oauth.Popup(
        this.oauthPopup = new jive.JAF.Configuration.PopupDialog(
            popupURI,
            windowChars,
            /* Callback when pop-up is opened. */
            function() {
                self.emit("popup.opened");
            },
            /* Callback when pop-up is closed. */
            function() {
                self.emit("popup.closed");
            }
        );
    };

    this.get_oauth_popup = function() {
        return this.oauthPopup;
    };

    this.click = function() {
        this.oauthPopup.click();
    };

    protect.gup = function( url, name ) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        if (results == null)
            return "";
        else
            return results[1];
    };

});
});
