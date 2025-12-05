import { B as Y, W as De, E as Ct, a as Zt, D as Ue, C as Nt, L as ve, b as Xe } from "./index-C9BI3pET.js";
import { p as A, b as W, l as ue, c as Ye, m as le, d as ce } from "./index-CftWVgXE.js";
import { CapabilitiesError as X } from "./validation.js";
function We(e, t) {
  const n = ("" + e).split("."), i = ("" + t).split(".");
  for (let r = 0; r < Math.max(n.length, i.length); r++) {
    const o = parseInt(n[r] || "0", 10), s = parseInt(i[r] || "0", 10);
    if (o > s)
      return 1;
    if (s > o)
      return -1;
  }
  return 0;
}
function $e(e, t) {
  return e > t ? 1 : e < t ? -1 : 0;
}
function Ve(e, t, n) {
  if (e[0] <= t)
    return 0;
  const i = e.length;
  if (t <= e[i - 1])
    return i - 1;
  if (typeof n == "function") {
    for (let r = 1; r < i; ++r) {
      const o = e[r];
      if (o === t)
        return r;
      if (o < t)
        return n(t, e[r - 1], o) > 0 ? r - 1 : r;
    }
    return i - 1;
  }
  if (n > 0) {
    for (let r = 1; r < i; ++r)
      if (e[r] < t)
        return r - 1;
    return i - 1;
  }
  if (n < 0) {
    for (let r = 1; r < i; ++r)
      if (e[r] <= t)
        return r;
    return i - 1;
  }
  for (let r = 1; r < i; ++r) {
    if (e[r] == t)
      return r;
    if (e[r] < t)
      return e[r - 1] - t < t - e[r] ? r - 1 : r;
  }
  return i - 1;
}
function ze(e, t, n) {
  const i = t || $e;
  return e.every(function(r, o) {
    if (o === 0)
      return !0;
    const s = i(e[o - 1], r);
    return !(s > 0 || s === 0);
  });
}
function vt(e, t) {
  return fe(e, t, []).join("");
}
function fe(e, t, n) {
  if (e.nodeType == Node.CDATA_SECTION_NODE || e.nodeType == Node.TEXT_NODE)
    n.push(e.nodeValue);
  else {
    let i;
    for (i = e.firstChild; i; i = i.nextSibling)
      fe(i, t, n);
  }
  return n;
}
function He(e) {
  return "documentElement" in e;
}
function qe(e) {
  return new DOMParser().parseFromString(e, "application/xml");
}
function dt(e, t) {
  return (
    /**
     * @param {Element} node Node.
     * @param {Array<*>} objectStack Object stack.
     * @this {*}
     */
    function(n, i) {
      const r = e.call(this, n, i);
      r !== void 0 && /** @type {Array<*>} */
      i[i.length - 1].push(r);
    }
  );
}
function E(e, t, n) {
  return (
    /**
     * @param {Element} node Node.
     * @param {Array<*>} objectStack Object stack.
     * @this {*}
     */
    function(i, r) {
      const o = e.call(this, i, r);
      if (o !== void 0) {
        const s = (
          /** @type {!Object} */
          r[r.length - 1]
        ), a = i.localName;
        let u;
        a in s ? u = s[a] : (u = [], s[a] = u), u.push(o);
      }
    }
  );
}
function l(e, t, n) {
  return (
    /**
     * @param {Element} node Node.
     * @param {Array<*>} objectStack Object stack.
     * @this {*}
     */
    function(i, r) {
      const o = e.call(this, i, r);
      if (o !== void 0) {
        const s = (
          /** @type {!Object} */
          r[r.length - 1]
        ), a = i.localName;
        s[a] = o;
      }
    }
  );
}
function g(e, t, n) {
  n = n !== void 0 ? n : {};
  let i, r;
  for (i = 0, r = e.length; i < r; ++i)
    n[e[i]] = t;
  return n;
}
function Ze(e, t, n, i) {
  let r;
  for (r = t.firstElementChild; r; r = r.nextElementSibling) {
    const o = e[r.namespaceURI];
    if (o !== void 0) {
      const s = o[r.localName];
      s !== void 0 && s.call(i, r, n);
    }
  }
}
function h(e, t, n, i, r) {
  return i.push(e), Ze(t, n, i, r), /** @type {T} */
  i.pop();
}
function je() {
  throw new Error("Unimplemented abstract method.");
}
class Xt {
  /**
   * Read the source document.
   *
   * @param {Document|Element|string} source The XML source.
   * @return {Object|null} An object representing the source.
   * @api
   */
  read(t) {
    if (!t)
      return null;
    if (typeof t == "string") {
      const n = qe(t);
      return this.readFromDocument(n);
    }
    return He(t) ? this.readFromDocument(
      /** @type {Document} */
      t
    ) : this.readFromNode(
      /** @type {Element} */
      t
    );
  }
  /**
   * @param {Document} doc Document.
   * @return {Object|null} Object
   */
  readFromDocument(t) {
    for (let n = t.firstChild; n; n = n.nextSibling)
      if (n.nodeType == Node.ELEMENT_NODE)
        return this.readFromNode(
          /** @type {Element} */
          n
        );
    return null;
  }
  /**
   * @abstract
   * @param {Element} node Node.
   * @return {Object|null} Object
   */
  readFromNode(t) {
    je();
  }
}
const Ke = "http://www.w3.org/1999/xlink";
function at(e) {
  return e.getAttributeNS(Ke, "href");
}
function F(e) {
  const t = /^\s*(true|1)|(false|0)\s*$/.exec(e);
  if (t)
    return t[1] !== void 0 || !1;
}
function Q(e) {
  const t = vt(e, !1);
  return U(t);
}
function U(e) {
  const t = /^\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)\s*$/i.exec(e);
  if (t)
    return parseFloat(t[1]);
}
function v(e) {
  const t = vt(e, !1);
  return Mt(t);
}
function Mt(e) {
  const t = /^\s*(\d+)\s*$/.exec(e);
  if (t)
    return parseInt(t[1], 10);
}
function f(e) {
  return vt(e, !1).trim();
}
const _ = [
  null,
  "http://www.opengis.net/wms",
  "http://www.opengis.net/sld"
];
function ht(e) {
  return We(e[0].version, "1.3") >= 0;
}
const ke = g(_, {
  Service: l(xn),
  Capability: l(En)
}), Qe = g(_, {
  Request: l(In),
  Exception: l(An),
  Layer: l(_n),
  UserDefinedSymbolization: l(
    Tn
  )
});
class Je extends Xt {
  constructor() {
    super(), this.version = void 0;
  }
  /**
   * @param {Element} node Node.
   * @return {Object|null} Object
   * @override
   */
  readFromNode(t) {
    this.version = t.getAttribute("version").trim();
    const n = h(
      {
        version: this.version
      },
      ke,
      t,
      []
    );
    return n || null;
  }
}
const de = {
  Name: l(f),
  Title: l(f),
  Abstract: l(f),
  KeywordList: l(pe),
  OnlineResource: l(at),
  ContactInformation: l(Rn),
  Fees: l(f),
  AccessConstraints: l(f)
}, tn = g(_, de), en = g(_, {
  ...de,
  LayerLimit: l(v),
  MaxWidth: l(v),
  MaxHeight: l(v)
}), nn = g(_, {
  ContactPersonPrimary: l(Cn),
  ContactPosition: l(f),
  ContactAddress: l(Mn),
  ContactVoiceTelephone: l(f),
  ContactFacsimileTelephone: l(f),
  ContactElectronicMailAddress: l(f)
}), rn = g(_, {
  ContactPerson: l(f),
  ContactOrganization: l(f)
}), on = g(_, {
  AddressType: l(f),
  Address: l(f),
  City: l(f),
  StateOrProvince: l(f),
  PostCode: l(f),
  Country: l(f)
}), sn = g(_, {
  Format: dt(f)
}), ge = {
  Name: l(f),
  Title: l(f),
  Abstract: l(f),
  KeywordList: l(pe),
  BoundingBox: E(Se),
  Dimension: E(Pn),
  Attribution: l(Sn),
  AuthorityURL: E(On),
  Identifier: E(f),
  MetadataURL: E(Nn),
  DataURL: E(z),
  FeatureListURL: E(z),
  Style: E(Fn),
  Layer: E(Pt)
}, he = g(_, {
  ...ge,
  SRS: E(f),
  Extent: l(Ln),
  ScaleHint: E(yn),
  LatLonBoundingBox: l(
    (e, t) => Se(e, t, !1)
  ),
  Layer: E(Pt)
}), me = g(_, {
  ...ge,
  CRS: E(f),
  EX_GeographicBoundingBox: l(
    pn
  ),
  MinScaleDenominator: l(Q),
  MaxScaleDenominator: l(Q),
  Layer: E(Pt)
}), an = g(_, {
  Title: l(f),
  OnlineResource: l(at),
  LogoURL: l(Te)
}), un = g(_, {
  westBoundLongitude: l(Q),
  eastBoundLongitude: l(Q),
  southBoundLatitude: l(Q),
  northBoundLatitude: l(Q)
}), ln = g(_, {
  GetCapabilities: l(ct),
  GetMap: l(ct),
  GetFeatureInfo: l(ct),
  DescribeLayer: l(ct),
  GetLegendGraphic: l(ct)
}), cn = g(_, {
  Format: E(f),
  DCPType: E(wn)
}), fn = g(_, {
  HTTP: l(bn)
}), dn = g(_, {
  Get: l(z),
  Post: l(z)
}), gn = g(_, {
  Name: l(f),
  Title: l(f),
  Abstract: l(f),
  LegendURL: E(Te),
  StyleSheetURL: l(z),
  StyleURL: l(z)
}), hn = g(_, {
  Format: l(f),
  OnlineResource: l(at)
}), mn = g(_, {
  Keyword: dt(f)
});
function Sn(e, t) {
  return h({}, an, e, t);
}
function Tn(e, t) {
  return {
    SupportSLD: !!F(e.getAttribute("SupportSLD")),
    UserLayer: !!F(e.getAttribute("UserLayer")),
    UserStyle: !!F(e.getAttribute("UserStyle")),
    RemoteWFS: !!F(e.getAttribute("RemoteWFS")),
    InlineFeatureData: !!F(
      e.getAttribute("InlineFeatureData")
    ),
    RemoteWCS: !!F(e.getAttribute("RemoteWCS"))
  };
}
function Se(e, t, n = !0) {
  const i = [
    U(e.getAttribute("minx")),
    U(e.getAttribute("miny")),
    U(e.getAttribute("maxx")),
    U(e.getAttribute("maxy"))
  ], r = [
    U(e.getAttribute("resx")),
    U(e.getAttribute("resy"))
  ], o = {
    extent: i,
    res: r
  };
  return n && (ht(t) ? o.crs = e.getAttribute("CRS") : o.srs = e.getAttribute("SRS")), o;
}
function pn(e, t) {
  const n = h(
    {},
    un,
    e,
    t
  );
  if (!n)
    return;
  const i = (
    /** @type {number|undefined} */
    n.westBoundLongitude
  ), r = (
    /** @type {number|undefined} */
    n.southBoundLatitude
  ), o = (
    /** @type {number|undefined} */
    n.eastBoundLongitude
  ), s = (
    /** @type {number|undefined} */
    n.northBoundLatitude
  );
  if (!(i === void 0 || r === void 0 || o === void 0 || s === void 0))
    return [
      i,
      r,
      o,
      s
    ];
}
function En(e, t) {
  return h({}, Qe, e, t);
}
function xn(e, t) {
  return h(
    {},
    ht(t) ? en : tn,
    e,
    t
  );
}
function Rn(e, t) {
  return h({}, nn, e, t);
}
function Cn(e, t) {
  return h({}, rn, e, t);
}
function Mn(e, t) {
  return h({}, on, e, t);
}
function An(e, t) {
  return h([], sn, e, t);
}
function _n(e, t) {
  const n = h(
    {},
    ht(t) ? me : he,
    e,
    t
  );
  return n.Layer === void 0 ? Object.assign(n, Pt(e, t)) : n;
}
function Pt(e, t) {
  const n = ht(t), i = (
    /**  @type {!Object<string,*>} */
    t[t.length - 1]
  ), r = h(
    {},
    n ? me : he,
    e,
    t
  );
  if (!r)
    return;
  let o = F(e.getAttribute("queryable"));
  o === void 0 && (o = i.queryable), r.queryable = o !== void 0 ? o : !1;
  let s = Mt(e.getAttribute("cascaded"));
  s === void 0 && (s = i.cascaded), r.cascaded = s;
  let a = F(e.getAttribute("opaque"));
  a === void 0 && (a = i.opaque), r.opaque = a !== void 0 ? a : !1;
  let u = F(e.getAttribute("noSubsets"));
  u === void 0 && (u = i.noSubsets), r.noSubsets = u !== void 0 ? u : !1;
  let c = U(e.getAttribute("fixedWidth"));
  c || (c = i.fixedWidth), r.fixedWidth = c;
  let d = U(e.getAttribute("fixedHeight"));
  d || (d = i.fixedHeight), r.fixedHeight = d;
  const p = ["Style", "AuthorityURL"];
  n ? p.push("CRS") : p.push("SRS", "Dimension"), p.forEach(function(m) {
    if (m in i) {
      const x = r[m] || [];
      r[m] = x.concat(i[m]);
    }
  });
  const S = ["BoundingBox", "Attribution"];
  return n ? S.push(
    "Dimension",
    "EX_GeographicBoundingBox",
    "MinScaleDenominator",
    "MaxScaleDenominator"
  ) : S.push("LatLonBoundingBox", "ScaleHint", "Extent"), S.forEach(function(m) {
    if (!(m in r)) {
      const x = i[m];
      r[m] = x;
    }
  }), r;
}
function Pn(e, t) {
  const n = {
    name: e.getAttribute("name"),
    units: e.getAttribute("units"),
    unitSymbol: e.getAttribute("unitSymbol")
  };
  return ht(t) && Object.assign(n, {
    default: e.getAttribute("default"),
    multipleValues: F(e.getAttribute("multipleValues")),
    nearestValue: F(e.getAttribute("nearestValue")),
    current: F(e.getAttribute("current")),
    values: f(e)
  }), n;
}
function Ln(e, t) {
  return {
    name: e.getAttribute("name"),
    default: e.getAttribute("default"),
    nearestValue: F(e.getAttribute("nearestValue"))
  };
}
function yn(e, t) {
  return {
    min: U(e.getAttribute("min")),
    max: U(e.getAttribute("max"))
  };
}
function z(e, t) {
  return h({}, hn, e, t);
}
function In(e, t) {
  return h({}, ln, e, t);
}
function wn(e, t) {
  return h({}, fn, e, t);
}
function bn(e, t) {
  return h({}, dn, e, t);
}
function ct(e, t) {
  return h({}, cn, e, t);
}
function Te(e, t) {
  const n = z(e, t);
  if (n) {
    const i = [
      Mt(e.getAttribute("width")),
      Mt(e.getAttribute("height"))
    ];
    return n.size = i, n;
  }
}
function On(e, t) {
  const n = z(e, t);
  if (n)
    return n.name = e.getAttribute("name"), n;
}
function Nn(e, t) {
  const n = z(e, t);
  if (n)
    return n.type = e.getAttribute("type"), n;
}
function Fn(e, t) {
  return h({}, gn, e, t);
}
function pe(e, t) {
  return h([], mn, e, t);
}
function Ee(e) {
  return e.Capability?.Layer?.Layer ?? [];
}
function Bn(e, t) {
  if (e.Capability?.Layer)
    return Yt(
      t,
      [e.Capability.Layer],
      [e.Capability.Layer]
    ).layer;
}
function Yt(e, t, n) {
  let i = {};
  for (let r = 0; r < t?.length && !i.layer; r++) {
    const o = t[r];
    o && (o.Name === e || o.Title === e ? (i.layer = o, i.parents = n) : o.Layer && o.Layer.length > 0 && (i = Yt(e, o.Layer, [o, ...n])));
  }
  return i;
}
function xe(e) {
  return e.CRS ? e.CRS : e.Layer && e.Layer.length > 0 ? e.Layer.flatMap(
    (t) => xe(t)
  ).filter((t, n, i) => i.indexOf(t) === n) : [];
}
function Gn(e, t, n) {
  let i, r;
  try {
    if (n.Attribution || e.Capability?.Layer?.Attribution) {
      const o = n.Attribution || e.Capability?.Layer?.Attribution;
      r = o.OnlineResource, i = o.Title || new URL(o.OnlineResource).hostname;
    } else
      i = e.Service?.Title || new URL(e.Service?.OnlineResource).hostname;
  } catch (o) {
    if (o instanceof Error) {
      const s = `Failed to get an attribution title/url for ${t}: ${o.toString()}`;
      A.warn(s, n, o);
    }
    i = new URL(e.originUrl).hostname, r = void 0;
  }
  return [{ name: i, url: r }];
}
function Re(e, t, n, i, r) {
  let o, s;
  const a = n.BoundingBox?.find(
    (u) => u.crs === r.epsg
  );
  if (a && (o = a.extent, s = Zt.parseCRS(a.crs)), !o) {
    const u = n.BoundingBox?.find(
      (c) => Ct.find((d) => d.epsg === c.crs)
    );
    if (u) {
      let c = u.extent;
      s = Zt.parseCRS(u.crs), u.crs === Y.epsg && r.epsg === Ue.epsg && (c = Y.getExtentInOrderXY(c), s = Y), s && s.epsg !== r.epsg && (o = Nt.projExtent(s, r, c));
    }
  }
  if (!o && n.EX_GeographicBoundingBox && (r.epsg !== Y.epsg ? o = Nt.projExtent(Y, r, n.EX_GeographicBoundingBox) : o = n.EX_GeographicBoundingBox), !o && i.length > 0)
    return Re(e, t, i[0], i.slice(1), r);
  if (!o) {
    const u = `No layer extent found for ${t} in ${e.originUrl.toString()}`;
    A.error({
      title: "WMS Capabilities parser",
      titleColor: W.Indigo,
      messages: [u, n, i]
    });
  }
  return o;
}
function Dn(e, t, n) {
  const i = n.Style?.filter((r) => r.LegendURL?.length > 0) ?? [];
  if (i.length === 0 && n.queryable && e.Capability?.UserDefinedSymbolization?.SupportSLD) {
    const r = e.Capability.Request.GetLegendGraphic, o = r?.DCPType[0]?.HTTP?.Get?.OnlineResource, s = r?.Format[0];
    if (o && s) {
      const a = new URLSearchParams({
        SERVICE: "WMS",
        REQUEST: "GetLegendGraphic",
        VERSION: e.version,
        FORMAT: s,
        LAYER: t,
        SLD_VERSION: "1.1.0"
      });
      return [
        {
          url: `${o}${a.toString()}`,
          format: s
        }
      ];
    }
  }
  return i.map(
    (r) => r.LegendURL.map((o) => {
      const s = o.size?.length >= 2 ? o.size[0] : null, a = o.size?.length >= 2 ? o.size[1] : null;
      return {
        url: o.OnlineResource,
        format: o.Format,
        width: s ?? 0,
        height: a ?? 0
      };
    })
  ).flat();
}
function jt(e) {
  const t = new Date(e);
  if (!isNaN(t.getFullYear()))
    return t.getFullYear();
}
function Un(e, t) {
  if (!(!t.Dimension || t.Dimension.length === 0))
    return t.Dimension.map((n) => ({
      id: n.name,
      defaultValue: n.default,
      values: n.values.split(",").map((i) => {
        if (i.includes("/")) {
          const [r, o, s] = i.split("/"), a = jt(r), u = jt(o);
          if (a === void 0 || u === void 0) {
            A.warn(
              `Unsupported dimension min/max value "${r}"/"${o}" for layer ${e}`
            );
            return;
          }
          let c = 1;
          const d = /P(\d+)Y/.exec(s);
          return d && d[1] ? c = parseInt(d[1]) : A.warn(
            `Unsupported dimension resolution "${s}" for layer ${e}, fallback to 1 year period`
          ), Ye.range(a, u, c);
        }
        return i;
      }).flat().filter((i) => !!i).map((i) => `${i}`),
      current: n.current ?? !1
    }));
}
function vn(e) {
  if (!e)
    return;
  const t = e.find((i) => i.id.toLowerCase() === "time");
  if (!t)
    return;
  const n = t.values?.map((i) => le(i)) ?? [];
  return ce(t.defaultValue, n);
}
function Xn(e, t, n, i, r = !0) {
  let o = t.Name;
  if ((!o || o.length === 0) && t.Title && (o = t.Title), !o || o.length === 0) {
    const u = `No layerId found in WMS capabilities for layer in ${e.originUrl.toString()}`;
    if (A.error(u, t), r)
      return {};
    throw new X(u, "no_layer_found");
  }
  if (!e.version || !De.includes(e.version)) {
    let u = "";
    if (e.version ? u = `WMS version ${e.version} of ${e.originUrl.toString()} not supported` : u = `No WMS version found in Capabilities of ${e.originUrl.toString()}`, A.error(u, t), r)
      return {};
    throw new X(u, "no_wms_version_found");
  }
  let s = xe(t).filter(
    (u) => Ct.some((c) => c.epsg === u.toUpperCase())
  ).map(
    (u) => Ct.find((c) => c.epsg === u.toUpperCase())
  );
  if (s.length === 0 && (s = [Y]), s = s.filter(
    (u, c, d) => d.indexOf(u) === c
  ), s.length === 0) {
    const u = `No projections found for layer ${o}`;
    if (r)
      A.error(u, t);
    else
      throw new X(u);
  }
  const a = Un(o, t);
  return {
    id: o,
    name: t.Title,
    baseUrl: e.Capability?.Request?.GetMap?.DCPType[0]?.HTTP?.Get?.OnlineResource ?? e.originUrl.toString(),
    wmsVersion: e.version,
    abstract: t.Abstract,
    attributions: Gn(e, o, t),
    extent: Re(e, o, t, n, i),
    legends: Dn(e, o, t),
    hasTooltip: t.queryable,
    availableProjections: s,
    dimensions: a,
    timeConfig: vn(a)
  };
}
function Yn(e, t = !0) {
  if (Array.isArray(e.Capability?.Request?.GetFeatureInfo?.DCPType)) {
    const n = e.Capability.Request.GetFeatureInfo?.DCPType[0]?.HTTP;
    let i, r = "GET";
    if (n?.Get)
      i = n.Get.OnlineResource;
    else if (n?.Post)
      r = "POST", i = n.Post.OnlineResource;
    else {
      if (A.error(
        "Couldn't parse GetFeatureInfo data",
        e.Capability.Request.GetFeatureInfo
      ), t)
        return;
      throw new X("Invalid GetFeatureInfo data", "invalid_get_feature_info");
    }
    const o = [];
    return e.Capability.Request.GetFeatureInfo.Format && o.push(...e.Capability.Request.GetFeatureInfo.Format), {
      baseUrl: i,
      method: r,
      formats: o
    };
  }
}
function Wt(e, t, n) {
  if (!t)
    return;
  const { outputProjection: i = Y, initialValues: r = {}, ignoreErrors: o = !0 } = n ?? {}, { currentYear: s, params: a } = r;
  let u;
  if (typeof t == "string" ? u = t : u = t.Name, !e.Capability?.Layer?.Layer)
    return;
  const c = Yt(
    u,
    [e.Capability.Layer],
    [e.Capability.Layer]
  );
  if (!c)
    return;
  const { layer: d, parents: p } = c;
  if (!d) {
    const m = `No WMS layer ${u} found in Capabilities ${e.originUrl.toString()}`;
    if (A.error({
      title: "WMS Capabilities parser",
      titleColor: W.Indigo,
      messages: [m, e]
    }), o)
      return;
    throw new X(m, "no_layer_found");
  }
  let S = [];
  return d.Layer?.length && (S = d.Layer.map((m) => Wt(e, m.Name, n)).filter(
    (m) => !!m
  )), ue.makeExternalWMSLayer({
    ...Xn(e, d, p ?? [], i, o),
    format: "png",
    isLoading: !1,
    getFeatureInfoCapability: Yn(e, o),
    currentYear: s,
    customAttributes: a,
    layers: S
  });
}
function Wn(e, t) {
  return Ee(e).map((n) => Wt(e, n, t)).filter((n) => !!n);
}
function $n(e, t) {
  const n = new Je();
  try {
    const i = n.read(e);
    return i.originUrl = t, i;
  } catch (i) {
    throw A.error({
      title: "WMS Capabilities parser",
      titleColor: W.Indigo,
      messages: [`Failed to parse capabilities of ${t?.toString()}`, i]
    }), new X(
      `Failed to parse WMS Capabilities: invalid content: ${i?.toString()}`,
      "invalid_wms_capabilities"
    );
  }
}
const kr = {
  parse: $n,
  getAllCapabilitiesLayers: Ee,
  getCapabilitiesLayer: Bn,
  getAllExternalLayers: Wn,
  getExternalLayer: Wt
}, I = {
  UNKNOWN: 0,
  INTERSECTING: 1,
  ABOVE: 2,
  RIGHT: 4,
  BELOW: 8,
  LEFT: 16
};
function Ce(e) {
  const t = Me();
  for (let n = 0, i = e.length; n < i; ++n)
    qn(t, e[n]);
  return t;
}
function Vn(e, t, n) {
  const i = Math.min.apply(null, e), r = Math.min.apply(null, t), o = Math.max.apply(null, e), s = Math.max.apply(null, t);
  return $t(i, r, o, s, n);
}
function zn(e, t) {
  return e[0] <= t[0] && t[2] <= e[2] && e[1] <= t[1] && t[3] <= e[3];
}
function Kt(e, t) {
  const n = e[0], i = e[1], r = e[2], o = e[3], s = t[0], a = t[1];
  let u = I.UNKNOWN;
  return s < n ? u = u | I.LEFT : s > r && (u = u | I.RIGHT), a < i ? u = u | I.BELOW : a > o && (u = u | I.ABOVE), u === I.UNKNOWN && (u = I.INTERSECTING), u;
}
function Me() {
  return [1 / 0, 1 / 0, -1 / 0, -1 / 0];
}
function $t(e, t, n, i, r) {
  return r ? (r[0] = e, r[1] = t, r[2] = n, r[3] = i, r) : [e, t, n, i];
}
function Hn(e) {
  return $t(1 / 0, 1 / 0, -1 / 0, -1 / 0, e);
}
function qn(e, t) {
  t[0] < e[0] && (e[0] = t[0]), t[0] > e[2] && (e[2] = t[0]), t[1] < e[1] && (e[1] = t[1]), t[1] > e[3] && (e[3] = t[1]);
}
function Zn(e, t, n, i, r) {
  for (; n < i; n += r)
    jn(e, t[n], t[n + 1]);
  return e;
}
function jn(e, t, n) {
  e[0] = Math.min(e[0], t), e[1] = Math.min(e[1], n), e[2] = Math.max(e[2], t), e[3] = Math.max(e[3], n);
}
function Kn(e) {
  return [e[0], e[3]];
}
function kn(e, t) {
  return e[0] <= t[2] && e[2] >= t[0] && e[1] <= t[3] && e[3] >= t[1];
}
function Qn(e) {
  return e[2] < e[0] || e[3] < e[1];
}
function Jn(e, t, n) {
  let i = !1;
  const r = Kt(e, t), o = Kt(e, n);
  if (r === I.INTERSECTING || o === I.INTERSECTING)
    i = !0;
  else {
    const s = e[0], a = e[1], u = e[2], c = e[3], d = t[0], p = t[1], S = n[0], m = n[1], x = (m - p) / (S - d);
    let P, L;
    o & I.ABOVE && !(r & I.ABOVE) && (P = S - (m - c) / x, i = P >= s && P <= u), !i && o & I.RIGHT && !(r & I.RIGHT) && (L = m - (S - u) * x, i = L >= a && L <= c), !i && o & I.BELOW && !(r & I.BELOW) && (P = S - (m - a) / x, i = P >= s && P <= u), !i && o & I.LEFT && !(r & I.LEFT) && (L = m - (S - s) * x, i = L >= a && L <= c);
  }
  return i;
}
function ti(e, t, n, i) {
  if (Qn(e))
    return Hn(n);
  let r = [];
  r = [
    e[0],
    e[1],
    e[2],
    e[1],
    e[2],
    e[3],
    e[0],
    e[3]
  ], t(r, r, 2);
  const o = [], s = [];
  for (let a = 0, u = r.length; a < u; a += 2)
    o.push(r[a]), s.push(r[a + 1]);
  return Vn(o, s, n);
}
const O = [null, "http://www.opengis.net/ows/1.1"], ei = g(O, {
  ServiceIdentification: l(Pi),
  ServiceProvider: l(yi),
  OperationsMetadata: l(Ai)
});
class ni extends Xt {
  constructor() {
    super();
  }
  /**
   * @param {Element} node Node.
   * @return {Object|null} Object
   * @override
   */
  readFromNode(t) {
    const n = h({}, ei, t, []);
    return n || null;
  }
}
const ii = g(O, {
  DeliveryPoint: l(f),
  City: l(f),
  AdministrativeArea: l(f),
  PostalCode: l(f),
  Country: l(f),
  ElectronicMailAddress: l(f)
}), ri = g(O, {
  Value: E(Ii)
}), oi = g(O, {
  AllowedValues: l(Ti)
}), si = g(O, {
  Phone: l(_i),
  Address: l(Si)
}), ai = g(O, {
  HTTP: l(Ci)
}), ui = g(O, {
  Get: E(Ri),
  Post: void 0
  // TODO
}), li = g(O, {
  DCP: l(xi)
}), ci = g(O, {
  Operation: Mi
}), fi = g(O, {
  Voice: l(f),
  Facsimile: l(f)
}), di = g(O, {
  Constraint: E(pi)
}), gi = g(O, {
  IndividualName: l(f),
  PositionName: l(f),
  ContactInfo: l(Ei)
}), hi = g(O, {
  Abstract: l(f),
  AccessConstraints: l(f),
  Fees: l(f),
  Title: l(f),
  ServiceTypeVersion: l(f),
  ServiceType: l(f)
}), mi = g(O, {
  ProviderName: l(f),
  ProviderSite: l(at),
  ServiceContact: l(Li)
});
function Si(e, t) {
  return h({}, ii, e, t);
}
function Ti(e, t) {
  return h({}, ri, e, t);
}
function pi(e, t) {
  const n = e.getAttribute("name");
  if (n)
    return h({ name: n }, oi, e, t);
}
function Ei(e, t) {
  return h({}, si, e, t);
}
function xi(e, t) {
  return h({}, ai, e, t);
}
function Ri(e, t) {
  const n = at(e);
  if (n)
    return h(
      { href: n },
      di,
      e,
      t
    );
}
function Ci(e, t) {
  return h({}, ui, e, t);
}
function Mi(e, t) {
  const n = e.getAttribute("name"), i = h({}, li, e, t);
  if (!i)
    return;
  const r = (
    /** @type {Object} */
    t[t.length - 1]
  );
  r[n] = i;
}
function Ai(e, t) {
  return h({}, ci, e, t);
}
function _i(e, t) {
  return h({}, fi, e, t);
}
function Pi(e, t) {
  return h({}, hi, e, t);
}
function Li(e, t) {
  return h({}, gi, e, t);
}
function yi(e, t) {
  return h({}, mi, e, t);
}
function Ii(e, t) {
  return f(e);
}
const $ = [null, "http://www.opengis.net/wmts/1.0"], ut = [null, "http://www.opengis.net/ows/1.1"], wi = g($, {
  Contents: l(Yi)
});
class bi extends Xt {
  constructor() {
    super(), this.owsParser_ = new ni();
  }
  /**
   * @param {Element} node Node.
   * @return {Object|null} Object
   * @override
   */
  readFromNode(t) {
    let n = t.getAttribute("version");
    n && (n = n.trim());
    let i = this.owsParser_.readFromNode(t);
    return i ? (i.version = n, i = h(
      i,
      wi,
      t,
      []
    ), i || null) : null;
  }
}
const Oi = g($, {
  Layer: E(Wi),
  TileMatrixSet: E($i)
}), Ni = g(
  $,
  {
    Style: E(Vi),
    Format: E(f),
    TileMatrixSetLink: E(zi),
    Dimension: E(Hi),
    ResourceURL: E(qi)
  },
  g(ut, {
    Title: l(f),
    Abstract: l(f),
    WGS84BoundingBox: l(_e),
    BoundingBox: E(Zi),
    Identifier: l(f)
  })
), Fi = g(
  $,
  {
    LegendURL: E(ji)
  },
  g(ut, {
    Title: l(f),
    Identifier: l(f)
  })
), Bi = g($, {
  TileMatrixSet: l(f),
  TileMatrixSetLimits: l(ki)
}), Gi = g($, {
  TileMatrixLimits: dt(Qi)
}), Di = g($, {
  TileMatrix: l(f),
  MinTileRow: l(v),
  MaxTileRow: l(v),
  MinTileCol: l(v),
  MaxTileCol: l(v)
}), Ui = g(
  $,
  {
    Default: l(f),
    Value: E(f)
  },
  g(ut, {
    Identifier: l(f)
  })
), Ae = g(ut, {
  LowerCorner: dt(Ft),
  UpperCorner: dt(Ft)
}), vi = g(
  $,
  {
    WellKnownScaleSet: l(f),
    TileMatrix: E(Ki)
  },
  g(ut, {
    SupportedCRS: l(f),
    Identifier: l(f),
    BoundingBox: l(_e)
  })
), Xi = g(
  $,
  {
    TopLeftCorner: l(Ft),
    ScaleDenominator: l(Q),
    TileWidth: l(v),
    TileHeight: l(v),
    MatrixWidth: l(v),
    MatrixHeight: l(v)
  },
  g(ut, {
    Identifier: l(f)
  })
);
function Yi(e, t) {
  return h({}, Oi, e, t);
}
function Wi(e, t) {
  return h({}, Ni, e, t);
}
function $i(e, t) {
  return h({}, vi, e, t);
}
function Vi(e, t) {
  const n = h({}, Fi, e, t);
  if (!n)
    return;
  const i = e.getAttribute("isDefault") === "true";
  return n.isDefault = i, n;
}
function zi(e, t) {
  return h({}, Bi, e, t);
}
function Hi(e, t) {
  return h({}, Ui, e, t);
}
function qi(e, t) {
  const n = e.getAttribute("format"), i = e.getAttribute("template"), r = e.getAttribute("resourceType"), o = {};
  return n && (o.format = n), i && (o.template = i), r && (o.resourceType = r), o;
}
function _e(e, t) {
  const n = h(
    [],
    Ae,
    e,
    t
  );
  if (n.length == 2)
    return Ce(n);
}
function Zi(e, t) {
  const n = e.getAttribute("crs"), i = h(
    [],
    Ae,
    e,
    t
  );
  if (i.length == 2)
    return { extent: Ce(i), crs: n };
}
function ji(e, t) {
  const n = {};
  return n.format = e.getAttribute("format"), n.href = at(e), n;
}
function Ft(e, t) {
  const n = f(e).split(/\s+/);
  if (!n || n.length != 2)
    return;
  const i = +n[0], r = +n[1];
  if (!(isNaN(i) || isNaN(r)))
    return [i, r];
}
function Ki(e, t) {
  return h({}, Xi, e, t);
}
function ki(e, t) {
  return h([], Gi, e, t);
}
function Qi(e, t) {
  return h({}, Di, e, t);
}
function Ji(e, t, n) {
  return Math.min(Math.max(e, t), n);
}
function kt(e) {
  return e * 180 / Math.PI;
}
function Rt(e) {
  return e * Math.PI / 180;
}
function Pe(e, t) {
  const n = Math.pow(10, t);
  return Math.round(e * n) / n;
}
function St(e, t) {
  return Math.floor(Pe(e, t));
}
function Tt(e, t) {
  return Math.ceil(Pe(e, t));
}
function Bt(e, t, n) {
  if (e >= t && e < n)
    return e;
  const i = n - t;
  return ((e - t) % i + i) % i + t;
}
const tr = {
  // use the radius of the Normal sphere
  radians: 6370997 / (2 * Math.PI),
  degrees: 2 * Math.PI * 6370997 / 360,
  ft: 0.3048,
  m: 1,
  "us-ft": 1200 / 3937
};
class Vt {
  /**
   * @param {Options} options Projection options.
   */
  constructor(t) {
    this.code_ = t.code, this.units_ = /** @type {import("./Units.js").Units} */
    t.units, this.extent_ = t.extent !== void 0 ? t.extent : null, this.worldExtent_ = t.worldExtent !== void 0 ? t.worldExtent : null, this.axisOrientation_ = t.axisOrientation !== void 0 ? t.axisOrientation : "enu", this.global_ = t.global !== void 0 ? t.global : !1, this.canWrapX_ = !!(this.global_ && this.extent_), this.getPointResolutionFunc_ = t.getPointResolution, this.defaultTileGrid_ = null, this.metersPerUnit_ = t.metersPerUnit;
  }
  /**
   * @return {boolean} The projection is suitable for wrapping the x-axis
   */
  canWrapX() {
    return this.canWrapX_;
  }
  /**
   * Get the code for this projection, e.g. 'EPSG:4326'.
   * @return {string} Code.
   * @api
   */
  getCode() {
    return this.code_;
  }
  /**
   * Get the validity extent for this projection.
   * @return {import("../extent.js").Extent} Extent.
   * @api
   */
  getExtent() {
    return this.extent_;
  }
  /**
   * Get the units of this projection.
   * @return {import("./Units.js").Units} Units.
   * @api
   */
  getUnits() {
    return this.units_;
  }
  /**
   * Get the amount of meters per unit of this projection.  If the projection is
   * not configured with `metersPerUnit` or a units identifier, the return is
   * `undefined`.
   * @return {number|undefined} Meters.
   * @api
   */
  getMetersPerUnit() {
    return this.metersPerUnit_ || tr[this.units_];
  }
  /**
   * Get the world extent for this projection.
   * @return {import("../extent.js").Extent} Extent.
   * @api
   */
  getWorldExtent() {
    return this.worldExtent_;
  }
  /**
   * Get the axis orientation of this projection.
   * Example values are:
   * enu - the default easting, northing, elevation.
   * neu - northing, easting, up - useful for "lat/long" geographic coordinates,
   *     or south orientated transverse mercator.
   * wnu - westing, northing, up - some planetary coordinate systems have
   *     "west positive" coordinate systems
   * @return {string} Axis orientation.
   * @api
   */
  getAxisOrientation() {
    return this.axisOrientation_;
  }
  /**
   * Is this projection a global projection which spans the whole world?
   * @return {boolean} Whether the projection is global.
   * @api
   */
  isGlobal() {
    return this.global_;
  }
  /**
   * Set if the projection is a global projection which spans the whole world
   * @param {boolean} global Whether the projection is global.
   * @api
   */
  setGlobal(t) {
    this.global_ = t, this.canWrapX_ = !!(t && this.extent_);
  }
  /**
   * @return {import("../tilegrid/TileGrid.js").default} The default tile grid.
   */
  getDefaultTileGrid() {
    return this.defaultTileGrid_;
  }
  /**
   * @param {import("../tilegrid/TileGrid.js").default} tileGrid The default tile grid.
   */
  setDefaultTileGrid(t) {
    this.defaultTileGrid_ = t;
  }
  /**
   * Set the validity extent for this projection.
   * @param {import("../extent.js").Extent} extent Extent.
   * @api
   */
  setExtent(t) {
    this.extent_ = t, this.canWrapX_ = !!(this.global_ && t);
  }
  /**
   * Set the world extent for this projection.
   * @param {import("../extent.js").Extent} worldExtent World extent
   *     [minlon, minlat, maxlon, maxlat].
   * @api
   */
  setWorldExtent(t) {
    this.worldExtent_ = t;
  }
  /**
   * Set the getPointResolution function (see {@link module:ol/proj.getPointResolution}
   * for this projection.
   * @param {function(number, import("../coordinate.js").Coordinate):number} func Function
   * @api
   */
  setGetPointResolution(t) {
    this.getPointResolutionFunc_ = t;
  }
  /**
   * Get the custom point resolution function for this projection (if set).
   * @return {GetPointResolution|undefined} The custom point
   * resolution function (if set).
   */
  getPointResolutionFunc() {
    return this.getPointResolutionFunc_;
  }
}
const mt = 6378137, rt = Math.PI * mt, er = [-rt, -rt, rt, rt], nr = [-180, -85, 180, 85], pt = mt * Math.log(Math.tan(Math.PI / 2));
class et extends Vt {
  /**
   * @param {string} code Code.
   */
  constructor(t) {
    super({
      code: t,
      units: "m",
      extent: er,
      global: !0,
      worldExtent: nr,
      getPointResolution: function(n, i) {
        return n / Math.cosh(i[1] / mt);
      }
    });
  }
}
const Qt = [
  new et("EPSG:3857"),
  new et("EPSG:102100"),
  new et("EPSG:102113"),
  new et("EPSG:900913"),
  new et("http://www.opengis.net/def/crs/EPSG/0/3857"),
  new et("http://www.opengis.net/gml/srs/epsg.xml#3857")
];
function ir(e, t, n, i) {
  const r = e.length;
  n = n > 1 ? n : 2, i = i ?? n, t === void 0 && (n > 2 ? t = e.slice() : t = new Array(r));
  for (let o = 0; o < r; o += i) {
    t[o] = rt * e[o] / 180;
    let s = mt * Math.log(Math.tan(Math.PI * (+e[o + 1] + 90) / 360));
    s > pt ? s = pt : s < -pt && (s = -pt), t[o + 1] = s;
  }
  return t;
}
function rr(e, t, n, i) {
  const r = e.length;
  n = n > 1 ? n : 2, i = i ?? n, t === void 0 && (n > 2 ? t = e.slice() : t = new Array(r));
  for (let o = 0; o < r; o += i)
    t[o] = 180 * e[o] / rt, t[o + 1] = 360 * Math.atan(Math.exp(e[o + 1] / mt)) / Math.PI - 90;
  return t;
}
const or = 6378137, Jt = [-180, -90, 180, 90], sr = Math.PI * or / 180;
class k extends Vt {
  /**
   * @param {string} code Code.
   * @param {string} [axisOrientation] Axis orientation.
   */
  constructor(t, n) {
    super({
      code: t,
      units: "degrees",
      extent: Jt,
      axisOrientation: n,
      global: !0,
      metersPerUnit: sr,
      worldExtent: Jt
    });
  }
}
const te = [
  new k("CRS:84"),
  new k("EPSG:4326", "neu"),
  new k("urn:ogc:def:crs:OGC:1.3:CRS84"),
  new k("urn:ogc:def:crs:OGC:2:84"),
  new k("http://www.opengis.net/def/crs/OGC/1.3/CRS84"),
  new k("http://www.opengis.net/gml/srs/epsg.xml#4326", "neu"),
  new k("http://www.opengis.net/def/crs/EPSG/0/4326", "neu")
];
let Gt = {};
function ar(e) {
  return Gt[e] || Gt[e.replace(/urn:(x-)?ogc:def:crs:EPSG:(.*:)?(\w+)$/, "EPSG:$3")] || null;
}
function ur(e, t) {
  Gt[e] = t;
}
let ot = {};
function gt(e, t, n) {
  const i = e.getCode(), r = t.getCode();
  i in ot || (ot[i] = {}), ot[i][r] = n;
}
function bt(e, t) {
  return e in ot && t in ot[e] ? ot[e][t] : null;
}
const At = 0.9996, D = 669438e-8, Lt = D * D, yt = Lt * D, J = D / (1 - D), ee = Math.sqrt(1 - D), st = (1 - ee) / (1 + ee), Le = st * st, zt = Le * st, Ht = zt * st, ye = Ht * st, Ie = 1 - D / 4 - 3 * Lt / 64 - 5 * yt / 256, lr = 3 * D / 8 + 3 * Lt / 32 + 45 * yt / 1024, cr = 15 * Lt / 256 + 45 * yt / 1024, fr = 35 * yt / 3072, dr = 3 / 2 * st - 27 / 32 * zt + 269 / 512 * ye, gr = 21 / 16 * Le - 55 / 32 * Ht, hr = 151 / 96 * zt - 417 / 128 * ye, mr = 1097 / 512 * Ht, _t = 6378137;
function Sr(e, t, n) {
  const i = e - 5e5, s = (n.north ? t : t - 1e7) / At / (_t * Ie), a = s + dr * Math.sin(2 * s) + gr * Math.sin(4 * s) + hr * Math.sin(6 * s) + mr * Math.sin(8 * s), u = Math.sin(a), c = u * u, d = Math.cos(a), p = u / d, S = p * p, m = S * S, x = 1 - D * c, P = Math.sqrt(1 - D * c), L = _t / P, w = (1 - D) / x, M = J * d ** 2, R = M * M, C = i / (L * At), B = C * C, G = B * C, b = G * C, tt = b * C, It = tt * C, K = a - p / w * (B / 2 - b / 24 * (5 + 3 * S + 10 * M - 4 * R - 9 * J)) + It / 720 * (61 + 90 * S + 298 * M + 45 * m - 252 * J - 3 * R);
  let N = (C - G / 6 * (1 + 2 * S + M) + tt / 120 * (5 - 2 * M + 28 * S - 3 * R + 8 * J + 24 * m)) / d;
  return N = Bt(
    N + Rt(we(n.number)),
    -Math.PI,
    Math.PI
  ), [kt(N), kt(K)];
}
const ne = -80, ie = 84, Tr = -180, pr = 180;
function Er(e, t, n) {
  e = Bt(e, Tr, pr), t < ne ? t = ne : t > ie && (t = ie);
  const i = Rt(t), r = Math.sin(i), o = Math.cos(i), s = r / o, a = s * s, u = a * a, c = Rt(e), d = we(n.number), p = Rt(d), S = _t / Math.sqrt(1 - D * r ** 2), m = J * o ** 2, x = o * Bt(c - p, -Math.PI, Math.PI), P = x * x, L = P * x, w = L * x, M = w * x, R = M * x, C = _t * (Ie * i - lr * Math.sin(2 * i) + cr * Math.sin(4 * i) - fr * Math.sin(6 * i)), B = At * S * (x + L / 6 * (1 - a + m) + M / 120 * (5 - 18 * a + u + 72 * m - 58 * J)) + 5e5;
  let G = At * (C + S * s * (P / 2 + w / 24 * (5 - a + 9 * m + 4 * m ** 2) + R / 720 * (61 - 58 * a + u + 600 * m - 330 * J)));
  return n.north || (G += 1e7), [B, G];
}
function we(e) {
  return (e - 1) * 6 - 180 + 3;
}
const xr = [
  /^EPSG:(\d+)$/,
  /^urn:ogc:def:crs:EPSG::(\d+)$/,
  /^http:\/\/www\.opengis\.net\/def\/crs\/EPSG\/0\/(\d+)$/
];
function be(e) {
  let t = 0;
  for (const r of xr) {
    const o = e.match(r);
    if (o) {
      t = parseInt(o[1]);
      break;
    }
  }
  if (!t)
    return null;
  let n = 0, i = !1;
  return t > 32700 && t < 32761 ? n = t - 32700 : t > 32600 && t < 32661 && (i = !0, n = t - 32600), n ? { number: n, north: i } : null;
}
function re(e, t) {
  return function(n, i, r, o) {
    const s = n.length;
    r = r > 1 ? r : 2, o = o ?? r, i || (r > 2 ? i = n.slice() : i = new Array(s));
    for (let a = 0; a < s; a += o) {
      const u = n[a], c = n[a + 1], d = e(u, c, t);
      i[a] = d[0], i[a + 1] = d[1];
    }
    return i;
  };
}
function Rr(e) {
  return be(e) ? new Vt({ code: e, units: "m" }) : null;
}
function Cr(e) {
  const t = be(e.getCode());
  return t ? {
    forward: re(Er, t),
    inverse: re(Sr, t)
  } : null;
}
const Mr = [Cr], Ar = [Rr];
function qt(e, t) {
  if (t !== void 0) {
    for (let n = 0, i = e.length; n < i; ++n)
      t[n] = e[n];
    t = t;
  } else
    t = e.slice();
  return t;
}
function Dt(e) {
  ur(e.getCode(), e), gt(e, e, qt);
}
function _r(e) {
  e.forEach(Dt);
}
function Z(e) {
  if (typeof e != "string")
    return e;
  const t = ar(e);
  if (t)
    return t;
  for (const n of Ar) {
    const i = n(e);
    if (i)
      return i;
  }
  return null;
}
function oe(e) {
  _r(e), e.forEach(function(t) {
    e.forEach(function(n) {
      t !== n && gt(t, n, qt);
    });
  });
}
function Pr(e, t, n, i) {
  e.forEach(function(r) {
    t.forEach(function(o) {
      gt(r, o, n), gt(o, r, i);
    });
  });
}
function se(e, t) {
  if (e === t)
    return !0;
  const n = e.getUnits() === t.getUnits();
  return (e.getCode() === t.getCode() || Oe(e, t) === qt) && n;
}
function Oe(e, t) {
  const n = e.getCode(), i = t.getCode();
  let r = bt(n, i);
  if (r)
    return r;
  let o = null, s = null;
  for (const u of Mr)
    o || (o = u(e)), s || (s = u(t));
  if (!o && !s)
    return null;
  const a = "EPSG:4326";
  if (s)
    if (o)
      r = Ot(
        o.inverse,
        s.forward
      );
    else {
      const u = bt(n, a);
      u && (r = Ot(
        u,
        s.forward
      ));
    }
  else {
    const u = bt(a, i);
    u && (r = Ot(
      o.inverse,
      u
    ));
  }
  return r && (Dt(e), Dt(t), gt(e, t, r)), r;
}
function Ot(e, t) {
  return function(n, i, r, o) {
    return i = e(n, i, r, o), t(i, i, r, o);
  };
}
function Lr(e, t) {
  const n = Z(e), i = Z(t);
  return Oe(n, i);
}
function yr(e, t, n, i) {
  const r = Lr(t, n);
  return ti(e, r, void 0);
}
function Ir() {
  oe(Qt), oe(te), Pr(
    te,
    Qt,
    ir,
    rr
  );
}
Ir();
class Ne {
  /**
   * @param {number} minX Minimum X.
   * @param {number} maxX Maximum X.
   * @param {number} minY Minimum Y.
   * @param {number} maxY Maximum Y.
   */
  constructor(t, n, i, r) {
    this.minX = t, this.maxX = n, this.minY = i, this.maxY = r;
  }
  /**
   * @param {import("./tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @return {boolean} Contains tile coordinate.
   */
  contains(t) {
    return this.containsXY(t[1], t[2]);
  }
  /**
   * @param {TileRange} tileRange Tile range.
   * @return {boolean} Contains.
   */
  containsTileRange(t) {
    return this.minX <= t.minX && t.maxX <= this.maxX && this.minY <= t.minY && t.maxY <= this.maxY;
  }
  /**
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @return {boolean} Contains coordinate.
   */
  containsXY(t, n) {
    return this.minX <= t && t <= this.maxX && this.minY <= n && n <= this.maxY;
  }
  /**
   * @param {TileRange} tileRange Tile range.
   * @return {boolean} Equals.
   */
  equals(t) {
    return this.minX == t.minX && this.minY == t.minY && this.maxX == t.maxX && this.maxY == t.maxY;
  }
  /**
   * @param {TileRange} tileRange Tile range.
   */
  extend(t) {
    t.minX < this.minX && (this.minX = t.minX), t.maxX > this.maxX && (this.maxX = t.maxX), t.minY < this.minY && (this.minY = t.minY), t.maxY > this.maxY && (this.maxY = t.maxY);
  }
  /**
   * @return {number} Height.
   */
  getHeight() {
    return this.maxY - this.minY + 1;
  }
  /**
   * @return {import("./size.js").Size} Size.
   */
  getSize() {
    return [this.getWidth(), this.getHeight()];
  }
  /**
   * @return {number} Width.
   */
  getWidth() {
    return this.maxX - this.minX + 1;
  }
  /**
   * @param {TileRange} tileRange Tile range.
   * @return {boolean} Intersects.
   */
  intersects(t) {
    return this.minX <= t.maxX && this.maxX >= t.minX && this.minY <= t.maxY && this.maxY >= t.minY;
  }
}
function nt(e, t, n, i, r) {
  return r !== void 0 ? (r.minX = e, r.maxX = t, r.minY = n, r.maxY = i, r) : new Ne(e, t, n, i);
}
function ft(e, t) {
  if (!e)
    throw new Error(t);
}
function Et(e, t, n, i, r, o) {
  let s = 0, a = e[n - i], u = e[n - i + 1];
  for (; t < n; t += i) {
    const c = e[t], d = e[t + 1];
    u <= o ? d > o && (c - a) * (o - u) - (r - a) * (d - u) > 0 && s++ : d <= o && (c - a) * (o - u) - (r - a) * (d - u) < 0 && s--, a = c, u = d;
  }
  return s !== 0;
}
function wr(e, t, n, i, r) {
  let o;
  for (t += i; t < n; t += i)
    if (o = r(
      e.slice(t - i, t),
      e.slice(t, t + i)
    ), o)
      return o;
  return !1;
}
function br(e, t, n, i, r, o) {
  return o = o ?? Zn(Me(), e, t, n, i), kn(r, o) ? o[0] >= r[0] && o[2] <= r[2] || o[1] >= r[1] && o[3] <= r[3] ? !0 : wr(
    e,
    t,
    n,
    i,
    /**
     * @param {import("../../coordinate.js").Coordinate} point1 Start point.
     * @param {import("../../coordinate.js").Coordinate} point2 End point.
     * @return {boolean} `true` if the segment and the extent intersect,
     *     `false` otherwise.
     */
    function(s, a) {
      return Jn(r, s, a);
    }
  ) : !1;
}
function Or(e, t, n, i, r) {
  return !!(br(e, t, n, i, r) || Et(
    e,
    t,
    n,
    i,
    r[0],
    r[1]
  ) || Et(
    e,
    t,
    n,
    i,
    r[0],
    r[3]
  ) || Et(
    e,
    t,
    n,
    i,
    r[2],
    r[1]
  ) || Et(
    e,
    t,
    n,
    i,
    r[2],
    r[3]
  ));
}
function xt(e, t) {
  return Array.isArray(e) ? e : (t === void 0 ? t = [e, e] : (t[0] = e, t[1] = e), t);
}
function ae(e, t, n, i) {
  return i !== void 0 ? (i[0] = e, i[1] = t, i[2] = n, i) : [e, t, n];
}
const Nr = 256, it = [0, 0, 0], q = 5;
class Fr {
  /**
   * @param {Options} options Tile grid options.
   */
  constructor(t) {
    this.minZoom = t.minZoom !== void 0 ? t.minZoom : 0, this.resolutions_ = t.resolutions, ft(
      ze(
        this.resolutions_,
        /**
         * @param {number} a First resolution
         * @param {number} b Second resolution
         * @return {number} Comparison result
         */
        (r, o) => o - r
      ),
      "`resolutions` must be sorted in descending order"
    );
    let n;
    if (!t.origins) {
      for (let r = 0, o = this.resolutions_.length - 1; r < o; ++r)
        if (!n)
          n = this.resolutions_[r] / this.resolutions_[r + 1];
        else if (this.resolutions_[r] / this.resolutions_[r + 1] !== n) {
          n = void 0;
          break;
        }
    }
    this.zoomFactor_ = n, this.maxZoom = this.resolutions_.length - 1, this.origin_ = t.origin !== void 0 ? t.origin : null, this.origins_ = null, t.origins !== void 0 && (this.origins_ = t.origins, ft(
      this.origins_.length == this.resolutions_.length,
      "Number of `origins` and `resolutions` must be equal"
    ));
    const i = t.extent;
    i !== void 0 && !this.origin_ && !this.origins_ && (this.origin_ = Kn(i)), ft(
      !this.origin_ && this.origins_ || this.origin_ && !this.origins_,
      "Either `origin` or `origins` must be configured, never both"
    ), this.tileSizes_ = null, t.tileSizes !== void 0 && (this.tileSizes_ = t.tileSizes, ft(
      this.tileSizes_.length == this.resolutions_.length,
      "Number of `tileSizes` and `resolutions` must be equal"
    )), this.tileSize_ = t.tileSize !== void 0 ? t.tileSize : this.tileSizes_ ? null : Nr, ft(
      !this.tileSize_ && this.tileSizes_ || this.tileSize_ && !this.tileSizes_,
      "Either `tileSize` or `tileSizes` must be configured, never both"
    ), this.extent_ = i !== void 0 ? i : null, this.fullTileRanges_ = null, this.tmpSize_ = [0, 0], this.tmpExtent_ = [0, 0, 0, 0], t.sizes !== void 0 ? this.fullTileRanges_ = t.sizes.map((r, o) => {
      const s = new Ne(
        Math.min(0, r[0]),
        Math.max(r[0] - 1, -1),
        Math.min(0, r[1]),
        Math.max(r[1] - 1, -1)
      );
      if (i) {
        const a = this.getTileRangeForExtentAndZ(i, o);
        s.minX = Math.max(a.minX, s.minX), s.maxX = Math.min(a.maxX, s.maxX), s.minY = Math.max(a.minY, s.minY), s.maxY = Math.min(a.maxY, s.maxY);
      }
      return s;
    }) : i && this.calculateTileRanges_(i);
  }
  /**
   * Call a function with each tile coordinate for a given extent and zoom level.
   *
   * @param {import("../extent.js").Extent} extent Extent.
   * @param {number} zoom Integer zoom level.
   * @param {function(import("../tilecoord.js").TileCoord): void} callback Function called with each tile coordinate.
   * @api
   */
  forEachTileCoord(t, n, i) {
    const r = this.getTileRangeForExtentAndZ(t, n);
    for (let o = r.minX, s = r.maxX; o <= s; ++o)
      for (let a = r.minY, u = r.maxY; a <= u; ++a)
        i([n, o, a]);
  }
  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {function(number, import("../TileRange.js").default): boolean} callback Callback.
   * @param {import("../TileRange.js").default} [tempTileRange] Temporary import("../TileRange.js").default object.
   * @param {import("../extent.js").Extent} [tempExtent] Temporary import("../extent.js").Extent object.
   * @return {boolean} Callback succeeded.
   */
  forEachTileCoordParentTileRange(t, n, i, r) {
    let o, s, a, u = null, c = t[0] - 1;
    for (this.zoomFactor_ === 2 ? (s = t[1], a = t[2]) : u = this.getTileCoordExtent(t, r); c >= this.minZoom; ) {
      if (s !== void 0 && a !== void 0 ? (s = Math.floor(s / 2), a = Math.floor(a / 2), o = nt(s, s, a, a, i)) : o = this.getTileRangeForExtentAndZ(
        u,
        c,
        i
      ), n(c, o))
        return !0;
      --c;
    }
    return !1;
  }
  /**
   * Get the extent for this tile grid, if it was configured.
   * @return {import("../extent.js").Extent} Extent.
   * @api
   */
  getExtent() {
    return this.extent_;
  }
  /**
   * Get the maximum zoom level for the grid.
   * @return {number} Max zoom.
   * @api
   */
  getMaxZoom() {
    return this.maxZoom;
  }
  /**
   * Get the minimum zoom level for the grid.
   * @return {number} Min zoom.
   * @api
   */
  getMinZoom() {
    return this.minZoom;
  }
  /**
   * Get the origin for the grid at the given zoom level.
   * @param {number} z Integer zoom level.
   * @return {import("../coordinate.js").Coordinate} Origin.
   * @api
   */
  getOrigin(t) {
    return this.origin_ ? this.origin_ : this.origins_[t];
  }
  /**
   * Get the resolution for the given zoom level.
   * @param {number} z Integer zoom level.
   * @return {number} Resolution.
   * @api
   */
  getResolution(t) {
    return this.resolutions_[t];
  }
  /**
   * Get the list of resolutions for the tile grid.
   * @return {Array<number>} Resolutions.
   * @api
   */
  getResolutions() {
    return this.resolutions_;
  }
  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {import("../TileRange.js").default} [tempTileRange] Temporary import("../TileRange.js").default object.
   * @param {import("../extent.js").Extent} [tempExtent] Temporary import("../extent.js").Extent object.
   * @return {import("../TileRange.js").default|null} Tile range.
   */
  getTileCoordChildTileRange(t, n, i) {
    if (t[0] < this.maxZoom) {
      if (this.zoomFactor_ === 2) {
        const o = t[1] * 2, s = t[2] * 2;
        return nt(
          o,
          o + 1,
          s,
          s + 1,
          n
        );
      }
      const r = this.getTileCoordExtent(
        t,
        i || this.tmpExtent_
      );
      return this.getTileRangeForExtentAndZ(
        r,
        t[0] + 1,
        n
      );
    }
    return null;
  }
  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {number} z Integer zoom level.
   * @param {import("../TileRange.js").default} [tempTileRange] Temporary import("../TileRange.js").default object.
   * @return {import("../TileRange.js").default|null} Tile range.
   */
  getTileRangeForTileCoordAndZ(t, n, i) {
    if (n > this.maxZoom || n < this.minZoom)
      return null;
    const r = t[0], o = t[1], s = t[2];
    if (n === r)
      return nt(
        o,
        s,
        o,
        s,
        i
      );
    if (this.zoomFactor_) {
      const u = Math.pow(this.zoomFactor_, n - r), c = Math.floor(o * u), d = Math.floor(s * u);
      if (n < r)
        return nt(c, c, d, d, i);
      const p = Math.floor(u * (o + 1)) - 1, S = Math.floor(u * (s + 1)) - 1;
      return nt(c, p, d, S, i);
    }
    const a = this.getTileCoordExtent(t, this.tmpExtent_);
    return this.getTileRangeForExtentAndZ(a, n, i);
  }
  /**
   * Get a tile range for the given extent and integer zoom level.
   * @param {import("../extent.js").Extent} extent Extent.
   * @param {number} z Integer zoom level.
   * @param {import("../TileRange.js").default} [tempTileRange] Temporary tile range object.
   * @return {import("../TileRange.js").default} Tile range.
   */
  getTileRangeForExtentAndZ(t, n, i) {
    this.getTileCoordForXYAndZ_(t[0], t[3], n, !1, it);
    const r = it[1], o = it[2];
    this.getTileCoordForXYAndZ_(t[2], t[1], n, !0, it);
    const s = it[1], a = it[2];
    return nt(r, s, o, a, i);
  }
  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @return {import("../coordinate.js").Coordinate} Tile center.
   */
  getTileCoordCenter(t) {
    const n = this.getOrigin(t[0]), i = this.getResolution(t[0]), r = xt(this.getTileSize(t[0]), this.tmpSize_);
    return [
      n[0] + (t[1] + 0.5) * r[0] * i,
      n[1] - (t[2] + 0.5) * r[1] * i
    ];
  }
  /**
   * Get the extent of a tile coordinate.
   *
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {import("../extent.js").Extent} [tempExtent] Temporary extent object.
   * @return {import("../extent.js").Extent} Extent.
   * @api
   */
  getTileCoordExtent(t, n) {
    const i = this.getOrigin(t[0]), r = this.getResolution(t[0]), o = xt(this.getTileSize(t[0]), this.tmpSize_), s = i[0] + t[1] * o[0] * r, a = i[1] - (t[2] + 1) * o[1] * r, u = s + o[0] * r, c = a + o[1] * r;
    return $t(s, a, u, c, n);
  }
  /**
   * Get the tile coordinate for the given map coordinate and resolution.  This
   * method considers that coordinates that intersect tile boundaries should be
   * assigned the higher tile coordinate.
   *
   * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {number} resolution Resolution.
   * @param {import("../tilecoord.js").TileCoord} [opt_tileCoord] Destination import("../tilecoord.js").TileCoord object.
   * @return {import("../tilecoord.js").TileCoord} Tile coordinate.
   * @api
   */
  getTileCoordForCoordAndResolution(t, n, i) {
    return this.getTileCoordForXYAndResolution_(
      t[0],
      t[1],
      n,
      !1,
      i
    );
  }
  /**
   * Note that this method should not be called for resolutions that correspond
   * to an integer zoom level.  Instead call the `getTileCoordForXYAndZ_` method.
   * @param {number} x X.
   * @param {number} y Y.
   * @param {number} resolution Resolution (for a non-integer zoom level).
   * @param {boolean} reverseIntersectionPolicy Instead of letting edge
   *     intersections go to the higher tile coordinate, let edge intersections
   *     go to the lower tile coordinate.
   * @param {import("../tilecoord.js").TileCoord} [opt_tileCoord] Temporary import("../tilecoord.js").TileCoord object.
   * @return {import("../tilecoord.js").TileCoord} Tile coordinate.
   * @private
   */
  getTileCoordForXYAndResolution_(t, n, i, r, o) {
    const s = this.getZForResolution(i), a = i / this.getResolution(s), u = this.getOrigin(s), c = xt(this.getTileSize(s), this.tmpSize_);
    let d = a * (t - u[0]) / i / c[0], p = a * (u[1] - n) / i / c[1];
    return r ? (d = Tt(d, q) - 1, p = Tt(p, q) - 1) : (d = St(d, q), p = St(p, q)), ae(s, d, p, o);
  }
  /**
   * Although there is repetition between this method and `getTileCoordForXYAndResolution_`,
   * they should have separate implementations.  This method is for integer zoom
   * levels.  The other method should only be called for resolutions corresponding
   * to non-integer zoom levels.
   * @param {number} x Map x coordinate.
   * @param {number} y Map y coordinate.
   * @param {number} z Integer zoom level.
   * @param {boolean} reverseIntersectionPolicy Instead of letting edge
   *     intersections go to the higher tile coordinate, let edge intersections
   *     go to the lower tile coordinate.
   * @param {import("../tilecoord.js").TileCoord} [opt_tileCoord] Temporary import("../tilecoord.js").TileCoord object.
   * @return {import("../tilecoord.js").TileCoord} Tile coordinate.
   * @private
   */
  getTileCoordForXYAndZ_(t, n, i, r, o) {
    const s = this.getOrigin(i), a = this.getResolution(i), u = xt(this.getTileSize(i), this.tmpSize_);
    let c = (t - s[0]) / a / u[0], d = (s[1] - n) / a / u[1];
    return r ? (c = Tt(c, q) - 1, d = Tt(d, q) - 1) : (c = St(c, q), d = St(d, q)), ae(i, c, d, o);
  }
  /**
   * Get a tile coordinate given a map coordinate and zoom level.
   * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {number} z Integer zoom level, e.g. the result of a `getZForResolution()` method call
   * @param {import("../tilecoord.js").TileCoord} [opt_tileCoord] Destination import("../tilecoord.js").TileCoord object.
   * @return {import("../tilecoord.js").TileCoord} Tile coordinate.
   * @api
   */
  getTileCoordForCoordAndZ(t, n, i) {
    return this.getTileCoordForXYAndZ_(
      t[0],
      t[1],
      n,
      !1,
      i
    );
  }
  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @return {number} Tile resolution.
   */
  getTileCoordResolution(t) {
    return this.resolutions_[t[0]];
  }
  /**
   * Get the tile size for a zoom level. The type of the return value matches the
   * `tileSize` or `tileSizes` that the tile grid was configured with. To always
   * get an {@link import("../size.js").Size}, run the result through {@link module:ol/size.toSize}.
   * @param {number} z Z.
   * @return {number|import("../size.js").Size} Tile size.
   * @api
   */
  getTileSize(t) {
    return this.tileSize_ ? this.tileSize_ : this.tileSizes_[t];
  }
  /**
   * @param {number} z Zoom level.
   * @return {import("../TileRange.js").default|null} Extent tile range for the specified zoom level.
   */
  getFullTileRange(t) {
    return this.fullTileRanges_ ? this.fullTileRanges_[t] : this.extent_ ? this.getTileRangeForExtentAndZ(this.extent_, t) : null;
  }
  /**
   * @param {number} resolution Resolution.
   * @param {number|import("../array.js").NearestDirectionFunction} [opt_direction]
   *     If 0, the nearest resolution will be used.
   *     If 1, the nearest higher resolution (lower Z) will be used. If -1, the
   *     nearest lower resolution (higher Z) will be used. Default is 0.
   *     Use a {@link module:ol/array~NearestDirectionFunction} for more precise control.
   *
   * For example to change tile Z at the midpoint of zoom levels
   * ```js
   * function(value, high, low) {
   *   return value - low * Math.sqrt(high / low);
   * }
   * ```
   * @return {number} Z.
   * @api
   */
  getZForResolution(t, n) {
    const i = Ve(
      this.resolutions_,
      t,
      n || 0
    );
    return Ji(i, this.minZoom, this.maxZoom);
  }
  /**
   * The tile with the provided tile coordinate intersects the given viewport.
   * @param {import('../tilecoord.js').TileCoord} tileCoord Tile coordinate.
   * @param {Array<number>} viewport Viewport as returned from {@link module:ol/extent.getRotatedViewport}.
   * @return {boolean} The tile with the provided tile coordinate intersects the given viewport.
   */
  tileCoordIntersectsViewport(t, n) {
    return Or(
      n,
      0,
      n.length,
      2,
      this.getTileCoordExtent(t)
    );
  }
  /**
   * @param {!import("../extent.js").Extent} extent Extent for this tile grid.
   * @private
   */
  calculateTileRanges_(t) {
    const n = this.resolutions_.length, i = new Array(n);
    for (let r = this.minZoom; r < n; ++r)
      i[r] = this.getTileRangeForExtentAndZ(t, r);
    this.fullTileRanges_ = i;
  }
}
class Br extends Fr {
  /**
   * @param {Options} options WMTS options.
   */
  constructor(t) {
    super({
      extent: t.extent,
      origin: t.origin,
      origins: t.origins,
      resolutions: t.resolutions,
      tileSize: t.tileSize,
      tileSizes: t.tileSizes,
      sizes: t.sizes
    }), this.matrixIds_ = t.matrixIds;
  }
  /**
   * @param {number} z Z.
   * @return {string} MatrixId..
   */
  getMatrixId(t) {
    return this.matrixIds_[t];
  }
  /**
   * Get the list of matrix identifiers.
   * @return {Array<string>} MatrixIds.
   * @api
   */
  getMatrixIds() {
    return this.matrixIds_;
  }
}
function Gr(e, t, n) {
  const i = [], r = [], o = [], s = [], a = [];
  n = n !== void 0 ? n : [];
  const u = "SupportedCRS", c = "TileMatrix", d = "Identifier", p = "ScaleDenominator", S = "TopLeftCorner", m = "TileWidth", x = "TileHeight", P = e[u], L = Z(P), w = L.getMetersPerUnit(), M = L.getAxisOrientation().startsWith("ne");
  return e[c].sort(function(R, C) {
    return C[p] - R[p];
  }), e[c].forEach(function(R) {
    let C;
    if (n.length > 0 ? C = n.find(function(B) {
      return R[d] == B[c] ? !0 : R[d].includes(":") ? !1 : e[d] + ":" + R[d] === B[c];
    }) : C = !0, C) {
      r.push(R[d]);
      const B = R[p] * 28e-5 / w, G = R[m], b = R[x];
      M ? o.push([
        R[S][1],
        R[S][0]
      ]) : o.push(R[S]), i.push(B), s.push(
        G == b ? G : [G, b]
      ), a.push([R.MatrixWidth, R.MatrixHeight]);
    }
  }), new Br({
    extent: t,
    origins: o,
    resolutions: i,
    matrixIds: r,
    tileSizes: s,
    sizes: a
  });
}
function Dr(e, t) {
  const i = e.Contents.Layer?.find(function(T) {
    return T.Identifier == t.layer;
  });
  if (!i)
    return null;
  const r = e.Contents.TileMatrixSet;
  let o;
  i.TileMatrixSetLink.length > 1 ? "projection" in t ? o = i.TileMatrixSetLink.findIndex(function(T) {
    const H = r.find(function(wt) {
      return wt.Identifier == T.TileMatrixSet;
    }).SupportedCRS, lt = Z(H), V = Z(t.projection);
    return lt && V ? se(lt, V) : H == t.projection;
  }) : o = i.TileMatrixSetLink.findIndex(function(T) {
    return T.TileMatrixSet == t.matrixSet;
  }) : o = 0, o < 0 && (o = 0);
  const s = (
    /** @type {string} */
    i.TileMatrixSetLink[o].TileMatrixSet
  ), a = (
    /** @type {Array<Object>} */
    i.TileMatrixSetLink[o].TileMatrixSetLimits
  );
  let u = (
    /** @type {string} */
    i.Format[0]
  );
  "format" in t && (u = t.format), o = i.Style.findIndex(function(T) {
    return "style" in t ? T.Title == t.style : T.isDefault;
  }), o < 0 && (o = 0);
  const c = (
    /** @type {string} */
    i.Style[o].Identifier
  ), d = {};
  "Dimension" in i && i.Dimension.forEach(function(T, y, H) {
    const lt = T.Identifier;
    let V = T.Default;
    V === void 0 && (V = T.Value[0]), d[lt] = V;
  });
  const S = e.Contents.TileMatrixSet.find(function(T) {
    return T.Identifier == s;
  });
  let m;
  const x = S.SupportedCRS;
  if (x && (m = Z(x)), "projection" in t) {
    const T = Z(t.projection);
    T && (!m || se(T, m)) && (m = T);
  }
  let P = !1;
  const L = m.getAxisOrientation().startsWith("ne");
  let w = S.TileMatrix[0], M = {
    MinTileCol: 0,
    MinTileRow: 0,
    // subtract one to end up at tile top left
    MaxTileCol: w.MatrixWidth - 1,
    MaxTileRow: w.MatrixHeight - 1
  };
  if (a) {
    M = a[a.length - 1];
    const T = S.TileMatrix.find(
      (y) => y.Identifier === M.TileMatrix || S.Identifier + ":" + y.Identifier === M.TileMatrix
    );
    T && (w = T);
  }
  const R = w.ScaleDenominator * 28e-5 / m.getMetersPerUnit(), C = L ? [w.TopLeftCorner[1], w.TopLeftCorner[0]] : w.TopLeftCorner, B = w.TileWidth * R, G = w.TileHeight * R;
  let b = S.BoundingBox;
  b && L && (b = [
    b[1],
    b[0],
    b[3],
    b[2]
  ]);
  let tt = [
    C[0] + B * M.MinTileCol,
    // add one to get proper bottom/right coordinate
    C[1] - G * (1 + M.MaxTileRow),
    C[0] + B * (1 + M.MaxTileCol),
    C[1] - G * M.MinTileRow
  ];
  if (b !== void 0 && !zn(b, tt)) {
    const T = i.WGS84BoundingBox, y = Z("EPSG:4326").getExtent();
    if (tt = b, T)
      P = T[0] === y[0] && T[2] === y[2];
    else {
      const H = yr(
        b,
        S.SupportedCRS,
        "EPSG:4326"
      );
      P = H[0] - 1e-10 <= y[0] && H[2] + 1e-10 >= y[2];
    }
  }
  const It = Gr(
    S,
    tt,
    a
  ), K = [];
  let N = t.requestEncoding;
  if (N = N !== void 0 ? N : "", "OperationsMetadata" in e && "GetTile" in e.OperationsMetadata) {
    const T = e.OperationsMetadata.GetTile.DCP.HTTP.Get;
    for (let y = 0, H = T.length; y < H; ++y)
      if (T[y].Constraint) {
        const V = T[y].Constraint.find(function(wt) {
          return wt.name == "GetEncoding";
        }).AllowedValues.Value;
        if (N === "" && (N = V[0]), N === "KVP")
          V.includes("KVP") && K.push(
            /** @type {string} */
            T[y].href
          );
        else
          break;
      } else T[y].href && (N = "KVP", K.push(
        /** @type {string} */
        T[y].href
      ));
  }
  return K.length === 0 && (N = "REST", i.ResourceURL.forEach(function(T) {
    T.resourceType === "tile" && (u = T.format, K.push(
      /** @type {string} */
      T.template
    ));
  })), {
    urls: K,
    layer: t.layer,
    matrixSet: s,
    format: u,
    projection: m,
    requestEncoding: N,
    tileGrid: It,
    style: c,
    dimensions: d,
    wrapX: P,
    crossOrigin: t.crossOrigin
  };
}
function j(e) {
  let t = e?.split(":").pop();
  if (t)
    return /84/.test(t) && (t = "4326"), Ct.find((n) => n.epsg === `EPSG:${t}`);
}
function Ur(e, t) {
  let n = e.ServiceProvider?.ProviderName;
  const i = e.ServiceProvider?.ProviderSite;
  return n || (A.warn({
    title: "WMTS Capabilities parser",
    titleColor: W.Indigo,
    messages: [`No attribution title for layer ${t}`, e]
  }), n = e.originUrl.hostname), [{ name: n, url: i }];
}
function Ut(e, t) {
  for (const n of t) {
    const i = e.Contents?.TileMatrixSet?.find(
      (r) => r.Identifier === n.TileMatrixSet
    );
    if (i)
      return i;
  }
}
function vr(e, t, n, i) {
  let r, o;
  if (n.WGS84BoundingBox?.length)
    r = n.WGS84BoundingBox, o = Y;
  else if (n.BoundingBox) {
    const s = n.BoundingBox.find((a) => j(a.crs ?? "") === i);
    if (s && s.extent)
      r = s.extent;
    else if (n.BoundingBox.length === 1 && !n.BoundingBox[0]?.crs) {
      const a = Ut(e, n.TileMatrixSetLink);
      o = j(a?.SupportedCRS), o && n.BoundingBox && n.BoundingBox[0] && n.BoundingBox[0].extent && (r = n.BoundingBox[0].extent);
    } else {
      const a = n.BoundingBox.find(
        (u) => u.crs !== void 0 && j(u.crs) !== void 0
      );
      a && a.crs && a.extent && (o = j(a.crs), r = a.extent);
    }
  }
  if (!r && e.Contents?.TileMatrixSet) {
    const s = Ut(e, n.TileMatrixSetLink), a = j(s?.SupportedCRS ?? "");
    s && a && s.BoundingBox && s.BoundingBox.length === 4 && (r = s.BoundingBox, o = a);
  }
  if (r && o && i.epsg !== o.epsg && (r = Nt.projExtent(o, i, r)), !r) {
    const s = `No layer extent found for ${t}`;
    A.error(s, n);
  }
  return r;
}
function Xr(e) {
  return (e.Style?.filter((n) => n.LegendURL?.length > 0) ?? []).map(
    (n) => n.LegendURL.map(
      (i) => ({
        url: i.href,
        format: i.format,
        width: i.width,
        height: i.height
      })
    )
  ).flat();
}
function Yr(e, t, n, i) {
  const r = [];
  n.WGS84BoundingBox?.length && r.push(Y), r.push(
    ...n.BoundingBox?.map((a) => j(a.crs ?? "")).filter(
      (a) => !!a
    ) ?? []
  );
  const o = Ut(
    e,
    n.TileMatrixSetLink
  )?.SupportedCRS;
  if (o) {
    const a = j(o);
    a ? r.push(a) : A.warn({
      title: "WMTS Capabilities parser",
      titleColor: W.Indigo,
      messages: [`CRS ${o} no supported by application or invalid`]
    });
  }
  const s = [...new Set(r)];
  if (s.length === 0) {
    const a = `No projections found for layer ${t}`;
    if (!i)
      throw new X(a);
    A.error({
      title: "WMTS Capabilities parser",
      titleColor: W.Indigo,
      messages: [a, n]
    });
  }
  return s;
}
function Wr(e, t, n) {
  const i = n.TileMatrixSetLink.map((r) => r.TileMatrixSet);
  if (e.Contents?.TileMatrixSet)
    return console.log("CAPABILITIES", e.Contents?.TileMatrixSet), e.Contents?.TileMatrixSet.filter((r) => i.includes(r.Identifier)).map((r) => {
      const o = j(r.SupportedCRS);
      if (!o) {
        A.warn({
          title: "WMTS Capabilities parser",
          titleColor: W.Indigo,
          messages: [
            `Invalid or non supported CRS ${r.SupportedCRS} in TileMatrixSet ${r.Identifier} for layer ${t}}`
          ]
        });
        return;
      }
      return {
        id: r.Identifier,
        projection: o,
        tileMatrix: r.TileMatrix
      };
    }).filter((r) => !!r);
}
function $r(e) {
  if (!e.Dimension || e.Dimension.length === 0)
    return;
  const t = e.Dimension.map((i) => i.Identifier), n = [];
  for (const i of t) {
    const r = e.Dimension.filter(
      (o) => o.Identifier === i
    );
    n.push({
      id: i,
      values: r.flatMap((o) => o.Value),
      defaultValue: r[0].Default
      // TODO: find if "current" is part of the WMTS spec
    });
  }
  return n;
}
function Vr(e, t, n, i = !0) {
  let r = t.Identifier;
  if ((!r || r.length === 0) && (r = t.Title), !r || r.length === 0) {
    const a = `No layer identifier found in Capabilities ${e.originUrl.toString()}`;
    if (A.error({
      title: "WMTS Capabilities parser",
      titleColor: W.Indigo,
      messages: [a, t]
    }), i)
      return {};
    throw new X(a, "invalid_wmts_capabilities");
  }
  let o;
  if (e.OperationsMetadata && "GetCapabilities" in e.OperationsMetadata && e.OperationsMetadata.GetCapabilities !== void 0) {
    const a = e.OperationsMetadata.GetCapabilities.DCP.HTTP;
    a.Get && a.Get.length > 0 ? o = a.Get[0].href : a.Post && a.Post.length > 0 && (o = a.Post[0].href);
  }
  o || (o = e.originUrl.toString());
  let s = Xe.REST;
  if (e.OperationsMetadata && "GetTile" in e.OperationsMetadata && e.OperationsMetadata.GetTile !== void 0) {
    const a = e.OperationsMetadata.GetTile.DCP.HTTP;
    let u;
    a.Get && a.Get.length > 0 ? u = a.Get[0] : a.Post && a.Post.length > 0 && (u = a.Post[0]), u?.Constraint && u?.Constraint?.length > 0 && (s = u.Constraint[0].AllowedValues.Value[0]);
  }
  return {
    id: r,
    name: t.Title ?? r,
    baseUrl: o,
    abstract: t.Abstract,
    options: {
      version: e.version
    },
    attributions: Ur(e, r),
    extent: vr(e, r, t, n),
    legends: Xr(t),
    availableProjections: Yr(e, r, t, i),
    getTileEncoding: s,
    urlTemplate: t.ResourceURL[0]?.template ?? "",
    // Based on the spec, at least one style should be available
    style: t.Style[0]?.Identifier,
    tileMatrixSets: Wr(e, r, t),
    dimensions: $r(t)
  };
}
function Fe(e, t) {
  return e.Contents?.Layer ? e.Contents.Layer.find((i) => i.Identifier === t || !i.Identifier && i.Title === t) : void 0;
}
function Be(e) {
  return e.Contents?.Layer ?? [];
}
function zr(e) {
  if (!e)
    return;
  const t = e.find((i) => i.id.toLowerCase() === "time");
  if (!t)
    return;
  const n = t.values?.map((i) => le(i));
  return ce(t.defaultValue, n);
}
function Ge(e, t, n) {
  if (!t)
    return;
  const { outputProjection: i = Y, initialValues: r = {}, ignoreErrors: o = !0 } = n ?? {}, { opacity: s = 1, isVisible: a = !0, currentYear: u } = r;
  let c;
  typeof t == "string" ? c = t : c = t.Identifier;
  const d = Fe(e, c);
  if (!d) {
    const S = `No WMTS layer ${c} found in Capabilities ${e.originUrl.toString()}`;
    if (A.error({
      title: "WMTS Capabilities parser",
      titleColor: W.Indigo,
      messages: [S, e]
    }), o)
      return;
    throw new X(S, "no_layer_found");
  }
  const p = Vr(e, d, i, o);
  if (!p) {
    A.error(`No attributes found for layer ${d.Identifier}`);
    return;
  }
  return ue.makeExternalWMTSLayer({
    type: ve.WMTS,
    ...p,
    opacity: s,
    isVisible: a,
    isLoading: !1,
    options: Dr(e, {
      layer: p.id,
      projection: i.epsg
    }) ?? void 0,
    timeConfig: zr(p.dimensions),
    currentYear: u
  });
}
function Hr(e, t) {
  return Be(e).map((n) => Ge(e, n, t)).filter((n) => !!n);
}
function qr(e, t) {
  const n = new bi();
  try {
    const i = n.read(e);
    if (!i.version)
      throw new X(
        `No version found in Capabilities ${t.toString()}`,
        "invalid_wmts_capabilities"
      );
    return i.originUrl = t, i;
  } catch (i) {
    throw A.error({
      title: "WMTS Capabilities parser",
      titleColor: W.Indigo,
      messages: [`Failed to parse capabilities of ${t?.toString()}`, i]
    }), new X(
      `Failed to parse WMTS Capabilities: invalid content: ${i?.toString()}`,
      "invalid_wmts_capabilities"
    );
  }
}
const Qr = {
  parse: qr,
  getAllCapabilitiesLayers: Be,
  getCapabilitiesLayer: Fe,
  getAllExternalLayers: Hr,
  getExternalLayer: Ge
};
export {
  kr as wmsCapabilitiesParser,
  Qr as wmtsCapabilitiesParser
};
