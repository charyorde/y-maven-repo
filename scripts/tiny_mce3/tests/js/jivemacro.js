/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
module("Jive Macros", {
	autostart: false
});

asyncTest("test create syntax highlight macro", function() {
    ed.setContent('');

	ed.focus();
    ed.selectionUtil.normalizeSelection();

    // the following inserts a code macro
    fakeMouseEvent($j("a.mce_jivemacros").get(0), "click");
    fakeMouseEvent($j("td.mceMacroMenu a:first").get(0), "mouseover");
    fakeMouseEvent($j("span.mce_code_javascript").parent().get(0), "click");

    // make sure cursor is inside the <pre>
    equals(ed.selection.getNode().nodeName.toLowerCase(), "p", "cursor is in a <p>");

    var macroPre = ed.selection.getNode().parentNode;
    equals(macroPre.nodeName.toLowerCase(), "pre", "cursor is in a <pre>");

    ok($j(macroPre).hasClass("jive_text_macro"), "has a jive_text_macro classname");
    ok($j(macroPre).hasClass("jive_macro_code"), "has a jive_macro_code classname");

    setTimeout(function(){
        var m = macroPre.className.match(/_jivemacro_uid_(\d+)/);
        equals(m.length, 2, "correctly matched uid");
        var uid = m[1];

        // find a div in the popunder that matches the uid
        var rte = ed.plugins.jivemacros.rte;
        var $richContent = rte.getHiddenContainer().find("#_" + uid);

        equals($richContent.length, 1, "found a rich item");

        if($j(macroPre).offset() && $richContent.position()){
            near($richContent.position().top, $j(macroPre).offset().top, 3, "top offset is correct");
            near($richContent.position().left, $j(macroPre).offset().left, 3, "left offset is correct");
            near($richContent.width(), 1041, 3, "width is correct");
            near($richContent.height(), $j(macroPre).height(), 3, "height is correct");
        }else{
            ok(false, "can't calculate position :(");
        }

        start();
    }, 300);
    stop();
});



asyncTest("test type in syntax highlight macro", function() {
    ed.setContent('');

    window.focus();
	ed.focus();
    ed.selectionUtil.normalizeSelection();

    // the following inserts a code macro
    fakeMouseEvent($j("a.mce_jivemacros").get(0), "click");
    fakeMouseEvent($j("td.mceMacroMenu a:first").get(0), "mouseover");
    fakeMouseEvent($j("span.mce_code_javascript").parent().get(0), "click");

    // make sure cursor is inside the <pre>
    equals(ed.selection.getNode().nodeName.toLowerCase(), "p", "cursor is in a <p>");

    var macroPre = ed.selection.getNode().parentNode;
    equals(macroPre.nodeName.toLowerCase(), "pre", "cursor is in a <pre>");

    $j(macroPre).html("<p>function(){</p><p>     return \"asdf\";</p><p>}</p>");

    ok($j(macroPre).hasClass("jive_text_macro"), "has a jive_text_macro classname");
    ok($j(macroPre).hasClass("jive_macro_code"), "has a jive_macro_code classname");

    setTimeout(function(){
        var m = macroPre.className.match(/_jivemacro_uid_(\d+)/);
        equals(m.length, 2, "correctly matched uid");
        var uid = m[1];

        // find a div in the popunder that matches the uid
        var rte = ed.plugins.jivemacros.rte;
        var $richContent = rte.getHiddenContainer().find("#_" + uid);

        equals($richContent.length, 1, "found a rich item");

        equals($richContent.find("pre").text(), "function(){ \n     return \"asdf\"; \n} \n", "correct source to highlight");
        equals($richContent.find("li").length, 3, "3 lines of source are highlighted");

        if($j(macroPre).offset() && $richContent.position()){
            near($richContent.position().top, $j(macroPre).offset().top, 3, "top offset is correct");
            near($richContent.position().left, $j(macroPre).offset().left, 3, "left offset is correct");
            near($richContent.width(), 1041, 3, "width is correct");
            near($richContent.height(), $j(macroPre).height(), 3, "height is correct");
        }else{
            ok(false, "can't calculate position:(")
        }

        start();
    }, 300);

    stop();
});


asyncTest("test empty lines in syntax highlight macro", function() {
    ed.setContent('');

    window.focus();
	ed.focus();
    ed.selectionUtil.normalizeSelection();

    // the following inserts a code macro
    fakeMouseEvent($j("a.mce_jivemacros").get(0), "click");
    fakeMouseEvent($j("td.mceMacroMenu a:first").get(0), "mouseover");
    fakeMouseEvent($j("span.mce_code_javascript").parent().get(0), "click");

    // make sure cursor is inside the <pre>
    equals(ed.selection.getNode().nodeName.toLowerCase(), "p", "cursor is in a <p>");

    var macroPre = ed.selection.getNode().parentNode;
    equals(macroPre.nodeName.toLowerCase(), "pre", "cursor is in a <pre>");

    $j(macroPre).html("<p></p><p></p><p></p>");

    ok($j(macroPre).hasClass("jive_text_macro"), "has a jive_text_macro classname");
    ok($j(macroPre).hasClass("jive_macro_code"), "has a jive_macro_code classname");

    setTimeout(function(){
        var m = macroPre.className.match(/_jivemacro_uid_(\d+)/);
        equals(m.length, 2, "correctly matched uid");
        var uid = m[1];

        // find a div in the popunder that matches the uid
        var rte = ed.plugins.jivemacros.rte;
        var $richContent = rte.getHiddenContainer().find("#_" + uid);

        equals($richContent.length, 1, "found a rich item");

        equals($richContent.find("pre").text(), " \n \n \n", "correct source to highlight");
        equals($richContent.find("li").length, 3, "3 lines of source are highlighted");

        if($j(macroPre).offset() && $richContent.position()){
            near($richContent.position().top, $j(macroPre).offset().top, 3, "top offset is correct");
            near($richContent.position().left, $j(macroPre).offset().left, 3, "left offset is correct");
            near($richContent.width(), 1041, 3, "width is correct");
            near($richContent.height(), $j(macroPre).height(), 3, "height is correct");
        }else{
            ok(false, "can't calculate position :(");
        }

        start();
    }, 300);

    stop();
});


asyncTest("test wide content in syntax highlight macro", function() {
    ed.setContent('');

    window.focus();
	ed.focus();
    ed.selectionUtil.normalizeSelection();

    // the following inserts a code macro
    fakeMouseEvent($j("a.mce_jivemacros").get(0), "click");
    fakeMouseEvent($j("td.mceMacroMenu a:first").get(0), "mouseover");
    fakeMouseEvent($j("span.mce_code_javascript").parent().get(0), "click");

    // make sure cursor is inside the <pre>
    equals(ed.selection.getNode().nodeName.toLowerCase(), "p", "cursor is in a <p>");

    var macroPre = ed.selection.getNode().parentNode;
    equals(macroPre.nodeName.toLowerCase(), "pre", "cursor is in a <pre>");

    $j(macroPre).html("<p>asfdklkj asdfklkasdfj lkasfj lkas jflkas faskdfj lasf lkas flkasjf klasj fklas fjkakls faklsdf lads aklj fklas fkl sdklja fklas fklas dfkl asf kals dfjlkasj flkas dfljasdf ksadfj lajksd fklasdj flkasdf jaslkdf laksdfj alksdf lkasdf lkas fjlkas jflkafs lksa l and awesome!</p><p>klasfj lkas flkas f</p><p>askldfj laksfj lkas jf</p>");

    ok($j(macroPre).hasClass("jive_text_macro"), "has a jive_text_macro classname");
    ok($j(macroPre).hasClass("jive_macro_code"), "has a jive_macro_code classname");

    setTimeout(function(){
        var m = macroPre.className.match(/_jivemacro_uid_(\d+)/);
        equals(m.length, 2, "correctly matched uid");
        var uid = m[1];

        // find a div in the popunder that matches the uid
        var rte = ed.plugins.jivemacros.rte;
        var $richContent = rte.getHiddenContainer().find("#_" + uid);

        equals($richContent.length, 1, "found a rich item");

        equals($richContent.find("li").length, 3, "3 lines of source are highlighted");

        if($j(macroPre).offset() && $richContent.position()){
            near($richContent.position().top, $j(macroPre).offset().top, 3, "top offset is correct");
            near($richContent.position().left, $j(macroPre).offset().left, 3, "left offset is correct");
            near($richContent.width(), 1977, 10, "width is correct");
            near($richContent.height(), $j(macroPre).height(), 3, "height is correct");
        }else{
            ok(false, "can't calculate position :(");
        }

        start();
    }, 300);

    stop();
});


asyncTest("test select text to syntax highlight macro", function() {
    ed.setContent("<p>asfdklkj asdfklkasdfj lkasfj lkas jflkas faskdfj lasf lkas flkasjf klasj fklas fjkakls faklsdf lads aklj fklas fkl sdklja fklas fklas dfkl asf kals dfjlkasj flkas dfljasdf ksadfj lajksd fklasdj flkasdf jaslkdf laksdfj alksdf lkasdf lkas fjlkas jflkafs lksa l and awesome!</p><p>klasfj lkas flkas f</p><p>askldfj laksfj lkas jf</p>");

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 0);
    rng.setEnd(ed.getBody().childNodes[2], 1);
    ed.selection.setRng(rng);

    window.focus();
	ed.focus();
    ed.selectionUtil.normalizeSelection();

    // the following inserts a code macro
    fakeMouseEvent($j("a.mce_jivemacros").get(0), "click");
    fakeMouseEvent($j("td.mceMacroMenu a:first").get(0), "mouseover");
    fakeMouseEvent($j("span.mce_code_javascript").parent().get(0), "click");

    // make sure cursor is inside the <pre>
    equals(ed.selection.getNode().nodeName.toLowerCase(), "p", "cursor is in a <p>");

    var macroPre = ed.selection.getNode().parentNode;
    equals(macroPre.nodeName.toLowerCase(), "pre", "cursor is in a <pre>");

    ok($j(macroPre).hasClass("jive_text_macro"), "has a jive_text_macro classname");
    ok($j(macroPre).hasClass("jive_macro_code"), "has a jive_macro_code classname");

    setTimeout(function(){
        var m = macroPre.className.match(/_jivemacro_uid_(\d+)/);
        equals(m.length, 2, "correctly matched uid");
        var uid = m[1];

        // find a div in the popunder that matches the uid
        var rte = ed.plugins.jivemacros.rte;
        var $richContent = rte.getHiddenContainer().find("#_" + uid);

        equals($richContent.length, 1, "found a rich item");

        equals($richContent.find("li").length, 3, "3 lines of source are highlighted");

        if($j(macroPre).offset() && $richContent.position()){
            near($richContent.position().top, $j(macroPre).offset().top, 3, "top offset is correct");
            near($richContent.position().left, $j(macroPre).offset().left, 3, "left offset is correct");
            near($richContent.width(), 1977, 10, "width is correct");
            near($richContent.height(), $j(macroPre).height(), 3, "height is correct");
        }else{
            ok(false, "can't calculate position :(");
        }

        start();
    }, 300);

    stop();
});

asyncTest("two macros, each with unique id", function() {
    ed.setContent('');

    window.focus();
	ed.focus();
    ed.selectionUtil.normalizeSelection();

    // the following inserts a code macro
    fakeMouseEvent($j("a.mce_jivemacros").get(0), "click");
    fakeMouseEvent($j("td.mceMacroMenu a:first").get(0), "mouseover");
    fakeMouseEvent($j("span.mce_code_javascript").parent().get(0), "click");

    // make sure cursor is inside the <pre>
    equals(ed.selection.getNode().nodeName.toLowerCase(), "p", "cursor is in a <p>");

    var firstMacroPre = ed.selection.getNode().parentNode;
    equals(firstMacroPre.nodeName.toLowerCase(), "pre", "cursor is in a <pre>");

    var $p = $j(firstMacroPre).next();
    var rng = ed.dom.createRng();
	rng.setStart($p.get(0).firstChild, 0);
	rng.setEnd($p.get(0).firstChild, 0);
	ed.selection.setRng(rng);
    ed.selectionUtil.normalizeSelection();

    // the following inserts a code macro
    fakeMouseEvent($j("a.mce_jivemacros").get(0), "click");
    fakeMouseEvent($j("td.mceMacroMenu a:first").get(0), "mouseover");
    fakeMouseEvent($j("span.mce_code_javascript").parent().get(0), "click");

    var secondMacroPre = ed.selection.getNode().parentNode;
    equals(secondMacroPre.nodeName.toLowerCase(), "pre", "cursor is in a <pre> again");


    ok($j(firstMacroPre).hasClass("jive_text_macro"), "has a jive_text_macro classname");
    ok($j(firstMacroPre).hasClass("jive_macro_code"), "has a jive_macro_code classname");

    setTimeout(function(){
        var m = firstMacroPre.className.match(/_jivemacro_uid_(\d+)/);
        equals(m.length, 2, "correctly matched uid");
        var uid1 = m[1];

        m = secondMacroPre.className.match(/_jivemacro_uid_(\d+)/);
        equals(m.length, 2, "correctly matched uid");
        var uid2 = m[1];

        // find a div in the popunder that matches the uid
        var rte = ed.plugins.jivemacros.rte;
        var $richContent1 = rte.getHiddenContainer().find("#_" + uid1);
        var $richContent2 = rte.getHiddenContainer().find("#_" + uid2);

        equals($richContent1.length, 1, "found a rich item");
        equals($richContent2.length, 1, "found a rich item");

        ok(uid2 != uid1, "uids are not equal");

        if($j(firstMacroPre).offset() && $j(secondMacroPre).offset() && $richContent1.position() && $richContent2.position()){
            near($richContent1.position().top, $j(firstMacroPre).offset().top, 3, "top offset is correct");
            near($richContent1.position().left, $j(firstMacroPre).offset().left, 3, "left offset is correct");
            near($richContent1.width(), 1041, 3, "width is correct");
            near($richContent1.height(), $j(firstMacroPre).height(), 3, "height is correct");

            near($richContent2.position().top, $j(secondMacroPre).offset().top, 3, "top offset is correct");
            near($richContent2.position().left, $j(secondMacroPre).offset().left, 3, "left offset is correct");
            near($richContent2.width(), 1041, 3, "width is correct");
            near($richContent2.height(), $j(secondMacroPre).height(), 3, "height is correct");
        }else{
            ok(false, "can't calculate position :(");
        }

        start();
    }, 300);

    stop();
});




asyncTest("two macros with duplicate ids, deduplicated", function() {
    ed.setContent('<body><pre class="jive_text_macro jive_macro_code _jivemacro_uid_1305580994948554" jivemacro="code" _jivemacro_uid="_1305580994948554" ___default_attr="javascript"><p> </p></pre>\n<p> </p>\n<pre class="jive_text_macro jive_macro_code _jivemacro_uid_1305580994948554" jivemacro="code" _jivemacro_uid="_1305580994948554" ___default_attr="javascript"><p> </p></pre>\n<p> </p></body>');

    window.focus();
	ed.focus();
    ed.selectionUtil.normalizeSelection();

    var firstMacroPre = $j(ed.getBody()).find("pre:first").get(0);
    var secondMacroPre = $j(ed.getBody()).find("pre:last").get(0);

    var m = firstMacroPre.className.match(/_jivemacro_uid_(\d+)/);
    equals(m.length, 2, "correctly matched uid");
    var uid1 = m[1];

    m = secondMacroPre.className.match(/_jivemacro_uid_(\d+)/);
    equals(m.length, 2, "correctly matched uid");
    var uid2 = m[1];
    ok(uid2 == uid1, "uids are equal :(");


    // the following inserts a code macro
    fakeMouseEvent(ed.getBody().firstChild, "click");

    // make sure cursor is inside the <p>

    setTimeout(function(){
        var m = firstMacroPre.className.match(/_jivemacro_uid_(\d+)/);
        equals(m.length, 2, "correctly matched uid");
        var uid1 = m[1];

        m = secondMacroPre.className.match(/_jivemacro_uid_(\d+)/);
        equals(m.length, 2, "correctly matched uid");
        var uid2 = m[1];

        // find a div in the popunder that matches the uid
        var rte = ed.plugins.jivemacros.rte;
        var $richContent1 = rte.getHiddenContainer().find("#_" + uid1);
        var $richContent2 = rte.getHiddenContainer().find("#_" + uid2);

        equals($richContent1.length, 1, "found a rich item");
        equals($richContent2.length, 1, "found a rich item");

        ok(uid2 != uid1, "uids are not equal");

        if($j(firstMacroPre).offset() && $j(secondMacroPre).offset() && $richContent1.position() && $richContent2.position()){
            near($richContent1.position().top, $j(firstMacroPre).offset().top, 3, "top offset is correct");
            near($richContent1.position().left, $j(firstMacroPre).offset().left, 3, "left offset is correct");
            near($richContent1.width(), 1041, 3, "width is correct");
            near($richContent1.height(), $j(firstMacroPre).height(), 3, "height is correct");

            near($richContent2.position().top, $j(secondMacroPre).offset().top, 3, "top offset is correct");
            near($richContent2.position().left, $j(secondMacroPre).offset().left, 3, "left offset is correct");
            near($richContent2.width(), 1041, 3, "width is correct");
            near($richContent2.height(), $j(secondMacroPre).height(), 3, "height is correct");
        }else{
            ok(false, "can't calculate position :(");
        }

        start();
    }, 300);

    stop();
});
