jive.namespace('Authentication');

/**
 * @class
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.authentication.loginModal
 */
jive.Authentication.LoginModalView = jive.AbstractView.extend(function(protect) {

    protect.init = function(options) {

        var view = this;
        view.options = options || {};

        $j(function() {
            var $loginLink = $j("#navLogin, #jive-guest-link-auth");
            $loginLink.click(function(e) {
                view.renderForm();
                e.preventDefault();
            });
        });
    };

    protect.renderForm = function() {
        var view = this;
        var $renderedForm = $j(jive.authentication.loginModal({
            rememberMe: view.options.rememberMe,
            passwordReset: view.options.passwordReset,
            forgotUsername: view.options.forgotUsername,
            captchaField: view.options.captchaField,
            usernameIsEmail: view.options.usernameIsEmail
        }));
        view.$lb = $renderedForm.lightbox_me({
            destroyOnClose:true,
            onLoad: function() {
                view.$usernameField = $renderedForm.find('input[name="username"]');
                view.$passwordField = $renderedForm.find('input[name="password"]');
                view.$rememberMeField = $renderedForm.find('input[name="autoLogin"]');
                view.$captchaField = $renderedForm.find('#captchaInput');
                view.$submitButton = $renderedForm.find('input[name="submit"]');
                view.attachBlurHandlers($renderedForm);
                view.attachSaveHandler($renderedForm);
                view.focusOnFirstInput($renderedForm);
            }
        });
    };

    protect.focusOnFirstInput = function($form) {
        $form.find(':input:first').focus();
    };

    protect.attachBlurHandlers = function($form) {
        var view = this;
        $form.find("input.field").keyup(function(e) {
            view.checkRequiredFields();
            e.preventDefault();
        });
    };

    protect.attachSaveHandler = function($form) {
        var view = this;
        $form.submit(function(e) {
            view.submitForm($j(this));
            e.preventDefault();
        });
    };

    protect.checkRequiredFields = function(){
        var view = this;
        if (view.$usernameField.val() == '' || view.$passwordField.val() == ''){
            view.$submitButton.attr('disabled', 'disabled');
        } else {
            view.$submitButton.removeAttr('disabled');
        }
    };

    protect.submitForm = function($button) {
        var view = this;
        if ($button.attr('disabled') != 'disabled') {
            $button.val($button.data('submit-text'));
            $button.attr('disabled', 'disabled');
            view.showSpinner();
            var credentials = {username: view.$usernameField.val(), password: view.$passwordField.val()};
            if (view.$captchaField.length) {
                credentials = $j.extend(credentials, {captcha: view.$captchaField.val()});
            }
            if (view.$rememberMeField.length){
                credentials = $j.extend(credentials, {rememberMe: view.$rememberMeField.is(":checked")});
            }
            view.emitP('login', credentials).addCallback(
                function() {
                    view.handleLogin();
                }).always(function() {
                    view.hideSpinner();
                });
        }
    };

    protect.handleLogin = function() {
        if (this.$lb){
            this.$lb.trigger('close');   //close the modal
        }
    };

});