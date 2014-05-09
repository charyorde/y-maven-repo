/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j */

jive.namespace('Announcements');

/**
 * Entry point for the app that handles managing announcements for
 * places and system-wide announcements.
 *
 * @depends path=/resources/scripts/apps/announcements/views/list_view.js
 * @depends path=/resources/scripts/apps/announcements/views/edit_view.js
 * @depends path=/resources/scripts/apps/announcements/views/modal_view.js
 * @depends path=/resources/scripts/apps/announcements/announcement_source.js
 */
jive.Announcements.Main = jive.oo.Class.extend(function(protect) {
    var _ = jive.Announcements;

    this.init = function(options) {
        var main = this;

        this.containerID = options.containerID;
        this.containerType = options.containerType;
        this.element = options.element || '#jive-modal-announcements';
        this.rteOptions = options.rteOptions;  // passed to edit view

        this.source = new jive.Announcements.Source();

        this.listView = this.buildListView();
        this.pageSize = options.pageSize || 15;

        this.modalView = new jive.Announcements.ModalView(this.element);

        // Populate the list of announcements.
        this.updateList();

        // If a specific announcement ID is given display the edit form
        // loaded with that announcement.
        if (options.editID > 0) {
            this.edit(options.editID);
        }
    };

    protect.buildListView = function() {
        var view = new _.ListView({ element: this.element })
          , main = this;

        view.addListener('create', function() {
            main.edit();
        })

        .addListener('edit', function(id) {
            main.edit(id);
        })

        .addListener('expire', function(id) {
            main.modalView.showSpinner();

            main.source.expire(id).addCallback(function() {
                main.source.get(id).addCallback(function(announcement) {
                    main.modalView.hideSpinner();
                    view.expire(announcement);
                });
            });
        })

        .addListener('remove', function(id) {
            main.modalView.showSpinner();

            main.source.destroy(id).addCallback(function() {
                main.modalView.hideSpinner();
                view.removeChild({ id: id });
            });
        })

        .addListener('page', function(pageNumber) {
            // Page numbers are indexed from zero and offsets are
            // indexed from 1, apparently.
            var startIndex = (main.pageSize * pageNumber) + 1;
            main.updateList({ startIndex: startIndex });
        });

        return view;
    };

    protect.buildEditView = function(announcement) {
        var view = new _.EditView(announcement, {
                element: this.element,
                rteOptions: this.rteOptions
            })
          , main = this;

        view.addListener('save', function(announcement, promise) {
            //append container values as the form doesn't persist them...
            main.source.save($j.extend({}, announcement, {
                containerID: main.containerID,
                containerType: main.containerType

            })).addCallback(function() {
                promise.emitSuccess();
                view.hide().destroy();
                main.listView.show();
                main.updateList({}, true);
            }).addErrback(function(message, status) {
                if (status == 4001) {
                    promise.emitError(message);
                } else {
                    main.source.showGenericSaveError();
                }
            });
        })

        .addListener('cancel', function() {
            view.hide().destroy();
            main.listView.show();
        });

        return view;
    };
    
    protect.updateList = function(params, reload) {
        var announcements = this.source.findAll(jQuery.extend({
            containerType: this.containerType,
            containerID: this.containerID,
            startIndex: 0,
            range: this.pageSize
        }, params));

        if (reload) {
            this.listView.reload(announcements);
        } else {
            this.listView.update(announcements);
        }
    };

    protect.edit = function(id) {
        var main = this
          , modal = this.modalView;

        modal.showSpinner();

        this.getAnnouncement(id, function(announcement) {
            var editView = main.buildEditView(announcement);

            main.listView.hide();
            editView.show();

            modal.hideSpinner();
        });
    };

    protect.getAnnouncement = function(id, callback) {
        // If no id is given then produce data for a new announcement.
        // Otherwise fetch data for the existing announcement.
        if (id) {
            this.source.get(id).addCallback(function(announcement) {
                callback(announcement);
            });
        } else {
            callback({
                subject: "",
                body: "",
                containerID: this.containerID,
                containerType: this.containerType
            });
        }
    };
});
