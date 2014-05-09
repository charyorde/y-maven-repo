var __slice=Array.prototype.slice,__bind=function(a,b){return function(){return a.apply(b,arguments)}},__hasProp=Object.prototype.hasOwnProperty,__extends=function(d,b){for(var a in b){if(__hasProp.call(b,a)){d[a]=b[a]}}function c(){this.constructor=d}c.prototype=b.prototype;d.prototype=new c;d.__super__=b.prototype;return d};(function(a){var b;b=a.Wistia;if(!((a.Wistia!=null)&&(a.Wistia.wistia!=null))){a.Wistia={wistia:"1.0",extend:function(){var g,e,f,d,c;g=arguments[0],f=2<=arguments.length?__slice.call(arguments,1):[];if(!f.length){f=[g];g=this}for(d=0,c=f.length;d<c;d++){e=f[d];this.obj.eachDeep(e,__bind(function(i,j){var h;h=this.obj.get(g,j);if(this.obj.isArray(i)){if(this.obj.isEmpty(h)){return this.obj.set(g,j,[])}}else{if(this.obj.isObject(i)){if(this.obj.isEmpty(h)){return this.obj.set(g,j,{})}}else{return this.obj.set(g,j,i)}}},this))}return g},mixin:function(c,e){var d,f;for(d in e){f=e[d];if(e.hasOwnProperty(d)){c[d]=f}}},obj:{get:function(f,e,c){var d;if(typeof e==="string"){e=e.split(".")}else{e=e.slice(0,e.length)}while((f!=null)&&e.length){d=e.shift();if((f[d]===void 0||!this.isObject(f[d]))&&c){f[d]={}}f=f[d]}return f},set:function(e,d,c){var f;if(typeof d==="string"){d=d.split(".")}else{d=d.slice(0,d.length)}f=d.pop();e=this.get(e,d,true);if((e!=null)&&(this.isObject(e)||this.isArray(e))&&(f!=null)){if(c!=null){return e[f]=c}else{return delete e[f]}}else{}},unset:function(d,c){return this.set(d,c)},exists:function(d,c){return this.get(d,c)!==void 0},cast:function(c){if(c==null){return c}c=""+c;if(/^\d+?$/.test(c)){return parseInt(c,10)}else{if(/^\d*\.\d+/.test(c)){return parseFloat(c)}else{if(/^true$/i.test(c)){return true}else{if(/^false$/i.test(c)){return false}else{return c}}}}},castDeep:function(c){this.eachLeaf(c,__bind(function(d,e){if(typeof d==="string"){return this.set(c,e,this.cast(d))}},this));return c},isArray:function(c){return(c!=null)&&/^\s*function Array()/.test(c.constructor)},isObject:function(c){return(c!=null)&&/^\s*function Object()/.test(c.constructor)},isRegExp:function(c){return(c!=null)&&/^\s*function RegExp()/.test(c.constructor)},isBasicType:function(c){return(c!=null)&&(this.isRegExp(c)||/^string|number|boolean|function$/i.test(typeof c))},isEmpty:function(e){var c,d,f;if(!(e!=null)){return true}else{if(this.isArray(e)&&!e.length){return true}else{if(this.isObject(e)){c=true;for(d in e){f=e[d];c=false}return c}else{return false}}}},isEmptyDeep:function(d){var c;if(this.isEmpty(d)){return true}c=true;this.eachLeaf(d,__bind(function(){return c=false},this));return c},isSubsetDeep:function(e,d){var c;if(e===d){return true}if(((e!=null)&&!(d!=null))||(!(e!=null)&&(d!=null))){return false}c=true;this.eachLeaf(e,__bind(function(g,h){var f;f=this.get(d,h);if(g!==f){return c=false}},this));return c},equalsDeep:function(d,c){return this.isSubsetDeep(d,c)&&this.isSubsetDeep(c,d)},eachDeep:function(g,d,f){var c,e,h;if(f==null){f=[]}if(this.isBasicType(g)){d(g,f)}else{if(this.isObject(g)||this.isArray(g)){d(g,f);for(c in g){h=g[c];e=f.slice(0,f.length);e.push(c);this.eachDeep(h,d,e)}}else{d(g,f)}}},eachLeaf:function(d,c){return this.eachDeep(d,__bind(function(f,e){if(!this.isArray(f)&&!this.isObject(f)){return c(f,e)}},this))}},data:function(c,d){if(!this.obj.isArray(c)){c=c.split(".")}if(d!=null){this.obj.set(this,["_data"].concat(c),d)}return this.obj.get(this,["_data"].concat(c))},timeout:function(c,d,e){var f;if(e==null){e=1}this.clearTimeouts(c);if(!this.obj.isArray(c)){c=c.split(".")}c=["timeouts"].concat(c);if(d){f=setTimeout(__bind(function(){this.removeData(c);return d()},this),e);return this.data(c,f)}else{return this.data(c)}},clearTimeouts:function(c){var d;if(!this.obj.isArray(c)){c=c.split(".")}c=["timeouts"].concat(c);d=this.data(c);this.obj.eachLeaf(d,function(e){return clearTimeout(e)});return this.removeData(c)},removeData:function(c){return this.obj.unset(this,["_data"].concat(c))},seqId:function(e,f){var d,c,g;if(e==null){e="wistia_"}if(f==null){f=""}g=["sequence","val"];d=this.data(g)||1;c=e+d+f;this.data(g,d+1);return c},noConflict:function(){a.Wistia=b;return this},util:{elemHeight:function(d){var c;c=Wistia.detect.browser.quirks?parseInt(d.offsetHeight,10):a.getComputedStyle?parseInt(getComputedStyle(d,null).height,10):d.currentStyle?d.offsetHeight:-1;return c},elemWidth:function(c){if(Wistia.detect.browser.quirks){return parseInt(c.offsetWidth,10)}else{if(a.getComputedStyle){return parseInt(getComputedStyle(c,null).width,10)}else{if(c.currentStyle){return c.offsetWidth}else{return -1}}}},winHeight:function(){var c;return c=a.innerHeight?a.innerHeight:document.documentElement?document.documentElement.offsetHeight:document.body.offsetHeight},winWidth:function(){var c;return c=a.innerWidth?a.innerWidth:document.documentElement?document.documentElement.offsetWidth:document.body.offsetWidth}},bindable:{bind:function(c,d){if(!this._bindings){this._bindings={}}if(!this._bindings[c]){this._bindings[c]=[]}this._bindings[c].push(d);return this},unbind:function(e,h){var d,c,g,f;d=this._bindings[e];if(d){if(h){g=[];for(c=0,f=d.length;0<=f?c<f:c>f;0<=f?c++:c--){if(h!==d[c]){g.push(d[c])}}this._bindings[e]=g}else{this._bindings[e]=[]}}if(this._bindings[e]&&!this._bindings[e].length){this._bindings[e]=null;delete this._bindings[e]}return this},hasBindings:function(){var d,c,f,e;c=false;e=this._bindings;for(d in e){f=e[d];if(this._bindings.hasOwnProperty(d)){c=true}}return c},trigger:function(){var d,h,g,e,f,c;e=arguments[0],d=2<=arguments.length?__slice.call(arguments,1):[];if((h=this._bindings[e])){for(f=0,c=h.length;f<c;f++){g=h[f];if(g){g.apply(this,d)}}}return this}}}}if((b!=null)&&!(b.wistia!=null)){return Wistia.extend(b)}})(window);(function(a){a.extend({_detect:{na:navigator.userAgent,rwebkit:/(webkit)[ \/]([\w.]+)/i,ropera:/(opera)(?:.*version)?[ \/]([\w.]+)/i,rmsie:/(msie) ([\w.]+)/i,rmozilla:/(mozilla)(?:.*? rv:([\w.]+))?/i,randroid:/(android) ([^;])/i,riphone:/(iphone)/i,ripad:/(ipad)/i,browser:function(){return this.browserMatch()[1].toLowerCase()},browserVersion:function(){return this.browserMatch()[2]},browserMatch:function(){return this.na.match(this.rwebkit)||this.na.match(this.ropera)||this.na.match(this.rmsie)||this.na.match(this.rmozilla)},android:function(){var b;b=this.na.match(this.randroid);if(b==null){return false}return{version:b[2]}},iphone:function(){return this.riphone.test(this.na)},ipad:function(){return this.ripad.test(this.na)},flash:function(){var b;b=this.flashFullVersion();return{version:parseFloat(b[0]+"."+b[1]),major:parseInt(b[0],10),minor:parseInt(b[1],10),rev:parseInt(b[2],10)}},flashFullVersion:function(){var b;try{try{b=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");try{b.AllowScriptAccess="always"}catch(c){return[6,0,0]}}catch(c){}return new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version").replace(/\D+/g,",").match(/^,?(.+),?$/)[1].split(",")}catch(c){try{if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){return(navigator.plugins["Shockwave Flash 2.0"]||navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g,",").match(/^,?(.+),?$/)[1].split(",")}}catch(c){}}return[0,0,0]},html5Video:function(){var d,c,b;d=document.createElement("video");b=false;try{if(!!d.canPlayType){b={};c='video/mp4; codecs="avc1.42E01E';b.h264=!!d.canPlayType(c+'"')||!!d.canPlayType(c+', mp4a.40.2"')}}catch(f){b={h264:false}}return b}}});a.extend({detect:{browser:{version:a._detect.browserVersion(),quirks:a._detect.browser()==="msie"&&document.compatMode==="BackCompat",old:a._detect.browser()==="msie"&&(document.compatMode==="BackCompat"||a._detect.browserVersion()<7)},android:a._detect.android(),iphone:a._detect.iphone(),ipad:a._detect.ipad(),flash:a._detect.flash(),video:a._detect.html5Video()}});a.detect.browser[a._detect.browser()]=true})(Wistia);(function(a){var c,e,d,b;e=function(f){return f.mp4hq||f.flv||f.iphone};d=function(f){return f.mp4hq||f.iphone};c=function(f){return f.iphone};b=function(f){if(f.mp4hq&&f.mp4hq.width<=1280&&f.mp4hq.height<=720){return f.mp4hq}else{return f.iphone}};a.extend({judy:{judge:function(k,g){var h,j,i,f;if(!g){g={}}i=g.plea;j=g.force;f={media:k,plea:j||i,uuid:g.uuid||a.seqId("wistia_"),asset:null,embedType:null};h=k.assets;if(j==="html5"){f.embedType="html5";f.asset=d(h)}else{if(j==="flash"){f.embedType="flash";f.asset=e(h)}else{if(j==="external"){f.embedType="external";f.asset=c(h)}else{if(a.detect.iphone){f.embedType="html5";f.asset=c(h)}else{if(a.detect.ipad){f.embedType="html5";f.asset=b(h)}else{if(a.detect.android){f.embedType="external";f.asset=c(h)}else{if(i==="html5"&&a.detect.video.h264){f.embedType="html5";f.asset=d(h)}else{if(i==="flash"&&a.detect.flash.version>=7){f.embedType="flash";f.asset=e(h)}else{if(i==="external"){f.embedType="external";f.asset=c(h)}else{if(a.detect.flash.version>=7){f.embedType="flash";f.asset=e(h)}else{if(a.detect.video.h264){f.embedType="html5";f.asset=d(h)}else{if((a.detect.browser.msie&&(a.detect.browser.version<9||a.detect.browser.quirks))||a.detect.browser.mozilla){f.embedType="flash";f.asset=e(h)}else{f.embedType="external";f.asset=e(h)}}}}}}}}}}}}return f}}})})(Wistia);(function(a){a.extend({embed:function(f,e){var d,c,b;if(!e){e={}}b=new a._embed.Video({},e);a.data(["video",b.uuid],b);d=a._embed.getContainer(f,e);if(a.detect.browser.old){d.style.width=""+(a.util.elemWidth(d))+"px";d.style.height=""+(a.util.elemHeight(d))+"px"}if(a.gridify&&!b.params.noGrid){b.grid=a.gridify(b,d)}else{if(e.wmode!=="transparent"){d.style.backgroundColor="#000000"}}c=function(k){var i,j,l,g,h;if(k.error){if(typeof console!=="undefined"&&console!==null){console.log(k.error)}return}j=a.judy.judge(k,b.params);h=a._embed.classFor(j.embedType);g=new h(j,b.options);for(i in g){l=g[i];if(i!=="uuid"){b[i]=l}}b.embed()};setTimeout(function(){var g;if(typeof f==="string"){g=f;return a.remote.media(g,function(h){return c(h)})}else{return c(f)}},100);return b},_embed:{getContainer:function(c,b){if(typeof b.container==="string"){return document.getElementById(b.container)}else{if(typeof c==="string"){return document.getElementById("wistia_"+c)}else{if(c&&c.media){return document.getElementById("wistia_"+c.media.hashedId)}else{if(c&&c.hashedId){return document.getElementById("wistia_"+c.hashedId)}else{return null}}}}},classFor:function(b){switch(b){case"html5":return a._embed.Html5Video;case"flash":return a._embed.FlashVideo;case"external":return a._embed.ExternalVideo;default:return a._embed.Video}}}})})(Wistia);(function(a){var d,g,f,b,c,e;a.extend({util:{addInlineCss:function(k,h){var j,i;j=document.createElement("style");j.id=a.seqId("wistia_","_style");j.setAttribute("type","text/css");i=document.getElementsByTagName("style");k.appendChild(j,k.nextSibling);if(j.styleSheet){j.styleSheet.cssText=h}else{j.appendChild(document.createTextNode(h))}},objToHtml:function(n){var o,m,s,q,r,t,j,i,l,k,p,h;if(/string|number|boolean/.test(typeof n)){return n.toString()}if(n instanceof Array){t="";for(l=0,p=n.length;l<p;l++){q=n[l];t+=a.util.objToHtml(q)}return t}if(typeof n!=="object"){return n.toString()}m=[];for(r in n){i=n[r];if(r==="tagName"){j=i}else{if(r==="childNodes"){s=i}else{m.push({key:r,val:i})}}}j||(j="div");t="<"+j;for(k=0,h=m.length;k<h;k++){o=m[k];t+=" "+o.key+'="'+o.val+'"'}if(/^(br|hr|img|link|meta|input)$/i.test(j)){t+=" />"}else{t+=">";if(s){if(typeof s==="string"){t+=s}else{if(typeof s==="object"){t+=a.util.objToHtml(s)}}}t+="</"+j+">"}return t}}});b=function(j){var i,h,k;h=[];for(i in j){k=j[i];h.push(""+i+"="+(encodeURIComponent(k)))}return h.join("&")};c=function(i,h){return"display:inline-block;*display:inline;height:"+h+";margin:0;padding:0;position:relative;vertical-align:top;width:"+i+";zoom:1;"};g=function(o,q){var l,j,k,p,h,n,m,i;l=o.asset;h=o.media;q=a.extend({flashPlayerUrl:null,pageUrl:null,chromeless:false,doNotTrack:false,endVideoCallback:"",controlsVisibleOnLoad:false,autoLoad:false,autoPlay:false,endVideoBehavior:"default",playButton:true,wmode:"opaque",playerColor:"",smallPlayButton:true,volumeControl:false,playbar:true,fullscreenButton:true,stillUrl:h.assets.still?h.assets.still.url:""},q);q.unbufferedSeek=l.type==="flv";q.shouldTrack=!q.doNotTrack;k={videoUrl:l.url,hdUrl:h.assets.hdflv?h.assets.hdflv.url:"",stillUrl:q.stillUrl,unbufferedSeek:l.type==="flv",controlsVisibleOnLoad:q.controlsVisibleOnLoad,autoLoad:q.autoLoad,autoPlay:q.autoPlay&&!q.suppressAutoplay,endVideoBehavior:q.endVideoBehavior,playButtonVisible:q.playButton,mediaDuration:h.duration,customColor:q.playerColor,wemail:q.trackEmail,referrer:q.pageUrl,quality:q.videoQuality,chromeless:q.chromeless?true:null,endVideoCallback:q.endVideoCallback?q.endVideoCallback:null,showVolume:q.volumeControl?true:null,showPlaybar:q.playbar===false?false:null,showPlayButton:q.smallPlayButton===false?false:null,fullscreenDisabled:q.fullscreenButton===false?true:null,trackingTransmitInterval:q.trackingTransmitInterval?q.trackingTransmitInterval:null};if(q.shouldTrack){k.embedServiceURL=h.distilleryUrl;k.accountKey=h.accountKey;k.mediaID=h.mediaKey}for(p in k){i=k[p];if(i==null){delete k[p]}}n={tagName:"object",id:o.uuid,classid:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",style:c("100%","100%")};if(q.wmode!=="transparent"){n.bgcolor="#000000"}m=[{tagName:"param",name:"movie",value:q.flashPlayerUrl||h.flashPlayerUrl},{tagName:"param",name:"allowfullscreen",value:"true"},{tagName:"param",name:"allowscriptaccess",value:"always"},{tagName:"param",name:"wmode",value:q.wmode},{tagName:"param",name:"flashvars",value:b(k)}];j={tagName:"embed",src:q.flashPlayerUrl||h.flashPlayerUrl,name:o.uuid,type:"application/x-shockwave-flash",allowfullscreen:"true",allowscriptaccess:"always",wmode:q.wmode,flashvars:b(k),style:c("100%","100%")};if(q.wmode!=="transparent"){j.bgcolor="#000000"}n.childNodes=m.concat(j);if(a.detect.browser.msie&&(a.detect.browser.version<9||a.detect.browser.quirks)){if(a.detect.flash.version<7){n.childNodes=[{style:"background:#666;color:#fff;height:100%;width:100%;","class":"noflash",childNodes:['Whoops! It looks like Flash isn\'t installed. Please \n<a href="http://get.adobe.com/flashplayer/" style="color:white;text-decoration:underline;" target="_blank">\ndownload and install Adobe\'s Flash Player plugin\n</a>\nto watch this video.']}]}}return a.util.objToHtml(n)};f=function(l,h){var j,m,i,k;j=l.asset;m=l.media;h=a.extend({autoLoad:true,autoPlay:false,doNotTrack:false,stillUrl:m.assets.still?m.assets.still.url:""},h);h.shouldTrack=!h.doNotTrack;k=document.createElement("video");k.style.width="100%";k.style.height="100%";k.style.position="relative";k.style.display="block";k.controls="controls";k.id=l.uuid;k.poster=h.stillUrl;k.preload="none";if(h.autoPlay&&!h.suppressAutoplay){k.autoplay="autoplay"}i=document.createElement("source");i.src=j.url.replace(/\.bin$/,"")+"/file.mp4";i.type="video/mp4";k.appendChild(i);return k};d=function(k,i){var h,j,l,m;j=k.asset;m=k.media;i=a.extend({playButton:true,stillUrl:m.assets.still?m.assets.still.url.replace(/\.bin$/,".jpg?image_play_button=1"):""},i);h={tagName:"a",href:j.url,id:k.uuid,target:"_parent",style:c("100%","100%")};l={tagName:"img",src:e(k,i),border:0,alt:"Play video",style:"height:100%;vertical-align:top;width:100%;"};h.childNodes=[l];return a.util.objToHtml(h)};e=function(i,h){var j;j=i.media;if(h.videoWidth&&h.videoHeight){if(h.playButton){return j.assets.still.url.replace(/\.bin$/,".jpg?image_play_button=1&image_crop_resized="+h.videoWidth+"x"+h.videoHeight)}else{return j.assets.still.url.replace(/\.bin$/,".jpg?image_crop_resized="+h.videoWidth+"x"+h.videoHeight)}}else{if(h.playButton){return j.assets.still.url.replace(/\.bin$/,".jpg?image_play_button=1")}else{return j.assets.still.url.replace(/\.bin$/,".jpg")}}};return a.extend({generate:{video:function(j,i,h){if(j==="flash"){return g(i,h)}else{if(j==="html5"){return f(i,h)}else{if(j==="external"){return d(i,h)}else{if(j==="stillUrl"){return e(i,h)}}}}}}})})(Wistia);(function(a){a._embed.Video=(function(){function b(e,d){var c;this.data=e;this.options=d;this.params=a.extend(this.params||{},this.options);this.params.container=a._embed.getContainer(this.data,this.options);if(this.options.platformPreference){this.params.plea=this.options.platformPreference}this.params.shouldTrack=!this.options.doNotTrack;if(this.options.playButtonVisible!=null){this.params.playButton=this.options.playButtonVisible}this.params.rawEmbed=top===self;if(this.params.videoWidth){this.params.videoWidth=parseInt(this.params.videoWidth,10)}if(this.params.videoHeight){this.params.videoHeight=parseInt(this.params.videoHeight,10)}this.params.aspectRatio=this.params.videoWidth/this.params.videoHeight;if(!this.params.playerColor){this.params.playerColor="636155"}if(!this.params.trackEmail){if((c=location.href.match(/wemail\=([^\&]+)/))!=null){this.params.trackEmail=c[1]}}if(!this.params.stillUrl){this.params.stillUrl=a.obj.exists(this.data,"media.assets.still.url")?this.data.media.assets.still.url:""}if(!this.params.uuid){this.params.uuid=a.seqId()}this.uuid=this.params.uuid}b.prototype.embed=function(){this.embedAs(this.embedType);return this.ready(__bind(function(){return this.monitorSize()},this))};b.prototype.monitorSize=function(){var d,g,f,e,c;f=__bind(function(){if(this.params.rawEmbed&&a.detect.browser.old){return this.width()}else{if(this.params.rawEmbed){return a.util.elemWidth(this.container)}else{return a.util.winWidth()}}},this);g=__bind(function(){if(this.params.rawEmbed&&a.detect.browser.old){return this.height()}else{if(this.params.rawEmbed){return a.util.elemHeight(this.container)}else{return a.util.winHeight()}}},this);c=f();e=g();d=__bind(function(){var i,h;h=f();i=g();if(c!==h){this.width(h);c=h}if(e!==i){this.height(i);e=i}a.timeout(""+this.uuid+".auto_resize",d,1000)},this);d()};b.prototype.embedAs=function(c){this.container=this.params.container;this.embedCode=a.generate.video(c,this.data,this.params);this.placeEmbed(this.embedCode);return this};b.prototype.placeEmbed=function(c){var d;d=(this.grid&&this.grid.center)||this.container;if(typeof c==="string"){d.innerHTML=c}else{d.innerHTML="";d.appendChild(c)}return this.ieSizeHack()};b.prototype.rebuildAs=function(i){var e,f,g,h,c,d;g=this.uuid;f=a.judy.judge(this.data.media,{force:i});d=a._embed.classFor(f.embedType);c=new d(f,this.options);for(e in c){h=c[e];this[e]=h}this.uuid=g;a.clearTimeouts(this.uuid);this._isReady=false;this.embed(this.params.container);return this};b.prototype.remove=function(){a.clearTimeouts(this.uuid);a._data.video[this.uuid]=null;delete a._data.video[this.uuid];this.container.innerHTML=""};b.prototype.bind=function(c,d){if(!this._bindings){this._bindings={}}if(!this._bindings[c]){this._bindings[c]=[]}this._bindings[c].push(d);return this};b.prototype.unbind=function(e,h){var d,c,g,f;d=this._bindings[e];if(d){if(h){g=[];for(c=0,f=d.length;0<=f?c<f:c>f;0<=f?c++:c--){if(h!==d[c]){g.push(d[c])}}this._bindings[e]=g}else{this._bindings[e]=[]}}if(this._bindings[e]&&!this._bindings[e].length){this._bindings[e]=null;delete this._bindings[e]}return this};b.prototype.hasBindings=function(){var d,c,f,e;c=false;e=this._bindings;for(d in e){f=e[d];if(this._bindings.hasOwnProperty(d)){c=true}}return c};b.prototype.trigger=function(){var d,h,g,e,f,c;e=arguments[0],d=2<=arguments.length?__slice.call(arguments,1):[];if((h=this._bindings[e])){for(f=0,c=h.length;f<c;f++){g=h[f];if(g){g.apply(this,d)}}}return this};b.prototype._eventLoopDuration=300;b.prototype.play=function(){return this.ready("play")};b.prototype.pause=function(){return this.ready("pause")};b.prototype.time=function(c){if(c!=null){this.ready("time",c);return this}else{}};b.prototype.state=function(){return"unknown"};b.prototype.duration=function(){return 0};b.prototype.getEventKey=function(){return null};b.prototype.volume=function(c){if(c!=null){return this.ready("volume",c)}else{return 0}};b.prototype.setPlayerColor=function(c){this.ready("setPlayerColor",c);return this};b.prototype.ready=function(){var d,h,e,g,c,f;h=arguments[0],d=2<=arguments.length?__slice.call(arguments,1):[];if(!this._readyQueue){this._readyQueue=[]}if(this._isReady){if(h){this._readyQueue.push({callback:h,args:d})}f=this._readyQueue;for(g=0,c=f.length;g<c;g++){e=f[g];if(typeof e.callback==="string"){this[e.callback].apply(this,e.args)}else{e.callback.apply(this,e.args)}}this._readyQueue=[]}else{if(h){this._readyQueue.push({callback:h,args:d})}}return this};b.prototype.width=function(d){var c;if(d!=null){d=parseInt(d,10);if(this.grid){this.container.style.width=this.grid.wrapper.style.width=""+d+"px";this.grid.center.style.width="100%";this.elem().style.width="100%";a.grid.fitHorizontal(this);a.grid.fitVertical(this)}else{this.container.style.width=""+d+"px";this.elem().style.width="100%"}return this}else{if(a.detect.browser.old){this.elem().style.position="absolute"}if(this.grid){c=a.util.elemWidth(this.grid.left)+a.util.elemWidth(this.grid.center)+a.util.elemWidth(this.grid.right)}else{c=a.util.elemWidth(this.container)}if(a.detect.browser.old){this.elem().style.position="static"}return c}};b.prototype.height=function(d){var c;if(d!=null){d=parseInt(d,10);if(this.grid){this.container.style.height=this.grid.wrapper.style.height=""+d+"px";this.grid.center.style.height="100%";this.elem().style.height="100%";a.grid.fitHorizontal(this);a.grid.fitVertical(this)}else{this.container.style.height=""+d+"px";this.elem().style.height="100%"}return this}else{if(a.detect.browser.old){this.elem().style.position="absolute"}if(this.grid){c=a.util.elemHeight(this.grid.center)+Math.max(a.util.elemHeight(this.grid.above),a.util.elemHeight(this.grid.top))+Math.max(a.util.elemHeight(this.grid.below),a.util.elemHeight(this.grid.bottom))}else{c=a.util.elemHeight(this.container)}if(a.detect.browser.old){this.elem().style.position="static"}return c}};b.prototype.videoWidth=function(d){var e,c;if(d!=null){d=parseInt(d,10);if(this.grid){this.grid.center.style.width="100%";this.grid.main.style.width=""+d+"px";this.grid.main.style.width=""+d+"px";e=a.util.elemWidth(this.grid.left)+a.util.elemWidth(this.grid.right);this.container.style.width=this.grid.wrapper.style.width=""+(d+e)+"px";a.grid.fitHorizontal(this);a.grid.fitVertical(this)}else{this.container.style.width=""+d+"px";this.elem().style.width="100%"}return this}else{if(a.detect.browser.old){this.elem().style.position="absolute"}if(this.grid){c=a.util.elemWidth(this.grid.center)}else{c=a.util.elemWidth(this.container)}if(a.detect.browser.old){this.elem().style.position="static"}return c}};b.prototype.videoHeight=function(f){var e,d,c,g;if(f!=null){f=parseInt(f,10);if(this.grid){this.grid.main.style.height=""+f+"px";this.grid.center.style.height="100%";this.grid.main.style.height=""+f+"px";g=Math.max(a.util.elemHeight(this.grid.above),a.util.elemHeight(this.grid.top));e=Math.max(a.util.elemHeight(this.grid.below),a.util.elemHeight(this.grid.bottom));d=g+e;this.container.style.height=this.grid.wrapper.style.height=""+(f+d)+"px";a.grid.fitHorizontal(this);a.grid.fitVertical(this)}else{this.container.style.height=""+f+"px";this.elem().style.height="100%"}return this}else{if(a.detect.browser.old){this.elem().style.position="absolute"}if(this.grid){c=a.util.elemHeight(this.grid.center)}else{c=a.util.elemHeight(this.container)}if(a.detect.browser.old){this.elem().style.position="static"}return c}};b.prototype.ieSizeHack=function(){if(a.detect.browser.msie&&this.elem&&this.elem()){if(this.elem().offsetLeft%2===0){this.elem().style.width=""+(this.videoWidth()+1)+"px"}else{this.elem().style.width="100%"}}};b.prototype.setEmail=function(c){return this.params.trackEmail=c};b.prototype.getVisitorKey=function(){if(this.tracker){return this.tracker.visitorKey()}else{return""}};b.prototype.getEventKey=function(){if(this.tracker){return this.tracker.eventKey()}else{return""}};return b})()})(Wistia);(function(a){a._embed.FlashVideo=(function(){__extends(b,a._embed.Video);function b(){b.__super__.constructor.apply(this,arguments)}b.prototype.embedType="flash";b.prototype.elem=function(){return document[this.data.uuid]};b.prototype.embed=function(){var c;b.__super__.embed.apply(this,arguments);this._lastTimePosition=0;a.timeout(""+this.uuid+".quick_repair",__bind(function(){if(this.isBroken()){a.clearTimeouts(this.uuid);this.repair()}},this),50);c=__bind(function(d){if(d>=50){return}if(this.elem()&&this.elem().getCurrentTime){if(!this.isBroken()){a.timeout(""+this.uuid+".ready_delay",__bind(function(){this._isReady=true;this.ready();this.listenForEvents();if(!this.tracker){return this.tracker=a.tracker(this)}},this),200)}}else{a.timeout(""+this.uuid+".ready_check",(__bind(function(){return c.call(this,d+1)},this)),200)}},this);c();return this};b.prototype.remove=function(){a.clearTimeouts(this.uuid);return b.__super__.remove.call(this)};b.prototype.listenForEvents=function(){this._fireIfChanged=__bind(function(){var d,c;if(!this.hasBindings()){return}a.timeout(""+this.uuid+".fire_if_changed",(__bind(function(){return this._fireIfChanged.call(this)},this)),this._eventLoopDuration);d=this.state();c=this.time();if(d!==this._lastState){if(d==="playing"){this.trigger("play")}else{if(d==="paused"){this.trigger("pause")}else{if(d==="ended"){this.trigger("end")}}}}if(c!==this._lastTimePosition){this.trigger("timechange",c);this._lastTimePosition=c}this._lastState=d},this);this._fireIfChanged.call(this)};b.prototype.bind=function(){var c;c=1<=arguments.length?__slice.call(arguments,0):[];b.__super__.bind.apply(this,c);if(a.timeout(""+this.uuid+".fire_if_changed")==null){if(!this._isReady){return this.ready("listenForEvents")}this.listenForEvents()}return this};b.prototype.play=function(){if(!this._isReady){return this.ready("play")}this.elem().videoPlay();return this};b.prototype.pause=function(){if(!this._isReady){return this.ready("pause")}this.elem().videoPause();return this};b.prototype.time=function(d){var g,c,f;if((d!=null)&&!this._isReady){return this.ready("time",d)}if(d!=null){f=this.state();if(f==="unknown"){this.elem().videoPlay();c=this;g=function(){c.unbind("timechange",g);return c.elem().videoSeek(d)};this.bind("timechange",g)}else{this.elem().videoSeek(d);if(f==="paused"||f==="ended"){this.pause()}}return this}else{try{return this.elem().getCurrentTime()}catch(h){return -1}}};b.prototype.state=function(){try{switch(this.elem().getCurrentState()){case 0:return"ended";case 1:return"playing";case 2:return"paused";default:return"unknown"}}catch(c){return"unknown"}};b.prototype.volume=function(d){var c;if(d&&!this._isReady){return this.ready("volume",d)}if(d!=null){this.elem().setVolume(Math.min(Math.round(d*100),100));return this}else{c=this.elem().getVolume();if(c>0){c/=100}return c}};b.prototype.duration=function(){return this.data.media.duration};b.prototype.outsideContainer=function(){var c;c=this.elem();while(c.nodeType===1){c=c.parentNode;if(c===this.container){return false}}return true};b.prototype.ctfBlocked=function(){return document.getElementById("CTFstack")&&this.outsideContainer()};b.prototype.chromeFlashBlocked=function(){var d,c;if(a.detect.browser.webkit&&this.elem()){d=this.elem().parentNode.previousSibling;if(d){c=d.childNodes[0]}return c&&c.getAttribute("style")&&c.getAttribute("style").indexOf("gofhjkjmkpinhpoiabjplobcaignabnl")!==-1}};b.prototype.ffFlashBlocked=function(){var c;c=this.container.childNodes[0];return c&&c.getAttribute("bgactive")&&c.getAttribute("bgactive").indexOf("flashblock")!==-1};b.prototype.isBlocked=function(){return a.detect.flash.version>=7&&(this.ctfBlocked()||this.chromeFlashBlocked())};b.prototype.isBroken=function(){return a.detect.flash.version<7||this.isBlocked()};b.prototype.repair=function(){if(this.isBlocked()&&a.detect.video.h264){a.clearTimeouts(this.uuid);this.rebuildAs("html5")}};b.prototype.getEventKey=function(){try{return this.elem().getEventKey()}catch(c){return""}};b.prototype.setPlayerColor=function(c){this.params.playerColor=c;if(this._isReady){this.elem().changeColor(c)}else{this.ready("setPlayerColor",c)}};b.prototype.setEmail=function(c){b.__super__.setEmail.call(this,c);return this.elem().setEmail(c)};return b})()})(Wistia);(function(a){var b;b=function(d,c,f){var e;e=__bind(function(){d.removeEventListener(c,e);return f()},this);d.addEventListener(c,e)};a._embed.Html5Video=(function(){__extends(c,a._embed.Video);function c(){c.__super__.constructor.apply(this,arguments)}c.prototype.embedType="html5";c.prototype.elem=function(){return document.getElementById(this.data.uuid)};c.prototype.embed=function(){c.__super__.embed.apply(this,arguments);if(this.hasPreRoll){this.embedExternal()}else{this.embedHtml5()}if(this.hasPostRoll){this.preloadStill();this.bind("end",__bind(function(){return this.embedExternal()},this))}return this};c.prototype.preloadStill=function(){var d;d=new Image();if(this.options.playButton){return d.src=a.generate.video("stillUrl",this.data,this.params)}else{return d.src=a.generate.video("stillUrl",this.data,this.params)}};c.prototype.embedExternal=function(){var d;if(this.tracker){this.tracker.stopMonitoring()}d=this.params.playButton;this.params.playButton=this.options.playButton;this.embedAs("external");this.params.playButton=d;a.timeout(""+this.uuid+".vid_ready",__bind(function(){this._isReady=true;return this.ready()},this));return this.elem().addEventListener("click",__bind(function(e){e.preventDefault();this.embedHtml5();return this.play()},this))};c.prototype.embedHtml5=function(){this._isReady=false;this.embedAs("external");this.embedAs("html5");if(!this.tracker){this.tracker=a.tracker(this)}if(this.params.shouldTrack){this.ready(__bind(function(){return this.tracker.monitor()},this))}this.elem().addEventListener("playing",(__bind(function(){return this.trigger("play")},this)));this.elem().addEventListener("pause",(__bind(function(){return this.trigger("pause")},this)));this.elem().addEventListener("ended",(__bind(function(){return this.trigger("end")},this)));a.timeout(""+this.uuid+".vid_ready",__bind(function(){this._isReady=true;return this.ready()},this));return this.listenForEvents()};c.prototype.remove=function(){a.clearTimeouts(this.uuid);return c.__super__.remove.call(this)};c.prototype.listenForEvents=function(){if(!this._bindings){this._bindings={}}this._fireIfChanged=__bind(function(){var d;if(!this.hasBindings()){return}a.timeout(""+this.uuid+".fire_if_changed",(__bind(function(){return this._fireIfChanged.call(this)},this)),this._eventLoopDuration);if((d=this.time())!==this._lastTimePosition){this.trigger("timechange",d);this._lastTimePosition=d}},this);this._fireIfChanged()};c.prototype.bind=function(){var d;d=1<=arguments.length?__slice.call(arguments,0):[];c.__super__.bind.apply(this,d);if(!a.timeout(""+this.uuid+".fire_if_changed")){this.listenForEvents()}return this};c.prototype.play=function(d){if(/video/i.test(this.elem().tagName)){if(!this._isReady){return this.ready("play")}this.elem().play()}else{this.embedHtml5();this.play()}return this};c.prototype.pause=function(){if(!this._isReady){return this.ready("pause")}this.elem().pause();return this};c.prototype.time=function(d){if(d&&!this._isReady){return this.ready("time",d)}if(d!=null){if(this.state()==="unknown"){b("playing",__bind(function(){b(this.elem(),"seeked",__bind(function(){return this.pause()},this));this.elem().currentTime=d},this));this.play()}else{this.elem().currentTime=d}return this}return this.elem().currentTime};c.prototype.state=function(){try{if(this.elem().ended){return"ended"}else{if(this.elem().played.length===0){return"paused"}else{if(this.elem().paused){return"paused"}else{return"playing"}}}}catch(d){return"unknown"}};c.prototype.volume=function(d){if(d&&!this._isReady){return this.ready("volume",d)}if(d!=null){this.elem().volume=d;return this}else{return this.elem().volume}};c.prototype.duration=function(){return this.data.media.duration};c.prototype.setPlayerColor=function(){};return c})()})(Wistia);(function(a){a._embed.ExternalVideo=(function(){__extends(b,a._embed.Video);function b(){b.__super__.constructor.apply(this,arguments)}b.prototype.embedType="external";b.prototype.elem=function(){return document.getElementById(this.data.uuid)};b.prototype.embed=function(c){b.__super__.embed.call(this,c);this.params.stillUrl=this.elem().childNodes[0].src;this.elem().addEventListener("click",__bind(function(){this.trigger("play");a.timeout(""+this.uuid+".fake_video_end",__bind(function(){return this.trigger("end")},this),500);return false},this));this._isReady=true;this.ready();return this};b.prototype.duration=function(){return this.data.media.duration};return b})()})(Wistia);(function(a){a.extend({tracker:function(c,b){return new a.VideoTracker(c,b||{})}});return a.VideoTracker=(function(){var i,f,h,k,d,b,g,c,e;c=g=b=e=function(){};d=false;f="";h="";i=0;k=[];function j(m,l){this.video=m;this.options=l;this.params=a.extend({transmitInterval:10000},this.options);k=[];i=new Date().getTime();this._eventKey=this.newEventKey();this._visitorKey=this.visitorKeyFromCookie()||this.newVisitorKey();this.log("initialized");if(this.video.embedType==="html5"){this.transmit()}this}j.prototype._dataPrefix=function(){var l;l='{\n"account_key":"'+this.video.data.media.accountKey+'",\n"session_id":"'+this._visitorKey+'",\n"media_id":"'+this.video.data.media.mediaKey+'",\n"event_key":"'+this._eventKey+'",\n"media_duration":'+(parseFloat(this.video.data.media.duration))+',\n"referrer":"'+(this.video.params.pageUrl||window.location.href)+'",';if(this.video.params.trackEmail){l+='"email":"'+this.video.params.trackEmail+'",'}l+='"event_details":[';return l};j.prototype._dataSuffix=function(){return"]}"};j.prototype.visitorKeyFromCookie=function(){var l,m,n;l=document.cookie.split("; ");m=0;while(m<l.length){n=l[m].split("=");if(n[0]==="__distillery"){return n[1]}m++}};j.prototype.newVisitorKey=function(){var l,m;m=(new Date().getTime()).toString()+"-"+Math.random();l=new Date();l.setTime(l.getTime()+(365*24*60*60*1000));document.cookie="__distillery="+m+"; expires="+(l.toGMTString())+"; path=/";return m};j.prototype.newEventKey=function(){if(this.video.embedType==="flash"){return this.video.getEventKey()}else{return(new Date().getTime()).toString()+"e"+Math.random()}};j.prototype.monitor=function(){c=__bind(function(){this.log("play")},this);g=__bind(function(){if(Math.abs(this.video.duration()-this.video.time())>0.3){this.log("pause")}},this);b=__bind(function(){this.log("end");this.transmit()},this);e=__bind(function(l){if(Math.abs(this.video._lastTimePosition-l)>=5){this.log("seek")}},this);d=true;this.video.bind("play",c);this.video.bind("pause",g);this.video.bind("end",b);this.video.bind("timechange",e);a.timeout(""+this.uuid+".start_tracking_timeout",__bind(function(){var l;l=__bind(function(){if(this.video.state()==="playing"){this.log("update")}this.transmit();return a.timeout(""+this.uuid+".tracking_loop",l,this.params.transmitInterval)},this);a.timeout(""+this.uuid+".tracking_loop",l,this.params.transmitInterval);this.transmit()},this),Math.random()*this.params.transmitInterval+1000);if(this.video.state()==="playing"){c()}};j.prototype.stopMonitoring=function(){d=false;this.video.unbind("play",c);this.video.unbind("pause",g);this.video.unbind("end",b);this.video.unbind("timechange",e)};j.prototype.postToDistillery=function(l){a.remote.post(""+this.video.data.media.distilleryUrl+"?data="+(encodeURIComponent(l)))};j.prototype.transmit=function(){var l;if(this.video.params.doNotTrack){return}if(k.length!==0){l=this._dataPrefix()+k.join(",")+this._dataSuffix();this.postToDistillery(a.base64.encode(l));k=[]}};j.prototype.log=function(l){var n,m;if(this.video.params.doNotTrack){return}m=this.video.time();if(m==null){if(this.video.state()==="unknown"){m=0}else{m=this.video.duration()}}m=m.toFixed(1);n=(new Date().getTime())-i;k.push('{\n"key":"'+l+'",\n"value":'+m+',\n"timeDelta":'+n+"\n}")};j.prototype.visitorKey=function(){return this._visitorKey};j.prototype.eventKey=function(){return this._eventKey};return j})()})(Wistia);Wistia.extend({base64:{_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(c){var k,h,f,j,g,e,d,b,a;b=0;a="";while(b<c.length){k=c.charCodeAt(b++);h=c.charCodeAt(b++);f=c.charCodeAt(b++);j=k>>2;g=((k&3)<<4)|(h>>4);e=((h&15)<<2)|(f>>6);d=f&63;if(isNaN(h)){e=d=64}else{if(isNaN(f)){d=64}}a=a+this._keyStr.charAt(j)+this._keyStr.charAt(g)+this._keyStr.charAt(e)+this._keyStr.charAt(d)}return a}}});(function(a){return a.extend({constant:{embedHost:"fast.wistia.com"},remote:{post:function(c){var b;b=window.XDomainRequest?new window.XDomainRequest():new window.XMLHttpRequest();b.open("POST",c,true);b.send()},media:function(b,d){var c;if(a.data(["remote-media",b])){a.timeout("remote-media."+b+"."+(a.seqId()),function(){return d(a.data(["remote-media",b]))})}else{c=""+window.location.protocol+"//"+a.constant.embedHost+"/embed/medias/"+b+".json";this.fetch(c,{},function(e){if(e.error){a.data(["remote-media",b],e);d(e)}else{a.data(["remote-media",b],e.media);d(e.media)}},{onerror:function(){if(window.console){console.log("Timed out fetching "+c)}},timeout:10000})}},playlist:function(c,d){var b;if(a.data(["remote-playlist",c])){a.timeout("remote-playlist."+c+"."+(a.seqId()),function(){return d(a.data(["remote-playlist",c]))})}else{b=""+window.location.protocol+"//"+a.constant.embedHost+"/embed/playlists/"+c+".json";this.fetch(b,{},function(e){a.data(["remote-playlist",c],e);d(e)},{onerror:function(){if(window.console){console.log("Timed out fetching "+b)}},timeout:10000})}},fetch:function(c,e,f,b){var d;if(!b.timeout){b.timeout=5000}if(!b.onerror){b.onerror=(function(){})}d=setTimeout(b.onerror,b.timeout);a.jsonp.get(c,e,function(g){clearTimeout(d);if(f){f(g)}})}}})})(Wistia);if(!Wistia.jsonp){Wistia.jsonp=(function(){var a=0,c,f,b,d=this;function e(j){var i=document.createElement("script"),h=false;i.src=j;i.async=true;i.onload=i.onreadystatechange=function(){if(!h&&(!this.readyState||this.readyState==="loaded"||this.readyState==="complete")){h=true;i.onload=i.onreadystatechange=null;if(i&&i.parentNode){i.parentNode.removeChild(i)}}};if(!c){c=document.getElementsByTagName("head")[0]}c.appendChild(i)}function g(h,j,k){f="?";j=j||{};for(b in j){if(j.hasOwnProperty(b)){f+=encodeURIComponent(b)+"="+encodeURIComponent(j[b])+"&"}}var i="json"+(++a);d[i]=function(l){k(l);try{delete d[i]}catch(m){}d[i]=null};e(h+f+"callback="+i);return i}return{get:g}}())}(function(a){if(!a.Plugin){a.Plugin={}}a.Plugin.Base=(function(){function b(){this.pluginName="plugin";this}b.prototype.instances=function(){return a.data(["plugins",this.pluginName,this.video.uuid])};b.prototype.register=function(c){this.video.plugins[this.uuid]=c;return a.data(["plugins",this.pluginName,this.video.uuid,this.uuid],c)};b.prototype.remove=function(){this.video.plugins[this.uuid]=null;a.removeData(["plugins",this.pluginName,this.video.uuid,this.uuid]);delete this.video.plugins[this.uuid];if(this.video.grid){a.grid.fitHorizontal(this.video);return a.grid.fitVertical(this.video)}};b.prototype.fit=function(){};b.prototype.init=function(c,d){if(c.plugins==null){c.plugins={}}this.video=c;this.options=d||{};this.params=a.extend({},d||{});return this.uuid=this.params.uuid||a.seqId("wistia_","_plugin")};return b})();return a.extend({plugin:{init:function(g,f,e){var c,b,d;d=g.charAt(0).toUpperCase()+g.substr(1);b=a.Plugin[d];c=new b();c.init(f,e);return c},instance:function(c,b,d){return a.data(["plugins",c,b.uuid,d])},remove:function(d,b,e){var c;if((c=this.instance(d,b,e))!=null){c.remove()}},isActive:function(c,b,d){return !!this.instance(c,b,d)}}})})(Wistia);