jive.model.isDocument=function(a){return $obj(a)&&a!=null&&$def(a.getBody)&&$def(a.getSubject)};jive.model.Document=function(){var e=this;var d=new Array();function a(g,h){return function(){g(h)}}this.clearRevertActions=function(){d=new Array()};this.revert=function(){while(d.length>0){d[0]();d.splice(0,1)}};this.confirm=function(){e.notifyTaskChanged()};var f;var b;this.getID=function(){return f};this.getHTML=function(){return b};this.setID=function(g){f=g};this.setHTML=function(g){d.push(a(function(h){b=h},b));b=g};this.cleanAfterInit=function(){e.clearRevertActions();e.setID=null};this.convertToWiki=function(){objectLookupSessionKey};var c=new Array();this.addListener=function(g){c.push(g)};this.removeListener=function(h){for(var g=0;g<c.length;g++){if(c[g]==h){c.splice(g,1)}}};this.notifyDocumentChanged=function(){for(var g=0;g<c.length;g++){c[g].documentChanged(e)}}};jive.model.DocumentCache=function(d){var f=this;var a=new jive.ext.y.HashTable();function j(){this.documentChanged=function(k){f.notifyDocumentChanged(k)}}function e(l){var k=a.get(l.getID());if($obj(k)){k.clearRevertActions()}else{l.addListener(new j());a.put(l.getID(),l)}f.notifyLoadDocument(l)}this.saveDocument=function(m){f.notifySavingDocument(m);try{var l=d.getSettingsManager();var k=d.newAjax(function(o){try{if(o.tagName=="success"){f.notifyDoneSavingDocument(m)}else{f.notifySavingDocumentFailed(m)}}catch(q){alert(q)}},function(){try{f.notifySavingDocumentFailed(m)}catch(o){alert("saving failed: "+o)}})}catch(n){f.notifySavingDocumentFailed(m)}};function c(k){f.notifyNewDocumentFromWiki(new jive.model.Document("",k))}this.newDocumentFromWiki=function(k){if(!$def(window.objectLookupSessionKey)){throw"window.objectLookupSessionKey must be defined to use newDocumentFromWiki()"}if(!$def(WikiTextConverter)){throw"WikiTextConverter must be defined to use newDocumentFromWiki()"}WikiTextConverter.convertFromWiki(k,window.objectLookupSessionKey,{callback:c,timeout:DWRTimeout,errorHandler:f.notifyNewDocumentFromWikiFailed})};function b(o){var m=new Array();for(var n=0;n<o.childNodes.length;n++){var k=new jive.model.Document();var q=o.childNodes[n];for(var l=0;l<q.childNodes.length;l++){if(q.childNodes[l].tagName=="id"){if(q.childNodes[l].childNodes.length>0){k.setID(q.childNodes[l].childNodes[0].nodeValue)}}}m.push(k);k.cleanAfterInit();e(k)}return m}this.loadExternalDocuments=function(l){f.notifyLoadBegin();try{var k=loadDocumentsXML(l);f.notifyLoadFinish();return k}catch(m){f.notifyLoadFail()}return null};this.addListener=function(k){h.push(k)};var h=new Array();var i=new Array();this.addListenerAction=function(k){i.push(k)};this.executeListenerActions=function(){while(i.length>0){i[0]();i.splice(0,1)}};this.removeListener=function(l){for(var k=0;k<h.length;k++){if(h[k]==l){h.splice(k,1)}}};this.notifyDocumentChanged=function(l){for(var k=0;k<h.length;k++){h[k].documentChanged(l)}f.executeListenerActions()};this.notifyLoadDocument=function(l){for(var k=0;k<h.length;k++){h[k].loadDocument(l)}f.executeListenerActions()};this.notifyLoadBegin=function(){for(var k=0;k<h.length;k++){h[k].beginLoadingDocuments()}f.executeListenerActions()};this.notifyLoadFinish=function(){for(var k=0;k<h.length;k++){h[k].doneLoadingDocuments()}f.executeListenerActions()};this.notifyLoadFail=function(){for(var k=0;k<h.length;k++){h[k].loadingDocumentsFailed()}f.executeListenerActions()};this.notifySavingDocument=function(l){for(var k=0;k<h.length;k++){h[k].savingDocument(l)}f.executeListenerActions()};this.notifyDoneSavingDocument=function(l){for(var k=0;k<h.length;k++){h[k].doneSavingDocument(l)}f.executeListenerActions()};this.notifySavingDocumentFailed=function(l){for(var k=0;k<h.length;k++){h[k].savingDocumentFailed(l)}f.executeListenerActions()};this.notifyNewDocumentFromWiki=function(l){for(var k=0;k<h.length;k++){h[k].newDocumentFromWiki(l)}f.executeListenerActions()};this.notifyNewDocumentFromWikiFailed=function(){for(var k=0;k<h.length;k++){h[k].newDocumentFromWikiFailed(p)}f.executeListenerActions()};var g=new jive.model.DocumentCacheListener();g.documentChanged=function(k){f.saveDocument(k)};f.addListener(g)};