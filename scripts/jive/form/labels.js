function processLabels(formData, jqForm) {
    var $jiveLabelSelect = jqForm.find("select.jive-labels-shadow");
    var labelName =  $jiveLabelSelect.attr("name");
    var labelFormData;
    for (var i = 0; i < formData.length; i++) {
        if (formData[i].name == labelName) {
            labelFormData = formData[i];
            break;
        }
    }

    if (!labelFormData) {
        formData.push({name: labelName, value: ""});
    }
    else
    {
        labelFormData.value = $jiveLabelSelect.find("option").map(function() {
            return $j(this).val().split("|")[0];
        }).get().join(",");
    }
}

function deserializeLabels(labelObject, jqForm) {
    var $jqForm = jqForm ? $j(jqForm) : $j(document);
    /** reset the form to prepare to deserialize the labels **/
    $j("select.jive-favorite-labels option:not([value=ignore]):not([value=create])").remove();
    $j("select.jive-labels-shadow option").remove();
    $j(".mini-label-list li:visible").remove();

    $j.each(labelObject, function(i, item) {
        /* label is attached, put it in the shadow box and in the UL of active labels */
        if (item.active) {
            $jqForm.find("select.jive-labels-shadow").append($j("<option selected='selected' value='" + item.id
                    + "|" + item.color + "'>" + item.value + "</option>"));
            $jqForm.find(".mini-label-list li:has(input)").before($j("<li class='" + item.color
                    + "'><span class='id' style='display:none'>" + item.id
                    + "</span><span class='color'></span><span class='label_text li_text'>" + item.value
                    + "</span>&nbsp;</li>"));
        }
        else
        {
            $jqForm.find(".jive-favorite-labels :first").after($j("<option value='" + item.id + "|" + item.color + "'>"
                    + item.value + "</option>"));
        }
    });
}

$j(function() {
    if(window.___labelsInitializedByJive) {
        return;
    }
    var new_delete = "<a class='delete_label' href='#'>X</a>";
    function ___initLabels() {
        $j("select.jive-labels").siblings("ul.mini-label-list").find("li:visible").filter(function() {
            return $j(this).children("a").length <= 0;
        }).append($j(new_delete).bind("click", deleteLabelClick));

        $j.each($j("select.jive-labels"), initCreateBox);
     
    }

    var colors = [{name: "green"},{name: "orange"},{name: "red"},{name: "blue"},{name: "purple"},{name: "grey"},
        {name: "pink"}, {name: "black"}];

    $j('.jive-edit-label-form .color_picker').livequery("click", function() {
        var $color_array = $j(this).parent().siblings('.color_array');

        if ($color_array.is(":visible")) {
            $color_array.hide();
        }
        else
        {
            if ($color_array.is(":empty")) {
                $j.each(colors, function(i, item) {
                    var $this_color = $j("<span class='color " + item.name + "'></span>")

                    $this_color.click(function() {
                        var $fakeForm = $j(this).parents(".jive-edit-label-form");
                        $fakeForm.find(".color_picker span.color").removeClass().addClass("color").addClass(item.name);
                        $fakeForm.find(".color_array").hide();
                        $fakeForm.find("input[name='color']").val(item.name);
                    });
                    $color_array.prepend($this_color);
                });
            }
            $color_array.show();
        }
        return false;
    });

    function initCreateBox() {
        var $select_box = $j(this);
        // new label form. (with submit handler)
        var $new_form = $select_box.siblings("ul.mini-label-list").find("li:last").children("div.fakeForm").unbind().bind("fakeSubmit", function() {
            // option to add to the select.
            var labelName = $j(this).find("input").val();
            var $labelEditor = $j(this);
            FavoriteLabels.create(labelName, $j(this).find("input[name='color']").val(), function(label) {
                var $new_option = $j("<option />").text(label.name).val(label.ID + "|" + label.displayStyle);
                $select_box.find("option:first").after($new_option);
                // remove the form
                $labelEditor.parent("li").slideUp("fast");
                // select the option they just added and trigger the change event again
                // (to reduce code duplication)
                $new_option.prop('selected', true);
                $select_box.triggerHandler("change");
            });
            $j(this).find("input.jive-label-input").val("");
            return false;
        });

        // new input field.
        var stopFunc = function(e) {
            if (e.keyCode == 13) {
                return false;
            }
        };
        var inputFunc = function(e) {
            if (e.keyCode == 13) {
                $new_form.trigger("fakeSubmit");
                return false;
            }
        };
        // bind keyhandlers to the input. press and down stop propogation
        // (keeps it from submitting 3 times) and up submits it if you press 'enter'
        $new_form.find("input").unbind().keypress(stopFunc).keydown(stopFunc).keyup(inputFunc);

        //bind fakeSubmit to the Apply button
        $new_form.find("a.jive-label-save").unbind().click(function() {
            $new_form.trigger("fakeSubmit");
            return false;
        });
    }

    function deleteLabelClick() {
        var id = $j(this).siblings("span.id:first").text();
        var $select_box = $j(this).parents("ul:first").siblings("select");
        var $shadow_select = $select_box.siblings("select.jive-labels-shadow");
        var $option = $shadow_select.find("option").filter(function() {
            return $j(this).val().split("|")[0] == id;
        });
        // add the option back to the option list
        $select_box.find("[value='ignore']:last").before($option.remove());
        $select_box.find("[value='ignore']").css("display", "");
        $select_box.find("[value='ignore']:first").prop('selected', true);

        // delete the label (remove from DOM)
        $j(this).parent("li").fadeOut("fast", function() {
            $j(this).remove();
        });
        return false;
    }

    function createLabel($select_box) {
        // user clicked "create new label"
        var $new_form = $select_box.siblings("ul.mini-label-list").find("li:last").children("div");
        var $new_input = $new_form.find("input");

        // construct the dom and add it to the UL.
        $new_form.parents("li").slideDown("fast", function() {
            $new_input.focus();
        });
        $select_box.find("[value='ignore']:first").prop('selected', true);
    }
    $j("select.jive-labels").livequery("change", function() {
        var $select_box = $j(this);
        var selected_text = $j(this).find("option:selected").val();

        if (selected_text == "create") {
            createLabel($select_box);
            return false;
        }
        else if (selected_text != "ignore") {
            // user chose a label to add.
            var $option = $j(this).find("option:selected");
            var id = $option.val().split("|")[0];
            var color = $option.val().split("|")[1];
            // new label DOM (li -> (span, span))
            var $new_label = $j("<li class='" + color
                    + "'/>").append($j("<span class='id'/>").css("display", "none").text(id)).append("<span class='color'/>").append("<span class='label_text li_text'>"
                    + $option.text() + "</span>&nbsp;</li>").css("display", "none");

            // add delete button to label li.
            $new_label.append($j(new_delete).bind("click", deleteLabelClick));

            var $shadow_select = $select_box.siblings("select.jive-labels-shadow");
            // remove the label from the select box
            $shadow_select.append($option.remove());
            $shadow_select.find("option").prop('selected', true);
            $select_box.find("[value='ignore']:first").prop('selected', true);
            $select_box.triggerHandler("change");
            $j(this).siblings("ul.mini-label-list").find("li:last").before($new_label);
            $new_label.slideDown("fast");
        }
    });
    $j("select.jive-labels").livequery(function() {
        ___initLabels();
    });
    window.___labelsInitializedByJive = true;
});
