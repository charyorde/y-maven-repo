/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('sso.confirm');

/**
 * @depends path=/resources/scripts/apps/content/common/validator.js
 * @depends template=jive.sso.confirm
 */
jive.sso.confirm.View = jive.oo.Class.extend(function(protect) {
    jive.conc.observable(this);

    this.init = function(options) {
        var view = this;

        $j(function() {

            var form = $j('#confirm-form');

            new jive.Validator({form: form});

            form.submit(function(e) {

                if (!e.isDefaultPrevented()) {
                    var username = $j('#username');
                    var email = $j('#email');

                    view.emit('save', {
                        username: username.val(),
                        email: email.val()
                    });

                    e.preventDefault();
                }
            });
        });
    };

    this.success = function success(data) {
        if (data.error) {
            //show general errors in the error box
            var errorBox = $j('#jive-error-box-text');
            errorBox.parent().show();
            errorBox.text(jive.i18n.getMsg(data.error));
        } else {
            window.location = data.redirect;
        }
    };
});

var errord;
function errorField(el, key) {
    errord = true;
    el.after($j('<span>', {
        'class': 'field-error jive-error-message'
    }).text(jive.i18n.getMsg(key)));
}