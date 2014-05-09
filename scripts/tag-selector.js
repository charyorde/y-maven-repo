/*
 * $RCSfile$
 * $Revision: 30626 $
 * $Date: 2006-05-30 09:55:32 -0700 (Tue, 30 May 2006) $
 *
 * Copyright (C) 1999-2008 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j TagSet Community ContentFilterHandler */
/*globals tagHeight ac */

/*
 * Javascript for tag input UI. These functions are used on the document create / edit page,
 the forum message create / edit page and the blog post create / edit page.
 */

/**
 * @depends path=/resources/scripts/jquery/jquery.tagAutocomplete.js
 */
function updateTagSets() {
    if ($j('#jive-taggroups-active-container') && $j('#jive-taggroups-active-container').length > 0) {
        var tagSetNames = $j('.jive-tag-selected').map(function() {
            return $j(this).attr('name');
        }).filter(function(name) {
            return name != 'populartag';
        }).unique();

        if (tagSetNames.length > 0) {
            $j('#jive-taggroups-active-container').show();
            $j('#jive-taggroups-active').text(tagSetNames.join(", "));
        } else {
            $j('#jive-taggroups-active').text('');
            $j('#jive-taggroups-active-container').hide();
        }
    }
}

// Highlight or un-highlight popular tag links based on the value of the tags
// input field.
function highlightSelectedTags($form) {

    var selected = $form.find('#jive-tags').val().split(/\s+/),
        popularTags = $form.find('[class^=jive-tagname-]');

    if(selected && popularTags) {
        popularTags.removeClass('jive-tag-selected').addClass('jive-tag-unselected');
        selected.forEach(function(tag) {
            popularTags.filter(function() {
              return $j(this).hasClass('jive-tagname-' + tag);
            }).addClass('jive-tag-selected').removeClass('jive-tag-unselected');
        });
    }    
}

// onClick callback for popular tag links.  When clicked either adds the given
// tag to the selected list or removes it, depending on whether the tag is
// already selected.
function swapTag(tag) {
    var $form     = $j(tag).closest('#jive-compose-tags-form'),
        $tagInput = $form.find('#jive-tags'),
        selected  = $tagInput.val().split(/\s+/).filter(function(t) { return !!t; }),
        tagName   = typeof tag == 'string' ? tag : $j(tag).text();

    if ($j.inArray(tagName, selected) != -1) {
        // If the given tag is already selected then remove it from the list.
        $tagInput.val(selected.filter(function(t) {
            return t != tagName;
        }).join(' '));
    } else {
        // If the given tag is not already selected then add it to the end of
        // the list.
        $tagInput.val(selected.concat(tagName).join(' '));
    }

    highlightSelectedTags($form);
    updateTagSets();
}

function swapTagSet(tagSetID) {
    // hide the currently displayed tag set
    $j("#jive-taggroups-container div").hide();

    if (tagSetID) {
        $j('#jive-taggroup-'+tagSetID).show();
    }
}

$j(document).ready(function() {
    var completions = typeof(Community) != "undefined" ? Community.feed : {};

    // Initialize an autocomplete field for popular tags.  Tags come from the
    // `Community.feed` object, if it exists.  That object is assumed to be of
    // the format, `{ tagA: tagACount, tagB: tagBCount, ... }`.
    $j('#jive-tags').tagAutocomplete();


    activatePopularTagsPolling();
});

// Used by tab lists in Places to append category information for cross-tab navigation
// originalLink is expected to be the &lt;a&gt; element
function updateURLWithCategoryInfo(originalLink) {
    var newURL = $j(originalLink).attr("href");
    //if (typeof(ContentFilterHandler) != "undefined" && ContentFilterHandler.params != null && ContentFilterHandler.params.tagSet != null) {
    if (typeof(ContentFilterHandler) != "undefined" && ContentFilterHandler.contentLoader !== null && ContentFilterHandler.contentLoader.get_parameters().tagSet !== null) {
        newURL = newURL + "#/?tagSet=" + ContentFilterHandler.contentLoader.get_parameters().tagSet;
    }
    return newURL;
}

// Updates highlighting on popular tag links whenever the select tags
// value changes.
function activatePopularTagsPolling(tagsInputSelector) {
	
	var tagField = tagsInputSelector || "#jive-tags";
	var composeTagsForm = $j('#jive-compose-tags-form');
    if (composeTagsForm && composeTagsForm.length > 0) {
        window.setInterval(function() {
        	highlightSelectedTags($j(tagField).closest('#jive-compose-tags-form'));
        }, 800);
    }
    updateTagSets();
}

// Hook into click events on tabs in Places
$j(document).ready(function() {
    $j('.jive-body-tab.jive-content-tab a').click(function() {
        window.location = updateURLWithCategoryInfo(this);
        return false;
    });
});
