/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*globals alert */

jive.namespace('Modalizer');

/**
 * Handles modalization of existing view.
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 */
jive.Modalizer.ModalView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery
        , _ = jive.Modalizer;

    protect.init = function(opts) {

        var view = this,
            width,
            styles = {};

        if (opts.width && opts.width.match(/^(narrow|medium|wide)$/i)) {
            width = 'jive-modal-'+ opts.width;
        } else if (opts.width) {
            styles.width = opts.width;
        } else {
            width = 'jive-modal-medium';
        }

        var modalize = function(event) {
            var url = $(this).attr("href") || $(this).find('a:first').attr("href");

            if (url) {
                view.emitP('launch', url).addCallback(function(data) {
                    var $lb = $('<div/>',{
                        'class': 'jive-modal j-modal' + (width ? ' ' + width : ''),
                        'id': 'js-modalized'
                    }).css(styles);
                    var htmlAndScripts = view.separateScripts(data);
                    var html = view.shiv(htmlAndScripts[0]);
                    var scripts = htmlAndScripts[1];
                    var isHtml5Browser = !$.browser.msie || parseInt($.browser.version, 10) > 8;

                    /*
                     * JIVE-11237
                     *
                     * Apparently the innerShiv functionality included in jQuery > 1.7 will not work until the elements
                     * are actually in the DOM. This check is a work-around that inserts the HTML before opening lightbox
                     * for all other browsers.  For IE<9 the HTML is not loaded until after the lightbox has fully loaded.
                     */
                    isHtml5Browser && $lb.html(html);
                    $lb.lightbox_me({
                        destroyOnClose:true,
                        onClose: opts.onClose,
                        onLoad: function() {
                            if (!isHtml5Browser) {
                                $lb.html(html);
                                scripts();
                            }
                        }
                    });
                    if (isHtml5Browser) {
                        scripts();
                    }
                });
            } else {
                alert("No valid URL found to modalize");
            }
            event.preventDefault();
        };

        $(document).ready(function() {
            if (opts.triggers){
                 $.each(opts.triggers, function(){
                    $('' + this).click(modalize);
                 });
            }
            if (opts.liveTriggers){
                 $.each(opts.liveTriggers, function(){
                    $('' + this).live('click', modalize);
                 });
            }
        });
    };

});
