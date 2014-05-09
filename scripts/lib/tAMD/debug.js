/**
 * Tiny, modular implementation of the CommonJS
 * Modules/AsynchronousDefinition as described in
 * http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition
 *
 * This extension provides debugging information regarding module
 * definitions.  For example it warns of duplicate module definitions
 * and of module definitions that violate the AMD specification.
 *
 * Copyright 2012 Jive Software
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*globals define console */
/*jshint sub:true */

require(['tAMD/hooks', 'require'], function(hooks, requireSync) {
    var alreadyChecked = {};

    hooks['on']('define', function(id, dependencies, factory) {
        warnIfValueMissing(id, factory);
        errorIfRelative(id);
        for (var i = 0; i < dependencies.length; i++) {
            warnIfMissing(dependencies[i]);
        }
    });

    hooks['on']('publish', function(id, moduleValue) {
        warnIfDuplicate(id);
    });

    function warnIfDuplicate(id) {
        if (requireSync(id)) {
            warn('Module is already defined.', name(id));
        }
    }

    function warnIfValueMissing(id, factory) {
        if (!factory || (typeof factory !== 'function' && typeof factory !== 'object')) {
            warn('No module definition given - a module definition must be an object or a function.', name(id), factory);
        }
    }

    function warnIfMissing(id) {
        var timeout;

        if (!alreadyChecked[id]) {
            alreadyChecked[id] = true;

            timeout = setTimeout(function() {
                warn('Module was requested but is missing.', name(id));
            }, 2000);

            require([id], function() {
                clearTimeout(timeout);
            });
        }
    }

    function errorIfRelative(id) {
        if (/^\.\.?\//.test(id)) {
            error('The id of a module cannot be relative when it is defined.', id);
        }
    }

    function warn(/* values */) {
        if (typeof console === 'object' && typeof console.warn === 'function') {
            console.warn.apply(console, arguments);
        }
    }

    function error(/* values */) {
        if (typeof console === 'object' && typeof console.error === 'function') {
            console.error.apply(console, arguments);
        }
    }

    function name(id) {
        return id || 'anonymous module';
    }
});
