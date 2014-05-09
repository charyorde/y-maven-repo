/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*globals Zapatec kjs */

jive.namespace('Filters');  // Creates the jive.Filters namespace if it does not already exist.

/**
 * Handles UI for filters for a browse view.
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/compose.js
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/apps/shared/views/collapsable.js
 * @depends path=/resources/scripts/zapatec/zpcal/src/calendar-bootstrap.js
 * @depends path=/resources/scripts/apps/filters/controllers/tag_autocomplete.js
 * @depends path=/resources/scripts/apps/shared/controllers/localexchange.js
 * @depends path=/resources/scripts/jquery/jquery.ba-bbq.js
 * @depends template=jive.browse.filter.filters
 */
jive.Filters.FilterView = jive.oo.compose(
    jive.AbstractView, jive.Collapsable
).extend(function(protect) {
    var $ = jQuery
      , _ = jive.Filters;

    protect.primary   = '#j-browse-filters';
    protect.secondary = '#j-browse-child-filter-list';

    protect.init = function(options) {
        this.setObjectTypes(options.objectTypes);
        this.bindFilterHandlers();
        this.bindSortHandlers();
        this.initSearchBox();  
        this.preventEnterSubmit();
        this.enabled = true;

        this.collapsable({
            availableWidth: function() {
                var parent = $(this.primary +' .js-browse-filter-toggle-set').parent()
                  , rightThing = $('#j-item-view-toggle');
                return parent.width() - rightThing.width();
            },
            element: this.primary +' .js-browse-filter-toggle-set li',
            shrinkable: '.js-shrinkable'
        });

        jive.localexchange.addListener('browse.filter.change', function(filters) {
            // JIVE-7989 fully disable this filter when certain category filters are active
            this.enabled = filters.filterID.indexOf('recommended') === -1;
            this.pauseUpdates(!this.enabled);
            $(protect.primary).parent().toggle(this.enabled);
        }.bind(this));
    };

    /**
     * The given content types are passed to the tag suggestion service when
     * using the tag filter.
     */
    this.setObjectTypes = function(objectTypes) {
        this.objectTypes = objectTypes;
    };

    protect.bindFilterHandlers = function() {
        var $context = $('#j-browse-filters')
          , $filters = $context.find('select.js-browse-filter')
          , $filterLinks = $j('#js-browse-controls').find('a.js-browse-filter')
          , $togglefilters = $context.find('span.js-browse-filter-toggle')
          , $booleanfilters = $context.find('span.js-browse-filter-boolean')
          , $tagfilters = $context.find('span.js-browse-filter-tags')
          , $datepickers = $context.find('span.js-browse-filter-datepicker')
          , $removeLinks = $context.find('a.js-remove-filter')
          , view = this;

        $filters.each(function() {
            $(this).data('lastValue', $(this).val());
        });

        $filters.change(function() {
            var filterID = $(this).val()
              , prevFilterID = $(this).data('lastValue');

            view.emit('applyFilters', {
                add: [filterID],
                remove: prevFilterID ? [prevFilterID] : []
            });

            $(this).data('lastValue', filterID);
        });

        $filterLinks.click(function(event) {
            var filterID = $(this).data('filter-id')
              , otherFilters = $(this).closest('.js-browse-filter-toggle-set').find('a.js-browse-filter')
              , toRemove = otherFilters.toArray().map(function(l) {
                  return $(l).data('filter-id');
              }).filter(function(id) {
                  return id != filterID;
              });

            view.emit('applyFilters', {
                add: [filterID],
                remove: toRemove
            });

            event.preventDefault();
        });

        $togglefilters.each(function() {
            view.initToggleFilter(this);
        });

        $booleanfilters.each(function() {
            view.initBooleanFilter(this);
        });

        $tagfilters.each(function() {
            view.initTagFilter(this);
        });

        $datepickers.each(function() {
            view.initDateRange(this);
        });

        $removeLinks.click(function(e) {
            var filterID = $(this).parent().find('.j-browse-filter').val();
            view.emit('applyFilters', {
                add: [],
                remove: [filterID]
            });
            e.preventDefault();
        });
    };

    this.bindSortHandlers = function(){
        var view = this;
        $("#j-sort").change(function(){
            var sortKey = $(this).val();           
            var sortOrder = $(this).find(":selected").data("sort-order");      

            //emit an event for the controller to handle, and add callback for view
            view.emit('applySort', sortKey, sortOrder);
        });
    } ;

    /**
     * Given a promise that will eventually yield data to display, displays
     * that data when the promise is ready.
     */
    this.render = function(rootFilter, filterIDs, sortKey, sorts, itemViewID) {
        $(this.primary).parent().toggle(this.enabled);

        if (this.enabled) {
            this.updateControls(rootFilter, filterIDs, sorts, sortKey, itemViewID);
            this.updateSearchBox(rootFilter);
        }
    };

    protect.updateControls = function(rootFilter, filterIDs, sorts, sortKey, itemViewID) {
        var oldControls, newControls
          , args = arguments
          , view = this;

        // The skipUpdates property signals that a text box has keyboard focus
        // and so we should not redraw browse controls at the moment to avoid
        // focus issues.
        if (!this.skipUpdates) {
            clearTimeout(this.pendingControlsUpdateTimeout);
            delete this.pendingControlsUpdate;

            this.tearDownFilters();

            oldControls = $('#js-browse-controls');
            newControls = $(jive.browse.filter.filters({
                filters: [rootFilter],
                appliedFilterIDs: filterIDs,
                sorts: sorts,
                appliedSortKey: sortKey,
                urlParams: $.deparam.querystring(),
                urlPath: window.location.pathname,
                itemViewID : itemViewID
            }));

            // Some of the elements rendered by jive.browse.filters in this
            // case are placeholders.  Swap these out with the real elements
            // that are already on the page.
            newControls.find('.js-placeholder').each(function() {
                $(this).replaceWith(oldControls.find($(this).data('selector')));
            });

            oldControls.replaceWith(newControls);

            // If the object type filters have been collapsed by
            // jive.Collapsable then make sure that they are still
            // collapsed after being re-rendered.
            this.recollapse();

            this.bindFilterHandlers();
            this.bindSortHandlers();
        } else {
            // Schedule update to run again after control updates are
            // unpaused.
            this.pendingControlsUpdate = function() {
                view.updateControls.apply(view, args);
            };
        }
    };

    /**
     * When invoked with a value of `true` signals that a text box in
     * the filter controls has keyboard focus and so we should not
     * redraw browse controls at the moment to avoid focus issues.  The
     * latest update will be held until this method is called again with
     * the value `false`.
     */
    protect.pauseUpdates = function(pauseUpdates) {
        var pending = this.pendingControlsUpdate;

        this.skipUpdates = pauseUpdates;

        if (!pauseUpdates && pending) {
            clearTimeout(this.pendingControlsUpdateTimeout);
            this.pendingControlsUpdateTimeout = setTimeout(pending, 333);
            // In my tests this delay had to be at least 115 ms.
            // pauseUpdates(false) can be invoked by a mouse click that
            // produces a blur event.  We need this callback to be
            // delayed until after the corresponding click event, which
            // runs after the blur event.  Hence the minimum delay time.
        }
    };

    protect.updateSearchBox = function(filter) {
        var $searchBox = $('.j-browse-search');

        if (filter && filter.searchable) {
            $searchBox.show();
        } else {
            $searchBox.hide();
        }
    };

    // Prevent browse controls from redrawing while the typeahead search box
    // has focus to prevent keyboard focus issues.
    protect.initSearchBox = function() {
        var $search = $('#js-browse-controls input[name=query]')
          , view = this;

        $search.focus(function() {
            view.pauseUpdates(true);
        }).blur(function() {
            view.pauseUpdates(false);
        });
    };
    
    // prevent the filter form from being submitted
    protect.preventEnterSubmit = function() {
    	$('#js-browse-controls').live('submit', function(e) {
    		e.preventDefault();
    	});
    };

    protect.initToggleFilter = function(element) {
        var filterID = $(element).data('filter-id')
          , view = this;

        $(element).find('input').change(function() {
            var value = $(this).is(':checked') ? $(this).val() : [];
            view.emit('value', filterID, value);
        });
    };

    protect.initBooleanFilter = function(element) {
        var filterID = $(element).data('filter-id')
          , view = this;

        $(element).find('input').change(function() {
            view.emit('value', filterID, $(this).val());
        });
    };

    protect.initTagFilter = function(element) {
        var filterID = $(element).data('filter-id')
          , $input = $(element).find('input')
          , view = this;

        var tagAutocomplete = new _.TagAutocomplete($input, {
            objectTypes: this.objectTypes
        })
        .addListener('change', function(tags) {
            view.emit('value', filterID, tags);
        })

        // Prevent filters from being redrawn while the tag input has keyboard
        // focus.
        .addListener('focus', function() {
            view.pauseUpdates(true);
        })
        .addListener('blur', function() {
            view.pauseUpdates(false);
        });

        this.registerTeardown(function() {
            tagAutocomplete.removeListener('change');
        });
    };

    protect.initDateRange = function(element) {
        var filterID = $(element).data('filter-id')
          , min = $(element).find('[name=min]')
          , max = $(element).find('[name=max]')
          , minVal = min.data('date') || ''
          , maxVal = max.data('date') || ''
          , view = this;

        this.initDatePicker(min, function(calendar) {
            minVal = calendar.date.getTime();
            view.emit('value', filterID, [minVal, maxVal]);
        });

        this.initDatePicker(max, function(calendar) {
            maxVal = calendar.date.getTime();
            view.emit('value', filterID, [minVal, maxVal]);
        });
    };

    protect.initDatePicker = function(element, onUpdate) {
        var $element = $(element)
          , id = $element.attr('id')
          , date = $element.data('date') ? new Date($element.data('date')) : null
          , view = this;

        Zapatec.Calendar.bootstrap({
            inputField: id
          , button: id +'_button'
          , date: date
          , showsTime: false
          , step: 1
          , onUpdate: onUpdate
        });

        // Display date in input field.
        define(['Zapatec.Calendar'], function(Calendar) {
            if (date) {
                $('#'+ id).val(date.print(Calendar._TT.DEF_DATE_FORMAT));
            }
        });
    };

    protect.registerTeardown = function(callback) {
        this.teardowns = this.teardowns || [];
        this.teardowns.push(callback);
    };

    protect.tearDownFilters = function() {
        (this.teardowns || []).forEach(function(callback) {
            callback();
        });
        this.teardowns = [];
    };
});
