os.createContext=function(d,f){var a=JsEvalContext.create(d);a.setVariable(os.VAR_callbacks,[]);var e=os.getContextDefaults_();for(var c in e){if(e.hasOwnProperty(c)){a.setVariable(c,e[c])}}a.setVariable(os.VAR_emptyArray,os.EMPTY_ARRAY);if(f){for(var b in f){if(f.hasOwnproperty(b)){a.setVariable(b,f[b])}}}return a};os.contextDefaults_=null;os.getContextDefaults_=function(){if(!os.contextDefaults_){os.contextDefaults_={};os.contextDefaults_[os.VAR_emptyArray]=os.EMPTY_ARRAY;os.contextDefaults_[os.VAR_identifierresolver]=os.getFromContext;if(window.JSON&&JSON.parse){os.contextDefaults_["osx:parseJson"]=JSON.parse}else{if(window.gadgets&&gadgets.json&&gadgets.json.parse){os.contextDefaults_["osx:parseJson"]=gadgets.json.parse}}}return os.contextDefaults_};os.Template=function(a){this.templateRoot_=document.createElement("span");this.id=a||("template_"+os.Template.idCounter_++)};os.Template.idCounter_=0;os.registeredTemplates_={};os.registerTemplate=function(a){os.registeredTemplates_[a.id]=a};os.unRegisterTemplate=function(a){delete os.registeredTemplates_[a.id]};os.getTemplate=function(a){return os.registeredTemplates_[a]};os.Template.prototype.setCompiledNode_=function(a){os.removeChildren(this.templateRoot_);this.templateRoot_.appendChild(a)};os.Template.prototype.setCompiledNodes_=function(a){os.removeChildren(this.templateRoot_);for(var b=0;b<a.length;b++){this.templateRoot_.appendChild(a[b])}};os.Template.prototype.render=function(a,b){if(!b){b=os.createContext(a)}return os.renderTemplateNode_(this.templateRoot_,b)};os.Template.prototype.renderInto=function(c,b,d){if(!d){d=os.createContext(b)}var a=this.render(b,d);os.removeChildren(c);os.appendChildren(a,c);os.fireCallbacks(d)};