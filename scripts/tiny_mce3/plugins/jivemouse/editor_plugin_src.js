/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 *
 * This plugin adds/removes a transparent div over the iframe of the RTE so that all mouse
 * events are caught by the parent document instead of the iframe's document
 */

// Plugin static class
(function() {

    tinymce.create('tinymce.plugins.JiveMousePlugin', {

        rte: null,

        $mouseCatch: $j("<div></div>"),

        setRTE: function(rte){
            this.rte = rte;
        },

        init : function(ed){
            var that = this;
            that.ed = ed;
            this.reset = (function(that, ed){
                return function(scrollX, scrollY){
                    //
                    // we just scrolled the RTE,
                    // or otherwise changed state somehow
                    // make sure the blackout is properly
                    // shown/hidden
                    if(that.$mouseCatch.parent().length){
                        that.$mouseCatch.css("top", ed.plugins.jivescroll.lastScrollY);
                        that.$mouseCatch.css("left", ed.plugins.jivescroll.lastScrollX );
                        that.$mouseCatch.css("width", that.rte.getContentAreaWidth());
                        that.$mouseCatch.css("height", that.rte.getContentAreaHeight());
                    }
                }
            })(this, ed);

            ed.onInit.add(function(ed){
                that.$mouseCatch.css("position","absolute");
            }, this);

            ed.onScroll.add(this.reset, this);

            ed.theme.onResize.add(function(){
                that.reset(ed.plugins.jivescroll.lastScrollX, ed.plugins.jivescroll.lastScrollY);
            }, this);
            $j(window).resize(function(){
                that.reset(ed.plugins.jivescroll.lastScrollX, ed.plugins.jivescroll.lastScrollY);
            });
        },

        hideMouseCatch: function(){
            this.$mouseCatch.remove();
        },

        showMouseCatch: function(){
            var $poc = this.rte.getPopOverContainer();
            $poc.append(this.$mouseCatch);
            this.reset(this.ed.plugins.jivescroll.lastScrollX, this.ed.plugins.jivescroll.lastScrollY);
        },

        getInfo : function() {
            return {
                longname : 'Jive Mouse',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
        }


    });
	// Register plugin
	tinymce.PluginManager.add('jivemouse', tinymce.plugins.JiveMousePlugin);
})();
