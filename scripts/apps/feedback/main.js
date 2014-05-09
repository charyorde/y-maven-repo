/*
 * @depends path=/resources/scripts/apps/feedback/models/feedback.js
 * @depends path=/resources/scripts/apps/feedback/models/feedback_source.js
 * @depends path=/resources/scripts/apps/feedback/models/feedback_endpoint_source.js
 * @depends path=/resources/scripts/apps/feedback/views/feedback_button.js
 * @depends path=/resources/scripts/apps/feedback/views/feedback_form.js
 * @depends path=/resources/scripts/apps/feedback/views/feedback_preview.js
 * @depends path=/resources/scripts/jquery/jquery.message.js
 * @depends template=jive.feedback.availabilityError scope=client
 */
define('jive.Feedback.Main', [
    'jive.Feedback.Feedback',
    'jive.Feedback.FeedbackSource',
    'jive.Feedback.FeedbackEndpointSource',
    'jive.Feedback.FeedbackButton',
    'jive.Feedback.FeedbackForm',
    'jive.Feedback.FeedbackPreview'
], function(Feedback, Source, EndpointSource, Button, Form, Preview) {
return jive.oo.Class.extend(function(protect) {
    var $ = jQuery;

    protect.init = function(feedbackParams) {
        var main = this;

        this.isAvailable = false;

        this.baseFeedbackParams = feedbackParams;
        this.feedbackSource = new Source();
        this.endpointSource = new EndpointSource();

        this.button = new Button();
        this.button.addListener('click', function() {
            main.showForm();
        });

        this.showButton();
    };

    protect.showButton = function() {
        this.hideElements();
        this.button.show();
    };

    protect.showForm = function() {
        var main = this;
        this.form = this.showComponent(Form, main.feedback);
        this.form.addListener('submit', function(feedback) {
            main.feedback = main.buildFeedback(feedback);
            main.showPreview(main.feedback);
        }).addListener('close', function(feedback) {
            main.feedback = main.buildFeedback(feedback);
        });

        this.verifyAvailability().addCallback(function(isAvailable) {
            main.isAvailable = isAvailable;
            if (!isAvailable) {
                main.showAvailabilityError();
            }
        });
    };

    protect.showPreview = function(feedback) {
        var preparedFeedback = this.prepareFeedback(feedback)
          , main = this;

        this.preview = this.showComponent(Preview, preparedFeedback);
        this.preview.addListener('submit', function() {
            main.preview.showSpinner();

            if (!main.isAvailable) {
                main.verifyAvailability().addCallback(function(isAvailable) {
                    if (isAvailable) {
                        main.submitFeedback(feedback);
                    } else {
                        main.showAvailabilityError();
                        main.failedToSubmitFeedback();
                    }
                });
            } else {
                main.submitFeedback(feedback);
            }
        });
    };

    protect.submitFeedback = function(feedback) {
        var main = this;

        main.feedbackSource.save(feedback).addCallback(function() {
            delete main.feedback;
            main.preview.success();
        }).addErrback(function() {
            main.failedToSubmitFeedback();
        });
    };

    protect.failedToSubmitFeedback = function() {
        var main = this;

        main.hideElements();
        jive.conc.nextTick(function() {
            main.showPreview(main.feedback);
        });
    };

    protect.verifyAvailability = function() {
        var promise = new jive.conc.Promise()
          , main = this;
        this.endpointSource.findAll().addCallback(function() {
            promise.emitSuccess(true);
        }).addErrback(function() {
            promise.emitSuccess(false);
        });
        return promise;
    };

    protect.showAvailabilityError = function() {
        var $message = $(jive.feedback.availabilityError());
        $message.message({ style: 'error' });
    };

    protect.showComponent = function(ViewKlass, options) {
        var component = new ViewKlass(options)
          , closed = false
          , main = this;

        this.hideElements();
        component.show();

        function onClose() {
            if (!closed) {
                main.showButton();
                closed = true;
            }
            component.removeListener('close', onClose);
        }

        component.addListener('close', onClose);

        // Close the form or preview when the escape key is pressed.
        $(document).one('keyup', function(event) {
            if (event.keyCode == 27) { onClose(); }
        });

        return component;
    };

    protect.hideElements = function() {
        this.button.detach();
        if (this.form) {
            this.form.remove();
        }
        if (this.preview) {
            this.preview.remove();
        }
    };

    protect.buildFeedback = function(feedback) {
        return new Feedback($.extend({}, this.baseFeedbackParams, feedback));
    };

    protect.prepareFeedback = function(feedback) {
        return $.extend({}, feedback, {
            comments: this.formatText(feedback.comments)
        });
    };

    protect.formatText = function(text) {
        // The escapeHTML method clobbers line breaks in IE.  So we must
        // split text into paragraphs before escaping.
        var paragraphs = text.split(/\n\s*\n/);

        return '<p>'+ paragraphs.map(function(paragraph) {
            return jive.util.escapeHTML(paragraph);
        }).join('</p><p></p><p>') +'</p>';
    };
});
});
