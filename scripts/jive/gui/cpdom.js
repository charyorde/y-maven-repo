/**
 * a task dom, like in day view
 */
jive.gui.CPDOM = function(control, cp, clickFunc, dblClickFunc){
	var that = this;


	//
	// these styles are overridden in month view :(
	//
	var holder = document.createElement('DIV');
	holder.setAttribute("class", "jive-link-checkpoint jiveTT-hover-checkpoint");
	holder.className = "jive-link-checkpoint jiveTT-hover-checkpoint";

	var title = document.createElement('SPAN');

	// title
	var tmp_title = cp.getName();
	if(tmp_title.length == 0) tmp_title = "(no title)";
	var n = document.createTextNode(tmp_title);

	// description
	var desc = document.createElement('SPAN');
	desc.setAttribute("class", "month_day_cell_event_desc");
	desc.className = "month_day_cell_event_desc";
	var tmp_desc = "";
	if(jive.util.unescapeHTML(cp.getDescription()).length > 0){
		tmp_desc = ": " + jive.util.unescapeHTML(cp.getDescription());
	}
	desc.appendChild(document.createTextNode(tmp_desc));

	title.appendChild(n);
	title.appendChild(desc);
	holder.appendChild(title);

	holder.getCheckPoint = function(cp){ return function(){ return cp; }; }(cp);

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
		title.appendChild(document.createTextNode(cp.getName()));

		var tmp_desc = "";
		if(jive.util.unescapeHTML(cp.getDescription()).length > 0){
			tmp_desc = ": " + jive.util.unescapeHTML(cp.getDescription());
		}
		desc.removeChild(desc.childNodes[0]);
		desc.appendChild(document.createTextNode(tmp_desc));
		title.appendChild(desc);
	}

	this.showDescription = function(b){
		if(b){
			jive.ext.x.xDisplayInline(desc);
		}else{
			jive.ext.x.xDisplayNone(desc);
		}
	}

	jive.ext.x.xAddEventListener(holder, "click", function(clickFunc, cp, title){
		return function(e){
			clickFunc(cp);
			jive.ext.x.xStopPropagation(e);
			title.setAttribute("class", "month_view_day_task_title");
			title.className = "month_view_day_task_title";
		}
	}(clickFunc, cp, title));
	jive.ext.x.xAddEventListener(holder, "dblclick", function(dblClickFunc, cp, title){
		return function(e){
			dblClickFunc(cp);
			jive.ext.x.xStopPropagation(e);
			title.setAttribute("class", "month_view_day_task_title");
			title.className = "month_view_day_task_title";
		}
	}(dblClickFunc, cp, title));


	this.getDOM = function(){
		return holder;
	}

	this.killYourself = function(){
		cp = null;
        control = null;
    }

	this.getCheckPoint = holder.getCheckPoint;

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

}
