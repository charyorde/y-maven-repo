/**
 * a task dom, like in day view
 */
jive.gui.TaskDOM = function(control, ttask, clickFunc, dblClickFunc){
	var that = this;


	//
	// these styles are overridden in month view :(
	//
	var holder = document.createElement('A');
	holder.setAttribute("class", "month_day_cell_item");
	holder.className = "month_day_cell_item";

	var title = document.createElement('SPAN');
	title.setAttribute("class", "month_view_day_task_title");
	title.className = "month_view_day_task_title";

	// title
	var tmp_title = ttask.getSubject();
	if(tmp_title.length == 0) tmp_title = "(no title)";
	var n = document.createTextNode(tmp_title);

	// description
	var desc = document.createElement('SPAN');
	desc.setAttribute("class", "month_day_cell_event_desc");
	desc.className = "month_day_cell_event_desc";
	var tmp_desc = "";
	if(jive.util.unescapeHTML(ttask.getDescription()).length > 0){
		tmp_desc = ": " + jive.util.unescapeHTML(ttask.getDescription());
	}
	desc.appendChild(document.createTextNode(tmp_desc));

	//
	//
	// different browsers handle the onClick event differently
	// firefox calls the event AFTER the checked status has changed,
	// but safari calls it BEFORE the checked status has changed.
	//
	// we handle this by maintaining 2 .checked properties.
	// the .checked property is managed by teh browser, and tells if teh
	// checkbox is on/off.
	//
	// the .checkedCache is our internal cache for what the last value was.
	//
	// if .checked == .checkedCache when the click function is called,
	// then we're in safari, and need to toggle both .checked and .checkedCache
	//
	// if .checked != .checkedCache when the click function is called,
	// then we're in firefox, and we only need to update the .checkedCache
	//
	//
	var check = document.createElement('INPUT');
	check.setAttribute("type", "checkbox");
	check.type = "checkbox";
	if(ttask.isComplete()){
		check.checked = true;
		check.checkedCache = true;
	}else{
		check.checkedCache = false;
	}

	jive.ext.x.xAddEventListener(check, "click", function(check, ttask){ return function(e){
		try{
			if(check.checkedCache == check.checked){
				check.checkedCache = !check.checkedCache;
				check.checked = !check.checked;
			}else{
				check.checkedCache = !check.checkedCache;
			}

			if(check.checked){
				ttask.setComplete(true);
			}else{
				ttask.setComplete(false);
			}
			ttask.confirm();
			jive.ext.x.xStopPropagation(e);
		}catch(e){
			alert(e);
		}
	}}(check, ttask));

	holder.appendChild(check);
	title.appendChild(n);
	title.appendChild(desc);
	holder.appendChild(title);

	holder.getTask = function(ttask){ return function(){ return ttask; }; }(ttask);

	holder.setDisabled = function(check){ return function(foo){
		check.disabled = foo;
	}}(check);

	holder.isDisabledHuh = function(check){ return function(){
		return check.disabled;
	}}(check);

	holder.setChecked = function(check){ return function(foo){
		check.checked = foo;
	}}(check);
	holder.isCheckedHuh = function(check){ return function(){
		return check.checked;
	}}(check);


	this.lighten = function(){
		holder.setAttribute("class", "month_day_cell_item month_lighten_dom");
		holder.className = "month_day_cell_item month_lighten_dom";
	}

	this.darken = function(){
		holder.setAttribute("class", "month_day_cell_item");
		holder.className = "month_day_cell_item";
	}

	// this is a hook to update the text on this item
	this.refresh = function(){
		// remove the task title and description
		title.removeChild(title.childNodes[1]);
		title.removeChild(title.childNodes[0]);
		// add it back
		title.appendChild(document.createTextNode(ttask.getSubject()));

		var tmp_desc = "";
		if(jive.util.unescapeHTML(ttask.getDescription()).length > 0) {
			tmp_desc = ": " + jive.util.unescapeHTML(ttask.getDescription());
		}
		desc.removeChild(desc.childNodes[0]);
		desc.appendChild(document.createTextNode(tmp_desc));
		title.appendChild(desc);

		// update the checkbox
		if(ttask.isComplete()){
			holder.setChecked(true);
		}else{
			holder.setChecked(false);
		}
	}

	this.showDescription = function(b){
		if(b){
			jive.ext.x.xDisplayInline(desc);
		}else{
			jive.ext.x.xDisplayNone(desc);
		}
	}

	// set default value
	holder.setChecked(ttask.isComplete());



	jive.ext.x.xAddEventListener(holder, "click", function(clickFunc, ttask, title){
		return function(e){
			clickFunc(ttask);
			jive.ext.x.xStopPropagation(e);
			title.setAttribute("class", "month_view_day_task_title");
			title.className = "month_view_day_task_title";
		}
	}(clickFunc, ttask, title));
	jive.ext.x.xAddEventListener(holder, "dblclick", function(dblClickFunc, ttask, title){
		return function(e){
			dblClickFunc(ttask);
			jive.ext.x.xStopPropagation(e);
			title.setAttribute("class", "month_view_day_task_title");
			title.className = "month_view_day_task_title";
		}
	}(dblClickFunc, ttask, title));


	this.getDOM = function(){
		return holder;
	}

	this.killYourself = function(){
		ttask = null;
        control = null;
    }

	this.getTask = holder.getTask;
	this.setDisabled = holder.setDisabled;
	this.isDisabledHuh = holder.isDisabledHuh;
	this.setChecked = holder.setChecked;
	this.isCheckedHuh = holder.isCheckedHuh;

	/**
	 * will style this dom as highlighted
	 * if b is true
	 * otherwise, it'll style the default style
	 */
	this.setHighlight = function(b){
		if(b){
			holder.setAttribute("class", "month_day_cell_item_highlight");
			holder.className = "month_day_cell_item_highlight";
		}else{
			holder.setAttribute("class", "month_day_cell_item");
			holder.className = "month_day_cell_item";
		}
	}

	/**
	 * set the taskdom as disabled if
	 * we don't have write permission to
	 * its calendar
	 */
	function setProject(proj){
		if(proj == null || proj.isEditable()){
            holder.setDisabled(false);
		}else{
            holder.setDisabled(true);
		}
	}

    if(ttask.getProjectID() == 0){
        setProject(null);
    }else{
        var proj = control.getProjectCache().getProject(ttask.getProjectID());
        if($obj(proj) && proj != null){
            setProject(proj);
        }else{
            var list = new jive.model.ProjectCacheListener();
            list.loadProject = function(proj){
                if(proj.getID() == ttask.getProjectID()){
                    setProject(proj);
                    control.getProjectCache().removeListener(this);
                }
            }
            control.getProjectCache().addListener(list);
        }
    }
}
