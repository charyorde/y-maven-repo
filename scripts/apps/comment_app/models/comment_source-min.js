jive.namespace("CommentApp");jive.CommentApp.CommentSource=jive.NestedRestService.extend(function(a,c){a.resourceType="comment";a.init=function(d){this.parentType=d.resourceType;this.parentID=d.resourceID;this.listAction=d.listAction;this.location=d.location;this.commentMode=d.commentMode;this.isPrintPreview=Boolean(d.isPrintPreview);this.contentObject=d.contentObject;c.init.call(this,{parentType:this.parentType,parentID:this.parentID})};var b=1;this.getAllAsHTML=function(e){var d=new jive.conc.Promise();$j.ajax({type:"GET",url:this.listAction,dataType:"html",cache:false,data:$j.extend({location:this.location,mode:this.commentMode,isPrintPreview:this.isPrintPreview},this.contentObject,e),success:function(f){d.emitSuccess(f)},error:function(f){d.emitError(f)}});return d};this.getPreview=function(e){var d=new jive.conc.Promise();$j.ajax({type:"POST",url:this.POST_COMMENT_ENDPOINT+"/preview",dataType:"html",cache:false,data:{commentBody:e.body},success:function(f){d.emitSuccess(f)},error:function(f){d.emitError(f)}});return d}});