/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Theme');

/**
 * Entry point for the Theme App.
 *
 * @depends path=/resources/scripts/apps/theme/field/common.js
 * @depends path=/resources/scripts/apps/theme/models/palette_collection.js
 * @depends path=/resources/scripts/apps/theme/models/theme_source.js
 * @depends path=/resources/scripts/apps/theme/plugins/tab.js
 * @depends path=/resources/scripts/apps/theme/views/custom_header_footer.js
 * @depends path=/resources/scripts/apps/theme/views/favicon.js
 * @depends path=/resources/scripts/apps/theme/views/menu_view.js
 * @depends path=/resources/scripts/apps/theme/views/save_dialog.js
 * @depends path=/resources/scripts/apps/theme/views/theme_controls.js
 * @depends path=/resources/scripts/apps/theme/views/import_export.js
 * @depends template=jive.theme.*
 */

define('jive.Theme.Main',
    [
        'jive.Theme.PaletteCollection', 'jive.Theme.Favicon',
        'jive.Theme.MenuView', 'jive.Theme.SaveDialog', 'jive.Theme.ThemeControls',
        'jive.Theme.CustomHeaderFooter', 'jive.Theme.ImportExport', 'jquery'
    ],

    function(PaletteCollection, FaviconView, MenuView, SaveDialog, ThemeControls, CustomHeaderFooter, ImportExport, $) {
        /**
         * Page controller for theming UI.  Must be instantiated after DOM ready.
         * @constructor
         */
        return function JiveThemeMain(options) {
            var palettes     = new PaletteCollection(),
                mode         = 'edit',
                fx           = $.fx.off,
                isPageLocked = false,
                enabled      = false,
                views        = {
                    customHeaderFooter : new CustomHeaderFooter(palettes),
                    favicon            : new FaviconView(palettes),
                    menu               : new MenuView(jive.theme, jive.Theme.getFieldObject),
                    save               : new SaveDialog(jive.theme),
                    themeControls      : new ThemeControls($('#j-theme-menu'), jive.theme),
                    importExport       : new ImportExport(palettes)
                };

        
            var enterEditMode = function() {
                palettes.stopPreview().then(function() {
                    palettes.refresh().then(function() {
                        $('#j-controls').show();
                        callMethod('disable');
                        enabled = false;
                        setAnimationState('off');

                        var $frame = $('#iframe');
                        $frame.attr('src', $frame.data('editUrl')).one('load', function() {
                            callMethod('enable');
                            enabled = true;
                            callMethod('setMode', ['edit']);
                        });
                    });
                });
            };
        
            var enterPreviewMode = function() {
                $('#j-controls').hide();
                setAnimationState('on');
                mode = 'preview';
                callMethod('setMode', [mode]);

                var $frame = $('#iframe');
                $frame.attr('src', $frame.data('previewUrl'));
            };
        
            /**
             * Turns on/off jQuery animations in browsers that can't handle them (IE7)
             *
             * @param {string} state on|off
             */
            var setAnimationState = function(state) {
                // turn off jQuery.fx for browsers that are, shall we say, challenged.
                if ($.browser.msie && parseInt($.browser.version) < 8) {
                    if (state === 'off') {
                        $.fx.off = true;
                    } else if (typeof fx === 'undefined') {
                        delete $.fx.off;
                    } else {
                        $.fx.off = fx;
                    }
                }
            };
        
            /**
             * Cancel palette editing and redirect to root
             */
            var returnToSite = function() {
                if (confirm(jive.theme.unsavedChanges())) {
                    if (mode === 'edit') {
                        redirect();
                    } else {
                        palettes.stopPreview().then(redirect);
                    }
                }
            };
        
            /**
             * Redirects to root unless a url is passed
             *
             * @param {string} [url=/]
             */
            var redirect = function(url) {
                isPageLocked = false;
                url = url ? url : jive.soy.func.normalizeUrl(_jive_base_url, '/');
                window.location = url;
            };
        
            /**
             * Calls a method by name for each of the views, with optional arguments
             * @param {string} method
             * @param {Array} [args=[]]
             */
            var callMethod = function(method, args) {
                $.each(views, function(_, view) {
                    (view[method] || $.noop).apply(view, args || []);
                });
            };
        
            var setSkin = function(paletteID) {
                palettes.activate(paletteID);
                views.favicon.sync();
            };
        
            var showSaveDialog = function(_mode) {
                views.save
                    .setCustomPaletteNames(palettes.getCustomPaletteNames())
                    .setPublishedPalette(palettes.getPublished())
                    .setMode(_mode)
                    .show(palettes.getActiveName());
            };
        
        
        
        
            /*
             * Attach view listeners
             */
            jive.dispatcher.listen('showThemingMenu', function(payload) {
                if (!enabled) {
                    return;
                }

                var adjustment = { top: 0, left : 0 };
                if (payload.inFrame) {
                    adjustment.top = 44;
                }

                views.menu.reset()
                    .setAdjustment(adjustment)
                    .setCssValues(palettes.getCssValues())
                    .setMenuId(payload.menuId)
                    .setOrientation(payload.orientation || 'below')
                    .setReferenceNode($(this));

                var soyData = {};
                if (payload.menuId === 'themeMenu') {
                    soyData = {
                        currentId   : palettes.getActiveId(),
                        palettes    : palettes.delineateByType(),
                        publishedId : palettes.getPublishedId()
                    };
                } else if (/^(brandingAndDecoration|chrome|logo|mainNavigation|widget)Menu$/.test(payload.menuId)) {
                    soyData = { paletteID: palettes.getActiveId() };
                } else if (payload.menuId === 'secondaryNavigationMenu') {
                    soyData.showCreateMenu = options.createMenuIsEnabled;
                    soyData.user           = $('#iframe').data('navbarDescriptor').user;
                }
                views.menu.setSoyData(soyData);

                views.menu.show(payload.menuId);
            });


            // Theme Controls (lower left command menu)
            views.themeControls.addListener('cancel', returnToSite);
        
            views.themeControls.addListener('preview', showSaveDialog.curry('preview'));
            views.themeControls.addListener('save', showSaveDialog.curry('edit'));
            views.themeControls.addListener('publish', function() {
                palettes.publish().then(redirect.aritize(0));
            });
        
            views.themeControls.addListener('edit', enterEditMode);

        
            // Save Dialog
            views.save.addListener('save', function(name, doPublish, dialogMode) {
                if (dialogMode === 'preview') {
                    palettes.startPreview(name).then(enterPreviewMode);
                } else if (doPublish) {
                    palettes.saveAndPublish(name).then(function() {
                        $(jive.theme.saveAndPublishSuccessMessage()).message({ style: 'success' });
                        redirect();
                    });
                } else {
                    palettes.save(name).then(function() {
                        isPageLocked = false;
                        $(jive.theme.saveSuccessMessage()).message({ style: 'success' });
                    });
                }
            });
        
        
            // Menus and submenus, CSS updates
            views.menu.addListener('deleteCssValue', function(key) {
                palettes.unsetCssValue(key);
            });
        
            views.menu.addListener('updateCssValues', function(values) {
                palettes.setCssValues(values);
                views.favicon.sync();
            });
        
            views.menu.addListener('setSkin', setSkin);
        
            views.menu.addListener('imageFileReset', function(imageId) {
                switch (imageId) {
                case 'headerLogo':
                    palettes.unsetCssValue('headerLogo', 'headerLogoName', 'headerLogoUrl');
                    break;
        
                case 'faviconImage':
                    palettes.unsetCssValue('faviconImage', 'faviconImageName', 'faviconImageUrl');
                    views.favicon.sync();
                    break;
                }
            });
        
            views.menu.addListener('delete', function(paletteID) {
                palettes.deletePalette(paletteID).then(function() {
                    $(jive.theme.deleteThemeSuccessMessage()).message({ style: 'success' });
                    views.menu.setSoyData({
                        currentId   : palettes.getActiveId(),
                        palettes    : palettes.delineateByType(),
                        publishedId : palettes.getPublishedId()
                    })
                    .update();
                });
            });
        
        
            jive.dispatcher.listen('showImportExportDialog', function() {
                views.importExport.showDialog(palettes.delineateByType().custom);
            });


            /*
             * Bootstrap
             */
            (function(deferred) {
                $.when(palettes.refresh(), deferred).then(function() {
                    views.favicon.sync();
                    setAnimationState('off');
                    callMethod('enable');
                    enabled = true;
                });

                $('#iframe').on('load.themingUI', deferred.resolve.bind(deferred));
            })(new $.Deferred());

            palettes
                .addListener('cssChange', function() { isPageLocked = true; })
                .addListener('paletteChange', function() { isPageLocked = false; })
                .addListener('cssChange', function() {
                        $('#iframe')[0].contentWindow.notify('cssChange');
                    })
                .addListener('paletteChange', function() {
                        $('#iframe')[0].contentWindow.notify('cssChange');
                    });

            window.onbeforeunload = function() {
                return isPageLocked ? jive.theme.unsavedChanges() : undefined;
            };


            $('#iframe').data('palettes', palettes);


            return {};
        };
    }
);
