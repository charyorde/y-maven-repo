jive.namespace("Filters");jive.Filters.Bookmarked=jive.Filters.Main.extend(function(a,b){this.init=function(d){d.itemGridClass=jive.Filters.BookmarkedItemGridView;b.init.call(this,d);var c=this;jive.switchboard.addListener("bookmark.update",function(e){c.loadPage(c.getState(),true)});jive.switchboard.addListener("bookmark.destroy",function(f){var e=c.getState().filterID;if(e.length>0&&e[0].indexOf("user")===0){c.removeGridItem({id:f.id,type:800})}})}});