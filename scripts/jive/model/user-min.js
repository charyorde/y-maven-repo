jive.model.User=function(){var e=this;var d=new Array();function b(h,i){return function(){h(i)}}this.clearRevertActions=function(){d=new Array()};this.revert=function(){while(d.length>0){d[0]();d.splice(0,1)}};var g;var f;var a;var c;this.getID=function(){return g};this.getUsername=function(){return f};this.getFullName=function(){return a};this.getURL=function(){return c};this.setID=function(h){g=h};this.setUsername=function(h){f=h};this.setFullName=function(h){d.push(b(function(i){a=i},a));a=h};this.setURL=function(h){c=h};this.cleanAfterInit=function(){e.clearRevertActions();e.setID=null;e.setUsername=null;this.setURL=null}};jive.model.UserCache=function(f){var e=this;var b=new jive.ext.y.HashTable();function g(h){var i=b.get(h.getID());if($obj(i)){i.setFullName(h.getFullName());i.clearRevertActions()}else{b.put(h.getID(),h)}e.notifyLoadUser(h)}function a(k){var h=new jive.model.User();for(var i=0;i<k.childNodes.length;i++){if(k.childNodes[i].tagName=="i"){if(k.childNodes[i].childNodes.length>0){h.setID(parseInt(k.childNodes[i].childNodes[0].nodeValue))}}else{if(k.childNodes[i].tagName=="u"){h.setUsername(k.childNodes[i].childNodes[0].nodeValue)}else{if(k.childNodes[i].tagName=="n"){h.setFullName(k.childNodes[i].childNodes[0].nodeValue)}else{if(k.childNodes[i].tagName=="url"){h.setURL(k.childNodes[i].childNodes[0].nodeValue)}}}}}h.cleanAfterInit();g(h);return h}this.loadExternalUser=function(i){e.notifyLoadBegin();try{var h=a(i);e.notifyLoadFinish();return h}catch(j){e.notifyLoadFail()}return null};this.addListener=function(h){d.push(h)};var d=new Array();var c=new Array();this.addListenerAction=function(h){c.push(h)};this.executeListenerActions=function(){while(c.length>0){c[0]();c.splice(0,1)}};this.removeListener=function(j){for(var h=0;h<d.length;h++){if(d[h]==j){d.splice(h,1)}}};this.notifyLoadUser=function(j){for(var h=0;h<d.length;h++){d[h].loadUser(j)}e.executeListenerActions()};this.notifyLoadBegin=function(){for(var h=0;h<d.length;h++){d[h].beginLoadingUsers()}e.executeListenerActions()};this.notifyLoadFinish=function(){for(var h=0;h<d.length;h++){d[h].doneLoadingUsers()}e.executeListenerActions()};this.notifyLoadFail=function(){for(var h=0;h<d.length;h++){d[h].loadingUsersFailed()}e.executeListenerActions()}};