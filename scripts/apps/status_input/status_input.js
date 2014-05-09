/*jslint browser:true laxbreak:true */
/*extern jive $j $Class */

/**
 * Status input base class
 *
 * @depends path=/resources/scripts/jquery/jquery.oo.js
 * @depends path=/resources/scripts/jquery/jquery.asyncReady.js
 * @depends path=/resources/scripts/jive_selection.js
 * @depends path=/resources/scripts/apps/status_input/status_input_drop_down.js
 * @depends path=/resources/scripts/rangy.js
 * @depends path=/resources/scripts/jive/fresh_action_queue.js
 */
jive.namespace('StatusInput');
/**
 * Make sure we only include this file once per page load.  If we do not have this block here there are 2 cases where
 * this script could be loaded multiple times:
 * 1) When resource combined is false behavior could be different from when it's on, ideally the behavior should be the same.
 * 2)  If an ajax request is made for an ftl with javascript includes the file will be reloaded (assuming it was already
 * loaded on page load)
 *
 * At a later date we can roll this work into namespace or a new function that is similar to namespace
 */
if(!jive.StatusInput.StatusInputs){

jive.StatusInput.StatusInputs = $Class.extend({
    init:function(container, options){
        this._container = $j(container);
        this._i18n = options.i18n;
        this.statusInputs = {};
        var that = this;
        // Temp fix for race condition
        //$j(document).ready(function() {
        $j(document).asyncReady(function() {
            that._docReadyInit(options);
            that.emit('ready');
        });
    },
    getSubmitVals:function(id){
        return this.getStatusInput(id).getSubmitVals(true);
    },
    resetText:function(id){
        this.getStatusInput(id).resetText();
    },
    _docReadyInit:function(options){
        var that = this;
        this._container.find(".jive-js-statusinput").each(function(){
            var id = $j(this).attr('id');
            that.statusInputs[id] = new jive.StatusInput.StatusInput($j(this), options);
        });
    },
    getStatusInput:function(id){
        return this.statusInputs[id];
    }
});

jive.conc.observable(jive.StatusInput.StatusInputs.prototype);

// Mixes in `addListener` and `emit` methods so that other classes can
// listen to events from this one.
jive.conc.observable(jive.StatusInput.StatusInputs.prototype);

jive.StatusInput.StatusInput = $Class.extend({
    init:function(container, options){
        options.mobileUI = options.mobileUI || jive.rte.mobileUI;
        this._container = $j(container);
        this.mobileUI = options.mobileUI;
        if(this.mobileUI){
            this._container = $j("<input type='text' class='rteReplacement'/>");
            $j(container).before(this._container);
            $j(container).remove();
        }

        this._mobileEditor = options.mobileUI;
        this._i18n = options.i18n;
        this._selection = null;
        this._replacedInitialText = false;
        this._initDD(options);
        this._initDDHandlers();
        this._maxCharCount = options.maxCharCount;
        this._maxCharCountBeforeWarning = ((this._maxCharCount) ? (options.maxCharCountBeforeWarn || this._maxCharCount * .8) : 0);
        this._previousMatchReqsSpaceAfter = null;
        this._previousPasteVal = null;
        this._previousSanitizedHTML = null;
        this._supportsDomRange = $j.isFunction(window.getSelection);
        this._id = this._container.attr('id');

        var that = this;

        define(['jive.conc.FreshActionQueue'], function(FreshActionQueue) {
            that._actionQueue = new FreshActionQueue();
        });

        $j(document).bind('keyup mouseup', function(e){
            e.stopPropagation();
            switch(e.which){
                case 1:
                case 2:
                case 3:
                    break;
                case 13:
                    e.preventDefault();
                    break;
                case 27:
                    // mouse click or escape key
                    that._dd.hide();
                    return;
                    break;
                default:
                    break;
            }
        });

        this._container.bind('keypress', function(e) {
            switch(e.which){
                case 13:
                    e.preventDefault();
                    if(this._mobileEditor) return false;
                    break;
            }
        });

        this.delay = (function(){
            var timer = 0;
            return function(callback, ms){
                clearTimeout (timer);
                timer = setTimeout(callback, ms);
            };
        })();

        this._container.bind('keydown', function(e) {
            e.stopPropagation();
            switch(e.which){
                case 13:
                    e.preventDefault();
                    break;
                case 37:
                    if(!$j.browser.msie){
                        if (that._selection._selection.anchorNode &&
                            that._selection._selection.anchorNode.parentNode == that._container[0].firstChild &&
                            that._selection._selection.anchorOffset == 0) {
                            // if we press the left arrow key while at the start of the container and the first element is
                            // a link, add a space char to the start of the container and collapse so the cursor will look
                            // correct.
                            $j(that._container[0]).html("&nbsp"+$j(that._container[0]).html());
                            that._selection.moveToNodeAndCollapse(that._container[0].firstChild,true,0);
                        }
                    }
                    else {
                        // for IE, use rangy.js library to get the anchorOffset
                        var newRange = document.selection.createRange(),
                            rangySelection = rangy.getSelection();

                        if (newRange && newRange.parentElement() == that._container[0].firstChild &&
                            rangySelection.anchorOffset == 0) {
                            $j(that._container[0]).html("&nbsp"+$j(that._container[0]).html());
                            that._selection.moveToNodeAndCollapse(that._container[0].firstChild,true,0);
                        }
                    }
                    return;
                    break;
                // up and down arrows, respectively
                case 38:
                case 40:
                    // JIVE-3905 - When using the keyboard to select users from the drop down during an @mention, the
                    // resulting html was incorrect when more than one user was mentioned.
                    if (that._dd.isVisible()) {
                        e.preventDefault();
                    }
                    break;

                default:
                    break;
            }

            //adding a short delay to prevent simulaneous events from firing
            that.delay(function () {
                that._selection = new jive.Selection();

                switch(e.which){
                    case 13:
                        // enter key
                        if(this._mobileEditor) return false;

                        if(that._dd.isVisible()){
                            that._dd.hide();
                            return false;
                        }

                        if($j.browser.msie && parseFloat($j.browser.version.charAt(0)) < 9){
                            //Short-term hack for nightcap.  The behavior is not as terrible as the alternative.
                            var range = document.selection.createRange();
                            range.pasteHTML("<br data-jive-statusinputadd='true' />");
                            range.select();
                            break;
                        }
                        
                        // insert a br into the container, in order to be able to move the cursor to the next line,
                        // needed to insert a blank text node at the current cursor pos, then the br at the same current cursor pos
                        // (making the br be BEFORE the blank text node), then move the range to the blank text node
                        var br = document.createElement('br');
                        br.setAttribute('data-jive-statusinputadd','true');
                        var txtNode = document.createTextNode("");
                        that._selection.insertNodeAtRange(br);
                        that._selection.selectNode(br);
                        that._selection.collapseRange(false);
                        that._selection.insertNodeAtRange(txtNode);
                        that._selection.selectNodeContents(txtNode);
                        break;
                    case 27:
                        // escape key
                        that._dd.hide();
                        that.emit('escapeKeyPress');
                        return;
                        break;
                    case 32:
                        // space key
                        that._dd.hide();
                        return;
                        break;
                    case 37:
                    case 39:
                        return;
                        break;
                    case 38:
                        // up arrow (was being weird with processToken below on new lines)
                        return;
                        break;
                    case 40:
                        // down arrow
                        that._dd.selectItem(0);
                        return;
                        break;
                    default:
                        break;
                }

                if ((that._mobileEditor && that._container.val().length == 0) ||
                    (!that._mobileEditor && that._container.text().length == 0)){
                    that._dd.hide();
                    if (that._maxCharCount) {
                        that.emit('characterLenMsg', 'ok', { charCount: that.getCharCount() });
                    }
                    return;
                }

                // sanitize anything we may have missed
                that.sanitizeHTML();

                // select input text if the user has not interacted with the text box
                if(!that._replacedInitialText){
                    that._replacedInitialText = true;
                }

                that._processToken();

                // handle character warnings and errors
                if (that._maxCharCount) {
                    var charCount = that.getCharCount();
                    if(charCount > that._maxCharCountBeforeWarning){
                        if(that.getCharCount() > that._maxCharCount){
                            that.emit('characterLenMsg', 'error', {charCount:charCount, charOver:charCount - that._maxCharCount});
                        } else {
                            that.emit('characterLenMsg', 'warning', {charCount:charCount, charLeft:that._maxCharCount - charCount});
                        }
                    } else {
                        that.emit('characterLenMsg', 'ok', { charCount: that.getCharCount() });
                    }
                }

            }, 75 );
        });

        this._container.bind('focus', function () {
            that.sanitizeHTMLInterval = window.setInterval($j.proxy(that.sanitizeHTML, that), 500);
        });

        // Run any pending token processing when the status input loses focus.
        this._container.blur(function() {
            that._processCompleteToken();
            that.emit('blur');
            window.clearInterval(that.sanitizeHTMLInterval);
        });

        // ensure status input is added to sanitize list
        this._addInstanceToInstanceObj();
    },
    _addInstanceToInstanceObj:function(){
        // add reference to global instances for html sanitizing
        jive.StatusInput.StatusInput.instances[this._id] = this;
    },
    _initDD:function(options){
        this._dd = new jive.StatusInput.StatusInputDropDown(this._container, options);
    },
    _initDDHandlers:function(){
        var that = this;
        this._dd.addListener('interactionFinished', function(selectedItemData, prefix, extraAnchorAttrs){
            if(selectedItemData != null){
                var $value    = $j('<div />').html(selectedItemData.value),
                    title     = jive.util.escapeHTML($value.text()),
                    $span     = $value.find('span'),
                    linkAttrs = $j.extend({ 'data-jive-statusInputadd':'true', href:selectedItemData.href, 'data-jive-statusInputInteral':'true' }, extraAnchorAttrs || {});
                // add jiveID to linkAtts if "id" is present in selectedItemData
                selectedItemData.id && (linkAttrs.jiveID = selectedItemData.id);

                // generate the class name for the resulting anchor
                var classes = ($span.attr('class') || '').split(/\s+/);
                linkAttrs['class'] = that._generateIconClass(classes);

                //put a space after the link
                var space = document.createTextNode(' ');
                var anchor = that._selection.replaceWordAtRange(title, prefix || '', {tag:'a', attrs:linkAttrs});
                anchor.parentNode.insertBefore(space, anchor.nextSibling);
                that._selection.moveToNodeAndCollapse(space, false, space.nodeValue.length);
            }
            that._dd.hide();
            that._focus(true);
            that.emit('atMentionFinished', selectedItemData.id, selectedItemData.value);
        });
    },

    /**
     * Convert sprite icon class names to their corresponding single image class names.
     *
     * @param {string[]} classNames
     * @returns {string}
     */
    _generateIconClass : function(classNames) {
        var map = {
                'jive-icon-blog'                 : 'jive-link-blog-small',
                'jive-icon-doctype-compressed'   : 'jive-icon-doctype-compressed-small',
                'jive-icon-discussion'           : 'jive-icon-discussion-small',
                'jive-icon-discussion-bridged'   : 'jive-icon-discussion-bridged-small',
                'jive-icon-discussion-correct'   : 'jive-icon-discussion-correct-small',
                'jive-icon-discussion-question'  : 'jive-icon-discussion-question-small',
                'jive-icon-doctype-acrobat'      : 'jive-icon-doctype-acrobat-small',
                'jive-icon-doctype-document'     : 'jive-icon-doctype-document-small',
                'jive-icon-doctype-image'        : 'jive-icon-doctype-image-small',
                'jive-icon-doctype-presentation' : 'jive-icon-doctype-presentation-small',
                'jive-icon-doctype-spreadsheet'  : 'jive-icon-doctype-spreadsheet-small',
                'jive-icon-document'             : 'jive-link-wiki-small',
                'jive-icon-external-site'        : 'jive-link-url-small',
                'jive-icon-group'                : 'jive-link-socialgroup-small',
                'jive-icon-poll'                 : 'jive-link-poll-small',
                'jive-icon-profile'              : 'jive-link-profile-small',
                'jive-icon-project'              : 'jive-link-project-small',
                'jive-icon-tag'                  : 'jive-link-tag-small',
                'jive-icon-space'                : 'jive-link-community-small'
            },

            // iterate through the classNames and return the value of the corresponding small icon class name.
            result = $j.map(classNames, function(name) {
                return name in map ? map[name] : null;
            });


        // returns the first result or an empty string if not found
        return result.shift() || '';
    },

    getContainer:function(){
        return this._container;
    },
    getSubmitVals:function(truncate){
        if (truncate) {
            // truncate values if over max allowable characters
            this._truncateNodes();
        }

        var messageVal;
        if(this._mobileEditor){
            messageVal = jive.util.escapeHTML(this._container.val());
        }else{
            messageVal = this._container.html();
        }

        // Remove br added for mozilla bug
        messageVal = messageVal.replace(/<\/?br _[^>]*>/gi, "");

        // IE likes to change relative links to absolute links and uppercase all HTML tags
        // for some reason, so we need to make them relative and lowercase again.
        // Remove attributes added to keep track of auto complete added items and truncation
        messageVal = messageVal.replace(/(<\/?)(\w+)([^>]*>)/gi, function(str, p1, p2, p3){
            return p1 + p2.toLowerCase() + p3.replace(/((data-jive-statusInputadd)|(data-jive-truncation-flag))=["']true["']/gi, '');
        });
        messageVal = messageVal.replace(/(<\/?[aA]\s+[^>]*href=")([^"]*)("[^>]*>)/gi, function(str, p1, p2, p3){
            if (str.search(/<\w+[^>]*data-jive-statusinputinteral="true"[^>]*>/gi) != -1) {
                var relativeUrl = p2.replace(/https?\:\/\//, '').split('/').slice(1).join('/');
                return p1 + '/' + relativeUrl + p3;
            } else {
                return str;
            }
        });
        return messageVal;
    },
    _truncateNodes:function(){
    	if(this.getCharCount() > this._maxCharCount){
        	var childNodes = this._container[0].childNodes;
            var childNodesLenSum = 0;
            var removeChildFlag = false;
            // loop through all the child elements and remove/truncate as needed
            for(var i = 0; i < childNodes.length; i++){
            	var childNode = childNodes[i];
                if(removeChildFlag){
                	this._container[0].removeChild(childNode);
                } else {
                	var childNodeTxtLen = $j(childNode).text().length;
	                if(childNodesLenSum + childNodeTxtLen > this._maxCharCount){
	                	var truncateAfterEnd = this._maxCharCount - childNodesLenSum;
	                	this._truncateNode(childNode, truncateAfterEnd);
	                    removeChildFlag = true;
	                }
	                childNodesLenSum += childNodeTxtLen;
                }
            }
		}
    },
    _truncateNode:function(node, end){
    	if(node.nodeType == 3){
    		// TextNode, trim or move to the next textNode
    		var value = node.nodeValue;
    		if(value.length < end){
    			return end - value.length;
    		} else {
    			node.nodeValue = node.nodeValue.substr(0, end);
    			return 0;
    		}
    	} else {
    		var childNodes = node.childNodes;
            // loop through all the child elements and remove/truncate as needed
            for(var i = 0; i < childNodes.length; i++){
            	if(end == 0){
            		node.removeChild(childNodes[i]);
            	} else {
            		end = this._truncateNode(childNodes[i], end);
            	}
            }
    	}
    },
    truncateAnchors:function(){
        // Truncate any anchors that need to be truncated
        // Truncate any link marked as external that has not already been marked as truncated
        // Truncate any non internal link in a status input box that has been marked as added and not truncated.
        $j(this._container).find('[data-jive-statusinputadd=true]:not([data-jive-truncation-flag=true],[data-jive-statusinputinteral=true])').each(function(){
            var $this = $j(this);
            // only want to truncate text nodes, assumes text nodes contain entire url or text to be truncated
            $this.contents().filter(function() {return this.nodeType == 3;}).each(function(){
                var $textNode = $j(this);
                // replace the text node with a new node
                $textNode.replaceWith(document.createTextNode(jive.util.truncateStr($textNode.text())));
            });
            // mark this element as truncated
            $this.attr('data-jive-truncation-flag', true);
        });
    },
    sanitizeHTML:function(){
        // no need to sanitize if the html value has not changed since last sanitation
        var containerHTML = this._container.html();
        if(this._previousSanitizedHTML == containerHTML){
            return;
        }
        // make sure last child is <br _moz_dirty=''>
        // otherwise bugs with firefox and elements with contentEditble=true will occur
        var lastChild = this._container[0].lastChild;
        if (!$j.browser.msie && (lastChild == null || lastChild.nodeType == 3 || lastChild.nodeName && lastChild.nodeName.toLowerCase() != 'br')){
            var mozBr = document.createElement('br');
            mozBr.setAttribute('_moz_dirty', '');
            this._container[0].appendChild(mozBr);
        }

        // truncate any anchors that are too long
        this.truncateAnchors();
        // check if there is any html that is invalid and strip it.
        // this function is called on a regular interval to ensure non catchable events are handle
        if(!$j.browser.msie){
            containerHTML = containerHTML.replace(/<\/?br[^>]*>$/mi, "");
        }

        // Remove any empty html tags (empty meaning no text nodes) from inserted content, fixes case where browser does
        // not allow user to delete an empty node
        var that = this;
        this._container.find('a[data-jive-statusinputadd=true]').filter(function(){return $j(this).text() == '';}).each(function(){
            // get the node where the cursor is located
            var currentRangeNode = that._selection.getRangeStartContainer();
            var $this = $j(this);

            if($j(currentRangeNode).parents($this).length > 0){
                // We will be removing the node that currently has the cursor located in it
                // We'll need to preserve it's location
                // Obtain the closest sibling, including text nodes
                var $contents = $this.parent().contents(':not(br)');
                // use the index of this node to find the closest sibling
                var indexOfElem = $contents.index($this);
                // node to move cursor to
                var focusNode;
                var focusNodeOffset = 0;
                if(indexOfElem > 0){
                    // preferably get the previous sibling and note it's offset
                    focusNode = $contents[indexOfElem - 1];
                    focusNodeOffset = $j(focusNode).text().length;
                } else if(indexOfElem < $contents.length - 1){
                    // otherwise get the next sibling
                    focusNode = $contents[indexOfElem + 1];
                }

                // Failed to obtain focus node, just grab it's parent (if it's not the container elem)
                if(!focusNode && $this.parent()[0] !== that._container[0]){
                    // try and get closest parent.
                    focusNode = $this.parent()[0];
                }

                // If we don't find a focus node, the cursor will end up at the start of the status input,
                // which in some cases is valid
                if(focusNode){
                    that._selection.moveToNodeAndCollapse(focusNode, true, focusNodeOffset);
                }
            }

            // remove the empty node (contains no text nodes)
            $this.remove();
        });
        // strip html from all children that have not been added via auto-complete (top level elements without the attribute
        // data-jive-statusInputAdd with the exception of the br for mozilla)


        /*
         *  Strip HTML from input.
         *
         *  This gets a little tricky when we are cleaning up after a paste. Firefox, Chrome and IE all paste different
         *  text.  First we will collect the nodes to be sanitized, then we will create text nodes to replace them.
         */

        // Children should not have the attribute 'data-jive-statusInputadd' with a value of 'true' (if this attribute
        // is present it means the element was added via auto-complete.
        var children = this._container.children('[data-jive-statusInputadd!=true]');

        // Ignore the last child in non-IE browsers
        if (!$j.browser.msie) {
            children = children.filter(':not(:last)');
        }

        // Ignore <br /> tags, but strip any inappropriate attributes
        children.filter('br').not('[_moz_dirty]').each(function() {
            $j(this).replaceWith('<br />');
        });
        children = children.not('br');


        if(children.length > 0){
            var lastNode,
                totalBlockElements = 0,

                isStyleNode = function(node) {
                    return /^style$/i.test(node.nodeName || '');
                },

                shouldPrefaceWithBr = function(element) {
                    if (/^(p|div)$/i.test(element.tagName)) {
                        // do not preface the first block element
                        return totalBlockElements++ > 0;
                    }

                    return false;
                };

            // replace the applicable children with their text
            children.each(function() {
                var $this = $j(this);

                if (isStyleNode(this)) {
                    $this.remove();
                }else{
                    // JIVE-5785: When pasting text with line breaks, some browsers paste <br />'s and some paste
                    // block elements (p or div). Add <br />'s before all block elements except the first one.
                    if (shouldPrefaceWithBr(this)) {
                        $this.before('<br data-statusInputadd="true" />');
                }

                    lastNode = document.createTextNode($this.text());
                    that._container[0].replaceChild(lastNode, this);
                }
            });

            // browsers need to have the range moved to the location after the paste
            if (this._selection) {
                this._selection.moveToNodeAndCollapse(lastNode, true, lastNode.nodeValue.length);
            }
        }

        this._previousPasteVal = this._container.text();

        this._previousSanitizedHTML = this._container.html();
    },
    resetText:function(){
        this._setText('');
        this._replacedInitialText = false;
        this.emit('characterLenMsg', 'ok', { charCount: this.getCharCount() });
    },
    handleAtMentionButtonClick:function(){
        this._replacedInitialText = true;
        var rangeContainer = this._selection == null ? null : this._selection.getRangeStartContainer();
        // either there is no selection or range is in an incorrect location, in theory the latter should not happen,
        // but in reality sometimes does.
        if(this._selection == null || $j(rangeContainer).parents('#' + this._container.attr('id')).length == 0 ||
                this._container.contents().length == 0){
            // user create range and selectNodeContents to obtain a selection
            this._createNewSelectionUtil();
        } else {
            this._selection.alignRangeWithNearestTextNode(rangeContainer);
        }
    },
    getCharCount:function(){
        if (this.mobileUI) {
            return this._container.val().length;
        }
        else {
            return this._container.text().length;
        }
    },
    _setText:function(val){
        if(this._mobileEditor){
            this._container.val(jive.util.unescapeHTML(val));
        }else{
            this._container.html(val);
        }
    },
    _focus:function(selectNewNode){
        this._container.focus();
    },

    /**
     * Creates a new selection at the end of the status input, helpful when the range is null or a selection has not
     * been made.
     */
    _createNewSelectionUtil:function(){
        var collapseAtStart = false;
        if($j.browser.msie){
            // IE doesn't have a br character
            if(this._container.contents().length == 0) {
                // container contains no childNodes
                this._selection = null;
                return;
            }
        } else {
            var lastChild = this._container[0].lastChild;
            if (!lastChild) {
                this.sanitizeHTML();
                lastChild = this._container[0].lastChild;
            }
            collapseAtStart = lastChild.nodeName.toLowerCase() == 'br';
        }
        this._selection = new jive.Selection(this._container[0].lastChild, collapseAtStart);
    },
    _getTokens: function() {
        return jive.StatusInput.StatusInput.Tokens;
    },

    _getPatterns:function(){
        return jive.StatusInput.StatusInput.Patterns;
    },
    _isMatch:function (type, matchStr){
        return matchStr.search(new RegExp(this._getPatterns()[type], "gi"))  > -1;
    },
    _matchUtil:function (type, matchStr){
        return matchStr.match(new RegExp(this._getPatterns()[type], "gi"));
    },

    _processToken: function() {
        if(!this._mobileEditor){
            var wordAtRange = this._selection.getWordAtRange();

            // if the user has entered a space
            if (wordAtRange === '') {
                this._processCompleteToken();

            // if the cursor is still within the token
            } else {
                this._processPartialToken(wordAtRange, this._selection.getRangeStartContainer());
            }
        }
    },

    _processCompleteToken: function() {
        // only process the complete token on blur if the drop down box is not currently visible.
        if(!this._dd.isVisible()){
            var callbacks = this._tokenCallbacks || [];

            // Execute all of the accumulated callbacks for tokens that require
            // a space to be typed before they are processed.
            callbacks.forEach(function(callback) {
                callback();
            });

            if (callbacks.length < 1) {
                this._dd.hide();
            }

            // Empty the list of callbacks.
            this._tokenCallbacks = [];
        }
    },

    _processPartialToken: function(word, node) {
        var callbacks = []  // Reset "complete" callbacks to avoid processing a token more than once.
          , tokens = this._getTokens()
          , matched = false
          , that = this;

          Object.keys(tokens).forEach(function(k) {
            var token = tokens[k]
              , matches = word.match(token.regExp);
            if (matches) {
                matched = true;
                matches.push(node);
                if (token.complete) {
                    // Save match state in case this token is about to be
                    // completed.
                    callbacks.push(function() {
                        token.complete.apply(that, matches);
                    });
                }
                if (token.keypress) {
                    token.keypress.apply(that, matches);
                }
            }
        });

        // if no token matched the input
        if (!matched) {
            this._dd.hide();
        }

        // Store "complete" callbacks for matched tokens.
        this._tokenCallbacks = callbacks;
    },

    // model methods
    _obtainData:function(url) {
        var deferred, promise;

        if (!jive.StatusInput.StatusInput.dataCache.hasOwnProperty(url)) {
            promise = $j.getJSON(url);
            promise.then(function(data) {
                jive.StatusInput.StatusInput.dataCache[url] = data;
            });
        } else {
            deferred = new $j.Deferred();
            deferred.resolve(jive.StatusInput.StatusInput.dataCache[url]);
            promise = deferred.promise();
        }

        return promise;
    },
    _obtainSearchData:function(query){
        return this._obtainData(jive.rest.url('/emention/search/') + encodeURI(query) + '*');
    }
});

/**
 * Static functions and vars
 *
 */
// values are cached per page for now
jive.StatusInput.StatusInput.dataCache = {};
// util to deal with paste events and other events we can't capture in the browser
jive.StatusInput.StatusInput.instances = {};
// Temp fix for race condition
//$j(document).ready(function() {
$j(document).asyncReady(function() {
    // clear cache every five minutes
    window.setInterval(function(){jive.StatusInput.StatusInput.dataCache = {};}, 300000);
    // check every 500 msec for changes to each status input on the page
    //window.setInterval(jive.StatusInput.StatusInput.sanitizeHTMLIntervalHandler, 500);
});

jive.StatusInput.StatusInput.sanitizeHTMLIntervalHandler = function(){
    for(var key in jive.StatusInput.StatusInput.instances){
        jive.StatusInput.StatusInput.instances[key].sanitizeHTML();
    }
};

/*
 * Given an object with strings as values returns a new object with the same
 * keys but with the corresponding values converted into regular expressions.
 *
 * Any values that are given as arrays are converted joined with "|" and
 * converted to a single regular expression.
 */
jive.StatusInput.StatusInput.getRegExpsFromPatterns = function(patterns) {
    var regExps = {};
    Object.keys(patterns).forEach(function(k) {
        var pattern = patterns[k], exp;
        if ($j.isArray(pattern)) {
            exp = pattern.map(function(p) {
                return "("+ p +")";
            }).join('|');
        } else {
            exp = pattern;
        }
        regExps[k] = new RegExp(exp);
    });

    return regExps;
};

jive.StatusInput.StatusInput.Patterns = {
    mention:"@([^@ ]+)?"
};

jive.StatusInput.StatusInput.Tokens = {
    // @ mention
    mention: {
        regExp: new RegExp(jive.StatusInput.StatusInput.Patterns.mention, 'i'),
        keypress: function(match, name) {
            var that = this;

            if (name && name.length >= 2) {
                // @ followed by string, make a request for search data
                this._actionQueue.push(this._obtainSearchData(name)).then(function(data) {
                    that._dd.renderSearchData(data);
                });

            } else {
                // just @
                // do nothing
            }
        }
    }
};

// Mixes in `addListener` and `emit` methods so that other classes can
// listen to events from this one.
jive.conc.observable(jive.StatusInput.StatusInput.prototype);


// TODO Remove the following classes and make use of reusable views and controllers in jive.MicroBlogging namespace
/*
    Renders the entire attachments box.
    data - object containing the elements to display in the box (sent to the soy)
    containerElem - the container that will display the attachments
    createform - whether or not this is part of the create form (true) or just displaying the attachments (false)
    i18n - keys
 */
jive.StatusInput.renderAttachmentsWrapper  = function(data, containerElem, createForm){
    if (data.attachments) {
        containerElem.append(jive.statusinput.attachments.renderAttachments({entry: {meta: data.attachments}, removable:createForm}));
    }
    else {
        containerElem.append(jive.statusinput.attachments.renderAttachments($j.extend({}, data, {removable:createForm})));
    }
    if (createForm) {
        containerElem.slideDown('fast', function() {
            $j(this).animate({'opacity': 1}, 500);
        });
    } else {
        containerElem.css('opacity', '1').show();
    }
    jive.StatusInput.bindAttachment(containerElem.find('ul.j-attached-items'), createForm);
};


jive.StatusInput.renderAttachmentWrapper  = function(data, containerElem, createForm){
    containerElem.append(jive.statusinput.attachments.renderAttachment($j.extend(data, {removable:createForm})));
};




/* --------------------------------------------------------------------------------
    Handles binding events associated with the attachment box.
     container is expected to be the UL containing the attachment LIs.
     It is expected that container is inside of a div.j-attachment-container
 -----------------------------------------------------------------------------------*/
jive.StatusInput.bindAttachment = function(container, createForm) {

    var totalWidth = 0,
        diff;

    /* Calculate the width of the container so that the slider arrows work correctly */
    container.find('li:visible').each(function() {
        totalWidth += $j(this).outerWidth();
    });

    /* Set width in CSS so that the floated elements don't stack on top of each other
       Also set innerWidth data to be the totalWidth in case we need it again (so we don't have to calculate it again)
     */
    container.css('width', totalWidth + 'px').data('innerWidth', totalWidth);

    /* Calculate the diff between the container width and the width of its wrapper */
    diff = container.width() - container.closest('.j-attachment-container').width();

    /* If there is a discrepency then scroll all the attachments to the left so the user can see the newest one */
    if (diff > 0 && createForm) {
        container.animate({'left': (diff*-1-40)}, 300);
    }

    /* show play arrows on hover for youtube videos */
    container.find('li a.j-attach-anchor').unbind('hover').hover(function() {
        $j(this).find('.j-icon-play').stop().fadeTo('fast', .6);
    }, function() {
        $j(this).find('.j-icon-play').stop().fadeOut('fast');
    });

    /* Binding arrow actions */
    container.parent().find('.j-attachment-arrow').unbind().mousedown(function() {
        try{
            var speed;
            var arrowWidths = $j(this).outerWidth() * 2;
            diff = container.width() - container.closest('.j-attachment-container').width();
            var currLeft = parseInt(container.css('left'));
            if(isNaN(currLeft)) currLeft = 0;
            if ($j(this).hasClass('j-attachment-arrow-right') && diff > 0) {
                speed = currLeft + (diff + arrowWidths);
                container.stop().animate({'left': (-diff - arrowWidths)}, speed*5, 'linear');
            } else if (diff > 0) {
                speed = currLeft * -1;
                container.stop().animate({'left': 0}, speed*5, 'linear');
            }
        }catch(e){
            console.log(e);
        }
    }).mouseup(function() {
        container.stop();
        return false;
    }).click(function() { return false } );

    if (!createForm) {
        jive.StatusInput.sizeContainer(container.parent().parent());
    } else {
        jive.StatusInput.showArrows();
    }
}

$j(window).resize((function() {
    var prevWidth;
    return function() {
        var width = $j(window).width();
        if (prevWidth && width !== prevWidth) {
            jive.StatusInput.sizeContainer();
        }
        prevWidth = width;
    };
})());

/**
 * Iterates through all '.j-attachment-container' elements in Connection
 * Activity widgets and resizes them to fit inside the connection activity
 * table.  Also hides or displays arrows for scrolling through attached items
 * as appropriate.
 *
 * Note: NEVER call this function by itself, it needs to be called via bindAttachment, otherwise
 *       it will not work. I'd make this private if I knew how.
 */
jive.StatusInput.sizeContainer = function($container) {
    var innerWidth;

    $container = $container || $j(document);

    // '.j-attachment-container' elements are rendered server side, but
    // their content is loaded asynchronously.  So this method may be
    // called before attached items are ready to be resized.
    // only resize attachments that are not in a repost container
    $container.find('.j-attachment-container:visible:has(.j-attached-items)').hide().each(function() {
        var $that = $j(this),
            $parentCell = $that.closest('.jive-table-cell-activity'),
            $parentRepost = $that.closest('.j-wall-repost-content'),
            $parent = $that.parent(),
            maxWidth;

        if ($parentCell.length > 0) {
            //then this one is in a table cell, gotta hide it before calculating parent width.
            maxWidth = $parentCell.width();
        } else if ($parentRepost.length > 0) {
            maxWidth = $parentRepost.width();
        } else if ($that.closest('.j-wall-form').length > 0) {
            maxWidth = 0;
        } else {
            if ($j.browser.msie) {
                // CS-21908, Fixes action sidebox position issue with many attachments in IE
                maxWidth = $parent.width() - 12;
            }
            else {
                maxWidth = $parent.width();
            }
        }
        innerWidth = $that.find('.j-attached-items').data('innerWidth') || Number.POSITIVE_INFINITY;
        if (maxWidth > 0) {
            $j(this).width(Math.min(maxWidth, innerWidth)).show();
        } else {
            $that.show();
        }

    });

    jive.StatusInput.showArrows($container);
};

/*
    container here is ul .j-attached-items
 */
jive.StatusInput.showArrows = function($container) {
    $container = $container || $j(document);
    $container.find('.j-attached-items:visible').each(function() {
        var $this = $j(this),
            $parent = $this.parent();
        if ($parent.innerWidth() < $this.innerWidth()) {
            $parent.find('.j-attachment-arrow').css('display', 'block');
            $this.css('margin', '0 20px');
        } else {
            $parent.find('.j-attachment-arrow').hide();
            $this.css({'margin': '0', 'left': 0});
        }
    });

};

}
