jive.namespace("Navbar.Menu.Apps.Dashboards");jive.Navbar.Menu.Apps.Dashboards.Main=jive.Navbar.Menu.Main.extend(function(a,c){var b=jive.Navbar.Menu.Apps.Dashboards;this.init=function(e,g,f){c.init.call(this,e,g,f);var d=this;jive.switchboard.addListener("dashboard.create",function(h){d.listView.toggleButton(h.count);d.invalidate()});jive.switchboard.addListener("dashboard.edit",function(h){d.invalidate()});jive.switchboard.addListener("dashboard.destroy",function(h){d.listView.toggleButton(h.count);d.invalidate()});jive.switchboard.addListener("dashboard.reorder",function(h){d.invalidate()})};this.buildListView=function(d,f,e){return new b.ListView(d,f,e)};this.buildItemSource=function(){return new jive.AppDashboardSource()}});