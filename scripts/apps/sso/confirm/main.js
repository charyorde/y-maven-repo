/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.app('sso.confirm');

/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/jive/i18n.js
 * @depends path=/resources/scripts/soy/soyutils.js
 * @depends path=/resources/scripts/jive/soy_functions.js
 * @depends path=/resources/scripts/apps/sso/confirm/views/sso_confirm_view.js
 * @depends path=/resources/scripts/apps/sso/confirm/models/sso_confirm_source.js
 */
jive.sso.confirm.Main = jive.oo.Class.extend(function(protect) {
    var _ = jive.sso.confirm;

    this.init = function(options) {
        var main = this;

        this.view = new _.View(options);
        this.model = new _.Model(options);

        this.view.addListener('save', function(data) {
            main.model.save(data).addCallback(function(resp) {
                main.view.success(resp);
            });
        });
    };
});
