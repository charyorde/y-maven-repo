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
 * Helper function to bootstrap Zapatec Calendar using lazyLoad.  This
 * implementation will be replaced by the implementation in
 * calendar-post-bootstrap.js once the Zapatec Calendar is loaded.
 */
Zapatec.Calendar.bootstrap = function(params, callback){
    var selectors = [params.button, params.displayArea, params.inputField].filter(function(id) {
        return !!id;
    }).map(function(id) {
        return '#'+ id;
    });

    jive.util.lazyLoadJSBySels(selectors, 'click focus', 'Zapatec.Calendar', function(){
        /*
         *  JIVE-1887: if weekNumbers is truthy, firstDay defaults to 1 (Monday). bummer.
         *  see: /resources/scripts/zapatec/zpcal/src/calendar.js, line #2358 (as of change set 113834)
         */
        params = $j.extend({ firstDay: 0, weekNumbers: false }, params);
        var cal = Zapatec.Calendar.setup(params);

        if (callback) {
            callback(cal);
        }
    });
};
