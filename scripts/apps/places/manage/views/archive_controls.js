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
 * UI for opening the archive state management interface from a place view.
 *
 * @depends path=/resources/scripts/apps/places/manage/views/abstract_controls.js
 */
jive.places.Manage.ArchiveControls = jive.places.Manage.AbstractControls.extend(function(protect) {
    var $ = jQuery;

    protect.modalContent = '#archive-modal';
    protect.modal = '#jive-modal-archive-project';
    protect.activationLink = '#jive-link-unarchiveProject, #jive-link-archiveProject';
    protect.reloadOnClose = false;

    protect.onActivate = function(event, link) {
        $('.jive-modal-title-archive-project').toggle(link.is('#jive-link-archiveProject'));
        $('.jive-modal-title-unarchive-project').toggle(link.is('#jive-link-unarchiveProject'));
    };
});
