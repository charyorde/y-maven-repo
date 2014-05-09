/**
 * Rest model for Recently viewed videos
 *
 * @extends jive.RestService
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
define(
  "jive.RecommendationApp.VideosRecentViewModel",
  ['jquery'],
  function($) {
    return jive.RestService.extend(
      function(protect) {
        protect.resourceType = "contents";

        this.init = function(options) {
          
          this.suppressGenericErrorMessages();
          this.RESOURCE_ENDPOINT = _jive_base_url + "/api/core/v3/contents";
        };

        this.query = function(filters, count) {
          var data = {};
          data.count = count;
          data.filter = [];
          if(filters) {
            for(var key in filters) {
              data.filter.push(key + "(" + filters[key]+ ")");
            }
          }
          var url = this.RESOURCE_ENDPOINT;
          return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {
            url: url,
            data: data
          });
        };
      }
    );
  }
);
