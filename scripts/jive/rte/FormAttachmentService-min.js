jive.rte.FormAttachmentService=jive.oo.Class.extend(function(a){function d(e,f){if(console){console.log(e,f)}$j("<div>"+e+"</div>").message({style:"error"})}function c(e){return e.substr(e.lastIndexOf(".")+1)}a.init=function(e){this.container=e.container;this.name=e.name;this.attachments=e.attachments||[];this.maxSize=e.maxSize;this.maxFiles=e.maxFiles;this.allowByDefault=e.allowByDefault;this.attachmentExtensions=e.attachmentExtensions||[];this.hasAttachPerms=e.hasAttachPerms||false;for(var f=0;f<this.attachmentExtensions.length;++f){this.attachmentExtensions[f]=c(this.attachmentExtensions[f])}};function b(f){if(f.substr(0,12)=="C:\\fakepath\\"){return f.substr(12)}var e=f.lastIndexOf("/");if(e>=0){return f.substr(e+1)}e=f.lastIndexOf("\\");if(e>=0){return f.substr(e+1)}return f}this.save=function(f){var e=new jive.conc.Promise();e.addErrback(d);if(this.attachments.length>=this.maxFiles){e.emitError(jive.i18n.getMsg("attach.err.tooManyAttchmts.text"))}else{if(f.elem){if(f.filename==null){f.filename=b($j(f.elem).val())}if(f.size==null&&f.elem.files&&f.elem.files[0]&&f.elem.files[0].size){f.size=f.elem.files[0].size}if(!this.isValidType(f)){e.emitError(jive.i18n.i18nText(jive.i18n.getMsg("attach.err.badContentType.text"),[f.filename]))}else{if(!this.isValidSize(f)){e.emitError(jive.i18n.i18nText(jive.i18n.getMsg("attach.err.file_too_large.text"),[f.filename]))}else{$j(f.elem).removeAttr("id").removeAttr("style").hide().attr("name",this.name).appendTo(this.container);this.attachments.push(f);e.emitSuccess()}}}else{e.emitError(jive.i18n.getMsg("attach.err.upload_errors.text"))}}return e};this.findAll=function(){var e=new jive.conc.Promise();e.emitSuccess(this.attachments.slice());return e};this.destroy=function(g){var f=new jive.conc.Promise();f.addErrback(d);var e=false;this.attachments=$j.map(this.attachments,function(h){if(!e&&((h.id!=null&&h.id==g.id)||(h.elem!=null&&h.elem==g.elem))){e=true;return null}return h});if(e&&g.id){$j("<input type='hidden' name='removeAttachmentIDs[]' value='"+g.id+"'/>").appendTo(this.container)}if(e&&g.elem){$j(g.elem).remove()}if(e){f.emitSuccess()}else{f.emitError("attachment not found",g)}return f};this.getRestrictions=function(){var e=new jive.conc.Promise();e.emitSuccess({maxSize:this.maxSize,maxFiles:this.maxFiles,allowByDefault:this.allowByDefault,attachmentExtensions:this.attachmentExtensions,hasAttachPerms:this.hasAttachPerms});return e};a.isValidType=function(g){var e=false;var f=g.filename;var h=c(f);if(this.allowByDefault&&this.attachmentExtensions.indexOf(h)<0){e=true}else{if(!this.allowByDefault&&this.attachmentExtensions.indexOf(h)>=0){e=true}}return e};a.isValidSize=function(e){return e.size==null||this.maxSize>=e.size}});