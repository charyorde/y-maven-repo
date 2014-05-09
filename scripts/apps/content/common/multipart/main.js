/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('content.common.multipart');

/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/jive/i18n.js
 * @depends path=/resources/scripts/soy/soyutils.js
 * @depends path=/resources/scripts/jive/soy_functions.js
 * @depends path=/resources/scripts/apps/content/common/multipart/view.js
 * @depends path=/resources/scripts/apps/content/common/multipart/source.js
 */
jive.content.common.multipart.Main = jive.oo.Class.extend(function(protect) {
    var _ = jive.content.common.multipart;

    this.init = function(options) {
        protect.main = this;

        this.view = new _.View(options);
        this.model = new _.Model(options);

        this.view.addListener('update', function(data) {
            protect.main.model.findAll().addCallback(function(resp) {
                protect.main.view.update(resp);
            });
        });
    };
});

