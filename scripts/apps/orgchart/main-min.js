jive.namespace("OrgChart");jive.OrgChart.Main=jive.Filters.Main.extend(function(a,c){var b=jive.OrgChart;this.init=function(e){c.init.call(this,e);var d=this;this.orgChartView=new b.OrgChartView();d.relSource=new jive.UserRelationshipSource();d.orgChartView.addListener("create",function(){d.loadPage(d.getState(),true)});d.orgChartView.addListener("retire",function(f){d.relSource.orgRetire(f).addCallback(function(){d.loadPage(d.getState(),true)})});this.orgChartView.addListener("showDirectReports",function(f,g){this.itemSource.getDirectReports({userID:f}).addCallback(function(h){g.emitSuccess(h)})})};a.loadPage=function(f){var e=this.filterGroup.applied(f.filterID),h=e.getRoot(),g,d=this;if(e.some(function(i){return i.simpleName=="OrgChartFilter"})){g=this.itemSource.findAllOrgChart({userID:d.targetUserID});g.addCallback(function(i){d.navView.activate(h.id)});this.orgChartView.update(g);return g}else{return c.loadPage.apply(this,arguments)}}});