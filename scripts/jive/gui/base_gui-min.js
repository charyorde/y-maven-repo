jive.gui.BasicGui=function(l){var b=null;var o=new Array();var p=new Array();this.addPriorityEventListener=function(z){p.splice(0,0,z)};this.addEventListener=function(z){p.push(z)};var h=new Date();h.setHours(17);var u=new Date();u.setHours(17);var x=new Date();x.setHours(17);var i=this;var q=false;this.hasInitHuh=function(){return q};var e=document.createElement("DIV");e.className="month_view_very_inner";var m=document.createElement("DIV");m.setAttribute("class","month_view_main");m.className="month_view_main";var s=new jive.gui.SimpleHeader(l);var y=document.createElement("DIV");y.setAttribute("class","month_view_inner");y.className="month_view_inner";var n=true;this.showPrintHuh=function(z){n=z;if(z&&i.getActiveView().hasPrintView()){i.getHeader().showPrintHuh(true)}else{i.getHeader().showPrintHuh(false)}};this.shouldShowPrintHuh=function(){return n};this.setNavFilter=function(z){i.getHeader().setNavFilter(z)};this.showFilterHuh=function(z){i.getHeader().showFilterHuh(z)};this.getFilterText=function(){return i.getHeader().getFilterText()};this.getHeaderFooterHeight=function(){return i.getHeader().getHeight()};var w=function(){};var f=function(){};function d(){return w}function a(){return f}var j=new jive.ext.y.HashTable();this.isViewHuh=function(z){return z!=null&&$obj(z)&&$def(z.isExpandedHuh)};this.addView=function(z){var A=i.getView(z.getName());if(!$obj(A)||A==null){j.put(z.getHash(),z);if(i.hasInitHuh()){z.init(e);z.collapse()}}};this.removeView=function(z){j.clear(z)};this.getAllViews=function(){return j.toArray(i.isViewHuh)};this.getView=function(z){return j.get(z)};this.showView=function(D,C){var A=i.getAllViews();var z=false;for(var B=0;B<A.length;B++){if(A[B].getHash()==C){z=true}}if(!z){return i.showView(D,"month")}for(var B=0;B<A.length;B++){if(A[B].getHash()==C){if(!A[B].isExpandedHuh()){A[B].expand()}if(A[B].hasPrintView()&&n){i.getHeader().showPrintHuh(true)}else{i.getHeader().showPrintHuh(false)}A[B].go(D);i.getHeader().setTitleText(jive.util.escapeHTML(A[B].getHeaderText(D)));w=A[B].getPrevViewFunc();f=A[B].getNextViewFunc();u.setTime(A[B].getMinDate());x.setTime(A[B].getMaxDate());i.notifyTimesChanged(A[B].getMinDate(),A[B].getMaxDate())}else{if(A[B].isExpandedHuh()){A[B].collapse()}}}i.fixHeight()};this.getCurrentDate=function(){var z=new Date();z.setTime(h.getTime());return z};this.setCurrentDate=function(z){h.setTime(z.getTime())};this.notifyPrintClicked=function(A){var B=new Date();B.setTime(A.getTime());for(var z=0;z<o.length;z++){o[z].printClicked(B)}};this.hideArrows=function(){i.getHeader().showArrowsHuh(false)};this.showArrows=function(){i.getHeader().showArrowsHuh(true)};this.ensureMinDate=function(z){if(jive.model.dateLT(z,u)){u.setTime(z.getTime())}};this.ensureMaxDate=function(z){if(jive.model.dateGT(z,x)){x.setTime(z.getTime())}};this.getMinDate=function(){return u};this.setMinDate=function(z){u.setTime(z.getTime())};this.getMaxDate=function(){return x};this.setMaxDate=function(z){x.setTime(z.getTime())};var r=new jive.gui.MiniMonthView(l,i);this.updateText=function(){var A=i.getAllViews();for(var B=0;B<A.length;B++){A[B].updateText()}var z=l.getLanguageManager().getActiveLanguage();i.getHeader().updateText();i.getHeader().setTitleText(jive.util.escapeHTML(i.getActiveView().getHeaderText(i.getCurrentDate())))};m.appendChild(s.getDOM());m.appendChild(y);y.appendChild(e);this.getDOM=function(){return m};this.getEventsOn=function(z){return i.getView("month").getEventsOn(z)};this.getTasksOn=function(z){return i.getView("month").getTasksOn(z)};this.addEvent=function(A){var z=i.getAllViews();for(var B=0;B<z.length;B++){z[B].addEvent(A)}};this.addTask=function(B){var z=i.getAllViews();for(var A=0;A<z.length;A++){z[A].addTask(B)}};this.removeEvent=function(A){var z=i.getAllViews();for(var B=0;B<z.length;B++){z[B].removeEvent(A)}};this.removeTask=function(B){var z=i.getAllViews();for(var A=0;A<z.length;A++){z[A].removeTask(B)}};this.flushCalendar=function(B){var z=i.getAllViews();for(var A=0;A<z.length;A++){z[A].flushCalendar(B)}};this.flushEvent=function(A){var z=i.getAllViews();for(var B=0;B<z.length;B++){z[B].flushEvent(A)}if(jotlet.model.isEvent(b)&&b.getId()==A.getId()){b=null}};this.flushTask=function(B){var z=i.getAllViews();for(var A=0;A<z.length;A++){z[A].flushTask(B)}if(jotlet.model.isTask(b)&&b.getId()==B.getId()){b=null}};this.refreshWeather=function(){var z=i.getAllViews();for(var A=0;A<z.length;A++){if($def(z[A].refreshWeather)){z[A].refreshWeather()}}};this.refreshShading=function(){var z=i.getAllViews();for(var A=0;A<z.length;A++){if($def(z[A].refreshShading)){z[A].refreshShading()}}};this.getActiveView=function(){var z=i.getAllViews();for(var A=0;A<z.length;A++){if(z[A].isExpandedHuh()){return z[A]}}return i.getView("month")};this.showMonth=function(z){i.showView(z,"month")};this.showWeek=function(z){i.showView(z,"week")};this.showDay=function(z){i.showView(z,"day")};this.showList=function(z){i.showView(z,"list")};this.refresh=function(){var z=i.getAllViews();for(var A=0;A<z.length;A++){if(z[A].isExpandedHuh()){z[A].refresh();i.refreshShading();return}}i.showMonth(i.getCurrentDate());i.refreshShading()};this.fixHeight=function(){var A=$j(m);if(A.parent().length>0){var z=A.height()-i.getHeaderFooterHeight();$j(y).height(z);i.getView("month").fixHeight(z)}};this.init=function(){q=true;var z=i.getAllViews();for(var A=0;A<z.length;A++){z[A].init(e)}};this.isShowingDay=function(){return i.getView("day").isExpandedHuh()};this.isShowingWeek=function(){return i.getView("week").isExpandedHuh()};this.killYourself=function(){l=null;for(var z=0;z<j.length;z++){j[z].killYourself()}};i.addView(r);this.addListener=function(z){o.push(z)};this.notifyStopDrag=function(A,C,E,F){var D=false;var z=i.getAllViews();for(var B=0;B<z.length;B++){if(z[B].isExpandedHuh()&&$def(z[B].stopDrag)){D=z[B].stopDrag(A,C,E,F)}}if(!D){for(var B=0;B<o.length&&!D;B++){D=o[B].stopDrag(A,C,E,F)}}return D};var t=null;var c=0;this.notifyDragging=function(B,D,E,F){c++;var A=c;var G=false;var z=i.getAllViews();for(var C=0;C<z.length;C++){if(z[C].isExpandedHuh()){if($def(z[C].dragging)){G=z[C].dragging(B,D,E,F)}}}if(!G){for(var C=0;C<o.length&&!G;C++){G=G||o[C].dragging(B,D,E,F)}if(!G){l.hideHover()}}return G};this.notifyDayClicked=function(A){var B=new Date();B.setTime(A.getTime());for(var z=0;z<o.length;z++){o[z].dayClicked(B)}};this.notifyTimesChanged=function(B,A){for(var z=0;z<o.length;z++){o[z].timesChanged(B,A)}};this.notifyQuickAddTask=function(C,B,z){for(var A=0;A<o.length;A++){o[A].quickAddTask(C,B,z)}};this.filter=function(B){var z=i.getAllViews();for(var A=0;A<z.length;A++){if(z[A].isExpandedHuh()){if($def(z[A].filter)){z[A].filter(B)}}}};this.calendarVisible=function(C,B){var z=i.getAllViews();for(var A=0;A<z.length;A++){if($def(z[A].calendarVisible)){z[A].calendarVisible(C,B)}}i.refreshShading()};this.notifyEventClicked=function(z){for(var A=0;A<p.length;A++){p[A].eventClicked(z)}};this.notifyTaskClicked=function(A){try{for(var z=0;z<p.length;z++){p[z].taskClicked(A)}}catch(B){alert(B)}};this.notifyCheckPointClicked=function(B){try{for(var z=0;z<p.length;z++){p[z].checkPointClicked(B)}}catch(A){alert(A)}};this.notifyEventDblClicked=function(z){for(var A=0;A<p.length;A++){p[A].eventDblClicked(z)}};this.notifyTaskDblClicked=function(A){for(var z=0;z<p.length;z++){p[z].taskDblClicked(A)}};this.notifyCheckPointDblClicked=function(A){for(var z=0;z<p.length;z++){p[z].checkPointDblClicked(A)}};this.notifyUnselectAll=function(){for(var z=0;z<p.length;z++){p[z].unselectAll()}};var g=new Array();this.addNavListener=function(z){g.push(z)};this.removeNavListener=function(A){for(var z=0;z<g.length;z++){if(g[z]==A){g.splice(z,1)}}};this.notifyMonthClicked=function(A){for(var z=0;z<g.length;z++){g[z].monthClicked(A)}};this.notifyWeekClicked=function(A){for(var z=0;z<g.length;z++){g[z].weekClicked(A)}};this.notifyDayClicked=function(A){for(var z=0;z<g.length;z++){g[z].dayClicked(A)}};this.notifyListClicked=function(){for(var z=0;z<g.length;z++){g[z].listClicked()}};this.notifyAddEventClicked=function(A){for(var z=0;z<g.length;z++){g[z].addEventClicked(A)}};this.notifyBackClicked=function(){for(var z=0;z<g.length;z++){g[z].backClicked()}};var v=new Object();v.eventClicked=function(z){b=z};v.eventDblClicked=function(z){};v.taskClicked=function(z){b=z};v.taskDblClicked=function(z){};v.checkPointClicked=function(z){b=z};v.checkPointDblClicked=function(z){};v.unselectAll=function(){b=null};this.addEventListener(v);this.unselectAll=function(){i.notifyUnselectAll()};this.getSelectedItem=function(){return b};var k=new Object();k.printClicked=function(A,z){return function(){A(z())}}(i.notifyPrintClicked,i.getCurrentDate);k.leftClicked=function(z){return function(){var A=z();A()}}(d);k.rightClicked=function(z){return function(){var A=z();A()}}(a);k.searchByText=function(B){var z=i.getAllViews();for(var A=0;A<z.length;A++){if($def(z[A].filter)){z[A].filter(B)}}};s.addListener(k);this.setHeader=function(z){m.removeChild(s.getDOM());s.killYourself();s=z;s.addListener(k);m.insertBefore(s.getDOM(),y)};this.getHeader=function(){return s}};