/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Announcements');  // Creates the jive.Activity namespace if it does not already exist.

/**
 * Handles UI for a list of announcements.
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.browse.activityinfo.*
 * @depends template=jive.announcements.manageRow
 * @depends template=jive.announcements.noResults
 * @depends template=jive.announcements.confirmDelete
 * @depends template=jive.announcements.confirmExpire
 */
jive.Announcements.ListView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    protect.init = function(options) {
        var view = this;

        this.$element = $(options.element);
        this.$announcementlist = this.$element.find('.jive-modal-announcement-list');
        this.$tbody = this.$announcementlist.find('table tbody');

        this.$announcementlist.endlessScroll({
            callback: function(i) {
                view.emit('page', i);
            },
            insertAfter: $()
        });

        //bind add links
        this.$element.find('.jive-modal-announcements-listing .add a')
        .add('#jive-new-announcement a, #jive-another-announcement a')
        .bind('click.announcements', function(e) {
            view.emit('create');
            e.preventDefault();
        });

        // Defining the content property determines what elements are
        // hidden or shown when the hide() and show() methods are
        // called.
        this.content = $()
            .add(this.$element.find('.jive-modal-title-manage-announcements'))
            .add(this.$element.find('.jive-modal-announcements-listing'))
            .add(this.$element.find('.add'));
    };

    // Appends content to the list.
    this.update = function(promise) {
        this.populate(promise);
    };

    // Re-renders the list from scratch.
    this.reload = function(promise) {
        var view = this;

        this.$tbody.children().remove();
        this.populate(promise);

        this.$announcementlist.endlessScroll({
            callback: function(i) {
                view.emit('page', i);
            },
            insertAfter: $()  // prevents empty divs from piling up in the DOM
        });
    };

    /**
     * Re-renders the given announcement to indicate that it is expired.
     */
    this.expire = function(announcement) {
        this.content.find('tr').filter(function() {
            return $(this).data('object-id') == announcement.id;
        }).replaceWith(
            jive.announcements.manageRow(announcement)
        );

        this.rebindEvents();
    };

    /**
     * Removes an item from the list.
     */
    this.removeChild = function(announcement) {
        var child = this.content.find('tr').filter(function() {
            return $(this).data('object-id') == announcement.id;
        });
        child.fadeOut(function() {
            child.remove();
        });
    };

    protect.populate = function(promise) {
        var $tbody = this.$tbody
          , view = this;

        this.showSpinner({
            context: $tbody,
            showLabel: false
        });

        promise.addCallback(function(announcements) {
            // Remove spinner markup.
            $tbody.children(':not(tr)').remove();

            if ((!announcements || announcements.length < 1) && $tbody.children().length < 1) {
                $tbody.html(view.noResults());
            }

            // JIVE-4794: IE < 9 was barfing when appending one row at a time to the tbody
            var rows = [];
            announcements.forEach(function(announcement) {
                rows.push(jive.announcements.manageRow(announcement));
            });
            $tbody.append(rows.join(''));

            view.rebindEvents();

        }).always(function() {
            view.hideSpinner();
        });
    };

    protect.noResults = function() {
        return $(jive.announcements.noResults());
    };

    protect.rebindEvents = function(){
        var view = this;

        // Unbind any existing event handlers and bind again.
        this.$element.find('.updateViewLink')
        .unbind('click.announcementlisting')
        .bind('click.announcementlisting', function(event) {
            var id = $(this).closest('tr').data('object-id');
            view.emit('edit', id);
            event.preventDefault();
        });

        this.$element.find('.expireRemoveLink')
        .unbind('click.announcementlisting')
        .bind('click.announcementlisting', function(event) {
            var $ann = $(this).closest('tr')
              , id = $ann.data('object-id')
              , status = $ann.data('object-status');

            if (status == 'expired') {
                if (window.confirm(jive.announcements.confirmDelete())) {
                    view.emit('remove', id);
                }
            } else {
                if (window.confirm(jive.announcements.confirmExpire())) {
                    view.emit('expire', id);
                }
            }

            event.preventDefault();
        });
    };
});
