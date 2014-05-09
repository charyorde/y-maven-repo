/**
 * Retrieves recommended content, users and places
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */

jive.namespace('RecommendationApp').ActivityModel = jive.RestService.extend(function(protect) {

    protect.displayGenericErrorMessages = false;
    protect.resourceType = "recommendation";
    protect.pluralizedResourceType = protect.resourceType;

    /**
     * Common ajax requests
     *
     * @param {string} path
     * @param {object} [data]
     * @param {jive.conc.Promise} [promise]
     */
    protect.request = function(path, data, promise) {
        var url = this.RESOURCE_ENDPOINT + '/' + path;
        data = data || {};
        promise = promise || new jive.conc.Promise();

        return protect.commonAjaxRequest(promise, 'GET', { data: data, url: url });
    };

    /**
     * Many of the public methods take both a recommendation max and a trending max.
     *
     * @param {string} path
     * @param {number} recommendationMax
     * @param {number} trendingMax
     */
    protect.maxRequest = function(path, recommendationMax, trendingMax) {
        return this.request(path + '?' + $j.param({
            recommendationMax: recommendationMax,
            trendingMax: trendingMax
        }));
    };

    /**
     * Get recomended for you, trending content and trending user data.
     *
     * @param {object} data
     * @returns {jive.conc.Promise}
     */
    this.getActivity = function(data) {
        return this.request('allrecommendations', data);
    };

    /**
     * Get recomended for you, trending content and trending user data.
     *
     * @param {object} data
     * @returns {jive.conc.Promise}
     */
    this.getActivityHome = function(data) {
        var path = ['allrecommendations', 'home'];
        return this.request(path.join('/'), data);
    };

    /**
     * @param {number} recommendationMax
     * @param {number} trendingMax
     * @returns {jive.conc.Promise}
     */
    this.getContentRecommendations = function(recommendationMax, trendingMax) {
        return this.maxRequest.call(this, 'allcontentrecommendations', recommendationMax, trendingMax);
    };

    /**
     * @param {number} recommendationMax
     * @param {number} trendingMax
     * @returns {jive.conc.Promise}
     */
    this.getPeopleRecommendations = function(recommendationMax, trendingMax) {
        return this.maxRequest.call(this, 'allpeoplerecommendations', recommendationMax, trendingMax);
    };

    /**
     * @param {number} recommendationMax
     * @param {number} trendingMax
     * @returns {jive.conc.Promise}
     */
    this.getPlaceRecommendations = function(recommendationMax, trendingMax) {
        return this.maxRequest.call(this, 'allplacerecommendations', recommendationMax, trendingMax);
    };

    /**
     * @param {number} recommendationMax
     * @param {number} trendingMax
     * @returns {jive.conc.Promise}
     */
    this.getProfileTrendingContent = function(userId, trendingMax) {
        var path = ['userstrendingcontent', userId, trendingMax];
        return this.request(path.join('/'));
    };

    /**
     * @param {number} recommendationMax
     * @param {number} trendingMax
     * @returns {jive.conc.Promise}
     */
    this.getProfileTrendingContentHome = function(userId, trendingMax) {
        var path = ['userstrendingcontent', userId, trendingMax, 'home'];
        return this.request(path.join('/'));
    };

    /**
     * @param {number} trendingMax
     * @returns {jive.conc.Promise}
     */
    this.getTrendingContent = function(trendingMax) {
        return this.request('trendingcontent?max=' + trendingMax);
    };

    /**
     * @param {number} trendingMax
     * @returns {jive.conc.Promise}
     */
    this.getTrendingContentHome = function(trendingMax) {
        var path = ['trendingcontent', 'home'];
        return this.request(path.join('/') + '?max=' + trendingMax);
    };

    /**
     * @param {number} trendingMax
     * @returns {jive.conc.Promise}
     */
    this.getTrendingUsers = function(trendingMax) {
        return this.request('trendingusers/' + trendingMax);
    };
});
