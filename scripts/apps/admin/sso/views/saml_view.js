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
 * @depends path=/resources/scripts/apps/content/common/validator.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/compat/array.js
 * @depends template=jive.admin.sso.*
 */
jive.SSOAdminApp.SAMLView = jive.oo.Class.extend(function(protect) {
    jive.conc.observable(this);

    this.init = function(options) {
        var view = this;

        $j(document).ready(function() {

            var form = $j('#saml-save');

            new jive.Validator({form: form});

            form.submit(function (e) {

                if (!e.isDefaultPrevented()) {
                    //this object will hold all the form values to be posted in a json format
                    var o = jsonifyForm($j("#saml-save :input").not("[id|=upload-keystore]"));

                o['fields'] = [];
                var ids = o['fieldIds'];
                    ids.forEach(function(id) {
                    var profileField = {
                        id : id,
                        attribute: o['attribute-' + id],
                        federated: o['federated-' + id]
                    };
                    o['fields'].push(profileField);

                    //remove crufty fields from o
                    delete o['attribute-' + id];
                    delete o['federated-' + id];
                });

                    delete o['fieldIds'];

                    view.emit('save', o);

                    e.preventDefault();
                }
            });

            $j('#load-metadata').click(function(e) {
                e.preventDefault();
                hideMessages();
                view.emit('load-metadata', {
                    url: $j('#load-metadata-url').val()
                });
            });

            $j('#download-keystore').click(function(e) {
                e.preventDefault();
                if (confirm(jive.i18n.getMsg('admin.sso.keystore.download.confirm'))) {
                    view.emit('download-keystore');
                }
            });

            $j('#upload-keystore').click(function(e) {
                e.preventDefault();
                
                // The form doesn't work if you pass it the clone.  Leave the clone in the UI DOM
                var pw = $j('#upload-keystore-password');
                var fl = $j('#upload-keystore-file');
                pw.replaceWith(pw.clone());
                fl.replaceWith(fl.clone());
                
                if (confirm(jive.i18n.getMsg('admin.sso.keystore.upload.confirm'))) {
                    view.emit('upload-keystore', {
                        inputs: $j(null).add(pw).add(fl).removeAttr('id')
                    });
                }
            });
        });
    },

    this.metadataLoaded = function(resp) {
        if (response(resp)) {
            $j('#metadata').val(resp.metadata);
            loadAttributes(resp.attributes);
        }
    },

    this.save = function(resp) {
        if (response(resp)) {
            loadAttributes(resp.attributes);
        }
    }

});

function loadAttributes(attrResp) {
    var attrEl = $j('#saml-attributes');
    attrEl.hide();
    if (attrResp && attrResp.length > 0) {
        var attributes = $j(
            jive.admin.sso.attributes({
                    attributes: attrResp
                })
            );
        attrEl.html(attributes);
        attrEl.show()
    }
}

