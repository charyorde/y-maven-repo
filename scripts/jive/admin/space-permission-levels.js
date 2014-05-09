// TABS
$j(function() {
    $j("#jive-custom-tab a").click(function() {
        $j('#default-tab').hide();
        $j('#custom-tab').show();
        $j('#jive-custom-tab').addClass('jive-body-tabcurrent active');
        $j('#jive-browse-tab').removeClass('jive-body-tabcurrent active');
    });

    $j("#jive-browse-tab a").click(function() {
        $j('#default-tab').show();
        $j('#custom-tab').hide();
        $j('#jive-browse-tab').addClass('jive-body-tabcurrent active');
        $j('#jive-custom-tab').removeClass('jive-body-tabcurrent active');
    });
});

$j(function() {
    function lightBox($toLightbox) {
        $toLightbox.lightbox_me({
            closeSelector: ".jive-close",
            onClose: function() {
                $toLightbox.remove();
            }
        });
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

    $j("#custom-tab .create-link").click(function() {
        loadAdvancedForm("");
        return false;
    });

    function loadAdvancedForm(data) {
        $j.ajax({
            url: __configureAdvancedPermissionsUrl,
            data: data,
            success: configureAdvancedForm
        });
    }

    function configureAdvancedForm(html) {
        $j("body").append(html);
        lightBox($j("#advanced-perms"));
        $j("#advanced-perms-form").ajaxForm({
            success: advancedFormSuccess,
            beforeSubmit: advancedBeforeSubmit
        });
    }

    function advancedBeforeSubmit(data, $form) {
        var cancel = false;
        for (var i = 0; i < data.length; i++) {
            cancel = data[i].name == "method:cancel";
            if (cancel) {
                break;
            }
        }
        if (cancel) {
            $j("#advanced-perms").find("a.jive-close").click();
            return false;
        }
        else
        {
            $form.find(":submit").prop('disabled', true).blur();
            return true;
        }
    }

    function advancedFormSuccess(data) {
        // Uh-oh there was a form error!
        if ($j(data).attr("id") == "advanced-perms") {
            $j("#advanced-perms-form").replaceWith($j("#advanced-perms-form", data));
            $j("#advanced-perms-form").ajaxForm({
                success: advancedFormSuccess
            });
            var $firstErrorField = $j(".jive-field-error:first").focus();
            $j.scrollTo($firstErrorField, {offset: {top: -60}});
        }
        // We are good let's replace the permission level listing
        else
        {
            $j("#advanced-perms").find("a.jive-close").click();
            $j("#empty").slideUp();
            $j("#custom-permlist, #empty").replaceWith($j("#custom-permlist", data));
        }
    }

    $j("#custom-permlist .added-level, #custom-permlist .updated-level").livequery(function() {
        var shouldDelay = $j(this).siblings("li:visible").size() > 0;
        $j(this).filter(":hidden").delay(shouldDelay ? 1000 : 0).slideDown();
        $j(this).effect("highlight", {
            color: '#eafade'
        }, 3000);

        var $updatedMsg = $j(this).find(".perms-updated");
        $updatedMsg.delay(4000).fadeOut('slow', function() {
            $j(this).remove();
        });
    });

    $j("a[id^=edit-level-]").live("click", function() {
        $j(this).siblings("form").ajaxSubmit({
            success: configureAdvancedForm
        });
        return false;
    });

    $j("a[id^=delete-level-]").live("click", function() {
        var deletedId = $j(this).attr("id");
        var levelId = deletedId.slice("delete-level-".length);
        $j(this).siblings("form").ajaxSubmit({
            success: function(data) {
                var callback = function(data) {
                    if ($j("#" + deletedId, data).length > 0) {
                        return;
                    }

                    $j("#" + deletedId).parents("li").slideUp();

                    var $levelDeletedMessage = $j("#" + "level-deleted-" + levelId);
                    $levelDeletedMessage.slideDown();
                    $levelDeletedMessage.delay(4000).slideUp('slow', function() {
                        if ($j("#empty", data).length > 0) {
                            var $newEmpty = $j("#empty", data);
                            $newEmpty.css("display", "none");
                            $j("#custom-permlist, #empty").replaceWith($newEmpty);
                            $j("#empty").slideDown();
                        }
                        else
                        {
                            $j(this).remove();
                        }
                    });
                };
                var errorCallback = function() {
                };
                if (checkConfirmation(data, callback, errorCallback)) {
                    return;
                }

                callback(data);
            }
        });
        return false;
    });

    $j("a[id^=space-listing-]").live("click", function() {
        $j.get($j(this).attr("href"), function(data) {
            var $data = $j(data).appendTo("body");
            lightBox($data);
        });
        return false;
    });
});