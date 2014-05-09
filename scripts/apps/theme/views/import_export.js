/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

define('jive.Theme.ImportExport', ['jquery'], function($) {
    return function ImportExport(paletteCollection) {
        var self = jive.conc.observable({});


        self.showDialog = function(palettes) {
            $('.js-chooser').trigger('close');
            var $modal =  $(jive.theme.importExportDialog({ palettes: palettes })).appendTo('body').lightbox_me({
                destroyOnClose: true,

                onLoad : function() {
                    $('#js-import').ajaxForm({
                        dataType : 'json',
                        success : function(response) {
                            paletteCollection.refresh();
                            $modal.trigger('close');
                            if (response.result === 'success') {
                                $(jive.theme.importExportMessage({ type : 'success' })).message({ style: 'success' });
                            } else {
                                $(jive.theme.importExportMessage({ type : 'error' })).message({ style: 'error' });
                            }
                        },

                        clearForm : false,
                        resetForm : false
                    });
                }
            });

            return self;
        };


        return self;
    };
});