// Plugin static class
/*
 * @depends template=jive.statusinput.dropdown.ddFriendsContent
 * @depends template=jive.statusinput.dropdown.ddSearchContent
 * @depends template=jive.statusinput.dropdown.ddHistoryContent
 * @depends template=jive.statusinput.dropdown.ddTagsContent
 */
(function() {
    function startsWith(str, prefix){
        return str.substr(0, prefix.length) == prefix;
    }

    function createLinkFrom(ed, node){
        var tag = $j(node).attr("data-name");
        var tag2 = $j(node).attr("data-id");

        var link = ed.getDoc().createElement("a");
        var macroname;
        if(tag2){
            tag = tag2;
            macroname = "tag";
            link.setAttribute("_tag", tag2);
        }else if(tag){
            macroname = "tag";
            link.setAttribute("_tag", tag);
        }else{
            tag = $j(node).text();
            macroname = node.getAttribute("jivemacro");
            link.setAttribute("___default_attr", node.getAttribute("__default_attr"));
        }
        link.setAttribute("jivemacro", macroname);
        link.setAttribute("href", "javascript:;");
        link.setAttribute("data-objectType", node.getAttribute("data-objectType"));
        link.className = "jive_macro jive_macro_" + macroname;
        link.appendChild(ed.getDoc().createTextNode(tag));
        return link;
    }

    var atMention = {
        triggerChar: "@",
        search: function search(ed, mentionPlugin, node, offset, searchText){
            //set up the request
            var url = null;
            var template = null;
            if(searchText.length < 2){
                url = jive.rest.url('/emention/friends');
                template = jive.statusinput.dropdown.ddFriendsContent;
            }else{
                url = jive.rest.url('/emention/search/') + encodeURIComponent(searchText) + '*';
                template = jive.statusinput.dropdown.ddSearchContent;
            }

            //make the request and render the results
            if(search.lastResults){
                search.lastResults.reject(); //abort the stale query, in case it takes longer than this one
            }
            var results = this._makeRequest(url);
            search.lastResults = results;
            this._handleResults(results, mentionPlugin, template, node, offset);

            if(searchText.length < 2){
                //special failover case for users with no friends
                var that = this;
                results.fail(function(){
                    //retry with history
                    that._handleResults(that._makeRequest(jive.rest.url('/emention/history')), mentionPlugin, jive.statusinput.dropdown.ddHistoryContent, node, offset);
                });
            }
        },

        select: function($link, mentionPlugin, addSpace){
            var ed = mentionPlugin.ed;
            if($link.hasClass("jive-js-history")){
                // switch to history list
                this._handleResults(this._makeRequest(jive.rest.url('/emention/history')), mentionPlugin, jive.statusinput.dropdown.ddHistoryContent);
            }else if($link.hasClass("jive-js-friends")){
                // switch to friends list
                this._handleResults(this._makeRequest(jive.rest.url('/emention/friends')), mentionPlugin, jive.statusinput.dropdown.ddFriendsContent);
            }else{
                // replace the text w/ the appropriate macro
                mentionPlugin.replaceSearchText(ed, mentionPlugin.lastInfo.node, mentionPlugin.lastInfo.offset, createLinkFrom(ed, $link.get(0)), addSpace);
            }
            ed.focus();
        },

        _makeRequest: function(url){
            var results = $j.Deferred();
            $j.ajax({
                url: url,
                dataType:'json'
            }).done(function(data){
                if(data && data.mentionCollection && data.mentionCollection.entries && data.mentionCollection.entries.length){
                    if(data.mentionCollection.entries.length > 7){
                        data.mentionCollection.entries = data.mentionCollection.entries.slice(0, 7);
                    }
                    results.resolve(data.mentionCollection.entries);
                }else{
                    results.reject(data);
                }
            }).fail(function(data, status){
                if(status != "abort"){
                    console.log("ajax error: ",  data);
                }
                results.reject(data, status);
            });
            return results;
        },

        _handleResults: function(resultPromise, mentionPlugin, template, node, offset){
            var that = this;

            //render the results
            resultPromise.done(function(entries){
                var tHTML = template.call(this, {entries: entries});

                mentionPlugin.popOverContents.html(tHTML);

                if(node != null && offset != null){
                    mentionPlugin.positionThePopUp(mentionPlugin.ed, node, offset);
                }
                mentionPlugin.popOverContents.find("a").click(function(){
                    var $link = $j(this);
                    that.select($link, mentionPlugin, false);
                    return false;
                }).attr("href", "javascript:;");
            }).fail(function(){
                mentionPlugin.hideThePopup();
            });

            if(!mentionPlugin.lastPopover){
                mentionPlugin.hideThePopup();
            }

            return resultPromise;
        }
    };

    var hashTag = {
        triggerChar: "#",
        search: function search(ed, mentionPlugin, node, offset, searchText){
            //make the request and render the results
            if(search.lastResults){
                search.lastResults.reject(); //abort the stale query, in case it takes longer than this one
            }
            var results = this._makeRequest(jive.rest.url("/tags/search?query=" + encodeURIComponent(searchText) + "*"));
            search.lastResults = results;
            this._handleResults(results, mentionPlugin, jive.statusinput.dropdown.ddTagsContent, searchText, node, offset);
        },

        select: function($link, mentionPlugin, addSpace){
            var ed = mentionPlugin.ed;
            // replace the text w/ the appropriate macro
            mentionPlugin.replaceSearchText(ed, mentionPlugin.lastInfo.node, mentionPlugin.lastInfo.offset, createLinkFrom(ed, $link.get(0)), addSpace);
            ed.focus();
        },

        _makeRequest: function(url){
            var that = this;
            var results = $j.Deferred();
            $j.ajax({
                url: url,
                dataType:'json'
            }).done(function(data){
                data = that._normalizeTagsData(data);

                if(data.length > 7){
                    data = data.slice(0, 7);
                }
                results.resolve(data);
            }).fail(function(data, status){
                if(status != "abort"){
                    console.log("ajax error: ",  data);
                }
                results.reject(data, status);
            });
            return results;
        },

        _handleResults: function(resultPromise, mentionPlugin, template, searchText, node, offset){
            var that = this;

            //render the results
            resultPromise.done(function(entries){
                var shouldCreateTag = true;
                for(var i = 0; i < entries.length; ++i){
                    if(entries[i].id == searchText){
                        shouldCreateTag = false;
                        break;
                    }
                }
                var tHTML = template.call(this,
                    {entries: entries,
                        currentTagText : searchText,
                        allowTagCreation : true,
                        shouldCreateTag: shouldCreateTag});

                mentionPlugin.popOverContents.html(tHTML);

                if(node != null && offset != null){
                    mentionPlugin.positionThePopUp(mentionPlugin.ed, node, offset);
                }

                mentionPlugin.popOverContents.find("a").click(function(){
                    that.select($j(this), mentionPlugin, false);
                    return false;
                }).attr("href", "javascript:;");
            }).fail(function(){
                mentionPlugin.hideThePopup();
            });

            if(!mentionPlugin.lastPopover){
                mentionPlugin.hideThePopup();
            }

            return resultPromise;
        },

        _normalizeTagsData: function(data){
            // normalize data returned from tags service
            var ret = [];
            if(data != null && data.tagSearchResult){
                for(var i = 0; i < data.tagSearchResult.length; i++){
                    var datum = data.tagSearchResult[i];
                    if(datum.found){
                        ret.push({
                            html: '<a  class="jive-js-status-input-selectable" '
                                + 'href="' + _jive_base_url + '/tags#/?tags=' + encodeURIComponent(datum.name) + '" data-name="' + jive.util.escapeHTML(datum.name) + '"><span class="jive-icon-med jive-icon-tag">'
                                + '</span>' + jive.util.escapeHTML(datum.name) + '</a>',
                            id: datum.name
                        });
                    }
                }
            }
            return ret;
        }

    };

    tinymce.create('tinymce.plugins.JiveMentionsPlugin', {

        // this is set from rte.js
        rte : null,

        popOverContents: null,

        lastInfo : null,

        lastPosition : null,

        cancelTheKey : false,

        ajax : null,

        outerDom: null,

        searchTextRegex : null,
        beforeMentionRegex: null,

        mentionTypes: null,
        allTriggerChars: "",

        setRTE: function(rte){
            this.rte = rte;
            this.completeInit();
        },

        positionThePopUp : function(ed, node, offset){
            var that = this;
            var position = $j(node.parentNode).offset();

            //Make a copy of the node.parentNode, and position it on top of the RTE, right on top of the original
            var $posme = $j("<div></div>");
            $posme.css("position", "absolute");
            $posme.css("left", position.left);
            $posme.css("top", position.top);

            var $clone = ed.plugins.jiveutil.clone($j(node.parentNode), window.parent.document);
            $clone.css("visibility","hidden");
            $clone.css("margin", "0");
            $clone.width($j(node.parentNode).width());

            $posme.append($clone);
            this.rte.getHiddenContainer().append($posme);

            //figure out what text we're looking for.
            var rng = ed.dom.createRng();
            rng.setStart(node.parentNode, 0);
            rng.setEnd(node, offset);
            var origText = rng.toString().replace(/(\s|\u00a0)+$/, '');

            var cl = $clone.get(0);
            var outerRng = this.outerDom.createRng();
            outerRng.setStart(cl, 0);
            var currentNode = cl.firstChild;
            while(currentNode){
                outerRng.setEndAfter(currentNode);
                var currentText = outerRng.toString().replace(/(\s|\u00a0)+$/, '');
                if(startsWith(currentText, origText)){
                    //put outerRng's end at the end of the origText
                    while(outerRng.toString().replace(/(\s|\u00a0)+$/, '') != origText){
                        var endPos = this._prevCharPos(ed.selectionUtil.endPos(outerRng));
                        outerRng.setEnd(endPos.c, endPos.off);
                    }

                    //Create the reference element "sp" and put it after outerRng.
                    outerRng.collapse(false);
                    var sp = this.outerDom.create("span", null, "|");
                    outerRng.insertNode(sp);
                    $clone.width($j(node.parentNode).width() + $j(sp).width() + 10);

                    that._showThePopup($j(sp));
                    this.lastPosition = position;

                    $posme.remove();
                    return this.lastPopover.popOver.position();
                }
                currentNode = currentNode.nextSibling;
            }

            $posme.remove();

            return this.lastPosition;
        },

        _showThePopup: function($context){
            var that = this;

            that.hideThePopup();
            this.lastPopover = {
                context: $context,
                nudge : { left : 180 },
                container:this.rte.getPopOverContainer(),
                clickOverlay: false,
                addClass: "j-autocomplete j-js-autocomplete j-mention-popover",
                onClose: function(){
                    // when popover closes, dispatch the event so jivemention implementors can
                    // do something with this information
                    that.ed.onPopupClose.dispatch();
                    that.lastPopover = null;
                },
                returnPopover: true,
                allowResize: false,
                focusPopover: false
            };
            this.popOverContents.popover(this.lastPopover);
        },

        hideThePopup : function(){
            if(this.lastPopover){
                this.lastPopover.closeFunc();
            }
        },

        _createPopupIfNeeded : function(){
            if(!this.lastPopover){
                // if a popup does not exist, create one
                this.popOverContents.html("<div class=\"loading\"></div>");
            }
        },

        completeInit: function(){
            if(this.rte && this.ed && !this.initialized){
                this.initialized = true;

                var ed = this.ed;
                var dom = this.outerDom;

                // setup the dispatchable event
                ed.onPopupClose = new tinymce.util.Dispatcher();

                if(this.rte.getGutter){  //6.x-only
                    var control = dom.create("div", {
                        "class": "gutterButton mentionButton"
                    }, ed.getLang("jivemention.mention_button_lbl"));

                    //IE9 loses track of the range when the RTE loses focus, when we click the button.  Save it, and pass it along.
                    var rng = null;
                    dom.bind(control, "mousedown", function(){
                        rng = ed.selection.getRng(true);
                    });
                    dom.bind(control, "click", function(){
                        ed.execCommand("jiveAtMention", true, rng);
                    });

                    this.rte.getGutter().appendChild(control);
                }
            }
        },

        execCommand : function(cmd, ui, val){
            var ed = this.ed;
            if(cmd == "jiveAtMention"){
                if(val){
                    ed.selection.setRng(val);
                }
                ed.undoManager.add();
                var content = "@" + ed.selection.getContent();
                ed.selection.setContent(content);
                ed.selection.collapse(false);
                ed.focus();
                ed.undoManager.add();

                //the implicit nodeChange causes a checkForMentionPopup
                return true;
            }

            return false;
        },

        addMentionType: function(mentionObj){
            var triggerChar = mentionObj.triggerChar;
            if(triggerChar && triggerChar.length == 1 && (typeof triggerChar == "string")){
                this.mentionTypes[triggerChar] = mentionObj;
                this.allTriggerChars += triggerChar;

                this.searchTextRegex = new RegExp("[^\\s\u00a0" + this.allTriggerChars + "]");
                this.beforeMentionRegex = new RegExp("\\s|\u00a0|[^\\w" + this.allTriggerChars + "]");
            }else{
                throw new Error("invalid trigger character: " + triggerChar);
            }
        },

        _getMentionObj: function(triggerChar){
            var obj = this.mentionTypes[triggerChar];
            if(obj && triggerChar.length == 1){
                return obj;
            }
            return null;
        },

        init: function(ed){
            this.ed = ed;
            this.outerDom = new tinymce.dom.DOMUtils(document);

            this.popOverContents =  $j("<div class='j-menu'></div>");
            this.mentionTypes = [];

            this.addMentionType(atMention);
            this.addMentionType(hashTag);

            //noinspection FunctionWithInconsistentReturnsJS
            function checkForArrowKeys(ed, e){
                var item;
                if(this.lastPopover){
                    switch(e.keyCode){
                        case 27:
                            // escape key
                            tinymce.dom.Event.cancel(e);
                            this.cancelTheKey = true;
                            this.hideThePopup();
                            return false;
                            break;
                        case 38:
                            // up arrow
                            this.selectItem(this._getSelectItemIndex() - 1);
                            tinymce.dom.Event.cancel(e);
                            this.cancelTheKey = true;
                            return false;
                            break;
                        case 40:
                            // down arrow
                            this.selectItem(this._getSelectItemIndex() + 1);
                            tinymce.dom.Event.cancel(e);
                            this.cancelTheKey = true;
                            return false;
                            break;
                        case 13:
                            // Enter key
                            tinymce.dom.Event.cancel(e);
                            this.cancelTheKey = true;
                            item = this._getSelectedItem();
                            if (item.length) {
                                this.select(item.get(0), false);
                            }
                            else {
                                this.hideThePopup();
                            }
                            return false;
                            break;
                        case 32:
                            // Space key
                            item = this._getSelectedItem();
                            if(item.length){
                                tinymce.dom.Event.cancel(e);
                                this.cancelTheKey = true;
                                this.select(item.get(0), true);
                                return false;
                            }
                            break;
                        default:
                            break;
                    }
                }
            }

            ed.onKeyUp.addToTop(this.checkForMentionPopup, this);
            ed.onNodeChange.add(this.checkForMentionPopup, this);
            ed.onKeyUp.addToTop(function(ed, e){
                if(this.cancelTheKey){
                    tinymce.dom.Event.cancel(e);
                    this.cancelTheKey = false;
                    return false;
                }
            }, this);
            ed.onKeyPress.addToTop(function(ed, e){
                if(this.cancelTheKey){
                    tinymce.dom.Event.cancel(e);
                    return false;
                }
            }, this);
            ed.onKeyDown.addToTop(checkForArrowKeys, this);

            ed.onScroll.add(function(scrollX, scrollY){
                if(this.lastPopover){
                    if((this.lastPosition.top + 20) - scrollY <= 0){
                        this.hideThePopup();
                    }
                    var contentAreaH = $j(ed.getContainer()).children('table:first tr.mceIframeRow').height();
                    if((this.lastPosition.top + 20) - scrollY >= contentAreaH){
                        this.hideThePopup();
                    }
                }
            }, this);
        },

        select: function(selectedElem, addSpace){
            var rng = this.ed.selection.getRng(true);
            var atSignInfo = this._mentionSearch(rng);
            this.lastInfo = atSignInfo;
            var mentionObj = this._getMentionObj(atSignInfo.type);
            if(mentionObj){
                mentionObj.select($j(selectedElem), this, addSpace);
            }
        },

        checkForMentionPopup: function(ed) {
            try{
                var rng = ed.selection.getRng(true);

                var atSignInfo = this._mentionSearch(rng);
                if(!atSignInfo){
                    this.lastInfo = null;
                    this.hideThePopup();
                    return;
                }

                if(this.lastInfo && this.lastInfo.type == atSignInfo.type && this.lastInfo.searchText == atSignInfo.searchText && this.lastInfo.node == atSignInfo.node){
                    //same search as last time; skip it.
                    return;
                }
                this.lastInfo = atSignInfo;
//                console.log("found mention", atSignInfo.searchText, atSignInfo.type, atSignInfo.node, atSignInfo.offset);

                var mentionObj = this._getMentionObj(atSignInfo.type);

                if(mentionObj){
                    this._createPopupIfNeeded();
                    mentionObj.search(ed, this, atSignInfo.node, atSignInfo.offset, atSignInfo.searchText);
                }

            }catch(e){
                console.log("error while checking for mention", e);
                // noop
                //
                // this happens when mouseclicking into
                // an empty paragraph, esp in IE
                this.hideThePopup();
            }
        },


        /**
         * retrieves the text that's next to the @ or # in the DOM
         * @param node the node that contains the cursor
         * @param offset the offset of the cursor in characters within node
         * @return the text next to the cursor
         */
        _getSearchText : function(node, offset){
            var searchText = "";
            while(node.nodeType == 3){
                var lookBack = 0;
                while(offset + lookBack < node.nodeValue.length){
                    var ch = node.nodeValue.substr(offset + lookBack, 1);
                    if(this.searchTextRegex.test(ch)){
                        // the cursor is still in a valid word,
                        // so keep looking backward for an @
                        searchText += ch;
                    }else{
                        return searchText;
                    }
                    lookBack++;
                }
                if(node.nextSibling && node.nextSibling.nodeType == 3){
                    node = node.nextSibling;
                    offset = 0;
                }else{
                    return searchText;
                }
            }
            return searchText;
        },

        /**
         * Destroys the text that's next to the @, #, or ! in the DOM
         * @param node the node that contains the cursor
         * @param offset the offset of the cursor in characters within node
         */
        destroySearchText: function(ed, node, offset){
            // replaces the search text with an empty node to effect a delete
            this.replaceSearchText( ed, node, offset,  ed.getDoc().createTextNode(""), false );
        },

        /**
         * retrieves the text that's next to the @ or # in the DOM
         * @param node the node that contains the cursor
         * @param offset the offset of the cursor in characters within node
         */
        replaceSearchText : function(ed, node, offset, replacement, space){
            var that = this;

            var verify = node.nodeValue.substr(offset, 1);
            if(this._getMentionObj(verify) == null){
                return;
            }
            // ignore the @ and # at the beginning
            var first = true;

            var searchText = "";
            var lookBack = 0;
            var found = false;
            while(node.nodeType == 3){
                lookBack = 0;
                while(offset + lookBack < node.nodeValue.length){
                    var ch = node.nodeValue.substr(offset + lookBack, 1);
                    if(first || this.searchTextRegex.test(ch)){
                        // the cursor is still in a valid word,
                        // so keep looking backward for an @
                        searchText += ch;
                    }else{
                        found = true;
                        break;
                    }
                    lookBack++;
                    first = false;
                }
                if(!found && node.nextSibling && node.nextSibling.nodeType == 3){
                    // we haen't found the entire string yet,
                    // so we know that the portion of nodeValue
                    // after offset will be replaced.
                    // remove it, and continue searching in the next
                    // text node
                    var next = node.nextSibling;
                    if(offset == 0){
                        node.parentNode.removeChild(node);
                    }else{
                        node.nodeValue = node.nodeValue.substr(0, offset);
                    }
                    node = next;
                    offset = 0;
                }else{
                    break;
                }
            }

            if(offset == 0 && lookBack == 0){
                node.parentNode.insertBefore(replacement, node);
            }else if(node.nodeValue.length == lookBack && offset == 0){
                node.parentNode.insertBefore(replacement, node);
                node.parentNode.removeChild(node);
            }else if(offset == 0){
                node.parentNode.insertBefore(replacement, node);
                node.nodeValue = node.nodeValue.substr(lookBack);
            }else{
                var str = node.nodeValue;
                node.nodeValue = str.substr(0, offset);
                var newStr = str.substr(offset + lookBack);
                if(newStr.length > 0){
                    var node2 = ed.getDoc().createTextNode(newStr);
                    node.parentNode.insertBefore(node2, node);
                    node.parentNode.insertBefore(replacement, node2);
                    node.parentNode.insertBefore(node, replacement);
                }else{
                    node.parentNode.insertBefore(replacement, node);
                    node.parentNode.insertBefore(node, replacement);
                }
            }

            if(space){
                var sp = ed.getDoc().createTextNode(" ");
                replacement.parentNode.insertBefore(sp,replacement);
                replacement.parentNode.insertBefore(replacement,sp);
                replacement = sp;
            }

            ed.plugins.jivemacros.putCursorAfter(ed, replacement);
            ed.nodeChanged();
            var entitlementService = that.rte.getEntitlementService();

            // for visibility controlled content, need to check the current visibility settings to warn
            // the user about mentions that might not be received by the mentioned user
            var validUserIDs = undefined;
            var $visibilitySettings = $j('div.jive-compose-section-visibility');
            if ($visibilitySettings.length &&
                $visibilitySettings.is(':visible') &&
                !$visibilitySettings.find('li.anyone input').is(':checked')) {
                validUserIDs = $visibilitySettings.find('.j-people-list li').map(function() {
                    return $j(this).data('user-id') + '';
                }).get();
            }

            if (entitlementService && replacement.getAttribute && replacement.getAttribute("data-objectType")) {
                entitlementService.checkEntitlement(replacement.getAttribute("data-objectType"), replacement.getAttribute("___default_attr"), validUserIDs).addCallback(function(entitled) {
                    if (!entitled) {
                        var warning_message = '';
                        if (replacement.getAttribute("data-objectType") == 3) {
                            warning_message = ed.getLang("jivemention.no_notification");
                        }
                        else if (replacement.getAttribute("data-objectType") == 700) {
                            warning_message = ed.getLang("jivemention.secret_group_mention");
                        }
                        else {
                            warning_message = ed.getLang("jivemention.restricted_content_mention");
                        }
                        $j('<p>'+$j(replacement).text()+' '+warning_message+'</p>').message({style: 'warn'});
                    }
                });
            }
            this.hideThePopup();
        },

        getInfo : function() {
            return {
                longname : 'Mentions',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
        },


        selectItem:function(index){
            if(!this.lastPopover){
                return;
            }
            var selectableElems = this._getSelectItems();
            this.deselectItem();
            if(index < 0 || index >= selectableElems.length){
                return;
            }
            this._selectItemHelper(selectableElems[index], true);
        },
        deselectItem:function(index){
            var selectableElems = this._getSelectItems();
            if(index != null && (index < 0 || index >= selectableElems.length)){
                return;
            }
            var itemToDeselect = index == null ? this._getSelectedItem() : selectableElems[index];
            // check that item to deselect is actually selected
            if(itemToDeselect.length == 0){
                return;
            }
            this._selectItemHelper(itemToDeselect);
            this._selectedIndex = -1;
        },
        _getSelectItems:function(){
            return this.lastPopover.popOver.find('.jive-js-status-input-selectable');
        },
        _getSelectedItem:function(){
            return this.lastPopover.popOver.find('.jive-js-status-input-selected');
        },
        _getSelectItemIndex:function(item){
            item = item || this._getSelectedItem()[0];
            return item ? this._getSelectItems().index(item) : -1;
        },
        _getDataItemIndex:function(item){
          return this.lastPopover.popOver.find('.j-autocomplete-results a').index(item);
        },
        _selectItemHelper:function(item, isSelect){
            if(isSelect){
                $j(item).addClass('jive-js-status-input-selected').addClass('j-selected');
            }else{
                $j(item).removeClass('jive-js-status-input-selected').removeClass('j-selected');
            }
        },

        _withinCodeMacro : function (n){
            var pre = this.ed.dom.getParent(n, "pre");
            if(pre != null){
                var macro = this.ed.plugins.jivemacros.isMacro(pre);
                if(macro && this.ed.plugins.jivemacros.getMacroFor(pre).getName() == "code"){
                    return true;
                }
            }
            return null;
        },

        _prevCharPos: function (treePos){
            if(treePos.c.nodeType == 3){
                if(treePos.off > 0){
                    return {c: treePos.c, off: treePos.off-1};
                }else{
                    return this._prevCharPos({c: treePos.c.parentNode, off: this.ed.dom.nodeIndex(treePos.c)});
                }
            }else if(treePos.c.nodeType == 1){
                if(treePos.off > 0){
                    var c = treePos.c.childNodes[treePos.off-1];
                    if(c.nodeType == 3){
                        return this._prevCharPos({c: c, off: c.nodeValue.length});
                    }else{
                        return null;
                    }
                }else{
                    return null;
                }
            }
        },

        _nextCharPos: function(treePos){
            if(treePos.c.nodeType == 3){
                if(treePos.off < treePos.c.nodeValue.length-1){
                    return {c: treePos.c, off: treePos.off+1};
                }else if(treePos.off == treePos.c.nodeValue.length-1){
                    return this._nextCharPos({c: treePos.c, off: treePos.off+1});
                }else{
                    //off == length
                    return this._nextCharPos({c: treePos.c.parentNode, off: this.ed.dom.nodeIndex(treePos.c)+1});
                }
            }else if(treePos.c.nodeType == 1){
                if(treePos.off < treePos.c.childNodes.length){
                    var c = treePos.c.childNodes[treePos.off];
                    if(c.nodeType == 3){
                        if(c.nodeValue.length > 0){
                            return {c: c, off: 0};
                        }else{
                            return this._nextCharPos({c: c, off: 0});
                        }
                    }else{
                        return null;
                    }
                }else{
                    return null;
                }
            }
        },

        _charAt: function(treePos){
            if(treePos && treePos.c.nodeType == 3){
                return treePos.c.nodeValue.substr(treePos.off, 1);
            }
            return null;
        },

        _mentionSearch: function(rng){
            var ed = this.ed;
            if(!rng.collapsed){
                return null;
            }

            //Look for the @
            var treePos = this._prevCharPos(this.ed.selectionUtil.startPos(rng));
            while(treePos){
                if(!this.searchTextRegex.test(this._charAt(treePos))){
                    break;
                }
                treePos = this._prevCharPos(treePos);
            }
            if(treePos == null){
                return null;
            }

            //check the before-@ text, to avoid annoying popups when typing email addresses, for example
            var beforePos = this._prevCharPos(treePos);
            if(beforePos && !this.beforeMentionRegex.test(this._charAt(beforePos))){
                return null;
            }else if(tinymce.isIE && !tinymce.isIE9 && !beforePos && this._charAt(treePos) == "@"){
                //IE likes to autolink email addresses at inopportune moments. Since we can't suppress this behavior in IE7-8, we must ignore certain mentions.
                //treePos.c is always a text node.  If we get here, it's previous sibling is either null (we're probably ok) or an element (we shouldn't pop up)
                if(treePos.c.previousSibling != null && !/br|img/i.test(treePos.c.previousSibling.nodeName) && !ed.dom.isBlock(treePos.c.previousSibling)){
                    return null;
                }
            }

            // check if @mention is within a code-macro.
            if(this._withinCodeMacro(treePos.c)) {
                return null;
            }

            if(this._getMentionObj(this._charAt(treePos)) != null){
                var that = this;
                //Found it.  Now find the search text.
                function findSearchText(atPos){
                    var searchTextRng = ed.dom.createRng();

                    var treePos = that._nextCharPos(atPos);
                    if(treePos == null || !that.searchTextRegex.test(that._charAt(treePos))){
                        return "";
                    }

                    searchTextRng.setStart(treePos.c, treePos.off);
                    while(treePos != null){
                        searchTextRng.setEnd(treePos.c, treePos.off+1);
                        treePos = that._nextCharPos(treePos);
                        if(!that.searchTextRegex.test(that._charAt(treePos))){
                            break;
                        }
                    }
                    return searchTextRng.toString();
                }

//                //TODO: Use this to pre-compute the position of the popup efficiently, instead of the clone-overlay used in positionThePopUp
//                function getBoundBox(atTreePos, searchText){
//                    var rng = ed.selection.getRng();
//
//                    var ret;
//                    if(rng.setStart && rng.getBoundingClientRect){ //supports FF4 and recent Chrome
//                        rng.setStart(atTreePos.c, atTreePos.off);
//                        rng.setEnd(atTreePos.c, atTreePos.off+1);
//                        ret = rng.getBoundingClientRect();
//                    }else if(rng.findText && rng.getBoundingClientRect){ //supports IE 5 and later
//                        var w3rng = ed.dom.createRng();
//                        w3rng.setStart(atTreePos.c.parentNode, 0);
//                        w3rng.setEnd(atTreePos.c, atTreePos.off+1);
//
//                        rng.moveToElementText(atTreePos.c.parentNode);
//                        rng.findText(w3rng.toString() + searchText);
//                        rng.collapse(false);
//                        rng.moveStart("character", -1 * (searchText.length+1));
//                        rng.moveEnd("character", -1 * (searchText.length));
//                        ret = rng.getBoundingClientRect();
//                    } //TODO: else fall back on clone-overlay in FF 3.6 and such
//                    var jivescroll = ed.plugins.jivescroll;
//                    ret.top += jivescroll.scrollY;
//                    ret.bottom += jivescroll.scrollY;
//                    ret.left += jivescroll.scrollX;
//                    ret.right += jivescroll.scrollX;
//
//                    return ret;
//                }

                var ret = {
                    node: treePos.c,
                    offset: treePos.off,
                    searchText: findSearchText(treePos),
                    type: this._charAt(treePos)
                };
//                ret.atBoundBox = getBoundBox(treePos, ret.searchText);

                return ret;
            }
            return null;
        }
    });
	// Register plugin
	tinymce.PluginManager.add('jivemention', tinymce.plugins.JiveMentionsPlugin);
})();
