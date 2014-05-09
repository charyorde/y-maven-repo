jive.namespace('UserRegistration');

/**
 * @class
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/apps/userregistration/detect_timezone.js
 * @depends template=jive.user.registration.modal
 * @depends template=jive.user.registration.errors
 * @depends template=jive.user.registration.localizedFieldError
 * @depends template=jive.user.registration.accountPendingApproval
 * @depends template=jive.user.registration.drawCaptcha
 * @depends template=jive.user.registration.passwordMatchErrorMessage
 */
jive.UserRegistration.RegistrationFormView = jive.AbstractView.extend(function(protect) {

    protect.init = function(options) {

        var view = this;
        view.options = options || {};
        view.inlineValidationFields = ['username', 'email', 'name', 'firstname', 'lastname','password'];
        view.passwordStrengthView = new jive.UserRegistration.PasswordStrengthView(options);

        this.passwordStrengthView.addListener('passwordstrength', function(text, promise) {
            view.emitP('passwordstrength', text).addCallback(function(strength) {
                promise.emitSuccess(strength);
            })
        });

        if (options.form) {
            view.form = options.form;
        }

        $j(function() {
            //if we have a form on init, attach handlers, etc
            if (options.page && options.form) {
                view.initPageForm();
            }
            else {
                //else handle dynamic form modal
                var $regLink = $j("#jive-nav-link-reg, #jive-guest-link-reg");
                $regLink.click(function(e) {
                    view.initModalForm();
                    e.preventDefault();
                });
            }
        });
    };

    protect.initPageForm = function() {
        var view = this;
        var $form = $j('#jive-user-registration-form');
        view.setupForm($form);
        view.passwordStrengthView.initView();
        view.focusOnFirstInput($form);
    };

    protect.initModalForm = function() {
        var view = this;
        if (!view.form) {
            view.showSpinner();
            view.emitP('register').addCallback(
                function(form) {
                    view.form = form;
                    view.renderForm();
                    view.passwordStrengthView.initView();
                }).always(function() {
                    view.hideSpinner()
                });
        }
        else {
            view.renderForm();
        }
    };

    protect.renderForm = function() {
        var view = this;
        var $renderedForm = $j(jive.user.registration.modal(view.form));
        view.setupForm($renderedForm);
        $renderedForm.lightbox_me({
            destroyOnClose:true,
            closeClick: false,
            onLoad: function(){
                view.focusOnFirstInput($renderedForm);
            }
        });
    };

    protect.focusOnFirstInput = function($form){
        $form.find(':input:first').focus();
    };

    protect.setupForm = function($form) {
        var view = this;
        view.attachInlineValidationHandlers($form);
        view.attachTermsHandler($form);
        view.attachSaveHandler($form);
        view.attachCancelHandler($form);
        view.determineTimeZone(view.form);
        view.decorateFields($form);
        view.attachUsernameCaptchaHandler($form);
    };

    protect.attachUsernameCaptchaHandler = function($form) {
        $form.find(".field[name='username']").change(
            function() {
                protect.updateRegistrationCaptcha($form)
            }
        );
    };

    protect.attachInlineValidationHandlers = function($form) {
        var view = this;
        $j(view.inlineValidationFields).each(function(i, fieldName) {
            $form.find(".field[name='" + fieldName + "']").blur(
                function() {
                    view.validateSingleField($j(this), fieldName);
                });
        });
        $form.find(".field[name='passwordconfirm']").blur(
            function() {
                var passVal = view.findViewFieldByName('password').val();
                view.confirmPassword(passVal, $j(this));
            });
    };

    protect.attachTermsHandler = function($form) {
        var view = this;
        $form.find("#js-reg-terms-link").click(function(e) {
            window.open($j(this).attr("href"), "jive_terms_and_conditions");
            e.preventDefault();
        });
    };

    protect.attachSaveHandler = function($form) {
        var view = this;
        $form.find("input[name='save']").click(function(e) {
            view.submitForm($j(this));
            e.preventDefault();
        });
    };

    protect.attachCancelHandler = function($form) {
        var view = this;
        if (view.options.page) {
            $form.find("input[name='cancel']").click(function(e) {
                window.history.back();
                e.preventDefault();
            });
        }
    };

    protect.determineTimeZone = function(form) {
        //try to determine the user's timezone
        var timezone = jstz.determine_timezone().timezone;
        if (timezone) {
            form.timeZoneID = timezone.olson_tz;
        }
    };

    protect.decorateFields = function($form) {
        var $urlFields = $form.find("input[data-field-type='url']");
        $urlFields.attr('placeholder','http://');
        if ($urlFields.placeHeld){
            $urlFields.placeHeld();
        }
    };

    protect.submitForm = function($button) {
        var view = this;
        if ($button.attr('disabled') != 'disabled'){
            $button.attr('disabled', 'disabled');
            view.showSpinner();
            view.gatherFormValues();
            view.hideGeneralErrors();
            view.emitP('submit', view.form).addCallback(
                function(validForm) {
                    if (validForm.moderated) {
                        view.displayModerationMessage();
                    }
                    else {
                        view.attemptLogin(validForm)
                    }
                }).addErrback(function(validatedForm) {
                    $j(validatedForm.fields).each(function(i, field) {
                        var $field = view.findViewFieldByName(field.name);
                        view.updateFieldValue(field, $field);
                        view.showFieldErrors(field, $field);
                    });
                    view.updateRegistrationCaptcha($j(view.form));
                }).always(function(){
                    view.hideSpinner();
                    $button.removeAttr('disabled');
                });
        }
    };

    protect.updateRegistrationCaptcha = function($form){
        var captcha = $form.find(".field[name='humanvalidation']");
        if (captcha.length > 0){
            var username = $form.find(".field[name='username']").val();
            var $captchaWrapper = $j("#js-captcha");
            var $img = $captchaWrapper.find("img");
            var url = $j.deparam.querystring($img.attr('src'));
            url.username = username;
            $img.attr('src', $j.param.querystring($img.attr('src'), url));
        }
    };

    protect.attemptLogin = function(validForm){
        var view = this;
        //if we're successful, reload the page to pick up the changed authentication
        var username = validForm.usernameIsEmail ? view.findModelFieldByName('email').val : view.findModelFieldByName('username').val;
        var credentials = {username: username, password: view.findModelFieldByName('password').val};
        if (validForm.loginCaptcha) {
            credentials = $j.extend(credentials, {captcha: validForm.loginCaptcha});
        }
        view.showSpinner();
        view.emitP('login', credentials).addCallback(function() {
            view.handleLogin();
        }).addErrback(function(){
            //TODO: manage login errors?
            view.handleLogin();
        }).always(function(){
            view.hideSpinner();
        });
    };

    protect.handleLogin = function() {
        var view = this;
        if (!view.options.page) {
            view.emit('close');   //close the lightbox
        }
    };

    protect.displayModerationMessage = function() {
        var view = this;
        var $target = (view.options.page) ?
            $j('#jive-register-formblock') :
            $j('#jive-user-registration-form-modal').find('.jive-modal-content');
        $target.html(jive.user.registration.accountPendingApproval());
    };

    protect.gatherFormValues = function() {
        var view = this;
        var $fields = $j('#jive-user-registration-form .field');
        $fields.each(function(i, field) {
            var $field = $j(field);
            var modelField = view.findModelFieldByName($field.data("field-name"));
            if (modelField) {
                modelField.val = view.getValFromField(modelField.type, $field);
            }
            else {
                console.warn("No corresponding field in model found for field " + field.name);
            }
        });
    };

    protect.getValFromField = function(type, $field) {
        var view = this;
        try {
            if (type == 'address') {
                return view.getAddressValue($field);
            } else if (type == 'boolean') {
                return view.getBooleanValue($field);
            } else if (type == 'date') {
                return view.getDateValue($field);
            } else if (view.isCheckbox($field)) {
                return view.getCheckboxValue($field);
            } else {
                return $j.trim($field.val());
            }
        }
        catch (e) {
            console.log(e);
        }
        return null;
    };


    protect.getAddressValue = function($field) {
        return {
            'street1': $field.find('input.street1').val(),
            'street2': $field.find('input.street2').val(),
            'city': $field.find('input.city').val(),
            'state': $field.find('input.state').val(),
            'zip': $field.find('input.zip').val(),
            'country': $field.find('input.country').val()
        }
    };

    protect.getDateValue = function($field) {
        return $field.find('input').val();
    };

    protect.getBooleanValue = function($field) {
        return $field.find('input').val();
    };

    protect.isCheckbox = function($field) {
        return $field.attr('type') == 'checkbox';
    };

    protect.getCheckboxValue = function($field) {
        return $field.is(':checked');
    };

    protect.showFieldErrors = function(field, $field) {
        var view = this;
        if ($field && $field.length > 0) {
            view.hideFieldErrors(field);
            if (field.errors.length > 0) {
                var renderedErrors = jive.user.registration.errors(field);
                var $errorsContainer = $j('.j-form-field-errors[data-field-name="' + field.name + '"]');
                if ($errorsContainer.length == 1) {
                    $errorsContainer.html(renderedErrors);
                    $errorsContainer.fadeIn('fast');
                }
                else {
                    console.error('No valid error container found for field name ' + field.name);
                }
            }
        }
        else {
            view.addGeneralError(field);
        }
    };

    protect.addGeneralError = function(field){
        $j('#j-form-errors').closest(".jive-error-box").show();
        $j(field.errors).each(function(i, err){
            $j('#j-form-errors').append("<li>" + jive.user.registration.localizedFieldError(err) + "</li>");
        });
    };

    protect.hideGeneralErrors = function(){
        $j('#j-form-errors').closest(".jive-error-box").hide();
        $j('#j-form-errors').children().remove();
    };

    protect.hideFieldErrors = function(field) {
        $j('.j-form-field-errors[data-field-name="' + field.name + '"]').fadeOut('fast');
    };

    protect.updateFieldValue = function(field, $field) {
        if (field && $field.length > 0) {
            //TODO: how does this work with address, etc?
            if (field.val) {
                $field.val(field.val);
            }
        }
    };

    protect.findViewFieldByName = function(name) {
        return $j("#jive-user-registration-form .field[data-field-name='" + name + "']")
    };

    protect.findModelFieldByName = function(name) {
        var foundField = null;
        $j(this.form.fields).each(function(i, field) {
            if (field.name == name) {
                foundField = field;
                return false;
            }
        });
        return foundField;
    };

    protect.validateSingleField = function($field, name) {
        var view = this;
        var text = $field.val();
        if (text && text.length > 0) {
            text = $j.trim(text);
            var modelField = view.findModelFieldByName(name);
            view.emitP('validate', {name: name, val: view.getValFromField(modelField.type, $field)}).addErrback(
                function(field) {
                    view.showFieldErrors(field, $field);
                    view.updateFieldValue(field, $field);
                }).addCallback(function(field) {
                    view.hideFieldErrors(field);
                    view.updateFieldValue(field, $field);
                });
        }
    };

    protect.confirmPassword = function(currentVal, $field) {
        var view = this;
        var text = $field.val();
        if (text != currentVal) {
            view.showFieldErrors({name:'passwordconfirm', errors:[
                {
                    code:4001,
                    message: jive.user.registration.passwordMatchErrorMessage()
                }
            ]}, $field);
        }
        else {
            view.hideFieldErrors({name: 'passwordconfirm'});
        }
    };
});