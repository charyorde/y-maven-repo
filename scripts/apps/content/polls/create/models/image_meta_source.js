/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends path=/resources/scripts/apps/content/polls/create/models/meta_source.js
 */

jive.namespace('content.polls');

jive.content.polls.ImageMetaSource = jive.content.polls.MetaSource.extend({

    init: function() {
        this.META_ENDPOINT = jive.rest.url("/meta");
    },
    create: function(pollOption, data, successCallback, errorCallback) {
        // Can't use error function call because uploading a file via ajax uses a iframe.
        // http://forum.jquery.com/topic/jquery-ajaxsubmit-error. error method still in place because it might work in
        // the future. 
        var that = this;
        var options = {
            url: jive.rest.url("/meta/image/"+pollOption.objectType+"/"+pollOption.id+"/attachment"),
            dataType: "xml",
            contentType: "text/xml; charset=utf-8",
            complete : function(metaContent) {
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
                var code = $j(data.responseXML).find('code').text();
                var message = $j(data.responseXML).find('message').text();
                errorCallback(data, message, code);
            }

        };
        data.ajaxSubmit(options);
    },
    fetch: function(id, callback, errorCallback) {
        var options = {
            type: "GET",
            url: this.META_ENDPOINT + "/" + id,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                if(data.meta.length > 0){
                    callback(data.meta);
                } else {
                    console.log('Error jive.content.polls.ImageMetaSource fetch no meta data:' + data);
                }
            },
            error: function(data, textStatus, errorThrown) {
                console.log('Error jive.content.polls.ImageMetaSource fetch' + data + ', ' + textStatus + ', ' + errorThrown);
                errorCallback(data, textStatus, errorThrown);
            }
        };

        $j.ajax(options);
    }
});