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

/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/apps/content/common/main.js
 * @depends path=/resources/scripts/apps/content/common/content_rte.js
 * @depends path=/resources/scripts/apps/content/polls/create/models/option_source.js
 * @depends path=/resources/scripts/apps/content/polls/create/views/option_list_view.js
 * @depends path=/resources/scripts/apps/content/polls/create/views/poll_view.js
 */

/**
 * @name jive.content.polls.Main
 */
jive.namespace('content.polls');

jive.content.polls.Main = jive.content.common.Main.extend(function(protect, _super) {

    this.init = function(options) {

        this.options = $j.extend({
            pollID: options.actionBean.pollID,
            description: options.actionBean.body,
            objectID: options.actionBean.pollID,
            objectType: 18, // Poll
            edit: false,
            formActionContainer: "#jive-compose-buttons",
            resourceType: 'polls',
            unloadURL: '/unload',
            multipartFormFilter: "[name != 'image']",
            autoSave: {
                properties: ['endsDays', 'endsMode', 'activeMode', 'options']
            }
        }, options);
        this.options.rteOptions = $j.extend({
            preset: "poll",
            height: 200
        }, this.options.rteOptions);

        if (this.options.edit) {
            this.options = $j.extend({
                suffix: '/' + this.options.pollID,
                ajaxType: 'PUT'
            }, this.options);
        }

        var that = this;
        this.options.pollOptions = this.buildOpts(options.actionBean.pollOptionsBean.options);

        if (!this.options.dieFTLdie) {
            _super.init.call(this, this.options);
        }

        this.optionSource = new jive.content.polls.OptionSource(this.options);
        this.optionListView = new jive.content.polls.OptionListView('.jive-poll-option-list', this.options);
        this.pollView = new jive.content.polls.PollView('#jive-body');

        this.optionListView
            .addListener('moveOption', function(optionID, newIndex) {
                that.optionMoved(optionID, newIndex);
            })
            .addListener('removeOption', function(optionID) {
                that.optionRemoved(optionID);
            })
            .addListener('newOption', function() {
                that.optionAdded();
            });
        this.pollView
            .addListener('restoreOptions', function(options) {
                var pollOptions = that.buildOpts(options);

                that.optionListView.removeOptions();

                $j.each(pollOptions, function(idx, pollOption) {
                    that.optionSource.newOption({
                        success: function(newPollOption) {
                            newPollOption.index = idx;
                            newPollOption.displayIndex = idx + 1;
                            that.optionListView.addContent(newPollOption);
                            $j('#opt-' + newPollOption.id).val(pollOption.text);
                        },
                        error: function(data) {
                            var response = jive.json.parse(data.responseText);
                            that.optionListView.displayError(response.message);
                        }
                    });
                });

                that.optionListView.updateOptions();
            });

        if (this.options.dieFTLdie) {
            this.renderForm($j("#jive-poll-description .jive-rte"));
        }
        this.renderOptions();
    };

    protect.buildOpts = function(pollOptions) {
        var that = this;
        var opts = new Array();
        $j.each(pollOptions, function(idx, pollOption) {
            var opt = that.buildPollOption(this);
            opts.push(opt);
        });
        return opts;
    };

    protect.buildPollOption = function(pollOption) {
        var meta = {
            id: 'j-polloption-meta-image-' + pollOption.id,
            view: jive.content.polls.ImageMetaView,
            container: 'j-polloption-meta-image-container-' + pollOption.id,
            service: jive.content.polls.ImageMetaSource,
            attachmentdata: this.buildPollOptionAttachmentData(pollOption)
        };
        return {
            id: pollOption.id,
            index: pollOption.index,
            text: pollOption.text,
            displayIndex: pollOption.displayIndex,
            objectType: pollOption.objectType,
            meta: [ meta ]
        };
    };

    protect.buildPollOptionAttachmentData = function(pollOption) {
        var attachementParams = [];
        $j.each(pollOption.contentMeta, function(idx, meta) {
            var data = {
                objectType: this.objectType,
                fullImageUrl: this.fullImageUrl,
                imageThumbnailUrl: this.imageThumbnailUrl,
                thumbnailWidth: this.thumbnailWidth,
                thumbnailHeight: this.thumbnailHeight
            };
            if (this.id) {
                data.id = this.id;
            }
            attachementParams.push(data);
        });
        return attachementParams;
    };

    protect.optionMoved = function(optionID, newIndex) {
        // get the option from the model
        var pollOption;
        this.optionSource.get(optionID, function(data) {
            pollOption = data;
        });

        var that = this;
        this.optionSource.move(pollOption, newIndex, {
            success: function(pollOptions) {
                that.optionListView.setContent(pollOptions, false);
            },
            error: function(data) {
                var response = jive.json.parse(data.responseText);
                that.optionListView.displayError(response.message);
            }
        });
    };

    protect.optionRemoved = function(optionID) {
        var pollOption;
        this.optionSource.get(optionID, function(data) {
            pollOption = data;
        });

        var that = this;
        this.optionSource.remove(pollOption, {
            success: function(pollOptions) {
                that.optionListView.removeOption(optionID);
                that.optionListView.setContent(pollOptions, false);
            },
            error: function(data) {
                var response = jive.json.parse(data.responseText);
                that.optionListView.displayError(response.message, optionID);
            }
        });
    };

    protect.optionAdded = function() {
        var that = this;
        this.optionSource.newOption({
            success: function(pollOption) {
                that.optionListView.addContent(pollOption);
            },
            error: function(data) {
                var response = jive.json.parse(data.responseText);
                that.optionListView.displayError(response.message);
            }
        });
    };

    protect.renderOptions = function() {
        var that = this;
        this.optionSource.getAll(function(data) {
            that.optionListView.setContent(data, true);
        });
    };

    /**
     * Renders a mini rte form that is appended to the given DOM container.
     *
     */
    protect.renderForm = function($target) {
        if(this.rteView){
            // remove the old rteView
            this.rteView.killYourself();
            this.rteView.destroy();
        }
        $element = $j("<textarea id='wysiwygtext'></textarea>");
        $target.append($element);
        $element.val(this.options.description);

        var rteOptions = $j.extend({
            $element      : $element,
            isEditing     : this.options.description.length > 0
        }, this.options.rteOptions);

        this.rteView = new jive.rte.RTEWrap(rteOptions);


        var that = this;
        $j('#jive-post-bodybox [name=name]').keydown(function (callEvent) {
                var keycode = callEvent.keyCode;
                if (keycode == 9 && !callEvent.shiftKey) { // tab
                    that.rteView.focus();
                    return false;
                }
            }
        );
        $j('#pollform').submit(function() {
            $j('.js-poll-save').prop('disabled', true).removeClass('j-btn-callout');
            that.removeDraft = false;
            $j('#jive-poll-description [name=description]').val(that.rteView.getHTML());

            var $form = $j('#pollform');
            // copy all input fields into the form. Only grab elements that have a name element.
            $j('#jive-post-bodybox').find(":input[name]").each(function() {
                if ($j(this).attr('type') == 'radio' || $j(this).attr('type') == 'checkbox') {
                    if ($j(this).is(':checked')) {
                        $form.append($j('<input/>')
                                .attr('type', 'hidden')
                                .attr('name', $j(this).attr('name'))
                                .val($j(this).val()));
                    }
                }
                else {
                    $form.append($j('<input/>')
                                .attr('type', 'hidden')
                                .attr('name', $j(this).attr('name'))
                                .val($j(this).val()));
                }

            });
            return true;
        });
    };

});
