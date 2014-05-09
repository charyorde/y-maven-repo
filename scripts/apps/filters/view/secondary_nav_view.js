/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Filters');
/**
 * Handles UI for secondary navigation links (links in the left sidebar).
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.browse.filter.activeFilterGroupItem
 * @depends template=jive.browse.filter.pinConfirmation
 */
jive.Filters.SecondaryNavView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    protect.init = function(element, defaultFilterID, guest) {
        var view = this;

        this.$nav = $(element || "nav.j-second-nav");
        this.pinnedFilter = defaultFilterID;
        this.guest = guest;

        // Animate ribbon when a link is clicked.
        this.$nav.delegate('a.js-select-link', 'click', function(event) {
            var $link = $(this)
              , $item = $link.closest('li')
              , filterID = $item.attr('data-filter-id');

            //only emit if there's an actual filterID
            if (filterID){
                // if error, switch the active ribbon back to previously active
                view.emitP('navSelect', [filterID]).addErrback(view.lastStateSwitcher());
            }
            event.preventDefault();
        });

        // Clear nested item selections when the js-clear-nav link is
        // clicked.
        this.$nav.delegate('.js-clear-nav a', 'click', function(event) {
            var $currentlyActive = view.$nav.find('.active_item')
              , lastFilterID = $currentlyActive.attr('data-filter-id')
              , lastNestedID = view.$nav.find('.active_nested_item').attr('data-filter-id');

            view.emitP('navSelect', []).addErrback(view.lastStateSwitcher());
            event.preventDefault();
        });


        //bind pin selection
        this.$nav.delegate('a.js-pin-link', 'click', function(event) {
            if (!this.guest){
                var $pin = $(this);
                var $item = view.$nav.find('.active_item');
                var filterID = $item.data("filter-id");
                var filterName = $item.find(".nav-label").text();
                view.emitP('setDefaultFilter', filterID).addCallback(function(){
                    view.pinnedFilter = filterID;
                    $pin.hide();
                     $('<p/>', { text: jive.browse.filter.pinConfirmation({filterName:filterName})}).message({ style: 'success' });
                });
            }
            event.preventDefault();
        });

        $(function() {
            var $strong = view.$nav.find('.active_item');
            var $active = $(jive.browse.filter.activeFilterGroupItem());
            if ($active && $strong.length > 0) {
                view.$nav.find('ul:first').append($active);
                $active.css({top: $strong.position().top - 1 + 'px'});
            }
        });
    };

    this.activate = function(rootFilterID, nestedFilterID) {
        if (this.active != rootFilterID) {
            this.activateFilter(rootFilterID);
            this.active = rootFilterID;
        }

        if (this.activeNestedFilter != nestedFilterID) {
            this.activateNestedFilter(nestedFilterID);
            this.activeNestedFilter = nestedFilterID;
        }
    };

    protect.activateFilter = function(rootFilterID) {
        var $item = this.$nav.find('li.js-browse-filter-group-item[data-filter-id="'+ rootFilterID +'"]')
          , $lastActive = this.$nav.find('.active_item')
          , $pinLink = this.$nav.find('.js-pin-link');

        if ($item.length > 0) {
            // Indicate that the clicked link is active.
            $lastActive.find('strong span').unwrap();
            $item.find('span.nav-label').wrap('<strong/>');

            $pinLink.hide();
            $lastActive.removeClass('active_item');
            $item.addClass('active_item');

            if (!this.guest && (String(rootFilterID) != this.pinnedFilter)){
                $pinLink.show();
            } else {
                $pinLink.hide();
            }

            if (!jive.Filters.isLegacyBrowser()) {
                this.getRibbon().animate({top: $item.position().top + 'px'}, 150);
            } else {
                this.getRibbon().css('top', $item.position().top);
            }
        }
    };

    protect.activateNestedFilter = function(nestedFilterID) {
        var $nested = this.$nav.find('li.js-browse-filter-group-item[data-filter-id="'+ nestedFilterID +'"]');
        this.$nav.find('.active_nested_item').removeClass('active_nested_item');

        if (nestedFilterID) {
            $nested.addClass('active_nested_item');
        }

        // Toggle the "clear selected" link - if one exists.
        this.$nav.find('.js-clear-nav').toggle($nested.length > 0);
    };

    protect.getRibbon = function() {
        var $active = this.$nav.find('.active');
        return $active;
    };

    /**
     * Returns a function that will switch the nav back to its current
     * state.
     */
    protect.lastStateSwitcher = function() {
        var $currentlyActive = this.$nav.find('.active_item')
          , lastFilterID = $currentlyActive.attr('data-filter-id')
          , lastNestedID = this.$nav.find('.active_nested_item').attr('data-filter-id')
          , view = this;

        return function() {
            view.activate(lastFilterID, lastNestedID);
        };
    };
});
