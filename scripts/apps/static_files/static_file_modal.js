/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/**
 * @depends template=jive.staticFileStore.soy.*
 * @depends path=/resources/scripts/jquery/jquery.lightbox_me.js
 * @depends path=/resources/scripts/jquery/swfobject.js
 * @depends path=/resources/scripts/jquery/jquery.jivefilebutton.js
 * @depends path=/resources/scripts/zeroclipboard/zeroclipboard.js
 */
define('jive.staticFileModalView', [
    'jquery',
    'ZeroClipboard'
], function($, ZeroClipboard) {
    return jive.AbstractView.extend(function(protect, _super) {
        this.init = function (options) {
            _super.init.call(this, options);
            var view = this;
            this.staticFileList = options.staticFiles;
            this.placeObj = options.placeObj;
            this.containerType = options.containerType;
            this.showCopyToClipboardButtons = false;
            if (swfobject.hasFlashPlayerVersion("9")) {
                this.showCopyToClipboardButtons = true;
                this.clips = {};
            }
            this.$modal = $j(jive.staticFileStore.soy.modal({
                staticFiles: this.staticFileList,
                postURI: this.placeObj.resources.statics.ref,
                containerType: this.containerType,
                showCopyToClipboardButtons: this.showCopyToClipboardButtons
            }));
            this.$modal.lightbox_me({
                destroyOnClose: true,
                onLoad: function() {
                    jive.rte.renderedContent.emit("renderedContent", view.$modal);
                    var $submitForm = view.$modal.find("#j-upload-static-submit-form");
                    if (view.showCopyToClipboardButtons) {
                        ZeroClipboard.setMoviePath( jive.app.url({
                            path: '/resources/scripts/zeroclipboard/ZeroClipboard.swf'
                        }));
                        view.generateClipClients();
                    }
                    $('#j-static-file-upload-btn').jiveFileButton({ name: 'j-static-file-upload' })
                        .bind('choose', function(e, $input) {
                            $submitForm.find('input').remove();
                            $submitForm.prepend($input);
                            $submitForm.submit();
                        });
                    $submitForm.on('submit', function(e) {
                        e.preventDefault();
                        var fileName = view.getFilename();
                        var options = {
                                dataType: 'xml',
                                data: {'json': "{'filename': '"+fileName+"'}"},
                                beforeSubmit: function(formData, $form, options) {
                                    if(!getCookie("X-JCAPI-Token")) {
                                        setCookie("X-JCAPI-Token", _jive_auth_token, null,'/' );
                                    }

                                    if ($form.find('input[name="j-static-file-upload"]').val() === "") {
                                        view.clearFileFromSubmitForm();
                                        return false;
                                    }
                                },
                                success: function(response, status, xhr) {
                                    //response is in html doc format
                                    try {
                                        var $respHTMLBody = $(response).find('body');
                                        if ($respHTMLBody.length) {
                                            response = JSON.parse($respHTMLBody.text());
                                        }
                                    }
                                    catch (e) {
                                        view.displayErrorMessage("unknown");
                                        view.clearFileFromSubmitForm();
                                    }
                                    if (response.error && response.error.status == 409) {
                                        view.replaceFile(fileName);
                                    }
                                    else if (response.error && response.error.status == 400) {
                                        if (response.error.context == "maxSize" ||
                                            response.error.context == "maxCount") {
                                            view.displayErrorMessage(response.error.context, response.error.constraint);
                                        }
                                        else {
                                            view.displayErrorMessage("unknown");
                                        }
                                        view.clearFileFromSubmitForm();
                                    }
                                    else {
                                        view.clearFileFromSubmitForm();
                                        view.updateFileList();
                                    }
                                },
                                error: function(response, status, err){
                                    view.displayErrorMessage("unknown");
                                    view.clearFileFromSubmitForm();
                                }
                            };
                        $(this).ajaxSubmit(options);
                        return false;
                    });
                    view.$modal.on('click', '.js-delete-static', function(e) {
                        e.preventDefault();
                        var $deleteLink = $(this),
                            $fileListItem = $deleteLink.closest('.js-static-file'),
                            fileID = $fileListItem.data('id'),
                            $confirmationModal = $j(jive.staticFileStore.soy.deleteFileConfirmation());
                        $confirmationModal.lightbox_me({destroyOnClose: true, centered: true, zIndex: 1000,
                            onLoad:function(){
                                $confirmationModal.delegate('#file-delete-submit-button', 'click', function(e2) {
                                    var $button = $j(this);
                                    view.emitP('deleteFile', fileID).addCallback(function(newFileList) {
                                        $confirmationModal.trigger('close');
                                        view.$modal.find('#j-static-file-list-container').replaceWith(
                                            jive.staticFileStore.soy.staticFileList({
                                                staticFiles: newFileList,
                                                showCopyToClipboardButtons: view.showCopyToClipboardButtons
                                            }));
                                        if (view.showCopyToClipboardButtons) {
                                            view.generateClipClients();
                                        }
                                    });
                                    e2.preventDefault();
                                });
                            }
                        });
                    });
                    if (!view.showCopyToClipboardButtons) {
                        view.$modal.on('click', '.js-url', function(e) {
                            var $url = $j(this);
                            view.selectText($url.attr('id'));
                        });
                    }
                }
            })
        };
        this.clearFileFromSubmitForm = function() {
            $('#j-upload-static-submit-form input[name="j-static-file-upload"]').remove();
        };
        this.updateFileList = function() {
            var view = this;
            view.emitP('getList').addCallback(function(newFileList) {
                view.$modal.find('#j-static-file-list-container').replaceWith(jive.staticFileStore.soy.staticFileList({
                    staticFiles: newFileList,
                    showCopyToClipboardButtons: view.showCopyToClipboardButtons
                }));
                if (view.showCopyToClipboardButtons) {
                    view.generateClipClients();
                }
                jive.rte.renderedContent.emit("renderedContent", view.$modal);
            });
        };
        this.replaceFile = function(fileName) {
            var view = this,
                dupeFileID = view.$modal.find('li[data-filename="'+fileName+'"]').data('id'),
                $replaceModal = $j(jive.staticFileStore.soy.replaceFileConfirmation());
            $replaceModal.lightbox_me({destroyOnClose: true, centered: true, zIndex: 1000,
                onLoad:function(){
                    $replaceModal.delegate('#file-replace-submit-button', 'click', function(e2) {
                        var $button = $j(this);
                        $replaceModal.trigger('close');
                        view.emitP('deleteFile', dupeFileID).addCallback(function(newFileList) {
                            view.$modal.find('#j-upload-static-submit-form').submit();
                        });
                        e2.preventDefault();
                    });
                }
            });
        };
        this.generateClipClients = function() {
            var view = this;
            for (var key in view.clips) {
                view.clips[key].destroy();
            }
            view.$modal.find('.js-static-file').each(function() {
                var $fileLI = $(this),
                    id = $fileLI.data('id')+'';
                view.clips[id] = new ZeroClipboard.Client();
                view.clips[id].setText($fileLI.find('.js-url').text());
                view.clips[id].setHandCursor( true );
                view.clips[id].setCSSEffects( true );
                view.clips[id].glue( 'd_clip_button_'+id, 'd_clip_container_'+id );
                view.clips[id].addEventListener('onComplete', function(client) {
                    var $clipContainer = $('#d_clip_container_'+id);
                    $clipContainer.parent().find('.js-copied').remove();
                    var $copiedConfirmation = $(jive.staticFileStore.soy.copiedConfirmation())
                    $('#d_clip_container_'+id).after($copiedConfirmation);
                    $copiedConfirmation.delay(2000).fadeOut('slow', function() {
                        $copiedConfirmation.remove();
                    });
                })
            });
        };
        this.getFilename = function() {
            var view = this,
                fullPath = view.$modal.find('input[name="j-static-file-upload"]').val();
            if (fullPath) {
                var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
                var filename = fullPath.substring(startIndex);
                if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
                    filename = filename.substring(1);
                }
            }
            return filename;
        };
        this.selectText = function(element) {
            var doc = document;
            var text = doc.getElementById(element);

            if (doc.body.createTextRange) { // ms
                var range = doc.body.createTextRange();
                range.moveToElementText(text);
                range.select();
            } else if (window.getSelection) { // moz, opera, webkit
                var selection = window.getSelection();
                var range = doc.createRange();
                range.selectNodeContents(text);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        };
        this.displayErrorMessage = function(type, constraint) {
            $j(jive.staticFileStore.soy.errorMessage({
                type: type,
                constraint: constraint
            })).message({style: 'error'});
        }
    });
});
