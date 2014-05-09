/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
module("Jive Selection Plugin", {
	autostart: false
});

if(!tinymce.isIE){
    test("normalizeRange, collapsed, start of body", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody();
        rng.setStart(testItem, 0);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        equal(rng.startContainer, testItem, "container");
        equal(rng.startOffset, 0, "offset");
    });

    test("normalizeRange, collapsed, start of ul", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild;
        rng.setStart(testItem, 0);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var n = rng.startContainer.childNodes[rng.startOffset];
        equal(n.nodeType, 1, "should select li node");
        equal(n.nodeName.toLowerCase(), "li", "should be the li");
    });

    test("normalizeRange, collapsed, start of li", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem, 0);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var n = rng.startContainer;
        equal(n.nodeType, 3, "should select text node");
        equal(n.nodeValue, "text", "should be the text node with the content 'text'");
        equal(rng.startOffset, 0, "should be the beginning of the text node");
    });

    test("normalizeRange, collapsed, li[1]", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem, 1);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var n = rng.startContainer;
        equal(n.nodeType, 3, "should select text node");
        equal(n.nodeValue, "text", "should be the text node with the content 'text'");
        equal(rng.startOffset, 0, "should be the beginning of the text node");
    });

    test("normalizeRange, collapsed, text[0]", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild.childNodes[1];
        rng.setStart(testItem, 0);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var n = rng.startContainer;
        equal(n.nodeType, 3, "should select text node");
        equal(n.nodeValue, "text", "should be the text node with the content 'text'");
        equal(rng.startOffset, 0, "should be the beginning of the text node");
    });

    test("normalizeRange, collapsed, text[1]", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild.childNodes[1];
        rng.setStart(testItem, 1);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var n = rng.startContainer;
        equal(n.nodeType, 3, "should select text node");
        equal(n.nodeValue, "text", "should be the text node with the content 'text'");
        equal(rng.startOffset, 1, "should be at second spot in the text node");
    });

    test("normalizeRange, collapsed, text[-1]", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild.childNodes[1];
        rng.setStart(testItem, 4);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var n = rng.startContainer;
        equal(n.nodeType, 3, "should select text node");
        equal(n.nodeValue, "text", "should be the text node with the content 'text'");
        equal(rng.startOffset, 4, "should be the start of the text node");
    });

    test("normalizeRange, collapsed, after text node", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem, 2);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var n = rng.startContainer;
        equal(n.nodeType, 3, "should select text node");
        equal(n.nodeValue, "text", "should be the text node with the content 'text'");
        equal(rng.startOffset, 4, "should be the start of the text node");
    });

    test("normalizeRange, collapsed, start of strong", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild.childNodes[2];
        rng.setStart(testItem, 0);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var n = rng.startContainer;
        equal(n.nodeType, 3, "should select text node");
        equal(n.nodeValue, "text", "should be the text node with the content 'text'");
        equal(rng.startOffset, 4, "should be the start of the text node");
    });

    test("normalizeRange, collapsed, end of strong", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild.childNodes[2];
        rng.setStart(testItem, 1);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var n = rng.startContainer;
        equal(n.nodeType, 3, "should select text node");
        equal(n.nodeValue, "bold text", "should be the text node with the content 'bold text'");
        equal(rng.startOffset, 9, "should be the start of the text node");
    });

    test("normalizeRange, collapsed, after b", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem, 3);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var n = rng.startContainer;
        equal(n.nodeType, 3, "should select text node");
        equal(n.nodeValue, "bold text", "should be the text node with the content 'bold text'");
        equal(rng.startOffset, 9, "should be the start of the text node");
    });

    test("normalizeRange, collapsed, end of ul", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild;
        rng.setStart(testItem, 1);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        equal(rng.startContainer, testItem, "ul container");
        equal(rng.startOffset, 1, "unmoved");
    });

    test("normalizeRange, selection, body[0] to body[-1]", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody();
        rng.setStart(testItem, 0);
        rng.setEnd(testItem, 1);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(ed.getBody().firstChild.firstChild.childNodes[1], 0);
        expectedRng.setEnd(ed.getBody().lastChild.lastChild.lastChild, 9);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, selection, whole body", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody();
        rng.setStart(ed.getBody().firstChild.firstChild.childNodes[1], 0);
        rng.setEnd(ed.getBody().lastChild.lastChild, 4);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(ed.getBody().firstChild.firstChild.childNodes[1], 0);
        expectedRng.setEnd(ed.getBody().lastChild.lastChild.lastChild, 9);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, selection, ul[0] to ul[-1]", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild;
        rng.setStart(testItem, 0);
        rng.setEnd(testItem, 1);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(ed.getBody().firstChild.firstChild.childNodes[1], 0);
        expectedRng.setEnd(ed.getBody().lastChild.lastChild.lastChild, 9);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, selection, li[1] to li[2]", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem, 1);
        rng.setEnd(testItem, 2);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        var textNode = testItem.childNodes[1];
        expectedRng.setStart(textNode, 0);
        expectedRng.setEnd(textNode, textNode.nodeValue.length);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, selection, li[2] to li[3]", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem, 2);
        rng.setEnd(testItem, 3);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        var textNode = testItem.childNodes[2].firstChild;
        expectedRng.setStart(textNode, 0);
        expectedRng.setEnd(textNode, textNode.nodeValue.length);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, selection, li[2] to strong[1]", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem, 2);
        rng.setEnd(testItem.childNodes[2], 1);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        var textNode = testItem.childNodes[2].firstChild;
        expectedRng.setStart(textNode, 0);
        expectedRng.setEnd(textNode, textNode.nodeValue.length);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, selection, 'bold text'[2] to 'more text'[4]", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem.childNodes[2].firstChild, 2);
        rng.setEnd(testItem.childNodes[3], 4);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem.childNodes[2].firstChild, 2);
        expectedRng.setEnd(testItem.childNodes[3], 4);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, selection, li[0] to strong[1]", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem, 0);
        rng.setEnd(testItem.childNodes[2], 1);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem.childNodes[1], 0);
        expectedRng.setEnd(testItem.childNodes[2].firstChild, 9);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, selection, body[0] to strong[1]", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem.childNodes[1], 0);
        rng.setEnd(testItem.childNodes[2], 1);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem.childNodes[1], 0);
        expectedRng.setEnd(testItem.childNodes[2].firstChild, 9);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, selection, strong[0] to end", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem.childNodes[2].firstChild, 0);
        rng.setEnd(testItem, 4);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem.childNodes[2].firstChild, 0);
        expectedRng.setEnd(testItem.lastChild, 9);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, complex formatting, cursor between bold and italic", function(){
        ed.setContent('<p>text<strong>bold text</strong><em>italic text</em><span data-mce-style="font-size: 12pt;" style="font-size: 12pt;">12 pt text</span><br></p>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.childNodes[1].firstChild;
        rng.setStart(testItem, testItem.nodeValue.length);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        equal(rng.startContainer.nodeValue, "bold text", "collapsed cursor should prefer the previous text node");
        ok(rng.collapsed, "range is collapsed");
    });

    test("normalizeRange, complex formatting, cursor between bold and italic, starting in italic text", function(){
        ed.setContent('<p>text<strong>bold text</strong><em>italic text</em><span data-mce-style="font-size: 12pt;" style="font-size: 12pt;">12 pt text</span><br></p>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.childNodes[2].firstChild;
        rng.setStart(testItem, 0);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        equal(rng.startContainer.nodeValue, "bold text", "collapsed cursor should prefer the previous text node");
        ok(rng.collapsed, "range is collapsed");
    });

    test("normalizeRange, complex formatting, select italic text", function(){
        ed.setContent('<p>text<strong>bold text</strong><em>italic text</em><span data-mce-style="font-size: 12pt;" style="font-size: 12pt;">12 pt text</span><br></p>');

        var rng = ed.dom.createRng();
        var boldText= ed.getBody().firstChild.childNodes[1].firstChild;
        var italicText= ed.getBody().firstChild.childNodes[2].firstChild;
        rng.setStart(boldText, 9);
        rng.setEnd(italicText, 11);

        rng = ed.selectionUtil.normalizeRange(rng);

        equal(rng.startContainer.nodeValue, "italic text", "start should prefer the next text node");
        equal(rng.startOffset, 0, "start should prefer the next text node");
        equal(rng.endContainer, rng.startContainer, "same node selected");
        equal(rng.endOffset, rng.endContainer.nodeValue.length, "end of selection should be end of italic text node");
    });

    test("normalizeRange, collapsed, beginning of list item with br", function(){
        ed.setContent('<p><br /></p>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild;
        rng.setStart(testItem, 0);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem, 0);
        expectedRng.collapse(true);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, link, beginning of strongold after link", function(){
        ed.setContent('<p>text<a href="http://www.google.com/">link</a><strong>bold text</strong></p>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.childNodes[2].firstChild;
        rng.setStart(testItem, 0);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem, 0);
        expectedRng.collapse(true);

        rangeEqual(rng, expectedRng);
        ok(rng.collapsed, "range is collapsed");
    });

    test("normalizeRange, link, end of link", function(){
        ed.setContent('<p>text<a href="http://www.google.com/">link</a><strong>bold text</strong></p>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.childNodes[1].firstChild;
        rng.setStart(testItem, 4);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem, 4);
        expectedRng.collapse(true);

        rangeEqual(rng, expectedRng);
        ok(rng.collapsed, "range is collapsed");
    });

    test("normalizeRange, link, beginning of link", function(){
        ed.setContent('<p>text<a href="http://www.google.com/">link</a><strong>bold text</strong></p>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.childNodes[1].firstChild;
        rng.setStart(testItem, 0);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem, 0);
        expectedRng.collapse(true);

        rangeEqual(rng, expectedRng);
        ok(rng.collapsed, "range is collapsed");
    });

    test("normalizeRange, link, end of text before link", function(){
        ed.setContent('<p>text<a href="http://www.google.com/">link</a><strong>bold text</strong></p>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem, 4);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem, 4);
        expectedRng.collapse(true);

        rangeEqual(rng, expectedRng);
        ok(rng.collapsed, "range is collapsed");
    });

    test("normalizeRange, br, after br mid-p", function(){
        ed.setContent('<p>text<br />more text</p>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild;
        rng.setStart(testItem, 2);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem.childNodes[2], 0);
        expectedRng.collapse(true);

        rangeEqual(rng, expectedRng);
        ok(rng.collapsed, "range is collapsed");
    });

    test("normalizeRange, multiple text nodes in p, selection", function(){
        ed.setContent('<p>text </p>', {format: 'raw'});

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild;

        while(testItem.lastChild.nodeType == 1){
            testItem.removeChild(testItem.lastChild);  //gecko likes to add brs, which throw us off
        }
        testItem.appendChild(ed.getDoc().createTextNode("more text "));
        testItem.appendChild(ed.getDoc().createTextNode("end text"));

        rng.setStart(testItem.childNodes[1], 2);
        rng.setEnd(testItem.childNodes[2], 0);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem.firstChild, 7);
        expectedRng.setEnd(testItem.firstChild, 15);

        rangeEqual(rng, expectedRng);
        equal(rng.toString(), "re text ", "correct selected text");
    });

    test("normalizeRange, cursor after image", function(){
        ed.setContent('<p>text <img class="jive_macro jive_emote" src="/4.5.5/images/emoticons/happy.png" jivemacro="emoticon" ___jive_emoticon_name="happy" /> more text</p>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild;

        while(testItem.lastChild.nodeType == 1){
            testItem.removeChild(testItem.lastChild);  //gecko likes to add brs, which throw us off
        }

        rng.setStart(testItem.childNodes[2], 0);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem.lastChild, 0);
        expectedRng.collapse(true);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, cursor before image", function(){
        ed.setContent('<p>text <img class="jive_macro jive_emote" src="/4.5.5/images/emoticons/happy.png" jivemacro="emoticon" ___jive_emoticon_name="happy" /> more text</p>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild;

        while(testItem.lastChild.nodeType == 1){
            testItem.removeChild(testItem.lastChild);  //gecko likes to add brs, which throw us off
        }

        rng.setStart(testItem, 1);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem.firstChild, 5);
        expectedRng.collapse(true);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, cursor before image at start of p", function(){
        ed.setContent('<p><img class="jive_macro jive_emote" src="/4.5.5/images/emoticons/happy.png" jivemacro="emoticon" ___jive_emoticon_name="happy" /> more text</p>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild;

        while(testItem.lastChild.nodeType == 1){
            testItem.removeChild(testItem.lastChild);  //gecko likes to add brs, which throw us off
        }

        rng.setStart(testItem, 0);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem, 0);
        expectedRng.collapse(true);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, select starts before image at start of p", function(){
        ed.setContent('<p><img class="jive_macro jive_emote" src="/4.5.5/images/emoticons/happy.png" jivemacro="emoticon" ___jive_emoticon_name="happy" /> more text</p>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild;

        while(testItem.lastChild.nodeType == 1){
            testItem.removeChild(testItem.lastChild);  //gecko likes to add brs, which throw us off
        }
        testItem.insertBefore(ed.getDoc().createTextNode(""), testItem.firstChild);

        rng.setStart(testItem, 0);
        rng.setEnd(testItem, 3);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(testItem, 0);
        expectedRng.setEnd(testItem.lastChild, 10);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, select into empty p", function(){
        ed.setContent('<p>some text</p><p><br /></p>');

        var rng = ed.dom.createRng();
        rng.setStart(ed.getBody().firstChild, 0);
        rng.setEnd(ed.getBody().lastChild, 0);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(ed.getBody().firstChild.firstChild, 0);
        expectedRng.setEnd(ed.getBody().lastChild, 0);

        rangeEqual(rng, expectedRng);
    });

    test("normalizeRange, cursor before image in li", function(){
        ed.setContent('<ul><li>text</li><li><img src="/4.5.5/images/emoticons/happy.png" /></li>');

        var rng = ed.dom.createRng();
        rng.setStart(ed.getBody().firstChild.lastChild, 0);
        rng.collapse(true);

        rng = ed.selectionUtil.normalizeRange(rng);

        var expectedRng = ed.dom.createRng();
        expectedRng.setStart(ed.getBody().firstChild.lastChild, 0);
        rng.collapse(true);

        rangeEqual(rng, expectedRng);
    });

    if(tinymce.isGecko){
        test("delete entire h3", function(){
            ed.setContent('<h3>some text</h3><h3>more text</h3><p>para</p>');

            var rng = ed.dom.createRng();
            rng.setStart(ed.getBody().firstChild.firstChild, 0);
            rng.setEnd(ed.getBody().childNodes[1], 0);
            ed.selection.setRng(rng);

            type(ed, 8);

            equal(ed.getContent().replace(/[\r\n]+/g, ''), '<h3>more text</h3><p>para</p>');
        });

        test("type over entire h3", function(){
            ed.setContent('<h3>some text</h3><h3>more text</h3><p>para</p>');

            var rng = ed.dom.createRng();
            rng.setStart(ed.getBody().firstChild.firstChild, 0);
            rng.setEnd(ed.getBody().childNodes[1], 0);
            ed.selection.setRng(rng);

            type(ed, 65);


            // if this test is done manually, then the contents of the <h3> are amore text
            // but we can't emulate typing 100% in a test
            equal(ed.getContent().replace(/[\r\n]+/g, ''), '<h3>more text</h3><p>para</p>');
        });
    }

    test("range stability under normalization, first node inner", function(){
        ed.setContent("<p>one </p>");

        var p = ed.getBody().firstChild;
        while(p.lastChild.nodeType == 1){
            p.removeChild(p.lastChild);  //gecko likes to add brs, which throw us off
        }

        var doc = ed.getDoc();
        p.appendChild(doc.createTextNode("two "));
        p.appendChild(doc.createTextNode("three"));

        equal(p.childNodes.length, 3, "separate children");

        var rng = doc.createRange();
        rng.setStart(p.firstChild, 0);
        rng.setEnd(p.firstChild, 3);

        rng = ed.selectionUtil.safeNormalize(rng);

        var expected = doc.createRange();
        expected.setStart(p.firstChild, 0);
        expected.setEnd(p.firstChild, 3);

        equal(p.childNodes.length, 3, "separate children");
        rangeEqual(rng, expected);
        equal(rng.toString(), "one");
    });

    test("selection stability under normalization", function(){
        ed.setContent("<p>one </p>", {format: 'raw'});

        var p = ed.getBody().firstChild;
        while(p.lastChild.nodeType == 1){
            p.removeChild(p.lastChild);  //gecko likes to add brs, which throw us off
        }

        var doc = ed.getDoc();
        p.appendChild(doc.createTextNode("two "));
        p.appendChild(doc.createTextNode("three"));

        equal(p.childNodes.length, 3, "separate children");

        var rng = doc.createRange();
        rng.setStart(p.lastChild, 1);
        rng.collapse(true);
        ed.selectionUtil.setSelection(rng, true);

        var selRng = ed.selection.getRng(true);
        selRng = ed.selectionUtil.safeNormalize(selRng, p);
        ed.selection.setRng(selRng);

        var expected = doc.createRange();
        expected.setStart(p.firstChild, 9);
        expected.collapse(true);

        equal(p.childNodes.length, 1, "one text node");
        rangeEqual(ed.selection.getRng(), expected);
    });

    test("range stability under normalization, first node boundaries", function(){
        ed.setContent("<p>one </p>", {format: 'raw'});

        var p = ed.getBody().firstChild;
        while(p.lastChild.nodeType == 1){
            p.removeChild(p.lastChild);  //gecko likes to add brs, which throw us off
        }

        var doc = ed.getDoc();
        p.appendChild(doc.createTextNode("two "));
        p.appendChild(doc.createTextNode("three"));

        var rng = doc.createRange();
        rng.setStart(p.firstChild, 0);
        rng.setEnd(p.firstChild, 4);

        rng = ed.selectionUtil.safeNormalize(rng);

        var expected = doc.createRange();
        expected.setStart(p.firstChild, 0);
        expected.setEnd(p.firstChild, 4);

        equal(p.childNodes.length, 3, "separate children");
        rangeEqual(rng, expected);
        equal(rng.toString(), "one ");
    });

    test("range stability under normalization, first node start, collapsed", function(){
        ed.setContent("<p>one </p>", {format: 'raw'});

        var p = ed.getBody().firstChild;
        while(p.lastChild.nodeType == 1){
            p.removeChild(p.lastChild);  //gecko likes to add brs, which throw us off
        }

        var doc = ed.getDoc();
        p.appendChild(doc.createTextNode("two "));
        p.appendChild(doc.createTextNode("three"));

        var rng = doc.createRange();
        rng.setStart(p.firstChild, 0);
        rng.setEnd(p.firstChild, 0);

        rng = ed.selectionUtil.safeNormalize(rng);

        var expected = doc.createRange();
        expected.setStart(p.firstChild, 0);
        expected.setEnd(p.firstChild, 0);

        equal(p.childNodes.length, 3, "separate children");
        rangeEqual(rng, expected);
        equal(rng.toString(), "");
    });

    test("range stability under normalization, first[0] - second[0]", function(){
        ed.setContent("<p>one </p>", {format: 'raw'});

        var p = ed.getBody().firstChild;
        while(p.lastChild.nodeType == 1){
            p.removeChild(p.lastChild);  //gecko likes to add brs, which throw us off
        }

        var doc = ed.getDoc();
        p.appendChild(doc.createTextNode("two "));
        p.appendChild(doc.createTextNode("three"));

        var rng = doc.createRange();
        rng.setStart(p.firstChild, 0);
        rng.setEnd(p.firstChild.nextSibling, 0);

        rng = ed.selectionUtil.safeNormalize(rng);

        var expected = doc.createRange();
        expected.setStart(p.firstChild, 0);
        expected.setEnd(p.firstChild, 4);

        equal(p.childNodes.length, 1, "one child");
        rangeEqual(rng, expected);
        equal(rng.toString(), "one ");
    });

    test("range stability under normalization, second[0] - second[3]", function(){
        ed.setContent("<p>one </p>", {format: 'raw'});

        var p = ed.getBody().firstChild;
        while(p.lastChild.nodeType == 1){
            p.removeChild(p.lastChild);  //gecko likes to add brs, which throw us off
        }

        var doc = ed.getDoc();
        p.appendChild(doc.createTextNode("two "));
        p.appendChild(doc.createTextNode("three"));

        var rng = doc.createRange();
        rng.setStart(p.firstChild.nextSibling, 0);
        rng.setEnd(p.firstChild.nextSibling, 3);

        rng = ed.selectionUtil.safeNormalize(rng);

        equal(p.childNodes.length, 3, "separate children");

        var expected = doc.createRange();
        expected.setStart(p.firstChild.nextSibling, 0);
        expected.setEnd(p.firstChild.nextSibling, 3);

        rangeEqual(rng, expected);
        equal(rng.toString(), "two");
    });

    test("range stability under normalization, second[0] - third[3]", function(){
        ed.setContent("<p>one </p>", {format: 'raw'});

        var p = ed.getBody().firstChild;
        while(p.lastChild.nodeType == 1){
            p.removeChild(p.lastChild);  //gecko likes to add brs, which throw us off
        }

        var doc = ed.getDoc();
        p.appendChild(doc.createTextNode("two "));
        p.appendChild(doc.createTextNode("three"));

        var rng = doc.createRange();
        rng.setStart(p.firstChild.nextSibling, 0);
        rng.setEnd(p.firstChild.nextSibling.nextSibling, 3);

        rng = ed.selectionUtil.safeNormalize(rng);

        var expected = doc.createRange();
        expected.setStart(p.firstChild, 4);
        expected.setEnd(p.firstChild, 11);

        equal(p.childNodes.length, 1, "one child");
        rangeEqual(rng, expected);
        equal(rng.toString(), "two thr");
    });

    test("atStartOf, true", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem.firstChild, 0);
        rng.collapse(true);
        ed.selection.setRng(rng);

        equal(ed.selectionUtil.atStartOf(testItem), true, "start of span is start of li");
    });

    test("atStartOf, true, exact", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem, 0);
        rng.collapse(true);
        ed.selection.setRng(rng);

        equal(ed.selectionUtil.atStartOf(testItem), true, "start of li is start of li");
    });

    test("atStartOf, false", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setStart(testItem.childNodes[2], 0);
        rng.collapse(true);
        ed.selection.setRng(rng);

        equal(ed.selectionUtil.atStartOf(testItem), false, "start of strong is not start of li");
    });

    test("atEndOf, true", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong><em>more text</em></li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setEnd(testItem.lastChild.lastChild, testItem.lastChild.lastChild.nodeValue.length);
        rng.collapse(false);
        ed.selection.setRng(rng);

        equal(ed.selectionUtil.atEndOf(testItem), true, "end of em is end of li");
    });

    test("atEndOf, true, exact", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setEnd(testItem, testItem.childNodes.length);
        rng.collapse(false);
        ed.selection.setRng(rng);

        equal(ed.selectionUtil.atEndOf(testItem), true, "end of li is end of li");
    });

    test("atEndOf, true, with br", function(){
        ed.setContent('<ul><li><br /></li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setEnd(testItem, 0);
        rng.collapse(false);
        ed.selection.setRng(rng);

        equal(ed.selectionUtil.atEndOf(testItem), true, "ignored terminal br");
    });

    test("atEndOf, true, in p with terminal br before list", function() {
        ed.setContent('<p>para text<br /></p><ul><li>first</li><li>second</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild;
        rng.setStart(testItem.firstChild, 9);
        rng.collapse(true);
        ed.selection.setRng(rng);

        equal(ed.selectionUtil.atEndOf(testItem), true, "ignored terminal br");
    });


    test("atEndOf, false", function(){
        ed.setContent('<ul><li><span></span>text<strong>bold text</strong>more text</li></ul>');

        var rng = ed.dom.createRng();
        var testItem = ed.getBody().firstChild.firstChild;
        rng.setEnd(testItem.childNodes[2].firstChild, 9);
        rng.collapse(false);
        ed.selection.setRng(rng);

        equal(ed.selectionUtil.atEndOf(testItem), false, "end of strong is not end of li");
    });
}

test("isForward", function(){
    ed.setContent('<p>test</p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild;
    rng.setStart(testItem, 0);
    rng.collapse(true);
    ed.selection.setRng(rng);

    ok(ed.selectionUtil.isForwardSelection(), "collapsed is forward");

    rng.setEnd(testItem, 1);
    ed.selection.setRng(rng);

    ok(ed.selectionUtil.isForwardSelection(), "uncollapsed forward is forward");

    var sel = ed.selection.getSel();
    if(sel.anchorNode != null){
        sel.collapse(testItem, 1);
        sel.extend(testItem, 0);
        ok(!ed.selectionUtil.isForwardSelection(), "uncollapsed backward is not forward");
    }
});

test("isBookmark", function(){
    ed.setContent('<p id="foo">test</p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild;
    rng.setStart(testItem, 0);
    rng.collapse(true);
    ed.selection.setRng(rng);

    var bm = ed.selection.getBookmark();

    ok(ed.selectionUtil.isBookmark(testItem.childNodes[0]), "isBookmark on elem");
    ok(ed.selectionUtil.isBookmark(testItem.childNodes[0].id), "isBookmark on id");
    ok(!ed.selectionUtil.isBookmark(testItem), "isBookmark on non-bookmark elem");
    ok(!ed.selectionUtil.isBookmark("foo"), "isBookmark on non-bookmark id");
});

test("removeBookmark", function(){
    ed.setContent('<p id="foo">test</p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild;
    rng.setStart(testItem, 0);
    rng.setEnd(testItem, 1);
    ed.selection.setRng(rng);

    var bm = ed.selection.getBookmark();
    ed.selectionUtil.removeBookmark(bm);

    var $body = $j(ed.getBody());
    equal($body.find("p#foo").length, 1, "p tag");
    equal($body.find("p#foo").text(), "test", "text");
    equal($body.find("span").length, 0, "0 span tags");
});

test("adjustForBookmark, include", function(){
    ed.setContent('<p id="foo">test</p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild;
    rng.setStart(testItem, 0);
    rng.setEnd(testItem, 1);
    ed.selection.setRng(rng);

    var bm = ed.selection.getBookmark();
    var result = ed.selection.getRng(true);
    ed.selectionUtil.adjustForBookmark(result, true);
    ok(ed.selectionUtil.isBookmark(result.startContainer.childNodes[result.startOffset]), "starts with bookmark");
    ok(ed.selectionUtil.isBookmark(result.endContainer.childNodes[result.endOffset-1]), "ends with bookmark");
});

test("adjustForBookmark, exclude", function(){
    ed.setContent('<p id="foo">test</p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild;
    rng.setStart(testItem, 0);
    rng.setEnd(testItem, 1);
    ed.selection.setRng(rng);

    var bm = ed.selection.getBookmark();
    var result = ed.selection.getRng(true);
    ed.selectionUtil.adjustForBookmark(result, false);
    ok(ed.selectionUtil.isBookmark(result.startContainer.childNodes[result.startOffset-1]), "starts after bookmark");
    ok(ed.selectionUtil.isBookmark(result.endContainer.childNodes[result.endOffset]), "ends before bookmark");
});

test("getExpandedBlockRange", function(){
    ed.setContent('<p>one</p><p>two</p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild;
    rng.setStart(testItem.firstChild, 1);
    rng.setEnd(testItem.nextSibling.firstChild, 2);

    var result = ed.selectionUtil.getExpandedBlockRange(rng);
    var expected = ed.dom.createRng();
    expected.setStart(ed.getBody(), 0);
    expected.setEnd(ed.getBody(), 2);

    rangeEqual(result, expected);
});

test("getExpandedBlockRange in mostly-empty td", function(){
    ed.setContent('<table><tbody><tr><td><br /></td><td></td></tr></tbody></table>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.firstChild.firstChild.firstChild;
    rng.setStart(testItem, 0);
    rng.collapse(true);

    var result = ed.selectionUtil.getExpandedBlockRange(rng);
    var expected = ed.dom.createRng();
    expected.setStart(testItem, 0);
    expected.setEnd(testItem, 1);

    rangeEqual(result, expected);
});

test("getExpandedBlockRange in empty td", function(){
    ed.setContent('<table><tbody><tr><td><br /></td><td></td></tr></tbody></table>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.firstChild.firstChild.lastChild;
    rng.setStart(testItem, 0);
    rng.collapse(true);

    var result = ed.selectionUtil.getExpandedBlockRange(rng);
    var expected = ed.dom.createRng();
    expected.setStart(testItem, 0);
    expected.setEnd(testItem, testItem.childNodes.length);

    rangeEqual(result, expected);
});

test("splitAtEndpoints, all text in p", function(){
    ed.setContent('<p>text</p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild;
    rng.setStart(testItem.firstChild, 0);
    rng.setEnd(testItem.firstChild, 4);

    var result = ed.selectionUtil.splitAtEndpoints(rng);
    var expected = ed.dom.createRng();
    testItem = ed.getBody();
    expected.setStart(testItem, 0);
    expected.setEnd(testItem, 1);

    rangeEqual(result, expected);
    checkContent(ed, '<p>text</p>', "correct document");
});

test("splitAtEndpoints, whole element", function(){
    ed.setContent('<p><strong>first paragraph</strong></p><p>second paragraph</p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild;
    rng.setStart(testItem.firstChild, 0);
    rng.setEnd(testItem, 1);

    var result = ed.selectionUtil.splitAtEndpoints(rng);
    var expected = ed.dom.createRng();
    testItem = ed.getBody();
    expected.setStart(testItem, 0);
    expected.setEnd(testItem, 1);

    rangeEqual(result, expected);
    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p><strong>first paragraph</strong></p><p>second paragraph</p>', "correct document");
});

test("splitAtEndpoints, whole element, just text", function(){
    ed.setContent('<p><strong>first paragraph</strong></p><p>second paragraph</p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild;
    rng.setStart(testItem.firstChild.firstChild, 0);
    rng.setEnd(testItem.firstChild.firstChild, 15);

    var result = ed.selectionUtil.splitAtEndpoints(rng);

    var expected = ed.dom.createRng();
    testItem = ed.getBody().firstChild;
    expected.setStart(testItem, 0);
    expected.setEnd(testItem, 1);

    rangeEqual(result, expected);
    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p><strong>first paragraph</strong></p><p>second paragraph</p>', "correct document");
});

test("splitAtEndpoints, first word", function(){
    ed.setContent('<p><strong>first paragraph</strong></p><p>second paragraph</p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.firstChild.firstChild;
    rng.setStart(testItem, 0);
    rng.setEnd(testItem, 5);

    var result = ed.selectionUtil.splitAtEndpoints(rng);
    var expected = ed.dom.createRng();
    testItem = ed.getBody().firstChild;
    expected.setStart(testItem, 0);
    expected.setEnd(testItem, 1);

    rangeEqual(result, expected);
    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p><strong>first</strong><strong> paragraph</strong></p><p>second paragraph</p>', "correct document");
});

test("splitAtEndpoints, second word, to top", function(){
    ed.setContent('<p><strong>first paragraph</strong></p><p>second paragraph</p>');

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild.firstChild, 5);
    rng.setEnd(ed.getBody(), 1);

    var result = ed.selectionUtil.splitAtEndpoints(rng);
    var expected = ed.dom.createRng();
    var testItem = ed.getBody();
    expected.setStart(testItem, 1);
    expected.setEnd(testItem, 2);

    rangeEqual(result, expected);
    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p><strong>first</strong></p><p><strong> paragraph</strong></p><p>second paragraph</p>', "correct document");
});

test("splitAtEndpoints in td", function(){
    ed.setContent('<table><tbody><tr><td>someatextain a TD</td><td></td></tr></tbody></table><p>asdf</p>');

    var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.firstChild.firstChild.firstChild;
    rng.setStart(testItem.firstChild, 5);
    rng.setEnd(testItem.firstChild, 9);

    var result = ed.selectionUtil.splitAtEndpoints(rng);
    var expected = ed.dom.createRng();
    expected.setStart(testItem, 1);
    expected.setEnd(testItem, 2);

    rangeEqual(result, expected);

    var pre = ed.dom.create("pre");
    result.surroundContents(pre);

    checkContent(ed, '<table><tbody><tr><td>somea<pre>text</pre>ain a TD</td><td></td></tr></tbody></table><p>asdf</p>');
});
