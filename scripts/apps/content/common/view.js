/*globals ContentRTE */

/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('content.common');

/**
 * @depends path=/resources/scripts/apps/content/common/content_rte.js
 * @depends path=/resources/scripts/form2object.js
 * @depends path=/resources/scripts/jquery/jquery.ba-bbq.js
 *
 * Validator
 * @depends path=/resources/scripts/apps/content/common/validator.js
 * @depends path=/resources/scripts/apps/content/common/multipart/main.js
 *
 * FormAttachmentService
 * @depends path=/resources/scripts/jive/i18n.js
 * @depends i18nKeys=attach.err.*
 *
 */
jive.content.common.View = jive.AbstractView.extend(function(protect, _super) {

    var $ = jQuery;
    var view;

    this.init = function(options) {
        _super.init.call(this, options);
        this.options = $.extend({
            submitHandlers: {},
            beforeRteSelector: '#subject'
        }, options);

        view = this;

        $(function() {
            var content = view.getContent();

            protect.contentRTE = new ContentRTE(view.options);

            new jive.Validator({form: content});

            $j(view.options.beforeRteSelector).keydown(function(evt){
                return protect.contentRTE.focusOnGUIEditor(evt);
            });

            content.submit(function(e) {

                var content = view.getContent(), restoreFiles;

                if (!e.isDefaultPrevented()) {

                    // see if any customer handlers where registered for that button
                    if (content.data('submit-id')) {
                        var handlerName = content.data('submit-id');
                        content.removeData('submit-id');
                        var submitHandler = view.options.submitHandlers[handlerName];
                        if (submitHandler) {
                            submitHandler(content);
                        }
                    }

                    view.addRenamedToken(content);

                    // don't want to do multi-part if the file was not actually specified and it
                    // is not required
                    restoreFiles = view.removeEmptyNonRequiredFiles(content);
                    setTimeout(restoreFiles, 500);

                    //disable buttons to prevent additional submit
                    view.disableButtons();

                    if (view.isMultipartForm(content)) {
                        content.attr('enctype', 'multipart/form-data');
                        view.emit('save-multipart', [content, view.buildEventData(content)]);
                    }
                    else {
                        var data = view.buildEventData(content);
                        data.formMethod = content.data('formmethod');
                        data.formAction = content.data('formaction');

                        view.emit('save', data);
                    }

                    e.preventDefault();
                }
            });
        });
    };

    this.success = function(data) {
        var content = view.getContent();

        if (!data || data.code) {
            content.find("button").enable();

            // if there is an error code and message - display it, otherwise do generic
            if (data && data.code && data.message) {
                $j('<p>' + data.message + '</p>').message({style: 'error'});
            }
            else {
                $j(jive.error.rest.soy.errorSaving({ href: window.location }))
                    .message({ showClose: true, style:'error' });
            }
            return;
        }

        if (data.fieldErrors || data.errors) {
            //re-enable all buttons if there are any errors so the user can correct and resubmit
            content.find("button").enable();
        }

        //just field errors
        if (data.fieldErrors) {
            var validator = content.find(':input').data('validator');

            var invalidFields = {};
            $.each(data.fieldErrors, function(field, error) {
                invalidFields[error.field] = jive.i18n.getMsg(error.text);
            });

            validator.invalidate(invalidFields);
        }

        //clear out global error messages
        $('#jive-error-box').remove();

        //overall form errors
        //todo this block is very similar to that in validator.js, should be merged at some point to have the validator support general errors
        if (data.errors) {
            //possibly might cause problems when this app is created mutliple times per page. sorry.
            var actionErrors = [];
            $.each(data.errors, function(index, error) {
                actionErrors[index] = { message: jive.i18n.getMsg(error) };
            });

            var errorEl = $(jive.error.form.actionErrors({actionErrors: actionErrors}));
            content.before(errorEl);

            //scroll to the general error
            $.scrollTo(errorEl, 800);
        }

        //if redirect is present, head out
        if (data.redirect) {

            // cleanup the RTE -- have to do on unload
            // otherwise FF on Mac ignores XHR calls on page redirect
            if (window.editor && window.editor.toArray().length > 0) {
                window.editor.toArray()[0].teardownServices();
            }

            var locationParams = $j.deparam.querystring();
            if (locationParams.fromQ) {
                var queryString = 'fromQ=' + locationParams.fromQ;

                if (locationParams.qstep) {
                    var curStep = parseInt(locationParams.qstep, 10);
                    if (locationParams.fromQ != '-775000491') {
                        // don't increment step num for onboarding->contribute quest steps
                        queryString += '&qstep=' + (1 + curStep);
                    }
                    else {
                        queryString += '&qstep=' + (curStep);
                    }
                }
                data.redirect = $j.param.querystring(data.redirect, queryString);
            }
            window.location = data.redirect;
        }
    };

    this.buildEventData = function(content) {
        return content.toObject({mode: 'all'})[0];
    };

    protect.isMultipartForm = function(content) {

        var explicitEncoding = content.data('formenctype');
        if (explicitEncoding) {
            return explicitEncoding == "multipart/form-data";
        }

        var elems = content.find(':file, .js-file-input');
        if (this.options.multipartFormFilter) {
            elems = elems.filter(this.options.multipartFormFilter);
        }
        return elems.length > 0 || content.attr("enctype") == "multipart/form-data";
    };

    protect.addRenamedToken = function(content) {

        // add a renamed security token so it can be easily read on the server
        if (content.find("input[name='jive.token.name']")) {

            $j("<input type='hidden' name='jiveTokenName' value='" +
                content.find("input[name='jive.token.name']").val() + "'/>").appendTo(content);

        }
    };

    protect.removeEmptyNonRequiredFiles = function(content) {
        var removed = [];

        content.find(':file').each(function() {
            var file = $(this), replacement;

            if (!file.attr('required') && !file.val()) {
                replacement = $('<div></div>');
                file.after(replacement);
                file.detach();

                removed.push({
                    original: file,
                    replacement: replacement
                });
            }
        });

        // Return a function to put file inputs back.
        return function() {
            removed.forEach(function(r) {
                r.replacement.replaceWith(r.original);
            });
            removed = [];
        };
    };

    this.enableSubmitButton = function() {
        view.getContent().find('#submitButton').prop('disabled', false);
    };
    
    this.enableButtons = function() {
        view.getContent().find('button').prop('disabled', false);
    };
    
    this.disableButtons = function() {
        view.getContent().find('button').prop('disabled', true);
    };
    
    this.enableSubmitButtons = function() {
        view.getContent().find('button:not([data-submit-id=cancel])').prop('disabled', false);
    };
    
    this.disableSubmitButtons = function() {
        view.getContent().find('button:not([data-submit-id=cancel])').prop('disabled', true);
    };
});
