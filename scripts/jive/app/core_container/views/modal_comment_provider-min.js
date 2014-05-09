define("jive.JAF.CoreContainer.CommentProvider",["jquery"],function(a){return jive.oo.Class.extend(function(b){jive.conc.observable(this);var c={type:"osapi.jive.core.Comment"};var d={type:"osapi.jive.core.Message"};b.listeningForActivityStreamsForms=false;b.listeningForInboxForms=false;this.init=function(){this.commentContext=null;this.activityStreamContext=null};this.getCommentContext=function(){return this.commentContext};this.getActivityStreamContext=function(){return this.activityStreamContext};this.getInboxEntryContext=function(){return this.activityStreamContext};this.addListeners=function(){var m=this;m.commentContext=null;var k=function(o){var n={content:{}};a.extend(n.content,o,c);if(n.content.inReplyTo){a.extend(n.content.inReplyTo,c)}return n};var i=function(n){m.commentContext=k(n)};var f=function(o){var n={content:{}};a.extend(n.content,{id:0},d);if(o.isReply){a.extend(n.content,{inReplyTo:{id:o.parentMessageId}});n.content.parent=o.parent}if(n.content.inReplyTo){a.extend(n.content.inReplyTo,d)}return n};var e=function(n){m.commentContext=f(n)};var g=function(n){var o="osapi.jive.core.Unsupported("+n+")";switch(n){case 2:case"2":o="osapi.jive.core.Discussion";break;case 38:case"38":o="osapi.jive.core.Post";break;case 102:case"102":o="osapi.jive.core.Document";break;case 105:case"105":o="osapi.jive.core.Comment";break}return o};var l=function(o){m.init();var n;switch(o.objectType){case"2":n=f({discussionId:o.parent.jiveObject.id,parentMessageId:o.objectID,isReply:true,parent:{id:o.parent.jiveObject.threadID,type:g(o.objectType)}});break;case"18":n=k({id:0,parent:{id:o.parent.jiveObject.id,type:g(o.objectType)}});break;case"38":n=k({id:0,parent:{id:o.parent.jiveObject.id,type:g(o.objectType)}});break;case"102":n=k({id:0,parent:{id:o.parent.jiveObject.id,type:g(o.objectType)}});break;case"105":n=k({id:0,inReplyTo:{id:o.objectID,type:g(o.objectType)},parent:{id:o.parent.jiveObject.id,type:g(o.parent.jiveObject.objectType)}});break}m.activityStreamContext=n};if(jive.CommentApp&&jive.CommentApp.comments){jive.CommentApp.comments.addCommentListViewListener("createComment",i);jive.CommentApp.comments.addCommentListViewListener("editComment",i);jive.CommentApp.comments.addCommentListViewListener("replyComment",i);jive.CommentApp.comments.addCommentListViewListener("formClosed",function(n){m.commentContext=null})}if(jive.DiscussionApp&&jive.DiscussionApp.instance){jive.DiscussionApp.instance.addDiscussionListViewListener("formReady",e)}function j(){if(!m.listeningForActivityStreamsForms){if(jive.ActivityStreamApp&&jive.ActivityStreamApp.instance){jive.ActivityStreamApp.instance.addActivityStreamListViewListener("formReady",l);m.listeningForActivityStreamsForms=true}}}jive.switchboard.addListener("activity.stream.controller.initialized",j);j();function h(){if(!m.listeningForInboxForms){if(jive.ActivityStream&&jive.ActivityStream.GlobalCommunicationStreamController){jive.ActivityStream.GlobalCommunicationStreamController.attachListEventListener("showRTE",function(n,o,p){l(n)});m.listeningForInboxForms=true}}}jive.switchboard.addListener("activity.communication.controller.initialized",h);h();if(jive.rte&&jive.rte.renderedContent){jive.rte.renderedContent.addListener("renderedContentWithSelector",function(n,o){m.emit("modifyRenderedContent",n,o)})}}})});