/*
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
define('jive.Feedback.FeedbackSource', ['jive.RestService'], function(RestService) {
return RestService.extend(function(protect, _super) {
    protect.resourceType = 'feedback';

    protect.init = function(options) {
        _super.init.call(this, options);
        this.RESOURCE_ENDPOINT = jive.rest.url('/feedback_endpoint/feedback');
        this.POST_RESOURCE_ENDPOINT = this.RESOURCE_ENDPOINT;
    };
});
});
