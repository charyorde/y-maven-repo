/*globals Blob File */

/**
 * Mixin that goes with jive.RestService.  This class augments the
 * RestService#save() method to automatically handle uploading files
 * that are given as resource properties.  This code goes well with
 * jive.FileInput.
 *
 * @depends path=/resources/scripts/jive/util.js
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
define('jive.FileUploader', [
    'jquery',
    'jive.RestService'
], function($, RestService) {
    return RestService.extend(function(protect, _super) {

        /**
         * Modified implementation of jive.RestService#save().  This
         * version accepts a form, which may include file inputs or
         * drag 'n drop file inputs created by jive.FileInput.  Form
         * parameters and files are uploaded as form data, or as
         * multipart form data if files are included.
         *
         * If the given resource is not a form but is a regular
         * JavaScript object, then the original implementation of save()
         * is invoked.
         */
        this.save = function(resource) {
            var source = this;

            if ($(resource).is('form')) {
                return jive.util.securedForm(resource).flatMap(function($form) {
                    var url = source.saveUrl(resource)
                      , method = source.saveMethod(resource);

                    return source.uploadForm(method, url, resource);
                });
            } else {
                return _super.save.call(this, resource);
            }
        };

        protect.uploadForm = function(method, url, form) {
            var $form = $(form), data;

            if (typeof FormData !== 'undefined' && typeof File !== 'undefined') {
                data = new FormData();

                // Safari 5 does not support giving a form reference to
                // the FormData constructor.  So add form fields here.
                $form.serializeArray().forEach(function(field) {
                    data.append(field.name, field.value);
                });

                // Add file references collected by regular file inputs
                $form.find('input[type="file"]').each(function() {
                    if (!this.multiple && this.files.length >= 1) {  // TODO: handle inputs that accept multiple files
                        data.append(this.name, this.files[0]);
                    }
                });

                // Add file references collected by drag 'n drop inputs
                // to form data.
                $form.find('.js-file-input').each(function() {
                    var $input = $(this)
                      , name = $input.data('name')
                      , value = $input.data('value');

                    if (name && value) {
                        data.append(name, value);
                    }
                });

                return this.uploadFormData(method, url, data);
            } else {
                return this.hiddenIFrameSubmit(method, url, form);
            }
        };

        var textAreaExp = /[^{\[]*<textarea(?:\s[^>]*)?>(.*?)<\/textarea>/i
          , bodyExp = /[^{\[]*<body(?:\s[^>]*)?>(.*?)<\/body>/i
          , preExp = /[^{\[]*<pre(?:\s[^>]*)?>(.*?)<\/pre>/i;

        function tagContent(exp, text) {
            var matches = text.match(exp);
            return matches ? matches[1] : null;
        }

        protect.uploadFormData = function(method, url, formData) {
            var promise = new jive.conc.Promise();

            this.commonAjaxRequest(promise, method, {
                url: url,
                data: formData,
                processData: false,  // tell jQuery not to process the data
                contentType: false,  // tell jQuery not to set contentType
                dataFilter: function(data, type) {
                    /* Adapted from jquery.form.js */

                    var responseText = tagContent(textAreaExp, data) ||
                                       tagContent(preExp, data) ||
                                       tagContent(bodyExp, data) ||
                                       data;

                    return type === 'json' ? $.trim(responseText.replace(/^throw [^;]*;/, '')) : responseText;
                },
                // since it's difficult to guess fo different connections and file sizes - allow unlimited
                timeout: 0
            }, formData);

            return promise;
        };

        protect.hiddenIFrameSubmit = function(method, url, form) {
            var $form = $(form)
              , promise = new jive.conc.Promise()
              , source = this;

            $form.ajaxSubmit({
                url: url,
                type: method,
                contentType: 'json',
                dataType: 'json',
                success: function(data) {
                    source.normalizeID(data);
                    promise.emitSuccess(data);
                },
                error: this.errorCallback(promise, this.errorSaving),
                // since it's difficult to guess fo different connections and file sizes - allow unlimited
                timeout: 0
            });

            return promise;
        };

    });
});
