/*jslint browser:true */
/*extern setTimeout tinymce tinyMCE jive $j */

(function() {

    tinymce.create('tinymce.plugins.JiveButtonsPlugin', {

        execCommand : function(cmd, ui, val){
            if(cmd == "mceNull"){
                return true;
            }
            return false;
        },

        initToolbar : function(edid){
            var ed, i, cell;
            if(!edid ||typeof(edid) != "string"){
                var eds = window.editor.toArray();
                for(i=0;i<eds.length;i++){
                    if(eds[i] && eds[i].getID) { this.initToolbar(eds[i].getID()); }
                }
                return;
            }else{
                ed = tinyMCE.get(edid);
            }
            var button1 = document.getElementById(edid + "_magicspacer0");
            var button2 = document.getElementById(edid + "_magicspacer1");
            var toolbar = document.getElementById(edid + "_toolbar1");
            if(button1){
                var cells = toolbar.rows[0].cells;
                var width1 = 0;
                for(i=1;i<3;i++){
                    cell = cells[i];
                    width1 += jive.ext.x.xWidth(cell);
                }
                width1 += 26; // the static width of cells 0, 3 and 4

                toolbar = document.getElementById(edid + "_toolbar2");
                cells = toolbar.rows[0].cells;
                var width2 = 0;
                for(i=6;i<7;i++){
                    cell = cells[i];
                    width2 += jive.ext.x.xWidth(cell);
                }
                width2 += 133; // the static width of cells 0 - 5

                // the 2nd row of buttons has 3 more buttons than the 1st row
                // before the magicspacer. each extra button + 2px padding = 6px
                width2 += 6;

                var width = width1 - width2;

                if(width < -100) {
                    // In this case the editor is in HTML mode.
                    return;
                } else if(width < -30){
                    // the toolbar has not correctly initialized
                    // if this is the case
                    var that = this;
                    setTimeout(function() {
                        that.initToolbar(edid);
                    }, 33);
                    return;
                }else if(width < 0){
                    jive.ext.x.xDisplayNone(button2);
                    jive.ext.x.xDisplayBlock(button1);
                    jive.ext.x.xWidth(button1, (width * -1) - 1);
                }else{
                    jive.ext.x.xDisplayNone(button1);
                    jive.ext.x.xDisplayBlock(button2);
                    if(width <= 0){
                        jive.ext.x.xDisplayNone(button2);
                    }else{
                        jive.ext.x.xWidth(button2, width - 5);
                    }
                }
            }

            var spellTable = document.getElementById(edid + "_spellchecker");
            if(spellTable !== null){
                cell = ed.dom.getParent(spellTable, function(x){ return x != spellTable; });
                cell.style.width = "100%";
            }

            // Hack to get both rows of buttons to line up correctly in IE.
            if (tinymce.isIE) {
                if (document.documentMode && document.documentMode > 7) {
                    // do nothing if running as IE8 or higher rendering mode

                } else {
                    $j('#wysiwygtext_magicspacer1').closest('td').css('padding', 0);
                }
            }
        },

        init : function(ed, url){
            this.url = url;
            var t = this;
            this.index = 0;
            this.mindex = 0;
            ed.onInit.add(function(ed){
                var toolbar = $j('[id="'+ ed.id +'_toolbar1"]', ed.getContainer()).get(0);
                var contain = toolbar.parentNode;
                if(tinymce.isIE){
                    contain.style.height = this.settings.default_height + "px";
                }else{
                    contain.style.height = (this.settings.default_height - 1) + "px";
                }
                contain.style.bottom = "0px";

            });

        },

        getInfo : function() {
            return {
                longname : 'Jive Buttons',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
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
        createControl: function(n, cm) {
            var c;
            if(n == "spacerbutton"){
                c = cm.createButton("spacerbutton" + this.index, { "class" : "jive_spacer_button jive_spacer_button" + this.index, cmd : "mceNull"});
                this.index++;
                return c;
            }
            if(n == "magicspacer"){
                c = cm.createButton("magicspacer" + this.mindex, { "class" : "jive_spacer_button jive_magicspacer_button", cmd : "mceNull"});
                this.mindex++;
                return c;
            }

            return null;
        }


    });
    // Register plugin
    tinymce.PluginManager.add('jivebuttons', tinymce.plugins.JiveButtonsPlugin);
})();
