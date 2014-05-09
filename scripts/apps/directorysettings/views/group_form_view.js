jive.namespace('DirectorySettings');

/**
 * @class
 * @depends path=/resources/scripts/apps/directorysettings/views/abstract_directory_settings_form_view.js
 */
jive.DirectorySettings.GroupFormView = jive.DirectorySettings.AbstractDirectorySettingsFormView.extend(function(protect) {

    protect.init = function(options) {

        var view = this;
        view.options = options || {};
        view.form = options.form || {};
        view.$form = $j('#jive-directory-group-settings-form');
        view.attachToolTipHandlers(view.$form);
        view.attachTestHandler(view.$form);
        view.attachSaveHandler(view.$form);
        view.attachChoiceHandler(view.$form);
    };

    protect.submitForm = function ($button) {
        var view = this;
        if (!$button.is(":disabled")) {
            view.showSpinner();
            view.gatherFormValues();
            view.disableSaveButton();
            view.disableTestButton();
            view.hideErrors();
            view.emitP('saveGroupSettings', view.form).addCallback(
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
                        }
                    }
                    else {
                        view.showResult(false, status);
                    }
                }).addErrback(function (form) {
                    view.displayErrors(form);
                    view.hideStatus();
                    view.hideResult();
                }).always(function () {
                    view.hideSpinner();
                    view.enableTestButton();
                });
        }
    };

    protect.attachChoiceHandler = function($form){
        var view = this;
        $form.find("input[name='useLDAPGroups']").click(function(){
            view.form.useLDAPGroups.val = $j(this).val();
            if (view.form.useLDAPGroups.val == 'true'){
                $form.find(".js-field").removeAttr("disabled");
                view.enableTestButton();
                view.disableSaveButton();
            } else {
                $form.find(".js-field").attr("disabled", "disabled");
                view.disableTestButton();
                view.enableSaveButton();
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
        $j(jive.admin.directory.settings.groupTestModal(status)).lightbox_me({})
    };

});