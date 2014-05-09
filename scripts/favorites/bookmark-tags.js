(function() {
    if (___bookmarkTagsInitialized) {
        return;
    }
    $j(document).delegate(".jive-form-taglist ul li a", "click", function() {
        var $input = $j(this).parents(".jive-form-taglist").siblings(":text");
        var tags = $input.val().split(" ");
        var found = -1;
        for (var i = 0; i < tags.length; i++) {
            if (tags[i] != $j(this).text()) {
                continue;
            }
            found = i;
            break;
        }

        if (found >= 0) {
            $input.val($j.grep(tags, function (tag, i) {
                return i != found;
            }).join(" "));
        }
        else {
            if ($input.val().length > 0) {
                $input.val($input.val() + " " + $j(this).text());
            }
            else {
                $input.val($j(this).text())
            }
        }
        updateSelectedTags($input);
        return false;
    });

    $j(".jive-bookmark-form :text[name=tags]").each(function() {
        updateSelectedTags($j(this));
    }).delayedObserver(function() {
        updateSelectedTags($j(this));
    }, 0.8, {
        // the text field can be updated by other means then the user
        // typing in it so we don't want to restrict changes
        condition: function() {
            return true;
        }
    });

    function updateSelectedTags($input) {
        $j(".jive-form-taglist ul li a").removeClass("jive-tag-selected");
        var tags = $input.val().split(" ");
        for (var i = 0; i < tags.length; i++) {
            $j(".jive-form-taglist ul li a").filter(function() {
                return $j(this).text() == tags[i];
            }).addClass("jive-tag-selected");
        }
    }
})();
var ___bookmarkTagsInitialized = true;
