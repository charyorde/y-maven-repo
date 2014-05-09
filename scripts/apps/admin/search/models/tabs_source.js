/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('SearchAdmin');

/**
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.SearchAdmin.TabsSource = jive.RestService.extend(function(protect, _super) {

    protect.resourceType = "admin/search";
    protect.pluralizedResourceType = 'admin/search';

    this.init = function(options) {
        _super.init.call(this, options);
        this.index = options.index;
    };

    this.getIndexTaskStatus = function() {
        var url = this.RESOURCE_ENDPOINT + '/status';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url: url, data: {index: this.index}});
    };

    this.getStopWords = function(languageCode) {
        var url = this.RESOURCE_ENDPOINT + '/stopwords/' + languageCode;

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url: url});
    };

    this.saveStopWords = function(languageCode, stopWords) {
        var source = this,
            url = this.RESOURCE_ENDPOINT + '/stopwords/' + languageCode,
            data = {stopWords: stopWords};

        return source.execute(url, data);
    };

    this.getSynonyms = function(languageCode) {
        var url = this.RESOURCE_ENDPOINT + '/synonyms/' + languageCode;

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url: url});
    };

    this.saveSynonyms = function(languageCode, synonyms) {
        var source = this,
            url = this.RESOURCE_ENDPOINT + '/synonyms/' + languageCode,
            data = {synonyms: synonyms};

        return source.execute(url, data);
    };

    this.deleteSynonyms = function(languageCode, synonyms) {
        var source = this,
            url = this.RESOURCE_ENDPOINT + '/synonyms/' + languageCode + '/delete',
            data = {synonyms: synonyms};

        return source.execute(url, data);
    };

    this.getContentIndexStatus = function(contentUrl) {
        var url = this.RESOURCE_ENDPOINT + '/manage/indexStatus';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url: url, data: {contentUrl: contentUrl}});
    };

    this.updateContentIndex = function(contentUrl) {
        var source = this,
            url = this.RESOURCE_ENDPOINT + '/manage/updateIndex',
            data = {contentUrl: contentUrl};

        return source.execute(url, data);
    };

    protect.execute = function(url, data) {
        var source = this,
            promise = new jive.conc.Promise();

        $j.ajax({
            url: url,
            type: 'POST',
            dataType: 'html',
            data: data,
            error: source.errorCallback(promise, source.errorSaving),
            success: function(data, textStatus, xhr) {
                promise.emitSuccess(data);
            }
        });

        return promise;
    };
});
