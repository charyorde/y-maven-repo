/* Kongregate Asychronous JavaScript Loader

The MIT License

Copyright (c) 2010 Kongregate Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


Usage:
 1. Inline the kjs library
    
      <head>
        <script type="text/javascript">function KJS(config)...
    
    
 2. Create an instance
    
      var kjs = new KJS({ path: '/javascripts/' });
    
    
 3. Load a file with no dependencies.
    a.js will be downloaded and executed.
    
      kjs.load('a.js')
    
    
 4. Load a file with a dependency.
    b.js will be downloaded, but not executed until the '/a.js' dependency is satisfied
    This does not trigger the download of a.js
    
      kjs.load('b.js', [ 'a.js' ]);
    
    
 5. Run some code with a dependency on a file.
    The provided function will not be executed until the '/a.js' dependency is satisfied
    
      kjs.run(function() { my_a = new A(); }, [ 'a.js' ]);
    
    
 6. Run some code that fulfills a dependency
    
      kjs.run(function() { my_a = new A(); }, [], [ 'a_has_been_run' ]);
    
    
  7. Run some code with a custom dependency
    
      kjs.run(function() { my_b = new B(my_a); }, [ 'a_has_been_run' ], []);
    
    
*/
function KJS(config) { this._path = (config && config.path) || ''; this._d = {}; }
KJS.prototype = {
  require: function(/* deps */) {
    var ms = Array.prototype.slice.call(arguments), fn;
    if (typeof ms[ms.length - 1] == 'function') { fn = ms.pop(); }
    for (var i = 0; i < ms.length; i++) {
      this.sat(ms[i] +'--required');
    }
    if (fn) {
      this.run(fn, ms);
    }
  },
  _load: function(file, depends, satisfies, embed, link) {
    var kjs = this,
        s = (satisfies || []).concat(file.split('?')[0]),
        url = this._path + file,
        local = this._origin(url) && embed,
        satisfy = local ?
          function(body) {
            var i, err;
            // This is a bit convoluted because try / catch / finally is
            // not implemented well in IE.
            try { embed.call(kjs, body); }
            catch(error) { err = error; }
            finally {
                while (i = s.shift()) { kjs.sat(i); }
                if (err) { throw err; }
            }
          } :
          function(src) {
            link.call(kjs, src, function() {
              var i;
              while (i = s.shift()) { kjs.sat(i); }
            });
          };

    if (!this.isSat(s)) {
      if (local) {
        this.get(url, function(body) {
          depends && depends.length ?
            kjs.run(function() { satisfy(body); }, depends) :
            satisfy(body);
        });
      } else {
        depends && depends.length ?
          kjs.run(function() { satisfy(url); }, depends) :
          satisfy(url);
      }
    }
  },
  load: function(file, depends, satisfies) {
    var kjs = this;
    this._load(file, depends, satisfies, kjs.embed, kjs.link);
  },
  loadCSS: function(file, depends, satisfies) {
    var kjs = this;
    kjs._load(file, depends, satisfies, null, kjs.linkCSS);
  },
  run: function(fn, depends, satisfies) {
    var kjs = this, ifn,
        s = satisfies || [],
        fn_with_satisfies = s.length ?
          function() {
            var i, err;
            if (!kjs.isSat(s)) {
              try { fn(); }
              catch(error) { err = error; }
              finally {
                while (i = s.pop()) { kjs.sat(i); }
                if (err) { throw err; }
              }
            }
          } : fn;
    if (!depends.length) {
      fn_with_satisfies();
    } else if (1 == depends.length) {
      ifn = fn_with_satisfies;
    } else {
      var c = depends.length;
      ifn = function() { if (!--c) { fn_with_satisfies(); } };
    }
    var i;
    while (i = depends.pop()) {
      if (true === this._d[i]) { ifn(); }
      else {
        this._d[i] = this._d[i] ?
          function(ofn, nfn) {
            return function() { ofn(); nfn(); };
          }(this._d[i], ifn) : ifn;
      }
    }
  },
  _css: /css(?:$|\?)/i,
  get: function(url, fn) {
    $j.ajax({
      url: url,
      dataType: url.match(this._css) ? 'text/css' : 'text/javascript',
      complete: function(r) { fn(r.responseText); }
    });
  },
  _firstScript: document.getElementsByTagName('script')[0],
  _head: document.getElementsByTagName('head')[0],
  embed: function(body) {
    $j.globalEval(body);
  },
  link: function(src, fn) {
    var kjs = this,
        f = this._firstScript,
        p = f.parentNode,
        s = document.createElement('script'),
        timeout;
    s.src = src;

    s.onreadystatechange = s.onload = s.onerror = function() {
      if (!s.readyState || s.readyState == 'loaded' || s.readyState == 'complete') {
        clearTimeout(timeout);
        s.onload = s.onreadystatechange = $j.noop;
        p.removeChild(s);
        fn && fn();
      }
    };

    timeout = setTimeout(s.onerror, 5000);

    p.insertBefore(s, f);
  },
  linkCSS: function(src, fn) {
    var kjs = this, l;

    if (document.createStyleSheet) {
      l = document.createStyleSheet(src);
    } else {
      l = document.createElement('link');
      l.href = src;
      l.rel = 'stylesheet';
      l.type = 'text/css';

      this._head.appendChild(l);
    }

    // For now, do not wait for the stylesheet to load before invoking
    // the callback.
    fn && fn();
  },
  _origin: function(url) {
    var origin = location.origin || location.protocol +'//'+ location.host,
        full = this._fullURL(url);
    return full.slice(0, origin.length) === origin;
  },
  _fullURL: function(url) {
    var div = document.createElement('div');
    div.innerHTML = '<a href="'+ url +'">x</a>';
    return div.firstChild.href;
  },
  sat: function(dep) {
    if (this._d[dep] && true !== this._d[dep]) { this._d[dep](); }
    this._d[dep] = true;
  },
  isSat: function(deps) {
    var c = 0;
    for (var i = 0; i < deps.length; i++) {
      if (true === this._d[deps[i]]) { c++; }
    }
    return c > 0 && c === deps.length;
  }
};

var kjs = new KJS();

// vim:softtabstop=2:shiftwidth=2:expandtab
