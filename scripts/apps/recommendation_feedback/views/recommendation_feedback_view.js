jive.namespace('RecommendationFeedback');

jive.RecommendationFeedback.RecommendationFeedbackView = jive.oo.Class.extend(function(protect) {

    jive.conc.observable(this);

    this.init = function(options) {
        var view = this;

        this.options = options;
        this.recSelector = options.recSelector;

        $j(this.recSelector).click(function() {
            var objectType = $j(this).attr('id').split('-')[0];
            var objectID = $j(this).attr('id').split('-')[1];
            var link_location = $j(this).attr('href');

            view.emitP('recclicked', objectType, objectID).addCallback(function() {
                window.location = link_location;
            });

            return false;
        });
    };

});