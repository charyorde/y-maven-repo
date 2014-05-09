var JsTree = $Class.extend({
    init: function() {
        this.checkable = false;
        this.selectable = false;
        this.multiselect = false;
        this.loadFunction = null;
        this.selectionCallback = null;
        this.selectionHasChanged = false;
        this.doubleClickCallback = null;
    },

    getRoot: function() {
        return this.root;
    },

    getCheckable: function() {
        return this.checkable;
    },

    setCheckable: function(checkable) {
        this.checkable = checkable;
    },

    getSelectable: function() {
        return this.selectable;
    },

    setSelectable: function(selectable) {
        this.selectable = selectable;
    },

    getLoadFunction: function() {
        return this.loadFunction;
    },

    setLoadFunction: function(loadFunction) {
        this.loadFunction = loadFunction;
    },

    getSelectionCallback: function() {
        return this.selectionCallback;
    },

    setSelectionCallback: function(callback) {
        this.selectionCallback = callback;
    },

    getDoubleClickCallback: function() {
        return this.doubleClickCallback;
    },

    setDoubleClickCallback: function(callback) {
        this.doubleClickCallback = callback;
    },

    setHasChildren: function(node) {
        // root node is always expanded, so no controls
        if (node.parentNode != this.root) {
            var obj = this;
            node.hasChildren = true;
            node.className = "closed-node";
            node.firstChild.onclick = function() {obj.toggleView(this)};

            // put undisplayed text in image div so SilkTest can see it
            if (node.firstChild.firstChild == null) {
                var marker = document.createElement("span");
                marker.appendChild(document.createTextNode("+"));
                marker.style.display = "none";
                node.firstChild.appendChild(marker);
            }
        }
    },

    addNode: function(parent, id, label) {
        if (parent == null) {
            if (this.root == null) {
                this.root = document.createElement("ul");
                this.root.className = "jstree";
            }
            parent = this.root;
        }

        var node = this.createNode(id, label);

        if (parent.nodeName.toLowerCase() == "li") {
            this.setHasChildren(parent);
            parent.childList.appendChild(node);
        } else {
            parent.appendChild(node);
            // root node is always expanded
            node.childList.style.display = "block";
        }

        return node;
    },

    createNode: function(id, label) {
        var item = document.createElement("li");
        item.id = id;
        var div = document.createElement("div");
        div.className = "image-div";
        item.appendChild(div);

        var obj = this;

        var span, link;
        if (!this.selectable) {
            link = document.createElement("a");
            link.onclick = function() {obj.selectionNotify(this)};
            link.appendChild(document.createTextNode(label));
        } else {
            span = document.createElement("span");
            span.style.cursor = "default";
            span.onmousedown = function() {obj.select(this)};
            span.onclick = function() {obj.selectionNotify(this)};
            span.ondblclick = function() {obj.doubleClickNotify()};
            span.appendChild(document.createTextNode(label));
        }

        if (this.checkable) {
            var checkbox = document.createElement("input");
            checkbox.setAttribute("type", "checkbox");
            item.appendChild(checkbox);
        }
        if (!this.selectable) {
            item.appendChild(link);
        } else {
            item.appendChild(span);
        }

        // child container
        item.hasChildren = false;
        item.childList = document.createElement("ul");
        item.childList.id = id + "_ul";
        item.childList.style.display = "none";
        item.appendChild(item.childList);

        return item;
    },

    select: function(element) {
        if (!this.selectable || element.parentNode.disabled || (this.selected && (element == this.selected))) {
            return false;
        }

        if (this.selected) {
            this.selected.className = "";
        }
        this.selected = element;
        this.selected.className = "selected";
        this.selectionHasChanged = true;
    },

    getSelected: function() {
        return this.selected ? this.selected.parentNode : null;
    },

    setSelected: function(id) {
        var li = document.getElementById(id);
        if (li) {
            this.select(li.childNodes[1]);
            this.makeVisible(li);
            this.selectionNotify();
        }
    },

    selectionNotify: function(element) {
        if (this.selectionCallback) {
            if (!this.selectable) {
                this.selectionCallback(element.parentNode);
            } else if (this.selectionHasChanged) {
                this.selectionCallback(this.getSelected());
                this.selectionHasChanged = false;
            }
        }
    },

    doubleClickNotify: function() {
        if (this.doubleClickCallback) {
            this.doubleClickCallback(this.getSelected());
        }
    },

    makeVisible: function(node) {
        while (node.parentNode && (node.parentNode != this.root) &&
               node.parentNode.parentNode.parentNode && (node.parentNode.parentNode.parentNode != this.root)) {
            node = node.parentNode.parentNode;
            this.openNode(node);
        }
    },

    enable: function(node) {
        node.disabled = false;
        node.childNodes[1].className = "";
    },

    disable: function(node) {
        node.disabled = true;
        node.childNodes[1].className = "disabled";
    },

    enableTree: function(node) {
        node.disabled = false;
        node.childNodes[1].className = "";
        for (var i=0; i < node.childList.childNodes.length; i++) {
            this.disableTree(node.childList.childNodes[i]);
        }
    },

    disableTree: function(node) {
        node.disabled = true;
        node.childNodes[1].className = "disabled";
        for (var i=0; i < node.childList.childNodes.length; i++) {
            this.disableTree(node.childList.childNodes[i]);
        }
    },

    toggleView: function(element) {
        var li = element.parentNode;
        var ul = element.parentNode.childList;

        if (li.hasChildren && ul.childNodes.length == 0) {
            if (this.loadFunction) {
                this.loadFunction(li);
                return false;
            }
        }

        if ((ul.style.display == "") || (ul.style.display == "none")) {
            li.className = "open-node";
            ul.style.display = "block";
        } else {
            li.className = "closed-node";
            ul.style.display = "none";
        }
    },

    openNode: function(node) {
        if ((node.tagName.toLowerCase() == "li") && (node.parentNode != this.root)) {
            node.className = "open-node";
            node.childList.style.display = "block";
        }
    },

    closeNode: function(node) {
        if ((node.tagName.toLowerCase() == "li") && (node.parentNode != this.root)) {
            node.className = "closed-node";
            node.childList.style.display = "none";
        }
    },

    // for testing
    buildTree: function(el) {
        var root, node;

        root = this.addNode(null, 0, "Root");
        this.addNode(root, 1, "One");
        this.addNode(root, 2, "Two");
        node = this.addNode(root, 3, "Three");
        this.addNode(node, 4, "Four");
        this.addNode(node, 5, "Five");
        node = this.addNode(root, 6, "Six");
        this.addNode(node, 7, "Seven");
        this.addNode(node, 8, "Eight");
        node = this.addNode(root, 9, "Nine");
        this.addNode(node, 10, "Ten");
        this.addNode(node, 11, "Eleven");

        el.appendChild(root);
    }
});
