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
if(!jive.Wall.LinkMetaView){

jive.Wall.LinkMetaView = jive.Wall.MetaView.extend({
 init: function(id, container, $parentContainer, options, type) {
        this._super(id, container, $parentContainer, options, type);
        var that = this;

        var $container = this._$container;
        $container.find("form").submit(function() {
            that.emit("completed", $j(this));
            return false;
        });
        this._$linkContainer = $parentContainer.find(".link-container");
    },
    add: function(meta) {
        var $link = meta.title;
        this._$linkContainer.append($link);
    }
});

}