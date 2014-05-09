/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('content.polls');

jive.content.polls.MetaView = $Class.extend({
    init: function(id, container, $parentContainer) {
        this._$anchor = $parentContainer.find("#" + id);
        this._$container = $parentContainer.find("#" + container);

        var that = this;
        this._$anchor.click(function() {
            var event = that.isVisible() ? 'deactivated' : 'activated';
            that.emit(event);
            return false;
        });
    },
    show: function() {
        this._$container.show();
        this._$anchor.removeClass('j-deselected').addClass('j-selected').siblings().removeClass('j-selected').addClass('j-deselected');
        if (this._$anchor.is(":first-child")) {
            this._$container.css({'-moz-border-radius-topleft': '0', '-webkit-border-top-left-radius': '0'})
        } else {
            this._$container.css({'-moz-border-radius-topleft': '4px', '-webkit-border-top-left-radius': '4px'})
        }
    },
    hide: function() {
        this._$container.hide();
        if (this._$anchor.hasClass('j-selected'))
            this._$anchor.add(this._$anchor.siblings()).removeClass('j-deselected').removeClass('j-selected');
    },
    isVisible: function() {
        return this._$container.is(":visible");
    }
});

jive.conc.observable(jive.content.polls.MetaView.prototype);
