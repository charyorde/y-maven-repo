/*
 * Spinbutton plugin for jQuery
 * http://www.softwareunity.com/jquery/JQuerySpinBtn/
 *
 * Adds bells and whistles to any ordinary textbox to
 * make it look and feel like a SpinButton Control.
 *
 * Copyright (c) 2006-2009 Software Unity Ltd
 * Dual licensed under the MIT and GPL licenses.
 * http://www.softwareunity.com/jquery/MIT-LICENSE.txt
 * http://www.softwareunity.com/jquery/GPL-LICENSE.txt
 *
 * Originally written by George Adamson, Software Unity (george.jquery@softwareunity.com) August 2006.
 * - Added min/max options
 * - Added step size option
 * - Added bigStep (page up/down) option
 *
 * Modifications made by Mark Gibson, (mgibson@designlinks.net) September 2006:
 * - Converted to jQuery plugin
 * - Allow limited or unlimited min/max values
 * - Allow custom class names, and add class to input element
 * - Removed global vars
 * - Reset (to original or through config) when invalid value entered
 * - Repeat whilst holding mouse button down (with initial pause, like keyboard repeat)
 * - Support mouse wheel in Firefox
 * - Fix double click in IE
 * - Refactored some code and renamed some vars
 *
 * Tested in IE6, Opera9, Firefox 1.5
 * v1.0  11 Aug 2006 - George Adamson	- First release
 * v1.1     Aug 2006 - George Adamson	- Minor enhancements
 * v1.2  27 Sep 2006 - Mark Gibson		- Major enhancements
 * v1.3a 28 Sep 2006 - George Adamson	- Minor enhancements

 Sample usage:

	// Create group of settings to initialise spinbutton(s). (Optional)
	var myOptions = {
					min: 0,						// Set lower limit.
					max: 100,					// Set upper limit.
					step: 1,					// Set increment size.
					spinClass: mySpinBtnClass,	// CSS class to style the spinbutton. (Class also specifies url of the up/down button image.)
					upClass: mySpinUpClass,		// CSS class for style when mouse over up button.
					downClass: mySpinDnClass	// CSS class for style when mouse over down button.
					}

	$(document).ready(function(){

		// Initialise INPUT element(s) as SpinButtons: (passing options if desired)
		$("#myInputElement").SpinButton(myOptions);

	});

 */
(function($){
    $.fn.SpinButton = function(cfg){
        return this.each(function(){

            // Apply specified options or defaults:
            // (Ought to refactor this some day to use $.extend() instead)
            $(this).data("spinCfg", {
                //min: cfg && cfg.min ? Number(cfg.min) : null,
                //max: cfg && cfg.max ? Number(cfg.max) : null,
                min: cfg && !isNaN(parseFloat(cfg.min)) ? Number(cfg.min) : null,	// Fixes bug with min:0
                max: cfg && !isNaN(parseFloat(cfg.max)) ? Number(cfg.max) : null,
                step: cfg && cfg.step ? Number(cfg.step) : 1,
                page: cfg && cfg.page ? Number(cfg.page) : 10,
                upClass: cfg && cfg.upClass ? cfg.upClass : 'up',
                downClass: cfg && cfg.downClass ? cfg.downClass : 'down',
                reset: cfg && cfg.reset ? cfg.reset : this.value,
                delay: cfg && cfg.delay ? Number(cfg.delay) : 500,
                interval: cfg && cfg.interval ? Number(cfg.interval) : 100,
                _btn_width: 20,
                _btn_height: 12,
                _direction: null,
                _delay: null,
                _repeat: null
            });

            var that = this;
            function adjustValue(i){
                var spinCfg = $(that).data("spinCfg");
                var v = (isNaN(that.value) ? spinCfg.reset : Number(that.value)) + Number(i);
                if (spinCfg.min !== null) v = Math.max(v, spinCfg.min);
                if (spinCfg.max !== null) v = Math.min(v, spinCfg.max);
                $j(that).val(v);
                if( i!= 0) $j(that).trigger("change");
            }

            $(this)
            .addClass(cfg && cfg.spinClass ? cfg.spinClass : 'spin-button')
            .mousemove(function(e){
                // Determine which button mouse is over, or not (spin direction):
                var x = e.pageX || e.x;
                var y = e.pageY || e.y;
                var el = e.target || e.srcElement;
                var elPos = $(el).offset();
                var spinCfg = $(this).data("spinCfg");
                var direction =
                    (x > elPos.left + el.offsetWidth - spinCfg._btn_width)
                    ? ((y < elPos.top + spinCfg._btn_height) ? 1 : -1) : 0;
                if (direction !== spinCfg._direction) {
                    // Style up/down buttons:
                    switch(direction){
                        case 1: // Up arrow:
                            $(this).removeClass(spinCfg.downClass).addClass(spinCfg.upClass);
                            break;
                        case -1: // Down arrow:
                            $(this).removeClass(spinCfg.upClass).addClass(spinCfg.downClass);
                            break;
                        default: // Mouse is elsewhere in the textbox
                            $(this).removeClass(spinCfg.upClass).removeClass(spinCfg.downClass);
                    }

                    // Set spin direction:
                    spinCfg._direction = direction;
                }
            })

            .mouseout(function(){
                // Reset up/down buttons to their normal appearance when mouse moves away:
                $(this).removeClass($(this).data("spinCfg").upClass).removeClass($(this).data("spinCfg").downClass);
                $(this).data("spinCfg")._direction = null;
            })

            .mousedown(function(e){
                var spinCfg = $(this).data("spinCfg");
                if (spinCfg._direction != 0) {
                    // Respond to click on one of the buttons:
                    var self = this;
                    var adjust = function() {
                        adjustValue(spinCfg._direction * spinCfg.step);
                    };

                    adjust();

                    // Initial delay before repeating adjustment
                    spinCfg._delay = window.setTimeout(function() {
                        adjust();
                        // Repeat adjust at regular intervals
                        spinCfg._repeat = window.setInterval(adjust, spinCfg.interval);
                    }, spinCfg.delay);
                }
            })

            .mouseup(function(e){
                // Cancel repeating adjustment
                window.clearInterval($(this).data("spinCfg")._repeat);
                window.clearTimeout($(this).data("spinCfg")._delay);
            })

            .dblclick(function(e) {
                if ($.browser.msie)
                    adjustValue($(this).data("spinCfg")._direction * $(this).data("spinCfg").step);
            })

            .keydown(function(e){
                // Respond to up/down arrow keys.
                    var spinCfg = $(this).data("spinCfg");
                    switch(e.keyCode){
                    case 38: adjustValue(spinCfg.step);  break; // Up
                    case 40: adjustValue(-spinCfg.step); break; // Down
                    case 33: adjustValue(spinCfg.page);  break; // PageUp
                    case 34: adjustValue(-spinCfg.page); break; // PageDown
                }
            })

            .change(function(e){
                adjustValue(0);
            });
        });
    };
})(jQuery);