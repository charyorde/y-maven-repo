/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Filters');  // Creates the jive.Filters namespace if it does not already exist.

/**
 * Handles UI for navigating a space hierarchy.
 *
 * @extends jive.AbstractView
 *
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.places.parentChain
 * @depends template=jive.places.parentChainInner
 * @depends template=jive.browse.grid.hierarchyItems
 */
jive.Filters.SpaceHierarchyView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    this.init = function(baseSelector, extraParams, itemViewID, omitIcons) {
        var view = this;
        view.omitIcons = omitIcons || false;
        this.extraParams = extraParams;
        this.baseNode = $(baseSelector);
        view.setItemViewID(itemViewID);

        // View sub-spaces
        this.baseNode.find('a.j-view-children').live("click", function(e) {
            var $link = $(this);
            var containerType = $link.data("objecttype");
            var containerID = $link.data("objectid");
            var $item = $link.closest('.j-hierarchy-item');
            var $childHolder = $item.find('.j-hierarchy-child-holder');
            var loaded = $childHolder.data("children-loaded");
            var hierarchyViewSelected = view.isHierarchyViewSelected();
            if (loaded && hierarchyViewSelected){
                $childHolder.toggle("fast");
            } else {
                view.baseNode.find('.j-loading-container').remove();  //remove any open loading spinners
                view.emit('viewSubspaces', containerType, containerID);
                if ($childHolder){
                    $childHolder.slideToggle("fast");
                }
            }
            $item.find(".j-hide-children-msg").toggle();
            $item.find(".j-show-children-msg").toggle();
            e.preventDefault();
        });

        // Return to parent view
        this.baseNode.find(".up-to-parent-space").live("click", function(e) {
            // go up to parent level
            var containerType = $(this).data("object-type");
            var containerID = $(this).data("object-id");
            view.emit('viewSubspaces', containerType, containerID);
            e.preventDefault();
        });

        // Expand sibling nodes
        this.baseNode.find(".j-hierarchy-more").live("click", function(e) {
            var $link = $(this);
            var parentID = $link.data("parent-objectid");
            var start = $(this).data("index-start");
            var end = $(this).data("index-end");
            var direction = $(this).data("direction");
            var $loading = $(jive.shared.soy.loading());
            $link.replaceWith($loading);
            view.emitP('viewSiblings', parentID, start, end).addCallback(function(data){
                if (direction == 1){
                    delete data[0].prop.beforeInfo;
                } else {
                    delete data[data.length - 1].prop.afterInfo;
                }
                $loading.replaceWith(jive.browse.grid.hierarchyItems({
                    items: data,
                    omitIcons: view.omitIcons
                }))
            }).always(function(){
                view.baseNode.find(".j-loading-container").remove();     //remove loader no matter what
            });
            e.preventDefault();
        });
    };

    this.isHierarchyViewSelected = function(){
        return this.itemViewID == 'hierarchy';
    };

    this.setItemViewID = function(itemViewID){
        this.itemViewID = itemViewID;
    };

    this.update = function(promise) {
        var view = this;

        promise.addCallback(function(itemsView) {
             if (itemsView.itemViewID != 'hierarchy'){
                // Parent info when viewing sub-spaces
                if (itemsView.containerName && (!view.extraParams || (itemsView.containerID != view.extraParams.containerID))) {
                    $("#parent-space-message").show();
                    var ctx = itemsView;
                    if (view.extraParams && view.extraParams.containerType && view.extraParams.containerID){
                        ctx = $j.extend(ctx,{startID: view.extraParams.containerID, startType: view.extraParams.containerType});
                    }
                    $("#parent-space-message").html(jive.places.parentChain(ctx));
                } else {
                    $("#parent-space-message").hide();
                }
                $(".j-browse-search").show();
                $("#j-sort").show();
            } else {
                $(".j-browse-search").hide();
                $("#j-sort").hide();
                $("#parent-space-message").hide();
            }
        });
    };
});
