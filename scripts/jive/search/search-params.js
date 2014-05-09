/*
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('search');  // Creates the jive.search namespace if it does not already exist.


jive.search.SearchParams = jive.oo.Class.extend(function(protect) {
    
    jive.conc.observable(this);
    var $ = jQuery;
    var filterExp = /([^\(]*)\((.*)\)/;
    var defaults = {
        q: '',
        facet: 'content',
        sort: 'relevanceDesc'
    };

    var facets = {
        content: {
            validParams: [ 'count', 'startIndex', 'sort' ],
            validFilters: [ 'search', 'type', 'after', 'tag', 'author', 'place' ]
        },
        people: {
            validParams: [ 'facet', 'count', 'startIndex', 'sort' ],
            validFilters: [ 'search', 'nameonly' ]
        },
        places: {
            validParams: [ 'facet', 'count', 'startIndex', 'sort' ],
            validFilters: [ 'search', 'type', 'tag' ]
        }
    };
    
    var aliases = { q: 'search' };
    var changes = {};

    function formatFilter (name, value) {
        return name + '(' + value + ')';
    }
    
    
    
    protect.init = function(urlParams) {
        this.params = {};
        this.filters = {};
        if (urlParams) {
            this.setUrlParams(urlParams, { silent: true });
        }
        
        this.addListener('changing', function(param, value) {
            // if changing facets, reset everything except search
            if (param === 'facet') {
                this.clear({ keep: ['q', 'search', 'facet'] });
                this.updateAll = true;
            } else if (param === 'q') {
                this.updateAll = true;
            }
        });
    };
    
    
    protect.changed = function(param, value, options) {
        if ((options && options.silent)) {
            return;
        }

        this.emit('changing', param, value);
        
        changes[param] = value;
        
        if (this._timeout) {
            return;
        }
        
        var self = this;
        this._timeout = setTimeout(function() {
            self._timeout = null;
            self.emit('change', changes);
            changes = {};
        }, 0);
    };
    
    
    this.getFormattedFilter = function(name) {
        var alias = aliases[name] || name;
        var value = this.filters[name] || this.params[name];
        if (this.getParam('facet') === 'content' && alias === 'type' && value === 'discussion') {
            value += ',message'
        }
        
        if (value) {
            if (alias === 'search') {
                // escape parenthesis, commas, and backslashes
                value = value.replace(/([(),\\])/g, '\\$1');
            }
            
            return formatFilter(alias, value);
        } else {
            return '';
        }
    };
    
    
    this.getSearchParams = function() {
        // this returns this.params + this.filters, optionally converting params to filters
        var filters = [],
            urlParams = { filter: filters },
            facet = this.getParam('facet'),
            facetInfo = facets[facet],
            self = this;

        Object.keys(this.params).forEach(function (name) {
            var alias = aliases[name] || name;
            
            if (facetInfo.validParams.indexOf(alias) !== -1) {
                urlParams[alias] = self.params[name];
            } else if (facetInfo.validFilters.indexOf(alias) !== -1) {
                // allow the params to fit the filters
                filters.push(self.getFormattedFilter(name));
            }
        });
        
        Object.keys(this.filters).forEach(function (name) {
            var alias = aliases[name] || name;

            if (facetInfo.validFilters.indexOf(alias) !== -1) {
                filters.push(self.getFormattedFilter(name));
            }
        });
        
        return urlParams;
    };
    
    
    this.getUrlParams = function() {
        // this returns this.params + this.filters, optionally converting params to filters
        var filters = [],
            urlParams = { },
            facet = this.getParam('facet'),
            facetInfo = facets[facet],
            self = this;
        
        Object.keys(this.params).forEach(function (name) {
            var alias = aliases[name] || name;
            
            if (facetInfo.validParams.indexOf(alias) !== -1 || facetInfo.validFilters.indexOf(alias) !== -1) {
                urlParams[name] = self.params[name];
            }
        });
        
        Object.keys(this.filters).forEach(function (name) {
            var alias = aliases[name] || name;
            
            if (facetInfo.validFilters.indexOf(alias) !== -1) {
                filters.push(formatFilter(alias, self.filters[name]));
            }
        });
        
        if (filters.length) {
            urlParams.filter = filters;
        }
        
        return urlParams;
    };
    
    
    this.setUrlParams = function(params, options) {
        var searchParams = this;
        var paramsSet = {};
        var filtersSet = {};
        
        if (params.filter) {
            var filters = $j.isArray(params.filter) ? params.filter : [params.filter];
            filters.forEach(function(filter) {
                var match = filter.match(filterExp);
                filtersSet[match[1]] = true;
                searchParams.setFilter(match[1], match[2], options);
            });
        }
        
        for (var i in params) {
            if (params.hasOwnProperty(i) && i !== 'filter') {
                paramsSet[i] = true;
                this.setParam(i, params[i], options);
            }
        }
        
        for (i in this.filters) {
            if (this.filters.hasOwnProperty(i)) {
                if (!filtersSet[i]) {
                    this.removeFilter(i);
                }
            }
        }
        
        for (i in this.params) {
            if (this.params.hasOwnProperty(i)) {
                if (!paramsSet[i]) {
                    this.removeParam(i);
                }
            }
        }
    };
    
    
    this.getParam = function(name) {
        return this.params[name] || defaults[name];
    };
    
    this.setParam = function(name, value, options) {
        if (!value || value === defaults[name]) {
            this.removeParam(name, options);
        } else {
            if (this.params[name] !== value) {
                this.params[name] = value;
                this.changed(name, value, options);
            }
        }
    };
    
    this.removeParam = function(name, options) {
        if (this.params[name] === undefined) {
            return;
        }
        
        delete this.params[name];
        this.changed(name, defaults[name], options);
    };
    
    this.clearParams = function(options) {
        var keep = options && options.keep || [];
        
        // only clear and dispatch change if params has anything in it
        for (var i in this.params) {
            if (this.params.hasOwnProperty(i) && keep.indexOf(i) === -1) {
                delete this.params[i];
                this.changed(i, defaults[i], options);
            }
        }
    };
    
    
    this.getFilter = function(name) {
        return this.filters[name] || defaults[name];
    };
    
    this.setFilter = function(name, value, options) {
        if (!value || value === defaults[name]) {
            this.removeFilter(name, options);
        } else {
            if (this.filters[name] !== value) {
                if (name === 'search') {
                    this.updateAll = true;
                }
                
                this.filters[name] = value;
                this.changed(name, value, options);
            }
        }
    };
    
    this.removeFilter = function(name, options) {
        if (this.filters[name] === undefined) {
            return;
        }
        delete this.filters[name];
        this.changed(name, defaults[name], options);
    };
    
    this.clearFilters = function(options) {
        var keep = options && options.keep || [];
        
        // only clear and dispatch change if filters has anything in it
        for (var i in this.filters) {
            if (this.filters.hasOwnProperty(i) && keep.indexOf(i) === -1) {
                delete this.filters[i];
                this.changed(i, defaults[i], options);
            }
        }
    };
    
    this.clear = function(options) {
        this.clearParams(options);
        this.clearFilters(options);
    };
    
    this.getUpdateAll = function() {
        var updateAll = this.updateAll;
        this.updateAll = false;
        return updateAll;
    };
    
    this.matches = function(params) {
        return JSON.stringify(params) === JSON.stringify(this.getUrlParams());
    };
});

