(function(a){a.fn.jiveFileButton=function(c){var d=this;c=a.extend({name:"file"},c||{});function b(){var e=a(this).unbind("change",b).remove();d.trigger("choose",e);d.jiveFileButton(c)}a('<input type="file" />').attr("name",c.name).appendTo(d).change(b);return d}})(jQuery);