/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
$j(document).ready(function() {

    /*
     * Label elements and their values for the input fields.  If the generic openid type is used, we want to swap the
     * label of the username field for that of the openid url.
     */
    var urlLabel = $j('label[for="openid_url"]');
    var urlLabelValue = urlLabel.text();
    var usernameLabel = $j('label[for="openid_username"]');
    var usernameLabelValue = usernameLabel.text();

    //the row that holds both input fields and the submit button.  is hidden by default
    var loginRow = $j('.js-openid-login-row');

    //the row that will be hidden if generic openid is used
    var urlRow = $j('.js-openid-url-row');

    //the disabled field that shows the full login url as the user types
    var urlField = $j('#openid_url');

    //username field that will also be used for the generic openid url input
    var usernameField = $j('#openid_username');

    //hidden identifier input field that will actually be posted
    var idField = $j('#openid_identifier');

    var buttonHolder = $j('.openid_provider_btns');

    var openidError = $j("<span class='jive-error-message'/>")
        .insertAfter(usernameField)
        .hide();

    var form = $j('#external-login-choice');

    $j('.ext_login_large_btn').each(function() {

        var el = $j(this);
        el.click(function(event) {
            event.stopPropagation();
            form.unbind('submit').bind(coreSubmitHandler);

            //clear any existing values present in the visisble fields
            loginRow.hide();
            usernameField.val('');

            var href = el.attr('href');
            //dynamically replace all {} placeholders with the value of the username field
            if (href.indexOf('{}') != -1) {
                buttonHolder.fadeOut(50, function() {
                    loginRow.fadeIn(50);
                });
                var handler = function() {
                    idField.val(href.replace('{}', usernameField.val()));
                    urlField.val(idField.val());
                };
                handler();
                usernameField.keyup(handler);
                form.submit(handler);
            } else if (href.indexOf("javascript:") == 0) {
                eval(href.substr("javascript:".length));
            } else {
                idField.val(href);
                form.submit();
            }

            /*
             * Explicit handing of the generic openid field.  If the clicked provider is 'openid', hide the url field and
             * switch labels on the username field to make it clear that the user has to type in the entire url
             */
            if (el.hasClass('openid')) {
                usernameLabel.text(urlLabelValue);
                urlRow.hide();
            } else {
                usernameLabel.text(usernameLabelValue);
                urlRow.show();
            }

            return false;
        })
    });

    $j('input.cancel').click(function() {
        loginRow.fadeOut(50, function() {
            buttonHolder.fadeIn(50);
        });
        return false;
    });

    var coreSubmitHandler = function() {
        if (usernameField.filter(':visible').size() == 1 && usernameLabel.text() == urlLabelValue) {
            var openid_url = usernameField.val() || '';
            var proto_page = window.location.protocol;
            var idx = openid_url.indexOf(':');
            if (idx < 0) {
                var proto_openid = 'invalid';
            } else {
                var proto_openid = openid_url.substring(0, idx + 1);
            }

            openidError.hide();
            if (proto_page == proto_openid) {
                return true;
            }

            // Error condition mappings:
            if (proto_page == 'http:' && proto_openid == 'https:') {
                openidError.text(jive.i18n.getMsg('sso.openid.implicit_upgrade'));
            } else if (proto_page == 'https:' && proto_openid == 'http:') {
                openidError.text(jive.i18n.getMsg('sso.openid.implicit_downgrade'));
            } else {
                openidError.text(jive.i18n.getMsg('sso.openid.invalid_url'));
            }

            openidError.show();
            event.stopImmediatePropagation();
            return false;
        }
    };
});

function facebook_login() {
    FB.init({
        appId: appId,
        status: false,
        cookie: true,
        xfbml: false
    });

    FB.login(function(response) {
        if (response.status == 'connected') {
            //this means the cookie has been written and the user can now be authenticated with jive through the auth filter
            window.location = window._jive_base_url + '/facebook/sso?access_token=' + response.authResponse.accessToken;
        }
    }, {scope:'email'});
}
