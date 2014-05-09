/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint laxbreak: true */

jive.namespace('Tips');  // Creates the namespace if it does not already exist.

/**
 * @depends path=/resources/scripts/apps/tips/views/tip_view_view.js
 */
jive.Tips.Tip = jive.AbstractView.extend(function(protect) {

    protect.init = function(options) {
        var view = this;
        view.id = options.id;
        var views = options.views || [];
        if (!options.views) {
            views.push(options);
        }
        this.views = $j.map(views, function(tipView) {
            return new jive.Tips.TipView($j.extend(tipView, {id: view.id}));
        });
    };

    protect.getActiveTipView = function() {
        return this.views[this.getValidSelectorIndex()];
    };

    this.getId = function() {
        return this.id;
    };

    this.hasValidSelector = function() {
        return this.getValidSelectorIndex() > -1;
    };

    protect.getValidSelectorIndex = function() {
        var view = this;
        for (var i = 0; i < view.views.length; i++) {
            var tipView = view.views[i];
            if (tipView.hasValidSelector()) {
                return i;
            }
        }
        return -1;
    };

    this.isInitialTip = function() {
        return this.getActiveTipView().isInitialTip();
    };

    this.render = function(tipGroup) {
        this.getActiveTipView().render(tipGroup);
    };

    this.display = function() {
        this.getActiveTipView().display();
    };

    this.close = function() {
        if (this.hasValidSelector()){
            this.getActiveTipView().close();
        }
    };

});
