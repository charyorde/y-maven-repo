jive.namespace("SSOAdminApp");jive.SSOAdminApp.SSOView=jive.oo.Class.extend(function(a){jive.conc.observable(this);this.init=function(c){var b=this;$j(document).ready(function(){$j("#sso-submit").click(function(d){d.preventDefault();var f=jsonifyForm($j("#sso-save :input"));b.emit("save",f)})})}});