jive.namespace("MicroBlogging");jive.MicroBlogging.CommentController=jive.MicroBlogging.CommonController.extend(function(a,b){this.init=function(c){b.init.call(this,c);this.$guestUserName=c.viewOptions.$guestUserName;this.$guestUserEmail=c.viewOptions.$guestUserEmail;this.$guestUserURL=c.viewOptions.$guestUserURL;this.commentServiceOptions={listAction:"",location:"jive-comments",commentMode:"comments",isPrintPreview:false}};a.initMBView=function(){this.microbloggingView=new jive.MicroBlogging.MicroBloggingCommentView(this.viewOptions)};a.submitHandler=function(d,g){d.name="";d.email="";var f=this.$guestUserName,i=this.$guestUserEmail,e=this.$guestUserURL;if(f.length&&!f.val()){g.emitError(jive.statusinput.mention_warnings.jsI18nHelper({key:"cmnt.name_required.text"}),500);return}else{if(i.length&&!i.val()){g.emitError(jive.statusinput.mention_warnings.jsI18nHelper({key:"cmnt.email_required.text"}),500);return}}if(f.length){d.name=f.val();d.email=i.val();d.url=e.val()}this.commentServiceOptions.resourceID=d.ID;this.commentServiceOptions.resourceType=d.typeID;this.commentServiceOptions.contentObject={document:d.ID,version:d.version};this.commentService=new jive.CommentApp.CommentSource(this.commentServiceOptions);var h=new jive.CommentApp.Comment({body:d.body,commentMode:"comments",name:d.name,email:d.email,url:d.url}),c=this;this.commentService.save(h).addCallback(function(j){g.emitSuccess(j);c.emitP("submitSuccess",j)}).addErrback(function(k,j){g.emitError(k,j);c.emitP("submitError",k,j)})}});