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
 * @depends path=/resources/scripts/soy/goog_stub.js
 * @depends path=/resources/scripts/soy/soydata.js
 * @depends path=/resources/scripts/apps/admin/search/views/tab_view.js
 * @depends path=/resources/scripts/apps/admin/search/models/tabs_source.js
 */
jive.SearchAdmin.Main = jive.oo.Class.extend(function(protect) {
    var _ = jive.SearchAdmin;
    
    this.init = function(options) {
        var main = this;

        var initialSelectedTab = options.selectedTab || 'settings';

        protect.multiLangEnabled = options.multiLanguageEnabled || false;

        this.tabView = new _.TabView(options);
        this.tabsSource = new _.TabsSource(options);

        this.tabView
            .addListener('tab-clicked', function(selectedTab) {
                if (main.tabView.getCurrentTab() != selectedTab) {
                    main.loadTab(selectedTab);
                }
            })
            .addListener('stopwords-save', function(languageCode, stopWords) {
                main.tabsSource.saveStopWords(languageCode, stopWords).addCallback(function() {
                    main.tabView.showSaveSuccessMessage();
                });
            })
            .addListener('synonyms-save', function(languageCode, synonyms, promise) {
                main.tabsSource.saveSynonyms(languageCode, synonyms).addCallback(function() {
                    promise.emitSuccess();
                });
            })
            .addListener('synonyms-delete', function(languageCode, synonyms, promise) {
                main.tabsSource.deleteSynonyms(languageCode, synonyms).addCallback(function() {
                    promise.emitSuccess();
                });
            })
            .addListener('content-index-status', function(contentUrl, promise) {
                main.tabsSource.getContentIndexStatus(contentUrl).addCallback(function(contentIndexStatus) {
                    promise.emitSuccess(contentIndexStatus);
                });
            })
            .addListener('update-content-index', function(contentUrl, promise) {
                main.tabsSource.updateContentIndex(contentUrl).addCallback(function(indexUpdateResult) {
                    promise.emitSuccess(indexUpdateResult);
                });
            });

        if (this.multiLangEnabled) {
            this.tabView
                .addListener('stop-lang-change', function(selectedLang) {
                    main.tabsSource.getStopWords(selectedLang).addCallback(function(stopWordsData) {
                        main.tabView.loadStopWordsTab(stopWordsData);
                    });
                })
                .addListener('synonyms-lang-change', function(selectedLang) {
                    main.tabsSource.getSynonyms(selectedLang).addCallback(function(synonymsData) {
                        main.tabView.loadSynonymsTab(synonymsData);
                    });
                });
        }

        $j(document).ready(function() {
            main.loadTab(initialSelectedTab);
        });
    };

    protect.loadTab = function(selectedTab) {
        var main = this;
        if (selectedTab == 'tasks') {
            main.handleTasksTab();
        }
        else if (selectedTab == 'stop') {
            main.handleStopWordsTab();
        }
        else if (selectedTab == 'synonyms') {
            main.handleSynonymsTab();
        }
        else {
            main.tabView.showTab(selectedTab);
        }
    };

    protect.handleTasksTab = function() {
        var main = this;
        main.tabsSource.getIndexTaskStatus().addCallback(function(statusData) {
            main.tabView.loadTasksTab(statusData);
            main.tabView.showTab('tasks');

            if (statusData.status != 'UPDATE') {
                setTimeout(function() {
                    // If still on the tasks pane, update it
                    if (main.tabView.getCurrentTab() == 'tasks') {
                        main.handleTasksTab();
                    }
                }, 5000);
            }
        });
    };

    protect.handleSynonymsTab = function() {
        var main = this;
        if (!main.tabView.isSynonymsLoaded()) {
           var language = main.tabView.getSynonymsLanguage();
           main.tabsSource.getSynonyms(language).addCallback(function(synonymsData) {
               main.tabView.loadSynonymsTab(synonymsData);
               main.tabView.showTab('synonyms');
           });
       }
       else {
           main.tabView.showTab('synonyms');
       }
    };

    protect.handleStopWordsTab = function() {
        var main = this;
        if (!main.tabView.isStopWordsLoaded()) {
           var language = main.tabView.getStopWordsLanguage();
           main.tabsSource.getStopWords(language).addCallback(function(stopWordsData) {
               main.tabView.loadStopWordsTab(stopWordsData);
               main.tabView.showTab('stop');
           });
       }
       else {
           main.tabView.showTab('stop');
       }
    };
    
});
