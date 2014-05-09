/*
 * jQuery Templates Plugin Library v1.1.0
 * http://www.ivorycity.com/blog/jquery-template-plugin/
 *
 * Copyright (c) 2009 Michael Collins
 * Dual licensed under the MIT and GPL licenses.
 * See MIT-LICENSE.txt and GPL-LICENSE.txt
 *
 */
jQuery.fn.extend({render:function(a,b){var e={};var c=null;var d=new RegExp("['\"](.+)['\"]","mg");b=b||[];a=jQuery.makeArray(a);this.each(function(f){var g=function(q,n,k){var m=$j("<div></div>").append($j(n).clone());jQuery.each(q,function(t,s){t=""+t;if(t.indexOf("$j(")==0||t.indexOf("@(")==0){var r=d.exec(t);if(r[1]){m.find(r[1]).render(s,{clone:t.indexOf("@")==0?true:false})}return}});var l="";var i=m.html().replace(/%7B/ig,"{").replace(/%7D/ig,"}");var p=function(s,r){replacement=l+s;if(!e[replacement]){if(r!=null&&typeof r=="object"||typeof r=="array"){var t=l;l=replacement+".";jQuery.each(r,p);l=t;return}e[replacement]=new RegExp("{"+replacement+"}","gm")}var u=e[replacement];i=i.replace(u,r)};jQuery.each(q,p);var o=$j(i);if(k.beforeUpdate){k.beforeUpdate(o)}if(k.clone){$j(n).after(o)}else{$j(n).replaceWith(o)}if(k.afterUpdate){k.afterUpdate(o)}return o};var h=$j(this);if(b.preserve_template){b.clone=true}if(b.clone){a=jQuery.makeArray(a);$j(a.reverse()).each(function(){var i=g(this,h,b);if(!c){c=$j(i)}else{c.push(i[0])}});if(!b.preserve_template){$j(this).remove()}}else{var j=(a[f]||a[a.length-1]);g(j,h,b)}});if(c){return this.pushStack(c,"render",this.selector)}else{return this}}});