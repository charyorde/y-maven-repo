jive.namespace("PredefinedRecos");jive.PredefinedRecos.PredefinedRecoView=$Class.extend({init:function(a){var b=this;$j("#predefined-reco-table").delegate(".remove-reco","click",function(d){var f=$j(this).closest("tr.j-reco-info");var c=f.data("type");var g=f.data("id");b.emitP("remove-reco",c,g).addCallback(function(){f.remove()});d.preventDefault()});$j("#add-reco").click(function(c){var d=$j("#contentURL");b.emitP("add-reco",d.val()).addCallback(function(e){if(e.status){$j(".predefined-reco-error").show().html(e.status).delay(3000).fadeOut(2000)}else{d.val("");$j("#predefined-reco-table tbody").append(jive.admin.recommendations.predefinedRecoRow({objectType:e.objectType,objectID:e.objectID,url:e.url,title:e.title}))}});c.preventDefault()})}});jive.conc.observable(jive.PredefinedRecos.PredefinedRecoView.prototype);