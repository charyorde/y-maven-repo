jive.namespace("SSOAdminApp");jive.SSOAdminApp.KerberosView=jive.oo.Class.extend(function(a){jive.conc.observable(this);this.init=function(c){var b=this;$j(document).ready(function(){$j("#kerberos-submit").click(function(d){d.preventDefault();var f=jsonifyForm($j("#kerberos-save :input"));b.emit("save",f)})})}});