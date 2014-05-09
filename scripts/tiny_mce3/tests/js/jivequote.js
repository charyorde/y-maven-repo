/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
module("Jive Quote Plugin", {
	autostart: false
});

test("insert empty quote", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 6);
    rng.setEnd(ed.getBody().firstChild.firstChild, 6);
    ed.selection.setRng(rng);


    window._jive_gui_quote_text = false;

    ed.execCommand("mceJiveQuote");


	equals(ed.getContent(), '<p>first</p>\n<pre class=\"jive_text_macro jive_macro_quote\" jivemacro=\"quote\">\n<p></p>\n</pre>\n<p></p>');
});

test("quote previous message", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 6);
    rng.setEnd(ed.getBody().firstChild.firstChild, 6);
    ed.selection.setRng(rng);

    window._jive_gui_quote_text = "<pre><p>awesome!</p></pre>";
    ed.execCommand("mceJiveQuote");


	equals(ed.getContent(), '<p>first</p>\n<pre class=\"jive_text_macro jive_macro_quote\" jivemacro=\"quote\">awesome!</pre>\n<p></p>');
});

test("quote selection", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 3);
    rng.setEnd(ed.getBody().firstChild.firstChild, 4);
    ed.selection.setRng(rng);

    window._jive_gui_quote_text = false;
    ed.execCommand("mceJiveQuote");


	equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>fir</p><pre class=\"jive_text_macro jive_macro_quote\" jivemacro=\"quote\"><p>s</p></pre><p>t </p>');
});

test("Backspace at front of quote.", function() {
	ed.setContent('<pre class=\"jive_text_macro jive_macro_quote\" jivemacro=\"quote\"><p>first</p></pre>', {format: 'raw'});

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 0);
    rng.collapse(true);
    ed.selection.setRng(rng);

    type(ed, 8);

	checkContent(ed, '<p>first</p>', "content");
});
