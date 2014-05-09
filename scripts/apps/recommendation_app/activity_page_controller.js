jive.namespace('RecommendationApp');

/**
 * This object is the page controller for the recommendation pane on the Home -> Activity Stream views. When initialize is called
 * this component begins polling the model and passes the response to the appropriate controllers. It also fades in each
 * recommendation module in order and at the appropriate time.
 *
 * @depends template=jive.eae.recommendation.activityTrendyContent
 * @depends template=jive.eae.recommendation.leaderboard
 *
 * @depends path=/resources/scripts/apps/recommendation_app/models/recommendation_model.js
 * @depends path=/resources/scripts/apps/recommendation_app/controllers/recommended_for_you_controller.js
 * @depends path=/resources/scripts/apps/recommendation_app/controllers/recommended_people_controller.js
 * @depends path=/resources/scripts/apps/recommendation_app/controllers/general_recommendation_controller.js
 */
jive.RecommendationApp.activityPageController = jive.oo.Class.extend(function(protect) {
    this.init = function (options) {
        var main = this,
            app                             = jive.RecommendationApp,
            soy                             = jive.eae.recommendation,
            model                           = new app.RecommendationModel(),
            $nodes                          = $j('#j-discovery .j-reco-section'),
            userRecommendationsAreEnabled   = $j('#recommended-for-you-module').length,
            controllers                     = [],
            moduleNames                     = ['trendingContent', 'trendingUsers'],
            activityMaxes                   = {
                trendingMax: parseInt($j('#trendy').attr('data-max')),
                usersMax:    parseInt($j('#trendy-users').attr('data-max'))
            },
            getActivity; // will be a function that when called queries the model and returns a promise

        main.pollingInterval =
            (main.pollingInterval == undefined ? options.pollingInterval :
                main.pollingInterval);
        main.firstDataFetched =
            main.firstDataFetched || null;

        if ($nodes.length) {
            // we might have already changed views by the time this controller is initialized

            /**
             * Polls for new recommendations.
             */
            function poll() {
                // check to make sure we even have our container for displaying recos (might have switched views)
                if ($j('#j-discovery').length) {
                    if (main.pollingInterval == 0 && main.firstDataFetched != null) {
                        displayRecommendations(main.firstDataFetched)
                    }
                    else {
                        getActivity().addCallback(displayRecommendations);
                    }
                }
            }

            /**
             * Passes recommendations received from the ajax call to the proper controller. The UI widgets must be faded in
             * in a particular order if they have recommendations. When finished, set a timeout to poll again.
             *
             * @param {object} data an array of recommendation objects
             */
            function displayRecommendations(data) {
                if (main.pollingInterval == 0 && main.firstDataFetched == null) {
                    main.firstDataFetched = data;
                }
                // load each controller with data
                $j.each(controllers, function(i) {
                    this.notify('newRecommendations', data[moduleNames[i]]);
                });

                // fade in any populated controllers that are not visible if they are populated.
                // Recommended for you should be shown regardless of whether it's populated or not.
                var $nodesToShow = $nodes.not(':visible').filter(function(i) {
                        return controllers[i] && controllers[i].isPopulated();
                    }),
                    queue = $j.map($nodesToShow, function(node, i) {
                        return function() {
                            $j(node).fadeIn(500, function() {
                                controllers[i].notify('uiUpdate', data[moduleNames[i]]);
                                if (queue.length) {
                                    queue.shift()();
                                }
                            });
                        };
                    });

                // after any modules have been faded in, setup for the next poll
                if (main.pollingInterval != 0) {
                    queue.push(function() {
                        setTimeout(poll, main.pollingInterval);
                    });
                }
                if (queue.length) {
                    queue.shift()();
                }
            }

            // adding 1 here to determine if the load more button should be displayed. results will be truncated in the controller.
            ++activityMaxes.trendingMax;

            // create each controller. recommended for you may or may not be present
            if (userRecommendationsAreEnabled) {
                moduleNames.unshift('recommendedPeople');
                moduleNames.unshift('recommendations');
                activityMaxes.recommendedPeopleMax = parseInt($j('#user-reco-people').attr('data-max'));
                activityMaxes.recommendationMax = parseInt($j('#user-reco-content').attr('data-max'));
                var recoForYouController = new app.RecommendedForYouController(model, $nodes.filter('#recommended-for-you-module'));
                recoForYouController.addListener('invalidateCache', function() {
                    main.firstDataFetched = null;
                });
                controllers.push(recoForYouController);
                var recoPeopleController = new app.RecommendedPeopleController(model, $nodes.filter('#recommended-people-module'));
                recoPeopleController.addListener('invalidateCache', function() {
                    main.firstDataFetched = null;
                });
                controllers.push(recoPeopleController);

            }
            controllers.push(new app.GeneralRecommendationController(model, $nodes.filter('#trendy-content-module'), soy.activityTrendyContent));
            controllers.push(new app.GeneralRecommendationController(model, $nodes.filter('#leaderboard-module'), soy.leaderboard));

            // set up polling
            getActivity = model.getActivityHome.bind(model, activityMaxes);
            poll();
        }
    }
});
