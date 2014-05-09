/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j console $def tinymce */

jive.namespace('hte');

/**
 * The (relatively) light-weight, limited Hyper-Text Editor.
 */
jive.hte.HTE = function(selector, options){
    var $elements = $j(selector);
    if($elements.length != 1){
        console.log("selector must select a single element.  Selector: ", selector, $elements);
        throw new Error("selector must select a single element", selector, $elements);
    }

    var that = this;

    //The public interface//////////////////////////////////
    jive.conc.observable(this);
    this.editor = null;
    this.$elem = $elements;
    this.load = initCheck(load);
    this.save = initCheck(save);
    this.getValue = initCheck(getValue);

    //Set up options
    options = $j.extend({}, {
        //defaults go here
    }, options);

    //Initialize the editor
    var initPromise = initHte(selector, options);
    initPromise.done(function($elem){
        that.editor = tinymce.get($elem.prop("id"));
        that.emit("initFinished", this);
    }).fail(function($elem){
        console.log("failed to construct hyper-text editors for element", $elem);
        that.emit("initFailed", this);
    });

    function initCheck(toCall){
        return function initCheckImpl(){
            if(!this.editor){
                console.log("not initialized when attempting to call " + toCall.name);
                throw new Error("The HTE is not yet initialized");
            }
            return toCall.apply(this, arguments);
        }
    }

    function load(htmlText){
        this.editor.setContent(htmlText);
    }

    function getValue(){
        return this.editor.getContent();
    }

    function save(){
        var value = this.getValue();
        this.$elem.val(value);
    }

    function idGen(){
        if(!jive.hte.HTE.next){
            jive.hte.HTE.next = 1;
        }
        return jive.hte.HTE.next++;
    }

    function initHte(selector, options){
        var initDeferred = new $j.Deferred();
        try{
            //asynchronously load the RTE JS files
            define(['jive.rte'], function() {
                try{
                    var $elem = $j(selector);
                    if(!$elem.prop('id')){
                        $elem.prop("id", "hypertext-editor-id-" + idGen());
                    }

                    function onReady(){
                        initDeferred.resolve($elem);
                    }

                    //set up settings for tinymce
                    var settings = {
                        mode: "exact",
                        theme: "advanced",
                        theme_advanced_toolbar_location : "none",
                        theme_advanced_statusbar_location : "none",
                        content_css : computeRTEPluginStyle(CS_RESOURCE_BASE_URL + "/styles/tiny_mce3/themes/advanced/skins/default/content.css"),
                        editor_css: ' ', //suppress loading of non-existent "hte" styles.  Styles are in jive.css, which is already present.
                        body_class : "tiny_mce_content",
                        plugins: "paste",
                        skin: "hte",
                        formats: {
                            alignleft: { },
                            aligncenter: { },
                            alignright: { },
                            alignfull: { },
                            bold: { },
                            italic: { },
                            underline: { },
                            strikethrough: { },
                            forecolor: { },
                            hilitecolor: { },
                            fontname: { },
                            fontsize: { },
                            blockquote: { },
                            removeformat: { },
                            h1: { },
                            h2: { },
                            h3: { },
                            h4: { },
                            h5: { },
                            h6: { },
                            div: { },
                            address: { },
                            pre: { },
                            code: { },
                            dt: { },
                            dd: { },
                            samp: { }
                        },
                        valid_elements : "p/div/pre/blockquote/h1/h2/h3/h4/h5/h6,a[href],span[class|id|data-*]",
                        oninit: function initCallback(){
                            var ed = tinymce.get($elem.prop("id"));
                            ed.onInit.add(onReady);
                        },
                        oninitFail: function initFailCallback(){
                            initDeferred.reject($elem);
                        },
                        elements: $elem.prop("id")
                    };

                    tinymce.init(settings);
                }catch(ex){
                    console.log("Failed to init the HTE", ex);
                    jive.conc.nextTick(function(){
                        initDeferred.reject($elem, "initHte failed", ex);
                    });
                }
            });
        }catch(ex){
            console.log("Failed load the TinyMCE JS files", ex);
            jive.conc.nextTick(function(){
                initDeferred.reject($elem, "TinyMCE failed to load", ex);
            });
        }
        return initDeferred.promise();
    }
};
