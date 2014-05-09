// The remaining functions are utility functions added by Adam Wulf
// on June of 2004

/**
 * store an object in a hashtable.
 * hash key must be provided
 * currently O(1) for insert
 * O(n) for retrive/clear
 * we can optimize this later
 *
 * ex
 * var cal = new jotlet.model.Calendar();
 * var key = 224451 // any key you want to use to save/lookup the cal object
 * var table = new jotlet.external.y.HashTable();
 * table.put(key, cal);
 * table.get(key) // gives us back the cal object
 */
jive.ext.y.HashTable = function(){
	var that = this;

	var count = 0;

	this.getCount = function(){
		return count;
	}

	this.undefined = new Object();

	this.cache = new Array();

	/**
	 * add an item to the hashtable
	 */
	this.put = function(index, item){
		that.clear(index);
		that.cache[index] = item;
		count = count + 1;
	}

	/**
	 * retrieve an item from the hashtable
	 */
	this.get = function(index){
		if(typeof(that.cache[index])!='undefined' && that.cache[index] != that.undefined){
			return that.cache[index];
		}else{
			return false;
		}
	}

	/**
	 * clear the hashtable
	 */
	this.clear = function(index){
		if(that.cache[index] != that.undefined &&
		   that.cache[index] != null){
			   // decrease count only if we're
			   // clearing a legit item
			   count = count - 1;
		}
		that.cache[index] = that.undefined;
	}

	/**
	 * return an array of this Hashtable
	 * (values only, no keys)
     *
     * If `func` is given it will be applied as a predicate to each value in
     * this HashTable.  Only values for which `func` returns true will be
     * included in the returned array.
	 */
	this.toArray = function(func){
        if (typeof func != "function") {
            func = function() { return true; }
        }
        return Object.values(that.cache).filter(function(e) {
            return func(e) && e != that.undefined && e !== null;
        });
	}

	/**
	 * return the keys of a Hashtable
	 */
	this.toKeysArray = function(func){
        return Object.keys(that.cache);
	}
}


jive.ext.y.yBottom = function(e,iY) {
  if(!(e=jive.ext.x.xGetElementById(e))) return 0;
  var css=$def(e.style);
  if(css && $str(e.style.bottom)) {
    if($num(iY)) e.style.bottom=iY+'px';
    else {
      iY=parseInt(e.style.bottom);
      if(isNaN(iY)) iY=0;
    }
  }
  else if(css && $def(e.style.pixelBottom)) {
    if($num(iY)) e.style.pixelBottom=iY;
    else iY=e.style.pixelBottom;
  }
  return iY;
}


/**
 * opacity is between 0-100
 */
jive.ext.y.yOpacity = function(e, op){
  if (!(e=jive.ext.x.xGetElementById(e))) return;
  if (jotlet.external.x.xNum(op)) {
    if (op<0) op = 0;
    else if(op > 100) op = 100;
    else op=Math.round(op);

    if(jotlet.external.x.xDef(e.style.MozOpacity)){
	  e.style.MozOpacity = (op/100.0);
	  return e.style.MozOpacity * 100.0;
    }
    if(jotlet.external.x.xDef(e.style.opacity)){
	  e.style.opacity = (op/100.0);
	  return e.style.opacity * 100.0;
    }

    if(jotlet.external.x.xStr(e.style.filter)){ // ie
//    if(jotlet.external.x.xDef(e.filters) && jotlet.external.x.xDef(e.filters.alpha) && jotlet.external.x.xDef(e.filters.alpha.opacity)){
    	e.style.filter = 'alpha(opacity=' + (op) + ')';
//	e.filters.alpha.opacity = op;
	e.yOpacity = op;
	return e.yOpacity;
    }
  }
  if(jotlet.external.x.xDef(e.style.MozOpacity)){
	  return e.style.MozOpacity * 100.0;
  }
  if(jotlet.external.x.xDef(e.style.opacity)){
	  return e.style.opacity * 100.0;
  }
  if(jotlet.external.x.xDef(e.filters) && jotlet.external.x.xDef(e.filters.alpha) && jotlet.external.x.xDef(e.filters.alpha.opacity)){
	  return e.filters.alpha.opacity;
  }
}

