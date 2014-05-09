var innerShiv=(function(){var d,r;return function(h,u,doc){doc=doc||document;if(!d){d=doc.createElement("div");r=doc.createDocumentFragment();
/*@cc_on d.style.display = 'none';@*/
}var e=d.cloneNode(true);
/*@cc_on doc.body.appendChild(e);@*/
e.innerHTML=h.replace(/^\s\s*/,"").replace(/\s\s*$/,"");
/*@cc_on doc.body.removeChild(e);@*/
if(u===false){return e.childNodes}var f=r.cloneNode(true),i=e.childNodes.length;while(i--){f.appendChild(e.firstChild)}return f}}());if(typeof soy!="undefined"&&soy.StringBuilder){(function(){var a=soy.StringBuilder.prototype,b=/^[^<]*(<[\w\W]+>)[^>]*$/;a.toStringWithoutInnerShiv=a.toString;a.toStringWithInnerShiv=function(){var d=a.toStringWithoutInnerShiv.apply(this,arguments),c;if(d.match(b)){c=jQuery(innerShiv(d,false));c.toString=function(){return d};return c}else{return d}};a.toString=a.toStringWithInnerShiv})()};