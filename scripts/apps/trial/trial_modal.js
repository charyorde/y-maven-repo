/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/**
 * @depends path=/resources/scripts/apps/browse/user/model/user_source.js
 * @depends template=jive.trial.modal
 */
define('jive.trial.Modal', [
    'jquery'], function($) {
    return jive.oo.Class.extend(function(protect) {
        protect.init = function(opts) {
            var main = this;
            main.$modal = $(jive.trial.modal(opts));
            main.$modal.lightbox_me({
                onClose: function(){main.modalComplete();},
                closeClick: false,
                closeEsc: false,
                destroyOnClose: true
            });

            main.$modal.one("click", "#jive-trial-modal-more", function(e){
                e.preventDefault();
                $j('#jive-trial-banner').trigger('click');
            });
        };

        this.closeModal = function () {
            var main = this;
            main.$modal.trigger('close');
        };

        protect.modalComplete = function() {
            (new jive.Browse.User.ItemSource()).setUserProperty({
                userID: 'current',
                propName: 'jive.trial.modal.complete',
                propValue: 'true'
            });
        };
    });
});
