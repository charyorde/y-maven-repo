/**-- I AM DEPRECATED --**/
$j(function() {
    var shiftModifier;
    $j(window).keydown(function(e) {
        if (e.keyCode == "16") {
            shiftModifier = true;
        }
    });
    $j(window).keyup(function(e) {
        if (e.keyCode == "16") {
            shiftModifier = false;
        }
    });
    $j(".bookmark-content").live("click", function() {
        if (shiftModifier) {
            // handle shift click event.
        }
        else
        {
            // we need to fetch the modal as it hasn't been preloaded.
            if ($j("#jive-bookmark-modal").length <= 0) {
                loadModal($j(this));
            }
            else
            {
                populateModal();
            }
        }

        return false;
    });
    $j(".unbookmark-content").live("click", function() {
        var callback = function() {
            var isConfirmed = confirm($j("#remove-bookmark-confirm").text());
            if (isConfirmed) {
                $j("#remove-bookmark-popup-form").ajaxSubmit({
                    cache:false,
                    success: function() {
                        location.reload();
                    }
                });
            }
        };
        if ($j("#remove-bookmark-confirm").length <= 0) {
            loadModal($j(this), callback);
        }
        else {
            callback();
        }
        return false;
    });

    function loadModal(elm, callback) {
        var objType = elm.find("[name='objectType']").val();
        var objID = elm.find("[name='objectID']").val();

        var data = (objType != "" && objID != "") ? "contentObjectType=" + objType + "&object=" + objID : "";
        $j.ajax({
            url: createModalAction,
            data: data,
            success: function(html) {
                $j("body").append(html);
                if (!callback) {
                    populateModal($j("#jive-bookmark-modal"));
                }
                else {
                    callback();
                }
            }
        });
    }
    function populateModal(destroy) {
        if (destroy) {
            var callback = function() { destroy.remove(); };
        }
        var loaded = function() { console.log('loaded') };
        // Fill the jive-bookmark-modal with the ajax return
        $j("#jive-bookmark-modal").lightbox_me({
            closeSelector: ".jive-close, .close",
            onClose: callback,
            onLoad: function() {
                $j('label[for="notes"]').click(function(e){
                    e.preventDefault();
                    $j(this).siblings('.jive-form-element-text').find('div[contenteditable]').first().focus();
                });
            }
        });
        $j('html,body').animate({scrollTop: 0}, 500);
    }

    $j("#jive-bookmark-form").livequery(function() {
        $j(this).ajaxForm({
            cache:false,
            success: function() {
                location.reload();
            }
        });
    });
});

