/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/promise.js
 * @depends path=/resources/scripts/apps/static_files/static_file_modal.js lazy=true
 * @depends coreapi=v3
 *
 */
define('jive.staticFileController', [
    'jquery'
], function($) {
    if (!jive.staticFileController || !jive.staticFileController.singleton) {
        var StaticFileController = jive.oo.Class.extend(function(protect) {
            this.init = function () {
                var main = this;
                $(document).on('click', '.js-static-file-control', function(e) {
                    e.preventDefault();
                    var $trigger = $(this),
                        containerType = $trigger.data('containertype'),
                        containerID = $trigger.data('containerid');
                    main.createModal(containerType, containerID);
                });
            };
            this.createModal = function(containerType, containerID) {
                var main = this;
                var placeReq = osapi.jive.corev3.places.get({entityDescriptor: [containerType, containerID]});
                placeReq.execute(function(placeResponse){
                    if (placeResponse.error) {
                        var code = placeResponse.error.code;
                        var message = placeResponse.error.message;
                    }
                    else {
                        main.placeObj = placeResponse.list[0];
                        var listPromise = new jive.conc.Promise();
                        listPromise.addCallback(function(fileList) {
                            main.files = fileList;
                            main.parseFileExtensions();
//                            debugger;
                            require(['jive.staticFileModalView'], function(StaticFileModalView) {
                                main.modalView = new StaticFileModalView({
                                    placeObj: main.placeObj,
                                    staticFiles: main.files,
                                    containerType: containerType
                                });
                                main.addModalListeners();

                            });
                        });
                        main.getFileList(main.placeObj, listPromise);
                    }
                });
            };
            this.getFileList = function(place, promise) {
                var main = this,
                    staticFilesReq = place.getStatics();
                staticFilesReq.execute(function(filesResponse) {
                    if (filesResponse.error) {
                        promise.emitError();
                    }
                    else {
                        main.files = filesResponse.list;
                        main.parseFileExtensions();
                        promise.emitSuccess(main.files);
                    }
                })
            };
            this.addModalListeners = function() {
                var main = this;
                main.modalView
                    .addListener('getList', function(promise) {
                        main.getFileList(main.placeObj, promise);
                    })
                    .addListener('deleteFile', function(fileID, promise) {
                        $.each(main.files, function(i, fileObj) {
                            if (fileObj.id == fileID) {
                                var destroyReq = fileObj.destroy();
                                destroyReq.execute(function(destroyResp) {
                                    if(destroyResp.error) {
                                        var code = destroyResp.error.code;
                                        var message = destroyResp.error.message;
                                    } else {
                                        main.getFileList(main.placeObj, promise);
                                    }
                                });
                                return false;
                            }
                        })
                    });

            };
            this.parseFileExtensions = function() {
                var main = this;
                $.each(main.files, function(i, fileObj) {
                    var filename = fileObj.filename;
                    fileObj.fileExtension = filename.split(".").pop().toLowerCase();
                    fileObj.iconClass = jive.shared.file.fileTypeIconClass({
                        extension: fileObj.fileExtension,
                        size: 'med'
                    });
                });
            };
        });
        jive.staticFileController = {};
        jive.staticFileController.singleton = new StaticFileController();
    }
});
