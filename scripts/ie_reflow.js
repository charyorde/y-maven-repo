/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*
 * This code is put in place to work around IE bugs relating to text reflow not occurring properly after dynamic document
 * updates due to what appear to be internal IE race conditions.
 */
(function($) {
    // Only use this under MSIE.  All other browsers render correctly.
    // reliably establish which IE rendering engine is being used (from 6 up through IE9)
    // http://farukat.es/journal/2009/05/250-ie8-x-ua-compatible-solutions
    var __IE__ = false;
    //only IE browsers will parse the following Conditional Compiler code
    /*@cc_on
       @if ( @_jscript_version >= 10 )
          __IE__ = 10;
       @elif ( @_jscript_version >= 5.6 )
          __IE__ = true;
       @else
          __IE__ = 1;
       @end
       if ( __IE__ === true) {
            var elem = document.createElement('div');
            elem.innerHTML = '<!--[if IE 6]><br class="ie6"><![endif]--><!--[if IE 7]><br class="ie7"><![endif]--><!--[if IE 8]><br class="ie8"><![endif]--><!--[if gt IE 8]><br class="ie9"><![endif]-->';
            __IE__ = parseInt(elem.firstChild.className.substring(2), 0);
            elem = null;
       }
    @*/

    // Can now reliably test version vector of IE
    if ( __IE__ === false || __IE__ > 7 ) { return; }

    var reflowTimeout;
    var reflowDelay = 100;
    var origDomManip = $.fn.domManip;

    /*
     * Force a reflow of the document.
     */
    function reflow() {
        // IE reflows the page believing that this actually does something
        document.body.className = document.body.className;
    }

    /*
     * Force a reflow whenever the DOM is updated via jQuery.
     */
    $.fn.domManip = function() {
        clearTimeout(reflowTimeout);
        reflowTimeout = setTimeout(reflow, reflowDelay);
        return origDomManip.apply(this, arguments);
    };

    /*
     * JIVE-10338: Force a reflow whenever the page has been resized
     */
    $(window).resize(function() {
        clearTimeout(reflowTimeout);
        reflowTimeout = setTimeout(reflow, reflowDelay);
    });

})(jQuery);

