define("jive.JAF.Configuration.ServiceBlocks",["jquery"],function(a){return jive.AbstractView.extend(function(b){this.init=function(){this.blocks=a(".app-services-section .j-service-block-alert")};this.validate=function(c){return c(this.blocks)};this.get_services=function(){var c=[];this.blocks.each(function(){var e=a(this).attr("data-serviceid");if(e){c.push({serviceID:e,alias:a(this).attr("data-alias")})}else{var d=a(this).find("input.j-service-radio:checked");if(d){c.push({serviceID:d.attr("data-serviceid"),alias:d.attr("data-alias")})}}});return c}})});