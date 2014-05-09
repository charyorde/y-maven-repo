/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('DirectorySettings');

/**
 * @class
 * @depends path=/resources/scripts/apps/directorysettings/views/abstract_directory_settings_form_view.js
 */
jive.DirectorySettings.UserFormView = jive.DirectorySettings.AbstractDirectorySettingsFormView.extend(function(protect) {

    protect.init = function(options) {

        var view = this;
        view.options = options || {};
        view.form = options.form || {};
        view.$form = $j('#jive-directory-user-settings-form');
        view.attachToolTipHandlers(view.$form);
        view.attachTestHandler(view.$form);
        view.attachSaveHandler(view.$form);
    };

    protect.submitForm = function ($button) {
        var view = this;
        if (!$button.is(":disabled")) {
            view.showSpinner();
            view.gatherFormValues();
            view.disableSaveButton();
            view.disableTestButton();
            view.hideErrors();
            view.emitP('saveUserSettings', view.form).addCallback(
                function (status) {
                    view.hideResult();
                    if (status.valid) {
                        if (view.form.test){
                            if (status.results && status.results.length > 0){
                                view.showModal(status);
                                view.enableSaveButton();
                            } else {
                                view.showNoResultsMessage();
                            }
                        } else {
                            view.showResult(true);
                            view.showSyncSettingsTab();
                        }
                    }
                    else {
                        view.showResult(false, status);
                    }
                }).addErrback(function (form) {
                    view.displayErrors(form);
                    view.displayProfileErrors(form);
                    view.hideResult();
                }).always(function () {
                    view.hideSpinner();
                    view.enableTestButton();
                });
        }
    };

    protect.displayProfileErrors = function (validatedForm) {
        var view = this;
        $j.each(validatedForm.profileFields, function (i, field) {
            if (field.errors && field.errors.length) {
                view.showErrors("profile-" + field.id, field);
            }
        });
    };

    protect.showNoResultsMessage = function (status) {
        $j("#js-result-message-holder").html(jive.admin.directory.settings.noResultsMessage({}));
    };

    protect.showResult = function (success, status) {
        var view = this;
        if (success){
            $j("#js-result-message-holder").html(jive.admin.directory.settings.successMessage({test: false, status: status}));
        } else {
            $j("#js-result-message-holder").html(jive.admin.directory.settings.userFailureMessage(status));
        }
    };

    protect.showModal = function(status){
        $j(jive.admin.directory.settings.userTestModal(status)).lightbox_me({})
    };

    protect.showSyncSettingsTab = function(){
        $j("#j-group-settings-tab").show();
        $j("#j-sync-settings-tab").show();
    }

});