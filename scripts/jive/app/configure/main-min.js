define("jive.JAF.Configuration.ConfigureMainV2",["jive.JAF.Configuration.ConfigureView","jive.JAF.Configuration.ConfigureModel"],function(a,b){return jive.oo.Class.extend(function(c){jive.conc.observable(this);c.init=function(e){var d=this;var f=e.app;this.domTarget=e.domTarget;this.instanceAppID=f.instanceAppID;this.model=new b();this.model.addListener("app.got.configure.data",function(g){d.configureView=new a(f,g,d.domTarget);d.configureView.addListener("app.save_configuration",function(i){var h={instanceAppID:d.instanceAppID,services:i};d.model.persist_configuration(h)});d.configureView.addListener("app.cancel_configuration",function(){d.emit("app.configure.cancel",d.instanceAppID)});d.configureView.addListener("app.service.wire.submit",function(h){d.emit("app.service.wire.submit",h)});d.configureView.addListener("app.service.wire.cancel",function(h){d.emit("app.service.wire.cancel",h)})});this.model.get_configuration_data(this.instanceAppID);this.model.addListener("app.configure.success",function(){d.emit("app.configure.success",d.instanceAppID)});this.model.addListener("app.configure.failed",function(){d.emit("app.configure.failed",d.instanceAppID)})}})});