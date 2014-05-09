/*jslint browser:true */
/*extern jive $j */
/*extern JsTree */

jive.namespace('admin');

/**
 * @depends path=/resources/scripts/jquery/ui/ui.sortable.js
 */
jive.admin.CommunityManager = function(i18nStrings, spacesSearchURL, invalidTree) {

    var spaceTree = null;
    var currentSelectedRow = null;
    var buttonBar, searchButtonBar;
    var newButton, editButton, moveButton, deleteButton;
    var editButtonSearch, deleteButtonSearch;

    Event.observe(window, 'load', function() {
        var currID = document.getElementById("spaceForm").communityID.value;
        loadTree(currID);
        setNavHandlers();
        createButtonBar();
    });

    $j(document).ready(function() {
        // Handle tab switching.
        $j('#jive-browse-tab a').click(function() {
            showTab('browse');
            return false;
        });
        $j('#jive-search-tab a').click(function() {
            showTab('search');
            return false;
        });

        // Handle search form submission.
        $j('#spacesearchform').submit(function() {
            getSearchResults();
            return false;
        });

        // Handle clicks on search results.
        function loadPageByElementID(element) {
            $j(element).filter(function() {
                return $j(this).attr('id').match(/^\d+$/);  // Ensure element has a numeric `id`.
            }).map(function() {
                loadPage($j(this).attr('id'));
            });
        }
        $j('#search-div td span[id]:not(.disabled)').live('mousedown', function() {
            selectRow(this);
            return false;
        }).live('dblclick', function() {
            loadPageByElementID(this);
            return false;
        });
        $j('#search-div td a[id]:not(.disabled)').live('click', function() {
            loadPageByElementID(this);
            return false;
        });

        // Handle search result pagination.
        $j('.jive-pagination a').live('click', function() {
            var start = ($j(this).attr('href').match(/start=(\d+)/) || [])[1];
            if (start) {
                $j('#spacesearchform-start').val(start);
                getSearchResults();
                return false;
            }
        });
    });

    // Add onclick handler to nav links to use current selection
    function setNavHandlers() {
        var link;
        if (link = document.getElementById("community-management")) {
            link.onclick = navHandler;
        }
        if (link = document.getElementById("community-settings")) {
            link.onclick = navHandler;
        }
        if (link = document.getElementById("community-permissions")) {
            link.onclick = navHandler;
        }
        if (link = document.getElementById("community-summary")) {
            link.onclick = navHandler;
        }
        if (link = document.getElementById("community-doc-management")) {
            link.onclick = navHandler;
        }
        if (link = document.getElementById("community-thread-management")) {
            link.onclick = navHandler;
        }
        if (link = document.getElementById("community-tagsets")) {
            link.onclick = navHandler;
        }
        if (link = document.getElementById("community-merge")) {
            link.onclick = navHandler;
        }
    }

    function navHandler() {
        var url = this.href;
        var id = getSelectedID();
        if (id == null) {
            id = 1;
        }
        var selectedNode = document.getElementById("space_" + id);
        if (!selectedNode) {
            alert(i18nStrings.messages.selectspace);
            return false;
        }
        if (!selectedNode.hasAdminPerm) {
            alert(i18nStrings.messages.noperm);
            return false;
        }
        if (this.id == "community-merge" && id == 1) {
            alert(i18nStrings.messages.mergeroot);
            return false;
        }

        url = url.replace(/communityID=\d*/, "communityID=" + id);
        url = url.replace(/community=\d*/, "community=" + id);
        location.replace(url);
        return false;
    }

    // Given a DOM element or a jQuery object will parse the element's space ID
    // from its DOM id and return it.
    function spaceIDOf(element) {
        return ($j(element).attr('id').match(/\d+/) || [])[0];
    }

    // Given a function executes the function while displaying a loading
    // indicator.  Alternatively you can display a loading indicator by passing
    // `true` as the first argument and remove the indicator by passing
    // `false`.
    function loadingIndicator(func) {
        if (typeof func == 'function') {
            $j('body').css('cursor', 'wait');
            func();
            $j('body').css('cursor', '');
        } else if (func) {
            $j('body').css('cursor', 'wait');
        } else {
            $j('body').css('cursor', '');
        }
    }

    // Tree functions
    function loadTree(currID) {
        var spaceID = currID ? currID : 1;
        spaceTree = new JsTree();
        spaceTree.setSelectable(true);
        spaceTree.setSelectionCallback(selectionCallback);
        spaceTree.setDoubleClickCallback(doubleClickCallback);
        spaceTree.setLoadFunction(loadNode);
        var initTree = function(c) {
            var root = spaceTree.addNode(null, "space_" + c.ID, c.name);
            root.hasAdminPerm = c.hasAdminPerm;
            if (!root.hasAdminPerm)  {
                spaceTree.disable(root);
            }
            buildNode(root, c);
            var treeDiv = document.getElementById("tree-div");
            if (treeDiv.firstChild) {
                treeDiv.replaceChild(spaceTree.getRoot(), treeDiv.firstChild);
            } else {
                treeDiv.appendChild(spaceTree.getRoot());
            }
            makeSortable(spaceTree.getRoot());
            setInitialSelection(spaceID);
        };
        CommunityUtils.getCommunityTree(spaceID, initTree);
    }

    function loadNode(node) {
        loadingIndicator(function() {
            var id = spaceIDOf(node);
            // use closure to bind node parameter to callback
            CommunityUtils.getCommunities(id,
                    function(c){
                        buildNode(node, c);
                        makeSortable(node);
                        spaceTree.openNode(node);
                    });
        });
    }

    function buildNode(node, c) {
        var n, child;
        for (var i=0; i < c.children.length; i++) {
            child = c.children[i];
            n = spaceTree.addNode(node, "space_" + child.ID, child.name);
            n.hasAdminPerm = child.hasAdminPerm;
            if (child.children && child.children.length > 0) {
                buildNode(n, child);
            } else if (child.hasChildren) {
                spaceTree.setHasChildren(n);
            }
            if (!child.hasAdminPerm)  {
                spaceTree.disable(n);
            }
        }
    }

    function makeSortable(n) {
        // parent sortables must be created after child sortables
        var tag, child;
        for (var i=0; i < n.childNodes.length; i++) {
            child = n.childNodes[i];
            tag = child.nodeName.toLowerCase();
            if ((tag == "ul") || (tag == "li")) {
                makeSortable(child);
            }
        }

        tag = n.nodeName.toLowerCase();
        if (!invalidTree) {
            if ((tag == "li") && n.childList && (n.childList.childNodes.length > 1) && n.hasAdminPerm) {
                $j(n.childList).sortable({ axis: 'y', stop: reorder });
            }
        }
    }

    function setInitialSelection(spaceID) {
        var idStr = "space_" + spaceID;
        var space = document.getElementById(idStr);
        if (space && space.hasAdminPerm) {
            spaceTree.setSelected(idStr);
            return;
        }

        space = findFirstEditableSpace(spaceTree.getRoot().firstChild);
        if (space) {
            spaceTree.setSelected(space.id);
        }
    }

    // A breadth-first search to find an editable space
    function findFirstEditableSpace(space) {
        if (space.hasAdminPerm) {
            return space;
        }

        if (space.childList == null) {
            return null;
        }

        var editableSpace = null;
        var i, child;
        for (i=0; i < space.childList.childNodes.length; i++) {
            child = space.childList.childNodes[i];
            if (child.hasAdminPerm) {
                return child;
            }
        }
        for (i=0; i < space.childList.childNodes.length; i++) {
            child = space.childList.childNodes[i];
            editableSpace = findFirstEditableSpace(child);
            if (editableSpace) {
                return editableSpace;
            }
        }

        return null;
    }

    function selectionCallback(selectedNode) {
        var hasParentAdminPerm = selectedNode.parentNode.parentNode.hasAdminPerm;

        if (!invalidTree) {
            if (selectedNode.hasAdminPerm) {
                newButton.removeClassName('disabled');
                newButton.onclick = newSpace;
                editButton.removeClassName('disabled');
                editButton.onclick = editSpace;
            } else {
                newButton.addClassName('disabled');
                newButton.onclick = null;
                editButton.addClassName('disabled');
                editButton.onclick = null;
            }
            if ((selectedNode.id != "space_1") && (hasParentAdminPerm || selectedNode.hasAdminPerm)) {
                moveButton.removeClassName('disabled');
                moveButton.onclick = moveSpace;
                deleteButton.removeClassName('disabled');
                deleteButton.onclick = deleteSpace;
            } else {
                moveButton.addClassName('disabled');
                moveButton.onclick = null;
                deleteButton.addClassName('disabled');
                deleteButton.onclick = null;
            }

            selectedNode.insertBefore(buttonBar, selectedNode.childList);
        }
    }

    function createButtonBar() {
        buttonBar = document.createElement("span");
        buttonBar.className = "button-bar";

        if (!invalidTree) {
            newButton = new Element('a').update(i18nStrings.button.create);
            newButton.href = "#";
            buttonBar.appendChild(newButton);
            editButton = new Element('a').update(i18nStrings.button.edit);
            editButton.href = "#";
            buttonBar.appendChild(editButton);
            moveButton = new Element('a').update(i18nStrings.button.move);
            moveButton.href = "#";
            buttonBar.appendChild(moveButton);
            deleteButton = new Element('a').update(i18nStrings.button['delete']);
            deleteButton.href = "#";
            buttonBar.appendChild(deleteButton);

            searchButtonBar = document.createElement("span");
            searchButtonBar.className = "search-button-bar";

            editButtonSearch = new Element('a').update(i18nStrings.button.edit);
            editButtonSearch.href = "#"
            editButtonSearch.onclick = editSpace;
            searchButtonBar.appendChild(editButtonSearch);
            deleteButtonSearch = new Element('a').update(i18nStrings.button['delete']);
            deleteButtonSearch.href = "#"
            deleteButtonSearch.onclick = deleteSpace;
            searchButtonBar.appendChild(deleteButtonSearch);
        }
    }

    function getPos(obj) {
        var output = new Object();
        var mytop=0, myleft=0;
        while (obj) {
            mytop += obj.offsetTop;
            myleft += obj.offsetLeft;
            obj = obj.offsetParent;
        }
        output.left = myleft;
        output.top = mytop;
        return output;
    }

    function doubleClickCallback(selectedNode) {
        if (!selectedNode.hasAdminPerm) {
            alert(i18nStrings.messages.noperm);
            return;
        }

        var idNumber = selectedNode.id.substr(selectedNode.id.indexOf("_") + 1);
        loadPage(idNumber);
    }

    function reorder(event, ui) {
        if (!invalidTree) {
            var childID = spaceIDOf(ui.item);
            var parentID = spaceIDOf(event.target);
            var newIndex = -1;

            $j(event.target).children().each(function(i, c) {
                if (c.id == ui.item.attr('id')) {
                    newIndex = i;
                    return false;
                }
            });

            var form = document.getElementById("spaceForm");
            form.communityID.value = parentID;
            form.subCommunityID.value = childID;
            form.newIndex.value = newIndex;

            // Submit the form with updated space position in the background.
            loadingIndicator(true);
            $j.ajax({
                url: $j(form).attr('action'),
                type: 'post',
                data: $j(form).serialize(),
                error: function() {
                    alert(i18nStrings.messages.reorderError);
                },
                complete: function() {
                    loadingIndicator(false);
                }
            });
        }
    }

    function newSpace() {
        if (!invalidTree) {
            var id = getSelectedID();
            if (id) {
                var form = document.getElementById("spaceForm");
                form.action.value = "newcat";
                form.communityID.value = id;
                form.submit();
            }
        }
    }

    function editSpace() {
        var id = getSelectedID();
        if (id) {
            window.location.href = "community-overview.jspa?refererURL=community-main.jsp&communityID=" + id;
        }
    }

    function moveSpace() {
        if (!invalidTree) {
            var id = getSelectedID();
            if (id) {
                var form = document.getElementById("spaceForm");
                form.action.value = "movecat";
                form.communityID.value = id;
                form.submit();
            }
        }
    }

    function deleteSpace() {
        if (!invalidTree) {
            var id = getSelectedID();
            if (id) {
                if (id == 1) {
                    alert(i18nStrings.messages.cantdeleteroot);
                    return;
                }
                window.location.href = "community-overview.jspa?refererURL=community-delete.jsp&communityID=" + id;
            }
        }
    }

    function getSelectedID() {
        var browseDiv = document.getElementById("browse-tab");
        if ((browseDiv.style.display == "block") || (browseDiv.style.display == "")) {
            if (spaceTree.getSelected()) {
                var id = spaceTree.getSelected().id;
                id = id.substr(id.indexOf("_") + 1);
                return id;
            }
        } else if (currentSelectedRow) {
            return currentSelectedRow.id;
        }
        return 0;
    }

    function showTab(tab) {
        var browseTab = document.getElementById("jive-browse-tab");
        var searchTab = document.getElementById("jive-search-tab");
        var browseDiv = document.getElementById("browse-tab");
        var searchDiv = document.getElementById("search-tab");

        if (tab == "browse") {
            if (browseDiv.style.display == "none") {
                var id = getSelectedID();
                if (id) {
                    var spaceID = "space_" + id;
                    if (document.getElementById(spaceID)) {
                        spaceTree.setSelected(spaceID);
                    } else {
                        loadTree(id);
                    }
                }

                browseDiv.style.display = "block";
                searchDiv.style.display = "none";
                browseTab.className = "jive-body-tab jive-body-tabcurrent active";
                searchTab.className = "jive-body-tab";
            }
        } else if (tab == "search") {
            if (searchDiv.style.display == "none") {
                var id = getSelectedID();
                if (id) {
                    var el = document.getElementById(id);
                    if (el) {
                        selectRow(el);
                    } else {
                        selectRow(null);
                    }
                }

                searchDiv.style.display = "block";
                browseDiv.style.display = "none";
                searchTab.className = "jive-body-tab jive-body-tabcurrent active";
                browseTab.className = "jive-body-tab";
                document.getElementById("queryString").focus();
            }
        }
    }

    function loadPage(id) {
        window.location.replace("community-main.jsp?communityID=" + id);
    }

    function selectRow(element) {
        if (currentSelectedRow) {
            currentSelectedRow.parentNode.className = "";
        }
        currentSelectedRow = element;

        if (currentSelectedRow) {
            currentSelectedRow.parentNode.className = "selectedRow";
            currentSelectedRow.appendChild(searchButtonBar);
        }
    }

    function getSearchResults() {
        currentSelectedRow = null;
        var start = document.getElementById("spacesearchform-start").value;
        var queryString = document.getElementById("queryString").value;
        var finalParams = { resultTypes: "COMMUNITY",
                            queryString: queryString,
                            start: start,
                            spacesearchform: "spacesearchform",
                            view: "search" };
        new Ajax.Updater("search-div", spacesSearchURL, {
            method: 'get',
            asynchronous:true,
            evalScripts:true,
            parameters: finalParams
        });
    }

}
