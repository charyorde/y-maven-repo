/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Moderation');  // Creates the namespace if it does not already exist.

jive.Moderation.InboxView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    protect.init = function(opts) {
        var view = this;
        view.currentRow = null;
        view.processKey = true;

        this.$moderationContainer = $j('#jive-inbox-moderation-container');
        this.$moderationContainer.delegate('.js-pagination a', 'click', function(event) {
            view.showSpinner();
            var href = $j(this).attr('href');
            view.emitP('paginate', href).addCallback(function(data) {
                view.update(data);
            });
            event.preventDefault();
        });
        this.$moderationContainer.delegate('#filterForm input[type=submit]', 'click', function(event) {
            var form = $j(this).closest('form');
            view.emit('filter', form);
            event.preventDefault();
        });

        this.$moderationContainer.delegate('td.j-td-icon, td.j-td-title, td.j-td-date, td.j-td-mod-abuse, td.j-td-mod-action', 'click', function(e) {
            var rowIndex = $j(this).closest('tr').data('message-index');
            view.setCurrentRow(rowIndex);
            var href = $j(e.target).attr('href');
            if (typeof(href) == 'undefined' || href == "#" || href.substring(0,12) == "javascript:") {
                e.preventDefault();
            }
        });

        this.$moderationContainer.delegate('a.js-mod-type, a.js-mod-subject', 'click', function(e) {
            var rowIndex = $j(this).closest('tr').data('message-index');
            view.toggleBody(rowIndex);
            e.preventDefault();
        });

        this.$moderationContainer.delegate('a.j-mod-kbd-commands', 'click', function(e) {
            var $this = $j(this),
                $kbTips = view.$moderationContainer.find('.js-keyboard-tips');
            $kbTips.popover({
                context: $this,
                darkPopover: false,
                destroyOnClose: false,
                putBack: true
            });
            e.preventDefault();
        });

        //handle keyboard events
        $j(document).keyup(function(event) {
            view.handleEvent(event.keyCode);
        });
    };

    this.update = function(data) {
        this.$moderationContainer.html(data);
        this.hideSpinner();
        this.setCurrentRow(1);
        this.setDDState();
        this.bindHandlers();
    };

    protect.bindHandlers = function(){
        var view = this;

        view.globalToggle = $j('#js-mod-dd-messages');

        view.globalToggle.change(function(e) {
            view.toggleAll($j(this).val());
        });

        view.globalToggle.focus(function(e) {
            view.processKey = false;
        });

        view.globalToggle.blur(function(e) {
            view.processKey = true;
        });

        $j('.js-mod-dd-message').change(function(e) {
            var rowIndex = $j(this).closest('tr').data('message-index');
            view.toggleHighlight(this, rowIndex);
        });

        $j(".jive-mod-showtext").click(function(e){
            view.showAll();
            e.preventDefault();
        });

        $j(".jive-mod-hidetext").click(function(e){
            view.hideAll();
            e.preventDefault();
        });

        $j("input[name='modnote'], #filterForm input[type='text']").focus(function(e) {
            view.processKey = false;
        });
        $j("input[name='modnote'], #filterForm input[type='text']").blur(function(e) {
            view.processKey = true;
        });

        $j('.jive-table-mod-editNote').click(function(e) {
            var a = $j(this);
            var note = a.closest('.jive-table-mod-notebody').find('span.notevalue').first().text()
            view.editNote(a.data('workflow-id'), a.data('user-id'), note);

            e.preventDefault();
        });

        $j('.js-save-note').click(function(e) {
            var a = $j(this);
            view.saveNote(a.data('workflow-id'), a.data('user-id'));
            e.preventDefault();
        });

        $j("#messageForm").bind('submit.confirmModal',function(e){

            // only show the conformation if needed
            if ($j('#showAgain').val() == "true") {
                e.preventDefault();
                view.confirmForm();
            }
        });
    };

    protect.handleEvent = function(keyCode) {
        if (this.processKey) {
            if (keyCode == 40) {  // KEY_DOWN
                this.setNextRow(this.currentRow);
            } else if (keyCode == 38) { // KEY_UP
                this.setPreviousRow(this.currentRow);
            } else if (keyCode == 83) {  // s - show / hide (space - 32)
                this.toggleBody(this.currentRow.index);
            } else if (keyCode == 65) {  // a - approve
                var el = $j("#mod-dd-message-" + this.currentRow.index);
                el.value = 1;
                this.toggleHighlight(el, this.currentRow.index);
            } else if (keyCode == 82) {  // r - reject
                var el = $j("#mod-dd-message-" + this.currentRow.index);
                el.value = 3;
                this.toggleHighlight(el, this.currentRow.index);
            } else if (keyCode == 69) {  // e - edit
                var el = $j("#mod-dd-message-" + this.currentRow.index);
                el.value = 2;
                this.toggleHighlight(el, this.currentRow.index);
            } else if (keyCode == 68) {  // d - defer
                var el = $j("#mod-dd-message-" + this.currentRow.index);
                el.value = 0;
                this.toggleHighlight(el, this.currentRow.index);
            }
        }
    };

    protect.setNextRow = function(start) {
        var index = $j(start).data("message-index");
        if (index) {
            this.setCurrentRow(parseInt(++index));
        }
    };

    protect.setPreviousRow = function(start) {
        var index = $j(start).data("message-index");
        if (index) {
            this.setCurrentRow(parseInt(--index));
        }
    };

    protect.setCurrentRow = function(index) {
        if (this.currentRow != null && this.currentRow.index != index) {
            $j("#mod-row-img-" + this.currentRow.index).hide();
            $j("#mod-subject-" + this.currentRow.index).blur();
        }
        if (this.rowExists(index)){
            this.currentRow = $j("#mod-message-row-" + index);
            $j("#mod-row-img-" + index).show();
            this.currentRow.index = index;
        } else if (this.rowExists(1)) {
            this.setCurrentRow(1);
        }
    };

    protect.rowExists = function(index){
        return $j("#mod-message-row-" + index).length > 0;
    };

    protect.setDDState = function(theform) {
        var view = this;
        $j('#mod-message-tbody [id^=mod-dd-message-]').each(function() {
            var theel = this;
            var index = theel.id.split('-').last();
            view.toggleHighlight(theel, index);
        });
    };

    protect.toggleAll = function(val) {
        var view = this;
        $j('#mod-message-tbody [id^=mod-dd-message-]').each(function() {
            var theel = this;
            var index = theel.id.split('-').last();
            theel.value = val;
            view.toggleHighlight(theel, index);
        });
    };

    protect.toggleHighlight = function(el, index) {
        var row = null;
        var $el = $j(el);
        if ($el.parent().length > 0 && $el.parent().parent().length > 0) {
            row = $el.parent().parent();
        }
        if (row && row.length > 0) {
            if (el.value == 1) {
                $j('#jive-table-mod-view-' + index).removeClass().addClass("jive-table-mod-view-approve");
                $j(row).removeClass().addClass("jive-mod-msg-row-app");
                $j(el).val('1');
            } else if (el.value == 3) {
                $j('#jive-table-mod-view-' + index).removeClass().addClass("jive-table-mod-view-reject");
                $j(row).removeClass().addClass("jive-mod-msg-row-rej");
                $j(el).val('3');
            } else {
                this.viewBody(index);
                $j('#jive-table-mod-view-' + index).removeClass().addClass("jive-table-mod-view");
                $j(row).removeClass().addClass("jive-mod-msg-row");
                $j(el).val('');
            }
        }
    };

    protect.viewBody = function(index) {
        $j("#mod-view-message-" + index).show();
    };

    protect.showBody = function(index) {
        $j("#mod-message-body-" + index).show();
    };

    protect.hideBody = function(index) {
        $j("#mod-message-body-" + index).hide();
    };

    protect.toggleBody = function(index) {
        $j("#mod-message-body-" + index).toggle();
    };

    protect.showAll = function() {
        $j('#mod-message-tbody [id^=mod-message-body-]').show();
    };

    protect.hideAll = function() {
        $j('#mod-message-tbody [id^=mod-message-body-]').hide();
    };

    protect.decrementCount = function(containerID, containerType) {
        var pending = $j("#pendingCount" + containerID + "-" + containerType);
        var total = $j("#totalCount");
        var pendingValue = pending.text();
        var totalValue = total.text();

        if (pendingValue && totalValue) {
            pendingValue = parseInt(pendingValue, 10) - 1;
            totalValue = parseInt(totalValue, 10) - 1;
            pending.text(pendingValue);
            total.text(totalValue);
        }
    };

    protect.editNote = function(workflowID, userID, note) {
        var view = this;
        $j('#modnote01-' + workflowID + '-' + userID).val(note);
        var noteBox = $j('#noteBox-' + workflowID + '-' + userID);
        noteBox.show();
        var noteForm = $j('#jive-mod-noteform-' + workflowID + '-' + userID);
        $j('#jive-table-mod-notesubmit-' + workflowID).one('click', function() {
            view.saveNote(workflowID, userID);
        });
        noteForm.show();
    };

    protect.saveNote = function(workflowID, userID) {
        var element = $j('#jive-table-mod-note-' + workflowID);
        var d = new Date();
        var formValue = $j('#modnote01-' + workflowID + '-' + userID).val();
        var existingNote = $j('#noteBox-' + workflowID + '-' + userID);
        existingNote.show();

        var noteValue = $j('#noteBox-' + workflowID + '-' + userID + ' .notevalue');
        noteValue.text(formValue);

        var noteForm = $j('#jive-mod-noteform-' + workflowID + '-' + userID);
        noteForm.hide();

        $j("#mod_note-" + workflowID).val(formValue);
        this.emit('note', workflowID, userID, formValue);
    };

    protect.confirmForm = function() {

        var $dialogModal = $j('#jive-modal-confirm');

        $dialogModal.lightbox_me({
            destroyOnClose: false,
            onLoad: function() {

                $dialogModal.on("click", "#jive-approve-button", function(e) {

                    $j("#showAgain").val($j('#dontShowAgainModal').is(':checked') ? "false" : "true");

                    $j("#messageForm").unbind('submit.confirmModal');

                    e.preventDefault();
                    $j("#messageForm").submit();

                });

            },

            closeSelector: ".j-modal-close-top, .close"

        });

    }

});

