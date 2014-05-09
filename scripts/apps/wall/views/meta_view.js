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
if(!jive.Wall.MetaView){

jive.Wall.MetaView = $Class.extend({
    init: function(id, container, $parentContainer, options, type) {
        this._type = type || jive.Wall.MetaView.TYPE_STATUS;
        this._$anchor = $parentContainer.find("." + id);
        this._$container = $parentContainer.find("." + container);

        var that = this;
        this._$anchor.click(function() {
            var event = that.isVisible() ? 'deactivated' : 'activated';
            that.emit(event);
            return false;
        });
    },
    show: function() {
        this._$container.show();
        this._$anchor.removeClass('j-deselected').addClass('j-selected').siblings('.j-button').removeClass('j-selected').addClass('j-deselected');
        if (this._$anchor.is(":first-child")) {
            this._$container.css({'-moz-border-radius-topleft': '0', '-webkit-border-top-left-radius': '0'})
        } else {
            this._$container.css({'-moz-border-radius-topleft': '4px', '-webkit-border-top-left-radius': '4px'})
        }
    },
    hide: function() {
        this._$container.hide();
        if (this._$anchor.hasClass('j-selected'))
            this._$anchor.add(this._$anchor.siblings('.j-button')).removeClass('j-deselected').removeClass('j-selected');
    },
    isVisible: function() {
        return this._$container.is(":visible");
    },
    error : function() {
      console.log("META_VIEW error");  
    }
});

jive.conc.observable(jive.Wall.MetaView.prototype);

jive.Wall.MetaView.TYPE_STATUS = 1;
jive.Wall.MetaView.TYPE_STATUS_COMMENT = 2;
jive.Wall.MetaView.TYPE_STATUS_REPOST = 3;
    
}
