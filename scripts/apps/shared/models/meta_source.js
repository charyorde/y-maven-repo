/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Meta services.
 *
 * @class
 * @extends jive.RestService
 * @param {Object}  options
 *
 * @depends path=/resources/scripts/jive/rest.js
 * @depends path=/resources/scripts/jive/action.js
 */
jive.MetaSource = jive.RestService.extend(function(protect) {
    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    /**
     * Set to "activity-stream"; configures the REST endpoints that instances of this
     * class connect to.
     *
     * @name resourceType
     * @fieldOf jive.MicroBlogging.MicroBloggingSource#
     * @type string
     * @protected
     */
    protect.resourceType = "meta";
    /**
     * Don't want a pluralizedResourceType, set this to resourceType
     *
     * @name pluralizedResourceType
     * @fieldOf jive.MicroBlogging.MicroBloggingSource#
     * @type string
     * @protected
     */
    protect.pluralizedResourceType = protect.resourceType;

    this.createLink = function(linkURL){
        var promise = new jive.conc.Promise(),
            self = this,
            options = {
                url: jive.action.url("link-meta", {url: encodeURIComponent(linkURL)}),
                dataType: "html",
                success: function(data) {
                    console.log("jive.MetaSource.createLink SUCCESS " + data);
                    promise.emitSuccess(data);
                },
                error : function(data) {
                    console.log("jive.MetaSource.createLink ERROR " + data);
                    self.errorCallback(promise, this.errorSaving);
                }
            };

        $j.ajax(options);
        return promise;
    };

    this.createVideo = function(wallEntry, videoURL) {
        var promise = new jive.conc.Promise(),
            self = this,
            params = {
                contentObjectType: wallEntry.objectType,
                object: wallEntry.objectId,
                videoURL:encodeURIComponent(videoURL)
            },
            options = {
                url: jive.action.url("video-link-meta", params),
                dataType: "json",
                success: function(data) {
                    console.log("jive.MetaSource.createVideo SUCCESS " + data);
                    promise.emitSuccess(data);
                },
                error : function(data) {
                    console.log("jive.MetaSource.createVideo ERROR " + data);
                    self.errorCallback(promise, this.errorSaving);
                }
            };

        $j.ajax(options);
        return promise;
    };

    this.normalizeVideoData = function(data){
        if(data.meta && data.meta.length > 0){
            // normalize the mess that jabx json provider returns for properties
            data.meta.forEach(function(dataObj){
                var oldProps = dataObj.properties;
                if(oldProps != undefined){
                    var newProps = {};
                    if(oldProps.entry != undefined && oldProps.entry.length != 0){
                        var entry = oldProps.entry;
                        for(var i = 0; i < entry.length; i++){
                            newProps[entry[i].key] = entry[i].value;
                        }
                    }
                    dataObj.properties = newProps;
                }
            });
        } else {
            data.meta = [];
        }

        return data;  
    };

    this.createImage = function(wallEntry, imageURLParam, isImageURL, $form){
        // Can't use error function call because uploading a file via ajax uses a iframe.
        // http://forum.jquery.com/topic/jquery-ajaxsubmit-error. error method still in place because it might work in
        // the future.
        var self = this,
            postURL = this.RESOURCE_ENDPOINT + '/imageJackson/' + wallEntry.objectType + '/' + wallEntry.objectId + '/attachment',
            imageURL = "",
            promise = new jive.conc.Promise();

        if (isImageURL) {
           console.log("Got image url");
           imageURL = encodeURIComponent(imageURLParam);
           postURL = this.RESOURCE_ENDPOINT + '/imageJackson/' + wallEntry.objectType + '/' + wallEntry.objectId;
        }

        var options = {
            url: postURL,
            dataType: "xml",
            data : {imageURL : imageURL },
            contentType: "text/xml; charset=utf-8",
            complete: function(metaContent, status) {
                if ($j(metaContent.responseXML).find('meta id').length > 0) {
                    self.fetch($j(metaContent.responseXML).find('meta id').text())
                        .addCallback(function(data) {
                            promise.emitSuccess(data);
                        // Run a callback when an error occurs during
                        // the server call.
                        }).addErrback(function(message, status) {
                            self.errorCallback(promise, this.errorSaving);
                        });
                } else {
                    var code = $j(metaContent.responseXML).find('code').text();
                    var message = $j(metaContent.responseXML).find('message').text();
                    promise.emitError(message, code);
                }
            },
            error: function(data, textStatus, errorThrown) {
                console.log('Error jive.Wall.ImageMetaSource create' + data + ', ' + textStatus + ', ' + errorThrown);
                var code = $j(data.responseXML).find('code').text();
                var message = $j(data.responseXML).find('message').text();
                self.errorCallback(promise, this.errorSaving);
            }
        };


        if(isImageURL){
            // clear out value in file input element
            var imageInput = $form.find('input[name=image]');
        	if(imageInput.length > 0){
                imageInput.val('');
            }
        } else {
        	// clear out value in the imageURL input element
            $form.find('input[name=imageURL]').val('');
        }

        $form.ajaxSubmit(options);
        return promise;
    };

    this.fetch = function(id) {
        var url = this.RESOURCE_ENDPOINT + '/' + id;
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url});
    };

    this.remove = function(id) {
        var url = this.RESOURCE_ENDPOINT + '/remove/' + id;
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url});  
    };
});
