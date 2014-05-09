/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Menu.CreateQuick');  // Creates the jive.Navbar.Menu.CreateQuick namespace if it does not already exist.

/**
 * A quick way for create links to register with the Navbar.Menu.Create app.
 *
 * @param {jQuery|DOMElement|String}linkSelector reference or selector to the create link containing a containerType parameter in the query string.
 *
 * @depends path=/resources/scripts/apps/shared/controllers/localexchange.js
 * @depends path=/resources/scripts/jquery/jquery.ba-bbq.js
 */
jive.Navbar.Menu.CreateQuick.Main = jive.oo.Class.extend(function(protect) {

     protect.init = function(linkSelector) {

        $j(linkSelector).click(function(e) {
            // parse contentType and upload (docs only) out of the querystring
            var params = $j.deparam.querystring($j(this).attr("href"));
            if (params.contentType) {
                jive.localexchange.emit('actions.create', {
                            contentType: params.contentType,
                            upload: (params.upload && params.upload != 'false')?params.upload:false});
                e.preventDefault();
            }
        });
    };

});


