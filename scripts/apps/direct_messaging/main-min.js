jive.namespace("DirectMessaging");jive.DirectMessaging.Main=function(c,a){function b(e){a.unlockSubmit();a.notifyError(e)}function d(){a.hideModal();a.notifySuccess()}this.onSubmit=function(e){c.sendMessage(e).addCallback(d).addErrback(b);return this};this.addRecipientsById=function(f,e){e=e||new jive.conc.Promise();c.getUsersByIds(f).addCallback(function(g){a.setRecipients(g);e.emitSuccess()})};this.showModal=function(){a.openModal();return this};this.hideModal=function(){a.hideModal();return this};a.addListener("form-submit",this.onSubmit.bind(this))};