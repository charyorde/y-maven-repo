/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Creates and add tinymce.plugins.JiveAppsPlugin to tinymce
 * JiveAppsPlugin manages all ! (bang app) actions & insertion of an artifact, see https://brewspace.jiveland.com/docs/DOC-71750
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 * @depends i18nKeys=jiveapps.*
 * @depends i18nKeys=appframework.*
 */
(function() {
    // check if apps market is enabled.
    if (!isAppsMarketEnabled()) {
        return;
    }

    var appBang;
    var searchArgs;  // Information needed to show dropdown, saved values will be used to bring back dropdown after an install
    var appsChangeCount = 0;
    var expectedAppsChangeCount = 0;

    function buildSelectionData(ed, lastInfo) {
        return {
            htmlBody: $j(ed.contentDocument.body).html()
        };
    }

    function isAppsMarketEnabled() {
        return window.top.appsMarketEnabled ;
    }


    jive.switchboard.addListener('app.install.animation.ended', function() {
        appsChangeCount = appsChangeCount + 1;
        console.log("apps_have_changed", appsChangeCount);
        if(searchArgs) {
            appBang.search(searchArgs.ed, searchArgs.bangPlugin, searchArgs.node, searchArgs.offset, searchArgs.searchText);
            searchArgs = null;
        }
    });

    jive.switchboard.addListener('apps_market.apps_have_changed', function() {
        // null out entries
        delete appBang.entries;
    });

    function deactivateAndSaveZIndex( targetElements ) {
        for ( var i = 0; i < targetElements.length; i++ ) {
            // record original zindex
            var element = $j(targetElements[i]);
            var zIndex = element.css("z-index");
            if ( zIndex ) {
                element.attr("data-z-index", zIndex);
            }

            // lower zindex
            element.css({"z-index":"-1"});
        }
    }

    function restoreSavedZIndex( targetElements ) {
        for ( var i = 0; i < targetElements.length; i++ ) {
            // record original zindex
            var element = $j(targetElements[i]);
            var zIndex = element.attr("data-z-index");
            if ( zIndex ) {
                element.css({"z-index":zIndex});
            }
        }
    }

    appBang = {
        triggerChar: "!",
        rte: null,

        init: function(rte) {
            this.rte = rte;
            // pre-load app actions for context menu
            this._handleResults(this._makeRequest(jive.rest.url('/apps/v1/actions/rte'), ''));
        },

        search: function(ed, bangPlugin, node, offset, searchText) {

            var url = jive.rest.url('/apps/v1/actions/rte');
            var template = jive.apps.dropdown.ddAppContent;

            //make the request and render the results
            var results = this._makeRequest(url, searchText);

            this._handleResults(results, bangPlugin, template, node, offset, searchText);
            if ( $j.browser.msie && $j.browser.version < 8 ) {
                // for IE7, remove the z-index so that !app can overlap
                var publishBars = $j('.j-publishbar');
                if( publishBars.length > 0 ) {
                    // if there is a publishbar we have to make sure its less z index than jive-content
                    deactivateAndSaveZIndex( publishBars );
                } else {
                    // if there's no publishbar, then likely we're in a comment or something, temporarily
                    // reduce the jive content
                    deactivateAndSaveZIndex( $j('.jive-content') );
                }
            }
        },

        select: function($actionLink, bangPlugin, addSpace){
            var ed   = bangPlugin.ed,
                self = this;

            var appActionDataPromise = $j.Deferred();
            appActionDataPromise.done(function(data, rpcArgs, editedContentBean) {
                self.insertArtifact(data, editedContentBean, $actionLink, bangPlugin);
            });

            // launch app
            window.top.appContainer.handleRTEActionSelect($actionLink.parent(), buildSelectionData(ed, bangPlugin.lastInfo), appActionDataPromise);
            bangPlugin.hideThePopup();
        },

        insertArtifact: function(data, editedContentBean, $actionLink, bangPlugin) {
            var ed = bangPlugin.ed;
            var addSpace = true;

            if ( data.html ) {
                // support raw HTML splat
                bangPlugin.destroySearchText(ed, bangPlugin.lastInfo.node, bangPlugin.lastInfo.offset);
                ed.execCommand("mceInsertContent", false, data.html );

                // fix up the rte dom to make sure jive macro attribute is set on app artifacts
                var dom = ed.dom;
                tinymce.each(dom.select("a.jive_macro_appEmbeddedView", ed.getBody()), function(aTag){
                    if (!dom.getAttrib(aTag, "jivemacro")) {
                        dom.setAttrib(aTag, "jivemacro", "appEmbeddedView")
                    }
                    if (!dom.getAttrib(aTag, "jivemacro")) {
                        dom.setAttrib(aTag, "__jive_macro_name", "appEmbeddedView")
                    }
                });
            } else {
                var artifactElement = this._createArtifactFromData(ed, $actionLink.parent().attr('appUUID'),
                    $actionLink.parent().attr('appInstanceUUID'), $actionLink.parent().attr('actionId'), data, editedContentBean);
                bangPlugin.replaceSearchText(ed, bangPlugin.lastInfo.node, bangPlugin.lastInfo.offset, artifactElement, addSpace);
            }
            ed.focus();
        },

        uploadArtifactPreviewImage: function(ed, artifact) {
            // $img.load(function() { uploadClientImage({url: data.previewImage, name: fileName}, $img, rte, ed); });
            uploadAppImage({url: previewImageUrl, name: fileName}, $img, rte, ed);
            return $img;
        },

        lookupLabel: function(actionId) {
            if(this.entries) {
                for(var i = 0; i < this.entries.length; ++i) {
                    var entry = this.entries[i];
                    if(entry.id === actionId) return (entry.label || "");
                }
            }
            return "";
        },

        _createArtifactFromData: function(ed, appUUID, appInstanceUUID, actionId, data, editedContentBean) {
            var that = this;
            var artifactHelper = new jive.Apps.RteArtifacts();

            return artifactHelper.createArtifact({
                ed: ed,
                rte: this.rte,
                appUUID: appUUID,
                appInstanceUUID: appInstanceUUID,
                actionId: actionId,
                data: data,
                editedContentBean: editedContentBean,
                actionLabel: that.lookupLabel( actionId )
            });
        },

        /**
         * Make Request will make an AJAX request to the server, which outputs JSON in the following form - an array of App Action objects:
         * [{
                appURL: 'http://apphosting.jivesoftware.com/apps/myapp/gadget/xml',
                appUUID: '50c85e0e-e746-4d32-b1f2-97f720531165',
                appInstanceUUID : 'e364d2ad-ad5c-f4c6-e3d4-02f94b31111d',
                icon : "http://lt-ws-090156.jiveland.com:8080/servlet/JiveServlet/downloadImage/1408-1023-1109/jira16-png.png",
                id : "org.jiraActionsExample.linkToIssue",
                label : 'Link to Issue',
                path : 'jive/actions/rte',
                style : '',
                tooltip : 'tooltip',
                view : 'embedded.createJiraIssue',
                viewTarget : ''
            }]
         * @param url
         * @param searchText
         */
        _makeRequest: function(url, searchText) {
            // load app action results the first time requested and cache in memory
            if(typeof this.entries === 'undefined' || expectedAppsChangeCount != appsChangeCount) {
                return $j.ajax(url, {
                    cache: false,
                    dataType: 'json',
                    error: function(data, status) {
                        if(status != 'abort') {
//                            console.log('ajax error: ', data);
                        }
                    }
                });
            } else {

                // client side filtering from cached results
                if(searchText !== '') {
                    searchText = searchText.replace(/_/g, ' ');
                    return $j.quickSilverFilter(this.entries, searchText, 7, function(entry) {
                        return entry.filterString;
                    });
                } else {
                    return this.entries;
                }
            }

        },

        _highlightSearchChars: function(string, searchText) {
            var stringLetters = string.split("");
            var searchTextLetters = searchText.toLowerCase().split("");
            var replaced = '';
            for ( var i = 0; i < string.length; i++ ) {
                var letter = string.charAt(i);
                var piece = letter;
                var lowerCaseLetter = letter.toLowerCase();
                if ( searchTextLetters[0] == lowerCaseLetter ) {
                    piece =  '<span class="j-app-highlight">' + letter + '</span>';
                    searchTextLetters.shift();
                }
                replaced += piece;
            }
            return {
                'replaced': replaced,
                'remainingSearchText': searchTextLetters.join("")
            };
        },

        _handleResults : function(resultPromise, bangPlugin, template, node, offset, searchText) {
            var self = this;

            $j.when(resultPromise).then(function(entries) {
                if(typeof self.entries === 'undefined' || expectedAppsChangeCount != appsChangeCount) {
                    expectedAppsChangeCount = appsChangeCount;
                    self.entries = $j.map(entries, function(entry) {
                        entry.filterString = (entry.appName + ' : ' + entry.label).toLowerCase();
                        return entry;
                    });
                }
                var nonInstalled = self.entries == null || self.entries.length < 1;

                if (!template) return; // happens when pre-loading app actions
                var tHTML = template.call(this, {nonInstalled: nonInstalled, entries: entries, searchText: searchText});
                bangPlugin.popOverContents.html(tHTML);

                bangPlugin.popOverContents.find("li").each( function()  {

                    var li = $j(this);

                    var searchTextLetters = searchText.toLowerCase().split("");
                    var appTitle = li.find("em");
                    var appTitleText = appTitle.text();
                    var actionLabel = li.find("span[class=label]");
                    var actionLabelText = actionLabel.text();
//                    var appTitleTextLetters = appTitleText.split("");

                    var result = self._highlightSearchChars(appTitleText, searchText);
                    appTitle.html( result.replaced );

                    result = self._highlightSearchChars(actionLabelText, result.remainingSearchText);
                    actionLabel.html( result.replaced );
                } );

                if(node !== null && offset !== null){
                    bangPlugin.positionThePopUp(bangPlugin.ed, node, offset);
                }

                bangPlugin.popOverContents.find(".j-apps-market-link").click(function(e) {
                    var me = $j(this);
                    var filter = me.attr("data-filter") || null;
                    if(window.appContainer) {
                        window.appContainer.handleMarketContext({
                            experience: "appsCatalog",
                            appFilter: filter,
                            actionContributionFilter: "jive/actions/rte"
                        });
                    }
                    bangPlugin.hideThePopup();
                    /*
                    var ed = bangPlugin.ed;
                    var addSpace = false;
                    bangPlugin.replaceSearchText(ed, bangPlugin.lastInfo.node, bangPlugin.lastInfo.offset, "", addSpace);
                    */
                    // save dropdown args for showing post install.
                    searchArgs = { ed: bangPlugin.ed, bangPlugin: bangPlugin, node: node, offset: offset, searchText: searchText };
                    e.preventDefault();

                    /*
                    jive.switchboard.addListener('apps_market.apps_have_changed', function() {
                        appsChangeCount = appsChangeCount + 1;
                        appBang.search(bangPlugin.ed, bangPlugin, node, offset, searchText);
                });
                    */

                });
                bangPlugin.popOverContents.find('a').filter('.js-app-action-select-link').click(function(){
                    var $link = $j(this);
                    self.select($link, bangPlugin, false);
                    return false;
                }).attr("href", "javascript:;");
            });
        }
    };

    tinymce.create('tinymce.plugins.JiveAppsPlugin', {

        rte: null,

        setRTE: function(rte) {
            this.rte = rte;
            appBang.init(rte);
            this.completeInit();
        },

        init : function(ed, url){
            this.ed = ed;
            var self = this;

            //TODO: do plugin initialization here
            ed.plugins.jivemention.addMentionType(appBang);

            ed.onInit.add(function(){
                //TODO: do late plugin initialization here, such as jivecontextmenu integration
                /*
                window.top.appContainer.addListener('app.action.dataReturned', function(data) {
                    appBang.insertArtifact(data, ed.plugins.jivemention);
                });
                */

                function isAppEmbeddedViewNode(node) {
                    return node.nodeType == 1 && $j(node).hasClass('jive_macro_appEmbeddedView');
                }

                if (ed.plugins.jivecontextmenu) {
                    var contextMenu = ed.plugins.jivecontextmenu;

                    function findActionEntry(node) {
                        var $node = $j(node);
                        var entry = $node.data("actionEntry");
                        if (!entry) {
                            var actionId = $node.attr("__action_id");
                            var appUUID = $node.attr("__appuuid");
                            for (var i = 0, l = appBang.entries.length; i < l; ++i) {
                                var e = appBang.entries[i];
                                if (e.appUUID == appUUID && e.id == actionId) {
                                    entry = e;
                                    break;
                                }
                            }
                            if (!entry) {
                                entry = { _noResult : false };
                            }
                            $node.data("actionEntry", entry);
                        }
                        return entry._noResult === false ? null : entry;
                    }

                    function findContextNode(rng) {
                        if (!appBang.entries) {
                            return null;
                        }
                        var n = rng.startContainer.childNodes[rng.startOffset];
                        if (!n) {
                            n = rng.startContainer;
                        }
                        while (n && !isAppEmbeddedViewNode(n)) {
                            n = n.parentNode;
                        }
                        if (n) {
                            var actionEntry = findActionEntry(n);
                            if (actionEntry) {
                                return n;
                            }
                        }
                        return null;
                    }

                    function renderer(item, ed, $menu) {
                        var link = $j(item.findContextNode(ed.selection.getRng(true)));
                        var $img = $j("<img/>").attr("src", link.data("actionEntry").icon)
                                               .css({
                                                        "border":"none",
                                                        "width":"16px",
                                                        "height":"16px"
                                                    });
                        var $box = $j("<div/>").css({
                                                        "background-color":"#fff",
                                                        "width":"16px",
                                                        "height":"16px",
                                                        "padding":"2px 4px"
                                                    })
                                               .append($img);
                        var $elem = $j("<a/>").addClass("button")
                                              .attr("href", "javascript:;")
                                              .css({
                                                        "float":"left",
                                                        "width":"24px",
                                                        "text-align":"center"
                                                   })
                                              .append($box);
                        $box.append($img);
                        return $elem.append($box).get(0);
                    }

                    function displayCallback(contextNode, menuItemNode) {
                        $j("img", menuItemNode).attr("src", $j(contextNode).data("actionEntry").icon);
                    }

                    var ulItem = new contextMenu.MenuItem("appEmbeddedView", findContextNode, null, renderer,
                                                          "jiveAppReEdit", null, null, null, displayCallback);
                    contextMenu.addRootItem(ulItem);

                }
            }, this);
        },

        completeInit: function() {
            if(this.rte && this.ed && !this.initialized) {
                this.initialized = true;

                var ed = this.ed;
                var dom = ed.dom;
                var outerDom = new tinymce.dom.DOMUtils(document);

                var control = outerDom.create("div", {
                    "class" : "gutterButton appButton"
                }, ed.getLang("jiveapps.edit_app"));

                //IE9 loses track of the range when the RTE loses focus, when we click the button.  Save it, and pass it along.
                var rng = null;
                outerDom.bind(control, "mousedown", function(){
                    rng = ed.selection.getRng(true);
                });
                outerDom.bind(control, "click", function(e){
                    ed.execCommand("jiveAppEdit", true, rng);
                    e.stopPropagation();
                });

                this.rte.getGutter().appendChild(control);

                ed.plugins.paste.onPasteComplete.add(function(){
                    tinymce.each(dom.select("a.jive_macro_appEmbeddedView", ed.getBody()), function(aTag){
                        if (!dom.getAttrib(aTag, "href")) {
                            dom.setAttrib(aTag, "href", "javascript:;")
                        }
                    });
                    tinymce.each(dom.select("a.jive-link-app-icon", ed.getBody()), function(aTag){
                        var link = $j(aTag);
                        if (link.attr("__icon")) {
                            link.css("background-image", "url('" + link.attr("__icon") + "')");
                        }
                    });
                });

                ed.onPopupClose.add( function() {
                if ( $j.browser.msie && $j.browser.version < 8 ) {
                        // for IE7, restore the z-indexes
                        restoreSavedZIndex( $j('.j-publishbar') );
                        restoreSavedZIndex( $j('.jive-content') );
                    }
                });
            }
        },

        /**
         * Executes a specific command, this function handles plugin commands.
         *
         * @return true if the command was executed by this plugin
         */
        execCommand : function(cmd, ui, val){
            var ed = this.ed;
            switch (cmd) {
                case "jiveAppEdit":
                    if(val){
                        ed.selection.setRng(val);
                    }
                    ed.undoManager.add();
                    var prepend = /\s/.test(this._charAt(this._prevCharPos(this.ed.selectionUtil.startPos(val))))
                        ? '!' : ' !';
                    var content = prepend + ed.selection.getContent();
                    ed.selection.setContent(content);
                    ed.selection.collapse(false);
                    ed.focus();
                    ed.undoManager.add();

                    //the implicit nodeChange causes a checkForMentionPopup
                    return true;
                case "jiveAppReEdit":
                    if (val) {
                        var $node = $j(val.node);
                        var action = $node.data("actionEntry");
                        if (action) {
                            var position = { offset: 0 }; // this needs ot be fixed someday, when it becomes actually useful
                            var appActionDataPromise = $j.Deferred();
                            appActionDataPromise.done(function(dataFromApp, rpcArgs, editedContentBean) {
                                var oldLink = val.node;
                                var newLink = appBang._createArtifactFromData(ed, action.appUUID, action.appInstanceUUID,
                                    action.id, dataFromApp, editedContentBean);
                                oldLink.parentNode.insertBefore(newLink, oldLink);
                                oldLink.parentNode.removeChild(oldLink);
                                $j(newLink).data("actionEntry", action);
                            });
                            var currentArtifact = this._buildArtifact($node);
                            window.top.appContainer.handleRTEActionContextEdit(action, buildSelectionData(ed, position), currentArtifact, appActionDataPromise);
                        }
                    }
                    // todo, open
            }

            return false;
        },

        _buildArtifact: function($node) {
            var artifactHelper = new jive.Apps.RteArtifacts();
            return artifactHelper.parseSelectionContextFromArtifact($node);
        },

        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @returns Name/value array containing information about the plugin.
         * @type Array
         */
        getInfo : function() {
            return {
                longname : 'Jive Apps',
                author : 'Jive Software',
                authorurl : 'http://www.jivesoftware.com',
                infourl : 'http://www.jivesoftware.com/',
                version : "1.0"
            };
        },

        _charAt: function(treePos){
            if(treePos && treePos.c.nodeType == 3){
                return treePos.c.nodeValue.substr(treePos.off, 1);
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
        }
    });

    if (!(window._jive_current_user.anonymous || window._jive_current_user.partner ) ) {
        // Register plugin only if not guest access
        tinymce.PluginManager.add('jiveapps', tinymce.plugins.JiveAppsPlugin);
    }

})();

