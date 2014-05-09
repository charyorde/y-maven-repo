(function() {
    var reWhiteSpace = new RegExp(/^[\s\f\n\r\t\v\u00A0\u2028\u2029\u0240]$/);

    tinymce.create('tinymce.plugins.JiveMacrosPlugin', {


        _cache : new jive.ext.y.HashTable(),

        cache : function(id, url, title, type){
            var type_cache = this._cache.get(type);
            if(!type_cache){
                type_cache = new jive.ext.y.HashTable();
                this._cache.put(type, type_cache);
            }
            type_cache.put(id, [title,url]);
        },

        getTitleFor : function(type, id){
            var type_cache = this._cache.get(type);
            if(!type_cache) return false;
            return type_cache.get(id);
        },

        /**
         * This function will delete the macro from the document
         * @param ed
         * @param node
         */
        deleteMacro : function(ed, node){
            if(window.jiveRTE && window.jiveRTE.macroEle){
                node = window.jiveRTE.macroEle;
                window.jiveRTE.macroEle = null;
            }
            //console.log('deleting macro ' + node.nodeName);
            if($def(ed) && $def(node)){
                if(node == ed.getBody()) return;
                var dom = new tinymce.dom.DOMUtils(ed.getBody());
                var par = dom.getParent(node, function(x){ return x == ed.getBody() || x != node; });
                if(this.isExactMacro(node)){
                    var macro = this.getMacroFor(node);
                    if(macro.getMacroType() == "INLINE"){
                        while(node.childNodes.length > 0){
                            var kid = node.removeChild(node.childNodes[0]);
                            par.insertBefore(kid, node);
                        }
                    }else if(macro.getMacroType() == "TEXT" || macro.getMacroType() == "INLINE"){
                        while(node.childNodes.length > 0){
                            var kid = node.removeChild(node.childNodes[0]);
                            if(kid.nodeType == 3){ // we only care about text nodes
                                var str = kid.nodeValue;
                                while(str.indexOf("\n") >= 0){
                                    var p = ed.getDoc().createElement('P');
                                    p.appendChild(ed.getDoc().createTextNode(str.substr(0, str.indexOf("\n"))))
                                    par.insertBefore(p, node);
                                    if(str.length > str.indexOf("\n")+1){
                                        str = str.substr(str.indexOf("\n")+1);
                                    }else{
                                        str = "";
                                    }
                                }
                                if(str.length > 0){
                                    var p = ed.getDoc().createElement('P');
                                    p.appendChild(ed.getDoc().createTextNode(str));
                                    par.insertBefore(p, node);
                                }
                            }else{
                                par.insertBefore(kid, node);
                            }
                        }
                    }
                    par.removeChild(node);
                }else{
                    this.deleteMacro(ed, par);
                }
                return;
            }

            var ed = tinyMCE.activeEditor;
            var sel = ed.selection;
            this.deleteMacro(ed, sel.getNode());
        },

        getNextSibling : function(ed, node){
            if(node == null) return node;
            if(node.nextSibling != null) return node.nextSibling;
            if(node == ed.getBody() && node.nextSibling == null) return null;
            return this.getNextSibling(ed, this.getParentNode(ed, node));
        },

        getParentNode : function(ed, node){
            return (new tinymce.dom.DOMUtils(ed.getDoc())).getParent(node, function(x){ return x == ed.getBody() || x != node; });
        },

        /**
         * in a DOM tree, will return an array of two
         * nodes that are siblings and possibly parents
         * of the input nodes
         *
         * example:
         * body
         *  - div
         *     - p
         *       - node 1
         *  - pre
         *    - node 2
         *
         * [div, pre] will be returned
         * @param start must be a younger node than end
         * @param end must be an older node than start
         * @param doc the document that contains start/end
         */
        ageTheNodes : function(start, end, doc){
            /**
             * Given a node, called `niece`, returns a node that is a sibling
             * of an ancestor of `niece` that is also an ancestor of
             * `daughter`.  In other words, returns an aunt of `niece` or
             * possibly a grand-aunt, or a grand-grand-aunt, etc.
             *
             * For purposes of this function "ancestor" is generalized to
             * include parents of a node and the node itself.  So in some cases
             * the returned aunt may actually be the given `daughter`; and the
             * returned aunt may by a 0-level aunt of the given niece - in
             * other words a sibling.
             */
            function auntOf(niece, daughter) {
                return $j(daughter).parents().andSelf().filter(function() {
                    var isAunt = $j(this).parent().has(niece).length > 0,
                        isCommonAncestor = $j(this).has(niece).length > 0;
                    return isAunt && !isCommonAncestor;
                }).get(0);
            }

            var leftAunt = auntOf(end, start),
                rightAunt = auntOf(start, end);

            return [leftAunt, rightAunt];
        },

        shouldEndLine : function(node){
            if(node.nodeType != 3 && (node.tagName.toLowerCase() == "div" ||
                                      node.tagName.toLowerCase() == "p" ||
                                      node.tagName.toLowerCase() == "pre" ||
                                      node.tagName.toLowerCase() == "br")){
                return true;
            }
            return false;
        },

        applyParameterSet : function(node, macro, paramSet){
            if(this.isMacro(node)){
                if(paramSet.deleteAll){
                    // delete all the macro parameters in the node
                    var params = macro.getAllowedParameters();
                    for(var i=0;i<params.length;i++){
                        node.removeAttribute("_" + params[i].name);
                    }
                }

                for(var i=0;i<paramSet.params.length;i++){
                    node.setAttribute("_" + paramSet.params[i].name, paramSet.params[i].value);
                }
                this.removeDuplicateMacros(tinyMCE.activeEditor, false, this.isMacro(node));
            }
        },

        buildMacro :function(macro, paramSet, customImage){
            if(!$def(paramSet)){
                paramSet = 0;
            }
            var ed = tinyMCE.activeEditor;
            var sel = ed.selection;
            var doc = ed.getDoc();
            var name = macro.getName();
            var pre;
            var collapsed = sel.isCollapsed();
            if(macro.getMacroType() == "TEXT"){
                pre = doc.createElement('pre');
                pre.setAttribute("class", "jive_text_macro jive_macro_" + name);
                pre.className = "jive_text_macro jive_macro_" + name;
            }else if(macro.getMacroType() == "INLINE"){
                pre = doc.createElement("span");
                pre.appendChild(doc.createTextNode(name));
                pre.setAttribute("class", "jive_macro jive_macro_" + name);
                pre.className = "jive_macro jive_macro_" + name;
            }else{
                pre = doc.createElement("img");
                pre.setAttribute("class", "jive_macro jive_macro_" + name);
                pre.className = "jive_macro jive_macro_" + name;
                var src = window.parent.CS_RESOURCE_BASE_URL + "/images/tiny_mce3/plugins/jiveemoticons/images/spacer.gif";
                if (!customImage) {
                    pre.setAttribute('src',src);
                    pre.setAttribute('data-mce-src',src);
                }
                else {
                    pre.setAttribute('src',customImage);
                    pre.setAttribute('data-mce-src',customImage);
                }
            }
            pre.setAttribute("jivemacro", name);
            var par;
            var theStart = null;

            if(!collapsed && macro.getMacroType() == "TEXT"){
                //Wrap the selection with the pre.
                var rng = sel.getRng(true);
                rng = ed.selectionUtil.splitAtEndpoints(rng);
                rng.surroundContents(pre);
            } else {
                collapsed = true;
                par = this.getParentNode(ed, sel.getNode());
                theStart = sel.getNode();
                if (par == theStart) {
                    theStart = null;
                }
            }

            if(macro.getMacroType() == "TEXT" && pre.childNodes.length == 0){
                pre.appendChild(this.createEmptyPara());
                if(tinymce.isIE && !tinymce.isIE9){
                    pre.firstChild.innerHTML = "\ufeff";
                    sel.setNode(pre.firstChild);
                    sel.collapse(true);
                }
            }

            // now apply the preset, if any
            if(paramSet != null && paramSet >= 0){
                var paramSets = macro.getParameterSets();
                if(paramSet < paramSets.length){
                    var paramSet = paramSets[paramSet];
                    this.applyParameterSet(pre, macro, paramSet);
                }
            }

            return pre;
        },

        insertMacro : function(ed, macro, paramSet, customImage){
            var collapsed = ed.selection.isCollapsed();
            var pre = this.buildMacro(macro, paramSet, customImage);
            var ele = ed.selection.getNode();
            if(collapsed){
                if(macro.getMacroType().toLowerCase() == "text") {
                    var rng = ed.selection.getRng(true);
                    var blockContainerSelector = "body, td, th, pre, li";
                    while(!ed.dom.is(rng.startContainer, blockContainerSelector)) {
                        rng = ed.selectionUtil.splitAtEndpoints(rng, blockContainerSelector);
                    }
                    rng.surroundContents(pre);

                    if(pre.childNodes.length == 0){
                        pre.appendChild(this.createEmptyPara());
                    }

                    rng.setStart(pre, 0);
                    rng.collapse(true);
                    ed.selection.setRng(rng);
                }else{
                    pre.setAttribute("id", "__sel_me__");
                    ed.selection.setNode(pre);
                    pre = ed.getDoc().getElementById("__sel_me__");
                    pre.removeAttribute("id");
                }
            }
            this.removeDuplicateMacros(ed, false, pre);
            // clean up
            this.fixBodyParagraphs();


            if(pre.childNodes.length && pre.parentNode && macro.getMacroType().toLowerCase() == "text"){
                rng = ed.dom.createRng();
                var lastNode = pre;
                do{
                    lastNode = lastNode.childNodes[lastNode.childNodes.length-1];
                }while(lastNode.nodeType == 1 && lastNode.childNodes.length);
                rng.setStart(lastNode.parentNode, lastNode.childNodes.length); // end of last node in pre
                rng.collapse(true);
                ed.selection.setRng(rng);
                ed.selectionUtil.normalizeSelection();
                window.focus();
                ed.focus();

//                console.log(lastNode);
            }
            return pre;
        },

        execCommand : function(cmd, ui, val){
            var ed = tinyMCE.activeEditor, macro, paramSet;
            if(cmd.indexOf("mceMacroParamSet") == 0){
                ed.undoManager.add();
                var indexes = cmd.substr("mceMacroParamSet".length);
                macro = parseInt(indexes.substr(0,indexes.indexOf("_")));
                var param = parseInt(indexes.substr(indexes.indexOf("_") + 1));
                paramSet = jive.rte.macros[macro].getParameterSets()[param];

                var n = ed.selection.getNode();
                var macroEle = ed.dom.getParent(n, function(ele){
                    return $def(ele.attributes["jivemacro"]);
                });
                if(macroEle != null){
                    this.applyParameterSet(macroEle, jive.rte.macros[macro], paramSet);
                    ed.selection.select(macroEle);
                }
                return true;
            }else if(cmd.indexOf("mceAddJiveMacro") == 0){
                ed.undoManager.add();
                var index = cmd.substr("mceAddJiveMacro".length);
                paramSet = 0;
                var under = index.indexOf("_");
                if(under >= 0){
                    paramSet = parseInt(index.substr(under+1));
                    index = parseInt(index.substr(0,under));
                }else{
                    index = parseInt(index);
                }
                macro = jive.rte.macros[index];

                if(macro.getUrl().length > 0){
                    window.jiveRTE = { macro: macro, paramSet: paramSet};
                    ed.windowManager.open({
                        url : CS_BASE_URL + macro.getUrl(),
                        width : 500,
                        height : 400,
                        inline : 1
                    }, window.jiveRTE);
                }else{
                    ed.plugins.jivemacros.insertMacro(ed, macro, paramSet);
                }
                ed.undoManager.add();
                return true;
            }
            return false;
        },

        isFirst : function(par, ele){
            if(par.childNodes.length == 0) return false;
            return (par.childNodes[0] == ele || this.isFirst(par.childNodes[0], ele));
        },

        isLink : function(ele){
            if(ele == null || ele.nodeName.toLowerCase() == "body") return false;
            // make sure it's an object and not a text node
            if($def(ele) &&
               $obj(ele) &&
               ele != null &&
               $def(ele.nodeType) &&
               ele.nodeType != 3){
                if(ele.nodeName.toLowerCase() == "a"){
                    return ele;
                }else{
                    return this.isLink(ele.parentNode);
                }

            }
            return false;
        },

        /**
         * checks if the input element, or any of its parents is a macro
         * @param ele
         */
        isMacro : function(ele){
            while(ele != null && $obj(ele)){
                if(ele.nodeName.toLowerCase() == "body") return false;
                // make sure it's an object and not a text node
                if($def(ele.nodeType) && ele.nodeType == 1 && $def(ele.attributes["jivemacro"])){
                    return ele;
                }
                ele = ele.parentNode
            }
            return false;
        },

        /**
         * checks if the input element is a macro,
         * but doesn't check any of its parents
         * @param ele
         */
        isExactMacro : function(ele){
            if(ele == null || ele.nodeName.toLowerCase() == "body") return false;
            // make sure it's an object and not a text node
            if(ele != null &&
               $obj(ele) &&
               $def(ele.nodeType) &&
               ele.nodeType == 1){ // elements only
                if(ele.nodeName.toLowerCase() == "pre"){
                    return ele;
                }else if($def(ele.attributes["jivemacro"])){
                    return ele;
                }else{
                    return false;
                }

            }
            return false;
        },

        getMacroFor : function(ele){
            var mac = this.isMacro(ele);
            if(mac){
                var name = mac.attributes["jivemacro"].nodeValue;
                return tinymce.activeEditor.plugins.jiveutil.findMacro(name);
            }
            if(ele.nodeName.toLowerCase() == "pre"){
                return tinymce.activeEditor.plugins.jiveutil.findMacro("quote");
            }
            return null;
        },

        createMozBR : function(){
            var dom = tinymce.activeEditor.dom;
            return dom.create("br", {
                "_moz_dirty": "",
                "type": "_moz"
            });
        },

        createEmptyPara : function(){
            var ed = tinymce.activeEditor;
            var dom = ed.dom;
            var p = dom.create("p", {}, tinymce.isIE ? "" : "<br _moz_dirty='' type='_moz' />");
            if(tinymce.isIE9){
                p.appendChild(ed.getDoc().createTextNode(""));
            }
            return p;
        },

        findLastKid : function(ele){
            if(ele.nodeType == 3) return null;
            if(ele.childNodes.length == 0) return null;
            if(this.isMacro(ele)
                       || $def(ele.tagName) && ele.tagName.toLowerCase() == "table"
                       || $def(ele.tagName) && ele.tagName.toLowerCase() == "pre"){
                return ele;
            }
            return this.findLastKid(ele.childNodes[ele.childNodes.length - 1]);
        },


        isBR : function(ele){
            if(ele.nodeType == 3) return false;
            return ele.nodeName.toLowerCase() == "br";
        },

        /**
         * converts <br><br> to <p></p>
         * also removes empty list nodes. the two possible cases need to be handled differently:
         * p
         *  - text
         *  - <br>
         *  - <br>
         *  - text
         * non p tag (like <body>)
         *  - text
         *  - <br>
         *  - <br>
         *  - text
         * @param ed
         * @param ele
         */
        convertDoubleLineBreaksToParagraphs : function(ed, ele){
            if(ele.nodeType != 1) return; // ignore non-Element elements
            if(!ed.dom.isBlock(ele) && ele.nodeName.toLowerCase() != "body") return;
            if(ele.nodeName.toLowerCase() == "pre") return;
            if(this.isExactMacro(ele)) return;
            var br2;
            if(ele.childNodes.length > 0){
                br2 = ele.childNodes[ele.childNodes.length-1];
            }
            for(var i=0;i<ele.childNodes.length - 1;i++){ // go until - 1, b/c we're checking for 2 <br>'s in a row
                var br1 = ele.childNodes[i];
                br2 = ele.childNodes[i+1];
                if(br1.nodeType == 1 && (br1.nodeName.toLowerCase() == "title" ||
                        br1.nodeName.toLowerCase() == "meta" ||
                        br1.nodeName.toLowerCase() == "colgroup")){
                    ele.removeChild(br1);
                    i--;
                }else if(br1.nodeType == 1 && (br1.nodeName.toLowerCase() == "ol" || br1.nodeName.toLowerCase() == "ul")){
                    if(br1.childNodes.length == 0){
                        ele.removeChild(br1);
                        i--;
                    }
                }else if(br2.nodeType == 1 && (br2.nodeName.toLowerCase() == "ol" || br2.nodeName.toLowerCase() == "ul")){
                    if(br2.childNodes.length == 0){
                        ele.removeChild(br2);
                        i--;
                    }
                }else if(this.isBR(br1) && this.isBR(br2)){
                    var li = ed.dom.getParent(br1, "li");
                    if(li == null){ // don't fix linebreaks in lists
                        // copy the node type of the above node
                        var par = br1.parentNode;
                        var body = par.parentNode;
                        i--;
                        if(par.nodeName.toLowerCase() != "p"){
                            par = br1;
                            body = par.parentNode;
                            var newpar = this.createEmptyPara();
                            this.insertAfter(body, newpar, par);
                            br1.parentNode.removeChild(br1);
                            br2.parentNode.removeChild(br2);
                            br2 = newpar;
                        }else{
                            var newp = ed.getDoc().createElement('p');
                            while(br2.nextSibling != null){
                                newp.appendChild(br2.nextSibling);
                            }
                            this.insertAfter(body, newp, par);
                            this.insertAfter(body, this.createEmptyPara(), par);
                            br1.parentNode.removeChild(br1);
                            br2.parentNode.removeChild(br2);
                            br2 = newp;
                        }
                    }
//                }else if(this.isBR(br1) && br1.parentNode.nodeName.toLowerCase() == "body"){
//                    this.insertAfter(br1.parentNode, this.createEmptyPara(), br1);
//                    br1.parentNode.removeChild(br1);
                }else{
                    this.convertDoubleLineBreaksToParagraphs(ed, br1);
                }
            }
            if($def(br2)){
                this.convertDoubleLineBreaksToParagraphs(ed, br2);
            }
        },

        /**
         * debugging helper function
         *
         * this function will return an XML string
         * representation of the input node. nodes
         * reporting an incorrect parent node will
         * be wrapped in <error> tags
         * @param n
         * @param indent
         */
        toXML : function(n, indent){
            if(n.nodeType == 3) return n.nodeValue + "\n";
            var ret = "";
            if(n.nodeName.toLowerCase() == "br"){
                for(var j=0;j<indent;j++) ret += "  ";
                return ret + "<BR>\n";
            }
            for(var j=0;j<indent;j++) ret += "  ";
            ret += "<" + n.nodeName + ">\n";
            for(var i=0;i<n.childNodes.length;i++){
                var invalidParent = (n != n.childNodes[i].parentNode);
                if(invalidParent) ret +="<error>\n";
                ret += this.toXML(n.childNodes[i], indent+1);
                if(invalidParent) ret += "</error>\n";
            }
            for(var j=0;j<indent;j++) ret += "  ";
            ret += "</" + n.nodeName + ">\n";
            return ret;
        },

        /**
         * clones an element and attributes,
         * but does not clone kids
         *
         * currently unused
         *
         * @param n
         */
        cloneNodeWithoutKids : function(n){
            var doc = n.ownerDocument;
            var ret = doc.createElement(n.nodeName);
            for(var i=0;i<n.attributes.length;i++){
                if(n.attributes[i].value != null){
                    ret.setAttribute(n.attributes[i].name, n.attributes[i].value);
                }
            }
            return ret;
        },

        /**
         * the DOM in IE can actually be inherently invalid.
         * for instance:
         *   node.childNodes[0].parentNode == node can be false
         *
         * this means that nodes can show up as children to a
         * node, when in fact they are not. this function
         * "removes" those nodes as children if the parentNode
         * does not match
         *
         * this function is not currently used. i can't get
         * i've tried just about everything to get IE to
         * stop showing these phantom children...
         *
         * @param n the node to santize, usually the <body>
         */
        sanitizeXML : function(n){
            if(n.nodeType != 1) return; // only sanitize elements
            var fixIt = false;
            var realKids = [];
            for(var i=0;i<n.childNodes.length;i++){
                if(n != n.childNodes[i].parentNode){
                    fixIt = true;
                }else{
                    realKids.push(n.childNodes[i]);
                    this.sanitizeXML(n.childNodes[i]);
                }
            }
            if(n.nodeName.toLowerCase() != "body"){
                try{
//                    console.log("trying to fix it");
                    var temp = this.cloneNodeWithoutKids(n);
                    for(var i=0;i<realKids.length;i++){
                        temp.appendChild(realKids[i]);
                    }
                    n.parentNode.insertBefore(temp, n);
                    n.parentNode.removeChild(n);
//                    console.log("success? " + realKids.length + " =? " + temp.childNodes.length);
                }catch(e){ console.log("error in fixIt: " + e.message); }
            }
        },
        fixBodyParagraphs : function(){
            var ed = tinyMCE.activeEditor;
            var body = ed.getBody();
            var se = ed.selection;
            var doc = ed.getDoc();

            //IE likes to have this annoying NBSP in empty docs, which causes several problems.
            //Replace IE's empty doc with our nice, well-behaved emptyPara.
            if(tinymce.isIE && body.innerHTML.toLowerCase() == "<p>&nbsp;</p>"){
                var that = this;
                ed.undoManager.transparentChange(function(){
                    body.appendChild(that.createEmptyPara());
                    body.removeChild(body.firstChild);
                });
                return;
            }

            this.convertDoubleLineBreaksToParagraphs(ed, body);
            var lastKid = this.findLastKid(body);
            if(body.childNodes.length > 0 && lastKid || body.childNodes.length == 0){
                body.appendChild(this.createEmptyPara());
            }

//            console.log("***************************");
//            console.log(this.toXML(body));
//            console.log("***************************");

            //Webkit tries to maintain the style of text that you move around by wrapping it in these spans.
            //Mostly, we want to get rid of them.  But if the span is the only element in a p, we should keep it.
            //This happens when we backspace at the start of a p: that p is removed, wrapped, and appended to the
            //previous block.  If the new parent isn't an empty p, then we should inherit its styles.
            $j("p .Apple-style-span:only-child", doc).filter(function(){
                return this.nextSibling == null && this.previousSibling == null;
            }).removeClass("Apple-style-span");

            var $appleStyleSpan =  $j(".Apple-style-span", doc);
            if($appleStyleSpan.length > 0){
                var bm = se.getBookmark();
                $appleStyleSpan.contents().unwrap(); //remove the span
                se.moveToBookmark(bm);
            }

            for(var i=0;i<body.childNodes.length;i++){
                var ele = body.childNodes[i];
                var tagName = ele.tagName;
                if(ele.nodeType >= 5){
                    ele.parentNode.removeChild(ele);
                    continue;
                }
                if(typeof(tagName) != "undefined"){
                    tagName = tagName.toLowerCase();
                    if (!tinymce.isIE){
                        if(ele.nodeType == 1 && tagName == "p"){
                            if(ele.childNodes.length == 0){
                                ele.appendChild(this.createMozBR(ed.getDoc()));
                            }
                        }
                    }
                }
                if(ele.nodeType == 3 || $j(ele).css("display") == "inline"){
                    if(ele.nodeType == 3 && (ele.nodeValue.length == 0 || reWhiteSpace.test(ele.nodeValue))){
                        // a single whitespace character, or empty text node. if a textnode is only a single white character,
                        // then the browser added it for kicks. whitespace by the user will either:
                        //  - already be in a <p> tag, so we won't see it here
                        //  - or will be longer than 1 character
                        ele.parentNode.removeChild(ele);
                        i--;
                    }else if((ele.nodeType == 3 && !reWhiteSpace.test(ele.nodeValue)) || (ele.nodeType != 3 && !ed.selectionUtil.isBookmark(ele))){ // ignore \n, it's from the raw HTML editor
                        //ele is a non-white-space text node, or a non-bookmark inline node

                        //first, note our position in a way we can find after moving nodes around.
                        var referenceNode = null;
                        var refNodeOffset = null;
                        var refNodeMoved = false;
                        if(this.typingInBody){
                            var rng = se.getRng(true);
                            if(rng.collapsed){
                                referenceNode = rng.startContainer;
                                if(referenceNode == body && rng.startOffset > 0){
                                    referenceNode = body.childNodes[rng.startOffset-1];
                                }else{
                                    refNodeOffset = rng.startOffset;
                                }
                            }
                        }

                        //create our new P tag
                        var p = ed.getDoc().createElement('p');
                        ed.getBody().insertBefore(p, ele);
                        i++;
                        //Move nodes into the P tag until after a BR, or we hit a non-inline element
                        do{
                            if(this.typingInBody && ele == referenceNode){
                                refNodeMoved = true;
                            }
                            p.appendChild(ele);
                            if(ele.nodeType == 1 && ele.nodeName.toLowerCase() == "br"){
                                break;
                            }
                            ele = null;
                            if(i < body.childNodes.length){
                                ele = body.childNodes[i];
                            }
                            i--;
                        }while(ele != null && (ele.nodeType == 3 || $j(ele).css("display") == "inline"));

                        //if we moved the reference node, restore the range.
                        if(refNodeMoved){
                            rng = se.getRng(true);
                            if(refNodeOffset != null){
                                rng.setStart(referenceNode, refNodeOffset);
                                rng.collapse(true);
                            }else{
                                rng.selectNode(referenceNode);
                                rng.collapse(false);
                            }
                            se.setRng(rng);
                        }
                    }
                }
            }

            if(typeof(this.typingInBody) != "undefined" && this.typingInBody){
                this.typingInBody = false;
            }
        },

        lastNodeChanged : null,

        lastScrollY : 0,

        /**
         * ensures that the last child node of a <p> is a <br>
         * for all non-IE browsers
         * @param n
         */
        ensureParaEndsWithBr : function(ed, node){
            if(tinymce.isIE) return;
            if(node.childNodes.length == 0){
                node.appendChild(this.createMozBR(ed.getDoc()));
            }else{
                var endsWithBr = false;
                var temp = node;
                while(!endsWithBr && temp.nodeType == 1 && temp.childNodes.length > 0){
                    var lastKid = temp.childNodes[temp.childNodes.length-1];
                    if(lastKid.nodeType == 1 && lastKid.nodeName.toLowerCase() == "br"){
                        endsWithBr = true;
                    }else{
                        temp = lastKid;
                    }
                }
                if(!endsWithBr){
                    node.appendChild(this.createMozBR(ed.getDoc()));
                }
            }
        },

        nodeChanged : function(ed, cm, node,collapse){
            if(node.nodeType == 1 && node.nodeName.toLowerCase() == "p"){
                this.ensureParaEndsWithBr(ed, node)
            }
            var macro = this.getMacroFor(node);
            if(cm.get('justifyleft')){
                if(macro != null){
                    cm.get('justifyleft').setDisabled(true);
                    cm.get('justifycenter').setDisabled(true);
                    cm.get('justifyright').setDisabled(true);
                    cm.get('justifyfull').setDisabled(true);
                }else{
                    cm.get('justifyleft').setDisabled(false);
                    cm.get('justifycenter').setDisabled(false);
                    cm.get('justifyright').setDisabled(false);
                    cm.get('justifyfull').setDisabled(false);
                }
            }

//            console.log('node changed!');
            ed.plugins.jivemacros.removeDuplicateMacros(ed, true, this.isMacro(node));
        },

        /**
         * Make sure the node has a UID, and that the UID is unique.  If that's not the case, correct the problem.
         * @param node The node to check
         * @return jQuery wrapper for node's popunder shadow element.
         */
        validateMacroElements: function(node){
            var macro = this.getMacroFor(node);
            if(!macro || !macro.usesCustomBackground()){
                return null;
            }

            var $rteNode = $j(node);
            var rte = this.rte;

            var $me = rte.getHiddenContainer();
            var uid = rte.getUIDForElement($rteNode);
            var $elementFor = rte.getRTEElementFor(uid);
            if(uid == null || $elementFor && $elementFor.length > 1){
                //there are 0 or more than 1 elements with the uid
                tinymce.activeEditor.undoManager.transparentChange(function(){
                    // make sure the element:
                    // (a) has an id and
                    // (b) it is unique
                    var $tofix;
                    if(uid == null){
                        //node has no UID, so we'll generate one and set it
                        $tofix = $rteNode;
                    }else{
                        //more than one node shares this UID.  Re-ID all but the first.
                        $tofix = $elementFor.filter(":gt(0)");
                        $tofix.removeClass("_jivemacro_uid" + uid);
                    }
                    $tofix.each(function(){
                        var newUid = rte.generateUID();
                        if(uid == null){
                            uid = newUid;
                        }
                        $j(this).addClass("_jivemacro_uid" + newUid)
                            .attr("_jivemacro_uid", newUid);
                        $me.append($j("<div id='" + newUid + "' class='richContent'></div>"));
                    });
                });
            }
            var $ret = $me.children("#" + uid);
            if($ret.length == 0){
                $ret = $j("<div id='" + uid + "' class='richContent'></div>");
                $me.append($ret);
            }
            return $ret;
        },

        /**
         * For each popunder shadow element, if it's RTE macro is gone, purge it from the dom and cache.
         * @param ed
         */
        removeDeletedMacros : function(ed){
            var rte = this.rte;
            if(rte != null && typeof(rte) == "object"){
                // move the container div "up" so that it lines up with how much they've scrolled
                var $me = rte.getHiddenContainer();
                var $body = $j(ed.getBody());
                $me.children(".richContent").each(function(){
                    var uid = this.id;
                    var $macro = $body.find("._jivemacro_uid" + uid);
                    if($macro.length == 0){
                        rte.removeMacroWithUID(uid);
                    }
                });
            }
        },

        fixEmptyTableCells: function(ed){
            var nodes, i, ele;
            var doc = ed.getDoc();
            if(!tinymce.isIE){
                nodes = doc.getElementsByTagName("td");
                for(i=0;i<nodes.length;i++){
                    ele = nodes[i];
                    if(ele.childNodes.length == 0){
                        ele.appendChild(this.createMozBR(doc));
                    }
                }
                nodes = doc.getElementsByTagName("th");
                for(i=0;i<nodes.length;i++){
                    ele = nodes[i];
                    if(ele.childNodes.length == 0){
                        ele.appendChild(this.createMozBR(doc));
                    }
                }
            }
            nodes = doc.getElementsByTagName("p");
            for(i=0;i<nodes.length;i++){
                nodes[i].style.height = "";
            }

        },

        /**
         * @param ed the Editor
         * @param refreshPositionOnly boolean if we should only refresh the position, or also the rich content
         * @param node if refreshPositionOnly is false, then this argument is the macro element that needs to be refreshed
         * @ids the macros that we've come across so far
         */
        removeDuplicateMacros : function(ed, refreshPositionOnly, node){
            this.removeDeletedMacros(ed);
            var selNode = ed.selection.getNode();
            var that = this;
            var nodes, i, ele;

            var rte = this.rte;
            if(rte != null && typeof(rte) == "object"){
                var nodesToCheck = $j(ed.getBody()).find(".jive_text_macro, .jive_macro");
                for(i=nodesToCheck.length;i>=0;i--){
                    ele = nodesToCheck[i];
                    if(this.isExactMacro(ele)){
                        var $rteEle = $j(ele);
                        var offset = $rteEle.offset();
                        var t = offset.top;
                        var l = offset.left;
                        var h = $rteEle.height();
                        var w = $rteEle.width();
                        var macro = that.getMacroFor(ele);
                        var newRenderedPos = t + "_" + l + "_" + w +"_" + h;

                        if($rteEle.data("renderedPosition") != newRenderedPos && macro != null ||
                                macro != null && !refreshPositionOnly ||
                                macro != null && macro.caresAboutChangeTo && macro.caresAboutChangeTo(rte, ele, selNode)){
                            if(ele.timeout){
                                continue;
                            }
                            var thunkForEle = function(ele, macro, $rteEle){ return function(){
                                ele.timeout = null;
                                var offset = $rteEle.offset();
                                var $ele = ed.plugins.jivemacros.validateMacroElements(ele);
                                if(!refreshPositionOnly && ele == node ||
                                        !$rteEle.data("hasRefreshed") ||
                                        macro.caresAboutChangeTo && macro.caresAboutChangeTo(rte, ele, selNode)){
                                    macro.refresh(rte, ele);
                                    $rteEle.data("hasRefreshed", true);
                                }else if(macro != null && macro.usesCustomBackground()){
                                    macro.refreshPosition(rte, ele, $ele, offset);
                                }
                            }}(ele, macro, $rteEle);
                            ele.timeout = thunkForEle;
                            setTimeout(thunkForEle, 10);
                            $rteEle.data("renderedPosition", newRenderedPos);
                        }else{
                            break;
                        }
                    }
                }
            }
        },

        collapseToStart : null,

        insertAfter : function(par, newNode, refNode) {
            if(refNode.nextSibling) {
                return par.insertBefore(newNode, refNode.nextSibling);
            } else {
                return par.appendChild(newNode);
            }
        },

        putCursorAfter : function(ed, node){
            var rng = ed.dom.createRng();
            if(node.nodeType == 3){
                rng.setStart(node, node.nodeValue.length);
                rng.collapse(true);
            }else if(node.nextSibling && node.nextSibling.nodeType == 3){
                rng.setStart(node.nextSibling, 0);
                rng.collapse(true);
            }else {
                var textStr = "";
                if(tinymce.isWebKit){
                    textStr = "\ufeff"; //BOM
                }
                var text = ed.getDoc().createTextNode(textStr);
                node.parentNode.insertBefore(text, node.nextSibling);
                rng.setStart(text, textStr.length);
                rng.collapse(true);
            }
            ed.selection.setRng(rng);
        },

        putCursorBefore : function(ed,node){
            if(node.previousSibling != null){
                var n = node.previousSibling;
                var selectionObject = ed.selection;
                var range;
                if (selectionObject.getSel().getRangeAt)
                    range = selectionObject.getSel().getRangeAt(0);
                else { // Safari!
                    range = document.createRange();
                    range.setStart(selectionObject.getSel().anchorNode,selectionObject.getSel().anchorOffset);
                    range.setEnd(selectionObject.getSel().focusNode,selectionObject.getSel().focusOffset);
                }
                var indx = 0;
                while(n.nodeType != 3 && n.nodeType == 1 && n.childNodes && n.childNodes.length != 0){
                    n = n.childNodes[n.childNodes.length -1];
                }

                if(n.nodeType == 3){
                    indx = n.nodeValue.length;
//                    console.log("selecting at " + indx);
//                    console.log(n);
                    range.setStart(n,indx);
                    range.setEnd(n,indx);
                    ed.selection.setRng(range);
                }else{
                    ed.selection.select(n);
                    ed.selection.collapse(true);
                }
                return;
            }
        },

        isLastNodeOf : function(sel, node, par){
            if(node.childNodes.length > 0 &&
               node.childNodes[node.childNodes.length-1].nodeType == 3 &&
               sel.getRng(true).startContainer != node.childNodes[node.childNodes.length-1]){
                return false;
            }
            if(node == par) return true;
            if(node.nextSibling != null) return false;
            return this.isLastNodeOf(node.parentNode, par);
        },

        isFirstNodeOf : function(sel, node, par){
            if(node.childNodes.length > 0 &&
               node.childNodes[0].nodeType == 3 &&
               sel.getRng(true).startContainer != node.childNodes[0]){
                return false;
            }
            if(node == par) return true;
            if(node.previousSibling != null) return false;
            return this.isLastNodeOf(node.parentNode, par);
        },

        killYourself : function(){
            clearInterval(this.intervalId);
        },

        setRTE : function(rte){
            this.rte = rte;
            this.completeInit();
        },

        completeInit : function() {
            if(this.ed && this.rte && !this.initialized){
                this.initialized = true;
                var that = this;
                var ed = this.ed;
                var rte = this.rte;

                if(ed.plugins.jivelists){
                    ed.plugins.jivelists.onBeforeFixLists.add(function(){
                        that.fixBodyParagraphs();
                    });
                }

                if(ed.plugins.paste){
                    ed.plugins.paste.onPasteComplete.add(function() {
                        that.fixBodyParagraphs();
                    });
                }

                setTimeout(function(){
                    that.intervalId = setInterval(function(){
                        try{
                            if (ed.destroyed) {
                                clearInterval(that.intervalId);
                                return;
                            }

                            if(ed.selection){
                                var node = ed.selection.getNode();
                                var y = ed.getWin().scrollY;
                                var theNode = that.isMacro(node);
                                if(node != that.lastNodeChanged && theNode){
                                    that.removeDuplicateMacros(ed, false, theNode);
                                }else if(y != that.lastScrollY){
                                    that.removeDuplicateMacros(ed, true);
                                }
                                that.lastNodeChanged = node;
                                that.lastScrollY = y;
                            }
                        }catch(e){
                            console.log("Error in jivemacros setInterval", e);
                        }
                    }, 300);
                },333);


                ed.onMouseUp.add(function(ed, e){
                    var html = e.target;
                    if(ed.selection.isCollapsed() && html.nodeName.toLowerCase() == "html"){
                        var body = ed.getBody();
                        if(body){
                            if(body.childNodes.length == 0){
                                that.fixBodyParagraphs();
                            }
                            // find last node of everything and select it
                            while(body.nodeType == 1 && body.childNodes.length){
                                body = body.childNodes[body.childNodes.length - 1];
                            }
                        }
                        ed.selection.select(body);
                        if(body.nodeType == 1 && body.nodeName.toLowerCase() == "br"){
                            ed.selection.collapse(true);
                        }else{
                            ed.selection.collapse();
                        }
                    }
                });

                /**
                 * New popover context menu for macros
                 */
                if(ed.plugins.jivecontextmenu){
                    var contextMenu = ed.plugins.jivecontextmenu;

                    var removeMacroItem = new contextMenu.MenuItem("removeTextMacro", null, ed.getLang("jivemacros.unquote"), {
                        url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/iconmaster.gif",
                        xOffset: 12,
                        yOffset: 86,
                        width: 13,
                        height: 11
                    }, "mceDeleteJiveMacro");
                    var removeMacroMenu = new contextMenu.Menu([removeMacroItem], true, false, ed.getLang("jivemacros.macro.quote"));
                    var textMacroItem = new contextMenu.MenuItem("textMacroItem", /pre/i, null, {
                        url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/iconmaster.gif",
                        xOffset: 58,
                        yOffset: 0,
                        width: 25,
                        height: 22
                    }, removeMacroMenu);
                    contextMenu.addRootItem(textMacroItem);
                }

                /**
                 * old-style context menu for macros
                 */
                if (ed.plugins.contextmenu) {
                    ed.plugins.contextmenu.onContextMenu.add(function(th, m, e) {
                        var sm, se = ed.selection, el = se.getNode() || ed.getBody();

                        var macroEle = ed.dom.getParent(el, function(ele){
                            return ele == ed.getBody() || that.isExactMacro(ele);
                        });
                        if(!that.isExactMacro(macroEle)) macroEle = null;

                        var macro = null;
                        var index = -1;
                        var isHTML = false;
                        if(macroEle != null){
                            // find the macro type that they right clicked on
                            for(var i=0;i<jive.rte.macros.length;i++){
                                if(jive.rte.macros[i].getName() == macroEle.attributes["jivemacro"].value){
                                    macro = jive.rte.macros[i];
                                    index = i;
                                    if(macro.getName() == "code"){
                                        // special handling for the code macro,
                                        // since there are two macros named "code"
                                        // 1 for html and 1 for everything else
                                        if(macroEle.attributes["___default_attr"].value == "html"){
                                            // macroEle is the html, and the macro var is the wrong macro
                                            isHTML = true;
                                        }
                                    }
                                }
                            }
                        }
                        window.jiveRTE = new Object();
                        window.jiveRTE.macroEle = macroEle;
                        if(macro != null){
                            that.macro = macro;
                            m.removeAll();



                            // "link" macros, like document/blog/thread/etc
                            if(macroEle.nodeName.toLowerCase() == "a" &&
                                    (macro.getName() == "document" ||
                                     macro.getName() == "blogpost" ||
                                     macro.getName() == "thread" ||
                                     macro.getName() == "message" ||
                                     macro.getName() == "blog" ||
                                     macro.getName() == "community" ||
                                     macro.getName() == "space" ||
                                     macro.getName() == "user" ||
                                     macro.getName() == "project" ||
                                     macro.getName() == "task" ||
                                     macro.getName() == "group")){
                                m.add({title : 'jivemacros.unlink', cmd : "mceDeleteJiveMacro"});
                            }else{
                                // presets menu
                                var paramSets = macro.getParameterSets();
                                if(paramSets.length > 1){
                                    if(macro.getName() != "code" || !isHTML){
                                        var preset_title = ed.getLang("jivemacros.macro." + macro.getName() + ".presets","jivemacros.presets");
                                        sm = m.addMenu({title : preset_title,max_height : '200', 'class' : 'mceDropDown defaultSkin mceMacroMenu mceListBoxMenu', icon : "jiveMacroPreset"});
                                        for(var i=0;i<paramSets.length;i++){
                                            // mceMenuItemSelected
                                            if(macro.getName() != "code" || paramSets[i].name != "html"){
                                                var preset_name = ed.getLang("jivemacros.macro." + macro.getName() + ".preset." + paramSets[i].name, paramSets[i].name);
                                                sm.add({title : preset_name, cmd : 'mceMacroParamSet' + index + "_" + i, icon : "jiveMacro_" + macro.getName() + "_" + paramSets[i].name});
                                            }
                                        }
                                    }
                                }
                                if(macro.getAllowedParameters().length > 0 && macro.isShowSettings()){
                                    m.add({title : 'jivemacros.properties', icon : 'jiveMacroProperties', cmd : "mceEditJiveMacro", ui : true});
                                }
                                m.add({title : 'jivemacros.remove', icon : 'jiveMacroDelete', cmd : "mceDeleteJiveMacro", ui : true});
                            }
                        }else{
                            this.macro = null;
                        }
                    });
                }
            }
        },

        init : function(ed, url){
            this.url = url;
            this.ed = ed;
            var macro = ed.plugins.jiveutil.findMacro("emoticon");
            this.emoticon = macro;
            var t = this;
            var textIsSelected = false;
            ed.onKeyUp.addToTop(function(ed, e) {
                textIsSelected = !ed.selection.isCollapsed();
            }, this);
            ed.onMouseUp.addToTop(function(ed, e) {
                textIsSelected = !ed.selection.isCollapsed();
            }, this);
            ed.onKeyUp.addToTop(function(ed, e) {
                if(textIsSelected && (e.keyCode == 8 || e.keyCode == 46)){
                    ed.undoManager.add(false, true);
                }
            }, this);
            ed.addCommand('mceJiveMacros', function(){
                var cm = this.controlManager;
                var button = cm.get('jivemacros');
                button.showMenu();
            });

            var scrollHander = function(scrollX, scrollY){
                if(t.rte){
                    t.rte.scrollRichContent(scrollX, scrollY);
                }
            };

            if(ed.onScroll) ed.onScroll.addToTop(scrollHander, this);
            if(ed.plugins.jivescroll) ed.onInit.add(function(ed){
                scrollHander(ed.plugins.jivescroll.lastScrollX, ed.plugins.jivescroll.lastScrollY);
            },this);

            ed.addCommand('mceEditJiveMacro', function() {
                var ed = tinyMCE.activeEditor;
                var macro = ed.plugins.jivemacros.macro;
                var height = macro.getAllowedParameters().length * 28 + 88;
                if(macro.getUrl().length > 0){
                    window.jiveRTE = new Object();
                    window.jiveRTE.macro = macro;
                    window.jiveRTE.node = ed.dom.getParent(ed.selection.getNode(), ed.plugins.jivemacros.isExactMacro)
                    var w = ed.windowManager.open({
                        url : CS_BASE_URL + macro.getUrl(),
                        width : 500,
                        height : 400,
                        inline : 1
                    }, {
                        macro : macro
                    });
                }else{
                    ed.windowManager.open({
                        url : CS_BASE_URL + '/resources/scripts/tiny_mce3/plugins/jivemacros/macro.htm',
                        width : 400,
                        height : height,
                        inline : 1
                    }, {
                        plugin_url : url,
                        macro : macro,
                        cs_resource_base_url : CS_RESOURCE_BASE_URL
                    });
                }
            });
            ed.addCommand('mceDeleteJiveMacro', function(){
                    var ed = tinyMCE.activeEditor;
                    this.deleteMacro(ed, ed.selection.getNode());
                }, this);

            this.initialized = false;

            ed.onSetContent.add(function(ed) {
                if(this.initialized){
                    this.fixBodyParagraphs();
                    this.fixEmptyTableCells(ed);
                }
            }, this);

            ed.onInit.add(this.completeInit, this);

            ed.onEvent.add(function(ed){ return function(){
                    ed.plugins.jivemacros.removeDeletedMacros(ed);
                }
            }(ed));

            ed.onNodeChange.add(this.nodeChanged, this);

            ed.onExecCommand.add(function(ed, cmd, ui, val){
                // make sure we update macros
                // when non-node-changing table commands
                // are executed
                switch (cmd) {
                    case "mceTableSplitCells":
                    case "mceTableMergeCells":
                    case "mceTableInsertRowBefore":
                    case "mceTableInsertRowAfter":
                    case "mceTableDeleteRow":
                    case "mceTableInsertColBefore":
                    case "mceTableInsertColAfter":
                    case "mceTableDeleteCol":
                    case "mceTableCutRow":
                    case "mceTablePasteRowBefore":
                    case "mceTablePasteRowAfter":
                    case "mceTableRowUp":
                    case "mceTableRowDown":
                    case "mceTableColLeft":
                    case "mceTableColRight":
                        ed.plugins.jivemacros.lastNodeChanged = null;
                }
            });


            ed.onKeyPress.addToTop(function(ed, evt){
                if(this.collapseToEnd != null || this.collapseToStart != null){
                    tinymce.dom.Event.cancel(evt);
                }
                if(evt.which == null || evt.which != 0 || evt.keyCode == 8 || evt.keyCode == 46){
                    //the title is changing
                    var mac = this.isMacro(ed.selection.getNode());
                    if(mac){
                        ed.dom.setAttrib(mac, "_modifiedtitle", "true");
                    }
                }
                ed.selection.lastSelected = ed.selection.getNode();
            }, this);
            ed.onKeyDown.addToTop(function(ed, evt){
                if((evt.keyCode == 8 || evt.keyCode == 46) && !ed.selection.isCollapsed()){ // delete key
                    ed.undoManager.add(false, true);
                }

                var sel = ed.selection;

                //check for backspace at start of text macro
                var pre = ed.dom.getParent(sel.getNode(), 'pre');
                if(evt.keyCode == 8 && sel.isCollapsed() && pre){ // backspace key
                    var isFrontOfPre = ed.selectionUtil.atStartOf(pre) || ed.selectionUtil.isEffectivelyEmpty(pre);
                    if(isFrontOfPre){
                        ed.undoManager.add(false, true);

                        var bm = sel.getBookmark();
                        ed.dom.remove(pre, true);
                        sel.moveToBookmark(bm);

                        ed.undoManager.add(false, true);

                        tinymce.dom.Event.cancel(evt);
                    }
                }

                sel.lastSelected = sel.getNode();
                var body = ed.getBody();
                if(body.childNodes.length > 0){
                    this.before = sel.getNode();

                    if(evt.keyCode == 13 && pre){
                        if (tinymce.isIE && !tinymce.isIE9){
                            tinymce.dom.Event.cancel(evt);
                            var rng = sel.getSel().createRange();
                            rng.text= "\n ";
                            rng.select();
                        }
                    }
                }

            }, this);
            ed.onKeyUp.add(function(ed, evt){
                var sel = ed.selection;
                var selectionNode = sel.getNode();
                if(selectionNode && selectionNode.nodeName.toLowerCase() == "body" &&
                   !evt.ctrlKey && !evt.altKey && !evt.shiftKey && !evt.metaKey &&
                    evt.keyCode != 91 && evt.keyCode != 92 && evt.keyCode != 17 && evt.keyCode != 18){
                    this.typingInBody = true;
                    this.fixBodyParagraphs();
                }

                if(evt.keyCode == 8 || evt.keyCode == 46){
                    //the title is changing.  This may not have gotten updated in the keypress handler, because a lot of browsers don't raise keypress for DEL and BS.
                    var mac = this.isMacro(selectionNode);
                    if(mac){
                        ed.dom.setAttrib(mac, "_modifiedtitle", "true");
                    }
                }

                // the following is a fix that should
                // only be applied when pressing ctrl+z
                // to undo text
                ed.plugins.jivemacros.removeDuplicateMacros(ed, false, this.isMacro(selectionNode));
                if(evt.keyCode == 90 && (evt.ctrlKey || evt.metaKey) && (selectionNode && selectionNode.nodeName.toLowerCase() == "body" && ed.selection.lastSelected && ed.selection.lastSelected.nodeName.toLowerCase() != "body")){
                    var selectme = ed.selection.lastSelected;
                    if(selectme.childNodes.length){
                        selectme = selectme.childNodes[selectme.childNodes.length-1];
                        ed.selection.select(selectme);
                        ed.selection.collapse(true);
                    }else{
                        ed.selection.select(selectme);
                        ed.selection.collapse();
                    }
                }
                if(this.collapseToStart != null){
                    this.putCursorBefore(ed,this.collapseToStart);
                    tinymce.dom.Event.cancel(evt);
                    this.collapseToStart = null;
                    return;
                }
                if(this.collapseToEnd != null){
                    this.putCursorAfter(ed, this.collapseToEnd);
                    tinymce.dom.Event.cancel(evt);
                    this.collapseToEnd = null;
                    return;
                }
                if(this.before != null && (evt.keyCode == 39 || evt.keyCode == 40)){
                    var after = ed.dom.getParent(selectionNode, "PRE");
                    if(this.before.tagName != "PRE" && after){ // down or right
                        if(this.before.childNodes.length == 1 && this.before.childNodes[0].tagName == "BR"){
                            var par = ed.dom.getParent(this.before, function(node){ return function(x){ return x == ed.getBody() || x != node; }}(this.before));
                            if(par.childNodes[0] == this.before){
                                // only remove the blank paragraph if it's the
                                // first paragraph in the container
                                par.removeChild(this.before);
                                this.before = after;
                                ed.nodeChanged(false, true);
                            }
                        }
                    }
                }

                ed.plugins.jiveemoticons.encodeSmileys(ed, selectionNode);


                if(evt.keyCode == 37 || evt.keyCode == 38){ // up or left
                    // check if the pre is first in the body
                    // check if we're at the beginning of the pre
                    var node = ed.dom.getParent(sel.getNode(), function(ele){
                        return ed.plugins.jivemacros.isExactMacro(ele);
                    }, ed.getBody());
                    if(!node) return;

                    var isFirst = this.isFirst(ed.getBody(), node);
                    var isMacro = this.isMacro(node);
                    var isFrontOfPre =  sel.getBookmark(BOOKMARKTYPE).start == 0 || sel.getRng(true).startOffset == 0;
                    if(isFirst && isMacro && isFrontOfPre && sel.isCollapsed()){
                        if(evt.keyCode == 37 && !ed.dom.isBlock(node)){
                            node.parentNode.insertBefore(ed.getDoc().createTextNode(""), node);
                            return true;
                        }else{
                            var p = ed.getDoc().createElement('P');
                            var br = ed.getDoc().createElement('BR');
                            p.appendChild(br);
                            ed.getBody().insertBefore(p, ed.getBody().childNodes[0]);
                            ed.nodeChanged(false, true);
                            return true;
                        }
                    }
                }
            }, this);
        },

        getInfo : function() {
            return {
                longname : 'Jive Macros',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
        },

        generateMacroMenu : function(m, index){
                var ed = tinyMCE.activeEditor;
                var macro = jive.rte.macros[index];
                // presets menu
                var paramSets = macro.getParameterSets();
                var macro_name = ed.getLang("jivemacros.macro." + macro.getName(), macro.getName());
                if(paramSets.length > 1){
                    var sm = m.addMenu({title : macro_name, max_height : '200', 'class' : 'mceDropDown defaultSkin mceMacroMenu mceListBoxMenu', icon : "jiveMacro_" + macro.getName()});
                    for(var i=0;i<paramSets.length;i++){
                        // mceMenuItemSelected
                        var preset_name = ed.getLang("jivemacros.macro." + macro.getName() + ".preset." + paramSets[i].name, paramSets[i].name);
                        if(paramSets[i].name == "html" && macro.getName() == "code"){
                            m.add({ cmd: "mceAddJiveMacro" + index + "_" + i,
                                    title: preset_name,
                                    max_height : '200',
                                    icon : "jiveMacro_" + macro.getName()
                            });
                        }else{
                            sm.add({title : preset_name, cmd : 'mceAddJiveMacro' + index + "_" + i, icon : macro.getName() + "_" + paramSets[i].name});
                        }
                    }
                }else if(paramSets.length == 1){
                    var preset_name = ed.getLang("jivemacros.macro." + macro.getName() + ".preset." + paramSets[0].name, paramSets[0].name);
                    m.add({ cmd: "mceAddJiveMacro"+index,
                            title: preset_name,
                            max_height : '200',
                            icon : "jiveMacro_" + macro.getName()
                    });
                }else{
                    m.add({ cmd: "mceAddJiveMacro"+index,
                            title: macro_name,
                            max_height : '200',
                            icon : "jiveMacro_" + macro.getName()
                    });
                }
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
			switch (n) {
				case 'jivemacros':
					var c = cm.createSplitButton('jivemacros', {
						title : 'jivemacros.add',
						cmd : "mceJiveMacros"
					});
                    for(var j=0;j<jive.rte.macros.length;j++){
                        if(jive.rte.macros[j].isShowInMacroList() &&
                           jive.rte.macros[j].getName() != "emoticon" &&
                           !jive.rte.macros[j].isButton()){
                            c.onRenderMenu.add(function(j){ return function(c, m) {
                                var ed = tinyMCE.activeEditor;
                                ed.plugins.jivemacros.generateMacroMenu(m, j);
                            }}(j));
                        }
                    }

				    // Return the new menubutton instance
				    return c;

                case 'extra':
                    var ed = tinyMCE.activeEditor;
                    /**
                    * add button macros to toolbar
                    */
                    for(var j=0;j<jive.rte.macros.length;j++){
                       if(jive.rte.macros[j].isShowInMacroList() &&
                          jive.rte.macros[j].getName() != "emoticon" &&
                          jive.rte.macros[j].isButton()){
                           // build a button
                           var macro = jive.rte.macros[j];
                           var paramSets = macro.getParameterSets();
                           var macro_name = ed.getLang("jivemacros.macro." + macro.getName(), macro.getName());
                           if(paramSets.length > 1){
                               // show a drop down menu
                               var c = cm.createSplitButton('extra', {
                                   title: macro_name,
                                   image : '../jscripts/tiny_mce/plugins/example/img/example.gif',
                                   icon : "jiveMacro_" + macro.getName(),
						            cmd : 'mceAddJiveMacro' + j
                               });
                               c.onRenderMenu.add(function(j){ return function(c, m) {
                                   for(var i=0;i<paramSets.length;i++){
                                       // mceMenuItemSelected
                                       var preset_name = ed.getLang("jivemacros.macro." + macro.getName() + ".preset." + paramSets[i].name, paramSets[i].name);
                                       m.add({title : preset_name, cmd : 'mceAddJiveMacro' + j + "_" + i, icon : macro.getName() + "_" + paramSets[i].name});
                                   }
                               }}(j));
                               return c;
                           }else{
                               var c = cm.createButton("extra", {
                                   title: macro_name,
                                   cmd: "mceAddJiveMacro"+j,
                                   icon : "jiveMacro_" + macro.getName()
                                });
                               return c;
                           }
                       }
                    }
            }

			return null;
		}


    });
	// Register plugin
	tinymce.PluginManager.add('jivemacros', tinymce.plugins.JiveMacrosPlugin);
})();
