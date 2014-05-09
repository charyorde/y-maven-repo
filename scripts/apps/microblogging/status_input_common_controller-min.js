jive.namespace("MicroBlogging");jive.MicroBlogging.CommonController=jive.oo.Class.extend(function(a){jive.conc.observable(this);this.init=function(c){if(!c){c={}}this.microbloggingService=new jive.MicroBlogging.MicroBloggingSource();this.metaService=new jive.MetaSource();this.draftWallEntry=null;this.viewOptions=c.viewOptions||{};this.initMBView();this.manuallyRenderView=c.manuallyRenderView||false;this.submitURLParams={objectType:14,objectID:1};if(c.trackingID){this.submitURLParams.trackingID=c.trackingID}var b=this;this.microbloggingView.addListener("submit",function(d,e){b.submitHandler(d,e)}).addListener("linkURLMatch",function(d,e){console.log("linkURL match");b.metaService.createLink(d).addCallback(function(f){e.emitSuccess(f,d)}).addErrback(function(g,f){e.emitError(g,f)})}).addListener("imageURLMatch",function(f,d,e,h){b.draftData=e;function g(){var i=b.metaService.createImage(b.draftWallEntry.wallentry,f,f!=null,d);i.addCallback(function(j){h.emitSuccess(j,f)}).addErrback(function(k,j){h.emitError(k,j)})}if(b.draftWallEntry==null){b.createDraft(g,h)}else{g()}}).addListener("removeImage",function(e,d){b.metaService.remove(e).addCallback(function(f){d.emitSuccess(f)}).addErrback(function(g,f){d.emitError(g,f)})}).addListener("youtubeURLMatch",function(f,e,g){b.draftData=e;function d(){b.metaService.createVideo(b.draftWallEntry.wallentry,f).addCallback(function(h){b.metaService.fetch(h.id).addCallback(function(i){if(i.meta.length>0){g.emitSuccess(b.metaService.normalizeVideoData(i),f)}else{g.emitError(message,status)}}).addErrback(function(j,i){g.emitError(j,i)})}).addErrback(function(i,h){g.emitError(i,h)})}if(b.draftWallEntry==null){b.createDraft(d,g)}else{d()}}).addListener("cancel",function(){b.emit("cancel")});if(!this.manuallyRenderView){this.renderView()}};a.submitHandler=function(c,d){var b;if(this.draftWallEntry!=null){b=$j.extend(true,{},this.draftWallEntry,c)}else{b=c}this.submitServiceCall(b,d)};a.submitServiceCall=function(c,d){var b=this;this.microbloggingService.publishEntry(this.submitURLParams,c).addCallback(function(e){b.submitSuccessCallback(e,d)}).addErrback(function(f,e){b.submitErrCallback(f,e,d)})};a.submitSuccessCallback=function(b,c){this.draftWallEntry=null;b.wallentry=this.metaService.normalizeVideoData(b.wallentry);c.emitSuccess(b);this.emitP("submitSuccess",b)};a.submitErrCallback=function(c,b,d){d.emitError(c,b);this.emitP("submitError",c,b)};a.createDraft=function(d,c){var b=this;this.microbloggingService.createDraft({objectType:14,objectID:1},{wallentry:{}}).addCallback(function(e){b.draftWallEntry=e;d()}).addErrback(function(f,e){c.emitError(f,e)})};a.initMBView=function(){throw"initMBView method is abstract. Need to implmenet in subclass"};this.renderView=function(){this.microbloggingView.postRender()};this.getMicrobloggingView=function(){return this.microbloggingView}});