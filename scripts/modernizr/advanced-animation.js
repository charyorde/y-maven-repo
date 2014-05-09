/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * This plugin checks to see if animations should be used in the Jive core app.  The intent here is to replace
 * user agent sniffing or references to jQuery.browser.
 */
Modernizr.addTest('advancedanimation', function(){
    var div = document.createElement('div');
    div.innerHTML = '<!--[if lt IE 8]><i></i><![endif]-->';

    return !div.getElementsByTagName('i').length;
});
