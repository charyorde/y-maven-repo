/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*global jiveChooseContainerForm */

jive.namespace('Navbar.Menu.Create');

/**
 * Handles UI for a quick create (prerendered html) in the "create" menu.
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.nav.menu.create.quick scope=client
 */
jive.Navbar.Menu.Create.QuickCreateView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    this.render = function() {

        var promise = new jive.conc.Promise();

        var view = this;

        //do initial pass
        view.emitP("fetch").addCallback(function(response) {
            var htmlAndScripts = view.separateScripts(response.body)
              , html = htmlAndScripts[0]
              , scripts = htmlAndScripts[1]
              , title = (html.match(/data-title\s*=\s*(['"])(.+?)\1/) || [])[2] || ''
              , content;

            title = $('<div/>', { html: title }).text();

            //render the quick create content
            content = $(jive.nav.menu.create.quick({
                title: title,
                body: html
            }));

            content.lightbox_me({
                closeSelector: ".close",
                destroyOnClose: true,
                onLoad: function() {
                    content.find('input[type=text]:first').focus();
                    scripts();
                    promise.emitSuccess();
                },
                onClose: function(){
                    content.trigger("lightboxclose");
                    delete view.content;
                }
            });

            view.content = content;
        });

        return promise;
    };
});
