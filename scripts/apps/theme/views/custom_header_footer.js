/**
 * @depends path=/resources/scripts/jive/dispatcher.js
 * @depends path=/resources/scripts/jquery/jquery.lightbox_me.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 * @depends template=jive.theme.customCssHtmlError
 */

/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 * @depends path=/resources/scripts/jquery/jquery.form.js
 */
define('jive.Theme.CustomHeaderFooter', ['jquery'], function($) {
    return function CustomHeaderFooter(palettes) {
        var self    = jive.conc.observable({}),
            enabled = false;


        self.enable = function() {
            enabled = true;
            return self;
        };

        self.disable = function() {
            enabled = false;
            return self;
        };


        // constructor
        jive.dispatcher.listen('editCustomCssHtml', function() {
            $(this).closest('.js-chooser').trigger('close');
            var $context = $(jive.theme.customCssHtmlDialog()).appendTo('body'),
                $popover = $context.lightbox_me({
                    destroyOnClose : true,

                    onLoad : function() {
                        $j('#j-custom-css-html-form').ajaxForm({
                            success : function(result) {
                                var customValues = {
                                    customFooterCSSRendered  : result.scrubbedFooterCss,
                                    customFooterHTMLRendered : result.scrubbedFooterHtml,
                                    customHeaderCSSRendered  : result.scrubbedHeaderCss,
                                    customHeaderHTMLRendered : result.scrubbedHeaderHtml
                                };
                                $('textarea').each(function() {
                                    customValues[$(this).attr('id')] = $(this).val();
                                });
                                palettes.setCssValues(customValues);

                                $popover.trigger('close');
                            },

                            error : function() {
                                $j(jive.theme.customCssHtmlError()).message({ style: 'error' });
                            },

                            clearForm : false,
                            resetForm : false
                        });


                        var cssValues = palettes.getCssValues();
                        $context.find('textarea').each(function() {
                            $(this).val(cssValues[$(this).attr('id')] || '');
                        });
                    }
                });
            });



        return self;
    };
});