/**
 * the header for jotlet
 */
jive.gui.SimpleHeader = function(control, par){

	var that;
	if($obj(par)){
		that = par;
	}else{
		that = this;
	}

	var button_wrap = document.createElement('DIV');
	button_wrap.setAttribute("class", "month_view_header_button_wrap");
	button_wrap.className = "month_view_header_button_wrap";

	var header = document.createElement('DIV');
	header.setAttribute("class", "month_view_header color_header");
	header.className = "month_view_header color_header";
	header.appendChild(document.createElement('DIV'));
	var l_arrow = document.createElement("span");
	l_arrow.setAttribute("class", "month_view_header_link");
	l_arrow.className = "month_view_header_link";
	button_wrap.appendChild(l_arrow);
	l_arrow.appendChild(document.createTextNode("<"));
	var r_arrow = document.createElement("span");
	r_arrow.setAttribute("class", "month_view_float_r month_view_header_link");
	r_arrow.className = "month_view_float_r month_view_header_link";
	r_arrow.appendChild(document.createTextNode(">"));
	button_wrap.appendChild(r_arrow);
	var monthName = document.createElement('SPAN');
	monthName.setAttribute("class", "month_view_headerc");
	monthName.className = "month_view_headerc";
	button_wrap.appendChild(monthName);
	header.appendChild(button_wrap);

	jive.ext.x.xDisplayBlock(header);

	this.getDOM = function(){
		return header;
	}

	this.showArrowsHuh = function(b){
		if(b){
			jive.ext.x.xDisplayBlock(l_arrow);
			jive.ext.x.xShow(r_arrow);
		}else{
			jive.ext.x.xDisplayNone(l_arrow);
			jive.ext.x.xHide(r_arrow);
		}
	}

	this.showPrintHuh = function(b){ }

	this.showFilterHuh = function(b){ }

	this.getHeight = function(){
		return (jive.ext.x.xDisplay(header) == "block") ? jive.ext.x.xHeight(header) : 0;
	}

	this.setTitleText = function(str){
		while(monthName.childNodes.length > 0) monthName.removeChild(monthName.childNodes[0]);
		monthName.appendChild(document.createTextNode(str));
	}


	this.setNavFilter = function(foo){ }

	this.updateText = function(){ }

	this.getFilterText = function(){
		return "";
	}



	/****************************************
	 **
	 ** listeners
	 **
	 ****************************************/

	var listeners = new Array();

	this.addListener = function(list){
		listeners.push(list);
	}

	/**
	 * notify the listeners that the print button
	 * was clicked
	 */
	this.notifyPrintClicked = function(){
		for(var i=0;i<listeners.length;i++){
			listeners[i].printClicked();
		}
	}

	/**
	 * the left arrow was clicked
	 */
	this.notifyLeftClicked = function(){
		for(var i=0;i<listeners.length;i++){
			listeners[i].leftClicked();
		}
	}

	/**
	 * the right arrow was clicked
	 */
	this.notifyRightClicked = function(){
		for(var i=0;i<listeners.length;i++){
			listeners[i].rightClicked();
		}
	}

	/**
	 * the ui should filter by text
	 */
	this.notifySearchByText = function(str){
		for(var i=0;i<listeners.length;i++){
			listeners[i].searchByText(str);
		}
	}



	/****************************************
	 **
	 ** events
	 **
	 ****************************************/
	jive.ext.x.xAddEventListener(l_arrow, "click", function(that){ return function(){ that.notifyLeftClicked(); } }(that));
	jive.ext.x.xAddEventListener(r_arrow, "click", function(that){ return function(){ that.notifyRightClicked(); } }(that));


	/****************************************
	 **
	 ** destructor
	 **
	 ****************************************/

	this.killYourself = function(){
	}
}


