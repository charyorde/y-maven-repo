function PublishBarTagSetSupport( tagInput, tagSets ) {

    var that = this;

    this.tagInput = $j(tagInput);
    this.tagSets = [];

    this.suggestCategories = function() {
        if (this.tagSets.length > 0) {
            var selectedTags = this.tagInput.val().toLowerCase().split(/\s+/);
            $j(this.tagSets).each(function() {
                var tagSet = this;
                var tags = tagSet.tags;
                var removeCategorySelection = true;

                // check if at least one of the selected tags is in this tagsets list of recommended tags
                $j(selectedTags).each(function(index, value) {
                    if ($j.trim(value) != '') {
                        if ($j.inArray(value, tags) != -1) {
                            removeCategorySelection = false;
                            return false; // break out of the each loop
                        }
                    }
                });

                if(removeCategorySelection){
                    that.undoHighlight($j("#j-category_" + tagSet.id));
                } else {
                    that.doHighlight($j("#j-category_" + tagSet.id));
                }
            });
        }
    };

    this.doHighlight = function(category) {
        $j(category).closest('span').find('img').show();
        $j(category).closest('span').addClass('jive-category-highlight');
    };

    this.undoHighlight = function(category) {
        $j(category).closest('span').removeClass('jive-category-highlight');
        $j(category).closest('span').find('label').find("img").hide();
    };

    this.showToolTip = function(categoryImg) {
        var category = $j(categoryImg).closest('span').find('input');
        $j('#jive-note-category-tags').html(category.attr('data-tags'));
        $j('#jiveTT-note-suggest').show();
        return false;
    };

    this.hideToolTip = function(){
        $j('#jiveTT-note-suggest').hide();
        $j('#jive-note-category-tags').html('');
        return false;
    };

    this.updateTagSets = function() {
        var selectedCats = [];
        $j('#jive-compose-categories').find('.j-category-input').each(function() {
            var category = $j(this);
            if (category.prop('checked')) {
                selectedCats.push(category.val());
            }
        });
        $j('#j-publishbar-categories').val(selectedCats.join(','));
    };

    // load up list of tag sets
    $j('#jive-compose-categories').find('.j-category-input').each(function() {
        that.tagSets.push({id: $j(this).val(), tags: $j(this).attr('data-tags').split(',')});
    });

    // set listeners for click events on tag sets (to set hidden input)
    $j('#jive-compose-categories').find('.j-category-input').click(function() {
        that.updateTagSets();
    });

    $j('#js-publishbar-tagsets .jiveTT-hover-suggest')
    .mouseover(function() {
        that.showToolTip($j(this));
    }).mouseout(function() {
        that.hideToolTip();
    });

    // init
    this.suggestCategories();
    this.updateTagSets();
}
