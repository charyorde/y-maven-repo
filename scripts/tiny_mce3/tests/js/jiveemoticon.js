/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

module("Jive Emoticon Plugin", {
	autostart: false
});

test("test simple emoticon", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 6);
    rng.setEnd(ed.getBody().firstChild.firstChild, 6);
    ed.selection.setRng(rng);

    ed.selection.setContent(':');
    ed.selection.setContent(') ab');
    type(ed, 41);

	equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p>first <img class=\"jive_macro jive_emote\" src=\"' + CS_RESOURCE_BASE_URL + '/images/emoticons/happy.png\" jivemacro=\"emoticon\" ___jive_emoticon_name=\"happy\" /> ab</p>');
});

asyncTest("test simple emoticon from menu", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 6);
    rng.setEnd(ed.getBody().firstChild.firstChild, 6);
    ed.selection.setRng(rng);

    var i = ed.plugins.jiveutil.findMacroIndex("emoticon");
    ed.execCommand("mceAddJiveMacro" + i + "_0");
    ed.selection.setContent('ab');

    //we call macro.refresh after a delay.
    setTimeout(function(){
        checkContent(ed, '<p>first <img class=\"jive_macro jive_macro_emoticon jive_emote\" src=\"' + CS_RESOURCE_BASE_URL + '/images/emoticons/happy.png\" jivemacro=\"emoticon\" ___jive_emoticon_name=\"happy\" />ab</p>');
        start();
    }, 20);
});

test("test emoticon in time", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 6);
    rng.setEnd(ed.getBody().firstChild.firstChild, 6);
    ed.selection.setRng(rng);

    ed.selection.setContent('time ');
    ed.selection.setContent('1');
    ed.selection.setContent('2');
    ed.selection.setContent(':');
    ed.selection.setContent('0');
    type(ed, 48);
    ed.selection.setContent('0 :');
    type(ed, 48);
    type(ed, 41);
    ed.selection.setContent('0 asdf');
    type(ed, 48);
    type(ed, 41);

	equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p>first time 12:00 <img class=\"jive_macro jive_emote\" src=\"'+CS_RESOURCE_BASE_URL+'/images/emoticons/laugh.png\" jivemacro=\"emoticon\" ___jive_emoticon_name=\"laugh\" /> asdf</p>');
});

test("test emoticon immediate", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 6);
    rng.setEnd(ed.getBody().firstChild.firstChild, 6);
    ed.selection.setRng(rng);

    ed.selection.setContent('emote! :0 an');
    type(ed, 48);
    ed.selection.setContent('d this is awesome');
    ed.selection.setContent('after');

	equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p>first emote! <img class=\"jive_macro jive_emote\" src=\"'+CS_RESOURCE_BASE_URL+'/images/emoticons/laugh.png\" jivemacro=\"emoticon\" ___jive_emoticon_name=\"laugh\" /> and this is awesomeafter</p>');
});

test("test pasting in emoticons from Edit->Paste browser menu item", function() {
    var rng = ed.dom.createRng();

    ed.setContent('<p>1234</p>');
    rng.setStart(ed.getBody().firstChild.firstChild, 0);
    rng.setEnd(ed.getBody().firstChild.firstChild, 4);
    ed.selection.setRng(rng);

    ed.execCommand('mceInsertClipboardContent', false, {content : 'and this is :) awesome! :0 :) what?!'});

    stop();
    setTimeout(function(){
        start();
        equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p>and this is <img class=\"jive_macro jive_emote\" src=\"'+CS_RESOURCE_BASE_URL+'/images/emoticons/happy.png\" jivemacro=\"emoticon\" ___jive_emoticon_name=\"happy\" /> awesome! <img class=\"jive_macro jive_emote\" src=\"'+CS_RESOURCE_BASE_URL+'/images/emoticons/laugh.png\" jivemacro=\"emoticon\" ___jive_emoticon_name=\"laugh\" /> <img class=\"jive_macro jive_emote\" src=\"'+CS_RESOURCE_BASE_URL+'/images/emoticons/happy.png\" jivemacro=\"emoticon\" ___jive_emoticon_name=\"happy\" /> what?!</p>');
    },0);
});

test("test mid-line emoticon", function() {
	ed.setContent('<p>first  after smile</p>');

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 6);
    rng.setEnd(ed.getBody().firstChild.firstChild, 6);
    ed.selection.setRng(rng);

    ed.selection.setContent(':');
    ed.selection.setContent(')');
    type(ed, 41);

    ed.selection.setContent('a');

	equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p>first <img class=\"jive_macro jive_emote\" src=\"' + CS_RESOURCE_BASE_URL + '/images/emoticons/happy.png\" jivemacro=\"emoticon\" ___jive_emoticon_name=\"happy\" />a after smile</p>');
});
