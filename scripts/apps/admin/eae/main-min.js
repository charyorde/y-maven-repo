jive.namespace("EAEAdmin");jive.EAEAdmin.Main=jive.oo.Class.extend(function(a){var b=jive.EAEAdmin;this.init=function(d){var c=this;this.eaeSource=new b.EAESource(d);this.eaeView=new b.EAEView(d);this.eaeView.addListener("update-progress",function(e){c.eaeSource.getCurrentProgress().addCallback(function(f){e(f)})})}});