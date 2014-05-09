/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Modalizer');  // Creates the jive.Modalizer namespace if it does not already exist.


jive.Modalizer.ModalSource = jive.oo.Class.extend(function(protect) {

    this.getConfirmation = function(url, callback) {
        $j.ajax({
            url: url,
            type: 'GET',
            dataType: 'html',
            success: function(data) {
                callback(data);
            },
            error: function() {
                // TODO: flesh this out
                alert("failed..");
            }
        });
    };

});
