$j(function() {
    formActivity.target = formPopularity.target = $j("#jive-content-results");
    var $form = $j("#jive-view-favorites-form");
    var $viewAnchors = $j("#view-options").find("li a");
    var $activityAnchor = $viewAnchors.filter("[target=activity]");
    var $typeAnchors = $j("ul#jive-filter-nav a");
    var $allAnchor = $typeAnchors.filter("[target=all]");

    $form.find(":input").map(function() {
        var name = $j(this).attr("name");
        if (name == "view") {
            $j(this).data("defaultValue", "activity");
        }
        else if (name == "objectTypes") {
            $j(this).data("defaultValue", "");
        }
        else if (name == "page")
        {
            $j(this).data("defaultValue", 1);
        }
    });

    function deserializeForm(hash) {
        var props = hash.split("&", 3);
        var typesSelected = false;
        var viewSelected = false;
        for (var i = 0; i < props.length; i++) {
            var propKeyValue = props[i].split("=");
            var key = propKeyValue[0];
            var value = propKeyValue[1];
            if (key == "view") {
                viewSelected = true;
                $viewAnchors.removeClass("selected");
                $viewAnchors.filter("[target=" + value + "]").addClass("selected");
                $form.find(":hidden[name=view]").val(value);
            }
            else if (key == "objectTypes") {
                typesSelected = true;
                $typeAnchors.removeClass("selected");
                var types = value.split(",");
                for (var j = 0; j < types.length; j++) {
                    $typeAnchors.filter("[target=" + types[j] + "]").addClass("selected");
                }
            }
            else if(key == "page") {
                $form.find(":hidden[name=page]").val(value);
            }
        }
        if (!viewSelected) {
            $viewAnchors.removeClass("selected");
            $activityAnchor.addClass("selected");
            $form.find(":hidden[name=view]").val("activity");
        }
        if (!typesSelected) {
            $typeAnchors.removeClass("selected");
            $allAnchor.addClass("selected");
        }
    }

    // handles the hash change
    // 1. deserializeForm - ensures that all values in the hash are the current values displayed to the user set in
    // the form
    // 2. submits the form to the server for processing
    function formSubmit(hash) {
        deserializeForm(hash);

        var selectedAnchor = $viewAnchors.filter(".selected").attr("target");
        var options;
        if (selectedAnchor == "activity") {
            options = formActivity;
        }
        else
        {
            options = formPopularity;
        }

        options.target.load(options.url + "?" + hash);
    };
    $j.historyInit(formSubmit);

    // serializes the form and causes it to trigger the hash change
    function doSubmit() {
        var objectTypes = $typeAnchors.filter(".selected").map(function() {
                return $j(this).attr("target") == "all" ? null : $j(this).attr("target");
            }).get().join(",");
        var props = $form.formSerialize().split("&", 2);
        var hash = "";
        for (var i = 0; i < props.length; i++) {
            var propKeyValue = props[i].split("=");
            var key = propKeyValue[0];
            var value = propKeyValue[1];
            var elem = $form.find(":input[name=" + key + "]");
            if (elem.data("defaultValue") != value) {
                hash = amp(hash);
                hash += key + "=" + value;
            }
        }
        if (objectTypes.length > 0) {
            hash = amp(hash);
            hash += "objectTypes=" + objectTypes;
        }
        $j.historyLoad(hash)
    }

    function amp(hash) {
        if (hash.length > 0) {
            hash += "&";
        }
        return hash;
    }

    // activity and popularity
    $viewAnchors.click(function() {
        $form.find("input[name=view]").val($j(this).attr("target"));
        $viewAnchors.removeClass("selected");
        $j(this).addClass("selected");

        // reset the paginator
        $form.find(":hidden[name=page]").val(1);
        doSubmit();
        return false;
    });
    // types
    $typeAnchors.click(function() {
        var target = $j(this).attr("target");
        if (target == "all") {
            $typeAnchors.removeClass("selected");
            $j(this).addClass("selected");
        }
        else
        {
            $allAnchor.removeClass("selected");
            $j(this).toggleClass("selected");
        }

        if ($typeAnchors.filter(".selected").length <= 0) {
            $allAnchor.addClass("selected");
        }
        // reset the paginator
        $form.find(":hidden[name=page]").val(1);
        doSubmit();
        return false;
    });
    // pagination
    $j("span.jive-pagination a").live("click", function() {
        var page = $j(this).attr("target");
        $form.find(":hidden[name=page]").val(page);

        doSubmit();
        $j('#jive-view-favorites-form')[0].scrollIntoView(false);
        return false;
    });
    
});
