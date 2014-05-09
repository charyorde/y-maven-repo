/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Menu');  // Creates the jive.Navbar.Menu.Bookmarks namespace if it does not already exist.

/**
 * Abstract controller class for a navbar menu.
 *
 * @param {jQuery|DOMElement|String} buttonSelector reference or selector to the menu button
 * @param {jQuery|DOMElement|String} menuSelector reference or selector to the menu container
 *
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/abstract.js
 * @depends path=/resources/scripts/apps/navbar/menu/view/abstract_list.js
 */
jive.Navbar.Menu.Main = jive.oo.Class.extend(function(protect) {

    protect.init = function(buttonSelector, menuSelector, menuOpts) {
        
        var main = this;  // Captures a reference to this instance.
        this.initialized = false;
        this.listView = this.buildListView(buttonSelector, menuSelector, menuOpts);

        // Set up component instances.
        this.itemSource = this.buildItemSource();

        //on button click, show the menu
        this.listView.addListener('toggle', function(promise) {
            // Retrieve existing items.
            main.populate(promise);
        });
        
    };

    protect.populate = function(promise) {
        var main = this;  // Captures a reference to this instance.
        if (!main.initialized) {
            //if an item source is defined, use it
            if (main.itemSource != null) {
                main.itemSource.findAll(main.sourceParams()).addCallback(function(data) {
                    promise.emitSuccess(data);
                    main.initialized = true;
                });
            }
            else {
                //if no item source, nothing to do (assuming a pre-rendered menu)
                promise.emitSuccess({});
                main.initialized = true;
            }
        }
        else {
            promise.emitSuccess();
        }
        return promise;
    };

    /**
     * Invalidate the menu so it is fully rebuilt on any successive calls
     */
    protect.invalidate = function(){
        this.initialized = false;
    };

    protect.sourceParams = function() {
        return {};
    };

    protect.buildListView = jive.oo._abstract;
    protect.buildItemSource = jive.oo._abstract;
});
