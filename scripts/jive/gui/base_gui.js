/**
 * a month panel is composed of day cell holders, which in turn hold
 * the actual day cells. each holder holds 4 weeks of day cells. these
 * holders can be added to the beginning/end of the month view.
 *
 * to add the month panel to the UI, call it's getDOM() method
 * which returns a dom object
 */
jive.gui.BasicGui = function(control){

	/**
	 * selected item (event or task), or false if none is selected
	 */
	var selected_item = null;

	/**
	 * the list of listeners listening to this month view
	 */
	var listeners = new Array();

	/**
	 * the list of listeners listening to this month view's events
	 * they will recieve info about which events have been clicked etc.
	 */
	var event_listeners = new Array();

	this.addPriorityEventListener = function(list){
		event_listeners.splice(0,0,list);
	}
	this.addEventListener = function(list){
		event_listeners.push(list);
	}

	/**
	 * the current date of this month
	 */
	var currDate = new Date();
	currDate.setHours(17);

	/**
	 * the minimum date currently displayed on month view
	 */
	var currMin = new Date();
	currMin.setHours(17);
	/**
	 * the minimum date currently displayed on month view
	 */
	var currMax = new Date();
	currMax.setHours(17);

	/**
	 * this lets us reference this object from within anonymous objects
	 * inside this class
	 */
	var that = this;


    var has_init = false;
	this.hasInitHuh = function(){
		return has_init;
	}

	var veryinner = document.createElement('DIV');
	veryinner.className = "month_view_very_inner";

	var panel = document.createElement('DIV');
	panel.setAttribute("class", "month_view_main");
	panel.className = "month_view_main";

	var header = new jive.gui.SimpleHeader(control);
	
	var inner = document.createElement('DIV');
	inner.setAttribute("class", "month_view_inner");
	inner.className = "month_view_inner";



	var show_print = true;
	this.showPrintHuh = function(b){
		show_print = b;
		if(b && that.getActiveView().hasPrintView()){
			that.getHeader().showPrintHuh(true);
		}else{
			that.getHeader().showPrintHuh(false);
		}
	}
	this.shouldShowPrintHuh = function(){
		return show_print;
	}

	this.setNavFilter = function(foo){
		that.getHeader().setNavFilter(foo);
	}

	this.showFilterHuh = function(b){
		that.getHeader().showFilterHuh(b);
	}

    this.getFilterText = function(){
		return that.getHeader().getFilterText();
	}

	this.getHeaderFooterHeight = function(){
		return that.getHeader().getHeight();
	}


	/************************************************************************
	**
	** FUNCTIONS TO MANAGE MULTIPLE VIEWS
	**
	*************************************************************************/
	var LEFT_ACTION = function(){ };

	var RIGHT_ACTION = function(){ };

	function getLeftAction(){
		return LEFT_ACTION;
	}
	function getRightAction(){
		return RIGHT_ACTION;
	}

	var views = new jive.ext.y.HashTable();
	// returns true if an object is a view
	this.isViewHuh = function(v){
		return v != null && $obj(v) && $def(v.isExpandedHuh);
	}
	this.addView = function(view){
		var v = that.getView(view.getName());
		if(!$obj(v) || v == null){
			views.put(view.getHash(), view);
			//
			// if month view has already been init'd,
			// then we need to init the view right now.
			//
			// otherwise, the view will be init'd after
			// monthview's init'd
			//
			if(that.hasInitHuh()){
				view.init(veryinner);
				view.collapse();
			}
		}
	}
	this.removeView = function(name){
		views.clear(name);
	}
	this.getAllViews = function(){
		return views.toArray(that.isViewHuh);
	}
	this.getView = function(key){
		return views.get(key);
	}
	/**
	 * show the week view for this date
	 * d: the input to initialize teh view
	 * (it's a date for day/week/etc, adapter for list view, event for event view, etc)
	 * name: the name of the view to show
	 */
	this.showView = function(d, hash){
		var v = that.getAllViews();
		var has_view = false;
		for(var i=0;i<v.length;i++){
			if(v[i].getHash() == hash){
				has_view = true;
			}
		}
		if(!has_view) return that.showView(d, "month");

		for(var i=0;i<v.length;i++){
			if(v[i].getHash() == hash){
				if(!v[i].isExpandedHuh()){
					v[i].expand();
				}
				if(v[i].hasPrintView() && show_print){
					that.getHeader().showPrintHuh(true);
				}else{
					that.getHeader().showPrintHuh(false);
				}
				// show the view
				v[i].go(d);
				// update the header
				that.getHeader().setTitleText(jive.util.escapeHTML(v[i].getHeaderText(d)));
				// now listen for cliks to the next/prev buttons
				LEFT_ACTION = v[i].getPrevViewFunc();
				RIGHT_ACTION = v[i].getNextViewFunc();
				// reset the min/max times that are being shown
				currMin.setTime(v[i].getMinDate());
				currMax.setTime(v[i].getMaxDate());
				that.notifyTimesChanged(v[i].getMinDate(), v[i].getMaxDate());
			}else if(v[i].isExpandedHuh()){
				v[i].collapse();
			}
		}
		that.fixHeight();
	}

	/************************************************************************
	**
	** END FUNCTIONS TO MANAGE MULTIPLE VIEWS
	**
	*************************************************************************/

	/**
	 * return the current date of month view
	 */
	this.getCurrentDate = function(){
		var ret = new Date();
		ret.setTime(currDate.getTime());
		return ret;
	}
	/**
	 * sets the current date of month view
	 */
	this.setCurrentDate = function(d){
		currDate.setTime(d.getTime());
	}

	/**
	 * notify listeners that we're zooming to day view
	 */
	this.notifyPrintClicked = function(d){
		var foo = new Date();
		foo.setTime(d.getTime());
		for(var i=0;i<listeners.length;i++){
			listeners[i].printClicked(foo);
		}
	}


	/**
	 * hide the navigation arrows in the header
	 */
	this.hideArrows = function(){
		that.getHeader().showArrowsHuh(false);
	}

	/**
	 * show the navigation arrows in the header
	 */
	this.showArrows = function(){
		that.getHeader().showArrowsHuh(true);
	}

	/**
	 * make sure that our min date is set to
	 * at least dt
	 */
	this.ensureMinDate = function(dt){
		if(jive.model.dateLT(dt, currMin)){
			currMin.setTime(dt.getTime());
		}
	}
	/**
	 * make sure that our max date is set to
	 * at least dt
	 */
	this.ensureMaxDate = function(dt){
		if(jive.model.dateGT(dt, currMax)){
			currMax.setTime(dt.getTime());
		}
	}

	/**
	 * return the min date of month view
	 */
	this.getMinDate = function(){
		return currMin;
	}
	/**
	 * set the min date
	 */
	this.setMinDate = function(d){
		currMin.setTime(d.getTime());
	}
	/**
	 * return the min date of month view
	 */
	this.getMaxDate = function(){
		return currMax;
	}
	/**
	 * set the max date of month view
	 */
	this.setMaxDate = function(d){
		currMax.setTime(d.getTime());
	}

	/**
	 * the cell that will expand into month view
	 */
	var month_view = new jive.gui.MiniMonthView(control, that);


	this.updateText = function(){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			v[i].updateText();
		}

		var tlang = control.getLanguageManager().getActiveLanguage();
		that.getHeader().updateText()
		that.getHeader().setTitleText(jive.util.escapeHTML(that.getActiveView().getHeaderText(that.getCurrentDate())));
	};

	/**
	 * now tie all the dom objects together
	 */
	panel.appendChild(header.getDOM());
	panel.appendChild(inner);
	inner.appendChild(veryinner);



	/**
	 * return the DOM object that represents this month view
	 */
	this.getDOM = function(){
		return panel;
	}


	/**
	 * gets the events for a specific day
	 * @param dt a date object
	 */
	this.getEventsOn = function(dt){
		return that.getView("month").getEventsOn(dt);
	}

	/**
	 * gets the tasks for a specific day
	 * @param dt a Date object
	 */
	this.getTasksOn = function(dt){
		return that.getView("month").getTasksOn(dt);
	}


	/**
	 * add (or refresh) an event to display on this month view
	 * i need to update this function. its not handling teh drag listeners
	 * correctly. i need to remove old listeners before i add new ones...
	 */
	this.addEvent = function(tevent){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			v[i].addEvent(tevent);
		}
	}


	/**
	 * add a task to display on this month view
	 */
	this.addTask = function(ttask){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			v[i].addTask(ttask);
		}
	}

	/**
	 * removes an event from the month view
	 *
	 * this removes any drag listeners from span elements
	 * for that event, and disables the drag
	 */
	this.removeEvent = function(tevent){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			v[i].removeEvent(tevent);
		}
	}

	/**
	 * removes an event from the month view
	 *
	 * this removes any drag listeners from span elements
	 * for that event, and disables the drag
	 */
	this.removeTask = function(ttask){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			v[i].removeTask(ttask);
		}
	}

	/**
	 * this flushes a calendar entirely. it removes it from teh views,
	 * and also removes any DOM's we have cached for this calendar's
	 * events
	 */
	this.flushCalendar = function(cal){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			v[i].flushCalendar(cal);
		}
	}

	/**
	 * this flushes an event entirely. it removes it from the views,
	 * and also removes any DOM's we have cached for that event
	 */
	this.flushEvent = function(tevent){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			v[i].flushEvent(tevent);
		}

		if(jotlet.model.isEvent(selected_item) && selected_item.getId() == tevent.getId()){
			selected_item = null;
		}
	}

	/**
	 * this flushes a task entirely. it removes it from the views,
	 * and also removes any DOM's we have cached for that task
	 */
	this.flushTask = function(ttask){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			v[i].flushTask(ttask);
		}

		if(jotlet.model.isTask(selected_item) && selected_item.getId() == ttask.getId()){
			selected_item = null;
		}
	}


	this.refreshWeather = function(){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			if($def(v[i].refreshWeather)){
				v[i].refreshWeather();
			}
		}
	}

	/**
	 * shows the month view for
	 * Date d
	 * @param d the date of the month to show
	 */
	this.refreshShading = function(){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			if($def(v[i].refreshShading)){
				v[i].refreshShading();
			}
		}
	}

	this.getActiveView = function(){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			if(v[i].isExpandedHuh()){
				return v[i];
			}
		}
		return that.getView("month");
	}


	/**
	 * show the month view for this date
	 */
	this.showMonth = function(dtemp){
		that.showView(dtemp, "month");
	}

	/**
	 * show the week view for this date
	 */
	this.showWeek = function(dtemp){
		that.showView(dtemp, "week");
	}

	/**
	 * show the day view for this date
	 */
	this.showDay = function(dtemp){
		that.showView(dtemp, "day");
	}

	/**
	 * show the list view for this date
	 */
	this.showList = function(dtemp){
		that.showView(dtemp, "list");
	}

	/**
	 * refresh the text on the bar, possibly because
	 * of a settings change, etc
	 */
	this.refresh = function(){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			if(v[i].isExpandedHuh()){
				v[i].refresh();
				that.refreshShading();
				return;
			}
		}
		that.showMonth(that.getCurrentDate());
		that.refreshShading();
	}


	this.fixHeight = function(){
		var $panel = $j(panel);

		if ($panel.parent().length > 0) {
			var inner_height = $panel.height() - that.getHeaderFooterHeight();
			$j(inner).height(inner_height);
			that.getView("month").fixHeight(inner_height);
		}
	}

	/**
	 * we've just now been placed in our parent div, so
	 * adjust height of our holders etc to fit
	 */
	this.init = function(){
		has_init = true;
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			v[i].init(veryinner);
		}
	}

	this.isShowingDay = function(){
		return that.getView("day").isExpandedHuh();
	}

	this.isShowingWeek = function(){
		return that.getView("week").isExpandedHuh();
	}


	this.killYourself = function(){
		control = null;
		for(var i=0;i<views.length;i++){
			views[i].killYourself();
		}
	}


	/******************************************
	 * add default views
	 ******************************************/
	that.addView(month_view);


	/******************************************
	 * listener functions
	 ******************************************/
	this.addListener = function(list){
		listeners.push(list);
	}


	/**
	 * notify everybody else that a drag/drop happened
	 */
	this.notifyStopDrag = function(tevent, dt, left, tp){
		var doneHuh = false;
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			if(v[i].isExpandedHuh() && $def(v[i].stopDrag)){
				doneHuh = v[i].stopDrag(tevent, dt, left, tp);
			}
		}
		if(!doneHuh){
			for(var i=0;i<listeners.length && !doneHuh;i++){
				doneHuh = listeners[i].stopDrag(tevent, dt, left, tp);
			}
		}
		return doneHuh;
	}

	// this is the last day cell that
	// we've hovered over when dragging
	// an event or task
	var hovered_day_cell = null;
	var threadNum = 0;
	this.notifyDragging = function(tevent, dt, left, tp){
		// this function will be called as they drag around an event
		// which means it'll be called probably as its running
		//
		// the threadNum and myThread variables will make sure that
		// I drop out of execution asap as a new thread starts.
		threadNum++;
		var myThread = threadNum;

		// track if we show a drop zone or not
		var zonedHuh = false;

		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			if(v[i].isExpandedHuh()){
				if($def(v[i].dragging)){
					zonedHuh = v[i].dragging(tevent, dt, left, tp);
				}
			}
		}
		if(!zonedHuh){
			for(var i=0;i<listeners.length && !zonedHuh;i++){
				zonedHuh = zonedHuh || listeners[i].dragging(tevent, dt, left, tp);
			}
			if(!zonedHuh){
				control.hideHover();
			}
		}
		return zonedHuh;
	}

	/**
	 * notify listeners that we're zooming to day view
	 */
	this.notifyDayClicked = function(d){
		var foo = new Date();
		foo.setTime(d.getTime());
		for(var i=0;i<listeners.length;i++){
			listeners[i].dayClicked(foo);
		}
	}

	/**
	 * notify listeners that the min/max date for month view
	 * has changed
	 */
	this.notifyTimesChanged = function(mind, maxd){
		for(var i=0;i<listeners.length;i++){
			listeners[i].timesChanged(mind, maxd);
		}
	}


	/**
	 * the user has quick added a task to the calendar/date
	 */
	this.notifyQuickAddTask = function(title, calendar, date){
		for(var i=0;i<listeners.length;i++){
			listeners[i].quickAddTask(title, calendar, date);
		}
	}


	this.filter = function(str){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			if(v[i].isExpandedHuh()){
				if($def(v[i].filter)){
					v[i].filter(str);
				}
			}
		}
	}

	/**
	 * toggle event visibility if
	 * the calendar visibility is switched (ie, in the sidebar)
	 */
	this.calendarVisible = function(calendar, visibleHuh){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			if($def(v[i].calendarVisible)){
				v[i].calendarVisible(calendar, visibleHuh);
			}
		}
		that.refreshShading();
	}

	/******************************************
	 * end listener functions
	 * begin event listener functions
	 ******************************************/


	/**
	 * notify listeners that the user clicked an event
	 */
	this.notifyEventClicked = function(tevent){
		for(var i=0;i<event_listeners.length;i++){
			event_listeners[i].eventClicked(tevent);
		}
	}
    /**
     * notify listeners that the user clicked a task
     */
    this.notifyTaskClicked = function(ttask){
        try{
            for(var i=0;i<event_listeners.length;i++){
                event_listeners[i].taskClicked(ttask);
            }
        }catch(e){
            alert(e);
        }
    }
    /**
     * notify listeners that the user clicked a checkpoint
     */
    this.notifyCheckPointClicked = function(cp){
        try{
            for(var i=0;i<event_listeners.length;i++){
                event_listeners[i].checkPointClicked(cp);
            }
        }catch(e){
            alert(e);
        }
    }

	/**
	 * notify listeners that the user double clicked an event
	 */
	this.notifyEventDblClicked = function(tevent){
		for(var i=0;i<event_listeners.length;i++){
			event_listeners[i].eventDblClicked(tevent);
		}
	}

    /**
     * notify listeners that the user double clicked a task
     */
    this.notifyTaskDblClicked = function(ttask){
        for(var i=0;i<event_listeners.length;i++){
            event_listeners[i].taskDblClicked(ttask);
        }
    }

    /**
     * notify listeners that the user double clicked a task
     */
    this.notifyCheckPointDblClicked = function(cp){
        for(var i=0;i<event_listeners.length;i++){
            event_listeners[i].checkPointDblClicked(cp);
        }
    }

	/**
	 * notify listeners that we want to unselect all the events
	 */
	this.notifyUnselectAll = function(){
		for(var i=0;i<event_listeners.length;i++){
			event_listeners[i].unselectAll();
		}
	}
	/******************************************
	 * end event listener functions
	 ******************************************/

	/******************************************
	 * navlistener functions
	 ******************************************/
	var nav_listeners = new Array();
	this.addNavListener = function(list){
		nav_listeners.push(list);
	}

	this.removeNavListener = function(list){
		for(var i=0;i<nav_listeners.length;i++){
			if(nav_listeners[i] == list){
				nav_listeners.splice(i, 1);
			}
		}
	}

	this.notifyMonthClicked = function(d){
		for(var i=0;i<nav_listeners.length;i++){
			nav_listeners[i].monthClicked(d);
		}
	}

	this.notifyWeekClicked = function(d){
		for(var i=0;i<nav_listeners.length;i++){
			nav_listeners[i].weekClicked(d);
		}
	}

	this.notifyDayClicked = function(d){
		for(var i=0;i<nav_listeners.length;i++){
			nav_listeners[i].dayClicked(d);
		}
	}

	this.notifyListClicked = function(){
		for(var i=0;i<nav_listeners.length;i++){
			nav_listeners[i].listClicked();
		}
	}

	this.notifyAddEventClicked = function(d){
		for(var i=0;i<nav_listeners.length;i++){
			nav_listeners[i].addEventClicked(d);
		}
	}

	this.notifyBackClicked = function(){
		for(var i=0;i<nav_listeners.length;i++){
			nav_listeners[i].backClicked();
		}
	}
	/******************************************
	 * end nav listener functions
	 ******************************************/

	/**
	 * add a listener to listen for event clicks
	 * when an event is clicked, highlight it in
	 * the main view, and unhighlight (if needed)
	 * the previously highlighted event
	 */
	var list = new Object();
	list.eventClicked = function(tevent){
		selected_item = tevent;
	}
	list.eventDblClicked = function(tevent){ }
    list.taskClicked = function(ttask){
        selected_item = ttask;
    }
    list.taskDblClicked = function(ttask){ }
    list.checkPointClicked = function(cp){
        selected_item = cp;
    }
    list.checkPointDblClicked = function(cp){ }
	list.unselectAll = function(){
		selected_item = null;
	}
	this.addEventListener(list);

	/**
	 * unselects teh current event in the view
	 */
	this.unselectAll = function(){
		that.notifyUnselectAll();
	}


	/**
	 * returns teh currently selected event,
	 * or null if none is selected
	 */
	this.getSelectedItem = function(){
		return selected_item;
	}



	//
	// listen to the header
	//
	var head_list = new Object();
	head_list.printClicked = function(thunk, date_thunk){
		return function(){
			thunk(date_thunk());
		}
	}(that.notifyPrintClicked, that.getCurrentDate);
	head_list.leftClicked = function(foo){
		return function(){
			var func = foo();
			func();
		}
	}(getLeftAction);
	head_list.rightClicked = function(foo){ return function(){ var func = foo(); func(); }}(getRightAction);
	head_list.searchByText = function(str){
		var v = that.getAllViews();
		for(var i=0;i<v.length;i++){
			if($def(v[i].filter)){
				v[i].filter(str);
			}
		}
	}
	header.addListener(head_list);




	this.setHeader = function(h){
		panel.removeChild(header.getDOM());
		header.killYourself();
		header = h;
		header.addListener(head_list);
		panel.insertBefore(header.getDOM(), inner);
	}

	this.getHeader = function(){
		return header;
	}

}

// vim:tabstop=4:shiftwidth=4:noexpandtab
