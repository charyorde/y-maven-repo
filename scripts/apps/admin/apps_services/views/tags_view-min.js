jive.namespace("admin.apps.services");jive.admin.apps.services.TagsView=jive.admin.apps.services.AbstractView.extend(function(a){this.init=function(b,e){var d=this;var c=[];$j(b).each(function(g,f){if($j.inArray(f,e)>=0){c.push({tag:f,checked:true})}else{c.push({tag:f,checked:false})}});this.content=$j(jive.admin.apps.services.tags({tags:c}));this.content.find("input[type='checkbox']").click(function(){if($j(this).is(":checked")){$j(this).closest("li").addClass("checked")}else{$j(this).closest("li").removeClass("checked")}});this.content.find(".jive-form-lookup").click(function(){var f=[];d.content.find("input[type='checkbox']").each(function(h,i){if($j(this).is(":checked")){f.push($j(this).attr("data-tag"))}});var g={selectedTags:f};d.emit("select-tags",g)})};this.getContent=function(){return this.content};this.render=function(){var b=this;$j("#render-tags-div").html("").html(b.getContent()).lightbox_me().show();this.content.find(".jive-form-lookup").addClass("jive-modal-close").addClass("close")}});