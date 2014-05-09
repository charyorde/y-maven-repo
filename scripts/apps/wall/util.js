/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Wall.Util');

// Util method to display new updates dropdown
jive.Wall.Util.focusHelper = function() {

    $j('#j-ub-new-wallentry').click();

    var intID = window.setInterval(function() {
        var elem = $j('#jive-quickstatuscreate-form .jive-js-statusinput');
                if (elem.length != 0) {
                    elem.last().focus();
                    window.clearInterval(intID);
                }
    },500);

    return false;

};