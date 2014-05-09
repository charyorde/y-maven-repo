/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
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
if(!jive.Wall.VideoLinkMetaSource){

jive.Wall.VideoLinkMetaSource = jive.Wall.MetaSource.extend({
init: function() {
        this.META_ENDPOINT = jive.rest.url("/meta");
    },
    create: function(wallEntry, data, callback) {
        var params = {
            contentObjectType: wallEntry.objectType,
            object: wallEntry.objectId,
            videoURL:data.videoURL
        };
        var that = this;
        var options = {
            url: jive.action.url("video-link-meta", params),
            dataType: "json",
            success: function(metaContent) {
                that.fetch(metaContent.id, callback);
            }
        };

        $j.ajax(options);
    },
    fetch: function(id, callback) {
        var options = {
            type: "GET",
            url: this.META_ENDPOINT + "/" + id,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                if(data.meta.length > 0){
                    data = jive.Wall.VideoLinkMetaSource.normalizeData(data);

                    callback(data.meta);
                } else {
                    console.log('Error jive.Wall.VideoLinkMetaSource fetch no meta data:' + data);
                }
            }
        };

        $j.ajax(options);
    }
});

jive.Wall.VideoLinkMetaSource.normalizeData = function(data){
    if(data.meta && data.meta.length > 0){
        // normalize the mess that apache cxf returns for properties
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

}
