/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Menu.Apps.Dashboards');

/**
 * Handles UI for a list of bookmark items
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/navbar/menu/view/abstract_list.js
 * @depends template=jive.nav.menu.apps.dashboards.content
 */
jive.Navbar.Menu.Apps.Dashboards.ListView = jive.Navbar.Menu.AbstractListView.extend(function(protect) {
    var $ = jQuery;

    this.render = function(data) {
        var content = $(jive.nav.menu.apps.dashboards.content({links: data}));
        this.$menu.html(content);
    };

    this.toggleButton = function(count){
        var self = this;
        if (count > 1){
            self.$button.show();
        } else {
            self.$button.hide();
        }
    }
});
