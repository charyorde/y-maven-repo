/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Looks like a REST service, but backed by a form element (or a descendent thereof) on the local page.
 * options:
 * container: an element or jQuery object specifying the container that the service should interact with.
 * name: the name to use for file inputs that should be posted with the form
 * attachments: a list of existing attachment objects
 * maxSize: attachment size restriction
 * maxFiles: the number of attachments restriction
 * disallowedTypes: file extensions not permitted to be attached
 *
 *
 */
jive.rte.FormAttachmentService = jive.oo.Class.extend(function(protect){

    function defaultErrorHandler(message, attachment){
        if(console){
            console.log(message, attachment);
        }
        $j("<div>" + message + "</div>").message({style: "error"});
    }

    function getFileExtension(filename) {
        return filename.substr(filename.lastIndexOf(".") + 1);
    }

    protect.init = function(options){
        this.container = options.container;
        this.name = options.name;
        this.attachments = options.attachments || [];
        this.maxSize = options.maxSize;
        this.maxFiles = options.maxFiles;
        this.allowByDefault = options.allowByDefault;
        this.attachmentExtensions = options.attachmentExtensions || [];
        this.hasAttachPerms = options.hasAttachPerms || false;

        for(var i = 0; i < this.attachmentExtensions.length; ++i){
            //strip off any leading dots
            this.attachmentExtensions[i] = getFileExtension(this.attachmentExtensions[i]);
        }
    };

    function extractFilename(path) {
        if (path.substr(0, 12) == "C:\\fakepath\\") {
            return path.substr(12);
        } // modern browser
        var lastSep = path.lastIndexOf('/');
        if (lastSep >= 0){ // Unix-based path
            return path.substr(lastSep + 1);
        }
        lastSep = path.lastIndexOf('\\');
        if (lastSep >= 0){ // Windows-based path
            return path.substr(lastSep + 1);
        }
        return path; // just the filename
    }

    this.save = function(attachment) {
        var promise = new jive.conc.Promise();
        promise.addErrback(defaultErrorHandler);

        if(this.attachments.length >= this.maxFiles){
            promise.emitError(jive.i18n.getMsg('attach.err.tooManyAttchmts.text'));
        }else{
            if(attachment.elem) {

                if (attachment.filename == null) {
                    attachment.filename = extractFilename($j(attachment.elem).val());
                }
                if (attachment.size == null && attachment.elem.files && attachment.elem.files[0] && attachment.elem.files[0].size) {
                    attachment.size = attachment.elem.files[0].size;
                }

                if(!this.isValidType(attachment)){
                    promise.emitError(jive.i18n.i18nText(jive.i18n.getMsg('attach.err.badContentType.text'), [attachment.filename]));
                }  else if (!this.isValidSize(attachment)) {
                    promise.emitError(jive.i18n.i18nText(jive.i18n.getMsg('attach.err.file_too_large.text'), [attachment.filename]));
                } else {

                    $j(attachment.elem)
                        .removeAttr('id')
                        .removeAttr('style')
                        .hide()
                        .attr("name", this.name)
                        .appendTo(this.container);

                    this.attachments.push(attachment);
                    promise.emitSuccess();
                }

            }else{
                promise.emitError(jive.i18n.getMsg('attach.err.upload_errors.text'));
            }
        }

        return promise;
    };

    this.findAll = function() {
        var promise = new jive.conc.Promise();
        promise.emitSuccess(this.attachments.slice());
        return promise;
    };

    this.destroy = function(attachment) {
        var promise = new jive.conc.Promise();

        promise.addErrback(defaultErrorHandler);
        var deleted = false;
        this.attachments = $j.map(this.attachments, function(val){
            if(!deleted && ((val.id != null && val.id == attachment.id) || (val.elem != null && val.elem == attachment.elem))){
                deleted = true;
                return null;
            }
            return val;
        });

        if(deleted && attachment.id){
            $j("<input type='hidden' name='removeAttachmentIDs[]' value='" + attachment.id + "'/>").appendTo(this.container);
        }

        if(deleted && attachment.elem){
            $j(attachment.elem).remove();
        }

        if(deleted){
            promise.emitSuccess();
        }else{
            promise.emitError("attachment not found", attachment);
        }
        return promise;
    };

    this.getRestrictions = function(){
        var promise = new jive.conc.Promise();
        promise.emitSuccess({
            maxSize: this.maxSize,
            maxFiles: this.maxFiles,
            allowByDefault: this.allowByDefault,
            attachmentExtensions: this.attachmentExtensions,
            hasAttachPerms: this.hasAttachPerms
        });
        return promise;
    };

    protect.isValidType = function(attachment) {
        var validFileType = false;
        var filename = attachment.filename;
        var extension = getFileExtension(filename);
        if(this.allowByDefault && this.attachmentExtensions.indexOf(extension) < 0){
            validFileType = true;
        }else if (!this.allowByDefault && this.attachmentExtensions.indexOf(extension) >= 0){
            validFileType = true;
        }
        return  validFileType;
    };

    protect.isValidSize = function(attachment) {
        // for IE  rely on the server side validation for the max size
        return  attachment.size == null || this.maxSize >= attachment.size
    }





});