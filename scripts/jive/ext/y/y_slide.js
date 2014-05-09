jive.ext.y._sliders_on = true;

jive.ext.y._sliders = new jive.ext.y.HashTable();

/**
 * uTime is the total time for the animation
 * e is the optional object to store settings to
 * (useful to share settings between multiople animations)
 */
jive.ext.y.ySlider = function(uTime, e, name){

	/**
	 * tickers have a tick(p)
	 * init()
	 * and stop() methods
	 * tick() is given the period (between 0 and 1)?
	 */
	var tickers = new Array();

	var that = this;

	this.hash = 0;
	this.name = name;
	this.moving = false;

	if(!$obj(e) || e == null){
		e = new Object();
	}
	if (!$def(e.timeout) || e.timeout == null) e.timeout = false;

	/**
	 * the mai function
	 */
	this.go = function() {
		try{
			while(that.hash == 0 || $obj(jive.ext.y._sliders.get(that.hash))){
				that.hash = Math.round(Math.random()*10000) + 1;
			}
			jive.ext.y._sliders.put(that.hash, this);
			if (!e.timeout) e.timeout = 40;

			for(var i=0;i<tickers.length;i++){
				tickers[i].init();
			}

			e.slideTime = uTime;
			e.stop = false;
			e.B = Math.PI / (2 * e.slideTime); // B = period
			var d = new Date();
			e.C = d.getTime();
			if(!jive.ext.y._sliders_on){
				// if animations are turned off
				// jump to the end
				e.slideTime = 0;
			}
			if (!that.moving) this._slide();
		}catch(ex){
			alert("error initializing slider:" + e.message);
		}
	}

	this._slide = function() {
		try{
			var now, s, t, newY;
			now = new Date();
			t = now.getTime() - e.C;
			if (e.stop) {
				that.moving = false;
			} else{

				if(t < e.slideTime){
					setTimeout("jive.ext.y._sliders.get('" + that.hash + "')._slide();", e.timeout);
					var s = Math.sin(e.B * t);
					for(var i=0;i<tickers.length; i++){
						tickers[i].tick(s);
					}
					that.moving = true;
				}else{
					for(var i=0;i<tickers.length;i++){
						tickers[i].stop();
					}
					that.moving = false;
				}
			}
		}catch(ex){
			alert("error sliding slider:" + e);
		}
	}



	/**
	 * add a ticker
	 */
	this.addTicker = function(t){
		tickers.push(t);
	}

}

jive.ext.y.EndOfSlideTicker = function(thunk){
	this.init = function(){
	}
	this.tick = function(s){
	}
	this.stop = function(){
//		alert("calling: " + thunk);
		thunk();
	}
}

jive.ext.y.SlideToTicker = function(e, x, y){

	this.init = function(){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		e.xTarget = x;
		e.yTarget = y;
		e.yA = e.yTarget - jive.ext.x.xTop(e); // A = distance
		e.xA = e.xTarget - jive.ext.x.xLeft(e); // A = distance
		e.yD = jive.ext.x.xTop(e); // D = initial position
		e.xD = jive.ext.x.xLeft(e); // D = initial position
	}
	this.tick = function(s){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		var newX = Math.round(e.xA * s + e.xD);
		var newY = Math.round(e.yA * s + e.yD);
		jive.ext.x.xMoveTo(e, newX, newY);
	}
	this.stop = function(){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		jive.ext.x.xMoveTo(e, e.xTarget, e.yTarget);
	}
}


jive.ext.y.SlideHeightToTicker = function(e, h){

	this.init = function(){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		e.xTargetH = h;
		e.xAH = e.xTargetH - jive.ext.x.xHeight(e); // A = distance
		e.xDH = jive.ext.x.xHeight(e); // D = initial position
	}
	this.tick = function(s){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		var newH = Math.round(e.xAH * s + e.xDH);
		jive.ext.x.xHeight(e, newH);
	}
	this.stop = function(){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		jive.ext.x.xHeight(e, e.xTargetH);
	}
}

jive.ext.y.SlideWidthToTicker = function(e, w){

	this.init = function(){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		e.xTargetW = w;
		e.xAW = e.xTargetW - jive.ext.x.xWidth(e); // A = distance
		e.xDW = jive.ext.x.xWidth(e); // D = initial position
	}
	this.tick = function(s){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		var newW = Math.round(e.xAW * s + e.xDW);
		jive.ext.x.xWidth(e, newW);
	}
	this.stop = function(){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		jive.ext.x.xWidth(e, e.xTargetW);
	}
}

jive.ext.y.SlideTopToTicker = function(e, t){

	this.init = function(){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		e.xTargetT = t;
		e.xAT = e.xTargetT - jive.ext.x.xTop(e); // A = distance
		e.xDT = jive.ext.x.xTop(e); // D = initial position
	}
	this.tick = function(s){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		var newT = Math.round(e.xAT * s + e.xDT);
		jive.ext.x.xTop(e, newT);
	}
	this.stop = function(){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		jive.ext.x.xTop(e, e.xTargetT);
	}
}

jive.ext.y.SlideBottomToTicker = function(e, t){
	
	this.init = function(){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		e.xTargetT = t;
		e.xAT = e.xTargetT - jive.ext.y.yBottom(e); // A = distance
		e.xDT = jive.ext.y.yBottom(e); // D = initial position
	}
	this.tick = function(s){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		var newT = Math.round(e.xAT * s + e.xDT);
		jive.ext.y.yBottom(e, newT);
	}
	this.stop = function(){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		jive.ext.y.yBottom(e, e.xTargetT);
	}
}

jive.ext.y.SlideOpacityToTicker = function(e, o){

	this.init = function(){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		e.xTargetO = o;
		e.xAO = e.xTargetO - jive.ext.y.yOpacity(e); // A = distance
		e.xDO = jive.ext.y.yOpacity(e); // D = initial position
	}
	this.tick = function(s){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		var newO = Math.round(e.xAO * s + e.xDO);
		jive.ext.y.yOpacity(e, newO);
	}
	this.stop = function(){
		if (!(e=jive.ext.x.xGetElementById(e))) return;
		jive.ext.y.yOpacity(e, e.xTargetO);
	}
}
