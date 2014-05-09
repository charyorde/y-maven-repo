// loads widget content asynchronously via ajax.

jive.model.WidgetLoader = function() {

    var that = this;

    var widgetQueue = new Array();

    this.addWidget = function(widgetArgs) {
        widgetQueue.push(widgetArgs);
    };

    this.renderAll = function () {
        widgetQueue.each(function(widgetArgs) {
            $j('#jive-widgetframe-body_' + widgetArgs.frameID).load(widgetArgs.renderWidgetAction, {
                'frameID':widgetArgs.frameID,
                'size':widgetArgs.size,
                'widgetType':widgetArgs.widgetType,
                'container':widgetArgs.container,
                'containerType':widgetArgs.containerType
            }, function() {
                $j('#jive-widgetframe-loading_' + widgetArgs.frameID).hide();
                $j('#jive-widgetframe-body_' + widgetArgs.frameID).show();
                //span for the refresh link
                $j('#jive-widgetframe-refresh_' + widgetArgs.frameID).show();
                that.refreshLink(widgetArgs);
                // fire an event that this widget frame has loaded
                $j('#jive-widgetframe_' + widgetArgs.frameID).trigger('frameLoaded');
            });
        });
    };

    this.refreshLink = function (widgetArgs) {

        $j('#jive-widgetframe-refresh-link_' + widgetArgs.frameID).click(function() {
            $j('#jive-widgetframe-loading_' + widgetArgs.frameID).show();
            $j('#jive-widgetframe-body_' + widgetArgs.frameID).hide();
            that.refresh(widgetArgs);
        });
    };

    this.refresh = function (widgetArgs) {
        $j('#jive-widgetframe-body_' + widgetArgs.frameID).load(widgetArgs.renderWidgetAction, {
            'frameID':widgetArgs.frameID,
            'size': $j('#jive-widgetframe-body_' + widgetArgs.frameID).parent().hasClass('jive-widgetsize-large') ? 2 : 1,
            'widgetType':widgetArgs.widgetType,
            'container':widgetArgs.container,
            'containerType':widgetArgs.containerType
        }, function() {
            $j('#jive-widgetframe-loading_' + widgetArgs.frameID).hide();
            $j('#jive-widgetframe-body_' + widgetArgs.frameID).show();
            // fire an event that this widget frame has loaded
            $j('#jive-widgetframe_' + widgetArgs.frameID).trigger('frameLoaded');
        });
    };
};

var widgetLoader = new jive.model.WidgetLoader();

$j(function() {
    widgetLoader.renderAll();
});
