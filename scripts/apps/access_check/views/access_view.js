/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('AccessCheckApp');

jive.AccessCheckApp.AccessCheckView = jive.oo.Class.extend(function(protect) {

    // Mixes in `addListener` and `emit` methods so that other classes can
    // listen to events from this one.
    jive.conc.observable(this);

    this.init = function(options) {
        var view = this;
        this.i18n       = options.i18n;
        this.options    = options;
        this.userAutocompleteID = "#jive-access-autocomplete";
        this.accessResultsID = "#jive-access-results";

        this.submitAccessCheck = function(data) {
            if (data.users.length == 0) {
                $j(view.accessResultsID).html("");
            } else {                         
                var spinner = new jive.loader.LoaderView({size:'small', showLabel: false});
                spinner.appendTo(view.accessResultsID);

                view.emitP('checkAccess', view.options.objectType, view.options.objectID, data.users[0].id).addCallback(function(data) {
                    if (data === true) {
                        $j(view.accessResultsID).html('<p>' + view.i18n.hasAccess + '</p><p class="font-color-meta-light">' + view.i18n.warning + '</p');
                    } else {
                        $j(view.accessResultsID).html('<p>' + view.i18n.noAccess + '</p><p class="font-color-meta-light">' + view.i18n.warning + '</p>');
                    }
                    spinner.destroy();
                    spinner = null;
                })
                .addErrback(function() {
                    $j(view.accessResultsID).html(view.i18n.error)
                    spinner.destroy();
                    spinner = null;
                });
            }
        };

        $j(document).ready(function() {
            var autocomplete = new jive.UserPicker.Main({
                $input : $j(view.userAutocompleteID)
            });
            autocomplete.addListener('selectedUsersChanged', view.submitAccessCheck);
        });
    };
});
