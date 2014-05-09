jive.namespace('Wall');

/**
 * Make sure we only include this file once per page load.  If we do not have this block here there are 2 cases where
 * this script could be loaded multiple times:
 * 1) When resource combined is false behavior could be different from when it's on, ideally the behavior should be the same.
 * 2)  If an ajax request is made for an ftl with javascript includes the file will be reloaded (assuming it was already
 * loaded on page load)
 *
 * At a later date we can roll this work into namespace or a new function that is similar to namespace
 *
 * @depends template=jive.wall.renderStatusSuccess
 */
if(!jive.Wall.EditorView){

jive.Wall.EditorView = function(container, options) {
    var that = this;
    var $container = $j(container);
    var notificationView = new jive.shared.NotificationView(options.notificationContainer, {info:'.jive-info-box:first',
        warn:'.jive-warn-box:first',
        error:'.jive-error-box:first'});
    var formWaitingView = new jive.shared.FormWaitingView($container, {containerPadding:0});
    this.getContainer = function() {
        return $container;
    };

    this.entryPublished = function(entry) {
        this.dismissStatusSuccess();

        var parentContainer = $container.parent();

        // Handle userbar quick create status update a bit differently (CS-20594)
        var jiveContentCreatePanel = $container.closest('div.jive-userbar-slidedown-status');
        if (jiveContentCreatePanel.length > 0) {
            jiveContentCreatePanel.find('div.j-wall-form').children().fadeOut().hide();
            jiveContentCreatePanel.find('div#jive-choose-form-links').fadeOut().hide();
            parentContainer = jiveContentCreatePanel.find('div.j-wall-form-container');
        }

        parentContainer.append(jive.wall.renderStatusSuccess({i18n:options.i18n, entry:entry}));
        parentContainer.find('.j-success-post-dismiss').click(function(){that.dismissStatusSuccess()});
        parentContainer.find('.j-mb-last-update').hide();
        parentContainer.find('.j-successful-post').css('opacity', '0').slideDown(500, function(){
            $j(this).animate({opacity: 1}, 200);
            //display attachments
            if(entry.meta.length > 0){
                $j(this).find('.jive-js-image-container').show().animate({'opacity': 1}, 500);
            }
        });
    };

    this.dismissStatusSuccess = function(){
        var statusContainer = $container.parent().find(".j-successful-post");
        if(statusContainer.length > 0){
            statusContainer.slideUp(null, function(){$j(this).remove();});

            var jiveContentCreatePanel = $container.closest("div.jive-userbar-slidedown-status");
            if (jiveContentCreatePanel.length > 0){
                jiveContentCreatePanel.slideUp();
            }
        }
    };

    this.entryPublishedRepost = function(modal, entry, closeCallback) {
        this.dismissStatusSuccess();
        var modalContent = modal.find('.jive-modal-content');
        if (modalContent.length > 0) {
            modalContent.empty();
            modalContent.append(jive.wall.renderStatusSuccess({i18n:options.i18n, entry:entry}));
            modalContent.find('.j-success-post-dismiss').click(function(){that.dismissStatusSuccessRepost(closeCallback);});
            modalContent.find('.j-successful-post').css('opacity', '0').slideDown(500, function(){
                $j(this).animate({opacity: 1}, 200);
                //display attachments
                if(entry.meta.length > 0){
                    $j(this).find('.jive-js-image-container').show().animate({'opacity': 1}, 500);
                }
            });
        }
    };

    this.dismissStatusSuccessRepost = function(closeCallback){
        var statusContainer = $container.find(".j-successful-post");
        if(statusContainer.length > 0){
            statusContainer.slideUp(null, function(){$j(this).remove();});
        }
        closeCallback();
    };

    this.entryPublishedInfo = function(msg) {
        notificationView.info(msg);
    };

    this.entryPublishedWarn = function(msg) {
        notificationView.warn(msg);
    };

    this.entryPublishedError = function(msg) {
        notificationView.error(msg || options.i18n.formPostedError);
    };
    
    $container.find("form.wall-form").find(":button").not(".close").click(function() {
        that.emit("submit");
        that.disableForm();
    });

    function handleCharacterLenMsg(action, params){
    	jive.Wall.EditorView.handleCharacterLenMsg(action, params, $container);
    }

    this.handleCharacterLenMsg = handleCharacterLenMsg;

    this.disableForm = function(){
        formWaitingView.disableForm();
    };

    this.enableForm = function(){
        formWaitingView.enableForm();
    };
};

jive.conc.observable(jive.Wall.EditorView.prototype);

jive.Wall.EditorView.handleCharacterLenMsg = function (action, params, $container){
    if(action == 'error'){
        $container.find('.j-wall-warn').hide();
        var errorElem = null;
        if (params.charOver == 1) {
            $container.find('.j-wall-error-over-many').hide();
            errorElem = $container.find('.j-wall-error-over-one');
        }
        else {
            $container.find('.j-wall-error-over-one').hide();
            errorElem = $container.find('.j-wall-error-over-many');
        }
        errorElem.find('.j-number-over').html(params.charOver);
        errorElem.show();

    } else if(action == 'warning'){
        $container.find('.j-wall-error-over-one').hide();
        $container.find('.j-wall-error-over-many').hide();
        var warnElem = $container.find('.j-wall-warn');
        warnElem.find('.j-number-left').html(params.charLeft);
        warnElem.show();
    } else if (action == 'ok'){
        $container.find('.j-wall-error-over-one').hide();
        $container.find('.j-wall-error-over-many').hide();
        $container.find('.j-wall-warn').hide();
    }
};

}
