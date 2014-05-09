/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

//jiveimage plugin
(function() {
    var typeMap = {
        "image/png": ["png"],
        "image/jpeg": ["jpg", "jpeg"],
        "image/gif": ["gif"],
        "image/bmp": ["bmp"]
    };

    var spinnerUrl = CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/skins/default/img/progress.gif";
    var dropPositionImageUrl = CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/skins/default/img/dropPosition.png";
    var dataUrlRe = /^data:(image\/[^;,]+)[^,]*,/;
    var maxWidth = 620;

    //This just prevents the event's default action from occuring
    function cancel(evt) {
        //logEvent(evt);
        return tinymce.dom.Event.cancel(evt);
    }

    function logEvent(evt){
        console.log("fired " + evt.type + " on " + evt.target.toString(), evt);
    }

    function ensureCursorExists(ed) {
        var sel = ed.selection.getSel();
        if (sel.rangeCount != null && sel.rangeCount < 1) {
            var rng = ed.dom.createRng();
            rng.setStart(ed.getBody(), ed.getBody().childNodes.length);
            rng.collapse(true);
            ed.selection.setRng(rng);
        }
    }

    function makeImage(img) {
        var ed = tinymce.activeEditor;
        var imgNode = ed.dom.create("img");
        return $j(imgNode).attr("src", img.url)
                .attr("alt", img.name)
                .css({
                    "max-width": maxWidth + "px"
                }).addClass("jive-image");
    }

    function placeImage($img){
        var ed = tinymce.activeEditor;
        var rng = ed.selection.getRng(true);
        $img.each(function(){
            rng.insertNode(this);
        });
    }

    function DragDropStateManager(ed, handlers){
        var timer = null;
        function resetTimer(justCancel){
            if(timer != null){
                clearTimeout(timer);
                timer = null;
            }
            if(!justCancel){
                timer = setTimeout(function(){
                    resetState();
                    timer = null;
                }, 550); //550 ms is the max allowed time between drag update events, per spec
            }
        }

        //State
        var local = false;
        function resetState(){
            local = false;
        }

        var dropPosMgr = new DropPositionImageManager(ed);

        function dragStart(evt){
            local = true;
            resetTimer(false);
            if(handlers.dragstart){
                return handlers.dragstart.call(this, evt);
            }
        }

        function drag(evt){
            local = true;
            resetTimer(false);
            if(handlers.drag){
                return handlers.drag.call(this, evt);
            }
        }

        function dragEnter(evt){
            resetTimer(false);
            if(!local){
                if(handlers.dragenter){
                    handlers.dragenter.call(this, evt);
                }
                dropPosMgr.show();
                return cancel(evt);
            }
        }

        function dragLeave(evt){
            resetTimer(false);
            var ret;
            if(!local){
                if(handlers.dragleave){
                    ret = handlers.dragleave.call(this, evt);
                }
                dropPosMgr.hide();
            }
            if(typeof ret != "undefined"){
                return ret;
            }
        }

        function dragOver(evt){
            resetTimer(false);
            if(!local){
                if(handlers.dragover){
                    handlers.dragover.call(this, evt);
                }
                ensureCursorExists(ed);
                dropPosMgr.keepShowing();
                return cancel(evt);
            }
        }

        function dragEnd(evt){
            resetTimer(true);
            resetState();
            if(handlers.dragend){
                return handlers.dragend.call(this, evt);
            }
        }

        function dropHandler(evt){
            resetTimer(true);
            dropPosMgr.hide();
            var ret;
            if(!local && handlers.drop){
                ret = handlers.drop.call(this, evt);
            }
            resetState();
            if(typeof ret != "undefined"){
                return ret;
            }
        }


        function bind(type, handler){
            ed.dom.bind(ed.getDoc(), type, handler);
        }

        bind("dragstart", dragStart);
        bind("drag", drag);
        bind("dragenter", dragEnter);
        bind("dragover", dragOver);
        bind("dragleave", dragLeave);
        bind("dragend", dragEnd);
        bind("drop", dropHandler);

        this.reset = resetState;
        this.hideDropPos = function hideDropPos(){
            dropPosMgr.hide();
        };
    }

    function DropPositionImageManager(ed){
        var timer = null;
        function resetDropPosTimer(justCancel){
            if(timer != null){
                clearTimeout(timer);
                timer = null;
            }
            if(!justCancel){
                timer = setTimeout(function(){
                    removeDropPositionImage(ed);
                    timer = null;
                }, 100);
            }
        }

        function makeDropPositionImage(ed){
            var $img = $j(".js-dropPosition", ed.getBody());
            if($img.length == 0){
                ensureCursorExists(ed);
                var rng = ed.selection.getRng(true);
                rng.collapse(true);

                var imgNode = ed.dom.create("img");
                $img = $j(imgNode).attr("src", dropPositionImageUrl).addClass("js-dropPosition");
                rng.insertNode(imgNode);
            }
            return $img;
        }

        function removeDropPositionImage(ed){
            $j(".js-dropPosition", ed.getBody()).remove();
        }

        //different browsers have very different behavior regarding what events fire when. The different behavior here accounts for that.
        if(tinymce.isGecko){
            this.show = function(){
                resetDropPosTimer(false);
                return makeDropPositionImage(ed);
            };

            this.keepShowing = function(){
                this.show();
            };

            this.hide = function(){
                resetDropPosTimer(true);
                removeDropPositionImage(ed);
            };
        }else{
            this.show = function(){
                resetDropPosTimer(true);
                return makeDropPositionImage(ed);
            };

            this.keepShowing = function(){
                this.show();
            };

            this.hide = function(){
                resetDropPosTimer(false);
            };
        }
    }

    function uploadClientImage(img, $img, rte, ed){
        var imageService = rte.getImageService();

        //success and failure callbacks
        function updateImageUrl(img){
            $img.attr("src", img.url).attr("data-mce-src", img.url);
        }

        function handleError(){
            console.log("Image REST request failed for %s", img.name, arguments);
            $img.remove();
        }

        var uploadFinishedPromise = new jive.conc.Promise();
        imageService.scaleClientImage(img.url) //scale the image for dimensions and data size
        .addCallback(function(scaledUrl){
            //if type changed, append new extension.
            var match = dataUrlRe.exec(scaledUrl);
            if(match){
                var scaledType = match[1];
                match = /\.([^\.]+)$/.exec(img.name);
                if(match && typeMap[scaledType]){
                    var ext = match[1];
                    ext = ext.toLowerCase();

                    if($j.inArray(ext, typeMap[scaledType]) < 0){
                        img.name += "." + typeMap[scaledType][0];
                    }
                }else{
                    //no file extension; give it one
                    img.name += "." + typeMap[scaledType][0];
                }
            }

            img.url = scaledUrl;
            updateImageUrl(img);

            //disable form submit while the REST request is pending
            var formService = rte.getFormService();
            var formToken = formService.setFormEnabled(false, ed.getLang("jiveimage.please_wait"));

            //ajax request to create attachment, then update image's src.
            imageService.create(img.name, img.url)
            .addCallback(function imageAvailable(img){
                $img.load(function(){
                    var $img = $j(this);
                    $img.css({
                        "width": "auto",
                        "height": "auto",
                        "max-width": "",
                        "max-height": ""
                    });

                    //Set the initial width to 620px or less
                    var width = $img.width();
                    var height = $img.height();
                    if(width > maxWidth){
                        var ratio = maxWidth / width;
                        $img.css({
                            "width": Math.round(ratio * width) + "px",
                            "height": Math.round(ratio * height) + "px"
                        });
                    }
                });
                updateImageUrl(img);
                uploadFinishedPromise.emitSuccess($img.get(0));
            })
            .addErrback(function(){
                handleError();
                uploadFinishedPromise.emitError();
            })
            .always(function(){
                formService.setFormEnabled(formToken);
            });
        });
        return uploadFinishedPromise;
    }

    tinymce.create('tinymce.plugins.JiveImagePlugin', {

        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @returns Name/value array containing information about the plugin.
         * @type Array
         */
        getInfo : function() {
            return {
                longname : 'Image Picker',
                author : 'Jive Software',
                authorurl : 'http://www.jivesoftware.com',
                infourl : 'http://www.jivesoftware.com/',
                version : "1.0"
            };
        },

        uploadClientImage: function(filename, imgNode){
            imgNode = $j(imgNode);
            return uploadClientImage({url: imgNode.attr('src'), name: filename}, imgNode, this.rte, this.ed);
        },

        /**
         * Gets executed when a TinyMCE editor instance is initialized.
         *
         * @param {Editor} ed the editor
         */
        init : function(ed) {
            this.ed = ed;
            var that = this;

            ed.onInit.add(function() {
                if(!ed.settings.images_enabled){
                    var imageButton = ed.controlManager.get("jiveimage");
                    if(imageButton){
                        imageButton.setDisabled(true);
                    }
                }else{

                    /**
                     * New popover context menu for images
                     */
                    if(ed.plugins.jivecontextmenu){
                        var contextMenu = ed.plugins.jivecontextmenu;

                        var floatLeftItem = new contextMenu.MenuItem("floatLeftItem", null, ed.getLang("jiveimage.float_left"),  {
                            url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/iconmaster.gif",
                            xOffset: 172,
                            yOffset: 90,
                            width: 28,
                            height: 21
                        }, "jiveImgFloatLeft");
                        var inlineItem = new contextMenu.MenuItem("inlineItem", null, ed.getLang("jiveimage.inline"), {
                            url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/iconmaster.gif",
                            xOffset: 144,
                            yOffset: 90,
                            width: 28,
                            height: 21
                        }, "jiveImgInline");
                        var floatRightItem = new contextMenu.MenuItem("floatRightItem", null, ed.getLang("jiveimage.float_right"), {
                            url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/iconmaster.gif",
                            xOffset: 200,
                            yOffset: 90,
                            width: 28,
                            height: 21
                        }, "jiveImgFloatRight");
                        var originalSizeItem = new contextMenu.MenuItem("originalSizeItem", null, ed.getLang("jiveimage.original_size"), {
                            url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/iconmaster.gif",
                            xOffset: 165,
                            yOffset: 158,
                            width: 28,
                            height: 21
                        }, "jiveImgOriginalSize");

                        var imgMenu = new contextMenu.Menu([floatLeftItem, inlineItem, floatRightItem, originalSizeItem], true, false, ed.getLang("jiveimage.menu_hdr"));
                        var imgItem = new contextMenu.MenuItem("jiveImageItem", /img/i, null, {
                            url: CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/img/iconmaster.gif",
                            xOffset: 155,
                            yOffset: 0,
                            width: 24,
                            height: 22
                        }, imgMenu);
                        contextMenu.addRootItem(imgItem);
                    }
                }
                //add pasteComplete handler
                ed.plugins.paste.onPasteComplete.add(function(){
                    tinymce.each(ed.dom.select('img.toUpload', ed.getBody()), function(img) {
                        ed.dom.removeClass(img, "toUpload");
                        if(img.src && img.src.length > 0){
                            var pasteFilename = ed.dom.uniqueId("pastedImage_");
                            that.uploadClientImage(pasteFilename, img);
                        }else{
                            ed.dom.remove(img);
                        }
                    });
                });

            }, this);
        },

        setRTE: function(rte){
            var ed = this.ed;
            this.rte = rte;
            if(rte.getImageService() && rte.getFormService() && !ed.settings.rte_image_webonly){
                if($def(window.FileReader)){
                    this.initDragDrop();
                }else if($def(window.FormData)){ //test for XHR 2
                    this.initDragCatch();
                }
                var settings = rte.getImageService().getSettings();
                this.objectId = settings.objectId;
                this.objectType = settings.objectType;
            }
            else {
                function blockDropImage(e) {
                    var files = e.dataTransfer.files;
                    if (files.length > 0) {
                        for (var i = 0; i < files.length; ++i) {
                            if(/^image\//.test(files[i].type)){
                                e.preventDefault();
                                return false;
                            }
                        }
                    }
                }

                ed.dom.bind(ed.getDoc(), 'drop', blockDropImage);
            }
        },

        initDragDrop: function(){
            var ed = this.ed;
            var that = this;

            function readDataURL(file) {
                //Create the image element with a placeholder URI and put it in place.
                var $img = makeImage({
                    name: file.name,
                    url: spinnerUrl
                });
                placeImage($img);

                //Read the File and pass the resulting data URL to handleDataURL
                var reader = new FileReader();
                reader.onloadend = function(evt) {
                    var url = evt.target.result;
                    var img = {name: file.name, url: url};
                    uploadClientImage(img, $img, that.rte, ed);
                };
                reader.onerror = function(evt) {
                    console.log("error reading file: ", evt.target);
                };
                reader.onprogress = function(evt) {
                    console.log("FileReader progress: " + evt.loaded + " of " + evt.total);
                };
                reader.readAsDataURL(file);
            }

            //Utility functions to determine whether the browser has fucked up the character encoding, and fix it.  FF does this sometimes.
            function toHex(num, chars){
                var ret = num.toString(16);
                while(ret.length < chars){
                    ret = "0" + ret;
                }
                return ret;
            }
            function unmangleUtf16leFrom8(s){
                //given a text string that was utf-8, but was interpreted as utf-16LE, fix it
                var ret = [];
                for(var i = 0; i < s.length; ++i){
                    var charCode = s.charCodeAt(i);
                    var low = charCode & 0xff;
                    var high = charCode >> 8;
                    ret.push("%" + toHex(low, 2) + "%" + toHex(high, 2));
                }
                return decodeURIComponent(ret.join(""));
            }
            function unmangleUtf8From16le(s){
                //given a string that was utf-16LE, but was interpreted as UTF-8, fix it.
                var ret = "";
                var low = null;
                var high = null;
                for(var i = 0; i < s.length; ++i){
                    if(low === null){
                        low = s.charCodeAt(i);
                    }else{
                        high = s.charCodeAt(i);
                        ret += String.fromCharCode((high << 8) | low);
                        low = null;
                    }
                }
                return ret;
            }
            function unmangleUtf8From16be(s){
                //given a string that was utf-16BE, but was interpreted as UTF-8, fix it.
                var ret = "";
                var low = null;
                var high = null;
                for(var i = 0; i < s.length; ++i){
                    if(high === null){
                        high = s.charCodeAt(i);
                    }else{
                        low = s.charCodeAt(i);
                        ret += String.fromCharCode((high << 8) | low);
                        high = null;
                    }
                }
                return ret;
            }
            function countChars(haystack, needle){
                var from = 0;
                var count = 0;
                do{
                    from = haystack.indexOf(needle, from) + 1;
                    ++count;
                }while(from > 0);
                --count; //the last wasn't a match;
                return count;
            }
            function nullRatio(s){
                var oddNulls = 0;
                var evenNulls = 0;
                for(var i = 0; i < s.length; ++i){
                    if(s.charCodeAt(i) == 0){
                        if(i % 2 == 0){
                            ++evenNulls;
                        }else{
                            ++oddNulls;
                        }
                    }
                }
                return oddNulls / evenNulls;
            }
            function unmangle(s){
                var bras = countChars(s, '<');
                var kets = countChars(s, '>');
                //The ratio of bras to kets should be about equal in an HTML doc.  The first test prevents div-by-zero, and permits off by one in small counts.
                if(Math.abs(bras-kets) <= 1 || Math.abs(1-(bras/kets)) < .05){
                    if(bras == 0 && kets == 0){
                        //both zero, probably garbled.  Try the transform.
                        var testStr = unmangleUtf16leFrom8(s);
                        bras = countChars(testStr, '<');
                        kets = countChars(testStr, '>');
                        if((bras > 0 && kets > 0) && (Math.abs(bras-kets) <= 1 || Math.abs(1-(bras/kets)) < .05)){
                            return testStr;
                        }else{
                            return s;
                        }
                    } else if(s.length % 2 == 0){
                        //even length string, do UTF-16 test
                        var nulls = countChars(s, '\x00');
                        if(nulls < 2 || nulls/s.length < .02){
                            return s;
                        }else{
                            //we have UTF-16 text that was interpreted as UTF-8
                            //test endianness endianness
                            if(nullRatio(s) >= 1){
                                return unmangleUtf8From16le(s);
                            }else{
                                return unmangleUtf8From16be(s);
                            }
                        }
                    }else{
                        //skip utf-16 test for odd-length strings
                        return s;
                    }
                }
                return unmangleUtf16leFrom8(s);
            }

            //The actual drop handler.
            function dropHandler(evt) {
                //Looks for a URL embedded in the drag and drop data
                var files = evt.dataTransfer.files;
                if (files.length > 0) {
                    //A set of files was dragged.  Handle them.
                    for (var i = 0; i < files.length; ++i) {
                        if(/^image\//.test(files[i].type)){
                            readDataURL(files[i]);
                        }
                    }
                } else {
                    //browser to browser drag and drop invokes the paste workflow.
                    if($j.inArray("text/html", evt.dataTransfer.types) >= 0){
                        var html = unmangle(evt.dataTransfer.getData("text/html"));
                        ed.execCommand("mceInsertClipboardContent", false, {content: html});
                    }else if($j.inArray("text/plain", evt.dataTransfer.types) >= 0){
                        var text = $j("<div></div>").text(evt.dataTransfer.getData("text/plain")).html();  //HTML escape the text
                        ed.execCommand("mceInsertClipboardContent", false, {content: text});
                    }
                }
                if(tinymce.isGecko && $j.browser.version.substr(0, 3) == "1.9"){
                    //this is only necessary in FF 3.6
                    $j(ed.getDoc()).one("DOMNodeInserted", function(evt){
                        var inserted = evt.originalEvent.target;
                        inserted.parentNode.removeChild(inserted);
                        return false;
                    });
                }
                return cancel(evt);
            }

            new DragDropStateManager(ed, {drop: dropHandler});
        },


        initDragCatch: function(){
            var ed = this.ed;
            var jivescroll = ed.plugins.jivescroll;
            var that = this;

            //Build the mouse catch and it's contents
            var $mouseCatch = $j("<div></div>").css({
                "width": "100px",
                "height": "100px",
                "position": "absolute",
                "top": "0",
                "left": "0"
            }).hide();

            var $fileForm = $j("<form method='POST' name='fileForm' enctype='multipart/form-data' target='asyncIframe'></form>").css({
                "width": "100%",
                "height": "100%"
            });
            $mouseCatch.append($fileForm);

            var $fileInput = $j("<input type='file' name='fileInputCtrl' multiple='true' />").css({
                "opacity": "0",
                "width": "100%",
                "height": "100%"
            }).attr("class", "fileMouseCatch");
            $fileForm.append($fileInput);

            var $poc = that.rte.getPopOverContainer();
            $poc.append($mouseCatch);

            function postFile(file){
                var imageService = that.rte.getImageService();
                var img = {
                    name: file.name,
                    url: spinnerUrl
                };

                var $img = makeImage(img);
                placeImage($img);

                var formService = that.rte.getFormService();

                //success and failure callbacks
                function handleResponse(img){
                    $img.load(function(){
                        var $img = $j(this);
                        $img.css({
                            "width": "auto",
                            "height": "auto",
                            "max-width": "",
                            "max-height": ""
                        });
                    }).attr("src", img.url);
                }

                function handleError(){
                    console.log("Image REST form request failed for %s", img.name, arguments);
                    $img.remove();
                }

                var formToken = formService.setFormEnabled(false, ed.getLang("jiveimage.please_wait"));
                //ajax request to create attachment, then update image's src.
                imageService.postFile(file)
                        .addCallback(handleResponse)
                        .addErrback(handleError)
                        .always(function(){
                    formService.setFormEnabled(formToken);
                });
            }

            function dragOverHandler(evt) {
                //Move the mouse catch into position
                //need to translate from viewport space to document space
                $mouseCatch.show().css({
                    left: (evt.clientX + jivescroll.lastScrollX - 50) + "px",
                    top: (evt.clientY + jivescroll.lastScrollY - 50) + "px"
                });
            }

            function dragLeaveHandler(){
                $mouseCatch.hide();
            }

            var dndMgr = new DragDropStateManager(ed, {
                dragover: dragOverHandler,
                dragleave: dragLeaveHandler
            });

            $fileInput.change(function(){
                $mouseCatch.hide();
                dndMgr.hideDropPos();
                dndMgr.reset();
                $j.each($fileInput.get(0).files, function(){
                    if(/^image\//.test(this.type)){
                        postFile(this);
                    }
                });
                $fileInput.val(""); //clear the value, so re-adding the same image results in a change event.
                this.blur();
                ed.focus();
            }).bind("click keydown", function(){
                $mouseCatch.hide();
                this.blur();
                return false;
            });
        },


        /**
         * Creates control instances based in the incomming name. This method is normally not
         * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
         * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
         * method can be used to create those.
         *
         * @param {String} cn Name of the control to create.
         * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
         * @return {tinymce.ui.Control} New control instance or null if no control was created.
         */
        createControl: function(cn, cm) {
            switch (cn) {
                case "jiveimage":
                    var c = cm.createButton('jiveimage', {
                        title : 'jiveimage.link_desc',
                        cmd : "mceJiveImage"
                    });
                    return c;
            }

            return "";
        },

        /**
         * Executes a specific command, this function handles plugin commands.
         *
         * @param {string} cmd Command name to be executed.
         * @param {boolean} ui True if a user interface should be presented.
         * @param {object} val Custom value argument, can be anything.
         * @return true if the command was executed by this plugin or not.
         */
        execCommand : function(cmd, ui, val){
            var ed = this.ed, n;
            switch (cmd) {
                case "mceJiveImage":
                    if(ed.settings['rte_image_modal_url']){
                        ed.windowManager.open(
                            {
                                url: CS_BASE_URL + tinymce.settings['rte_image_modal_url'],
                                width: 580 + ed.getLang('jiveimage.delta_width', 0),
                                height: 425 + ed.getLang('jiveimage.delta_height', 0),
                                inline : "yes"
                            },
                            {
                                editor_id : ed.id,
                                cs_resource_base_url : CS_RESOURCE_BASE_URL,
                                objectId: this.objectId,
                                objectType: this.objectType
                            });
                    }else{
                        ed.execCommand("mceAdvImage");
                    }
                    return true;

                case "jiveInsertImage":
                    this.insertImage(val);
                    return true;

                case "jiveImgFloatLeft":
                        n = ed.selection.getNode();
                        if(/^img$/i.test(n.nodeName)){
                            ed.dom.setStyle(n, "float", "left");
                        }
                    return true;
                case "jiveImgFloatRight":
                    n = ed.selection.getNode();
                    if(/^img$/i.test(n.nodeName)){
                        ed.dom.setStyle(n, "float", "right");
                    }
                    return true;
                case "jiveImgInline":
                    n = ed.selection.getNode();
                    if(/^img$/i.test(n.nodeName)){
                        ed.dom.setStyle(n, "float", "none");
                    }
                    return true;
                case "jiveImgOriginalSize":
                    n = ed.selection.getNode();
                    if(/^img$/i.test(n.nodeName)){
                        ed.dom.setStyle(n, "width", "");
                        ed.dom.setStyle(n, "height", "");
                        ed.dom.setAttrib(n, "width", null);
                        ed.dom.setAttrib(n, "height", null);
                    }
                    return true;
            }

            return false;
        },

        insertImage: function(img){
            var ed = this.ed, dom = ed.dom;

            var url = img.url;
            img.url = spinnerUrl;
            var $img = makeImage(img);
            $img.load(function(){
                var $img = $j(this);
                $img.css({
                    "max-width": "",
                    "max-height": ""
                });

                // Ensure width/height aren't predefined, which distorts our calculations below.
                if(tinymce.isIE && $img.attr('width') && $img.attr('height'))
                    $img.removeAttr('width').removeAttr('height');

                //Set the initial width to 620px or less
                var width = $img.width();
                var height = $img.height();
                if(width > maxWidth){
                    var ratio = maxWidth / width;
                    $img.css({
                        "width": Math.round(ratio * width) + "px",
                        "height": Math.round(ratio * height) + "px"
                    });
                }

            }).attr("src", url);
            placeImage($img);
        },

        /**
         * Gets called ones the cursor/selection in a TinyMCE instance changes. This is useful to enable/disable
         * button controls depending on where the user are and what they have selected. This method gets executed
         * alot and should be as performance tuned as possible.
         *
         * @param {string} editor_id TinyMCE editor instance id that was changed.
         * @param {HTMLNode} node Current node location, where the cursor is in the DOM tree.
         * @param {int} undo_index The current undo index, if this is -1 custom undo/redo is disabled.
         * @param {int} undo_levels The current undo levels, if this is -1 custom undo/redo is disabled.
         * @param {boolean} visual_aid Is visual aids enabled/disabled ex: dotted lines on tables.
         * @param {boolean} any_selection Is there any selection at all or is there only a cursor.
         */
        handleNodeChange : function(editor_id, node, undo_index, undo_levels, visual_aid, any_selection) {
            if (node == null)
                return;

            do {
                if (node.nodeName == "IMG" && tinymce.getAttrib(node, 'src') != "") {
                    tinymce.switchClass(editor_id + '_jiveimage', 'mceButtonSelected');
                    return true;
                }
            } while ((node = node.parentNode));

            if (any_selection) {
                tinymce.switchClass(editor_id + '_jiveimage', 'mceButtonNormal');
                return true;
            }

            tinymce.switchClass(editor_id + '_jiveimage', 'mceButtonDisabled');

            return true;
        }

    });
	// Register plugin
	tinymce.PluginManager.add('jiveimage', tinymce.plugins.JiveImagePlugin);
})();
