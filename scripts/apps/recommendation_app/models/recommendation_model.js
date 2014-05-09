/**
 * Serves as a single interface for both getting recommendations and providing recommendation feedback.
 *
 * @depends path=/resources/scripts/apps/recommendation_app/models/activity_model.js
 * @depends path=/resources/scripts/apps/recommendation_feedback/models/recommendation_feedback_source.js
 */
jive.namespace('RecommendationApp').RecommendationModel = function() {
    var activityModel = new jive.RecommendationApp.ActivityModel(),
        feedbackModel = new jive.RecommendationFeedback.RecommendationFeedbackSource();
    
		
    return {
        /**
         * @param {number} id
         * @param {number} objectType
         * @returns {jive.conc.Promise}
         */
        expressDisinterest: function(id, objectType) {
            return feedbackModel.expressDisinterest(objectType, id);
        },

        /**
         * @param {number} id
         * @param {number} objectType
         * @returns {jive.conc.Promise}
         */
        expressDislike: function(id, objectType) {
            return feedbackModel.expressDislike(objectType, id);
        },

        /**
         * @param {object} data contains recommendationMax, trendingMax and usersMax keys. If a key is not included, the back end uses defaults.
         * @returns {jive.conc.Promise}
         */
        getActivity: function(data) {
            return activityModel.getActivity(data);
        },

        /**
         * @param {object} data contains recommendationMax, trendingMax and usersMax keys. If a key is not included, the back end uses defaults.
         * @returns {jive.conc.Promise}
         */
        getActivityHome: function(data) {
            return activityModel.getActivityHome(data);
        },

        /**
         * @param {number} recommendationMax
         * @param {number} trendingMax
         * @returns {jive.conc.Promise}
         */
        getContentRecommendations: function(recommendationMax, trendingMax) {
            return activityModel.getContentRecommendations(recommendationMax, trendingMax);
        },

        /**
         * @param {number} recommendationMax
         * @param {number} trendingMax
         * @returns {jive.conc.Promise}
         */
        getPeopleRecommendations: function(recommendationMax, trendingMax) {
            return activityModel.getPeopleRecommendations(recommendationMax, trendingMax);
        },

        /**
         * @param {number} recommendationMax
         * @param {number} trendingMax
         * @returns {jive.conc.Promise}
         */
        getPlaceRecommendations: function(recommendationMax, trendingMax) {
            return activityModel.getPlaceRecommendations(recommendationMax, trendingMax);
        },

        /**
         * @param {number} userId
         * @param {number} trendingMax
         * @returns {jive.conc.Promise}
         */
        getProfileTrendingContent: function(userId, trendingMax) {
            return activityModel.getProfileTrendingContent(userId, trendingMax);
        },

        /**
         * @param {number} userId
         * @param {number} trendingMax
         * @returns {jive.conc.Promise}
         */
        getProfileTrendingContentHome: function(userId, trendingMax) {
            return activityModel.getProfileTrendingContentHome(userId, trendingMax);
        },

        /**
         * @param {number} trendingMax
         * @returns {jive.conc.Promise}
         */
        getTrendingContent: function(trendingMax) {
            return activityModel.getTrendingContent(trendingMax);
        },

        /**
         * @param {number} trendingMax
         * @returns {jive.conc.Promise}
         */
        getTrendingContentHome: function(trendingMax) {
            return activityModel.getTrendingContentHome(trendingMax);
        },


        /**
         * @param {number} trendingMax
         * @returns {jive.conc.Promise}
         */
        getTrendingUsers: function(trendingMax) {
            return activityModel.getTrendingUsers(trendingMax);
        }
    };
};
