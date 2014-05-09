/*globals $Class $j */

/**
 * @depends path=/resources/scripts/jquery/jquery.oo.js
 * @depends path=/resources/scripts/jquery/ui/ui.sortable.js
 */
var Widgets = $Class.extend({
    // object variables
    args: {},

    init: function(args) {
        // do initialization here
        this.args = args;

        this.loadSortables();

        // load up draggables
        makeDraggable($j('#jive-widgets-list-container .jive-widget-new'));
    },

    showCategoryWidgets: function(category, bridgeID, index) {
        var theContainer;
        if (bridgeID) {
            theContainer = '#jive-widgets-list-container_' + bridgeID;
        } else {
            theContainer = '#jive-widgets-list-container';
        }
        var $container = $j(theContainer);
        $container.find('.jive-category-instructions').hide();
        $container.find('.jive-widget-instructions').fadeIn('fast');
        $container.find('.jive-widcat-widgets').hide();
        $container.find('.jive-widcat-widget').removeClass('selected');
        $container.find('.jive-widget-new-container').hide();
        $container.find('.jive-widget-category').removeClass('selected');

        if (bridgeID) {
            $j(theContainer + ' #widgets-' + category + '-' + bridgeID).show();
            $j(theContainer + ' #jive-widget-category-' + category + '-' + bridgeID).addClass('selected');
        } else {
            $container.find('#widgets-' + index + '-' + category).show();
            $container.find('#jive-widget-category-' + index + '-' + category).addClass('selected');
        }
    },

    selectWidget: function(category, widgetID, bridgeID, index) {
        $j(window).unbind('resize');

        var theContainer;
        if (bridgeID) {
            theContainer = '#jive-widgets-list-container_' + bridgeID;
        } else {
            theContainer = '#jive-widgets-list-container';
        }

        var $container = $j(theContainer);
        $container.find('.jive-widget-instructions').hide(); // hide widget instructions text
        // toggle selected widget
        $container.find('.jive-widcat-widget').removeClass('selected');
        if (bridgeID) {
            $container.find('#widgets-' + category + '-' + widgetID + '-' + bridgeID).addClass('selected');
        } else {
            $container.find('#widgets-' + index + '-' + category + '-' + widgetID).addClass('selected');
        }

        // toggle widget preview
        $container.find('.jive-widget-new-container').hide();
        $container.find('#jive-widget-new-container_' + widgetID).show();

        //todo: check if jive-widget-preview_ + widgetID has already been loaded

        var finalParams = {
            widgetID: widgetID,
            widgetType: this.args.widgetTypeID,
            container: this.args.parentObjectID,
            containerType: this.args.parentObjectType
        };
        if (bridgeID) { finalParams.bridge = bridgeID; }


        /* set width of description and drag button overlay to match preview area (accounting for the scrollbar) */
        function sizeDragBar() {
            var viewPortWidth = $j('#jive-preview-widgetsize_' + widgetID).width();
            //$j("#jive-widget-new-controls_" + widgetID).css({width: viewPortWidth});
            var actionPositionNew = viewPortWidth - ($j('#jive-widget-browser-preview-actions_' + widgetID).width() + 15);
            //$j("#jive-widget-browser-preview-actions_" + widgetID).css({left: actionPositionNew, right: 'auto'});
        }

        var instance = this;
        $j("#jive-widget-new-preview_" + widgetID).load(this.args.previewURL, finalParams, function() {
            instance.toggleSize(widgetID, true, bridgeID);
            sizeDragBar();
            $j('.jive-widget-browser-preview-wrapper .jive-widget-body a').bind('click', function() { return false; });
        });

        $j(window).resize(sizeDragBar);
    },

    toggleSize: function(widgetID, isLarge, bridgeID) {
        var theContainer;

        if (bridgeID) {
            theContainer = '#jive-widgets-list-container_' + bridgeID;
        } else {
            theContainer = '#jive-widgets-list-container';
        }

        $j(theContainer + ' #jive-widget-browser-preview .jive-widget-browser-preview-actions a').removeClass('selectedSize font-color-normal');

        if (isLarge) {
            $j(theContainer + ' #jive-widget-new-preview_' + widgetID).parent().removeClass('jive-widgetsize-small').addClass('jive-widgetsize-large');
            $j(theContainer + ' #jive-widget-new-preview_' + widgetID + ' .content-large').show();
            $j(theContainer + ' #jive-widget-new-preview_' + widgetID + ' .content-small').hide();
            $j(theContainer + ' #jive-widget-browser-preview #jive-widget-browser-preview-action-large_' + widgetID).addClass('selectedSize font-color-normal');
        }
        else
        {
            $j(theContainer + ' #jive-widget-new-preview_' + widgetID).parent().removeClass('jive-widgetsize-large').addClass('jive-widgetsize-small');
            $j(theContainer + ' #jive-widget-new-preview_' + widgetID + ' .content-small').show();
            $j(theContainer + ' #jive-widget-new-preview_' + widgetID + ' .content-large').hide();
            $j(theContainer + ' #jive-widget-browser-preview #jive-widget-browser-preview-action-small_' + widgetID).addClass('selectedSize font-color-normal');
        }
    },

    removeWidgetFrame: function(widgetFrameID) {
        $j(document.body).addClass('jive-widget-progresscursor');

        var widgetFrame = $j('#jive-widgetframe_'+widgetFrameID);
        var pars = {
            'widgetFrameID':widgetFrameID,
            'parentObjectType': this.args.parentObjectType,
            'parentObjectID': this.args.parentObjectID
        };
        $j.post(this.args.deleteURL, pars, function() {
            $j(document.body).removeClass('jive-widget-progresscursor');
            // remove the widget frame from the page
            widgetFrame.remove();
        });
    },
    hideMenu: function(widgetFrameID) {
        console.log("hiding menu: " + widgetFrameID);
        $j('#jive-widgetframe-edit_' + widgetFrameID).find(".jive-widget-menu-btn-link").removeClass("currentMenu");
        $j('#jive-widgetframe-options_' + widgetFrameID).hide();
    },
    editWidgetFrame: function(widgetFrameID) {
        this.disableSortables();
        this.prepareEditWidgetFrame(widgetFrameID);

        var pars = {
            'widgetFrameID':widgetFrameID,
            'widgetTypeID': this.args.widgetTypeID
        };

        var that = this;
        $j("#jive-widgetframe-body_" + widgetFrameID).load(this.args.editURL, pars, function() {
            that.postEditWidgetFrame(widgetFrameID);
        });
    },
    prepareEditWidgetFrame: function(widgetFrameID) {
        this.hideMenu(widgetFrameID);

        $j(document.body).addClass('jive-widget-progresscursor');

        // make sure the frame is maximized
        this.maximizeWidgetFrame(widgetFrameID);
    },
    postEditWidgetFrame: function(widgetFrameID) {
        $j(document.body).removeClass('jive-widget-progresscursor');
        $j("#jive-widgetframe_" + widgetFrameID).effect("highlight", {}, 3000);
        $j(this).closest('.jive-widget').addClass('jive-widget-active');
        $j(this).css({overflow: 'visible'});

        jive.conc.nextTick(function() {
            $j('#jive-widgetframe-body_' + widgetFrameID + ' form input:visible:first').focus();
        });
    },

    minimizeWidgetFrame: function(widgetFrameID) {
        this.hideMenu(widgetFrameID);

        $j('#jive-widgetframe-body_' + widgetFrameID).hide();
        $j('#jive-widgetframe-maxlink_' + widgetFrameID).show();
        $j('#jive-widgetframe-minlink_' + widgetFrameID).hide();
    },

    maximizeWidgetFrame: function(widgetFrameID) {
        this.hideMenu(widgetFrameID);

        $j('#jive-widgetframe-body_' + widgetFrameID).show();
        $j('#jive-widgetframe-minlink_' + widgetFrameID).show();
        $j('#jive-widgetframe-maxlink_' + widgetFrameID).hide();
    },

    chooseLayout: function(layoutID) {

        if (this.args.currentLayoutID != layoutID) {
            $j('#jive-layout-id' + this.args.currentLayoutID).removeClass('jive-layout-selected');
            $j('#jive-layout-id' + layoutID).addClass('jive-layout-selected');
            this.args.currentLayoutID = layoutID;
        }

        $j(document.body).addClass('jive-widget-progresscursor');

        // save layoutID, http post to widget-layout with layoutID, objectID, objectType
        var pars = {
            'layoutID':layoutID,
            'widgetTypeID': this.args.widgetTypeID,
            'parentObjectType': this.args.parentObjectType,
            'parentObjectID': this.args.parentObjectID
        };
        var instance = this;
        $j("#jive-widget-content").load(this.args.layoutURL, pars, function() {
            $j(document.body).removeClass('jive-widget-progresscursor');
            instance.loadSortables();
        });
    },

    disableSortables: function() {
        // couldn't be easier, but just try to find the two places we turn it back on!
        $j('.jive-widget-container').sortable("disable");
    },

    enableSortables: function() {
        // couldn't be easier, but just try to find the two places we turn it back on!
        $j('.jive-widget-container').sortable("enable");
    },

    loadSortables: function() {
        // load up sortable columns
        var sortables = $j('.jive-widget-container');
        var updateWhileDragging = !($j.browser.msie && $j.browser.version < 9);
        var instance = this;

        makeHandlesUnselectable(sortables);

        sortables.each(function () {
            $j(this).sortable({
                appendTo: "body",
                delay: 100,
                distance: 10,
                items: 'div.jive-widget',
                connectWith: sortables.slice().not(this),
                helper: 'original',
                handle: 'h4.jive-widget-handle',
                forceHelperSize: 'false',
                forcePlaceholderSize: 'true',
                opacity: 0.7,
                revert: true,
                tolerance: 'intersect',
                placeholder: 'emptyPlaceMarker',
                start: function(event, ui) {
                    if (updateWhileDragging) {
                        // Update the widget for the new column size
                        instance.loadAllSizes(event, ui.item, ui.helper);
                    }
                },
                over: function(event, ui) {
                    var $frameBody = $j(ui.helper).find(".jive-widget-body");

                    if ($j(event.target).hasClass('jive-widget-container-large')) {
                        $j(ui.helper).children("div.jive-widgetsize-small").removeClass('jive-widgetsize-small').addClass('jive-widgetsize-large');
                        instance.toggleFrameSize($frameBody, 'small', false);
                        instance.toggleFrameSize($frameBody, 'large', true);
                    } else {
                        $j(ui.helper).children("div.jive-widgetsize-large").removeClass('jive-widgetsize-large').addClass('jive-widgetsize-small');
                        instance.toggleFrameSize($frameBody, 'small', true);
                        instance.toggleFrameSize($frameBody, 'large', false);
                    }
                    $j(ui.helper).find('.jive-box-header-placeholder').addClass('jive-box-header');
                    $j(ui.helper).addClass('jive-widget-new-dragover-style');

                    //todo: pretty sure this is an open bug in jquery ui 1.7.1, but for now, manually set the width
                    $j(ui.helper).width($j(event.target).width());
                },
                update: function(event, ui) {
                    // persist the update for this column
                    $j(document.body).addClass('jive-widget-progresscursor');

                    if (!updateWhileDragging) {
                        // Update the widget for the new column size
                        instance.loadAllSizes(event, ui.item, ui.item);
                    }

                    var container = $j(event.target);
                    var containerID = event.target.id.split('_')[1];

                    // if there are any new items, we need to handle those
                    var newblocks = container.find('div.jive-widget-new');
                    if (newblocks.length > 0) {
                        newblocks.each(function() {
                            // get the data out
                            var newWidget = this;
                            var widgetID = $j(newWidget).data('widgetId');
                            var sequence = container.find('.jive-widget, .jive-widget-new').toArray().map(function(e) {
                                return $j(e).data('widgetId');
                            });
                            var index = sequence.indexOf(widgetID);
                            var pars = {
                                'widgetID':widgetID,
                                'widgetTypeID': instance.args.widgetTypeID,
                                'parentObjectType': instance.args.parentObjectType,
                                'parentObjectID': instance.args.parentObjectID,
                                'containerID':containerID,
                                'index':index,
                                'size' : container.hasClass('jive-widget-container-small') ? 1 : 2
                            };
                            // create new frame
                            $j.post(instance.args.createURL, pars, function(data) {
                                $j(document.body).addClass('jive-widget-progresscursor');
                                var $replacement = $j(data);
                                $j(newWidget).replaceWith($replacement);
                                makeHandlesUnselectable($replacement);
                            });
                        });

                    } else {
                        // load up frames
                        var frameIDs = [];
                        container.find("div.jive-widget").each(function() {
                            var widgetID = $j(this).data('widgetId');
                            frameIDs.push(widgetID);
                        });

                        // set parameters
                        var pars = {
                            'frames': frameIDs,
                            'widgetTypeID': instance.args.widgetTypeID,
                            'parentObjectType': instance.args.parentObjectType,
                            'parentObjectID': instance.args.parentObjectID,
                            'containerID': containerID
                        };
                        // make ajax request
                        $j.post(instance.args.sortURL, pars, function() {
                            $j(document.body).removeClass('jive-widget-progresscursor');
                        });
                    }
                }
            });
        });

    },

    loadFullDescription: function($readMore) {
        $readMore.parent().slideUp('fast');
        $readMore.parent().prev('p').slideDown('slow');
        $readMore.hide();
        return false;
    },

    // get widget frame id from inside the widget body
    getWidgetFrameID: function (element) {
        var widgetBody = $j(element).closest(".jive-widget-body");
        if (widgetBody) {
            var widgetBodyID = widgetBody.attr("id");
            if (widgetBodyID) {
                var widgetFrameID = widgetBodyID.substr(widgetBodyID.lastIndexOf("_")+1);
                if (widgetFrameID) {
                    return widgetFrameID;
                }
            }
        }
        return 0;
    },

    toggleFrameSize: function($frameBody, size, visible) {
        if (size === 1) { size = 'small'; }
        if (size === 2) { size = 'large'; }

        var $body = $frameBody.filter('[id^="jive-widgetframe-body"]');
        var $frame = $body.children('.content-'+ size);

        if ($frame.length < 1) {
            $frame = $j('<div/>').addClass('content-'+ size).appendTo($body);
        }

        $frame.toggle(visible);
        return $frame;
    },

    loadAllSizes: function(event, widget, uiHelper) {
        var smallContainer = $j(uiHelper).find(".content-small");
        var largeContainer = $j(uiHelper).find(".content-large");
        var frameID = widget.data('widgetId');
        var $frameBody = $j('#jive-widgetframe-body_' + frameID);
        var minimized = $frameBody.is(":hidden");
        var sizes = { small: 1, large: 2 };
        var instance = this;

        var smallContainerIsEmpty = smallContainer.is(':empty') || smallContainer.length <= 0;
        var largeContainerIsEmpty = largeContainer.is(':empty') || largeContainer.length <= 0;

        var loadWidget = function($container, size, containerClass) {
            var $loading;

            if (!$container || $container.data('isLoaded')) {
                return;
            }

            if ($container.length <= 0) {
                $container = instance.toggleFrameSize($frameBody, size, false);
            }

            if (!minimized) {
                $loading = $j('#jive-widgetframe-loading_' + frameID).show();
            }
            $container.safelyLoad(instance.args.renderURL, { data: {
                'frameID': frameID,
                'size': sizes[size],
                'widgetType': instance.args.widgetTypeID,
                'container': instance.args.parentObjectID,
                'containerType': instance.args.parentObjectType
            }}, function() {
                if (!minimized) {
                    $loading.hide();
                    $frameBody.show();
                }
                // fire an event that this widget frame has loaded
                $j('#jive-widgetframe_' + frameID).trigger('frameLoaded');
            });

            $container.data('isLoaded', true);
        };

        var $smallContainer = smallContainerIsEmpty ? $j(smallContainer) : null;
        var $largeContainer = largeContainerIsEmpty ? $j(largeContainer) : null;
        loadWidget($smallContainer, 'small', "content-small");
        loadWidget($largeContainer, 'large', "content-large");
    }

});

var WidgetProps = $Class.extend({
    // object variables
    args: {},
    editorCounter: 0,

    init: function(args) {
        this.args = args;
        this.editorCounter = 0;
    },

    incrementEditorCount: function() {
        this.editorCounter++;
        var editorFrames = $j('iframe').filter(function(index) {
                // you can only access the contentWindow prop if the iframe content is local, you'll get an
                // error if you try to access it when it contains something from a remote site
                try {
                    return typeof($j(this).get(0).contentWindow.setEditorValue) != "undefined";
                } catch(e) {
                    return false;
                }
            });
        if (this.editorCounter == editorFrames.length) {
            this.submitEditorValues();
        }
    },
    loadEditorValues: function() {
        // Enable widget sorting
        widgets.enableSortables();
 
        // Special case a username property.  If we have one, we need to ensure that
        // whatever is in the display box for the selected user is synced with the hidden
        // field that actually submits the username for the user to the back end.
        var frameID = this.args.widgetFrameID;
        if (typeof(window['userSynced' + frameID]) != 'undefined') {
            var isSynced = window['userSynced' + frameID];
            if (!isSynced) {
                $j('#username-holder' + frameID).val($j('#editUserID' + frameID).val());
            }
        }

        // Copy content from any RTE instances.
        $j('#jivewidgetpropform-'+this.args.widgetFrameID).find('textarea').each(function() {
            var $input = $j(this)
              , rte = $input.data('rte');
            if (rte) {
                // refreshes the rte to update its <textarea> with the latest value
                // if its out of sync
                $input.val(rte.getHTML());
            }
        });

        this.submitEditorValues();
    },

    killRTEs: function() {
        $j('#jivewidgetpropform-'+this.args.widgetFrameID).find('textarea').each(function() {
            var $input = $j(this)
              , rte = $input.data('rte');
            if (rte) {
                // refreshes the rte to update its <textarea> with the latest value
                // if its out of sync
                rte.destroy();
            }
        });
    },

    submitEditorValues: function() {
        var that = this;
        $j('#jive-widgetprops-save_'+this.args.widgetFrameID).prop('disabled', true);
        $j('#jive-widgetprops-cancel_'+this.args.widgetFrameID).prop('disabled', true);
        $j(document.body).addClass('jive-widget-progresscursor');
        var instance = this;
        var pars = $j('#jivewidgetpropform-'+this.args.widgetFrameID).serialize(true);
        var size = $j('#jive-widgetframe-body_' + this.args.widgetFrameID).parent().hasClass('jive-widgetsize-large') ? 2 : 1;
        pars = pars + "&size=" + size;
        $j.ajax({
            url: this.args.submitURL,
            type: 'POST',
            data: pars,
            dataType: 'html',
            success: function(response) {
                that.killRTEs();
                $j('#jive-widgetframe-body_' + instance.args.widgetFrameID).html(response);
                $j(document.body).removeClass('jive-widget-progresscursor');
                $j('#jive-widgetframe_' + instance.args.widgetFrameID).effect("highlight", {}, 3000);
                $j(this).css({overflow: 'hidden'});
                $j('.jive-widget').removeClass('jive-widget-active');
            }
        });
    },

    doCancel: function() {
        widgets.enableSortables();

        $j('#jive-widgetprops-save_'+this.args.widgetFrameID).prop('disabled', true);
        $j('#jive-widgetprops-cancel_'+this.args.widgetFrameID).prop('disabled', true);
        $j(document.body).addClass('jive-widget-progresscursor');
        var instance = this;
        var pars = {
            'widgetFrameID':this.args.widgetFrameID,
            'widgetTypeID':this.args.widgetTypeID,
            'size': $j('#jive-widgetframe-body_' + this.args.widgetFrameID).parent().hasClass('jive-widgetsize-large') ? 2 : 1
        };
        $j('#jive-widgetframe-body_' + this.args.widgetFrameID).load(this.args.cancelURL, pars, function() {
            $j(document.body).removeClass('jive-widget-progresscursor');
            $j('#jive-widgetframe_' + instance.args.widgetFrameID).effect("highlight", {}, 3000);
            $j(this).css({overflow: 'hidden'});
            $j('.jive-widget').removeClass('jive-widget-active');
        });
        this.killRTEs();
    }
});

$j(function() {
    /* -------------------------------------------------------------------------------- */
    /* WIDGET OPTION SCRIPTS */

    var closeMenuSelector = ':not(.jive-widget-menu, .jive-widget-menu *, '+
        '.jive-widget-menu-btn-link, .jive-widget-menu-btn-link *)';

    function killMenus(event) {
        if ($j(event.target).is(closeMenuSelector)) {
            $j(".jive-widget-menu").hide();
            $j(".jive-widget-menu-btn-link").removeClass("currentMenu");

            if ($j(event.target).closest('.jive-widget-edit-container').length === 0 ) {
                $j('.jive-widget').removeClass('jive-widget-active');
            }

            $j(document).unbind('click', killMenus);
        }
        // Should not return false!
    }

    /* handle click event of 'widget options' buttons */
    $j(document)
    .undelegate('.jive-widget-menu-btn-link', 'click')
    .delegate('.jive-widget-menu-btn-link', 'click', function(event) {
        var $button = $j(this)
          , $widget = $button.closest('.jive-widget');

        $j(document).unbind('click', killMenus);

        /* if a widget menu was already active, deactivate it */
        if ($button.hasClass("currentMenu")) {
            if ( ! ($widget.find(".jive-widget-edit-container").is(":visible"))) {
                $widget.removeClass('jive-widget-active');
            }
            $button.removeClass("currentMenu");
            $j(".jive-widget-menu").hide();

        } else {
            /* otherwise deactivate ALL 'widget options' buttons... */
            $j('.jive-widget').removeClass('jive-widget-active');
            $j(".jive-widget-menu-btn-link").removeClass("currentMenu");
            $j(".jive-widget-menu").hide();
            /* activate this drop down */
            $button.addClass("currentMenu");
            $button.closest(".jive-widget-header-options").find(".jive-widget-menu").slideDown(80);
            $widget.addClass('jive-widget-active');

            /* attach a one-time event to the body that kills all menus when you click the body */
            $j(document).bind('click', killMenus);
        }

        event.preventDefault();
    });
});

function makeDraggable(draggables) {
    // load up draggables
    draggables.draggable({
        helper:'clone',
        connectToSortable:'.jive-widget-container',
        opacity: 0.7,
        revert: 'invalid',
        revertDuration: 200,
        zIndex: 8000,
        drag: function() {
            $j('.ui-draggable-dragging').addClass('jive-widget-new-dragging');
            $j('.ui-draggable-dragging .dragToAdd').hide();
            $j('.ui-draggable-dragging .widgetTitle').show();
        }
    });
    makeHandlesUnselectable(draggables);
}

function makeHandlesUnselectable(elem) {
    $j('h4.jive-widget-handle', elem).find('*').andSelf().prop('unselectable', true);
}
