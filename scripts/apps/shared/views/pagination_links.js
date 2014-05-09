/**
 * @class
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/jquery/jquery.scrollTo.js
 * @depends template=jive.shared.soy.paginationLinks
 */
jive.PaginationLinks = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    protect.init = function(options) {
        var view = this
          , defaultSelector = '.j-pagination';

        options = options || {};

        $(document).ready(function() {
            if (options.element) {
                view.content = $(options.element || defaultSelector);
            } else {
                view.content = $(jive.shared.soy.paginationLinks(options.params));
            }

            view.content.find('a[data-start]').click(function(event) {
                var start = parseInt($(this).data('start'), 10)
                  , scrollTarget = options.scrollTo ? $(options.scrollTo) : $();
                view.emit('start', start);

                if (scrollTarget.length > 0 && !view.inView(scrollTarget)) {
                    $.scrollTo(scrollTarget, 200);
                }

                event.preventDefault();
            });
        });
    };

    protect.inView = function(elem) {
        var docViewTop = $(window).scrollTop()
          , docViewBottom = docViewTop + $(window).height()

          , elemTop = $(elem).offset().top
          , elemBottom = elemTop + $(elem).height();

        return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom));
    };
});
