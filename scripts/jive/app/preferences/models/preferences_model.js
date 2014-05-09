/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

define('jive.JAF.Preferences.Model', ['jquery'], function($j) {
return jive.oo.Class.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    protect.init = function() {
        this.GADGET_ENDPOINT = jive.rest.url("/app");
        this.options = function(method, url, data, successCallback) {
            if (data) {
                url = url + "?" + $j.param(data);
            }
            return {
                type: method,
                url: this.GADGET_ENDPOINT + url,
                dataType:  "json",
                contentType: "application/json; charset=utf-8",
                success: successCallback
            };
        };
    };

    this.setPref = function(id, prefName, prefValue) {
        var self = this;
        var data = {"n": prefName, "v": prefValue};
        $j.ajax(this.options("PUT", "/" + id + "/prefs", data, function(data) {
            self.emit("app.preferences.set", data );
        }));
    };

    this.getPreferences=  function(id) {
        var self = this;
        $j.ajax(this.options("GET", "/" + id + "/prefs/", null, function(data) {
            self.emit("app.preferences.get", data.pref );
        }));
    };

    this.setPreferences = function($form) {
        var self = this;
        $form.ajaxSubmit({
            url: this.GADGET_ENDPOINT + "/setprefs/",
            type: "POST",
            dataType:  "json",
            success: function(data) {
                self.emit("app.preferences.set.all", data.dashboardAppSrc );
            }
        });
    };

    this.cancelEdit = function(id) {
        var self = this;
        $j.ajax(this.options("GET", "/" + id, null, function(data) {
            self.emit("app.preferences.cancel.edit", data );
        }));
    };

    this.getPreferencesView =  function(id) {
        var self = this;
        $j.ajax(this.options("GET", "/" + id + "/prefs/view", null, function(data) {
            self.emit("app.preferences.get.pref.view", data.appPrefView );
        }));
    };

});
});