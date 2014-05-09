// x_event.js
// X v3.15, Cross-Browser DHTML Library from Cross-Browser.com
// Copyright (c) 2002,2003,2004 Michael Foster (mike@cross-browser.com)
// This library is distributed under the terms of the LGPL (gnu.org)

jive.ext.x.xAddEventListener = function(e,eventType,eventListener,useCapture) {
  if(!(e=jive.ext.x.xGetElementById(e))) return;
  eventType=eventType.toLowerCase();
  if((!jive.ext.x.xIE4Up && !jive.ext.x.xOp7) && e==window) {
    if(eventType=='resize') { jive.ext.x.xPCW=jive.ext.x.xClientWidth(); jive.ext.x.xPCH=jive.ext.x.xClientHeight(); jive.ext.x.xREL=eventListener; jive.ext.x.xResizeEvent(); return; }
    if(eventType=='scroll') { jive.ext.x.xPSL=jive.ext.x.xScrollLeft(); jive.ext.x.xPST=jive.ext.x.xScrollTop(); jive.ext.x.xSEL=eventListener; jive.ext.x.xScrollEvent(); return; }
  }
  if(e.addEventListener) e.addEventListener(eventType,eventListener,useCapture);
  else if(e.attachEvent) e.attachEvent('on'+eventType,eventListener);
  else if(e.captureEvents) {
    if(useCapture||(eventType.indexOf('mousemove')!=-1)) { e.captureEvents(eval('Event.'+eventType.toUpperCase())); }
    var eh='e.on'+eventType+'=eventListener';
    eval(eh);
  }
  else{
	var eh='e.on'+eventType+'=eventListener';
  	eval(eh);
  }
}
jive.ext.x.xRemoveEventListener = function(e,eventType,eventListener,useCapture) {
  if(!(e=jive.ext.x.xGetElementById(e))) return;
  eventType=eventType.toLowerCase();
  if((!jive.ext.x.xIE4Up && !jive.ext.x.xOp7) && e==window) {
    if(eventType=='resize') { jive.ext.x.xREL=null; return; }
    if(eventType=='scroll') { jive.ext.x.xSEL=null; return; }
  }
  var eh='e.on'+eventType+'=null';
  if(e.removeEventListener) e.removeEventListener(eventType,eventListener,useCapture);
  else if(e.detachEvent) e.detachEvent('on'+eventType,eventListener);
  else if(e.releaseEvents) {
    if(useCapture||(eventType.indexOf('mousemove')!=-1)) { e.releaseEvents(eval('Event.'+eventType.toUpperCase())); }
    eval(eh);
  }
  else eval(eh);
}
// xStopPropagation, Copyright 2004-2006 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL

jive.ext.x.xStopPropagation = function(evt)
{
  if (evt && evt.stopPropagation) evt.stopPropagation();
  else if (window.event) window.event.cancelBubble = true;
}
jive.ext.x.xEvent = function(evt) { // cross-browser event object prototype
  this.type = '';
  this.target = null;
  this.keyCode = 0;
  var e = evt ? evt : window.event;
  if(!e) return;
  if(e.type) this.type = e.type;
  if(e.target) this.target = e.target;
  else if(e.srcElement) this.target = e.srcElement;

  var pageX = null;
  var pageY = null;

  this.pageX = function(){
  	if(pageX == null){
		if(jive.ext.x.xOp5or6) { pageX = e.clientX; pageY = e.clientY; }
		else if(jive.ext.x.xDef(e.clientX,e.clientY)) { pageX = e.clientX + jive.ext.x.xScrollLeft(); pageY = e.clientY + jive.ext.x.xScrollTop(); }
  	}
  	return pageX;
  }

  this.pageY = function(){
  	if(pageY == null){
		if(jive.ext.x.xOp5or6) { pageX = e.clientX; pageY = e.clientY; }
		else if(jive.ext.x.xDef(e.clientX,e.clientY)) { pageX = e.clientX + jive.ext.x.xScrollLeft(); pageY = e.clientY + jive.ext.x.xScrollTop(); }
  	}
  	return pageY;
  }

  var offsetX = null;
  var offsetY = null;
  this.offsetX = function(){
  	if(offsetX == null){
		if(jive.ext.x.xDef(e.layerX,e.layerY)) { offsetX = e.layerX; offsetY = e.layerY; }
		else if(jive.ext.x.xDef(e.offsetX,e.offsetY)) { offsetX = e.offsetX; offsetY = e.offsetY; }
		else { offsetX = this.pageX - jive.ext.x.xPageX(this.target); offsetY = this.pageY - jive.ext.x.xPageY(this.target); }
  	}
  	return offsetX;
  }

  this.offsetY = function(){
  	if(offsetY == null){
		if(jive.ext.x.xDef(e.layerX,e.layerY)) { offsetX = e.layerX; offsetY = e.layerY; }
		else if(jive.ext.x.xDef(e.offsetX,e.offsetY)) { offsetX = e.offsetX; offsetY = e.offsetY; }
		else { offsetX = this.pageX - jive.ext.x.xPageX(this.target); offsetY = this.pageY - jive.ext.x.xPageY(this.target); }
  	}
  	return offsetY;
  }

  if (e.keyCode) { this.keyCode = e.keyCode; } // for moz/fb, if keyCode==0 use which
  else if (jive.ext.x.xDef(e.which)) { this.keyCode = e.which; }
}
jive.ext.x.xResizeEvent = function() { // window resize event simulation
  if (jive.ext.x.xREL) setTimeout('jive.ext.x.xResizeEvent()', 250);
  var cw = jive.ext.x.xClientWidth(), ch = jive.ext.x.xClientHeight();
  if (jive.ext.x.xPCW != cw || jive.ext.x.xPCH != ch) { jive.ext.x.xPCW = cw; jive.ext.x.xPCH = ch; if (jive.ext.x.xREL) jive.ext.x.xREL(); }
}
jive.ext.x.xScrollEvent = function() { // window scroll event simulation
  if (jive.ext.x.xSEL) setTimeout('jive.ext.x.xScrollEvent()', 250);
  var sl = jive.ext.x.xScrollLeft(), st = jive.ext.x.xScrollTop();
  if (jive.ext.x.xPSL != sl || jive.ext.x.xPST != st) { jive.ext.x.xPSL = sl; jive.ext.x.xPST = st; if (jive.ext.x.xSEL) jive.ext.x.xSEL(); }
}
// end x_event.js


