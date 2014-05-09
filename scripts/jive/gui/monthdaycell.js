jive.gui.MonthDayCell = function(control, aurora_gui, month_view, dtemp){

    var cell = new jive.gui.MonthDayGroupedCell(control, aurora_gui, month_view, dtemp);
    var day = cell.getDOM();


    this.getTasks = day.getTasks;

    /**
	 * add a function to the day cell
	 * that lets it add events
	 *
	 * this will add the event into sorted position
	 * into this day cell
	 */
	day.appendTaskDOM = function(txt){
		var txt_title = txt.getTask().getSubject().toLowerCase();
		for(var i=0;i<day.childNodes.length;i++){
			if($def(day.childNodes[i].getEvent)){
				day.insertBefore(txt, day.childNodes[i]);
				break;
			}else if($def(day.childNodes[i].getTask)){
				if(day.childNodes[i].getTask().getSubject().toLowerCase() > txt_title){
					day.insertBefore(txt, day.childNodes[i]);
					break;
				}
			}
		}
		if(i == day.childNodes.length){
			day.appendChild(txt);
		}
	};
    this.appendTaskDOM = day.appendTaskDOM;

    day.removeTaskDOM = function(txt){
       day.removeChild(txt);
    }
    this.removeTaskDOM = day.removeTaskDOM;

    day.getTasks = function(){
        var cell = day;
        var tasks = new Array();
        for(var i=1; i < cell.childNodes.length; i++){
			if($def(cell.childNodes[i].getTask)){
				tasks.push(cell.childNodes[i].getTask());
			}
		}
		return tasks;
    }

	this.getDOM = function(){
		return day;
	}
}
