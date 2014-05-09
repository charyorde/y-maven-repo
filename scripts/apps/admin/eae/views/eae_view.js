/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace("EAEAdmin");

/**
 * Handles necessary logic for changing tabs on the search admin console page
 *
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/jquery/jquery.progressbar.js
 * @depends template=jive.SearchAdmin.soy.*
 */
jive.EAEAdmin.EAEView = jive.oo.Class.extend(function(protect) {
    jive.conc.observable(this);

    this.init = function(options) {
        var eaeView = this;
        var i;

        $j(document).ready(function() {
            $j("#total-progressbar").progressBar(0, {
                boxImage: '/images/progressbar.gif',
                barImage: '/images/progressbg_green.gif'
            });

            $j("#current-progressbar").progressBar(0, {
                boxImage: '/images/progressbar.gif',
                barImage: '/images/progressbg_green.gif'
            });
            updateProgress();
            showProgress();
        });

        function showProgress() {
            $j("#total-progressbar").fadeIn();
            $j("#current-progressbar").fadeIn();

            i = setInterval(updateProgress, 1500);
        }

        function updateProgress() {
            eaeView.emit('update-progress', function(data) {
                if (data.totalTasks == data.currentTask && data.totalSize == data.currentSize) {
                    clearInterval(i);
                    $j("#total-progressbar").fadeOut();
                    $j("#current-progressbar").fadeOut();
                    $j("#in-progress-container").hide();
                    $j("#completed-container").show();
                }

                var majorTotal = parseInt(data.totalTasks);
                var majorCurrent = parseInt(data.currentTask);
                var minorTotal = parseInt(data.totalSize);
                var minorCurrent = parseInt(data.currentSize);
                var majorPercentage = majorTotal > 0 ? Math.floor(100 * majorCurrent / majorTotal) : 0;
                var minorPercentage = minorTotal > 0 ? Math.floor(100 * minorCurrent / minorTotal) : 0;

                $j("#total-progress-info").find(".current-count").html(majorCurrent);
                $j("#total-progress-info").find(".total-count").html(majorTotal);
                $j("#current-progress-info").find(".current-count").html(minorCurrent);
                $j("#current-progress-info").find(".total-count").html(minorTotal);

                $j("#total-progressbar").progressBar(majorPercentage, {
                    boxImage: '/images/progressbar.gif',
                    barImage: '/images/progressbg_green.gif'
                });
                $j("#current-progressbar").progressBar(minorPercentage, {
                    boxImage: '/images/progressbar.gif',
                    barImage: '/images/progressbg_green.gif'
                });

            });
        }
    };
});

