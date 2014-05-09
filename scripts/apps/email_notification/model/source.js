jive.namespace('EmailNotification');

jive.EmailNotification.Source = jive.RestService.extend(function(protect) {
    protect.resourceType = 'emailwatches';
    protect.pluralizedResourceType = protect.resourceType;
    protect.resourceType = "emailwatches";

    
    this.watch = function(contentId, containerId) {
        var url = this.RESOURCE_ENDPOINT + '/watch/' + containerId + '/' + contentId;
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', { url: url });
    };
    
    this.unwatch = function(contentId, containerId) {
        var url = this.RESOURCE_ENDPOINT + '/unwatch/' + containerId + '/' + contentId;
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', { url: url });
    };
});
