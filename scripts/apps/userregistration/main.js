/**
 * jive.UserRelationshipList.Main
 *
 * Main class for controlling interactions during new user registration.
 *
 * @depends path=/resources/scripts/apps/userregistration/views/password_strength_view.js
 * @depends path=/resources/scripts/apps/userregistration/views/user_registration_form_view.js
 * @depends path=/resources/scripts/apps/userregistration/models/user_registration_source.js
 * @depends path=/resources/scripts/apps/authentication/models/authentication_source.js
 */

jive.namespace('UserRegistration');

jive.UserRegistration.Main = jive.oo.Class.extend(function(protect) {

	this.init = function(options) {

        var main = this;
        main.options = options || {};
        this.requiredFieldsOnly = (options.form && options.form.requiredOnly) || options.requiredFieldsOnly || true;

        this.userRegSource = options.userRegSource || new jive.UserRegistration.Source(options);
        this.userRegSource.suppressGenericErrorMessages();

        this.authenticationSource = options.authenticationSource || new jive.Authentication.Source();

        this.userRegFormView = new jive.UserRegistration.RegistrationFormView(options);

        this.userRegFormView.addListener('register', function(promise) {
            main.userRegSource.getForm(main.requiredFieldsOnly).addCallback(
                function(form) {
                    promise.emitSuccess(form);
                }
            ).addErrback(function() {
                    main.userRegSource.showGenericFindError();
                });
        });

        this.userRegFormView.addListener('validate', function(field, promise) {
            main.userRegSource.validate(field).addCallback(
                function(form) {
                    promise.emitSuccess(form);
                }
            ).addErrback(function(message, status, field) {
                    if (status != 400) {
                        main.userRegSource.showGenericSaveError();
                    }
                    promise.emitError(field);
                });
        });

        this.userRegFormView.addListener('passwordstrength', function(text, promise) {
            main.userRegSource.checkPasswordStrength(text).addCallback(
                function(strength) {
                    promise.emitSuccess(strength);
                }
            ).addErrback(function() {
                    main.userRegSource.showGenericSaveError();
                    promise.emitError();
                });
        });

        this.userRegFormView.addListener('submit', function(form, promise) {
            main.userRegSource.saveForm(form).addCallback(function(form) {
                    promise.emitSuccess(form);
                }
            ).addErrback(function(message, status, form) {
                if (status != 400) {
                    main.userRegSource.showGenericSaveError();
                }
                promise.emitError(form);
            });
        });

        this.userRegFormView.addListener('login', function(credentials, promise) {
            main.authenticationSource.login(credentials)
                .addCallback(function() {
                    promise.emitSuccess();
                });
        });

    };


});