/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
module("Jive List Plugin", {
	autostart: false
});

test("set bulletted list with empty bullet", function() {
    ed.setContent('<ul><li>foo</li><li></li></ul>');

	var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.lastChild;
	rng.setStart(testItem, 0);
    rng.collapse(true);
	ed.selection.setRng(rng);

    ed.selectionUtil.normalizeSelection();

    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>foo</li><li></li></ul>');
});

if(tinymce.isGecko) test("test pressing enter", function() {
	ed.setContent('<p>first</p>');

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 5);
    rng.setEnd(ed.getBody().firstChild.firstChild, 5);
    ed.selection.setRng(rng);

    type(ed, 13);
    type(ed, 13);

    ed.selection.setContent('a');
    ed.selection.setContent('b');

    ed.execCommand('mceIndent');

    ed.selection.setContent('c');
    ed.selection.setContent('d');

    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>first</p><p> </p><p style=\"padding-left: 30px;\">abcd</p>');


    ed.execCommand('mceOutdent');

    ed.selection.setContent('e');
    ed.selection.setContent('f');

	equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>first</p><p> </p><p>abcdef</p>');
});

if(tinymce.isGecko) test("exit list pressing enter", function() {
	ed.setContent('<p>first</p>');

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 5);
    rng.setEnd(ed.getBody().firstChild.firstChild, 5);
    ed.selection.setRng(rng);

    ed.execCommand('jiveInsertUnorderedList');
    type(ed, 13);
    ed.selection.setContent('a');
    ed.selection.setContent('b');
    type(ed, 13);
    type(ed, 13);
    ed.selection.setContent('c');
    ed.selection.setContent('d');


	equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li><li>ab</li></ul><p>cd</p>');
});

if(tinymce.isGecko) test("exit empty list item with outdent", function() {
	ed.setContent('<p>first</p>');

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 5);
    rng.setEnd(ed.getBody().firstChild.firstChild, 5);
    ed.selection.setRng(rng);

    ed.execCommand('jiveInsertUnorderedList');
    type(ed, 13);
    ed.selection.setContent('a');
    ed.selection.setContent('b');
    type(ed, 13);
    ed.execCommand('mceOutdent');
    ed.selection.setContent('a');
    ed.selection.setContent('b');


	equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li><li>ab</li></ul><p>ab</p>');
});

if(tinymce.isGecko) test("exit full list item with outdent", function() {
	ed.setContent('<p>first</p>');

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 5);
    rng.setEnd(ed.getBody().firstChild.firstChild, 5);
    ed.selection.setRng(rng);

    ed.execCommand('jiveInsertUnorderedList');
    type(ed, 13);
    ed.selection.setContent('a');
    ed.selection.setContent('b');
    ed.execCommand('mceOutdent');
    ed.selection.setContent('c');
    ed.selection.setContent('d');


	equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li></ul><p>abcd</p>');
});

if(tinymce.isGecko) test("exit full list item with outdent", function() {
	ed.setContent('<p>first</p>');

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 5);
    rng.setEnd(ed.getBody().firstChild.firstChild, 5);
    ed.selection.setRng(rng);

    ed.execCommand('jiveInsertUnorderedList');
    type(ed, 13);
    ed.selection.setContent('a');
    ed.selection.setContent('b');
    ed.execCommand('mceOutdent');
    ed.selection.setContent('c');
    ed.selection.setContent('d');


	equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li></ul><p>abcd</p>');
});

test("outdent a list if list button of same type is clicked 1", function(){
    ed.setContent('<ul><li>1234</li><li>1234</li></ul>');

    var container = ed.getBody().firstChild.firstChild;

    var rng = ed.dom.createRng();
    rng.setStart(container.firstChild, 4);
    rng.setEnd(container.firstChild, 4);
    ed.selection.setRng(rng);

    ed.execCommand("mceInsertUnorderedList");

    checkContent(ed, '<p>1234</p><ul><li>1234</li></ul>');
});

test("outdent a list if list button of same type is clicked 2", function(){
    ed.setContent('<ol><li>1234</li><li>1234</li></ol>');

    var container = ed.getBody().firstChild.firstChild;

    var rng = ed.dom.createRng();
    rng.setStart(container.firstChild, 4);
    rng.setEnd(container.firstChild, 4);
    ed.selection.setRng(rng);

    ed.execCommand("mceInsertOrderedList");

    checkContent(ed, '<p>1234</p><ol><li>1234</li></ol>');
});

test("outdent a list if list button of other type is clicked 1", function(){
    ed.setContent('<ol><li>1234</li><li>1234</li></ol>');

    var container = ed.getBody().firstChild.firstChild;

    var rng = ed.dom.createRng();
    rng.setStart(container.firstChild, 4);
    rng.setEnd(container.firstChild, 4);
    ed.selection.setRng(rng);

    ed.execCommand("mceInsertUnorderedList");

    checkContent(ed, '<ul><li>1234</li><li>1234</li></ul>');
});

test("outdent a list if list button of other type is clicked 2", function(){
    ed.setContent('<ul><li>1234</li><li>1234</li></ul>');

    var container = ed.getBody().firstChild.firstChild;

    var rng = ed.dom.createRng();
    rng.setStart(container.firstChild, 4);
    rng.setEnd(container.firstChild, 4);
    ed.selection.setRng(rng);

    ed.execCommand("mceInsertOrderedList");

    checkContent(ed, '<ol><li>1234</li><li>1234</li></ol>');
});

test("create list and retain alignment", function(){
    ed.setContent('<p style="text-align: center">1234</p>');

    var container = ed.getBody().firstChild;

    var rng = ed.dom.createRng();
    rng.setStart(container.firstChild, 4);
    rng.setEnd(container.firstChild, 4);
    ed.selection.setRng(rng);

    ed.execCommand("mceInsertOrderedList");

    checkContent(ed, '<ol><li style="text-align: center;">1234</li></ol>');
});

test("outdent list and retain alignment", function(){
    ed.setContent('<ol><li style="text-align: center;">1234</li></ol>');

    var container = ed.getBody().firstChild.firstChild;

    var rng = ed.dom.createRng();
    rng.setStart(container.firstChild, 4);
    rng.setEnd(container.firstChild, 4);
    ed.selection.setRng(rng);

    ed.execCommand("mceInsertOrderedList");

    checkContent(ed, '<p style="text-align: center;">1234</p>');
});

test("outdent a list if list button of other type is clicked 3", function(){
    ed.setContent('<ol><li>1234</li><li>1234</li></ol>');

    var container = ed.getBody().firstChild;

    var rng = ed.dom.createRng();
    rng.setStart(container, 0);
    rng.setEnd(container, 2);
    ed.selection.setRng(rng);

    ed.execCommand("mceInsertUnorderedList");

    checkContent(ed, '<ul><li>1234</li><li>1234</li></ul>');
});

test("outdent a list if list button of other type is clicked 4", function(){
    ed.setContent('<ol><li>1234</li><li>1234</li></ol>');

    var container = ed.getBody().firstChild;

    var rng = ed.dom.createRng();
    rng.setStart(container.firstChild, 1);
    rng.setEnd(container.firstChild.nextSibling, 1);
    ed.selection.setRng(rng);

    ed.execCommand("mceInsertUnorderedList");

    checkContent(ed, '<ul><li>1234</li><li>1234</li></ul>');
});

test("changing list types on an indented list", function(){
    ed.setContent('<ul><li>asdf</li><ul><ul><ul><ul><ul><li>asdf</li></ul></ul></ul></ul></ul><li>sadf</li></ul>');

    var container = $j(ed.getBody()).find("li:eq(1)").get(0);

    var rng = ed.dom.createRng();
    rng.setStart(container.firstChild, 4);
    rng.setEnd(container.firstChild, 4);
    ed.selection.setRng(rng);

    ed.execCommand("mceInsertOrderedList");

    checkContent(ed, '<ul><li>asdf</li><ul><ul><ul><ul><ol><li>asdf</li></ol></ul></ul></ul></ul><li>sadf</li></ul>');

    ed.execCommand("mceInsertUnorderedList");

    checkContent(ed, '<ul><li>asdf</li><ul><ul><ul><ul><ul><li>asdf</li></ul></ul></ul></ul></ul><li>sadf</li></ul>');
});

test("cleanup list with P parent wrapped in text", function() {
	ed.setContent('<p>asdf<ul><li>asdf</li></ul>qwer</p>');

    var rng = ed.dom.createRng();
    rng.setStart($j(ed.getBody()).find("ul li").get(0).firstChild, 2);
    rng.setEnd($j(ed.getBody()).find("ul li").get(0).firstChild, 2);
    ed.selection.setRng(rng);

    ed.nodeChanged();



    equals($j(ed.getBody()).find("ul").prev("p").text(), 'asdf');
    equals($j(ed.getBody()).find("ul").next("p").text(), 'qwer');
    ok($j(ed.getBody()).find("ul").parent().is("body"), 'ul is child of body');
    ok($j(ed.getBody()).find("ul").prev().is("p"), 'ul previous sibling is p');
    ok($j(ed.getBody()).find("ul").next().is("p"), 'ul next sibling is p');
});


test("cleanup list with P parent and text after", function() {
	ed.setContent('<p><ul><li>asdf</li></ul>qwer</p>');

    var rng = ed.dom.createRng();
    rng.setStart($j(ed.getBody()).find("ul li").get(0).firstChild, 2);
    rng.setEnd($j(ed.getBody()).find("ul li").get(0).firstChild, 2);
    ed.selection.setRng(rng);

    ed.nodeChanged();

    equals($j(ed.getBody()).find("ul").next("p").text(), 'qwer');
    ok($j(ed.getBody()).find("ul").parent().is("body"), 'ul is child of body');
    ok($j(ed.getBody()).find("ul").next().is("p"), 'ul next sibling is p');
});



test("cleanup list with P parent and no text", function() {
	ed.setContent('<p><ul><li>asdf</li></ul></p>');

    var rng = ed.dom.createRng();
    rng.setStart($j(ed.getBody()).find("ul li").get(0).firstChild, 2);
    rng.setEnd($j(ed.getBody()).find("ul li").get(0).firstChild, 2);
    ed.selection.setRng(rng);

    ed.nodeChanged();

    equals($j(ed.getBody()).find("p:first").text(), '');
    ok($j(ed.getBody()).find("ul").parent().is("body"), 'ul is child of body');
});

if(!tinymce.isIE) test("exit empty list with backspace", function() {
	ed.setContent('<p>first</p><p></p>');

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().childNodes[1].firstChild, 0);
    rng.setEnd(ed.getBody().childNodes[1].firstChild, 0);
    ed.selection.setRng(rng);

    ed.execCommand('jiveInsertUnorderedList');
    type(ed, 8);


	equal(ed.getContent({format: 'raw'}).replace(/[\r\n]+|<br *\/?>/g, ''), '<p>first</p><p></p>');
});

test("outdent on backspace, first list item, top-level list", function() {
	ed.setContent('<ul><li>first</li><li>second</li><li>third</li></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.childNodes[0].firstChild;
    rng.setStart(testItem, 0);
    rng.setEnd(testItem, 0);
    ed.selection.setRng(rng);

    type(ed, 8);

	equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>first</p><ul><li>second</li><li>third</li></ul>');
});

test("outdent on backspace, middle list item, top-level list", function() {
	ed.setContent('<ul><li>first</li><li>second</li><li>third</li></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.childNodes[1].firstChild;
    rng.setStart(testItem, 0);
    rng.setEnd(testItem, 0);
    ed.selection.setRng(rng);

    type(ed, 8);

    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li></ul><p>second</p><ul><li>third</li></ul>');
});

test("outdent on backspace, last list item, top-level list", function() {
	ed.setContent('<ul><li>first</li><li>second</li><li>third</li></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.childNodes[2].firstChild;
    rng.setStart(testItem, 0);
    rng.setEnd(testItem, 0);
    ed.selection.setRng(rng);

    type(ed, 8);

    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li><li>second</li></ul><p>third</p>');
});

if(!tinymce.isIE){
    test("outdent on backspace, last list item (empty), top-level list", function() {
        ed.setContent('<ul><li>first</li><li>second</li><li></li></ul><p>end para</p>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.childNodes[2];
        rng.setStart(testItem, 0);
        rng.setEnd(testItem, 0);
        ed.selection.setRng(rng);

        type(ed, 8);

        equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li><li>second</li></ul><p></p><p>end para</p>');

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(ed.getBody().lastChild.previousSibling, 0);
        expectedRng.collapse(true);
        rangeEqual(ed.selection.getRng(true), expectedRng);
    });
}

test("outdent on backspace, first list item, nested list", function() {
	ed.setContent('<ul><li>top item</li><ul><li>first</li><li>second</li><li>third</li></ul></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.childNodes[1].childNodes[0].firstChild;
    rng.setStart(testItem, 0);
    rng.setEnd(testItem, 0);
    ed.selection.setRng(rng);

    type(ed, 8);

	equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>top item</li><li>first</li><ul><li>second</li><li>third</li></ul></ul>');
});

test("outdent on backspace, middle list item, nested list", function() {
    ed.setContent('<ul><li>top item</li><ul><li>first</li><li>second</li><li>third</li></ul></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.childNodes[1].childNodes[1].firstChild;
    rng.setStart(testItem, 0);
    rng.setEnd(testItem, 0);
    ed.selection.setRng(rng);

    type(ed, 8);

    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>top item</li><ul><li>first</li></ul><li>second</li><ul><li>third</li></ul></ul>');
});

test("outdent on backspace, last list item, nested list", function() {
    ed.setContent('<ul><li>top item</li><ul><li>first</li><li>second</li><li>third</li></ul></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.childNodes[1].childNodes[2].firstChild;
    rng.setStart(testItem, 0);
    rng.setEnd(testItem, 0);
    ed.selection.setRng(rng);

    type(ed, 8);

    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>top item</li><ul><li>first</li><li>second</li></ul><li>third</li></ul>');
});

test("don't outdent on backspace, last list item, beginning of em", function() {
    ed.setContent('<ul><li>first</li><li>second</li><li>third <em>italic</em> more text</li></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.lastChild.childNodes[1];
    rng.setStart(testItem, 0);
    rng.collapse(true);
    ed.selection.setRng(rng);

    type(ed, 8);

    var expected = '<ul><li>first</li><li>second</li><li>third<em>italic</em> more text</li></ul>';
    if(!tinymce.isGecko && !tinymce.isWebKit){
        //simulating the backspace character doesn't have it's default effect on non-Gecko engines, which is lame.
        expected = '<ul><li>first</li><li>second</li><li>third <em>italic</em> more text</li></ul>';
    }
    equals(ed.getContent().replace(/[\r\n]+/g, ''), expected);
});

test("outdent list toggle, middle list item, top-level list", function() {
	ed.setContent('<ul><li>first</li><li>second</li><li>third</li></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.childNodes[1].firstChild;
    rng.setStart(testItem, 0);
    rng.setEnd(testItem, 0);
    ed.selection.setRng(rng);

    ed.execCommand("mceInsertUnorderedList");

    rng = ed.selection.getRng(true);
    equal(rng.startContainer, ed.getBody().childNodes[1].firstChild, "correct cursor container");
    equal(rng.startOffset, 0, "correct cursor offset");

    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li></ul><p>second</p><ul><li>third</li></ul>');
});

test("join on delete, first list item", function() {
    ed.setContent('<ul><li>first</li><li>second</li><li>third <em>italic</em> more text</li></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.firstChild;
    rng.setStart(testItem.firstChild, 5);
    rng.collapse(true);
    ed.selection.setRng(rng);

    type(ed, 46);

    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>firstsecond</li><li>third <em>italic</em> more text</li></ul>');
});

test("join on delete, last list item", function() {
    ed.setContent('<ul><li>first</li><li>second</li></ul><p>third <em>italic</em> more text</p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.lastChild;
    rng.setStart(testItem.firstChild, 6);
    rng.collapse(true);
    ed.selection.setRng(rng);

    type(ed, 46);

    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li><li>secondthird <em>italic</em> more text</li></ul>');
});

test("join on delete, p before list", function() {
    ed.setContent('<p>para text</p><ul><li>first</li><li>second</li></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild;
    rng.setStart(testItem.firstChild, 9);
    rng.collapse(true);
    ed.selection.setRng(rng);

    type(ed, 46);

    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p>para textfirst</p><ul><li>second</li></ul>');
});

test("join on delete, p before singleton list", function() {
    ed.setContent('<p>para text</p><ul><li>first</li></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild;
    rng.setStart(testItem.firstChild, 9);
    rng.collapse(true);
    ed.selection.setRng(rng);

    type(ed, 46);

    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p>para textfirst</p>');
});

test("outdent on shift-tab, third level of nesting, cursor mid-text", function(){
    ed.setContent('<ul><li>first</li><ul><li>second</li><ul><li>third</li></ul></ul></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.lastChild.lastChild.firstChild.firstChild; //inner-most LI's text child
    rng.setStart(testItem, 1);
    rng.collapse(true);
    ed.selection.setRng(rng);

    type(ed, 9, {shiftKey: true}); //shift-tab

    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li><ul><li>second</li><li>third</li></ul></ul>');
    ed.getBody().normalize();
    rng = ed.selection.getRng(true);
    equal(rng.startContainer, ed.getBody().firstChild.lastChild.lastChild.firstChild, "range container");
    equal(rng.startOffset, 1, "range offset");
});

test("outdent on shift-tab, multiple LI selection, mid-text endpoints", function(){
    ed.setContent('<ul><li>first</li><li>second</li><li>third</li></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.firstChild; //first li
    rng.setStart(testItem.firstChild, 2);
    rng.setEnd(testItem.nextSibling.firstChild, 2);
    ed.selection.setRng(rng);

    type(ed, 9, {shiftKey: true}); //shift-tab

    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p>first</p><p>second</p><ul><li>third</li></ul>');

    rng = ed.selection.getRng(true);
    equal(rng.startContainer, ed.getBody().firstChild.firstChild);
    equal(rng.startOffset, 2);
    equal(rng.endContainer, ed.getBody().firstChild.nextSibling.firstChild);
    equal(rng.endOffset, 2);
});

if(!tinymce.isIE){
    test("outdent on shift-tab, multiple LI selection, block endpoints", function(){
        ed.setContent('<ul><li>first</li><li>second</li><li>third</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild; //ul
        rng.setStart(testItem, 0);
        rng.setEnd(testItem, 2);
        ed.selection.setRng(rng);

        type(ed, 9, {shiftKey: true}); //shift-tab

        equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p>first</p><p>second</p><ul><li>third</li></ul>');

        rng = ed.selection.getRng(true);
        equal(rng.startContainer, ed.getBody().firstChild.firstChild);
        equal(rng.startOffset, 0);
        equal(rng.endContainer, ed.getBody().childNodes[1].firstChild);
        equal(rng.endOffset, 6);
    });
}

test("indent on tab, multiple LI selection, mid-text endpoints", function(){
    ed.setContent('<ul><li>first</li><li>second</li><li>third</li></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.firstChild; //first li
    rng.setStart(testItem.firstChild, 2);
    rng.setEnd(testItem.nextSibling.firstChild, 2);
    ed.selection.setRng(rng);

    type(ed, 9); //tab

    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><ul><li>first</li><li>second</li></ul><li>third</li></ul>');

    rng = ed.selection.getRng(true);
    equal(rng.startContainer, ed.getBody().firstChild.firstChild.firstChild.firstChild);
    equal(rng.startOffset, 2);
    equal(rng.endContainer, ed.getBody().firstChild.firstChild.firstChild.nextSibling.firstChild);
    equal(rng.endOffset, 2);
});

test("indent atomic undo", function(){
    ed.setContent('<ul><li>first</li><li>second</li><li>third</li></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.firstChild; //first li
    rng.setStart(testItem.firstChild, 2);
    rng.setEnd(testItem.nextSibling.firstChild, 2);
    ed.selection.setRng(rng);

    type(ed, 9); //tab

    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><ul><li>first</li><li>second</li></ul><li>third</li></ul>');

    ed.undoManager.undo();

    checkContent(ed, '<ul><li>first</li><li>second</li><li>third</li></ul>');
});

if(!tinymce.isIE){
    test("indent on tab, multiple LI selection, block endpoints", function(){
        ed.setContent('<ul><li>first</li><li>second</li><li>third</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild; //ul
        rng.setStart(testItem, 0);
        rng.setEnd(testItem, 2);
        ed.selection.setRng(rng);

        type(ed, 9); //tab

        equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><ul><li>first</li><li>second</li></ul><li>third</li></ul>');

        if(!tinymce.isIE){
            rng = ed.selection.getRng(true);
            equal(rng.toString(), "firstsecond");
        }
    });
}


test("outdent on shift-tab twice, third level of nesting, cursor mid-text", function(){
    ed.setContent('<ul><li>first</li><ul><li>second</li><ul><li>third</li></ul></ul></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.lastChild.lastChild.firstChild.firstChild; //inner-most LI's text child
    rng.setStart(testItem, 1);
    rng.collapse(true);
    ed.selection.setRng(rng);

    type(ed, 9, {shiftKey: true}); //shift-tab
    type(ed, 9, {shiftKey: true}); //shift-tab

    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li><ul><li>second</li></ul><li>third</li></ul>');
    ed.getBody().normalize();
    rng = ed.selection.getRng(true);
    equal(rng.startContainer, ed.getBody().firstChild.lastChild.firstChild, "range container");
    equal(rng.startOffset, 1, "range offset");
});

test("outdent on shift-tab, third level of nesting", function(){
    ed.setContent('<ul><li>first</li><ul><li>second</li><ul><li>third</li></ul></ul></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.lastChild.lastChild.firstChild.firstChild; //inner-most LI's text child
    rng.setStart(testItem, 0);
    rng.collapse(true);
    ed.selection.setRng(rng);

    type(ed, 9, {shiftKey: true}); //shift-tab

    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li><ul><li>second</li><li>third</li></ul></ul>');
    ed.getBody().normalize();
    rng = ed.selection.getRng(true);
    equal(rng.startContainer, ed.getBody().firstChild.lastChild.lastChild.firstChild, "range container");
    equal(rng.startOffset, 0, "range offset");
});

test("outdent on shift-tab twice, third level of nesting", function(){
    ed.setContent('<ul><li>first</li><ul><li>second</li><ul><li>third</li></ul></ul></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.lastChild.lastChild.firstChild.firstChild; //inner-most LI's text child
    rng.setStart(testItem, 0);
    rng.collapse(true);
    ed.selection.setRng(rng);

    type(ed, 9, {shiftKey: true}); //shift-tab
    type(ed, 9, {shiftKey: true}); //shift-tab

    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li><ul><li>second</li></ul><li>third</li></ul>');
    ed.getBody().normalize();
    rng = ed.selection.getRng(true);
    equal(rng.startContainer, ed.getBody().firstChild.lastChild.firstChild, "range container");
    equal(rng.startOffset, 0, "range offset");
});

test("indent from level 1 to 2 and merge lists", function(){
    ed.setContent('<ul><li>first</li><ul><li>second</li></ul><li>third</li></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.lastChild.lastChild; //third's text
    rng.setStart(testItem, 1);
    rng.collapse(true);
    ed.selection.setRng(rng);

    type(ed, 9); //tab

    checkContent(ed, '<ul><li>first</li><ul><li>second</li><li>third</li></ul></ul>');
    rng = ed.selection.getRng(true);
    var expectedRng = ed.dom.createRng();
    expectedRng.setStart(testItem, 1); //it has moved, but the identity is unchanged.
    expectedRng.collapse(true);
    rangeEqual(rng, expectedRng);
});

test("create list, multiple P selection, mid-text endpoints", function(){
    ed.setContent('<p>first</p><p>second</p><ul><li>third</li></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild; //first li
    rng.setStart(testItem.firstChild, 2);
    rng.setEnd(testItem.nextSibling.firstChild, 2);
    ed.selection.setRng(rng);

    ed.execCommand("mceInsertUnorderedList");

    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li><li>second</li><li>third</li></ul>');

    rng = ed.selection.getRng(true);
    equal(rng.startContainer, ed.getBody().firstChild.firstChild.firstChild);
    equal(rng.startOffset, 2);
    equal(rng.endContainer, ed.getBody().firstChild.firstChild.nextSibling.firstChild);
    equal(rng.endOffset, 2);
});

test("create list, multiple P selection, block endpoints", function(){
    ed.setContent('<p>first</p><p>second</p><ul><li>third</li></ul>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody(); //first li
    rng.setStart(testItem, 0);
    rng.setEnd(testItem, 2);
    ed.selection.setRng(rng);

    ed.execCommand("mceInsertUnorderedList");

    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li><li>second</li><li>third</li></ul>');

    if(!tinymce.isIE){
        rng = ed.selection.getRng(true);
        equal(rng.toString(), "firstsecond");
    }
});

if(tinyMCE.isIE) test("IE textrange behavior. Nested lists near para, with ieShim, removed.", function(){
    ed.setContent('<ul><li>first</li><ul><li>second</li></ul></ul><p>para</p>');

    //must add shim before creating textrange
    ed.plugins.jiveutil.shimIfIE(ed, ed.getBody().lastChild);

    var rng = ed.getBody().createTextRange();
    rng.moveToElementText(ed.getBody().lastChild);

    equal(rng.parentElement(), ed.getBody().lastChild, "parent while selected");

    rng.collapse(true);
    //can remove shim after collapse
    ed.plugins.jiveutil.removeIEShims(ed);

    equal(rng.parentElement(), ed.getBody().lastChild, "parent after collapse");


    rng.pasteHTML("foo");
    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li><ul><li>second</li></ul></ul><p>foopara</p>', "modifications in the right place");
});

if(tinyMCE.isIE) test("IE textrange behavior. Nested lists near para, with ieShim, removed.", function(){
    ed.setContent('<ul><li>first</li><ul><li>second</li><ul><li>third</li></ul></ul></ul><p>para</p>');

    //must add shim before creating textrange
    ed.plugins.jiveutil.shimIfIE(ed, ed.getBody().lastChild);

    var rng = ed.getBody().createTextRange();
    rng.moveToElementText(ed.getBody().lastChild);

    equal(rng.parentElement(), ed.getBody().lastChild, "parent while selected");

    rng.collapse(true);
    //can remove shim after collapse
    ed.plugins.jiveutil.removeIEShims(ed);

    equal(rng.parentElement(), ed.getBody().lastChild, "parent after collapse");


    rng.pasteHTML("foo");
    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first</li><ul><li>second</li><ul><li>third</li></ul></ul></ul><p>foopara</p>', "modifications in the right place");
});

test("Shift-enter BR insertion, list item", function(){
    ed.setContent('<ul><li>first</li></ul>');

    var rng = ed.dom.createRng(true);
    var testItem = ed.getBody().firstChild.firstChild; //inner-most LI's text child
    rng.setStart(testItem.firstChild, 5);
    rng.collapse(true);
    ed.selection.setRng(rng);

    type(ed, 13, {shiftKey: true}); //shift-enter

    ed.selection.setContent("foo");

    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>first<br />foo</li></ul>', "correct document");
});

//this works in IE in practice, but key simulation doesn't prompt the correct behavior
if(!tinyMCE.isIE) test("Shift-enter BR insertion, p tag", function(){
    ed.setContent('<p>first</p>');

    var rng = ed.dom.createRng(true);
    var testItem = ed.getBody().firstChild; //inner-most LI's text child
    rng.setStart(testItem.firstChild, 5);
    rng.collapse(true);
    ed.selection.setRng(rng);

    type(ed, 13, {shiftKey: true}); //shift-enter

    ed.selection.setContent("foo");

    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p>first<br />foo</p>', "correct document");
});

test("List type to style translation", function(){
    ed.setContent('<ol><li>first</li></ol>');

    var testItem = ed.getBody().firstChild;
    testItem.setAttribute("type", "i");
    ed.plugins.jivelists.listTypeToStyle(testItem);

    equal(testItem.style.listStyleType, "lower-roman", "correct list style");
});

test("List type to style translation, implicit", function(){
    ed.setContent('<ol type="i"><li>first</li></ol>');

    var extraAttr = "";
    if(tinymce.isIE){
        extraAttr = 'start="1" ';
    }
    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ol ' + extraAttr + 'style="list-style-type: lower-roman;"><li>first</li></ol>', "correct document");
});

test("List type to style translation, nested, implicit", function(){
    ed.setContent('<ol><li>outer</li><ol type="i"><li>first</li></ol></ol>');

    var extraAttr = "";
    if(tinymce.isIE){
        extraAttr = ' start="1"';
    }
    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ol' + extraAttr + '><li>outer</li><ol' + extraAttr + ' style="list-style-type: lower-roman;"><li>first</li></ol></ol>', "correct document");
});

if(!tinymce.isIE){
    //IE won't let us remove the type attribute, try as we might, so this test fails there despite correct code.  Not a big deal.
    test("Unordered List type to style translation, implicit", function(){
        ed.setContent('<ul type="sQuArE"><li>first</li></ul>');

        equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ul style="list-style-type: square;"><li>first</li></ul>', "correct document");
    });
}

test("List style change", function(){
    ed.setContent('<ol data-mce-style="list-style-type: lower-roman;" style="list-style-type: lower-roman;"><li>first</li></ol>');

    var testItem = ed.getBody().firstChild;
    var rng = ed.dom.createRng();
    rng.setStart(testItem.firstChild, 0);
    rng.collapse(true);
    ed.selection.setRng(rng);

    ed.execCommand("mceOLListStyle1");

    var extraAttr = "";
    if(tinymce.isIE){
        extraAttr = 'start="1" ';
    }
    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<ol ' + extraAttr + 'style="list-style-type: decimal;"><li>first</li></ol>', "correct document");
});

test("delete at end of bulletted list", function() {
    ed.setContent('<ul><li>foo</li><li></li></ul>');

	var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.lastChild;
	rng.setStart(testItem, 0);
    rng.collapse(true);
	ed.selection.setRng(rng);

    ed.selectionUtil.normalizeSelection();

    type(ed, 46); //should be no-op

    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>foo</li><li></li></ul>');
});

test("delete empty paragraph", function() {
    ed.setContent('<p>test</p><p><br /></p><p>me</p>');

	var rng = ed.dom.createRng();
    var testItem = ed.getBody().childNodes[1];
	rng.setStart(testItem, 0);
    rng.collapse(true);
	ed.selection.setRng(rng);

    ed.selectionUtil.normalizeSelection();

    type(ed, 46);

    ok(ed.selection.getSel().rangeCount > 0, "selection exists");

    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>test</p><p>me</p>', "content");
});

test("list creation inside a table cell", function(){
    ed.setContent('<table border="1" class="jiveBorder" style="border: 1px solid rgb(0, 0, 0); width: 100%;" jive-data-cell="{&quot;color&quot;:&quot;#000000&quot;,&quot;textAlign&quot;:&quot;left&quot;,&quot;padding&quot;:&quot;2&quot;,&quot;backgroundColor&quot;:&quot;&quot;}" jive-data-header="{&quot;color&quot;:&quot;#FFFFFF&quot;,&quot;backgroundColor&quot;:&quot;&quot;,&quot;textAlign&quot;:&quot;center&quot;,&quot;padding&quot;:&quot;2&quot;}"> <tbody> <tr> <th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;" valign="middle"><strong>Header 1</strong></th><th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;" valign="middle"><strong>Header 2</strong></th> </tr> <tr> <td style="padding: 2px;" id="list-cell">List item</td> <td style="padding: 2px;"> </td> </tr> <tr> <td style="padding: 2px;"><br /></td> <td style="padding: 2px;"><br /></td> </tr> </tbody> </table> <p> </p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getDoc().getElementById("list-cell");
    rng.setStart(testItem.firstChild, 2);
    rng.collapse(true);
    ed.selection.setRng(rng);

    ed.execCommand("mceInsertUnorderedList");

    checkContent(ed, '<table border=\"1\" class=\"jiveBorder\" style=\"border: 1px solid #000000; width: 100%;\"><tbody><tr><th style=\"text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;\" valign=\"middle\"><strong>Header 1</strong></th><th style=\"text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;\" valign=\"middle\"><strong>Header 2</strong></th></tr><tr><td id=\"list-cell\" style=\"padding: 2px;\"><ul><li>List item</li></ul></td><td style=\"padding: 2px;\"></td></tr><tr><td style=\"padding: 2px;\"></td><td style=\"padding: 2px;\"></td></tr></tbody></table><p></p>');

    var expectedRng = ed.dom.createRng();
    expectedRng.setStart(testItem.firstChild.firstChild.firstChild, 2);
    expectedRng.collapse(true);

    rangeEqual(ed.selection.getRng(true), expectedRng);
});

test("list creation inside an empty table cell", function(){
    ed.setContent('<table border="1" class="jiveBorder" style="border: 1px solid rgb(0, 0, 0); width: 100%;" jive-data-cell="{&quot;color&quot;:&quot;#000000&quot;,&quot;textAlign&quot;:&quot;left&quot;,&quot;padding&quot;:&quot;2&quot;,&quot;backgroundColor&quot;:&quot;&quot;}" jive-data-header="{&quot;color&quot;:&quot;#FFFFFF&quot;,&quot;backgroundColor&quot;:&quot;&quot;,&quot;textAlign&quot;:&quot;center&quot;,&quot;padding&quot;:&quot;2&quot;}"> <tbody> <tr> <th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;" valign="middle"><strong>Header 1</strong></th><th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;" valign="middle"><strong>Header 2</strong></th> </tr> <tr> <td style="padding: 2px;" id="list-cell"></td> <td style="padding: 2px;"> </td> </tr> <tr> <td style="padding: 2px;"><br /></td> <td style="padding: 2px;"><br /></td> </tr> </tbody> </table> <p> </p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getDoc().getElementById("list-cell");
    rng.setStart(testItem, 0);
    rng.collapse(true);
    ed.selection.setRng(rng);

    ed.execCommand("mceInsertUnorderedList");

    checkContent(ed, '<table border=\"1\" class=\"jiveBorder\" style=\"border: 1px solid #000000; width: 100%;\"><tbody><tr><th style=\"text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;\" valign=\"middle\"><strong>Header 1</strong></th><th style=\"text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;\" valign=\"middle\"><strong>Header 2</strong></th></tr><tr><td id=\"list-cell\" style=\"padding: 2px;\"><ul><li></li></ul></td><td style=\"padding: 2px;\"></td></tr><tr><td style=\"padding: 2px;\"></td><td style=\"padding: 2px;\"></td></tr></tbody></table><p></p>');

    var expectedRng = ed.dom.createRng();
    expectedRng.setStart(testItem.firstChild.firstChild, 0);
    expectedRng.collapse(true);

    rangeEqual(ed.selection.getRng(true), expectedRng);
});

test("range splitting, text node range", function(){
    ed.setContent('<p><span>1234</span></p>');

    var container = ed.getBody().firstChild.firstChild;

    var rng = ed.dom.createRng();
    rng.setStart(container.firstChild, 1);
    rng.setEnd(container.firstChild, 3);

    ed.plugins.jivelists.rangeSplit(rng);

    checkContent(ed, '<p><span>1</span>23<span>4</span></p>');
});

test("range splitting, front of text node, collapsed", function(){
    ed.setContent('<p><span>1234</span></p>');

    var container = ed.getBody().firstChild.firstChild;

    var rng = ed.dom.createRng();
    rng.setStart(container.firstChild, 0);
    rng.setEnd(container.firstChild, 0);

    ed.plugins.jivelists.rangeSplit(rng);

    checkContent(ed, '<p><span>1234</span></p>');
});

test("range splitting, mid-text node, collapsed", function(){
    ed.setContent('<p><span>1234</span></p>');

    var container = ed.getBody().firstChild.firstChild;

    var rng = ed.dom.createRng();
    rng.setStart(container.firstChild, 2);
    rng.setEnd(container.firstChild, 2);

    ed.plugins.jivelists.rangeSplit(rng);

    checkContent(ed, '<p><span>12</span><span>34</span></p>');
});

test("range splitting, end of text node, collapsed", function(){
    ed.setContent('<p><span>1234</span></p>');

    var container = ed.getBody().firstChild.firstChild;

    var rng = ed.dom.createRng();
    rng.setStart(container.firstChild, 4);
    rng.setEnd(container.firstChild, 4);

    ed.plugins.jivelists.rangeSplit(rng);

    checkContent(ed, '<p><span>1234</span></p>');
});