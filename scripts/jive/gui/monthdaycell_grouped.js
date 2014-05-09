/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.gui.MonthDayGroupedCell = function(control, aurora_gui, month_view, dtemp){

    var that = this;

    var jiveprojecttooltip = new JiveProjectTooltip(control.getTaskManager().getProjectID(), "jive-note-checkpoint-body", "jive-note-tasks-body","jive-note-additems-body", "", "", "", "", "", true);

	var tlang = control.getLanguageManager().getActiveLanguage();
	var day = document.createElement('DIV');

	var str = dtemp.getDate();
    var className = "month_day_cell_number no-underline";
    if(dtemp.getDate() == 1){
        str = tlang.shortMonth(dtemp.getMonth()) + " " + str;
        className += " start_month_day_cell_number font-color-notify";
    }



    var tcache = new jive.ext.y.HashTable();
    var cpcache = new jive.ext.y.HashTable();

    var number = document.createElement('SPAN');
	number.getDate = function(dt){ return function(){ return dt;}; }(dtemp);
	number.setAttribute("class",className);
	number.className = className;

	var add_link = document.createElement('SPAN');
	add_link.id = "add_link";
	add_link.setAttribute("class","month_day_cell_number_link");
	add_link.className = "month_day_cell_number_link";
	add_link.appendChild(document.createTextNode("[ + ]"));

	jive.ext.x.xDisplayNone(add_link);
	number.appendChild(add_link);
	number.appendChild(document.createTextNode(str));


    day.appendChild(number);




    var cp_count = 0;
    var cp_count_div = document.createElement('A');
	var cp_divicon = document.createElement('span');
    var cp_divdesc = document.createElement('span');
	cp_count_div.appendChild(cp_divicon);
	cp_divicon.className = "jive-icon-sml jive-icon-checkpoint";
	cp_divicon.setAttribute("class","jive-icon-sml jive-icon-checkpoint");
    cp_count_div.href = "javascript:;"
    cp_count_div.className = "jive-cal-checkpoint jiveTT-hover-checkpoint clearfix";
    cp_count_div.setAttribute("class","jive-cal-checkpoint jiveTT-hover-checkpoint clearfix");
    cp_divdesc.setAttribute("class","j-508");
    day.appendChild(cp_count_div);
    jive.ext.x.xDisplayNone(cp_count_div);

    var task_count = 0;
    var task_count_div = document.createElement('A');
	var task_divicon = document.createElement('span');
	var task_divdesc = document.createElement('span');
	task_count_div.appendChild(task_divicon);
	task_divicon.className = "jive-icon-sml jive-icon-task";
	task_divicon.setAttribute("class","jive-icon-sml jive-icon-task");
    task_count_div.href = "javascript:;"
    task_count_div.className = "jiveTT-hover-tasks no-underline clearfix";
    task_count_div.setAttribute("class","jiveTT-hover-tasks no-underline clearfix");
    task_divdesc.setAttribute("class","j-offscreen");
    day.appendChild(task_count_div);
    jive.ext.x.xDisplayNone(task_count_div);

    var add_div = document.createElement("DIV");
    add_div.href = "javascript:;"
    day.appendChild(add_div);
    jive.ext.x.xDisplayNone(add_div);

    jive.ext.x.xAddEventListener(task_count_div, "mouseover", function(dtemp){
        return function(e){
//            jiveprojecttooltip.getTasksTooltip(dtemp.getTime());

            var dom = jiveprojecttooltip.getDOM();
            while(dom.childNodes.length > 0) dom.removeChild(dom.childNodes[0]);

            var title = document.createElement("strong");
            var taskString = (task_count_div != 1) ? _jive_project_i18n['project.calendar.tasks'] : _jive_project_i18n['project.calendar.task'];
            var taskMan = control.getTaskManager();
            taskMan.dateI18nTask(that.getDate(), function(date) {
                title.appendChild(document.createTextNode(date + " - " + task_count + " " + taskString));
            });
            var ul = document.createElement('UL');

            var tasks = that.getTasks();
            for(var i=0;i<tasks.length;i++){
                var ttask = tasks[i];
                var li = document.createElement('LI');
                li.className = "clearfix";
                li.setAttribute("class","clearfix");
                var avatar = document.createElement('A');
                avatar.className = "jiveTT-hover-user jive-username-link";
                avatar.href = ttask.getAssignedTo().getURL();
                var img = document.createElement('IMG');
                img.className = "jive-avatar";
                img.setAttribute("class","jive-avatar");
                if (ttask.getAssignedTo().getID() > 0) {
                    img.src = CS_BASE_URL + "/people/" + ttask.getAssignedTo().getUsername() + "/avatar/22.png";
                }
                else if(ttask.getAssignedTo().getID() == -12345) {
                    img.src = CS_BASE_URL + "/images/jive-avatar-disabled.png";
                    img.setAttribute("height", 22);
                    img.setAttribute("width", 22);
                }
                else {
                    img.src = CS_BASE_URL + "/people/guest/avatar/22.png";
                }
                avatar.appendChild(img);
                var span = document.createElement('SPAN');
                if (ttask.getAssignedTo().getID() > 0) {
                    var name = document.createElement('A');
                    name.href = ttask.getAssignedTo().getURL();
                    name.className = "jiveTT-hover-user jive-username-link";
                    name.setAttribute("class","jiveTT-hover-user jive-username-link");
                    name.appendChild(document.createTextNode(ttask.getAssignedTo().getFullName()));
                    name.setAttribute("data-userId",ttask.getAssignedTo().getID());
                }
                else {
                    var name = document.createTextNode(ttask.getAssignedTo().getFullName());
                }

                var task = document.createElement('A');
                task.href = ttask.getURL();
                task.className = "j-task-link";
                task.appendChild(document.createTextNode(ttask.getSubject()));
                span.appendChild(name);
                span.appendChild(task);
                li.appendChild(avatar);
                li.appendChild(span);
                ul.appendChild(li);

                if(control.getProjectCache().getProjects()[0].isEditable()){
                    var p = document.createElement('P');
                    p.className = "clearfix";
                    p.task = ttask;

                    var edit = document.createElement('A');
                    edit.href = CS_BASE_URL + "/edit-task!input.jspa?project=" + ttask.getProjectID() + "&task=" + ttask.getID();
                    edit.appendChild(document.createTextNode(_jive_project_i18n['global.edit']));

                    var del = document.createElement('A');
                    del.onclick = function(){jiveControl.getTaskManager().deleteTask(this.parentNode.task.getID(),this.parentNode.task.isParent()); return false;};
                    del.href="javascript:void(0);";
                    del.appendChild(document.createTextNode(_jive_project_i18n['global.delete']));

                    p.appendChild(edit);
                    p.appendChild(del);

                    if(!ttask.isComplete()){
                        var complete = document.createElement('A');
                        complete.onclick = function(){jiveControl.getTaskManager().markTaskComplete(this.parentNode.task.getID(), this.parentNode.task.isParent()); return false;};
                        complete.href="javascript:void(0);";
                        complete.appendChild(document.createTextNode(_jive_project_i18n['project.task.mark.complete']));
                        p.appendChild(complete);
                        if(ttask.getAssignedTo().getID() != control.getUserID() && ttask.getAssignedTo().getID() < 1 && ttask.getAssignedTo().getID() != -12345){
                            var take = document.createElement('A');
                            take.onclick = function(){jiveControl.getTaskManager().takeTask(this.parentNode.task.getID()); return false;};
                            take.href="javascript:void(0);";
                            take.appendChild(document.createTextNode(_jive_project_i18n['project.task.assign.to.me']));
                            p.appendChild(take);
                        }
                    }
                    if(ttask.isComplete()){
                        var incomplete = document.createElement('A');
                        incomplete.onclick = function(){jiveControl.getTaskManager().markTaskInComplete(this.parentNode.task.getID()); return false;};
                        incomplete.href="javascript:void(0);";
                        incomplete.appendChild(document.createTextNode(_jive_project_i18n['task.incomplete.link']));
                        p.appendChild(incomplete);
                    }
                    span.appendChild(p);
                }
            }


            dom.appendChild(title);
            dom.appendChild(ul);
        }
    }(dtemp));

    jive.ext.x.xAddEventListener(cp_count_div, "mouseover", function(dtemp){
        return function(e){
//            jiveprojecttooltip.getTasksTooltip(dtemp.getTime());

            var dom = jiveprojecttooltip.getCheckPointDOM();
            while(dom.childNodes.length > 0) dom.removeChild(dom.childNodes[0]);

            var title = document.createElement("strong");
            var checkpointString = (cp_count != 1) ? _jive_project_i18n['project.calendar.checkpoints'] : _jive_project_i18n['project.calendar.checkpoint'];
            var taskMan = control.getTaskManager();
            taskMan.dateI18nTask(that.getDate(), function(date) {
                title.appendChild(document.createTextNode(date + " - " + cp_count + " " + checkpointString));
            });
            var ul = document.createElement('UL');
            var cps = that.getCheckPoints();

            // need to determine if user can manage checkpoints
            var canCreateCheckPoints = jiveControl.getCheckPointManager().getCanCreate();

            for(var i=0;i<cps.length;i++){
                var cp = cps[i];
                var li = document.createElement('LI');
                li.className = "clearfix";
                var span = document.createElement('DIV');
                var name = document.createElement('STRONG');
                var nameicon = document.createElement('span');
                name.appendChild(nameicon);
                nameicon.className = "jive-icon-med jive-icon-checkpoint";
                nameicon.setAttribute("class","jive-icon-med jive-icon-checkpoint");
                name.appendChild(document.createTextNode(cp.getName()));
                span.appendChild(name);
                if(canCreateCheckPoints){
                    var p = document.createElement('div');
                    p.className = "j-cplink clearfix";

                    var edit = document.createElement('A');
                    edit.href = CS_BASE_URL + "/edit-checkpoint!input.jspa?project=" + cp.getProject().getID() + "&checkPointID=" + cp.getID();
                    edit.appendChild(document.createTextNode(_jive_project_i18n['global.edit']));
                    var del = document.createElement('A');
                    del.href = CS_BASE_URL + "/delete-checkpoint!input.jspa?project=" + cp.getProject().getID() + "&checkPointID=" + cp.getID();
                    del.appendChild(document.createTextNode(_jive_project_i18n['global.delete']));
                    p.appendChild(edit);
                    p.appendChild(del);
                    span.appendChild(p);
                }
                li.appendChild(span);
                ul.appendChild(li);
            }


            dom.appendChild(title);
            dom.appendChild(ul);
        }
    }(dtemp));


    jive.ext.x.xAddEventListener(day, "mouseover", function(dtemp){

        var canCreateCheckPoints = jiveControl.getCheckPointManager().getCanCreate();
        var canCreateTasks = jiveControl.getTaskManager().getCanCreate();
        if(!control.getProjectCache().getProjects()[0].isEditable() || (!canCreateCheckPoints && !canCreateTasks)){
            $j("#jiveTT-note-additems").hide();
            return;
        }
        var dom = jiveprojecttooltip.getCreateLinkDOM();
        while(dom.childNodes.length > 0) {
            dom.removeChild(dom.childNodes[0]);
        }

        var span = document.createElement('div');
        span.id = "jive-note-add-item-body";

        if(canCreateCheckPoints)
        {
            var add_cp_icon = document.createElement('span');
            add_cp_icon.className = "jive-icon-med jive-icon-checkpoint";
            var add_cp_link = document.createElement("A");
            add_cp_link.className = "";
            add_cp_link.href = "#";
            add_cp_link.onclick = function(){jiveControl.getCheckPointManager().addCheckPoint(that.getDate().getTime());return false;};
            add_cp_link.appendChild(document.createTextNode(_jive_project_i18n['project.checkPoint.create.link']))
            span.appendChild(add_cp_icon)
            span.appendChild(add_cp_link);
        }
        if(canCreateTasks)
        {
            var add_task_icon = document.createElement('span');
            add_task_icon.className = "jive-icon-med jive-icon-task";
            var add_task_link = document.createElement("A");
            add_task_link.href = "#";
            add_task_link.onclick = function(){jiveControl.getTaskManager().addTask(that.getDate().getTime());return false};
            add_task_link.appendChild(document.createTextNode(_jive_project_i18n['project.task.create.link']))
            span.appendChild(add_task_icon)
            span.appendChild(add_task_link);
        }
        dom.appendChild(span);
    });

    day.mouseover = function(){
		if(typeof(jive) != "undefined"){
            var dayClass = day.getAttribute("class");
            if(dayClass == null){
                dayClass =="";
            }
            if(control.getProjectCache().getProjects()[0].isEditable()){
                if(dayClass.indexOf("jiveTT-hover-") == -1){
                    day.setAttribute("class", dayClass + " jiveTT-hover-additems");
                    day.className = dayClass + " jiveTT-hover-additems";
                }
            }
			try{
				if(!day.overed){
					day.outColor = day.style.backgroundColor;
				}
				if(!control.isReadOnly() && month_view.getItemVisibility() && month_view.hasAddView()){
					jive.ext.x.xDisplayBlock(add_link);
				}
				day.style.backgroundColor = day.overColor;
				day.overed = true;
			}catch(e){ }
		}
	};
	day.mouseout = function(){
		if(typeof(jive) != "undefined"){
			try{
				jive.ext.x.xDisplayNone(add_link);
				day.style.backgroundColor = day.outColor;
				day.overed = false;
			}catch(e){ }
		}
	};
	day.updateText = function(){
		var tlang = control.getLanguageManager().getActiveLanguage();
		var str = dtemp.getDate();
		if(dtemp.getDate() == 1){
			var add_link = number.childNodes[0];
			str = tlang.shortMonth(dtemp.getMonth()) + " " + str;
			while(number.childNodes.length > 0) number.removeChild(number.childNodes[0]);
			number.appendChild(add_link);
			number.appendChild(document.createTextNode(str));
		}
	};
	day.getDate = function(d){ return function(){ return d; } }(dtemp);
	day.dropPoint = function(tevent, dt){

		if(dt != null){
			var d = new Date();
			d.setTime(day.getDate().getTime());
			d.setHours(dt.getHours());
			d.setMinutes(dt.getMinutes());
			d.setSeconds(dt.getSeconds());
			d.setMilliseconds(dt.getMilliseconds());
			var distance = d.getTime() - dt.getTime();
		}

		if(dt != null && distance != 0 && jive.model.isEvent(tevent)){
			var s = new Date();
			s.setTime(tevent.getStart().getTime());
			var e = new Date();
			e.setTime(tevent.getEnd().getTime());

			var durr = e.getTime() - s.getTime();
			s.setTime(s.getTime() + distance);
			e.setTime(s.getTime() + durr);
			tevent.setStart(s);
			tevent.setEnd(e);

			// when we edit an event, we need to
			// 'confirm' the changes.
			// this fires the eventChanged notice
			// so that the listeners can actually
			// save the change to the DB
			tevent.confirm();
		}else if((dt == null || distance != 0) && jive.model.isTask(tevent)){
			// now change it's time
			if(dt != null){
				var d = new Date();
				d.setTime(tevent.getDueDate().getTime() + distance);
				tevent.setDueDate(d);
			}else{
				var d = new Date();
				d.setTime(day.getDate().getTime());
				tevent.setDueDate(d);
			}

			// when we edit an task, we need to
			// 'confirm' the changes.
			// this fires the eventChanged notice
			// so that the listeners can actually
			// save the change to the DB
			tevent.confirm();
		}
	};

	/**
	 * add a function to the day cell
	 * that lets it add events
	 *
	 * this will add the event into sorted position
	 * into this day cell
	 */
	day.appendTaskDOM = function(txt){
        // cache it.
        tcache.put(txt.getTask().getID(), txt.getTask());

        jive.ext.x.xAddEventListener(task_count_div, "mouseout", jiveprojecttooltip.cancelTooltip);

        task_count++;
        jive.ext.x.xDisplayNone(txt);
        while(task_count_div.childNodes.length > 1) task_count_div.removeChild(task_count_div.childNodes[1]);
        var taskString = (task_count != 1) ? _jive_project_i18n['project.calendar.tasks'] : _jive_project_i18n['project.calendar.task'];
        task_count_div.appendChild(document.createTextNode("" + task_count + ""));
        jive.ext.x.xDisplayBlock(task_count_div);
    };
    this.appendTaskDOM = day.appendTaskDOM;

    day.removeTaskDOM = function(txt){
        tcache.clear(txt.getTask().getID());

        task_count--;
        if(task_count == 0){
            jive.ext.x.xDisplayNone(task_count_div);
        }
    }
    this.removeTaskDOM = day.removeTaskDOM;

    day.getTasks = function(){
        return tcache.toArray(jive.model.isTask);
    }
    this.getTasks = day.getTasks;
    task_count_div.getTasks = that.getTasks;

    day.getCheckPoints = function(){
        return cpcache.toArray(jive.model.isCheckPoint);
    }
    this.getCheckPoints = day.getCheckPoints;
    cp_count_div.getCheckPoints = day.getCheckPoints;

    /**
	 * add a function to the day cell
	 * that lets it add events
	 *
	 * this will add the event into sorted position
	 * into this day cell
	 */
	day.appendEventDOM = function(txt){
		var tevent = txt.getEvent();
		for(var i=0;i<day.childNodes.length;i++){
			if($def(day.childNodes[i].getEvent)){
				if(day.childNodes[i].getEvent().getStart() > tevent.getStart()){
					day.insertBefore(txt, day.childNodes[i]);
					break;
				}
			}
		}
		if(i == day.childNodes.length){
			day.appendChild(txt);
		}
	};


    /**
	 * add a function to the day cell
	 * that lets it add events
	 *
	 * this will add the event into sorted position
	 * into this day cell
	 */
	day.appendCheckPointDOM = function(txt){
        // cache it.
        cpcache.put(txt.getCheckPoint().getID(), txt.getCheckPoint())

        jive.ext.x.xAddEventListener(cp_count_div, "mouseout", jiveprojecttooltip.cancelTooltip);

        cp_count++;
        jive.ext.x.xDisplayNone(txt);
        while(cp_count_div.childNodes.length > 1) cp_count_div.removeChild(cp_count_div.childNodes[1]);
        var checkpointString = (cp_count != 1) ? _jive_project_i18n['project.calendar.checkpoints'] : _jive_project_i18n['project.calendar.checkpoint'];
        cp_count_div.appendChild(document.createTextNode("" + cp_count + ""));
        jive.ext.x.xDisplayBlock(cp_count_div);
	};


    day.countVisibleItems = function(){
        return that.getTasks().length + that.getCheckPoints().length + 1;
    }
    this.countVisibleItems = day.countVisibleItems;

    // listeners

	jive.ext.x.xAddEventListener(add_link, "click", function(aurora_gui, numDOM){ return function(evt){
		aurora_gui.notifyAddEventClicked(numDOM.getDate());
		jive.ext.x.xStopPropagation(evt);
	} }(aurora_gui, number), true);
	jive.ext.x.xAddEventListener(day, "click", function(aurora_gui, numDOM){ return function(){
		aurora_gui.notifyDayClicked(numDOM.getDate());
	} }(aurora_gui, number), false);

	jive.ext.x.xAddEventListener(day, "mouseover", day.mouseover);
	jive.ext.x.xAddEventListener(day, "mouseout", day.mouseout);

	// functions

	this.getDate = day.getDate;

	this.getDOM = function(){
		return day;
	}

}
