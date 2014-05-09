/*
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.feedback.button
 */
define('jive.Feedback.FeedbackButton', [
    'jive.AbstractView'
], function(AbstractView) {
return AbstractView.extend(function(protect) {
    var $ = jQuery;

    protect.init = function() {
        var view = this;

        this.content = $(jive.feedback.button());
        this.content.click(function(event) {
            event.preventDefault();
            view.emit('click');
        });
    };

    this.show = function() {
        // Check for conflict with the chat bar.
        var $nub = $('#jive-eim-nub')
          , $button = this.content;

        if ($nub.length < 1) {
            $button.appendTo('body');

        } else {
            this.zIndex = this.zIndex || parseInt($nub.css('z-index'), 10);

            this.commonParent = this.commonParent || $j('<div/>', { 'class': 'j-lr-corner-dock' }).css({
                height: $nub.outerHeight(),
                'z-index': this.zIndex
            });

            $nub.css({
                'position': 'static',
                'float': 'right'
            }).appendTo(this.commonParent);

            $button.css({
                'position': 'static',
                'float': 'right',
                'margin-right': '5px',
                'padding-top': '8px'
            }).appendTo(this.commonParent);

            this.commonParent.appendTo('body');
        }
    };
});
});
