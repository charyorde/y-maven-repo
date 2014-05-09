/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.app('SSOAdminApp');

/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/jive/i18n.js
 * @depends path=/resources/scripts/soy/soyutils.js
 * @depends path=/resources/scripts/jive/soy_functions.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/promise.js
 * @depends path=/resources/scripts/apps/admin/sso/views/saml_view.js
 * @depends path=/resources/scripts/apps/admin/sso/models/saml_source.js
 * @depends path=/resources/scripts/apps/admin/sso/views/sso_view.js
 * @depends path=/resources/scripts/apps/admin/sso/models/sso_source.js
 * @depends path=/resources/scripts/apps/admin/sso/views/kerberos_view.js
 * @depends path=/resources/scripts/apps/admin/sso/models/kerberos_source.js
 * @depends path=/resources/scripts/apps/admin/sso/views/external_login_view.js
 * @depends path=/resources/scripts/apps/admin/sso/models/external_login_source.js
 */
jive.SSOAdminApp.Main = jive.oo.Class.extend(function(protect) {
    var _ = jive.SSOAdminApp;

    this.init = function(options) {
        var main = this;

        switch (options.tab) {
            case 'sso':
                this.view = new _.SSOView(options);
                this.model = new _.SSOModel(options);

                this.view.addListener('save', function(data) {
                    hideMessages();
                    main.model.save(data).addCallback(function(resp) {
                        response(resp);
                    });
                });
            break;

            case 'saml':
                this.view = new _.SAMLView(options);
                this.model = new _.SAMLModel(options);

                this.view.addListener('load-metadata', function(data) {
                    main.model.loadMetadata(data).addCallback(function(resp) {
                        main.view.metadataLoaded(resp);
                    });
                });

                this.view.addListener('download-keystore', function(data) {
                    hideMessages();
                    main.model.downloadKeystore(data);
                });

                this.view.addListener('upload-keystore', function(data) {
                    hideMessages();
                    main.model.uploadKeystore(data).addCallback(function(resp) {
                        response(resp);
                    });
                });

                this.view.addListener('save', function(data) {
                    hideMessages();
                    main.model.save(data).addCallback(function(resp) {
                        main.view.save(resp);
                    });
                });
            break;

            case 'kerberos':
                this.view = new _.KerberosView(options);
                this.model = new _.KerberosModel(options);

                this.view.addListener('save', function(data) {
                    hideMessages();
                    main.model.save(data).addCallback(function(resp) {
                        response(resp);
                    });
                });
            break;

            case 'external-login':
                this.view = new _.ExternalLoginView(options);
                this.model = new _.ExternalLoginModel(options);

                this.view.addListener('save', function(data) {
                    hideMessages();
                    main.model.save(data).addCallback(function(resp) {
                        response(resp);
                    });
                });
            break;
        }
        
        $j(document).ready(function() {
            //expandable options
            $j('.w-options').each(function() {
                var el = $j(this);
                el.click(expander);
                //make sure the inital page load has the right things showing and hidden
                expander.call(el);
            });

            //enable-disable functionality
            $j('.sso-enable li').click(function() {
                var el = $j(this);
                if (!el.hasClass('checked')) {
                    //get the checked el and remove the checked class and uncheck
                    var checked = el.parent().find('li.checked');
                    checked.removeClass('checked');
                    checked.find('input').prop('checked', false);

                    //actually add the checking to the clicked el
                    el.addClass('checked');
                    el.find('input').prop('checked', true);
                }
            });

            //wire up any sub tab functionality
            $j('.sso-subtab .jive-body-tab').each(function() {
                var tab = $j(this);
                tab.find('a').click(function() {

                    //hide any showing tab content
                    $j('.sso-subtab-content').each(function() {
                        $j(this).hide();
                    });

                    //for each tab, remove any highlight
                    $j('.sso-subtab .jive-body-tab').each(function() {
                        $j(this).removeClass('jive-body-tabcurrent active');
                    });

                    //show selected tabs content
                    var showAnchor = $j(this);
                    var showTab = showAnchor.closest('.jive-body-tab');
                    showTab.addClass('jive-body-tabcurrent active');

                    //the actual content to show
                    var show = $j('#jive-' + showAnchor.attr('ref') + '-tab-content');
                    show.show();
                });
            });
        });
    }
});

function hideMessages() {
    $j('.jive-success-box').hide();
    $j('.jive-error-box').hide();
}

function response(resp) {
    if (resp.error) {
        var errorBox = $j('#jive-error-box');
        errorBox.find("span.message").text(resp.error);
        setDetail(errorBox, resp);
        errorBox.show();
        return false;
    } else if (resp.message) {
        var successBox = $j('#jive-success-box');
        successBox.find("span.message").text(resp.message);
        setDetail(successBox, resp);
        successBox.show();
        return true;
    }
    return false;
}

function setDetail(el, resp) {
    if (resp.detail) {
        var showDetail = $j('<a/>');
        showDetail.text(" Show Detail");
        showDetail.click(function() {
            el.find("span.message .jive-error-detail").show();
            showDetail.hide();
        });
        var message = el.find("span.message");
        message.append(showDetail);
        message.append($j('<pre class="jive-error-detail">').text(resp.detail).hide());
    }
}

function expander() {
    var target = $j(this);
    var targetOptions = $j('#' + target.attr('id') + '-options');
    if (target.is(':checked') || target.attr('ref') == 'closed') {
        target.attr('ref', 'open');
        targetOptions.show();
    } else {
        target.attr('ref', 'closed');
        targetOptions.hide();
    }
}

function jsonifyForm(el) {
    var inputs = el.serializeArray();
    var o = {};
    $j.each(inputs, function() {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            if (this.value) {
                o[this.name].push(this.value || '');
            }
        } else {
            if (this.value) {
                o[this.name] = this.value || '';
            }
        }
    });

    return o;
}

