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
if(!jive.Wall.MetaSource){

//noinspection JSUnusedLocalSymbols
jive.Wall.MetaSource = $Class.extend({
    create: function(wallEntry, data, callback) {

    },
    remove: function(id) {
        var options = {
            type: "GET",
            url: this.META_ENDPOINT + "/remove/" + id,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(data) {
            },
            error: function(data, textStatus, errorThrown) {
                console.log('Error jive.Wall.MetaSource fetch' + id+', ' + errorThrown);
            }
        };

        $j.ajax(options);
    }
});
}