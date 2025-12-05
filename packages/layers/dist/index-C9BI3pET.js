import "./validation.js";
function wv(n) {
  n("EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"), n("EPSG:4269", "+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees"), n("EPSG:3857", "+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs");
  for (var i = 1; i <= 60; ++i)
    n("EPSG:" + (32600 + i), "+proj=utm +zone=" + i + " +datum=WGS84 +units=m"), n("EPSG:" + (32700 + i), "+proj=utm +zone=" + i + " +south +datum=WGS84 +units=m");
  n.WGS84 = n["EPSG:4326"], n["EPSG:3785"] = n["EPSG:3857"], n.GOOGLE = n["EPSG:3857"], n["EPSG:900913"] = n["EPSG:3857"], n["EPSG:102113"] = n["EPSG:3857"];
}
var yr = 1, pr = 2, is = 3, Sv = 4, sl = 5, Ef = 6378137, Iv = 6356752314e-3, Mf = 0.0066943799901413165, xa = 484813681109536e-20, J = Math.PI / 2, Nv = 0.16666666666666666, bv = 0.04722222222222222, Cv = 0.022156084656084655, st = 1e-10, Ee = 0.017453292519943295, Wn = 57.29577951308232, jt = Math.PI / 4, Ia = Math.PI * 2, oe = 3.14159265359, en = {};
en.greenwich = 0;
en.lisbon = -9.131906111111;
en.paris = 2.337229166667;
en.bogota = -74.080916666667;
en.madrid = -3.687938888889;
en.rome = 12.452333333333;
en.bern = 7.439583333333;
en.jakarta = 106.807719444444;
en.ferro = -17.666666666667;
en.brussels = 4.367975;
en.stockholm = 18.058277777778;
en.athens = 23.7163375;
en.oslo = 10.722916666667;
const Pv = {
  mm: { to_meter: 1e-3 },
  cm: { to_meter: 0.01 },
  ft: { to_meter: 0.3048 },
  "us-ft": { to_meter: 1200 / 3937 },
  fath: { to_meter: 1.8288 },
  kmi: { to_meter: 1852 },
  "us-ch": { to_meter: 20.1168402336805 },
  "us-mi": { to_meter: 1609.34721869444 },
  km: { to_meter: 1e3 },
  "ind-ft": { to_meter: 0.30479841 },
  "ind-yd": { to_meter: 0.91439523 },
  mi: { to_meter: 1609.344 },
  yd: { to_meter: 0.9144 },
  ch: { to_meter: 20.1168 },
  link: { to_meter: 0.201168 },
  dm: { to_meter: 0.1 },
  in: { to_meter: 0.0254 },
  "ind-ch": { to_meter: 20.11669506 },
  "us-in": { to_meter: 0.025400050800101 },
  "us-yd": { to_meter: 0.914401828803658 }
};
var kf = /[\s_\-\/\(\)]/g;
function Bi(n, i) {
  if (n[i])
    return n[i];
  for (var a = Object.keys(n), l = i.toLowerCase().replace(kf, ""), c = -1, _, m; ++c < a.length; )
    if (_ = a[c], m = _.toLowerCase().replace(kf, ""), m === l)
      return n[_];
}
function al(n) {
  var i = {}, a = n.split("+").map(function(g) {
    return g.trim();
  }).filter(function(g) {
    return g;
  }).reduce(function(g, v) {
    var M = v.split("=");
    return M.push(!0), g[M[0].toLowerCase()] = M[1], g;
  }, {}), l, c, _, m = {
    proj: "projName",
    datum: "datumCode",
    rf: function(g) {
      i.rf = parseFloat(g);
    },
    lat_0: function(g) {
      i.lat0 = g * Ee;
    },
    lat_1: function(g) {
      i.lat1 = g * Ee;
    },
    lat_2: function(g) {
      i.lat2 = g * Ee;
    },
    lat_ts: function(g) {
      i.lat_ts = g * Ee;
    },
    lon_0: function(g) {
      i.long0 = g * Ee;
    },
    lon_1: function(g) {
      i.long1 = g * Ee;
    },
    lon_2: function(g) {
      i.long2 = g * Ee;
    },
    alpha: function(g) {
      i.alpha = parseFloat(g) * Ee;
    },
    gamma: function(g) {
      i.rectified_grid_angle = parseFloat(g) * Ee;
    },
    lonc: function(g) {
      i.longc = g * Ee;
    },
    x_0: function(g) {
      i.x0 = parseFloat(g);
    },
    y_0: function(g) {
      i.y0 = parseFloat(g);
    },
    k_0: function(g) {
      i.k0 = parseFloat(g);
    },
    k: function(g) {
      i.k0 = parseFloat(g);
    },
    a: function(g) {
      i.a = parseFloat(g);
    },
    b: function(g) {
      i.b = parseFloat(g);
    },
    r: function(g) {
      i.a = i.b = parseFloat(g);
    },
    r_a: function() {
      i.R_A = !0;
    },
    zone: function(g) {
      i.zone = parseInt(g, 10);
    },
    south: function() {
      i.utmSouth = !0;
    },
    towgs84: function(g) {
      i.datum_params = g.split(",").map(function(v) {
        return parseFloat(v);
      });
    },
    to_meter: function(g) {
      i.to_meter = parseFloat(g);
    },
    units: function(g) {
      i.units = g;
      var v = Bi(Pv, g);
      v && (i.to_meter = v.to_meter);
    },
    from_greenwich: function(g) {
      i.from_greenwich = g * Ee;
    },
    pm: function(g) {
      var v = Bi(en, g);
      i.from_greenwich = (v || parseFloat(g)) * Ee;
    },
    nadgrids: function(g) {
      g === "@null" ? i.datumCode = "none" : i.nadgrids = g;
    },
    axis: function(g) {
      var v = "ewnsud";
      g.length === 3 && v.indexOf(g.substr(0, 1)) !== -1 && v.indexOf(g.substr(1, 1)) !== -1 && v.indexOf(g.substr(2, 1)) !== -1 && (i.axis = g);
    },
    approx: function() {
      i.approx = !0;
    }
  };
  for (l in a)
    c = a[l], l in m ? (_ = m[l], typeof _ == "function" ? _(c) : i[_] = c) : i[l] = c;
  return typeof i.datumCode == "string" && i.datumCode !== "WGS84" && (i.datumCode = i.datumCode.toLowerCase()), i;
}
class xg {
  static getId(i) {
    const a = i.find((l) => Array.isArray(l) && l[0] === "ID");
    return a && a.length >= 3 ? {
      authority: a[1],
      code: parseInt(a[2], 10)
    } : null;
  }
  static convertUnit(i, a = "unit") {
    if (!i || i.length < 3)
      return { type: a, name: "unknown", conversion_factor: null };
    const l = i[1], c = parseFloat(i[2]) || null, _ = i.find((g) => Array.isArray(g) && g[0] === "ID"), m = _ ? {
      authority: _[1],
      code: parseInt(_[2], 10)
    } : null;
    return {
      type: a,
      name: l,
      conversion_factor: c,
      id: m
    };
  }
  static convertAxis(i) {
    const a = i[1] || "Unknown";
    let l;
    const c = a.match(/^\((.)\)$/);
    if (c) {
      const M = c[1].toUpperCase();
      if (M === "E") l = "east";
      else if (M === "N") l = "north";
      else if (M === "U") l = "up";
      else throw new Error(`Unknown axis abbreviation: ${M}`);
    } else
      l = i[2] ? i[2].toLowerCase() : "unknown";
    const _ = i.find((M) => Array.isArray(M) && M[0] === "ORDER"), m = _ ? parseInt(_[1], 10) : null, g = i.find(
      (M) => Array.isArray(M) && (M[0] === "LENGTHUNIT" || M[0] === "ANGLEUNIT" || M[0] === "SCALEUNIT")
    ), v = this.convertUnit(g);
    return {
      name: a,
      direction: l,
      // Use the valid PROJJSON direction value
      unit: v,
      order: m
    };
  }
  static extractAxes(i) {
    return i.filter((a) => Array.isArray(a) && a[0] === "AXIS").map((a) => this.convertAxis(a)).sort((a, l) => (a.order || 0) - (l.order || 0));
  }
  static convert(i, a = {}) {
    switch (i[0]) {
      case "PROJCRS":
        a.type = "ProjectedCRS", a.name = i[1], a.base_crs = i.find((k) => Array.isArray(k) && k[0] === "BASEGEOGCRS") ? this.convert(i.find((k) => Array.isArray(k) && k[0] === "BASEGEOGCRS")) : null, a.conversion = i.find((k) => Array.isArray(k) && k[0] === "CONVERSION") ? this.convert(i.find((k) => Array.isArray(k) && k[0] === "CONVERSION")) : null;
        const l = i.find((k) => Array.isArray(k) && k[0] === "CS");
        l && (a.coordinate_system = {
          type: l[1],
          axis: this.extractAxes(i)
        });
        const c = i.find((k) => Array.isArray(k) && k[0] === "LENGTHUNIT");
        if (c) {
          const k = this.convertUnit(c);
          a.coordinate_system.unit = k;
        }
        a.id = this.getId(i);
        break;
      case "BASEGEOGCRS":
      case "GEOGCRS":
        a.type = "GeographicCRS", a.name = i[1];
        const _ = i.find(
          (k) => Array.isArray(k) && (k[0] === "DATUM" || k[0] === "ENSEMBLE")
        );
        if (_) {
          const k = this.convert(_);
          _[0] === "ENSEMBLE" ? a.datum_ensemble = k : a.datum = k;
          const P = i.find((C) => Array.isArray(C) && C[0] === "PRIMEM");
          P && P[1] !== "Greenwich" && (k.prime_meridian = {
            name: P[1],
            longitude: parseFloat(P[2])
          });
        }
        a.coordinate_system = {
          type: "ellipsoidal",
          axis: this.extractAxes(i)
        }, a.id = this.getId(i);
        break;
      case "DATUM":
        a.type = "GeodeticReferenceFrame", a.name = i[1], a.ellipsoid = i.find((k) => Array.isArray(k) && k[0] === "ELLIPSOID") ? this.convert(i.find((k) => Array.isArray(k) && k[0] === "ELLIPSOID")) : null;
        break;
      case "ENSEMBLE":
        a.type = "DatumEnsemble", a.name = i[1], a.members = i.filter((k) => Array.isArray(k) && k[0] === "MEMBER").map((k) => ({
          type: "DatumEnsembleMember",
          name: k[1],
          id: this.getId(k)
          // Extract ID as { authority, code }
        }));
        const m = i.find((k) => Array.isArray(k) && k[0] === "ENSEMBLEACCURACY");
        m && (a.accuracy = parseFloat(m[1]));
        const g = i.find((k) => Array.isArray(k) && k[0] === "ELLIPSOID");
        g && (a.ellipsoid = this.convert(g)), a.id = this.getId(i);
        break;
      case "ELLIPSOID":
        a.type = "Ellipsoid", a.name = i[1], a.semi_major_axis = parseFloat(i[2]), a.inverse_flattening = parseFloat(i[3]), i.find((k) => Array.isArray(k) && k[0] === "LENGTHUNIT") && this.convert(i.find((k) => Array.isArray(k) && k[0] === "LENGTHUNIT"), a);
        break;
      case "CONVERSION":
        a.type = "Conversion", a.name = i[1], a.method = i.find((k) => Array.isArray(k) && k[0] === "METHOD") ? this.convert(i.find((k) => Array.isArray(k) && k[0] === "METHOD")) : null, a.parameters = i.filter((k) => Array.isArray(k) && k[0] === "PARAMETER").map((k) => this.convert(k));
        break;
      case "METHOD":
        a.type = "Method", a.name = i[1], a.id = this.getId(i);
        break;
      case "PARAMETER":
        a.type = "Parameter", a.name = i[1], a.value = parseFloat(i[2]), a.unit = this.convertUnit(
          i.find(
            (k) => Array.isArray(k) && (k[0] === "LENGTHUNIT" || k[0] === "ANGLEUNIT" || k[0] === "SCALEUNIT")
          )
        ), a.id = this.getId(i);
        break;
      case "BOUNDCRS":
        a.type = "BoundCRS";
        const v = i.find((k) => Array.isArray(k) && k[0] === "SOURCECRS");
        if (v) {
          const k = v.find((P) => Array.isArray(P));
          a.source_crs = k ? this.convert(k) : null;
        }
        const M = i.find((k) => Array.isArray(k) && k[0] === "TARGETCRS");
        if (M) {
          const k = M.find((P) => Array.isArray(P));
          a.target_crs = k ? this.convert(k) : null;
        }
        const w = i.find((k) => Array.isArray(k) && k[0] === "ABRIDGEDTRANSFORMATION");
        w ? a.transformation = this.convert(w) : a.transformation = null;
        break;
      case "ABRIDGEDTRANSFORMATION":
        if (a.type = "Transformation", a.name = i[1], a.method = i.find((k) => Array.isArray(k) && k[0] === "METHOD") ? this.convert(i.find((k) => Array.isArray(k) && k[0] === "METHOD")) : null, a.parameters = i.filter((k) => Array.isArray(k) && (k[0] === "PARAMETER" || k[0] === "PARAMETERFILE")).map((k) => {
          if (k[0] === "PARAMETER")
            return this.convert(k);
          if (k[0] === "PARAMETERFILE")
            return {
              name: k[1],
              value: k[2],
              id: {
                authority: "EPSG",
                code: 8656
              }
            };
        }), a.parameters.length === 7) {
          const k = a.parameters[6];
          k.name === "Scale difference" && (k.value = Math.round((k.value - 1) * 1e12) / 1e6);
        }
        a.id = this.getId(i);
        break;
      case "AXIS":
        a.coordinate_system || (a.coordinate_system = { type: "unspecified", axis: [] }), a.coordinate_system.axis.push(this.convertAxis(i));
        break;
      case "LENGTHUNIT":
        const E = this.convertUnit(i, "LinearUnit");
        a.coordinate_system && a.coordinate_system.axis && a.coordinate_system.axis.forEach((k) => {
          k.unit || (k.unit = E);
        }), E.conversion_factor && E.conversion_factor !== 1 && a.semi_major_axis && (a.semi_major_axis = {
          value: a.semi_major_axis,
          unit: E
        });
        break;
      default:
        a.keyword = i[0];
        break;
    }
    return a;
  }
}
class Tv extends xg {
  static convert(i, a = {}) {
    return super.convert(i, a), a.coordinate_system && a.coordinate_system.subtype === "Cartesian" && delete a.coordinate_system, a.usage && delete a.usage, a;
  }
}
class Av extends xg {
  static convert(i, a = {}) {
    super.convert(i, a);
    const l = i.find((_) => Array.isArray(_) && _[0] === "CS");
    l && (a.coordinate_system = {
      subtype: l[1],
      axis: this.extractAxes(i)
    });
    const c = i.find((_) => Array.isArray(_) && _[0] === "USAGE");
    if (c) {
      const _ = c.find((v) => Array.isArray(v) && v[0] === "SCOPE"), m = c.find((v) => Array.isArray(v) && v[0] === "AREA"), g = c.find((v) => Array.isArray(v) && v[0] === "BBOX");
      a.usage = {}, _ && (a.usage.scope = _[1]), m && (a.usage.area = m[1]), g && (a.usage.bbox = g.slice(1));
    }
    return a;
  }
}
function Rv(n) {
  return n.find((i) => Array.isArray(i) && i[0] === "USAGE") ? "2019" : (n.find((i) => Array.isArray(i) && i[0] === "CS") || n[0] === "BOUNDCRS" || n[0] === "PROJCRS" || n[0], "2015");
}
function Ov(n) {
  return (Rv(n) === "2019" ? Av : Tv).convert(n);
}
function Lv(n) {
  const i = n.toUpperCase();
  return i.includes("PROJCRS") || i.includes("GEOGCRS") || i.includes("BOUNDCRS") || i.includes("VERTCRS") || i.includes("LENGTHUNIT") || i.includes("ANGLEUNIT") || i.includes("SCALEUNIT") ? "WKT2" : (i.includes("PROJCS") || i.includes("GEOGCS") || i.includes("LOCAL_CS") || i.includes("VERT_CS") || i.includes("UNIT"), "WKT1");
}
var Na = 1, Eg = 2, Mg = 3, vo = 4, kg = 5, El = -1, Gv = /\s/, Dv = /[A-Za-z]/, Fv = /[A-Za-z84_]/, Ao = /[,\]]/, wg = /[\d\.E\-\+]/;
function ki(n) {
  if (typeof n != "string")
    throw new Error("not a string");
  this.text = n.trim(), this.level = 0, this.place = 0, this.root = null, this.stack = [], this.currentObject = null, this.state = Na;
}
ki.prototype.readCharicter = function() {
  var n = this.text[this.place++];
  if (this.state !== vo)
    for (; Gv.test(n); ) {
      if (this.place >= this.text.length)
        return;
      n = this.text[this.place++];
    }
  switch (this.state) {
    case Na:
      return this.neutral(n);
    case Eg:
      return this.keyword(n);
    case vo:
      return this.quoted(n);
    case kg:
      return this.afterquote(n);
    case Mg:
      return this.number(n);
    case El:
      return;
  }
};
ki.prototype.afterquote = function(n) {
  if (n === '"') {
    this.word += '"', this.state = vo;
    return;
  }
  if (Ao.test(n)) {
    this.word = this.word.trim(), this.afterItem(n);
    return;
  }
  throw new Error(`havn't handled "` + n + '" in afterquote yet, index ' + this.place);
};
ki.prototype.afterItem = function(n) {
  if (n === ",") {
    this.word !== null && this.currentObject.push(this.word), this.word = null, this.state = Na;
    return;
  }
  if (n === "]") {
    this.level--, this.word !== null && (this.currentObject.push(this.word), this.word = null), this.state = Na, this.currentObject = this.stack.pop(), this.currentObject || (this.state = El);
    return;
  }
};
ki.prototype.number = function(n) {
  if (wg.test(n)) {
    this.word += n;
    return;
  }
  if (Ao.test(n)) {
    this.word = parseFloat(this.word), this.afterItem(n);
    return;
  }
  throw new Error(`havn't handled "` + n + '" in number yet, index ' + this.place);
};
ki.prototype.quoted = function(n) {
  if (n === '"') {
    this.state = kg;
    return;
  }
  this.word += n;
};
ki.prototype.keyword = function(n) {
  if (Fv.test(n)) {
    this.word += n;
    return;
  }
  if (n === "[") {
    var i = [];
    i.push(this.word), this.level++, this.root === null ? this.root = i : this.currentObject.push(i), this.stack.push(this.currentObject), this.currentObject = i, this.state = Na;
    return;
  }
  if (Ao.test(n)) {
    this.afterItem(n);
    return;
  }
  throw new Error(`havn't handled "` + n + '" in keyword yet, index ' + this.place);
};
ki.prototype.neutral = function(n) {
  if (Dv.test(n)) {
    this.word = n, this.state = Eg;
    return;
  }
  if (n === '"') {
    this.word = "", this.state = vo;
    return;
  }
  if (wg.test(n)) {
    this.word = n, this.state = Mg;
    return;
  }
  if (Ao.test(n)) {
    this.afterItem(n);
    return;
  }
  throw new Error(`havn't handled "` + n + '" in neutral yet, index ' + this.place);
};
ki.prototype.output = function() {
  for (; this.place < this.text.length; )
    this.readCharicter();
  if (this.state === El)
    return this.root;
  throw new Error('unable to parse string "' + this.text + '". State is ' + this.state);
};
function qv(n) {
  var i = new ki(n);
  return i.output();
}
function Hh(n, i, a) {
  Array.isArray(i) && (a.unshift(i), i = null);
  var l = i ? {} : n, c = a.reduce(function(_, m) {
    return $r(m, _), _;
  }, l);
  i && (n[i] = c);
}
function $r(n, i) {
  if (!Array.isArray(n)) {
    i[n] = !0;
    return;
  }
  var a = n.shift();
  if (a === "PARAMETER" && (a = n.shift()), n.length === 1) {
    if (Array.isArray(n[0])) {
      i[a] = {}, $r(n[0], i[a]);
      return;
    }
    i[a] = n[0];
    return;
  }
  if (!n.length) {
    i[a] = !0;
    return;
  }
  if (a === "TOWGS84") {
    i[a] = n;
    return;
  }
  if (a === "AXIS") {
    a in i || (i[a] = []), i[a].push(n);
    return;
  }
  Array.isArray(a) || (i[a] = {});
  var l;
  switch (a) {
    case "UNIT":
    case "PRIMEM":
    case "VERT_DATUM":
      i[a] = {
        name: n[0].toLowerCase(),
        convert: n[1]
      }, n.length === 3 && $r(n[2], i[a]);
      return;
    case "SPHEROID":
    case "ELLIPSOID":
      i[a] = {
        name: n[0],
        a: n[1],
        rf: n[2]
      }, n.length === 4 && $r(n[3], i[a]);
      return;
    case "EDATUM":
    case "ENGINEERINGDATUM":
    case "LOCAL_DATUM":
    case "DATUM":
    case "VERT_CS":
    case "VERTCRS":
    case "VERTICALCRS":
      n[0] = ["name", n[0]], Hh(i, a, n);
      return;
    case "COMPD_CS":
    case "COMPOUNDCRS":
    case "FITTED_CS":
    // the followings are the crs defined in
    // https://github.com/proj4js/proj4js/blob/1da4ed0b865d0fcb51c136090569210cdcc9019e/lib/parseCode.js#L11
    case "PROJECTEDCRS":
    case "PROJCRS":
    case "GEOGCS":
    case "GEOCCS":
    case "PROJCS":
    case "LOCAL_CS":
    case "GEODCRS":
    case "GEODETICCRS":
    case "GEODETICDATUM":
    case "ENGCRS":
    case "ENGINEERINGCRS":
      n[0] = ["name", n[0]], Hh(i, a, n), i[a].type = a;
      return;
    default:
      for (l = -1; ++l < n.length; )
        if (!Array.isArray(n[l]))
          return $r(n, i[a]);
      return Hh(i, a, n);
  }
}
var Bv = 0.017453292519943295;
function Gn(n) {
  return n * Bv;
}
function Sg(n) {
  const i = (n.projName || "").toLowerCase().replace(/_/g, " ");
  !n.long0 && n.longc && (i === "albers conic equal area" || i === "lambert azimuthal equal area") && (n.long0 = n.longc), !n.lat_ts && n.lat1 && (i === "stereographic south pole" || i === "polar stereographic (variant b)") ? (n.lat0 = Gn(n.lat1 > 0 ? 90 : -90), n.lat_ts = n.lat1, delete n.lat1) : !n.lat_ts && n.lat0 && (i === "polar stereographic" || i === "polar stereographic (variant a)") && (n.lat_ts = n.lat0, n.lat0 = Gn(n.lat0 > 0 ? 90 : -90), delete n.lat1);
}
function wf(n) {
  let i = { units: null, to_meter: void 0 };
  return typeof n == "string" ? (i.units = n.toLowerCase(), i.units === "metre" && (i.units = "meter"), i.units === "meter" && (i.to_meter = 1)) : n && n.name && (i.units = n.name.toLowerCase(), i.units === "metre" && (i.units = "meter"), i.to_meter = n.conversion_factor), i;
}
function Sf(n) {
  return typeof n == "object" ? n.value * n.unit.conversion_factor : n;
}
function If(n, i) {
  n.ellipsoid.radius ? (i.a = n.ellipsoid.radius, i.rf = 0) : (i.a = Sf(n.ellipsoid.semi_major_axis), n.ellipsoid.inverse_flattening !== void 0 ? i.rf = n.ellipsoid.inverse_flattening : n.ellipsoid.semi_major_axis !== void 0 && n.ellipsoid.semi_minor_axis !== void 0 && (i.rf = i.a / (i.a - Sf(n.ellipsoid.semi_minor_axis))));
}
function xo(n, i = {}) {
  return !n || typeof n != "object" ? n : n.type === "BoundCRS" ? (xo(n.source_crs, i), n.transformation && (n.transformation.method && n.transformation.method.name === "NTv2" ? i.nadgrids = n.transformation.parameters[0].value : i.datum_params = n.transformation.parameters.map((a) => a.value)), i) : (Object.keys(n).forEach((a) => {
    const l = n[a];
    if (l !== null)
      switch (a) {
        case "name":
          if (i.srsCode)
            break;
          i.name = l, i.srsCode = l;
          break;
        case "type":
          l === "GeographicCRS" ? i.projName = "longlat" : l === "ProjectedCRS" && n.conversion && n.conversion.method && (i.projName = n.conversion.method.name);
          break;
        case "datum":
        case "datum_ensemble":
          l.ellipsoid && (i.ellps = l.ellipsoid.name, If(l, i)), l.prime_meridian && (i.from_greenwich = l.prime_meridian.longitude * Math.PI / 180);
          break;
        case "ellipsoid":
          i.ellps = l.name, If(l, i);
          break;
        case "prime_meridian":
          i.long0 = (l.longitude || 0) * Math.PI / 180;
          break;
        case "coordinate_system":
          if (l.axis) {
            if (i.axis = l.axis.map((c) => {
              const _ = c.direction;
              if (_ === "east") return "e";
              if (_ === "north") return "n";
              if (_ === "west") return "w";
              if (_ === "south") return "s";
              throw new Error(`Unknown axis direction: ${_}`);
            }).join("") + "u", l.unit) {
              const { units: c, to_meter: _ } = wf(l.unit);
              i.units = c, i.to_meter = _;
            } else if (l.axis[0] && l.axis[0].unit) {
              const { units: c, to_meter: _ } = wf(l.axis[0].unit);
              i.units = c, i.to_meter = _;
            }
          }
          break;
        case "id":
          l.authority && l.code && (i.title = l.authority + ":" + l.code);
          break;
        case "conversion":
          l.method && l.method.name && (i.projName = l.method.name), l.parameters && l.parameters.forEach((c) => {
            const _ = c.name.toLowerCase().replace(/\s+/g, "_"), m = c.value;
            c.unit && c.unit.conversion_factor ? i[_] = m * c.unit.conversion_factor : c.unit === "degree" ? i[_] = m * Math.PI / 180 : i[_] = m;
          });
          break;
        case "unit":
          l.name && (i.units = l.name.toLowerCase(), i.units === "metre" && (i.units = "meter")), l.conversion_factor && (i.to_meter = l.conversion_factor);
          break;
        case "base_crs":
          xo(l, i), i.datumCode = l.id ? l.id.authority + "_" + l.id.code : l.name;
          break;
      }
  }), i.latitude_of_false_origin !== void 0 && (i.lat0 = i.latitude_of_false_origin), i.longitude_of_false_origin !== void 0 && (i.long0 = i.longitude_of_false_origin), i.latitude_of_standard_parallel !== void 0 && (i.lat0 = i.latitude_of_standard_parallel, i.lat1 = i.latitude_of_standard_parallel), i.latitude_of_1st_standard_parallel !== void 0 && (i.lat1 = i.latitude_of_1st_standard_parallel), i.latitude_of_2nd_standard_parallel !== void 0 && (i.lat2 = i.latitude_of_2nd_standard_parallel), i.latitude_of_projection_centre !== void 0 && (i.lat0 = i.latitude_of_projection_centre), i.longitude_of_projection_centre !== void 0 && (i.longc = i.longitude_of_projection_centre), i.easting_at_false_origin !== void 0 && (i.x0 = i.easting_at_false_origin), i.northing_at_false_origin !== void 0 && (i.y0 = i.northing_at_false_origin), i.latitude_of_natural_origin !== void 0 && (i.lat0 = i.latitude_of_natural_origin), i.longitude_of_natural_origin !== void 0 && (i.long0 = i.longitude_of_natural_origin), i.longitude_of_origin !== void 0 && (i.long0 = i.longitude_of_origin), i.false_easting !== void 0 && (i.x0 = i.false_easting), i.easting_at_projection_centre && (i.x0 = i.easting_at_projection_centre), i.false_northing !== void 0 && (i.y0 = i.false_northing), i.northing_at_projection_centre && (i.y0 = i.northing_at_projection_centre), i.standard_parallel_1 !== void 0 && (i.lat1 = i.standard_parallel_1), i.standard_parallel_2 !== void 0 && (i.lat2 = i.standard_parallel_2), i.scale_factor_at_natural_origin !== void 0 && (i.k0 = i.scale_factor_at_natural_origin), i.scale_factor_at_projection_centre !== void 0 && (i.k0 = i.scale_factor_at_projection_centre), i.scale_factor_on_pseudo_standard_parallel !== void 0 && (i.k0 = i.scale_factor_on_pseudo_standard_parallel), i.azimuth !== void 0 && (i.alpha = i.azimuth), i.azimuth_at_projection_centre !== void 0 && (i.alpha = i.azimuth_at_projection_centre), i.angle_from_rectified_to_skew_grid && (i.rectified_grid_angle = i.angle_from_rectified_to_skew_grid), Sg(i), i);
}
var zv = [
  "PROJECTEDCRS",
  "PROJCRS",
  "GEOGCS",
  "GEOCCS",
  "PROJCS",
  "LOCAL_CS",
  "GEODCRS",
  "GEODETICCRS",
  "GEODETICDATUM",
  "ENGCRS",
  "ENGINEERINGCRS"
];
function jv(n, i) {
  var a = i[0], l = i[1];
  !(a in n) && l in n && (n[a] = n[l], i.length === 3 && (n[a] = i[2](n[a])));
}
function Ig(n) {
  for (var i = Object.keys(n), a = 0, l = i.length; a < l; ++a) {
    var c = i[a];
    zv.indexOf(c) !== -1 && Uv(n[c]), typeof n[c] == "object" && Ig(n[c]);
  }
}
function Uv(n) {
  if (n.AUTHORITY) {
    var i = Object.keys(n.AUTHORITY)[0];
    i && i in n.AUTHORITY && (n.title = i + ":" + n.AUTHORITY[i]);
  }
  if (n.type === "GEOGCS" ? n.projName = "longlat" : n.type === "LOCAL_CS" ? (n.projName = "identity", n.local = !0) : typeof n.PROJECTION == "object" ? n.projName = Object.keys(n.PROJECTION)[0] : n.projName = n.PROJECTION, n.AXIS) {
    for (var a = "", l = 0, c = n.AXIS.length; l < c; ++l) {
      var _ = [n.AXIS[l][0].toLowerCase(), n.AXIS[l][1].toLowerCase()];
      _[0].indexOf("north") !== -1 || (_[0] === "y" || _[0] === "lat") && _[1] === "north" ? a += "n" : _[0].indexOf("south") !== -1 || (_[0] === "y" || _[0] === "lat") && _[1] === "south" ? a += "s" : _[0].indexOf("east") !== -1 || (_[0] === "x" || _[0] === "lon") && _[1] === "east" ? a += "e" : (_[0].indexOf("west") !== -1 || (_[0] === "x" || _[0] === "lon") && _[1] === "west") && (a += "w");
    }
    a.length === 2 && (a += "u"), a.length === 3 && (n.axis = a);
  }
  n.UNIT && (n.units = n.UNIT.name.toLowerCase(), n.units === "metre" && (n.units = "meter"), n.UNIT.convert && (n.type === "GEOGCS" ? n.DATUM && n.DATUM.SPHEROID && (n.to_meter = n.UNIT.convert * n.DATUM.SPHEROID.a) : n.to_meter = n.UNIT.convert));
  var m = n.GEOGCS;
  n.type === "GEOGCS" && (m = n), m && (m.DATUM ? n.datumCode = m.DATUM.name.toLowerCase() : n.datumCode = m.name.toLowerCase(), n.datumCode.slice(0, 2) === "d_" && (n.datumCode = n.datumCode.slice(2)), n.datumCode === "new_zealand_1949" && (n.datumCode = "nzgd49"), (n.datumCode === "wgs_1984" || n.datumCode === "world_geodetic_system_1984") && (n.PROJECTION === "Mercator_Auxiliary_Sphere" && (n.sphere = !0), n.datumCode = "wgs84"), n.datumCode === "belge_1972" && (n.datumCode = "rnb72"), m.DATUM && m.DATUM.SPHEROID && (n.ellps = m.DATUM.SPHEROID.name.replace("_19", "").replace(/[Cc]larke\_18/, "clrk"), n.ellps.toLowerCase().slice(0, 13) === "international" && (n.ellps = "intl"), n.a = m.DATUM.SPHEROID.a, n.rf = parseFloat(m.DATUM.SPHEROID.rf, 10)), m.DATUM && m.DATUM.TOWGS84 && (n.datum_params = m.DATUM.TOWGS84), ~n.datumCode.indexOf("osgb_1936") && (n.datumCode = "osgb36"), ~n.datumCode.indexOf("osni_1952") && (n.datumCode = "osni52"), (~n.datumCode.indexOf("tm65") || ~n.datumCode.indexOf("geodetic_datum_of_1965")) && (n.datumCode = "ire65"), n.datumCode === "ch1903+" && (n.datumCode = "ch1903"), ~n.datumCode.indexOf("israel") && (n.datumCode = "isr93")), n.b && !isFinite(n.b) && (n.b = n.a), n.rectified_grid_angle && (n.rectified_grid_angle = Gn(n.rectified_grid_angle));
  function g(w) {
    var E = n.to_meter || 1;
    return w * E;
  }
  var v = function(w) {
    return jv(n, w);
  }, M = [
    ["standard_parallel_1", "Standard_Parallel_1"],
    ["standard_parallel_1", "Latitude of 1st standard parallel"],
    ["standard_parallel_2", "Standard_Parallel_2"],
    ["standard_parallel_2", "Latitude of 2nd standard parallel"],
    ["false_easting", "False_Easting"],
    ["false_easting", "False easting"],
    ["false-easting", "Easting at false origin"],
    ["false_northing", "False_Northing"],
    ["false_northing", "False northing"],
    ["false_northing", "Northing at false origin"],
    ["central_meridian", "Central_Meridian"],
    ["central_meridian", "Longitude of natural origin"],
    ["central_meridian", "Longitude of false origin"],
    ["latitude_of_origin", "Latitude_Of_Origin"],
    ["latitude_of_origin", "Central_Parallel"],
    ["latitude_of_origin", "Latitude of natural origin"],
    ["latitude_of_origin", "Latitude of false origin"],
    ["scale_factor", "Scale_Factor"],
    ["k0", "scale_factor"],
    ["latitude_of_center", "Latitude_Of_Center"],
    ["latitude_of_center", "Latitude_of_center"],
    ["lat0", "latitude_of_center", Gn],
    ["longitude_of_center", "Longitude_Of_Center"],
    ["longitude_of_center", "Longitude_of_center"],
    ["longc", "longitude_of_center", Gn],
    ["x0", "false_easting", g],
    ["y0", "false_northing", g],
    ["long0", "central_meridian", Gn],
    ["lat0", "latitude_of_origin", Gn],
    ["lat0", "standard_parallel_1", Gn],
    ["lat1", "standard_parallel_1", Gn],
    ["lat2", "standard_parallel_2", Gn],
    ["azimuth", "Azimuth"],
    ["alpha", "azimuth", Gn],
    ["srsCode", "name"]
  ];
  M.forEach(v), Sg(n);
}
function ul(n) {
  if (typeof n == "object")
    return xo(n);
  const i = Lv(n);
  var a = qv(n);
  if (i === "WKT2") {
    const _ = Ov(a);
    return xo(_);
  }
  var l = a[0], c = {};
  return $r(a, c), Ig(c), c[l];
}
function De(n) {
  var i = this;
  if (arguments.length === 2) {
    var a = arguments[1];
    typeof a == "string" ? a.charAt(0) === "+" ? De[
      /** @type {string} */
      n
    ] = al(arguments[1]) : De[
      /** @type {string} */
      n
    ] = ul(arguments[1]) : De[
      /** @type {string} */
      n
    ] = a;
  } else if (arguments.length === 1) {
    if (Array.isArray(n))
      return n.map(function(l) {
        return Array.isArray(l) ? De.apply(i, l) : De(l);
      });
    if (typeof n == "string") {
      if (n in De)
        return De[n];
    } else "EPSG" in n ? De["EPSG:" + n.EPSG] = n : "ESRI" in n ? De["ESRI:" + n.ESRI] = n : "IAU2000" in n ? De["IAU2000:" + n.IAU2000] = n : console.log(n);
    return;
  }
}
wv(De);
function Yv(n) {
  return typeof n == "string";
}
function Xv(n) {
  return n in De;
}
function Vv(n) {
  return n.indexOf("+") !== 0 && n.indexOf("[") !== -1 || typeof n == "object" && !("srsCode" in n);
}
var Wv = ["3857", "900913", "3785", "102113"];
function Hv(n) {
  var i = Bi(n, "authority");
  if (i) {
    var a = Bi(i, "epsg");
    return a && Wv.indexOf(a) > -1;
  }
}
function Kv(n) {
  var i = Bi(n, "extension");
  if (i)
    return Bi(i, "proj4");
}
function Zv(n) {
  return n[0] === "+";
}
function Qv(n) {
  if (Yv(n)) {
    if (Xv(n))
      return De[n];
    if (Vv(n)) {
      var i = ul(n);
      if (Hv(i))
        return De["EPSG:3857"];
      var a = Kv(i);
      return a ? al(a) : i;
    }
    if (Zv(n))
      return al(n);
  } else return "projName" in n ? n : ul(n);
}
function Nf(n, i) {
  n = n || {};
  var a, l;
  if (!i)
    return n;
  for (l in i)
    a = i[l], a !== void 0 && (n[l] = a);
  return n;
}
function Zn(n, i, a) {
  var l = n * i;
  return a / Math.sqrt(1 - l * l);
}
function Ra(n) {
  return n < 0 ? -1 : 1;
}
function ut(n) {
  return Math.abs(n) <= oe ? n : n - Ra(n) * Ia;
}
function Dn(n, i, a) {
  var l = n * a, c = 0.5 * n;
  return l = Math.pow((1 - l) / (1 + l), c), Math.tan(0.5 * (J - i)) / l;
}
function ba(n, i) {
  for (var a = 0.5 * n, l, c, _ = J - 2 * Math.atan(i), m = 0; m <= 15; m++)
    if (l = n * Math.sin(_), c = J - 2 * Math.atan(i * Math.pow((1 - l) / (1 + l), a)) - _, _ += c, Math.abs(c) <= 1e-10)
      return _;
  return -9999;
}
function Jv() {
  var n = this.b / this.a;
  this.es = 1 - n * n, "x0" in this || (this.x0 = 0), "y0" in this || (this.y0 = 0), this.e = Math.sqrt(this.es), this.lat_ts ? this.sphere ? this.k0 = Math.cos(this.lat_ts) : this.k0 = Zn(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)) : this.k0 || (this.k ? this.k0 = this.k : this.k0 = 1);
}
function $v(n) {
  var i = n.x, a = n.y;
  if (a * Wn > 90 && a * Wn < -90 && i * Wn > 180 && i * Wn < -180)
    return null;
  var l, c;
  if (Math.abs(Math.abs(a) - J) <= st)
    return null;
  if (this.sphere)
    l = this.x0 + this.a * this.k0 * ut(i - this.long0), c = this.y0 + this.a * this.k0 * Math.log(Math.tan(jt + 0.5 * a));
  else {
    var _ = Math.sin(a), m = Dn(this.e, a, _);
    l = this.x0 + this.a * this.k0 * ut(i - this.long0), c = this.y0 - this.a * this.k0 * Math.log(m);
  }
  return n.x = l, n.y = c, n;
}
function t1(n) {
  var i = n.x - this.x0, a = n.y - this.y0, l, c;
  if (this.sphere)
    c = J - 2 * Math.atan(Math.exp(-a / (this.a * this.k0)));
  else {
    var _ = Math.exp(-a / (this.a * this.k0));
    if (c = ba(this.e, _), c === -9999)
      return null;
  }
  return l = ut(this.long0 + i / (this.a * this.k0)), n.x = l, n.y = c, n;
}
var e1 = ["Mercator", "Popular Visualisation Pseudo Mercator", "Mercator_1SP", "Mercator_Auxiliary_Sphere", "Mercator_Variant_A", "merc"];
const n1 = {
  init: Jv,
  forward: $v,
  inverse: t1,
  names: e1
};
function i1() {
}
function bf(n) {
  return n;
}
var r1 = ["longlat", "identity"];
const s1 = {
  init: i1,
  forward: bf,
  inverse: bf,
  names: r1
};
var a1 = [n1, s1], Zr = {}, Ea = [];
function Ng(n, i) {
  var a = Ea.length;
  return n.names ? (Ea[a] = n, n.names.forEach(function(l) {
    Zr[l.toLowerCase()] = a;
  }), this) : (console.log(i), !0);
}
function bg(n) {
  return n.replace(/[-\(\)\s]+/g, " ").trim().replace(/ /g, "_");
}
function u1(n) {
  if (!n)
    return !1;
  var i = n.toLowerCase();
  if (typeof Zr[i] < "u" && Ea[Zr[i]] || (i = bg(i), i in Zr && Ea[Zr[i]]))
    return Ea[Zr[i]];
}
function o1() {
  a1.forEach(Ng);
}
const h1 = {
  start: o1,
  add: Ng,
  get: u1
};
var Cg = {
  MERIT: {
    a: 6378137,
    rf: 298.257,
    ellipseName: "MERIT 1983"
  },
  SGS85: {
    a: 6378136,
    rf: 298.257,
    ellipseName: "Soviet Geodetic System 85"
  },
  GRS80: {
    a: 6378137,
    rf: 298.257222101,
    ellipseName: "GRS 1980(IUGG, 1980)"
  },
  IAU76: {
    a: 6378140,
    rf: 298.257,
    ellipseName: "IAU 1976"
  },
  airy: {
    a: 6377563396e-3,
    b: 635625691e-2,
    ellipseName: "Airy 1830"
  },
  APL4: {
    a: 6378137,
    rf: 298.25,
    ellipseName: "Appl. Physics. 1965"
  },
  NWL9D: {
    a: 6378145,
    rf: 298.25,
    ellipseName: "Naval Weapons Lab., 1965"
  },
  mod_airy: {
    a: 6377340189e-3,
    b: 6356034446e-3,
    ellipseName: "Modified Airy"
  },
  andrae: {
    a: 637710443e-2,
    rf: 300,
    ellipseName: "Andrae 1876 (Den., Iclnd.)"
  },
  aust_SA: {
    a: 6378160,
    rf: 298.25,
    ellipseName: "Australian Natl & S. Amer. 1969"
  },
  GRS67: {
    a: 6378160,
    rf: 298.247167427,
    ellipseName: "GRS 67(IUGG 1967)"
  },
  bessel: {
    a: 6377397155e-3,
    rf: 299.1528128,
    ellipseName: "Bessel 1841"
  },
  bess_nam: {
    a: 6377483865e-3,
    rf: 299.1528128,
    ellipseName: "Bessel 1841 (Namibia)"
  },
  clrk66: {
    a: 63782064e-1,
    b: 63565838e-1,
    ellipseName: "Clarke 1866"
  },
  clrk80: {
    a: 6378249145e-3,
    rf: 293.4663,
    ellipseName: "Clarke 1880 mod."
  },
  clrk80ign: {
    a: 63782492e-1,
    b: 6356515,
    rf: 293.4660213,
    ellipseName: "Clarke 1880 (IGN)"
  },
  clrk58: {
    a: 6378293645208759e-9,
    rf: 294.2606763692654,
    ellipseName: "Clarke 1858"
  },
  CPM: {
    a: 63757387e-1,
    rf: 334.29,
    ellipseName: "Comm. des Poids et Mesures 1799"
  },
  delmbr: {
    a: 6376428,
    rf: 311.5,
    ellipseName: "Delambre 1810 (Belgium)"
  },
  engelis: {
    a: 637813605e-2,
    rf: 298.2566,
    ellipseName: "Engelis 1985"
  },
  evrst30: {
    a: 6377276345e-3,
    rf: 300.8017,
    ellipseName: "Everest 1830"
  },
  evrst48: {
    a: 6377304063e-3,
    rf: 300.8017,
    ellipseName: "Everest 1948"
  },
  evrst56: {
    a: 6377301243e-3,
    rf: 300.8017,
    ellipseName: "Everest 1956"
  },
  evrst69: {
    a: 6377295664e-3,
    rf: 300.8017,
    ellipseName: "Everest 1969"
  },
  evrstSS: {
    a: 6377298556e-3,
    rf: 300.8017,
    ellipseName: "Everest (Sabah & Sarawak)"
  },
  fschr60: {
    a: 6378166,
    rf: 298.3,
    ellipseName: "Fischer (Mercury Datum) 1960"
  },
  fschr60m: {
    a: 6378155,
    rf: 298.3,
    ellipseName: "Fischer 1960"
  },
  fschr68: {
    a: 6378150,
    rf: 298.3,
    ellipseName: "Fischer 1968"
  },
  helmert: {
    a: 6378200,
    rf: 298.3,
    ellipseName: "Helmert 1906"
  },
  hough: {
    a: 6378270,
    rf: 297,
    ellipseName: "Hough"
  },
  intl: {
    a: 6378388,
    rf: 297,
    ellipseName: "International 1909 (Hayford)"
  },
  kaula: {
    a: 6378163,
    rf: 298.24,
    ellipseName: "Kaula 1961"
  },
  lerch: {
    a: 6378139,
    rf: 298.257,
    ellipseName: "Lerch 1979"
  },
  mprts: {
    a: 6397300,
    rf: 191,
    ellipseName: "Maupertius 1738"
  },
  new_intl: {
    a: 63781575e-1,
    b: 63567722e-1,
    ellipseName: "New International 1967"
  },
  plessis: {
    a: 6376523,
    rf: 6355863,
    ellipseName: "Plessis 1817 (France)"
  },
  krass: {
    a: 6378245,
    rf: 298.3,
    ellipseName: "Krassovsky, 1942"
  },
  SEasia: {
    a: 6378155,
    b: 63567733205e-4,
    ellipseName: "Southeast Asia"
  },
  walbeck: {
    a: 6376896,
    b: 63558348467e-4,
    ellipseName: "Walbeck"
  },
  WGS60: {
    a: 6378165,
    rf: 298.3,
    ellipseName: "WGS 60"
  },
  WGS66: {
    a: 6378145,
    rf: 298.25,
    ellipseName: "WGS 66"
  },
  WGS7: {
    a: 6378135,
    rf: 298.26,
    ellipseName: "WGS 72"
  },
  WGS84: {
    a: 6378137,
    rf: 298.257223563,
    ellipseName: "WGS 84"
  },
  sphere: {
    a: 6370997,
    b: 6370997,
    ellipseName: "Normal Sphere (r=6370997)"
  }
};
const l1 = Cg.WGS84;
function c1(n, i, a, l) {
  var c = n * n, _ = i * i, m = (c - _) / c, g = 0;
  l ? (n *= 1 - m * (Nv + m * (bv + m * Cv)), c = n * n, m = 0) : g = Math.sqrt(m);
  var v = (c - _) / _;
  return {
    es: m,
    e: g,
    ep2: v
  };
}
function f1(n, i, a, l, c) {
  if (!n) {
    var _ = Bi(Cg, l);
    _ || (_ = l1), n = _.a, i = _.b, a = _.rf;
  }
  return a && !i && (i = (1 - 1 / a) * n), (a === 0 || Math.abs(n - i) < st) && (c = !0, i = n), {
    a: n,
    b: i,
    rf: a,
    sphere: c
  };
}
var co = {
  wgs84: {
    towgs84: "0,0,0",
    ellipse: "WGS84",
    datumName: "WGS84"
  },
  ch1903: {
    towgs84: "674.374,15.056,405.346",
    ellipse: "bessel",
    datumName: "swiss"
  },
  ggrs87: {
    towgs84: "-199.87,74.79,246.62",
    ellipse: "GRS80",
    datumName: "Greek_Geodetic_Reference_System_1987"
  },
  nad83: {
    towgs84: "0,0,0",
    ellipse: "GRS80",
    datumName: "North_American_Datum_1983"
  },
  nad27: {
    nadgrids: "@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat",
    ellipse: "clrk66",
    datumName: "North_American_Datum_1927"
  },
  potsdam: {
    towgs84: "598.1,73.7,418.2,0.202,0.045,-2.455,6.7",
    ellipse: "bessel",
    datumName: "Potsdam Rauenberg 1950 DHDN"
  },
  carthage: {
    towgs84: "-263.0,6.0,431.0",
    ellipse: "clark80",
    datumName: "Carthage 1934 Tunisia"
  },
  hermannskogel: {
    towgs84: "577.326,90.129,463.919,5.137,1.474,5.297,2.4232",
    ellipse: "bessel",
    datumName: "Hermannskogel"
  },
  mgi: {
    towgs84: "577.326,90.129,463.919,5.137,1.474,5.297,2.4232",
    ellipse: "bessel",
    datumName: "Militar-Geographische Institut"
  },
  osni52: {
    towgs84: "482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",
    ellipse: "airy",
    datumName: "Irish National"
  },
  ire65: {
    towgs84: "482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",
    ellipse: "mod_airy",
    datumName: "Ireland 1965"
  },
  rassadiran: {
    towgs84: "-133.63,-157.5,-158.62",
    ellipse: "intl",
    datumName: "Rassadiran"
  },
  nzgd49: {
    towgs84: "59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993",
    ellipse: "intl",
    datumName: "New Zealand Geodetic Datum 1949"
  },
  osgb36: {
    towgs84: "446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894",
    ellipse: "airy",
    datumName: "Ordnance Survey of Great Britain 1936"
  },
  s_jtsk: {
    towgs84: "589,76,480",
    ellipse: "bessel",
    datumName: "S-JTSK (Ferro)"
  },
  beduaram: {
    towgs84: "-106,-87,188",
    ellipse: "clrk80",
    datumName: "Beduaram"
  },
  gunung_segara: {
    towgs84: "-403,684,41",
    ellipse: "bessel",
    datumName: "Gunung Segara Jakarta"
  },
  rnb72: {
    towgs84: "106.869,-52.2978,103.724,-0.33657,0.456955,-1.84218,1",
    ellipse: "intl",
    datumName: "Reseau National Belge 1972"
  },
  EPSG_5451: {
    towgs84: "6.41,-49.05,-11.28,1.5657,0.5242,6.9718,-5.7649"
  },
  IGNF_LURESG: {
    towgs84: "-192.986,13.673,-39.309,-0.4099,-2.9332,2.6881,0.43"
  },
  EPSG_4614: {
    towgs84: "-119.4248,-303.65872,-11.00061,1.164298,0.174458,1.096259,3.657065"
  },
  EPSG_4615: {
    towgs84: "-494.088,-312.129,279.877,-1.423,-1.013,1.59,-0.748"
  },
  ESRI_37241: {
    towgs84: "-76.822,257.457,-12.817,2.136,-0.033,-2.392,-0.031"
  },
  ESRI_37249: {
    towgs84: "-440.296,58.548,296.265,1.128,10.202,4.559,-0.438"
  },
  ESRI_37245: {
    towgs84: "-511.151,-181.269,139.609,1.05,2.703,1.798,3.071"
  },
  EPSG_4178: {
    towgs84: "24.9,-126.4,-93.2,-0.063,-0.247,-0.041,1.01"
  },
  EPSG_4622: {
    towgs84: "-472.29,-5.63,-304.12,0.4362,-0.8374,0.2563,1.8984"
  },
  EPSG_4625: {
    towgs84: "126.93,547.94,130.41,-2.7867,5.1612,-0.8584,13.8227"
  },
  EPSG_5252: {
    towgs84: "0.023,0.036,-0.068,0.00176,0.00912,-0.01136,0.00439"
  },
  EPSG_4314: {
    towgs84: "597.1,71.4,412.1,0.894,0.068,-1.563,7.58"
  },
  EPSG_4282: {
    towgs84: "-178.3,-316.7,-131.5,5.278,6.077,10.979,19.166"
  },
  EPSG_4231: {
    towgs84: "-83.11,-97.38,-117.22,0.0276,-0.2167,0.2147,0.1218"
  },
  EPSG_4274: {
    towgs84: "-230.994,102.591,25.199,0.633,-0.239,0.9,1.95"
  },
  EPSG_4134: {
    towgs84: "-180.624,-225.516,173.919,-0.81,-1.898,8.336,16.71006"
  },
  EPSG_4254: {
    towgs84: "18.38,192.45,96.82,0.056,-0.142,-0.2,-0.0013"
  },
  EPSG_4159: {
    towgs84: "-194.513,-63.978,-25.759,-3.4027,3.756,-3.352,-0.9175"
  },
  EPSG_4687: {
    towgs84: "0.072,-0.507,-0.245,0.0183,-0.0003,0.007,-0.0093"
  },
  EPSG_4227: {
    towgs84: "-83.58,-397.54,458.78,-17.595,-2.847,4.256,3.225"
  },
  EPSG_4746: {
    towgs84: "599.4,72.4,419.2,-0.062,-0.022,-2.723,6.46"
  },
  EPSG_4745: {
    towgs84: "612.4,77,440.2,-0.054,0.057,-2.797,2.55"
  },
  EPSG_6311: {
    towgs84: "8.846,-4.394,-1.122,-0.00237,-0.146528,0.130428,0.783926"
  },
  EPSG_4289: {
    towgs84: "565.7381,50.4018,465.2904,-1.91514,1.60363,-9.09546,4.07244"
  },
  EPSG_4230: {
    towgs84: "-68.863,-134.888,-111.49,-0.53,-0.14,0.57,-3.4"
  },
  EPSG_4154: {
    towgs84: "-123.02,-158.95,-168.47"
  },
  EPSG_4156: {
    towgs84: "570.8,85.7,462.8,4.998,1.587,5.261,3.56"
  },
  EPSG_4299: {
    towgs84: "482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15"
  },
  EPSG_4179: {
    towgs84: "33.4,-146.6,-76.3,-0.359,-0.053,0.844,-0.84"
  },
  EPSG_4313: {
    towgs84: "-106.8686,52.2978,-103.7239,0.3366,-0.457,1.8422,-1.2747"
  },
  EPSG_4194: {
    towgs84: "163.511,127.533,-159.789"
  },
  EPSG_4195: {
    towgs84: "105,326,-102.5"
  },
  EPSG_4196: {
    towgs84: "-45,417,-3.5"
  },
  EPSG_4611: {
    towgs84: "-162.619,-276.959,-161.764,0.067753,-2.243649,-1.158827,-1.094246"
  },
  EPSG_4633: {
    towgs84: "137.092,131.66,91.475,-1.9436,-11.5993,-4.3321,-7.4824"
  },
  EPSG_4641: {
    towgs84: "-408.809,366.856,-412.987,1.8842,-0.5308,2.1655,-121.0993"
  },
  EPSG_4643: {
    towgs84: "-480.26,-438.32,-643.429,16.3119,20.1721,-4.0349,-111.7002"
  },
  EPSG_4300: {
    towgs84: "482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15"
  },
  EPSG_4188: {
    towgs84: "482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15"
  },
  EPSG_4660: {
    towgs84: "982.6087,552.753,-540.873,32.39344,-153.25684,-96.2266,16.805"
  },
  EPSG_4662: {
    towgs84: "97.295,-263.247,310.882,-1.5999,0.8386,3.1409,13.3259"
  },
  EPSG_3906: {
    towgs84: "577.88891,165.22205,391.18289,4.9145,-0.94729,-13.05098,7.78664"
  },
  EPSG_4307: {
    towgs84: "-209.3622,-87.8162,404.6198,0.0046,3.4784,0.5805,-1.4547"
  },
  EPSG_6892: {
    towgs84: "-76.269,-16.683,68.562,-6.275,10.536,-4.286,-13.686"
  },
  EPSG_4690: {
    towgs84: "221.597,152.441,176.523,2.403,1.3893,0.884,11.4648"
  },
  EPSG_4691: {
    towgs84: "218.769,150.75,176.75,3.5231,2.0037,1.288,10.9817"
  },
  EPSG_4629: {
    towgs84: "72.51,345.411,79.241,-1.5862,-0.8826,-0.5495,1.3653"
  },
  EPSG_4630: {
    towgs84: "165.804,216.213,180.26,-0.6251,-0.4515,-0.0721,7.4111"
  },
  EPSG_4692: {
    towgs84: "217.109,86.452,23.711,0.0183,-0.0003,0.007,-0.0093"
  },
  EPSG_9333: {
    towgs84: "0,0,0,-8.393,0.749,-10.276,0"
  },
  EPSG_9059: {
    towgs84: "0,0,0"
  },
  EPSG_4312: {
    towgs84: "601.705,84.263,485.227,4.7354,1.3145,5.393,-2.3887"
  },
  EPSG_4123: {
    towgs84: "-96.062,-82.428,-121.753,4.801,0.345,-1.376,1.496"
  },
  EPSG_4309: {
    towgs84: "-124.45,183.74,44.64,-0.4384,0.5446,-0.9706,-2.1365"
  },
  ESRI_104106: {
    towgs84: "-283.088,-70.693,117.445,-1.157,0.059,-0.652,-4.058"
  },
  EPSG_4281: {
    towgs84: "-219.247,-73.802,269.529"
  },
  EPSG_4322: {
    towgs84: "0,0,4.5"
  },
  EPSG_4324: {
    towgs84: "0,0,1.9"
  },
  EPSG_4284: {
    towgs84: "43.822,-108.842,-119.585,1.455,-0.761,0.737,0.549"
  },
  EPSG_4277: {
    towgs84: "446.448,-125.157,542.06,0.15,0.247,0.842,-20.489"
  },
  EPSG_4207: {
    towgs84: "-282.1,-72.2,120,-1.529,0.145,-0.89,-4.46"
  },
  EPSG_4688: {
    towgs84: "347.175,1077.618,2623.677,33.9058,-70.6776,9.4013,186.0647"
  },
  EPSG_4689: {
    towgs84: "410.793,54.542,80.501,-2.5596,-2.3517,-0.6594,17.3218"
  },
  EPSG_4720: {
    towgs84: "0,0,4.5"
  },
  EPSG_4273: {
    towgs84: "278.3,93,474.5,7.889,0.05,-6.61,6.21"
  },
  EPSG_4240: {
    towgs84: "204.64,834.74,293.8"
  },
  EPSG_4817: {
    towgs84: "278.3,93,474.5,7.889,0.05,-6.61,6.21"
  },
  ESRI_104131: {
    towgs84: "426.62,142.62,460.09,4.98,4.49,-12.42,-17.1"
  },
  EPSG_4265: {
    towgs84: "-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68"
  },
  EPSG_4263: {
    towgs84: "-111.92,-87.85,114.5,1.875,0.202,0.219,0.032"
  },
  EPSG_4298: {
    towgs84: "-689.5937,623.84046,-65.93566,-0.02331,1.17094,-0.80054,5.88536"
  },
  EPSG_4270: {
    towgs84: "-253.4392,-148.452,386.5267,0.15605,0.43,-0.1013,-0.0424"
  },
  EPSG_4229: {
    towgs84: "-121.8,98.1,-10.7"
  },
  EPSG_4220: {
    towgs84: "-55.5,-348,-229.2"
  },
  EPSG_4214: {
    towgs84: "12.646,-155.176,-80.863"
  },
  EPSG_4232: {
    towgs84: "-345,3,223"
  },
  EPSG_4238: {
    towgs84: "-1.977,-13.06,-9.993,0.364,0.254,0.689,-1.037"
  },
  EPSG_4168: {
    towgs84: "-170,33,326"
  },
  EPSG_4131: {
    towgs84: "199,931,318.9"
  },
  EPSG_4152: {
    towgs84: "-0.9102,2.0141,0.5602,0.029039,0.010065,0.010101,0"
  },
  EPSG_5228: {
    towgs84: "572.213,85.334,461.94,4.9732,1.529,5.2484,3.5378"
  },
  EPSG_8351: {
    towgs84: "485.021,169.465,483.839,7.786342,4.397554,4.102655,0"
  },
  EPSG_4683: {
    towgs84: "-127.62,-67.24,-47.04,-3.068,4.903,1.578,-1.06"
  },
  EPSG_4133: {
    towgs84: "0,0,0"
  },
  EPSG_7373: {
    towgs84: "0.819,-0.5762,-1.6446,-0.00378,-0.03317,0.00318,0.0693"
  },
  EPSG_9075: {
    towgs84: "-0.9102,2.0141,0.5602,0.029039,0.010065,0.010101,0"
  },
  EPSG_9072: {
    towgs84: "-0.9102,2.0141,0.5602,0.029039,0.010065,0.010101,0"
  },
  EPSG_9294: {
    towgs84: "1.16835,-1.42001,-2.24431,-0.00822,-0.05508,0.01818,0.23388"
  },
  EPSG_4212: {
    towgs84: "-267.434,173.496,181.814,-13.4704,8.7154,7.3926,14.7492"
  },
  EPSG_4191: {
    towgs84: "-44.183,-0.58,-38.489,2.3867,2.7072,-3.5196,-8.2703"
  },
  EPSG_4237: {
    towgs84: "52.684,-71.194,-13.975,-0.312,-0.1063,-0.3729,1.0191"
  },
  EPSG_4740: {
    towgs84: "-1.08,-0.27,-0.9"
  },
  EPSG_4124: {
    towgs84: "419.3836,99.3335,591.3451,0.850389,1.817277,-7.862238,-0.99496"
  },
  EPSG_5681: {
    towgs84: "584.9636,107.7175,413.8067,1.1155,0.2824,-3.1384,7.9922"
  },
  EPSG_4141: {
    towgs84: "23.772,17.49,17.859,-0.3132,-1.85274,1.67299,-5.4262"
  },
  EPSG_4204: {
    towgs84: "-85.645,-273.077,-79.708,2.289,-1.421,2.532,3.194"
  },
  EPSG_4319: {
    towgs84: "226.702,-193.337,-35.371,-2.229,-4.391,9.238,0.9798"
  },
  EPSG_4200: {
    towgs84: "24.82,-131.21,-82.66"
  },
  EPSG_4130: {
    towgs84: "0,0,0"
  },
  EPSG_4127: {
    towgs84: "-82.875,-57.097,-156.768,-2.158,1.524,-0.982,-0.359"
  },
  EPSG_4149: {
    towgs84: "674.374,15.056,405.346"
  },
  EPSG_4617: {
    towgs84: "-0.991,1.9072,0.5129,1.25033e-7,4.6785e-8,5.6529e-8,0"
  },
  EPSG_4663: {
    towgs84: "-210.502,-66.902,-48.476,2.094,-15.067,-5.817,0.485"
  },
  EPSG_4664: {
    towgs84: "-211.939,137.626,58.3,-0.089,0.251,0.079,0.384"
  },
  EPSG_4665: {
    towgs84: "-105.854,165.589,-38.312,-0.003,-0.026,0.024,-0.048"
  },
  EPSG_4666: {
    towgs84: "631.392,-66.551,481.442,1.09,-4.445,-4.487,-4.43"
  },
  EPSG_4756: {
    towgs84: "-192.873,-39.382,-111.202,-0.00205,-0.0005,0.00335,0.0188"
  },
  EPSG_4723: {
    towgs84: "-179.483,-69.379,-27.584,-7.862,8.163,6.042,-13.925"
  },
  EPSG_4726: {
    towgs84: "8.853,-52.644,180.304,-0.393,-2.323,2.96,-24.081"
  },
  EPSG_4267: {
    towgs84: "-8.0,160.0,176.0"
  },
  EPSG_5365: {
    towgs84: "-0.16959,0.35312,0.51846,0.03385,-0.16325,0.03446,0.03693"
  },
  EPSG_4218: {
    towgs84: "304.5,306.5,-318.1"
  },
  EPSG_4242: {
    towgs84: "-33.722,153.789,94.959,-8.581,-4.478,4.54,8.95"
  },
  EPSG_4216: {
    towgs84: "-292.295,248.758,429.447,4.9971,2.99,6.6906,1.0289"
  },
  ESRI_104105: {
    towgs84: "631.392,-66.551,481.442,1.09,-4.445,-4.487,-4.43"
  },
  ESRI_104129: {
    towgs84: "0,0,0"
  },
  EPSG_4673: {
    towgs84: "174.05,-25.49,112.57"
  },
  EPSG_4202: {
    towgs84: "-124,-60,154"
  },
  EPSG_4203: {
    towgs84: "-117.763,-51.51,139.061,0.292,0.443,0.277,-0.191"
  },
  EPSG_3819: {
    towgs84: "595.48,121.69,515.35,4.115,-2.9383,0.853,-3.408"
  },
  EPSG_8694: {
    towgs84: "-93.799,-132.737,-219.073,-1.844,0.648,-6.37,-0.169"
  },
  EPSG_4145: {
    towgs84: "275.57,676.78,229.6"
  },
  EPSG_4283: {
    towgs84: "61.55,-10.87,-40.19,39.4924,32.7221,32.8979,-9.994"
  },
  EPSG_4317: {
    towgs84: "2.3287,-147.0425,-92.0802,-0.3092483,0.32482185,0.49729934,5.68906266"
  },
  EPSG_4272: {
    towgs84: "59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993"
  },
  EPSG_4248: {
    towgs84: "-307.7,265.3,-363.5"
  },
  EPSG_5561: {
    towgs84: "24,-121,-76"
  },
  EPSG_5233: {
    towgs84: "-0.293,766.95,87.713,0.195704,1.695068,3.473016,-0.039338"
  },
  ESRI_104130: {
    towgs84: "-86,-98,-119"
  },
  ESRI_104102: {
    towgs84: "682,-203,480"
  },
  ESRI_37207: {
    towgs84: "7,-10,-26"
  },
  EPSG_4675: {
    towgs84: "59.935,118.4,-10.871"
  },
  ESRI_104109: {
    towgs84: "-89.121,-348.182,260.871"
  },
  ESRI_104112: {
    towgs84: "-185.583,-230.096,281.361"
  },
  ESRI_104113: {
    towgs84: "25.1,-275.6,222.6"
  },
  IGNF_WGS72G: {
    towgs84: "0,12,6"
  },
  IGNF_NTFG: {
    towgs84: "-168,-60,320"
  },
  IGNF_EFATE57G: {
    towgs84: "-127,-769,472"
  },
  IGNF_PGP50G: {
    towgs84: "324.8,153.6,172.1"
  },
  IGNF_REUN47G: {
    towgs84: "94,-948,-1262"
  },
  IGNF_CSG67G: {
    towgs84: "-186,230,110"
  },
  IGNF_GUAD48G: {
    towgs84: "-467,-16,-300"
  },
  IGNF_TAHI51G: {
    towgs84: "162,117,154"
  },
  IGNF_TAHAAG: {
    towgs84: "65,342,77"
  },
  IGNF_NUKU72G: {
    towgs84: "84,274,65"
  },
  IGNF_PETRELS72G: {
    towgs84: "365,194,166"
  },
  IGNF_WALL78G: {
    towgs84: "253,-133,-127"
  },
  IGNF_MAYO50G: {
    towgs84: "-382,-59,-262"
  },
  IGNF_TANNAG: {
    towgs84: "-139,-967,436"
  },
  IGNF_IGN72G: {
    towgs84: "-13,-348,292"
  },
  IGNF_ATIGG: {
    towgs84: "1118,23,66"
  },
  IGNF_FANGA84G: {
    towgs84: "150.57,158.33,118.32"
  },
  IGNF_RUSAT84G: {
    towgs84: "202.13,174.6,-15.74"
  },
  IGNF_KAUE70G: {
    towgs84: "126.74,300.1,-75.49"
  },
  IGNF_MOP90G: {
    towgs84: "-10.8,-1.8,12.77"
  },
  IGNF_MHPF67G: {
    towgs84: "338.08,212.58,-296.17"
  },
  IGNF_TAHI79G: {
    towgs84: "160.61,116.05,153.69"
  },
  IGNF_ANAA92G: {
    towgs84: "1.5,3.84,4.81"
  },
  IGNF_MARQUI72G: {
    towgs84: "330.91,-13.92,58.56"
  },
  IGNF_APAT86G: {
    towgs84: "143.6,197.82,74.05"
  },
  IGNF_TUBU69G: {
    towgs84: "237.17,171.61,-77.84"
  },
  IGNF_STPM50G: {
    towgs84: "11.363,424.148,373.13"
  },
  EPSG_4150: {
    towgs84: "674.374,15.056,405.346"
  },
  EPSG_4754: {
    towgs84: "-208.4058,-109.8777,-2.5764"
  },
  ESRI_104101: {
    towgs84: "374,150,588"
  },
  EPSG_4693: {
    towgs84: "0,-0.15,0.68"
  },
  EPSG_6207: {
    towgs84: "293.17,726.18,245.36"
  },
  EPSG_4153: {
    towgs84: "-133.63,-157.5,-158.62"
  },
  EPSG_4132: {
    towgs84: "-241.54,-163.64,396.06"
  },
  EPSG_4221: {
    towgs84: "-154.5,150.7,100.4"
  },
  EPSG_4266: {
    towgs84: "-80.7,-132.5,41.1"
  },
  EPSG_4193: {
    towgs84: "-70.9,-151.8,-41.4"
  },
  EPSG_5340: {
    towgs84: "-0.41,0.46,-0.35"
  },
  EPSG_4246: {
    towgs84: "-294.7,-200.1,525.5"
  },
  EPSG_4318: {
    towgs84: "-3.2,-5.7,2.8"
  },
  EPSG_4121: {
    towgs84: "-199.87,74.79,246.62"
  },
  EPSG_4223: {
    towgs84: "-260.1,5.5,432.2"
  },
  EPSG_4158: {
    towgs84: "-0.465,372.095,171.736"
  },
  EPSG_4285: {
    towgs84: "-128.16,-282.42,21.93"
  },
  EPSG_4613: {
    towgs84: "-404.78,685.68,45.47"
  },
  EPSG_4607: {
    towgs84: "195.671,332.517,274.607"
  },
  EPSG_4475: {
    towgs84: "-381.788,-57.501,-256.673"
  },
  EPSG_4208: {
    towgs84: "-157.84,308.54,-146.6"
  },
  EPSG_4743: {
    towgs84: "70.995,-335.916,262.898"
  },
  EPSG_4710: {
    towgs84: "-323.65,551.39,-491.22"
  },
  EPSG_7881: {
    towgs84: "-0.077,0.079,0.086"
  },
  EPSG_4682: {
    towgs84: "283.729,735.942,261.143"
  },
  EPSG_4739: {
    towgs84: "-156,-271,-189"
  },
  EPSG_4679: {
    towgs84: "-80.01,253.26,291.19"
  },
  EPSG_4750: {
    towgs84: "-56.263,16.136,-22.856"
  },
  EPSG_4644: {
    towgs84: "-10.18,-350.43,291.37"
  },
  EPSG_4695: {
    towgs84: "-103.746,-9.614,-255.95"
  },
  EPSG_4292: {
    towgs84: "-355,21,72"
  },
  EPSG_4302: {
    towgs84: "-61.702,284.488,472.052"
  },
  EPSG_4143: {
    towgs84: "-124.76,53,466.79"
  },
  EPSG_4606: {
    towgs84: "-153,153,307"
  },
  EPSG_4699: {
    towgs84: "-770.1,158.4,-498.2"
  },
  EPSG_4247: {
    towgs84: "-273.5,110.6,-357.9"
  },
  EPSG_4160: {
    towgs84: "8.88,184.86,106.69"
  },
  EPSG_4161: {
    towgs84: "-233.43,6.65,173.64"
  },
  EPSG_9251: {
    towgs84: "-9.5,122.9,138.2"
  },
  EPSG_9253: {
    towgs84: "-78.1,101.6,133.3"
  },
  EPSG_4297: {
    towgs84: "-198.383,-240.517,-107.909"
  },
  EPSG_4269: {
    towgs84: "0,0,0"
  },
  EPSG_4301: {
    towgs84: "-147,506,687"
  },
  EPSG_4618: {
    towgs84: "-59,-11,-52"
  },
  EPSG_4612: {
    towgs84: "0,0,0"
  },
  EPSG_4678: {
    towgs84: "44.585,-131.212,-39.544"
  },
  EPSG_4250: {
    towgs84: "-130,29,364"
  },
  EPSG_4144: {
    towgs84: "214,804,268"
  },
  EPSG_4147: {
    towgs84: "-17.51,-108.32,-62.39"
  },
  EPSG_4259: {
    towgs84: "-254.1,-5.36,-100.29"
  },
  EPSG_4164: {
    towgs84: "-76,-138,67"
  },
  EPSG_4211: {
    towgs84: "-378.873,676.002,-46.255"
  },
  EPSG_4182: {
    towgs84: "-422.651,-172.995,84.02"
  },
  EPSG_4224: {
    towgs84: "-143.87,243.37,-33.52"
  },
  EPSG_4225: {
    towgs84: "-205.57,168.77,-4.12"
  },
  EPSG_5527: {
    towgs84: "-67.35,3.88,-38.22"
  },
  EPSG_4752: {
    towgs84: "98,390,-22"
  },
  EPSG_4310: {
    towgs84: "-30,190,89"
  },
  EPSG_9248: {
    towgs84: "-192.26,65.72,132.08"
  },
  EPSG_4680: {
    towgs84: "124.5,-63.5,-281"
  },
  EPSG_4701: {
    towgs84: "-79.9,-158,-168.9"
  },
  EPSG_4706: {
    towgs84: "-146.21,112.63,4.05"
  },
  EPSG_4805: {
    towgs84: "682,-203,480"
  },
  EPSG_4201: {
    towgs84: "-165,-11,206"
  },
  EPSG_4210: {
    towgs84: "-157,-2,-299"
  },
  EPSG_4183: {
    towgs84: "-104,167,-38"
  },
  EPSG_4139: {
    towgs84: "11,72,-101"
  },
  EPSG_4668: {
    towgs84: "-86,-98,-119"
  },
  EPSG_4717: {
    towgs84: "-2,151,181"
  },
  EPSG_4732: {
    towgs84: "102,52,-38"
  },
  EPSG_4280: {
    towgs84: "-377,681,-50"
  },
  EPSG_4209: {
    towgs84: "-138,-105,-289"
  },
  EPSG_4261: {
    towgs84: "31,146,47"
  },
  EPSG_4658: {
    towgs84: "-73,46,-86"
  },
  EPSG_4721: {
    towgs84: "265.025,384.929,-194.046"
  },
  EPSG_4222: {
    towgs84: "-136,-108,-292"
  },
  EPSG_4601: {
    towgs84: "-255,-15,71"
  },
  EPSG_4602: {
    towgs84: "725,685,536"
  },
  EPSG_4603: {
    towgs84: "72,213.7,93"
  },
  EPSG_4605: {
    towgs84: "9,183,236"
  },
  EPSG_4621: {
    towgs84: "137,248,-430"
  },
  EPSG_4657: {
    towgs84: "-28,199,5"
  },
  EPSG_4316: {
    towgs84: "103.25,-100.4,-307.19"
  },
  EPSG_4642: {
    towgs84: "-13,-348,292"
  },
  EPSG_4698: {
    towgs84: "145,-187,103"
  },
  EPSG_4192: {
    towgs84: "-206.1,-174.7,-87.7"
  },
  EPSG_4311: {
    towgs84: "-265,120,-358"
  },
  EPSG_4135: {
    towgs84: "58,-283,-182"
  },
  ESRI_104138: {
    towgs84: "198,-226,-347"
  },
  EPSG_4245: {
    towgs84: "-11,851,5"
  },
  EPSG_4142: {
    towgs84: "-125,53,467"
  },
  EPSG_4213: {
    towgs84: "-106,-87,188"
  },
  EPSG_4253: {
    towgs84: "-133,-77,-51"
  },
  EPSG_4129: {
    towgs84: "-132,-110,-335"
  },
  EPSG_4713: {
    towgs84: "-77,-128,142"
  },
  EPSG_4239: {
    towgs84: "217,823,299"
  },
  EPSG_4146: {
    towgs84: "295,736,257"
  },
  EPSG_4155: {
    towgs84: "-83,37,124"
  },
  EPSG_4165: {
    towgs84: "-173,253,27"
  },
  EPSG_4672: {
    towgs84: "175,-38,113"
  },
  EPSG_4236: {
    towgs84: "-637,-549,-203"
  },
  EPSG_4251: {
    towgs84: "-90,40,88"
  },
  EPSG_4271: {
    towgs84: "-2,374,172"
  },
  EPSG_4175: {
    towgs84: "-88,4,101"
  },
  EPSG_4716: {
    towgs84: "298,-304,-375"
  },
  EPSG_4315: {
    towgs84: "-23,259,-9"
  },
  EPSG_4744: {
    towgs84: "-242.2,-144.9,370.3"
  },
  EPSG_4244: {
    towgs84: "-97,787,86"
  },
  EPSG_4293: {
    towgs84: "616,97,-251"
  },
  EPSG_4714: {
    towgs84: "-127,-769,472"
  },
  EPSG_4736: {
    towgs84: "260,12,-147"
  },
  EPSG_6883: {
    towgs84: "-235,-110,393"
  },
  EPSG_6894: {
    towgs84: "-63,176,185"
  },
  EPSG_4205: {
    towgs84: "-43,-163,45"
  },
  EPSG_4256: {
    towgs84: "41,-220,-134"
  },
  EPSG_4262: {
    towgs84: "639,405,60"
  },
  EPSG_4604: {
    towgs84: "174,359,365"
  },
  EPSG_4169: {
    towgs84: "-115,118,426"
  },
  EPSG_4620: {
    towgs84: "-106,-129,165"
  },
  EPSG_4184: {
    towgs84: "-203,141,53"
  },
  EPSG_4616: {
    towgs84: "-289,-124,60"
  },
  EPSG_9403: {
    towgs84: "-307,-92,127"
  },
  EPSG_4684: {
    towgs84: "-133,-321,50"
  },
  EPSG_4708: {
    towgs84: "-491,-22,435"
  },
  EPSG_4707: {
    towgs84: "114,-116,-333"
  },
  EPSG_4709: {
    towgs84: "145,75,-272"
  },
  EPSG_4712: {
    towgs84: "-205,107,53"
  },
  EPSG_4711: {
    towgs84: "124,-234,-25"
  },
  EPSG_4718: {
    towgs84: "230,-199,-752"
  },
  EPSG_4719: {
    towgs84: "211,147,111"
  },
  EPSG_4724: {
    towgs84: "208,-435,-229"
  },
  EPSG_4725: {
    towgs84: "189,-79,-202"
  },
  EPSG_4735: {
    towgs84: "647,1777,-1124"
  },
  EPSG_4722: {
    towgs84: "-794,119,-298"
  },
  EPSG_4728: {
    towgs84: "-307,-92,127"
  },
  EPSG_4734: {
    towgs84: "-632,438,-609"
  },
  EPSG_4727: {
    towgs84: "912,-58,1227"
  },
  EPSG_4729: {
    towgs84: "185,165,42"
  },
  EPSG_4730: {
    towgs84: "170,42,84"
  },
  EPSG_4733: {
    towgs84: "276,-57,149"
  },
  ESRI_37218: {
    towgs84: "230,-199,-752"
  },
  ESRI_37240: {
    towgs84: "-7,215,225"
  },
  ESRI_37221: {
    towgs84: "252,-209,-751"
  },
  ESRI_4305: {
    towgs84: "-123,-206,219"
  },
  ESRI_104139: {
    towgs84: "-73,-247,227"
  },
  EPSG_4748: {
    towgs84: "51,391,-36"
  },
  EPSG_4219: {
    towgs84: "-384,664,-48"
  },
  EPSG_4255: {
    towgs84: "-333,-222,114"
  },
  EPSG_4257: {
    towgs84: "-587.8,519.75,145.76"
  },
  EPSG_4646: {
    towgs84: "-963,510,-359"
  },
  EPSG_6881: {
    towgs84: "-24,-203,268"
  },
  EPSG_6882: {
    towgs84: "-183,-15,273"
  },
  EPSG_4715: {
    towgs84: "-104,-129,239"
  },
  IGNF_RGF93GDD: {
    towgs84: "0,0,0"
  },
  IGNF_RGM04GDD: {
    towgs84: "0,0,0"
  },
  IGNF_RGSPM06GDD: {
    towgs84: "0,0,0"
  },
  IGNF_RGTAAF07GDD: {
    towgs84: "0,0,0"
  },
  IGNF_RGFG95GDD: {
    towgs84: "0,0,0"
  },
  IGNF_RGNCG: {
    towgs84: "0,0,0"
  },
  IGNF_RGPFGDD: {
    towgs84: "0,0,0"
  },
  IGNF_ETRS89G: {
    towgs84: "0,0,0"
  },
  IGNF_RGR92GDD: {
    towgs84: "0,0,0"
  },
  EPSG_4173: {
    towgs84: "0,0,0"
  },
  EPSG_4180: {
    towgs84: "0,0,0"
  },
  EPSG_4619: {
    towgs84: "0,0,0"
  },
  EPSG_4667: {
    towgs84: "0,0,0"
  },
  EPSG_4075: {
    towgs84: "0,0,0"
  },
  EPSG_6706: {
    towgs84: "0,0,0"
  },
  EPSG_7798: {
    towgs84: "0,0,0"
  },
  EPSG_4661: {
    towgs84: "0,0,0"
  },
  EPSG_4669: {
    towgs84: "0,0,0"
  },
  EPSG_8685: {
    towgs84: "0,0,0"
  },
  EPSG_4151: {
    towgs84: "0,0,0"
  },
  EPSG_9702: {
    towgs84: "0,0,0"
  },
  EPSG_4758: {
    towgs84: "0,0,0"
  },
  EPSG_4761: {
    towgs84: "0,0,0"
  },
  EPSG_4765: {
    towgs84: "0,0,0"
  },
  EPSG_8997: {
    towgs84: "0,0,0"
  },
  EPSG_4023: {
    towgs84: "0,0,0"
  },
  EPSG_4670: {
    towgs84: "0,0,0"
  },
  EPSG_4694: {
    towgs84: "0,0,0"
  },
  EPSG_4148: {
    towgs84: "0,0,0"
  },
  EPSG_4163: {
    towgs84: "0,0,0"
  },
  EPSG_4167: {
    towgs84: "0,0,0"
  },
  EPSG_4189: {
    towgs84: "0,0,0"
  },
  EPSG_4190: {
    towgs84: "0,0,0"
  },
  EPSG_4176: {
    towgs84: "0,0,0"
  },
  EPSG_4659: {
    towgs84: "0,0,0"
  },
  EPSG_3824: {
    towgs84: "0,0,0"
  },
  EPSG_3889: {
    towgs84: "0,0,0"
  },
  EPSG_4046: {
    towgs84: "0,0,0"
  },
  EPSG_4081: {
    towgs84: "0,0,0"
  },
  EPSG_4558: {
    towgs84: "0,0,0"
  },
  EPSG_4483: {
    towgs84: "0,0,0"
  },
  EPSG_5013: {
    towgs84: "0,0,0"
  },
  EPSG_5264: {
    towgs84: "0,0,0"
  },
  EPSG_5324: {
    towgs84: "0,0,0"
  },
  EPSG_5354: {
    towgs84: "0,0,0"
  },
  EPSG_5371: {
    towgs84: "0,0,0"
  },
  EPSG_5373: {
    towgs84: "0,0,0"
  },
  EPSG_5381: {
    towgs84: "0,0,0"
  },
  EPSG_5393: {
    towgs84: "0,0,0"
  },
  EPSG_5489: {
    towgs84: "0,0,0"
  },
  EPSG_5593: {
    towgs84: "0,0,0"
  },
  EPSG_6135: {
    towgs84: "0,0,0"
  },
  EPSG_6365: {
    towgs84: "0,0,0"
  },
  EPSG_5246: {
    towgs84: "0,0,0"
  },
  EPSG_7886: {
    towgs84: "0,0,0"
  },
  EPSG_8431: {
    towgs84: "0,0,0"
  },
  EPSG_8427: {
    towgs84: "0,0,0"
  },
  EPSG_8699: {
    towgs84: "0,0,0"
  },
  EPSG_8818: {
    towgs84: "0,0,0"
  },
  EPSG_4757: {
    towgs84: "0,0,0"
  },
  EPSG_9140: {
    towgs84: "0,0,0"
  },
  EPSG_8086: {
    towgs84: "0,0,0"
  },
  EPSG_4686: {
    towgs84: "0,0,0"
  },
  EPSG_4737: {
    towgs84: "0,0,0"
  },
  EPSG_4702: {
    towgs84: "0,0,0"
  },
  EPSG_4747: {
    towgs84: "0,0,0"
  },
  EPSG_4749: {
    towgs84: "0,0,0"
  },
  EPSG_4674: {
    towgs84: "0,0,0"
  },
  EPSG_4755: {
    towgs84: "0,0,0"
  },
  EPSG_4759: {
    towgs84: "0,0,0"
  },
  EPSG_4762: {
    towgs84: "0,0,0"
  },
  EPSG_4763: {
    towgs84: "0,0,0"
  },
  EPSG_4764: {
    towgs84: "0,0,0"
  },
  EPSG_4166: {
    towgs84: "0,0,0"
  },
  EPSG_4170: {
    towgs84: "0,0,0"
  },
  EPSG_5546: {
    towgs84: "0,0,0"
  },
  EPSG_7844: {
    towgs84: "0,0,0"
  },
  EPSG_4818: {
    towgs84: "589,76,480"
  }
};
for (var g1 in co) {
  var Kh = co[g1];
  Kh.datumName && (co[Kh.datumName] = Kh);
}
function d1(n, i, a, l, c, _, m) {
  var g = {};
  return n === void 0 || n === "none" ? g.datum_type = sl : g.datum_type = Sv, i && (g.datum_params = i.map(parseFloat), (g.datum_params[0] !== 0 || g.datum_params[1] !== 0 || g.datum_params[2] !== 0) && (g.datum_type = yr), g.datum_params.length > 3 && (g.datum_params[3] !== 0 || g.datum_params[4] !== 0 || g.datum_params[5] !== 0 || g.datum_params[6] !== 0) && (g.datum_type = pr, g.datum_params[3] *= xa, g.datum_params[4] *= xa, g.datum_params[5] *= xa, g.datum_params[6] = g.datum_params[6] / 1e6 + 1)), m && (g.datum_type = is, g.grids = m), g.a = a, g.b = l, g.es = c, g.ep2 = _, g;
}
var Ml = {};
function _1(n, i, a) {
  return i instanceof ArrayBuffer ? m1(n, i, a) : { ready: y1(n, i) };
}
function m1(n, i, a) {
  var l = !0;
  a !== void 0 && a.includeErrorFields === !1 && (l = !1);
  var c = new DataView(i), _ = x1(c), m = E1(c, _), g = M1(c, m, _, l), v = { header: m, subgrids: g };
  return Ml[n] = v, v;
}
async function y1(n, i) {
  for (var a = [], l = await i.getImageCount(), c = l - 1; c >= 0; c--) {
    var _ = await i.getImage(c), m = await _.readRasters(), g = m, v = [_.getWidth(), _.getHeight()], M = _.getBoundingBox().map(Cf), w = [_.fileDirectory.ModelPixelScale[0], _.fileDirectory.ModelPixelScale[1]].map(Cf), E = M[0] + (v[0] - 1) * w[0], k = M[3] - (v[1] - 1) * w[1], P = g[0], C = g[1], L = [];
    for (let j = v[1] - 1; j >= 0; j--)
      for (let U = v[0] - 1; U >= 0; U--) {
        var D = j * v[0] + U;
        L.push([-Di(C[D]), Di(P[D])]);
      }
    a.push({
      del: w,
      lim: v,
      ll: [-E, k],
      cvs: L
    });
  }
  var B = {
    header: {
      nSubgrids: l
    },
    subgrids: a
  };
  return Ml[n] = B, B;
}
function p1(n) {
  if (n === void 0)
    return null;
  var i = n.split(",");
  return i.map(v1);
}
function v1(n) {
  if (n.length === 0)
    return null;
  var i = n[0] === "@";
  return i && (n = n.slice(1)), n === "null" ? { name: "null", mandatory: !i, grid: null, isNull: !0 } : {
    name: n,
    mandatory: !i,
    grid: Ml[n] || null,
    isNull: !1
  };
}
function Cf(n) {
  return n * Math.PI / 180;
}
function Di(n) {
  return n / 3600 * Math.PI / 180;
}
function x1(n) {
  var i = n.getInt32(8, !1);
  return i === 11 ? !1 : (i = n.getInt32(8, !0), i !== 11 && console.warn("Failed to detect nadgrid endian-ness, defaulting to little-endian"), !0);
}
function E1(n, i) {
  return {
    nFields: n.getInt32(8, i),
    nSubgridFields: n.getInt32(24, i),
    nSubgrids: n.getInt32(40, i),
    shiftType: ol(n, 56, 64).trim(),
    fromSemiMajorAxis: n.getFloat64(120, i),
    fromSemiMinorAxis: n.getFloat64(136, i),
    toSemiMajorAxis: n.getFloat64(152, i),
    toSemiMinorAxis: n.getFloat64(168, i)
  };
}
function ol(n, i, a) {
  return String.fromCharCode.apply(null, new Uint8Array(n.buffer.slice(i, a)));
}
function M1(n, i, a, l) {
  for (var c = 176, _ = [], m = 0; m < i.nSubgrids; m++) {
    var g = w1(n, c, a), v = S1(n, c, g, a, l), M = Math.round(
      1 + (g.upperLongitude - g.lowerLongitude) / g.longitudeInterval
    ), w = Math.round(
      1 + (g.upperLatitude - g.lowerLatitude) / g.latitudeInterval
    );
    _.push({
      ll: [Di(g.lowerLongitude), Di(g.lowerLatitude)],
      del: [Di(g.longitudeInterval), Di(g.latitudeInterval)],
      lim: [M, w],
      count: g.gridNodeCount,
      cvs: k1(v)
    });
    var E = 16;
    l === !1 && (E = 8), c += 176 + g.gridNodeCount * E;
  }
  return _;
}
function k1(n) {
  return n.map(function(i) {
    return [Di(i.longitudeShift), Di(i.latitudeShift)];
  });
}
function w1(n, i, a) {
  return {
    name: ol(n, i + 8, i + 16).trim(),
    parent: ol(n, i + 24, i + 24 + 8).trim(),
    lowerLatitude: n.getFloat64(i + 72, a),
    upperLatitude: n.getFloat64(i + 88, a),
    lowerLongitude: n.getFloat64(i + 104, a),
    upperLongitude: n.getFloat64(i + 120, a),
    latitudeInterval: n.getFloat64(i + 136, a),
    longitudeInterval: n.getFloat64(i + 152, a),
    gridNodeCount: n.getInt32(i + 168, a)
  };
}
function S1(n, i, a, l, c) {
  var _ = i + 176, m = 16;
  c === !1 && (m = 8);
  for (var g = [], v = 0; v < a.gridNodeCount; v++) {
    var M = {
      latitudeShift: n.getFloat32(_ + v * m, l),
      longitudeShift: n.getFloat32(_ + v * m + 4, l)
    };
    c !== !1 && (M.latitudeAccuracy = n.getFloat32(_ + v * m + 8, l), M.longitudeAccuracy = n.getFloat32(_ + v * m + 12, l)), g.push(M);
  }
  return g;
}
function Fn(n, i) {
  if (!(this instanceof Fn))
    return new Fn(n);
  this.forward = null, this.inverse = null, this.init = null, this.name, this.names = null, this.title, i = i || function(M) {
    if (M)
      throw M;
  };
  var a = Qv(n);
  if (typeof a != "object") {
    i("Could not parse to valid json: " + n);
    return;
  }
  var l = Fn.projections.get(a.projName);
  if (!l) {
    i("Could not get projection name from: " + n);
    return;
  }
  if (a.datumCode && a.datumCode !== "none") {
    var c = Bi(co, a.datumCode);
    c && (a.datum_params = a.datum_params || (c.towgs84 ? c.towgs84.split(",") : null), a.ellps = c.ellipse, a.datumName = c.datumName ? c.datumName : a.datumCode);
  }
  a.k0 = a.k0 || 1, a.axis = a.axis || "enu", a.ellps = a.ellps || "wgs84", a.lat1 = a.lat1 || a.lat0;
  var _ = f1(a.a, a.b, a.rf, a.ellps, a.sphere), m = c1(_.a, _.b, _.rf, a.R_A), g = p1(a.nadgrids), v = a.datum || d1(
    a.datumCode,
    a.datum_params,
    _.a,
    _.b,
    m.es,
    m.ep2,
    g
  );
  Nf(this, a), Nf(this, l), this.a = _.a, this.b = _.b, this.rf = _.rf, this.sphere = _.sphere, this.es = m.es, this.e = m.e, this.ep2 = m.ep2, this.datum = v, "init" in this && typeof this.init == "function" && this.init(), i(null, this);
}
Fn.projections = h1;
Fn.projections.start();
function I1(n, i) {
  return n.datum_type !== i.datum_type || n.a !== i.a || Math.abs(n.es - i.es) > 5e-11 ? !1 : n.datum_type === yr ? n.datum_params[0] === i.datum_params[0] && n.datum_params[1] === i.datum_params[1] && n.datum_params[2] === i.datum_params[2] : n.datum_type === pr ? n.datum_params[0] === i.datum_params[0] && n.datum_params[1] === i.datum_params[1] && n.datum_params[2] === i.datum_params[2] && n.datum_params[3] === i.datum_params[3] && n.datum_params[4] === i.datum_params[4] && n.datum_params[5] === i.datum_params[5] && n.datum_params[6] === i.datum_params[6] : !0;
}
function Pg(n, i, a) {
  var l = n.x, c = n.y, _ = n.z ? n.z : 0, m, g, v, M;
  if (c < -J && c > -1.001 * J)
    c = -J;
  else if (c > J && c < 1.001 * J)
    c = J;
  else {
    if (c < -J)
      return { x: -1 / 0, y: -1 / 0, z: n.z };
    if (c > J)
      return { x: 1 / 0, y: 1 / 0, z: n.z };
  }
  return l > Math.PI && (l -= 2 * Math.PI), g = Math.sin(c), M = Math.cos(c), v = g * g, m = a / Math.sqrt(1 - i * v), {
    x: (m + _) * M * Math.cos(l),
    y: (m + _) * M * Math.sin(l),
    z: (m * (1 - i) + _) * g
  };
}
function Tg(n, i, a, l) {
  var c = 1e-12, _ = c * c, m = 30, g, v, M, w, E, k, P, C, L, D, B, j, U, X = n.x, Y = n.y, H = n.z ? n.z : 0, Z, et, $;
  if (g = Math.sqrt(X * X + Y * Y), v = Math.sqrt(X * X + Y * Y + H * H), g / a < c) {
    if (Z = 0, v / a < c)
      return et = J, $ = -l, {
        x: n.x,
        y: n.y,
        z: n.z
      };
  } else
    Z = Math.atan2(Y, X);
  M = H / v, w = g / v, E = 1 / Math.sqrt(1 - i * (2 - i) * w * w), C = w * (1 - i) * E, L = M * E, U = 0;
  do
    U++, P = a / Math.sqrt(1 - i * L * L), $ = g * C + H * L - P * (1 - i * L * L), k = i * P / (P + $), E = 1 / Math.sqrt(1 - k * (2 - k) * w * w), D = w * (1 - k) * E, B = M * E, j = B * C - D * L, C = D, L = B;
  while (j * j > _ && U < m);
  return et = Math.atan(B / Math.abs(D)), {
    x: Z,
    y: et,
    z: $
  };
}
function N1(n, i, a) {
  if (i === yr)
    return {
      x: n.x + a[0],
      y: n.y + a[1],
      z: n.z + a[2]
    };
  if (i === pr) {
    var l = a[0], c = a[1], _ = a[2], m = a[3], g = a[4], v = a[5], M = a[6];
    return {
      x: M * (n.x - v * n.y + g * n.z) + l,
      y: M * (v * n.x + n.y - m * n.z) + c,
      z: M * (-g * n.x + m * n.y + n.z) + _
    };
  }
}
function b1(n, i, a) {
  if (i === yr)
    return {
      x: n.x - a[0],
      y: n.y - a[1],
      z: n.z - a[2]
    };
  if (i === pr) {
    var l = a[0], c = a[1], _ = a[2], m = a[3], g = a[4], v = a[5], M = a[6], w = (n.x - l) / M, E = (n.y - c) / M, k = (n.z - _) / M;
    return {
      x: w + v * E - g * k,
      y: -v * w + E + m * k,
      z: g * w - m * E + k
    };
  }
}
function Ku(n) {
  return n === yr || n === pr;
}
function C1(n, i, a) {
  if (I1(n, i) || n.datum_type === sl || i.datum_type === sl)
    return a;
  var l = n.a, c = n.es;
  if (n.datum_type === is) {
    var _ = Pf(n, !1, a);
    if (_ !== 0)
      return;
    l = Ef, c = Mf;
  }
  var m = i.a, g = i.b, v = i.es;
  if (i.datum_type === is && (m = Ef, g = Iv, v = Mf), c === v && l === m && !Ku(n.datum_type) && !Ku(i.datum_type))
    return a;
  if (a = Pg(a, c, l), Ku(n.datum_type) && (a = N1(a, n.datum_type, n.datum_params)), Ku(i.datum_type) && (a = b1(a, i.datum_type, i.datum_params)), a = Tg(a, v, m, g), i.datum_type === is) {
    var M = Pf(i, !0, a);
    if (M !== 0)
      return;
  }
  return a;
}
function Pf(n, i, a) {
  if (n.grids === null || n.grids.length === 0)
    return console.log("Grid shift grids not found"), -1;
  var l = { x: -a.x, y: a.y }, c = { x: Number.NaN, y: Number.NaN }, _ = [];
  t:
    for (var m = 0; m < n.grids.length; m++) {
      var g = n.grids[m];
      if (_.push(g.name), g.isNull) {
        c = l;
        break;
      }
      if (g.grid === null) {
        if (g.mandatory)
          return console.log("Unable to find mandatory grid '" + g.name + "'"), -1;
        continue;
      }
      for (var v = g.grid.subgrids, M = 0, w = v.length; M < w; M++) {
        var E = v[M], k = (Math.abs(E.del[1]) + Math.abs(E.del[0])) / 1e4, P = E.ll[0] - k, C = E.ll[1] - k, L = E.ll[0] + (E.lim[0] - 1) * E.del[0] + k, D = E.ll[1] + (E.lim[1] - 1) * E.del[1] + k;
        if (!(C > l.y || P > l.x || D < l.y || L < l.x) && (c = P1(l, i, E), !isNaN(c.x)))
          break t;
      }
    }
  return isNaN(c.x) ? (console.log("Failed to find a grid shift table for location '" + -l.x * Wn + " " + l.y * Wn + " tried: '" + _ + "'"), -1) : (a.x = -c.x, a.y = c.y, 0);
}
function P1(n, i, a) {
  var l = { x: Number.NaN, y: Number.NaN };
  if (isNaN(n.x))
    return l;
  var c = { x: n.x, y: n.y };
  c.x -= a.ll[0], c.y -= a.ll[1], c.x = ut(c.x - Math.PI) + Math.PI;
  var _ = Tf(c, a);
  if (i) {
    if (isNaN(_.x))
      return l;
    _.x = c.x - _.x, _.y = c.y - _.y;
    var m = 9, g = 1e-12, v, M;
    do {
      if (M = Tf(_, a), isNaN(M.x)) {
        console.log("Inverse grid shift iteration failed, presumably at grid edge.  Using first approximation.");
        break;
      }
      v = { x: c.x - (M.x + _.x), y: c.y - (M.y + _.y) }, _.x += v.x, _.y += v.y;
    } while (m-- && Math.abs(v.x) > g && Math.abs(v.y) > g);
    if (m < 0)
      return console.log("Inverse grid shift iterator failed to converge."), l;
    l.x = ut(_.x + a.ll[0]), l.y = _.y + a.ll[1];
  } else
    isNaN(_.x) || (l.x = n.x + _.x, l.y = n.y + _.y);
  return l;
}
function Tf(n, i) {
  var a = { x: n.x / i.del[0], y: n.y / i.del[1] }, l = { x: Math.floor(a.x), y: Math.floor(a.y) }, c = { x: a.x - 1 * l.x, y: a.y - 1 * l.y }, _ = { x: Number.NaN, y: Number.NaN }, m;
  if (l.x < 0 || l.x >= i.lim[0] || l.y < 0 || l.y >= i.lim[1])
    return _;
  m = l.y * i.lim[0] + l.x;
  var g = { x: i.cvs[m][0], y: i.cvs[m][1] };
  m++;
  var v = { x: i.cvs[m][0], y: i.cvs[m][1] };
  m += i.lim[0];
  var M = { x: i.cvs[m][0], y: i.cvs[m][1] };
  m--;
  var w = { x: i.cvs[m][0], y: i.cvs[m][1] }, E = c.x * c.y, k = c.x * (1 - c.y), P = (1 - c.x) * (1 - c.y), C = (1 - c.x) * c.y;
  return _.x = P * g.x + k * v.x + C * w.x + E * M.x, _.y = P * g.y + k * v.y + C * w.y + E * M.y, _;
}
function Af(n, i, a) {
  var l = a.x, c = a.y, _ = a.z || 0, m, g, v, M = {};
  for (v = 0; v < 3; v++)
    if (!(i && v === 2 && a.z === void 0))
      switch (v === 0 ? (m = l, "ew".indexOf(n.axis[v]) !== -1 ? g = "x" : g = "y") : v === 1 ? (m = c, "ns".indexOf(n.axis[v]) !== -1 ? g = "y" : g = "x") : (m = _, g = "z"), n.axis[v]) {
        case "e":
          M[g] = m;
          break;
        case "w":
          M[g] = -m;
          break;
        case "n":
          M[g] = m;
          break;
        case "s":
          M[g] = -m;
          break;
        case "u":
          a[g] !== void 0 && (M.z = m);
          break;
        case "d":
          a[g] !== void 0 && (M.z = -m);
          break;
        default:
          return null;
      }
  return M;
}
function Ag(n) {
  var i = {
    x: n[0],
    y: n[1]
  };
  return n.length > 2 && (i.z = n[2]), n.length > 3 && (i.m = n[3]), i;
}
function T1(n) {
  Rf(n.x), Rf(n.y);
}
function Rf(n) {
  if (typeof Number.isFinite == "function") {
    if (Number.isFinite(n))
      return;
    throw new TypeError("coordinates must be finite numbers");
  }
  if (typeof n != "number" || n !== n || !isFinite(n))
    throw new TypeError("coordinates must be finite numbers");
}
function A1(n, i) {
  return (n.datum.datum_type === yr || n.datum.datum_type === pr || n.datum.datum_type === is) && i.datumCode !== "WGS84" || (i.datum.datum_type === yr || i.datum.datum_type === pr || i.datum.datum_type === is) && n.datumCode !== "WGS84";
}
function Eo(n, i, a, l) {
  var c;
  Array.isArray(a) ? a = Ag(a) : a = {
    x: a.x,
    y: a.y,
    z: a.z,
    m: a.m
  };
  var _ = a.z !== void 0;
  if (T1(a), n.datum && i.datum && A1(n, i) && (c = new Fn("WGS84"), a = Eo(n, c, a, l), n = c), l && n.axis !== "enu" && (a = Af(n, !1, a)), n.projName === "longlat")
    a = {
      x: a.x * Ee,
      y: a.y * Ee,
      z: a.z || 0
    };
  else if (n.to_meter && (a = {
    x: a.x * n.to_meter,
    y: a.y * n.to_meter,
    z: a.z || 0
  }), a = n.inverse(a), !a)
    return;
  if (n.from_greenwich && (a.x += n.from_greenwich), a = C1(n.datum, i.datum, a), !!a)
    return a = /** @type {import('./core').InterfaceCoordinates} */
    a, i.from_greenwich && (a = {
      x: a.x - i.from_greenwich,
      y: a.y,
      z: a.z || 0
    }), i.projName === "longlat" ? a = {
      x: a.x * Wn,
      y: a.y * Wn,
      z: a.z || 0
    } : (a = i.forward(a), i.to_meter && (a = {
      x: a.x / i.to_meter,
      y: a.y / i.to_meter,
      z: a.z || 0
    })), l && i.axis !== "enu" ? Af(i, !0, a) : (a && !_ && delete a.z, a);
}
var Of = Fn("WGS84");
function Zh(n, i, a, l) {
  var c, _, m;
  return Array.isArray(a) ? (c = Eo(n, i, a, l) || { x: NaN, y: NaN }, a.length > 2 ? typeof n.name < "u" && n.name === "geocent" || typeof i.name < "u" && i.name === "geocent" ? typeof c.z == "number" ? (
    /** @type {T} */
    [c.x, c.y, c.z].concat(a.slice(3))
  ) : (
    /** @type {T} */
    [c.x, c.y, a[2]].concat(a.slice(3))
  ) : (
    /** @type {T} */
    [c.x, c.y].concat(a.slice(2))
  ) : (
    /** @type {T} */
    [c.x, c.y]
  )) : (_ = Eo(n, i, a, l), m = Object.keys(a), m.length === 2 || m.forEach(function(g) {
    if (typeof n.name < "u" && n.name === "geocent" || typeof i.name < "u" && i.name === "geocent") {
      if (g === "x" || g === "y" || g === "z")
        return;
    } else if (g === "x" || g === "y")
      return;
    _[g] = a[g];
  }), /** @type {T} */
  _);
}
function Zu(n) {
  return n instanceof Fn ? n : typeof n == "object" && "oProj" in n ? n.oProj : Fn(
    /** @type {string | PROJJSONDefinition} */
    n
  );
}
function R1(n, i, a) {
  var l, c, _ = !1, m;
  return typeof i > "u" ? (c = Zu(n), l = Of, _ = !0) : (typeof /** @type {?} */
  i.x < "u" || Array.isArray(i)) && (a = /** @type {T} */
  /** @type {?} */
  i, c = Zu(n), l = Of, _ = !0), l || (l = Zu(n)), c || (c = Zu(
    /** @type {string | PROJJSONDefinition | proj } */
    i
  )), a ? Zh(l, c, a) : (m = {
    /**
     * @template {TemplateCoordinates} T
     * @param {T} coords
     * @param {boolean=} enforceAxis
     * @returns {T}
     */
    forward: function(g, v) {
      return Zh(l, c, g, v);
    },
    /**
     * @template {TemplateCoordinates} T
     * @param {T} coords
     * @param {boolean=} enforceAxis
     * @returns {T}
     */
    inverse: function(g, v) {
      return Zh(c, l, g, v);
    }
  }, _ && (m.oProj = c), m);
}
var Lf = 6, Rg = "AJSAJS", Og = "AFAFAF", ts = 65, Je = 73, In = 79, ga = 86, da = 90;
const O1 = {
  forward: Lg,
  inverse: L1,
  toPoint: Gg
};
function Lg(n, i) {
  return i = i || 5, F1(G1({
    lat: n[1],
    lon: n[0]
  }), i);
}
function L1(n) {
  var i = kl(Fg(n.toUpperCase()));
  return i.lat && i.lon ? [i.lon, i.lat, i.lon, i.lat] : [i.left, i.bottom, i.right, i.top];
}
function Gg(n) {
  var i = kl(Fg(n.toUpperCase()));
  return i.lat && i.lon ? [i.lon, i.lat] : [(i.left + i.right) / 2, (i.top + i.bottom) / 2];
}
function Qh(n) {
  return n * (Math.PI / 180);
}
function Gf(n) {
  return 180 * (n / Math.PI);
}
function G1(n) {
  var i = n.lat, a = n.lon, l = 6378137, c = 669438e-8, _ = 0.9996, m, g, v, M, w, E, k, P = Qh(i), C = Qh(a), L, D;
  D = Math.floor((a + 180) / 6) + 1, a === 180 && (D = 60), i >= 56 && i < 64 && a >= 3 && a < 12 && (D = 32), i >= 72 && i < 84 && (a >= 0 && a < 9 ? D = 31 : a >= 9 && a < 21 ? D = 33 : a >= 21 && a < 33 ? D = 35 : a >= 33 && a < 42 && (D = 37)), m = (D - 1) * 6 - 180 + 3, L = Qh(m), g = c / (1 - c), v = l / Math.sqrt(1 - c * Math.sin(P) * Math.sin(P)), M = Math.tan(P) * Math.tan(P), w = g * Math.cos(P) * Math.cos(P), E = Math.cos(P) * (C - L), k = l * ((1 - c / 4 - 3 * c * c / 64 - 5 * c * c * c / 256) * P - (3 * c / 8 + 3 * c * c / 32 + 45 * c * c * c / 1024) * Math.sin(2 * P) + (15 * c * c / 256 + 45 * c * c * c / 1024) * Math.sin(4 * P) - 35 * c * c * c / 3072 * Math.sin(6 * P));
  var B = _ * v * (E + (1 - M + w) * E * E * E / 6 + (5 - 18 * M + M * M + 72 * w - 58 * g) * E * E * E * E * E / 120) + 5e5, j = _ * (k + v * Math.tan(P) * (E * E / 2 + (5 - M + 9 * w + 4 * w * w) * E * E * E * E / 24 + (61 - 58 * M + M * M + 600 * w - 330 * g) * E * E * E * E * E * E / 720));
  return i < 0 && (j += 1e7), {
    northing: Math.round(j),
    easting: Math.round(B),
    zoneNumber: D,
    zoneLetter: D1(i)
  };
}
function kl(n) {
  var i = n.northing, a = n.easting, l = n.zoneLetter, c = n.zoneNumber;
  if (c < 0 || c > 60)
    return null;
  var _ = 0.9996, m = 6378137, g = 669438e-8, v, M = (1 - Math.sqrt(1 - g)) / (1 + Math.sqrt(1 - g)), w, E, k, P, C, L, D, B, j, U = a - 5e5, X = i;
  l < "N" && (X -= 1e7), D = (c - 1) * 6 - 180 + 3, v = g / (1 - g), L = X / _, B = L / (m * (1 - g / 4 - 3 * g * g / 64 - 5 * g * g * g / 256)), j = B + (3 * M / 2 - 27 * M * M * M / 32) * Math.sin(2 * B) + (21 * M * M / 16 - 55 * M * M * M * M / 32) * Math.sin(4 * B) + 151 * M * M * M / 96 * Math.sin(6 * B), w = m / Math.sqrt(1 - g * Math.sin(j) * Math.sin(j)), E = Math.tan(j) * Math.tan(j), k = v * Math.cos(j) * Math.cos(j), P = m * (1 - g) / Math.pow(1 - g * Math.sin(j) * Math.sin(j), 1.5), C = U / (w * _);
  var Y = j - w * Math.tan(j) / P * (C * C / 2 - (5 + 3 * E + 10 * k - 4 * k * k - 9 * v) * C * C * C * C / 24 + (61 + 90 * E + 298 * k + 45 * E * E - 252 * v - 3 * k * k) * C * C * C * C * C * C / 720);
  Y = Gf(Y);
  var H = (C - (1 + 2 * E + k) * C * C * C / 6 + (5 - 2 * k + 28 * E - 3 * k * k + 8 * v + 24 * E * E) * C * C * C * C * C / 120) / Math.cos(j);
  H = D + Gf(H);
  var Z;
  if (n.accuracy) {
    var et = kl({
      northing: n.northing + n.accuracy,
      easting: n.easting + n.accuracy,
      zoneLetter: n.zoneLetter,
      zoneNumber: n.zoneNumber
    });
    Z = {
      top: et.lat,
      right: et.lon,
      bottom: Y,
      left: H
    };
  } else
    Z = {
      lat: Y,
      lon: H
    };
  return Z;
}
function D1(n) {
  var i = "Z";
  return 84 >= n && n >= 72 ? i = "X" : 72 > n && n >= 64 ? i = "W" : 64 > n && n >= 56 ? i = "V" : 56 > n && n >= 48 ? i = "U" : 48 > n && n >= 40 ? i = "T" : 40 > n && n >= 32 ? i = "S" : 32 > n && n >= 24 ? i = "R" : 24 > n && n >= 16 ? i = "Q" : 16 > n && n >= 8 ? i = "P" : 8 > n && n >= 0 ? i = "N" : 0 > n && n >= -8 ? i = "M" : -8 > n && n >= -16 ? i = "L" : -16 > n && n >= -24 ? i = "K" : -24 > n && n >= -32 ? i = "J" : -32 > n && n >= -40 ? i = "H" : -40 > n && n >= -48 ? i = "G" : -48 > n && n >= -56 ? i = "F" : -56 > n && n >= -64 ? i = "E" : -64 > n && n >= -72 ? i = "D" : -72 > n && n >= -80 && (i = "C"), i;
}
function F1(n, i) {
  var a = "00000" + n.easting, l = "00000" + n.northing;
  return n.zoneNumber + n.zoneLetter + q1(n.easting, n.northing, n.zoneNumber) + a.substr(a.length - 5, i) + l.substr(l.length - 5, i);
}
function q1(n, i, a) {
  var l = Dg(a), c = Math.floor(n / 1e5), _ = Math.floor(i / 1e5) % 20;
  return B1(c, _, l);
}
function Dg(n) {
  var i = n % Lf;
  return i === 0 && (i = Lf), i;
}
function B1(n, i, a) {
  var l = a - 1, c = Rg.charCodeAt(l), _ = Og.charCodeAt(l), m = c + n - 1, g = _ + i, v = !1;
  m > da && (m = m - da + ts - 1, v = !0), (m === Je || c < Je && m > Je || (m > Je || c < Je) && v) && m++, (m === In || c < In && m > In || (m > In || c < In) && v) && (m++, m === Je && m++), m > da && (m = m - da + ts - 1), g > ga ? (g = g - ga + ts - 1, v = !0) : v = !1, (g === Je || _ < Je && g > Je || (g > Je || _ < Je) && v) && g++, (g === In || _ < In && g > In || (g > In || _ < In) && v) && (g++, g === Je && g++), g > ga && (g = g - ga + ts - 1);
  var M = String.fromCharCode(m) + String.fromCharCode(g);
  return M;
}
function Fg(n) {
  if (n && n.length === 0)
    throw "MGRSPoint coverting from nothing";
  for (var i = n.length, a = null, l = "", c, _ = 0; !/[A-Z]/.test(c = n.charAt(_)); ) {
    if (_ >= 2)
      throw "MGRSPoint bad conversion from: " + n;
    l += c, _++;
  }
  var m = parseInt(l, 10);
  if (_ === 0 || _ + 3 > i)
    throw "MGRSPoint bad conversion from: " + n;
  var g = n.charAt(_++);
  if (g <= "A" || g === "B" || g === "Y" || g >= "Z" || g === "I" || g === "O")
    throw "MGRSPoint zone letter " + g + " not handled: " + n;
  a = n.substring(_, _ += 2);
  for (var v = Dg(m), M = z1(a.charAt(0), v), w = j1(a.charAt(1), v); w < U1(g); )
    w += 2e6;
  var E = i - _;
  if (E % 2 !== 0)
    throw `MGRSPoint has to have an even number 
of digits after the zone letter and two 100km letters - front 
half for easting meters, second half for 
northing meters` + n;
  var k = E / 2, P = 0, C = 0, L, D, B, j, U;
  return k > 0 && (L = 1e5 / Math.pow(10, k), D = n.substring(_, _ + k), P = parseFloat(D) * L, B = n.substring(_ + k), C = parseFloat(B) * L), j = P + M, U = C + w, {
    easting: j,
    northing: U,
    zoneLetter: g,
    zoneNumber: m,
    accuracy: L
  };
}
function z1(n, i) {
  for (var a = Rg.charCodeAt(i - 1), l = 1e5, c = !1; a !== n.charCodeAt(0); ) {
    if (a++, a === Je && a++, a === In && a++, a > da) {
      if (c)
        throw "Bad character: " + n;
      a = ts, c = !0;
    }
    l += 1e5;
  }
  return l;
}
function j1(n, i) {
  if (n > "V")
    throw "MGRSPoint given invalid Northing " + n;
  for (var a = Og.charCodeAt(i - 1), l = 0, c = !1; a !== n.charCodeAt(0); ) {
    if (a++, a === Je && a++, a === In && a++, a > ga) {
      if (c)
        throw "Bad character: " + n;
      a = ts, c = !0;
    }
    l += 1e5;
  }
  return l;
}
function U1(n) {
  var i;
  switch (n) {
    case "C":
      i = 11e5;
      break;
    case "D":
      i = 2e6;
      break;
    case "E":
      i = 28e5;
      break;
    case "F":
      i = 37e5;
      break;
    case "G":
      i = 46e5;
      break;
    case "H":
      i = 55e5;
      break;
    case "J":
      i = 64e5;
      break;
    case "K":
      i = 73e5;
      break;
    case "L":
      i = 82e5;
      break;
    case "M":
      i = 91e5;
      break;
    case "N":
      i = 0;
      break;
    case "P":
      i = 8e5;
      break;
    case "Q":
      i = 17e5;
      break;
    case "R":
      i = 26e5;
      break;
    case "S":
      i = 35e5;
      break;
    case "T":
      i = 44e5;
      break;
    case "U":
      i = 53e5;
      break;
    case "V":
      i = 62e5;
      break;
    case "W":
      i = 7e6;
      break;
    case "X":
      i = 79e5;
      break;
    default:
      i = -1;
  }
  if (i >= 0)
    return i;
  throw "Invalid zone letter: " + n;
}
function as(n, i, a) {
  if (!(this instanceof as))
    return new as(n, i, a);
  if (Array.isArray(n))
    this.x = n[0], this.y = n[1], this.z = n[2] || 0;
  else if (typeof n == "object")
    this.x = n.x, this.y = n.y, this.z = n.z || 0;
  else if (typeof n == "string" && typeof i > "u") {
    var l = n.split(",");
    this.x = parseFloat(l[0]), this.y = parseFloat(l[1]), this.z = parseFloat(l[2]) || 0;
  } else
    this.x = n, this.y = i, this.z = a || 0;
  console.warn("proj4.Point will be removed in version 3, use proj4.toPoint");
}
as.fromMGRS = function(n) {
  return new as(Gg(n));
};
as.prototype.toMGRS = function(n) {
  return Lg([this.x, this.y], n);
};
var Y1 = 1, X1 = 0.25, Df = 0.046875, Ff = 0.01953125, qf = 0.01068115234375, V1 = 0.75, W1 = 0.46875, H1 = 0.013020833333333334, K1 = 0.007120768229166667, Z1 = 0.3645833333333333, Q1 = 0.005696614583333333, J1 = 0.3076171875;
function wl(n) {
  var i = [];
  i[0] = Y1 - n * (X1 + n * (Df + n * (Ff + n * qf))), i[1] = n * (V1 - n * (Df + n * (Ff + n * qf)));
  var a = n * n;
  return i[2] = a * (W1 - n * (H1 + n * K1)), a *= n, i[3] = a * (Z1 - n * Q1), i[4] = a * n * J1, i;
}
function cs(n, i, a, l) {
  return a *= i, i *= i, l[0] * n - a * (l[1] + i * (l[2] + i * (l[3] + i * l[4])));
}
var $1 = 20;
function Sl(n, i, a) {
  for (var l = 1 / (1 - i), c = n, _ = $1; _; --_) {
    var m = Math.sin(c), g = 1 - i * m * m;
    if (g = (cs(c, m, Math.cos(c), a) - n) * (g * Math.sqrt(g)) * l, c -= g, Math.abs(g) < st)
      return c;
  }
  return c;
}
function t2() {
  this.x0 = this.x0 !== void 0 ? this.x0 : 0, this.y0 = this.y0 !== void 0 ? this.y0 : 0, this.long0 = this.long0 !== void 0 ? this.long0 : 0, this.lat0 = this.lat0 !== void 0 ? this.lat0 : 0, this.es && (this.en = wl(this.es), this.ml0 = cs(this.lat0, Math.sin(this.lat0), Math.cos(this.lat0), this.en));
}
function e2(n) {
  var i = n.x, a = n.y, l = ut(i - this.long0), c, _, m, g = Math.sin(a), v = Math.cos(a);
  if (this.es) {
    var M = v * l, w = Math.pow(M, 2), E = this.ep2 * Math.pow(v, 2), k = Math.pow(E, 2), P = Math.abs(v) > st ? Math.tan(a) : 0, C = Math.pow(P, 2), L = Math.pow(C, 2);
    c = 1 - this.es * Math.pow(g, 2), M = M / Math.sqrt(c);
    var D = cs(a, g, v, this.en);
    _ = this.a * (this.k0 * M * (1 + w / 6 * (1 - C + E + w / 20 * (5 - 18 * C + L + 14 * E - 58 * C * E + w / 42 * (61 + 179 * L - L * C - 479 * C))))) + this.x0, m = this.a * (this.k0 * (D - this.ml0 + g * l * M / 2 * (1 + w / 12 * (5 - C + 9 * E + 4 * k + w / 30 * (61 + L - 58 * C + 270 * E - 330 * C * E + w / 56 * (1385 + 543 * L - L * C - 3111 * C)))))) + this.y0;
  } else {
    var B = v * Math.sin(l);
    if (Math.abs(Math.abs(B) - 1) < st)
      return 93;
    if (_ = 0.5 * this.a * this.k0 * Math.log((1 + B) / (1 - B)) + this.x0, m = v * Math.cos(l) / Math.sqrt(1 - Math.pow(B, 2)), B = Math.abs(m), B >= 1) {
      if (B - 1 > st)
        return 93;
      m = 0;
    } else
      m = Math.acos(m);
    a < 0 && (m = -m), m = this.a * this.k0 * (m - this.lat0) + this.y0;
  }
  return n.x = _, n.y = m, n;
}
function n2(n) {
  var i, a, l, c, _ = (n.x - this.x0) * (1 / this.a), m = (n.y - this.y0) * (1 / this.a);
  if (this.es)
    if (i = this.ml0 + m / this.k0, a = Sl(i, this.es, this.en), Math.abs(a) < J) {
      var g = Math.sin(a), v = Math.cos(a), M = Math.abs(v) > st ? Math.tan(a) : 0, w = this.ep2 * Math.pow(v, 2), E = Math.pow(w, 2), k = Math.pow(M, 2), P = Math.pow(k, 2);
      i = 1 - this.es * Math.pow(g, 2);
      var C = _ * Math.sqrt(i) / this.k0, L = Math.pow(C, 2);
      i = i * M, l = a - i * L / (1 - this.es) * 0.5 * (1 - L / 12 * (5 + 3 * k - 9 * w * k + w - 4 * E - L / 30 * (61 + 90 * k - 252 * w * k + 45 * P + 46 * w - L / 56 * (1385 + 3633 * k + 4095 * P + 1574 * P * k)))), c = ut(this.long0 + C * (1 - L / 6 * (1 + 2 * k + w - L / 20 * (5 + 28 * k + 24 * P + 8 * w * k + 6 * w - L / 42 * (61 + 662 * k + 1320 * P + 720 * P * k)))) / v);
    } else
      l = J * Ra(m), c = 0;
  else {
    var D = Math.exp(_ / this.k0), B = 0.5 * (D - 1 / D), j = this.lat0 + m / this.k0, U = Math.cos(j);
    i = Math.sqrt((1 - Math.pow(U, 2)) / (1 + Math.pow(B, 2))), l = Math.asin(i), m < 0 && (l = -l), B === 0 && U === 0 ? c = 0 : c = ut(Math.atan2(B, U) + this.long0);
  }
  return n.x = c, n.y = l, n;
}
var i2 = ["Fast_Transverse_Mercator", "Fast Transverse Mercator"];
const fo = {
  init: t2,
  forward: e2,
  inverse: n2,
  names: i2
};
function qg(n) {
  var i = Math.exp(n);
  return i = (i - 1 / i) / 2, i;
}
function $e(n, i) {
  n = Math.abs(n), i = Math.abs(i);
  var a = Math.max(n, i), l = Math.min(n, i) / (a || 1);
  return a * Math.sqrt(1 + Math.pow(l, 2));
}
function r2(n) {
  var i = 1 + n, a = i - 1;
  return a === 0 ? n : n * Math.log(i) / a;
}
function s2(n) {
  var i = Math.abs(n);
  return i = r2(i * (1 + i / ($e(1, i) + 1))), n < 0 ? -i : i;
}
function Il(n, i) {
  for (var a = 2 * Math.cos(2 * i), l = n.length - 1, c = n[l], _ = 0, m; --l >= 0; )
    m = -_ + a * c + n[l], _ = c, c = m;
  return i + m * Math.sin(2 * i);
}
function a2(n, i) {
  for (var a = 2 * Math.cos(i), l = n.length - 1, c = n[l], _ = 0, m; --l >= 0; )
    m = -_ + a * c + n[l], _ = c, c = m;
  return Math.sin(i) * m;
}
function u2(n) {
  var i = Math.exp(n);
  return i = (i + 1 / i) / 2, i;
}
function Bg(n, i, a) {
  for (var l = Math.sin(i), c = Math.cos(i), _ = qg(a), m = u2(a), g = 2 * c * m, v = -2 * l * _, M = n.length - 1, w = n[M], E = 0, k = 0, P = 0, C, L; --M >= 0; )
    C = k, L = E, k = w, E = P, w = -C + g * k - v * E + n[M], P = -L + v * k + g * E;
  return g = l * m, v = c * _, [g * w - v * P, g * P + v * w];
}
function o2() {
  if (!this.approx && (isNaN(this.es) || this.es <= 0))
    throw new Error('Incorrect elliptical usage. Try using the +approx option in the proj string, or PROJECTION["Fast_Transverse_Mercator"] in the WKT.');
  this.approx && (fo.init.apply(this), this.forward = fo.forward, this.inverse = fo.inverse), this.x0 = this.x0 !== void 0 ? this.x0 : 0, this.y0 = this.y0 !== void 0 ? this.y0 : 0, this.long0 = this.long0 !== void 0 ? this.long0 : 0, this.lat0 = this.lat0 !== void 0 ? this.lat0 : 0, this.cgb = [], this.cbg = [], this.utg = [], this.gtu = [];
  var n = this.es / (1 + Math.sqrt(1 - this.es)), i = n / (2 - n), a = i;
  this.cgb[0] = i * (2 + i * (-2 / 3 + i * (-2 + i * (116 / 45 + i * (26 / 45 + i * (-2854 / 675)))))), this.cbg[0] = i * (-2 + i * (2 / 3 + i * (4 / 3 + i * (-82 / 45 + i * (32 / 45 + i * (4642 / 4725)))))), a = a * i, this.cgb[1] = a * (7 / 3 + i * (-8 / 5 + i * (-227 / 45 + i * (2704 / 315 + i * (2323 / 945))))), this.cbg[1] = a * (5 / 3 + i * (-16 / 15 + i * (-13 / 9 + i * (904 / 315 + i * (-1522 / 945))))), a = a * i, this.cgb[2] = a * (56 / 15 + i * (-136 / 35 + i * (-1262 / 105 + i * (73814 / 2835)))), this.cbg[2] = a * (-26 / 15 + i * (34 / 21 + i * (8 / 5 + i * (-12686 / 2835)))), a = a * i, this.cgb[3] = a * (4279 / 630 + i * (-332 / 35 + i * (-399572 / 14175))), this.cbg[3] = a * (1237 / 630 + i * (-12 / 5 + i * (-24832 / 14175))), a = a * i, this.cgb[4] = a * (4174 / 315 + i * (-144838 / 6237)), this.cbg[4] = a * (-734 / 315 + i * (109598 / 31185)), a = a * i, this.cgb[5] = a * (601676 / 22275), this.cbg[5] = a * (444337 / 155925), a = Math.pow(i, 2), this.Qn = this.k0 / (1 + i) * (1 + a * (1 / 4 + a * (1 / 64 + a / 256))), this.utg[0] = i * (-0.5 + i * (2 / 3 + i * (-37 / 96 + i * (1 / 360 + i * (81 / 512 + i * (-96199 / 604800)))))), this.gtu[0] = i * (0.5 + i * (-2 / 3 + i * (5 / 16 + i * (41 / 180 + i * (-127 / 288 + i * (7891 / 37800)))))), this.utg[1] = a * (-1 / 48 + i * (-1 / 15 + i * (437 / 1440 + i * (-46 / 105 + i * (1118711 / 3870720))))), this.gtu[1] = a * (13 / 48 + i * (-3 / 5 + i * (557 / 1440 + i * (281 / 630 + i * (-1983433 / 1935360))))), a = a * i, this.utg[2] = a * (-17 / 480 + i * (37 / 840 + i * (209 / 4480 + i * (-5569 / 90720)))), this.gtu[2] = a * (61 / 240 + i * (-103 / 140 + i * (15061 / 26880 + i * (167603 / 181440)))), a = a * i, this.utg[3] = a * (-4397 / 161280 + i * (11 / 504 + i * (830251 / 7257600))), this.gtu[3] = a * (49561 / 161280 + i * (-179 / 168 + i * (6601661 / 7257600))), a = a * i, this.utg[4] = a * (-4583 / 161280 + i * (108847 / 3991680)), this.gtu[4] = a * (34729 / 80640 + i * (-3418889 / 1995840)), a = a * i, this.utg[5] = a * (-20648693 / 638668800), this.gtu[5] = a * (212378941 / 319334400);
  var l = Il(this.cbg, this.lat0);
  this.Zb = -this.Qn * (l + a2(this.gtu, 2 * l));
}
function h2(n) {
  var i = ut(n.x - this.long0), a = n.y;
  a = Il(this.cbg, a);
  var l = Math.sin(a), c = Math.cos(a), _ = Math.sin(i), m = Math.cos(i);
  a = Math.atan2(l, m * c), i = Math.atan2(_ * c, $e(l, c * m)), i = s2(Math.tan(i));
  var g = Bg(this.gtu, 2 * a, 2 * i);
  a = a + g[0], i = i + g[1];
  var v, M;
  return Math.abs(i) <= 2.623395162778 ? (v = this.a * (this.Qn * i) + this.x0, M = this.a * (this.Qn * a + this.Zb) + this.y0) : (v = 1 / 0, M = 1 / 0), n.x = v, n.y = M, n;
}
function l2(n) {
  var i = (n.x - this.x0) * (1 / this.a), a = (n.y - this.y0) * (1 / this.a);
  a = (a - this.Zb) / this.Qn, i = i / this.Qn;
  var l, c;
  if (Math.abs(i) <= 2.623395162778) {
    var _ = Bg(this.utg, 2 * a, 2 * i);
    a = a + _[0], i = i + _[1], i = Math.atan(qg(i));
    var m = Math.sin(a), g = Math.cos(a), v = Math.sin(i), M = Math.cos(i);
    a = Math.atan2(m * M, $e(v, M * g)), i = Math.atan2(v, M * g), l = ut(i + this.long0), c = Il(this.cgb, a);
  } else
    l = 1 / 0, c = 1 / 0;
  return n.x = l, n.y = c, n;
}
var c2 = ["Extended_Transverse_Mercator", "Extended Transverse Mercator", "etmerc", "Transverse_Mercator", "Transverse Mercator", "Gauss Kruger", "Gauss_Kruger", "tmerc"];
const go = {
  init: o2,
  forward: h2,
  inverse: l2,
  names: c2
};
function f2(n, i) {
  if (n === void 0) {
    if (n = Math.floor((ut(i) + Math.PI) * 30 / Math.PI) + 1, n < 0)
      return 0;
    if (n > 60)
      return 60;
  }
  return n;
}
var g2 = "etmerc";
function d2() {
  var n = f2(this.zone, this.long0);
  if (n === void 0)
    throw new Error("unknown utm zone");
  this.lat0 = 0, this.long0 = (6 * Math.abs(n) - 183) * Ee, this.x0 = 5e5, this.y0 = this.utmSouth ? 1e7 : 0, this.k0 = 0.9996, go.init.apply(this), this.forward = go.forward, this.inverse = go.inverse;
}
var _2 = ["Universal Transverse Mercator System", "utm"];
const m2 = {
  init: d2,
  names: _2,
  dependsOn: g2
};
function Nl(n, i) {
  return Math.pow((1 - n) / (1 + n), i);
}
var y2 = 20;
function p2() {
  var n = Math.sin(this.lat0), i = Math.cos(this.lat0);
  i *= i, this.rc = Math.sqrt(1 - this.es) / (1 - this.es * n * n), this.C = Math.sqrt(1 + this.es * i * i / (1 - this.es)), this.phic0 = Math.asin(n / this.C), this.ratexp = 0.5 * this.C * this.e, this.K = Math.tan(0.5 * this.phic0 + jt) / (Math.pow(Math.tan(0.5 * this.lat0 + jt), this.C) * Nl(this.e * n, this.ratexp));
}
function v2(n) {
  var i = n.x, a = n.y;
  return n.y = 2 * Math.atan(this.K * Math.pow(Math.tan(0.5 * a + jt), this.C) * Nl(this.e * Math.sin(a), this.ratexp)) - J, n.x = this.C * i, n;
}
function x2(n) {
  for (var i = 1e-14, a = n.x / this.C, l = n.y, c = Math.pow(Math.tan(0.5 * l + jt) / this.K, 1 / this.C), _ = y2; _ > 0 && (l = 2 * Math.atan(c * Nl(this.e * Math.sin(n.y), -0.5 * this.e)) - J, !(Math.abs(l - n.y) < i)); --_)
    n.y = l;
  return _ ? (n.x = a, n.y = l, n) : null;
}
const bl = {
  init: p2,
  forward: v2,
  inverse: x2
};
function E2() {
  bl.init.apply(this), this.rc && (this.sinc0 = Math.sin(this.phic0), this.cosc0 = Math.cos(this.phic0), this.R2 = 2 * this.rc, this.title || (this.title = "Oblique Stereographic Alternative"));
}
function M2(n) {
  var i, a, l, c;
  return n.x = ut(n.x - this.long0), bl.forward.apply(this, [n]), i = Math.sin(n.y), a = Math.cos(n.y), l = Math.cos(n.x), c = this.k0 * this.R2 / (1 + this.sinc0 * i + this.cosc0 * a * l), n.x = c * a * Math.sin(n.x), n.y = c * (this.cosc0 * i - this.sinc0 * a * l), n.x = this.a * n.x + this.x0, n.y = this.a * n.y + this.y0, n;
}
function k2(n) {
  var i, a, l, c, _;
  if (n.x = (n.x - this.x0) / this.a, n.y = (n.y - this.y0) / this.a, n.x /= this.k0, n.y /= this.k0, _ = $e(n.x, n.y)) {
    var m = 2 * Math.atan2(_, this.R2);
    i = Math.sin(m), a = Math.cos(m), c = Math.asin(a * this.sinc0 + n.y * i * this.cosc0 / _), l = Math.atan2(n.x * i, _ * this.cosc0 * a - n.y * this.sinc0 * i);
  } else
    c = this.phic0, l = 0;
  return n.x = l, n.y = c, bl.inverse.apply(this, [n]), n.x = ut(n.x + this.long0), n;
}
var w2 = ["Stereographic_North_Pole", "Oblique_Stereographic", "sterea", "Oblique Stereographic Alternative", "Double_Stereographic"];
const S2 = {
  init: E2,
  forward: M2,
  inverse: k2,
  names: w2
};
function Cl(n, i, a) {
  return i *= a, Math.tan(0.5 * (J + n)) * Math.pow((1 - i) / (1 + i), 0.5 * a);
}
function I2() {
  this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.lat0 = this.lat0 || 0, this.long0 = this.long0 || 0, this.coslat0 = Math.cos(this.lat0), this.sinlat0 = Math.sin(this.lat0), this.sphere ? this.k0 === 1 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= st && (this.k0 = 0.5 * (1 + Ra(this.lat0) * Math.sin(this.lat_ts))) : (Math.abs(this.coslat0) <= st && (this.lat0 > 0 ? this.con = 1 : this.con = -1), this.cons = Math.sqrt(Math.pow(1 + this.e, 1 + this.e) * Math.pow(1 - this.e, 1 - this.e)), this.k0 === 1 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= st && Math.abs(Math.cos(this.lat_ts)) > st && (this.k0 = 0.5 * this.cons * Zn(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)) / Dn(this.e, this.con * this.lat_ts, this.con * Math.sin(this.lat_ts))), this.ms1 = Zn(this.e, this.sinlat0, this.coslat0), this.X0 = 2 * Math.atan(Cl(this.lat0, this.sinlat0, this.e)) - J, this.cosX0 = Math.cos(this.X0), this.sinX0 = Math.sin(this.X0));
}
function N2(n) {
  var i = n.x, a = n.y, l = Math.sin(a), c = Math.cos(a), _, m, g, v, M, w, E = ut(i - this.long0);
  return Math.abs(Math.abs(i - this.long0) - Math.PI) <= st && Math.abs(a + this.lat0) <= st ? (n.x = NaN, n.y = NaN, n) : this.sphere ? (_ = 2 * this.k0 / (1 + this.sinlat0 * l + this.coslat0 * c * Math.cos(E)), n.x = this.a * _ * c * Math.sin(E) + this.x0, n.y = this.a * _ * (this.coslat0 * l - this.sinlat0 * c * Math.cos(E)) + this.y0, n) : (m = 2 * Math.atan(Cl(a, l, this.e)) - J, v = Math.cos(m), g = Math.sin(m), Math.abs(this.coslat0) <= st ? (M = Dn(this.e, a * this.con, this.con * l), w = 2 * this.a * this.k0 * M / this.cons, n.x = this.x0 + w * Math.sin(i - this.long0), n.y = this.y0 - this.con * w * Math.cos(i - this.long0), n) : (Math.abs(this.sinlat0) < st ? (_ = 2 * this.a * this.k0 / (1 + v * Math.cos(E)), n.y = _ * g) : (_ = 2 * this.a * this.k0 * this.ms1 / (this.cosX0 * (1 + this.sinX0 * g + this.cosX0 * v * Math.cos(E))), n.y = _ * (this.cosX0 * g - this.sinX0 * v * Math.cos(E)) + this.y0), n.x = _ * v * Math.sin(E) + this.x0, n));
}
function b2(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i, a, l, c, _, m = Math.sqrt(n.x * n.x + n.y * n.y);
  if (this.sphere) {
    var g = 2 * Math.atan(m / (2 * this.a * this.k0));
    return i = this.long0, a = this.lat0, m <= st ? (n.x = i, n.y = a, n) : (a = Math.asin(Math.cos(g) * this.sinlat0 + n.y * Math.sin(g) * this.coslat0 / m), Math.abs(this.coslat0) < st ? this.lat0 > 0 ? i = ut(this.long0 + Math.atan2(n.x, -1 * n.y)) : i = ut(this.long0 + Math.atan2(n.x, n.y)) : i = ut(this.long0 + Math.atan2(n.x * Math.sin(g), m * this.coslat0 * Math.cos(g) - n.y * this.sinlat0 * Math.sin(g))), n.x = i, n.y = a, n);
  } else if (Math.abs(this.coslat0) <= st) {
    if (m <= st)
      return a = this.lat0, i = this.long0, n.x = i, n.y = a, n;
    n.x *= this.con, n.y *= this.con, l = m * this.cons / (2 * this.a * this.k0), a = this.con * ba(this.e, l), i = this.con * ut(this.con * this.long0 + Math.atan2(n.x, -1 * n.y));
  } else
    c = 2 * Math.atan(m * this.cosX0 / (2 * this.a * this.k0 * this.ms1)), i = this.long0, m <= st ? _ = this.X0 : (_ = Math.asin(Math.cos(c) * this.sinX0 + n.y * Math.sin(c) * this.cosX0 / m), i = ut(this.long0 + Math.atan2(n.x * Math.sin(c), m * this.cosX0 * Math.cos(c) - n.y * this.sinX0 * Math.sin(c)))), a = -1 * ba(this.e, Math.tan(0.5 * (J + _)));
  return n.x = i, n.y = a, n;
}
var C2 = ["stere", "Stereographic_South_Pole", "Polar_Stereographic_variant_A", "Polar_Stereographic_variant_B", "Polar_Stereographic"];
const P2 = {
  init: I2,
  forward: N2,
  inverse: b2,
  names: C2,
  ssfn_: Cl
};
function T2() {
  var n = this.lat0;
  this.lambda0 = this.long0;
  var i = Math.sin(n), a = this.a, l = this.rf, c = 1 / l, _ = 2 * c - Math.pow(c, 2), m = this.e = Math.sqrt(_);
  this.R = this.k0 * a * Math.sqrt(1 - _) / (1 - _ * Math.pow(i, 2)), this.alpha = Math.sqrt(1 + _ / (1 - _) * Math.pow(Math.cos(n), 4)), this.b0 = Math.asin(i / this.alpha);
  var g = Math.log(Math.tan(Math.PI / 4 + this.b0 / 2)), v = Math.log(Math.tan(Math.PI / 4 + n / 2)), M = Math.log((1 + m * i) / (1 - m * i));
  this.K = g - this.alpha * v + this.alpha * m / 2 * M;
}
function A2(n) {
  var i = Math.log(Math.tan(Math.PI / 4 - n.y / 2)), a = this.e / 2 * Math.log((1 + this.e * Math.sin(n.y)) / (1 - this.e * Math.sin(n.y))), l = -this.alpha * (i + a) + this.K, c = 2 * (Math.atan(Math.exp(l)) - Math.PI / 4), _ = this.alpha * (n.x - this.lambda0), m = Math.atan(Math.sin(_) / (Math.sin(this.b0) * Math.tan(c) + Math.cos(this.b0) * Math.cos(_))), g = Math.asin(Math.cos(this.b0) * Math.sin(c) - Math.sin(this.b0) * Math.cos(c) * Math.cos(_));
  return n.y = this.R / 2 * Math.log((1 + Math.sin(g)) / (1 - Math.sin(g))) + this.y0, n.x = this.R * m + this.x0, n;
}
function R2(n) {
  for (var i = n.x - this.x0, a = n.y - this.y0, l = i / this.R, c = 2 * (Math.atan(Math.exp(a / this.R)) - Math.PI / 4), _ = Math.asin(Math.cos(this.b0) * Math.sin(c) + Math.sin(this.b0) * Math.cos(c) * Math.cos(l)), m = Math.atan(Math.sin(l) / (Math.cos(this.b0) * Math.cos(l) - Math.sin(this.b0) * Math.tan(c))), g = this.lambda0 + m / this.alpha, v = 0, M = _, w = -1e3, E = 0; Math.abs(M - w) > 1e-7; ) {
    if (++E > 20)
      return;
    v = 1 / this.alpha * (Math.log(Math.tan(Math.PI / 4 + _ / 2)) - this.K) + this.e * Math.log(Math.tan(Math.PI / 4 + Math.asin(this.e * Math.sin(M)) / 2)), w = M, M = 2 * Math.atan(Math.exp(v)) - Math.PI / 2;
  }
  return n.x = g, n.y = M, n;
}
var O2 = ["somerc"];
const L2 = {
  init: T2,
  forward: A2,
  inverse: R2,
  names: O2
};
var Qr = 1e-7;
function G2(n) {
  var i = ["Hotine_Oblique_Mercator", "Hotine_Oblique_Mercator_variant_A", "Hotine_Oblique_Mercator_Azimuth_Natural_Origin"], a = typeof n.projName == "object" ? Object.keys(n.projName)[0] : n.projName;
  return "no_uoff" in n || "no_off" in n || i.indexOf(a) !== -1 || i.indexOf(bg(a)) !== -1;
}
function D2() {
  var n, i, a, l, c, _, m, g, v, M, w = 0, E, k = 0, P = 0, C = 0, L = 0, D = 0, B = 0;
  this.no_off = G2(this), this.no_rot = "no_rot" in this;
  var j = !1;
  "alpha" in this && (j = !0);
  var U = !1;
  if ("rectified_grid_angle" in this && (U = !0), j && (B = this.alpha), U && (w = this.rectified_grid_angle), j || U)
    k = this.longc;
  else if (P = this.long1, L = this.lat1, C = this.long2, D = this.lat2, Math.abs(L - D) <= Qr || (n = Math.abs(L)) <= Qr || Math.abs(n - J) <= Qr || Math.abs(Math.abs(this.lat0) - J) <= Qr || Math.abs(Math.abs(D) - J) <= Qr)
    throw new Error();
  var X = 1 - this.es;
  i = Math.sqrt(X), Math.abs(this.lat0) > st ? (g = Math.sin(this.lat0), a = Math.cos(this.lat0), n = 1 - this.es * g * g, this.B = a * a, this.B = Math.sqrt(1 + this.es * this.B * this.B / X), this.A = this.B * this.k0 * i / n, l = this.B * i / (a * Math.sqrt(n)), c = l * l - 1, c <= 0 ? c = 0 : (c = Math.sqrt(c), this.lat0 < 0 && (c = -c)), this.E = c += l, this.E *= Math.pow(Dn(this.e, this.lat0, g), this.B)) : (this.B = 1 / i, this.A = this.k0, this.E = l = c = 1), j || U ? (j ? (E = Math.asin(Math.sin(B) / l), U || (w = B)) : (E = w, B = Math.asin(l * Math.sin(E))), this.lam0 = k - Math.asin(0.5 * (c - 1 / c) * Math.tan(E)) / this.B) : (_ = Math.pow(Dn(this.e, L, Math.sin(L)), this.B), m = Math.pow(Dn(this.e, D, Math.sin(D)), this.B), c = this.E / _, v = (m - _) / (m + _), M = this.E * this.E, M = (M - m * _) / (M + m * _), n = P - C, n < -Math.PI ? C -= Ia : n > Math.PI && (C += Ia), this.lam0 = ut(0.5 * (P + C) - Math.atan(M * Math.tan(0.5 * this.B * (P - C)) / v) / this.B), E = Math.atan(2 * Math.sin(this.B * ut(P - this.lam0)) / (c - 1 / c)), w = B = Math.asin(l * Math.sin(E))), this.singam = Math.sin(E), this.cosgam = Math.cos(E), this.sinrot = Math.sin(w), this.cosrot = Math.cos(w), this.rB = 1 / this.B, this.ArB = this.A * this.rB, this.BrA = 1 / this.ArB, this.no_off ? this.u_0 = 0 : (this.u_0 = Math.abs(this.ArB * Math.atan(Math.sqrt(l * l - 1) / Math.cos(B))), this.lat0 < 0 && (this.u_0 = -this.u_0)), c = 0.5 * E, this.v_pole_n = this.ArB * Math.log(Math.tan(jt - c)), this.v_pole_s = this.ArB * Math.log(Math.tan(jt + c));
}
function F2(n) {
  var i = {}, a, l, c, _, m, g, v, M;
  if (n.x = n.x - this.lam0, Math.abs(Math.abs(n.y) - J) > st) {
    if (m = this.E / Math.pow(Dn(this.e, n.y, Math.sin(n.y)), this.B), g = 1 / m, a = 0.5 * (m - g), l = 0.5 * (m + g), _ = Math.sin(this.B * n.x), c = (a * this.singam - _ * this.cosgam) / l, Math.abs(Math.abs(c) - 1) < st)
      throw new Error();
    M = 0.5 * this.ArB * Math.log((1 - c) / (1 + c)), g = Math.cos(this.B * n.x), Math.abs(g) < Qr ? v = this.A * n.x : v = this.ArB * Math.atan2(a * this.cosgam + _ * this.singam, g);
  } else
    M = n.y > 0 ? this.v_pole_n : this.v_pole_s, v = this.ArB * n.y;
  return this.no_rot ? (i.x = v, i.y = M) : (v -= this.u_0, i.x = M * this.cosrot + v * this.sinrot, i.y = v * this.cosrot - M * this.sinrot), i.x = this.a * i.x + this.x0, i.y = this.a * i.y + this.y0, i;
}
function q2(n) {
  var i, a, l, c, _, m, g, v = {};
  if (n.x = (n.x - this.x0) * (1 / this.a), n.y = (n.y - this.y0) * (1 / this.a), this.no_rot ? (a = n.y, i = n.x) : (a = n.x * this.cosrot - n.y * this.sinrot, i = n.y * this.cosrot + n.x * this.sinrot + this.u_0), l = Math.exp(-this.BrA * a), c = 0.5 * (l - 1 / l), _ = 0.5 * (l + 1 / l), m = Math.sin(this.BrA * i), g = (m * this.cosgam + c * this.singam) / _, Math.abs(Math.abs(g) - 1) < st)
    v.x = 0, v.y = g < 0 ? -J : J;
  else {
    if (v.y = this.E / Math.sqrt((1 + g) / (1 - g)), v.y = ba(this.e, Math.pow(v.y, 1 / this.B)), v.y === 1 / 0)
      throw new Error();
    v.x = -this.rB * Math.atan2(c * this.cosgam - m * this.singam, Math.cos(this.BrA * i));
  }
  return v.x += this.lam0, v;
}
var B2 = ["Hotine_Oblique_Mercator", "Hotine Oblique Mercator", "Hotine_Oblique_Mercator_variant_A", "Hotine_Oblique_Mercator_Variant_B", "Hotine_Oblique_Mercator_Azimuth_Natural_Origin", "Hotine_Oblique_Mercator_Two_Point_Natural_Origin", "Hotine_Oblique_Mercator_Azimuth_Center", "Oblique_Mercator", "omerc"];
const z2 = {
  init: D2,
  forward: F2,
  inverse: q2,
  names: B2
};
function j2() {
  if (this.lat2 || (this.lat2 = this.lat1), this.k0 || (this.k0 = 1), this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, !(Math.abs(this.lat1 + this.lat2) < st)) {
    var n = this.b / this.a;
    this.e = Math.sqrt(1 - n * n);
    var i = Math.sin(this.lat1), a = Math.cos(this.lat1), l = Zn(this.e, i, a), c = Dn(this.e, this.lat1, i), _ = Math.sin(this.lat2), m = Math.cos(this.lat2), g = Zn(this.e, _, m), v = Dn(this.e, this.lat2, _), M = Math.abs(Math.abs(this.lat0) - J) < st ? 0 : Dn(this.e, this.lat0, Math.sin(this.lat0));
    Math.abs(this.lat1 - this.lat2) > st ? this.ns = Math.log(l / g) / Math.log(c / v) : this.ns = i, isNaN(this.ns) && (this.ns = i), this.f0 = l / (this.ns * Math.pow(c, this.ns)), this.rh = this.a * this.f0 * Math.pow(M, this.ns), this.title || (this.title = "Lambert Conformal Conic");
  }
}
function U2(n) {
  var i = n.x, a = n.y;
  Math.abs(2 * Math.abs(a) - Math.PI) <= st && (a = Ra(a) * (J - 2 * st));
  var l = Math.abs(Math.abs(a) - J), c, _;
  if (l > st)
    c = Dn(this.e, a, Math.sin(a)), _ = this.a * this.f0 * Math.pow(c, this.ns);
  else {
    if (l = a * this.ns, l <= 0)
      return null;
    _ = 0;
  }
  var m = this.ns * ut(i - this.long0);
  return n.x = this.k0 * (_ * Math.sin(m)) + this.x0, n.y = this.k0 * (this.rh - _ * Math.cos(m)) + this.y0, n;
}
function Y2(n) {
  var i, a, l, c, _, m = (n.x - this.x0) / this.k0, g = this.rh - (n.y - this.y0) / this.k0;
  this.ns > 0 ? (i = Math.sqrt(m * m + g * g), a = 1) : (i = -Math.sqrt(m * m + g * g), a = -1);
  var v = 0;
  if (i !== 0 && (v = Math.atan2(a * m, a * g)), i !== 0 || this.ns > 0) {
    if (a = 1 / this.ns, l = Math.pow(i / (this.a * this.f0), a), c = ba(this.e, l), c === -9999)
      return null;
  } else
    c = -J;
  return _ = ut(v / this.ns + this.long0), n.x = _, n.y = c, n;
}
var X2 = [
  "Lambert Tangential Conformal Conic Projection",
  "Lambert_Conformal_Conic",
  "Lambert_Conformal_Conic_1SP",
  "Lambert_Conformal_Conic_2SP",
  "lcc",
  "Lambert Conic Conformal (1SP)",
  "Lambert Conic Conformal (2SP)"
];
const V2 = {
  init: j2,
  forward: U2,
  inverse: Y2,
  names: X2
};
function W2() {
  this.a = 6377397155e-3, this.es = 0.006674372230614, this.e = Math.sqrt(this.es), this.lat0 || (this.lat0 = 0.863937979737193), this.long0 || (this.long0 = 0.7417649320975901 - 0.308341501185665), this.k0 || (this.k0 = 0.9999), this.s45 = 0.785398163397448, this.s90 = 2 * this.s45, this.fi0 = this.lat0, this.e2 = this.es, this.e = Math.sqrt(this.e2), this.alfa = Math.sqrt(1 + this.e2 * Math.pow(Math.cos(this.fi0), 4) / (1 - this.e2)), this.uq = 1.04216856380474, this.u0 = Math.asin(Math.sin(this.fi0) / this.alfa), this.g = Math.pow((1 + this.e * Math.sin(this.fi0)) / (1 - this.e * Math.sin(this.fi0)), this.alfa * this.e / 2), this.k = Math.tan(this.u0 / 2 + this.s45) / Math.pow(Math.tan(this.fi0 / 2 + this.s45), this.alfa) * this.g, this.k1 = this.k0, this.n0 = this.a * Math.sqrt(1 - this.e2) / (1 - this.e2 * Math.pow(Math.sin(this.fi0), 2)), this.s0 = 1.37008346281555, this.n = Math.sin(this.s0), this.ro0 = this.k1 * this.n0 / Math.tan(this.s0), this.ad = this.s90 - this.uq;
}
function H2(n) {
  var i, a, l, c, _, m, g, v = n.x, M = n.y, w = ut(v - this.long0);
  return i = Math.pow((1 + this.e * Math.sin(M)) / (1 - this.e * Math.sin(M)), this.alfa * this.e / 2), a = 2 * (Math.atan(this.k * Math.pow(Math.tan(M / 2 + this.s45), this.alfa) / i) - this.s45), l = -w * this.alfa, c = Math.asin(Math.cos(this.ad) * Math.sin(a) + Math.sin(this.ad) * Math.cos(a) * Math.cos(l)), _ = Math.asin(Math.cos(a) * Math.sin(l) / Math.cos(c)), m = this.n * _, g = this.ro0 * Math.pow(Math.tan(this.s0 / 2 + this.s45), this.n) / Math.pow(Math.tan(c / 2 + this.s45), this.n), n.y = g * Math.cos(m) / 1, n.x = g * Math.sin(m) / 1, this.czech || (n.y *= -1, n.x *= -1), n;
}
function K2(n) {
  var i, a, l, c, _, m, g, v, M = n.x;
  n.x = n.y, n.y = M, this.czech || (n.y *= -1, n.x *= -1), m = Math.sqrt(n.x * n.x + n.y * n.y), _ = Math.atan2(n.y, n.x), c = _ / Math.sin(this.s0), l = 2 * (Math.atan(Math.pow(this.ro0 / m, 1 / this.n) * Math.tan(this.s0 / 2 + this.s45)) - this.s45), i = Math.asin(Math.cos(this.ad) * Math.sin(l) - Math.sin(this.ad) * Math.cos(l) * Math.cos(c)), a = Math.asin(Math.cos(l) * Math.sin(c) / Math.cos(i)), n.x = this.long0 - a / this.alfa, g = i, v = 0;
  var w = 0;
  do
    n.y = 2 * (Math.atan(Math.pow(this.k, -1 / this.alfa) * Math.pow(Math.tan(i / 2 + this.s45), 1 / this.alfa) * Math.pow((1 + this.e * Math.sin(g)) / (1 - this.e * Math.sin(g)), this.e / 2)) - this.s45), Math.abs(g - n.y) < 1e-10 && (v = 1), g = n.y, w += 1;
  while (v === 0 && w < 15);
  return w >= 15 ? null : n;
}
var Z2 = ["Krovak", "krovak"];
const Q2 = {
  init: W2,
  forward: H2,
  inverse: K2,
  names: Z2
};
function Fe(n, i, a, l, c) {
  return n * c - i * Math.sin(2 * c) + a * Math.sin(4 * c) - l * Math.sin(6 * c);
}
function Oa(n) {
  return 1 - 0.25 * n * (1 + n / 16 * (3 + 1.25 * n));
}
function La(n) {
  return 0.375 * n * (1 + 0.25 * n * (1 + 0.46875 * n));
}
function Ga(n) {
  return 0.05859375 * n * n * (1 + 0.75 * n);
}
function Da(n) {
  return n * n * n * (35 / 3072);
}
function Pl(n, i, a) {
  var l = i * a;
  return n / Math.sqrt(1 - l * l);
}
function Yi(n) {
  return Math.abs(n) < J ? n : n - Ra(n) * Math.PI;
}
function Mo(n, i, a, l, c) {
  var _, m;
  _ = n / i;
  for (var g = 0; g < 15; g++)
    if (m = (n - (i * _ - a * Math.sin(2 * _) + l * Math.sin(4 * _) - c * Math.sin(6 * _))) / (i - 2 * a * Math.cos(2 * _) + 4 * l * Math.cos(4 * _) - 6 * c * Math.cos(6 * _)), _ += m, Math.abs(m) <= 1e-10)
      return _;
  return NaN;
}
function J2() {
  this.sphere || (this.e0 = Oa(this.es), this.e1 = La(this.es), this.e2 = Ga(this.es), this.e3 = Da(this.es), this.ml0 = this.a * Fe(this.e0, this.e1, this.e2, this.e3, this.lat0));
}
function $2(n) {
  var i, a, l = n.x, c = n.y;
  if (l = ut(l - this.long0), this.sphere)
    i = this.a * Math.asin(Math.cos(c) * Math.sin(l)), a = this.a * (Math.atan2(Math.tan(c), Math.cos(l)) - this.lat0);
  else {
    var _ = Math.sin(c), m = Math.cos(c), g = Pl(this.a, this.e, _), v = Math.tan(c) * Math.tan(c), M = l * Math.cos(c), w = M * M, E = this.es * m * m / (1 - this.es), k = this.a * Fe(this.e0, this.e1, this.e2, this.e3, c);
    i = g * M * (1 - w * v * (1 / 6 - (8 - v + 8 * E) * w / 120)), a = k - this.ml0 + g * _ / m * w * (0.5 + (5 - v + 6 * E) * w / 24);
  }
  return n.x = i + this.x0, n.y = a + this.y0, n;
}
function tx(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i = n.x / this.a, a = n.y / this.a, l, c;
  if (this.sphere) {
    var _ = a + this.lat0;
    l = Math.asin(Math.sin(_) * Math.cos(i)), c = Math.atan2(Math.tan(i), Math.cos(_));
  } else {
    var m = this.ml0 / this.a + a, g = Mo(m, this.e0, this.e1, this.e2, this.e3);
    if (Math.abs(Math.abs(g) - J) <= st)
      return n.x = this.long0, n.y = J, a < 0 && (n.y *= -1), n;
    var v = Pl(this.a, this.e, Math.sin(g)), M = v * v * v / this.a / this.a * (1 - this.es), w = Math.pow(Math.tan(g), 2), E = i * this.a / v, k = E * E;
    l = g - v * Math.tan(g) / M * E * E * (0.5 - (1 + 3 * w) * E * E / 24), c = E * (1 - k * (w / 3 + (1 + 3 * w) * w * k / 15)) / Math.cos(g);
  }
  return n.x = ut(c + this.long0), n.y = Yi(l), n;
}
var ex = ["Cassini", "Cassini_Soldner", "cass"];
const nx = {
  init: J2,
  forward: $2,
  inverse: tx,
  names: ex
};
function qi(n, i) {
  var a;
  return n > 1e-7 ? (a = n * i, (1 - n * n) * (i / (1 - a * a) - 0.5 / n * Math.log((1 - a) / (1 + a)))) : 2 * i;
}
var hl = 1, ll = 2, cl = 3, _o = 4;
function ix() {
  var n = Math.abs(this.lat0);
  if (Math.abs(n - J) < st ? this.mode = this.lat0 < 0 ? hl : ll : Math.abs(n) < st ? this.mode = cl : this.mode = _o, this.es > 0) {
    var i;
    switch (this.qp = qi(this.e, 1), this.mmf = 0.5 / (1 - this.es), this.apa = fx(this.es), this.mode) {
      case ll:
        this.dd = 1;
        break;
      case hl:
        this.dd = 1;
        break;
      case cl:
        this.rq = Math.sqrt(0.5 * this.qp), this.dd = 1 / this.rq, this.xmf = 1, this.ymf = 0.5 * this.qp;
        break;
      case _o:
        this.rq = Math.sqrt(0.5 * this.qp), i = Math.sin(this.lat0), this.sinb1 = qi(this.e, i) / this.qp, this.cosb1 = Math.sqrt(1 - this.sinb1 * this.sinb1), this.dd = Math.cos(this.lat0) / (Math.sqrt(1 - this.es * i * i) * this.rq * this.cosb1), this.ymf = (this.xmf = this.rq) / this.dd, this.xmf *= this.dd;
        break;
    }
  } else
    this.mode === _o && (this.sinph0 = Math.sin(this.lat0), this.cosph0 = Math.cos(this.lat0));
}
function rx(n) {
  var i, a, l, c, _, m, g, v, M, w, E = n.x, k = n.y;
  if (E = ut(E - this.long0), this.sphere) {
    if (_ = Math.sin(k), w = Math.cos(k), l = Math.cos(E), this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      if (a = this.mode === this.EQUIT ? 1 + w * l : 1 + this.sinph0 * _ + this.cosph0 * w * l, a <= st)
        return null;
      a = Math.sqrt(2 / a), i = a * w * Math.sin(E), a *= this.mode === this.EQUIT ? _ : this.cosph0 * _ - this.sinph0 * w * l;
    } else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
      if (this.mode === this.N_POLE && (l = -l), Math.abs(k + this.lat0) < st)
        return null;
      a = jt - k * 0.5, a = 2 * (this.mode === this.S_POLE ? Math.cos(a) : Math.sin(a)), i = a * Math.sin(E), a *= l;
    }
  } else {
    switch (g = 0, v = 0, M = 0, l = Math.cos(E), c = Math.sin(E), _ = Math.sin(k), m = qi(this.e, _), (this.mode === this.OBLIQ || this.mode === this.EQUIT) && (g = m / this.qp, v = Math.sqrt(1 - g * g)), this.mode) {
      case this.OBLIQ:
        M = 1 + this.sinb1 * g + this.cosb1 * v * l;
        break;
      case this.EQUIT:
        M = 1 + v * l;
        break;
      case this.N_POLE:
        M = J + k, m = this.qp - m;
        break;
      case this.S_POLE:
        M = k - J, m = this.qp + m;
        break;
    }
    if (Math.abs(M) < st)
      return null;
    switch (this.mode) {
      case this.OBLIQ:
      case this.EQUIT:
        M = Math.sqrt(2 / M), this.mode === this.OBLIQ ? a = this.ymf * M * (this.cosb1 * g - this.sinb1 * v * l) : a = (M = Math.sqrt(2 / (1 + v * l))) * g * this.ymf, i = this.xmf * M * v * c;
        break;
      case this.N_POLE:
      case this.S_POLE:
        m >= 0 ? (i = (M = Math.sqrt(m)) * c, a = l * (this.mode === this.S_POLE ? M : -M)) : i = a = 0;
        break;
    }
  }
  return n.x = this.a * i + this.x0, n.y = this.a * a + this.y0, n;
}
function sx(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i = n.x / this.a, a = n.y / this.a, l, c, _, m, g, v, M;
  if (this.sphere) {
    var w = 0, E, k = 0;
    if (E = Math.sqrt(i * i + a * a), c = E * 0.5, c > 1)
      return null;
    switch (c = 2 * Math.asin(c), (this.mode === this.OBLIQ || this.mode === this.EQUIT) && (k = Math.sin(c), w = Math.cos(c)), this.mode) {
      case this.EQUIT:
        c = Math.abs(E) <= st ? 0 : Math.asin(a * k / E), i *= k, a = w * E;
        break;
      case this.OBLIQ:
        c = Math.abs(E) <= st ? this.lat0 : Math.asin(w * this.sinph0 + a * k * this.cosph0 / E), i *= k * this.cosph0, a = (w - Math.sin(c) * this.sinph0) * E;
        break;
      case this.N_POLE:
        a = -a, c = J - c;
        break;
      case this.S_POLE:
        c -= J;
        break;
    }
    l = a === 0 && (this.mode === this.EQUIT || this.mode === this.OBLIQ) ? 0 : Math.atan2(i, a);
  } else {
    if (M = 0, this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      if (i /= this.dd, a *= this.dd, v = Math.sqrt(i * i + a * a), v < st)
        return n.x = this.long0, n.y = this.lat0, n;
      m = 2 * Math.asin(0.5 * v / this.rq), _ = Math.cos(m), i *= m = Math.sin(m), this.mode === this.OBLIQ ? (M = _ * this.sinb1 + a * m * this.cosb1 / v, g = this.qp * M, a = v * this.cosb1 * _ - a * this.sinb1 * m) : (M = a * m / v, g = this.qp * M, a = v * _);
    } else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
      if (this.mode === this.N_POLE && (a = -a), g = i * i + a * a, !g)
        return n.x = this.long0, n.y = this.lat0, n;
      M = 1 - g / this.qp, this.mode === this.S_POLE && (M = -M);
    }
    l = Math.atan2(i, a), c = gx(Math.asin(M), this.apa);
  }
  return n.x = ut(this.long0 + l), n.y = c, n;
}
var ax = 0.3333333333333333, ux = 0.17222222222222222, ox = 0.10257936507936508, hx = 0.06388888888888888, lx = 0.0664021164021164, cx = 0.016415012942191543;
function fx(n) {
  var i, a = [];
  return a[0] = n * ax, i = n * n, a[0] += i * ux, a[1] = i * hx, i *= n, a[0] += i * ox, a[1] += i * lx, a[2] = i * cx, a;
}
function gx(n, i) {
  var a = n + n;
  return n + i[0] * Math.sin(a) + i[1] * Math.sin(a + a) + i[2] * Math.sin(a + a + a);
}
var dx = ["Lambert Azimuthal Equal Area", "Lambert_Azimuthal_Equal_Area", "laea"];
const _x = {
  init: ix,
  forward: rx,
  inverse: sx,
  names: dx,
  S_POLE: hl,
  N_POLE: ll,
  EQUIT: cl,
  OBLIQ: _o
};
function zi(n) {
  return Math.abs(n) > 1 && (n = n > 1 ? 1 : -1), Math.asin(n);
}
function mx() {
  Math.abs(this.lat1 + this.lat2) < st || (this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e3 = Math.sqrt(this.es), this.sin_po = Math.sin(this.lat1), this.cos_po = Math.cos(this.lat1), this.t1 = this.sin_po, this.con = this.sin_po, this.ms1 = Zn(this.e3, this.sin_po, this.cos_po), this.qs1 = qi(this.e3, this.sin_po), this.sin_po = Math.sin(this.lat2), this.cos_po = Math.cos(this.lat2), this.t2 = this.sin_po, this.ms2 = Zn(this.e3, this.sin_po, this.cos_po), this.qs2 = qi(this.e3, this.sin_po), this.sin_po = Math.sin(this.lat0), this.cos_po = Math.cos(this.lat0), this.t3 = this.sin_po, this.qs0 = qi(this.e3, this.sin_po), Math.abs(this.lat1 - this.lat2) > st ? this.ns0 = (this.ms1 * this.ms1 - this.ms2 * this.ms2) / (this.qs2 - this.qs1) : this.ns0 = this.con, this.c = this.ms1 * this.ms1 + this.ns0 * this.qs1, this.rh = this.a * Math.sqrt(this.c - this.ns0 * this.qs0) / this.ns0);
}
function yx(n) {
  var i = n.x, a = n.y;
  this.sin_phi = Math.sin(a), this.cos_phi = Math.cos(a);
  var l = qi(this.e3, this.sin_phi), c = this.a * Math.sqrt(this.c - this.ns0 * l) / this.ns0, _ = this.ns0 * ut(i - this.long0), m = c * Math.sin(_) + this.x0, g = this.rh - c * Math.cos(_) + this.y0;
  return n.x = m, n.y = g, n;
}
function px(n) {
  var i, a, l, c, _, m;
  return n.x -= this.x0, n.y = this.rh - n.y + this.y0, this.ns0 >= 0 ? (i = Math.sqrt(n.x * n.x + n.y * n.y), l = 1) : (i = -Math.sqrt(n.x * n.x + n.y * n.y), l = -1), c = 0, i !== 0 && (c = Math.atan2(l * n.x, l * n.y)), l = i * this.ns0 / this.a, this.sphere ? m = Math.asin((this.c - l * l) / (2 * this.ns0)) : (a = (this.c - l * l) / this.ns0, m = this.phi1z(this.e3, a)), _ = ut(c / this.ns0 + this.long0), n.x = _, n.y = m, n;
}
function vx(n, i) {
  var a, l, c, _, m, g = zi(0.5 * i);
  if (n < st)
    return g;
  for (var v = n * n, M = 1; M <= 25; M++)
    if (a = Math.sin(g), l = Math.cos(g), c = n * a, _ = 1 - c * c, m = 0.5 * _ * _ / l * (i / (1 - v) - a / _ + 0.5 / n * Math.log((1 - c) / (1 + c))), g = g + m, Math.abs(m) <= 1e-7)
      return g;
  return null;
}
var xx = ["Albers_Conic_Equal_Area", "Albers_Equal_Area", "Albers", "aea"];
const Ex = {
  init: mx,
  forward: yx,
  inverse: px,
  names: xx,
  phi1z: vx
};
function Mx() {
  this.sin_p14 = Math.sin(this.lat0), this.cos_p14 = Math.cos(this.lat0), this.infinity_dist = 1e3 * this.a, this.rc = 1;
}
function kx(n) {
  var i, a, l, c, _, m, g, v, M = n.x, w = n.y;
  return l = ut(M - this.long0), i = Math.sin(w), a = Math.cos(w), c = Math.cos(l), m = this.sin_p14 * i + this.cos_p14 * a * c, _ = 1, m > 0 || Math.abs(m) <= st ? (g = this.x0 + this.a * _ * a * Math.sin(l) / m, v = this.y0 + this.a * _ * (this.cos_p14 * i - this.sin_p14 * a * c) / m) : (g = this.x0 + this.infinity_dist * a * Math.sin(l), v = this.y0 + this.infinity_dist * (this.cos_p14 * i - this.sin_p14 * a * c)), n.x = g, n.y = v, n;
}
function wx(n) {
  var i, a, l, c, _, m;
  return n.x = (n.x - this.x0) / this.a, n.y = (n.y - this.y0) / this.a, n.x /= this.k0, n.y /= this.k0, (i = Math.sqrt(n.x * n.x + n.y * n.y)) ? (c = Math.atan2(i, this.rc), a = Math.sin(c), l = Math.cos(c), m = zi(l * this.sin_p14 + n.y * a * this.cos_p14 / i), _ = Math.atan2(n.x * a, i * this.cos_p14 * l - n.y * this.sin_p14 * a), _ = ut(this.long0 + _)) : (m = this.phic0, _ = 0), n.x = _, n.y = m, n;
}
var Sx = ["gnom"];
const Ix = {
  init: Mx,
  forward: kx,
  inverse: wx,
  names: Sx
};
function Nx(n, i) {
  var a = 1 - (1 - n * n) / (2 * n) * Math.log((1 - n) / (1 + n));
  if (Math.abs(Math.abs(i) - a) < 1e-6)
    return i < 0 ? -1 * J : J;
  for (var l = Math.asin(0.5 * i), c, _, m, g, v = 0; v < 30; v++)
    if (_ = Math.sin(l), m = Math.cos(l), g = n * _, c = Math.pow(1 - g * g, 2) / (2 * m) * (i / (1 - n * n) - _ / (1 - g * g) + 0.5 / n * Math.log((1 - g) / (1 + g))), l += c, Math.abs(c) <= 1e-10)
      return l;
  return NaN;
}
function bx() {
  this.sphere || (this.k0 = Zn(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)));
}
function Cx(n) {
  var i = n.x, a = n.y, l, c, _ = ut(i - this.long0);
  if (this.sphere)
    l = this.x0 + this.a * _ * Math.cos(this.lat_ts), c = this.y0 + this.a * Math.sin(a) / Math.cos(this.lat_ts);
  else {
    var m = qi(this.e, Math.sin(a));
    l = this.x0 + this.a * this.k0 * _, c = this.y0 + this.a * m * 0.5 / this.k0;
  }
  return n.x = l, n.y = c, n;
}
function Px(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i, a;
  return this.sphere ? (i = ut(this.long0 + n.x / this.a / Math.cos(this.lat_ts)), a = Math.asin(n.y / this.a * Math.cos(this.lat_ts))) : (a = Nx(this.e, 2 * n.y * this.k0 / this.a), i = ut(this.long0 + n.x / (this.a * this.k0))), n.x = i, n.y = a, n;
}
var Tx = ["cea"];
const Ax = {
  init: bx,
  forward: Cx,
  inverse: Px,
  names: Tx
};
function Rx() {
  this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.lat0 = this.lat0 || 0, this.long0 = this.long0 || 0, this.lat_ts = this.lat_ts || 0, this.title = this.title || "Equidistant Cylindrical (Plate Carre)", this.rc = Math.cos(this.lat_ts);
}
function Ox(n) {
  var i = n.x, a = n.y, l = ut(i - this.long0), c = Yi(a - this.lat0);
  return n.x = this.x0 + this.a * l * this.rc, n.y = this.y0 + this.a * c, n;
}
function Lx(n) {
  var i = n.x, a = n.y;
  return n.x = ut(this.long0 + (i - this.x0) / (this.a * this.rc)), n.y = Yi(this.lat0 + (a - this.y0) / this.a), n;
}
var Gx = ["Equirectangular", "Equidistant_Cylindrical", "Equidistant_Cylindrical_Spherical", "eqc"];
const Dx = {
  init: Rx,
  forward: Ox,
  inverse: Lx,
  names: Gx
};
var Bf = 20;
function Fx() {
  this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e = Math.sqrt(this.es), this.e0 = Oa(this.es), this.e1 = La(this.es), this.e2 = Ga(this.es), this.e3 = Da(this.es), this.ml0 = this.a * Fe(this.e0, this.e1, this.e2, this.e3, this.lat0);
}
function qx(n) {
  var i = n.x, a = n.y, l, c, _, m = ut(i - this.long0);
  if (_ = m * Math.sin(a), this.sphere)
    Math.abs(a) <= st ? (l = this.a * m, c = -1 * this.a * this.lat0) : (l = this.a * Math.sin(_) / Math.tan(a), c = this.a * (Yi(a - this.lat0) + (1 - Math.cos(_)) / Math.tan(a)));
  else if (Math.abs(a) <= st)
    l = this.a * m, c = -1 * this.ml0;
  else {
    var g = Pl(this.a, this.e, Math.sin(a)) / Math.tan(a);
    l = g * Math.sin(_), c = this.a * Fe(this.e0, this.e1, this.e2, this.e3, a) - this.ml0 + g * (1 - Math.cos(_));
  }
  return n.x = l + this.x0, n.y = c + this.y0, n;
}
function Bx(n) {
  var i, a, l, c, _, m, g, v, M;
  if (l = n.x - this.x0, c = n.y - this.y0, this.sphere)
    if (Math.abs(c + this.a * this.lat0) <= st)
      i = ut(l / this.a + this.long0), a = 0;
    else {
      m = this.lat0 + c / this.a, g = l * l / this.a / this.a + m * m, v = m;
      var w;
      for (_ = Bf; _; --_)
        if (w = Math.tan(v), M = -1 * (m * (v * w + 1) - v - 0.5 * (v * v + g) * w) / ((v - m) / w - 1), v += M, Math.abs(M) <= st) {
          a = v;
          break;
        }
      i = ut(this.long0 + Math.asin(l * Math.tan(v) / this.a) / Math.sin(a));
    }
  else if (Math.abs(c + this.ml0) <= st)
    a = 0, i = ut(this.long0 + l / this.a);
  else {
    m = (this.ml0 + c) / this.a, g = l * l / this.a / this.a + m * m, v = m;
    var E, k, P, C, L;
    for (_ = Bf; _; --_)
      if (L = this.e * Math.sin(v), E = Math.sqrt(1 - L * L) * Math.tan(v), k = this.a * Fe(this.e0, this.e1, this.e2, this.e3, v), P = this.e0 - 2 * this.e1 * Math.cos(2 * v) + 4 * this.e2 * Math.cos(4 * v) - 6 * this.e3 * Math.cos(6 * v), C = k / this.a, M = (m * (E * C + 1) - C - 0.5 * E * (C * C + g)) / (this.es * Math.sin(2 * v) * (C * C + g - 2 * m * C) / (4 * E) + (m - C) * (E * P - 2 / Math.sin(2 * v)) - P), v -= M, Math.abs(M) <= st) {
        a = v;
        break;
      }
    E = Math.sqrt(1 - this.es * Math.pow(Math.sin(a), 2)) * Math.tan(a), i = ut(this.long0 + Math.asin(l * E / this.a) / Math.sin(a));
  }
  return n.x = i, n.y = a, n;
}
var zx = ["Polyconic", "American_Polyconic", "poly"];
const jx = {
  init: Fx,
  forward: qx,
  inverse: Bx,
  names: zx
};
function Ux() {
  this.A = [], this.A[1] = 0.6399175073, this.A[2] = -0.1358797613, this.A[3] = 0.063294409, this.A[4] = -0.02526853, this.A[5] = 0.0117879, this.A[6] = -55161e-7, this.A[7] = 26906e-7, this.A[8] = -1333e-6, this.A[9] = 67e-5, this.A[10] = -34e-5, this.B_re = [], this.B_im = [], this.B_re[1] = 0.7557853228, this.B_im[1] = 0, this.B_re[2] = 0.249204646, this.B_im[2] = 3371507e-9, this.B_re[3] = -1541739e-9, this.B_im[3] = 0.04105856, this.B_re[4] = -0.10162907, this.B_im[4] = 0.01727609, this.B_re[5] = -0.26623489, this.B_im[5] = -0.36249218, this.B_re[6] = -0.6870983, this.B_im[6] = -1.1651967, this.C_re = [], this.C_im = [], this.C_re[1] = 1.3231270439, this.C_im[1] = 0, this.C_re[2] = -0.577245789, this.C_im[2] = -7809598e-9, this.C_re[3] = 0.508307513, this.C_im[3] = -0.112208952, this.C_re[4] = -0.15094762, this.C_im[4] = 0.18200602, this.C_re[5] = 1.01418179, this.C_im[5] = 1.64497696, this.C_re[6] = 1.9660549, this.C_im[6] = 2.5127645, this.D = [], this.D[1] = 1.5627014243, this.D[2] = 0.5185406398, this.D[3] = -0.03333098, this.D[4] = -0.1052906, this.D[5] = -0.0368594, this.D[6] = 7317e-6, this.D[7] = 0.0122, this.D[8] = 394e-5, this.D[9] = -13e-4;
}
function Yx(n) {
  var i, a = n.x, l = n.y, c = l - this.lat0, _ = a - this.long0, m = c / xa * 1e-5, g = _, v = 1, M = 0;
  for (i = 1; i <= 10; i++)
    v = v * m, M = M + this.A[i] * v;
  var w = M, E = g, k = 1, P = 0, C, L, D = 0, B = 0;
  for (i = 1; i <= 6; i++)
    C = k * w - P * E, L = P * w + k * E, k = C, P = L, D = D + this.B_re[i] * k - this.B_im[i] * P, B = B + this.B_im[i] * k + this.B_re[i] * P;
  return n.x = B * this.a + this.x0, n.y = D * this.a + this.y0, n;
}
function Xx(n) {
  var i, a = n.x, l = n.y, c = a - this.x0, _ = l - this.y0, m = _ / this.a, g = c / this.a, v = 1, M = 0, w, E, k = 0, P = 0;
  for (i = 1; i <= 6; i++)
    w = v * m - M * g, E = M * m + v * g, v = w, M = E, k = k + this.C_re[i] * v - this.C_im[i] * M, P = P + this.C_im[i] * v + this.C_re[i] * M;
  for (var C = 0; C < this.iterations; C++) {
    var L = k, D = P, B, j, U = m, X = g;
    for (i = 2; i <= 6; i++)
      B = L * k - D * P, j = D * k + L * P, L = B, D = j, U = U + (i - 1) * (this.B_re[i] * L - this.B_im[i] * D), X = X + (i - 1) * (this.B_im[i] * L + this.B_re[i] * D);
    L = 1, D = 0;
    var Y = this.B_re[1], H = this.B_im[1];
    for (i = 2; i <= 6; i++)
      B = L * k - D * P, j = D * k + L * P, L = B, D = j, Y = Y + i * (this.B_re[i] * L - this.B_im[i] * D), H = H + i * (this.B_im[i] * L + this.B_re[i] * D);
    var Z = Y * Y + H * H;
    k = (U * Y + X * H) / Z, P = (X * Y - U * H) / Z;
  }
  var et = k, $ = P, dt = 1, _t = 0;
  for (i = 1; i <= 9; i++)
    dt = dt * et, _t = _t + this.D[i] * dt;
  var Mt = this.lat0 + _t * xa * 1e5, Ct = this.long0 + $;
  return n.x = Ct, n.y = Mt, n;
}
var Vx = ["New_Zealand_Map_Grid", "nzmg"];
const Wx = {
  init: Ux,
  forward: Yx,
  inverse: Xx,
  names: Vx
};
function Hx() {
}
function Kx(n) {
  var i = n.x, a = n.y, l = ut(i - this.long0), c = this.x0 + this.a * l, _ = this.y0 + this.a * Math.log(Math.tan(Math.PI / 4 + a / 2.5)) * 1.25;
  return n.x = c, n.y = _, n;
}
function Zx(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i = ut(this.long0 + n.x / this.a), a = 2.5 * (Math.atan(Math.exp(0.8 * n.y / this.a)) - Math.PI / 4);
  return n.x = i, n.y = a, n;
}
var Qx = ["Miller_Cylindrical", "mill"];
const Jx = {
  init: Hx,
  forward: Kx,
  inverse: Zx,
  names: Qx
};
var $x = 20;
function tE() {
  this.sphere ? (this.n = 1, this.m = 0, this.es = 0, this.C_y = Math.sqrt((this.m + 1) / this.n), this.C_x = this.C_y / (this.m + 1)) : this.en = wl(this.es);
}
function eE(n) {
  var i, a, l = n.x, c = n.y;
  if (l = ut(l - this.long0), this.sphere) {
    if (!this.m)
      c = this.n !== 1 ? Math.asin(this.n * Math.sin(c)) : c;
    else
      for (var _ = this.n * Math.sin(c), m = $x; m; --m) {
        var g = (this.m * c + Math.sin(c) - _) / (this.m + Math.cos(c));
        if (c -= g, Math.abs(g) < st)
          break;
      }
    i = this.a * this.C_x * l * (this.m + Math.cos(c)), a = this.a * this.C_y * c;
  } else {
    var v = Math.sin(c), M = Math.cos(c);
    a = this.a * cs(c, v, M, this.en), i = this.a * l * M / Math.sqrt(1 - this.es * v * v);
  }
  return n.x = i, n.y = a, n;
}
function nE(n) {
  var i, a, l, c;
  return n.x -= this.x0, l = n.x / this.a, n.y -= this.y0, i = n.y / this.a, this.sphere ? (i /= this.C_y, l = l / (this.C_x * (this.m + Math.cos(i))), this.m ? i = zi((this.m * i + Math.sin(i)) / this.n) : this.n !== 1 && (i = zi(Math.sin(i) / this.n)), l = ut(l + this.long0), i = Yi(i)) : (i = Sl(n.y / this.a, this.es, this.en), c = Math.abs(i), c < J ? (c = Math.sin(i), a = this.long0 + n.x * Math.sqrt(1 - this.es * c * c) / (this.a * Math.cos(i)), l = ut(a)) : c - st < J && (l = this.long0)), n.x = l, n.y = i, n;
}
var iE = ["Sinusoidal", "sinu"];
const rE = {
  init: tE,
  forward: eE,
  inverse: nE,
  names: iE
};
function sE() {
}
function aE(n) {
  for (var i = n.x, a = n.y, l = ut(i - this.long0), c = a, _ = Math.PI * Math.sin(a); ; ) {
    var m = -(c + Math.sin(c) - _) / (1 + Math.cos(c));
    if (c += m, Math.abs(m) < st)
      break;
  }
  c /= 2, Math.PI / 2 - Math.abs(a) < st && (l = 0);
  var g = 0.900316316158 * this.a * l * Math.cos(c) + this.x0, v = 1.4142135623731 * this.a * Math.sin(c) + this.y0;
  return n.x = g, n.y = v, n;
}
function uE(n) {
  var i, a;
  n.x -= this.x0, n.y -= this.y0, a = n.y / (1.4142135623731 * this.a), Math.abs(a) > 0.999999999999 && (a = 0.999999999999), i = Math.asin(a);
  var l = ut(this.long0 + n.x / (0.900316316158 * this.a * Math.cos(i)));
  l < -Math.PI && (l = -Math.PI), l > Math.PI && (l = Math.PI), a = (2 * i + Math.sin(2 * i)) / Math.PI, Math.abs(a) > 1 && (a = 1);
  var c = Math.asin(a);
  return n.x = l, n.y = c, n;
}
var oE = ["Mollweide", "moll"];
const hE = {
  init: sE,
  forward: aE,
  inverse: uE,
  names: oE
};
function lE() {
  Math.abs(this.lat1 + this.lat2) < st || (this.lat2 = this.lat2 || this.lat1, this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e = Math.sqrt(this.es), this.e0 = Oa(this.es), this.e1 = La(this.es), this.e2 = Ga(this.es), this.e3 = Da(this.es), this.sin_phi = Math.sin(this.lat1), this.cos_phi = Math.cos(this.lat1), this.ms1 = Zn(this.e, this.sin_phi, this.cos_phi), this.ml1 = Fe(this.e0, this.e1, this.e2, this.e3, this.lat1), Math.abs(this.lat1 - this.lat2) < st ? this.ns = this.sin_phi : (this.sin_phi = Math.sin(this.lat2), this.cos_phi = Math.cos(this.lat2), this.ms2 = Zn(this.e, this.sin_phi, this.cos_phi), this.ml2 = Fe(this.e0, this.e1, this.e2, this.e3, this.lat2), this.ns = (this.ms1 - this.ms2) / (this.ml2 - this.ml1)), this.g = this.ml1 + this.ms1 / this.ns, this.ml0 = Fe(this.e0, this.e1, this.e2, this.e3, this.lat0), this.rh = this.a * (this.g - this.ml0));
}
function cE(n) {
  var i = n.x, a = n.y, l;
  if (this.sphere)
    l = this.a * (this.g - a);
  else {
    var c = Fe(this.e0, this.e1, this.e2, this.e3, a);
    l = this.a * (this.g - c);
  }
  var _ = this.ns * ut(i - this.long0), m = this.x0 + l * Math.sin(_), g = this.y0 + this.rh - l * Math.cos(_);
  return n.x = m, n.y = g, n;
}
function fE(n) {
  n.x -= this.x0, n.y = this.rh - n.y + this.y0;
  var i, a, l, c;
  this.ns >= 0 ? (a = Math.sqrt(n.x * n.x + n.y * n.y), i = 1) : (a = -Math.sqrt(n.x * n.x + n.y * n.y), i = -1);
  var _ = 0;
  if (a !== 0 && (_ = Math.atan2(i * n.x, i * n.y)), this.sphere)
    return c = ut(this.long0 + _ / this.ns), l = Yi(this.g - a / this.a), n.x = c, n.y = l, n;
  var m = this.g - a / this.a;
  return l = Mo(m, this.e0, this.e1, this.e2, this.e3), c = ut(this.long0 + _ / this.ns), n.x = c, n.y = l, n;
}
var gE = ["Equidistant_Conic", "eqdc"];
const dE = {
  init: lE,
  forward: cE,
  inverse: fE,
  names: gE
};
function _E() {
  this.R = this.a;
}
function mE(n) {
  var i = n.x, a = n.y, l = ut(i - this.long0), c, _;
  Math.abs(a) <= st && (c = this.x0 + this.R * l, _ = this.y0);
  var m = zi(2 * Math.abs(a / Math.PI));
  (Math.abs(l) <= st || Math.abs(Math.abs(a) - J) <= st) && (c = this.x0, a >= 0 ? _ = this.y0 + Math.PI * this.R * Math.tan(0.5 * m) : _ = this.y0 + Math.PI * this.R * -Math.tan(0.5 * m));
  var g = 0.5 * Math.abs(Math.PI / l - l / Math.PI), v = g * g, M = Math.sin(m), w = Math.cos(m), E = w / (M + w - 1), k = E * E, P = E * (2 / M - 1), C = P * P, L = Math.PI * this.R * (g * (E - C) + Math.sqrt(v * (E - C) * (E - C) - (C + v) * (k - C))) / (C + v);
  l < 0 && (L = -L), c = this.x0 + L;
  var D = v + E;
  return L = Math.PI * this.R * (P * D - g * Math.sqrt((C + v) * (v + 1) - D * D)) / (C + v), a >= 0 ? _ = this.y0 + L : _ = this.y0 - L, n.x = c, n.y = _, n;
}
function yE(n) {
  var i, a, l, c, _, m, g, v, M, w, E, k, P;
  return n.x -= this.x0, n.y -= this.y0, E = Math.PI * this.R, l = n.x / E, c = n.y / E, _ = l * l + c * c, m = -Math.abs(c) * (1 + _), g = m - 2 * c * c + l * l, v = -2 * m + 1 + 2 * c * c + _ * _, P = c * c / v + (2 * g * g * g / v / v / v - 9 * m * g / v / v) / 27, M = (m - g * g / 3 / v) / v, w = 2 * Math.sqrt(-M / 3), E = 3 * P / M / w, Math.abs(E) > 1 && (E >= 0 ? E = 1 : E = -1), k = Math.acos(E) / 3, n.y >= 0 ? a = (-w * Math.cos(k + Math.PI / 3) - g / 3 / v) * Math.PI : a = -(-w * Math.cos(k + Math.PI / 3) - g / 3 / v) * Math.PI, Math.abs(l) < st ? i = this.long0 : i = ut(this.long0 + Math.PI * (_ - 1 + Math.sqrt(1 + 2 * (l * l - c * c) + _ * _)) / 2 / l), n.x = i, n.y = a, n;
}
var pE = ["Van_der_Grinten_I", "VanDerGrinten", "Van_der_Grinten", "vandg"];
const vE = {
  init: _E,
  forward: mE,
  inverse: yE,
  names: pE
};
function xE(n, i, a, l, c, _) {
  const m = l - i, g = Math.atan((1 - _) * Math.tan(n)), v = Math.atan((1 - _) * Math.tan(a)), M = Math.sin(g), w = Math.cos(g), E = Math.sin(v), k = Math.cos(v);
  let P = m, C, L = 100, D, B, j, U, X, Y, H, Z, et, $, dt, _t, Mt, Ct;
  do {
    if (D = Math.sin(P), B = Math.cos(P), j = Math.sqrt(
      k * D * (k * D) + (w * E - M * k * B) * (w * E - M * k * B)
    ), j === 0)
      return { azi1: 0, s12: 0 };
    U = M * E + w * k * B, X = Math.atan2(j, U), Y = w * k * D / j, H = 1 - Y * Y, Z = H !== 0 ? U - 2 * M * E / H : 0, et = _ / 16 * H * (4 + _ * (4 - 3 * H)), C = P, P = m + (1 - et) * _ * Y * (X + et * j * (Z + et * U * (-1 + 2 * Z * Z)));
  } while (Math.abs(P - C) > 1e-12 && --L > 0);
  return L === 0 ? { azi1: NaN, s12: NaN } : ($ = H * (c * c - c * (1 - _) * (c * (1 - _))) / (c * (1 - _) * (c * (1 - _))), dt = 1 + $ / 16384 * (4096 + $ * (-768 + $ * (320 - 175 * $))), _t = $ / 1024 * (256 + $ * (-128 + $ * (74 - 47 * $))), Mt = _t * j * (Z + _t / 4 * (U * (-1 + 2 * Z * Z) - _t / 6 * Z * (-3 + 4 * j * j) * (-3 + 4 * Z * Z))), Ct = c * (1 - _) * dt * (X - Mt), { azi1: Math.atan2(k * D, w * E - M * k * B), s12: Ct });
}
function EE(n, i, a, l, c, _) {
  const m = Math.atan((1 - _) * Math.tan(n)), g = Math.sin(m), v = Math.cos(m), M = Math.sin(a), w = Math.cos(a), E = Math.atan2(g, v * w), k = v * M, P = 1 - k * k, C = P * (c * c - c * (1 - _) * (c * (1 - _))) / (c * (1 - _) * (c * (1 - _))), L = 1 + C / 16384 * (4096 + C * (-768 + C * (320 - 175 * C))), D = C / 1024 * (256 + C * (-128 + C * (74 - 47 * C)));
  let B = l / (c * (1 - _) * L), j, U = 100, X, Y, H, Z;
  do
    X = Math.cos(2 * E + B), Y = Math.sin(B), H = Math.cos(B), Z = D * Y * (X + D / 4 * (H * (-1 + 2 * X * X) - D / 6 * X * (-3 + 4 * Y * Y) * (-3 + 4 * X * X))), j = B, B = l / (c * (1 - _) * L) + Z;
  while (Math.abs(B - j) > 1e-12 && --U > 0);
  if (U === 0)
    return { lat2: NaN, lon2: NaN };
  const et = g * Y - v * H * w, $ = Math.atan2(
    g * H + v * Y * w,
    (1 - _) * Math.sqrt(k * k + et * et)
  ), dt = Math.atan2(
    Y * M,
    v * H - g * Y * w
  ), _t = _ / 16 * P * (4 + _ * (4 - 3 * P)), Mt = dt - (1 - _t) * _ * k * (B + _t * Y * (X + _t * H * (-1 + 2 * X * X))), Ct = i + Mt;
  return { lat2: $, lon2: Ct };
}
function ME() {
  this.sin_p12 = Math.sin(this.lat0), this.cos_p12 = Math.cos(this.lat0), this.f = this.es / (1 + Math.sqrt(1 - this.es));
}
function kE(n) {
  var i = n.x, a = n.y, l = Math.sin(n.y), c = Math.cos(n.y), _ = ut(i - this.long0), m, g, v, M, w, E, k, P, C, L, D;
  return this.sphere ? Math.abs(this.sin_p12 - 1) <= st ? (n.x = this.x0 + this.a * (J - a) * Math.sin(_), n.y = this.y0 - this.a * (J - a) * Math.cos(_), n) : Math.abs(this.sin_p12 + 1) <= st ? (n.x = this.x0 + this.a * (J + a) * Math.sin(_), n.y = this.y0 + this.a * (J + a) * Math.cos(_), n) : (C = this.sin_p12 * l + this.cos_p12 * c * Math.cos(_), k = Math.acos(C), P = k ? k / Math.sin(k) : 1, n.x = this.x0 + this.a * P * c * Math.sin(_), n.y = this.y0 + this.a * P * (this.cos_p12 * l - this.sin_p12 * c * Math.cos(_)), n) : (m = Oa(this.es), g = La(this.es), v = Ga(this.es), M = Da(this.es), Math.abs(this.sin_p12 - 1) <= st ? (w = this.a * Fe(m, g, v, M, J), E = this.a * Fe(m, g, v, M, a), n.x = this.x0 + (w - E) * Math.sin(_), n.y = this.y0 - (w - E) * Math.cos(_), n) : Math.abs(this.sin_p12 + 1) <= st ? (w = this.a * Fe(m, g, v, M, J), E = this.a * Fe(m, g, v, M, a), n.x = this.x0 + (w + E) * Math.sin(_), n.y = this.y0 + (w + E) * Math.cos(_), n) : Math.abs(i) < st && Math.abs(a - this.lat0) < st ? (n.x = n.y = 0, n) : (L = xE(this.lat0, this.long0, a, i, this.a, this.f), D = L.azi1, n.x = L.s12 * Math.sin(D), n.y = L.s12 * Math.cos(D), n));
}
function wE(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i, a, l, c, _, m, g, v, M, w, E, k, P, C, L, D;
  return this.sphere ? (i = Math.sqrt(n.x * n.x + n.y * n.y), i > 2 * J * this.a ? void 0 : (a = i / this.a, l = Math.sin(a), c = Math.cos(a), _ = this.long0, Math.abs(i) <= st ? m = this.lat0 : (m = zi(c * this.sin_p12 + n.y * l * this.cos_p12 / i), g = Math.abs(this.lat0) - J, Math.abs(g) <= st ? this.lat0 >= 0 ? _ = ut(this.long0 + Math.atan2(n.x, -n.y)) : _ = ut(this.long0 - Math.atan2(-n.x, n.y)) : _ = ut(this.long0 + Math.atan2(n.x * l, i * this.cos_p12 * c - n.y * this.sin_p12 * l))), n.x = _, n.y = m, n)) : (v = Oa(this.es), M = La(this.es), w = Ga(this.es), E = Da(this.es), Math.abs(this.sin_p12 - 1) <= st ? (k = this.a * Fe(v, M, w, E, J), i = Math.sqrt(n.x * n.x + n.y * n.y), P = k - i, m = Mo(P / this.a, v, M, w, E), _ = ut(this.long0 + Math.atan2(n.x, -1 * n.y)), n.x = _, n.y = m, n) : Math.abs(this.sin_p12 + 1) <= st ? (k = this.a * Fe(v, M, w, E, J), i = Math.sqrt(n.x * n.x + n.y * n.y), P = i - k, m = Mo(P / this.a, v, M, w, E), _ = ut(this.long0 + Math.atan2(n.x, n.y)), n.x = _, n.y = m, n) : (C = Math.atan2(n.x, n.y), L = Math.sqrt(n.x * n.x + n.y * n.y), D = EE(this.lat0, this.long0, C, L, this.a, this.f), n.x = D.lon2, n.y = D.lat2, n));
}
var SE = ["Azimuthal_Equidistant", "aeqd"];
const IE = {
  init: ME,
  forward: kE,
  inverse: wE,
  names: SE
};
function NE() {
  this.sin_p14 = Math.sin(this.lat0), this.cos_p14 = Math.cos(this.lat0);
}
function bE(n) {
  var i, a, l, c, _, m, g, v, M = n.x, w = n.y;
  return l = ut(M - this.long0), i = Math.sin(w), a = Math.cos(w), c = Math.cos(l), m = this.sin_p14 * i + this.cos_p14 * a * c, _ = 1, (m > 0 || Math.abs(m) <= st) && (g = this.a * _ * a * Math.sin(l), v = this.y0 + this.a * _ * (this.cos_p14 * i - this.sin_p14 * a * c)), n.x = g, n.y = v, n;
}
function CE(n) {
  var i, a, l, c, _, m, g;
  return n.x -= this.x0, n.y -= this.y0, i = Math.sqrt(n.x * n.x + n.y * n.y), a = zi(i / this.a), l = Math.sin(a), c = Math.cos(a), m = this.long0, Math.abs(i) <= st ? (g = this.lat0, n.x = m, n.y = g, n) : (g = zi(c * this.sin_p14 + n.y * l * this.cos_p14 / i), _ = Math.abs(this.lat0) - J, Math.abs(_) <= st ? (this.lat0 >= 0 ? m = ut(this.long0 + Math.atan2(n.x, -n.y)) : m = ut(this.long0 - Math.atan2(-n.x, n.y)), n.x = m, n.y = g, n) : (m = ut(this.long0 + Math.atan2(n.x * l, i * this.cos_p14 * c - n.y * this.sin_p14 * l)), n.x = m, n.y = g, n));
}
var PE = ["ortho"];
const TE = {
  init: NE,
  forward: bE,
  inverse: CE,
  names: PE
};
var $t = {
  FRONT: 1,
  RIGHT: 2,
  BACK: 3,
  LEFT: 4,
  TOP: 5,
  BOTTOM: 6
}, Ut = {
  AREA_0: 1,
  AREA_1: 2,
  AREA_2: 3,
  AREA_3: 4
};
function AE() {
  this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.lat0 = this.lat0 || 0, this.long0 = this.long0 || 0, this.lat_ts = this.lat_ts || 0, this.title = this.title || "Quadrilateralized Spherical Cube", this.lat0 >= J - jt / 2 ? this.face = $t.TOP : this.lat0 <= -(J - jt / 2) ? this.face = $t.BOTTOM : Math.abs(this.long0) <= jt ? this.face = $t.FRONT : Math.abs(this.long0) <= J + jt ? this.face = this.long0 > 0 ? $t.RIGHT : $t.LEFT : this.face = $t.BACK, this.es !== 0 && (this.one_minus_f = 1 - (this.a - this.b) / this.a, this.one_minus_f_squared = this.one_minus_f * this.one_minus_f);
}
function RE(n) {
  var i = { x: 0, y: 0 }, a, l, c, _, m, g, v = { value: 0 };
  if (n.x -= this.long0, this.es !== 0 ? a = Math.atan(this.one_minus_f_squared * Math.tan(n.y)) : a = n.y, l = n.x, this.face === $t.TOP)
    _ = J - a, l >= jt && l <= J + jt ? (v.value = Ut.AREA_0, c = l - J) : l > J + jt || l <= -(J + jt) ? (v.value = Ut.AREA_1, c = l > 0 ? l - oe : l + oe) : l > -(J + jt) && l <= -jt ? (v.value = Ut.AREA_2, c = l + J) : (v.value = Ut.AREA_3, c = l);
  else if (this.face === $t.BOTTOM)
    _ = J + a, l >= jt && l <= J + jt ? (v.value = Ut.AREA_0, c = -l + J) : l < jt && l >= -jt ? (v.value = Ut.AREA_1, c = -l) : l < -jt && l >= -(J + jt) ? (v.value = Ut.AREA_2, c = -l - J) : (v.value = Ut.AREA_3, c = l > 0 ? -l + oe : -l - oe);
  else {
    var M, w, E, k, P, C, L;
    this.face === $t.RIGHT ? l = rs(l, +J) : this.face === $t.BACK ? l = rs(l, +oe) : this.face === $t.LEFT && (l = rs(l, -J)), k = Math.sin(a), P = Math.cos(a), C = Math.sin(l), L = Math.cos(l), M = P * L, w = P * C, E = k, this.face === $t.FRONT ? (_ = Math.acos(M), c = Qu(_, E, w, v)) : this.face === $t.RIGHT ? (_ = Math.acos(w), c = Qu(_, E, -M, v)) : this.face === $t.BACK ? (_ = Math.acos(-M), c = Qu(_, E, -w, v)) : this.face === $t.LEFT ? (_ = Math.acos(-w), c = Qu(_, E, M, v)) : (_ = c = 0, v.value = Ut.AREA_0);
  }
  return g = Math.atan(12 / oe * (c + Math.acos(Math.sin(c) * Math.cos(jt)) - J)), m = Math.sqrt((1 - Math.cos(_)) / (Math.cos(g) * Math.cos(g)) / (1 - Math.cos(Math.atan(1 / Math.cos(c))))), v.value === Ut.AREA_1 ? g += J : v.value === Ut.AREA_2 ? g += oe : v.value === Ut.AREA_3 && (g += 1.5 * oe), i.x = m * Math.cos(g), i.y = m * Math.sin(g), i.x = i.x * this.a + this.x0, i.y = i.y * this.a + this.y0, n.x = i.x, n.y = i.y, n;
}
function OE(n) {
  var i = { lam: 0, phi: 0 }, a, l, c, _, m, g, v, M, w, E = { value: 0 };
  if (n.x = (n.x - this.x0) / this.a, n.y = (n.y - this.y0) / this.a, l = Math.atan(Math.sqrt(n.x * n.x + n.y * n.y)), a = Math.atan2(n.y, n.x), n.x >= 0 && n.x >= Math.abs(n.y) ? E.value = Ut.AREA_0 : n.y >= 0 && n.y >= Math.abs(n.x) ? (E.value = Ut.AREA_1, a -= J) : n.x < 0 && -n.x >= Math.abs(n.y) ? (E.value = Ut.AREA_2, a = a < 0 ? a + oe : a - oe) : (E.value = Ut.AREA_3, a += J), w = oe / 12 * Math.tan(a), m = Math.sin(w) / (Math.cos(w) - 1 / Math.sqrt(2)), g = Math.atan(m), c = Math.cos(a), _ = Math.tan(l), v = 1 - c * c * _ * _ * (1 - Math.cos(Math.atan(1 / Math.cos(g)))), v < -1 ? v = -1 : v > 1 && (v = 1), this.face === $t.TOP)
    M = Math.acos(v), i.phi = J - M, E.value === Ut.AREA_0 ? i.lam = g + J : E.value === Ut.AREA_1 ? i.lam = g < 0 ? g + oe : g - oe : E.value === Ut.AREA_2 ? i.lam = g - J : i.lam = g;
  else if (this.face === $t.BOTTOM)
    M = Math.acos(v), i.phi = M - J, E.value === Ut.AREA_0 ? i.lam = -g + J : E.value === Ut.AREA_1 ? i.lam = -g : E.value === Ut.AREA_2 ? i.lam = -g - J : i.lam = g < 0 ? -g - oe : -g + oe;
  else {
    var k, P, C;
    k = v, w = k * k, w >= 1 ? C = 0 : C = Math.sqrt(1 - w) * Math.sin(g), w += C * C, w >= 1 ? P = 0 : P = Math.sqrt(1 - w), E.value === Ut.AREA_1 ? (w = P, P = -C, C = w) : E.value === Ut.AREA_2 ? (P = -P, C = -C) : E.value === Ut.AREA_3 && (w = P, P = C, C = -w), this.face === $t.RIGHT ? (w = k, k = -P, P = w) : this.face === $t.BACK ? (k = -k, P = -P) : this.face === $t.LEFT && (w = k, k = P, P = -w), i.phi = Math.acos(-C) - J, i.lam = Math.atan2(P, k), this.face === $t.RIGHT ? i.lam = rs(i.lam, -J) : this.face === $t.BACK ? i.lam = rs(i.lam, -oe) : this.face === $t.LEFT && (i.lam = rs(i.lam, +J));
  }
  if (this.es !== 0) {
    var L, D, B;
    L = i.phi < 0 ? 1 : 0, D = Math.tan(i.phi), B = this.b / Math.sqrt(D * D + this.one_minus_f_squared), i.phi = Math.atan(Math.sqrt(this.a * this.a - B * B) / (this.one_minus_f * B)), L && (i.phi = -i.phi);
  }
  return i.lam += this.long0, n.x = i.lam, n.y = i.phi, n;
}
function Qu(n, i, a, l) {
  var c;
  return n < st ? (l.value = Ut.AREA_0, c = 0) : (c = Math.atan2(i, a), Math.abs(c) <= jt ? l.value = Ut.AREA_0 : c > jt && c <= J + jt ? (l.value = Ut.AREA_1, c -= J) : c > J + jt || c <= -(J + jt) ? (l.value = Ut.AREA_2, c = c >= 0 ? c - oe : c + oe) : (l.value = Ut.AREA_3, c += J)), c;
}
function rs(n, i) {
  var a = n + i;
  return a < -oe ? a += Ia : a > +oe && (a -= Ia), a;
}
var LE = ["Quadrilateralized Spherical Cube", "Quadrilateralized_Spherical_Cube", "qsc"];
const GE = {
  init: AE,
  forward: RE,
  inverse: OE,
  names: LE
};
var fl = [
  [1, 22199e-21, -715515e-10, 31103e-10],
  [0.9986, -482243e-9, -24897e-9, -13309e-10],
  [0.9954, -83103e-8, -448605e-10, -986701e-12],
  [0.99, -135364e-8, -59661e-9, 36777e-10],
  [0.9822, -167442e-8, -449547e-11, -572411e-11],
  [0.973, -214868e-8, -903571e-10, 18736e-12],
  [0.96, -305085e-8, -900761e-10, 164917e-11],
  [0.9427, -382792e-8, -653386e-10, -26154e-10],
  [0.9216, -467746e-8, -10457e-8, 481243e-11],
  [0.8962, -536223e-8, -323831e-10, -543432e-11],
  [0.8679, -609363e-8, -113898e-9, 332484e-11],
  [0.835, -698325e-8, -640253e-10, 934959e-12],
  [0.7986, -755338e-8, -500009e-10, 935324e-12],
  [0.7597, -798324e-8, -35971e-9, -227626e-11],
  [0.7186, -851367e-8, -701149e-10, -86303e-10],
  [0.6732, -986209e-8, -199569e-9, 191974e-10],
  [0.6213, -0.010418, 883923e-10, 624051e-11],
  [0.5722, -906601e-8, 182e-6, 624051e-11],
  [0.5322, -677797e-8, 275608e-9, 624051e-11]
], _a = [
  [-520417e-23, 0.0124, 121431e-23, -845284e-16],
  [0.062, 0.0124, -126793e-14, 422642e-15],
  [0.124, 0.0124, 507171e-14, -160604e-14],
  [0.186, 0.0123999, -190189e-13, 600152e-14],
  [0.248, 0.0124002, 710039e-13, -224e-10],
  [0.31, 0.0123992, -264997e-12, 835986e-13],
  [0.372, 0.0124029, 988983e-12, -311994e-12],
  [0.434, 0.0123893, -369093e-11, -435621e-12],
  [0.4958, 0.0123198, -102252e-10, -345523e-12],
  [0.5571, 0.0121916, -154081e-10, -582288e-12],
  [0.6176, 0.0119938, -241424e-10, -525327e-12],
  [0.6769, 0.011713, -320223e-10, -516405e-12],
  [0.7346, 0.0113541, -397684e-10, -609052e-12],
  [0.7903, 0.0109107, -489042e-10, -104739e-11],
  [0.8435, 0.0103431, -64615e-9, -140374e-14],
  [0.8936, 969686e-8, -64636e-9, -8547e-9],
  [0.9394, 840947e-8, -192841e-9, -42106e-10],
  [0.9761, 616527e-8, -256e-6, -42106e-10],
  [1, 328947e-8, -319159e-9, -42106e-10]
], zg = 0.8487, jg = 1.3523, Ug = Wn / 5, DE = 1 / Ug, es = 18, ko = function(n, i) {
  return n[0] + i * (n[1] + i * (n[2] + i * n[3]));
}, FE = function(n, i) {
  return n[1] + i * (2 * n[2] + i * 3 * n[3]);
};
function qE(n, i, a, l) {
  for (var c = i; l; --l) {
    var _ = n(c);
    if (c -= _, Math.abs(_) < a)
      break;
  }
  return c;
}
function BE() {
  this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.long0 = this.long0 || 0, this.es = 0, this.title = this.title || "Robinson";
}
function zE(n) {
  var i = ut(n.x - this.long0), a = Math.abs(n.y), l = Math.floor(a * Ug);
  l < 0 ? l = 0 : l >= es && (l = es - 1), a = Wn * (a - DE * l);
  var c = {
    x: ko(fl[l], a) * i,
    y: ko(_a[l], a)
  };
  return n.y < 0 && (c.y = -c.y), c.x = c.x * this.a * zg + this.x0, c.y = c.y * this.a * jg + this.y0, c;
}
function jE(n) {
  var i = {
    x: (n.x - this.x0) / (this.a * zg),
    y: Math.abs(n.y - this.y0) / (this.a * jg)
  };
  if (i.y >= 1)
    i.x /= fl[es][0], i.y = n.y < 0 ? -J : J;
  else {
    var a = Math.floor(i.y * es);
    for (a < 0 ? a = 0 : a >= es && (a = es - 1); ; )
      if (_a[a][0] > i.y)
        --a;
      else if (_a[a + 1][0] <= i.y)
        ++a;
      else
        break;
    var l = _a[a], c = 5 * (i.y - l[0]) / (_a[a + 1][0] - l[0]);
    c = qE(function(_) {
      return (ko(l, _) - i.y) / FE(l, _);
    }, c, st, 100), i.x /= ko(fl[a], c), i.y = (5 * a + c) * Ee, n.y < 0 && (i.y = -i.y);
  }
  return i.x = ut(i.x + this.long0), i;
}
var UE = ["Robinson", "robin"];
const YE = {
  init: BE,
  forward: zE,
  inverse: jE,
  names: UE
};
function XE() {
  this.name = "geocent";
}
function VE(n) {
  var i = Pg(n, this.es, this.a);
  return i;
}
function WE(n) {
  var i = Tg(n, this.es, this.a, this.b);
  return i;
}
var HE = ["Geocentric", "geocentric", "geocent", "Geocent"];
const KE = {
  init: XE,
  forward: VE,
  inverse: WE,
  names: HE
};
var be = {
  N_POLE: 0,
  S_POLE: 1,
  EQUIT: 2,
  OBLIQ: 3
}, ca = {
  h: { def: 1e5, num: !0 },
  // default is Karman line, no default in PROJ.7
  azi: { def: 0, num: !0, degrees: !0 },
  // default is North
  tilt: { def: 0, num: !0, degrees: !0 },
  // default is Nadir
  long0: { def: 0, num: !0 },
  // default is Greenwich, conversion to rad is automatic
  lat0: { def: 0, num: !0 }
  // default is Equator, conversion to rad is automatic
};
function ZE() {
  if (Object.keys(ca).forEach((function(a) {
    if (typeof this[a] > "u")
      this[a] = ca[a].def;
    else {
      if (ca[a].num && isNaN(this[a]))
        throw new Error("Invalid parameter value, must be numeric " + a + " = " + this[a]);
      ca[a].num && (this[a] = parseFloat(this[a]));
    }
    ca[a].degrees && (this[a] = this[a] * Ee);
  }).bind(this)), Math.abs(Math.abs(this.lat0) - J) < st ? this.mode = this.lat0 < 0 ? be.S_POLE : be.N_POLE : Math.abs(this.lat0) < st ? this.mode = be.EQUIT : (this.mode = be.OBLIQ, this.sinph0 = Math.sin(this.lat0), this.cosph0 = Math.cos(this.lat0)), this.pn1 = this.h / this.a, this.pn1 <= 0 || this.pn1 > 1e10)
    throw new Error("Invalid height");
  this.p = 1 + this.pn1, this.rp = 1 / this.p, this.h1 = 1 / this.pn1, this.pfact = (this.p + 1) * this.h1, this.es = 0;
  var n = this.tilt, i = this.azi;
  this.cg = Math.cos(i), this.sg = Math.sin(i), this.cw = Math.cos(n), this.sw = Math.sin(n);
}
function QE(n) {
  n.x -= this.long0;
  var i = Math.sin(n.y), a = Math.cos(n.y), l = Math.cos(n.x), c, _;
  switch (this.mode) {
    case be.OBLIQ:
      _ = this.sinph0 * i + this.cosph0 * a * l;
      break;
    case be.EQUIT:
      _ = a * l;
      break;
    case be.S_POLE:
      _ = -i;
      break;
    case be.N_POLE:
      _ = i;
      break;
  }
  switch (_ = this.pn1 / (this.p - _), c = _ * a * Math.sin(n.x), this.mode) {
    case be.OBLIQ:
      _ *= this.cosph0 * i - this.sinph0 * a * l;
      break;
    case be.EQUIT:
      _ *= i;
      break;
    case be.N_POLE:
      _ *= -(a * l);
      break;
    case be.S_POLE:
      _ *= a * l;
      break;
  }
  var m, g;
  return m = _ * this.cg + c * this.sg, g = 1 / (m * this.sw * this.h1 + this.cw), c = (c * this.cg - _ * this.sg) * this.cw * g, _ = m * g, n.x = c * this.a, n.y = _ * this.a, n;
}
function JE(n) {
  n.x /= this.a, n.y /= this.a;
  var i = { x: n.x, y: n.y }, a, l, c;
  c = 1 / (this.pn1 - n.y * this.sw), a = this.pn1 * n.x * c, l = this.pn1 * n.y * this.cw * c, n.x = a * this.cg + l * this.sg, n.y = l * this.cg - a * this.sg;
  var _ = $e(n.x, n.y);
  if (Math.abs(_) < st)
    i.x = 0, i.y = n.y;
  else {
    var m, g;
    switch (g = 1 - _ * _ * this.pfact, g = (this.p - Math.sqrt(g)) / (this.pn1 / _ + _ / this.pn1), m = Math.sqrt(1 - g * g), this.mode) {
      case be.OBLIQ:
        i.y = Math.asin(m * this.sinph0 + n.y * g * this.cosph0 / _), n.y = (m - this.sinph0 * Math.sin(i.y)) * _, n.x *= g * this.cosph0;
        break;
      case be.EQUIT:
        i.y = Math.asin(n.y * g / _), n.y = m * _, n.x *= g;
        break;
      case be.N_POLE:
        i.y = Math.asin(m), n.y = -n.y;
        break;
      case be.S_POLE:
        i.y = -Math.asin(m);
        break;
    }
    i.x = Math.atan2(n.x, n.y);
  }
  return n.x = i.x + this.long0, n.y = i.y, n;
}
var $E = ["Tilted_Perspective", "tpers"];
const t4 = {
  init: ZE,
  forward: QE,
  inverse: JE,
  names: $E
};
function e4() {
  if (this.flip_axis = this.sweep === "x" ? 1 : 0, this.h = Number(this.h), this.radius_g_1 = this.h / this.a, this.radius_g_1 <= 0 || this.radius_g_1 > 1e10)
    throw new Error();
  if (this.radius_g = 1 + this.radius_g_1, this.C = this.radius_g * this.radius_g - 1, this.es !== 0) {
    var n = 1 - this.es, i = 1 / n;
    this.radius_p = Math.sqrt(n), this.radius_p2 = n, this.radius_p_inv2 = i, this.shape = "ellipse";
  } else
    this.radius_p = 1, this.radius_p2 = 1, this.radius_p_inv2 = 1, this.shape = "sphere";
  this.title || (this.title = "Geostationary Satellite View");
}
function n4(n) {
  var i = n.x, a = n.y, l, c, _, m;
  if (i = i - this.long0, this.shape === "ellipse") {
    a = Math.atan(this.radius_p2 * Math.tan(a));
    var g = this.radius_p / $e(this.radius_p * Math.cos(a), Math.sin(a));
    if (c = g * Math.cos(i) * Math.cos(a), _ = g * Math.sin(i) * Math.cos(a), m = g * Math.sin(a), (this.radius_g - c) * c - _ * _ - m * m * this.radius_p_inv2 < 0)
      return n.x = Number.NaN, n.y = Number.NaN, n;
    l = this.radius_g - c, this.flip_axis ? (n.x = this.radius_g_1 * Math.atan(_ / $e(m, l)), n.y = this.radius_g_1 * Math.atan(m / l)) : (n.x = this.radius_g_1 * Math.atan(_ / l), n.y = this.radius_g_1 * Math.atan(m / $e(_, l)));
  } else this.shape === "sphere" && (l = Math.cos(a), c = Math.cos(i) * l, _ = Math.sin(i) * l, m = Math.sin(a), l = this.radius_g - c, this.flip_axis ? (n.x = this.radius_g_1 * Math.atan(_ / $e(m, l)), n.y = this.radius_g_1 * Math.atan(m / l)) : (n.x = this.radius_g_1 * Math.atan(_ / l), n.y = this.radius_g_1 * Math.atan(m / $e(_, l))));
  return n.x = n.x * this.a, n.y = n.y * this.a, n;
}
function i4(n) {
  var i = -1, a = 0, l = 0, c, _, m, g;
  if (n.x = n.x / this.a, n.y = n.y / this.a, this.shape === "ellipse") {
    this.flip_axis ? (l = Math.tan(n.y / this.radius_g_1), a = Math.tan(n.x / this.radius_g_1) * $e(1, l)) : (a = Math.tan(n.x / this.radius_g_1), l = Math.tan(n.y / this.radius_g_1) * $e(1, a));
    var v = l / this.radius_p;
    if (c = a * a + v * v + i * i, _ = 2 * this.radius_g * i, m = _ * _ - 4 * c * this.C, m < 0)
      return n.x = Number.NaN, n.y = Number.NaN, n;
    g = (-_ - Math.sqrt(m)) / (2 * c), i = this.radius_g + g * i, a *= g, l *= g, n.x = Math.atan2(a, i), n.y = Math.atan(l * Math.cos(n.x) / i), n.y = Math.atan(this.radius_p_inv2 * Math.tan(n.y));
  } else if (this.shape === "sphere") {
    if (this.flip_axis ? (l = Math.tan(n.y / this.radius_g_1), a = Math.tan(n.x / this.radius_g_1) * Math.sqrt(1 + l * l)) : (a = Math.tan(n.x / this.radius_g_1), l = Math.tan(n.y / this.radius_g_1) * Math.sqrt(1 + a * a)), c = a * a + l * l + i * i, _ = 2 * this.radius_g * i, m = _ * _ - 4 * c * this.C, m < 0)
      return n.x = Number.NaN, n.y = Number.NaN, n;
    g = (-_ - Math.sqrt(m)) / (2 * c), i = this.radius_g + g * i, a *= g, l *= g, n.x = Math.atan2(a, i), n.y = Math.atan(l * Math.cos(n.x) / i);
  }
  return n.x = n.x + this.long0, n;
}
var r4 = ["Geostationary Satellite View", "Geostationary_Satellite", "geos"];
const s4 = {
  init: e4,
  forward: n4,
  inverse: i4,
  names: r4
};
var Ma = 1.340264, ka = -0.081106, wa = 893e-6, Sa = 3796e-6, wo = Math.sqrt(3) / 2;
function a4() {
  this.es = 0, this.long0 = this.long0 !== void 0 ? this.long0 : 0;
}
function u4(n) {
  var i = ut(n.x - this.long0), a = n.y, l = Math.asin(wo * Math.sin(a)), c = l * l, _ = c * c * c;
  return n.x = i * Math.cos(l) / (wo * (Ma + 3 * ka * c + _ * (7 * wa + 9 * Sa * c))), n.y = l * (Ma + ka * c + _ * (wa + Sa * c)), n.x = this.a * n.x + this.x0, n.y = this.a * n.y + this.y0, n;
}
function o4(n) {
  n.x = (n.x - this.x0) / this.a, n.y = (n.y - this.y0) / this.a;
  var i = 1e-9, a = 12, l = n.y, c, _, m, g, v, M;
  for (M = 0; M < a && (c = l * l, _ = c * c * c, m = l * (Ma + ka * c + _ * (wa + Sa * c)) - n.y, g = Ma + 3 * ka * c + _ * (7 * wa + 9 * Sa * c), l -= v = m / g, !(Math.abs(v) < i)); ++M)
    ;
  return c = l * l, _ = c * c * c, n.x = wo * n.x * (Ma + 3 * ka * c + _ * (7 * wa + 9 * Sa * c)) / Math.cos(l), n.y = Math.asin(Math.sin(l) / wo), n.x = ut(n.x + this.long0), n;
}
var h4 = ["eqearth", "Equal Earth", "Equal_Earth"];
const l4 = {
  init: a4,
  forward: u4,
  inverse: o4,
  names: h4
};
var Ca = 1e-10;
function c4() {
  var n;
  if (this.phi1 = this.lat1, Math.abs(this.phi1) < Ca)
    throw new Error();
  this.es ? (this.en = wl(this.es), this.m1 = cs(
    this.phi1,
    this.am1 = Math.sin(this.phi1),
    n = Math.cos(this.phi1),
    this.en
  ), this.am1 = n / (Math.sqrt(1 - this.es * this.am1 * this.am1) * this.am1), this.inverse = g4, this.forward = f4) : (Math.abs(this.phi1) + Ca >= J ? this.cphi1 = 0 : this.cphi1 = 1 / Math.tan(this.phi1), this.inverse = _4, this.forward = d4);
}
function f4(n) {
  var i = ut(n.x - (this.long0 || 0)), a = n.y, l, c, _;
  return l = this.am1 + this.m1 - cs(a, c = Math.sin(a), _ = Math.cos(a), this.en), c = _ * i / (l * Math.sqrt(1 - this.es * c * c)), n.x = l * Math.sin(c), n.y = this.am1 - l * Math.cos(c), n.x = this.a * n.x + (this.x0 || 0), n.y = this.a * n.y + (this.y0 || 0), n;
}
function g4(n) {
  n.x = (n.x - (this.x0 || 0)) / this.a, n.y = (n.y - (this.y0 || 0)) / this.a;
  var i, a, l, c;
  if (a = $e(n.x, n.y = this.am1 - n.y), c = Sl(this.am1 + this.m1 - a, this.es, this.en), (i = Math.abs(c)) < J)
    i = Math.sin(c), l = a * Math.atan2(n.x, n.y) * Math.sqrt(1 - this.es * i * i) / Math.cos(c);
  else if (Math.abs(i - J) <= Ca)
    l = 0;
  else
    throw new Error();
  return n.x = ut(l + (this.long0 || 0)), n.y = Yi(c), n;
}
function d4(n) {
  var i = ut(n.x - (this.long0 || 0)), a = n.y, l, c;
  return c = this.cphi1 + this.phi1 - a, Math.abs(c) > Ca ? (n.x = c * Math.sin(l = i * Math.cos(a) / c), n.y = this.cphi1 - c * Math.cos(l)) : n.x = n.y = 0, n.x = this.a * n.x + (this.x0 || 0), n.y = this.a * n.y + (this.y0 || 0), n;
}
function _4(n) {
  n.x = (n.x - (this.x0 || 0)) / this.a, n.y = (n.y - (this.y0 || 0)) / this.a;
  var i, a, l = $e(n.x, n.y = this.cphi1 - n.y);
  if (a = this.cphi1 + this.phi1 - l, Math.abs(a) > J)
    throw new Error();
  return Math.abs(Math.abs(a) - J) <= Ca ? i = 0 : i = l * Math.atan2(n.x, n.y) / Math.cos(a), n.x = ut(i + (this.long0 || 0)), n.y = Yi(a), n;
}
var m4 = ["bonne", "Bonne (Werner lat_1=90)"];
const y4 = {
  init: c4,
  names: m4
};
function p4(n) {
  n.Proj.projections.add(fo), n.Proj.projections.add(go), n.Proj.projections.add(m2), n.Proj.projections.add(S2), n.Proj.projections.add(P2), n.Proj.projections.add(L2), n.Proj.projections.add(z2), n.Proj.projections.add(V2), n.Proj.projections.add(Q2), n.Proj.projections.add(nx), n.Proj.projections.add(_x), n.Proj.projections.add(Ex), n.Proj.projections.add(Ix), n.Proj.projections.add(Ax), n.Proj.projections.add(Dx), n.Proj.projections.add(jx), n.Proj.projections.add(Wx), n.Proj.projections.add(Jx), n.Proj.projections.add(rE), n.Proj.projections.add(hE), n.Proj.projections.add(dE), n.Proj.projections.add(vE), n.Proj.projections.add(IE), n.Proj.projections.add(TE), n.Proj.projections.add(GE), n.Proj.projections.add(YE), n.Proj.projections.add(KE), n.Proj.projections.add(t4), n.Proj.projections.add(s4), n.Proj.projections.add(l4), n.Proj.projections.add(y4);
}
const _n = Object.assign(R1, {
  defaultDatum: "WGS84",
  Proj: Fn,
  WGS84: new Fn("WGS84"),
  Point: as,
  toPoint: Ag,
  defs: De,
  nadgrid: _1,
  transform: Eo,
  mgrs: O1,
  version: "__VERSION__"
});
p4(_n);
function ji(n, i = 0) {
  if (!Tl(n))
    return Number.NaN;
  if (i === 0)
    return Math.round(n);
  const a = Math.pow(10, i);
  return Math.round(n * a) / a;
}
function v4(n, i) {
  if (Array.isArray(i) && i.length > 2) {
    const a = i.map((_) => Math.abs(n - _)), l = a.reduce(
      (_, m) => _ > m ? m : _
    ), c = a.indexOf(l);
    return typeof i[c] != "number" || isNaN(i[c]) ? n : i[c];
  }
  return n;
}
function Tl(n) {
  return n != null && !Number.isNaN(Number(n)) && (typeof n != "string" || n.length !== 0);
}
const x4 = /\B(?=(\d{3})+(?!\d))/g;
function E4(n, i = "'") {
  const a = ".", l = `${n}`.split(a);
  return typeof l[0] != "string" || l[0].length === 0 ? `${n}` : (l[0] = l[0].replace(x4, i), l.join(a));
}
var Ge = 63710088e-1, Yg = {
  centimeters: Ge * 100,
  centimetres: Ge * 100,
  degrees: 360 / (2 * Math.PI),
  feet: Ge * 3.28084,
  inches: Ge * 39.37,
  kilometers: Ge / 1e3,
  kilometres: Ge / 1e3,
  meters: Ge,
  metres: Ge,
  miles: Ge / 1609.344,
  millimeters: Ge * 1e3,
  millimetres: Ge * 1e3,
  nauticalmiles: Ge / 1852,
  radians: 1,
  yards: Ge * 1.0936
};
function Ui(n, i, a = {}) {
  const l = { type: "Feature" };
  return (a.id === 0 || a.id) && (l.id = a.id), a.bbox && (l.bbox = a.bbox), l.properties = i || {}, l.geometry = n, l;
}
function Fi(n, i, a = {}) {
  if (!n)
    throw new Error("coordinates is required");
  if (!Array.isArray(n))
    throw new Error("coordinates must be an Array");
  if (n.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!jf(n[0]) || !jf(n[1]))
    throw new Error("coordinates must contain numbers");
  return Ui({
    type: "Point",
    coordinates: n
  }, i, a);
}
function M4(n, i, a = {}) {
  return tn(
    n.map((l) => Fi(l, i)),
    a
  );
}
function k4(n, i, a = {}) {
  for (const l of n) {
    if (l.length < 4)
      throw new Error(
        "Each LinearRing of a Polygon must have 4 or more Positions."
      );
    if (l[l.length - 1].length !== l[0].length)
      throw new Error("First and last Position are not equivalent.");
    for (let c = 0; c < l[l.length - 1].length; c++)
      if (l[l.length - 1][c] !== l[0][c])
        throw new Error("First and last Position are not equivalent.");
  }
  return Ui({
    type: "Polygon",
    coordinates: n
  }, i, a);
}
function So(n, i, a = {}) {
  if (n.length < 2)
    throw new Error("coordinates must be an array of two or more positions");
  return Ui({
    type: "LineString",
    coordinates: n
  }, i, a);
}
function tn(n, i = {}) {
  const a = { type: "FeatureCollection" };
  return i.id && (a.id = i.id), i.bbox && (a.bbox = i.bbox), a.features = n, a;
}
function Xg(n, i = "kilometers") {
  const a = Yg[i];
  if (!a)
    throw new Error(i + " units is invalid");
  return n * a;
}
function w4(n, i = "kilometers") {
  const a = Yg[i];
  if (!a)
    throw new Error(i + " units is invalid");
  return n / a;
}
function zf(n) {
  return n % (2 * Math.PI) * 180 / Math.PI;
}
function ns(n) {
  return n % 360 * Math.PI / 180;
}
function jf(n) {
  return !isNaN(n) && n !== null && !Array.isArray(n);
}
function S4(n) {
  return n !== null && typeof n == "object" && !Array.isArray(n);
}
function Hn(n) {
  if (!n)
    throw new Error("coord is required");
  if (!Array.isArray(n)) {
    if (n.type === "Feature" && n.geometry !== null && n.geometry.type === "Point")
      return [...n.geometry.coordinates];
    if (n.type === "Point")
      return [...n.coordinates];
  }
  if (Array.isArray(n) && n.length >= 2 && !Array.isArray(n[0]) && !Array.isArray(n[1]))
    return [...n];
  throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
function ss(n) {
  if (Array.isArray(n))
    return n;
  if (n.type === "Feature") {
    if (n.geometry !== null)
      return n.geometry.coordinates;
  } else if (n.coordinates)
    return n.coordinates;
  throw new Error(
    "coords must be GeoJSON Feature, Geometry Object or an Array"
  );
}
function I4(n) {
  return n.type === "Feature" ? n.geometry : n;
}
function Uf(n, i) {
  return n.type === "FeatureCollection" ? "FeatureCollection" : n.type === "GeometryCollection" ? "GeometryCollection" : n.type === "Feature" && n.geometry !== null ? n.geometry.type : n.type;
}
function Vn(n, i, a = {}) {
  var l = Hn(n), c = Hn(i), _ = ns(c[1] - l[1]), m = ns(c[0] - l[0]), g = ns(l[1]), v = ns(c[1]), M = Math.pow(Math.sin(_ / 2), 2) + Math.pow(Math.sin(m / 2), 2) * Math.cos(g) * Math.cos(v);
  return Xg(
    2 * Math.atan2(Math.sqrt(M), Math.sqrt(1 - M)),
    a.units
  );
}
function Al(n, i, a) {
  if (n !== null)
    for (var l, c, _, m, g, v, M, w = 0, E = 0, k, P = n.type, C = P === "FeatureCollection", L = P === "Feature", D = C ? n.features.length : 1, B = 0; B < D; B++) {
      M = C ? n.features[B].geometry : L ? n.geometry : n, k = M ? M.type === "GeometryCollection" : !1, g = k ? M.geometries.length : 1;
      for (var j = 0; j < g; j++) {
        var U = 0, X = 0;
        if (m = k ? M.geometries[j] : M, m !== null) {
          v = m.coordinates;
          var Y = m.type;
          switch (w = 0, Y) {
            case null:
              break;
            case "Point":
              if (i(
                v,
                E,
                B,
                U,
                X
              ) === !1)
                return !1;
              E++, U++;
              break;
            case "LineString":
            case "MultiPoint":
              for (l = 0; l < v.length; l++) {
                if (i(
                  v[l],
                  E,
                  B,
                  U,
                  X
                ) === !1)
                  return !1;
                E++, Y === "MultiPoint" && U++;
              }
              Y === "LineString" && U++;
              break;
            case "Polygon":
            case "MultiLineString":
              for (l = 0; l < v.length; l++) {
                for (c = 0; c < v[l].length - w; c++) {
                  if (i(
                    v[l][c],
                    E,
                    B,
                    U,
                    X
                  ) === !1)
                    return !1;
                  E++;
                }
                Y === "MultiLineString" && U++, Y === "Polygon" && X++;
              }
              Y === "Polygon" && U++;
              break;
            case "MultiPolygon":
              for (l = 0; l < v.length; l++) {
                for (X = 0, c = 0; c < v[l].length; c++) {
                  for (_ = 0; _ < v[l][c].length - w; _++) {
                    if (i(
                      v[l][c][_],
                      E,
                      B,
                      U,
                      X
                    ) === !1)
                      return !1;
                    E++;
                  }
                  X++;
                }
                U++;
              }
              break;
            case "GeometryCollection":
              for (l = 0; l < m.geometries.length; l++)
                if (Al(m.geometries[l], i) === !1)
                  return !1;
              break;
            default:
              throw new Error("Unknown Geometry Type");
          }
        }
      }
    }
}
function us(n, i) {
  if (n.type === "Feature")
    i(n, 0);
  else if (n.type === "FeatureCollection")
    for (var a = 0; a < n.features.length && i(n.features[a], a) !== !1; a++)
      ;
}
function N4(n, i, a) {
  var l = a;
  return us(n, function(c, _) {
    _ === 0 && a === void 0 ? l = c : l = i(l, c, _);
  }), l;
}
function Rl(n, i) {
  var a, l, c, _, m, g, v, M, w, E, k = 0, P = n.type === "FeatureCollection", C = n.type === "Feature", L = P ? n.features.length : 1;
  for (a = 0; a < L; a++) {
    for (g = P ? n.features[a].geometry : C ? n.geometry : n, M = P ? n.features[a].properties : C ? n.properties : {}, w = P ? n.features[a].bbox : C ? n.bbox : void 0, E = P ? n.features[a].id : C ? n.id : void 0, v = g ? g.type === "GeometryCollection" : !1, m = v ? g.geometries.length : 1, c = 0; c < m; c++) {
      if (_ = v ? g.geometries[c] : g, _ === null) {
        if (i(
          null,
          k,
          M,
          w,
          E
        ) === !1)
          return !1;
        continue;
      }
      switch (_.type) {
        case "Point":
        case "LineString":
        case "MultiPoint":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon": {
          if (i(
            _,
            k,
            M,
            w,
            E
          ) === !1)
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (l = 0; l < _.geometries.length; l++)
            if (i(
              _.geometries[l],
              k,
              M,
              w,
              E
            ) === !1)
              return !1;
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    k++;
  }
}
function Ol(n, i) {
  Rl(n, function(a, l, c, _, m) {
    var g = a === null ? null : a.type;
    switch (g) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return i(
          Ui(a, c, { bbox: _, id: m }),
          l,
          0
        ) === !1 ? !1 : void 0;
    }
    var v;
    switch (g) {
      case "MultiPoint":
        v = "Point";
        break;
      case "MultiLineString":
        v = "LineString";
        break;
      case "MultiPolygon":
        v = "Polygon";
        break;
    }
    for (var M = 0; M < a.coordinates.length; M++) {
      var w = a.coordinates[M], E = {
        type: v,
        coordinates: w
      };
      if (i(Ui(E, c), l, M) === !1)
        return !1;
    }
  });
}
function Ei(n, i = {}) {
  if (n.bbox != null && i.recompute !== !0)
    return n.bbox;
  const a = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  return Al(n, (l) => {
    a[0] > l[0] && (a[0] = l[0]), a[1] > l[1] && (a[1] = l[1]), a[2] < l[0] && (a[2] = l[0]), a[3] < l[1] && (a[3] = l[1]);
  }), a;
}
function b4(n, i = {}) {
  const a = Number(n[0]), l = Number(n[1]), c = Number(n[2]), _ = Number(n[3]);
  if (n.length === 6)
    throw new Error(
      "@turf/bbox-polygon does not support BBox with 6 positions"
    );
  const m = [a, l];
  return k4(
    [[m, [c, l], [c, _], [a, _], m]],
    i.properties,
    { bbox: n, id: i.id }
  );
}
const Mi = 11102230246251565e-32, Ne = 134217729, C4 = (3 + 8 * Mi) * Mi;
function Jh(n, i, a, l, c) {
  let _, m, g, v, M = i[0], w = l[0], E = 0, k = 0;
  w > M == w > -M ? (_ = M, M = i[++E]) : (_ = w, w = l[++k]);
  let P = 0;
  if (E < n && k < a)
    for (w > M == w > -M ? (m = M + _, g = _ - (m - M), M = i[++E]) : (m = w + _, g = _ - (m - w), w = l[++k]), _ = m, g !== 0 && (c[P++] = g); E < n && k < a; )
      w > M == w > -M ? (m = _ + M, v = m - _, g = _ - (m - v) + (M - v), M = i[++E]) : (m = _ + w, v = m - _, g = _ - (m - v) + (w - v), w = l[++k]), _ = m, g !== 0 && (c[P++] = g);
  for (; E < n; )
    m = _ + M, v = m - _, g = _ - (m - v) + (M - v), M = i[++E], _ = m, g !== 0 && (c[P++] = g);
  for (; k < a; )
    m = _ + w, v = m - _, g = _ - (m - v) + (w - v), w = l[++k], _ = m, g !== 0 && (c[P++] = g);
  return (_ !== 0 || P === 0) && (c[P++] = _), P;
}
function P4(n, i) {
  let a = i[0];
  for (let l = 1; l < n; l++) a += i[l];
  return a;
}
function Fa(n) {
  return new Float64Array(n);
}
const T4 = (3 + 16 * Mi) * Mi, A4 = (2 + 12 * Mi) * Mi, R4 = (9 + 64 * Mi) * Mi * Mi, Hr = Fa(4), Yf = Fa(8), Xf = Fa(12), Vf = Fa(16), Le = Fa(4);
function O4(n, i, a, l, c, _, m) {
  let g, v, M, w, E, k, P, C, L, D, B, j, U, X, Y, H, Z, et;
  const $ = n - c, dt = a - c, _t = i - _, Mt = l - _;
  X = $ * Mt, k = Ne * $, P = k - (k - $), C = $ - P, k = Ne * Mt, L = k - (k - Mt), D = Mt - L, Y = C * D - (X - P * L - C * L - P * D), H = _t * dt, k = Ne * _t, P = k - (k - _t), C = _t - P, k = Ne * dt, L = k - (k - dt), D = dt - L, Z = C * D - (H - P * L - C * L - P * D), B = Y - Z, E = Y - B, Hr[0] = Y - (B + E) + (E - Z), j = X + B, E = j - X, U = X - (j - E) + (B - E), B = U - H, E = U - B, Hr[1] = U - (B + E) + (E - H), et = j + B, E = et - j, Hr[2] = j - (et - E) + (B - E), Hr[3] = et;
  let Ct = P4(4, Hr), it = A4 * m;
  if (Ct >= it || -Ct >= it || (E = n - $, g = n - ($ + E) + (E - c), E = a - dt, M = a - (dt + E) + (E - c), E = i - _t, v = i - (_t + E) + (E - _), E = l - Mt, w = l - (Mt + E) + (E - _), g === 0 && v === 0 && M === 0 && w === 0) || (it = R4 * m + C4 * Math.abs(Ct), Ct += $ * w + Mt * g - (_t * M + dt * v), Ct >= it || -Ct >= it)) return Ct;
  X = g * Mt, k = Ne * g, P = k - (k - g), C = g - P, k = Ne * Mt, L = k - (k - Mt), D = Mt - L, Y = C * D - (X - P * L - C * L - P * D), H = v * dt, k = Ne * v, P = k - (k - v), C = v - P, k = Ne * dt, L = k - (k - dt), D = dt - L, Z = C * D - (H - P * L - C * L - P * D), B = Y - Z, E = Y - B, Le[0] = Y - (B + E) + (E - Z), j = X + B, E = j - X, U = X - (j - E) + (B - E), B = U - H, E = U - B, Le[1] = U - (B + E) + (E - H), et = j + B, E = et - j, Le[2] = j - (et - E) + (B - E), Le[3] = et;
  const wt = Jh(4, Hr, 4, Le, Yf);
  X = $ * w, k = Ne * $, P = k - (k - $), C = $ - P, k = Ne * w, L = k - (k - w), D = w - L, Y = C * D - (X - P * L - C * L - P * D), H = _t * M, k = Ne * _t, P = k - (k - _t), C = _t - P, k = Ne * M, L = k - (k - M), D = M - L, Z = C * D - (H - P * L - C * L - P * D), B = Y - Z, E = Y - B, Le[0] = Y - (B + E) + (E - Z), j = X + B, E = j - X, U = X - (j - E) + (B - E), B = U - H, E = U - B, Le[1] = U - (B + E) + (E - H), et = j + B, E = et - j, Le[2] = j - (et - E) + (B - E), Le[3] = et;
  const Gt = Jh(wt, Yf, 4, Le, Xf);
  X = g * w, k = Ne * g, P = k - (k - g), C = g - P, k = Ne * w, L = k - (k - w), D = w - L, Y = C * D - (X - P * L - C * L - P * D), H = v * M, k = Ne * v, P = k - (k - v), C = v - P, k = Ne * M, L = k - (k - M), D = M - L, Z = C * D - (H - P * L - C * L - P * D), B = Y - Z, E = Y - B, Le[0] = Y - (B + E) + (E - Z), j = X + B, E = j - X, U = X - (j - E) + (B - E), B = U - H, E = U - B, Le[1] = U - (B + E) + (E - H), et = j + B, E = et - j, Le[2] = j - (et - E) + (B - E), Le[3] = et;
  const Dt = Jh(Gt, Xf, 4, Le, Vf);
  return Vf[Dt - 1];
}
function L4(n, i, a, l, c, _) {
  const m = (i - _) * (a - c), g = (n - c) * (l - _), v = m - g, M = Math.abs(m + g);
  return Math.abs(v) >= T4 * M ? v : -O4(n, i, a, l, c, _, M);
}
function G4(n, i) {
  var a, l, c = 0, _, m, g, v, M, w, E, k = n[0], P = n[1], C = i.length;
  for (a = 0; a < C; a++) {
    l = 0;
    var L = i[a], D = L.length - 1;
    if (w = L[0], w[0] !== L[D][0] && w[1] !== L[D][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (m = w[0] - k, g = w[1] - P, l; l < D; l++) {
      if (E = L[l + 1], v = E[0] - k, M = E[1] - P, g === 0 && M === 0) {
        if (v <= 0 && m >= 0 || m <= 0 && v >= 0)
          return 0;
      } else if (M >= 0 && g <= 0 || M <= 0 && g >= 0) {
        if (_ = L4(m, v, g, M, 0, 0), _ === 0)
          return 0;
        (_ > 0 && M > 0 && g <= 0 || _ < 0 && M <= 0 && g > 0) && c++;
      }
      w = E, g = M, m = v;
    }
  }
  return c % 2 !== 0;
}
function D4(n, i, a = {}) {
  if (!n)
    throw new Error("point is required");
  if (!i)
    throw new Error("polygon is required");
  const l = Hn(n), c = I4(i), _ = c.type, m = i.bbox;
  let g = c.coordinates;
  if (m && F4(l, m) === !1)
    return !1;
  _ === "Polygon" && (g = [g]);
  let v = !1;
  for (var M = 0; M < g.length; ++M) {
    const w = G4(l, g[M]);
    if (w === 0) return !a.ignoreBoundary;
    w && (v = !0);
  }
  return v;
}
function F4(n, i) {
  return i[0] <= n[0] && i[1] <= n[1] && i[2] >= n[0] && i[3] >= n[1];
}
class Vg {
  constructor(i = [], a = q4) {
    if (this.data = i, this.length = this.data.length, this.compare = a, this.length > 0)
      for (let l = (this.length >> 1) - 1; l >= 0; l--) this._down(l);
  }
  push(i) {
    this.data.push(i), this.length++, this._up(this.length - 1);
  }
  pop() {
    if (this.length === 0) return;
    const i = this.data[0], a = this.data.pop();
    return this.length--, this.length > 0 && (this.data[0] = a, this._down(0)), i;
  }
  peek() {
    return this.data[0];
  }
  _up(i) {
    const { data: a, compare: l } = this, c = a[i];
    for (; i > 0; ) {
      const _ = i - 1 >> 1, m = a[_];
      if (l(c, m) >= 0) break;
      a[i] = m, i = _;
    }
    a[i] = c;
  }
  _down(i) {
    const { data: a, compare: l } = this, c = this.length >> 1, _ = a[i];
    for (; i < c; ) {
      let m = (i << 1) + 1, g = a[m];
      const v = m + 1;
      if (v < this.length && l(a[v], g) < 0 && (m = v, g = a[v]), l(g, _) >= 0) break;
      a[i] = g, i = m;
    }
    a[i] = _;
  }
}
function q4(n, i) {
  return n < i ? -1 : n > i ? 1 : 0;
}
function Wg(n, i) {
  return n.p.x > i.p.x ? 1 : n.p.x < i.p.x ? -1 : n.p.y !== i.p.y ? n.p.y > i.p.y ? 1 : -1 : 1;
}
function B4(n, i) {
  return n.rightSweepEvent.p.x > i.rightSweepEvent.p.x ? 1 : n.rightSweepEvent.p.x < i.rightSweepEvent.p.x ? -1 : n.rightSweepEvent.p.y !== i.rightSweepEvent.p.y ? n.rightSweepEvent.p.y < i.rightSweepEvent.p.y ? 1 : -1 : 1;
}
class Wf {
  constructor(i, a, l, c) {
    this.p = {
      x: i[0],
      y: i[1]
    }, this.featureId = a, this.ringId = l, this.eventId = c, this.otherEvent = null, this.isLeftEndpoint = null;
  }
  isSamePoint(i) {
    return this.p.x === i.p.x && this.p.y === i.p.y;
  }
}
function z4(n, i) {
  if (n.type === "FeatureCollection") {
    const a = n.features;
    for (let l = 0; l < a.length; l++)
      Hf(a[l], i);
  } else
    Hf(n, i);
}
let Ju = 0, $u = 0, to = 0;
function Hf(n, i) {
  const a = n.type === "Feature" ? n.geometry : n;
  let l = a.coordinates;
  (a.type === "Polygon" || a.type === "MultiLineString") && (l = [l]), a.type === "LineString" && (l = [[l]]);
  for (let c = 0; c < l.length; c++)
    for (let _ = 0; _ < l[c].length; _++) {
      let m = l[c][_][0], g = null;
      $u = $u + 1;
      for (let v = 0; v < l[c][_].length - 1; v++) {
        g = l[c][_][v + 1];
        const M = new Wf(m, Ju, $u, to), w = new Wf(g, Ju, $u, to + 1);
        M.otherEvent = w, w.otherEvent = M, Wg(M, w) > 0 ? (w.isLeftEndpoint = !0, M.isLeftEndpoint = !1) : (M.isLeftEndpoint = !0, w.isLeftEndpoint = !1), i.push(M), i.push(w), m = g, to = to + 1;
      }
    }
  Ju = Ju + 1;
}
class j4 {
  constructor(i) {
    this.leftSweepEvent = i, this.rightSweepEvent = i.otherEvent;
  }
}
function U4(n, i) {
  if (n === null || i === null || n.leftSweepEvent.ringId === i.leftSweepEvent.ringId && (n.rightSweepEvent.isSamePoint(i.leftSweepEvent) || n.rightSweepEvent.isSamePoint(i.leftSweepEvent) || n.rightSweepEvent.isSamePoint(i.rightSweepEvent) || n.leftSweepEvent.isSamePoint(i.leftSweepEvent) || n.leftSweepEvent.isSamePoint(i.rightSweepEvent))) return !1;
  const a = n.leftSweepEvent.p.x, l = n.leftSweepEvent.p.y, c = n.rightSweepEvent.p.x, _ = n.rightSweepEvent.p.y, m = i.leftSweepEvent.p.x, g = i.leftSweepEvent.p.y, v = i.rightSweepEvent.p.x, M = i.rightSweepEvent.p.y, w = (M - g) * (c - a) - (v - m) * (_ - l), E = (v - m) * (l - g) - (M - g) * (a - m), k = (c - a) * (l - g) - (_ - l) * (a - m);
  if (w === 0)
    return !1;
  const P = E / w, C = k / w;
  if (P >= 0 && P <= 1 && C >= 0 && C <= 1) {
    const L = a + P * (c - a), D = l + P * (_ - l);
    return [L, D];
  }
  return !1;
}
function Y4(n, i) {
  i = i || !1;
  const a = [], l = new Vg([], B4);
  for (; n.length; ) {
    const c = n.pop();
    if (c.isLeftEndpoint) {
      const _ = new j4(c);
      for (let m = 0; m < l.data.length; m++) {
        const g = l.data[m];
        if (i && g.leftSweepEvent.featureId === c.featureId)
          continue;
        const v = U4(_, g);
        v !== !1 && a.push(v);
      }
      l.push(_);
    } else c.isLeftEndpoint === !1 && l.pop();
  }
  return a;
}
function X4(n, i) {
  const a = new Vg([], Wg);
  return z4(n, a), Y4(a, i);
}
var V4 = X4;
function W4(n, i, a = {}) {
  const { removeDuplicates: l = !0, ignoreSelfIntersections: c = !0 } = a;
  let _ = [];
  n.type === "FeatureCollection" ? _ = _.concat(n.features) : n.type === "Feature" ? _.push(n) : (n.type === "LineString" || n.type === "Polygon" || n.type === "MultiLineString" || n.type === "MultiPolygon") && _.push(Ui(n)), i.type === "FeatureCollection" ? _ = _.concat(i.features) : i.type === "Feature" ? _.push(i) : (i.type === "LineString" || i.type === "Polygon" || i.type === "MultiLineString" || i.type === "MultiPolygon") && _.push(Ui(i));
  const m = V4(
    tn(_),
    c
  );
  let g = [];
  if (l) {
    const v = {};
    m.forEach((M) => {
      const w = M.join(",");
      v[w] || (v[w] = !0, g.push(M));
    });
  } else
    g = m;
  return tn(g.map((v) => Fi(v)));
}
function H4(n, i, a, l, c) {
  Hg(n, i, a || 0, l || n.length - 1, c || K4);
}
function Hg(n, i, a, l, c) {
  for (; l > a; ) {
    if (l - a > 600) {
      var _ = l - a + 1, m = i - a + 1, g = Math.log(_), v = 0.5 * Math.exp(2 * g / 3), M = 0.5 * Math.sqrt(g * v * (_ - v) / _) * (m - _ / 2 < 0 ? -1 : 1), w = Math.max(a, Math.floor(i - m * v / _ + M)), E = Math.min(l, Math.floor(i + (_ - m) * v / _ + M));
      Hg(n, i, w, E, c);
    }
    var k = n[i], P = a, C = l;
    for (fa(n, a, i), c(n[l], k) > 0 && fa(n, a, l); P < C; ) {
      for (fa(n, P, C), P++, C--; c(n[P], k) < 0; ) P++;
      for (; c(n[C], k) > 0; ) C--;
    }
    c(n[a], k) === 0 ? fa(n, a, C) : (C++, fa(n, C, l)), C <= i && (a = C + 1), i <= C && (l = C - 1);
  }
}
function fa(n, i, a) {
  var l = n[i];
  n[i] = n[a], n[a] = l;
}
function K4(n, i) {
  return n < i ? -1 : n > i ? 1 : 0;
}
class Xn {
  constructor(i = 9) {
    this._maxEntries = Math.max(4, i), this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4)), this.clear();
  }
  all() {
    return this._all(this.data, []);
  }
  search(i) {
    let a = this.data;
    const l = [];
    if (!no(i, a)) return l;
    const c = this.toBBox, _ = [];
    for (; a; ) {
      for (let m = 0; m < a.children.length; m++) {
        const g = a.children[m], v = a.leaf ? c(g) : g;
        no(i, v) && (a.leaf ? l.push(g) : tl(i, v) ? this._all(g, l) : _.push(g));
      }
      a = _.pop();
    }
    return l;
  }
  collides(i) {
    let a = this.data;
    if (!no(i, a)) return !1;
    const l = [];
    for (; a; ) {
      for (let c = 0; c < a.children.length; c++) {
        const _ = a.children[c], m = a.leaf ? this.toBBox(_) : _;
        if (no(i, m)) {
          if (a.leaf || tl(i, m)) return !0;
          l.push(_);
        }
      }
      a = l.pop();
    }
    return !1;
  }
  load(i) {
    if (!(i && i.length)) return this;
    if (i.length < this._minEntries) {
      for (let l = 0; l < i.length; l++)
        this.insert(i[l]);
      return this;
    }
    let a = this._build(i.slice(), 0, i.length - 1, 0);
    if (!this.data.children.length)
      this.data = a;
    else if (this.data.height === a.height)
      this._splitRoot(this.data, a);
    else {
      if (this.data.height < a.height) {
        const l = this.data;
        this.data = a, a = l;
      }
      this._insert(a, this.data.height - a.height - 1, !0);
    }
    return this;
  }
  insert(i) {
    return i && this._insert(i, this.data.height - 1), this;
  }
  clear() {
    return this.data = Jr([]), this;
  }
  remove(i, a) {
    if (!i) return this;
    let l = this.data;
    const c = this.toBBox(i), _ = [], m = [];
    let g, v, M;
    for (; l || _.length; ) {
      if (l || (l = _.pop(), v = _[_.length - 1], g = m.pop(), M = !0), l.leaf) {
        const w = Z4(i, l.children, a);
        if (w !== -1)
          return l.children.splice(w, 1), _.push(l), this._condense(_), this;
      }
      !M && !l.leaf && tl(l, c) ? (_.push(l), m.push(g), g = 0, v = l, l = l.children[0]) : v ? (g++, l = v.children[g], M = !1) : l = null;
    }
    return this;
  }
  toBBox(i) {
    return i;
  }
  compareMinX(i, a) {
    return i.minX - a.minX;
  }
  compareMinY(i, a) {
    return i.minY - a.minY;
  }
  toJSON() {
    return this.data;
  }
  fromJSON(i) {
    return this.data = i, this;
  }
  _all(i, a) {
    const l = [];
    for (; i; )
      i.leaf ? a.push(...i.children) : l.push(...i.children), i = l.pop();
    return a;
  }
  _build(i, a, l, c) {
    const _ = l - a + 1;
    let m = this._maxEntries, g;
    if (_ <= m)
      return g = Jr(i.slice(a, l + 1)), Kr(g, this.toBBox), g;
    c || (c = Math.ceil(Math.log(_) / Math.log(m)), m = Math.ceil(_ / Math.pow(m, c - 1))), g = Jr([]), g.leaf = !1, g.height = c;
    const v = Math.ceil(_ / m), M = v * Math.ceil(Math.sqrt(m));
    Kf(i, a, l, M, this.compareMinX);
    for (let w = a; w <= l; w += M) {
      const E = Math.min(w + M - 1, l);
      Kf(i, w, E, v, this.compareMinY);
      for (let k = w; k <= E; k += v) {
        const P = Math.min(k + v - 1, E);
        g.children.push(this._build(i, k, P, c - 1));
      }
    }
    return Kr(g, this.toBBox), g;
  }
  _chooseSubtree(i, a, l, c) {
    for (; c.push(a), !(a.leaf || c.length - 1 === l); ) {
      let _ = 1 / 0, m = 1 / 0, g;
      for (let v = 0; v < a.children.length; v++) {
        const M = a.children[v], w = $h(M), E = $4(i, M) - w;
        E < m ? (m = E, _ = w < _ ? w : _, g = M) : E === m && w < _ && (_ = w, g = M);
      }
      a = g || a.children[0];
    }
    return a;
  }
  _insert(i, a, l) {
    const c = l ? i : this.toBBox(i), _ = [], m = this._chooseSubtree(c, this.data, a, _);
    for (m.children.push(i), ya(m, c); a >= 0 && _[a].children.length > this._maxEntries; )
      this._split(_, a), a--;
    this._adjustParentBBoxes(c, _, a);
  }
  // split overflowed node into two
  _split(i, a) {
    const l = i[a], c = l.children.length, _ = this._minEntries;
    this._chooseSplitAxis(l, _, c);
    const m = this._chooseSplitIndex(l, _, c), g = Jr(l.children.splice(m, l.children.length - m));
    g.height = l.height, g.leaf = l.leaf, Kr(l, this.toBBox), Kr(g, this.toBBox), a ? i[a - 1].children.push(g) : this._splitRoot(l, g);
  }
  _splitRoot(i, a) {
    this.data = Jr([i, a]), this.data.height = i.height + 1, this.data.leaf = !1, Kr(this.data, this.toBBox);
  }
  _chooseSplitIndex(i, a, l) {
    let c, _ = 1 / 0, m = 1 / 0;
    for (let g = a; g <= l - a; g++) {
      const v = ma(i, 0, g, this.toBBox), M = ma(i, g, l, this.toBBox), w = tM(v, M), E = $h(v) + $h(M);
      w < _ ? (_ = w, c = g, m = E < m ? E : m) : w === _ && E < m && (m = E, c = g);
    }
    return c || l - a;
  }
  // sorts node children by the best axis for split
  _chooseSplitAxis(i, a, l) {
    const c = i.leaf ? this.compareMinX : Q4, _ = i.leaf ? this.compareMinY : J4, m = this._allDistMargin(i, a, l, c), g = this._allDistMargin(i, a, l, _);
    m < g && i.children.sort(c);
  }
  // total margin of all possible split distributions where each node is at least m full
  _allDistMargin(i, a, l, c) {
    i.children.sort(c);
    const _ = this.toBBox, m = ma(i, 0, a, _), g = ma(i, l - a, l, _);
    let v = eo(m) + eo(g);
    for (let M = a; M < l - a; M++) {
      const w = i.children[M];
      ya(m, i.leaf ? _(w) : w), v += eo(m);
    }
    for (let M = l - a - 1; M >= a; M--) {
      const w = i.children[M];
      ya(g, i.leaf ? _(w) : w), v += eo(g);
    }
    return v;
  }
  _adjustParentBBoxes(i, a, l) {
    for (let c = l; c >= 0; c--)
      ya(a[c], i);
  }
  _condense(i) {
    for (let a = i.length - 1, l; a >= 0; a--)
      i[a].children.length === 0 ? a > 0 ? (l = i[a - 1].children, l.splice(l.indexOf(i[a]), 1)) : this.clear() : Kr(i[a], this.toBBox);
  }
}
function Z4(n, i, a) {
  if (!a) return i.indexOf(n);
  for (let l = 0; l < i.length; l++)
    if (a(n, i[l])) return l;
  return -1;
}
function Kr(n, i) {
  ma(n, 0, n.children.length, i, n);
}
function ma(n, i, a, l, c) {
  c || (c = Jr(null)), c.minX = 1 / 0, c.minY = 1 / 0, c.maxX = -1 / 0, c.maxY = -1 / 0;
  for (let _ = i; _ < a; _++) {
    const m = n.children[_];
    ya(c, n.leaf ? l(m) : m);
  }
  return c;
}
function ya(n, i) {
  return n.minX = Math.min(n.minX, i.minX), n.minY = Math.min(n.minY, i.minY), n.maxX = Math.max(n.maxX, i.maxX), n.maxY = Math.max(n.maxY, i.maxY), n;
}
function Q4(n, i) {
  return n.minX - i.minX;
}
function J4(n, i) {
  return n.minY - i.minY;
}
function $h(n) {
  return (n.maxX - n.minX) * (n.maxY - n.minY);
}
function eo(n) {
  return n.maxX - n.minX + (n.maxY - n.minY);
}
function $4(n, i) {
  return (Math.max(i.maxX, n.maxX) - Math.min(i.minX, n.minX)) * (Math.max(i.maxY, n.maxY) - Math.min(i.minY, n.minY));
}
function tM(n, i) {
  const a = Math.max(n.minX, i.minX), l = Math.max(n.minY, i.minY), c = Math.min(n.maxX, i.maxX), _ = Math.min(n.maxY, i.maxY);
  return Math.max(0, c - a) * Math.max(0, _ - l);
}
function tl(n, i) {
  return n.minX <= i.minX && n.minY <= i.minY && i.maxX <= n.maxX && i.maxY <= n.maxY;
}
function no(n, i) {
  return i.minX <= n.maxX && i.minY <= n.maxY && i.maxX >= n.minX && i.maxY >= n.minY;
}
function Jr(n) {
  return {
    children: n,
    height: 1,
    leaf: !0,
    minX: 1 / 0,
    minY: 1 / 0,
    maxX: -1 / 0,
    maxY: -1 / 0
  };
}
function Kf(n, i, a, l, c) {
  const _ = [i, a];
  for (; _.length; ) {
    if (a = _.pop(), i = _.pop(), a - i <= l) continue;
    const m = i + Math.ceil((a - i) / l / 2) * l;
    H4(n, m, i, a, c), _.push(i, m, m, a);
  }
}
function Kg(n) {
  var i = new Xn(n);
  return i.insert = function(a) {
    if (a.type !== "Feature") throw new Error("invalid feature");
    return a.bbox = a.bbox ? a.bbox : Ei(a), Xn.prototype.insert.call(this, a);
  }, i.load = function(a) {
    var l = [];
    return Array.isArray(a) ? a.forEach(function(c) {
      if (c.type !== "Feature") throw new Error("invalid features");
      c.bbox = c.bbox ? c.bbox : Ei(c), l.push(c);
    }) : us(a, function(c) {
      if (c.type !== "Feature") throw new Error("invalid features");
      c.bbox = c.bbox ? c.bbox : Ei(c), l.push(c);
    }), Xn.prototype.load.call(this, l);
  }, i.remove = function(a, l) {
    if (a.type !== "Feature") throw new Error("invalid feature");
    return a.bbox = a.bbox ? a.bbox : Ei(a), Xn.prototype.remove.call(this, a, l);
  }, i.clear = function() {
    return Xn.prototype.clear.call(this);
  }, i.search = function(a) {
    var l = Xn.prototype.search.call(this, this.toBBox(a));
    return tn(l);
  }, i.collides = function(a) {
    return Xn.prototype.collides.call(this, this.toBBox(a));
  }, i.all = function() {
    var a = Xn.prototype.all.call(this);
    return tn(a);
  }, i.toJSON = function() {
    return Xn.prototype.toJSON.call(this);
  }, i.fromJSON = function(a) {
    return Xn.prototype.fromJSON.call(this, a);
  }, i.toBBox = function(a) {
    var l;
    if (a.bbox) l = a.bbox;
    else if (Array.isArray(a) && a.length === 4) l = a;
    else if (Array.isArray(a) && a.length === 6)
      l = [a[0], a[1], a[3], a[4]];
    else if (a.type === "Feature") l = Ei(a);
    else if (a.type === "FeatureCollection") l = Ei(a);
    else throw new Error("invalid geojson");
    return {
      minX: l[0],
      minY: l[1],
      maxX: l[2],
      maxY: l[3]
    };
  }, i;
}
function eM(n) {
  if (!n)
    throw new Error("geojson is required");
  const i = [];
  return Ol(n, (a) => {
    nM(a, i);
  }), tn(i);
}
function nM(n, i) {
  let a = [];
  const l = n.geometry;
  if (l !== null) {
    switch (l.type) {
      case "Polygon":
        a = ss(l);
        break;
      case "LineString":
        a = [ss(l)];
    }
    a.forEach((c) => {
      iM(c, n.properties).forEach((_) => {
        _.id = i.length, i.push(_);
      });
    });
  }
}
function iM(n, i) {
  const a = [];
  return n.reduce((l, c) => {
    const _ = So([l, c], i);
    return _.bbox = rM(l, c), a.push(_), c;
  }), a;
}
function rM(n, i) {
  const a = n[0], l = n[1], c = i[0], _ = i[1], m = a < c ? a : c, g = l < _ ? l : _, v = a > c ? a : c, M = l > _ ? l : _;
  return [m, g, v, M];
}
var sM = Object.defineProperty, aM = Object.defineProperties, uM = Object.getOwnPropertyDescriptors, Zf = Object.getOwnPropertySymbols, oM = Object.prototype.hasOwnProperty, hM = Object.prototype.propertyIsEnumerable, Qf = (n, i, a) => i in n ? sM(n, i, { enumerable: !0, configurable: !0, writable: !0, value: a }) : n[i] = a, Jf = (n, i) => {
  for (var a in i || (i = {}))
    oM.call(i, a) && Qf(n, a, i[a]);
  if (Zf)
    for (var a of Zf(i))
      hM.call(i, a) && Qf(n, a, i[a]);
  return n;
}, $f = (n, i) => aM(n, uM(i));
function lM(n, i, a = {}) {
  if (!n || !i)
    throw new Error("lines and pt are required arguments");
  const l = Hn(i);
  let c = Fi([1 / 0, 1 / 0], {
    dist: 1 / 0,
    index: -1,
    multiFeatureIndex: -1,
    location: -1
  }), _ = 0;
  return Ol(
    n,
    function(m, g, v) {
      const M = ss(m);
      for (let w = 0; w < M.length - 1; w++) {
        const E = Fi(M[w]);
        E.properties.dist = Vn(i, E, a);
        const k = Hn(E), P = Fi(M[w + 1]);
        P.properties.dist = Vn(i, P, a);
        const C = Hn(P), L = Vn(E, P, a);
        let D, B;
        k[0] === l[0] && k[1] === l[1] ? [D, , B] = [k, void 0, !1] : C[0] === l[0] && C[1] === l[1] ? [D, , B] = [C, void 0, !0] : [D, , B] = gM(
          E.geometry.coordinates,
          P.geometry.coordinates,
          Hn(i)
        );
        let j;
        D && (j = Fi(D, {
          dist: Vn(i, D, a),
          multiFeatureIndex: v,
          location: _ + Vn(E, D, a)
        })), j && j.properties.dist < c.properties.dist && (c = $f(Jf({}, j), {
          properties: $f(Jf({}, j.properties), {
            // Legacy behaviour where index progresses to next segment # if we
            // went with the end point this iteration.
            index: B ? w + 1 : w
          })
        })), _ += L;
      }
    }
  ), c;
}
function cM(n, i) {
  const [a, l, c] = n, [_, m, g] = i;
  return a * _ + l * m + c * g;
}
function fM(n, i) {
  const [a, l, c] = n, [_, m, g] = i;
  return [l * g - c * m, c * _ - a * g, a * m - l * _];
}
function tg(n) {
  return Math.sqrt(Math.pow(n[0], 2) + Math.pow(n[1], 2) + Math.pow(n[2], 2));
}
function dr(n, i) {
  const a = cM(n, i) / (tg(n) * tg(i));
  return Math.acos(Math.min(Math.max(a, -1), 1));
}
function el(n) {
  const i = ns(n[1]), a = ns(n[0]);
  return [
    Math.cos(i) * Math.cos(a),
    Math.cos(i) * Math.sin(a),
    Math.sin(i)
  ];
}
function _r(n) {
  const [i, a, l] = n, c = zf(Math.asin(l));
  return [zf(Math.atan2(a, i)), c];
}
function gM(n, i, a) {
  const l = el(n), c = el(i), _ = el(a), [m, g, v] = _, [M, w, E] = fM(l, c), k = w * v - E * g, P = E * m - M * v, C = M * g - w * m, L = C * w - P * E, D = k * E - C * M, B = P * M - k * w, j = 1 / Math.sqrt(Math.pow(L, 2) + Math.pow(D, 2) + Math.pow(B, 2)), U = [L * j, D * j, B * j], X = [-1 * L * j, -1 * D * j, -1 * B * j], Y = dr(l, c), H = dr(l, U), Z = dr(c, U), et = dr(l, X), $ = dr(c, X);
  let dt;
  return H < et && H < $ || Z < et && Z < $ ? dt = U : dt = X, dr(l, dt) > Y || dr(c, dt) > Y ? Vn(_r(dt), _r(l)) <= Vn(_r(dt), _r(c)) ? [_r(l), !0, !1] : [_r(c), !1, !0] : [_r(dt), !1, !1];
}
var io = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function dM(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
function _M(n, i = {}) {
  const a = Ei(n), l = (a[0] + a[2]) / 2, c = (a[1] + a[3]) / 2;
  return Fi([l, c], i.properties, i);
}
var gl = { exports: {} }, mM = gl.exports, eg;
function yM() {
  return eg || (eg = 1, function(n, i) {
    (function(a, l) {
      n.exports = l();
    })(mM, function() {
      function a(u, t) {
        (t == null || t > u.length) && (t = u.length);
        for (var e = 0, s = Array(t); e < t; e++) s[e] = u[e];
        return s;
      }
      function l(u, t, e) {
        return t = w(t), function(s, h) {
          if (h && (typeof h == "object" || typeof h == "function")) return h;
          if (h !== void 0) throw new TypeError("Derived constructors may only return object or undefined");
          return function(d) {
            if (d === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return d;
          }(s);
        }(u, k() ? Reflect.construct(t, e || [], w(u).constructor) : t.apply(u, e));
      }
      function c(u, t) {
        if (!(u instanceof t)) throw new TypeError("Cannot call a class as a function");
      }
      function _(u, t, e) {
        if (k()) return Reflect.construct.apply(null, arguments);
        var s = [null];
        s.push.apply(s, t);
        var h = new (u.bind.apply(u, s))();
        return e && P(h, e.prototype), h;
      }
      function m(u, t) {
        for (var e = 0; e < t.length; e++) {
          var s = t[e];
          s.enumerable = s.enumerable || !1, s.configurable = !0, "value" in s && (s.writable = !0), Object.defineProperty(u, D(s.key), s);
        }
      }
      function g(u, t, e) {
        return t && m(u.prototype, t), e && m(u, e), Object.defineProperty(u, "prototype", { writable: !1 }), u;
      }
      function v(u, t) {
        var e = typeof Symbol < "u" && u[Symbol.iterator] || u["@@iterator"];
        if (!e) {
          if (Array.isArray(u) || (e = B(u)) || t) {
            e && (u = e);
            var s = 0, h = function() {
            };
            return { s: h, n: function() {
              return s >= u.length ? { done: !0 } : { done: !1, value: u[s++] };
            }, e: function(I) {
              throw I;
            }, f: h };
          }
          throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
        }
        var d, y = !0, x = !1;
        return { s: function() {
          e = e.call(u);
        }, n: function() {
          var I = e.next();
          return y = I.done, I;
        }, e: function(I) {
          x = !0, d = I;
        }, f: function() {
          try {
            y || e.return == null || e.return();
          } finally {
            if (x) throw d;
          }
        } };
      }
      function M() {
        return M = typeof Reflect < "u" && Reflect.get ? Reflect.get.bind() : function(u, t, e) {
          var s = function(d, y) {
            for (; !{}.hasOwnProperty.call(d, y) && (d = w(d)) !== null; ) ;
            return d;
          }(u, t);
          if (s) {
            var h = Object.getOwnPropertyDescriptor(s, t);
            return h.get ? h.get.call(arguments.length < 3 ? u : e) : h.value;
          }
        }, M.apply(null, arguments);
      }
      function w(u) {
        return w = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t) {
          return t.__proto__ || Object.getPrototypeOf(t);
        }, w(u);
      }
      function E(u, t) {
        if (typeof t != "function" && t !== null) throw new TypeError("Super expression must either be null or a function");
        u.prototype = Object.create(t && t.prototype, { constructor: { value: u, writable: !0, configurable: !0 } }), Object.defineProperty(u, "prototype", { writable: !1 }), t && P(u, t);
      }
      function k() {
        try {
          var u = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
          }));
        } catch {
        }
        return (k = function() {
          return !!u;
        })();
      }
      function P(u, t) {
        return P = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(e, s) {
          return e.__proto__ = s, e;
        }, P(u, t);
      }
      function C(u, t, e, s) {
        var h = M(w(1 & s ? u.prototype : u), t, e);
        return 2 & s && typeof h == "function" ? function(d) {
          return h.apply(e, d);
        } : h;
      }
      function L(u) {
        return function(t) {
          if (Array.isArray(t)) return a(t);
        }(u) || function(t) {
          if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
        }(u) || B(u) || function() {
          throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
        }();
      }
      function D(u) {
        var t = function(e, s) {
          if (typeof e != "object" || !e) return e;
          var h = e[Symbol.toPrimitive];
          if (h !== void 0) {
            var d = h.call(e, s);
            if (typeof d != "object") return d;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return String(e);
        }(u, "string");
        return typeof t == "symbol" ? t : t + "";
      }
      function B(u, t) {
        if (u) {
          if (typeof u == "string") return a(u, t);
          var e = {}.toString.call(u).slice(8, -1);
          return e === "Object" && u.constructor && (e = u.constructor.name), e === "Map" || e === "Set" ? Array.from(u) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? a(u, t) : void 0;
        }
      }
      function j(u) {
        var t = typeof Map == "function" ? /* @__PURE__ */ new Map() : void 0;
        return j = function(e) {
          if (e === null || !function(h) {
            try {
              return Function.toString.call(h).indexOf("[native code]") !== -1;
            } catch {
              return typeof h == "function";
            }
          }(e)) return e;
          if (typeof e != "function") throw new TypeError("Super expression must either be null or a function");
          if (t !== void 0) {
            if (t.has(e)) return t.get(e);
            t.set(e, s);
          }
          function s() {
            return _(e, arguments, w(this).constructor);
          }
          return s.prototype = Object.create(e.prototype, { constructor: { value: s, enumerable: !1, writable: !0, configurable: !0 } }), P(s, e);
        }, j(u);
      }
      var U = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getEndCapStyle", value: function() {
          return this._endCapStyle;
        } }, { key: "isSingleSided", value: function() {
          return this._isSingleSided;
        } }, { key: "setQuadrantSegments", value: function(t) {
          this._quadrantSegments = t, this._quadrantSegments === 0 && (this._joinStyle = u.JOIN_BEVEL), this._quadrantSegments < 0 && (this._joinStyle = u.JOIN_MITRE, this._mitreLimit = Math.abs(this._quadrantSegments)), t <= 0 && (this._quadrantSegments = 1), this._joinStyle !== u.JOIN_ROUND && (this._quadrantSegments = u.DEFAULT_QUADRANT_SEGMENTS);
        } }, { key: "getJoinStyle", value: function() {
          return this._joinStyle;
        } }, { key: "setJoinStyle", value: function(t) {
          this._joinStyle = t;
        } }, { key: "setSimplifyFactor", value: function(t) {
          this._simplifyFactor = t < 0 ? 0 : t;
        } }, { key: "getSimplifyFactor", value: function() {
          return this._simplifyFactor;
        } }, { key: "getQuadrantSegments", value: function() {
          return this._quadrantSegments;
        } }, { key: "setEndCapStyle", value: function(t) {
          this._endCapStyle = t;
        } }, { key: "getMitreLimit", value: function() {
          return this._mitreLimit;
        } }, { key: "setMitreLimit", value: function(t) {
          this._mitreLimit = t;
        } }, { key: "setSingleSided", value: function(t) {
          this._isSingleSided = t;
        } }], [{ key: "constructor_", value: function() {
          if (this._quadrantSegments = u.DEFAULT_QUADRANT_SEGMENTS, this._endCapStyle = u.CAP_ROUND, this._joinStyle = u.JOIN_ROUND, this._mitreLimit = u.DEFAULT_MITRE_LIMIT, this._isSingleSided = !1, this._simplifyFactor = u.DEFAULT_SIMPLIFY_FACTOR, arguments.length !== 0) {
            if (arguments.length === 1) {
              var t = arguments[0];
              this.setQuadrantSegments(t);
            } else if (arguments.length === 2) {
              var e = arguments[0], s = arguments[1];
              this.setQuadrantSegments(e), this.setEndCapStyle(s);
            } else if (arguments.length === 4) {
              var h = arguments[0], d = arguments[1], y = arguments[2], x = arguments[3];
              this.setQuadrantSegments(h), this.setEndCapStyle(d), this.setJoinStyle(y), this.setMitreLimit(x);
            }
          }
        } }, { key: "bufferDistanceError", value: function(t) {
          var e = Math.PI / 2 / t;
          return 1 - Math.cos(e / 2);
        } }]);
      }();
      U.CAP_ROUND = 1, U.CAP_FLAT = 2, U.CAP_SQUARE = 3, U.JOIN_ROUND = 1, U.JOIN_MITRE = 2, U.JOIN_BEVEL = 3, U.DEFAULT_QUADRANT_SEGMENTS = 8, U.DEFAULT_MITRE_LIMIT = 5, U.DEFAULT_SIMPLIFY_FACTOR = 0.01;
      var X = function(u) {
        function t(e) {
          var s;
          return c(this, t), (s = l(this, t, [e])).name = Object.keys({ Exception: t })[0], s;
        }
        return E(t, u), g(t, [{ key: "toString", value: function() {
          return this.message;
        } }]);
      }(j(Error)), Y = function(u) {
        function t(e) {
          var s;
          return c(this, t), (s = l(this, t, [e])).name = Object.keys({ IllegalArgumentException: t })[0], s;
        }
        return E(t, u), g(t);
      }(X), H = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "filter", value: function(u) {
        } }]);
      }();
      function Z() {
      }
      function et() {
      }
      function $() {
      }
      var dt, _t, Mt, Ct, it, wt, Gt, Dt, Vt = function() {
        return g(function u() {
          c(this, u);
        }, null, [{ key: "equalsWithTolerance", value: function(u, t, e) {
          return Math.abs(u - t) <= e;
        } }]);
      }(), he = function() {
        return g(function u(t, e) {
          c(this, u), this.low = e || 0, this.high = t || 0;
        }, null, [{ key: "toBinaryString", value: function(u) {
          var t, e = "";
          for (t = 2147483648; t > 0; t >>>= 1) e += (u.high & t) === t ? "1" : "0";
          for (t = 2147483648; t > 0; t >>>= 1) e += (u.low & t) === t ? "1" : "0";
          return e;
        } }]);
      }();
      function ht() {
      }
      function Kt() {
      }
      ht.NaN = NaN, ht.isNaN = function(u) {
        return Number.isNaN(u);
      }, ht.isInfinite = function(u) {
        return !Number.isFinite(u);
      }, ht.MAX_VALUE = Number.MAX_VALUE, ht.POSITIVE_INFINITY = Number.POSITIVE_INFINITY, ht.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY, typeof Float64Array == "function" && typeof Int32Array == "function" ? (wt = 2146435072, Gt = new Float64Array(1), Dt = new Int32Array(Gt.buffer), ht.doubleToLongBits = function(u) {
        Gt[0] = u;
        var t = 0 | Dt[0], e = 0 | Dt[1];
        return (e & wt) === wt && 1048575 & e && t !== 0 && (t = 0, e = 2146959360), new he(e, t);
      }, ht.longBitsToDouble = function(u) {
        return Dt[0] = u.low, Dt[1] = u.high, Gt[0];
      }) : (dt = 1023, _t = Math.log2, Mt = Math.floor, Ct = Math.pow, it = function() {
        for (var u = 53; u > 0; u--) {
          var t = Ct(2, u) - 1;
          if (Mt(_t(t)) + 1 === u) return t;
        }
        return 0;
      }(), ht.doubleToLongBits = function(u) {
        var t, e, s, h, d, y, x, I, T;
        if (u < 0 || 1 / u === Number.NEGATIVE_INFINITY ? (y = 1 << 31, u = -u) : y = 0, u === 0) return new he(I = y, T = 0);
        if (u === 1 / 0) return new he(I = 2146435072 | y, T = 0);
        if (u != u) return new he(I = 2146959360, T = 0);
        if (h = 0, T = 0, (t = Mt(u)) > 1) if (t <= it) (h = Mt(_t(t))) <= 20 ? (T = 0, I = t << 20 - h & 1048575) : (T = t % (e = Ct(2, s = h - 20)) << 32 - s, I = t / e & 1048575);
        else for (s = t, T = 0; (s = Mt(e = s / 2)) !== 0; ) h++, T >>>= 1, T |= (1 & I) << 31, I >>>= 1, e !== s && (I |= 524288);
        if (x = h + dt, d = t === 0, t = u - t, h < 52 && t !== 0) for (s = 0; ; ) {
          if ((e = 2 * t) >= 1 ? (t = e - 1, d ? (x--, d = !1) : (s <<= 1, s |= 1, h++)) : (t = e, d ? --x == 0 && (h++, d = !1) : (s <<= 1, h++)), h === 20) I |= s, s = 0;
          else if (h === 52) {
            T |= s;
            break;
          }
          if (e === 1) {
            h < 20 ? I |= s << 20 - h : h < 52 && (T |= s << 52 - h);
            break;
          }
        }
        return I |= x << 20, new he(I |= y, T);
      }, ht.longBitsToDouble = function(u) {
        var t, e, s, h, d = u.high, y = u.low, x = d & 1 << 31 ? -1 : 1;
        for (s = ((2146435072 & d) >> 20) - dt, h = 0, e = 1 << 19, t = 1; t <= 20; t++) d & e && (h += Ct(2, -t)), e >>>= 1;
        for (e = 1 << 31, t = 21; t <= 52; t++) y & e && (h += Ct(2, -t)), e >>>= 1;
        if (s === -1023) {
          if (h === 0) return 0 * x;
          s = -1022;
        } else {
          if (s === 1024) return h === 0 ? x / 0 : NaN;
          h += 1;
        }
        return x * h * Ct(2, s);
      });
      var le = function(u) {
        function t(e) {
          var s;
          return c(this, t), (s = l(this, t, [e])).name = Object.keys({ RuntimeException: t })[0], s;
        }
        return E(t, u), g(t);
      }(X), Me = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, null, [{ key: "constructor_", value: function() {
          if (arguments.length === 0) le.constructor_.call(this);
          else if (arguments.length === 1) {
            var e = arguments[0];
            le.constructor_.call(this, e);
          }
        } }]);
      }(le), It = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "shouldNeverReachHere", value: function() {
          if (arguments.length === 0) u.shouldNeverReachHere(null);
          else if (arguments.length === 1) {
            var t = arguments[0];
            throw new Me("Should never reach here" + (t !== null ? ": " + t : ""));
          }
        } }, { key: "isTrue", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            u.isTrue(t, null);
          } else if (arguments.length === 2) {
            var e = arguments[1];
            if (!arguments[0]) throw e === null ? new Me() : new Me(e);
          }
        } }, { key: "equals", value: function() {
          if (arguments.length === 2) {
            var t = arguments[0], e = arguments[1];
            u.equals(t, e, null);
          } else if (arguments.length === 3) {
            var s = arguments[0], h = arguments[1], d = arguments[2];
            if (!h.equals(s)) throw new Me("Expected " + s + " but encountered " + h + (d !== null ? ": " + d : ""));
          }
        } }]);
      }(), ke = new ArrayBuffer(8), xr = new Float64Array(ke), Ba = new Int32Array(ke), z = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getM", value: function() {
          return ht.NaN;
        } }, { key: "setOrdinate", value: function(t, e) {
          switch (t) {
            case u.X:
              this.x = e;
              break;
            case u.Y:
              this.y = e;
              break;
            case u.Z:
              this.setZ(e);
              break;
            default:
              throw new Y("Invalid ordinate index: " + t);
          }
        } }, { key: "equals2D", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return this.x === t.x && this.y === t.y;
          }
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            return !!Vt.equalsWithTolerance(this.x, e.x, s) && !!Vt.equalsWithTolerance(this.y, e.y, s);
          }
        } }, { key: "setM", value: function(t) {
          throw new Y("Invalid ordinate index: " + u.M);
        } }, { key: "getZ", value: function() {
          return this.z;
        } }, { key: "getOrdinate", value: function(t) {
          switch (t) {
            case u.X:
              return this.x;
            case u.Y:
              return this.y;
            case u.Z:
              return this.getZ();
          }
          throw new Y("Invalid ordinate index: " + t);
        } }, { key: "equals3D", value: function(t) {
          return this.x === t.x && this.y === t.y && (this.getZ() === t.getZ() || ht.isNaN(this.getZ()) && ht.isNaN(t.getZ()));
        } }, { key: "equals", value: function(t) {
          return t instanceof u && this.equals2D(t);
        } }, { key: "equalInZ", value: function(t, e) {
          return Vt.equalsWithTolerance(this.getZ(), t.getZ(), e);
        } }, { key: "setX", value: function(t) {
          this.x = t;
        } }, { key: "compareTo", value: function(t) {
          var e = t;
          return this.x < e.x ? -1 : this.x > e.x ? 1 : this.y < e.y ? -1 : this.y > e.y ? 1 : 0;
        } }, { key: "getX", value: function() {
          return this.x;
        } }, { key: "setZ", value: function(t) {
          this.z = t;
        } }, { key: "clone", value: function() {
          try {
            return null;
          } catch (t) {
            if (t instanceof CloneNotSupportedException) return It.shouldNeverReachHere("this shouldn't happen because this class is Cloneable"), null;
            throw t;
          }
        } }, { key: "copy", value: function() {
          return new u(this);
        } }, { key: "toString", value: function() {
          return "(" + this.x + ", " + this.y + ", " + this.getZ() + ")";
        } }, { key: "distance3D", value: function(t) {
          var e = this.x - t.x, s = this.y - t.y, h = this.getZ() - t.getZ();
          return Math.sqrt(e * e + s * s + h * h);
        } }, { key: "getY", value: function() {
          return this.y;
        } }, { key: "setY", value: function(t) {
          this.y = t;
        } }, { key: "distance", value: function(t) {
          var e = this.x - t.x, s = this.y - t.y;
          return Math.sqrt(e * e + s * s);
        } }, { key: "hashCode", value: function() {
          var t = 17;
          return t = 37 * (t = 37 * t + u.hashCode(this.x)) + u.hashCode(this.y);
        } }, { key: "setCoordinate", value: function(t) {
          this.x = t.x, this.y = t.y, this.z = t.getZ();
        } }, { key: "interfaces_", get: function() {
          return [Z, et, $];
        } }], [{ key: "constructor_", value: function() {
          if (this.x = null, this.y = null, this.z = null, arguments.length === 0) u.constructor_.call(this, 0, 0);
          else if (arguments.length === 1) {
            var t = arguments[0];
            u.constructor_.call(this, t.x, t.y, t.getZ());
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            u.constructor_.call(this, e, s, u.NULL_ORDINATE);
          } else if (arguments.length === 3) {
            var h = arguments[0], d = arguments[1], y = arguments[2];
            this.x = h, this.y = d, this.z = y;
          }
        } }, { key: "hashCode", value: function(t) {
          return xr[0] = t, Ba[0] ^ Ba[1];
        } }]);
      }(), Vi = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "compare", value: function(t, e) {
          var s = u.compare(t.x, e.x);
          if (s !== 0) return s;
          var h = u.compare(t.y, e.y);
          return h !== 0 ? h : this._dimensionsToTest <= 2 ? 0 : u.compare(t.getZ(), e.getZ());
        } }, { key: "interfaces_", get: function() {
          return [Kt];
        } }], [{ key: "constructor_", value: function() {
          if (this._dimensionsToTest = 2, arguments.length === 0) u.constructor_.call(this, 2);
          else if (arguments.length === 1) {
            var t = arguments[0];
            if (t !== 2 && t !== 3) throw new Y("only 2 or 3 dimensions may be specified");
            this._dimensionsToTest = t;
          }
        } }, { key: "compare", value: function(t, e) {
          return t < e ? -1 : t > e ? 1 : ht.isNaN(t) ? ht.isNaN(e) ? 0 : -1 : ht.isNaN(e) ? 1 : 0;
        } }]);
      }();
      z.DimensionalComparator = Vi, z.NULL_ORDINATE = ht.NaN, z.X = 0, z.Y = 1, z.Z = 2, z.M = 3;
      var Wt = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getArea", value: function() {
          return this.getWidth() * this.getHeight();
        } }, { key: "equals", value: function(t) {
          if (!(t instanceof u)) return !1;
          var e = t;
          return this.isNull() ? e.isNull() : this._maxx === e.getMaxX() && this._maxy === e.getMaxY() && this._minx === e.getMinX() && this._miny === e.getMinY();
        } }, { key: "intersection", value: function(t) {
          if (this.isNull() || t.isNull() || !this.intersects(t)) return new u();
          var e = this._minx > t._minx ? this._minx : t._minx, s = this._miny > t._miny ? this._miny : t._miny;
          return new u(e, this._maxx < t._maxx ? this._maxx : t._maxx, s, this._maxy < t._maxy ? this._maxy : t._maxy);
        } }, { key: "isNull", value: function() {
          return this._maxx < this._minx;
        } }, { key: "getMaxX", value: function() {
          return this._maxx;
        } }, { key: "covers", value: function() {
          if (arguments.length === 1) {
            if (arguments[0] instanceof z) {
              var t = arguments[0];
              return this.covers(t.x, t.y);
            }
            if (arguments[0] instanceof u) {
              var e = arguments[0];
              return !this.isNull() && !e.isNull() && e.getMinX() >= this._minx && e.getMaxX() <= this._maxx && e.getMinY() >= this._miny && e.getMaxY() <= this._maxy;
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            return !this.isNull() && s >= this._minx && s <= this._maxx && h >= this._miny && h <= this._maxy;
          }
        } }, { key: "intersects", value: function() {
          if (arguments.length === 1) {
            if (arguments[0] instanceof u) {
              var t = arguments[0];
              return !this.isNull() && !t.isNull() && !(t._minx > this._maxx || t._maxx < this._minx || t._miny > this._maxy || t._maxy < this._miny);
            }
            if (arguments[0] instanceof z) {
              var e = arguments[0];
              return this.intersects(e.x, e.y);
            }
          } else if (arguments.length === 2) {
            if (arguments[0] instanceof z && arguments[1] instanceof z) {
              var s = arguments[0], h = arguments[1];
              return !this.isNull() && !((s.x < h.x ? s.x : h.x) > this._maxx) && !((s.x > h.x ? s.x : h.x) < this._minx) && !((s.y < h.y ? s.y : h.y) > this._maxy) && !((s.y > h.y ? s.y : h.y) < this._miny);
            }
            if (typeof arguments[0] == "number" && typeof arguments[1] == "number") {
              var d = arguments[0], y = arguments[1];
              return !this.isNull() && !(d > this._maxx || d < this._minx || y > this._maxy || y < this._miny);
            }
          }
        } }, { key: "getMinY", value: function() {
          return this._miny;
        } }, { key: "getDiameter", value: function() {
          if (this.isNull()) return 0;
          var t = this.getWidth(), e = this.getHeight();
          return Math.sqrt(t * t + e * e);
        } }, { key: "getMinX", value: function() {
          return this._minx;
        } }, { key: "expandToInclude", value: function() {
          if (arguments.length === 1) {
            if (arguments[0] instanceof z) {
              var t = arguments[0];
              this.expandToInclude(t.x, t.y);
            } else if (arguments[0] instanceof u) {
              var e = arguments[0];
              if (e.isNull()) return null;
              this.isNull() ? (this._minx = e.getMinX(), this._maxx = e.getMaxX(), this._miny = e.getMinY(), this._maxy = e.getMaxY()) : (e._minx < this._minx && (this._minx = e._minx), e._maxx > this._maxx && (this._maxx = e._maxx), e._miny < this._miny && (this._miny = e._miny), e._maxy > this._maxy && (this._maxy = e._maxy));
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            this.isNull() ? (this._minx = s, this._maxx = s, this._miny = h, this._maxy = h) : (s < this._minx && (this._minx = s), s > this._maxx && (this._maxx = s), h < this._miny && (this._miny = h), h > this._maxy && (this._maxy = h));
          }
        } }, { key: "minExtent", value: function() {
          if (this.isNull()) return 0;
          var t = this.getWidth(), e = this.getHeight();
          return t < e ? t : e;
        } }, { key: "getWidth", value: function() {
          return this.isNull() ? 0 : this._maxx - this._minx;
        } }, { key: "compareTo", value: function(t) {
          var e = t;
          return this.isNull() ? e.isNull() ? 0 : -1 : e.isNull() ? 1 : this._minx < e._minx ? -1 : this._minx > e._minx ? 1 : this._miny < e._miny ? -1 : this._miny > e._miny ? 1 : this._maxx < e._maxx ? -1 : this._maxx > e._maxx ? 1 : this._maxy < e._maxy ? -1 : this._maxy > e._maxy ? 1 : 0;
        } }, { key: "translate", value: function(t, e) {
          if (this.isNull()) return null;
          this.init(this.getMinX() + t, this.getMaxX() + t, this.getMinY() + e, this.getMaxY() + e);
        } }, { key: "copy", value: function() {
          return new u(this);
        } }, { key: "toString", value: function() {
          return "Env[" + this._minx + " : " + this._maxx + ", " + this._miny + " : " + this._maxy + "]";
        } }, { key: "setToNull", value: function() {
          this._minx = 0, this._maxx = -1, this._miny = 0, this._maxy = -1;
        } }, { key: "disjoint", value: function(t) {
          return !(!this.isNull() && !t.isNull()) || t._minx > this._maxx || t._maxx < this._minx || t._miny > this._maxy || t._maxy < this._miny;
        } }, { key: "getHeight", value: function() {
          return this.isNull() ? 0 : this._maxy - this._miny;
        } }, { key: "maxExtent", value: function() {
          if (this.isNull()) return 0;
          var t = this.getWidth(), e = this.getHeight();
          return t > e ? t : e;
        } }, { key: "expandBy", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            this.expandBy(t, t);
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            if (this.isNull()) return null;
            this._minx -= e, this._maxx += e, this._miny -= s, this._maxy += s, (this._minx > this._maxx || this._miny > this._maxy) && this.setToNull();
          }
        } }, { key: "contains", value: function() {
          if (arguments.length === 1) {
            if (arguments[0] instanceof u) {
              var t = arguments[0];
              return this.covers(t);
            }
            if (arguments[0] instanceof z) {
              var e = arguments[0];
              return this.covers(e);
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            return this.covers(s, h);
          }
        } }, { key: "centre", value: function() {
          return this.isNull() ? null : new z((this.getMinX() + this.getMaxX()) / 2, (this.getMinY() + this.getMaxY()) / 2);
        } }, { key: "init", value: function() {
          if (arguments.length === 0) this.setToNull();
          else if (arguments.length === 1) {
            if (arguments[0] instanceof z) {
              var t = arguments[0];
              this.init(t.x, t.x, t.y, t.y);
            } else if (arguments[0] instanceof u) {
              var e = arguments[0];
              this._minx = e._minx, this._maxx = e._maxx, this._miny = e._miny, this._maxy = e._maxy;
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            this.init(s.x, h.x, s.y, h.y);
          } else if (arguments.length === 4) {
            var d = arguments[0], y = arguments[1], x = arguments[2], I = arguments[3];
            d < y ? (this._minx = d, this._maxx = y) : (this._minx = y, this._maxx = d), x < I ? (this._miny = x, this._maxy = I) : (this._miny = I, this._maxy = x);
          }
        } }, { key: "getMaxY", value: function() {
          return this._maxy;
        } }, { key: "distance", value: function(t) {
          if (this.intersects(t)) return 0;
          var e = 0;
          this._maxx < t._minx ? e = t._minx - this._maxx : this._minx > t._maxx && (e = this._minx - t._maxx);
          var s = 0;
          return this._maxy < t._miny ? s = t._miny - this._maxy : this._miny > t._maxy && (s = this._miny - t._maxy), e === 0 ? s : s === 0 ? e : Math.sqrt(e * e + s * s);
        } }, { key: "hashCode", value: function() {
          var t = 17;
          return t = 37 * (t = 37 * (t = 37 * (t = 37 * t + z.hashCode(this._minx)) + z.hashCode(this._maxx)) + z.hashCode(this._miny)) + z.hashCode(this._maxy);
        } }, { key: "interfaces_", get: function() {
          return [Z, $];
        } }], [{ key: "constructor_", value: function() {
          if (this._minx = null, this._maxx = null, this._miny = null, this._maxy = null, arguments.length === 0) this.init();
          else if (arguments.length === 1) {
            if (arguments[0] instanceof z) {
              var t = arguments[0];
              this.init(t.x, t.x, t.y, t.y);
            } else if (arguments[0] instanceof u) {
              var e = arguments[0];
              this.init(e);
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            this.init(s.x, h.x, s.y, h.y);
          } else if (arguments.length === 4) {
            var d = arguments[0], y = arguments[1], x = arguments[2], I = arguments[3];
            this.init(d, y, x, I);
          }
        } }, { key: "intersects", value: function() {
          if (arguments.length === 3) {
            var t = arguments[0], e = arguments[1], s = arguments[2];
            return s.x >= (t.x < e.x ? t.x : e.x) && s.x <= (t.x > e.x ? t.x : e.x) && s.y >= (t.y < e.y ? t.y : e.y) && s.y <= (t.y > e.y ? t.y : e.y);
          }
          if (arguments.length === 4) {
            var h = arguments[0], d = arguments[1], y = arguments[2], x = arguments[3], I = Math.min(y.x, x.x), T = Math.max(y.x, x.x), G = Math.min(h.x, d.x), q = Math.max(h.x, d.x);
            return !(G > T) && !(q < I) && (I = Math.min(y.y, x.y), T = Math.max(y.y, x.y), G = Math.min(h.y, d.y), q = Math.max(h.y, d.y), !(G > T) && !(q < I));
          }
        } }]);
      }(), ct = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "isGeometryCollection", value: function() {
          return this.getTypeCode() === u.TYPECODE_GEOMETRYCOLLECTION;
        } }, { key: "getFactory", value: function() {
          return this._factory;
        } }, { key: "getGeometryN", value: function(t) {
          return this;
        } }, { key: "getArea", value: function() {
          return 0;
        } }, { key: "isRectangle", value: function() {
          return !1;
        } }, { key: "equalsExact", value: function(t) {
          return this === t || this.equalsExact(t, 0);
        } }, { key: "geometryChanged", value: function() {
          this.apply(u.geometryChangedFilter);
        } }, { key: "geometryChangedAction", value: function() {
          this._envelope = null;
        } }, { key: "equalsNorm", value: function(t) {
          return t !== null && this.norm().equalsExact(t.norm());
        } }, { key: "getLength", value: function() {
          return 0;
        } }, { key: "getNumGeometries", value: function() {
          return 1;
        } }, { key: "compareTo", value: function() {
          var t;
          if (arguments.length === 1) {
            var e = arguments[0];
            return t = e, this.getTypeCode() !== t.getTypeCode() ? this.getTypeCode() - t.getTypeCode() : this.isEmpty() && t.isEmpty() ? 0 : this.isEmpty() ? -1 : t.isEmpty() ? 1 : this.compareToSameClass(e);
          }
          if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            return t = s, this.getTypeCode() !== t.getTypeCode() ? this.getTypeCode() - t.getTypeCode() : this.isEmpty() && t.isEmpty() ? 0 : this.isEmpty() ? -1 : t.isEmpty() ? 1 : this.compareToSameClass(s, h);
          }
        } }, { key: "getUserData", value: function() {
          return this._userData;
        } }, { key: "getSRID", value: function() {
          return this._SRID;
        } }, { key: "getEnvelope", value: function() {
          return this.getFactory().toGeometry(this.getEnvelopeInternal());
        } }, { key: "checkNotGeometryCollection", value: function(t) {
          if (t.getTypeCode() === u.TYPECODE_GEOMETRYCOLLECTION) throw new Y("This method does not support GeometryCollection arguments");
        } }, { key: "equal", value: function(t, e, s) {
          return s === 0 ? t.equals(e) : t.distance(e) <= s;
        } }, { key: "norm", value: function() {
          var t = this.copy();
          return t.normalize(), t;
        } }, { key: "reverse", value: function() {
          var t = this.reverseInternal();
          return this.envelope != null && (t.envelope = this.envelope.copy()), t.setSRID(this.getSRID()), t;
        } }, { key: "copy", value: function() {
          var t = this.copyInternal();
          return t.envelope = this._envelope == null ? null : this._envelope.copy(), t._SRID = this._SRID, t._userData = this._userData, t;
        } }, { key: "getPrecisionModel", value: function() {
          return this._factory.getPrecisionModel();
        } }, { key: "getEnvelopeInternal", value: function() {
          return this._envelope === null && (this._envelope = this.computeEnvelopeInternal()), new Wt(this._envelope);
        } }, { key: "setSRID", value: function(t) {
          this._SRID = t;
        } }, { key: "setUserData", value: function(t) {
          this._userData = t;
        } }, { key: "compare", value: function(t, e) {
          for (var s = t.iterator(), h = e.iterator(); s.hasNext() && h.hasNext(); ) {
            var d = s.next(), y = h.next(), x = d.compareTo(y);
            if (x !== 0) return x;
          }
          return s.hasNext() ? 1 : h.hasNext() ? -1 : 0;
        } }, { key: "hashCode", value: function() {
          return this.getEnvelopeInternal().hashCode();
        } }, { key: "isEquivalentClass", value: function(t) {
          return this.getClass() === t.getClass();
        } }, { key: "isGeometryCollectionOrDerived", value: function() {
          return this.getTypeCode() === u.TYPECODE_GEOMETRYCOLLECTION || this.getTypeCode() === u.TYPECODE_MULTIPOINT || this.getTypeCode() === u.TYPECODE_MULTILINESTRING || this.getTypeCode() === u.TYPECODE_MULTIPOLYGON;
        } }, { key: "interfaces_", get: function() {
          return [et, Z, $];
        } }, { key: "getClass", value: function() {
          return u;
        } }], [{ key: "hasNonEmptyElements", value: function(t) {
          for (var e = 0; e < t.length; e++) if (!t[e].isEmpty()) return !0;
          return !1;
        } }, { key: "hasNullElements", value: function(t) {
          for (var e = 0; e < t.length; e++) if (t[e] === null) return !0;
          return !1;
        } }]);
      }();
      ct.constructor_ = function(u) {
        u && (this._envelope = null, this._userData = null, this._factory = u, this._SRID = u.getSRID());
      }, ct.TYPECODE_POINT = 0, ct.TYPECODE_MULTIPOINT = 1, ct.TYPECODE_LINESTRING = 2, ct.TYPECODE_LINEARRING = 3, ct.TYPECODE_MULTILINESTRING = 4, ct.TYPECODE_POLYGON = 5, ct.TYPECODE_MULTIPOLYGON = 6, ct.TYPECODE_GEOMETRYCOLLECTION = 7, ct.TYPENAME_POINT = "Point", ct.TYPENAME_MULTIPOINT = "MultiPoint", ct.TYPENAME_LINESTRING = "LineString", ct.TYPENAME_LINEARRING = "LinearRing", ct.TYPENAME_MULTILINESTRING = "MultiLineString", ct.TYPENAME_POLYGON = "Polygon", ct.TYPENAME_MULTIPOLYGON = "MultiPolygon", ct.TYPENAME_GEOMETRYCOLLECTION = "GeometryCollection", ct.geometryChangedFilter = { get interfaces_() {
        return [H];
      }, filter: function(u) {
        u.geometryChangedAction();
      } };
      var R = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "toLocationSymbol", value: function(t) {
          switch (t) {
            case u.EXTERIOR:
              return "e";
            case u.BOUNDARY:
              return "b";
            case u.INTERIOR:
              return "i";
            case u.NONE:
              return "-";
          }
          throw new Y("Unknown location value: " + t);
        } }]);
      }();
      R.INTERIOR = 0, R.BOUNDARY = 1, R.EXTERIOR = 2, R.NONE = -1;
      var nn = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "add", value: function() {
        } }, { key: "addAll", value: function() {
        } }, { key: "isEmpty", value: function() {
        } }, { key: "iterator", value: function() {
        } }, { key: "size", value: function() {
        } }, { key: "toArray", value: function() {
        } }, { key: "remove", value: function() {
        } }]);
      }(), we = function(u) {
        function t(e) {
          var s;
          return c(this, t), (s = l(this, t, [e])).name = Object.keys({ NoSuchElementException: t })[0], s;
        }
        return E(t, u), g(t);
      }(X), qe = function(u) {
        function t(e) {
          var s;
          return c(this, t), (s = l(this, t, [e])).name = Object.keys({ UnsupportedOperationException: t })[0], s;
        }
        return E(t, u), g(t);
      }(X), za = function(u) {
        function t() {
          return c(this, t), l(this, t, arguments);
        }
        return E(t, u), g(t, [{ key: "contains", value: function() {
        } }]);
      }(nn), rn = function(u) {
        function t(e) {
          var s;
          return c(this, t), (s = l(this, t)).map = /* @__PURE__ */ new Map(), e instanceof nn && s.addAll(e), s;
        }
        return E(t, u), g(t, [{ key: "contains", value: function(e) {
          var s = e.hashCode ? e.hashCode() : e;
          return !!this.map.has(s);
        } }, { key: "add", value: function(e) {
          var s = e.hashCode ? e.hashCode() : e;
          return !this.map.has(s) && !!this.map.set(s, e);
        } }, { key: "addAll", value: function(e) {
          var s, h = v(e);
          try {
            for (h.s(); !(s = h.n()).done; ) {
              var d = s.value;
              this.add(d);
            }
          } catch (y) {
            h.e(y);
          } finally {
            h.f();
          }
          return !0;
        } }, { key: "remove", value: function() {
          throw new qe();
        } }, { key: "size", value: function() {
          return this.map.size;
        } }, { key: "isEmpty", value: function() {
          return this.map.size === 0;
        } }, { key: "toArray", value: function() {
          return Array.from(this.map.values());
        } }, { key: "iterator", value: function() {
          return new ja(this.map);
        } }, { key: Symbol.iterator, value: function() {
          return this.map;
        } }]);
      }(za), ja = function() {
        return g(function u(t) {
          c(this, u), this.iterator = t.values();
          var e = this.iterator.next(), s = e.done, h = e.value;
          this.done = s, this.value = h;
        }, [{ key: "next", value: function() {
          if (this.done) throw new we();
          var u = this.value, t = this.iterator.next(), e = t.done, s = t.value;
          return this.done = e, this.value = s, u;
        } }, { key: "hasNext", value: function() {
          return !this.done;
        } }, { key: "remove", value: function() {
          throw new qe();
        } }]);
      }(), tt = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "opposite", value: function(t) {
          return t === u.LEFT ? u.RIGHT : t === u.RIGHT ? u.LEFT : t;
        } }]);
      }();
      tt.ON = 0, tt.LEFT = 1, tt.RIGHT = 2;
      var wi = function(u) {
        function t(e) {
          var s;
          return c(this, t), (s = l(this, t, [e])).name = Object.keys({ EmptyStackException: t })[0], s;
        }
        return E(t, u), g(t);
      }(X), Be = function(u) {
        function t(e) {
          var s;
          return c(this, t), (s = l(this, t, [e])).name = Object.keys({ IndexOutOfBoundsException: t })[0], s;
        }
        return E(t, u), g(t);
      }(X), sn = function(u) {
        function t() {
          return c(this, t), l(this, t, arguments);
        }
        return E(t, u), g(t, [{ key: "get", value: function() {
        } }, { key: "set", value: function() {
        } }, { key: "isEmpty", value: function() {
        } }]);
      }(nn), Er = function(u) {
        function t() {
          var e;
          return c(this, t), (e = l(this, t)).array = [], e;
        }
        return E(t, u), g(t, [{ key: "add", value: function(e) {
          return this.array.push(e), !0;
        } }, { key: "get", value: function(e) {
          if (e < 0 || e >= this.size()) throw new Be();
          return this.array[e];
        } }, { key: "push", value: function(e) {
          return this.array.push(e), e;
        } }, { key: "pop", value: function() {
          if (this.array.length === 0) throw new wi();
          return this.array.pop();
        } }, { key: "peek", value: function() {
          if (this.array.length === 0) throw new wi();
          return this.array[this.array.length - 1];
        } }, { key: "empty", value: function() {
          return this.array.length === 0;
        } }, { key: "isEmpty", value: function() {
          return this.empty();
        } }, { key: "search", value: function(e) {
          return this.array.indexOf(e);
        } }, { key: "size", value: function() {
          return this.array.length;
        } }, { key: "toArray", value: function() {
          return this.array.slice();
        } }]);
      }(sn);
      function kt(u, t) {
        return u.interfaces_ && u.interfaces_.indexOf(t) > -1;
      }
      var bn = function() {
        return g(function u(t) {
          c(this, u), this.str = t;
        }, [{ key: "append", value: function(u) {
          this.str += u;
        } }, { key: "setCharAt", value: function(u, t) {
          this.str = this.str.substr(0, u) + t + this.str.substr(u + 1);
        } }, { key: "toString", value: function() {
          return this.str;
        } }]);
      }(), Mr = function() {
        function u(t) {
          c(this, u), this.value = t;
        }
        return g(u, [{ key: "intValue", value: function() {
          return this.value;
        } }, { key: "compareTo", value: function(t) {
          return this.value < t ? -1 : this.value > t ? 1 : 0;
        } }], [{ key: "compare", value: function(t, e) {
          return t < e ? -1 : t > e ? 1 : 0;
        } }, { key: "isNan", value: function(t) {
          return Number.isNaN(t);
        } }, { key: "valueOf", value: function(t) {
          return new u(t);
        } }]);
      }(), Jn = function() {
        return g(function u() {
          c(this, u);
        }, null, [{ key: "isWhitespace", value: function(u) {
          return u <= 32 && u >= 0 || u === 127;
        } }, { key: "toUpperCase", value: function(u) {
          return u.toUpperCase();
        } }]);
      }(), mt = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "le", value: function(t) {
          return this._hi < t._hi || this._hi === t._hi && this._lo <= t._lo;
        } }, { key: "extractSignificantDigits", value: function(t, e) {
          var s = this.abs(), h = u.magnitude(s._hi), d = u.TEN.pow(h);
          (s = s.divide(d)).gt(u.TEN) ? (s = s.divide(u.TEN), h += 1) : s.lt(u.ONE) && (s = s.multiply(u.TEN), h -= 1);
          for (var y = h + 1, x = new bn(), I = u.MAX_PRINT_DIGITS - 1, T = 0; T <= I; T++) {
            t && T === y && x.append(".");
            var G = Math.trunc(s._hi);
            if (G < 0) break;
            var q = !1, K = 0;
            G > 9 ? (q = !0, K = "9") : K = "0" + G, x.append(K), s = s.subtract(u.valueOf(G)).multiply(u.TEN), q && s.selfAdd(u.TEN);
            var rt = !0, ot = u.magnitude(s._hi);
            if (ot < 0 && Math.abs(ot) >= I - T && (rt = !1), !rt) break;
          }
          return e[0] = h, x.toString();
        } }, { key: "sqr", value: function() {
          return this.multiply(this);
        } }, { key: "doubleValue", value: function() {
          return this._hi + this._lo;
        } }, { key: "subtract", value: function() {
          if (arguments[0] instanceof u) {
            var t = arguments[0];
            return this.add(t.negate());
          }
          if (typeof arguments[0] == "number") {
            var e = arguments[0];
            return this.add(-e);
          }
        } }, { key: "equals", value: function() {
          if (arguments.length === 1 && arguments[0] instanceof u) {
            var t = arguments[0];
            return this._hi === t._hi && this._lo === t._lo;
          }
        } }, { key: "isZero", value: function() {
          return this._hi === 0 && this._lo === 0;
        } }, { key: "selfSubtract", value: function() {
          if (arguments[0] instanceof u) {
            var t = arguments[0];
            return this.isNaN() ? this : this.selfAdd(-t._hi, -t._lo);
          }
          if (typeof arguments[0] == "number") {
            var e = arguments[0];
            return this.isNaN() ? this : this.selfAdd(-e, 0);
          }
        } }, { key: "getSpecialNumberString", value: function() {
          return this.isZero() ? "0.0" : this.isNaN() ? "NaN " : null;
        } }, { key: "min", value: function(t) {
          return this.le(t) ? this : t;
        } }, { key: "selfDivide", value: function() {
          if (arguments.length === 1) {
            if (arguments[0] instanceof u) {
              var t = arguments[0];
              return this.selfDivide(t._hi, t._lo);
            }
            if (typeof arguments[0] == "number") {
              var e = arguments[0];
              return this.selfDivide(e, 0);
            }
          } else if (arguments.length === 2) {
            var s, h, d, y, x = arguments[0], I = arguments[1], T = null, G = null, q = null, K = null;
            return d = this._hi / x, K = (T = (q = u.SPLIT * d) - (T = q - d)) * (G = (K = u.SPLIT * x) - (G = K - x)) - (y = d * x) + T * (h = x - G) + (s = d - T) * G + s * h, K = d + (q = (this._hi - y - K + this._lo - d * I) / x), this._hi = K, this._lo = d - K + q, this;
          }
        } }, { key: "dump", value: function() {
          return "DD<" + this._hi + ", " + this._lo + ">";
        } }, { key: "divide", value: function() {
          if (arguments[0] instanceof u) {
            var t, e, s, h, d = arguments[0], y = null, x = null, I = null, T = null;
            return t = (s = this._hi / d._hi) - (y = (I = u.SPLIT * s) - (y = I - s)), T = y * (x = (T = u.SPLIT * d._hi) - (x = T - d._hi)) - (h = s * d._hi) + y * (e = d._hi - x) + t * x + t * e, new u(T = s + (I = (this._hi - h - T + this._lo - s * d._lo) / d._hi), s - T + I);
          }
          if (typeof arguments[0] == "number") {
            var G = arguments[0];
            return ht.isNaN(G) ? u.createNaN() : u.copy(this).selfDivide(G, 0);
          }
        } }, { key: "ge", value: function(t) {
          return this._hi > t._hi || this._hi === t._hi && this._lo >= t._lo;
        } }, { key: "pow", value: function(t) {
          if (t === 0) return u.valueOf(1);
          var e = new u(this), s = u.valueOf(1), h = Math.abs(t);
          if (h > 1) for (; h > 0; ) h % 2 == 1 && s.selfMultiply(e), (h /= 2) > 0 && (e = e.sqr());
          else s = e;
          return t < 0 ? s.reciprocal() : s;
        } }, { key: "ceil", value: function() {
          if (this.isNaN()) return u.NaN;
          var t = Math.ceil(this._hi), e = 0;
          return t === this._hi && (e = Math.ceil(this._lo)), new u(t, e);
        } }, { key: "compareTo", value: function(t) {
          var e = t;
          return this._hi < e._hi ? -1 : this._hi > e._hi ? 1 : this._lo < e._lo ? -1 : this._lo > e._lo ? 1 : 0;
        } }, { key: "rint", value: function() {
          return this.isNaN() ? this : this.add(0.5).floor();
        } }, { key: "setValue", value: function() {
          if (arguments[0] instanceof u) {
            var t = arguments[0];
            return this.init(t), this;
          }
          if (typeof arguments[0] == "number") {
            var e = arguments[0];
            return this.init(e), this;
          }
        } }, { key: "max", value: function(t) {
          return this.ge(t) ? this : t;
        } }, { key: "sqrt", value: function() {
          if (this.isZero()) return u.valueOf(0);
          if (this.isNegative()) return u.NaN;
          var t = 1 / Math.sqrt(this._hi), e = this._hi * t, s = u.valueOf(e), h = this.subtract(s.sqr())._hi * (0.5 * t);
          return s.add(h);
        } }, { key: "selfAdd", value: function() {
          if (arguments.length === 1) {
            if (arguments[0] instanceof u) {
              var t = arguments[0];
              return this.selfAdd(t._hi, t._lo);
            }
            if (typeof arguments[0] == "number") {
              var e, s, h, d, y, x = arguments[0], I = null;
              return I = (h = this._hi + x) - (d = h - this._hi), s = (y = (I = x - d + (this._hi - I)) + this._lo) + (h - (e = h + y)), this._hi = e + s, this._lo = s + (e - this._hi), this;
            }
          } else if (arguments.length === 2) {
            var T, G, q, K, rt = arguments[0], ot = arguments[1], gt = null, Pt = null, lt = null;
            q = this._hi + rt, G = this._lo + ot, Pt = q - (lt = q - this._hi), gt = G - (K = G - this._lo);
            var Xt = (T = q + (lt = (Pt = rt - lt + (this._hi - Pt)) + G)) + (lt = (gt = ot - K + (this._lo - gt)) + (lt + (q - T))), fe = lt + (T - Xt);
            return this._hi = Xt, this._lo = fe, this;
          }
        } }, { key: "selfMultiply", value: function() {
          if (arguments.length === 1) {
            if (arguments[0] instanceof u) {
              var t = arguments[0];
              return this.selfMultiply(t._hi, t._lo);
            }
            if (typeof arguments[0] == "number") {
              var e = arguments[0];
              return this.selfMultiply(e, 0);
            }
          } else if (arguments.length === 2) {
            var s, h, d = arguments[0], y = arguments[1], x = null, I = null, T = null, G = null;
            x = (T = u.SPLIT * this._hi) - this._hi, G = u.SPLIT * d, x = T - x, s = this._hi - x, I = G - d;
            var q = (T = this._hi * d) + (G = x * (I = G - I) - T + x * (h = d - I) + s * I + s * h + (this._hi * y + this._lo * d)), K = G + (x = T - q);
            return this._hi = q, this._lo = K, this;
          }
        } }, { key: "selfSqr", value: function() {
          return this.selfMultiply(this);
        } }, { key: "floor", value: function() {
          if (this.isNaN()) return u.NaN;
          var t = Math.floor(this._hi), e = 0;
          return t === this._hi && (e = Math.floor(this._lo)), new u(t, e);
        } }, { key: "negate", value: function() {
          return this.isNaN() ? this : new u(-this._hi, -this._lo);
        } }, { key: "clone", value: function() {
          try {
            return null;
          } catch (t) {
            if (t instanceof CloneNotSupportedException) return null;
            throw t;
          }
        } }, { key: "multiply", value: function() {
          if (arguments[0] instanceof u) {
            var t = arguments[0];
            return t.isNaN() ? u.createNaN() : u.copy(this).selfMultiply(t);
          }
          if (typeof arguments[0] == "number") {
            var e = arguments[0];
            return ht.isNaN(e) ? u.createNaN() : u.copy(this).selfMultiply(e, 0);
          }
        } }, { key: "isNaN", value: function() {
          return ht.isNaN(this._hi);
        } }, { key: "intValue", value: function() {
          return Math.trunc(this._hi);
        } }, { key: "toString", value: function() {
          var t = u.magnitude(this._hi);
          return t >= -3 && t <= 20 ? this.toStandardNotation() : this.toSciNotation();
        } }, { key: "toStandardNotation", value: function() {
          var t = this.getSpecialNumberString();
          if (t !== null) return t;
          var e = new Array(1).fill(null), s = this.extractSignificantDigits(!0, e), h = e[0] + 1, d = s;
          if (s.charAt(0) === ".") d = "0" + s;
          else if (h < 0) d = "0." + u.stringOfChar("0", -h) + s;
          else if (s.indexOf(".") === -1) {
            var y = h - s.length;
            d = s + u.stringOfChar("0", y) + ".0";
          }
          return this.isNegative() ? "-" + d : d;
        } }, { key: "reciprocal", value: function() {
          var t, e, s, h, d = null, y = null, x = null, I = null;
          t = (s = 1 / this._hi) - (d = (x = u.SPLIT * s) - (d = x - s)), y = (I = u.SPLIT * this._hi) - this._hi;
          var T = s + (x = (1 - (h = s * this._hi) - (I = d * (y = I - y) - h + d * (e = this._hi - y) + t * y + t * e) - s * this._lo) / this._hi);
          return new u(T, s - T + x);
        } }, { key: "toSciNotation", value: function() {
          if (this.isZero()) return u.SCI_NOT_ZERO;
          var t = this.getSpecialNumberString();
          if (t !== null) return t;
          var e = new Array(1).fill(null), s = this.extractSignificantDigits(!1, e), h = u.SCI_NOT_EXPONENT_CHAR + e[0];
          if (s.charAt(0) === "0") throw new IllegalStateException("Found leading zero: " + s);
          var d = "";
          s.length > 1 && (d = s.substring(1));
          var y = s.charAt(0) + "." + d;
          return this.isNegative() ? "-" + y + h : y + h;
        } }, { key: "abs", value: function() {
          return this.isNaN() ? u.NaN : this.isNegative() ? this.negate() : new u(this);
        } }, { key: "isPositive", value: function() {
          return this._hi > 0 || this._hi === 0 && this._lo > 0;
        } }, { key: "lt", value: function(t) {
          return this._hi < t._hi || this._hi === t._hi && this._lo < t._lo;
        } }, { key: "add", value: function() {
          if (arguments[0] instanceof u) {
            var t = arguments[0];
            return u.copy(this).selfAdd(t);
          }
          if (typeof arguments[0] == "number") {
            var e = arguments[0];
            return u.copy(this).selfAdd(e);
          }
        } }, { key: "init", value: function() {
          if (arguments.length === 1) {
            if (typeof arguments[0] == "number") {
              var t = arguments[0];
              this._hi = t, this._lo = 0;
            } else if (arguments[0] instanceof u) {
              var e = arguments[0];
              this._hi = e._hi, this._lo = e._lo;
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            this._hi = s, this._lo = h;
          }
        } }, { key: "gt", value: function(t) {
          return this._hi > t._hi || this._hi === t._hi && this._lo > t._lo;
        } }, { key: "isNegative", value: function() {
          return this._hi < 0 || this._hi === 0 && this._lo < 0;
        } }, { key: "trunc", value: function() {
          return this.isNaN() ? u.NaN : this.isPositive() ? this.floor() : this.ceil();
        } }, { key: "signum", value: function() {
          return this._hi > 0 ? 1 : this._hi < 0 ? -1 : this._lo > 0 ? 1 : this._lo < 0 ? -1 : 0;
        } }, { key: "interfaces_", get: function() {
          return [$, Z, et];
        } }], [{ key: "constructor_", value: function() {
          if (this._hi = 0, this._lo = 0, arguments.length === 0) this.init(0);
          else if (arguments.length === 1) {
            if (typeof arguments[0] == "number") {
              var t = arguments[0];
              this.init(t);
            } else if (arguments[0] instanceof u) {
              var e = arguments[0];
              this.init(e);
            } else if (typeof arguments[0] == "string") {
              var s = arguments[0];
              u.constructor_.call(this, u.parse(s));
            }
          } else if (arguments.length === 2) {
            var h = arguments[0], d = arguments[1];
            this.init(h, d);
          }
        } }, { key: "determinant", value: function() {
          if (typeof arguments[3] == "number" && typeof arguments[2] == "number" && typeof arguments[0] == "number" && typeof arguments[1] == "number") {
            var t = arguments[0], e = arguments[1], s = arguments[2], h = arguments[3];
            return u.determinant(u.valueOf(t), u.valueOf(e), u.valueOf(s), u.valueOf(h));
          }
          if (arguments[3] instanceof u && arguments[2] instanceof u && arguments[0] instanceof u && arguments[1] instanceof u) {
            var d = arguments[1], y = arguments[2], x = arguments[3];
            return arguments[0].multiply(x).selfSubtract(d.multiply(y));
          }
        } }, { key: "sqr", value: function(t) {
          return u.valueOf(t).selfMultiply(t);
        } }, { key: "valueOf", value: function() {
          if (typeof arguments[0] == "string") {
            var t = arguments[0];
            return u.parse(t);
          }
          if (typeof arguments[0] == "number") return new u(arguments[0]);
        } }, { key: "sqrt", value: function(t) {
          return u.valueOf(t).sqrt();
        } }, { key: "parse", value: function(t) {
          for (var e = 0, s = t.length; Jn.isWhitespace(t.charAt(e)); ) e++;
          var h = !1;
          if (e < s) {
            var d = t.charAt(e);
            d !== "-" && d !== "+" || (e++, d === "-" && (h = !0));
          }
          for (var y = new u(), x = 0, I = 0, T = 0, G = !1; !(e >= s); ) {
            var q = t.charAt(e);
            if (e++, Jn.isDigit(q)) {
              var K = q - "0";
              y.selfMultiply(u.TEN), y.selfAdd(K), x++;
            } else {
              if (q !== ".") {
                if (q === "e" || q === "E") {
                  var rt = t.substring(e);
                  try {
                    T = Mr.parseInt(rt);
                  } catch (Xt) {
                    throw Xt instanceof NumberFormatException ? new NumberFormatException("Invalid exponent " + rt + " in string " + t) : Xt;
                  }
                  break;
                }
                throw new NumberFormatException("Unexpected character '" + q + "' at position " + e + " in string " + t);
              }
              I = x, G = !0;
            }
          }
          var ot = y;
          G || (I = x);
          var gt = x - I - T;
          if (gt === 0) ot = y;
          else if (gt > 0) {
            var Pt = u.TEN.pow(gt);
            ot = y.divide(Pt);
          } else if (gt < 0) {
            var lt = u.TEN.pow(-gt);
            ot = y.multiply(lt);
          }
          return h ? ot.negate() : ot;
        } }, { key: "createNaN", value: function() {
          return new u(ht.NaN, ht.NaN);
        } }, { key: "copy", value: function(t) {
          return new u(t);
        } }, { key: "magnitude", value: function(t) {
          var e = Math.abs(t), s = Math.log(e) / Math.log(10), h = Math.trunc(Math.floor(s));
          return 10 * Math.pow(10, h) <= e && (h += 1), h;
        } }, { key: "stringOfChar", value: function(t, e) {
          for (var s = new bn(), h = 0; h < e; h++) s.append(t);
          return s.toString();
        } }]);
      }();
      mt.PI = new mt(3.141592653589793, 12246467991473532e-32), mt.TWO_PI = new mt(6.283185307179586, 24492935982947064e-32), mt.PI_2 = new mt(1.5707963267948966, 6123233995736766e-32), mt.E = new mt(2.718281828459045, 14456468917292502e-32), mt.NaN = new mt(ht.NaN, ht.NaN), mt.EPS = 123259516440783e-46, mt.SPLIT = 134217729, mt.MAX_PRINT_DIGITS = 32, mt.TEN = mt.valueOf(10), mt.ONE = mt.valueOf(1), mt.SCI_NOT_EXPONENT_CHAR = "E", mt.SCI_NOT_ZERO = "0.0E0";
      var Wi = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "orientationIndex", value: function(t, e, s) {
          var h = u.orientationIndexFilter(t, e, s);
          if (h <= 1) return h;
          var d = mt.valueOf(e.x).selfAdd(-t.x), y = mt.valueOf(e.y).selfAdd(-t.y), x = mt.valueOf(s.x).selfAdd(-e.x), I = mt.valueOf(s.y).selfAdd(-e.y);
          return d.selfMultiply(I).selfSubtract(y.selfMultiply(x)).signum();
        } }, { key: "signOfDet2x2", value: function() {
          if (arguments[3] instanceof mt && arguments[2] instanceof mt && arguments[0] instanceof mt && arguments[1] instanceof mt) {
            var t = arguments[1], e = arguments[2], s = arguments[3];
            return arguments[0].multiply(s).selfSubtract(t.multiply(e)).signum();
          }
          if (typeof arguments[3] == "number" && typeof arguments[2] == "number" && typeof arguments[0] == "number" && typeof arguments[1] == "number") {
            var h = arguments[0], d = arguments[1], y = arguments[2], x = arguments[3], I = mt.valueOf(h), T = mt.valueOf(d), G = mt.valueOf(y), q = mt.valueOf(x);
            return I.multiply(q).selfSubtract(T.multiply(G)).signum();
          }
        } }, { key: "intersection", value: function(t, e, s, h) {
          var d = new mt(t.y).selfSubtract(e.y), y = new mt(e.x).selfSubtract(t.x), x = new mt(t.x).selfMultiply(e.y).selfSubtract(new mt(e.x).selfMultiply(t.y)), I = new mt(s.y).selfSubtract(h.y), T = new mt(h.x).selfSubtract(s.x), G = new mt(s.x).selfMultiply(h.y).selfSubtract(new mt(h.x).selfMultiply(s.y)), q = y.multiply(G).selfSubtract(T.multiply(x)), K = I.multiply(x).selfSubtract(d.multiply(G)), rt = d.multiply(T).selfSubtract(I.multiply(y)), ot = q.selfDivide(rt).doubleValue(), gt = K.selfDivide(rt).doubleValue();
          return ht.isNaN(ot) || ht.isInfinite(ot) || ht.isNaN(gt) || ht.isInfinite(gt) ? null : new z(ot, gt);
        } }, { key: "orientationIndexFilter", value: function(t, e, s) {
          var h = null, d = (t.x - s.x) * (e.y - s.y), y = (t.y - s.y) * (e.x - s.x), x = d - y;
          if (d > 0) {
            if (y <= 0) return u.signum(x);
            h = d + y;
          } else {
            if (!(d < 0) || y >= 0) return u.signum(x);
            h = -d - y;
          }
          var I = u.DP_SAFE_EPSILON * h;
          return x >= I || -x >= I ? u.signum(x) : 2;
        } }, { key: "signum", value: function(t) {
          return t > 0 ? 1 : t < 0 ? -1 : 0;
        } }]);
      }();
      Wi.DP_SAFE_EPSILON = 1e-15;
      var At = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "getM", value: function(u) {
          if (this.hasM()) {
            var t = this.getDimension() - this.getMeasures();
            return this.getOrdinate(u, t);
          }
          return ht.NaN;
        } }, { key: "setOrdinate", value: function(u, t, e) {
        } }, { key: "getZ", value: function(u) {
          return this.hasZ() ? this.getOrdinate(u, 2) : ht.NaN;
        } }, { key: "size", value: function() {
        } }, { key: "getOrdinate", value: function(u, t) {
        } }, { key: "getCoordinate", value: function() {
        } }, { key: "getCoordinateCopy", value: function(u) {
        } }, { key: "createCoordinate", value: function() {
        } }, { key: "getDimension", value: function() {
        } }, { key: "hasM", value: function() {
          return this.getMeasures() > 0;
        } }, { key: "getX", value: function(u) {
        } }, { key: "hasZ", value: function() {
          return this.getDimension() - this.getMeasures() > 2;
        } }, { key: "getMeasures", value: function() {
          return 0;
        } }, { key: "expandEnvelope", value: function(u) {
        } }, { key: "copy", value: function() {
        } }, { key: "getY", value: function(u) {
        } }, { key: "toCoordinateArray", value: function() {
        } }, { key: "interfaces_", get: function() {
          return [et];
        } }]);
      }();
      At.X = 0, At.Y = 1, At.Z = 2, At.M = 3;
      var vt = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "index", value: function(t, e, s) {
          return Wi.orientationIndex(t, e, s);
        } }, { key: "isCCW", value: function() {
          if (arguments[0] instanceof Array) {
            var t = arguments[0], e = t.length - 1;
            if (e < 3) throw new Y("Ring has fewer than 4 points, so orientation cannot be determined");
            for (var s = t[0], h = 0, d = 1; d <= e; d++) {
              var y = t[d];
              y.y > s.y && (s = y, h = d);
            }
            var x = h;
            do
              (x -= 1) < 0 && (x = e);
            while (t[x].equals2D(s) && x !== h);
            var I = h;
            do
              I = (I + 1) % e;
            while (t[I].equals2D(s) && I !== h);
            var T = t[x], G = t[I];
            if (T.equals2D(s) || G.equals2D(s) || T.equals2D(G)) return !1;
            var q = u.index(T, s, G);
            return q === 0 ? T.x > G.x : q > 0;
          }
          if (kt(arguments[0], At)) {
            var K = arguments[0], rt = K.size() - 1;
            if (rt < 3) throw new Y("Ring has fewer than 4 points, so orientation cannot be determined");
            for (var ot = K.getCoordinate(0), gt = 0, Pt = 1; Pt <= rt; Pt++) {
              var lt = K.getCoordinate(Pt);
              lt.y > ot.y && (ot = lt, gt = Pt);
            }
            var Xt = null, fe = gt;
            do
              (fe -= 1) < 0 && (fe = rt), Xt = K.getCoordinate(fe);
            while (Xt.equals2D(ot) && fe !== gt);
            var se = null, li = gt;
            do
              li = (li + 1) % rt, se = K.getCoordinate(li);
            while (se.equals2D(ot) && li !== gt);
            if (Xt.equals2D(ot) || se.equals2D(ot) || Xt.equals2D(se)) return !1;
            var nr = u.index(Xt, ot, se);
            return nr === 0 ? Xt.x > se.x : nr > 0;
          }
        } }]);
      }();
      vt.CLOCKWISE = -1, vt.RIGHT = vt.CLOCKWISE, vt.COUNTERCLOCKWISE = 1, vt.LEFT = vt.COUNTERCLOCKWISE, vt.COLLINEAR = 0, vt.STRAIGHT = vt.COLLINEAR;
      var gs = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getCoordinate", value: function() {
          return this._minCoord;
        } }, { key: "getRightmostSide", value: function(u, t) {
          var e = this.getRightmostSideOfSegment(u, t);
          return e < 0 && (e = this.getRightmostSideOfSegment(u, t - 1)), e < 0 && (this._minCoord = null, this.checkForRightmostCoordinate(u)), e;
        } }, { key: "findRightmostEdgeAtVertex", value: function() {
          var u = this._minDe.getEdge().getCoordinates();
          It.isTrue(this._minIndex > 0 && this._minIndex < u.length, "rightmost point expected to be interior vertex of edge");
          var t = u[this._minIndex - 1], e = u[this._minIndex + 1], s = vt.index(this._minCoord, e, t), h = !1;
          (t.y < this._minCoord.y && e.y < this._minCoord.y && s === vt.COUNTERCLOCKWISE || t.y > this._minCoord.y && e.y > this._minCoord.y && s === vt.CLOCKWISE) && (h = !0), h && (this._minIndex = this._minIndex - 1);
        } }, { key: "getRightmostSideOfSegment", value: function(u, t) {
          var e = u.getEdge().getCoordinates();
          if (t < 0 || t + 1 >= e.length || e[t].y === e[t + 1].y) return -1;
          var s = tt.LEFT;
          return e[t].y < e[t + 1].y && (s = tt.RIGHT), s;
        } }, { key: "getEdge", value: function() {
          return this._orientedDe;
        } }, { key: "checkForRightmostCoordinate", value: function(u) {
          for (var t = u.getEdge().getCoordinates(), e = 0; e < t.length - 1; e++) (this._minCoord === null || t[e].x > this._minCoord.x) && (this._minDe = u, this._minIndex = e, this._minCoord = t[e]);
        } }, { key: "findRightmostEdgeAtNode", value: function() {
          var u = this._minDe.getNode().getEdges();
          this._minDe = u.getRightmostEdge(), this._minDe.isForward() || (this._minDe = this._minDe.getSym(), this._minIndex = this._minDe.getEdge().getCoordinates().length - 1);
        } }, { key: "findEdge", value: function(u) {
          for (var t = u.iterator(); t.hasNext(); ) {
            var e = t.next();
            e.isForward() && this.checkForRightmostCoordinate(e);
          }
          It.isTrue(this._minIndex !== 0 || this._minCoord.equals(this._minDe.getCoordinate()), "inconsistency in rightmost processing"), this._minIndex === 0 ? this.findRightmostEdgeAtNode() : this.findRightmostEdgeAtVertex(), this._orientedDe = this._minDe, this.getRightmostSide(this._minDe, this._minIndex) === tt.LEFT && (this._orientedDe = this._minDe.getSym());
        } }], [{ key: "constructor_", value: function() {
          this._minIndex = -1, this._minCoord = null, this._minDe = null, this._orientedDe = null;
        } }]);
      }(), an = function(u) {
        function t(e, s) {
          var h;
          return c(this, t), (h = l(this, t, [s ? e + " [ " + s + " ]" : e])).pt = s ? new z(s) : void 0, h.name = Object.keys({ TopologyException: t })[0], h;
        }
        return E(t, u), g(t, [{ key: "getCoordinate", value: function() {
          return this.pt;
        } }]);
      }(le), ds = function() {
        return g(function u() {
          c(this, u), this.array = [];
        }, [{ key: "addLast", value: function(u) {
          this.array.push(u);
        } }, { key: "removeFirst", value: function() {
          return this.array.shift();
        } }, { key: "isEmpty", value: function() {
          return this.array.length === 0;
        } }]);
      }(), yt = function(u) {
        function t(e) {
          var s;
          return c(this, t), (s = l(this, t)).array = [], e instanceof nn && s.addAll(e), s;
        }
        return E(t, u), g(t, [{ key: "interfaces_", get: function() {
          return [sn, nn];
        } }, { key: "ensureCapacity", value: function() {
        } }, { key: "add", value: function(e) {
          return arguments.length === 1 ? this.array.push(e) : this.array.splice(arguments[0], 0, arguments[1]), !0;
        } }, { key: "clear", value: function() {
          this.array = [];
        } }, { key: "addAll", value: function(e) {
          var s, h = v(e);
          try {
            for (h.s(); !(s = h.n()).done; ) {
              var d = s.value;
              this.array.push(d);
            }
          } catch (y) {
            h.e(y);
          } finally {
            h.f();
          }
        } }, { key: "set", value: function(e, s) {
          var h = this.array[e];
          return this.array[e] = s, h;
        } }, { key: "iterator", value: function() {
          return new _s(this);
        } }, { key: "get", value: function(e) {
          if (e < 0 || e >= this.size()) throw new Be();
          return this.array[e];
        } }, { key: "isEmpty", value: function() {
          return this.array.length === 0;
        } }, { key: "sort", value: function(e) {
          e ? this.array.sort(function(s, h) {
            return e.compare(s, h);
          }) : this.array.sort();
        } }, { key: "size", value: function() {
          return this.array.length;
        } }, { key: "toArray", value: function() {
          return this.array.slice();
        } }, { key: "remove", value: function(e) {
          for (var s = 0, h = this.array.length; s < h; s++) if (this.array[s] === e) return !!this.array.splice(s, 1);
          return !1;
        } }, { key: Symbol.iterator, value: function() {
          return this.array.values();
        } }]);
      }(sn), _s = function() {
        return g(function u(t) {
          c(this, u), this.arrayList = t, this.position = 0;
        }, [{ key: "next", value: function() {
          if (this.position === this.arrayList.size()) throw new we();
          return this.arrayList.get(this.position++);
        } }, { key: "hasNext", value: function() {
          return this.position < this.arrayList.size();
        } }, { key: "set", value: function(u) {
          return this.arrayList.set(this.position - 1, u);
        } }, { key: "remove", value: function() {
          this.arrayList.remove(this.arrayList.get(this.position));
        } }]);
      }(), ms = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "clearVisitedEdges", value: function() {
          for (var u = this._dirEdgeList.iterator(); u.hasNext(); )
            u.next().setVisited(!1);
        } }, { key: "getRightmostCoordinate", value: function() {
          return this._rightMostCoord;
        } }, { key: "computeNodeDepth", value: function(u) {
          for (var t = null, e = u.getEdges().iterator(); e.hasNext(); ) {
            var s = e.next();
            if (s.isVisited() || s.getSym().isVisited()) {
              t = s;
              break;
            }
          }
          if (t === null) throw new an("unable to find edge to compute depths at " + u.getCoordinate());
          u.getEdges().computeDepths(t);
          for (var h = u.getEdges().iterator(); h.hasNext(); ) {
            var d = h.next();
            d.setVisited(!0), this.copySymDepths(d);
          }
        } }, { key: "computeDepth", value: function(u) {
          this.clearVisitedEdges();
          var t = this._finder.getEdge();
          t.getNode(), t.getLabel(), t.setEdgeDepths(tt.RIGHT, u), this.copySymDepths(t), this.computeDepths(t);
        } }, { key: "create", value: function(u) {
          this.addReachable(u), this._finder.findEdge(this._dirEdgeList), this._rightMostCoord = this._finder.getCoordinate();
        } }, { key: "findResultEdges", value: function() {
          for (var u = this._dirEdgeList.iterator(); u.hasNext(); ) {
            var t = u.next();
            t.getDepth(tt.RIGHT) >= 1 && t.getDepth(tt.LEFT) <= 0 && !t.isInteriorAreaEdge() && t.setInResult(!0);
          }
        } }, { key: "computeDepths", value: function(u) {
          var t = new rn(), e = new ds(), s = u.getNode();
          for (e.addLast(s), t.add(s), u.setVisited(!0); !e.isEmpty(); ) {
            var h = e.removeFirst();
            t.add(h), this.computeNodeDepth(h);
            for (var d = h.getEdges().iterator(); d.hasNext(); ) {
              var y = d.next().getSym();
              if (!y.isVisited()) {
                var x = y.getNode();
                t.contains(x) || (e.addLast(x), t.add(x));
              }
            }
          }
        } }, { key: "compareTo", value: function(u) {
          var t = u;
          return this._rightMostCoord.x < t._rightMostCoord.x ? -1 : this._rightMostCoord.x > t._rightMostCoord.x ? 1 : 0;
        } }, { key: "getEnvelope", value: function() {
          if (this._env === null) {
            for (var u = new Wt(), t = this._dirEdgeList.iterator(); t.hasNext(); ) for (var e = t.next().getEdge().getCoordinates(), s = 0; s < e.length - 1; s++) u.expandToInclude(e[s]);
            this._env = u;
          }
          return this._env;
        } }, { key: "addReachable", value: function(u) {
          var t = new Er();
          for (t.add(u); !t.empty(); ) {
            var e = t.pop();
            this.add(e, t);
          }
        } }, { key: "copySymDepths", value: function(u) {
          var t = u.getSym();
          t.setDepth(tt.LEFT, u.getDepth(tt.RIGHT)), t.setDepth(tt.RIGHT, u.getDepth(tt.LEFT));
        } }, { key: "add", value: function(u, t) {
          u.setVisited(!0), this._nodes.add(u);
          for (var e = u.getEdges().iterator(); e.hasNext(); ) {
            var s = e.next();
            this._dirEdgeList.add(s);
            var h = s.getSym().getNode();
            h.isVisited() || t.push(h);
          }
        } }, { key: "getNodes", value: function() {
          return this._nodes;
        } }, { key: "getDirectedEdges", value: function() {
          return this._dirEdgeList;
        } }, { key: "interfaces_", get: function() {
          return [Z];
        } }], [{ key: "constructor_", value: function() {
          this._finder = null, this._dirEdgeList = new yt(), this._nodes = new yt(), this._rightMostCoord = null, this._env = null, this._finder = new gs();
        } }]);
      }(), ys = function() {
        return g(function u() {
          c(this, u);
        }, null, [{ key: "intersection", value: function(u, t, e, s) {
          var h = u.x < t.x ? u.x : t.x, d = u.y < t.y ? u.y : t.y, y = u.x > t.x ? u.x : t.x, x = u.y > t.y ? u.y : t.y, I = e.x < s.x ? e.x : s.x, T = e.y < s.y ? e.y : s.y, G = e.x > s.x ? e.x : s.x, q = e.y > s.y ? e.y : s.y, K = ((h > I ? h : I) + (y < G ? y : G)) / 2, rt = ((d > T ? d : T) + (x < q ? x : q)) / 2, ot = u.x - K, gt = u.y - rt, Pt = t.x - K, lt = t.y - rt, Xt = e.x - K, fe = e.y - rt, se = s.x - K, li = s.y - rt, nr = gt - lt, vu = Pt - ot, ir = ot * lt - Pt * gt, An = fe - li, rr = se - Xt, Zs = Xt * li - se * fe, sr = nr * rr - An * vu, Fr = (vu * Zs - rr * ir) / sr, qr = (An * ir - nr * Zs) / sr;
          return ht.isNaN(Fr) || ht.isInfinite(Fr) || ht.isNaN(qr) || ht.isInfinite(qr) ? null : new z(Fr + K, qr + rt);
        } }]);
      }(), ze = function() {
        return g(function u() {
          c(this, u);
        }, null, [{ key: "arraycopy", value: function(u, t, e, s, h) {
          for (var d = 0, y = t; y < t + h; y++) e[s + d] = u[y], d++;
        } }, { key: "getProperty", value: function(u) {
          return { "line.separator": `
` }[u];
        } }]);
      }(), Hi = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "log10", value: function(t) {
          var e = Math.log(t);
          return ht.isInfinite(e) || ht.isNaN(e) ? e : e / u.LOG_10;
        } }, { key: "min", value: function(t, e, s, h) {
          var d = t;
          return e < d && (d = e), s < d && (d = s), h < d && (d = h), d;
        } }, { key: "clamp", value: function() {
          if (typeof arguments[2] == "number" && typeof arguments[0] == "number" && typeof arguments[1] == "number") {
            var t = arguments[0], e = arguments[1], s = arguments[2];
            return t < e ? e : t > s ? s : t;
          }
          if (Number.isInteger(arguments[2]) && Number.isInteger(arguments[0]) && Number.isInteger(arguments[1])) {
            var h = arguments[0], d = arguments[1], y = arguments[2];
            return h < d ? d : h > y ? y : h;
          }
        } }, { key: "wrap", value: function(t, e) {
          return t < 0 ? e - -t % e : t % e;
        } }, { key: "max", value: function() {
          if (arguments.length === 3) {
            var t = arguments[1], e = arguments[2], s = arguments[0];
            return t > s && (s = t), e > s && (s = e), s;
          }
          if (arguments.length === 4) {
            var h = arguments[1], d = arguments[2], y = arguments[3], x = arguments[0];
            return h > x && (x = h), d > x && (x = d), y > x && (x = y), x;
          }
        } }, { key: "average", value: function(t, e) {
          return (t + e) / 2;
        } }]);
      }();
      Hi.LOG_10 = Math.log(10);
      var un = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "segmentToSegment", value: function(t, e, s, h) {
          if (t.equals(e)) return u.pointToSegment(t, s, h);
          if (s.equals(h)) return u.pointToSegment(h, t, e);
          var d = !1;
          if (Wt.intersects(t, e, s, h)) {
            var y = (e.x - t.x) * (h.y - s.y) - (e.y - t.y) * (h.x - s.x);
            if (y === 0) d = !0;
            else {
              var x = (t.y - s.y) * (h.x - s.x) - (t.x - s.x) * (h.y - s.y), I = ((t.y - s.y) * (e.x - t.x) - (t.x - s.x) * (e.y - t.y)) / y, T = x / y;
              (T < 0 || T > 1 || I < 0 || I > 1) && (d = !0);
            }
          } else d = !0;
          return d ? Hi.min(u.pointToSegment(t, s, h), u.pointToSegment(e, s, h), u.pointToSegment(s, t, e), u.pointToSegment(h, t, e)) : 0;
        } }, { key: "pointToSegment", value: function(t, e, s) {
          if (e.x === s.x && e.y === s.y) return t.distance(e);
          var h = (s.x - e.x) * (s.x - e.x) + (s.y - e.y) * (s.y - e.y), d = ((t.x - e.x) * (s.x - e.x) + (t.y - e.y) * (s.y - e.y)) / h;
          if (d <= 0) return t.distance(e);
          if (d >= 1) return t.distance(s);
          var y = ((e.y - t.y) * (s.x - e.x) - (e.x - t.x) * (s.y - e.y)) / h;
          return Math.abs(y) * Math.sqrt(h);
        } }, { key: "pointToLinePerpendicular", value: function(t, e, s) {
          var h = (s.x - e.x) * (s.x - e.x) + (s.y - e.y) * (s.y - e.y), d = ((e.y - t.y) * (s.x - e.x) - (e.x - t.x) * (s.y - e.y)) / h;
          return Math.abs(d) * Math.sqrt(h);
        } }, { key: "pointToSegmentString", value: function(t, e) {
          if (e.length === 0) throw new Y("Line array must contain at least one vertex");
          for (var s = t.distance(e[0]), h = 0; h < e.length - 1; h++) {
            var d = u.pointToSegment(t, e[h], e[h + 1]);
            d < s && (s = d);
          }
          return s;
        } }]);
      }(), ps = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "create", value: function() {
          if (arguments.length === 1) arguments[0] instanceof Array || kt(arguments[0], At);
          else if (arguments.length !== 2 && arguments.length === 3) {
            var u = arguments[0], t = arguments[1];
            return this.create(u, t);
          }
        } }]);
      }(), kr = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "filter", value: function(u) {
        } }]);
      }(), Ro = function() {
        return g(function u() {
          c(this, u);
        }, null, [{ key: "ofLine", value: function(u) {
          var t = u.size();
          if (t <= 1) return 0;
          var e = 0, s = new z();
          u.getCoordinate(0, s);
          for (var h = s.x, d = s.y, y = 1; y < t; y++) {
            u.getCoordinate(y, s);
            var x = s.x, I = s.y, T = x - h, G = I - d;
            e += Math.sqrt(T * T + G * G), h = x, d = I;
          }
          return e;
        } }]);
      }(), Ua = g(function u() {
        c(this, u);
      }), $n = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "copyCoord", value: function(t, e, s, h) {
          for (var d = Math.min(t.getDimension(), s.getDimension()), y = 0; y < d; y++) s.setOrdinate(h, y, t.getOrdinate(e, y));
        } }, { key: "isRing", value: function(t) {
          var e = t.size();
          return e === 0 || !(e <= 3) && t.getOrdinate(0, At.X) === t.getOrdinate(e - 1, At.X) && t.getOrdinate(0, At.Y) === t.getOrdinate(e - 1, At.Y);
        } }, { key: "scroll", value: function() {
          if (arguments.length === 2) {
            if (kt(arguments[0], At) && Number.isInteger(arguments[1])) {
              var t = arguments[0], e = arguments[1];
              u.scroll(t, e, u.isRing(t));
            } else if (kt(arguments[0], At) && arguments[1] instanceof z) {
              var s = arguments[0], h = arguments[1], d = u.indexOf(h, s);
              if (d <= 0) return null;
              u.scroll(s, d);
            }
          } else if (arguments.length === 3) {
            var y = arguments[0], x = arguments[1], I = arguments[2];
            if (x <= 0) return null;
            for (var T = y.copy(), G = I ? y.size() - 1 : y.size(), q = 0; q < G; q++) for (var K = 0; K < y.getDimension(); K++) y.setOrdinate(q, K, T.getOrdinate((x + q) % G, K));
            if (I) for (var rt = 0; rt < y.getDimension(); rt++) y.setOrdinate(G, rt, y.getOrdinate(0, rt));
          }
        } }, { key: "isEqual", value: function(t, e) {
          var s = t.size();
          if (s !== e.size()) return !1;
          for (var h = Math.min(t.getDimension(), e.getDimension()), d = 0; d < s; d++) for (var y = 0; y < h; y++) {
            var x = t.getOrdinate(d, y), I = e.getOrdinate(d, y);
            if (t.getOrdinate(d, y) !== e.getOrdinate(d, y) && (!ht.isNaN(x) || !ht.isNaN(I))) return !1;
          }
          return !0;
        } }, { key: "minCoordinateIndex", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return u.minCoordinateIndex(t, 0, t.size() - 1);
          }
          if (arguments.length === 3) {
            for (var e = arguments[0], s = arguments[2], h = -1, d = null, y = arguments[1]; y <= s; y++) {
              var x = e.getCoordinate(y);
              (d === null || d.compareTo(x) > 0) && (d = x, h = y);
            }
            return h;
          }
        } }, { key: "extend", value: function(t, e, s) {
          var h = t.create(s, e.getDimension()), d = e.size();
          if (u.copy(e, 0, h, 0, d), d > 0) for (var y = d; y < s; y++) u.copy(e, d - 1, h, y, 1);
          return h;
        } }, { key: "reverse", value: function(t) {
          for (var e = t.size() - 1, s = Math.trunc(e / 2), h = 0; h <= s; h++) u.swap(t, h, e - h);
        } }, { key: "swap", value: function(t, e, s) {
          if (e === s) return null;
          for (var h = 0; h < t.getDimension(); h++) {
            var d = t.getOrdinate(e, h);
            t.setOrdinate(e, h, t.getOrdinate(s, h)), t.setOrdinate(s, h, d);
          }
        } }, { key: "copy", value: function(t, e, s, h, d) {
          for (var y = 0; y < d; y++) u.copyCoord(t, e + y, s, h + y);
        } }, { key: "ensureValidRing", value: function(t, e) {
          var s = e.size();
          return s === 0 ? e : s <= 3 ? u.createClosedRing(t, e, 4) : e.getOrdinate(0, At.X) === e.getOrdinate(s - 1, At.X) && e.getOrdinate(0, At.Y) === e.getOrdinate(s - 1, At.Y) ? e : u.createClosedRing(t, e, s + 1);
        } }, { key: "indexOf", value: function(t, e) {
          for (var s = 0; s < e.size(); s++) if (t.x === e.getOrdinate(s, At.X) && t.y === e.getOrdinate(s, At.Y)) return s;
          return -1;
        } }, { key: "createClosedRing", value: function(t, e, s) {
          var h = t.create(s, e.getDimension()), d = e.size();
          u.copy(e, 0, h, 0, d);
          for (var y = d; y < s; y++) u.copy(e, 0, h, y, 1);
          return h;
        } }, { key: "minCoordinate", value: function(t) {
          for (var e = null, s = 0; s < t.size(); s++) {
            var h = t.getCoordinate(s);
            (e === null || e.compareTo(h) > 0) && (e = h);
          }
          return e;
        } }]);
      }(), nt = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "toDimensionSymbol", value: function(t) {
          switch (t) {
            case u.FALSE:
              return u.SYM_FALSE;
            case u.TRUE:
              return u.SYM_TRUE;
            case u.DONTCARE:
              return u.SYM_DONTCARE;
            case u.P:
              return u.SYM_P;
            case u.L:
              return u.SYM_L;
            case u.A:
              return u.SYM_A;
          }
          throw new Y("Unknown dimension value: " + t);
        } }, { key: "toDimensionValue", value: function(t) {
          switch (Jn.toUpperCase(t)) {
            case u.SYM_FALSE:
              return u.FALSE;
            case u.SYM_TRUE:
              return u.TRUE;
            case u.SYM_DONTCARE:
              return u.DONTCARE;
            case u.SYM_P:
              return u.P;
            case u.SYM_L:
              return u.L;
            case u.SYM_A:
              return u.A;
          }
          throw new Y("Unknown dimension symbol: " + t);
        } }]);
      }();
      nt.P = 0, nt.L = 1, nt.A = 2, nt.FALSE = -1, nt.TRUE = -2, nt.DONTCARE = -3, nt.SYM_FALSE = "F", nt.SYM_TRUE = "T", nt.SYM_DONTCARE = "*", nt.SYM_P = "0", nt.SYM_L = "1", nt.SYM_A = "2";
      var wr = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "filter", value: function(u) {
        } }]);
      }(), Sr = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "filter", value: function(u, t) {
        } }, { key: "isDone", value: function() {
        } }, { key: "isGeometryChanged", value: function() {
        } }]);
      }(), Ki = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "computeEnvelopeInternal", value: function() {
          return this.isEmpty() ? new Wt() : this._points.expandEnvelope(new Wt());
        } }, { key: "isRing", value: function() {
          return this.isClosed() && this.isSimple();
        } }, { key: "getCoordinates", value: function() {
          return this._points.toCoordinateArray();
        } }, { key: "copyInternal", value: function() {
          return new t(this._points.copy(), this._factory);
        } }, { key: "equalsExact", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "number" && arguments[0] instanceof ct) {
            var e = arguments[0], s = arguments[1];
            if (!this.isEquivalentClass(e)) return !1;
            var h = e;
            if (this._points.size() !== h._points.size()) return !1;
            for (var d = 0; d < this._points.size(); d++) if (!this.equal(this._points.getCoordinate(d), h._points.getCoordinate(d), s)) return !1;
            return !0;
          }
          return C(t, "equalsExact", this, 1).apply(this, arguments);
        } }, { key: "normalize", value: function() {
          for (var e = 0; e < Math.trunc(this._points.size() / 2); e++) {
            var s = this._points.size() - 1 - e;
            if (!this._points.getCoordinate(e).equals(this._points.getCoordinate(s))) {
              if (this._points.getCoordinate(e).compareTo(this._points.getCoordinate(s)) > 0) {
                var h = this._points.copy();
                $n.reverse(h), this._points = h;
              }
              return null;
            }
          }
        } }, { key: "getCoordinate", value: function() {
          return this.isEmpty() ? null : this._points.getCoordinate(0);
        } }, { key: "getBoundaryDimension", value: function() {
          return this.isClosed() ? nt.FALSE : 0;
        } }, { key: "isClosed", value: function() {
          return !this.isEmpty() && this.getCoordinateN(0).equals2D(this.getCoordinateN(this.getNumPoints() - 1));
        } }, { key: "reverseInternal", value: function() {
          var e = this._points.copy();
          return $n.reverse(e), this.getFactory().createLineString(e);
        } }, { key: "getEndPoint", value: function() {
          return this.isEmpty() ? null : this.getPointN(this.getNumPoints() - 1);
        } }, { key: "getTypeCode", value: function() {
          return ct.TYPECODE_LINESTRING;
        } }, { key: "getDimension", value: function() {
          return 1;
        } }, { key: "getLength", value: function() {
          return Ro.ofLine(this._points);
        } }, { key: "getNumPoints", value: function() {
          return this._points.size();
        } }, { key: "compareToSameClass", value: function() {
          if (arguments.length === 1) {
            for (var e = arguments[0], s = 0, h = 0; s < this._points.size() && h < e._points.size(); ) {
              var d = this._points.getCoordinate(s).compareTo(e._points.getCoordinate(h));
              if (d !== 0) return d;
              s++, h++;
            }
            return s < this._points.size() ? 1 : h < e._points.size() ? -1 : 0;
          }
          if (arguments.length === 2) {
            var y = arguments[0];
            return arguments[1].compare(this._points, y._points);
          }
        } }, { key: "apply", value: function() {
          if (kt(arguments[0], kr)) for (var e = arguments[0], s = 0; s < this._points.size(); s++) e.filter(this._points.getCoordinate(s));
          else if (kt(arguments[0], Sr)) {
            var h = arguments[0];
            if (this._points.size() === 0) return null;
            for (var d = 0; d < this._points.size() && (h.filter(this._points, d), !h.isDone()); d++) ;
            h.isGeometryChanged() && this.geometryChanged();
          } else kt(arguments[0], wr) ? arguments[0].filter(this) : kt(arguments[0], H) && arguments[0].filter(this);
        } }, { key: "getBoundary", value: function() {
          throw new qe();
        } }, { key: "isEquivalentClass", value: function(e) {
          return e instanceof t;
        } }, { key: "getCoordinateN", value: function(e) {
          return this._points.getCoordinate(e);
        } }, { key: "getGeometryType", value: function() {
          return ct.TYPENAME_LINESTRING;
        } }, { key: "getCoordinateSequence", value: function() {
          return this._points;
        } }, { key: "isEmpty", value: function() {
          return this._points.size() === 0;
        } }, { key: "init", value: function(e) {
          if (e === null && (e = this.getFactory().getCoordinateSequenceFactory().create([])), e.size() === 1) throw new Y("Invalid number of points in LineString (found " + e.size() + " - must be 0 or >= 2)");
          this._points = e;
        } }, { key: "isCoordinate", value: function(e) {
          for (var s = 0; s < this._points.size(); s++) if (this._points.getCoordinate(s).equals(e)) return !0;
          return !1;
        } }, { key: "getStartPoint", value: function() {
          return this.isEmpty() ? null : this.getPointN(0);
        } }, { key: "getPointN", value: function(e) {
          return this.getFactory().createPoint(this._points.getCoordinate(e));
        } }, { key: "interfaces_", get: function() {
          return [Ua];
        } }], [{ key: "constructor_", value: function() {
          if (this._points = null, arguments.length !== 0 && arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            ct.constructor_.call(this, s), this.init(e);
          }
        } }]);
      }(ct), Ir = g(function u() {
        c(this, u);
      }), vs = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "computeEnvelopeInternal", value: function() {
          if (this.isEmpty()) return new Wt();
          var e = new Wt();
          return e.expandToInclude(this._coordinates.getX(0), this._coordinates.getY(0)), e;
        } }, { key: "getCoordinates", value: function() {
          return this.isEmpty() ? [] : [this.getCoordinate()];
        } }, { key: "copyInternal", value: function() {
          return new t(this._coordinates.copy(), this._factory);
        } }, { key: "equalsExact", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "number" && arguments[0] instanceof ct) {
            var e = arguments[0], s = arguments[1];
            return !!this.isEquivalentClass(e) && (!(!this.isEmpty() || !e.isEmpty()) || this.isEmpty() === e.isEmpty() && this.equal(e.getCoordinate(), this.getCoordinate(), s));
          }
          return C(t, "equalsExact", this, 1).apply(this, arguments);
        } }, { key: "normalize", value: function() {
        } }, { key: "getCoordinate", value: function() {
          return this._coordinates.size() !== 0 ? this._coordinates.getCoordinate(0) : null;
        } }, { key: "getBoundaryDimension", value: function() {
          return nt.FALSE;
        } }, { key: "reverseInternal", value: function() {
          return this.getFactory().createPoint(this._coordinates.copy());
        } }, { key: "getTypeCode", value: function() {
          return ct.TYPECODE_POINT;
        } }, { key: "getDimension", value: function() {
          return 0;
        } }, { key: "getNumPoints", value: function() {
          return this.isEmpty() ? 0 : 1;
        } }, { key: "getX", value: function() {
          if (this.getCoordinate() === null) throw new IllegalStateException("getX called on empty Point");
          return this.getCoordinate().x;
        } }, { key: "compareToSameClass", value: function() {
          if (arguments.length === 1) {
            var e = arguments[0];
            return this.getCoordinate().compareTo(e.getCoordinate());
          }
          if (arguments.length === 2) {
            var s = arguments[0];
            return arguments[1].compare(this._coordinates, s._coordinates);
          }
        } }, { key: "apply", value: function() {
          if (kt(arguments[0], kr)) {
            var e = arguments[0];
            if (this.isEmpty()) return null;
            e.filter(this.getCoordinate());
          } else if (kt(arguments[0], Sr)) {
            var s = arguments[0];
            if (this.isEmpty()) return null;
            s.filter(this._coordinates, 0), s.isGeometryChanged() && this.geometryChanged();
          } else kt(arguments[0], wr) ? arguments[0].filter(this) : kt(arguments[0], H) && arguments[0].filter(this);
        } }, { key: "getBoundary", value: function() {
          return this.getFactory().createGeometryCollection();
        } }, { key: "getGeometryType", value: function() {
          return ct.TYPENAME_POINT;
        } }, { key: "getCoordinateSequence", value: function() {
          return this._coordinates;
        } }, { key: "getY", value: function() {
          if (this.getCoordinate() === null) throw new IllegalStateException("getY called on empty Point");
          return this.getCoordinate().y;
        } }, { key: "isEmpty", value: function() {
          return this._coordinates.size() === 0;
        } }, { key: "init", value: function(e) {
          e === null && (e = this.getFactory().getCoordinateSequenceFactory().create([])), It.isTrue(e.size() <= 1), this._coordinates = e;
        } }, { key: "isSimple", value: function() {
          return !0;
        } }, { key: "interfaces_", get: function() {
          return [Ir];
        } }], [{ key: "constructor_", value: function() {
          this._coordinates = null;
          var e = arguments[0], s = arguments[1];
          ct.constructor_.call(this, s), this.init(e);
        } }]);
      }(ct), Nr = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "ofRing", value: function() {
          if (arguments[0] instanceof Array) {
            var t = arguments[0];
            return Math.abs(u.ofRingSigned(t));
          }
          if (kt(arguments[0], At)) {
            var e = arguments[0];
            return Math.abs(u.ofRingSigned(e));
          }
        } }, { key: "ofRingSigned", value: function() {
          if (arguments[0] instanceof Array) {
            var t = arguments[0];
            if (t.length < 3) return 0;
            for (var e = 0, s = t[0].x, h = 1; h < t.length - 1; h++) {
              var d = t[h].x - s, y = t[h + 1].y;
              e += d * (t[h - 1].y - y);
            }
            return e / 2;
          }
          if (kt(arguments[0], At)) {
            var x = arguments[0], I = x.size();
            if (I < 3) return 0;
            var T = new z(), G = new z(), q = new z();
            x.getCoordinate(0, G), x.getCoordinate(1, q);
            var K = G.x;
            q.x -= K;
            for (var rt = 0, ot = 1; ot < I - 1; ot++) T.y = G.y, G.x = q.x, G.y = q.y, x.getCoordinate(ot + 1, q), q.x -= K, rt += G.x * (T.y - q.y);
            return rt / 2;
          }
        } }]);
      }(), ti = function() {
        return g(function u() {
          c(this, u);
        }, null, [{ key: "sort", value: function() {
          var u = arguments, t = arguments[0];
          if (arguments.length === 1) t.sort(function(K, rt) {
            return K.compareTo(rt);
          });
          else if (arguments.length === 2) t.sort(function(K, rt) {
            return u[1].compare(K, rt);
          });
          else if (arguments.length === 3) {
            var e = t.slice(arguments[1], arguments[2]);
            e.sort();
            var s = t.slice(0, arguments[1]).concat(e, t.slice(arguments[2], t.length));
            t.splice(0, t.length);
            var h, d = v(s);
            try {
              for (d.s(); !(h = d.n()).done; ) {
                var y = h.value;
                t.push(y);
              }
            } catch (K) {
              d.e(K);
            } finally {
              d.f();
            }
          } else if (arguments.length === 4) {
            var x = t.slice(arguments[1], arguments[2]);
            x.sort(function(K, rt) {
              return u[3].compare(K, rt);
            });
            var I = t.slice(0, arguments[1]).concat(x, t.slice(arguments[2], t.length));
            t.splice(0, t.length);
            var T, G = v(I);
            try {
              for (G.s(); !(T = G.n()).done; ) {
                var q = T.value;
                t.push(q);
              }
            } catch (K) {
              G.e(K);
            } finally {
              G.f();
            }
          }
        } }, { key: "asList", value: function(u) {
          var t, e = new yt(), s = v(u);
          try {
            for (s.s(); !(t = s.n()).done; ) {
              var h = t.value;
              e.add(h);
            }
          } catch (d) {
            s.e(d);
          } finally {
            s.f();
          }
          return e;
        } }, { key: "copyOf", value: function(u, t) {
          return u.slice(0, t);
        } }]);
      }(), Ya = g(function u() {
        c(this, u);
      }), br = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "computeEnvelopeInternal", value: function() {
          return this._shell.getEnvelopeInternal();
        } }, { key: "getCoordinates", value: function() {
          if (this.isEmpty()) return [];
          for (var e = new Array(this.getNumPoints()).fill(null), s = -1, h = this._shell.getCoordinates(), d = 0; d < h.length; d++) e[++s] = h[d];
          for (var y = 0; y < this._holes.length; y++) for (var x = this._holes[y].getCoordinates(), I = 0; I < x.length; I++) e[++s] = x[I];
          return e;
        } }, { key: "getArea", value: function() {
          var e = 0;
          e += Nr.ofRing(this._shell.getCoordinateSequence());
          for (var s = 0; s < this._holes.length; s++) e -= Nr.ofRing(this._holes[s].getCoordinateSequence());
          return e;
        } }, { key: "copyInternal", value: function() {
          for (var e = this._shell.copy(), s = new Array(this._holes.length).fill(null), h = 0; h < this._holes.length; h++) s[h] = this._holes[h].copy();
          return new t(e, s, this._factory);
        } }, { key: "isRectangle", value: function() {
          if (this.getNumInteriorRing() !== 0 || this._shell === null || this._shell.getNumPoints() !== 5) return !1;
          for (var e = this._shell.getCoordinateSequence(), s = this.getEnvelopeInternal(), h = 0; h < 5; h++) {
            var d = e.getX(h);
            if (d !== s.getMinX() && d !== s.getMaxX()) return !1;
            var y = e.getY(h);
            if (y !== s.getMinY() && y !== s.getMaxY()) return !1;
          }
          for (var x = e.getX(0), I = e.getY(0), T = 1; T <= 4; T++) {
            var G = e.getX(T), q = e.getY(T);
            if (G !== x == (q !== I)) return !1;
            x = G, I = q;
          }
          return !0;
        } }, { key: "equalsExact", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "number" && arguments[0] instanceof ct) {
            var e = arguments[0], s = arguments[1];
            if (!this.isEquivalentClass(e)) return !1;
            var h = e, d = this._shell, y = h._shell;
            if (!d.equalsExact(y, s) || this._holes.length !== h._holes.length) return !1;
            for (var x = 0; x < this._holes.length; x++) if (!this._holes[x].equalsExact(h._holes[x], s)) return !1;
            return !0;
          }
          return C(t, "equalsExact", this, 1).apply(this, arguments);
        } }, { key: "normalize", value: function() {
          if (arguments.length === 0) {
            this._shell = this.normalized(this._shell, !0);
            for (var e = 0; e < this._holes.length; e++) this._holes[e] = this.normalized(this._holes[e], !1);
            ti.sort(this._holes);
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            if (s.isEmpty()) return null;
            var d = s.getCoordinateSequence(), y = $n.minCoordinateIndex(d, 0, d.size() - 2);
            $n.scroll(d, y, !0), vt.isCCW(d) === h && $n.reverse(d);
          }
        } }, { key: "getCoordinate", value: function() {
          return this._shell.getCoordinate();
        } }, { key: "getNumInteriorRing", value: function() {
          return this._holes.length;
        } }, { key: "getBoundaryDimension", value: function() {
          return 1;
        } }, { key: "reverseInternal", value: function() {
          for (var e = this.getExteriorRing().reverse(), s = new Array(this.getNumInteriorRing()).fill(null), h = 0; h < s.length; h++) s[h] = this.getInteriorRingN(h).reverse();
          return this.getFactory().createPolygon(e, s);
        } }, { key: "getTypeCode", value: function() {
          return ct.TYPECODE_POLYGON;
        } }, { key: "getDimension", value: function() {
          return 2;
        } }, { key: "getLength", value: function() {
          var e = 0;
          e += this._shell.getLength();
          for (var s = 0; s < this._holes.length; s++) e += this._holes[s].getLength();
          return e;
        } }, { key: "getNumPoints", value: function() {
          for (var e = this._shell.getNumPoints(), s = 0; s < this._holes.length; s++) e += this._holes[s].getNumPoints();
          return e;
        } }, { key: "convexHull", value: function() {
          return this.getExteriorRing().convexHull();
        } }, { key: "normalized", value: function(e, s) {
          var h = e.copy();
          return this.normalize(h, s), h;
        } }, { key: "compareToSameClass", value: function() {
          if (arguments.length === 1) {
            var e = arguments[0], s = this._shell, h = e._shell;
            return s.compareToSameClass(h);
          }
          if (arguments.length === 2) {
            var d = arguments[1], y = arguments[0], x = this._shell, I = y._shell, T = x.compareToSameClass(I, d);
            if (T !== 0) return T;
            for (var G = this.getNumInteriorRing(), q = y.getNumInteriorRing(), K = 0; K < G && K < q; ) {
              var rt = this.getInteriorRingN(K), ot = y.getInteriorRingN(K), gt = rt.compareToSameClass(ot, d);
              if (gt !== 0) return gt;
              K++;
            }
            return K < G ? 1 : K < q ? -1 : 0;
          }
        } }, { key: "apply", value: function() {
          if (kt(arguments[0], kr)) {
            var e = arguments[0];
            this._shell.apply(e);
            for (var s = 0; s < this._holes.length; s++) this._holes[s].apply(e);
          } else if (kt(arguments[0], Sr)) {
            var h = arguments[0];
            if (this._shell.apply(h), !h.isDone()) for (var d = 0; d < this._holes.length && (this._holes[d].apply(h), !h.isDone()); d++) ;
            h.isGeometryChanged() && this.geometryChanged();
          } else if (kt(arguments[0], wr))
            arguments[0].filter(this);
          else if (kt(arguments[0], H)) {
            var y = arguments[0];
            y.filter(this), this._shell.apply(y);
            for (var x = 0; x < this._holes.length; x++) this._holes[x].apply(y);
          }
        } }, { key: "getBoundary", value: function() {
          if (this.isEmpty()) return this.getFactory().createMultiLineString();
          var e = new Array(this._holes.length + 1).fill(null);
          e[0] = this._shell;
          for (var s = 0; s < this._holes.length; s++) e[s + 1] = this._holes[s];
          return e.length <= 1 ? this.getFactory().createLinearRing(e[0].getCoordinateSequence()) : this.getFactory().createMultiLineString(e);
        } }, { key: "getGeometryType", value: function() {
          return ct.TYPENAME_POLYGON;
        } }, { key: "getExteriorRing", value: function() {
          return this._shell;
        } }, { key: "isEmpty", value: function() {
          return this._shell.isEmpty();
        } }, { key: "getInteriorRingN", value: function(e) {
          return this._holes[e];
        } }, { key: "interfaces_", get: function() {
          return [Ya];
        } }], [{ key: "constructor_", value: function() {
          this._shell = null, this._holes = null;
          var e = arguments[0], s = arguments[1], h = arguments[2];
          if (ct.constructor_.call(this, h), e === null && (e = this.getFactory().createLinearRing()), s === null && (s = []), ct.hasNullElements(s)) throw new Y("holes must not contain null elements");
          if (e.isEmpty() && ct.hasNonEmptyElements(s)) throw new Y("shell is empty but holes are not");
          this._shell = e, this._holes = s;
        } }]);
      }(ct), Oo = function(u) {
        function t() {
          return c(this, t), l(this, t, arguments);
        }
        return E(t, u), g(t);
      }(za), Xa = function(u) {
        function t(e) {
          var s;
          return c(this, t), (s = l(this, t)).array = [], e instanceof nn && s.addAll(e), s;
        }
        return E(t, u), g(t, [{ key: "contains", value: function(e) {
          var s, h = v(this.array);
          try {
            for (h.s(); !(s = h.n()).done; )
              if (s.value.compareTo(e) === 0) return !0;
          } catch (d) {
            h.e(d);
          } finally {
            h.f();
          }
          return !1;
        } }, { key: "add", value: function(e) {
          if (this.contains(e)) return !1;
          for (var s = 0, h = this.array.length; s < h; s++)
            if (this.array[s].compareTo(e) === 1) return !!this.array.splice(s, 0, e);
          return this.array.push(e), !0;
        } }, { key: "addAll", value: function(e) {
          var s, h = v(e);
          try {
            for (h.s(); !(s = h.n()).done; ) {
              var d = s.value;
              this.add(d);
            }
          } catch (y) {
            h.e(y);
          } finally {
            h.f();
          }
          return !0;
        } }, { key: "remove", value: function() {
          throw new qe();
        } }, { key: "size", value: function() {
          return this.array.length;
        } }, { key: "isEmpty", value: function() {
          return this.array.length === 0;
        } }, { key: "toArray", value: function() {
          return this.array.slice();
        } }, { key: "iterator", value: function() {
          return new Lo(this.array);
        } }]);
      }(Oo), Lo = function() {
        return g(function u(t) {
          c(this, u), this.array = t, this.position = 0;
        }, [{ key: "next", value: function() {
          if (this.position === this.array.length) throw new we();
          return this.array[this.position++];
        } }, { key: "hasNext", value: function() {
          return this.position < this.array.length;
        } }, { key: "remove", value: function() {
          throw new qe();
        } }]);
      }(), Ce = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "computeEnvelopeInternal", value: function() {
          for (var e = new Wt(), s = 0; s < this._geometries.length; s++) e.expandToInclude(this._geometries[s].getEnvelopeInternal());
          return e;
        } }, { key: "getGeometryN", value: function(e) {
          return this._geometries[e];
        } }, { key: "getCoordinates", value: function() {
          for (var e = new Array(this.getNumPoints()).fill(null), s = -1, h = 0; h < this._geometries.length; h++) for (var d = this._geometries[h].getCoordinates(), y = 0; y < d.length; y++) e[++s] = d[y];
          return e;
        } }, { key: "getArea", value: function() {
          for (var e = 0, s = 0; s < this._geometries.length; s++) e += this._geometries[s].getArea();
          return e;
        } }, { key: "copyInternal", value: function() {
          for (var e = new Array(this._geometries.length).fill(null), s = 0; s < e.length; s++) e[s] = this._geometries[s].copy();
          return new t(e, this._factory);
        } }, { key: "equalsExact", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "number" && arguments[0] instanceof ct) {
            var e = arguments[0], s = arguments[1];
            if (!this.isEquivalentClass(e)) return !1;
            var h = e;
            if (this._geometries.length !== h._geometries.length) return !1;
            for (var d = 0; d < this._geometries.length; d++) if (!this._geometries[d].equalsExact(h._geometries[d], s)) return !1;
            return !0;
          }
          return C(t, "equalsExact", this, 1).apply(this, arguments);
        } }, { key: "normalize", value: function() {
          for (var e = 0; e < this._geometries.length; e++) this._geometries[e].normalize();
          ti.sort(this._geometries);
        } }, { key: "getCoordinate", value: function() {
          return this.isEmpty() ? null : this._geometries[0].getCoordinate();
        } }, { key: "getBoundaryDimension", value: function() {
          for (var e = nt.FALSE, s = 0; s < this._geometries.length; s++) e = Math.max(e, this._geometries[s].getBoundaryDimension());
          return e;
        } }, { key: "reverseInternal", value: function() {
          for (var e = this._geometries.length, s = new yt(e), h = 0; h < e; h++) s.add(this._geometries[h].reverse());
          return this.getFactory().buildGeometry(s);
        } }, { key: "getTypeCode", value: function() {
          return ct.TYPECODE_GEOMETRYCOLLECTION;
        } }, { key: "getDimension", value: function() {
          for (var e = nt.FALSE, s = 0; s < this._geometries.length; s++) e = Math.max(e, this._geometries[s].getDimension());
          return e;
        } }, { key: "getLength", value: function() {
          for (var e = 0, s = 0; s < this._geometries.length; s++) e += this._geometries[s].getLength();
          return e;
        } }, { key: "getNumPoints", value: function() {
          for (var e = 0, s = 0; s < this._geometries.length; s++) e += this._geometries[s].getNumPoints();
          return e;
        } }, { key: "getNumGeometries", value: function() {
          return this._geometries.length;
        } }, { key: "compareToSameClass", value: function() {
          if (arguments.length === 1) {
            var e = arguments[0], s = new Xa(ti.asList(this._geometries)), h = new Xa(ti.asList(e._geometries));
            return this.compare(s, h);
          }
          if (arguments.length === 2) {
            for (var d = arguments[1], y = arguments[0], x = this.getNumGeometries(), I = y.getNumGeometries(), T = 0; T < x && T < I; ) {
              var G = this.getGeometryN(T), q = y.getGeometryN(T), K = G.compareToSameClass(q, d);
              if (K !== 0) return K;
              T++;
            }
            return T < x ? 1 : T < I ? -1 : 0;
          }
        } }, { key: "apply", value: function() {
          if (kt(arguments[0], kr)) for (var e = arguments[0], s = 0; s < this._geometries.length; s++) this._geometries[s].apply(e);
          else if (kt(arguments[0], Sr)) {
            var h = arguments[0];
            if (this._geometries.length === 0) return null;
            for (var d = 0; d < this._geometries.length && (this._geometries[d].apply(h), !h.isDone()); d++) ;
            h.isGeometryChanged() && this.geometryChanged();
          } else if (kt(arguments[0], wr)) {
            var y = arguments[0];
            y.filter(this);
            for (var x = 0; x < this._geometries.length; x++) this._geometries[x].apply(y);
          } else if (kt(arguments[0], H)) {
            var I = arguments[0];
            I.filter(this);
            for (var T = 0; T < this._geometries.length; T++) this._geometries[T].apply(I);
          }
        } }, { key: "getBoundary", value: function() {
          return ct.checkNotGeometryCollection(this), It.shouldNeverReachHere(), null;
        } }, { key: "getGeometryType", value: function() {
          return ct.TYPENAME_GEOMETRYCOLLECTION;
        } }, { key: "isEmpty", value: function() {
          for (var e = 0; e < this._geometries.length; e++) if (!this._geometries[e].isEmpty()) return !1;
          return !0;
        } }], [{ key: "constructor_", value: function() {
          if (this._geometries = null, arguments.length !== 0 && arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            if (ct.constructor_.call(this, s), e === null && (e = []), ct.hasNullElements(e)) throw new Y("geometries must not contain null elements");
            this._geometries = e;
          }
        } }]);
      }(ct), xs = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "copyInternal", value: function() {
          for (var e = new Array(this._geometries.length).fill(null), s = 0; s < e.length; s++) e[s] = this._geometries[s].copy();
          return new t(e, this._factory);
        } }, { key: "isValid", value: function() {
          return !0;
        } }, { key: "equalsExact", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "number" && arguments[0] instanceof ct) {
            var e = arguments[0], s = arguments[1];
            return !!this.isEquivalentClass(e) && C(t, "equalsExact", this, 1).call(this, e, s);
          }
          return C(t, "equalsExact", this, 1).apply(this, arguments);
        } }, { key: "getCoordinate", value: function() {
          if (arguments.length === 1 && Number.isInteger(arguments[0])) {
            var e = arguments[0];
            return this._geometries[e].getCoordinate();
          }
          return C(t, "getCoordinate", this, 1).apply(this, arguments);
        } }, { key: "getBoundaryDimension", value: function() {
          return nt.FALSE;
        } }, { key: "getTypeCode", value: function() {
          return ct.TYPECODE_MULTIPOINT;
        } }, { key: "getDimension", value: function() {
          return 0;
        } }, { key: "getBoundary", value: function() {
          return this.getFactory().createGeometryCollection();
        } }, { key: "getGeometryType", value: function() {
          return ct.TYPENAME_MULTIPOINT;
        } }, { key: "interfaces_", get: function() {
          return [Ir];
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0], s = arguments[1];
          Ce.constructor_.call(this, e, s);
        } }]);
      }(Ce), Si = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "copyInternal", value: function() {
          return new t(this._points.copy(), this._factory);
        } }, { key: "getBoundaryDimension", value: function() {
          return nt.FALSE;
        } }, { key: "isClosed", value: function() {
          return !!this.isEmpty() || C(t, "isClosed", this, 1).call(this);
        } }, { key: "reverseInternal", value: function() {
          var e = this._points.copy();
          return $n.reverse(e), this.getFactory().createLinearRing(e);
        } }, { key: "getTypeCode", value: function() {
          return ct.TYPECODE_LINEARRING;
        } }, { key: "validateConstruction", value: function() {
          if (!this.isEmpty() && !C(t, "isClosed", this, 1).call(this)) throw new Y("Points of LinearRing do not form a closed linestring");
          if (this.getCoordinateSequence().size() >= 1 && this.getCoordinateSequence().size() < t.MINIMUM_VALID_SIZE) throw new Y("Invalid number of points in LinearRing (found " + this.getCoordinateSequence().size() + " - must be 0 or >= 4)");
        } }, { key: "getGeometryType", value: function() {
          return ct.TYPENAME_LINEARRING;
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0], s = arguments[1];
          Ki.constructor_.call(this, e, s), this.validateConstruction();
        } }]);
      }(Ki);
      Si.MINIMUM_VALID_SIZE = 4;
      var ei = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "setOrdinate", value: function(e, s) {
          switch (e) {
            case t.X:
              this.x = s;
              break;
            case t.Y:
              this.y = s;
              break;
            default:
              throw new Y("Invalid ordinate index: " + e);
          }
        } }, { key: "getZ", value: function() {
          return z.NULL_ORDINATE;
        } }, { key: "getOrdinate", value: function(e) {
          switch (e) {
            case t.X:
              return this.x;
            case t.Y:
              return this.y;
          }
          throw new Y("Invalid ordinate index: " + e);
        } }, { key: "setZ", value: function(e) {
          throw new Y("CoordinateXY dimension 2 does not support z-ordinate");
        } }, { key: "copy", value: function() {
          return new t(this);
        } }, { key: "toString", value: function() {
          return "(" + this.x + ", " + this.y + ")";
        } }, { key: "setCoordinate", value: function(e) {
          this.x = e.x, this.y = e.y, this.z = e.getZ();
        } }], [{ key: "constructor_", value: function() {
          if (arguments.length === 0) z.constructor_.call(this);
          else if (arguments.length === 1) {
            if (arguments[0] instanceof t) {
              var e = arguments[0];
              z.constructor_.call(this, e.x, e.y);
            } else if (arguments[0] instanceof z) {
              var s = arguments[0];
              z.constructor_.call(this, s.x, s.y);
            }
          } else if (arguments.length === 2) {
            var h = arguments[0], d = arguments[1];
            z.constructor_.call(this, h, d, z.NULL_ORDINATE);
          }
        } }]);
      }(z);
      ei.X = 0, ei.Y = 1, ei.Z = -1, ei.M = -1;
      var ni = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "getM", value: function() {
          return this._m;
        } }, { key: "setOrdinate", value: function(e, s) {
          switch (e) {
            case t.X:
              this.x = s;
              break;
            case t.Y:
              this.y = s;
              break;
            case t.M:
              this._m = s;
              break;
            default:
              throw new Y("Invalid ordinate index: " + e);
          }
        } }, { key: "setM", value: function(e) {
          this._m = e;
        } }, { key: "getZ", value: function() {
          return z.NULL_ORDINATE;
        } }, { key: "getOrdinate", value: function(e) {
          switch (e) {
            case t.X:
              return this.x;
            case t.Y:
              return this.y;
            case t.M:
              return this._m;
          }
          throw new Y("Invalid ordinate index: " + e);
        } }, { key: "setZ", value: function(e) {
          throw new Y("CoordinateXY dimension 2 does not support z-ordinate");
        } }, { key: "copy", value: function() {
          return new t(this);
        } }, { key: "toString", value: function() {
          return "(" + this.x + ", " + this.y + " m=" + this.getM() + ")";
        } }, { key: "setCoordinate", value: function(e) {
          this.x = e.x, this.y = e.y, this.z = e.getZ(), this._m = e.getM();
        } }], [{ key: "constructor_", value: function() {
          if (this._m = null, arguments.length === 0) z.constructor_.call(this), this._m = 0;
          else if (arguments.length === 1) {
            if (arguments[0] instanceof t) {
              var e = arguments[0];
              z.constructor_.call(this, e.x, e.y), this._m = e._m;
            } else if (arguments[0] instanceof z) {
              var s = arguments[0];
              z.constructor_.call(this, s.x, s.y), this._m = this.getM();
            }
          } else if (arguments.length === 3) {
            var h = arguments[0], d = arguments[1], y = arguments[2];
            z.constructor_.call(this, h, d, z.NULL_ORDINATE), this._m = y;
          }
        } }]);
      }(z);
      ni.X = 0, ni.Y = 1, ni.Z = -1, ni.M = 2;
      var Es = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "getM", value: function() {
          return this._m;
        } }, { key: "setOrdinate", value: function(e, s) {
          switch (e) {
            case z.X:
              this.x = s;
              break;
            case z.Y:
              this.y = s;
              break;
            case z.Z:
              this.z = s;
              break;
            case z.M:
              this._m = s;
              break;
            default:
              throw new Y("Invalid ordinate index: " + e);
          }
        } }, { key: "setM", value: function(e) {
          this._m = e;
        } }, { key: "getOrdinate", value: function(e) {
          switch (e) {
            case z.X:
              return this.x;
            case z.Y:
              return this.y;
            case z.Z:
              return this.getZ();
            case z.M:
              return this.getM();
          }
          throw new Y("Invalid ordinate index: " + e);
        } }, { key: "copy", value: function() {
          return new t(this);
        } }, { key: "toString", value: function() {
          return "(" + this.x + ", " + this.y + ", " + this.getZ() + " m=" + this.getM() + ")";
        } }, { key: "setCoordinate", value: function(e) {
          this.x = e.x, this.y = e.y, this.z = e.getZ(), this._m = e.getM();
        } }], [{ key: "constructor_", value: function() {
          if (this._m = null, arguments.length === 0) z.constructor_.call(this), this._m = 0;
          else if (arguments.length === 1) {
            if (arguments[0] instanceof t) {
              var e = arguments[0];
              z.constructor_.call(this, e), this._m = e._m;
            } else if (arguments[0] instanceof z) {
              var s = arguments[0];
              z.constructor_.call(this, s), this._m = this.getM();
            }
          } else if (arguments.length === 4) {
            var h = arguments[0], d = arguments[1], y = arguments[2], x = arguments[3];
            z.constructor_.call(this, h, d, y), this._m = x;
          }
        } }]);
      }(z), Cr = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "measures", value: function(t) {
          return t instanceof ei ? 0 : t instanceof ni || t instanceof Es ? 1 : 0;
        } }, { key: "dimension", value: function(t) {
          return t instanceof ei ? 2 : t instanceof ni ? 3 : t instanceof Es ? 4 : 3;
        } }, { key: "create", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return u.create(t, 0);
          }
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            return e === 2 ? new ei() : e === 3 && s === 0 ? new z() : e === 3 && s === 1 ? new ni() : e === 4 && s === 1 ? new Es() : new z();
          }
        } }]);
      }(), Zi = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "getCoordinate", value: function(e) {
          return this.get(e);
        } }, { key: "addAll", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "boolean" && kt(arguments[0], nn)) {
            for (var e = arguments[1], s = !1, h = arguments[0].iterator(); h.hasNext(); ) this.add(h.next(), e), s = !0;
            return s;
          }
          return C(t, "addAll", this, 1).apply(this, arguments);
        } }, { key: "clone", value: function() {
          for (var e = C(t, "clone", this, 1).call(this), s = 0; s < this.size(); s++) e.add(s, this.get(s).clone());
          return e;
        } }, { key: "toCoordinateArray", value: function() {
          if (arguments.length === 0) return this.toArray(t.coordArrayType);
          if (arguments.length === 1) {
            if (arguments[0]) return this.toArray(t.coordArrayType);
            for (var e = this.size(), s = new Array(e).fill(null), h = 0; h < e; h++) s[h] = this.get(e - h - 1);
            return s;
          }
        } }, { key: "add", value: function() {
          if (arguments.length === 1) {
            var e = arguments[0];
            return C(t, "add", this, 1).call(this, e);
          }
          if (arguments.length === 2) {
            if (arguments[0] instanceof Array && typeof arguments[1] == "boolean") {
              var s = arguments[0], h = arguments[1];
              return this.add(s, h, !0), !0;
            }
            if (arguments[0] instanceof z && typeof arguments[1] == "boolean") {
              var d = arguments[0];
              if (!arguments[1] && this.size() >= 1 && this.get(this.size() - 1).equals2D(d)) return null;
              C(t, "add", this, 1).call(this, d);
            } else if (arguments[0] instanceof Object && typeof arguments[1] == "boolean") {
              var y = arguments[0], x = arguments[1];
              return this.add(y, x), !0;
            }
          } else if (arguments.length === 3) {
            if (typeof arguments[2] == "boolean" && arguments[0] instanceof Array && typeof arguments[1] == "boolean") {
              var I = arguments[0], T = arguments[1];
              if (arguments[2]) for (var G = 0; G < I.length; G++) this.add(I[G], T);
              else for (var q = I.length - 1; q >= 0; q--) this.add(I[q], T);
              return !0;
            }
            if (typeof arguments[2] == "boolean" && Number.isInteger(arguments[0]) && arguments[1] instanceof z) {
              var K = arguments[0], rt = arguments[1];
              if (!arguments[2]) {
                var ot = this.size();
                if (ot > 0 && (K > 0 && this.get(K - 1).equals2D(rt) || K < ot && this.get(K).equals2D(rt)))
                  return null;
              }
              C(t, "add", this, 1).call(this, K, rt);
            }
          } else if (arguments.length === 4) {
            var gt = arguments[0], Pt = arguments[1], lt = arguments[2], Xt = arguments[3], fe = 1;
            lt > Xt && (fe = -1);
            for (var se = lt; se !== Xt; se += fe) this.add(gt[se], Pt);
            return !0;
          }
        } }, { key: "closeRing", value: function() {
          if (this.size() > 0) {
            var e = this.get(0).copy();
            this.add(e, !1);
          }
        } }], [{ key: "constructor_", value: function() {
          if (arguments.length !== 0) {
            if (arguments.length === 1) {
              var e = arguments[0];
              this.ensureCapacity(e.length), this.add(e, !0);
            } else if (arguments.length === 2) {
              var s = arguments[0], h = arguments[1];
              this.ensureCapacity(s.length), this.add(s, h);
            }
          }
        } }]);
      }(yt);
      Zi.coordArrayType = new Array(0).fill(null);
      var re = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "isRing", value: function(t) {
          return !(t.length < 4) && !!t[0].equals2D(t[t.length - 1]);
        } }, { key: "ptNotInList", value: function(t, e) {
          for (var s = 0; s < t.length; s++) {
            var h = t[s];
            if (u.indexOf(h, e) < 0) return h;
          }
          return null;
        } }, { key: "scroll", value: function(t, e) {
          var s = u.indexOf(e, t);
          if (s < 0) return null;
          var h = new Array(t.length).fill(null);
          ze.arraycopy(t, s, h, 0, t.length - s), ze.arraycopy(t, 0, h, t.length - s, s), ze.arraycopy(h, 0, t, 0, t.length);
        } }, { key: "equals", value: function() {
          if (arguments.length === 2) {
            var t = arguments[0], e = arguments[1];
            if (t === e) return !0;
            if (t === null || e === null || t.length !== e.length) return !1;
            for (var s = 0; s < t.length; s++) if (!t[s].equals(e[s])) return !1;
            return !0;
          }
          if (arguments.length === 3) {
            var h = arguments[0], d = arguments[1], y = arguments[2];
            if (h === d) return !0;
            if (h === null || d === null || h.length !== d.length) return !1;
            for (var x = 0; x < h.length; x++) if (y.compare(h[x], d[x]) !== 0) return !1;
            return !0;
          }
        } }, { key: "intersection", value: function(t, e) {
          for (var s = new Zi(), h = 0; h < t.length; h++) e.intersects(t[h]) && s.add(t[h], !0);
          return s.toCoordinateArray();
        } }, { key: "measures", value: function(t) {
          if (t === null || t.length === 0) return 0;
          var e, s = 0, h = v(t);
          try {
            for (h.s(); !(e = h.n()).done; ) {
              var d = e.value;
              s = Math.max(s, Cr.measures(d));
            }
          } catch (y) {
            h.e(y);
          } finally {
            h.f();
          }
          return s;
        } }, { key: "hasRepeatedPoints", value: function(t) {
          for (var e = 1; e < t.length; e++) if (t[e - 1].equals(t[e])) return !0;
          return !1;
        } }, { key: "removeRepeatedPoints", value: function(t) {
          return u.hasRepeatedPoints(t) ? new Zi(t, !1).toCoordinateArray() : t;
        } }, { key: "reverse", value: function(t) {
          for (var e = t.length - 1, s = Math.trunc(e / 2), h = 0; h <= s; h++) {
            var d = t[h];
            t[h] = t[e - h], t[e - h] = d;
          }
        } }, { key: "removeNull", value: function(t) {
          for (var e = 0, s = 0; s < t.length; s++) t[s] !== null && e++;
          var h = new Array(e).fill(null);
          if (e === 0) return h;
          for (var d = 0, y = 0; y < t.length; y++) t[y] !== null && (h[d++] = t[y]);
          return h;
        } }, { key: "copyDeep", value: function() {
          if (arguments.length === 1) {
            for (var t = arguments[0], e = new Array(t.length).fill(null), s = 0; s < t.length; s++) e[s] = t[s].copy();
            return e;
          }
          if (arguments.length === 5) for (var h = arguments[0], d = arguments[1], y = arguments[2], x = arguments[3], I = arguments[4], T = 0; T < I; T++) y[x + T] = h[d + T].copy();
        } }, { key: "isEqualReversed", value: function(t, e) {
          for (var s = 0; s < t.length; s++) {
            var h = t[s], d = e[t.length - s - 1];
            if (h.compareTo(d) !== 0) return !1;
          }
          return !0;
        } }, { key: "envelope", value: function(t) {
          for (var e = new Wt(), s = 0; s < t.length; s++) e.expandToInclude(t[s]);
          return e;
        } }, { key: "toCoordinateArray", value: function(t) {
          return t.toArray(u.coordArrayType);
        } }, { key: "dimension", value: function(t) {
          if (t === null || t.length === 0) return 3;
          var e, s = 0, h = v(t);
          try {
            for (h.s(); !(e = h.n()).done; ) {
              var d = e.value;
              s = Math.max(s, Cr.dimension(d));
            }
          } catch (y) {
            h.e(y);
          } finally {
            h.f();
          }
          return s;
        } }, { key: "atLeastNCoordinatesOrNothing", value: function(t, e) {
          return e.length >= t ? e : [];
        } }, { key: "indexOf", value: function(t, e) {
          for (var s = 0; s < e.length; s++) if (t.equals(e[s])) return s;
          return -1;
        } }, { key: "increasingDirection", value: function(t) {
          for (var e = 0; e < Math.trunc(t.length / 2); e++) {
            var s = t.length - 1 - e, h = t[e].compareTo(t[s]);
            if (h !== 0) return h;
          }
          return 1;
        } }, { key: "compare", value: function(t, e) {
          for (var s = 0; s < t.length && s < e.length; ) {
            var h = t[s].compareTo(e[s]);
            if (h !== 0) return h;
            s++;
          }
          return s < e.length ? -1 : s < t.length ? 1 : 0;
        } }, { key: "minCoordinate", value: function(t) {
          for (var e = null, s = 0; s < t.length; s++) (e === null || e.compareTo(t[s]) > 0) && (e = t[s]);
          return e;
        } }, { key: "extract", value: function(t, e, s) {
          e = Hi.clamp(e, 0, t.length);
          var h = (s = Hi.clamp(s, -1, t.length)) - e + 1;
          s < 0 && (h = 0), e >= t.length && (h = 0), s < e && (h = 0);
          var d = new Array(h).fill(null);
          if (h === 0) return d;
          for (var y = 0, x = e; x <= s; x++) d[y++] = t[x];
          return d;
        } }]);
      }(), Pr = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "compare", value: function(u, t) {
          var e = u, s = t;
          return re.compare(e, s);
        } }, { key: "interfaces_", get: function() {
          return [Kt];
        } }]);
      }(), Go = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "compare", value: function(u, t) {
          var e = u, s = t;
          if (e.length < s.length) return -1;
          if (e.length > s.length) return 1;
          if (e.length === 0) return 0;
          var h = re.compare(e, s);
          return re.isEqualReversed(e, s) ? 0 : h;
        } }, { key: "OLDcompare", value: function(u, t) {
          var e = u, s = t;
          if (e.length < s.length) return -1;
          if (e.length > s.length) return 1;
          if (e.length === 0) return 0;
          for (var h = re.increasingDirection(e), d = re.increasingDirection(s), y = h > 0 ? 0 : e.length - 1, x = d > 0 ? 0 : e.length - 1, I = 0; I < e.length; I++) {
            var T = e[y].compareTo(s[x]);
            if (T !== 0) return T;
            y += h, x += d;
          }
          return 0;
        } }, { key: "interfaces_", get: function() {
          return [Kt];
        } }]);
      }();
      re.ForwardComparator = Pr, re.BidirectionalComparator = Go, re.coordArrayType = new Array(0).fill(null);
      var ii = function() {
        return g(function u(t) {
          c(this, u), this.str = t;
        }, [{ key: "append", value: function(u) {
          this.str += u;
        } }, { key: "setCharAt", value: function(u, t) {
          this.str = this.str.substr(0, u) + t + this.str.substr(u + 1);
        } }, { key: "toString", value: function() {
          return this.str;
        } }]);
      }(), Qi = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getM", value: function(t) {
          return this.hasM() ? this._coordinates[t].getM() : ht.NaN;
        } }, { key: "setOrdinate", value: function(t, e, s) {
          switch (e) {
            case At.X:
              this._coordinates[t].x = s;
              break;
            case At.Y:
              this._coordinates[t].y = s;
              break;
            default:
              this._coordinates[t].setOrdinate(e, s);
          }
        } }, { key: "getZ", value: function(t) {
          return this.hasZ() ? this._coordinates[t].getZ() : ht.NaN;
        } }, { key: "size", value: function() {
          return this._coordinates.length;
        } }, { key: "getOrdinate", value: function(t, e) {
          switch (e) {
            case At.X:
              return this._coordinates[t].x;
            case At.Y:
              return this._coordinates[t].y;
            default:
              return this._coordinates[t].getOrdinate(e);
          }
        } }, { key: "getCoordinate", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return this._coordinates[t];
          }
          if (arguments.length === 2) {
            var e = arguments[0];
            arguments[1].setCoordinate(this._coordinates[e]);
          }
        } }, { key: "getCoordinateCopy", value: function(t) {
          var e = this.createCoordinate();
          return e.setCoordinate(this._coordinates[t]), e;
        } }, { key: "createCoordinate", value: function() {
          return Cr.create(this.getDimension(), this.getMeasures());
        } }, { key: "getDimension", value: function() {
          return this._dimension;
        } }, { key: "getX", value: function(t) {
          return this._coordinates[t].x;
        } }, { key: "getMeasures", value: function() {
          return this._measures;
        } }, { key: "expandEnvelope", value: function(t) {
          for (var e = 0; e < this._coordinates.length; e++) t.expandToInclude(this._coordinates[e]);
          return t;
        } }, { key: "copy", value: function() {
          for (var t = new Array(this.size()).fill(null), e = 0; e < this._coordinates.length; e++) {
            var s = this.createCoordinate();
            s.setCoordinate(this._coordinates[e]), t[e] = s;
          }
          return new u(t, this._dimension, this._measures);
        } }, { key: "toString", value: function() {
          if (this._coordinates.length > 0) {
            var t = new ii(17 * this._coordinates.length);
            t.append("("), t.append(this._coordinates[0]);
            for (var e = 1; e < this._coordinates.length; e++) t.append(", "), t.append(this._coordinates[e]);
            return t.append(")"), t.toString();
          }
          return "()";
        } }, { key: "getY", value: function(t) {
          return this._coordinates[t].y;
        } }, { key: "toCoordinateArray", value: function() {
          return this._coordinates;
        } }, { key: "interfaces_", get: function() {
          return [At, $];
        } }], [{ key: "constructor_", value: function() {
          if (this._dimension = 3, this._measures = 0, this._coordinates = null, arguments.length === 1) {
            if (arguments[0] instanceof Array) {
              var t = arguments[0];
              u.constructor_.call(this, t, re.dimension(t), re.measures(t));
            } else if (Number.isInteger(arguments[0])) {
              var e = arguments[0];
              this._coordinates = new Array(e).fill(null);
              for (var s = 0; s < e; s++) this._coordinates[s] = new z();
            } else if (kt(arguments[0], At)) {
              var h = arguments[0];
              if (h === null) return this._coordinates = new Array(0).fill(null), null;
              this._dimension = h.getDimension(), this._measures = h.getMeasures(), this._coordinates = new Array(h.size()).fill(null);
              for (var d = 0; d < this._coordinates.length; d++) this._coordinates[d] = h.getCoordinateCopy(d);
            }
          } else if (arguments.length === 2) {
            if (arguments[0] instanceof Array && Number.isInteger(arguments[1])) {
              var y = arguments[0], x = arguments[1];
              u.constructor_.call(this, y, x, re.measures(y));
            } else if (Number.isInteger(arguments[0]) && Number.isInteger(arguments[1])) {
              var I = arguments[0], T = arguments[1];
              this._coordinates = new Array(I).fill(null), this._dimension = T;
              for (var G = 0; G < I; G++) this._coordinates[G] = Cr.create(T);
            }
          } else if (arguments.length === 3) {
            if (Number.isInteger(arguments[2]) && arguments[0] instanceof Array && Number.isInteger(arguments[1])) {
              var q = arguments[0], K = arguments[1], rt = arguments[2];
              this._dimension = K, this._measures = rt, this._coordinates = q === null ? new Array(0).fill(null) : q;
            } else if (Number.isInteger(arguments[2]) && Number.isInteger(arguments[0]) && Number.isInteger(arguments[1])) {
              var ot = arguments[0], gt = arguments[1], Pt = arguments[2];
              this._coordinates = new Array(ot).fill(null), this._dimension = gt, this._measures = Pt;
              for (var lt = 0; lt < ot; lt++) this._coordinates[lt] = this.createCoordinate();
            }
          }
        } }]);
      }(), Ms = function() {
        function u() {
          c(this, u);
        }
        return g(u, [{ key: "readResolve", value: function() {
          return u.instance();
        } }, { key: "create", value: function() {
          if (arguments.length === 1) {
            if (arguments[0] instanceof Array) return new Qi(arguments[0]);
            if (kt(arguments[0], At)) return new Qi(arguments[0]);
          } else {
            if (arguments.length === 2) {
              var t = arguments[1];
              return t > 3 && (t = 3), t < 2 && (t = 2), new Qi(arguments[0], t);
            }
            if (arguments.length === 3) {
              var e = arguments[2], s = arguments[1] - e;
              return e > 1 && (e = 1), s > 3 && (s = 3), s < 2 && (s = 2), new Qi(arguments[0], s + e, e);
            }
          }
        } }, { key: "interfaces_", get: function() {
          return [ps, $];
        } }], [{ key: "instance", value: function() {
          return u.instanceObject;
        } }]);
      }();
      Ms.instanceObject = new Ms();
      var ks = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "copyInternal", value: function() {
          for (var e = new Array(this._geometries.length).fill(null), s = 0; s < e.length; s++) e[s] = this._geometries[s].copy();
          return new t(e, this._factory);
        } }, { key: "equalsExact", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "number" && arguments[0] instanceof ct) {
            var e = arguments[0], s = arguments[1];
            return !!this.isEquivalentClass(e) && C(t, "equalsExact", this, 1).call(this, e, s);
          }
          return C(t, "equalsExact", this, 1).apply(this, arguments);
        } }, { key: "getBoundaryDimension", value: function() {
          return 1;
        } }, { key: "getTypeCode", value: function() {
          return ct.TYPECODE_MULTIPOLYGON;
        } }, { key: "getDimension", value: function() {
          return 2;
        } }, { key: "getBoundary", value: function() {
          if (this.isEmpty()) return this.getFactory().createMultiLineString();
          for (var e = new yt(), s = 0; s < this._geometries.length; s++) for (var h = this._geometries[s].getBoundary(), d = 0; d < h.getNumGeometries(); d++) e.add(h.getGeometryN(d));
          var y = new Array(e.size()).fill(null);
          return this.getFactory().createMultiLineString(e.toArray(y));
        } }, { key: "getGeometryType", value: function() {
          return ct.TYPENAME_MULTIPOLYGON;
        } }, { key: "interfaces_", get: function() {
          return [Ya];
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0], s = arguments[1];
          Ce.constructor_.call(this, e, s);
        } }]);
      }(Ce), ws = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "get", value: function() {
        } }, { key: "put", value: function() {
        } }, { key: "size", value: function() {
        } }, { key: "values", value: function() {
        } }, { key: "entrySet", value: function() {
        } }]);
      }(), Va = function(u) {
        function t() {
          var e;
          return c(this, t), (e = l(this, t)).map = /* @__PURE__ */ new Map(), e;
        }
        return E(t, u), g(t, [{ key: "get", value: function(e) {
          return this.map.get(e) || null;
        } }, { key: "put", value: function(e, s) {
          return this.map.set(e, s), s;
        } }, { key: "values", value: function() {
          for (var e = new yt(), s = this.map.values(), h = s.next(); !h.done; ) e.add(h.value), h = s.next();
          return e;
        } }, { key: "entrySet", value: function() {
          var e = new rn();
          return this.map.entries().forEach(function(s) {
            return e.add(s);
          }), e;
        } }, { key: "size", value: function() {
          return this.map.size();
        } }]);
      }(ws), je = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "equals", value: function(t) {
          if (!(t instanceof u)) return !1;
          var e = t;
          return this._modelType === e._modelType && this._scale === e._scale;
        } }, { key: "compareTo", value: function(t) {
          var e = t, s = this.getMaximumSignificantDigits(), h = e.getMaximumSignificantDigits();
          return Mr.compare(s, h);
        } }, { key: "getScale", value: function() {
          return this._scale;
        } }, { key: "isFloating", value: function() {
          return this._modelType === u.FLOATING || this._modelType === u.FLOATING_SINGLE;
        } }, { key: "getType", value: function() {
          return this._modelType;
        } }, { key: "toString", value: function() {
          var t = "UNKNOWN";
          return this._modelType === u.FLOATING ? t = "Floating" : this._modelType === u.FLOATING_SINGLE ? t = "Floating-Single" : this._modelType === u.FIXED && (t = "Fixed (Scale=" + this.getScale() + ")"), t;
        } }, { key: "makePrecise", value: function() {
          if (typeof arguments[0] == "number") {
            var t = arguments[0];
            return ht.isNaN(t) || this._modelType === u.FLOATING_SINGLE ? t : this._modelType === u.FIXED ? Math.round(t * this._scale) / this._scale : t;
          }
          if (arguments[0] instanceof z) {
            var e = arguments[0];
            if (this._modelType === u.FLOATING) return null;
            e.x = this.makePrecise(e.x), e.y = this.makePrecise(e.y);
          }
        } }, { key: "getMaximumSignificantDigits", value: function() {
          var t = 16;
          return this._modelType === u.FLOATING ? t = 16 : this._modelType === u.FLOATING_SINGLE ? t = 6 : this._modelType === u.FIXED && (t = 1 + Math.trunc(Math.ceil(Math.log(this.getScale()) / Math.log(10)))), t;
        } }, { key: "setScale", value: function(t) {
          this._scale = Math.abs(t);
        } }, { key: "interfaces_", get: function() {
          return [$, Z];
        } }], [{ key: "constructor_", value: function() {
          if (this._modelType = null, this._scale = null, arguments.length === 0) this._modelType = u.FLOATING;
          else if (arguments.length === 1) {
            if (arguments[0] instanceof Ii) {
              var t = arguments[0];
              this._modelType = t, t === u.FIXED && this.setScale(1);
            } else if (typeof arguments[0] == "number") {
              var e = arguments[0];
              this._modelType = u.FIXED, this.setScale(e);
            } else if (arguments[0] instanceof u) {
              var s = arguments[0];
              this._modelType = s._modelType, this._scale = s._scale;
            }
          }
        } }, { key: "mostPrecise", value: function(t, e) {
          return t.compareTo(e) >= 0 ? t : e;
        } }]);
      }(), Ii = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "readResolve", value: function() {
          return u.nameToTypeMap.get(this._name);
        } }, { key: "toString", value: function() {
          return this._name;
        } }, { key: "interfaces_", get: function() {
          return [$];
        } }], [{ key: "constructor_", value: function() {
          this._name = null;
          var t = arguments[0];
          this._name = t, u.nameToTypeMap.put(t, this);
        } }]);
      }();
      Ii.nameToTypeMap = new Va(), je.Type = Ii, je.FIXED = new Ii("FIXED"), je.FLOATING = new Ii("FLOATING"), je.FLOATING_SINGLE = new Ii("FLOATING SINGLE"), je.maximumPreciseValue = 9007199254740992;
      var Ss = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "copyInternal", value: function() {
          for (var e = new Array(this._geometries.length).fill(null), s = 0; s < e.length; s++) e[s] = this._geometries[s].copy();
          return new t(e, this._factory);
        } }, { key: "equalsExact", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "number" && arguments[0] instanceof ct) {
            var e = arguments[0], s = arguments[1];
            return !!this.isEquivalentClass(e) && C(t, "equalsExact", this, 1).call(this, e, s);
          }
          return C(t, "equalsExact", this, 1).apply(this, arguments);
        } }, { key: "getBoundaryDimension", value: function() {
          return this.isClosed() ? nt.FALSE : 0;
        } }, { key: "isClosed", value: function() {
          if (this.isEmpty()) return !1;
          for (var e = 0; e < this._geometries.length; e++) if (!this._geometries[e].isClosed()) return !1;
          return !0;
        } }, { key: "getTypeCode", value: function() {
          return ct.TYPECODE_MULTILINESTRING;
        } }, { key: "getDimension", value: function() {
          return 1;
        } }, { key: "getBoundary", value: function() {
          throw new qe();
        } }, { key: "getGeometryType", value: function() {
          return ct.TYPENAME_MULTILINESTRING;
        } }, { key: "interfaces_", get: function() {
          return [Ua];
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0], s = arguments[1];
          Ce.constructor_.call(this, e, s);
        } }]);
      }(Ce), Ni = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "createEmpty", value: function(t) {
          switch (t) {
            case -1:
              return this.createGeometryCollection();
            case 0:
              return this.createPoint();
            case 1:
              return this.createLineString();
            case 2:
              return this.createPolygon();
            default:
              throw new Y("Invalid dimension: " + t);
          }
        } }, { key: "toGeometry", value: function(t) {
          return t.isNull() ? this.createPoint() : t.getMinX() === t.getMaxX() && t.getMinY() === t.getMaxY() ? this.createPoint(new z(t.getMinX(), t.getMinY())) : t.getMinX() === t.getMaxX() || t.getMinY() === t.getMaxY() ? this.createLineString([new z(t.getMinX(), t.getMinY()), new z(t.getMaxX(), t.getMaxY())]) : this.createPolygon(this.createLinearRing([new z(t.getMinX(), t.getMinY()), new z(t.getMinX(), t.getMaxY()), new z(t.getMaxX(), t.getMaxY()), new z(t.getMaxX(), t.getMinY()), new z(t.getMinX(), t.getMinY())]), null);
        } }, { key: "createLineString", value: function() {
          if (arguments.length === 0) return this.createLineString(this.getCoordinateSequenceFactory().create([]));
          if (arguments.length === 1) {
            if (arguments[0] instanceof Array) {
              var t = arguments[0];
              return this.createLineString(t !== null ? this.getCoordinateSequenceFactory().create(t) : null);
            }
            if (kt(arguments[0], At)) return new Ki(arguments[0], this);
          }
        } }, { key: "createMultiLineString", value: function() {
          return arguments.length === 0 ? new Ss(null, this) : arguments.length === 1 ? new Ss(arguments[0], this) : void 0;
        } }, { key: "buildGeometry", value: function(t) {
          for (var e = null, s = !1, h = !1, d = t.iterator(); d.hasNext(); ) {
            var y = d.next(), x = y.getTypeCode();
            e === null && (e = x), x !== e && (s = !0), y instanceof Ce && (h = !0);
          }
          if (e === null) return this.createGeometryCollection();
          if (s || h) return this.createGeometryCollection(u.toGeometryArray(t));
          var I = t.iterator().next();
          if (t.size() > 1) {
            if (I instanceof br) return this.createMultiPolygon(u.toPolygonArray(t));
            if (I instanceof Ki) return this.createMultiLineString(u.toLineStringArray(t));
            if (I instanceof vs) return this.createMultiPoint(u.toPointArray(t));
            It.shouldNeverReachHere("Unhandled geometry type: " + I.getGeometryType());
          }
          return I;
        } }, { key: "createMultiPointFromCoords", value: function(t) {
          return this.createMultiPoint(t !== null ? this.getCoordinateSequenceFactory().create(t) : null);
        } }, { key: "createPoint", value: function() {
          if (arguments.length === 0) return this.createPoint(this.getCoordinateSequenceFactory().create([]));
          if (arguments.length === 1) {
            if (arguments[0] instanceof z) {
              var t = arguments[0];
              return this.createPoint(t !== null ? this.getCoordinateSequenceFactory().create([t]) : null);
            }
            if (kt(arguments[0], At)) return new vs(arguments[0], this);
          }
        } }, { key: "getCoordinateSequenceFactory", value: function() {
          return this._coordinateSequenceFactory;
        } }, { key: "createPolygon", value: function() {
          if (arguments.length === 0) return this.createPolygon(null, null);
          if (arguments.length === 1) {
            if (kt(arguments[0], At)) {
              var t = arguments[0];
              return this.createPolygon(this.createLinearRing(t));
            }
            if (arguments[0] instanceof Array) {
              var e = arguments[0];
              return this.createPolygon(this.createLinearRing(e));
            }
            if (arguments[0] instanceof Si) {
              var s = arguments[0];
              return this.createPolygon(s, null);
            }
          } else if (arguments.length === 2)
            return new br(arguments[0], arguments[1], this);
        } }, { key: "getSRID", value: function() {
          return this._SRID;
        } }, { key: "createGeometryCollection", value: function() {
          return arguments.length === 0 ? new Ce(null, this) : arguments.length === 1 ? new Ce(arguments[0], this) : void 0;
        } }, { key: "getPrecisionModel", value: function() {
          return this._precisionModel;
        } }, { key: "createLinearRing", value: function() {
          if (arguments.length === 0) return this.createLinearRing(this.getCoordinateSequenceFactory().create([]));
          if (arguments.length === 1) {
            if (arguments[0] instanceof Array) {
              var t = arguments[0];
              return this.createLinearRing(t !== null ? this.getCoordinateSequenceFactory().create(t) : null);
            }
            if (kt(arguments[0], At)) return new Si(arguments[0], this);
          }
        } }, { key: "createMultiPolygon", value: function() {
          return arguments.length === 0 ? new ks(null, this) : arguments.length === 1 ? new ks(arguments[0], this) : void 0;
        } }, { key: "createMultiPoint", value: function() {
          if (arguments.length === 0) return new xs(null, this);
          if (arguments.length === 1) {
            if (arguments[0] instanceof Array) return new xs(arguments[0], this);
            if (kt(arguments[0], At)) {
              var t = arguments[0];
              if (t === null) return this.createMultiPoint(new Array(0).fill(null));
              for (var e = new Array(t.size()).fill(null), s = 0; s < t.size(); s++) {
                var h = this.getCoordinateSequenceFactory().create(1, t.getDimension(), t.getMeasures());
                $n.copy(t, s, h, 0, 1), e[s] = this.createPoint(h);
              }
              return this.createMultiPoint(e);
            }
          }
        } }, { key: "interfaces_", get: function() {
          return [$];
        } }], [{ key: "constructor_", value: function() {
          if (this._precisionModel = null, this._coordinateSequenceFactory = null, this._SRID = null, arguments.length === 0) u.constructor_.call(this, new je(), 0);
          else if (arguments.length === 1) {
            if (kt(arguments[0], ps)) {
              var t = arguments[0];
              u.constructor_.call(this, new je(), 0, t);
            } else if (arguments[0] instanceof je) {
              var e = arguments[0];
              u.constructor_.call(this, e, 0, u.getDefaultCoordinateSequenceFactory());
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            u.constructor_.call(this, s, h, u.getDefaultCoordinateSequenceFactory());
          } else if (arguments.length === 3) {
            var d = arguments[0], y = arguments[1], x = arguments[2];
            this._precisionModel = d, this._coordinateSequenceFactory = x, this._SRID = y;
          }
        } }, { key: "toMultiPolygonArray", value: function(t) {
          var e = new Array(t.size()).fill(null);
          return t.toArray(e);
        } }, { key: "toGeometryArray", value: function(t) {
          if (t === null) return null;
          var e = new Array(t.size()).fill(null);
          return t.toArray(e);
        } }, { key: "getDefaultCoordinateSequenceFactory", value: function() {
          return Ms.instance();
        } }, { key: "toMultiLineStringArray", value: function(t) {
          var e = new Array(t.size()).fill(null);
          return t.toArray(e);
        } }, { key: "toLineStringArray", value: function(t) {
          var e = new Array(t.size()).fill(null);
          return t.toArray(e);
        } }, { key: "toMultiPointArray", value: function(t) {
          var e = new Array(t.size()).fill(null);
          return t.toArray(e);
        } }, { key: "toLinearRingArray", value: function(t) {
          var e = new Array(t.size()).fill(null);
          return t.toArray(e);
        } }, { key: "toPointArray", value: function(t) {
          var e = new Array(t.size()).fill(null);
          return t.toArray(e);
        } }, { key: "toPolygonArray", value: function(t) {
          var e = new Array(t.size()).fill(null);
          return t.toArray(e);
        } }, { key: "createPointFromInternalCoord", value: function(t, e) {
          return e.getPrecisionModel().makePrecise(t), e.getFactory().createPoint(t);
        } }]);
      }(), Is = "XY", Wa = "XYZ", Ha = "XYM", Ka = "XYZM", Tr = { POINT: "Point", LINE_STRING: "LineString", LINEAR_RING: "LinearRing", POLYGON: "Polygon", MULTI_POINT: "MultiPoint", MULTI_LINE_STRING: "MultiLineString", MULTI_POLYGON: "MultiPolygon", GEOMETRY_COLLECTION: "GeometryCollection", CIRCLE: "Circle" }, Za = "EMPTY", Ji = 1, Ue = 2, Cn = 3, Qa = 4, ri = 5, Ja = 6;
      for (var Ns in Tr) Tr[Ns].toUpperCase();
      var Do = function() {
        return g(function u(t) {
          c(this, u), this.wkt = t, this.index_ = -1;
        }, [{ key: "isAlpha_", value: function(u) {
          return u >= "a" && u <= "z" || u >= "A" && u <= "Z";
        } }, { key: "isNumeric_", value: function(u, t) {
          return u >= "0" && u <= "9" || u == "." && !(t !== void 0 && t);
        } }, { key: "isWhiteSpace_", value: function(u) {
          return u == " " || u == "	" || u == "\r" || u == `
`;
        } }, { key: "nextChar_", value: function() {
          return this.wkt.charAt(++this.index_);
        } }, { key: "nextToken", value: function() {
          var u, t = this.nextChar_(), e = this.index_, s = t;
          if (t == "(") u = Ue;
          else if (t == ",") u = ri;
          else if (t == ")") u = Cn;
          else if (this.isNumeric_(t) || t == "-") u = Qa, s = this.readNumber_();
          else if (this.isAlpha_(t)) u = Ji, s = this.readText_();
          else {
            if (this.isWhiteSpace_(t)) return this.nextToken();
            if (t !== "") throw new Error("Unexpected character: " + t);
            u = Ja;
          }
          return { position: e, value: s, type: u };
        } }, { key: "readNumber_", value: function() {
          var u, t = this.index_, e = !1, s = !1;
          do
            u == "." ? e = !0 : u != "e" && u != "E" || (s = !0), u = this.nextChar_();
          while (this.isNumeric_(u, e) || !s && (u == "e" || u == "E") || s && (u == "-" || u == "+"));
          return parseFloat(this.wkt.substring(t, this.index_--));
        } }, { key: "readText_", value: function() {
          var u, t = this.index_;
          do
            u = this.nextChar_();
          while (this.isAlpha_(u));
          return this.wkt.substring(t, this.index_--).toUpperCase();
        } }]);
      }(), $a = function() {
        return g(function u(t, e) {
          c(this, u), this.lexer_ = t, this.token_, this.layout_ = Is, this.factory = e;
        }, [{ key: "consume_", value: function() {
          this.token_ = this.lexer_.nextToken();
        } }, { key: "isTokenType", value: function(u) {
          return this.token_.type == u;
        } }, { key: "match", value: function(u) {
          var t = this.isTokenType(u);
          return t && this.consume_(), t;
        } }, { key: "parse", value: function() {
          return this.consume_(), this.parseGeometry_();
        } }, { key: "parseGeometryLayout_", value: function() {
          var u = Is, t = this.token_;
          if (this.isTokenType(Ji)) {
            var e = t.value;
            e === "Z" ? u = Wa : e === "M" ? u = Ha : e === "ZM" && (u = Ka), u !== Is && this.consume_();
          }
          return u;
        } }, { key: "parseGeometryCollectionText_", value: function() {
          if (this.match(Ue)) {
            var u = [];
            do
              u.push(this.parseGeometry_());
            while (this.match(ri));
            if (this.match(Cn)) return u;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parsePointText_", value: function() {
          if (this.match(Ue)) {
            var u = this.parsePoint_();
            if (this.match(Cn)) return u;
          } else if (this.isEmptyGeometry_()) return null;
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parseLineStringText_", value: function() {
          if (this.match(Ue)) {
            var u = this.parsePointList_();
            if (this.match(Cn)) return u;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parsePolygonText_", value: function() {
          if (this.match(Ue)) {
            var u = this.parseLineStringTextList_();
            if (this.match(Cn)) return u;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parseMultiPointText_", value: function() {
          var u;
          if (this.match(Ue)) {
            if (u = this.token_.type == Ue ? this.parsePointTextList_() : this.parsePointList_(), this.match(Cn)) return u;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parseMultiLineStringText_", value: function() {
          if (this.match(Ue)) {
            var u = this.parseLineStringTextList_();
            if (this.match(Cn)) return u;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parseMultiPolygonText_", value: function() {
          if (this.match(Ue)) {
            var u = this.parsePolygonTextList_();
            if (this.match(Cn)) return u;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parsePoint_", value: function() {
          for (var u = [], t = this.layout_.length, e = 0; e < t; ++e) {
            var s = this.token_;
            if (!this.match(Qa)) break;
            u.push(s.value);
          }
          if (u.length == t) return u;
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parsePointList_", value: function() {
          for (var u = [this.parsePoint_()]; this.match(ri); ) u.push(this.parsePoint_());
          return u;
        } }, { key: "parsePointTextList_", value: function() {
          for (var u = [this.parsePointText_()]; this.match(ri); ) u.push(this.parsePointText_());
          return u;
        } }, { key: "parseLineStringTextList_", value: function() {
          for (var u = [this.parseLineStringText_()]; this.match(ri); ) u.push(this.parseLineStringText_());
          return u;
        } }, { key: "parsePolygonTextList_", value: function() {
          for (var u = [this.parsePolygonText_()]; this.match(ri); ) u.push(this.parsePolygonText_());
          return u;
        } }, { key: "isEmptyGeometry_", value: function() {
          var u = this.isTokenType(Ji) && this.token_.value == Za;
          return u && this.consume_(), u;
        } }, { key: "formatErrorMessage_", value: function() {
          return "Unexpected `" + this.token_.value + "` at position " + this.token_.position + " in `" + this.lexer_.wkt + "`";
        } }, { key: "parseGeometry_", value: function() {
          var u = this.factory, t = function(gt) {
            return _(z, L(gt));
          }, e = function(gt) {
            var Pt = gt.map(function(lt) {
              return u.createLinearRing(lt.map(t));
            });
            return Pt.length > 1 ? u.createPolygon(Pt[0], Pt.slice(1)) : u.createPolygon(Pt[0]);
          }, s = this.token_;
          if (this.match(Ji)) {
            var h = s.value;
            if (this.layout_ = this.parseGeometryLayout_(), h == "GEOMETRYCOLLECTION") {
              var d = this.parseGeometryCollectionText_();
              return u.createGeometryCollection(d);
            }
            switch (h) {
              case "POINT":
                var y = this.parsePointText_();
                return y ? u.createPoint(_(z, L(y))) : u.createPoint();
              case "LINESTRING":
                var x = this.parseLineStringText_().map(t);
                return u.createLineString(x);
              case "LINEARRING":
                var I = this.parseLineStringText_().map(t);
                return u.createLinearRing(I);
              case "POLYGON":
                var T = this.parsePolygonText_();
                return T && T.length !== 0 ? e(T) : u.createPolygon();
              case "MULTIPOINT":
                var G = this.parseMultiPointText_();
                if (!G || G.length === 0) return u.createMultiPoint();
                var q = G.map(t).map(function(gt) {
                  return u.createPoint(gt);
                });
                return u.createMultiPoint(q);
              case "MULTILINESTRING":
                var K = this.parseMultiLineStringText_().map(function(gt) {
                  return u.createLineString(gt.map(t));
                });
                return u.createMultiLineString(K);
              case "MULTIPOLYGON":
                var rt = this.parseMultiPolygonText_();
                if (!rt || rt.length === 0) return u.createMultiPolygon();
                var ot = rt.map(e);
                return u.createMultiPolygon(ot);
              default:
                throw new Error("Invalid geometry type: " + h);
            }
          }
          throw new Error(this.formatErrorMessage_());
        } }]);
      }();
      function Ar(u) {
        if (u.isEmpty()) return "";
        var t = u.getCoordinate(), e = [t.x, t.y];
        return t.z === void 0 || Number.isNaN(t.z) || e.push(t.z), t.m === void 0 || Number.isNaN(t.m) || e.push(t.m), e.join(" ");
      }
      function si(u) {
        for (var t = u.getCoordinates().map(function(d) {
          var y = [d.x, d.y];
          return d.z === void 0 || Number.isNaN(d.z) || y.push(d.z), d.m === void 0 || Number.isNaN(d.m) || y.push(d.m), y;
        }), e = [], s = 0, h = t.length; s < h; ++s) e.push(t[s].join(" "));
        return e.join(", ");
      }
      function ai(u) {
        var t = [];
        t.push("(" + si(u.getExteriorRing()) + ")");
        for (var e = 0, s = u.getNumInteriorRing(); e < s; ++e) t.push("(" + si(u.getInteriorRingN(e)) + ")");
        return t.join(", ");
      }
      var tu = { Point: Ar, LineString: si, LinearRing: si, Polygon: ai, MultiPoint: function(u) {
        for (var t = [], e = 0, s = u.getNumGeometries(); e < s; ++e) t.push("(" + Ar(u.getGeometryN(e)) + ")");
        return t.join(", ");
      }, MultiLineString: function(u) {
        for (var t = [], e = 0, s = u.getNumGeometries(); e < s; ++e) t.push("(" + si(u.getGeometryN(e)) + ")");
        return t.join(", ");
      }, MultiPolygon: function(u) {
        for (var t = [], e = 0, s = u.getNumGeometries(); e < s; ++e) t.push("(" + ai(u.getGeometryN(e)) + ")");
        return t.join(", ");
      }, GeometryCollection: function(u) {
        for (var t = [], e = 0, s = u.getNumGeometries(); e < s; ++e) t.push(bs(u.getGeometryN(e)));
        return t.join(", ");
      } };
      function bs(u) {
        var t = u.getGeometryType(), e = tu[t];
        t = t.toUpperCase();
        var s = function(h) {
          var d = "";
          if (h.isEmpty()) return d;
          var y = h.getCoordinate();
          return y.z === void 0 || Number.isNaN(y.z) || (d += "Z"), y.m === void 0 || Number.isNaN(y.m) || (d += "M"), d;
        }(u);
        return s.length > 0 && (t += " " + s), u.isEmpty() ? t + " " + Za : t + " (" + e(u) + ")";
      }
      var Fo = function() {
        return g(function u(t) {
          c(this, u), this.geometryFactory = t || new Ni(), this.precisionModel = this.geometryFactory.getPrecisionModel();
        }, [{ key: "read", value: function(u) {
          var t = new Do(u);
          return new $a(t, this.geometryFactory).parse();
        } }, { key: "write", value: function(u) {
          return bs(u);
        } }]);
      }(), Rr = function() {
        return g(function u(t) {
          c(this, u), this.parser = new Fo(t);
        }, [{ key: "write", value: function(u) {
          return this.parser.write(u);
        } }], [{ key: "toLineString", value: function(u, t) {
          if (arguments.length !== 2) throw new Error("Not implemented");
          return "LINESTRING ( " + u.x + " " + u.y + ", " + t.x + " " + t.y + " )";
        } }]);
      }(), Ht = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getIndexAlongSegment", value: function(t, e) {
          return this.computeIntLineIndex(), this._intLineIndex[t][e];
        } }, { key: "getTopologySummary", value: function() {
          var t = new ii();
          return this.isEndPoint() && t.append(" endpoint"), this._isProper && t.append(" proper"), this.isCollinear() && t.append(" collinear"), t.toString();
        } }, { key: "computeIntersection", value: function(t, e, s, h) {
          this._inputLines[0][0] = t, this._inputLines[0][1] = e, this._inputLines[1][0] = s, this._inputLines[1][1] = h, this._result = this.computeIntersect(t, e, s, h);
        } }, { key: "getIntersectionNum", value: function() {
          return this._result;
        } }, { key: "computeIntLineIndex", value: function() {
          if (arguments.length === 0) this._intLineIndex === null && (this._intLineIndex = Array(2).fill().map(function() {
            return Array(2);
          }), this.computeIntLineIndex(0), this.computeIntLineIndex(1));
          else if (arguments.length === 1) {
            var t = arguments[0];
            this.getEdgeDistance(t, 0) > this.getEdgeDistance(t, 1) ? (this._intLineIndex[t][0] = 0, this._intLineIndex[t][1] = 1) : (this._intLineIndex[t][0] = 1, this._intLineIndex[t][1] = 0);
          }
        } }, { key: "isProper", value: function() {
          return this.hasIntersection() && this._isProper;
        } }, { key: "setPrecisionModel", value: function(t) {
          this._precisionModel = t;
        } }, { key: "isInteriorIntersection", value: function() {
          if (arguments.length === 0) return !!this.isInteriorIntersection(0) || !!this.isInteriorIntersection(1);
          if (arguments.length === 1) {
            for (var t = arguments[0], e = 0; e < this._result; e++) if (!this._intPt[e].equals2D(this._inputLines[t][0]) && !this._intPt[e].equals2D(this._inputLines[t][1])) return !0;
            return !1;
          }
        } }, { key: "getIntersection", value: function(t) {
          return this._intPt[t];
        } }, { key: "isEndPoint", value: function() {
          return this.hasIntersection() && !this._isProper;
        } }, { key: "hasIntersection", value: function() {
          return this._result !== u.NO_INTERSECTION;
        } }, { key: "getEdgeDistance", value: function(t, e) {
          return u.computeEdgeDistance(this._intPt[e], this._inputLines[t][0], this._inputLines[t][1]);
        } }, { key: "isCollinear", value: function() {
          return this._result === u.COLLINEAR_INTERSECTION;
        } }, { key: "toString", value: function() {
          return Rr.toLineString(this._inputLines[0][0], this._inputLines[0][1]) + " - " + Rr.toLineString(this._inputLines[1][0], this._inputLines[1][1]) + this.getTopologySummary();
        } }, { key: "getEndpoint", value: function(t, e) {
          return this._inputLines[t][e];
        } }, { key: "isIntersection", value: function(t) {
          for (var e = 0; e < this._result; e++) if (this._intPt[e].equals2D(t)) return !0;
          return !1;
        } }, { key: "getIntersectionAlongSegment", value: function(t, e) {
          return this.computeIntLineIndex(), this._intPt[this._intLineIndex[t][e]];
        } }], [{ key: "constructor_", value: function() {
          this._result = null, this._inputLines = Array(2).fill().map(function() {
            return Array(2);
          }), this._intPt = new Array(2).fill(null), this._intLineIndex = null, this._isProper = null, this._pa = null, this._pb = null, this._precisionModel = null, this._intPt[0] = new z(), this._intPt[1] = new z(), this._pa = this._intPt[0], this._pb = this._intPt[1], this._result = 0;
        } }, { key: "computeEdgeDistance", value: function(t, e, s) {
          var h = Math.abs(s.x - e.x), d = Math.abs(s.y - e.y), y = -1;
          if (t.equals(e)) y = 0;
          else if (t.equals(s)) y = h > d ? h : d;
          else {
            var x = Math.abs(t.x - e.x), I = Math.abs(t.y - e.y);
            (y = h > d ? x : I) !== 0 || t.equals(e) || (y = Math.max(x, I));
          }
          return It.isTrue(!(y === 0 && !t.equals(e)), "Bad distance calculation"), y;
        } }, { key: "nonRobustComputeEdgeDistance", value: function(t, e, s) {
          var h = t.x - e.x, d = t.y - e.y, y = Math.sqrt(h * h + d * d);
          return It.isTrue(!(y === 0 && !t.equals(e)), "Invalid distance calculation"), y;
        } }]);
      }();
      Ht.DONT_INTERSECT = 0, Ht.DO_INTERSECT = 1, Ht.COLLINEAR = 2, Ht.NO_INTERSECTION = 0, Ht.POINT_INTERSECTION = 1, Ht.COLLINEAR_INTERSECTION = 2;
      var qn = function(u) {
        function t() {
          return c(this, t), l(this, t);
        }
        return E(t, u), g(t, [{ key: "isInSegmentEnvelopes", value: function(e) {
          var s = new Wt(this._inputLines[0][0], this._inputLines[0][1]), h = new Wt(this._inputLines[1][0], this._inputLines[1][1]);
          return s.contains(e) && h.contains(e);
        } }, { key: "computeIntersection", value: function() {
          if (arguments.length !== 3) return C(t, "computeIntersection", this, 1).apply(this, arguments);
          var e = arguments[0], s = arguments[1], h = arguments[2];
          if (this._isProper = !1, Wt.intersects(s, h, e) && vt.index(s, h, e) === 0 && vt.index(h, s, e) === 0) return this._isProper = !0, (e.equals(s) || e.equals(h)) && (this._isProper = !1), this._result = Ht.POINT_INTERSECTION, null;
          this._result = Ht.NO_INTERSECTION;
        } }, { key: "intersection", value: function(e, s, h, d) {
          var y = this.intersectionSafe(e, s, h, d);
          return this.isInSegmentEnvelopes(y) || (y = new z(t.nearestEndpoint(e, s, h, d))), this._precisionModel !== null && this._precisionModel.makePrecise(y), y;
        } }, { key: "checkDD", value: function(e, s, h, d, y) {
          var x = Wi.intersection(e, s, h, d), I = this.isInSegmentEnvelopes(x);
          ze.out.println("DD in env = " + I + "  --------------------- " + x), y.distance(x) > 1e-4 && ze.out.println("Distance = " + y.distance(x));
        } }, { key: "intersectionSafe", value: function(e, s, h, d) {
          var y = ys.intersection(e, s, h, d);
          return y === null && (y = t.nearestEndpoint(e, s, h, d)), y;
        } }, { key: "computeCollinearIntersection", value: function(e, s, h, d) {
          var y = Wt.intersects(e, s, h), x = Wt.intersects(e, s, d), I = Wt.intersects(h, d, e), T = Wt.intersects(h, d, s);
          return y && x ? (this._intPt[0] = h, this._intPt[1] = d, Ht.COLLINEAR_INTERSECTION) : I && T ? (this._intPt[0] = e, this._intPt[1] = s, Ht.COLLINEAR_INTERSECTION) : y && I ? (this._intPt[0] = h, this._intPt[1] = e, !h.equals(e) || x || T ? Ht.COLLINEAR_INTERSECTION : Ht.POINT_INTERSECTION) : y && T ? (this._intPt[0] = h, this._intPt[1] = s, !h.equals(s) || x || I ? Ht.COLLINEAR_INTERSECTION : Ht.POINT_INTERSECTION) : x && I ? (this._intPt[0] = d, this._intPt[1] = e, !d.equals(e) || y || T ? Ht.COLLINEAR_INTERSECTION : Ht.POINT_INTERSECTION) : x && T ? (this._intPt[0] = d, this._intPt[1] = s, !d.equals(s) || y || I ? Ht.COLLINEAR_INTERSECTION : Ht.POINT_INTERSECTION) : Ht.NO_INTERSECTION;
        } }, { key: "computeIntersect", value: function(e, s, h, d) {
          if (this._isProper = !1, !Wt.intersects(e, s, h, d)) return Ht.NO_INTERSECTION;
          var y = vt.index(e, s, h), x = vt.index(e, s, d);
          if (y > 0 && x > 0 || y < 0 && x < 0) return Ht.NO_INTERSECTION;
          var I = vt.index(h, d, e), T = vt.index(h, d, s);
          return I > 0 && T > 0 || I < 0 && T < 0 ? Ht.NO_INTERSECTION : y === 0 && x === 0 && I === 0 && T === 0 ? this.computeCollinearIntersection(e, s, h, d) : (y === 0 || x === 0 || I === 0 || T === 0 ? (this._isProper = !1, e.equals2D(h) || e.equals2D(d) ? this._intPt[0] = e : s.equals2D(h) || s.equals2D(d) ? this._intPt[0] = s : y === 0 ? this._intPt[0] = new z(h) : x === 0 ? this._intPt[0] = new z(d) : I === 0 ? this._intPt[0] = new z(e) : T === 0 && (this._intPt[0] = new z(s))) : (this._isProper = !0, this._intPt[0] = this.intersection(e, s, h, d)), Ht.POINT_INTERSECTION);
        } }], [{ key: "nearestEndpoint", value: function(e, s, h, d) {
          var y = e, x = un.pointToSegment(e, h, d), I = un.pointToSegment(s, h, d);
          return I < x && (x = I, y = s), (I = un.pointToSegment(h, e, s)) < x && (x = I, y = h), (I = un.pointToSegment(d, e, s)) < x && (x = I, y = d), y;
        } }]);
      }(Ht), eu = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "countSegment", value: function(t, e) {
          if (t.x < this._p.x && e.x < this._p.x) return null;
          if (this._p.x === e.x && this._p.y === e.y) return this._isPointOnSegment = !0, null;
          if (t.y === this._p.y && e.y === this._p.y) {
            var s = t.x, h = e.x;
            return s > h && (s = e.x, h = t.x), this._p.x >= s && this._p.x <= h && (this._isPointOnSegment = !0), null;
          }
          if (t.y > this._p.y && e.y <= this._p.y || e.y > this._p.y && t.y <= this._p.y) {
            var d = vt.index(t, e, this._p);
            if (d === vt.COLLINEAR) return this._isPointOnSegment = !0, null;
            e.y < t.y && (d = -d), d === vt.LEFT && this._crossingCount++;
          }
        } }, { key: "isPointInPolygon", value: function() {
          return this.getLocation() !== R.EXTERIOR;
        } }, { key: "getLocation", value: function() {
          return this._isPointOnSegment ? R.BOUNDARY : this._crossingCount % 2 == 1 ? R.INTERIOR : R.EXTERIOR;
        } }, { key: "isOnSegment", value: function() {
          return this._isPointOnSegment;
        } }], [{ key: "constructor_", value: function() {
          this._p = null, this._crossingCount = 0, this._isPointOnSegment = !1;
          var t = arguments[0];
          this._p = t;
        } }, { key: "locatePointInRing", value: function() {
          if (arguments[0] instanceof z && kt(arguments[1], At)) {
            for (var t = arguments[1], e = new u(arguments[0]), s = new z(), h = new z(), d = 1; d < t.size(); d++) if (t.getCoordinate(d, s), t.getCoordinate(d - 1, h), e.countSegment(s, h), e.isOnSegment()) return e.getLocation();
            return e.getLocation();
          }
          if (arguments[0] instanceof z && arguments[1] instanceof Array) {
            for (var y = arguments[1], x = new u(arguments[0]), I = 1; I < y.length; I++) {
              var T = y[I], G = y[I - 1];
              if (x.countSegment(T, G), x.isOnSegment()) return x.getLocation();
            }
            return x.getLocation();
          }
        } }]);
      }(), Cs = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "isOnLine", value: function() {
          if (arguments[0] instanceof z && kt(arguments[1], At)) {
            for (var t = arguments[0], e = arguments[1], s = new qn(), h = new z(), d = new z(), y = e.size(), x = 1; x < y; x++) if (e.getCoordinate(x - 1, h), e.getCoordinate(x, d), s.computeIntersection(t, h, d), s.hasIntersection()) return !0;
            return !1;
          }
          if (arguments[0] instanceof z && arguments[1] instanceof Array) {
            for (var I = arguments[0], T = arguments[1], G = new qn(), q = 1; q < T.length; q++) {
              var K = T[q - 1], rt = T[q];
              if (G.computeIntersection(I, K, rt), G.hasIntersection()) return !0;
            }
            return !1;
          }
        } }, { key: "locateInRing", value: function(t, e) {
          return eu.locatePointInRing(t, e);
        } }, { key: "isInRing", value: function(t, e) {
          return u.locateInRing(t, e) !== R.EXTERIOR;
        } }]);
      }(), Ye = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "setAllLocations", value: function(t) {
          for (var e = 0; e < this.location.length; e++) this.location[e] = t;
        } }, { key: "isNull", value: function() {
          for (var t = 0; t < this.location.length; t++) if (this.location[t] !== R.NONE) return !1;
          return !0;
        } }, { key: "setAllLocationsIfNull", value: function(t) {
          for (var e = 0; e < this.location.length; e++) this.location[e] === R.NONE && (this.location[e] = t);
        } }, { key: "isLine", value: function() {
          return this.location.length === 1;
        } }, { key: "merge", value: function(t) {
          if (t.location.length > this.location.length) {
            var e = new Array(3).fill(null);
            e[tt.ON] = this.location[tt.ON], e[tt.LEFT] = R.NONE, e[tt.RIGHT] = R.NONE, this.location = e;
          }
          for (var s = 0; s < this.location.length; s++) this.location[s] === R.NONE && s < t.location.length && (this.location[s] = t.location[s]);
        } }, { key: "getLocations", value: function() {
          return this.location;
        } }, { key: "flip", value: function() {
          if (this.location.length <= 1) return null;
          var t = this.location[tt.LEFT];
          this.location[tt.LEFT] = this.location[tt.RIGHT], this.location[tt.RIGHT] = t;
        } }, { key: "toString", value: function() {
          var t = new bn();
          return this.location.length > 1 && t.append(R.toLocationSymbol(this.location[tt.LEFT])), t.append(R.toLocationSymbol(this.location[tt.ON])), this.location.length > 1 && t.append(R.toLocationSymbol(this.location[tt.RIGHT])), t.toString();
        } }, { key: "setLocations", value: function(t, e, s) {
          this.location[tt.ON] = t, this.location[tt.LEFT] = e, this.location[tt.RIGHT] = s;
        } }, { key: "get", value: function(t) {
          return t < this.location.length ? this.location[t] : R.NONE;
        } }, { key: "isArea", value: function() {
          return this.location.length > 1;
        } }, { key: "isAnyNull", value: function() {
          for (var t = 0; t < this.location.length; t++) if (this.location[t] === R.NONE) return !0;
          return !1;
        } }, { key: "setLocation", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            this.setLocation(tt.ON, t);
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            this.location[e] = s;
          }
        } }, { key: "init", value: function(t) {
          this.location = new Array(t).fill(null), this.setAllLocations(R.NONE);
        } }, { key: "isEqualOnSide", value: function(t, e) {
          return this.location[e] === t.location[e];
        } }, { key: "allPositionsEqual", value: function(t) {
          for (var e = 0; e < this.location.length; e++) if (this.location[e] !== t) return !1;
          return !0;
        } }], [{ key: "constructor_", value: function() {
          if (this.location = null, arguments.length === 1) {
            if (arguments[0] instanceof Array) {
              var t = arguments[0];
              this.init(t.length);
            } else if (Number.isInteger(arguments[0])) {
              var e = arguments[0];
              this.init(1), this.location[tt.ON] = e;
            } else if (arguments[0] instanceof u) {
              var s = arguments[0];
              if (this.init(s.location.length), s !== null) for (var h = 0; h < this.location.length; h++) this.location[h] = s.location[h];
            }
          } else if (arguments.length === 3) {
            var d = arguments[0], y = arguments[1], x = arguments[2];
            this.init(3), this.location[tt.ON] = d, this.location[tt.LEFT] = y, this.location[tt.RIGHT] = x;
          }
        } }]);
      }(), Xe = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getGeometryCount", value: function() {
          var t = 0;
          return this.elt[0].isNull() || t++, this.elt[1].isNull() || t++, t;
        } }, { key: "setAllLocations", value: function(t, e) {
          this.elt[t].setAllLocations(e);
        } }, { key: "isNull", value: function(t) {
          return this.elt[t].isNull();
        } }, { key: "setAllLocationsIfNull", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            this.setAllLocationsIfNull(0, t), this.setAllLocationsIfNull(1, t);
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            this.elt[e].setAllLocationsIfNull(s);
          }
        } }, { key: "isLine", value: function(t) {
          return this.elt[t].isLine();
        } }, { key: "merge", value: function(t) {
          for (var e = 0; e < 2; e++) this.elt[e] === null && t.elt[e] !== null ? this.elt[e] = new Ye(t.elt[e]) : this.elt[e].merge(t.elt[e]);
        } }, { key: "flip", value: function() {
          this.elt[0].flip(), this.elt[1].flip();
        } }, { key: "getLocation", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return this.elt[t].get(tt.ON);
          }
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            return this.elt[e].get(s);
          }
        } }, { key: "toString", value: function() {
          var t = new bn();
          return this.elt[0] !== null && (t.append("A:"), t.append(this.elt[0].toString())), this.elt[1] !== null && (t.append(" B:"), t.append(this.elt[1].toString())), t.toString();
        } }, { key: "isArea", value: function() {
          if (arguments.length === 0) return this.elt[0].isArea() || this.elt[1].isArea();
          if (arguments.length === 1) {
            var t = arguments[0];
            return this.elt[t].isArea();
          }
        } }, { key: "isAnyNull", value: function(t) {
          return this.elt[t].isAnyNull();
        } }, { key: "setLocation", value: function() {
          if (arguments.length === 2) {
            var t = arguments[0], e = arguments[1];
            this.elt[t].setLocation(tt.ON, e);
          } else if (arguments.length === 3) {
            var s = arguments[0], h = arguments[1], d = arguments[2];
            this.elt[s].setLocation(h, d);
          }
        } }, { key: "isEqualOnSide", value: function(t, e) {
          return this.elt[0].isEqualOnSide(t.elt[0], e) && this.elt[1].isEqualOnSide(t.elt[1], e);
        } }, { key: "allPositionsEqual", value: function(t, e) {
          return this.elt[t].allPositionsEqual(e);
        } }, { key: "toLine", value: function(t) {
          this.elt[t].isArea() && (this.elt[t] = new Ye(this.elt[t].location[0]));
        } }], [{ key: "constructor_", value: function() {
          if (this.elt = new Array(2).fill(null), arguments.length === 1) {
            if (Number.isInteger(arguments[0])) {
              var t = arguments[0];
              this.elt[0] = new Ye(t), this.elt[1] = new Ye(t);
            } else if (arguments[0] instanceof u) {
              var e = arguments[0];
              this.elt[0] = new Ye(e.elt[0]), this.elt[1] = new Ye(e.elt[1]);
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            this.elt[0] = new Ye(R.NONE), this.elt[1] = new Ye(R.NONE), this.elt[s].setLocation(h);
          } else if (arguments.length === 3) {
            var d = arguments[0], y = arguments[1], x = arguments[2];
            this.elt[0] = new Ye(d, y, x), this.elt[1] = new Ye(d, y, x);
          } else if (arguments.length === 4) {
            var I = arguments[0], T = arguments[1], G = arguments[2], q = arguments[3];
            this.elt[0] = new Ye(R.NONE, R.NONE, R.NONE), this.elt[1] = new Ye(R.NONE, R.NONE, R.NONE), this.elt[I].setLocations(T, G, q);
          }
        } }, { key: "toLineLabel", value: function(t) {
          for (var e = new u(R.NONE), s = 0; s < 2; s++) e.setLocation(s, t.getLocation(s));
          return e;
        } }]);
      }(), $i = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "computeRing", value: function() {
          if (this._ring !== null) return null;
          for (var u = new Array(this._pts.size()).fill(null), t = 0; t < this._pts.size(); t++) u[t] = this._pts.get(t);
          this._ring = this._geometryFactory.createLinearRing(u), this._isHole = vt.isCCW(this._ring.getCoordinates());
        } }, { key: "isIsolated", value: function() {
          return this._label.getGeometryCount() === 1;
        } }, { key: "computePoints", value: function(u) {
          this._startDe = u;
          var t = u, e = !0;
          do {
            if (t === null) throw new an("Found null DirectedEdge");
            if (t.getEdgeRing() === this) throw new an("Directed Edge visited twice during ring-building at " + t.getCoordinate());
            this._edges.add(t);
            var s = t.getLabel();
            It.isTrue(s.isArea()), this.mergeLabel(s), this.addPoints(t.getEdge(), t.isForward(), e), e = !1, this.setEdgeRing(t, this), t = this.getNext(t);
          } while (t !== this._startDe);
        } }, { key: "getLinearRing", value: function() {
          return this._ring;
        } }, { key: "getCoordinate", value: function(u) {
          return this._pts.get(u);
        } }, { key: "computeMaxNodeDegree", value: function() {
          this._maxNodeDegree = 0;
          var u = this._startDe;
          do {
            var t = u.getNode().getEdges().getOutgoingDegree(this);
            t > this._maxNodeDegree && (this._maxNodeDegree = t), u = this.getNext(u);
          } while (u !== this._startDe);
          this._maxNodeDegree *= 2;
        } }, { key: "addPoints", value: function(u, t, e) {
          var s = u.getCoordinates();
          if (t) {
            var h = 1;
            e && (h = 0);
            for (var d = h; d < s.length; d++) this._pts.add(s[d]);
          } else {
            var y = s.length - 2;
            e && (y = s.length - 1);
            for (var x = y; x >= 0; x--) this._pts.add(s[x]);
          }
        } }, { key: "isHole", value: function() {
          return this._isHole;
        } }, { key: "setInResult", value: function() {
          var u = this._startDe;
          do
            u.getEdge().setInResult(!0), u = u.getNext();
          while (u !== this._startDe);
        } }, { key: "containsPoint", value: function(u) {
          var t = this.getLinearRing();
          if (!t.getEnvelopeInternal().contains(u) || !Cs.isInRing(u, t.getCoordinates())) return !1;
          for (var e = this._holes.iterator(); e.hasNext(); )
            if (e.next().containsPoint(u)) return !1;
          return !0;
        } }, { key: "addHole", value: function(u) {
          this._holes.add(u);
        } }, { key: "isShell", value: function() {
          return this._shell === null;
        } }, { key: "getLabel", value: function() {
          return this._label;
        } }, { key: "getEdges", value: function() {
          return this._edges;
        } }, { key: "getMaxNodeDegree", value: function() {
          return this._maxNodeDegree < 0 && this.computeMaxNodeDegree(), this._maxNodeDegree;
        } }, { key: "getShell", value: function() {
          return this._shell;
        } }, { key: "mergeLabel", value: function() {
          if (arguments.length === 1) {
            var u = arguments[0];
            this.mergeLabel(u, 0), this.mergeLabel(u, 1);
          } else if (arguments.length === 2) {
            var t = arguments[1], e = arguments[0].getLocation(t, tt.RIGHT);
            if (e === R.NONE) return null;
            if (this._label.getLocation(t) === R.NONE) return this._label.setLocation(t, e), null;
          }
        } }, { key: "setShell", value: function(u) {
          this._shell = u, u !== null && u.addHole(this);
        } }, { key: "toPolygon", value: function(u) {
          for (var t = new Array(this._holes.size()).fill(null), e = 0; e < this._holes.size(); e++) t[e] = this._holes.get(e).getLinearRing();
          return u.createPolygon(this.getLinearRing(), t);
        } }], [{ key: "constructor_", value: function() {
          if (this._startDe = null, this._maxNodeDegree = -1, this._edges = new yt(), this._pts = new yt(), this._label = new Xe(R.NONE), this._ring = null, this._isHole = null, this._shell = null, this._holes = new yt(), this._geometryFactory = null, arguments.length !== 0 && arguments.length === 2) {
            var u = arguments[0], t = arguments[1];
            this._geometryFactory = t, this.computePoints(u), this.computeRing();
          }
        } }]);
      }(), qo = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "setEdgeRing", value: function(e, s) {
          e.setMinEdgeRing(s);
        } }, { key: "getNext", value: function(e) {
          return e.getNextMin();
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0], s = arguments[1];
          $i.constructor_.call(this, e, s);
        } }]);
      }($i), Bo = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "buildMinimalRings", value: function() {
          var e = new yt(), s = this._startDe;
          do {
            if (s.getMinEdgeRing() === null) {
              var h = new qo(s, this._geometryFactory);
              e.add(h);
            }
            s = s.getNext();
          } while (s !== this._startDe);
          return e;
        } }, { key: "setEdgeRing", value: function(e, s) {
          e.setEdgeRing(s);
        } }, { key: "linkDirectedEdgesForMinimalEdgeRings", value: function() {
          var e = this._startDe;
          do
            e.getNode().getEdges().linkMinimalDirectedEdges(this), e = e.getNext();
          while (e !== this._startDe);
        } }, { key: "getNext", value: function(e) {
          return e.getNext();
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0], s = arguments[1];
          $i.constructor_.call(this, e, s);
        } }]);
      }($i), nu = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "setVisited", value: function(u) {
          this._isVisited = u;
        } }, { key: "setInResult", value: function(u) {
          this._isInResult = u;
        } }, { key: "isCovered", value: function() {
          return this._isCovered;
        } }, { key: "isCoveredSet", value: function() {
          return this._isCoveredSet;
        } }, { key: "setLabel", value: function(u) {
          this._label = u;
        } }, { key: "getLabel", value: function() {
          return this._label;
        } }, { key: "setCovered", value: function(u) {
          this._isCovered = u, this._isCoveredSet = !0;
        } }, { key: "updateIM", value: function(u) {
          It.isTrue(this._label.getGeometryCount() >= 2, "found partial label"), this.computeIM(u);
        } }, { key: "isInResult", value: function() {
          return this._isInResult;
        } }, { key: "isVisited", value: function() {
          return this._isVisited;
        } }], [{ key: "constructor_", value: function() {
          if (this._label = null, this._isInResult = !1, this._isCovered = !1, this._isCoveredSet = !1, this._isVisited = !1, arguments.length !== 0 && arguments.length === 1) {
            var u = arguments[0];
            this._label = u;
          }
        } }]);
      }(), Or = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "isIncidentEdgeInResult", value: function() {
          for (var e = this.getEdges().getEdges().iterator(); e.hasNext(); )
            if (e.next().getEdge().isInResult()) return !0;
          return !1;
        } }, { key: "isIsolated", value: function() {
          return this._label.getGeometryCount() === 1;
        } }, { key: "getCoordinate", value: function() {
          return this._coord;
        } }, { key: "print", value: function(e) {
          e.println("node " + this._coord + " lbl: " + this._label);
        } }, { key: "computeIM", value: function(e) {
        } }, { key: "computeMergedLocation", value: function(e, s) {
          var h = R.NONE;
          if (h = this._label.getLocation(s), !e.isNull(s)) {
            var d = e.getLocation(s);
            h !== R.BOUNDARY && (h = d);
          }
          return h;
        } }, { key: "setLabel", value: function() {
          if (arguments.length !== 2 || !Number.isInteger(arguments[1]) || !Number.isInteger(arguments[0])) return C(t, "setLabel", this, 1).apply(this, arguments);
          var e = arguments[0], s = arguments[1];
          this._label === null ? this._label = new Xe(e, s) : this._label.setLocation(e, s);
        } }, { key: "getEdges", value: function() {
          return this._edges;
        } }, { key: "mergeLabel", value: function() {
          if (arguments[0] instanceof t) {
            var e = arguments[0];
            this.mergeLabel(e._label);
          } else if (arguments[0] instanceof Xe) for (var s = arguments[0], h = 0; h < 2; h++) {
            var d = this.computeMergedLocation(s, h);
            this._label.getLocation(h) === R.NONE && this._label.setLocation(h, d);
          }
        } }, { key: "add", value: function(e) {
          this._edges.insert(e), e.setNode(this);
        } }, { key: "setLabelBoundary", value: function(e) {
          if (this._label === null) return null;
          var s = R.NONE;
          this._label !== null && (s = this._label.getLocation(e));
          var h = null;
          switch (s) {
            case R.BOUNDARY:
              h = R.INTERIOR;
              break;
            case R.INTERIOR:
            default:
              h = R.BOUNDARY;
          }
          this._label.setLocation(e, h);
        } }], [{ key: "constructor_", value: function() {
          this._coord = null, this._edges = null;
          var e = arguments[0], s = arguments[1];
          this._coord = e, this._edges = s, this._label = new Xe(0, R.NONE);
        } }]);
      }(nu), Ps = function(u) {
        function t() {
          return c(this, t), l(this, t, arguments);
        }
        return E(t, u), g(t);
      }(ws);
      function iu(u) {
        return u == null ? 0 : u.color;
      }
      function Ft(u) {
        return u == null ? null : u.parent;
      }
      function mn(u, t) {
        u !== null && (u.color = t);
      }
      function Ts(u) {
        return u == null ? null : u.left;
      }
      function ru(u) {
        return u == null ? null : u.right;
      }
      var Bt = function(u) {
        function t() {
          var e;
          return c(this, t), (e = l(this, t)).root_ = null, e.size_ = 0, e;
        }
        return E(t, u), g(t, [{ key: "get", value: function(e) {
          for (var s = this.root_; s !== null; ) {
            var h = e.compareTo(s.key);
            if (h < 0) s = s.left;
            else {
              if (!(h > 0)) return s.value;
              s = s.right;
            }
          }
          return null;
        } }, { key: "put", value: function(e, s) {
          if (this.root_ === null) return this.root_ = { key: e, value: s, left: null, right: null, parent: null, color: 0, getValue: function() {
            return this.value;
          }, getKey: function() {
            return this.key;
          } }, this.size_ = 1, null;
          var h, d, y = this.root_;
          do
            if (h = y, (d = e.compareTo(y.key)) < 0) y = y.left;
            else {
              if (!(d > 0)) {
                var x = y.value;
                return y.value = s, x;
              }
              y = y.right;
            }
          while (y !== null);
          var I = { key: e, left: null, right: null, value: s, parent: h, color: 0, getValue: function() {
            return this.value;
          }, getKey: function() {
            return this.key;
          } };
          return d < 0 ? h.left = I : h.right = I, this.fixAfterInsertion(I), this.size_++, null;
        } }, { key: "fixAfterInsertion", value: function(e) {
          var s;
          for (e.color = 1; e != null && e !== this.root_ && e.parent.color === 1; ) Ft(e) === Ts(Ft(Ft(e))) ? iu(s = ru(Ft(Ft(e)))) === 1 ? (mn(Ft(e), 0), mn(s, 0), mn(Ft(Ft(e)), 1), e = Ft(Ft(e))) : (e === ru(Ft(e)) && (e = Ft(e), this.rotateLeft(e)), mn(Ft(e), 0), mn(Ft(Ft(e)), 1), this.rotateRight(Ft(Ft(e)))) : iu(s = Ts(Ft(Ft(e)))) === 1 ? (mn(Ft(e), 0), mn(s, 0), mn(Ft(Ft(e)), 1), e = Ft(Ft(e))) : (e === Ts(Ft(e)) && (e = Ft(e), this.rotateRight(e)), mn(Ft(e), 0), mn(Ft(Ft(e)), 1), this.rotateLeft(Ft(Ft(e))));
          this.root_.color = 0;
        } }, { key: "values", value: function() {
          var e = new yt(), s = this.getFirstEntry();
          if (s !== null) for (e.add(s.value); (s = t.successor(s)) !== null; ) e.add(s.value);
          return e;
        } }, { key: "entrySet", value: function() {
          var e = new rn(), s = this.getFirstEntry();
          if (s !== null) for (e.add(s); (s = t.successor(s)) !== null; ) e.add(s);
          return e;
        } }, { key: "rotateLeft", value: function(e) {
          if (e != null) {
            var s = e.right;
            e.right = s.left, s.left != null && (s.left.parent = e), s.parent = e.parent, e.parent == null ? this.root_ = s : e.parent.left === e ? e.parent.left = s : e.parent.right = s, s.left = e, e.parent = s;
          }
        } }, { key: "rotateRight", value: function(e) {
          if (e != null) {
            var s = e.left;
            e.left = s.right, s.right != null && (s.right.parent = e), s.parent = e.parent, e.parent == null ? this.root_ = s : e.parent.right === e ? e.parent.right = s : e.parent.left = s, s.right = e, e.parent = s;
          }
        } }, { key: "getFirstEntry", value: function() {
          var e = this.root_;
          if (e != null) for (; e.left != null; ) e = e.left;
          return e;
        } }, { key: "size", value: function() {
          return this.size_;
        } }, { key: "containsKey", value: function(e) {
          for (var s = this.root_; s !== null; ) {
            var h = e.compareTo(s.key);
            if (h < 0) s = s.left;
            else {
              if (!(h > 0)) return !0;
              s = s.right;
            }
          }
          return !1;
        } }], [{ key: "successor", value: function(e) {
          var s;
          if (e === null) return null;
          if (e.right !== null) {
            for (s = e.right; s.left !== null; ) s = s.left;
            return s;
          }
          s = e.parent;
          for (var h = e; s !== null && h === s.right; ) h = s, s = s.parent;
          return s;
        } }]);
      }(Ps), Yt = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "find", value: function(u) {
          return this.nodeMap.get(u);
        } }, { key: "addNode", value: function() {
          if (arguments[0] instanceof z) {
            var u = arguments[0], t = this.nodeMap.get(u);
            return t === null && (t = this.nodeFact.createNode(u), this.nodeMap.put(u, t)), t;
          }
          if (arguments[0] instanceof Or) {
            var e = arguments[0], s = this.nodeMap.get(e.getCoordinate());
            return s === null ? (this.nodeMap.put(e.getCoordinate(), e), e) : (s.mergeLabel(e), s);
          }
        } }, { key: "print", value: function(u) {
          for (var t = this.iterator(); t.hasNext(); )
            t.next().print(u);
        } }, { key: "iterator", value: function() {
          return this.nodeMap.values().iterator();
        } }, { key: "values", value: function() {
          return this.nodeMap.values();
        } }, { key: "getBoundaryNodes", value: function(u) {
          for (var t = new yt(), e = this.iterator(); e.hasNext(); ) {
            var s = e.next();
            s.getLabel().getLocation(u) === R.BOUNDARY && t.add(s);
          }
          return t;
        } }, { key: "add", value: function(u) {
          var t = u.getCoordinate();
          this.addNode(t).add(u);
        } }], [{ key: "constructor_", value: function() {
          this.nodeMap = new Bt(), this.nodeFact = null;
          var u = arguments[0];
          this.nodeFact = u;
        } }]);
      }(), pe = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "isNorthern", value: function(t) {
          return t === u.NE || t === u.NW;
        } }, { key: "isOpposite", value: function(t, e) {
          return t !== e && (t - e + 4) % 4 === 2;
        } }, { key: "commonHalfPlane", value: function(t, e) {
          if (t === e) return t;
          if ((t - e + 4) % 4 === 2) return -1;
          var s = t < e ? t : e;
          return s === 0 && (t > e ? t : e) === 3 ? 3 : s;
        } }, { key: "isInHalfPlane", value: function(t, e) {
          return e === u.SE ? t === u.SE || t === u.SW : t === e || t === e + 1;
        } }, { key: "quadrant", value: function() {
          if (typeof arguments[0] == "number" && typeof arguments[1] == "number") {
            var t = arguments[0], e = arguments[1];
            if (t === 0 && e === 0) throw new Y("Cannot compute the quadrant for point ( " + t + ", " + e + " )");
            return t >= 0 ? e >= 0 ? u.NE : u.SE : e >= 0 ? u.NW : u.SW;
          }
          if (arguments[0] instanceof z && arguments[1] instanceof z) {
            var s = arguments[0], h = arguments[1];
            if (h.x === s.x && h.y === s.y) throw new Y("Cannot compute the quadrant for two identical points " + s);
            return h.x >= s.x ? h.y >= s.y ? u.NE : u.SE : h.y >= s.y ? u.NW : u.SW;
          }
        } }]);
      }();
      pe.NE = 0, pe.NW = 1, pe.SW = 2, pe.SE = 3;
      var su = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "compareDirection", value: function(t) {
          return this._dx === t._dx && this._dy === t._dy ? 0 : this._quadrant > t._quadrant ? 1 : this._quadrant < t._quadrant ? -1 : vt.index(t._p0, t._p1, this._p1);
        } }, { key: "getDy", value: function() {
          return this._dy;
        } }, { key: "getCoordinate", value: function() {
          return this._p0;
        } }, { key: "setNode", value: function(t) {
          this._node = t;
        } }, { key: "print", value: function(t) {
          var e = Math.atan2(this._dy, this._dx), s = this.getClass().getName(), h = s.lastIndexOf("."), d = s.substring(h + 1);
          t.print("  " + d + ": " + this._p0 + " - " + this._p1 + " " + this._quadrant + ":" + e + "   " + this._label);
        } }, { key: "compareTo", value: function(t) {
          var e = t;
          return this.compareDirection(e);
        } }, { key: "getDirectedCoordinate", value: function() {
          return this._p1;
        } }, { key: "getDx", value: function() {
          return this._dx;
        } }, { key: "getLabel", value: function() {
          return this._label;
        } }, { key: "getEdge", value: function() {
          return this._edge;
        } }, { key: "getQuadrant", value: function() {
          return this._quadrant;
        } }, { key: "getNode", value: function() {
          return this._node;
        } }, { key: "toString", value: function() {
          var t = Math.atan2(this._dy, this._dx), e = this.getClass().getName(), s = e.lastIndexOf(".");
          return "  " + e.substring(s + 1) + ": " + this._p0 + " - " + this._p1 + " " + this._quadrant + ":" + t + "   " + this._label;
        } }, { key: "computeLabel", value: function(t) {
        } }, { key: "init", value: function(t, e) {
          this._p0 = t, this._p1 = e, this._dx = e.x - t.x, this._dy = e.y - t.y, this._quadrant = pe.quadrant(this._dx, this._dy), It.isTrue(!(this._dx === 0 && this._dy === 0), "EdgeEnd with identical endpoints found");
        } }, { key: "interfaces_", get: function() {
          return [Z];
        } }], [{ key: "constructor_", value: function() {
          if (this._edge = null, this._label = null, this._node = null, this._p0 = null, this._p1 = null, this._dx = null, this._dy = null, this._quadrant = null, arguments.length === 1) {
            var t = arguments[0];
            this._edge = t;
          } else if (arguments.length === 3) {
            var e = arguments[0], s = arguments[1], h = arguments[2];
            u.constructor_.call(this, e, s, h, null);
          } else if (arguments.length === 4) {
            var d = arguments[0], y = arguments[1], x = arguments[2], I = arguments[3];
            u.constructor_.call(this, d), this.init(y, x), this._label = I;
          }
        } }]);
      }(), As = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "getNextMin", value: function() {
          return this._nextMin;
        } }, { key: "getDepth", value: function(e) {
          return this._depth[e];
        } }, { key: "setVisited", value: function(e) {
          this._isVisited = e;
        } }, { key: "computeDirectedLabel", value: function() {
          this._label = new Xe(this._edge.getLabel()), this._isForward || this._label.flip();
        } }, { key: "getNext", value: function() {
          return this._next;
        } }, { key: "setDepth", value: function(e, s) {
          if (this._depth[e] !== -999 && this._depth[e] !== s) throw new an("assigned depths do not match", this.getCoordinate());
          this._depth[e] = s;
        } }, { key: "isInteriorAreaEdge", value: function() {
          for (var e = !0, s = 0; s < 2; s++) this._label.isArea(s) && this._label.getLocation(s, tt.LEFT) === R.INTERIOR && this._label.getLocation(s, tt.RIGHT) === R.INTERIOR || (e = !1);
          return e;
        } }, { key: "setNextMin", value: function(e) {
          this._nextMin = e;
        } }, { key: "print", value: function(e) {
          C(t, "print", this, 1).call(this, e), e.print(" " + this._depth[tt.LEFT] + "/" + this._depth[tt.RIGHT]), e.print(" (" + this.getDepthDelta() + ")"), this._isInResult && e.print(" inResult");
        } }, { key: "setMinEdgeRing", value: function(e) {
          this._minEdgeRing = e;
        } }, { key: "isLineEdge", value: function() {
          var e = this._label.isLine(0) || this._label.isLine(1), s = !this._label.isArea(0) || this._label.allPositionsEqual(0, R.EXTERIOR), h = !this._label.isArea(1) || this._label.allPositionsEqual(1, R.EXTERIOR);
          return e && s && h;
        } }, { key: "setEdgeRing", value: function(e) {
          this._edgeRing = e;
        } }, { key: "getMinEdgeRing", value: function() {
          return this._minEdgeRing;
        } }, { key: "getDepthDelta", value: function() {
          var e = this._edge.getDepthDelta();
          return this._isForward || (e = -e), e;
        } }, { key: "setInResult", value: function(e) {
          this._isInResult = e;
        } }, { key: "getSym", value: function() {
          return this._sym;
        } }, { key: "isForward", value: function() {
          return this._isForward;
        } }, { key: "getEdge", value: function() {
          return this._edge;
        } }, { key: "printEdge", value: function(e) {
          this.print(e), e.print(" "), this._isForward ? this._edge.print(e) : this._edge.printReverse(e);
        } }, { key: "setSym", value: function(e) {
          this._sym = e;
        } }, { key: "setVisitedEdge", value: function(e) {
          this.setVisited(e), this._sym.setVisited(e);
        } }, { key: "setEdgeDepths", value: function(e, s) {
          var h = this.getEdge().getDepthDelta();
          this._isForward || (h = -h);
          var d = 1;
          e === tt.LEFT && (d = -1);
          var y = tt.opposite(e), x = s + h * d;
          this.setDepth(e, s), this.setDepth(y, x);
        } }, { key: "getEdgeRing", value: function() {
          return this._edgeRing;
        } }, { key: "isInResult", value: function() {
          return this._isInResult;
        } }, { key: "setNext", value: function(e) {
          this._next = e;
        } }, { key: "isVisited", value: function() {
          return this._isVisited;
        } }], [{ key: "constructor_", value: function() {
          this._isForward = null, this._isInResult = !1, this._isVisited = !1, this._sym = null, this._next = null, this._nextMin = null, this._edgeRing = null, this._minEdgeRing = null, this._depth = [0, -999, -999];
          var e = arguments[0], s = arguments[1];
          if (su.constructor_.call(this, e), this._isForward = s, s) this.init(e.getCoordinate(0), e.getCoordinate(1));
          else {
            var h = e.getNumPoints() - 1;
            this.init(e.getCoordinate(h), e.getCoordinate(h - 1));
          }
          this.computeDirectedLabel();
        } }, { key: "depthFactor", value: function(e, s) {
          return e === R.EXTERIOR && s === R.INTERIOR ? 1 : e === R.INTERIOR && s === R.EXTERIOR ? -1 : 0;
        } }]);
      }(su), au = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "createNode", value: function(u) {
          return new Or(u, null);
        } }]);
      }(), uu = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "printEdges", value: function(u) {
          u.println("Edges:");
          for (var t = 0; t < this._edges.size(); t++) {
            u.println("edge " + t + ":");
            var e = this._edges.get(t);
            e.print(u), e.eiList.print(u);
          }
        } }, { key: "find", value: function(u) {
          return this._nodes.find(u);
        } }, { key: "addNode", value: function() {
          if (arguments[0] instanceof Or) {
            var u = arguments[0];
            return this._nodes.addNode(u);
          }
          if (arguments[0] instanceof z) {
            var t = arguments[0];
            return this._nodes.addNode(t);
          }
        } }, { key: "getNodeIterator", value: function() {
          return this._nodes.iterator();
        } }, { key: "linkResultDirectedEdges", value: function() {
          for (var u = this._nodes.iterator(); u.hasNext(); )
            u.next().getEdges().linkResultDirectedEdges();
        } }, { key: "debugPrintln", value: function(u) {
          ze.out.println(u);
        } }, { key: "isBoundaryNode", value: function(u, t) {
          var e = this._nodes.find(t);
          if (e === null) return !1;
          var s = e.getLabel();
          return s !== null && s.getLocation(u) === R.BOUNDARY;
        } }, { key: "linkAllDirectedEdges", value: function() {
          for (var u = this._nodes.iterator(); u.hasNext(); )
            u.next().getEdges().linkAllDirectedEdges();
        } }, { key: "matchInSameDirection", value: function(u, t, e, s) {
          return !!u.equals(e) && vt.index(u, t, s) === vt.COLLINEAR && pe.quadrant(u, t) === pe.quadrant(e, s);
        } }, { key: "getEdgeEnds", value: function() {
          return this._edgeEndList;
        } }, { key: "debugPrint", value: function(u) {
          ze.out.print(u);
        } }, { key: "getEdgeIterator", value: function() {
          return this._edges.iterator();
        } }, { key: "findEdgeInSameDirection", value: function(u, t) {
          for (var e = 0; e < this._edges.size(); e++) {
            var s = this._edges.get(e), h = s.getCoordinates();
            if (this.matchInSameDirection(u, t, h[0], h[1]) || this.matchInSameDirection(u, t, h[h.length - 1], h[h.length - 2])) return s;
          }
          return null;
        } }, { key: "insertEdge", value: function(u) {
          this._edges.add(u);
        } }, { key: "findEdgeEnd", value: function(u) {
          for (var t = this.getEdgeEnds().iterator(); t.hasNext(); ) {
            var e = t.next();
            if (e.getEdge() === u) return e;
          }
          return null;
        } }, { key: "addEdges", value: function(u) {
          for (var t = u.iterator(); t.hasNext(); ) {
            var e = t.next();
            this._edges.add(e);
            var s = new As(e, !0), h = new As(e, !1);
            s.setSym(h), h.setSym(s), this.add(s), this.add(h);
          }
        } }, { key: "add", value: function(u) {
          this._nodes.add(u), this._edgeEndList.add(u);
        } }, { key: "getNodes", value: function() {
          return this._nodes.values();
        } }, { key: "findEdge", value: function(u, t) {
          for (var e = 0; e < this._edges.size(); e++) {
            var s = this._edges.get(e), h = s.getCoordinates();
            if (u.equals(h[0]) && t.equals(h[1])) return s;
          }
          return null;
        } }], [{ key: "constructor_", value: function() {
          if (this._edges = new yt(), this._nodes = null, this._edgeEndList = new yt(), arguments.length === 0) this._nodes = new Yt(new au());
          else if (arguments.length === 1) {
            var u = arguments[0];
            this._nodes = new Yt(u);
          }
        } }, { key: "linkResultDirectedEdges", value: function(u) {
          for (var t = u.iterator(); t.hasNext(); )
            t.next().getEdges().linkResultDirectedEdges();
        } }]);
      }(), zo = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "sortShellsAndHoles", value: function(t, e, s) {
          for (var h = t.iterator(); h.hasNext(); ) {
            var d = h.next();
            d.isHole() ? s.add(d) : e.add(d);
          }
        } }, { key: "computePolygons", value: function(t) {
          for (var e = new yt(), s = t.iterator(); s.hasNext(); ) {
            var h = s.next().toPolygon(this._geometryFactory);
            e.add(h);
          }
          return e;
        } }, { key: "placeFreeHoles", value: function(t, e) {
          for (var s = e.iterator(); s.hasNext(); ) {
            var h = s.next();
            if (h.getShell() === null) {
              var d = u.findEdgeRingContaining(h, t);
              if (d === null) throw new an("unable to assign hole to a shell", h.getCoordinate(0));
              h.setShell(d);
            }
          }
        } }, { key: "buildMinimalEdgeRings", value: function(t, e, s) {
          for (var h = new yt(), d = t.iterator(); d.hasNext(); ) {
            var y = d.next();
            if (y.getMaxNodeDegree() > 2) {
              y.linkDirectedEdgesForMinimalEdgeRings();
              var x = y.buildMinimalRings(), I = this.findShell(x);
              I !== null ? (this.placePolygonHoles(I, x), e.add(I)) : s.addAll(x);
            } else h.add(y);
          }
          return h;
        } }, { key: "buildMaximalEdgeRings", value: function(t) {
          for (var e = new yt(), s = t.iterator(); s.hasNext(); ) {
            var h = s.next();
            if (h.isInResult() && h.getLabel().isArea() && h.getEdgeRing() === null) {
              var d = new Bo(h, this._geometryFactory);
              e.add(d), d.setInResult();
            }
          }
          return e;
        } }, { key: "placePolygonHoles", value: function(t, e) {
          for (var s = e.iterator(); s.hasNext(); ) {
            var h = s.next();
            h.isHole() && h.setShell(t);
          }
        } }, { key: "getPolygons", value: function() {
          return this.computePolygons(this._shellList);
        } }, { key: "findShell", value: function(t) {
          for (var e = 0, s = null, h = t.iterator(); h.hasNext(); ) {
            var d = h.next();
            d.isHole() || (s = d, e++);
          }
          return It.isTrue(e <= 1, "found two shells in MinimalEdgeRing list"), s;
        } }, { key: "add", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            this.add(t.getEdgeEnds(), t.getNodes());
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            uu.linkResultDirectedEdges(s);
            var h = this.buildMaximalEdgeRings(e), d = new yt(), y = this.buildMinimalEdgeRings(h, this._shellList, d);
            this.sortShellsAndHoles(y, this._shellList, d), this.placeFreeHoles(this._shellList, d);
          }
        } }], [{ key: "constructor_", value: function() {
          this._geometryFactory = null, this._shellList = new yt();
          var t = arguments[0];
          this._geometryFactory = t;
        } }, { key: "findEdgeRingContaining", value: function(t, e) {
          for (var s = t.getLinearRing(), h = s.getEnvelopeInternal(), d = s.getCoordinateN(0), y = null, x = null, I = e.iterator(); I.hasNext(); ) {
            var T = I.next(), G = T.getLinearRing(), q = G.getEnvelopeInternal();
            if (!q.equals(h) && q.contains(h)) {
              d = re.ptNotInList(s.getCoordinates(), G.getCoordinates());
              var K = !1;
              Cs.isInRing(d, G.getCoordinates()) && (K = !0), K && (y === null || x.contains(q)) && (x = (y = T).getLinearRing().getEnvelopeInternal());
            }
          }
          return y;
        } }]);
      }(), Rs = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "getBounds", value: function() {
        } }]);
      }(), Pn = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getItem", value: function() {
          return this._item;
        } }, { key: "getBounds", value: function() {
          return this._bounds;
        } }, { key: "interfaces_", get: function() {
          return [Rs, $];
        } }], [{ key: "constructor_", value: function() {
          this._bounds = null, this._item = null;
          var u = arguments[0], t = arguments[1];
          this._bounds = u, this._item = t;
        } }]);
      }(), ne = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "poll", value: function() {
          if (this.isEmpty()) return null;
          var u = this._items.get(1);
          return this._items.set(1, this._items.get(this._size)), this._size -= 1, this.reorder(1), u;
        } }, { key: "size", value: function() {
          return this._size;
        } }, { key: "reorder", value: function(u) {
          for (var t = null, e = this._items.get(u); 2 * u <= this._size && ((t = 2 * u) !== this._size && this._items.get(t + 1).compareTo(this._items.get(t)) < 0 && t++, this._items.get(t).compareTo(e) < 0); u = t) this._items.set(u, this._items.get(t));
          this._items.set(u, e);
        } }, { key: "clear", value: function() {
          this._size = 0, this._items.clear();
        } }, { key: "peek", value: function() {
          return this.isEmpty() ? null : this._items.get(1);
        } }, { key: "isEmpty", value: function() {
          return this._size === 0;
        } }, { key: "add", value: function(u) {
          this._items.add(null), this._size += 1;
          var t = this._size;
          for (this._items.set(0, u); u.compareTo(this._items.get(Math.trunc(t / 2))) < 0; t /= 2) this._items.set(t, this._items.get(Math.trunc(t / 2)));
          this._items.set(t, u);
        } }], [{ key: "constructor_", value: function() {
          this._size = null, this._items = null, this._size = 0, this._items = new yt(), this._items.add(null);
        } }]);
      }(), Os = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "insert", value: function(u, t) {
        } }, { key: "remove", value: function(u, t) {
        } }, { key: "query", value: function() {
        } }]);
      }(), ce = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getLevel", value: function() {
          return this._level;
        } }, { key: "size", value: function() {
          return this._childBoundables.size();
        } }, { key: "getChildBoundables", value: function() {
          return this._childBoundables;
        } }, { key: "addChildBoundable", value: function(u) {
          It.isTrue(this._bounds === null), this._childBoundables.add(u);
        } }, { key: "isEmpty", value: function() {
          return this._childBoundables.isEmpty();
        } }, { key: "getBounds", value: function() {
          return this._bounds === null && (this._bounds = this.computeBounds()), this._bounds;
        } }, { key: "interfaces_", get: function() {
          return [Rs, $];
        } }], [{ key: "constructor_", value: function() {
          if (this._childBoundables = new yt(), this._bounds = null, this._level = null, arguments.length !== 0 && arguments.length === 1) {
            var u = arguments[0];
            this._level = u;
          }
        } }]);
      }(), ui = { reverseOrder: function() {
        return { compare: function(u, t) {
          return t.compareTo(u);
        } };
      }, min: function(u) {
        return ui.sort(u), u.get(0);
      }, sort: function(u, t) {
        var e = u.toArray();
        t ? ti.sort(e, t) : ti.sort(e);
        for (var s = u.iterator(), h = 0, d = e.length; h < d; h++) s.next(), s.set(e[h]);
      }, singletonList: function(u) {
        var t = new yt();
        return t.add(u), t;
      } }, Ls = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "maxDistance", value: function(t, e, s, h, d, y, x, I) {
          var T = u.distance(t, e, d, y);
          return T = Math.max(T, u.distance(t, e, x, I)), T = Math.max(T, u.distance(s, h, d, y)), T = Math.max(T, u.distance(s, h, x, I));
        } }, { key: "distance", value: function(t, e, s, h) {
          var d = s - t, y = h - e;
          return Math.sqrt(d * d + y * y);
        } }, { key: "maximumDistance", value: function(t, e) {
          var s = Math.min(t.getMinX(), e.getMinX()), h = Math.min(t.getMinY(), e.getMinY()), d = Math.max(t.getMaxX(), e.getMaxX()), y = Math.max(t.getMaxY(), e.getMaxY());
          return u.distance(s, h, d, y);
        } }, { key: "minMaxDistance", value: function(t, e) {
          var s = t.getMinX(), h = t.getMinY(), d = t.getMaxX(), y = t.getMaxY(), x = e.getMinX(), I = e.getMinY(), T = e.getMaxX(), G = e.getMaxY(), q = u.maxDistance(s, h, s, y, x, I, x, G);
          return q = Math.min(q, u.maxDistance(s, h, s, y, x, I, T, I)), q = Math.min(q, u.maxDistance(s, h, s, y, T, G, x, G)), q = Math.min(q, u.maxDistance(s, h, s, y, T, G, T, I)), q = Math.min(q, u.maxDistance(s, h, d, h, x, I, x, G)), q = Math.min(q, u.maxDistance(s, h, d, h, x, I, T, I)), q = Math.min(q, u.maxDistance(s, h, d, h, T, G, x, G)), q = Math.min(q, u.maxDistance(s, h, d, h, T, G, T, I)), q = Math.min(q, u.maxDistance(d, y, s, y, x, I, x, G)), q = Math.min(q, u.maxDistance(d, y, s, y, x, I, T, I)), q = Math.min(q, u.maxDistance(d, y, s, y, T, G, x, G)), q = Math.min(q, u.maxDistance(d, y, s, y, T, G, T, I)), q = Math.min(q, u.maxDistance(d, y, d, h, x, I, x, G)), q = Math.min(q, u.maxDistance(d, y, d, h, x, I, T, I)), q = Math.min(q, u.maxDistance(d, y, d, h, T, G, x, G)), q = Math.min(q, u.maxDistance(d, y, d, h, T, G, T, I));
        } }]);
      }(), ge = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "maximumDistance", value: function() {
          return Ls.maximumDistance(this._boundable1.getBounds(), this._boundable2.getBounds());
        } }, { key: "expandToQueue", value: function(t, e) {
          var s = u.isComposite(this._boundable1), h = u.isComposite(this._boundable2);
          if (s && h) return u.area(this._boundable1) > u.area(this._boundable2) ? (this.expand(this._boundable1, this._boundable2, !1, t, e), null) : (this.expand(this._boundable2, this._boundable1, !0, t, e), null);
          if (s) return this.expand(this._boundable1, this._boundable2, !1, t, e), null;
          if (h) return this.expand(this._boundable2, this._boundable1, !0, t, e), null;
          throw new Y("neither boundable is composite");
        } }, { key: "isLeaves", value: function() {
          return !(u.isComposite(this._boundable1) || u.isComposite(this._boundable2));
        } }, { key: "compareTo", value: function(t) {
          var e = t;
          return this._distance < e._distance ? -1 : this._distance > e._distance ? 1 : 0;
        } }, { key: "expand", value: function(t, e, s, h, d) {
          for (var y = t.getChildBoundables().iterator(); y.hasNext(); ) {
            var x = y.next(), I = null;
            (I = s ? new u(e, x, this._itemDistance) : new u(x, e, this._itemDistance)).getDistance() < d && h.add(I);
          }
        } }, { key: "getBoundable", value: function(t) {
          return t === 0 ? this._boundable1 : this._boundable2;
        } }, { key: "getDistance", value: function() {
          return this._distance;
        } }, { key: "distance", value: function() {
          return this.isLeaves() ? this._itemDistance.distance(this._boundable1, this._boundable2) : this._boundable1.getBounds().distance(this._boundable2.getBounds());
        } }, { key: "interfaces_", get: function() {
          return [Z];
        } }], [{ key: "constructor_", value: function() {
          this._boundable1 = null, this._boundable2 = null, this._distance = null, this._itemDistance = null;
          var t = arguments[0], e = arguments[1], s = arguments[2];
          this._boundable1 = t, this._boundable2 = e, this._itemDistance = s, this._distance = this.distance();
        } }, { key: "area", value: function(t) {
          return t.getBounds().getArea();
        } }, { key: "isComposite", value: function(t) {
          return t instanceof ce;
        } }]);
      }(), Gs = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "visitItem", value: function(u) {
        } }]);
      }(), oi = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "queryInternal", value: function() {
          if (kt(arguments[2], Gs) && arguments[0] instanceof Object && arguments[1] instanceof ce) for (var t = arguments[0], e = arguments[2], s = arguments[1].getChildBoundables(), h = 0; h < s.size(); h++) {
            var d = s.get(h);
            this.getIntersectsOp().intersects(d.getBounds(), t) && (d instanceof ce ? this.queryInternal(t, d, e) : d instanceof Pn ? e.visitItem(d.getItem()) : It.shouldNeverReachHere());
          }
          else if (kt(arguments[2], sn) && arguments[0] instanceof Object && arguments[1] instanceof ce) for (var y = arguments[0], x = arguments[2], I = arguments[1].getChildBoundables(), T = 0; T < I.size(); T++) {
            var G = I.get(T);
            this.getIntersectsOp().intersects(G.getBounds(), y) && (G instanceof ce ? this.queryInternal(y, G, x) : G instanceof Pn ? x.add(G.getItem()) : It.shouldNeverReachHere());
          }
        } }, { key: "getNodeCapacity", value: function() {
          return this._nodeCapacity;
        } }, { key: "lastNode", value: function(t) {
          return t.get(t.size() - 1);
        } }, { key: "size", value: function() {
          if (arguments.length === 0) return this.isEmpty() ? 0 : (this.build(), this.size(this._root));
          if (arguments.length === 1) {
            for (var t = 0, e = arguments[0].getChildBoundables().iterator(); e.hasNext(); ) {
              var s = e.next();
              s instanceof ce ? t += this.size(s) : s instanceof Pn && (t += 1);
            }
            return t;
          }
        } }, { key: "removeItem", value: function(t, e) {
          for (var s = null, h = t.getChildBoundables().iterator(); h.hasNext(); ) {
            var d = h.next();
            d instanceof Pn && d.getItem() === e && (s = d);
          }
          return s !== null && (t.getChildBoundables().remove(s), !0);
        } }, { key: "itemsTree", value: function() {
          if (arguments.length === 0) {
            this.build();
            var t = this.itemsTree(this._root);
            return t === null ? new yt() : t;
          }
          if (arguments.length === 1) {
            for (var e = arguments[0], s = new yt(), h = e.getChildBoundables().iterator(); h.hasNext(); ) {
              var d = h.next();
              if (d instanceof ce) {
                var y = this.itemsTree(d);
                y !== null && s.add(y);
              } else d instanceof Pn ? s.add(d.getItem()) : It.shouldNeverReachHere();
            }
            return s.size() <= 0 ? null : s;
          }
        } }, { key: "insert", value: function(t, e) {
          It.isTrue(!this._built, "Cannot insert items into an STR packed R-tree after it has been built."), this._itemBoundables.add(new Pn(t, e));
        } }, { key: "boundablesAtLevel", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0], e = new yt();
            return this.boundablesAtLevel(t, this._root, e), e;
          }
          if (arguments.length === 3) {
            var s = arguments[0], h = arguments[1], d = arguments[2];
            if (It.isTrue(s > -2), h.getLevel() === s) return d.add(h), null;
            for (var y = h.getChildBoundables().iterator(); y.hasNext(); ) {
              var x = y.next();
              x instanceof ce ? this.boundablesAtLevel(s, x, d) : (It.isTrue(x instanceof Pn), s === -1 && d.add(x));
            }
            return null;
          }
        } }, { key: "query", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            this.build();
            var e = new yt();
            return this.isEmpty() || this.getIntersectsOp().intersects(this._root.getBounds(), t) && this.queryInternal(t, this._root, e), e;
          }
          if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            if (this.build(), this.isEmpty()) return null;
            this.getIntersectsOp().intersects(this._root.getBounds(), s) && this.queryInternal(s, this._root, h);
          }
        } }, { key: "build", value: function() {
          if (this._built) return null;
          this._root = this._itemBoundables.isEmpty() ? this.createNode(0) : this.createHigherLevels(this._itemBoundables, -1), this._itemBoundables = null, this._built = !0;
        } }, { key: "getRoot", value: function() {
          return this.build(), this._root;
        } }, { key: "remove", value: function() {
          if (arguments.length === 2) {
            var t = arguments[0], e = arguments[1];
            return this.build(), !!this.getIntersectsOp().intersects(this._root.getBounds(), t) && this.remove(t, this._root, e);
          }
          if (arguments.length === 3) {
            var s = arguments[0], h = arguments[1], d = arguments[2], y = this.removeItem(h, d);
            if (y) return !0;
            for (var x = null, I = h.getChildBoundables().iterator(); I.hasNext(); ) {
              var T = I.next();
              if (this.getIntersectsOp().intersects(T.getBounds(), s) && T instanceof ce && (y = this.remove(s, T, d))) {
                x = T;
                break;
              }
            }
            return x !== null && x.getChildBoundables().isEmpty() && h.getChildBoundables().remove(x), y;
          }
        } }, { key: "createHigherLevels", value: function(t, e) {
          It.isTrue(!t.isEmpty());
          var s = this.createParentBoundables(t, e + 1);
          return s.size() === 1 ? s.get(0) : this.createHigherLevels(s, e + 1);
        } }, { key: "depth", value: function() {
          if (arguments.length === 0) return this.isEmpty() ? 0 : (this.build(), this.depth(this._root));
          if (arguments.length === 1) {
            for (var t = 0, e = arguments[0].getChildBoundables().iterator(); e.hasNext(); ) {
              var s = e.next();
              if (s instanceof ce) {
                var h = this.depth(s);
                h > t && (t = h);
              }
            }
            return t + 1;
          }
        } }, { key: "createParentBoundables", value: function(t, e) {
          It.isTrue(!t.isEmpty());
          var s = new yt();
          s.add(this.createNode(e));
          var h = new yt(t);
          ui.sort(h, this.getComparator());
          for (var d = h.iterator(); d.hasNext(); ) {
            var y = d.next();
            this.lastNode(s).getChildBoundables().size() === this.getNodeCapacity() && s.add(this.createNode(e)), this.lastNode(s).addChildBoundable(y);
          }
          return s;
        } }, { key: "isEmpty", value: function() {
          return this._built ? this._root.isEmpty() : this._itemBoundables.isEmpty();
        } }, { key: "interfaces_", get: function() {
          return [$];
        } }], [{ key: "constructor_", value: function() {
          if (this._root = null, this._built = !1, this._itemBoundables = new yt(), this._nodeCapacity = null, arguments.length === 0) u.constructor_.call(this, u.DEFAULT_NODE_CAPACITY);
          else if (arguments.length === 1) {
            var t = arguments[0];
            It.isTrue(t > 1, "Node capacity must be greater than 1"), this._nodeCapacity = t;
          }
        } }, { key: "compareDoubles", value: function(t, e) {
          return t > e ? 1 : t < e ? -1 : 0;
        } }]);
      }();
      oi.IntersectsOp = function() {
      }, oi.DEFAULT_NODE_CAPACITY = 10;
      var ou = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "distance", value: function(u, t) {
        } }]);
      }(), on = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "createParentBoundablesFromVerticalSlices", value: function(e, s) {
          It.isTrue(e.length > 0);
          for (var h = new yt(), d = 0; d < e.length; d++) h.addAll(this.createParentBoundablesFromVerticalSlice(e[d], s));
          return h;
        } }, { key: "nearestNeighbourK", value: function() {
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            return this.nearestNeighbourK(e, ht.POSITIVE_INFINITY, s);
          }
          if (arguments.length === 3) {
            var h = arguments[0], d = arguments[2], y = arguments[1], x = new ne();
            x.add(h);
            for (var I = new ne(); !x.isEmpty() && y >= 0; ) {
              var T = x.poll(), G = T.getDistance();
              if (G >= y) break;
              T.isLeaves() ? I.size() < d ? I.add(T) : (I.peek().getDistance() > G && (I.poll(), I.add(T)), y = I.peek().getDistance()) : T.expandToQueue(x, y);
            }
            return t.getItems(I);
          }
        } }, { key: "createNode", value: function(e) {
          return new Ds(e);
        } }, { key: "size", value: function() {
          return arguments.length === 0 ? C(t, "size", this, 1).call(this) : C(t, "size", this, 1).apply(this, arguments);
        } }, { key: "insert", value: function() {
          if (!(arguments.length === 2 && arguments[1] instanceof Object && arguments[0] instanceof Wt)) return C(t, "insert", this, 1).apply(this, arguments);
          var e = arguments[0], s = arguments[1];
          if (e.isNull()) return null;
          C(t, "insert", this, 1).call(this, e, s);
        } }, { key: "getIntersectsOp", value: function() {
          return t.intersectsOp;
        } }, { key: "verticalSlices", value: function(e, s) {
          for (var h = Math.trunc(Math.ceil(e.size() / s)), d = new Array(s).fill(null), y = e.iterator(), x = 0; x < s; x++) {
            d[x] = new yt();
            for (var I = 0; y.hasNext() && I < h; ) {
              var T = y.next();
              d[x].add(T), I++;
            }
          }
          return d;
        } }, { key: "query", value: function() {
          if (arguments.length === 1) {
            var e = arguments[0];
            return C(t, "query", this, 1).call(this, e);
          }
          if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            C(t, "query", this, 1).call(this, s, h);
          }
        } }, { key: "getComparator", value: function() {
          return t.yComparator;
        } }, { key: "createParentBoundablesFromVerticalSlice", value: function(e, s) {
          return C(t, "createParentBoundables", this, 1).call(this, e, s);
        } }, { key: "remove", value: function() {
          if (arguments.length === 2 && arguments[1] instanceof Object && arguments[0] instanceof Wt) {
            var e = arguments[0], s = arguments[1];
            return C(t, "remove", this, 1).call(this, e, s);
          }
          return C(t, "remove", this, 1).apply(this, arguments);
        } }, { key: "depth", value: function() {
          return arguments.length === 0 ? C(t, "depth", this, 1).call(this) : C(t, "depth", this, 1).apply(this, arguments);
        } }, { key: "createParentBoundables", value: function(e, s) {
          It.isTrue(!e.isEmpty());
          var h = Math.trunc(Math.ceil(e.size() / this.getNodeCapacity())), d = new yt(e);
          ui.sort(d, t.xComparator);
          var y = this.verticalSlices(d, Math.trunc(Math.ceil(Math.sqrt(h))));
          return this.createParentBoundablesFromVerticalSlices(y, s);
        } }, { key: "nearestNeighbour", value: function() {
          if (arguments.length === 1) {
            if (kt(arguments[0], ou)) {
              var e = arguments[0];
              if (this.isEmpty()) return null;
              var s = new ge(this.getRoot(), this.getRoot(), e);
              return this.nearestNeighbour(s);
            }
            if (arguments[0] instanceof ge) {
              var h = arguments[0], d = ht.POSITIVE_INFINITY, y = null, x = new ne();
              for (x.add(h); !x.isEmpty() && d > 0; ) {
                var I = x.poll(), T = I.getDistance();
                if (T >= d) break;
                I.isLeaves() ? (d = T, y = I) : I.expandToQueue(x, d);
              }
              return y === null ? null : [y.getBoundable(0).getItem(), y.getBoundable(1).getItem()];
            }
          } else {
            if (arguments.length === 2) {
              var G = arguments[0], q = arguments[1];
              if (this.isEmpty() || G.isEmpty()) return null;
              var K = new ge(this.getRoot(), G.getRoot(), q);
              return this.nearestNeighbour(K);
            }
            if (arguments.length === 3) {
              var rt = arguments[2], ot = new Pn(arguments[0], arguments[1]), gt = new ge(this.getRoot(), ot, rt);
              return this.nearestNeighbour(gt)[0];
            }
            if (arguments.length === 4) {
              var Pt = arguments[2], lt = arguments[3], Xt = new Pn(arguments[0], arguments[1]), fe = new ge(this.getRoot(), Xt, Pt);
              return this.nearestNeighbourK(fe, lt);
            }
          }
        } }, { key: "isWithinDistance", value: function() {
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1], h = ht.POSITIVE_INFINITY, d = new ne();
            for (d.add(e); !d.isEmpty(); ) {
              var y = d.poll(), x = y.getDistance();
              if (x > s) return !1;
              if (y.maximumDistance() <= s) return !0;
              if (y.isLeaves()) {
                if ((h = x) <= s) return !0;
              } else y.expandToQueue(d, h);
            }
            return !1;
          }
          if (arguments.length === 3) {
            var I = arguments[0], T = arguments[1], G = arguments[2], q = new ge(this.getRoot(), I.getRoot(), T);
            return this.isWithinDistance(q, G);
          }
        } }, { key: "interfaces_", get: function() {
          return [Os, $];
        } }], [{ key: "constructor_", value: function() {
          if (arguments.length === 0) t.constructor_.call(this, t.DEFAULT_NODE_CAPACITY);
          else if (arguments.length === 1) {
            var e = arguments[0];
            oi.constructor_.call(this, e);
          }
        } }, { key: "centreX", value: function(e) {
          return t.avg(e.getMinX(), e.getMaxX());
        } }, { key: "avg", value: function(e, s) {
          return (e + s) / 2;
        } }, { key: "getItems", value: function(e) {
          for (var s = new Array(e.size()).fill(null), h = 0; !e.isEmpty(); ) {
            var d = e.poll();
            s[h] = d.getBoundable(0).getItem(), h++;
          }
          return s;
        } }, { key: "centreY", value: function(e) {
          return t.avg(e.getMinY(), e.getMaxY());
        } }]);
      }(oi), Ds = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "computeBounds", value: function() {
          for (var e = null, s = this.getChildBoundables().iterator(); s.hasNext(); ) {
            var h = s.next();
            e === null ? e = new Wt(h.getBounds()) : e.expandToInclude(h.getBounds());
          }
          return e;
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0];
          ce.constructor_.call(this, e);
        } }]);
      }(ce);
      on.STRtreeNode = Ds, on.xComparator = new (function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "interfaces_", get: function() {
          return [Kt];
        } }, { key: "compare", value: function(u, t) {
          return oi.compareDoubles(on.centreX(u.getBounds()), on.centreX(t.getBounds()));
        } }]);
      }())(), on.yComparator = new (function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "interfaces_", get: function() {
          return [Kt];
        } }, { key: "compare", value: function(u, t) {
          return oi.compareDoubles(on.centreY(u.getBounds()), on.centreY(t.getBounds()));
        } }]);
      }())(), on.intersectsOp = new (function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "interfaces_", get: function() {
          return [IntersectsOp];
        } }, { key: "intersects", value: function(u, t) {
          return u.intersects(t);
        } }]);
      }())(), on.DEFAULT_NODE_CAPACITY = 10;
      var hu = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "relativeSign", value: function(t, e) {
          return t < e ? -1 : t > e ? 1 : 0;
        } }, { key: "compare", value: function(t, e, s) {
          if (e.equals2D(s)) return 0;
          var h = u.relativeSign(e.x, s.x), d = u.relativeSign(e.y, s.y);
          switch (t) {
            case 0:
              return u.compareValue(h, d);
            case 1:
              return u.compareValue(d, h);
            case 2:
              return u.compareValue(d, -h);
            case 3:
              return u.compareValue(-h, d);
            case 4:
              return u.compareValue(-h, -d);
            case 5:
              return u.compareValue(-d, -h);
            case 6:
              return u.compareValue(-d, h);
            case 7:
              return u.compareValue(h, -d);
          }
          return It.shouldNeverReachHere("invalid octant value"), 0;
        } }, { key: "compareValue", value: function(t, e) {
          return t < 0 ? -1 : t > 0 ? 1 : e < 0 ? -1 : e > 0 ? 1 : 0;
        } }]);
      }(), Pe = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getCoordinate", value: function() {
          return this.coord;
        } }, { key: "print", value: function(u) {
          u.print(this.coord), u.print(" seg # = " + this.segmentIndex);
        } }, { key: "compareTo", value: function(u) {
          var t = u;
          return this.segmentIndex < t.segmentIndex ? -1 : this.segmentIndex > t.segmentIndex ? 1 : this.coord.equals2D(t.coord) ? 0 : this._isInterior ? t._isInterior ? hu.compare(this._segmentOctant, this.coord, t.coord) : 1 : -1;
        } }, { key: "isEndPoint", value: function(u) {
          return this.segmentIndex === 0 && !this._isInterior || this.segmentIndex === u;
        } }, { key: "toString", value: function() {
          return this.segmentIndex + ":" + this.coord.toString();
        } }, { key: "isInterior", value: function() {
          return this._isInterior;
        } }, { key: "interfaces_", get: function() {
          return [Z];
        } }], [{ key: "constructor_", value: function() {
          this._segString = null, this.coord = null, this.segmentIndex = null, this._segmentOctant = null, this._isInterior = null;
          var u = arguments[0], t = arguments[1], e = arguments[2], s = arguments[3];
          this._segString = u, this.coord = new z(t), this.segmentIndex = e, this._segmentOctant = s, this._isInterior = !t.equals2D(u.getCoordinate(e));
        } }]);
      }(), jo = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "hasNext", value: function() {
        } }, { key: "next", value: function() {
        } }, { key: "remove", value: function() {
        } }]);
      }(), Ve = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getSplitCoordinates", value: function() {
          var u = new Zi();
          this.addEndpoints();
          for (var t = this.iterator(), e = t.next(); t.hasNext(); ) {
            var s = t.next();
            this.addEdgeCoordinates(e, s, u), e = s;
          }
          return u.toCoordinateArray();
        } }, { key: "addCollapsedNodes", value: function() {
          var u = new yt();
          this.findCollapsesFromInsertedNodes(u), this.findCollapsesFromExistingVertices(u);
          for (var t = u.iterator(); t.hasNext(); ) {
            var e = t.next().intValue();
            this.add(this._edge.getCoordinate(e), e);
          }
        } }, { key: "createSplitEdgePts", value: function(u, t) {
          var e = t.segmentIndex - u.segmentIndex + 2;
          if (e === 2) return [new z(u.coord), new z(t.coord)];
          var s = this._edge.getCoordinate(t.segmentIndex), h = t.isInterior() || !t.coord.equals2D(s);
          h || e--;
          var d = new Array(e).fill(null), y = 0;
          d[y++] = new z(u.coord);
          for (var x = u.segmentIndex + 1; x <= t.segmentIndex; x++) d[y++] = this._edge.getCoordinate(x);
          return h && (d[y] = new z(t.coord)), d;
        } }, { key: "print", value: function(u) {
          u.println("Intersections:");
          for (var t = this.iterator(); t.hasNext(); )
            t.next().print(u);
        } }, { key: "findCollapsesFromExistingVertices", value: function(u) {
          for (var t = 0; t < this._edge.size() - 2; t++) {
            var e = this._edge.getCoordinate(t);
            this._edge.getCoordinate(t + 1);
            var s = this._edge.getCoordinate(t + 2);
            e.equals2D(s) && u.add(Mr.valueOf(t + 1));
          }
        } }, { key: "addEdgeCoordinates", value: function(u, t, e) {
          var s = this.createSplitEdgePts(u, t);
          e.add(s, !1);
        } }, { key: "iterator", value: function() {
          return this._nodeMap.values().iterator();
        } }, { key: "addSplitEdges", value: function(u) {
          this.addEndpoints(), this.addCollapsedNodes();
          for (var t = this.iterator(), e = t.next(); t.hasNext(); ) {
            var s = t.next(), h = this.createSplitEdge(e, s);
            u.add(h), e = s;
          }
        } }, { key: "findCollapseIndex", value: function(u, t, e) {
          if (!u.coord.equals2D(t.coord)) return !1;
          var s = t.segmentIndex - u.segmentIndex;
          return t.isInterior() || s--, s === 1 && (e[0] = u.segmentIndex + 1, !0);
        } }, { key: "findCollapsesFromInsertedNodes", value: function(u) {
          for (var t = new Array(1).fill(null), e = this.iterator(), s = e.next(); e.hasNext(); ) {
            var h = e.next();
            this.findCollapseIndex(s, h, t) && u.add(Mr.valueOf(t[0])), s = h;
          }
        } }, { key: "getEdge", value: function() {
          return this._edge;
        } }, { key: "addEndpoints", value: function() {
          var u = this._edge.size() - 1;
          this.add(this._edge.getCoordinate(0), 0), this.add(this._edge.getCoordinate(u), u);
        } }, { key: "createSplitEdge", value: function(u, t) {
          var e = this.createSplitEdgePts(u, t);
          return new yn(e, this._edge.getData());
        } }, { key: "add", value: function(u, t) {
          var e = new Pe(this._edge, u, t, this._edge.getSegmentOctant(t)), s = this._nodeMap.get(e);
          return s !== null ? (It.isTrue(s.coord.equals2D(u), "Found equal nodes with different coordinates"), s) : (this._nodeMap.put(e, e), e);
        } }, { key: "checkSplitEdgesCorrectness", value: function(u) {
          var t = this._edge.getCoordinates(), e = u.get(0).getCoordinate(0);
          if (!e.equals2D(t[0])) throw new le("bad split edge start point at " + e);
          var s = u.get(u.size() - 1).getCoordinates(), h = s[s.length - 1];
          if (!h.equals2D(t[t.length - 1])) throw new le("bad split edge end point at " + h);
        } }], [{ key: "constructor_", value: function() {
          this._nodeMap = new Bt(), this._edge = null;
          var u = arguments[0];
          this._edge = u;
        } }]);
      }(), Uo = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "octant", value: function() {
          if (typeof arguments[0] == "number" && typeof arguments[1] == "number") {
            var t = arguments[0], e = arguments[1];
            if (t === 0 && e === 0) throw new Y("Cannot compute the octant for point ( " + t + ", " + e + " )");
            var s = Math.abs(t), h = Math.abs(e);
            return t >= 0 ? e >= 0 ? s >= h ? 0 : 1 : s >= h ? 7 : 6 : e >= 0 ? s >= h ? 3 : 2 : s >= h ? 4 : 5;
          }
          if (arguments[0] instanceof z && arguments[1] instanceof z) {
            var d = arguments[0], y = arguments[1], x = y.x - d.x, I = y.y - d.y;
            if (x === 0 && I === 0) throw new Y("Cannot compute the octant for two identical points " + d);
            return u.octant(x, I);
          }
        } }]);
      }(), lu = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "getCoordinates", value: function() {
        } }, { key: "size", value: function() {
        } }, { key: "getCoordinate", value: function(u) {
        } }, { key: "isClosed", value: function() {
        } }, { key: "setData", value: function(u) {
        } }, { key: "getData", value: function() {
        } }]);
      }(), Bn = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "addIntersection", value: function(u, t) {
        } }, { key: "interfaces_", get: function() {
          return [lu];
        } }]);
      }(), yn = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getCoordinates", value: function() {
          return this._pts;
        } }, { key: "size", value: function() {
          return this._pts.length;
        } }, { key: "getCoordinate", value: function(t) {
          return this._pts[t];
        } }, { key: "isClosed", value: function() {
          return this._pts[0].equals(this._pts[this._pts.length - 1]);
        } }, { key: "getSegmentOctant", value: function(t) {
          return t === this._pts.length - 1 ? -1 : this.safeOctant(this.getCoordinate(t), this.getCoordinate(t + 1));
        } }, { key: "setData", value: function(t) {
          this._data = t;
        } }, { key: "safeOctant", value: function(t, e) {
          return t.equals2D(e) ? 0 : Uo.octant(t, e);
        } }, { key: "getData", value: function() {
          return this._data;
        } }, { key: "addIntersection", value: function() {
          if (arguments.length === 2) {
            var t = arguments[0], e = arguments[1];
            this.addIntersectionNode(t, e);
          } else if (arguments.length === 4) {
            var s = arguments[1], h = arguments[3], d = new z(arguments[0].getIntersection(h));
            this.addIntersection(d, s);
          }
        } }, { key: "toString", value: function() {
          return Rr.toLineString(new Qi(this._pts));
        } }, { key: "getNodeList", value: function() {
          return this._nodeList;
        } }, { key: "addIntersectionNode", value: function(t, e) {
          var s = e, h = s + 1;
          if (h < this._pts.length) {
            var d = this._pts[h];
            t.equals2D(d) && (s = h);
          }
          return this._nodeList.add(t, s);
        } }, { key: "addIntersections", value: function(t, e, s) {
          for (var h = 0; h < t.getIntersectionNum(); h++) this.addIntersection(t, e, s, h);
        } }, { key: "interfaces_", get: function() {
          return [Bn];
        } }], [{ key: "constructor_", value: function() {
          this._nodeList = new Ve(this), this._pts = null, this._data = null;
          var t = arguments[0], e = arguments[1];
          this._pts = t, this._data = e;
        } }, { key: "getNodedSubstrings", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0], e = new yt();
            return u.getNodedSubstrings(t, e), e;
          }
          if (arguments.length === 2) for (var s = arguments[1], h = arguments[0].iterator(); h.hasNext(); )
            h.next().getNodeList().addSplitEdges(s);
        } }]);
      }(), ve = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "minX", value: function() {
          return Math.min(this.p0.x, this.p1.x);
        } }, { key: "orientationIndex", value: function() {
          if (arguments[0] instanceof u) {
            var t = arguments[0], e = vt.index(this.p0, this.p1, t.p0), s = vt.index(this.p0, this.p1, t.p1);
            return e >= 0 && s >= 0 || e <= 0 && s <= 0 ? Math.max(e, s) : 0;
          }
          if (arguments[0] instanceof z) {
            var h = arguments[0];
            return vt.index(this.p0, this.p1, h);
          }
        } }, { key: "toGeometry", value: function(t) {
          return t.createLineString([this.p0, this.p1]);
        } }, { key: "isVertical", value: function() {
          return this.p0.x === this.p1.x;
        } }, { key: "equals", value: function(t) {
          if (!(t instanceof u)) return !1;
          var e = t;
          return this.p0.equals(e.p0) && this.p1.equals(e.p1);
        } }, { key: "intersection", value: function(t) {
          var e = new qn();
          return e.computeIntersection(this.p0, this.p1, t.p0, t.p1), e.hasIntersection() ? e.getIntersection(0) : null;
        } }, { key: "project", value: function() {
          if (arguments[0] instanceof z) {
            var t = arguments[0];
            if (t.equals(this.p0) || t.equals(this.p1)) return new z(t);
            var e = this.projectionFactor(t), s = new z();
            return s.x = this.p0.x + e * (this.p1.x - this.p0.x), s.y = this.p0.y + e * (this.p1.y - this.p0.y), s;
          }
          if (arguments[0] instanceof u) {
            var h = arguments[0], d = this.projectionFactor(h.p0), y = this.projectionFactor(h.p1);
            if (d >= 1 && y >= 1 || d <= 0 && y <= 0) return null;
            var x = this.project(h.p0);
            d < 0 && (x = this.p0), d > 1 && (x = this.p1);
            var I = this.project(h.p1);
            return y < 0 && (I = this.p0), y > 1 && (I = this.p1), new u(x, I);
          }
        } }, { key: "normalize", value: function() {
          this.p1.compareTo(this.p0) < 0 && this.reverse();
        } }, { key: "angle", value: function() {
          return Math.atan2(this.p1.y - this.p0.y, this.p1.x - this.p0.x);
        } }, { key: "getCoordinate", value: function(t) {
          return t === 0 ? this.p0 : this.p1;
        } }, { key: "distancePerpendicular", value: function(t) {
          return un.pointToLinePerpendicular(t, this.p0, this.p1);
        } }, { key: "minY", value: function() {
          return Math.min(this.p0.y, this.p1.y);
        } }, { key: "midPoint", value: function() {
          return u.midPoint(this.p0, this.p1);
        } }, { key: "projectionFactor", value: function(t) {
          if (t.equals(this.p0)) return 0;
          if (t.equals(this.p1)) return 1;
          var e = this.p1.x - this.p0.x, s = this.p1.y - this.p0.y, h = e * e + s * s;
          return h <= 0 ? ht.NaN : ((t.x - this.p0.x) * e + (t.y - this.p0.y) * s) / h;
        } }, { key: "closestPoints", value: function(t) {
          var e = this.intersection(t);
          if (e !== null) return [e, e];
          var s = new Array(2).fill(null), h = ht.MAX_VALUE, d = null, y = this.closestPoint(t.p0);
          h = y.distance(t.p0), s[0] = y, s[1] = t.p0;
          var x = this.closestPoint(t.p1);
          (d = x.distance(t.p1)) < h && (h = d, s[0] = x, s[1] = t.p1);
          var I = t.closestPoint(this.p0);
          (d = I.distance(this.p0)) < h && (h = d, s[0] = this.p0, s[1] = I);
          var T = t.closestPoint(this.p1);
          return (d = T.distance(this.p1)) < h && (h = d, s[0] = this.p1, s[1] = T), s;
        } }, { key: "closestPoint", value: function(t) {
          var e = this.projectionFactor(t);
          return e > 0 && e < 1 ? this.project(t) : this.p0.distance(t) < this.p1.distance(t) ? this.p0 : this.p1;
        } }, { key: "maxX", value: function() {
          return Math.max(this.p0.x, this.p1.x);
        } }, { key: "getLength", value: function() {
          return this.p0.distance(this.p1);
        } }, { key: "compareTo", value: function(t) {
          var e = t, s = this.p0.compareTo(e.p0);
          return s !== 0 ? s : this.p1.compareTo(e.p1);
        } }, { key: "reverse", value: function() {
          var t = this.p0;
          this.p0 = this.p1, this.p1 = t;
        } }, { key: "equalsTopo", value: function(t) {
          return this.p0.equals(t.p0) && this.p1.equals(t.p1) || this.p0.equals(t.p1) && this.p1.equals(t.p0);
        } }, { key: "lineIntersection", value: function(t) {
          return ys.intersection(this.p0, this.p1, t.p0, t.p1);
        } }, { key: "maxY", value: function() {
          return Math.max(this.p0.y, this.p1.y);
        } }, { key: "pointAlongOffset", value: function(t, e) {
          var s = this.p0.x + t * (this.p1.x - this.p0.x), h = this.p0.y + t * (this.p1.y - this.p0.y), d = this.p1.x - this.p0.x, y = this.p1.y - this.p0.y, x = Math.sqrt(d * d + y * y), I = 0, T = 0;
          if (e !== 0) {
            if (x <= 0) throw new IllegalStateException("Cannot compute offset from zero-length line segment");
            I = e * d / x, T = e * y / x;
          }
          return new z(s - T, h + I);
        } }, { key: "setCoordinates", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            this.setCoordinates(t.p0, t.p1);
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            this.p0.x = e.x, this.p0.y = e.y, this.p1.x = s.x, this.p1.y = s.y;
          }
        } }, { key: "segmentFraction", value: function(t) {
          var e = this.projectionFactor(t);
          return e < 0 ? e = 0 : (e > 1 || ht.isNaN(e)) && (e = 1), e;
        } }, { key: "toString", value: function() {
          return "LINESTRING( " + this.p0.x + " " + this.p0.y + ", " + this.p1.x + " " + this.p1.y + ")";
        } }, { key: "isHorizontal", value: function() {
          return this.p0.y === this.p1.y;
        } }, { key: "reflect", value: function(t) {
          var e = this.p1.getY() - this.p0.getY(), s = this.p0.getX() - this.p1.getX(), h = this.p0.getY() * (this.p1.getX() - this.p0.getX()) - this.p0.getX() * (this.p1.getY() - this.p0.getY()), d = e * e + s * s, y = e * e - s * s, x = t.getX(), I = t.getY();
          return new z((-y * x - 2 * e * s * I - 2 * e * h) / d, (y * I - 2 * e * s * x - 2 * s * h) / d);
        } }, { key: "distance", value: function() {
          if (arguments[0] instanceof u) {
            var t = arguments[0];
            return un.segmentToSegment(this.p0, this.p1, t.p0, t.p1);
          }
          if (arguments[0] instanceof z) {
            var e = arguments[0];
            return un.pointToSegment(e, this.p0, this.p1);
          }
        } }, { key: "pointAlong", value: function(t) {
          var e = new z();
          return e.x = this.p0.x + t * (this.p1.x - this.p0.x), e.y = this.p0.y + t * (this.p1.y - this.p0.y), e;
        } }, { key: "hashCode", value: function() {
          var t = ht.doubleToLongBits(this.p0.x);
          t ^= 31 * ht.doubleToLongBits(this.p0.y);
          var e = Math.trunc(t) ^ Math.trunc(t >> 32), s = ht.doubleToLongBits(this.p1.x);
          return s ^= 31 * ht.doubleToLongBits(this.p1.y), e ^ (Math.trunc(s) ^ Math.trunc(s >> 32));
        } }, { key: "interfaces_", get: function() {
          return [Z, $];
        } }], [{ key: "constructor_", value: function() {
          if (this.p0 = null, this.p1 = null, arguments.length === 0) u.constructor_.call(this, new z(), new z());
          else if (arguments.length === 1) {
            var t = arguments[0];
            u.constructor_.call(this, t.p0, t.p1);
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            this.p0 = e, this.p1 = s;
          } else if (arguments.length === 4) {
            var h = arguments[0], d = arguments[1], y = arguments[2], x = arguments[3];
            u.constructor_.call(this, new z(h, d), new z(y, x));
          }
        } }, { key: "midPoint", value: function(t, e) {
          return new z((t.x + e.x) / 2, (t.y + e.y) / 2);
        } }]);
      }(), Zt = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "overlap", value: function() {
          if (arguments.length !== 2 && arguments.length === 4) {
            var u = arguments[1], t = arguments[2], e = arguments[3];
            arguments[0].getLineSegment(u, this._overlapSeg1), t.getLineSegment(e, this._overlapSeg2), this.overlap(this._overlapSeg1, this._overlapSeg2);
          }
        } }], [{ key: "constructor_", value: function() {
          this._overlapSeg1 = new ve(), this._overlapSeg2 = new ve();
        } }]);
      }(), Tn = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getLineSegment", value: function(u, t) {
          t.p0 = this._pts[u], t.p1 = this._pts[u + 1];
        } }, { key: "computeSelect", value: function(u, t, e, s) {
          var h = this._pts[t], d = this._pts[e];
          if (e - t == 1) return s.select(this, t), null;
          if (!u.intersects(h, d)) return null;
          var y = Math.trunc((t + e) / 2);
          t < y && this.computeSelect(u, t, y, s), y < e && this.computeSelect(u, y, e, s);
        } }, { key: "getCoordinates", value: function() {
          for (var u = new Array(this._end - this._start + 1).fill(null), t = 0, e = this._start; e <= this._end; e++) u[t++] = this._pts[e];
          return u;
        } }, { key: "computeOverlaps", value: function() {
          if (arguments.length === 2) {
            var u = arguments[0], t = arguments[1];
            this.computeOverlaps(this._start, this._end, u, u._start, u._end, t);
          } else if (arguments.length === 6) {
            var e = arguments[0], s = arguments[1], h = arguments[2], d = arguments[3], y = arguments[4], x = arguments[5];
            if (s - e == 1 && y - d == 1) return x.overlap(this, e, h, d), null;
            if (!this.overlaps(e, s, h, d, y)) return null;
            var I = Math.trunc((e + s) / 2), T = Math.trunc((d + y) / 2);
            e < I && (d < T && this.computeOverlaps(e, I, h, d, T, x), T < y && this.computeOverlaps(e, I, h, T, y, x)), I < s && (d < T && this.computeOverlaps(I, s, h, d, T, x), T < y && this.computeOverlaps(I, s, h, T, y, x));
          }
        } }, { key: "setId", value: function(u) {
          this._id = u;
        } }, { key: "select", value: function(u, t) {
          this.computeSelect(u, this._start, this._end, t);
        } }, { key: "getEnvelope", value: function() {
          if (this._env === null) {
            var u = this._pts[this._start], t = this._pts[this._end];
            this._env = new Wt(u, t);
          }
          return this._env;
        } }, { key: "overlaps", value: function(u, t, e, s, h) {
          return Wt.intersects(this._pts[u], this._pts[t], e._pts[s], e._pts[h]);
        } }, { key: "getEndIndex", value: function() {
          return this._end;
        } }, { key: "getStartIndex", value: function() {
          return this._start;
        } }, { key: "getContext", value: function() {
          return this._context;
        } }, { key: "getId", value: function() {
          return this._id;
        } }], [{ key: "constructor_", value: function() {
          this._pts = null, this._start = null, this._end = null, this._env = null, this._context = null, this._id = null;
          var u = arguments[0], t = arguments[1], e = arguments[2], s = arguments[3];
          this._pts = u, this._start = t, this._end = e, this._context = s;
        } }]);
      }(), Fs = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "findChainEnd", value: function(t, e) {
          for (var s = e; s < t.length - 1 && t[s].equals2D(t[s + 1]); ) s++;
          if (s >= t.length - 1) return t.length - 1;
          for (var h = pe.quadrant(t[s], t[s + 1]), d = e + 1; d < t.length && !(!t[d - 1].equals2D(t[d]) && pe.quadrant(t[d - 1], t[d]) !== h); )
            d++;
          return d - 1;
        } }, { key: "getChains", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return u.getChains(t, null);
          }
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1], h = new yt(), d = 0;
            do {
              var y = u.findChainEnd(e, d), x = new Tn(e, d, y, s);
              h.add(x), d = y;
            } while (d < e.length - 1);
            return h;
          }
        } }]);
      }(), qs = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "computeNodes", value: function(u) {
        } }, { key: "getNodedSubstrings", value: function() {
        } }]);
      }(), Lr = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "setSegmentIntersector", value: function(u) {
          this._segInt = u;
        } }, { key: "interfaces_", get: function() {
          return [qs];
        } }], [{ key: "constructor_", value: function() {
          if (this._segInt = null, arguments.length !== 0 && arguments.length === 1) {
            var u = arguments[0];
            this.setSegmentIntersector(u);
          }
        } }]);
      }(), Bs = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "getMonotoneChains", value: function() {
          return this._monoChains;
        } }, { key: "getNodedSubstrings", value: function() {
          return yn.getNodedSubstrings(this._nodedSegStrings);
        } }, { key: "getIndex", value: function() {
          return this._index;
        } }, { key: "add", value: function(e) {
          for (var s = Fs.getChains(e.getCoordinates(), e).iterator(); s.hasNext(); ) {
            var h = s.next();
            h.setId(this._idCounter++), this._index.insert(h.getEnvelope(), h), this._monoChains.add(h);
          }
        } }, { key: "computeNodes", value: function(e) {
          this._nodedSegStrings = e;
          for (var s = e.iterator(); s.hasNext(); ) this.add(s.next());
          this.intersectChains();
        } }, { key: "intersectChains", value: function() {
          for (var e = new cu(this._segInt), s = this._monoChains.iterator(); s.hasNext(); ) for (var h = s.next(), d = this._index.query(h.getEnvelope()).iterator(); d.hasNext(); ) {
            var y = d.next();
            if (y.getId() > h.getId() && (h.computeOverlaps(y, e), this._nOverlaps++), this._segInt.isDone()) return null;
          }
        } }], [{ key: "constructor_", value: function() {
          if (this._monoChains = new yt(), this._index = new on(), this._idCounter = 0, this._nodedSegStrings = null, this._nOverlaps = 0, arguments.length !== 0 && arguments.length === 1) {
            var e = arguments[0];
            Lr.constructor_.call(this, e);
          }
        } }]);
      }(Lr), cu = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "overlap", value: function() {
          if (arguments.length !== 4) return C(t, "overlap", this, 1).apply(this, arguments);
          var e = arguments[1], s = arguments[2], h = arguments[3], d = arguments[0].getContext(), y = s.getContext();
          this._si.processIntersections(d, e, y, h);
        } }], [{ key: "constructor_", value: function() {
          this._si = null;
          var e = arguments[0];
          this._si = e;
        } }]);
      }(Zt);
      Bs.SegmentOverlapAction = cu;
      var hn = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "isDeletable", value: function(t, e, s, h) {
          var d = this._inputLine[t], y = this._inputLine[e], x = this._inputLine[s];
          return !!this.isConcave(d, y, x) && !!this.isShallow(d, y, x, h) && this.isShallowSampled(d, y, t, s, h);
        } }, { key: "deleteShallowConcavities", value: function() {
          for (var t = 1, e = this.findNextNonDeletedIndex(t), s = this.findNextNonDeletedIndex(e), h = !1; s < this._inputLine.length; ) {
            var d = !1;
            this.isDeletable(t, e, s, this._distanceTol) && (this._isDeleted[e] = u.DELETE, d = !0, h = !0), t = d ? s : e, e = this.findNextNonDeletedIndex(t), s = this.findNextNonDeletedIndex(e);
          }
          return h;
        } }, { key: "isShallowConcavity", value: function(t, e, s, h) {
          return vt.index(t, e, s) === this._angleOrientation && un.pointToSegment(e, t, s) < h;
        } }, { key: "isShallowSampled", value: function(t, e, s, h, d) {
          var y = Math.trunc((h - s) / u.NUM_PTS_TO_CHECK);
          y <= 0 && (y = 1);
          for (var x = s; x < h; x += y) if (!this.isShallow(t, e, this._inputLine[x], d)) return !1;
          return !0;
        } }, { key: "isConcave", value: function(t, e, s) {
          var h = vt.index(t, e, s) === this._angleOrientation;
          return h;
        } }, { key: "simplify", value: function(t) {
          this._distanceTol = Math.abs(t), t < 0 && (this._angleOrientation = vt.CLOCKWISE), this._isDeleted = new Array(this._inputLine.length).fill(null);
          var e = !1;
          do
            e = this.deleteShallowConcavities();
          while (e);
          return this.collapseLine();
        } }, { key: "findNextNonDeletedIndex", value: function(t) {
          for (var e = t + 1; e < this._inputLine.length && this._isDeleted[e] === u.DELETE; ) e++;
          return e;
        } }, { key: "isShallow", value: function(t, e, s, h) {
          return un.pointToSegment(e, t, s) < h;
        } }, { key: "collapseLine", value: function() {
          for (var t = new Zi(), e = 0; e < this._inputLine.length; e++) this._isDeleted[e] !== u.DELETE && t.add(this._inputLine[e]);
          return t.toCoordinateArray();
        } }], [{ key: "constructor_", value: function() {
          this._inputLine = null, this._distanceTol = null, this._isDeleted = null, this._angleOrientation = vt.COUNTERCLOCKWISE;
          var t = arguments[0];
          this._inputLine = t;
        } }, { key: "simplify", value: function(t, e) {
          return new u(t).simplify(e);
        } }]);
      }();
      hn.INIT = 0, hn.DELETE = 1, hn.KEEP = 1, hn.NUM_PTS_TO_CHECK = 10;
      var zs = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getCoordinates", value: function() {
          return this._ptList.toArray(u.COORDINATE_ARRAY_TYPE);
        } }, { key: "setPrecisionModel", value: function(t) {
          this._precisionModel = t;
        } }, { key: "addPt", value: function(t) {
          var e = new z(t);
          if (this._precisionModel.makePrecise(e), this.isRedundant(e)) return null;
          this._ptList.add(e);
        } }, { key: "reverse", value: function() {
        } }, { key: "addPts", value: function(t, e) {
          if (e) for (var s = 0; s < t.length; s++) this.addPt(t[s]);
          else for (var h = t.length - 1; h >= 0; h--) this.addPt(t[h]);
        } }, { key: "isRedundant", value: function(t) {
          if (this._ptList.size() < 1) return !1;
          var e = this._ptList.get(this._ptList.size() - 1);
          return t.distance(e) < this._minimimVertexDistance;
        } }, { key: "toString", value: function() {
          return new Ni().createLineString(this.getCoordinates()).toString();
        } }, { key: "closeRing", value: function() {
          if (this._ptList.size() < 1) return null;
          var t = new z(this._ptList.get(0)), e = this._ptList.get(this._ptList.size() - 1);
          if (t.equals(e)) return null;
          this._ptList.add(t);
        } }, { key: "setMinimumVertexDistance", value: function(t) {
          this._minimimVertexDistance = t;
        } }], [{ key: "constructor_", value: function() {
          this._ptList = null, this._precisionModel = null, this._minimimVertexDistance = 0, this._ptList = new yt();
        } }]);
      }();
      zs.COORDINATE_ARRAY_TYPE = new Array(0).fill(null);
      var _e = function() {
        function u() {
          c(this, u);
        }
        return g(u, null, [{ key: "toDegrees", value: function(t) {
          return 180 * t / Math.PI;
        } }, { key: "normalize", value: function(t) {
          for (; t > Math.PI; ) t -= u.PI_TIMES_2;
          for (; t <= -Math.PI; ) t += u.PI_TIMES_2;
          return t;
        } }, { key: "angle", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return Math.atan2(t.y, t.x);
          }
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1], h = s.x - e.x, d = s.y - e.y;
            return Math.atan2(d, h);
          }
        } }, { key: "isAcute", value: function(t, e, s) {
          var h = t.x - e.x, d = t.y - e.y;
          return h * (s.x - e.x) + d * (s.y - e.y) > 0;
        } }, { key: "isObtuse", value: function(t, e, s) {
          var h = t.x - e.x, d = t.y - e.y;
          return h * (s.x - e.x) + d * (s.y - e.y) < 0;
        } }, { key: "interiorAngle", value: function(t, e, s) {
          var h = u.angle(e, t), d = u.angle(e, s);
          return Math.abs(d - h);
        } }, { key: "normalizePositive", value: function(t) {
          if (t < 0) {
            for (; t < 0; ) t += u.PI_TIMES_2;
            t >= u.PI_TIMES_2 && (t = 0);
          } else {
            for (; t >= u.PI_TIMES_2; ) t -= u.PI_TIMES_2;
            t < 0 && (t = 0);
          }
          return t;
        } }, { key: "angleBetween", value: function(t, e, s) {
          var h = u.angle(e, t), d = u.angle(e, s);
          return u.diff(h, d);
        } }, { key: "diff", value: function(t, e) {
          var s = null;
          return (s = t < e ? e - t : t - e) > Math.PI && (s = 2 * Math.PI - s), s;
        } }, { key: "toRadians", value: function(t) {
          return t * Math.PI / 180;
        } }, { key: "getTurn", value: function(t, e) {
          var s = Math.sin(e - t);
          return s > 0 ? u.COUNTERCLOCKWISE : s < 0 ? u.CLOCKWISE : u.NONE;
        } }, { key: "angleBetweenOriented", value: function(t, e, s) {
          var h = u.angle(e, t), d = u.angle(e, s) - h;
          return d <= -Math.PI ? d + u.PI_TIMES_2 : d > Math.PI ? d - u.PI_TIMES_2 : d;
        } }]);
      }();
      _e.PI_TIMES_2 = 2 * Math.PI, _e.PI_OVER_2 = Math.PI / 2, _e.PI_OVER_4 = Math.PI / 4, _e.COUNTERCLOCKWISE = vt.COUNTERCLOCKWISE, _e.CLOCKWISE = vt.CLOCKWISE, _e.NONE = vt.COLLINEAR;
      var pn = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "addNextSegment", value: function(t, e) {
          if (this._s0 = this._s1, this._s1 = this._s2, this._s2 = t, this._seg0.setCoordinates(this._s0, this._s1), this.computeOffsetSegment(this._seg0, this._side, this._distance, this._offset0), this._seg1.setCoordinates(this._s1, this._s2), this.computeOffsetSegment(this._seg1, this._side, this._distance, this._offset1), this._s1.equals(this._s2)) return null;
          var s = vt.index(this._s0, this._s1, this._s2), h = s === vt.CLOCKWISE && this._side === tt.LEFT || s === vt.COUNTERCLOCKWISE && this._side === tt.RIGHT;
          s === 0 ? this.addCollinear(e) : h ? this.addOutsideTurn(s, e) : this.addInsideTurn(s, e);
        } }, { key: "addLineEndCap", value: function(t, e) {
          var s = new ve(t, e), h = new ve();
          this.computeOffsetSegment(s, tt.LEFT, this._distance, h);
          var d = new ve();
          this.computeOffsetSegment(s, tt.RIGHT, this._distance, d);
          var y = e.x - t.x, x = e.y - t.y, I = Math.atan2(x, y);
          switch (this._bufParams.getEndCapStyle()) {
            case U.CAP_ROUND:
              this._segList.addPt(h.p1), this.addDirectedFillet(e, I + Math.PI / 2, I - Math.PI / 2, vt.CLOCKWISE, this._distance), this._segList.addPt(d.p1);
              break;
            case U.CAP_FLAT:
              this._segList.addPt(h.p1), this._segList.addPt(d.p1);
              break;
            case U.CAP_SQUARE:
              var T = new z();
              T.x = Math.abs(this._distance) * Math.cos(I), T.y = Math.abs(this._distance) * Math.sin(I);
              var G = new z(h.p1.x + T.x, h.p1.y + T.y), q = new z(d.p1.x + T.x, d.p1.y + T.y);
              this._segList.addPt(G), this._segList.addPt(q);
          }
        } }, { key: "getCoordinates", value: function() {
          return this._segList.getCoordinates();
        } }, { key: "addMitreJoin", value: function(t, e, s, h) {
          var d = ys.intersection(e.p0, e.p1, s.p0, s.p1);
          if (d !== null && (h <= 0 ? 1 : d.distance(t) / Math.abs(h)) <= this._bufParams.getMitreLimit()) return this._segList.addPt(d), null;
          this.addLimitedMitreJoin(e, s, h, this._bufParams.getMitreLimit());
        } }, { key: "addOutsideTurn", value: function(t, e) {
          if (this._offset0.p1.distance(this._offset1.p0) < this._distance * u.OFFSET_SEGMENT_SEPARATION_FACTOR) return this._segList.addPt(this._offset0.p1), null;
          this._bufParams.getJoinStyle() === U.JOIN_MITRE ? this.addMitreJoin(this._s1, this._offset0, this._offset1, this._distance) : this._bufParams.getJoinStyle() === U.JOIN_BEVEL ? this.addBevelJoin(this._offset0, this._offset1) : (e && this._segList.addPt(this._offset0.p1), this.addCornerFillet(this._s1, this._offset0.p1, this._offset1.p0, t, this._distance), this._segList.addPt(this._offset1.p0));
        } }, { key: "createSquare", value: function(t) {
          this._segList.addPt(new z(t.x + this._distance, t.y + this._distance)), this._segList.addPt(new z(t.x + this._distance, t.y - this._distance)), this._segList.addPt(new z(t.x - this._distance, t.y - this._distance)), this._segList.addPt(new z(t.x - this._distance, t.y + this._distance)), this._segList.closeRing();
        } }, { key: "addSegments", value: function(t, e) {
          this._segList.addPts(t, e);
        } }, { key: "addFirstSegment", value: function() {
          this._segList.addPt(this._offset1.p0);
        } }, { key: "addCornerFillet", value: function(t, e, s, h, d) {
          var y = e.x - t.x, x = e.y - t.y, I = Math.atan2(x, y), T = s.x - t.x, G = s.y - t.y, q = Math.atan2(G, T);
          h === vt.CLOCKWISE ? I <= q && (I += 2 * Math.PI) : I >= q && (I -= 2 * Math.PI), this._segList.addPt(e), this.addDirectedFillet(t, I, q, h, d), this._segList.addPt(s);
        } }, { key: "addLastSegment", value: function() {
          this._segList.addPt(this._offset1.p1);
        } }, { key: "initSideSegments", value: function(t, e, s) {
          this._s1 = t, this._s2 = e, this._side = s, this._seg1.setCoordinates(t, e), this.computeOffsetSegment(this._seg1, s, this._distance, this._offset1);
        } }, { key: "addLimitedMitreJoin", value: function(t, e, s, h) {
          var d = this._seg0.p1, y = _e.angle(d, this._seg0.p0), x = _e.angleBetweenOriented(this._seg0.p0, d, this._seg1.p1) / 2, I = _e.normalize(y + x), T = _e.normalize(I + Math.PI), G = h * s, q = s - G * Math.abs(Math.sin(x)), K = d.x + G * Math.cos(T), rt = d.y + G * Math.sin(T), ot = new z(K, rt), gt = new ve(d, ot), Pt = gt.pointAlongOffset(1, q), lt = gt.pointAlongOffset(1, -q);
          this._side === tt.LEFT ? (this._segList.addPt(Pt), this._segList.addPt(lt)) : (this._segList.addPt(lt), this._segList.addPt(Pt));
        } }, { key: "addDirectedFillet", value: function(t, e, s, h, d) {
          var y = h === vt.CLOCKWISE ? -1 : 1, x = Math.abs(e - s), I = Math.trunc(x / this._filletAngleQuantum + 0.5);
          if (I < 1) return null;
          for (var T = x / I, G = new z(), q = 0; q < I; q++) {
            var K = e + y * q * T;
            G.x = t.x + d * Math.cos(K), G.y = t.y + d * Math.sin(K), this._segList.addPt(G);
          }
        } }, { key: "computeOffsetSegment", value: function(t, e, s, h) {
          var d = e === tt.LEFT ? 1 : -1, y = t.p1.x - t.p0.x, x = t.p1.y - t.p0.y, I = Math.sqrt(y * y + x * x), T = d * s * y / I, G = d * s * x / I;
          h.p0.x = t.p0.x - G, h.p0.y = t.p0.y + T, h.p1.x = t.p1.x - G, h.p1.y = t.p1.y + T;
        } }, { key: "addInsideTurn", value: function(t, e) {
          if (this._li.computeIntersection(this._offset0.p0, this._offset0.p1, this._offset1.p0, this._offset1.p1), this._li.hasIntersection()) this._segList.addPt(this._li.getIntersection(0));
          else if (this._hasNarrowConcaveAngle = !0, this._offset0.p1.distance(this._offset1.p0) < this._distance * u.INSIDE_TURN_VERTEX_SNAP_DISTANCE_FACTOR) this._segList.addPt(this._offset0.p1);
          else {
            if (this._segList.addPt(this._offset0.p1), this._closingSegLengthFactor > 0) {
              var s = new z((this._closingSegLengthFactor * this._offset0.p1.x + this._s1.x) / (this._closingSegLengthFactor + 1), (this._closingSegLengthFactor * this._offset0.p1.y + this._s1.y) / (this._closingSegLengthFactor + 1));
              this._segList.addPt(s);
              var h = new z((this._closingSegLengthFactor * this._offset1.p0.x + this._s1.x) / (this._closingSegLengthFactor + 1), (this._closingSegLengthFactor * this._offset1.p0.y + this._s1.y) / (this._closingSegLengthFactor + 1));
              this._segList.addPt(h);
            } else this._segList.addPt(this._s1);
            this._segList.addPt(this._offset1.p0);
          }
        } }, { key: "createCircle", value: function(t) {
          var e = new z(t.x + this._distance, t.y);
          this._segList.addPt(e), this.addDirectedFillet(t, 0, 2 * Math.PI, -1, this._distance), this._segList.closeRing();
        } }, { key: "addBevelJoin", value: function(t, e) {
          this._segList.addPt(t.p1), this._segList.addPt(e.p0);
        } }, { key: "init", value: function(t) {
          this._distance = t, this._maxCurveSegmentError = t * (1 - Math.cos(this._filletAngleQuantum / 2)), this._segList = new zs(), this._segList.setPrecisionModel(this._precisionModel), this._segList.setMinimumVertexDistance(t * u.CURVE_VERTEX_SNAP_DISTANCE_FACTOR);
        } }, { key: "addCollinear", value: function(t) {
          this._li.computeIntersection(this._s0, this._s1, this._s1, this._s2), this._li.getIntersectionNum() >= 2 && (this._bufParams.getJoinStyle() === U.JOIN_BEVEL || this._bufParams.getJoinStyle() === U.JOIN_MITRE ? (t && this._segList.addPt(this._offset0.p1), this._segList.addPt(this._offset1.p0)) : this.addCornerFillet(this._s1, this._offset0.p1, this._offset1.p0, vt.CLOCKWISE, this._distance));
        } }, { key: "closeRing", value: function() {
          this._segList.closeRing();
        } }, { key: "hasNarrowConcaveAngle", value: function() {
          return this._hasNarrowConcaveAngle;
        } }], [{ key: "constructor_", value: function() {
          this._maxCurveSegmentError = 0, this._filletAngleQuantum = null, this._closingSegLengthFactor = 1, this._segList = null, this._distance = 0, this._precisionModel = null, this._bufParams = null, this._li = null, this._s0 = null, this._s1 = null, this._s2 = null, this._seg0 = new ve(), this._seg1 = new ve(), this._offset0 = new ve(), this._offset1 = new ve(), this._side = 0, this._hasNarrowConcaveAngle = !1;
          var t = arguments[0], e = arguments[1], s = arguments[2];
          this._precisionModel = t, this._bufParams = e, this._li = new qn(), this._filletAngleQuantum = Math.PI / 2 / e.getQuadrantSegments(), e.getQuadrantSegments() >= 8 && e.getJoinStyle() === U.JOIN_ROUND && (this._closingSegLengthFactor = u.MAX_CLOSING_SEG_LEN_FACTOR), this.init(s);
        } }]);
      }();
      pn.OFFSET_SEGMENT_SEPARATION_FACTOR = 1e-3, pn.INSIDE_TURN_VERTEX_SNAP_DISTANCE_FACTOR = 1e-3, pn.CURVE_VERTEX_SNAP_DISTANCE_FACTOR = 1e-6, pn.MAX_CLOSING_SEG_LEN_FACTOR = 80;
      var Yo = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getOffsetCurve", value: function(t, e) {
          if (this._distance = e, e === 0) return null;
          var s = e < 0, h = Math.abs(e), d = this.getSegGen(h);
          t.length <= 1 ? this.computePointCurve(t[0], d) : this.computeOffsetCurve(t, s, d);
          var y = d.getCoordinates();
          return s && re.reverse(y), y;
        } }, { key: "computeSingleSidedBufferCurve", value: function(t, e, s) {
          var h = this.simplifyTolerance(this._distance);
          if (e) {
            s.addSegments(t, !0);
            var d = hn.simplify(t, -h), y = d.length - 1;
            s.initSideSegments(d[y], d[y - 1], tt.LEFT), s.addFirstSegment();
            for (var x = y - 2; x >= 0; x--) s.addNextSegment(d[x], !0);
          } else {
            s.addSegments(t, !1);
            var I = hn.simplify(t, h), T = I.length - 1;
            s.initSideSegments(I[0], I[1], tt.LEFT), s.addFirstSegment();
            for (var G = 2; G <= T; G++) s.addNextSegment(I[G], !0);
          }
          s.addLastSegment(), s.closeRing();
        } }, { key: "computeRingBufferCurve", value: function(t, e, s) {
          var h = this.simplifyTolerance(this._distance);
          e === tt.RIGHT && (h = -h);
          var d = hn.simplify(t, h), y = d.length - 1;
          s.initSideSegments(d[y - 1], d[0], e);
          for (var x = 1; x <= y; x++) {
            var I = x !== 1;
            s.addNextSegment(d[x], I);
          }
          s.closeRing();
        } }, { key: "computeLineBufferCurve", value: function(t, e) {
          var s = this.simplifyTolerance(this._distance), h = hn.simplify(t, s), d = h.length - 1;
          e.initSideSegments(h[0], h[1], tt.LEFT);
          for (var y = 2; y <= d; y++) e.addNextSegment(h[y], !0);
          e.addLastSegment(), e.addLineEndCap(h[d - 1], h[d]);
          var x = hn.simplify(t, -s), I = x.length - 1;
          e.initSideSegments(x[I], x[I - 1], tt.LEFT);
          for (var T = I - 2; T >= 0; T--) e.addNextSegment(x[T], !0);
          e.addLastSegment(), e.addLineEndCap(x[1], x[0]), e.closeRing();
        } }, { key: "computePointCurve", value: function(t, e) {
          switch (this._bufParams.getEndCapStyle()) {
            case U.CAP_ROUND:
              e.createCircle(t);
              break;
            case U.CAP_SQUARE:
              e.createSquare(t);
          }
        } }, { key: "getLineCurve", value: function(t, e) {
          if (this._distance = e, this.isLineOffsetEmpty(e)) return null;
          var s = Math.abs(e), h = this.getSegGen(s);
          if (t.length <= 1) this.computePointCurve(t[0], h);
          else if (this._bufParams.isSingleSided()) {
            var d = e < 0;
            this.computeSingleSidedBufferCurve(t, d, h);
          } else this.computeLineBufferCurve(t, h);
          return h.getCoordinates();
        } }, { key: "getBufferParameters", value: function() {
          return this._bufParams;
        } }, { key: "simplifyTolerance", value: function(t) {
          return t * this._bufParams.getSimplifyFactor();
        } }, { key: "getRingCurve", value: function(t, e, s) {
          if (this._distance = s, t.length <= 2) return this.getLineCurve(t, s);
          if (s === 0) return u.copyCoordinates(t);
          var h = this.getSegGen(s);
          return this.computeRingBufferCurve(t, e, h), h.getCoordinates();
        } }, { key: "computeOffsetCurve", value: function(t, e, s) {
          var h = this.simplifyTolerance(this._distance);
          if (e) {
            var d = hn.simplify(t, -h), y = d.length - 1;
            s.initSideSegments(d[y], d[y - 1], tt.LEFT), s.addFirstSegment();
            for (var x = y - 2; x >= 0; x--) s.addNextSegment(d[x], !0);
          } else {
            var I = hn.simplify(t, h), T = I.length - 1;
            s.initSideSegments(I[0], I[1], tt.LEFT), s.addFirstSegment();
            for (var G = 2; G <= T; G++) s.addNextSegment(I[G], !0);
          }
          s.addLastSegment();
        } }, { key: "isLineOffsetEmpty", value: function(t) {
          return t === 0 || t < 0 && !this._bufParams.isSingleSided();
        } }, { key: "getSegGen", value: function(t) {
          return new pn(this._precisionModel, this._bufParams, t);
        } }], [{ key: "constructor_", value: function() {
          this._distance = 0, this._precisionModel = null, this._bufParams = null;
          var t = arguments[0], e = arguments[1];
          this._precisionModel = t, this._bufParams = e;
        } }, { key: "copyCoordinates", value: function(t) {
          for (var e = new Array(t.length).fill(null), s = 0; s < e.length; s++) e[s] = new z(t[s]);
          return e;
        } }]);
      }(), js = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "findStabbedSegments", value: function() {
          if (arguments.length === 1) {
            for (var u = arguments[0], t = new yt(), e = this._subgraphs.iterator(); e.hasNext(); ) {
              var s = e.next(), h = s.getEnvelope();
              u.y < h.getMinY() || u.y > h.getMaxY() || this.findStabbedSegments(u, s.getDirectedEdges(), t);
            }
            return t;
          }
          if (arguments.length === 3) {
            if (kt(arguments[2], sn) && arguments[0] instanceof z && arguments[1] instanceof As) {
              for (var d = arguments[0], y = arguments[1], x = arguments[2], I = y.getEdge().getCoordinates(), T = 0; T < I.length - 1; T++)
                if (this._seg.p0 = I[T], this._seg.p1 = I[T + 1], this._seg.p0.y > this._seg.p1.y && this._seg.reverse(), !(Math.max(this._seg.p0.x, this._seg.p1.x) < d.x || this._seg.isHorizontal() || d.y < this._seg.p0.y || d.y > this._seg.p1.y || vt.index(this._seg.p0, this._seg.p1, d) === vt.RIGHT)) {
                  var G = y.getDepth(tt.LEFT);
                  this._seg.p0.equals(I[T]) || (G = y.getDepth(tt.RIGHT));
                  var q = new Us(this._seg, G);
                  x.add(q);
                }
            } else if (kt(arguments[2], sn) && arguments[0] instanceof z && kt(arguments[1], sn)) for (var K = arguments[0], rt = arguments[2], ot = arguments[1].iterator(); ot.hasNext(); ) {
              var gt = ot.next();
              gt.isForward() && this.findStabbedSegments(K, gt, rt);
            }
          }
        } }, { key: "getDepth", value: function(u) {
          var t = this.findStabbedSegments(u);
          return t.size() === 0 ? 0 : ui.min(t)._leftDepth;
        } }], [{ key: "constructor_", value: function() {
          this._subgraphs = null, this._seg = new ve();
          var u = arguments[0];
          this._subgraphs = u;
        } }]);
      }(), Us = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "compareTo", value: function(u) {
          var t = u;
          if (this._upwardSeg.minX() >= t._upwardSeg.maxX()) return 1;
          if (this._upwardSeg.maxX() <= t._upwardSeg.minX()) return -1;
          var e = this._upwardSeg.orientationIndex(t._upwardSeg);
          return e !== 0 || (e = -1 * t._upwardSeg.orientationIndex(this._upwardSeg)) !== 0 ? e : this._upwardSeg.compareTo(t._upwardSeg);
        } }, { key: "compareX", value: function(u, t) {
          var e = u.p0.compareTo(t.p0);
          return e !== 0 ? e : u.p1.compareTo(t.p1);
        } }, { key: "toString", value: function() {
          return this._upwardSeg.toString();
        } }, { key: "interfaces_", get: function() {
          return [Z];
        } }], [{ key: "constructor_", value: function() {
          this._upwardSeg = null, this._leftDepth = null;
          var u = arguments[0], t = arguments[1];
          this._upwardSeg = new ve(u), this._leftDepth = t;
        } }]);
      }();
      js.DepthSegment = Us;
      var Gr = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, null, [{ key: "constructor_", value: function() {
          X.constructor_.call(this, "Projective point not representable on the Cartesian plane.");
        } }]);
      }(X), tr = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getY", value: function() {
          var t = this.y / this.w;
          if (ht.isNaN(t) || ht.isInfinite(t)) throw new Gr();
          return t;
        } }, { key: "getX", value: function() {
          var t = this.x / this.w;
          if (ht.isNaN(t) || ht.isInfinite(t)) throw new Gr();
          return t;
        } }, { key: "getCoordinate", value: function() {
          var t = new z();
          return t.x = this.getX(), t.y = this.getY(), t;
        } }], [{ key: "constructor_", value: function() {
          if (this.x = null, this.y = null, this.w = null, arguments.length === 0) this.x = 0, this.y = 0, this.w = 1;
          else if (arguments.length === 1) {
            var t = arguments[0];
            this.x = t.x, this.y = t.y, this.w = 1;
          } else if (arguments.length === 2) {
            if (typeof arguments[0] == "number" && typeof arguments[1] == "number") {
              var e = arguments[0], s = arguments[1];
              this.x = e, this.y = s, this.w = 1;
            } else if (arguments[0] instanceof u && arguments[1] instanceof u) {
              var h = arguments[0], d = arguments[1];
              this.x = h.y * d.w - d.y * h.w, this.y = d.x * h.w - h.x * d.w, this.w = h.x * d.y - d.x * h.y;
            } else if (arguments[0] instanceof z && arguments[1] instanceof z) {
              var y = arguments[0], x = arguments[1];
              this.x = y.y - x.y, this.y = x.x - y.x, this.w = y.x * x.y - x.x * y.y;
            }
          } else if (arguments.length === 3) {
            var I = arguments[0], T = arguments[1], G = arguments[2];
            this.x = I, this.y = T, this.w = G;
          } else if (arguments.length === 4) {
            var q = arguments[0], K = arguments[1], rt = arguments[2], ot = arguments[3], gt = q.y - K.y, Pt = K.x - q.x, lt = q.x * K.y - K.x * q.y, Xt = rt.y - ot.y, fe = ot.x - rt.x, se = rt.x * ot.y - ot.x * rt.y;
            this.x = Pt * se - fe * lt, this.y = Xt * lt - gt * se, this.w = gt * fe - Xt * Pt;
          }
        } }]);
      }(), fu = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "area", value: function() {
          return u.area(this.p0, this.p1, this.p2);
        } }, { key: "signedArea", value: function() {
          return u.signedArea(this.p0, this.p1, this.p2);
        } }, { key: "interpolateZ", value: function(t) {
          if (t === null) throw new Y("Supplied point is null.");
          return u.interpolateZ(t, this.p0, this.p1, this.p2);
        } }, { key: "longestSideLength", value: function() {
          return u.longestSideLength(this.p0, this.p1, this.p2);
        } }, { key: "isAcute", value: function() {
          return u.isAcute(this.p0, this.p1, this.p2);
        } }, { key: "circumcentre", value: function() {
          return u.circumcentre(this.p0, this.p1, this.p2);
        } }, { key: "area3D", value: function() {
          return u.area3D(this.p0, this.p1, this.p2);
        } }, { key: "centroid", value: function() {
          return u.centroid(this.p0, this.p1, this.p2);
        } }, { key: "inCentre", value: function() {
          return u.inCentre(this.p0, this.p1, this.p2);
        } }], [{ key: "constructor_", value: function() {
          this.p0 = null, this.p1 = null, this.p2 = null;
          var t = arguments[0], e = arguments[1], s = arguments[2];
          this.p0 = t, this.p1 = e, this.p2 = s;
        } }, { key: "area", value: function(t, e, s) {
          return Math.abs(((s.x - t.x) * (e.y - t.y) - (e.x - t.x) * (s.y - t.y)) / 2);
        } }, { key: "signedArea", value: function(t, e, s) {
          return ((s.x - t.x) * (e.y - t.y) - (e.x - t.x) * (s.y - t.y)) / 2;
        } }, { key: "det", value: function(t, e, s, h) {
          return t * h - e * s;
        } }, { key: "interpolateZ", value: function(t, e, s, h) {
          var d = e.x, y = e.y, x = s.x - d, I = h.x - d, T = s.y - y, G = h.y - y, q = x * G - I * T, K = t.x - d, rt = t.y - y, ot = (G * K - I * rt) / q, gt = (-T * K + x * rt) / q;
          return e.getZ() + ot * (s.getZ() - e.getZ()) + gt * (h.getZ() - e.getZ());
        } }, { key: "longestSideLength", value: function(t, e, s) {
          var h = t.distance(e), d = e.distance(s), y = s.distance(t), x = h;
          return d > x && (x = d), y > x && (x = y), x;
        } }, { key: "circumcentreDD", value: function(t, e, s) {
          var h = mt.valueOf(t.x).subtract(s.x), d = mt.valueOf(t.y).subtract(s.y), y = mt.valueOf(e.x).subtract(s.x), x = mt.valueOf(e.y).subtract(s.y), I = mt.determinant(h, d, y, x).multiply(2), T = h.sqr().add(d.sqr()), G = y.sqr().add(x.sqr()), q = mt.determinant(d, T, x, G), K = mt.determinant(h, T, y, G), rt = mt.valueOf(s.x).subtract(q.divide(I)).doubleValue(), ot = mt.valueOf(s.y).add(K.divide(I)).doubleValue();
          return new z(rt, ot);
        } }, { key: "isAcute", value: function(t, e, s) {
          return !!_e.isAcute(t, e, s) && !!_e.isAcute(e, s, t) && !!_e.isAcute(s, t, e);
        } }, { key: "circumcentre", value: function(t, e, s) {
          var h = s.x, d = s.y, y = t.x - h, x = t.y - d, I = e.x - h, T = e.y - d, G = 2 * u.det(y, x, I, T), q = u.det(x, y * y + x * x, T, I * I + T * T), K = u.det(y, y * y + x * x, I, I * I + T * T);
          return new z(h - q / G, d + K / G);
        } }, { key: "perpendicularBisector", value: function(t, e) {
          var s = e.x - t.x, h = e.y - t.y, d = new tr(t.x + s / 2, t.y + h / 2, 1), y = new tr(t.x - h + s / 2, t.y + s + h / 2, 1);
          return new tr(d, y);
        } }, { key: "angleBisector", value: function(t, e, s) {
          var h = e.distance(t), d = h / (h + e.distance(s)), y = s.x - t.x, x = s.y - t.y;
          return new z(t.x + d * y, t.y + d * x);
        } }, { key: "area3D", value: function(t, e, s) {
          var h = e.x - t.x, d = e.y - t.y, y = e.getZ() - t.getZ(), x = s.x - t.x, I = s.y - t.y, T = s.getZ() - t.getZ(), G = d * T - y * I, q = y * x - h * T, K = h * I - d * x, rt = G * G + q * q + K * K, ot = Math.sqrt(rt) / 2;
          return ot;
        } }, { key: "centroid", value: function(t, e, s) {
          var h = (t.x + e.x + s.x) / 3, d = (t.y + e.y + s.y) / 3;
          return new z(h, d);
        } }, { key: "inCentre", value: function(t, e, s) {
          var h = e.distance(s), d = t.distance(s), y = t.distance(e), x = h + d + y, I = (h * t.x + d * e.x + y * s.x) / x, T = (h * t.y + d * e.y + y * s.y) / x;
          return new z(I, T);
        } }]);
      }(), Xo = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "addRingSide", value: function(u, t, e, s, h) {
          if (t === 0 && u.length < Si.MINIMUM_VALID_SIZE) return null;
          var d = s, y = h;
          u.length >= Si.MINIMUM_VALID_SIZE && vt.isCCW(u) && (d = h, y = s, e = tt.opposite(e));
          var x = this._curveBuilder.getRingCurve(u, e, t);
          this.addCurve(x, d, y);
        } }, { key: "addRingBothSides", value: function(u, t) {
          this.addRingSide(u, t, tt.LEFT, R.EXTERIOR, R.INTERIOR), this.addRingSide(u, t, tt.RIGHT, R.INTERIOR, R.EXTERIOR);
        } }, { key: "addPoint", value: function(u) {
          if (this._distance <= 0) return null;
          var t = u.getCoordinates(), e = this._curveBuilder.getLineCurve(t, this._distance);
          this.addCurve(e, R.EXTERIOR, R.INTERIOR);
        } }, { key: "addPolygon", value: function(u) {
          var t = this._distance, e = tt.LEFT;
          this._distance < 0 && (t = -this._distance, e = tt.RIGHT);
          var s = u.getExteriorRing(), h = re.removeRepeatedPoints(s.getCoordinates());
          if (this._distance < 0 && this.isErodedCompletely(s, this._distance) || this._distance <= 0 && h.length < 3) return null;
          this.addRingSide(h, t, e, R.EXTERIOR, R.INTERIOR);
          for (var d = 0; d < u.getNumInteriorRing(); d++) {
            var y = u.getInteriorRingN(d), x = re.removeRepeatedPoints(y.getCoordinates());
            this._distance > 0 && this.isErodedCompletely(y, -this._distance) || this.addRingSide(x, t, tt.opposite(e), R.INTERIOR, R.EXTERIOR);
          }
        } }, { key: "isTriangleErodedCompletely", value: function(u, t) {
          var e = new fu(u[0], u[1], u[2]), s = e.inCentre();
          return un.pointToSegment(s, e.p0, e.p1) < Math.abs(t);
        } }, { key: "addLineString", value: function(u) {
          if (this._curveBuilder.isLineOffsetEmpty(this._distance)) return null;
          var t = re.removeRepeatedPoints(u.getCoordinates());
          if (re.isRing(t) && !this._curveBuilder.getBufferParameters().isSingleSided()) this.addRingBothSides(t, this._distance);
          else {
            var e = this._curveBuilder.getLineCurve(t, this._distance);
            this.addCurve(e, R.EXTERIOR, R.INTERIOR);
          }
        } }, { key: "addCurve", value: function(u, t, e) {
          if (u === null || u.length < 2) return null;
          var s = new yn(u, new Xe(0, R.BOUNDARY, t, e));
          this._curveList.add(s);
        } }, { key: "getCurves", value: function() {
          return this.add(this._inputGeom), this._curveList;
        } }, { key: "add", value: function(u) {
          if (u.isEmpty()) return null;
          if (u instanceof br) this.addPolygon(u);
          else if (u instanceof Ki) this.addLineString(u);
          else if (u instanceof vs) this.addPoint(u);
          else if (u instanceof xs) this.addCollection(u);
          else if (u instanceof Ss) this.addCollection(u);
          else if (u instanceof ks) this.addCollection(u);
          else {
            if (!(u instanceof Ce)) throw new qe(u.getGeometryType());
            this.addCollection(u);
          }
        } }, { key: "isErodedCompletely", value: function(u, t) {
          var e = u.getCoordinates();
          if (e.length < 4) return t < 0;
          if (e.length === 4) return this.isTriangleErodedCompletely(e, t);
          var s = u.getEnvelopeInternal(), h = Math.min(s.getHeight(), s.getWidth());
          return t < 0 && 2 * Math.abs(t) > h;
        } }, { key: "addCollection", value: function(u) {
          for (var t = 0; t < u.getNumGeometries(); t++) {
            var e = u.getGeometryN(t);
            this.add(e);
          }
        } }], [{ key: "constructor_", value: function() {
          this._inputGeom = null, this._distance = null, this._curveBuilder = null, this._curveList = new yt();
          var u = arguments[0], t = arguments[1], e = arguments[2];
          this._inputGeom = u, this._distance = t, this._curveBuilder = e;
        } }]);
      }(), Ys = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "locate", value: function(u) {
        } }]);
      }(), Xs = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "next", value: function() {
          if (this._atStart) return this._atStart = !1, u.isAtomic(this._parent) && this._index++, this._parent;
          if (this._subcollectionIterator !== null) {
            if (this._subcollectionIterator.hasNext()) return this._subcollectionIterator.next();
            this._subcollectionIterator = null;
          }
          if (this._index >= this._max) throw new we();
          var t = this._parent.getGeometryN(this._index++);
          return t instanceof Ce ? (this._subcollectionIterator = new u(t), this._subcollectionIterator.next()) : t;
        } }, { key: "remove", value: function() {
          throw new qe(this.getClass().getName());
        } }, { key: "hasNext", value: function() {
          if (this._atStart) return !0;
          if (this._subcollectionIterator !== null) {
            if (this._subcollectionIterator.hasNext()) return !0;
            this._subcollectionIterator = null;
          }
          return !(this._index >= this._max);
        } }, { key: "interfaces_", get: function() {
          return [jo];
        } }], [{ key: "constructor_", value: function() {
          this._parent = null, this._atStart = null, this._max = null, this._index = null, this._subcollectionIterator = null;
          var t = arguments[0];
          this._parent = t, this._atStart = !0, this._index = 0, this._max = t.getNumGeometries();
        } }, { key: "isAtomic", value: function(t) {
          return !(t instanceof Ce);
        } }]);
      }(), Vo = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "locate", value: function(t) {
          return u.locate(t, this._geom);
        } }, { key: "interfaces_", get: function() {
          return [Ys];
        } }], [{ key: "constructor_", value: function() {
          this._geom = null;
          var t = arguments[0];
          this._geom = t;
        } }, { key: "locatePointInPolygon", value: function(t, e) {
          if (e.isEmpty()) return R.EXTERIOR;
          var s = e.getExteriorRing(), h = u.locatePointInRing(t, s);
          if (h !== R.INTERIOR) return h;
          for (var d = 0; d < e.getNumInteriorRing(); d++) {
            var y = e.getInteriorRingN(d), x = u.locatePointInRing(t, y);
            if (x === R.BOUNDARY) return R.BOUNDARY;
            if (x === R.INTERIOR) return R.EXTERIOR;
          }
          return R.INTERIOR;
        } }, { key: "locatePointInRing", value: function(t, e) {
          return e.getEnvelopeInternal().intersects(t) ? Cs.locateInRing(t, e.getCoordinates()) : R.EXTERIOR;
        } }, { key: "containsPointInPolygon", value: function(t, e) {
          return R.EXTERIOR !== u.locatePointInPolygon(t, e);
        } }, { key: "locateInGeometry", value: function(t, e) {
          if (e instanceof br) return u.locatePointInPolygon(t, e);
          if (e instanceof Ce) for (var s = new Xs(e); s.hasNext(); ) {
            var h = s.next();
            if (h !== e) {
              var d = u.locateInGeometry(t, h);
              if (d !== R.EXTERIOR) return d;
            }
          }
          return R.EXTERIOR;
        } }, { key: "isContained", value: function(t, e) {
          return R.EXTERIOR !== u.locate(t, e);
        } }, { key: "locate", value: function(t, e) {
          return e.isEmpty() ? R.EXTERIOR : e.getEnvelopeInternal().intersects(t) ? u.locateInGeometry(t, e) : R.EXTERIOR;
        } }]);
      }(), gu = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getNextCW", value: function(u) {
          this.getEdges();
          var t = this._edgeList.indexOf(u), e = t - 1;
          return t === 0 && (e = this._edgeList.size() - 1), this._edgeList.get(e);
        } }, { key: "propagateSideLabels", value: function(u) {
          for (var t = R.NONE, e = this.iterator(); e.hasNext(); ) {
            var s = e.next().getLabel();
            s.isArea(u) && s.getLocation(u, tt.LEFT) !== R.NONE && (t = s.getLocation(u, tt.LEFT));
          }
          if (t === R.NONE) return null;
          for (var h = t, d = this.iterator(); d.hasNext(); ) {
            var y = d.next(), x = y.getLabel();
            if (x.getLocation(u, tt.ON) === R.NONE && x.setLocation(u, tt.ON, h), x.isArea(u)) {
              var I = x.getLocation(u, tt.LEFT), T = x.getLocation(u, tt.RIGHT);
              if (T !== R.NONE) {
                if (T !== h) throw new an("side location conflict", y.getCoordinate());
                I === R.NONE && It.shouldNeverReachHere("found single null side (at " + y.getCoordinate() + ")"), h = I;
              } else It.isTrue(x.getLocation(u, tt.LEFT) === R.NONE, "found single null side"), x.setLocation(u, tt.RIGHT, h), x.setLocation(u, tt.LEFT, h);
            }
          }
        } }, { key: "getCoordinate", value: function() {
          var u = this.iterator();
          return u.hasNext() ? u.next().getCoordinate() : null;
        } }, { key: "print", value: function(u) {
          ze.out.println("EdgeEndStar:   " + this.getCoordinate());
          for (var t = this.iterator(); t.hasNext(); )
            t.next().print(u);
        } }, { key: "isAreaLabelsConsistent", value: function(u) {
          return this.computeEdgeEndLabels(u.getBoundaryNodeRule()), this.checkAreaLabelsConsistent(0);
        } }, { key: "checkAreaLabelsConsistent", value: function(u) {
          var t = this.getEdges();
          if (t.size() <= 0) return !0;
          var e = t.size() - 1, s = t.get(e).getLabel().getLocation(u, tt.LEFT);
          It.isTrue(s !== R.NONE, "Found unlabelled area edge");
          for (var h = s, d = this.iterator(); d.hasNext(); ) {
            var y = d.next().getLabel();
            It.isTrue(y.isArea(u), "Found non-area edge");
            var x = y.getLocation(u, tt.LEFT), I = y.getLocation(u, tt.RIGHT);
            if (x === I || I !== h) return !1;
            h = x;
          }
          return !0;
        } }, { key: "findIndex", value: function(u) {
          this.iterator();
          for (var t = 0; t < this._edgeList.size(); t++)
            if (this._edgeList.get(t) === u) return t;
          return -1;
        } }, { key: "iterator", value: function() {
          return this.getEdges().iterator();
        } }, { key: "getEdges", value: function() {
          return this._edgeList === null && (this._edgeList = new yt(this._edgeMap.values())), this._edgeList;
        } }, { key: "getLocation", value: function(u, t, e) {
          return this._ptInAreaLocation[u] === R.NONE && (this._ptInAreaLocation[u] = Vo.locate(t, e[u].getGeometry())), this._ptInAreaLocation[u];
        } }, { key: "toString", value: function() {
          var u = new bn();
          u.append("EdgeEndStar:   " + this.getCoordinate()), u.append(`
`);
          for (var t = this.iterator(); t.hasNext(); ) {
            var e = t.next();
            u.append(e), u.append(`
`);
          }
          return u.toString();
        } }, { key: "computeEdgeEndLabels", value: function(u) {
          for (var t = this.iterator(); t.hasNext(); )
            t.next().computeLabel(u);
        } }, { key: "computeLabelling", value: function(u) {
          this.computeEdgeEndLabels(u[0].getBoundaryNodeRule()), this.propagateSideLabels(0), this.propagateSideLabels(1);
          for (var t = [!1, !1], e = this.iterator(); e.hasNext(); ) for (var s = e.next().getLabel(), h = 0; h < 2; h++) s.isLine(h) && s.getLocation(h) === R.BOUNDARY && (t[h] = !0);
          for (var d = this.iterator(); d.hasNext(); ) for (var y = d.next(), x = y.getLabel(), I = 0; I < 2; I++) if (x.isAnyNull(I)) {
            var T = R.NONE;
            if (t[I]) T = R.EXTERIOR;
            else {
              var G = y.getCoordinate();
              T = this.getLocation(I, G, u);
            }
            x.setAllLocationsIfNull(I, T);
          }
        } }, { key: "getDegree", value: function() {
          return this._edgeMap.size();
        } }, { key: "insertEdgeEnd", value: function(u, t) {
          this._edgeMap.put(u, t), this._edgeList = null;
        } }], [{ key: "constructor_", value: function() {
          this._edgeMap = new Bt(), this._edgeList = null, this._ptInAreaLocation = [R.NONE, R.NONE];
        } }]);
      }(), Te = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "linkResultDirectedEdges", value: function() {
          this.getResultAreaEdges();
          for (var e = null, s = null, h = this._SCANNING_FOR_INCOMING, d = 0; d < this._resultAreaEdgeList.size(); d++) {
            var y = this._resultAreaEdgeList.get(d), x = y.getSym();
            if (y.getLabel().isArea()) switch (e === null && y.isInResult() && (e = y), h) {
              case this._SCANNING_FOR_INCOMING:
                if (!x.isInResult()) continue;
                s = x, h = this._LINKING_TO_OUTGOING;
                break;
              case this._LINKING_TO_OUTGOING:
                if (!y.isInResult()) continue;
                s.setNext(y), h = this._SCANNING_FOR_INCOMING;
            }
          }
          if (h === this._LINKING_TO_OUTGOING) {
            if (e === null) throw new an("no outgoing dirEdge found", this.getCoordinate());
            It.isTrue(e.isInResult(), "unable to link last incoming dirEdge"), s.setNext(e);
          }
        } }, { key: "insert", value: function(e) {
          var s = e;
          this.insertEdgeEnd(s, s);
        } }, { key: "getRightmostEdge", value: function() {
          var e = this.getEdges(), s = e.size();
          if (s < 1) return null;
          var h = e.get(0);
          if (s === 1) return h;
          var d = e.get(s - 1), y = h.getQuadrant(), x = d.getQuadrant();
          return pe.isNorthern(y) && pe.isNorthern(x) ? h : pe.isNorthern(y) || pe.isNorthern(x) ? h.getDy() !== 0 ? h : d.getDy() !== 0 ? d : (It.shouldNeverReachHere("found two horizontal edges incident on node"), null) : d;
        } }, { key: "print", value: function(e) {
          ze.out.println("DirectedEdgeStar: " + this.getCoordinate());
          for (var s = this.iterator(); s.hasNext(); ) {
            var h = s.next();
            e.print("out "), h.print(e), e.println(), e.print("in "), h.getSym().print(e), e.println();
          }
        } }, { key: "getResultAreaEdges", value: function() {
          if (this._resultAreaEdgeList !== null) return this._resultAreaEdgeList;
          this._resultAreaEdgeList = new yt();
          for (var e = this.iterator(); e.hasNext(); ) {
            var s = e.next();
            (s.isInResult() || s.getSym().isInResult()) && this._resultAreaEdgeList.add(s);
          }
          return this._resultAreaEdgeList;
        } }, { key: "updateLabelling", value: function(e) {
          for (var s = this.iterator(); s.hasNext(); ) {
            var h = s.next().getLabel();
            h.setAllLocationsIfNull(0, e.getLocation(0)), h.setAllLocationsIfNull(1, e.getLocation(1));
          }
        } }, { key: "linkAllDirectedEdges", value: function() {
          this.getEdges();
          for (var e = null, s = null, h = this._edgeList.size() - 1; h >= 0; h--) {
            var d = this._edgeList.get(h), y = d.getSym();
            s === null && (s = y), e !== null && y.setNext(e), e = d;
          }
          s.setNext(e);
        } }, { key: "computeDepths", value: function() {
          if (arguments.length === 1) {
            var e = arguments[0], s = this.findIndex(e), h = e.getDepth(tt.LEFT), d = e.getDepth(tt.RIGHT), y = this.computeDepths(s + 1, this._edgeList.size(), h);
            if (this.computeDepths(0, s, y) !== d) throw new an("depth mismatch at " + e.getCoordinate());
          } else if (arguments.length === 3) {
            for (var x = arguments[1], I = arguments[2], T = arguments[0]; T < x; T++) {
              var G = this._edgeList.get(T);
              G.setEdgeDepths(tt.RIGHT, I), I = G.getDepth(tt.LEFT);
            }
            return I;
          }
        } }, { key: "mergeSymLabels", value: function() {
          for (var e = this.iterator(); e.hasNext(); ) {
            var s = e.next();
            s.getLabel().merge(s.getSym().getLabel());
          }
        } }, { key: "linkMinimalDirectedEdges", value: function(e) {
          for (var s = null, h = null, d = this._SCANNING_FOR_INCOMING, y = this._resultAreaEdgeList.size() - 1; y >= 0; y--) {
            var x = this._resultAreaEdgeList.get(y), I = x.getSym();
            switch (s === null && x.getEdgeRing() === e && (s = x), d) {
              case this._SCANNING_FOR_INCOMING:
                if (I.getEdgeRing() !== e) continue;
                h = I, d = this._LINKING_TO_OUTGOING;
                break;
              case this._LINKING_TO_OUTGOING:
                if (x.getEdgeRing() !== e) continue;
                h.setNextMin(x), d = this._SCANNING_FOR_INCOMING;
            }
          }
          d === this._LINKING_TO_OUTGOING && (It.isTrue(s !== null, "found null for first outgoing dirEdge"), It.isTrue(s.getEdgeRing() === e, "unable to link last incoming dirEdge"), h.setNextMin(s));
        } }, { key: "getOutgoingDegree", value: function() {
          if (arguments.length === 0) {
            for (var e = 0, s = this.iterator(); s.hasNext(); )
              s.next().isInResult() && e++;
            return e;
          }
          if (arguments.length === 1) {
            for (var h = arguments[0], d = 0, y = this.iterator(); y.hasNext(); )
              y.next().getEdgeRing() === h && d++;
            return d;
          }
        } }, { key: "getLabel", value: function() {
          return this._label;
        } }, { key: "findCoveredLineEdges", value: function() {
          for (var e = R.NONE, s = this.iterator(); s.hasNext(); ) {
            var h = s.next(), d = h.getSym();
            if (!h.isLineEdge()) {
              if (h.isInResult()) {
                e = R.INTERIOR;
                break;
              }
              if (d.isInResult()) {
                e = R.EXTERIOR;
                break;
              }
            }
          }
          if (e === R.NONE) return null;
          for (var y = e, x = this.iterator(); x.hasNext(); ) {
            var I = x.next(), T = I.getSym();
            I.isLineEdge() ? I.getEdge().setCovered(y === R.INTERIOR) : (I.isInResult() && (y = R.EXTERIOR), T.isInResult() && (y = R.INTERIOR));
          }
        } }, { key: "computeLabelling", value: function(e) {
          C(t, "computeLabelling", this, 1).call(this, e), this._label = new Xe(R.NONE);
          for (var s = this.iterator(); s.hasNext(); ) for (var h = s.next().getEdge().getLabel(), d = 0; d < 2; d++) {
            var y = h.getLocation(d);
            y !== R.INTERIOR && y !== R.BOUNDARY || this._label.setLocation(d, R.INTERIOR);
          }
        } }], [{ key: "constructor_", value: function() {
          this._resultAreaEdgeList = null, this._label = null, this._SCANNING_FOR_INCOMING = 1, this._LINKING_TO_OUTGOING = 2;
        } }]);
      }(gu), Vs = function(u) {
        function t() {
          return c(this, t), l(this, t);
        }
        return E(t, u), g(t, [{ key: "createNode", value: function(e) {
          return new Or(e, new Te());
        } }]);
      }(au), bi = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "compareTo", value: function(t) {
          var e = t;
          return u.compareOriented(this._pts, this._orientation, e._pts, e._orientation);
        } }, { key: "interfaces_", get: function() {
          return [Z];
        } }], [{ key: "constructor_", value: function() {
          this._pts = null, this._orientation = null;
          var t = arguments[0];
          this._pts = t, this._orientation = u.orientation(t);
        } }, { key: "orientation", value: function(t) {
          return re.increasingDirection(t) === 1;
        } }, { key: "compareOriented", value: function(t, e, s, h) {
          for (var d = e ? 1 : -1, y = h ? 1 : -1, x = e ? t.length : -1, I = h ? s.length : -1, T = e ? 0 : t.length - 1, G = h ? 0 : s.length - 1; ; ) {
            var q = t[T].compareTo(s[G]);
            if (q !== 0) return q;
            var K = (T += d) === x, rt = (G += y) === I;
            if (K && !rt) return -1;
            if (!K && rt) return 1;
            if (K && rt) return 0;
          }
        } }]);
      }(), du = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "print", value: function(u) {
          u.print("MULTILINESTRING ( ");
          for (var t = 0; t < this._edges.size(); t++) {
            var e = this._edges.get(t);
            t > 0 && u.print(","), u.print("(");
            for (var s = e.getCoordinates(), h = 0; h < s.length; h++) h > 0 && u.print(","), u.print(s[h].x + " " + s[h].y);
            u.println(")");
          }
          u.print(")  ");
        } }, { key: "addAll", value: function(u) {
          for (var t = u.iterator(); t.hasNext(); ) this.add(t.next());
        } }, { key: "findEdgeIndex", value: function(u) {
          for (var t = 0; t < this._edges.size(); t++) if (this._edges.get(t).equals(u)) return t;
          return -1;
        } }, { key: "iterator", value: function() {
          return this._edges.iterator();
        } }, { key: "getEdges", value: function() {
          return this._edges;
        } }, { key: "get", value: function(u) {
          return this._edges.get(u);
        } }, { key: "findEqualEdge", value: function(u) {
          var t = new bi(u.getCoordinates());
          return this._ocaMap.get(t);
        } }, { key: "add", value: function(u) {
          this._edges.add(u);
          var t = new bi(u.getCoordinates());
          this._ocaMap.put(t, u);
        } }], [{ key: "constructor_", value: function() {
          this._edges = new yt(), this._ocaMap = new Bt();
        } }]);
      }(), Ws = function() {
        return g(function u() {
          c(this, u);
        }, [{ key: "processIntersections", value: function(u, t, e, s) {
        } }, { key: "isDone", value: function() {
        } }]);
      }(), Wo = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "isTrivialIntersection", value: function(t, e, s, h) {
          if (t === s && this._li.getIntersectionNum() === 1) {
            if (u.isAdjacentSegments(e, h)) return !0;
            if (t.isClosed()) {
              var d = t.size() - 1;
              if (e === 0 && h === d || h === 0 && e === d) return !0;
            }
          }
          return !1;
        } }, { key: "getProperIntersectionPoint", value: function() {
          return this._properIntersectionPoint;
        } }, { key: "hasProperInteriorIntersection", value: function() {
          return this._hasProperInterior;
        } }, { key: "getLineIntersector", value: function() {
          return this._li;
        } }, { key: "hasProperIntersection", value: function() {
          return this._hasProper;
        } }, { key: "processIntersections", value: function(t, e, s, h) {
          if (t === s && e === h) return null;
          this.numTests++;
          var d = t.getCoordinates()[e], y = t.getCoordinates()[e + 1], x = s.getCoordinates()[h], I = s.getCoordinates()[h + 1];
          this._li.computeIntersection(d, y, x, I), this._li.hasIntersection() && (this.numIntersections++, this._li.isInteriorIntersection() && (this.numInteriorIntersections++, this._hasInterior = !0), this.isTrivialIntersection(t, e, s, h) || (this._hasIntersection = !0, t.addIntersections(this._li, e, 0), s.addIntersections(this._li, h, 1), this._li.isProper() && (this.numProperIntersections++, this._hasProper = !0, this._hasProperInterior = !0)));
        } }, { key: "hasIntersection", value: function() {
          return this._hasIntersection;
        } }, { key: "isDone", value: function() {
          return !1;
        } }, { key: "hasInteriorIntersection", value: function() {
          return this._hasInterior;
        } }, { key: "interfaces_", get: function() {
          return [Ws];
        } }], [{ key: "constructor_", value: function() {
          this._hasIntersection = !1, this._hasProper = !1, this._hasProperInterior = !1, this._hasInterior = !1, this._properIntersectionPoint = null, this._li = null, this._isSelfIntersection = null, this.numIntersections = 0, this.numInteriorIntersections = 0, this.numProperIntersections = 0, this.numTests = 0;
          var t = arguments[0];
          this._li = t;
        } }, { key: "isAdjacentSegments", value: function(t, e) {
          return Math.abs(t - e) === 1;
        } }]);
      }(), Ho = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getSegmentIndex", value: function() {
          return this.segmentIndex;
        } }, { key: "getCoordinate", value: function() {
          return this.coord;
        } }, { key: "print", value: function(u) {
          u.print(this.coord), u.print(" seg # = " + this.segmentIndex), u.println(" dist = " + this.dist);
        } }, { key: "compareTo", value: function(u) {
          var t = u;
          return this.compare(t.segmentIndex, t.dist);
        } }, { key: "isEndPoint", value: function(u) {
          return this.segmentIndex === 0 && this.dist === 0 || this.segmentIndex === u;
        } }, { key: "toString", value: function() {
          return this.coord + " seg # = " + this.segmentIndex + " dist = " + this.dist;
        } }, { key: "getDistance", value: function() {
          return this.dist;
        } }, { key: "compare", value: function(u, t) {
          return this.segmentIndex < u ? -1 : this.segmentIndex > u ? 1 : this.dist < t ? -1 : this.dist > t ? 1 : 0;
        } }, { key: "interfaces_", get: function() {
          return [Z];
        } }], [{ key: "constructor_", value: function() {
          this.coord = null, this.segmentIndex = null, this.dist = null;
          var u = arguments[0], t = arguments[1], e = arguments[2];
          this.coord = new z(u), this.segmentIndex = t, this.dist = e;
        } }]);
      }(), Ko = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "print", value: function(u) {
          u.println("Intersections:");
          for (var t = this.iterator(); t.hasNext(); )
            t.next().print(u);
        } }, { key: "iterator", value: function() {
          return this._nodeMap.values().iterator();
        } }, { key: "addSplitEdges", value: function(u) {
          this.addEndpoints();
          for (var t = this.iterator(), e = t.next(); t.hasNext(); ) {
            var s = t.next(), h = this.createSplitEdge(e, s);
            u.add(h), e = s;
          }
        } }, { key: "addEndpoints", value: function() {
          var u = this.edge.pts.length - 1;
          this.add(this.edge.pts[0], 0, 0), this.add(this.edge.pts[u], u, 0);
        } }, { key: "createSplitEdge", value: function(u, t) {
          var e = t.segmentIndex - u.segmentIndex + 2, s = this.edge.pts[t.segmentIndex], h = t.dist > 0 || !t.coord.equals2D(s);
          h || e--;
          var d = new Array(e).fill(null), y = 0;
          d[y++] = new z(u.coord);
          for (var x = u.segmentIndex + 1; x <= t.segmentIndex; x++) d[y++] = this.edge.pts[x];
          return h && (d[y] = t.coord), new Dr(d, new Xe(this.edge._label));
        } }, { key: "add", value: function(u, t, e) {
          var s = new Ho(u, t, e), h = this._nodeMap.get(s);
          return h !== null ? h : (this._nodeMap.put(s, s), s);
        } }, { key: "isIntersection", value: function(u) {
          for (var t = this.iterator(); t.hasNext(); )
            if (t.next().coord.equals(u)) return !0;
          return !1;
        } }], [{ key: "constructor_", value: function() {
          this._nodeMap = new Bt(), this.edge = null;
          var u = arguments[0];
          this.edge = u;
        } }]);
      }(), Zo = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "isIntersects", value: function() {
          return !this.isDisjoint();
        } }, { key: "isCovers", value: function() {
          return (u.isTrue(this._matrix[R.INTERIOR][R.INTERIOR]) || u.isTrue(this._matrix[R.INTERIOR][R.BOUNDARY]) || u.isTrue(this._matrix[R.BOUNDARY][R.INTERIOR]) || u.isTrue(this._matrix[R.BOUNDARY][R.BOUNDARY])) && this._matrix[R.EXTERIOR][R.INTERIOR] === nt.FALSE && this._matrix[R.EXTERIOR][R.BOUNDARY] === nt.FALSE;
        } }, { key: "isCoveredBy", value: function() {
          return (u.isTrue(this._matrix[R.INTERIOR][R.INTERIOR]) || u.isTrue(this._matrix[R.INTERIOR][R.BOUNDARY]) || u.isTrue(this._matrix[R.BOUNDARY][R.INTERIOR]) || u.isTrue(this._matrix[R.BOUNDARY][R.BOUNDARY])) && this._matrix[R.INTERIOR][R.EXTERIOR] === nt.FALSE && this._matrix[R.BOUNDARY][R.EXTERIOR] === nt.FALSE;
        } }, { key: "set", value: function() {
          if (arguments.length === 1) for (var t = arguments[0], e = 0; e < t.length; e++) {
            var s = Math.trunc(e / 3), h = e % 3;
            this._matrix[s][h] = nt.toDimensionValue(t.charAt(e));
          }
          else if (arguments.length === 3) {
            var d = arguments[0], y = arguments[1], x = arguments[2];
            this._matrix[d][y] = x;
          }
        } }, { key: "isContains", value: function() {
          return u.isTrue(this._matrix[R.INTERIOR][R.INTERIOR]) && this._matrix[R.EXTERIOR][R.INTERIOR] === nt.FALSE && this._matrix[R.EXTERIOR][R.BOUNDARY] === nt.FALSE;
        } }, { key: "setAtLeast", value: function() {
          if (arguments.length === 1) for (var t = arguments[0], e = 0; e < t.length; e++) {
            var s = Math.trunc(e / 3), h = e % 3;
            this.setAtLeast(s, h, nt.toDimensionValue(t.charAt(e)));
          }
          else if (arguments.length === 3) {
            var d = arguments[0], y = arguments[1], x = arguments[2];
            this._matrix[d][y] < x && (this._matrix[d][y] = x);
          }
        } }, { key: "setAtLeastIfValid", value: function(t, e, s) {
          t >= 0 && e >= 0 && this.setAtLeast(t, e, s);
        } }, { key: "isWithin", value: function() {
          return u.isTrue(this._matrix[R.INTERIOR][R.INTERIOR]) && this._matrix[R.INTERIOR][R.EXTERIOR] === nt.FALSE && this._matrix[R.BOUNDARY][R.EXTERIOR] === nt.FALSE;
        } }, { key: "isTouches", value: function(t, e) {
          return t > e ? this.isTouches(e, t) : (t === nt.A && e === nt.A || t === nt.L && e === nt.L || t === nt.L && e === nt.A || t === nt.P && e === nt.A || t === nt.P && e === nt.L) && this._matrix[R.INTERIOR][R.INTERIOR] === nt.FALSE && (u.isTrue(this._matrix[R.INTERIOR][R.BOUNDARY]) || u.isTrue(this._matrix[R.BOUNDARY][R.INTERIOR]) || u.isTrue(this._matrix[R.BOUNDARY][R.BOUNDARY]));
        } }, { key: "isOverlaps", value: function(t, e) {
          return t === nt.P && e === nt.P || t === nt.A && e === nt.A ? u.isTrue(this._matrix[R.INTERIOR][R.INTERIOR]) && u.isTrue(this._matrix[R.INTERIOR][R.EXTERIOR]) && u.isTrue(this._matrix[R.EXTERIOR][R.INTERIOR]) : t === nt.L && e === nt.L && this._matrix[R.INTERIOR][R.INTERIOR] === 1 && u.isTrue(this._matrix[R.INTERIOR][R.EXTERIOR]) && u.isTrue(this._matrix[R.EXTERIOR][R.INTERIOR]);
        } }, { key: "isEquals", value: function(t, e) {
          return t === e && u.isTrue(this._matrix[R.INTERIOR][R.INTERIOR]) && this._matrix[R.INTERIOR][R.EXTERIOR] === nt.FALSE && this._matrix[R.BOUNDARY][R.EXTERIOR] === nt.FALSE && this._matrix[R.EXTERIOR][R.INTERIOR] === nt.FALSE && this._matrix[R.EXTERIOR][R.BOUNDARY] === nt.FALSE;
        } }, { key: "toString", value: function() {
          for (var t = new ii("123456789"), e = 0; e < 3; e++) for (var s = 0; s < 3; s++) t.setCharAt(3 * e + s, nt.toDimensionSymbol(this._matrix[e][s]));
          return t.toString();
        } }, { key: "setAll", value: function(t) {
          for (var e = 0; e < 3; e++) for (var s = 0; s < 3; s++) this._matrix[e][s] = t;
        } }, { key: "get", value: function(t, e) {
          return this._matrix[t][e];
        } }, { key: "transpose", value: function() {
          var t = this._matrix[1][0];
          return this._matrix[1][0] = this._matrix[0][1], this._matrix[0][1] = t, t = this._matrix[2][0], this._matrix[2][0] = this._matrix[0][2], this._matrix[0][2] = t, t = this._matrix[2][1], this._matrix[2][1] = this._matrix[1][2], this._matrix[1][2] = t, this;
        } }, { key: "matches", value: function(t) {
          if (t.length !== 9) throw new Y("Should be length 9: " + t);
          for (var e = 0; e < 3; e++) for (var s = 0; s < 3; s++) if (!u.matches(this._matrix[e][s], t.charAt(3 * e + s))) return !1;
          return !0;
        } }, { key: "add", value: function(t) {
          for (var e = 0; e < 3; e++) for (var s = 0; s < 3; s++) this.setAtLeast(e, s, t.get(e, s));
        } }, { key: "isDisjoint", value: function() {
          return this._matrix[R.INTERIOR][R.INTERIOR] === nt.FALSE && this._matrix[R.INTERIOR][R.BOUNDARY] === nt.FALSE && this._matrix[R.BOUNDARY][R.INTERIOR] === nt.FALSE && this._matrix[R.BOUNDARY][R.BOUNDARY] === nt.FALSE;
        } }, { key: "isCrosses", value: function(t, e) {
          return t === nt.P && e === nt.L || t === nt.P && e === nt.A || t === nt.L && e === nt.A ? u.isTrue(this._matrix[R.INTERIOR][R.INTERIOR]) && u.isTrue(this._matrix[R.INTERIOR][R.EXTERIOR]) : t === nt.L && e === nt.P || t === nt.A && e === nt.P || t === nt.A && e === nt.L ? u.isTrue(this._matrix[R.INTERIOR][R.INTERIOR]) && u.isTrue(this._matrix[R.EXTERIOR][R.INTERIOR]) : t === nt.L && e === nt.L && this._matrix[R.INTERIOR][R.INTERIOR] === 0;
        } }, { key: "interfaces_", get: function() {
          return [et];
        } }], [{ key: "constructor_", value: function() {
          if (this._matrix = null, arguments.length === 0) this._matrix = Array(3).fill().map(function() {
            return Array(3);
          }), this.setAll(nt.FALSE);
          else if (arguments.length === 1) {
            if (typeof arguments[0] == "string") {
              var t = arguments[0];
              u.constructor_.call(this), this.set(t);
            } else if (arguments[0] instanceof u) {
              var e = arguments[0];
              u.constructor_.call(this), this._matrix[R.INTERIOR][R.INTERIOR] = e._matrix[R.INTERIOR][R.INTERIOR], this._matrix[R.INTERIOR][R.BOUNDARY] = e._matrix[R.INTERIOR][R.BOUNDARY], this._matrix[R.INTERIOR][R.EXTERIOR] = e._matrix[R.INTERIOR][R.EXTERIOR], this._matrix[R.BOUNDARY][R.INTERIOR] = e._matrix[R.BOUNDARY][R.INTERIOR], this._matrix[R.BOUNDARY][R.BOUNDARY] = e._matrix[R.BOUNDARY][R.BOUNDARY], this._matrix[R.BOUNDARY][R.EXTERIOR] = e._matrix[R.BOUNDARY][R.EXTERIOR], this._matrix[R.EXTERIOR][R.INTERIOR] = e._matrix[R.EXTERIOR][R.INTERIOR], this._matrix[R.EXTERIOR][R.BOUNDARY] = e._matrix[R.EXTERIOR][R.BOUNDARY], this._matrix[R.EXTERIOR][R.EXTERIOR] = e._matrix[R.EXTERIOR][R.EXTERIOR];
            }
          }
        } }, { key: "matches", value: function() {
          if (Number.isInteger(arguments[0]) && typeof arguments[1] == "string") {
            var t = arguments[0], e = arguments[1];
            return e === nt.SYM_DONTCARE || e === nt.SYM_TRUE && (t >= 0 || t === nt.TRUE) || e === nt.SYM_FALSE && t === nt.FALSE || e === nt.SYM_P && t === nt.P || e === nt.SYM_L && t === nt.L || e === nt.SYM_A && t === nt.A;
          }
          if (typeof arguments[0] == "string" && typeof arguments[1] == "string") {
            var s = arguments[1];
            return new u(arguments[0]).matches(s);
          }
        } }, { key: "isTrue", value: function(t) {
          return t >= 0 || t === nt.TRUE;
        } }]);
      }(), Qo = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "size", value: function() {
          return this._size;
        } }, { key: "addAll", value: function(t) {
          return t === null || t.length === 0 ? null : (this.ensureCapacity(this._size + t.length), ze.arraycopy(t, 0, this._data, this._size, t.length), void (this._size += t.length));
        } }, { key: "ensureCapacity", value: function(t) {
          if (t <= this._data.length) return null;
          var e = Math.max(t, 2 * this._data.length);
          this._data = ti.copyOf(this._data, e);
        } }, { key: "toArray", value: function() {
          var t = new Array(this._size).fill(null);
          return ze.arraycopy(this._data, 0, t, 0, this._size), t;
        } }, { key: "add", value: function(t) {
          this.ensureCapacity(this._size + 1), this._data[this._size] = t, ++this._size;
        } }], [{ key: "constructor_", value: function() {
          if (this._data = null, this._size = 0, arguments.length === 0) u.constructor_.call(this, 10);
          else if (arguments.length === 1) {
            var t = arguments[0];
            this._data = new Array(t).fill(null);
          }
        } }]);
      }(), Ci = function() {
        function u() {
          c(this, u);
        }
        return g(u, [{ key: "getChainStartIndices", value: function(t) {
          var e = 0, s = new Qo(Math.trunc(t.length / 2));
          s.add(e);
          do {
            var h = this.findChainEnd(t, e);
            s.add(h), e = h;
          } while (e < t.length - 1);
          return s.toArray();
        } }, { key: "findChainEnd", value: function(t, e) {
          for (var s = pe.quadrant(t[e], t[e + 1]), h = e + 1; h < t.length && pe.quadrant(t[h - 1], t[h]) === s; )
            h++;
          return h - 1;
        } }, { key: "OLDgetChainStartIndices", value: function(t) {
          var e = 0, s = new yt();
          s.add(e);
          do {
            var h = this.findChainEnd(t, e);
            s.add(h), e = h;
          } while (e < t.length - 1);
          return u.toIntArray(s);
        } }], [{ key: "toIntArray", value: function(t) {
          for (var e = new Array(t.size()).fill(null), s = 0; s < e.length; s++) e[s] = t.get(s).intValue();
          return e;
        } }]);
      }(), Jo = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getCoordinates", value: function() {
          return this.pts;
        } }, { key: "getMaxX", value: function(u) {
          var t = this.pts[this.startIndex[u]].x, e = this.pts[this.startIndex[u + 1]].x;
          return t > e ? t : e;
        } }, { key: "getMinX", value: function(u) {
          var t = this.pts[this.startIndex[u]].x, e = this.pts[this.startIndex[u + 1]].x;
          return t < e ? t : e;
        } }, { key: "computeIntersectsForChain", value: function() {
          if (arguments.length === 4) {
            var u = arguments[0], t = arguments[1], e = arguments[2], s = arguments[3];
            this.computeIntersectsForChain(this.startIndex[u], this.startIndex[u + 1], t, t.startIndex[e], t.startIndex[e + 1], s);
          } else if (arguments.length === 6) {
            var h = arguments[0], d = arguments[1], y = arguments[2], x = arguments[3], I = arguments[4], T = arguments[5];
            if (d - h == 1 && I - x == 1) return T.addIntersections(this.e, h, y.e, x), null;
            if (!this.overlaps(h, d, y, x, I)) return null;
            var G = Math.trunc((h + d) / 2), q = Math.trunc((x + I) / 2);
            h < G && (x < q && this.computeIntersectsForChain(h, G, y, x, q, T), q < I && this.computeIntersectsForChain(h, G, y, q, I, T)), G < d && (x < q && this.computeIntersectsForChain(G, d, y, x, q, T), q < I && this.computeIntersectsForChain(G, d, y, q, I, T));
          }
        } }, { key: "overlaps", value: function(u, t, e, s, h) {
          return Wt.intersects(this.pts[u], this.pts[t], e.pts[s], e.pts[h]);
        } }, { key: "getStartIndexes", value: function() {
          return this.startIndex;
        } }, { key: "computeIntersects", value: function(u, t) {
          for (var e = 0; e < this.startIndex.length - 1; e++) for (var s = 0; s < u.startIndex.length - 1; s++) this.computeIntersectsForChain(e, u, s, t);
        } }], [{ key: "constructor_", value: function() {
          this.e = null, this.pts = null, this.startIndex = null;
          var u = arguments[0];
          this.e = u, this.pts = u.getCoordinates();
          var t = new Ci();
          this.startIndex = t.getChainStartIndices(this.pts);
        } }]);
      }(), _u = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getDepth", value: function(t, e) {
          return this._depth[t][e];
        } }, { key: "setDepth", value: function(t, e, s) {
          this._depth[t][e] = s;
        } }, { key: "isNull", value: function() {
          if (arguments.length === 0) {
            for (var t = 0; t < 2; t++) for (var e = 0; e < 3; e++) if (this._depth[t][e] !== u.NULL_VALUE) return !1;
            return !0;
          }
          if (arguments.length === 1) {
            var s = arguments[0];
            return this._depth[s][1] === u.NULL_VALUE;
          }
          if (arguments.length === 2) {
            var h = arguments[0], d = arguments[1];
            return this._depth[h][d] === u.NULL_VALUE;
          }
        } }, { key: "normalize", value: function() {
          for (var t = 0; t < 2; t++) if (!this.isNull(t)) {
            var e = this._depth[t][1];
            this._depth[t][2] < e && (e = this._depth[t][2]), e < 0 && (e = 0);
            for (var s = 1; s < 3; s++) {
              var h = 0;
              this._depth[t][s] > e && (h = 1), this._depth[t][s] = h;
            }
          }
        } }, { key: "getDelta", value: function(t) {
          return this._depth[t][tt.RIGHT] - this._depth[t][tt.LEFT];
        } }, { key: "getLocation", value: function(t, e) {
          return this._depth[t][e] <= 0 ? R.EXTERIOR : R.INTERIOR;
        } }, { key: "toString", value: function() {
          return "A: " + this._depth[0][1] + "," + this._depth[0][2] + " B: " + this._depth[1][1] + "," + this._depth[1][2];
        } }, { key: "add", value: function() {
          if (arguments.length === 1) for (var t = arguments[0], e = 0; e < 2; e++) for (var s = 1; s < 3; s++) {
            var h = t.getLocation(e, s);
            h !== R.EXTERIOR && h !== R.INTERIOR || (this.isNull(e, s) ? this._depth[e][s] = u.depthAtLocation(h) : this._depth[e][s] += u.depthAtLocation(h));
          }
          else if (arguments.length === 3) {
            var d = arguments[0], y = arguments[1];
            arguments[2] === R.INTERIOR && this._depth[d][y]++;
          }
        } }], [{ key: "constructor_", value: function() {
          this._depth = Array(2).fill().map(function() {
            return Array(3);
          });
          for (var t = 0; t < 2; t++) for (var e = 0; e < 3; e++) this._depth[t][e] = u.NULL_VALUE;
        } }, { key: "depthAtLocation", value: function(t) {
          return t === R.EXTERIOR ? 0 : t === R.INTERIOR ? 1 : u.NULL_VALUE;
        } }]);
      }();
      _u.NULL_VALUE = -1;
      var Dr = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "getDepth", value: function() {
          return this._depth;
        } }, { key: "getCollapsedEdge", value: function() {
          var e = new Array(2).fill(null);
          return e[0] = this.pts[0], e[1] = this.pts[1], new t(e, Xe.toLineLabel(this._label));
        } }, { key: "isIsolated", value: function() {
          return this._isIsolated;
        } }, { key: "getCoordinates", value: function() {
          return this.pts;
        } }, { key: "setIsolated", value: function(e) {
          this._isIsolated = e;
        } }, { key: "setName", value: function(e) {
          this._name = e;
        } }, { key: "equals", value: function(e) {
          if (!(e instanceof t)) return !1;
          var s = e;
          if (this.pts.length !== s.pts.length) return !1;
          for (var h = !0, d = !0, y = this.pts.length, x = 0; x < this.pts.length; x++) if (this.pts[x].equals2D(s.pts[x]) || (h = !1), this.pts[x].equals2D(s.pts[--y]) || (d = !1), !h && !d) return !1;
          return !0;
        } }, { key: "getCoordinate", value: function() {
          if (arguments.length === 0) return this.pts.length > 0 ? this.pts[0] : null;
          if (arguments.length === 1) {
            var e = arguments[0];
            return this.pts[e];
          }
        } }, { key: "print", value: function(e) {
          e.print("edge " + this._name + ": "), e.print("LINESTRING (");
          for (var s = 0; s < this.pts.length; s++) s > 0 && e.print(","), e.print(this.pts[s].x + " " + this.pts[s].y);
          e.print(")  " + this._label + " " + this._depthDelta);
        } }, { key: "computeIM", value: function(e) {
          t.updateIM(this._label, e);
        } }, { key: "isCollapsed", value: function() {
          return !!this._label.isArea() && this.pts.length === 3 && !!this.pts[0].equals(this.pts[2]);
        } }, { key: "isClosed", value: function() {
          return this.pts[0].equals(this.pts[this.pts.length - 1]);
        } }, { key: "getMaximumSegmentIndex", value: function() {
          return this.pts.length - 1;
        } }, { key: "getDepthDelta", value: function() {
          return this._depthDelta;
        } }, { key: "getNumPoints", value: function() {
          return this.pts.length;
        } }, { key: "printReverse", value: function(e) {
          e.print("edge " + this._name + ": ");
          for (var s = this.pts.length - 1; s >= 0; s--) e.print(this.pts[s] + " ");
          e.println("");
        } }, { key: "getMonotoneChainEdge", value: function() {
          return this._mce === null && (this._mce = new Jo(this)), this._mce;
        } }, { key: "getEnvelope", value: function() {
          if (this._env === null) {
            this._env = new Wt();
            for (var e = 0; e < this.pts.length; e++) this._env.expandToInclude(this.pts[e]);
          }
          return this._env;
        } }, { key: "addIntersection", value: function(e, s, h, d) {
          var y = new z(e.getIntersection(d)), x = s, I = e.getEdgeDistance(h, d), T = x + 1;
          if (T < this.pts.length) {
            var G = this.pts[T];
            y.equals2D(G) && (x = T, I = 0);
          }
          this.eiList.add(y, x, I);
        } }, { key: "toString", value: function() {
          var e = new ii();
          e.append("edge " + this._name + ": "), e.append("LINESTRING (");
          for (var s = 0; s < this.pts.length; s++) s > 0 && e.append(","), e.append(this.pts[s].x + " " + this.pts[s].y);
          return e.append(")  " + this._label + " " + this._depthDelta), e.toString();
        } }, { key: "isPointwiseEqual", value: function(e) {
          if (this.pts.length !== e.pts.length) return !1;
          for (var s = 0; s < this.pts.length; s++) if (!this.pts[s].equals2D(e.pts[s])) return !1;
          return !0;
        } }, { key: "setDepthDelta", value: function(e) {
          this._depthDelta = e;
        } }, { key: "getEdgeIntersectionList", value: function() {
          return this.eiList;
        } }, { key: "addIntersections", value: function(e, s, h) {
          for (var d = 0; d < e.getIntersectionNum(); d++) this.addIntersection(e, s, h, d);
        } }], [{ key: "constructor_", value: function() {
          if (this.pts = null, this._env = null, this.eiList = new Ko(this), this._name = null, this._mce = null, this._isIsolated = !0, this._depth = new _u(), this._depthDelta = 0, arguments.length === 1) {
            var e = arguments[0];
            t.constructor_.call(this, e, null);
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            this.pts = s, this._label = h;
          }
        } }, { key: "updateIM", value: function() {
          if (!(arguments.length === 2 && arguments[1] instanceof Zo && arguments[0] instanceof Xe)) return C(t, "updateIM", this).apply(this, arguments);
          var e = arguments[0], s = arguments[1];
          s.setAtLeastIfValid(e.getLocation(0, tt.ON), e.getLocation(1, tt.ON), 1), e.isArea() && (s.setAtLeastIfValid(e.getLocation(0, tt.LEFT), e.getLocation(1, tt.LEFT), 2), s.setAtLeastIfValid(e.getLocation(0, tt.RIGHT), e.getLocation(1, tt.RIGHT), 2));
        } }]);
      }(nu), Hs = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "setWorkingPrecisionModel", value: function(t) {
          this._workingPrecisionModel = t;
        } }, { key: "insertUniqueEdge", value: function(t) {
          var e = this._edgeList.findEqualEdge(t);
          if (e !== null) {
            var s = e.getLabel(), h = t.getLabel();
            e.isPointwiseEqual(t) || (h = new Xe(t.getLabel())).flip(), s.merge(h);
            var d = u.depthDelta(h), y = e.getDepthDelta() + d;
            e.setDepthDelta(y);
          } else this._edgeList.add(t), t.setDepthDelta(u.depthDelta(t.getLabel()));
        } }, { key: "buildSubgraphs", value: function(t, e) {
          for (var s = new yt(), h = t.iterator(); h.hasNext(); ) {
            var d = h.next(), y = d.getRightmostCoordinate(), x = new js(s).getDepth(y);
            d.computeDepth(x), d.findResultEdges(), s.add(d), e.add(d.getDirectedEdges(), d.getNodes());
          }
        } }, { key: "createSubgraphs", value: function(t) {
          for (var e = new yt(), s = t.getNodes().iterator(); s.hasNext(); ) {
            var h = s.next();
            if (!h.isVisited()) {
              var d = new ms();
              d.create(h), e.add(d);
            }
          }
          return ui.sort(e, ui.reverseOrder()), e;
        } }, { key: "createEmptyResultGeometry", value: function() {
          return this._geomFact.createPolygon();
        } }, { key: "getNoder", value: function(t) {
          if (this._workingNoder !== null) return this._workingNoder;
          var e = new Bs(), s = new qn();
          return s.setPrecisionModel(t), e.setSegmentIntersector(new Wo(s)), e;
        } }, { key: "buffer", value: function(t, e) {
          var s = this._workingPrecisionModel;
          s === null && (s = t.getPrecisionModel()), this._geomFact = t.getFactory();
          var h = new Yo(s, this._bufParams), d = new Xo(t, e, h).getCurves();
          if (d.size() <= 0) return this.createEmptyResultGeometry();
          this.computeNodedEdges(d, s), this._graph = new uu(new Vs()), this._graph.addEdges(this._edgeList.getEdges());
          var y = this.createSubgraphs(this._graph), x = new zo(this._geomFact);
          this.buildSubgraphs(y, x);
          var I = x.getPolygons();
          return I.size() <= 0 ? this.createEmptyResultGeometry() : this._geomFact.buildGeometry(I);
        } }, { key: "computeNodedEdges", value: function(t, e) {
          var s = this.getNoder(e);
          s.computeNodes(t);
          for (var h = s.getNodedSubstrings().iterator(); h.hasNext(); ) {
            var d = h.next(), y = d.getCoordinates();
            if (y.length !== 2 || !y[0].equals2D(y[1])) {
              var x = d.getData(), I = new Dr(d.getCoordinates(), new Xe(x));
              this.insertUniqueEdge(I);
            }
          }
        } }, { key: "setNoder", value: function(t) {
          this._workingNoder = t;
        } }], [{ key: "constructor_", value: function() {
          this._bufParams = null, this._workingPrecisionModel = null, this._workingNoder = null, this._geomFact = null, this._graph = null, this._edgeList = new du();
          var t = arguments[0];
          this._bufParams = t;
        } }, { key: "depthDelta", value: function(t) {
          var e = t.getLocation(0, tt.LEFT), s = t.getLocation(0, tt.RIGHT);
          return e === R.INTERIOR && s === R.EXTERIOR ? 1 : e === R.EXTERIOR && s === R.INTERIOR ? -1 : 0;
        } }, { key: "convertSegStrings", value: function(t) {
          for (var e = new Ni(), s = new yt(); t.hasNext(); ) {
            var h = t.next(), d = e.createLineString(h.getCoordinates());
            s.add(d);
          }
          return e.buildGeometry(s);
        } }]);
      }(), zn = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "rescale", value: function() {
          if (kt(arguments[0], nn)) for (var t = arguments[0].iterator(); t.hasNext(); ) {
            var e = t.next();
            this.rescale(e.getCoordinates());
          }
          else if (arguments[0] instanceof Array) {
            for (var s = arguments[0], h = 0; h < s.length; h++) s[h].x = s[h].x / this._scaleFactor + this._offsetX, s[h].y = s[h].y / this._scaleFactor + this._offsetY;
            s.length === 2 && s[0].equals2D(s[1]) && ze.out.println(s);
          }
        } }, { key: "scale", value: function() {
          if (kt(arguments[0], nn)) {
            for (var t = arguments[0], e = new yt(t.size()), s = t.iterator(); s.hasNext(); ) {
              var h = s.next();
              e.add(new yn(this.scale(h.getCoordinates()), h.getData()));
            }
            return e;
          }
          if (arguments[0] instanceof Array) {
            for (var d = arguments[0], y = new Array(d.length).fill(null), x = 0; x < d.length; x++) y[x] = new z(Math.round((d[x].x - this._offsetX) * this._scaleFactor), Math.round((d[x].y - this._offsetY) * this._scaleFactor), d[x].getZ());
            return re.removeRepeatedPoints(y);
          }
        } }, { key: "isIntegerPrecision", value: function() {
          return this._scaleFactor === 1;
        } }, { key: "getNodedSubstrings", value: function() {
          var t = this._noder.getNodedSubstrings();
          return this._isScaled && this.rescale(t), t;
        } }, { key: "computeNodes", value: function(t) {
          var e = t;
          this._isScaled && (e = this.scale(t)), this._noder.computeNodes(e);
        } }, { key: "interfaces_", get: function() {
          return [qs];
        } }], [{ key: "constructor_", value: function() {
          if (this._noder = null, this._scaleFactor = null, this._offsetX = null, this._offsetY = null, this._isScaled = !1, arguments.length === 2) {
            var t = arguments[0], e = arguments[1];
            u.constructor_.call(this, t, e, 0, 0);
          } else if (arguments.length === 4) {
            var s = arguments[0], h = arguments[1];
            this._noder = s, this._scaleFactor = h, this._isScaled = !this.isIntegerPrecision();
          }
        } }]);
      }(), er = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "checkEndPtVertexIntersections", value: function() {
          if (arguments.length === 0) for (var t = this._segStrings.iterator(); t.hasNext(); ) {
            var e = t.next().getCoordinates();
            this.checkEndPtVertexIntersections(e[0], this._segStrings), this.checkEndPtVertexIntersections(e[e.length - 1], this._segStrings);
          }
          else if (arguments.length === 2) {
            for (var s = arguments[0], h = arguments[1].iterator(); h.hasNext(); ) for (var d = h.next().getCoordinates(), y = 1; y < d.length - 1; y++) if (d[y].equals(s)) throw new le("found endpt/interior pt intersection at index " + y + " :pt " + s);
          }
        } }, { key: "checkInteriorIntersections", value: function() {
          if (arguments.length === 0) for (var t = this._segStrings.iterator(); t.hasNext(); ) for (var e = t.next(), s = this._segStrings.iterator(); s.hasNext(); ) {
            var h = s.next();
            this.checkInteriorIntersections(e, h);
          }
          else if (arguments.length === 2) for (var d = arguments[0], y = arguments[1], x = d.getCoordinates(), I = y.getCoordinates(), T = 0; T < x.length - 1; T++) for (var G = 0; G < I.length - 1; G++) this.checkInteriorIntersections(d, T, y, G);
          else if (arguments.length === 4) {
            var q = arguments[0], K = arguments[1], rt = arguments[2], ot = arguments[3];
            if (q === rt && K === ot) return null;
            var gt = q.getCoordinates()[K], Pt = q.getCoordinates()[K + 1], lt = rt.getCoordinates()[ot], Xt = rt.getCoordinates()[ot + 1];
            if (this._li.computeIntersection(gt, Pt, lt, Xt), this._li.hasIntersection() && (this._li.isProper() || this.hasInteriorIntersection(this._li, gt, Pt) || this.hasInteriorIntersection(this._li, lt, Xt))) throw new le("found non-noded intersection at " + gt + "-" + Pt + " and " + lt + "-" + Xt);
          }
        } }, { key: "checkValid", value: function() {
          this.checkEndPtVertexIntersections(), this.checkInteriorIntersections(), this.checkCollapses();
        } }, { key: "checkCollapses", value: function() {
          if (arguments.length === 0) for (var t = this._segStrings.iterator(); t.hasNext(); ) {
            var e = t.next();
            this.checkCollapses(e);
          }
          else if (arguments.length === 1) for (var s = arguments[0].getCoordinates(), h = 0; h < s.length - 2; h++) this.checkCollapse(s[h], s[h + 1], s[h + 2]);
        } }, { key: "hasInteriorIntersection", value: function(t, e, s) {
          for (var h = 0; h < t.getIntersectionNum(); h++) {
            var d = t.getIntersection(h);
            if (!d.equals(e) && !d.equals(s)) return !0;
          }
          return !1;
        } }, { key: "checkCollapse", value: function(t, e, s) {
          if (t.equals(s)) throw new le("found non-noded collapse at " + u.fact.createLineString([t, e, s]));
        } }], [{ key: "constructor_", value: function() {
          this._li = new qn(), this._segStrings = null;
          var t = arguments[0];
          this._segStrings = t;
        } }]);
      }();
      er.fact = new Ni();
      var Ks = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "intersectsScaled", value: function(t, e) {
          var s = Math.min(t.x, e.x), h = Math.max(t.x, e.x), d = Math.min(t.y, e.y), y = Math.max(t.y, e.y), x = this._maxx < s || this._minx > h || this._maxy < d || this._miny > y;
          if (x) return !1;
          var I = this.intersectsToleranceSquare(t, e);
          return It.isTrue(!(x && I), "Found bad envelope test"), I;
        } }, { key: "initCorners", value: function(t) {
          var e = 0.5;
          this._minx = t.x - e, this._maxx = t.x + e, this._miny = t.y - e, this._maxy = t.y + e, this._corner[0] = new z(this._maxx, this._maxy), this._corner[1] = new z(this._minx, this._maxy), this._corner[2] = new z(this._minx, this._miny), this._corner[3] = new z(this._maxx, this._miny);
        } }, { key: "intersects", value: function(t, e) {
          return this._scaleFactor === 1 ? this.intersectsScaled(t, e) : (this.copyScaled(t, this._p0Scaled), this.copyScaled(e, this._p1Scaled), this.intersectsScaled(this._p0Scaled, this._p1Scaled));
        } }, { key: "scale", value: function(t) {
          return Math.round(t * this._scaleFactor);
        } }, { key: "getCoordinate", value: function() {
          return this._originalPt;
        } }, { key: "copyScaled", value: function(t, e) {
          e.x = this.scale(t.x), e.y = this.scale(t.y);
        } }, { key: "getSafeEnvelope", value: function() {
          if (this._safeEnv === null) {
            var t = u.SAFE_ENV_EXPANSION_FACTOR / this._scaleFactor;
            this._safeEnv = new Wt(this._originalPt.x - t, this._originalPt.x + t, this._originalPt.y - t, this._originalPt.y + t);
          }
          return this._safeEnv;
        } }, { key: "intersectsPixelClosure", value: function(t, e) {
          return this._li.computeIntersection(t, e, this._corner[0], this._corner[1]), !!this._li.hasIntersection() || (this._li.computeIntersection(t, e, this._corner[1], this._corner[2]), !!this._li.hasIntersection() || (this._li.computeIntersection(t, e, this._corner[2], this._corner[3]), !!this._li.hasIntersection() || (this._li.computeIntersection(t, e, this._corner[3], this._corner[0]), !!this._li.hasIntersection())));
        } }, { key: "intersectsToleranceSquare", value: function(t, e) {
          var s = !1, h = !1;
          return this._li.computeIntersection(t, e, this._corner[0], this._corner[1]), !!this._li.isProper() || (this._li.computeIntersection(t, e, this._corner[1], this._corner[2]), !!this._li.isProper() || (this._li.hasIntersection() && (s = !0), this._li.computeIntersection(t, e, this._corner[2], this._corner[3]), !!this._li.isProper() || (this._li.hasIntersection() && (h = !0), this._li.computeIntersection(t, e, this._corner[3], this._corner[0]), !!this._li.isProper() || !(!s || !h) || !!t.equals(this._pt) || !!e.equals(this._pt))));
        } }, { key: "addSnappedNode", value: function(t, e) {
          var s = t.getCoordinate(e), h = t.getCoordinate(e + 1);
          return !!this.intersects(s, h) && (t.addIntersection(this.getCoordinate(), e), !0);
        } }], [{ key: "constructor_", value: function() {
          this._li = null, this._pt = null, this._originalPt = null, this._ptScaled = null, this._p0Scaled = null, this._p1Scaled = null, this._scaleFactor = null, this._minx = null, this._maxx = null, this._miny = null, this._maxy = null, this._corner = new Array(4).fill(null), this._safeEnv = null;
          var t = arguments[0], e = arguments[1], s = arguments[2];
          if (this._originalPt = t, this._pt = t, this._scaleFactor = e, this._li = s, e <= 0) throw new Y("Scale factor must be non-zero");
          e !== 1 && (this._pt = new z(this.scale(t.x), this.scale(t.y)), this._p0Scaled = new z(), this._p1Scaled = new z()), this.initCorners(this._pt);
        } }]);
      }();
      Ks.SAFE_ENV_EXPANSION_FACTOR = 0.75;
      var $o = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "select", value: function() {
          if (arguments.length !== 1 && arguments.length === 2) {
            var u = arguments[1];
            arguments[0].getLineSegment(u, this.selectedSegment), this.select(this.selectedSegment);
          }
        } }], [{ key: "constructor_", value: function() {
          this.selectedSegment = new ve();
        } }]);
      }(), mu = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "snap", value: function() {
          if (arguments.length === 1) {
            var u = arguments[0];
            return this.snap(u, null, -1);
          }
          if (arguments.length === 3) {
            var t = arguments[0], e = arguments[1], s = arguments[2], h = t.getSafeEnvelope(), d = new hi(t, e, s);
            return this._index.query(h, new (function() {
              return g(function y() {
                c(this, y);
              }, [{ key: "interfaces_", get: function() {
                return [Gs];
              } }, { key: "visitItem", value: function(y) {
                y.select(h, d);
              } }]);
            }())()), d.isNodeAdded();
          }
        } }], [{ key: "constructor_", value: function() {
          this._index = null;
          var u = arguments[0];
          this._index = u;
        } }]);
      }(), hi = function(u) {
        function t() {
          var e;
          return c(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return E(t, u), g(t, [{ key: "isNodeAdded", value: function() {
          return this._isNodeAdded;
        } }, { key: "select", value: function() {
          if (!(arguments.length === 2 && Number.isInteger(arguments[1]) && arguments[0] instanceof Tn)) return C(t, "select", this, 1).apply(this, arguments);
          var e = arguments[1], s = arguments[0].getContext();
          if (this._parentEdge === s && (e === this._hotPixelVertexIndex || e + 1 === this._hotPixelVertexIndex)) return null;
          this._isNodeAdded |= this._hotPixel.addSnappedNode(s, e);
        } }], [{ key: "constructor_", value: function() {
          this._hotPixel = null, this._parentEdge = null, this._hotPixelVertexIndex = null, this._isNodeAdded = !1;
          var e = arguments[0], s = arguments[1], h = arguments[2];
          this._hotPixel = e, this._parentEdge = s, this._hotPixelVertexIndex = h;
        } }]);
      }($o);
      mu.HotPixelSnapAction = hi;
      var ln = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "processIntersections", value: function(u, t, e, s) {
          if (u === e && t === s) return null;
          var h = u.getCoordinates()[t], d = u.getCoordinates()[t + 1], y = e.getCoordinates()[s], x = e.getCoordinates()[s + 1];
          if (this._li.computeIntersection(h, d, y, x), this._li.hasIntersection() && this._li.isInteriorIntersection()) {
            for (var I = 0; I < this._li.getIntersectionNum(); I++) this._interiorIntersections.add(this._li.getIntersection(I));
            u.addIntersections(this._li, t, 0), e.addIntersections(this._li, s, 1);
          }
        } }, { key: "isDone", value: function() {
          return !1;
        } }, { key: "getInteriorIntersections", value: function() {
          return this._interiorIntersections;
        } }, { key: "interfaces_", get: function() {
          return [Ws];
        } }], [{ key: "constructor_", value: function() {
          this._li = null, this._interiorIntersections = null;
          var u = arguments[0];
          this._li = u, this._interiorIntersections = new yt();
        } }]);
      }(), yu = function() {
        return g(function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "checkCorrectness", value: function(u) {
          var t = yn.getNodedSubstrings(u), e = new er(t);
          try {
            e.checkValid();
          } catch (s) {
            if (!(s instanceof X)) throw s;
            s.printStackTrace();
          }
        } }, { key: "getNodedSubstrings", value: function() {
          return yn.getNodedSubstrings(this._nodedSegStrings);
        } }, { key: "snapRound", value: function(u, t) {
          var e = this.findInteriorIntersections(u, t);
          this.computeIntersectionSnaps(e), this.computeVertexSnaps(u);
        } }, { key: "findInteriorIntersections", value: function(u, t) {
          var e = new ln(t);
          return this._noder.setSegmentIntersector(e), this._noder.computeNodes(u), e.getInteriorIntersections();
        } }, { key: "computeVertexSnaps", value: function() {
          if (kt(arguments[0], nn)) for (var u = arguments[0].iterator(); u.hasNext(); ) {
            var t = u.next();
            this.computeVertexSnaps(t);
          }
          else if (arguments[0] instanceof yn) for (var e = arguments[0], s = e.getCoordinates(), h = 0; h < s.length; h++) {
            var d = new Ks(s[h], this._scaleFactor, this._li);
            this._pointSnapper.snap(d, e, h) && e.addIntersection(s[h], h);
          }
        } }, { key: "computeNodes", value: function(u) {
          this._nodedSegStrings = u, this._noder = new Bs(), this._pointSnapper = new mu(this._noder.getIndex()), this.snapRound(u, this._li);
        } }, { key: "computeIntersectionSnaps", value: function(u) {
          for (var t = u.iterator(); t.hasNext(); ) {
            var e = t.next(), s = new Ks(e, this._scaleFactor, this._li);
            this._pointSnapper.snap(s);
          }
        } }, { key: "interfaces_", get: function() {
          return [qs];
        } }], [{ key: "constructor_", value: function() {
          this._pm = null, this._li = null, this._scaleFactor = null, this._noder = null, this._pointSnapper = null, this._nodedSegStrings = null;
          var u = arguments[0];
          this._pm = u, this._li = new qn(), this._li.setPrecisionModel(u), this._scaleFactor = u.getScale();
        } }]);
      }(), Pi = function() {
        function u() {
          c(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "bufferFixedPrecision", value: function(t) {
          var e = new zn(new yu(new je(1)), t.getScale()), s = new Hs(this._bufParams);
          s.setWorkingPrecisionModel(t), s.setNoder(e), this._resultGeometry = s.buffer(this._argGeom, this._distance);
        } }, { key: "bufferReducedPrecision", value: function() {
          if (arguments.length === 0) {
            for (var t = u.MAX_PRECISION_DIGITS; t >= 0; t--) {
              try {
                this.bufferReducedPrecision(t);
              } catch (d) {
                if (!(d instanceof an)) throw d;
                this._saveException = d;
              }
              if (this._resultGeometry !== null) return null;
            }
            throw this._saveException;
          }
          if (arguments.length === 1) {
            var e = arguments[0], s = u.precisionScaleFactor(this._argGeom, this._distance, e), h = new je(s);
            this.bufferFixedPrecision(h);
          }
        } }, { key: "computeGeometry", value: function() {
          if (this.bufferOriginalPrecision(), this._resultGeometry !== null) return null;
          var t = this._argGeom.getFactory().getPrecisionModel();
          t.getType() === je.FIXED ? this.bufferFixedPrecision(t) : this.bufferReducedPrecision();
        } }, { key: "setQuadrantSegments", value: function(t) {
          this._bufParams.setQuadrantSegments(t);
        } }, { key: "bufferOriginalPrecision", value: function() {
          try {
            var t = new Hs(this._bufParams);
            this._resultGeometry = t.buffer(this._argGeom, this._distance);
          } catch (e) {
            if (!(e instanceof le)) throw e;
            this._saveException = e;
          }
        } }, { key: "getResultGeometry", value: function(t) {
          return this._distance = t, this.computeGeometry(), this._resultGeometry;
        } }, { key: "setEndCapStyle", value: function(t) {
          this._bufParams.setEndCapStyle(t);
        } }], [{ key: "constructor_", value: function() {
          if (this._argGeom = null, this._distance = null, this._bufParams = new U(), this._resultGeometry = null, this._saveException = null, arguments.length === 1) {
            var t = arguments[0];
            this._argGeom = t;
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            this._argGeom = e, this._bufParams = s;
          }
        } }, { key: "bufferOp", value: function() {
          if (arguments.length === 2) {
            var t = arguments[1];
            return new u(arguments[0]).getResultGeometry(t);
          }
          if (arguments.length === 3) {
            if (Number.isInteger(arguments[2]) && arguments[0] instanceof ct && typeof arguments[1] == "number") {
              var e = arguments[1], s = arguments[2], h = new u(arguments[0]);
              return h.setQuadrantSegments(s), h.getResultGeometry(e);
            }
            if (arguments[2] instanceof U && arguments[0] instanceof ct && typeof arguments[1] == "number") {
              var d = arguments[1];
              return new u(arguments[0], arguments[2]).getResultGeometry(d);
            }
          } else if (arguments.length === 4) {
            var y = arguments[1], x = arguments[2], I = arguments[3], T = new u(arguments[0]);
            return T.setQuadrantSegments(x), T.setEndCapStyle(I), T.getResultGeometry(y);
          }
        } }, { key: "precisionScaleFactor", value: function(t, e, s) {
          var h = t.getEnvelopeInternal(), d = Hi.max(Math.abs(h.getMaxX()), Math.abs(h.getMaxY()), Math.abs(h.getMinX()), Math.abs(h.getMinY())) + 2 * (e > 0 ? e : 0), y = s - Math.trunc(Math.log(d) / Math.log(10) + 1);
          return Math.pow(10, y);
        } }]);
      }();
      Pi.CAP_ROUND = U.CAP_ROUND, Pi.CAP_BUTT = U.CAP_FLAT, Pi.CAP_FLAT = U.CAP_FLAT, Pi.CAP_SQUARE = U.CAP_SQUARE, Pi.MAX_PRECISION_DIGITS = 12;
      var th = ["Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"], pu = function() {
        return g(function u(t) {
          c(this, u), this.geometryFactory = t || new Ni();
        }, [{ key: "read", value: function(u) {
          var t, e = (t = typeof u == "string" ? JSON.parse(u) : u).type;
          if (!We[e]) throw new Error("Unknown GeoJSON type: " + t.type);
          return th.indexOf(e) !== -1 ? We[e].call(this, t.coordinates) : e === "GeometryCollection" ? We[e].call(this, t.geometries) : We[e].call(this, t);
        } }, { key: "write", value: function(u) {
          var t = u.getGeometryType();
          if (!vn[t]) throw new Error("Geometry is not supported");
          return vn[t].call(this, u);
        } }]);
      }(), We = { Feature: function(u) {
        var t = {};
        for (var e in u) t[e] = u[e];
        if (u.geometry) {
          var s = u.geometry.type;
          if (!We[s]) throw new Error("Unknown GeoJSON type: " + u.type);
          t.geometry = this.read(u.geometry);
        }
        return u.bbox && (t.bbox = We.bbox.call(this, u.bbox)), t;
      }, FeatureCollection: function(u) {
        var t = {};
        if (u.features) {
          t.features = [];
          for (var e = 0; e < u.features.length; ++e) t.features.push(this.read(u.features[e]));
        }
        return u.bbox && (t.bbox = this.parse.bbox.call(this, u.bbox)), t;
      }, coordinates: function(u) {
        for (var t = [], e = 0; e < u.length; ++e) {
          var s = u[e];
          t.push(_(z, L(s)));
        }
        return t;
      }, bbox: function(u) {
        return this.geometryFactory.createLinearRing([new z(u[0], u[1]), new z(u[2], u[1]), new z(u[2], u[3]), new z(u[0], u[3]), new z(u[0], u[1])]);
      }, Point: function(u) {
        var t = _(z, L(u));
        return this.geometryFactory.createPoint(t);
      }, MultiPoint: function(u) {
        for (var t = [], e = 0; e < u.length; ++e) t.push(We.Point.call(this, u[e]));
        return this.geometryFactory.createMultiPoint(t);
      }, LineString: function(u) {
        var t = We.coordinates.call(this, u);
        return this.geometryFactory.createLineString(t);
      }, MultiLineString: function(u) {
        for (var t = [], e = 0; e < u.length; ++e) t.push(We.LineString.call(this, u[e]));
        return this.geometryFactory.createMultiLineString(t);
      }, Polygon: function(u) {
        for (var t = We.coordinates.call(this, u[0]), e = this.geometryFactory.createLinearRing(t), s = [], h = 1; h < u.length; ++h) {
          var d = u[h], y = We.coordinates.call(this, d), x = this.geometryFactory.createLinearRing(y);
          s.push(x);
        }
        return this.geometryFactory.createPolygon(e, s);
      }, MultiPolygon: function(u) {
        for (var t = [], e = 0; e < u.length; ++e) {
          var s = u[e];
          t.push(We.Polygon.call(this, s));
        }
        return this.geometryFactory.createMultiPolygon(t);
      }, GeometryCollection: function(u) {
        for (var t = [], e = 0; e < u.length; ++e) {
          var s = u[e];
          t.push(this.read(s));
        }
        return this.geometryFactory.createGeometryCollection(t);
      } }, vn = { coordinate: function(u) {
        var t = [u.x, u.y];
        return u.z && t.push(u.z), u.m && t.push(u.m), t;
      }, Point: function(u) {
        return { type: "Point", coordinates: vn.coordinate.call(this, u.getCoordinate()) };
      }, MultiPoint: function(u) {
        for (var t = [], e = 0; e < u._geometries.length; ++e) {
          var s = u._geometries[e], h = vn.Point.call(this, s);
          t.push(h.coordinates);
        }
        return { type: "MultiPoint", coordinates: t };
      }, LineString: function(u) {
        for (var t = [], e = u.getCoordinates(), s = 0; s < e.length; ++s) {
          var h = e[s];
          t.push(vn.coordinate.call(this, h));
        }
        return { type: "LineString", coordinates: t };
      }, MultiLineString: function(u) {
        for (var t = [], e = 0; e < u._geometries.length; ++e) {
          var s = u._geometries[e], h = vn.LineString.call(this, s);
          t.push(h.coordinates);
        }
        return { type: "MultiLineString", coordinates: t };
      }, Polygon: function(u) {
        var t = [], e = vn.LineString.call(this, u._shell);
        t.push(e.coordinates);
        for (var s = 0; s < u._holes.length; ++s) {
          var h = u._holes[s], d = vn.LineString.call(this, h);
          t.push(d.coordinates);
        }
        return { type: "Polygon", coordinates: t };
      }, MultiPolygon: function(u) {
        for (var t = [], e = 0; e < u._geometries.length; ++e) {
          var s = u._geometries[e], h = vn.Polygon.call(this, s);
          t.push(h.coordinates);
        }
        return { type: "MultiPolygon", coordinates: t };
      }, GeometryCollection: function(u) {
        for (var t = [], e = 0; e < u._geometries.length; ++e) {
          var s = u._geometries[e], h = s.getGeometryType();
          t.push(vn[h].call(this, s));
        }
        return { type: "GeometryCollection", geometries: t };
      } };
      return { BufferOp: Pi, GeoJSONReader: function() {
        return g(function u(t) {
          c(this, u), this.parser = new pu(t || new Ni());
        }, [{ key: "read", value: function(u) {
          return this.parser.read(u);
        } }]);
      }(), GeoJSONWriter: function() {
        return g(function u() {
          c(this, u), this.parser = new pu(this.geometryFactory);
        }, [{ key: "write", value: function(u) {
          return this.parser.write(u);
        } }]);
      }() };
    });
  }(gl)), gl.exports;
}
var pM = yM();
const vM = /* @__PURE__ */ dM(pM);
function Xi() {
  return new Io();
}
function Io() {
  this.reset();
}
Io.prototype = {
  constructor: Io,
  reset: function() {
    this.s = // rounded value
    this.t = 0;
  },
  add: function(n) {
    ng(ro, n, this.t), ng(this, ro.s, this.s), this.s ? this.t += ro.t : this.s = ro.t;
  },
  valueOf: function() {
    return this.s;
  }
};
var ro = new Io();
function ng(n, i, a) {
  var l = n.s = i + a, c = l - i, _ = l - c;
  n.t = i - _ + (a - c);
}
var Qt = 1e-6, qt = Math.PI, Kn = qt / 2, ig = qt / 4, Qn = qt * 2, Gi = 180 / qt, Nn = qt / 180, ye = Math.abs, xM = Math.atan, os = Math.atan2, te = Math.cos, ee = Math.sin, fs = Math.sqrt;
function Zg(n) {
  return n > 1 ? 0 : n < -1 ? qt : Math.acos(n);
}
function vr(n) {
  return n > 1 ? Kn : n < -1 ? -Kn : Math.asin(n);
}
function pa() {
}
function No(n, i) {
  n && sg.hasOwnProperty(n.type) && sg[n.type](n, i);
}
var rg = {
  Feature: function(n, i) {
    No(n.geometry, i);
  },
  FeatureCollection: function(n, i) {
    for (var a = n.features, l = -1, c = a.length; ++l < c; ) No(a[l].geometry, i);
  }
}, sg = {
  Sphere: function(n, i) {
    i.sphere();
  },
  Point: function(n, i) {
    n = n.coordinates, i.point(n[0], n[1], n[2]);
  },
  MultiPoint: function(n, i) {
    for (var a = n.coordinates, l = -1, c = a.length; ++l < c; ) n = a[l], i.point(n[0], n[1], n[2]);
  },
  LineString: function(n, i) {
    dl(n.coordinates, i, 0);
  },
  MultiLineString: function(n, i) {
    for (var a = n.coordinates, l = -1, c = a.length; ++l < c; ) dl(a[l], i, 0);
  },
  Polygon: function(n, i) {
    ag(n.coordinates, i);
  },
  MultiPolygon: function(n, i) {
    for (var a = n.coordinates, l = -1, c = a.length; ++l < c; ) ag(a[l], i);
  },
  GeometryCollection: function(n, i) {
    for (var a = n.geometries, l = -1, c = a.length; ++l < c; ) No(a[l], i);
  }
};
function dl(n, i, a) {
  var l = -1, c = n.length - a, _;
  for (i.lineStart(); ++l < c; ) _ = n[l], i.point(_[0], _[1], _[2]);
  i.lineEnd();
}
function ag(n, i) {
  var a = -1, l = n.length;
  for (i.polygonStart(); ++a < l; ) dl(n[a], i, 1);
  i.polygonEnd();
}
function EM(n, i) {
  n && rg.hasOwnProperty(n.type) ? rg[n.type](n, i) : No(n, i);
}
Xi();
Xi();
function _l(n) {
  return [os(n[1], n[0]), vr(n[2])];
}
function hs(n) {
  var i = n[0], a = n[1], l = te(a);
  return [l * te(i), l * ee(i), ee(a)];
}
function so(n, i) {
  return n[0] * i[0] + n[1] * i[1] + n[2] * i[2];
}
function bo(n, i) {
  return [n[1] * i[2] - n[2] * i[1], n[2] * i[0] - n[0] * i[2], n[0] * i[1] - n[1] * i[0]];
}
function nl(n, i) {
  n[0] += i[0], n[1] += i[1], n[2] += i[2];
}
function ao(n, i) {
  return [n[0] * i, n[1] * i, n[2] * i];
}
function ml(n) {
  var i = fs(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
  n[0] /= i, n[1] /= i, n[2] /= i;
}
Xi();
function Qg(n, i) {
  function a(l, c) {
    return l = n(l, c), i(l[0], l[1]);
  }
  return n.invert && i.invert && (a.invert = function(l, c) {
    return l = i.invert(l, c), l && n.invert(l[0], l[1]);
  }), a;
}
function yl(n, i) {
  return [n > qt ? n - Qn : n < -qt ? n + Qn : n, i];
}
yl.invert = yl;
function MM(n, i, a) {
  return (n %= Qn) ? i || a ? Qg(og(n), hg(i, a)) : og(n) : i || a ? hg(i, a) : yl;
}
function ug(n) {
  return function(i, a) {
    return i += n, [i > qt ? i - Qn : i < -qt ? i + Qn : i, a];
  };
}
function og(n) {
  var i = ug(n);
  return i.invert = ug(-n), i;
}
function hg(n, i) {
  var a = te(n), l = ee(n), c = te(i), _ = ee(i);
  function m(g, v) {
    var M = te(v), w = te(g) * M, E = ee(g) * M, k = ee(v), P = k * a + w * l;
    return [
      os(E * c - P * _, w * a - k * l),
      vr(P * c + E * _)
    ];
  }
  return m.invert = function(g, v) {
    var M = te(v), w = te(g) * M, E = ee(g) * M, k = ee(v), P = k * c - E * _;
    return [
      os(E * c + k * _, w * a + P * l),
      vr(P * a - w * l)
    ];
  }, m;
}
function kM(n, i, a, l, c, _) {
  if (a) {
    var m = te(i), g = ee(i), v = l * a;
    c == null ? (c = i + l * Qn, _ = i - v / 2) : (c = lg(m, c), _ = lg(m, _), (l > 0 ? c < _ : c > _) && (c += l * Qn));
    for (var M, w = c; l > 0 ? w > _ : w < _; w -= v)
      M = _l([m, -g * te(w), -g * ee(w)]), n.point(M[0], M[1]);
  }
}
function lg(n, i) {
  i = hs(i), i[0] -= n, ml(i);
  var a = Zg(-i[1]);
  return ((-i[2] < 0 ? -a : a) + Qn - Qt) % Qn;
}
function Jg() {
  var n = [], i;
  return {
    point: function(a, l) {
      i.push([a, l]);
    },
    lineStart: function() {
      n.push(i = []);
    },
    lineEnd: pa,
    rejoin: function() {
      n.length > 1 && n.push(n.pop().concat(n.shift()));
    },
    result: function() {
      var a = n;
      return n = [], i = null, a;
    }
  };
}
function wM(n, i, a, l, c, _) {
  var m = n[0], g = n[1], v = i[0], M = i[1], w = 0, E = 1, k = v - m, P = M - g, C;
  if (C = a - m, !(!k && C > 0)) {
    if (C /= k, k < 0) {
      if (C < w) return;
      C < E && (E = C);
    } else if (k > 0) {
      if (C > E) return;
      C > w && (w = C);
    }
    if (C = c - m, !(!k && C < 0)) {
      if (C /= k, k < 0) {
        if (C > E) return;
        C > w && (w = C);
      } else if (k > 0) {
        if (C < w) return;
        C < E && (E = C);
      }
      if (C = l - g, !(!P && C > 0)) {
        if (C /= P, P < 0) {
          if (C < w) return;
          C < E && (E = C);
        } else if (P > 0) {
          if (C > E) return;
          C > w && (w = C);
        }
        if (C = _ - g, !(!P && C < 0)) {
          if (C /= P, P < 0) {
            if (C > E) return;
            C > w && (w = C);
          } else if (P > 0) {
            if (C < w) return;
            C < E && (E = C);
          }
          return w > 0 && (n[0] = m + w * k, n[1] = g + w * P), E < 1 && (i[0] = m + E * k, i[1] = g + E * P), !0;
        }
      }
    }
  }
}
function mo(n, i) {
  return ye(n[0] - i[0]) < Qt && ye(n[1] - i[1]) < Qt;
}
function uo(n, i, a, l) {
  this.x = n, this.z = i, this.o = a, this.e = l, this.v = !1, this.n = this.p = null;
}
function $g(n, i, a, l, c) {
  var _ = [], m = [], g, v;
  if (n.forEach(function(C) {
    if (!((L = C.length - 1) <= 0)) {
      var L, D = C[0], B = C[L], j;
      if (mo(D, B)) {
        for (c.lineStart(), g = 0; g < L; ++g) c.point((D = C[g])[0], D[1]);
        c.lineEnd();
        return;
      }
      _.push(j = new uo(D, C, null, !0)), m.push(j.o = new uo(D, null, j, !1)), _.push(j = new uo(B, C, null, !1)), m.push(j.o = new uo(B, null, j, !0));
    }
  }), !!_.length) {
    for (m.sort(i), cg(_), cg(m), g = 0, v = m.length; g < v; ++g)
      m[g].e = a = !a;
    for (var M = _[0], w, E; ; ) {
      for (var k = M, P = !0; k.v; ) if ((k = k.n) === M) return;
      w = k.z, c.lineStart();
      do {
        if (k.v = k.o.v = !0, k.e) {
          if (P)
            for (g = 0, v = w.length; g < v; ++g) c.point((E = w[g])[0], E[1]);
          else
            l(k.x, k.n.x, 1, c);
          k = k.n;
        } else {
          if (P)
            for (w = k.p.z, g = w.length - 1; g >= 0; --g) c.point((E = w[g])[0], E[1]);
          else
            l(k.x, k.p.x, -1, c);
          k = k.p;
        }
        k = k.o, w = k.z, P = !P;
      } while (!k.v);
      c.lineEnd();
    }
  }
}
function cg(n) {
  if (i = n.length) {
    for (var i, a = 0, l = n[0], c; ++a < i; )
      l.n = c = n[a], c.p = l, l = c;
    l.n = c = n[0], c.p = l;
  }
}
function t0(n, i) {
  return n < i ? -1 : n > i ? 1 : n >= i ? 0 : NaN;
}
function SM(n) {
  return n.length === 1 && (n = IM(n)), {
    left: function(i, a, l, c) {
      for (l == null && (l = 0), c == null && (c = i.length); l < c; ) {
        var _ = l + c >>> 1;
        n(i[_], a) < 0 ? l = _ + 1 : c = _;
      }
      return l;
    },
    right: function(i, a, l, c) {
      for (l == null && (l = 0), c == null && (c = i.length); l < c; ) {
        var _ = l + c >>> 1;
        n(i[_], a) > 0 ? c = _ : l = _ + 1;
      }
      return l;
    }
  };
}
function IM(n) {
  return function(i, a) {
    return t0(n(i), a);
  };
}
SM(t0);
function e0(n) {
  for (var i = n.length, a, l = -1, c = 0, _, m; ++l < i; ) c += n[l].length;
  for (_ = new Array(c); --i >= 0; )
    for (m = n[i], a = m.length; --a >= 0; )
      _[--c] = m[a];
  return _;
}
var va = 1e9, oo = -va;
function NM(n, i, a, l) {
  function c(M, w) {
    return n <= M && M <= a && i <= w && w <= l;
  }
  function _(M, w, E, k) {
    var P = 0, C = 0;
    if (M == null || (P = m(M, E)) !== (C = m(w, E)) || v(M, w) < 0 ^ E > 0)
      do
        k.point(P === 0 || P === 3 ? n : a, P > 1 ? l : i);
      while ((P = (P + E + 4) % 4) !== C);
    else
      k.point(w[0], w[1]);
  }
  function m(M, w) {
    return ye(M[0] - n) < Qt ? w > 0 ? 0 : 3 : ye(M[0] - a) < Qt ? w > 0 ? 2 : 1 : ye(M[1] - i) < Qt ? w > 0 ? 1 : 0 : w > 0 ? 3 : 2;
  }
  function g(M, w) {
    return v(M.x, w.x);
  }
  function v(M, w) {
    var E = m(M, 1), k = m(w, 1);
    return E !== k ? E - k : E === 0 ? w[1] - M[1] : E === 1 ? M[0] - w[0] : E === 2 ? M[1] - w[1] : w[0] - M[0];
  }
  return function(M) {
    var w = M, E = Jg(), k, P, C, L, D, B, j, U, X, Y, H, Z = {
      point: et,
      lineStart: Mt,
      lineEnd: Ct,
      polygonStart: dt,
      polygonEnd: _t
    };
    function et(wt, Gt) {
      c(wt, Gt) && w.point(wt, Gt);
    }
    function $() {
      for (var wt = 0, Gt = 0, Dt = P.length; Gt < Dt; ++Gt)
        for (var Vt = P[Gt], he = 1, ht = Vt.length, Kt = Vt[0], le, Me, It = Kt[0], ke = Kt[1]; he < ht; ++he)
          le = It, Me = ke, Kt = Vt[he], It = Kt[0], ke = Kt[1], Me <= l ? ke > l && (It - le) * (l - Me) > (ke - Me) * (n - le) && ++wt : ke <= l && (It - le) * (l - Me) < (ke - Me) * (n - le) && --wt;
      return wt;
    }
    function dt() {
      w = E, k = [], P = [], H = !0;
    }
    function _t() {
      var wt = $(), Gt = H && wt, Dt = (k = e0(k)).length;
      (Gt || Dt) && (M.polygonStart(), Gt && (M.lineStart(), _(null, null, 1, M), M.lineEnd()), Dt && $g(k, g, wt, _, M), M.polygonEnd()), w = M, k = P = C = null;
    }
    function Mt() {
      Z.point = it, P && P.push(C = []), Y = !0, X = !1, j = U = NaN;
    }
    function Ct() {
      k && (it(L, D), B && X && E.rejoin(), k.push(E.result())), Z.point = et, X && w.lineEnd();
    }
    function it(wt, Gt) {
      var Dt = c(wt, Gt);
      if (P && C.push([wt, Gt]), Y)
        L = wt, D = Gt, B = Dt, Y = !1, Dt && (w.lineStart(), w.point(wt, Gt));
      else if (Dt && X) w.point(wt, Gt);
      else {
        var Vt = [j = Math.max(oo, Math.min(va, j)), U = Math.max(oo, Math.min(va, U))], he = [wt = Math.max(oo, Math.min(va, wt)), Gt = Math.max(oo, Math.min(va, Gt))];
        wM(Vt, he, n, i, a, l) ? (X || (w.lineStart(), w.point(Vt[0], Vt[1])), w.point(he[0], he[1]), Dt || w.lineEnd(), H = !1) : Dt && (w.lineStart(), w.point(wt, Gt), H = !1);
      }
      j = wt, U = Gt, X = Dt;
    }
    return Z;
  };
}
var il = Xi();
function bM(n, i) {
  var a = i[0], l = i[1], c = [ee(a), -te(a), 0], _ = 0, m = 0;
  il.reset();
  for (var g = 0, v = n.length; g < v; ++g)
    if (w = (M = n[g]).length)
      for (var M, w, E = M[w - 1], k = E[0], P = E[1] / 2 + ig, C = ee(P), L = te(P), D = 0; D < w; ++D, k = j, C = X, L = Y, E = B) {
        var B = M[D], j = B[0], U = B[1] / 2 + ig, X = ee(U), Y = te(U), H = j - k, Z = H >= 0 ? 1 : -1, et = Z * H, $ = et > qt, dt = C * X;
        if (il.add(os(dt * Z * ee(et), L * Y + dt * te(et))), _ += $ ? H + Z * Qn : H, $ ^ k >= a ^ j >= a) {
          var _t = bo(hs(E), hs(B));
          ml(_t);
          var Mt = bo(c, _t);
          ml(Mt);
          var Ct = ($ ^ H >= 0 ? -1 : 1) * vr(Mt[2]);
          (l > Ct || l === Ct && (_t[0] || _t[1])) && (m += $ ^ H >= 0 ? 1 : -1);
        }
      }
  return (_ < -Qt || _ < Qt && il < -Qt) ^ m & 1;
}
Xi();
function fg(n) {
  return n;
}
Xi();
Xi();
var ls = 1 / 0, Co = ls, Pa = -ls, Po = Pa, gg = {
  point: CM,
  lineStart: pa,
  lineEnd: pa,
  polygonStart: pa,
  polygonEnd: pa,
  result: function() {
    var n = [[ls, Co], [Pa, Po]];
    return Pa = Po = -(Co = ls = 1 / 0), n;
  }
};
function CM(n, i) {
  n < ls && (ls = n), n > Pa && (Pa = n), i < Co && (Co = i), i > Po && (Po = i);
}
Xi();
function n0(n, i, a, l) {
  return function(c, _) {
    var m = i(_), g = c.invert(l[0], l[1]), v = Jg(), M = i(v), w = !1, E, k, P, C = {
      point: L,
      lineStart: B,
      lineEnd: j,
      polygonStart: function() {
        C.point = U, C.lineStart = X, C.lineEnd = Y, k = [], E = [];
      },
      polygonEnd: function() {
        C.point = L, C.lineStart = B, C.lineEnd = j, k = e0(k);
        var H = bM(E, g);
        k.length ? (w || (_.polygonStart(), w = !0), $g(k, TM, H, a, _)) : H && (w || (_.polygonStart(), w = !0), _.lineStart(), a(null, null, 1, _), _.lineEnd()), w && (_.polygonEnd(), w = !1), k = E = null;
      },
      sphere: function() {
        _.polygonStart(), _.lineStart(), a(null, null, 1, _), _.lineEnd(), _.polygonEnd();
      }
    };
    function L(H, Z) {
      var et = c(H, Z);
      n(H = et[0], Z = et[1]) && _.point(H, Z);
    }
    function D(H, Z) {
      var et = c(H, Z);
      m.point(et[0], et[1]);
    }
    function B() {
      C.point = D, m.lineStart();
    }
    function j() {
      C.point = L, m.lineEnd();
    }
    function U(H, Z) {
      P.push([H, Z]);
      var et = c(H, Z);
      M.point(et[0], et[1]);
    }
    function X() {
      M.lineStart(), P = [];
    }
    function Y() {
      U(P[0][0], P[0][1]), M.lineEnd();
      var H = M.clean(), Z = v.result(), et, $ = Z.length, dt, _t, Mt;
      if (P.pop(), E.push(P), P = null, !!$) {
        if (H & 1) {
          if (_t = Z[0], (dt = _t.length - 1) > 0) {
            for (w || (_.polygonStart(), w = !0), _.lineStart(), et = 0; et < dt; ++et) _.point((Mt = _t[et])[0], Mt[1]);
            _.lineEnd();
          }
          return;
        }
        $ > 1 && H & 2 && Z.push(Z.pop().concat(Z.shift())), k.push(Z.filter(PM));
      }
    }
    return C;
  };
}
function PM(n) {
  return n.length > 1;
}
function TM(n, i) {
  return ((n = n.x)[0] < 0 ? n[1] - Kn - Qt : Kn - n[1]) - ((i = i.x)[0] < 0 ? i[1] - Kn - Qt : Kn - i[1]);
}
const dg = n0(
  function() {
    return !0;
  },
  AM,
  OM,
  [-qt, -Kn]
);
function AM(n) {
  var i = NaN, a = NaN, l = NaN, c;
  return {
    lineStart: function() {
      n.lineStart(), c = 1;
    },
    point: function(_, m) {
      var g = _ > 0 ? qt : -qt, v = ye(_ - i);
      ye(v - qt) < Qt ? (n.point(i, a = (a + m) / 2 > 0 ? Kn : -Kn), n.point(l, a), n.lineEnd(), n.lineStart(), n.point(g, a), n.point(_, a), c = 0) : l !== g && v >= qt && (ye(i - l) < Qt && (i -= l * Qt), ye(_ - g) < Qt && (_ -= g * Qt), a = RM(i, a, _, m), n.point(l, a), n.lineEnd(), n.lineStart(), n.point(g, a), c = 0), n.point(i = _, a = m), l = g;
    },
    lineEnd: function() {
      n.lineEnd(), i = a = NaN;
    },
    clean: function() {
      return 2 - c;
    }
  };
}
function RM(n, i, a, l) {
  var c, _, m = ee(n - a);
  return ye(m) > Qt ? xM((ee(i) * (_ = te(l)) * ee(a) - ee(l) * (c = te(i)) * ee(n)) / (c * _ * m)) : (i + l) / 2;
}
function OM(n, i, a, l) {
  var c;
  if (n == null)
    c = a * Kn, l.point(-qt, c), l.point(0, c), l.point(qt, c), l.point(qt, 0), l.point(qt, -c), l.point(0, -c), l.point(-qt, -c), l.point(-qt, 0), l.point(-qt, c);
  else if (ye(n[0] - i[0]) > Qt) {
    var _ = n[0] < i[0] ? qt : -qt;
    c = a * _ / 2, l.point(-_, c), l.point(0, c), l.point(_, c);
  } else
    l.point(i[0], i[1]);
}
function LM(n, i) {
  var a = te(n), l = a > 0, c = ye(a) > Qt;
  function _(w, E, k, P) {
    kM(P, n, i, k, w, E);
  }
  function m(w, E) {
    return te(w) * te(E) > a;
  }
  function g(w) {
    var E, k, P, C, L;
    return {
      lineStart: function() {
        C = P = !1, L = 1;
      },
      point: function(D, B) {
        var j = [D, B], U, X = m(D, B), Y = l ? X ? 0 : M(D, B) : X ? M(D + (D < 0 ? qt : -qt), B) : 0;
        if (!E && (C = P = X) && w.lineStart(), X !== P && (U = v(E, j), (!U || mo(E, U) || mo(j, U)) && (j[0] += Qt, j[1] += Qt, X = m(j[0], j[1]))), X !== P)
          L = 0, X ? (w.lineStart(), U = v(j, E), w.point(U[0], U[1])) : (U = v(E, j), w.point(U[0], U[1]), w.lineEnd()), E = U;
        else if (c && E && l ^ X) {
          var H;
          !(Y & k) && (H = v(j, E, !0)) && (L = 0, l ? (w.lineStart(), w.point(H[0][0], H[0][1]), w.point(H[1][0], H[1][1]), w.lineEnd()) : (w.point(H[1][0], H[1][1]), w.lineEnd(), w.lineStart(), w.point(H[0][0], H[0][1])));
        }
        X && (!E || !mo(E, j)) && w.point(j[0], j[1]), E = j, P = X, k = Y;
      },
      lineEnd: function() {
        P && w.lineEnd(), E = null;
      },
      // Rejoin first and last segments if there were intersections and the first
      // and last points were visible.
      clean: function() {
        return L | (C && P) << 1;
      }
    };
  }
  function v(w, E, k) {
    var P = hs(w), C = hs(E), L = [1, 0, 0], D = bo(P, C), B = so(D, D), j = D[0], U = B - j * j;
    if (!U) return !k && w;
    var X = a * B / U, Y = -a * j / U, H = bo(L, D), Z = ao(L, X), et = ao(D, Y);
    nl(Z, et);
    var $ = H, dt = so(Z, $), _t = so($, $), Mt = dt * dt - _t * (so(Z, Z) - 1);
    if (!(Mt < 0)) {
      var Ct = fs(Mt), it = ao($, (-dt - Ct) / _t);
      if (nl(it, Z), it = _l(it), !k) return it;
      var wt = w[0], Gt = E[0], Dt = w[1], Vt = E[1], he;
      Gt < wt && (he = wt, wt = Gt, Gt = he);
      var ht = Gt - wt, Kt = ye(ht - qt) < Qt, le = Kt || ht < Qt;
      if (!Kt && Vt < Dt && (he = Dt, Dt = Vt, Vt = he), le ? Kt ? Dt + Vt > 0 ^ it[1] < (ye(it[0] - wt) < Qt ? Dt : Vt) : Dt <= it[1] && it[1] <= Vt : ht > qt ^ (wt <= it[0] && it[0] <= Gt)) {
        var Me = ao($, (-dt + Ct) / _t);
        return nl(Me, Z), [it, _l(Me)];
      }
    }
  }
  function M(w, E) {
    var k = l ? n : qt - n, P = 0;
    return w < -k ? P |= 1 : w > k && (P |= 2), E < -k ? P |= 4 : E > k && (P |= 8), P;
  }
  return n0(m, g, _, l ? [0, -n] : [-qt, n - qt]);
}
function i0(n) {
  return function(i) {
    var a = new pl();
    for (var l in n) a[l] = n[l];
    return a.stream = i, a;
  };
}
function pl() {
}
pl.prototype = {
  constructor: pl,
  point: function(n, i) {
    this.stream.point(n, i);
  },
  sphere: function() {
    this.stream.sphere();
  },
  lineStart: function() {
    this.stream.lineStart();
  },
  lineEnd: function() {
    this.stream.lineEnd();
  },
  polygonStart: function() {
    this.stream.polygonStart();
  },
  polygonEnd: function() {
    this.stream.polygonEnd();
  }
};
function r0(n, i, a) {
  var l = i[1][0] - i[0][0], c = i[1][1] - i[0][1], _ = n.clipExtent && n.clipExtent();
  n.scale(150).translate([0, 0]), _ != null && n.clipExtent(null), EM(a, n.stream(gg));
  var m = gg.result(), g = Math.min(l / (m[1][0] - m[0][0]), c / (m[1][1] - m[0][1])), v = +i[0][0] + (l - g * (m[1][0] + m[0][0])) / 2, M = +i[0][1] + (c - g * (m[1][1] + m[0][1])) / 2;
  return _ != null && n.clipExtent(_), n.scale(g * 150).translate([v, M]);
}
function GM(n, i, a) {
  return r0(n, [[0, 0], i], a);
}
var _g = 16, DM = te(30 * Nn);
function mg(n, i) {
  return +i ? qM(n, i) : FM(n);
}
function FM(n) {
  return i0({
    point: function(i, a) {
      i = n(i, a), this.stream.point(i[0], i[1]);
    }
  });
}
function qM(n, i) {
  function a(l, c, _, m, g, v, M, w, E, k, P, C, L, D) {
    var B = M - l, j = w - c, U = B * B + j * j;
    if (U > 4 * i && L--) {
      var X = m + k, Y = g + P, H = v + C, Z = fs(X * X + Y * Y + H * H), et = vr(H /= Z), $ = ye(ye(H) - 1) < Qt || ye(_ - E) < Qt ? (_ + E) / 2 : os(Y, X), dt = n($, et), _t = dt[0], Mt = dt[1], Ct = _t - l, it = Mt - c, wt = j * Ct - B * it;
      (wt * wt / U > i || ye((B * Ct + j * it) / U - 0.5) > 0.3 || m * k + g * P + v * C < DM) && (a(l, c, _, m, g, v, _t, Mt, $, X /= Z, Y /= Z, H, L, D), D.point(_t, Mt), a(_t, Mt, $, X, Y, H, M, w, E, k, P, C, L, D));
    }
  }
  return function(l) {
    var c, _, m, g, v, M, w, E, k, P, C, L, D = {
      point: B,
      lineStart: j,
      lineEnd: X,
      polygonStart: function() {
        l.polygonStart(), D.lineStart = Y;
      },
      polygonEnd: function() {
        l.polygonEnd(), D.lineStart = j;
      }
    };
    function B(et, $) {
      et = n(et, $), l.point(et[0], et[1]);
    }
    function j() {
      E = NaN, D.point = U, l.lineStart();
    }
    function U(et, $) {
      var dt = hs([et, $]), _t = n(et, $);
      a(E, k, w, P, C, L, E = _t[0], k = _t[1], w = et, P = dt[0], C = dt[1], L = dt[2], _g, l), l.point(E, k);
    }
    function X() {
      D.point = B, l.lineEnd();
    }
    function Y() {
      j(), D.point = H, D.lineEnd = Z;
    }
    function H(et, $) {
      U(c = et, $), _ = E, m = k, g = P, v = C, M = L, D.point = U;
    }
    function Z() {
      a(E, k, w, P, C, L, _, m, c, g, v, M, _g, l), D.lineEnd = X, X();
    }
    return D;
  };
}
var BM = i0({
  point: function(n, i) {
    this.stream.point(n * Nn, i * Nn);
  }
});
function zM(n) {
  return jM(function() {
    return n;
  })();
}
function jM(n) {
  var i, a = 150, l = 480, c = 250, _, m, g = 0, v = 0, M = 0, w = 0, E = 0, k, P, C = null, L = dg, D = null, B, j, U, X = fg, Y = 0.5, H = mg(_t, Y), Z, et;
  function $(it) {
    return it = P(it[0] * Nn, it[1] * Nn), [it[0] * a + _, m - it[1] * a];
  }
  function dt(it) {
    return it = P.invert((it[0] - _) / a, (m - it[1]) / a), it && [it[0] * Gi, it[1] * Gi];
  }
  function _t(it, wt) {
    return it = i(it, wt), [it[0] * a + _, m - it[1] * a];
  }
  $.stream = function(it) {
    return Z && et === it ? Z : Z = BM(L(k, H(X(et = it))));
  }, $.clipAngle = function(it) {
    return arguments.length ? (L = +it ? LM(C = it * Nn, 6 * Nn) : (C = null, dg), Ct()) : C * Gi;
  }, $.clipExtent = function(it) {
    return arguments.length ? (X = it == null ? (D = B = j = U = null, fg) : NM(D = +it[0][0], B = +it[0][1], j = +it[1][0], U = +it[1][1]), Ct()) : D == null ? null : [[D, B], [j, U]];
  }, $.scale = function(it) {
    return arguments.length ? (a = +it, Mt()) : a;
  }, $.translate = function(it) {
    return arguments.length ? (l = +it[0], c = +it[1], Mt()) : [l, c];
  }, $.center = function(it) {
    return arguments.length ? (g = it[0] % 360 * Nn, v = it[1] % 360 * Nn, Mt()) : [g * Gi, v * Gi];
  }, $.rotate = function(it) {
    return arguments.length ? (M = it[0] % 360 * Nn, w = it[1] % 360 * Nn, E = it.length > 2 ? it[2] % 360 * Nn : 0, Mt()) : [M * Gi, w * Gi, E * Gi];
  }, $.precision = function(it) {
    return arguments.length ? (H = mg(_t, Y = it * it), Ct()) : fs(Y);
  }, $.fitExtent = function(it, wt) {
    return r0($, it, wt);
  }, $.fitSize = function(it, wt) {
    return GM($, it, wt);
  };
  function Mt() {
    P = Qg(k = MM(M, w, E), i);
    var it = i(g, v);
    return _ = l - it[0] * a, m = c + it[1] * a, Ct();
  }
  function Ct() {
    return Z = et = null, $;
  }
  return function() {
    return i = n.apply(this, arguments), $.invert = i.invert && dt, Mt();
  };
}
function s0(n) {
  return function(i, a) {
    var l = te(i), c = te(a), _ = n(l * c);
    return [
      _ * c * ee(i),
      _ * ee(a)
    ];
  };
}
function a0(n) {
  return function(i, a) {
    var l = fs(i * i + a * a), c = n(l), _ = ee(c), m = te(c);
    return [
      os(i * _, l * m),
      vr(l && a * _ / l)
    ];
  };
}
var UM = s0(function(n) {
  return fs(2 / (1 + n));
});
UM.invert = a0(function(n) {
  return 2 * vr(n / 2);
});
var u0 = s0(function(n) {
  return (n = Zg(n)) && n / ee(n);
});
u0.invert = a0(function(n) {
  return n;
});
function YM() {
  return zM(u0).scale(79.4188).clipAngle(180 - 1e-3);
}
function yg(n, i) {
  return [n, i];
}
yg.invert = yg;
var { BufferOp: XM, GeoJSONReader: VM, GeoJSONWriter: WM } = vM;
function HM(n, i, a) {
  a = a || {};
  var l = a.units || "kilometers", c = a.steps || 8;
  if (!n) throw new Error("geojson is required");
  if (typeof a != "object") throw new Error("options must be an object");
  if (typeof c != "number") throw new Error("steps must be an number");
  if (i === void 0) throw new Error("radius is required");
  if (c <= 0) throw new Error("steps must be greater than 0");
  var _ = [];
  switch (n.type) {
    case "GeometryCollection":
      return Rl(n, function(m) {
        var g = yo(m, i, l, c);
        g && _.push(g);
      }), tn(_);
    case "FeatureCollection":
      return us(n, function(m) {
        var g = yo(m, i, l, c);
        g && us(g, function(v) {
          v && _.push(v);
        });
      }), tn(_);
  }
  return yo(n, i, l, c);
}
function yo(n, i, a, l) {
  var c = n.properties || {}, _ = n.type === "Feature" ? n.geometry : n;
  if (_.type === "GeometryCollection") {
    var m = [];
    return Rl(n, function(L) {
      var D = yo(L, i, a, l);
      D && m.push(D);
    }), tn(m);
  }
  var g = KM(_), v = {
    type: _.type,
    coordinates: h0(_.coordinates, g)
  }, M = new VM(), w = M.read(v), E = Xg(w4(i, a), "meters"), k = XM.bufferOp(w, E, l), P = new WM();
  if (k = P.write(k), !o0(k.coordinates)) {
    var C = {
      type: k.type,
      coordinates: l0(k.coordinates, g)
    };
    return Ui(C, c);
  }
}
function o0(n) {
  return Array.isArray(n[0]) ? o0(n[0]) : isNaN(n[0]);
}
function h0(n, i) {
  return typeof n[0] != "object" ? i(n) : n.map(function(a) {
    return h0(a, i);
  });
}
function l0(n, i) {
  return typeof n[0] != "object" ? i.invert(n) : n.map(function(a) {
    return l0(a, i);
  });
}
function KM(n) {
  var i = _M(n).geometry.coordinates, a = [-i[0], -i[1]];
  return YM().rotate(a).scale(Ge);
}
function ZM(n) {
  var i = n[0], a = n[1], l = n[2], c = n[3], _ = Vn(n.slice(0, 2), [l, a]), m = Vn(n.slice(0, 2), [i, c]);
  if (_ >= m) {
    var g = (a + c) / 2;
    return [
      i,
      g - (l - i) / 2,
      l,
      g + (l - i) / 2
    ];
  } else {
    var v = (i + l) / 2;
    return [
      v - (c - a) / 2,
      a,
      v + (c - a) / 2,
      c
    ];
  }
}
function QM(n, i) {
  if (i = i ?? {}, !S4(i)) throw new Error("options is invalid");
  var a = i.precision, l = i.coordinates, c = i.mutate;
  if (a = a == null || isNaN(a) ? 6 : a, l = l == null || isNaN(l) ? 3 : l, !n) throw new Error("<geojson> is required");
  if (typeof a != "number")
    throw new Error("<precision> must be a number");
  if (typeof l != "number")
    throw new Error("<coordinates> must be a number");
  (c === !1 || c === void 0) && (n = JSON.parse(JSON.stringify(n)));
  var _ = Math.pow(10, a);
  return Al(n, function(m) {
    JM(m, _, l);
  }), n;
}
function JM(n, i, a) {
  n.length > a && n.splice(a, n.length);
  for (var l = 0; l < n.length; l++)
    n[l] = Math.round(n[l] * i) / i;
  return n;
}
function $M(n, i) {
  if (!n) throw new Error("line is required");
  if (!i) throw new Error("splitter is required");
  var a = Uf(n), l = Uf(i);
  if (a !== "LineString") throw new Error("line must be LineString");
  if (l === "FeatureCollection")
    throw new Error("splitter cannot be a FeatureCollection");
  if (l === "GeometryCollection")
    throw new Error("splitter cannot be a GeometryCollection");
  var c = QM(i, { precision: 7 });
  switch (l) {
    case "Point":
      return vl(n, c);
    case "MultiPoint":
      return pg(n, c);
    case "LineString":
    case "MultiLineString":
    case "Polygon":
    case "MultiPolygon":
      return pg(
        n,
        W4(n, c, {
          ignoreSelfIntersections: !0
        })
      );
  }
}
function pg(n, i) {
  var a = [], l = Kg();
  return Ol(i, function(c) {
    if (a.forEach(function(g, v) {
      g.id = v;
    }), !a.length)
      a = vl(n, c).features, a.forEach(function(g) {
        g.bbox || (g.bbox = ZM(Ei(g)));
      }), l.load(tn(a));
    else {
      var _ = l.search(c);
      if (_.features.length) {
        var m = c0(c, _);
        a = a.filter(function(g) {
          return g.id !== m.id;
        }), l.remove(m), us(vl(m, c), function(g) {
          a.push(g), l.insert(g);
        });
      }
    }
  }), tn(a);
}
function vl(n, i) {
  var a = [], l = ss(n)[0], c = ss(n)[n.geometry.coordinates.length - 1];
  if (rl(l, Hn(i)) || rl(c, Hn(i)))
    return tn([n]);
  var _ = Kg(), m = eM(n);
  _.load(m);
  var g = _.search(i);
  if (!g.features.length) return tn([n]);
  var v = c0(i, g), M = [l], w = N4(
    m,
    function(E, k, P) {
      var C = ss(k)[1], L = Hn(i);
      return P === v.id ? (E.push(L), a.push(So(E)), rl(L, C) ? [L] : [L, C]) : (E.push(C), E);
    },
    M
  );
  return w.length > 1 && a.push(So(w)), tn(a);
}
function c0(n, i) {
  if (!i.features.length) throw new Error("lines must contain features");
  if (i.features.length === 1) return i.features[0];
  var a, l = 1 / 0;
  return us(i, function(c) {
    var _ = lM(c, n), m = _.properties.dist;
    m < l && (a = c, l = m);
  }), a;
}
function rl(n, i) {
  return n[0] === i[0] && n[1] === i[1];
}
var po = { exports: {} };
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var tk = po.exports, vg;
function ek() {
  return vg || (vg = 1, function(n, i) {
    (function() {
      var a, l = "4.17.21", c = 200, _ = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", m = "Expected a function", g = "Invalid `variable` option passed into `_.template`", v = "__lodash_hash_undefined__", M = 500, w = "__lodash_placeholder__", E = 1, k = 2, P = 4, C = 1, L = 2, D = 1, B = 2, j = 4, U = 8, X = 16, Y = 32, H = 64, Z = 128, et = 256, $ = 512, dt = 30, _t = "...", Mt = 800, Ct = 16, it = 1, wt = 2, Gt = 3, Dt = 1 / 0, Vt = 9007199254740991, he = 17976931348623157e292, ht = NaN, Kt = 4294967295, le = Kt - 1, Me = Kt >>> 1, It = [
        ["ary", Z],
        ["bind", D],
        ["bindKey", B],
        ["curry", U],
        ["curryRight", X],
        ["flip", $],
        ["partial", Y],
        ["partialRight", H],
        ["rearg", et]
      ], ke = "[object Arguments]", xr = "[object Array]", Ba = "[object AsyncFunction]", z = "[object Boolean]", Vi = "[object Date]", Wt = "[object DOMException]", ct = "[object Error]", R = "[object Function]", nn = "[object GeneratorFunction]", we = "[object Map]", qe = "[object Number]", za = "[object Null]", rn = "[object Object]", ja = "[object Promise]", tt = "[object Proxy]", wi = "[object RegExp]", Be = "[object Set]", sn = "[object String]", Er = "[object Symbol]", kt = "[object Undefined]", bn = "[object WeakMap]", Mr = "[object WeakSet]", Jn = "[object ArrayBuffer]", mt = "[object DataView]", Wi = "[object Float32Array]", At = "[object Float64Array]", vt = "[object Int8Array]", gs = "[object Int16Array]", an = "[object Int32Array]", ds = "[object Uint8Array]", yt = "[object Uint8ClampedArray]", _s = "[object Uint16Array]", ms = "[object Uint32Array]", ys = /\b__p \+= '';/g, ze = /\b(__p \+=) '' \+/g, Hi = /(__e\(.*?\)|\b__t\)) \+\n'';/g, un = /&(?:amp|lt|gt|quot|#39);/g, ps = /[&<>"']/g, kr = RegExp(un.source), Ro = RegExp(ps.source), Ua = /<%-([\s\S]+?)%>/g, $n = /<%([\s\S]+?)%>/g, nt = /<%=([\s\S]+?)%>/g, wr = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, Sr = /^\w*$/, Ki = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Ir = /[\\^$.*+?()[\]{}|]/g, vs = RegExp(Ir.source), Nr = /^\s+/, ti = /\s/, Ya = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, br = /\{\n\/\* \[wrapped with (.+)\] \*/, Oo = /,? & /, Xa = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, Lo = /[()=,{}\[\]\/\s]/, Ce = /\\(\\)?/g, xs = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, Si = /\w*$/, ei = /^[-+]0x[0-9a-f]+$/i, ni = /^0b[01]+$/i, Es = /^\[object .+?Constructor\]$/, Cr = /^0o[0-7]+$/i, Zi = /^(?:0|[1-9]\d*)$/, re = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Pr = /($^)/, Go = /['\n\r\u2028\u2029\\]/g, ii = "\\ud800-\\udfff", Qi = "\\u0300-\\u036f", Ms = "\\ufe20-\\ufe2f", ks = "\\u20d0-\\u20ff", ws = Qi + Ms + ks, Va = "\\u2700-\\u27bf", je = "a-z\\xdf-\\xf6\\xf8-\\xff", Ii = "\\xac\\xb1\\xd7\\xf7", Ss = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", Ni = "\\u2000-\\u206f", Is = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", Wa = "A-Z\\xc0-\\xd6\\xd8-\\xde", Ha = "\\ufe0e\\ufe0f", Ka = Ii + Ss + Ni + Is, Tr = "['’]", Za = "[" + ii + "]", Ji = "[" + Ka + "]", Ue = "[" + ws + "]", Cn = "\\d+", Qa = "[" + Va + "]", ri = "[" + je + "]", Ja = "[^" + ii + Ka + Cn + Va + je + Wa + "]", Ns = "\\ud83c[\\udffb-\\udfff]", Do = "(?:" + Ue + "|" + Ns + ")", $a = "[^" + ii + "]", Ar = "(?:\\ud83c[\\udde6-\\uddff]){2}", si = "[\\ud800-\\udbff][\\udc00-\\udfff]", ai = "[" + Wa + "]", tu = "\\u200d", bs = "(?:" + ri + "|" + Ja + ")", Fo = "(?:" + ai + "|" + Ja + ")", Rr = "(?:" + Tr + "(?:d|ll|m|re|s|t|ve))?", Ht = "(?:" + Tr + "(?:D|LL|M|RE|S|T|VE))?", qn = Do + "?", eu = "[" + Ha + "]?", Cs = "(?:" + tu + "(?:" + [$a, Ar, si].join("|") + ")" + eu + qn + ")*", Ye = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", Xe = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", $i = eu + qn + Cs, qo = "(?:" + [Qa, Ar, si].join("|") + ")" + $i, Bo = "(?:" + [$a + Ue + "?", Ue, Ar, si, Za].join("|") + ")", nu = RegExp(Tr, "g"), Or = RegExp(Ue, "g"), Ps = RegExp(Ns + "(?=" + Ns + ")|" + Bo + $i, "g"), iu = RegExp([
        ai + "?" + ri + "+" + Rr + "(?=" + [Ji, ai, "$"].join("|") + ")",
        Fo + "+" + Ht + "(?=" + [Ji, ai + bs, "$"].join("|") + ")",
        ai + "?" + bs + "+" + Rr,
        ai + "+" + Ht,
        Xe,
        Ye,
        Cn,
        qo
      ].join("|"), "g"), Ft = RegExp("[" + tu + ii + ws + Ha + "]"), mn = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, Ts = [
        "Array",
        "Buffer",
        "DataView",
        "Date",
        "Error",
        "Float32Array",
        "Float64Array",
        "Function",
        "Int8Array",
        "Int16Array",
        "Int32Array",
        "Map",
        "Math",
        "Object",
        "Promise",
        "RegExp",
        "Set",
        "String",
        "Symbol",
        "TypeError",
        "Uint8Array",
        "Uint8ClampedArray",
        "Uint16Array",
        "Uint32Array",
        "WeakMap",
        "_",
        "clearTimeout",
        "isFinite",
        "parseInt",
        "setTimeout"
      ], ru = -1, Bt = {};
      Bt[Wi] = Bt[At] = Bt[vt] = Bt[gs] = Bt[an] = Bt[ds] = Bt[yt] = Bt[_s] = Bt[ms] = !0, Bt[ke] = Bt[xr] = Bt[Jn] = Bt[z] = Bt[mt] = Bt[Vi] = Bt[ct] = Bt[R] = Bt[we] = Bt[qe] = Bt[rn] = Bt[wi] = Bt[Be] = Bt[sn] = Bt[bn] = !1;
      var Yt = {};
      Yt[ke] = Yt[xr] = Yt[Jn] = Yt[mt] = Yt[z] = Yt[Vi] = Yt[Wi] = Yt[At] = Yt[vt] = Yt[gs] = Yt[an] = Yt[we] = Yt[qe] = Yt[rn] = Yt[wi] = Yt[Be] = Yt[sn] = Yt[Er] = Yt[ds] = Yt[yt] = Yt[_s] = Yt[ms] = !0, Yt[ct] = Yt[R] = Yt[bn] = !1;
      var pe = {
        // Latin-1 Supplement block.
        À: "A",
        Á: "A",
        Â: "A",
        Ã: "A",
        Ä: "A",
        Å: "A",
        à: "a",
        á: "a",
        â: "a",
        ã: "a",
        ä: "a",
        å: "a",
        Ç: "C",
        ç: "c",
        Ð: "D",
        ð: "d",
        È: "E",
        É: "E",
        Ê: "E",
        Ë: "E",
        è: "e",
        é: "e",
        ê: "e",
        ë: "e",
        Ì: "I",
        Í: "I",
        Î: "I",
        Ï: "I",
        ì: "i",
        í: "i",
        î: "i",
        ï: "i",
        Ñ: "N",
        ñ: "n",
        Ò: "O",
        Ó: "O",
        Ô: "O",
        Õ: "O",
        Ö: "O",
        Ø: "O",
        ò: "o",
        ó: "o",
        ô: "o",
        õ: "o",
        ö: "o",
        ø: "o",
        Ù: "U",
        Ú: "U",
        Û: "U",
        Ü: "U",
        ù: "u",
        ú: "u",
        û: "u",
        ü: "u",
        Ý: "Y",
        ý: "y",
        ÿ: "y",
        Æ: "Ae",
        æ: "ae",
        Þ: "Th",
        þ: "th",
        ß: "ss",
        // Latin Extended-A block.
        Ā: "A",
        Ă: "A",
        Ą: "A",
        ā: "a",
        ă: "a",
        ą: "a",
        Ć: "C",
        Ĉ: "C",
        Ċ: "C",
        Č: "C",
        ć: "c",
        ĉ: "c",
        ċ: "c",
        č: "c",
        Ď: "D",
        Đ: "D",
        ď: "d",
        đ: "d",
        Ē: "E",
        Ĕ: "E",
        Ė: "E",
        Ę: "E",
        Ě: "E",
        ē: "e",
        ĕ: "e",
        ė: "e",
        ę: "e",
        ě: "e",
        Ĝ: "G",
        Ğ: "G",
        Ġ: "G",
        Ģ: "G",
        ĝ: "g",
        ğ: "g",
        ġ: "g",
        ģ: "g",
        Ĥ: "H",
        Ħ: "H",
        ĥ: "h",
        ħ: "h",
        Ĩ: "I",
        Ī: "I",
        Ĭ: "I",
        Į: "I",
        İ: "I",
        ĩ: "i",
        ī: "i",
        ĭ: "i",
        į: "i",
        ı: "i",
        Ĵ: "J",
        ĵ: "j",
        Ķ: "K",
        ķ: "k",
        ĸ: "k",
        Ĺ: "L",
        Ļ: "L",
        Ľ: "L",
        Ŀ: "L",
        Ł: "L",
        ĺ: "l",
        ļ: "l",
        ľ: "l",
        ŀ: "l",
        ł: "l",
        Ń: "N",
        Ņ: "N",
        Ň: "N",
        Ŋ: "N",
        ń: "n",
        ņ: "n",
        ň: "n",
        ŋ: "n",
        Ō: "O",
        Ŏ: "O",
        Ő: "O",
        ō: "o",
        ŏ: "o",
        ő: "o",
        Ŕ: "R",
        Ŗ: "R",
        Ř: "R",
        ŕ: "r",
        ŗ: "r",
        ř: "r",
        Ś: "S",
        Ŝ: "S",
        Ş: "S",
        Š: "S",
        ś: "s",
        ŝ: "s",
        ş: "s",
        š: "s",
        Ţ: "T",
        Ť: "T",
        Ŧ: "T",
        ţ: "t",
        ť: "t",
        ŧ: "t",
        Ũ: "U",
        Ū: "U",
        Ŭ: "U",
        Ů: "U",
        Ű: "U",
        Ų: "U",
        ũ: "u",
        ū: "u",
        ŭ: "u",
        ů: "u",
        ű: "u",
        ų: "u",
        Ŵ: "W",
        ŵ: "w",
        Ŷ: "Y",
        ŷ: "y",
        Ÿ: "Y",
        Ź: "Z",
        Ż: "Z",
        Ž: "Z",
        ź: "z",
        ż: "z",
        ž: "z",
        Ĳ: "IJ",
        ĳ: "ij",
        Œ: "Oe",
        œ: "oe",
        ŉ: "'n",
        ſ: "s"
      }, su = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }, As = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
      }, au = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      }, uu = parseFloat, zo = parseInt, Rs = typeof io == "object" && io && io.Object === Object && io, Pn = typeof self == "object" && self && self.Object === Object && self, ne = Rs || Pn || Function("return this")(), Os = i && !i.nodeType && i, ce = Os && !0 && n && !n.nodeType && n, ui = ce && ce.exports === Os, Ls = ui && Rs.process, ge = function() {
        try {
          var t = ce && ce.require && ce.require("util").types;
          return t || Ls && Ls.binding && Ls.binding("util");
        } catch {
        }
      }(), Gs = ge && ge.isArrayBuffer, oi = ge && ge.isDate, ou = ge && ge.isMap, on = ge && ge.isRegExp, Ds = ge && ge.isSet, hu = ge && ge.isTypedArray;
      function Pe(t, e, s) {
        switch (s.length) {
          case 0:
            return t.call(e);
          case 1:
            return t.call(e, s[0]);
          case 2:
            return t.call(e, s[0], s[1]);
          case 3:
            return t.call(e, s[0], s[1], s[2]);
        }
        return t.apply(e, s);
      }
      function jo(t, e, s, h) {
        for (var d = -1, y = t == null ? 0 : t.length; ++d < y; ) {
          var x = t[d];
          e(h, x, s(x), t);
        }
        return h;
      }
      function Ve(t, e) {
        for (var s = -1, h = t == null ? 0 : t.length; ++s < h && e(t[s], s, t) !== !1; )
          ;
        return t;
      }
      function Uo(t, e) {
        for (var s = t == null ? 0 : t.length; s-- && e(t[s], s, t) !== !1; )
          ;
        return t;
      }
      function lu(t, e) {
        for (var s = -1, h = t == null ? 0 : t.length; ++s < h; )
          if (!e(t[s], s, t))
            return !1;
        return !0;
      }
      function Bn(t, e) {
        for (var s = -1, h = t == null ? 0 : t.length, d = 0, y = []; ++s < h; ) {
          var x = t[s];
          e(x, s, t) && (y[d++] = x);
        }
        return y;
      }
      function yn(t, e) {
        var s = t == null ? 0 : t.length;
        return !!s && pn(t, e, 0) > -1;
      }
      function ve(t, e, s) {
        for (var h = -1, d = t == null ? 0 : t.length; ++h < d; )
          if (s(e, t[h]))
            return !0;
        return !1;
      }
      function Zt(t, e) {
        for (var s = -1, h = t == null ? 0 : t.length, d = Array(h); ++s < h; )
          d[s] = e(t[s], s, t);
        return d;
      }
      function Tn(t, e) {
        for (var s = -1, h = e.length, d = t.length; ++s < h; )
          t[d + s] = e[s];
        return t;
      }
      function Fs(t, e, s, h) {
        var d = -1, y = t == null ? 0 : t.length;
        for (h && y && (s = t[++d]); ++d < y; )
          s = e(s, t[d], d, t);
        return s;
      }
      function qs(t, e, s, h) {
        var d = t == null ? 0 : t.length;
        for (h && d && (s = t[--d]); d--; )
          s = e(s, t[d], d, t);
        return s;
      }
      function Lr(t, e) {
        for (var s = -1, h = t == null ? 0 : t.length; ++s < h; )
          if (e(t[s], s, t))
            return !0;
        return !1;
      }
      var Bs = Gr("length");
      function cu(t) {
        return t.split("");
      }
      function hn(t) {
        return t.match(Xa) || [];
      }
      function zs(t, e, s) {
        var h;
        return s(t, function(d, y, x) {
          if (e(d, y, x))
            return h = y, !1;
        }), h;
      }
      function _e(t, e, s, h) {
        for (var d = t.length, y = s + (h ? 1 : -1); h ? y-- : ++y < d; )
          if (e(t[y], y, t))
            return y;
        return -1;
      }
      function pn(t, e, s) {
        return e === e ? $o(t, e, s) : _e(t, js, s);
      }
      function Yo(t, e, s, h) {
        for (var d = s - 1, y = t.length; ++d < y; )
          if (h(t[d], e))
            return d;
        return -1;
      }
      function js(t) {
        return t !== t;
      }
      function Us(t, e) {
        var s = t == null ? 0 : t.length;
        return s ? Ys(t, e) / s : ht;
      }
      function Gr(t) {
        return function(e) {
          return e == null ? a : e[t];
        };
      }
      function tr(t) {
        return function(e) {
          return t == null ? a : t[e];
        };
      }
      function fu(t, e, s, h, d) {
        return d(t, function(y, x, I) {
          s = h ? (h = !1, y) : e(s, y, x, I);
        }), s;
      }
      function Xo(t, e) {
        var s = t.length;
        for (t.sort(e); s--; )
          t[s] = t[s].value;
        return t;
      }
      function Ys(t, e) {
        for (var s, h = -1, d = t.length; ++h < d; ) {
          var y = e(t[h]);
          y !== a && (s = s === a ? y : s + y);
        }
        return s;
      }
      function Xs(t, e) {
        for (var s = -1, h = Array(t); ++s < t; )
          h[s] = e(s);
        return h;
      }
      function Vo(t, e) {
        return Zt(e, function(s) {
          return [s, t[s]];
        });
      }
      function gu(t) {
        return t && t.slice(0, yu(t) + 1).replace(Nr, "");
      }
      function Te(t) {
        return function(e) {
          return t(e);
        };
      }
      function Vs(t, e) {
        return Zt(e, function(s) {
          return t[s];
        });
      }
      function bi(t, e) {
        return t.has(e);
      }
      function du(t, e) {
        for (var s = -1, h = t.length; ++s < h && pn(e, t[s], 0) > -1; )
          ;
        return s;
      }
      function Ws(t, e) {
        for (var s = t.length; s-- && pn(e, t[s], 0) > -1; )
          ;
        return s;
      }
      function Wo(t, e) {
        for (var s = t.length, h = 0; s--; )
          t[s] === e && ++h;
        return h;
      }
      var Ho = tr(pe), Ko = tr(su);
      function Zo(t) {
        return "\\" + au[t];
      }
      function Qo(t, e) {
        return t == null ? a : t[e];
      }
      function Ci(t) {
        return Ft.test(t);
      }
      function Jo(t) {
        return mn.test(t);
      }
      function _u(t) {
        for (var e, s = []; !(e = t.next()).done; )
          s.push(e.value);
        return s;
      }
      function Dr(t) {
        var e = -1, s = Array(t.size);
        return t.forEach(function(h, d) {
          s[++e] = [d, h];
        }), s;
      }
      function Hs(t, e) {
        return function(s) {
          return t(e(s));
        };
      }
      function zn(t, e) {
        for (var s = -1, h = t.length, d = 0, y = []; ++s < h; ) {
          var x = t[s];
          (x === e || x === w) && (t[s] = w, y[d++] = s);
        }
        return y;
      }
      function er(t) {
        var e = -1, s = Array(t.size);
        return t.forEach(function(h) {
          s[++e] = h;
        }), s;
      }
      function Ks(t) {
        var e = -1, s = Array(t.size);
        return t.forEach(function(h) {
          s[++e] = [h, h];
        }), s;
      }
      function $o(t, e, s) {
        for (var h = s - 1, d = t.length; ++h < d; )
          if (t[h] === e)
            return h;
        return -1;
      }
      function mu(t, e, s) {
        for (var h = s + 1; h--; )
          if (t[h] === e)
            return h;
        return h;
      }
      function hi(t) {
        return Ci(t) ? th(t) : Bs(t);
      }
      function ln(t) {
        return Ci(t) ? pu(t) : cu(t);
      }
      function yu(t) {
        for (var e = t.length; e-- && ti.test(t.charAt(e)); )
          ;
        return e;
      }
      var Pi = tr(As);
      function th(t) {
        for (var e = Ps.lastIndex = 0; Ps.test(t); )
          ++e;
        return e;
      }
      function pu(t) {
        return t.match(Ps) || [];
      }
      function We(t) {
        return t.match(iu) || [];
      }
      var vn = function t(e) {
        e = e == null ? ne : u.defaults(ne.Object(), e, u.pick(ne, Ts));
        var s = e.Array, h = e.Date, d = e.Error, y = e.Function, x = e.Math, I = e.Object, T = e.RegExp, G = e.String, q = e.TypeError, K = s.prototype, rt = y.prototype, ot = I.prototype, gt = e["__core-js_shared__"], Pt = rt.toString, lt = ot.hasOwnProperty, Xt = 0, fe = function() {
          var r = /[^.]+$/.exec(gt && gt.keys && gt.keys.IE_PROTO || "");
          return r ? "Symbol(src)_1." + r : "";
        }(), se = ot.toString, li = Pt.call(I), nr = ne._, vu = T(
          "^" + Pt.call(lt).replace(Ir, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), ir = ui ? e.Buffer : a, An = e.Symbol, rr = e.Uint8Array, Zs = ir ? ir.allocUnsafe : a, sr = Hs(I.getPrototypeOf, I), Fr = I.create, qr = ot.propertyIsEnumerable, xu = K.splice, Ll = An ? An.isConcatSpreadable : a, Qs = An ? An.iterator : a, ar = An ? An.toStringTag : a, Eu = function() {
          try {
            var r = cr(I, "defineProperty");
            return r({}, "", {}), r;
          } catch {
          }
        }(), k0 = e.clearTimeout !== ne.clearTimeout && e.clearTimeout, w0 = h && h.now !== ne.Date.now && h.now, S0 = e.setTimeout !== ne.setTimeout && e.setTimeout, Mu = x.ceil, ku = x.floor, eh = I.getOwnPropertySymbols, I0 = ir ? ir.isBuffer : a, Gl = e.isFinite, N0 = K.join, b0 = Hs(I.keys, I), de = x.max, Se = x.min, C0 = h.now, P0 = e.parseInt, Dl = x.random, T0 = K.reverse, nh = cr(e, "DataView"), Js = cr(e, "Map"), ih = cr(e, "Promise"), Br = cr(e, "Set"), $s = cr(e, "WeakMap"), ta = cr(I, "create"), wu = $s && new $s(), zr = {}, A0 = fr(nh), R0 = fr(Js), O0 = fr(ih), L0 = fr(Br), G0 = fr($s), Su = An ? An.prototype : a, ea = Su ? Su.valueOf : a, Fl = Su ? Su.toString : a;
        function N(r) {
          if (ie(r) && !St(r) && !(r instanceof Ot)) {
            if (r instanceof xn)
              return r;
            if (lt.call(r, "__wrapped__"))
              return qc(r);
          }
          return new xn(r);
        }
        var jr = /* @__PURE__ */ function() {
          function r() {
          }
          return function(o) {
            if (!Jt(o))
              return {};
            if (Fr)
              return Fr(o);
            r.prototype = o;
            var f = new r();
            return r.prototype = a, f;
          };
        }();
        function Iu() {
        }
        function xn(r, o) {
          this.__wrapped__ = r, this.__actions__ = [], this.__chain__ = !!o, this.__index__ = 0, this.__values__ = a;
        }
        N.templateSettings = {
          /**
           * Used to detect `data` property values to be HTML-escaped.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          escape: Ua,
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          evaluate: $n,
          /**
           * Used to detect `data` property values to inject.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          interpolate: nt,
          /**
           * Used to reference the data object in the template text.
           *
           * @memberOf _.templateSettings
           * @type {string}
           */
          variable: "",
          /**
           * Used to import variables into the compiled template.
           *
           * @memberOf _.templateSettings
           * @type {Object}
           */
          imports: {
            /**
             * A reference to the `lodash` function.
             *
             * @memberOf _.templateSettings.imports
             * @type {Function}
             */
            _: N
          }
        }, N.prototype = Iu.prototype, N.prototype.constructor = N, xn.prototype = jr(Iu.prototype), xn.prototype.constructor = xn;
        function Ot(r) {
          this.__wrapped__ = r, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = Kt, this.__views__ = [];
        }
        function D0() {
          var r = new Ot(this.__wrapped__);
          return r.__actions__ = He(this.__actions__), r.__dir__ = this.__dir__, r.__filtered__ = this.__filtered__, r.__iteratees__ = He(this.__iteratees__), r.__takeCount__ = this.__takeCount__, r.__views__ = He(this.__views__), r;
        }
        function F0() {
          if (this.__filtered__) {
            var r = new Ot(this);
            r.__dir__ = -1, r.__filtered__ = !0;
          } else
            r = this.clone(), r.__dir__ *= -1;
          return r;
        }
        function q0() {
          var r = this.__wrapped__.value(), o = this.__dir__, f = St(r), p = o < 0, S = f ? r.length : 0, b = Qd(0, S, this.__views__), A = b.start, O = b.end, F = O - A, V = p ? O : A - 1, W = this.__iteratees__, Q = W.length, at = 0, ft = Se(F, this.__takeCount__);
          if (!f || !p && S == F && ft == F)
            return oc(r, this.__actions__);
          var xt = [];
          t:
            for (; F-- && at < ft; ) {
              V += o;
              for (var bt = -1, Et = r[V]; ++bt < Q; ) {
                var Rt = W[bt], Lt = Rt.iteratee, gn = Rt.type, Oe = Lt(Et);
                if (gn == wt)
                  Et = Oe;
                else if (!Oe) {
                  if (gn == it)
                    continue t;
                  break t;
                }
              }
              xt[at++] = Et;
            }
          return xt;
        }
        Ot.prototype = jr(Iu.prototype), Ot.prototype.constructor = Ot;
        function ur(r) {
          var o = -1, f = r == null ? 0 : r.length;
          for (this.clear(); ++o < f; ) {
            var p = r[o];
            this.set(p[0], p[1]);
          }
        }
        function B0() {
          this.__data__ = ta ? ta(null) : {}, this.size = 0;
        }
        function z0(r) {
          var o = this.has(r) && delete this.__data__[r];
          return this.size -= o ? 1 : 0, o;
        }
        function j0(r) {
          var o = this.__data__;
          if (ta) {
            var f = o[r];
            return f === v ? a : f;
          }
          return lt.call(o, r) ? o[r] : a;
        }
        function U0(r) {
          var o = this.__data__;
          return ta ? o[r] !== a : lt.call(o, r);
        }
        function Y0(r, o) {
          var f = this.__data__;
          return this.size += this.has(r) ? 0 : 1, f[r] = ta && o === a ? v : o, this;
        }
        ur.prototype.clear = B0, ur.prototype.delete = z0, ur.prototype.get = j0, ur.prototype.has = U0, ur.prototype.set = Y0;
        function ci(r) {
          var o = -1, f = r == null ? 0 : r.length;
          for (this.clear(); ++o < f; ) {
            var p = r[o];
            this.set(p[0], p[1]);
          }
        }
        function X0() {
          this.__data__ = [], this.size = 0;
        }
        function V0(r) {
          var o = this.__data__, f = Nu(o, r);
          if (f < 0)
            return !1;
          var p = o.length - 1;
          return f == p ? o.pop() : xu.call(o, f, 1), --this.size, !0;
        }
        function W0(r) {
          var o = this.__data__, f = Nu(o, r);
          return f < 0 ? a : o[f][1];
        }
        function H0(r) {
          return Nu(this.__data__, r) > -1;
        }
        function K0(r, o) {
          var f = this.__data__, p = Nu(f, r);
          return p < 0 ? (++this.size, f.push([r, o])) : f[p][1] = o, this;
        }
        ci.prototype.clear = X0, ci.prototype.delete = V0, ci.prototype.get = W0, ci.prototype.has = H0, ci.prototype.set = K0;
        function fi(r) {
          var o = -1, f = r == null ? 0 : r.length;
          for (this.clear(); ++o < f; ) {
            var p = r[o];
            this.set(p[0], p[1]);
          }
        }
        function Z0() {
          this.size = 0, this.__data__ = {
            hash: new ur(),
            map: new (Js || ci)(),
            string: new ur()
          };
        }
        function Q0(r) {
          var o = qu(this, r).delete(r);
          return this.size -= o ? 1 : 0, o;
        }
        function J0(r) {
          return qu(this, r).get(r);
        }
        function $0(r) {
          return qu(this, r).has(r);
        }
        function td(r, o) {
          var f = qu(this, r), p = f.size;
          return f.set(r, o), this.size += f.size == p ? 0 : 1, this;
        }
        fi.prototype.clear = Z0, fi.prototype.delete = Q0, fi.prototype.get = J0, fi.prototype.has = $0, fi.prototype.set = td;
        function or(r) {
          var o = -1, f = r == null ? 0 : r.length;
          for (this.__data__ = new fi(); ++o < f; )
            this.add(r[o]);
        }
        function ed(r) {
          return this.__data__.set(r, v), this;
        }
        function nd(r) {
          return this.__data__.has(r);
        }
        or.prototype.add = or.prototype.push = ed, or.prototype.has = nd;
        function Rn(r) {
          var o = this.__data__ = new ci(r);
          this.size = o.size;
        }
        function id() {
          this.__data__ = new ci(), this.size = 0;
        }
        function rd(r) {
          var o = this.__data__, f = o.delete(r);
          return this.size = o.size, f;
        }
        function sd(r) {
          return this.__data__.get(r);
        }
        function ad(r) {
          return this.__data__.has(r);
        }
        function ud(r, o) {
          var f = this.__data__;
          if (f instanceof ci) {
            var p = f.__data__;
            if (!Js || p.length < c - 1)
              return p.push([r, o]), this.size = ++f.size, this;
            f = this.__data__ = new fi(p);
          }
          return f.set(r, o), this.size = f.size, this;
        }
        Rn.prototype.clear = id, Rn.prototype.delete = rd, Rn.prototype.get = sd, Rn.prototype.has = ad, Rn.prototype.set = ud;
        function ql(r, o) {
          var f = St(r), p = !f && gr(r), S = !f && !p && Li(r), b = !f && !p && !S && Vr(r), A = f || p || S || b, O = A ? Xs(r.length, G) : [], F = O.length;
          for (var V in r)
            (o || lt.call(r, V)) && !(A && // Safari 9 has enumerable `arguments.length` in strict mode.
            (V == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            S && (V == "offset" || V == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            b && (V == "buffer" || V == "byteLength" || V == "byteOffset") || // Skip index properties.
            mi(V, F))) && O.push(V);
          return O;
        }
        function Bl(r) {
          var o = r.length;
          return o ? r[dh(0, o - 1)] : a;
        }
        function od(r, o) {
          return Bu(He(r), hr(o, 0, r.length));
        }
        function hd(r) {
          return Bu(He(r));
        }
        function rh(r, o, f) {
          (f !== a && !On(r[o], f) || f === a && !(o in r)) && gi(r, o, f);
        }
        function na(r, o, f) {
          var p = r[o];
          (!(lt.call(r, o) && On(p, f)) || f === a && !(o in r)) && gi(r, o, f);
        }
        function Nu(r, o) {
          for (var f = r.length; f--; )
            if (On(r[f][0], o))
              return f;
          return -1;
        }
        function ld(r, o, f, p) {
          return Ti(r, function(S, b, A) {
            o(p, S, f(S), A);
          }), p;
        }
        function zl(r, o) {
          return r && Un(o, me(o), r);
        }
        function cd(r, o) {
          return r && Un(o, Ze(o), r);
        }
        function gi(r, o, f) {
          o == "__proto__" && Eu ? Eu(r, o, {
            configurable: !0,
            enumerable: !0,
            value: f,
            writable: !0
          }) : r[o] = f;
        }
        function sh(r, o) {
          for (var f = -1, p = o.length, S = s(p), b = r == null; ++f < p; )
            S[f] = b ? a : qh(r, o[f]);
          return S;
        }
        function hr(r, o, f) {
          return r === r && (f !== a && (r = r <= f ? r : f), o !== a && (r = r >= o ? r : o)), r;
        }
        function En(r, o, f, p, S, b) {
          var A, O = o & E, F = o & k, V = o & P;
          if (f && (A = S ? f(r, p, S, b) : f(r)), A !== a)
            return A;
          if (!Jt(r))
            return r;
          var W = St(r);
          if (W) {
            if (A = $d(r), !O)
              return He(r, A);
          } else {
            var Q = Ie(r), at = Q == R || Q == nn;
            if (Li(r))
              return cc(r, O);
            if (Q == rn || Q == ke || at && !S) {
              if (A = F || at ? {} : Pc(r), !O)
                return F ? jd(r, cd(A, r)) : zd(r, zl(A, r));
            } else {
              if (!Yt[Q])
                return S ? r : {};
              A = t_(r, Q, O);
            }
          }
          b || (b = new Rn());
          var ft = b.get(r);
          if (ft)
            return ft;
          b.set(r, A), af(r) ? r.forEach(function(Et) {
            A.add(En(Et, o, f, Et, r, b));
          }) : rf(r) && r.forEach(function(Et, Rt) {
            A.set(Rt, En(Et, o, f, Rt, r, b));
          });
          var xt = V ? F ? Sh : wh : F ? Ze : me, bt = W ? a : xt(r);
          return Ve(bt || r, function(Et, Rt) {
            bt && (Rt = Et, Et = r[Rt]), na(A, Rt, En(Et, o, f, Rt, r, b));
          }), A;
        }
        function fd(r) {
          var o = me(r);
          return function(f) {
            return jl(f, r, o);
          };
        }
        function jl(r, o, f) {
          var p = f.length;
          if (r == null)
            return !p;
          for (r = I(r); p--; ) {
            var S = f[p], b = o[S], A = r[S];
            if (A === a && !(S in r) || !b(A))
              return !1;
          }
          return !0;
        }
        function Ul(r, o, f) {
          if (typeof r != "function")
            throw new q(m);
          return ha(function() {
            r.apply(a, f);
          }, o);
        }
        function ia(r, o, f, p) {
          var S = -1, b = yn, A = !0, O = r.length, F = [], V = o.length;
          if (!O)
            return F;
          f && (o = Zt(o, Te(f))), p ? (b = ve, A = !1) : o.length >= c && (b = bi, A = !1, o = new or(o));
          t:
            for (; ++S < O; ) {
              var W = r[S], Q = f == null ? W : f(W);
              if (W = p || W !== 0 ? W : 0, A && Q === Q) {
                for (var at = V; at--; )
                  if (o[at] === Q)
                    continue t;
                F.push(W);
              } else b(o, Q, p) || F.push(W);
            }
          return F;
        }
        var Ti = mc(jn), Yl = mc(uh, !0);
        function gd(r, o) {
          var f = !0;
          return Ti(r, function(p, S, b) {
            return f = !!o(p, S, b), f;
          }), f;
        }
        function bu(r, o, f) {
          for (var p = -1, S = r.length; ++p < S; ) {
            var b = r[p], A = o(b);
            if (A != null && (O === a ? A === A && !fn(A) : f(A, O)))
              var O = A, F = b;
          }
          return F;
        }
        function dd(r, o, f, p) {
          var S = r.length;
          for (f = Nt(f), f < 0 && (f = -f > S ? 0 : S + f), p = p === a || p > S ? S : Nt(p), p < 0 && (p += S), p = f > p ? 0 : of(p); f < p; )
            r[f++] = o;
          return r;
        }
        function Xl(r, o) {
          var f = [];
          return Ti(r, function(p, S, b) {
            o(p, S, b) && f.push(p);
          }), f;
        }
        function xe(r, o, f, p, S) {
          var b = -1, A = r.length;
          for (f || (f = n_), S || (S = []); ++b < A; ) {
            var O = r[b];
            o > 0 && f(O) ? o > 1 ? xe(O, o - 1, f, p, S) : Tn(S, O) : p || (S[S.length] = O);
          }
          return S;
        }
        var ah = yc(), Vl = yc(!0);
        function jn(r, o) {
          return r && ah(r, o, me);
        }
        function uh(r, o) {
          return r && Vl(r, o, me);
        }
        function Cu(r, o) {
          return Bn(o, function(f) {
            return yi(r[f]);
          });
        }
        function lr(r, o) {
          o = Ri(o, r);
          for (var f = 0, p = o.length; r != null && f < p; )
            r = r[Yn(o[f++])];
          return f && f == p ? r : a;
        }
        function Wl(r, o, f) {
          var p = o(r);
          return St(r) ? p : Tn(p, f(r));
        }
        function Ae(r) {
          return r == null ? r === a ? kt : za : ar && ar in I(r) ? Zd(r) : h_(r);
        }
        function oh(r, o) {
          return r > o;
        }
        function _d(r, o) {
          return r != null && lt.call(r, o);
        }
        function md(r, o) {
          return r != null && o in I(r);
        }
        function yd(r, o, f) {
          return r >= Se(o, f) && r < de(o, f);
        }
        function hh(r, o, f) {
          for (var p = f ? ve : yn, S = r[0].length, b = r.length, A = b, O = s(b), F = 1 / 0, V = []; A--; ) {
            var W = r[A];
            A && o && (W = Zt(W, Te(o))), F = Se(W.length, F), O[A] = !f && (o || S >= 120 && W.length >= 120) ? new or(A && W) : a;
          }
          W = r[0];
          var Q = -1, at = O[0];
          t:
            for (; ++Q < S && V.length < F; ) {
              var ft = W[Q], xt = o ? o(ft) : ft;
              if (ft = f || ft !== 0 ? ft : 0, !(at ? bi(at, xt) : p(V, xt, f))) {
                for (A = b; --A; ) {
                  var bt = O[A];
                  if (!(bt ? bi(bt, xt) : p(r[A], xt, f)))
                    continue t;
                }
                at && at.push(xt), V.push(ft);
              }
            }
          return V;
        }
        function pd(r, o, f, p) {
          return jn(r, function(S, b, A) {
            o(p, f(S), b, A);
          }), p;
        }
        function ra(r, o, f) {
          o = Ri(o, r), r = Oc(r, o);
          var p = r == null ? r : r[Yn(kn(o))];
          return p == null ? a : Pe(p, r, f);
        }
        function Hl(r) {
          return ie(r) && Ae(r) == ke;
        }
        function vd(r) {
          return ie(r) && Ae(r) == Jn;
        }
        function xd(r) {
          return ie(r) && Ae(r) == Vi;
        }
        function sa(r, o, f, p, S) {
          return r === o ? !0 : r == null || o == null || !ie(r) && !ie(o) ? r !== r && o !== o : Ed(r, o, f, p, sa, S);
        }
        function Ed(r, o, f, p, S, b) {
          var A = St(r), O = St(o), F = A ? xr : Ie(r), V = O ? xr : Ie(o);
          F = F == ke ? rn : F, V = V == ke ? rn : V;
          var W = F == rn, Q = V == rn, at = F == V;
          if (at && Li(r)) {
            if (!Li(o))
              return !1;
            A = !0, W = !1;
          }
          if (at && !W)
            return b || (b = new Rn()), A || Vr(r) ? Nc(r, o, f, p, S, b) : Hd(r, o, F, f, p, S, b);
          if (!(f & C)) {
            var ft = W && lt.call(r, "__wrapped__"), xt = Q && lt.call(o, "__wrapped__");
            if (ft || xt) {
              var bt = ft ? r.value() : r, Et = xt ? o.value() : o;
              return b || (b = new Rn()), S(bt, Et, f, p, b);
            }
          }
          return at ? (b || (b = new Rn()), Kd(r, o, f, p, S, b)) : !1;
        }
        function Md(r) {
          return ie(r) && Ie(r) == we;
        }
        function lh(r, o, f, p) {
          var S = f.length, b = S, A = !p;
          if (r == null)
            return !b;
          for (r = I(r); S--; ) {
            var O = f[S];
            if (A && O[2] ? O[1] !== r[O[0]] : !(O[0] in r))
              return !1;
          }
          for (; ++S < b; ) {
            O = f[S];
            var F = O[0], V = r[F], W = O[1];
            if (A && O[2]) {
              if (V === a && !(F in r))
                return !1;
            } else {
              var Q = new Rn();
              if (p)
                var at = p(V, W, F, r, o, Q);
              if (!(at === a ? sa(W, V, C | L, p, Q) : at))
                return !1;
            }
          }
          return !0;
        }
        function Kl(r) {
          if (!Jt(r) || r_(r))
            return !1;
          var o = yi(r) ? vu : Es;
          return o.test(fr(r));
        }
        function kd(r) {
          return ie(r) && Ae(r) == wi;
        }
        function wd(r) {
          return ie(r) && Ie(r) == Be;
        }
        function Sd(r) {
          return ie(r) && Vu(r.length) && !!Bt[Ae(r)];
        }
        function Zl(r) {
          return typeof r == "function" ? r : r == null ? Qe : typeof r == "object" ? St(r) ? $l(r[0], r[1]) : Jl(r) : vf(r);
        }
        function ch(r) {
          if (!oa(r))
            return b0(r);
          var o = [];
          for (var f in I(r))
            lt.call(r, f) && f != "constructor" && o.push(f);
          return o;
        }
        function Id(r) {
          if (!Jt(r))
            return o_(r);
          var o = oa(r), f = [];
          for (var p in r)
            p == "constructor" && (o || !lt.call(r, p)) || f.push(p);
          return f;
        }
        function fh(r, o) {
          return r < o;
        }
        function Ql(r, o) {
          var f = -1, p = Ke(r) ? s(r.length) : [];
          return Ti(r, function(S, b, A) {
            p[++f] = o(S, b, A);
          }), p;
        }
        function Jl(r) {
          var o = Nh(r);
          return o.length == 1 && o[0][2] ? Ac(o[0][0], o[0][1]) : function(f) {
            return f === r || lh(f, r, o);
          };
        }
        function $l(r, o) {
          return Ch(r) && Tc(o) ? Ac(Yn(r), o) : function(f) {
            var p = qh(f, r);
            return p === a && p === o ? Bh(f, r) : sa(o, p, C | L);
          };
        }
        function Pu(r, o, f, p, S) {
          r !== o && ah(o, function(b, A) {
            if (S || (S = new Rn()), Jt(b))
              Nd(r, o, A, f, Pu, p, S);
            else {
              var O = p ? p(Th(r, A), b, A + "", r, o, S) : a;
              O === a && (O = b), rh(r, A, O);
            }
          }, Ze);
        }
        function Nd(r, o, f, p, S, b, A) {
          var O = Th(r, f), F = Th(o, f), V = A.get(F);
          if (V) {
            rh(r, f, V);
            return;
          }
          var W = b ? b(O, F, f + "", r, o, A) : a, Q = W === a;
          if (Q) {
            var at = St(F), ft = !at && Li(F), xt = !at && !ft && Vr(F);
            W = F, at || ft || xt ? St(O) ? W = O : ae(O) ? W = He(O) : ft ? (Q = !1, W = cc(F, !0)) : xt ? (Q = !1, W = fc(F, !0)) : W = [] : la(F) || gr(F) ? (W = O, gr(O) ? W = hf(O) : (!Jt(O) || yi(O)) && (W = Pc(F))) : Q = !1;
          }
          Q && (A.set(F, W), S(W, F, p, b, A), A.delete(F)), rh(r, f, W);
        }
        function tc(r, o) {
          var f = r.length;
          if (f)
            return o += o < 0 ? f : 0, mi(o, f) ? r[o] : a;
        }
        function ec(r, o, f) {
          o.length ? o = Zt(o, function(b) {
            return St(b) ? function(A) {
              return lr(A, b.length === 1 ? b[0] : b);
            } : b;
          }) : o = [Qe];
          var p = -1;
          o = Zt(o, Te(pt()));
          var S = Ql(r, function(b, A, O) {
            var F = Zt(o, function(V) {
              return V(b);
            });
            return { criteria: F, index: ++p, value: b };
          });
          return Xo(S, function(b, A) {
            return Bd(b, A, f);
          });
        }
        function bd(r, o) {
          return nc(r, o, function(f, p) {
            return Bh(r, p);
          });
        }
        function nc(r, o, f) {
          for (var p = -1, S = o.length, b = {}; ++p < S; ) {
            var A = o[p], O = lr(r, A);
            f(O, A) && aa(b, Ri(A, r), O);
          }
          return b;
        }
        function Cd(r) {
          return function(o) {
            return lr(o, r);
          };
        }
        function gh(r, o, f, p) {
          var S = p ? Yo : pn, b = -1, A = o.length, O = r;
          for (r === o && (o = He(o)), f && (O = Zt(r, Te(f))); ++b < A; )
            for (var F = 0, V = o[b], W = f ? f(V) : V; (F = S(O, W, F, p)) > -1; )
              O !== r && xu.call(O, F, 1), xu.call(r, F, 1);
          return r;
        }
        function ic(r, o) {
          for (var f = r ? o.length : 0, p = f - 1; f--; ) {
            var S = o[f];
            if (f == p || S !== b) {
              var b = S;
              mi(S) ? xu.call(r, S, 1) : yh(r, S);
            }
          }
          return r;
        }
        function dh(r, o) {
          return r + ku(Dl() * (o - r + 1));
        }
        function Pd(r, o, f, p) {
          for (var S = -1, b = de(Mu((o - r) / (f || 1)), 0), A = s(b); b--; )
            A[p ? b : ++S] = r, r += f;
          return A;
        }
        function _h(r, o) {
          var f = "";
          if (!r || o < 1 || o > Vt)
            return f;
          do
            o % 2 && (f += r), o = ku(o / 2), o && (r += r);
          while (o);
          return f;
        }
        function Tt(r, o) {
          return Ah(Rc(r, o, Qe), r + "");
        }
        function Td(r) {
          return Bl(Wr(r));
        }
        function Ad(r, o) {
          var f = Wr(r);
          return Bu(f, hr(o, 0, f.length));
        }
        function aa(r, o, f, p) {
          if (!Jt(r))
            return r;
          o = Ri(o, r);
          for (var S = -1, b = o.length, A = b - 1, O = r; O != null && ++S < b; ) {
            var F = Yn(o[S]), V = f;
            if (F === "__proto__" || F === "constructor" || F === "prototype")
              return r;
            if (S != A) {
              var W = O[F];
              V = p ? p(W, F, O) : a, V === a && (V = Jt(W) ? W : mi(o[S + 1]) ? [] : {});
            }
            na(O, F, V), O = O[F];
          }
          return r;
        }
        var rc = wu ? function(r, o) {
          return wu.set(r, o), r;
        } : Qe, Rd = Eu ? function(r, o) {
          return Eu(r, "toString", {
            configurable: !0,
            enumerable: !1,
            value: jh(o),
            writable: !0
          });
        } : Qe;
        function Od(r) {
          return Bu(Wr(r));
        }
        function Mn(r, o, f) {
          var p = -1, S = r.length;
          o < 0 && (o = -o > S ? 0 : S + o), f = f > S ? S : f, f < 0 && (f += S), S = o > f ? 0 : f - o >>> 0, o >>>= 0;
          for (var b = s(S); ++p < S; )
            b[p] = r[p + o];
          return b;
        }
        function Ld(r, o) {
          var f;
          return Ti(r, function(p, S, b) {
            return f = o(p, S, b), !f;
          }), !!f;
        }
        function Tu(r, o, f) {
          var p = 0, S = r == null ? p : r.length;
          if (typeof o == "number" && o === o && S <= Me) {
            for (; p < S; ) {
              var b = p + S >>> 1, A = r[b];
              A !== null && !fn(A) && (f ? A <= o : A < o) ? p = b + 1 : S = b;
            }
            return S;
          }
          return mh(r, o, Qe, f);
        }
        function mh(r, o, f, p) {
          var S = 0, b = r == null ? 0 : r.length;
          if (b === 0)
            return 0;
          o = f(o);
          for (var A = o !== o, O = o === null, F = fn(o), V = o === a; S < b; ) {
            var W = ku((S + b) / 2), Q = f(r[W]), at = Q !== a, ft = Q === null, xt = Q === Q, bt = fn(Q);
            if (A)
              var Et = p || xt;
            else V ? Et = xt && (p || at) : O ? Et = xt && at && (p || !ft) : F ? Et = xt && at && !ft && (p || !bt) : ft || bt ? Et = !1 : Et = p ? Q <= o : Q < o;
            Et ? S = W + 1 : b = W;
          }
          return Se(b, le);
        }
        function sc(r, o) {
          for (var f = -1, p = r.length, S = 0, b = []; ++f < p; ) {
            var A = r[f], O = o ? o(A) : A;
            if (!f || !On(O, F)) {
              var F = O;
              b[S++] = A === 0 ? 0 : A;
            }
          }
          return b;
        }
        function ac(r) {
          return typeof r == "number" ? r : fn(r) ? ht : +r;
        }
        function cn(r) {
          if (typeof r == "string")
            return r;
          if (St(r))
            return Zt(r, cn) + "";
          if (fn(r))
            return Fl ? Fl.call(r) : "";
          var o = r + "";
          return o == "0" && 1 / r == -Dt ? "-0" : o;
        }
        function Ai(r, o, f) {
          var p = -1, S = yn, b = r.length, A = !0, O = [], F = O;
          if (f)
            A = !1, S = ve;
          else if (b >= c) {
            var V = o ? null : Vd(r);
            if (V)
              return er(V);
            A = !1, S = bi, F = new or();
          } else
            F = o ? [] : O;
          t:
            for (; ++p < b; ) {
              var W = r[p], Q = o ? o(W) : W;
              if (W = f || W !== 0 ? W : 0, A && Q === Q) {
                for (var at = F.length; at--; )
                  if (F[at] === Q)
                    continue t;
                o && F.push(Q), O.push(W);
              } else S(F, Q, f) || (F !== O && F.push(Q), O.push(W));
            }
          return O;
        }
        function yh(r, o) {
          return o = Ri(o, r), r = Oc(r, o), r == null || delete r[Yn(kn(o))];
        }
        function uc(r, o, f, p) {
          return aa(r, o, f(lr(r, o)), p);
        }
        function Au(r, o, f, p) {
          for (var S = r.length, b = p ? S : -1; (p ? b-- : ++b < S) && o(r[b], b, r); )
            ;
          return f ? Mn(r, p ? 0 : b, p ? b + 1 : S) : Mn(r, p ? b + 1 : 0, p ? S : b);
        }
        function oc(r, o) {
          var f = r;
          return f instanceof Ot && (f = f.value()), Fs(o, function(p, S) {
            return S.func.apply(S.thisArg, Tn([p], S.args));
          }, f);
        }
        function ph(r, o, f) {
          var p = r.length;
          if (p < 2)
            return p ? Ai(r[0]) : [];
          for (var S = -1, b = s(p); ++S < p; )
            for (var A = r[S], O = -1; ++O < p; )
              O != S && (b[S] = ia(b[S] || A, r[O], o, f));
          return Ai(xe(b, 1), o, f);
        }
        function hc(r, o, f) {
          for (var p = -1, S = r.length, b = o.length, A = {}; ++p < S; ) {
            var O = p < b ? o[p] : a;
            f(A, r[p], O);
          }
          return A;
        }
        function vh(r) {
          return ae(r) ? r : [];
        }
        function xh(r) {
          return typeof r == "function" ? r : Qe;
        }
        function Ri(r, o) {
          return St(r) ? r : Ch(r, o) ? [r] : Fc(zt(r));
        }
        var Gd = Tt;
        function Oi(r, o, f) {
          var p = r.length;
          return f = f === a ? p : f, !o && f >= p ? r : Mn(r, o, f);
        }
        var lc = k0 || function(r) {
          return ne.clearTimeout(r);
        };
        function cc(r, o) {
          if (o)
            return r.slice();
          var f = r.length, p = Zs ? Zs(f) : new r.constructor(f);
          return r.copy(p), p;
        }
        function Eh(r) {
          var o = new r.constructor(r.byteLength);
          return new rr(o).set(new rr(r)), o;
        }
        function Dd(r, o) {
          var f = o ? Eh(r.buffer) : r.buffer;
          return new r.constructor(f, r.byteOffset, r.byteLength);
        }
        function Fd(r) {
          var o = new r.constructor(r.source, Si.exec(r));
          return o.lastIndex = r.lastIndex, o;
        }
        function qd(r) {
          return ea ? I(ea.call(r)) : {};
        }
        function fc(r, o) {
          var f = o ? Eh(r.buffer) : r.buffer;
          return new r.constructor(f, r.byteOffset, r.length);
        }
        function gc(r, o) {
          if (r !== o) {
            var f = r !== a, p = r === null, S = r === r, b = fn(r), A = o !== a, O = o === null, F = o === o, V = fn(o);
            if (!O && !V && !b && r > o || b && A && F && !O && !V || p && A && F || !f && F || !S)
              return 1;
            if (!p && !b && !V && r < o || V && f && S && !p && !b || O && f && S || !A && S || !F)
              return -1;
          }
          return 0;
        }
        function Bd(r, o, f) {
          for (var p = -1, S = r.criteria, b = o.criteria, A = S.length, O = f.length; ++p < A; ) {
            var F = gc(S[p], b[p]);
            if (F) {
              if (p >= O)
                return F;
              var V = f[p];
              return F * (V == "desc" ? -1 : 1);
            }
          }
          return r.index - o.index;
        }
        function dc(r, o, f, p) {
          for (var S = -1, b = r.length, A = f.length, O = -1, F = o.length, V = de(b - A, 0), W = s(F + V), Q = !p; ++O < F; )
            W[O] = o[O];
          for (; ++S < A; )
            (Q || S < b) && (W[f[S]] = r[S]);
          for (; V--; )
            W[O++] = r[S++];
          return W;
        }
        function _c(r, o, f, p) {
          for (var S = -1, b = r.length, A = -1, O = f.length, F = -1, V = o.length, W = de(b - O, 0), Q = s(W + V), at = !p; ++S < W; )
            Q[S] = r[S];
          for (var ft = S; ++F < V; )
            Q[ft + F] = o[F];
          for (; ++A < O; )
            (at || S < b) && (Q[ft + f[A]] = r[S++]);
          return Q;
        }
        function He(r, o) {
          var f = -1, p = r.length;
          for (o || (o = s(p)); ++f < p; )
            o[f] = r[f];
          return o;
        }
        function Un(r, o, f, p) {
          var S = !f;
          f || (f = {});
          for (var b = -1, A = o.length; ++b < A; ) {
            var O = o[b], F = p ? p(f[O], r[O], O, f, r) : a;
            F === a && (F = r[O]), S ? gi(f, O, F) : na(f, O, F);
          }
          return f;
        }
        function zd(r, o) {
          return Un(r, bh(r), o);
        }
        function jd(r, o) {
          return Un(r, bc(r), o);
        }
        function Ru(r, o) {
          return function(f, p) {
            var S = St(f) ? jo : ld, b = o ? o() : {};
            return S(f, r, pt(p, 2), b);
          };
        }
        function Ur(r) {
          return Tt(function(o, f) {
            var p = -1, S = f.length, b = S > 1 ? f[S - 1] : a, A = S > 2 ? f[2] : a;
            for (b = r.length > 3 && typeof b == "function" ? (S--, b) : a, A && Re(f[0], f[1], A) && (b = S < 3 ? a : b, S = 1), o = I(o); ++p < S; ) {
              var O = f[p];
              O && r(o, O, p, b);
            }
            return o;
          });
        }
        function mc(r, o) {
          return function(f, p) {
            if (f == null)
              return f;
            if (!Ke(f))
              return r(f, p);
            for (var S = f.length, b = o ? S : -1, A = I(f); (o ? b-- : ++b < S) && p(A[b], b, A) !== !1; )
              ;
            return f;
          };
        }
        function yc(r) {
          return function(o, f, p) {
            for (var S = -1, b = I(o), A = p(o), O = A.length; O--; ) {
              var F = A[r ? O : ++S];
              if (f(b[F], F, b) === !1)
                break;
            }
            return o;
          };
        }
        function Ud(r, o, f) {
          var p = o & D, S = ua(r);
          function b() {
            var A = this && this !== ne && this instanceof b ? S : r;
            return A.apply(p ? f : this, arguments);
          }
          return b;
        }
        function pc(r) {
          return function(o) {
            o = zt(o);
            var f = Ci(o) ? ln(o) : a, p = f ? f[0] : o.charAt(0), S = f ? Oi(f, 1).join("") : o.slice(1);
            return p[r]() + S;
          };
        }
        function Yr(r) {
          return function(o) {
            return Fs(yf(mf(o).replace(nu, "")), r, "");
          };
        }
        function ua(r) {
          return function() {
            var o = arguments;
            switch (o.length) {
              case 0:
                return new r();
              case 1:
                return new r(o[0]);
              case 2:
                return new r(o[0], o[1]);
              case 3:
                return new r(o[0], o[1], o[2]);
              case 4:
                return new r(o[0], o[1], o[2], o[3]);
              case 5:
                return new r(o[0], o[1], o[2], o[3], o[4]);
              case 6:
                return new r(o[0], o[1], o[2], o[3], o[4], o[5]);
              case 7:
                return new r(o[0], o[1], o[2], o[3], o[4], o[5], o[6]);
            }
            var f = jr(r.prototype), p = r.apply(f, o);
            return Jt(p) ? p : f;
          };
        }
        function Yd(r, o, f) {
          var p = ua(r);
          function S() {
            for (var b = arguments.length, A = s(b), O = b, F = Xr(S); O--; )
              A[O] = arguments[O];
            var V = b < 3 && A[0] !== F && A[b - 1] !== F ? [] : zn(A, F);
            if (b -= V.length, b < f)
              return kc(
                r,
                o,
                Ou,
                S.placeholder,
                a,
                A,
                V,
                a,
                a,
                f - b
              );
            var W = this && this !== ne && this instanceof S ? p : r;
            return Pe(W, this, A);
          }
          return S;
        }
        function vc(r) {
          return function(o, f, p) {
            var S = I(o);
            if (!Ke(o)) {
              var b = pt(f, 3);
              o = me(o), f = function(O) {
                return b(S[O], O, S);
              };
            }
            var A = r(o, f, p);
            return A > -1 ? S[b ? o[A] : A] : a;
          };
        }
        function xc(r) {
          return _i(function(o) {
            var f = o.length, p = f, S = xn.prototype.thru;
            for (r && o.reverse(); p--; ) {
              var b = o[p];
              if (typeof b != "function")
                throw new q(m);
              if (S && !A && Fu(b) == "wrapper")
                var A = new xn([], !0);
            }
            for (p = A ? p : f; ++p < f; ) {
              b = o[p];
              var O = Fu(b), F = O == "wrapper" ? Ih(b) : a;
              F && Ph(F[0]) && F[1] == (Z | U | Y | et) && !F[4].length && F[9] == 1 ? A = A[Fu(F[0])].apply(A, F[3]) : A = b.length == 1 && Ph(b) ? A[O]() : A.thru(b);
            }
            return function() {
              var V = arguments, W = V[0];
              if (A && V.length == 1 && St(W))
                return A.plant(W).value();
              for (var Q = 0, at = f ? o[Q].apply(this, V) : W; ++Q < f; )
                at = o[Q].call(this, at);
              return at;
            };
          });
        }
        function Ou(r, o, f, p, S, b, A, O, F, V) {
          var W = o & Z, Q = o & D, at = o & B, ft = o & (U | X), xt = o & $, bt = at ? a : ua(r);
          function Et() {
            for (var Rt = arguments.length, Lt = s(Rt), gn = Rt; gn--; )
              Lt[gn] = arguments[gn];
            if (ft)
              var Oe = Xr(Et), dn = Wo(Lt, Oe);
            if (p && (Lt = dc(Lt, p, S, ft)), b && (Lt = _c(Lt, b, A, ft)), Rt -= dn, ft && Rt < V) {
              var ue = zn(Lt, Oe);
              return kc(
                r,
                o,
                Ou,
                Et.placeholder,
                f,
                Lt,
                ue,
                O,
                F,
                V - Rt
              );
            }
            var Ln = Q ? f : this, vi = at ? Ln[r] : r;
            return Rt = Lt.length, O ? Lt = l_(Lt, O) : xt && Rt > 1 && Lt.reverse(), W && F < Rt && (Lt.length = F), this && this !== ne && this instanceof Et && (vi = bt || ua(vi)), vi.apply(Ln, Lt);
          }
          return Et;
        }
        function Ec(r, o) {
          return function(f, p) {
            return pd(f, r, o(p), {});
          };
        }
        function Lu(r, o) {
          return function(f, p) {
            var S;
            if (f === a && p === a)
              return o;
            if (f !== a && (S = f), p !== a) {
              if (S === a)
                return p;
              typeof f == "string" || typeof p == "string" ? (f = cn(f), p = cn(p)) : (f = ac(f), p = ac(p)), S = r(f, p);
            }
            return S;
          };
        }
        function Mh(r) {
          return _i(function(o) {
            return o = Zt(o, Te(pt())), Tt(function(f) {
              var p = this;
              return r(o, function(S) {
                return Pe(S, p, f);
              });
            });
          });
        }
        function Gu(r, o) {
          o = o === a ? " " : cn(o);
          var f = o.length;
          if (f < 2)
            return f ? _h(o, r) : o;
          var p = _h(o, Mu(r / hi(o)));
          return Ci(o) ? Oi(ln(p), 0, r).join("") : p.slice(0, r);
        }
        function Xd(r, o, f, p) {
          var S = o & D, b = ua(r);
          function A() {
            for (var O = -1, F = arguments.length, V = -1, W = p.length, Q = s(W + F), at = this && this !== ne && this instanceof A ? b : r; ++V < W; )
              Q[V] = p[V];
            for (; F--; )
              Q[V++] = arguments[++O];
            return Pe(at, S ? f : this, Q);
          }
          return A;
        }
        function Mc(r) {
          return function(o, f, p) {
            return p && typeof p != "number" && Re(o, f, p) && (f = p = a), o = pi(o), f === a ? (f = o, o = 0) : f = pi(f), p = p === a ? o < f ? 1 : -1 : pi(p), Pd(o, f, p, r);
          };
        }
        function Du(r) {
          return function(o, f) {
            return typeof o == "string" && typeof f == "string" || (o = wn(o), f = wn(f)), r(o, f);
          };
        }
        function kc(r, o, f, p, S, b, A, O, F, V) {
          var W = o & U, Q = W ? A : a, at = W ? a : A, ft = W ? b : a, xt = W ? a : b;
          o |= W ? Y : H, o &= ~(W ? H : Y), o & j || (o &= -4);
          var bt = [
            r,
            o,
            S,
            ft,
            Q,
            xt,
            at,
            O,
            F,
            V
          ], Et = f.apply(a, bt);
          return Ph(r) && Lc(Et, bt), Et.placeholder = p, Gc(Et, r, o);
        }
        function kh(r) {
          var o = x[r];
          return function(f, p) {
            if (f = wn(f), p = p == null ? 0 : Se(Nt(p), 292), p && Gl(f)) {
              var S = (zt(f) + "e").split("e"), b = o(S[0] + "e" + (+S[1] + p));
              return S = (zt(b) + "e").split("e"), +(S[0] + "e" + (+S[1] - p));
            }
            return o(f);
          };
        }
        var Vd = Br && 1 / er(new Br([, -0]))[1] == Dt ? function(r) {
          return new Br(r);
        } : Xh;
        function wc(r) {
          return function(o) {
            var f = Ie(o);
            return f == we ? Dr(o) : f == Be ? Ks(o) : Vo(o, r(o));
          };
        }
        function di(r, o, f, p, S, b, A, O) {
          var F = o & B;
          if (!F && typeof r != "function")
            throw new q(m);
          var V = p ? p.length : 0;
          if (V || (o &= -97, p = S = a), A = A === a ? A : de(Nt(A), 0), O = O === a ? O : Nt(O), V -= S ? S.length : 0, o & H) {
            var W = p, Q = S;
            p = S = a;
          }
          var at = F ? a : Ih(r), ft = [
            r,
            o,
            f,
            p,
            S,
            W,
            Q,
            b,
            A,
            O
          ];
          if (at && u_(ft, at), r = ft[0], o = ft[1], f = ft[2], p = ft[3], S = ft[4], O = ft[9] = ft[9] === a ? F ? 0 : r.length : de(ft[9] - V, 0), !O && o & (U | X) && (o &= -25), !o || o == D)
            var xt = Ud(r, o, f);
          else o == U || o == X ? xt = Yd(r, o, O) : (o == Y || o == (D | Y)) && !S.length ? xt = Xd(r, o, f, p) : xt = Ou.apply(a, ft);
          var bt = at ? rc : Lc;
          return Gc(bt(xt, ft), r, o);
        }
        function Sc(r, o, f, p) {
          return r === a || On(r, ot[f]) && !lt.call(p, f) ? o : r;
        }
        function Ic(r, o, f, p, S, b) {
          return Jt(r) && Jt(o) && (b.set(o, r), Pu(r, o, a, Ic, b), b.delete(o)), r;
        }
        function Wd(r) {
          return la(r) ? a : r;
        }
        function Nc(r, o, f, p, S, b) {
          var A = f & C, O = r.length, F = o.length;
          if (O != F && !(A && F > O))
            return !1;
          var V = b.get(r), W = b.get(o);
          if (V && W)
            return V == o && W == r;
          var Q = -1, at = !0, ft = f & L ? new or() : a;
          for (b.set(r, o), b.set(o, r); ++Q < O; ) {
            var xt = r[Q], bt = o[Q];
            if (p)
              var Et = A ? p(bt, xt, Q, o, r, b) : p(xt, bt, Q, r, o, b);
            if (Et !== a) {
              if (Et)
                continue;
              at = !1;
              break;
            }
            if (ft) {
              if (!Lr(o, function(Rt, Lt) {
                if (!bi(ft, Lt) && (xt === Rt || S(xt, Rt, f, p, b)))
                  return ft.push(Lt);
              })) {
                at = !1;
                break;
              }
            } else if (!(xt === bt || S(xt, bt, f, p, b))) {
              at = !1;
              break;
            }
          }
          return b.delete(r), b.delete(o), at;
        }
        function Hd(r, o, f, p, S, b, A) {
          switch (f) {
            case mt:
              if (r.byteLength != o.byteLength || r.byteOffset != o.byteOffset)
                return !1;
              r = r.buffer, o = o.buffer;
            case Jn:
              return !(r.byteLength != o.byteLength || !b(new rr(r), new rr(o)));
            case z:
            case Vi:
            case qe:
              return On(+r, +o);
            case ct:
              return r.name == o.name && r.message == o.message;
            case wi:
            case sn:
              return r == o + "";
            case we:
              var O = Dr;
            case Be:
              var F = p & C;
              if (O || (O = er), r.size != o.size && !F)
                return !1;
              var V = A.get(r);
              if (V)
                return V == o;
              p |= L, A.set(r, o);
              var W = Nc(O(r), O(o), p, S, b, A);
              return A.delete(r), W;
            case Er:
              if (ea)
                return ea.call(r) == ea.call(o);
          }
          return !1;
        }
        function Kd(r, o, f, p, S, b) {
          var A = f & C, O = wh(r), F = O.length, V = wh(o), W = V.length;
          if (F != W && !A)
            return !1;
          for (var Q = F; Q--; ) {
            var at = O[Q];
            if (!(A ? at in o : lt.call(o, at)))
              return !1;
          }
          var ft = b.get(r), xt = b.get(o);
          if (ft && xt)
            return ft == o && xt == r;
          var bt = !0;
          b.set(r, o), b.set(o, r);
          for (var Et = A; ++Q < F; ) {
            at = O[Q];
            var Rt = r[at], Lt = o[at];
            if (p)
              var gn = A ? p(Lt, Rt, at, o, r, b) : p(Rt, Lt, at, r, o, b);
            if (!(gn === a ? Rt === Lt || S(Rt, Lt, f, p, b) : gn)) {
              bt = !1;
              break;
            }
            Et || (Et = at == "constructor");
          }
          if (bt && !Et) {
            var Oe = r.constructor, dn = o.constructor;
            Oe != dn && "constructor" in r && "constructor" in o && !(typeof Oe == "function" && Oe instanceof Oe && typeof dn == "function" && dn instanceof dn) && (bt = !1);
          }
          return b.delete(r), b.delete(o), bt;
        }
        function _i(r) {
          return Ah(Rc(r, a, jc), r + "");
        }
        function wh(r) {
          return Wl(r, me, bh);
        }
        function Sh(r) {
          return Wl(r, Ze, bc);
        }
        var Ih = wu ? function(r) {
          return wu.get(r);
        } : Xh;
        function Fu(r) {
          for (var o = r.name + "", f = zr[o], p = lt.call(zr, o) ? f.length : 0; p--; ) {
            var S = f[p], b = S.func;
            if (b == null || b == r)
              return S.name;
          }
          return o;
        }
        function Xr(r) {
          var o = lt.call(N, "placeholder") ? N : r;
          return o.placeholder;
        }
        function pt() {
          var r = N.iteratee || Uh;
          return r = r === Uh ? Zl : r, arguments.length ? r(arguments[0], arguments[1]) : r;
        }
        function qu(r, o) {
          var f = r.__data__;
          return i_(o) ? f[typeof o == "string" ? "string" : "hash"] : f.map;
        }
        function Nh(r) {
          for (var o = me(r), f = o.length; f--; ) {
            var p = o[f], S = r[p];
            o[f] = [p, S, Tc(S)];
          }
          return o;
        }
        function cr(r, o) {
          var f = Qo(r, o);
          return Kl(f) ? f : a;
        }
        function Zd(r) {
          var o = lt.call(r, ar), f = r[ar];
          try {
            r[ar] = a;
            var p = !0;
          } catch {
          }
          var S = se.call(r);
          return p && (o ? r[ar] = f : delete r[ar]), S;
        }
        var bh = eh ? function(r) {
          return r == null ? [] : (r = I(r), Bn(eh(r), function(o) {
            return qr.call(r, o);
          }));
        } : Vh, bc = eh ? function(r) {
          for (var o = []; r; )
            Tn(o, bh(r)), r = sr(r);
          return o;
        } : Vh, Ie = Ae;
        (nh && Ie(new nh(new ArrayBuffer(1))) != mt || Js && Ie(new Js()) != we || ih && Ie(ih.resolve()) != ja || Br && Ie(new Br()) != Be || $s && Ie(new $s()) != bn) && (Ie = function(r) {
          var o = Ae(r), f = o == rn ? r.constructor : a, p = f ? fr(f) : "";
          if (p)
            switch (p) {
              case A0:
                return mt;
              case R0:
                return we;
              case O0:
                return ja;
              case L0:
                return Be;
              case G0:
                return bn;
            }
          return o;
        });
        function Qd(r, o, f) {
          for (var p = -1, S = f.length; ++p < S; ) {
            var b = f[p], A = b.size;
            switch (b.type) {
              case "drop":
                r += A;
                break;
              case "dropRight":
                o -= A;
                break;
              case "take":
                o = Se(o, r + A);
                break;
              case "takeRight":
                r = de(r, o - A);
                break;
            }
          }
          return { start: r, end: o };
        }
        function Jd(r) {
          var o = r.match(br);
          return o ? o[1].split(Oo) : [];
        }
        function Cc(r, o, f) {
          o = Ri(o, r);
          for (var p = -1, S = o.length, b = !1; ++p < S; ) {
            var A = Yn(o[p]);
            if (!(b = r != null && f(r, A)))
              break;
            r = r[A];
          }
          return b || ++p != S ? b : (S = r == null ? 0 : r.length, !!S && Vu(S) && mi(A, S) && (St(r) || gr(r)));
        }
        function $d(r) {
          var o = r.length, f = new r.constructor(o);
          return o && typeof r[0] == "string" && lt.call(r, "index") && (f.index = r.index, f.input = r.input), f;
        }
        function Pc(r) {
          return typeof r.constructor == "function" && !oa(r) ? jr(sr(r)) : {};
        }
        function t_(r, o, f) {
          var p = r.constructor;
          switch (o) {
            case Jn:
              return Eh(r);
            case z:
            case Vi:
              return new p(+r);
            case mt:
              return Dd(r, f);
            case Wi:
            case At:
            case vt:
            case gs:
            case an:
            case ds:
            case yt:
            case _s:
            case ms:
              return fc(r, f);
            case we:
              return new p();
            case qe:
            case sn:
              return new p(r);
            case wi:
              return Fd(r);
            case Be:
              return new p();
            case Er:
              return qd(r);
          }
        }
        function e_(r, o) {
          var f = o.length;
          if (!f)
            return r;
          var p = f - 1;
          return o[p] = (f > 1 ? "& " : "") + o[p], o = o.join(f > 2 ? ", " : " "), r.replace(Ya, `{
/* [wrapped with ` + o + `] */
`);
        }
        function n_(r) {
          return St(r) || gr(r) || !!(Ll && r && r[Ll]);
        }
        function mi(r, o) {
          var f = typeof r;
          return o = o ?? Vt, !!o && (f == "number" || f != "symbol" && Zi.test(r)) && r > -1 && r % 1 == 0 && r < o;
        }
        function Re(r, o, f) {
          if (!Jt(f))
            return !1;
          var p = typeof o;
          return (p == "number" ? Ke(f) && mi(o, f.length) : p == "string" && o in f) ? On(f[o], r) : !1;
        }
        function Ch(r, o) {
          if (St(r))
            return !1;
          var f = typeof r;
          return f == "number" || f == "symbol" || f == "boolean" || r == null || fn(r) ? !0 : Sr.test(r) || !wr.test(r) || o != null && r in I(o);
        }
        function i_(r) {
          var o = typeof r;
          return o == "string" || o == "number" || o == "symbol" || o == "boolean" ? r !== "__proto__" : r === null;
        }
        function Ph(r) {
          var o = Fu(r), f = N[o];
          if (typeof f != "function" || !(o in Ot.prototype))
            return !1;
          if (r === f)
            return !0;
          var p = Ih(f);
          return !!p && r === p[0];
        }
        function r_(r) {
          return !!fe && fe in r;
        }
        var s_ = gt ? yi : Wh;
        function oa(r) {
          var o = r && r.constructor, f = typeof o == "function" && o.prototype || ot;
          return r === f;
        }
        function Tc(r) {
          return r === r && !Jt(r);
        }
        function Ac(r, o) {
          return function(f) {
            return f == null ? !1 : f[r] === o && (o !== a || r in I(f));
          };
        }
        function a_(r) {
          var o = Yu(r, function(p) {
            return f.size === M && f.clear(), p;
          }), f = o.cache;
          return o;
        }
        function u_(r, o) {
          var f = r[1], p = o[1], S = f | p, b = S < (D | B | Z), A = p == Z && f == U || p == Z && f == et && r[7].length <= o[8] || p == (Z | et) && o[7].length <= o[8] && f == U;
          if (!(b || A))
            return r;
          p & D && (r[2] = o[2], S |= f & D ? 0 : j);
          var O = o[3];
          if (O) {
            var F = r[3];
            r[3] = F ? dc(F, O, o[4]) : O, r[4] = F ? zn(r[3], w) : o[4];
          }
          return O = o[5], O && (F = r[5], r[5] = F ? _c(F, O, o[6]) : O, r[6] = F ? zn(r[5], w) : o[6]), O = o[7], O && (r[7] = O), p & Z && (r[8] = r[8] == null ? o[8] : Se(r[8], o[8])), r[9] == null && (r[9] = o[9]), r[0] = o[0], r[1] = S, r;
        }
        function o_(r) {
          var o = [];
          if (r != null)
            for (var f in I(r))
              o.push(f);
          return o;
        }
        function h_(r) {
          return se.call(r);
        }
        function Rc(r, o, f) {
          return o = de(o === a ? r.length - 1 : o, 0), function() {
            for (var p = arguments, S = -1, b = de(p.length - o, 0), A = s(b); ++S < b; )
              A[S] = p[o + S];
            S = -1;
            for (var O = s(o + 1); ++S < o; )
              O[S] = p[S];
            return O[o] = f(A), Pe(r, this, O);
          };
        }
        function Oc(r, o) {
          return o.length < 2 ? r : lr(r, Mn(o, 0, -1));
        }
        function l_(r, o) {
          for (var f = r.length, p = Se(o.length, f), S = He(r); p--; ) {
            var b = o[p];
            r[p] = mi(b, f) ? S[b] : a;
          }
          return r;
        }
        function Th(r, o) {
          if (!(o === "constructor" && typeof r[o] == "function") && o != "__proto__")
            return r[o];
        }
        var Lc = Dc(rc), ha = S0 || function(r, o) {
          return ne.setTimeout(r, o);
        }, Ah = Dc(Rd);
        function Gc(r, o, f) {
          var p = o + "";
          return Ah(r, e_(p, c_(Jd(p), f)));
        }
        function Dc(r) {
          var o = 0, f = 0;
          return function() {
            var p = C0(), S = Ct - (p - f);
            if (f = p, S > 0) {
              if (++o >= Mt)
                return arguments[0];
            } else
              o = 0;
            return r.apply(a, arguments);
          };
        }
        function Bu(r, o) {
          var f = -1, p = r.length, S = p - 1;
          for (o = o === a ? p : o; ++f < o; ) {
            var b = dh(f, S), A = r[b];
            r[b] = r[f], r[f] = A;
          }
          return r.length = o, r;
        }
        var Fc = a_(function(r) {
          var o = [];
          return r.charCodeAt(0) === 46 && o.push(""), r.replace(Ki, function(f, p, S, b) {
            o.push(S ? b.replace(Ce, "$1") : p || f);
          }), o;
        });
        function Yn(r) {
          if (typeof r == "string" || fn(r))
            return r;
          var o = r + "";
          return o == "0" && 1 / r == -Dt ? "-0" : o;
        }
        function fr(r) {
          if (r != null) {
            try {
              return Pt.call(r);
            } catch {
            }
            try {
              return r + "";
            } catch {
            }
          }
          return "";
        }
        function c_(r, o) {
          return Ve(It, function(f) {
            var p = "_." + f[0];
            o & f[1] && !yn(r, p) && r.push(p);
          }), r.sort();
        }
        function qc(r) {
          if (r instanceof Ot)
            return r.clone();
          var o = new xn(r.__wrapped__, r.__chain__);
          return o.__actions__ = He(r.__actions__), o.__index__ = r.__index__, o.__values__ = r.__values__, o;
        }
        function f_(r, o, f) {
          (f ? Re(r, o, f) : o === a) ? o = 1 : o = de(Nt(o), 0);
          var p = r == null ? 0 : r.length;
          if (!p || o < 1)
            return [];
          for (var S = 0, b = 0, A = s(Mu(p / o)); S < p; )
            A[b++] = Mn(r, S, S += o);
          return A;
        }
        function g_(r) {
          for (var o = -1, f = r == null ? 0 : r.length, p = 0, S = []; ++o < f; ) {
            var b = r[o];
            b && (S[p++] = b);
          }
          return S;
        }
        function d_() {
          var r = arguments.length;
          if (!r)
            return [];
          for (var o = s(r - 1), f = arguments[0], p = r; p--; )
            o[p - 1] = arguments[p];
          return Tn(St(f) ? He(f) : [f], xe(o, 1));
        }
        var __ = Tt(function(r, o) {
          return ae(r) ? ia(r, xe(o, 1, ae, !0)) : [];
        }), m_ = Tt(function(r, o) {
          var f = kn(o);
          return ae(f) && (f = a), ae(r) ? ia(r, xe(o, 1, ae, !0), pt(f, 2)) : [];
        }), y_ = Tt(function(r, o) {
          var f = kn(o);
          return ae(f) && (f = a), ae(r) ? ia(r, xe(o, 1, ae, !0), a, f) : [];
        });
        function p_(r, o, f) {
          var p = r == null ? 0 : r.length;
          return p ? (o = f || o === a ? 1 : Nt(o), Mn(r, o < 0 ? 0 : o, p)) : [];
        }
        function v_(r, o, f) {
          var p = r == null ? 0 : r.length;
          return p ? (o = f || o === a ? 1 : Nt(o), o = p - o, Mn(r, 0, o < 0 ? 0 : o)) : [];
        }
        function x_(r, o) {
          return r && r.length ? Au(r, pt(o, 3), !0, !0) : [];
        }
        function E_(r, o) {
          return r && r.length ? Au(r, pt(o, 3), !0) : [];
        }
        function M_(r, o, f, p) {
          var S = r == null ? 0 : r.length;
          return S ? (f && typeof f != "number" && Re(r, o, f) && (f = 0, p = S), dd(r, o, f, p)) : [];
        }
        function Bc(r, o, f) {
          var p = r == null ? 0 : r.length;
          if (!p)
            return -1;
          var S = f == null ? 0 : Nt(f);
          return S < 0 && (S = de(p + S, 0)), _e(r, pt(o, 3), S);
        }
        function zc(r, o, f) {
          var p = r == null ? 0 : r.length;
          if (!p)
            return -1;
          var S = p - 1;
          return f !== a && (S = Nt(f), S = f < 0 ? de(p + S, 0) : Se(S, p - 1)), _e(r, pt(o, 3), S, !0);
        }
        function jc(r) {
          var o = r == null ? 0 : r.length;
          return o ? xe(r, 1) : [];
        }
        function k_(r) {
          var o = r == null ? 0 : r.length;
          return o ? xe(r, Dt) : [];
        }
        function w_(r, o) {
          var f = r == null ? 0 : r.length;
          return f ? (o = o === a ? 1 : Nt(o), xe(r, o)) : [];
        }
        function S_(r) {
          for (var o = -1, f = r == null ? 0 : r.length, p = {}; ++o < f; ) {
            var S = r[o];
            p[S[0]] = S[1];
          }
          return p;
        }
        function Uc(r) {
          return r && r.length ? r[0] : a;
        }
        function I_(r, o, f) {
          var p = r == null ? 0 : r.length;
          if (!p)
            return -1;
          var S = f == null ? 0 : Nt(f);
          return S < 0 && (S = de(p + S, 0)), pn(r, o, S);
        }
        function N_(r) {
          var o = r == null ? 0 : r.length;
          return o ? Mn(r, 0, -1) : [];
        }
        var b_ = Tt(function(r) {
          var o = Zt(r, vh);
          return o.length && o[0] === r[0] ? hh(o) : [];
        }), C_ = Tt(function(r) {
          var o = kn(r), f = Zt(r, vh);
          return o === kn(f) ? o = a : f.pop(), f.length && f[0] === r[0] ? hh(f, pt(o, 2)) : [];
        }), P_ = Tt(function(r) {
          var o = kn(r), f = Zt(r, vh);
          return o = typeof o == "function" ? o : a, o && f.pop(), f.length && f[0] === r[0] ? hh(f, a, o) : [];
        });
        function T_(r, o) {
          return r == null ? "" : N0.call(r, o);
        }
        function kn(r) {
          var o = r == null ? 0 : r.length;
          return o ? r[o - 1] : a;
        }
        function A_(r, o, f) {
          var p = r == null ? 0 : r.length;
          if (!p)
            return -1;
          var S = p;
          return f !== a && (S = Nt(f), S = S < 0 ? de(p + S, 0) : Se(S, p - 1)), o === o ? mu(r, o, S) : _e(r, js, S, !0);
        }
        function R_(r, o) {
          return r && r.length ? tc(r, Nt(o)) : a;
        }
        var O_ = Tt(Yc);
        function Yc(r, o) {
          return r && r.length && o && o.length ? gh(r, o) : r;
        }
        function L_(r, o, f) {
          return r && r.length && o && o.length ? gh(r, o, pt(f, 2)) : r;
        }
        function G_(r, o, f) {
          return r && r.length && o && o.length ? gh(r, o, a, f) : r;
        }
        var D_ = _i(function(r, o) {
          var f = r == null ? 0 : r.length, p = sh(r, o);
          return ic(r, Zt(o, function(S) {
            return mi(S, f) ? +S : S;
          }).sort(gc)), p;
        });
        function F_(r, o) {
          var f = [];
          if (!(r && r.length))
            return f;
          var p = -1, S = [], b = r.length;
          for (o = pt(o, 3); ++p < b; ) {
            var A = r[p];
            o(A, p, r) && (f.push(A), S.push(p));
          }
          return ic(r, S), f;
        }
        function Rh(r) {
          return r == null ? r : T0.call(r);
        }
        function q_(r, o, f) {
          var p = r == null ? 0 : r.length;
          return p ? (f && typeof f != "number" && Re(r, o, f) ? (o = 0, f = p) : (o = o == null ? 0 : Nt(o), f = f === a ? p : Nt(f)), Mn(r, o, f)) : [];
        }
        function B_(r, o) {
          return Tu(r, o);
        }
        function z_(r, o, f) {
          return mh(r, o, pt(f, 2));
        }
        function j_(r, o) {
          var f = r == null ? 0 : r.length;
          if (f) {
            var p = Tu(r, o);
            if (p < f && On(r[p], o))
              return p;
          }
          return -1;
        }
        function U_(r, o) {
          return Tu(r, o, !0);
        }
        function Y_(r, o, f) {
          return mh(r, o, pt(f, 2), !0);
        }
        function X_(r, o) {
          var f = r == null ? 0 : r.length;
          if (f) {
            var p = Tu(r, o, !0) - 1;
            if (On(r[p], o))
              return p;
          }
          return -1;
        }
        function V_(r) {
          return r && r.length ? sc(r) : [];
        }
        function W_(r, o) {
          return r && r.length ? sc(r, pt(o, 2)) : [];
        }
        function H_(r) {
          var o = r == null ? 0 : r.length;
          return o ? Mn(r, 1, o) : [];
        }
        function K_(r, o, f) {
          return r && r.length ? (o = f || o === a ? 1 : Nt(o), Mn(r, 0, o < 0 ? 0 : o)) : [];
        }
        function Z_(r, o, f) {
          var p = r == null ? 0 : r.length;
          return p ? (o = f || o === a ? 1 : Nt(o), o = p - o, Mn(r, o < 0 ? 0 : o, p)) : [];
        }
        function Q_(r, o) {
          return r && r.length ? Au(r, pt(o, 3), !1, !0) : [];
        }
        function J_(r, o) {
          return r && r.length ? Au(r, pt(o, 3)) : [];
        }
        var $_ = Tt(function(r) {
          return Ai(xe(r, 1, ae, !0));
        }), tm = Tt(function(r) {
          var o = kn(r);
          return ae(o) && (o = a), Ai(xe(r, 1, ae, !0), pt(o, 2));
        }), em = Tt(function(r) {
          var o = kn(r);
          return o = typeof o == "function" ? o : a, Ai(xe(r, 1, ae, !0), a, o);
        });
        function nm(r) {
          return r && r.length ? Ai(r) : [];
        }
        function im(r, o) {
          return r && r.length ? Ai(r, pt(o, 2)) : [];
        }
        function rm(r, o) {
          return o = typeof o == "function" ? o : a, r && r.length ? Ai(r, a, o) : [];
        }
        function Oh(r) {
          if (!(r && r.length))
            return [];
          var o = 0;
          return r = Bn(r, function(f) {
            if (ae(f))
              return o = de(f.length, o), !0;
          }), Xs(o, function(f) {
            return Zt(r, Gr(f));
          });
        }
        function Xc(r, o) {
          if (!(r && r.length))
            return [];
          var f = Oh(r);
          return o == null ? f : Zt(f, function(p) {
            return Pe(o, a, p);
          });
        }
        var sm = Tt(function(r, o) {
          return ae(r) ? ia(r, o) : [];
        }), am = Tt(function(r) {
          return ph(Bn(r, ae));
        }), um = Tt(function(r) {
          var o = kn(r);
          return ae(o) && (o = a), ph(Bn(r, ae), pt(o, 2));
        }), om = Tt(function(r) {
          var o = kn(r);
          return o = typeof o == "function" ? o : a, ph(Bn(r, ae), a, o);
        }), hm = Tt(Oh);
        function lm(r, o) {
          return hc(r || [], o || [], na);
        }
        function cm(r, o) {
          return hc(r || [], o || [], aa);
        }
        var fm = Tt(function(r) {
          var o = r.length, f = o > 1 ? r[o - 1] : a;
          return f = typeof f == "function" ? (r.pop(), f) : a, Xc(r, f);
        });
        function Vc(r) {
          var o = N(r);
          return o.__chain__ = !0, o;
        }
        function gm(r, o) {
          return o(r), r;
        }
        function zu(r, o) {
          return o(r);
        }
        var dm = _i(function(r) {
          var o = r.length, f = o ? r[0] : 0, p = this.__wrapped__, S = function(b) {
            return sh(b, r);
          };
          return o > 1 || this.__actions__.length || !(p instanceof Ot) || !mi(f) ? this.thru(S) : (p = p.slice(f, +f + (o ? 1 : 0)), p.__actions__.push({
            func: zu,
            args: [S],
            thisArg: a
          }), new xn(p, this.__chain__).thru(function(b) {
            return o && !b.length && b.push(a), b;
          }));
        });
        function _m() {
          return Vc(this);
        }
        function mm() {
          return new xn(this.value(), this.__chain__);
        }
        function ym() {
          this.__values__ === a && (this.__values__ = uf(this.value()));
          var r = this.__index__ >= this.__values__.length, o = r ? a : this.__values__[this.__index__++];
          return { done: r, value: o };
        }
        function pm() {
          return this;
        }
        function vm(r) {
          for (var o, f = this; f instanceof Iu; ) {
            var p = qc(f);
            p.__index__ = 0, p.__values__ = a, o ? S.__wrapped__ = p : o = p;
            var S = p;
            f = f.__wrapped__;
          }
          return S.__wrapped__ = r, o;
        }
        function xm() {
          var r = this.__wrapped__;
          if (r instanceof Ot) {
            var o = r;
            return this.__actions__.length && (o = new Ot(this)), o = o.reverse(), o.__actions__.push({
              func: zu,
              args: [Rh],
              thisArg: a
            }), new xn(o, this.__chain__);
          }
          return this.thru(Rh);
        }
        function Em() {
          return oc(this.__wrapped__, this.__actions__);
        }
        var Mm = Ru(function(r, o, f) {
          lt.call(r, f) ? ++r[f] : gi(r, f, 1);
        });
        function km(r, o, f) {
          var p = St(r) ? lu : gd;
          return f && Re(r, o, f) && (o = a), p(r, pt(o, 3));
        }
        function wm(r, o) {
          var f = St(r) ? Bn : Xl;
          return f(r, pt(o, 3));
        }
        var Sm = vc(Bc), Im = vc(zc);
        function Nm(r, o) {
          return xe(ju(r, o), 1);
        }
        function bm(r, o) {
          return xe(ju(r, o), Dt);
        }
        function Cm(r, o, f) {
          return f = f === a ? 1 : Nt(f), xe(ju(r, o), f);
        }
        function Wc(r, o) {
          var f = St(r) ? Ve : Ti;
          return f(r, pt(o, 3));
        }
        function Hc(r, o) {
          var f = St(r) ? Uo : Yl;
          return f(r, pt(o, 3));
        }
        var Pm = Ru(function(r, o, f) {
          lt.call(r, f) ? r[f].push(o) : gi(r, f, [o]);
        });
        function Tm(r, o, f, p) {
          r = Ke(r) ? r : Wr(r), f = f && !p ? Nt(f) : 0;
          var S = r.length;
          return f < 0 && (f = de(S + f, 0)), Wu(r) ? f <= S && r.indexOf(o, f) > -1 : !!S && pn(r, o, f) > -1;
        }
        var Am = Tt(function(r, o, f) {
          var p = -1, S = typeof o == "function", b = Ke(r) ? s(r.length) : [];
          return Ti(r, function(A) {
            b[++p] = S ? Pe(o, A, f) : ra(A, o, f);
          }), b;
        }), Rm = Ru(function(r, o, f) {
          gi(r, f, o);
        });
        function ju(r, o) {
          var f = St(r) ? Zt : Ql;
          return f(r, pt(o, 3));
        }
        function Om(r, o, f, p) {
          return r == null ? [] : (St(o) || (o = o == null ? [] : [o]), f = p ? a : f, St(f) || (f = f == null ? [] : [f]), ec(r, o, f));
        }
        var Lm = Ru(function(r, o, f) {
          r[f ? 0 : 1].push(o);
        }, function() {
          return [[], []];
        });
        function Gm(r, o, f) {
          var p = St(r) ? Fs : fu, S = arguments.length < 3;
          return p(r, pt(o, 4), f, S, Ti);
        }
        function Dm(r, o, f) {
          var p = St(r) ? qs : fu, S = arguments.length < 3;
          return p(r, pt(o, 4), f, S, Yl);
        }
        function Fm(r, o) {
          var f = St(r) ? Bn : Xl;
          return f(r, Xu(pt(o, 3)));
        }
        function qm(r) {
          var o = St(r) ? Bl : Td;
          return o(r);
        }
        function Bm(r, o, f) {
          (f ? Re(r, o, f) : o === a) ? o = 1 : o = Nt(o);
          var p = St(r) ? od : Ad;
          return p(r, o);
        }
        function zm(r) {
          var o = St(r) ? hd : Od;
          return o(r);
        }
        function jm(r) {
          if (r == null)
            return 0;
          if (Ke(r))
            return Wu(r) ? hi(r) : r.length;
          var o = Ie(r);
          return o == we || o == Be ? r.size : ch(r).length;
        }
        function Um(r, o, f) {
          var p = St(r) ? Lr : Ld;
          return f && Re(r, o, f) && (o = a), p(r, pt(o, 3));
        }
        var Ym = Tt(function(r, o) {
          if (r == null)
            return [];
          var f = o.length;
          return f > 1 && Re(r, o[0], o[1]) ? o = [] : f > 2 && Re(o[0], o[1], o[2]) && (o = [o[0]]), ec(r, xe(o, 1), []);
        }), Uu = w0 || function() {
          return ne.Date.now();
        };
        function Xm(r, o) {
          if (typeof o != "function")
            throw new q(m);
          return r = Nt(r), function() {
            if (--r < 1)
              return o.apply(this, arguments);
          };
        }
        function Kc(r, o, f) {
          return o = f ? a : o, o = r && o == null ? r.length : o, di(r, Z, a, a, a, a, o);
        }
        function Zc(r, o) {
          var f;
          if (typeof o != "function")
            throw new q(m);
          return r = Nt(r), function() {
            return --r > 0 && (f = o.apply(this, arguments)), r <= 1 && (o = a), f;
          };
        }
        var Lh = Tt(function(r, o, f) {
          var p = D;
          if (f.length) {
            var S = zn(f, Xr(Lh));
            p |= Y;
          }
          return di(r, p, o, f, S);
        }), Qc = Tt(function(r, o, f) {
          var p = D | B;
          if (f.length) {
            var S = zn(f, Xr(Qc));
            p |= Y;
          }
          return di(o, p, r, f, S);
        });
        function Jc(r, o, f) {
          o = f ? a : o;
          var p = di(r, U, a, a, a, a, a, o);
          return p.placeholder = Jc.placeholder, p;
        }
        function $c(r, o, f) {
          o = f ? a : o;
          var p = di(r, X, a, a, a, a, a, o);
          return p.placeholder = $c.placeholder, p;
        }
        function tf(r, o, f) {
          var p, S, b, A, O, F, V = 0, W = !1, Q = !1, at = !0;
          if (typeof r != "function")
            throw new q(m);
          o = wn(o) || 0, Jt(f) && (W = !!f.leading, Q = "maxWait" in f, b = Q ? de(wn(f.maxWait) || 0, o) : b, at = "trailing" in f ? !!f.trailing : at);
          function ft(ue) {
            var Ln = p, vi = S;
            return p = S = a, V = ue, A = r.apply(vi, Ln), A;
          }
          function xt(ue) {
            return V = ue, O = ha(Rt, o), W ? ft(ue) : A;
          }
          function bt(ue) {
            var Ln = ue - F, vi = ue - V, xf = o - Ln;
            return Q ? Se(xf, b - vi) : xf;
          }
          function Et(ue) {
            var Ln = ue - F, vi = ue - V;
            return F === a || Ln >= o || Ln < 0 || Q && vi >= b;
          }
          function Rt() {
            var ue = Uu();
            if (Et(ue))
              return Lt(ue);
            O = ha(Rt, bt(ue));
          }
          function Lt(ue) {
            return O = a, at && p ? ft(ue) : (p = S = a, A);
          }
          function gn() {
            O !== a && lc(O), V = 0, p = F = S = O = a;
          }
          function Oe() {
            return O === a ? A : Lt(Uu());
          }
          function dn() {
            var ue = Uu(), Ln = Et(ue);
            if (p = arguments, S = this, F = ue, Ln) {
              if (O === a)
                return xt(F);
              if (Q)
                return lc(O), O = ha(Rt, o), ft(F);
            }
            return O === a && (O = ha(Rt, o)), A;
          }
          return dn.cancel = gn, dn.flush = Oe, dn;
        }
        var Vm = Tt(function(r, o) {
          return Ul(r, 1, o);
        }), Wm = Tt(function(r, o, f) {
          return Ul(r, wn(o) || 0, f);
        });
        function Hm(r) {
          return di(r, $);
        }
        function Yu(r, o) {
          if (typeof r != "function" || o != null && typeof o != "function")
            throw new q(m);
          var f = function() {
            var p = arguments, S = o ? o.apply(this, p) : p[0], b = f.cache;
            if (b.has(S))
              return b.get(S);
            var A = r.apply(this, p);
            return f.cache = b.set(S, A) || b, A;
          };
          return f.cache = new (Yu.Cache || fi)(), f;
        }
        Yu.Cache = fi;
        function Xu(r) {
          if (typeof r != "function")
            throw new q(m);
          return function() {
            var o = arguments;
            switch (o.length) {
              case 0:
                return !r.call(this);
              case 1:
                return !r.call(this, o[0]);
              case 2:
                return !r.call(this, o[0], o[1]);
              case 3:
                return !r.call(this, o[0], o[1], o[2]);
            }
            return !r.apply(this, o);
          };
        }
        function Km(r) {
          return Zc(2, r);
        }
        var Zm = Gd(function(r, o) {
          o = o.length == 1 && St(o[0]) ? Zt(o[0], Te(pt())) : Zt(xe(o, 1), Te(pt()));
          var f = o.length;
          return Tt(function(p) {
            for (var S = -1, b = Se(p.length, f); ++S < b; )
              p[S] = o[S].call(this, p[S]);
            return Pe(r, this, p);
          });
        }), Gh = Tt(function(r, o) {
          var f = zn(o, Xr(Gh));
          return di(r, Y, a, o, f);
        }), ef = Tt(function(r, o) {
          var f = zn(o, Xr(ef));
          return di(r, H, a, o, f);
        }), Qm = _i(function(r, o) {
          return di(r, et, a, a, a, o);
        });
        function Jm(r, o) {
          if (typeof r != "function")
            throw new q(m);
          return o = o === a ? o : Nt(o), Tt(r, o);
        }
        function $m(r, o) {
          if (typeof r != "function")
            throw new q(m);
          return o = o == null ? 0 : de(Nt(o), 0), Tt(function(f) {
            var p = f[o], S = Oi(f, 0, o);
            return p && Tn(S, p), Pe(r, this, S);
          });
        }
        function ty(r, o, f) {
          var p = !0, S = !0;
          if (typeof r != "function")
            throw new q(m);
          return Jt(f) && (p = "leading" in f ? !!f.leading : p, S = "trailing" in f ? !!f.trailing : S), tf(r, o, {
            leading: p,
            maxWait: o,
            trailing: S
          });
        }
        function ey(r) {
          return Kc(r, 1);
        }
        function ny(r, o) {
          return Gh(xh(o), r);
        }
        function iy() {
          if (!arguments.length)
            return [];
          var r = arguments[0];
          return St(r) ? r : [r];
        }
        function ry(r) {
          return En(r, P);
        }
        function sy(r, o) {
          return o = typeof o == "function" ? o : a, En(r, P, o);
        }
        function ay(r) {
          return En(r, E | P);
        }
        function uy(r, o) {
          return o = typeof o == "function" ? o : a, En(r, E | P, o);
        }
        function oy(r, o) {
          return o == null || jl(r, o, me(o));
        }
        function On(r, o) {
          return r === o || r !== r && o !== o;
        }
        var hy = Du(oh), ly = Du(function(r, o) {
          return r >= o;
        }), gr = Hl(/* @__PURE__ */ function() {
          return arguments;
        }()) ? Hl : function(r) {
          return ie(r) && lt.call(r, "callee") && !qr.call(r, "callee");
        }, St = s.isArray, cy = Gs ? Te(Gs) : vd;
        function Ke(r) {
          return r != null && Vu(r.length) && !yi(r);
        }
        function ae(r) {
          return ie(r) && Ke(r);
        }
        function fy(r) {
          return r === !0 || r === !1 || ie(r) && Ae(r) == z;
        }
        var Li = I0 || Wh, gy = oi ? Te(oi) : xd;
        function dy(r) {
          return ie(r) && r.nodeType === 1 && !la(r);
        }
        function _y(r) {
          if (r == null)
            return !0;
          if (Ke(r) && (St(r) || typeof r == "string" || typeof r.splice == "function" || Li(r) || Vr(r) || gr(r)))
            return !r.length;
          var o = Ie(r);
          if (o == we || o == Be)
            return !r.size;
          if (oa(r))
            return !ch(r).length;
          for (var f in r)
            if (lt.call(r, f))
              return !1;
          return !0;
        }
        function my(r, o) {
          return sa(r, o);
        }
        function yy(r, o, f) {
          f = typeof f == "function" ? f : a;
          var p = f ? f(r, o) : a;
          return p === a ? sa(r, o, a, f) : !!p;
        }
        function Dh(r) {
          if (!ie(r))
            return !1;
          var o = Ae(r);
          return o == ct || o == Wt || typeof r.message == "string" && typeof r.name == "string" && !la(r);
        }
        function py(r) {
          return typeof r == "number" && Gl(r);
        }
        function yi(r) {
          if (!Jt(r))
            return !1;
          var o = Ae(r);
          return o == R || o == nn || o == Ba || o == tt;
        }
        function nf(r) {
          return typeof r == "number" && r == Nt(r);
        }
        function Vu(r) {
          return typeof r == "number" && r > -1 && r % 1 == 0 && r <= Vt;
        }
        function Jt(r) {
          var o = typeof r;
          return r != null && (o == "object" || o == "function");
        }
        function ie(r) {
          return r != null && typeof r == "object";
        }
        var rf = ou ? Te(ou) : Md;
        function vy(r, o) {
          return r === o || lh(r, o, Nh(o));
        }
        function xy(r, o, f) {
          return f = typeof f == "function" ? f : a, lh(r, o, Nh(o), f);
        }
        function Ey(r) {
          return sf(r) && r != +r;
        }
        function My(r) {
          if (s_(r))
            throw new d(_);
          return Kl(r);
        }
        function ky(r) {
          return r === null;
        }
        function wy(r) {
          return r == null;
        }
        function sf(r) {
          return typeof r == "number" || ie(r) && Ae(r) == qe;
        }
        function la(r) {
          if (!ie(r) || Ae(r) != rn)
            return !1;
          var o = sr(r);
          if (o === null)
            return !0;
          var f = lt.call(o, "constructor") && o.constructor;
          return typeof f == "function" && f instanceof f && Pt.call(f) == li;
        }
        var Fh = on ? Te(on) : kd;
        function Sy(r) {
          return nf(r) && r >= -Vt && r <= Vt;
        }
        var af = Ds ? Te(Ds) : wd;
        function Wu(r) {
          return typeof r == "string" || !St(r) && ie(r) && Ae(r) == sn;
        }
        function fn(r) {
          return typeof r == "symbol" || ie(r) && Ae(r) == Er;
        }
        var Vr = hu ? Te(hu) : Sd;
        function Iy(r) {
          return r === a;
        }
        function Ny(r) {
          return ie(r) && Ie(r) == bn;
        }
        function by(r) {
          return ie(r) && Ae(r) == Mr;
        }
        var Cy = Du(fh), Py = Du(function(r, o) {
          return r <= o;
        });
        function uf(r) {
          if (!r)
            return [];
          if (Ke(r))
            return Wu(r) ? ln(r) : He(r);
          if (Qs && r[Qs])
            return _u(r[Qs]());
          var o = Ie(r), f = o == we ? Dr : o == Be ? er : Wr;
          return f(r);
        }
        function pi(r) {
          if (!r)
            return r === 0 ? r : 0;
          if (r = wn(r), r === Dt || r === -Dt) {
            var o = r < 0 ? -1 : 1;
            return o * he;
          }
          return r === r ? r : 0;
        }
        function Nt(r) {
          var o = pi(r), f = o % 1;
          return o === o ? f ? o - f : o : 0;
        }
        function of(r) {
          return r ? hr(Nt(r), 0, Kt) : 0;
        }
        function wn(r) {
          if (typeof r == "number")
            return r;
          if (fn(r))
            return ht;
          if (Jt(r)) {
            var o = typeof r.valueOf == "function" ? r.valueOf() : r;
            r = Jt(o) ? o + "" : o;
          }
          if (typeof r != "string")
            return r === 0 ? r : +r;
          r = gu(r);
          var f = ni.test(r);
          return f || Cr.test(r) ? zo(r.slice(2), f ? 2 : 8) : ei.test(r) ? ht : +r;
        }
        function hf(r) {
          return Un(r, Ze(r));
        }
        function Ty(r) {
          return r ? hr(Nt(r), -Vt, Vt) : r === 0 ? r : 0;
        }
        function zt(r) {
          return r == null ? "" : cn(r);
        }
        var Ay = Ur(function(r, o) {
          if (oa(o) || Ke(o)) {
            Un(o, me(o), r);
            return;
          }
          for (var f in o)
            lt.call(o, f) && na(r, f, o[f]);
        }), lf = Ur(function(r, o) {
          Un(o, Ze(o), r);
        }), Hu = Ur(function(r, o, f, p) {
          Un(o, Ze(o), r, p);
        }), Ry = Ur(function(r, o, f, p) {
          Un(o, me(o), r, p);
        }), Oy = _i(sh);
        function Ly(r, o) {
          var f = jr(r);
          return o == null ? f : zl(f, o);
        }
        var Gy = Tt(function(r, o) {
          r = I(r);
          var f = -1, p = o.length, S = p > 2 ? o[2] : a;
          for (S && Re(o[0], o[1], S) && (p = 1); ++f < p; )
            for (var b = o[f], A = Ze(b), O = -1, F = A.length; ++O < F; ) {
              var V = A[O], W = r[V];
              (W === a || On(W, ot[V]) && !lt.call(r, V)) && (r[V] = b[V]);
            }
          return r;
        }), Dy = Tt(function(r) {
          return r.push(a, Ic), Pe(cf, a, r);
        });
        function Fy(r, o) {
          return zs(r, pt(o, 3), jn);
        }
        function qy(r, o) {
          return zs(r, pt(o, 3), uh);
        }
        function By(r, o) {
          return r == null ? r : ah(r, pt(o, 3), Ze);
        }
        function zy(r, o) {
          return r == null ? r : Vl(r, pt(o, 3), Ze);
        }
        function jy(r, o) {
          return r && jn(r, pt(o, 3));
        }
        function Uy(r, o) {
          return r && uh(r, pt(o, 3));
        }
        function Yy(r) {
          return r == null ? [] : Cu(r, me(r));
        }
        function Xy(r) {
          return r == null ? [] : Cu(r, Ze(r));
        }
        function qh(r, o, f) {
          var p = r == null ? a : lr(r, o);
          return p === a ? f : p;
        }
        function Vy(r, o) {
          return r != null && Cc(r, o, _d);
        }
        function Bh(r, o) {
          return r != null && Cc(r, o, md);
        }
        var Wy = Ec(function(r, o, f) {
          o != null && typeof o.toString != "function" && (o = se.call(o)), r[o] = f;
        }, jh(Qe)), Hy = Ec(function(r, o, f) {
          o != null && typeof o.toString != "function" && (o = se.call(o)), lt.call(r, o) ? r[o].push(f) : r[o] = [f];
        }, pt), Ky = Tt(ra);
        function me(r) {
          return Ke(r) ? ql(r) : ch(r);
        }
        function Ze(r) {
          return Ke(r) ? ql(r, !0) : Id(r);
        }
        function Zy(r, o) {
          var f = {};
          return o = pt(o, 3), jn(r, function(p, S, b) {
            gi(f, o(p, S, b), p);
          }), f;
        }
        function Qy(r, o) {
          var f = {};
          return o = pt(o, 3), jn(r, function(p, S, b) {
            gi(f, S, o(p, S, b));
          }), f;
        }
        var Jy = Ur(function(r, o, f) {
          Pu(r, o, f);
        }), cf = Ur(function(r, o, f, p) {
          Pu(r, o, f, p);
        }), $y = _i(function(r, o) {
          var f = {};
          if (r == null)
            return f;
          var p = !1;
          o = Zt(o, function(b) {
            return b = Ri(b, r), p || (p = b.length > 1), b;
          }), Un(r, Sh(r), f), p && (f = En(f, E | k | P, Wd));
          for (var S = o.length; S--; )
            yh(f, o[S]);
          return f;
        });
        function tp(r, o) {
          return ff(r, Xu(pt(o)));
        }
        var ep = _i(function(r, o) {
          return r == null ? {} : bd(r, o);
        });
        function ff(r, o) {
          if (r == null)
            return {};
          var f = Zt(Sh(r), function(p) {
            return [p];
          });
          return o = pt(o), nc(r, f, function(p, S) {
            return o(p, S[0]);
          });
        }
        function np(r, o, f) {
          o = Ri(o, r);
          var p = -1, S = o.length;
          for (S || (S = 1, r = a); ++p < S; ) {
            var b = r == null ? a : r[Yn(o[p])];
            b === a && (p = S, b = f), r = yi(b) ? b.call(r) : b;
          }
          return r;
        }
        function ip(r, o, f) {
          return r == null ? r : aa(r, o, f);
        }
        function rp(r, o, f, p) {
          return p = typeof p == "function" ? p : a, r == null ? r : aa(r, o, f, p);
        }
        var gf = wc(me), df = wc(Ze);
        function sp(r, o, f) {
          var p = St(r), S = p || Li(r) || Vr(r);
          if (o = pt(o, 4), f == null) {
            var b = r && r.constructor;
            S ? f = p ? new b() : [] : Jt(r) ? f = yi(b) ? jr(sr(r)) : {} : f = {};
          }
          return (S ? Ve : jn)(r, function(A, O, F) {
            return o(f, A, O, F);
          }), f;
        }
        function ap(r, o) {
          return r == null ? !0 : yh(r, o);
        }
        function up(r, o, f) {
          return r == null ? r : uc(r, o, xh(f));
        }
        function op(r, o, f, p) {
          return p = typeof p == "function" ? p : a, r == null ? r : uc(r, o, xh(f), p);
        }
        function Wr(r) {
          return r == null ? [] : Vs(r, me(r));
        }
        function hp(r) {
          return r == null ? [] : Vs(r, Ze(r));
        }
        function lp(r, o, f) {
          return f === a && (f = o, o = a), f !== a && (f = wn(f), f = f === f ? f : 0), o !== a && (o = wn(o), o = o === o ? o : 0), hr(wn(r), o, f);
        }
        function cp(r, o, f) {
          return o = pi(o), f === a ? (f = o, o = 0) : f = pi(f), r = wn(r), yd(r, o, f);
        }
        function fp(r, o, f) {
          if (f && typeof f != "boolean" && Re(r, o, f) && (o = f = a), f === a && (typeof o == "boolean" ? (f = o, o = a) : typeof r == "boolean" && (f = r, r = a)), r === a && o === a ? (r = 0, o = 1) : (r = pi(r), o === a ? (o = r, r = 0) : o = pi(o)), r > o) {
            var p = r;
            r = o, o = p;
          }
          if (f || r % 1 || o % 1) {
            var S = Dl();
            return Se(r + S * (o - r + uu("1e-" + ((S + "").length - 1))), o);
          }
          return dh(r, o);
        }
        var gp = Yr(function(r, o, f) {
          return o = o.toLowerCase(), r + (f ? _f(o) : o);
        });
        function _f(r) {
          return zh(zt(r).toLowerCase());
        }
        function mf(r) {
          return r = zt(r), r && r.replace(re, Ho).replace(Or, "");
        }
        function dp(r, o, f) {
          r = zt(r), o = cn(o);
          var p = r.length;
          f = f === a ? p : hr(Nt(f), 0, p);
          var S = f;
          return f -= o.length, f >= 0 && r.slice(f, S) == o;
        }
        function _p(r) {
          return r = zt(r), r && Ro.test(r) ? r.replace(ps, Ko) : r;
        }
        function mp(r) {
          return r = zt(r), r && vs.test(r) ? r.replace(Ir, "\\$&") : r;
        }
        var yp = Yr(function(r, o, f) {
          return r + (f ? "-" : "") + o.toLowerCase();
        }), pp = Yr(function(r, o, f) {
          return r + (f ? " " : "") + o.toLowerCase();
        }), vp = pc("toLowerCase");
        function xp(r, o, f) {
          r = zt(r), o = Nt(o);
          var p = o ? hi(r) : 0;
          if (!o || p >= o)
            return r;
          var S = (o - p) / 2;
          return Gu(ku(S), f) + r + Gu(Mu(S), f);
        }
        function Ep(r, o, f) {
          r = zt(r), o = Nt(o);
          var p = o ? hi(r) : 0;
          return o && p < o ? r + Gu(o - p, f) : r;
        }
        function Mp(r, o, f) {
          r = zt(r), o = Nt(o);
          var p = o ? hi(r) : 0;
          return o && p < o ? Gu(o - p, f) + r : r;
        }
        function kp(r, o, f) {
          return f || o == null ? o = 0 : o && (o = +o), P0(zt(r).replace(Nr, ""), o || 0);
        }
        function wp(r, o, f) {
          return (f ? Re(r, o, f) : o === a) ? o = 1 : o = Nt(o), _h(zt(r), o);
        }
        function Sp() {
          var r = arguments, o = zt(r[0]);
          return r.length < 3 ? o : o.replace(r[1], r[2]);
        }
        var Ip = Yr(function(r, o, f) {
          return r + (f ? "_" : "") + o.toLowerCase();
        });
        function Np(r, o, f) {
          return f && typeof f != "number" && Re(r, o, f) && (o = f = a), f = f === a ? Kt : f >>> 0, f ? (r = zt(r), r && (typeof o == "string" || o != null && !Fh(o)) && (o = cn(o), !o && Ci(r)) ? Oi(ln(r), 0, f) : r.split(o, f)) : [];
        }
        var bp = Yr(function(r, o, f) {
          return r + (f ? " " : "") + zh(o);
        });
        function Cp(r, o, f) {
          return r = zt(r), f = f == null ? 0 : hr(Nt(f), 0, r.length), o = cn(o), r.slice(f, f + o.length) == o;
        }
        function Pp(r, o, f) {
          var p = N.templateSettings;
          f && Re(r, o, f) && (o = a), r = zt(r), o = Hu({}, o, p, Sc);
          var S = Hu({}, o.imports, p.imports, Sc), b = me(S), A = Vs(S, b), O, F, V = 0, W = o.interpolate || Pr, Q = "__p += '", at = T(
            (o.escape || Pr).source + "|" + W.source + "|" + (W === nt ? xs : Pr).source + "|" + (o.evaluate || Pr).source + "|$",
            "g"
          ), ft = "//# sourceURL=" + (lt.call(o, "sourceURL") ? (o.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++ru + "]") + `
`;
          r.replace(at, function(Et, Rt, Lt, gn, Oe, dn) {
            return Lt || (Lt = gn), Q += r.slice(V, dn).replace(Go, Zo), Rt && (O = !0, Q += `' +
__e(` + Rt + `) +
'`), Oe && (F = !0, Q += `';
` + Oe + `;
__p += '`), Lt && (Q += `' +
((__t = (` + Lt + `)) == null ? '' : __t) +
'`), V = dn + Et.length, Et;
          }), Q += `';
`;
          var xt = lt.call(o, "variable") && o.variable;
          if (!xt)
            Q = `with (obj) {
` + Q + `
}
`;
          else if (Lo.test(xt))
            throw new d(g);
          Q = (F ? Q.replace(ys, "") : Q).replace(ze, "$1").replace(Hi, "$1;"), Q = "function(" + (xt || "obj") + `) {
` + (xt ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (O ? ", __e = _.escape" : "") + (F ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + Q + `return __p
}`;
          var bt = pf(function() {
            return y(b, ft + "return " + Q).apply(a, A);
          });
          if (bt.source = Q, Dh(bt))
            throw bt;
          return bt;
        }
        function Tp(r) {
          return zt(r).toLowerCase();
        }
        function Ap(r) {
          return zt(r).toUpperCase();
        }
        function Rp(r, o, f) {
          if (r = zt(r), r && (f || o === a))
            return gu(r);
          if (!r || !(o = cn(o)))
            return r;
          var p = ln(r), S = ln(o), b = du(p, S), A = Ws(p, S) + 1;
          return Oi(p, b, A).join("");
        }
        function Op(r, o, f) {
          if (r = zt(r), r && (f || o === a))
            return r.slice(0, yu(r) + 1);
          if (!r || !(o = cn(o)))
            return r;
          var p = ln(r), S = Ws(p, ln(o)) + 1;
          return Oi(p, 0, S).join("");
        }
        function Lp(r, o, f) {
          if (r = zt(r), r && (f || o === a))
            return r.replace(Nr, "");
          if (!r || !(o = cn(o)))
            return r;
          var p = ln(r), S = du(p, ln(o));
          return Oi(p, S).join("");
        }
        function Gp(r, o) {
          var f = dt, p = _t;
          if (Jt(o)) {
            var S = "separator" in o ? o.separator : S;
            f = "length" in o ? Nt(o.length) : f, p = "omission" in o ? cn(o.omission) : p;
          }
          r = zt(r);
          var b = r.length;
          if (Ci(r)) {
            var A = ln(r);
            b = A.length;
          }
          if (f >= b)
            return r;
          var O = f - hi(p);
          if (O < 1)
            return p;
          var F = A ? Oi(A, 0, O).join("") : r.slice(0, O);
          if (S === a)
            return F + p;
          if (A && (O += F.length - O), Fh(S)) {
            if (r.slice(O).search(S)) {
              var V, W = F;
              for (S.global || (S = T(S.source, zt(Si.exec(S)) + "g")), S.lastIndex = 0; V = S.exec(W); )
                var Q = V.index;
              F = F.slice(0, Q === a ? O : Q);
            }
          } else if (r.indexOf(cn(S), O) != O) {
            var at = F.lastIndexOf(S);
            at > -1 && (F = F.slice(0, at));
          }
          return F + p;
        }
        function Dp(r) {
          return r = zt(r), r && kr.test(r) ? r.replace(un, Pi) : r;
        }
        var Fp = Yr(function(r, o, f) {
          return r + (f ? " " : "") + o.toUpperCase();
        }), zh = pc("toUpperCase");
        function yf(r, o, f) {
          return r = zt(r), o = f ? a : o, o === a ? Jo(r) ? We(r) : hn(r) : r.match(o) || [];
        }
        var pf = Tt(function(r, o) {
          try {
            return Pe(r, a, o);
          } catch (f) {
            return Dh(f) ? f : new d(f);
          }
        }), qp = _i(function(r, o) {
          return Ve(o, function(f) {
            f = Yn(f), gi(r, f, Lh(r[f], r));
          }), r;
        });
        function Bp(r) {
          var o = r == null ? 0 : r.length, f = pt();
          return r = o ? Zt(r, function(p) {
            if (typeof p[1] != "function")
              throw new q(m);
            return [f(p[0]), p[1]];
          }) : [], Tt(function(p) {
            for (var S = -1; ++S < o; ) {
              var b = r[S];
              if (Pe(b[0], this, p))
                return Pe(b[1], this, p);
            }
          });
        }
        function zp(r) {
          return fd(En(r, E));
        }
        function jh(r) {
          return function() {
            return r;
          };
        }
        function jp(r, o) {
          return r == null || r !== r ? o : r;
        }
        var Up = xc(), Yp = xc(!0);
        function Qe(r) {
          return r;
        }
        function Uh(r) {
          return Zl(typeof r == "function" ? r : En(r, E));
        }
        function Xp(r) {
          return Jl(En(r, E));
        }
        function Vp(r, o) {
          return $l(r, En(o, E));
        }
        var Wp = Tt(function(r, o) {
          return function(f) {
            return ra(f, r, o);
          };
        }), Hp = Tt(function(r, o) {
          return function(f) {
            return ra(r, f, o);
          };
        });
        function Yh(r, o, f) {
          var p = me(o), S = Cu(o, p);
          f == null && !(Jt(o) && (S.length || !p.length)) && (f = o, o = r, r = this, S = Cu(o, me(o)));
          var b = !(Jt(f) && "chain" in f) || !!f.chain, A = yi(r);
          return Ve(S, function(O) {
            var F = o[O];
            r[O] = F, A && (r.prototype[O] = function() {
              var V = this.__chain__;
              if (b || V) {
                var W = r(this.__wrapped__), Q = W.__actions__ = He(this.__actions__);
                return Q.push({ func: F, args: arguments, thisArg: r }), W.__chain__ = V, W;
              }
              return F.apply(r, Tn([this.value()], arguments));
            });
          }), r;
        }
        function Kp() {
          return ne._ === this && (ne._ = nr), this;
        }
        function Xh() {
        }
        function Zp(r) {
          return r = Nt(r), Tt(function(o) {
            return tc(o, r);
          });
        }
        var Qp = Mh(Zt), Jp = Mh(lu), $p = Mh(Lr);
        function vf(r) {
          return Ch(r) ? Gr(Yn(r)) : Cd(r);
        }
        function tv(r) {
          return function(o) {
            return r == null ? a : lr(r, o);
          };
        }
        var ev = Mc(), nv = Mc(!0);
        function Vh() {
          return [];
        }
        function Wh() {
          return !1;
        }
        function iv() {
          return {};
        }
        function rv() {
          return "";
        }
        function sv() {
          return !0;
        }
        function av(r, o) {
          if (r = Nt(r), r < 1 || r > Vt)
            return [];
          var f = Kt, p = Se(r, Kt);
          o = pt(o), r -= Kt;
          for (var S = Xs(p, o); ++f < r; )
            o(f);
          return S;
        }
        function uv(r) {
          return St(r) ? Zt(r, Yn) : fn(r) ? [r] : He(Fc(zt(r)));
        }
        function ov(r) {
          var o = ++Xt;
          return zt(r) + o;
        }
        var hv = Lu(function(r, o) {
          return r + o;
        }, 0), lv = kh("ceil"), cv = Lu(function(r, o) {
          return r / o;
        }, 1), fv = kh("floor");
        function gv(r) {
          return r && r.length ? bu(r, Qe, oh) : a;
        }
        function dv(r, o) {
          return r && r.length ? bu(r, pt(o, 2), oh) : a;
        }
        function _v(r) {
          return Us(r, Qe);
        }
        function mv(r, o) {
          return Us(r, pt(o, 2));
        }
        function yv(r) {
          return r && r.length ? bu(r, Qe, fh) : a;
        }
        function pv(r, o) {
          return r && r.length ? bu(r, pt(o, 2), fh) : a;
        }
        var vv = Lu(function(r, o) {
          return r * o;
        }, 1), xv = kh("round"), Ev = Lu(function(r, o) {
          return r - o;
        }, 0);
        function Mv(r) {
          return r && r.length ? Ys(r, Qe) : 0;
        }
        function kv(r, o) {
          return r && r.length ? Ys(r, pt(o, 2)) : 0;
        }
        return N.after = Xm, N.ary = Kc, N.assign = Ay, N.assignIn = lf, N.assignInWith = Hu, N.assignWith = Ry, N.at = Oy, N.before = Zc, N.bind = Lh, N.bindAll = qp, N.bindKey = Qc, N.castArray = iy, N.chain = Vc, N.chunk = f_, N.compact = g_, N.concat = d_, N.cond = Bp, N.conforms = zp, N.constant = jh, N.countBy = Mm, N.create = Ly, N.curry = Jc, N.curryRight = $c, N.debounce = tf, N.defaults = Gy, N.defaultsDeep = Dy, N.defer = Vm, N.delay = Wm, N.difference = __, N.differenceBy = m_, N.differenceWith = y_, N.drop = p_, N.dropRight = v_, N.dropRightWhile = x_, N.dropWhile = E_, N.fill = M_, N.filter = wm, N.flatMap = Nm, N.flatMapDeep = bm, N.flatMapDepth = Cm, N.flatten = jc, N.flattenDeep = k_, N.flattenDepth = w_, N.flip = Hm, N.flow = Up, N.flowRight = Yp, N.fromPairs = S_, N.functions = Yy, N.functionsIn = Xy, N.groupBy = Pm, N.initial = N_, N.intersection = b_, N.intersectionBy = C_, N.intersectionWith = P_, N.invert = Wy, N.invertBy = Hy, N.invokeMap = Am, N.iteratee = Uh, N.keyBy = Rm, N.keys = me, N.keysIn = Ze, N.map = ju, N.mapKeys = Zy, N.mapValues = Qy, N.matches = Xp, N.matchesProperty = Vp, N.memoize = Yu, N.merge = Jy, N.mergeWith = cf, N.method = Wp, N.methodOf = Hp, N.mixin = Yh, N.negate = Xu, N.nthArg = Zp, N.omit = $y, N.omitBy = tp, N.once = Km, N.orderBy = Om, N.over = Qp, N.overArgs = Zm, N.overEvery = Jp, N.overSome = $p, N.partial = Gh, N.partialRight = ef, N.partition = Lm, N.pick = ep, N.pickBy = ff, N.property = vf, N.propertyOf = tv, N.pull = O_, N.pullAll = Yc, N.pullAllBy = L_, N.pullAllWith = G_, N.pullAt = D_, N.range = ev, N.rangeRight = nv, N.rearg = Qm, N.reject = Fm, N.remove = F_, N.rest = Jm, N.reverse = Rh, N.sampleSize = Bm, N.set = ip, N.setWith = rp, N.shuffle = zm, N.slice = q_, N.sortBy = Ym, N.sortedUniq = V_, N.sortedUniqBy = W_, N.split = Np, N.spread = $m, N.tail = H_, N.take = K_, N.takeRight = Z_, N.takeRightWhile = Q_, N.takeWhile = J_, N.tap = gm, N.throttle = ty, N.thru = zu, N.toArray = uf, N.toPairs = gf, N.toPairsIn = df, N.toPath = uv, N.toPlainObject = hf, N.transform = sp, N.unary = ey, N.union = $_, N.unionBy = tm, N.unionWith = em, N.uniq = nm, N.uniqBy = im, N.uniqWith = rm, N.unset = ap, N.unzip = Oh, N.unzipWith = Xc, N.update = up, N.updateWith = op, N.values = Wr, N.valuesIn = hp, N.without = sm, N.words = yf, N.wrap = ny, N.xor = am, N.xorBy = um, N.xorWith = om, N.zip = hm, N.zipObject = lm, N.zipObjectDeep = cm, N.zipWith = fm, N.entries = gf, N.entriesIn = df, N.extend = lf, N.extendWith = Hu, Yh(N, N), N.add = hv, N.attempt = pf, N.camelCase = gp, N.capitalize = _f, N.ceil = lv, N.clamp = lp, N.clone = ry, N.cloneDeep = ay, N.cloneDeepWith = uy, N.cloneWith = sy, N.conformsTo = oy, N.deburr = mf, N.defaultTo = jp, N.divide = cv, N.endsWith = dp, N.eq = On, N.escape = _p, N.escapeRegExp = mp, N.every = km, N.find = Sm, N.findIndex = Bc, N.findKey = Fy, N.findLast = Im, N.findLastIndex = zc, N.findLastKey = qy, N.floor = fv, N.forEach = Wc, N.forEachRight = Hc, N.forIn = By, N.forInRight = zy, N.forOwn = jy, N.forOwnRight = Uy, N.get = qh, N.gt = hy, N.gte = ly, N.has = Vy, N.hasIn = Bh, N.head = Uc, N.identity = Qe, N.includes = Tm, N.indexOf = I_, N.inRange = cp, N.invoke = Ky, N.isArguments = gr, N.isArray = St, N.isArrayBuffer = cy, N.isArrayLike = Ke, N.isArrayLikeObject = ae, N.isBoolean = fy, N.isBuffer = Li, N.isDate = gy, N.isElement = dy, N.isEmpty = _y, N.isEqual = my, N.isEqualWith = yy, N.isError = Dh, N.isFinite = py, N.isFunction = yi, N.isInteger = nf, N.isLength = Vu, N.isMap = rf, N.isMatch = vy, N.isMatchWith = xy, N.isNaN = Ey, N.isNative = My, N.isNil = wy, N.isNull = ky, N.isNumber = sf, N.isObject = Jt, N.isObjectLike = ie, N.isPlainObject = la, N.isRegExp = Fh, N.isSafeInteger = Sy, N.isSet = af, N.isString = Wu, N.isSymbol = fn, N.isTypedArray = Vr, N.isUndefined = Iy, N.isWeakMap = Ny, N.isWeakSet = by, N.join = T_, N.kebabCase = yp, N.last = kn, N.lastIndexOf = A_, N.lowerCase = pp, N.lowerFirst = vp, N.lt = Cy, N.lte = Py, N.max = gv, N.maxBy = dv, N.mean = _v, N.meanBy = mv, N.min = yv, N.minBy = pv, N.stubArray = Vh, N.stubFalse = Wh, N.stubObject = iv, N.stubString = rv, N.stubTrue = sv, N.multiply = vv, N.nth = R_, N.noConflict = Kp, N.noop = Xh, N.now = Uu, N.pad = xp, N.padEnd = Ep, N.padStart = Mp, N.parseInt = kp, N.random = fp, N.reduce = Gm, N.reduceRight = Dm, N.repeat = wp, N.replace = Sp, N.result = np, N.round = xv, N.runInContext = t, N.sample = qm, N.size = jm, N.snakeCase = Ip, N.some = Um, N.sortedIndex = B_, N.sortedIndexBy = z_, N.sortedIndexOf = j_, N.sortedLastIndex = U_, N.sortedLastIndexBy = Y_, N.sortedLastIndexOf = X_, N.startCase = bp, N.startsWith = Cp, N.subtract = Ev, N.sum = Mv, N.sumBy = kv, N.template = Pp, N.times = av, N.toFinite = pi, N.toInteger = Nt, N.toLength = of, N.toLower = Tp, N.toNumber = wn, N.toSafeInteger = Ty, N.toString = zt, N.toUpper = Ap, N.trim = Rp, N.trimEnd = Op, N.trimStart = Lp, N.truncate = Gp, N.unescape = Dp, N.uniqueId = ov, N.upperCase = Fp, N.upperFirst = zh, N.each = Wc, N.eachRight = Hc, N.first = Uc, Yh(N, function() {
          var r = {};
          return jn(N, function(o, f) {
            lt.call(N.prototype, f) || (r[f] = o);
          }), r;
        }(), { chain: !1 }), N.VERSION = l, Ve(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(r) {
          N[r].placeholder = N;
        }), Ve(["drop", "take"], function(r, o) {
          Ot.prototype[r] = function(f) {
            f = f === a ? 1 : de(Nt(f), 0);
            var p = this.__filtered__ && !o ? new Ot(this) : this.clone();
            return p.__filtered__ ? p.__takeCount__ = Se(f, p.__takeCount__) : p.__views__.push({
              size: Se(f, Kt),
              type: r + (p.__dir__ < 0 ? "Right" : "")
            }), p;
          }, Ot.prototype[r + "Right"] = function(f) {
            return this.reverse()[r](f).reverse();
          };
        }), Ve(["filter", "map", "takeWhile"], function(r, o) {
          var f = o + 1, p = f == it || f == Gt;
          Ot.prototype[r] = function(S) {
            var b = this.clone();
            return b.__iteratees__.push({
              iteratee: pt(S, 3),
              type: f
            }), b.__filtered__ = b.__filtered__ || p, b;
          };
        }), Ve(["head", "last"], function(r, o) {
          var f = "take" + (o ? "Right" : "");
          Ot.prototype[r] = function() {
            return this[f](1).value()[0];
          };
        }), Ve(["initial", "tail"], function(r, o) {
          var f = "drop" + (o ? "" : "Right");
          Ot.prototype[r] = function() {
            return this.__filtered__ ? new Ot(this) : this[f](1);
          };
        }), Ot.prototype.compact = function() {
          return this.filter(Qe);
        }, Ot.prototype.find = function(r) {
          return this.filter(r).head();
        }, Ot.prototype.findLast = function(r) {
          return this.reverse().find(r);
        }, Ot.prototype.invokeMap = Tt(function(r, o) {
          return typeof r == "function" ? new Ot(this) : this.map(function(f) {
            return ra(f, r, o);
          });
        }), Ot.prototype.reject = function(r) {
          return this.filter(Xu(pt(r)));
        }, Ot.prototype.slice = function(r, o) {
          r = Nt(r);
          var f = this;
          return f.__filtered__ && (r > 0 || o < 0) ? new Ot(f) : (r < 0 ? f = f.takeRight(-r) : r && (f = f.drop(r)), o !== a && (o = Nt(o), f = o < 0 ? f.dropRight(-o) : f.take(o - r)), f);
        }, Ot.prototype.takeRightWhile = function(r) {
          return this.reverse().takeWhile(r).reverse();
        }, Ot.prototype.toArray = function() {
          return this.take(Kt);
        }, jn(Ot.prototype, function(r, o) {
          var f = /^(?:filter|find|map|reject)|While$/.test(o), p = /^(?:head|last)$/.test(o), S = N[p ? "take" + (o == "last" ? "Right" : "") : o], b = p || /^find/.test(o);
          S && (N.prototype[o] = function() {
            var A = this.__wrapped__, O = p ? [1] : arguments, F = A instanceof Ot, V = O[0], W = F || St(A), Q = function(Rt) {
              var Lt = S.apply(N, Tn([Rt], O));
              return p && at ? Lt[0] : Lt;
            };
            W && f && typeof V == "function" && V.length != 1 && (F = W = !1);
            var at = this.__chain__, ft = !!this.__actions__.length, xt = b && !at, bt = F && !ft;
            if (!b && W) {
              A = bt ? A : new Ot(this);
              var Et = r.apply(A, O);
              return Et.__actions__.push({ func: zu, args: [Q], thisArg: a }), new xn(Et, at);
            }
            return xt && bt ? r.apply(this, O) : (Et = this.thru(Q), xt ? p ? Et.value()[0] : Et.value() : Et);
          });
        }), Ve(["pop", "push", "shift", "sort", "splice", "unshift"], function(r) {
          var o = K[r], f = /^(?:push|sort|unshift)$/.test(r) ? "tap" : "thru", p = /^(?:pop|shift)$/.test(r);
          N.prototype[r] = function() {
            var S = arguments;
            if (p && !this.__chain__) {
              var b = this.value();
              return o.apply(St(b) ? b : [], S);
            }
            return this[f](function(A) {
              return o.apply(St(A) ? A : [], S);
            });
          };
        }), jn(Ot.prototype, function(r, o) {
          var f = N[o];
          if (f) {
            var p = f.name + "";
            lt.call(zr, p) || (zr[p] = []), zr[p].push({ name: o, func: f });
          }
        }), zr[Ou(a, B).name] = [{
          name: "wrapper",
          func: a
        }], Ot.prototype.clone = D0, Ot.prototype.reverse = F0, Ot.prototype.value = q0, N.prototype.at = dm, N.prototype.chain = _m, N.prototype.commit = mm, N.prototype.next = ym, N.prototype.plant = vm, N.prototype.reverse = xm, N.prototype.toJSON = N.prototype.valueOf = N.prototype.value = Em, N.prototype.first = N.prototype.head, Qs && (N.prototype[Qs] = pm), N;
      }, u = vn();
      ce ? ((ce.exports = u)._ = u, Os._ = u) : ne._ = u;
    }).call(tk);
  }(po, po.exports)), po.exports;
}
var nk = ek();
function ik(n, i) {
  let a = i.features;
  const l = [];
  for (; a.length > 0; ) {
    a = nk.sortBy(a, (m) => {
      if (m.geometry && m.geometry.coordinates && m.geometry.coordinates[0])
        return Vn(n, m.geometry.coordinates[0]);
      throw new Error("Feature missing geometry");
    });
    const c = a.shift(), _ = c.geometry.coordinates[c.geometry.coordinates.length - 1];
    _ && (n = _), l.push(c);
  }
  return l;
}
class qa {
  lowerX;
  upperX;
  lowerY;
  upperY;
  customCenter;
  bottomLeft;
  bottomRight;
  topLeft;
  topRight;
  center;
  /** A flattened version of the bounds such as [lowerX, lowerY, upperX, upperY] */
  flatten;
  /**
   * @param args.lowerX
   * @param args.upperX
   * @param args.lowerY
   * @param args.upperY
   * @param args.customCenter If this bounds must have a different center (if we want to offset
   *   the natural center of those bounds). If no custom center is given, the center will be
   *   calculated relative to the bounds.
   */
  constructor(i) {
    const { lowerX: a, upperX: l, lowerY: c, upperY: _, customCenter: m } = i;
    this.lowerX = a, this.upperX = l, this.lowerY = c, this.upperY = _, this.customCenter = m, this.bottomLeft = [this.lowerX, this.lowerY], this.bottomRight = [this.upperX, this.lowerY], this.topLeft = [this.lowerX, this.upperY], this.topRight = [this.upperX, this.upperY], this.center = this.customCenter ?? [
      (this.lowerX + this.upperX) / 2,
      (this.lowerY + this.upperY) / 2
    ], this.flatten = [this.lowerX, this.lowerY, this.upperX, this.upperY];
  }
  isInBounds(i, a) {
    return i >= this.lowerX && i <= this.upperX && a >= this.lowerY && a <= this.upperY;
  }
  /**
   * Will split the coordinates in chunks if some portion of the coordinates are outside bounds
   * (one chunk for the portion inside, one for the portion outside, rinse and repeat if
   * necessary)
   *
   * Can be helpful when requesting information from our backends, but said backend doesn't
   * support world-wide coverage. Typical example is service-profile, if we give it coordinates
   * outside LV95 bounds it will fill what it doesn't know with coordinates following LV95 extent
   * instead of returning undefined
   *
   * @param {[Number, Number][]} coordinates Coordinates `[[x1,y1],[x2,y2],...]` expressed in the
   *   same coordinate system (projection) as the bounds
   * @returns {CoordinatesChunk[] | undefined}
   */
  splitIfOutOfBounds(i) {
    if (!(!Array.isArray(i) || i.length <= 1) && !i.find((a) => a.length !== 2)) {
      if (i.find((a) => !this.isInBounds(a[0], a[1]))) {
        const a = b4(this.flatten), l = $M(So(i), a);
        return i[0] && (l.features = ik(i[0], l)), l.features.map((c) => ({
          coordinates: c.geometry.coordinates,
          isWithinBounds: M4(c.geometry.coordinates).features.every(
            (_) => D4(_, a)
          )
        }));
      }
      return [
        {
          coordinates: i,
          isWithinBounds: !0
        }
      ];
    }
  }
}
const Ta = 15.5, rk = 8, Aa = 2 * Math.PI * Ge / 256;
class f0 {
  /**
   * EPSG:xxxx representation of this coordinate system, but only the numerical part (without the
   * "EPSG:")
   */
  epsgNumber;
  /** EPSG:xxxx representation of this coordinate system */
  epsg;
  /**
   * Label to show users when they are dealing with this coordinate system (can be a translation
   * key)
   */
  label;
  /**
   * Name of this projection, if applicable, so that it can be tested against name in fields such
   * as COG metadata parsing.
   */
  technicalName;
  /**
   * A string describing how proj4 should handle projection/reprojection of this coordinate
   * system, in regard to WGS84. These matrices can be found on the EPSG website for each
   * projection in the Export section, inside the PROJ.4 export type (can be directly accessed by
   * adding .proj4 to the URL of one projection's page on the EPSG website, i.e.
   * https://epsg.io/3857.proj4 for WebMercator)
   */
  proj4transformationMatrix;
  /**
   * Bounds of this projection system, expressed as in its own coordinate system. These boundaries
   * can also be found on the EPSG website, in the section "Projected bounds" of a projection's
   * page. It is possible to specify a custom center to these bounds, so that the application
   * starts at this custom center instead of the natural center (when no coordinates are specified
   * at startup).
   */
  bounds;
  /**
   * A boolean variable indicating whether the Mercator projection pyramid is used.
   *
   * The Mercator projection pyramid is a specific spatial reference system commonly used in
   * mapping and geographic information systems (GIS) applications.
   *
   * If set to `true`, it signifies that the system or dataset is leveraging this projection
   * methodology.
   *
   * If set to `false`, it indicates that the dataset uses an alternative projection or tiling
   * scheme.
   */
  usesMercatorPyramid;
  constructor(i) {
    const {
      epsgNumber: a,
      label: l,
      proj4transformationMatrix: c,
      bounds: _,
      technicalName: m,
      usesMercatorPyramid: g = !1
    } = i;
    this.epsgNumber = a, this.epsg = `EPSG:${a}`, this.label = l, this.proj4transformationMatrix = c, this.bounds = _, this.technicalName = m, this.usesMercatorPyramid = g;
  }
  /**
   * Transforms the bounds of this coordinates system to be expressed in the wanted coordinate
   * system
   *
   * If the coordinate system is invalid, or if bounds are not defined, it will return null
   *
   * @param {CoordinateSystem} coordinateSystem The target coordinate system we want bounds
   *   expressed in
   * @returns {CoordinateSystemBounds | undefined} Bounds, expressed in the coordinate system, or
   *   undefined if bounds are undefined or the coordinate system is invalid
   */
  getBoundsAs(i) {
    if (this.bounds) {
      if (i.epsg === this.epsg)
        return this.bounds;
      const a = _n(this.epsg, i.epsg, this.bounds.bottomLeft), l = _n(this.epsg, i.epsg, this.bounds.topRight);
      let c;
      return this.bounds.customCenter && (c = _n(this.epsg, i.epsg, this.bounds.customCenter)), new qa({
        lowerX: a[0],
        lowerY: a[1],
        upperX: l[0],
        upperY: l[1],
        customCenter: c
      });
    }
  }
  /**
   * Tells if a coordinate (described by X and Y) is in bound of this coordinate system.
   *
   * Will return false if no bounds are defined for this coordinate system
   */
  isInBounds(i, a) {
    return !!this.bounds?.isInBounds(i, a);
  }
  /**
   * Rounds a zoom level.
   *
   * You can, by overwriting this function, add custom zoom level roundings or similar function in
   * your custom coordinate systems.
   *
   * @param zoom A zoom level in this coordinate system
   * @returns The given zoom level after rounding
   */
  roundZoomLevel(i) {
    return ji(i, 3);
  }
  /**
   * A (descending) list of all the available resolution steps for this coordinate system. If this
   * is not the behavior you want, you have to override this function.
   */
  getResolutionSteps(i) {
    if (!this.bounds)
      return [];
    const a = Aa, l = [], c = (i ?? 0) * Math.PI / 180;
    for (let _ = 0; _ < 21; ++_)
      l.push({
        resolution: a * Math.cos(c) / Math.pow(2, _),
        zoom: _
      });
    return l;
  }
  /**
   * The origin to use as anchor for tile coordinate calculations. It will return the bound's
   * [lowerX, upperY] as default value (meaning the top-left corner of bounds). If this is not the
   * behavior you want, you have to override this function.
   *
   * If no bounds are defined, it will return [0, 0]
   */
  getTileOrigin() {
    return this.bounds?.topLeft ?? [0, 0];
  }
  /**
   * List of matrix identifiers for this coordinate system. If this is not the behavior you want,
   * you have to override this function.
   */
  getMatrixIds() {
    const i = [];
    for (let a = 0; a < this.getResolutionSteps().length; ++a)
      i[a] = a;
    return i;
  }
}
class sk extends f0 {
  constructor(i) {
    super(i);
  }
  /**
   * The origin to use as anchor for tile coordinate calculations. It will return the bound's
   * [lowerX, upperY] as default value (meaning the top-left corner of bounds). If this is not the
   * behavior you want, you have to override this function.
   */
  getTileOrigin() {
    return this.bounds.topLeft;
  }
}
const xi = [
  650,
  500,
  250,
  100,
  50,
  20,
  10,
  5,
  2.5,
  2,
  1,
  0.5,
  0.25,
  0.1
], ak = [
  4e3,
  3750,
  3500,
  3250,
  3e3,
  2750,
  2500,
  2250,
  2e3,
  1750,
  1500,
  1250,
  1e3,
  750,
  ...xi.slice(0, 10),
  // see table https://api3.geo.admin.ch/services/sdiservices.html#gettile
  // LV95 doesn't support zoom level 10 at 1.5 resolution, so we need to split
  // the resolution and add it here
  1.5,
  ...xi.slice(10)
], Sn = [
  7.35,
  // min: 0
  7.75,
  // 1
  8.75,
  // 2
  10,
  // 3
  11,
  // 4
  12.5,
  // 5
  13.5,
  // 6
  14.5,
  // 7
  Ta,
  // 8
  15.75,
  // 9
  16.7,
  // 10
  17.75,
  // 11
  18.75,
  // 12
  20,
  // 13
  21
  // max: 14
], uk = [
  "1:2'500'000",
  // zoom 0
  "1:2'500'000",
  // 1
  "1:1'000'000",
  // 2
  "1:1'000'000",
  // 3
  "1:500'000",
  // 4
  "1:200'000",
  // 5
  "1:100'000",
  // 6
  "1:50'000",
  // 7
  "1:25'000",
  // 8
  "1:25'000",
  // 9
  "1:10'000",
  // 10
  "1:10'000",
  // 11
  "1:10'000",
  // 12
  "1:10'000",
  // 13
  "1:10'000"
  // max zoom: 14
], ok = Sn.map(
  (n, i) => i
);
class g0 extends sk {
  getResolutionSteps() {
    return ak.map((i) => {
      const a = xi.indexOf(i) ?? void 0;
      let l;
      return a && (l = uk[a]), {
        zoom: a,
        label: l,
        resolution: i
      };
    });
  }
  get1_25000ZoomLevel() {
    return rk;
  }
  getDefaultZoom() {
    return 1;
  }
  transformStandardZoomLevelToCustom(i) {
    return typeof Sn[0] == "number" && typeof Sn[14] == "number" && i >= Sn[0] && i <= Sn[14] ? Sn.filter(
      (a) => a < i
    ).length : typeof Sn[0] == "number" && i < Sn[0] ? 0 : typeof Sn[14] == "number" && i > Sn[14] ? 14 : this.get1_25000ZoomLevel();
  }
  /**
   * Mapping between Swiss map zooms and standard zooms. Heavily inspired by
   * {@link https://github.com/geoadmin/mf-geoadmin3/blob/ce885985e4af5e3e20c87321e67a650388af3602/src/components/map/MapUtilsService.js#L603-L631 MapUtilsService.js on mf-geoadmin3}
   *
   * @param customZoomLevel A zoom level as desribed in
   *   {@link http://api3.geo.admin.ch/services/sdiservices.html#wmts our backend's doc}
   * @returns A web-mercator zoom level (as described on
   *   {@link https://wiki.openstreetmap.org/wiki/Zoom_levels | OpenStreetMap's wiki}) or the zoom
   *   level to show the 1:25'000 map if the input is invalid
   */
  transformCustomZoomLevelToStandard(i) {
    const a = Math.floor(i);
    return Sn.length - 1 >= a ? Sn[a] ?? Ta : Ta;
  }
  getResolutionForZoomAndCenter(i) {
    const a = Math.round(i);
    return typeof xi[a] != "number" ? 0 : xi[a];
  }
  getZoomForResolutionAndCenter(i) {
    const a = xi.find(
      (c) => c <= i
    );
    if (a)
      return xi.indexOf(a);
    const l = xi.slice(-1)[0];
    return l && l > i ? xi.indexOf(l) : 0;
  }
  roundCoordinateValue(i) {
    return ji(i, 2);
  }
  /**
   * Rounding to the zoom level
   *
   * @param customZoomLevel A zoom level, that could be a floating number
   * @param normalize Normalize the zoom level to the closest swisstopo zoom level, by default it
   *   only round the zoom level to 3 decimal
   * @returns A zoom level matching one of our national maps
   */
  roundZoomLevel(i, a = !1) {
    return a ? v4(i, ok) : super.roundZoomLevel(i);
  }
}
class hk extends g0 {
  constructor() {
    super({
      epsgNumber: 21781,
      label: "CH1903 / LV03",
      technicalName: "LV03",
      // matrix is coming fom https://epsg.io/21781.proj4
      proj4transformationMatrix: "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs",
      // bound is coming from https://epsg.io/21781
      bounds: new qa({
        lowerX: 485071.58,
        upperX: 837119.8,
        lowerY: 74261.72,
        upperY: 299941.79
      }),
      usesMercatorPyramid: !1
    });
  }
}
class lk extends g0 {
  constructor() {
    super({
      epsgNumber: 2056,
      label: "CH1903+ / LV95",
      technicalName: "LV95",
      // matrix is coming fom https://epsg.io/2056.proj4
      proj4transformationMatrix: "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs",
      /**
       * This can be used to constrain OpenLayers (or another mapping framework) to only ask
       * for tiles that are within the extent. It should remove, for instance, the big white
       * zone that is around the pixelkarte-farbe.
       *
       * Values are a ripoff of mf-geoadmin3 (see link below) and are not technically the
       * mathematical bounds of the system, but the limit at which we do not serve data
       * anymore.
       *
       * Those are coordinates expressed in EPSG:2056 (or LV95)
       *
       * @see https://github.com/geoadmin/mf-geoadmin3/blob/0ec560069e93fdceb54ce126a3c2d0ef23a50f45/mk/config.mk#L140
       */
      bounds: new qa({
        lowerX: 242e4,
        upperX: 29e5,
        lowerY: 103e4,
        upperY: 135e4
      }),
      usesMercatorPyramid: !1
    });
  }
}
class d0 extends f0 {
  /** The index in the resolution list where the 1:25000 zoom level is */
  get1_25000ZoomLevel() {
    return Ta;
  }
  getDefaultZoom() {
    return Ta;
  }
}
class ck extends d0 {
  constructor() {
    super({
      epsgNumber: 3857,
      label: "WebMercator",
      // matrix comes from https://epsg.io/3857.proj4
      proj4transformationMatrix: "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=proj",
      // bounds are coming from https://github.com/geoadmin/lib-gatilegrid/blob/58d6e574b69d32740a24edbc086d97897d4b41dc/gatilegrid/tilegrids.py#L122-L125
      bounds: new qa({
        lowerX: -20037508342789244e-9,
        upperX: 20037508342789244e-9,
        lowerY: -20037508342789244e-9,
        upperY: 20037508342789244e-9,
        // center of LV95's extent transformed with epsg.io website
        customCenter: [917209.87, 591473743e-2]
      }),
      usesMercatorPyramid: !0
    });
  }
  roundCoordinateValue(i) {
    return ji(i, 2);
  }
  /**
   * Formula comes from
   * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
   *
   *          resolution = 156543.03 meters / pixel * cos(latitude) / (2 ^ zoom level)
   */
  getResolutionForZoomAndCenter(i, a) {
    const l = _n(this.epsg, mr.epsg, a).map(
      (c) => c * Math.PI / 180
    );
    return typeof l[1] != "number" ? 0 : ji(
      Math.abs(
        Aa * Math.cos(l[1]) / Math.pow(2, i)
      ),
      2
    );
  }
  /**
   * Calculating zoom level by reversing formula from
   * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale :
   *
   *          resolution = 156543.03 * cos(latitude) / (2 ^ zoom level)
   *
   * So that
   *
   *          zoom level = log2( resolution / 156543.03 / cos(latitude) )
   *
   * @param resolution Resolution in meter/pixel
   * @param center As the use an equatorial constant to calculate the zoom level, we need to know
   *   the latitude of the position the resolution must be calculated at, as we need to take into
   *   account the deformation of the WebMercator projection (that is greater the further north we
   *   are)
   */
  getZoomForResolutionAndCenter(i, a) {
    const l = _n(this.epsg, mr.epsg, a).map(
      (c) => c * Math.PI / 180
    );
    return typeof l[1] != "number" ? 0 : Math.abs(
      Math.log2(
        i / Aa / Math.cos(l[1])
      )
    );
  }
}
class fk extends d0 {
  constructor() {
    super({
      epsgNumber: 4326,
      label: "WGS 84 (lat/lon)",
      // matrix comes from https://epsg.io/4326.proj4
      proj4transformationMatrix: "+proj=longlat +datum=WGS84 +no_defs +type=proj",
      bounds: new qa({
        lowerX: -180,
        upperX: 180,
        lowerY: -90,
        upperY: 90,
        // center of LV95's extent transformed with epsg.io website
        customCenter: [8.239436, 46.832259]
      }),
      usesMercatorPyramid: !0
    });
  }
  roundCoordinateValue(i) {
    return ji(i, 6);
  }
  /**
   * Formula comes from
   * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
   *
   *          resolution = 156543.03 meters / pixel * cos(latitude) / (2 ^ zoom level)
   */
  getResolutionForZoomAndCenter(i, a) {
    return ji(
      Math.abs(
        Aa * Math.cos(a[1] * Math.PI / 180) / Math.pow(2, i)
      ),
      2
    );
  }
  /**
   * Ensures an extent is in X,Y order (longitude, latitude). If coordinates are in Y,X order
   * (latitude, longitude), swaps them. WGS84 traditionally uses latitude-first (Y,X) axis order
   * [minY, minX, maxY, maxX] Some WGS84 implementations may use X,Y order therefore we need to
   * check and swap if needed.
   *
   * TODO: This method works for the common coordinates in and around switzerland but will not
   * work for the whole world. Therefore a better solution should be implemented if we want to
   * support coordinates and extents of the whole world.
   *
   * @param extent - Input extent [minX, minY, maxX, maxY] or [minY, minX, maxY, maxX]
   * @returns Extent guaranteed to be in [minX, minY, maxX, maxY] order
   * @link Problem description https://docs.geotools.org/latest/userguide/library/referencing/order.html
   */
  getExtentInOrderXY(i) {
    return i[0] > i[1] ? [i[1], i[0], i[3], i[2]] : i;
  }
  /**
   * Calculating zoom level by reversing formula from
   * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale :
   *
   *          resolution = 156543.03 * cos(latitude) / (2 ^ zoom level)
   *
   * So that
   *
   *          zoom level = log2( resolution / 156543.03 / cos(latitude) )
   *
   * @param resolution Resolution in meter/pixel
   * @param center As the use an equatorial constant to calculate the zoom level, we need to know
   *   the latitude of the position the resolution must be calculated at, as we need to take into
   *   account the deformation of the WebMercator projection (that is greater the further north we
   *   are)
   */
  getZoomForResolutionAndCenter(i, a) {
    return Math.abs(
      Math.log2(
        i / Aa / Math.cos(a[1] * Math.PI / 180)
      )
    );
  }
}
const _0 = new lk(), m0 = new hk(), mr = new fk(), y0 = new ck(), gk = [_0, m0, mr, y0];
function p0(n) {
  if (!Array.isArray(n) || n.length === 0)
    return !1;
  const i = n[0];
  return Array.isArray(i) ? n.every((a) => p0(a)) : typeof n[0] == "number" && typeof n[1] == "number";
}
function dk(n, i, a = !0, l = !1) {
  if (!(!Array.isArray(n) || n.length !== 2 || !n.every(Tl) || n.some(
    (c) => c === Number.POSITIVE_INFINITY || c === Number.NEGATIVE_INFINITY
  )))
    return n.map((c) => {
      const _ = ji(c, i);
      let m;
      return l ? m = _.toFixed(i) : m = _.toString(), a ? E4(m) : m;
    }).join(", ");
}
function v0(n, i) {
  if (i.usesMercatorPyramid && i.bounds && Array.isArray(n)) {
    if (n.length === 2 && n.every(Tl)) {
      const [a, l] = n;
      if (a >= i.bounds.lowerX && a <= i.bounds.upperX)
        return n;
      const c = i.bounds.upperX - i.bounds.lowerX, _ = Math.floor((a - i.bounds.lowerX) / c) * c;
      return [a - _, l];
    } else if (n.every(Array.isArray))
      return n.map(
        (a) => v0(a, i)
      );
  }
  return n;
}
function _k(n) {
  if (Array.isArray(n)) {
    const [i] = n;
    if (Array.isArray(i) && typeof i[0] != "number")
      return i;
  }
  return n;
}
function mk(n) {
  if (Array.isArray(n)) {
    if (n.every((i) => i.length === 2))
      return n;
    if (n.some((i) => i.length > 2))
      return n.map((i) => [i[0], i[1]]);
  }
  throw new Error("Invalid coordinates received, cannot remove Z values");
}
function x0(n, i, a) {
  if (!n || !i)
    throw new Error("Invalid arguments, must receive two CRS");
  if (!p0(a))
    throw new Error(
      "Invalid coordinates received, must be an array of number or an array of coordinates"
    );
  const l = a[0];
  return Array.isArray(l) ? a.map(
    (c) => x0(n, i, c)
  ) : _n(n.epsg, i.epsg, a).map(
    (c) => i.roundCoordinateValue(c)
  );
}
function yk(n) {
  const i = n?.split(":").pop();
  if (i)
    return i === "WGS84" ? mr : gk.find((a) => a.epsg === `EPSG:${i}`);
}
const Ak = {
  toRoundedString: dk,
  wrapXCoordinates: v0,
  unwrapGeometryCoordinates: _k,
  removeZValues: mk,
  reprojectAndRound: x0,
  parseCRS: yk
};
function pk() {
  return [1 / 0, 1 / 0, -1 / 0, -1 / 0];
}
function vk(n, i, a, l, c) {
  return c ? (c[0] = n, c[1] = i, c[2] = a, c[3] = l, c) : [n, i, a, l];
}
function xk(n) {
  return vk(1 / 0, 1 / 0, -1 / 0, -1 / 0, n);
}
function Ek(n, i, a) {
  const l = pk();
  return Mk(n, i) ? (n[0] > i[0] ? l[0] = n[0] : l[0] = i[0], n[1] > i[1] ? l[1] = n[1] : l[1] = i[1], n[2] < i[2] ? l[2] = n[2] : l[2] = i[2], n[3] < i[3] ? l[3] = n[3] : l[3] = i[3]) : xk(l), l;
}
function Mk(n, i) {
  return n[0] <= i[2] && n[2] >= i[0] && n[1] <= i[3] && n[3] >= i[1];
}
function To(n, i, a) {
  if (a.length === 4) {
    const l = _n(n.epsg, i.epsg, [
      a[0],
      a[1]
    ]), c = _n(n.epsg, i.epsg, [
      a[2],
      a[3]
    ]);
    return [...l, ...c].map((_) => i.roundCoordinateValue(_));
  } else if (a.length === 2) {
    const l = _n(n.epsg, i.epsg, a[0]).map(
      (_) => i.roundCoordinateValue(_)
    ), c = _n(n.epsg, i.epsg, a[1]).map(
      (_) => i.roundCoordinateValue(_)
    );
    return [l, c];
  }
  return a;
}
function E0(n) {
  let i = n;
  return n?.length === 4 && (i = [
    [n[0], n[1]],
    [n[2], n[3]]
  ]), i;
}
function xl(n) {
  let i = n;
  return n?.length === 2 && (i = [...n[0], ...n[1]]), i;
}
function kk(n, i, a) {
  if (n?.length !== 4 && n?.length !== 2 || !i || !a || !a.bounds)
    return;
  let l = a.bounds.flatten;
  i.epsg !== a.epsg && (l = To(
    a,
    i,
    l
  ));
  let c = Ek(
    xl(n),
    l
  );
  if (!(!c || // OL now populates the extent with Infinity when nothing is in common, instead returning a null value
  c.every((_) => Math.abs(_) === 1 / 0)))
    return i.epsg !== a.epsg && (c = To(i, a, c)), xl(c);
}
function wk(n) {
  const [i, a] = E0(n);
  return [(i[0] + a[0]) / 2, (i[1] + a[1]) / 2];
}
function Sk(n) {
  const { size: i, coordinate: a, projection: l, resolution: c, rounded: _ = !1 } = n;
  if (!i || !a || !l || !c)
    return;
  let m = a;
  l.epsg !== mr.epsg && (m = _n(l.epsg, mr.epsg, a));
  const g = HM(
    Fi(m),
    // sphere of the wanted number of pixels as radius around the coordinate
    i * c,
    { units: "meters" }
  );
  if (!g)
    return;
  const v = To(mr, l, Ei(g));
  return _ ? v.map((M) => ji(M)) : v;
}
const Rk = {
  projExtent: To,
  normalizeExtent: E0,
  flattenExtent: xl,
  getExtentIntersectionWithCurrentProjection: kk,
  createPixelExtentAround: Sk,
  getExtentCenter: wk
};
function Ik(n) {
  return `color: #000; font-weight: bold; background-color: ${n}; padding: 2px 4px; border-radius: 4px;`;
}
function ho(n) {
  return n.flatMap((i) => {
    if (i && typeof i == "object" && "messages" in i && Array.isArray(i.messages)) {
      const a = [];
      if ("title" in i && typeof i.title == "string") {
        a.push(`%c[${i.title}]%c`);
        let l = "oklch(55.4% 0.046 257.417)";
        "titleColor" in i && typeof i.titleColor == "string" && (l = i.titleColor), a.push(Ik(l)), a.push("");
      }
      return a.push(...i.messages), a;
    }
    return i;
  });
}
function lo(n, i) {
  if (M0.wantedLevels.includes(n))
    switch (n) {
      case 0:
        console.error(...ho(i));
        break;
      case 1:
        console.warn(...ho(i));
        break;
      case 2:
        console.info(...ho(i));
        break;
      case 3:
        console.debug(...ho(i));
        break;
    }
}
const M0 = {
  wantedLevels: [
    0,
    1
    /* Warn */
  ],
  error: (...n) => lo(0, n),
  warn: (...n) => lo(1, n),
  info: (...n) => lo(2, n),
  debug: (...n) => lo(3, n)
}, Nk = (n, i = [y0, _0, m0]) => {
  i.filter((a) => a.proj4transformationMatrix).forEach((a) => {
    try {
      n.defs(a.epsg, a.proj4transformationMatrix);
    } catch (l) {
      const c = l || new Error("Unknown error");
      throw M0.error("Error while setting up projection in proj4", a.epsg, c), c;
    }
  });
};
Nk(_n);
const Ok = 1, Lk = ["1.3.0"];
var bk = /* @__PURE__ */ ((n) => (n.WMTS = "WMTS", n.WMS = "WMS", n.GEOJSON = "GEOJSON", n.AGGREGATE = "AGGREGATE", n.KML = "KML", n.GPX = "GPX", n.VECTOR = "VECTOR", n.GROUP = "GROUP", n.COG = "COG", n))(bk || {}), Ck = /* @__PURE__ */ ((n) => (n.DEFAULT = "DEFAULT", n.GEOADMIN = "GEOADMIN", n))(Ck || {}), Pk = /* @__PURE__ */ ((n) => (n.KVP = "KVP", n.REST = "REST", n))(Pk || {});
const Gk = 9999, Dk = "all", Fk = "current";
export {
  Dk as A,
  mr as B,
  Rk as C,
  y0 as D,
  gk as E,
  Ck as K,
  bk as L,
  Lk as W,
  Gk as Y,
  Ak as a,
  Pk as b,
  Ok as c,
  Fk as d
};
