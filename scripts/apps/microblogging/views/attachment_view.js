jive.namespace('MicroBlogging');
/**
 * View class to support attachments box for status input.
 * Attachments box contains thumbs of images and videos that have been added to a status.
 *
 * @class
 * @extends jive.AbstractView
 * @param {Object}  options
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 *
 */
jive.MicroBlogging.AttachmentView = jive.AbstractView.extend(function(protect, _super) {
    this.init = function (options) {
        _super.init.call(this, options);
        this.$imageContainer = null;
        this.isCreateForm = options.isCreateForm || true;
        this.resizeHandlerRegistered = false;
    };

    protect.getSoyTemplate = function(data){
        return jive.statusinput.attachments.renderAttachment(data);
    };

    protect.getSoyTemplateAttachments = function(data){
        return jive.statusinput.attachments.renderAttachments(data);  
    };

    /*
    Renders the entire attachments box.
    data - object containing the elements to display in the box (sent to the soy)
     */
    protect.renderAttachments  = function(data){
        var $content = this.getContent();
        $content.append(this.getSoyTemplateAttachments($j.extend({removable:this.isCreateForm}, data)));
        if (this.isCreateForm) {
            $content.slideDown('fast', function() {
                $j(this).animate({'opacity': 1}, 500);
            });
        } else {
            $content.css('opacity', '1').show();
        }
    };

    protect.renderAttachment  = function(data){
        // prepend before attached loading notification
        var $attachedLoading = this.getContent().find('li.j-attached-loading');
        $attachedLoading.before(this.getSoyTemplate($j.extend({removable:this.isCreateForm}, data)));
    };

    protect.registerResizeHandler = function(){
        if(!this.resizeHandlerRegistered){
            // only register the handler once
            var self = this;
            $j(window).resize((function() {
                var prevWidth;
                return function() {
                    var width = $j(window).width();
                    if (prevWidth && width !== prevWidth) {
                        self.resize();
                    }
                    prevWidth = width;
                };
            })());
            this.resizeHandlerRegistered = true;
        }
    };

    this.postRender = function(){
        _super.postRender.call(this);
        var $content = this.getContent();
        this.registerResizeHandler();
        // bind arrows
        var attachmentsContainer = $content.find('ul.j-attached-items'),
            self = this;

        $content.find('.j-attachment-arrow').unbind();
        $content.find('.j-attachment-arrow').mousedown(function() {
            try{
                self.scrollHandler($j(this), attachmentsContainer);
            }catch(e){
                console.log(e);
            }
        }).mouseup(function() {
            attachmentsContainer.stop();
            return false;
        }).click(function() { return false } );
        // resize for scrolling purposes
        this.resize();
    };

    this.add = function(url, data){
        var self = this,
            meta = data.meta,
            $content = this.getContent(),
            $attachedImagesContainer = $content.find('ul.j-attached-items'),
            attachment = meta[0];

        $j.extend(attachment, {originalURL:url});

        if($attachedImagesContainer.length > 0){
            this.renderAttachment({attachment: attachment});
            self.postRender();
        } else {
            this.renderAttachments({attachments: meta});
        }

        // setup remove handler
        $content.find('li:not(.j-attached-loading):last > .j-remove-attachment').click(function(){
            self.emitP('removeImage', attachment.id).addCallback(function(data) {
                    // remove item from view
                    self.removeAttachment(attachment.id);
                }).addErrback(function(message, status) {
                    // TODO render error
                    console.log('error removing attachment with id ' + attachment.id);
                });
            return false;
        });
        this.hideLoadingNotification();
        // resize for scrolling purposes
        this.resize();
        // scroll to new item
        this.scrollHandler($content.find('.j-attachment-arrow-right'), $content.find('ul.j-attached-items'));
    };

    this.showLoadingNotification = function(){
        var loadingElem = this.getContent().find('li.j-attached-loading');
        if(loadingElem.length == 0){
            // initial display, animate image area in with no attachments
            this.renderAttachments({entry: {meta: []}});
        }
        loadingElem.show();
    };

    this.hideLoadingNotification = function(){
        var $loadingElems = this.getContent().find('li.j-attached-loading');
        $loadingElems.hide();
        if ($loadingElems.length && $loadingElems.siblings(':not(.j-attached-loading)').size() == 0) {
            this.reset();
        }
    };

    this.reset = function(){
        this.getContent().html('')
            .hide()
            .find(".j-attached-loading").hide();
        this.metaData = [];
    };

    this.removeAttachment = function(id){
       // If there are no other images remove the image container.
       var $attachmentElem = $j('#'+id);
       if($attachmentElem.size() > 0 && $attachmentElem.siblings(':not(.j-attached-loading)').size() == 0) {
           this.reset();
       }
        //Remove the image from the dom
       $attachmentElem.remove();

        // remove the attachement from metadata
        if (this.metaData) {
            this.metaData = this.metaData.filter(function(entry) {
                return id !== entry.id;
            });
        }
    };

    this.removeAllAttachments = function() {
        var self = this;
        var attachmentIDs = this.getContent().find('ul.j-attached-items li:not(.j-attached-loading)').map(function() {
            return parseInt(this.id);
        });
        for (var i = 0, attachmentIDsLength = attachmentIDs.length; i < attachmentIDsLength; i++) {
            self.emitP('removeImage', attachmentIDs[i]).addCallback(function(data) {
                self.removeAttachment(attachmentIDs[i]);
            }).addErrback(function(message, status) {
                console.log('error removing attachment with id ' + attachmentIDs[i]);
            });
        }
    };

    this.hide = function(){
        this.hideAllMenus();
        this.getContent().hide();
    };

    this.resize = function(){
        var attachmentsWidth = 0,
            content = this.getContent();

        // add up widths of attachments
        content.find('li.j-attached-image, li.j-attached-video').each(function(){
            attachmentsWidth += $j(this).outerWidth();
        });

        var dims = this.getAttachmentScrollDim();

        // show or hide arrows based on overflow
        if(dims.containerWidth < dims.attachmentsWidth){
            this.showArrows();
        } else {
            this.hideArrows();
        }

        // update width of container, so that scrolling works
        content.find('ul.j-attached-items').css('width', dims.attachmentsWidth + 'px');
    };

    this.scrollHandler = function($arrow, attachmentsContainer){
        // Common handler for scrolling code.
        // Handles case where user clicks scrolling arrows or has added a new item
        // (scrolls to the end in the latter case)
        var speed,
            arrowWidths = $arrow.outerWidth() * 2,
            dims = this.getAttachmentScrollDim(),
            diff = dims.attachmentsWidth - dims.containerWidth,
            currLeft = parseInt(attachmentsContainer.css('left'));
        if(isNaN(currLeft)){
            currLeft = 0;
        }

        if ($arrow.hasClass('j-attachment-arrow-right') && diff > 0) {
            speed = currLeft + (diff + arrowWidths);
            attachmentsContainer.stop().animate({'left': (-diff - arrowWidths)}, speed*5, 'linear');
        } else if (diff > 0) {
            speed = currLeft * -1;
            attachmentsContainer.stop().animate({'left': 0}, speed*5, 'linear');
        }
    };

    protect.getAttachmentScrollDim = function(){
        // return the dimensions (currently just widths), needed for various scrolling calculations
        var content = this.getContent(),
            dims = {containerWidth:content.context.width, attachmentsWidth:0};

        content.find('li.j-attached-image, li.j-attached-video').each(function(){
            dims.attachmentsWidth += $j(this).outerWidth();
        });

        return dims;
    };

    protect.showArrows = function(){
        var $content = this.getContent();
        $content.find('.j-attachment-arrow').css('display', 'block');
        $content.find('ul.j-attached-items').css('margin-left', '20px');
    };

    protect.hideArrows = function(){
        var $content = this.getContent();
        $content.find('.j-attachment-arrow').hide();
        $content.find('li.j-attached-image, li.j-attached-video').first().css('margin-left', '0px');
    };
});

// conatiner for views without a controller
jive.MicroBlogging.AttachmentView.views = {};

