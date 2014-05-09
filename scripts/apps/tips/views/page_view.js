/*
 * $Revision$
 * $Date$
 *
 * A view class for the tips subsystem.
 * 
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/apps/tips/views/tip_group_view.js
 */

jive.namespace('Tips');  // Creates the namespace if it does not already exist.

jive.Tips.PageView = jive.AbstractView.extend(function(protect) {

    protect.init = function(opts) {
        var view = this;
        view.currentTipGroupIndex = 0;
        view.tipGroups = opts.tipGroups || [];
        view.asyncLoad = (typeof opts.asyncLoad != 'undefined') ? opts.asyncLoad : true;
        if (view.tipGroups.length > 0) {
            view.handleAsyncLoad(function() {
                view.showNextTipGroup(view.tipGroups[0]);
            });
        }
    };

    protect.showNextTipGroup = function(tipGroup) {
        var view = this;
        tipGroup.index = view.currentTipGroupIndex;
        var tipGroupView = new jive.Tips.TipGroup(tipGroup);
        if (tipGroupView.hasVisibleTips()) {
            view.addListeners(tipGroupView);
            //show first tip
            tipGroupView.showNextTip();
        } else {
            if (view.hasUnviewedTipGroups()) {
                view.showNextTipGroup(view.tipGroups[++view.currentTipGroupIndex]);
            }
        }
    };

    protect.addListeners = function(tipGroupView) {
        var view = this;
        //handle state update events
        tipGroupView.addListener('state', function(state) {
            view.emit('state', state);
        });
        //handle state update events
        tipGroupView.addListener('close', function(state) {
            view.emit('state', state);
            //if not all tip groups have been shown, show the next on close of the previous
            if (view.hasUnviewedTipGroups()) {
                view.showNextTipGroup(view.tipGroups[++view.currentTipGroupIndex]);
            }
        });
    };

    protect.hasUnviewedTipGroups = function(){
        return this.currentTipGroupIndex < (this.tipGroups.length - 1);
    };

    protect.handleAsyncLoad = function(fn) {
        var view = this;
        if (view.asyncLoad) {
            jive.conc.nextTick(fn);
        } else {
            fn();
        }
    };

});