/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j */

jive.namespace('Rate');

jive.Rate.Main = function(options) {

    var containerID = options.containerID;
    var containerType = options.containerType;
    var container = options.container;
    var resourceType = options.resourceType;
    var resourceID = options.resourceID;
    var i18nhelper      = options.i18n;

    var description     =   options.body,
        element         = options.element ? options.element : '#jive-rating-content',
        rteView;
    /**
     * Renders a mini rte form that is appended to the given DOM container.
     *
     */
    function renderForm(target, options) {
        window.jive.CommentApp.comments.closeForms();
        if(rteView)
        {
            rteView.remove();
        }
        // Render the new form.
        jive.CommentApp.comments.renderForm(jive.CommentApp.FormView, target, $j.extend({ commentMode: 'rate', i18n:i18nhelper }, options));
    }

    $j(document).ready(function() {
        var $element = $j(element);

        $j(function() {
            $element.find('.j-comment-on-rating').click(function() {
                renderForm($element.find(".jive-rating-comment-body"), {
                    formActionContainer: ".jive-rating-comment-body",
                    bodyContent: description,
                    containerType: containerType,
                    containerID: containerID,
                    resourceType: resourceType,
                    resourceID: resourceID,
                    rteOptions: options.rteOptions
                });
                $element.find('.jive-content-avgrating').css('height', '30px').animate({
                    padding: '0', width: '0', opacity: '0'}, 500, function() {
                        $element.find('.j-rating-comment').animate({opacity: 'toggle'}, 800).slideDown();
                });
                $element.find('.jive-content-userrating').animate({padding: '0'}, 500).css('border', 'none');
                $element.find('.j-rating-comment-instruct').animate({
                    width: '0', opacity: '0', padding: '0'}, 400, function() { $j(this).hide() }).css('border', 'none');
                $element.find(".j-rating-container").removeClass("j-rating-container-active");
                $element.find(".j-rating-container").addClass("j-rating-container-active-tab");
                return false;
            });
        });

        var resetRatings = function() {
            $element.find('.j-rating-comment').hide();
            $element.find('.jive-content-userrating').removeAttr("style");
            $element.find('.jive-content-avgrating').removeAttr("style");
            $element.find('.j-rating-comment-instruct').removeAttr("style");
            $element.find(".j-rating-container").removeClass("j-rating-container-active");
            $element.find(".j-rating-container").removeClass("j-rating-container-active-tab");
        };

        jive.CommentApp.comments.addCommentListViewListener('cancelComment', resetRatings);
        jive.CommentApp.comments.addCommentListViewListener('savedComment', resetRatings);
        jive.CommentApp.comments.addCommentListViewListener('createComment', resetRatings);
        jive.CommentApp.comments.addCommentListViewListener('replyComment', resetRatings);
        jive.CommentApp.comments.addCommentListViewListener('editComment', resetRatings);
    });

};
