/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */


// Plugin to handle the attachment UI. The plumbing is the responsibility of the containing page via the attachmentService.
(function() {
    var dom = tinymce.DOM; //the document for this instance of DOMUtils is the outer document.

    var FILE_TYPE_MAP = {
        "pdf": "acrobat",

        "zip": "compressed",
        "tgz": "compressed",
        "tar": "compressed",
        "gz": "compressed",
        "bz2": "compressed",
        "jar": "compressed",

        "doc": "document",
        "docx": "document",
        "htm": "document",
        "html": "document",
        "rtf": "document",
        "odt": "document",

        "png": "image",
        "gif": "image",
        "jpg": "image",
        "tiff": "image",

        "ppt": "presentation",
        "pptx": "presentation",
        "odp": "presentation",

        "xls": "spreadsheet",
        "xlsx": "spreadsheet",
        "ods": "spreadsheet",

        "txt": "text",

        "swf": "video",
        "wmv": "video",
        "mov": "video"
    };
    /**
    * Displays a floating attachment button anchored to the lower-right corner of the editor.  The button lets you
    * manage existing attachments and attach more items via a modal UI.  The button is also a drag target.
    *
    */
    tinymce.create('tinymce.plugins.JiveAttachmentPlugin', {
        rte: null,
        initialized: false,

        button: null,
        attachmentBlock: null,

        setRTE : function(rte){
            this.rte = rte;
            this.completeInit();
        },

        completeInit : function(){
            if(this.rte && this.ed && !this.initialized && this.rte.getAttachmentService()){
                this.initialized = true;
                var ed = this.ed,
                    that = this;

                this.button = dom.create("div", {
                    "class": "gutterButton attachmentButton"
                });
                var lbl = dom.create("label", null, ed.getLang("jiveattachment.button_label"));
                lbl.insertBefore(dom.create("span", {"class": "jive-icon-med jive-icon-attachment"}), lbl.firstChild);
                this.button.appendChild(lbl);


                this.attachmentBlock = dom.create("div", {
                    "class": "js-attachment-block jive-attachments"
                });

                this.rte.getGutter().appendChild(this.button);
                this.rte.getBelowEditorArea().appendChild(this.attachmentBlock);

                this._refresh();
            }
        },

        init : function(ed){
            this.ed = ed;
        },

        _setHasAttachments: function(hasAttachments){
            if(hasAttachments){
                $j(".jive-icon-attachment", this.button).addClass("green");
                $j(this.attachmentBlock).show();
            }else{
                $j(".jive-icon-attachment", this.button).removeClass("green");
                $j(this.attachmentBlock).hide();
            }
            this.rte.autoReposition();
        },

        _refresh: function(){
            function getDocType(filename){
                if(filename){
                    var suffix = filename.substr(filename.lastIndexOf(".")+1).toLowerCase();
                    var type = FILE_TYPE_MAP[suffix];
                }
                return type || "generic";
            }
            var that = this;
            this.rte.getAttachmentService().getRestrictions().addCallback(function(restrictions){
                that.getAttachments().addCallback(function(attachments){
                    for(var i = 0; i < attachments.length; ++i){
                        attachments[i].doctype = getDocType(attachments[i].filename);
                    }
                    that.attachmentBlock.innerHTML = jive.rte.attachment.attachmentBlock({
                        restrictions: restrictions,
                        attachments: attachments
                    });

                    that._setHasAttachments(attachments.length > 0);

                    $j("a.js-attachment-remove", that.attachmentBlock).each(function(attachmentIndex, removeButton){
                        $j(removeButton).click(function(){
                            that.removeAttachment(attachments[attachmentIndex]).addCallback(function(){
                                that._refresh();
                            });
                            return false;
                        });
                    });

                    $j(".js-attachment-button-label", that.attachmentBlock).click(function(){
                        $j(".js-attachment-list", that.attachmentBlock).toggle();
                        return false;
                    });

                    if (restrictions.hasAttachPerms && attachments.length < restrictions.maxFiles) {
                        $j(that.button).show();
                        that._initAttachmentButton();
                    } else {
                        $j(that.button).hide();
                    }
                });
            });
        },

        _initAttachmentButton: function(){
            var that = this;
            var $fileInput = $j("input[type='file']", this.button);
            if($fileInput.length == 0){
                $fileInput = $j(this._createFileInput());
            } else {
                // Force the file input to be reset to allow same file to be re-selected
                this.button.innerHTML = this.button.innerHTML;
                $fileInput = $j("input[type='file']", this.button);
            }

            var $lbl = $j("label", this.button);
            $lbl.append($fileInput);

            $fileInput.unbind('change');

            $fileInput
                .css({
                    position: "absolute",
                    opacity: 0,
                    display: "block",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    "z-index": 1 //high enough to be on top of the editor.
                }).change(function(evt){
                    that.addAttachment({elem: this}).always(function(){
                        that._refresh();
                    });
                }).focus(function(){
                    $fileInput.parent().addClass("focused");
                }).blur(function(){
                    $fileInput.parent().removeClass("focused");
                });

            if(tinymce.isIE7){
                $fileInput.css({
                    width: "60px",
                    height: "19px"
                });
            }
        },

        _createFileInput: function(){
            return dom.create("input", {
                "type": "file"
            });
        },

        getAttachments: function(){
            return this.rte.getAttachmentService().findAll();
        },

        addAttachment: function(attachment){
            var attachmentService = this.rte.getAttachmentService();
            return attachmentService.save(attachment);
        },

        removeAttachment: function(attachment){
            var attachmentService = this.rte.getAttachmentService();
            return attachmentService.destroy(attachment);
        },

        getInfo : function() {
            return {
                longname : 'Jive Attachment',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
        }
    });
    // Register plugin
    tinymce.PluginManager.add('jiveattachment', tinymce.plugins.JiveAttachmentPlugin);
})();
