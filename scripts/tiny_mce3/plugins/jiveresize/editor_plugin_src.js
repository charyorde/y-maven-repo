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

    tinymce.create('tinymce.plugins.JiveResizePlugin', {

        rte: null,

        $tl: $j("<div class='handle tl'></div>"),
        $tr: $j("<div class='handle tr'></div>"),
        $bl: $j("<div class='handle bl'></div>"),
        $br: $j("<div class='handle br'></div>"),

        minY : 0,
        minX : 0,
        $node : null,

        preserveRatio : false,

        dragging : false,


        resetMinMaxY : function(ed){
            this.minY = ed.plugins.jivescroll.lastScrollY;
            this.minX = ed.plugins.jivescroll.lastScrollX;
        },

        setRTE : function(rte){
            this.rte = rte;
            this.completeInit();
        },

        selectNode : function($currNode){
            if(tinymce.isWebKit){
                return $j($currNode.closest("img, table").andSelf().toArray().reverse()).filter("img, table");
            }else{ // if tinymce.isIE
                var ret = $currNode.closest("table");
                if(ret.length && ret.get(0) == $currNode.get(0)){
                    return $j([]);
                }
                return ret;
            }
        },

        completeInit : function(){
            if(this.ed && this.rte && !this.initialized){
                this.initialized = true;
                var ed = this.ed;
                var rte = this.rte;
                var that =  this;
                if(tinymce.isWebKit || tinymce.isIE){
                    ed.onNodeChange.add(function(ed){

                        var $node = that.selectNode($j(ed.selection.getNode()));

                        if($node.is("img, table")){
                            this.showCorners(ed, $node, $node.is("img"));
                        }else{
                            this.hideCorners();
                        }
                    }, this);
                    ed.onMouseDown.add(function(ed){
                        that.hideCorners();
                    },this);
                    ed.onClick.add(function(ed){
                        var $node = that.selectNode($j(ed.selection.getNode()));

                        if($node.is("img, table")){
                            this.showCorners(ed, $node, $node.is("img"));
                        }else{
                            this.hideCorners();
                        }
                    }, this);
                    that.resetMinMaxY(ed);
                    that.setupHandlers(ed);
                }
            }
        },

        init : function(ed){
            this.ed = ed;
            ed.onResizingNode = new tinymce.util.Dispatcher(this);
            ed.onResizedNode  = new tinymce.util.Dispatcher(this);

            if(tinymce.isWebKit || tinymce.isIE){

                var that = this;
                var reset = (function(that, ed){
                    return function(scrollX, scrollY){
                        that.minY = scrollY;
                        that.minX = scrollX;
                        if(that.$node){
                            //
                            // we just scrolled the RTE,
                            // or otherwise changed state somehow
                            // make sure the corners are properly
                            // shown/hidden
                            if(!that.dragging){
                                that.showCorners(ed, that.$node, that.preserveRatio);
                            }
                        }
                    }
                })(this, ed);

                ed.onInit.add(this.completeInit, this);

                ed.onScroll.add(reset, this);

                ed.theme.onResize.add(function(){
                    that.resetMinMaxY(ed);
                     that.showCorners(ed, that.$node, that.preserveRatio);
                }, this);
                $j(window).resize(function(){
                    that.resetMinMaxY(ed);
                     that.showCorners(ed, that.$node, that.preserveRatio);
                });
            }

        },

        hideCorners: function(){
            this.$node = null;
            this.$tl.remove();
            this.$tr.remove();
            this.$br.remove();
            this.$bl.remove();
        },

        showCorners: function(ed, $node, preserveRatio){
            var that = this;

            if(!$node || !$node.length) return;
            if($node.hasClass("jive_emote")) return;

            this.resetMinMaxY(ed);

            this.$node = $node;
            this.preserveRatio = preserveRatio;


            this.showCornersHelper();
            
            function dragClick(){
                that.dragging = $j(this);
                ed.plugins.jivemouse.showMouseCatch();
            }
            this.$br.mousedown(dragClick);
            this.$bl.mousedown(dragClick);
            this.$tr.mousedown(dragClick);
            this.$tl.mousedown(dragClick);
        },

        setupHandlers: function(ed){
            var that = this;

            this.resetMinMaxY(ed);

            var $poc = this.rte.getPopOverContainer();

            // subtract two for the top border
            var contentAreaH = this.rte.getContentAreaHeight();
            var contentAreaW = this.rte.getContentAreaWidth();

            function trimCorners(props, $corner){
                if(props.top < ed.plugins.jivescroll.lastScrollY - 3){
                    // if the top extends above the viewable area of the RTE,
                    // then remove the handle
                    // allow a bit of buffer
                    $corner.remove();
                }else if(props.top > ed.plugins.jivescroll.lastScrollY + contentAreaH){
                    // if the top of this handle starts below the viewable area
                    // of the RTE, then just remove it
                    $corner.remove();
                }else if(props.left < ed.plugins.jivescroll.lastScrollX){
                    // if the top extends above the viewable area of the RTE,
                    // then remove the handle
                    $corner.remove();
                }else if(props.left > ed.plugins.jivescroll.lastScrollX + contentAreaW){
                    // if the top of this handle starts below the viewable area
                    // of the RTE, then just remove it
                    $corner.remove();
                }else{
                    // at least some portion of our original blackout is visible, so show it
                    $poc.append($corner);
                }
                //
                // it's much faster to set the css properties explicitly
                // compared to passing in an object
                $corner.css("top", props.top);
                $corner.css("left", props.left);
                $corner.css("cursor", props.cursor);

            }

            // adjust position by half the width/height of the handles
            // i'd like to get these values programatically, but the <div>
            // has to be added to the dom + rendered before we know it's css
            // width/height, so instead i'll hardcode it :(
            var lOffset = -3;
            var tOffset = -3;

            function resetCorners(){
                var position = that.$node.offset();

                props = {
                    top: position.top + that.$node.outerHeight() + tOffset,
                    left: position.left + that.$node.outerWidth() + lOffset,
                    cursor: "se-resize"
                };
                trimCorners(props, that.$br);

                var props = {
                    top: position.top + that.$node.outerHeight() + tOffset,
                    left: position.left + lOffset,
                    cursor: "sw-resize"
                };
                trimCorners(props, that.$bl);

                props = {
                    top: position.top + tOffset,
                    left: position.left + lOffset,
                    cursor: "nw-resize"
                };
                trimCorners(props, that.$tl);

                props = {
                    top: position.top + tOffset,
                    left: position.left + that.$node.outerWidth() + lOffset,
                    cursor: "ne-resize"
                };
                trimCorners(props, that.$tr);
            }

            that.showCornersHelper = function(){
                contentAreaH = that.rte.getContentAreaHeight();
                contentAreaW = that.rte.getContentAreaWidth();
                resetCorners();
            };

            var originalX = 0;
            var originalY = 0;
            var originalW = 0;
            var originalH = 0;

            that.dragging = false;

            $j(ed.getContainer()).find(".mceIframeContainer").mousedown(function(e){
                if(that.dragging && that.$node){
                    originalX = e.pageX;
                    originalY = e.pageY;
                    originalW = that.$node.width();
                    originalH = that.$node.height();
                    ed.onResizingNode.dispatch(that.$node, originalW, originalH);
                    return false;
                }
            });
            $j(ed.getContainer()).parents("body").mousemove(function(e){
                if(that.dragging && that.$node){
                    var deltaW = (e.pageX - originalX);
                    var deltaH = (e.pageY - originalY);

                    if(that.dragging.get(0) == that.$br.get(0)){
                        if(deltaW < deltaH){
                            that.$node.width(originalW + deltaW);
                            that.$node.height(originalH + (that.preserveRatio ? (originalH / originalW * deltaW) : deltaH))
                        }else{
                            that.$node.height(originalH + deltaH);
                            that.$node.width(originalW + (that.preserveRatio ? (originalW / originalH * deltaH) : deltaW))
                        }
                    }else if(that.dragging.get(0) == that.$tr.get(0)){
                        that.$node.width(originalW + deltaW);
                        that.$node.height(originalH + (that.preserveRatio ? (originalH / originalW * deltaW) : -deltaH))
                    }else if(that.dragging.get(0) == that.$tl.get(0)){
                        that.$node.width(originalW - deltaW);
                        that.$node.height(originalH - (that.preserveRatio ? (originalH / originalW * deltaW) : deltaH))
                    }else if(that.dragging.get(0) == that.$bl.get(0)){
                        if(Math.abs(deltaW) < Math.abs(deltaH)){
                            if(deltaW < 0){
                                that.$node.width(originalW - deltaW);
                                that.$node.height(originalH - (that.preserveRatio ? (originalH / originalW * deltaW) : deltaH))
                            }else{
                                that.$node.width(originalW + deltaW);
                                that.$node.height(originalH + (that.preserveRatio ? (originalH / originalW * deltaW) : deltaH))
                            }
                        }else{
                            that.$node.height(originalH + deltaH);
                            that.$node.width(originalW + (that.preserveRatio ? (originalW / originalH * deltaH) : deltaW))
                        }
                    }

                    that.$node.removeAttr("data-mce-style");
                    that.$node.attr("width", that.$node.width());
                    that.$node.attr("height", that.$node.height());
                    ed.onResizingNode.dispatch(that.$node, that.$node.width(), that.$node.height());

                    resetCorners();
                    return false;
                }
            });
            $j(ed.getContainer()).parents("body").mouseup(function(){
                if(that.dragging){
                    that.dragging = false;
                    ed.plugins.jivemouse.hideMouseCatch();
                    if(that.$node) ed.onResizedNode.dispatch(that.$node, that.$node.width(), that.$node.height());
                    ed.nodeChanged();
                }
            });
        },

        getInfo : function() {
            return {
                longname : 'Jive Resize',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
        }


    });
	// Register plugin
	tinymce.PluginManager.add('jiveresize', tinymce.plugins.JiveResizePlugin);
})();
