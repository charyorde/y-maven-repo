jive.namespace("Move.Content");jive.Move.Content.CapabilitiesSource=jive.NestedRestService.extend(function(a,b){a.resourceType="capability";a.init=function(c){b.init.call(this,c);this.pluralizedResourceType="capabilities";this.RESOURCE_ENDPOINT=jive.rest.url("/"+["content",this.parentType,this.parentID,this.pluralizedResourceType].join("/"));this.POST_RESOURCE_ENDPOINT=this.RESOURCE_ENDPOINT}});