/*
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
define('jive.Feedback.FeedbackEndpointSource', ['jive.RestService'], function(RestService) {
return RestService.extend(function(protect, _super) {
    protect.resourceType = 'feedbackEndpoint';

    protect.init = function(options) {
        _super.init.call(this, options);
        this.RESOURCE_ENDPOINT = jive.rest.url('/feedback_endpoint');
        this.POST_RESOURCE_ENDPOINT = this.RESOURCE_ENDPOINT;
    };
});
});
