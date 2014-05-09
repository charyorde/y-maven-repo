/**
 * Page controller for Video > Activity recently viewed videos recommendation
 *
 * @depends template=jive.eae.recommendation.renderedRecentViewedVideos
 *
 * @depends path=/resources/scripts/apps/recommendation/recentviewedvideos_source.js
 * @depends path=/resources/scripts/apps/recommendation_app/controllers/general_recommendation_controller.js
 */
jive.namespace('RecommendationApp').recentViewedVideosActivityPageController = {

  initialize: function() {
    alert('recentViewedVideosPageController is initialized'); 

    function poll() {
      alert('polling...');
    }

    poll();
  }
};
