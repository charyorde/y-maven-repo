// This file provides the default namespaces for the Jive JavaScript Library

/*extern $j */
/*globals jive console */

var HOSTURL = "/";
var AJAXPATH = "";

if (typeof(jive) == "undefined") {
    jive = {};
}

/**
 * jive.namespace(name[, obj = {}]) -> obj
 * - name (String): New namespace to create under `jive`.
 *
 * Creates a new namespace under `jive` and returns it.  If the given
 * namespace is already defined returns the existing value.
 *
 * The name of the new namespace may contain dots (.) in which case nested
 * namespaces are conditionally created for each component of the name.
 **/
jive.namespace = function(name, obj) {
    var parts = name.split('.'),
        space = this,
        i;
    for (i = 0; i < parts.length; i += 1) {
        if (typeof(space[parts[i]]) === 'undefined') {
            if (i == parts.length - 1 && typeof(obj) != 'undefined') {
                space[parts[i]] = obj;
            } else {
                space[parts[i]] = {};
            }
        }
        space = space[parts[i]];
    }
    return space;
};

/**
 * jive.app(name[, mainClass]) -> Function
 * - name (String): new namespace to create under `jive`
 * - mainClass (String): optional, name of the class to use as the main
 *   class of the app
 *
 * Creates a new app namespaced under `jive`.  Instead of just setting
 * the namespace to an empty object as `jive.namespace()` does, this
 * method defines the namespace as a function that invokes a property
 * of itself called `Main`.
 *
 * If `mainClass` is given then the namespace function invokes the
 * class with that name instead of `Main`.
 *
 * The method allows apps to be initialized this way while still
 * allowing for multiple classes to be namespaced under the app:
 *
 *     var myApp = new jive.MyApp(arg1, arg2);
 *
 * instead of this slightly less attractive way:
 *
 *     var myApp = new jive.MyApp.Main(arg1, arg2);
 *
 * And this should work too:
 *
 *     myApp instanceof jive.MyApp //=> true
 *     myApp.constructor === jive.MyApp //=> true
 *
 * The name of the new app may contain dots (.) in which case nested
 * namespaces are conditionally created for each component of the name.
 **/
jive.app = jive.app || function(name, mainClass) {
    var parts = name.split('.'),
        root = this,
        main = mainClass || 'Main';

    return this.namespace(name, function(/* args */) {
        var parent = parts.slice(0, -1).reduce(function(s,p) { return s[p]; }, root),
            space  = parent[parts.last()],  // The app namespace.
            Main   = space[main],  // Main class of the app.
            instance;

        if ($j.isFunction(Main)) {
            $j.extend(Main, space);  // Copy all properties of space onto `Main`.
            Main[main] = Main;  // Copy a reference to `Main` onto itself.
            parent[parts.last()] = Main;  // Replace the app namespace placeholder with `Main`.

            instance = Object.create(Main.prototype);
            Main.apply(instance, arguments);  // Instantiates a new instance of `Main`.
            return instance;

        } else {
            throw("No class called `"+ main +"` was found in jive."+ name +".");
        }
    });
};

jive.namespace('gui');
jive.namespace('model');
jive.namespace('ext.y');
jive.namespace('ext.x');
jive.namespace('xml');
jive.namespace('rte.macros', []);
jive.namespace('rte.plugin');
jive.namespace('global');

// Create stubs for logging functions in case some debugging statements are
// left in.
jive.namespace.call(window, 'console.log',   function() {});
jive.namespace.call(window, 'console.debug', function() {});
jive.namespace.call(window, 'console.error', function() {});
jive.namespace.call(window, 'console.warn',  function() {});
jive.namespace.call(window, 'console.info',  function() {});

if(typeof(kjs) == "undefined"){
    kjs = {};
    kjs.require = function(foo, thunk){
        setTimeout(thunk,1);
    }
}
if(typeof(define) == "undefined"){
    define = function(foo, thunk){
        setTimeout(thunk,1);
    };
}

/*
try{
    var win = window.open("",name,"width=450,height=700,scrollbars=1,resize=1");
    win.document.write("<html><head><title>History</title>" +
    "<style>ol{padding-left: 12px;} div{ font-family:verdana;font-size:8pt; margin-bottom:10px; }</style>" +
    "</head><body>");
    win.document.write("</body></html>");
    win.document.close();

    var arrayHolder = win.document.createElement('DIV');
    win.document.body.appendChild(arrayHolder);
    var arrayList = win.document.createElement('OL');
    arrayHolder.appendChild(arrayList);

    var log = win.document.createElement('DIV');
    win.document.body.appendChild(log);
    console = new Object();
    console.log = function(str){
        log.appendChild(win.document.createTextNode(str));
        log.appendChild(win.document.createElement('BR'));
        log.appendChild(win.document.createElement('BR'));
    };
}catch(e){ }
*/
