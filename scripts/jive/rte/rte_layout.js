/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * RTELayout manages the DOM for the RTE, taking care of its size and position.  It's more or less the view class
 * for our non-tinymce RTE code.
 *
 * Normally (as invoked via RTEWrap), the RTE's dom lives in a div at the bottom of the containing page's body,
 * with a z-index of 100.  The idea is to put it on top of everything else, so that it's popovers display properly.
 *
 * If you set the domExists option to true, then it won't construct a dom.  RTE.js uses RTELayout in this mode
 * when it's invoked directly (which shouldn't happen in new code).
 *
 * @events toggleHtml, setPreferred, resized
 * @param options required: $element, toggleText, alwaysUseTabText
 *                optional: domExists, shouldFloat, destinationPosition, readOnlyMessage, editDisabledText, editDisabledSummary, communityName
 */
jive.rte.RTELayout = function(options){
    //Core instance variables
    var that = this;
    var $editorPanel;
    var rte = null;

    //RTEWrap support functionality
    var $wrap, $toggleHtml, $preferredButton, spinner, $spacer;

    /**
     * reposition the RTE's wrapper.  Does nothing if you turn off dom construction.  With no argument,
     * just repositions on top of the spacer, expanding the spacer or RTE height, whichever is smaller.
     *
     * @param {?object} rectangle.  May have top, left, width and height, though top is ignore without
     * left and vice versa.  If omitted entirely, just reposition on top of the spacer.
     */
    function reposition(rectangle){
        if($wrap.length){
            var spacerHeight = null;
            if(!rectangle){
                if($spacer.is(":visible")){
                    rectangle = $spacer.offset();
                    var spacerWidth = $spacer.width();
                    var tableWidth = $editorPanel.find("table:first").outerWidth(true);
                    var screenWidth = $j(window).width();
                    //three cases, there's enough screen space to the left, enough to the right, or neither
                    //We only change the layout for the second case
                    if(!(rectangle.left + tableWidth < screenWidth) && (rectangle.left + spacerWidth - tableWidth > 0)){
                        //hang left
                        rectangle.left -= tableWidth - spacerWidth;
                    }

                    rectangle.width = Math.max(spacerWidth, tableWidth);
                }else{
                    rectangle = {};
                    rectangle.width = $spacer.width();
                }

                spacerHeight = $spacer.height();
                var tableHeight = $editorPanel.find('table:first').height();
                var wrapHeight = $wrap.height();
                var dh = wrapHeight - tableHeight;
                if(spacerHeight <= wrapHeight){
                    //spacer should grow to fit the RTE.
                    $spacer.height($wrap.height());
                }else{
                    rectangle.height = spacerHeight - dh;
                }
            }
            if(rectangle.top != null && rectangle.left != null){
                var offset = {
                    top: rectangle.top,
                    left: rectangle.left
                };

                $wrap.offset(offset);
            }
            if(rectangle.width){
                $wrap.width(rectangle.width);
            }
            if(rectangle.height){
                resizeTo(rectangle.height);
            }
        }
    }

    /**
     * Stops the spinner and sets the internal jive.rte.RTE reference.
     * @param theRte
     */
    function doneLoading(theRte){
        stopSpinner();
        rte = theRte;
    }

    //starts the spinner.  Non-public.
    function startSpinner(){
        //The spinner libs aren't loaded for unit tests
        if(jive && jive.loader && jive.loader.LoaderView){
            spinner = new jive.loader.LoaderView({size: 'big'});
            spinner.prependTo($editorPanel);
        }else{
            spinner = null;
        }
    }

    //stops the spinner.  Non-public.
    function stopSpinner(){
        $editorPanel.removeClass('loading');
        if(spinner){
            spinner.destroy();
            spinner.getContent().remove();
        }
    }

    /**
     * hide the preferred mode button.
     */
    function hidePreferredButton(){
        $preferredButton.hide();
    }

    /**
     * show the preferred mode button.
     */
    function showPreferredButton(){
        $preferredButton.show();
    }

    /**
     * hide the toggle mode button.
     */
    function hideToggleHtmlButton(){
        $toggleHtml.hide();
    }

    /**
     * show the toggle mode button.
     */
    function showToggleHtmlButton(){
        $toggleHtml.show();
    }

    //The textarea that we display to the user in raw mode, or mobile mode.
    var USER_TEXTAREA_HTML = "<textarea class='usertext'></textarea>";

    //Builds the RTEWrap dom and wires the buttons to RteLayout events.
    function buildDom(opts){
        $wrap = $j("<div class='j-rte-wrap-box'>"
                    + "<div class='wysiwygtext_html_link'>"
                        + "<a href='javascript:void(0);' class='toggle_html' style='display:none;'>" + opts.toggleText + "</a>&nbsp;"
                        + "<a href='javascript:void(0);' class='rte_preferred' style='display:none;'>"
                        + opts.alwaysUseTabText
                        + "</a>&nbsp;&nbsp;"
                    + "</div>"
                    + "<div class='jive-panel-wrapper'>"
                        + "<div id='wysiwyg-panel' class='current loading toolbar-container'>"
                            + "<div class='readOnlyMessage' style='display: none;'><h4></h4><p></p><br /><p></p></div>"
                            + USER_TEXTAREA_HTML
                        + "</div>"
                    + "</div>"
                + "</div>");

        //find the $editorPanel, which will contain the RTE itself
        $editorPanel = $wrap.find(".jive-panel-wrapper .toolbar-container");

        //Wire up button events.
        $toggleHtml = $wrap.find("a.toggle_html").click(function(e){
            that.emit("toggleHtml", e)
        });
        $preferredButton = $wrap.find(".wysiwygtext_html_link a.rte_preferred").click(function(e){
            that.emit("setPreferred", e);
        });

        //Set up the Read Only fallback UI, used for primitive mobile browsers.
        if(opts.readOnlyMessage){
            $editorPanel.find(".readOnlyMessage")
                .find("h4").text(opts.editDisabledText).end()
                .find("p:last").text(opts.editDisabledSummary.replace("{0}", opts.communityName));
            $editorPanel.find(".readOnlyMessage").show();
            $editorPanel.addClass("disabled");
        }

        //Float the whole wrap frame on top of everything else on the page.
        //Add the spacer div, if necessary and put the wrap element in place.
        if(opts.shouldFloat){
            $wrap.css({
                "position": "absolute",
                "z-index": opts.zIndex || 100
            });

            $spacer = $j("<div style='width: 100%;'></div>")
                .height(opts.$element.outerHeight(true));
            opts.$element.before($spacer);
            $j("body").append($wrap);
            $wrap.offset($spacer.offset()).width($spacer.width());
        }else{
            $spacer = $j();
            opts.$element.before($wrap);
        }

        startSpinner();
    }

    //Core functionality
    var autoHeightLimit = 500;  //The height in px of the browser window.  Set to 0 to disable auto resize.
    //Figure out the maximum height the RTE can be without forcing scrollbars on the containing page.
    function recalcAutoHeightLimit(){
        if(autoHeightLimit > 0){
            autoHeightLimit = $j(window).height() - 100;
        }
    }

    /**
     * Expands the height of the RTE to fit its body, without scrollbars in the RTE, but don't force scrollbars on the containing page.
     */
    function expandToFitContent(){
        if(rte){
            var bodyHeight = $j(rte.getBody()).outerHeight(true);
            var windowHeight = $j(rte.getWindow()).height();

            if (bodyHeight > windowHeight && bodyHeight < autoHeightLimit && autoHeightLimit > 0) {
                resizeTo(Math.min(bodyHeight + 100, autoHeightLimit));
            }
        }
    }

    /**
     * Change the height of the RTE's table to the specified height in pixels.
     * @param height the target height in px for the RTE's main container.  Excludes below-RTE content like the
     * attachments block.
     */
    function resizeTo(height){
        var $table = $editorPanel.find('table:first');
        var $ifr = $editorPanel.find("iframe");

        var deltaH = $table.height() - $ifr.height();
        $table.height(height); // Resize table
        $ifr.height(height - deltaH); // Resize iframe
        getUserTextarea().height(height);

        $spacer.height($wrap.height());
        that.emit("resized", height, $wrap.height());
    }

    /**
     * Return the textarea used for "raw" mode and primitive mobile.
     */
    function getUserTextarea(){
        return $editorPanel.find("textarea.usertext");
    }

    /**
     * Clean up.  Removes any DOM elements we might have created, and tears down event handlers.
     */
    function teardown(){
        $wrap.remove();
        $spacer.remove();
        getUserTextarea().remove();
        $j(window).unbind("resize.rteLayout", onResize);
        $j("body").undelegate("div.mceSplitButtonMenu, div.mceDropDown", "mouseover.rteLayout", edgeScroll);
    }

    //window resize event handler.
    function onResize(){
        recalcAutoHeightLimit();
        reposition();
    }

    //Handles rightward edge scrolling, to provide easier access to menus that appear off the screen.
    var SCROLL_PX = 7;
    function edgeScroll(evt){
        var $win = $j(window);
        var screenWidth = $win.width();
        var hScroll = $win.scrollLeft();
        if(screenWidth + hScroll - SCROLL_PX <= evt.pageX){
            $win.scrollLeft(hScroll + SCROLL_PX*2);
        }
    }

    //Construction code
    if(!options.domExists){
        buildDom(options);
    }else{
        $editorPanel = options.$editorPanel;
        $editorPanel.prepend(USER_TEXTAREA_HTML);
        $wrap = $j();
        $spacer = $j();
        $toggleHtml = $j();
        $preferredButton = $j();
        rte = options.rte;
    }
    recalcAutoHeightLimit();
    $j(window).bind("resize.rteLayout", onResize);
    //edge scrolling of menus
    $j("body").delegate("div.mceSplitButtonMenu, div.mceDropDown", "mouseover.rteLayout", edgeScroll);


    //Our public interface.
    $j.extend(this, {
        reposition: reposition,
        expandToFitContent: expandToFitContent,
        resizeTo: resizeTo,
        getEditorPanel: function(){ return $editorPanel; },
        getUserTextarea: getUserTextarea,
        hidePreferredButton: hidePreferredButton,
        showPreferredButton: showPreferredButton,
        hideToggleHtmlButton: hideToggleHtmlButton,
        showToggleHtmlButton: showToggleHtmlButton,
        teardown: teardown,
        doneLoading: doneLoading
    });

};
jive.conc.observable(jive.rte.RTELayout.prototype);
