/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Controller for the Share modal
 *
 * @depends path=/resources/scripts/apps/share/models/share_source.js
 * @depends path=/resources/scripts/apps/share/views/share_view.js
 * @depends path=/plugins/lrlogin/resources/script/share_view.js
 */
jive.namespace('ShareApp');

jive.ShareApp.Main = jive.oo.Class.extend(function() {

	this.init = function(opts) {
        var options = opts || {};
		var model = options.source || new jive.ShareApp.ShareSource();
		this.view = new jive.ShareApp.ShareView();

		this.view.addListener('prepareShare', function(type, id, promise) {
			model.get(type, id)
                .addCallback(promise.emitSuccess.bind(promise))
			    .addErrback(promise.emitError.bind(promise));
        });

		this.view.addListener('share', function(type, id, data, promise) {
			model.save(type, id, data)
                .addCallback(promise.emitSuccess.bind(promise).aritize(0))
			    .addErrback(promise.emitError.bind(promise));
		});
		
		this.view.addListener('gigyashare', function(type, id, data){
			//What to do here?
			console.log(data);
		});
		
		// listener for loginradius share
		this.view.addListener('lrshare', function(type, id, data) {
		    console.log(data);
		});
	};

    /**
     * Shows the Share modal
     *
     * @param {number} id
     * @param {number} type
     * @public
     */
    this.showModal = function(id, type) {
        this.view.openShareModal(id, type);
    };
    
    /**
     * Shows LoginRadius Share modal
     *
     */
     this.showLRModal = function(data, baseUrl) {
        var lrShareView = new jive.ShareApp.LoginRadiusShareView();
        lrShareView.openLRShareModal(data, baseUrl);
     };
});
