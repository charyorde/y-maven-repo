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
 * Mixin for jive.Filters.Main that adds specialized behavior for
 * displaying a recommended content section.
 *
 * @class
 * @extends jive.Filters.Main
 * @param {Object} options
 * @config {string} recommenderType either 'content' or 'places' or 'people' for recommendations and trending.
 *
 * @depends path=/resources/scripts/apps/filters/main.js
 * @depends path=/resources/scripts/apps/filters/view/recommended_view.js
 * @depends path=/resources/scripts/apps/recommendation_app/models/recommendation_model.js
 */
jive.Filters.RecommendedContent = jive.Filters.Main.extend(function(protect, _super) {
    var _ = jive.Filters;

    protect.init = function(options) {
        _super.init.apply(this, arguments);

        this.recommendedView = new _.RecommendedView();

        // If we default to recommended filter and no hash state load
        // recommended view.  If there is a hash state then
        // jive.Paginated will handle invoking loadPage.
        var state = this.getState();
        if (Object.keys(jive.locationState.getEphemeralState()).length === 0 &&
        this.recommendedFilterApplied(state)) {
            this.loadRecommendedPage(state);
        }
    };

    protect.loadPage = function(params, forceReload) {
        if (this.recommendedFilterApplied(params)) {
            return this.loadRecommendedPage(params);
        } else {
            return _super.loadPage.call(this, params, forceReload);
        }
    };

    protect.loadRecommendedPage = function(params) {
        var filterGroup = this.filterGroup.applied(params.filterID);
        var model = new jive.RecommendationApp.RecommendationModel(),
            map = {
                content: model.getContentRecommendations,
                places: model.getPlaceRecommendations,
                people: model.getPeopleRecommendations
            },
            callback = this.navView.activate.bind(this.navView, filterGroup.getRoot().id),
            pageSize = params.numResults,
            promise = map[this.browseViewID].call(model, pageSize, pageSize).addCallback(callback);

        this.recommendedView.update(this.browseViewID, promise);
        this.toggleRSSLink(false); // hide RSS link because it only works for real browse items
        return promise;
    };

    protect.recommendedFilterApplied = function(params) {
        var filterGroup = this.filterGroup.applied(params.filterID);
        return filterGroup.some(function(filter) {
            return filter.simpleName == 'RecommendedFilter';
        });
    };
});
