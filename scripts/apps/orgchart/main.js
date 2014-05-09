/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('OrgChart');  // Creates the jive.OrgChart namespace if it does not already exist.

/**
 * Trait that can be mixed into jive.Filters.Main.  Adds special
 * behavior for displaying a hierarchical org chart using a given person
 * as a point of reference.
 *
 * @depends path=/resources/scripts/apps/filters/main.js
 * @depends path=/resources/scripts/apps/orgchart/view/orgchart_view.js
 */
jive.OrgChart.Main = jive.Filters.Main.extend(function(protect, _super) {
    var _ = jive.OrgChart;

    this.init = function(options) {
        _super.init.call(this, options);

        var main = this;

        // Set up component instances.
        this.orgChartView = new _.OrgChartView();
        main.relSource = new jive.UserRelationshipSource();

        main.orgChartView.addListener('create', function(){
            main.loadPage(main.getState(), true);
        });

        //listen for remove events
        main.orgChartView.addListener('retire', function(relationshipID) {
            main.relSource.orgRetire(relationshipID).addCallback(function() {
                main.loadPage(main.getState(), true);
            });
        });

        //listener for direct report counts
        this.orgChartView.addListener('showDirectReports', function(userID, promise) {
            this.itemSource.getDirectReports({ userID: userID }).addCallback(function(data) {
                promise.emitSuccess(data);
            });
        });
    };

    protect.loadPage = function(params) {
        var filterGroup = this.filterGroup.applied(params.filterID)
          , rootFilter = filterGroup.getRoot()
          , orgChartReady
          , main = this;

        if (filterGroup.some(function(filter) {
            return filter.simpleName == 'OrgChartFilter';
        })) {
            orgChartReady = this.itemSource.findAllOrgChart({userID: main.targetUserID});

            orgChartReady.addCallback(function(data) {
                main.navView.activate(rootFilter.id);
            });

            this.orgChartView.update(orgChartReady);
            return orgChartReady;

        } else {
            return _super.loadPage.apply(this, arguments);
        }
    };
});
