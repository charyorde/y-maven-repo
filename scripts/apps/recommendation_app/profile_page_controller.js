/**
 * Page controller for the Profile > Activity trending content recommendations
 *
 * @depends template=jive.eae.recommendation.activityTrendyContent
 *
 * @depends path=/resources/scripts/apps/recommendation_app/models/recommendation_model.js
 * @depends path=/resources/scripts/apps/recommendation_app/controllers/general_recommendation_controller.js
 */

jive.namespace('RecommendationApp').profilePageController = {
    initialize: function(userId) {
        var model               = new jive.RecommendationApp.RecommendationModel(),
            controller          = new jive.RecommendationApp.GeneralRecommendationController(model, $j('#trendy-container'), jive.eae.recommendation.activityTrendyContent),
            getTrendingContent  = model.getProfileTrendingContentHome.bind(model, userId, $j('#trendy').attr('data-max'));


        /**
         * Query the model for trending recommendations.
         */
        function poll() {
            getTrendingContent().addCallback(displayRecommendations);
        }

        /**
         * Update the controller with recommendation data. When finished, set a timeout to repoll.
         *
         * @param {object} data an array of recommendation objects
         */
        function displayRecommendations(data) {
            controller.notify('newRecommendations', data.recommendations);
            setTimeout(poll, 30000);
        }


        poll();
    }
};