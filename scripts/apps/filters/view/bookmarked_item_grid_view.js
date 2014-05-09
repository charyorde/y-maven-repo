/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Filters');  // Creates the jive.Filters namespace if it does not already exist.

/**
 * Handles UI for the item grid portion of a browse bookmarks view.
 *
 * @extends jive.Filters.ItemGridView
 *
 * @param {Object} options
 * @config {Function} [noResults] template function to render when there
 * are no results to display in the item grid view
 *
 * @depends path=/resources/scripts/apps/filters/view/item_grid_view.js
 * @depends template=jive.browse.bookmark.popularBookmarkText
 */
jive.Filters.BookmarkedItemGridView = jive.Filters.ItemGridView.extend(function(protect, _super) {

    var $ = jQuery;

    protect.prepareThumbs = function() {
        var view = this;
        _super.prepareThumbs.call(this);

        view.$itemGrid.find('.js-browse-thumbnail').each(function(i, item) {

            var $item = $(item);
            var itemType = $item.data('object-type');
            var itemObject = $item.data('object-id');

            if (view.itemsView && view.itemsView.items) {
                view.itemsView.items.filter(function(itemData) {
                    return (itemType == itemData.type && itemObject == itemData.id);
                }).forEach(function(itemData) {
                    var $popularText = $item.find('.js-bookmark-popular-text');
                    if ($popularText.length > 0) {
                        $popularText.replaceWith(jive.browse.bookmark.popularBookmarkText(itemData));
                    }
                });
            }
        });
    };

});
