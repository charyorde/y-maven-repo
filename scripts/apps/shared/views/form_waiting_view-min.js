jive.namespace("shared");jive.shared.FormWaitingView=$Class.extend({init:function(a,b){this._$container=$j(a);b=b||{};if(b.containerPadding){this._containerPadding=b.containerPadding}else{this._containerPadding=this._$container.css("padding-left")==null?0:Number(this._$container.css("padding-left").replace("px",""))}this._buttonSelector=b.buttonSelector||"input[type=button], input[type=submit]";this._bgCssClass=b.bgCssClass||"jive-form-waiting-disable-bg"},disableForm:function(){var e=new jive.loader.LoaderView({size:"big"});if(this._$container.find(".jive-js-form-disable").length==0){var c={width:this._$container.innerWidth(),height:this._$container.innerHeight(),left:0,top:0};var d=$j(jive.shared.formwaiting.formWaitingOverlay({bgCssClass:this._bgCssClass}));for(var b in c){d.css(b,c[b]+"px")}d.prependTo(this._$container);var a=e.getContent();e.appendTo(d);a.css("left",(c.width/2-a.width()/2)+"px");a.css("top",(c.height/2-a.height()/2)+"px");this._$container.find(this._buttonSelector).prop("disabled",true)}},enableForm:function(){this._$container.find(".jive-js-form-disable").remove();this._$container.find(this._buttonSelector).prop("disabled",false)}});