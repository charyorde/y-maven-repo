
/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.ProfilePreview = function(baseUrl, userID, loadingMsg) {

    //general errors
    var ajaxErrorHandler = new jive.Util.AjaxErrorHandler();

    var __baseURL = baseUrl;
    var __userID = userID;
    var __loadingMsg = loadingMsg;
    var __refreshDelay = 50;

    function getPreviewURL(levelID) {
        var url = __baseURL + "?userID=" + __userID + "&proxyProfileSecurityLevel=" + levelID;
        url += "&" + $j("#profile-security-edit-form").formSerialize();
        url += "&random=" + Math.random(); //so IE doesn't cache the URL
        return url;
    }

    function reloadPreview(levelID) {
        var $preview = $j('#preview');
        var spinner = new jive.loader.LoaderView({size: 'big'});
        spinner.appendTo($preview);
        setTimeout(function() {
            var url = getPreviewURL(levelID);
            $j("#lightbox-content").load(url, function(response, status, xhr) {
                spinner.destroy();
                if (status == 'error') {
                    ajaxErrorHandler.handleError(xhr);
                } else {
                    ajaxErrorHandler.checkForLoginRedirect(xhr);
                }
            });
        }, __refreshDelay);

    }

    function submitPreviewChanges() {
        $j("#profile-security-edit-form").submit();
    }

    function doPreview(levelID) {
        if (levelID != -1) {
            if (!$j('.jive-modal-profilePreview').is(':visible')) {
                var url = getPreviewURL(levelID);
                $j("#lightbox-content").load(url, function(response, status, xhr) {
                    if (status == 'error') {
                        ajaxErrorHandler.handleError(xhr);
                    } else {
                        ajaxErrorHandler.checkForLoginRedirect(xhr);
                        $j(".jive-modal-profilePreview").lightbox_me();
                    }
                });
            }
        }
    }

    this.reloadPreview = reloadPreview;
    this.submitPreviewChanges = submitPreviewChanges;
    this.doPreview = doPreview;

    $j(document).ready(function() {
        $j('#profilePreviewSelect').change(function() {
            doPreview($j(this).val());
        });
    });

};


