/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*global jiveChooseContainerForm */

jive.namespace('Navbar.Menu.Create');

/**
 * Handles UI for a list of content and place types in the "create" menu.
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.nav.menu.create.contentTypes scope=client
 */
jive.Navbar.Menu.Create.TypeChooserView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    this.getContent = function() {
        return this.content;
    };

    /**
     * Returns the CSS class that should be applied to the create menu when
     * this view is visible.
     */
    this.getClass = function() {
        if (this.data && !this.data.smallView) {
            return 'j-choose-type j-large-view';
        } else {
            return 'j-choose-type j-small-view';
        }
    };

    /**
     * Make sure that all of the classes that this view could set are removed
     * when transitioning away from it.
     */
    this.getClassToRemove = function() {
        return 'j-choose-type j-small-view j-large-view';
    };

    this.render = function(data) {
        var content = $(jive.nav.menu.create.contentTypes(this.data || data))
          , promise = new jive.conc.Promise()
          , menu = this;

        menu.$items = content.filter('.js-create-list');
        menu.$items.find('a').click(function(){
            var contentType = $(this).attr('data-content-type')
              , upload = !!$(this).attr('data-upload');

            menu.showSpinner({size: 'small', showLabel: false, context: $(this).parent('li')});

            if (contentType && $(this).hasClass("js-createmenu-containerchooser")) {
                menu.emitP('contentType', contentType, upload).always(function() {
                    menu.hideSpinner();
                });
                return false;
            }
        });

        menu.$items.find('a.quick').click(function() {
            var contentType = $(this).attr('data-content-type'),
            url = $(this).data('quick-create-url');
            menu.emit('quickCreate', contentType, url);
            return false;
        });

        menu.flatFind(content, '.js-use-small-menu').click(function(event) {
            menu.emit('toggleView', true);
            menu.data.smallView = true;
            event.preventDefault();
        });

        menu.flatFind(content, '.js-use-large-menu').click(function(event) {
            menu.emit('toggleView', false);
            menu.data.smallView = false;
            event.preventDefault();
        });

        this.content = content;
        this.data = this.data || data;

        promise.emitSuccess();
        return promise;
    };

    protect.flatFind = function(content, selector) {
        return content.find(selector).andSelf().filter(selector);
    };
});
