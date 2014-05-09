/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace("UserPrefs.Mobile");

jive.UserPrefs.Mobile.GenerateForm = jive.AbstractView.extend(function(protect) {

    protect.init = function(form) {
        var view = this;
        this.content = $j(form);
        this.content.bind("submit", function(event) {
            event.preventDefault();
            view.showSpinner();
            view.emit("create", view.getNewPairing());
        });
    };

    protect.getNewPairing = function() {
        return {
            displayName : this.content.find("[name=js-mob-device-name]").val(),
            tempPassCodeEncoded : this.content.find("[name=js-mob-device-passcode]").val(),
            tempPassCodeEncodedRepeat : this.content.find("[name=js-mob-device-passcode-repeat]").val(),
            passCodeEnabled : this.content.find("[name=js-mob-device-passcode-enabled]").val(),
            passCodeMinLength : this.content.find("[name=js-mob-device-passcode-minlength]").val(),
            subType : {
                id : "other" // constant, until we allow users the option to choose one
            }
        };
    };

    this.resetForm = function() {
        this.hideSpinner();
        this.content.find("[name=js-mob-device-name]").val("");
        this.content.find("[name=js-mob-device-passcode]").val("");
        this.content.find("[name=js-mob-device-passcode-repeat]").val("");
    };

    this.handleError = function(errors) {
        this.hideSpinner();
        if (errors && errors.length) {
            for (var i = 0, l = errors.length; i < l; ++i) {
                var err = errors[i];
                if (err.code && err.message) {
                    var msg = jive.preferences.mobile.renderError(err);
                    if (msg) {
                        $j("<p/>").html(msg).message({"style":"error"});
                    }
                }
            }
        }
    };

    this.showForm = function() {
        this.hideSpinner();
        this.content.parents(".j-contained").show();
    }
});
