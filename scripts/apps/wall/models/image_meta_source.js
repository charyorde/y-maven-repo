jive.namespace('Wall');

/**
 * Make sure we only include this file once per page load.  If we do not have this block here there are 2 cases where
 * this script could be loaded multiple times:
 * 1) When resource combined is false behavior could be different from when it's on, ideally the behavior should be the same.
 * 2)  If an ajax request is made for an ftl with javascript includes the file will be reloaded (assuming it was already
 * loaded on page load)
 *
 * At a later date we can roll this work into namespace or a new function that is similar to namespace
 */
if(!jive.Wall.ImageMetaSource){

jive.Wall.ImageMetaSource = jive.Wall.MetaSource.extend({
    init: function() {
        this.META_ENDPOINT = jive.rest.url("/meta");
    },
    create: function(wallEntry, data, successCallback, errorCallback, isImageURL) {
        // Can't use error function call because uploading a file via ajax uses a iframe.
        // http://forum.jquery.com/topic/jquery-ajaxsubmit-error. error method still in place because it might work in
        // the future. 
        var that = this;

        // image service's json provider is broken, use imageJackson service instead
        //var postURL = jive.rest.url("/meta/image/"+wallEntry.objectType+"/"+wallEntry.objectId+"/attachment");
        var postURL = jive.rest.url("/meta/imageJackson/"+wallEntry.objectType+"/"+wallEntry.objectId+"/attachment");
        var imageURL = "";

        if (isImageURL) {
           console.log("Got image url");
           imageURL = encodeURIComponent(data.find('input[name=imageURL]').val());
           // image service's json provider is broken, use imageJackson service instead
           //postURL = jive.rest.url("/meta/image/"+wallEntry.objectType+"/"+wallEntry.objectId);
           postURL = jive.rest.url("/meta/imageJackson/"+wallEntry.objectType+"/"+wallEntry.objectId);
        }

        var options = {
            url: postURL,
            dataType: "xml",
            data : {imageURL : imageURL },
            contentType: "text/xml; charset=utf-8",
            complete: function(metaContent, status) {
                if ($j(metaContent.responseXML).find('meta id').length > 0) {
                  that.fetch($j(metaContent.responseXML).find('meta id').text(), successCallback, errorCallback);
                }
                else {
                    var code = $j(metaContent.responseXML).find('code').text();
                    var message = $j(metaContent.responseXML).find('message').text();
                    errorCallback(metaContent, message, code);
                }
            },
            error: function(data, textStatus, errorThrown) {
                console.log('Error jive.Wall.ImageMetaSource create' + data + ', ' + textStatus + ', ' + errorThrown);
                var code = $j(data.responseXML).find('code').text();
                var message = $j(data.responseXML).find('message').text();
                errorCallback(data, message, code);
            }
        };
        
        if(isImageURL){
            // clear out value in file input element
            var imageInput = data.find('input[name=image]');
        	if(imageInput.length > 0){
                imageInput.val('');
            }
        } else {
        	// clear out value in the imageURL input element
            data.find('input[name=imageURL]').val('');
        }

        data.ajaxSubmit(options);
    },
    fetch: function(id, successCallback, errorCallback) {
        var options = {
            type: "GET",
            url: this.META_ENDPOINT + "/" + id,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                if(data.meta.length > 0){
                    var attachment = data.meta[0];

                    successCallback(data.meta);
                } else {
                    console.log('Error jive.Wall.ImageMetaSource fetch no meta data:' + data);
                    errorCallback(data, null, null);
                }
            },
            error: function(data, textStatus, errorThrown) {
                console.log('Error jive.Wall.ImageMetaSource fetch' + data + ', ' + textStatus + ', ' + errorThrown);
                errorCallback(data, textStatus, errorThrown);
            }
        };

        $j.ajax(options);
    }
});

}