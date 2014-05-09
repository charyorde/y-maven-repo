/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*globals Zapatec */

window.Zapatec = window.Zapatec || {};
window.Zapatec.Calendar = window.Zapatec.Calendar || {};

/**
 * Replaces the implementation of Zapatec.Calendar.bootstrap() in
 * calendar-bootstrap.js.  This is so that if bootstrap() is called after the
 * Zapatec Calendar is loaded it will still behave as expected.
 */
Zapatec.Calendar.bootstrap = function(params, callback){
    var cal = Zapatec.Calendar.setup(params);
    
    if (callback) {
        callback(cal);
    }
};
