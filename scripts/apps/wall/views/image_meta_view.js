jive.namespace('Wall');

/**
 * Make sure we only include this file once per page load.  If we do not have this block here there are 2 cases where
 * this script could be loaded multiple times:
 * 1) When resource combined is false behavior could be different from when it's on, ideally the behavior should be the same.
 * 2)  If an ajax request is made for an ftl with javascript includes the file will be reloaded (assuming it was already
 * loaded on page load)
 *
 * At a later date we can roll this work into namespace or a new function that is similar to namespace
 */
if(!jive.Wall.ImageMetaView){

jive.Wall.ImageMetaView = jive.Wall.MetaView.extend({
    init: function(id, container, $parentContainer, options, type) {
        this._super(id, container, $parentContainer, options, type);
        var that = this;
        this._$container.find("form").submit(function() {
            if(that._$container.find("input[type=file]").val() == "") return false;
            if(that._$imageContainer.find("UL").length == 0){
                that.add([]);
            }
            that.emit("completed", $j(this));
            return false;
        });
        this._$imageContainer = $parentContainer.find(".jive-js-image-container");
        this._i18n = options.i18n;
    },
    error: function(data, statusText, errorThrown){
        //this.emit("error", "error uploading image / video");
        this.emit("error", statusText);
        //Only reset the form if they haven't uploaded a valid image yet. 
        if ($j(this._$imageContainer).find("ul li").size() == 1) {
          this.reset();
        }
        this.hide();
        $j(this._$imageContainer).find("li.j-attached-loading").hide();
    },
    // should only be called when the image is uploaded succesfully, or when the container does not exist
    add: function(meta, url) {
    	// add original url onto meta, if this attachments is a url image
    	url = url || "";
        var that = this;
        var attachedImagesContainer = this._$imageContainer.find('ul.j-attached-items');

        if(meta.length > 0){
            var attachment = meta[0];
            $j.extend(attachment, {originalURL:url});
            attachedImagesContainer = this._$imageContainer.find('ul.j-attached-items');
            if(attachedImagesContainer.length > 0){
                jive.StatusInput.renderAttachmentWrapper({attachment: attachment}, attachedImagesContainer, true);
            } else {
                jive.StatusInput.renderAttachmentsWrapper( {attachments: meta}, this._$imageContainer, true);
            }

            if(this._type == jive.Wall.MetaView.TYPE_STATUS){
                this._$container.hide();
                this._$anchor.removeClass('j-selected').siblings('.j-button').removeClass('j-deselected');
            }
        }else{
            if(that._$imageContainer.find("UL").length == 0){
                jive.StatusInput.renderAttachmentsWrapper( {attachments: meta}, this._$imageContainer, true);
            }
        }


        this._$container.hide();
        this._$anchor.removeClass('j-selected').siblings('.j-button').removeClass('j-deselected');
        this._$imageContainer.find('li:not(.j-attached-loading):last > .j-remove-attachment').click(function(){that.emit('removeImage', attachment.id);});
        if(meta.length > 0){

            var $loader = this._$imageContainer.find('li.j-attached-loading').remove();
            $loader = $j($loader.hide().get(0));
            this._$imageContainer.find('ul.j-attached-items').append($loader);

            jive.StatusInput.bindAttachment(attachedImagesContainer, true);
        }
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

    getDataForURLImage:function(url){
    	var data = this._$container.find('form');
    	data.find('input[name=imageURL]').val(url);
    	return data;
    },
    remove: function(id) {
       // If there are no other images remove the image container.
       // compare to 1 instead of 0 because of the loading spinner
       if($j('#'+id).size() > 0 && $j('#'+id).siblings().size() <= 1) {
           this.reset();
       }
        //Remove the image from the dom
       $j('#'+id).remove();

    },
    formSubmitted: function() {
        var attachedImagesContainer = this._$imageContainer.find('ul.j-attached-items');
        attachedImagesContainer.width(attachedImagesContainer.width() + 90 + 'px');
        this._$imageContainer.find("li.j-attached-loading").show();
        var diff = attachedImagesContainer.width() - this._$imageContainer.width();

        /* If there is a discrepency then scroll all the attachments to the left so the user can see the newest one */
        if (diff > 0) {
            attachedImagesContainer.animate({'left': (diff*-1-40)}, 300);
        }
        
    }
});

}
