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
 * Mixin for jive.Paginated / jive.Filters.Main that adds support for
 * tracking pages by activity time associated with each item instead of
 * with page numbers or offset values.
 *
 * @class
 * @extends jive.Filters.Main
 * @depends path=/resources/scripts/apps/filters/main.js
 */
jive.Filters.ActivityTimePagination = jive.Filters.Main.extend(function(protect, _super) {
    var $ = jQuery
      , unset;  // deliberately set to `undefined`

    protect.init = function(options) {
        this.pageReferences = {};
        this.emptyPageReference = {
            activityTime: unset
        };

        _super.init.apply(this, arguments);

        this.setPageReferences({
            items: {
                length: options.numResults
            },
            pageNumber: options.pageNumber,
            paginationStrategy: options.paginationStrategy,
            activityTime: options.activityTime
        });
    };

    /**
     * Stores data that can be used to look up a specific page of content.
     *
     * @param {number} start page offest
     * @param {Object} ref data that the server will use to retrieve the page
     * of content with the given offset
     */
    protect.setPageReferences = function(itemsView) {
        var numResults = itemsView.items.length
          , page = itemsView.pageNumber
          , start = this.pageToStart(page, numResults);

        if (itemsView.paginationStrategy == 'time' && itemsView.activityTime) {
            this.pageReferences[start + numResults] = {
                activityTime: itemsView.activityTime
            };
        }
    };

    /**
     * Retrieves a page reference set by setPageReferences().
     *
     * @param {number} start page offest
     * @returns {Object} page reference parameters
     */
    protect.getPageReference = function(start) {
        return this.pageReferences[start] || this.emptyPageReference;
    };

    /**
     * When loading new data, insert the appropriate `activityTime`
     * value in the request parameters and examine response data to
     * determine the activityTime value associated with the next page.
     */
    protect.getContent = function(params) {
        var modified, dataReady
          , main = this;

        if (this.historyView(params.filterID)) {
            modified = $.extend({}, params, this.getPageReference(params.start));
            dataReady = _super.getContent.call(this, modified);
        } else {
            dataReady = _super.getContent.call(this, params);
        }

        dataReady.addCallback(function(data) {
            main.setPageReferences(data);
        });

        return dataReady;
    };

    var historyFilter = /historyarchetype\[.+\]/;
    protect.historyView = function(filterID) {
        if (typeof filterID == 'string') {
            return Boolean(filterID.match(historyFilter));
        } else {
            return filterID.some(function(id) {
                return id.match(historyFilter);
            });
        }
    };
});
