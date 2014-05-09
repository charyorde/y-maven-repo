/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
module("Jive Style Plugin", {
	autostart: false
});


test("CS-23266 table formatting header in far left cell", function() {
    var rte = editor.get("wysiwygtext");
	ed.setContent('<body><table width="200" height="200"><tr><td>asdf</td><td></td></tr><tr><td></td><td>asdf</td></tr></table></body>');

	var first = $j(ed.getBody()).find("table td:nth(0)").get(0).firstChild;

    var rng = ed.dom.createRng();
    rng.setStart(first, 4);
    rng.setEnd(first, 4);
    ed.selection.setRng(rng);

    ed.nodeChanged();

    ed.execCommand("mceJiveStyleHeader1");

    equals($j(ed.getBody()).find("table td:nth(0)").get(0).childNodes.length, 1, "td has 1 child");

});

test("JIVE-508 fixed header format in IE", function() {
    var rte = editor.get("wysiwygtext");
	ed.setContent('<body><h2><span>asdf</span></h2></body>');

	var first = $j(ed.getBody()).find("h2 span").get(0).firstChild;

    var rng = ed.dom.createRng();
    rng.setStart(first, 4);
    rng.setEnd(first, 4);
    ed.selection.setRng(rng);

    ed.nodeChanged();

    ed.execCommand("FormatBlock",false,"h1");

    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<h1><span>asdf</span></h1>');

});

test("formatblock h1 in table default tinymce 2", function(){
    ed.setContent('<table><tbody><tr><td></td><td>asdfasdf</td></tr></tbody></table><p>asdf</p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.firstChild.firstChild.firstChild;
    rng.setStart(testItem, 0);
    rng.setEnd(testItem, 0);
    ed.selection.setRng(rng);

    ed.execCommand("FormatBlock",false,"h1");

    checkContent(ed, '<table><tbody><tr><td><h1></h1></td><td>asdfasdf</td></tr></tbody></table><p>asdf</p>');
});


test("formatblock h1 in table default tinymce 2", function(){
    ed.setContent('<table><tbody><tr><td>someatextain a TD</td><td>asdfasdf</td></tr></tbody></table><p>asdf</p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.firstChild.firstChild.firstChild;
    rng.setStart(testItem.firstChild, 5);
    rng.setEnd(testItem.firstChild, 5);
    ed.selection.setRng(rng);

    ed.execCommand("FormatBlock",false,"h1");

    checkContent(ed, '<table><tbody><tr><td><h1>someatextain a TD</h1></td><td>asdfasdf</td></tr></tbody></table><p>asdf</p>');
});
