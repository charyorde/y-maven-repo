/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/**
 * General view for status input box, makes use of microblogging status input component
 *
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/apps/microblogging/status_input.js
 * @depends path=/resources/scripts/jquery/jquery.jivefilebutton.js
 * @depends path=/resources/scripts/apps/microblogging/views/attachment_view.js
 * @depends path=/resources/scripts/apps/shared/views/form_waiting_view.js
 * @depends template=jive.wall.charLenErrors
 * @depends template=jive.wall.submitErrors
 */

jive.namespace('MicroBlogging');

jive.MicroBlogging.CommonView = jive.AbstractView.extend(function(protect, _super) {
    this.init = function (options) {
        _super.init.call(this, options);
        this.idPostfix = options.idPostfix;
        this.maxCharCount = options.maxCharCount;
        this.statusInput = null;
        this.attachmentsView = null;
        this.$waitingViewElem = null;
        this.$formElem = null;
        this.$imageFormElem = null;
        // consider using selectors for these in postRender method
        this.mobileUI = options.mobileUI || jive.rte.mobileUI;
        this.atMentionBtn = options.atMentionBtn;
        this.imagesEnabled = options.imagesEnabled || window._jive_images_enabled || false;
        this.imgAttachmentBtn = options.imgAttachmentBtn;
        this.submitBtn = options.submitBtn;
        this.cancelBtn = options.cancelBtn;
        if(options.supportAttachments == undefined){
            this.supportAttachments = true;
        } else {
            this.supportAttachments = options.supportAttachments;
        }
        this.doNotAnimate = !!options.doNotAnimate;
        this.allowTagCreation = options.allowTagCreation;
    };

    this.postRender = function(){
        // setup status input box waiting form view
        var self = this;
        if (this.mobileUI && this.atMentionBtn.length) {
            this.atMentionBtn.remove();
        }
        this.createFormElem();
        this.createWaitingViewElem();
        this.createWatingView();
        this.createActionContainer();
        this.statusInput = new jive.MicroBlogging.StatusInput(this.getContent().find('.jive-js-statusinput'),
            {maxCharCount:this.maxCharCount,
             idPostfix:this.idPostfix,
             focusOnRdy: true,
             doNotAnimate: this.doNotAnimate,
             allowTagCreation: this.allowTagCreation,
             i18n:{}});
        this.statusInput.addListener('escapeKeyPress', function() {
            self.emit('cancel');
            self.resetStatusInput();
        }).addListener('characterLenMsg', self.handleCharacterLenMsg.bind(self))
            .addListener('atMentionFinished', self.handleAtMentionResult.bind(self));

        // wireup @ mention button
        this.atMentionBtn.click(function(e){
            self.handleAtMentionClick(e, $j(this));
        });

        // wireup image attachment button
        if(this.imgAttachmentBtn && this.imagesEnabled) {
            this.imgAttachmentBtn.jiveFileButton({ name: 'image' }).bind('choose', function(e, $input) {
                var $imgContainerForm = self._getMetaImageContainer().find("form");
                $imgContainerForm.prepend($input);
                $imgContainerForm.submit();
            });
        }

        // wireup image attachment form
        this._getMetaImageContainer().find("form").submit(function() {
            var $this = $j(this);
            if($this.find("input[type=file]").val() == ""){
                return false;
            }
            self.handleImageURLMatch(null);
            return false;
        });

        this.submitBtn.click(function(e){
            self.handleSubmitClick(e);
        });

        if(this.cancelBtn){
            this.cancelBtn.click(function(e){
                self.attachmentsView.removeAllAttachments();
                self.attachmentsView.reset();
                self.resetStatusInput();
                self.emit('cancel');
            });
        }

        this.statusInput.addListener('linkURLMatch', function(url){
            self.handleLinkURLMatch(url); 
        }).addListener('imageURLMatch', function(url){
            if(!self.supportAttachments){
                // ignore
                return;
            }
            self.handleImageURLMatch(url);
        }).addListener('youtubeURLMatch', function(url){
            if(!self.supportAttachments){
                // ignore
                return;
            }
            self.handleYoutubeURLMatch(url);
        }).addListener('focus', function(e){
            self.handleFocus(e);
        });

        this.attachmentsView = new jive.MicroBlogging.AttachmentView(this._getAttachmentsViewOptions());
        this.attachmentsView.addListener('removeImage', function(id, promise){
            if(!self.supportAttachments){
                // ignore
                return;
            }
            self.emitP('removeImage', id).addCallback(function(data) {
                    // remove item from view
                    promise.emitSuccess(data);
                }).addErrback(function(message, status) {
                    promise.emitError(message, status);
                });
        });
    };

    this.getStatusInput = function(){
        return this.statusInput;
    };

    this.focus = function(){
        this.statusInput._focus();
        
    };

    this.createWaitingViewElem = function(){
        throw 'createWaitingViewElem method is abstract. Need to implmenet in subclass';
    };

    this.createWatingView = function(){
        this.waitingView = new jive.shared.FormWaitingView(this.$waitingViewElem);
    };

    this.enableForm = function(){
        this.waitingView.enableForm();
    };

    this.disableForm = function(){
        this.waitingView.disableForm();
    };

    this.createFormElem = function(){
        throw 'createFormElem method is abstract. Need to implement in subclass';
    };

    this.createActionContainer = function(){
        this.$actionContainer = this.$formElem.find('[id^=status-input-actions-]');
    };

    this.handleAtMentionClick = function(e, $anchor){
        this.statusInput.handleAtMentionButtonClick();
        this.emit('atMentionClick');
        e.stopPropagation();
    };

    this.handleAtMentionResult = function() {
        return null;
    };

    this.handleCharacterLenMsg = function(status) {
        var payload = arguments[1] || {},
            $element = this.$formElem.eq(0).find('.j-js-status-input-characters-remaining'),
            map = ({
                ok:      { msg: '' },
                warning: { msg: jive.wall.charLenErrors({error: false, numChars: payload.charLeft}), className: 'warning' },
                error:   { msg: jive.wall.charLenErrors({error: true, numChars: payload.charOver}),  className: 'danger' }
            })[status];

        $element.html(map.msg).removeClass('warning danger');
        if (status !== 'ok') {
            $element.addClass(map.className);
        }
    };

    // matched a url link
    this.handleLinkURLMatch = function(url){
        var self = this;
        this.emitP('linkURLMatch', url)
            .addCallback(function(data, url) {
                self.renderResolvedLink(url, data);
            }).addErrback(function(message, status) {
                self.renderError(message, status);
            });
    };

    // render the title of the link after it is resolved on the server
    this.renderResolvedLink = function(url, titleMarkup){
        this.statusInput.swapLinkFor(url, titleMarkup);
    };

    protect.getDraftData = function(){
        return null;
    };

    this._getAttachmentsViewOptions = function() {
        return { selector: this.selector + ' .jive-js-attachment-container' };
    }

    this._getMetaImageContainer = function() {
        return this.getContent().find("div.j-status-input-attach-action-container div.j-meta-image-container");
    }

    this.handleImageURLMatch = function(url){
        this.attachmentsView.showLoadingNotification();
        this.setDataForURLImage(url);
        var self = this;
        this.emitP('imageURLMatch', url, this.$imageFormElem, this.getDraftData())
            .addCallback(function(data, url) {
                self.renderImageAttachment(url, data);
            }).addErrback(function(message, status) {
                self.attachmentsView.hideLoadingNotification();
                self.renderError(message, status);
            });
    };

    this.handleYoutubeURLMatch = function(url){
        this.attachmentsView.showLoadingNotification();
        // any data needed for youtube urls?
        //this.setDataForURLImage(url);
        var self = this;
        this.emitP('youtubeURLMatch', url, this.getDraftData())
            .addCallback(function(data, url) {
                self.renderVideoAttachment(url, data);
            }).addErrback(function(message, status) {
                self.renderError(message, status);
            });
    };

    this.renderImageAttachment = function(url, data){
        this.attachmentsView.add(url, data);
    };

    this.renderVideoAttachment = function(url, data){
        this.attachmentsView.add(url, data);
    };

    protect.setDataForURLImage = function(url){
        // Set the form's input with the name imageURL to the url
    	this.$imageFormElem.find('input[name=imageURL]').val(url);
    };
    
    this.handleFocus = function(e){
        var statusInputCommonView = this;
        if(this.$actionContainer.is(':hidden')){
            this._initialStatusInputHeight = this.statusInput.getContainer().height();
            if (!this.imagesEnabled) {
                this.imgAttachmentBtn.hide();
            }
            if (($j.browser.msie && $j.browser.version < 7)) {
                this.$actionContainer.show();
                this.$actionContainer.addClass('j-act-comment-actions clearfix');
            } else {
                this.$actionContainer.addClass('j-act-comment-actions clearfix');
                this.$actionContainer.css({opacity: 0, height:1})
                    .show()
                    .animate({ height: '24px', opacity: 1}, 200, 'linear', function() {
                        $j(this).css('height', 'auto');
                    });
            }
            this.$formElem.closest('article').find('div.j-act-reply-form').addClass('r-active');
            this.$formElem.closest('article').find('div.eae-reply-avatar').fadeIn('fast');
        }
        if (statusInputCommonView.getContent().find('#j-js-mb-success').length) {
            statusInputCommonView.getContent().find('#j-js-mb-success').fadeOut('fast', function () {
                $j(this).remove();
                statusInputCommonView.getContent().find('.j-mb-last-update').show();
            });
        }
        this.emit('focus');
    };

    this.handleSubmitClick = function(e){
        // handle submitting of status input
        if (this.statusInput.getCharCount() != 0 ||
            this.attachmentsView.getContent().find('li:not(.j-attached-loading)').length) {
            if (this.maxCharCount && this.statusInput.getCharCount() > this.maxCharCount) {
                this.renderError(jive.wall.submitErrors({key: 'over'}));
                this.emit('submitError', jive.wall.submitErrors({key: 'over'}));
            }
            else {
                $j('.jive-js-error-general', this.$formElem).hide();
                this.waitingView.disableForm();
                var self = this;
                this.emitP('submit', this.getDataFromDom())
                    .addCallback(function(data, url) {
                        self.renderResponse(data);
                    }).addErrback(function(message, status) {
                        self.renderError(message, status);
                    });
            }
        } else {
            this.renderError(jive.wall.submitErrors({key: 'none'}));
            this.emit('submitError', jive.wall.submitErrors({key: 'none'}));
        }
    };

    this.getDataFromDom = function(){
        throw 'getDataFromDom method is abstract. Need to implmenet in subclass';
    };

    this.normalizeData = function(){
        // any normalization should occur in subclasses
        return this.statusInput.getSubmitVals();
    };

    this.renderError = function(message, status){
        this.waitingView.enableForm();
        // TODO error handling
        $j('.jive-js-error-general', this.$formElem).text(message);
        $j('.jive-js-error-general', this.$formElem).slideDown(100);
        setTimeout(function() {
            $j('.jive-js-error-general', this.$formElem).fadeOut('fast');
        }, 3500);
    };

    this.renderResponse = function(data){
        // re-enable form
        this.waitingView.enableForm();
        // reset attachments
        this.attachmentsView.reset();
        // Subclasse render a template using the response data
    };

    // common function for render responses
    this.renderResponseCommon = function(data){
        // remove previous dialog
        this.getContent().find('#j-js-mb-success').fadeOut('fast');
        // hide last update dialog
        var $lastUpdate = this.getContent().find('.j-mb-last-update');
        if ($lastUpdate.length) {
            $lastUpdate.hide();
            if (data.wallentry.status != "AWAITING_MODERATION") {
                var text = $j(data.wallentry.message).text();
                text = $j('<div/>').text(text).html();
                $lastUpdate.html(jive.statusinput.containers.microbloggingStatusInputLastUpdate(
                    {latestStatusUpdate:{text: text,
                                         url: data.wallentry.URL,
                                         commentcount: 0}
                    }));
            }
        }
        // display a dialog indicating success
        var $successDialog = $j(jive.statusinput.containers.microbloggingStatusInputSuccess({entry:data.wallentry}));
        $successDialog.hide();
        // handle dismiss
        $successDialog.find('.j-js-mb-success-dismiss').click(function(){
            $successDialog.fadeOut('fast', function() {
                $j('.j-mb-hint').show();
                $lastUpdate.show();
            });
        });
        this.getContent().append($successDialog);
        $successDialog.animate({
            height: 'toggle'
          }, {
            duration: 600
        }, function(){
            if(data.wallentry.meta && data.wallentry.meta.length > 0){
                $successDialog.find('.jive-js-attachment-container').slideDown('fast', function() {
                    $j(this).animate({'opacity': 1}, 500);
                });
            }
        });

        this.resetStatusInput();
    };

    this.resetStatusInput = function(){
        // reset editor text and blur focus
        this.statusInput.resetText();
        this.$actionContainer.hide();
        this.$formElem.closest('article').find('div.eae-reply-avatar').hide();
        this.$formElem.closest('article').find('div.j-act-reply-form').removeClass('r-active');
        var container = this.statusInput.getContainer();
        container.css("minHeight", '24px');
        container.prev(".jive-js-statusinput-default").show();
        container.removeClass('j-mb-focused');
        container.removeAttr('contenteditable');
    };
});
