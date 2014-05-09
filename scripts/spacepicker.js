var SpacePicker = $Class.extend({
    init: function(parentElement) {
        this.spaceTree = new JsTree();
        this.parentElement = parentElement;
        // use closure to avoid "this" conflict in event handlers
        var obj = this;
        this.spaceTree.setLoadFunction(function(n) {obj.loadNode(n)});
        CommunityUtils.getCommunities(1, function(c) {obj.initTree(c)});
    },

    initTree: function(c) {
        var root = this.spaceTree.addNode(null, c.ID, c.name);
        root.hasAdminPerm = c.hasAdminPerm;
        if (!root.hasAdminPerm)  {
            this.spaceTree.disable(root);
        }
        this.buildNode(root, c);
        this.parentElement.appendChild(this.spaceTree.getRoot());
    },

    loadNode: function(node) {
        // use closure to bind "this" and node parameter to callback
        var obj = this;
        document.body.style.cursor = "wait";
        CommunityUtils.getCommunities(node.id, function(c) {obj.buildNode(node, c)});
    },

    buildNode: function(node, c) {
        var n;
        for (var i=0; i < c.children.length; i++) {
            var child = c.children[i];
            n = this.spaceTree.addNode(node, child.ID, child.name);
            n.hasAdminPerm = child.hasAdminPerm;
            if (child.hasChildren) {
                this.spaceTree.setHasChildren(n);
            }
            if (!child.hasAdminPerm) {
                this.spaceTree.disable(n);
            }
        }
        this.spaceTree.openNode(node);
        // turn off wait cursor
        document.body.style.cursor = "";
    }

});
