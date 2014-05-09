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
    "jive.component.ProgressMeterView",
    ['jquery'],
    function($)
    {
        var ProgressMeterView = jive.oo.Class.extend(
            function(protect){
                protect.init = function(element){
                    this.$element = $(element);
                };
                this.toString = function(){return "[object ProgressMeterView]";};
                this.start = function(){
                    if (!this.spinner) {
                        this.spinner =  new jive.loader.LoaderView({inline: true, showLabel: false, size: this.$element.attr("data-size")});
                        this.spinner.appendTo(this.$element);
                        this.$element.attr("data-active",true);
                    }
                };

                this.stop = function(){
                    if (this.spinner) {
                        this.spinner.getContent().remove();
                        this.spinner.destroy();
                        this.$element.attr("data-active",false);
                    }
                };

                this.getMode = function(){
                    var mode = this.$element.data("mode");
                    return mode ? mode : "undetermined";
                };
                this.isActive = function(){
                    var active = this.$element.data("active");
                    return active ? active : false;
                };

            }
         );
        ProgressMeterView.toString = function(){return "[wrapper ProgressMeterView]";};
        ProgressMeterView.getBindName = function(){return "ProgressMeterView";};

        return ProgressMeterView;
    }
);