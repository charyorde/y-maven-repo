jive.namespace("admin.conversion.manage");jive.admin.conversion.manage.View=jive.oo.Class.extend(function(b){jive.conc.observable(this);this.init=function d(f){var e=this;$j(document).ready(function(){e.emit("ready")})};b.testObject=[{error:false,errorMessage:null,converting:true,pdfGenerated:true,previewsGenerated:0,previewsTotal:5,thumbnailsGenerated:1,conversionStartedTime:1293064742245,thumbnailsTotal:1,conversionProgressTime:1293064761783}];this.updateInflightList=function a(e){var f=$j("#conversion-table-container");f.empty();f.append($j(jive.admin.conversion.manage.table({conversions:e})))};this.updateErrorList=function c(e){var f=$j("#conversion-error-table-container");f.empty();f.append($j(jive.admin.conversion.manage.errorTable({conversionErrors:e})))}});