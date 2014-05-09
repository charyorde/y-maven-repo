// contextual help
function popup() {
    return false;
}
$j(function() {
    new SuperNote('jiveTT', {showDelay: 700, hideDelay: 30, cssProp: 'visibility', cssVis: 'visible', cssHid: 'hidden'});
    $j("a.help-topic").livequery("click", function() {
        window.name = 'main';
        var href = $j(this).attr("href");
        var helpWindow = window.open(href, "Help", 'width=600,height=400,left=-200,top=-200,scrollbars=yes,'
                + 'dependent=yes,status=no,location=no');
        helpWindow.opener.name = "product_ui";
        return false;
    });
});
// tooltips
$j(function() {
    $j("a.tooltip").livequery(function() {
        $j(this).tooltip();
    });
});

//-------------BEGIN SPACE PERMISSIONS LANDING PAGE---------------------------------------------------
$j(function() {
    $j("#space-suggest").keyup(function() {
        $j(this).suggest(__suggestSpaceUrl, {
            clientSearch: true,
            delimiter: "\\a",
            dataDelimiter: "\\b",
            dataContainer: "#space-suggest-id",
            onSelect: function() {
                $j("#space-suggest-form").submit();
            }
        });
    });

    $j("#browse-spaces").click(function() {
        var href = $j(this).attr("href");
        $j.get(href, null, function(data) {
            var id = $j(data).attr("id");
            $j("body").append(data);

            var $toLightBox = $j("#" + id);
            $toLightBox.lightbox_me({
                closeSelector: ".jive-close",
                onClose: function() {
                    $toLightBox.remove();
                }
            });
        });
        return false;
    });

    $j("#browse-space-modal-content").livequery(function() {
        $j(this).spacePicker(function() {
            if ($j(this).children("a.disabled").length > 0) {
                return;
            }

            $j("#space-suggest").val($j(this).text());
            $j("#space-suggest-id").val($j(this).attr("id"));
            $j("#space-suggest-form").submit();
        });
    });
});
//-------------END SPACE PERMISSIONS LANDING PAGE-----------------------------------------------------
   $j(function() {
//-------------CROSS FUNCTIONAL-----------------------------------------------------------------------
        $j("a[id^=permission-level-details-]").live("click", function() {
            initPermissionDetailsForm($j(this).next("form"));
        });

        function initPermissionDetailsForm($form) {
            $form.ajaxSubmit({
                success: function(data) {
                    $j("body").append(data);
                    $j("#permLevelView").lightbox_me({
                        closeSelector: ".jive-close",
                        opacity: 0,
                        onClose: function() {
                            $j("#permLevelView").remove();
                        }
                    });
                }
            });
        }

       /**
        * A utility function which ensures that a form is not enabled, returning true if it is not disabled and false
        * if it is disabled. The way it checks to determine if a form is disabled is by checking all submit elements in
        * the form to see if they are disabled or not. This was neccesary as Chrome and IE both will submit a form when
        * a return event is fired irregardless of whether or not all form elements have been disabled.
        */
       function checkFormNotDisabled(data, form) {
           return $j(form).find(":submit:enabled").length > 0;
       }
//-------------END CROSS FUNCTIONAL------------------------------------------------------------------
//-------------BEGIN SYSTEM PERMISSIONS PAGE----------------------------------------------------------
        var userSuggestTemplate = '<div class="image"><span>' +
                                  '<img class="jive-avatar" src="' + __avatarUrl + '"' +
                                  'border="0" height="30" width="30"></span></div>' +
                                  '<div class="name">{0}<span class="informal">' +
                                  '<em>{1}</em><em>{2}</em></span></div>';

        $j("#add-system-permission-group-form").ajaxForm({
            success: function(data) {
                adminConsoleAdd(data);
            },
            beforeSubmit: function(data, $form) {
                if (addGroupBeforeSubmit(data, $form)) {
                    return true;
                }
                doCancel();
                return false;
            }
        });

        function adminConsoleAdd(data) {
            if ($j("#admin-console-add").length > 0) {
                $j("#admin-console-add").find("#system-permissions-form")
                        .replaceWith($j("#system-permissions-form", data));
            }
            else {
                $j("body").append(data);
                lightBox($j("#admin-console-add"));
                doCancel();
            }
            initSystemPermissionsForm($j("#system-permissions-form"));
        }

        function lightBox($toLightbox) {
            $toLightbox.lightbox_me({
                closeSelector: ".jive-close",
                onClose: function() {
                    $toLightbox.remove();
                }
            });
        }

        function initSystemPermissionsForm($advancedForm) {
            $advancedForm.ajaxForm({
                success: function(data) {
                    var callback = function(data) {
                        if ($j("#space-perm-groups", data).length > 0) {
                            $j("#space-perm-groups").replaceWith($j("#space-perm-groups", data));
                        }
                        else {
                            location.reload();
                        }
                    };
                    var errorCallback = function() { location.reload(); };
                    if ($j(data).attr("id") == "admin-console-add") {
                        adminConsoleAdd(data);
                        return;
                    }
                    $j("#admin-console-add").find("a.jive-close").click();
                    if (!checkConfirmation(data, callback, errorCallback)) {
                    $j("#space-perm-groups").replaceWith($j("#space-perm-groups", data));
                    }
                },
                beforeSubmit: function(data, $form) {
                    if (advancedBeforeSubmit(data, $form)) {
                        return true;
                    }
                    $j("#admin-console-add").find("a.jive-close").click();
                    return false;
                }
            });
        }

        $j("div#space-perm-groups li.group a.edit").live("click", function() {
            $j.scrollTo({top:'0px', left:'0px'}, 500);
            $j(this).next("form").ajaxSubmit({
                success: function(data) {
                    $j("body").append(data);
                    lightBox($j("#admin-console-add"));
                    initSystemPermissionsForm($j("#system-permissions-form"));
                }
            });
        });
//-------------END SYSTEM PERMISSIONS PAGE------------------------------------------------------------
//-------------BEGIN EDIT SPACE PERMISSIONS-----------------------------------------------------------
        function elementRemove() {
            $j(this).remove();
        }

        $j(".typeahead").livequery(function() {
            $j(this).data("defaultValue", $j(this).val());

            $j(this).focus(function() {
                $j(this).removeClass('typeahead');

                if ($j(this).val() == $j(this).data("defaultValue")) {
                $j(this).val('');
                }
            });

            $j(this).blur(function() {
                if ($j(this).val().length != 0) {
                    return;
                }

                $j(this).addClass('typeahead');
                $j(this).val($j(this).data("defaultValue"));
            });
        });

        //_________Group_Suggest_______________

       $j("#addlink").live("click", function() {
           if ($j(this).hasClass('adding')) {
               doCancel();
           }
           else {
            $j(this).addClass('adding');
            $j('#add-group').fadeIn("fast");
            $j('#view-rules').hide();

           doCancelCreateException();

            $j('#userlookup').removeClass('adding');
            $j("#group-suggest").focus();
           }
            return false;
        });

        $j("#group-suggest").livequery(function() {
            $j(this).suggest(__suggestGroupUrl, {
                clientSearch: false,
                delimiter: "\\a",
                dataDelimiter: "\\b",
                resultsClass: "ac_results_group",
                dataContainer: "#group-suggest-id",
                onSelect: function() {
                    $j(this).parents("form").find(":submit").prop('disabled', false);

                    $j(this).hide();
                    $j("#group-suggest-selected").text($j(this).val());
                    $j("#group-suggest-selected").show();

                    findNextFocusableInput($j(this)).focus();
                }
            });
        });

        $j("#group-suggest-selected").live("click", function() {
            $j(this).hide();
            $j("#group-suggest").show().val('').focus();
            $j("#group-suggest-id").val('');
            $j(this).parents("form").find(":submit:not([name=cancel])").prop('disabled', true);
        });

        function advancedBeforeSubmit(data, $form) {
            var cancel = checkCancel(data);

                if (cancel) {
                doCancelAdvanced($form);
            }

            $form.find(":submit").prop('disabled', true).blur();
            return !cancel;
        }

        function checkCancel(data) {
            for (var i = 0; i < data.length; i++) {
                var cancel = data[i].name == "method:cancel";
                if (cancel) {
                    return true;
                }
            }
            return false;
        }

        function doCancelAdvanced($form) {
            var $modal = $form.parents(".jive-modal");
            $modal.find("a.jive-close").click();
        }

        function configureAdvancedPermissions(data, $formElement) {
            $j.ajax({
                url: __configureAdvancedPermissionsUrl,
                data: data,
                success: function(html) {
                    $j("body").append(html);
                    lightBox($j("#advanced-perms"));
                    initAdvancedForm($j("#advanced-perms-form"), $formElement);
                }
            });
        }

        function initAdvancedForm($advancedForm, $formElement) {
            $advancedForm.ajaxForm({
                success: function(data) {
                    var errorCallback = function() {location.reload(); };
                    // little janky but this is all that ajaxform will give back to us.
                    var jsonTest = data.charAt(0) == "{";
                    if (!jsonTest && $j(data).attr("id") == "advanced-perms") {
                        $j("#advanced-perms-form").replaceWith($j("#advanced-perms-form", data));
                        initAdvancedForm($j("#advanced-perms-form"), $formElement);
                        var $firstErrorField = $j(".jive-field-error:first").focus();
                        $j.scrollTo($firstErrorField, {offset: {top: -60}});
                    }
                    else if (!jsonTest) {
                        $j("#advanced-perms").find("a.jive-close").click();
                        checkConfirmation(data, advancedFormSuccess, errorCallback);
                    }
                    else if (jsonTest) {
                        $j("#advanced-perms").find("a.jive-close").click();
                        advancedFormSuccess(data, $formElement);
                    }
                },
                beforeSubmit: advancedBeforeSubmit
            });
        }

        function advancedFormSuccess(data, $formElement) {
            data = window["eval"]("(" + data + ")");
            if (data.pl.name) {
                addOption($formElement, data.pl.name, data.pl.id);
            }
            else {
                $formElement.val(data.pl.id);
            }
            $formElement.parents("form").find(":submit").prop('disabled', false);
        }

        function addOption($formElement, name, id) {
            var $option = $j("<option />");
            $option.text(name);
            $option.val(id);
            $j("select.permission-level-selector").find("option.custom").before($option);

            // find the new option in the select which triggered the option to be created
            $option = $formElement.siblings("[value=" + id + "]");
            // select the new option and trigger the change event on the parent select.
            $option.prop('selected', true);
            $option.parent("select").change();
        }

       $j("#permlevel, div.select-permlevel select.permission-level-selector").livequery(function() {
           $j(this).bind("change", function() {
               var $editCustom = $j(this).siblings(".edit-custom-level");
               var $form = $editCustom.parents("form");

               var isCustom = $j(this).find("option:selected").hasClass("custom");
               if (!isCustom) {
                   $editCustom.hide();
                   $j(this).find("option.custom").val('-1');
                   $form.find(":submit").prop('disabled', false);
                   return;
               }

               // disable the save button
               $form.find(":submit:not([name=cancel])").prop('disabled', true);

               $editCustom.show().click();
           });
       });

        $j("form#add-group-form .edit-custom-level").live("click", function() {
            var $customOption = $j("#permlevel option.custom");
            configureAdvancedPermissions("permissionLevel=" + $customOption.val(), $customOption);
        });

        $j("div.select-permlevel a.edit-custom-level").live("click", function() {
            var $customOption = $j(this).parents("form[id^=update-group-]").find("option.custom");
            configureAdvancedPermissions("permissionLevel=" + $customOption.val(), $customOption);
        });

        $j("form#permission-level-details-form").livequery(function() {
            $j(this).ajaxForm({
                beforeSubmit: function() {
                    $j("#permLevelView .jive-close").click();
                    return false;
                }
            });
        });

        function doCancel() {
            $j('#add-group').fadeOut('fast');
            $j("#add-group").find(":submit[name=cancel]").prop('disabled', false);
            $j('#addlink').removeClass('adding');
            $j("#group-suggest-selected").click();
            $j("#group-suggest").blur();

            return false;
        }

       $j("select.permission-level-select").livequery(function() {
           $j(this).bind("change", function() {
               var $editAdvanced = $j(this).siblings("p.advanced");
               var $selected = $j(this).find("option:selected");
               var $permdef = $j(this).siblings("span.permdef");
               var isAdvanced = $selected.hasClass("advanced");

               $permdef.text($selected.attr("title"));

               if (!isAdvanced) {
                   $editAdvanced.hide();
                   return;
               }

               $editAdvanced.show();
           });
       });

        $j("#savelevel").livequery(function() {
            $j(this).click(function() {
                $j('#permlevel-name').toggle();
                return true;
            });
        });

        function addGroupBeforeSubmit(data, $form) {
            var cancel = false;
            for (var i = 0; i < data.length; i++) {
                cancel = data[i].name == "cancel";
                if (cancel) {
                    break;
                }
            }
            if (cancel) {
                doCancel();
            }
            else {
                $form.find(":submit").prop('disabled', true).blur();
            }
            return !cancel;
        }

        // Trigger for the add group form
        $j("#add-group-form").livequery(function() {

            $j(this).ajaxForm({
                success: function(data) {
                    doCancel();

                    // replace the add group form so we can get a new token if we add any more groups
                    $j("#add-group").replaceWith($j("#add-group", data));
                    // We replace the entire div of space-perm-groups
                    $j("#space-perm-groups").replaceWith($j("#space-perm-groups", data));
                },
                beforeSubmit: addGroupBeforeSubmit
            });
            // disable the save button
            $j(this).find(":submit:not([name=cancel])").prop('disabled', true);
        });

        function handleAddedPermission() {
            $j(this).fadeIn().effect("highlight", {
                color: '#eafade'
            }, 3000);


            var $groupAddedMsg = $j(this).find(".perms-updated");
            $groupAddedMsg.delay(2000).fadeOut('slow');
            $j.scrollTo(this, 500);
        }

        // listen for any divs with the added-group class, we are going to fade them in highlight them green for a few
        // seconds
        $j(".added-group").livequery(handleAddedPermission);
        //_________End_Group_Suggest_______________

        //_________Effective_Group_Countols_______

        function doRemove($group, removeCallback) {
            var $removed = $group.prev(".perms-updated");
            $group.fadeOut("fast", elementRemove);
            $removed.fadeIn("fast").delay(3000).fadeOut('slow', function () {
                if (removeCallback) {
                    removeCallback();
                }
                else {
                    $j(this).remove();
                }
            });

        }

        // Handles removal of both system permissions and community permissions wrt groups.
        $j("li.group a.remove").live("click", function() {
            var $group = $j(this).parents("li.group");
            var $form = $j(this).next("form");

            $form.ajaxSubmit(function(data) {
                var callback = handleGroupRemoveConfirmation.bind($group);
                var errorCallback = function() { location.reload(); };
                if (!checkConfirmation(data, callback, errorCallback)) {
                    callback = handleGroupRemove.bind($group);
                    callback(data);
                }
            });
        });

        function handleGroupRemove(data) {
            var $data        = $j(data),
                $replacement = $data.find('#space-perm-groups'),
                $group       = this;

            if ($data.find('#' + $group.attr('id')).length === 0) {
                doRemove($group, function() {
                    $j("#space-perm-groups").replaceWith($replacement);
                });
            }
        }

        function handleGroupRemoveConfirmation(data) {
            var $group = this;
            var groupId = $group.attr("id");
            if ($j("#" + groupId, data).length > 0) {
                // handle error
                $j("#space-perm-groups").replaceWith($j("#space-perm-groups", data));
                return;
            }
            location.reload();
        }

        function checkConfirmation(data, callback, errorCallback) {
            var $confirmationModal = $j(data);
            if (!$confirmationModal.hasClass("jive-modal-confirm")) {
                return false;
            }

            $j("body").append($confirmationModal);
            $confirmationModal = $j(".jive-modal-confirm");
            lightBox($j(".jive-modal-confirm"));

            $confirmationModal.find("form").ajaxForm({
                success: function(data) {
                    $j(".jive-modal-confirm").find("a.jive-close").click();
                    callback(data);
                },
                error: errorCallback
            });

            return true;
        }

        $j("li.group a.change").live("click", function() {
            var $select = $j(this).parents(".current-permlevel");
            $select.hide();
            $select.siblings(".select-permlevel").fadeIn("fast");
        });

        $j("li.group div.select-permlevel form").livequery(function() {
            var SgroupId = "#" + $j(this).attr("id");
            var $form = $j(this);
            $j(this).ajaxForm({
                success: function(data) {
                    // replace the form
                    $j(SgroupId).replaceWith($j(SgroupId, data));

                    // show the updated message and hide the form
                    var $selectPermLevel = $j(SgroupId).parents(".select-permlevel");
                    $selectPermLevel.siblings(".perms-updated").fadeIn("fast").delay(2000).fadeOut('slow');
                    $selectPermLevel.hide();

                    handleAddedPermission.apply($j(SgroupId).closest("li.group"));

                    // show the current permission level after replacing it
                    $selectPermLevel.siblings(".current-permlevel").replaceWith($j(SgroupId, data)
                            .parents(".select-permlevel").siblings(".current-permlevel"));
                    $selectPermLevel.siblings(".current-permlevel").fadeIn();
                },
                beforeSubmit: function() {
                    var $submit = $form.find(":submit");
                    $submit.prop('disabled', true);
                    $submit.blur();
                }
            });
        });
        //_______End_Effective_Group_Countols_____

        //_________User_Access_Check_______________

        function doCancelCreateException() {
            $j("#group-affiliation").fadeOut("fast", elementRemove);
            $j("#user-suggest-selected").click();
            $j("#view-rules-form").find(":submit").prop('disabled', true);
        }

       $j("#userlookup").live("click", function() {
           if ($j(this).hasClass('adding')) {
               doCancelCreateException();

               $j(this).removeClass('adding');
               $j("#view-rules").fadeOut("fast");
           }
           else {
               $j(this).addClass("adding");
               $j('#add-group').hide();

               doCancel();

               $j("#view-rules").fadeIn("fast");
               $j("#user-suggest").focus();
           }
           return false;
       });

        $j("#user-suggest, #add-user-exception").livequery(function() {
            var id = $j(this).attr("id");
            var containerQ = "#" + id + " + input:hidden";
            var selectedDiv = $j(this).siblings("div.input");
            $j(this).suggest(__suggestUserUrl, {
                clientSearch: true,
                delimiter: "\\a",
                dataDelimiter: "\\b",
                dataContainer: containerQ,
                template: userSuggestTemplate,
                resultsClass: "ac_results_contact",
                liClass: "jive-contact",
                paramName: "query",
                useCache: "false",
                onSelect: function() {
                    $j(this).hide();
                    selectedDiv.text($j(this).val());
                    selectedDiv.show();

                    $j(this).parents("form").find(":submit").prop('disabled', false);
                    findNextFocusableInput($j(this)).focus();
                },
                limit: __suggestUserLimit
            });
        });

        function findNextFocusableInput($input) {
            var $form = $input.parents("form");
            var $inputs = $form.find(":input:not([type=hidden])");
            var i = $inputs.index($input) + 1;

            return $form.find(":input:not([type=hidden]):eq(" + i + ")");
        }

        $j("#user-suggest-selected, #add-user-exception-selected").live("click", function() {
            $j(this).hide();
            $j(this).siblings(":text").show().val('').focus();
            $j(this).siblings("input:hidden").val('');
            $j(this).parents("form").find(":submit").prop('disabled', true);
        });

        $j("#view-rules-form").livequery(function() {
            var $form = $j(this);
            $j(this).ajaxForm({
                success: function(data) {
                    $j("#group-affiliation").remove();
                    $form.after($j(data));
                    $j("#group-affiliation").fadeIn("fast");
                    $j(this).find(":submit").prop('disabled', true);
                }
            });
            $j(this).find(":submit").prop('disabled', true);
        });

        $j("#group-affiliation-create-exception").live("click", function() {
            configureUserException($j("#group-affiliation-form"));
        });
        $j("#group-affilication-cancel").live("click", doCancelCreateException);
        //___________End_User_Access_Check_____________

        //___________Begin_User_Exceptions_____________
        function configureUserException($form) {
            $form.ajaxSubmit({
                success: function(html) {
                    $j("body").append(html);
                    // space user exception
                    if ($j("#advanced-perms").size() > 0) {
                        lightBox($j("#advanced-perms"));
                        initUserExceptionForm($j("#advanced-perms-form"));
                    }
                    // system user exception
                    else if ($j("#admin-console-add").size() > 0) {
                        lightBox($j("#admin-console-add"));
                        initUserExceptionForm($j("#system-permissions-form"));
                    }
                }
            });
        }

        var stylesheet = /<link [^>]*rel="stylesheet".*?>/g;

        function initUserExceptionForm($advancedForm) {
            $advancedForm.ajaxForm({
                success: function(data) {
                    // The presence of the admin/global.css in the HTML
                    // response triggers an error in IE7.
                    if ($j.browser.msie && $j.browser.version < 8) {
                        data = data.replace(stylesheet, '');
                    }

                    if ($j(data).attr("id") == "admin-console-add") {
                        if ($j("#system-permissions-form") && $j("#system-permissions-form").length > 0) {
                            $j("#system-permissions-form").replaceWith($j("#system-permissions-form", data));
                            initUserExceptionForm($j("#system-permissions-form"));
                            return;
                        }
                    }

                    doCancelCreateException();
                    doCancelAdvanced($advancedForm);

                    var errorCallback = function() { location.reload(); };
                    var callback = function (data) {

                        var $exceptions = $j("#exceptions", data);
                        if ($exceptions.length > 0) {
                            $j("#exceptions").replaceWith($exceptions);
                            $j("#override .empty-permlist").remove();
                        }
                        else {
                            location.reload();
                        }
                    };

                    if (!checkConfirmation(data, callback, errorCallback)) {
                        callback(data);
                    }

                },
                beforeSubmit: advancedBeforeSubmit
            });
        }

        $j(".added-exception").livequery(handleAddedPermission);

        // delete system exception and space exceptions
        $j("#exceptions li.exception a.delete").live("click", function() {
            var $exception = $j(this).parents("li.exception");
            var $form = $j(this).next("form");
            $form.ajaxSubmit(function(data) {
                var callback = handleExceptionRemoveConfirmation.bind($exception);
                var errorCallback = function() {
                    location.reload();
                };
                if (!checkConfirmation(data, callback, errorCallback)) {
                    callback = handleExceptionRemove.bind($exception);
                    callback(data);
                }
            });
        });

        function handleExceptionRemove(data) {
            var $exception = this;
            var userId = $exception.attr("id");
            if ($j("#" + userId, data).length > 0) {
                // handle error
                return;
            }
            var callback = function() {
                var $emptyPermList = $j("#override .empty-permlist", data);
                if ($emptyPermList.length < 0) {
                    return;
                }

                $j("#override").append($j("#override .empty-permlist", data));
            };
            doRemove($exception, callback);
        }

        function handleExceptionRemoveConfirmation(data) {
            var $exceptions = $j("#exceptions", data);
            if ($exceptions.length > 0) {
                $j("#exceptions").replaceWith($exceptions);
            }
            else {
                location.reload();
            }
        }

        // system admin exceptions
        $j("#exceptions ul li span.actions a.edit").live("click", function() {
            var $form = $j(this).next("form");
            configureUserException($form);
            $j.scrollTo({top:'0px', left:'0px'}, 500);
        });

        // Space exceptions
        $j("#exceptions li.exception div.exception-permission-level a.tooltip, "
                + "#exceptions li.exception div.exception-permission-level a.edit"
                ).live("click", function() {
            var $form = $j(this).parents(".exception-permission-level").children("form");
            $j.scrollTo({top:'0px', left:'0px'}, 500);
            if ($j(this).hasClass("edit")) {
                configureUserException($form);
            }
            else {
                initPermissionDetailsForm($form);
            }
        });

        // checkbox handling - click events for the message divs
        $j('.jive-perm-choice').live('click', function() {
            $j(this).find('.sel-choice').each(function() {
                if ($j(this).is(':checked')) {
                    $j(this).prop('checked', false);
                    $j(this).closest('.jive-perm-choice').removeClass('permission-selected');
                }
                else {
                    $j(this).prop('checked', true);
                    $j(this).closest('.jive-perm-choice').addClass('permission-selected');
                }
            });
        });
        // checkbox handling - click events for the checkbox itself
        $j('.sel-choice').live('click', function() {
             if ($j(this).is(':checked')) {
                $j(this).prop('checked', false);
                $j(this).closest('.jive-perm-choice').removeClass('permission-selected');
            }
            else {
                $j(this).prop('checked', true);
                $j(this).closest('.jive-perm-choice').addClass('permission-selected');
            }
        });

        $j("#add-system-permission-exception-form").livequery(function() {
            var $form = $j(this);
            $form.ajaxForm({
                success: function(data) {
                    $j("body").append(data);

                    if ($j("#advanced-perms").size() > 0) {
                        lightBox($j("#advanced-perms"));
                        initUserExceptionForm($j("#advanced-perms-form"));
                    }
                    // system user exception
                    else if ($j("#admin-console-add").size() > 0) {
                        lightBox($j("#admin-console-add"));
                        initUserExceptionForm($j("#system-permissions-form"));
                    }
                    $j("#add-user-exception-selected").click();
                },
                beforeSubmit: checkFormNotDisabled
            });

            $j(this).find(":submit").prop('disabled', true);
        });

        $j("#space-access :radio[name=admin]").livequery(function() {
            $j(this).click(function() {
                var value = $j("#space-access :radio[name=admin]:checked").val();
                switch (value) {
                case "rescind":
                case "nocontent":  
                    $j("#manage-adv").slideUp("fast");
                    $j("#addl-settings").slideUp("fast");
                    $j("#content-types").slideUp("fast");
                    break;
                case "view":
                    $j("#manage-adv").slideUp("fast");
                    $j("#addl-settings").slideDown("fast");
                    $j("#content-types").slideDown("fast");
                    break;
                case "manage":
                    $j("#manage-adv").slideDown("fast");
                    $j("#addl-settings").slideUp("fast");
                    $j("#content-types").slideUp("fast");
                    break;
                }
            });
        });

        $j("#system-access :radio[name=admin]").livequery(function() {
            $j(this).click(function() {
                var value = $j("#system-access :radio[name=admin]:checked").val();
                switch (value) {
                case "rescind":
                    $j("#system-permission-exception").slideUp("fast");
                    break;
                case "view":
                    $j("#system-permission-exception").slideDown("fast");
                    break;
                }
            });
        });

       $j("#addexcept").livequery(function() {
           $j(this).toggle(function() {
               $j("#add-exception").fadeIn("fast");
               $j(this).addClass('adding');
               $j("#add-exception").find(":text").focus();
               return false;
           }, function() {
               $j("#add-exception").fadeOut("fast");
               $j(this).removeClass('adding');
               return false;
           });
       });
        //___________End_User_Exceptions_____________
    });

//_________Space Inheritance______________

$j(function() {
    $j("a.reset-inheritance").live("click", function() {
        $j(this).addClass("reset");
        var url = $j(this).attr("href");
        var $this = $j(this);
        $j.ajax({
            url: url,
            success: function(data) {
                var $prompt = $j(data);
                $this.nextAll().filter(function() {
                    return $j(this).attr('id') == $prompt.attr('id');
                }).remove();
                $this.after($prompt);
            }
        });
        return false;
    });

    function doCancel() {
        $j("#copy-rules").remove();
        $j("a.reset-inheritance").removeClass("reset");
    }

    $j("div#copy-rules form").livequery(function() {
        var $form = $j(this);
        $j(this).ajaxForm({
            success: function(data) {
                var inheritedDiv = $j("div.inherited", data);
                $j("div.customized").replaceWith(inheritedDiv);
                $j("#jive-body-maincol").attr("class", $j("#jive-body-maincol", data).attr("class"));
            },
            beforeSubmit: function(data) {
                var cancel = false;
                for (var i = 0; i < data.length; i++) {
                    cancel = data[i].name == "method:cancel";
                    if (cancel) {
                        break;
                    }
                }
                if (cancel) {
                    doCancel();
                }

                $form.find(":submit").prop('disabled', true).blur();
                return !cancel;
            }
        });
    });

    $j("a.customize-inheritance").live("click", function() {
        $j("#customize-inheritance-form").ajaxSubmit({
            success: function(data) {
                var customizedDiv = $j("div.customized", data);
                $j("div.inherited").replaceWith(customizedDiv);
                $j("#jive-body-maincol").attr("class", $j("#jive-body-maincol", data).attr("class"));
            }
        });
    });

    $j("#jive-inheritors-loading").livequery(function() {
        var url = $j(this).find("a").attr("href");
        $j(this).load(url);
    });

    $j("#view-space-inheritors").live("click", function() {
        $j("#inheritors-spacelist-modal").lightbox_me({
            closeSelector: ".jive-close"
        });
        return false;
    });
//-------------END EDIT SPACE PERMISSIONS-----------------------------------------------------------
});
