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
 * @depends template=jive.tips.renderTip
 * @depends path=/resources/scripts/jquery/jquery.popover.js
 * @depends path=/resources/scripts/jquery/jquery.imagesloaded.js
 * @depends path=/resources/scripts/jquery/jquery.effectiveZIndex.js
 */
jive.Tips.TipView = jive.AbstractView.extend(function(protect) {

    protect.init = function(options) {
        this.tipView = $j.extend({}, options);
    };

    protect.getId = function() {
        return this.tipView.id;
    };

    this.hasBeenViewed = function() {
        return this.shown;
    };

    this.hasValidSelector = function() {
        var view = this;
        if (view.tipView.selector) {
            var $selector = $j(view.tipView.selector);
            var visibilityOK = (view.tipView.hiddenSelectorAllowed || $selector.is(":visible"));
            return ($selector.length > 0) && visibilityOK;
        }
        return false;
    };

    protect.getLoadSelector = function() {
        return this.tipView.loadSelector;
    };

    this.isInitialTip = function() {
        return this.initialTip;
    };

    this.render = function(tipGroup) {
        var view = this;
        this.shown = false;
        view.triggerEventType = tipGroup.triggerEventType;
        view.triggerSelector = tipGroup.triggerSelector;
        view.groupId = tipGroup.id;
        var views = tipGroup.getTipViewsWithValidSelectors();
        var index = tipGroup.findIndexById(view.getId(), views);
        this.initialTip = index == 0;
        var tipToRender = $j.extend(view.tipView, {
            groupId: view.groupId,
            count: views.length,
            first: view.initialTip,
            last: index == (views.length - 1),
            index: index
        });
        var tipElement = jive.tips.renderTip(tipToRender);
        view.$tipElement = $j(tipElement);
        view.bindTipElementHandlers(tipGroup);
    };

    protect.bindTipElementHandlers = function(tipGroup) {
        var view = this;
        view.$tipElement.find(".js-next-tip").bind('click', function(e) {
            tipGroup.showNextTip();
            e.preventDefault();
        });
        view.$tipElement.find(".js-prev-tip").bind('click', function(e) {
            tipGroup.showPreviousTip();
            e.preventDefault();
        });
        view.$tipElement.find(".js-ignore-tips").bind('click', function(e) {
            tipGroup.skip();
            e.preventDefault();
        });
        view.$tipElement.find(".js-close-tips").bind('click', function(e) {
            tipGroup.dismiss();
            e.preventDefault();
        });
    };

    this.display = function() {
        var view = this;
        view.$tipSelector = $j(view.tipView.selector).filter(":first");
        if (view.$tipSelector.length > 0) {
            var $triggerSelector = view.$tipSelector;
            if (view.triggerSelector) {
                $triggerSelector = $j(view.triggerSelector);
            }
            if ($triggerSelector.length > 0) {
                this.showTip($triggerSelector);
            } else if (console) {
                console.warn("Please ensure a valid trigger selector is specified for tip " + this.tipView.id);
            }
        } else if (console) {
            console.warn("Please ensure a valid selector is specified for tip " + this.tipView.id);
        }
    };

    protect.isTransientTrigger = function() {
        return this.isMouseoverTrigger() || this.isFocusTrigger();
    };

    protect.isMouseoverTrigger = function() {
        return this.triggerEventType == 'mouseover';
    };

    protect.isFocusTrigger = function() {
        return this.triggerEventType == 'focus';
    };

    protect.showTip = function ($triggerSelector) {
        var view = this;
        if (view.triggerEventType && view.isInitialTip()) {
            view.$triggerSelector = $triggerSelector;
            view.$triggerSelector.one(view.triggerEventType, function(e) {
                view.showPopover(e);
            });
        } else {
            var loadSelector = view.getLoadSelector();
            if (loadSelector) {
                view.showTipWithLoadSelector(loadSelector);
            } else {
                view.showPopover();
            }
        }
    };

    protect.showTipWithLoadSelector = function(loadSelector) {
        var view = this;
        var $loadSelector = $j(loadSelector);
        if ($loadSelector.length > 0) {
            if ($loadSelector.is('img')) {
                $loadSelector.imagesLoaded(function() {
                    view.showPopover();
                });
            } else {
                $loadSelector.bind('load', function() {
                    view.showPopover();
                });
            }
        } else {
            view.showPopover();
        }
    };

    protect.showPopover = function(event) {
        var view = this;
        if (!view.shown) {
            var $context = view.determineTipContext(event);
            var popoverOptions = {
                context: $context,
                closeOtherPopovers:true,
                closeOtherPopoversSelector: "BODY > .js-pop > .j-tips[data-group-id='" + view.groupId + "']"
            };
            if (view.tipView.hiddenSelectorAllowed) {
                view.handleInvisibleContext($context);
            }
            popoverOptions = $j.extend(popoverOptions, view.unbindDefocusHandlers());
            popoverOptions = $j.extend(popoverOptions, view.addCloseOptions());
            popoverOptions = $j.extend(popoverOptions, view.addOffsetOptions());
            view.$tipElement.popover(popoverOptions);

            var $popover = view.$tipElement.closest('.js-pop');
            $popover.css('z-index', $context.effectiveZIndex({ relativeTo: $popover }) + 5);

            view.bindDefocusHandlers();
            view.shown = true;
        }
    };

    protect.hasCloseSelector = function() {
        return (this.tipView.closeSelector && this.tipView.closeSelector.length > 0) || false;
    };

    protect.isCloseOnClick = function() {
        return this.hasCloseSelector() && this.tipView.closeSelector.trim().toLowerCase() == "body";
    };

    protect.addOffsetOptions = function(){
        var view = this;
        return {
             nudge: {
                top: view.tipView.belowOffset,
                bottom: view.tipView.aboveOffset
            }
        };
    };

    protect.addCloseOptions = function() {
        var view = this;
        var closeSelectorUsed = view.hasCloseSelector();
        var popoverOpts = {
            closeOnClick: closeSelectorUsed
        };
        if (closeSelectorUsed) {
            popoverOpts = $j.extend(popoverOpts, {
                closeOnClickSelector: view.tipView.closeSelector
            });
        }
        return popoverOpts;
    };

    //focus/defocus tip if we're not doing close on click (default is don't close on click)
    protect.bindDefocusHandlers = function() {
        var view = this;
        if (!view.isCloseOnClick()) {
            view.$tipElement.bind('click', function() {
                view.focusTip()
            });
            //wait a tiny bit for trigger event to bubble so we don't blur tip group on group trigger
            jive.conc.nextTick(function() {
                $j('BODY').bind('click', function(e) {
                    view.blurTip(e)
                })
            });
        }
    };

    //TODO: unbind all handlers from tip on close ???...
    protect.unbindDefocusHandlers = function() {
        var view = this;
        var popoverOpts = {};
        if (!view.isCloseOnClick()) {
            popoverOpts = $j.extend(popoverOpts, {
                onClose: function() {
                    view.$tipElement.unbind('click', view.focusTip);
                    $j("BODY").unbind('click', view.blurTip);
                    view.restoreContextVisibility();
                }
            });
        }
        return popoverOpts;
    };

    protect.determineTipContext = function(event) {
        var view = this;
        var $context = view.$tipSelector;
        if (event) {
            var $currentTarget = $j(event.currentTarget);
            var $relativeSel = $currentTarget.find(view.tipView.selector);
            if ($relativeSel.length == 0 && view.triggerSelector) {
                $relativeSel = $j(event.target).find(view.triggerSelector);
            }
            if ($relativeSel && $relativeSel.length > 0) {
                $context = $relativeSel;
            }
        }
        return $context;
    };

    protect.blurTip = function(e) {
        var view = this;
        if (view.$tipElement) {
            var $popover = view.$tipElement.parent();
            var isContained = $j(e.target).parents().andSelf().toArray().reduce(function(isContained, parent) {
                return isContained || parent == $popover[0];
            }, false);
            var isInDom = $j(e.target).parents('body').length > 0;
            if (!isContained && isInDom) {
                $popover.addClass("j-pop-blurred");
                view.restoreContextVisibility();
            }
        }
    };

    protect.focusTip = function() {
        if (this.$tipElement) {
            this.$tipElement.parent().removeClass("j-pop-blurred");
        }
    };

    protect.handleInvisibleContext = function($context) {
        var view = this;
        if (!$context.is(":visible")) {
            view.hiddenSelector = true;
            var style = $context.attr("style");
            var cssInlineDisplayMatch = style && style.match(/display:/);
            view.cssDiplayValue = (cssInlineDisplayMatch) ? $context.css("display") : "";
            $context.show();
        }
    };

    protect.restoreContextVisibility = function() {
        var view = this;
        if (view.hiddenSelector && view.$tipSelector.is(":visible")) {
            view.$tipSelector.css("display", view.cssDiplayValue);
        }
    };

    this.close = function() {
        if (this.$tipElement) {
            this.$tipElement.trigger("close");
        }
    };

});
