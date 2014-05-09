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
jive.SSOAdminApp.ExternalLoginView = jive.oo.Class.extend(function(protect) {
    jive.conc.observable(this);

    this.init = function(options) {
        var view = this;

        $j(document).ready(function() {

            //sortable providers list
            $j("ul.ext_login_list").sortable();

            $j('#external-login-submit').click(function (e) {
                e.preventDefault();

                var o = jsonifyForm($j("#external-login-save :input"));
                var newO = {};
                $j.each(o, function(key, value) {
                    var split = key.split(".");
                    if (split.length > 1) {
                        newO[split[0]] = newO[split[0]] || {};
                        newO[split[0]][split[1]] = newO[split[0]][split[1]] || {};
                        newO[split[0]][split[1]] = value;
                    } else {
                        newO[split[0]] = value;
                    }
                });
                console.log(newO);
                view.emit('save', newO);
            });
        });
    }
});