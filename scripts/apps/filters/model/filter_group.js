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
 * Model class that represents a hierarchy of BrowseFilters
 *
 * @class
 * @param {BrowseFilter|BrowseFilter[]} filters or filter
 * @param {Function} [predicate] if given methods of the resulting filter group
 * instance will only traverse filters that pass this predicate
 *
 * @depends path=/resources/scripts/lib/core_ext/array.js
 */
jive.Filters.FilterGroup = jive.oo.Class.extend(function(protect) {
    var _ = jive.Filters;

    function defaultPredicate() {
        return true;
    }

    protect.init = function(filters, predicate) {
        var filterGroup = this;

        this.filters = (jQuery.isArray(filters) ? filters : [filters]).filter(function(f) {
            return !!f;
        });
        this.predicate = predicate || defaultPredicate;

        if (this.filters.length > 0) {
            this.linkParents(this.filters);
        }
    };

    /**
     * Returns true if this filter group contains no filters and false
     * otherwise.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @returns {boolean} true or false
     */
    this.isEmpty = function() {
        return this.filters.length < 1 || this.getFilters().length < 1;
    };

    /**
     * Returns the BrowseFilter instance with the given id or throws an
     * exception if the given ID cannot be found.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @param {string} filterID of the particular filter to get
     * @returns {BrowseFilter} a browse filter instance
     */
    this.get = function(filterID) {
        var filter = typeof filterID == 'string' ? this.find(function(f) {
            return f.id == filterID;
        }) : filterID;

        if (filter) {
            return filter;
        } else {
            throw "Could not find a browse filter with id, "+ filterID;
        }
    };

    /**
     * Returns the array of BrowseFilter instances that this filter group was
     * instantiated with.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @protected
     * @returns {BrowseFilter[]} array of BrowseFilter instances
     */
    protect.getFilters = function() {
        return this.filters.filter(this.predicate);
    };

    /**
     * Returns an array of BrowseSort instances that are bound to most deeply nested selected filter with sorts.  This
     * assumes hiearchical ordering of filters.  Known issue: two non-exclusive filter are applied, each with their own sorts.
     * @methodOf jive.Filters.FilterGroup
     * @returns {BrowseSort[]} array of BrowseSort instances
     *
     */
    this.getSorts = function(){
        var vals = [];
        this.forEach(function(filter) {
            if (filter.sorts && filter.sorts.length > 0){
                vals = filter.sorts;
            }
        });
        return vals;
    };

    /**
     * Returns the array of BrowseFilter instances that this filter group was
     * instantiated with.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @returns {BrowseFilter} a BrowseFilter instance
     */
    this.getRoot = function() {
        var filters = this.getFilters();

        if (filters.length == 1) {
            return filters[0];
        } else if (filters.length > 1) {
            throw "Cannot get the root of a filter group that has more than one root.";
        } else {
            throw "Cannot get the root of an empty filter group.";
        }
    };

    /**
     * Returns an array of the ids of all of the filters in this filter group.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @returns {string[]} array of ids of filters
     */
    this.getIDs = function() {
        var filterGroup = this;

        return this.map(function(filter) {
            return filter.id;
        });
    };

    /**
     * Returns an array of the ids of all of the leaf filters in this filter
     * group.  IDs for the lowermost filters in the hierarchy will be included
     * but IDs of their parent filters will not be included.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @returns {string[]} array of ids of filters
     */
    this.getLeafIDs = function() {
        var predicate = this.predicate;

        return this.map(function(f) {
            return f;
        }).filter(function(filter) {
            // Ensure that each filter is a leaf node.
            return !filter.children || filter.children.every(function(child) {
                return !predicate(child);
            });
        }).map(function(filter) {
            return filter.id;
        });
    };

    /**
     * Given an array of filter IDs representing active filters, returns a
     * subtree of this filter group representing all active filters.  That is,
     * it includes the filters specified by the given IDs and their ancestors.
     *
     * The return filterGroup
     *
     * @methodOf jive.Filters.FilterGroup#
     * @param {string[]} filterIDs ids of applied filters
     * @returns {jive.Filters.FilterGroup} a new jive.Filters.FilterGroup instance
     */
    this.applied = function(filterIDs) {
        var filterGroup = this
          , origPredicate = this.predicate
          , root;

        // Some filter IDs may be dynamic and may not be included in the
        // hierarchy yet.  Create filter objects for these IDs now.
        this.forEach(function(filter) {
            var exp = filterGroup.valueExpression(filter);

            if (exp) {
                filterIDs.forEach(function(id) {
                    var matches = id.match(exp);

                    if (matches) {
                        filterGroup.set(filter, matches[1].split('|'));
                    }
                });
            }
        });

        root = this.find(function(filter) {
            return filterIDs.every(function(id) {
                return filterGroup.parentOf(filter, id);
            });
        });

        return new _.FilterGroup(root, function(filter) {
            return origPredicate(filter) && filterIDs.some(function(id) {
                return filterGroup.parentOf(filter, id);
            });
        });
    };

    /**
     * Applies the given callback to each filter in the hierarchy.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @param {Function} callback to apply to each filter
     */
    this.forEach = function(callback, filters) {
        var filterGroup = this;

        // Make sure that this is a breadth-first traversal
        (filters || filterGroup.filters).forEach(function(filter) {
            if (filterGroup.predicate(filter)) {
                callback(filter);
            }
        });

        (filters || filterGroup.filters).forEach(function(filter) {
            if (filter.children && filterGroup.predicate(filter)) {
                filterGroup.forEach(callback, filter.children);
            }
        });
    };

    /**
     * Performs a breadth-first search of the filter hierarchy and returns the
     * first filter that passes the given predicate.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @param {Function} predicate with which to test each filter
     * @returns {BrowseFilter} returns a BrowseFilter instance
     */
    this.find = function(predicate) {
        var found;

        this.forEach(function(filter) {
            if (!found && predicate(filter)) {
                found = filter;
            }
        });

        return found;
    };

    /**
     * Transforms every filter in the hierarchy using the given callback
     * function and returns an array of the results.  Results will be ordered
     * according to a breadth-first traversal of the filter hierarchy.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @param {Function} callback function to use to transform each filter
     * @returns {Array} returns an array of the callback results
     */
    this.map = function(callback) {
        var vals = [];

        this.forEach(function(filter) {
            vals.push(callback(filter));
        });

        return vals;
    };

    /**
     * Returns a new filter group that contains only filters from this group
     * that pass the given predicate.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @param {Function} predicate to apply to each filter
     * @returns {jive.Filters.FilterGroup} a new filter group
     */
    this.filter = function(predicate) {
        var oldPredicate = this.predicate;

        return new _.FilterGroup(this.filters, function(filter) {
            return predicate(filter) && oldPredicate(filter);
        });
    };

    /**
     * Returns true if some filter in the filter group passes the given
     * predicate.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @param {Function} predicate to apply to each filter
     * @returns {boolean} true or false
     */
    this.some = function(predicate) {
        var passed = false;

        this.forEach(function(filter) {
            if (predicate(filter)) {
                passed = true;
            }
        });

        return passed;
    };

    /**
     * Returns true if every filter in the filter group passes the given
     * predicate.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @param {Function} predicate to apply to each filter
     * @returns {boolean} true or false
     */
    this.every = function(predicate) {
        return !this.some(function(filter) {
            return !predicate(filter);
        });
    };

    /**
     * Returns true if the given filter is an ancestor of a filter with the
     * given childFilterID or if the given filter has that ID itself.  Returns
     * false otherwise.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @param {BrowseFilter} filter to check for parenthood
     * @param {string} childFilterID ID of a child filter to check against
     * @returns {boolean}
     */
    this.parentOf = function(filter, childFilterID) {
        var filterGroup = this;

        if (filter.id == childFilterID) {
            return true;
        } else if (filter.children) {
            return filter.children.some(function(child) {
                return filterGroup.parentOf(child, childFilterID);
            });
        } else {
            return false;
        }
    };

    /**
     * Returns true if the given filter is a descendant of a filter with the
     * given parentFilterID or if the given filter has that ID itself.  Returns
     * false otherwise.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @param {BrowseFilter} filter to check for childhood
     * @param {string} parentFilterID ID of a parent filter to check against
     * @returns {boolean}
     */
    this.childOf = function(filter, parentFilterID) {
        var parent = this.get(parentFilterID);
        return this.parentOf(parent, filter.id);
    };

    /**
     * Returns a new filter group with the dynamic value of the given filter set to the given value.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @param {string|BrowseFilter} filterID of the filter to set a value on or the filter itself
     * @param {string|string[]} value or values to set
     * @returns {jive.Filters.FilterGroup} a new filter group
     */
    this.set = function(filterID, value) {
        var origPredicate = this.predicate

          // In case the filter whose value we are setting is not present in
          // this filter group create a new filter group where it is present.
          , filterGroup = new _.FilterGroup(this.filters, function(f) {
              return origPredicate(f) || filterGroup.parentOf(f, filterID);
          })
          , filter = filterGroup.get(filterID)
          , child = {
              type: 'simple'
            , id: this.idWithValue(filter, value)
            , exclusive: true
          };

        if (value && value.length > 0) {
            child.parent = filter;

            // Make sure that the filter has a children collection.
            if (!filter.children) {
                filter.children = [];
            }

            // Add the new filter to the hierarchy if it is not already there.
            if (!filter.children.some(function(f) {
                return f.id == child.id;
            })) {
                filter.children.push(child);
            }

            return new _.FilterGroup(this.filters, function(f) {
                return (origPredicate(f) || filterGroup.parentOf(f, child.id)) &&
                    (!f.parent || f.parent.id != filter.id || f.id == child.id);
            });

        // If no value is given then treat this call as an unset.
        } else {
            return this.unset(filterID);
        }
    };

    /**
     * Returns a new filter group with all dynamic values removed for the given filter.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @param {string|BrowseFilter} filterID of the filter to unset values on or the filter itself
     * @returns {jive.Filters.FilterGroup} a new filter group
     */
    this.unset = function(filterID) {
        var origPredicate = this.predicate;

        return new _.FilterGroup(this.filters, function(f) {
            return origPredicate(f) && (!f.parent || f.parent.id != filterID);
        });
    };

    /**
     * Returns the intersection of the content type properties of filters in
     * this group.  If the content type list of a filter in the group is empty
     * it is excluded from the intersection - so the return value of this
     * method will only be an empty list if no filters have any content types
     * listed.
     *
     * @methodOf jive.Filters.FilterGroup#
     * @returns {string[]} an array of strings
     */
    this.objectTypes = function() {
        var lists = this.map(function(filter) {
            return filter.objectTypes;
        }).filter(function(list) {
            return list && list.length > 0;  // skip empty lists and null values
        });

        // Concatenate all types into a single list.
        var types = lists.reduce(function(types, list) {
            return types.concat(list);
        }, []).unique();

        return types.filter(function(type) {
            return lists.every(function(list) {
                return list.indexOf(type) >= 0;
            });
        });
    };

    var bracketsExp = /\[([^\[]*)\]$/;

    /**
     * Returns the ID of the given filter after modifying it to incorporate
     * the given dynamic value.
     */
    protect.idWithValue = function(filter, value) {
        var key, filled
          , exp = this.valueExpression(filter);

        value = jQuery.isArray(value) ? value.join('|') : value;

        if (filter.id.match(bracketsExp)) {
            // Grab value key.
            key = filter.id.match(bracketsExp)[1];
            filled = filter.id +'~'+ key +'['+ value +']';
        } else {
            filled = filter.id +'['+ value +']';
        }

        if (filled && filled.match(exp)) {
            return filled;
        } else {
            throw "An error occurred applying a dynamic value: "+ filter.id +", "+ value;
        }
    };

    protect.linkParents = function(filters) {
        var filterGroup = this;

        filters.forEach(function(filter) {
            (filter.children || []).forEach(function(child) {
                child.parent = filter;

                filterGroup.linkParents([child]);
            });
        });
    };

    /**
     * Abstracts the procedure for preparing regular expressions for dynamic
     * filter values and caches those expressions.
     */
    protect.valueExpression = function(filter) {
        this.expressions = this.expressions || {};

        var exp = this.expressions[filter.id];

        if (!exp && filter.valueExpression) {
            exp = new RegExp(filter.valueExpression);
            this.expressions[filter.id] = exp;
        }

        return exp;
    };
});
