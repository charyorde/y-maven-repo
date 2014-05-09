(function() {
    
    function linkContextNode(rng){
        var n = rng.startContainer.childNodes[rng.startOffset];
        if(!n){
            n = rng.startContainer;
        }
        while(n && (n.nodeType != 1 || n.nodeName.toLowerCase() != "a" || tinymce.activeEditor.dom.hasClass(n, "unlinked"))){
            n = n.parentNode;
        }
        return n;
    }

    function nonMacroLinkContextNode(rng){
        var n = rng.startContainer.childNodes[rng.startOffset];
        if(!n){
            n = rng.startContainer;
        }
        var dom = tinymce.activeEditor.dom;
        while(n && (n.nodeType != 1 || n.nodeName.toLowerCase() != "a" || dom.hasClass(n, "unlinked") || dom.hasClass(n, "jive_macro"))){
            n = n.parentNode;
        }
        return n;
    }

    tinymce.create('tinymce.plugins.JiveLinkPlugin', {

        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @returns Name/value array containing information about the plugin.
         * @type Array
         */
        getInfo : function() {
            return {
                longname : 'Content Picker',
                author : 'Jive Software',
                authorurl : 'http://www.jivesoftware.com',
                infourl : 'http://www.jivesoftware.com/',
                version : "1.0"
            };
        },

        init : function(ed, url){
            this.ed = ed;
            var that = this;

            ed.onSetContent.add(function() {
                //Set data-orig-content attrs on all links
                tinymce.each(ed.dom.select("a"), function(anchor){
                    that.prepOrigContent(anchor);
                });
            });
            ed.onBeforeGetContent.add(function() {
                tinymce.each(ed.dom.select("a"), function(anchor){
                    ed.dom.removeClass(anchor, "active_link");

                    var macro = ed.plugins.jivemacros.getMacroFor(anchor);
                    if(macro != null && macro.getMacroType() == "INLINE"){
                        var origContent = ed.dom.getAttrib(anchor, "data-orig-content");
                        if(origContent && origContent != anchor.innerHTML){
                            ed.dom.setAttrib(anchor, "_modifiedtitle", "true")
                        }
                    }
                });
                this.lastActive = null;
            }, this);
            ed.onNodeChange.add(this.nodeChanged, this);
            ed.onInit.add(function(){
                that.ready = true;
                that.completeInit();

                if(tinymce.isIE9){
                    ed.execCommand("AutoUrlDetect", false, false);
                }
            });
        },

        prepOrigContent: function(anchor){
            if(this.ed.dom.getAttrib(anchor, "data-orig-content")){
                return;
            }
            var macro = this.ed.plugins.jivemacros.getMacroFor(anchor);
            if(macro != null && macro.getMacroType() == "INLINE"){
                var origContent = anchor.innerHTML;
                this.ed.dom.setAttrib(anchor, "data-orig-content", origContent);
            }
        },

        setRTE: function(rte){
            this.rte = rte;
            this.completeInit();
        },

        completeInit: function(){
            if(this.rte && this.ready && !this.initialized && this.rte.getLinkService()){
                this.initialized = true;
                var ed = this.ed;
                var dom = ed.dom;
                var that = this;

                //add pasteComplete handler
                ed.plugins.paste.onPasteComplete.add(function(){
                    tinymce.each(dom.select("a.loading", ed.getBody()), function(aTag){
                        dom.removeClass(aTag, "loading");
                        that.resolveLink(aTag);
                    });
                });

                if(ed.plugins.jivecontextmenu){
                    var contextMenu = ed.plugins.jivecontextmenu;

                    var unlinkItem = new contextMenu.MenuItem("unlinkItem", linkContextNode, ed.getLang("jivelink.unlink"),  {
                        url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/iconmaster.gif",
                        xOffset: 340,
                        yOffset: 90,
                        width: 28,
                        height: 21
                    }, "jiveLinkUnlink");
                    var bareUrlLinkItem = new contextMenu.MenuItem("bareUrlLinkItem", nonMacroLinkContextNode, ed.getLang("jivelink.bareUrl"),  {
                        url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/iconmaster.gif",
                        xOffset: 368,
                        yOffset: 90,
                        width: 28,
                        height: 21
                    }, "jiveBareUrlLink");
                    var autoResolveLinkItem = new contextMenu.MenuItem("autoResolveLinkItem", nonMacroLinkContextNode, ed.getLang("jivelink.autoResolve"),  {
                        url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/iconmaster.gif",
                        xOffset: 396,
                        yOffset: 90,
                        width: 28,
                        height: 21
                    }, "jiveAutoResolveLink");

                    var linkMenu = new contextMenu.Menu([unlinkItem, bareUrlLinkItem, autoResolveLinkItem], true, false, ed.getLang("jivelink.menu_hdr"));

                    function showLinkMenu(node, rng){
                        linkMenu.show(ed, rng, null, null);
                    }
                    var linkItem = new contextMenu.MenuItem("jiveLinkItem", linkContextNode, null, {
                        url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/iconmaster.gif",
                        xOffset: 30,
                        yOffset: 0,
                        width: 24,
                        height: 22
                    }, showLinkMenu);
                    contextMenu.addRootItem(linkItem);
                }
            }
        },

        resolveLink: function(aTag){
            var ed = this.ed;
            var dom = ed.dom;
            if (dom.hasClass(aTag, "jive_macro_appEmbeddedView")) {
                return;
            }
            var href = dom.getAttrib(aTag, "href");
            href = ed.convertURL(href);
            var linkService = this.rte.getLinkService();
            linkService.resolve(href).addCallback(function(linkData){
                var title, bookmark;
                bookmark = ed.selection.getBookmark();
                if(linkData.macroName){
                    dom.setAttrib(aTag, "href", "javascript:;");
                    dom.setAttrib(aTag, "title", linkData.title);
                    dom.setAttrib(aTag, "___default_attr", linkData.value);
                    dom.setAttrib(aTag, "jivemacro", linkData.macroName);
                    if(linkData.isCustomTitle){
                        dom.setAttrib(aTag, "_modifiedtitle", "true");
                    }
                    aTag.className = "jive_macro jive_macro_" + linkData.macroName;
                    title = linkData.title;
                }else{
                    dom.setAttrib(aTag, "href", linkData.value);
                    dom.setAttrib(aTag, "title", linkData.value);
                    aTag.className = "";
                    title = linkData.title;
                }

                //Limit the title to 120 characters
                if(title.length > 120){
                    title = title.substring(0, 120) + "\u2026"; //ellipsis
                }
                aTag.innerHTML = "";
                aTag.appendChild(ed.getDoc().createTextNode(title));
                ed.nodeChanged();
                ed.selection.moveToBookmark(bookmark);
            }).addErrback(function(err){
                console.log("resolveLink failed", err, aTag)
            });
        },

        /**
		 * Creates control instances based in the incomming name. This method is normally not
		 * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
		 * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
		 * method can be used to create those.
		 *
		 * @param {String} n Name of the control to create.
		 * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
		 * @return {tinymce.ui.Control} New control instance or null if no control was created.
		 */
		createControl: function(cn, cm) {
            switch (cn) {
                case "jivelink":
                    var c = cm.createButton('jivelink', {
                        title : 'jivelink.link_desc',
                        cmd : "mceJiveLink"
                    });
                    return c;
//                    return tinyMCE.getButtonHTML(cn, 'lang_jivespell_desc', '{$pluginurl}/images/jivespell.gif', 'mceJiveSpell', true);
            }

            return "";
		},

        /**
         * Executes a specific command, this function handles plugin commands.
         *
         * @param {string} editor_id TinyMCE editor instance id that issued the command.
         * @param {HTMLElement} element Body or root element for the editor instance.
         * @param {string} command Command name to be executed.
         * @param {string} user_interface True/false if a user interface should be presented.
         * @param {mixed} value Custom value argument, can be anything.
         * @return true/false if the command was executed by this plugin or not.
         */
        execCommand : function(cmd, ui, val){
//        execCommand : function(editor_id, element, command, user_interface, value) {
            var aTag;
            var ed = tinyMCE.activeEditor;
            var dom = ed.dom;
            switch (cmd) {
                case "mceJiveLink":
                    var anySelection = false;
                    var selectedText = ed.selection.getContent();
                    var node = ed.selection.getNode();

                    aTag = dom.getParent(node, "a");
                    if(aTag != null){
                        dom.removeClass(aTag, "active_link");
                        if(ed.plugins.jivemacros.isExactMacro(aTag)){
                            ed.plugins.jivemacros.deleteMacro(ed, aTag);
                        }else{
                            ed.execCommand("unlink");
                        }
                        return true;
                    }else{
                        if (ed.selection.getNode())
                            anySelection = (ed.selection.getNode().nodeName.toLowerCase() == "img") || (selectedText && selectedText.length > 0);

                        ed.windowManager.open(
                            {
                                url: CS_BASE_URL + '/content-picker!input.jspa?name='+escape(selectedText) + "&instantiatedFromGUIEditor=true",
                                width: 700 + ed.getLang('jivelink.delta_width', 0),
                                height: 555 + ed.getLang('jivelink.delta_height', 0),
                                inline : "yes"},
                            {
                                editor_id : ed.id
                        });

                        return true;
                    }
                    break;
                case "jiveLinkUnlink":
                    aTag = linkContextNode(ed.selection.getRng(true));
                    var urlRe = /^https?:\/\/(?:[^:]+:[^@])?[\w\.]+(?::\d+)?\S*$/;
                    if (aTag.childNodes.length == 1 && aTag.firstChild.nodeType == 3 && urlRe.test(aTag.textContent)) {
                        dom.addClass(aTag, "unlinked");
                        dom.setAttrib(aTag, "href", null);
                        return true;
                    }else{
                        dom.remove(aTag, true);
                        return true;
                    }
                    break;
                case "jiveBareUrlLink":
                    aTag = nonMacroLinkContextNode(ed.selection.getRng(true));
                    var href = dom.getAttrib(aTag, "href", null);
                    dom.remove(aTag.childNodes, false);
                    aTag.appendChild(document.createTextNode(href));
                    return true;
                    break;
                case "jiveAutoResolveLink":
                    aTag = nonMacroLinkContextNode(ed.selection.getRng(true));
                    this.resolveLink(aTag);
                    return true;
                    break;
            }

            return false;
        },

        lastActive : null,


        /**
         * Gets called ones the cursor/selection in a TinyMCE instance changes. This is useful to enable/disable
         * button controls depending on where the user are and what they have selected. This method gets executed
         * alot and should be as performance tuned as possible.
         *
         * @param {string} editor_id TinyMCE editor instance id that was changed.
         * @param {HTMLNode} node Current node location, where the cursor is in the DOM tree.
         * @param {int} undo_index The current undo index, if this is -1 custom undo/redo is disabled.
         * @param {int} undo_levels The current undo levels, if this is -1 custom undo/redo is disabled.
         * @param {boolean} visual_aid Is visual aids enabled/disabled ex: dotted lines on tables.
         * @param {boolean} any_selection Is there any selection at all or is there only a cursor.
         */
        nodeChanged : function(ed, cm, node,collapse){
            if (node == null)
                return;
            var atag = ed.dom.getParent(node, "a");
            var linkButton = ed.controlManager.get("jivelink");
            if (atag != null) {
                if(linkButton){
                    linkButton.setActive(true);
                }

                this.prepOrigContent(atag);
            }else{
                if(linkButton){
                    linkButton.setActive(false);
                }

                var that = this;
                tinymce.each(ed.dom.select("a", node.parentNode), function(anchor){
                    that.prepOrigContent(anchor);
                });
            }

            var changedActive = this.lastActive == null || this.lastActive != node;  //this logic isn't actually semantically valid until later, after we've set lastActive for sure.
            if(this.lastActive != null && this.lastActive != node){
                // we changed active nodes
                ed.dom.removeClass(this.lastActive, "active_link");
                this.lastActive = null;
            }
            if(atag && this.lastActive == null){
                this.lastActive = atag;
                ed.dom.addClass(this.lastActive, "active_link");
            }
            var macro = ed.plugins.jivemacros.getMacroFor(node);
            if(macro != null && macro.getMacroType() == "INLINE"){
                if(this.lastActive == null || this.lastActive != node){
                    this.lastActive = ed.plugins.jivemacros.isMacro(node);
                    ed.dom.addClass(this.lastActive, "active_link");
                }
                if(changedActive && this.lastActive.childNodes.length > 0
                        && !ed.dom.getAttrib(this.lastActive, "_modifiedtitle")){
                    ed.selection.select(this.lastActive.childNodes[0]);
                }
            }
        }
    });

    // Register plugin
	tinymce.PluginManager.add('jivelink', tinymce.plugins.JiveLinkPlugin);
})();
