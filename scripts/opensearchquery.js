/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
 
jive.OSQuery = function(searchTerm, searchingMessage, errorMessage) {
    this.searchTerm = searchTerm;
    this.searchingMessage = searchingMessage;
    this.errorMessage = errorMessage;
};
 
$j.extend(jive.OSQuery.prototype, {
    
    loadOpenSearchResults: function (engineID) {
        $j("jive-search-opensearch-" + engineID + "-resultcount").html(this.searchingMessage);
        var that = this;
        OpenSearchQuery.getSearchResultsByEngineID(engineID, this.searchTerm, {
            callback: function(data) {
                that.writeOSResults(data, engineID);
            },
            errorHandler: function(errorString, exception) {
                $j("#jive-search-opensearch-"
                        + engineID).html("<div class=\"jive-search-results-opensearch\"><span class=\"jive-opensearch-error\">"
                        + that.errorMessage + "</span></div>");
                $j("#jive-search-opensearch-" + engineID + "-resultcount").html(" ");
            }
        });
    },
    
    writeOSResults: function(data, engineID) {
        var results = data.results;
        $j("#jive-search-opensearch-" + engineID + "-resultcount").html(" (" + data.totalItemCount + ")");
        var ulId = "jive-search-opensearch-" + engineID + "-list";
        dwr.util.removeAllOptions(ulId);
        
        var that = this;
        var formatterFunction = function(data) {
            return that.resultFormatter.call(that, data);
        };
        
        dwr.util.addOptions(ulId, results, formatterFunction, {escapeHtml:false }); 
        if (data.moreAvailable) $j("#jive-search-opensearch-" + engineID + "-link").show();
    },
    
    resultFormatter: function(data) {
        return "<a href=\"" + data.resourceURL + "\" target=\"_new\" title=\"" + data.description + "\">"
                + "<span class=\"" + data.resourceIconCss + "\"></span>" + data.title + "</a> " + "<span>by: "
                + data.author + " created on: " + this.resultDateFormatter(data.publishedDate) + " last updated: "
                + this.resultDateFormatter(data.lastUpdatedDate) + "</span>";
    },
    
    //NOTE: this needs to respect the user's locale, but doesn't yet
    resultDateFormatter: function(d) {
        return (d) ? (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear() : ""; 
    }  
    
});
