/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*
* $ popover
* By: Buck Wilson
* Version : 1.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/*jshint curly:false */

/*
 * @depends path=/resources/scripts/jive/accessibility.js
 * @depends path=/resources/scripts/jquery/jquery.pop.js
 * @depends path=/resources/scripts/jquery/ui/effects.core.js
 */

(function($) {

    $.fn.popover = function(options) {
        var opts = $.extend({}, $.fn.popover.defaults, options);
        if (opts.closeOtherPopovers === true) {
            $(opts.closeOtherPopoversSelector).trigger("close");
        }
        return this.each(function() {
            var $context = opts.context,
                $self = $(this).addClass('j-pop-main'),
                viewport = { // calculate viewable area.
                             "left": $(window).scrollLeft() + 10,
                             "right": $(window).scrollLeft() + $(window).width() - 10,
                             "top": $(window).scrollTop() + 10,
                            "bottom": $(window).scrollTop() + $(window).height() - 10
                },
                arrowPosition,
                $popover = $('<div class="j-pop js-pop" />').addClass(opts.addClass),
                $arrow,
                arrowBackgroundPosition,
                $selfParent = $(this).parent();

            if($self.data("closePopover")){
                ($self.data("closePopover"))();
                $self.removeData("closePopover");
                return;
            }



            if(opts.returnPopover){
                $.extend(options,
                {
                    popOver: $popover,
                    closeFunc: closePopover
                });
            }

            if (!opts.container || opts.container.length === 0) {
                opts.container = $('body');
            }

            if (opts.container.is('body')) {
                opts.containerOffset = { top: 0, left: 0};
            } else {
                opts.containerOffset = opts.container.offset();
            }

            // JIVE-17874 $self must be shown *after* being appended to the DOM
            $popover.append($self);
            $self.show();

            $popover.appendTo(opts.container).show().css('visibility', 'hidden');    /* get it in the DOM and hidden so I can reliably pull dimensions */

            function popoverPosition(pDims) {
                var belowArrowHeight = 11,
                    aboveArrowHeight = 18,
                    leftArrowWidth = 14,
                    rightArrowWidth = 14,
                    position;

                if (!pDims) {
                    pDims = {
                        "width": $popover.outerWidth(),
                        "height": $popover.outerHeight()
                    };

                    if(opts.position == "below") {
                        pDims.height = pDims.height + belowArrowHeight;
                    } else if (opts.position == "above") {
                        // no change
                    } else if (opts.position == "left") {
                        pDims.width = pDims.width + leftArrowWidth;
                    } else if (opts.position == "right") {
                        pDims.width = pDims.width + rightArrowWidth;
                    }
                }

                /* -- Set initial position --*/
                if(opts.position == "below") {
                    position = {
                        "top"   :   $context.offset().top + $context.outerHeight() + belowArrowHeight,
                        "left"  :   $context.offset().left - ((pDims.width - $context.outerWidth())/2)
                    };
                } else if (opts.position == "above") {
                    position = {
                        "top"   :   $context.offset().top - (pDims.height + aboveArrowHeight),
                        "left"  :   $context.offset().left - ((pDims.width - $context.outerWidth())/2)
                    };
                } else if (opts.position == "left") {
                    position = {
                        "top"   :   $context.offset().top - ((pDims.height - $context.outerHeight())/2),
                        "left"  :   $context.offset().left - pDims.width
                    };
                } else if (opts.position == "right") {
                    position = {
                        "top"   :   $context.offset().top - ((pDims.height - $context.outerHeight())/2),
                        "left"  :   $context.offset().left + $context.outerWidth() + rightArrowWidth
                    };
                } else {
                    position = {
                        "top"   :   $context.offset().top + $context.outerHeight(),
                        "left"  :   $context.offset().left - ((pDims.width - $context.outerWidth())/2)
                    };
                }

                if (opts.nudge.top) {
                    position.top = position.top + opts.nudge.top;
                }

                if (opts.nudge.left) {
                    var nl = Math.min(((pDims.width - $context.outerWidth())/2) - 20, opts.nudge.left);
                    position.left = position.left + nl;
                }

                /*-- adjust position and viewport dimensions based on container offset --*/

                position.left -= opts.containerOffset.left;
                position.top -= opts.containerOffset.top;

                viewport.left -= opts.containerOffset.left;
                viewport.right -= opts.containerOffset.left;
                viewport.top -= opts.containerOffset.top;
                viewport.bottom -= opts.containerOffset.top;

                if (opts.adjust) {
                    if (opts.position == "above" || opts.position == "below") {
                        // make sure it fits left/right in the viewport.
                        if (position.left < viewport.left) {
                            position.left = viewport.left;
                        } else if (position.left + $popover.outerWidth() > viewport.right) {
                            position.left = viewport.right - $popover.outerWidth() - 5;
                            // account for a possible scrollbar popping in due to popover contents being long, 5 px
                            // seems to work
                        }

                    }

                    if (opts.position == "left" || opts.position == "right") {
                        //make sure it fits top/bottom in the viewport.
                        if (position.top < viewport.top) {
                            position.top = viewport.top;
                        } else if (position.top + $popover.outerHeight() > viewport.bottom) {
                            position.top = viewport.bottom - $popover.outerHeight();
                        }
                    }
                }

                // Reset initial arrow position.
                arrowPosition = opts.position;

                if (opts.flip) {
                    if (opts.position == "above") {
                        if (position.top < viewport.top && $context.offset().top + $context.outerHeight() + $popover.outerHeight() < viewport.bottom) {
                            position.top = $context.offset().top + $context.outerHeight() + belowArrowHeight - opts.containerOffset.top;
                            opts.flipCallback();
                            arrowPosition = "below";
                        }
                    } else if (opts.position == "below") {
                        if (position.top + $popover.outerHeight() > viewport.bottom && $context.offset().top - $popover.outerHeight() > viewport.top) {
                            position.top = $context.offset().top - (pDims.height + aboveArrowHeight) - opts.containerOffset.top;
                            opts.flipCallback();
                            arrowPosition = "above";
                            if (opts.nudge.bottom){
                                position.top += opts.nudge.bottom;
                            }
                        }
                    } else if (opts.position == "left") {
                        if (position.left < viewport.left && $context.offset().left + $context.outerWidth() + $popover.outerWidth()+rightArrowWidth < viewport.right) {
                            position.left = $context.offset().left+ $context.outerWidth() + rightArrowWidth - opts.containerOffset.left;
                            opts.flipCallback();
                            arrowPosition = "right";
                        }
                    } else if (opts.position == "right") {
                        if (position.left + $popover.outerWidth() > viewport.right && $context.offset().left - $popover.outerWidth()-leftArrowWidth > viewport.left) {
                            position.left = $context.offset().left - $popover.outerWidth() - leftArrowWidth - opts.containerOffset.left;
                            opts.flipCallback();
                            arrowPosition = "left";
                        }
                    }
                }

                // adjust the arrow if needed - arrowAdjust makes the arrow smaller by positioning the popover closer to the arrow
                if(opts.arrowAdjust && arrowPosition == "left"){
                    position.left += (opts.arrowAdjust*2 - 1);
                }else if(opts.arrowAdjust && arrowPosition == "right"){
                    position.left -= (opts.arrowAdjust*2 - 1);
                }

                return position;
            }




            function arrowProperties(position) {
                var props = {
                    top: '',
                    left: ''
                };
                var a, b;

                if (arrowPosition == "above" || arrowPosition == "below") {
                    a = $context.offset().left - position.left + (($context.outerWidth() - $arrow.outerWidth()) / 2);
                    b = opts.containerOffset.left + opts.arrowAdjust / 2;

                    props.left = Math.round(a - b);
                } else {
                    a = $context.offset().top - position.top + (($context.outerHeight() - $arrow.outerHeight()) / 2);
                    b = opts.containerOffset.top - opts.arrowAdjust / 2;

                    props.top = Math.round(a - b);
                }

                if (opts.arrowAdjust && arrowPosition == "left") {
                    props.left = props.left - opts.arrowAdjust;
                    //
                    // since the arrow is sprited, we also need to adjust the background position
                    var bp = arrowBackgroundPosition.split(' ');
                    bp[0] = parseFloat(bp[0]) - opts.arrowAdjust + "px";
                    props['background-position'] = bp.join(' ');
                } else if (opts.arrowAdjust && arrowPosition == "right") {
                    props.left = props.left + opts.arrowAdjust;
                }

                return props;
            }

            (function() {
                var position = popoverPosition();

                /*-- clear out all arrows if there are any (just in case)--*/
                $popover.find('span.pointer').remove();

                /*-- add the arrow and position the popover --*/
                $popover
                        .append($('<span class="' + arrowPosition + 'Arrow pointer"></span>'))
                        .addClass('popover').css({position: "absolute", top: position.top , left: position.left})
                        .appendTo(opts.container).css('visibility', 'visible');
                $popover.children().show();
                
                /* calculate arrow positioning */
                $arrow = $popover.find('.pointer');
                arrowBackgroundPosition = $arrow.css('background-position');  // record the initial background position of the arrow

                if(opts.arrowAdjust){
                    $arrow.width($arrow.width() - opts.arrowAdjust);
                    $arrow.height($arrow.height() - opts.arrowAdjust);
                }

                setArrowProperties($arrow, arrowProperties(position));
                $(window).one('resize', closePopover);
                if(opts.focusPopover){
                    jive.conc.nextTick(focusPopoverControl);
                }
                opts.onLoad();
            })();


            /*----------------------------------------------------
               Bind Events
            ---------------------------------------------------- */

            $self.autoclose($.extend({}, opts, {
                onClose: removePopover,
                decoration: $popover
            }));

            var accessibility = new jive.Accessibility({
                scope: $self,
                hoverSelection: opts.focusPopover,
                otherActions: [
                    function closeOnEscape(ev){
                        if(ev.keyCode == 27){ //esc
                            removePopover(ev);
                            $context.focus();
                            return false;
                        }
                    },
                    jive.Accessibility.focusRingAction($self),
                    jive.Accessibility.menuSelectAction($self, null, true)
                ]
            });

            if(opts.allowResize) $self.bind('popover.html', resizePopover);
            if(opts.allowResize) $self.bind('popover.resize', resizeWithoutContent);
            $self.bind('eject', ejectPopover);

            function focusable() {
                return $self.find("a, input, select, textarea, button");
            }

            function focusPopoverControl(){
                focusable().first().focus();
            }

            function ejectPopover() {
                $popover.before($self).remove();
            }

            function closePopover() {
                $self.trigger('close');
            }

            function removePopover(e) {
                opts.beforeClose();

                if (opts.destroyOnClose) {
                    $popover.remove();
                } else {
                    if (opts.putBack) {
                        $selfParent.append($self.hide());
                        $popover.remove();
                    }
                    $popover.hide();
                }

                $self.unbind('popover.html', resizePopover);
                $self.unbind('popover.resize', resizeWithoutContent);
                $self.unbind('eject', ejectPopover);
                $self.removeData("closePopover");
                $(window).off('resize', closePopover);
                accessibility.teardown();

                return opts.onClose();
            }

            $self.data("closePopover", closePopover);

            function resizeWithoutContent(event, options, callback) {
                return resizePopover(event, null, options, callback);
            }

            /**
             * Resizes the popover with some animation to fit the given
             * content.  If no content is given then resizes the popover to fit
             * whatever content is already in it.
             */
            function resizePopover(event, content, options, callback) {
                var newContent = $(content)
                  , startingWidth = $popover.width()
                  , startingHeight = $popover.height()
                  , finalWidth
                  , finalHeight
                  , position;

                if ($.isFunction(options)) {
                    callback = options;
                    options = null;
                }

                options = $.extend({}, opts, options);

                $popover.css({
                    width: 'auto',
                    height: 'auto'
                });

                withContent($self, newContent, function() {
                    // Add one pixel for IE to render correctly on.
                    finalWidth = $popover.width() + 1;
                    finalHeight = $popover.height();

                    position = popoverPosition({
                        width: $popover.outerWidth(),
                        height: $popover.outerHeight()
                    });
                });

                $popover.css({
                    width: startingWidth,
                    height: startingHeight
                });

                if (options.fade) {
                    // cross-fade
                    if (!$.browser.msie || parseFloat($.browser.version) > 8) {
                        $self.animate({
                            opacity: 0
                        }, options.duration / 2, function() {
                            if (content) {
                                $self.html(newContent);
                            }
                            $self.animate({
                                opacity: 1
                            }, options.duration / 2);
                        });

                    } else if (content) {
                        // IE does not handle this "fade" thing very well.
                        $self.children().detach();
                        setTimeout(function() {
                            $self.html(newContent);
                        }, options.duration);
                    }

                } else if (content) {
                    $self.html(newContent);
                }

                // Make sure that the arrow does not disappear during the animation.
                $popover.css('overflow', 'visible');

                // resize the popover
                $popover.animate({
                    left: position.left,
                    top: position.top,
                    width: finalWidth,
                    height: finalHeight
                }, options.duration, options.easing, function() {
                    if (typeof callback == 'function') {
                        callback.apply($self);
                    }
                });

                // Reset overflow.
                $popover.css('overflow', '');

                animateArrow(position, options);
            }

            function animateArrow(position, options) {
                var props = arrowProperties(position)
                  , backgroundPosition = props['background-position']
                  , otherProps = {};

                Object.keys(props).forEach(function(key) {
                    if (key != 'background-position' && !!props[key]) {
                        otherProps[key] = props[key];
                    }
                });

                $arrow.animate(otherProps, options.duration, options.easing);

                setTimeout(function() {
                    $arrow.removeClass().addClass(arrowPosition +'Arrow pointer');

                    try {
                        $arrow.css('background-position', backgroundPosition);
                    } catch(e) {
                        // if there's an error in a background position property,
                        // possibly from theming/old browser, we don't want it to
                        // completely kill the popover
                        console.error(e);
                    }
                }, options.duration / 2);
            }
        });

        function setArrowProperties(arrow, props) {
            var backgroundPosition = props['background-position']
              , otherProps = {};

            Object.keys(props).filter(function(key) {
                return key != 'background-position' && !!props[key];
            }).forEach(function(key) {
                otherProps[key] = props[key];
            });

            arrow.css(otherProps);

            try {
                arrow.css('background-position', backgroundPosition);
            } catch(e) {
                // if there's an error in a background position property,
                // possibly from theming/old browser, we don't want it to
                // completely kill the popover
                console.error(e);
            }
        }

        /**
         * Temporarily replaces the content of the popover with the given
         * content.  After the given callback is called the original content is
         * replaced.  This is useful for calculating the final size of the
         * popover before beginning an animation.
         *
         * Returns the return value of the callback.
         */
        function withContent(parent, content, callback) {
            var origContent = parent.children(), ret;

            if (content && content.length > 0) {
                origContent.detach();
                content.appendTo(parent);
            }

            ret = callback();

            if (content && content.length > 0) {
                content.detach();
                origContent.appendTo(parent);
            }

            return ret;
        }
    };

    var iPad = navigator.userAgent.match(/iPad/i) != null;

    $.fn.popover.defaults = {
        context: $(),                       // the element the popover points to
        container: $('body'),               // the container the popover is inside & relative to

        // display
        position: "below",                  // default position
        nudge: {},                          // note: flip and adjust may override nudge
        adjust: true,                       // whether to adjust the popover to fit in the window
        flip: true,                         // whether to flip the popover to fit in the window
        arrowAdjust: 0,                     // adjusts the arrow inwards to shrink the arrow

        // callbacks
        flipCallback: $.noop,
        beforeClose: $.noop,
        onClose: $.noop,
        onLoad: $.noop,

        // behavior
        destroyOnClose: true,
        closeOtherPopovers: false,
        closeOtherPopoversSelector: "BODY > .j-pop > *",
        returnPopover: false,
        putBack: false,
        focusPopover: true,
        closeOnBlur: false,

        darkPopover: false,                   // adds a dark popover class to the container.
        addClass: "",

        // resize animation options
        fade: true,
        duration: iPad ? 0 : 400,
        easing: 'easeInOutQuint',
        allowResize: true
    };

})(jQuery);
