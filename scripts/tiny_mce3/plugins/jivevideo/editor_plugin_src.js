(function() {

    tinymce.create('tinymce.plugins.JiveVideoPlugin', {

        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @returns Name/value array containing information about the plugin.
         * @type Array
         */
        getInfo : function() {
            return {
                longname : 'Video Picker',
                author : 'Jive Software',
                authorurl : 'http://www.jivesoftware.com',
                infourl : 'http://www.jivesoftware.com/',
                version : "1.0"
            };
        },

        enabled : [],

        /**
         * Gets executed when a TinyMCE editor instance is initialized.
         *
         * @param {TinyMCE_Control} Initialized TinyMCE editor control instance.
         */
        init : function(ed, url) {
            ed.onInit.add(function() {
                // deterime which video macros are installed
                var allowed = ["youtube","dailymotion","vimeo","google","videomacro"]
                  , count = 0
                  , that = this;

                // Clear out any existing macros before regenerating the list.
                this.enabled = [];

                jive.rte.macros.forEach(function(macro) {
                    if (allowed.some(function(a) {
                        return a === macro.getName();
                    }) && macro.isEnabled && macro.isEnabled()) {
                        count += 1;
                        that.enabled.push(macro);
                    }
                });

                if(count == 0){
                    ed.controlManager.get("jivevideo").setDisabled(true);
                }
            }, this);
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
                case "jivevideo":
                    var c = cm.createButton('jivevideo', {
                        title : 'jivevideo.link_desc',
                        cmd : "mceJiveVideo"
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
            switch (cmd) {
                case "mceJiveVideo":
                    var ed = tinyMCE.activeEditor;

                    ed.windowManager.open({
                        url : CS_BASE_URL + '/upload-video!input.jspa'+_jive_video_picker__url,
                        width : 550 + parseInt(ed.getLang('jivevideo.delta_width', 0)),
                        height : 430 + parseInt(ed.getLang('jivevideo.delta_height', 0)),
                        inline : 1
                    });

                    return true;
            }

            return false;
        }

    });
	// Register plugin
	tinymce.PluginManager.add('jivevideo', tinymce.plugins.JiveVideoPlugin);
})();
