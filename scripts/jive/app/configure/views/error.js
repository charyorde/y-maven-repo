/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 **/
define('jive.JAF.Configuration.Error', ['jquery'], function($j) {
return jive.oo.Class.extend(function(protect) {

    protect.init = function() {
    };

    this.clear = function() {
        $j("#jive-modal-app-configure-feedback").hide();
    };

    this.render = function( options ) {
        if (options == null) {
            return;
        }
        var msgKeys = [];
        if (options.missing_endpoint) msgKeys.push("missing.endpoint");
        if (options.missing_credential) msgKeys.push("missing.credential");
        if (msgKeys.length == 0) msgKeys.push("error.general");

        if ( msgKeys.length < 1  ) {
            this.clear();
            return;
        }
        
        // else
        try {
            $j("#jive-modal-app-configure-feedback").show().html(
                jive.apps.configure.renderAppDataErrorMessage(msgKeys)
            );
        }
        catch(e) {
            // todo: this will stop hapening someday I hope.
        }

    };

    this.fieldsToVisualMarkers = function(fields) {
         // updates a jQuery selector or element array by selecting the parents of all
         // .j-service-radio elements in their place, but leaving all other elements as is.
         return ($j(fields).map(function() {
             var me = $j(this);
             return me.hasClass("j-service-radio") ? me.parent()[0] : this;
         })).addClass("j-service-error");
    };

});
});
