/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('content.documents');

/**
 * The custom upload view that adds an automated document title population
 *
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/apps/content/common/view.js
 * @depends path=/resources/scripts/apps/shared/controllers/file_input.js
 *
 * @depends i18nKeys=doc.upload.err.doc_too_lrg.text
 * @depends i18nKeys=doc.upload.err.contnt_type.text
 *
 */
jive.content.documents.UploadView = jive.content.common.View.extend(function(protect, _super) {
    
    var subject;
    
    this.init = function(options) {
        _super.init.call(this, options);

        // for existing show the title
        if (options.actionBean.subject) {
            subject = options.actionBean.subject;
            $j("#subject").attr('value', subject);
            $j('#jive-upload-doc-title').show();
        }

        // office integration popup
        $j('#officeintegration').click(function() {
            $j("#jive-office-plugin-download").popover({
                context: $j("#jive-plugin-popup"),
                destroyOnClose: false
            });
            return false;
        });

        this.maxSize = options.binaryBodyConfig.maxFileSize;
        this.fileExtensions = options.binaryBodyConfig.fileExtensions || [];
        this.allowByDefault = options.binaryBodyConfig.allowAllByDefault;
        this.fromQuest = options.fromQuest;

        for (var i = 0; i < this.fileExtensions.length; ++i) {
            //strip off any leading dots
            this.fileExtensions[i] = getFileExtension(this.fileExtensions[i]);
        }

        var view = this;

        define(['jive.FileInput'], function(FileInput) {
            var files = view.fromBodyBean(options.actionBean.binaryBodyBean);
            var input = new FileInput('#uploadFile', { files: files });
            if(input.dragAndDrop()){
                $j('.js-file-upload').addClass('j-file-drag-and-drop');
                $j('#jive-compose-current-details').remove();
            }

            // validate the file size and content type display the file name as a title
            input.addListener('change', function(files) {
                var file, error, size, filename;

                if (typeof files === 'object' && files.type === 'file' && files.nodeType === 1) {
                    file = files;
                    filename = extractFilename(file.value);

                    if (file.files && file.files[0] && file.files[0].size) {
                        size = file.files[0].size;
                    }
                }
                else if (files.length > 0) {
                    file = files[0];
                    size = file.size;
                    filename = file.name;
                }

                if (filename) {  // true if a file was selected, false if file input was cleared
                    if (!view.isValidType(filename)) {
                        error = jive.i18n.getMsg('doc.upload.err.contnt_type.text');
                    } else if (!view.isValidSize(size)) {
                        error = jive.i18n.getMsg('doc.upload.err.doc_too_lrg.text');
                    }

                    if (error) {
                        // We need to get a fresh validator instance
                        // because the file input on the form may have
                        // been dynamically replaced.  But we don't want
                        // to call `new jive.Validator()` because that
                        // would set up a bunch of event handlers that
                        // we don't want here.
                        var validator = jive.Validator.prototype.getValidator.call({
                            options: {
                                form: view.getContent()
                            }
                        });

                        var invalidFields = {};
                        invalidFields.uploadFile = error;
                        validator.invalidate(invalidFields);
                        input.reset();
                        if (!subject) {
                            $j("#subject").attr('value', '');
                        }
                    } else {
                        //clear out global error messages
                        view.getContent().prev('.jive-error-box').remove();
                        view.getContent().find('.jive-error-message').remove();

                        $j('#jive-upload-doc-title').show();
                        
                        // if the subject was defined for the edit - don't change it
                        if (!subject)  {
                            $j("#subject").attr('value', filename);       
                        }                       
                    }
                } else {   
                    if (!subject) {
                        $j("#subject").attr('value', '');
                    }
                    $j('#jive-upload-doc-title').hide();
                }
            });
        });

    };

    function getFileExtension(filename) {
        return filename.substr(filename.lastIndexOf(".") + 1);
    }

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


   protect.isValidType = function(filename) {
        var validFileType = false;
        var extension = getFileExtension(filename);
        if(this.allowByDefault && this.fileExtensions.indexOf(extension) < 0){
            validFileType = true;
        }else if (!this.allowByDefault && this.fileExtensions.indexOf(extension) >= 0){
            validFileType = true;
        }
        return  validFileType;
    };

    protect.isValidSize = function(size) {
        // for IE  rely on the server side validation for the max size
        return  size == null || this.maxSize >= size;
    };

    protect.fromBodyBean = function(bean) {
        var file;

        if (bean) {
            file = { name: bean.name, uploadDate: bean.uploadDate };

            if (typeof bean.size === 'string') {
                file.size = 0;
                file.formattedSize = bean.size;
            } else {
                file.size = bean.size;
            }

            return [file];
        } else {
            return [];
        }
    };

});
