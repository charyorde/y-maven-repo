jive.namespace("AccessCheckApp");jive.AccessCheckApp.AccessCheckSource=jive.RestService.extend(function(a){a.resourceType="container";this.checkAccess=function(b){var c=new jive.conc.Promise();$j.ajax({type:"GET",dataType:"json",contentType:"application/json; charset=utf-8",url:this.RESOURCE_ENDPOINT+"/"+b.objectType+"/"+b.objectID+"/access/"+b.userID,success:function(d,f,e){c.emitSuccess(d)},error:function(f,h,g){try{var e=$j.parseJSON(f.responseText);if(e&&e.error&&e.error.message){c.emitError(e.error.message,e.error.code)}}catch(d){c.emitError(null,f&&f.status)}}});return c}});