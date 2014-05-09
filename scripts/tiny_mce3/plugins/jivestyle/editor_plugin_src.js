(function() {

    tinymce.create('tinymce.plugins.JiveStylePlugin', {

        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @returns Name/value array containing information about the plugin.
         * @type Array
         */
        getInfo : function() {
            return {
                longname : 'Image Picker',
                author : 'Jive Software',
                authorurl : 'http://www.jivesoftware.com',
                infourl : 'http://www.jivesoftware.com/',
                version : "1.0"
            };
        },

        /**
         * Gets executed when a TinyMCE editor instance is initialized.
         *
         * @param {TinyMCE_Control} Initialized TinyMCE editor control instance.
         */
        init : function(ed, url) {
            ed.onInit.add(function(ed) {
                var a = document.getElementById(ed.id + '_jivestyle_action');
                if (a) {
                    var span = a.childNodes[0];
                    while (span.childNodes.length > 0) span.removeChild(span.childNodes[0]);
                    span.appendChild(document.createTextNode(ed.getLang("jivestyle.title")))
                }
                ed.plugins.jivebuttons.initToolbar(ed.id);
                setTimeout(function(ed, edid) {
                    return function() {
                        ed.plugins.jivebuttons.initToolbar(edid);
                    }
                }(ed, ed.id), 300)
            });
            // Add a node change handler, selects the button in the UI when a image is selected
            ed.onNodeChange.add(function(that) {
                return function(ed, cm, n) {
                    var p = ed.dom.getParent(n, ed.dom.isBlock);
                    if (p) {
                        if (that.buttons.length > 0) {
                            // we're updating an aleady rendered menu
                            var sel = ed.selection;
                            for (var i = 0; i < that.buttons.length; i++) {
                                var doc = window.document;
                                var dom = new tinymce.dom.DOMUtils(doc);
                                var selectMe = $def(p.tagName) && p.tagName.toLowerCase() == that.tagNames[i];
                                var row = doc.getElementById(that.buttons[i].id);
                                var cell = row.cells[0];
                                if (selectMe && (sel.isCollapsed() || sel.getStart() == sel.getEnd())) {
                                    dom.addClass(cell, "mceMenuItemSelected");
                                }
                                else
                                {
                                    dom.removeClass(cell, "mceMenuItemSelected");
                                }
                            }
                        }
                    }
                }
            }(this));

            this.buttons = new Array();
            this.tagNames = ["p","h1","h2","h3","h4","h5","h6"];
        },

        execCommand : function(cmd, ui, val){
            if(cmd == 'mceJiveStyle'){
                var cm = tinyMCE.activeEditor.controlManager;
                var button = cm.get('jivestyle');
                button.showMenu();
                return true;
            }
            return false;
        },

        isTag : function(tag){
            var ed = tinyMCE.activeEditor;
            var sel = ed.selection;
            if(sel.isCollapsed()){
                var n = sel.getNode();
                var par = ed.dom.getParent(n,tag);
                var selectMe = $def(par) && par != null && $def(par.tagName) && par.tagName.toLowerCase() == tag;
                // it's being rendered for the first time
                if(selectMe){
                    return "mceMenuItemSelected";
                }else{
                    return "";
                }
            }else{
                return "";
            }
        },

        addButton : function(c){
            this.buttons.push(c);
        },

        /**
         * Creates control instances based in the incomming name. This method is normally not
         * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
         * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
         * method can be used to create those.
         *
         * @param {String} cn Name of the control to create.
         * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
         * @return {tinymce.ui.Control} New control instance or null if no control was created.
         */
        createControl: function(cn, cm) {
            switch(cn){
                case 'jivestyle':
                    var c = cm.createSplitButton('jivestyle', {
                        title : 'jivestyle.title',
                        cmd : "mceJiveStyle"
                    });
                    c.onRenderMenu.add(function(c, m) {
                        var ed = tinyMCE.activeEditor;
                        var plugin = ed.plugins.jivestyle;
                        plugin.addButton(m.add({
                            title : "jivestyle.paragraph",
                            cmd : 'FormatBlock',
                            ui: false,
                            value: "p",
                            'class' : 'mce_formatPreview mce_p ' + plugin.isTag("p")
                        }));
                        for(var i = 1; ed.settings.max_header_count >= i && i <= 6; ++i){
                            plugin.addButton(m.add({
                                title : ed.getLang("jivestyle.header") + " " + i,
                                cmd : 'FormatBlock',
                                ui: false,
                                value: 'h' + i,
                                'class' : 'mce_formatPreview mce_h' + i + ' ' + plugin.isTag("h" + i)
                            }));
                        }
                    });
                    // Return the new menubutton instance
                    return c;
            }
            return null;
        }
    });
	// Register plugin
	tinymce.PluginManager.add('jivestyle', tinymce.plugins.JiveStylePlugin);
})();
