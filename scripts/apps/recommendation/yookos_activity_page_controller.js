/**
 * Page controller for Video > Activity trending videos recommendation
 *
 * @depends template=jive.eae.recommendation.activityTrendyVideos
 *
 * @depends path=/resources/scripts/apps/shared/views/loader_view.js
 * @depends path=/resources/scripts/apps/recommendation/activity_model_source.js
 * @depends path=/resources/scripts/apps/recommendation_app/controllers/general_recommendation_controller.js
 */
jive.namespace('RecommendationApp').yookosActivityPageController = {

  //initialize: function(activityContainer, user, streamType, filterType, canCreateMbImage, canCreateMbVideo) {
  initialize: function() {
    showSpinner({"inline" : true, "showLabel" : false, "context" : $j('#reco-loader')});
    model = new jive.RecommendationApp.ActivityModelSource();
    $nodes = $j('#j-discovery-trendingvideos .j-reco-section');
    controller = new jive.RecommendationApp.GeneralRecommendationController(model, $j('#trendy-videos-module'), jive.eae.recommendation.activityTrendyVideos);
    getTrendingVideos = model.getTrendingContentHome.bind(model, 3);

    /**
     * Query the model for trending recommendations
     */
    function poll() {
      getTrendingVideos().always(
          // the spinner is displayed by default
          // if controller.isPopulated, hide spinner
          function() {
            if(controller.isPopulated()) {
              hideSpinner();
            }
          }
        ).addCallback(displayRecommendations);
    }

    /**
     * Update the controller with recommendation data. When finished, set a timeout to repoll
     *
     * @param {object} data. An array of recommendation objects
     */ 
    function displayRecommendations(data) {
      controller.notify('newRecommendations', data.recommendations);
      //setTimeout(poll, 30000);

      // fade in populated controller
      $nodes.fadeIn(500, function() {
        if(controller.isPopulated()) {
          controller.notify('uiUpdate', data.recommendations);
        }
      });

      setTimeout(poll, 30000);

      /*var $nodeToShow = $nodes.not(':visible').filter(function(i) {
        return controller[i] && controller[i].isPopulated();
      }),
      queue = $j.map($nodeToShow, function(node, i) {
        return function() {
          $j(node).fadeIn(500, function() {
            controller[i].notify('uiUpdate', data);
            if(queue.length) {
              queue.shift()();
            }
          });
        };
      });*/
    }

    poll();

    function showSpinner() {
      var args = arguments;
      //console.log(args);
      setTimeout(function() {
        this.spinner = jive.loader.LoaderView(args);
        this.spinner.appendTo(args.context);
      }, 100);
    }

    function hideSpinner() {
      var spinner = this.spinner;
      //console.log(spinner);

      if(spinner) {
        spinner.getContent().fadeOut(200, function() {
          spinner.getContent().remove();
          spinner.destroy();
        });
      }
      delete this.spinner;
    }
   }

};
