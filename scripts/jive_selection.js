/**
 * Make sure we only include this file once per page load.  If we do not have this block here there are 2 cases where
 * this script could be loaded multiple times:
 * 1) When resource combined is false behavior could be different from when it's on, ideally the behavior should be the same.
 * 2)  If an ajax request is made for an ftl with javascript includes the file will be reloaded (assuming it was already
 * loaded on page load)
 *
 * At a later date we can roll this work into namespace or a new function that is similar to namespace
 *
 * @depends path=/resources/scripts/jquery/jquery.oo.js
 */

if(!jive.Selection){
/*
 * Wrapper around selection object to abstract away various browser quirks
 */

jive.Selection = $Class.extend({
    init:function(node, collapseAtStart, offset, win, doc){
        // IE8 and below do not support W3C DOM Ranges
        this._supportsDomRange = $j.isFunction(window.getSelection);
        this._selection = jive.Selection.getSelection(win, doc);
        if(node != null) {
            // selection may have no ranges for non IE browsers, if this is the case add a new one
            if(this._supportsDomRange){
                if(this._selection.rangeCount == 0){
                    this._selection.addRange(jive.Selection.createRangeAtNode(node, doc));
                }
            }
            // store this range for use later
            this._doc = doc;
            this._win = win;
            this._range = this.getRangeAt(0);
            this.moveToNodeAndCollapse(node, collapseAtStart, offset);
        } else {
            // store this range for use later
            this._range = this.getRangeAt(0);
        }

    },
    getSelection:function(){
        return this._selection;
    },
    getRangeAt:function(index){
        return jive.Selection.getRangeAt(this._selection, index, this._doc);
    },
    /**
     * clears out currently selected ranges and selects the range we stored upon init
     */
    makeRangeTheSelection:function(){
        if(!this._supportsDomRange){
            this._selection.empty();
            this._range.select();
        } else {
            if(this._selection.rangeCount > 0){
                this._selection.removeAllRanges();
            }

            this._selection.addRange(this._range);
        }
    },
    /**
     * Wrapper around range.insertNode see https://developer.mozilla.org/en/DOM/range.insertNode
     * 
     * newNode is inserted at the start boundary point of the Range. If the newNodes is to be added to a text Node, that
     * Node is split at the insertion point, and the insertion occurs between the two text Nodes.
     *
     * @param newNode the node to insert
     * 
     */
    rangeInsertNode:function(newNode){
        if(!this._supportsDomRange){
            var rangeNode = this.getRangeStartContainer();
            var rangeStartOffset = this.getRangeStartOffset();
            var nodeToInsertInto = rangeNode.parentNode;
            
            if(rangeNode.nodeType == 3){
                // need to split the text node into two and insert the new node in between the two
                var rangeNodeVal = new String(rangeNode.nodeValue);
                var rangeNodePre = document.createTextNode(rangeNodeVal.substring(0, rangeStartOffset));
                var rangeNodePost = document.createTextNode(rangeNodeVal.substring(rangeStartOffset));
                // insert in the correct order
                nodeToInsertInto.insertBefore(rangeNodePre, rangeNode);
                nodeToInsertInto.insertBefore(newNode, rangeNode.nextSibling);
                nodeToInsertInto.insertBefore(rangeNodePost, newNode.nextSibling);
                // remove old node
                nodeToInsertInto.removeChild(rangeNode);
                // previous range has been deleted, move the range to the inserted element
                this.moveToNodeAndCollapse(newNode, true);
            } else {
                // just insert after rangeNode
                nodeToInsertInto.insertBefore(newNode, rangeNode.nextSibling);
            }
        } else {
            this._range.insertNode(newNode);
        }
    },
    /**
     * Wrapper around standard for range.setStart see https://developer.mozilla.org/en/DOM/range.setStart
     *
     * If the startNode is a Node of type Text, Comment, or CDATASection, then startOffset is the number of
     * characters from the start of startNode. For other Node types, startOffset is the number of child nodes between
     * the start of the startNode.
     *
     * @param startNode
     * @param startOffset
     */
    setRangeStart:function(startNode, startOffset){
        if(!this._supportsDomRange){
            this._setRangeStartEndHelper(startNode, startOffset, false);
        } else {
            this._range.setStart(startNode, startOffset);
        }
    },
    /**
     * Wrapper around standard for range.setEnd see https://developer.mozilla.org/en/DOM/range.setEnd
     *
     * If the endNode is a Node of type Text, Comment, or CDATASection, then endOffset is the number of characters from
     * the start of endNode. For other Node types, endOffset is the number of child nodes between the start of the
     * endNode.
     *
     * @param endNode
     * @param endOffset
     */
    setRangeEnd:function(endNode, endOffset){
        if(!this._supportsDomRange){
            this._setRangeStartEndHelper(endNode, endOffset, true);
        } else {
            this._range.setEnd(endNode, endOffset);
        }
    },
    /**
     * Wrapper around range.startContainer see https://developer.mozilla.org/en/DOM/range.startContainer
     */
    getRangeStartContainer:function(){
        if(!this._supportsDomRange){
			return this._getIERangeContainerHelper(true).container;
        } else {
            return this._range.startContainer;            
        }
    },
    /**
     * Wrapper around range.endContainer see https://developer.mozilla.org/en/DOM/range.endContainer
     */
    getRangeEndContainer:function(){
        if(!this._supportsDomRange){
            return this._getIERangeContainerHelper(false).container;
        } else {
            return this._range.endContainer;
        }
    },
    /**
     * Wrapper around range.startOffset see https://developer.mozilla.org/en/DOM/range.startOffset
     */
    getRangeStartOffset:function(){
        if(!this._supportsDomRange){
            return this._getIERangeContainerHelper(true).offset;
        } else {
            return this._range.startOffset;
        }
    },
    /**
     * Wrapper around range.endOffset see https://developer.mozilla.org/en/DOM/range.endOffset
     */
    getRangeEndOffset:function(){
        if(!this._supportsDomRange){
            return this._getIERangeContainerHelper(false).offset;
        } else {
            return this._range.endOffset;
        }
    },
    /**
     * getWordAtRange
     *
     * Obtains the word located at the start of the current selection range
     *
     * @return returns wordAtRange, the word located at the selections range.
     *
     */
    getWordAtRange:function(){
        return this._wordAtRangeCommon();
    },
    /**
     * replaceWordAtRange
     *
     * Replaces current word located at the start of the current selection range with
     * replacmentPrefix and replacement
     *
     * @param replacement String used to replace current value
     * @param replacementPrefix Optional String that is prefixed to the replacement value.
     * @param replacementNodeProps object representing the node to insert
     */
    replaceWordAtRange:function(replacement, replacementPrefix, replacementNodeProps){
        return this._wordAtRangeCommon(replacement, replacementPrefix, replacementNodeProps);
    },
    _wordAtRangeCommon:function(replacement, replacementPrefix, replacementNodeProps){
        var rangeNode = this.getRangeStartContainer();
        // IE converts &nbsp; to the character \xa0, which will not match in regular expressions as whitespace
        var rangeNodeVal = jive.Selection.replaceNbspWithWhitespace(rangeNode.nodeValue);

        if(this.alignRangeWithNearestTextNode(rangeNode)){
            rangeNode = this.getRangeStartContainer();
            rangeNodeVal = rangeNode.nodeValue;
        }

        // ensure that we have all the text
        if(replacement == null){
            if(this._normalizeTextNode(rangeNode, this.getRangeStartOffset())){
                // set the rangeNodeVal
                rangeNodeVal = rangeNode.nodeValue;
                this._range.collapse(true);
                this.makeRangeTheSelection();
            }
        }
        // split rangeNodeVal into two pieces, split occurs at start of range selection
        var rangeStartOffset = this.getRangeStartOffset();
        var wordFirstHalf = new String(rangeNodeVal).substring(0, rangeStartOffset);
        var wordSecondHalf = new String(rangeNodeVal).substring(rangeStartOffset);
        //console.log('halves "' + wordFirstHalf + '", "' + wordSecondHalf + '"');
        // regexps used to find the last word in the first half and the first word in the second half
        var firstHalfRegExp = /\S+$/, secondHalfRegExp = /^\S+/;

        if(replacement != null && replacement.length > 0){
            // replace with replacement word
            // default values
            replacementPrefix = replacementPrefix || '';
            replacementNodeProps = replacementNodeProps || {tag:'txt'};
            // the value to insert as the anchor's innerHtml
            var replacementVal = replacementPrefix + replacement;
            // replace the matched word with '' in the two halves
            wordFirstHalf = wordFirstHalf.replace(firstHalfRegExp, '');
            wordSecondHalf = wordSecondHalf.replace(secondHalfRegExp, '');
            // by default the second word should start with a space if tag/element is not a textNode
            if ((wordSecondHalf == null || wordSecondHalf.length == 0) && replacementNodeProps.tag != 'txt'){
                wordSecondHalf = ' ';
            }
            // create the correct replacement node based on the values in replacementNodeProps
            var replacementNode;
            if(replacementNodeProps.tag == 'txt'){
                replacementNode = document.createTextNode(replacementVal);
            } else {
                replacementNode = document.createElement(replacementNodeProps.tag);
                for(var key in replacementNodeProps.attrs){
                    replacementNode.setAttribute(key, replacementNodeProps.attrs[key]);
                }
                replacementNode.innerHTML = replacementVal;
            }

            // Insert the replacement node.
            // Insert the first half of the old node, then the replacement node, then the latter half of the
            // old node.
            // When inserting attempt to preserve the location of the selection node's cursor
            var parentNode = rangeNode.parentNode;
            if(wordFirstHalf != null && wordFirstHalf.length > 0)
                parentNode.insertBefore(document.createTextNode(wordFirstHalf), rangeNode);
            parentNode.insertBefore(replacementNode, rangeNode);
            var wordSecondHalfTxtNode = null;
            if(wordSecondHalf != null && wordSecondHalf.length > 0){
                wordSecondHalfTxtNode = document.createTextNode(wordSecondHalf);
                parentNode.insertBefore(wordSecondHalfTxtNode, rangeNode);
            }
            parentNode.removeChild(rangeNode);
            // previous range has been deleted, move the range to the inserted element
            var moveToNode = wordSecondHalfTxtNode == null ? replacementNode : wordSecondHalfTxtNode;
            this.moveToNodeAndCollapse(moveToNode);

            return replacementNode;
        } else {
            // return the word at the selection range
            wordFirstHalf = wordFirstHalf.match(firstHalfRegExp);
            wordSecondHalf = wordSecondHalf.match(secondHalfRegExp);
            // concat together to produce the word at cursor
            var wordAtRange = (wordFirstHalf == null ? '' : wordFirstHalf) + (wordSecondHalf == null ? '' : wordSecondHalf);
            return wordAtRange;
        }
    },
    /**
     * _normalizeTextNode - combines next & previous sibling nodes into one continuous text node
     * @param node - node to normalize
     * @param offsetAdj - Amount to adjust offset by
     * @returns true if any normalization occurred, false otherwise.
     */
    _normalizeTextNode:function(node, offsetAdj){
        offsetAdj = offsetAdj || 0;
        if(node == null || !node.nodeValue ||
           jive.Selection.replaceNbspWithWhitespace(node.nodeValue).search(/\S+/) == -1){
            // don't bother normalizing if the text node is empty
            return false;
        }
        // place the contents of all continuous text nodes into one text node
        var newNodeVal = "";
        var parentNode = node.parentNode;
        function normalizeSiblings(isPrev){
            var currentSiblingNode = isPrev ? node.previousSibling : node.nextSibling;
            while(currentSiblingNode != null && currentSiblingNode.nodeType == 3 &&
                jive.Selection.replaceNbspWithWhitespace(currentSiblingNode.nodeValue).search(/\S+/) > -1){
                if(isPrev){
                    newNodeVal = currentSiblingNode.nodeValue + newNodeVal;
                } else {
                    newNodeVal += currentSiblingNode.nodeValue;
                }
                var newCurrentSiblingNode = isPrev ? currentSiblingNode.previousSibling : currentSiblingNode.nextSibling;
                parentNode.removeChild(currentSiblingNode);
                currentSiblingNode = newCurrentSiblingNode;
            }
        }

        normalizeSiblings(true);

        // store offset to use later when moving the selector
        var offset = newNodeVal.length + offsetAdj;
        newNodeVal += node.nodeValue;

        normalizeSiblings(false);

        if(newNodeVal != node.nodeValue){
            //console.log('node val check new "' + newNodeVal + '", old "' + node.nodeValue + '"');

            if(!this._supportsDomRange){
                var oldRange = this._range.duplicate();
                var newNode = document.createTextNode(newNodeVal);
                parentNode.replaceChild(newNode, node);
                // move the range to old location
                this._range = oldRange.duplicate();
                this._range.moveStart('character', offset);
            } else {
                node.nodeValue = newNodeVal;
                this.setRangeStart(node, offset);
            }
            
            this._range.collapse(true);
            this.makeRangeTheSelection();
            
            return true;
        }

        return false;
    },
    /**
     * insertNodeAtRange - inserts a node at the current range location
     * @param node - node or string to insert
     * @param offsetAdj - Amount to adjust offset by
     */
    insertNodeAtRange:function(node, offsetAdj){
        var newNode = typeof node == 'string' ? document.createTextNode(node) : node;
        offsetAdj = offsetAdj || 0;
        // bug in firefox sometimes causes the endoffset to be off, just collapse the range to ensure
        // the bug doesn't cause problems
        if(this._supportsDomRange){
            this._range.collapse(true);
        }
        this.rangeInsertNode(newNode);
        // normalize node
        if(newNode.nodeType == 3){
            if(!this._normalizeTextNode(newNode, offsetAdj)){
                // didn't normalize node need to set offset of range.
                if(!this._supportsDomRange){
                    this._range.moveStart('character', offsetAdj);
                    this._range.collapse(true);
                } else {
                    this.setRangeStart(node, offsetAdj);
                }

                this.makeRangeTheSelection();
            }
        }
    },

    /**
     * range.selectNode.  The range endpoints become just before and just after the node.
     * @param node
     */
    selectNode: function(node){
        this._range.selectNode(node);
    },
    /**
     * range.collapse.  The range endpoints move to the same position; either the start or the end of the range.
     * @param collapseToStart
     */
    collapseRange: function(collapseToStart){
        this._range.collapse(!!collapseToStart);
    },

    /**
     * selectNodeContents selects all the contents of a node
     */
    selectNodeContents:function(parentNode){
        if(!this._supportsDomRange){
            var startMvAmnt = this.getRangeStartOffset() * -1;
            // obtain amount to move end
            var duplicateRange = this._range.duplicate();
            duplicateRange.moveToElementText(duplicateRange.parentElement());
            duplicateRange.setEndPoint('StartToEnd', this._range);
            var endMvAmnt = duplicateRange.text.length;

            this._range.moveStart('character', startMvAmnt);
            this._range.moveEnd('character', endMvAmnt);

            this._range.select();
        } else {
            this.getSelection().selectAllChildren(parentNode);            
        }
    },
    /**
     * moveToNodeAndCollapse Util to move a range to a node and collapse to that node
     * @param node node to move to
     * @collapseAtStart optional boolean, defaults to false, whether the range should collapse to start or end
     */
    moveToNodeAndCollapse:function(node, collapseAtStart, offset){
        if(collapseAtStart){
            this.setRangeStart(node, offset);
        } else {
            this.setRangeEnd(node, offset);
        }

        this._range.collapse(collapseAtStart);
        this.makeRangeTheSelection();
    },
    /**
     * alignRangeWithNearestTextNode - method to align a rangeNode that is not textNode to the closest text node 
     * @param rangeNode node to align to nearest text node
     * @return returns true if an alignment occurs, otherwise false
     */
    alignRangeWithNearestTextNode:function(rangeNode){
        rangeNode = rangeNode || this.getRangeStartContainer();
        if(rangeNode.nodeType != 3){
            var rangeNodeChildren = $j(rangeNode).contents();
            
            if(rangeNodeChildren.length > 0){
                // node has children find which offset points to
                var rangeStartOffset = this.getRangeStartOffset();
                var rangeNodeChild = rangeNodeChildren.get(rangeStartOffset);
                if(rangeNodeChild.nodeType == 3){
                    this.init(textNode, false);
                    return true;
                } else {
                    return this.alignRangeWithNearestTextNode(rangeNodeChild);
                }
            } else {
                rangeNodeChildren = $j(rangeNode).parent().contents();
                var nodeIndex = rangeNodeChildren.index(rangeNode);
                // move to the closest text node
                // first see if there is one that occurs before the node
                var collapseAtStart = false;
                var textNode = rangeNodeChildren.filter(function(i){return i < nodeIndex && this.nodeType == 3}).last();
                if(textNode.length == 0){
                    // look for one after the node
                    textNode = rangeNodeChildren.filter(function(i){return i > nodeIndex && this.nodeType == 3}).first();
                    collapseAtStart = true;
                }

                // select the node or give up
                if(textNode.length > 0){
                    this.init(textNode[0], collapseAtStart, collapseAtStart ? 0 : textNode[0].length);
                    return true;
                } else {
                    if (rangeNodeChildren.length) {
                        textNode = rangeNodeChildren.first();
                        this.init(textNode[0], collapseAtStart, collapseAtStart ? 0 : textNode[0].length);
                        return true;
                    }
                    else {
                        throw('alignRangeWithNearestTextNode Failed to find a text node to align with.');
                    }
                }
            }

        }
        return false;
    },
    // various IE specific helper functions
    /**
     * helper to get the range's container.  Mimics standard used in other browsers
     * see https://developer.mozilla.org/en/DOM/range.endContainer and
     * https://developer.mozilla.org/en/DOM/range.startContainer
     * @param isStart
     */
    _getIERangeContainerHelper:function(isStart){
        // Helper function to obtain range container for IE.
        // It's range api does not support startContainer and endContainer
        var offset = isStart ? this._getIERangeStartOffsetHelper() : this._getIERangeEndOffsetHelper();
        var parentElem = this._range.parentElement();
        var childNodesLenSum = 0;

        // loop through all the child elements and determine which one includes the selection
        var childNodes = parentElem.childNodes;
        if(childNodes.length == 0){
            // range occurs in an element with no children, return that element
            return parentElem;
        }
        for(var i = 0; i < childNodes.length; i++){
            var child = childNodes[i];
            var childTxtLen = $j(child).text().length;
            if(childTxtLen == 0 && child.nodeName == 'BR')
                childTxtLen = 2;    // In respect to TextRange offset, IE counts new lines as 2. See _getIERangeStartOffsetHelper

            if(offset <= childNodesLenSum + childTxtLen){
                return {container:child, offset:offset - childNodesLenSum};
            } else {
                childNodesLenSum += childTxtLen;
            }
        }
        // hack this in because I can't figure out why IE is so dumb about getting the startContainer after a line break
        return {container:child, offset:childNodesLenSum};
        throw('Error jive.selection._getIERangeContainerHelper could not find range container');

    },
    /**
     * helper function to get the startOffset from a range's parent element
     */
    _getIERangeStartOffsetHelper:function(){
        var duplicateRange = this._range.duplicate();
        duplicateRange.moveToElementText(duplicateRange.parentElement());
        duplicateRange.setEndPoint('EndToStart', this._range);
        return duplicateRange.text.length;
    },
    /**
     * helper function to get the endOffset from a range's parent element
     */
    _getIERangeEndOffsetHelper:function(){
        return this._range.text.length + this._getIERangeStartOffsetHelper();
    },
    /**
     * helper to allow IE to mimic the behavior of the standard for range.setStart and range.setEnd
     * see https://developer.mozilla.org/en/DOM/range.setStart and https://developer.mozilla.org/en/DOM/range.setEnd
     * @param node
     * @param offset
     * @param isEnd
     */
    _setRangeStartEndHelper:function(node, offset, isEnd){
        var isStartNodeTypeText = node.nodeType == 3;
        var element = isStartNodeTypeText ? node.parentNode : node;
        var dupRange = this._range.duplicate();
        dupRange.moveToElementText(element);
        offset = offset || 0;

        // calculate offset for IE.  IE offset values are from the start of the element node and not the start of
        // the text node
        // Get all the siblings of the parent node including text nodes
        var $siblings = $j(node).parent().contents();
        var indexOfNode = $siblings.index(node);
        var offsetIE;
        if(isStartNodeTypeText){
            // get all the previous siblings of the node and calculate their text length
            // add the offset to this result
            offsetIE = $siblings.slice(0, indexOfNode).text().length + offset;
        } else {
            // get all the previous siblings of the offset node and calculate their text length
            offsetIE = $siblings.slice(0, indexOfNode + offset).text().length;
        }

        dupRange.moveStart('character', offsetIE);
        // IE doesn't count characters in ranges as expected, it actually inserts extra characters for non text nodes,
        // but it's not clear what these amounts will be.  The following is hack to get around this.
        // We compare the text stored in the range at the offset with what we would expect there, if it's off we adjust
        // the range
        var sliceIndex;
        var regExpStr;
        if(isStartNodeTypeText){
            sliceIndex = indexOfNode + 1;
            regExpStr = jive.Selection.replaceNbspWithWhitespace($j(node).text()).substring(offset);
        } else {
            sliceIndex = indexOfNode + offset + 1;
            regExpStr = jive.Selection.replaceNbspWithWhitespace($siblings.slice(indexOfNode + offset));
        }

        // regexp to determine how many characters more we need to adjust the ie offset (IE appears to always need
        // more characters when it's off)
        var rangeStartRegExp = new RegExp('(.*)' + regExpStr);
        function getDupRangeTxt(){return new String(dupRange.text).replace(new RegExp($siblings.slice(sliceIndex).text() + '$'), '');};
        var dupRangeTxt = getDupRangeTxt();
        // determine the amount we need to adjust, may have to try multiple times to get the correct amount
        // Only try 10 times
        var attemptNumber = 0;
        while(dupRangeTxt != regExpStr){
            // find the rangeText for this node from the offset, by removing any text that appears in next sibling nodes
            dupRangeTxt = getDupRangeTxt();
            var match = dupRangeTxt.match(rangeStartRegExp);
            if(match != null && match.length == 2){
                // move the range and check if range is in the correct spot in the while's break conditional,
                // if the range is not in the correct position try again.
                dupRange.moveStart('character', match[1].length);
            } else {
                throw('jive.Selection _setRangeStartEndHelper failed to setRange Start or End');
            }

            attemptNumber++;
            if(attemptNumber == 10){
                throw('jive.Selection _setRangeStartEndHelper failed to setRange Start or End');
            }
        }

        // finally set the range start or end point
        if(isEnd){
            this._range.setEndPoint('EndToStart', dupRange);
        } else {
            this._range.setEndPoint('StartToStart', dupRange);
        }
    }
});

jive.Selection.getSelection = function(win, doc){
    if(!win) win = window;
    if(!doc) doc = document;
    if (win.getSelection) { // recent Mozilla versions
        return win.getSelection();
    } else if (doc.all) { // MSIE 4+
        return doc.selection;
    } else if (doc.getSelection) { //older Mozilla versions
        return doc.getSelection();
    }

    throw("jive.Selection.getSelector Error: unable to obtain seleciton object");
};

jive.Selection.getRangeAt = function(selection, index, doc){
    if(!doc) doc = document;
    if(selection.getRangeAt) { // non-IE
        return selection.getRangeAt(index);
    }else if(doc.selection){ // IE
        return selection.createRange();
    }

    throw("jive.Selection.getRangeAt Error: unable to obtain seleciton object");
};


jive.Selection.moveCursorAfter = function(node, doc) {
    if(!doc) doc = document;
    var foo = doc.createElement("span");
    foo.setAttribute("data-jive-statusinputadd","true");
    foo.innerHTML = "&nbsp;";
    node.parentNode.insertBefore(foo,node);
    node.parentNode.insertBefore(node,foo);
    var range = new jive.Selection(foo,true);
    node.parentNode.removeChild(foo);
};

jive.Selection.createRangeAtNode = function(node, doc){
    if(!doc) doc = document;
    if (doc.createRange) { // recent Mozilla versions
        var newRange = doc.createRange();
        newRange.selectNodeContents(node);
        return newRange;
    } else if (node.createRange) { // MSIE 4+
        return node.createRange();
    }

    throw("jive.Selection.createRange Error: unable to obtain range object");
};

jive.Selection.replaceNbspWithWhitespace = function(obj){
    // IE converts &nbsp; to the character \xa0, which will not match in regular expressions as whitespace
    return String(obj).replace(/\xA0/g, ' ');
};

}
