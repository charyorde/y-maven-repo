/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

// Plugin static class
(function() {
    //private utility predicates
    function isTextNode(n) {
        return n && n.nodeType == 3;
    }

    function isTextPos(treePos) {
        return isTextNode(treePos.c);
    }

    function isTerminal(treePos){
        if(isTextPos(treePos)) {
            return treePos.off == treePos.c.nodeValue.length;
        }else{
            return treePos.off == treePos.c.childNodes.length;
        }
    }

    function isNonTerminalTextPos(treePos){
        var n = nodeAt(treePos);
        return (isTextPos(treePos) && !isTerminal(treePos)) || (n && n.nodeName.toLowerCase() == "br");
    }

    function getIsNodeNameAt(nodeName){
        nodeName = nodeName.toLowerCase();
        return function(treePos){
            var n = nodeAt(treePos);
            return n && n.nodeName && n.nodeName.toLowerCase() == nodeName;
        }
    }

    function getIsContainerName(elementName){
        elementName = elementName.toLowerCase();
        return function(treePos){
            return treePos && treePos.c.nodeType == 1 && treePos.c.nodeName.toLowerCase() == elementName;
        }
    }

    //get node at position
    function nodeAt(treePos){
        if(treePos.c && treePos.off >= 0 && treePos.c.childNodes && treePos.c.childNodes.length > treePos.off){
            return treePos.c.childNodes[treePos.off];
        }
        return null;
    }

    function charAtPos(treePos){
        if(treePos && isNonTerminalTextPos(treePos)){
            return treePos.c.nodeValue.charAt(treePos.off);
        }
        return null;
    }

    function posFor(node){
        var dom = tinymce.activeEditor.dom;
        return {c: node.parentNode, off: dom.nodeIndex(node)};
    }

    function setRangeStart(rng, treePos){
        rng.setStart(treePos.c, treePos.off);
    }

    function startPos(rng){
        return {c: rng.startContainer, off: rng.startOffset};
    }

    //noinspection JSUnusedLocalSymbols
    tinymce.create('tinymce.plugins.JiveSelectionPlugin', {

        init : function(ed, url) {
            this.ed = ed;

            this.isSelectionFrozen = false;

            var self = this;
            //Typing emulator
            function fixedFromCharCode (codePt) {
                if (codePt > 0xFFFF) {
                    //handle unicode surrogate pairs
                    codePt -= 0x10000;
                    return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
                }
                else {
                    return String.fromCharCode(codePt);
                }
            }

            function isEndOfTextNodeInsideAnchor(pos){
                var parent = pos.c.parentNode;
                return pos.c.nodeType == 3
                        && pos.c.nodeValue.length == pos.off
                        && parent.nodeName.toLowerCase() == "a"
                        && pos.c == parent.lastChild;
            }

            //WebKit seems to try to do cursor management, but poorly. So we have to fake *typing*. Sigh.
            function emulateTyping(predicate){
                return function (ed, evt){
                    var rng = ed.selection.getRng();
                    var pos = startPos(rng);
                    if(rng.collapsed && evt.charCode > 31
                            && !evt.ctrlKey && !evt.altKey && !evt.metaKey
                            && predicate(pos)){
//                      console.log("Emulating typing");
                        var s = fixedFromCharCode(evt.charCode);

                        //figure out if the previous character was a space
                        do{
                            pos = ed.selectionUtil.dfsNext(pos, false);
                        }while(pos && !isNonTerminalTextPos(pos));
                        if(s == " " && /[ \xa0]/.test(charAtPos(pos))){
                            s = "\xa0"; //nbsp, because chrome is weird about consecutive spaces.
                        }
                        var n = ed.getDoc().createTextNode(s);

                        //figure out where we're putting the new character
                        var insertPos = startPos(rng);
                        while(isTextPos(insertPos)){
                            insertPos = ed.selectionUtil.dfsNext(insertPos, true);
                        }

                        //insert the new character
                        insertPos.c.insertBefore(n, nodeAt(insertPos));
                        rng.setStart(n, s.length);
                        rng.collapse(true);
                        ed.selectionUtil.setSelection(rng, true);
                        evt.preventDefault();
                    }
                };
            }

            if(!tinymce.isIE || tinymce.isIE9){
                //when someone removes a bit of formatting, the cursor will be in an odd spot.  We need to leave it there.
                ed.onFormatChange.add(function(format, added){
                    if(format.inline && !added){
                        self.isSelectionFrozen = true;
//                        console.log("freezing selection");
                    }
                });

                //noinspection JSUnusedLocalSymbols
                ed.onNodeChange.addToTop(function(ed, cm, n) {
                    if(!self.isSelectionFrozen){
                        ed.selectionUtil.normalizeSelection();
                    }
                });

                //thaw the selection when something happens that might naturally move the cursor
                function thaw(ed, evt){
//                    if(self.isSelectionFrozen) console.log("Thawing selection", evt);
                    self.isSelectionFrozen = false;
                }
                ed.onKeyDown.add(thaw);
                ed.onMouseDown.add(thaw);


                if(tinymce.isWebKit){
                    function webkitFixPredicate(pos){
                        return pos.c.nodeType == 1;
                    }
                    ed.onKeyPress.add(emulateTyping(webkitFixPredicate));
                }

                //Special cursor handling for links.
                var isAnchor = getIsNodeNameAt("a");
                var isAfterAnchor = function(pos){
                    if(pos.off > 0){
                        return isAnchor({c: pos.c, off: pos.off-1});
                    }
                    return false;
                };
                var isInAnchor = getIsContainerName("a");

                ed.onKeyPress.add(emulateTyping(isEndOfTextNodeInsideAnchor));

                ed.onKeyDown.add(function(ed, evt){
                    //handle arrow keys near link boundaries
                    var keyCode = evt.keyCode;
                    if(ed.selection.isCollapsed() && (keyCode == 37 || keyCode == 39 || keyCode == 8 || keyCode == 46)){
                        var rng = ed.selection.getRng(true);
                        var pos = startPos(rng);

                        //Handle these:
                        //before, in text node or a's container
                        //front, in a or text node
                        //back, in a or text node
                        //after, in a's container or text node
                        var nextPos = ed.selectionUtil.dfsNext(pos, true);
                        var prevPos = ed.selectionUtil.dfsNext(pos, false);
                        var targetPos = null;
                        if (isAnchor(pos) || (isTextPos(pos) && isTerminal(pos) && isAnchor(nextPos))) {
                            //Before
                            var anchorPos = isAnchor(pos) ? pos : nextPos;
                            if (keyCode == 39) {
                                //right-arrow
                                targetPos = {c: nodeAt(anchorPos), off: 0};
                                evt.preventDefault();
                            }else if(keyCode == 46){
                                //delete
                                targetPos = {c: nodeAt(anchorPos), off: 0};
                            }
                        }else if((isInAnchor(pos) && pos.off == 0) || (pos.off == 0 && prevPos.off == 0 && isInAnchor(prevPos))){
                            //Front
                            var frontPos = isInAnchor(pos) ? pos : prevPos;
                            if (keyCode == 37) {
                                //left-arrow
                                targetPos = posFor(frontPos.c);
                                evt.preventDefault();
                            }else if(keyCode == 8){
                                //backspace
                                targetPos = posFor(frontPos.c);
                            }
                        }else if((isInAnchor(pos) && isTerminal(pos)) || (isTerminal(nextPos) && isInAnchor(nextPos))){
                            //Back
                            var backPos = isInAnchor(pos) ? pos : nextPos;
                            if (keyCode == 39) {
                                targetPos = posFor(backPos.c);
                                targetPos.off += 1;
                                //right-arrow
                                evt.preventDefault();
                            }else if(keyCode == 46){
                                //delete
                                targetPos = posFor(backPos.c);
                                targetPos.off += 1;
                            }
                        }else if(isAfterAnchor(pos) || (isAfterAnchor(prevPos))){
                            //After
                            var afterPos = isAfterAnchor(pos) ? pos : prevPos;
                            if (keyCode == 37) {
                                //left-arrow
                                var anchor = nodeAt({c: afterPos.c, off: afterPos.off-1});
                                targetPos = {c: anchor, off: anchor.childNodes.length};
                                evt.preventDefault();
                            }else if(keyCode == 8){
                                //backspace
                                anchor = nodeAt({c: afterPos.c, off: afterPos.off-1});
                                targetPos = {c: anchor, off: anchor.childNodes.length};
                            }
                        }

                        if(targetPos){
                            setRangeStart(rng, targetPos);
                            rng.collapse(true);
                            ed.selection.setRng(rng);
                        }
                    }
                });
            }
//            function logSelInfo(ed, evt){
//                su.logSelection(evt.type + ": ");
//            }
//            ed.onKeyDown.addToTop(logSelInfo);
//            ed.onKeyDown.add(logSelInfo);
//            ed.onKeyPress.addToTop(logSelInfo);
//            ed.onKeyPress.add(logSelInfo);
//            ed.onKeyUp.addToTop(logSelInfo);
//            ed.onKeyUp.add(logSelInfo);
        },

        getInfo : function() {
            return {
                longname : 'Jive Selection',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
        }
    });
	// Register plugin
	tinymce.PluginManager.add('jiveselection', tinymce.plugins.JiveSelectionPlugin);
})();
