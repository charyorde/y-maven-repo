/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

// Plugin static class
(function() {

    function parseColorComponent(s){
        s = $j.trim(s);
        var match = /([\d\.])%$/.exec(s);
        if(match){
            return (parseFloat(match[1])/100);
        }
        return parseFloat(s) / 255;
    }

    var RGB_COLOR = /rgb\s*\(([^,\)]+,[^,\)]+,[^,\)]+)\)/;
    var RGBA_COLOR = /rgba\s*\(([^,\)]+,[^,\)]+,[^,\)]+,[^,\)]+)\)/;
    var HEX_COLOR = /#[a-fA-F0-9]{6}/;
    var TRANSPARENT = /transparent|rgba\(0,\s*0,\s*0,\s*0\)/;
    function parseStyleColor(colorStr, allowTransparent){
        if(!colorStr){
            return "";
        }
        if(HEX_COLOR.test(colorStr)){
            return colorStr;
        }
        var match = RGB_COLOR.exec(colorStr);
        if(match){
            return tinymce.activeEditor.plugins.jiveutil.convertRGBToHex(colorStr);
        }
        match = TRANSPARENT.exec(colorStr);
        if(match){
            if(allowTransparent){
                return "transparent";
            }else{
                return "#FFFFFF";
            }
        }
        match = RGBA_COLOR.exec(colorStr);
        if(match){
            function compositeWhite(color, alpha){
                return color * alpha + 1 - alpha;
            }
            var parts = match[1].split(/\s*,\s*/);
            var alpha = parseColorComponent(parts[3]);
            var red = Math.round(compositeWhite(parseColorComponent(parts[0]), alpha) * 255);
            var green = Math.round(compositeWhite(parseColorComponent(parts[1]), alpha) * 255);
            var blue = Math.round(compositeWhite(parseColorComponent(parts[2]), alpha) * 255);
            return tinymce.activeEditor.plugins.jiveutil.convertRGBToHex("rgb(" + red + ", " + green + ", " + blue + ")");
        }
        return "";
    }

    function parseStyleAttr($node, attr){
        if(!$node.attr("style")) return null;
        var styleString = $node.attr("style").toLowerCase();
        styleString = styleString.replace(new RegExp("-" + attr, "gi"),"nomatch");
        if(styleString.indexOf(attr + ":") >= 0){
            styleString = styleString.substr(styleString.indexOf(attr + ":"));
            if(styleString.indexOf(";")){
                styleString = styleString.substr(0, styleString.indexOf(";"));
            }
            // now the string only matches the width style
            // chop off the leading "width:"
            return $j.trim(styleString.substr(attr.length+1));
        }
        return null;
    }

    function parseFontNameFromStyle(fontFamily){
        return fontFamily.replace(/'/g, "").replace(/, /g, ",");
    }

    function parseLengthPercent(str){
        str = tinymce.trim(str);
        if(str == "auto" || str == "inherit"){
            return {
                unit: str,
                magnitude: null
            };
        }
        var magnitude = parseFloat(str);
        var unit = str.substr(String(magnitude).length);
        if(unit == "%"){
            unit = "per";
        }
        return {
            unit: unit,
            magnitude: magnitude
        };
    }

    var COLOR_MENU = (function(){
        //build this once, the quick way
        var colors = ["000000", "993300", "333300", "003300", "003366", "000080", "333399", "333333", "800000", "FF6600", "808000",
            "008000", "008080", "0000FF", "666699", "808080", "FF0000", "FF9900", "99CC00", "339966", "33CCCC", "3366FF",
            "800080", "999999", "FF00FF", "FFCC00", "FFFF00", "00FF00", "00FFFF", "00CCFF", "993366", "C0C0C0", "FF99CC",
            "FFCC99", "FFFF99", "CCFFCC", "CCFFFF", "99CCFF", "CC99FF", "FFFFFF"];
        var html = [];
        html.push("<div class='colorPicker'>");
        $j.each(colors, function(i, color){
            html.push("<a href='javascript:;' style='background-color: #");
            html.push(color);
            html.push("'></a>");
        });
        html.push("</div>");
        return html.join("");
    })();

    
    function serializeStyle($target, headerStyle, cellStyle){
        $target.attr("jive-data-header", $j.JSON.encode(headerStyle));
        $target.attr("jive-data-cell", $j.JSON.encode(cellStyle));
    }

    /**
     * Returns its first non-null argument, or null.  Function arguments are called to determine their value,
     * but prior non-null arguments shortcut function evaluation.
     */
    function firstOf(){
        for(var i = 0; i < arguments.length; ++i){
            if(arguments[i] != null){
                if(typeof(arguments[i]) == "function"){
                    var val = arguments[i]();
                    if(val != null){
                        return val;
                    }
                }else{
                    return arguments[i];
                }
            }
        }
        return null;
    }
    
    function readStyles($table, $context, $cell, defaultHeaderStyle, defaultCellStyle) {
        var styles = {
            headerStyle: $context.attr("jive-data-header"),
            cellStyle: $context.attr("jive-data-cell"),
            tableBorderWidth: 0,
            tableAlign: $table.attr("align"),
            tableBorderColor: $table.css("border-color"),

            contextWidthType: "auto",
            contextWidth: 0,
            contextHeightType: "auto",
            contextHeight: 0
        };

        styles.tableAlign = styles.tableAlign ? styles.tableAlign.toLowerCase() : "none";
        if(!styles.tableBorderColor){
            //mostly, computed styles are only set for the most specific single-value style, not for the aggregate convenience styles
            styles.tableBorderColor = $table.css("border-top-color");
        }
        styles.tableBorderColor = parseStyleColor(styles.tableBorderColor);


        //border width
        styles.tableBorderWidth = firstOf(function(){
            var borderWidthCSS = $table.css("border-width");
            if(borderWidthCSS){
                return parseFloat(borderWidthCSS);
            }
        }, function() {
            var borderCSS = $table.css("border");
            if (borderCSS) {
                var spaceIndex = borderCSS.indexOf(" ");
                if (spaceIndex) {
                    return parseFloat(borderCSS.substring(0, spaceIndex));
                }
            }
        }, function(){
            return $table.attr("border") || null;
        }, styles.tableBorderWidth);

        //Context width
        var width = parseLengthPercent(firstOf(function(){
            return parseStyleAttr($context, "width");
        }, function(){
            return $context.attr("width") || null;
        }, function(){
            return $context.width() + "px";
        }));
        styles.contextWidth = width.magnitude;
        styles.contextWidthType = width.unit;

        //Context height
        var height = parseLengthPercent(firstOf(function(){
            return parseStyleAttr($context, "height");
        }, function(){
            return $context.attr("height") || null;
        }, function(){
            return $context.height() + "px";
        }));
        styles.contextHeight = height.magnitude;
        styles.contextHeightType = height.unit;

        //Context background color
        var bgColor = parseStyleColor(firstOf(function(){
            return $context.attr("bgColor") || null;
        }, function(){
            return $cell.attr("bgColor") || null;
        }, function(){
            return $cell.css("background-color");
        }), true);


        var padding = "2";
        try{
            padding = parseInt($cell.get(0).style.padding) + "";
        }catch(e){
            // noop
        }

        var fontFamily = parseFontNameFromStyle($cell.css("fontFamily"));

        var color = $cell.css("color");
        color = parseStyleColor(color);

        var textAlign = $cell.css("textAlign");
        if(textAlign == "justify") textAlign = "full";
        var verticalAlign = $context.css("verticalAlign");

        //header styles
        styles.headerStyle = firstOf(function(){
            if(styles.headerStyle){
                try{
                    return $j.JSON.decode(jive.util.unescapeHTML(styles.headerStyle));
                }catch(e){
                }
            }
        }, function(){
            return $j.extend({}, defaultHeaderStyle);
        });

        //cell styles
        styles.cellStyle = firstOf(function(){
            if(styles.cellStyle){
                try{
                    return $j.JSON.decode(jive.util.unescapeHTML(styles.cellStyle));
                }catch(e){
                }
            }
        }, function(){
            return $j.extend({}, defaultCellStyle);
        });

        //adjustments to the style type for the current cell
        var currentStyle = $cell.is("th") ? styles.headerStyle : styles.cellStyle;
        currentStyle.backgroundColor = bgColor;
        currentStyle.padding = padding;
        if(fontFamily){
            currentStyle.fontFamily = fontFamily;
        }
        if(color){
            currentStyle.color = color;
        }
        if(textAlign){
            currentStyle.textAlign = textAlign;
        }
        if(verticalAlign){
            currentStyle.verticalAlign = verticalAlign;
        }

        return styles;
    }

    //Makes style changes to the specified context, with warts and all
    function updateStyles($context, cssToSet) {
        if ($context && $context.length) {
            if (cssToSet) {
                if ($context.is("table")) {
                    //table alignment within its container
                    if(cssToSet["tableAlign"] != null){
                        if(cssToSet["tableAlign"] == "none"){
                            $context.removeAttr("align");
                        }else{
                            $context.attr("align", cssToSet["tableAlign"]);
                        }
                        delete cssToSet["tableAlign"];
                    }
                    //Back up table border style with border attr
                    if (cssToSet["border-width"] != null) {
                        $context.attr("border", cssToSet["border-width"]);
                    }
                    if(cssToSet["width"] != null){
                        $context.removeAttr("width");
                    }
                    if(cssToSet["height"] != null){
                        $context.removeAttr("height");
                    }
                    //When setting table styles, clear any cell border styles
                    $context.find("td,th")
                        .css("border-width", "")
                        .css("border-style", "")
                        .css("border-top-color", "")
                        .css("border-left-color", "")
                        .css("border-bottom-color", "")
                        .css("border-right-color", "");
                }

                $context.css(cssToSet);
            }
            $context.removeAttr("data-mce-style")
                .removeAttr("bgcolor");
            if(!$context.is("table")){
                $context.closest("table").removeAttr("data-mce-style");
            }
        }
        tinymce.activeEditor.scheduleNodeChanged();
    }

    /**
     * Parse a string into a floating-point value.  Returns 0 if the string isn't a number.
     * @param {string} str to be parsed
     * @param {number=} def the default, 0 if unspecified.
     */
    function parseNumber(str, def){
        var ret = parseFloat(str);
        if(isNaN(ret)){
            return def || 0;
        }
        return ret;
    }
    
    tinymce.create('tinymce.plugins.JiveTablePlugin', {

        // this is set from rte.js
        fullPopOverWidth: 230,
        fullPopOverHeight: 400,

        //
        editTableProperties : null,

        //
        // references to the table/row/column/cell that we're editing
        $table: null,
        $column: null,
        $row: null,
        $cell: null,


        // reference to the jivecontextmenu Menu
        propertyChooserMenu: null,

        //
        // functions for resetting teh form to default values
        // these are set on the onInit() event
        resetTableProperties : null,
        resetColumnProperties: null,
        resetRowProperties:null,
        resetCellProperties: null,

        //
        // track scroll position
        minY : 0,
        minX : 0,

        resetMinMaxY : function(ed){
            this.minY = ed.plugins.jivescroll.lastScrollY;
            this.minX = ed.plugins.jivescroll.lastScrollX;
        },


        //////////////////////////////////////////////////////////////////
        //
        // helper functions for styling cells / headers / creating inputs

        /**
         * default style for a header cell.
         * eventually i'd like this to be configurable
         * in the instance
         */
        defaultHeaderStyle : function(){
            return {
                color: "#FFFFFF",
                backgroundColor: "#6690BC",
                textAlign: "center",
                padding: "2"
            };
        },


        /**
         * default style for a normal cell.
         * eventually i'd like this to be configurable
         * in the instance
         */
        defaultCellStyle : function(){
            return {
                color: "#000000",
                textAlign: "left",
                padding: "2"
            };
        },

        forceCellType : function (ed, $ele, type){
            if(!$ele.is(type)){
                var $newCell = $j("<" + type + "></" + type + ">", ed.getDoc());
                $newCell.append($ele.contents());
                if($ele.get(0) == this.$cell.get(0)) this.$cell = $newCell;
                $ele.before($newCell);
                $ele.remove();

                var width = parseStyleAttr($ele, "width");
                if(width){
                    $newCell.css("width", width);
                }
                return $newCell;
            }
            return $ele;
        },

        /**
         * styles a node as a th cell
         * @param $node the node to style
         * @param headerStyle the style to apply
         */
        styleAsTH : function($node, headerStyle){
            var p = parseInt(headerStyle.padding);
            if(isNaN(p)) p = 0;
            var align = headerStyle.textAlign;
            $node.css($j.extend({},
                    this.defaultHeaderStyle(),
                    headerStyle, {
                padding: p + "px",
                textAlign : (align == "full" ? "justify" : align),
                backgroundColor : (headerStyle.backgroundColor ? headerStyle.backgroundColor : "transparent")
            }));
            $node.removeAttr("data-mce-style");
            $node.removeAttr("align");
            $node.removeAttr("valign");
        },

        /**
         * styles a node as a td cell
         * @param $node the node to style
         * @param cellStyle the style to apply
         */
        styleAsTD : function($node, cellStyle){
            var p = parseInt(cellStyle.padding);
            if(isNaN(p)) p = 0;
            var align = cellStyle.textAlign;
            $node.css($j.extend({},
                    this.defaultCellStyle(),
                    cellStyle, {
                padding: p + "px",
                textAlign : (align == "full" ? "justify" : align),
                backgroundColor : (cellStyle.backgroundColor ? cellStyle.backgroundColor : "transparent")
            }));
            $node.removeAttr("data-mce-style");
            $node.removeAttr("align");
            $node.removeAttr("valign");
        },

        /**
         * creates a spinner input (input w/ up/down arrow buttons)
         * @param $spinnerInput the jquery selector to turn into an input
         * @param min the minimum allowed value
         * @param max the maximum allowed value
         * @param step the amount to change the value when up/down is clicked
         * @param func the function to call when the value changes
         */
        createSpinnerInput : function($spinnerInput, min, max, step, func){
            $spinnerInput.SpinButton({
                    min: min,						// Set lower limit.
                    max: max,					// Set upper limit.
                    step: step,					// Set increment size.
                    spinClass: "spin-button",	// CSS class to style the spinbutton.
                                                // (Class also specifies url of the up/down button image.)
                    upClass: "up",		// CSS class for style when mouse over up button.
                    downClass: "down"	// CSS class for style when mouse over down button.
                    });
            $spinnerInput.keyup(func).change(func).mouseup(func).click(function(){
                return false; //IE9 dismisses the popover if you don't cancel this event
            });
        },


        defaultFont :function(){
            var fontStr = this.ed.settings.theme_advanced_fonts;
            var fonts = fontStr.split(';');
            var fontInfo = fonts[1].split("=");
            return fontInfo[1];
        },

        fontName: function(fontStyle){
            var fontStr = this.ed.settings.theme_advanced_fonts;
            var name = "";
            $j.each(fontStr.split(';'), function(indx,font) {
                var fontInfo = font.split("=");
                if(fontInfo[1] == fontStyle){
                    name = fontInfo[0];
                }
            });
            return name;
        },

        /**
         * creates a font input
         * @param $fontInput the jquery object to turn into a font input
         * @param updateFun the function to call when the color value changes
         */
        createFontInput : function($fontInput, updateFun){
            var $font_menu = $j(this.FONT_MENU);

            function fontSelect(){
                var $this = $j(this);
                var family = $this.attr("data-font-info");
                $fontInput.text($this.text())
                    .css("font-family", family)
                    .data("font-family", family);
                updateFun();
                $font_menu.hide();
            }

            $font_menu.delegate("a", "click" , fontSelect);

            $fontInput.click(function(){
                $font_menu.show();
                return false;
            }).change(updateFun).keyup(updateFun);
            $fontInput.after($font_menu);
            $fontInput.parents(".properties").click(function(){
                $font_menu.hide();
            });
        },
        /**
         * creates a color input
         * @param $colorInput the jquery object to turn into a color input
         * @param updateFun the function to call when the color value changes
         */
        createColorInput : function($colorInput, updateFun, allowTransparent){
            var ed = this.ed;
            var $span = $j("<span style='position:relative;line-height:18px;position: absolute;'></span>");

            var $color_sample = $j("<div class='transparentGridBg'><div class='colorSample'></div></div>");

            function setColor(){
                var color = $j(this).css("background-color");
                $colorInput.val(parseStyleColor(color, allowTransparent));
                updateFun();
                $color_menu.hide();
                return false;
            }
            var $color_menu = $j(COLOR_MENU);

            if(allowTransparent){
                $color_menu.addClass("transparentAllowed");
                $color_menu.append($j("<a href='javascript:;' class='transparentButton'>" + ed.getLang("jivetable.transparent") + "</a>"));
            }
            $color_menu.delegate("a", "click", setColor);

            $colorInput.click(function(){
                $color_menu.show();
                return false;
            }).change(updateFun).keyup(updateFun);
            $color_sample.click(function(){
                $color_menu.show();
                return false;
            });
            $colorInput.after($color_menu).after($color_sample).after($span);
            $span.append($colorInput).append($color_sample);
            $colorInput.parents(".properties").click(function(){
                $color_menu.hide();
            });
        },
        // end helper functions for styling cells / headers / creating inputs
        //
        //////////////////////////////////////////////////////////////////


        /**
         * chanes the headers to match the given selectors
         * @param makeTHselector any cells matching this selector will be made into headers
         * @param makeTDselector any cells matching this selector will be made into normal cells
         */
        changeHeaderStyle : function(ed, $node, makeTHselector, makeTDselector){
            var that = this;
            // header is top row only
            var b = ed.selection.getBookmark(BOOKMARKTYPE);
            if(makeTHselector){
                $node.find(makeTHselector).each(function(index, td){
                    that.forceCellType(ed, $j(td), "th");
                });
            }
            if(makeTDselector){
                $node.find(makeTDselector).each(function(index, th){
                    that.forceCellType(ed, $j(th), "td");
                });
            }
            ed.selection.moveToBookmark(b);
        },

        /**
         * resets the table properties so that the first tab is selected
         * @param $properties
         */
        resetPropertiesTabs : function($properties){
            //
            // reset the tabs to show the first table tab
            $properties.find("li:not(:first)").removeClass("j-tab-selected");
            $properties.find("li:first").addClass("j-tab-selected");
            $properties.children("div:not(:first)").hide();
            $properties.children("div:first").show();
            $properties.find("a:nth(0)").click(function(){
                $properties.find("li:not(:nth(0))").removeClass("j-tab-selected");
                $properties.find("li:nth(0)").addClass("j-tab-selected");
                $properties.find("form").children("div:not(.tableStyle)").hide();
                $properties.find("form").children("div:nth(0)").show();
                return false;
            }).click();
            $properties.find("a:nth(1)").click(function(){
                $properties.find("li:not(:nth(1))").removeClass("j-tab-selected");
                $properties.find("li:nth(1)").addClass("j-tab-selected");
                $properties.find("form").children("div:not(.tableHeader)").hide();
                $properties.find("form").children("div:nth(1)").show();
                return false;
            });
            $properties.find("a:nth(2)").click(function(){
                $properties.find("li:not(:nth(2))").removeClass("j-tab-selected");
                $properties.find("li:nth(2)").addClass("j-tab-selected");
                $properties.find("form").children("div:not(.tableCell)").hide();
                $properties.find("form").children("div:nth(2)").show();
                return false;
            });
        },


        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        //
        // code for Table vs Column vs Row vs Cell
        //
        /**
         * resets the table properties to default configuration
         * @param ed
         */
        _buildTableProperties: function(ed){
            var that = this;
            var tableStyles = null;

            /**
             * resets the values of all the table inputs
             */
            function resetInputValues(){
                serializeStyle(that.$table, tableStyles.headerStyle, tableStyles.cellStyle);

                ////////////////////////////////////////////////////////////////////////////////
                // table tab styles first
                //
                // width
                var $formFields = that.editTableProperties.find(".tableStyle .formFields");
                if(tableStyles.contextWidthType == "px"){
                    $formFields.find(".widthPer").hide();
                    $formFields.find(".widthPx").show().val(tableStyles.contextWidth);
                    $formFields.find(".chooseWidthPer").prop('checked', false);
                    $formFields.find(".chooseWidthPx").prop('checked', true);
                }else{
                    $formFields.find(".widthPer").show().val(tableStyles.contextWidth);
                    $formFields.find(".widthPx").hide();
                    $formFields.find(".chooseWidthPx").prop('checked', false);
                    $formFields.find(".chooseWidthPer").prop('checked', true);
                }
                // height
                $formFields.find(".heightPx").val(tableStyles.contextHeight);
                if(tableStyles.contextHeightType == "px"){
                    $formFields.find(".chooseHeightAuto").prop('checked', false);
                    $formFields.find(".chooseHeightPx").prop('checked', true);
                }else{
                    $formFields.find(".chooseHeightPx").prop('checked', false);
                    $formFields.find(".chooseHeightAuto").prop('checked', true);
                }
                // border width
                that.editTableProperties.find(".tableStyle input.borderWidth").val(tableStyles.tableBorderWidth);
                // border color
                $formFields.find(".borderColor").val(tableStyles.tableBorderColor);
                $formFields.find(".colorSample").css("background-color", tableStyles.tableBorderColor);
                // table alignment
                that.editTableProperties.find(".tableStyle .formFields:last a.mceButton.mce_justifytable" + tableStyles.tableAlign)
                        .addClass("mceButtonSelected");
                that.editTableProperties.find(".tableStyle .formFields:last a.mceButton:not(.mce_justifytable" + tableStyles.tableAlign + ")")
                        .removeClass("mceButtonSelected");
                // done with table tab styles
                ////////////////////////////////////////////////////////////////////////////////

                ////////////////////////////////////////////////////////////////////////////////
                // begin header/cell tab styles
                that.updateCellInputs(that.editTableProperties.find(".tableHeader"), tableStyles.headerStyle, tableStyles.tableBorderWidth, tableStyles.tableBorderColor, that.styleAsTH);
                that.updateCellInputs(that.editTableProperties.find(".tableCell"), tableStyles.cellStyle, tableStyles.tableBorderWidth, tableStyles.tableBorderColor, that.styleAsTD);
                //
                // done with header/cell tab styles first
                ////////////////////////////////////////////////////////////////////////////////
            }
            // end helper functions for changing table styles
            //
            ////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////
            //
            // reset selected tab, select first tab
            //

            this.resetPropertiesTabs(this.editTableProperties);

            //
            ////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////
            //
            // Create Inputs
            //
            // 1st tab: table styles
            (function(){
                // anonymous function to keep outer scope clean

                var $firstFormField = that.editTableProperties.find(".tableStyle .formFields:first");
                //These handle the header formations, such as TH across the top row, or top and bottom, or first column
                //First row
                $firstFormField.find("a.th-t").click(function(){
                    that.changeHeaderStyle(ed, that.$table, "tr:first td","tr:not(:first) th");
                    resetInputValues();
                    that.onTableStyleChange.dispatch(that.$table.find("th"), tableStyles.headerStyle);
                    that.onTableStyleChange.dispatch(that.$table.find("td"), tableStyles.cellStyle);
                    return false;
                });
                //First and last row
                $firstFormField.find("a.th-tb").click(function(){
                    that.changeHeaderStyle(ed, that.$table, "tr:first td, tr:last td","tr:not(:first,:last) th");
                    resetInputValues();
                    that.onTableStyleChange.dispatch(that.$table.find("th"), tableStyles.headerStyle);
                    that.onTableStyleChange.dispatch(that.$table.find("td"), tableStyles.cellStyle);
                    return false;
                });
                //First row and column
                $firstFormField.find("a.th-tl").click(function(){
                    that.changeHeaderStyle(ed, that.$table, "tr:first td, tr td:first-child","tr:not(:first) th:not(:first-child)");
                    resetInputValues();
                    that.onTableStyleChange.dispatch(that.$table.find("th"), tableStyles.headerStyle);
                    that.onTableStyleChange.dispatch(that.$table.find("td"), tableStyles.cellStyle);
                    return false;
                });
                //No header
                $firstFormField.find("a.th-n").click(function(){
                    that.changeHeaderStyle(ed, that.$table, false,"th");
                    resetInputValues();
                    that.onTableStyleChange.dispatch(that.$table.find("th"), tableStyles.headerStyle);
                    that.onTableStyleChange.dispatch(that.$table.find("td"), tableStyles.cellStyle);
                    return false;
                });

                // setup border width
                var $borderInput = that.editTableProperties.find(".tableStyle input.borderWidth");
                that.createSpinnerInput($borderInput, 0, 100, 1, function(){
                    var newVal = $borderInput.val();
                    if(tableStyles.tableBorderWidth != newVal){
                        tableStyles.tableBorderWidth = newVal;
                        resetInputValues();
                        that.onTableStyleChange.dispatch(that.$table, {
                            "border-width": parseNumber(newVal) + "px",
                            "border-style": "solid"
                        });
                    }
                });

                // setup border color
                var $borderColorInput = that.editTableProperties.find(".tableStyle input.borderColor");
                that.createColorInput($borderColorInput, function(){
                    var newVal = $borderColorInput.val();
                    if(tableStyles.tableBorderColor != newVal){
                        tableStyles.tableBorderColor = newVal;
                        resetInputValues();
                        that.onTableStyleChange.dispatch(that.$table, {
                            "border-top-color": newVal,
                            "border-left-color": newVal,
                            "border-bottom-color": newVal,
                            "border-right-color": newVal,
                            "border-style": "solid"
                        });
                    }
                });

                // setup alignment
                that.editTableProperties.find(".tableStyle .formFields:last a.mceButton").click(function(){
                    var $this = $j(this);
                    if($this.hasClass("mce_justifytablenone")){
                        tableStyles.tableAlign = "none";
                    }
                    if($this.hasClass("mce_justifytableleft")){
                        tableStyles.tableAlign = "left";
                    }
                    if($this.hasClass("mce_justifytableright")){
                        tableStyles.tableAlign = "right";
                    }
                    that.onTableStyleChange.dispatch(that.$table, {"tableAlign": tableStyles.tableAlign});
                    that.editTableProperties.find(".tableStyle .formFields:last a.mceButton").not(this).removeClass("mceButtonSelected");
                    $this.addClass("mceButtonSelected");
                    return false;
                });

                // setup width px vs %
                var $formFields = that.editTableProperties.find(".tableStyle .formFields");
                var $widthPerInput = $formFields.find(".widthPer");
                that.createSpinnerInput($widthPerInput, 0, 100, 1, function(){
                    var newVal = $widthPerInput.val();
                    if(tableStyles.contextWidth != newVal){
                        tableStyles.contextWidth = newVal;
                        resetInputValues();
                        that.onTableStyleChange.dispatch(that.$table, {"width": parseNumber(newVal) + "%"});
                    }
                });
                var $widthPxInput = $formFields.find(".widthPx");
                that.createSpinnerInput($widthPxInput, 0, 9999, 10, function(){
                    var newVal = $widthPxInput.val();
                    if(tableStyles.contextWidth != newVal){
                        tableStyles.contextWidth = newVal;
                        resetInputValues();
                        that.onTableStyleChange.dispatch(that.$table, {"width": parseNumber(newVal) + "px"});
                    }
                });
                $formFields.find(".chooseWidthPer").click(function(e){
                    if(tableStyles.contextWidthType != "per"){
                        tableStyles.contextWidth = Math.round(that.$table.width() / that.$table.parents("body").width() * 100);
                        tableStyles.contextWidthType = "per";
                        resetInputValues();
                        that.onTableStyleChange.dispatch(that.$table, {"width": tableStyles.contextWidth + "%"});
                        e.stopPropagation(); // JIVE-2879
                    }
                });
                $formFields.find(".chooseWidthPx").click(function(e){
                    if(tableStyles.contextWidthType != "px"){
                        tableStyles.contextWidth = that.$table.width();
                        tableStyles.contextWidthType = "px";
                        resetInputValues();
                        that.onTableStyleChange.dispatch(that.$table, {"width": tableStyles.contextWidth + "px"});
                        e.stopPropagation(); // JIVE-2879
                    }
                });

                // setup height px
                var $heightPxInput = $formFields.find(".heightPx");
                that.createSpinnerInput($heightPxInput, 0, 9999, 10, function(){
                    that.editTableProperties.find(".tableStyle .formFields .chooseHeightAuto").prop('checked', false);
                    that.editTableProperties.find(".tableStyle .formFields .chooseHeightPx").prop('checked', true).click();
                    var newVal = $heightPxInput.val();
                    if(tableStyles.contextHeight != newVal){
                        tableStyles.contextHeight = newVal;
                        resetInputValues();
                        that.onTableStyleChange.dispatch(that.$table, {"height": parseNumber(newVal) + "px"});
                    }
                });

                $formFields.find(".chooseHeightAuto").click(function(e){
                    if(tableStyles.contextHeightType != "auto"){
                        tableStyles.contextHeightType = "auto";
                        tableStyles.contextHeight = that.$table.height();
                        resetInputValues();
                        that.onTableStyleChange.dispatch(that.$table, {"height": ""});
                        e.stopPropagation(); // JIVE-2879
                    }
                });
                $formFields.find(".chooseHeightPx").click(function(e){
                    if(tableStyles.contextHeightType != "px"){
                        tableStyles.contextHeight = that.$table.height();
                        tableStyles.contextHeightType = "px";
                        resetInputValues();
                        that.onTableStyleChange.dispatch(that.$table, {"height": parseNumber(tableStyles.contextHeight) + "px"});
                        e.stopPropagation(); // JIVE-2879
                    }
                });
            }());

            this.setupCellForm(this.editTableProperties.find(".tableHeader"), function(){
                return tableStyles.headerStyle;
            }, function(cssToSet){
                resetInputValues();
                that.onTableStyleChange.dispatch(that.$table.find("th"), cssToSet);
            });
            this.setupCellForm(this.editTableProperties.find(".tableCell"), function(){
                return tableStyles.cellStyle;
            }, function(cssToSet){
                resetInputValues();
                that.onTableStyleChange.dispatch(that.$table.find("td"), cssToSet);
            });

            // done setting up inputs
            //
            ////////////////////////////////////////////////////////////////////////

            return function(){
                tableStyles = readStyles(that.$table, that.$table, that.$cell, that.defaultHeaderStyle(), that.defaultCellStyle());
                resetInputValues();
            }
        },

        /**
         * resets the table properties to default configuration
         * @param ed
         */
        _buildColumnProperties: function(ed){
            var that = this;
            var columnStyles = null;

            /**
             * resets the values of all the table inputs
             */
            function resetInputValues(){
                serializeStyle(that.$column, columnStyles.headerStyle, columnStyles.cellStyle);
                ////////////////////////////////////////////////////////////////////////////////
                // table tab styles first
                //

                var $formFields = that.editColumnProperties.find(".columnStyle .formFields");
                if(columnStyles.contextWidthType == "px"){
                    $formFields.find(".widthPx").val(columnStyles.contextWidth);
                    $formFields.find(".widthPer")
                            .val(Math.round(that.$column.outerWidth() / that.$table.outerWidth() * 100));
                    $formFields.find(".chooseWidthAuto").prop('checked', false);
                    $formFields.find(".chooseWidthPer").prop('checked', false);
                    $formFields.find(".chooseWidthPx").prop('checked', true);
                }else if(columnStyles.contextWidthType == "per"){
                    $formFields.find(".widthPx").val(that.$column.width());
                    $formFields.find(".widthPer").val(columnStyles.contextWidth);
                    $formFields.find(".chooseWidthAuto").prop('checked', false);
                    $formFields.find(".chooseWidthPx").prop('checked', false);
                    $formFields.find(".chooseWidthPer").prop('checked', true);
                }else{
                    $formFields.find(".widthPx").val(that.$column.width());
                    $formFields.find(".widthPer")
                            .val(Math.round(that.$column.outerWidth() / that.$table.outerWidth() * 100));
                    $formFields.find(".chooseWidthPer").prop('checked', false);
                    $formFields.find(".chooseWidthPx").prop('checked', false);
                    $formFields.find(".chooseWidthAuto").prop('checked', true);
                }
                //
                // done with table tab styles first
                ////////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////
                // begin header/cell tab styles

                that.updateCellInputs(that.editColumnProperties.find(".columnHeader"), columnStyles.headerStyle, columnStyles.tableBorderWidth, columnStyles.tableBorderColor, that.styleAsTH);
                that.updateCellInputs(that.editColumnProperties.find(".columnCell"), columnStyles.cellStyle, columnStyles.tableBorderWidth, columnStyles.tableBorderColor, that.styleAsTD);

                //
                // done with header/cell tab styles first
                ////////////////////////////////////////////////////////////////////////////////

            }
            // end helper functions for changing table styles
            //
            ////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////
            //
            // reset selected tab, select first tab
            //

            this.resetPropertiesTabs(this.editColumnProperties);

            //
            ////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////
            //
            // Create Inputs
            //
            // 1st tab: table styles
            (function(){

                function columnHeaders(filterTH, filterTD){
                    return function(){
                        var b = ed.selection.getBookmark(BOOKMARKTYPE);
                        var ths = that.$column.filter(filterTH);
                        var tds = that.$column.filter(filterTD);
                        ths.each(function(index, ele){
                            that.forceCellType(ed, $j(ele), "th");
                        });
                        tds.each(function(index, ele){
                            that.forceCellType(ed, $j(ele), "td");
                        });
                        that.$column = ed.plugins.jiveutil.findColumnBoundsForCell(that.$cell);
                        var $firstRowCell = that.$column.first();
                        var $lastRowCell  = that.$column.last();
                        if($firstRowCell.length && $lastRowCell.length){
                            ed.plugins.jiveblackout.showBlackout(ed, $firstRowCell, $lastRowCell);
                        }
                        ed.selection.moveToBookmark(b);
                        resetInputValues();
                        that.onTableStyleChange.dispatch(that.$column.filter("th"), columnStyles.headerStyle);
                        that.onTableStyleChange.dispatch(that.$column.filter("td"), columnStyles.cellStyle);
                        return false;
                    };
                }

                var $formFields = that.editColumnProperties.find(".columnStyle .formFields");
                var $firstField = $formFields.filter(":first");
                $firstField.find("a.th-t").click(columnHeaders(":first", ":not(:first)"));
                $firstField.find("a.th-tb").click(columnHeaders(":first, :last", ":not(:first, :last)"));
                $firstField.find("a.th-tl").click(columnHeaders("td, th", false));
                $firstField.find("a.th-n").click(columnHeaders(false, "td, th"));

                //
                // setup width px vs % vs auto
                var $widthPerInput = $formFields.find(".widthPer");
                that.createSpinnerInput($widthPerInput, 0, 100, 1, function(){
                    var newVal = $widthPerInput.val();
                    columnStyles.contextWidthType = "per";
                    if(columnStyles.contextWidth != newVal){
                        columnStyles.contextWidth = newVal;
                        that.onTableStyleChange.dispatch(that.$column.first(), {"width": parseNumber(newVal) + "%"});
                        that.onTableStyleChange.dispatch(that.$column.slice(1), {"width": ""});
                        resetInputValues();
                    }
                });
                var $widthPxInput = $formFields.find(".widthPx");
                that.createSpinnerInput($widthPxInput, 0, 9999, 10, function(){
                    var newVal = $widthPxInput.val();
                    columnStyles.contextWidthType = "px";
                    if(columnStyles.contextWidth != newVal){
                        columnStyles.contextWidth = newVal;
                        that.onTableStyleChange.dispatch(that.$column.first(), {"width": parseNumber(newVal) + "px"});
                        that.onTableStyleChange.dispatch(that.$column.slice(1), {"width": ""});
                        resetInputValues();
                    }
                });
                $formFields.find(".chooseWidthAuto").click(function(e){
                    if(columnStyles.contextWidthType != "auto"){
                        columnStyles.contextWidth = 0;
                        columnStyles.contextWidthType = "auto";
                        that.onTableStyleChange.dispatch(that.$column.first(), {"width": ""});
                        resetInputValues();
                        e.stopPropagation(); // JIVE-2879
                    }
                });
                $formFields.find(".chooseWidthPer").click(function(e){
                    if(columnStyles.contextWidthType != "per"){
                        columnStyles.contextWidth = $widthPerInput.val();
                        columnStyles.contextWidthType = "per";
                        that.onTableStyleChange.dispatch(that.$column.first(), {"width": parseNumber(columnStyles.contextWidth) + "%"});
                        that.onTableStyleChange.dispatch(that.$column.slice(1), {"width": ""});
                        resetInputValues();
                        e.stopPropagation(); // JIVE-2879
                    }
                });
                $formFields.find(".chooseWidthPx").click(function(e){
                    if(columnStyles.contextWidthType != "px"){
                        columnStyles.contextWidth = $widthPxInput.val();
                        columnStyles.contextWidthType = "px";
                        that.onTableStyleChange.dispatch(that.$column.first(), {"width": parseNumber(columnStyles.contextWidth) + "px"});
                        that.onTableStyleChange.dispatch(that.$column.slice(1), {"width": ""});
                        resetInputValues();
                        e.stopPropagation(); // JIVE-2879
                    }
                });
            }());

            this.setupCellForm(this.editColumnProperties.find(".columnHeader"), function(){
                return columnStyles.headerStyle;
            }, function(cssToSet){
                resetInputValues();
                that.onTableStyleChange.dispatch(that.$column.filter("th"), cssToSet);
            });
            this.setupCellForm(this.editColumnProperties.find(".columnCell"), function(){
                return columnStyles.cellStyle;
            }, function(cssToSet){
                resetInputValues();
                that.onTableStyleChange.dispatch(that.$column.filter("td"), cssToSet);
            });

            // done setting up inputs
            //
            ////////////////////////////////////////////////////////////////////////

            return function(){
                columnStyles = readStyles(that.$table, that.$column, that.$cell, that.defaultHeaderStyle(), that.defaultCellStyle());
                resetInputValues();
            }
        },

        /**
         * resets the table properties to default configuration
         * @param ed
         */
        _buildRowProperties: function(ed){
            var that = this;
            var rowStyles = null;

            /**
             * resets the values of all the table inputs
             */
            function resetInputValues(){
                serializeStyle(that.$row, rowStyles.headerStyle, rowStyles.cellStyle);
                ////////////////////////////////////////////////////////////////////////////////
                // table tab styles first
                //

                var $formFields = that.editRowProperties.find(".rowStyle .formFields");
                if(rowStyles.contextHeightType == "px"){
                    $formFields.find(".heightPx").val(rowStyles.contextHeight);
                    $formFields.find(".chooseHeightAuto").prop('checked', false);
                    $formFields.find(".chooseHeightPx").prop('checked', true);
                }else{
                    $formFields.find(".heightPx").val(that.$row.outerHeight());
                    $formFields.find(".chooseHeightPx").prop('checked', false);
                    $formFields.find(".chooseHeightAuto").prop('checked', true);
                }

                //
                // done with table tab styles first
                ////////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////
                // begin header/cell tab styles

                that.updateCellInputs(that.editRowProperties.find(".rowHeader"), rowStyles.headerStyle, rowStyles.tableBorderWidth, rowStyles.tableBorderColor, that.styleAsTH);
                that.updateCellInputs(that.editRowProperties.find(".rowCell"), rowStyles.cellStyle, rowStyles.tableBorderWidth, rowStyles.tableBorderColor, that.styleAsTD);

                //
                // done with header/cell tab styles first
                ////////////////////////////////////////////////////////////////////////////////

            }
            // end helper functions for changing table styles
            //
            ////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////
            //
            // reset selected tab, select first tab
            //

            this.resetPropertiesTabs(this.editRowProperties);

            //
            ////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////
            //
            // Create Inputs
            //
            // 1st tab: table styles
            (function(){
                var $formFields = that.editRowProperties.find(".rowStyle .formFields");
                var $firstField = $formFields.filter(":first");
                $firstField.find("a.th-a").click(function(){
                    that.changeHeaderStyle(ed, that.$row, "td","tr:not(:first) th");
                    resetInputValues();
                    that.onTableStyleChange.dispatch(that.$row.find("td"), rowStyles.cellStyle);
                    that.onTableStyleChange.dispatch(that.$row.find("th"), rowStyles.headerStyle);
                    return false;
                });
                $firstField.find("a.th-l").click(function(){
                    that.changeHeaderStyle(ed, that.$row, "td:first-child","th:not(:first-child)");
                    resetInputValues();
                    that.onTableStyleChange.dispatch(that.$row.find("td"), rowStyles.cellStyle);
                    that.onTableStyleChange.dispatch(that.$row.find("th"), rowStyles.headerStyle);
                    return false;
                });
                $firstField.find("a.th-n").click(function(){
                    that.changeHeaderStyle(ed, that.$row, false,"th");
                    resetInputValues();
                    that.onTableStyleChange.dispatch(that.$row.find("td"), rowStyles.cellStyle);
                    that.onTableStyleChange.dispatch(that.$row.find("th"), rowStyles.headerStyle);
                    return false;
                });

                var $rowPxInput = $formFields.find(".heightPx");
                that.createSpinnerInput($rowPxInput, 0, 9999, 10, function(){
                    var newVal = $rowPxInput.val();
                    rowStyles.contextHeightType = "px";
                    if(rowStyles.contextHeight != newVal){
                        rowStyles.contextHeight = newVal;
                        that.onTableStyleChange.dispatch(that.$row, {"height": parseNumber(newVal) + "px"});
                        resetInputValues();
                    }
                });
                $formFields.find(".chooseHeightAuto").click(function(e){
                    if(rowStyles.contextHeightType != "auto"){
                        rowStyles.contextHeight = 0;
                        rowStyles.contextHeightType = "auto";
                        that.onTableStyleChange.dispatch(that.$row, {"height": ""});
                        resetInputValues();
                        e.stopPropagation(); // JIVE-2879
                    }
                });
                $formFields.find(".chooseHeightPx").click(function(e){
                    var newVal = $rowPxInput.val();
                    if(rowStyles.contextHeightType != "px"){
                        rowStyles.contextHeight = newVal;
                        rowStyles.contextHeightType = "px";
                        that.onTableStyleChange.dispatch(that.$row, {"height": parseNumber(newVal) + "px"});
                        resetInputValues();
                        e.stopPropagation(); // JIVE-2879
                    }
                });
            }());

            this.setupCellForm(this.editRowProperties.find(".rowHeader"), function(){
                return rowStyles.headerStyle;
            }, function(cssToSet){
                resetInputValues();
                that.onTableStyleChange.dispatch(that.$row.find("th"), cssToSet);
            });
            this.setupCellForm(this.editRowProperties.find(".rowCell"), function(){
                return rowStyles.cellStyle;
            }, function(cssToSet){
                resetInputValues();
                that.onTableStyleChange.dispatch(that.$row.find("td"), cssToSet);
            });

            // done setting up inputs
            //
            ////////////////////////////////////////////////////////////////////////

            return function(){
                rowStyles = readStyles(that.$table, that.$row, that.$cell, that.defaultHeaderStyle(), that.defaultCellStyle());
                resetInputValues();
            }
        },


        /**
         * resets the table properties to default configuration
         * @param ed
         */
        _buildCellProperties: function(ed){
            var that = this;
            var cellStyles = null;

            /**
             * resets the values of all the table inputs
             */
            function resetInputValues(){
                serializeStyle(that.$cell, cellStyles.headerStyle, cellStyles.cellStyle);
                ////////////////////////////////////////////////////////////////////////////////
                // table tab styles first
                //

                // TODO: noop for now

                //
                // done with table tab styles first
                ////////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////
                // begin header/cell tab styles

                that.updateCellInputs(that.editCellProperties.find(".cellHeader"), cellStyles.headerStyle, cellStyles.tableBorderWidth, cellStyles.tableBorderColor, that.styleAsTH);
                that.updateCellInputs(that.editCellProperties.find(".cellCell"), cellStyles.cellStyle, cellStyles.tableBorderWidth, cellStyles.tableBorderColor, that.styleAsTD);

                //
                // done with header/cell tab styles first
                ////////////////////////////////////////////////////////////////////////////////

            }
            // end helper functions for changing table styles
            //
            ////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////
            //
            // reset selected tab, select first tab
            //

            function resetSelectedTab(){
                // reset the tabs to show the first table tab
                that.editCellProperties.children("div").hide();
                that.editCellProperties.children("div:first").show();
                that.editCellProperties.children("div:nth(1)").show();
                that.editCellProperties.find("div:first input:first").click(function(e){
                    var $form = that.editCellProperties.find("form");
                    $form.children("div:not(nth(1))").hide();
                    $form.children("div:nth(1)").show();
                    $form.children("div:first").show();

                    that.editCellProperties.find("div:first input:last").prop('checked', false);
                    that.editCellProperties.find("div:first input:first").prop('checked', true);

                    if(!that.$cell.is("th")){
                        var b = ed.selection.getBookmark(BOOKMARKTYPE);
                        that.$cell = that.forceCellType(ed, that.$cell, "th");

                        ed.plugins.jiveblackout.showBlackout(ed, that.$cell);
                        ed.selection.moveToBookmark(b);
                        resetInputValues();
                        that.onTableStyleChange.dispatch(that.$cell, cellStyles.headerStyle);
                        e.stopPropagation(); // JIVE-2879
                    }
                });
                that.editCellProperties.find("div:first input:last").click(function(e){
                    var $form = that.editCellProperties.find("form");
                    $form.children("div:not(nth(2))").hide();
                    $form.children("div:nth(2)").show();
                    $form.children("div:first").show();

                    that.editCellProperties.find("div:first input:first").prop('checked', false);
                    that.editCellProperties.find("div:first input:last").prop('checked', true);

                    if(!that.$cell.is("td")){
                        var b = ed.selection.getBookmark(BOOKMARKTYPE);
                        that.$cell = that.forceCellType(ed, that.$cell, "td");

                        ed.plugins.jiveblackout.showBlackout(ed, that.$cell);
                        ed.selection.moveToBookmark(b);
                        resetInputValues();
                        that.onTableStyleChange.dispatch(that.$cell, cellStyles.cellStyle);
                        e.stopPropagation(); // JIVE-2879
                    }
                });

                // make sure the form is attached to the body
                if(that.editCellProperties.parents("body").length){
                    if(that.$cell.is("th")){
                        that.editCellProperties.find("div:first input:first").click();
                    }else{
                        that.editCellProperties.find("div:first input:last").click();
                    }
                }
            }


            //
            ////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////
            //
            // Create Inputs
            //

            this.setupCellForm(this.editCellProperties.find(".cellHeader"), function(){
                return cellStyles.headerStyle;
            }, function(cssToSet){
                resetInputValues();
                that.onTableStyleChange.dispatch(that.$cell.filter("th"), cssToSet);
            });
            this.setupCellForm(this.editCellProperties.find(".cellCell"), function(){
                return cellStyles.cellStyle;
            }, function(cssToSet){
                resetInputValues();
                that.onTableStyleChange.dispatch(that.$cell.filter("td"), cssToSet);
            });

            // done setting up inputs
            //
            ////////////////////////////////////////////////////////////////////////

            return function(){
                cellStyles = readStyles(that.$table, that.$cell, that.$cell, that.defaultHeaderStyle(), that.defaultCellStyle());
                resetSelectedTab();
                resetInputValues();
            }
        },




        /**
         * resets the cell merge back to normal
         * @param ed
         */
        _buildCellMerge: function(ed){

            ////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////
            //
            // initialize initial values for attributes and form fields
            //
            var that = this;

            var colspan = 0;
            var rowspan = 0;

            var $form = that.mergeCellProperties.find(".content");

            function rereadAttributesFromNode(){
                // reset the colspan/rowspan variables to whatever is set on the node
                rowspan = that.$cell.attr("rowspan") ? that.$cell.attr("rowspan") : 1;
                colspan = that.$cell.attr("colspan") ? that.$cell.attr("colspan") : 1;
            }


            /**
             * updates the table to match the chosen styles
             */
            function updateNode(){

                // set the colspan/rowspan attribute to match the colspan
                // this'll likely be a
                var args = [];
                args["cell"] = that.$cell.get(0);
                args["numcols"] = colspan;
                args["numrows"] = rowspan;

                ed.focus();
                var b = ed.selection.getBookmark();

                ed.execCommand("mceTableSplitCells", false, args);
                ed.execCommand("mceTableMergeCells", false, args);
                ed.plugins.jiveblackout.showBlackout(ed, that.$cell);

                ed.nodeChanged();

                ed.selection.moveToBookmark(b);

                ed.focus();
            }

            /**
             * resets the values of all the table inputs
             */
            function resetInputValues(){
                // set the value of the colspan/rowspan inputs to match the variable
                $form.find("input.rowspan").val(rowspan);
                $form.find("input.colspan").val(colspan);
            }
            // end helper functions for changing table styles
            //
            ////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////
            //
            // Create Inputs
            //

            this.createSpinnerInput($form.find("input.rowspan"), 1, 100, 1, function(){
                var newVal = $form.find("input.rowspan").val();
                if(rowspan != newVal){
                    rowspan = newVal;
                    resetInputValues();
                    updateNode();
                }
            });

            this.createSpinnerInput($form.find("input.colspan"), 1, 100, 1, function(){
                var newVal = $form.find("input.colspan").val();
                if(colspan != newVal){
                    colspan = newVal;
                    resetInputValues();
                    updateNode();
                }
            });

            // done setting up inputs
            //
            ////////////////////////////////////////////////////////////////////////

            return function(){
                rereadAttributesFromNode();
                resetInputValues();
            }
        },
        //
        // end code for Table vs Column vs Row vs Cell
        //
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////

        /**
         * updates all the inputs in the $form to match the input header style
         * @param $form the header cell form to update
         * @param headerStyle the style to update
         */
        updateCellInputs :function($form, headerStyle, tableBorderWidth, tableBorderColor, styleAsCellFunc){
            // padding
            var p = parseInt(headerStyle.padding);
            p = isNaN(p) ? 0 : p;
            $form.find(".formFields .padding").val(p);
            // background color
            $form.find(".formFields:nth(1) .backgroundColor").val(headerStyle.backgroundColor);
            $form.find(".formFields:nth(1) .colorSample").css("background-color", headerStyle.backgroundColor ? headerStyle.backgroundColor : "white");
            // table alignment
            $form.find(".formFields:last a.mceButton.mce_justify.mce_justify" + headerStyle.textAlign).addClass("mceButtonSelected");
            $form.find(".formFields:last a.mceButton.mce_justify:not(.mce_justify" + headerStyle.textAlign + ")").removeClass("mceButtonSelected");
            // vertical alignment
            $form.find(".formFields:last a.mceButton.mce_valign.mce_valign" + headerStyle.verticalAlign).addClass("mceButtonSelected");
            $form.find(".formFields:last a.mceButton.mce_valign:not(.mce_valign" + headerStyle.verticalAlign + ")").removeClass("mceButtonSelected");

            styleAsCellFunc.call(this, $form.find(".sampleHeader th"), headerStyle);
            var $sampleHeader = $form.find(".sampleHeader");
            $sampleHeader.find("th").css("padding", Math.min(p, 5) + "px");
            $sampleHeader.css("border-width", Math.min(tableBorderWidth, 5) + "px");
            $sampleHeader.css("border-color", tableBorderColor);
            $sampleHeader.css("border-style", "solid");
            $sampleHeader.attr("border", Math.min(tableBorderWidth, 10));

            var fontFamily = headerStyle.fontFamily ? headerStyle.fontFamily : this.defaultFont();
            $form.find(".formFields:nth(2) .family").css("font-family", headerStyle.fontFamily).text(this.fontName(fontFamily));

            // font color
            $form.find(".formFields:nth(2) .fontColor").val(headerStyle.color);
            $form.find(".formFields:nth(2) .colorSample").css("background-color", headerStyle.color);

        },


        setupCellForm : function($form, styleFunc, updateFunc){
            var that = this;
            ////////////////////////////////////////////////////////////////////////
            //
            // 2nd tab: table header styles
            //
            // setup border width
            that.createSpinnerInput($form.find("input.padding"), 0, 100, 1, function(){
                var style = styleFunc();
                var newVal = $form.find("input.padding").val();
                if(style.padding != newVal){
                    style.padding = newVal;
                    updateFunc({"padding": newVal + "px"});
                }
            });

            //
            // setup background color
            that.createColorInput($form.find("input.backgroundColor"), function(){
                var style = styleFunc();
                var newVal = $form.find("input.backgroundColor").val();
                if(style.backgroundColor != newVal){
                    style.backgroundColor = newVal;
                    updateFunc({"background-color": newVal});
                }
            }, true);

            //
            // setup font
            that.createFontInput($form.find("a.family"), function(){
                var style = styleFunc();
                var newVal = $form.find("a.family").data("font-family");
                if(style.fontFamily != newVal){
                    style.fontFamily = newVal;
                    updateFunc({"font-family": newVal});
                }
            });

            //
            // setup alignment
            $form.find(".formFields:last a.mceButton").click(function(){
                var style = styleFunc();
                var $this = $j(this);
                if($this.hasClass("mce_justifyleft")){
                    style.textAlign = "left";
                }
                if($this.hasClass("mce_justifycenter")){
                    style.textAlign = "center";
                }
                if($this.hasClass("mce_justifyright")){
                    style.textAlign = "right";
                }
                if($this.hasClass("mce_justifyfull")){
                    style.textAlign = "full";
                }
                if($this.hasClass("mce_valigntop")){
                    style.verticalAlign = "top";
                }
                if($this.hasClass("mce_valignmiddle")){
                    style.verticalAlign = "middle";
                }
                if($this.hasClass("mce_valignbottom")){
                    style.verticalAlign = "bottom";
                }
                if($this.hasClass("mce_justifyleft")){
                    $form.find(".formFields:last a.mceButton.mce_justify").not(this).removeClass("mceButtonSelected");
                }else{
                    $form.find(".formFields:last a.mceButton.mce_valign").not(this).removeClass("mceButtonSelected");
                }
                $this.addClass("mceButtonSelected");
                updateFunc({
                    "text-align": style.textAlign,
                    "vertical-align": style.verticalAlign
                });
                return false;
            });

            //
            // setup font color
            that.createColorInput($form.find("input.fontColor"), function(){
                var style = styleFunc();
                var newVal = $form.find("input.fontColor").val();
                if(style.color != newVal){
                    style.color = newVal;
                    updateFunc({"color": newVal});
                }
            });
            //
            ////////////////////////////////////////////////////////////////////////
        },

        /**
         * builds the popover dom
         * @param ed
         */
        buildPopover: function(ed){
            var that = this;
            var contextPlugin = ed.plugins.jivecontextmenu;

            //These are property pages, which get rendered as submenu items
            this.editTableProperties = $j(jive.rte.table.allTableProperties());
            this.editColumnProperties = $j(jive.rte.table.allColumnProperties());
            this.editRowProperties = $j(jive.rte.table.allRowProperties());
            this.editCellProperties = $j(jive.rte.table.allCellProperties());
            this.mergeCellProperties = $j(jive.rte.table.mergeCellProperties());

            this.resetTableProperties  = this._buildTableProperties(ed);
            this.resetColumnProperties = this._buildColumnProperties(ed);
            this.resetRowProperties    = this._buildRowProperties(ed);
            this.resetCellProperties   = this._buildCellProperties(ed);
            this.resetCellMerge   = this._buildCellMerge(ed);

            function hideBlackout(){
                ed.plugins.jiveblackout.hideBlackout();
            }
            function hideMenu(){
                contextPlugin.hideMenu();
            }
            function displayCallback(cell){
                var $cell = $j(cell);
                that.$table = $cell.parents("table");
                that.$row = $cell.parents("tr");
                that.$column = ed.plugins.jiveutil.findColumnBoundsForCell($cell);
                that.$cell = $cell;

                that.resetTableProperties(ed);
                that.resetColumnProperties(ed);
                that.resetRowProperties(ed);
                that.resetCellProperties(ed);
                that.resetCellMerge(ed);

                //make blackout behave
                function propHideMenu(){
                    contextPlugin.onHideMenu.remove(propHideBlackout);
                    hideMenu();
                }
                function propHideBlackout(){
                    ed.onHideBlackout.remove(propHideMenu);
                    hideBlackout();
                }
                if(contextPlugin) contextPlugin.onHideMenu.add(propHideBlackout);
                if(ed.onHideBlackout) ed.onHideBlackout.add(propHideMenu);
            }
//            this.displayCallback = displayCallback;

            //Constructs a "submenu" that displays a proprety page
            var tableCellRegExp = /^td|th$/i;

            if(contextPlugin){
                function makePropertiesMenu(id, $props, w, h){
                    function render(){
                        return $props.get(0);
                    }
                    var item = new contextPlugin.MenuItem(id, tableCellRegExp, null, render, $j.noop, {width: w ? w : 232, height: h ? h : 371}, null, null, displayCallback);
                    return new contextPlugin.Menu([item], true, true);
                }

                function tableBlackout(){
                    var contextNode = this.findContextNode(ed.selection.getRng(true));
                    ed.plugins.jiveblackout.showBlackout(ed, $j(contextNode).parents("table"));
                }

                //Whole table props
                var tableItem = new contextPlugin.MenuItem("tableItem", tableCellRegExp, jive.rte.table.propertiesChooserTable(), {
                    url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/icons.gif",
                    xOffset: 580,
                    yOffset: 20,
                    width: 20,
                    height: 20
                }, makePropertiesMenu("tableProps", this.editTableProperties), null, tableBlackout);

                //Column props
                var columnItem = new contextPlugin.MenuItem("columnItem", tableCellRegExp, jive.rte.table.propertiesChooserColumn(), {
                    url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/icons.gif",
                    xOffset: 600,
                    yOffset: 40,
                    width: 20,
                    height: 20
                }, makePropertiesMenu("columnProps", this.editColumnProperties), null, function(){
                    var $cell = $j(this.findContextNode(ed.selection.getRng(true)));

                    var $firstRowCell = ed.plugins.jiveutil.findColumnFirstCell($cell);
                    var $lastRowCell = ed.plugins.jiveutil.findColumnLastCell($cell);

                    if($firstRowCell.length && $lastRowCell.length){
                        ed.plugins.jiveblackout.showBlackout(ed, $firstRowCell, $lastRowCell);
                    }
                });

                //Row props
                var rowItem = new contextPlugin.MenuItem("rowItem", tableCellRegExp, jive.rte.table.propertiesChooserRow(), {
                    url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/icons.gif",
                    xOffset: 780,
                    yOffset: 20,
                    width: 20,
                    height: 20
                }, makePropertiesMenu("rowProps", this.editRowProperties), null, function(){
                    var contextNode = this.findContextNode(ed.selection.getRng(true));
                    ed.plugins.jiveblackout.showBlackout(ed, $j(contextNode).parents("tr"));
                });

                //Cell props
                var cellItem = new contextPlugin.MenuItem("cellItem", tableCellRegExp, jive.rte.table.propertiesChooserCell(), {
                    url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/icons.gif",
                    xOffset: 600,
                    yOffset: 20,
                    width: 20,
                    height: 20
                }, makePropertiesMenu("cellProps", this.editCellProperties), null, function(){
                    var contextNode = this.findContextNode(ed.selection.getRng(true));
                    ed.plugins.jiveblackout.showBlackout(ed, $j(contextNode));
                });



                //Cell props
                var mergeCellItem = new contextPlugin.MenuItem("mergeCellItem", tableCellRegExp, jive.rte.table.propertiesChooserMergeCells(), {
                    url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/icons.gif",
                    xOffset: 760,
                    yOffset: 20,
                    width: 20,
                    height: 20
                }, makePropertiesMenu("mergeCellProps", this.mergeCellProperties, 156, 110), null, function(){
                    var contextNode = this.findContextNode(ed.selection.getRng(true));
                    ed.plugins.jiveblackout.showBlackout(ed, $j(contextNode));
                });

                //Delete table
                var deleteTableItem = new contextPlugin.MenuItem("deleteTableItem", tableCellRegExp, jive.rte.table.deleteText(), {
                    url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/icons.gif",
                    xOffset: 620,
                    yOffset: 20,
                    width: 20,
                    height: 20
                }, function(contextNode){
                    var $table = $j(contextNode).closest("table");
                    if($table.length){  // sanity check
                        ed.execCommand('mceTableDelete');
                        ed.plugins.jiveblackout.hideBlackout();
                    }
                    return true;
                }, null, tableBlackout);


                this.propertyChooserMenu = new contextPlugin.Menu([tableItem, columnItem, rowItem, cellItem, mergeCellItem, deleteTableItem], true, false, jive.rte.table.editText(), null, hideBlackout);

                //Top level menu item
                return new contextPlugin.MenuItem("tablePropsItem", tableCellRegExp, null, {
                    url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/icons.gif",
                    xOffset: 580,
                    yOffset: 20,
                    width: 20,
                    height: 20
                }, this.propertyChooserMenu);
            }
            return null;
        },

        init : function(ed){
            this.ed = ed;

            this.FONT_MENU = (function(){
                var fontStr = ed.settings.theme_advanced_fonts;
                var html = [];
                html.push("<div class='fontPicker'>");

                $j.each(fontStr.split(';'), function(indx,font) {
                    var fontInfo = font.split("=");

                    html.push("<a href='javascript:;' style='font-family: ");
                    html.push(fontInfo[1]);
                    html.push("' data-font-info='");
                    html.push(fontInfo[1]);
                    html.push("'>");
                    html.push(fontInfo[0]);
                    html.push("</a>");
                });
                html.push("</div>");

                return html.join("");
            })();


            ed.onInit.add(function(){
                //this initialization takes about a full second in IE7, so defer it outside of onInit
                var that = this;

                function initialize(){
                    if(!initialize.hasRun){
                        initialize.hasRun = true;

                        //This is the model code.  It decides how we update the DOM in response to the user's actions
                        that.onTableStyleChange = new tinymce.util.Dispatcher();
                        that.onTableStyleChange.add(updateStyles);

                        var popOverMenu = that.buildPopover(ed);
                        if(ed.plugins.jivecontextmenu){
                            ed.plugins.jivecontextmenu.addRootItem(popOverMenu);
                        }
                    }
                }
                if(tinymce.isIE7){
                    ed.onNodeChange.add(function(){
                        if(!initialize.hasRun){
                            if(ed.dom.select("table").length > 0){
                                initialize();
                            }
                        }
                    });
                }else{
                    initialize();
                }
            }, this);
        },



        getInfo : function() {
            return {
                longname : 'Jive Table',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
        }


    });
	// Register plugin
	tinymce.PluginManager.add('jivetable', tinymce.plugins.JiveTablePlugin);
})();
