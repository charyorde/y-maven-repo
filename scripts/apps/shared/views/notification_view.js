/*extern jive $j $Class */

jive.namespace('shared');

/**
 * @depends path=/resources/scripts/jquery/jquery.oo.js
 */
jive.shared.NotificationView = $Class.extend({
    init: function(container, selectors, options) {
        this.container = container;
        this.selectors = $j.extend({info:'.jive-info-box',
            warn:'.jive-warn-box',
            error:'.jive-error-box'}, selectors || {});
        options = $j.extend({includeIcon:true}, options);
        this.includeIcon = options.includeIcon;
    },

    info: function(message) {
        this._message(this.selectors['info'], message, 'jive-icon-info');
    },

    warn: function(message) {
        this._message(this.selectors['warn'], message, 'jive-icon-warn');
    },

    error: function(message) {
        this._message(this.selectors['error'], message, 'jive-icon-redalert');
    },

    _message: function(selector, text, iconCSSClass) {
        var box = $j(this.container).find(selector);
        if(this.includeIcon){
            // remove html and replace any sequence white space with a single white space character, this can sometimes occur when text is
            // incorrectly formatted.
            box.html('<div><span class="jive-icon-med ' + iconCSSClass + '"></span>' + $j('<div/>').html(text).text().replace(/\s+/gm, ' ') + '</div>');
        } else {
            box.text(text);
        }
        box.slideDown().delay(3000).slideUp();
    },

    _notices: function() {
        var boxes = $j();
        for(var selectorKey in this.selectors){
            boxes.add(this.selectors[selectorKey]);
        }
        return boxes;
    }
});
