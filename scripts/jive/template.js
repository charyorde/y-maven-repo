// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

/*jslint browser:true */
/*extern jive jQuery */

/**
 * jive.Template(templateName) -> Function
 * - templateName(string): DOM id of a script node that contains a template
 *
 * This is a client-side rendering engine.  It loads a template and returns a
 * template function that can be called to output a rendered version of that
 * template.
 *
 * Templates are pulled from <script/> nodes.  Create a script tag in your FTL
 * with type 'text/html' and put your template inside it.  Put an id on the
 * script tag to refer to it in a `jive.Template()` call.
 *
 * Within the template you can display dynamic values by wrapping them in `<%=
 * ... %>`.  You can inject non-displaying JavaScript for conditional display
 * or for iterating over a collection with `<% ... %>`.  For example:
 *
 *     <script type="text/html" id="demo">
 *       <ul>
 *       <% participants.forEach(function(person) {
 *         <li>Hello, <%= person %></li>
 *       <% }); %>
 *       </ul>
 *     </script>
 *
 * Variables in the template are specified by passing an object to the template
 * where keys of that object map to variables in the template.
 *
 * String values are automatically escaped when displayed in a template.
 * jQuery instances and DOM nodes are rendered as HTML.
 */
(function($){
    var cache = {};

    jive.Template = function tmpl(str, data){
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        try{
        var fn = /^[\w\-]+$/.test(str) ?
        cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :

        // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str
        .replace(/[\r\t\n]/g, " ")
        .split("<%").join("\t")
        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
        .replace(/\t=(.*?)%>/g, "',jive.util.escapeHTML($1),'")
        .split("\t").join("');")
        .split("%>").join("p.push('")
        .split("\r").join("\\'")
        + "');}return p.join('');");
        } catch(e){
            throw('jive.template Error parsing template: ' + e);
        }
        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
    };
})(jQuery);
