(function(c){var b={};jive.Template=function a(h,f){try{var d=/^[\w\-]+$/.test(h)?b[h]=b[h]||a(document.getElementById(h).innerHTML):new Function("obj","var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"+h.replace(/[\r\t\n]/g," ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g,"$1\r").replace(/\t=(.*?)%>/g,"',jive.util.escapeHTML($1),'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'")+"');}return p.join('');")}catch(g){throw ("jive.template Error parsing template: "+g)}return f?d(f):d}})(jQuery);