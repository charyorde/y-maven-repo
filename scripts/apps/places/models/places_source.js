jive.namespace('Places');

/**
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.Places.PlacesSource = jive.RestService.extend(function(protect, _super) {

  //protect.resourceType = "place";

  this.init = function(options) {
    _super.init.call(this, options);
    this.suppressGenericErrorMessages();
    //this.RESOURCE_ENDPOINT =  _jive_base_url + "/api/core/v3/" + this.pluralizedResourceType;
    this.RESOURCE_ENDPOINT =  _jive_base_url + "/api/core/v3/people";
  };
    /**
     * Common ajax requests
     *
     * @param {string} path
     * @param {object} [data]
     * @param {jive.conc.Promise} [promise]
     */
    protect.request = function(path, data, promise) {
        var endpoint = this.RESOURCE_ENDPOINT;
        var url = (path == null ? this.RESOURCE_ENDPOINT : this.RESOURCE_ENDPOINT + '/' + path);
        data = data || {};
        promise = promise || new jive.conc.Promise();

        return protect.commonAjaxRequest(promise, 'GET', { data: data, url: url });
    };
  
  /**
   *
   * @param trendingMax Number of trending videos to return
   */
  this.getPlacesType = function(placeType) {
    //var path = ['trendingcontent', 'home'];
    var path = [];
    var containerType = 2020;
    var containerID = 1;

    // @see content_source.js
    //key + "(" +filters[key]+ ")"
    return this.request(path + '?filter=type' + '(' + placeType + ')');
  };

  this.getUserGroups = function() {
    var path = ['groups', 'member'];
    var containerType = 2020;
    var containerID = 1;

    return this.request(path.join('/'));
  
  };

  this.getUserSpaces = function() {
    var path = ['spaces', 'following'];
    var containerType = 2020;
    var containerID = 1;

    return this.request(path.join('/'));
  
  };

  this.getUserPlaces = function(placeType) {
   if(placeType == 'groups') {
    return this.getUserGroups();
   }
   if(placeType == 'spaces') {
    return this.getUserSpaces();
   }
  };

  protect.getPlacesSpaces = function() {
  
  }
});
