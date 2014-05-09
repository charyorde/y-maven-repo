jive.namespace('privacypolicy');

jive.privacypolicy.Source = jive.RestService.extend(function(protect) {

    protect.resourceType = protect.pluralizedResourceType = "contents";
    
    this.init = function(options) {
        this.RESOURCE_ENDPOINT = _jive_base_url + "/api/core/v3/" + protect.resourceType;
    };
    
  /**
   * Retrieve the privacy policy content
   */ 
  this.get = function(documentID) {
    var url = this.RESOURCE_ENDPOINT + "/" + documentID;
    return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url});
  };
});

