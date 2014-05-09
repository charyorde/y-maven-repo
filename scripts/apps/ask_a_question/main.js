jive.namespace('AskAQuestion');

/**
 * @depends template=jive.widget.askaquestion.*
 * @depends path=/resources/scripts/apps/ask_a_question/view.js
 * @depends path=/resources/scripts/apps/ask_a_question/source.js
 */
jive.AskAQuestion.Main = jive.oo.Class.extend(function(protect) {
    var _ = jive.AskAQuestion,
        $ = jQuery;

    protect.init = function(options) {
        var main = this;
        this.view =  new _.View(options);
        this.source =  new _.Source(options);

        this.view.addListener('search', function(data) {
            main.source.search(data).addCallback(function(resp) {
                main.view.success(resp);
            });
        });

        this.view.addListener('referrer', main.source.referrer);
    };
});

