$j(function(){$j("#jive-custom-tab a").click(function(){$j("#default-tab").hide();$j("#custom-tab").show();$j("#jive-custom-tab").addClass("jive-body-tabcurrent active");$j("#jive-browse-tab").removeClass("jive-body-tabcurrent active")});$j("#jive-browse-tab a").click(function(){$j("#default-tab").show();$j("#custom-tab").hide();$j("#jive-browse-tab").addClass("jive-body-tabcurrent active");$j("#jive-custom-tab").removeClass("jive-body-tabcurrent active")})});$j(function(){function d(g){g.lightbox_me({closeSelector:".jive-close",onClose:function(){g.remove()}})}function c(i,j,g){var h=$j(i);if(!h.hasClass("jive-modal-confirm")){return false}$j("body").append(h);h=$j(".jive-modal-confirm");d($j(".jive-modal-confirm"));h.find("form").ajaxForm({success:function(k){$j(".jive-modal-confirm").find("a.jive-close").click();j(k)},error:g});return true}$j("#custom-tab .create-link").click(function(){b("");return false});function b(g){$j.ajax({url:__configureAdvancedPermissionsUrl,data:g,success:f})}function f(g){$j("body").append(g);d($j("#advanced-perms"));$j("#advanced-perms-form").ajaxForm({success:a,beforeSubmit:e})}function e(k,g){var j=false;for(var h=0;h<k.length;h++){j=k[h].name=="method:cancel";if(j){break}}if(j){$j("#advanced-perms").find("a.jive-close").click();return false}else{g.find(":submit").prop("disabled",true).blur();return true}}function a(h){if($j(h).attr("id")=="advanced-perms"){$j("#advanced-perms-form").replaceWith($j("#advanced-perms-form",h));$j("#advanced-perms-form").ajaxForm({success:a});var g=$j(".jive-field-error:first").focus();$j.scrollTo(g,{offset:{top:-60}})}else{$j("#advanced-perms").find("a.jive-close").click();$j("#empty").slideUp();$j("#custom-permlist, #empty").replaceWith($j("#custom-permlist",h))}}$j("#custom-permlist .added-level, #custom-permlist .updated-level").livequery(function(){var h=$j(this).siblings("li:visible").size()>0;$j(this).filter(":hidden").delay(h?1000:0).slideDown();$j(this).effect("highlight",{color:"#eafade"},3000);var g=$j(this).find(".perms-updated");g.delay(4000).fadeOut("slow",function(){$j(this).remove()})});$j("a[id^=edit-level-]").live("click",function(){$j(this).siblings("form").ajaxSubmit({success:f});return false});$j("a[id^=delete-level-]").live("click",function(){var h=$j(this).attr("id");var g=h.slice("delete-level-".length);$j(this).siblings("form").ajaxSubmit({success:function(j){var k=function(m){if($j("#"+h,m).length>0){return}$j("#"+h).parents("li").slideUp();var l=$j("#level-deleted-"+g);l.slideDown();l.delay(4000).slideUp("slow",function(){if($j("#empty",m).length>0){var n=$j("#empty",m);n.css("display","none");$j("#custom-permlist, #empty").replaceWith(n);$j("#empty").slideDown()}else{$j(this).remove()}})};var i=function(){};if(c(j,k,i)){return}k(j)}});return false});$j("a[id^=space-listing-]").live("click",function(){$j.get($j(this).attr("href"),function(h){var g=$j(h).appendTo("body");d(g)});return false})});