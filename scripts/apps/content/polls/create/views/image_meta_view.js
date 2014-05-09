/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends path=/resources/scripts/apps/content/polls/create/views/meta_view.js
 * @depends path=/resources/scripts/apps/status_input/status_input.js
 * @depends template=jive.statusinput.attachments.*
 */

jive.namespace('content.polls');

jive.content.polls.ImageMetaView = jive.content.polls.MetaView.extend({
    init: function(id, container, $parentContainer, options) {
        this._super(id, container, $parentContainer, options);
        var that = this;

        var $container = this._$container;
        $container.find("form").submit(function() {
            if(that._$container.find("input[type=file]").val() == "") return false;
            that.emit("completed", $j(this));
            that.resetFileInputForm();
            return false;
        });
        this._$imageContainer = $parentContainer.find(".jive-js-image-container");
    },
    resetFileInputForm: function(){
        this._$imageContainer.find("li.j-attached-loading").show();
        jive.StatusInput.bindAttachment(this._$imageContainer.find('ul.j-attached-items'), true);
    },
    error: function(data, statusText, errorThrown){
        //this.emit("error", "error uploading image / video");
        this.emit("error", statusText);
        //Only reset the form if they haven't uploaded a valid image yet.
        if ($j(this._$imageContainer).find("ul li").size() == 1) {
          this.reset();
        }
    },
    add: function(meta) {
        var that = this;
        var attachedImagesContainer = this._$imageContainer.find('ul.j-attached-items');
        var $objectImageContainer = this._$imageContainer;
        if(attachedImagesContainer.length > 0) {
            meta.forEach(function(attachment) {
                jive.StatusInput.renderAttachmentWrapper({attachment: attachment}, attachedImagesContainer, true);
                $objectImageContainer.find('li.j-attached-image:last > .j-remove-attachment')
                    .click(function(){
                        that.emit('removeImage', attachment.id);
                    });
            });
        }
        else {
            jive.StatusInput.renderAttachmentsWrapper({entry: {meta: meta}}, this._$imageContainer, true);
            // iterate over the li's in this case, using their index against the meta
            $objectImageContainer.find('li.j-attached-image > .j-remove-attachment').each(function() {
               $j(this).click(function() {
                   that.emit('removeImage', meta[$j(this).parent('li').index()].id);
               })
            });
        }
        this._$container.hide();
        if(meta.length > 0){
            this._$imageContainer.find("li.j-attached-loading").hide();
            var $foo = this._$imageContainer.find("li.j-attached-loading").remove();
            this._$imageContainer.find("ul.j-attached-items").append($foo);
            jive.StatusInput.bindAttachment(attachedImagesContainer, true);
        }

        this._$imageContainer.show();        
    },
    reset:function(){
        this._$imageContainer.html('');
        this._$imageContainer.hide();
        this._$imageContainer.find("li.j-attached-loading").hide();
    },
    show:function(){
        var $input = this._$container.find("input[type=file]");
        var $clone = $j("<input type='file'>");
        $clone.attr("name", $input.attr("name"));
        this._$container.find("input[type=file]").before($clone).remove();

        // Poll the file input for changes instead of using an onChange handler
        // so that IE will behave correctly.  CS-20816
        var that = this;
        this._fileInputInterval = setInterval(function() {
            if ($clone.val()) {
                clearInterval(that._fileInputInterval);
                that._$container.find('form').submit();
            }
        }, 100);

        this._super();
    },

    hide: function() {
        clearInterval(this._fileInputInterval);
        this._super();
    },
    
    remove: function(id) {
       // If there are no other images remove the image container.
       // compare to 1 instead of 0 because of the loading spinner
       if($j('#'+id).size() > 0 && $j('#'+id).siblings().size() <= 1) {
           this.reset();
       }
        //Remove the image from the dom
       $j('#'+id).remove();

    }
});