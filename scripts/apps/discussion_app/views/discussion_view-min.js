jive.namespace("DiscussionApp");jive.DiscussionApp.DiscussionView=function(h){jive.conc.observable(this);var e=$j(h),c=this;function b(){e.fadeOut(function(){$j(this).remove()});c.emit("remove",c.messageID);return c}function d(i){e.find("[class*=discussion-preview]").html(i).fadeIn()}function f(){return e}function g(k,j,l){var i=e.find(".jive-rendered-content").html();jive.SharedViews.RteView.setMiniRTEQuotedMsg(k,j,l,i)}function a(){var i=e.parents().andSelf().filter("li.reply").toArray();return i.slice(1).reduce(function(k,j){var l=$j(j);return k+parseInt(l.css("margin-left"),10)+parseInt(l.css("padding-left"),10)},0)}this.remove=b;this.displayPreview=d;this.getDOMElement=f;this.setQuotedMsg=g;this.indent=a;(function(j){var i=e.find("a.discussionAdd");j.messageID=i.attr("data-messageID");j.username=i.attr("data-discussionusername");j.isReply=(i.attr("data-isReply")||"").toLowerCase()==="true";j.replySubject=i.attr("data-replySubject");j.isAnonymous=(i.attr("data-isAnonymous")||"").toLowerCase()==="true";j.advEditorLnk=i.attr("data-advEditorLnk")})(this)};