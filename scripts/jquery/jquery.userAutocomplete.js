    /*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */    /*
* $ User Autocomplete
* By: Nick Hill
* Version : 1.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function userAutocompleteLoader($) {

    $.fn.userAutocomplete = function(options) {
        var defaults = {
            loaded:function(){},
            usersAdded:function(){},
            userAdded:function(){},
            userRemoved:function(){},
            userParam: 'user',
            userValue: 'userID',  // Determines which attribute of the user will be submitted to the server on form submission.
            startingUsers: [],
            multiple: false,
            large: false,
            emailAllowed: false,
            userAllowed: true,
            inlineRemoval: false,
            browseModal: true,
            document: $j(document),  // Allows user-browse modal to be displayed in top-level window.
            existingModal: {
                modalContainer: '',
                prevContainer: '',
                browseContainer: ''
            },
            minInputLength: 2,
            minUsers : 0,
            urls: {
                userAutocomplete: _jive_base_url + '/user-autocomplete.jspa',
                browseModal: _jive_base_url + '/user-autocomplete-modal.jspa'
            },
            i18nKeys: {
                remove: 'Remove',
                add: 'Add',
                change: 'Change',
                browse: 'Select Users'
            }
        };

        var o = $.extend(defaults, options);
        console.log('this is me3');

        var useExistingModal = o.existingModal.modalContainer != '' && o.existingModal.prevContainer != '' && o.existingModal.browseContainer != '';

        if (o.browseModal && !useExistingModal) {
            if (o.document.find('#user-autocomplete-modal-container').length == 0) {
                o.document.find('body').append(
                '<div class="jive-modal" id="user-autocomplete-modal-container" style="display: none;">' +
                    '<h2 class="jive-modal-title">' + o.i18nKeys.browse + '</h2>' +
                    '<a href="#" class="jive-modal-close-top jive-close close">Close</a>' +
                    '<div id="user-picker-modal-content" class="jive-modal-content"></div>' +
                '</div>');
            }
        }

        return Array.prototype.slice.call(this.map(function() {

            var $that = $(this); // passed in ele

            $that.addClass('jive-chooser-input jive-form-textinput-variable');

            $that.attr('autocomplete', 'off');

            var $hiddenUserIDs = $('<input type="hidden" name="'+ o.userParam +'"/>');

            // create results and selected block
            var $results = $('<div class="jive-chooser-autocomplete"></div>').hide(); // create results block
            var $selected = $('<ul class="jive-chooser-list j-people-list clearfix"></ul>').hide(); // create selected block

            if (o.large) {
                $selected.addClass("user_auto_large");
            } else if (o.multiple) {
                $selected.addClass("user_auto_multiple");
            }

            $that.before($hiddenUserIDs); // append hidden type and id inputs before input
            $that.after($selected).after($results); // append selected and results block after input

            // variables
            var userAutocompleteIndex = 0;
            var userAutocompleteEvent;

            /* -- Cleanup -- */
            /* De-reference any DOM elements referenced in closed-over variables to prevent memory leaks. */

            $(window).unload(function() {
                $hiddenUserIDs = null;
                $results = null;
                $selected = null;
                $that = null;
            });

            /* -- Functions -- */
            /* Lots of utility functions here. */


            var observeUserAutocompleteQuery = function(event) {
                switch(event.keyCode) {
                    case $.ui.keyCode.UP:
                        selectIndex(userAutocompleteIndex - 1);
                        return false;
                    case $.ui.keyCode.DOWN:
                        selectIndex(userAutocompleteIndex + 1);
                        return false;
                    case $.ui.keyCode.ENTER:
                        clearUserAutocompleteEvent();
                        $.stop(event, true, true);
                        if (userAutocompleteIndex > 0) {
                            loadSelectedIndex();
                        }
                        return false;
                    case $.ui.keyCode.ESCAPE:
                        clearUserAutocomplete();
                        return false;
                    case $.ui.keyCode.LEFT:
                    case $.ui.keyCode.RIGHT:
                    case $.ui.keyCode.TAB:
                    case $.ui.keyCode.HOME:
                    case $.ui.keyCode.END:
                    case $.ui.keyCode.PAGE_UP:
                    case $.ui.keyCode.PAGE_DOWN:
                        return false;
                }
                clearUserAutocompleteEvent();
                userAutocompleteEvent = setTimeout(function() {executeUserAutocomplete();}, 400);
            };

            var onFocus = function() {
                setTimeout(function() {executeUserAutocomplete();}, 250);
            };

            var onBlur = function() {
                // needed to make click events working
                setTimeout(function() {clearUserAutocomplete();}, 250);
            };

            var clearUserAutocomplete = function() {
                $results.html('').hide();
            };

            var clearUserAutocompleteEvent = function() {
                if (userAutocompleteEvent) {
                    clearTimeout(userAutocompleteEvent);
                }
            };

            var clickSelection = function(event) {
                userAutocompleteIndex = parseInt($(this).parent().attr('id').split('_')[1]);
                loadSelectedIndex();

                event.stopPropagation();
                return false;
            };

            var loadSelectedIndex = function() {
                var elem = $results.find('#user-autocomplete-index_' + userAutocompleteIndex)[0];
                if (elem && $(elem).children("a")[0]) {
                    var anchor = $($(elem).children("a")[0]),
                        userID = anchor.attr('id').split('_')[1],
                        displayName = anchor.find('span').text();
                    var user = {
                        userID: userID,
                        userName: (anchor.find('img').attr('src').match(/\/people\/([^\/]+)\//) || [])[1],
                        avatar: anchor.find('img'),
                        displayName: displayName,
                        email: (userID && userID != 'email') ? undefined : displayName
                    };

                    addSelection([user]);

                    // empty out results
                    $that.val('');
                    $results.html('').hide();
                }
            };

            var addSelection = function(users) {
                if (!$.isArray(users)) {
                    users = [users];
                }
                users.forEach(function(user) {
                    addEachSelection(user);
                });

                o.usersAdded(users);

                handleMinUsers();

            };

            var handleMinUsers = function() {
                var numIDs = 0;
                if ($.trim($hiddenUserIDs.val()) != '') {
                    numIDs = $hiddenUserIDs.val().split(',').length;
                }
                 if (numIDs > o.minUsers) {
                    $selected.find('.user-autocomplete-remove').parent().show();
                 }
                else if (numIDs == o.minUsers) {
                    $selected.find('.user-autocomplete-remove').parent().hide();
                }
            };

            var addEachSelection = function(user) {

                var userValue = user.email || user[o.userValue];
                if (typeof userValue == 'undefined') {
                    return false;
                }

                if (o.multiple) {
                    // set hidden values
                    var userIDs = [];
                    if ($.trim($hiddenUserIDs.val()) != '') {
                        userIDs = $hiddenUserIDs.val().split(',');
                    }

                    if ($.inArray(userValue, userIDs) == -1) {
                        userIDs.push(userValue);
                        $hiddenUserIDs.val(userIDs.join(','));

                        var $wrapper = $('<li class="user-autocomplete-selection clearfix user-autocomplete-selection_' + user.userID + '"></li>');
                        var displayName = $('<span/>').text(user.displayName).html();
                        if (o.large) {
                            $wrapper.append('<a href="#" class="user-autocomplete-remove">' + displayName + '</a><a href="#" class="user-autocomplete-add" style="display:none">' + displayName + '</a>');
                        } else {
                            if(user.avatar) {
                                $wrapper.append($(user.avatar).clone());
                            }
                            $wrapper.append('<span><span>' + displayName + '</span> <em>(<a href="#" class="user-autocomplete-remove">' + o.i18nKeys.remove + '</a>)</em><em style="display:none;">(<a href="#" class="user-autocomplete-add">' + o.i18nKeys.add + '</a>)</em></span>');
                        }
                        $selected.append($wrapper);

                    }

                    $that.focus();

                } else {
                    // set hidden values
                    $hiddenUserIDs.val(userValue);

                    // disable and hide input
                    $that.hide().prop('disabled', true);

                    if (o.browseModal) {
                        $browse.hide();
                    }

                    // show selected display
                    var $wrapperSingle = $('<li class="user-autocomplete-selection clearfix user-autocomplete-selection_' + user.userID + '"></li>');
                    var displayName = $('<span/>').text(user.displayName).html();
                    if(user.avatar) {
                        $wrapperSingle.append($(user.avatar).clone());
                    }
                    $wrapperSingle.append('<span><span>' + displayName + '</span> <em>(<a href="#" class="user-autocomplete-remove">' + o.i18nKeys.change + '</a>)</em></span>');
                    $selected.html($wrapperSingle);
                }

                $selected.find('.user-autocomplete-remove').click(removeSelection);
                $selected.find('.user-autocomplete-add').click(unRemoveSelection);

                $selected.show();

                o.userAdded(user);
            };



            var reset = function() {
                // empty out selected and hide
                $selected.html("").hide();

                // reset hidden values
                $hiddenUserIDs.val("");
            };

            var removeSelection = function(event) {
                if (o.multiple) {

                    var selectedID = $(this).parents('li:eq(0)').attr('class').split('_')[1];

                    if (selectedID == 'email') {
                        selectedID = $(this).parents('span:eq(0)').find('span:eq(0)').text();
                    }

                    // update hidden values
                    var userIDs = $hiddenUserIDs.val().split(',');
                    userIDs.splice($.inArray(selectedID, userIDs), 1);
                    $hiddenUserIDs.val(userIDs.join(','));

                    handleMinUsers();

                    if(o.inlineRemoval){
                        var $wrapper = $(this).parents('li:eq(0)');

                        $($wrapper).find(".user-autocomplete-remove").parents('em').hide();
                        $($wrapper).find(".user-autocomplete-add").parents('em').show();
                        $(this).parents('span:eq(0)').find('span:eq(0)').addClass("excluded");
                    }else{
                        $(this).parents('li:eq(0)').remove();
                         if (userIDs.length == 0) {
                            $selected.hide();
                        }
                    }
                } else {
                    reset();

                    // enable and show input
                    $that.prop('disabled', false).show();

                    if (o.browseModal) {
                       $browse.show();
                    }
                }

                event.stopPropagation();
                $that.focus();

                o.userRemoved(selectedID);

                return false;
            };

            var unRemoveSelection = function(event) {
                if (o.multiple) {

                    var selectedID = $(this).parents('li:eq(0)').attr('class').split('_')[1];

                    if (selectedID == 'email') {
                        selectedID = $(this).parents('span:eq(0)').find('span:eq(0)').text();
                    }

                    // update hidden values
                    $hiddenUserIDs.val($hiddenUserIDs.val() + "," + selectedID);
                    var $wrapper = $(this).parents('li:eq(0)');
                    $($wrapper).find(".user-autocomplete-add").parents('em').hide();
                    $($wrapper).find(".user-autocomplete-remove").parents('em').show();
                    $(this).parents('span:eq(0)').find('span:eq(0)').removeClass("excluded");
                    return false;
                }
                event.stopPropagation();
            };

            var executeUserAutocomplete = function() {
                var query = $that.val();

                if (query.length >= o.minInputLength) {
                    query = query + '*';
                    $results.html('');
                    $results.load(o.urls.userAutocomplete, {
                        query: query,
                        emailAllowed: o.emailAllowed,
                        userAllowed: o.userAllowed
                    }, function(){
                        if ($results.html() != '') {
                            var top = ($that.offset().top - $that.offsetParent().offset().top) + $that.outerHeight();
                            var left = $that.offset().left - $that.offsetParent().offset().left;
                            $results.css({'top': top, 'left': left});
                            $results.width($that.width());
                            $results.find('.user-autocomplete-item').mouseover(function() { $(this).addClass('hover'); });
                            $results.find('.user-autocomplete-item').mouseout(function() { $(this).removeClass('hover'); });
                            $results.find('.user-autocomplete-item A').click(clickSelection);

                            $results.show();
                            // set index to first result so enter works
                            selectIndex(1);
                        }
                    });
                }
                else {
                    clearUserAutocomplete();
                }

            };

            var selectIndex = function(index) {
                if (index > 0) {
                    var elem = $results.find('#user-autocomplete-index_' + index).addClass("hover").get(0);
                    if (elem) {
                        $results.find('li.hover:not(#user-autocomplete-index_' + index +')').removeClass('hover');
                        //elem.scrollIntoView(false);
                        userAutocompleteIndex = index;
                    }
                }
                else {
                    $results.find('li.hover').removeClass('hover');
                    //$that[0].scrollIntoView(false);
                    userAutocompleteIndex = 0;
                }
            };

            var removeBrowseModal = function() {
                if (!useExistingModal) {
                    o.document.find('#user-picker-modal-content').prev('.jive-close').trigger('click');
                } else {
                    $(o.existingModal.modalContainer).scrollTo($(o.existingModal.prevContainer), 500);
                }
            };

            var loadBrowseModal = function(event) {
                console.log('this is me2');
                $.ajax({
                    url: o.urls.browseModal,
                    data: {
                        multiple: o.multiple
                    },
                    success: function(html) {
                        if (!useExistingModal) {
                            o.document.find('#user-picker-modal-content').html(html);

                            o.document.find('#user-picker-modal-content')
                            .unbind('select')
                            .bind('select', function(event/*, selected */) {
                                var selected = Array.prototype.slice.call(arguments, 1);
                                addSelection(selected);
                                removeBrowseModal();
                            });
                                                 console.log('this is me');
                            o.document.find('#user-autocomplete-modal-container').lightbox_me({
                                // Position modal in front of the RTE content picker.
                                zIndex: 300015,
                                onClose: function() {
                                    o.document.find('#user-autocomplete-modal-container .jive-modal-content').html('');
                                }
                            });

                        } else {
                            $(o.existingModal.browseContainer).html(html);

                            $(o.existingModal.browseContainer)
                            .unbind('select')
                            .bind('select', function(event/*, selected */) {
                                var selected = Array.prototype.slice.call(arguments, 1);
                                addSelection(selected);
                                removeBrowseModal();
                            });

                            $(o.existingModal.modalContainer).scrollTo($(o.existingModal.browseContainer), 500);
                        }
                    }
                });

                event.stopPropagation();
                return false;
            };

            // this is used to trigger an add selection event so external javascript can trigger an event to add
            // a user to the autocomplete
            var addSelectionEvent = function(e, user) {
                addSelection(user);
            };

            // this is used to trigger a remove selection event so external javascript can trigger an event to
            // remove a user from the autocomplete
            //
            // NOTE: this function currently only works for removing userIDs. It has not been coded to work for removing
            // emails with this special event hook (not needed anywhere at this time).
            var removeSelectionEvent = function(event, users) {
                for(var i=0;i<users.length;i++){
                    $selected.find('li.user-autocomplete-selection_' + users[i].id + ' A.user-autocomplete-remove').trigger('click');
                }
            };

            if (o.browseModal && o.userAllowed) {
                var $browse = $('<a href="#" class="jive-chooser-browse">'+ o.i18nKeys.browse +'</a>');
                $that.after($browse);
                $browse.click(loadBrowseModal);
            }

            // load starting values, if exists
            if (o.startingUsers.length > 0) {

                // hide type ahead field, if not multiple
                if (!o.multiple) {
                    addSelection([o.startingUsers[0]]);
                } else {
                    o.startingUsers.forEach(function(user) {
                        addSelection([user]);
                    });
                }
            }

            /* Bind Events */
            $that.keydown(function(e) { if (e.keyCode == $.ui.keyCode.ENTER) $.stop(e, true, true);}).keyup(observeUserAutocompleteQuery);
            $that.blur(onBlur);
            $that.focus(onFocus);

            // bind custom events so external javascript can execute these functions
            $that.bind('addSelection', addSelectionEvent);
            $that.bind('removeSelection', removeSelectionEvent);
            $that.bind('reset', reset);

            // If in email-only mode allow a single email address to be
            // submitted without having to click on the autocomplete
            // suggestion.  See CS-21467.
            if (o.emailAllowed && !o.userAllowed) {
                $hiddenUserIDs.closest('form').submit(function() {
                    addSelection({ email: $.trim($that.val()) });
                });
            }

            o.loaded();

            handleMinUsers();

            return {
                add: addSelection,
                values: function() {
                    return $hiddenUserIDs.val().split(/\s*,\s*/);
                }
            };
        }), 0);
    }
}

userAutocompleteLoader(jQuery);
