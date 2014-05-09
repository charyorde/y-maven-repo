/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('UserGroupPicker');

/**
 * @depends template=jive.UserPicker.soy.searching
 * @depends template=jive.UserPicker.soy.renderModalLoading
 * @depends path=/resources/scripts/jquery/jquery.form.js
 */
jive.UserGroupPicker.SelectGroupsView = function() {
    var self = {},
        $content,
        $parent = $j(this).closest('.jive-modal:visible'), // find any other modals so lightbox_me can hide them
        isMultiple = false,
        totalGroups = 0,
        selectedGroups = {},
        browseModalUrl = _jive_base_url + '/group-autocomplete-modal.jspa';

    // private

    function addGroup(group) {
        // make sure we're only adding this group once, just in case
        if (!selectedGroups.hasOwnProperty(group.groupID)) {
            selectedGroups[group.groupID] = group;
            ++totalGroups;
            updateTotalGroups();
            updateGroupNameDisplay();
            !isMultiple && complete();
        }
    }

    function updateCheckboxes() {
        var query = Object.keys(selectedGroups).join(', #groupChk-');
            query.length && (query = '#groupChk-' + query);

        $j(query).prop('checked', true).each(function() {
            $j(this).closest('tr').addClass('selected');
        });
    }

    function updateGroupNameDisplay() {
        var displayNames = [];
        $j.each(selectedGroups, function() {
            displayNames.push(this.displayName);
        });

        $j('#preview').text(displayNames.join(', ')); // TODO shouldn't this be i18n'd?
    }

    function removeGroup(group) {
        delete selectedGroups[group.groupID];
        --totalGroups;
        updateTotalGroups();
        updateGroupNameDisplay();
        $j('#groupChk-' + group.groupID).closest('tr').removeClass('selected');
    }

    function extract(target, key) {
        var result = jive.util.extractDataAttributes(target);
        return key ? result[key] : result;
    }
    
    function attachEvents() {

        // add groups
        $content.delegate('#grouppicker-addGroupsButton', 'click', function(e) {
            e.preventDefault();
            !$j(this).hasClass('j-disabled') && complete();
        });

        // generic click events
        $content.delegate('#group-picker-modal-content a:not([data-action])', 'click', function(e) {
            e.preventDefault();
            get($j(this).attr('href')).addCallback(handleResponse);
        });

        // search form pagination
        $content.delegate('#group-picker-modal-content a[data-action=goToPage]', 'click', function(e) {
            e.preventDefault();

            $j('#profilesearchform-start').val(jive.util.extractDataAttributes(this).page);
            $content.find('form').submit();
        });

        // checkbox clicks
        $content.delegate('#group-picker-modal-content :checkbox', 'click', function() {
            var $target = $j(this),
                $container = $target.closest('.jive-table-cell-checkbox'),
                group = {
                    avatar: $j('#' + $target.val() + '-avatar').html(),
                    displayName: $container.children().not('input').html(),
                    groupID: $target.val(),
                    groupName: $container.find(':hidden').val()
                };

            this.checked ? addGroup(group) : removeGroup(group);
        });


        $content.delegate('.grouppicker-sort-link', 'click', function(e) {
            e.preventDefault();

            $j('#profilesearchform-sort').val(extract(this, 'sortType'));
            $j('#profilesearchform').submit();
        });
    }

    function attachSubmitEvents() {
        // search
        $content.find('form').ajaxForm({
            beforeSubmit: function(formData) {
                formData.push({
                    name: 'selectedGroups',
                    value: buildSelectedGroupsString()
                });
                $j('#people-search-submit').prop('disabled', true);
                $j('#people-search-submit').val(jive.UserPicker.soy.searching());
            },
            success: function(html) {
                handleResponse(html);
            }
        });
    }

    function buildSelectedGroupsString() {
        var groupIds = [];
        $j.each(selectedGroups, function(id) {
            return groupIds.push(id);
        });

        return groupIds.join(',');
    }

    function complete() {
        var groups = [];
        $j.each(selectedGroups, function() {
            groups.push(this);
        });

        selectedGroups = {};
        totalGroups = 0;
        $content.find('#grouppicker-addGroupsButton').after(jive.UserPicker.soy.renderModalLoading());
        self.emit('select', { groups: groups });
    }

    function get(href) {
        var promise = new jive.conc.Promise();

        $j.get(href + '&selectedGroups=' + buildSelectedGroupsString(), promise.emitSuccess.bind(promise));

        return promise;
    }

    function handleResponse(html) {
        var $html = $j(jive.UserGroupPicker.soy.renderGroupPickerModal({ body: html }));
        $j('#group-picker-modal-content').replaceWith($html.find('#group-picker-modal-content'));
        updateTotalGroups();
        updateGroupNameDisplay();
        updateCheckboxes();
        attachSubmitEvents();
    }

    function updateTotalGroups() {
        var fn = totalGroups > 0 ? 'removeClass' : 'addClass';
        $content.find('#grouppicker-addGroupsButton')[fn]('j-disabled');
    }

    // public

    self.setOptions = function(options) {
        isMultiple = typeof(options.multiple) != "undefined" ? options.multiple : false;
        return self;
    }

    self.open = function() {
        $j.ajax({
            url: browseModalUrl,
            data: {
                multiple: isMultiple
            },
            success: function(html) {
                self.render({ body: html });
            }
        });
        return self;
    }

    self.close = function() {
        $content.find('.close').trigger('click');
        return self;
    };

    self.render = function(data) {
        $content = $j(jive.UserGroupPicker.soy.renderGroupPickerModal(data));
        attachEvents();
        updateTotalGroups();

        $content.lightbox_me({
            // Position modal in front of the RTE content picker.
            zIndex: 300015,
            destroyOnClose : true,
            parentLightbox: $parent,
            onLoad: function() {
                var $target = $content.find('.jive-body-popup-container-grouppicker');
                isMultiple = extract($target, 'isMultiple');
                attachSubmitEvents();
            }
        });
    };

    // constructor
    jive.conc.observable(self);

    return self;
};
