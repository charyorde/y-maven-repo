/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Mixin for a view that contains elements that need to be simplified to
 * fit in a given horizontal space.
 */
jive.Collapsable = jive.oo.Class.extend(function(protect) {
    var $ = jQuery;

    this.collapsable = function(options) {
        var view = this;

        this.availableWidth = options.availableWidth;
        this.resizableElement = options.element;
        this.shrinkable = options.shrinkable;
        this.shrunken = false;

        $(function() {
            // Calculate the starting width of the given elements
            // together.
            view.recollapse();

            var resizeTimeout;
            $(window).bind('resize', function() {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(view.collapseIfNecessary.bind(view), 100);
            });

            view.collapseIfNecessary();
        });
    };

    /**
     * Call this method if shrinkable elements are redrawn.  It will
     * calculate a new value for the unshrunken space taken up by the
     * elements and will shrink them again if necessary.
     *
     * You can optionally pass a reference to the resizable element to
     * avoid retrieving from the DOM again.
     */
    this.recollapse = function() {
        var $resizableElement = $(this.resizableElement);

        this.largeWidth = $resizableElement.toArray().reduce(function(sum, e) {
            return sum + $(e).width();
        }, 0);

        if (this.shrunken) {
            this.shrinkStuff(0, $resizableElement);
        }

        this.collapseIfNecessary();
    };

    protect.collapseIfNecessary = function() {
        var availableWidth = this.availableWidth();

        if (!this.shrunken && availableWidth < this.largeWidth) {
            this.shrinkStuff();
            this.shrunken = true;
        } else if (this.shrunken && availableWidth >= this.largeWidth) {
            this.expandStuff();
            this.shrunken = false;
        }
    };

    protect.shrinkStuff = function(duration, resizableElement) {
        var elements = $(resizableElement || this.resizableElement);

        elements.find(this.shrinkable)
        .each(function() {
            $(this).width($(this).width());
        })
        .wrap('<span class="js-shrunk" style="overflow-x:hidden; white-space:nowrap;" />')
        .parent()
        .animate({
            width: '1px'
        }, duration, function() {
            $(this).hide();
        });
    };

    protect.expandStuff = function() {
        var elements = $(this.resizableElement)
          , view = this;

        elements.find('.js-shrunk').each(function() {
            var $e = $(this)
              , shrinkable = $e.children()
              , width = shrinkable.width();

            $e
            .show()
            .animate({
                width: width
            }, function() {
                shrinkable.filter(':first').unwrap();
            });
        });
    };
});

