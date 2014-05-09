/**
 * Recommended for you module on Home -> Activity Stream views
 *
 * @depends template=jive.eae.recommendation.*
 * @depends path=/resources/scripts/apps/recommendation_app/components/paginator.js
 * @depends path=/resources/scripts/apps/recommendation_app/controllers/controller.js
 *
 * @param {object} model
 * @param {jQuery} $container
 */
jive.namespace('RecommendationApp').RecommendedPeopleController = function(model, $container) {
    var self         = jive.conc.observable({}),
        controller   = new jive.RecommendationApp.Controller($container),
        numItems     = 0,
        find         = controller.getBody;

    /**
     * Shows the "thank you for your feedback" notification.
     */
    function showNotification($reco) {
        var $element = $j(jive.eae.recommendation.notInterestedNotification({}));
        $reco.fadeOut('fast', function() {
            $reco.html($element);
            $reco.fadeIn(400, function() {
                setTimeout(function() {
                    $reco.fadeOut(400, function() {
                        $reco.remove();
                        if (!numItems) {
                            $container.fadeOut('fast');
                        }
                    });
                }, 2000);
            });
        });
    }

    /**
     * Notifies the model that dislike or disinterest has been expressed. Removed the recommendation from the UI and shows
     * a notification.
     *
     * @param {function} saveFeedback
     * @param {object} payload
     */
    function disinterested(saveFeedback, payload) {
        saveFeedback(payload.id, payload.objectType);
        var $reco = find('[data-recommendation-id=' + payload.id + ']');
        numItems--;
        showNotification($reco);
        self.emit('invalidateCache');
    }

    /**
     * Loads new recommendations from the model
     *
     * @param {object[]} data an array of recommendation objects
     */
    function loadRecommendations(data) {
        controller.getBody().html(jive.eae.recommendation.recommendedPeople({ recommendations: data}));
        numItems = find('li.j-js-recommendation').length
    }

    /**
     * Shows the insights popover (when the "Why?" button is clicked)
     *
     * @param {object} payload
     */
    function insightsPopover(payload) {
        $popover = payload.$target.attr('data-event', 'closeWhy')
            .closest('.j-js-recommendation').find('.j-insights').show().popover({
            context        : payload.$target,
            darkPopover    : true,
            putBack        : true,
            destroyOnClose : false,
            onClose        : function() {
                $popover = undefined;
                closeWhy(payload);
            }
        });
    }

    /**
     * @param {object} payload
     */
    function closeWhy(payload) {
        payload.$target.attr('data-event', 'why');
    }

    /**
     * Returns true if the view is populated with recommendations.
     *
     * @returns {boolean}
     */
    self.isPopulated = function() {
        return numItems > 0;
    };

    /**
     * Notifies this object of certain events. First argument is the event name, additional arguments may be passed.
     *
     * @param {string} event
     * @returns {object} self
     */
    self.notify = function(event, data) {
        if (event === 'newRecommendations') {
            loadRecommendations(data);
        }
        return self;
    };


    // construct
    controller.addListener('dislike', disinterested.partial(model.expressDislike.bind(model)))
        .addListener('why', insightsPopover)
        .addListener('closeWhy', closeWhy);
    
    return self;
};