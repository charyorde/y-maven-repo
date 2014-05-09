/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
(function($) {
    console.debug("loading resize-me.js");
    jive.namespace("widget");
    jive.widget.resizeMe = function(iFrameSelector) {
        var theIframes = $(iFrameSelector);
        theIframes.each(function() {
            var theBody = $(this).contents().find('body');
            $(this).css({height : 0 + 'px'});
            if (theBody.length > 0) {
                var newHeight = theBody[0].scrollHeight;
                $(this).css({height : newHeight + 'px'});
            }
        });
    };

    $(document).ready(function() {
        $(window).resize(jive.widget.resizeMe.bind(null, "iframe.htmlWidgetIframe"));

        $('iframe.htmlWidgetIframe').load(function(event) {
            jive.widget.resizeMe(this);
        });
    });
})(jQuery);
