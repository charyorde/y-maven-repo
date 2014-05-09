(function($){var __IE__=false;
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
if(__IE__===false||__IE__>7){return}var reflowTimeout;var reflowDelay=100;var origDomManip=$.fn.domManip;function reflow(){document.body.className=document.body.className}$.fn.domManip=function(){clearTimeout(reflowTimeout);reflowTimeout=setTimeout(reflow,reflowDelay);return origDomManip.apply(this,arguments)};$(window).resize(function(){clearTimeout(reflowTimeout);reflowTimeout=setTimeout(reflow,reflowDelay)})})(jQuery);