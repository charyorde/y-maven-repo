jive.model.isEvent=function(a){return $obj(a)&&a!=null&&$def(a.getStart)&&$def(a.getEnd)};jive.model.isTask=function(a){return $obj(a)&&a!=null&&$def(a.getDueDate)&&$def(a.getProjectID)};jive.model.Task=function(){var h=this;var j=0;var b=new Array();function a(s,t){return function(){s(t)}}this.clearRevertActions=function(){b=new Array()};this.revert=function(){while(b.length>0){b[0]();b.splice(0,1)}};this.confirm=function(){h.notifyTaskChanged()};var l;var k=j;var r=null;var e;var n;var f;var q;var d;var p;var i;var c;var g=-1;var o=false;this.getID=function(){return l};this.getProjectID=function(){return k};this.getDueDate=function(){return r};this.hasDueDate=function(){return r!=null};this.getSubject=function(){return e};this.getDescription=function(){return n};this.getCreatedBy=function(){return f};this.getCreatedOn=function(){return q};this.getAssignedBy=function(){return p};this.getAssignedTo=function(){return d};this.getURL=function(){return c};this.isComplete=function(){return i};this.getParentTaskID=function(){return g};this.isParent=function(){return o};this.setIsParent=function(s){o=s};this.setParentTaskID=function(s){g=s};this.setID=function(s){l=s};this.setProjectID=function(s){k=s};this.setCreatedBy=function(s){f=s};this.setCreatedOn=function(s){q=s};this.setComplete=function(s){i=s};this.setURL=function(s){c=s};this.setDueDate=function(s){b.push(a(function(t){r=t},r));r=s};this.setSubject=function(s){b.push(a(function(t){e=t},e));e=s};this.setDescription=function(s){b.push(a(function(t){n=t},n));n=s};this.setAssignedBy=function(s){b.push(a(function(t){p=t},p));p=s};this.setAssignedTo=function(s){b.push(a(function(t){d=t},d));d=s};this.cleanAfterInit=function(){h.clearRevertActions();h.setID=null;h.setCreatedBy=null;h.setCreatedOn=null;h.setURL=null};var m=new Array();this.addListener=function(s){m.push(s)};this.removeListener=function(t){for(var s=0;s<m.length;s++){if(m[s]==t){m.splice(s,1)}}};this.notifyTaskChanged=function(){for(var s=0;s<m.length;s++){m[s].taskChanged(h)}}};jive.model.TaskCache=function(d){var f=this;var a=new jive.ext.y.HashTable();function c(){this.taskChanged=function(j){f.notifyTaskChanged(j)}}function e(k){var j=a.get(k.getID());if($obj(j)){j.setDueDate(k.getDueDate());j.setSubject(k.getSubject());j.setDescription(k.getDescription());j.setAssignedTo(k.getAssignedTo());j.setAssignedBy(k.getAssignedBy());j.setParentTaskID(k.getParentTaskID());j.setIsParent(k.isParent());j.clearRevertActions()}else{k.addListener(new c());a.put(k.getID(),k)}f.notifyLoadTask(k)}this.saveTask=function(j){f.notifySavingTask(j);try{var l=d.getSettingsManager();var q=new jive.model.DateHelper(d);var s=d.newAjax(function(u){try{if(u.tagName=="success"){f.notifyDoneSavingTask(j)}else{f.notifySavingTaskFailed(j)}}catch(v){alert(v)}},function(){try{f.notifySavingTaskFailed(j)}catch(u){alert("saving failed: "+u)}});var p=j.getDueDate();p=(p!=null)?q.formatToDateTime(p):"";var m=!j.hasDueDate();var n=j.getStatus();var r=j.getSubject();var t=j.getDescription();var k=j.getProjectID();s.POST(HOSTURL+AJAXPATH+"?save_task","task_id="+encodeURIComponent(j.getID())+"&due="+encodeURIComponent(p)+"&status="+encodeURIComponent(n)+"&title="+encodeURIComponent(r)+"&description="+encodeURIComponent(t)+"&never_due="+encodeURIComponent(m?"1":"0")+"&project_id="+k)}catch(o){f.notifySavingTaskFailed(j)}};function b(p){var m=new Array();for(var n=0;n<p.childNodes.length;n++){var k=new jive.model.Task();var q=p.childNodes[n];for(var l=0;l<q.childNodes.length;l++){if(q.childNodes[l].tagName=="id"){if(q.childNodes[l].childNodes.length>0){k.setID(q.childNodes[l].childNodes[0].nodeValue)}}else{if(q.childNodes[l].tagName=="pid"){if(q.childNodes[l].childNodes.length>0){k.setProjectID(q.childNodes[l].childNodes[0].nodeValue)}}else{if(q.childNodes[l].tagName=="due"){var o=q.childNodes[l].childNodes[0].nodeValue;if(o!=null){k.setDueDate(new Date(o.replace(/-/g,"/")))}else{k.setDueDate(null)}}else{if(q.childNodes[l].tagName=="subj"){k.setSubject(q.childNodes[l].childNodes[0].nodeValue)}else{if(q.childNodes[l].tagName=="desc"){if(q.childNodes[l].childNodes.length>0){k.setDescription(q.childNodes[l].childNodes[0].nodeValue)}}else{if(q.childNodes[l].tagName=="c_on"){var o=q.childNodes[l].childNodes[0].nodeValue;if(o!=null){k.setCreatedOn(new Date(o.replace(/-/g,"/")))}else{k.setCreatedOn(null)}}else{if(q.childNodes[l].tagName=="c_by"){k.setCreatedBy(d.getUserCache().loadExternalUser(q.childNodes[l].childNodes[0]))}else{if(q.childNodes[l].tagName=="a_by"){k.setAssignedBy(d.getUserCache().loadExternalUser(q.childNodes[l].childNodes[0]))}else{if(q.childNodes[l].tagName=="a_to"){k.setAssignedTo(d.getUserCache().loadExternalUser(q.childNodes[l].childNodes[0]))}else{if(q.childNodes[l].tagName=="url"){k.setURL(q.childNodes[l].childNodes[0].nodeValue)}else{if(q.childNodes[l].tagName=="status"){k.setComplete(q.childNodes[l].nodeValue=="c")}else{if(q.childNodes[l].tagName=="parent_task_id"){k.setParentTaskID(q.childNodes[l].childNodes[0].nodeValue)}else{if(q.childNodes[l].tagName=="is_parent"){k.setIsParent(q.childNodes[l].childNodes[0].nodeValue=="true")}}}}}}}}}}}}}}m.push(k);k.cleanAfterInit();e(k)}return m}this.loadExternalTasks=function(k){f.notifyLoadBegin();try{var j=b(k);f.notifyLoadFinish();return j}catch(l){f.notifyLoadFail()}return null};this.addListener=function(j){h.push(j)};var h=new Array();var i=new Array();this.addListenerAction=function(j){i.push(j)};this.executeListenerActions=function(){while(i.length>0){i[0]();i.splice(0,1)}};this.removeListener=function(k){for(var j=0;j<h.length;j++){if(h[j]==k){h.splice(j,1)}}};this.notifyTaskChanged=function(k){for(var j=0;j<h.length;j++){h[j].taskChanged(k)}f.executeListenerActions()};this.notifyLoadTask=function(k){for(var j=0;j<h.length;j++){h[j].loadTask(k)}f.executeListenerActions()};this.notifyLoadBegin=function(){for(var j=0;j<h.length;j++){h[j].beginLoadingTasks()}f.executeListenerActions()};this.notifyLoadFinish=function(){for(var j=0;j<h.length;j++){h[j].doneLoadingTasks()}f.executeListenerActions()};this.notifyLoadFail=function(){for(var j=0;j<h.length;j++){h[j].loadingTasksFailed()}f.executeListenerActions()};var g=new jive.model.TaskCacheListener();g.taskChanged=function(j){f.saveTask(j)};f.addListener(g)};