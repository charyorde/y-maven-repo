/*jslint browser:true */
/*extern jive $j UserStatusAction accordion */

jive.model.YourStatusUpdatesAccordion = function(idPrefix, preferredView) {
    var that = this;

    $j('.jive-widget-yourstatusupdateswidget').one('frameLoaded', function() {
        that.loadAccordions();
    });

    this.saveSelectedAccordion = function(event, ui) {
        UserStatusAction.setPreferredView(ui.newHeader.closest('.ui-state-active').attr('id'), idPrefix);
    };

    this.loadAccordions = function() {
        $j('#status-updates-' + idPrefix).accordion({
            active: '#' + preferredView
        }).bind('accordionchange', this.saveSelectedAccordion);
        $j('#status-updates-' + idPrefix).find(".jive-accordion-content").height(470);
    };

    $j(function() {
        that.loadAccordions();
    });
};
