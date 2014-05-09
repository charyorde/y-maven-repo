jive.namespace("Onboarding");define("jive.onboarding.Main",["jquery"],function(a){return jive.oo.Class.extend(function(b){this.init=function(d){var c=this;c.resourcesInitialized=false;var e=a.deparam.querystring();if(e.fromQ==856595828||e.fromQ==-1790695889||e.fromQ==-775000491){c.initResources(false,e)}};this.initResources=function(e,d){var c=this;define(["jive.onboarding.BasicsView","jive.onboarding.ExploreView","jive.onboarding.ContributeView","jive.onboarding.Source"],function(i,f,h,g){c.source=new g();c.streamConfigSource=new jive.ActivityStream.BuilderServices();c.basicsView=new i({selector:"#j-basics",questID:856595828,queryParams:d});c.attachViewListeners(c.basicsView);c.exploreView=new f({selector:"#j-explore",questID:-1790695889,queryParams:d});c.attachViewListeners(c.exploreView);c.contributeView=new h({selector:"#j-contribute",questID:-775000491,queryParams:d});c.attachViewListeners(c.contributeView);if(e){c.basicsView.postRender({selector:"#j-basics"});c.exploreView.postRender({selector:"#j-explore",instanceName:c.instanceName});c.contributeView.postRender({selector:"#j-contribute"})}c.resourcesInitialized=true})};this.postPageRender=function(d){var c=this,e=function(g){var f=a(jive.onboarding.onboardingProgress({percentComplete:g.percentComplete}));a("#j-onboarding-progress").replaceWith(f);if(g.percentComplete==100){a("#j-onboarding .j-onb-quest-header .js-hide-onb").show()}};c.instanceName=d.instanceName;c.initResources(true,{});a("div.js-onboarding-tip").remove();jive.switchboard.removeListener("onboarding.state.update",e).addListener("onboarding.state.update",e);a("#j-onboarding").on("click",".js-hide-onb",function(f){f.preventDefault();c.source.setOnboardingVisible(false).addCallback(function(){jive.HomeNav.GlobalController.hideView("onboarding");var g=a(jive.onboarding.postHideViewTip());g.popover({context:a("#j-satNav")});$j("body").one("click",function(){g.trigger("close")})})}).on("click",".js-onb-show-intro-modal",function(f){f.preventDefault();jive.HomeNav.GlobalController.showOnboardingIntroModal(true)})};this.attachViewListeners=function(d){var c=this;d.addListener("getStepData",function(e,f,g){c.source.getStepData(e,f,g)}).addListener("markStepComplete",function(e,f){c.source.markStepComplete(e,f)}).addListener("clearActiveQuest",function(){c.initActiveQuestID()}).addListener("getAllQuestProgressData",function(e){c.source.initializeView().addCallback(function(f){e.emitSuccess(f)})}).addListener("followObjects",function(e,f,g){c.streamConfigSource.manageAssociations(e,{fromQ:"856595828",qstep:f}).addCallback(function(h){g.emitSuccess(h)})}).addListener("updateUserProfile",function(e,f,g){c.source.updateUserProfile(e,f,g)});return c}})});