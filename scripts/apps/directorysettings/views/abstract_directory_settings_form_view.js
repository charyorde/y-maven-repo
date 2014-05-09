jive.namespace('DirectorySettings');

/**
 * @class
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.admin.directory.settings.*
 */
jive.DirectorySettings.AbstractDirectorySettingsFormView = jive.AbstractView.extend(function(protect) {


    protect.attachTestHandler = function ($form) {
        var view = this;
        $form.find("input[name='test']").click(function (e) {
            view.form.test = true;
            view.submitForm($j(this));
            e.preventDefault();
        });
    };

    protect.attachSaveHandler = function ($form) {
        var view = this;
        $form.find("input[name='save']").click(function (e) {
            view.form.test = false;
            view.submitForm($j(this));
            e.preventDefault();
        });
    };

    protect.attachToolTipHandlers = function ($form) {
        var view = this;
        $form.find(".jive-setup-helpicon").hover(function (e) {
            domTT_activate(this,
                e, 'content', $j(this).data("tooltip-text"),
                'styleClass', 'jiveTooltip', 'trail', true, 'delay', 300, 'lifetime',
                8000);
        });
    };

    protect.gatherFormValues = function () {
        var view = this;
        view.$form.find(".js-field").each(function (i, f) {
            var $field = $j(f);
            var field = view.findFormField($field);
            if (field != null){
                if (field.type == 'address') {
                    field.val = view.getAddressValue(field);
                } else {
                    field.val = view.getValFromField($field);
                }
            } else {
                console.log("Couldn't find form field for " + $field.attr('name'))
            }
        });
    };

    protect.findFormField = function($field){
        var view = this;
        var fieldID = $field.attr('id');
        if ($field.hasClass("js-profile-composite-field")){
            fieldID = $field.data("field-id");
        }
        if ($field.hasClass("js-profile-field") && view.form.profileFields){
            return view.form.profileFields[fieldID];
        } else {
            return view.form[fieldID];
        }
    };

    protect.getAddressValue = function(field) {
        return {
            'street1': $j.trim($j("input[name='profile-" + field.id + ".street1']").val()),
            'street2': $j.trim($j("input[name='profile-" + field.id + ".street2']").val()),
            'city': $j.trim($j("input[name='profile-" + field.id + ".city']").val()),
            'stateOrProvince': $j.trim($j("input[name='profile-" + field.id + ".stateOrProvince']").val()),
            'postalCode': $j.trim($j("input[name='profile-" + field.id + ".postalCode']").val()),
            'country': $j.trim($j("input[name='profile-" + field.id + ".country']").val()),
            'type': field.val.type || ""
        }
    };

    protect.getValFromField = function($field) {
        var view = this;
        try {
            if (view.isCheckbox($field)) {
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

    protect.isCheckbox = function($field) {
        return $field.attr('type') == 'checkbox';
    };

    protect.getCheckboxValue = function($field) {
        return $field.is(':checked');
    };

    protect.displayErrors = function (validatedForm) {
        var view = this;
        view.hideErrors();
        view.form = validatedForm;
        for(var key in view.form){
            var field = view.form[key];
            if (field.errors && field.errors.length) {
                view.showErrors(key, field);
            }
        }
    };

    protect.showErrors = function(key, field){
        if (field.errors.length > 0){
            $j.each(field.errors, function(i, err){
                if (err.attributeKey){
                    key += "." + err.attributeKey;
                }
                var $holder = $j(".j-form-field-errors[data-field-name='" + key + "']");
                $holder.html(jive.admin.directory.settings.errors({errors:field.errors}));
                $holder.show();
            });
            field.errors = [];  //clear out errors after they're displayed
        }
    };

    protect.hideErrors = function () {
        $j(".j-form-field-errors").hide();
    };

    protect.hideResult = function(){
        $j("#js-result-message-holder").html("");
    };

    protect.hideStatus = function () {
        $j("#js-server-status-holder").html("");
    };

    protect.enableTestButton = function () {
        this.$form.find("input[name='test']").removeAttr('disabled');
    };

    protect.disableTestButton = function () {
        this.$form.find("input[name='test']").attr('disabled', 'disabled');
    };

    protect.enableSaveButton = function () {
        this.$form.find("input[name='save']").removeAttr('disabled');
    };

    protect.disableSaveButton = function () {
        this.$form.find("input[name='save']").attr('disabled', 'disabled');
    };

});
