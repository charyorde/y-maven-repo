
/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('UserRelationshipList');

/**
 * Handles UI for a list of link items
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.people.relationshipLabelInput
 */
jive.UserRelationshipList.PeopleConnectionsLabelView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    this.init = function(lists, bidirectionalConnections, i18n) {

        var view = this;
        this.active = true;
        view.bidirectionalConnections = bidirectionalConnections;

        //if create link is clicked, open input box
        var $createLink = $j("#j-relationship-label-list li.js-label-create-item");
        $createLink.find("a").click(function(e) {
            var $labelFormItem = $j("#j-relationship-label-list li.js-label-input-item");
            //if there's already a form, don't create a second one
            if ($labelFormItem.length == 0){
                $createLink.before(jive.people.relationshipLabelInput({}));
                view.attachColorPicker();
            }
            $createLink.prev().find('input:text').select();
            $createLink.hide();
            e.preventDefault();
        });

        //show label actions on hover
        $('#j-relationship-label-list').delegate('li.j-label-item', 'mouseover mouseout', function(e) {
            if (e.type == 'mouseover') {
                $j(this).find(".j-label-actions").show();
            }
            else {
                $j(this).find(".j-label-actions").hide();
            }
            e.preventDefault();
        });

        //if edit is clicked, move label into edit mode
        $('#j-relationship-label-list').delegate('a.js-edit-link', 'click', function(event) {
            view.cancelEdit($j("#j-relationship-label-list li.js-label-input-item"));    //cancel any existing edits
            var $listItem = $j(this).parents("li:first");
            var label = {listID: $listItem.attr("data-list-id"),
                         filterID: $listItem.attr("data-filter-id"),
                         memberCount: $listItem.data('member-count'),
                         css: view.colorToHexString($listItem.find(".j-label-css").css("background-color")),
                         name:  $listItem.find(".j-label-name").text()};
            $listItem.replaceWith(jive.people.relationshipLabelInput(label));
            view.attachColorPicker();
            $("#j-relationship-label-list li.js-label-input-item").find(".js-color-sample").css("background-color", '#' + label.css);
            $('#js-create-label-input').focus();

            event.preventDefault();
        });

        //handle save
        $('#j-relationship-label-list').delegate('li.js-label-input-item form', 'submit', function(event) {
            var $listItem = $(this).closest('li');
            var listID = $listItem.attr("data-list-id");
            var filterID = $listItem.attr("data-filter-id");
            var memberCount = $listItem.data('member-count');
            var name = $listItem.find("input[name='labelName']").val();
            var css = view.colorToHexString($listItem.find("input[name='css']").val());
            if (!name || !css) {
                $j("<p/>").html(i18n.errMsg).message({"style":"error"});
            }
            else {
                var label = {name: name, css: css};
                if (!filterID) {
                    //if newly created label, create a filter ID
                    var $parentFilterList = $j("#j-relationship-label-list");
                    var parentID = $parentFilterList.closest("li").attr("data-filter-id");
                    var pattern = $parentFilterList.attr("data-child-id-pattern");
                    view.emitP('labelCreated', label, parentID, pattern).addCallback(function(data) {
                        label = data;
                        //swap the form for the label
                        $listItem.replaceWith(jive.people.relationshipLabel(label));
                    });
                }
                else {
                    label = $j.extend({}, label, { id: listID, listID: listID });  //merge data back in
                    view.emitP('labelUpdated', label).addCallback(function() {
                        label = $j.extend({}, label, {filterID: filterID, memberCount: memberCount});  //merge data back in
                        //swap the form for the label
                        $listItem.replaceWith(jive.people.relationshipLabel(label));
                    });
                }
                $createLink.show();
            }
            event.preventDefault();
        });

        //handle input cancel
        $('#j-relationship-label-list').delegate('li.js-label-input-item input.js-cancel-link', 'click', function() {
            //if data-list-id, replace with original values, else remove
            view.cancelEdit($j(this).parents("li:first"));
            $createLink.show();
        });

        //remove labels
        $('#j-relationship-label-list').delegate('a.js-del-link', 'click', function(event) {
            if (confirm(i18n.delMsg)){
                var li = $j(this).parents("li:first");
                var $listItem = $j(li);
                var listID = $listItem.attr("data-list-id");
                var filterID = $listItem.attr("data-filter-id");
                var parentFilterID = $listItem.closest("li.j-browse-filter-group-item").attr("data-filter-id");
                if (listID != null) {
                    view.emitP('labelRemoved', listID, filterID, parentFilterID).addCallback(function() {
                        li.remove();
                    });
                }
            }
            event.preventDefault();
        });

        //set "active" class on selected label, remove from others
        $('#j-relationship-label-list').delegate('li.j-label-item a.js-select-link', 'click', function() {
            var $listItem = $j(this).closest("li");
            //update friend link url with selected list
            var listID = $listItem.attr("data-list-id");
            view.refreshFeedLink({listID: listID, bidirectionalConnections: this.bidirectionalConnections});
        });

        //reset feed link if any major secondary nav link is clicked and deselect any selected labels
        $j("li.j-browse-filter-group-item").click(function(){
            view.refreshFeedLink({bidirectionalConnections: this.bidirectionalConnections});
        });

    };

    this.cancelEdit = function ($li) {
        var id = $li.attr("data-list-id");
        var memberCount = $li.data('member-count');
        if (id) {
            var label = {listID: id, filterID: $li.attr("data-filter-id"), name: $li.attr("data-name"), css: $li.attr("data-css"), memberCount: memberCount};
            $li.replaceWith(jive.people.relationshipLabel(label)); //swap the form for the label
        }
        else {
            $li.remove();
        }
    };

    //attaches color picker to edit form
    this.attachColorPicker = function() {
        var $labelFormItem = $j("#j-relationship-label-list li.js-label-input-item");
        var $cssInput = $labelFormItem.find("input[name='css']");
        this.createColorInput($cssInput);
    };

    this.activate = function() {
        $j("#j-relationship-label-list").show();
        //hide/show RSS link for connections if selected
        $j("#j-friend-feed-link").show();
        this.active = true;
    };

    this.passivate = function() {
        $j("#j-relationship-label-list").hide();
        //hide/show RSS link for connections if selected
        $j("#j-friend-feed-link").hide();
        this.active = false;
    };

    this.isActive = function(){
        return this.active;
    };

    this.incrementLabelCount = function(labelID){
        var $label = $j("#j-relationship-label-list li.j-label-item[data-list-id='" + labelID + "']");
        $label.removeClass("empty");
        var memberCount = $label.data('member-count') + 1;
        $label.data('member-count', memberCount);
        $label.find(".js-member-count").text(memberCount);
    };

    this.decrementLabelCount = function(labelID) {
        var $label = $j("#j-relationship-label-list li.j-label-item[data-list-id='" + labelID + "']");
        //decrement member count and apply "empty" style if necessary
        var memberCount = $label.data('member-count') - 1;
        memberCount = memberCount >= 0 ? memberCount : 0;
        $label.data('member-count', memberCount);
        $label.find(".js-member-count").text(memberCount);
        if (!memberCount) {
            $label.addClass("empty");
        }
    };

    this.refreshFeedLink = function(obj){
        $j("#j-friend-feed-link").replaceWith(jive.people.friendFeedLink(obj))
    };

    protect.rgb = /rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/;
    protect.hash = /^#/;
    protect.colorToHexString = function(color) {
        var components = color.match(this.rgb);
        if (components) {
            return components.slice(1).map(function(c) {
                var hex = parseInt(c, 10).toString(16);
                return hex.length > 1 ? hex : "0"+ hex;
            }).join('');
        } else {
            return color.replace(this.hash, '');
        }
    };

    /**
     * @param $colorInput
     * @param updateFun
     */
    this.createColorInput = function($colorInput) {
        var colors          = 'ba0101,f2839d,fa8101,fef002,1ebb00,005ebb,9e13aa,9b9b9b,000000',
            $color_sample   = $j("<div class='j-color-sample js-color-sample'><a href='#' class='j-ui-elem'></a></div>"),
            $color_menu     = $j("<div id='js-color-picker' class='j-color-picker'></div>");

        $.each(colors.split(','), function(indx, c) {
            $color_menu.append($("<a href='javascript:;' class='j-rc3'></a>").css({backgroundColor: '#' + c}).click(function(e) {
                $colorInput.val('#' + c);
                update();
                $color_menu.trigger('close');
                $j('#js-create-label-input').select();
                e.preventDefault();
            }));
        });

        if (!$colorInput.val()) {
            $colorInput.val('#' + colors.split(',')[Math.floor(Math.random() * colors.split(',').length)]);
        }
        update();

        $colorInput.click(function(e) {
            openColorPicker($j(this));
            e.preventDefault()
        }).change(update).keyup(update);

        $color_sample.click(function(e) {
            openColorPicker($j(this));
            e.preventDefault();
        });
        $colorInput.after($color_menu.hide()).after($color_sample);
        $colorInput.parents(".properties").click(function(e) {
            $color_menu.trigger('close');
            e.preventDefault();
        });

        function update() {
            $color_sample.css("background-color", $colorInput.val());
        }

        function openColorPicker($context) {
            if (!$color_menu.is(':visible')) {

                $color_menu.find('a').show();
                $color_menu.popover({context: $context, darkPopover: true, destroyOnClose: false, putBack: true,
                    beforeClose: function() {
                        $color_menu.find('a').css('left', '8px');
                        $color_menu.width($color_menu.find('a:first').outerWidth() + 'px');
                    },
                    onLoad: function() {
                        var $firstColor = $color_menu.find('a:first'),
                            colorWidth  = $firstColor.outerWidth(),
                            colorMargin = parseInt($firstColor.css('margin-right'), 10),
                            colorLength = $color_menu.find('a').length,
                            currentLeft = parseInt($firstColor.css('left'), 10);

                        $color_menu.find('a').each(function() {
                            $j(this).animate({'left': currentLeft + ($j(this).index() * (colorWidth + colorMargin))}, 200);
                        });
                        $color_menu.animate({'width': colorLength * (colorWidth + colorMargin)}, 200);
                    }
                }).closest('.js-pop').addClass('j-popme-small');
            }
        }
    }
});
