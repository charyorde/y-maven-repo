/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
(function() {

    function createMozBR(){
        var dom = tinymce.activeEditor.dom;
        return dom.create("br", {
            "_moz_dirty": "",
            "type": "_moz"
        });
    }

    //noinspection JSUnusedLocalSymbols
    tinymce.create('tinymce.plugins.JiveListsPlugin', {

        lastList : null,

        lastPrevSib :null,

        fixLists : function(ed){
            var n,l,p,br,li;

            function createEmptyPara(){
                var dom = tinymce.activeEditor.dom;
                return dom.create("p", {}, "<br _moz_dirty='' type='_moz' />");
            }

            this.onBeforeFixLists.dispatch(ed);

            var that = this;
            ed.undoManager.transparentChange(function(){
                n = ed.selection.getNode();
                if(n.ownerDocument !== ed.getDoc()){
                    //this happens with IE7-8 sometimes, when the RTE doesn't have focus.
                    return;
                }
                var ul = ed.dom.getParent(n, "ol,ul");
                if(ul != null && ul.nodeType == 1 && (ul.nodeName.toLowerCase() == "ul" || ul.nodeName.toLowerCase() == "ol")){
                    li = ul.parentNode;
                    if(li.nodeName.toLowerCase() == "li") {
                        //our ul is the direct child of an li.  Move it up a level, so ul becomes li.nextSibling
                        p = li.parentNode;
                        p.insertBefore(ul, li.nextSibling);
                        if (ed.selectionUtil.isEffectivelyEmpty(li)) {
                            p.removeChild(li);
                        }

                        //normalizeSelection seems to be required to get around ie8 bug
                        ed.selectionUtil.normalizeSelection();
                        ed.selection.select();
                        ed.selection.collapse(true);
                    }
                    that.mergeConsecutiveLists(ul);
                }

                n = ed.dom.getParent(n, "li");
                if(n != null && n.nodeType == 1 && n.nodeName.toLowerCase() == "li"){
                    l = ed.dom.getParent(n, "ol,ul");
                    if(l != null){
                        if(tinymce.isGecko){
                            for(var i=0;i<l.childNodes.length;i++){
                                li = l.childNodes[i];
                                if(li.nodeType == 1 && li.nodeName.toLowerCase() == "li" && (!li.lastChild || li.lastChild.nodeName.toLowerCase() != "br")){
                                    // always append <br> to the li in Firefox
                                    li.appendChild(createMozBR());
                                }
                            }
                        }

                        if(l.parentNode.nodeName.toLowerCase() == "p"){
                            //If the list is in a paragraph, move it before the paragraph, and delete the paragraph
                            //This keeps cursor movement sane across browsers.
                            p = l.parentNode;

                            //split the p on the list
                            ed.dom.split(p, l);

                            ed.selection.select(n).collapse(true);
                        }
                    }
                }

                if(that.lastList != null && that.lastList.parentNode != null){
                    // the list is still in the DOM, select the paragraph after it
                    n = that.lastList.nextSibling;
                    if(n != null){
                        if(n.nodeType == 1 && n.nodeName.toLowerCase() == "br"){
                            p = createEmptyPara();
                            n.parentNode.insertBefore(p, n);
                            n.parentNode.removeChild(n);
                            br = p.childNodes[p.childNodes.length-1];
                            ed.selection.select(br);
                            ed.selection.collapse(true);
                        }
                    }
                }else if(that.lastPrevSib != null){
                    n = that.lastPrevSib.nextSibling;
                    if(n != null){
                        if(n.nodeType == 1 && n.nodeName.toLowerCase() == "br"){
                            p = createEmptyPara();
                            n.parentNode.insertBefore(p, n);
                            n.parentNode.removeChild(n);
                            br = p.childNodes[p.childNodes.length-1];
                            ed.selection.select(br);
                            ed.selection.collapse(true);
                        }
                    }
                }
                that.fixListTypes();
            });
            this.onAfterFixLists.dispatch(ed);
        },

        fixListTypes: function(){
            var ed = this.ed;
            //translate list type attributes to styles
            $j("ul[type], ol[type]", ed.getBody()).each(function(){
                ed.plugins.jivelists.listTypeToStyle(this)
            });
        },

        mergeConsecutiveLists: function(list){
            //find the first list of the set
            while(true){
                var sib = list.previousSibling;
                while(sib != null && sib.nodeType != 1){
                    sib = sib.previousSibling;
                }
                if(sib != null && sib.nodeName == list.nodeName){
                    list = sib;
                }else{
                    break;
                }
            }

            var bm = null;
            while(true){
                sib = list.nextSibling;
                while(sib != null && sib.nodeType != 1){
                    sib = sib.nextSibling;
                }
                if(sib != null && sib.nodeName == list.nodeName){
                    //merge
                    if(!bm){
                        //Must the selection be so flaky?
                        try{
                            bm = this.ed.selection.getBookmark();
                        }catch(ex){
                            console.log("Failed to set bookmark before reparenting.  Hopefully it doesn't matter.", ex);
                        }
                    }
                    this.reparentChildren(list, sib);
                    sib.parentNode.removeChild(sib);
                }else{
                    break;
                }
            }
            if(bm){
                this.ed.selection.moveToBookmark(bm);
            }
            return list;
        },

        /**
         * Moves children of elem to newParent.
         *
         * @param newParent The element to append the children of elem to.
         * @param elem The element whose children we're moving.
         */
        reparentChildren: function(newParent, elem){
            while(elem.firstChild){
                newParent.appendChild(elem.firstChild);
            }
            return newParent;
        },

        indentSelectedItems: function(){
            var rng = this.getExpandedLiRange(this.ed.selection.getRng(true));
            if(rng){
                var bm = this.ed.selection.getBookmark();
                var newList = this.ed.getDoc().createElement(rng.commonAncestorContainer.nodeName);
                rng.surroundContents(newList);
                this.ed.selection.moveToBookmark(bm);
            }else{
                throw new Error("Unable to indent selection; probably not a list selection.");
            }
        },

        getExpandedLiRange: function(rng){
            return this.ed.selectionUtil.getExpandedBlockRange(rng, "li", "ul,ol");
        },

        /**
         * This method splits the range's common ancestor container.  The contents of the range
         * become direct children of the commonAncestorContainer.
         *
         * @param rng The range to split on.
         */
        rangeSplit: function(rng){
            //find the node to split
            var parentNode = rng.commonAncestorContainer;
            if(parentNode.nodeType == 3){
                parentNode = parentNode.parentNode;
            }

            //extract the contents of the range into a DocumentFragment
            var contents = rng.extractContents();
            //build the array of nodes to return
            var ret = [];
            for(var n = contents.firstChild; n != null; n = n.nextSibling){
                ret.push(n);
            }

            //create the marker element that we'll split on
            var marker = this.ed.getDoc().createElement("br");
            marker.className = "splitMarker";
            if(rng.startContainer.nodeType == 3){
                //this should not be necessary, but no browser gets Range.insertNode right.
                var newText = rng.startContainer.splitText(rng.startOffset);
                newText.parentNode.insertBefore(marker, newText);
            }else{
                rng.insertNode(marker);
            }
            //split parentNode on marker and replace it with the extracted contents
            this.ed.dom.split(parentNode, marker, contents);
            return ret; //return the nodes that have been affected
        },

        /**
         * Add an element before a reference element to help IE get the cursor position right.
         * @param ed The editor.
         * @param n The reference element.  The shim is inserted before this element.
         */
        shimIfIE: function(ed, n){
            if(tinymce.isIE){
                //IE 6-8 fundamentally base ranges on characters, not dom nodes, so they need a little help.
                //This shim will have no affect on the rendered document, but makes the cursor movement work right.
                $j('<p class="ieShim"> </p>', ed.getDoc()).insertBefore(n);
            }
        },

        removeIEShims: function(ed){
            $j(ed.getBody()).find(".ieShim").remove();
        },

        execCommand : function(cmd, ui, val){
            var ed = tinyMCE.activeEditor;
            var that = this;

            function fixBlockQuote(ed){
                var n = ed.selection.getNode();
                n = ed.dom.getParent(n, "ol,ul");
                var quote = ed.dom.getParent(n, "blockquote");
                if(quote != null){
                    var newList = ed.getDoc().createElement(n.nodeName);
                    quote.parentNode.insertBefore(newList, quote);
                    while(quote.childNodes.length) newList.appendChild(quote.childNodes[0]);
                    quote.parentNode.removeChild(quote);
                    ed.selection.select(n);
                }
            }


            var n = ed.selection.getNode();
            var par = null;
            while(n != null && n.parentNode != null && (n = ed.dom.getParent(n.parentNode, "ol,ul")) != null){
                par = n;
            }
            n = par;
            if(n != null){
                this.lastList = n;
                this.lastPrevSib = n.previousSibling;
            }else{
                this.lastList = null;
                this.lastPrevSib = null;
            }

            // CS-18158 RTE loses focus when deleting bullet in Webkit
            function retainFocus(block, editor) {
                editor = editor || tinyMCE.activeEditor;
                var b = editor.selection.getBookmark(),  // First, get a cursor position bookmark.
                ret = block();  // Execute the given code.
                if (tinymce.isWebKit) {
                    window.focus();  // Moving focus away and back works around focus bugs in Webkit.
                    editor.focus();
                }
                editor.selection.moveToBookmark(b);  // Put the cursor back where it started.
                return ret;
            }

            function styleList(type){
                type = type.toLowerCase();
                var index = parseInt(cmd.substr("mceOLListStyle".length));

                var list = ed.plugins.jivelists[type + "_styles"];
                var style = list[index];

                var n = ed.selection.getNode();
                var par = ed.dom.getParent(n, type);

                ed.dom.setStyle(par, "listStyleType", style[1]);
            }

            function makeList(type, blockSelector, blockContainerSelector){
//                ed.selectionUtil.logSelection("makeList: ");
                var rng = ed.selectionUtil.getExpandedBlockRange(ed.selection.getRng(true).cloneRange(), blockSelector, blockContainerSelector);
                var bm;
                try{
                    bm = ed.selection.getBookmark();

                    function listFromBlockRange(rng){
                        var newList = ed.dom.create(type);
                        rng.surroundContents(newList);
                        var bookmarks = [];
                        for(var i = 0; i < newList.childNodes.length; ++i){
                            var n = newList.childNodes[i];
                            if(ed.selectionUtil.isBookmark(n)){
                                bookmarks.push(n);
                            }else{
                                var li = ed.dom.create("li");
                                if(ed.dom.isBlock(n)){
                                    ed.dom.replace(li, n, true);
                                    if($j(n).css("text-align") != "left" && $j(n).css("text-align") != "start"){
                                        $j(li).css("text-align", $j(n).css("text-align"))
                                    }
                                }else{
                                    //ACK! It's not a block.  Surround the rest of the selection in a single LI.
                                    rng.setStart(newList, i);
                                    rng.setEnd(newList, newList.childNodes.length);
                                    rng.surroundContents(li);

                                    i = newList.childNodes.length; //exit the loop after dealing with any bookmarks.
                                }
                                while(bookmarks.length > 0){
                                    li.insertBefore(bookmarks.pop(), li.firstChild);
                                    --i; //we just moved the bookmark node out of newList, so i gets smaller.
                                }
                            }
                        }
                        if(newList.childNodes.length == 0){
                            newList.appendChild(ed.dom.create("li"));
                        }
                        newList = that.mergeConsecutiveLists(newList);
                        return newList;
                    }

                    function listsFromTdRange(firstBlockNode, lastBlockNode){
                        //run from first block node to last block node, inclusive, creating lists out of their contents.
                        var rng = ed.dom.createRng();
                        var nextBlockNode = firstBlockNode;
                        while(nextBlockNode != null){
                            firstBlockNode = nextBlockNode;
                            if(firstBlockNode != lastBlockNode){
                                nextBlockNode = firstBlockNode.nextSibling;
                            }else{
                                nextBlockNode = null;
                            }
                            rng.selectNodeContents(firstBlockNode);
                            listFromBlockRange(rng);
                        }
                    }

                    function listsFromTrRange(firstTr, lastTr){
                        var tr = firstTr;
                        while(tr){
                            listsFromTdRange(tr.firstChild, tr.lastChild);
                            if(tr == lastTr){
                                tr = null;
                            }else{
                                tr = tr.nextSibling;
                            }
                        }
                    }

                    if(rng.collapsed){
                        //insert a new, empty list and put the cursor in the LI, ignoring the bookmark
                        var newList = listFromBlockRange(rng);
                        ed.selectionUtil.removeBookmark(bm);
                        var newPos = ed.dom.createRng();
                        newPos.setStart(newList.firstChild, 0);
                        newPos.collapse(true);
                        ed.selection.setRng(newPos);
                    }else{
                        var firstBlockNode = rng.startContainer.childNodes[rng.startOffset];
                        var lastBlockNode = rng.endContainer.childNodes[rng.endOffset-1];
                        if(firstBlockNode.nodeName.toLowerCase() == "td"){
                            listsFromTdRange(firstBlockNode, lastBlockNode);
                        }else if(firstBlockNode.nodeName.toLowerCase() == "tr"){
                            listsFromTrRange(firstBlockNode, lastBlockNode);
                        }else{
                            listFromBlockRange(rng);
                        }

                        that.shimIfIE(ed, firstBlockNode);
                        ed.selection.moveToBookmark(bm);
                    }
                }catch(ex){
                    console.log("failing over to execCommand", ex);
                    if(bm){
                        ed.selectionUtil.removeBookmark(bm);
                    }
                    type = type.toLowerCase();
                    if(type == "ul"){
                        ed.execCommand("InsertUnorderedList");
                    }else{
                        ed.execCommand("InsertOrderedList");
                    }
                }
                that.fixLists(ed);
                that.removeIEShims(ed);
            }


            var par = this.getSelectionParent("ol,ul");

            if(cmd.indexOf("mceOLListStyle") == 0){
                ed.undoManager.add();
                styleList("ol");
                ed.undoManager.add();
                return true;
            }else if(cmd.indexOf("mceULListStyle") == 0){
                ed.undoManager.add();
                styleList("ul");
                ed.undoManager.add();
                return true;
            }else if(cmd == "mceOutdent"){
                ed.undoManager.add();
                var sel = ed.selection;
                retainFocus(function() {
                    try{
                        var rng = that.getExpandedLiRange(sel.getRng(true));
                        var affectedNodes = that.rangeSplit(rng);
                        that.shimIfIE(ed, affectedNodes[0]);
                        //handle the toplevel list case by turning li elements into p elements
                        for(var i = 0; i < affectedNodes.length; ++i){
                            var n = affectedNodes[i];
                            if(n.parentNode.nodeName.toLowerCase() != "ul" &&
                                n.parentNode.nodeName.toLowerCase() != "ol"){
                                if(!ed.selectionUtil.isBookmark(n)){
                                    var p = ed.getDoc().createElement("p");
                                    n.parentNode.insertBefore(p, n);
                                    if($j(n).css("text-align") != "left" && $j(n).css("text-align") != "start"){
                                        $j(p).css("text-align", $j(n).css("text-align"))
                                    }
                                    if(n.nodeType == 1){
                                        that.reparentChildren(p, n);
                                        n.parentNode.removeChild(n);
                                    }else{
                                        p.appendChild(n);
                                    }
                                    if(tinymce.isIE && !tinymce.isIE9){
                                        //hack to make the p take up space and hold on to the cursor.  Not ideal, but it works.
                                        p.appendChild(ed.getDoc().createTextNode("\ufeff"));
                                    }
                                }
                            }
                        }
                    }catch(ex){
                        console.log("failing over to execCommand('Outdent')");
                        that.shimIfIE(ed, sel.getNode());
                        ed.execCommand("Outdent");
                        try{
                            ed.execCommand("mceOutdentComplete");
                        }catch(ex){
                            if(console && console.log){
                                console.log("Outdent Complete failed", ex);
                            }
                        }
                    }
                    that.fixLists(ed);
                }, ed);
                that.removeIEShims(ed);
                ed.undoManager.add();
                return true;
            }else if(cmd == "mceIndent"){
                ed.undoManager.add();
                try{
                    this.indentSelectedItems();
                    this.fixLists(ed);
                }catch(ex){
                    //fail over to execCommand
                    console.log("failing over to execCommand('Indent')");
                    ed.execCommand("Indent");
                    this.fixLists(ed);
                    fixBlockQuote(ed);
                }
                ed.execCommand("mceIndentComplete");
                ed.undoManager.add();
                return true;
            }else if(cmd.indexOf("mceInsertUnorderedList") == 0){
                ed.undoManager.add();
                if($j(par).is("ul")){
                    //already a list, unindent
                    ed.execCommand("mceOutdent");
                }else if($j(par).is("ol")){
                    //already a list, but wrong type
                    var b = ed.selection.getBookmark(BOOKMARKTYPE);
                    var ul = this.getSelectionParent("ol");
                    var ol = ed.getDoc().createElement('ul');
                    $j(ol).append($j(ul).contents());
                    ul.parentNode.insertBefore(ol,ul);
                    ul.parentNode.removeChild(ul);
                    ed.selection.moveToBookmark(b);
                }else{
                    makeList("ul");
                }
                ed.undoManager.add();
                return true;
            }else if(cmd.indexOf("mceInsertOrderedList") == 0){
                ed.undoManager.add();
                if($j(par).is("ol")){
                    //already a list, unindent
                    ed.execCommand("mceOutdent");
                }else if($j(par).is("ul")){
                    //already a list, but wrong type
                    var b = ed.selection.getBookmark(BOOKMARKTYPE);
                    var ul = this.getSelectionParent("ul");
                    var ol = ed.getDoc().createElement('ol');
                    $j(ol).append($j(ul).contents());
                    ul.parentNode.insertBefore(ol,ul);
                    ul.parentNode.removeChild(ul);
                    ed.selection.moveToBookmark(b);
                }else{
                    makeList("ol");
                }
                ed.undoManager.add();
                return true;
            }

            return false;
        },

        getRangeParent: function(rng, selector){
            return this.ed.dom.getParent(rng.commonAncestorContainer, selector);
        },

        getSelectionParent: function(selector){
            return this.getRangeParent(this.ed.selection.getRng(true), selector);
        },

        cleanList : function(ed, n){
            var that = this;
            this._stripStyleAndMetaTags(ed, n);
            this._wrapListChildren(ed, n);
            if(n.nodeType != 1) return;
            $j.each(n.childNodes, function() {
                that.cleanList(ed, this);
            });
        },

        // Remove any <meta/> and <style/> tags from inside lists.
        _stripStyleAndMetaTags : function(ed, n) {
            if(n.nodeType != 1) return;
            $j.each(n.childNodes, function() {
                if(this.nodeType &&
                    this.nodeType != 1 && this.nodeType != 3 ||
                    this.nodeType == 1 && (this.nodeName.toLowerCase() == "meta" || this.nodeName.toLowerCase() == "style")) {
                    n.removeChild(this);
                }
            });
        },

        // If there are any element or text nodes in a list that are not inside
        // an <li/> tag then create an <li/> tag for them.  Exceptions are
        // nested lists and empty text nodes.
        _wrapListChildren : function(ed, n){
            $j(n).filter('ul, ol')
            .each(function() {
                var list = this;
                $j.each(this.childNodes, function() {
                    var li;

                    // Remove empty text nodes.
                    if (this.nodeType == 3 && $j.trim(this.nodeValue) === '') {
                        list.removeChild(this);

                    // Wrap element nodes and text nodes.
                    } else if (this.nodeType == 3 || (this.nodeType == 1 && !$j(this).is('li, ul, ol'))) {
                        li = ed.getDoc().createElement('li');
                        list.insertBefore(li, this);
                        li.appendChild(this);
                    }
                });
            });
        },

        listTypeToStyle: function(l){
            if(!l || !l.nodeName || !/[uo]l/i.test(l.nodeName)){
                return;
            }
            var ed = tinyMCE.activeEditor;

            var type = l.getAttribute("type");
            var style = null;
            switch(type){
                case "1":
                    style = "decimal";
                    break;
                case "A":
                    style = "upper-alpha";
                    break;
                case "a":
                    style = "lower-alpha";
                    break;
                case "I":
                    style = "upper-roman";
                    break;
                case "i":
                    style = "lower-roman";
                    break;
                default:
                    if(type && typeof(type) == "string"){
                        type = type.toLowerCase();
                        switch(type){
                            case "circle":
                            case "disc":
                            case "square":
                                style = type;
                                break;
                        }
                    }
                    break;
            }

            if(style){
                ed.dom.setStyle(l, "listStyleType", style);
            }
            l.removeAttribute("type");
        },

        init : function(ed, url){
            this.url = url;
            this.ed = ed;
            var t = this;
            this.index = 0;
            this.ol_styles = new Array();
            this.ol_styles.push(["default","", 0]);
            this.ol_styles.push(["d","decimal", 1]);
            if(!tinymce.isIE){
                this.ol_styles.push(["dz","decimal-leading-zero", 2]);
            }
            this.ol_styles.push(["ur","upper-roman", 3]);
            this.ol_styles.push(["lr","lower-roman", 4]);
            this.ol_styles.push(["ua","upper-alpha", 5]);
            this.ol_styles.push(["la","lower-alpha", 6]);

            if(!tinymce.isIE){
                this.ol_styles.push(["lg","lower-greek", 7]);
                this.ol_styles.push(["ki","katakana-iroha", 8]);
                this.ol_styles.push(["k","katakana", 9]);
                this.ol_styles.push(["hii","hiragana-iroha", 10]);
                this.ol_styles.push(["hi","hiragana", 11]);
                this.ol_styles.push(["ci","cjk-ideographic", 12]);
                this.ol_styles.push(["g","georgian", 13]);
                this.ol_styles.push(["a","armenian", 14]);
                this.ol_styles.push(["he","hebrew", 15]);
            }

            this.ul_styles = new Array();
            this.ul_styles.push(["default","", 0]);
            this.ul_styles.push(["di","disc", 1]);
            this.ul_styles.push(["c","circle", 2]);
            this.ul_styles.push(["s","square", 3]);



            ed.onBeforeSetContent.add(function(ed, o) {
                if(tinymce.isIE){
                    o.content = o.content.replace(/<br\/><\/li>/g, '</li>');
                }
            });

            ed.onSetContent.add(function(){
                t.fixListTypes();
            });

            ed.onNodeChange.add(function(ed){
                if(this.initialized){
                    var node = ed.selection.getNode();
                    var n = ed.dom.getParent(node, "ul,ol");
                    if(n){
                        this.fixLists(ed);
                        var that = this;
                        ed.undoManager.transparentChange(function(){
                            that.cleanList(ed, n);
                        });
                    }
                }
            }, this);

            this.onBeforeFixLists = new tinymce.util.Dispatcher();
            this.onAfterFixLists = new tinymce.util.Dispatcher();

            this.initialized = false;


            ed.onBeforeGetContent.add(function() {
                if(this.initialized){
                    this.fixLists(tinymce.activeEditor);
                }
            }, this);


            ed.onInit.add(function() {
                this.initialized = true;
                if(ed.plugins.paste){
                    ed.plugins.paste.onPostProcess.add(function(){
                        this.fixLists(ed);
                    }, this);
                }

                if(ed.plugins.jivecontextmenu){
                    var contextMenu = ed.plugins.jivecontextmenu;

                    function makeMenuItems(styles, listType){
                        listType = listType.toUpperCase();
                        var defaultX, defaultY, xOffset, yOffset;
                        if(listType == "UL"){
                            defaultX = 288;
                            defaultY = 0;
                            xOffset = 81;
                            yOffset = 158;
                        } else if(listType == "OL"){
                            defaultX = 260;
                            defaultY = 0;
                            xOffset = 81;
                            yOffset = 135;
                        }

                        var ret = [];
                        for(var i = 0; i < styles.length; ++i){
                            var styleName = styles[i][0];
                            //ol starts at 81,135
                            //ul starts at 81,158
                            //all 28x22
                            var x = i == 0 ? defaultX : xOffset + (styles[i][2]-1) * 28;
                            var y = i == 0 ? defaultY : yOffset;
                            ret.push(new contextMenu.MenuItem(styleName + "ListStyle", null, ed.getLang("jivelists." + styleName), {
                                url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/iconmaster.gif",
                                xOffset: x,
                                yOffset: y,
                                width: 28,
                                height: 23
                            }, "mce" + listType + "ListStyle" + i));
                        }
                        return ret;
                    }

                    var ulStyleItems = makeMenuItems(this.ul_styles, "UL");
                    var ulMenu = new contextMenu.Menu(ulStyleItems, true, true, ed.getLang("jivelists.list_style_hdr"));
                    var ulItem = new contextMenu.MenuItem("ulItem", /ul/i, null, {
                            url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/iconmaster.gif",
                            xOffset: 288,
                            yOffset: 0,
                            width: 28,
                            height: 23
                        }, ulMenu);
                    contextMenu.addRootItem(ulItem);

                    var olStyleItems = makeMenuItems(this.ol_styles, "OL");
                    var olMenu = new contextMenu.Menu(olStyleItems, true, true, ed.getLang("jivelists.list_style_hdr"));
                    var olItem = new contextMenu.MenuItem("olItem", /ol/i, null, {
                            url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/iconmaster.gif",
                            xOffset: 260,
                            yOffset: 0,
                            width: 28,
                            height: 23
                        }, olMenu);
                    contextMenu.addRootItem(olItem);

                }
                if (ed.plugins.contextmenu) {
                    ed.plugins.contextmenu.onContextMenu.add(function(th, m, e) {
                        var sm, par, last, list, i, clz;

                        par = ed.dom.getParent(e, 'ol, ul');
                        if (par && par.nodeName.toLowerCase() == "ol"){
                            last = ed.dom.getParent(e, function(x){
                                return $def(x.tagName) && x.tagName.toLowerCase() == "ol" && x != par;
                            });

                            m.addSeparator();
                            sm = m.addMenu({title : 'jivelists.list_style', max_height : "200", 'class' : 'mceDropDown defaultSkin mceMacroMenu mceListBoxMenu'});
                            list = ed.plugins.jivelists.ol_styles;
                            for(i=0;i<list.length;i++){
                                if(last != null || last == null && list[i][0] != "inherit"){
                                    clz = "";
                                    if(par.style.listStyleType == list[i][1]){
                                        clz = "mceMenuItemSelected";
                                    }else{
                                        clz = "";
                                    }
                                    sm.add({title : 'jivelists.' + list[i][0], cmd : 'mceOLListStyle' + i, 'class' : clz});
                                }
                                if(i == 2){
                                    sm.addSeparator();
                                }
                            }

                        }else if(par && par.nodeName.toLowerCase() == "ul"){
                            last = ed.dom.getParent(e, function(x){
                                return $def(x.tagName) && x.tagName.toLowerCase() == "ul" && x != par;
                            });

                            m.addSeparator();
                            sm = m.addMenu({title : 'jivelists.list_style', max_height : "200", 'class' : 'mceDropDown defaultSkin mceMacroMenu mceListBoxMenu'});
                            list = ed.plugins.jivelists.ul_styles;
                            for(i=0;i<list.length;i++){
                                if(last != null || last == null && list[i][0] != "inherit"){
                                    clz = "";
                                    if(par.style.listStyleType == list[i][1]){
                                        clz = "mceMenuItemSelected";
                                    }else{
                                        clz = "";
                                    }
                                    sm.add({title : 'jivelists.' + list[i][0], cmd : 'mceULListStyle' + i, 'class' : clz});
                                }
                                if(i == 2){
                                    sm.addSeparator();
                                }
                            }

                        }
                    });
                }
            }, this);


            this.prepForEnter = false;
            this.prepForDel = false;

            ed.onKeyDown.addToTop(function(ed, e) {
                this.prepForEnter = false;
                this.prepForDel = false;
                this.prepForDelB = false;

                var isEffectivelyEmpty = ed.selectionUtil.isEffectivelyEmpty;

                var rng;
                var sel = ed.selection;
                var li = ed.dom.getParent(sel.getNode(), 'li');
                var list = ed.dom.getParent(sel.getNode(), 'ul,ol');
                if(e.keyCode == 8 && sel.isCollapsed() && li){ // backspace key
                    var isFrontOfLi = ed.selectionUtil.atStartOf(li) || isEffectivelyEmpty(li);
                    if(li != null && li.nodeType == 1 && list != null && isFrontOfLi) {
                        this.prepForDel = true;
                        ed.execCommand("mceOutdent");

                        if(list.parentNode && !list.firstChild){
                            //remove empty list
                            list.parentNode.removeChild(list);
                        }

                        tinymce.dom.Event.cancel(e);
                        return false;
                    }
                } else if(e.keyCode == 46 && sel.isCollapsed()){ // delete key
                    function getNextBlock(n) {
                        var nextSib = n.nextSibling;
                        while (nextSib) {
                            var sibName = nextSib.nodeName.toLowerCase();
                            if(sibName == "ul" || sibName == "ol"){
                                //keep looking for a list item
                                nextSib = nextSib.firstChild;
                            }else if(sibName == "table"){
                                //we don't want to deal with tables
                                return null;
                            }else if (ed.dom.isBlock(nextSib)) {
                                //found a reasonable block element
                                return nextSib;
                            }else{
                                return null; //unexpected document format; bail out
                            }
                        }
                        //couldn't find a subsequent block sibling or sibling-descendent.  Look for parent's next sibling
                        if(n.nodeName.toLowerCase() != "body"){
                            return getNextBlock(n.parentNode);
                        }
                        //reached the end of the document
                        return null;
                    }

                    function removeTrailingBr(n){
                        while(n.lastChild && n.lastChild.nodeName.toLowerCase() == "br"){
                            n.removeChild(n.lastChild);
                        }
                    }

                    if(li != null ){
                        var isEndOfLi = ed.selectionUtil.atEndOf(li) || isEffectivelyEmpty(li);
                        if(li.nodeType == 1 && list != null && isEndOfLi) {
                            ed.undoManager.add();
                            //find the next block, reparent its contents into this LI, and remove it.
                            var nextBlock = getNextBlock(li);
                            if(nextBlock){
                                removeTrailingBr(li);
                                this.reparentChildren(li, nextBlock);
                                nextBlock.parentNode.removeChild(nextBlock);
                            }
                            this.prepForDel = true;
                            ed.undoManager.add();
                            tinymce.dom.Event.cancel(e);
                            return false;
                        }
                    }else{
                        //not in a li.  We may be at the end of a p tag that precedes list though.
                        var blockContainer = ed.dom.getParent(sel.getNode(), function(n){
                            return ed.dom.isBlock(n);
                        });
                        if(blockContainer){
                            nextBlock = getNextBlock(blockContainer);
                            if(nextBlock && (ed.selectionUtil.atEndOf(blockContainer) || isEffectivelyEmpty(blockContainer))){
                                ed.undoManager.add();
                                var bm = ed.selection.getBookmark();
                                removeTrailingBr(blockContainer);
                                this.reparentChildren(blockContainer, nextBlock);
                                var par = nextBlock.parentNode;
                                nextBlock.parentNode.removeChild(nextBlock);
                                while(isEffectivelyEmpty(par)){
                                    var old = par;
                                    par = par.parentNode;
                                    par.removeChild(old);
                                }

                                this.prepForDel = true;
                                ed.selection.moveToBookmark(bm);
                                ed.undoManager.add();
                                tinymce.dom.Event.cancel(e);
                                return false;
                            }
                        }
                    }
                }else if(e.keyCode == 13 && e.shiftKey){ //shift-enter
                    // shift enter, so put in a <br>
                    var block = li ? li : ed.dom.getParent(sel.getNode(), function(n){return ed.dom.isBlock(n);});
                    rng = sel.getRng(true);
                    if(rng.collapsed){
                        this.prepForEnter = true;

                        ed.undoManager.add();
                        var br = ed.getDoc().createElement('br');
                        rng.insertNode(br);
                        rng.setStart(block, ed.dom.nodeIndex(br)+1);
                        rng.collapse(true);
                        sel.setRng(rng);
                        if(tinymce.isWebKit && ed.selectionUtil.atEndOf(block)){
//                            console.log("making shim");
                            block.appendChild(ed.getDoc().createElement('br')); //this makes the new line take up space
                        }

                        ed.undoManager.add();
                        tinymce.dom.Event.cancel(e);
                        return false;
                    }
                }else if(e.keyCode == 9 && !e.ctrlKey && !e.altKey){
                    var p = ed.dom.getParent(ed.selection.getNode(), 'table,ul,ol');
                    if(p != null && p.nodeName.toLowerCase() != "table"){
                        try{
                            if(e.shiftKey){
                                ed.execCommand("mceOutdent");
                            }else{
                                ed.execCommand("mceIndent");
                            }
                        }catch(ex){ }
                        return tinymce.dom.Event.cancel(e);
                    }
                }
            }, this);
            ed.onKeyPress.add(function(ed, e) {
                if((e.keyCode == 8 || e.keyCode == 46) && this.prepForDel){
                    tinymce.dom.Event.cancel(e);
                    return false;
                }
                if(e.keyCode == 13 && this.prepForEnter){
                    tinymce.dom.Event.cancel(e);
                    return false;
                }
                if(e.keyCode == 9 && !e.ctrlKey && !e.altKey){
                    var p = ed.dom.getParent(ed.selection.getNode(), 'table,ul,ol');
                    if(p != null && p.nodeName.toLowerCase() != "table"){
                        tinymce.dom.Event.cancel(e);
                        return false;
                    }
                }
            }, this);
            ed.onKeyUp.add(function(ed, e) {
                if((e.keyCode == 8 || e.keyCode == 46) && this.prepForDel){
                    tinymce.dom.Event.cancel(e);
                    return false;
                }
                if(e.keyCode == 13 && this.prepForEnter){
                    tinymce.dom.Event.cancel(e);
                    return false;
                }
            }, this);
        },

        getInfo : function() {
            return {
                longname : 'Jive Lists',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
        },

		createControl: function(n, cm) {
			return null;
		}
    });
	// Register plugin
	tinymce.PluginManager.add('jivelists', tinymce.plugins.JiveListsPlugin);
})();
