/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*extern jive $j $Class */

jive.namespace('loader');

/**
 * Handles displaying an animated loading runner.
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.shared.soy.loading
 */
jive.loader.LoaderView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    //init
    protect.init = function(options) {
        this.content = $(jive.shared.soy.loading());
        options = $j.extend({ showLabel: true, inline: false, size: null }, options || {});
        var $loader = this.content.find('.j-running-loader');

        var loadingFrame =      0,           // which frame the interval is on
            loadingOffset =     23,         //essentially how tall is the loader
            maxFrames =         10,             // the number of frames in the loader
            backgroundOffset =  '0',     // x offset of the sprite
            duration         = 40;       // how often to wait between animation frames      

        this.loadingTimer = setTimeout(animate_loader, duration);

        if (options.size == 'small') {
            loadingOffset = 17;
            maxFrames = 8;
            backgroundOffset = '-176px';
            $loader.addClass('j-running-loader-small');
        }
        else if (options.size == 'big') {
            this.content.addClass('cover');
        }

        if (options.showLabel === false) {
           this.content.find('span').remove();
        }

        if (options.inline) {
            this.content.addClass('j-running-loader-inline');
        }

        var self    = this,
            counter = 0,
            // every so often make sure that the loader is still visible
            checkVisibilityDuration = duration * 20;

        function animate_loader() {
            // adjust background position
            $loader.css('background-position', backgroundOffset + ' ' + (loadingFrame * -loadingOffset + 'px'));
            loadingFrame = (loadingFrame+1)%maxFrames;

            // determine whether or not to continue animating
            var shouldCheckVisibility = ++counter * duration >= checkVisibilityDuration;
            if (shouldCheckVisibility) {
                if (!$loader.is(':visible')) {
                    // the loader is hidden. no more timeouts
                    return;
                } else {
                    counter = 0;
                }
            }

            self.loadingTimer = window.setTimeout(animate_loader, duration);
        }

    };


    //destroy
    this.destroy = function() {
        clearTimeout(this.loadingTimer);
    }



});
