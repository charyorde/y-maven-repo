jive.namespace("JAF.Apps");jive.JAF.Apps.Disabled=jive.oo.Class.extend(function(a){this.init=function(d,b){function c(f,g,e){if(e==="javascript:;"){f.preventDefault();$j("<p/>").html(g).message({style:"warn"})}else{window.open(e)}}if(b.disabled){$j(".j-apps-feature-disabled").live("click",function(e){c(e,d.apps_feature_disabled,$j(this).attr("href"))})}else{if(b.anonymous){$j(".jive_macro_appEmbeddedView").live("click",function(e){c(e,d.apps_feature_disabled_for_anonymous,$j(this).attr("href"))})}else{if(b.partner){$j(".jive_macro_appEmbeddedView").live("click",function(e){c(e,d.apps_feature_disabled_for_partners,$j(this).attr("href"))})}}}}});