import { p as re } from "./index-CftWVgXE.js";
import { wmsCapabilitiesParser as yt, wmtsCapabilitiesParser as Et } from "./parsers.js";
import { CapabilitiesError as I } from "./validation.js";
function Je(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: St } = Object.prototype, { getPrototypeOf: Se } = Object, { iterator: oe, toStringTag: Ve } = Symbol, ie = /* @__PURE__ */ ((e) => (t) => {
  const n = St.call(t);
  return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), N = (e) => (e = e.toLowerCase(), (t) => ie(t) === e), ae = (e) => (t) => typeof t === e, { isArray: $ } = Array, H = ae("undefined");
function V(e) {
  return e !== null && !H(e) && e.constructor !== null && !H(e.constructor) && T(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const Ke = N("ArrayBuffer");
function gt(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Ke(e.buffer), t;
}
const Rt = ae("string"), T = ae("function"), Ge = ae("number"), K = (e) => e !== null && typeof e == "object", Ot = (e) => e === !0 || e === !1, ee = (e) => {
  if (ie(e) !== "object")
    return !1;
  const t = Se(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Ve in e) && !(oe in e);
}, Tt = (e) => {
  if (!K(e) || V(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, At = N("Date"), Ct = N("File"), Pt = N("Blob"), xt = N("FileList"), Nt = (e) => K(e) && T(e.pipe), Ft = (e) => {
  let t;
  return e && (typeof FormData == "function" && e instanceof FormData || T(e.append) && ((t = ie(e)) === "formdata" || // detect form-data instance
  t === "object" && T(e.toString) && e.toString() === "[object FormData]"));
}, _t = N("URLSearchParams"), [Ut, Lt, kt, Bt] = ["ReadableStream", "Request", "Response", "Headers"].map(N), Dt = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function G(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let r, s;
  if (typeof e != "object" && (e = [e]), $(e))
    for (r = 0, s = e.length; r < s; r++)
      t.call(null, e[r], r, e);
  else {
    if (V(e))
      return;
    const i = n ? Object.getOwnPropertyNames(e) : Object.keys(e), o = i.length;
    let c;
    for (r = 0; r < o; r++)
      c = i[r], t.call(null, e[c], c, e);
  }
}
function ve(e, t) {
  if (V(e))
    return null;
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length, s;
  for (; r-- > 0; )
    if (s = n[r], t === s.toLowerCase())
      return s;
  return null;
}
const D = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Xe = (e) => !H(e) && e !== D;
function me() {
  const { caseless: e, skipUndefined: t } = Xe(this) && this || {}, n = {}, r = (s, i) => {
    const o = e && ve(n, i) || i;
    ee(n[o]) && ee(s) ? n[o] = me(n[o], s) : ee(s) ? n[o] = me({}, s) : $(s) ? n[o] = s.slice() : (!t || !H(s)) && (n[o] = s);
  };
  for (let s = 0, i = arguments.length; s < i; s++)
    arguments[s] && G(arguments[s], r);
  return n;
}
const jt = (e, t, n, { allOwnKeys: r } = {}) => (G(t, (s, i) => {
  n && T(s) ? e[i] = Je(s, n) : e[i] = s;
}, { allOwnKeys: r }), e), Mt = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), qt = (e, t, n, r) => {
  e.prototype = Object.create(t.prototype, r), e.prototype.constructor = e, Object.defineProperty(e, "super", {
    value: t.prototype
  }), n && Object.assign(e.prototype, n);
}, It = (e, t, n, r) => {
  let s, i, o;
  const c = {};
  if (t = t || {}, e == null) return t;
  do {
    for (s = Object.getOwnPropertyNames(e), i = s.length; i-- > 0; )
      o = s[i], (!r || r(o, e, t)) && !c[o] && (t[o] = e[o], c[o] = !0);
    e = n !== !1 && Se(e);
  } while (e && (!n || n(e, t)) && e !== Object.prototype);
  return t;
}, Ht = (e, t, n) => {
  e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
  const r = e.indexOf(t, n);
  return r !== -1 && r === n;
}, $t = (e) => {
  if (!e) return null;
  if ($(e)) return e;
  let t = e.length;
  if (!Ge(t)) return null;
  const n = new Array(t);
  for (; t-- > 0; )
    n[t] = e[t];
  return n;
}, Wt = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && Se(Uint8Array)), zt = (e, t) => {
  const r = (e && e[oe]).call(e);
  let s;
  for (; (s = r.next()) && !s.done; ) {
    const i = s.value;
    t.call(e, i[0], i[1]);
  }
}, Jt = (e, t) => {
  let n;
  const r = [];
  for (; (n = e.exec(t)) !== null; )
    r.push(n);
  return r;
}, Vt = N("HTMLFormElement"), Kt = (e) => e.toLowerCase().replace(
  /[-_\s]([a-z\d])(\w*)/g,
  function(n, r, s) {
    return r.toUpperCase() + s;
  }
), Ne = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), Gt = N("RegExp"), Qe = (e, t) => {
  const n = Object.getOwnPropertyDescriptors(e), r = {};
  G(n, (s, i) => {
    let o;
    (o = t(s, i, e)) !== !1 && (r[i] = o || s);
  }), Object.defineProperties(e, r);
}, vt = (e) => {
  Qe(e, (t, n) => {
    if (T(e) && ["arguments", "caller", "callee"].indexOf(n) !== -1)
      return !1;
    const r = e[n];
    if (T(r)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + n + "'");
      });
    }
  });
}, Xt = (e, t) => {
  const n = {}, r = (s) => {
    s.forEach((i) => {
      n[i] = !0;
    });
  };
  return $(e) ? r(e) : r(String(e).split(t)), n;
}, Qt = () => {
}, Yt = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function Zt(e) {
  return !!(e && T(e.append) && e[Ve] === "FormData" && e[oe]);
}
const en = (e) => {
  const t = new Array(10), n = (r, s) => {
    if (K(r)) {
      if (t.indexOf(r) >= 0)
        return;
      if (V(r))
        return r;
      if (!("toJSON" in r)) {
        t[s] = r;
        const i = $(r) ? [] : {};
        return G(r, (o, c) => {
          const d = n(o, s + 1);
          !H(d) && (i[c] = d);
        }), t[s] = void 0, i;
      }
    }
    return r;
  };
  return n(e, 0);
}, tn = N("AsyncFunction"), nn = (e) => e && (K(e) || T(e)) && T(e.then) && T(e.catch), Ye = ((e, t) => e ? setImmediate : t ? ((n, r) => (D.addEventListener("message", ({ source: s, data: i }) => {
  s === D && i === n && r.length && r.shift()();
}, !1), (s) => {
  r.push(s), D.postMessage(n, "*");
}))(`axios@${Math.random()}`, []) : (n) => setTimeout(n))(
  typeof setImmediate == "function",
  T(D.postMessage)
), rn = typeof queueMicrotask < "u" ? queueMicrotask.bind(D) : typeof process < "u" && process.nextTick || Ye, sn = (e) => e != null && T(e[oe]), a = {
  isArray: $,
  isArrayBuffer: Ke,
  isBuffer: V,
  isFormData: Ft,
  isArrayBufferView: gt,
  isString: Rt,
  isNumber: Ge,
  isBoolean: Ot,
  isObject: K,
  isPlainObject: ee,
  isEmptyObject: Tt,
  isReadableStream: Ut,
  isRequest: Lt,
  isResponse: kt,
  isHeaders: Bt,
  isUndefined: H,
  isDate: At,
  isFile: Ct,
  isBlob: Pt,
  isRegExp: Gt,
  isFunction: T,
  isStream: Nt,
  isURLSearchParams: _t,
  isTypedArray: Wt,
  isFileList: xt,
  forEach: G,
  merge: me,
  extend: jt,
  trim: Dt,
  stripBOM: Mt,
  inherits: qt,
  toFlatObject: It,
  kindOf: ie,
  kindOfTest: N,
  endsWith: Ht,
  toArray: $t,
  forEachEntry: zt,
  matchAll: Jt,
  isHTMLForm: Vt,
  hasOwnProperty: Ne,
  hasOwnProp: Ne,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: Qe,
  freezeMethods: vt,
  toObjectSet: Xt,
  toCamelCase: Kt,
  noop: Qt,
  toFiniteNumber: Yt,
  findKey: ve,
  global: D,
  isContextDefined: Xe,
  isSpecCompliantForm: Zt,
  toJSONObject: en,
  isAsyncFn: tn,
  isThenable: nn,
  setImmediate: Ye,
  asap: rn,
  isIterable: sn
};
function w(e, t, n, r, s) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = e, this.name = "AxiosError", t && (this.code = t), n && (this.config = n), r && (this.request = r), s && (this.response = s, this.status = s.status ? s.status : null);
}
a.inherits(w, Error, {
  toJSON: function() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: a.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
const Ze = w.prototype, et = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((e) => {
  et[e] = { value: e };
});
Object.defineProperties(w, et);
Object.defineProperty(Ze, "isAxiosError", { value: !0 });
w.from = (e, t, n, r, s, i) => {
  const o = Object.create(Ze);
  a.toFlatObject(e, o, function(l) {
    return l !== Error.prototype;
  }, (f) => f !== "isAxiosError");
  const c = e && e.message ? e.message : "Error", d = t == null && e ? e.code : t;
  return w.call(o, c, d, n, r, s), e && o.cause == null && Object.defineProperty(o, "cause", { value: e, configurable: !0 }), o.name = e && e.name || "Error", i && Object.assign(o, i), o;
};
const on = null;
function we(e) {
  return a.isPlainObject(e) || a.isArray(e);
}
function tt(e) {
  return a.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function Fe(e, t, n) {
  return e ? e.concat(t).map(function(s, i) {
    return s = tt(s), !n && i ? "[" + s + "]" : s;
  }).join(n ? "." : "") : t;
}
function an(e) {
  return a.isArray(e) && !e.some(we);
}
const cn = a.toFlatObject(a, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function ce(e, t, n) {
  if (!a.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new FormData(), n = a.toFlatObject(n, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function(m, p) {
    return !a.isUndefined(p[m]);
  });
  const r = n.metaTokens, s = n.visitor || l, i = n.dots, o = n.indexes, d = (n.Blob || typeof Blob < "u" && Blob) && a.isSpecCompliantForm(t);
  if (!a.isFunction(s))
    throw new TypeError("visitor must be a function");
  function f(u) {
    if (u === null) return "";
    if (a.isDate(u))
      return u.toISOString();
    if (a.isBoolean(u))
      return u.toString();
    if (!d && a.isBlob(u))
      throw new w("Blob is not supported. Use a Buffer instead.");
    return a.isArrayBuffer(u) || a.isTypedArray(u) ? d && typeof Blob == "function" ? new Blob([u]) : Buffer.from(u) : u;
  }
  function l(u, m, p) {
    let E = u;
    if (u && !p && typeof u == "object") {
      if (a.endsWith(m, "{}"))
        m = r ? m : m.slice(0, -2), u = JSON.stringify(u);
      else if (a.isArray(u) && an(u) || (a.isFileList(u) || a.endsWith(m, "[]")) && (E = a.toArray(u)))
        return m = tt(m), E.forEach(function(S, O) {
          !(a.isUndefined(S) || S === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            o === !0 ? Fe([m], O, i) : o === null ? m : m + "[]",
            f(S)
          );
        }), !1;
    }
    return we(u) ? !0 : (t.append(Fe(p, m, i), f(u)), !1);
  }
  const h = [], b = Object.assign(cn, {
    defaultVisitor: l,
    convertValue: f,
    isVisitable: we
  });
  function g(u, m) {
    if (!a.isUndefined(u)) {
      if (h.indexOf(u) !== -1)
        throw Error("Circular reference detected in " + m.join("."));
      h.push(u), a.forEach(u, function(E, C) {
        (!(a.isUndefined(E) || E === null) && s.call(
          t,
          E,
          a.isString(C) ? C.trim() : C,
          m,
          b
        )) === !0 && g(E, m ? m.concat(C) : [C]);
      }), h.pop();
    }
  }
  if (!a.isObject(e))
    throw new TypeError("data must be an object");
  return g(e), t;
}
function _e(e) {
  const t = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(e).replace(/[!'()~]|%20|%00/g, function(r) {
    return t[r];
  });
}
function ge(e, t) {
  this._pairs = [], e && ce(e, this, t);
}
const nt = ge.prototype;
nt.append = function(t, n) {
  this._pairs.push([t, n]);
};
nt.toString = function(t) {
  const n = t ? function(r) {
    return t.call(this, r, _e);
  } : _e;
  return this._pairs.map(function(s) {
    return n(s[0]) + "=" + n(s[1]);
  }, "").join("&");
};
function ln(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function rt(e, t, n) {
  if (!t)
    return e;
  const r = n && n.encode || ln;
  a.isFunction(n) && (n = {
    serialize: n
  });
  const s = n && n.serialize;
  let i;
  if (s ? i = s(t, n) : i = a.isURLSearchParams(t) ? t.toString() : new ge(t, n).toString(r), i) {
    const o = e.indexOf("#");
    o !== -1 && (e = e.slice(0, o)), e += (e.indexOf("?") === -1 ? "?" : "&") + i;
  }
  return e;
}
class Ue {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(t, n, r) {
    return this.handlers.push({
      fulfilled: t,
      rejected: n,
      synchronous: r ? r.synchronous : !1,
      runWhen: r ? r.runWhen : null
    }), this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(t) {
    this.handlers[t] && (this.handlers[t] = null);
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = []);
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(t) {
    a.forEach(this.handlers, function(r) {
      r !== null && t(r);
    });
  }
}
const st = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, un = typeof URLSearchParams < "u" ? URLSearchParams : ge, fn = typeof FormData < "u" ? FormData : null, dn = typeof Blob < "u" ? Blob : null, pn = {
  isBrowser: !0,
  classes: {
    URLSearchParams: un,
    FormData: fn,
    Blob: dn
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Re = typeof window < "u" && typeof document < "u", be = typeof navigator == "object" && navigator || void 0, hn = Re && (!be || ["ReactNative", "NativeScript", "NS"].indexOf(be.product) < 0), mn = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", wn = Re && window.location.href || "http://localhost", bn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Re,
  hasStandardBrowserEnv: hn,
  hasStandardBrowserWebWorkerEnv: mn,
  navigator: be,
  origin: wn
}, Symbol.toStringTag, { value: "Module" })), R = {
  ...bn,
  ...pn
};
function yn(e, t) {
  return ce(e, new R.classes.URLSearchParams(), {
    visitor: function(n, r, s, i) {
      return R.isNode && a.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : i.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
function En(e) {
  return a.matchAll(/\w+|\[(\w*)]/g, e).map((t) => t[0] === "[]" ? "" : t[1] || t[0]);
}
function Sn(e) {
  const t = {}, n = Object.keys(e);
  let r;
  const s = n.length;
  let i;
  for (r = 0; r < s; r++)
    i = n[r], t[i] = e[i];
  return t;
}
function ot(e) {
  function t(n, r, s, i) {
    let o = n[i++];
    if (o === "__proto__") return !0;
    const c = Number.isFinite(+o), d = i >= n.length;
    return o = !o && a.isArray(s) ? s.length : o, d ? (a.hasOwnProp(s, o) ? s[o] = [s[o], r] : s[o] = r, !c) : ((!s[o] || !a.isObject(s[o])) && (s[o] = []), t(n, r, s[o], i) && a.isArray(s[o]) && (s[o] = Sn(s[o])), !c);
  }
  if (a.isFormData(e) && a.isFunction(e.entries)) {
    const n = {};
    return a.forEachEntry(e, (r, s) => {
      t(En(r), s, n, 0);
    }), n;
  }
  return null;
}
function gn(e, t, n) {
  if (a.isString(e))
    try {
      return (t || JSON.parse)(e), a.trim(e);
    } catch (r) {
      if (r.name !== "SyntaxError")
        throw r;
    }
  return (n || JSON.stringify)(e);
}
const v = {
  transitional: st,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function(t, n) {
    const r = n.getContentType() || "", s = r.indexOf("application/json") > -1, i = a.isObject(t);
    if (i && a.isHTMLForm(t) && (t = new FormData(t)), a.isFormData(t))
      return s ? JSON.stringify(ot(t)) : t;
    if (a.isArrayBuffer(t) || a.isBuffer(t) || a.isStream(t) || a.isFile(t) || a.isBlob(t) || a.isReadableStream(t))
      return t;
    if (a.isArrayBufferView(t))
      return t.buffer;
    if (a.isURLSearchParams(t))
      return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
    let c;
    if (i) {
      if (r.indexOf("application/x-www-form-urlencoded") > -1)
        return yn(t, this.formSerializer).toString();
      if ((c = a.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
        const d = this.env && this.env.FormData;
        return ce(
          c ? { "files[]": t } : t,
          d && new d(),
          this.formSerializer
        );
      }
    }
    return i || s ? (n.setContentType("application/json", !1), gn(t)) : t;
  }],
  transformResponse: [function(t) {
    const n = this.transitional || v.transitional, r = n && n.forcedJSONParsing, s = this.responseType === "json";
    if (a.isResponse(t) || a.isReadableStream(t))
      return t;
    if (t && a.isString(t) && (r && !this.responseType || s)) {
      const o = !(n && n.silentJSONParsing) && s;
      try {
        return JSON.parse(t, this.parseReviver);
      } catch (c) {
        if (o)
          throw c.name === "SyntaxError" ? w.from(c, w.ERR_BAD_RESPONSE, this, null, this.response) : c;
      }
    }
    return t;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: R.classes.FormData,
    Blob: R.classes.Blob
  },
  validateStatus: function(t) {
    return t >= 200 && t < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
a.forEach(["delete", "get", "head", "post", "put", "patch"], (e) => {
  v.headers[e] = {};
});
const Rn = a.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]), On = (e) => {
  const t = {};
  let n, r, s;
  return e && e.split(`
`).forEach(function(o) {
    s = o.indexOf(":"), n = o.substring(0, s).trim().toLowerCase(), r = o.substring(s + 1).trim(), !(!n || t[n] && Rn[n]) && (n === "set-cookie" ? t[n] ? t[n].push(r) : t[n] = [r] : t[n] = t[n] ? t[n] + ", " + r : r);
  }), t;
}, Le = Symbol("internals");
function J(e) {
  return e && String(e).trim().toLowerCase();
}
function te(e) {
  return e === !1 || e == null ? e : a.isArray(e) ? e.map(te) : String(e);
}
function Tn(e) {
  const t = /* @__PURE__ */ Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; r = n.exec(e); )
    t[r[1]] = r[2];
  return t;
}
const An = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function de(e, t, n, r, s) {
  if (a.isFunction(r))
    return r.call(this, t, n);
  if (s && (t = n), !!a.isString(t)) {
    if (a.isString(r))
      return t.indexOf(r) !== -1;
    if (a.isRegExp(r))
      return r.test(t);
  }
}
function Cn(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function Pn(e, t) {
  const n = a.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((r) => {
    Object.defineProperty(e, r + n, {
      value: function(s, i, o) {
        return this[r].call(this, t, s, i, o);
      },
      configurable: !0
    });
  });
}
let A = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, n, r) {
    const s = this;
    function i(c, d, f) {
      const l = J(d);
      if (!l)
        throw new Error("header name must be a non-empty string");
      const h = a.findKey(s, l);
      (!h || s[h] === void 0 || f === !0 || f === void 0 && s[h] !== !1) && (s[h || d] = te(c));
    }
    const o = (c, d) => a.forEach(c, (f, l) => i(f, l, d));
    if (a.isPlainObject(t) || t instanceof this.constructor)
      o(t, n);
    else if (a.isString(t) && (t = t.trim()) && !An(t))
      o(On(t), n);
    else if (a.isObject(t) && a.isIterable(t)) {
      let c = {}, d, f;
      for (const l of t) {
        if (!a.isArray(l))
          throw TypeError("Object iterator must return a key-value pair");
        c[f = l[0]] = (d = c[f]) ? a.isArray(d) ? [...d, l[1]] : [d, l[1]] : l[1];
      }
      o(c, n);
    } else
      t != null && i(n, t, r);
    return this;
  }
  get(t, n) {
    if (t = J(t), t) {
      const r = a.findKey(this, t);
      if (r) {
        const s = this[r];
        if (!n)
          return s;
        if (n === !0)
          return Tn(s);
        if (a.isFunction(n))
          return n.call(this, s, r);
        if (a.isRegExp(n))
          return n.exec(s);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (t = J(t), t) {
      const r = a.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || de(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let s = !1;
    function i(o) {
      if (o = J(o), o) {
        const c = a.findKey(r, o);
        c && (!n || de(r, r[c], c, n)) && (delete r[c], s = !0);
      }
    }
    return a.isArray(t) ? t.forEach(i) : i(t), s;
  }
  clear(t) {
    const n = Object.keys(this);
    let r = n.length, s = !1;
    for (; r--; ) {
      const i = n[r];
      (!t || de(this, this[i], i, t, !0)) && (delete this[i], s = !0);
    }
    return s;
  }
  normalize(t) {
    const n = this, r = {};
    return a.forEach(this, (s, i) => {
      const o = a.findKey(r, i);
      if (o) {
        n[o] = te(s), delete n[i];
        return;
      }
      const c = t ? Cn(i) : String(i).trim();
      c !== i && delete n[i], n[c] = te(s), r[c] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const n = /* @__PURE__ */ Object.create(null);
    return a.forEach(this, (r, s) => {
      r != null && r !== !1 && (n[s] = t && a.isArray(r) ? r.join(", ") : r);
    }), n;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([t, n]) => t + ": " + n).join(`
`);
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(t) {
    return t instanceof this ? t : new this(t);
  }
  static concat(t, ...n) {
    const r = new this(t);
    return n.forEach((s) => r.set(s)), r;
  }
  static accessor(t) {
    const r = (this[Le] = this[Le] = {
      accessors: {}
    }).accessors, s = this.prototype;
    function i(o) {
      const c = J(o);
      r[c] || (Pn(s, o), r[c] = !0);
    }
    return a.isArray(t) ? t.forEach(i) : i(t), this;
  }
};
A.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
a.reduceDescriptors(A.prototype, ({ value: e }, t) => {
  let n = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(r) {
      this[n] = r;
    }
  };
});
a.freezeMethods(A);
function pe(e, t) {
  const n = this || v, r = t || n, s = A.from(r.headers);
  let i = r.data;
  return a.forEach(e, function(c) {
    i = c.call(n, i, s.normalize(), t ? t.status : void 0);
  }), s.normalize(), i;
}
function it(e) {
  return !!(e && e.__CANCEL__);
}
function W(e, t, n) {
  w.call(this, e ?? "canceled", w.ERR_CANCELED, t, n), this.name = "CanceledError";
}
a.inherits(W, w, {
  __CANCEL__: !0
});
function at(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status) ? e(n) : t(new w(
    "Request failed with status code " + n.status,
    [w.ERR_BAD_REQUEST, w.ERR_BAD_RESPONSE][Math.floor(n.status / 100) - 4],
    n.config,
    n.request,
    n
  ));
}
function xn(e) {
  const t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
  return t && t[1] || "";
}
function Nn(e, t) {
  e = e || 10;
  const n = new Array(e), r = new Array(e);
  let s = 0, i = 0, o;
  return t = t !== void 0 ? t : 1e3, function(d) {
    const f = Date.now(), l = r[i];
    o || (o = f), n[s] = d, r[s] = f;
    let h = i, b = 0;
    for (; h !== s; )
      b += n[h++], h = h % e;
    if (s = (s + 1) % e, s === i && (i = (i + 1) % e), f - o < t)
      return;
    const g = l && f - l;
    return g ? Math.round(b * 1e3 / g) : void 0;
  };
}
function Fn(e, t) {
  let n = 0, r = 1e3 / t, s, i;
  const o = (f, l = Date.now()) => {
    n = l, s = null, i && (clearTimeout(i), i = null), e(...f);
  };
  return [(...f) => {
    const l = Date.now(), h = l - n;
    h >= r ? o(f, l) : (s = f, i || (i = setTimeout(() => {
      i = null, o(s);
    }, r - h)));
  }, () => s && o(s)];
}
const se = (e, t, n = 3) => {
  let r = 0;
  const s = Nn(50, 250);
  return Fn((i) => {
    const o = i.loaded, c = i.lengthComputable ? i.total : void 0, d = o - r, f = s(d), l = o <= c;
    r = o;
    const h = {
      loaded: o,
      total: c,
      progress: c ? o / c : void 0,
      bytes: d,
      rate: f || void 0,
      estimated: f && c && l ? (c - o) / f : void 0,
      event: i,
      lengthComputable: c != null,
      [t ? "download" : "upload"]: !0
    };
    e(h);
  }, n);
}, ke = (e, t) => {
  const n = e != null;
  return [(r) => t[0]({
    lengthComputable: n,
    total: e,
    loaded: r
  }), t[1]];
}, Be = (e) => (...t) => a.asap(() => e(...t)), _n = R.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (n) => (n = new URL(n, R.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(
  new URL(R.origin),
  R.navigator && /(msie|trident)/i.test(R.navigator.userAgent)
) : () => !0, Un = R.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, n, r, s, i) {
      const o = [e + "=" + encodeURIComponent(t)];
      a.isNumber(n) && o.push("expires=" + new Date(n).toGMTString()), a.isString(r) && o.push("path=" + r), a.isString(s) && o.push("domain=" + s), i === !0 && o.push("secure"), document.cookie = o.join("; ");
    },
    read(e) {
      const t = document.cookie.match(new RegExp("(^|;\\s*)(" + e + ")=([^;]*)"));
      return t ? decodeURIComponent(t[3]) : null;
    },
    remove(e) {
      this.write(e, "", Date.now() - 864e5);
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function Ln(e) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function kn(e, t) {
  return t ? e.replace(/\/?\/$/, "") + "/" + t.replace(/^\/+/, "") : e;
}
function ct(e, t, n) {
  let r = !Ln(t);
  return e && (r || n == !1) ? kn(e, t) : t;
}
const De = (e) => e instanceof A ? { ...e } : e;
function M(e, t) {
  t = t || {};
  const n = {};
  function r(f, l, h, b) {
    return a.isPlainObject(f) && a.isPlainObject(l) ? a.merge.call({ caseless: b }, f, l) : a.isPlainObject(l) ? a.merge({}, l) : a.isArray(l) ? l.slice() : l;
  }
  function s(f, l, h, b) {
    if (a.isUndefined(l)) {
      if (!a.isUndefined(f))
        return r(void 0, f, h, b);
    } else return r(f, l, h, b);
  }
  function i(f, l) {
    if (!a.isUndefined(l))
      return r(void 0, l);
  }
  function o(f, l) {
    if (a.isUndefined(l)) {
      if (!a.isUndefined(f))
        return r(void 0, f);
    } else return r(void 0, l);
  }
  function c(f, l, h) {
    if (h in t)
      return r(f, l);
    if (h in e)
      return r(void 0, f);
  }
  const d = {
    url: i,
    method: i,
    data: i,
    baseURL: o,
    transformRequest: o,
    transformResponse: o,
    paramsSerializer: o,
    timeout: o,
    timeoutMessage: o,
    withCredentials: o,
    withXSRFToken: o,
    adapter: o,
    responseType: o,
    xsrfCookieName: o,
    xsrfHeaderName: o,
    onUploadProgress: o,
    onDownloadProgress: o,
    decompress: o,
    maxContentLength: o,
    maxBodyLength: o,
    beforeRedirect: o,
    transport: o,
    httpAgent: o,
    httpsAgent: o,
    cancelToken: o,
    socketPath: o,
    responseEncoding: o,
    validateStatus: c,
    headers: (f, l, h) => s(De(f), De(l), h, !0)
  };
  return a.forEach(Object.keys({ ...e, ...t }), function(l) {
    const h = d[l] || s, b = h(e[l], t[l], l);
    a.isUndefined(b) && h !== c || (n[l] = b);
  }), n;
}
const lt = (e) => {
  const t = M({}, e);
  let { data: n, withXSRFToken: r, xsrfHeaderName: s, xsrfCookieName: i, headers: o, auth: c } = t;
  if (t.headers = o = A.from(o), t.url = rt(ct(t.baseURL, t.url, t.allowAbsoluteUrls), e.params, e.paramsSerializer), c && o.set(
    "Authorization",
    "Basic " + btoa((c.username || "") + ":" + (c.password ? unescape(encodeURIComponent(c.password)) : ""))
  ), a.isFormData(n)) {
    if (R.hasStandardBrowserEnv || R.hasStandardBrowserWebWorkerEnv)
      o.setContentType(void 0);
    else if (a.isFunction(n.getHeaders)) {
      const d = n.getHeaders(), f = ["content-type", "content-length"];
      Object.entries(d).forEach(([l, h]) => {
        f.includes(l.toLowerCase()) && o.set(l, h);
      });
    }
  }
  if (R.hasStandardBrowserEnv && (r && a.isFunction(r) && (r = r(t)), r || r !== !1 && _n(t.url))) {
    const d = s && i && Un.read(i);
    d && o.set(s, d);
  }
  return t;
}, Bn = typeof XMLHttpRequest < "u", Dn = Bn && function(e) {
  return new Promise(function(n, r) {
    const s = lt(e);
    let i = s.data;
    const o = A.from(s.headers).normalize();
    let { responseType: c, onUploadProgress: d, onDownloadProgress: f } = s, l, h, b, g, u;
    function m() {
      g && g(), u && u(), s.cancelToken && s.cancelToken.unsubscribe(l), s.signal && s.signal.removeEventListener("abort", l);
    }
    let p = new XMLHttpRequest();
    p.open(s.method.toUpperCase(), s.url, !0), p.timeout = s.timeout;
    function E() {
      if (!p)
        return;
      const S = A.from(
        "getAllResponseHeaders" in p && p.getAllResponseHeaders()
      ), x = {
        data: !c || c === "text" || c === "json" ? p.responseText : p.response,
        status: p.status,
        statusText: p.statusText,
        headers: S,
        config: e,
        request: p
      };
      at(function(P) {
        n(P), m();
      }, function(P) {
        r(P), m();
      }, x), p = null;
    }
    "onloadend" in p ? p.onloadend = E : p.onreadystatechange = function() {
      !p || p.readyState !== 4 || p.status === 0 && !(p.responseURL && p.responseURL.indexOf("file:") === 0) || setTimeout(E);
    }, p.onabort = function() {
      p && (r(new w("Request aborted", w.ECONNABORTED, e, p)), p = null);
    }, p.onerror = function(O) {
      const x = O && O.message ? O.message : "Network Error", k = new w(x, w.ERR_NETWORK, e, p);
      k.event = O || null, r(k), p = null;
    }, p.ontimeout = function() {
      let O = s.timeout ? "timeout of " + s.timeout + "ms exceeded" : "timeout exceeded";
      const x = s.transitional || st;
      s.timeoutErrorMessage && (O = s.timeoutErrorMessage), r(new w(
        O,
        x.clarifyTimeoutError ? w.ETIMEDOUT : w.ECONNABORTED,
        e,
        p
      )), p = null;
    }, i === void 0 && o.setContentType(null), "setRequestHeader" in p && a.forEach(o.toJSON(), function(O, x) {
      p.setRequestHeader(x, O);
    }), a.isUndefined(s.withCredentials) || (p.withCredentials = !!s.withCredentials), c && c !== "json" && (p.responseType = s.responseType), f && ([b, u] = se(f, !0), p.addEventListener("progress", b)), d && p.upload && ([h, g] = se(d), p.upload.addEventListener("progress", h), p.upload.addEventListener("loadend", g)), (s.cancelToken || s.signal) && (l = (S) => {
      p && (r(!S || S.type ? new W(null, e, p) : S), p.abort(), p = null);
    }, s.cancelToken && s.cancelToken.subscribe(l), s.signal && (s.signal.aborted ? l() : s.signal.addEventListener("abort", l)));
    const C = xn(s.url);
    if (C && R.protocols.indexOf(C) === -1) {
      r(new w("Unsupported protocol " + C + ":", w.ERR_BAD_REQUEST, e));
      return;
    }
    p.send(i || null);
  });
}, jn = (e, t) => {
  const { length: n } = e = e ? e.filter(Boolean) : [];
  if (t || n) {
    let r = new AbortController(), s;
    const i = function(f) {
      if (!s) {
        s = !0, c();
        const l = f instanceof Error ? f : this.reason;
        r.abort(l instanceof w ? l : new W(l instanceof Error ? l.message : l));
      }
    };
    let o = t && setTimeout(() => {
      o = null, i(new w(`timeout ${t} of ms exceeded`, w.ETIMEDOUT));
    }, t);
    const c = () => {
      e && (o && clearTimeout(o), o = null, e.forEach((f) => {
        f.unsubscribe ? f.unsubscribe(i) : f.removeEventListener("abort", i);
      }), e = null);
    };
    e.forEach((f) => f.addEventListener("abort", i));
    const { signal: d } = r;
    return d.unsubscribe = () => a.asap(c), d;
  }
}, Mn = function* (e, t) {
  let n = e.byteLength;
  if (n < t) {
    yield e;
    return;
  }
  let r = 0, s;
  for (; r < n; )
    s = r + t, yield e.slice(r, s), r = s;
}, qn = async function* (e, t) {
  for await (const n of In(e))
    yield* Mn(n, t);
}, In = async function* (e) {
  if (e[Symbol.asyncIterator]) {
    yield* e;
    return;
  }
  const t = e.getReader();
  try {
    for (; ; ) {
      const { done: n, value: r } = await t.read();
      if (n)
        break;
      yield r;
    }
  } finally {
    await t.cancel();
  }
}, je = (e, t, n, r) => {
  const s = qn(e, t);
  let i = 0, o, c = (d) => {
    o || (o = !0, r && r(d));
  };
  return new ReadableStream({
    async pull(d) {
      try {
        const { done: f, value: l } = await s.next();
        if (f) {
          c(), d.close();
          return;
        }
        let h = l.byteLength;
        if (n) {
          let b = i += h;
          n(b);
        }
        d.enqueue(new Uint8Array(l));
      } catch (f) {
        throw c(f), f;
      }
    },
    cancel(d) {
      return c(d), s.return();
    }
  }, {
    highWaterMark: 2
  });
}, Me = 64 * 1024, { isFunction: Z } = a, Hn = (({ Request: e, Response: t }) => ({
  Request: e,
  Response: t
}))(a.global), {
  ReadableStream: qe,
  TextEncoder: Ie
} = a.global, He = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, $n = (e) => {
  e = a.merge.call({
    skipUndefined: !0
  }, Hn, e);
  const { fetch: t, Request: n, Response: r } = e, s = t ? Z(t) : typeof fetch == "function", i = Z(n), o = Z(r);
  if (!s)
    return !1;
  const c = s && Z(qe), d = s && (typeof Ie == "function" ? /* @__PURE__ */ ((u) => (m) => u.encode(m))(new Ie()) : async (u) => new Uint8Array(await new n(u).arrayBuffer())), f = i && c && He(() => {
    let u = !1;
    const m = new n(R.origin, {
      body: new qe(),
      method: "POST",
      get duplex() {
        return u = !0, "half";
      }
    }).headers.has("Content-Type");
    return u && !m;
  }), l = o && c && He(() => a.isReadableStream(new r("").body)), h = {
    stream: l && ((u) => u.body)
  };
  s && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((u) => {
    !h[u] && (h[u] = (m, p) => {
      let E = m && m[u];
      if (E)
        return E.call(m);
      throw new w(`Response type '${u}' is not supported`, w.ERR_NOT_SUPPORT, p);
    });
  });
  const b = async (u) => {
    if (u == null)
      return 0;
    if (a.isBlob(u))
      return u.size;
    if (a.isSpecCompliantForm(u))
      return (await new n(R.origin, {
        method: "POST",
        body: u
      }).arrayBuffer()).byteLength;
    if (a.isArrayBufferView(u) || a.isArrayBuffer(u))
      return u.byteLength;
    if (a.isURLSearchParams(u) && (u = u + ""), a.isString(u))
      return (await d(u)).byteLength;
  }, g = async (u, m) => {
    const p = a.toFiniteNumber(u.getContentLength());
    return p ?? b(m);
  };
  return async (u) => {
    let {
      url: m,
      method: p,
      data: E,
      signal: C,
      cancelToken: S,
      timeout: O,
      onDownloadProgress: x,
      onUploadProgress: k,
      responseType: P,
      headers: ue,
      withCredentials: X = "same-origin",
      fetchOptions: Oe
    } = lt(u), Te = t || fetch;
    P = P ? (P + "").toLowerCase() : "text";
    let Q = jn([C, S && S.toAbortSignal()], O), z = null;
    const B = Q && Q.unsubscribe && (() => {
      Q.unsubscribe();
    });
    let Ae;
    try {
      if (k && f && p !== "get" && p !== "head" && (Ae = await g(ue, E)) !== 0) {
        let L = new n(m, {
          method: "POST",
          body: E,
          duplex: "half"
        }), q;
        if (a.isFormData(E) && (q = L.headers.get("content-type")) && ue.setContentType(q), L.body) {
          const [fe, Y] = ke(
            Ae,
            se(Be(k))
          );
          E = je(L.body, Me, fe, Y);
        }
      }
      a.isString(X) || (X = X ? "include" : "omit");
      const F = i && "credentials" in n.prototype, Ce = {
        ...Oe,
        signal: Q,
        method: p.toUpperCase(),
        headers: ue.normalize().toJSON(),
        body: E,
        duplex: "half",
        credentials: F ? X : void 0
      };
      z = i && new n(m, Ce);
      let U = await (i ? Te(z, Oe) : Te(m, Ce));
      const Pe = l && (P === "stream" || P === "response");
      if (l && (x || Pe && B)) {
        const L = {};
        ["status", "statusText", "headers"].forEach((xe) => {
          L[xe] = U[xe];
        });
        const q = a.toFiniteNumber(U.headers.get("content-length")), [fe, Y] = x && ke(
          q,
          se(Be(x), !0)
        ) || [];
        U = new r(
          je(U.body, Me, fe, () => {
            Y && Y(), B && B();
          }),
          L
        );
      }
      P = P || "text";
      let bt = await h[a.findKey(h, P) || "text"](U, u);
      return !Pe && B && B(), await new Promise((L, q) => {
        at(L, q, {
          data: bt,
          headers: A.from(U.headers),
          status: U.status,
          statusText: U.statusText,
          config: u,
          request: z
        });
      });
    } catch (F) {
      throw B && B(), F && F.name === "TypeError" && /Load failed|fetch/i.test(F.message) ? Object.assign(
        new w("Network Error", w.ERR_NETWORK, u, z),
        {
          cause: F.cause || F
        }
      ) : w.from(F, F && F.code, u, z);
    }
  };
}, Wn = /* @__PURE__ */ new Map(), ut = (e) => {
  let t = e ? e.env : {};
  const { fetch: n, Request: r, Response: s } = t, i = [
    r,
    s,
    n
  ];
  let o = i.length, c = o, d, f, l = Wn;
  for (; c--; )
    d = i[c], f = l.get(d), f === void 0 && l.set(d, f = c ? /* @__PURE__ */ new Map() : $n(t)), l = f;
  return f;
};
ut();
const ye = {
  http: on,
  xhr: Dn,
  fetch: {
    get: ut
  }
};
a.forEach(ye, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { value: t });
  }
});
const $e = (e) => `- ${e}`, zn = (e) => a.isFunction(e) || e === null || e === !1, ft = {
  getAdapter: (e, t) => {
    e = a.isArray(e) ? e : [e];
    const { length: n } = e;
    let r, s;
    const i = {};
    for (let o = 0; o < n; o++) {
      r = e[o];
      let c;
      if (s = r, !zn(r) && (s = ye[(c = String(r)).toLowerCase()], s === void 0))
        throw new w(`Unknown adapter '${c}'`);
      if (s && (a.isFunction(s) || (s = s.get(t))))
        break;
      i[c || "#" + o] = s;
    }
    if (!s) {
      const o = Object.entries(i).map(
        ([d, f]) => `adapter ${d} ` + (f === !1 ? "is not supported by the environment" : "is not available in the build")
      );
      let c = n ? o.length > 1 ? `since :
` + o.map($e).join(`
`) : " " + $e(o[0]) : "as no adapter specified";
      throw new w(
        "There is no suitable adapter to dispatch the request " + c,
        "ERR_NOT_SUPPORT"
      );
    }
    return s;
  },
  adapters: ye
};
function he(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new W(null, e);
}
function We(e) {
  return he(e), e.headers = A.from(e.headers), e.data = pe.call(
    e,
    e.transformRequest
  ), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), ft.getAdapter(e.adapter || v.adapter, e)(e).then(function(r) {
    return he(e), r.data = pe.call(
      e,
      e.transformResponse,
      r
    ), r.headers = A.from(r.headers), r;
  }, function(r) {
    return it(r) || (he(e), r && r.response && (r.response.data = pe.call(
      e,
      e.transformResponse,
      r.response
    ), r.response.headers = A.from(r.response.headers))), Promise.reject(r);
  });
}
const dt = "1.12.2", le = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  le[e] = function(r) {
    return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const ze = {};
le.transitional = function(t, n, r) {
  function s(i, o) {
    return "[Axios v" + dt + "] Transitional option '" + i + "'" + o + (r ? ". " + r : "");
  }
  return (i, o, c) => {
    if (t === !1)
      throw new w(
        s(o, " has been removed" + (n ? " in " + n : "")),
        w.ERR_DEPRECATED
      );
    return n && !ze[o] && (ze[o] = !0, console.warn(
      s(
        o,
        " has been deprecated since v" + n + " and will be removed in the near future"
      )
    )), t ? t(i, o, c) : !0;
  };
};
le.spelling = function(t) {
  return (n, r) => (console.warn(`${r} is likely a misspelling of ${t}`), !0);
};
function Jn(e, t, n) {
  if (typeof e != "object")
    throw new w("options must be an object", w.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let s = r.length;
  for (; s-- > 0; ) {
    const i = r[s], o = t[i];
    if (o) {
      const c = e[i], d = c === void 0 || o(c, i, e);
      if (d !== !0)
        throw new w("option " + i + " must be " + d, w.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (n !== !0)
      throw new w("Unknown option " + i, w.ERR_BAD_OPTION);
  }
}
const ne = {
  assertOptions: Jn,
  validators: le
}, _ = ne.validators;
let j = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new Ue(),
      response: new Ue()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(t, n) {
    try {
      return await this._request(t, n);
    } catch (r) {
      if (r instanceof Error) {
        let s = {};
        Error.captureStackTrace ? Error.captureStackTrace(s) : s = new Error();
        const i = s.stack ? s.stack.replace(/^.+\n/, "") : "";
        try {
          r.stack ? i && !String(r.stack).endsWith(i.replace(/^.+\n.+\n/, "")) && (r.stack += `
` + i) : r.stack = i;
        } catch {
        }
      }
      throw r;
    }
  }
  _request(t, n) {
    typeof t == "string" ? (n = n || {}, n.url = t) : n = t || {}, n = M(this.defaults, n);
    const { transitional: r, paramsSerializer: s, headers: i } = n;
    r !== void 0 && ne.assertOptions(r, {
      silentJSONParsing: _.transitional(_.boolean),
      forcedJSONParsing: _.transitional(_.boolean),
      clarifyTimeoutError: _.transitional(_.boolean)
    }, !1), s != null && (a.isFunction(s) ? n.paramsSerializer = {
      serialize: s
    } : ne.assertOptions(s, {
      encode: _.function,
      serialize: _.function
    }, !0)), n.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : n.allowAbsoluteUrls = !0), ne.assertOptions(n, {
      baseUrl: _.spelling("baseURL"),
      withXsrfToken: _.spelling("withXSRFToken")
    }, !0), n.method = (n.method || this.defaults.method || "get").toLowerCase();
    let o = i && a.merge(
      i.common,
      i[n.method]
    );
    i && a.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (u) => {
        delete i[u];
      }
    ), n.headers = A.concat(o, i);
    const c = [];
    let d = !0;
    this.interceptors.request.forEach(function(m) {
      typeof m.runWhen == "function" && m.runWhen(n) === !1 || (d = d && m.synchronous, c.unshift(m.fulfilled, m.rejected));
    });
    const f = [];
    this.interceptors.response.forEach(function(m) {
      f.push(m.fulfilled, m.rejected);
    });
    let l, h = 0, b;
    if (!d) {
      const u = [We.bind(this), void 0];
      for (u.unshift(...c), u.push(...f), b = u.length, l = Promise.resolve(n); h < b; )
        l = l.then(u[h++], u[h++]);
      return l;
    }
    b = c.length;
    let g = n;
    for (; h < b; ) {
      const u = c[h++], m = c[h++];
      try {
        g = u(g);
      } catch (p) {
        m.call(this, p);
        break;
      }
    }
    try {
      l = We.call(this, g);
    } catch (u) {
      return Promise.reject(u);
    }
    for (h = 0, b = f.length; h < b; )
      l = l.then(f[h++], f[h++]);
    return l;
  }
  getUri(t) {
    t = M(this.defaults, t);
    const n = ct(t.baseURL, t.url, t.allowAbsoluteUrls);
    return rt(n, t.params, t.paramsSerializer);
  }
};
a.forEach(["delete", "get", "head", "options"], function(t) {
  j.prototype[t] = function(n, r) {
    return this.request(M(r || {}, {
      method: t,
      url: n,
      data: (r || {}).data
    }));
  };
});
a.forEach(["post", "put", "patch"], function(t) {
  function n(r) {
    return function(i, o, c) {
      return this.request(M(c || {}, {
        method: t,
        headers: r ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: i,
        data: o
      }));
    };
  }
  j.prototype[t] = n(), j.prototype[t + "Form"] = n(!0);
});
let Vn = class pt {
  constructor(t) {
    if (typeof t != "function")
      throw new TypeError("executor must be a function.");
    let n;
    this.promise = new Promise(function(i) {
      n = i;
    });
    const r = this;
    this.promise.then((s) => {
      if (!r._listeners) return;
      let i = r._listeners.length;
      for (; i-- > 0; )
        r._listeners[i](s);
      r._listeners = null;
    }), this.promise.then = (s) => {
      let i;
      const o = new Promise((c) => {
        r.subscribe(c), i = c;
      }).then(s);
      return o.cancel = function() {
        r.unsubscribe(i);
      }, o;
    }, t(function(i, o, c) {
      r.reason || (r.reason = new W(i, o, c), n(r.reason));
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason)
      throw this.reason;
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(t) {
    if (this.reason) {
      t(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(t) : this._listeners = [t];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(t) {
    if (!this._listeners)
      return;
    const n = this._listeners.indexOf(t);
    n !== -1 && this._listeners.splice(n, 1);
  }
  toAbortSignal() {
    const t = new AbortController(), n = (r) => {
      t.abort(r);
    };
    return this.subscribe(n), t.signal.unsubscribe = () => this.unsubscribe(n), t.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let t;
    return {
      token: new pt(function(s) {
        t = s;
      }),
      cancel: t
    };
  }
};
function Kn(e) {
  return function(n) {
    return e.apply(null, n);
  };
}
function Gn(e) {
  return a.isObject(e) && e.isAxiosError === !0;
}
const Ee = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(Ee).forEach(([e, t]) => {
  Ee[t] = e;
});
function ht(e) {
  const t = new j(e), n = Je(j.prototype.request, t);
  return a.extend(n, j.prototype, t, { allOwnKeys: !0 }), a.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(s) {
    return ht(M(e, s));
  }, n;
}
const y = ht(v);
y.Axios = j;
y.CanceledError = W;
y.CancelToken = Vn;
y.isCancel = it;
y.VERSION = dt;
y.toFormData = ce;
y.AxiosError = w;
y.Cancel = y.CanceledError;
y.all = function(t) {
  return Promise.all(t);
};
y.spread = Kn;
y.isAxiosError = Gn;
y.mergeConfig = M;
y.AxiosHeaders = A;
y.formToJSON = (e) => ot(a.isHTMLForm(e) ? new FormData(e) : e);
y.getAdapter = ft.getAdapter;
y.HttpStatusCode = Ee;
y.default = y;
const {
  Axios: sr,
  AxiosError: or,
  CanceledError: ir,
  isCancel: ar,
  CancelToken: cr,
  VERSION: lr,
  all: ur,
  Cancel: fr,
  isAxiosError: dr,
  spread: pr,
  toFormData: hr,
  AxiosHeaders: mr,
  HttpStatusCode: wr,
  formToJSON: br,
  getAdapter: yr,
  mergeConfig: Er
} = y, mt = 3e4;
function vn(e, t) {
  return e.searchParams.set("SERVICE", "WMS"), e.searchParams.set("REQUEST", "GetCapabilities"), e.searchParams.set("VERSION", "1.3.0"), e.searchParams.set("FORMAT", "text/xml"), t && e.searchParams.set("lang", t), e;
}
function Sr(e, t, n, r) {
  return e.searchParams.set("SERVICE", "WMS"), e.searchParams.set("REQUEST", "GetMap"), e.searchParams.set("VERSION", "1.1.0"), e.searchParams.set("LAYERS", t), e.searchParams.set("STYLES", r), e.searchParams.set("SRS", n), e.searchParams.set("BBOX", "10.0,10.0,10.0001,10.0001"), e.searchParams.set("WIDTH", "1"), e.searchParams.set("HEIGHT", "1"), e.searchParams.set("FORMAT", "image/png"), e;
}
async function gr(e, t) {
  const n = vn(new URL(e), t);
  re.debug(`Read WMTS Get Capabilities: ${n.toString()}`);
  let r = null;
  try {
    r = await y.get(n.toString(), { timeout: mt });
  } catch (s) {
    throw s instanceof Error ? new I(
      `Failed to get WMS Capabilities: ${s.toString()}`,
      "network_error"
    ) : new Error("Unknown error", { cause: s });
  }
  if (r.status !== 200) {
    const s = `Failed to read GetCapabilities from ${n}`;
    throw re.error(s, r), new I(s, "network_error");
  }
  return Xn(r.data);
}
function Xn(e) {
  try {
    return yt.parse(e);
  } catch (t) {
    throw t instanceof Error ? new I(
      `Failed to parse WMS capabilities: ${t.toString()}`,
      "invalid_wms_capabilities"
    ) : new Error("Unknown error", { cause: t });
  }
}
function Qn(e, t) {
  return e.searchParams.set("SERVICE", "WMTS"), e.searchParams.set("REQUEST", "GetCapabilities"), t && e.searchParams.set("lang", t), e;
}
async function Rr(e, t) {
  const n = Qn(new URL(e), t);
  re.debug(`Read WMTS Get Capabilities: ${n}`);
  let r = null;
  try {
    r = await y.get(n.toString(), { timeout: mt });
  } catch (s) {
    throw s instanceof Error ? new I(
      `Failed to get the remote capabilities: ${s.message}`,
      "network_error"
    ) : new Error("Unknown error", { cause: s });
  }
  if (r.status !== 200) {
    const s = `Failed to read GetCapabilities from ${n}`;
    throw re.error(s, r), new I(s, "network_error");
  }
  return Yn(r.data, n);
}
function Yn(e, t) {
  try {
    return Et.parse(e, t);
  } catch (n) {
    throw n instanceof Error ? new I(
      `Failed to parse WMTS capabilities: ${n.toString()}`,
      "invalid_wmts_capabilities"
    ) : new Error("Unknown error", { cause: n });
  }
}
const wt = "%7C";
function Or(e) {
  return e.replace("|", wt);
}
function Tr(e) {
  return e.replace(wt, "|");
}
export {
  or as A,
  mt as E,
  y as a,
  Sr as b,
  Qn as c,
  Rr as d,
  Yn as e,
  Or as f,
  Tr as g,
  Xn as p,
  gr as r,
  vn as s
};
