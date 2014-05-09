/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Handles UI for a form for editing or creating an announcement.
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.browse.activityinfo.*
 */
jive.namespace('Announcements');  // Creates the jive.Activity namespace if it does not already exist.

jive.Announcements.EditView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    this.init = function(announcement, options) {
        var view = this;

        this.rteOptions = options.rteOptions;
        this.$element = $(options.element);
        this.$modal = this.$element.closest('.jive-modal');
        this.$form = this.$element.find('.j-form-announcements');

        var $form = this.$form;

        //bind save link
        $form.find(':submit').prop('disabled', false);
        $form.bind('submit.announcements', function(e) {
            var announcement = view.getAnnouncementFromForm()
              , $submit = $(this).find(':submit').prop('disabled', true);
            view.emitP('save', announcement)
            .addErrback(function(message) {
                //The source does form field validation before calling create or update
                // and will throw exceptions as alerts through the errorHandler callback below
                $('<p/>', { text: message }).message({ style: 'error' });
                $submit.prop('disabled', false);
            });
            e.preventDefault();
        });

        //bind cancel link
        $form.find('.back').bind('click.announcements', function(e) {
            view.emit('cancel');
            e.preventDefault();
        });


        //if "immediately" is selected, then clear out start date value
        $form.find('#annActiveNow').bind('click.announcements', function(){
            $form.find('#annPublishDate').val('');
        });

        //if "specific number of days" is selected, then clear out end date value
        $form.find('#annExpireRelative').bind('click.announcements', function(){
            $form.find('#annEndDate').val('');
        });

        $form.find('#annExpiresDays').bind('click.announcements', function(){
            $form.find('#annExpireRelative').prop('checked', true);
        });

        //we need to clean up the RTE and draft on close
        this.$modal.one('lightboxclose', function() {
            view.destroy();
        });

        // Defining the content property determines what elements are
        // hidden or shown when the hide() and show() methods are
        // called.
        this.content = $()
            .add(this.$element.find('.jive-modal-title-'+
                (announcement.id ? 'edit' : 'add') +
            '-announcement'))
            //.add('#jive-modal-announcements .jive-modal-title-edit-announcement')
            .add(this.$element.find('.jive-modal-create-announcement'))
            .add(this.$element.find('.jive-modal-edit-announcement'))
            .add(this.$element.find('.overflow'));

        this.populate(announcement);
    };

    protect.populate = function(ann) {
        this.insertFormValues(ann);
        this.initRTE(this.$element.find('.jive-rte'), {
            formActionContainer: '#jive-compose-buttons',
            bodyContent: ann.body,
            subject: ann.subject
        });
        if (!ann.id) {
            //* Only show the minor edit checkbox on create for home page announcements *//*
            if (ann.containerID == '1') {
                $('#minorAnnCheckbox').show();
                $('#jive-ann-minor-flag').prop('checked', true);
            }
            else {
                //* Hide the minor edit checkbox on create for container announcements *//*
                $('#minorAnnCheckbox').hide();
                $('#jive-ann-minor-flag').prop('checked', false);
            }
            $('#minorAnnCreateLabel').show();
            $('#minorAnnEditLabel').hide();
        }
        else {
            $('#minorAnnCreateLabel').hide();
            $('#minorAnnEditLabel').show();
            //* Always show the minor edit checkbox on edit for both home page and container specific announcements *//*
            $('#minorAnnCheckbox').show();
        }
        $('#subject01').focus();
    };

    protect.insertFormValues = function (ann) {
        $('#annID').val(ann.id);
        $('#subject01').val(ann.subject);
        $('#annPublishDate').val(ann.publishDate);
        $('#annEndDate').val(ann.endDate);

        //set the minorCreateEdit flag for existing announcements based on the value set when the announcement was created
        if (ann.minorCreateEdit) {
            $('#jive-ann-minor-flag').val(ann.minorCreateEdit);
            if (ann.minorCreateEdit == 'true') {
                $('#jive-ann-minor-flag').prop('checked', true);
            }
            else {
                $('#jive-ann-minor-flag').prop('checked', false);
            }
        }
        if (ann.publishDate) {
            $('#annActiveLater').prop('checked', true);
            $('.activeDatePicker').show();
        }
        else {
            $('#annActiveNow').prop('checked', true);
            $('.activeDatePicker').hide();
        }
        if (ann.endDate) {
            $('#annExpireLater').prop('checked', true);
            $('.expiresDatePicker').show();
            $('#annExpiresDays').hide();
        }
        else {
            $('#annExpireRelative').prop('checked', true);
            $('.expiresDatePicker').hide();
            $('#annExpiresDays').show();
        }
        $('#annExpiresDays').val(7);
    };

    protect.getAnnouncementFromForm = function(formName) {
        var view = this;
        var rootForm = '';
        if (typeof(formName) != 'undefined') {
            rootForm = '#' + formName + ' ';
        }
        var activeMode = $(rootForm + ' input[name=activeMode]:checked').val();
        var expiresMode = $(rootForm + ' input[name=expiresMode]:checked').val();
        var expiresDays = $(rootForm + '#annExpiresDays').val();
        var minorCreateEdit = $(rootForm + '#jive-ann-minor-flag').is(':checked');
        var id = $(rootForm + '#annID').val();
        var ann = {
            subject: $(rootForm + '#subject01').val(),
            body: view.rteView.getHTML(),
            mobileEditor: view.rteView.isMobileOnly(),
            publishDate: $(rootForm + '#annPublishDate').val(),
            endDate: $(rootForm + '#annEndDate').val(),
            activeMode: activeMode,
            expiresMode: expiresMode,
            expiresDays: expiresDays,
            minorCreateEdit: minorCreateEdit
        };
        if (id > 0){
            ann = $.extend(ann, {id:id});
        }
        return ann;
    };

    /**
     * Renders a mini rte form that is appended to the given DOM container.
     */
    protect.initRTE = function($target, opts) {
        if (this.rteView) {
            // remove the old rteView
            this.rteView.killYourself();
            this.rteView.destroy();
        }
        var $element = $('<textarea id="wysiwygtext-announcement"></textarea>');

        //check if has child before appending...
        if ($target.find('#wysiwygtext-announcement').length < 1){
            $target.append($element);
        }

        $element.val(opts.bodyContent);
        $target.closest('form').find('#subject01').val(opts.subject);

        var rteOptions = $.extend({
            $element      : $element,
            isEditing     : opts.bodyContent.length > 0
        }, this.rteOptions);

        this.rteView = new jive.rte.RTEWrap(rteOptions);
    };

    protect.killRTE = function(){
        if (this.rteView) {
            // remove the old rteView
            this.rteView.killYourself();
            this.rteView.destroy();
        }
    };

    this.destroy = function() {
        this.$modal.unbind('lightboxclose');
        this.killRTE();

        // Unbind all event handlers bound by this class.
        this.$form.find('*').andSelf().unbind('.announcements');
        return this;
    };
});
