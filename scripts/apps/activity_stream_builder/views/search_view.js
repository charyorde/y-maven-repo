/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ActivityStream');

/**
 *
 * @extends jive.AbstractView
 *
 * @depends template=jive.eae.common.loadingSpinner
 * @depends path=/resources/scripts/apps/shared/views/typeahead_input.js
 * @depends path=/resources/scripts/jquery/jquery.placeheld.js
 *
 */
jive.ActivityStream.BuilderSearchView = jive.AbstractView.extend(function(protect) {
    this.init = function (options) {
        var searchView = this;
        searchView.currentSearchPage = options.searchPage;
        searchView.lastSearchType = options.searchPage;
        searchView.lastSearchTerm = '';
        searchView.lastSubfilter = 'all';
        searchView.spinnerHTML = $j(jive.eae.common.loadingSpinner());

        searchView.maxResultsPerSet = 10;
        searchView.resetStartingIndex();
        searchView.subFilters = {people: 'all',
                                 places: 'all'};
    };

    this.postRender = function() {
        var searchView = this;
        searchView.$entireBuilderPage = $j('#stream-elements');
        searchView.$searchPageLinks = searchView.$entireBuilderPage.find('a.j-js-search-page-type');
        searchView.$searchPageLinksSearch = searchView.$entireBuilderPage.find('a.j-js-search-page-type.j-toggle-search');
//        searchView.$searchFilterLinks = searchView.$entireBuilderPage.find('a.j-filter-type');

        searchView.$searchField = $j('#j-stream-edit-search-textfield');
        searchView.$searchField.placeHeld();
        searchView.$clearSearch = $j('#j-asb-clear-search');

        searchView.typeAheadInput = new jive.TypeaheadInput('#j-stream-edit-search-textfield', {
            suppressEnterKey: true
        });

        searchView.typeAheadInput.addListener('change', function(value) {
            searchView.typeAheadChangeDetected(value);
        }).addListener('clear', function() {
            searchView.typeAheadChangeDetected();
        });

        searchView.$searchPageLinks.click(function(e) {
            var pageTypeClicked = $j(this).data('pagetype');
            if (pageTypeClicked != searchView.currentSearchPage) {
                searchView.changeSearchPage(pageTypeClicked);
            }
            e.preventDefault();
        });

        searchView.$searchPageLinksSearch.click(function(e) {
            searchView.$searchField.focus();
            e.preventDefault();
        });

        searchView.$clearSearch.click(function(e) {
            e.preventDefault();
            searchView.typeAheadInput.val('');
            $j('#j-stream-edit-search-textfield').change();
        });

        searchView.$entireBuilderPage.delegate('a.j-js-show-more-results', 'click', function(e) {
            var type = $j(this).data('searchtype');
            searchView.startingIndexes[type] += searchView.maxResultsPerSet;
            searchView.doSearch(type, searchView.subFilters[type], searchView.getSetCurrentSearchTerm());
            e.preventDefault();
        });

    };

    this.typeAheadChangeDetected = function(value) {
        var searchView = this;
        if (searchView.currentSearchPage == 'suggested') {
            searchView.changeSearchPage('people-places');
        }
        else {
            searchView.resetStartingIndex();
            searchView.doSearch('people-places', searchView.subFilters, value || '');
        }
    };

    this.changeSearchPage = function(newPage) {
        var searchView = this,
            searchParamSelectedCss = 'font-color-normal';
        searchView.currentSearchPage = newPage;
        searchView.$searchPageLinks.removeClass(searchParamSelectedCss);
        searchView.$searchPageLinks.filter('a[data-pagetype='+newPage+']').addClass(searchParamSelectedCss);
        searchView.resetStartingIndex();
//        searchView.resetSubFilter();
        if (newPage == 'people-places') {
//            searchView.$searchFilterLinks.removeClass(searchParamSelectedCss);
//            searchView.$searchFilterLinks.filter('a[data-filtertype=all]').addClass(searchParamSelectedCss);
        	  searchView.doSearch('people-places', searchView.subFilters, searchView.getSetCurrentSearchTerm());
        }
        else {
            searchView.doSearch('suggested', 'all', searchView.getSetCurrentSearchTerm(''));
        }
    };

//    this.changeFilterType = function($filterLink, filterType, searchType) {
//        var searchView = this,
//            searchTypeSelectedCss = 'font-color-normal';
//        searchView.resetStartingIndex(searchType);
//        searchView.lastSubfilter = filterType;
//        searchView.subFilters[searchType] = filterType;
//        $filterLink.siblings('.j-filter-type').removeClass(searchTypeSelectedCss);
//        $filterLink.addClass(searchTypeSelectedCss);
//        searchView.doSearch(searchType, filterType, searchView.getSetCurrentSearchTerm());
//    };

    this.doSearch = function(type, subfilters, value) {
        var searchView = this;
        searchView.currentSearchTerm = value || '';
        searchView.currentSearchType = type;
        var start = 0;
        if (type == 'people' || type == 'places') {
            start = searchView.startingIndexes[type];
        }
        var searchOptions = {type: type,
                             subfilters: subfilters,
                             value: value || '',
                             start: start,
                             maxResults: searchView.maxResultsPerSet};
        // MT YOOKOS-328 - do not search people with empty string
        if(searchOptions.type == 'people-places' && searchOptions.value.trim() == ''){
        	searchOptions.type='places';
        	searchOptions.subfilters = 'all';
        }
        searchView.showLoading();
        searchView.emitP('search', searchOptions).addCallback(function(data, options) {
            searchView.doneLoading();
            //TODO add clear button
        });

    };

    // called from controller
    this.showLoading = function() {
        var searchView = this,
            content = searchView.getContent();
        searchView.$searchField.after(searchView.spinnerHTML);
    };

    this.doneLoading = function() {
        var searchView = this;
        searchView.$searchField.next().remove();
    };

    this.getSetCurrentSearchTerm = function(value) {
        var searchView = this;
        if (value != undefined) {
            searchView.$searchField.val(value);
            return value;
        }
        return searchView.$searchField.val();
    };

    this.resetStartingIndex = function(searchType) {
        var searchView = this;
        if (searchType) {
            searchView.startingIndexes[searchType] = 0;
        }
        else {
            searchView.startingIndexes = {people: 0,
                                          places: 0};
        }
    };

//    this.resetSubFilter = function(searchType) {
//        var searchView = this;
//        if (searchType) {
//            searchView.subFilters[searchType] = 'all';
//        }
//        else {
//            searchView.subFilters = {people: 'all',
//                                     places: 'all'};
//        }
//    };

});
