os.SEMICOLON=";";os.isIe=navigator.userAgent.indexOf("Opera")!=0&&navigator.userAgent.indexOf("MSIE")!=-1;os.compileXMLNode=function(d,g){var a=[];for(var f=d.firstChild;f;f=f.nextSibling){if(f.nodeType==DOM_ELEMENT_NODE){a.push(os.compileNode_(f))}else{if(f.nodeType==DOM_TEXT_NODE){if(f!=d.firstChild||!f.nodeValue.match(os.regExps_.ONLY_WHITESPACE)){var e=os.breakTextNode_(f);for(var b=0;b<e.length;b++){a.push(e[b])}}}}}var c=new os.Template(g);c.setCompiledNodes_(a);return c};os.compileXMLDoc=function(b,c){var a=b.firstChild;while(a.nodeType!=DOM_ELEMENT_NODE){a=a.nextSibling}return os.compileXMLNode(a,c)};os.operatorMap={and:"&&",eq:"==",lte:"<=",lt:"<",gte:">=",gt:">",neq:"!=",or:"||",not:"!"};os.regExps_.SPLIT_INTO_TOKENS=/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\w+|[^"'\w]+/g;os.remapOperators_=function(a){return a.replace(os.regExps_.SPLIT_INTO_TOKENS,function(b){return os.operatorMap.hasOwnProperty(b)?os.operatorMap[b]:b})};os.transformVariables_=function(a){a=os.replaceTopLevelVars_(a);return a};os.variableMap_={my:os.VAR_my,My:os.VAR_my,cur:VAR_this,Cur:VAR_this,"$cur":VAR_this,Top:VAR_top,Context:VAR_loop};os.replaceTopLevelVars_=function(b){var a;a=os.regExps_.TOP_LEVEL_VAR_REPLACEMENT;if(!a){a=/(^|[^.$a-zA-Z0-9])([$a-zA-Z0-9]+)/g;os.regExps_.TOP_LEVEL_VAR_REPLACEMENT=a}return b.replace(a,function(d,e,c){if(os.variableMap_.hasOwnProperty(c)){return e+os.variableMap_[c]}else{return d}})};os.identifierResolver_=function(b,a){return b.hasOwnProperty(a)?b[a]:("get" in b?b.get(a):null)};os.setIdentifierResolver=function(a){os.identifierResolver_=a};os.getFromContext=function(c,b,d){if(!c){return d}var a;if(c.vars_&&c.data_){if(c.data_.nodeType==DOM_ELEMENT_NODE){a=os.getValueFromNode_(c.data_,b);if(a==null){a=void (0)}}else{a=os.identifierResolver_(c.data_,b)}if(typeof(a)=="undefined"){a=os.identifierResolver_(c.vars_,b)}if(typeof(a)=="undefined"&&c.vars_[os.VAR_my]){a=os.getValueFromNode_(c.vars_[os.VAR_my],b)}if(typeof(a)=="undefined"&&c.vars_[VAR_top]){a=c.vars_[VAR_top][b]}}else{if(c.nodeType==DOM_ELEMENT_NODE){a=os.getValueFromNode_(c,b)}else{a=os.identifierResolver_(c,b)}}if(typeof(a)=="undefined"||a==null){if(typeof(d)!="undefined"){a=d}else{a=""}}else{if(d&&os.isArray(d)&&!os.isArray(a)&&a.list&&os.isArray(a.list)){a=a.list}}return a};os.transformExpression_=function(a,b){a=os.remapOperators_(a);a=os.transformVariables_(a);if(os.identifierResolver_){a=os.wrapIdentifiersInExpression(a,b)}return a};os.attributeMap_={"if":ATT_display,repeat:ATT_select,cur:ATT_innerselect};os.appendJSTAttribute_=function(c,b,d){var a=c.getAttribute(b);if(a){d=a+";"+d}c.setAttribute(b,d)};os.copyAttributes_=function(f,g,e){var a=null;for(var c=0;c<f.attributes.length;c++){var b=f.attributes[c].nodeName;var h=f.getAttribute(b);if(b&&h){if(b=="var"){os.appendJSTAttribute_(g,ATT_vars,f.getAttribute(b)+": $this")}else{if(b=="context"){os.appendJSTAttribute_(g,ATT_vars,f.getAttribute(b)+": "+VAR_loop)}else{if(b.length<7||b.substring(0,6)!="xmlns:"){if(os.customAttributes_[b]){os.appendJSTAttribute_(g,ATT_eval,"os.doAttribute(this, '"+b+"', $this, $context)")}else{if(b=="repeat"){os.appendJSTAttribute_(g,ATT_eval,"os.setContextNode_($this, $context)")}}var d=os.attributeMap_.hasOwnProperty(b)?os.attributeMap_[b]:b;var j=(os.attributeMap_[b])?null:os.parseAttribute_(h);if(j){if(d=="class"){d=".className"}else{if(d=="style"){d=".style.cssText"}else{if(g.getAttribute(os.ATT_customtag)){d="."+d}else{if(os.isIe&&!os.customAttributes_[d]&&d.substring(0,2).toLowerCase()=="on"){d="."+d;j="new Function("+j+")"}else{if(d=="selected"&&g.tagName=="OPTION"){d=".selected"}}}}}if(!a){a=[]}a.push(d+":"+j)}else{if(os.attributeMap_.hasOwnProperty(b)){if(h.length>3&&h.substring(0,2)=="${"&&h.charAt(h.length-1)=="}"){h=h.substring(2,h.length-1)}h=os.transformExpression_(h,b=="repeat"?os.VAR_emptyArray:"null")}else{if(d=="class"){g.setAttribute("className",h)}else{if(d=="style"){g.style.cssText=h}}}if(os.isIe&&!os.customAttributes_.hasOwnProperty(d)&&d.substring(0,2).toLowerCase()=="on"){g.attachEvent(d,new Function(h))}else{g.setAttribute(d,h)}}}}}}}if(a){os.appendJSTAttribute_(g,ATT_values,a.join(";"))}};os.compileNode_=function(g){if(g.nodeType==DOM_TEXT_NODE){var h=g.cloneNode(false);return os.breakTextNode_(h)}else{if(g.nodeType==DOM_ELEMENT_NODE){var f;if(g.tagName.indexOf(":")>0){if(g.tagName=="os:Repeat"){f=document.createElement(os.computeContainerTag_(g));f.setAttribute(ATT_select,os.parseAttribute_(g.getAttribute("expression")));var l=g.getAttribute("var");if(l){os.appendJSTAttribute_(f,ATT_vars,l+": $this")}var k=g.getAttribute("context");if(k){os.appendJSTAttribute_(f,ATT_vars,k+": "+VAR_loop)}os.appendJSTAttribute_(f,ATT_eval,"os.setContextNode_($this, $context)")}else{if(g.tagName=="os:If"){f=document.createElement(os.computeContainerTag_(g));f.setAttribute(ATT_display,os.parseAttribute_(g.getAttribute("condition")))}else{f=document.createElement("span");f.setAttribute(os.ATT_customtag,g.tagName);var a=g.tagName.split(":");os.appendJSTAttribute_(f,ATT_eval,'os.doTag(this, "'+a[0]+'", "'+a[1]+'", $this, $context)');var c=g.getAttribute("cur")||"{}";f.setAttribute(ATT_innerselect,c);if(g.tagName=="os:render"||g.tagName=="os:Render"||g.tagName=="os:renderAll"||g.tagName=="os:RenderAll"){os.appendJSTAttribute_(f,ATT_values,os.VAR_parentnode+":"+os.VAR_node)}os.copyAttributes_(g,f,g.tagName)}}}else{f=os.xmlToHtml_(g)}if(f&&!os.processTextContent_(g,f)){for(var d=g.firstChild;d;d=d.nextSibling){var b=os.compileNode_(d);if(b){if(os.isArray(b)){for(var j=0;j<b.length;j++){f.appendChild(b[j])}}else{if(b.tagName=="TR"&&f.tagName=="TABLE"){var e=f.lastChild;while(e&&e.nodeType!=DOM_ELEMENT_NODE&&e.previousSibling){e=e.previousSibling}if(!e||e.tagName!="TBODY"){e=document.createElement("tbody");f.appendChild(e)}e.appendChild(b)}else{f.appendChild(b)}}}}}return f}}return null};os.computeContainerTag_=function(b){var c=b.firstChild;if(c){while(c&&!c.tagName){c=c.nextSibling}if(c){var a=c.tagName.toLowerCase();if(a=="option"){return"optgroup"}if(a=="tr"){return"tbody"}}}return"span"};os.ENTITIES='<!ENTITY nbsp "&#160;">';os.xmlToHtml_=function(a){var b=document.createElement(a.tagName);os.copyAttributes_(a,b);return b};os.fireCallbacks=function(a){var b=a.getVariable(os.VAR_callbacks);while(b.length>0){var c=b.pop();if(c.onAttach){c.onAttach()}else{if(typeof(c)=="function"){c.apply({})}}}};os.processTextContent_=function(c,b){if(c.childNodes.length==1&&!b.getAttribute(os.ATT_customtag)&&c.firstChild.nodeType==DOM_TEXT_NODE){var a=os.parseAttribute_(c.firstChild.data);if(b.nodeName=="SCRIPT"){b.text=os.trimWhitespaceForIE_(c.firstChild.data,true,true)}if(a){b.setAttribute(ATT_content,a)}else{b.appendChild(document.createTextNode(os.trimWhitespaceForIE_(c.firstChild.data,true,true)))}return true}return false};os.pushTextNode=function(b,a){if(a.length>0){b.push(document.createTextNode(a))}};os.trimWhitespaceForIE_=function(c,d,b){if(os.isIe){var a=c.replace(/[\x09-\x0d ]+/g," ");if(d){a=a.replace(/^\s/,"")}if(b){a=a.replace(/\s$/,"")}return a}return c};os.breakTextNode_=function(g){var a=os.regExps_.VARIABLE_SUBSTITUTION;var f=g.data;var b=[];var c=f.match(a);while(c){if(c[1].length>0){os.pushTextNode(b,os.trimWhitespaceForIE_(c[1]))}var d=c[2].substring(2,c[2].length-1);if(!d){d=VAR_this}var e=document.createElement("span");e.setAttribute(ATT_content,os.transformExpression_(d));b.push(e);c=f.match(a);f=c[3];c=f.match(a)}if(f.length>0){os.pushTextNode(b,os.trimWhitespaceForIE_(f))}return b};os.transformLiteral_=function(a){return"'"+a.replace(/'/g,"\\'").replace(/\n/g," ").replace(/;/g,"'+os.SEMICOLON+'")+"'"};os.parseAttribute_=function(c){if(!c.length){return null}var a=os.regExps_.VARIABLE_SUBSTITUTION;var f=c;var e=[];var b=f.match(a);if(!b){return null}while(b){if(b[1].length>0){e.push(os.transformLiteral_(os.trimWhitespaceForIE_(b[1],e.length==0)))}var d=b[2].substring(2,b[2].length-1);if(!d){d=VAR_this}e.push("("+os.transformExpression_(d)+")");f=b[3];b=f.match(a)}if(f.length>0){e.push(os.transformLiteral_(os.trimWhitespaceForIE_(f,false,true)))}return e.join("+")};os.getValueFromNode_=function(d,b){if(b=="*"){var c=[];for(var f=d.firstChild;f;f=f.nextSibling){c.push(f)}return c}if(b.indexOf(":")>=0){b=b.substring(b.indexOf(":")+1)}var a=d[b];if(typeof(a)=="undefined"||a==null){a=d.getAttribute(b)}if(typeof(a)!="undefined"&&a!=null){if(a=="false"){a=false}else{if(a=="0"){a=0}}return a}var e=d[os.VAR_my];if(!e){e=os.computeChildMap_(d);d[os.VAR_my]=e}a=e[b.toLowerCase()];return a};os.identifiersNotToWrap_={};os.identifiersNotToWrap_["true"]=true;os.identifiersNotToWrap_["false"]=true;os.identifiersNotToWrap_["null"]=true;os.identifiersNotToWrap_["var"]=true;os.identifiersNotToWrap_[os.VAR_my]=true;os.identifiersNotToWrap_[VAR_this]=true;os.identifiersNotToWrap_[VAR_context]=true;os.identifiersNotToWrap_[VAR_top]=true;os.identifiersNotToWrap_[VAR_loop]=true;os.canStartIdentifier=function(a){return(a>="a"&&a<="z")||(a>="A"&&a<="Z")||a=="_"||a=="$"};os.canBeInIdentifier=function(a){return os.canStartIdentifier(a)||(a>="0"&&a<="9")||a==":"};os.canBeInToken=function(a){return os.canBeInIdentifier(a)||a=="("||a==")"||a=="["||a=="]"||a=="."};os.wrapSingleIdentifier=function(a,b,c){if(os.identifiersNotToWrap_.hasOwnProperty(a)&&(!b||b==VAR_context)){return a}return os.VAR_identifierresolver+"("+(b||VAR_context)+", '"+a+"'"+(c?", "+c:"")+")"};os.wrapIdentifiersInToken=function(d,a){if(!os.canStartIdentifier(d.charAt(0))){return d}if(d.substring(0,os.VAR_msg.length+1)==(os.VAR_msg+".")&&os.getGadgetUserPrefs()!=null){var m=d.split(".")[1];var b=os.getPrefMessage(m)||"";return os.parseAttribute_(b)||os.transformLiteral_(b)}var l=os.tokenToIdentifiers(d);var f=false;var g=[];var c=null;for(var k=0;k<l.length;k++){var h=l[k];f=os.breakUpParens(h);if(!f){if(k==l.length-1){c=os.wrapSingleIdentifier(h,c,a)}else{c=os.wrapSingleIdentifier(h,c)}}else{g.length=0;g.push(os.wrapSingleIdentifier(f[0],c));for(var e=1;e<f.length;e+=3){g.push(f[e]);if(f[e+1]){g.push(os.wrapIdentifiersInExpression(f[e+1]))}g.push(f[e+2])}c=g.join("")}}return c};os.wrapIdentifiersInExpression=function(d,e){var a=[];var c=os.expressionToTokens(d);for(var b=0;b<c.length;b++){a.push(os.wrapIdentifiersInToken(c[b],e))}return a.join("")};os.expressionToTokens=function(k){var h=[];var f=false;var g=false;var j=0;var b=false;var c=null;var d=[];for(var e=0;e<k.length;e++){var a=k.charAt(e);if(f){if(!b&&a==c){f=false}else{if(a=="\\"){b=true}else{b=false}}d.push(a)}else{if(a=="'"||a=='"'){f=true;c=a;d.push(a);continue}if(a=="("){j++}else{if(a==")"&&j>0){j--}}if(j>0){d.push(a);continue}if(!g&&os.canStartIdentifier(a)){if(d.length>0){h.push(d.join(""));d.length=0}g=true;d.push(a);continue}if(g){if(os.canBeInToken(a)){d.push(a)}else{h.push(d.join(""));d.length=0;g=false;d.push(a)}}else{d.push(a)}}}h.push(d.join(""));return h};os.tokenToIdentifiers=function(e){var h=false;var b=null;var g=false;var c=[];var a=[];for(var d=0;d<e.length;d++){var f=e.charAt(d);if(h){if(!g&&f==b){h=false}else{if(f=="\\"){g=true}else{g=false}}c.push(f);continue}else{if(f=="'"||f=='"'){c.push(f);h=true;b=f;continue}}if(f=="."&&!h){a.push(c.join(""));c.length=0;continue}c.push(f)}a.push(c.join(""));return a};os.breakUpParens=function(m){var g=m.indexOf("(");var e=m.indexOf("[");if(g<0&&e<0){return false}var j=[];if(g<0||(e>=0&&e<g)){g=0;j.push(m.substring(0,e))}else{e=0;j.push(m.substring(0,g))}var d=null;var l=false;var f=null;var b=0;var c=false;var h=[];for(var k=e+g;k<m.length;k++){var a=m.charAt(k);if(l){if(!c&&a==f){l=false}else{if(a=="\\"){c=true}else{c=false}}h.push(a)}else{if(a=="'"||a=='"'){l=true;f=a;h.push(a);continue}if(b==0){if(a=="("||a=="["){d=a;b++;j.push(a);h.length=0}}else{if((d=="("&&a==")")||(d=="["&&a=="]")){b--;if(b==0){j.push(h.join(""));j.push(a)}else{h.push(a)}}else{if(a==d){b++}h.push(a)}}}}return j};