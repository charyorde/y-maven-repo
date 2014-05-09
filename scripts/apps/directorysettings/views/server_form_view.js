jive.namespace('DirectorySettings');

/**
 * @class
 * @depends path=/resources/scripts/apps/directorysettings/views/abstract_directory_settings_form_view.js
 * @depends template=jive.admin.directory.settings.*
 */
jive.DirectorySettings.ServerFormView = jive.DirectorySettings.AbstractDirectorySettingsFormView.extend(function(protect) {

    protect.init = function(options) {

        var view = this;
        view.options = options || {};
        view.form = options.form || {};
        view.configured = options.configured || false;
        view.$form = $j('#jive-directory-server-settings-form');
        view.attachToolTipHandlers(view.$form);
        view.attachServerTypeHandler(view.$form);
        view.attachTestHandler(view.$form);
        view.attachSaveHandler(view.$form);
        view.attachResetHandler(view.$form);
    };

    protect.attachServerTypeHandler = function ($form) {
        var view = this;
        $form.find("#serverType, #sslEnabled").change(function (e) {
            var serverType = $j(this).val();
            if (serverType && serverType != '1') {
                view.emitP('getServerSettings', {
                    serverTypeID:$j("#serverType").val(),
                    sslEnabled:$j("#sslEnabled").is(":checked")}).addCallback(
                    function (config) {
                        view.$form.find("#port").val(config.port.val);
                        view.$form.find("#followReferrals").attr('checked', config.followReferrals.val);
                    });
            }
        });
    };

    protect.attachResetHandler = function ($form) {
        var view = this;
        $form.find("input[name='reset']").click(function (e) {
            if (view.configured) {
                if (confirm(jive.admin.directory.settings.resetConfirmMessage())){
                    view.emitP('resetConfigs').addCallback(
                        function () {
                            window.location.reload();
                        }
                    );
                }
            }
            else {
                window.location.reload();
            }
            e.preventDefault();
        });
    };

    protect.submitForm = function ($button) {
        var view = this;
        if (!$button.is(":disabled")) {
            view.showSpinner();
            view.gatherFormValues();
            view.disableSaveButton();
            view.disableTestButton();
            view.hideErrors();
            view.emitP('saveServerSettings', view.form).addCallback(
                function (status) {
                    if (status.valid) {
                        if (view.form.test){
                            view.enableSaveButton();
                        } else {
                            view.configured = true;
                        }
                        view.showResult(true, status);
                    }
                    else {
                        view.showResult(false, status);
                    }
                    view.hideStatus();
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

    protect.showStatus = function (status) {
        $j("#js-server-status-holder").html(jive.admin.directory.settings.serverStatus(status));
    };

    protect.showResult = function (success, status) {
        var view = this;
        if (success){
            if (!view.form.test){
                $j(".jive-body-tabbar").show();
            }
            $j("#js-result-message-holder").html(jive.admin.directory.settings.successMessage({test: view.form.test, status: status}));
        } else {
            $j("#js-result-message-holder").html(jive.admin.directory.settings.serverStatus(status));
        }
    };

});