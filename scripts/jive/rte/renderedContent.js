/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace("rte");

/**
 * This is a static singleton.
 *
 * After content is rendered, anywhere in the app, call
 *
 * jive.rte.renderedContent.emit("renderedContent", container);
 *
 * where container is a jQuery context (so a jQuery object or an element) where we'll find one or more
 * .jive-rendered-content elements.
 *
 * The default handler will take care of table sorting, syntax highlighting and lightbox.
 * @depends path=/resources/scripts/jquery/jquery.lightbox_media.js
 * @depends path=/resources/scripts/jquery/jquery.tablesorter.js
 */
if (!jive.rte.renderedContent) {
    jive.rte.renderedContent = (function(){
        function handleRenderedContent(contentContainer, options) {
            var opts = $j.extend({}, {
                contentSelector: "div.jive-rendered-content",
                syntaxSelector: 'pre[name="code"], textarea[name="code"]'
            }, options || {});
            if (contentContainer) {
                if (typeof contentContainer.getContent == "function") {
                    contentContainer = contentContainer.getContent();
                }
            } else {
                contentContainer = document;
            }

            // Run the selector in the next tick, because this will sometimes miss
            // native asynchronous dom manipulation operations that are in progress
            var self = this;
            jive.conc.nextTick(function () {
                var $renderedContent = $j(opts.contentSelector, contentContainer);
                self.emit("renderedContentWithSelector", $renderedContent, opts);

                //Lightbox
                jive.bindLightboxMedia({context: $j(contentContainer)});
            });
        }

        function modifyRenderedContent($renderedContent, opts){
            //Table sorting
            $renderedContent.find("table").each(function(){
                //jquery.metadata is problematic for many reasons (global config, the use of eval(), etc.), so we avoid it.
                var $table = $j(this);
                var tsOptions = $j.extend({}, {'textExtraction': 'complex'}, $table.data("tablesorter") || {});
                $table.tablesorter(tsOptions);
            });

            //Syntax highlighting
            $renderedContent.find(opts.syntaxSelector).each(function() {
                var $this = $j(this);

                if (!$this.data('highlighted')) {
                    dp.SyntaxHighlighter.Highlight(this);
                    $this.data('highlighted', true);
                }
            });
        }

        function RenderedContentClass(){
            this.addListener("renderedContent", handleRenderedContent);
            this.addListener("renderedContentWithSelector", modifyRenderedContent);
        }
        jive.conc.observable(RenderedContentClass.prototype);

        return new RenderedContentClass();
    })();

    //Global rendered content handler; catches all .jive-rendered-content elements present on ready.
    $j(function(){
        jive.rte.renderedContent.emit("renderedContent");
    });
}