/**
 * jive.MoreLikeThisApp.Main
 *
 * JavaScript code to handle more like this results
 *
 * This is the main entry point of the MoreLikeThisApp.  This class acts as a
 * controller.  It instantiates a model layer in the form of
 * jive.MoreLikeThisApp.MoreLikeThisSource and a view layer as
 * jive.MoreLikeThisApp.MoreLikeThisView.
 *
 * This class has no public methods.
 */

/*extern jive $j jiveToggleTab */

jive.namespace("MoreLikeThisApp");

jive.MoreLikeThisApp.Main = function(options) {
    var objectType  = options.objectType,
        objectID    = options.objectID,
        containerID = options.containerID,
        numResults  = options.numResults || 5,
        moreLikeThisView,
        moreLikeThisSource;

    function renderResults() {
        moreLikeThisSource.getMoreLike(objectType, objectID, numResults, {
            success: function(data) {
                moreLikeThisView.setContent(data);
            },
            error: function () {
                moreLikeThisView.displayError();
            }
        });
    }

    /* *** Initialization *** */
    moreLikeThisView = new jive.MoreLikeThisApp.MoreLikeThisView(containerID,
        { noContentMessage: options.noContentMessage, errorMessage: options.errorMessage });

    moreLikeThisSource = new jive.MoreLikeThisApp.MoreLikeThisSource();

    $j(document).ready(function() {
        renderResults();
    });
};
