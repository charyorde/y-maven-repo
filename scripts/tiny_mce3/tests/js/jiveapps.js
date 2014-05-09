/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
module("Jive Apps Plugin", {
	autostart: false
});

test("Test name goes here", function() {
    //TODO: set up your fixture
    ed.setContent('<p>initial content</p>');

    //TODO: do your test

    //verify your results
    checkContent(ed, '<p>initial content</p>', "content");
});
