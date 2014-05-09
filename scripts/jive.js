/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j $Class SuperNote */
/*globals Jive */

function jiveToggleTab(thisPanel, otherPanels) {
    otherPanels.forEach(function(panel) {
        $j('[id="'+ panel +'-tab"]').removeClass('jive-body-tabcurrent active j-ui-elem');
        $j('[id="'+ panel +'"]').hide();
    });
    $j('[id="'+ thisPanel +'-tab"]').addClass('jive-body-tabcurrent active j-ui-elem');
    $j('[id="'+ thisPanel +'"]').show();
}

/*
jiveToggleOptions function
Function for toggling the state of an options element.
*/
function jiveToggleOptions(optionName) {
    var optionForm = $j('[id="'+ optionName +'-form"]'),
        optionHdr = $j('[id="'+ optionName +'-hdr"]');
    if (optionForm.is(':visible')) {
        optionForm.hide();
        optionHdr.removeClass().addClass('jive-compose-hdr-opt-closed');
    } else {
        optionForm.show();
        optionHdr.removeClass().addClass('jive-compose-hdr-opt');
    }
}

function jiveShowTopicFilter(thisID) {
    $j('[id="'+ thisID +'"]').toggle();
}

function jiveToggleSpaceDetails(thisID) {
    var ele = $j('[id="'+ thisID +'"]').toggle();

    if (ele.is(':visible')) {
        $j('[id="'+ thisID + '-less"]').show();
        $j('[id="'+ thisID + '-more"]').hide();
    } else {
        $j('[id="'+ thisID + '-less"]').hide();
        $j('[id="'+ thisID + '-more"]').show();
    }
}

function jiveToggleSpaceDetails2(thisID) {
    var ele = $j('[id="'+ thisID +'"]');
    if (ele.hasClass('jive-space-namedesc-full')) {
        ele.removeClass();
        $j('[id="'+ thisID + '-less"]').hide();
        $j('[id="'+ thisID + '-more"]').show();
    } else {
        ele.removeClass().addClass('jive-space-namedesc-full');
        $j('[id="'+ thisID + '-less"]').show();
        $j('[id="'+ thisID + '-more"]').hide();
    }
}

function callOnLoad(init) {
    $j(document).ready(init);
}

Jive = {};
Jive.AlertMessage = function(element, options) {
    options = options || {};

    $j('[id="'+ element +'"]').fadeIn(1000, function() {
        var that = $j(this);

        that.each(function() {
            if (options.beforeStart) {
                options.beforeStart(this);
            }
        });

        setTimeout(function() {
            that.fadeOut(1000, function() {
                that.each(function() {
                    if (options.afterFinish) {
                        options.afterFinish(this);
                    }
                });
            });
        }, 3000);
    });
};

var TimeoutExecutor = $Class.extend({
    init: function(callback, timeout) {
        this.callback = callback;
        this.timeout = timeout;
        this.currentlyExecuting = false;
        this.registerCallback();
    },
    registerCallback: function() {
        this.timeoutID = setTimeout(this.onTimerEvent.bind(this), this.timeout);
    },
    onTimerEvent: function() {
        try {
            this.currentlyExecuting = true;
            if (this.callback && this.callback instanceof Function) {
                this.callback();
            }
        }
        finally {
            this.currentlyExecuting = false;
            delete this.timeoutID;
        }
    },
    cancel: function() {
        if (!this.currentlyExecuting && this.timeoutID) {
            clearTimeout(this.timeoutID);
            delete this.timeoutID;
        }
    },
    reset: function() {
        if (!this.currentlyExecuting && this.timeoutID) {
            clearTimeout(this.timeoutID);
            delete this.timeoutID;
            this.registerCallback();
        }
    }
});
