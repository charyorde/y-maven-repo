define("jive.component.PopupView",["jquery"],function(b){var a=jive.oo.Class.extend(function(c){c.init=function(d){this.$element=b(d)};this.toString=function(){return"[object PopupView]"};this.show=function(f,e,h,d,g){e=e?e:f;h=h!=null?h:true;d=d!=null?d:false;this.trigger=f;this.$element.popover({context:e,closeOnClick:true,closeOtherPopovers:h,putBack:true,destroyOnClose:false,focusPopover:d})};this.hide=function(){this.$element.trigger("close")};this.getTrigger=function(){return this.trigger};this.getState=function(){return this.$element.is(":visible")?"visible":"hidden"}});a.toString=function(){return"[wrapper PopupView]"};a.getBindName=function(){return"PopupView"};return a});