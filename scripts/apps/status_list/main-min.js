jive.app("StatusList");jive.StatusList.Main=function(f){var p=new jive.StatusList.ActivityView(f.activityContainer,f),r,m=Object.create(f.initialState),b=f.filterTabRssMap,q=f.wallEntryTypeID,e=f.listActionUrl,u=f.listCommentsActionUrl,g=f.canComment,t=f.canCreateImage,j=f.i18n,i=f.newEntryPollPeriod,h=0,l="",o=$j(f.activityContainer).parent().parent().attr("id").split("_")[1];function s(v){$j.post(jive.rest.url("/wall/tab"),{tab:v,widgetID:o})}function d(v){$j.post(jive.rest.url("/wall/filter"),{type:v,widgetID:o})}function a(w,x){var v=b[w][x];p.rssSource(v)}function k(w){var v=$j.extend(w,{zeroItem:l});return new jive.WidgetPager(f.activityContainer,$j.extend({},f,{initialState:v}))}function n(){p.loading();$j.ajax({url:e,type:"GET",dataType:"html",data:$j.extend({zeroItem:l},m),success:function(v){p.html(v);a(m.activityFilterValue,m.wallView);jive.Wall.Main.bindComments(q,{canComment:g,canCreateImage:t,i18n:j});jive.Wall.RepostHelper.bindRepostAnchors({canComment:g,canCreateImage:t,i18n:j});l=$j(v).find("[name=zeroItem]").val();r=k(m);if(h!=0){clearInterval(h)}h=setInterval(c,i)}})}jive.Wall.Main.bindRowHover();p.addListener("filter",function(v){m.activityFilterValue=v;n();d(m.activityFilterValue)}).addListener("tabSwitch",function(v){m.wallView=v;n();s(m.wallView)});jive.Wall.Main.bindRepostAndComments(q,u);p.switchTo(m.wallView);function c(){$j.ajax({url:jive.rest.url("/wall/new/count"),type:"POST",dataType:"json",data:'{"count": {"tabName": "'+m.wallView+'","filterType": "'+m.activityFilterValue+'", "widgetID": '+o+"} }",contentType:"application/json",success:function(v){if(v==null){return false}p.updateNewEntryCount(v.count["newEntryCount"],v.count["mentionCount"])},error:function(v){if(v.status==401||v.status==403){clearInterval(h)}}})}};