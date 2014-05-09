jive.namespace('RecommendationFeedback');

jive.RecommendationFeedback.RecommendationFeedbackSource = jive.RestService.extend(function(protect) {
    protect.displayGenericErrorMessages = false;
    protect.resourceType = "recommendationfeedback";
    protect.pluralizedResourceType = protect.resourceType;


    /**
     * Marks an object as clicked on.
     *
     * @param objectType
     * @param objectID
     */
    this.save = function(objectType, objectID) {
        var url = this.RESOURCE_ENDPOINT + '/interested/' + objectType + '/' + objectID;
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', { url: url });
    };

    /**
     * Expresses a user's disinterest in an item
     *
     * @param objectType
     * @param objectID
     */
    this.expressDisinterest = function(objectType, objectID) {
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {
            url : this.RESOURCE_ENDPOINT + '/disinterest/' + objectType + '/' + objectID
        });
    };

    /**
     * Expresses a user's disinterest in an item
     *
     * @param objectType
     * @param objectID
     */
    this.expressDislike = function(objectType, objectID) {
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {
            url : this.RESOURCE_ENDPOINT + '/dislike/' + objectType + '/' + objectID
        });
    };
});