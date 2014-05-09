/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Placepicker');

/**
 * Handles UI for a list of containers in the "create" menu.
 *
 * @extends jive.AbstractView
 * @param {jQuery|Element|String} input search field
 * @param {jQuery|Element|String} target element in which to render search results
 *
 * @depends path=/resources/scripts/apps/shared/views/typeahead_input.js
 * @depends template=jive.placepicker.searchResults scope=client
 */
jive.Placepicker.ContainerSearchView = jive.oo.Class.extend(function(protect) {
    var $ = jQuery;

    jive.conc.observable(this);

    this.init = function(input, target, options) {
        var view = this;

        this.target = $(target);
        this.prevContent = this.target.children();
        this.visibleContent = this.prevContent.filter(':visible');

        $(input).each(function() {
            var typeahead = new jive.TypeaheadInput(this);

            typeahead.addListener('change', function(value) {
                view.emitP('search', value).addCallback(function(data) {

                    // clear any previous results
                    if (view.searchResults) {
                        view.searchResults.remove();
                    }

                    view.searchResults = $(jive.placepicker.searchResults(data));

                    // Restore recent places list when clearing a search.
                    view.flatFind(view.searchResults, '.j-clear-search').click(function(e) {
                        view.restoreContent();
                        typeahead.val('');
                        e.preventDefault();
                    });
                    if (view.visibleContent.size() == 0) {
                        view.visibleContent = view.prevContent.filter(':visible');
                    }
                    view.visibleContent.hide();
                    target.append(view.searchResults);
                    view.resizePopover();
                });
            });

            typeahead.addListener('clear', view.restoreContent.bind(view));
        });
    };

    this.update = function() {
    };

    protect.restoreContent = function() {
        if (this.searchResults) {
            this.searchResults.remove();
        }
        this.visibleContent.show();
        this.resizePopover();
    };

    /**
     * Finds an element that may be a child of the given element or that may be
     * the element itself.
     */
    protect.flatFind = function(element, selector) {
        return element.find('*').andSelf().filter(selector);
    };

    protect.resizePopover = function() {
        this.target.parents('.js-pop *').trigger('popover.resize', [{ fade: false }]);
    };
});
