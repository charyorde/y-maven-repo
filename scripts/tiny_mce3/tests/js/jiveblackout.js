/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

module("Jive Blackout Plugin", {
	autostart: false
});

test("blackout a paragraph", function() {
	ed.setContent('<p>first</p>');

	var p = ed.getBody().firstChild;

	var info = ed.plugins.jiveblackout.showBlackout(ed, p);

    var rte = editor.get("wysiwygtext");
    var $blackouts = rte.getPopOverContainer().find(".blackout");

    // blackout doesn't change content
    equals(ed.getContent(), '<p>first</p>');

    equals($blackouts.length, 4, "there are 4 blackouts");

    near($blackouts.filter(".b").position().top, 8 + $j(p).height(), 2, "blackout is positioned correctly");
    near($blackouts.filter(".l").position().top, 0, 2, "blackout is positioned correctly");
    near($blackouts.filter(".t").position().top, 0, 2, "blackout is positioned correctly");
    near($blackouts.filter(".r").position().top, 0, 2, "blackout is positioned correctly");

    near($blackouts.filter(".b").position().left, 8, 2, "blackout is positioned correctly");
    near($blackouts.filter(".l").position().left, 0, 2, "blackout is positioned correctly");
    near($blackouts.filter(".t").position().left, 8, 2, "blackout is positioned correctly");
    near($blackouts.filter(".r").position().left, 8 + $j(p).width(), 2, "blackout is positioned correctly");

    equals($blackouts.filter(".b").width() + $blackouts.filter(".l").width() + $blackouts.filter(".r").width(), rte.getContentAreaWidth(), "width is correct");
    equals($blackouts.filter(".t").width() + $blackouts.filter(".l").width() + $blackouts.filter(".r").width(), rte.getContentAreaWidth(), "width is correct");
    equals($blackouts.filter(".l").height(), rte.getContentAreaHeight(), "height is correct");
    equals($blackouts.filter(".r").height(), rte.getContentAreaHeight(), "height is correct");
    equals($blackouts.filter(".t").height(), $j(p).position().top, "height is correct");
    equals($blackouts.filter(".b").height(), rte.getContentAreaHeight() - ($j(p).position().top + $j(p).height()), "height is correct");
});

test("blackout an image", function() {
	ed.setContent('<p><img src="slickspeed/logo.png" width=200 height=200></p>');

	var img = ed.getBody().firstChild.firstChild;

	var info = ed.plugins.jiveblackout.showBlackout(ed, img);

    var rte = editor.get("wysiwygtext");
    var $blackouts = rte.getPopOverContainer().find(".blackout");

    equals($blackouts.length, 4, "there are 4 blackouts");

    near($blackouts.filter(".b").position().top, $j(img).position().top + $j(img).height(), 2, "blackout is positioned correctly");
    near($blackouts.filter(".l").position().top, 0, 2, "blackout is positioned correctly");
    near($blackouts.filter(".t").position().top, 0, 2, "blackout is positioned correctly");
    near($blackouts.filter(".r").position().top, 0, 2, "blackout is positioned correctly");

    near($blackouts.filter(".b").position().left, 8, 2, "blackout is positioned correctly");
    near($blackouts.filter(".l").position().left, 0, 2, "blackout is positioned correctly");
    near($blackouts.filter(".t").position().left, 8, 2, "blackout is positioned correctly");
    near($blackouts.filter(".r").position().left, 8 + $j(img).width(), 2, "blackout is positioned correctly");

    equals($blackouts.filter(".b").width() + $blackouts.filter(".l").width() + $blackouts.filter(".r").width(), rte.getContentAreaWidth(), "width is correct");
    equals($blackouts.filter(".t").width() + $blackouts.filter(".l").width() + $blackouts.filter(".r").width(), rte.getContentAreaWidth(), "width is correct");
    equals($blackouts.filter(".l").height(), rte.getContentAreaHeight(), "height is correct");
    equals($blackouts.filter(".r").height(), rte.getContentAreaHeight(), "height is correct");
    near($blackouts.filter(".t").height(), $j(img).position().top, 1, "height is correct");
    near($blackouts.filter(".b").height(), rte.getContentAreaHeight() - ($j(img).position().top + $j(img).height()), 1, "height is correct")
});

test("blackout a tall 1", function() {
	ed.setContent('<p><img src="slickspeed/logo.png" width=200 height=1000></p>');

	var img = ed.getBody().firstChild.firstChild;

	var info = ed.plugins.jiveblackout.showBlackout(ed, img);

    var rte = editor.get("wysiwygtext");
    var $blackouts = rte.getPopOverContainer().find(".blackout");

    equals($blackouts.length, 3, "there are 3 blackouts");

    near($blackouts.filter(".l").position().top, 0, 2, "blackout is positioned correctly");
    near($blackouts.filter(".t").position().top, 0, 2, "blackout is positioned correctly");
    near($blackouts.filter(".r").position().top, 0, 2, "blackout is positioned correctly");

    near($blackouts.filter(".l").position().left, 0, 2, "blackout is positioned correctly");
    near($blackouts.filter(".t").position().left, 8, 2, "blackout is positioned correctly");
    near($blackouts.filter(".r").position().left, 8 + $j(img).width(), 2, "blackout is positioned correctly");

    equals($blackouts.filter(".b").length, 0, "the bottom blackout isn't there");

    equals($blackouts.filter(".t").width() + $blackouts.filter(".l").width() + $blackouts.filter(".r").width(), rte.getContentAreaWidth(), "width is correct");
    equals($blackouts.filter(".l").height(), rte.getContentAreaHeight(), "height is correct");
    equals($blackouts.filter(".r").height(), rte.getContentAreaHeight(), "height is correct");
    near($blackouts.filter(".t").height(), $j(img).position().top, 1, "height is correct");
});

asyncTest("blackout a tall scrolled 1", function() {
	ed.setContent('<p><img src="slickspeed/logo.png" width=200 height=1000></p>');

	var img = ed.getBody().firstChild.firstChild;

	var info = ed.plugins.jiveblackout.showBlackout(ed, img);

    var rte = editor.get("wysiwygtext");



    setTimeout(function(){
        var $blackouts = rte.getPopOverContainer().find(".blackout");
        equals($blackouts.length, 2, "there are 2 blackouts");
        equals($j(ed.getWin()).scrollTop(), 100, "the window has scrolled");

        near($blackouts.filter(".l").position().top, 100, 2, "blackout is positioned correctly");
        near($blackouts.filter(".r").position().top, 100, 2, "blackout is positioned correctly");

        near($blackouts.filter(".l").position().left, 0, 2, "blackout is positioned correctly");
        near($blackouts.filter(".r").position().left, 8 + $j(img).width(), 2, "blackout is positioned correctly");

        equals($blackouts.filter(".t, .b").length, 0, "the top & bottom blackout aren't there");

        equals($blackouts.filter(".l").width(), $j(img).position().left, "height is correct");
        equals($blackouts.filter(".r").width(), rte.getContentAreaWidth() - ($j(img).position().left + $j(img).width()), "width is correct");
        equals($blackouts.filter(".l").height(), rte.getContentAreaHeight(), "height is correct");
        equals($blackouts.filter(".r").height(), rte.getContentAreaHeight(), "height is correct");
        start();
    }, 1500);

    setTimeout(function(){
        $j(ed.getWin()).scrollTop(100);
        $j(ed.getBody()).parents("html").andSelf().scrollTop(100);
    }, 600);
});

asyncTest("blackout a tall scrolled 2", function() {
	ed.setContent('<p><img src="slickspeed/logo.png" width=200 height=1000></p>');

	var img = ed.getBody().firstChild.firstChild;

	var info = ed.plugins.jiveblackout.showBlackout(ed, img);

    var rte = editor.get("wysiwygtext");



    setTimeout(function(){
        var $blackouts = rte.getPopOverContainer().find(".blackout");
        equals($blackouts.length, 3, "there are 3 blackouts");
        // scroll distance + height of RTE + 2 x the 8px margin
        equals($j(ed.getWin()).scrollTop(), 1000 - rte.getContentAreaHeight() + 16, "the window has scrolled");

        near($blackouts.filter(".b").position().top, 8 + $j(img).height(), 2, "blackout is positioned correctly");
        near($blackouts.filter(".l").position().top, $j(ed.getWin()).scrollTop(), 2, "blackout is positioned correctly");
        near($blackouts.filter(".r").position().top, $j(ed.getWin()).scrollTop(), 2, "blackout is positioned correctly");

        near($blackouts.filter(".b").position().left, 8, 2, "blackout is positioned correctly");
        near($blackouts.filter(".l").position().left, 0, 2, "blackout is positioned correctly");
        near($blackouts.filter(".r").position().left, 8 + $j(img).width(), 2, "blackout is positioned correctly");

        equals($blackouts.filter(".t").length, 0, "the top blackout isn't there");

        equals($blackouts.filter(".b").width() + $blackouts.filter(".l").width() + $blackouts.filter(".r").width(), rte.getContentAreaWidth(), "width is correct");
        equals($blackouts.filter(".l").width(), $j(img).position().left, "height is correct");
        equals($blackouts.filter(".r").width(), rte.getContentAreaWidth() - ($j(img).position().left + $j(img).width()), "width is correct");
        equals($blackouts.filter(".l").height(), rte.getContentAreaHeight(), "height is correct");
        equals($blackouts.filter(".r").height(), rte.getContentAreaHeight(), "height is correct");
        start();
    }, 1500);

    setTimeout(function(){
        $j(ed.getWin()).scrollTop(1000);
    }, 600);
});

test("blackout a wide 1", function() {
    var rte = editor.get("wysiwygtext");
    var wideWidth = rte.getContentAreaWidth() + 100;
	ed.setContent('<p><img src="slickspeed/logo.png" width=' + wideWidth + ' height=200></p>');

	var img = ed.getBody().firstChild.firstChild;

	var info = ed.plugins.jiveblackout.showBlackout(ed, img);

    var $blackouts = rte.getPopOverContainer().find(".blackout");

    equals($blackouts.length, 3, "there are 3 blackouts");

    near($blackouts.filter(".b").position().top, $j(img).position().top + $j(img).height(), 2, "blackout is positioned correctly");
    near($blackouts.filter(".l").position().top, 0, 2, "blackout is positioned correctly");
    near($blackouts.filter(".t").position().top, 0, 2, "blackout is positioned correctly");

    near($blackouts.filter(".b").position().left, $j(img).position().left, 2, "blackout is positioned correctly");
    near($blackouts.filter(".l").position().left, 0, 2, "blackout is positioned correctly");
    near($blackouts.filter(".t").position().left, $j(img).position().left, 2, "blackout is positioned correctly");

    equals($blackouts.filter(".r").length, 0, "the right blackout isn't there");

    equals($blackouts.filter(".b").width() + $blackouts.filter(".l").width(), rte.getContentAreaWidth(), "width is correct");
    equals($blackouts.filter(".t").width() + $blackouts.filter(".l").width(), rte.getContentAreaWidth(), "width is correct");
    equals($blackouts.filter(".l").height(), rte.getContentAreaHeight(), "height is correct");
    equals($blackouts.filter(".t").height(), $j(img).position().top, "height is correct");
    equals($blackouts.filter(".b").height(), rte.getContentAreaHeight() - ($j(img).position().top + $j(img).height()), "height is correct");

});

if(tinymce.isIE) asyncTest("blackout a wide scrolled 1", function() {
    var rte = editor.get("wysiwygtext");
    var wideWidth = rte.getContentAreaWidth() + 100;
    ed.setContent('<p><img src="slickspeed/logo.png" width=' + wideWidth + ' height=200></p>');

	var img = ed.getBody().firstChild.firstChild;

	var info = ed.plugins.jiveblackout.showBlackout(ed, img);

    setTimeout(function(){
        //
        // ideally, there would be 3, but the <body> doesn't grow past the width
        // of hte iframe, so the right margin ends up being 0 instead of 8
        var $blackouts = rte.getPopOverContainer().find(".blackout");
        equals($blackouts.length, 3, "there are 2 blackouts");
        // scroll distance + height of RTE + 2 x the 8px margin
        near($j(ed.getWin()).scrollLeft(), wideWidth - rte.getContentAreaWidth() + 16, 2, "the window has scrolled");

        near($blackouts.filter(".b").position().top, $j(img).position().top + $j(img).height(), 2, "blackout is positioned correctly");
        near($blackouts.filter(".t").position().top, 0, 2, "blackout is positioned correctly");
        near($blackouts.filter(".r").position().top, $j(ed.getWin()).scrollTop(), 2, "blackout is positioned correctly");

        near($blackouts.filter(".b").position().left, $j(ed.getWin()).scrollLeft(), 2, "blackout is positioned correctly");
        near($blackouts.filter(".t").position().left, $j(ed.getWin()).scrollLeft(), 2, "blackout is positioned correctly");
        near($blackouts.filter(".r").position().left, 8 + $j(img).width(), 2, "blackout is positioned correctly");


        equals($blackouts.filter(".l").length, 0, "the left & right blackout aren't there");

        near($blackouts.filter(".b").width(), rte.getContentAreaWidth() - 8, 2, "width is correct");
        near($blackouts.filter(".t").width(), rte.getContentAreaWidth() - 8, 2, "width is correct");
        equals($blackouts.filter(".b").height(), rte.getContentAreaHeight() - ($j(img).position().top + $j(img).height()), "height is correct");
        equals($blackouts.filter(".t").height(), $j(img).position().top, "height is correct");
        equals($blackouts.filter(".r").width(), rte.getContentAreaWidth() - ($blackouts.filter(".t").width()), "width is correct");
        equals($blackouts.filter(".r").height(), rte.getContentAreaHeight(), "height is correct");
        start();
    }, 1500);

    setTimeout(function(){
        $j(ed.getWin()).scrollLeft(1000);
    }, 600);
});

if(!tinymce.isIE) asyncTest("blackout a wide scrolled 1", function() {
    var rte = editor.get("wysiwygtext");
    var wideWidth = rte.getContentAreaWidth() + 100;
    ed.setContent('<p><img src="slickspeed/logo.png" width=' + wideWidth + ' height=200></p>');

	var img = ed.getBody().firstChild.firstChild;

	var info = ed.plugins.jiveblackout.showBlackout(ed, img);

    setTimeout(function(){
        //
        // ideally, there would be 3, but the <body> doesn't grow past the width
        // of hte iframe, so the right margin ends up being 0 instead of 8
        var $blackouts = rte.getPopOverContainer().find(".blackout");
        equals($blackouts.length, 2, "there are 2 blackouts");
        // scroll distance + height of RTE + 2 x the 8px margin
        equals($j(ed.getWin()).scrollLeft(), wideWidth - rte.getContentAreaWidth() + 8, "the window has scrolled");

        near($blackouts.filter(".b").position().top, $j(img).position().top + $j(img).height(), 2, "blackout is positioned correctly");
        near($blackouts.filter(".t").position().top, 0, 2, "blackout is positioned correctly");

        near($blackouts.filter(".b").position().left, $j(ed.getWin()).scrollLeft(), 2, "blackout is positioned correctly");
        near($blackouts.filter(".t").position().left, $j(ed.getWin()).scrollLeft(), 2, "blackout is positioned correctly");


        equals($blackouts.filter(".l, .r").length, 0, "the left & right blackout aren't there");

        equals($blackouts.filter(".b").width(), rte.getContentAreaWidth(), "width is correct");
        equals($blackouts.filter(".t").width(), rte.getContentAreaWidth(), "width is correct");
        equals($blackouts.filter(".b").height(), rte.getContentAreaHeight() - ($j(img).position().top + $j(img).height()), "height is correct");
        equals($blackouts.filter(".t").height(), $j(img).position().top, "height is correct");
        start();
    }, 1500);

    setTimeout(function(){
        $j(ed.getWin()).scrollLeft(1000);
    }, 600);
});

asyncTest("blackout a wide scrolled 2", function() {
    var rte = editor.get("wysiwygtext");
    var wideWidth = rte.getContentAreaWidth() + 100;
    ed.setContent('<p><img src="slickspeed/logo.png" width=' + wideWidth + ' height=200></p>');

	var img = ed.getBody().firstChild.firstChild;

	var info = ed.plugins.jiveblackout.showBlackout(ed, img);

    setTimeout(function(){
        //
        // ideally, there would be 3, but the <body> doesn't grow past the width
        // of hte iframe, so the right margin ends up being 0 instead of 8
        var $blackouts = rte.getPopOverContainer().find(".blackout");
        equals($blackouts.length, 2, "there are 2 blackouts");
        // scroll distance + height of RTE + 2 x the 8px margin
        equals($j(ed.getWin()).scrollLeft(), 50, "the window has scrolled");

        near($blackouts.filter(".b").position().top, $j(img).position().top + $j(img).height(), 2, "blackout is positioned correctly");
        near($blackouts.filter(".t").position().top, 0, 2, "blackout is positioned correctly");

        near($blackouts.filter(".b").position().left, $j(ed.getWin()).scrollLeft(), 2, "blackout is positioned correctly");
        near($blackouts.filter(".t").position().left, $j(ed.getWin()).scrollLeft(), 2, "blackout is positioned correctly");

        equals($blackouts.filter(".l, .r").length, 0, "the left & right blackout aren't there");

        equals($blackouts.filter(".b").width(), rte.getContentAreaWidth(), "width is correct");
        equals($blackouts.filter(".t").width(), rte.getContentAreaWidth(), "width is correct");
        equals($blackouts.filter(".t").height(), $j(img).position().top, "height is correct");
        equals($blackouts.filter(".b").height(), rte.getContentAreaHeight() - ($j(img).position().top + $j(img).height()), "height is correct");
        start();
    }, 1500);

    setTimeout(function(){
        $j(ed.getWin()).scrollLeft(50);
    }, 600);
});

