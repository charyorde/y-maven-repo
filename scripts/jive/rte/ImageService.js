/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace("rte");

/**
 * REST (ish) service for managing images embedded in content.
 *
 * @class
 *
 * @extends jive.RestService
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.rte.ImageService = jive.RestService.extend(function(protect, _super){
    var JPEG_TYPE = "image/jpeg";
    var PNG_TYPE = "image/png";
    var DATA_URL_RE = /^data:(image\/[^;,]+)[^,]*,/;

    protect.resourceType = "rteImage";

    protect.init = function(options){
        _super.init.call(this, options);

        protect.options = $j.extend({
            maxWidth: 1600,
            maxHeight: 1080,
            maxDataUrlLength: Math.ceil(2048 * 1024 * 8/5),
            objectId: options.objectId,
            objectType: options.objectType
        }, options);
        this.defaultParams = {
            objectId: options.objectId,
            objectType: options.objectType,
            containerId: options.containerId,
            containerType: options.containerType
        };
        protect.isInitialized = false;
        protect.initPromise = new jive.conc.Promise();
        this.initSettings();
    };

    protect.initSettings = function(){
        var requestPromise = new jive.conc.Promise();
        this.commonAjaxRequest(requestPromise, "GET", {
            url: this.getUrl("settings")
        }).addCallback(function(settings){
            $j.extend(protect.options, settings);
            protect.isInitialized = true;
            protect.initPromise.emitSuccess({
                maxWidth: protect.options.maxWidth,
                maxHeight: protect.options.maxHeight,
                objectId: protect.options.objectId,
                objectType: protect.options.objectType
            });
        }).addErrback(function(){protect.initPromise.emitError();});
    };

    protect.initCanvas = function(){
        try{
            if(this.canvas == null){
                this.canvas = document.createElement("canvas");
                this.canvasContext = this.canvas.getContext("2d");
            }
            return true;
        }catch(e){
            return false; //failed to init canvas; must be IE 7 or 8
        }
    };

    this.getSettings = function(){
        //Initialized asynchronously in the constructor
        return protect.options;
    };

    /**
     * Down-scale the image in the dataUrl, optionally converting to forceType.
     * @param dataUrl [String] The image URL.  A data: url, or a blob url of some sort.
     * @param forceType [String] The desired mime-type for the result image.  The default behavior is to preserve
     * the image's original type (jpeg stays jpeg, png stays png).  Not all browsers support all image types from
     * canvas.toDataURL.  The behavior if the type can't be produced is to produce image/png.
     */
    this.scaleClientImage = function(dataUrl, forceType){
        var scaleFinished = new jive.conc.Promise();
        if(!this.initCanvas()){
            //Couldn't get a canvas to work with; bail out cleanly.
            console.log("Warning: couldn't initialize canvas; will not scale");
            scaleFinished.emitError("Warning: couldn't initialize canvas; will not scale");
            return;
        }

        var type;
        if(forceType){
            type = forceType;
        }else{
            //preserve the type of the input
            var match = DATA_URL_RE.exec(dataUrl);
            if(match){
                type = match[1];
            }else{
                //some other URL format, like blob:, which may not have any type info
                type = PNG_TYPE;
            }
        }

        var that = this;
        function doScale(){
            var maxWidth = that.options.maxWidth;
            var maxHeight = that.options.maxHeight;
            var img = $j("<img />").load(function(){
                if(img.width > maxWidth || img.height > maxHeight){
                    //find the dimension that needs the most scaling
                    var ratio = maxWidth / img.width;
                    if(ratio > maxHeight / img.height){
                        ratio = maxHeight / img.height;
                    }
                    function scale(ratio, promise){
                        //scale, preserving image aspect ratio
                        var targetWidth = Math.round(ratio * img.width);
                        var targetHeight = Math.round(ratio * img.height);

                        that.canvas.width = targetWidth;
                        that.canvas.height = targetHeight;
                        that.canvasContext.drawImage(img, 0, 0, img.width, img.height, 0, 0, targetWidth, targetHeight);
                        try{
                            var dataUrl = that.canvas.toDataURL(type);
                            if(dataUrl.length > that.options.maxDataUrlLength && type != JPEG_TYPE){
                                //too large after scaling; try JPEG.
                                dataUrl = that.canvas.toDataURL(JPEG_TYPE);
                            }
                            if(dataUrl.length > that.options.maxDataUrlLength){
                                //even the JPEG is too large.  Force JPEG, shrink and retry
                                type = JPEG_TYPE;
                                jive.conc.nextTick(function(){
                                    scale(ratio * 0.8, promise);
                                });
                            }else{
                                promise.emitSuccess(dataUrl);
                            }
                        }catch(ex){
                            if(ex.code && ex.code == ex.SECURITY_ERR){
                                //Once the canvas is origin-dirty, it stays that way, so we need to discard it and re-init
                                that.canvas = null;
                                that.initCanvas();
                            }else{
                                throw ex;
                            }
                        }
                    }
                    scale(ratio, scaleFinished);
                }else if(!DATA_URL_RE.test(dataUrl)){
                    //The client image isn't a data URL, so to get one, go through the scale process
                    scale(1, scaleFinished);
                }else{
                    scaleFinished.emitSuccess(dataUrl);
                }
            }).attr("src", dataUrl).get(0);
        }

        if(this.isInitialized){
            doScale();
        }else{
            protect.initPromise.addCallback(doScale);
        }

        return scaleFinished;
    };

    /**
     * REST request to create an Image attachment from a data URL.
     * @param name Image file name.
     * @param dataUri The data URL with the image data in it.
     */
    this.create = function(name, dataUri){
        var that = this;
        var promise = new jive.conc.Promise();
        that.commonAjaxRequest(promise, 'POST', {
                url: that.getUrl(null, {name: name}),
                contentType: "text/plain",
                processData: false,
                data: dataUri
            });
        return promise;
    };

    /**
     * REST request to create an Image attachment from a data URL.
     * @param name Image file name.
     * @param imgSrc The data URL with the image data in it.
     */
    this.createFromImageSrc = function(name, imgSrc, restEndPoint){
        var that = this;
        var promise = new jive.conc.Promise();
        that.commonAjaxRequest(promise, 'POST', {
            url:  that.getUrl(null, {name: name}, restEndPoint),
            contentType: "application/x-www-form-urlencoded",
            processData: false,
            data: 'url=' + encodeURIComponent(imgSrc)
        });
        return promise;
    };

    //Upload a File object via XHR.  Requires XHR version 2, so we don't bother coddling IE.
    function xhrUploadFile(file, url, promise){
        try{
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/octet-stream; charset=UTF-8");
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01");
            xhr.setRequestHeader("X-J-Token", _jive_auth_token);
            xhr.onreadystatechange = function(){
                if(xhr.readyState == 4){
                    if(xhr.status >= 200 && xhr.status < 300){
                        promise.emitSuccess(JSON.parse(xhr.responseText));
                    }else{
                        promise.emitError(xhr.responseText);
                    }
                }
            };
            xhr.send(file);
            return promise;
        }catch(e){
            promise.emitError(e);
            return promise;
        }
    }

    /**Create an image by posting a File object to a REST service.
     *
     * @param file The File object to post.
     */
    this.postFile = function(file){
        var that = this;
        var promise = new jive.conc.Promise();
        xhrUploadFile(file, that.getUrl(null, {name: file.name, mimeType: file.type}), promise);
        return promise;
    };

    //TODO: this is currently not supported in ImageService.java
    this.update = function(id, dataUri){
        var that = this;
        var promise = new jive.conc.Promise();
        that.commonAjaxRequest(promise, 'PUT', {
            url: that.getUrl(id),
            contentType: "text/plain",
            processData: false,
            data: dataUri
        });
        return promise;
    };

    protect.getUrl = function(id, params, endpoint){
        //add defaultParams as query params.
        var paramMap = $j.extend({}, this.defaultParams, params || {});
        var queryStr = "?" + $j.param(paramMap);
        if(id){
            return (endpoint ? endpoint : this.RESOURCE_ENDPOINT) + '/' + id + queryStr;
        }else{
            return (endpoint ? endpoint : this.POST_RESOURCE_ENDPOINT) + queryStr;
        }
    };

    protect.getUploadUrl = function(){
        return this.getUrl("upload"); //hack, as it's not really an ID
    };
});

define('jive.rte.ImageService', function() {
    return jive.rte.ImageService;
});
