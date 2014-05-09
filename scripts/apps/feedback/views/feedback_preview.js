/*
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/jquery/jquery.lightbox_me.js
 * @depends template=jive.feedback.preview
 * @depends template=jive.feedback.previewLoading
 * @depends template=jive.feedback.success
 */
define('jive.Feedback.FeedbackPreview', [
    'jive.AbstractView'
], function(AbstractView) {
return AbstractView.extend(function(protect, _super) {
    var $ = jQuery;

    protect.init = function(feedback) {
        var view = this;

        this.content = $(jive.feedback.preview(feedback));

        this.content.find('form').submit(function(event) {
            event.preventDefault();
            view.emit('submit', feedback);
        });

        this.content.find('.close').click(function(event) {
            event.preventDefault();
            view.content.trigger('close');
        });

        this.content.find('.js-toggle').click(function(event) {
            event.preventDefault();

            var $toggle = $(this)
              , $expandable = $toggle.closest('.js-expandable-parent').find('.js-expandable')
              , isOpen = $expandable.is(':not(:visible)');

            $expandable.slideToggle('normal', function() {
                $toggle.toggleClass('j-open', isOpen);
                $expandable.toggleClass('j-open', isOpen);
            });
        });
    };

    this.show = function() {
        var view = this;
        this.content.lightbox_me({
            destroyOnClose: true,
            onClose: function() {
                view.emit('close');
            }
        });
        return this;
    };

    this.remove = this.detach = function() {
        this.content.trigger('close');
        this.hideSpinner();
        _super.remove.call(this);
    };

    protect.createSpinner = function() {
        this.loader = this.loader || new jive.loader.LoaderView({
            showLabel: false,
            size: 'big'
        });
        var $content = this.content.find('.jive-modal-content');

        $content.children().remove();
        $content.html(jive.feedback.previewLoading());
        $content.find('.js-loading').append(
            this.loader.getContent().find('.j-running-loader')
        );
    };

    protect.destroySpinner = function() {
        if (this.loader) {
            this.loader.destroy();
            delete this.loader;
        }
    };

    this.success = function() {
        var $content = this.content.find('.jive-modal-content');

        $content.children().remove();
        $content.html(jive.feedback.success());
    };
});
});
