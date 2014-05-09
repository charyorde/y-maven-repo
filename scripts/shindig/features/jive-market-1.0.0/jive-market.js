/* jive-market.js */

jive.namespace('market', {

    getSbsContext: function(callback) {
        gadgets.rpc.call(null, "get_sbs_context", callback, null);
    },

    getDashboardInfo: function(callback) {
        gadgets.rpc.call(null, "getDashboardInfo", callback, null);
    },

    fireEvents: function(callback, marketEvents) {
        if (marketEvents && marketEvents.events && marketEvents.events.length) {
            gadgets.rpc.call(null, "fire_market_events", callback, marketEvents);
        }
    },

    getApiDescriptor: function() {
        return {};
    }
});
