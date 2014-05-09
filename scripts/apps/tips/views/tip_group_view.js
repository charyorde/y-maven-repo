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
 * @depends path=/resources/scripts/apps/tips/models/tip_group_state.js
 * @depends path=/resources/scripts/apps/tips/views/tip_view.js
 * @depends path=/resources/scripts/apps/shared/controllers/localexchange.js
 */
jive.Tips.TipGroup = jive.AbstractView.extend(function(protect) {

    protect.init = function(options) {
        var view = this;
        view.id = options.id;
        view.index = options.index;
        view.triggerSelector = options.triggerSelector;
        view.triggerEventType = options.triggerEventType;
        view.dismissKey = options.dismissKey || [];
        view.tips = options.visibleTips || [];
        view.refreshSelector = options.refreshSelector;
        view.refreshTimeout = options.refreshTimeout || view.getRefreshTimeout();
        var state = options.state || {};
        view.state = new jive.Tips.TipGroupState($j.extend(state, {stateKey: view.dismissKey}));
        view.buildTipViews();
        view.bindRefreshHandler();
    };

    protect.buildTipViews = function() {
        var view = this;
        view.tipViews = [];
        view.activeTipIndex = -1;
        var currentTipId = view.state.getCurrentTipId();
        $j.each(view.tips, function(i, tip) {
            var tipView = new jive.Tips.Tip(tip);
            //set active index to tip
            if (tip.id == currentTipId){
                view.activeTipIndex = (i - 1);
            }
            view.tipViews.push(tipView);
        });
        //ensure active index is within bounds of view array
        while(view.activeTipIndex >= (view.tipViews.length - 1)){
            view.activeTipIndex--;
        }
    };

    protect.destroyTipViews = function(){
        $j.each(this.tipViews, function(i, tipView){
           tipView.close();
        });
    };

    protect.refresh = function(){
        var view = this;
        if (!view.isHidden()){
            view.destroyTipViews();
            setTimeout(function(){
                view.buildTipViews();
                view.showNextTip();
            }, view.refreshTimeout);
        }
    };

    protect.isHidden = function(){
        return this.state && (this.state.isSkipped() || this.state.isDismissed());
    };

    protect.getRefreshTimeout = function(){
        return jive.localexchange ? 1000 : 5000;
    };

    this.hasVisibleTips = function(){
        return this.getTipViewsWithValidSelectors().length > 0;
    };

    this.showNextTip = function() {
        var view = this;
        var tipViews = view.tipViews;
        if (tipViews && view.activeTipIndex < (tipViews.length - 1)) {
            view.activeTipIndex++;
            if (!view.showActiveTip()){
                view.showNextTip();
            }
        } else if (view.hasVisibleTips()) {
            view.resetSequence();
        }
    };

    this.showPreviousTip = function(){
        var view = this;
        if (view.activeTipIndex > 0) {
            view.activeTipIndex--;
            if (!view.showActiveTip()){
                view.showPreviousTip();
            }
        } else if (view.hasVisibleTips()) {
            view.resetSequence();
        }
    };

    protect.resetSequence = function(){
        var view = this;
        view.activeTipIndex = -1;
        view.showNextTip();
    };

    protect.showActiveTip = function() {
        var view = this;
        var tipView = view.getCurrentTipView();
        if (tipView){
            if (tipView.hasValidSelector()){
                tipView.render(view);                                       //render tip
                tipView.display();                                          //show tip
                view.storeState(tipView);                                   //update state if necessary
                return true;
            } else {
//                console.debug("Tip '" + tipView.getId() + "' has an unreachable selector. Showing next tip.");
                return false;
            }
        } else {
//            console.debug("No valid tip view found at index " + this.activeTipIndex + ". Showing next tip.");
            return false;
        }
    };

    protect.storeState = function(tipView) {
        var view = this;
        var currentTipId = view.state.getCurrentTipId();
        if (tipView.getId() != currentTipId) {
            view.state.setCurrentTipId(tipView.getId());
            if (currentTipId) {
                view.emit('state', view.state);
            }
        }
    };

    this.findIndexById = function(tipId, views){
        return $j.inArray(tipId, this.getTipIds(views));
    };

    protect.getCurrentTipView = function(){
        return this.tipViews[this.activeTipIndex];
    };

    this.skip = function() {
        var view = this;
        view.state.setSkipped(true);
        view.state.setDismissed(false);
        view.emit('close', view.state);
    };

    this.dismiss = function() {
        var view = this;
        view.state.setSkipped(false);
        view.state.setDismissed(true);
        view.emit('close', view.state);
    };

    protect.getTipIds = function(views) {
        return $j.map(views, function(tipView) {
            return tipView.getId();
        });
    };

    protect.getTipViewsWithValidSelectors = function(){
        var view = this;
        return $j.map(view.tipViews, function(tipView) {
            return tipView.hasValidSelector() ? tipView : null;
        });
    };

    //bind refresh selector if specified
    protect.bindRefreshHandler = function() {
        var view = this;
        if (view.hasRefreshSelector()){
            $j(view.refreshSelector).bind('click', function(e) {
                view.refresh();
                e.preventDefault();
            });
        } else if (jive.localexchange && jive.localexchange.viewupdatesource) {
            jive.localexchange.addListener("view.update.start", function() {
                if (!view.isHidden()){
                    view.destroyTipViews();
                }
            });
            jive.localexchange.addListener("view.update.stop", function() {
                if (!view.isHidden()){
                    setTimeout(function() {
                        view.buildTipViews();
                        view.showNextTip();
                    }, view.refreshTimeout);
                }
            })
        }
    };

    protect.hasRefreshSelector = function() {
        return (this.refreshSelector && this.refreshSelector.length > 0) || false;
    };
});