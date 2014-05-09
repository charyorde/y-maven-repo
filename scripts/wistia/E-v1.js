;;
/*
# C O R E   W I S T I A
*/
var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
(function(window) {
  var __Wistia__;
  __Wistia__ = window.Wistia;
  if (!((window.Wistia != null) && (window.Wistia.wistia != null))) {
    window.Wistia = {
      wistia: "1.0",
      extend: function() {
        var obj1, obj2, objs, _i, _len;
        obj1 = arguments[0], objs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (!objs.length) {
          objs = [obj1];
          obj1 = this;
        }
        for (_i = 0, _len = objs.length; _i < _len; _i++) {
          obj2 = objs[_i];
          this.obj.eachDeep(obj2, __bind(function(obj2Node, path) {
            var obj1Node;
            obj1Node = this.obj.get(obj1, path);
            if (this.obj.isArray(obj2Node)) {
              if (this.obj.isEmpty(obj1Node)) {
                return this.obj.set(obj1, path, []);
              }
            } else if (this.obj.isObject(obj2Node)) {
              if (this.obj.isEmpty(obj1Node)) {
                return this.obj.set(obj1, path, {});
              }
            } else {
              return this.obj.set(obj1, path, obj2Node);
            }
          }, this));
        }
        return obj1;
      },
      mixin: function(klass, obj) {
        var key, val;
        for (key in obj) {
          val = obj[key];
          if (obj.hasOwnProperty(key)) {
            klass[key] = val;
          }
        }
      },
      obj: {
        get: function(obj, parts, create) {
          var p;
          if (typeof parts === 'string') {
            parts = parts.split('.');
          } else {
            parts = parts.slice(0, parts.length);
          }
          while ((obj != null) && parts.length) {
            p = parts.shift();
            if ((obj[p] === void 0 || !this.isObject(obj[p])) && create) {
              obj[p] = {};
            }
            obj = obj[p];
          }
          return obj;
        },
        set: function(obj, parts, value) {
          var prop;
          if (typeof parts === 'string') {
            parts = parts.split('.');
          } else {
            parts = parts.slice(0, parts.length);
          }
          prop = parts.pop();
          obj = this.get(obj, parts, true);
          if ((obj != null) && (this.isObject(obj) || this.isArray(obj)) && (prop != null)) {
            if (value != null) {
              return obj[prop] = value;
            } else {
              return delete obj[prop];
            }
          } else {

          }
        },
        unset: function(obj, parts) {
          return this.set(obj, parts);
        },
        exists: function(obj, name) {
          return this.get(obj, name) !== void 0;
        },
        cast: function(str) {
          if (str == null) {
            return str;
          }
          str = "" + str;
          if (/^\d+?$/.test(str)) {
            return parseInt(str, 10);
          } else if (/^\d*\.\d+/.test(str)) {
            return parseFloat(str);
          } else if (/^true$/i.test(str)) {
            return true;
          } else if (/^false$/i.test(str)) {
            return false;
          } else {
            return str;
          }
        },
        castDeep: function(obj) {
          this.eachLeaf(obj, __bind(function(leafVal, path) {
            if (typeof leafVal === "string") {
              return this.set(obj, path, this.cast(leafVal));
            }
          }, this));
          return obj;
        },
        isArray: function(obj) {
          return (obj != null) && /^\s*function Array()/.test(obj.constructor);
        },
        isObject: function(obj) {
          return (obj != null) && /^\s*function Object()/.test(obj.constructor);
        },
        isRegExp: function(obj) {
          return (obj != null) && /^\s*function RegExp()/.test(obj.constructor);
        },
        isBasicType: function(obj) {
          return (obj != null) && (this.isRegExp(obj) || /^string|number|boolean|function$/i.test(typeof obj));
        },
        isEmpty: function(obj) {
          var hasKey, key, val;
          if (!(obj != null)) {
            return true;
          } else if (this.isArray(obj) && !obj.length) {
            return true;
          } else if (this.isObject(obj)) {
            hasKey = true;
            for (key in obj) {
              val = obj[key];
              hasKey = false;
            }
            return hasKey;
          } else {
            return false;
          }
        },
        isEmptyDeep: function(obj) {
          var result;
          if (this.isEmpty(obj)) {
            return true;
          }
          result = true;
          this.eachLeaf(obj, __bind(function() {
            return result = false;
          }, this));
          return result;
        },
        isSubsetDeep: function(obj1, obj2) {
          var result;
          if (obj1 === obj2) {
            return true;
          }
          if (((obj1 != null) && !(obj2 != null)) || (!(obj1 != null) && (obj2 != null))) {
            return false;
          }
          result = true;
          this.eachLeaf(obj1, __bind(function(obj1LeafVal, path) {
            var obj2LeafVal;
            obj2LeafVal = this.get(obj2, path);
            if (obj1LeafVal !== obj2LeafVal) {
              return result = false;
            }
          }, this));
          return result;
        },
        equalsDeep: function(obj1, obj2) {
          return this.isSubsetDeep(obj1, obj2) && this.isSubsetDeep(obj2, obj1);
        },
        eachDeep: function(obj, fn, path) {
          var key, newPath, val;
          if (path == null) {
            path = [];
          }
          if (this.isBasicType(obj)) {
            fn(obj, path);
          } else if (this.isObject(obj) || this.isArray(obj)) {
            fn(obj, path);
            for (key in obj) {
              val = obj[key];
              newPath = path.slice(0, path.length);
              newPath.push(key);
              this.eachDeep(val, fn, newPath);
            }
          } else {
            fn(obj, path);
          }
        },
        eachLeaf: function(obj, fn) {
          return this.eachDeep(obj, __bind(function(obj, path) {
            if (!this.isArray(obj) && !this.isObject(obj)) {
              return fn(obj, path);
            }
          }, this));
        }
      },
      data: function(key, val) {
        if (!this.obj.isArray(key)) {
          key = key.split(".");
        }
        if (val != null) {
          this.obj.set(this, ["_data"].concat(key), val);
        }
        return this.obj.get(this, ["_data"].concat(key));
      },
      timeout: function(key, fn, time) {
        var timeoutId;
        if (time == null) {
          time = 1;
        }
        this.clearTimeouts(key);
        if (!this.obj.isArray(key)) {
          key = key.split(".");
        }
        key = ["timeouts"].concat(key);
        if (fn) {
          timeoutId = setTimeout(__bind(function() {
            this.removeData(key);
            return fn();
          }, this), time);
          return this.data(key, timeoutId);
        } else {
          return this.data(key);
        }
      },
      clearTimeouts: function(key) {
        var timeoutTree;
        if (!this.obj.isArray(key)) {
          key = key.split(".");
        }
        key = ["timeouts"].concat(key);
        timeoutTree = this.data(key);
        this.obj.eachLeaf(timeoutTree, function(obj) {
          return clearTimeout(obj);
        });
        return this.removeData(key);
      },
      removeData: function(key) {
        return this.obj.unset(this, ["_data"].concat(key));
      },
      seqId: function(prefix, suffix) {
        var currentVal, result, sequenceKey;
        if (prefix == null) {
          prefix = "wistia_";
        }
        if (suffix == null) {
          suffix = "";
        }
        sequenceKey = ["sequence", "val"];
        currentVal = this.data(sequenceKey) || 1;
        result = prefix + currentVal + suffix;
        this.data(sequenceKey, currentVal + 1);
        return result;
      },
      noConflict: function() {
        window.Wistia = __Wistia__;
        return this;
      },
      util: {
        elemHeight: function(elem) {
          var result;
          result = Wistia.detect.browser.quirks ? parseInt(elem.offsetHeight, 10) : window.getComputedStyle ? parseInt(getComputedStyle(elem, null).height, 10) : elem.currentStyle ? elem.offsetHeight : -1;
          return result;
        },
        elemWidth: function(elem) {
          if (Wistia.detect.browser.quirks) {
            return parseInt(elem.offsetWidth, 10);
          } else if (window.getComputedStyle) {
            return parseInt(getComputedStyle(elem, null).width, 10);
          } else if (elem.currentStyle) {
            return elem.offsetWidth;
          } else {
            return -1;
          }
        },
        winHeight: function() {
          var winHeight;
          return winHeight = window.innerHeight ? window.innerHeight : document.documentElement ? document.documentElement.offsetHeight : document.body.offsetHeight;
        },
        winWidth: function() {
          var winWidth;
          return winWidth = window.innerWidth ? window.innerWidth : document.documentElement ? document.documentElement.offsetWidth : document.body.offsetWidth;
        }
      },
      bindable: {
        bind: function(event, callback) {
          if (!this._bindings) {
            this._bindings = {};
          }
          if (!this._bindings[event]) {
            this._bindings[event] = [];
          }
          this._bindings[event].push(callback);
          return this;
        },
        unbind: function(event, callback) {
          var callbacks, i, trimmedCallbacks, _ref;
          callbacks = this._bindings[event];
          if (callbacks) {
            if (callback) {
              trimmedCallbacks = [];
              for (i = 0, _ref = callbacks.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
                if (callback !== callbacks[i]) {
                  trimmedCallbacks.push(callbacks[i]);
                }
              }
              this._bindings[event] = trimmedCallbacks;
            } else {
              this._bindings[event] = [];
            }
          }
          if (this._bindings[event] && !this._bindings[event].length) {
            this._bindings[event] = null;
            delete this._bindings[event];
          }
          return this;
        },
        hasBindings: function() {
          var key, result, val, _ref;
          result = false;
          _ref = this._bindings;
          for (key in _ref) {
            val = _ref[key];
            if (this._bindings.hasOwnProperty(key)) {
              result = true;
            }
          }
          return result;
        },
        trigger: function() {
          var args, bindings, callback, event, _i, _len;
          event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          if ((bindings = this._bindings[event])) {
            for (_i = 0, _len = bindings.length; _i < _len; _i++) {
              callback = bindings[_i];
              if (callback) {
                callback.apply(this, args);
              }
            }
          }
          return this;
        }
      }
    };
  }
  if ((__Wistia__ != null) && !(__Wistia__.wistia != null)) {
    return Wistia.extend(__Wistia__);
  }
})(window);
/*
# D E T E C T I O N
#
#   (feel out our surroundings)
*/
(function(W) {
  W.extend({
    _detect: {
      na: navigator.userAgent,
      rwebkit: /(webkit)[ \/]([\w.]+)/i,
      ropera: /(opera)(?:.*version)?[ \/]([\w.]+)/i,
      rmsie: /(msie) ([\w.]+)/i,
      rmozilla: /(mozilla)(?:.*? rv:([\w.]+))?/i,
      randroid: /(android) ([^;])/i,
      riphone: /(iphone)/i,
      ripad: /(ipad)/i,
      browser: function() {
        return this.browserMatch()[1].toLowerCase();
      },
      browserVersion: function() {
        return this.browserMatch()[2];
      },
      browserMatch: function() {
        return this.na.match(this.rwebkit) || this.na.match(this.ropera) || this.na.match(this.rmsie) || this.na.match(this.rmozilla);
      },
      android: function() {
        var matches;
        matches = this.na.match(this.randroid);
        if (matches == null) {
          return false;
        }
        return {
          version: matches[2]
        };
      },
      iphone: function() {
        return this.riphone.test(this.na);
      },
      ipad: function() {
        return this.ripad.test(this.na);
      },
      flash: function() {
        var version;
        version = this.flashFullVersion();
        return {
          version: parseFloat(version[0] + "." + version[1]),
          major: parseInt(version[0], 10),
          minor: parseInt(version[1], 10),
          rev: parseInt(version[2], 10)
        };
      },
      flashFullVersion: function() {
        var axo;
        try {
          try {
            axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
            try {
              axo.AllowScriptAccess = 'always';
            } catch (e) {
              return [6, 0, 0];
            }
          } catch (e) {

          }
          return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1].split(",");
        } catch (e) {
          try {
            if (navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin) {
              return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1].split(",");
            }
          } catch (e) {

          }
        }
        return [0, 0, 0];
      },
      html5Video: function() {
        var elem, h264, result;
        elem = document.createElement('video');
        result = false;
        try {
          if (!!elem.canPlayType) {
            result = {};
            h264 = 'video/mp4; codecs="avc1.42E01E';
            result.h264 = !!elem.canPlayType(h264 + '"') || !!elem.canPlayType(h264 + ', mp4a.40.2"');
          }
        } catch (e) {
          result = {
            h264: false
          };
        }
        return result;
      }
    }
  });
  W.extend({
    detect: {
      browser: {
        version: W._detect.browserVersion(),
        quirks: W._detect.browser() === "msie" && document.compatMode === 'BackCompat',
        old: W._detect.browser() === "msie" && (document.compatMode === 'BackCompat' || W._detect.browserVersion() < 7)
      },
      android: W._detect.android(),
      iphone: W._detect.iphone(),
      ipad: W._detect.ipad(),
      flash: W._detect.flash(),
      video: W._detect.html5Video()
    }
  });
  W.detect.browser[W._detect.browser()] = true;
})(Wistia);
/*
# J U D G E   J U D Y
#
#   (rule with an iron fist)
*/
(function(W) {
  var externalAsset, flashAsset, html5Asset, ipadAsset;
  flashAsset = function(assets) {
    return assets.mp4hq || assets.flv || assets.iphone;
  };
  html5Asset = function(assets) {
    return assets.mp4hq || assets.iphone;
  };
  externalAsset = function(assets) {
    return assets.iphone;
  };
  ipadAsset = function(assets) {
    if (assets.mp4hq && assets.mp4hq.width <= 1280 && assets.mp4hq.height <= 720) {
      return assets.mp4hq;
    } else {
      return assets.iphone;
    }
  };
  W.extend({
    judy: {
      judge: function(media, options) {
        var assets, force, plea, result;
        if (!options) {
          options = {};
        }
        plea = options.plea;
        force = options.force;
        result = {
          media: media,
          plea: force || plea,
          uuid: options.uuid || W.seqId("wistia_"),
          asset: null,
          embedType: null
        };
        assets = media.assets;
        if (force === "html5") {
          result.embedType = "html5";
          result.asset = html5Asset(assets);
        } else if (force === "flash") {
          result.embedType = "flash";
          result.asset = flashAsset(assets);
        } else if (force === "external") {
          result.embedType = "external";
          result.asset = externalAsset(assets);
        } else if (W.detect.iphone) {
          result.embedType = "html5";
          result.asset = externalAsset(assets);
        } else if (W.detect.ipad) {
          result.embedType = "html5";
          result.asset = ipadAsset(assets);
        } else if (W.detect.android) {
          result.embedType = "external";
          result.asset = externalAsset(assets);
        } else if (plea === "html5" && W.detect.video.h264) {
          result.embedType = "html5";
          result.asset = html5Asset(assets);
        } else if (plea === "flash" && W.detect.flash.version >= 7) {
          result.embedType = "flash";
          result.asset = flashAsset(assets);
        } else if (plea === "external") {
          result.embedType = "external";
          result.asset = externalAsset(assets);
        } else if (W.detect.flash.version >= 7) {
          result.embedType = "flash";
          result.asset = flashAsset(assets);
        } else if (W.detect.video.h264) {
          result.embedType = "html5";
          result.asset = html5Asset(assets);
        } else if ((W.detect.browser.msie && (W.detect.browser.version < 9 || W.detect.browser.quirks)) || W.detect.browser.mozilla) {
          result.embedType = "flash";
          result.asset = flashAsset(assets);
        } else {
          result.embedType = "external";
          result.asset = flashAsset(assets);
        }
        return result;
      }
    }
  });
})(Wistia);
/*
# E M B E D S
#
#   (interface and generation)
*/
(function(W) {
  W.extend({
    embed: function(media, options) {
      var container, embedFunc, result;
      if (!options) {
        options = {};
      }
      result = new W._embed.Video({}, options);
      W.data(["video", result.uuid], result);
      container = W._embed.getContainer(media, options);
      if (W.detect.browser.old) {
        container.style.width = "" + (W.util.elemWidth(container)) + "px";
        container.style.height = "" + (W.util.elemHeight(container)) + "px";
      }
      if (W.gridify && !result.params.noGrid) {
        result.grid = W.gridify(result, container);
      } else {
        if (options.wmode !== "transparent") {
          container.style.backgroundColor = "#000000";
        }
      }
      embedFunc = function(media) {
        var key, ruling, val, vid, vidClass;
        if (media.error) {
          if (typeof console !== "undefined" && console !== null) {
            console.log(media.error);
          }
          return;
        }
        ruling = W.judy.judge(media, result.params);
        vidClass = W._embed.classFor(ruling.embedType);
        vid = new vidClass(ruling, result.options);
        for (key in vid) {
          val = vid[key];
          if (key !== "uuid") {
            result[key] = val;
          }
        }
        result.embed();
      };
      setTimeout(function() {
        var hashedId;
        if (typeof media === "string") {
          hashedId = media;
          return W.remote.media(hashedId, function(media) {
            return embedFunc(media);
          });
        } else {
          return embedFunc(media);
        }
      }, 100);
      return result;
    },
    _embed: {
      getContainer: function(data, options) {
        if (typeof options.container === "string") {
          return document.getElementById(options.container);
        } else if (typeof data === "string") {
          return document.getElementById("wistia_" + data);
        } else if (data && data.media) {
          return document.getElementById("wistia_" + data.media.hashedId);
        } else if (data && data.hashedId) {
          return document.getElementById("wistia_" + data.hashedId);
        } else {
          return null;
        }
      },
      classFor: function(embedType) {
        switch (embedType) {
          case "html5":
            return W._embed.Html5Video;
          case "flash":
            return W._embed.FlashVideo;
          case "external":
            return W._embed.ExternalVideo;
          default:
            return W._embed.Video;
        }
      }
    }
  });
})(Wistia);
(function(W) {
  var externalVideo, flashVideo, html5Video, objToQueryParams, relBlockCss, stillUrl;
  W.extend({
    util: {
      addInlineCss: function(domTarget, css) {
        var styleElem, styles;
        styleElem = document.createElement("style");
        styleElem.id = W.seqId("wistia_", "_style");
        styleElem.setAttribute("type", "text/css");
        styles = document.getElementsByTagName("style");
        domTarget.appendChild(styleElem, domTarget.nextSibling);
        if (styleElem.styleSheet) {
          styleElem.styleSheet.cssText = css;
        } else {
          styleElem.appendChild(document.createTextNode(css));
        }
      },
      objToHtml: function(obj) {
        var attr, attributes, childNodes, entry, key, result, tagName, val, _i, _j, _len, _len2;
        if (/string|number|boolean/.test(typeof obj)) {
          return obj.toString();
        }
        if (obj instanceof Array) {
          result = "";
          for (_i = 0, _len = obj.length; _i < _len; _i++) {
            entry = obj[_i];
            result += W.util.objToHtml(entry);
          }
          return result;
        }
        if (typeof obj !== "object") {
          return obj.toString();
        }
        attributes = [];
        for (key in obj) {
          val = obj[key];
          if (key === "tagName") {
            tagName = val;
          } else if (key === "childNodes") {
            childNodes = val;
          } else {
            attributes.push({
              key: key,
              val: val
            });
          }
        }
        tagName || (tagName = "div");
        result = "<" + tagName;
        for (_j = 0, _len2 = attributes.length; _j < _len2; _j++) {
          attr = attributes[_j];
          result += " " + attr.key + "=\"" + attr.val + "\"";
        }
        if (/^(br|hr|img|link|meta|input)$/i.test(tagName)) {
          result += " />";
        } else {
          result += ">";
          if (childNodes) {
            if (typeof childNodes === "string") {
              result += childNodes;
            } else if (typeof childNodes === "object") {
              result += W.util.objToHtml(childNodes);
            }
          }
          result += "</" + tagName + ">";
        }
        return result;
      }
    }
  });
  objToQueryParams = function(obj) {
    var key, result, val;
    result = [];
    for (key in obj) {
      val = obj[key];
      result.push("" + key + "=" + (encodeURIComponent(val)));
    }
    return result.join("&");
  };
  relBlockCss = function(width, height) {
    return "display:inline-block;*display:inline;height:" + height + ";margin:0;padding:0;position:relative;vertical-align:top;width:" + width + ";zoom:1;";
  };
  flashVideo = function(ruling, options) {
    var asset, embedElem, flashvars, key, media, objectElem, objectParams, val;
    asset = ruling.asset;
    media = ruling.media;
    options = W.extend({
      flashPlayerUrl: null,
      pageUrl: null,
      chromeless: false,
      doNotTrack: false,
      endVideoCallback: "",
      controlsVisibleOnLoad: false,
      autoLoad: false,
      autoPlay: false,
      endVideoBehavior: "default",
      playButton: true,
      wmode: "opaque",
      playerColor: "",
      smallPlayButton: true,
      volumeControl: false,
      playbar: true,
      fullscreenButton: true,
      stillUrl: media.assets.still ? media.assets.still.url : ""
    }, options);
    options.unbufferedSeek = asset.type === "flv";
    options.shouldTrack = !options.doNotTrack;
    flashvars = {
      videoUrl: asset.url,
      hdUrl: media.assets.hdflv ? media.assets.hdflv.url : "",
      stillUrl: options.stillUrl,
      unbufferedSeek: asset.type === "flv",
      controlsVisibleOnLoad: options.controlsVisibleOnLoad,
      autoLoad: options.autoLoad,
      autoPlay: options.autoPlay && !options.suppressAutoplay,
      endVideoBehavior: options.endVideoBehavior,
      playButtonVisible: options.playButton,
      mediaDuration: media.duration,
      customColor: options.playerColor,
      wemail: options.trackEmail,
      referrer: options.pageUrl,
      quality: options.videoQuality,
      chromeless: options.chromeless ? true : null,
      endVideoCallback: options.endVideoCallback ? options.endVideoCallback : null,
      showVolume: options.volumeControl ? true : null,
      showPlaybar: options.playbar === false ? false : null,
      showPlayButton: options.smallPlayButton === false ? false : null,
      fullscreenDisabled: options.fullscreenButton === false ? true : null,
      trackingTransmitInterval: options.trackingTransmitInterval ? options.trackingTransmitInterval : null
    };
    if (options.shouldTrack) {
      flashvars.embedServiceURL = media.distilleryUrl;
      flashvars.accountKey = media.accountKey;
      flashvars.mediaID = media.mediaKey;
    }
    for (key in flashvars) {
      val = flashvars[key];
      if (val == null) {
        delete flashvars[key];
      }
    }
    objectElem = {
      tagName: "object",
      id: ruling.uuid,
      classid: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
      style: relBlockCss("100%", "100%")
    };
    if (options.wmode !== "transparent") {
      objectElem.bgcolor = "#000000";
    }
    objectParams = [
      {
        tagName: "param",
        name: "movie",
        value: options.flashPlayerUrl || media.flashPlayerUrl
      }, {
        tagName: "param",
        name: "allowfullscreen",
        value: "true"
      }, {
        tagName: "param",
        name: "allowscriptaccess",
        value: "always"
      }, {
        tagName: "param",
        name: "wmode",
        value: options.wmode
      }, {
        tagName: "param",
        name: "flashvars",
        value: objToQueryParams(flashvars)
      }
    ];
    embedElem = {
      tagName: "embed",
      src: options.flashPlayerUrl || media.flashPlayerUrl,
      name: ruling.uuid,
      type: "application/x-shockwave-flash",
      allowfullscreen: "true",
      allowscriptaccess: "always",
      wmode: options.wmode,
      flashvars: objToQueryParams(flashvars),
      style: relBlockCss("100%", "100%")
    };
    if (options.wmode !== "transparent") {
      embedElem.bgcolor = "#000000";
    }
    objectElem.childNodes = objectParams.concat(embedElem);
    if (W.detect.browser.msie && (W.detect.browser.version < 9 || W.detect.browser.quirks)) {
      if (W.detect.flash.version < 7) {
        objectElem.childNodes = [
          {
            style: "background:#666;color:#fff;height:100%;width:100%;",
            "class": "noflash",
            childNodes: ["Whoops! It looks like Flash isn't installed. Please \n<a href=\"http://get.adobe.com/flashplayer/\" style=\"color:white;text-decoration:underline;\" target=\"_blank\">\ndownload and install Adobe's Flash Player plugin\n</a>\nto watch this video."]
          }
        ];
      }
    }
    return W.util.objToHtml(objectElem);
  };
  html5Video = function(ruling, options) {
    var asset, media, sourceElem, videoElem;
    asset = ruling.asset;
    media = ruling.media;
    options = W.extend({
      autoLoad: true,
      autoPlay: false,
      doNotTrack: false,
      stillUrl: media.assets.still ? media.assets.still.url : ""
    }, options);
    options.shouldTrack = !options.doNotTrack;
    videoElem = document.createElement("video");
    videoElem.style.width = "100%";
    videoElem.style.height = "100%";
    videoElem.style.position = "relative";
    videoElem.style.display = "block";
    videoElem.controls = "controls";
    videoElem.id = ruling.uuid;
    videoElem.poster = options.stillUrl;
    videoElem.preload = "none";
    if (options.autoPlay && !options.suppressAutoplay) {
      videoElem.autoplay = "autoplay";
    }
    sourceElem = document.createElement("source");
    sourceElem.src = asset.url.replace(/\.bin$/, "") + "/file.mp4";
    sourceElem.type = "video/mp4";
    videoElem.appendChild(sourceElem);
    return videoElem;
  };
  externalVideo = function(ruling, options) {
    var aElem, asset, imgElem, media;
    asset = ruling.asset;
    media = ruling.media;
    options = W.extend({
      playButton: true,
      stillUrl: media.assets.still ? media.assets.still.url.replace(/\.bin$/, ".jpg?image_play_button=1") : ""
    }, options);
    aElem = {
      tagName: "a",
      href: asset.url,
      id: ruling.uuid,
      target: "_parent",
      style: relBlockCss("100%", "100%")
    };
    imgElem = {
      tagName: "img",
      src: stillUrl(ruling, options),
      border: 0,
      alt: "Play video",
      style: "height:100%;vertical-align:top;width:100%;"
    };
    aElem.childNodes = [imgElem];
    return W.util.objToHtml(aElem);
  };
  stillUrl = function(ruling, options) {
    var media;
    media = ruling.media;
    if (options.videoWidth && options.videoHeight) {
      if (options.playButton) {
        return media.assets.still.url.replace(/\.bin$/, ".jpg?image_play_button=1&image_crop_resized=" + options.videoWidth + "x" + options.videoHeight);
      } else {
        return media.assets.still.url.replace(/\.bin$/, ".jpg?image_crop_resized=" + options.videoWidth + "x" + options.videoHeight);
      }
    } else {
      if (options.playButton) {
        return media.assets.still.url.replace(/\.bin$/, ".jpg?image_play_button=1");
      } else {
        return media.assets.still.url.replace(/\.bin$/, ".jpg");
      }
    }
  };
  return W.extend({
    generate: {
      video: function(embedType, ruling, options) {
        if (embedType === "flash") {
          return flashVideo(ruling, options);
        } else if (embedType === "html5") {
          return html5Video(ruling, options);
        } else if (embedType === "external") {
          return externalVideo(ruling, options);
        } else if (embedType === "stillUrl") {
          return stillUrl(ruling, options);
        }
      }
    }
  });
})(Wistia);
/*
# V I D E O
#
#   (all video classes extend this)
*/
(function(W) {
  W._embed.Video = (function() {
    function Video(data, options) {
      var match;
      this.data = data;
      this.options = options;
      this.params = W.extend(this.params || {}, this.options);
      this.params.container = W._embed.getContainer(this.data, this.options);
      if (this.options.platformPreference) {
        this.params.plea = this.options.platformPreference;
      }
      this.params.shouldTrack = !this.options.doNotTrack;
      if (this.options.playButtonVisible != null) {
        this.params.playButton = this.options.playButtonVisible;
      }
      this.params.rawEmbed = top === self;
      if (this.params.videoWidth) {
        this.params.videoWidth = parseInt(this.params.videoWidth, 10);
      }
      if (this.params.videoHeight) {
        this.params.videoHeight = parseInt(this.params.videoHeight, 10);
      }
      this.params.aspectRatio = this.params.videoWidth / this.params.videoHeight;
      if (!this.params.playerColor) {
        this.params.playerColor = "636155";
      }
      if (!this.params.trackEmail) {
        if ((match = location.href.match(/wemail\=([^\&]+)/)) != null) {
          this.params.trackEmail = match[1];
        }
      }
      if (!this.params.stillUrl) {
        this.params.stillUrl = W.obj.exists(this.data, "media.assets.still.url") ? this.data.media.assets.still.url : "";
      }
      if (!this.params.uuid) {
        this.params.uuid = W.seqId();
      }
      this.uuid = this.params.uuid;
    }
    Video.prototype.embed = function() {
      this.embedAs(this.embedType);
      return this.ready(__bind(function() {
        return this.monitorSize();
      }, this));
    };
    Video.prototype.monitorSize = function() {
      var autoResize, containerHeight, containerWidth, lastHeight, lastWidth;
      containerWidth = __bind(function() {
        if (this.params.rawEmbed && W.detect.browser.old) {
          return this.width();
        } else if (this.params.rawEmbed) {
          return W.util.elemWidth(this.container);
        } else {
          return W.util.winWidth();
        }
      }, this);
      containerHeight = __bind(function() {
        if (this.params.rawEmbed && W.detect.browser.old) {
          return this.height();
        } else if (this.params.rawEmbed) {
          return W.util.elemHeight(this.container);
        } else {
          return W.util.winHeight();
        }
      }, this);
      lastWidth = containerWidth();
      lastHeight = containerHeight();
      autoResize = __bind(function() {
        var heightNow, widthNow;
        widthNow = containerWidth();
        heightNow = containerHeight();
        if (lastWidth !== widthNow) {
          this.width(widthNow);
          lastWidth = widthNow;
        }
        if (lastHeight !== heightNow) {
          this.height(heightNow);
          lastHeight = heightNow;
        }
        W.timeout("" + this.uuid + ".auto_resize", autoResize, 1000);
      }, this);
      autoResize();
    };
    Video.prototype.embedAs = function(embedType) {
      this.container = this.params.container;
      this.embedCode = W.generate.video(embedType, this.data, this.params);
      this.placeEmbed(this.embedCode);
      return this;
    };
    Video.prototype.placeEmbed = function(embedCode) {
      var container;
      container = (this.grid && this.grid.center) || this.container;
      if (typeof embedCode === "string") {
        container.innerHTML = embedCode;
      } else {
        container.innerHTML = "";
        container.appendChild(embedCode);
      }
      return this.ieSizeHack();
    };
    Video.prototype.rebuildAs = function(embedType) {
      var key, ruling, savedUuid, val, vid, vidClass;
      savedUuid = this.uuid;
      ruling = W.judy.judge(this.data.media, {
        force: embedType
      });
      vidClass = W._embed.classFor(ruling.embedType);
      vid = new vidClass(ruling, this.options);
      for (key in vid) {
        val = vid[key];
        this[key] = val;
      }
      this.uuid = savedUuid;
      W.clearTimeouts(this.uuid);
      this._isReady = false;
      this.embed(this.params.container);
      return this;
    };
    Video.prototype.remove = function() {
      W.clearTimeouts(this.uuid);
      W._data.video[this.uuid] = null;
      delete W._data.video[this.uuid];
      this.container.innerHTML = "";
    };
    Video.prototype.bind = function(event, callback) {
      if (!this._bindings) {
        this._bindings = {};
      }
      if (!this._bindings[event]) {
        this._bindings[event] = [];
      }
      this._bindings[event].push(callback);
      return this;
    };
    Video.prototype.unbind = function(event, callback) {
      var callbacks, i, trimmedCallbacks, _ref;
      callbacks = this._bindings[event];
      if (callbacks) {
        if (callback) {
          trimmedCallbacks = [];
          for (i = 0, _ref = callbacks.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
            if (callback !== callbacks[i]) {
              trimmedCallbacks.push(callbacks[i]);
            }
          }
          this._bindings[event] = trimmedCallbacks;
        } else {
          this._bindings[event] = [];
        }
      }
      if (this._bindings[event] && !this._bindings[event].length) {
        this._bindings[event] = null;
        delete this._bindings[event];
      }
      return this;
    };
    Video.prototype.hasBindings = function() {
      var key, result, val, _ref;
      result = false;
      _ref = this._bindings;
      for (key in _ref) {
        val = _ref[key];
        if (this._bindings.hasOwnProperty(key)) {
          result = true;
        }
      }
      return result;
    };
    Video.prototype.trigger = function() {
      var args, bindings, callback, event, _i, _len;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if ((bindings = this._bindings[event])) {
        for (_i = 0, _len = bindings.length; _i < _len; _i++) {
          callback = bindings[_i];
          if (callback) {
            callback.apply(this, args);
          }
        }
      }
      return this;
    };
    Video.prototype._eventLoopDuration = 300;
    Video.prototype.play = function() {
      return this.ready("play");
    };
    Video.prototype.pause = function() {
      return this.ready("pause");
    };
    Video.prototype.time = function(t) {
      if (t != null) {
        this.ready("time", t);
        return this;
      } else {

      }
    };
    Video.prototype.state = function() {
      return "unknown";
    };
    Video.prototype.duration = function() {
      return 0;
    };
    Video.prototype.getEventKey = function() {
      return null;
    };
    Video.prototype.volume = function(level) {
      if (level != null) {
        return this.ready("volume", level);
      } else {
        return 0;
      }
    };
    Video.prototype.setPlayerColor = function(color) {
      this.ready("setPlayerColor", color);
      return this;
    };
    Video.prototype.ready = function() {
      var args, callback, func, _i, _len, _ref;
      callback = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!this._readyQueue) {
        this._readyQueue = [];
      }
      if (this._isReady) {
        if (callback) {
          this._readyQueue.push({
            callback: callback,
            args: args
          });
        }
        _ref = this._readyQueue;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          func = _ref[_i];
          if (typeof func.callback === "string") {
            this[func.callback].apply(this, func.args);
          } else {
            func.callback.apply(this, func.args);
          }
        }
        this._readyQueue = [];
      } else {
        if (callback) {
          this._readyQueue.push({
            callback: callback,
            args: args
          });
        }
      }
      return this;
    };
    Video.prototype.width = function(w) {
      var result;
      if (w != null) {
        w = parseInt(w, 10);
        if (this.grid) {
          this.container.style.width = this.grid.wrapper.style.width = "" + w + "px";
          this.grid.center.style.width = "100%";
          this.elem().style.width = "100%";
          W.grid.fitHorizontal(this);
          W.grid.fitVertical(this);
        } else {
          this.container.style.width = "" + w + "px";
          this.elem().style.width = "100%";
        }
        return this;
      } else {
        if (W.detect.browser.old) {
          this.elem().style.position = "absolute";
        }
        if (this.grid) {
          result = W.util.elemWidth(this.grid.left) + W.util.elemWidth(this.grid.center) + W.util.elemWidth(this.grid.right);
        } else {
          result = W.util.elemWidth(this.container);
        }
        if (W.detect.browser.old) {
          this.elem().style.position = "static";
        }
        return result;
      }
    };
    Video.prototype.height = function(h) {
      var result;
      if (h != null) {
        h = parseInt(h, 10);
        if (this.grid) {
          this.container.style.height = this.grid.wrapper.style.height = "" + h + "px";
          this.grid.center.style.height = "100%";
          this.elem().style.height = "100%";
          W.grid.fitHorizontal(this);
          W.grid.fitVertical(this);
        } else {
          this.container.style.height = "" + h + "px";
          this.elem().style.height = "100%";
        }
        return this;
      } else {
        if (W.detect.browser.old) {
          this.elem().style.position = "absolute";
        }
        if (this.grid) {
          result = W.util.elemHeight(this.grid.center) + Math.max(W.util.elemHeight(this.grid.above), W.util.elemHeight(this.grid.top)) + Math.max(W.util.elemHeight(this.grid.below), W.util.elemHeight(this.grid.bottom));
        } else {
          result = W.util.elemHeight(this.container);
        }
        if (W.detect.browser.old) {
          this.elem().style.position = "static";
        }
        return result;
      }
    };
    Video.prototype.videoWidth = function(w) {
      var extraWidth, result;
      if (w != null) {
        w = parseInt(w, 10);
        if (this.grid) {
          this.grid.center.style.width = "100%";
          this.grid.main.style.width = "" + w + "px";
          this.grid.main.style.width = "" + w + "px";
          extraWidth = W.util.elemWidth(this.grid.left) + W.util.elemWidth(this.grid.right);
          this.container.style.width = this.grid.wrapper.style.width = "" + (w + extraWidth) + "px";
          W.grid.fitHorizontal(this);
          W.grid.fitVertical(this);
        } else {
          this.container.style.width = "" + w + "px";
          this.elem().style.width = "100%";
        }
        return this;
      } else {
        if (W.detect.browser.old) {
          this.elem().style.position = "absolute";
        }
        if (this.grid) {
          result = W.util.elemWidth(this.grid.center);
        } else {
          result = W.util.elemWidth(this.container);
        }
        if (W.detect.browser.old) {
          this.elem().style.position = "static";
        }
        return result;
      }
    };
    Video.prototype.videoHeight = function(h) {
      var bh, extraHeight, result, th;
      if (h != null) {
        h = parseInt(h, 10);
        if (this.grid) {
          this.grid.main.style.height = "" + h + "px";
          this.grid.center.style.height = "100%";
          this.grid.main.style.height = "" + h + "px";
          th = Math.max(W.util.elemHeight(this.grid.above), W.util.elemHeight(this.grid.top));
          bh = Math.max(W.util.elemHeight(this.grid.below), W.util.elemHeight(this.grid.bottom));
          extraHeight = th + bh;
          this.container.style.height = this.grid.wrapper.style.height = "" + (h + extraHeight) + "px";
          W.grid.fitHorizontal(this);
          W.grid.fitVertical(this);
        } else {
          this.container.style.height = "" + h + "px";
          this.elem().style.height = "100%";
        }
        return this;
      } else {
        if (W.detect.browser.old) {
          this.elem().style.position = "absolute";
        }
        if (this.grid) {
          result = W.util.elemHeight(this.grid.center);
        } else {
          result = W.util.elemHeight(this.container);
        }
        if (W.detect.browser.old) {
          this.elem().style.position = "static";
        }
        return result;
      }
    };
    Video.prototype.ieSizeHack = function() {
      if (W.detect.browser.msie && this.elem && this.elem()) {
        if (this.elem().offsetLeft % 2 === 0) {
          this.elem().style.width = "" + (this.videoWidth() + 1) + "px";
        } else {
          this.elem().style.width = "100%";
        }
      }
    };
    Video.prototype.setEmail = function(email) {
      return this.params.trackEmail = email;
    };
    Video.prototype.getVisitorKey = function() {
      if (this.tracker) {
        return this.tracker.visitorKey();
      } else {
        return "";
      }
    };
    Video.prototype.getEventKey = function() {
      if (this.tracker) {
        return this.tracker.eventKey();
      } else {
        return "";
      }
    };
    return Video;
  })();
})(Wistia);
/*
# F L A S H   V I D E O
#
#   (the main deal)
*/
(function(W) {
  W._embed.FlashVideo = (function() {
    __extends(FlashVideo, W._embed.Video);
    function FlashVideo() {
      FlashVideo.__super__.constructor.apply(this, arguments);
    }
    FlashVideo.prototype.embedType = "flash";
    FlashVideo.prototype.elem = function() {
      return document[this.data.uuid];
    };
    FlashVideo.prototype.embed = function() {
      var readyCheckFunc;
      FlashVideo.__super__.embed.apply(this, arguments);
      this._lastTimePosition = 0;
      W.timeout("" + this.uuid + ".quick_repair", __bind(function() {
        if (this.isBroken()) {
          W.clearTimeouts(this.uuid);
          this.repair();
        }
      }, this), 50);
      readyCheckFunc = __bind(function(tries) {
        if (tries >= 50) {
          return;
        }
        if (this.elem() && this.elem().getCurrentTime) {
          if (!this.isBroken()) {
            W.timeout("" + this.uuid + ".ready_delay", __bind(function() {
              this._isReady = true;
              this.ready();
              this.listenForEvents();
              if (!this.tracker) {
                return this.tracker = W.tracker(this);
              }
            }, this), 200);
          }
        } else {
          W.timeout("" + this.uuid + ".ready_check", (__bind(function() {
            return readyCheckFunc.call(this, tries + 1);
          }, this)), 200);
        }
      }, this);
      readyCheckFunc();
      return this;
    };
    FlashVideo.prototype.remove = function() {
      W.clearTimeouts(this.uuid);
      return FlashVideo.__super__.remove.call(this);
    };
    FlashVideo.prototype.listenForEvents = function() {
      this._fireIfChanged = __bind(function() {
        var state, timePosition;
        if (!this.hasBindings()) {
          return;
        }
        W.timeout("" + this.uuid + ".fire_if_changed", (__bind(function() {
          return this._fireIfChanged.call(this);
        }, this)), this._eventLoopDuration);
        state = this.state();
        timePosition = this.time();
        if (state !== this._lastState) {
          if (state === "playing") {
            this.trigger("play");
          } else if (state === "paused") {
            this.trigger("pause");
          } else if (state === "ended") {
            this.trigger("end");
          }
        }
        if (timePosition !== this._lastTimePosition) {
          this.trigger("timechange", timePosition);
          this._lastTimePosition = timePosition;
        }
        this._lastState = state;
      }, this);
      this._fireIfChanged.call(this);
    };
    FlashVideo.prototype.bind = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      FlashVideo.__super__.bind.apply(this, args);
      if (W.timeout("" + this.uuid + ".fire_if_changed") == null) {
        if (!this._isReady) {
          return this.ready("listenForEvents");
        }
        this.listenForEvents();
      }
      return this;
    };
    FlashVideo.prototype.play = function() {
      if (!this._isReady) {
        return this.ready("play");
      }
      this.elem().videoPlay();
      return this;
    };
    FlashVideo.prototype.pause = function() {
      if (!this._isReady) {
        return this.ready("pause");
      }
      this.elem().videoPause();
      return this;
    };
    FlashVideo.prototype.time = function(t) {
      var seekOnPlay, self, state;
      if ((t != null) && !this._isReady) {
        return this.ready("time", t);
      }
      if (t != null) {
        state = this.state();
        if (state === "unknown") {
          this.elem().videoPlay();
          self = this;
          seekOnPlay = function() {
            self.unbind("timechange", seekOnPlay);
            return self.elem().videoSeek(t);
          };
          this.bind("timechange", seekOnPlay);
        } else {
          this.elem().videoSeek(t);
          if (state === "paused" || state === "ended") {
            this.pause();
          }
        }
        return this;
      } else {
        try {
          return this.elem().getCurrentTime();
        } catch (e) {
          return -1;
        }
      }
    };
    FlashVideo.prototype.state = function() {
      try {
        switch (this.elem().getCurrentState()) {
          case 0:
            return "ended";
          case 1:
            return "playing";
          case 2:
            return "paused";
          default:
            return "unknown";
        }
      } catch (e) {
        return "unknown";
      }
    };
    FlashVideo.prototype.volume = function(level) {
      var result;
      if (level && !this._isReady) {
        return this.ready("volume", level);
      }
      if (level != null) {
        this.elem().setVolume(Math.min(Math.round(level * 100), 100));
        return this;
      } else {
        result = this.elem().getVolume();
        if (result > 0) {
          result /= 100.0;
        }
        return result;
      }
    };
    FlashVideo.prototype.duration = function() {
      return this.data.media.duration;
    };
    FlashVideo.prototype.outsideContainer = function() {
      var currentNode;
      currentNode = this.elem();
      while (currentNode.nodeType === 1) {
        currentNode = currentNode.parentNode;
        if (currentNode === this.container) {
          return false;
        }
      }
      return true;
    };
    FlashVideo.prototype.ctfBlocked = function() {
      return document.getElementById("CTFstack") && this.outsideContainer();
    };
    FlashVideo.prototype.chromeFlashBlocked = function() {
      var e1, e2;
      if (W.detect.browser.webkit && this.elem()) {
        e1 = this.elem().parentNode.previousSibling;
        if (e1) {
          e2 = e1.childNodes[0];
        }
        return e2 && e2.getAttribute("style") && e2.getAttribute("style").indexOf("gofhjkjmkpinhpoiabjplobcaignabnl") !== -1;
      }
    };
    FlashVideo.prototype.ffFlashBlocked = function() {
      var e1;
      e1 = this.container.childNodes[0];
      return e1 && e1.getAttribute("bgactive") && e1.getAttribute("bgactive").indexOf("flashblock") !== -1;
    };
    FlashVideo.prototype.isBlocked = function() {
      return W.detect.flash.version >= 7 && (this.ctfBlocked() || this.chromeFlashBlocked());
    };
    FlashVideo.prototype.isBroken = function() {
      return W.detect.flash.version < 7 || this.isBlocked();
    };
    FlashVideo.prototype.repair = function() {
      if (this.isBlocked() && W.detect.video.h264) {
        W.clearTimeouts(this.uuid);
        this.rebuildAs("html5");
      }
    };
    FlashVideo.prototype.getEventKey = function() {
      try {
        return this.elem().getEventKey();
      } catch (e) {
        return "";
      }
    };
    FlashVideo.prototype.setPlayerColor = function(color) {
      this.params.playerColor = color;
      if (this._isReady) {
        this.elem().changeColor(color);
      } else {
        this.ready("setPlayerColor", color);
      }
    };
    FlashVideo.prototype.setEmail = function(email) {
      FlashVideo.__super__.setEmail.call(this, email);
      return this.elem().setEmail(email);
    };
    return FlashVideo;
  })();
})(Wistia);
/*
# H T M L 5   V I D E O
#
#  (the other main deal)
*/
(function(W) {
  var listenOnce;
  listenOnce = function(elem, event, callback) {
    var afterTrigger;
    afterTrigger = __bind(function() {
      elem.removeEventListener(event, afterTrigger);
      return callback();
    }, this);
    elem.addEventListener(event, afterTrigger);
  };
  W._embed.Html5Video = (function() {
    __extends(Html5Video, W._embed.Video);
    function Html5Video() {
      Html5Video.__super__.constructor.apply(this, arguments);
    }
    Html5Video.prototype.embedType = "html5";
    Html5Video.prototype.elem = function() {
      return document.getElementById(this.data.uuid);
    };
    Html5Video.prototype.embed = function() {
      Html5Video.__super__.embed.apply(this, arguments);
      if (this.hasPreRoll) {
        this.embedExternal();
      } else {
        this.embedHtml5();
      }
      if (this.hasPostRoll) {
        this.preloadStill();
        this.bind("end", __bind(function() {
          return this.embedExternal();
        }, this));
      }
      return this;
    };
    Html5Video.prototype.preloadStill = function() {
      var img;
      img = new Image();
      if (this.options.playButton) {
        return img.src = W.generate.video("stillUrl", this.data, this.params);
      } else {
        return img.src = W.generate.video("stillUrl", this.data, this.params);
      }
    };
    Html5Video.prototype.embedExternal = function() {
      var hasPlayButton;
      if (this.tracker) {
        this.tracker.stopMonitoring();
      }
      hasPlayButton = this.params.playButton;
      this.params.playButton = this.options.playButton;
      this.embedAs("external");
      this.params.playButton = hasPlayButton;
      W.timeout("" + this.uuid + ".vid_ready", __bind(function() {
        this._isReady = true;
        return this.ready();
      }, this));
      return this.elem().addEventListener("click", __bind(function(event) {
        event.preventDefault();
        this.embedHtml5();
        return this.play();
      }, this));
    };
    Html5Video.prototype.embedHtml5 = function() {
      this._isReady = false;
      this.embedAs("external");
      this.embedAs("html5");
      if (!this.tracker) {
        this.tracker = W.tracker(this);
      }
      if (this.params.shouldTrack) {
        this.ready(__bind(function() {
          return this.tracker.monitor();
        }, this));
      }
      this.elem().addEventListener("playing", (__bind(function() {
        return this.trigger("play");
      }, this)));
      this.elem().addEventListener("pause", (__bind(function() {
        return this.trigger("pause");
      }, this)));
      this.elem().addEventListener("ended", (__bind(function() {
        return this.trigger("end");
      }, this)));
      W.timeout("" + this.uuid + ".vid_ready", __bind(function() {
        this._isReady = true;
        return this.ready();
      }, this));
      return this.listenForEvents();
    };
    Html5Video.prototype.remove = function() {
      W.clearTimeouts(this.uuid);
      return Html5Video.__super__.remove.call(this);
    };
    Html5Video.prototype.listenForEvents = function() {
      if (!this._bindings) {
        this._bindings = {};
      }
      this._fireIfChanged = __bind(function() {
        var timePosition;
        if (!this.hasBindings()) {
          return;
        }
        W.timeout("" + this.uuid + ".fire_if_changed", (__bind(function() {
          return this._fireIfChanged.call(this);
        }, this)), this._eventLoopDuration);
        if ((timePosition = this.time()) !== this._lastTimePosition) {
          this.trigger("timechange", timePosition);
          this._lastTimePosition = timePosition;
        }
      }, this);
      this._fireIfChanged();
    };
    Html5Video.prototype.bind = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      Html5Video.__super__.bind.apply(this, args);
      if (!W.timeout("" + this.uuid + ".fire_if_changed")) {
        this.listenForEvents();
      }
      return this;
    };
    Html5Video.prototype.play = function(callback) {
      if (/video/i.test(this.elem().tagName)) {
        if (!this._isReady) {
          return this.ready("play");
        }
        this.elem().play();
      } else {
        this.embedHtml5();
        this.play();
      }
      return this;
    };
    Html5Video.prototype.pause = function() {
      if (!this._isReady) {
        return this.ready("pause");
      }
      this.elem().pause();
      return this;
    };
    Html5Video.prototype.time = function(t) {
      if (t && !this._isReady) {
        return this.ready("time", t);
      }
      if (t != null) {
        if (this.state() === "unknown") {
          listenOnce("playing", __bind(function() {
            listenOnce(this.elem(), "seeked", __bind(function() {
              return this.pause();
            }, this));
            this.elem().currentTime = t;
          }, this));
          this.play();
        } else {
          this.elem().currentTime = t;
        }
        return this;
      }
      return this.elem().currentTime;
    };
    Html5Video.prototype.state = function() {
      try {
        if (this.elem().ended) {
          return "ended";
        } else if (this.elem().played.length === 0) {
          return "paused";
        } else if (this.elem().paused) {
          return "paused";
        } else {
          return "playing";
        }
      } catch (e) {
        return "unknown";
      }
    };
    Html5Video.prototype.volume = function(level) {
      if (level && !this._isReady) {
        return this.ready("volume", level);
      }
      if (level != null) {
        this.elem().volume = level;
        return this;
      } else {
        return this.elem().volume;
      }
    };
    Html5Video.prototype.duration = function() {
      return this.data.media.duration;
    };
    Html5Video.prototype.setPlayerColor = function() {};
    return Html5Video;
  })();
})(Wistia);
/*
# E X T E R N A L   V I D E O
#
#   (no player functionality)
*/
(function(W) {
  W._embed.ExternalVideo = (function() {
    __extends(ExternalVideo, W._embed.Video);
    function ExternalVideo() {
      ExternalVideo.__super__.constructor.apply(this, arguments);
    }
    ExternalVideo.prototype.embedType = "external";
    ExternalVideo.prototype.elem = function() {
      return document.getElementById(this.data.uuid);
    };
    ExternalVideo.prototype.embed = function(containerId) {
      ExternalVideo.__super__.embed.call(this, containerId);
      this.params.stillUrl = this.elem().childNodes[0].src;
      this.elem().addEventListener("click", __bind(function() {
        this.trigger("play");
        W.timeout("" + this.uuid + ".fake_video_end", __bind(function() {
          return this.trigger("end");
        }, this), 500);
        return false;
      }, this));
      this._isReady = true;
      this.ready();
      return this;
    };
    ExternalVideo.prototype.duration = function() {
      return this.data.media.duration;
    };
    return ExternalVideo;
  })();
})(Wistia);
/*
# V I D E O   T R A C K E R
#
#   (distillery tracking for html5 only)
*/
(function(W) {
  W.extend({
    tracker: function(video, options) {
      return new W.VideoTracker(video, options || {});
    }
  });
  return W.VideoTracker = (function() {
    var clockStart, dataPrefix, dataSuffix, eventQueue, monitoring, onEnd, onPause, onPlay, onTimeChange;
    onPlay = onPause = onEnd = onTimeChange = function() {};
    monitoring = false;
    dataPrefix = "";
    dataSuffix = "";
    clockStart = 0;
    eventQueue = [];
    function VideoTracker(video, options) {
      this.video = video;
      this.options = options;
      this.params = W.extend({
        transmitInterval: 10000
      }, this.options);
      eventQueue = [];
      clockStart = new Date().getTime();
      this._eventKey = this.newEventKey();
      this._visitorKey = this.visitorKeyFromCookie() || this.newVisitorKey();
      this.log("initialized");
      if (this.video.embedType === "html5") {
        this.transmit();
      }
      this;
    }
    VideoTracker.prototype._dataPrefix = function() {
      var result;
      result = "{\n\"account_key\":\"" + this.video.data.media.accountKey + "\",\n\"session_id\":\"" + this._visitorKey + "\",\n\"media_id\":\"" + this.video.data.media.mediaKey + "\",\n\"event_key\":\"" + this._eventKey + "\",\n\"media_duration\":" + (parseFloat(this.video.data.media.duration)) + ",\n\"referrer\":\"" + (this.video.params.pageUrl || window.location.href) + "\",";
      if (this.video.params.trackEmail) {
        result += "\"email\":\"" + this.video.params.trackEmail + "\",";
      }
      result += "\"event_details\":[";
      return result;
    };
    VideoTracker.prototype._dataSuffix = function() {
      return "]}";
    };
    VideoTracker.prototype.visitorKeyFromCookie = function() {
      var cookie_strs, i, parts;
      cookie_strs = document.cookie.split("; ");
      i = 0;
      while (i < cookie_strs.length) {
        parts = cookie_strs[i].split("=");
        if (parts[0] === "__distillery") {
          return parts[1];
        }
        i++;
      }
    };
    VideoTracker.prototype.newVisitorKey = function() {
      var aYearFromToday, visitorKey;
      visitorKey = (new Date().getTime()).toString() + "-" + Math.random();
      aYearFromToday = new Date();
      aYearFromToday.setTime(aYearFromToday.getTime() + (365 * 24 * 60 * 60 * 1000));
      document.cookie = "__distillery=" + visitorKey + "; expires=" + (aYearFromToday.toGMTString()) + "; path=/";
      return visitorKey;
    };
    VideoTracker.prototype.newEventKey = function() {
      if (this.video.embedType === "flash") {
        return this.video.getEventKey();
      } else {
        return (new Date().getTime()).toString() + "e" + Math.random();
      }
    };
    VideoTracker.prototype.monitor = function() {
      onPlay = __bind(function() {
        this.log("play");
      }, this);
      onPause = __bind(function() {
        if (Math.abs(this.video.duration() - this.video.time()) > .3) {
          this.log("pause");
        }
      }, this);
      onEnd = __bind(function() {
        this.log("end");
        this.transmit();
      }, this);
      onTimeChange = __bind(function(t) {
        if (Math.abs(this.video._lastTimePosition - t) >= 5) {
          this.log("seek");
        }
      }, this);
      monitoring = true;
      this.video.bind("play", onPlay);
      this.video.bind("pause", onPause);
      this.video.bind("end", onEnd);
      this.video.bind("timechange", onTimeChange);
      W.timeout("" + this.uuid + ".start_tracking_timeout", __bind(function() {
        var trackingLoopFunc;
        trackingLoopFunc = __bind(function() {
          if (this.video.state() === "playing") {
            this.log("update");
          }
          this.transmit();
          return W.timeout("" + this.uuid + ".tracking_loop", trackingLoopFunc, this.params.transmitInterval);
        }, this);
        W.timeout("" + this.uuid + ".tracking_loop", trackingLoopFunc, this.params.transmitInterval);
        this.transmit();
      }, this), Math.random() * this.params.transmitInterval + 1000);
      if (this.video.state() === "playing") {
        onPlay();
      }
    };
    VideoTracker.prototype.stopMonitoring = function() {
      monitoring = false;
      this.video.unbind("play", onPlay);
      this.video.unbind("pause", onPause);
      this.video.unbind("end", onEnd);
      this.video.unbind("timechange", onTimeChange);
    };
    VideoTracker.prototype.postToDistillery = function(data) {
      W.remote.post("" + this.video.data.media.distilleryUrl + "?data=" + (encodeURIComponent(data)));
    };
    VideoTracker.prototype.transmit = function() {
      var data;
      if (this.video.params.doNotTrack) {
        return;
      }
      if (eventQueue.length !== 0) {
        data = this._dataPrefix() + eventQueue.join(",") + this._dataSuffix();
        this.postToDistillery(W.base64.encode(data));
        eventQueue = [];
      }
    };
    VideoTracker.prototype.log = function(action) {
      var timeDelta, timeInVideo;
      if (this.video.params.doNotTrack) {
        return;
      }
      timeInVideo = this.video.time();
      if (timeInVideo == null) {
        if (this.video.state() === "unknown") {
          timeInVideo = 0;
        } else {
          timeInVideo = this.video.duration();
        }
      }
      timeInVideo = timeInVideo.toFixed(1);
      timeDelta = (new Date().getTime()) - clockStart;
      eventQueue.push("{\n\"key\":\"" + action + "\",\n\"value\":" + timeInVideo + ",\n\"timeDelta\":" + timeDelta + "\n}");
    };
    VideoTracker.prototype.visitorKey = function() {
      return this._visitorKey;
    };
    VideoTracker.prototype.eventKey = function() {
      return this._eventKey;
    };
    return VideoTracker;
  })();
})(Wistia);
/*
# B A S E 6 4   E N C O D E R
#
#   (for the video tracker mostly)
*/
Wistia.extend({
  base64: {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(input) {
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4, i, output;
      i = 0;
      output = "";
      while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }
        output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
      }
      return output;
    }
  }
});
/*
# R E M O T E   D A T A
#
#   (jsonp interface)
*/
(function(W) {
  return W.extend({
    constant: {
      embedHost: "fast.wistia.com"
    },
    remote: {
      post: function(url) {
        var http;
        http = window.XDomainRequest ? new window.XDomainRequest() : new window.XMLHttpRequest();
        http.open("POST", url, true);
        http.send();
      },
      media: function(hashedId, callback) {
        var url;
        if (W.data(["remote-media", hashedId])) {
          W.timeout("remote-media." + hashedId + "." + (W.seqId()), function() {
            return callback(W.data(["remote-media", hashedId]));
          });
        } else {
          url = "" + window.location.protocol + "//" + W.constant.embedHost + "/embed/medias/" + hashedId + ".json";
          this.fetch(url, {}, function(mediaWithOpts) {
            if (mediaWithOpts.error) {
              W.data(["remote-media", hashedId], mediaWithOpts);
              callback(mediaWithOpts);
            } else {
              W.data(["remote-media", hashedId], mediaWithOpts.media);
              callback(mediaWithOpts.media);
            }
          }, {
            onerror: function() {
              if (window.console) {
                console.log("Timed out fetching " + url);
              }
            },
            timeout: 10000
          });
        }
      },
      playlist: function(playlistId, callback) {
        var url;
        if (W.data(["remote-playlist", playlistId])) {
          W.timeout("remote-playlist." + playlistId + "." + (W.seqId()), function() {
            return callback(W.data(["remote-playlist", playlistId]));
          });
        } else {
          url = "" + window.location.protocol + "//" + W.constant.embedHost + "/embed/playlists/" + playlistId + ".json";
          this.fetch(url, {}, function(playlist) {
            W.data(["remote-playlist", playlistId], playlist);
            callback(playlist);
          }, {
            onerror: function() {
              if (window.console) {
                console.log("Timed out fetching " + url);
              }
            },
            timeout: 10000
          });
        }
      },
      fetch: function(url, params, callback, options) {
        var errorTimeout;
        if (!options.timeout) {
          options.timeout = 5000;
        }
        if (!options.onerror) {
          options.onerror = (function() {});
        }
        errorTimeout = setTimeout(options.onerror, options.timeout);
        W.jsonp.get(url, params, function(data) {
          clearTimeout(errorTimeout);
          if (callback) {
            callback(data);
          }
        });
      }
    }
  });
})(Wistia);

if (!Wistia.jsonp) {
  Wistia.jsonp = (function(){
    var counter = 0, head, query, key, window = this;
    function load(url) {
      var script = document.createElement('script'),
        done = false;
      script.src = url;
      script.async = true;

      script.onload = script.onreadystatechange = function() {
        if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
          done = true;
          script.onload = script.onreadystatechange = null;
          if ( script && script.parentNode ) {
            script.parentNode.removeChild( script );
          }
        }
      };
      if ( !head ) {
        head = document.getElementsByTagName('head')[0];
      }
      head.appendChild( script );
    }
    function jsonp(url, params, callback) {
      query = "?";
      params = params || {};
      for ( key in params ) {
        if ( params.hasOwnProperty(key) ) {
          query += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
        }
      }
      var jsonp = "json" + (++counter);
      window[ jsonp ] = function(data){
        callback(data);
        try {
          delete window[ jsonp ];
        } catch (e) {}
        window[ jsonp ] = null;
      };

      load(url + query + "callback=" + jsonp);
      return jsonp;
    }
    return {
      get:jsonp
    };
  }());
}
;
/*
# P L U G I N   B A S E
#
#   (framework for plugins)
*/
(function(W) {
  if (!W.Plugin) {
    W.Plugin = {};
  }
  W.Plugin.Base = (function() {
    function Base() {
      this.pluginName = "plugin";
      this;
    }
    Base.prototype.instances = function() {
      return W.data(["plugins", this.pluginName, this.video.uuid]);
    };
    Base.prototype.register = function(data) {
      this.video.plugins[this.uuid] = data;
      return W.data(["plugins", this.pluginName, this.video.uuid, this.uuid], data);
    };
    Base.prototype.remove = function() {
      this.video.plugins[this.uuid] = null;
      W.removeData(["plugins", this.pluginName, this.video.uuid, this.uuid]);
      delete this.video.plugins[this.uuid];
      if (this.video.grid) {
        W.grid.fitHorizontal(this.video);
        return W.grid.fitVertical(this.video);
      }
    };
    Base.prototype.fit = function() {};
    Base.prototype.init = function(video, pluginOptions) {
      if (video.plugins == null) {
        video.plugins = {};
      }
      this.video = video;
      this.options = pluginOptions || {};
      this.params = W.extend({}, pluginOptions || {});
      return this.uuid = this.params.uuid || W.seqId("wistia_", "_plugin");
    };
    return Base;
  })();
  return W.extend({
    plugin: {
      init: function(pluginName, video, options) {
        var instance, klass, klassName;
        klassName = pluginName.charAt(0).toUpperCase() + pluginName.substr(1);
        klass = W.Plugin[klassName];
        instance = new klass();
        instance.init(video, options);
        return instance;
      },
      instance: function(pluginName, video, pluginUuid) {
        return W.data(["plugins", pluginName, video.uuid, pluginUuid]);
      },
      remove: function(pluginName, video, pluginUuid) {
        var _ref;
        if ((_ref = this.instance(pluginName, video, pluginUuid)) != null) {
          _ref.remove();
        }
      },
      isActive: function(pluginName, video, pluginUuid) {
        return !!this.instance(pluginName, video, pluginUuid);
      }
    }
  });
})(Wistia);
