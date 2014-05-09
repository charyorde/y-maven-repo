/**
 * jive.recommendationFeedback.Main
 *
 * Main class for controlling recommendation feedback
 *
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 * @depends path=/resources/scripts/apps/recommendation_feedback/models/recommendation_feedback_source.js
 * @depends path=/resources/scripts/apps/recommendation_feedback/views/recommendation_feedback_view.js  
*/

jive.namespace('RecommendationFeedback');

jive.RecommendationFeedback.Main = jive.oo.Class.extend(function(protect) {
    
    this.init = function(options) {
        var main = this;

        this.recommendationFeedbackView = new jive.RecommendationFeedback.RecommendationFeedbackView(options);
        this.recommendationFeedbackSource = new jive.RecommendationFeedback.RecommendationFeedbackSource(options);


        this.recommendationFeedbackView.addListener('recclicked', function(objectType, objectID, promise){
            main.recommendationFeedbackSource.save(objectType, objectID).addCallback(function() {
				promise.emitSuccess();
                
			}).addErrback(function(error, status) {
				console.log('got a err in main.js');
				promise.emitError(error, status);
			});
        });
    }

});