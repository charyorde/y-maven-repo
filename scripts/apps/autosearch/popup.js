/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
define(
    "jive.component.PopupView",
    ['jquery'],
    function($)
    {
        var PopupView = jive.oo.Class.extend(
            function(protect){
                protect.init = function(element){
                    this.$element = $(element);
                };
                this.toString = function(){return "[object PopupView]";};
                this.show = function(trigger, anchor, exclusive, focus, autoclose){
                    //TODO allow these properties for be attribute driven
                    anchor = anchor ? anchor : trigger;
                    exclusive = exclusive != null ? exclusive : true ;
                    focus = focus != null ? focus : false;
                    this.trigger = trigger;
                    this.$element.popover({
                        context: anchor,
                        closeOnClick: true, //Might want to make this configurable
                        closeOtherPopovers: exclusive,
                        putBack: true,
                        destroyOnClose: false,
                        focusPopover: focus
                    });
                };
                this.hide = function(){
                    this.$element.trigger("close");
                };
                this.getTrigger = function(){
                    return this.trigger;
                };
                this.getState = function(){
                    return this.$element.is(":visible") ? "visible" : "hidden";
                };
            }
         );
        PopupView.toString = function(){return "[wrapper PopupView]";};
        PopupView.getBindName = function(){return "PopupView";};

        return PopupView;
    }
);