jive.namespace("Authentication");jive.Authentication.Source=jive.oo.Class.extend(function(a){this.init=function(b){var d=this;var c=(b&&b.uri)||jive.app.url({path:"/cs_login"});d.uri=(b&&b.forceSecure)?jive.secure(c):c};this.login=function(c){var d=this;var e=new jive.conc.Promise();var b=$j(jive.authentication.sourceForm($j.extend({action:d.uri},c)));$j("body").append(b);b.submit();b.remove();e.emitSuccess();return e}});