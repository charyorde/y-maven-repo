/* jive-connects.js */

// Register <jive:ConnectsRequest> for data pipelining // TODO this causes errors if you actually try to use the tag in your content
opensocial.data.registerRequestHandler("jive:ConnectsRequest", function(descriptor) {
    var alias = descriptor.getAttribute('alias');
    var format = descriptor.getAttribute('format') || 'json';
    var href = descriptor.getAttribute('href') || '';
    var params = {
        alias : alias,
        format : format,
        href : href
    };
    console.log("Making data pipeline request for " + JSON.stringify(params));
    osapi.jive.connects.get(params).execute(function(response) {
        console.log("Storing data pipeline results for key " + descriptor.key + " = " + JSON.stringify(response.content));
        opensocial.data.DataContext.putDataSet(descriptor.key, response.content);
    });


});

/**
  * Namespace central to the Jive Connects Framework.
  *
  * @name jive.connects
  * @namespace
  */
jive.namespace('connects', {
    /** @lends jive.connects */
});

jive.connects._init = function() {

/**
 * <p>Request reconfiguration of the connection credentials for the specified connection alias.  The specified callback function
 * will be called after the reconfiguration dialog completes, with the following properties:</p>
 * <ul>
 * <li><em>state</em> - String describing success state ("success" or "cancel").</li>
 * <li><em>approved</em> - Array of aliases for which reconfiguration was approved by the user.</li>
 * <li><em>denied</em> - Array of aliases for which reconfiguration was denied by the user.</li>
 * </ul>
 *
 * @param alias the alias for the connection to be reconfigured
 * @param response the most recent response, which triggered the need for this reconfigure() call
 * @param callback the callback function to be called when the reconfiguration dialog is completed
 */
osapi.jive.connects.reconfigure = function(alias, response, callback) {
    if (response.error && response.error.oauth2_redirect_uri) {
        var args = {
            alias : alias,
            redirectURI : response.error.oauth2_redirect_uri,
            windowChars : 'width=900,height=600'
        }
        gadgets.rpc.call(null, "gather_oauth_credentials", function (result) {
            callback(result);
        }, args);
    }
    else {
        var args = { alias : alias };
        gadgets.rpc.call(null, "halt_app", function(result) {
            callback(result);
        }, args);
    }
}

}

gadgets.util.registerOnLoadHandler(jive.connects._init);