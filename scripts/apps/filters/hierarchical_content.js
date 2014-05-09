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
 * Mixin for jive.Filters.Main that adds specialized behavior for
 * displaying and navigating space hierarchies.
 *
 * @class
 * @extends jive.Filters.Main
 * @param {Object} options
 * @config {FilterGroupBean} hierarchy of browse filters with information about applied and default states
 * @config {string} itemViewID either 'thumb' or 'details' - indicates mode to use when displaying items
 * @config {Object} [extraParams] extra key-value pairs to send with REST calls but that will not be appended to the URL
 *
 * @depends path=/resources/scripts/apps/filters/main.js
 * @depends path=/resources/scripts/apps/filters/view/space_hierarchy_view.js
 */
jive.Filters.HierarchicalContent = jive.Filters.Main.extend(function(protect, _super) {
    var _ = jive.Filters
      , unset;  // deliberatly set to `undefined`

    protect.init = function(options) {
        var main = this;

        main.rootCommunityID = options.rootCommunityID || 1;
        main.rootCommunityType = options.rootCommunityType || 14;
        main.baseSelector = options.baseSelector || '#j-browse-item-grid';
        main.propNames = options.propNames || [];

        _super.init.apply(this, arguments);

        this.hierarchyView = new _.SpaceHierarchyView(main.baseSelector, options.extraParams, options.itemViewID, options.omitIcons);

        // on selecting a space show its sub-spaces
        this.hierarchyView.addListener('viewSubspaces', function(containerType, containerID) {
            var type = containerType, id = containerID;
            if (containerID == 0 || (containerID == main.getState().containerID)) {
                type = unset;
                id = unset;
            } else if (containerType == main.rootCommunityType && containerID == main.rootCommunityID){    //if root container, don't set these
                type = unset;
                id = unset;
            }
            if (main.browseViewID != 'places'){
                var url = window._jive_base_url + '/places';
                if (containerType != unset && containerID != unset){
                   url += '?filterID=all~objecttype~space&containerType=' + type + '&containerID=' + id;
                } else {
                   url += '?filterID=all';
                }
                window.location = url;
            } else {
                main.pushState({
                    containerType: type,
                    containerID: id,
                    filterID: (type != unset && id != unset) ? 'all~objecttype~space' : 'all',
                    start: unset
                });
            }
        });

        // on selecting a space show its sub-spaces
        this.hierarchyView.addListener('viewSiblings', function(parentID, start, end, promise) {
            var params = {
                containerID: parentID,
                propNames: main.propNames
            };
            if (start) {
                params = jQuery.extend({ start:start }, params);
            }
            if (end){
                params = jQuery.extend({ end:end }, params);
            }
            options.itemSource.getSpaceChildren(params).addCallback(function(data) {
                promise.emitSuccess(data);
            });
        });
    };

    protect.applyFilters = function(changes) {
        var main = this;
        var filterIDs = main.mergeFilters(changes);
        //if space filter not applied, pull off container
        if (!main.hasSpaceFilter(filterIDs)) {
            main.pushState({
                containerType: unset,
                containerID: unset,
                filterID: filterIDs,
                start: unset
            });
        }
        else {
            main.pushState({
                filterID: filterIDs,
                start: unset
            });
        }
    };

    protect.hasSpaceFilter = function(filters){
        for (var i = 0; i < filters.length; i++) {
            var filter = filters[i];
            if (filter.indexOf('objecttype~space') > -1){
                return true;
            }
        }
        return false;
    };

    protect.loadPage = function(params, forceReload) {
        var params = $j.extend({
            propNames: this.propNames
        }, params);
        var promise = _super.loadPage.call(this, params, forceReload)
          , dataReady = this.lastDataReadyPromise
          , main = this;

        if (dataReady){
            dataReady.addCallback(function(data) {
                //special cases for hierarchy view
                main.hierarchyView.setItemViewID(data.itemViewID);
            });

            this.hierarchyView.update(dataReady);
        }

        return promise;
    };

    protect.saveItemViewSetting = function(value) {
        _super.saveItemViewSetting.call(this, value);

        if (this.browseViewID) {
            // don't persist hiearchy view as we can't support it
            // everywhere
            this.hierarchyView.setItemViewID(value);
        }
    };

    /**
     * Returns the ID of the filter under the currently applied filters
     * that will filter content by "space" type.
     */
    protect.spaceFilterID = function() {
        var filterGroup = this.filterGroup
          , applied = filterGroup.applied(this.getState().filterID)
          , spaceFilter = filterGroup.find(function(filter) {
              return filter.simpleName == 'SpaceFilter' &&

                // Make sure that the space filter that is chosen is an
                // ancestor of the currently applied filters.
                applied.some(function(parent) {
                    return filterGroup.childOf(filter, parent);
                });
          });

        return spaceFilter.id;
    };
});
