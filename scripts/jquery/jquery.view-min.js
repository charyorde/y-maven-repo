(function(a){a.fn.view=function(b,c){if(!jQuery.isFunction(b)){throw"IllegalViewParameterException"}if(!c&&b.getBindName){c=b.getBindName()}if(!c){throw"IllegalBindParameterException"}var e;if(this.length){var d=this.first();e=d.data(c);if(e==null){e=new b(d.get(0));d.data(c,e)}else{if(!(e instanceof b)){throw"PropertyAlreadyBoundException"}}}return e}})(jQuery);