/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends template=jive.nav.customFooter
 * @depends template=jive.nav.header
 * @depends template=jive.theme.cssTemplate
 * @depends template=jive.theme.logoMenuControl
 * @depends template=jive.theme.mainNavigationControl
 * @depends template=jive.theme.mockUserName
 * @depends template=jive.theme.searchControl
 * @depends template=jive.theme.updateActivityCount
 * @depends template=jive.theme.userMenuControl
 */
define('jive.Theme.FrameController', ['jquery'], function($) {
    return function FrameController($$, $frame, dispatcher, palettes, navbarDescriptor) {
        function closePopovers() {
            $('.js-pop > :eq(0)').trigger('close');
        }

        function isCustomHeader() {
            var css = palettes.getCssValues();
            return css.headerAndNavigationType === 'custom';
        }

        function resize() {
            try {
                $frame.css('height', $frame.contents().height());
            } catch (e) {
                /*
                 * JIVE-16776, JIVE-18165
                 * When returning from preview mode in Firefox, $frame.contents() throws a javascript error.  The fix for
                 * this in JIVE-16776 caused JIVE-18165
                 */
                $frame.css('height', $('html').height());
            }
        }

        function sync() {
            var cssValues = palettes.getCssValues();

            syncCss(cssValues);
            syncHeaderAndFooter(cssValues);
            syncActivityCount();
            syncMenuControls();
            resize();
            muteEvents();
        }

        function syncActivityCount() {
            $('#jive-nav-link-home').addClass('active').find('.j-js-update-indicator').remove()
                .end().append(jive.theme.updateActivityCount())
                .find('.j-js-update-indicator').bind('click', false);
        }

        function syncCss(cssValues) {
            var css       = jive.theme.cssTemplate(cssValues),
                style     = $('<style class="jive-style-temporary" type="text/css" />')[0];

            // JIVE-9367: IE<=8 is particular about the way the <style> element is populated. See: http://www.phpied.com/dynamic-script-and-style-elements-in-ie/
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                // JIVE-18037: this call throws a javascript error in Chrome after returning from Preview mode
                try {
                    style.appendChild(document.createTextNode(css));
                } catch(e) {}
            }

            // remove old theming style tags and append this one
            $('style.jive-style-temporary, link.j-custom-theme').remove();
            $('body').append(style);
        }

        function syncHeaderAndFooter(cssValues) {
            // header
            var $wrap   = $('#j-header-wrap'),
                soyData = {
                    customizeSite : true,

                    headerInfo : {
                        companyName       : $wrap.data('companyName') || '',
                        customHeader      : cssValues.customHeaderHTMLRendered,
                        headerLogoAltText : cssValues.logoAltText,
                        headerLogoPath    : cssValues.headerLogoUrl,
                        headerTitle       : cssValues.logoTitle,
                        logoType          : cssValues.logoType,
                        standardHeader    : !isCustomHeader()
                    },

                    hideUserBar : $wrap.data('noUserBar'),
                    nav         : $.extend(true, {}, navbarDescriptor)
                };
            soyData.nav.user.displayName = jive.theme.mockUserName();

            $wrap.html(jive.nav.header(soyData));


            // footer
            if (cssValues.headerAndNavigationType === 'custom' && cssValues.customFooterHTMLRendered) {
                $('#j-cust-foot').remove();
                $('.j-js-footer-wrap').prepend(jive.nav.customFooter({ html : cssValues.customFooterHTMLRendered }));
            } else {
                $('#j-cust-foot').remove();
            }
        }

        function syncMenuControls() {
            $(jive.theme.logoMenuControl()).insertAfter($('#j-header-wrap').not(':has(#j-theme-ctrl-header-logo)').find('#j-header'));
            $(jive.theme.mainNavigationControl()).prependTo($('#j-globalNav-bg').not(':has(#j-theme-ctrl-main-navigation)'));

            if (isCustomHeader()) {
                $(jive.theme.secondaryNavigationControl()).prependTo($('#j-links').not(':has(#j-theme-ctrl-secondary-navigation)'));
            } else {
                $(jive.theme.userMenuControl()).insertBefore($('#j-header').not(':has(#j-theme-ctrl-current-user)').find('#j-satNav'));
                $(jive.theme.searchControl()).prependTo($('#j-links').not(':has(#j-theme-ctrl-search)'));
            }
        }

        function muteEvents() {
            // mute click events
            $('body').off('.themingUI').on('click.themingUI', 'a', function(e) { e.preventDefault(); });
            $('#j-satNav-menu').off('.satelliteNav');
            $('#jive-trial-banner, #jive-trial-banner a').off('click').on('click.themingUI', false);
            $(document).off('.autosearchview');

            // mute submit events
            $('form').off('submit').on('submit', false);
        }


        /*
         * Initialize
         */
        jive.dispatcher.listen('showThemingMenu', closePopovers).listen('showThemingMenu', function(payload) {
            dispatcher.dispatch('showThemingMenu', {
                command     : 'showThemingMenu',
                inFrame     : true,
                menuId      : payload.menuId,
                orientation : payload.orientation
            }, this);
        });

        (function() {
            jive.ActivityStream.activityNotifier.disable();
            sync();
            resize();
            $$(window.parent).on('resize.themingUI', resize);
            // JIVE-18037 we have to detach this event before entering Preview mode or a JS error is thrown in IE
            window.onbeforeunload = function() {
                $$(window.parent).off('resize.themingUI');
            };

            $frame.data('navbarDescriptor', navbarDescriptor);

            // disable create menu items
            $('body').on('navbarPopoverLoad', function(e) {
                /*
                 * JIVE-9138
                 *
                 * The onLoad event of the Create menu popover (abstract_list.js) is firing before the popover is actually
                 * loaded in certain versions of IE.  So we have to poll the DOM to look for anchor elements to mute.
                 * We are limiting the poll count to 200 so it doesn't run forever.
                 */
                var $createMenu = $(e.target),
                    limit       = 200;
                pollForElements();

                function pollForElements() {
                    if ($createMenu.find('a').off().length === 0 && --limit > 0) {
                        pollForElements.delayed(50)();
                    }
                }
            });
        })();


        return {
            notify : sync
        }
    };
});
