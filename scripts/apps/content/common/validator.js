/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends path=/resources/scripts/jquery/jquery.validator.js
 * @depends path=/resources/scripts/jquery/jquery.scrollTo.js
 * @depends template=jive.error.form.fieldErrors
 * @depends i18nKeys=content.validation.*
 */
jive.Validator = jive.oo.Class.extend(function(protect) {

    var $ = jQuery;

    this.init = function(options) {
        var validationPrefix = 'content.validation';
        this.options = $.extend({
            form: null,
            validator: this.validator,
            onSuccess: this.onSuccess,
            keys: {
                any: validationPrefix + '.any',
                email: validationPrefix + '.email',
                number: validationPrefix + '.number',
                url: validationPrefix + '.url',
                max: validationPrefix + '.max',
                min: validationPrefix + 'min',
                required: validationPrefix + '.required'
            }
        }, options);

        var _ = this;

        //using live allows new input elements to be added dynamically and the handlers still be registered
        var submitHandler = function(e) {

            var input = $(this);

            if (input.attr('formaction')) {
                _.options.form.data('formaction', input.attr('formaction'));
            }

            if (input.attr('formnovalidate') != undefined) {
                _.options.form.data('formnovalidate', true);
            }

            if (input.attr('formenctype')) {
                _.options.form.data('formenctype', input.attr('formenctype'));
            }

            if (input.attr('formmethod')) {
                _.options.form.data('formmethod', input.attr('formmethod'));
            }

            if (input.attr('data-submit-id')) {
                _.options.form.data('submit-id', input.attr('data-submit-id'));
            }
        };

        _.options.form.find('input[type=submit]').live('click', submitHandler);
        _.options.form.find('button[type=submit]').live('click', submitHandler);

        //initialize the validator
        _.getValidator();

        _.options.form.submit(function(e) {
            //if the click handler on the submit buttons registered a formnovalidate button, skip validation obviously
            if (!_.options.form.data().formnovalidate) {
                //does the actual validation and dom mod
                if (!_.getValidator().checkValidity()) {
                    e.preventDefault();
                }
            }

            //clean up form data on submit
            // TODO - this is a race condition and needs proper resolution
            setTimeout(function() {
                _.options.form.removeData('formaction');
                _.options.form.removeData('formnovalidate');
                _.options.form.removeData('formenctype');
                _.options.form.removeData('formmethod');
                _.options.form.removeData('submit-id');
            }, 100);
        });

        $.tools.validator.localize('jive', {
            '*': 'any',
            ':email': 'email',
            ':number': 'number',
            ':url': 'url',
            '[max]': 'max',
            '[min]': 'min',
            '[required]': 'required'
        });

        $.tools.validator.addEffect('jive', function(errors, event) {

            // "show" function
            $.each(errors, function(index, error) {

                // erroneous input
                var input = error.input;

                //if theres already an error on this field, remove it
                input.prev('.jive-error-message').remove();

                //the type of error for this field
                var errorKey = error.messages[0];

                /*
                 * here we want to allow a straight up i18n key to be the error key, one of our keys corresponding to our
                 * default values (_.options.keys), or a key specified as a data attribute of the input element
                 */

                //if the getMsg function just returns the key back it doesnt exist
                var keyIsI18n = jive.i18n.getMsg(errorKey) != errorKey;

                var msg;
                if (keyIsI18n) {
                    msg = jive.i18n.getMsg(errorKey);
                } else {
                    msg = input.data(errorKey) || jive.i18n.getMsg(_.options.keys[errorKey]) || errorKey;
                }

                var errorEl = $(jive.error.form.fieldError({ msg: msg }));
                input.before(errorEl);

                /*
                 * In case the field is embedded within a hidden block, we need to expand the hidden blocks so
                 * the user can see them and respond to them.
                 */
                var form = input.closest("form");
                input.parentsUntil(form, ":hidden").show();

                //only scroll to the first element
                if (index == 0) {
                    $.scrollTo(errorEl, 800);
                }

            });

        }, function(inputs)  {
            //if theres already an error on this field, remove it
            inputs.prev('.jive-error-message').remove();
        });
    };

    this.getValidator = function() {
        var oldValidator = this.options.form.find(':input').data('validator');

        if (oldValidator) {
            oldValidator.destroy({});  // clear previous errors
        }

        //initial the validator for each new submission click.  This makes sure to pick up any new elements added dynamically
        this.options.form.find(':input').validator({
            lang: 'jive',
            position: 'top left',
            messageClass: 'jive-field-error',
            inputEvent: 'change',
            effect: 'jive',
            formEvent: null
        });

        return this.options.form.find(':input').data('validator');
    };
});
