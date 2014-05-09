/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace("SearchAdmin");

/**
 * Handles necessary logic for changing tabs on the search admin console page
 * 
 * @depends template=jive.SearchAdmin.soy.*
 */
jive.SearchAdmin.TabView = jive.oo.Class.extend(function(protect) {
    jive.conc.observable(this);

    this.init = function(options) {
        var tabView = this;

        protect.stopWordsLoaded = false;
        protect.synonymsLoaded = false;
        protect.currentTab = false;
        protect.currentStopWordsLang = options.defaultSearchLanguage;
        protect.currentSynonymsLang = options.defaultSearchLanguage;
        protect.multiLangEnabled = options.multiLanguageEnabled || false;

        protect.synonymsEditMode = false;
        protect.currentSynonymsEditRow = false;

        protect.rebuildUrl = options.rebuildUrl;
        protect.updateUrl = options.updateUrl;
        protect.searchTokenGUID = options.searchTokenGUID;
        protect.searchTokenName = options.searchTokenName;
        protect.indexType = options.index.toLowerCase();

        protect.indexRunning = false;

        $j(document).ready(function() {
            // Wire up handlers for the tab links
            $j('#jive-search-control .jive-body-tabbar a').click(function(eventObj) {
                var selectedTabID = $j(this).parent().attr('id');
                var tab = selectedTabID.split('-')[1];
                tabView.emit('tab-clicked', tab);

                eventObj.preventDefault();
            });

            $j('#jive-stopwords-save').click(function(eventObj) {
                var stopWords = $j('#jive-stopwords-ta').val();
                tabView.emit('stopwords-save', tabView.currentStopWordsLang, stopWords);

                eventObj.preventDefault();
            });

            $j('#jive-synonyms-save').click(function(eventObj) {
                var synonyms = $j('#jive-synonyms-ta').val();
                if ($j.trim(synonyms) != '') {
                    tabView.emitP('synonyms-save', tabView.currentSynonymsLang, synonyms)
                        .addCallback(function() {
                            if (tabView.synonymsEditMode) {
                                $j(tabView.currentSynonymsEditRow).find('td:nth-child(1)').text(synonyms);
                                tabView.addMode();
                            }
                            else {
                                tabView.addSynonymsRow(synonyms);
                            }
                        });
                }

                eventObj.preventDefault();
            });

            // Wire up the delete buttons for synonyms rows
            $j('#jive-current-synonyms').delegate('.jive-synonym-row td:nth-child(3) a', 'click', function(eventObj) {
                var synInfo = tabView.getSynonymsInfoForAnchor(this);
                if (confirm(jive.SearchAdmin.soy.deleteSynonymsConfirm({synonyms: synInfo.synonyms}))) {
                    tabView.emitP('synonyms-delete', tabView.currentSynonymsLang, synInfo.synonyms).addCallback(function() {
                        $j(synInfo.row).remove();
                    });
                }
                
                eventObj.preventDefault();
            });

            // Wire up the edit buttons for synonyms row
            $j('#jive-current-synonyms').delegate('.jive-synonym-row td:nth-child(2) a', 'click', function(eventObj) {
                var synInfo = tabView.getSynonymsInfoForAnchor(this);

                // Load the synonyms string into the text area
                $j('#jive-synonyms-ta').val(synInfo.synonyms);
                $j('#jive-synonyms-save').text(jive.SearchAdmin.soy.synonymsSaveText());
                $j('#jive-synonyms-cancel').show();

                protect.synonymsEditMode = true;
                protect.currentSynonymsEditRow = synInfo.row;

                eventObj.preventDefault();
            });

            $j('#jive-synonyms-cancel').click(function(eventObj) {
                tabView.addMode();
                eventObj.preventDefault();
            });

            //wire up the buttons for content index manage operations
            $j('#jive-tasks').delegate('#jive-content-index-status', 'click', function(eventObj) {
                var contentObjectUrl = $j('#jive-content-index-url').val();
                if ($j.trim(contentObjectUrl) !== '') {
                    tabView.emitP('content-index-status', contentObjectUrl)
                        .addCallback(function(contentIndexStatus) {
                            tabView.displayIndexStatus(contentIndexStatus);
                        });
                }

                eventObj.preventDefault();
            });

            $j('#jive-tasks').delegate('#jive-content-update-index', 'click', function(eventObj) {
                var contentObjectUrl = $j('#jive-content-index-url').val();
                if ($j.trim(contentObjectUrl) !== '') {
                    tabView.emitP('update-content-index', contentObjectUrl)
                        .addCallback(function(updateResult) {
                            tabView.displayIndexUpdateResult(updateResult);
                        });
                }

                eventObj.preventDefault();
            });
        });

        if (this.multiLangEnabled) {
            $j(document).ready(function() {
                $j('#jive-synonyms-lang').change(function(eventObj) {
                    var lang = $j(this).val();
                    protect.currentSynonymsLang = lang;
                    tabView.emit('synonyms-lang-change', lang);

                    eventObj.preventDefault();
                });

                $j('#jive-stop-lang').change(function(eventObj) {
                    var lang = $j(this).val();
                    protect.currentStopWordsLang = lang;
                    tabView.emit('stop-lang-change', lang);

                    eventObj.preventDefault();
                });
            });
        }
    };

    protect.addMode = function() {
        $j('#jive-synonyms-ta').val('');
        $j('#jive-synonyms-save').text(jive.SearchAdmin.soy.synonymsAddText());
        $j('#jive-synonyms-cancel').hide();

        protect.synonymsEditMode = false;
        protect.currentSynonymsEditRow = false;
    };

    protect.getSynonymsInfoForAnchor = function(anchorObj) {
        var parentRow = $j(anchorObj).parents('tr')[0];
        var synonyms = $j(parentRow).find('td:nth-child(1)').text();

        return {row: parentRow, synonyms: synonyms};
    };

    this.getCurrentTab = function() {
        return this.currentTab;
    };

    this.showTab = function(selectedTab) {
        var tabView = this;
        
        tabView.makeTabSpanSelected(selectedTab);
        tabView.makeTabPaneVisible(selectedTab);

        protect.currentTab = selectedTab;
    };

    protect.makeTabPaneVisible = function(tab) {
        // Hide all other content panes
        var contentPaneID = 'jive-' + tab;
        $j('#jive-tab-content div.jive-tab-content-pane').each(function(idx) {
           if ($j(this).attr('id') != contentPaneID) {
               $j(this).hide();
           }
        });

        $j('#' + contentPaneID).show();
    };

    protect.makeTabSpanSelected = function(tab) {
        var tabID = 'jive-' + tab + '-tab';
        // Make sure all other tabs are not selected
        $j('#jive-search-control .jive-body-tabbar span').each(function(idx) {
            if ($j(this).attr('id') != tabID) {
                $j(this).removeClass('jive-body-tabcurrent active');
            }
        });

        // Set this tab as selected
        $j('#' + tabID).addClass('jive-body-tabcurrent active');
    };

    this.loadTasksTab = function(statusData) {
        var tabView = this;

        var tabPaneContent = '';
        var newIndexingRunning;
        if (statusData.status == 'UPDATE') {
            tabPaneContent = $j(jive.SearchAdmin.soy.tasks({
                rebuildUrl: tabView.rebuildUrl,
                updateUrl: tabView.updateUrl,
                indexType: tabView.indexType,
                searchTokenGUID: tabView.searchTokenGUID,
                searchTokenName: tabView.searchTokenName,
                rebuildFailureCount: statusData.failureCount
            }));
            newIndexingRunning = false;
        }
        else if (statusData.status == "DISABLED") {
            tabPaneContent = $j(jive.SearchAdmin.soy.tasksDisabled());
            newIndexingRunning = false;
        }
        else {
            tabPaneContent = $j(jive.SearchAdmin.soy.tasksBusy({
                status: statusData
            }));
            newIndexingRunning = true;
        }

        // If indexing was running and now it's not, make sure the index rebuild required message is hidden
        // and show the user a message that the rebuild is complete
        if (tabView.indexingRunning && !newIndexingRunning) {
            $j('#js-rebuild-need-alert').hide();
            tabView.message(jive.SearchAdmin.soy.rebuildComplete());
        }

        protect.indexingRunning = newIndexingRunning;

        $j('#jive-tasks').empty().append(tabPaneContent);
    };

    this.isStopWordsLoaded = function() {
        return this.stopWordsLoaded;
    };

    this.getStopWordsLanguage = function() {
        return this.currentStopWordsLang;
    };

    this.loadStopWordsTab = function(stopWordsData) {
        var tabView = this,
            stopWordsString = stopWordsData.stopWords.join(', ');
        $j('#jive-stopwords-ta').val(stopWordsString);

        protect.stopWordsLoaded = true;
    };

    this.isSynonymsLoaded = function() {
        return this.synonymsLoaded;
    };

    this.getSynonymsLanguage = function() {
        return this.currentSynonymsLang;
    };

    this.loadSynonymsTab = function(synonymsData) {
        var tabView = this;

        // Clear out all data rows
        $j('#jive-current-synonyms tr:gt(0)').remove();

        var tableRows = synonymsData.allSynonyms.map(function(synonymsList) {
            var commaSepSynonyms = synonymsList.join(', ');
            return jive.SearchAdmin.soy.synonymsRow({synonymsString: commaSepSynonyms});
        }).join('');

        $j('#jive-current-synonyms').append($j(tableRows));
        $j('#jive-synonyms-ta').val('');

        protect.synonymsLoaded = true;
    };

    protect.addSynonymsRow = function(synonyms) {
        // Make sure it's pretty
        var synonymsDisplay = synonyms.split(',').map(function(word) {
            return $j.trim(word);
        }).join(', ');

        $j('#jive-current-synonyms').append($j(jive.SearchAdmin.soy.synonymsRow({synonymsString: synonymsDisplay})));
        $j('#jive-synonyms-ta').val('');
    };

    this.showSaveSuccessMessage = function() {
        var tabView = this;
        tabView.message(jive.SearchAdmin.soy.saveSuccessful());
    };

    this.displayIndexStatus = function(contentIndexStatus) {
        var indexStatusContent = $j(jive.SearchAdmin.soy.indexStatusResult({
            contentStatus: contentIndexStatus
        }));

        $j('#jive-content-index-result').empty().append(indexStatusContent);
    };

    this.displayIndexUpdateResult = function(updateResult) {
        var indexResultObj = $j.parseJSON(updateResult);
        var indexResultContent = $j(jive.SearchAdmin.soy.indexUpdateResult({
            updateResult: indexResultObj
        }));

        $j('#jive-content-index-result').empty().append(indexResultContent);
    };


    this.message = function(message) {
        $j('#js-info-msg').html(message);
        $j('#jive-message-box').show();
        setTimeout(function() {
            $j('#jive-message-box').hide();
        }, 5000);
    };
    
});
