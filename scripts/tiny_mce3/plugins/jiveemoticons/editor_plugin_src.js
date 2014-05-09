// Plugin static class
(function() {

    tinymce.create('tinymce.plugins.JiveEmoticonsPlugin', {

        before : null,

        encodeSmileys : function(ed, n){
            var that = this;
            var doc = ed.getDoc();
            var bookmark = null;

            //creates the img element
            function createEmoticonMacro(emoticonName) {
                var emote = doc.createElement('IMG');
                emote.setAttribute("class", "jive_macro jive_emote");
                emote.setAttribute("jivemacro", "emoticon");
                emote.setAttribute("___jive_emoticon_name", emoticonName);
                emote.setAttribute("src",
                        window.CS_RESOURCE_BASE_URL + '/images/emoticons/' + emoticonName + '.png');
                emote.setAttribute("data-mce-src",
                        window.CS_RESOURCE_BASE_URL + '/images/emoticons/' + emoticonName + '.png');
                //IE adds these; they make testing hard but aren't actually a bad idea.
                emote.removeAttribute("width");
                emote.removeAttribute("height");
                return emote;
            }

            var isSpace = new RegExp("^(?:[^\\S]|\\xA0)?$"); //space or nbsp

            //factory function that returns a method to be passed as the second parameter of String.prototype.replace.
            //The returned method will update the documentFragment, and have a lastIndex property.  Use lastIndex to
            //figure out the unprocessed remainder of the string.
            function makeEmoticonReplacer(documentFragment){
                function replaceEmoticon(emo, offset, s){
                    var matchLen = emo.length;
                    if(isSpace.test(s.substring(offset-1, offset)) && isSpace.test(s.substring(offset+matchLen, offset+matchLen+1))){
                        var def = that.emoticonMap[emo];
                        var text = s.substring(replaceEmoticon.lastIndex, offset);
                        replaceEmoticon.lastIndex = offset + matchLen;
                        documentFragment.appendChild(doc.createTextNode(text));
                        documentFragment.appendChild(createEmoticonMacro(def[1]));
                        return "";
                    }
                    return emo;
                }
                replaceEmoticon.lastIndex = 0;
                return replaceEmoticon;
            }

            var isDirty = false;
            //walk the tree rooted at n.  If n is a text node, split it on smileys with the macros in place.
            function encodeSmiliesInNode(n){
                var mac = ed.plugins.jivemacros.isMacro(n);
                if(mac && $j(mac).attr("jivemacro") == "code") return 1; //don't process code macros or their contents
                if(n.nodeType == 1){
                    for(var i = 0; i < n.childNodes.length; ){
                        //we'll return the number of nodes that the child turned into; we want to advance that many.
                        i += encodeSmiliesInNode(n.childNodes[i]);
                    }
                }else if(n.nodeType == 3){
                    var df = doc.createDocumentFragment();
                    that.testForAnyEmoticon.lastIndex = 0; //reset the regexp
                    var replacer = makeEmoticonReplacer(df); //our replacer function; doesn't actually do any replacing; called for side effects.
                    n.nodeValue.replace(that.testForAnyEmoticon, replacer);

                    //If there were smileys, the document fragment should replace the current text node
                    if(df.childNodes.length > 0){
                        //need to add a textnode to handle the part of the string from the last smiley on.
                        var rest = n.nodeValue.substr(replacer.lastIndex); //from the last match to the end of the string
                        df.appendChild(doc.createTextNode(rest));

                        var ret = df.childNodes.length;
                        n.parentNode.replaceChild(df, n);
                        isDirty = true;
                        return ret; //return the number of nodes, which lets the for loop above advance correctly
                    }
                }
                return 1;
            }

            if(n != null && this.testForAnyEmoticon.test(n.innerHTML)){
                var isForward = true;
//                ed.selectionUtil.logSelection("About to create smiley bookmark: ");
                try{
                    //IE does not expose the concept of selection direction (focus at start or end), so bookmarking when selections aren't collapsed does more harm than good.
                    if(!tinymce.isIE || ed.selection.isCollapsed()){
//                        ed.selectionUtil.logSelection("Bookmarking for emoticon: ");
                        isForward = ed.selectionUtil.isForwardSelection();
                        bookmark = ed.selection.getBookmark();
                    }
                }catch(ex){
                    console.log("could not bookmark selection for emoticon", ex);
                }
//                ed.selectionUtil.logSelection("Smiley bookmark created: ");
                ed.selection.setRng(ed.selectionUtil.safeNormalize(ed.selection.getRng(true), n)); //join all adjacent text nodes together.
                encodeSmiliesInNode(n);
                if(bookmark != null){
                    //moveToBookmark destroys the directionality of the uncollapsed selection, so we put it back
                    //console.log("restoring emoticon bookmark");
                    ed.selection.moveToBookmark(bookmark);
                    if(!isForward){
                        ed.selectionUtil.setSelection(ed.selection.getRng(true), isForward);
                    }
                }
//                ed.selectionUtil.logSelection("Encoded Smileys: ");
            }
        },


        nodeChanged : function(ed){
            if(this.before == null){
                this.before = ed.selection.getNode();
            }
            this.encodeSmileys(ed, this.before);
            this.before = ed.selection.getNode();
        },

        init : function(ed, url){
            //Smiley definitions: [text, name, regexp]
            var smileyDefs = [
                [":)",  "happy",    ":\\)"],
                [":^0", "laugh",    ":^0"], [":0",  "laugh",    ":0"],
                [":p",  "silly",    ":p"], [":P",  "silly",    ":P"],
                [";)",  "wink",     ";\\)"],
                [":|",  "plain",     ":\\|"],
                ["X-(", "angry",    "X\\-\\("],
                [":8}", "blush",    ":8}"],
                [":?", "confused",    ":\\?"],
                ["B-)", "cool",     "B-\\)"],
                [":'(", "cry",     ":'\\("],
                ["]:)", "devil",    "\\]:\\)"],
                [":D",  "grin",     ":D"],
                [":x",  "love",     ":x"],
                [";\\", "mischief", ";\\\\"],
                [":(",  "sad",      ":\\("],
                [":o",  "shocked",  ":o"],
                ["(i)", "info",     "\\(i\\)"],
                ["(+)", "plus",     "\\(\\+\\)"],
                ["(-)", "minus",    "\\(\\-\\)"],
                ["(!)", "alert",    "\\(!\\)"],
                ["(/)", "check",     "\\(/\\)"],
                ["(x)", "x",     "\\(x\\)"]
            ];

            //we need to be able to find the emoticon definition based on it's short string.
            var emoticonMap = {};
            smileyDefs.forEach(function(def){
                emoticonMap[def[0]] = def;
            });
            this.emoticonMap = emoticonMap;

            // Creates a single regular expression to match any shortcode.
            var combinedShortcodes = smileyDefs.map(function(def) {
                return def[def.length-1];
            }).join('|');
            //Precompile regex
            this.testForAnyEmoticon = new RegExp('(?:' + combinedShortcodes + ')', 'g');


             // Is it's Opera or older FF use key handler
            if (tinymce.isOpera || /Firefox\/2/.test(navigator.userAgent)) {
                ed.onKeyDown.add(function(ed, e) {
                if (((tinymce.isMac ? e.metaKey : e.ctrlKey) && e.keyCode == 86) || (e.shiftKey && e.keyCode == 45))
                    setTimeout(function(that, ed){ return function(){
                            that.encodeSmileys(ed, ed.getBody());
                        }
                    }(this, ed), 33);
                }, this);
            } else {
                // Grab contents on paste event on Gecko and WebKit
                ed.onPaste.addToTop(function(ed, e) {
                    setTimeout(function(that, ed){ return function(){
                            that.encodeSmileys(ed, ed.getBody());
                        }
                    }(this, ed), 33);
                }, this);
            }

        },

        execCommand : function(cmd, ui, val){
            if(cmd == 'mceJiveEmoticon'){
                var cm = tinyMCE.activeEditor.controlManager;
                var button = cm.get('jiveemoticons');
                button.showMenu();
                return true;
            }
            if(cmd == "insertHTML" || cmd == "mceInsertContent"){
                var ed = tinyMCE.activeEditor;
                setTimeout(function(that, ed){ return function(){
                        that.encodeSmileys(ed, ed.getBody());
                    }
                }(this, ed), 0);
            }
            return false;
        },

        getInfo : function() {
            return {
                longname : 'Emoticons',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
        },

        /**
         * Returns the HTML contents of the emoticons control.
         */
        createControl : function(n, cm) {
            switch(n){
                case 'jiveemoticons':
                    var c = cm.createSplitButton('jiveemoticons', {
                        title : 'jiveemoticons.desc',
                        cmd : "mceJiveEmoticon"
                    });
                    c.onRenderMenu.add(function(c, m) {
                        var ed = tinyMCE.activeEditor;
                        for(var j=0;j<jive.rte.macros.length;j++){
                            var macro = jive.rte.macros[j];
                            if(macro.isShowInMacroList() && macro.getName() == "emoticon"){
                                // presets menu
                                var paramSets = macro.getParameterSets();
                                for(var i=0;i<paramSets.length;i++){
                                    // mceMenuItemSelected
                                    var preset_title = ed.getLang("jivemacros.macro." + macro.getName() + ".preset." + paramSets[i].name, paramSets[i].name);
                                    m.add({title : preset_title, cmd : 'mceAddJiveMacro' + j + "_" + i, icon : "jiveMacro_" + macro.getName() + "_" + paramSets[i].name});
                                }
                                break;
                            }
                        }
                    });
                    // Return the new menubutton instance
                    return c;
            }
            return null;
        }


    });
	// Register plugin
	tinymce.PluginManager.add('jiveemoticons', tinymce.plugins.JiveEmoticonsPlugin);
})();
