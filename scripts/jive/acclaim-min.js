if(!jive.acclaim){jive.acclaim=(function(c){var b=jive.conc.observable({}),a=new jive.Activity.Info.Main(),d={showBookmarks:"bookmark",showChildren:"children",showConnections:"connections",showFollowers:"follow",showLikes:"like",showMembers:"membership"};jive.dispatcher.listen(Object.keys(d),function(f,e){f=c.extend({activityType:d[e]},f);delete f.count;delete f.command;var g=c.extend({objectID:f.objectId},f);delete g.objectId;b.emit("beforeFetch",f);a.showUsers(g,0).addCallback(function(h){b.emit("afterFetch",c.extend({totalCount:h.totalCount},f))}).addErrback(function(){b.emit("afterFetch",f)})});return b})(jQuery)};