/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('OrgChart');  // Creates the jive.Filters namespace if it does not already exist.

/**
 * Handles UI for a list of link items
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/controllers/localexchange.js
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/apps/modalizer/main.js
 * @depends template=jive.people.orgChartBody
 * @depends template=jive.people.directReportHover
 */
jive.OrgChart.OrgChartView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    this.init = function() {
        var view = this;
        this.linkDirectReportCounts();

        view.addModal = new jive.Modalizer.Main({
            liveTriggers:['a.js-add-org-relationship'],
            onClose: function(){
                view.emit('create');
            }
        });

        $('#j-browse-item-grid').delegate('.js-del-org-relationship', 'click', function(e){
            var relationshipID = $j(this).data('relationship-id');
            view.emit('retire', relationshipID);
            e.preventDefault();
        });

    };

    //calculate #of direct reports as necessary
    this.linkDirectReportCounts = function() {
        var view = this
          , $hoverDiv = $("#jive-orgchart-directreport-hover");

        // if count is clicked, then show hover
        $("span.jive-orgchart-drpt-count").find("a").hover(function() {
            var $countAnchor = $(this);
            var userID = $countAnchor.parent().parent().find("a[data-userid]").attr("data-userid");
            if (userID){
                view.emitP('showDirectReports', userID).addCallback(function(data) {
                    if (data) {
                        $hoverDiv.html(jive.people.directReportHover(data));
                        $hoverDiv.popover({ context: $countAnchor });
                    }
                });
            }

        }, function(){
            $hoverDiv.hide();
        });
    };

    this.update = function(promise) {
        jive.localexchange.emit('view.update.start');
        var view = this
          , $itemGrid = $("#j-browse-item-grid");

        $('#j-browse-filters').parent().hide();

        $('.j-loading-bg').fadeIn(200);

        promise.addCallback(function(data) {
            //if there's data from the server, render the view in the DOM
            if (data) {
                var content = jive.people.orgChartBody($.extend({}, data, { itemViewID: view.itemViewID }));
                $itemGrid.html(content);
                view.linkDirectReportCounts();
            }
        }).always(function() {
            $('.j-loading-bg').fadeOut(200);
            jive.localexchange.emit('view.update.stop');
        });
    };

});
