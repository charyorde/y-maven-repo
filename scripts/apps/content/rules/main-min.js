jive.namespace("rules");jive.rules.Main=jive.oo.Class.extend(function(A){this.init=function(C){var B=this;B.options=C||{};B.documentID=C.documentID;this.Source=C.Source||new jive.rules.Source(C);this.Source.suppressGenericErrorMessages();this.View=new jive.rules.View(C);this.View.addListener("loaded",function(D){B.View.showSpinner();B.Source.get(B.documentID).addCallback(function(E){B.View.render(E)}).always(function(){B.View.hideSpinner()})})}})