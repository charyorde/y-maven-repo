/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace("UserPrefs.Mobile");

jive.UserPrefs.Mobile.RemoveConfirmation = jive.AbstractView.extend(function(protect) {

    protect.init = function(id) {
        var view = this;

        this.content = $j(jive.preferences.mobile.removeDeviceConfirmation({}));

        this.content.delegate(".js-remove", "click", function(event) {
            view.emit("confirm", id);
            event.preventDefault();
        });

        this.content.delegate(".close", "click", function(event) {
            view.emit("cancel", id);
            event.preventDefault();
        });
    };
});
