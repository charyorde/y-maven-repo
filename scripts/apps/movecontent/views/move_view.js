/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Move.Content');

/**
 * Handles move content UI.
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.placepicker.* scope=client
 * @depends template=jive.movecontent.confirm scope=client
 */
jive.Move.Content.MoveView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery
      , _ = jive.Move.Content;

    protect.init = function() {

        var view = this;

        $(document).ready(function() {

            // move link click events for content and project pages
            $('#jive-link-move a, a#jive-link-move').click(function(event) {
                view.emit('browse');
                event.preventDefault();
            });
        });
    };

    this.confirm = function(data) {

        var view = this;
        var modal = $('.jive-modal');
        var confirmContent = jive.movecontent.confirm(data);

        view.prevContent = modal.children();
        view.visibleContent = view.prevContent.filter(':visible');
        view.visibleContent.hide();

        modal.append(confirmContent).removeClass('j-container-browse').trigger('resize');

        modal.find('.js-move-confirm').click(function(event) {
            view.emit('moveConfirmed', {
                targetContainerType: data.targetContainer.type,
                targetContainerID: data.targetContainer.id
            });
            event.preventDefault();
        });

        modal.find('.js-move-confirm-cancel').click(function(event) {
            modal.find('.js-move-confirm-section').remove();
            view.visibleContent.show();
            modal.addClass('j-container-browse').trigger('resize');
            event.preventDefault();
        });

        modal.find('.close').click(function(event) {
            modal.find('.js-move-confirm-section').remove();
            event.preventDefault();
        });

        $('body').find('.js_lb_overlay').click(function(event) {
            modal.find('.js-move-confirm-section').remove();
            event.preventDefault();
        });

    };

});
