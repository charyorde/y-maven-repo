/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
function updateMembers(optionElement) {

    if (optionElement && optionElement.value != 'header' && checkUserSelections()) {
        if (optionElement.value == 'sendMessage') {
           $j('#email-group-message-form').show();
           $j('#messageSubject').focus();
        } else if(currentView == 'invitees') {

            if(optionElement.value == 'delete') {
                $j('#delete-confirm-box').show();
                $j('#resend-confirm-box').hide();
            } else if(optionElement.value == 'resend'){
                $j('#resend-confirm-box').show();
                $j('#delete-confirm-box').hide();
            }

            return;
        } else {

            if(optionElement.value == 'delete') {
                $j('#delete-confirm-box').show();
                $j('#resend-confirm-box').hide();
                return;
            }

            finishFormSubmit();

            if (optionElement.value == 'export') {
                $j('#modify-members').val('header');
            }
            return;
        }
    } else {
        $j('#modify-members').val('header');
    }
}

function doMemberAction() {
    $j('#delete-confirm-box').hide();

    finishFormSubmit()
}

function doInviteAction() {
    $j('#delete-confirm-box').hide();
    $j('#resend-confirm-box').hide();

    finishFormSubmit();
}

function finishFormSubmit() {
    if (numPages > 1) {
        paginate($j('#paginationStart').val(), $j('#paginationStart').val());
    }
    else
    {
        $j('#form-select-members').each(function() {
            this.submit();
        });
    }
}

function paginate(startIndex, oldStartIndex) {
    var inputs = [
        'start',
        'oldStart',
        'numResults',
        'searchFilter',
        'sort',
        'ascending'
    ];

    $j('#form-select-members [name=start]').val(startIndex);
    $j('#form-select-members [name=oldStart]').val(oldStartIndex);

    // Enable each of the form inputs.
    $j('#form-select-members').find('input').filter(function() {
        return $j.inArray(this.name, inputs) >= 0;
    }).prop('disabled', false);

    $j('#form-select-members').each(function() {
        this.submit();
    });
}

function totalMembersSelected() {
    return $j('[name=selectedMembers]:checked').length;
}

function selectAll(check) {
    if (check) {
        $j('[name=selectedMembers]:enabled').prop('checked', true);
    } else { 
        $j('[name=selectedMembers]:enabled').prop('checked', false);
    }
    updateTotal();
}

function activateSelectAll() {
    if (allSelected()) {
        $j('#form-select-all').prop('checked', true);
    } else {
        $j('#form-select-all').prop('checked', false);
    }
}

function allSelected() {
    return $j('[name=selectedMembers]:enabled:not(:checked)').length === 0;
}

function updateTotal() {
    $j('#total-members-selected').html($j('<strong/>').text(totalMembersSelected()));
    updateConfirmBoxes();
    activateSelectAll();
}

function updateConfirmBoxes() {
    $j('#total-selected-for-delete').text(totalMembersSelected());
    $j('#total-selected-for-resend').text(totalMembersSelected());
}

$j(document).ready(function() {
    var colHeaderSort, colHeaderOrder,
        desc = 0, asc = 1,
        defaultSortCol = currentView == 'invitees' ? 'inviter' : 'role',
        table = $j('#group-members-table'),
        columnMap = {
            name: '#jive-sgroup-name',
            inviter: '#jive-sgroup-inviter',
            role: '#jive-sgroup-role',
            dateInvited: '#jive-sgroup-invitedate',
            inviteStatus: '#jive-sgroup-invitestatus',
            status: '#jive-sgroup-status',
            joined: '#jive-sgroup-joindate',
            lastActivity: '#jive-sgroup-activity'
        };

    function sortDeclaration(/* sorts */) {
        var sorts = Array.prototype.slice.call(arguments, 0);
        return sorts.filter(function(sort, i) {
            return !sorts.slice(0, i).some(function(s) {
                return s.column == sort.column;  // Ensures only one sort declaration per column.
            });
        }).map(function(sort) {
            var thIndex = $j(columnMap[sort.column || defaultSortCol]).index();
            return [thIndex, sort.direction];
        });
    }

    function reverseColumnLookup(header) {
        return Object.keys(columnMap).filter(function(key) {
            return header.is(columnMap[key]);  // Find the key for the selector value that matches the given header.
        }).first();
    }

    // Read server-generated sort directives from hidden inputs.
    function initialSort() {
        var column, direction;
        column = $j('#paginationSort').val() || '';
        column = column.match(/none/) ? '' : column;
        direction = ($j('#paginationSortOrder').val() || '').match(/desc|false/) ? desc : asc
        return { column: column, direction: direction };
    }

    function userSelectedSort() {
        var header = table.find('[class*=headerSort]'),
            columnName, direction;

        if (header.length > 1) {
            // The name column is the forced secondary sort.  So exclude it
            // if multiple sort columns are found to get the primary sort.
            header = header.filter(':not(#jive-sgroup-name):first');
        }

        // Get the param name for the selected primary sort.
        columnName = reverseColumnLookup(header);
        direction = header.attr('class').match(/SortUp/) ? asc : desc;

        return { column: columnName, direction: direction };
    }

    // Initialize a sortable table.
    if (table[0] && table[0].children[1] && table[0].children[1].childElementCount > 0) { // If it has some data
        if ($j("#jive-sgroup-invitedate").length == 0) {
            table.tablesorter({
                // Sort by the given criteria with the 'name' column as the secondary sort.
                sortList: sortDeclaration(initialSort(), { column: 'name', direction: asc }),
                headers: { 3: { sorter: 'shortDate' } },
                textExtraction: 'complex'
            });
        } else { // Different columns on the "invite" page
            table.tablesorter({
                // Sort by the given criteria with the 'name' column as the secondary sort.
                sortList: sortDeclaration(initialSort(), { column: 'name', direction: asc }),
                headers: { 2: { sorter: 'shortDate' }, 4: { sorter: false }, 5: { sorter: false } },
                textExtraction: 'complex'
            });
        }
    }

    // Reload the page for a server-side sort when a header is clicked if there
    // is more than one page.
    if (numPages > 1) {
        table.one('sortEnd', function() {
            // `sortEnd` is triggered the first time the table loads.  We ignore
            // that first event by binding the real handler in another
            // `sortEnd` callback.
            table.bind('sortEnd', function() {
                var sort = userSelectedSort();
                $j('paginationNumResults').prop('disabled', false);
                $j('#paginationSort').prop('disabled', false).val(sort.column);
                $j('#paginationSortOrder').prop('disabled', false).val(sort.direction == asc ? 'true' : 'false');
                $j('#form-select-members').each(function() {
                    this.submit();
                });
            });
        });
    }

    updateTotal();
});

function checkUserSelections() {
    if ($j('[name=selectedMembers]').is(':checked')) {
        return true;
    } else {
        showError(selectMemberMsg);
        return false;
    }
}

function showError(msg) {
    var jiveIcon = '<span class="jive-icon-med jive-icon-redalert"></span>';
    $j('#error-box').html($j('<div/>').append(jiveIcon).append(document.createTextNode(msg))).show();
    setTimeout(function() {
        $j(document).click(hideMsgBoxes);
    }, 1000);
}

function getSelectedIDs() {
    return $j('#group-members-table [name=selectedMembers]:checked').map(function() {
        //id format - checkbox-id e.g., checkbox-2031
        return this.id.match(/-/) ? this.id.split('-').last() : this.id;
    }).toArray();
}

function showEmailInfo(msg) {
    var jiveIcon = '<span class="jive-icon-med jive-icon-info"></span>';
    $j('#email-info-box').html($j('<div/>').append(jiveIcon).append(document.createTextNode(msg)));
    setTimeout(function() {
        $j(document).click(hideMsgBoxes);
    }, 1000);
}

function showEmailError(msg, badRecipientJSON) {
    if (!msg) {
        msg = emailSendError(badRecipientJSON);
    }
    var jiveIcon = '<span class="jive-icon-med jive-icon-redalert"></span>';
    $j('#email-error-box').html($j('<div/>').append(jiveIcon).append(document.createTextNode(msg))).fadeIn();
    setTimeout(function() {
        $j(document).click(hideMsgBoxes);
    }, 1000);
}

function hideMsgBoxes() {
    if ($j('#email-info-box').length) {
        $j('#email-info-box').hide();
    }
    if ($j('#email-error-box').length) {
        $j('#email-error-box').hide();
    }
    if ($j('#error-box').length) {
        $j('#error-box').hide();
    }
    $j(document).unbind('click', hideMsgBoxes);
}

function emailMembers() {
    var title = $j('#messageSubject').val();
    var body = $j('#messageBody').val();
    var copySelf = $j('#copySelf').prop('checked');

    if (!title || !body) {
        showError(subjMsgReq);
        return;
    }
    if (!checkUserSelections()) {
        return;
    }
    var memberIDs = getSelectedIDs();
    SocialGroup.emailMembers($j('#hiddenSocialGroupID').val(), title, body, memberIDs, copySelf, {
        callback:function(result) {
            if (result.length === 0) {
                $j('#email-group-message-form').hide();
                showEmailInfo(emailSuccessMsg);
                $j('#messageSubject').val('');
                $j('#messageBody').val('');
                $j('#modify-members').val('header');
            }
            else
            {
                showEmailError(null, result);
            }
        },
        errorHandler: function(message) {
            showEmailError(emailMiscError);
        }
    });
}

//member searching
function doMemberSearch() {
    var searchText = $j('#group-members-search').val();

    $j('#no-current-results-msg').hide();
    $j('#no-other-results-msg').hide();
    $j('#other-results-msg').hide();
    $j('#no-current-listed-msg').hide();
    $j('#no-other-listed-msg').hide();


    if (numPages > 1 || prevSearch) {
        //do server-side search
        if(currentView == 'invitees') {
            window.location.href = inviteSearchUrl + '&numResults=' + numResults + '&searchFilter='
                + encodeURIComponent(searchText);
        } else {
            window.location.href = memberSearchUrl + '&numResults=' + numResults + '&searchFilter='
                + encodeURIComponent(searchText);
        }
    } else {
        var tableRows = $j('#group-members-table-body tr:has(td[class=jive-sgroup-membername])'),
            totalShown = tableRows.hide().filter(function() {
                var query = new RegExp(searchText, 'i'),
                    row = $j(this);
                return row.find('a').html().match(query) ||
                    row.find('[name=username]').val().match(query) ||
                    row.find('[name=email]').val().match(query);
                }).show().length;

        $j('#total-members-shown').text(totalShown);
        $j('#total-currentview-listed').text(totalShown);

        calculateOppositeViewSearchTotal(totalShown, searchText);
        updateOtherViewLink(searchText);
        return false;
    }
}

function updateOtherViewLink(searchParam) {
    var url = $j('#otherViewLink').attr('href');

    if (!searchParam || searchParam != searchText) {
        // Remove existing searchFilter parameter.
        url = url.replace(/searchFilter=[^&]*(&|$)/, '');
    }

    if (searchParam && searchParam != searchText) {
        url += '&searchFilter=' + encodeURIComponent(searchParam);
    }

    $j('#otherViewLink').attr('href', url);
    $j('#otherOnlyResultsLink').attr('href', url);
    $j('#otherResultsLink').attr('href', url);
    $j('#alsoOtherResultsLink').attr('href', url);
}

function calculateOppositeViewSearchTotal(defaultSearchTotal, query) {
        if(currentView)
        {
            //search for results in the other view
            if(currentView == 'invitees') {
                SocialGroup.matchingMemberCount($j('#hiddenSocialGroupID').val(), query, {
                    callback:function(result) {
                        showOtherResults(result, defaultSearchTotal, query);
                    },
                    errorHandler: function() {
                        //we treat an error as if zero results were returned
                        showOtherResults(0, defaultSearchTotal, query);
                    }
                });
            } else {
                SocialGroup.matchingInviteeCount($j('#hiddenSocialGroupID').val(), query, {
                    callback:function(result) {
                        showOtherResults(result, defaultSearchTotal, query);
                    },
                    errorHandler: function() {
                        //we treat an error as if zero results were returned
                        showOtherResults(0, defaultSearchTotal, query);
                    }
                });
            }
        }
}

function showOtherResults(resultCount, currentCount, query) {
    if (resultCount == 0) {
        $j('#no-other-results-qry').text(query);

        if (currentCount == 0) {
            if (!query || $j.trim(query) == '') {
                $j('#no-other-listed-msg').show();
            } else {
                $j('#no-other-results-msg').show();
            }
        } 
    } else {
        $j('#no-current-results-qry').text(query);

        if (currentCount == 0) {
            if (!query || $j.trim(query) == '') {
                $j('#current-other-listed-cnt').text(resultCount);
                $j('#no-current-listed-msg').show();
            } else {
                $j('#current-other-listed-cnt').text(resultCount);
                $j('#no-current-results-msg').show();
            }
        } else {
            $j('#other-results-cnt').text(resultCount);
            $j('#other-results-msg').show();
        }
    }

    $j('#current-other-results-cnt').text(resultCount);
    $j('#total-otherview-listed').text(resultCount);
}

function resetMemberSearch() {
    if (numPages > 1 || prevSearch) {
        //do server-side search

        if(currentView == 'invitees') {
            window.location.href = inviteSearchUrl + '&numResults=' + numResults;               
        } else {
            window.location.href = memberSearchUrl + '&numResults=' + numResults;
        }
    } else {
        var tableRows = $j('#group-members-table-body tr:has(td[class=jive-sgroup-membername])');
        var totalShown = tableRows.length;

        tableRows.show();

        $j('#total-members-shown').text(totalShown);
        $j('#total-currentview-listed').text(totalShown);

        $j('#no-current-results-msg').hide();
        $j('#no-other-results-msg').hide();
        $j('#other-results-msg').hide();
        $j('#no-current-listed-msg').hide();
        $j('#no-other-listed-msg').hide();
        resetOtherResultsTotal();
        updateOtherViewLink('');
        $j('#group-members-search').val('');
        return false;
    }
}

function resetOtherResultsTotal() {
    if (currentView) {
        //search for results in the other view
        if (currentView == 'invitees') {
            SocialGroup.matchingMemberCount($j('#hiddenSocialGroupID').val(), '', {
                callback:function(result) {
                    $j('#total-otherview-listed').text(result);
                },
                errorHandler: function() {
                }
            });
        }
        else
        {
            SocialGroup.matchingInviteeCount($j('#hiddenSocialGroupID').val(), '', {
                callback:function(result) {
                    $j('#total-otherview-listed').text(result);
                },
                errorHandler: function() {                  
                }
            });
        }
    }
}

function clearSearchText() {
    var searchField = $j('#group-members-search');
    if (searchField.val() == searchText) {
        searchField.val('');
    }
    hasFocusedSearchForm(true);
}

var hasFocusedSearchForm = (function() {
    var searchFormFocused = false;
    return function(focused) {
        if (typeof focused == 'undefined') {
            return searchFormFocused;
        } else {
            searchFormFocused = focused;
        }
    };
})();

$j(document).keypress(function(e) {
    if (e.keyCode == jive.Event.KEY_RETURN) {
        if(hasFocusedSearchForm()) {
            return doMemberSearch();
        }
    }
});

function displayStatusMessage(idOfDivToShow, text, icon) {
    Jive.AlertMessage(idOfDivToShow, {
        beforeStart:function() {
            $j('#' + idOfDivToShow).html(
                $j('<div/>').append(
                    $j('<span/>').addClass('jive-icon-med').addClass(icon)
                ).append(
                    document.createTextNode(text)
                )
            );
        }
    });
}


/* *** Support for editable role cells *** */

jive.namespace('groups');

jive.groups.RoleEditor = function (options) {
    var roles               = options.roles,
        socialGroupID       = options.socialGroupID,
        tokenGUID           = options.tokenGUID,
        updateMemberCellUrl = options.updateMemberCellUrl,
        i18n                = options.i18n;

    function refreshTokenGUID() {
        SocialGroup.setToken('update.sgroup.member.cell.' + socialGroupID, {
            callback: function(result) {
                tokenGUID = result;
            }
        });
    }

    function getMemberID(cell) {
        return cell.closest('tr').attr('id');
    }

    function getMemberIsPartner(cell) {
        return (cell.closest('tr').attr('partner') == "true" ? true : false) ;
    }

    function serialize(cell) {
        var input = cell.find(':input:not(:submit)'),
            data = {};
        data[input.attr('name')] = input.val();
        data.id = getMemberID(cell);
        // cell: 2, field: jive-sgroup-role, row: 2
        return data;
    }

    $j(document).ready(function() {
        $j('#group-members-table td.jive-sgroup-memberrole:not(.noedit)').click(function() {
            var cell = $j(this),
                row = cell.closest('tr'),
                origContent = cell.children(),
                isPartner = getMemberIsPartner(cell),
                roleForm = $j(jive.groups.soy.editableRoleCell({
                    roles: roles,
                    i18n: i18n,
                    isPartner: isPartner
                }));

            // Do not render the form multiple times.
            if (cell.data('editing')) {
                return false;
            } else {
                cell.data('editing', true);
            }

            roleForm.find(':submit').click(function() {
                $j.ajax({
                    url: updateMemberCellUrl + "&update.sgroup.member.cell." + socialGroupID + "=" + tokenGUID,
                    type: 'POST',
                    data: serialize(cell),
                    dataType: 'html',
                    success: function(result) {
                        refreshTokenGUID();

                        if (!result.match('cell-update-error')) {
                            var updatedVals = result.split('___'),
                                memId = updatedVals[1],
                                newRole = updatedVals[2],
                                newStatus = updatedVals[3],
                                sortableUsername = updatedVals[4];

                            if (result.match('cell-delete')) {
                                row.hide();
                            } else {
                                row.find('td[class=jive-member-status-cell]').each(function() {
                                    var statusCell = $j(this);
                                    SocialGroup.getMemberStatus(memId, {
                                        callback:function(result) {
                                            var statusSpan = statusCell.find("span:first");
                                            statusSpan.text(getMemberStatusText(result));
                                            statusSpan.attr('id', newStatus + '__' + newRole + '__' + sortableUsername);
                                        }
                                    });
                                });
                            }
                        }

                        cell.data('editing', false);
                        cell.html(result);
                    },
                    error: function() {
                        alert(jive.groups.soy.genericErrorMsg({ i18n: i18n }));
                    }
                });

                return false;
            });

            roleForm.find('.editor_cancel').click(function() {
                cell.data('editing', false);
                cell.html(origContent);
                return false;
            });

            cell.html(roleForm);

            return false;
        });
    });
};
