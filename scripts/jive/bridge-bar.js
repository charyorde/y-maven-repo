/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*globals validatePost buildBridgeRTE */

/*
 * Includes click event handling for all the end user UI's for the bridge bar, including
 * bridged discussions and the reply workflow.
 */
    $j(function() {

        // Error handler for ajax errors
        var errorHandler = new jive.Util.AjaxErrorHandler();

        // Bridge Bar scripts
        var $nub = $j('#jive-nub');
        var $containerChooser = $j('#bridge-choose-container');
        var $contentChooser = $j('#bridge-choose-content');
        var $messageComposer = $j('#bridge-compose-message');
        var $uploadModal = $j('#bridge-upload');
        var $frames = $j('div.jive-bridge-frame');
        var $document = $j(document);

        var containerChooserOptions = {
            target: '#bridge-choose-container',
            error: errorHandler.handleError,
            success: initContainerSearchForm
        };

        // activate menu, load up all the links for a specific bridge
        $nub.delegate('.jive-nub-link', 'click', function() {
            var bridge = $j(this).attr('id').split("_")[1];
            // if the actions are already loaded, just toggle.
            if ($j(this).hasClass('jive-nub-loaded')) {
               $j('#menu-' + bridge).slideToggle('fast');
               $j('#bridge-' + bridge).toggleClass('jive-nub-selected');
            }
            // otherwise load up the links for this bridge
            else {
                $j('#bridge-' + bridge).addClass('jive-nub-loading');
                $j('#jive-instance-favicon_' + bridge).hide();
                $j('#jive-menu-loading_' + bridge).show();
                $j('#jive-bridge-expand').val(bridge);
                var submitOptions = {
                    target: '#menu-' + bridge,
                    success: function() {
                        $j('#jive-menu-loading_' + bridge).hide();
                        $j('#menu-' + bridge).slideToggle('fast');
                        $j('#bridge-' + bridge).toggleClass('jive-nub-selected');
                        $j('#jive-instance-favicon_' + bridge).show();
                        $j('#bridge-' + bridge).removeClass('jive-nub-loading');
                    },
                    error: function (x) {
                        $j('#jive-menu-loading_' + bridge).hide();
                        $j('#jive-instance-favicon_' + bridge).show();
                        $j('#bridge-' + bridge).removeClass('jive-nub-loading');
                        $j('#menu-' + bridge).text('Error loading bridge data');
                        errorHandler.handleError(x);
                    }
                };
                $j('#jiveBridgeExpandForm').ajaxSubmit(submitOptions);
                $j(this).addClass('jive-nub-loaded');

            }
            return false;
        });

        // show / hide multi bridges
        $nub.delegate('#bridge-bar-raquo', 'click', function(event) {
            $j('.bridges-expanded').toggle('fast');
            $j('#bridge-bar-laquo').show();
            $j('#bridge-bar-raquo').hide();
            event.preventDefault();
        });

        $nub.delegate('#bridge-bar-laquo', 'click', function(event) {
            $j('.bridges-expanded').toggle('fast');
            $j('#bridge-bar-raquo').show();
            $j('#bridge-bar-laquo').hide();
            event.preventDefault();
        });
        
        // scroll the existing replies list if there are more than 5

        $nub.delegate('#relative-selector', 'click', function(event) {
            $j('#replies-exist').scrollTo( {top:'300px', left:'0px'}, 1000 );
            event.preventDefault();
        });

        // container search autocomplete
        function initContainerSearchForm() {
            var searchSubmitOptions = { target: '#containerlist', error: errorHandler.handleError };
            var doSubmit = function() {
                var query = $j("#container-search-input").val();
                if (query && query.length >= 2) {
                    $j("#search-query-form").ajaxSubmit(searchSubmitOptions);
                }
            };
            $j("#container-search-input").delayedObserver(doSubmit, 1);

            // submit when enter is pressed, but block the form submit by preventing the
            // event from propogating
            $j("#container-search-input").keypress(function(event) {
                var key = event.which || event.keyCode;
                if (key == jive.Event.KEY_RETURN) {
                    doSubmit();
                    event.preventDefault();
                }
            });
        }

        // submit nub discussion form, launches container chooser
        $nub.delegate('.jive-nub-discuss', 'click', function(event) {
            var bridge = $j(this).attr('id').split("_")[1];
            var height = $j(document).height();
            // loading ...
            $j('#bridge-overlay_' + bridge).fadeIn('fast');
            $j('.jive-bridge-overlay').height(height);



            $j('#bridge-overlay_' + bridge).children('.jive-loading-backdrop').fadeIn('slow');
            $j('#jive-wrapper').addClass('static');

            $j('#jive-bridge').val(bridge);
            var objectType = $j(this).attr('id').split("_")[2];
            $j('#jive-remove-objectType').val(objectType);
            $j('#jiveBridgeNubForm').ajaxSubmit(containerChooserOptions);

            $j('#jive-nub').hide('fast');
            $j('#bridge-choose-container').fadeIn('slow');
            $j('#bridge-overlay_' + bridge).fadeIn('slow');
            scroll(0,0);

            event.preventDefault();
        });

        // close link
        $frames.delegate('.jive-bridge-close', 'click', function() {
            window.location.reload();
        });

        $uploadModal.delegate('.jive-bridge-done', 'click', function() {
           window.location.reload();
        });

        // help link
        $frames.delegate('.jive-help-links', 'click', function(event) {
            $j('.jive-bridge-help').slideToggle('fast');
            $j('.jive-help-show').toggle();
            $j('.jive-help-hide').toggle();
            event.preventDefault();
        });

// Choose Container scripts

        // search text input
        $containerChooser.delegate('.bridge-search-link', 'click', function(event) {
            $j('#search-query-form').slideToggle('fast');
            $j('#location-search').toggleClass('jive-search-locations');
            $j('#location').toggle();
            $j('#choose-location').toggle();

            setTimeout(function() {
                $j('#container-search-input').focus();
            }, 500);

            event.preventDefault();
        });

        // attach hover class and click events on existing discussion list to mirror other list items

        $nub.delegate('.jive-indicator-replylist li', 'hover', function(event) {
            if (event.type === 'mouseenter') {
                $j(this).addClass("hover");
            } else {
                $j(this).removeClass("hover");
            }
        });

        // submit bridge nub form, reload the entire div.
        // potentially, this could do a simple toggle if we don't want
        // to re-execute the search
        $containerChooser.delegate('.bridge-choose-link', 'click', function(event) {
            var bridge = $j(this).attr('id').split("_")[1];
            $j('#jive-bridge').val(bridge);
            $j('#jiveBridgeNubForm').ajaxSubmit(containerChooserOptions);
            $j('#jive-nub').hide();
            $j('#bridge-choose-container').show();
            scroll(0,0);
            event.preventDefault();
        });

        // container link click events
        $containerChooser.delegate('.jive-choose-containers-container', 'click', function(event) {
            var values = $j(this).attr('id').split("_");
            $j('#jive-choose-container-type').val(values[1]);
            $j('#jive-choose-container-id').val(values[2]);
            $j('#jive-choose-container-name').val(values[3]);

            $j('#jiveBridgeChooseContainerForm').ajaxSubmit({
                success: function(data) {

                    if ($j('#jiveBridgeComposeMessageForm', data).length > 0) {
                        // looks good, we are loading the RTE
                        $j('#bridge-compose-message').html(data);
                        $j('#bridge-compose-message').fadeIn('slow');
                        $j('#bridge-choose-content').fadeOut('fast');
                        $j('#bridge-choose-container').hide();
                        
                        // make sure the help bar is reset
                        $j('.jive-bridge-help').hide();
                        $j('.jive-help-show').show();
                        $j('.jive-help-hide').hide();

                        // begin slew of RTE goodness
                        jive.rte.multiRTE.push("wysiwygbridge");
                        if(typeof(window.editor) == "undefined") {
                            window.editor = new jive.ext.y.HashTable();
                        }
                        buildBridgeRTE();
                    }
                    else {
                        // hit a validation, redisplay the page
                        $j('#bridge-choose-content').html(data);
                        $j('#bridge-choose-content').show();
                        $j('#bridge-choose-container').fadeOut('slow');
                        $j('#bridge-choose-container').hide();
                            scroll(0,0);

                        // Server may render bridge-choose-container.ftl
                        // if an error has occurred.
                        initContainerSearchForm();
                    }
                },
                error: errorHandler.handleError
            });

            event.preventDefault();
        });


// Choose Content scripts

        function initContentChooser($contentChooser) {
            // checkbox handling - click events for the message divs
            $contentChooser.delegate('.jive-bridge-message', 'click', function(event) {
                var $message = $j(this);

                $j(this).find('.sel-message').each(function() {
                    var $checkbox = $j(this);

                    // If the checkbox was the event target, it will already
                    // have been toggled by the default event behavior.
                    if (event.target !== this && !$j(event.target).is('a')) {
                        if ($checkbox.is(':checked')) {
                            $checkbox.prop('checked', false);
                        } else {
                            $checkbox.prop('checked', true);
                        }
                    }

                    $message.toggleClass('selected', $checkbox.is(':checked'));
                });
            });

            // super preview
            $contentChooser.delegate('.jive-message-preview a', 'hover', function(event) {
                if (event.type == 'mouseenter') {
                    $j(this).closest('.jive-bridge-message').find('.jive-message-preview-body').fadeIn('slow');
                } else {
                    $j(this).closest('.jive-bridge-message').find('.jive-message-preview-body').fadeOut('medium');
                }
            });

            // Select all/no messages
            $contentChooser.delegate('.jive-message-select', 'click', function(event) {
                if ($j(this).attr('id') == "select-all") {
                    $contentChooser.find('#select-all').hide();
                    $contentChooser.find('#select-none').show();
                    $contentChooser.find('.sel-message').each(function() {
                        if (!$j(this).hasClass('original')) {
                            $j(this).prop('checked', true);
                            $j(this).closest('.jive-bridge-message').addClass('selected');
                        }
                    });
                }
                else if ($j(this).attr('id') == "select-none") {
                    $contentChooser.find('#select-all').show();
                    $contentChooser.find('#select-none').hide();
                    $contentChooser.find('.sel-message').each(function() {
                        if (!$j(this).hasClass('original')) {
                            $j(this).prop('checked', false);
                            $j(this).closest('.jive-bridge-message').removeClass('selected');
                        }
                    });
                }
                event.preventDefault();
            });

            // Handle form submission when bridging content to another
            // community.
            $contentChooser.delegate('#jiveBridgeChooseContentForm', 'submit', function(event) {
                var $form = $j(this);

                // make sure the help bar is reset
                $j('.jive-bridge-help').hide();
                $j('.jive-help-show').show();
                $j('.jive-help-hide').hide();
                $form.find('input[type="submit"]').prop('disabled', true);

                $form.ajaxSubmit({
                    success: function(data) {
                        var $newForm = $j('#jiveBridgeChooseContentForm', data);

                        if ($newForm.length > 0) {
                            // we hit a validation, redisplay this page
                            $form.replaceWith($newForm);
                            $newForm.find('input[type="submit"]').prop('disabled', false);
                        }
                        else {
                            // display the RTE
                            $j('#bridge-compose-message')
                                .html(data)
                                .fadeIn('slow')
                                .find('input[type="submit"]').prop('disabled', false);
                            $j('#bridge-choose-content').fadeOut('fast');
                            $j('#bridge-choose-container').hide();

                            // begin slew of RTE goodness
                            jive.rte.multiRTE.push("wysiwygbridge");
                            if(typeof(window.editor) == "undefined") {
                                window.editor = new jive.ext.y.HashTable();
                            }
                            buildBridgeRTE();
                        }
                    },
                    error: errorHandler.handleError
                });

                event.preventDefault();
            });

            // Handle form submission when selecting bridged replies to
            // quote in your own reply.
            $contentChooser.delegate('.jive-insert-messages', 'click', function() {

                var selectedReply = $j('.sel-message').fieldValue();
                var data = {'bridge': $j('#jive-bridge-reply').fieldValue()[0],
                    'object': $j('#jive-bridge-reply-object').fieldValue()[0],
                    'contentObjectType': $j('#jive-bridge-reply-contentObjectType').fieldValue()[0],
                    'comment' : $j('#jive-bridge-reply-comment').fieldValue()[0],
                    'selectedReply' : selectedReply.join(',')
                };

                var url = $j('#bridge-reply-select-messages-link').attr('href');

                $j.post(url, data, function(data){
                    // check for errors, the original html will be we returned
                    if ($j(data).attr('id') == 'jive-bridge-choose-reply') {
                        $j('#jive-bridge-choose-reply').replaceWith($j(data));
                    }
                    else {
                        // we are good, append the html to the RTE
                        $j('.jive-modal').trigger('close');
                        var editor = window.editor.get('wysiwygtext');
                        if (editor) {
                            editor.insertHTMLAtCursor(data);
                        }
                        else {
                            // get the active RTE, can't use wysiwygtext as the ID as it increments
                            // for inline discussion replies
                            if (jive.rte.multiRTE && jive.rte.multiRTE.length > 0) {
                                var editorID = jive.rte.multiRTE[jive.rte.multiRTE.length-1];
                                editor = window.editor.get(editorID);
                                if (editor) {
                                    editor.insertHTMLAtCursor(data);
                                }
                            }
                        }
                    }
                }, 'html');
            });
        }

        initContentChooser($contentChooser);

        // link to go back and re-select the container from the select messages or compose page
        $contentChooser.add($messageComposer).delegate('#location-chosen a', 'click', function(event) {
            var url = $j(this).attr('href');
            var $breadcrumb = $j(this).closest('#location-chosen');

            if ($breadcrumb.hasClass('choose-content')) {
                $j('#jiveBridgeChooseContentForm').attr('action', url).ajaxSubmit(containerChooserOptions);
                $j('#bridge-choose-content').hide();
                $j('#bridge-choose-container').show();
                scroll(0,0);
            }
            else if ($breadcrumb.hasClass('compose')) {
                $j('#jiveBridgeComposeMessageForm').attr('action', url).ajaxSubmit(containerChooserOptions);
                $j('#bridge-choose-content').hide();
                $j('#bridge-compose-message').hide();
                $j('#bridge-choose-container').show();
                scroll(0,0);
            }
            event.preventDefault();
        });

        // link to re-select messages from the compose page
        $messageComposer.delegate('#messages-selected a', 'click', function(event) {
            var submitOptions = {target: '#bridge-choose-content', error: errorHandler.handleError};
            var url = $j(this).attr('href');
            $j('#jiveBridgeComposeMessageForm').attr('action', url).ajaxSubmit(submitOptions);
            $j('#bridge-compose-message').hide();
            $j('#bridge-choose-content').show();
            scroll(0,0);

            event.preventDefault();
        });


// Compose Message / RTE scripts

        // progress modal
        function uploadComplete(data){

            // check for errors in the RTE submit
            if ($j('#jiveBridgeComposeMessageForm', data).length > 0) {

                // found an error, kill the existing RTE instance
                var editor = window.editor.get('wysiwygbridge');
                if (typeof(editor) != "undefined") {
                    editor.killYourself();
                }

                // insert the html back into the dom
                $j('#bridge-compose-message').html(data);

                // make sure the help bar is reset
                $j('.jive-bridge-help').hide();
                $j('.jive-help-show').show();
                $j('.jive-help-hide').hide();

                // begin slew of RTE goodness
                jive.rte.multiRTE.push("wysiwygbridge");
                if(typeof(window.editor) == "undefined") {
                    window.editor = new jive.ext.y.HashTable();
                }
                buildBridgeRTE();
            }
            else if (data.indexOf('jive-body-intro') != -1) {
                var msg = "Unexpected form token validation, please close this page and try again";
                $j('<p />').html(msg).message({ style: 'error' });
            }
            else {
                // we are good,display the progress bar
                $j('#bridge-upload').html(data);
                // delay for 3 seconds for good measure
                setTimeout(function(){
                    $j('#done').show('fast');
                    $j('#spaceused1_percentText').hide();
                    $j('#upload-status').show('fast');
                    $j('#progress').removeClass("jive-upload-status");
                    $j('#progress').addClass("jive-upload-status-done");
                    $j('#viewmsg').prop('disabled', false);
                    $j('#viewmsg2').prop('disabled', false);
                    $j('#cancel').hide();
                    }, 3000);
            }
        }

        function postBridgeMessage(event) {
            // need to validate the post prior to binding to the form via ajaxSubmit.
            var valid = validatePost(true, true, "wysiwygbridge");
            $j('.jive-compose-form-submit').prop('disabled', true);

            if (valid) {
                scroll(0,0);
                $j('#jiveBridgeComposeMessageForm').ajaxSubmit({
                    beforeSubmit: function() {
                        $j('#bridge-upload').show('fast');
                    },
                    success: function(data) {
                        uploadComplete(data);
                    },
                    error: errorHandler.handleError
                });
            }
            else {
                $j('.jive-compose-form-submit').prop('disabled', false);
            }
            event.preventDefault();
        }

        // submit button handler for the compose/RTE form
        $messageComposer.delegate('.jive-compose-form-submit', 'click', postBridgeMessage);
        $messageComposer.delegate('#jiveBridgeComposeMessageForm', 'submit', postBridgeMessage);

        // Bridged Content Preview, loads the selected content that will be bridged if it hasn't been loaded yet.
        $messageComposer.delegate('#jive-content-preview', 'click', function(event) {

            $j('.preview-toggle span.jive-icon-magnifyingglass').hide();
            $j('#preview-toggle').addClass('working');

            var submitOptions = {target: '#bridge-toggle',
                success: function() {
                    scroll(0,0);
                    $j('#preview-toggle').removeClass('working');
                    $j('.preview-toggle span.jive-icon-magnifyingglass').show();
                    $j('#jive-preview-modal').lightbox_me({closeSelector: ".jive-modal-close-top, .close"});
                },
                error: errorHandler.handleError
            };

            $j('#jiveBridgePreviewMessagesForm').ajaxSubmit(submitOptions);

            event.preventDefault();
        });

        // Toggles the collapsed preview content
        $document.delegate('#collapsed-thread a', 'click', function(event) {
            var $collapsedThread = $j(this).closest('#collapsed-thread');

            $j('#jive-bridge-toggle-section').slideToggle('fast');
            $collapsedThread.find('.show-content, #showmsgs').toggle();
            $collapsedThread.find('.hide-content, #hidemsgs').toggle();

            event.preventDefault();
        });


        // Loads bridge meta data live from the other site.  This represents metadata from the content
        // that's been bridged.
        $document.delegate('.jive-bridged-content-deets-link', 'click', function(event) {
            if ($j('#jive-bridged-content-details').hasClass('not-loaded')) {
                var submitOptions = {target: '#jive-bridged-content-details',
                    success: function() {
                        $j('#jive-bridged-content-details').slideDown('fast');
                        $j('#jive-bridged-content-details').removeClass('not-loaded');
                    },
                    error: errorHandler.handleError
                };
                $j('#jiveBridgeContentMetaForm').ajaxSubmit(submitOptions);
            }
            else {
                $j('#jive-bridged-content-details').slideToggle();
            }
            event.preventDefault();
        });

        // Shows an explanation for why the content looks different when it's bridged
        $document.delegate('.jive-bridge-explanation', 'click', function(event) {
            var $explanation = $j('#jive-bridged-content-explanation');

            if ($explanation.hasClass('not-loaded')) {
                $explanation.slideDown('fast').removeClass('not-loaded');
            }
            else {
                $explanation.slideToggle();
            }

            event.preventDefault();
        });

        // Bouncing indicator of existing bridged discussions
        $nub.find("div.jive-discussion-indicator").effect("bounce", { times:3 }, 300);

// Reply scripts, posting bridged content replies into the RTE (the answer to a bridged discussion)

        $document.delegate('#jive-quote-help-link', 'click', function(event) {
            $j('.jive-quote-help').slideToggle('fast');
            event.preventDefault();
        });

        $document.delegate('.jive-bridge-reply-item a', 'click', function(event) {
            var $link = $j(this);
            var replyId = $link.closest('.jive-bridge-reply-item').attr('id').split("_")[1];
            var $modal = $j('#jive-bridge-quote-modal');
            var url, data;

            // The reply item that was clicked is copied from a template
            // element.  The template element has the data attributes
            // that we need.
            $j('.jive-bridge-reply-item').each(function() {
                var $item = $j(this);
                if ($item.data('bridgeID') == replyId) {
                    if (!url) {
                        url = $item.data('actionUrl');
                    }
                    if (!data) {
                        data = $item.data('actionData');
                    }
                }
            });

            $modal.load(url, data, function() {
                $modal.lightbox_me({closeSelector: ".jive-modal-close, .close"});
                initContentChooser($modal);
            });

            event.preventDefault();
        });
    });
