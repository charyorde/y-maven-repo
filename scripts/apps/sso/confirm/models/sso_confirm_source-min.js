jive.namespace("sso.confirm");jive.sso.confirm.Model=jive.RestService.extend(function(a){a.resourceType="sso";a.pluralizedResourceType=a.resourceType;this.save=function b(d){var c=this.RESOURCE_ENDPOINT+"/save/";return this.commonAjaxRequest(new jive.conc.Promise(),"POST",{url:c,data:JSON.stringify(d)})}});