jive.Validator=jive.oo.Class.extend(function(a){var b=jQuery;this.init=function(d){var f="content.validation";this.options=b.extend({form:null,validator:this.validator,onSuccess:this.onSuccess,keys:{any:f+".any",email:f+".email",number:f+".number",url:f+".url",max:f+".max",min:f+"min",required:f+".required"}},d);var c=this;var e=function(h){var g=b(this);if(g.attr("formaction")){c.options.form.data("formaction",g.attr("formaction"))}if(g.attr("formnovalidate")!=undefined){c.options.form.data("formnovalidate",true)}if(g.attr("formenctype")){c.options.form.data("formenctype",g.attr("formenctype"))}if(g.attr("formmethod")){c.options.form.data("formmethod",g.attr("formmethod"))}if(g.attr("data-submit-id")){c.options.form.data("submit-id",g.attr("data-submit-id"))}};c.options.form.find("input[type=submit]").live("click",e);c.options.form.find("button[type=submit]").live("click",e);c.getValidator();c.options.form.submit(function(g){if(!c.options.form.data().formnovalidate){if(!c.getValidator().checkValidity()){g.preventDefault()}}setTimeout(function(){c.options.form.removeData("formaction");c.options.form.removeData("formnovalidate");c.options.form.removeData("formenctype");c.options.form.removeData("formmethod");c.options.form.removeData("submit-id")},100)});b.tools.validator.localize("jive",{"*":"any",":email":"email",":number":"number",":url":"url","[max]":"max","[min]":"min","[required]":"required"});b.tools.validator.addEffect("jive",function(h,g){b.each(h,function(l,k){var j=k.input;j.prev(".jive-error-message").remove();var i=k.messages[0];var m=jive.i18n.getMsg(i)!=i;var o;if(m){o=jive.i18n.getMsg(i)}else{o=j.data(i)||jive.i18n.getMsg(c.options.keys[i])||i}var p=b(jive.error.form.fieldError({msg:o}));j.before(p);var n=j.closest("form");j.parentsUntil(n,":hidden").show();if(l==0){b.scrollTo(p,800)}})},function(g){g.prev(".jive-error-message").remove()})};this.getValidator=function(){var c=this.options.form.find(":input").data("validator");if(c){c.destroy({})}this.options.form.find(":input").validator({lang:"jive",position:"top left",messageClass:"jive-field-error",inputEvent:"change",effect:"jive",formEvent:null});return this.options.form.find(":input").data("validator")}});