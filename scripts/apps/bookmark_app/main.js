/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @namespace
 * @name jive.BookmarkApp
 */
jive.namespace('BookmarkApp');

/**
 * @class
 * @param {Object} options
 * @config {jQuery|DOMElement|String} element reference or selector for element that contains bookmarking links
 * @config {Object} bookmark model object representing a bookmark
 * @config {string} [bookmark.id] id of the bookmark if it is not a new record
 * @config {string} bookmark.markedObjectType type of content
 * @config {string} bookmark.markedObjectID id of content object
 *
 * @depends template=jive.BookmarkApp.soy.*
 * @depends path=/resources/scripts/apps/shared/models/bookmark_source.js
 * @depends path=/resources/scripts/apps/bookmark_app/views/link_view.js
 * @depends path=/resources/scripts/apps/bookmark_app/views/list_view.js
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 * @depends path=/resources/scripts/jquery/jquery.form.js
 *
 */
jive.BookmarkApp.Main = jive.oo.Class.extend(function(protect) {
    var _ = jive.BookmarkApp
      , $ = jQuery;

    protect.init = function(options) {
        var main = this;

        this.element  = options.element;
        this.bookmark = $.extend({}, options.bookmark);
        this.legacy = options.legacy;
        this.inProgress = {};
        this.createModalAction = options.createModalAction;

        $(document).ready(function() {
            main.bookmarkSource = new jive.BookmarkSource();

            if (main.element) {
                // bookmark actions on a content page
                main.linkView = main.buildLinkView(main.element);

                jive.switchboard.addListener('bookmark.create', function(bookmark) {
                    main.update(bookmark, function() {
                        main.bookmark.id = bookmark.id;
                        main.linkView.updateLink({
                            bookmarked    : true,
                            legacy        : main.legacy,
                            bookmarkCount : bookmark.bookmarkCount,
                            objectId      : bookmark.markedObjectId,
                            objectType    : bookmark.markedObjectType
                        });
                    });
                })
                .addListener('bookmark.destroy', function(bookmark) {
                    main.update(bookmark, function() {
                        delete main.bookmark.id;
                        main.linkView.updateLink({
                            bookmarked    : false,
                            legacy        : main.legacy,
                            bookmarkCount : bookmark.bookmarkCount,
                            objectId      : bookmark.markedObjectId,
                            objectType    : bookmark.markedObjectType
                        });
                    });
                });
            } else {
                // bookmark actions for a list of content items
                main.listView = main.buildListView();

                jive.switchboard.addListener('bookmark.create', function(bookmark) {
                    main.listView.updateBookmarkLinks(bookmark);
                })
                .addListener('bookmark.destroy', function(bookmark) {
                    main.listView.updateUnbookmarkLinks(bookmark);
                });
            }
        });
    };

    protect.buildLinkView = function(element) {
        var linkView = new _.LinkView(element)
          , main = this;

        linkView.addListener('bookmark', function() {
            var key = main.key();

            if (!main.inProgress[key]) {
                main.bookmarkSource.save(main.bookmark).addCallback(function(saved) {
                    main.bookmark = $j.extend(main.bookmark, { id: saved.id, bookmarkCount: saved.bookmarkCount });
                    jive.switchboard.emit('bookmark.create', main.bookmark);
                    delete main.inProgress[key];
                });

                main.inProgress[key] = true;
            }
        });

        linkView.addListener('unbookmark', function() {
            var key = main.key();

            if (!main.inProgress[key]) {
                main.bookmarkSource.destroy(main.bookmark.id).addCallback(function() {
                    --main.bookmark.bookmarkCount;
                    jive.switchboard.emit('bookmark.destroy', $.extend({}, main.bookmark));
                    delete main.inProgress[key];
                });

                main.inProgress[key] = true;
            }
        });

        linkView.addListener('edit', function() {
            // we need to fetch the modal as it hasn't been preloaded.
            var data = {
                contentObjectType: main.bookmark.markedObjectType,
                object: main.bookmark.markedObjectId
            };
            main.loadModal(data);
        });
        return linkView;
    };

    protect.buildListView = function() {
        var listView = new _.ListView()
          , main = this;

        listView.addListener('bookmark', function(bookmark) {
            var key = main.key(bookmark);

            if (!main.inProgress[key]) {
                main.bookmarkSource.save(bookmark).addCallback(function(saved) {
                    main.bookmark = $j.extend(bookmark, { id: saved.id, bookmarkCount: saved.bookmarkCount });
                    jive.switchboard.emit('bookmark.create', main.bookmark);
                    delete main.inProgress[key];
                });

                main.inProgress[key] = true;
            }
        });

        listView.addListener('unbookmark', function(bookmark) {
            var key = main.key(bookmark);

            if (!main.inProgress[key]) {
                main.bookmarkSource.destroy(bookmark.id).addCallback(function() {
                    --bookmark.bookmarkCount;
                    jive.switchboard.emit('bookmark.destroy',  $.extend({}, bookmark));
                    delete main.inProgress[key];
                });

                main.inProgress[key] = true;
            }
        });

        listView.addListener('edit', function(bookmark) {
            // we need to fetch the modal as it hasn't been preloaded.
            var data = {
                contentObjectType: bookmark.markedObjectType,
                object: bookmark.markedObjectId
            };
            main.loadModal(data, bookmark);
        });

        return listView;
    };

    protect.loadModal = function(data, bookmark) {
        var main = this;

        if (!this.modalOpen) {
            this.modalOpen = true;

            $.get(main.createModalAction, data, function(html) {
                var modal = $(html);
                $('body').append(modal);
                main.populateModal(modal.filter(':first'), bookmark, function() {
                    main.modalOpen = false;
                });
            });
        }
    };

    protect.populateModal = function(modal, bookmark, callback) {
        // Fill the jive-bookmark-modal with the ajax return
        modal.lightbox_me({
            onClose: function() {
                callback();
                modal.remove();
            },
            onLoad: function() {
                modal.find('input[type="text"], textarea, .jive-js-statusinput').filter(':visible').first().focus();
                $j('label[for="notes"]').click(function(e){
                    e.preventDefault();
                    $j(this).siblings('.jive-form-element-text').find('div[contenteditable]').first().focus();
                });
            }
        });

        modal.find('form').ajaxForm({
            cache:false,
            success: function() {
                modal.trigger('close');
                jive.switchboard.emit('bookmark.update',  $.extend({}, bookmark));
            }
        });

        $('html,body').animate({scrollTop: 0}, 500);
    };

    /**
     * Updates the stored bookmark data and bookmark link if the given bookmark
     * object is associated with the same marked object.
     */
    protect.update = function(bookmark, callback) {
        if (bookmark.markedObjectType === this.bookmark.markedObjectType &&
        bookmark.markedObjectId === this.bookmark.markedObjectId) {
            callback();
        }
    };

    /**
     * Produces a hash key for a given bookmark.
     */
    protect.key = function(bookmark) {
        bookmark = bookmark || this.bookmark;
        return String(bookmark.markedObjectType) +'-'+ String(bookmark.markedObjectId);
    };
});
