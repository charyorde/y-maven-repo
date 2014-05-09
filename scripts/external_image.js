/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true undef:true */
/*global jive $j window */

/**
 * @name jive.ExternalImage
 * @depends template=jive.ExternalImage.soy.*
 */
jive.namespace('ExternalImage');

jive.ExternalImage.Main = jive.oo.Class.extend(function(protect) {
	this.init = function() {
        var main = this;
        this.dismissed = false;
        this.$banner = null;

        jive.rte.renderedContent.addListener("renderedContent", function(container) {
            main.scanForUnwrappedExternalImages(container);
        });

        $j(function() {
            main.scanForUnwrappedExternalImages();
        });
    };

    this.scanForUnwrappedExternalImages = function(searchRoot) {
        var main = this;
        searchRoot = searchRoot || window.document;
        var hidden_external_count = 0;
        $j('img.jive-external-image', searchRoot).each(function(index, elem) {
            main.wrapImage(elem);
            ++hidden_external_count;
        });
        $j('a.jive-external-image', searchRoot).each(function(index, elem) {
            main.wrapImageLink(elem);
            ++hidden_external_count;
        });
        if (hidden_external_count > 0) {
            main.updateBanner();
            return true;
        }
        return false;
    };

    protect.wrapImage = function(elem) {
        var main = this;
        var $image = $j(elem);
        var imageHeight = Math.max(30, $image.height());
        var imageWidth = Math.max(250, $image.width());
        var $wrapper = $j(jive.ExternalImage.soy.renderImageWrapper({
            image_width: imageWidth,
            image_height: imageHeight
        }));
        $image
            .css('margin', '0px')
            .removeClass("jive-external-image").addClass("jive-external-image-wrapped")
            .hide()
            .replaceWith($wrapper);
        $wrapper
            .append($image)
            .click(function() {
                main.acceptImage($image);
                main.updateBanner();
            });
    };

    protect.wrapImageLink = function(elem) {
        var main = this;
        var $imageLink = $j(elem);
        var $wrapper = $j(jive.ExternalImage.soy.renderImageLinkWrapper());
        $imageLink
            .removeClass("jive-external-image").addClass("jive-external-image-wrapped")
            .hide()
            .replaceWith($wrapper);
        $wrapper
            .append($imageLink)
            .click(function() {
                main.acceptImage($imageLink);
                main.updateBanner();
            });
    };

    protect.updateBanner = function() {
        var main = this;
        var hidden_external_count = $j("a.jive-external-image-wrapped, img.jive-external-image-wrapped").length;
        if (main.$banner && (hidden_external_count == 0 || main.dismissed)) {
            main.$banner.parent().find('button').click(); //dismiss the banner
        } else if (main.$banner || (hidden_external_count > 0 && !main.dismissed)) {
            main.displayBanner(hidden_external_count);
        }
    };

    protect.displayBanner = function(hidden_external_count){
        var main = this;
        var $newBanner = $j(jive.ExternalImage.soy.renderAcceptAllBanner({
            plural: hidden_external_count > 1
        }));
        $newBanner.find("a.jive-external-image-banner-click").click(main.acceptAllImages.bind(main));
        if(this.$banner){
            //message already visible; update message with correct plural.
            this.$banner.replaceWith($newBanner);
            this.$banner = $newBanner;
        }else{
            //show message
            this.$banner = $newBanner;
            this.$banner.message({
                dismissIn: 0,
                dismissCallback: function() {
                    main.dismissed = true;
                    main.$banner = null;
                }
            });
        }
    };

    protect.acceptAllImages = function() {
        var main = this;
        $j('img.jive-external-image-wrapped').each(function(index, elem) {
            main.acceptImage($j(elem));
        });
        $j('a.jive-external-image-wrapped').each(function(index, elem) {
            main.acceptImageLink($j(elem));
        });
        main.updateBanner();
    };

    protect.acceptImage = function($image) {
        $image.parent().replaceWith($image);
        $image.attr('src', $image.attr('alt'))
            .removeClass('jive-external-image-wrapped')
            .fadeIn();
    };

    protect.acceptImageLink = function($imageLink) {
        $imageLink.parent().replaceWith($imageLink);
        $imageLink.removeClass('jive-external-image-wrapped')
            .fadeIn();
    };

});

externalImage = new jive.ExternalImage.Main();
