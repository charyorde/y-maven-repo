os.Container={};os.Container.inlineTemplates_=[];os.Container.domLoadCallbacks_=null;os.Container.domLoaded_=false;os.Container.requiredLibraries_=0;os.Container.autoProcess_=true;os.Container.processed_=false;os.Container.disableAutoProcessing=function(){if(os.Container.processed_){throw Error("Document already processed.")}os.Container.autoProcess_=false};os.disableAutoProcessing=os.Container.disableAutoProcessing;os.Container.registerDomLoadListener_=function(){var a=window.gadgets;if(a&&a.util){a.util.registerOnLoadHandler(os.Container.onDomLoad_)}else{if(typeof(navigator)!="undefined"&&navigator.product&&navigator.product=="Gecko"){window.addEventListener("DOMContentLoaded",os.Container.onDomLoad_,false)}}if(window.addEventListener){window.addEventListener("load",os.Container.onDomLoad_,false)}else{if(!document.body){setTimeout(arguments.callee,0);return}var b=window.onload||function(){};window.onload=function(){b();os.Container.onDomLoad_()}}};os.Container.onDomLoad_=function(){if(os.Container.domLoaded_){return}for(var a=0;a<os.Container.domLoadCallbacks_.length;a++){try{os.Container.domLoadCallbacks_[a]()}catch(b){os.log(b)}}os.Container.domLoaded_=true};os.Container.executeOnDomLoad=function(a){if(os.Container.domLoaded_){setTimeout(a,0)}else{if(os.Container.domLoadCallbacks_==null){os.Container.domLoadCallbacks_=[];os.Container.registerDomLoadListener_()}os.Container.domLoadCallbacks_.push(a)}};os.Container.registerDocumentTemplates=function(e){var f=e||document;var b=f.getElementsByTagName(os.Container.TAG_script_);for(var c=0;c<b.length;++c){var d=b[c];if(os.Container.isTemplateType_(d.type)){var a=d.getAttribute("tag");if(a){os.Container.registerTagElement_(d,a)}else{if(d.getAttribute("name")){os.Container.registerTemplateElement_(d,d.getAttribute("name"))}}}}};os.Container.compileInlineTemplates=function(a,g){var h=g||document;var b=h.getElementsByTagName(os.Container.TAG_script_);for(var d=0;d<b.length;++d){var f=b[d];if(os.Container.isTemplateType_(f.type)){var c=f.getAttribute("tag");if(!c||c.length<0){var e=os.compileTemplate(f,c);if(e){os.Container.inlineTemplates_.push({template:e,node:f})}else{os.warn("Failed compiling inline template.")}}}}};os.Container.getDefaultContext=function(){if((window.gadgets&&gadgets.util.hasFeature("opensocial-data"))||(opensocial.data.getDataContext)){return os.createContext(opensocial.data.getDataContext().getData())}return os.createContext({})};os.Container.renderInlineTemplates=function(h){var k=h||document;var b=os.Container.getDefaultContext();var e=os.Container.inlineTemplates_;for(var g=0;g<e.length;++g){var l=e[g].template;var f=e[g].node;var a="_T_"+l.id;var d=true;var c=k.getElementById(a);if(!c){c=k.createElement("div");c.setAttribute("id",a);f.parentNode.insertBefore(c,f);d=false}if((window.gadgets&&gadgets.util.hasFeature("opensocial-data"))||(opensocial.data.DataContext)){var n=f.getAttribute("before")||f.getAttribute("beforeData");if(n){var o=n.split(/[\, ]+/);opensocial.data.DataContext.registerListener(o,os.Container.createHideElementClosure(c))}var j=f.getAttribute("require")||f.getAttribute("requireData");if(j){var o=j.split(/[\, ]+/);var m=os.Container.createRenderClosure(l,c);if("true"==f.getAttribute("autoUpdate")){if(d){opensocial.data.getDataContext().registerDeferredListener_(o,m)}else{opensocial.data.getDataContext().registerListener(o,m)}}else{opensocial.data.getDataContext().registerOneTimeListener_(o,m)}}else{l.renderInto(c,null,b)}}else{l.renderInto(c,null,b)}}};os.Container.createRenderClosure=function(c,b,a,d){var e=function(){var f=d;var g=a;if(!f){if(g){f=os.createContext(g)}else{f=os.Container.getDefaultContext();g=f.data_}}c.renderInto(b,g,f)};return e};os.Container.createHideElementClosure=function(a){var b=function(){displayNone(a)};return b};os.Container.registerTemplate=function(a){var b=document.getElementById(a);return os.Container.registerTemplateElement_(b)};os.Container.registerTag=function(a){var b=document.getElementById(a);os.Container.registerTagElement_(b,a)};os.Container.renderElement=function(b,d,a){var e=os.getTemplate(d);if(e){var c=document.getElementById(b);if(c){e.renderInto(c,a)}else{os.warn("Element ("+b+") not found to render into.")}}else{os.warn("Template ("+d+") not registered.")}};os.Container.processInlineTemplates=function(a){os.Container.compileInlineTemplates(a);os.Container.renderInlineTemplates(a)};os.Container.processGadget=function(){if(!window.gadgets){return}var b=gadgets.util.getFeatureParameters("opensocial-templates");if(!b){return}if(b.disableAutoProcessing&&b.disableAutoProcessing.toLowerCase!="false"){os.Container.autoProcess_=false}if(b.requireLibrary){if(typeof b.requireLibrary=="string"){os.Container.addRequiredLibrary(b.requireLibrary)}else{for(var a=0;a<b.requireLibrary.length;a++){os.Container.addRequiredLibrary(b.requireLibrary[a])}}}};os.Container.executeOnDomLoad(os.Container.processGadget);os.Container.processWaitingForLibraries_=false;os.Container.processDocument=function(a,b){if(os.Container.requiredLibraries_>0){os.Container.processWaitingForLibraries_=true;return}os.Container.processWaitingForLibraries_=false;os.Container.registerDocumentTemplates(b);os.Container.processInlineTemplates(a,b);os.Container.processed_=true};os.process=os.Container.processDocument;os.Container.executeOnDomLoad(function(){if(os.Container.autoProcess_){os.Container.processDocument()}});os.Container.onLibraryLoad_=function(){if(os.Container.requiredLibraries_>0){os.Container.requiredLibraries_--;if(os.Container.requiredLibraries_==0&&os.Container.processWaitingForLibraries_){os.Container.processDocument()}}};os.Container.addRequiredLibrary=function(a){os.Container.requiredLibraries_++;os.Loader.loadUrl(a,os.Container.onLibraryLoad_)};os.Container.TAG_script_="script";os.Container.templateTypes_={};os.Container.templateTypes_["text/os-template"]=true;os.Container.templateTypes_["text/template"]=true;os.Container.isTemplateType_=function(a){return os.Container.templateTypes_[a]!=null};os.Container.registerTemplateElement_=function(a,c){var b=os.compileTemplate(a,c);if(b){os.registerTemplate(b)}else{os.warn("Could not compile template ("+a.id+")")}return b};os.Container.registerTagElement_=function(d,c){var e=os.Container.registerTemplateElement_(d,c);if(e){var b=c.split(":");if(b.length==2){var a=os.getNamespace(b[0]);if(!a){a=os.createNamespace(b[0],null)}a[b[1]]=os.createTemplateCustomTag(e)}}};