/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

module("Jive Alignment Plugin", {
	autostart: false
});

test("test aligning paragraph", function() {
	ed.setContent('<p>first </p>', {format: 'raw'});

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild, 6);
    rng.setEnd(ed.getBody().firstChild.firstChild, 6);
    ed.selection.setRng(rng);

    ed.execCommand('JustifyRight');

	equals(ed.getContent(), '<p style=\"text-align: right;\">first </p>');
});


test("test aligning underlined paragraph", function() {
	ed.setContent('<p><span style="text-decoration: underline;">first </span></p>');

    var rng = ed.dom.createRng();
    rng.setStart(ed.getBody().firstChild.firstChild.firstChild, 6);
    rng.setEnd(ed.getBody().firstChild.firstChild.firstChild, 6);
    ed.selection.setRng(rng);

    ed.execCommand('JustifyRight');

	equals(ed.getContent(), '<p style=\"text-align: right;\"><span style=\"text-decoration: underline;\">first </span></p>');
});
