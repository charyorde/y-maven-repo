/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 *
 * @depends path=/resources/scripts/jive/rest.js
 */

jive.namespace('Authentication');

jive.Authentication.Source = jive.oo.Class.extend(function(protect) {

    this.init = function(options) {
        var source = this;
        var uri = (options && options.uri) || jive.app.url({path:'/cs_login'});
        source.uri = (options && options.forceSecure) ? jive.secure(uri) : uri;
    };

    this.login = function(credentials) {
        var source = this;
        var promise = new jive.conc.Promise();
        var $form = $j(jive.authentication.sourceForm($j.extend({action: source.uri}, credentials)));
        $j('body').append($form);
        $form.submit();
        $form.remove();
        promise.emitSuccess();
        return promise;
    };

});