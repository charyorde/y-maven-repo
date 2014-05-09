jive.namespace('AskAQuestion');

/**
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/apps/content/common/validator.js
 * @depends path=/resources/scripts/jquery/jquery.placeheld.js
 */
jive.AskAQuestion.View = jive.AbstractView.extend(function(protect) {
    var $ = jQuery
        , _ = jive.AskAQuestion;

    protect.init = function(options) {
        var view = this;
        this.frame = $('#jive-widgetframe_' + options.widgetFrameID);
        this.searchElem = this.frame.find('.ask-a-question-search');
        this.container = this.frame.find('.ask-a-question-container');

        $(function() {
            var form = view.container.find('form');

            new jive.Validator({form: form});

            var searchFunc = function() {
                var val = view.searchElem.val();
                if (val) {
                    view.emit('search', val);
                }
            };
            var $input = view.container.find('input');
            $input.placeHeld();
            $input.keyup(function() {
                clearTimeout($.data(this, 'timer'));
                var wait = setTimeout(searchFunc, 500);
                $(this).data('timer', wait);
            });

            form.submit(function(e) {

                if (e.isDefaultPrevented()) {
                    return;
                }

                var url = $(this).prop('action') + '&subject=' + view.searchElem.val();

                if (typeof loginApp === "undefined") {
                    window.location.href = url;
                } else {
                    view.emit('referrer', url);

                    $('#navLogin').click();
                }

                e.preventDefault();
            });
        });
    };

    this.success = function(data) {
        var resultMarkup = jive.widget.askaquestion.results({
           bean: data
        });

        var results = this.frame.find('.ask-a-question-results');
        if (results.length) {
            results.replaceWith(resultMarkup);
        } else {
            $(this.container).find('button[type=submit]').before(resultMarkup);
        }
    };
});

