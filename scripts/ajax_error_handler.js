/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Util');  // Creates the jive.Util namespace if it does not already exist.


jive.Util.AjaxErrorHandler = jive.oo.Class.extend(function(protect) {

    protect.init = function() {
    }

    this.handleError = function(xhr) {
        var msg = "An error occurred while executing request.";

        // handle errors with http code > 400, returned by actions inside the struts community-actions-include package
        if (xhr.status == 403) {        // Unauthenticated
            top.location = _jive_base_url + "/login.jspa";
            return;
        }
        else if (xhr.status == 404) {   // Not Found
            // defined in header-javascript.ftl
            msg = ajaxNotFoundMessage;
        }
        else if (xhr.status == 500) {   // Server Error
            msg = ajaxErrorMessage;
        }
        else if (xhr.status == 401) {   // Unauthorized
            msg = ajaxUnauthorizedMessage;
        }

        $j('<p />').html(msg).message({ style: 'error' });
    };

    this.checkForLoginRedirect = function(xhr) {
        // check whether response is HTML
        var contentType = xhr.getResponseHeader('Content-Type');
        if (!contentType || contentType.match(/html/)) {

            // end user UI
            if ($j('#loginform', xhr.responseText).length > 0) {
                top.location = _jive_base_url + "/login.jspa";
            }
            // admin console
            else if ($j('#jive-loginBox', xhr.responseText).length > 0) {
                top.location = _jive_base_url + "/admin/login.jsp";
            }

        }
    };

});