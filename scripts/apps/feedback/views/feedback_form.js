/*
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.feedback.charCounter
 * @depends template=jive.feedback.form
 */
define('jive.Feedback.FeedbackForm', [
    'jive.AbstractView'
], function(AbstractView) {
return AbstractView.extend(function(protect, _super) {
    var $ = jQuery;

    protect.init = function(feedback) {
        var view = this;

        this.options = $.extend({
            sizeLimit: 4000
        }, feedback);
        this.content = $(jive.feedback.form(this.options));

        this.content.find('form').submit(function(event) {
            event.preventDefault();
            view.emit('submit', view.formData(this));
        });

        this.watchForChanges(this.content.find('textarea'), function(content) {
            view.content.find('.js-counter').replaceWith(
                jive.feedback.charCounter({
                    current: content.length,
                    max: view.options.sizeLimit
                })
            );
        });

        this.content.find('.js-cancel').click(function(event) {
            event.preventDefault();
            var $form = $(this).closest('form');
            view.emit('close', view.formData($form));
        });
    };

    this.show = function() {
        this.content.appendTo('body');
        this.content.find('[name="comments"]').focus();
        return this;
    };

    this.remove = function() {
        clearTimeout(this.pollTimeout);
        return _super.remove.call(this);
    };

    protect.formData = function(form) {
        var $form = this.content.find('form');
        var comments = $form.find('[name="comments"]').val().slice(0, this.options.sizeLimit);

        return {
            comments: comments
        };
    };

    protect.watchForChanges = function(textarea, callback) {
        var view = this, last = textarea.val();
        this.pollTimeout = setTimeout(function poll() {
            var content = textarea.val();
            if (content != last) {
                callback.call(textarea, content);
                last = content;
            }

            view.pollTimeout = setTimeout(poll, 250);
        }, 250);
    };
});
});
