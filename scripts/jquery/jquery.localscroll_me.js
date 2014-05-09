/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */


/* scroll to 'jump' links more gracefully, whether named anchors or element IDs */
/* ideally, both the scrollTo speed and offset would be parameters that could be tweaked per page */
if (!($j.browser.msie && $j.browser.version < 8)) {
    $j(document).ready(function() {
        $j('a.localScroll').live('click', function() {
            var hash = $j(this).attr("href").split('#').last();
            var aTagToScrollTo = $j("a[name='" + hash + "'], [id='" + hash + "']");
            $j.scrollTo(aTagToScrollTo, 200, { offset: { top: -20, left: -200 } });
            return false;
        });
        $j('a.localScrollSlow').live('click', function() {
            var hash = $j(this).attr("href").split('#').last();
            var aTagToScrollTo = $j("a[name='" + hash + "'], [id='" + hash + "']");
            $j.scrollTo(aTagToScrollTo, 800, { offset: { top: -20, left: -200 } });
            return false;
        });
    });
}

