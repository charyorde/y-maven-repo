jive.namespace("Theme");define("jive.Theme.Main",["jive.Theme.PaletteCollection","jive.Theme.Favicon","jive.Theme.MenuView","jive.Theme.SaveDialog","jive.Theme.ThemeControls","jive.Theme.CustomHeaderFooter","jive.Theme.ImportExport","jquery"],function(g,h,f,e,a,i,c,d){return function b(x){var u=new g(),p="edit",k=d.fx.off,r=false,s=false,v={customHeaderFooter:new i(u),favicon:new h(u),menu:new f(jive.theme,jive.Theme.getFieldObject),save:new e(jive.theme),themeControls:new a(d("#j-theme-menu"),jive.theme),importExport:new c(u)};var m=function(){u.stopPreview().then(function(){u.refresh().then(function(){d("#j-controls").show();w("disable");s=false;j("off");var y=d("#iframe");y.attr("src",y.data("editUrl")).one("load",function(){w("enable");s=true;w("setMode",["edit"])})})})};var l=function(){d("#j-controls").hide();j("on");p="preview";w("setMode",[p]);var y=d("#iframe");y.attr("src",y.data("previewUrl"))};var j=function(y){if(d.browser.msie&&parseInt(d.browser.version)<8){if(y==="off"){d.fx.off=true}else{if(typeof k==="undefined"){delete d.fx.off}else{d.fx.off=k}}}};var o=function(){if(confirm(jive.theme.unsavedChanges())){if(p==="edit"){q()}else{u.stopPreview().then(q)}}};var q=function(y){r=false;y=y?y:jive.soy.func.normalizeUrl(_jive_base_url,"/");window.location=y};var w=function(z,y){d.each(v,function(B,A){(A[z]||d.noop).apply(A,y||[])})};var n=function(y){u.activate(y);v.favicon.sync()};var t=function(y){v.save.setCustomPaletteNames(u.getCustomPaletteNames()).setPublishedPalette(u.getPublished()).setMode(y).show(u.getActiveName())};jive.dispatcher.listen("showThemingMenu",function(A){if(!s){return}var z={top:0,left:0};if(A.inFrame){z.top=44}v.menu.reset().setAdjustment(z).setCssValues(u.getCssValues()).setMenuId(A.menuId).setOrientation(A.orientation||"below").setReferenceNode(d(this));var y={};if(A.menuId==="themeMenu"){y={currentId:u.getActiveId(),palettes:u.delineateByType(),publishedId:u.getPublishedId()}}else{if(/^(brandingAndDecoration|chrome|logo|mainNavigation|widget)Menu$/.test(A.menuId)){y={paletteID:u.getActiveId()}}else{if(A.menuId==="secondaryNavigationMenu"){y.showCreateMenu=x.createMenuIsEnabled;y.user=d("#iframe").data("navbarDescriptor").user}}}v.menu.setSoyData(y);v.menu.show(A.menuId)});v.themeControls.addListener("cancel",o);v.themeControls.addListener("preview",t.curry("preview"));v.themeControls.addListener("save",t.curry("edit"));v.themeControls.addListener("publish",function(){u.publish().then(q.aritize(0))});v.themeControls.addListener("edit",m);v.save.addListener("save",function(A,z,y){if(y==="preview"){u.startPreview(A).then(l)}else{if(z){u.saveAndPublish(A).then(function(){d(jive.theme.saveAndPublishSuccessMessage()).message({style:"success"});q()})}else{u.save(A).then(function(){r=false;d(jive.theme.saveSuccessMessage()).message({style:"success"})})}}});v.menu.addListener("deleteCssValue",function(y){u.unsetCssValue(y)});v.menu.addListener("updateCssValues",function(y){u.setCssValues(y);v.favicon.sync()});v.menu.addListener("setSkin",n);v.menu.addListener("imageFileReset",function(y){switch(y){case"headerLogo":u.unsetCssValue("headerLogo","headerLogoName","headerLogoUrl");break;case"faviconImage":u.unsetCssValue("faviconImage","faviconImageName","faviconImageUrl");v.favicon.sync();break}});v.menu.addListener("delete",function(y){u.deletePalette(y).then(function(){d(jive.theme.deleteThemeSuccessMessage()).message({style:"success"});v.menu.setSoyData({currentId:u.getActiveId(),palettes:u.delineateByType(),publishedId:u.getPublishedId()}).update()})});jive.dispatcher.listen("showImportExportDialog",function(){v.importExport.showDialog(u.delineateByType().custom)});(function(y){d.when(u.refresh(),y).then(function(){v.favicon.sync();j("off");w("enable");s=true});d("#iframe").on("load.themingUI",y.resolve.bind(y))})(new d.Deferred());u.addListener("cssChange",function(){r=true}).addListener("paletteChange",function(){r=false}).addListener("cssChange",function(){d("#iframe")[0].contentWindow.notify("cssChange")}).addListener("paletteChange",function(){d("#iframe")[0].contentWindow.notify("cssChange")});window.onbeforeunload=function(){return r?jive.theme.unsavedChanges():undefined};d("#iframe").data("palettes",u);return{}}});