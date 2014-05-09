/**
 * jive.DirectorySettings.Main
 *
 * Main class for controlling interactions when configuring the directory integration.
 *
 * @depends path=/resources/scripts/apps/directorysettings/views/server_form_view.js
 * @depends path=/resources/scripts/apps/directorysettings/views/user_form_view.js
 * @depends path=/resources/scripts/apps/directorysettings/views/group_form_view.js
 * @depends path=/resources/scripts/apps/directorysettings/models/directory_settings_source.js
 */

jive.namespace('DirectorySettings');

jive.DirectorySettings.Main = jive.oo.Class.extend(function(protect) {

    this.init = function(options) {

        var main = this;
        main.options = options || {};

        this.directorySettingsSource = options.source || new jive.DirectorySettings.Source(options);
        this.directorySettingsSource.suppressGenericErrorMessages();

        this.directoryServerSettingsView = new jive.DirectorySettings.ServerFormView(options);

        this.directoryServerSettingsView.addListener('getServerSettings', function(params, promise) {
            main.directorySettingsSource.getServerConfig(params).addCallback(
                function(form) {
                    promise.emitSuccess(form);
                }
            );
        });

        this.directoryServerSettingsView.addListener('saveServerSettings', function(form, promise) {
            main.directorySettingsSource.saveServerConfig(form).addCallback(
                function(form) {
                    promise.emitSuccess(form);
                }
            ).addErrback(function(message, status, form) {
                    if (status != 400) {
                        main.directorySettingsSource.showGenericSaveError();
                    }
                    promise.emitError(form);
                });
        });

        this.directoryServerSettingsView.addListener('resetConfigs', function (promise) {
            main.directorySettingsSource.resetConfigs().addCallback(
                function () {
                    promise.emitSuccess();
                }
            ).addErrback(function (message, status, form) {
                    main.directorySettingsSource.showGenericSaveError();
                });
        });

        this.directoryUserSettingsView = new jive.DirectorySettings.UserFormView(options);

        this.directoryUserSettingsView.addListener('getUserSettings', function(params, promise) {
            main.directorySettingsSource.getUserConfig(params).addCallback(
                function(form) {
                    promise.emitSuccess(form);
                }
            );
        });

        this.directoryUserSettingsView.addListener('saveUserSettings', function(form, promise) {
            main.directorySettingsSource.saveUserConfig(form).addCallback(
                function(form) {
                    promise.emitSuccess(form);
                }
            ).addErrback(function(message, status, form) {
                    if (status != 400) {
                        main.directorySettingsSource.showGenericSaveError();
                    }
                    promise.emitError(form);
                });
        });


        this.directoryGroupSettingsView = new jive.DirectorySettings.GroupFormView(options);

        this.directoryGroupSettingsView.addListener('getGroupSettings', function(params, promise) {
            main.directorySettingsSource.getGroupConfig(params).addCallback(
                function(form) {
                    promise.emitSuccess(form);
                }
            );
        });

        this.directoryGroupSettingsView.addListener('saveGroupSettings', function(form, promise) {
            main.directorySettingsSource.saveGroupConfig(form).addCallback(
                function(form) {
                    promise.emitSuccess(form);
                }
            ).addErrback(function(message, status, form) {
                    if (status != 400) {
                        main.directorySettingsSource.showGenericSaveError();
                    }
                    promise.emitError(form);
                });
        });
    };


});