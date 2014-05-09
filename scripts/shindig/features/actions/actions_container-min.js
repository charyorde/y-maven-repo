(function(){function x(){this.registryById={};this.registryByPath={};this.registryByDataType={};this.registryByUrl={};this.urlToSite={};this.actionToUrl={};this.addAction=function(G,A){var B=G.id;if(!B){return}var J=G.path;if(J){var D=J.split("/");var I=this.registryByPath;for(var F=0;F<D.length;F++){var C=D[F];if(!I[C]){I[C]={}}I=I[C]}var E=I["@actions"];if(!E){I["@actions"]=[G]}else{I["@actions"]=E.concat(G)}}else{if(G.dataType){var H=G.dataType;this.registryByDataType[H]=this.registryByDataType[H]?this.registryByDataType[H].concat(G):[G]}else{return}}this.registryById[B]=G;if(A){this.actionToUrl[G.id]=A;this.registryByUrl[A]=this.registryByUrl[A]?this.registryByUrl[A].concat(G):[G]}};this.removeAction=function(A){var F=this.registryById[A];delete this.registryById[A];var J=F.path;if(J){var D=this.getActionsByPath(J);var E=D.indexOf(F);if(E!=-1){D.splice(E,1)}}else{var G=F.dataType;var H=this.registryByDataType[G];var I=H.indexOf(F);H.splice(I,1);if(H.length==0){delete this.registryByDataType[G]}}var B=this.actionToUrl[A];if(B){delete this.actionToUrl[A];var C=this.registryByUrl[B];var I=C.indexOf(F);C.splice(I,1);if(C.length==0){delete this.registryByUrl[B]}}};this.getItemById=function(B){var A=this.registryById?this.registryById:{};return A[B]};this.getAllActions=function(){var A=[];for(var B in this.registryById){if(this.registryById.hasOwnProperty(B)){A=A.concat(this.registryById[B])}}return A};this.getActionsByPath=function(E){var F=[];var D=E.split("/");var C=this.registryByPath?this.registryByPath:{};for(var B=0;B<D.length;B++){var A=D[B];if(C[A]){C=C[A]}else{return F}}if(C){F=C["@actions"]}return F};this.getActionsByDataType=function(A){var B=[];if(this.registryByDataType[A]){B=this.registryByDataType[A]}return B};this.getActionsByUrl=function(A){var B=[];if(this.registryByUrl[A]){B=B.concat(this.registryByUrl[A])}return B};this.addGadgetSite=function(C,B){var A=this.urlToSite[C];if(A){this.urlToSite[C]=A.concat(B)}else{this.urlToSite[C]=[B]}};this.removeGadgetSite=function(E){for(var B in this.urlToSite){if(this.urlToSite.hasOwnProperty(B)){var D=this.urlToSite[B];if(!D){continue}for(var C=0;C<D.length;C++){var A=D[C];if(A&&A.getId()==E){D.splice(C,1);if(D.length==0){delete this.urlToSite[B]}}}}}};this.getGadgetSites=function(H){var F=this.getItemById(H);var B=this.actionToUrl[H],G,E;if(E=this.urlToSite[B]){for(var D=0,A;A=E[D];D++){var C=A.getActiveGadgetHolder();if(!F.view||(C&&C.getView()===F.view)){(G=G||[]).push(A)}}}return G};this.getUrl=function(A){return this.actionToUrl[A]}}function p(B){var A={};var C;if(typeof ActiveXObject!="undefined"){C=new ActiveXObject("Microsoft.XMLDOM");C.async=false;C.validateOnParse=false;C.resolveExternals=false;if(!C.loadXML(B)){A.errors="500 Failed to parse XML";A.rc=500}else{A.data=C}}else{var D=new DOMParser();C=D.parseFromString(B,"application/xml");if("parsererror"===C.documentElement.nodeName){A.errors="500 Failed to parse XML";A.rc=500}else{A.data=C}}return A}function t(A){var D=A.id;var C=l.getItemById(D);if(!C){j(A)}else{var B=r[D];if(B){k(D,B.selection);delete r[D]}}}function j(A,B){l.addAction(A,B);s([A])}function q(B){var A=l.getItemById(B);l.removeAction(B);h([A])}var d={};var o=[];function k(A,I){var J={};J.actionId=A;J.selectionObj=I;if(!I&&z&&z.selection){J.selectionObj=z.selection.getSelection()}var G=d[A];if(G){for(var D=0,C;C=G[D];D++){C.call(null,A,J.selectionObj)}}for(var D=0,C;C=o[D];D++){C.call(null,A,J.selectionObj)}var E=l.getGadgetSites(A);if(E){for(var D=0,B;B=E[D];D++){var H=B.getActiveGadgetHolder();if(H){var F=H.getIframeId();gadgets.rpc.call(F,"actions",null,"runAction",J)}}}}var b=function(C){for(var B in C){if(!C.hasOwnProperty(B)){continue}var J=C[B];if(!J.error){if(J.modulePrefs){var N=J.modulePrefs.features.actions;if(N&&N.params){var H=N.params["action-contributions"];if(H){if(typeof H!=="string"){H=H.toString()}H=H.replace(/\n/g,"");H=H.replace(/\s+</g,"<");H=H.replace(/>\s+/g,">");if(H.indexOf("<actions>")===-1){H="<actions>"+H+"</actions>"}var L=p(H);if(L&&!L.errors){var M=gadgets.json.xml.convertXmlToJson(L.data);var K=M.actions;if(K){var D=K.action;if(!(D instanceof Array)){D=[D]}for(var E=0;E<D.length;E++){var G=D[E];for(var F in G){if(!G.hasOwnProperty(F)){continue}var A=F.substring(1);var I=G[F];G[A]=I;delete G[F]}if(!l.getItemById(G.id)){j(G,B)}}}}}}}}}};var y=function(B){var C=B.getActiveGadgetHolder();if(C){var A=C.getUrl();l.addGadgetSite(A,B)}};var e=function(A){var B=A.getId();l.removeGadgetSite(B)};var u=function(B){var A=l.getActionsByUrl(B);for(var C=0;C<A.length;C++){var D=A[C];q(D.id)}};var m={};m[osapi.container.CallbackType.ON_PRELOADED]=b;m[osapi.container.CallbackType.ON_NAVIGATED]=y;m[osapi.container.CallbackType.ON_CLOSED]=e;m[osapi.container.CallbackType.ON_UNLOADED]=u;function a(B,A){switch(B){case"bindAction":t(A);break;case"runAction":z.actions.runAction(A.id,A.selection);break;case"removeAction":h([A]);break;case"getActionsByPath":return z.actions.getActionsByPath(A);case"getActionsByDataType":return z.actions.getActionsByDataType(A);case"addShowActionListener":g(A);break;case"addHideActionListener":w(A);break}}var f=function(A){};var v=[];var s=function(B){f(B);for(var A=0;A<v.length;A++){v[A](B)}};function g(A){v.push(A)}var n=function(A){};var i=[];var h=function(B){n(B);for(var A=0;A<i.length;A++){i[A](B)}};function w(A){i.push(A)}var c=function(A,B){};var l=new x();var r={};var z=null;osapi.container.Container.addMixin("actions",function(A){z=A;gadgets.rpc.register("actions",a);if(A.addGadgetLifecycleCallback){A.addGadgetLifecycleCallback("actions",m)}return{registerShowActionsHandler:function(B){if(typeof B==="function"){f=B}},registerHideActionsHandler:function(B){if(typeof B==="function"){n=B}},registerNavigateGadgetHandler:function(B){if(typeof B==="function"){c=B}},runAction:function(G,D){var F=l.getItemById(G);if(F){var C=l.getGadgetSites(G);if(!C){var B=l.getUrl(G);r[G]={selection:D||z.selection.getSelection()};var E={};if(F.view){E[osapi.container.actions.OptParam.VIEW]=F.view}if(F.viewTarget){E[osapi.container.actions.OptParam.VIEW_TARGET]=F.viewTarget}c(B,E)}else{k(G,D)}}},getAction:function(B){return l.getItemById(B)},getAllActions:function(){return l.getAllActions()},getActionsByPath:function(B){var C=[];C=C.concat(l.getActionsByPath(B));return C},getActionsByDataType:function(B){var C=[];C=C.concat(l.getActionsByDataType(B));return C},addListener:function(C,B){if(C&&typeof(C)!="function"){throw new Error("listener param must be a function")}if(B){(d[B]=d[B]||[]).push(C)}else{o.push(C)}},removeListener:function(C){var B=listeners.indexOf(C);if(B!=-1){listeners.splice(B,1)}}}})})();