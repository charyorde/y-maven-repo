/**
 * jive.MoreLikeThisApp.MoreLikeThisSource
 *
 * Model class that encapsulates the server interface for retrieving and
 * updating 'more like this' results for a specified object.
 *
 * To use create an instance of MoreLikeThis and call the getMoreLike method
 * with the object type and id of the piece of content you need similar results
 * for
 */

/*extern jive $j */

jive.namespace("MoreLikeThisApp");

jive.MoreLikeThisApp.MoreLikeThisSource = function() {
    var MLT_ENDPOINT = jive.rest.url("/morelikethis");

    /**
     * Most of the methods in this class can take either a success callback or
     * an object representing a success callback and an error callback.  This
     * function handles either case: it returns a normalized form, an object.
     */
    function normalizeOptions(options) {
        if (typeof options == 'function') {
            options = { success: options };
        }
        return options;
    }

    /**
     * getMoreLike(objectType, objectID)
     * - objectType (int): the content type of the object to get similar results for
     * - objectID (int): the id of the content object to get similar results for
     * - numResults (int): the number of results to retrieve
     *
     * Retrieves similar results for the specified content object from the server and
     * passes the results to the callback. 
     */
    function getMoreLike(objectType, objectID, numResults, options) {
        options = normalizeOptions(options);
        
        var url = MLT_ENDPOINT + "/" + objectType + "/" + objectID + "/type/" + objectType + "?numResults=" + numResults;

        $j.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            success: function(data) {
                if (typeof options.success == 'function') {
                    options.success.call(data, data.morelikethisresultobject);
                }
            },
            error: function(obj) {
                if (typeof options.error == 'function') {
                    options.error.call(obj);
                }
            }
        });

        return this;
    }

    this.getMoreLike = getMoreLike;
};
