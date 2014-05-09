/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Menu.Create');
/**
 * Interface to create menu REST service.
 *
 * @extends jive.RestService
 */
jive.Navbar.Menu.Create.QuickCreateSource = jive.oo.Class.extend(function(protect) {

    this.fetch = function(url, promise) {
        var p = promise || new jive.conc.Promise();
        $j.get(url, function(html) {
            p.emitSuccess({
                body: html
            });
        });
        return p;
    };

});
