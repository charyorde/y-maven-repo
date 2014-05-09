(function() {

    tinymce.create('tinymce.plugins.JiveUtilPlugin', {

        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @returns Name/value array containing information about the plugin.
         * @type Array
         */
        getInfo : function() {
            return {
                longname : 'Jive Utility Plugin',
                author : 'Jive Software',
                authorurl : 'http://www.jivesoftware.com',
                infourl : 'http://www.jivesoftware.com/',
                version : "1.0"
            };
        },

        findMacro: function(macroName){
            var macros = jive.rte.macros;
            var index = this.findMacroIndex(macroName);
            if(index != null){
                return macros[index];
            }
            return null;
        },

        findMacroIndex: function(macroName){
            var macros = jive.rte.macros;
            for(var i = 0; i < macros.length; ++i){
                if(macros[i].getName() == macroName){
                    return i;
                }
            }
            return null;
        },

        /**
         * returns the top/bottom cell for a given
         * column that contains the input cell
         * @param $cell
         */
        findColumnBoundsForCell: function($cell){
            var $column = $j();
            var table = $cell.closest("table");
            var columnCount = 0;
            $cell.prevAll("td,th").andSelf().each(function(indx, ele){
                var colspan = $j(ele).attr("colspan");
                columnCount += colspan ? parseInt(colspan) : 1;
            });

            // find the cell in the first row that spans the same column that we clicked
            table.find("tr").each(function(){
                var tempRowColCount = 0;
                $j(this).find("td, th").each(function(indx,ele){
                    var colspan = $j(ele).attr("colspan");
                    tempRowColCount += colspan ? parseInt(colspan) : 1;
                    if(tempRowColCount >= columnCount){
                        $column = $column.add(ele);
                        return false;
                    }
                });
            });

            return $column;
        },

        /**
         * returns the top/bottom cell for a given
         * column that contains the input cell
         * @param $cell
         */
        findColumnFirstCell: function($cell){
            return this.findColumnCellInRow($cell, true);
        },

        /**
         * returns the top/bottom cell for a given
         * column that contains the input cell
         * @param $cell
         */
        findColumnLastCell: function($cell){
            return this.findColumnCellInRow($cell, false);
        },

        /**
         * returns the top/bottom cell for a given
         * column that contains the input cell
         * @param $cell
         * @param {boolean} isFirst
         */
        findColumnCellInRow: function($cell, isFirst){
            var $column = $j();
            var table = $cell.closest("table");
            var columnCount = 0;
            $cell.prevAll("td,th").andSelf().each(function(indx, ele){
                var colspan = $j(ele).attr("colspan");
                columnCount += colspan ? parseInt(colspan) : 1;
            });

            // find the cell in the first row that spans the same column that we clicked
            var $trs = table.find("tr").filter(function(){
                return this.childNodes.length > 0;
            });
            if(isFirst){
                $trs = $trs.first();
            }else{
                $trs = $trs.last();
            }

            var tempRowColCount = 0;
            $trs.find("td, th").each(function(indx,ele){
                var colspan = $j(ele).attr("colspan");
                tempRowColCount += colspan ? parseInt(colspan) : 1;
                if(tempRowColCount >= columnCount){
                    $column = $column.add(ele);
                    return false;
                }
            });

            return $column;
        },

        /**
         * converts a string in rgb format
         * to hex
         * @param rgb string, ex. "rgb(123,234,123)"
         */
        convertRGBToHex : function(rgb){
            // color is in rgb format, we
            // need to reformat to #hex
            rgb = rgb.substr(rgb.indexOf("(") + 1);
            rgb = rgb.substr(0, rgb.length-1);
            rgb = rgb.split(",");
            rgb[0] = parseInt($j.trim(rgb[0])).toString(16);
            rgb[1] = parseInt($j.trim(rgb[1])).toString(16);
            rgb[2] = parseInt($j.trim(rgb[2])).toString(16);
            if(rgb[0].length == 1) rgb[0] = "0" + rgb[0];
            if(rgb[1].length == 1) rgb[1] = "0" + rgb[1];
            if(rgb[2].length == 1) rgb[2] = "0" + rgb[2];
            if(rgb.length == 3 || rgb[3] > 0){
                return ("#" + rgb[0] + rgb[1] + rgb[2]).toUpperCase();
            }
            // alpha is zero
            return "";
        },


        /**
         * returns true if the input node is not a macro
         * and if it is not a child of a macro
         * returns false otherwise
         *
         * this is useful for only processing outside of code/html macros.
         * esp emoticons and @ mentions
         *
         * @param ed the tinymce editor
         * @param n the DOM node
         */
        shouldEncodeHuh : function(ed, n){
            var macroEle = ed.dom.getParent(n, function(ele){
                return ele == ed.getBody() || ed.plugins.jivemacros.isMacro(ele);
            });
            if(!ed.plugins.jivemacros.isMacro(macroEle)) macroEle = null;
            if(macroEle != null){
                var macro = ed.plugins.jivemacros.getMacroFor(macroEle);
                if(macro && macro.getName() == "code") return false;
            }
            return true;
        },

        /**
         * walks through all of the kids of startN until endN is found, if ever
         * and calls func() on each node

         * given:
         *
         * - node1
         *   - node11
         *   - node12
         *   - node13
         * - node2       * startN
         *   - node21
         *   - node22    * endN
         *   - node23
         *
         * func() will be called on: node2, 21, and 22
         * 
         * @param startN the node to call
         * @param endN
         * @param func
         */
        walkDOMTreeKids : function(startN, endN, func){
            // call the func on the DOM
            func(startN);
            // end case
            if(startN == endN) return true;
            // walk through all kids
            for(var i=0;i<startN.childNodes.length;i++){
                if(this.walkDOMTreeKids(startN.childNodes[i], endN, func)) return true;
            }
            return false;
        },

        /**
         * walk through a the DOM starting with start node
         * and ending with end node
         *
         * given:
         *
         * - node1
         *   - node11
         *   - node12    * startN
         *   - node13
         * - node2
         *   - node21
         *   - node22    * endN
         *   - node23
         *
         * func() will be called on: node12, 13, 2, 21, and 22
         * 
         * @param startN the node to start walking from, must be before endN
         * @param endN the last node that we should walk to
         * @param func the function to call with every node
         */
        walkDOMTree : function(startN, endN, func){
            // walk all of our kids
            if(this.walkDOMTreeKids(startN, endN, func)) return true;
            // find parent's next sibling, or parent's parent next sibling, etc

            while(startN.nextSibling != null){
                startN = startN.nextSibling;
                if(this.walkDOMTreeKids(startN, endN, func)) return true;
            }

            function getNext(node){
                if(node.nodeType == 1 && node.nodeName.toLowerCase() == "body") return node;
                if(node.parentNode.nextSibling == null) return getNext(node.parentNode);
                return node.parentNode.nextSibling;
            }
            var nextN = getNext(startN);
            if(nextN.nodeType == 1 && nextN.nodeName.toLowerCase() == "body") return true;
            return this.walkDOMTree(nextN, endN, func);
        },

        /**
         * returns the number of characters contained in node
         *
         * @param node
         */
        textLengthIn : function(node){
            var count = 0;
            this.walkDOMTreeKids(node, null, function(n){
                if(n.nodeType == 3) count += n.nodeValue.length;
            });
            return count;
        },


        /**
         * Given a node and a character offset, this function will
         * return the node that the offset falls in
         *
         * given:
         * <node1> text here <node2> more text</node2></node1>
         * and 14
         *
         * then: node 2 will be returned, since the 14th letter falls inside of node 2
         *
         * edge case:
         *
         * given:
         * <node1> text here <node2> more text</node2></node1>
         * and 11
         *
         * then: node 2 will be returned, since the 11th letter ends at the very beginning of node 2
         */
        getNodeAt : function(node, offset){
            if(offset == 0) return node;
            if(node.nodeType != 1) return null;
            for(var i=0;i<node.childNodes.length;i++){
                var len = this.textLengthIn(node.childNodes[i]);
                if(offset == 0){
                    return node.childNodes[i];
                }else if(len > offset){
                    var n = this.getNodeAt(node.childNodes[i], offset);
                    if(n == null) return node;
                    return n;
                }else{
                    offset -= len;
                }
            }
            return null;
        },

        /**
         * Compare two arrays for equality.  Compares elements, but does not recursively compare nested arrays.
         * @param left Array 1
         * @param right Array 2
         */
        arrayEquals: function arrayEquals(left, right){
            if(left === right){
                return true;
            }
            if(left == null || right == null || left.length !== right.length){
                return false;
            }
            for(var i = 0; i < left.length; ++i){
                if(left[i] !== right[i]){
                    return false;
                }
            }
            return true;
        },

        /**
         * clone the node with only the css attributes we care about
         * @param $node
         * @param ownerDocument
         */
        clone: function($node, ownerDocument ) {
            var rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
	            rleadingWhitespace = /^\s+/;
            // Do the clone
            var $ret = $node.map(function(ownerDocument){ return function() {
                if ( !jQuery.support.noCloneEvent && !jQuery.isXMLDoc(this) ) {
                    // IE copies events bound via attachEvent when
                    // using cloneNode. Calling detachEvent on the
                    // clone will also remove the events from the orignal
                    // In order to get around this, we use innerHTML.
                    // Unfortunately, this means some modifications to
                    // attributes in IE that are actually only stored
                    // as properties will not be copied (such as the
                    // the name attribute on an input).
                    var html = this.outerHTML;
                    if ( !html ) {
                        var div = ownerDocument.createElement("div");
                        div.appendChild( this.cloneNode(true) );
                        html = div.innerHTML;
                    }

                    return jQuery.clean([html.replace(rinlinejQuery, "")
                        .replace(rleadingWhitespace, "")], ownerDocument)[0];
                } else {
                    return this.cloneNode(true);
                }
            }}(ownerDocument));

            var attrs = ['font-family','font-size','font-weight','font-style',
                        'text-transform','text-decoration','letter-spacing','word-spacing',
                        'line-height','text-align','vertical-align','direction','width','height',
                        'margin-top','margin-right','margin-bottom','margin-left',
                        'padding-top','padding-right','padding-bottom','padding-left',
                        'border-top-width','border-right-width','border-bottom-width','border-left-width',
                        'border-top-style','border-right-style','border-bottom-style','border-left-style',
                        'overflow-x','overflow-y','white-space',
                        'clip','list-style-image','list-style-position',
                        'list-style-type','marker-offset'];
            for(var i=0;i<attrs.length;i++){
                var attr = attrs[i];
                var val = $node.css(attr);
                if(val && (attr != "width" || val != "0px")){
                    $ret.css(attr, $node.css(attr));
                }
            }

            return $ret;
        }

    });
	// Register plugin
tinymce.PluginManager.add('jiveutil', tinymce.plugins.JiveUtilPlugin);
})();
