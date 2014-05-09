jive.namespace('RecommendationApp');

/**
 * @depends path=/resources/scripts/apps/recommendation_app/models/activity_model.js
 */ 
jive.RecommendationApp.ActivityModelSource = jive.RecommendationApp.ActivityModel.extend(function(protect) {
  //alert('activitymodelsource is called');
  /**
   *
   * @param trendingMax Number of trending videos to return
   */
  protect.getTrendingVideosHome = function(trendingMax) {
    var path = ['trendingcontent', 'home'];
    var containerType = 2020;
    var containerID = 1;
    return this.request(path.join('/') + '?max=' + trendingMax + '&containerType=' + containerType + '&containerID=' + containerID);
  }

  /**
   * Overrides ActivityModel#getTrendingContentHome
   */ 
  this.getTrendingContentHome = function(trendingMax) {
    //return this.getTrendingVideosHome(trendingMax);
    var path = ['trendingcontent', 'home'];
    var containerType = 2020;
    var containerID = 1;
    return this.request(path.join('/') + '?max=' + trendingMax + '&containerType=' + containerType + '&containerID=' + containerID);
  }

  /**
   * @param filters 
   */ 
  this.getRecentlyViewedVideos = function(filters) {
  
  }
});
