/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
module("Jive Scroll Plugin", {
	autostart: false
});



asyncTest("test scrolling X the RTE", 2, function() {

    var rte = editor.get("wysiwygtext");
    var content = "";
    var wideWidth = rte.getContentAreaWidth() + 1000;
    content += '<p><img src="slickspeed/logo.png" width="' + wideWidth + '" height="200"></p>';

	ed.setContent(content);


    var started = false;
    ed.onScroll.add(function scrollListener(scrollX, scrollY){
        equals(scrollY, 0, "scroll position is correct");
        equals(scrollX, 200, "scroll position is correct");
        if(!started){
            started = true;
            ed.onScroll.remove(scrollListener);
            start();
        }
    }, this);
    setTimeout(function(){
        if(!started){
            started = true;
            start();
        }
    }, 1500);


    setTimeout(function(){
        $j(ed.getWin()).scrollLeft(200);
    }, 600);

});
