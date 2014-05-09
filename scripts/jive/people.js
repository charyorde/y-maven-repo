/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true forin:true */
/*extern jive $j */
/*extern searchingText ProfileFieldValueStats cacheKey usingPrefix usingTag linkThreshold resultTagCloudURL */

var acVals = {};
var acFuncs = {};
var filterIndexMap = {};
var filterTypeMap = {};
var appliedFilters = [];
var searchFieldFocused = false;

function doSearch(btn) {
    //if someone has focused on the search field, and clicks the search button, set sort to relevance (value = '')
    $j('#sort-field option').val('');
    $j(btn).prop('disabled', true);
    $j(btn).val(searchingText);
    $j(btn).closest('form').submit();
    $j(window).unload( function () { $j(btn).prop('disabled', false); } );
}

function showOptions() {
    $j('#jive-people-search-options').toggle();
}

function getProfileFieldValues(q, nonSelectedLabel) {
    ProfileFieldValueStats.caclulateFacets(q, {
        callback:function(stats) {
            if ($j('#sidebar-online-count').length > 0 && (stats.onlineCount > 0)) {
                $j('#sidebar-online-count').text(stats.onlineCount);
                $j('#sidebar-online-count-list').show();
            }
            if ($j('#sidebar-recent-count').length > 0 && (stats.newestCount > 0)) {
                $j('#sidebar-recent-count').text(stats.newestCount);
                $j('#sidebar-recent-count-list').show();
            }
            
            if (!usingPrefix) {
                // For each prefix-letter span, wrap the displayed letter in a link if it is not already a link.
                stats.prefixLetters.forEach(function(letter) {
                    $j('.prefix-letter:contains('+ letter.toUpperCase() +'):not(:has(a))').each(function() {
                        var a = $j('<a/>', { href: '#', text: letter.toUpperCase() })
                            .click(submitPrefix.partial(letter.toLowerCase()));
                        $j(this).html(a);
                    });
                });
            }

            for (var fieldID in stats.resultMap) {
                if ($j.inArray(fieldID, appliedFilters) == -1) {
                    var fType = filterTypeMap['f' + fieldID];
                    var fIndex = filterIndexMap['f' + fieldID];
                    var valueCountMap = stats.resultMap[fieldID];
                    var fName = 'filter-field-' + fieldID;
                    var field = $j('[id="'+ fName +'"]');
                    var val, safeVal;
                    var hasValues = false;

                    //deal with generic select fields
                    if (field.find('option').length > 0) {
                        //key is field ID
                        field.html('');
                        field.append($j('<option/>', { value: "", text: nonSelectedLabel }));
                        for (val in valueCountMap) {
                            if (val) {
                                hasValues = true;
                                field.append($j('<option/>', {
                                    value: val,
                                    text: val + " (" + valueCountMap[val] + ")"
                                }));
                            }
                        }
                    }
                    else if (acFuncs[fIndex]) {
                        acVals[fIndex] = [];
                        for (val in valueCountMap) {
                            var safeFuncVal = jive.util.escapeHTML(val.split('|').first());
                            if (safeFuncVal) {
                                hasValues = true;
                                acVals[fIndex].push(safeFuncVal);
                            }
                        }
                        if (acVals[fIndex].length > 0) {
                            acFuncs[fIndex]();
                        }
                    }

                    // dont display field if empty
                    if (!hasValues) {
                        $j('#filter-table-row-' + fieldID).hide();
                    }
                }
            }

            convertSelectsIntoLinks();
            populateTagCloud(q);
        },
        errorHandler:function(message) {
            if (console){
                console.log(message);
            }
            $j("#filter-sidebar-body").hide();
        },
        timeout: timeout
    });
}

function convertSelectsIntoLinks() {
    $j('#select.filterOption').each(function() {
        var select = $j(this),
            opts = select.find('option');
        if (opts.length > 1) {      //there will always be the "select one" option
            if (opts.length - 1 <= linkThreshold) {
                select.replaceWith(
                    $j('<span/>').append(
                        $j('<input/>', { type: 'hidden', id: select.attr('id'), name: select.attr('name') })
                    ).append(
                        opts.filter(function() {
                            return !!this.value;  // Filter out options with empty values.
                        }).map(function() {
                            // Translate each option into a link with the same text.
                            return $j('<a/>', { href: '#', text: $j(this).text() })
                                .click(submitLink.partial(select.id, this.value));
                        }).toArray().reduce(function(links, link) {
                            // Combine links into a single structure separated by commas.
                            return links.after(document.createTextNode(', ')).after(link);
                        })
                    )
                );
            }
        }
    });
}

function submitLink(selID, value) {
    $j('[id="'+ selID +'"]').val(value);
    submitForm();
}

function submitPrefix(letter) {
    $j('#profilesearchform [name=prefix]').val(letter);
    $j('#profilesearchform [name=view]').val('alphabetical');
    submitForm()
}

function submitTag(tag) {
    $j('#profilesearchform [name=tag]').val(tag);
    submitForm();
}

function clearFilter(fieldID) {
    $j('[id="filter-field-'+ fieldID +'"]').val('');
    $j('[id="filter-field-'+ fieldID +'.minValue"]').val('');
    $j('[id="filter-field-'+ fieldID +'.maxValue"]').val('');
    submitForm()
}

function clearPrefix() {
    $j('#filter-prefix').val('');
    submitForm()
}

function clearQuery() {
    $j('#query').val('');
    submitForm()
}

function clearTag() {
    $j('#tag').val('');
    submitForm();
}

function clearView() {
    $j('#profilesearchform-view').val('');
    submitForm();
}

function clearOnline() {
    $j('#online-filter').val('');
    if ($j('#profilesearchform-view').val() == 'online') {
        clearView();
    } else {
        submitForm();
    }
}

function clearCommunity() {
    $j('community').val('');
    submitForm();
}

function clearRecentlyAdded() {
    $j('#recently-added-filter').val('');
    if ($j('#profilesearchform-view').val() == 'newest') {
        clearView();
    } else {
        submitForm();
    }
}

function submitForm() {
    $j('#profilesearchform').submit();
}

function populateTagCloud(q) {
    $j.ajax({
        url: resultTagCloudURL + "?" + $j.param({ queryEncoded: q }),
        cache: false,
        success: function(data) {
            $j('#results-tagcloud').html(data);
            $j('#results-tagcloud').show();
        }
    });
}
