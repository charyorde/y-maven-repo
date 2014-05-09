/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.CommentApp.FormView
 *
 * Handles rendering comment post forms and handles RTE setup and teardown.
 * Create an instance of this class with a DOM element container as an argument
 * to render a form.  Call the `remove` method to get rid of the form.
 */

/*jslint browser:true evil:true laxbreak:true */
/*extern jive $j $Class tinymce jiveControl WikiTextConverter DWRTimeout */

jive.namespace('SharedViews');

/**
 * @depends template=jive.DiscussionApp.soy.rteMsgQuote
 */
jive.SharedViews.RteView = $Class.extend({
    init: function(container, options) {
        this._preferredMode         = window.preferredMode || options.preferredMode || "advanced";
        this._container             = $j(container);
        this._formActionContainer   = (options.formActionContainer) ? $j(options.formActionContainer) : this._container;
        this._rteDisabledBrowser    = options.rteDisabledBrowser;
        this._resourceID            = options.resourceID;
        this._resourceType          = options.resourceType;
        this._isAnonymous           = options.isAnonymous;
        this._templateName          = options.templateName || "rte-template";
        this._bodyContent           = options.bodyContent;
        this._settingsID            = options.settingsID || "mini";
        this._i18n                  = options.i18n;
        this.images_enabled         = options.imagesEnabled;

        var that = this;

        $j(document).ready(function() {
            // Render the form.
            that._render();

            // Set up the RTE if the browser supports it.
            if (!that._rteDisabledBrowser) {
                that._createRTE();
            }

            // Set up event handlers for form events.
            that._addListeners();
        });
    },

    /* ** public methods ** */

    /**
     * remove()
     *
     * Removes the form from the DOM and tears down the RTE, if appropriate.
     */
    remove: function() {
        if (!this._rteDisabledBrowser) {
            if(this._rte) {
                this._rte.destroy();  // Tear down the RTE.
            }
            window.editor.clear('wysiwygtext');  // Remove reference to RTE from window.editor hash.
            jive.rte.multiRTE = jive.rte.multiRTE.filter(function(e) {
                return e != 'wysiwygtext';
            });
        }
        this._container.find('form').remove();  // Remove form from the DOM.
        $j(window).unbind("unload", this._unloadCallback);
        this.emit('remove');
    },

     /**
     * val()
     *
     * Gets and sets the value of the RTE.
     */
    val: function(body) {
        if(body) {
           this._rte.setHTML(body);
           return this;
        }
        else{
            return this._getContentBody();
        }
    },

    /**
     * setPreviewButtonText(text)
     *
     * Sets the text of the form preview button.
     */
    setPreviewButtonText: function(text) {
        this._container.find('[name=preview]').val(text);
    },

    /* ** protected methods ** */

    focus: function() {
        this._rte.tinymceFocus();
    },

    _initEditor: function() {
        this._currentMode = "advanced";
        var that = this;

        var list = new jive.rte.RTEListener();
        list.doneTogglingMode = function() {
            if (that._currentMode == "advanced"){
                that._currentMode = "rawhtml";
            } else {
                that._currentMode = "advanced";
            }
            that._refreshLinks();
            that.emit('toggle', that._currentMode);
        };
        this._rte.addListener(list);

        if (this._preferredMode == "rawhtml") {
            this._rte.toggleEditorMode('wysiwygtext');
        } else if (tinymce.isIE) {
            // IE fails at rendering the mini rte in comments
            // unless i toggle it twice. super awesome.
            this._rte.toggleEditorMode();
            this._rte.toggleEditorMode();
        }
    },

    _initRTE: function() {
        var that = this;

        if (this._rte.isTextOnly()) {
            $j('#wysiwyg-panel').removeClass('loading');
            this._preferredMode = 'rawhtml';
            this._currentMode = 'rawhtml';
            return;
        }

        this._initEditor();
        this._refreshLinks();

        // We need to put focus() in a new execution context for Firefox.
        // See CS-20648.
        setTimeout(function() {
            that.focus();
        }, 0);

        this.emit('ready');
    },

    _createRTE: function() {
        var that = this;

        // Pass through specific rte_wrap options to override underlying RTE settings
        var jiveRTEOptions = {
            images_enabled: this.images_enabled || false
        };

        this._rte = new jive.rte.RTE(jiveControl, 'wysiwygtext', this._settingsID, jiveRTEOptions);  // Initialize RTE.
        window.editor.put('wysiwygtext', this._rte);  // Store reference to RTE in window.editor hash.
        jive.rte.multiRTE.push('wysiwygtext');

        var listener = new jive.rte.RTEListener();
        listener.initFinished = function(rte) {
            that._initRTE();
        };
        this._rte.addListener(listener);
    },

    _getContentBody: function() {
        if (!this._rteDisabledBrowser) {
            return this._rte.getHTML();
        } else {
            return this._container.find('textarea:visible').val();
        }
    },

    _getValues: function() {
        return {
            body: this._getContentBody()
        };
    },
    _postHandler:function(){
        this.emit('post', this._getValues());
        return false;
    },
    _addListeners: function() {
        var that = this;

        // Listen to click events on form buttons.
        this._formActionContainer
        .find('[name=post]').click(function() {
            return that._postHandler();    
        }).end()

        .find('[name=preview]').click(function() {
            that.emit('preview', that._getValues());
            return false;
        }).end()

        .find('[name=cancel]').click(function() {
            that.emit('cancel', that._getValues());
            that._unload();
            return false;
        });

        // Listen for editor mode switches.
        this._container
        .find('.toggle_preferred_mode').click(function() {
            var mode = that._currentMode;
            WikiTextConverter.setPreferredEditorMode(mode, {
                callback: function() {
                    that._preferredMode = mode;
                    window.preferredMode = mode;
                    that._refreshLinks();
                },
                timeout: DWRTimeout // 20 seconds
            });
            return false;
        }).end()

        .find('.toggle_html').click(function() {
            that._rte.toggleEditorMode('wysiwygtext');
            return false;
        });

        this._unloadCallback = this._unload.bind(this);
        $j(window).bind("unload", this._unloadCallback);
    },

    _unload: (function() {
        //used to clean up image picker session
    }),

    // Simple JavaScript Templating
    // John Resig - http://ejohn.org/ - MIT Licensed
    _template: (function(){
        var cache = {};

        return function tmpl(str, data){
            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
            var fn = /^[\w\-]+$/.test(str) ?
            cache[str] = cache[str] ||
            tmpl(document.getElementById(str).innerHTML) :

            // Generate a reusable function that will serve as a template
            // generator (and which will be cached).
            new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +

            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +

            // Convert the template into pure JavaScript
            str
            .replace(/[\r\t\n]/g, " ")
            .replace(/(^|%>)(.+?)(<%|$)/, function(all, prefix, text, postfix) {
                return prefix + encode(text) + postfix;
            })
            .split("<%").join("\t")
            .replace(/((^|%>)[^\t]*)'/g, "$1\r")
            .replace(/\t=(.*?)%>/g, "',$1,'")
            .split("\t").join("');")
            .split("%>").join("p.push('")
            .split("\r").join("\\'") + "');}return p.join('');");

            // Provide some basic currying to the user
            return data ? fn( data ) : fn;

            function encode(text) {
               return text.replace("'", '&apos;')
                .replace('\\', '\\\\')
            }
        };
    })(),

    _render: function() {
        this._container.append(this._template(this._templateName, {body:this._bodyContent}));
    },

    _refreshLinks: function() {
        this._container.find('.toggle_html').toggle(
            this._currentMode == "rawhtml"
        );
        this._container.find('.toggle_preferred_mode').toggle(
            this._preferredMode != this._currentMode
        );
    }
});

jive.SharedViews.RteView.setMiniRTEQuotedMsg = function(userName, i18n, isAnonymous, msgBody){
    // set the global var used by the rte for quotes
    window._jive_gui_quote_text = jive.DiscussionApp.soy.rteMsgQuote({i18n:i18n, userName:userName, isAnonymous:isAnonymous,
        msgBody:msgBody});
};
// Mixes in `addListener` and `emit` methods so that other classes can
// listen to events from this one.
jive.conc.observable(jive.SharedViews.RteView.prototype);
