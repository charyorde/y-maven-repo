/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j */

/**
 * @depends path=/resources/scripts/jquery/jquery.validator.js
 * @depends path=/resources/scripts/apps/share/models/core_deferred.js lazy=true
 * @depends path=/resources/scripts/apps/announcements/ImageResolverService.js
 * @depends path=/resources/scripts/apps/announcements/edit/view.js
 * @depends path=/resources/scripts/apps/shared/views/loader_view.js
 * @depends i18nKeys=content.validation.*
 */
define('jive.Announcements.Edit.Main', ['jive.CoreV3.Deferred'], function(Deferred) {
return function editMain(options){

    //Model
    function newAnnouncement(author, htmlContent, parent, status, subject, startDate, endDate, subjectURI, image){
        var ret = new osapi.jive.corev3.contents.Announcement();
        ret.type = "announcement";
        ret.author = author;
        ret.content = {
            text: htmlContent,  //TODO: change to edittext when CoreV3 supports it.
            type: "text/html"
        };
        if(parent){
            ret.parent = parent;
        }
        ret.status = status;
        ret.subject = subject;
        ret.publishDate = startDate;
        ret.endDate = endDate;
        ret.subjectURI = subjectURI;
        if(image){
            ret.image = image;
        }

        return ret;
    }
    var core = new Deferred();


    // View
    var $scope = $j(".js-announcement.js-edit");
    var $form = $scope.find(".js-announcementForm");

    var view = new jive.Announcements.Edit.View($j.extend({
        $scope: $scope
    }, options));
    view.addListener("resolve", resolveUrl);
    view.addListener("hteInitFinished", function(){
        $scope.on("change", "*", refreshPreview);
        setInterval(function checkBody() {
            var newText = view.getBody();
            if (checkBody.lastText && checkBody.lastText != newText) {
                refreshPreview();
            }
            checkBody.lastText = newText;
        }, 2000);
        view.addListener("dataChange", function(){
            refreshPreview();
        });
        refreshPreview();
    });
    view.addListener("imageUploadSuccess", function(response){
        view.setImage(response.images[0].url);
        view.updateImageToken(response.tokenName, response.tokenValue);
    });
    view.addListener("cancelClicked", function(){
        core.getObject(options.containerType, options.containerId)
            .pipe(function(parentContainer){
                window.location = parentContainer.resources.html.ref;
            });
    });
    view.addListener("disabledField", function($field){
        view.validationEffectPass($field);
    });


    // Controller
    setUnloadHandler();
    if(options.announcementId >= 0){
        core.getObject(options.announcementType, options.announcementId).done(function(announcementToEdit){
            view.initView($j.extend({
                announcement: announcementToEdit
            }, options));
        });
    }else{
        var announcementToEdit = new osapi.jive.corev3.contents.Announcement();
        announcementToEdit.subject = '';
        view.initView($j.extend({
            announcement: announcementToEdit
        }, options));
    }

    var linkService = new jive.rte.LinkService();
    var imageResolverService = new jive.Announcements.ImageResolverService({
        containerType: options.announcementType
    });

    //Wire up validation and form control.
    $j.tools.validator.localize(_jive_locale, {
        '*': jive.i18n.getMsg('content.validation.any'),
        ':email': jive.i18n.getMsg('content.validation.email'),
        ':number': jive.i18n.getMsg('content.validation.number'),
        ':url': jive.i18n.getMsg('content.validation.url'),
        '[max]': jive.i18n.getMsg('content.validation.max'),
        '[min]': jive.i18n.getMsg('content.validation.min'),
        '[required]': jive.i18n.getMsg('content.validation.required')
    });
    $j.tools.validator.addEffect("announcementEdit", view.validationEffectError, view.validationEffectPass);
    $form.validator({
        lang: _jive_locale,
        messageClass: 'jive-error-message',
        inputEvent: 'change',
        effect: "announcementEdit",
        formEvent: null
    });

    var formService = new jive.rte.FormService({
        $form: $form,
        formSubmitHandler: function(evt) {
            evt.preventDefault();

            getAnnouncementFromFormData().pipe(function(ann){
                if(typeof ann.update === 'function'){
                    return core.runQuery(ann.update());
                }else{
                    ann.minor = !view.getNotification();
                    return core.runQuery(osapi.jive.corev3.announcements.create(ann, {minor: ann.minor}));
                }
            }).done(function (createdAnnouncement) {
                    clearUnloadHandler();
                    window.location = createdAnnouncement.resources.html.ref;
                });
        }
    });

    function getAnnouncementFromFormData(){
        return core.getObject(options.containerType, options.containerId)
            .pipe(function(parentContainer){
                var parentUri = parentContainer.resources.self.ref;

                var image = view.getImage();

                var subjectURI = view.getSubjectURI();

                if (options.announcementId == -1) {
                    var newAnn = newAnnouncement("@me", view.getBody(), parentUri, "published", view.getSubject(),
                        view.getStartDate(), view.getEndDate(), subjectURI, image);
                    newAnn.sortKey = Math.round(new Date().getTime()/10000); //new announcements start with an unreasonably large sort key to put them first.

                    return newAnn;
                }else{
                    //get announcement to edit
                    return core.getObject(options.announcementType, options.announcementId)
                        .pipe(function(announcementToEdit){
                            announcementToEdit.content.type = "text/html";
                            announcementToEdit.content.text = view.getBody(); //TODO: change to edittext when CoreV3 supports it.
                            announcementToEdit.endDate = view.getEndDate();
                            announcementToEdit.parent = parentUri;
                            announcementToEdit.publishDate = view.getStartDate();
                            announcementToEdit.status = "published";
                            announcementToEdit.subject = view.getSubject();
                            announcementToEdit.subjectURI = subjectURI;
                            announcementToEdit.image = image;
                            return announcementToEdit;
                        });
                }

            });
    }

    function refreshPreview(){
        getAnnouncementFromFormData().done(function(ann){
            view.updatePreview(ann);
        });
    }

    function setUnloadHandler(){
        $j(window).on("beforeunload.editAnnouncement", function(){
            if(view.isFormDirty()){
                return '';
            }
        });
    }
    function clearUnloadHandler(){
        $j(window).off("beforeunload.editAnnouncement");
    }

    function resolveUrl(url){
        //start spinner
        var spinner = new jive.loader.LoaderView({size: 'big'});
        spinner.prependTo($scope);

        //prevent submit until resolved
        var disableToken = formService.setFormEnabled(false);
        var linkTitleDeferred = linkService.resolve(url).deferred()
            .then(function(linkData){
                var title = linkData.title;
                title = $j("<div></div>").html(title).text();  //turn any entities into actual characters

                //Limit the title to 120 characters
                if(title.length > 120){
                    title = title.substring(0, 120) + "\u2026"; //ellipsis
                }
                view.setSubject(title);
            }, function(err){
                console.log("resolveLink failed", err);
                view.setSubject(url);
            });

        var linkImageDeferred = imageResolverService.get("", {contentUrl: url}).deferred()
            .done(function(imageUrls){
                if(imageUrls.length){
                    view.setImage(imageUrls[0]);
                }
            }).fail(function(err){
                console.log("image resolution failed", err);
            });

        $j.when(linkTitleDeferred, linkImageDeferred).always(function(){
            formService.setFormEnabled(disableToken);

            spinner.destroy();
            spinner.getContent().remove();
        });

        view.setSubjectURI(url);
    }
};
});
