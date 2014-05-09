/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace("admin.conversion.settings");

/**
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends template=jive.admin.conversion.settings.*
 */
jive.admin.conversion.settings.View = jive.oo.Class.extend(function(protect) {
    jive.conc.observable(this);

    this.init = function(options) {
        var view = this;

        $j(document).ready(function() {
            
            $j('input[name="fullTest"]').click(function(event) {
                view.emit('fullTest',  $j(this));
                event.preventDefault();
            });

            $j('#jive-conversion-add-node').click(function(event) {
                var index = view.addHost();
                
                $j('#jive-conversion-processing-node-office-test-button-' + index).click(function() {
                    view.emit('testOfficeToPDF', $j(this));
                });
                $j('#jive-conversion-processing-node-pdf2swf-test-button-' + index).click(function() {
                    view.emit('testPdfToSwf', $j(this));
                });
                $j('#service-stats-' + index).click(function(event) {
                    var $container = $j(this).closest('.node-fieldset').find('.host-services');
                    $container.toggle();
                    if ($container.is(":visible")) {
                        view.emit('serviceStats', $j(this));
                    }

                    event.preventDefault();
                });

                event.preventDefault();
            });

            $j('#admin-conversion-settings-form input:submit').click(function(event) {
                event.preventDefault();
                var settings = view.serializeSettings();
                view.emit('settingsSaved', settings);
                $j(this).prop('disabled', true);
            });


            $j.each(options.hosts, function() {
                var index = view.addHost();
                $j('#jive-conversion-processing-node-host-' + index).val(this);
                $j('#jive-conversion-processing-node-office-test-button-' + index).click(function() {
                    view.emit('testOfficeToPDF', $j(this));
                });
                $j('#jive-conversion-processing-node-pdf2swf-test-button-' + index).click(function() {
                    view.emit('testPdfToSwf', $j(this));
                });
                $j('#service-stats-' + index).click(function(event) {
                    var $container = $j(this).closest('.node-fieldset').find('.host-services');
                    $container.toggle();
                    if ($container.is(":visible")) {
                        view.emit('serviceStats', $j(this));
                    }

                    event.preventDefault();
                });    

            });
        });
    };

    protect.addHost = function addHost() {
        var index = $j('#node-list').children().length;
        $j('#node-list').append($j(jive.admin.conversion.settings.hostBlock({index: index})));
        $j('#remove-host-' + index).click(function(event) {
            $j('#host-' + index).remove();
            event.preventDefault();
        });
       
        return index;
    };

    protect.serializeSettings = function serializeSettings() {
        var obj = {};
        $j.each($j('#admin-conversion-settings-form').serializeArray(), function() {
            obj[this.name] = this.value;
        });

        obj.disabledExtensions = (obj.disabledExtensions || '').split(',');
        obj.processingNodes    = $j.isArray(obj.processingNodes) ? obj.processingNodes : [obj.processingNodes];


        return obj;
    };

    this.saveSuccess = function saveSuccess(isEnabled) {
        $j('.jive-success-box').animate({opacity: 'toggle'}, 'slow', 'linear',
                setTimeout(function() {
                    $j('.jive-success-box').animate({opacity: 'toggle'}, 'slow', 'linear', function() {
                        $j('#admin-conversion-settings-form input:submit').prop('disabled', false);
                    });
                }, 8000));

        if (!isEnabled) {
            $j('.jive-warn-box').show();
        } else {
            $j('.jive-warn-box').hide();            
        }
    };

    this.displayStats = function displayStats(statsObj, $hostContainer) {
        var $nodeContainer = $hostContainer.find('.jive-conversion-processing-node-status');
        $nodeContainer.empty().append(protect.objectToList(statsObj));
    };

    this.displayTestResults = function displayTestResults(data) {
        var $codeBlock = $j('input[name="fullTest"]').next();
        if (data.error) {
            $codeBlock.empty().append("Error: " + data.errorMessage);
        } else if (!data.error && !data.converting) {
            $codeBlock.empty().append("Success!");
        }
    };

    protect.objectToList = function objectToList(obj){
        var str = "<ul class=\"status-list\">";
        $j.each(obj, function(i, val){
            str += "<li>" + i;
            if (typeof val == "object"){
                str += protect.objectToList(val);
            } else {
                str += ":" + val;
            }
            str += "</li>";
        });
        str += "</ul>";

        return str;
    }
});
