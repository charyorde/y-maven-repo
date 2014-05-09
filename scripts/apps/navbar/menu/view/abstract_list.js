/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Menu');

/*globals $j */

/**
 * Handles UI for a list of bookmark items
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/abstract.js
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.nav.loading
 */
jive.Navbar.Menu.AbstractListView = jive.AbstractView.extend(function(protect, _super) {

    this.init = function(buttonSelector, menuSelector, menuOpts) {
        var self = this;

        self.$menu = $j(menuSelector);
        self.$button = $j(buttonSelector);
        self.menuOpts = menuOpts || {};
        self.popoverOpen = false;

        //handle button click
        self.$button.click(function(event) {
            if (!self.popoverOpen) {
                self.$button.addClass('active');
                self.showSpinner();

                if (self.spinning) {
                    self.spinning = false;
                    self.openPopover();
                    self.spinning = true;
                }

                //emit an event for the controller to handle, and add callback for view
                self.emitP('toggle').addCallback(function(data) {
                    self.data = data || self.data;

                    //call render method on an extending class
                    self.render(self.data);

                    //hide or show as necessary
                    self.openPopover();
                }).always(function() {
                    self.hideSpinner();
                });
            }

            //propogate event, but don't follow link, so thoer popovers close
            event.preventDefault();
        });

    };

    this.render = jive.oo._abstract;

    protect.setContent = function(content, callback) {
        this.content = $j(content);

        if (this.popoverOpen) {
            this.$menu.trigger('popover.html', [this.content, callback]);
        } else {
            this.$menu.children().remove();
            this.$menu.append(this.content);
            if (callback) { callback(); }
        }
    };

    this.getContent = function() {
        this.content = this.content || this.$menu.children();
        return this.content;
    };

    this.close = function(){
        this.$menu.trigger('close');
    };

    protect.createSpinner = function() {
        if (!this.popoverOpen) {
            this.spinner = new jive.loader.LoaderView();
            this.setContent(this.spinner.getContent());
            this.openPopover();
        } else {
            _super.createSpinner.call(this);
        }

        this.spinning = true;
    };

    protect.destroySpinner = function() {
        this.spinning = false;
        _super.destroySpinner.call(this);
        if (this.spinner) {
            this.spinner.destroy();
        }
    };

    protect.openPopover = function() {
        var self = this;

        if (!self.popoverOpen && !self.spinning) {
            self.$button.addClass('active');
//            self.$menu.css('width', '260px');
            self.$menu.popover($j.extend({
                context: self.$button,
                onClose: function() {
                    self.$button.removeClass('active');
                    self.popoverOpen = false;
                },

                onLoad: function() {
                    // Notify listeners that this popover has been opened
                    self.$menu.trigger('navbarPopoverLoad');
                }
            }, self.menuOpts));

            self.popoverOpen = true;
        }
    };
});
