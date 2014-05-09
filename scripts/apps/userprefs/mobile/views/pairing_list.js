/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace("UserPrefs.Mobile");

jive.UserPrefs.Mobile.PairingList = jive.AbstractView.extend(function(protect) {

    protect.init = function(table) {
        var view = this;
        this.content = $j(table);
        this.content.delegate(".js-remove-pairing", "click", function(event) {
            view.emit("remove", view.getOAuthPairingID(this));
        });
        this.content.delegate(".js-activation-code", "click", function(event) {
            view.emit("show-activation-popup", view.getOAuthPairingID(this));
            event.preventDefault();
        });
        this.content.delegate(".js-mobile-renew", "click", function(event) {
            view.emit("renew", view.getOAuthPairingID(this));
            event.preventDefault();
        });
    };

    protect.getOAuthPairingID = function(element) {
        return $j(element).parents("[data-OAuthPairingID]").attr("data-OAuthPairingID");
    };

    this.removeRow = function(id) {
        this.hideSpinner();
        this.content.find("tr[data-OAuthPairingID=" + id + "]").remove();
        if (this.content.find("tbody > tr").length == 0) {
            this.content.parent().hide();
        }
    };

    this.addNew = function(pairing) {
        $j(jive.preferences.mobile.newDeviceRow({pairing:pairing})).prependTo(this.content.find("tbody"));
        this.content.parent().show();
    }
});
