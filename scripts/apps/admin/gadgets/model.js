jive.namespace("GadgetSettings");

jive.GadgetSettings.GadgetSource = $Class.extend({
    init: function() {
        this.GADGET_ENDPOINT = jive.rest.admin.url("/gadgets/");
        this.options = function(method, url, successCallback) {
            return {
                type: method,
                url: this.GADGET_ENDPOINT + url,
                dataType:  "json",
                contentType: "application/json; charset=utf-8",
                success: successCallback
            };
        };
    },
    fetchAll: function(callback) {
        $j.ajax(this.options("GET", "fetch/0?" + Math.floor(Math.random() * 21), function(data) {
            callback(data.gadget);
        }));
    },
    toggleType: function(gadget, type, enabled, callback) {
        var endPath = enabled ? "/enable" : "/disable";
        $j.ajax(this.options("POST", gadget.id + "/" + type.id + endPath, function() {
            callback();
        }));
    },
    updateCategory: function(gadget, category, callback) {
        $j.ajax(this.options("POST", gadget.id + "/category/" + category.id, function() {
            callback();
        }));
    },
    remove: function(gadget, callback) {
        $j.ajax(this.options("POST", gadget.id + "/delete", function() {
            callback();
        }));
    }
});