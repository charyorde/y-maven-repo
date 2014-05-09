/**
 * the header for jotlet
 */
jive.gui.NullHeader = function(control){

    var that = this;


	var header = document.createElement('DIV');
	jive.ext.x.xDisplayNone(header);

	this.getDOM = function(){
		return header;
	}

	this.showArrowsHuh = function(b){ }

	this.showPrintHuh = function(b){ }

	this.showFilterHuh = function(b){ }

	this.getHeight = function(){
		return 0;
	}

	this.setTitleText = function(str){ }

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
	 ** destructor
	 **
	 ****************************************/

	this.killYourself = function(){
	}
}


