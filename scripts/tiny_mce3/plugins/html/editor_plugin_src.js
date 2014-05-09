/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

(function() {
	tinymce.create('tinymce.plugins.HTML', {

        thunks : new Array(),

        registerToggleFunction : function(thunk){
            this.thunks.push(thunk);
        },

        toggleHTML : function(ed){
            var thunks = ed.plugins.html.thunks;
            for(var i=0;i<thunks.length;i++){
                thunks[i](ed.id);
            }
        },

        prepForTab : false,
        prepForDel :false,
        prepForLargeDel : false,

        init : function(ed, url) {
			var t = this;

            /**
             * JIVE-3806 and CS-24272
             * This function is only called for Gecko browsers,
             * so we can use Gecko specific keyboard event info
             * @param evt the keyboard event object
             */
            function shouldDeleteContentForKeyboardEvent(evt){
                if(evt.ctrlKey || evt.metaKey){
                    return false;
                }
                if(evt.keyCode >= 65 && evt.keyCode <= 90){
                    // a-z
                    return true;
                }
                if(evt.keyCode >= 48 && evt.keyCode <= 57 || evt.keyCode >= 96 && evt.keyCode <= 111){
                    // 0-9, numpad 0-9, and math function keys
                    return true;
                }
                if(evt.keyCode == 13 || evt.keyCode == 8 || evt.keyCode == 46){
                    // enter, backspace, delete
                    return true;
                }
                return false;
            }

			t.editor = ed;
            // Register commands
			ed.addCommand('mceToggleHTML', function(ed, t){
                    return function(){ t.toggleHTML(ed) };
                }(ed, t));
            ed.onBeforeSetContent.add(function(ed, o) {
                o.content = o.content.replace(/  /g, '&nbsp; ');
            });
            ed.onGetContent.add(function(ed, o) {
                o.content = o.content.replace(/&nbsp;/g, ' ');
            });
            ed.onKeyDown.add(function(ed, evt){
                this.prepForTab = false;
                this.prepForDel = false;
                this.prepForLargeDel = false;
                if(evt.keyCode == 9 && !evt.ctrlKey && !evt.altKey && !ed.dom.getParent(ed.selection.getNode(), "table") && !ed.dom.getParent(ed.selection.getNode(), "ul,ol")){
                    tinymce.dom.Event.cancel(evt);
                    this.prepForTab = true;
                }
                if(tinymce.isGecko && !ed.selection.isCollapsed()){

                    // only prep for a large del if it's a visible charater
                    // or the delete key or enter w/o meta keys like shift/ctrl
                    if(shouldDeleteContentForKeyboardEvent(evt)){
                        // check to see if i'm in an empty node
                        this.prepForLargeDel = true;
                        this.keyCode = evt.keyCode;
                        return false;
                    }
                }
            }, this);
            ed.onKeyPress.add(function(ed, evt){
                if(this.prepForDel){
                    tinymce.dom.Event.cancel(evt);
                }
                if(this.prepForLargeDel){
                    var isJustDelete = this.keyCode == 8 || this.keyCode == 46;
                    var rng = ed.selection.getRng(true);
                    //check to see if we've selected a cell, and select its contents instead.
                    rng = ed.selectionUtil.getShrunkenBlockRange(rng, "tr, td, th");

                    var startContainer = rng.startContainer;
                    var endContainer = rng.endContainer;
                    rng.deleteContents();
                    //remove empty endpoint containers.
                    function removeEmptyNodeTree(n){
                        var parent = n.parentNode;
                        if(!parent){
                            return;
                        }
                        var isEmpty = true;
                        if(n.hasChildNodes()){
                            for(var i = 0; i < n.childNodes.length; ++i){
                                var c = n.childNodes[i];
                                if(c.nodeType == 1 ||
                                        (c.nodeType == 3 && c.nodeValue.length > 0)){
                                    isEmpty = false;
                                    break;
                                }
                            }
                        }else if(n.nodeType == 3 && n.nodeValue.length > 0){
                            isEmpty = false;
                        }else if(ed.dom.is(n, "body, td, th") || (!isJustDelete && ed.dom.is(n, "a"))){
                            isEmpty = false;
                        }
                        if(isEmpty){
                            parent.removeChild(n);
                            removeEmptyNodeTree(parent);
                        }
                    }
                    removeEmptyNodeTree(startContainer);
                    removeEmptyNodeTree(endContainer);
                    if(ed.selectionUtil.isEffectivelyEmpty(ed.getBody())){
                        //body is empty; add the empty body content, and put the cursor in the right spot.
                        ed.setContent("<p><br /></p>");
                        rng = ed.dom.createRng();
                        rng.setStart(ed.getBody().firstChild, 0);
                        rng.collapse(true);
                        ed.selection.setRng(rng);
                    }

                    //ensure that our LI has a BR at its end, since backspace misbehaves without it.
                    var list = ed.dom.getParent(ed.selection.getNode(), "ol,ul");
                    if(list){
                        rng = ed.selection.getRng(true);
                        var containerName = rng.startContainer.nodeName.toLowerCase();
                        if(containerName != "li" && containerName != "#text"){
                            if(ed.selectionUtil.atEndOf(list, ed.selectionUtil.startPos(rng))){
                                //stick cursor in last list item
                                rng.setStart(list.lastChild, list.childNodes.length);
                            }else{
                                //stick the cursor in the next list item
                                rng.setStart(list.childNodes[rng.startOffset], 0);
                            }
                        }
                        rng.collapse(true);

                        var li = ed.dom.getParent(ed.selection.getNode(), "li");
                        if(li){
                            if(!li.lastChild || li.lastChild.nodeName.toLowerCase() != "br"){
                                li.appendChild(ed.dom.create("br"));
                            }
                        }
                    }

                    if(isJustDelete){
                        tinymce.dom.Event.cancel(evt);
                    }
                }else if(evt.keyCode == 9 && !evt.ctrlKey && !evt.altKey && !ed.dom.getParent(ed.selection.getNode(), "table") && !ed.dom.getParent(ed.selection.getNode(), "ul,ol")){
                    tinymce.dom.Event.cancel(evt);
                }
            }, this);
            ed.onKeyUp.add(function(ed, evt){
                if(this.prepForDel){
                    tinymce.dom.Event.cancel(evt);
                    var n = ed.selection.getStart();
                    var newN = n.previousSibling;
                    if(newN){
                        n.parentNode.removeChild(n);
                        while(newN.nodeName.toLowerCase() == "ol" || newN.nodeName.toLowerCase() == "ul"){
                            newN = newN.childNodes[newN.childNodes.length-1];
                        }
                        if(newN.childNodes.length > 0){
                            ed.selection.select(newN.childNodes[newN.childNodes.length-1]);
                            ed.selection.collapse();
                        }else{
                            ed.selection.select(newN);
                            ed.selection.collapse();
                        }
                    }
                }else if(this.prepForLargeDel){
                    if(this.keyCode == 8 || this.keyCode == 46) tinymce.dom.Event.cancel(evt);
                }
                if(evt.keyCode == 9 && !evt.ctrlKey && !evt.altKey && this.prepForTab && !ed.dom.getParent(ed.selection.getNode(), "table") && !ed.dom.getParent(ed.selection.getNode(), "ul,ol")){
                    tinymce.dom.Event.cancel(evt);
                    ed.selection.setContent("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
                }
            }, this);


            // Register buttons
			ed.addButton('html', {title : 'html.desc', cmd : 'mceToggleHTML'});

            // Make sure we can get keyboard focus into the toolbar
            ed.addShortcut("alt+q", ed.getLang("advanced.toolbar_focus"), function(){
                var focusHandle = ed.dom.select(".js-toolbarFocus", ed.getContainer());
                if(focusHandle && focusHandle.length){
                    focusHandle[0].onclick();
                }
            });
		},

		getInfo : function() {
			return {
				longname : 'HTML mode',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/fullpage',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}

    });

	// Register plugin
	tinymce.PluginManager.add('html', tinymce.plugins.HTML);
})();
