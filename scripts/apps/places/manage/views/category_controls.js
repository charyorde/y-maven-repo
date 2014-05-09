/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('places.Manage');

/**
 * UI for opening the categories management interface from a place view.
 *
 * @depends path=/resources/scripts/apps/places/manage/views/abstract_controls.js
 * @depends template=jive.tags.soy.*
 */
jive.places.Manage.CategoryControls = jive.places.Manage.AbstractControls.extend(function(protect, _super) {
    protect.modalContent = '#categories-modal';
    protect.modal = '#jive-modal-categories';
    protect.activationLink = '#jive-link-manageCategories';



    protect.init = function() {
        var self = this,
            eventActions = ['cancelTagSet', 'editTagSet', 'editTagSetById', 'removeCategoryById'],
            options,
            popularTags = [],
            $modal;


        // utility functions
        var container = function() { return { ID: options.containerId, objectType: options.containerType }; },
            updateMessage = function(message) { $j('#category-message').html(message || ''); };

        function handleError(message) {
            alert(jive.tags.soy.globalErrorMessage({ message: message || '' }));
        }




        // setup
        _super.init.call(this);

        this.addListener('load.after', function(payload) {
            $modal = payload.$modal;
            options = jive.util.extractDataAttributes($modal.find('.jive-modal-content-categories')[0]);

            self.attachEvents();
            self.cancelTagSet();
            self.loadTagSets();
            self.loadPopularTags();
        });



        // private
        this.attachEvents = function() {
            // delegates click events
            $modal.delegate('[data-event]', 'click', function(e) {
                e.preventDefault();
                var data = jive.util.extractDataAttributes(this);

                eventActions.indexOf(data.event) > -1 && self[data.event].call(self, data);
            });

            $j('#jive-category-form').unbind('submit').submit(function(event) {
                event.preventDefault();
                self.saveTagSet($j('#jive-modal-categories'));
            });
        };

        this.cancelTagSet = function() {
            $modal.find(".jive-modal-title-add-category, .jive-modal-add-category, .jive-modal-title-edit-category, .jive-modal-edit-category").hide();
            $modal.find(".jive-modal-title-manage-categories, .jive-modal-categories-listing").show();
        };

        this.loadPopularTags = function() {
            ManageTagSet.popularTags(container(), {
                errorHandler: handleError,
                timeout: 5000,

                callback: function(tags) {
                    var $div = $j('<div />'),
                        feed = jive.namespace.call(window, 'Community.feed');
                    
                    popularTags = tags.map(function(tag, key) {
                        feed[key] = 1;
                        return {
                            name: $div.text(tag).html(),
                            text: tag
                        };
                    });
                }
            });
        };

        this.loadTagSets = function() {
            ManageTagSet.list(container(), {
                errorHandler: handleError,
                timeout: 5000,
                callback: self.populateTagSets
            });
        };

        this.populateTagSet = function(tagSet) {
            updateMessage(tagSet.usageMessage);
            
            $j("#categoryID").val(tagSet.ID);
            $j("#categoryName").val(tagSet.name);
            $j("#jive-tags").val(tagSet.tags.join(' '));

            var $ul = $j('<ul />');
            $j.each(popularTags, function() {
                $ul.append(jive.tags.soy.renderPopulateTagsetListItem(this));
            });
            $j('#jive-category-recommendedtags-container ul').replaceWith($ul);
        };

        this.populateTagSets = function(tagSets) {
            var max = options.maxTagSetCount,
                length = tagSets.length;

            $modal
                .find('.jive-modal-category-list').html(jive.tags.soy.buildCategoryDisplay({ categories: tagSets }))
                .end().find('.add').toggle(length < max)
                .end().find('.overflow').toggle(!(length < max));

            if (length < max){
                $j(".jive-category-remaining").text(jive.tags.soy.remainingMessage({ count: length }));
            } else {
                $j(".jive-category-overflow").text(length - max);
                $j(".jive-category-max").text(max);
            }
        };

        this.removeCategoryById = function(data) {
            var tagSet = {
                ID: data.id,
                containerID: container().ID,
                containerType: container().objectType
            };

            confirm(jive.tags.soy.confirmDeletion()) && ManageTagSet.remove(tagSet, {
                    errorHandler: handleError,
                    timeout: 5000,
                    callback: self.populateTagSets
                });
        };

        this.saveTagSet = function($form) {
            var tagSet = {
                ID: $j('#categoryID').val(),
                name: $j('#categoryName').val(),
                tags: ($j('#jive-tags').val() || '').split(' '),
                autoCategorize: !!$j('#autoCategorize').prop('checked'),
                containerID: container().ID,
                containerType: container().objectType
            };

            ManageTagSet.add(tagSet, {
                errorHandler: handleError,
                timeout: 5000,
                callback: self.populateTagSets
            });

            $form = $form.length ? $form : $modal;
            $form.find(".jive-modal-title-add-category, .jive-modal-add-category, .jive-modal-title-edit-category, .jive-modal-edit-category").hide();
            $form.find(".jive-modal-title-manage-categories, .jive-modal-categories-listing").show();
        };


        // event actions
        this.editTagSet = function(data) {
            $modal.find('.jive-modal-title-manage-categories, .jive-modal-categories-listing').hide();
            $j('#autoCategorize-container, .jive-modal-add-category, .jive-modal-title-add-category').show();
            updateMessage(jive.tags.soy.introTextAdd());

            this.populateTagSet({
                ID: '-1',
                name: '',
                tags: [],
                autoCategorize: $j("#autoCategorize").prop('checked'),
                containerID: data.id,
                containerType: data.objectType
            });
        };

        this.editTagSetById = function(data) {
            ManageTagSet.tagSet(data.id, {
                errorHandler: handleError,
                timeout: 5000,

                callback: function(tagSet) {
                    self.populateTagSet(tagSet);
                    updateMessage(jive.tags.soy.introTextEdit({ count: tagSet.count }));
                }
            });

            $j("#autoCategorize-container, .jive-modal-title-manage-categories, .jive-modal-categories-listing").hide();
            $j(".jive-modal-title-edit-category, .jive-modal-add-category").show();
        };
    }
});
