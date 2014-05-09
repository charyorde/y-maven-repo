/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*globals $j _jive_base_url */

function lightBoxPreviewableBinary(div, title) {
    div.find('#jive-modal-title').text(title);
    div.lightbox_me({ closeSelector: ".close", destroyOnClose: true});
}

function showPreviewableBinary(url, title) {
    var $lb = $j("<div style='display: none;' class='jive-attachmentViewer jive-modal'></div>");
    var ajaxErrorHandler = new jive.Util.AjaxErrorHandler();

    $j('#previewable-binary-viewer').append($lb);
    $lb.load(url, function(response, status, xhr) {
        if (status == 'error') {
            ajaxErrorHandler.handleError(xhr);
        } else {
            ajaxErrorHandler.checkForLoginRedirect(xhr);
            lightBoxPreviewableBinary($lb, title);
        }
    });

}
