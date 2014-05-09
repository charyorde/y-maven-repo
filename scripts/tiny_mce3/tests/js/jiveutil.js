/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
module("Jive Utility Plugin", {
	autostart: false
});

test('Formatter - remove format around link 2', function() {
	var rng;

	rng = ed.dom.createRng();
	ed.getBody().innerHTML = '<p><span style="font-size: 18pt;">asdf <a class="jive_macro default_title jive_macro_user _jivemacro_uid_13056727656977177" href="javascript:;" jivemacro="user" _jivemacro_uid="_13056727656977177" ___default_attr="2001">Mr User 2</a><span> asdf</span></span></p>';
	rng.setStart(ed.dom.select('p')[0], 0);
	rng.setEnd(ed.dom.select('p')[0], 1);
	ed.selection.setRng(rng);
    ed.execCommand("mceRemoveFullFormat");
	equals(ed.getContent(), '<p>asdf <a href="javascript:;" jivemacro="user" _jivemacro_uid="_13056727656977177" ___default_attr="2001" data-orig-content="Mr User 2">Mr User 2</a> asdf</p>');
	equals(ed.selection.getStart().nodeName, 'P');
});

test('Formatter - remove format around link 3', function() {
	var rng;

	rng = ed.dom.createRng();
	ed.getBody().innerHTML = '<p><span style="font-size: 18pt;">asdf <a class="jive_macro default_title jive_macro_user _jivemacro_uid_13056727656977177" href="javascript:;" jivemacro="user" _jivemacro_uid="_13056727656977177" ___default_attr="2001">Mr User 2</a><span> asdf</span></span></p>';
	rng.setStart(ed.getBody(), 0);
	rng.setEnd(ed.getBody(), 1);
	ed.selection.setRng(rng);
    ed.execCommand("mceRemoveFullFormat");
	equals(ed.getContent(), '<p>asdf <a href="javascript:;" jivemacro="user" _jivemacro_uid="_13056727656977177" ___default_attr="2001" data-orig-content="Mr User 2">Mr User 2</a> asdf</p>');
	equals(ed.selection.getStart().nodeName, 'P');
});

test('Formatter - remove format around link 4', function() {
	var rng;

	rng = ed.dom.createRng();
	ed.getBody().innerHTML = '<p><span style="font-size: 18pt;">asdf <a class="jive_macro default_title jive_macro_user _jivemacro_uid_13056727656977177" href="javascript:;" jivemacro="user" _jivemacro_uid="_13056727656977177" ___default_attr="2001" data-orig-content="Mr User 2">Mr User 2</a><span> asdf</span></span></p>';
	rng.setStart($j(ed.getBody()).find("span:first").get(0), 0);
	rng.setEnd($j(ed.getBody()).find("span:first").get(0), 3);
	ed.selection.setRng(rng);
    ed.execCommand("mceRemoveFullFormat");
	equals(ed.getContent(), '<p>asdf <a href="javascript:;" jivemacro="user" _jivemacro_uid="_13056727656977177" ___default_attr="2001" data-orig-content="Mr User 2">Mr User 2</a> asdf</p>');
	equals(ed.selection.getStart().nodeName, 'P');
});

asyncTest('Formatter - remove format around link 5', function() {
	var rng;

	rng = ed.dom.createRng();
	ed.getBody().innerHTML = '<p><span style="font-size: 18pt;">asdf <a class="jive_macro default_title jive_macro_user _jivemacro_uid_13056727656977177" href="javascript:;" jivemacro="user" _jivemacro_uid="_13056727656977177" ___default_attr="2001" data-orig-content="Mr User 2">Mr User 2</a><span> asdf</span></span></p>';
    ed.nodeChanged();
    setTimeout(function(){
        rng.setStart($j(ed.getBody()).find("a:first").get(0), 0);
        rng.setEnd($j(ed.getBody()).find("a:first").get(0), 1);
        ed.selection.setRng(rng);
        ed.execCommand("mceRemoveFullFormat");
        equals(ed.getContent(), '<p><span style="font-size: 18pt;">asdf </span><a href="javascript:;" jivemacro="user" _jivemacro_uid="_13056727656977177" ___default_attr="2001" data-orig-content="Mr User 2">Mr User 2</a><span style="font-size: 18pt;"><span> asdf</span></span></p>');
        equals(ed.selection.getStart().nodeName, 'A');
        start();
    },300);
    stop();
});

test('Formatter - remove format around link 6', function() {
	var rng;

	rng = ed.dom.createRng();
	ed.getBody().innerHTML = '<p><span style="font-size: 18pt;">asdf <a class="jive_macro default_title jive_macro_user _jivemacro_uid_13056727656977177" href="javascript:;" jivemacro="user" _jivemacro_uid="_13056727656977177" ___default_attr="2001">Mr User 2</a><span> asdf</span></span></p>';
	rng.setStart($j(ed.getBody()).find("span:first").get(0), 1);
	rng.setEnd($j(ed.getBody()).find("span:first").get(0), 2);
	ed.selection.setRng(rng);
    ed.execCommand("mceRemoveFullFormat");
	equals(ed.getContent(), '<p><span style="font-size: 18pt;">asdf </span><a href="javascript:;" jivemacro="user" _jivemacro_uid="_13056727656977177" ___default_attr="2001" data-orig-content="Mr User 2">Mr User 2</a><span style="font-size: 18pt;"><span> asdf</span></span></p>');
	equals(ed.selection.getStart().nodeName, 'A');
});

test('Formatter - remove format around link 7', function() {
	var rng;

	rng = ed.dom.createRng();
	ed.getBody().innerHTML = '<p><span style="font-size: 18pt;">asdf <a class="jive_macro default_title jive_macro_user _jivemacro_uid_13056727656977177" href="javascript:;" jivemacro="user" _jivemacro_uid="_13056727656977177" ___default_attr="2001">Mr User 2</a><span> asdf</span></span></p>';
	rng.setStart($j(ed.getBody()).find("a:first").get(0).firstChild, 0);
	rng.setEnd($j(ed.getBody()).find("a:first").get(0).firstChild, 9);
	ed.selection.setRng(rng);
    ed.execCommand("mceRemoveFullFormat");
	equals(ed.getContent(), '<p><span style="font-size: 18pt;">asdf </span><a href="javascript:;" jivemacro="user" _jivemacro_uid="_13056727656977177" ___default_attr="2001" data-orig-content="Mr User 2">Mr User 2</a><span style="font-size: 18pt;"><span> asdf</span></span></p>');
	equals(ed.selection.getStart().nodeName, 'A');
});

test("allow encoding for normal text", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});

	var first = ed.getBody().firstChild.firstChild;
	var second = ed.getDoc().createTextNode("@second ");
	var third = ed.getDoc().createTextNode("third");

	ed.getBody().firstChild.appendChild(second);
	ed.getBody().firstChild.appendChild(third);

	equals(ed.plugins.jiveutil.shouldEncodeHuh(ed, second), true, "text node is encodable");

	equals(ed.getContent(), '<p>first @second third</p>');
});



test("allow encoding for most macros", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});

	var first = ed.getBody().firstChild.firstChild;
    var link = ed.getDoc().createElement("a");
    link.setAttribute("jivemacro", "document");
	var second = ed.getDoc().createTextNode("link text");
	link.appendChild(second);

    $j(ed.getBody()).find("br").remove();

	ed.getBody().firstChild.appendChild(link);

    equals(ed.plugins.jiveutil.shouldEncodeHuh(ed, link), true, "link node is a macro");
    equals(ed.plugins.jiveutil.shouldEncodeHuh(ed, second), true, "link text is in a macro");

	equals(ed.getContent(), '<p>first <a jivemacro="document">link text</a></p>\n<p></p>');
});


test("allow encoding for non existent macros", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});

	var first = ed.getBody().firstChild.firstChild;
    var link = ed.getDoc().createElement("a");
    link.setAttribute("jivemacro", "foothebar");
	var second = ed.getDoc().createTextNode("link text");
	link.appendChild(second);

    $j(ed.getBody()).find("br").remove();

	ed.getBody().firstChild.appendChild(link);

    equals(ed.plugins.jiveutil.shouldEncodeHuh(ed, link), true, "link node is a macro");
    equals(ed.plugins.jiveutil.shouldEncodeHuh(ed, second), true, "link text is in a macro");

	equals(ed.getContent(), '<p>first <a jivemacro="foothebar">link text</a></p>\n<p></p>');
});


test("DON'T allow encoding for code macros", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});

	var first = ed.getBody().firstChild.firstChild;
    var pre = ed.getDoc().createElement("pre");
    pre.setAttribute("jivemacro", "code");
	var second = ed.getDoc().createTextNode("pre text");
	pre.appendChild(second);

    $j(ed.getBody()).find("br").remove();

	ed.getBody().appendChild(pre);

    equals(ed.plugins.jiveutil.shouldEncodeHuh(ed, pre), false, "pre node is a macro");
    equals(ed.plugins.jiveutil.shouldEncodeHuh(ed, second), false, "pre text is in a macro");

	equals(ed.getContent(), '<p>first</p>\n<pre jivemacro="code">pre text</pre>\n<p></p>', "correct document");
});


test("don't trim text inside inline", function() {
	ed.setContent('<p><span>first </span><span>second </span></p>');
	equals(ed.getContent(), '<p><span>first </span><span>second </span></p>');

    ed.setContent('<p><span> first</span><span> second</span></p>', {format: 'raw'});
    equals(ed.getContent(), '<p><span> first</span><span> second</span></p>');

    ed.setContent('<p><span> first </span><span> second </span></p>', {format: 'raw'});
    equals(ed.getContent(), '<p><span> first </span><span> second </span></p>');
});



test("test walking through kids", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});


    var first = ed.getBody().firstChild.firstChild;
    var code = ed.getDoc().createElement("pre");
    code.setAttribute("jivemacro", "code");
    var second = ed.getDoc().createTextNode("link text");
    code.appendChild(second);
    var third = ed.getDoc().createTextNode("link text");
    code.appendChild(third);

    $j(ed.getBody()).find("br").remove();

    ed.getBody().appendChild(code);
    var fourth = ed.getDoc().createElement("p");
    ed.getBody().appendChild(fourth);

    var visitMe = [code, second, third];
    var counter = 0;

    ed.plugins.jiveutil.walkDOMTreeKids(code, first, function(n){
        equals(n, visitMe[counter], "found expected node");
        counter++;
    });
    equals(counter, visitMe.length, "visited all nodes");

    equals(ed.getContent(), '<p>first</p>\n<pre jivemacro="code">link textlink text</pre>\n<p></p>');
});



test("test walking through kids", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});


    var first = ed.getBody().firstChild.firstChild;
    var code = ed.getDoc().createElement("pre");
    code.setAttribute("jivemacro", "code");
    var second = ed.getDoc().createTextNode("link text");
    code.appendChild(second);
    var third = ed.getDoc().createTextNode("link text");
    code.appendChild(third);

    $j(ed.getBody()).find("br").remove();

    ed.getBody().appendChild(code);
    var fourth = ed.getDoc().createElement("p");
    ed.getBody().appendChild(fourth);

    var visitMe = [code, second];
    var counter = 0;

    ed.plugins.jiveutil.walkDOMTreeKids(code, second, function(n){
        equals(n, visitMe[counter], "found expected node");
        counter++;
    });
    equals(counter, visitMe.length, "visited all nodes");

    equals(ed.getContent(), '<p>first</p>\n<pre jivemacro="code">link textlink text</pre>\n<p></p>');
});


test("test walking through tree", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});


    var first = ed.getBody().firstChild.firstChild;
    var code = ed.getDoc().createElement("pre");
    code.setAttribute("jivemacro", "code");
    var second = ed.getDoc().createTextNode("link text");
    code.appendChild(second);
    var third = ed.getDoc().createTextNode("link text");
    code.appendChild(third);

    $j(ed.getBody()).find("br").remove();

    ed.getBody().appendChild(code);
    var fourth = ed.getDoc().createElement("p");
    ed.getBody().appendChild(fourth);

    var visitMe = [code, second, third, fourth];
    var counter = 0;

    ed.plugins.jiveutil.walkDOMTree(code, fourth, function(n){
        equals(n, visitMe[counter], "found expected node");
        counter++;
    });
    equals(counter, visitMe.length, "visited all nodes");

    equals(ed.getContent(), '<p>first</p>\n<pre jivemacro="code">link textlink text</pre>\n<p></p>');
});


test("test walking through tree", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});


    var first = ed.getBody().firstChild.firstChild;
    var code = ed.getDoc().createElement("pre");
    code.setAttribute("jivemacro", "code");
    var second = ed.getDoc().createTextNode("link text");
    code.appendChild(second);
    var third = ed.getDoc().createTextNode("link text");
    code.appendChild(third);

    $j(ed.getBody()).find("br").remove();

    ed.getBody().appendChild(code);
    var fourth = ed.getDoc().createElement("p");
    ed.getBody().appendChild(fourth);

    var visitMe = [second, third, fourth];
    var counter = 0;

    ed.plugins.jiveutil.walkDOMTree(second, fourth, function(n){
        equals(n, visitMe[counter], "found expected node");
        counter++;
    });
    equals(counter, visitMe.length, "visited all nodes");

    equals(ed.getContent(), '<p>first</p>\n<pre jivemacro="code">link textlink text</pre>\n<p></p>');
});


test("test walking through tree", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});


    var first = ed.getBody().firstChild.firstChild;
    var code = ed.getDoc().createElement("pre");
    code.setAttribute("jivemacro", "code");
    var second = ed.getDoc().createTextNode("link text");
    code.appendChild(second);
    var third = ed.getDoc().createTextNode("link text");
    code.appendChild(third);

    $j(ed.getBody()).find("br").remove();

    ed.getBody().appendChild(code);
    var fourth = ed.getDoc().createElement("p");
    ed.getBody().appendChild(fourth);

    var visitMe = [first, code, second, third, fourth];
    var counter = 0;

    ed.plugins.jiveutil.walkDOMTree(first, fourth, function(n){
        equals(n, visitMe[counter], "found expected node");
        counter++;
    });
    equals(counter, visitMe.length, "visited all nodes");

    equals(ed.getContent(), '<p>first</p>\n<pre jivemacro="code">link textlink text</pre>\n<p></p>');
});


test("test walking through tree", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});


    var p = ed.getBody().firstChild;
    var first = ed.getBody().firstChild.firstChild;
    var code = ed.getDoc().createElement("pre");
    code.setAttribute("jivemacro", "code");
    var second = ed.getDoc().createTextNode("link text");
    code.appendChild(second);
    var third = ed.getDoc().createTextNode("link text");
    code.appendChild(third);

    $j(ed.getBody()).find("br").remove();

    ed.getBody().appendChild(code);
    var fourth = ed.getDoc().createElement("p");
    ed.getBody().appendChild(fourth);

    var visitMe = [p, first, code, second, third, fourth];
    var counter = 0;

    ed.plugins.jiveutil.walkDOMTree(p, fourth, function(n){
        equals(n, visitMe[counter], "found expected node");
        counter++;
    });
    equals(counter, visitMe.length, "visited all nodes");

    equals(ed.getContent(), '<p>first</p>\n<pre jivemacro="code">link textlink text</pre>\n<p></p>');
});


test("test getting length of text", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});


    var p = ed.getBody().firstChild;
    var first = ed.getBody().firstChild.firstChild;
    var second = ed.getDoc().createTextNode("link text");
    var third = ed.getDoc().createTextNode("foothebar");

    $j(ed.getBody()).find("br").remove();
    p.appendChild(second);
    p.appendChild(third);

    equals(ed.plugins.jiveutil.textLengthIn(p), 24, "found all text");

    equals(ed.getContent(), '<p>first link textfoothebar</p>');
});


test("test getting length of text", function() {
	ed.setContent('<p>first <span>foothebar</span></p>');

    var p = ed.getBody().firstChild;
    var b = $j(ed.getBody()).find("span").get(0);
    $j(ed.getBody()).find("br").remove();

    equals(ed.plugins.jiveutil.getNodeAt(ed.getBody().firstChild, 0), p, "found correct node");
    equals(ed.plugins.jiveutil.getNodeAt(ed.getBody().firstChild, 5), p, "found correct node");
    equals(ed.plugins.jiveutil.getNodeAt(ed.getBody().firstChild, 6), b, "found correct node");
    equals(ed.plugins.jiveutil.getNodeAt(ed.getBody().firstChild, 7), b, "found correct node");
    equals(ed.plugins.jiveutil.getNodeAt(ed.getBody().firstChild, 14), b, "found correct node");
    equals(ed.plugins.jiveutil.getNodeAt(ed.getBody().firstChild, 15), null, "found correct node");
    equals(ed.plugins.jiveutil.getNodeAt(ed.getBody().firstChild, 16), null, "found correct node");

    equals(ed.getContent(), '<p>first <span>foothebar</span></p>');
});


test("test getting column nodes", function() {
	ed.setContent('<table><tr><td>asdf</td><td><table><tr><td>asdf</td><td>qwer</td></tr><tr><td>asdf</td><td>qwer</td></tr><tr><td>asdf</td><td>qwer</td></tr></table></td></tr><tr><td>asdf</td><td>qwer</td></tr></table>');

    var p = ed.getBody().firstChild;

    var $td = $j(ed.getBody()).find("table table td:first");

    var $bounds = ed.plugins.jiveutil.findColumnBoundsForCell($td);

    equals($bounds.length, 3, "found all cells in column");
    equals($j(ed.getBody()).find("table table tr:nth(0) td:nth(0)").get(0), $bounds.get(0), "correct cell");
    equals($j(ed.getBody()).find("table table tr:nth(1) td:nth(0)").get(0), $bounds.get(1), "correct cell");
    equals($j(ed.getBody()).find("table table tr:nth(2) td:nth(0)").get(0), $bounds.get(2), "correct cell");

});
