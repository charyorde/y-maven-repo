/*extern jive $j */

var saveSelectedRemoteAccordion = function(id) {
    // do nothing
};

function loadRemoteAccordions(paramsObject) {
    var idPrefix = paramsObject.remoteIdPrefix,
        preferredView = paramsObject.preferredRemoteView;
    $j('#status-updates-'+ idPrefix).accordion({
        active: '[id="'+ preferredView +'"] h4'
    }).bind('accordionchange', saveSelectedRemoteAccordion);
}
