/*jslint browser:true */
/*extern $j jive */
/*extern AvailablePlugins */

jive.namespace('admin');

jive.admin.AvailablePlugins = function() {

    /* private methods */

    function pluginsListUpdated(){
        window.location.href = "available-plugins.jspa";
    }

    function handleError(errorMessage, plugin, id) {
        var $element          = $j('#' + id),
            $progress         = $j('#' + id + '-percent'),
            $workingIndicator = $j('#' + id + '-working'),
            $errorMsg         = $j('#' + id + '-error');
        $progress.hide();
        $workingIndicator.hide();
        $element.css('background', '#f99');
        $errorMsg.css('background', '#f99');
        $element.removeClass('line-bottom-border');
        $errorMsg.parent().show();
        $errorMsg.click(function(event) {
            AvailablePlugins.removeInstallTask(plugin, {
                callback:function() {
                    $errorMsg.fadeOut();
                    $element.fadeOut(pluginsListUpdated);
                },
                errorHandler:function(errorMessage, ex) {
                    alert(errorMessage);
                }
            });
        });
    }

    // Handles acquiring the status of the plugin download
    function handlePollable(pollable, plugin, id) {
        if (pollable && !pollable.finished) {
            $j('#' + id + "-image").hide();
            $j('#' + id + "-percent").text(pollable.percentComplete +'%').show();
            $j('#' + id).css('background', '#FFFFCC');
            $j('#' + id+ '-working').show();

            window.setTimeout(function() {
                AvailablePlugins.getInstallTask(plugin, {
                    callback:function(result) {
                        handlePollable(result, plugin, id);
                    },
                    errorHandler:function(errorMessage) {
                        handleError(errorMessage, plugin, id);
                    }
                });
            }, 500);
        }
        else if (pollable && pollable.finished && pollable.success){
            $j('#' + id).hide();
            $j('#' + id + "-row").show();
            window.setTimeout(function() {
                $j('#' + id + "-row").fadeOut(pluginsListUpdated);
            }, 3000);
        }
        else if (pollable && pollable.finished) {
            // for some reason sometimes i need to handle this manually too
            // the exception handler doesn't catch, happens every few dozen hits.
            handleError(pollable.failures[0].message);
        }
    }

    /* public methods */

    function getStatus(plugin, id) {
        AvailablePlugins.getInstallTask(plugin, {
            callback:function(pollable) {
                handlePollable(pollable, plugin, id);
            },
            errorHandler:function(errorMessage) {
                handleError(errorMessage, plugin, id);
            }
        });
    }

    function downloadPlugin(url, id, plugin) {
        AvailablePlugins.installPlugin(plugin, url, {
            callback:function(pollable) {
                handlePollable(pollable, plugin, id);
            },
            errorHandler:function(errorMessage) {
                handleError(errorMessage, plugin, id);
            }
        });
    }

    function updatePluginsList(){
        $j('#reloaderID').html('<img src="images/working-16x16.gif" border="0"/>');
        AvailablePlugins.updatePluginsList(pluginsListUpdated);
        return false;
    }

    function updatePluginsListNow(){
        $j('#reloader2').html('<img src="images/working-16x16.gif" border="0"/>');
        AvailablePlugins.updatePluginsList(pluginsListUpdated);
        return false;
    }

    /* public interface */

    this.getStatus            = getStatus;
    this.downloadPlugin       = downloadPlugin;
    this.updatePluginsList    = updatePluginsList;
    this.updatePluginsListNow = updatePluginsListNow;

};
