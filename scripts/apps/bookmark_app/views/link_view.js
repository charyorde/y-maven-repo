jive.namespace('BookmarkApp');

/**
 * Handles interactions with the "bookmark this", "unbookmark this" and "edit
 * bookmark" links.
 *
 * @class
 * @param {jQuery|DOMElement|String} element reference to element that contains bookmark links
 *
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/apps/browse/activity/info/main.js
 * @depends template=jive.BookmarkApp.soy.bookmarkLink
 */
jive.BookmarkApp.LinkView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery
      , _ = jive.BookmarkApp;

    jive.conc.observable(this);

    protect.init = function(element) {
        this.content = $(element);
        this.bindClickEvents();
    };

    protect.bindClickEvents = function() {
        var view = this;

        this.content.find('.bookmark-content').click(function(e) {
            view.showSpinner($(this));
            view.emit('bookmark');  
            e.preventDefault();
        });

        this.content.find('.unbookmark-content').click(function(e) {
            view.showSpinner(view.content.find('.bookmarked-content'));
            view.emit('unbookmark');
            $(this).trigger('close');  // Close any containing popover.
            e.preventDefault();
        });

        this.content.find('.edit-bookmark').click(function(e) {
            view.emit('edit');
            $(this).trigger('close');  // Close any containing popover.
            e.preventDefault();
        });
        this.content.find('.bookmarked-content').click(function(e) {
            var $actions = view.content.find('.js-bookmark-actions');
            var $that = $(this).toggleClass('active');

            $actions.popover(
                {
                    context: $(this).find('.jive-icon-arrow-select'),
                    darkPopover: true,
                    destroyOnClose: false,
                    putBack: true,
                    onClose: function() {
                        $that.removeClass('active');
                    }
                });
            e.preventDefault();
        });
    };


    this.updateLink = function(params) {
        this.content.html(_.soy.bookmarkLink(params));
        this.bindClickEvents();
    };

    protect.getContent = function() {
        return this.content;
    };

    protect.createSpinner = function(link) {
        link.addClass('font-color-meta-light');
    };

    protect.destroySpinner = function(link) {
        link.removeClass('font-color-meta-light');
    };
});
