/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ActivityStream');

/**
 * @depends path=/resources/scripts/apps/direct_messaging/factory.js
 * @depends path=/resources/scripts/apps/navbar/menu/create/models/quick_create_source.js
 * @depends path=/resources/scripts/apps/navbar/menu/create/views/quick_create_view.js
 *
 */
jive.ActivityStream.CreateMenuView = jive.oo.Class.extend(function(protect) {

    this.init = function(options) {
        var main = this;
        main.createMenuData = options.createMenuData;

    };

    this.postRender = function() {
        var main = this;
        main.quickUrl='#';
        main.quickCreateSource = new jive.Navbar.Menu.Create.QuickCreateSource();
        main.quickCreateView = new jive.Navbar.Menu.Create.QuickCreateView();
        main.quickCreateView.addListener("fetch", function(promise) {
            main.quickCreateSource.fetch(main.quickUrl, promise);
        });
        main.$upMenu = $j('#j-as-create-menu-items');
        main.$downMenu = $j('#j-as-create-menu-pop');
        main.$menuItems = main.$upMenu.find('.j-as-create-item');
        main.$moreBtn = $j('#as-create-menu-more');

        main.$upMenu.off().on('click', 'a.quick', main.handleQuickCreate.bind(main));
        main.$downMenu.off().on('click', 'a.quick', main.handleQuickCreate.bind(main));
        main.$moreBtn.off().on('click', main.showDownMenu.bind(main));
        $j(window).resize(main.handleResize.bind(main));
//        main.handleResize();
    };

    this.handleQuickCreate = function(e) {
        var main = this,
            $link = $j(e.target),
            contentType = $link.attr('data-content-type');
            main.$downMenu.trigger('close');
            // perform different actions based on content type
            if (jive.DirectMessaging.isContentTypeEqualTo(contentType)) {
                // Direct messaging content type
                jive.DirectMessaging.create({trackingID: 'cmenu'}).showModal();
            } else {
                main.quickUrl = $link.data('quick-create-url');
                main.quickCreateView.render();
            }
        e.preventDefault();
    };

    this.showDownMenu = function(e) {
        var main = this,
            $link = $j(e.target),
            upMenuWidth = main.$upMenu.outerWidth(),
            accumulatedWidth = 0,
            itemKeysNotShowing = [],
            popMenuItems = [],
            contentItems = main.createMenuData.sections[0].items;
        e.preventDefault();

        main.$menuItems.each(function() {
            var $item = $j(this);
            accumulatedWidth += $item.outerWidth();
            if (accumulatedWidth > upMenuWidth) {
                itemKeysNotShowing.push($item.data('ident'));
            }
        });
        for (var i = 0, createMenuItemLength = contentItems.length; i < createMenuItemLength; i++) {
            if ($j.inArray(contentItems[i].nameKey, itemKeysNotShowing) != -1) {
                popMenuItems.push(contentItems[i]);
            }
        }
        main.$downMenu.html(jive.home.activityStreamCreateMenuPopover({menuItems:popMenuItems}));
        main.$downMenu.popover({
            context: $link,
            destroyOnClose: false,
            putBack: true
        });
    };

    this.handleResize = function() {
        var main = this,
            upMenuWidth = main.$upMenu.outerWidth(true),
            createMenuItemsTotalWidth = 0;
        main.$menuItems.each(function() {
            createMenuItemsTotalWidth += $j(this).outerWidth(true);
        });
        if (upMenuWidth >= createMenuItemsTotalWidth - 1) {
            main.$moreBtn.hide();
        }
        else {
            main.$moreBtn.show();
        }
    };

});

