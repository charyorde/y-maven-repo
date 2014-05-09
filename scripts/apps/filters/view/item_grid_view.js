/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Filters');  // Creates the jive.Filters namespace if it does not already exist.

/**
 * Handles UI for the item grid portion of a browse view.
 *
 * @extends jive.AbstractView
 *
 * @param {Object} options
 * @config {Function} [noResults] template function to render when there
 * are no results to display in the item grid view
 *
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/jquery/jquery.vgrid.js
 * @depends template=jive.browse.grid.itemGrid
 * @depends template=jive.browse.grid.moreSearchResultsAvailable
 * @depends template=jive.browse.grid.hierarchyItems
 */
jive.Filters.ItemGridView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    protect.fadeInOnMergeDuration = 200;
    protect.sortDuration = 400;
    protect.sortEasing = 'easeInOutQuint';
    protect.fadeOutOnMergeDuration = 200;

    // Setup necessary for flip animations.
    $('body').addClass(jQuery.browser.webkit ? 'webkit' : 'other');
    var csstransforms3d = window.styleMedia && window.styleMedia.matchMedium('(-webkit-transform-3d)');

    this.init = function(options) {
        var $form = $(this.primary).closest('form')
          , view = this;

        this.noResultTemplateConfig = options.noResultTemplateConfig;
        this.noResults = options.noResults;
        this.baseSelector = options.baseSelector || '#j-browse-item-grid';
        this.$itemGrid = $(this.baseSelector);
        this.$itemToggle = $("#j-item-view-toggle");
        this.$navLinks = $('li.j-browse-filter-group-item');
        this.$containerNav = $('#jive-body > nav.j-bigtab-nav');
        this.$moreResultsAvailable = $('#j-more-search-results-available');
        this.archetypeID = options.archetypeID;
        this.omitIcons = options.omitIcons;

        // For compatibility with jive.AbstractView methods like
        // createSpinner().
        this.content = this.$itemGrid;

        // The main logic for handling clicks on secondary navigation links is
        // in secondary_nav_view.js.
        this.$navLinks.find('a').click(function(event) {
            view.$itemToggle.show();
        });

        //toggle thumbnail and list views
        $("#j-item-view-toggle a.js-updatable-link").click(function(event) {
            var itemViewID = $j(this).data("item-view-id");
            view.setItemViewID(itemViewID);
            view.emit('toggleItemView', view.itemViewID);
            event.preventDefault();
        });

        this.prepareThumbs();
        this.prepareDetails();

        // VGrid awesomeness
        if (!options.noInitVGrid) {
            this.initVGrid();
        }
    };

     /**
     * Set the itemViewID value on this view.
     *
     * @param itemViewID The item view ID ('detail' or 'thumb')
     */
    this.setItemViewID = function(itemViewID){
        var $links;

        // This routine takes about 147 ms to run in IE7.  Thus the
        // check to make sure that it is actually necessary to run this.
        if (this.itemViewID != itemViewID) {
            this.itemViewID = itemViewID;
            $links = $('#j-item-view-toggle a.js-updatable-link');
            $links.removeClass('j-active');
            $links.filter('.js-link-thumbnails').toggleClass('j-active', itemViewID == 'thumb');
            $links.filter('.js-link-details').toggleClass('j-active', itemViewID == 'detail');
            $links.filter('.js-link-hierarchy').toggleClass('j-active', itemViewID == 'hierarchy');
        }
    };

    protect.toggleHierarchyView = function(show) {
        var $hierarchyViewToggle = $(".j-link-hierarchy").parent();
        if (show){
            $hierarchyViewToggle.show();
        } else {
            $hierarchyViewToggle.hide();
        }
    };

    /**
     * Given a promise that will eventually yield data to display, displays
     * that data when the promise is ready.
     */
    this.update = function(promise, /* protected arg */ fancyMerge) {
        var view = this;

        // JIVE-4394: need to requery the dom here because the filters are often overwritten
        this.showSpinner({size: 'small', context: $('#j-browse-filters')});

        promise.addCallback(function(data) {
            //if there's data from the server, render the view in the DOM
            view.itemsView = data;
            view.setItemViewID(data.itemViewID);
            view.toggleHierarchyView(view.itemsView.hierarchyViewSupported);

            // update no result template with current filter ids
            if (view.noResultTemplateConfig) {
                view.noResultTemplateConfig.data.filterIDs = data.filterIDs;
            }

            if (data.items.length < 1 && view.noResults) {
                view.renderNoResults();
            } else if (view.itemViewID == 'thumb') {
                view.renderThumbs(fancyMerge);
            } else if (view.itemViewID == 'detail') {
                view.renderDetails();
            } else if (view.itemViewID == 'hierarchy') {
                view.renderHierarchy();
            }
            view.displayMoreSearchResultsMessage(data);
        }).always(function() {
            view.hideSpinner();
        });
    };

    /**
     * Does the same thing that update() does but performs a nifty merge and
     * sort animation in the process.
     */
    this.updateWithMerge = function(promise) {
        return this.update(promise, true);
    };

    /**
     * Removes a specified item inline using cached data, if it exists.
     * @param {Object} itemToRemove an object with "id" and "type" properties.
     * @return Whether or not the item was removed from the grid.
     */
    this.removeItem = function(itemToRemove){
        var view = this;
        if (view.itemsView && view.itemsView.items){
            var data = view.itemsView;
            var found = false;
            for (var i = 0; i < data.items.length; i++) {
                var item = data.items[i];
                if (item.id == itemToRemove.id && item.type == itemToRemove.type){
                    data.items.splice(i, 1);
                    found = true;
                    break;
                }
            }
            if (found){
                view.itemsView.items = data.items;
                var promise = new jive.conc.Promise();
                view.updateWithMerge(promise);
                promise.emitSuccess(data);
                //close any open controls
                $j('.js-pop').hide();
            }
            return found;
        }
        return false;
    };

    protect.addArchetype = function(obj){
        if (this.archetypeID && !obj.archetypeID){
            return $.extend(obj, {archetypeID: this.archetypeID});
        } else {
            return obj;
        }
    };

    protect.renderThumbs = function(fancyMerge) {
        var content = $(jive.browse.grid.itemGrid($.extend(this.addArchetype(this.itemsView),{itemViewID:'thumb', noResultTemplateConfig: this.noResultTemplateConfig})))
          , oldThumbs = this.$itemGrid.find('.js-browse-thumbnail')
          , newThumbs = content.find('.js-browse-thumbnail');

        if (jive.Filters.isLegacyBrowser()) {
            fancyMerge = false;
        }

        if (fancyMerge && oldThumbs.length > 0 && newThumbs.length > 0) {
            this.mergeThumbs(newThumbs, oldThumbs, this.prepareThumbs.bind(this));
        } else {
            this.replaceThumbs(content, this.prepareThumbs.bind(this));
        }
    };


    /* truncate or resize titles to fit inside the box without overflowing */
    /* admittedly prepareThumbs got some scope creep and just really inits the cards every time they're rendered */
    protect.prepareThumbs = function() {
        var view = this;

        jive.conc.nextTick(this.resizeHeaders.bind(this));
        jive.conc.nextTick(this.resizePreviews.bind(this));

        /* This doesn't do anything because jQuery 1.4.3 doesn't support outerHeight() for
           hidden elements. jQ 1.5 does I think so when we upgrade to that we should uncomment this.
         */
//        this.$itemGrid.find('.j-thumb-back header').each(function() {
//            var $outside = $(this);
//            var $inside = $outside.find('h6');
//            var myText = $inside.text();
//
//            truncateText($inside, $outside, myText);
//        })

        /* flip animation */
        this.$itemGrid.delegate('.j-card-flipper, .j-back-btn', 'click', function(e) {
            var $card = $(this).closest('.card')
              , flipped = $(this).hasClass('j-card-flipper');

            // In webkit browsers that do not support CSS 3D transforms
            // we will use 2D versions to get the flip effect.  But
            // these browsers do not support the necessary backface
            // visibility CSS rules.  So we emulate those here.
            if ($.browser.webkit && !csstransforms3d) {
                var flipMidpoint = 150;
                setTimeout(function() {
                    $card.find('.card-back').toggle(flipped);
                    $card.find('.card-front').toggle(!flipped);
                }, flipMidpoint);
            }

            $card.toggleClass('flipped', flipped);
            e.preventDefault();
        });
    };

    protect.prepareDetails = function() {
        var view = this;


        function triggerClose(e) {
            var $link = $(this);

            // Trigger close in a timeout so that the click event
            // bubbles before the popover is closed.  IE will not
            // propagate events after the event target is modified.
            jive.conc.nextTick(function() {
                $link.trigger('close');
            });
        }

        function startDiscussion(e) {
            e.preventDefault();

            var $this  = $j(this),
                params = {};
            params[$this.data('cur-loc-param-name')] = window.location.href;

            window.location.href = $j.param.querystring($this.attr('href'), params);
        }

        /* actions menu */
        this.$itemGrid.delegate('.j-browse-action-button', 'click', function(e) {
            var $this             = $j(this),
                $actionsContainer = $this.closest('.j-td-actions').find('.j-js-browse-actions-container');

            $actionsContainer.popover({context: $j(this),
                                       darkPopover: true,
                                       destroyOnClose: false,
                                       putBack: true});

            // click events should only be attached once
            if (!$actionsContainer.data('haveClickEventsBeenAttached')) {
                $actionsContainer.data('haveClickEventsBeenAttached', true);
                $actionsContainer.find('a.share-link, a.j-js-create-direct-message').click(triggerClose);
                $actionsContainer.find('a.js-link-cur-loc-param').click(startDiscussion);
            }

            e.preventDefault();
        });
    };


    protect.resizeHeaders = function() {
        var truncateText = this.truncateText;

        this.$itemGrid.find('header.js-thumb-header').each(function() {
            if ($(this).find('.js-header-text').length < 1) {
                /* return if there is no title text at all */
                return true;
            }
            var $head = $(this);
            var $title = $(this).find('a');
            var $titleText = $(this).find('.js-header-text');

            /*
             * padding should be at least 10 px, the padding should be
             * the width of the icon div that displays on the right (0
             * when empty)
             */
            $head.find('h4').css('padding-right', Math.max(10, $head.find('.j-thumb-title-meta').outerWidth() + 6) + 'px');

            /* if title height is higher than the head height, then it's wrapping */
            /* if title width is greater than head width, then it's overflowing */
            if ($title.outerHeight() > $head.outerHeight() || $titleText.outerWidth() > $title.outerWidth()) {
                // first set the font size smaller and see if that does it.
                $title.closest('h4').addClass('shrunk');
            }

            var myText = $titleText.text();

            truncateText($titleText, $title, myText);

            if ($titleText.outerHeight() < 20) {
                $title.addClass('j-single-line');
            }
        });
    };

    protect.resizePreviews = function() {
        var truncateText = this.truncateText;

        this.$itemGrid.find('article').each(function() {
            var $outside = $(this);
            var $inside = $outside.find('span');
            var myText = $(this).text();

            truncateText($inside, $outside, myText);
        });
    };

    protect.truncateText = function($inside, $outside, myText) {
        // Moved to global utility function for JIVE-1396
        return jive.util.fitTextWithinNode(myText, $inside, $outside);
    };

    protect.renderDetails = function() {
        var params = this.itemsView.items.length < 1 && this.noResults ? $.extend({}, this.itemsView, {
            noResults: this.noResults()
        }) : this.itemsView;
        var content = $(jive.browse.grid.itemGrid($.extend(this.addArchetype(params),{noResultTemplateConfig: this.noResultTemplateConfig})));
        this.updateItemGrid(content);
    };

    protect.renderNoResults = protect.renderDetails;

    protect.renderHierarchy = function() {
        var main = this;
        var inline = false;
        if (this.itemsView.containerID){
            this.$itemGrid.find(".j-loading-container").remove();     //remove loader
            //try to find container
            var container = this.$itemGrid.find(".j-hierarchy-item[data-object-id=\"" + this.itemsView.containerID + "\"]");
            if (container.length > 0){
                //if found and children aren't loaded already in DOM, append them inline
                var $childHolder = container.find(".j-hierarchy-child-holder");
                if (!$childHolder.data("children-loaded")){
                    var parentIDs = this.itemsView.parentIDChain;
                    var items = main.getNestedItems(this.itemsView.items, parentIDs);
                    $childHolder.append(jive.browse.grid.hierarchyItems({
                        items: items,
                        omitIcons: main.omitIcons
                    }));
                    $childHolder.attr("data-children-loaded", true);
                }
                inline = true;
            }
        }

        //if container not found in DOM, do full tree refresh
        if(!inline){
            var content = $(jive.browse.grid.itemGrid(this.addArchetype(this.itemsView)));
            this.updateItemGrid(content);
        }
    };

    protect.getNestedItems = function(items, parentIDs){
       var main = this;
       $j(items).each(function(index, item){
            return $j(parentIDs).each(function(index, id){
                if (item.id == id){
                    items = main.getNestedItems(item.prop.childInfo.children, parentIDs);
                    return false;
                }
                return true;
            });
        });
        return items;
    };

    /**
     * Fades thumbnails out of view and then fades in a new set of thumbnails.
     */
    protect.replaceThumbs = function(content, callback) {
        this.updateItemGrid(content);
        callback();
    };

    /**
     * Runs an animation of visible thumbnails and new thumbnails being merged together.
     *
     * This method is optimized for speed, not for elegance.
     */
    protect.mergeThumbs = function(addedThumbs, existingThumbs, callback) {
        var thumbGrid = this.getThumbGrid()
          , newThumbs = addedThumbs.toArray()
          , oldThumbs = existingThumbs.toArray()
          , toRemove = []
          , newLen = newThumbs.length, oldLen = oldThumbs.length
          , order = {}, existing = {}
          , sorted = false
          , nue, old
          , id
          , i, j = 0
          , view = this;

        // Map objects to indexes.
        for (i = 0; i < newLen; i += 1) {
            nue = newThumbs[i];
            id = nue.getAttribute('data-object-type') +';'+ nue.getAttribute('data-object-id');

            // Map this object to an index.  The index starts at 1, not 0, so
            // that we can use it as a truthy value.
            order[id] = i + 1;
        }

        // Fade out thumbnails that need to be removed.
        for (j = 0; j < oldLen; j += 1) {
            old = oldThumbs[j];
            id = old.getAttribute('data-object-type') +';'+ old.getAttribute('data-object-id');

            if (order[id]) {
                existing[id] = true;
            } else {
                toRemove.push(old);

                if (!sorted) {
                    view.fadeOut($(old), view.fadeOutOnMergeDuration, sortThumbs);
                    sorted = true;
                } else {
                    view.fadeOut($(old), view.fadeOutOnMergeDuration);
                }
            }
        }

        // If no thumbnails had to be removed then proceed to sorting right
        // away.
        if (!sorted) {
            sortThumbs();
        }

        function sortThumbs() {
            var i, nue, old, id
              , allRemoved = toRemove.length == oldLen
              , largeNum = newLen + oldLen + 600;

            // Insert new thumbnails in positions where thumbnails were removed
            // but keep them hidden for the time being.
            for (i = 0; i < newLen; i += 1) {
                nue = newThumbs[i];
                id = nue.getAttribute('data-object-type') +';'+ nue.getAttribute('data-object-id');

                if (!existing[id]) {
                    old = toRemove.shift();

                    if (old) {
                        $(old).replaceWith(nue);
                    } else {
                        thumbGrid.append(nue);
                    }

                    view.transparentize($(nue));
                }
            }

            view.refreshVGrid().then(function() {
                // Rearrange thumbs to represent their new ordering.
                if (!allRemoved) {
                    thumbGrid.vgsort(function(a, b) {
                        var idA = a.getAttribute('data-object-type') +';'+ a.getAttribute('data-object-id')
                          , idB = b.getAttribute('data-object-type') +';'+ b.getAttribute('data-object-id')
                          , ordA = order[idA] || largeNum
                          , ordB = order[idB] || largeNum;

                        return ordA - ordB;
                    }, view.sortEasing, view.sortDuration);
                }

                setTimeout(showNewThumbs, allRemoved ? 0 : view.sortDuration);
            });
        }

        function showNewThumbs() {
            var i;

            // Get rid of any stragglers.  Use detach() instead of remove() to
            // prevent errors in IE in case animations are still in progress
            // and element data properties are still being accessed.
            for (i = 0; i < toRemove.length; i += 1) {
                $(toRemove[i]).detach();
            }

            // Fade in new thumbnails.
            callback();
            view.fadeIn(thumbGrid.find('.js-browse-thumbnail'), view.fadeInOnMergeDuration);

            // Remove detached thumbnails after a couple of seconds to clean up
            // memory.
            setTimeout(function() {
                for (i = 0; i < toRemove.length; i += 1) {
                    $(toRemove[i]).remove();
                }
            }, 2000);
        }

    };

    protect.updateItemGrid = function(content) {
        this.destroyVGrid();
        this.$itemGrid.html(content);
        this.initVGrid();
    };

    protect.getThumbGrid = function() {
        return this.$itemGrid.find('.j-browse-thumbnails');
    };

    protect.initVGrid = function() {
        if (!jive.Filters.isLegacyBrowser()) {
            var thumbGrid = this.getThumbGrid();

            if (thumbGrid.length > 0) {
                thumbGrid.vgrid({
                    easeing: this.sortEasing,
                    duration: this.sortDuration,
                    delay: 0
                });
            }
        }
    };

    protect.refreshVGrid = function() {
        var thumbGrid = this.getThumbGrid(),
            deferred  = new $j.Deferred();

        if (thumbGrid.length > 0) {
            thumbGrid.vgrefresh(null, 0, 0, deferred.resolve.bind(deferred));
        }

        return deferred.promise();
    };

    protect.destroyVGrid = function() {
        var thumbGrid = this.getThumbGrid();

        if (thumbGrid.length > 0) {
            thumbGrid.vgdestroy();
        }
    };

    /* The rest of this class is a hackish workaround for the deficiencies of
     * certain browsers. */

    // IE cannot change the opacity of an element with a transparent PNG
    // background image without losing the opacity of the PNG.
    var crippledBrowser = $.browser.msie && parseFloat($.browser.version) < 9;

    protect.transparentize = function(element, transparency) {
        transparency = typeof transparency == 'undefined' ? 1 : transparency;

        if (!crippledBrowser) {
            element.css('opacity', 1 - transparency);
        } else {
            element.css('visibility', transparency == 1 ? 'hidden' : 'visible');
        }
    };

    protect.opacify = function(element) {
        if (!crippledBrowser) {
            element.css('opacity', 1);
        } else {
            element.css('visibility', 'visible');
        }
    };

    protect.fadeOut = function(element, duration, callback) {
        if (!crippledBrowser) {
            element.animate({
                opacity: 0
            }, duration, callback);
        } else {
            this.transparentize(element);
            if (callback) {
                jive.conc.nextTick(callback);
            }
        }
    };

    protect.fadeIn = function(element, duration, callback) {
        if (!crippledBrowser) {
            element.animate({
                opacity: 1
            }, duration, callback);
        } else {
            this.opacify(element);
            if (callback) {
                jive.conc.nextTick(callback);
            }
        }
    };

    protect.displayMoreSearchResultsMessage = function(results){
        this.$moreResultsAvailable.html(jive.browse.grid.moreSearchResultsAvailable(results));
    }

});

define('jive.filters.ItemGridView', function() {
    return jive.Filters.ItemGridView;
});
