/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Apps');

/**
 * @param options
 */
jive.Apps.RteArtifacts = jive.oo.Class.extend(function(protect) {

    var spinnerUrl = CS_RESOURCE_BASE_URL + "/images/tiny_mce3/themes/advanced/skins/default/img/progress.gif";
    var scaledPreviewImageMaxWidth = 450; // pixels

    var OPENSOCIAL_2_5 = 'OpenSocial/2.5';
    var LEGACY = 'legacy';

    this.init = function() {
    };

    /*
     * severity should be 'error', 'info' or 'success'
     */
    protect.showMessage = function(message, severity) {
        $j("<p/>").html(message).message({"style":severity});
    };

    this.buildArtifactMarkup = function(rpcArgs, options) {

        var site = rpcArgs ? rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY] : null;
        var app = site.jiveData.app;
        var artifactJson = options.artifactJson;
        var rteBound = options.rteBound;

        // convert the artifact image URLs to be absolute, proxied, etc.
        protect.makeArtifactURLsAbsolute( artifactJson, app, options.suppressImageUpload );

        // normalize again to extract out the images now that they've been made absolute, proxied, etc.
        var normalizedArtifact = protect.normalizeArtifact( artifactJson );
        var iconUrl = normalizedArtifact.icon;
        var previewImageUrl = normalizedArtifact.previewImage;
        var imageUrl = iconUrl || previewImageUrl;
        if (console) console.log("imageUrl", imageUrl);

        /////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////

        var that = this;
        var makeArtifact = function( artifact, error ) {
            if ( !artifact ) {
                rpcArgs.callback( { error: "No artifactJson metadata was provided" } );
                return;
            }

            var gadgetInfo  = site.getActiveGadgetHolder().getGadgetInfo();
            var actions = gadgetInfo.modulePrefs.features.actions;
            var actionId;
            if(actions && actions.params && actions.params['action-contributions']) {
                var actionContributions = actions.params['action-contributions'];
                for(var i = 0; i < actionContributions.length; ++i) {
                    var ac = actionContributions[i].replace(/\n/mg, '');
                    var idMatches = ac.match(/id="(.+?)"/);
                    actionId = idMatches ? idMatches[1] : null;
                    if(actionId && actionId == options.actionId) {
                        break;
                    }
                }
            }
            if (!actionId) {
                rpcArgs.callback( { error: "App does not define action " + options.actionId } );
                return;
            }

            if (!site) {
                that.showMessage("Error occured, app site missing");
                rpcArgs.callback( { error: "Application framework error" } );
                return;
            }
            var appData = site.jiveData;
            var artifactMarkup = that.createArtifact({
                ed: document,
                appUUID: appData.app.appUUID,
                appInstanceUUID: appData.app.appInstanceUUID,
                data: artifact,
                rteBound: rteBound
            });

            var markupAnchor = $j(artifactMarkup);
            var markup = markupAnchor.wrap('<span></span>').parent().html();

            if ($j.browser.msie ) {
                // IE browsers need postprocessing of .innerHTML ... because they're IE.
                if ( $j.browser.version < 9 ) {
                    // stupid IE7/8 tidy-up so it doesn't break the server: make sure that everything is in quotes
                    // and any image tags are terminated
                    markup = markup.replace(/<\w[^>]*>/g,function(_) { return _.replace(/(\w+=)([-.\w]+)/g,"$1\"$2\""); });
                    markup = markup.replace(/(<IMG((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\s*>)/g,"$1</IMG>");
                } else {
                    // IE9(+?) has problems making attribute names single-quote wrapped if their contents contain
                    // double quotes
                    var cleanup = function( markup, attributeName ) {
                        var attributeValue = markupAnchor.attr(attributeName);
                        if( attributeValue ) {
                            var newAttributeValue = attributeValue.replace(/\"/g, "&quot;");
                            markup = markup.replace(
                                attributeName + "='" + attributeValue + "'",
                                attributeName+ "=\"" + newAttributeValue + "\"");
                        }
                        return markup;
                    };

                    markup = cleanup( markup, "_context");
                }
            }

            rpcArgs.callback( { markup: markup, error: error } );
        };

        /////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////

        if ( options.suppressImageUpload || !imageUrl ) {
            // image upload suppression is on, or there are icon or preview images:
            // just make the artifactJson
            makeArtifact( artifactJson );
            return;
        }

        //
        // image upload suppression is disabled -- upload either icon or preview image
        //
        var iconPromise = iconUrl ? protect.uploadArtifactIcon( iconUrl, app.appInstanceUUID ) : undefined;
        var previewImagePromise = previewImageUrl ? protect.uploadArtifactImage( previewImageUrl ) : undefined;
        var uploadPromise = iconPromise || previewImagePromise;

        if ( !uploadPromise ) {
            var error = 'Error uploading iconUrl or previewImage.';
            that.showMessage(error);
            if (console) console.log( error );
            makeArtifact( artifactJson, error );
            return;
        }

        //
        // unless icon upload suppression is turned on, automatically locate icons and upload them
        //
        uploadPromise.addCallback( function( localJiveImageUrl ) {
            //
            // after successful image upload, go ahead and make the artifact and return it
            //
            localJiveImageUrl = localJiveImageUrl || imageUrl;
            if ( iconUrl ) {
                protect.updateIcon( artifactJson, localJiveImageUrl );
            } else {
                protect.updatePreviewImage( artifactJson, localJiveImageUrl );
            }
            makeArtifact( artifactJson );
        }).addErrback( function( response ) {
            var error = 'Could not upload ' + imageUrl;
            that.showMessage(error);
            if (console) console.log(error, response );
            makeArtifact( artifactJson, error );
        });
    };

    protect.isProxiedUrl = function(url) {
        return url.startsWith( gadgets.io.getProxyUrl().split('?')[0] )
    };

    protect.makeRelativeAppResourceUrl = function( resourceUrl, app ) {
        var appUrlPrefix = app.appURL ? app.appURL.match(/.*\//)[0] : '';
        if(resourceUrl.match(/^http/) === null && resourceUrl.match(/^\/\//) === null) {
            return appUrlPrefix + resourceUrl;
        }

        // its not a relative url
        return null;
    };

    this.makeArtifactURLsAbsolute = function(artifact, app, avoidProxying ) {
        var deduceAbsoluteUrl = function(imageUrl) {
            var relativeUrl = protect.makeRelativeAppResourceUrl( imageUrl, app );
            if ( relativeUrl ) {
                return relativeUrl;
            } else if (imageUrl.match(/^\/\//)) {
                // if gadget return a proxied URL to an internal image extract just the image url
                if(typeof gadgets != 'undefined') {
                    var proxyUrl = gadgets.io.getProxyUrl();
                    var proxyUrlMatch = proxyUrl.match(/^https?:(\/\/.+)\?/);
                    if(proxyUrlMatch && proxyUrlMatch.length > 1) {
                        proxyUrlMatch[1] = proxyUrlMatch[1].substring(0, 2) + '.*' + proxyUrlMatch[1].substring(2); // match the ones with app prefix in domain
                        if(imageUrl.match('^' + proxyUrlMatch[1])) {
                            var matches = imageUrl.match(/url=(.+)&?/);
                            if(matches && matches.length > 1) {
                                return matches[1];
                            }
                        }
                    }
                }
            }
        };

        var normalizedArtifact = protect.normalizeArtifact( artifact );
        var previewImage = normalizedArtifact.previewImage;

        if (previewImage) {
            previewImage = deduceAbsoluteUrl(previewImage) || previewImage;
            if ( !avoidProxying && !protect.isProxiedUrl(previewImage) ) {
                previewImage = gadgets.io.getProxyUrl( previewImage );
            }
            protect.updatePreviewImage( artifact, previewImage);
        }

        var icon = normalizedArtifact.icon;
        if( icon ) {
            icon = deduceAbsoluteUrl(icon) || icon;
            if ( !avoidProxying && !protect.isProxiedUrl( icon) ) {
                icon = gadgets.io.getProxyUrl( icon );
            }
            protect.updateIcon( artifact, icon );
        }
        if (console) console.log(artifact);
    };

    protect.updatePreviewImage = function( artifact, newPreviewImage ) {
        if ( protect.deduceArtifactFormatType( artifact ) == OPENSOCIAL_2_5 ) {
            artifact.previewImage = newPreviewImage;
        } else {
            // legacy
            artifact.display.previewImage = newPreviewImage;
        }
    };

    protect.updateIcon = function( artifact, newIcon ) {
        if ( protect.deduceArtifactFormatType( artifact ) == OPENSOCIAL_2_5 ) {
            artifact['preferredExperience'].display.icon = newIcon;
        } else {
            // legacy
            artifact.display.icon = newIcon;
        }
    };

    protect.deduceArtifactFormatType = function( artifact ) {
        return artifact['preferredExperience'] ? OPENSOCIAL_2_5 : LEGACY;
    };

    protect.normalizeArtifact = function(artifact) {
        var artifactFormatType = protect.deduceArtifactFormatType( artifact );
        if ( artifactFormatType == OPENSOCIAL_2_5 ) {
        var preferredExperience = artifact['preferredExperience'];
            // we're likely parsing opensocial 2.5 format

            // translate 'gadget' -> 'embed'
            var linkType = preferredExperience.target.type;
            linkType = linkType === 'gadget' ? 'embed' : linkType;

            preferredExperience.display = preferredExperience.display || {};
            preferredExperience.target = preferredExperience.target || {};

            var displayType = preferredExperience.display.type;
            var label = displayType == "image" ? preferredExperience.display.altText : preferredExperience.display.label;

            return {
                hasPreviewImage: displayType == "image" && artifact.previewImage,
                hasIcon: displayType == "text" && Boolean(preferredExperience.display.icon),
                linkType: linkType || "none",
                label: label || artifact.actionLabel,
                icon: preferredExperience.display.icon,
                previewImage: artifact.previewImage,
                url: artifact.url,
                view: preferredExperience.target.view,
                context: artifact.context,
                artifactFormatType: artifactFormatType
            }
        } else {
            // we're likely parsing legacy jive format

            artifact.display = artifact.display || {};
            artifact.target = artifact.target || {};

            return {
                hasPreviewImage: artifact.display.type == "image",
                hasIcon: artifact.display.type == "text" && Boolean(artifact.display.icon),
                linkType: artifact.target.type || "none",
                label: artifact.display.label || artifact.actionLabel,
                icon: artifact.display.icon,
                previewImage: artifact.display.previewImage,
                url: artifact.target.url,
                view: artifact.target.view,
                context: artifact.target.context,
                artifactFormatType: artifactFormatType
            }
        }
    };

    protect.extractFileName = function(imageUrl) {
        return protect.isProxiedUrl(imageUrl) ? imageUrl.match(/.*\%2F(.+)/)[1] : imageUrl.match(/.*\/(.+)/)[1];
    };

    this.createArtifact = function(options) {

        // This code follows the same logic as the render macro
        // see: com.jivesoftware.community.renderer.macro.AppEmbeddedViewMacro#buildMacro(org.w3c.dom.Element)
        // >> THESE METHODS MUST BE KEPT IN SYNC! <<

        var rte = options.rte,
            ed = options.ed,
            appUUID = options.appUUID,
            actionId = options.actionId,
            data = options.data,
            editedContentBean = options.editedContentBean,
            appInstanceUUID = options.appInstanceUUID,
            forceRteSafeAttributes = options.rteBound;

        var useRteSafeAttributes = rte || forceRteSafeAttributes;

        var attrName = useRteSafeAttributes ? function(_){return "__" + _;} : function(_) {return "_" + _;};

        data = data || {};
        data.actionLabel = options.actionLabel;

        var normalizedData = protect.normalizeArtifact( data );

        var hasPreviewImage = normalizedData.hasPreviewImage;
        var hasIcon = normalizedData.hasIcon;
        var linkType = normalizedData.linkType;

        var label = normalizedData.label;
        var icon = normalizedData.icon;
        var previewImage = normalizedData.previewImage;

        var url = normalizedData.url;
        var view = normalizedData.view;
        var context = normalizedData.context;
        var doc = rte ? ed.getDoc() : ed;

        var link = $j(doc.createElement("a"));

        link.attr("jivemacro", "appEmbeddedView");
        link.attr("__jive_macro_name", "appEmbeddedView");

        link.attr("href", linkType == "url" ? url : "javascript:;");

        if(rte) {
            if(hasPreviewImage) {
                var canAttach = (editedContentBean && editedContentBean.attachmentConfigActionBean) ? editedContentBean.attachmentConfigActionBean.canAttach : true;
                var fileName = protect.extractFileName( previewImage);
                var $spinnerImg = $j(ed.dom.create("img")).attr("src", spinnerUrl).attr("alt", fileName);
                link.append($spinnerImg);
                var $img = $j(ed.dom.create("img")).attr("src", previewImage).attr("alt", fileName).addClass("jiveImage").hide();
                link.append($img);
                $img.load(function() {
                    $img.unbind();
                    scaleUrlImage($img);
                    $spinnerImg.unbind().remove();
                    $img.show();
                    jive.conc.nextTick(function() {
                        if(canAttach && isUploadNeeded($img)) {
                            uploadImage($img, rte, ed)
                                .addCallback(function($img) {
                                    previewImage = $img.attr('src');
                                    link.attr("__previewImage", previewImage);
                                });
                        }
                    });
                });

                link.addClass("jive-link-app-preview");
            }
            else if(hasIcon) {
                var canAttach = (editedContentBean && editedContentBean.attachmentConfigActionBean) ? editedContentBean.attachmentConfigActionBean.canAttach : true;
                link.text(label);
                link.css("background-image", "url('" + icon + "')");
                link.addClass("jive-link-app-icon");
                link.attr("__icon", icon);

                // upload image in background
                var fileName = protect.extractFileName(icon);
                var $img = $j(ed.dom.create("img")).attr("src", icon).attr("alt", fileName).hide();
                jive.conc.nextTick(function() {
                    if(canAttach && isUploadNeeded($img)) {
                        uploadArtifactIcon($img, rte, ed, appInstanceUUID)
                            .addCallback(function($img) {
                                icon = $img.attr('src');
                                link.attr("__icon", icon);
                                link.css("background-image", "url('" + icon + "')");
                            });
                    }
                });
                link.append($j(ed.dom.create("span")).addClass("j-ui-elem").addClass("j-app-link"));
            }
            else {
                link.text(label);
                link.addClass("jive-link-app");
                link.append($j(rte ? ed.dom.create("span") : doc.createElement("span")).addClass("j-ui-elem").addClass("j-app-link"));
            }
        }
        else {
            // programmatic creation
            if(hasPreviewImage) {
                var fileName = protect.extractFileName( previewImage );
                link.attr(attrName("previewImage"), previewImage);
                link.addClass("jive-link-app-preview");

                var img = $j(doc.createElement("img"));
                img.attr("src", previewImage).attr("alt", fileName).addClass("jiveImage");
                link.append( img );
            }
            else if(hasIcon) {
                link.text(label);
                if ( !$j.browser.msie ) {
                    // this is not strictly required for programmatic artifact creation, therefore
                    // if ie9 (where it blows up), don't bother putting it in
                    link.css("background-image", "url('" + icon + "')");
                }
                link.addClass("jive-link-app-icon");
                link.attr(attrName("icon"), icon);
                link.append($j(doc.createElement("span")).addClass("j-ui-elem").addClass("j-app-link"));
            }
            else {
                link.text(label);
                link.addClass("jive-link-app");
                link.append($j(doc.createElement("span")).addClass("j-ui-elem").addClass("j-app-link"));
            }
        }

        // always apply
        if (label) {
            link.attr("title", label);
        }

        link.attr(attrName("appUUID"), appUUID);
        link.attr(attrName("action_id"), actionId);

        if (linkType == "embed") {
            link.attr(attrName("view"), view || "embedded");
            link.attr(attrName("context"), JSON.stringify(context || {}));
        }

        if ( url ) {
            link.attr(attrName("url"), url);
        }

        link.attr("modifiedTitle", "true");
        link.addClass("jive_macro");
        link.addClass("jive_macro_appEmbeddedView");

        return link[0];
    };

    this.parseSelectionContextFromArtifact = function($node) {
        var context = $node.attr("__context");
        var view =  $node.attr("__view");
        var url = $node.attr("__url");
        var displayType = $node.attr("__previewImage") ? "image" : "text";
        var title = $node.attr("__title");
        var previewImage = $node.attr("__previewImage");
        var label = $node.text().trim() || "";
        var icon = $node.attr("__icon");

        /////////////////////////////
        // display
        var display = null;
        switch (displayType) {
            case "image":
                display = {
                    type: "image",
                    previewImage: previewImage
                };
                if (title) {
                    display.label = title;
                }
                break;
            case "text":
                display = {
                    type: "text",
                    label: label
                };
                if (icon) {
                    display.icon = icon;
                }
                break;
        }

        /////////////////////////////
        // target
        var targetType = (context || view) ? "embed" : "url";
        var target = null;
        switch (targetType) {
            case "embed":
                target = {
                    type: "embed",
                    view: view || "embedded"
                };
                if (context) {
                    target.context = JSON.parse(context);
                }
                if ( url ) {
                    target.url = url;
                }
                break;
            case "url":
                target = {
                    type: "url",
                    url: url || ""
                };
                break;
        }

        return {
            display: display,
            target: target
        }
    };

    /**
     * Returns a promise indicating successful upload, or error.
     * @param imageUrl
     * @param appInstanceUUID
     */
    this.uploadArtifactIcon = function( imageUrl, appInstanceUUID ) {
        var imageName = protect.extractFileName(imageUrl);
        var endpoint = jive.api.apps("instances/" + appInstanceUUID + "/attach_image") + "?name=" + imageName;
        return doImagePost( endpoint, imageUrl );
    };

    /**
     * Returns a promise indicating successful upload, or error.
     * @param imageUrl
     * @param appInstanceUUID
     */
    this.uploadArtifactImage = function( imageUrl ) {
        var imageName = protect.extractFileName(imageUrl);
        var endpoint = jive.rest.url("/rteImages") + "?name=" + imageName + "&objectId=-1&objectType=-1";
        return doImagePost(endpoint, imageUrl);
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    /// private

    function scaleUrlImage($img) {
        var imgWidth = $img.width();
        if(imgWidth > scaledPreviewImageMaxWidth) {
            //find the dimension that needs the most scaling
            var ratio = scaledPreviewImageMaxWidth / imgWidth;
            var targetWidth = Math.round(ratio * imgWidth);
            $img.attr('width', targetWidth);
        }
    }

    // determines whether the image url in the jquery image element node should be uploaded or not
    function isUploadNeeded($img) {
        var imageUrl = $img.attr('src');
        if(imageUrl.match(/^\/[^\/]/)) return 0; // that is absolute url (and does not start with //)

        var jiveUrlPrefix = '(https?:)?\/\/' + location.hostname + (location.port ? ':' + location.port : '');
        if ( !imageUrl.match('^' + jiveUrlPrefix) ) {
            // does not begins with jive hostname; in this case always upload
            return true;
        }

        // begins with jive hostname; if proxied (has gadgets proxy in path), then yes, upload
        // otherwise don't proxy
        return protect.isProxiedUrl( imageUrl ) ? 1 : 0;
    }

    function uploadArtifactIcon($img, rte, ed, appInstanceUUID) {
        var endpoint = jive.api.apps("instances/" + appInstanceUUID + "/attach_image");
        return uploadImage($img, rte, ed, endpoint);
    }


    function uploadImage($img, rte, ed, imageServiceEndPoint) {
        var imageService = rte.getImageService();

        var imageName = $img.attr('alt');
        var imageUrl = $img.attr('src');
        function handleError(){
            if (console) console.log("Image REST request failed for %s", imageName, arguments);
            $img.remove();
        }

        var uploadFinishedPromise = new jive.conc.Promise();
        //disable form submit while the REST request is pending
        var formService = rte.getFormService();
        var formToken = formService.setFormEnabled(false, ed.getLang("jiveimage.please_wait"));

        //ajax request to create attachment, then update image's src.
        imageService.createFromImageSrc(imageName, protect.isProxiedUrl(imageUrl) ? imageUrl : encodeURI(imageUrl), imageServiceEndPoint)
            .addCallback(function(img) {
                // img is the response bean from image storage webservice
                $img.load(function() {
                    var $img = $j(this);
                    $img.css({
                        "width": $img.width() + "px",
                        "height": $img.height() + "px",
                        "max-width": "",
                        "max-height": ""
                    });
                });
                $img.attr("src", img.url); // update image url
                jive.conc.nextTick(function() { ed.nodeChanged(); });
                uploadFinishedPromise.emitSuccess($img);
            })
            .addErrback(function(){
                handleError();
                uploadFinishedPromise.emitError();
            })
            .always(function(){
                formService.setFormEnabled(formToken);
            });

        return uploadFinishedPromise;
    }

    function doImagePost(endpoint, imageUrl) {
        var promise = new jive.conc.Promise();

        var settings = {
            url:endpoint,
            contentType:"application/x-www-form-urlencoded",
            processData:false,
            data:'url=' + protect.isProxiedUrl(imageUrl)  ? imageUrl : encodeURIComponent(imageUrl)
        };

        var ajaxSettings = {
            contentType:"application/json; charset=utf-8"
        };

        $j.ajax($j.extend({
            type:"POST",
            dataType:'json',
            success:function (data, textStatus, xhr) {
                if ( !data || !data.url) {
                    promise.emitError();
                } else {
                    promise.emitSuccess(data.url);
                }
            },
            error:function (response) {
                promise.emitError(response);
            },
            timeout:30000
        }, ajaxSettings, settings));

        return promise;
    }



});