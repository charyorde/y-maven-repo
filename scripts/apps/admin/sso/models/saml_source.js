/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('SSOAdminApp');

/*globals soy */

/**
 * @class
 * @extends jive.RestService
 * @depends path=/resources/scripts/jquery/jquery.form.js
 * @depends path=/resources/scripts/jive/rest.js
 * @depends path=/resources/scripts/jive/util.js
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.SSOAdminApp.SAMLModel = jive.RestService.extend(function(protect) {

    protect.resourceType = "admin/sso/saml";
    protect.pluralizedResourceType = protect.resourceType;

    this.save = function save(data) {
        var url = this.RESOURCE_ENDPOINT + '/save/';
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url: url, data: Object.toJSON ? Object.toJSON(data) : JSON.stringify(data)});
    };

    this.loadMetadata = function(data) {
        var url = this.RESOURCE_ENDPOINT + '/load-metadata?url=' + soy.$$escapeUri(data.url);
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url: url});
    };

    this.downloadKeystore = function(data) {
        var url = this.RESOURCE_ENDPOINT + '/keystore';
        $j('#download-keystore-iframe').remove();
        $j('<iframe/>').attr('id','download-keystore-iframe').attr('src',url).hide().appendTo('body');
    };

    this.uploadKeystore = function(data) {
        var url = this.RESOURCE_ENDPOINT + '/keystore';
        var completion = new jive.conc.Promise();
        var form = $j('<form/>')
            .attr('action',url)
            .attr('method','POST')
            .attr('enctype','multipart/form-data')
            .attr('encoding','multipart/form-data')
            .append(data.inputs)
            .append($j('<input/>').attr({ 
                type:'hidden',
                name:'jive.token.name',
                value:'admin.sso.saml.upload.keystore'
            }))
            .hide()
            .appendTo('body')
            .ajaxForm({
                iframe: 'true',
                dataType: 'json',
                success: function(foo) {
                    completion.emitSuccess(foo);
                }
            });
        jive.util.securedForm(form).addCallback(function() {
            form.submit();
        });
        return completion;
    };
});
