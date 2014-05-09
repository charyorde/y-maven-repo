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
 * Abstract controller class for browse filters.
 *
 * @class  jive.Filters.Main
 * @extends jive.Paginated
 * @param {Object} options
 * @config {jive.RestService} itemSource This is a RestService
 * @config {jive.RestService} userPrefSource interface to REST service for storing list/thumb preference
 * @config {string} targetUserID id of the target user.
 * @config {string} browseViewID key for the current browse view, e.g. "content", "places", "people"
 * @config {FilterGroupBean} filterGroup hierarchy of browse filters with information about applied and default states
 * @config {string} itemViewID either 'thumb' or 'details' - indicates mode to use when displaying items
 * @config {Object} [extraParams] extra key-value pairs to send with REST calls but that will not be appended to the URL
 * @config {Function} [pageReference] given an ItemsViewBean instance this
 * function should return an object; the properties of that object will be
 * appended to the URL when a page is loaded and will be sent with REST calls
 * @config {Function} [noResults] template function to render when there
 * are no results to display in the item grid view
 *
 * @depends path=/resources/scripts/apps/shared/controllers/localexchange.js
 * @depends path=/resources/scripts/apps/shared/controllers/paginated.js
 * @depends path=/resources/scripts/apps/shared/views/typeahead_input.js
 * @depends path=/resources/scripts/apps/filters/view/item_grid_view.js
 * @depends path=/resources/scripts/apps/filters/view/filter_view.js
 * @depends path=/resources/scripts/apps/filters/view/secondary_nav_view.js
 * @depends path=/resources/scripts/apps/filters/model/filter_group.js
 * @depends path=/resources/scripts/jquery/jquery.ba-bbq.js
 * @depends template=jive.browse.filter.*
 */
jive.Filters.Main = jive.Paginated.extend(function(protect) {
    var _ = jive.Filters
      , unset;  // deliberatly set to `undefined`

    jive.conc.observable(this);

    protect.init = function(options) {
        var main = this;  // Captures a reference to this instance.

        this.extraParams = options.extraParams;        

        this.guest = options.guest;
        this.targetUserID = options.targetUserID;
        this.browseViewID = options.browseViewID;
        this.archetypeID = options.archetypeID || this.browseViewID;
        this.token = options.token ||'';
        this.fromQuest = options.fromQuest;
        this.questStep = options.questStep;

        this.initPagination(jQuery.extend({}, options.extraParams, {
            filterID: options.filterGroup.defaultFilterID,
            itemView: options.itemViewID,
            userID: options.targetUserID,
            numResults: options.pageSize
        }), {
            locationState: options.locationState,
            viewClass: options.viewClass,
            scrollTo: '.j-bigtab-nav'
        });

        // Set up component instances.
        this.itemSource = options.itemSource;
        this.userPrefSource = options.userPrefSource;
        this.filterGroup = new _.FilterGroup(options.filterGroup.filters);
        this.filterView = new _.FilterView({objectTypes: this.filterGroup.applied(this.getState().filterID).objectTypes()});
        this.listView = new (options.itemGridClass || _.ItemGridView)({
            itemViewID: options.itemViewID,
            noResults: options.noResults,
            noResultTemplateConfig: options.noResultTemplateConfig,
            archetypeID: options.archetypeID,
            omitIcons: options.omitIcons,
            baseSelector: options.baseSelector
        });
        this.navView = new _.SecondaryNavView(null, options.filterGroup.defaultFilterID, options.guest);  // handles animating nav links
        this.searchView = new jive.TypeaheadInput('#js-browse-controls input[name=query]', {
            delay: function(val) {
                var x = val.length;
                return x < 2 ? 700 : Math.floor(4000 / (x * x) + 400);
            },
            minLength: 2
        });

        this.navView.addListener('navSelect', function(ids, promise) {
            // Nested filters can be toggled on or off.  Filter out any
            // ids that reference nested filters that are already
            // active.
            var applied = main.filterGroup.applied(main.getState().filterID)
              , filterIDs = ids.filter(function(id) {
                  var filter = applied.find(function(filter) {
                      return filter.id == id;
                  });
                  return !(filter && filter.nested);
              });

            jive.localexchange.emit('browse.filter.change', { filterID: filterIDs });

            main.pushState({
                filterID: filterIDs,
                start: unset,
                sortKey: unset,
                sortOrder: unset,
                containerType: unset,
                containerID: unset,
                query: unset
            }).addErrback(function() {
                promise.emitError();
            });
        });

        //on filter select, rebuild result set
        this.filterView.addListener('applyFilters', function(changes){
            main.applyFilters(changes);
        });

        //allow user to pin default filter for view
        this.navView.addListener('setDefaultFilter', function(filterID, promise) {
            main.saveDefaultFilterSetting(filterID);
            promise.emitSuccess();
        });

        this.filterView.addListener('value', function(filterID, value) {
            var ids = main.getState().filterID
              , applied = main.filterGroup.applied(ids)
              , withoutValue = applied.unset(filterID)
              , withoutValueIDs = main.sortFilters(withoutValue.getLeafIDs())
              , withValue = applied.set(filterID, value);

            main.pushState({
                filterID: main.sortFilters(withValue.getLeafIDs(), withoutValueIDs),
                start: unset
            });
        });

        //on sort select, rebuild result set
        this.filterView.addListener('applySort', function(sortKey, sortOrder) {
            main.pushState({
                sortKey: sortKey,
                sortOrder: sortOrder,
                start: unset
            });
        });

        //on item view toggle, save state if necessary
        this.listView.addListener('toggleItemView', function(value) {
            main.saveItemViewSetting(value);
        });

        this.searchView.addListener('change', function(query) {
            main.pushState({
                query: query,
                start: unset
            });
        });

        this.searchView.addListener('clear', function() {
            main.pushState({
                query: unset,
                start: unset
            });
        });

        jive.localexchange.viewupdatesource = true;
    };

    protect.applyFilters = function(changes) {
        var main = this;
        main.pushState({
            filterID: main.mergeFilters(changes),
            start: unset
        });
    };

    protect.loadPage = function(params, forceReload) {
        var dataReady = this.getContent(params)
          , filterGroup = this.filterGroup.applied(params.filterID)
          , rootFilter = filterGroup.getRoot()
          , promise = new jive.conc.Promise()
          , main = this;

        // Prevents the wrong content from being loaded if the user switches
        // views repeatedly in rapid succession.
        if (this.lastLoadPagePromise) {
            this.lastLoadPagePromise.cancel();
        }
        if (this.lastDataReadyPromise) {
            this.lastDataReadyPromise.cancel();
        }
        this.lastLoadPagePromise = promise;
        this.lastDataReadyPromise = dataReady;

        //restore item view if set
        if (params.itemView){
            main.listView.setItemViewID(params.itemView);
        }

        main.navView.activate(rootFilter.id, filterGroup.map(function(filter) {
            return filter;
        }).filter(function(filter) {
            return filter.nested;
        }).map(function(filter) {
            return filter.id;
        })[0]);

        var dataReadyWithFilters = dataReady.map(function(data) {
            return $j.extend(data, {
                filterGroup: main.filterGroup.applied(params.filterID),
                rootFilter: filterGroup.getRoot(),
                filterIDs: main.sortFilters(filterGroup.getIDs()),
                sorts: filterGroup.getSorts()
            });
        });

        jive.localexchange.emit('view.update.start');
        dataReady.addCallback(function(data) {
            main.dataReadyCallback(params, promise, data);
        }).addErrback(function() {
            promise.emitError();
        }).always(function(){
             jive.localexchange.emit('view.update.stop');
        });

        if (forceReload || this.navChanged(rootFilter, params)) {
            this.listView.update(dataReadyWithFilters);
        } else {
            this.listView.updateWithMerge(dataReady);
        }

        return promise;
    };

    protect.dataReadyCallback = function(params, promise, data) {
        delete this.lastLoadPagePromise;
        delete this.lastDataReadyPromise;

        if (data.filters) {
            this.filterGroup = new _.FilterGroup(data.filters);
        }

        //set browse view ID so we can use it at render layer if needed
        data.browseViewID = this.browseViewID;

        var filterGroup = this.filterGroup.applied(params.filterID)
            , rootFilter = filterGroup.getRoot()
            , filterIDs = this.sortFilters(filterGroup.getIDs()),
            sorts = filterGroup.getSorts();

        promise.emitSuccess(data.pageNumber, data.pageNumber + (data.hasNext ? 1 : 0));

        this.searchView.val(params.query || '');
        this.filterView.setObjectTypes(filterGroup.objectTypes());
        this.filterView.render(rootFilter, filterIDs, data.sortKey || params.sortKey, sorts, data.itemViewID);

        this.emit('navSelect', rootFilter.id);
        this.toggleRSSLink(true);
        this.bindRSSLink(params);        
    };

    protect.getContent = function(params) {
        var main = this;
        var itemView = this.getState().itemView;

        var dataReady = new jive.conc.Promise();

        this.itemSource.findAll(jQuery.extend({
            filterGroupID: this.browseViewID,
            token: main.token,
            itemViewID: itemView
        }, params)).addCallback(function(data) {
            main.token = data.token;
            main.appendQuestInfo(main.fromQuest, main.questStep, data);

            var filterGroup = main.filterGroup.applied(main.getState().filterID)
              , rootFilter = filterGroup.getRoot();
            if (data.prop && data.prop.resultCounts) {
                applyResultCountsToFilter(data.prop.resultCounts, rootFilter);
            }

            if (!data.itemViewModified || !data.itemViewID) {
                dataReady.emitSuccess($j.extend(data, {
                    itemViewID: itemView
                }));
            } else {
                dataReady.emitSuccess(data);
            }
        }).addErrback(function(){
            dataReady.emitError.apply(dataReady, arguments);
        });

        return dataReady;
    };

    function applyResultCountsToFilter(resultCounts, filter) {
        if (resultCounts.hasOwnProperty(filter.id)) {
            filter.resultCount = resultCounts[filter.id];
        }
        if (filter.children) {
            $j.each(filter.children, function(i, child) {
                applyResultCountsToFilter(resultCounts, child);
            });
        }
    }

    protect.removeGridItem = function(item) {
        var main = this;
        //attempt in case data is cached
        if (!main.listView.removeItem(item)) {
            //if data not cached yet, fetch data
            main.loadPage(main.getState(), false).addCallback(function(data) {
                //try again now that data is loaded
                main.listView.removeItem(item);
            });
        }
    };

    protect.saveItemViewSetting = function(value){
        if (this.browseViewID){
            var propName = "browse." + this.archetypeID + ".itemviewtoggle";
            //only try saving item view ID for non-anonymous users
            if (!this.guest){
                this.userPrefSource.setUserProperty({
                    userID: 'current',
                    propName: propName,
                    propValue: value
                });
            }
            this.pushState({ itemView: value });
        } else {
            throw "No browseViewID option has been specified for this view.";
        }
    };

    protect.saveDefaultFilterSetting = function(value){
        if (this.browseViewID){
            //only try saving default filter for non-anonymous users
            if (!this.guest){
                var propName = "browse." + this.browseViewID + ".defaultfilter";
                this.userPrefSource.setUserProperty({userID: 'current', propName: propName, propValue: value});
            }
        } else {
            throw "No browseViewID option has been specified for this view.";
        }
    };

    /**
     * If this method returns true then we will swap browse grid items without
     * the fancy merge animation.
     */
    protect.navChanged = function(filter, params) {
        var lastNav = this.navTab
          , lastPage = this.lastPage
          , lastItemView = this.lastItemView
          , lastState;

        if (!lastNav || typeof lastPage == 'undefined' || !lastItemView) {
            lastState = this.normalized(this.lastState);
            lastNav = this.filterGroup.applied(lastState.filterID).getRoot().id;
            lastPage = lastState.start;
            lastItemView = lastState.itemView;
        }

        this.navTab = filter.id;
        this.lastPage = params.start;
        this.lastItemView = params.itemView;

        return lastNav != filter.id || lastPage != params.start || lastItemView != params.itemView;
    };

    /**
     * Given a filter id returns an array with the new id merged with any
     * existing filter id in the location state.  This method is a bit
     * convoluted because it is necessary to remove any filter IDs that need to
     * be removed before adding new filters to preserve the order in which the
     * user sees the filters.
     */
    protect.mergeFilters = function(to) {
        var ids = this.getState().filterID
          , filterGroup = this.filterGroup.applied(ids)

          , defaultFilterID = filterGroup.getRoot().children.filter(function(filter) {
              return !filter.nested && filter.exclusive;
          }).map(function(filter) {
              return filter.id;
          })[0]

          // Do not apply the "choose a filter" option.
          , toAdd = (to.add || []).filter(function(id) {
              return id != defaultFilterID;
          })

          , afterRemoval = (to.remove && to.remove.length > 0) ? filterGroup.filter(function(filter) {
              return to.remove.every(function(id) {
                  return filter.id != id;
              });
          }) : filterGroup
          , afterRemovalIDs = this.sortFilters(afterRemoval.getLeafIDs())
          , afterAdd = this.filterGroup.applied(ids.concat(toAdd))
          , newGroup = (to.remove && to.remove.length > 0) ? afterAdd.filter(function(filter) {
              return to.remove.every(function(id) {
                  return filter.id != id;
              });
          }) : afterAdd;

        return this.sortFilters(newGroup.getLeafIDs(), afterRemovalIDs);
    };

    function getPosition(id, ids, filterGroup) {
        var index = ids.indexOf(id)
          , parentIdx;

        if (index > -1) {
            return index;

        // Look for a parent of the given filter or a child of the given filter
        // that is already in ids.  If one exists return the position of that
        // id as the position of the new id.  Use the position of the leaf-most
        // parent or child if multiple candidates are found.
        } else {
            parentIdx = (ids.map(function(id, i) {
                return [filterGroup.get(id), i];
            }).filter(function(pair) {
                var filter = pair[0];

                return filterGroup.parentOf(filter, id) ||
                    filterGroup.childOf(filter, id);
            })[0] || [])[1];

            // If no candidate is found in ids then return a large number so
            // that the new filter will be sorted at the end of the list.
            return typeof parentIdx != 'undefined' ? parentIdx : 999;
        }
    }

    /**
     * Preserve the order of filter IDs with respect to their established order
     * in the location state to keep UI elements from moving around when
     * changing filters.
     */
    protect.sortFilters = function(ids, existingIDs) {
        existingIDs = existingIDs || this.getState().filterID;
        var filterGroup = this.filterGroup;

        return ids.sort(function(a, b) {
            var idxA = getPosition(a, existingIDs, filterGroup)
              , idxB = getPosition(b, existingIDs, filterGroup);

            return idxA - idxB;
        });
    };

    protect.toggleRSSLink = function(show) {
        if (show) {
            jQuery('.js-rss-link').show();
        }
        else {
            jQuery('.js-rss-link').hide();
        }
    };

    protect.bindRSSLink = function(params) {
        var rssParams = {
            userID: params.userID,
            containerType: params.containerType,
            containerID: params.containerID,
            query: params.query,
            filterID: params.filterID
        };
        var link = $j('.js-content-feed-link[data-base-url]');
        var url;

        if (link.length > 0) {
            url = $j.param.querystring(link.data('base-url'), rssParams);
            $j('.js-content-feed-link').attr('href', url);
        }
    };

    protect.appendQuestInfo = function(fromQuest, questStep, data) {
        if (!fromQuest) {
            return;
        }
        for (var i in data.items) {
            var item = data.items[i]
            item.link = item.link + '?fromQ=' + fromQuest + '&sqtep=' + questStep;
        }
    };
});

/**
 * JIVE-7660 this is a temporary function until we can make more substantial performance improvements to the browse pages
 * @returns {boolean} returns true if the browser is IE < 8
 */
jive.Filters.isLegacyBrowser = function() {
    // that's right IE7. You're ancient.
    var isIE         = $j.browser.msie,
        isOlderThan8 = parseInt($j.browser.version) < 8;

    return !!(isIE && isOlderThan8);
};
