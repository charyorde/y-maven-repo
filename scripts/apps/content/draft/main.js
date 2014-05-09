/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('draft');

/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/jive/i18n.js
 * @depends path=/resources/scripts/soy/soyutils.js
 * @depends path=/resources/scripts/jive/soy_functions.js
 * @depends path=/resources/scripts/apps/content/draft/view.js
 * @depends path=/resources/scripts/apps/content/draft/source.js
 *
 * @depends i18nKeys=draft.*
 */
jive.draft.Main = jive.oo.Class.extend(function(protect) {

    this.init = function(options) {
        protect.main = this;

        this.options = $j.extend({
            enabled: true,
            interval: 10, //100
            keepaliveInterval: 90,
            objectType: null,
            draftObjectType: null,
            draftObjectID: null,
            editorId: null,
            subject: null,
            images: [],
            properties: [],
            confirmationMessage: jive.i18n.getMsg('global.unsaved_changes.text'),
            saveMessage: jive.i18n.getMsg('forum.post.save_and_edit.text'),
            savedMessage: jive.i18n.getMsg('forum.post.save_and_edit.text')
        }, options);
        options = this.options;

        this.view = new jive.draft.View(options);
        this.model = new jive.draft.Model(options);

        this.view.addListener('keepalive', function(data) {
            protect.main.model.get('');
        });

        this.view.addListener('display', function(data) {
            var id = options.objectType + '/' + options.draftObjectType + '/' + options.draftObjectID;
            protect.main.model.display(id).addCallback(function(resp) {
                protect.main.view.display(resp);
            });
        });

        this.view.addListener('create', function(data, promise) {
            protect.main.model.create(data).addCallback(function(resp) {
                protect.main.view.saved(resp, promise);
            }).addErrback(function(){
                    promise.emitError();
            });
        });

        //save the draft to the server
        this.view.addListener('save', function(data, promise) {
            protect.main.model.save(data).addCallback(function(resp) {
                protect.main.view.saved(resp, promise);
            }).addErrback(function(){
                promise.emitError();
            });
        });

        this.view.addListener('restore', function(data) {
            protect.main.view.restore(data);
        });

        this.view.addListener('destroy', function(id) {
            protect.main.model.destroy(id).addCallback(function(resp) {
                protect.main.view.destroy(id);
            });
        });
    };

    this.pause = function() {
        protect.main.view.pause();
    };

    this.unpause = function() {
        protect.main.view.unpause();
    };
});