/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*global jiveChooseContainerForm */

jive.namespace('Navbar.Menu.Satellite');

/**
 * Handles UI for a the satellite nav menu.
 *
 * @extends jive.Navbar.Menu.AbstractListView
 * @depends path=/resources/scripts/apps/navbar/menu/view/abstract_list.js
 * @depends template=jive.nav.profileMenu
 */
jive.Navbar.Menu.Satellite.View = jive.Navbar.Menu.AbstractListView.extend(function(protect, _super) {
    var $ = jQuery;

    this.render = function(data) {
        var content = $j(jive.nav.profileMenu({satelliteMenuView:data,user:this.menuOpts.user}));
        this.setContent(content);
    };
});
