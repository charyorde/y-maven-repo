jive.namespace("Announcements");jive.Announcements.Source=jive.RestService.extend(function(a,b){a.resourceType="announcement";this.init=function(c){b.init.call(this);this.suppressGenericErrorMessages()};this.expire=function(c){return this.commonAjaxRequest(new jive.conc.Promise(),"POST",{url:this.RESOURCE_ENDPOINT+"/expire/"+c})};this.dismiss=function(c){return this.commonAjaxRequest(new jive.conc.Promise(),"POST",{url:this.RESOURCE_ENDPOINT+"/dismiss/"+c})};this.showGenericSaveError=function(){this.displayError(this.errorSaving())};this.findAll=function(c){return b.findAll.call(this,jQuery.extend({nonce:(new Date()).getTime()},c))}});