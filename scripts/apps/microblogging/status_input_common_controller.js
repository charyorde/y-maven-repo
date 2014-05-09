/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('MicroBlogging');

/**
 * Controller for EAE activity Stream
 *
 * @class
 *
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 * @depends path=/resources/scripts/apps/microblogging/status_input_common_controller.js
 * @depends path=/resources/scripts/apps/microblogging/models/microblogging_source.js
 * @depends path=/resources/scripts/apps/shared/models/meta_source.js
 */
jive.MicroBlogging.CommonController = jive.oo.Class.extend(function(protect) {
    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);
    
    this.init = function (options) {
        if(!options){
            options = {};
        }
        this.microbloggingService = new jive.MicroBlogging.MicroBloggingSource();
        this.metaService = new jive.MetaSource();
        // used to keep track of draft wall entry
        this.draftWallEntry = null;

        this.viewOptions = options.viewOptions || {};
        this.initMBView();

        this.manuallyRenderView = options.manuallyRenderView || false;
        this.submitURLParams = {objectType:14, objectID:1};
        if (options.trackingID) {
            this.submitURLParams['trackingID'] = options.trackingID;
        }
        var self = this;
        this.microbloggingView.addListener('submit', function(data, promise){
            self.submitHandler(data, promise);
        }).addListener('linkURLMatch', function(url, promise){
            console.log('linkURL match');
            self.metaService.createLink(url)
                .addCallback(function(data) {
                    promise.emitSuccess(data, url);
                // Run a callback when an error occurs during
                // the server call.
                }).addErrback(function(message, status) {
                    promise.emitError(message, status);
                });
        }).addListener('imageURLMatch', function(url, $form, draftData, promise){
            self.draftData = draftData;
            // create a draft (if we haven't created one already), then submit image data, finally render returned img
            // data
            function submitImageData(){
                // submits image data
                var thisPromise = self.metaService.createImage(self.draftWallEntry.wallentry, url, url != null, $form);
                thisPromise.addCallback(function(data) {
                        // render
                        promise.emitSuccess(data, url);
                    }).addErrback(function(message, status) {
                        // render error
                        promise.emitError(message, status);
                    });
            }

            if(self.draftWallEntry == null){
                // create a draft then submit data
                self.createDraft(submitImageData, promise);
            } else {
                // draft has already been created, use it to submit data
                submitImageData();
            }
        }).addListener('removeImage', function(id, promise){
            // rest request to remove image
            self.metaService.remove(id).addCallback(function(data) {
                    promise.emitSuccess(data);
                }).addErrback(function(message, status) {
                    promise.emitError(message, status);
                });
        }).addListener('youtubeURLMatch', function(url, draftData, promise){
            self.draftData = draftData;
            // create a draft (if we haven't created one already), then submit video data, finally render returned
            // data
            function submitVideoData(){
                // submits video data
                self.metaService.createVideo(self.draftWallEntry.wallentry, url)
                    .addCallback(function(data) {
                        // fetch meta data from id
                        self.metaService.fetch(data.id)
                            .addCallback(function(data) {
                                if(data.meta.length > 0){
                                    promise.emitSuccess(self.metaService.normalizeVideoData(data), url);
                                } else {
                                    promise.emitError(message, status);
                                }
                            }).addErrback(function(message, status) {
                                // render error
                                promise.emitError(message, status);
                            });
                    }).addErrback(function(message, status) {
                        // render error
                        promise.emitError(message, status);
                    });
            }

            if(self.draftWallEntry == null){
                // create a draft then submit data
                self.createDraft(submitVideoData, promise);
            } else {
                // draft has already been created, use it to submit data
                submitVideoData();
            }
        }).addListener('cancel', function(){
            self.emit('cancel');
        });

        if(!this.manuallyRenderView){
            this.renderView();
        }
    };

    protect.submitHandler = function(data, promise){
        var pubData;
        if(this.draftWallEntry != null){
            pubData = $j.extend(true, {}, this.draftWallEntry, data);
        } else {
            pubData = data;
        }

        this.submitServiceCall(pubData, promise);
    };

    protect.submitServiceCall = function(data, promise){
        var self = this;
        this.microbloggingService.publishEntry(this.submitURLParams, data)
            .addCallback(function(data) {
                self.submitSuccessCallback(data, promise);
            }).addErrback(function(message, status) {
                self.submitErrCallback(message, status, promise);
            });
    };

    protect.submitSuccessCallback = function(data, promise){
        // reset draft data
        this.draftWallEntry = null;
        // render response
        data.wallentry = this.metaService.normalizeVideoData(data.wallentry);
        promise.emitSuccess(data);
        this.emitP('submitSuccess', data);
    };

    protect.submitErrCallback = function(message, status, promise){
        promise.emitError(message, status);
        this.emitP('submitError', message, status);
    };

    protect.createDraft = function(callback, promise){
        var self = this;
        this.microbloggingService.createDraft({objectType:14, objectID:1}, {wallentry: {}})
            .addCallback(function(data) {
                self.draftWallEntry = data;
                callback();
            }).addErrback(function(message, status) {
                promise.emitError(message, status);
            });
    };
    
    protect.initMBView = function(){
        throw 'initMBView method is abstract. Need to implmenet in subclass';
    };

    this.renderView = function(){
        this.microbloggingView.postRender();
    };

    this.getMicrobloggingView = function(){
        return this.microbloggingView;
    };
});