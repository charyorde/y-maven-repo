/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Menu.Apps');  // Creates the namespace if it does not already exist.

/**
 * static functions used to initiate app install animations
 *
 * @depends path=/resources/scripts/apps/navbar/menu/apps/instances/views/animated_install.js
 * @depends path=/resources/scripts/apps/shared/models/app_instance_source.js
 */
(function() {

    var anim = null;

    /**
     * Animates the installation of an app by flying the app's icon from a
     * predetermined place on the screen to the app launcher.
     * @param installData an object describing attributes of an app, typically
     *     built from a DashboardAppInstanceView
     * @param installData.appUUID the UUID of the app beign installed.
     * @param installData.favIconSrc the URL of the app's 16x16 icon.
     * @param installData.iconSrc the URL of the app's 48x48 icon.
     * @param installData.largeIconSrc the URL of the app's 128x128 icon.
     * @param installData.title the app's title.
     * @param installData.iconAnimationStart.x the absolute horizontal center X
     *     coordinate of the starting position of the app's icon.
     * @param installData.iconAnimationStart.y the absolute vertical center Y
     *     coordinate of the starting position of the app's icon.
     * @param installData.iconAnimationStart.size the starting size of the
     *     app's icon, in pixels. Default is 128.
     * @param offset.left The absolute left coordinate of the iframe in which
     *     installData.iconAnimationStart.x is based.
     * @param offset.top The absolute top coordinate of the iframe in which
     *     installData.iconAnimationStart.y is based.
     */
    jive.Navbar.Menu.Apps.animatedInstall = function(installData, offset) {
        // no animation allowed if IE and less than IE9.
        var noAnimation = $j.browser.msie && $j.browser.version < 9;
        if (installData.iconAnimationStart && !noAnimation ) {
            if (!anim) {
                anim = new jive.Navbar.Menu.Apps.InstallAnimation();
                var source = new jive.AppInstanceSource();
                anim.addListener("begin", function(promise) {
                    source.findAll({}).addCallback(function(data) {
                        promise.emitSuccess(data);
                    }).addErrback(function() {
                        promise.emitError();
                    });
                });
                anim.addListener("destroy", function() {
                    anim = null;
                });
                anim.offset = offset;
            }
            anim.install(installData, anim.offset);
            return anim.getPromise();
        } else {
            var promise = new jive.conc.Promise();
            promise.emitError();
            return promise;
        }
    };

    /**
     * There is a short delay incurred before animation begins due to the
     * extensive amount of work required to render DOM elements and compute key
     * positions used during the animation. Some of this work must be performed
     * asynchronously as it requires an ajax server call.
     *
     * The promise returned here succeeds when the initial icon positions are
     * known and they become visible. If no animation is queued, or a running
     * animation has already revealed the icons, a failed promise is returned,
     * one which emits an error.
     */
    jive.Navbar.Menu.Apps.whenAnimationStarts = function() {
        var promise = new jive.conc.Promise();
        if (anim && !anim.isAnimationRunning()) {
            anim.addListener("animation.app-icon.start", function(){
                promise.emitSuccess();
                jive.switchboard.emit("app.install.animation.started");
            });
        } else {
            promise.emitError();
        }
        return promise;
    };

    /**
     * The promise returned here succeeds when the currently running animation
     * completes. If no animation is running, a failed promise is returned, one
     * which emits an error.
     */
    jive.Navbar.Menu.Apps.whenAnimationEnds = function() {
        var promise = new jive.conc.Promise();
        if (anim) {
            anim.addListener("destroy", function(){
                promise.emitSuccess();
                jive.switchboard.emit("app.install.animation.ended");
            });
        } else {
            promise.emitError();
        }
        return promise;
    };
})();
