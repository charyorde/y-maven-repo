/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('places.Manage');

/**
 * Class to load a custom modal for a plugin.
 *
 * @depends path=/resources/scripts/apps/places/manage/views/abstract_controls.js
 * @depends template=jive.nav.menu.create.quick scope=client
 */
jive.places.Manage.CustomControls = jive.places.Manage.AbstractControls.extend(function(protect) {
    var $ = jQuery;
    // JIVE-14312: unused but sadly required by the parent class
    protect.modalContent = '';
    protect.modal = '';

    protect.activationLink = '.jive-link-manage-custom';
    protect.reloadOnClose = false;

    protect.init = function() {
        var view = this;

        $(document).ready(function() {

            // Handles clicks on links for custom management modals for a container
            $(view.activationLink).click(function(e) {
                // An object ID will only be present when clicking on the
                // "edit" link of a specific object, such as an announcement.
                var objectID = null;
                var url = $(this).attr('href');

                //if not an absolute URL then make sure it has a leading forward slash
                if (url != null && url.indexOf("http") != 0 && url.indexOf("/") != 0){
                    url = "/" + url;
                }

                view.onActivate(e, $(this));

                view.showSpinner();
                view.emitP('load', objectID, url).addCallback(function(content) {
                    var htmlAndScripts = view.separateScripts(content)
                      , html = htmlAndScripts[0]
                      , scripts = htmlAndScripts[1]
                      , title = (html.match(/data-title\s*=\s*['"]([^'"]+)['"]/) || [])[1] || '';

                    // render the modal content
                    var modal = jive.nav.menu.create.quick({
                        title: title,
                        body: html
                    });

                    $(modal).lightbox_me({
                        destroyOnClose: true,
                        onClose: function() {
                            if (view.reloadOnClose) {
                                window.location.reload();
                            }
                            return false;
                        }
                    });

                    scripts();

                    view.hideSpinner();
                });

                $("#j-place-manage-container").trigger("close");
                e.preventDefault();
            });
        });
    };

});
