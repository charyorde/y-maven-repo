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

    tinymce.create('tinymce.plugins.JiveBlackoutPlugin', {

        rte: null,

        $left: $j("<div class='blackout l'></div>"),
        $right: $j("<div class='blackout r'></div>"),
        $top: $j("<div class='blackout t'></div>"),
        $bottom: $j("<div class='blackout b'></div>"),

        minY : null,
        minX :null,
        nodeL : null,
        nodeR : null,

        ed: null,

        setRTE: function(rte){
            this.rte = rte;
        },

        resetMinMaxY : function(ed){
            var $win = $j(ed.getWin());
            this.minY = $win.scrollTop();
            this.minX = $win.scrollLeft();
        },

        init : function(ed){

            var that = this;
            this.ed = ed;

            ed.onHideBlackout = new tinymce.util.Dispatcher(this);


            function reset(){
                that.resetMinMaxY(ed);
            }
            function reshowIfNeeded(){
                if(that.nodeL || that.nodeR){
                    // something just changed,
                    // reshow the blackout if we
                    // have one
                    that.showBlackout(ed, that.nodeL, that.nodeR);
                }
            }

            ed.onNodeChange.add(reshowIfNeeded);
            ed.onScroll.add(function(){
                reset();
                reshowIfNeeded();
            });
            ed.theme.onResize.add(function(){
                reset();
                reshowIfNeeded();
            });
            $j(window).resize(function(){
                reset();
                reshowIfNeeded();
            });
            $j(window.document.body).click(function(){
                that.hideBlackout();
            });
            ed.onInit.add(reset, this);

            setTimeout(reset, 300);
            setTimeout(reset, 500);
            setTimeout(reset, 800);
        },

        hideBlackout: function(){
            if(this.nodeL || this.nodeR){
                this.nodeL = null;
                this.nodeR = null;
                this.$left.remove();
                this.$right.remove();
                this.$top.remove();
                this.$bottom.remove();
                this.ed.onHideBlackout.dispatch();
            }
        },

        showBlackout: function(ed, nodeL, nodeR){
            var that = this;

            if(!nodeL) return;
            if(!nodeR) nodeR = nodeL;

            this.resetMinMaxY(ed);

            this.nodeL = nodeL;
            this.nodeR = nodeR;

            var $nodeL = $j(nodeL);
            var $nodeR = $j(nodeR);
            var positionL = $nodeL.offset();
            var positionR = $nodeR.offset();

            if(!positionR || !positionL) return;

            var $poc = this.rte.getPopOverContainer();

            // subtract two for the top border
            var contentAreaH = this.rte.getContentAreaHeight();
            var contentAreaW = this.rte.getContentAreaWidth();


            function trimBlackout(props, $blackout){
                // figure out where the bottom of the blackout needs to be
                props.bottom = props.top + props.height;
                props.right = props.left + props.width;
                // if the left extends out of frame,
                // then crop it to the lefthand side of the iframe
                if(props.left < that.minX){
                    props.width -= that.minX - props.left;
                    props.left = that.minX;
                }
                // if the top extends above the viewable area of the RTE,
                // then adjust the top + height to start at the correct position
                if(props.top < that.minY){
                    props.height -= that.minY - props.top;
                    props.top = that.minY;
                }
                // if the bottom extends beyond the viewable area of the RTE
                // then trim the height so that it ends at exactly the right place
                if(props.bottom > that.minY + contentAreaH){
                    props.height -= props.top + props.height - that.minY - contentAreaH;
                }
                // if the blackout is too wide, then crop it off
                if(props.left + props.width > that.minX + contentAreaW){
                    props.width -= props.left + props.width - that.minX - contentAreaW;
                }
                if(props.left >= that.minX + contentAreaW){
                    // if the left of this blackout starts to the right of the viewable area
                    // of the RTE, then just remove it
                    $blackout.remove();
                }else if(props.top >= that.minY + contentAreaH){
                    // if the top of this blackout starts below the viewable area
                    // of the RTE, then just remove it
                    $blackout.remove();
                }else if(props.top >= props.bottom || props.left >= props.right){
                    // if the new top of the blackout is below what we thought the bottom should
                    // be when we began, then that means the entire blackout is above and outside
                    // of the viewable area of the RTE, so remove it
                    $blackout.remove();
                }else{
                    // at least some portion of our original blackout is visible, so show it
                    $poc.append($blackout);
                }
                delete props.bottom;
                delete props.right;
                $blackout.css(props);
                $blackout.click(function(){
                    that.hideBlackout();
                });

            }

            var nodeROuterHeight = $nodeR.outerHeight();
            var nodeROuterWidth = $nodeR.outerWidth();
            var bodyOuterHeight = $j(ed.getBody()).outerHeight();
            var props = {
                top: positionR.top + nodeROuterHeight,
                left: positionL.left,
                width: positionR.left + nodeROuterWidth - positionL.left,
                height: Math.max(contentAreaH, bodyOuterHeight) - positionR.top - nodeROuterHeight
            };
            trimBlackout(props, this.$bottom);

            props = {
                top: 0,
                left: 0,
                width: positionL.left,
                height: Math.max(contentAreaH, bodyOuterHeight)
            };
            trimBlackout(props, this.$left);

            props = {
                top: 0,
                left: positionL.left,
                width: positionR.left + nodeROuterWidth - positionL.left,
                height: positionL.top
            };
            trimBlackout(props, this.$top);

            props = {
                top: 0,
                left: positionR.left + nodeROuterWidth,
                width: Math.max(contentAreaW, $j(ed.getDoc()).width()) - nodeROuterWidth - positionR.left,
                height: Math.max(contentAreaH, bodyOuterHeight)
            };
            trimBlackout(props, this.$right);
        },

        getInfo : function() {
            return {
                longname : 'Jive Blackout',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
        }


    });
	// Register plugin
	tinymce.PluginManager.add('jiveblackout', tinymce.plugins.JiveBlackoutPlugin);
})();
