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
 * Manages transitions between interfaces within the create content popover.
 *
 * @class
 * @extends jive.AbstractFlowController
 * @extends jive.Navbar.Menu.AbstractListView
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/resolve.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/compose.js
 * @depends path=/resources/scripts/apps/shared/controllers/abstract_flow_controller.js
 * @depends path=/resources/scripts/apps/navbar/menu/view/abstract_list.js
 */
jive.Navbar.Menu.Create.CreateFlowController = jive.oo.compose(
    jive.oo.resolve({ init: 'initFlowController' }, jive.AbstractFlowController),
    jive.oo.resolve({ init: 'initListView' }, jive.Navbar.Menu.AbstractListView)
).extend(function(protect, _super) {
    protect.init = function(buttonSelector, menuSelector, transitions, initialView) {
        this.initFlowController(transitions, initialView);
        this.initListView(buttonSelector, menuSelector);

        this.views.forEach(function(view) {
            view.addListener('browse', function() {
                jQuery(menuSelector).trigger('close');
           });
        });        
    };

    this.render = function(data) {
        this.activeView = this.initialView;  // reset to the initial view
        this.activeView.render(data);
        this.setContent(this.activeView.getContent());
        this.setClass();
        this.resetHistory();
    };

    this.getContent = function() {
        return this.activeView.getContent();
    };

    protect.setContent = function(content, callback) {
        this.setClass();
        _super.setContent.call(this, content, callback);
    };

    protect.transitionTo = function(view/*, args */) {
        var args = Array.prototype.slice.call(arguments, 1)
          , controller = this
          , oldClass = this.activeView.getClass ? this.activeView.getClass() : ''
          , newClass = view.getClass ? view.getClass() : '';

        // Tell the view to render itself, wait until it is ready, and then
        // transition to it.

         var promise = view.render.apply(view, args).addCallback(function() {
            var newContent = view.getContent();
            controller.setContent(newContent, function() {
                newContent.find(':input:visible').first().focus();
            });
        });

        var viewPromise = args.last();
        if (args.last() && args.last().emitSuccess && args.last().emitError) {
            promise.addCallback(viewPromise.emitSuccess.bind(viewPromise));
            promise.addErrback(viewPromise.emitError.bind(viewPromise));
        }


    };

    protect.setClass = function() {
        var parent = this.$menu
          , newClass = this.activeView.getClass ? this.activeView.getClass() : '';

        // Remove classes set by views that are no longer visible.
        this.views.filter(function(view) {
            return view.getClass || view.getClassToRemove;
        }).forEach(function(view) {
            var klass = view.getClassToRemove ? view.getClassToRemove() : view.getClass;
            parent.removeClass(klass);
        });

        if (newClass) {
            parent.addClass(newClass);
        }
    };
});
