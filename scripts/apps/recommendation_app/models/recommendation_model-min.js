jive.namespace("RecommendationApp").RecommendationModel=function(){var a=new jive.RecommendationApp.ActivityModel(),b=new jive.RecommendationFeedback.RecommendationFeedbackSource();return{expressDisinterest:function(d,c){return b.expressDisinterest(c,d)},expressDislike:function(d,c){return b.expressDislike(c,d)},getActivity:function(c){return a.getActivity(c)},getActivityHome:function(c){return a.getActivityHome(c)},getContentRecommendations:function(d,c){return a.getContentRecommendations(d,c)},getPeopleRecommendations:function(d,c){return a.getPeopleRecommendations(d,c)},getPlaceRecommendations:function(d,c){return a.getPlaceRecommendations(d,c)},getProfileTrendingContent:function(d,c){return a.getProfileTrendingContent(d,c)},getProfileTrendingContentHome:function(d,c){return a.getProfileTrendingContentHome(d,c)},getTrendingContent:function(c){return a.getTrendingContent(c)},getTrendingContentHome:function(c){return a.getTrendingContentHome(c)},getTrendingUsers:function(c){return a.getTrendingUsers(c)}}};