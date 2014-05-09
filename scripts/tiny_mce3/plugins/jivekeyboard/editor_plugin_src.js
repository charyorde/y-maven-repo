/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

(function() {
    function _makeModStr(obj){
        return (obj.shiftKey ? "Shift" : "") + (obj.ctrlKey || obj.metaKey ? "Ctrl" : "") + (obj.altKey ? "Alt" : "");
    }

	tinymce.create('tinymce.plugins.JiveKeyboardPlugin', {
        init : function(ed) {
            var eventMap = {};

            function findHandler(evt){
                var keyMap = eventMap[evt.type];
                if(!keyMap){
                    return null;
                }

                var key = evt.keyCode;
                if(evt.type == 'keypress'){
                    if (evt.which != null && evt.which != 0 && evt.charCode != 0){
                        key = evt.which; //key code for most browsers on keypress
                    }
                }
                var modMap = keyMap[key];
                if(!modMap){
                    return null;
                }

                var modStr = _makeModStr(evt);
                return modMap[modStr];
            }

            /**
             *
             * @param eventType the expected value of evt.type, e.g. "keydown".
             * @param key The numeric keycode.
             * @param mods An object specifying mod flags; same format as the event.  So {shiftKey: true}, etc.
             * @param func The handler function. handler(ed, evt)
             */
            function addHandler(eventType, key, mods, func){
                if(mods == null){
                    mods = {};
                }
                if(!eventMap[eventType]){
                    eventMap[eventType] = {};
                }
                if(!eventMap[eventType][key]){
                    eventMap[eventType][key] = {};
                }
                var modStr = _makeModStr(mods);
                eventMap[eventType][key][modStr] = func;
            }

            //noinspection FunctionWithInconsistentReturnsJS
            function handlerSearch(ed, evt){
                var handler = findHandler(evt);
                if(handler){
                    return handler(ed, evt);
                }
            }

            ed.onKeyDown.add(handlerSearch);
            ed.onKeyPress.add(handlerSearch);
            ed.onKeyUp.add(handlerSearch);

            addHandler("keydown", 27, {}, function(ed, evt){
                $j("button:submit:visible, input:submit:visible", ed.getContentAreaContainer().ownerDocument).get(0).focus(); //escape focuses first submit button
                return tinymce.dom.Event.cancel(evt);
            });
            addHandler("keydown", 27, {shiftKey: true}, function(ed, evt){
                $j("input:text[name=subject]:visible", ed.getContentAreaContainer().ownerDocument).get(0).focus(); //shift-escape focuses title/subject
                return tinymce.dom.Event.cancel(evt);
            });

            //make this public
            this.addHandler = addHandler;
        },


        getInfo : function() {
            return {
                longname : 'Jive Keyboard',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
        }

    });

	// Register plugin
	tinymce.PluginManager.add('jivekeyboard', tinymce.plugins.JiveKeyboardPlugin);
})();