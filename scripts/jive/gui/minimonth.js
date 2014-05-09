/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.gui.isMonthEventDOM = function(item){
	return $def(item) && $def(item.getEvent);
}
jive.gui.isMonthTaskDOM = function(item){
	return $def(item) && $def(item.getTask);
}


/**
 * This is a month view that shows the next 2 weeks of dates only
 */
jive.gui.MiniMonthView = function(control, aurora_gui){


	var that = this;

	var expanded = false;


	var has_add_view = null;

	this.hasAddView = function(){
		if(has_add_view == null){
			has_add_view = $obj(aurora_gui.getView("add_event"));
		}
		return has_add_view;
	}

	/**
	 * holds day cells
	 */
	this.dayCells = new jive.ext.y.HashTable();

	/**
	 * holds the spans that hold the event titles
	 * will return an array for a key
	 * the array will hold all of the title spans for that event
	 *
	 * ie, if an event spans the days, it will have an array of 3 spans
	 * one for each day cell
	 */
	this.eventDOMHolders = new jive.ext.y.HashTable();
	this.taskDOMHolders = new jive.ext.y.HashTable();
    this.cpDOMHolders = new jive.ext.y.HashTable();

    /**
	 * set to true if showMonth() should ignore
	 * optimizing by not showing month if the date is the same
	 * as is currently shown.
	 *
	 * ie, set to true to force showMonth to do something
	 * meaningful
	 */
	var force_month_view = false;

	/**
	 * we're also going to cache
	 * the event and task by its calendar id
	 */
	var taskDOMbyCalHolder = new jive.ext.y.HashTable();
	var eventDOMbyCalHolder = new jive.ext.y.HashTable();
    var cpDOMbyCalHolder = new jive.ext.y.HashTable();

    /**
	 * track which calendar id's we're caching each task/event by
	 */
    var task2cal = new jive.ext.y.HashTable();
    var cp2cal = new jive.ext.y.HashTable();
	var event2cal = new jive.ext.y.HashTable();

	/**
	 * this is the main panel that holds all the day cell holders
	 */
	var main_panel = document.createElement('DIV');
	main_panel.setAttribute("class", "month_view_holder");
	main_panel.className = "month_view_holder";


	var visi = true;
	this.setItemVisibility = function(b){
		visi = b;
	}
	this.getItemVisibility = function(){
		return visi;
	}

    function getTaskDOM(ttask){
        var holder = that.taskDOMHolders.get(ttask.getID());

        if($obj(holder) && holder != null){
            holder.refresh();
            return holder;
        }

        var taskdom = new jive.gui.TaskDOM(control, ttask, aurora_gui.notifyTaskClicked, aurora_gui.notifyTaskDblClicked);
        holder = taskdom.getDOM();

        holder.refresh = taskdom.refresh;
        holder.lighten = taskdom.lighten;
        holder.darken = taskdom.darken;
        holder.getTask = taskdom.getTask;

        // we have to forward the killYourself function
        // when this task is unloaded / removed
        holder.killYourself = taskdom.killYourself;

        // make a field to store our parent DOM node
        // it's false b/c we don't have a parent yet.
        holder.myParent = null;

        that.taskDOMHolders.put(ttask.getID(), holder);

        task2cal.put(ttask.getID(), ttask.getProjectID());
        var calHash = taskDOMbyCalHolder.get(ttask.getProjectID());
        if(!$obj(calHash) || calHash == null){
            calHash = new jive.ext.y.HashTable();
            taskDOMbyCalHolder.put(ttask.getProjectID(), calHash);
        }
        calHash.put(ttask.getID(), holder);

        if(that.getItemVisibility()){
            holder.style.visibility = "visible";
        }else{
            holder.style.visibility = "hidden";
        }


        return holder;
    }

    function getCPDOM(cp){

        var holder = that.cpDOMHolders.get(cp.getID());

        if($obj(holder) && holder != null){
            holder.refresh();
            return holder;
        }

        var cpdom = new jive.gui.CPDOM(control, cp, aurora_gui.notifyCheckPointClicked, aurora_gui.notifyCheckPointDblClicked);
        holder = cpdom.getDOM();

        holder.refresh = cpdom.refresh;
        holder.lighten = cpdom.lighten;
        holder.darken = cpdom.darken;
        holder.getCheckPoint = cpdom.getCheckPoint;

        // we have to forward the killYourself function
        // when this task is unloaded / removed
        holder.killYourself = cpdom.killYourself;

        // make a field to store our parent DOM node
        // it's false b/c we don't have a parent yet.
        holder.myParent = null;

        that.cpDOMHolders.put(cp.getID(), holder);

        cp2cal.put(cp.getID(), cp.getProject().getID());
        var calHash = cpDOMbyCalHolder.get(cp.getProject().getID());
        if(!$obj(calHash) || calHash == null){
            calHash = new jive.ext.y.HashTable();
            cpDOMbyCalHolder.put(cp.getProject().getID(), calHash);
        }
        calHash.put(cp.getID(), holder);

        if(that.getItemVisibility()){
            holder.style.visibility = "visible";
        }else{
            holder.style.visibility = "hidden";
        }

        return holder;
    }

    /**
     * private
     * retrieves/creates the day cell for the
     * specified time
     */
    function getDayCell(dt){
        var dtemp = new Date();
        dtemp.setTime(dt.getTime());

        var hash = dtemp.getDate();
        var dobj = that.dayCells.get(hash);
        if($arr(dobj)){
            for(var i=0;i<dobj.length;i++){
                //
                // we already know the date is the same
                // b/c that's teh hash
                if(jive.model.monthYearEQ(dobj[i].getDate(), dtemp)){
                    return dobj[i].getDOM();
                }
            }
        }else{
            dobj = new Array();
            that.dayCells.put(hash, dobj);
        }

        var day = new jive.gui.MonthDayGroupedCell(control, aurora_gui, that, dtemp);
        dobj.push(day);
        return day.getDOM();
    }



	/**********************************************************************
	***********************************************************************
	***********************************************************************
	**
	** BEGIN VIEW INTERFACE TO AURORA GUI
	**
	***********************************************************************
	***********************************************************************
	***********************************************************************/

	/**
	 * return true if we can print this view, false otherwise
	 */
	this.hasPrintView = function(){
		return true;
	}

	/**
	 * this returns true if week view is the current view, false otherwise
	 */
	this.isExpandedHuh = function(){
		return expanded;
	}

	/**
	 * this function is called when week view comes into view
	 * we have officially 'switched' the view to week view
	 */
	this.expand = function(){
		expanded = true;
		aurora_gui.showArrows();
		jive.ext.x.xDisplayBlock(main_panel);
	}

	/**
	 * this function is called when week view goes out of view
	 * we have officially 'switched out' the view from week view
	 */
	this.collapse = function(){
		expanded = false;
		jive.ext.x.xDisplayNone(main_panel);
	}

	// the function to switch to the previous month
	// (used in the previous button)
	function prevMonthFunc(){
		var d = new Date();
		d.setTime(aurora_gui.getCurrentDate().getTime());
		jive.model.dateMinusMonth(d);
		aurora_gui.setCurrentDate(d);
		aurora_gui.notifyMonthClicked(d);
	}
	// the function to switch to the next month
	// (used in the next button)
	function nextMonthFunc(){
		var d = new Date();
		d.setTime(aurora_gui.getCurrentDate().getTime());
		d.setMonth(d.getMonth()+1);
		while(d.getMonth() > aurora_gui.getCurrentDate().getMonth()+1) jive.model.dateMinusDay(d);
		aurora_gui.setCurrentDate(d);
		aurora_gui.notifyMonthClicked(d);
	}

	/**
	 * return the function to go back a month
	 */
	this.getPrevViewFunc = function(){
		// the function to switch to the previous week
		// (used in the previous button)
		return prevMonthFunc;
	}

	/**
	 * return the function to go forward a month
	 */
	this.getNextViewFunc = function(){
		// the function to switch to the next week
		// (used in the next button)
		return nextMonthFunc;
	}

	/**
	 * when this view is in range, calcualte the min date that should be in range
	 * given month view's getCurrentDate() function
	 */
	this.getMinDate = function(){
		return aurora_gui.getMinDate();
	}

	/**
	 * when this view is in range, calcualte the min date that should be in range
	 * given month view's getCurrentDate() function
	 */
	this.getMaxDate = function(){
		return aurora_gui.getMaxDate();
	}

	/**
	 * returns teh text that should be in month view's header
	 * this is based on month_view's getCurrentDate() function
	 */
	this.getHeaderText = function(){
		var lang = control.getLanguageManager().getActiveLanguage();

		var d = new Date();
		d.setTime(aurora_gui.getCurrentDate().getTime());

		return lang.longMonth(d.getMonth());
	}

	/**
	 * shows the month according to month view's current date
	 */
	this.go = function(d){
		aurora_gui.setCurrentDate(d);
		that.showMonth(aurora_gui.getCurrentDate());
	}

	/**
	 * return the name of this view
	 */
	this.getName = function(){
		return "month";
	}

	/**
	 * return the unique hash for this view
	 */
	this.getHash = function(){
		return "month";
	}


	/**
	 * the language has been updated,
	 */
	this.updateText = function(){
		if(main_panel.childNodes.length > 0){
			var start_on = control.getSettingsManager().getStartWeekOn();
			var lang = control.getLanguageManager().getActiveLanguage();
			for(var i=start_on;i-start_on<7;i++){
				var td = main_panel.childNodes[0].childNodes[0].childNodes[(i-start_on)%7]; // the table cell
				if(td.childNodes.length > 0) td.removeChild(td.childNodes[0]);
				td.appendChild(document.createTextNode(lang.longDay(i%7)));
				td.setAttribute("height", "2");
				td.height = "2";
			}
		}
	}

	/**
	 * return the DOM object that represents this month view
	 */
	this.getDOM = function(){
		return main_panel;
	}


	/**
	 * this flushes a calendar entirely. it removes it from teh views,
	 * and also removes any DOM's we have cached for this calendar's
	 * events
	 */
	var filter_time;
	function filterNode(node, str){
		var title;
		var desc;
		var cal_id;
		if($def(node.getEvent)){
			var event = node.getEvent();
			title = event.getSubject().toLowerCase();
			desc = event.getDescription().toLowerCase();
			cal_id = event.getCalendarId();
		}else
		if($def(node.getTask)){
			var task = node.getTask();
			title = task.getSubject().toLowerCase();
			desc = task.getDescription().toLowerCase();
			cal_id = task.getProjectID();
		}
		if(control.isCalendarVisibleHuh(cal_id)){
			if(str.length == 0  || str.length > 0 && (title.indexOf(str) >= 0 || desc.indexOf(str) >= 0)){
//				alert("showing: " + cell.childNodes[i].innerText);
				if(node.darken){
                    node.darken();
                }
			}else{
//				alert("hiding: " + cell.childNodes[i].innerText);
				if(node.lighten){
                    node.lighten();
                }
			}
		}
	}
	var last_filter = "";
	var last_filter_month = (new Date()).getMonth();
	this.filter = function(str){
		//
		// don't bother filtering if it's
		// the same thing we did last time
		if(last_filter != str || last_filter_month != aurora_gui.getCurrentDate().getMonth()){
			last_filter = str;
			last_filter_month = aurora_gui.getCurrentDate().getMonth()
			if(that.isExpandedHuh()){
				filter_time = "" + (new Date()).getTime() + "" + Math.random();
				var my_time = filter_time;
				var dt = new Date();
				var min = aurora_gui.getMinDate();
				var max = aurora_gui.getMaxDate();
				dt.setTime(min.getTime());
				str = str.toLowerCase();
				while(my_time == filter_time && (dt.getTime() < max.getTime() + 24*60*60*1000)){
					var cell = getDayCell(dt);
					for(var i=1; i < cell.childNodes.length; i++){
						filterNode(cell.childNodes[i], str);
					}
					dt.setTime(dt.getTime() + 24*60*60*1000);
				}
			}
		}
	}


	/**
	 * add (or refresh) an event to display on this month view
	 * i need to update this function. its not handling teh drag listeners
	 * correctly. i need to remove old listeners before i add new ones...
	 */
	this.addEvent = function(tevent){
		try{
			var settings = control.getSettingsManager();

			var e_obj = getDOMArray(tevent);



			var iter = new Date();
			if(tevent.isAllDay()){
				iter.setTime(tevent.getStart().getTime());
			}else{
				iter.setTime(settings.adjustDate(tevent.getStart()).getTime());
			}
			var i=0;
			var end_iter = new Date();
			if(tevent.isAllDay()){
				end_iter.setTime(tevent.getEnd().getTime());
			}else{
				end_iter.setTime(settings.adjustDate(tevent.getEnd()).getTime());
			}

			if(jive.model.dateLT(iter, control.getEventCache().getMinTime())){
				// iter is smaller, so change iter to min date
				iter.setTime(control.getEventCache().getMinTime().getTime());
			}
			if(jive.model.dateGT(end_iter, control.getEventCache().getMaxTime())){
				// end_iter is too large, so change end_iter to max date
				end_iter.setTime(control.getEventCache().getMaxTime().getTime());
			}


			while(jive.model.dateLTEQ(iter, end_iter)){
				var d = getDayCell(iter);
				// update the listener
				if($def(control.getDragManager)){
					var dm = control.getDragManager();
					var dragDate = new Date();
					dragDate.setTime(iter.getTime());
					var dlist = new jive.gui.CellDragListener(control, tevent, dragDate, control.notifyStopDrag, control.notifyDragging);
					if($obj(e_obj[i].monthViewDList) && e_obj[i].monthViewDList != null){
						dm.removeDragListener(e_obj[i], e_obj[i].monthViewDList);
					}
					e_obj[i].monthViewDList = dlist;
					dm.enableDrag(e_obj[i]);
					dm.addDragListener(e_obj[i], dlist);
				}
				/**
				 * hide the event if the calendar is hidden
				 */
				if(!control.isCalendarVisibleHuh(tevent.getCalendarId())){
					jive.ext.x.xDisplayNone(e_obj[i]);
				}else{
					jive.ext.x.xDisplayBlock(e_obj[i]);
				}
				var t = aurora_gui.getFilterText();
				filterNode(e_obj[i], t)
				d.appendEventDOM(e_obj[i]);
				// update our parent
				e_obj[i].myParent = d;

				i++;
				iter.setDate(iter.getDate() + 1);

			}
		}catch(e){
			alert("error adding event to month view: " + e);
		}
	}



    /**
     * add a task to display on this month view
     */
    this.addCheckPoint = function(cp){
        try{
            var e_obj = getCPDOM(cp);

            var d = getDayCell(cp.getDueDate());
            d.appendCheckPointDOM(e_obj);
            // update our parent
            e_obj.myParent = d;

            // update text/checkbox
            e_obj.refresh();

            // update the drag listener
            if($def(control.getDragManager)){
                var dm = control.getDragManager();
                var dragDate = new Date();
                dragDate.setTime(ttask.getDueDate());
                var dlist = new jive.gui.CellDragListener(control, ttask, dragDate, control.notifyStopDrag, control.notifyDragging);
                if($obj(e_obj.monthViewDList) && e_obj.monthViewDList != null){
                    dm.removeDragListener(e_obj, e_obj.monthViewDList);
                }
                e_obj.monthViewDList = dlist;
                dm.enableDrag(e_obj);
                dm.addDragListener(e_obj, dlist);
            }


            /**
             * hide the event if the calendar is hidden
             */
            if(!control.isCalendarVisibleHuh(cp.getProject().getID())){
                jive.ext.x.xDisplayNone(e_obj);
            }else{
                jive.ext.x.xDisplayBlock(e_obj);
            }
        }catch(e){
            alert(e);
        }
    }



    /**
	 * add a task to display on this month view
	 */
	this.addTask = function(ttask){
		try{
			var e_obj = getTaskDOM(ttask);

			var d = getDayCell(ttask.getDueDate());
			d.appendTaskDOM(e_obj);
			// update our parent
			e_obj.myParent = d;

			// update text/checkbox
			e_obj.refresh();

			// update the drag listener
			if($def(control.getDragManager)){
				var dm = control.getDragManager();
				var dragDate = new Date();
				dragDate.setTime(ttask.getDueDate());
				var dlist = new jive.gui.CellDragListener(control, ttask, dragDate, control.notifyStopDrag, control.notifyDragging);
				if($obj(e_obj.monthViewDList) && e_obj.monthViewDList != null){
					dm.removeDragListener(e_obj, e_obj.monthViewDList);
				}
				e_obj.monthViewDList = dlist;
				dm.enableDrag(e_obj);
				dm.addDragListener(e_obj, dlist);
			}


			/**
			 * hide the event if the calendar is hidden
			 */
			if(!control.isCalendarVisibleHuh(ttask.getProjectID())){
				jive.ext.x.xDisplayNone(e_obj);
			}else{
				jive.ext.x.xDisplayBlock(e_obj);
			}
		}catch(e){
			alert(e);
		}
	}

	/**
	 * removes an event from the month view
	 *
	 * this removes any drag listeners from span elements
	 * for that event, and disables the drag
	 */
	this.removeEvent = function(tevent){
		try{
			var settings = control.getSettingsManager();
			// i have completed the drag
			// so remove the listener from
			// all of this events listings in month view
			//
			// i'll be added again by the day cell...
			var arr = getDOMArray(tevent, true);
			// var arr = this.eventDOMHolders.get(event.getId());
			if(jive.ext.y.yArr(arr)){
				for(var j=0;j<arr.length;j++){
					if($def(control.getDragManager())){
						/**
						 * if we don't remove the drag listener
						 * then the event will always think it
						 * started dragging on the wrong day
						 * (the same day really, the day the event
						 *  was on when the page loaded)
						 */
						var dm = control.getDragManager();
						dm.removeDragListener(arr[j], arr[j].monthViewDList);
						dm.disableDrag(arr[j]);
					}
					if($obj(jive.ext.x.xParent(arr[j])) && jive.ext.x.xParent(arr[j]) != null){
						jive.ext.x.xParent(arr[j]).removeChild(arr[j]);
						arr[j].myParent = null;
					}else if($obj(arr[j].myParent) && arr[j].myParent != null){
						arr[j].myParent.removeChild(arr[j]);
						arr[j].myParent = null;
					}
					arr[j].killYourself();
				}
			}
		}catch(e){
			alert("error removing event: " + e);
		}
	}

	/**
	 * removes an event from the month view
	 *
	 * this removes any drag listeners from span elements
	 * for that event, and disables the drag
	 */
	this.removeTask = function(ttask){
		try{
			var settings = control.getSettingsManager();

			var arr = getTaskDOM(ttask);
			// var arr = this.eventDOMHolders.get(event.getId());
			if($obj(arr)){
				/**
				 * if we don't remove the drag listener
				 * then the event will always think it
				 * started dragging on the wrong day
				 * (the same day really, the day the event
				 *  was on when the page loaded)
				 */

				if($def(control.getDragManager)){
					// i have completed the drag
					// so remove the listener from
					// all of this events listings in month view
					//
					// i'll be added again by the day cell...
					var dm = control.getDragManager();
					dm.removeDragListener(arr, arr.monthViewDList);
					dm.disableDrag(arr);
				}

				if($obj(jive.ext.x.xParent(arr)) && jive.ext.x.xParent(arr) != null){
					jive.ext.x.xParent(arr).removeChild(arr);
					arr.myParent = null;
				}else if($obj(arr.myParent) && arr.myParent != null){
					arr.myParent.removeChild(arr);
					arr.myParent = null;
				}
				arr.killYourself();
			}
		}catch(e){
			alert("error removing task: " + ttask.getSubject() + "\nexception: " + e);
		}
	}


	/**
	 * this flushes a calendar entirely. it removes it from teh views,
	 * and also removes any DOM's we have cached for this calendar's
	 * events
	 */
	this.flushCalendar = function(cal){
		var events = that.eventDOMHolders.toArray(jive.gui.isMonthEventDOM);
		for(var i=0;i<events.length;i++){
			if(events[i].getEvent().getCalendarId() == cal.getId()){
				that.flushEvent(events[i].getEvent());
			}
		}
		var tasks = that.taskDOMHolders.toArray(jive.gui.isMonthTaskDOM);
		for(var i=0;i<tasks.length;i++){
			if(tasks[i].getTask().getCalendarId() == cal.getId()){
				that.flushTask(tasks[i].getTask());
			}
		}
	}

	/**
	 * this flushes an event entirely. it removes it from the views,
	 * and also removes any DOM's we have cached for that event
	 */
	this.flushEvent = function(tevent){
		try{
			that.removeEvent(tevent);
			that.eventDOMHolders.clear(tevent.getId());
			// also clear it from teh cache by calendar
			var cal_id = event2cal.get(tevent.getId());
			// clear the task from the old calendar cache
			var calHash = eventDOMbyCalHolder.get(cal_id);
			// we don't check for calHash existing here, b/c it must
			// b/c we added it to the cache in the removeEvent() func
			calHash.clear(tevent.getId());
		}catch(e){
			alert("error flushing event");
		}
	}

	/**
	 * this flushes a task entirely. it removes it from the views,
	 * and also removes any DOM's we have cached for that task
	 */
	this.flushTask = function(ttask){
		try{
			that.removeTask(ttask);
			that.taskDOMHolders.clear(ttask.getID());
			// also clear it from teh cache by calendar
			var cal_id = task2cal.get(ttask.getID());
			// clear the task from the old calendar cache
			var calHash = taskDOMbyCalHolder.get(cal_id);
			// we don't check for calHash existing here, b/c it must
			// b/c we added it to the cache in the getTaskDOM() func
			calHash.clear(ttask.getID());
		}catch(e){
			alert("flushEvent: " + e);
		}
	}


	/**
	 * refresh the text on the bar, possibly because
	 * of a settings change, etc
	 */
	this.refresh = function(){
		var settings = control.getSettingsManager();
		var arr = that.eventDOMHolders.toArray(jive.gui.isMonthEventDOM);
		try{
			for(var ri=0;ri<arr.length;ri++){
				//
				// compare the event against the two timezones,
				// and if teh start/end dates are different,
				// the referesh it
				//
				var tevent = arr[ri].getEvent()
				var old = settings.getOldTimezone();
				if(!jive.model.dateEQ(settings.adjustDate(tevent.getStart()), settings.adjustDate(tevent.getStart(), old)) ||
				   !jive.model.dateEQ(settings.adjustDate(tevent.getEnd()), settings.adjustDate(tevent.getEnd(), old))){
					that.flushEvent(tevent);
					that.addEvent(tevent);
				}
			}
		}catch(e){
			alert(e);
		}

		if(that.isExpandedHuh()){
			that.showMonth(aurora_gui.getCurrentDate());
		}
		that.refreshShading();
	}

	/**
	 * we've just now been placed in our parent div, so
	 * adjust height of our holders etc to fit
	 */
	this.init = function(veryinner){
		veryinner.appendChild(main_panel);
	}

	this.killYourself = function(){
		control = null;
		aurora_gui = null;
	}

	this.refreshWeather = function(){
		// loop through all dates in month view
		// and set weather
		var min = new Date();
		min.setTime(aurora_gui.getMinDate().getTime());

		while(jive.model.dateLTEQ(min, aurora_gui.getMaxDate())){

			var cell = getDayCell(min);
			var image = control.getSettingsManager().getWeatherImage(min);
			var color = cell.style.backgroundColor;
			if(image.length > 0){
				var left = 22;
				if(min.getDate() == 1){
					left = 42;
				}else{
					left = 22;
				}
//				cell.setAttribute("style", "background: url(" + image + ") " + left + "px 2px no-repeat " + cell.style.backgroundColor);
				cell.style.background =  "url(" + image + ") " + left + "px 2px no-repeat " + cell.style.backgroundColor;
			}else{
//				cell.setAttribute("style", "");
				cell.style.background =  "";
			}
			cell.style.backgroundColor = color;

			min.setDate(min.getDate() + 1);
		}

	}



	/**
	 * shows the month view for
	 * Date d
	 * @param d the date of the month to show
	 */
	this.refreshShading = function(){
//		if(loading_state == 1){
			// we've just loaded month view for the first time.
			// so no events/tasks are even in here yet, so don't
			// bother updating shading, when there aren't any
			// events/tasks anyways.
			//
//			return;
//		}
		var settings = control.getSettingsManager();
		var start_on = settings.getStartWeekOn();

		var dtemp = new Date();
		dtemp.setTime(aurora_gui.getMaxDate().getTime());

		var dt = new Date();
		dt.setTime(aurora_gui.getMinDate().getTime());

		// daylight savings time has a problem here...
		// so set the hour to 17, that way daylight savings
		// won't change the date by 2 days if we move 24 hours forward/back
		// temp_panel = this.getDayCellHolder(d);
		dt.setHours(17);
		// now set the date to the sunday (before|that) this month starts
		dt.setDate(1);

		var sub = dt.getDay();
		if(start_on != 0 && sub == 0){
			sub = 7;
		}
		dt.setDate(dt.getDate() - sub + start_on);

		// this will help us as we iterate through the days
		// it will keep track of what month the sunday for that
		// month is
		// this way, we can bail on the while loop once we've
		// finished showing this month
		var currMonth = new Date();
		currMonth.setTime(dt.getTime());

		var backgrounds = new Array();
		backgrounds[0] = "#ffffff";
		backgrounds[1] = "#ffffff";
		backgrounds[2] = "#f7f7f7";
		backgrounds[3] = "#CFCFCF";
		backgrounds[4] = "#BFBFBF";

		var now = settings.getNOW();

		var smart_shading = settings.getSmartShading();
		var current_month = aurora_gui.getCurrentDate().getMonth();
		// add all the day cells
		while(currMonth.getMonth() <= dtemp.getMonth() && currMonth.getYear() == dtemp.getYear() || currMonth.getYear() < dtemp.getYear()){
			var cell = getDayCell(dt);
			var dt_is_today = jive.model.dateEQ(dt, now);
			if(smart_shading){
                var true_num = cell.countVisibleItems();

				if(true_num > 1){
					true_num = 2;
				}else if(true_num < 0){
					true_num = 0;
				}
				if(dt_is_today){
					cell.style.backgroundColor = "#e4f6e7";
					cell.outColor = "#e4f6e7";
				}else{
					cell.style.backgroundColor = backgrounds[true_num];
					cell.outColor = backgrounds[true_num];
				}
			}else if(cell.getDate().getMonth() != current_month){
				cell.style.backgroundColor = backgrounds[3];
				cell.outColor = backgrounds[3];
			}else{
				cell.style.backgroundColor = backgrounds[0];
				cell.outColor = backgrounds[0];
			}
			if(dt_is_today){
				cell.style.backgroundColor = "#e4f6e7";
				cell.setAttribute("class", "month_cell month_today_cell");
				cell.className = "month_cell month_today_cell";
				cell.overColor = "#ffffda";
			}else{
				cell.setAttribute("class", "month_cell month_day_cell");
				cell.className = "month_cell month_day_cell";
//				cell.overColor = "#f0f6fc";
				cell.overColor = "#ffffda";
			}

			dt.setDate(dt.getDate() + 1);
			if(dt.getDay() == 0){
				currMonth.setTime(dt.getTime());
			}
		}
		that.refreshWeather();
	}



	/**
	 * toggle event visibility if
	 * the calendar visibility is switched (ie, in the sidebar)
	 */
	this.calendarVisible = function(calendar, visibleHuh){
		var show_tasks_huh = control.getSettingsManager().getShowTasks();
		var objs = taskDOMbyCalHolder.get(calendar.getId());
		if($obj(objs) && objs != null){
			objs = objs.toArray();
			for(var i=0;i<objs.length;i++){
				if(visibleHuh && show_tasks_huh){
					jive.ext.x.xDisplayBlock(objs[i]);
				}else{
					jive.ext.x.xDisplayNone(objs[i]);
				}
			}
		}
		var objs = eventDOMbyCalHolder.get(calendar.getId());
		if($obj(objs) && objs != null){
			objs = objs.toArray();
			for(var i=0;i<objs.length;i++){
				for(var j=0; j<objs[i].length; j++){
					if(visibleHuh){
						jive.ext.x.xDisplayBlock(objs[i][j]);
					}else{
						jive.ext.x.xDisplayNone(objs[i][j]);
					}
				}
			}
		}
		that.refreshShading();
	}

	/**
	 * notify everybody else that a drag/drop happened
	 */
	this.stopDrag = function(tevent, dt, left, top){
		var doneHuh = false;
		if(that.isExpandedHuh()){
			/**
			 * loop through table cells
			 * if a point matches, then drop it in it's day cell
			 */
			if(main_panel.childNodes.length > 0){
				var table = main_panel.childNodes[0];
				for(var i=1;i<table.childNodes.length;i++){
					tr = table.childNodes[i];
					for(var j=0;j<tr.childNodes.length;j++){
						if(tr.childNodes[j].childNodes.length > 0){
							var day = tr.childNodes[j];
							if(jive.ext.x.xHasPoint(day, left, top)){
								if($def(day.dropPoint)){
									day.dropPoint(tevent,dt);
									doneHuh = true;
								}
							}
						}
					}
				}
			}
		}
		return doneHuh;
	}

	// this is the last day cell that
	// we've hovered over when dragging
	// an event or task
	var hovered_day_cell = null;
	var threadNum = 0;
	this.dragging = function(tevent, dt, left, tp){
		// this function will be called as they drag around an event
		// which means it'll be called probably as its running
		//
		// the threadNum and myThread variables will make sure that
		// I drop out of execution asap as a new thread starts.
		threadNum++;
		var myThread = threadNum;

		// track if we show a drop zone or not
		var zonedHuh = false;

		// let's check our currently hovered day cell
		// to see if that's what we're still hovered over.
		// if we're not over the same cell anymore, lets
		// just check each cell sequentially.
		//
		// later, we can optimize this to check nearby cells
		// first, instead of just checking /left->bottom/right
		//
		if(hovered_day_cell != null){
			if(jive.ext.x.xHasPoint(hovered_day_cell, left, tp)){
				var w = Math.floor(.95 * jive.ext.x.xWidth(hovered_day_cell));
				control.showHoverOver(jive.ext.x.xPageX(hovered_day_cell), jive.ext.x.xPageY(hovered_day_cell), w, jive.ext.x.xHeight(hovered_day_cell));
				zonedHuh = true;
			}
		}
		// loop through all dates in month view
		// and set weather
		if(main_panel.childNodes.length > 0 && !zonedHuh){
			var table = main_panel.childNodes[0];
			for(var i=1;i<table.childNodes.length && myThread == threadNum && !zonedHuh;i++){
				tr = table.childNodes[i];
				for(var j=0;j<tr.childNodes.length && myThread == threadNum && !zonedHuh;j++){
					var day = tr.childNodes[j];
					if(jive.ext.x.xHasPoint(day, left, tp)){
						if($def(day.dropPoint)){
							// hooray!
							// move the drag area here
							// and save this cell as
							// the last hovered
							var w = Math.floor(.95 * jive.ext.x.xWidth(day));
							control.showHoverOver(jive.ext.x.xPageX(day), jive.ext.x.xPageY(day), w, jive.ext.x.xHeight(day));
							hovered_day_cell = day;
							zonedHuh = true;
						}
					}
				}
			}
			if(myThread != threadNum){
				return;
			}
		}
		if(!zonedHuh){
			control.hideHover();
		}
		return zonedHuh;
	}


	/**********************************************************************
	***********************************************************************
	***********************************************************************
	**
	** END VIEW INTERFACE TO MONTH_VIEW
	**
	***********************************************************************
	***********************************************************************
	***********************************************************************/

	this.fixHeight = function(for_rows){
		try{
//			alert("updating height: " + for_rows);
			jive.ext.x.xHeight(main_panel, for_rows);
			var for_rows = for_rows - 20; // subtract 20 b/c of the header row
			if(main_panel.childNodes.length > 0){
				var table = main_panel.childNodes[0];
				for_rows += for_rows % (table.childNodes.length - 1);
				for(var i=1;i<table.childNodes.length;i++){
					var tr = table.childNodes[i];
					jive.ext.x.xHeight(tr, Math.floor(for_rows / (table.childNodes.length - 1)));
					if(jive.ext.x.xIE4Up){
//						alert("updating foo!");
						for(var j=0;j<tr.childNodes.length;j++){
							jive.ext.x.xDisplayNone(tr.childNodes[j]);
							jive.ext.x.xDisplayBlock(tr.childNodes[j]);
						}
					}
				}
			}
		}catch(e){
			alert(e);
		}
	}

	/**
	 * gets the events for a specific day
	 * @param dt a date object
	 */
	this.getEventsOn = function(dt){
		// we're going to load the day cell for this event
		// and get the events out of that
		var events = new Array();
		var cell = getDayCell(dt);
		for(var i=1; i < cell.childNodes.length; i++){
			if($def(cell.childNodes[i].getEvent)){
				events.push(cell.childNodes[i].getEvent());
			}
		}
		return events;
	}

	/**
	 * gets the tasks for a specific day
	 * @param dt a Date object
	 */
	this.getTasksOn = function(dt){
		// we're going to load the day cell for this event
		// and get the events out of that
		var tasks = new Array();
		var cell = getDayCell(dt);
		for(var i=1; i < cell.childNodes.length; i++){
			if($def(cell.childNodes[i].getTask)){
				tasks.push(cell.childNodes[i].getTask());
			}
		}
		return tasks;
	}


	/**
	 * gets an array of dom objects for the event
	 * there will be enough dom objects to have 1 per day
	 * that the event spans
	 */
	function getDOMArray(tevent, skip){

		try{
			var settings = control.getSettingsManager();

			//
			// we store 1 DOM entry for each day the event is on
			//
			// however, if the dom entry would extend past teh min or max date
			// in month view, then we only cache the necessary dom entries.
			//
			// so if we're already caching the dom array, then lets make sure
			// that we're caching all of it. it could be that we're caching this months,
			// but we just loaded a whole new month and extended max date, so we need
			// to load in more dom's onto the array.
			//
			// if nothing is in the cache yet, then lets load in enough dom's
			// to either take care of the entire event's duration, or extend
			// until min or max date, whichever is shorter
			//
			//

			var iter = new Date();
			var end_iter = new Date();
			if(tevent.isAllDay()){
				iter.setTime(tevent.getStart().getTime());
				end_iter.setTime(tevent.getEnd().getTime());
			}else{
				iter.setTime(settings.adjustDate(tevent.getStart()).getTime());
				end_iter.setTime(settings.adjustDate(tevent.getEnd()).getTime());
			}

			//
			// iter is the start of the event
			// end_iter is the end of the event
			//
			// now lets make sure that iter >= minDate and end_iter <= maxDate
			//

			if(jive.model.dateLT(iter, control.getEventCache().getMinTime())){
				// iter is smaller, so change iter to min date
				iter.setTime(control.getEventCache().getMinTime().getTime());
			}
			if(jive.model.dateGT(end_iter, control.getEventCache().getMaxTime())){
				// end_iter is too large, so change end_iter to max date
				end_iter.setTime(control.getEventCache().getMaxTime().getTime());
			}
		}catch(e){
			alert("top of getdomarray: " + e);
		}

		try{

			var e_obj = that.eventDOMHolders.get(tevent.getId());
			if(!$obj(e_obj)){
				if($def(skip) && skip){
					return null;
				}
				e_obj = new Array();
				e_obj.getEvent = function(){ return tevent; }
				that.eventDOMHolders.put(tevent.getId(), e_obj);

				event2cal.put(tevent.getId(), tevent.getCalendarId());
				var calHash = eventDOMbyCalHolder.get(tevent.getCalendarId());
				if(!$obj(calHash) || calHash == null){
					calHash = new jive.ext.y.HashTable();
					eventDOMbyCalHolder.put(tevent.getCalendarId(), calHash);
				}
				calHash.put(tevent.getId(), e_obj);
			}

			var i=0;
			while(jive.model.dateLTEQ(iter, end_iter)){
				if(e_obj.length <= i){

					var formatDate = function(d){
						return function(d2){
							var dh = new jive.model.DateHelper(control);
							if(jive.model.dateEQ(settings.adjustDate(d2), d)){
								return dh.formatTo12HourTime(settings.adjustDate(d2));
							}else{
								return dh.formatToShortDate(settings.adjustDate(d2));
							}
						}
					}(iter);

					var txt = control.getEventDOMFactory().getEventDOM(tevent, aurora_gui.notifyEventClicked, aurora_gui.notifyEventDblClicked, formatDate);
					txt.showTimes(false);
					// make a field to store our parent DOM node
					// it's false b/c we don't have a parent yet.
					txt.getDOM().myParent = null;
					txt.getDOM().killYourself = txt.killYourself;
					txt.getDOM().refresh = txt.refresh;
					txt.getDOM().lighten = txt.lighten;
					txt.getDOM().darken = txt.darken;

					txt = txt.getDOM();

					e_obj[i] = txt;
				}else{
					e_obj[i].refresh();
				}

				i++;
				iter.setDate(iter.getDate() + 1);
			}
			while(e_obj.length > i){
				if($obj(jive.ext.x.xParent(e_obj[i])) && jive.ext.x.xParent(e_obj[i]) != null){
					jive.ext.x.xParent(e_obj[i]).removeChild(e_obj[i]);
					e_obj[i].myParent = null;
				}else if($obj(e_obj[i].myParent) && e_obj[i].myParent != null){
					e_obj[i].myParent.removeChild(e_obj[i]);
					e_obj[i].myParent = null;
				}
				e_obj[i].killYourself();
				e_obj.splice(i,1);
			}

			for(var i=0;i<e_obj.length;i++){
				if(that.getItemVisibility()){
					e_obj[i].style.visibility = "visible";
				}else{
					e_obj[i].style.visibility = "hidden";
				}
			}

			return e_obj;
		}catch(e){
			alert("getting array dom in month: " + e);
		}
	}

    var num_weeks = 2;
    this.setNumWeeks = function(foo){
        num_weeks = foo;
    }



    /**
	 * shows the month view for
	 * Date d
	 * @param d the date of the month to show
	 */
	var last_month_min = null;
	var last_month_max = null;

	var loading_state = 0;
	this.showMonth = function(dtemp){
		var settings = control.getSettingsManager();
		var start_on = settings.getStartWeekOn();

		loading_state++;

		expanded = true;

		var d = new Date();
		d.setTime(dtemp.getTime());
		// daylight savings time has a problem here...
		// so set the hour to 17, that way daylight savings
		// won't change the date by 2 days if we move 24 hours forward/back
		// temp_panel = this.getDayCellHolder(d);
		d.setHours(17);
   //     start_on = d.getDay();

        // now set the date to the sunday (before|that) this month starts
//		d.setDate(1);

        start_on = 0;

		var sub = d.getDay();
		if(start_on != 0 && sub == 0){
			sub = 7;
		}
		d.setDate(d.getDate() - sub + start_on);

		// this will help us as we iterate through the days
		// it will keep track of what month the sunday for that
		// month is
		// this way, we can bail on the while loop once we've
		// finished showing this month
		var currMonth = new Date();
		currMonth.setTime(dtemp.getTime());

		var lang = control.getLanguageManager().getActiveLanguage();
		var affectedTasks = new Array();
		if(force_month_view || last_month_min == null || !jive.model.dateEQ(last_month_min, d)){
			force_month_view = false;
			/**
			 * set up the minimum date
			 */
			var currMin = new Date();
			currMin.setTime(d.getTime());
			aurora_gui.setMinDate(currMin);

			// add all the day cells
			var cell;
			var td;
			var tr;
			var table = document.createElement('DIV');
			table.setAttribute("class", "month_table");
			table.className = "month_table";
			while(main_panel.childNodes.length > 0) main_panel.removeChild(main_panel.childNodes[0]);

			tr = document.createElement('DIV');
			table.appendChild(tr);
			jive.ext.x.xHeight(tr, 20);

			for(var i=start_on;i-start_on<7;i++){
				td = document.createElement('DIV');
				tr.appendChild(td);
				td.setAttribute("class", "month_table_th");
				td.className = "month_table_th";
				if(jive.ext.x.xWidth(main_panel) > 640){
					td.appendChild(document.createTextNode(lang.longDay(i%7)));
				}else{
					td.appendChild(document.createTextNode(lang.shortDay(i%7)));
				}
				td.style.left = ((i-start_on) * 14.2857) + "%";
			}

			var rows = new Array();
			var weekday_num = 0;
            for(var i=0;i < num_weeks * 7;i++){
//            while(currMonth.getMonth() <= dtemp.getMonth() && currMonth.getYear() == dtemp.getYear() || currMonth.getYear() < dtemp.getYear()){
				if(d.getDay() == start_on){
					tr = document.createElement('DIV');
					tr.setAttribute("class","month_table_row");
					tr.className = "month_table_row";
					rows.push(tr);
					weekday_num = 0;
				}
				td = getDayCell(d);
				td.updateText();
				td.over = false;
				tr.appendChild(td);
				td.style.left = (weekday_num * 14.2857) + "%";
				weekday_num++;


				var foo = new Date();
				foo.setTime(d.getTime());
				d = foo;
				d.setDate(d.getDate() + 1);
				if(d.getDay() == start_on){
					currMonth.setTime(d.getTime());
				}
				if(jive.ext.x.xIE4Up){
					// IE has a bug where it doesn't preserve checkbox's on/off state
					// so we need to fix it here...
					var tasks = that.getTasksOn(d);
					affectedTasks = affectedTasks.concat(tasks);
				}
			}
			for(var i=0;i<rows.length;i++){
				table.appendChild(rows[i]);
			}
			/**
			 * set up the maximum date
			 */
			aurora_gui.setMaxDate(d);

			var currDate = new Date();
			currDate.setTime(dtemp.getTime());
			currDate.setHours(17);
			aurora_gui.setCurrentDate(currDate);

			var lang = control.getLanguageManager().getActiveLanguage();

//			if(!jive.model.dateLTEQ(last_month_min, aurora_gui.getMinDate()) || !jive.model.dateGTEQ(last_month_max, aurora_gui.getMaxDate())){
//				// refresh the shading
//				that.notifyTimesChanged(aurora_gui.getMinDate(), aurora_gui.getMaxDate());
//			}

			main_panel.appendChild(table);

			for(var i=1;i<table.childNodes.length;i++){
				var tr = table.childNodes[i];
//				if($def(tr.style.height)) tr.style.height = (100/(table.childNodes.length-1) - .1) + "%";
				for(var j=0;j<tr.childNodes.length;j++){
					var cell = tr.childNodes[j];
					if(cell.childNodes.length > 0){
						jive.ext.x.xZIndex(cell.childNodes[0], 10 + i);
					}
				}
			}

			last_month_min = new Date();
			last_month_max = new Date();
			last_month_min.setTime(aurora_gui.getMinDate().getTime());
			last_month_max.setTime(aurora_gui.getMaxDate().getTime());
		}else{
			if(jive.ext.x.xIE4Up){
				while(currMonth.getMonth() <= dtemp.getMonth() && currMonth.getYear() == dtemp.getYear() || currMonth.getYear() < dtemp.getYear()){
					var foo = new Date();
					foo.setTime(d.getTime());
					d = foo;
					d.setDate(d.getDate() + 1);
					if(d.getDay() == start_on){
						currMonth.setTime(d.getTime());
					}
					// IE has a bug where it doesn't preserve checkbox's on/off state
					// so we need to fix it here...
					var tasks = that.getTasksOn(d);
					affectedTasks = affectedTasks.concat(tasks);
				}
			}
			aurora_gui.setMinDate(last_month_min);
			aurora_gui.setMaxDate(last_month_max);
		}

		// IE has a bug where it doesn't preserve checkbox's on/off state
		// so we need to fix it here...
		if(jive.ext.x.xIE4Up){
			for(var i=0;i<affectedTasks.length;i++){
				var dom = getTaskDOM(affectedTasks[i]);
				dom.refresh();
			}
		}
		that.refreshShading();
		var t = aurora_gui.getFilterText();
		that.filter(t);
		aurora_gui.fixHeight();
	}


	/**
	 * unselects teh current event in the view
	 */
	function unselectAll(){
		if(jive.model.isEvent(aurora_gui.getSelectedItem())){
			var e_obj = getDOMArray(aurora_gui.getSelectedItem());
			for(var i=0;i<e_obj.length;i++){
				filterNode(e_obj[i], aurora_gui.getFilterText());
			}
		}
		if(jive.model.isTask(aurora_gui.getSelectedItem())){
			var e_obj = getTaskDOM(aurora_gui.getSelectedItem());
			filterNode(e_obj, aurora_gui.getFilterText());
		}
	}


	function ensureStartDates(){
		var start_on = control.getSettingsManager().getStartWeekOn();
		var dtemp = aurora_gui.getCurrentDate();
		var d = new Date();
		d.setTime(dtemp.getTime());
		// daylight savings time has a problem here...
		// so set the hour to 17, that way daylight savings
		// won't change the date by 2 days if we move 24 hours forward/back
		// temp_panel = this.getDayCellHolder(d);
		d.setHours(17);

		// now set the date to the sunday (before|that) this month starts
		d.setDate(1);
		var sub = d.getDay();
		if(start_on != 0 && sub == 0){
			sub = 7;
		}
		d.setDate(d.getDate() - sub + start_on);

		// this will help us as we iterate through the days
		// it will keep track of what month the sunday for that
		// month is
		// this way, we can bail on the while loop once we've
		// finished showing this month
		var currMonth = new Date();
		currMonth.setTime(dtemp.getTime());


		aurora_gui.setMinDate(d);
		while(currMonth.getMonth() <= dtemp.getMonth() && currMonth.getYear() == dtemp.getYear() || currMonth.getYear() < dtemp.getYear()){
			var foo = new Date();
			foo.setTime(d.getTime());
			d = foo;
			d.setDate(d.getDate() + 1);
			if(d.getDay() == start_on){
				currMonth.setTime(d.getTime());
			}
		}
		var currMax = new Date();
		currMax.setTime(d.getTime());
		currMax.setDate(currMax.getDate() + 1);
		aurora_gui.setMaxDate(currMax);

		var currDate = new Date();
		currDate.setTime(dtemp.getTime());
		currDate.setHours(17);
		aurora_gui.setCurrentDate(currDate);

		last_month_min = new Date();
		last_month_max = new Date();
		last_month_min.setTime(aurora_gui.getMinDate().getTime());
		last_month_max.setTime(aurora_gui.getMaxDate().getTime());

		force_month_view = true;
	}

	function updateShowTasks(){
		// show/hide tasks based on preference
		var show_huh = control.getSettingsManager().getShowTasks();
		if(show_huh){
			// loop through calendars,
			// and if the calendar is visible, then
			// get all the task doms in that calendar
			// and displayBlock
			var cals = control.getCalendarCache().getCalendars();
			for(var i=0;i<cals.length;i++){
				if(control.isCalendarVisibleHuh(cals[i].getId())){
					var calDomHash = taskDOMbyCalHolder.get(cals[i].getId());
					if($obj(calDomHash)){
						// displayBlock everything
						var tasks = calDomHash.toArray();
						for(var j=0; j<tasks.length; j++){
							if($def(tasks[j].getTask)){
								jive.ext.x.xDisplayBlock(tasks[j]);
							}
						}
					}
				}
			}
		}else{
			// displayNone everything
			var tasks = that.taskDOMHolders.toArray(jive.gui.isMonthTaskDOM);
			for(var i=0; i<tasks.length; i++){
				if($def(tasks[i].getTask)){
					jive.ext.x.xDisplayNone(tasks[i]);
				}
			}
		}
	}

	/************************************************
	 * listen to stuff
	 ************************************************/

	/**
	 * add a listener to listen for event clicks
	 * when an event is clicked, highlight it in
	 * the main view, and unhighlight (if needed)
	 * the previously highlighted event
	 */
	var list = new Object();
	list.eventClicked = function(tevent){
		unselectAll();
		// select the event
		var e_obj = getDOMArray(tevent);
		if($obj(e_obj)){
			for(var i=0;i<e_obj.length;i++){
				e_obj[i].setAttribute("class","month_day_cell_item_highlight");
				e_obj[i].className = "month_day_cell_item_highlight";
			}
		}
	}
	list.eventDblClicked = function(tevent){ }
	list.taskClicked = function(ttask){
		unselectAll();
		// select the task
		var e_obj = getTaskDOM(ttask);
		if($obj(e_obj)){
			e_obj.setAttribute("class","month_day_cell_item_highlight");
			e_obj.className = "month_day_cell_item_highlight";
		}
	}
	list.taskDblClicked = function(ttask){ }
	list.unselectAll = function(){
		unselectAll();
	}
	aurora_gui.addEventListener(list);

	/**
	 * listen to event cache
	 * when we load an event, tell the month view
	 */
    var list = new jive.model.ProjectCacheListener();
    list.loadProject = function(p){
        var cps = p.getCheckPoints();
        for(var i=0;i<cps.length;i++){
            that.addCheckPoint(cps[i]);
        }
    }
    control.getProjectCache().addListener(list);




    var list = new jive.model.TaskCacheListener();
	list.loadTask = function(ttask){
		if(ttask.hasDueDate()){
			that.addTask(ttask);
		}
	}
	list.doneLoadingTasks = function(){
		// refresh the shading
		that.refreshShading();
	}
    list.taskChanged = function(ttask){
        // refresh the shading
        that.refreshShading();

    }

	list.savingTask = function(ttask){
		var obj = getTaskDOM(ttask);
		obj.setDisabled(true);
	}
	list.doneSavingTask = function(ttask){
		// refresh the shading
		loading_state++;
		that.refreshShading();
		if(ttask.hasDueDate()){
			var obj = getTaskDOM(ttask);
			obj.refresh();
			obj.setDisabled(false);
		}
		// also, udpate it's cache by calendar id
		var old_cal = task2cal.get(ttask.getID());
		if(old_cal != ttask.getProjectID()){
			// clear the task from the old calendar cache
			var calHash = taskDOMbyCalHolder.get(old_cal);
			calHash.clear(ttask.getID());
			// add it to the correct calendar cache
			var calHash = taskDOMbyCalHolder.get(ttask.getProjectID());
			if(!$obj(calHash) || calHash == null){
				calHash = new jive.ext.y.HashTable();
				taskDOMbyCalHolder.put(ttask.getProjectID(), calHash);
			}
			calHash.put(ttask.getID(), obj);
		}
	}
	list.savingTaskFailed = function(ttask){
		// refresh the shading
		that.refreshShading();
		var obj = getTaskDOM(ttask);
		obj.setDisabled(false);
		obj.setChecked(ttask.getStatus() == "Complete");
	}
	list.deletingTask = function(ttask){
		// refresh the shading
		that.refreshShading();
	}
	list.doneDeletingTask = function(ttask){
		// refresh the shading
		that.refreshShading();
	}
	list.deletingTaskFailed = function(ttask){
		// refresh the shading
		that.refreshShading();
	}
	list.deletingTaskSeries = function(ttask){
		// refresh the shading
		that.refreshShading();
	}
	list.doneDeletingTaskSeries = function(ttask){
		// refresh the shading
		that.refreshShading();
	}
	list.deletingTaskSeriesFailed = function(ttask){
		// refresh the shading
		that.refreshShading();
	}
	control.getTaskCache().addListener(list);
	/*************************************************
	 * last bit of initialization
	 *************************************************/
	ensureStartDates();
	jive.ext.x.xDisplayNone(main_panel);
}

