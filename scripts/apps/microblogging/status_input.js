/*jslint browser:true */
/*extern jive $j $Class */

/**
 * Class representing status input for microblogging
 *
 * @depends path=/resources/scripts/apps/status_input/status_input.js
 * @depends path=/resources/scripts/apps/status_input/status_input_drop_down.js
 * @depends path=/resources/scripts/apps/microblogging/status_input_drop_down.js
 * @depends path=/resources/scripts/jive/fresh_action_queue.js
 *
 */

jive.namespace('MicroBlogging');
/**
 * Make sure we only include this file once per page load.  If we do not have this block here there are 2 cases where
 * this script could be loaded multiple times:
 * 1) When resource combined is false behavior could be different from when it's on, ideally the behavior should be the same.
 * 2)  If an ajax request is made for an ftl with javascript includes the file will be reloaded (assuming it was already
 * loaded on page load)
 *
 * At a later date we can roll this work into namespace or a new function that is similar to namespace
 */
if(!jive.MicroBlogging.StatusInputs){

jive.MicroBlogging.StatusInputs = jive.StatusInput.StatusInputs.extend({
    _docReadyInit: function(options){
        this._container.find(".jive-js-statusinput").each(function(i, input) {
            var id = $j(input).attr('id'),
                fn = this.emit.bind(this, 'characterLenMsg'),
                fn2 = this.emit.bind(this, 'atMentionFinished');

            this.statusInputs[id] = new jive.MicroBlogging.StatusInput(input, options)
                    .addListener('characterLenMsg', fn)
                    .addListener('atMentionFinished', fn2);
        }.bind(this));
    }
});

// Mixes in `addListener` and `emit` methods so that other classes can
// listen to events from this one.
//jive.conc.observable(jive.MicroBlogging.StatusInputs.prototype);

jive.MicroBlogging.StatusInput = jive.StatusInput.StatusInput.extend({
    init:function(container, options){
        this._super(container, options);
        // if true focus when doc is ready
        this._focusOnRdy = options.focusOnRdy;
        // if true allow users to create new tags using tag dropdown
        this._allowTagCreation = options.allowTagCreation == undefined ? true : options.allowTagCreation;
        var that = this;
        if(options.defaultValue){
            that._container.prev(".jive-js-statusinput-default").hide();
        }else{
            var origHeight = 0;
            function setOriginalHeight(){
                if(origHeight == 0){
                    origHeight = $j(that._container).height();
                }
            }
        }
        this._container.bind('click', function(e) {
            that._container.trigger('focus');
        });

        this._container.bind('focus', function(e){
            that._container.prev(".jive-js-statusinput-default").hide();
            $j('#j-js-mb-success').hide();
            if(!options.doNotAnimate){
                setOriginalHeight();
                that._container.animate({ minHeight: Math.max(origHeight * 2.2, 15) }, 150);
                that._container.addClass('j-mb-focused');
            }
            that._container.attr('contentEditable', true);

            that.emit("focus");
        });
        // Have initial dummy text div focus on real editable div onclick event.
        this._container.prev().click(function(){that._container.focus()});
    },
    /**
     * triggers focus animation if focusOnRedy is set to true in constructor options
     */
    triggerOnFocusAnimation:function(){
        if(this._focusOnRdy){
            this._container.trigger('focus');
        }
    },
    _initDD:function(options){
        this._dd = new jive.MicroBlogging.StatusInputDropDown(this._container, options);
    },
    _initDDHandlers:function(){
        this._super();

        var that = this;
        this._dd.addListener('friendsLinkClicked', function(){that._showFriendsList(true);});
        this._dd.addListener('historyLinkClicked', function(){that._showHistoryList(true);});
    },

    _getTokens: function() {
        return jive.MicroBlogging.StatusInput.Tokens;
    },

    _getPatterns:function(){
        return jive.MicroBlogging.StatusInput.Patterns;
    },

    _showFriendsList: function(selectItemOnLoad) {
        var that = this;
        this._actionQueue.push(this._obtainFriendsData(selectItemOnLoad)).then(function(data) {
            that._dd.renderFriendsData(data);
            if (selectItemOnLoad) {
                that._dd.selectItem(0);
            }
        });
    },

    _showHistoryList: function(selectItemOnLoad) {
        var that = this;
        this._actionQueue.push(this._obtainHistoryData(selectItemOnLoad)).then(function(data) {
            that._dd.renderHistoryData(data);
            if (selectItemOnLoad) {
                that._dd.selectItem(0);
            }
        });
    },

    _showTagsList: function(query) {
        var that = this;
        this._actionQueue.push(this._obtainTagsData(query)).then(function(data) {
            that._dd.renderTagsData(data, query);
        });
    },

    // model methods
    _obtainFriendsData:function(emitSelectItemOnLoad){
        return this._obtainData(jive.rest.url('/emention/friends'));
    },
    _obtainHistoryData:function(emitSelectItemOnLoad){
        return this._obtainData(jive.rest.url('/emention/history'));
    },
    _obtainTagsData:function(query){
        return this._obtainData(jive.rest.url("/tags/search?query=" + encodeURIComponent(query) + '*'));
    },
    handleAtMentionButtonClick:function(){
        this._super();
        // insert @ symbol
        if(this._selection == null){
            this._container.append(document.createTextNode('@'));
            this._selection = new jive.Selection(this._container[0].lastChild, false, 1);
        } else {
            // determine whether node contains white space before or after the insertion point and create the the
            // @ text node accordingly
            var rangeStartContainer = this._selection.getRangeStartContainer();
            var newNodeStr = ' @ ';
            var newNode = document.createTextNode(newNodeStr);
            var newNodeOffset = Math.min(newNodeStr.length, 2);

            if(!$j.browser.msie && rangeStartContainer.tagName && rangeStartContainer.tagName.toLowerCase() == 'br'){
                $j(newNode).insertBefore(rangeStartContainer);
                this._selection.moveToNodeAndCollapse(newNode, true, newNodeOffset);
                this._container.focus();
            } else {
                this._container.focus();
                this._selection = new jive.Selection();
                this._selection.insertNodeAtRange(newNode, newNodeOffset);
            }


        }

        // display dd with friends
        this._showFriendsList();
    },
    swapLinkFor: function(url, meta) {
        function swap(node,url, replacement) {
             if (node.nodeType == 3) {
                 // node.nodeValue could equal "foo http://gooogle.com foo" or "http://google.com foo" or "foo http://google.com"
                 var lastNode = null;
                 var currentValue = node.nodeValue;
                 if (currentValue.indexOf(url) < 0) return;
                 if (currentValue.indexOf(url) == 0) {
                     node.nodeValue = currentValue.substring(url.length);
                     node.parentNode.insertBefore($j(meta)[0],node);
                     lastNode = node;
                 }
                 else if (currentValue.indexOf(url) == (currentValue.length - url.length)) {
                     node.nodeValue = currentValue.substring(0, currentValue.indexOf(url));
                     node.parentNode.insertBefore($j(meta)[0],node);
                     node.parentNode.insertBefore(node,node.previousSibling);
                     lastNode = $j(meta)[0];
                 }
                 //in the middle
                 else {
                     var firstPart = currentValue.substring(0,  currentValue.indexOf(url));
                     var lastPart = currentValue.substring(currentValue.indexOf(url)+url.length);

                     node.nodeValue = lastPart;
                     node.parentNode.insertBefore(document.createTextNode(firstPart),node);
                     node.parentNode.insertBefore($j(meta)[0],node);
                     lastNode = node;

                 }

                 if (lastNode.nodeType == 3 && lastNode.nodeValue.length > 1) {
                     var newText = document.createTextNode(lastNode.nodeValue.substring(1));
                     lastNode.nodeValue = lastNode.nodeValue.substring(0,1);
                     node.parentNode.insertBefore(newText,lastNode);
                     node.parentNode.insertBefore(lastNode,newText);
                 }

                 jive.Selection.moveCursorAfter(lastNode);
             }
             if (node.nodeType == 1) {
                 if (node.nodeName.toLowerCase() == 'a') {
                     return;
                 }
                 else {
                     for (var i=0;i<node.childNodes.length;i++) {
                         swap(node.childNodes[i], url, replacement);
                     }
                 }
             }
        }
        swap(this._container[0],url, meta);
    }
});

(function(klass) {
    var patterns = {
        mention: "^@([^@ ]+)?",
        tags: "^#([^# ]+)?",
        youtubeURL: "https?\\://(?:[\\w\\-]+\\.)?youtube\\.com/watch\\S*[&?]v=([^&\\s]+)\\S*",
        imageURL: "https?\\://\\S+(\\.png|\\.jpg|\\.gif|\\.jpeg)",
        linkURL: "https?\\://\\S+"
    };

    klass.Patterns = patterns;

    klass.Tokens = {
        // @ mention
        mention: {
            regExp: new RegExp(patterns.mention, 'i'),

            // The "keypress" callback is fired after every keypress while the
            // user is entering a matching token.
            keypress: function(match, name) {
                var that = this;

                //console.log('@ mention');
                if (name && name.length >= 2) {
                    // @ followed by string, make a request for search data
                    this._actionQueue.push(this._obtainSearchData(name)).then(function(data) {
                        that._dd.renderSearchData(data);
                    });

                } else {
                    // just @
                    // make a request for friends
                    this._showFriendsList();
                }
            }
        },

        tags: {
            regExp: new RegExp(patterns.tags, 'i'),
            keypress: function(match, tag) {
                //console.log('# tag');
                /// # followed by string
                if (tag && tag.length >= 2) {
                    // # followed by string, make a request for search data
                    this._showTagsList(tag);
                } else {
                    // just #
                    // just display helpful message
                    this._dd.renderTagsData();
                }
            }
        },

        // youtubeURL
        youtubeURL: {
            regExp: new RegExp(patterns.youtubeURL, 'i'),
            keypress: function(match, videoID) {
                //console.log('youtube url');
                this.emit('youtubeURLMatch', match);
                this.emit('linkURLMatch', match);
                this._dd.hide();
            }
        },

        // imageURL
        imageURL: {
            regExp: new RegExp(patterns.imageURL, 'i'),
            keypress: function(match, extension, node) {
                //console.log('image URL');
                // imageURL should not match against text that was already marked as an imageURL
                if(!$j(node).parent().attr('data-jive-statusinputImageURL')){
                    this.emit('imageURLMatch', match);
                    var anchorAttrs = {href:match};
                    anchorAttrs['data-jive-statusinputadd'] = true;
                    anchorAttrs['data-jive-statusinputImageURL'] = true;
                    this._selection.replaceWordAtRange(match, null, {tag:'a', attrs:anchorAttrs});
                    this._focus(true);
                }
                this._dd.hide();
            }
        },

        // Future for link url
        linkURL: {
            regExp: new RegExp(patterns.linkURL, 'i'),

            // The "complete" callback is only called once the user types a
            // space after the token.
            complete: function(match, node) {
                //console.log('link URL');
                // linkURL should not match against text that was already marked as an imageURL
                if(!$j(node).parent().attr('data-jive-statusinputImageURL')){
                    this.emit('linkURLMatch', match);
                }
                this._dd.hide();
            }
        }
    };

})(jive.MicroBlogging.StatusInput);

}
