/**
 * Controller for Trending Content and Leaderboard recommendations modules.
 *
 * @depends path=/resources/scripts/apps/recommendation_app/controllers/controller.js
 *
 * @param {object} model
 * @param {jQuery} $container
 * @param {object} view
 */

jive.namespace('RecommendationApp').GeneralRecommendationController = function(model, $container, view) {
    var self        = {},
        controller  = new jive.RecommendationApp.Controller($container),
        previous    = null,
        find        = controller.getBody,
        canLoadMore = find().attr('data-load-more') === 'true',
        max         = parseInt(find().attr('data-max'));


    /**
     * Loads more trending content.  This can only be done once and only if there is more content available to be loaded.
     */
    function loadMore() {
        model.getTrendingContentHome(max * 2).addCallback(function(data) {
            canLoadMore = false;
            find('[data-event=loadMore]').remove();
            controller.removeListener('loadMore', loadMore);

            render(data.recommendations);
        });
    }

    /**
     * Loads new recommendations from the model
     *
     * @param {array} data an array of recommendation objects
     */
    function loadRecommendations(data) {
        if (canLoadMore && data.length <= max) {
            canLoadMore = false;
        } else if (data.length > max) {
            data = data.slice(0, max);
        }

        render(data);
    }

    /**
     * Updates the UI with new recommendations if they are fresh.
     * 
     * @param {array} data an array of recommendation objects
     */
    function render(data) {
        if (controller.shouldUpdate(data, previous, true)) {
            data['currentUserPartner'] =  window._jive_current_user.partner;
            previous = data;

            var params = { recommendations: data };
            canLoadMore && (params.canLoadMore = data.length === max);

            find().html(view(params));
        }
    }


    // public
    /**
     * Returns true if the view is populated with recommendations.
     *
     * @returns {boolean}
     */
    self.isPopulated = function() {
        return (previous || []).length > 0;
    };

    /**
     * Notifies this object of certain events. First argument is the event name, additional arguments may be passed.
     *
     * @param {string} event
     */
    self.notify = function(event) {
        if (event === 'newRecommendations') {
            loadRecommendations(arguments[1]);
        }
    };


    // construct
    controller.addListener('loadMore', loadMore);

    
    return self;
};
