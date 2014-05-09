/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Filters');  // Creates the jive.Filters namespace if it does not already exist.

/**
 * Displays a list of suggested completions in a popover.
 *
 * @extends jive.AbstractView
 *
 * @depends path=/resources/scripts/apps/filters/view/suggestions.js
 * @depends path=/resources/scripts/apps/shared/views/tab_view.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/synchronize.js
 * @depends template=jive.browse.tagautocomplete.popoverContent
 * @depends template=jive.browse.tagautocomplete.completions
 * @depends template=jive.browse.tagautocomplete.tagList
 */
jive.Filters.TagSuggestionsView = jive.Filters.Suggestions.extend(function(protect, _super) {
    var $ = jQuery;

    this.render = function(content) {
        var view = this;

        _super.render.call(this, content);

        this.activeTab = null;

        this.tabView = new jive.TabView(this.content, {
            activeClass: 'j-active',
            tabSelector: '.js-tab'
        }).addListener('tabSwitch', function(tabName) {
            // Make sure that the popover is sized correctly.
            view.html(view.html());

            // Reset suggestion selection when switching tabs.
            view.resetSelection();

            view.activeTab = tabName;
        });
    };

    this.html = function(content) {
        var parent;

        if (content && !this.isVisible()) {
            parent = $(jive.browse.tagautocomplete.popoverContent());
            parent.html(content);
            this.render(parent);

        } else {
            return _super.html.call(this, content);
        }
    };

    this.showRelatedTags = function(popularTags, yourTags, relatedTags) {
        var view = this;

        jive.conc.synchronize({
            popularTags: popularTags,
            yourTags: yourTags,
            relatedTags: relatedTags
        }).addCallback(function(sections) {
            view.html(
                $(jive.browse.tagautocomplete.popularTags($.extend({
                    active: view.activeTab || null
                }, sections)))
            );
        });
    };

    this.showCompletions = function(completions) {
        var view = this;

        this.activeTab = null;

        completions.addCallback(function(tags) {
            view.html(
                $(jive.browse.tagautocomplete.completions(tags))
            );
        });
    };

    protect.emitSelection = function() {
        this.activeTab = null;
        return _super.emitSelection.apply(this, arguments);
    };
});
