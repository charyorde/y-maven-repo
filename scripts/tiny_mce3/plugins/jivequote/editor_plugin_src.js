(function() {

    tinymce.create('tinymce.plugins.JiveQuotePlugin', {

        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @returns Name/value array containing information about the plugin.
         * @type Array
         */
        getInfo : function() {
            return {
                longname : 'Jive Quote Button',
                author : 'Jive Software',
                authorurl : 'http://www.jivesoftware.com',
                infourl : 'http://www.jivesoftware.com/',
                version : "1.0"
            };
        },


        /**
         * Creates control instances based in the incomming name. This method is normally not
         * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
         * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
         * method can be used to create those.
         *
         * @param {String} cn Name of the control to create.
         * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
         */
        createControl: function(cn, cm) {
            switch (cn) {
                case "jivequote":
                    var c = cm.createButton('jivequote', {
                        title : 'jivequote.link_desc',
                        cmd : "mceJiveQuote"
                    });
                    return c;
//                    return tinyMCE.getButtonHTML(cn, 'lang_jivespell_desc', '{$pluginurl}/images/jivespell.gif', 'mceJiveSpell', true);
            }

            return "";
        },

        /**
         * Executes a specific command, this function handles plugin commands.
         *
         * @param {string} cmd Command name to be executed.
         * @param {string} ui True/false if a user interface should be presented.
         * @param {mixed} val Custom value argument, can be anything.
         * @return true/false if the command was executed by this plugin or not.
         */
        execCommand : function(cmd, ui, val){
            switch (cmd) {
                case "mceJiveQuote":
                    var ed = tinyMCE.activeEditor;
                    var sel = ed.selection;
                    var pre = null;
                    var collapsed = sel.isCollapsed();
                    ed.undoManager.add();

                    // insert a quote macro
                    var macro = ed.plugins.jiveutil.findMacro("quote");
                    pre = ed.plugins.jivemacros.insertMacro(ed, macro);

                    if(pre && collapsed){
                        while(pre.childNodes.length > 0) pre.removeChild(pre.childNodes[0]);
                        if($def(window._jive_gui_quote_text)){
                            var div = ed.getDoc().createElement('DIV');
                            div.innerHTML = _jive_gui_quote_text;
                            if(div.childNodes.length > 0){
                                for(i=0;i<div.childNodes.length;i++){
                                    if(div.childNodes[i].nodeType == 1){
                                        var temp = div.childNodes[i];
                                        var block = temp.childNodes[0];
                                        // block is the block quote.
                                        while(block.childNodes.length > 0){
                                            if(block.childNodes[0].className == "jive-quote-header"){
                                                // it's the header
                                                var head = ed.getDoc().createElement('P');
                                                head.appendChild(block.childNodes[0].childNodes[0]); // the title w/o the span
                                                pre.appendChild(head);
                                                pre.appendChild(ed.plugins.jivemacros.createEmptyPara());
                                                block.removeChild(block.childNodes[0]); // the header span
                                                block.removeChild(block.childNodes[0]); // br
                                                block.removeChild(block.childNodes[0]); // br
                                            }else{
                                                function stripImageLink(n) {
                                                    // Possibly add a class to identify rendered image anchors from linked images.
                                                    if(n.nodeName.toLowerCase() == 'a' && n.firstChild && n.firstChild.nodeName.toLowerCase() == 'img') {
                                                        n.parentNode.insertBefore(n.firstChild, n);
                                                        n.parentNode.removeChild(n);
                                                    }
                                                    else {
                                                        for(var i=0;i< n.childNodes.length;i++) {
                                                            stripImageLink(n.childNodes[i]);
                                                        }
                                                    }
                                                }

                                                // remove <a> from rendered <img>
                                                stripImageLink(block.childNodes[0]);
                                                // add nodes to quote thing
                                                pre.appendChild(block.childNodes[0]);
                                            }
                                        }
                                    }
                                }
                            }
                            if(pre.childNodes.length == 0){
                                pre.appendChild(ed.plugins.jivemacros.createEmptyPara());
                            }
                        }else{
                            pre.appendChild(ed.plugins.jivemacros.createEmptyPara());
                        }
                    }else{
                        // console.log("fail");
                    }
                    ed.selection.select(pre.nextSibling ? pre.nextSibling : pre);
                    ed.selection.collapse(true);
                    ed.selectionUtil.normalizeSelection();
                    setTimeout(function(){
                        var ele = pre.nextSibling ? pre.nextSibling : pre;
                        if(ele.nodeType != 1) ele = ele.parentNode;
                        ele.scrollIntoView();
                    },10);
                    ed.undoManager.add();
                    return true;
            }

            return false;
        }

    });
	// Register plugin
	tinymce.PluginManager.add('jivequote', tinymce.plugins.JiveQuotePlugin);
})();
