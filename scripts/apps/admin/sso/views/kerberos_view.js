/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('SSOAdminApp');

/**
 * @depends template=jive.admin.sso.*
 */
jive.SSOAdminApp.KerberosView = jive.oo.Class.extend(function(protect) {
    jive.conc.observable(this);

    this.init = function(options) {
        var view = this;

        $j(document).ready(function() {
            $j('#kerberos-submit').click(function (e) {
                e.preventDefault();

                var o = jsonifyForm($j("#kerberos-save :input"));
                view.emit('save', o);
            });
        });
    }
});