/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('content.common');

/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/jive/i18n.js
 * @depends path=/resources/scripts/soy/soyutils.js
 * @depends path=/resources/scripts/jive/soy_functions.js
 * @depends path=/resources/scripts/apps/content/common/view.js
 * @depends path=/resources/scripts/apps/content/common/source.js
 * @depends path=/resources/scripts/apps/shared/controllers/localexchange.js
 *
 * Autosave
 * @depends path=/resources/scripts/apps/content/draft/main.js
 */
jive.content.common.Main = jive.oo.Class.extend(function(protect) {
    var _ = jive.content.common;

    this.init = function(options) {
        options = $j.extend({
            submitHandlers: {
                draft: this.draftSubmitHandler,
                publish: this.publishSubmitHandler
            }
        }, options);
        var main = this;

        this.view = this.createView(options);
        this.model = this.createModel(options);
        this.processUnload = true;

        new jive.content.common.multipart.Main({
            view: this.view
        });

        this.view.addListener('save', function(data) {
            main.model.save(data, main.contributeOptions(data)).addCallback(function(resp) {
                main.processUnload = false;
                main.view.success(resp);
            }).addErrback(function() {
                main.view.enableButtons();
            });
        });

        this.view.addListener('save-multipart', function(formAndData) {
            var form = formAndData[0];
            var data = formAndData[1];
            main.model.saveMultipart(form, main.contributeOptions(data)).addCallback(function(resp) {
                main.processUnload = false;
                main.view.success(resp);
            }).addErrback(function() {
                main.view.enableButtons();
            });
        });

        $j(window).unload(function() {

            // cleanup the RTE -- have to do on unload
            // otherwise FF on Mac ignores XHR calls on page redirect
            if (window.editor && window.editor.toArray().length > 0) {
                window.editor.toArray()[0].teardownServices();
            }

            if (options.unloadURL && main.processUnload) {
                var content = main.view.getContent();
                var data = main.view.buildEventData(content);
                data.formMethod = content.data('formmethod');
                data.formAction = options.unloadURL;
                main.model.unload(data, main.contributeOptions(data));
            }

        });

        // Auto-focus the subject/title input
        jive.conc.nextTick(function() {
            $j('#jive-compose-title').find("input[name=subject]").focus();
        });
        
        
        jive.localexchange.addListener('placeChanged', function(space) {
            if (space && space.prop.isModerated) {
                $j('#jive-moderation-box').show();                                    
            } else {
                $j('#jive-moderation-box').hide();                
            }
        });
        
    };

    protect.createView = function(options) {
        return new _.View(options);
    };

    protect.createModel = function(options) {
        return new _.Model(options);
    };

    protect.contributeOptions = function(data) {
        return {};
    };

    protect.publishSubmitHandler = function(form) {
        $j(form).find('#draft').val(false);
        return form;
    };

    protect.draftSubmitHandler = function(form) {
        $j(form).find('#draft').val(true);
        return form;
    };

});

