/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Announcements');

/**
 * Silly little class to display a loading spinner in a modal.
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 */
jive.Announcements.ModalView = jive.AbstractView.extend(function(protect) {
    protect.init = function(element) {
        this.content = jQuery(element).closest('.jive-modal');
    };
});
