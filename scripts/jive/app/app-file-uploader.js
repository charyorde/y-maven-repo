/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 *
 */
define('jive.AppFileUploader', ['jquery'], function($j) {
return $Class.extend({

    init: function(app, key, options, token, callback) {
        this.app           = app;
        this.key           = key;
        this.callback      = callback;
        this.element       = null;
        this.token         = token;

        this.options = $j.extend({
            showTitle       : false,
            showDescription : false,
            dialogTitle     : this.app.title,
            submitText      : 'Upload',
            core            : false,
            validExtensions : []
        }, options || {});

        this.showDialog();
    },

    showDialog: function() {
        var uploader = this;

        $j('body').append('<div class="jive-modal" id="app-upload-modal-content" style="display:none;"></div>');
        this.element = $j('#app-upload-modal-content');

        var options = this.options || {};

        // Add the token to prevent XSS
        if (typeof options.actionUrl === "undefined") {
            var encodedToken = "";
            if (this.token) {
                encodedToken = encodeURIComponent(this.token);
            }
            options.actionUrl =
                options.actionUrl || '/social/rpc?responseFormat=html' + (encodedToken ? '&st=' + encodedToken : '');
        }

        //console.log(options.actionUrl);
        var html = $j(jive.apps.base.renderAppDataUploadPopup({options: options}));
        this.element.html( html )
            .lightbox_me({closeSelector: '.close', destroyOnClose: true})
            .find('iframe')
                .bind('load', function(){uploader.handleIframeLoad();})
            .end()
            .find('input[type=submit]')
                .click(function() {
                    if(uploader.isValid()) {
                        uploader.setRequestParams();
                    } else {
                        return false;
                    }
                });
    },

    isValid: function() {
        if(this.isFileBlank()) {
            this.showError('File is required!');
            return false;
        } else if (this.isFileExtensionInvalid()) {
            this.showError('File is invalid. Valid extensions: ' + this.options.validExtensions.join(', '));
            return false;
        }
        return true;
    },

    isFileBlank: function() {
        return this.element.find("input[type=file]").val() === '';
    },

    isFileExtensionInvalid: function() {
        // if validExtensions array has values in it, check if the file's extension is in the array
        return this.options.validExtensions.length > 0
            && $j.inArray($j(this.element.find("input[type=file]").val().split('.')).last()[0], this.options.validExtensions) == -1;
    },

    showError: function(message) {
        this.element.find('div.jive-error-box').show().find('span.message').html(message);
    },

    hideError: function() {
        this.element.find('div.jive-error-box').hide();
    },

    setRequestParams: function() {
        this.element.find('input[name=request]').val(JSON.stringify(this.generateRequestParams()));
    },

    generateRequestParams: function() {
        var requestParams = [{
            'method' :'appdata.uploadContent',
            'params' : {
                'appId'   : '@app',
                'userId'  : ['@viewer'],
                'groupId' : '@self',
                'fields'  : [this.key],
                'data'    : {}
            },
            'id':'key'
        }];

        var data = {'url' : '@field:file'};

        if(this.options.showTitle) {
            var title       = $j("#app-upload-modal-content input[name=title]").val();
            if(title.length > 0) {
                data.title = title;
            }
        }

        if(this.options.showDescription) {
            var description = $j("#app-upload-modal-content textarea[name=description]").val();
            if(description.length > 0) {
                data.description = description;
            }
        }

        requestParams[0]['params']['data'][this.key] = data;
        return requestParams;
    },

    handleIframeLoad: function() {
        var iframeId = "jive-modal-file-upload-iframe";
        var iframe = document.getElementById(iframeId);

        var doc;
        var uploadIframeException = null;

        try {
            if (iframe.contentDocument) {
                doc = iframe.contentDocument;
            } else if (iframe.contentWindow) {
                doc = iframe.contentWindow.document;
            } else {
                doc = window.frames[iframeId].document;
            }
        } catch (ex) {
            // this is mostly due to IE disallow access to iframe document for HTTP status other than 200
            uploadIframeException = ex;
        }

        var responseJSON = {};
        if (uploadIframeException !== null) {
            // looks like IE cross domain issue is encountered when HTTP response status is not 200
            var responseJSONString = '{"code":"4005","message":"Access denied to object"}';
            responseJSON = JSON.parse(responseJSONString);
        } else if (doc.location.href == "about:blank") {
            return;
        } else {
            responseJSON = {};
        }

        // if its a Jive Core API image, just return the outer JSON object
        var item;
        if(this.options.core === true) {
          item = responseJSON;
          this.callback(item);
          $j("#app-upload-modal-content").trigger('close');
        
        // if its a OpenSocial AppData object, parse the value of the app-data key, containing JSON for a mediaItem
        } else if($j.isArray(responseJSON) && responseJSON[0]['result'] && responseJSON[0]['result']) {
            var result = this.getValue(responseJSON[0]['result']);
            if (result && result[this.key]) {
                item = result[this.key];
                this.callback(JSON.parse(item));
                $j("#app-upload-modal-content").trigger('close');
            }
        }
    },

    getValue: function (obj) {
        var result = null;
        $j.each(obj, function(key, value) { result = value; });
        return result;
    }

});
});
