/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('EAEAdmin');

/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/jive/i18n.js
 * @depends path=/resources/scripts/soy/soyutils.js
 * @depends path=/resources/scripts/jive/soy_functions.js
 * @depends path=/resources/scripts/apps/admin/eae/models/eae_source.js
 * @depends path=/resources/scripts/apps/admin/eae/views/eae_view.js
 */
jive.EAEAdmin.Main = jive.oo.Class.extend(function(protect) {
    var _ = jive.EAEAdmin;

    this.init = function(options) {
        var main = this;

        this.eaeSource = new _.EAESource(options);
        this.eaeView = new _.EAEView(options);

        this.eaeView.addListener('update-progress', function(callback) {
            main.eaeSource.getCurrentProgress().addCallback(function(data) {
                callback(data);
            });
        });
    };

});
