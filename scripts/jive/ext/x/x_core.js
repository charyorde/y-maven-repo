// x_core.js
// X v3.15.1, Cross-Browser DHTML Library from Cross-Browser.com
// Copyright (c) 2002,2003,2004 Michael Foster (mike@cross-browser.com)
// This library is distributed under the terms of the LGPL (gnu.org)

// Variables:
jive.ext.x.xMac = (navigator.appVersion.indexOf('Mac') != -1);
jive.ext.x.xWindows = !jive.ext.x.xMac;
jive.ext.x.xVersion='3.15.1';
jive.ext.x.xNN4=false;
jive.ext.x.xOp7=false;
jive.ext.x.xOp5or6=false;
jive.ext.x.xIE4Up=false;
jive.ext.x.xIE4=false;
jive.ext.x.xIE5=false;
jive.ext.x.xUA=navigator.userAgent.toLowerCase();
jive.ext.x.xIE = false;
jive.ext.x.xSafari = false;
if(window.opera){
  jive.ext.x.xOp7=(jive.ext.x.xUA.indexOf('opera 7')!=-1 || jive.ext.x.xUA.indexOf('opera/7')!=-1);
  if (!jive.ext.x.xOp7) jive.ext.x.xOp5or6=(jive.ext.x.xUA.indexOf('opera 5')!=-1 || jive.ext.x.xUA.indexOf('opera/5')!=-1 || jive.ext.x.xUA.indexOf('opera 6')!=-1 || jive.ext.x.xUA.indexOf('opera/6')!=-1);
}
else if (document.all) {
  jive.ext.x.xIE4Up=jive.ext.x.xUA.indexOf('msie')!=-1 && parseInt(navigator.appVersion)>=4;
  jive.ext.x.xIE4=jive.ext.x.xUA.indexOf('msie 4')!=-1;
  jive.ext.x.xIE5=jive.ext.x.xUA.indexOf('msie 5')!=-1;
  jive.ext.x.xIE6=jive.ext.x.xUA.indexOf('msie 6')!=-1;
  jive.ext.x.xIE7=jive.ext.x.xUA.indexOf('msie 7')!=-1;
  jive.ext.x.xIE4Up=jive.ext.x.xIE4 || jive.ext.x.xIE5 || jive.ext.x.xIE6;
  jive.ext.x.xIE = true;
}
if(jive.ext.x.xUA.indexOf('safari') != -1 || jive.ext.x.xUA.indexOf('Safari') != -1){
  jive.ext.x.xSafari = true;
}
// Object:
jive.ext.x.xGetElementById = function(e,doc) {
  if(!$obj(doc)) doc = e.ownerDocument;
  if(e == null) return e;
  if(typeof(e)!='string') return e;
  if(doc.getElementById) e=doc.getElementById(e);
  else if(doc.all) e=doc.all[e];
  else e=null;
  return e;
}
jive.ext.x.xParent = function(e,bNode){
  if (!(e=jive.ext.x.xGetElementById(e))) return null;
  var p=null;
  if (!bNode && $def(e.offsetParent)) p=e.offsetParent;
  else if ($def(e.parentNode)) p=e.parentNode;
  else if ($def(e.parentElement)) p=e.parentElement;
  return p;
}
var $def = function(theItem) {
  return (typeof(theItem)!='undefined');
}
// yObj
// returns true if all the arguments are objects
var $obj = function(item)
{
  return (typeof(item) == 'object');
}
// yArr
// returns true if all the arguments are arrays
var $arr = function(item)
{
	return item != null && $obj(item) && $def(item.splice);
}
$str = function(s) {
  return typeof(s)=='string';
}
var $num = function(n) {
  return typeof(n)=='number';
}
// Appearance:
jive.ext.x.xShow = function(e) {
  if(!(e=jive.ext.x.xGetElementById(e))) return;
  if(e.style && $def(e.style.visibility)) e.style.visibility='visible';
}
jive.ext.x.xHide = function(e) {
  if(!(e=jive.ext.x.xGetElementById(e))) return;
  if(e.style && $def(e.style.visibility)) e.style.visibility='hidden';
}
jive.ext.x.xDisplay = function(e,s)
{
  if(!(e=jive.ext.x.xGetElementById(e))) return null;
  if(e.style && $def(e.style.display)) {
    if ($str(s)) e.style.display = s;
    return e.style.display;
  }
  return null;
}
jive.ext.x.xDisplayNone = function(e) {
  if(!(e=jive.ext.x.xGetElementById(e))) return;
  if(e.style && $def(e.style.display)) e.style.display='none';
}
jive.ext.x.xDisplayBlock = function(e) {
  if(!(e=jive.ext.x.xGetElementById(e))) return;
  if(e.style && $def(e.style.display)) e.style.display='block';
}
jive.ext.x.xDisplayInline = function(e) {
  if(!(e=jive.ext.x.xGetElementById(e))) return;
  if(e.style && $def(e.style.display)) e.style.display='inline';
}
// xVisibility, Copyright 2003-2005 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL

jive.ext.x.xZIndex = function(e,uZ)
{
  if(!(e=jive.ext.x.xGetElementById(e))) return 0;
  if(e.style && $def(e.style.zIndex)) {
    if($num(uZ)) e.style.zIndex=uZ;
    uZ=parseInt(e.style.zIndex);
  }
  return uZ;
}
// Position:
jive.ext.x.xMoveTo = function(e,iX,iY) {
  jive.ext.x.xLeft(e,iX);
  jive.ext.x.xTop(e,iY);
}
jive.ext.x.xLeft = function(e,iX) {
  if(!(e=jive.ext.x.xGetElementById(e))) return 0;
  var css=$def(e.style);
  if (css && $str(e.style.left)) {
    if($num(iX)) e.style.left=iX+'px';
    else {
      iX=parseInt(e.style.left);
      if(isNaN(iX)) iX=0;
    }
  }
  else if(css && $def(e.style.pixelLeft)) {
    if($num(iX)) e.style.pixelLeft=iX;
    else iX=e.style.pixelLeft;
  }
  return iX;
}
jive.ext.x.xTop = function(e,iY) {
  if(!(e=jive.ext.x.xGetElementById(e))) return 0;
  var css=$def(e.style);
  if(css && $str(e.style.top)) {
    if($num(iY)) e.style.top=iY+'px';
    else {
      iY=parseInt(e.style.top);
      if(isNaN(iY)) iY=0;
    }
  }
  else if(css && $def(e.style.pixelTop)) {
    if($num(iY)) e.style.pixelTop=iY;
    else iY=e.style.pixelTop;
  }
  return iY;
}
jive.ext.x.xPageX = function(obj) {
    var curleft = 0;
    if(obj.offsetParent)
        while(1)
        {
          curleft += obj.offsetLeft;
          if(!obj.offsetParent)
            break;
          obj = obj.offsetParent;
        }
    else if(obj.x)
        curleft += obj.x;
    return curleft;
  }

jive.ext.x.xPageY = function(obj){
    var curtop = 0;
    if(obj.offsetParent)
        while(1)
        {
          curtop += obj.offsetTop;
          if(!obj.offsetParent)
            break;
          obj = obj.offsetParent;
        }
    else if(obj.y)
        curtop += obj.y;
    return curtop;
}
jive.ext.x.xScrollLeft = function(e) {
  var offset=0, doc = e.ownerDocument;
  if (!(e=jive.ext.x.xGetElementById(e))) {
    if(doc.documentElement && doc.documentElement.scrollLeft) offset=doc.documentElement.scrollLeft;
    else if(doc.body && $def(doc.body.scrollLeft)) offset=doc.body.scrollLeft;
  }
  else { if ($num(e.scrollLeft)) offset = e.scrollLeft; }
  return offset;
}
jive.ext.x.xScrollTop = function(e) {
  var offset=0, doc = e.ownerDocument;
  if (!(e=jive.ext.x.xGetElementById(e))) {
    if(doc.documentElement && doc.documentElement.scrollTop) offset=doc.documentElement.scrollTop;
    else if(doc.body && $def(doc.body.scrollTop)) offset=doc.body.scrollTop;
  }
  else { if ($num(e.scrollTop)) offset = e.scrollTop; }
  return offset;
}
jive.ext.x.xWidth = function(e,w)
{
  if(!(e=jive.ext.x.xGetElementById(e))) return 0;
  if ($num(w)) {
    if (w<0) w = 0;
    else w=Math.round(w);
  }
  else w=-1;
  var css=$def(e.style);
  if (e == document || e.tagName.toLowerCase() == 'html' || e.tagName.toLowerCase() == 'body') {
    w = jive.ext.x.xClientWidth();
  }
  else if(css && $def(e.offsetWidth) && $str(e.style.width)) {
    if(w>=0) {
      var pl=0,pr=0,bl=0,br=0;
      if (document.compatMode=='CSS1Compat') {
        var gcs = jive.ext.x.xGetCS;
        pl=gcs(e,'padding-left',1);
        if (pl !== null) {
          pr=gcs(e,'padding-right',1);
          bl=gcs(e,'border-left-width',1);
          br=gcs(e,'border-right-width',1);
        }
        // Should we try this as a last resort?
        // At this point getComputedStyle and currentStyle do not exist.
        else if($def(e.offsetWidth,e.style.width)){
          e.style.width=w+'px';
          pl=e.offsetWidth-w;
        }
      }
      w-=(pl+pr+bl+br);
      if(isNaN(w)||w<0) return;
      else e.style.width=w+'px';
    }
    w=e.offsetWidth;
  }
  else if(css && $def(e.style.pixelWidth)) {
    if(w>=0) e.style.pixelWidth=w;
    w=e.style.pixelWidth;
  }
  return w;
}
jive.ext.x.xCamelize = function(cssPropStr)
{
  var i, c, a = cssPropStr.split('-');
  var s = a[0];
  for (i=1; i<a.length; ++i) {
    c = a[i].charAt(0);
    s += a[i].replace(c, c.toUpperCase());
  }
  return s;
}
jive.ext.x.xGetCS = function(e, p)
{
    try{
      if(!(e=jive.ext.x.xGetElementById(e))) return null;
      var s, v = 'undefined', dv = e.ownerDocument.defaultView;
      if(dv && dv.getComputedStyle){
        s = dv.getComputedStyle(e,'');
        if (s) v = s.getPropertyValue(p);
      }
      else if(e.currentStyle) {
        v = e.currentStyle[jive.ext.x.xCamelize(p)];
      }
      else return null;
        if($str(v) && v.indexOf("px") > 0){
            v = v.substr(0,v.indexOf("px"));
            v = parseInt(v);
        }
      return v;
    }catch(e){
        return "";
    }
}

jive.ext.x.xGetCSFunc = function(e, p)
{
    try{
      if(!(e=jive.ext.x.xGetElementById(e))) return null;
      var s, v = 'undefined', dv = e.ownerDocument.defaultView;
      if(dv && dv.getComputedStyle){
        s = dv.getComputedStyle(e,'');
        if (s){
            return function(s){ return function(p){
                var v = s.getPropertyValue(p);
                if($str(v) && v.indexOf("px") > 0){
                    v = v.substr(0,v.indexOf("px"));
                    v = parseInt(v);
                }
                return v;
            } }(s);
        }
      }
      else if(e.currentStyle) {
            return function(cs){ return function(p){
                var v = cs[jive.ext.x.xCamelize(p)];
                if($str(v) && v.indexOf("px") > 0){
                    v = v.substr(0,v.indexOf("px"));
                    v = parseInt(v);
                }
                return v;
            } }(e.currentStyle);
      }
      else return function(){ return "undefined"; };
    }catch(e){
        return function(){ return "undefined"; };
    }
}
jive.ext.x.xSetCH = function(ele,uH){
  var pt=0,pb=0,bt=0,bb=0,doc = ele.ownerDocument
  if($def(doc.defaultView) && $def(doc.defaultView.getComputedStyle)){
    pt=jive.ext.x.xGetCS(ele,'padding-top');
    pb=jive.ext.x.xGetCS(ele,'padding-bottom');
    bt=jive.ext.x.xGetCS(ele,'border-top-width');
    bb=jive.ext.x.xGetCS(ele,'border-bottom-width');
  }
  else if($def(ele.currentStyle,doc.compatMode)){
    if(doc.compatMode=='CSS1Compat'){
      pt=parseInt(ele.currentStyle.paddingTop);
      pb=parseInt(ele.currentStyle.paddingBottom);
      bt=parseInt(ele.currentStyle.borderTopWidth);
      bb=parseInt(ele.currentStyle.borderBottomWidth);
    }
  }
  else if($def(ele.offsetHeight,ele.style.height)){ // ?
    ele.style.height=uH+'px';
    pt=ele.offsetHeight-uH;
  }
  if(isNaN(pt)) pt=0; if(isNaN(pb)) pb=0; if(isNaN(bt)) bt=0; if(isNaN(bb)) bb=0;
  var cssH=uH-(pt+pb+bt+bb);
  if(isNaN(cssH)||cssH<0) return;
  else ele.style.height=cssH+'px';
}
jive.ext.x.xHeight = function(e,uH) {
  if(!(e=jive.ext.x.xGetElementById(e))) return 0;
  if ($num(uH)) {
    if (uH<0) uH = 0;
    else uH=Math.round(uH);
  }
  else uH=0;
  var css=$def(e.style);
  if(css && $def(e.offsetHeight) && $str(e.style.height)) {
    if(uH) jive.ext.x.xSetCH(e, uH);
    uH=e.offsetHeight;
  }
  else if(css && $def(e.style.pixelHeight)) {
    if(uH) e.style.pixelHeight=uH;
    uH=e.style.pixelHeight;
  }
  return uH;
}
jive.ext.x.xHasPoint = function(ele, iLeft, iTop, iClpT, iClpR, iClpB, iClpL) {
  if (!$num(iClpT)){iClpT=iClpR=iClpB=iClpL=0;}
  else if (!$num(iClpR)){iClpR=iClpB=iClpL=iClpT;}
  else if (!$num(iClpB)){iClpL=iClpR; iClpB=iClpT;}
  var thisX = jive.ext.x.xPageX(ele), thisY = jive.ext.x.xPageY(ele);
  return (iLeft >= thisX + iClpL && iLeft <= thisX + jive.ext.x.xWidth(ele) - iClpR &&
          iTop >=thisY + iClpT && iTop <= thisY + jive.ext.x.xHeight(ele) - iClpB );
}
// Window:
jive.ext.x.xClientWidth = function() {
  var w=0;
  if(jive.ext.x.xOp5or6) w=window.innerWidth;
  else if(!window.opera && document.documentElement && document.documentElement.clientWidth) // v3.12
    w=document.documentElement.clientWidth;
  else if(document.body && document.body.clientWidth)
    w=document.body.clientWidth;
  else if($def(window.innerWidth,window.innerHeight,document.height)) {
    w=window.innerWidth;
    if(document.height>window.innerHeight) w-=16;
  }
  return w;
}
jive.ext.x.xClientHeight = function() {
  var h=0;
  if(jive.ext.x.xOp5or6) h=window.innerHeight;
  else if(!window.opera && document.documentElement && document.documentElement.clientHeight) // v3.12
    h=document.documentElement.clientHeight;
  else if(document.body && document.body.clientHeight)
    h=document.body.clientHeight;
  else if($def(window.innerWidth,window.innerHeight,document.width)) {
    h=window.innerHeight;
    if(document.width>window.innerWidth) h-=16;
  }
  return h;
}



jive.ext.x.xDocHeight = function(doc) {
    if(doc)
        var b=doc.body, e=doc.documentElement;
    else
        var b=document.body, e=document.documentElement;
    var esh=0, eoh=0, bsh=0, boh=0;
    if (e) {
        esh = e.scrollHeight;
        eoh = e.offsetHeight;
    }
    if (b) {
        bsh = b.scrollHeight;
        boh = b.offsetHeight;
    }
    return Math.max(esh,eoh,bsh,boh);
}
