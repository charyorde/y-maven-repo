/*globals $Class */
var WidgetBridges = $Class.extend({
    // object variables
    args: {},

    init: function(args) {
        this.args = args;
    },

   showRemoteWidgets: function(bridgeID) {
        $j('#jive-widgets-list-container').hide();
        $j('#jive-widget-local').removeClass('jive-body-tabcurrent active');
        $j.each(this.args.bridgeIDs, function(i, theBridgeID) {
            $j('#jive-widgets-list-container_' + theBridgeID).hide();
            $j('#jive-widget-bridge' + theBridgeID).removeClass('jive-body-tabcurrent active');
            $j('#jive-bridge-loading_' + theBridgeID).hide();
        });
        $j('#jive-widgets-list-container_' + bridgeID).show();
        $j('#jive-widget-bridge' + bridgeID).addClass('jive-body-tabcurrent active');
        this.loadRemoteWidgets(bridgeID);
    },



    bridgeLogin: function(bridgeID) {
        var self = this;

        $j('#jive-bridges-login').hide();
        $j('#jive-bridge-loading_' + bridgeID).show();

        $j.ajax({
            url: this.args.bridgeLoginAction,
            type: 'POST',
            data: $j('#bridge_login_' + bridgeID).serialize(),
            dataType: 'html',
            success: function(html) {
                $j('#jive-widgets-list-container_' + bridgeID).html(html);
                $j('#jive-bridge-loading_' + bridgeID).hide();
                // load up draggables
                self.makeDraggable($j('#jive-widgets-list-container_' + bridgeID + ' .jive-widget-new'));
            }
        });
    },

    loadRemoteWidgets: function(bridgeID) {
        var self = this;

        if ($j('#jive-widgets-list-container_' + bridgeID + ' .jive-widget-new').length > 0 ) {
            /* do nothing if the list of widgets is already present */
        } else {
            $j('#jive-bridge-loading_' + bridgeID).show();
            var pars = { 'bridge':bridgeID };
            $j('#jive-widgets-list-container_' + bridgeID).load(this.args.bridgeAction, pars, function() {
                $j('#jive-bridge-loading_' + bridgeID).hide();
                // load up draggables
                self.makeDraggable($j('#jive-widgets-list-container_' + bridgeID + ' .jive-widget-new'));
            });
        }
    },

    bridgeLogout: function(bridgeID) {
        $j('#jive-bridge-loading_' + bridgeID).show();
        var pars = { 'bridge':bridgeID };
        $j('#jive-widgets-list-container_' + bridgeID).load(this.args.bridgeLogoutAction, pars, function() {
            $j('#jive-bridge-loading_' + bridgeID).hide();
        });
    },

    showWidgetsTabLocal: function(index) {
        $j.each(this.args.bridgeIDs, function(i, theBridgeID) {
            $j('#jive-widgets-list-container_' + theBridgeID).hide();
            $j('#jive-widget-bridge' + theBridgeID).removeClass('jive-body-tabcurrent active');
            $j('#jive-bridge-loading_' + theBridgeID).hide();
        });

        $j('#jive-widgets-list-container div[id^=jive-categories-list-container-]').hide();
        $j('#jive-widgets-list-container div[id^=jive-widcat-list-container-]').hide();

        $j('#jive-widgets-list-container').show();
        $j("#jive-categories-list-container-" + index).show();
        $j("#jive-widcat-list-container-" + index).show();

        $j("#jive-widgets-browser span[id^=jive-widget-local-]").removeClass('jive-body-tabcurrent active');
        $j('#jive-widget-local-' + index).addClass('jive-body-tabcurrent active');

        var $container = $j('#jive-widgets-list-container');
        $container.find('.jive-category-instructions').show();
        $container.find('.jive-widget-instructions').fadeIn('fast');
        $container.find('.jive-widcat-widgets').hide();
        $container.find('.jive-widcat-widget').removeClass('selected');
        $container.find('.jive-widget-new-container').hide();
        $container.find('.jive-widget-category').removeClass('selected');
    },

    makeDraggable: function(draggables) {
        // load up draggables
        draggables.draggable({
            helper:'clone',
            connectToSortable:'.jive-widget-container',
            opacity: 0.7,
            revert: 'invalid',
            revertDuration: 200,
            zIndex: 8000,
            drag: function() {
                $j('.ui-draggable-dragging').addClass('jive-widget-new-dragging');
                $j('.ui-draggable-dragging .dragToAdd').hide();
                $j('.ui-draggable-dragging .widgetTitle').show();
            }
        });
    }
});
