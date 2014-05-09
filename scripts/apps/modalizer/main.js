/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint laxbreak: true */

jive.namespace('Modalizer');  // Creates the namespace if it does not already exist.

/**
 * Entry point for the Modalizer App.
 *
 * @depends path=/resources/scripts/apps/modalizer/views/modal_view.js
 * @depends path=/resources/scripts/apps/modalizer/models/modal_source.js
 */

jive.Modalizer.Main = jive.oo.Class.extend(function(protect) {

    protect.init = function(options) {
        var main = this;
        this.modalView = new jive.Modalizer.ModalView(options);
        this.modalSource = jive.Modalizer.ModalSource();
        this.modalView.addListener('launch', function(url, promise) {
            main.modalSource.getConfirmation(url, function(html) {
                 promise.emitSuccess(html);
            });
        });
     };

});
