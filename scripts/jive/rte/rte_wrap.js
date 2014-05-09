/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Constructs and initializes an RTE, using the given options.
 *
 * Containing pages must call destroy() after they're done with the RTE, unless they're navigating away.
 *
 * @param options
 * @depends path=/resources/scripts/jive/rte/rte.js
 * @depends path=/resources/scripts/jive/rte/rte_layout.js
 */
jive.rte.RTEWrap = function(options) {
/*
 * Initialization timeline:
 *
 * jive.rte.RTEWrap constructor runs, creating the RTELayout and wiring up UI events.  It also schedules KJS async loading of the RTE JS files.
 *
 * New context, from KJS async loading (guaranteed using nextTick).
 * RTE JS files have been loaded by KJS.  The jive.rte.RTE instance is constructed.  RTEWrap listeners are wired up to the RTE in initEvents.
 *
 * New context, from RTE.
 * In RTE, TinyMCE instance is constructed.
 *
 * Possible new context.
 * In TinyMCE, TinyMCE's oninit is called, which calls getEditor in RTE.
 * In RTE, Popover/under layers constructed. TinyMCE events wired to RTE listeners.
 * editorReady promise succeeds. initFinished listeners notified.
 * In RTEWrap rteLayout.doneLoading is called, which kills the spinner.
 *
 * New context.
 * In RTEWrap, if raw is preferred, toggleEditorMode is called.
 *
 * New context.
 * In RTEWrap, rte is resized to options.height, or cookie height.
 *
 * New context, guaranteed last.
 * In RTEWrap, options.onReady is called.
 *
 */
    var jive = window.jive;


    var defaults = {
        $element        : null,
        id              : options.$element.attr("id") ? options.$element.attr("id") : "wysiwygtext",
        controller      : null,
        preset          : "wiki",                 // allowed options are in settings.js
        preferredMode   : "advanced",      // allowed options are "rawhtml" or "advanced"
        startMode       : "advanced",
        mobileUI        : false,
        toggleText      : "",
        alwaysUseTabText    : "",
        editDisabledText    : "",
        editDisabledSummary : "",
        isEditing       : false,
        height          : 0,
        onReady         : function() {}
    };
    options = $j.extend({}, defaults, options);

    // Changed the name on this to match the actual RTE variable but desire backwards compat...
    options.images_enabled = options.images_enabled || options._imagesEnabled || false;

    var currentMode = "advanced";
    var preferredMode = options.preferredMode ? options.preferredMode : "advanced";
    var rte, rteLayout;
    var main = this;

    if(options.mobileUI){
        currentMode = "rawhtml";
        preferredMode = "rawhtml";
    }

    // only setup an RTE if we've been told an element
    if (!options.$element || !options.$element.length) { return; }

    this.destroy = function(){
        rte.destroy();
        rteLayout.teardown();
        options.$element.remove();
        window.editor.clear(options.id);
    };

    this.teardownServices = function() {
        rte.teardownServices();
    };

    function setPreferredEditorMode(mode) {
        if(options.mobileUI){
            refreshLinks();
            return;
        }
        WikiTextConverter.setPreferredEditorMode(mode,
            {
                callback: function() {
                    // Assigns new preferred mode to a global variable.
                    preferredMode = mode;

                    // Updates RTE mode switching links.
                    refreshLinks();
                },
                timeout: DWRTimeout, // 20 seconds
                errorHandler: editorErrorHandler
            }
        );
    }

    function refreshLinks() {
        if (options.mobileUI) {
            // safari 2, text only
            rteLayout.hideToggleHtmlButton();
            rteLayout.hidePreferredButton();
            return;
        }

        if(currentMode == 'rawhtml') {
            rteLayout.showToggleHtmlButton();
        }else{
            rteLayout.hideToggleHtmlButton();
        }

        if (preferredMode == currentMode) {
            rteLayout.hidePreferredButton();
        } else {
            rteLayout.showPreferredButton();
        }
    }

    function initEvents(rte, rteLayout) {
        var list = new jive.rte.RTEListener();
        if(options.height == 0){
            list.onResize = function(edid){ return function(){
                // Expire cookies in a year
                var expires = new Date();
                expires.setTime(expires.getTime() + 3600000 * 24 * 365);
                var h = window.editor.get(edid).getHeight();
                var contextPath = window._jive_base_url == '' ? '/' : window._jive_base_url;
                setCookie("jive_wysiwygtext_height", "" + h, expires, contextPath);
            }}(options.id);
        }
        list.onKeyUp = function(){
            rteLayout.expandToFitContent();
        };
        list.doneTogglingMode = function(){
            if(currentMode == "advanced"){
                currentMode = "rawhtml";
            }else{
                currentMode = "advanced";
            }
            refreshLinks();
        };

        list.initFinished = function rteWrapInitFinishedHandler(){
            var toggleDeferred = new $j.Deferred();
            if(preferredMode == "rawhtml"){
                jive.conc.nextTick(function toggleToRawHtmlMode(){
                    rte.toggleEditorMode(rte.getID());
                    toggleDeferred.resolve();
                });
            }else{
                toggleDeferred.resolve();
            }

            var resizeDeferred = new $j.Deferred();
            jive.conc.nextTick(function resizeRte(){
                var h = options.height;
                if(!h){
                    try{
                        h = parseInt(getCookie("jive_wysiwygtext_height"));
                    }catch(e){
                        h = 500;
                    }
                    if(!h) h = 500;
                }
                if(tinymce.isGecko) { // JIVE-15672: Firefox incorrectly calculates RTE height onInit.
                    setTimeout(function() {
                        rteLayout.resizeTo(h);
                        rteLayout.expandToFitContent(); //expand to fit content
                        rteLayout.reposition(); //make sure we're positioned correctly.
                        resizeDeferred.resolve();
                    }, 300);
                } else {
                    rteLayout.resizeTo(h); //h will be the minimum height
                    rteLayout.expandToFitContent(); //expand to fit content
                    rteLayout.reposition(); //make sure we're positioned correctly.
                    resizeDeferred.resolve();

                    if(tinymce.isIE){
                        //IE 7-8 need to be smacked so that they draw their content.
                        tinymce.activeEditor.getBody().className += " ";
                    }
                }
            });

            rteLayout.doneLoading(rte);

            $j.when(resizeDeferred, toggleDeferred).done(jive.conc.nextTick(function runOnReady(){
                options.onReady();
            }));
        };

        //legacy autosave stuff for message recovery
        if (options.autoSave && options.autoSave.messageChangeHandler) {
            list.onKeyUp = function(){ options.autoSave.messageChangeHandler(); };
            list.onChange = function(){ options.autoSave.messageChangeHandler(); };
        }

        rte.addListener(list);
    }

    //make the text in the form's textarea invisible (transparent doesn't work on IE8)
    options.$element.css("color", "white");

    //asynchronously load the RTE
    require(['jive.rte'], function() {
        //make sure that if the RTE is already loaded, we don't try to init it before its DOM is present.
        jive.conc.nextTick(function kjsLoadCallback() {
            // Pass through specific rte_wrap options to override underlying RTE settings
            var jiveRTEOptions = {
                images_enabled: options.images_enabled || false,
                rteLayout: rteLayout
            };
            rte = new jive.rte.RTE(options.services, options.id, options.preset, jiveRTEOptions);

            rte.getReadyPromise().fail(function(){
                rteLayout.doneLoading(rte);
            }).always(function(){
                //in case we fail to load the RTE, or we show it later for some other reason, reset the form textarea's color
                options.$element.css("color", "");
            });

            if (options.mobileUI) {
                if (options.isEditing) {
                    rte.setDisabled(true);
                    rte.getReadyPromise().fail(jive.conc.nextTick(function(){
                        options.$element.hide();
                    }));
                }else{
                    rte.getReadyPromise().fail(jive.conc.nextTick(function(){
                        options.$element.hide();
                        rteLayout.getUserTextarea().show();
                        rteLayout.reposition();
                    }));
                }
                // if i'm mobile and not disabled, /then/ load up the mobile editor
                options.$element.before("<input name='mobileEditor' value='true' type='hidden' />");
                rte.setMobileOnly(true);
            }

            //RTEWrap is effectively a subclass of RTE.  Copy across all the properties that aren't overridden.
            for (var property in rte) {
                if (typeof(main[property]) == "undefined") {
                    main[property] = rte[property];
                }
            }

            jive.rte.multiRTE.push(options.id);
            window.editor.put(options.id, main);

            initEvents(rte, rteLayout);
        });
    });

    //while we're waiting for the RTE to load, set up a couple of things
    if (jive.rte.LinkService) {
        options.services = $j.extend({
            linkService: new jive.rte.LinkService()
        }, options.services);
    }

    rteLayout = new jive.rte.RTELayout({
        $element: options.$element,
        toggleText: options.toggleText,
        alwaysUseTabText: options.alwaysUseTabText,
        destinationPosition: options.destinationPosition,
        readOnlyMessage: options.mobileUI && options.isEditing,
        editDisabledText: options.editDisabledText,
        editDisabledSummary: options.editDisabledSummary,
        communityName: options.communityName,
        shouldFloat: options.shouldFloat
    });
    rteLayout.addListener("setPreferred", function() {
        setPreferredEditorMode(currentMode);
    });
    rteLayout.addListener("toggleHtml", function(){
        rte.toggleEditorMode(options.id);
    });

    /**
     * for testing
     */
    this._getLayout = function(){
        return rteLayout;
    };

    refreshLinks();
};
