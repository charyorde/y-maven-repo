/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*globals _jive_current_user containerType containerID */

jive.namespace('Filters');  // Creates the jive.Filters namespace if it does not already exist.

/**
 * Produces an autocomplete field for entering tags.
 *
 * @depends path=/resources/scripts/apps/shared/views/typeahead_input.js
 * @depends path=/resources/scripts/apps/filters/model/tag_suggestions.js
 * @depends path=/resources/scripts/apps/filters/model/tag_service.js
 * @depends path=/resources/scripts/apps/filters/view/tag_suggestions_view.js
 * @depends path=/resources/scripts/apps/filters/view/tag_cloud.js
 */
jive.Filters.TagAutocomplete = jive.oo.Class.extend(function(protect) {
    var $ = jQuery
      , _ = jive.Filters
      , separator = /[\s,]+/
      , partial = /[^\s,]+$/;

    jive.conc.observable(this);

    protect.init = function(element, options) {
        var controller = this;
        var baseParams = {
            max: 10,
            containerType: typeof(options.containerType) != 'undefined' ? options.containerType : (typeof(containerType) != 'undefined' ? containerType : "-1"),
            containerID: typeof(options.containerID) != 'undefined' ? options.containerID : (typeof(containerID) != 'undefined' ? containerID : "-1")
        };

        if (options.objectTypes && options.objectTypes.length > 0) {
            baseParams.taggableTypes = options.objectTypes;
        }

        this.suggestions = new _.TagSuggestions();
        this.tagService = new _.TagService(baseParams);
        this.tagService.suppressGenericErrorMessages();

        this.element = element;
        this.typeahead = new jive.TypeaheadInput(element, {
            minLength: 2
        });

        this.cachedCompletions = [];  // Cache of tags returned from the last REST query.
        this.focused = false;
        this.userID = _jive_current_user ? _jive_current_user.ID : "-1";

        this.typeahead
        .addListener('change', this.handleChange.bind(this))
        .addListener('clear', function() {
            controller.handleChange('');
        });

        this.suggestionsView = new _.TagSuggestionsView(element).addListener('selection', function(tag, promise) {
            var value = controller.typeahead.val();

            controller.element.blur();
            if (value.match(partial)) {
                controller.typeahead.val(value.replace(partial, tag) +' ');
            } else {
                controller.typeahead.val(value + tag +' ');
            }
            controller.element.focus();

            controller.handleChange(controller.typeahead.val());

            promise.emitSuccess();

        }).addListener('close', function() {
            controller.hideCompletions();
        });

        this.tagCloud = new _.TagCloud(element).addListener('cloud', function() {
            var selected = controller.getSelectedTags()
              , params = { max: 200 }
              , tagPromise;

            // Uncomment to filter tag cloud by tags that have already been
            // selected.
            //if (selected.length > 0) {
            //    params.tags = selected;
            //}

            tagPromise = controller.tagService.findAll(params);

            controller.tagCloud.show(tagPromise, selected, 200).addCallback(function(moreTags) {
                // Swap these code blocks to filter tag cloud by tags that have
                // already been selected.
                //var updated = selected.concat(moreTags).unique();
                //if (selected.join(' ') != updated.join(' ')) {
                //    controller.setSelectedTags(updated);
                //}

                if (selected.join(' ') != moreTags.join(' ')) {
                    controller.setSelectedTags(moreTags);
                }
            });
        });

        // Allow the parent view to keep track of whether the input element or
        // its suggestion list has focus.
        this.element.focus(function() {
            controller.focused = true;
            controller.emit('focus');

            controller.handleChange($(this).val());

        }).blur(function() {
            controller.focused = false;
            if (!controller.suggestionsOpen()) {
                controller.emit('blur');
            }

        }).click(function(e) {
            // Prevent click events from closing the popover.
            e.stopPropagation();
        });

        this.suggestionsView.addListener('focus', function() {
            controller.focused = true;
            controller.emit('focus');

        }).addListener('blur', function() {
            controller.focused = false;
            controller.emit('blur');
        });

        // Make sure that "popular tags" and "your tags" are cached.
        this.tagService.findAll();
        this.tagService.findAll({ filterUserID: this.userID });
    };

    protect.handleChange = function(value) {
        var tags = $.trim(value).split(separator).filter(function(tag) {
                return !!tag;  // Eliminates empty string values.
            })
          , partialTag = (value.match(partial) || [])[0];

        if (partialTag && partialTag != this.lastPartialTag) {
            this.showCompletions(partialTag);

        } else if (!partialTag) {
            this.hideCompletions();
        }

        this.lastPartialTag = partialTag;
        this.emit('change', tags);
    };

    /**
     * Called before the user has started typing; displays popular tags and the
     * user''s own tags.
     */
    protect.showPopularTags = function() {
        var popular = new jive.conc.Promise()
          , yourTags = new jive.conc.Promise()
          , related = new jive.conc.Promise()
          , selectedTags = this.getSelectedTags()
          , controller = this;

        this.tagService.findAll().addCallback(this.tagPreparer(popular));

        if (this.userID && this.userID > 0) {
            this.tagService.findAll({
                filterUserID: this.userID
            }).addCallback(this.tagPreparer(yourTags));
        } else {
            yourTags.emitSuccess([]);
        }

        if (selectedTags.length > 0) {
            this.tagService.findAll({
                tags: selectedTags
            }).addCallback(
                this.tagPreparer(related)
            ).addErrback(function() {
                related.emitSuccess([]);  // Treat 404 responses as an empty result set.
            });

            controller.suggestionsView.showRelatedTags(
                popular, yourTags, related
            );
        } else {
            controller.suggestionsView.showRelatedTags(
                popular, yourTags
            );
        }
    };

    protect.tagPreparer = function(promise) {
        return function(response) {
            var tags = response.map(function(e) {
                return e.renderedTag;
            });

            promise.emitSuccess(tags);
        };
    };

    protect.showCompletions = function(partialTag) {
        var cached = new jive.conc.Promise()
          , promise = new jive.conc.Promise()
          , controller = this;

        // Show stale completions while waiting for update.
        this.suggestionsView.showCompletions(cached);
        cached.emitSuccess({
            tags: [partialTag].concat(controller.cachedCompletions).unique()
        });

        this.suggestions.get(partialTag).addCallback(function(completions) {
            controller.cachedCompletions = completions.tagSearchResult.map(function(result) {
                return result.name;
            });

            promise.emitSuccess({
                tags: [partialTag].concat(controller.cachedCompletions).unique()
            });
        });

        // Show updated completions.
        this.suggestionsView.showCompletions(promise);
    };

    protect.hideCompletions = function() {
        var controller = this;

        if (this.focused) {
            jive.conc.nextTick(function() {
                controller.showPopularTags();
            });

        } else {
            this.suggestionsView.hide();
            this.emit('blur');
        }

        this.cachedCompletions = [];
    };

    protect.suggestionsOpen = function() {
        return this.suggestionsView.isVisible();
    };

    protect.getSelectedTags = function() {
        var raw = this.typeahead.val();

        return $.trim(raw.replace(partial, '')).split(separator).filter(function(tag) {
            return !!tag;  // Eliminates empty string values.
        });
    };

    protect.setSelectedTags = function(tags) {
        if (this.focused) {
            this.element.blur();
        }

        this.typeahead.val(tags.join(' ') +' ');

        if (this.focused) {
            this.element.focus();
        }

        this.handleChange(this.typeahead.val());
    };
});
