jive.namespace('Wall');

/**
 * Make sure we only include this file once per page load.  If we do not have this block here there are 2 cases where
 * this script could be loaded multiple times:
 * 1) When resource combined is false behavior could be different from when it's on, ideally the behavior should be the same.
 * 2)  If an ajax request is made for an ftl with javascript includes the file will be reloaded (assuming it was already
 * loaded on page load)
 *
 * At a later date we can roll this work into namespace or a new function that is similar to namespace
 */
if(!jive.Wall.WallSource){

jive.Wall.WallSource = function(options) {
    var containerType = options.containerType,
            containerId = options.containerId,
    WALL_ENDPOINT = jive.rest.url("/wall"),
    PUBLISH_ENDPOINT = WALL_ENDPOINT + "/" + containerType + "/" + containerId,
    CREATE_DRAFT_ENDPOINT = PUBLISH_ENDPOINT + "/draft",
    defaultOptions = {
            type: "POST",
            contentType: "application/json; charset=utf-8",
            dataType:"json"
    };

    this.createDraft = function(callback) {
        var options = $j.extend({
            url: CREATE_DRAFT_ENDPOINT,
            data: "{wallentry: {}}",
            success: function(data) {
                callback(data.wallentry);
            },
            error: function(data) {
                var response = JSON.parse(data.responseText);
            }
        }, defaultOptions);
        $j.ajax(options);
    };
    this.publish = function(wallEntry, callback, errorCallback) {
        var object = {wallentry: wallEntry};
        var options = $j.extend({
            url: PUBLISH_ENDPOINT,
            data: JSON.stringify(object),
            success: function(data) {
                // remove body from from returned data
                if(data.wallentry.message){
                    data.wallentry.message = data.wallentry.message.replace(/<\/?body>/gi, "");
                }

                // normalize properties data
                data.wallentry = jive.Wall.VideoLinkMetaSource.normalizeData(data.wallentry);
                
                callback(data.wallentry);
            },
            error: function(data) {
                try{
                    var response = JSON.parse(data.responseText);
                    // server returned json
                    errorCallback(response.error.message);
                } catch(e){
                    // server likely returned html
                    errorCallback();
                }
            }
        }, defaultOptions);
        $j.ajax(options);
    };
};

}