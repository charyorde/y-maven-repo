/*
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('search');  // Creates the jive.search namespace if it does not already exist.

jive.search.arrived = new Date().getTime();

jive.search.SearchMetrics = jive.oo.Class.extend(function(protect) {
    var $ = jQuery;
    
    protect.init = function(name) {
        this.data = {
            name: name,
            referrer: document.referrer,
            pageArriveDate: jive.search.arrived,
            pageLeftDate: undefined,
            queries: []
        };
        
        this.byName = {};
        
        var self = this;
        $(window).on('beforeunload', function() {
            self.data.pageLeftDate = new Date().getTime();
            if (self.data.queries.length) {
                self.commit(true);
            }
        });
    };
    
    this.commit = function(sync) {
        var jsonBody = JSON.stringify(this);
        return $.ajax({
            type: 'POST',
            url: jive.app.url({ path: '/api/core/v3/search/monitor'} ),
            data: jsonBody,
            async: !sync,
            contentType: 'application/json',
            dataType: 'json'
        });
    };
    
    this.addQuery = function(query, name) {
        this.data.queries.push(query);
        if (name) {
            this.byName[name] = query;
            if (name.slice(0, 3) === 'alt') {
                query.isAlternate = true;
            }
        }
        return this;
    };
    
    this.getQuery = function(name) {
        return this.byName[name];
    };

    this.forEachCurrent = function(iterator) {
        for (var i in this.byName) {
            if (this.byName.hasOwnProperty(i)) {
                iterator(this.byName[i], i);
            }
        }
        return this;
    };
    
    this.setChoice = function(name, index, url) {
        var query = this.byName[name];
        var result = query.getResult(index);
        query.setChoice({
            index: index,
            item: result,
            clickedUrl: url,
            date: new Date().getTime()
        });
        return this;
    };
    
    this.toJSON = function() {
        return this.data;
    };
});


jive.search.SearchMetricsQuery = jive.oo.Class.extend(function(protect) {
    
    
    protect.init = function(query, sentDate) {
        this.data = {
            query: query || '',
            sentDate: sentDate || new Date().getTime(),
            returnedDate: undefined,
            results: []
        };
    };
    
    
    this.addResults = function(results) {
        var exResults = this.data.results;
        exResults.push.apply(exResults, results);
        return this;
    };
    
    this.getResult = function(index) {
        return this.data.results[index];
    };
    
    this.forEachResult = function(iterator) {
        var results = this.data.results;
        for (var i in results) {
            if (results.hasOwnProperty(i)) {
                iterator(results[i], i);
            }
        }
        return this;
    };
    
    this.setReturnedDate = function(date) {
        this.data.returnedDate = date;
        return this;
    };
    
    this.incPage = function() {
        this.data.pagesLoaded = (this.data.pagesLoaded || 0) + 1;
        return this;
    };
    
    this.abort = function() {
        this.data.aborted = new Date().getTime();
        return this;
    };
    
    this.setChoice = function(choice) {
        this.data.choice = choice;
        return this;
    };

    this.toJSON = function() {
        return this.data;
    };
});