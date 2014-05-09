/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j */

jive.namespace('content.polls');

/**
 * @depends path=/resources/scripts/jquery/ui/ui.sortable.js
 * @depends path=/resources/scripts/apps/content/polls/create/views/image_meta_view.js
 * @depends path=/resources/scripts/apps/content/polls/create/views/option_view.js
 * @depends template=jive.polls.option.soy.*
 */
jive.content.polls.OptionListView = function(container, options) {

    jive.conc.observable(this);

    var pollOptions, optionViews = new jive.ext.y.HashTable(), metaViews = [], edit = options.edit, listView = this;

    function setContent(data, render) {
        pollOptions = data;
        if (render) {
            initializeOptions();
        }

        //always ensure index consistency
        updateOptions();
    }

    function removeOption(optionID) {
        var optionView = optionViews.get(optionID);
        optionView.removeSuccess();
        optionViews.clear(optionID);
    }

    function removeOptions() {
        $j.each(optionViews.toArray(), function(idx, optionView) {
            optionView.removeSuccess();
        });
        optionViews = new jive.ext.y.HashTable();
        pollOptions = [];
    }

    function addContent(pollOption) {
        initializeOption(pollOption);
        $j('#poll-choice-' + pollOption.id).effect("highlight", {
            color: '#ff9'
        }, 2000);
        $j('#poll-choice-' + pollOption.id + ' input.choice').focus();
    }

    function displayError(message, optionID) {
        var output = jive.polls.option.soy.error({message:message});
        $j('.j-poll-option-message').html(output).show().delay(2000).fadeOut("slow");
        if (optionID != null) {
            var optionView = optionViews.get(optionID);
            optionView.removeError();
        }
    }

    /**
     * Renders poll option elements, and creates an instance of OptionView
     * for each poll option.
     */
    function initializeOptions() {

        pollOptions.forEach(function(pollOption) {
            initializeOption(pollOption);
        });

        // Sortable for dragging/dropping poll options
        $j(container).sortable({

            update: function(event, ui) {
                handleSort(event, ui);
            }

        });
    }

    function updateOptions() {
        pollOptions.forEach(function(pollOption) {
            var optionView = optionViews.get(pollOption.id);
            optionView.setIndex(pollOption.index);
        });
    }

    function initializeOption(pollOption) {

        // Write out the HTML to the DOM
        render(pollOption);

        // Create the OptionView instance and cache it
        var optionElement = $j('#poll-choice-' + pollOption.id), optionView = new jive.content.polls
            .OptionView(optionElement, {edit:edit});

        optionViews.put(pollOption.id, optionView);

        // Listen for move events from the OptionView
        optionView.addListener('moveUp', function(optionID, newIndex) {
            listView.emit('moveOption', optionID, newIndex);
        })

            .addListener('moveDown', function(optionID, newIndex) {
                listView.emit('moveOption', optionID, newIndex);
            })

            .addListener('remove', function(optionID) {
                listView.emit('removeOption', optionID);
            });

        // wire up the meta handlers for the view.
        var metaArray = makeArray(pollOption.meta);
        metaArray.forEach(_initMeta.partial(_, optionView, pollOption));
    }

    function handleSort(event, ui) {

        // determine the new index of the dropped location
        var item = ui.item;
        var optionID = (item.attr('id') || '').split('-').last();

        var newIndex = $j('.jive-voting-option').index(item);
        listView.emit('moveOption', optionID, newIndex);
    }

    /**
     * Initializes the views for editing meta information for a poll option. Listeners are added for when the views are
     * activated, deactivated and completed by the user.
     *
     * @param meta the MetaContentView being initialized
     */
    function _initMeta(meta, view, pollOption) {

        var metaViewClass = makeClass(meta.view);
        var metaSourceClass = makeClass(meta.service);

        var metaView = new metaViewClass(meta.id, meta.container, view.getDOMElement(), options);
        var metaSource = new metaSourceClass(options);
        metaViews.push(metaView);

        if (metaView instanceof jive.content.polls.ImageMetaView) {
            listView.addListener('reset', function() {
                metaView.reset();
            });
        }

        metaView.addListener('activated', function() {
            for (var i = 0; i < metaViews.length; i++) {
                if (metaViews[i] !== metaView) {
                    metaViews[i].hide();
                }
            }
            metaView.show();
        })
            .addListener('deactivated', function() {
                metaView.hide();
            })
            .addListener('completed', function(data) {
                var metaCreatedCallback = function(meta) {
                    metaView.add(meta);
                };
                var errorCallback = function(data, textStatus, errorThrown) {
                    metaView.error(data, textStatus, errorThrown);
                    metaView.hide();
                };
                metaSource.create(pollOption, data, metaCreatedCallback, errorCallback);
            })
            .addListener('removeImage', function(id) {
                metaSource.remove(id);
                metaView.remove(id);
            })
            .addListener('error', function(message) {
                listView.displayError(message);
            });


        if (metaView instanceof jive.content.polls.ImageMetaView) {
            // render any images if they exist
            if (typeof(meta.attachmentdata) != "undefined" && meta.attachmentdata.length > 0) {
                metaView.add(meta.attachmentdata);
            }
        }
    }

    function makeClass(theClass) {
        if (typeof theClass != 'function') {
            theClass = theClass.split('.').reduce(function(obj, name) {
                return obj[name];
            }, window);
        }
        return theClass;
    }

    function makeArray(obj) {
        if (typeof(obj.length) == "undefined") {
            return new Array(obj);
        }
        return obj;
    }


    function render(pollOption) {

        var output = jive.polls.option.soy.renderEdit({
            option: pollOption
        });

        $j(container).append(output);
    }

    /* Public methods */
    this.updateOptions = updateOptions;
    this.setContent = setContent;
    this.addContent = addContent;
    this.displayError = displayError;
    this.removeOption = removeOption;
    this.removeOptions = removeOptions;

    $j(document).ready(function() {

        $j('.jive-add-poll-option-link').click(function() {
            listView.emit('newOption');
        });
    });

};
