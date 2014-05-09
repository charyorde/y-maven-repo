/**
 * @depends path=/resources/scripts/apps/wall/models/meta_source.js
 * @depends path=/resources/scripts/jive/action.js
 */

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
if(!jive.Wall.LinkMetaSource){

jive.Wall.LinkMetaSource = jive.Wall.MetaSource.extend({
init: function() {
        this.META_ENDPOINT = jive.rest.url("/meta");
    },
    create: function(data, url, callback) {
        var options = {
            url: jive.action.url("link-meta", {url: encodeURIComponent(url)}),
            dataType: "html",
            success: function(metaContent) {
                console.log("SUCCESS");
                callback(metaContent);
            },
            error : function(metaContent) {
                console.log("ERROR");
            }
        };

        $j.ajax(options);
    },
    fetch: function(id, callback) {
        var options = {
            type: "GET",
            url: this.META_ENDPOINT + "/" + id,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                if(data.meta.length > 0){
                    var attachment = data.meta[0];
                    attachment.title = _jive_base_url + attachment.title;
                    attachment.body = _jive_base_url + attachment.body;

                    callback(data.meta);
                } else {
                    console.log('Error jive.Wall.LinkMetaSource fetch no meta data:' + data);
                }
            }
        };

        $j.ajax(options);
    }
});

}
