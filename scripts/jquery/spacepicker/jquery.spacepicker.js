(function($) {
    $.fn.spacePicker = function(selectionCallback) {
        var spaceTree = new JsTree();
        var $parentElement = $j(this);

        var initTree = function(c) {
            var root = spaceTree.addNode(null, c.ID, c.name);
            root.hasAdminPerm = c.hasAdminPerm;
            if (!root.hasAdminPerm) {
                spaceTree.disable(root);
            }
            buildNode(root, c);
            $parentElement.get(0).appendChild(spaceTree.getRoot());
        };

        var loadNode = function(node) {
            document.body.style.cursor = "wait";
            CommunityUtils.getCommunities(node.id, function(c) {
                buildNode(node, c);
            });
        };

        var buildNode = function(node, c) {
            var n;
            for (var i = 0; i < c.children.length; i++) {
                var child = c.children[i];
                n = spaceTree.addNode(node, child.ID, child.name);
                n.hasAdminPerm = child.hasAdminPerm;
                if (child.hasChildren) {
                    spaceTree.setHasChildren(n);
                }
                if (!child.hasAdminPerm) {
                    spaceTree.disable(n);
                }
            }
            spaceTree.openNode(node);
            // turn off wait cursor
            document.body.style.cursor = "";
        };

        spaceTree.setLoadFunction(function(n) {loadNode(n);});
        spaceTree.setSelectionCallback(function(node) { selectionCallback.apply($j(node));});
        CommunityUtils.getCommunities(1, function(c) {initTree(c);});
    };
}(jQuery));