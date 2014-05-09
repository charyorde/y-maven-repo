jive.namespace('AskAQuestion');

/**
 * Handles interactions with the bookmark and unbookmark actions in a list view
 *
 * @class
 * @param {jQuery|DOMElement|String} element reference to element that contains bookmark links
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.AskAQuestion.Source = jive.RestService.extend(function(protect, _super) {
    var $ = jQuery
        , _ = jive.AskAQuestion;

    protect.resourceType = "askaquestion";
    protect.pluralizedResourceType = protect.resourceType;

    this.init = function init(options) {
        _super.init.call(this, options);
        this.options = options;
    };

    this.search = function(val) {
        return this.get('', {
            q: val,
            containerType: this.options.containerType,
            containerID: this.options.containerID
        });
    };

    this.referrer = function(url) {
        return this.save({
            url: url
        });
    };
});
