jive.namespace('BookmarkApp');

/**
 * Handles interactions with the bookmark and unbookmark actions in a list view
 *
 * @class
 * @param {jQuery|DOMElement|String} element reference to element that contains bookmark links
 *
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 */
jive.BookmarkApp.ListView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery
      , _ = jive.BookmarkApp;

    protect.init = function() {
        var view = this;

        $(document).delegate('.bookmark-content', 'click', function(e) {
            var objecttype = $(this).data("objecttype");
            var objectid = $(this).data("objectid");
            var bookmark = {markedObjectType: objecttype, markedObjectId: objectid };

            view.showSpinner($(this));

            view.emit('bookmark', bookmark);
            e.preventDefault();
        });

        $(document).delegate('.unbookmark-content', 'click', function(e) {
            // the existing bookmark id to be removed
            var bookmarkid = $(this).data("bookmarkid");
            var objecttype = $(this).data("objecttype");
            var objectid = $(this).data("objectid");
            var bookmark = {id: bookmarkid, markedObjectType: objecttype, markedObjectId: objectid };
            var bookmarkedLink = $('.bookmarked-content').filter(function() {
                return $(this).data('objecttype') == objecttype &&
                    $(this).data('objectid') == objectid;
            });

            view.showSpinner(bookmarkedLink);
            view.emit('unbookmark', bookmark);
            $(this).trigger('close');  // Close any containing popover.

            e.preventDefault();
        });
        
        $(document).delegate('.edit-bookmark', 'click', function(e) {
            var objecttype = $(this).data("objecttype");
            var objectid = $(this).data("objectid");
            var bookmark = {markedObjectType: objecttype, markedObjectId: objectid };

            view.emit('edit', bookmark);
            $(this).trigger('close');  // Close any containing popover.

            e.preventDefault();
        });

        $(document).delegate('.bookmarked-content', 'click', function(e) {
            var $actions = $(this).closest("ul").find('.js-bookmark-actions');
            var $that = $(this).toggleClass('active');

            $actions.popover(
                {
                    context: $(this),
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

    this.updateBookmarkLinks = function(bookmark) {
        return this.updateLinks(bookmark, false);
    };

    this.updateUnbookmarkLinks = function(bookmark) {
        return this.updateLinks(bookmark, true);
    };

    protect.updateLinks = function(bookmark, removing) {
        var toUpdate = removing ? 'a.bookmarked-content' : 'a.bookmark-content'
          , view = this;

        $(toUpdate).filter(function() {
            return $(this).data('objecttype') == bookmark.markedObjectType &&
                $(this).data('objectid') == bookmark.markedObjectId;
        }).each(function() {
            var $parent = $(this).closest('.js-bookmark')
              , bookmarkLink   = $parent.find('.bookmark-content')
              , bookmarkedLink = $parent.find('.bookmarked-content')
              , unbookmarkLink = $parent.find('.unbookmark-content');

            if (removing) {
                bookmarkedLink.hide();
                bookmarkLink.show();
            } else {
                bookmarkLink.hide();
                bookmarkedLink.show();
            }

            // add newly-created bookmark id attribute to link
            unbookmarkLink.data('bookmarkid', removing ? '-1' : bookmark.id);

            view.hideSpinner($(this));
        });
    };

    protect.createSpinner = function(link) {
        link.addClass('font-color-meta-light');
    };

    protect.destroySpinner = function(link) {
        link.removeClass('font-color-meta-light');
    };
});
