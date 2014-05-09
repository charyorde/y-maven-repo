/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('places.Manage');

/**
 * Base class for views that load content into a modal dialog in response to a
 * click on a link.
 *
 * @depends template=jive.places.modal.modalLoading
 */
jive.places.Manage.AbstractControls = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    // Selectors used to access necessary UI elements.
    protect.modalContent = jive.oo._abstract;
    protect.modal = jive.oo._abstract;
    protect.activationLink = jive.oo._abstract;

    protect.reloadOnClose = true;

    protect.init = function() {
        var view = this;

        $(document).ready(function() {
            var modalContent = $(view.modalContent)
                , modal = $(view.modal);

            // Handles clicks on the link for managing all announcements for
            // the space and for the edit link on individual announcements.
            $(view.activationLink).click(function(e) {
                // An object ID will only be present when clicking on the
                // "edit" link of a specific object, such as an announcement.
                var objectID = $(this).data('object-id');
                view.activate(objectID, this, e);

                e.preventDefault();
            });
        });
    };

    protect.activate = function(objectID, link, e) {
        var view = this
            , modalContent = $(view.modalContent)
            , modal = $(view.modal);

        this.onActivate(e, $(link));

        this.showSpinner();
        this.emitP('load', objectID, null).addCallback(function(content) {
            var htmlAndScripts = view.separateScripts(content)
                , html = htmlAndScripts[0]
                , scripts = htmlAndScripts[1];

            modalContent.html(view.shiv(html));
            modal.trigger('resize');
            scripts();
            view.hideSpinner();
            view.emit('load.after', { $modal: modal });
        });

        modal.lightbox_me({
            onClose: function() {
                if (view.reloadOnClose) {
                    window.location.reload();
                }
                return false;
            }
        });

        $("#j-place-manage-container").trigger("close");
    };


    protect.onActivate = function(event, element) {
        // Does nothing - but may be overridden in subclasses.
    };

    protect.createSpinner = function() {
        $(this.modalContent).html(jive.places.modal.modalLoading());
    };

    protect.destroySpinner = function() {
        // does nothing
    };
});
