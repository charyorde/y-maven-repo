/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Announcements.Edit');

/**
 * @depends path=/resources/scripts/jive/hte/hte.js
 * @depends template=jive.announcements.announcementEditControls
 * @depends template=jive.announcements.announcementCard
 * @depends template=jive.error.form.fieldError
 */
jive.Announcements.Edit.View = function editView(options){
    var $scope = options.$scope;
    jive.conc.observable(this);
    var that = this;

    //the UI object will have methods that depend on the UI being initialized.  addMethod creates public stubs for those methods.
    var ui = null;
    function addMethod(toCall){
        that[toCall] = function initCheckImpl(){
            if(!ui){
                console.log("not initialized when attempting to call " + toCall);
                throw new Error("The view is not yet initialized");
            }
            return ui[toCall].apply(ui, arguments);
        }
    }

    addMethod('getImage');
    addMethod('setImage');

    addMethod('getSubject');
    addMethod('setSubject');

    addMethod('getSubjectURI');
    addMethod('setSubjectURI');

    addMethod('getStartDate');
    addMethod('getEndDate');

    addMethod('getBody');
    addMethod('getNotification');
    addMethod('updateImageToken');
    addMethod('updatePreview');
    addMethod('isFormDirty');


    this.initView = function initView(options){
        $scope.find(".js-editControls").html(jive.announcements.announcementEditControls({
            announcement: options.announcement
        }));

        var $form = $scope.find(".js-announcementForm");
        var $includeLink = $scope.find(".js-includeLink");
        var $subjectURI = $scope.find(".js-subjectURI");
        var $subject = $scope.find(".js-subject");
        var $includeImage = $scope.find(".js-includeImage");
        var $img = $scope.find(".imagePreview");
        var $notification = $scope.find(".js-notification");
        var $fileRegion = $scope.find(".js-file-input");


        var urlRe = /^https?:\/\/(?:[^:]+:[^@])?[\w\.]+(?::\d+)?\S*$/;

        if (options.isModerated) {
            $j('#jive-moderation-box').show();
        } else {
            $j('#jive-moderation-box').hide();
        }

        $scope.find("button[name='cancel']").click(function(){
            that.emit("cancelClicked");
        });

        function handlePastedUrl(evt) {
            if (evt.originalEvent.clipboardData || evt.originalEvent.dataTransfer) {
                var textContent = (evt.originalEvent.clipboardData || evt.originalEvent.dataTransfer).getData('Text');
                if(urlRe.test(textContent)){
                    that.emit("resolve", textContent);
                    return false;
                }
            }else{
                jive.conc.nextTick(handleSubjectUrlChange);
            }
        }

        function handleSubjectUrlChange(){
            var urlStr = $subjectURI.val();
            if(urlRe.test(urlStr)){
                that.emit("resolve", urlStr);
            }else{
                var munged = 'http://' + urlStr;
                if(urlRe.test(munged)){
                    $subjectURI.val(munged);
                    that.emit("resolve", munged);
                }
            }
        }

        //bind link paste handler
        $subject.on("paste", handlePastedUrl);
        $subjectURI.on("paste", handlePastedUrl)
            .on("change", handleSubjectUrlChange);

        //link/no link state handler
        $includeLink.on("change", function(){
            if($includeLink.is(":checked")){
                $subjectURI.prop("disabled", false)
                $j('.js-uri-wrapper').show();
                $subject.addClass("js-linkInput");
            }else{
                $subjectURI.prop("disabled", true);
                $j('.js-uri-wrapper').hide();
                $subject.removeClass("js-linkInput");
                that.emit("disabledField", $subjectURI);
            }
        });

        $includeImage.on("change", function(){
            if($includeImage.is(":checked")){
                $img.removeClass("disabled");
            }else{
                $img.addClass("disabled");
            }
        });

        //set up hypertext RTE for body
        var $body = $scope.find(".js-body");
        var editor = new jive.hte.HTE($body, {});
        var editorDeferred = new $j.Deferred();
        editor.addListener("initFinished", function(){
            that.emit("hteInitFinished");
            editorDeferred.resolve();
        });

        //Set up date picker
        //these are the backing store for the date pickers.  The actual UI elements are for display and user interaction only.
        var $publishDate = $scope.find(".js-publishDate");
        var $endDate = $scope.find(".js-endDate");

        var DEFAULT_INTERVAL = 604800000; //1 week in ms

        function localTzStr(d){
            function pad(n){
                var s = String(n);
                while(s.length < 2){
                    s = "0" + s;
                }
                return s;
            }
            function trunc(n){
                if(n >= 0){
                    return Math.floor(n);
                }
                return Math.ceil(n);
            }
            var offsetMin = -d.getTimezoneOffset();
            var offsetHour = trunc(offsetMin / 60);
            var sign = offsetHour >= 0 ? "+" : "-";
            offsetHour = Math.abs(offsetHour);
            offsetMin = Math.abs(offsetMin % 60);

            return sign + pad(offsetHour) + pad(offsetMin);
        }

        var calendarDeferred = new $j.Deferred();
        define(['Zapatec.Calendar'], function(){
            function initPicker(id, value, $control) {
                if(value == null || isNaN(value) || value < 0){
                    value = new Date().getTime();
                }

                var params = {
                    inputField: id,
                    button: id + '_button',
                    date: new Date(value),
                    step:1,
                    onUpdate:function (calendar) {
                        $control.val(calendar.date.getTime());
                    },
                    firstDay:0,
                    weekNumbers:false
                };
                Zapatec.Calendar.setup(params);
                //Update the display of the date in the textarea.
                $j("#" + id).val(new Date(value).print(Zapatec.Calendar._TT.DEF_DATE_FORMAT));
            }

            var pubDateVal = parseInt($publishDate.val());
            var endDateVal = parseInt($endDate.val());
            if(isNaN(pubDateVal) || pubDateVal < 0){
                pubDateVal = new Date().getTime();
                $publishDate.val(pubDateVal);
            }
            if(isNaN(endDateVal) || endDateVal < 0 || endDateVal < pubDateVal){
                endDateVal = pubDateVal + DEFAULT_INTERVAL;
                $endDate.val(endDateVal);
            }
            initPicker("publishDate", pubDateVal, $publishDate);
            initPicker("endDate", endDateVal, $endDate);
            calendarDeferred.resolve();
        });


        //Set up image upload
        var $fileInput = $scope.find(".imageUploadForm").ajaxForm({
            dataType: "json",
            success: function(response){
                that.emit("imageUploadSuccess", response);
            },
            beforeSerialize: function($form){
                //hook the image up to the announcement, if it has an id.
                $form.find("input[name='objectId']").val(options.announcementId);
            }
        }).find("input[type='file']")
        .change(function(){
            $j(this).parent("form").submit();
        });


        var resetFileInputPosition = (function(){
            //Separate implementations in a browser detect.  Yeah. I know.
            if($j.browser.msie){
                return function resetFileInputPositionIE(){
                    var $displayedChild = $fileRegion.children(":visible");
                    $fileInput.css({
                        "opacity": "0",
                        "position": "absolute",
                        "z-index": 1,
                        "outline": "none"
                    })
                    .width(50)
                    .height(50);

                    //The file input control needs to chase the mouse cursor around so that we can be assured
                    //that we're clicking on an active region of it.
                    $fileRegion.children().unbind("mousemove.fileCatch");
                    $displayedChild.bind("mousemove.fileCatch", function(evt){
                        //move the file input.
                        var pos = {
                            'left': evt.pageX - 25,
                            'top': evt.pageY - 25
                        };
                        $fileInput.offset(pos);
                    });
                }
            }else{
                return function resetFileInputPositionNormal(){
                    var $displayedChild = $fileRegion.children(":visible");
                    //For non-IE browsers, it's enough to make the file input cover the displayedChild
                    $fileInput.css({
                        "opacity": "0",
                        "position": "absolute",
                        "z-index": 1
                    })
                        .offset($displayedChild.offset())
                        .width($displayedChild.outerWidth())
                        .height($displayedChild.outerHeight());
                }
            }
        })();
        that.addListener("_resetFileInputPosition", resetFileInputPosition);

        resetFileInputPosition();
        $img.load(function(){
            resetFileInputPosition();
            that.emit("dataChange");
        });


        //set up initial checkbox state
        $includeLink.change();
        $includeImage.change();


        $j.when(editorDeferred, calendarDeferred).done(function(){
            isFormDirty(); //init original value
        });

        function getFormStr(){
            var formStr = $form.serialize();
            formStr += "&imageUrl=" + encodeURIComponent($img.attr("src"));
            formStr += "&editorBody=" + encodeURIComponent(editor.getValue());
            return formStr;
        }

        function isFormDirty(){
            if(isFormDirty.origVal){
                console.log("orig: " + isFormDirty.origVal);
                console.log("new:  " + getFormStr());

                return getFormStr() != isFormDirty.origVal;
            }else{
                //init origVal
                isFormDirty.origVal = getFormStr();
            }
            return false;
        }

        //Set up UI methods
        ui = {};
        ui.getImage = function(){
            var image = $img.attr("src");
            if(image == "/images/blank.gif" || !$includeImage.is(":checked")){
                image = null;
            }
            return image;
        };
        ui.setImage = function(url){
            $img.attr("src", url);
            $includeImage.prop("checked", true);
            $img.parent().show();
            $scope.find(".js-no-image-link").hide();
            resetFileInputPosition();
        };

        ui.getSubject = function(){
            return $subject.val();
        };
        ui.setSubject = function(text){
            $subject.val(text);
            that.emit("dataChange");
        };

        ui.getSubjectURI = function(){
            var subjectURI = $subjectURI.val();
            if(!$includeLink.is(":checked")){
                subjectURI = "";
            }
            return subjectURI;
        };
        ui.setSubjectURI = function(url){
            $subjectURI.val(url);
            $includeLink.prop("checked", true).change();
            that.emit("dataChange");
        };

        ui.getStartDate = function getStartDate(){
            var date = new Date(parseInt($publishDate.val()));
            return date.print("%Y-%m-%d") + "T00:00:00.000" + localTzStr(date);
        };
        ui.getEndDate = function getEndDate(){
            var date = new Date(parseInt($endDate.val()));
            return date.print("%Y-%m-%d") + "T23:59:59.000" + localTzStr(date);
        };

        ui.getBody = function (){
            return editor.getValue();
        };

        ui.getNotification = function(){
            return $notification.prop("checked");
        };

        ui.updateImageToken = function(name, value){
            var $imgForm = $scope.find(".imageUploadForm");

            //replace the token value with the new one from the response
            $imgForm.find("input[name='jive.token.name']").val(name);
            $imgForm.find("input[name='" + name + "']").val(value);
        };

        ui.updatePreview = function(ann){
            var annPreviewHtml = jive.announcements.announcementCard({
                announcement: ann
            });
            $scope.find(".js-preview-box").html(annPreviewHtml);
        };

        ui.isFormDirty = isFormDirty;

        // bind fun scrolly bits
        var $preview = $j('.js-preview-wrapper');
        var top = $preview.offset().top;

        $j(window).scroll(function() {

            if (top - $j(this).scrollTop() <= 0) {
                $preview.addClass('fixed');
            } else {
                $preview.removeClass('fixed');
            }

        });

        // attaching some visual click handlers to the check boxes

    };

    //See the docs for jQuery.tools.validator.addEffect; these are the second and third params to that method.
    this.validationEffectError = function(errors, evt) {
        $j.each(errors, function (index) {
            //find or construct the error container for this element.
            var $errorContainer = $j(this.input).prev();
            if(!$errorContainer.is(".js-error-container")){
                $errorContainer = $j("<div class='js-error-container'></div>");
            }else{
                $errorContainer.children().remove(); //clear previous errors
            }

            //add all the messages
            $j.each(this.messages, function () {
                $errorContainer.append(jive.error.form.fieldError({msg:this}));
            });

            //put it in place, and scroll to it if it's the first on the page
            $j(this.input).before($errorContainer);
            if (index === 0) {
                $j.scrollTo($errorContainer, 800);
            }
        });
        if(errors.length > 0){
            that.emit("_resetFileInputPosition");
        }
    };
    this.validationEffectPass = function($inputs){
        var changeCount = 0;
        $inputs.each(function(){
            var toRemove = $j(this).prev().filter(".js-error-container");
            changeCount += toRemove.length;
            toRemove.remove();
        });
        if(changeCount > 0){
            that.emit("_resetFileInputPosition");
        }
    };
};
