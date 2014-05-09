/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace("UserPrefs.Mobile");

jive.UserPrefs.Mobile.FirstVisit = jive.AbstractView.extend(function(protect) {

    protect.init = function(id) {
        var view = this;

        this.content = $j(id);

        this.content.delegate(".js-first-visit", "click", function(event) {
            view.emit("close", id);
            event.preventDefault();
        });
    }
});
