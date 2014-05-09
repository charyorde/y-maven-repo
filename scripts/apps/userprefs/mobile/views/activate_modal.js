/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace("UserPrefs.Mobile");

jive.UserPrefs.Mobile.ActivateModal = jive.AbstractView.extend(function(protect) {

    protect.init = function(pairing, mobileURL, communityName) {
        var view = this;
        var params = {
            pairing: pairing,
            mobileURL: mobileURL,
            communityName: communityName
        };
        this.content = $j(jive.preferences.mobile.newDeviceModal(params));

        this.content.delegate(".js-qr-code-whats-this", "click", function(event) {
            event.preventDefault();
            if (view.whatsThisVisible) {
                view.hideWhatsThisMessage();
            } else {
                view.showWhatsThisMessage();
            }
        });
    };

    protect.showWhatsThisMessage = function() {
        var self = this;
        this.whatsThisVisible = true;
        $j("#js-qr-code-whats-this").popover({
            context:this.content.find(".js-qr-code-whats-this"),
            destroyOnClose:false,
            onClose: function() {
                self.whatsThisVisible = false;
            }
        });
    };

    protect.hideWhatsThisMessage = function() {
        $j("#js-qr-code-whats-this").trigger("close");
    };
});
