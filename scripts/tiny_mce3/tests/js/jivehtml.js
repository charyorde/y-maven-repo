/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
module("Jive HTML Plugin", {
	autostart: false
});

test("test nbsp; to whitespace", function() {
	ed.setContent('<p>asdf</p><p> </p>');

	equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p>asdf</p><p> </p>');
});


test("test nbsp; to whitespace 2", function() {
	ed.setContent('<p>&nbsp; asdf &nbsp; &nbsp; asdf</p>');

	equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p>  asdf     asdf</p>');
});
