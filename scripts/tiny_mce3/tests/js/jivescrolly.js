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


asyncTest("test scrolling Y the RTE", 2, function() {

    var content = "";
    for(var i=1;i<200;i++){
        content += '<p><span style="text-decoration: underline;">paragraph ' + i + ' </span></p>';
    }

	ed.setContent(content);


    var started = false;
    ed.onScroll.add(function scrollListener(scrollX, scrollY){
        equals(scrollY, 100, "scroll position is correct");
        equals(scrollX, 0, "scroll position is correct");
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
        $j(ed.getWin()).scrollTop(100);
    }, 600);

});

