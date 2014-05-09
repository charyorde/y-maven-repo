/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('content.common.multipart');

jive.content.common.multipart.View = jive.AbstractView.extend(function(protect, _super) {

    var $ = jQuery;
    var view;
    var interval;

    this.init = function(options) {
        _super.init.call(this, options);
        this.options = options;

        view = this;

        $(function() {

            options.view.addListener('save-multipart', function(data) {
                interval = window.setInterval(function() {
                    view.emit('update');
                }, 1000);
            });
       });

    };

    this.update = function(data) {
        if (data == null) {
            return;
        }

        var progressBar = $('#progressBar');
        if (!progressBar.length) {
            //inject the progress bar above compose buttons
            progressBar = $(jive.content.progressbar());
            progressBar.insertBefore(this.options.view.getContent().find('.jive-composebuttons'));
        }

        $('#progressBarBoxContent').css('width', data.progress + '%');

        if (data.progress == 100) {
            progressBar.fadeOut();
            clearInterval(interval);
        }
    };
});

