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

    tinymce.create('tinymce.plugins.JiveScrollPlugin', {

        lastScrollY: -99,
        lastScrollX: -99,
        body: null,
        win: null,

        init : function(ed){

            ed.onScroll = new tinymce.util.Dispatcher(this);

            var that = this;

            ed.onInit.add(function() {
                //Interval, in case the browser doesn't do scroll events
                this.intervalId = setInterval(function(){ that.resetScroll(ed); }, 300);

                //scroll event handler.
                ed.dom.bind(ed.getWin(), "scroll", function(){
                    if(!that.timeoutId){
                        that.timeoutId = setTimeout(function(){
                            that.timeoutId = null;
                            that.resetScroll(ed);
                        }, 0);
                    }
                    if(that.intervalId){
                        clearInterval(that.intervalId);
                        that.intervalId = null;
                    }
                });
                setTimeout(function(){
                    that.resetScroll(ed);
                }, 0);
            },this);
            ed.theme.onResize.add(function(){
                that.resetScroll(ed);
            }, this);
        },

        resetScroll : function(ed){
            try{
                if (this.intervalId && (ed.destroyed || !ed.getWin())) {
                    clearInterval(this.intervalId);
                    return;
                }
                if(!this.body){
                    this.body = $j(ed.getBody()).parents("html").andSelf();
                    this.win = $j(ed.getWin());
                }
                var y = this.body.scrollTop();
                if(!y) y = this.win.scrollTop();
                var x = this.body.scrollLeft();
                if(!x) x = this.win.scrollLeft();
                if(this.lastScrollY != y || this.lastScrollX != x){
                    this.lastScrollY = y;
                    this.lastScrollX = x;
                    ed.onScroll.dispatch(x, y);
                }
            }catch(e){
                console.log("error in jivescroll.resetScroll");
                console.log(e);
            }
        },

        getInfo : function() {
            return {
                longname : 'Jive Scroll',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
        }


    });
	// Register plugin
	tinymce.PluginManager.add('jivescroll', tinymce.plugins.JiveScrollPlugin);
})();
