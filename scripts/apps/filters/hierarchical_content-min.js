jive.namespace("Filters");jive.Filters.HierarchicalContent=jive.Filters.Main.extend(function(a,c){var b=jive.Filters,d;a.init=function(f){var e=this;e.rootCommunityID=f.rootCommunityID||1;e.rootCommunityType=f.rootCommunityType||14;e.baseSelector=f.baseSelector||"#j-browse-item-grid";e.propNames=f.propNames||[];c.init.apply(this,arguments);this.hierarchyView=new b.SpaceHierarchyView(e.baseSelector,f.extraParams,f.itemViewID,f.omitIcons);this.hierarchyView.addListener("viewSubspaces",function(k,g){var i=k,j=g;if(g==0||(g==e.getState().containerID)){i=d;j=d}else{if(k==e.rootCommunityType&&g==e.rootCommunityID){i=d;j=d}}if(e.browseViewID!="places"){var h=window._jive_base_url+"/places";if(k!=d&&g!=d){h+="?filterID=all~objecttype~space&containerType="+i+"&containerID="+j}else{h+="?filterID=all"}window.location=h}else{e.pushState({containerType:i,containerID:j,filterID:(i!=d&&j!=d)?"all~objecttype~space":"all",start:d})}});this.hierarchyView.addListener("viewSiblings",function(j,k,g,i){var h={containerID:j,propNames:e.propNames};if(k){h=jQuery.extend({start:k},h)}if(g){h=jQuery.extend({end:g},h)}f.itemSource.getSpaceChildren(h).addCallback(function(l){i.emitSuccess(l)})})};a.applyFilters=function(f){var e=this;var g=e.mergeFilters(f);if(!e.hasSpaceFilter(g)){e.pushState({containerType:d,containerID:d,filterID:g,start:d})}else{e.pushState({filterID:g,start:d})}};a.hasSpaceFilter=function(g){for(var e=0;e<g.length;e++){var f=g[e];if(f.indexOf("objecttype~space")>-1){return true}}return false};a.loadPage=function(h,i){var h=$j.extend({propNames:this.propNames},h);var g=c.loadPage.call(this,h,i),f=this.lastDataReadyPromise,e=this;if(f){f.addCallback(function(j){e.hierarchyView.setItemViewID(j.itemViewID)});this.hierarchyView.update(f)}return g};a.saveItemViewSetting=function(e){c.saveItemViewSetting.call(this,e);if(this.browseViewID){this.hierarchyView.setItemViewID(e)}};a.spaceFilterID=function(){var e=this.filterGroup,f=e.applied(this.getState().filterID),g=e.find(function(h){return h.simpleName=="SpaceFilter"&&f.some(function(i){return e.childOf(h,i)})});return g.id}});