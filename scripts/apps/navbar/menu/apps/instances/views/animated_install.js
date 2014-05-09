/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Menu.Apps');

/**
 * Handles UI for the animation of an app install
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/jquery/jquery.path.js
 * @depends template=jive.nav.menu.apps.instances.content
 */
jive.Navbar.Menu.Apps.InstallAnimation = jive.oo.Class.extend(function(protect) {
    var $ = jQuery;
    var promise = new jive.conc.Promise();
    var boxCssClass = "";

    var timing = {
        initialDelay: 500, // How ong the icons are visible before the "sweep" to their final positions
        delayAfterPlacedInLauncher: 250, // How long the icons stay "over" their final targets before the drawer slides away
        targetSlide: 750, // How long it takes to open/close the "drawer"
        iconSweep: 2500, // How long the "sweep" takes
        multiInstallDelay: 333, // 3 installs per second
        showMarkers: false, // for debugging
        showDouble: false // for debugging end positions
    };

    jive.conc.observable(this);

    this.init = function() {
        this._animationQueue = [];
        this._active = -1;
        this._animationRunning = false;
    };

    this.getPromise = function() {
        return promise;
    };

    protect.begin = function() {
        var anim = this;
        anim.emitP("begin").addCallback(function(data) {
            if (data && data.length > 0) {
                anim.stripDomain(data);
                var count = anim.showTarget(data);
                if (count) {
                    window.setTimeout(function() {
                        anim.animate();
                    }, timing.initialDelay);
                } else {
                    anim._animationQueue.length = 0;
                    anim.addToQueue("--last-item--");
                    anim.hideTarget();
                }
            } else {
                anim._animationQueue.length = 0;
                anim.end(false);
            }
        }).addErrback(function() {
            anim._animationQueue.length = 0;
            anim.end(false);
        });
    };

    protect.stripDomain = function(data) {
        // Images and Link in App Quick Launcher are absolute, causes login prompts and mixed content warnings. See JIVE-15593.
        // Remove the http(s)://domain(:port) part from 1. url, largeIconSrc & iconSrc
        var domainRegEx = /^https?:\/\/.+?\//;
        if(data && data.length) {
            for(var i = 0; i < data.length; ++i) {
                data[i].url = data[i].url.replace(domainRegEx, '/');
                data[i].iconSrc = data[i].iconSrc.replace(domainRegEx, '/');
                data[i].largeIconSrc = data[i].largeIconSrc.replace(domainRegEx, '/');
                data[i].favIconSrc = data[i].favIconSrc.replace(domainRegEx, '/');
            }
        }
    };

    protect.showTarget = function(data) {
        var anim = this;
        var header = $j("<div/>").css({
            "position":"absolute",
            "width":"100%",
            "top":"0",
            "left":"0",
            "visibility":"hidden",
            "z-index": "9999"
        }).html($j("#j-header-wrap").clone());
        header.find("#j-header-wrap").removeAttr("id");
        header.appendTo($j("body"));
        header.delegate("*", "click", function(e) {
            e.preventDefault();
        });
        var appsButton = header.find("#appsQuickLaunchLink").addClass("active");
        var appsButtonBottom = appsButton.offset().top + appsButton.outerHeight();
        var headerEnd = $j(document).scrollTop();
        var headerHeight = header.outerHeight();
        var headerStart = headerEnd - headerHeight - 40; // updated later

        var target = $j("<div/>").addClass("j-pop").css({
            "position":"absolute",
            "top":"0",
            "left":"0",
            "visibility":"hidden",
            "z-index": "9999"
        }).append($j("<div/>")
          .addClass("j-quick-menu j-pop-main")
          .attr("id","animatedAppQuickLaunchMenu")
          .html($j(jive.nav.menu.apps.instances.content({links:data}))));
        target.append($j("<span/>").addClass("belowArrow pointer"));
        target.insertBefore(header);
        target.delegate("*", "click", function(e) {
            e.preventDefault();
        });
        boxCssClass = target.find(".app-list-sm-icon").length ? "app-list-sm-icon" : "app-list-lg-icon";
        var targetEnd = $j(document).scrollTop() + appsButtonBottom + 8 + 3;
        var targetHeight = target.outerHeight();
        var targetStart = targetEnd - targetHeight - appsButtonBottom - 40;
        var targetCenter = appsButton.offset().left + appsButton.outerWidth() / 2;
        var targetWidth = target.outerWidth();
        var targetLeft = Math.max(targetCenter - targetWidth / 2, 96);
        target.find("> .pointer").css("left", (targetCenter - targetLeft - 9) + "px");

        var initialAnimation = window.setTimeout(function() {
            initialAnimation = null;

            headerEnd = $j(document).scrollTop();
            headerStart = Math.max(headerEnd - headerHeight - 40, ($j("body > .jive-modal").length == 0) ? 0 : -9999);
            header.css({"top":headerStart + "px", "visibility":""});
            header.animate({"top":headerEnd + "px"}, timing.targetSlide, "easeInOutSine", function() {
                anim.emit("animation.show-header.end");
            });

            targetEnd = $j(document).scrollTop() + appsButtonBottom + 8 + 3;
            targetStart = targetEnd - targetHeight - appsButtonBottom - 40;
            target.css({"top":targetStart + "px", "left": targetLeft + "px", "visibility":""});
            target.animate({"top":targetEnd + "px"}, timing.targetSlide, "easeInOutSine", function() {
                anim.emit("animation.show-target.end");
            });
        }, timing.initialDelay);

        var originalHideTarget = this.hideTarget;
        var originalResolveTarget = this.resolveTarget;
        var originalAddToQueue = this.addToQueue;
        this.hideTarget = function() {
            anim.hideTarget = originalHideTarget;
            anim.resolveTarget = originalResolveTarget;
            if (initialAnimation) {
                window.clearTimeout(initialAnimation);
                initialAnimation = null;
                header.remove();
                target.remove();
                startElementHolder.remove();
                anim.end(false);
                return;
            }
            headerStart = Math.max(headerEnd - headerHeight - 20, ($j("body > .jive-modal").length == 0) ? 0 : -9999);
            header.animate({"top":headerStart + "px"}, timing.targetSlide, "easeInOutSine", function() {
                anim.emit("animation.hide-header.end");
                header.remove();
                anim.end(true);
            });
            target.animate({"top":targetStart + "px"}, timing.targetSlide, "easeInOutSine", function() {
                anim.emit("animation.hide-target.end");
                target.remove();
            });
            startElementHolder.remove();
        };
        this.resolveTarget = function(q) {
            if (q.end.position && q.end.position.resolved) {
                return;
            }
            q.end.element = target.find(q.end.selector);
            if (q.end.element.length) {
                var offset = q.end.element.offset();
                var endElementIcon = q.end.element.find(".js-app-icon");
                q.end.size = endElementIcon.innerWidth();
                if (q.start.size != q.end.size) {
                    var startIcon = q.start.element.find("img.js-app-icon");
                    startIcon.css("margin-top",((startIcon.css("margin-top") || 0) + (128 - q.start.size) / 2) + "px");
                    var endIcon = startIcon.clone().attr("src", endElementIcon.attr("src"));
                    startIcon.addClass("app-icon-1").css({"width":q.start.size + "px", "height":q.start.size + "px", "opacity":"1", "margin-left":(0 - q.start.size) + "px"});
                    endIcon.addClass("app-icon-2").css({"width":q.start.size + "px", "height":q.start.size + "px", "opacity":"0.001"});
                    endIcon.insertBefore(startIcon);
					q.start.element.find(".app-icon-1").css({"margin-top":"-" + q.start.size + "px"});
                }
                if (timing.showMarkers) {
                    jive.Navbar.Menu.Apps.InstallAnimation.rt(0,0).prependTo(q.end.element);
                }
                var startCenter = anim.getIconCenter(q.start.element);
                q.end.position = {
                    x:offset.left + targetLeft,
                    y:offset.top + targetEnd,
                    resolved: true
                };
                if (!q.start.position.resolved) {
                    q.start.position = {
                        x:q.start.position.x - startCenter.left,
                        y:q.start.position.y - startCenter.top,
                        resolved:true
                    };
                }
            }
        };
        this.addToQueue = function(q) {
            if (q === "--last-item--") {
                anim.addToQueue = originalAddToQueue;
                return;
            }
            q.start.element.prependTo(startElementHolder);
            this.resolveTarget(q);
            this._animationQueue.push(q);
            originalAddToQueue.apply(this, arguments);
            q.start.element.css({
                "top": q.start.position.y + "px",
                "left": q.start.position.x + "px"
            });
        };

        var startElementHolder = $j("<span/>").attr("id","__animation_appIconHolder").addClass("j-pop").addClass(boxCssClass).css({"position":"absolute","top":"0","left":"0"}).appendTo($j("body"));
        var count = 0;
        for (var i = 0; i < this._animationQueue.length; ++i) {
            var q = this._animationQueue[i];
            q.start.element.prependTo(startElementHolder);
            this.resolveTarget(q);
            if (q.end.element.length) {
                count++;
                q.start.element.css({
                    "top":q.start.position.y + "px",
                    "left":q.start.position.x + "px"
                });
                if (!timing.showDouble) {
                    q.end.element.css({"visibility":"hidden"});
                }
            } else {
                q.start.element.remove();
            }
        }
        this.emit("animation.app-icon.start");
        this._animationRunning = true;
        return count;
    };

    protect.hideTarget = function() {
        this.end(true);
    };

    protect.resolveTarget = function(q) {
        q.end.element = [];
    };

    protect.addToQueue = function(q) {
        this._animationQueue.push(q);
    };

    protect.animate = function() {
        var q;
        do {
            q = this._animationQueue.shift();
            if (!q) {
                this.addToQueue("--last-item--");
                return;
            }
        } while (!q.end.element.length);
        this._active++;

        var anim = this;
        window.setTimeout(function() {
            anim.animate();
        }, timing.multiInstallDelay);

        var center = {
            x: $j(window).width() / 2 + $j(document).scrollLeft(),
            y: $j(window).height() / 2 + $j(document).scrollTop()
        };

        function xlate(p,x,y) {
            return { x: p.x + x, y: p.y + y };
        }

        q.start.element.delegate("*", "click", function(e) {
            e.preventDefault();
        });

        var bz = [
            q.start.position,
            center,
            xlate(q.end.position, 0, 150),
            xlate(q.end.position, 0, -32),
            q.end.position
        ];
        var path = {
            css: function(s) {
                var t = 1 - s;
                var c = bz.concat();
                while (c.length > 1) {
                    for (var i = 0, j = 1, l = c.length; j < l; ++i, ++j) {
                        c[i] = {
                            x: Math.round(c[i].x * s + c[j].x * t),
                            y: Math.round(c[i].y * s + c[j].y * t)
                        };
                    }
                    c.length--;
                }
                return {
                    left: c[0].x + "px",
                    top: c[0].y + "px"
                };
            }
        };

        q.start.element.animate({path:path}, timing.iconSweep, "easeOutSine", function() {
            function finish() {
                q.start.element.remove();
                anim._active--;
                if (anim._active == 0) {
                    anim.emit("animation.app-icon.end");
                    anim.hideTarget();
                }
            }
            if (timing.showDouble) { // for debugging end positions
                q.end.element.css({"visibility": ""});
                window.setTimeout(finish, timing.delayAfterPlacedInLauncher);
                return;
            }
            q.end.element.css({"visibility": "", "opacity":"0.001"});
            q.end.element.animate({"opacity":"1"}, Math.round(timing.delayAfterPlacedInLauncher * 0.333), "easeInOutSine");
            q.start.element.animate({"opacity":"0"}, Math.round(timing.delayAfterPlacedInLauncher), "easeInOutSine", finish);
        });
        if (q.start.size != q.end.size) {
			q.start.element.find(".app-icon-1").animate(
				{
					"opacity":"0.001", 
					"width":q.end.size + "px", 
					"height":q.end.size + "px",
					"margin-top":"-" + q.end.size + "px"
				}, 
				timing.iconSweep, 
				"easeOutCubic"
			);
			q.start.element.find(".app-icon-2").animate(
				{
					"opacity":"1", 
					"width":q.end.size + "px", 
					"height":q.end.size + "px"
				}, 
				timing.iconSweep, 
				"easeOutCubic"
			);
			q.start.element.find(".app-icon-2, .j-app-title").animate(
				{"opacity":"1"}, 
				timing.iconSweep
			);
        } else {
            q.start.element.find(".j-app-title").animate({"opacity":"1"}, timing.iconSweep);
        }
    };

    protect.end = function(success) {
        if (success) {
            promise.emitSuccess();
        } else {
            promise.emitError();
        }
        if (this._animationQueue.length) {
            promise = new jive.conc.Promise();
            this.begin();
        } else {
            this.emit("destroy");
            this._active = false;
        }
    };

    function parseCSS(value) {
        var num = value ? /^(0|[1-9]\d*)(.\d+)?/.exec(value) : null;
        return num ? Number(num[0]) : 0;
    }

    protect.getIconCenter = function(element) {
        var box = element.position(); // the li
        var icon = element.find("img.js-app-icon"); // the img
        var child = icon.position(); // img position
        var iconCenter = {
            top: child.top - box.top + parseCSS(icon.css("margin-top")) + icon.innerHeight() / 2,
            left: child.left - box.left + parseCSS(icon.css("margin-left")) + icon.innerWidth() / 2
        };
        console.log("getIconCenter(ele,ctr,box,child)", element, iconCenter, box, child);
        return iconCenter;
    };

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
    this.install = function(installData, offset) {
        var ias = installData.iconAnimationStart || {};
        switch (ias.size || 128) {
            case 48: new Image().src = installData.iconSrc; break;
            default: new Image().src = installData.largeIconSrc; break; ias.size = 128;
        }
        var startElement = $j(jive.nav.menu.apps.instances.renderAppInstanceLink({
            largeIconSrc: installData.largeIconSrc,
            smallIconSrc: installData.iconSrc,
            iconSize: ias.size,
            url: "#",
            title: installData.title
        })).css({"position": "absolute", "z-index": "9999"});
        startElement.find(".j-app-title").css({"opacity":"0.001"});
        if (timing.showMarkers) {
            jive.Navbar.Menu.Apps.InstallAnimation.rt(0,0).prependTo(startElement);
        }
        offset = offset || {};
        offset.left = offset.left || $j(window).width() / 2 + $j(document).scrollLeft();
        offset.top = offset.top || $j(window).height() / 2 + $j(document).scrollTop();
        var q = {
            start: {
                element: startElement,
                position: {
                    x: offset.left + (ias.x || 0),
                    y: offset.top + (ias.y || 0)
                },
                size: ias.size
            },
            end: {
                selector: "li:has(#app-ql-" + installData.appUUID + ")"
            }
        };
        this.addToQueue(q);
        if (this._active == -1) {
            this._active = 0;
            this.begin();
        }
    };

    this.isAnimationRunning = function() {
        return this._animationRunning;
    };
});

// an embedded image used for position alignment
jive.Navbar.Menu.Apps.InstallAnimation.rt = function(x,y) {
    var src = "data:image/png;base64," +
        "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" +
        "AElFTkSuQmCC";
        var img = $j("<img/>").attr("src",src).css({"position":"absolute","left":(x-12)+"px","top":(y-12)+"px","width":"25px","height":"25px"});
    return $j("<div/>").css({"position":"relative","overflow":"visible","z-index":"10001","visibility":""}).append(img).appendTo($j("body"));
};
