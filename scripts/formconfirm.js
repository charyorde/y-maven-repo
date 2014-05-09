/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.FormConfirm = function(formSelector, message) {

    var __unsavedChanges = false;

    $j(document).ready(function() {
        $j(formSelector + " :input").live("change", function() {
            __unsavedChanges = true;
        });
        $j(formSelector).submit(function(){
           __unsavedChanges = false;
        });
    });

    window.onbeforeunload = function() {
        if (__unsavedChanges) {
            return message;
        }
    };
};
