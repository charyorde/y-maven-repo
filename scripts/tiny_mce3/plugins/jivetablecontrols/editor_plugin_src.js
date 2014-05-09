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

    tinymce.create('tinymce.plugins.JiveTableControlsPlugin', {

        rte: null,

        $rowopts: null,
        $colopts: null,
        $addrows: null,
        $rowPopover: null,
        $colPopover: null,

        $rowline: null,
        $colline: null,

        minY : 0,
        minX : 0,
        $node : null,


        resetMinMaxY : function(ed){
            this.minY = ed.plugins.jivescroll.lastScrollY;
            this.minX = ed.plugins.jivescroll.lastScrollX;
        },


        execCommand : function(cmd, ui, val) {
			var ed = this.ed;
            if(cmd == "mceTableDuplicateCol"){
                var currCol = ed.plugins.jiveutil.findColumnBoundsForCell(this.$node);
                currCol.each(function(i){
                    $j(this).clone().insertAfter($j(this));
                });
                return true;
            }else if(cmd == "mceTableDuplicateRow"){
                var currRow = this.$node.closest("tr");
                currRow.clone().insertAfter(currRow);
                return true;
            }
        },

        setRTE : function(rte){
            this.rte = rte;
            this.completeInit();
        },

        completeInit : function(){
            if(this.ed && this.rte && !this.initialized){
                this.initialized = true;
                var ed = this.ed;
                var rte = this.rte;
                var that = this;

                ed.plugins.jivetable.createSpinnerInput(this.$addrows.find("input.rows"), 1, 99, 1, function(){ });

                var enterHandler = function(e){
                    if(e.keyCode == 13){
                        that.$addrows.find("input.button").mousedown();
                        return false;
                    }
                };

                this.$addrows.find("input.rows").keydown(enterHandler).keyup(enterHandler).keypress(enterHandler);

                if(that.rte){
                    that.$rowline.appendTo(that.rte.getPopOverContainer()).hide();
                    that.$colline.appendTo(that.rte.getPopOverContainer()).hide();
                }

                this.$addrows.find("input.button").mousedown(function(){
                    var $rows = that.$addrows.find("input.rows");
                    $rows.change(); //enforce value limits; this doesn't always happen before the mousedown handler
                    var rows = $rows.val();

                    // in IE we can actually select the table node itself,
                    // so we need to make sure we're looking at the actual
                    // selected table, and not it's parent table
                    var $node = $j($j(that.$node).closest("table").andSelf().toArray().reverse()).filter("table");

//                    alert(ed.selection.getNode().nodeName);
//                    alert($j(ed.selection.getNode()).closest("table").get(0).className);

                    if($node.length){
                        var $tr = $node.find("tbody:first tr:last");
                        var $par = $tr.parent();
                        $tr = $tr.clone();
                        $tr.find("td, th").empty();
                        if(!tinymce.isIE){
                            $tr.find("td, th").append(ed.plugins.jivemacros.createMozBR(ed.getDoc()));
                        }
                        for(var i=0;i<rows;i++){
                            $par.append($tr.clone());
                        }
                        ed.nodeChanged();
                    }
                    ed.focus();
                    return false;
                }).click(function(){
                    return false;
                }).mouseup(function(){
                    ed.focus();
                    return false;
                });

                ed.onResizingNode.add(function($node){
                    if(that.$node && that.$node.closest("table").get(0) == $node.get(0)){
                        that.showCorners(ed, that.$node);
                    }
                });
                ed.onNodeChange.add(function(ed){
                    var $node = $j($j(ed.selection.getNode()).closest("td,th").andSelf().toArray().reverse()).filter("td,th");

                    if($node.is("td,th")){
                        this.showCorners(ed, $node);
                    }else{
                        this.hideCorners();
                    }
                }, this);
                ed.onMouseDown.add(function(ed){
//                    that.hideCorners();
                },this);
                that.resetMinMaxY(ed);



                ////////////////////////////////////////////////
                //
                // drag to change row location
                var originalX = 0;
                var originalY = 0;
                var putAtEnd = false;
                var book = null;

                var dragTR = null;
                var closestTR = null;
                var dragCol = null;
                var closestCol = null;
                var $columnBounds = null;
                var originalHeight = 0;
                var originalTop = 0;
                var contentAreaH = 0;
                var contentAreaW = 0;
                var topOfIframe = 0;

                this.$rowopts.mousedown(function(e){
                    topOfIframe = $j(ed.getContentAreaContainer()).offset().top;


                    closestTR = null;
                    closestCol = null;
                    originalX = e.pageX;
                    originalY = e.pageY;
                    ed.plugins.jivemouse.showMouseCatch();

                    contentAreaH = that.rte.getContentAreaHeight();
                    contentAreaW = that.rte.getContentAreaWidth();

                    //
                    // create a clone so we can properly
                    // match row/hover offsets
                    var trPos = that.$node.closest("tr").offset();

                    dragTR = ed.plugins.jiveutil.clone(that.$node.closest("tr"), window.parent.document).wrap("<table/>").closest("table").addClass("temp");
                    dragTR.find("th").each(function(i){
                        $j(this).width(that.$node.closest("tr").find("th:nth(" + i + ")").outerWidth());
                    });
                    dragTR.find("td").each(function(i){
                        $j(this).width(that.$node.closest("tr").find("td:nth(" + i + ")").outerWidth());
                    });
                    dragTR.find("td,th").empty();
                    var props = {
                        position: "absolute",
                        left: trPos.left,
                        top: trPos.top,
                        margin: 0,
                        backgroundColor: "#999999",
                        opacity: .5,
                        width: that.$node.closest("table").outerWidth() +"px",
                        height: that.$node.closest("tr").outerHeight()
                    };
                    if(props.left < that.minX) props.left = that.minX;
                    if(props.left > that.minX + contentAreaW) props.left = that.minX + contentAreaW;
                    if(props.top < that.minY + 12){
                        props.height += props.top - that.minY - 12;
                        props.top = that.minY + 12;
                    }
                    if(props.top + props.height > that.minY + contentAreaH){
                        props.height = that.minY + contentAreaH - props.top
                    }

                    originalTop = props.top;
                    originalHeight = props.height;

                    dragTR.attr("style", that.$node.closest("table").attr("style"));
                    dragTR.css(props);
                    dragTR.find("tr").css("height", "auto");
                    dragTR.insertBefore(that.$rowline);

                    that.$rowline.show().css({
                        width: that.$node.closest("table").outerWidth(),
                        top: trPos.top - 2 + "px",
                        left: trPos.left + "px"
                    });
                    book = ed.selection.getBookmark();
                    return false;
                });
                $j(ed.getContainer()).parents("body").bind("mousemove.rte", function(e){
                    if(dragTR && that.$node && that.$node.closest("table").length){
                        closestTR = that.$node.closest("tr");
                        var closestTable = that.$node.closest("table");


                        /**
                         * scrolling while dragging almost works
                         * but not quite
                        if(e.pageY > topOfIframe + contentAreaH - 50){
                            // scroll down
                            that.$node.parents('html, body').stop(true).animate({
                                scrollTop: that.$node.parents('html, body').scrollTop() + 50
                            }, 300);
                        }else if(e.pageY < topOfIframe + 50){
                            // scroll up
                            that.$node.parents('html, body').stop(true).animate({
                                scrollTop: that.$node.parents('html, body').scrollTop() - 50
                            }, 300);
                        }
                        */


                        var dragAdjustY =  (e.pageY - originalY);
                        dragTR.css("top", originalTop + dragAdjustY + "px");

                        closestTR = null;
                        var closestOffset = 0;

                        that.$node.closest("tr").parent().children("tr").each(function(i){
                            if(!closestTR){
                                closestTR = $j(this);
                            }
                            var off = Math.abs((dragTR.position().top + dragTR.outerHeight() / 2) - $j(this).offset().top);
                            if(i == 0 || off < closestOffset){
                                closestTR = $j(this);
                                closestOffset = off;
                            }
                        });

                        var off = Math.abs((dragTR.position().top + dragTR.outerHeight() / 2) - (closestTable.offset().top + closestTable.outerHeight()));
                        if(off < closestOffset){
                            // closer to the bottom of the table
                            that.$rowline.css("top", closestTable.offset().top + closestTable.outerHeight() - 2 + "px");
                            putAtEnd = true;
                        }else{
                            // closer to the top of a row
                            that.$rowline.css("top", closestTR.offset().top - 2 + "px");
                            putAtEnd = false;
                        }

                        var props = {
                            top: dragTR.position().top - 8,
                            left: dragTR.position().left,
                            height: originalHeight - 1 + 16
                        };

                        if(props.left < that.minX) props.left = that.minX;
                        if(props.left > that.minX + contentAreaW) props.left = that.minX + contentAreaW;
                        if(props.top < that.minY + 12){
                            props.height += props.top - that.minY - 12;
                            props.top = that.minY + 12;
                        }
                        if(props.top + props.height > that.minY + contentAreaH){
                            props.height = that.minY + contentAreaH - props.top
                        }
                        that.trimCorners(props, that.$rowopts);
                        dragTR.css("height", props.height - 12);
                        dragTR.css("top", props.top + 6);
//                        dragTR.find("tr").css("height", props.height - 12);
                    }
                });
                $j(ed.getContainer()).parents("body").bind("mouseup.rte", function(e){
                    var changed = false;
                    var $currentNode = that.$node; //save the current $node, as later code may cause nodechange events, nulling it
                    var $parTable = $currentNode ? $currentNode.closest("table") : $j([]);
                    var remerge = false;

                    if(dragTR || dragCol){
                        $parTable.find("[colspan], [rowspan]").each(function(){
                            var $cell = $j(this);

                            var colspan = $cell.attr("colspan");
                            var rowspan = $cell.attr("rowspan");
                            //IE like to have these, even if the value is 1.
                            if((colspan != null && colspan != 1) || (rowspan != null && rowspan != 1)){
                                remerge = true;
                                $cell.attr("_colspan", colspan);
                                $cell.attr("_rowspan", rowspan);
                                var args = [];
                                args["cell"] = this;
                                ed.execCommand("mceTableSplitCells", false, args);
                            }
                        });
                    }

                    if(dragTR && $currentNode && $parTable.length){
                        ed.plugins.jivemouse.hideMouseCatch();
                        that.rte.getPopOverContainer().find(".temp").remove();
                        dragTR = null;
                        that.$rowline.hide();
                        if(closestTR && putAtEnd){
                            // move the row to the end of the table
                            $currentNode.closest("tr").appendTo(closestTR.parent());
                            changed = true;
                        }else if(closestTR && !putAtEnd){
                            // move the row to above closestTR
                            if($currentNode.closest("tr").get(0) != closestTR.get(0)){
                                $currentNode.closest("tr").insertBefore(closestTR);
                            }
                            changed = true;
                        }
                    }
                    if(dragCol && $currentNode && $parTable.length){
                        ed.plugins.jivemouse.hideMouseCatch();
                        that.rte.getPopOverContainer().find(".temp").remove();
                        dragCol = null;
                        that.$colline.hide();
                        if(closestCol && putAtEnd){
                            // move the column to the far right
                            var currCol = ed.plugins.jiveutil.findColumnBoundsForCell($currentNode);
                            closestCol = ed.plugins.jiveutil.findColumnBoundsForCell($currentNode.nextAll("td:last-child, th:last-child"));

                            if(currCol.get(0) != closestCol.get(0)){
                                currCol.each(function(i){
                                    var n = closestCol.filter(":nth("+i + ")");
                                    if(n.length){
                                        $j(this).insertAfter(n);
                                    }
                                });
                            }
                            changed = true;
                        }else if(closestCol && !putAtEnd){
                            // move the column to the left of closestCol
                            var currCol = ed.plugins.jiveutil.findColumnBoundsForCell($currentNode);
                            closestCol = ed.plugins.jiveutil.findColumnBoundsForCell(closestCol);

                            if(currCol.get(0) != closestCol.get(0)){
                                currCol.each(function(i){
                                    var n = closestCol.filter(":nth("+i + ")");
                                    if(n.length){
                                        $j(this).insertBefore(n);
                                    }
                                });
                            }
                            changed = true;
                        }
                    }

                    if(remerge){
                        $parTable.find("[_colspan], [_rowspan]").each(function(){
                            var colspan = $j(this).attr("_colspan");
                            var rowspan = $j(this).attr("_rowspan");
                            $j(this).removeAttr("_colspan");
                            $j(this).removeAttr("_rowspan");
                            var args = [];
                            args["cell"] = this;
                            args["numcols"] = colspan ? colspan : 1;
                            args["numrows"] = rowspan ? rowspan : 1;
                            ed.execCommand("mceTableMergeCells", false, args);
                        });
                    }


                    if (ed.selection) {
                        ed.selection.moveToBookmark(book);
                    }
                    if(changed){
                        ed.nodeChanged();
                    }
                });






                ////////////////////////////////////////////////
                //
                // drag to change column location
                this.$colopts.mousedown(function(e){
                    closestTR = null;
                    closestCol = null;
                    originalX = e.pageX;
                    originalY = e.pageY;
                    ed.plugins.jivemouse.showMouseCatch();

                    contentAreaH = that.rte.getContentAreaHeight();
                    contentAreaW = that.rte.getContentAreaWidth();

                    //
                    // create a clone so we can properly
                    // match row/hover offsets
                    $columnBounds = ed.plugins.jiveutil.findColumnFirstCell(that.$node);
                    var colPos = $columnBounds.offset();


                    dragCol = $j("<table><tr><td></td></tr></table>").addClass("temp");
                    var props = {
                        position: "absolute",
                        left: colPos.left,
                        top: colPos.top,
                        margin: 0,
                        backgroundColor: "#999999",
                        opacity: .5,
                        width: $columnBounds.outerWidth() +"px",
                        height: that.$node.closest("table").outerHeight()
                    };
                    if(props.left < that.minX) props.left = that.minX;
                    if(props.left > that.minX + contentAreaW) props.left = that.minX + contentAreaW;
                    if(props.top < that.minY + 12){
                        props.height += props.top - that.minY - 12;
                        props.top = that.minY + 12;
                    }
                    if(props.top + props.height > that.minY + contentAreaH){
                        props.height = that.minY + contentAreaH - props.top
                    }

                    originalTop = props.top;
                    originalHeight = props.height;


                    dragCol.attr("style", that.$node.closest("table").attr("style"));
                    dragCol.css(props);
                    dragCol.insertBefore(that.$colline);

                    that.$colline.show().css({
                        height: originalHeight,
                        top: colPos.top + "px",
                        left: colPos.left - 2 + "px"
                    });
                    book = ed.selection.getBookmark();
                    return false;
                });
                $j(ed.getContainer()).parents("body").mousemove(function(e){
                    if(dragCol && that.$node && that.$node.closest("table").length){
//                        closestCol = ed.plugins.jiveutil.findColumnBoundsForCell(that.$node);
                        var closestTable = that.$node.closest("table");

                        var dragAdjustX =  (e.pageX - originalX);
                        dragCol.css("left", $columnBounds.offset().left + dragAdjustX + "px");

                        closestCol = null;
                        var closestOffset = 0;

                        that.$node.closest("tr").children("td,th").each(function(i){
                            if(!closestCol){
                                closestCol = $j(this);
                            }
                            var off = Math.abs((dragCol.position().left + dragCol.outerWidth() / 2) - $j(this).offset().left);
                            if(i == 0 || off < closestOffset){
                                closestCol = $j(this);
                                closestOffset = off;
                            }
                        });

                        var off = Math.abs((dragCol.position().left + dragCol.outerWidth() / 2) - (closestTable.offset().left + closestTable.outerWidth()));
                        if(off < closestOffset){
                            // closer to the right of the table
                            that.$colline.css("left", closestTable.offset().left + closestTable.outerWidth() - 2 + "px");
                            putAtEnd = true;
                        }else{
                            // closer to the left of a column
                            that.$colline.css("left", closestCol.offset().left - 2 + "px");
                            putAtEnd = false;
                        }

                        var props = {
                            top: dragCol.position().top,
                            left: dragCol.position().left,
                            width: dragCol.outerWidth() - 1
                        };
                        var contentAreaH = that.rte.getContentAreaHeight();
                        var contentAreaW = that.rte.getContentAreaWidth();
                        if(props.top < that.minY) props.top = that.minY;
                        if(props.top > that.minY + contentAreaH) props.top = that.minY + contentAreaH;
                        if(props.left < that.minX) props.left = that.minX;
                        if(props.left > that.minX + contentAreaW) props.left = that.minX + contentAreaW;
                        that.trimCorners(props, that.$colopts);
                    }
                });



                ////////////////////////////////////////////////////////
                //
                // sprocket icon for adding/deleting rows
                that.$rowopts.find("a.settings").mousedown(function(){
                    if(that.rowOpts){
                        that.rowOpts.closeFunc();
                    }
                    if(that.colOpts){
                        that.colOpts.closeFunc();
                    }
                    that.rowOpts = {
                        context: that.$rowopts.find("a.settings"),
                        position: "below",
                        container: that.rte.getPopOverContainer(),
                        clickOverlay: false,
                        addClass: "j-rte-popover js-rowProperties",
                        returnPopover: true,
                        arrowAdjust: 0,
                        nudge: { left: 30 },
                        destroyOnClose: false,
                        darkPopover: true,
                        onClose:function(){
//                            that.hideCorners();
                            that.rowOpts = null;
                        }
                    };
                    that.$rowPopover.popover(that.rowOpts);
                    return false;
                }).click(function(){
                    return false;
                });
                that.$rowPopover.find("a.js-addRowBefore").click(function(){
                    ed.execCommand("mceTableInsertRowBefore");
                    that.hidePopover();
                    return false;
                });
                that.$rowPopover.find("a.js-addRowAfter").click(function(){
                    ed.execCommand("mceTableInsertRowAfter");
                    that.hidePopover();
                    return false;
                });
                that.$rowPopover.find("a.js-deleteRow").click(function(){
                    ed.execCommand("mceTableDeleteRow");
                    that.hidePopover();
                    return false;
                });
                that.$rowPopover.find("a.js-duplicateRow").click(function(){
                    ed.execCommand("mceTableDuplicateRow");
                    that.hidePopover();
                    return false;
                });




                ////////////////////////////////////////////////////////
                //
                // sprocket icon for adding/deleting rows
                that.$colopts.find("a.settings").mousedown(function(){
                    if(that.rowOpts){
                        that.rowOpts.closeFunc();
                    }
                    if(that.colOpts){
                        that.colOpts.closeFunc();
                    }
                    that.colOpts = {
                        context: that.$colopts.find("a.settings"),
                        position: "below",
                        container: that.rte.getPopOverContainer(),
                        clickOverlay: false,
                        addClass: "j-rte-popover js-rowProperties",
                        returnPopover: true,
                        arrowAdjust: 0,
                        nudge: { left: 30 },
                        destroyOnClose: false,
                        darkPopover: true,
                        onClose:function(){
//                            that.hideCorners();
                            that.colOpts = null;
                        }
                    };
                    that.$colPopover.popover(that.colOpts);
                    return false;
                }).click(function(){
                    return false;
                }).mouseup(function(){
                    return false;
                });
                that.$colPopover.find("a.js-addColBefore").click(function(){
                    ed.execCommand("mceTableInsertColBefore");
                    that.hidePopover();
                    return false;
                });
                that.$colPopover.find("a.js-addColAfter").click(function(){
                    ed.execCommand("mceTableInsertColAfter");
                    that.hidePopover();
                    return false;
                });
                that.$colPopover.find("a.js-deleteCol").click(function(){
                    ed.execCommand("mceTableDeleteCol");
                    that.hidePopover();
                    return false;
                });
                that.$colPopover.find("a.js-duplicateCol").click(function(){
                    ed.execCommand("mceTableDuplicateCol");
                    that.hidePopover();
                    return false;
                });
            }
        },


        init : function(ed){
            var that = this;
            that.ed = ed;
            
            //construct controls
            $j.extend(this, {
                $rowopts: $j("<div class='resizeRowHandle'><div class='propsHandle'><a href='javascript:;' class='settings'></a></div></div>"),
                $colopts: $j("<div class='resizeColHandle'><div class='propsHandle'><a href='javascript:;' class='settings'></a></div></div>"),
                $addrows: $j("<div class='addRowsHandle'>Add <input class='rows spin-button'> Rows <input type='button' class='button' value='Go'></div>"),
                $rowPopover : $j('<div class="j-menu">' +
                        '<ul>' +
                            '<li><a href="javascript:;" class="js-addRowBefore">Add Row Above</a></li>' +
                            '<li><a href="javascript:;" class="js-addRowAfter">Add Row Below</a></li>' +
                            '<li><a href="javascript:;" class="js-deleteRow">Delete Row</a></li>' +
                            '<li><a href="javascript:;" class="js-duplicateRow">Duplicate Row</a></li>' +
                        '</ul>' +
                    '</div>'),
                $colPopover : $j('<div class="j-menu">' +
                    '<ul>' +
                        '<li><a href="javascript:;" class="js-addColBefore">Add Column Left</a></li>' +
                        '<li><a href="javascript:;" class="js-addColAfter">Add Column Right</a></li>' +
                        '<li><a href="javascript:;" class="js-deleteCol">Delete Column</a></li>' +
                        '<li><a href="javascript:;" class="js-duplicateCol">Duplicate Column</a></li>' +
                    '</ul>' +
                '</div>'),
    
                $rowline: $j("<div class='rowLine'></div>"),
                $colline: $j("<div class='colLine'></div>")
            });
            
            var reset = (function(that, ed){
                return function(scrollX, scrollY){
                    if(that.$node){
                        this.minY = scrollY;
                        this.minX = scrollX;
                        that.showCorners(ed, that.$node, that.preserveRatio);
                    }
                }
            })(this, ed);

            ed.onInit.add(this.completeInit, this);

            ed.onScroll.add(reset, this);

            ed.theme.onResize.add(function(){
                that.resetMinMaxY(ed);
                reset(that.minX, that.minY + that.rte.getContentAreaHeight());
            }, this);
        },

        killYourself: function(){
            $j(this.ed.getContainer()).parents("body").unbind(".rte");
        },

        hideCorners: function(){
            this.hidePopover();
            this.$node = null;
            this.$rowopts.detach();
            this.$colopts.detach();
            this.$addrows.detach();
            this.opts = null;
        },


        trimCorners: function (props, $corner){
            if(!this.rte) return;


            var contentAreaH = this.rte.getContentAreaHeight();
            var contentAreaW = this.rte.getContentAreaWidth();
            if(props.top < this.minY - 3){
                // if the top extends above the viewable area of the RTE,
                // then remove the handle
                // allow a bit of buffer
                $corner.detach();
            }else if(props.top > this.minY + contentAreaH){
                // if the top of this handle starts below the viewable area
                // of the RTE, then just remove it
                $corner.detach();
            }else if(props.left < this.minX){
                // if the top extends above the viewable area of the RTE,
                // then remove the handle
                $corner.detach();
            }else if(props.left > this.minX + contentAreaW){
                // if the top of this handle starts below the viewable area
                // of the RTE, then just remove it
                $corner.detach();
            }else{
                // at least some portion of our original blackout is visible, so show it
                $corner.insertBefore(this.$rowline);
            }
            //
            // it's much faster to set the css properties explicitly
            // compared to passing in an object
            $corner.css("top", props.top);
            $corner.css("left", props.left);
            if(props.height) $corner.height(props.height);
            if(props.width) $corner.width(props.width);
            $corner.css("cursor", props.cursor);

        },


        showCorners: function(ed, $node){
            var that = this;

            if(!$node || !$node.length) return;

            that.hidePopover();
            this.resetMinMaxY(ed);

            this.$node = $node;

            var contentAreaH = this.rte.getContentAreaHeight();
            var contentAreaW = this.rte.getContentAreaWidth();

            function resetCorners(){
                var $tr = $node.closest("tr");
                var $table = $node.closest("table");
                var trPosition = $tr.offset();
                var tablePosition = $table.offset();
                var $column = ed.plugins.jiveutil.findColumnFirstCell($node);
                var colPosition = $column.offset();


                //
                // position the rows option
                var props = {
                    top: trPosition.top - 8,
                    left: trPosition.left,
                    height: $tr.outerHeight() - 1 + 16
                };
                if(props.left < that.minX) props.left = that.minX;
                if(props.left > that.minX + contentAreaW) props.left = that.minX + contentAreaW;
                if(props.top < that.minY + 12){
                    props.height += props.top - that.minY - 12;
                    props.top = that.minY + 12;
                }
                if(props.top + props.height > that.minY + contentAreaH){
                    props.height = that.minY + contentAreaH - props.top
                }
                that.trimCorners(props, that.$rowopts);

                //
                // position the column options
                props = {
                    top: colPosition.top,
                    left: colPosition.left,
                    width: $column.outerWidth() - 1
                };
                if(props.left < that.minX && props.left > that.minX - 10) props.left = that.minX;
                if(props.top < that.minY + 12) props.top = that.minY + 12;
                if(props.top > that.minY + contentAreaH) props.top = that.minY + contentAreaH;
                that.trimCorners(props, that.$colopts);

                //
                // position the add rows form
                props = {
                    top: tablePosition.top + $table.outerHeight() - 1,
                    left: tablePosition.left
                };
                that.trimCorners(props, that.$addrows);

                that.$addrows.find("input.rows").val(1);

            }
            resetCorners();
        },

        hidePopover: function(ed, dontFade){
            if(this.colOpts){
                this.colOpts.closeFunc(dontFade);
                this.colOpts = null;
            }
            if(this.rowOpts){
                this.rowOpts.closeFunc(dontFade);
                this.rowOpts = null;
            }
        },

        getInfo : function() {
            return {
                longname : 'Jive Table Controls',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
        }


    });
	// Register plugin
	tinymce.PluginManager.add('jivetablecontrols', tinymce.plugins.JiveTableControlsPlugin);
})();
