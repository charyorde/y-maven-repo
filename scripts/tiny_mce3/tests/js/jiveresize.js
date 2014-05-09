/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
module("Jive Resize Plugin", {
	autostart: false
});

if(tinymce.isWebKit){

    test("resize an image", function() {
        ed.setContent('<p><img src="slickspeed/logo.png" width=200 height=200></p>');

        var img = ed.getBody().firstChild.firstChild;

        var info = ed.plugins.jiveresize.showCorners(ed, $j(img));

        var rte = editor.get("wysiwygtext");
        var $handles = rte.getPopOverContainer().find(".handle");

        equals($handles.length, 4, "there are 4 handles");

        near($handles.filter(".br").position().top, $j(img).position().top + $j(img).height(), 4, "blackout is positioned correctly");
        near($handles.filter(".bl").position().top, $j(img).position().top + $j(img).height(), 4, "blackout is positioned correctly");
        near($handles.filter(".tr").position().top, $j(img).position().top, 4, "blackout is positioned correctly");
        near($handles.filter(".tl").position().top, $j(img).position().top, 4, "blackout is positioned correctly");

        near($handles.filter(".br").position().left, $j(img).position().left + $j(img).width(), 4, "blackout is positioned correctly");
        near($handles.filter(".bl").position().left, $j(img).position().left, 4, "blackout is positioned correctly");
        near($handles.filter(".tr").position().left, $j(img).position().left + $j(img).width(), 4, "blackout is positioned correctly");
        near($handles.filter(".tl").position().left, $j(img).position().left, 4, "blackout is positioned correctly");
    });

    test("resize a wide image", function() {
        var rte = editor.get("wysiwygtext");
        var wideWidth = rte.getContentAreaWidth() + 100;
        ed.setContent('<p><img src="slickspeed/logo.png" width=' + wideWidth + ' height=200></p>');

        var img = ed.getBody().firstChild.firstChild;

        var info = ed.plugins.jiveresize.showCorners(ed, $j(img));

        var $handles = rte.getPopOverContainer().find(".handle");

        equals($handles.length, 2, "there are 2 handles");

        equals($handles.filter(".tr, .br").length, 0, "the right handles aren't there");

        near($handles.filter(".bl").position().top, $j(img).position().top + $j(img).height(), 4, "blackout is positioned correctly");
        near($handles.filter(".tl").position().top, $j(img).position().top, 4, "blackout is positioned correctly");

        near($handles.filter(".bl").position().left, $j(img).position().left, 4, "blackout is positioned correctly");
        near($handles.filter(".tl").position().left, $j(img).position().left, 4, "blackout is positioned correctly");
    });

    test("resize an image", function() {
        ed.setContent('<p><img src="slickspeed/logo.png" width=200 height=2000></p>');

        var img = ed.getBody().firstChild.firstChild;

        var info = ed.plugins.jiveresize.showCorners(ed, $j(img));

        var rte = editor.get("wysiwygtext");
        var $handles = rte.getPopOverContainer().find(".handle");

        equals($handles.length, 2, "there are 2 handles");

        equals($handles.filter(".bl, .br").length, 0, "the bottom handles aren't there");

        near($handles.filter(".tr").position().top, $j(img).position().top, 4, "blackout is positioned correctly");
        near($handles.filter(".tl").position().top, $j(img).position().top, 4, "blackout is positioned correctly");

        near($handles.filter(".tr").position().left, $j(img).position().left + $j(img).width(), 4, "blackout is positioned correctly");
        near($handles.filter(".tl").position().left, $j(img).position().left, 4, "blackout is positioned correctly");
    });

    asyncTest("resize a wide scrolled 1", function() {
        var rte = editor.get("wysiwygtext");
        var wideWidth = rte.getContentAreaWidth() + 100;
        ed.setContent('<p><img src="slickspeed/logo.png" width=' + wideWidth + ' height=200></p>');

        var img = ed.getBody().firstChild.firstChild;


        setTimeout(function(){
            var info = ed.plugins.jiveresize.showCorners(ed, $j(img));

            var $handles = rte.getPopOverContainer().find(".handle");

            equals($handles.length, 2, "there are 2 handles");

            equals($handles.filter(".tl, .bl").length, 0, "the left handles aren't there");

            near($handles.filter(".br").position().top, $j(img).position().top + $j(img).height(), 4, "blackout is positioned correctly");
            near($handles.filter(".tr").position().top, $j(img).position().top, 4, "blackout is positioned correctly");

            near($handles.filter(".br").position().left, $j(img).position().left + $j(img).width(), 4, "blackout is positioned correctly");
            near($handles.filter(".tr").position().left, $j(img).position().left + $j(img).width(), 4, "blackout is positioned correctly");
            start();
        }, 1500);

        setTimeout(function(){
            $j(ed.getWin()).scrollLeft(1000);
        }, 600);
    });
    asyncTest("resize wide scrolled 2", function() {
        var rte = editor.get("wysiwygtext");
        var wideWidth = rte.getContentAreaWidth() + 100;
        ed.setContent('<p><img src="slickspeed/logo.png" width=' + wideWidth + ' height=200></p>');

        var img = ed.getBody().firstChild.firstChild;


        setTimeout(function(){
            var info = ed.plugins.jiveresize.showCorners(ed, $j(img));

            var $handles = rte.getPopOverContainer().find(".handle");

            equals($handles.length, 0, "there are 0 handles");

            start();
        }, 1500);

        setTimeout(function(){
            $j(ed.getWin()).scrollLeft(50);
        }, 600);
    });

    asyncTest("resize a tall scrolled 3", function() {
        var rte = editor.get("wysiwygtext");
        ed.setContent('<p><img src="slickspeed/logo.png" width=200 height=2000></p>');

        var img = ed.getBody().firstChild.firstChild;

        setTimeout(function(){
            var info = ed.plugins.jiveresize.showCorners(ed, $j(img));

            var $handles = rte.getPopOverContainer().find(".handle");

            equals($handles.length, 2, "there are 2 handles");

            equals($handles.filter(".tl, .tr").length, 0, "the top handles aren't there");

            near($handles.filter(".br").position().top, $j(img).position().top + $j(img).height(), 4, "blackout is positioned correctly");
            near($handles.filter(".bl").position().top, $j(img).position().top + $j(img).height(), 4, "blackout is positioned correctly");

            near($handles.filter(".br").position().left, $j(img).position().left + $j(img).width(), 4, "blackout is positioned correctly");
            near($handles.filter(".bl").position().left, $j(img).position().left, 4, "blackout is positioned correctly");
            start();
        }, 1500);

        setTimeout(function(){
            $j(ed.getWin()).scrollTop(2000);
        }, 600);
    });
    asyncTest("resize tall scrolled 4", function() {
        var rte = editor.get("wysiwygtext");
        ed.setContent('<p><img src="slickspeed/logo.png" width=200 height=2000></p>');

        var img = ed.getBody().firstChild.firstChild;


        setTimeout(function(){
            var info = ed.plugins.jiveresize.showCorners(ed, $j(img));

            var $handles = rte.getPopOverContainer().find(".handle");

            equals($handles.length, 0, "there are 0 handles");

            start();
        }, 1500);

        setTimeout(function(){
            $j(ed.getWin()).scrollTop(50);
        }, 600);
    });

    /**
     * this has alot of setTimeouts b/c it randomly fails
     * in when not running alone
     */
    asyncTest("test can't resize emoticon", function() {
        setTimeout(function(){
            var rte = editor.get("wysiwygtext");
            ed.setContent('<p>first </p>', {format: 'raw'});

            var rng = ed.dom.createRng();
            rng.setStart(ed.getBody().firstChild.firstChild, 6);
            rng.setEnd(ed.getBody().firstChild.firstChild, 6);
            ed.selection.setRng(rng);

            ed.selection.setContent(':');
            ed.selection.setContent(') ab');
            type(ed, 41);

            equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>first <img class=\"jive_macro jive_emote\" src=\"' + CS_RESOURCE_BASE_URL + '/images/emoticons/happy.png\" jivemacro=\"emoticon\" ___jive_emoticon_name=\"happy\" /> ab</p>');

            setTimeout(function(){
                var $img = $j(ed.getBody()).find("img");
                var info = ed.plugins.jiveresize.showCorners(ed, $img);
                var $handles = rte.getPopOverContainer().find(".handle");

                equals($handles.length, 0, "there are 0 handles");
                start();
            }, 300);
        }, 300);
    });

    asyncTest("test resize table", function() {
        var rte = editor.get("wysiwygtext");
        ed.setContent('<table width=100 height=100><tr><td>asdf</td><td></td></tr><tr><td></td><td></td></tr></table>');

        var $td = $j(ed.getBody()).find("td");
        var $table = $j(ed.getBody()).find("table");

        var rng = ed.dom.createRng();
        rng.setStart($td.get(0).firstChild, 0);
        rng.setEnd($td.get(0).firstChild, 0);
        ed.selection.setRng(rng);

        ed.nodeChanged();
        setTimeout(function(){
            //    var info = ed.plugins.jiveresize.showCorners(ed, $td);
            var $handles = rte.getPopOverContainer().find(".handle");

            equals($handles.length, 4, "there are 4 handles");

            near($handles.filter(".br").position().top, $table.position().top + $table.height(), 4, "blackout is positioned correctly");
            near($handles.filter(".bl").position().top, $table.position().top + $table.height(), 4, "blackout is positioned correctly");

            near($handles.filter(".tr").position().top, $table.position().top, 4, "blackout is positioned correctly");
            near($handles.filter(".tl").position().top, $table.position().top, 4, "blackout is positioned correctly");

            near($handles.filter(".tr").position().left, $table.position().left + $table.width(), 4, "blackout is positioned correctly");
            near($handles.filter(".tl").position().left, $table.position().left, 4, "blackout is positioned correctly");

            near($handles.filter(".br").position().left, $table.position().left + $table.width(), 4, "blackout is positioned correctly");
            near($handles.filter(".bl").position().left, $table.position().left, 4, "blackout is positioned correctly");
            start();
        }, 600);

    });

    test("test nested table", function() {
        var rte = editor.get("wysiwygtext");
        ed.setContent('<table width=200 height=200><tr><td>asdf</td><td></td></tr><tr><td></td><td><table width=100 height=100><tr><td>asdf</td><td></td></tr><tr><td></td><td></td></tr></table></td></tr></table>');

        var $td = $j(ed.getBody()).find("table:nth(1) td");
        var $table = $j(ed.getBody()).find("table:nth(1)");

        var rng = ed.dom.createRng();
        rng.setStart($td.get(0).firstChild, 0);
        rng.setEnd($td.get(0).firstChild, 0);
        ed.selection.setRng(rng);

        ed.nodeChanged();

    //    var info = ed.plugins.jiveresize.showCorners(ed, $td);
        var $handles = rte.getPopOverContainer().find(".handle");

        equals($handles.length, 4, "there are 4 handles");

        near($handles.filter(".br").position().top, $table.position().top + $table.height(), 4, "blackout is positioned correctly");
        near($handles.filter(".bl").position().top, $table.position().top + $table.height(), 4, "blackout is positioned correctly");

        near($handles.filter(".tr").position().top, $table.position().top, 4, "blackout is positioned correctly");
        near($handles.filter(".tl").position().top, $table.position().top, 4, "blackout is positioned correctly");

        near($handles.filter(".tr").position().left, $table.position().left + $table.width(), 4, "blackout is positioned correctly");
        near($handles.filter(".tl").position().left, $table.position().left, 4, "blackout is positioned correctly");

        near($handles.filter(".br").position().left, $table.position().left + $table.width(), 4, "blackout is positioned correctly");
        near($handles.filter(".bl").position().left, $table.position().left, 4, "blackout is positioned correctly");

    });

    test("test nested image", function() {
        var rte = editor.get("wysiwygtext");
        ed.setContent('<table width=200 height=200><tr><td>asdf</td><td></td></tr><tr><td></td><td><img src="slickspeed/logo.png" width=100 height=100></td></tr></table>');

        var $td = $j(ed.getBody()).find("td");
        var $img = $j(ed.getBody()).find("img");

        var rng = ed.dom.createRng();
        rng.setStart($img.get(0), 0);
        rng.setEnd($img.get(0), 0);
        ed.selection.setRng(rng);

        ed.nodeChanged();

    //    var info = ed.plugins.jiveresize.showCorners(ed, $td);
        var $handles = rte.getPopOverContainer().find(".handle");

        equals($handles.length, 4, "there are 4 handles");

        near($handles.filter(".br").position().top, $img.position().top + $img.height(), 4, "blackout is positioned correctly");
        near($handles.filter(".bl").position().top, $img.position().top + $img.height(), 4, "blackout is positioned correctly");

        near($handles.filter(".tr").position().top, $img.position().top, 4, "blackout is positioned correctly");
        near($handles.filter(".tl").position().top, $img.position().top, 4, "blackout is positioned correctly");

        near($handles.filter(".tr").position().left, $img.position().left + $img.width(), 4, "blackout is positioned correctly");
        near($handles.filter(".tl").position().left, $img.position().left, 4, "blackout is positioned correctly");

        near($handles.filter(".br").position().left, $img.position().left + $img.width(), 4, "blackout is positioned correctly");
        near($handles.filter(".bl").position().left, $img.position().left, 4, "blackout is positioned correctly");

    });

    asyncTest("resize image with mouse events", function() {
        ed.setContent('<p><img src="slickspeed/logo.png" width="200" height="200"></p>');

        var img = ed.getBody().firstChild.firstChild;
        var $img = $j(img);

        var info = ed.plugins.jiveresize.showCorners(ed, $j(img), true);

        var rte = editor.get("wysiwygtext");
        var $handles = rte.getPopOverContainer().find(".handle");

        equals($handles.length, 4, "there are 4 handles");

        var $br = $handles.filter(".br");

        var resizeCount = 0;

        var list = function(){
            resizeCount++;
        };

        ed.onResizingNode.add(list);
        ed.onResizedNode.add(list);

        $img.load(function(){
            mouseSequence($br.get(0), [
                {
                    type: "mousedown",
                    clientY: $br.offset().top,
                    clientX: $br.offset().left
                },
                {
                    type: "mousemove",
                    clientY: $br.offset().top - 60,
                    clientX: $br.offset().left - 60
                },
                "mouseup"
            ], function(){
                equals($img.width(), 140, "width");
                equals($img.height(), 140, "height");

                equals(resizeCount, 3, "3 events fired");

                ed.onResizingNode.remove(list);
                ed.onResizedNode.remove(list);

                start();

            });
        });
    });

    asyncTest("resize table with mouse events", function() {
        var rte = editor.get("wysiwygtext");
        ed.setContent('<body><table border="1" class="jiveBorder" style="border: 1px solid #000000;" width="200">\n<tbody>\n<tr>\n<th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;" valign="middle"><strong>Header 1</strong></th><th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;" valign="middle"><strong>Header 2</strong></th>\n</tr>\n<tr>\n<td style="padding: 2px;"><br /></td>\n<td style="padding: 2px;"><br /></td>\n</tr>\n<tr>\n<td style="padding: 2px;"><br /></td>\n<td style="padding: 2px;"><br /></td>\n</tr>\n</tbody>\n</table>\n<p> </p></body>');

        var table = $j('table', ed.getBody()).get(0);
        var cell = $j('td:first', ed.getBody()).get(0);
        var rng = ed.dom.createRng();
        rng.setStart(cell, 0);
        rng.collapse(true);
        ed.selection.setRng(rng);

        var origHeight = 0;

        ed.nodeChanged();

        //
        // add row above

        setTimeout(function(){
            rte.getPopOverContainer().find(".resizeRowHandle a.settings").mousedown();
            ok( ed.plugins.jivetablecontrols.$rowPopover.is(":visible"), "popup is visible");
        }, 500);

        setTimeout(function(){
            ed.plugins.jivetablecontrols.$rowPopover.find("a:nth(0)").click();
            equals(ed.selection.getNode(), $j(ed.getBody()).find("tr:nth(2) td:first").get(0), "row was added above");
            equals(4, $j(ed.getBody()).find("tr").length, "row was added above");

            origHeight = $j(table).outerHeight();

        }, 700);

        var info = ed.plugins.jiveresize.showCorners(ed, $j(table), false);

        var rte = editor.get("wysiwygtext");
        var $handles = rte.getPopOverContainer().find(".handle");

        equals($handles.length, 4, "there are 4 handles");

        var $br = $handles.filter(".br");

        var resizeCount = 0;

        var list = function(){
            resizeCount++;
        }

        ed.onResizingNode.add(list);
        ed.onResizedNode.add(list);

        setTimeout(function(){
            var e = new jQuery.Event("mousedown");
            e.pageY = $br.offset().top;
            e.pageX = $br.offset().left;
            $br.trigger(e);

            var e = new jQuery.Event("mousemove");
            e.pageY = $br.offset().top + 60;
            e.pageX = $br.offset().left + 60;
            $br.trigger(e);

            var e = new jQuery.Event("mouseup");
            $br.trigger(e);

            near($j(table).outerWidth(), 260, 3, "width is 260");
            near($j(table).outerHeight(), origHeight + 60, 3, "height is " + (origHeight + 60));

            equals(resizeCount, 3, "3 events fired");

            ed.onResizingNode.remove(list);
            ed.onResizedNode.remove(list);

            start();
        }, 1000);
    });
}else{
    test("resize only available in webkit", function() {
         var rte = editor.get("wysiwygtext");
         ed.setContent('<table width=200 height=200><tr><td>asdf</td><td></td></tr><tr><td></td><td><table width=100 height=100><tr><td>asdf</td><td></td></tr><tr><td></td><td></td></tr></table></td></tr></table>');

         var $td = $j(ed.getBody()).find("table:nth(1) td");
         var $table = $j(ed.getBody()).find("table:nth(1)");

         var rng = ed.dom.createRng();
         rng.setStart($td.get(0).firstChild, 0);
         rng.setEnd($td.get(0).firstChild, 0);
         ed.selection.setRng(rng);

         ed.nodeChanged();

         var $handles = rte.getPopOverContainer().find(".handle");

         equals($handles.length, 0, "there are no handles");
    });
}
