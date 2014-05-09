/**
 * jive.MoreLikeThisApp.MoreLikeThisView
 *
 * Handles rendering of results from a 'more like this' call into the page
 * by creating <li> elements in the <ul> container specified by the given
 * containerID
 *
 * To use create an instance of MoreLikeThisView and pass in the id of the
 * <ul> element in the page in which elements will be rendered.  Also, an
 * appropriate message for displaying when there are no results found should
 * be provided in the options as "noContentMessage"
 */

/*extern jive $j */

jive.namespace("MoreLikeThisApp");

jive.MoreLikeThisApp.MoreLikeThisView = function(containerID, options) {
    var noContentMessage    = options.noContentMessage,
        errorMessage        = options.errorMessage,
        containerSelector   = "#" + containerID;

    /**
     * setContent(data)
     * - data (JSON list): list of results describing related objects to be rendered into
     *     the page.  Each entry should have an objectURL, objectClass and subject text
     *
     * Renders the given results into the page inside the <ul> element this object is
     * configured to use.  If there are no results, the configured no content message
     * will be rendered into the container.
     */
    function setContent(data) {
        var elements = '';
        if (data.length > 0) {
            elements += "<ul class=\"j-icon-list\">";
            data.forEach(function(result) {
                elements += "<li><a href=\"" + _jive_base_url + result.objectURL + "\">" +
                    "<span class=\"" + result.objectClass + "\"></span>" + result.subject + "</a></li>";
            });
            elements +="</ul>";
        }
        else {
            elements = "<p>" + noContentMessage + "</p>";
        }

        $j(containerSelector).empty().append(elements);
    }

    function displayError() {
        $j(containerSelector).empty().append("<p>" + errorMessage + "</p>");
    }

    this.setContent     = setContent;
    this.displayError   = displayError;
};
