define("jive.Theme.CustomHeaderFooter",["jquery"],function(b){return function a(e){var c=jive.conc.observable({}),d=false;c.enable=function(){d=true;return c};c.disable=function(){d=false;return c};jive.dispatcher.listen("editCustomCssHtml",function(){b(this).closest(".js-chooser").trigger("close");var f=b(jive.theme.customCssHtmlDialog()).appendTo("body"),g=f.lightbox_me({destroyOnClose:true,onLoad:function(){$j("#j-custom-css-html-form").ajaxForm({success:function(i){var j={customFooterCSSRendered:i.scrubbedFooterCss,customFooterHTMLRendered:i.scrubbedFooterHtml,customHeaderCSSRendered:i.scrubbedHeaderCss,customHeaderHTMLRendered:i.scrubbedHeaderHtml};b("textarea").each(function(){j[b(this).attr("id")]=b(this).val()});e.setCssValues(j);g.trigger("close")},error:function(){$j(jive.theme.customCssHtmlError()).message({style:"error"})},clearForm:false,resetForm:false});var h=e.getCssValues();f.find("textarea").each(function(){b(this).val(h[b(this).attr("id")]||"")})}})});return c}});