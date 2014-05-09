/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*extern jive $j */

jive.namespace('Pager');

/**
 * View class that can be applied to paginated content.  Handles clicks on
 * pagination links and displays a loading indicator when switching pages.
 *
 * @class
 * @param   {jQuery|DOMElement|string}  content_container    element or selector specifying paginated content
 */
jive.Pager.MainView = function(content_container, options) {
    jive.conc.observable(this);

    var view       = this,
        first_page = true,
        loading    = null;  // loading indicator
    
    options = $j.extend({ showLoadingIndicator: true }, options || {});

    // Save off the current/initial base path + query
    var last_base = (location.pathname + location.search).match(/^([^#]*)(#.*)?$/);
    last_base = last_base ? last_base[1] : last_base;

    // Intercept clicks on pager links and invoke the corresponding Sammy
    // routes directly so that browser history does not fill up with routes
    // that immediately redirect.
    function dispatch_link(event) {
        var href, addr, base;

        if (typeof(event.button) != 'undefined' && event.button !== 0) {
            // wasn't the left button - ignore
            return;
        }

        // Start with check of URL in clicked href for #/ fragment pattern
        href = $j(this).attr('href').match(/^(.*)(#\/.*)$/);
        base = href ? href[1] : href;
        if (base == '') {
            // Then check window location URL for #/  fragment pattern
            base = (location.pathname + location.search).match(/^(.*)(#\/.*)$/);
            // Finally, allow for window locations without #/ pattern
            base = base ? base[1] : window.location.pathname;
        }
        if (base != last_base) {
            // We ignore the event if the fragment is the only portion of the URL which is changing, allowing a full page load
            return;
        }
        addr = href ? href[2] : href;

        view.emit('click', addr);

        event.preventDefault();  // prevent the browser address from changing
    }
    $j('[href*="#/"]').live('click', dispatch_link);

    // Selects the first focusable element in the dynamic content area.  If
    // there is a specific element that you want to receive focus when dynamic
    // content loads then you should add a 'tabindex' attribute to that
    // element.
    function firstFocusableElement() {
        var page = $j(content_container),
            tabbable = page.find('[tabindex]:first'),
            extLink = page.find('a:not([href^=#]):first'),
            intLink = page.find('a:first'),
            input = page.find(':input:not(:disabled):first');
        return ([tabbable, extLink, intLink, input].filter(function(e) {
            return e.length > 0;
        }).first() || $j());
    }

    /**
     * This method should be called before content is loaded.  It will provide
     * appropriate indications that new content is loading.
     **/
    this.loading = function() {
        if (options.showLoadingIndicator && !loading) {
            loading = $j(jive.shared.soy.loading());
            $j(content_container).append(loading);
        }
    };

    /**
     * This method should be called whenever new content is loaded.
     **/
    this.update = function() {
        // commenting out until we do something more intelligent (only scroll if
        // the top of the block is out of the browser's viewport, that kind of thing)
        //if (!first_page) {
        //    $j.scrollTo($j(content_container));
        //} else {
        //    first_page = false;
        //}

        // Focus the first item in the update results to get screen readers to
        // inform users that new content has loaded.
        firstFocusableElement().focus();

        // Remove loading indicator.
        view.stopLoading();
    };

    this.stopLoading = function() {

         if (options.showLoadingIndicator && loading) {
            loading.remove();
            loading = null;
        }
    };

    /**
     * Unloads the view by unregistering event handlers.
     **/
    this.unload = function() {
        $j('[href*="#/"]').die('click', dispatch_link);
    };
};
