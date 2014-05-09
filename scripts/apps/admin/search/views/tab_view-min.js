jive.namespace("SearchAdmin");jive.SearchAdmin.TabView=jive.oo.Class.extend(function(a){jive.conc.observable(this);this.init=function(b){var c=this;a.stopWordsLoaded=false;a.synonymsLoaded=false;a.currentTab=false;a.currentStopWordsLang=b.defaultSearchLanguage;a.currentSynonymsLang=b.defaultSearchLanguage;a.multiLangEnabled=b.multiLanguageEnabled||false;a.synonymsEditMode=false;a.currentSynonymsEditRow=false;a.rebuildUrl=b.rebuildUrl;a.updateUrl=b.updateUrl;a.searchTokenGUID=b.searchTokenGUID;a.searchTokenName=b.searchTokenName;a.indexType=b.index.toLowerCase();a.indexRunning=false;$j(document).ready(function(){$j("#jive-search-control .jive-body-tabbar a").click(function(e){var f=$j(this).parent().attr("id");var d=f.split("-")[1];c.emit("tab-clicked",d);e.preventDefault()});$j("#jive-stopwords-save").click(function(d){var e=$j("#jive-stopwords-ta").val();c.emit("stopwords-save",c.currentStopWordsLang,e);d.preventDefault()});$j("#jive-synonyms-save").click(function(e){var d=$j("#jive-synonyms-ta").val();if($j.trim(d)!=""){c.emitP("synonyms-save",c.currentSynonymsLang,d).addCallback(function(){if(c.synonymsEditMode){$j(c.currentSynonymsEditRow).find("td:nth-child(1)").text(d);c.addMode()}else{c.addSynonymsRow(d)}})}e.preventDefault()});$j("#jive-current-synonyms").delegate(".jive-synonym-row td:nth-child(3) a","click",function(e){var d=c.getSynonymsInfoForAnchor(this);if(confirm(jive.SearchAdmin.soy.deleteSynonymsConfirm({synonyms:d.synonyms}))){c.emitP("synonyms-delete",c.currentSynonymsLang,d.synonyms).addCallback(function(){$j(d.row).remove()})}e.preventDefault()});$j("#jive-current-synonyms").delegate(".jive-synonym-row td:nth-child(2) a","click",function(e){var d=c.getSynonymsInfoForAnchor(this);$j("#jive-synonyms-ta").val(d.synonyms);$j("#jive-synonyms-save").text(jive.SearchAdmin.soy.synonymsSaveText());$j("#jive-synonyms-cancel").show();a.synonymsEditMode=true;a.currentSynonymsEditRow=d.row;e.preventDefault()});$j("#jive-synonyms-cancel").click(function(d){c.addMode();d.preventDefault()});$j("#jive-tasks").delegate("#jive-content-index-status","click",function(e){var d=$j("#jive-content-index-url").val();if($j.trim(d)!==""){c.emitP("content-index-status",d).addCallback(function(f){c.displayIndexStatus(f)})}e.preventDefault()});$j("#jive-tasks").delegate("#jive-content-update-index","click",function(e){var d=$j("#jive-content-index-url").val();if($j.trim(d)!==""){c.emitP("update-content-index",d).addCallback(function(f){c.displayIndexUpdateResult(f)})}e.preventDefault()})});if(this.multiLangEnabled){$j(document).ready(function(){$j("#jive-synonyms-lang").change(function(d){var e=$j(this).val();a.currentSynonymsLang=e;c.emit("synonyms-lang-change",e);d.preventDefault()});$j("#jive-stop-lang").change(function(d){var e=$j(this).val();a.currentStopWordsLang=e;c.emit("stop-lang-change",e);d.preventDefault()})})}};a.addMode=function(){$j("#jive-synonyms-ta").val("");$j("#jive-synonyms-save").text(jive.SearchAdmin.soy.synonymsAddText());$j("#jive-synonyms-cancel").hide();a.synonymsEditMode=false;a.currentSynonymsEditRow=false};a.getSynonymsInfoForAnchor=function(c){var d=$j(c).parents("tr")[0];var b=$j(d).find("td:nth-child(1)").text();return{row:d,synonyms:b}};this.getCurrentTab=function(){return this.currentTab};this.showTab=function(b){var c=this;c.makeTabSpanSelected(b);c.makeTabPaneVisible(b);a.currentTab=b};a.makeTabPaneVisible=function(b){var c="jive-"+b;$j("#jive-tab-content div.jive-tab-content-pane").each(function(d){if($j(this).attr("id")!=c){$j(this).hide()}});$j("#"+c).show()};a.makeTabSpanSelected=function(c){var b="jive-"+c+"-tab";$j("#jive-search-control .jive-body-tabbar span").each(function(d){if($j(this).attr("id")!=b){$j(this).removeClass("jive-body-tabcurrent active")}});$j("#"+b).addClass("jive-body-tabcurrent active")};this.loadTasksTab=function(d){var b=this;var c="";var e;if(d.status=="UPDATE"){c=$j(jive.SearchAdmin.soy.tasks({rebuildUrl:b.rebuildUrl,updateUrl:b.updateUrl,indexType:b.indexType,searchTokenGUID:b.searchTokenGUID,searchTokenName:b.searchTokenName,rebuildFailureCount:d.failureCount}));e=false}else{if(d.status=="DISABLED"){c=$j(jive.SearchAdmin.soy.tasksDisabled());e=false}else{c=$j(jive.SearchAdmin.soy.tasksBusy({status:d}));e=true}}if(b.indexingRunning&&!e){$j("#js-rebuild-need-alert").hide();b.message(jive.SearchAdmin.soy.rebuildComplete())}a.indexingRunning=e;$j("#jive-tasks").empty().append(c)};this.isStopWordsLoaded=function(){return this.stopWordsLoaded};this.getStopWordsLanguage=function(){return this.currentStopWordsLang};this.loadStopWordsTab=function(d){var b=this,c=d.stopWords.join(", ");$j("#jive-stopwords-ta").val(c);a.stopWordsLoaded=true};this.isSynonymsLoaded=function(){return this.synonymsLoaded};this.getSynonymsLanguage=function(){return this.currentSynonymsLang};this.loadSynonymsTab=function(d){var b=this;$j("#jive-current-synonyms tr:gt(0)").remove();var c=d.allSynonyms.map(function(e){var f=e.join(", ");return jive.SearchAdmin.soy.synonymsRow({synonymsString:f})}).join("");$j("#jive-current-synonyms").append($j(c));$j("#jive-synonyms-ta").val("");a.synonymsLoaded=true};a.addSynonymsRow=function(c){var b=c.split(",").map(function(d){return $j.trim(d)}).join(", ");$j("#jive-current-synonyms").append($j(jive.SearchAdmin.soy.synonymsRow({synonymsString:b})));$j("#jive-synonyms-ta").val("")};this.showSaveSuccessMessage=function(){var b=this;b.message(jive.SearchAdmin.soy.saveSuccessful())};this.displayIndexStatus=function(b){var c=$j(jive.SearchAdmin.soy.indexStatusResult({contentStatus:b}));$j("#jive-content-index-result").empty().append(c)};this.displayIndexUpdateResult=function(d){var c=$j.parseJSON(d);var b=$j(jive.SearchAdmin.soy.indexUpdateResult({updateResult:c}));$j("#jive-content-index-result").empty().append(b)};this.message=function(b){$j("#js-info-msg").html(b);$j("#jive-message-box").show();setTimeout(function(){$j("#jive-message-box").hide()},5000)}});