jive.namespace("admin.apps.services");jive.admin.apps.services.ServiceSource=jive.oo.Class.extend(function(a){var b=jive.app.url({path:"/api/connects/v1/connectsServices"});a.services=[];a.tag_filter=[];a.unique_tags=[];a.user_filter=0;this.init=function(){var c=this};a.appendTag=function(c){serviceSource=this;if($j.inArray(c,serviceSource.unique_tags)<0){serviceSource.unique_tags.push(c)}};this.create=function(){var c={authStyle:"basic",description:"",displayName:"",documentationURL:"",enabled:true,groups:[-2],headers:[],iconURL:"",id:0,lenient:false,name:"",owners:[],properties:{oauth2AccessTokenURL:"",oauth2AuthenticationURL:"",oauth2ClientID:"",oauth2ClientSecret:"",oauth2RedirectURL:"",oauth2Scope:""},serviceURL:"",tags:[],tags_text:"",users:[],wsdlURL:""};return c};this.findAll=function(f){var c=this;var d=b;var e=true;if(c.getUserFilter()!=0){if(e){d+="?userID="+c.getUserFilter();e=false}else{d+="&userID="+c.getUserFilter()}}$j(c.getTagFilter()).each(function(h,g){if(e){d+="?tag=";e=false}else{d+="&tag="}d+=encodeURI(g)});$j.ajax({success:function(g){c.services=g;$j(c.services).each(function(i,h){c.populate(h)});if(c.unique_tags.length==0){c.loadTags(f,g)}else{f(g)}},url:d})};this.findOne=function(d){var c=null;$j(services).each(function(f,e){if(d==e.id){c=e}});return c};this.getTagFilter=function(){return this.tag_filter};this.getUniqueTags=function(){return this.unique_tags};this.getUserFilter=function(){return this.user_filter};a.loadTags=function(f,e){var c=this;var d=b+"Tags/unique";$j.ajax({success:function(g){c.unique_tags=g;f(e)},url:d})};a.message=function(d){var e=d.responseText;if(e&&e.startsWith("{")){var c=JSON.parse(e);if(c.code&&c.message){return c.message}}return d.statusText};a.populate=function(c){if(!c.description){c.description=""}if(!c.documentationURL){c.documentationURL=""}if(!c.iconURL){c.iconURL=""}if(!c.properties){c.properties={}}if(!c.properties.oauth2AccessTokenURL){c.properties.oauth2AccessTokenURL=""}if(!c.properties.oauth2AuthenticationURL){c.properties.oauth2AuthenticationURL=""}if(!c.properties.oauth2ClientID){c.properties.oauth2ClientID=""}if(!c.properties.oauth2ClientSecret){c.properties.oauth2ClientSecret=""}if(!c.properties.oauth2RedirectURL){c.properties.oauth2RedirectURL=""}if(!c.properties.oauth2Scope){c.properties.oauth2Scope=""}if(!c.tags){c.tags=[]}c.tags_text=c.tags.join(" ");if(!c.wsdlURL){c.wsdlURL=""}};this.remove=function(d,f){var c=this;var e={error:function(i,g){if((i.status==201)||(i.status==204)){f(null)}else{var h=c.message(i);f(h)}},success:function(){c.loadTags(f,null)},type:"DELETE",url:b+"/"+d.id};$j.ajax(e)};this.save=function(d,g){var c=this;var f=Object.toJSON?Object.toJSON(d):JSON.stringify(d);var e={contentType:"application/json",data:f,error:function(j,h){if((j.status==201)||(j.status==204)){c.loadTags(g,null)}else{var i=c.message(j);c.loadTags(g,i)}},processData:false,success:function(i,h,j){if(j.status==201){d.id=i.id}c.loadTags(g,null)},type:"PUT",url:b+"/"+d.id};if(d.id<=0){e.type="POST";e.url=b}$j.ajax(e)};this.setTagFilter=function(c){this.tag_filter=c};a.setUniqueTags=function(c){this.unique_tags=c};a.setUniqueTagsInitialized=function(c){this.unique_tags_initialized=c};this.setUserFilter=function(c){if(c<0){this.user_filter=-1}else{this.user_filter=c}};this.test=function(d,f){var c=this;var e={error:function(i,g){if((i.status==201)||(i.status==204)){f(null)}else{var h=c.message(i);f(h)}},success:function(){f(null)},type:"POST",url:b+"/"+d.id+"/test"};$j.ajax(e)};this.updateEnabled=function(c,e){var d={enabled:c.enabled};if(c.audited){d.audited=c.audited}$j.ajax({contentType:"application/json",data:JSON.stringify(d),processData:false,success:e,type:"PUT",url:b+"/"+c.id+"/state"})}});