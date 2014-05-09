/*!
 * jQuery Templates Plugin Library v1.1.0
 * http://www.ivorycity.com/blog/jquery-template-plugin/
 *
 * Copyright (c) 2009 Michael Collins
 * Dual licensed under the MIT and GPL licenses.
 * See MIT-LICENSE.txt and GPL-LICENSE.txt
 *
 */
jQuery.fn.extend( {

	render: function( values, options )
	{
		var re_cache = {};
		var clone_list = null;
		var selector_re = new RegExp('[\'"](.+)[\'"]','mg');

		options = options || [];
		values  = jQuery.makeArray(values);

		this.each( function (i)
		{
			var render = function (tvals,tmplnode,options) 
			{
				var tmp_node = $j("<div></div>").append( $j(tmplnode).clone() );
				jQuery.each(tvals, function (k,v)
				{
					k = ''+k;

					//jquery selector or cloner, not string replace
					if ( k.indexOf( '$j(' )==0 || k.indexOf( '@(' )==0 )
					{
						var m = selector_re.exec(k);

						if (m[1])
						{
							tmp_node.find(m[1]).render(v,{clone:k.indexOf('@')==0?true:false});
						}
						return;
					}
				});

				var context = '';
				var tmpl = tmp_node.html().replace(/%7B/ig,'{').replace(/%7D/ig,'}');
				var kv_iterator = function(k,v)
				{
					replacement = context + k;

					if (!re_cache[replacement])
					{
						if ( v!=null && typeof v == 'object' || typeof v == 'array' )
						{
							var tmp_context = context;
							context = replacement+'.'; 
							jQuery.each(v,kv_iterator);
							context = tmp_context;
							return;
						}

						re_cache[replacement] = new RegExp('{'+replacement+'}', 'gm'); 
					}

					var re = re_cache[replacement];
					tmpl = tmpl.replace( re, v );	
				}; // end kv_iterator


				jQuery.each(tvals, kv_iterator);

				var node = $j(tmpl);

				if (options['beforeUpdate']) 
				{
					options['beforeUpdate'](node);		
				}

				if (options['clone'])
				{
					$j(tmplnode).after(node);
				}
				else	
				{
					$j(tmplnode).replaceWith(node);
				}

				if (options['afterUpdate']) 
				{
					options['afterUpdate'](node);
				}		

				return node;
			}; // end render

			var node = $j(this);

			if (options['preserve_template'])
			{
				options['clone'] = true;
			}

			if (options['clone'])
			{
				values = jQuery.makeArray(values);
				$j(values.reverse()).each( function()
				{ 
					var newnode = render(this,node,options); 

					if( !clone_list )
					{
						clone_list = $j(newnode);
					}
					else
					{
						clone_list.push(newnode[0]);
					}
				});

				if (!options['preserve_template'])
				{
					$j(this).remove();
				}				
			}
			else
			{
				var repl = (values[i] || values[values.length-1]);
				render(repl,node,options);
			}

		});
	
		if (clone_list)
		{
			return this.pushStack(clone_list, 'render', this.selector );
		}
		else
		{
			return this;
		}
	}
});
