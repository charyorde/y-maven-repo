
if(typeof(jive) != "undefined"){

    /**
     * defines a simple Macro interface to mimic the RenderMacro class on the server
     */
    jive.rte.plugin.code = function(shortname, url, macrotag, settingsHuh, displayHuh, paramSets, params, enabled, button){
        var that = this;

        var $cursor = $j("<span style='height:12px;width:1px;background-color:black;position:absolute;top:0px;'></span>");

        //IE7-8 blows up on $j.contains() when needle is a Text node.
        function safeContains(haystack, needle){
            while(needle.parentNode){
                if(needle.parentNode == haystack){
                    return true;
                }
                needle = needle.parentNode;
            }
            return false;
        }

        setInterval(function(){
            if($cursor.parents("body").length > 0){
                if($cursor.is(":visible")){
                    $cursor.hide();
                }else{
                    $cursor.show();
                }
            }
        },500);

        var cachedSelection = null;

        params = [{name: "__default_attr",value: "plain"}];

        /**
         * gets the unique name for this macro
         * i.e. "code" or "youtube"
         */
        this.getName = function(){
            return shortname;
        };

        /**
         * gets the optional url for this macro
         */
        this.getUrl = function(){
            return url;
        };

        /**
         * returns true if it should be a button or not
         */
        this.isButton = function(){
            return button;
        };

        this.isEnabled = function(){
            return enabled;
        };

        this.isShowSettings = function(){
            return settingsHuh;
        };

        /**
         * Display in RTE Insert List?
         */
        this.isShowInMacroList = function(){
            return displayHuh;
        };

        /**
         * returns true if this macro accepts
         * raw text input, like a code macro,
         * or false if it doesn't, like
         * a youtube macro
         */
        this.getMacroType = function(){
            return macrotag;
        };

        /**
         * returns all param sets for this macro
         */
        this.getParameterSets = function(){
            var data = new Array();
            data.push({
                name: "html",
                deleteAll: true,
                params: [ { name: "__default_attr", value : "html" } ]
            });
            data.push({
                name: "xml",
                deleteAll: false,
                params: [ { name: "__default_attr", value : "xml" } ]
            });
            data.push({
                name: "sql",
                deleteAll: false,
                params: [ { name: "__default_attr", value : "sql" } ]
            });
            data.push({
                name: "java",
                deleteAll: false,
                params: [ { name: "__default_attr", value : "java" } ]
            });
            data.push({
                name: "plain",
                deleteAll: false,
                params: [ { name: "__default_attr", value : "plain" } ]
            });
            data.push({
                name: "c++",
                deleteAll: false,
                params: [ { name: "__default_attr", value : "c++" } ]
            });
            data.push({
                name: "c#",
                deleteAll: false,
                params: [ { name: "__default_attr", value : "c#" } ]
            });
            data.push({
                name: "css",
                deleteAll: false,
                params: [ { name: "__default_attr", value : "css" } ]
            });
            data.push({
                name: "javascript",
                deleteAll: false,
                params: [ { name: "__default_attr", value : "javascript" } ]
            });
            data.push({
                name: "php",
                deleteAll: false,
                params: [ { name: "__default_attr", value : "php" } ]
            });
            data.push({
                name: "python",
                deleteAll: false,
                params: [ { name: "__default_attr", value : "python" } ]
            });
            data.push({
                name: "ruby",
                deleteAll: false,
                params: [ { name: "__default_attr", value : "ruby" } ]
            });
            var sets = new Array();
            for(var i=0;i<data.length;i++){
                var aset = new jive.rte.ParamSet();
                aset.name = data[i].name;
                aset.deleteAll = data[i].deleteAll;
                aset.params = data[i].params;
                sets.push(aset);
            }
            return sets;
        };

        /**
         * returns an array of allowed parameters
         */
        this.getAllowedParameters = function(){
            return params;
        };

        this.usesCustomBackground = function(){
            return true;
        };


        this.updateCursor = function(rte, ele, $ele){

            if(cachedSelection != rte.selection() || $cursor.parents("body").length == 0){
                var sel = cachedSelection = rte.selection();
                //
                // is the cursor inside the macro
                // or not?
                if(sel && sel.collapsed){
                    var start = sel.startContainer;
                    if(start){
                        var startOffset = sel.startOffset;
                        if(start.nodeType != 3){
                            // find # of characters offset
                            startOffset = 0;
                            for(var i=0;i< sel.startOffset && i<start.childNodes.length;i++){
                                startOffset += $j(start.childNodes[i]).text().length;
                            }
                        }else{
                            while(start.previousSibling){
                                startOffset += $j(start.previousSibling).text().length;
                                start = start.previousSibling;
                            }
                        }

                        var $containingP = $j(start.nodeType == 3 ? start.parentNode : start);
                        $containingP = $containingP.parents().andSelf().filter("p:first");

                        if(safeContains(ele, start)){
                            $cursor.show();
                            $cursor.height($containingP.height());

                            var line = 0;
                            //
                            // find what line it's on
                            while($containingP.prev().length){
                                $containingP = $containingP.prev();
                                line ++;
                            }

                            $ele.data("line", line);
                            $ele.data("offset", startOffset);

                            // now find the left offset

                            var $span = $ele.find("li:nth(" + line + ") span:first");
                            $span.prepend($cursor.remove());

                            if($span.length == 0) return;

                            if($span.contents().length == 1){
                                // empty, leave the cursor at the beginning
                                // move the cursor to the offset
                                $cursor.css({left: 0 });
                            }else{
                                // has kids, put the cursor at the text offset
                                var node = $span.get(0).childNodes[1];

                                var offset = 0;
                                var removeMe = null;

                                // find the offset
                                while(offset < startOffset){
                                    if(node.nodeType != 3){
                                        if(offset + $j(node).text().length < startOffset){
                                            offset += $j(node).text().length;
                                            if(node.nextSibling){
                                                node = node.nextSibling;
                                            }else{
                                                // at the end of a line
                                                var span = document.createElement("span");
                                                node.parentNode.insertBefore(span, node);
                                                node.parentNode.insertBefore(node, span);
                                                node = span;
                                                removeMe = span;
                                                break;
                                            }
                                        }else{
                                            if(node.childNodes.length == 0){
                                                break;
                                            }else{
                                                node = node.childNodes[0];
                                            }
                                        }
                                    }else if(offset + node.nodeValue.length < startOffset){
                                        offset += node.nodeValue.length;
                                        if(node.nextSibling){
                                            node = node.nextSibling;
                                        }else{
                                            // at the end of a line
                                            var span = document.createElement("span");
                                            node.parentNode.insertBefore(span, node);
                                            node.parentNode.insertBefore(node, span);
                                            node = span;
                                            removeMe = span;
                                            break;
                                        }
                                    }else if(offset + node.nodeValue.length == startOffset){
                                        offset += node.nodeValue.length;
                                        // the cursor should be at the end of the text node
                                        var span = document.createElement("span");
                                        node.parentNode.insertBefore(span, node);
                                        node.parentNode.insertBefore(node, span);
                                        node = span;
                                        removeMe = span;
                                        break;
                                    }else if(offset + node.nodeValue.length > startOffset){
                                        // split the text node, and insert a <span>
                                        // where we want the cursor to be
                                        var index = startOffset - offset;
                                        var str = node.nodeValue.substr(index);
                                        node.nodeValue = node.nodeValue.substr(0, index);
                                        var newText = document.createTextNode(str);
                                        node.parentNode.insertBefore(newText, node);
                                        node.parentNode.insertBefore(node, newText);
                                        span = document.createElement("span");
                                        node.parentNode.insertBefore(span, node);
                                        node.parentNode.insertBefore(node, span);
                                        node = span;
                                        removeMe = span;
                                        offset += index;
                                        break;
                                    }
                                }
                                // move the cursor to the offset
                                $cursor.css({left: offset ? $j(node).position().left : $span.position().left });
                                if(removeMe){
                                    removeMe.parentNode.removeChild(removeMe);
                                }
                            }

                        }else{
                            $cursor.remove();
                        }
                    }else{
                        $cursor.remove();
                    }
                }else{
                    $cursor.remove();
                }
            }
        };

        /**
         * update the position of $obj to properly display behind ele's content
         * in the RTE
         * @param rte the jive RTE object
         * @param ele the DOM element /inside/ the RTE proper. this should
         * be clear so show through to $obj behind it
         * @param $ele the DOM element /behind/ the RTE that shows rich content
         */
        this.refreshPosition= function(rte, ele, $ele, offsetOfRTEEle){
            // get offset inside the RTE


            var $rteEle = $j(ele);
            var t = offsetOfRTEEle.top;
            var l = offsetOfRTEEle.left;
            var h = $rteEle.outerHeight();
//            var w = $rteEle.outerWidth();
            var w = Math.max.apply(Math, $ele.find("span").add($rteEle).map(function(){ return $j(this).outerWidth() + 59; }).get());

            // set the width/height and offset
            // of our rich content to match
            $ele.css("width", w);
            $ele.css("height", h);
            $ele.css("top", t);
            $ele.css("left", l);


            if($ele.data("needrefresh") == "true"){
                $ele.data("needrefresh", "false");
                that.refresh(rte, ele);
            }
            that.updateCursor(rte, ele, $ele);
        };



        function getTextFrom(node){
            var ret = "";
            for(var i=0;i<node.childNodes.length;i++){
                if(node.childNodes[i].nodeType == 4){ // cdata
                    ret += node.childNodes[i].nodeValue;
                }else if(node.childNodes[i].nodeType == 3){ // text
                    ret += node.childNodes[i].nodeValue;
                }else{
                    var curr = node.childNodes[i];
                    var str = getTextFrom(curr);
                    if(tinymce.DOM.isBlock(curr)){
                        str += "\n";
                    }else if(curr.nodeName.toLowerCase() == "br" && curr.nextSibling != null){
                        str += "\n";
                    }
                    ret += str;
                }
            }
            return ret;
        }

        /**
         * update the element's display w/ the latest
         * parameter value.
         */
        this.refresh = function(rte, ele){
            var uid = rte.getUIDForElement($j(ele));
            var $ele = rte.getHiddenElementFor(uid);
            var $pre;
            if($ele.children().length == 0){
                $pre = $j("<pre name='_code_" + uid + "'></pre>");
                $ele.append($pre);
            }else{
                $pre = $ele.children("pre");
            }
            var lang = $j(ele).attr("___default_attr");
            if(!lang) lang = "plain";
            $pre.attr("class", lang);
            var text = getTextFrom(ele);
            if(text == "") text = "\n";

            /*
            for(var i=0;i<$j(ele).children().length;i++){
                if(text != "") text += "\n";
                text += $j(ele).children(":eq(" + i + ")").text();
            }
            */
            if($pre.data("text") != text || lang != $pre.data("lang")){
                $pre.text(text.replace(/\n/g, " \n"));
                $pre.data("text", text); // saves the \n
                $pre.data("lang", lang); // save the last language we highlighted with
                var $macro = rte.getCurrentNode().parents(".jive_macro_code");
                $ele.children("div").remove();
                dp.SyntaxHighlighter.HighlightAll("_code_" + uid);
            }
            that.refreshPosition(rte, ele, $ele, $j(ele).offset());
        };
        
        this.caresAboutChangeTo = function(rte, ele, selNode){
            return false;
        };
    }

}
    