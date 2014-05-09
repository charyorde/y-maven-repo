/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Navbar.Menu.Create');

/**
 * Handles UI for a list of containers in the "create" menu.
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/apps/placepicker/views/container_search_view.js
 * @depends template=jive.placepicker.containers scope=client
 */
jive.Navbar.Menu.Create.ContainerChooserView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery
      , _ = jive.Navbar.Menu.Create;

    this.getContent = function() {
        return this.content;
    };

    /**
     * Returns the CSS class that should be applied to the create menu when
     * this view is visible.
     */
    this.getClass = function() {
        return 'j-choose-container';
    };

    this.render = function() {
        var promise = new jive.conc.Promise()
          , view = this;

        // Emit an event to signal Main that this view needs data.
        this.emitP('render').addCallback(function(data) {
            var recentResults, placesList, searchView;

            view.content = $(jive.placepicker.containers(data));

            view.content.find('.back').one('click', function(event) {
                view.emit('back');
                event.preventDefault();
            });

            view.content.filter('.j-menu-quick-bottomlink').one('click', function(event) {
                view.emit('browse', data);
                event.preventDefault();
            });

            // Store a reference to recent places so that we can replace this
            // content after clearing a search.
            placesList = view.flatFind(view.content, '.j-places-list');

            searchView = new jive.Placepicker.ContainerSearchView(
                view.flatFind(view.content, 'input[name=container-filter]'),
                placesList
            );

            // Listens for a 'search' event from searchView and re-emits the
            // event.
            view.proxyListener(searchView, 'search');

            promise.emitSuccess();
        });

        return promise;
    };

    /**
     * Finds an element that may be a child of the given element or that may be
     * the element itself.
     */
    protect.flatFind = function(element, selector) {
        return element.find('*').andSelf().filter(selector);
    };
});
