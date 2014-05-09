/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint laxbreak:true */

/**
 * Manages transitions between views.
 *
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/abstract.js
 * @depends path=/resources/scripts/lib/core_ext/object.js
 */
jive.AbstractFlowController = jive.oo.Class.extend(function(protect) {
    protect.init = function(transitions, initialView) {
        var controller = this;

        this.initialView = initialView;
        this.activeView = initialView;
        this.transitions = transitions;
        this.events = Object.keys(transitions);
        this.views = [initialView].concat(Object.values(transitions)).unique();
        this.resetHistory();

        controller.views.forEach(function(view) {
            controller.events.forEach(function(event) {
                view.addListener(event, function(/* args */) {
                    var args = Array.prototype.slice.call(arguments)
                      , view = controller.transitions[event];

                    controller.transitionTo.apply(controller, [view].concat(args));
                    controller.viewHistory.push({
                        view: view,
                        args: args
                    });
                    controller.activeView = view;
                });
            });

            view.addListener('back', function() {
                controller.viewHistory.pop();

                var prev = controller.viewHistory.last()
                  , view = prev.view
                  , args = prev.args;

                if (controller.transitionBack) {
                    controller.transitionBack.apply(controller, [view].concat(args));
                } else {
                    controller.transitionTo.apply(controller, [view].concat(args));
                }

                controller.activeView = view;
            });
        });
    };

    protect.transitionTo = jive.oo._abstract;

    protect.resetHistory = function() {
        this.viewHistory = [{ view: this.initialView, data: [] }];
    };
});
