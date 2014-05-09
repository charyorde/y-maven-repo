/* jive-storage.js */

/*

The "jive-storage-1.0.0" feature provides a JS function to trigger a dialog for uploading binary app data.

Within Main SBS codebase:
- jive-storage.js      : the JS for the jive-storage-1.0.0 feature, for an app dev to call requestAppDataMediaItemUpload
- app-dashboard.js     : sets up the Gadgets RPC listener - request_upload_app_data_media_item
- app-rpc.js           : the main class for each jive app - contains the requestUploadAppDataMediaItem method
- app-file-uploader.js : all the javascript in the pop-up itself - showing it, submitting it, form validation, etc...
- apps.base             : renderAppDataUploadPopup - the soy template for the popup. used within app-file-uploader.js

Example App:
- http://svn.jiveland.com/svn/repos/jaf/apps/example/opensocial/request_app_data_upload.xml

Some docs about OSAPI UI functions
- http://wiki.opensocial.org/index.php?title=OSAPI_Specification#osapi.ui

 */

jive.namespace('opensocial', {

    requestAppDataMediaItemUpload: function(key, opt_params, callback) {
        var rpcCallback = function(item) {
            var mimeType= item['mimeType']
            var url     = item['url'];
            var options = item;
            delete options.mimeType;
            delete options.url;

            var mediaItem = opensocial.newMediaItem(mimeType, url, options);
            if (mediaItem.fields_) {
                mediaItem = mediaItem.fields_;
            }

            if(typeof callback === 'function') {
                callback(mediaItem)
            }
        }

        var token = shindig.auth.getSecurityToken();
        gadgets.rpc.call( null, "request_upload_app_data_media_item", rpcCallback, key, opt_params, token);
    }

});
