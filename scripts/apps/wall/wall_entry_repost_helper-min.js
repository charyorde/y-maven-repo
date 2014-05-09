jive.namespace("Wall");jive.Wall.RepostHelper=jive.Wall.Main.extend({init:function(a){this._super($j.extend({submitBtnID:".j-repost-submit",focusOnRdy:true},a));this._statusID=a.statusID;this.formWaitingView=new jive.shared.FormWaitingView($j("#jive-js-repost-modal").find(".jive-modal-content"))},getStatusInputVals:function(){return this._wallStatusInputs.getSubmitVals(this.statusInputID)},resetStatusInput:function(){this._wallStatusInputs.resetText(this.statusInputID)},_initWallSource:function(a){},_getEntry:function(c){if(this._wallEntry!=null){c(this._wallEntry)}else{var a=this;var b=function(d){a._wallEntry=d;c(a._wallEntry)};jive.Wall.RepostHelper.submitRepostDraft(this._statusID,b)}},_initEditorView:function(a){this._wallEditorView=new jive.Wall.EditorView(a.editorContainer,$j.extend({notificationContainer:$j(a.editorContainer)},a))},displaySuccessMsg:function(b,a,c){this._wallEditorView.entryPublishedRepost(b,a,c)},enableForm:function(){this.formWaitingView.enableForm()},disableForm:function(){this.formWaitingView.disableForm()}});jive.Wall.RepostHelper.bindRepostAnchors=function(a){$j("a.j-repost").live("click",function(){var b=$j(this).closest("li.j-repost-item"),d=b.find(".j-repost-modal").remove().find("script").remove().end(),c=$j("<div/>").append(d).html(),f=b.attr("data-statusid"),e=b.attr("mb-creation-moderated");d.attr("id","jive-js-repost-modal");d.lightbox_me({destroyOnClose:true,centered:true,onLoad:function(){jive.Wall.RepostHelper.initRepost(f);jive.bindLightboxMedia()},onClose:b.append.bind(b,c)});if(b.find(".repost-form").length<1){d.find("div#j-repost-form-placeholder-"+f).append(jive.wall.repostForm({statusID:f,canCreateImage:a.canCreateImage,i18n:a.i18n,canAtMention:!jive.rte.mobileUI,mbCreationModerated:e=="true"}))}return false})};jive.Wall.RepostHelper.submitRepost=function(a){jive.Wall.RepostHelper.helpers[a].disableForm();if(jive.Wall.RepostHelper.helpers[a].wallentry){jive.Wall.RepostHelper.submitRepostCommon(a,jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST_DRAFT_PUB)}else{jive.Wall.RepostHelper.submitRepostCommon(a,jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST)}return false};jive.Wall.RepostHelper.submitRepostDraft=function(a,b){jive.Wall.RepostHelper.submitRepostCommon(a,jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST_DRAFT,b);return false};jive.Wall.RepostHelper.submitRepostCommon=function(d,a,g){var c=jive.rest.url("/wall"),e=c+"/repost/"+d;var f=jive.Wall.RepostHelper.helpers[d].wallentry;var b;if(a==jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST_DRAFT_PUB){e=c+"/"+f.containerType+"/"+f.containerID;f.message=jive.Wall.RepostHelper.getDataUtil(d);b=JSON.stringify({wallentry:f})}else{b=jive.Wall.RepostHelper.getDataUtil(d);if(a==jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST_DRAFT){e+="/draft"}}$j.ajax({type:"POST",url:e,dataType:"json",data:b,contentType:"application/json; charset=utf-8",success:function(i){if(a==jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST_DRAFT){jive.Wall.RepostHelper.helpers[d].wallentry=i.wallentry;g(i.wallentry)}else{jive.Wall.RepostHelper.helpers[d].enableForm();if(i.wallentry.message){i.wallentry.message=i.wallentry.message.replace(/<\/?body>/gi,"")}i.wallentry=jive.Wall.VideoLinkMetaSource.normalizeData(i.wallentry);var h=$j("#jive-js-repost-modal");jive.Wall.RepostHelper.helpers[d].displaySuccessMsg(h,i.wallentry,function(){h.trigger("close")})}},error:function(i){jive.Wall.RepostHelper.helpers[d].enableForm();try{var h=JSON.parse(i.responseText);jive.Wall.RepostHelper.helpers[d].displayError(h.error.message)}catch(j){jive.Wall.RepostHelper.helpers[d].displayError()}}})};jive.Wall.RepostHelper.getDataUtil=function(a){return jive.Wall.RepostHelper.helpers[a].getStatusInputVals()};jive.Wall.RepostHelper.helpers={};jive.Wall.RepostHelper.initRepost=function(c,a){var b=[{id:"j-wall-meta-link",view:jive.Wall.LinkMetaView,container:"j-wall-meta-link-container",service:jive.Wall.LinkMetaSource},{id:"j-wall-meta-image",view:jive.Wall.ImageMetaView,container:"j-wall-meta-image-container",service:jive.Wall.ImageMetaSource,viewType:jive.Wall.MetaView.TYPE_STATUS_COMMENT},{id:"j-wall-meta-video-link",view:jive.Wall.ImageMetaView,container:"j-wall-meta-video-container",service:jive.Wall.VideoLinkMetaSource,viewType:jive.Wall.MetaView.TYPE_STATUS_COMMENT}];if(!a){a=[]}a.meta=b;jive.Wall.RepostHelper.helpers[c]=new jive.Wall.RepostHelper($j.extend({editorContainer:"#jive-js-repost-modal",domContainerId:"jive-js-repost-modal",statusInputIdPostfix:jive.Wall.RepostHelper.INPUT_PREFIX+c,statusID:c},a))};jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST=1;jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST_DRAFT=2;jive.Wall.RepostHelper.SUBMIT_TYPE_REPOST_DRAFT_PUB=3;jive.Wall.RepostHelper.INPUT_PREFIX="s-r-input-";