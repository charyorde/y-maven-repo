jive.namespace("rte");if(!jive.rte.renderedContent){jive.rte.renderedContent=(function(){function c(f,e){var g=$j.extend({},{contentSelector:"div.jive-rendered-content",syntaxSelector:'pre[name="code"], textarea[name="code"]'},e||{});if(f){if(typeof f.getContent=="function"){f=f.getContent()}}else{f=document}var d=this;jive.conc.nextTick(function(){var h=$j(g.contentSelector,f);d.emit("renderedContentWithSelector",h,g);jive.bindLightboxMedia({context:$j(f)})})}function a(d,e){d.find("table").each(function(){var f=$j(this);var g=$j.extend({},{textExtraction:"complex"},f.data("tablesorter")||{});f.tablesorter(g)});d.find(e.syntaxSelector).each(function(){var f=$j(this);if(!f.data("highlighted")){dp.SyntaxHighlighter.Highlight(this);f.data("highlighted",true)}})}function b(){this.addListener("renderedContent",c);this.addListener("renderedContentWithSelector",a)}jive.conc.observable(b.prototype);return new b()})();$j(function(){jive.rte.renderedContent.emit("renderedContent")})};