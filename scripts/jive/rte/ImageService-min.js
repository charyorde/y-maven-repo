jive.namespace("rte");jive.rte.ImageService=jive.RestService.extend(function(b,c){var f="image/jpeg";var e="image/png";var d=/^data:(image\/[^;,]+)[^,]*,/;b.resourceType="rteImage";b.init=function(g){c.init.call(this,g);b.options=$j.extend({maxWidth:1600,maxHeight:1080,maxDataUrlLength:Math.ceil(2048*1024*8/5),objectId:g.objectId,objectType:g.objectType},g);this.defaultParams={objectId:g.objectId,objectType:g.objectType,containerId:g.containerId,containerType:g.containerType};b.isInitialized=false;b.initPromise=new jive.conc.Promise();this.initSettings()};b.initSettings=function(){var g=new jive.conc.Promise();this.commonAjaxRequest(g,"GET",{url:this.getUrl("settings")}).addCallback(function(h){$j.extend(b.options,h);b.isInitialized=true;b.initPromise.emitSuccess({maxWidth:b.options.maxWidth,maxHeight:b.options.maxHeight,objectId:b.options.objectId,objectType:b.options.objectType})}).addErrback(function(){b.initPromise.emitError()})};b.initCanvas=function(){try{if(this.canvas==null){this.canvas=document.createElement("canvas");this.canvasContext=this.canvas.getContext("2d")}return true}catch(g){return false}};this.getSettings=function(){return b.options};this.scaleClientImage=function(m,l){var j=new jive.conc.Promise();if(!this.initCanvas()){console.log("Warning: couldn't initialize canvas; will not scale");j.emitError("Warning: couldn't initialize canvas; will not scale");return}var i;if(l){i=l}else{var h=d.exec(m);if(h){i=h[1]}else{i=e}}var k=this;function g(){var p=k.options.maxWidth;var o=k.options.maxHeight;var n=$j("<img />").load(function(){if(n.width>p||n.height>o){var q=p/n.width;if(q>o/n.height){q=o/n.height}function r(v,x){var u=Math.round(v*n.width);var s=Math.round(v*n.height);k.canvas.width=u;k.canvas.height=s;k.canvasContext.drawImage(n,0,0,n.width,n.height,0,0,u,s);try{var w=k.canvas.toDataURL(i);if(w.length>k.options.maxDataUrlLength&&i!=f){w=k.canvas.toDataURL(f)}if(w.length>k.options.maxDataUrlLength){i=f;jive.conc.nextTick(function(){r(v*0.8,x)})}else{x.emitSuccess(w)}}catch(t){if(t.code&&t.code==t.SECURITY_ERR){k.canvas=null;k.initCanvas()}else{throw t}}}r(q,j)}else{if(!d.test(m)){r(1,j)}else{j.emitSuccess(m)}}}).attr("src",m).get(0)}if(this.isInitialized){g()}else{b.initPromise.addCallback(g)}return j};this.create=function(h,g){var i=this;var j=new jive.conc.Promise();i.commonAjaxRequest(j,"POST",{url:i.getUrl(null,{name:h}),contentType:"text/plain",processData:false,data:g});return j};this.createFromImageSrc=function(h,i,g){var j=this;var k=new jive.conc.Promise();j.commonAjaxRequest(k,"POST",{url:j.getUrl(null,{name:h},g),contentType:"application/x-www-form-urlencoded",processData:false,data:"url="+encodeURIComponent(i)});return k};function a(h,g,k){try{var j=new XMLHttpRequest();j.open("POST",g,true);j.setRequestHeader("Content-Type","application/octet-stream; charset=UTF-8");j.setRequestHeader("X-Requested-With","XMLHttpRequest");j.setRequestHeader("Accept","application/json, text/javascript, */*; q=0.01");j.setRequestHeader("X-J-Token",_jive_auth_token);j.onreadystatechange=function(){if(j.readyState==4){if(j.status>=200&&j.status<300){k.emitSuccess(JSON.parse(j.responseText))}else{k.emitError(j.responseText)}}};j.send(h);return k}catch(i){k.emitError(i);return k}}this.postFile=function(g){var h=this;var i=new jive.conc.Promise();a(g,h.getUrl(null,{name:g.name,mimeType:g.type}),i);return i};this.update=function(j,g){var h=this;var i=new jive.conc.Promise();h.commonAjaxRequest(i,"PUT",{url:h.getUrl(j),contentType:"text/plain",processData:false,data:g});return i};b.getUrl=function(k,j,i){var g=$j.extend({},this.defaultParams,j||{});var h="?"+$j.param(g);if(k){return(i?i:this.RESOURCE_ENDPOINT)+"/"+k+h}else{return(i?i:this.POST_RESOURCE_ENDPOINT)+h}};b.getUploadUrl=function(){return this.getUrl("upload")}});define("jive.rte.ImageService",function(){return jive.rte.ImageService});