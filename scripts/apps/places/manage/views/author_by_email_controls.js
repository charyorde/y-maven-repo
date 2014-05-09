/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*globals toggleVCardActionButtons */

jive.namespace('places.Manage');

/**
 * UI for author by email stuff.
 *
 * @depends path=/resources/scripts/apps/places/manage/views/abstract_controls.js
 */
jive.places.Manage.AuthorByEmailControls = jive.places.Manage.AbstractControls.extend(function(protect, _super) {
    var $ = jQuery;

    protect.modalContent = '#vcard-modal';
    protect.modal = '#jive-author-by-email-modal';
    protect.reloadOnClose = false;

    protect.init = function() {
        var view = this;

        _super.init.apply(this, arguments);


        $(document).ready(function() {
            $(view.modalContent).delegate(':checkbox[name=vCardObjectTypes]', 'click', function() {
                toggleVCardActionButtons();
            });

            // Open modal immediately on initialization.
            view.activate();
        });
    };
});
