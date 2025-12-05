function Ry(n) {
  n("EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"), n("EPSG:4269", "+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees"), n("EPSG:3857", "+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs");
  for (var i = 1; i <= 60; ++i)
    n("EPSG:" + (32600 + i), "+proj=utm +zone=" + i + " +datum=WGS84 +units=m"), n("EPSG:" + (32700 + i), "+proj=utm +zone=" + i + " +south +datum=WGS84 +units=m");
  n("EPSG:5041", "+title=WGS 84 / UPS North (E,N) +proj=stere +lat_0=90 +lon_0=0 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m"), n("EPSG:5042", "+title=WGS 84 / UPS South (E,N) +proj=stere +lat_0=-90 +lon_0=0 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m"), n.WGS84 = n["EPSG:4326"], n["EPSG:3785"] = n["EPSG:3857"], n.GOOGLE = n["EPSG:3857"], n["EPSG:900913"] = n["EPSG:3857"], n["EPSG:102113"] = n["EPSG:3857"];
}
var yr = 1, pr = 2, rs = 3, Ty = 4, ul = 5, Ic = 6378137, Ay = 6356752314e-3, Nc = 0.0066943799901413165, wa = 484813681109536e-20, Q = Math.PI / 2, Ly = 0.16666666666666666, Oy = 0.04722222222222222, Gy = 0.022156084656084655, rt = 1e-10, me = 0.017453292519943295, Vn = 57.29577951308232, zt = Math.PI / 4, Pa = Math.PI * 2, ue = 3.14159265359, en = {};
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
const Dy = {
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
var kc = /[\s_\-\/\(\)]/g;
function Ui(n, i) {
  if (n[i])
    return n[i];
  for (var a = Object.keys(n), h = i.toLowerCase().replace(kc, ""), f = -1, v, d; ++f < a.length; )
    if (v = a[f], d = v.toLowerCase().replace(kc, ""), d === h)
      return n[v];
}
function hl(n) {
  var i = {}, a = n.split("+").map(function(g) {
    return g.trim();
  }).filter(function(g) {
    return g;
  }).reduce(function(g, p) {
    var M = p.split("=");
    return M.push(!0), g[M[0].toLowerCase()] = M[1], g;
  }, {}), h, f, v, d = {
    proj: "projName",
    datum: "datumCode",
    rf: function(g) {
      i.rf = parseFloat(g);
    },
    lat_0: function(g) {
      i.lat0 = g * me;
    },
    lat_1: function(g) {
      i.lat1 = g * me;
    },
    lat_2: function(g) {
      i.lat2 = g * me;
    },
    lat_ts: function(g) {
      i.lat_ts = g * me;
    },
    lon_0: function(g) {
      i.long0 = g * me;
    },
    lon_1: function(g) {
      i.long1 = g * me;
    },
    lon_2: function(g) {
      i.long2 = g * me;
    },
    alpha: function(g) {
      i.alpha = parseFloat(g) * me;
    },
    gamma: function(g) {
      i.rectified_grid_angle = parseFloat(g) * me;
    },
    lonc: function(g) {
      i.longc = g * me;
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
      i.datum_params = g.split(",").map(function(p) {
        return parseFloat(p);
      });
    },
    to_meter: function(g) {
      i.to_meter = parseFloat(g);
    },
    units: function(g) {
      i.units = g;
      var p = Ui(Dy, g);
      p && (i.to_meter = p.to_meter);
    },
    from_greenwich: function(g) {
      i.from_greenwich = g * me;
    },
    pm: function(g) {
      var p = Ui(en, g);
      i.from_greenwich = (p || parseFloat(g)) * me;
    },
    nadgrids: function(g) {
      g === "@null" ? i.datumCode = "none" : i.nadgrids = g;
    },
    axis: function(g) {
      var p = "ewnsud";
      g.length === 3 && p.indexOf(g.substr(0, 1)) !== -1 && p.indexOf(g.substr(1, 1)) !== -1 && p.indexOf(g.substr(2, 1)) !== -1 && (i.axis = g);
    },
    approx: function() {
      i.approx = !0;
    },
    over: function() {
      i.over = !0;
    }
  };
  for (h in a)
    f = a[h], h in d ? (v = d[h], typeof v == "function" ? v(f) : i[v] = f) : i[h] = f;
  return typeof i.datumCode == "string" && i.datumCode !== "WGS84" && (i.datumCode = i.datumCode.toLowerCase()), i.projStr = n, i;
}
class Ig {
  static getId(i) {
    const a = i.find((h) => Array.isArray(h) && h[0] === "ID");
    return a && a.length >= 3 ? {
      authority: a[1],
      code: parseInt(a[2], 10)
    } : null;
  }
  static convertUnit(i, a = "unit") {
    if (!i || i.length < 3)
      return { type: a, name: "unknown", conversion_factor: null };
    const h = i[1], f = parseFloat(i[2]) || null, v = i.find((g) => Array.isArray(g) && g[0] === "ID"), d = v ? {
      authority: v[1],
      code: parseInt(v[2], 10)
    } : null;
    return {
      type: a,
      name: h,
      conversion_factor: f,
      id: d
    };
  }
  static convertAxis(i) {
    const a = i[1] || "Unknown";
    let h;
    const f = a.match(/^\((.)\)$/);
    if (f) {
      const M = f[1].toUpperCase();
      if (M === "E") h = "east";
      else if (M === "N") h = "north";
      else if (M === "U") h = "up";
      else throw new Error(`Unknown axis abbreviation: ${M}`);
    } else
      h = i[2] ? i[2].toLowerCase() : "unknown";
    const v = i.find((M) => Array.isArray(M) && M[0] === "ORDER"), d = v ? parseInt(v[1], 10) : null, g = i.find(
      (M) => Array.isArray(M) && (M[0] === "LENGTHUNIT" || M[0] === "ANGLEUNIT" || M[0] === "SCALEUNIT")
    ), p = this.convertUnit(g);
    return {
      name: a,
      direction: h,
      // Use the valid PROJJSON direction value
      unit: p,
      order: d
    };
  }
  static extractAxes(i) {
    return i.filter((a) => Array.isArray(a) && a[0] === "AXIS").map((a) => this.convertAxis(a)).sort((a, h) => (a.order || 0) - (h.order || 0));
  }
  static convert(i, a = {}) {
    switch (i[0]) {
      case "PROJCRS":
        a.type = "ProjectedCRS", a.name = i[1], a.base_crs = i.find((w) => Array.isArray(w) && w[0] === "BASEGEOGCRS") ? this.convert(i.find((w) => Array.isArray(w) && w[0] === "BASEGEOGCRS")) : null, a.conversion = i.find((w) => Array.isArray(w) && w[0] === "CONVERSION") ? this.convert(i.find((w) => Array.isArray(w) && w[0] === "CONVERSION")) : null;
        const h = i.find((w) => Array.isArray(w) && w[0] === "CS");
        h && (a.coordinate_system = {
          type: h[1],
          axis: this.extractAxes(i)
        });
        const f = i.find((w) => Array.isArray(w) && w[0] === "LENGTHUNIT");
        if (f) {
          const w = this.convertUnit(f);
          a.coordinate_system.unit = w;
        }
        a.id = this.getId(i);
        break;
      case "BASEGEOGCRS":
      case "GEOGCRS":
        a.type = "GeographicCRS", a.name = i[1];
        const v = i.find(
          (w) => Array.isArray(w) && (w[0] === "DATUM" || w[0] === "ENSEMBLE")
        );
        if (v) {
          const w = this.convert(v);
          v[0] === "ENSEMBLE" ? a.datum_ensemble = w : a.datum = w;
          const b = i.find((C) => Array.isArray(C) && C[0] === "PRIMEM");
          b && b[1] !== "Greenwich" && (w.prime_meridian = {
            name: b[1],
            longitude: parseFloat(b[2])
          });
        }
        a.coordinate_system = {
          type: "ellipsoidal",
          axis: this.extractAxes(i)
        }, a.id = this.getId(i);
        break;
      case "DATUM":
        a.type = "GeodeticReferenceFrame", a.name = i[1], a.ellipsoid = i.find((w) => Array.isArray(w) && w[0] === "ELLIPSOID") ? this.convert(i.find((w) => Array.isArray(w) && w[0] === "ELLIPSOID")) : null;
        break;
      case "ENSEMBLE":
        a.type = "DatumEnsemble", a.name = i[1], a.members = i.filter((w) => Array.isArray(w) && w[0] === "MEMBER").map((w) => ({
          type: "DatumEnsembleMember",
          name: w[1],
          id: this.getId(w)
          // Extract ID as { authority, code }
        }));
        const d = i.find((w) => Array.isArray(w) && w[0] === "ENSEMBLEACCURACY");
        d && (a.accuracy = parseFloat(d[1]));
        const g = i.find((w) => Array.isArray(w) && w[0] === "ELLIPSOID");
        g && (a.ellipsoid = this.convert(g)), a.id = this.getId(i);
        break;
      case "ELLIPSOID":
        a.type = "Ellipsoid", a.name = i[1], a.semi_major_axis = parseFloat(i[2]), a.inverse_flattening = parseFloat(i[3]), i.find((w) => Array.isArray(w) && w[0] === "LENGTHUNIT") && this.convert(i.find((w) => Array.isArray(w) && w[0] === "LENGTHUNIT"), a);
        break;
      case "CONVERSION":
        a.type = "Conversion", a.name = i[1], a.method = i.find((w) => Array.isArray(w) && w[0] === "METHOD") ? this.convert(i.find((w) => Array.isArray(w) && w[0] === "METHOD")) : null, a.parameters = i.filter((w) => Array.isArray(w) && w[0] === "PARAMETER").map((w) => this.convert(w));
        break;
      case "METHOD":
        a.type = "Method", a.name = i[1], a.id = this.getId(i);
        break;
      case "PARAMETER":
        a.type = "Parameter", a.name = i[1], a.value = parseFloat(i[2]), a.unit = this.convertUnit(
          i.find(
            (w) => Array.isArray(w) && (w[0] === "LENGTHUNIT" || w[0] === "ANGLEUNIT" || w[0] === "SCALEUNIT")
          )
        ), a.id = this.getId(i);
        break;
      case "BOUNDCRS":
        a.type = "BoundCRS";
        const p = i.find((w) => Array.isArray(w) && w[0] === "SOURCECRS");
        if (p) {
          const w = p.find((b) => Array.isArray(b));
          a.source_crs = w ? this.convert(w) : null;
        }
        const M = i.find((w) => Array.isArray(w) && w[0] === "TARGETCRS");
        if (M) {
          const w = M.find((b) => Array.isArray(b));
          a.target_crs = w ? this.convert(w) : null;
        }
        const S = i.find((w) => Array.isArray(w) && w[0] === "ABRIDGEDTRANSFORMATION");
        S ? a.transformation = this.convert(S) : a.transformation = null;
        break;
      case "ABRIDGEDTRANSFORMATION":
        if (a.type = "Transformation", a.name = i[1], a.method = i.find((w) => Array.isArray(w) && w[0] === "METHOD") ? this.convert(i.find((w) => Array.isArray(w) && w[0] === "METHOD")) : null, a.parameters = i.filter((w) => Array.isArray(w) && (w[0] === "PARAMETER" || w[0] === "PARAMETERFILE")).map((w) => {
          if (w[0] === "PARAMETER")
            return this.convert(w);
          if (w[0] === "PARAMETERFILE")
            return {
              name: w[1],
              value: w[2],
              id: {
                authority: "EPSG",
                code: 8656
              }
            };
        }), a.parameters.length === 7) {
          const w = a.parameters[6];
          w.name === "Scale difference" && (w.value = Math.round((w.value - 1) * 1e12) / 1e6);
        }
        a.id = this.getId(i);
        break;
      case "AXIS":
        a.coordinate_system || (a.coordinate_system = { type: "unspecified", axis: [] }), a.coordinate_system.axis.push(this.convertAxis(i));
        break;
      case "LENGTHUNIT":
        const x = this.convertUnit(i, "LinearUnit");
        a.coordinate_system && a.coordinate_system.axis && a.coordinate_system.axis.forEach((w) => {
          w.unit || (w.unit = x);
        }), x.conversion_factor && x.conversion_factor !== 1 && a.semi_major_axis && (a.semi_major_axis = {
          value: a.semi_major_axis,
          unit: x
        });
        break;
      default:
        a.keyword = i[0];
        break;
    }
    return a;
  }
}
class Fy extends Ig {
  static convert(i, a = {}) {
    return super.convert(i, a), a.coordinate_system && a.coordinate_system.subtype === "Cartesian" && delete a.coordinate_system, a.usage && delete a.usage, a;
  }
}
class qy extends Ig {
  static convert(i, a = {}) {
    super.convert(i, a);
    const h = i.find((v) => Array.isArray(v) && v[0] === "CS");
    h && (a.coordinate_system = {
      subtype: h[1],
      axis: this.extractAxes(i)
    });
    const f = i.find((v) => Array.isArray(v) && v[0] === "USAGE");
    if (f) {
      const v = f.find((p) => Array.isArray(p) && p[0] === "SCOPE"), d = f.find((p) => Array.isArray(p) && p[0] === "AREA"), g = f.find((p) => Array.isArray(p) && p[0] === "BBOX");
      a.usage = {}, v && (a.usage.scope = v[1]), d && (a.usage.area = d[1]), g && (a.usage.bbox = g.slice(1));
    }
    return a;
  }
}
function By(n) {
  return n.find((i) => Array.isArray(i) && i[0] === "USAGE") ? "2019" : (n.find((i) => Array.isArray(i) && i[0] === "CS") || n[0] === "BOUNDCRS" || n[0] === "PROJCRS" || n[0] === "GEOGCRS", "2015");
}
function Uy(n) {
  return (By(n) === "2019" ? qy : Fy).convert(n);
}
function zy(n) {
  const i = n.toUpperCase();
  return i.includes("PROJCRS") || i.includes("GEOGCRS") || i.includes("BOUNDCRS") || i.includes("VERTCRS") || i.includes("LENGTHUNIT") || i.includes("ANGLEUNIT") || i.includes("SCALEUNIT") ? "WKT2" : (i.includes("PROJCS") || i.includes("GEOGCS") || i.includes("LOCAL_CS") || i.includes("VERT_CS") || i.includes("UNIT"), "WKT1");
}
var Ca = 1, Ng = 2, kg = 3, Eu = 4, Pg = 5, Ml = -1, Yy = /\s/, Xy = /[A-Za-z]/, Wy = /[A-Za-z84_]/, Ou = /[,\]]/, Cg = /[\d\.E\-\+]/;
function wi(n) {
  if (typeof n != "string")
    throw new Error("not a string");
  this.text = n.trim(), this.level = 0, this.place = 0, this.root = null, this.stack = [], this.currentObject = null, this.state = Ca;
}
wi.prototype.readCharicter = function() {
  var n = this.text[this.place++];
  if (this.state !== Eu)
    for (; Yy.test(n); ) {
      if (this.place >= this.text.length)
        return;
      n = this.text[this.place++];
    }
  switch (this.state) {
    case Ca:
      return this.neutral(n);
    case Ng:
      return this.keyword(n);
    case Eu:
      return this.quoted(n);
    case Pg:
      return this.afterquote(n);
    case kg:
      return this.number(n);
    case Ml:
      return;
  }
};
wi.prototype.afterquote = function(n) {
  if (n === '"') {
    this.word += '"', this.state = Eu;
    return;
  }
  if (Ou.test(n)) {
    this.word = this.word.trim(), this.afterItem(n);
    return;
  }
  throw new Error(`havn't handled "` + n + '" in afterquote yet, index ' + this.place);
};
wi.prototype.afterItem = function(n) {
  if (n === ",") {
    this.word !== null && this.currentObject.push(this.word), this.word = null, this.state = Ca;
    return;
  }
  if (n === "]") {
    this.level--, this.word !== null && (this.currentObject.push(this.word), this.word = null), this.state = Ca, this.currentObject = this.stack.pop(), this.currentObject || (this.state = Ml);
    return;
  }
};
wi.prototype.number = function(n) {
  if (Cg.test(n)) {
    this.word += n;
    return;
  }
  if (Ou.test(n)) {
    this.word = parseFloat(this.word), this.afterItem(n);
    return;
  }
  throw new Error(`havn't handled "` + n + '" in number yet, index ' + this.place);
};
wi.prototype.quoted = function(n) {
  if (n === '"') {
    this.state = Pg;
    return;
  }
  this.word += n;
};
wi.prototype.keyword = function(n) {
  if (Wy.test(n)) {
    this.word += n;
    return;
  }
  if (n === "[") {
    var i = [];
    i.push(this.word), this.level++, this.root === null ? this.root = i : this.currentObject.push(i), this.stack.push(this.currentObject), this.currentObject = i, this.state = Ca;
    return;
  }
  if (Ou.test(n)) {
    this.afterItem(n);
    return;
  }
  throw new Error(`havn't handled "` + n + '" in keyword yet, index ' + this.place);
};
wi.prototype.neutral = function(n) {
  if (Xy.test(n)) {
    this.word = n, this.state = Ng;
    return;
  }
  if (n === '"') {
    this.word = "", this.state = Eu;
    return;
  }
  if (Cg.test(n)) {
    this.word = n, this.state = kg;
    return;
  }
  if (Ou.test(n)) {
    this.afterItem(n);
    return;
  }
  throw new Error(`havn't handled "` + n + '" in neutral yet, index ' + this.place);
};
wi.prototype.output = function() {
  for (; this.place < this.text.length; )
    this.readCharicter();
  if (this.state === Ml)
    return this.root;
  throw new Error('unable to parse string "' + this.text + '". State is ' + this.state);
};
function $y(n) {
  var i = new wi(n);
  return i.output();
}
function Jh(n, i, a) {
  Array.isArray(i) && (a.unshift(i), i = null);
  var h = i ? {} : n, f = a.reduce(function(v, d) {
    return jr(d, v), v;
  }, h);
  i && (n[i] = f);
}
function jr(n, i) {
  if (!Array.isArray(n)) {
    i[n] = !0;
    return;
  }
  var a = n.shift();
  if (a === "PARAMETER" && (a = n.shift()), n.length === 1) {
    if (Array.isArray(n[0])) {
      i[a] = {}, jr(n[0], i[a]);
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
  var h;
  switch (a) {
    case "UNIT":
    case "PRIMEM":
    case "VERT_DATUM":
      i[a] = {
        name: n[0].toLowerCase(),
        convert: n[1]
      }, n.length === 3 && jr(n[2], i[a]);
      return;
    case "SPHEROID":
    case "ELLIPSOID":
      i[a] = {
        name: n[0],
        a: n[1],
        rf: n[2]
      }, n.length === 4 && jr(n[3], i[a]);
      return;
    case "EDATUM":
    case "ENGINEERINGDATUM":
    case "LOCAL_DATUM":
    case "DATUM":
    case "VERT_CS":
    case "VERTCRS":
    case "VERTICALCRS":
      n[0] = ["name", n[0]], Jh(i, a, n);
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
      n[0] = ["name", n[0]], Jh(i, a, n), i[a].type = a;
      return;
    default:
      for (h = -1; ++h < n.length; )
        if (!Array.isArray(n[h]))
          return jr(n, i[a]);
      return Jh(i, a, n);
  }
}
var Hy = 0.017453292519943295;
function Dn(n) {
  return n * Hy;
}
function bg(n) {
  const i = (n.projName || "").toLowerCase().replace(/_/g, " ");
  !n.long0 && n.longc && (i === "albers conic equal area" || i === "lambert azimuthal equal area") && (n.long0 = n.longc), !n.lat_ts && n.lat1 && (i === "stereographic south pole" || i === "polar stereographic (variant b)") ? (n.lat0 = Dn(n.lat1 > 0 ? 90 : -90), n.lat_ts = n.lat1, delete n.lat1) : !n.lat_ts && n.lat0 && (i === "polar stereographic" || i === "polar stereographic (variant a)") && (n.lat_ts = n.lat0, n.lat0 = Dn(n.lat0 > 0 ? 90 : -90), delete n.lat1);
}
function Pc(n) {
  let i = { units: null, to_meter: void 0 };
  return typeof n == "string" ? (i.units = n.toLowerCase(), i.units === "metre" && (i.units = "meter"), i.units === "meter" && (i.to_meter = 1)) : n && n.name && (i.units = n.name.toLowerCase(), i.units === "metre" && (i.units = "meter"), i.to_meter = n.conversion_factor), i;
}
function Cc(n) {
  return typeof n == "object" ? n.value * n.unit.conversion_factor : n;
}
function bc(n, i) {
  n.ellipsoid.radius ? (i.a = n.ellipsoid.radius, i.rf = 0) : (i.a = Cc(n.ellipsoid.semi_major_axis), n.ellipsoid.inverse_flattening !== void 0 ? i.rf = n.ellipsoid.inverse_flattening : n.ellipsoid.semi_major_axis !== void 0 && n.ellipsoid.semi_minor_axis !== void 0 && (i.rf = i.a / (i.a - Cc(n.ellipsoid.semi_minor_axis))));
}
function xu(n, i = {}) {
  return !n || typeof n != "object" ? n : n.type === "BoundCRS" ? (xu(n.source_crs, i), n.transformation && (n.transformation.method && n.transformation.method.name === "NTv2" ? i.nadgrids = n.transformation.parameters[0].value : i.datum_params = n.transformation.parameters.map((a) => a.value)), i) : (Object.keys(n).forEach((a) => {
    const h = n[a];
    if (h !== null)
      switch (a) {
        case "name":
          if (i.srsCode)
            break;
          i.name = h, i.srsCode = h;
          break;
        case "type":
          h === "GeographicCRS" ? i.projName = "longlat" : h === "ProjectedCRS" && n.conversion && n.conversion.method && (i.projName = n.conversion.method.name);
          break;
        case "datum":
        case "datum_ensemble":
          h.ellipsoid && (i.ellps = h.ellipsoid.name, bc(h, i)), h.prime_meridian && (i.from_greenwich = h.prime_meridian.longitude * Math.PI / 180);
          break;
        case "ellipsoid":
          i.ellps = h.name, bc(h, i);
          break;
        case "prime_meridian":
          i.long0 = (h.longitude || 0) * Math.PI / 180;
          break;
        case "coordinate_system":
          if (h.axis) {
            if (i.axis = h.axis.map((f) => {
              const v = f.direction;
              if (v === "east") return "e";
              if (v === "north") return "n";
              if (v === "west") return "w";
              if (v === "south") return "s";
              throw new Error(`Unknown axis direction: ${v}`);
            }).join("") + "u", h.unit) {
              const { units: f, to_meter: v } = Pc(h.unit);
              i.units = f, i.to_meter = v;
            } else if (h.axis[0] && h.axis[0].unit) {
              const { units: f, to_meter: v } = Pc(h.axis[0].unit);
              i.units = f, i.to_meter = v;
            }
          }
          break;
        case "id":
          h.authority && h.code && (i.title = h.authority + ":" + h.code);
          break;
        case "conversion":
          h.method && h.method.name && (i.projName = h.method.name), h.parameters && h.parameters.forEach((f) => {
            const v = f.name.toLowerCase().replace(/\s+/g, "_"), d = f.value;
            f.unit && f.unit.conversion_factor ? i[v] = d * f.unit.conversion_factor : f.unit === "degree" ? i[v] = d * Math.PI / 180 : i[v] = d;
          });
          break;
        case "unit":
          h.name && (i.units = h.name.toLowerCase(), i.units === "metre" && (i.units = "meter")), h.conversion_factor && (i.to_meter = h.conversion_factor);
          break;
        case "base_crs":
          xu(h, i), i.datumCode = h.id ? h.id.authority + "_" + h.id.code : h.name;
          break;
      }
  }), i.latitude_of_false_origin !== void 0 && (i.lat0 = i.latitude_of_false_origin), i.longitude_of_false_origin !== void 0 && (i.long0 = i.longitude_of_false_origin), i.latitude_of_standard_parallel !== void 0 && (i.lat0 = i.latitude_of_standard_parallel, i.lat1 = i.latitude_of_standard_parallel), i.latitude_of_1st_standard_parallel !== void 0 && (i.lat1 = i.latitude_of_1st_standard_parallel), i.latitude_of_2nd_standard_parallel !== void 0 && (i.lat2 = i.latitude_of_2nd_standard_parallel), i.latitude_of_projection_centre !== void 0 && (i.lat0 = i.latitude_of_projection_centre), i.longitude_of_projection_centre !== void 0 && (i.longc = i.longitude_of_projection_centre), i.easting_at_false_origin !== void 0 && (i.x0 = i.easting_at_false_origin), i.northing_at_false_origin !== void 0 && (i.y0 = i.northing_at_false_origin), i.latitude_of_natural_origin !== void 0 && (i.lat0 = i.latitude_of_natural_origin), i.longitude_of_natural_origin !== void 0 && (i.long0 = i.longitude_of_natural_origin), i.longitude_of_origin !== void 0 && (i.long0 = i.longitude_of_origin), i.false_easting !== void 0 && (i.x0 = i.false_easting), i.easting_at_projection_centre && (i.x0 = i.easting_at_projection_centre), i.false_northing !== void 0 && (i.y0 = i.false_northing), i.northing_at_projection_centre && (i.y0 = i.northing_at_projection_centre), i.standard_parallel_1 !== void 0 && (i.lat1 = i.standard_parallel_1), i.standard_parallel_2 !== void 0 && (i.lat2 = i.standard_parallel_2), i.scale_factor_at_natural_origin !== void 0 && (i.k0 = i.scale_factor_at_natural_origin), i.scale_factor_at_projection_centre !== void 0 && (i.k0 = i.scale_factor_at_projection_centre), i.scale_factor_on_pseudo_standard_parallel !== void 0 && (i.k0 = i.scale_factor_on_pseudo_standard_parallel), i.azimuth !== void 0 && (i.alpha = i.azimuth), i.azimuth_at_projection_centre !== void 0 && (i.alpha = i.azimuth_at_projection_centre), i.angle_from_rectified_to_skew_grid && (i.rectified_grid_angle = i.angle_from_rectified_to_skew_grid), bg(i), i);
}
var Vy = [
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
function Zy(n, i) {
  var a = i[0], h = i[1];
  !(a in n) && h in n && (n[a] = n[h], i.length === 3 && (n[a] = i[2](n[a])));
}
function Rg(n) {
  for (var i = Object.keys(n), a = 0, h = i.length; a < h; ++a) {
    var f = i[a];
    Vy.indexOf(f) !== -1 && Ky(n[f]), typeof n[f] == "object" && Rg(n[f]);
  }
}
function Ky(n) {
  if (n.AUTHORITY) {
    var i = Object.keys(n.AUTHORITY)[0];
    i && i in n.AUTHORITY && (n.title = i + ":" + n.AUTHORITY[i]);
  }
  if (n.type === "GEOGCS" ? n.projName = "longlat" : n.type === "LOCAL_CS" ? (n.projName = "identity", n.local = !0) : typeof n.PROJECTION == "object" ? n.projName = Object.keys(n.PROJECTION)[0] : n.projName = n.PROJECTION, n.AXIS) {
    for (var a = "", h = 0, f = n.AXIS.length; h < f; ++h) {
      var v = [n.AXIS[h][0].toLowerCase(), n.AXIS[h][1].toLowerCase()];
      v[0].indexOf("north") !== -1 || (v[0] === "y" || v[0] === "lat") && v[1] === "north" ? a += "n" : v[0].indexOf("south") !== -1 || (v[0] === "y" || v[0] === "lat") && v[1] === "south" ? a += "s" : v[0].indexOf("east") !== -1 || (v[0] === "x" || v[0] === "lon") && v[1] === "east" ? a += "e" : (v[0].indexOf("west") !== -1 || (v[0] === "x" || v[0] === "lon") && v[1] === "west") && (a += "w");
    }
    a.length === 2 && (a += "u"), a.length === 3 && (n.axis = a);
  }
  n.UNIT && (n.units = n.UNIT.name.toLowerCase(), n.units === "metre" && (n.units = "meter"), n.UNIT.convert && (n.type === "GEOGCS" ? n.DATUM && n.DATUM.SPHEROID && (n.to_meter = n.UNIT.convert * n.DATUM.SPHEROID.a) : n.to_meter = n.UNIT.convert));
  var d = n.GEOGCS;
  n.type === "GEOGCS" && (d = n), d && (d.DATUM ? n.datumCode = d.DATUM.name.toLowerCase() : n.datumCode = d.name.toLowerCase(), n.datumCode.slice(0, 2) === "d_" && (n.datumCode = n.datumCode.slice(2)), n.datumCode === "new_zealand_1949" && (n.datumCode = "nzgd49"), (n.datumCode === "wgs_1984" || n.datumCode === "world_geodetic_system_1984") && (n.PROJECTION === "Mercator_Auxiliary_Sphere" && (n.sphere = !0), n.datumCode = "wgs84"), n.datumCode === "belge_1972" && (n.datumCode = "rnb72"), d.DATUM && d.DATUM.SPHEROID && (n.ellps = d.DATUM.SPHEROID.name.replace("_19", "").replace(/[Cc]larke\_18/, "clrk"), n.ellps.toLowerCase().slice(0, 13) === "international" && (n.ellps = "intl"), n.a = d.DATUM.SPHEROID.a, n.rf = parseFloat(d.DATUM.SPHEROID.rf, 10)), d.DATUM && d.DATUM.TOWGS84 && (n.datum_params = d.DATUM.TOWGS84), ~n.datumCode.indexOf("osgb_1936") && (n.datumCode = "osgb36"), ~n.datumCode.indexOf("osni_1952") && (n.datumCode = "osni52"), (~n.datumCode.indexOf("tm65") || ~n.datumCode.indexOf("geodetic_datum_of_1965")) && (n.datumCode = "ire65"), n.datumCode === "ch1903+" && (n.datumCode = "ch1903"), ~n.datumCode.indexOf("israel") && (n.datumCode = "isr93")), n.b && !isFinite(n.b) && (n.b = n.a), n.rectified_grid_angle && (n.rectified_grid_angle = Dn(n.rectified_grid_angle));
  function g(S) {
    var x = n.to_meter || 1;
    return S * x;
  }
  var p = function(S) {
    return Zy(n, S);
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
    ["lat0", "latitude_of_center", Dn],
    ["longitude_of_center", "Longitude_Of_Center"],
    ["longitude_of_center", "Longitude_of_center"],
    ["longc", "longitude_of_center", Dn],
    ["x0", "false_easting", g],
    ["y0", "false_northing", g],
    ["long0", "central_meridian", Dn],
    ["lat0", "latitude_of_origin", Dn],
    ["lat0", "standard_parallel_1", Dn],
    ["lat1", "standard_parallel_1", Dn],
    ["lat2", "standard_parallel_2", Dn],
    ["azimuth", "Azimuth"],
    ["alpha", "azimuth", Dn],
    ["srsCode", "name"]
  ];
  M.forEach(p), bg(n);
}
function Mu(n) {
  if (typeof n == "object")
    return xu(n);
  const i = zy(n);
  var a = $y(n);
  if (i === "WKT2") {
    const v = Uy(a);
    return xu(v);
  }
  var h = a[0], f = {};
  return jr(a, f), Rg(f), f[h];
}
function Pe(n) {
  var i = this;
  if (arguments.length === 2) {
    var a = arguments[1];
    typeof a == "string" ? a.charAt(0) === "+" ? Pe[
      /** @type {string} */
      n
    ] = hl(arguments[1]) : Pe[
      /** @type {string} */
      n
    ] = Mu(arguments[1]) : typeof a == "object" && !("projName" in a) ? Pe[
      /** @type {string} */
      n
    ] = Mu(arguments[1]) : Pe[
      /** @type {string} */
      n
    ] = a;
  } else if (arguments.length === 1) {
    if (Array.isArray(n))
      return n.map(function(h) {
        return Array.isArray(h) ? Pe.apply(i, h) : Pe(h);
      });
    if (typeof n == "string") {
      if (n in Pe)
        return Pe[n];
    } else "EPSG" in n ? Pe["EPSG:" + n.EPSG] = n : "ESRI" in n ? Pe["ESRI:" + n.ESRI] = n : "IAU2000" in n ? Pe["IAU2000:" + n.IAU2000] = n : console.log(n);
    return;
  }
}
Ry(Pe);
function Jy(n) {
  return typeof n == "string";
}
function Qy(n) {
  return n in Pe;
}
function jy(n) {
  return n.indexOf("+") !== 0 && n.indexOf("[") !== -1 || typeof n == "object" && !("srsCode" in n);
}
var tp = ["3857", "900913", "3785", "102113"];
function ep(n) {
  var i = Ui(n, "authority");
  if (i) {
    var a = Ui(i, "epsg");
    return a && tp.indexOf(a) > -1;
  }
}
function np(n) {
  var i = Ui(n, "extension");
  if (i)
    return Ui(i, "proj4");
}
function ip(n) {
  return n[0] === "+";
}
function rp(n) {
  if (Jy(n)) {
    if (Qy(n))
      return Pe[n];
    if (jy(n)) {
      var i = Mu(n);
      if (ep(i))
        return Pe["EPSG:3857"];
      var a = np(i);
      return a ? hl(a) : i;
    }
    if (ip(n))
      return hl(n);
  } else return "projName" in n ? n : Mu(n);
}
function Rc(n, i) {
  n = n || {};
  var a, h;
  if (!i)
    return n;
  for (h in i)
    a = i[h], a !== void 0 && (n[h] = a);
  return n;
}
function Jn(n, i, a) {
  var h = n * i;
  return a / Math.sqrt(1 - h * h);
}
function La(n) {
  return n < 0 ? -1 : 1;
}
function at(n, i) {
  return i || Math.abs(n) <= ue ? n : n - La(n) * Pa;
}
function Fn(n, i, a) {
  var h = n * a, f = 0.5 * n;
  return h = Math.pow((1 - h) / (1 + h), f), Math.tan(0.5 * (Q - i)) / h;
}
function ba(n, i) {
  for (var a = 0.5 * n, h, f, v = Q - 2 * Math.atan(i), d = 0; d <= 15; d++)
    if (h = n * Math.sin(v), f = Q - 2 * Math.atan(i * Math.pow((1 - h) / (1 + h), a)) - v, v += f, Math.abs(f) <= 1e-10)
      return v;
  return -9999;
}
function sp() {
  var n = this.b / this.a;
  this.es = 1 - n * n, "x0" in this || (this.x0 = 0), "y0" in this || (this.y0 = 0), this.e = Math.sqrt(this.es), this.lat_ts ? this.sphere ? this.k0 = Math.cos(this.lat_ts) : this.k0 = Jn(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)) : this.k0 || (this.k ? this.k0 = this.k : this.k0 = 1);
}
function ap(n) {
  var i = n.x, a = n.y;
  if (a * Vn > 90 && a * Vn < -90 && i * Vn > 180 && i * Vn < -180)
    return null;
  var h, f;
  if (Math.abs(Math.abs(a) - Q) <= rt)
    return null;
  if (this.sphere)
    h = this.x0 + this.a * this.k0 * at(i - this.long0, this.over), f = this.y0 + this.a * this.k0 * Math.log(Math.tan(zt + 0.5 * a));
  else {
    var v = Math.sin(a), d = Fn(this.e, a, v);
    h = this.x0 + this.a * this.k0 * at(i - this.long0, this.over), f = this.y0 - this.a * this.k0 * Math.log(d);
  }
  return n.x = h, n.y = f, n;
}
function op(n) {
  var i = n.x - this.x0, a = n.y - this.y0, h, f;
  if (this.sphere)
    f = Q - 2 * Math.atan(Math.exp(-a / (this.a * this.k0)));
  else {
    var v = Math.exp(-a / (this.a * this.k0));
    if (f = ba(this.e, v), f === -9999)
      return null;
  }
  return h = at(this.long0 + i / (this.a * this.k0), this.over), n.x = h, n.y = f, n;
}
var up = ["Mercator", "Popular Visualisation Pseudo Mercator", "Mercator_1SP", "Mercator_Auxiliary_Sphere", "Mercator_Variant_A", "merc"];
const hp = {
  init: sp,
  forward: ap,
  inverse: op,
  names: up
};
function lp() {
}
function Tc(n) {
  return n;
}
var fp = ["longlat", "identity"];
const cp = {
  init: lp,
  forward: Tc,
  inverse: Tc,
  names: fp
};
var gp = [hp, cp], mr = {}, ts = [];
function Tg(n, i) {
  var a = ts.length;
  return n.names ? (ts[a] = n, n.names.forEach(function(h) {
    mr[h.toLowerCase()] = a;
  }), this) : (console.log(i), !0);
}
function Ag(n) {
  return n.replace(/[-\(\)\s]+/g, " ").trim().replace(/ /g, "_");
}
function vp(n) {
  if (!n)
    return !1;
  var i = n.toLowerCase();
  if (typeof mr[i] < "u" && ts[mr[i]] || (i = Ag(i), i in mr && ts[mr[i]]))
    return ts[mr[i]];
}
function _p() {
  gp.forEach(Tg);
}
const dp = {
  start: _p,
  add: Tg,
  get: vp
};
var Lg = {
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
const mp = Lg.WGS84;
function yp(n, i, a, h) {
  var f = n * n, v = i * i, d = (f - v) / f, g = 0;
  h ? (n *= 1 - d * (Ly + d * (Oy + d * Gy)), f = n * n, d = 0) : g = Math.sqrt(d);
  var p = (f - v) / v;
  return {
    es: d,
    e: g,
    ep2: p
  };
}
function pp(n, i, a, h, f) {
  if (!n) {
    var v = Ui(Lg, h);
    v || (v = mp), n = v.a, i = v.b, a = v.rf;
  }
  return a && !i && (i = (1 - 1 / a) * n), (a === 0 || Math.abs(n - i) < rt) && (f = !0, i = n), {
    a: n,
    b: i,
    rf: a,
    sphere: f
  };
}
var gu = {
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
for (var Ep in gu) {
  var Qh = gu[Ep];
  Qh.datumName && (gu[Qh.datumName] = Qh);
}
function xp(n, i, a, h, f, v, d) {
  var g = {};
  return n === void 0 || n === "none" ? g.datum_type = ul : g.datum_type = Ty, i && (g.datum_params = i.map(parseFloat), (g.datum_params[0] !== 0 || g.datum_params[1] !== 0 || g.datum_params[2] !== 0) && (g.datum_type = yr), g.datum_params.length > 3 && (g.datum_params[3] !== 0 || g.datum_params[4] !== 0 || g.datum_params[5] !== 0 || g.datum_params[6] !== 0) && (g.datum_type = pr, g.datum_params[3] *= wa, g.datum_params[4] *= wa, g.datum_params[5] *= wa, g.datum_params[6] = g.datum_params[6] / 1e6 + 1)), d && (g.datum_type = rs, g.grids = d), g.a = a, g.b = h, g.es = f, g.ep2 = v, g;
}
var wl = {};
function Mp(n, i, a) {
  return i instanceof ArrayBuffer ? wp(n, i, a) : { ready: Sp(n, i) };
}
function wp(n, i, a) {
  var h = !0;
  a !== void 0 && a.includeErrorFields === !1 && (h = !1);
  var f = new DataView(i), v = kp(f), d = Pp(f, v), g = Cp(f, d, v, h), p = { header: d, subgrids: g };
  return wl[n] = p, p;
}
async function Sp(n, i) {
  for (var a = [], h = await i.getImageCount(), f = h - 1; f >= 0; f--) {
    var v = await i.getImage(f), d = await v.readRasters(), g = d, p = [v.getWidth(), v.getHeight()], M = v.getBoundingBox().map(Ac), S = [v.fileDirectory.ModelPixelScale[0], v.fileDirectory.ModelPixelScale[1]].map(Ac), x = M[0] + (p[0] - 1) * S[0], w = M[3] - (p[1] - 1) * S[1], b = g[0], C = g[1], G = [];
    for (let z = p[1] - 1; z >= 0; z--)
      for (let Y = p[0] - 1; Y >= 0; Y--) {
        var O = z * p[0] + Y;
        G.push([-Di(C[O]), Di(b[O])]);
      }
    a.push({
      del: S,
      lim: p,
      ll: [-x, w],
      cvs: G
    });
  }
  var B = {
    header: {
      nSubgrids: h
    },
    subgrids: a
  };
  return wl[n] = B, B;
}
function Ip(n) {
  if (n === void 0)
    return null;
  var i = n.split(",");
  return i.map(Np);
}
function Np(n) {
  if (n.length === 0)
    return null;
  var i = n[0] === "@";
  return i && (n = n.slice(1)), n === "null" ? { name: "null", mandatory: !i, grid: null, isNull: !0 } : {
    name: n,
    mandatory: !i,
    grid: wl[n] || null,
    isNull: !1
  };
}
function Ac(n) {
  return n * Math.PI / 180;
}
function Di(n) {
  return n / 3600 * Math.PI / 180;
}
function kp(n) {
  var i = n.getInt32(8, !1);
  return i === 11 ? !1 : (i = n.getInt32(8, !0), i !== 11 && console.warn("Failed to detect nadgrid endian-ness, defaulting to little-endian"), !0);
}
function Pp(n, i) {
  return {
    nFields: n.getInt32(8, i),
    nSubgridFields: n.getInt32(24, i),
    nSubgrids: n.getInt32(40, i),
    shiftType: ll(n, 56, 64).trim(),
    fromSemiMajorAxis: n.getFloat64(120, i),
    fromSemiMinorAxis: n.getFloat64(136, i),
    toSemiMajorAxis: n.getFloat64(152, i),
    toSemiMinorAxis: n.getFloat64(168, i)
  };
}
function ll(n, i, a) {
  return String.fromCharCode.apply(null, new Uint8Array(n.buffer.slice(i, a)));
}
function Cp(n, i, a, h) {
  for (var f = 176, v = [], d = 0; d < i.nSubgrids; d++) {
    var g = Rp(n, f, a), p = Tp(n, f, g, a, h), M = Math.round(
      1 + (g.upperLongitude - g.lowerLongitude) / g.longitudeInterval
    ), S = Math.round(
      1 + (g.upperLatitude - g.lowerLatitude) / g.latitudeInterval
    );
    v.push({
      ll: [Di(g.lowerLongitude), Di(g.lowerLatitude)],
      del: [Di(g.longitudeInterval), Di(g.latitudeInterval)],
      lim: [M, S],
      count: g.gridNodeCount,
      cvs: bp(p)
    });
    var x = 16;
    h === !1 && (x = 8), f += 176 + g.gridNodeCount * x;
  }
  return v;
}
function bp(n) {
  return n.map(function(i) {
    return [Di(i.longitudeShift), Di(i.latitudeShift)];
  });
}
function Rp(n, i, a) {
  return {
    name: ll(n, i + 8, i + 16).trim(),
    parent: ll(n, i + 24, i + 24 + 8).trim(),
    lowerLatitude: n.getFloat64(i + 72, a),
    upperLatitude: n.getFloat64(i + 88, a),
    lowerLongitude: n.getFloat64(i + 104, a),
    upperLongitude: n.getFloat64(i + 120, a),
    latitudeInterval: n.getFloat64(i + 136, a),
    longitudeInterval: n.getFloat64(i + 152, a),
    gridNodeCount: n.getInt32(i + 168, a)
  };
}
function Tp(n, i, a, h, f) {
  var v = i + 176, d = 16;
  f === !1 && (d = 8);
  for (var g = [], p = 0; p < a.gridNodeCount; p++) {
    var M = {
      latitudeShift: n.getFloat32(v + p * d, h),
      longitudeShift: n.getFloat32(v + p * d + 4, h)
    };
    f !== !1 && (M.latitudeAccuracy = n.getFloat32(v + p * d + 8, h), M.longitudeAccuracy = n.getFloat32(v + p * d + 12, h)), g.push(M);
  }
  return g;
}
function Pn(n, i) {
  if (!(this instanceof Pn))
    return new Pn(n);
  this.forward = null, this.inverse = null, this.init = null, this.name, this.names = null, this.title, i = i || function(M) {
    if (M)
      throw M;
  };
  var a = rp(n);
  if (typeof a != "object") {
    i("Could not parse to valid json: " + n);
    return;
  }
  var h = Pn.projections.get(a.projName);
  if (!h) {
    i("Could not get projection name from: " + n);
    return;
  }
  if (a.datumCode && a.datumCode !== "none") {
    var f = Ui(gu, a.datumCode);
    f && (a.datum_params = a.datum_params || (f.towgs84 ? f.towgs84.split(",") : null), a.ellps = f.ellipse, a.datumName = f.datumName ? f.datumName : a.datumCode);
  }
  a.k0 = a.k0 || 1, a.axis = a.axis || "enu", a.ellps = a.ellps || "wgs84", a.lat1 = a.lat1 || a.lat0;
  var v = pp(a.a, a.b, a.rf, a.ellps, a.sphere), d = yp(v.a, v.b, v.rf, a.R_A), g = Ip(a.nadgrids), p = a.datum || xp(
    a.datumCode,
    a.datum_params,
    v.a,
    v.b,
    d.es,
    d.ep2,
    g
  );
  Rc(this, a), Rc(this, h), this.a = v.a, this.b = v.b, this.rf = v.rf, this.sphere = v.sphere, this.es = d.es, this.e = d.e, this.ep2 = d.ep2, this.datum = p, "init" in this && typeof this.init == "function" && this.init(), i(null, this);
}
Pn.projections = dp;
Pn.projections.start();
function Ap(n, i) {
  return n.datum_type !== i.datum_type || n.a !== i.a || Math.abs(n.es - i.es) > 5e-11 ? !1 : n.datum_type === yr ? n.datum_params[0] === i.datum_params[0] && n.datum_params[1] === i.datum_params[1] && n.datum_params[2] === i.datum_params[2] : n.datum_type === pr ? n.datum_params[0] === i.datum_params[0] && n.datum_params[1] === i.datum_params[1] && n.datum_params[2] === i.datum_params[2] && n.datum_params[3] === i.datum_params[3] && n.datum_params[4] === i.datum_params[4] && n.datum_params[5] === i.datum_params[5] && n.datum_params[6] === i.datum_params[6] : !0;
}
function Og(n, i, a) {
  var h = n.x, f = n.y, v = n.z ? n.z : 0, d, g, p, M;
  if (f < -Q && f > -1.001 * Q)
    f = -Q;
  else if (f > Q && f < 1.001 * Q)
    f = Q;
  else {
    if (f < -Q)
      return { x: -1 / 0, y: -1 / 0, z: n.z };
    if (f > Q)
      return { x: 1 / 0, y: 1 / 0, z: n.z };
  }
  return h > Math.PI && (h -= 2 * Math.PI), g = Math.sin(f), M = Math.cos(f), p = g * g, d = a / Math.sqrt(1 - i * p), {
    x: (d + v) * M * Math.cos(h),
    y: (d + v) * M * Math.sin(h),
    z: (d * (1 - i) + v) * g
  };
}
function Gg(n, i, a, h) {
  var f = 1e-12, v = f * f, d = 30, g, p, M, S, x, w, b, C, G, O, B, z, Y, W = n.x, X = n.y, V = n.z ? n.z : 0, K, et, j;
  if (g = Math.sqrt(W * W + X * X), p = Math.sqrt(W * W + X * X + V * V), g / a < f) {
    if (K = 0, p / a < f)
      return et = Q, j = -h, {
        x: n.x,
        y: n.y,
        z: n.z
      };
  } else
    K = Math.atan2(X, W);
  M = V / p, S = g / p, x = 1 / Math.sqrt(1 - i * (2 - i) * S * S), C = S * (1 - i) * x, G = M * x, Y = 0;
  do
    Y++, b = a / Math.sqrt(1 - i * G * G), j = g * C + V * G - b * (1 - i * G * G), w = i * b / (b + j), x = 1 / Math.sqrt(1 - w * (2 - w) * S * S), O = S * (1 - w) * x, B = M * x, z = B * C - O * G, C = O, G = B;
  while (z * z > v && Y < d);
  return et = Math.atan(B / Math.abs(O)), {
    x: K,
    y: et,
    z: j
  };
}
function Lp(n, i, a) {
  if (i === yr)
    return {
      x: n.x + a[0],
      y: n.y + a[1],
      z: n.z + a[2]
    };
  if (i === pr) {
    var h = a[0], f = a[1], v = a[2], d = a[3], g = a[4], p = a[5], M = a[6];
    return {
      x: M * (n.x - p * n.y + g * n.z) + h,
      y: M * (p * n.x + n.y - d * n.z) + f,
      z: M * (-g * n.x + d * n.y + n.z) + v
    };
  }
}
function Op(n, i, a) {
  if (i === yr)
    return {
      x: n.x - a[0],
      y: n.y - a[1],
      z: n.z - a[2]
    };
  if (i === pr) {
    var h = a[0], f = a[1], v = a[2], d = a[3], g = a[4], p = a[5], M = a[6], S = (n.x - h) / M, x = (n.y - f) / M, w = (n.z - v) / M;
    return {
      x: S + p * x - g * w,
      y: -p * S + x + d * w,
      z: g * S - d * x + w
    };
  }
}
function Jo(n) {
  return n === yr || n === pr;
}
function Gp(n, i, a) {
  if (Ap(n, i) || n.datum_type === ul || i.datum_type === ul)
    return a;
  var h = n.a, f = n.es;
  if (n.datum_type === rs) {
    var v = Lc(n, !1, a);
    if (v !== 0)
      return;
    h = Ic, f = Nc;
  }
  var d = i.a, g = i.b, p = i.es;
  if (i.datum_type === rs && (d = Ic, g = Ay, p = Nc), f === p && h === d && !Jo(n.datum_type) && !Jo(i.datum_type))
    return a;
  if (a = Og(a, f, h), Jo(n.datum_type) && (a = Lp(a, n.datum_type, n.datum_params)), Jo(i.datum_type) && (a = Op(a, i.datum_type, i.datum_params)), a = Gg(a, p, d, g), i.datum_type === rs) {
    var M = Lc(i, !0, a);
    if (M !== 0)
      return;
  }
  return a;
}
function Lc(n, i, a) {
  if (n.grids === null || n.grids.length === 0)
    return console.log("Grid shift grids not found"), -1;
  var h = { x: -a.x, y: a.y }, f = { x: Number.NaN, y: Number.NaN }, v = [];
  t:
    for (var d = 0; d < n.grids.length; d++) {
      var g = n.grids[d];
      if (v.push(g.name), g.isNull) {
        f = h;
        break;
      }
      if (g.grid === null) {
        if (g.mandatory)
          return console.log("Unable to find mandatory grid '" + g.name + "'"), -1;
        continue;
      }
      for (var p = g.grid.subgrids, M = 0, S = p.length; M < S; M++) {
        var x = p[M], w = (Math.abs(x.del[1]) + Math.abs(x.del[0])) / 1e4, b = x.ll[0] - w, C = x.ll[1] - w, G = x.ll[0] + (x.lim[0] - 1) * x.del[0] + w, O = x.ll[1] + (x.lim[1] - 1) * x.del[1] + w;
        if (!(C > h.y || b > h.x || O < h.y || G < h.x) && (f = Dp(h, i, x), !isNaN(f.x)))
          break t;
      }
    }
  return isNaN(f.x) ? (console.log("Failed to find a grid shift table for location '" + -h.x * Vn + " " + h.y * Vn + " tried: '" + v + "'"), -1) : (a.x = -f.x, a.y = f.y, 0);
}
function Dp(n, i, a) {
  var h = { x: Number.NaN, y: Number.NaN };
  if (isNaN(n.x))
    return h;
  var f = { x: n.x, y: n.y };
  f.x -= a.ll[0], f.y -= a.ll[1], f.x = at(f.x - Math.PI) + Math.PI;
  var v = Oc(f, a);
  if (i) {
    if (isNaN(v.x))
      return h;
    v.x = f.x - v.x, v.y = f.y - v.y;
    var d = 9, g = 1e-12, p, M;
    do {
      if (M = Oc(v, a), isNaN(M.x)) {
        console.log("Inverse grid shift iteration failed, presumably at grid edge.  Using first approximation.");
        break;
      }
      p = { x: f.x - (M.x + v.x), y: f.y - (M.y + v.y) }, v.x += p.x, v.y += p.y;
    } while (d-- && Math.abs(p.x) > g && Math.abs(p.y) > g);
    if (d < 0)
      return console.log("Inverse grid shift iterator failed to converge."), h;
    h.x = at(v.x + a.ll[0]), h.y = v.y + a.ll[1];
  } else
    isNaN(v.x) || (h.x = n.x + v.x, h.y = n.y + v.y);
  return h;
}
function Oc(n, i) {
  var a = { x: n.x / i.del[0], y: n.y / i.del[1] }, h = { x: Math.floor(a.x), y: Math.floor(a.y) }, f = { x: a.x - 1 * h.x, y: a.y - 1 * h.y }, v = { x: Number.NaN, y: Number.NaN }, d;
  if (h.x < 0 || h.x >= i.lim[0] || h.y < 0 || h.y >= i.lim[1])
    return v;
  d = h.y * i.lim[0] + h.x;
  var g = { x: i.cvs[d][0], y: i.cvs[d][1] };
  d++;
  var p = { x: i.cvs[d][0], y: i.cvs[d][1] };
  d += i.lim[0];
  var M = { x: i.cvs[d][0], y: i.cvs[d][1] };
  d--;
  var S = { x: i.cvs[d][0], y: i.cvs[d][1] }, x = f.x * f.y, w = f.x * (1 - f.y), b = (1 - f.x) * (1 - f.y), C = (1 - f.x) * f.y;
  return v.x = b * g.x + w * p.x + C * S.x + x * M.x, v.y = b * g.y + w * p.y + C * S.y + x * M.y, v;
}
function Gc(n, i, a) {
  var h = a.x, f = a.y, v = a.z || 0, d, g, p, M = {};
  for (p = 0; p < 3; p++)
    if (!(i && p === 2 && a.z === void 0))
      switch (p === 0 ? (d = h, "ew".indexOf(n.axis[p]) !== -1 ? g = "x" : g = "y") : p === 1 ? (d = f, "ns".indexOf(n.axis[p]) !== -1 ? g = "y" : g = "x") : (d = v, g = "z"), n.axis[p]) {
        case "e":
          M[g] = d;
          break;
        case "w":
          M[g] = -d;
          break;
        case "n":
          M[g] = d;
          break;
        case "s":
          M[g] = -d;
          break;
        case "u":
          a[g] !== void 0 && (M.z = d);
          break;
        case "d":
          a[g] !== void 0 && (M.z = -d);
          break;
        default:
          return null;
      }
  return M;
}
function Dg(n) {
  var i = {
    x: n[0],
    y: n[1]
  };
  return n.length > 2 && (i.z = n[2]), n.length > 3 && (i.m = n[3]), i;
}
function Fp(n) {
  Dc(n.x), Dc(n.y);
}
function Dc(n) {
  if (typeof Number.isFinite == "function") {
    if (Number.isFinite(n))
      return;
    throw new TypeError("coordinates must be finite numbers");
  }
  if (typeof n != "number" || n !== n || !isFinite(n))
    throw new TypeError("coordinates must be finite numbers");
}
function qp(n, i) {
  return (n.datum.datum_type === yr || n.datum.datum_type === pr || n.datum.datum_type === rs) && i.datumCode !== "WGS84" || (i.datum.datum_type === yr || i.datum.datum_type === pr || i.datum.datum_type === rs) && n.datumCode !== "WGS84";
}
function wu(n, i, a, h) {
  var f;
  Array.isArray(a) ? a = Dg(a) : a = {
    x: a.x,
    y: a.y,
    z: a.z,
    m: a.m
  };
  var v = a.z !== void 0;
  if (Fp(a), n.datum && i.datum && qp(n, i) && (f = new Pn("WGS84"), a = wu(n, f, a, h), n = f), h && n.axis !== "enu" && (a = Gc(n, !1, a)), n.projName === "longlat")
    a = {
      x: a.x * me,
      y: a.y * me,
      z: a.z || 0
    };
  else if (n.to_meter && (a = {
    x: a.x * n.to_meter,
    y: a.y * n.to_meter,
    z: a.z || 0
  }), a = n.inverse(a), !a)
    return;
  if (n.from_greenwich && (a.x += n.from_greenwich), a = Gp(n.datum, i.datum, a), !!a)
    return a = /** @type {import('./core').InterfaceCoordinates} */
    a, i.from_greenwich && (a = {
      x: a.x - i.from_greenwich,
      y: a.y,
      z: a.z || 0
    }), i.projName === "longlat" ? a = {
      x: a.x * Vn,
      y: a.y * Vn,
      z: a.z || 0
    } : (a = i.forward(a), i.to_meter && (a = {
      x: a.x / i.to_meter,
      y: a.y / i.to_meter,
      z: a.z || 0
    })), h && i.axis !== "enu" ? Gc(i, !0, a) : (a && !v && delete a.z, a);
}
var Fc = Pn("WGS84");
function jh(n, i, a, h) {
  var f, v, d;
  return Array.isArray(a) ? (f = wu(n, i, a, h) || { x: NaN, y: NaN }, a.length > 2 ? typeof n.name < "u" && n.name === "geocent" || typeof i.name < "u" && i.name === "geocent" ? typeof f.z == "number" ? (
    /** @type {T} */
    [f.x, f.y, f.z].concat(a.slice(3))
  ) : (
    /** @type {T} */
    [f.x, f.y, a[2]].concat(a.slice(3))
  ) : (
    /** @type {T} */
    [f.x, f.y].concat(a.slice(2))
  ) : (
    /** @type {T} */
    [f.x, f.y]
  )) : (v = wu(n, i, a, h), d = Object.keys(a), d.length === 2 || d.forEach(function(g) {
    if (typeof n.name < "u" && n.name === "geocent" || typeof i.name < "u" && i.name === "geocent") {
      if (g === "x" || g === "y" || g === "z")
        return;
    } else if (g === "x" || g === "y")
      return;
    v[g] = a[g];
  }), /** @type {T} */
  v);
}
function Qo(n) {
  return n instanceof Pn ? n : typeof n == "object" && "oProj" in n ? n.oProj : Pn(
    /** @type {string | PROJJSONDefinition} */
    n
  );
}
function Bp(n, i, a) {
  var h, f, v = !1, d;
  return typeof i > "u" ? (f = Qo(n), h = Fc, v = !0) : (typeof /** @type {?} */
  i.x < "u" || Array.isArray(i)) && (a = /** @type {T} */
  /** @type {?} */
  i, f = Qo(n), h = Fc, v = !0), h || (h = Qo(n)), f || (f = Qo(
    /** @type {string | PROJJSONDefinition | proj } */
    i
  )), a ? jh(h, f, a) : (d = {
    /**
     * @template {TemplateCoordinates} T
     * @param {T} coords
     * @param {boolean=} enforceAxis
     * @returns {T}
     */
    forward: function(g, p) {
      return jh(h, f, g, p);
    },
    /**
     * @template {TemplateCoordinates} T
     * @param {T} coords
     * @param {boolean=} enforceAxis
     * @returns {T}
     */
    inverse: function(g, p) {
      return jh(f, h, g, p);
    }
  }, v && (d.oProj = f), d);
}
var qc = 6, Fg = "AJSAJS", qg = "AFAFAF", es = 65, Qe = 73, Nn = 79, _a = 86, da = 90;
const Up = {
  forward: Bg,
  inverse: zp,
  toPoint: Ug
};
function Bg(n, i) {
  return i = i || 5, Wp(Yp({
    lat: n[1],
    lon: n[0]
  }), i);
}
function zp(n) {
  var i = Sl(Yg(n.toUpperCase()));
  return i.lat && i.lon ? [i.lon, i.lat, i.lon, i.lat] : [i.left, i.bottom, i.right, i.top];
}
function Ug(n) {
  var i = Sl(Yg(n.toUpperCase()));
  return i.lat && i.lon ? [i.lon, i.lat] : [(i.left + i.right) / 2, (i.top + i.bottom) / 2];
}
function tl(n) {
  return n * (Math.PI / 180);
}
function Bc(n) {
  return 180 * (n / Math.PI);
}
function Yp(n) {
  var i = n.lat, a = n.lon, h = 6378137, f = 669438e-8, v = 0.9996, d, g, p, M, S, x, w, b = tl(i), C = tl(a), G, O;
  O = Math.floor((a + 180) / 6) + 1, a === 180 && (O = 60), i >= 56 && i < 64 && a >= 3 && a < 12 && (O = 32), i >= 72 && i < 84 && (a >= 0 && a < 9 ? O = 31 : a >= 9 && a < 21 ? O = 33 : a >= 21 && a < 33 ? O = 35 : a >= 33 && a < 42 && (O = 37)), d = (O - 1) * 6 - 180 + 3, G = tl(d), g = f / (1 - f), p = h / Math.sqrt(1 - f * Math.sin(b) * Math.sin(b)), M = Math.tan(b) * Math.tan(b), S = g * Math.cos(b) * Math.cos(b), x = Math.cos(b) * (C - G), w = h * ((1 - f / 4 - 3 * f * f / 64 - 5 * f * f * f / 256) * b - (3 * f / 8 + 3 * f * f / 32 + 45 * f * f * f / 1024) * Math.sin(2 * b) + (15 * f * f / 256 + 45 * f * f * f / 1024) * Math.sin(4 * b) - 35 * f * f * f / 3072 * Math.sin(6 * b));
  var B = v * p * (x + (1 - M + S) * x * x * x / 6 + (5 - 18 * M + M * M + 72 * S - 58 * g) * x * x * x * x * x / 120) + 5e5, z = v * (w + p * Math.tan(b) * (x * x / 2 + (5 - M + 9 * S + 4 * S * S) * x * x * x * x / 24 + (61 - 58 * M + M * M + 600 * S - 330 * g) * x * x * x * x * x * x / 720));
  return i < 0 && (z += 1e7), {
    northing: Math.round(z),
    easting: Math.round(B),
    zoneNumber: O,
    zoneLetter: Xp(i)
  };
}
function Sl(n) {
  var i = n.northing, a = n.easting, h = n.zoneLetter, f = n.zoneNumber;
  if (f < 0 || f > 60)
    return null;
  var v = 0.9996, d = 6378137, g = 669438e-8, p, M = (1 - Math.sqrt(1 - g)) / (1 + Math.sqrt(1 - g)), S, x, w, b, C, G, O, B, z, Y = a - 5e5, W = i;
  h < "N" && (W -= 1e7), O = (f - 1) * 6 - 180 + 3, p = g / (1 - g), G = W / v, B = G / (d * (1 - g / 4 - 3 * g * g / 64 - 5 * g * g * g / 256)), z = B + (3 * M / 2 - 27 * M * M * M / 32) * Math.sin(2 * B) + (21 * M * M / 16 - 55 * M * M * M * M / 32) * Math.sin(4 * B) + 151 * M * M * M / 96 * Math.sin(6 * B), S = d / Math.sqrt(1 - g * Math.sin(z) * Math.sin(z)), x = Math.tan(z) * Math.tan(z), w = p * Math.cos(z) * Math.cos(z), b = d * (1 - g) / Math.pow(1 - g * Math.sin(z) * Math.sin(z), 1.5), C = Y / (S * v);
  var X = z - S * Math.tan(z) / b * (C * C / 2 - (5 + 3 * x + 10 * w - 4 * w * w - 9 * p) * C * C * C * C / 24 + (61 + 90 * x + 298 * w + 45 * x * x - 252 * p - 3 * w * w) * C * C * C * C * C * C / 720);
  X = Bc(X);
  var V = (C - (1 + 2 * x + w) * C * C * C / 6 + (5 - 2 * w + 28 * x - 3 * w * w + 8 * p + 24 * x * x) * C * C * C * C * C / 120) / Math.cos(z);
  V = O + Bc(V);
  var K;
  if (n.accuracy) {
    var et = Sl({
      northing: n.northing + n.accuracy,
      easting: n.easting + n.accuracy,
      zoneLetter: n.zoneLetter,
      zoneNumber: n.zoneNumber
    });
    K = {
      top: et.lat,
      right: et.lon,
      bottom: X,
      left: V
    };
  } else
    K = {
      lat: X,
      lon: V
    };
  return K;
}
function Xp(n) {
  var i = "Z";
  return 84 >= n && n >= 72 ? i = "X" : 72 > n && n >= 64 ? i = "W" : 64 > n && n >= 56 ? i = "V" : 56 > n && n >= 48 ? i = "U" : 48 > n && n >= 40 ? i = "T" : 40 > n && n >= 32 ? i = "S" : 32 > n && n >= 24 ? i = "R" : 24 > n && n >= 16 ? i = "Q" : 16 > n && n >= 8 ? i = "P" : 8 > n && n >= 0 ? i = "N" : 0 > n && n >= -8 ? i = "M" : -8 > n && n >= -16 ? i = "L" : -16 > n && n >= -24 ? i = "K" : -24 > n && n >= -32 ? i = "J" : -32 > n && n >= -40 ? i = "H" : -40 > n && n >= -48 ? i = "G" : -48 > n && n >= -56 ? i = "F" : -56 > n && n >= -64 ? i = "E" : -64 > n && n >= -72 ? i = "D" : -72 > n && n >= -80 && (i = "C"), i;
}
function Wp(n, i) {
  var a = "00000" + n.easting, h = "00000" + n.northing;
  return n.zoneNumber + n.zoneLetter + $p(n.easting, n.northing, n.zoneNumber) + a.substr(a.length - 5, i) + h.substr(h.length - 5, i);
}
function $p(n, i, a) {
  var h = zg(a), f = Math.floor(n / 1e5), v = Math.floor(i / 1e5) % 20;
  return Hp(f, v, h);
}
function zg(n) {
  var i = n % qc;
  return i === 0 && (i = qc), i;
}
function Hp(n, i, a) {
  var h = a - 1, f = Fg.charCodeAt(h), v = qg.charCodeAt(h), d = f + n - 1, g = v + i, p = !1;
  d > da && (d = d - da + es - 1, p = !0), (d === Qe || f < Qe && d > Qe || (d > Qe || f < Qe) && p) && d++, (d === Nn || f < Nn && d > Nn || (d > Nn || f < Nn) && p) && (d++, d === Qe && d++), d > da && (d = d - da + es - 1), g > _a ? (g = g - _a + es - 1, p = !0) : p = !1, (g === Qe || v < Qe && g > Qe || (g > Qe || v < Qe) && p) && g++, (g === Nn || v < Nn && g > Nn || (g > Nn || v < Nn) && p) && (g++, g === Qe && g++), g > _a && (g = g - _a + es - 1);
  var M = String.fromCharCode(d) + String.fromCharCode(g);
  return M;
}
function Yg(n) {
  if (n && n.length === 0)
    throw "MGRSPoint coverting from nothing";
  for (var i = n.length, a = null, h = "", f, v = 0; !/[A-Z]/.test(f = n.charAt(v)); ) {
    if (v >= 2)
      throw "MGRSPoint bad conversion from: " + n;
    h += f, v++;
  }
  var d = parseInt(h, 10);
  if (v === 0 || v + 3 > i)
    throw "MGRSPoint bad conversion from: " + n;
  var g = n.charAt(v++);
  if (g <= "A" || g === "B" || g === "Y" || g >= "Z" || g === "I" || g === "O")
    throw "MGRSPoint zone letter " + g + " not handled: " + n;
  a = n.substring(v, v += 2);
  for (var p = zg(d), M = Vp(a.charAt(0), p), S = Zp(a.charAt(1), p); S < Kp(g); )
    S += 2e6;
  var x = i - v;
  if (x % 2 !== 0)
    throw `MGRSPoint has to have an even number 
of digits after the zone letter and two 100km letters - front 
half for easting meters, second half for 
northing meters` + n;
  var w = x / 2, b = 0, C = 0, G, O, B, z, Y;
  return w > 0 && (G = 1e5 / Math.pow(10, w), O = n.substring(v, v + w), b = parseFloat(O) * G, B = n.substring(v + w), C = parseFloat(B) * G), z = b + M, Y = C + S, {
    easting: z,
    northing: Y,
    zoneLetter: g,
    zoneNumber: d,
    accuracy: G
  };
}
function Vp(n, i) {
  for (var a = Fg.charCodeAt(i - 1), h = 1e5, f = !1; a !== n.charCodeAt(0); ) {
    if (a++, a === Qe && a++, a === Nn && a++, a > da) {
      if (f)
        throw "Bad character: " + n;
      a = es, f = !0;
    }
    h += 1e5;
  }
  return h;
}
function Zp(n, i) {
  if (n > "V")
    throw "MGRSPoint given invalid Northing " + n;
  for (var a = qg.charCodeAt(i - 1), h = 0, f = !1; a !== n.charCodeAt(0); ) {
    if (a++, a === Qe && a++, a === Nn && a++, a > _a) {
      if (f)
        throw "Bad character: " + n;
      a = es, f = !0;
    }
    h += 1e5;
  }
  return h;
}
function Kp(n) {
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
function os(n, i, a) {
  if (!(this instanceof os))
    return new os(n, i, a);
  if (Array.isArray(n))
    this.x = n[0], this.y = n[1], this.z = n[2] || 0;
  else if (typeof n == "object")
    this.x = n.x, this.y = n.y, this.z = n.z || 0;
  else if (typeof n == "string" && typeof i > "u") {
    var h = n.split(",");
    this.x = parseFloat(h[0]), this.y = parseFloat(h[1]), this.z = parseFloat(h[2]) || 0;
  } else
    this.x = n, this.y = i, this.z = a || 0;
  console.warn("proj4.Point will be removed in version 3, use proj4.toPoint");
}
os.fromMGRS = function(n) {
  return new os(Ug(n));
};
os.prototype.toMGRS = function(n) {
  return Bg([this.x, this.y], n);
};
var Jp = 1, Qp = 0.25, Uc = 0.046875, zc = 0.01953125, Yc = 0.01068115234375, jp = 0.75, t2 = 0.46875, e2 = 0.013020833333333334, n2 = 0.007120768229166667, i2 = 0.3645833333333333, r2 = 0.005696614583333333, s2 = 0.3076171875;
function Il(n) {
  var i = [];
  i[0] = Jp - n * (Qp + n * (Uc + n * (zc + n * Yc))), i[1] = n * (jp - n * (Uc + n * (zc + n * Yc)));
  var a = n * n;
  return i[2] = a * (t2 - n * (e2 + n * n2)), a *= n, i[3] = a * (i2 - n * r2), i[4] = a * n * s2, i;
}
function gs(n, i, a, h) {
  return a *= i, i *= i, h[0] * n - a * (h[1] + i * (h[2] + i * (h[3] + i * h[4])));
}
var a2 = 20;
function Nl(n, i, a) {
  for (var h = 1 / (1 - i), f = n, v = a2; v; --v) {
    var d = Math.sin(f), g = 1 - i * d * d;
    if (g = (gs(f, d, Math.cos(f), a) - n) * (g * Math.sqrt(g)) * h, f -= g, Math.abs(g) < rt)
      return f;
  }
  return f;
}
function o2() {
  this.x0 = this.x0 !== void 0 ? this.x0 : 0, this.y0 = this.y0 !== void 0 ? this.y0 : 0, this.long0 = this.long0 !== void 0 ? this.long0 : 0, this.lat0 = this.lat0 !== void 0 ? this.lat0 : 0, this.es && (this.en = Il(this.es), this.ml0 = gs(this.lat0, Math.sin(this.lat0), Math.cos(this.lat0), this.en));
}
function u2(n) {
  var i = n.x, a = n.y, h = at(i - this.long0, this.over), f, v, d, g = Math.sin(a), p = Math.cos(a);
  if (this.es) {
    var S = p * h, x = Math.pow(S, 2), w = this.ep2 * Math.pow(p, 2), b = Math.pow(w, 2), C = Math.abs(p) > rt ? Math.tan(a) : 0, G = Math.pow(C, 2), O = Math.pow(G, 2);
    f = 1 - this.es * Math.pow(g, 2), S = S / Math.sqrt(f);
    var B = gs(a, g, p, this.en);
    v = this.a * (this.k0 * S * (1 + x / 6 * (1 - G + w + x / 20 * (5 - 18 * G + O + 14 * w - 58 * G * w + x / 42 * (61 + 179 * O - O * G - 479 * G))))) + this.x0, d = this.a * (this.k0 * (B - this.ml0 + g * h * S / 2 * (1 + x / 12 * (5 - G + 9 * w + 4 * b + x / 30 * (61 + O - 58 * G + 270 * w - 330 * G * w + x / 56 * (1385 + 543 * O - O * G - 3111 * G)))))) + this.y0;
  } else {
    var M = p * Math.sin(h);
    if (Math.abs(Math.abs(M) - 1) < rt)
      return 93;
    if (v = 0.5 * this.a * this.k0 * Math.log((1 + M) / (1 - M)) + this.x0, d = p * Math.cos(h) / Math.sqrt(1 - Math.pow(M, 2)), M = Math.abs(d), M >= 1) {
      if (M - 1 > rt)
        return 93;
      d = 0;
    } else
      d = Math.acos(d);
    a < 0 && (d = -d), d = this.a * this.k0 * (d - this.lat0) + this.y0;
  }
  return n.x = v, n.y = d, n;
}
function h2(n) {
  var i, a, h, f, v = (n.x - this.x0) * (1 / this.a), d = (n.y - this.y0) * (1 / this.a);
  if (this.es)
    if (i = this.ml0 + d / this.k0, a = Nl(i, this.es, this.en), Math.abs(a) < Q) {
      var x = Math.sin(a), w = Math.cos(a), b = Math.abs(w) > rt ? Math.tan(a) : 0, C = this.ep2 * Math.pow(w, 2), G = Math.pow(C, 2), O = Math.pow(b, 2), B = Math.pow(O, 2);
      i = 1 - this.es * Math.pow(x, 2);
      var z = v * Math.sqrt(i) / this.k0, Y = Math.pow(z, 2);
      i = i * b, h = a - i * Y / (1 - this.es) * 0.5 * (1 - Y / 12 * (5 + 3 * O - 9 * C * O + C - 4 * G - Y / 30 * (61 + 90 * O - 252 * C * O + 45 * B + 46 * C - Y / 56 * (1385 + 3633 * O + 4095 * B + 1574 * B * O)))), f = at(this.long0 + z * (1 - Y / 6 * (1 + 2 * O + C - Y / 20 * (5 + 28 * O + 24 * B + 8 * C * O + 6 * C - Y / 42 * (61 + 662 * O + 1320 * B + 720 * B * O)))) / w, this.over);
    } else
      h = Q * La(d), f = 0;
  else {
    var g = Math.exp(v / this.k0), p = 0.5 * (g - 1 / g), M = this.lat0 + d / this.k0, S = Math.cos(M);
    i = Math.sqrt((1 - Math.pow(S, 2)) / (1 + Math.pow(p, 2))), h = Math.asin(i), d < 0 && (h = -h), p === 0 && S === 0 ? f = 0 : f = at(Math.atan2(p, S) + this.long0, this.over);
  }
  return n.x = f, n.y = h, n;
}
var l2 = ["Fast_Transverse_Mercator", "Fast Transverse Mercator"];
const vu = {
  init: o2,
  forward: u2,
  inverse: h2,
  names: l2
};
function Xg(n) {
  var i = Math.exp(n);
  return i = (i - 1 / i) / 2, i;
}
function je(n, i) {
  n = Math.abs(n), i = Math.abs(i);
  var a = Math.max(n, i), h = Math.min(n, i) / (a || 1);
  return a * Math.sqrt(1 + Math.pow(h, 2));
}
function f2(n) {
  var i = 1 + n, a = i - 1;
  return a === 0 ? n : n * Math.log(i) / a;
}
function c2(n) {
  var i = Math.abs(n);
  return i = f2(i * (1 + i / (je(1, i) + 1))), n < 0 ? -i : i;
}
function kl(n, i) {
  for (var a = 2 * Math.cos(2 * i), h = n.length - 1, f = n[h], v = 0, d; --h >= 0; )
    d = -v + a * f + n[h], v = f, f = d;
  return i + d * Math.sin(2 * i);
}
function g2(n, i) {
  for (var a = 2 * Math.cos(i), h = n.length - 1, f = n[h], v = 0, d; --h >= 0; )
    d = -v + a * f + n[h], v = f, f = d;
  return Math.sin(i) * d;
}
function v2(n) {
  var i = Math.exp(n);
  return i = (i + 1 / i) / 2, i;
}
function Wg(n, i, a) {
  for (var h = Math.sin(i), f = Math.cos(i), v = Xg(a), d = v2(a), g = 2 * f * d, p = -2 * h * v, M = n.length - 1, S = n[M], x = 0, w = 0, b = 0, C, G; --M >= 0; )
    C = w, G = x, w = S, x = b, S = -C + g * w - p * x + n[M], b = -G + p * w + g * x;
  return g = h * d, p = f * v, [g * S - p * b, g * b + p * S];
}
function _2() {
  if (!this.approx && (isNaN(this.es) || this.es <= 0))
    throw new Error('Incorrect elliptical usage. Try using the +approx option in the proj string, or PROJECTION["Fast_Transverse_Mercator"] in the WKT.');
  this.approx && (vu.init.apply(this), this.forward = vu.forward, this.inverse = vu.inverse), this.x0 = this.x0 !== void 0 ? this.x0 : 0, this.y0 = this.y0 !== void 0 ? this.y0 : 0, this.long0 = this.long0 !== void 0 ? this.long0 : 0, this.lat0 = this.lat0 !== void 0 ? this.lat0 : 0, this.cgb = [], this.cbg = [], this.utg = [], this.gtu = [];
  var n = this.es / (1 + Math.sqrt(1 - this.es)), i = n / (2 - n), a = i;
  this.cgb[0] = i * (2 + i * (-2 / 3 + i * (-2 + i * (116 / 45 + i * (26 / 45 + i * (-2854 / 675)))))), this.cbg[0] = i * (-2 + i * (2 / 3 + i * (4 / 3 + i * (-82 / 45 + i * (32 / 45 + i * (4642 / 4725)))))), a = a * i, this.cgb[1] = a * (7 / 3 + i * (-8 / 5 + i * (-227 / 45 + i * (2704 / 315 + i * (2323 / 945))))), this.cbg[1] = a * (5 / 3 + i * (-16 / 15 + i * (-13 / 9 + i * (904 / 315 + i * (-1522 / 945))))), a = a * i, this.cgb[2] = a * (56 / 15 + i * (-136 / 35 + i * (-1262 / 105 + i * (73814 / 2835)))), this.cbg[2] = a * (-26 / 15 + i * (34 / 21 + i * (8 / 5 + i * (-12686 / 2835)))), a = a * i, this.cgb[3] = a * (4279 / 630 + i * (-332 / 35 + i * (-399572 / 14175))), this.cbg[3] = a * (1237 / 630 + i * (-12 / 5 + i * (-24832 / 14175))), a = a * i, this.cgb[4] = a * (4174 / 315 + i * (-144838 / 6237)), this.cbg[4] = a * (-734 / 315 + i * (109598 / 31185)), a = a * i, this.cgb[5] = a * (601676 / 22275), this.cbg[5] = a * (444337 / 155925), a = Math.pow(i, 2), this.Qn = this.k0 / (1 + i) * (1 + a * (1 / 4 + a * (1 / 64 + a / 256))), this.utg[0] = i * (-0.5 + i * (2 / 3 + i * (-37 / 96 + i * (1 / 360 + i * (81 / 512 + i * (-96199 / 604800)))))), this.gtu[0] = i * (0.5 + i * (-2 / 3 + i * (5 / 16 + i * (41 / 180 + i * (-127 / 288 + i * (7891 / 37800)))))), this.utg[1] = a * (-1 / 48 + i * (-1 / 15 + i * (437 / 1440 + i * (-46 / 105 + i * (1118711 / 3870720))))), this.gtu[1] = a * (13 / 48 + i * (-3 / 5 + i * (557 / 1440 + i * (281 / 630 + i * (-1983433 / 1935360))))), a = a * i, this.utg[2] = a * (-17 / 480 + i * (37 / 840 + i * (209 / 4480 + i * (-5569 / 90720)))), this.gtu[2] = a * (61 / 240 + i * (-103 / 140 + i * (15061 / 26880 + i * (167603 / 181440)))), a = a * i, this.utg[3] = a * (-4397 / 161280 + i * (11 / 504 + i * (830251 / 7257600))), this.gtu[3] = a * (49561 / 161280 + i * (-179 / 168 + i * (6601661 / 7257600))), a = a * i, this.utg[4] = a * (-4583 / 161280 + i * (108847 / 3991680)), this.gtu[4] = a * (34729 / 80640 + i * (-3418889 / 1995840)), a = a * i, this.utg[5] = a * (-20648693 / 638668800), this.gtu[5] = a * (212378941 / 319334400);
  var h = kl(this.cbg, this.lat0);
  this.Zb = -this.Qn * (h + g2(this.gtu, 2 * h));
}
function d2(n) {
  var i = at(n.x - this.long0, this.over), a = n.y;
  a = kl(this.cbg, a);
  var h = Math.sin(a), f = Math.cos(a), v = Math.sin(i), d = Math.cos(i);
  a = Math.atan2(h, d * f), i = Math.atan2(v * f, je(h, f * d)), i = c2(Math.tan(i));
  var g = Wg(this.gtu, 2 * a, 2 * i);
  a = a + g[0], i = i + g[1];
  var p, M;
  return Math.abs(i) <= 2.623395162778 ? (p = this.a * (this.Qn * i) + this.x0, M = this.a * (this.Qn * a + this.Zb) + this.y0) : (p = 1 / 0, M = 1 / 0), n.x = p, n.y = M, n;
}
function m2(n) {
  var i = (n.x - this.x0) * (1 / this.a), a = (n.y - this.y0) * (1 / this.a);
  a = (a - this.Zb) / this.Qn, i = i / this.Qn;
  var h, f;
  if (Math.abs(i) <= 2.623395162778) {
    var v = Wg(this.utg, 2 * a, 2 * i);
    a = a + v[0], i = i + v[1], i = Math.atan(Xg(i));
    var d = Math.sin(a), g = Math.cos(a), p = Math.sin(i), M = Math.cos(i);
    a = Math.atan2(d * M, je(p, M * g)), i = Math.atan2(p, M * g), h = at(i + this.long0, this.over), f = kl(this.cgb, a);
  } else
    h = 1 / 0, f = 1 / 0;
  return n.x = h, n.y = f, n;
}
var y2 = ["Extended_Transverse_Mercator", "Extended Transverse Mercator", "etmerc", "Transverse_Mercator", "Transverse Mercator", "Gauss Kruger", "Gauss_Kruger", "tmerc"];
const _u = {
  init: _2,
  forward: d2,
  inverse: m2,
  names: y2
};
function p2(n, i) {
  if (n === void 0) {
    if (n = Math.floor((at(i) + Math.PI) * 30 / Math.PI) + 1, n < 0)
      return 0;
    if (n > 60)
      return 60;
  }
  return n;
}
var E2 = "etmerc";
function x2() {
  var n = p2(this.zone, this.long0);
  if (n === void 0)
    throw new Error("unknown utm zone");
  this.lat0 = 0, this.long0 = (6 * Math.abs(n) - 183) * me, this.x0 = 5e5, this.y0 = this.utmSouth ? 1e7 : 0, this.k0 = 0.9996, _u.init.apply(this), this.forward = _u.forward, this.inverse = _u.inverse;
}
var M2 = ["Universal Transverse Mercator System", "utm"];
const w2 = {
  init: x2,
  names: M2,
  dependsOn: E2
};
function Pl(n, i) {
  return Math.pow((1 - n) / (1 + n), i);
}
var S2 = 20;
function I2() {
  var n = Math.sin(this.lat0), i = Math.cos(this.lat0);
  i *= i, this.rc = Math.sqrt(1 - this.es) / (1 - this.es * n * n), this.C = Math.sqrt(1 + this.es * i * i / (1 - this.es)), this.phic0 = Math.asin(n / this.C), this.ratexp = 0.5 * this.C * this.e, this.K = Math.tan(0.5 * this.phic0 + zt) / (Math.pow(Math.tan(0.5 * this.lat0 + zt), this.C) * Pl(this.e * n, this.ratexp));
}
function N2(n) {
  var i = n.x, a = n.y;
  return n.y = 2 * Math.atan(this.K * Math.pow(Math.tan(0.5 * a + zt), this.C) * Pl(this.e * Math.sin(a), this.ratexp)) - Q, n.x = this.C * i, n;
}
function k2(n) {
  for (var i = 1e-14, a = n.x / this.C, h = n.y, f = Math.pow(Math.tan(0.5 * h + zt) / this.K, 1 / this.C), v = S2; v > 0 && (h = 2 * Math.atan(f * Pl(this.e * Math.sin(n.y), -0.5 * this.e)) - Q, !(Math.abs(h - n.y) < i)); --v)
    n.y = h;
  return v ? (n.x = a, n.y = h, n) : null;
}
const Cl = {
  init: I2,
  forward: N2,
  inverse: k2
};
function P2() {
  Cl.init.apply(this), this.rc && (this.sinc0 = Math.sin(this.phic0), this.cosc0 = Math.cos(this.phic0), this.R2 = 2 * this.rc, this.title || (this.title = "Oblique Stereographic Alternative"));
}
function C2(n) {
  var i, a, h, f;
  return n.x = at(n.x - this.long0, this.over), Cl.forward.apply(this, [n]), i = Math.sin(n.y), a = Math.cos(n.y), h = Math.cos(n.x), f = this.k0 * this.R2 / (1 + this.sinc0 * i + this.cosc0 * a * h), n.x = f * a * Math.sin(n.x), n.y = f * (this.cosc0 * i - this.sinc0 * a * h), n.x = this.a * n.x + this.x0, n.y = this.a * n.y + this.y0, n;
}
function b2(n) {
  var i, a, h, f, v;
  if (n.x = (n.x - this.x0) / this.a, n.y = (n.y - this.y0) / this.a, n.x /= this.k0, n.y /= this.k0, v = je(n.x, n.y)) {
    var d = 2 * Math.atan2(v, this.R2);
    i = Math.sin(d), a = Math.cos(d), f = Math.asin(a * this.sinc0 + n.y * i * this.cosc0 / v), h = Math.atan2(n.x * i, v * this.cosc0 * a - n.y * this.sinc0 * i);
  } else
    f = this.phic0, h = 0;
  return n.x = h, n.y = f, Cl.inverse.apply(this, [n]), n.x = at(n.x + this.long0, this.over), n;
}
var R2 = ["Stereographic_North_Pole", "Oblique_Stereographic", "sterea", "Oblique Stereographic Alternative", "Double_Stereographic"];
const T2 = {
  init: P2,
  forward: C2,
  inverse: b2,
  names: R2
};
function bl(n, i, a) {
  return i *= a, Math.tan(0.5 * (Q + n)) * Math.pow((1 - i) / (1 + i), 0.5 * a);
}
function A2() {
  this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.lat0 = this.lat0 || 0, this.long0 = this.long0 || 0, this.coslat0 = Math.cos(this.lat0), this.sinlat0 = Math.sin(this.lat0), this.sphere ? this.k0 === 1 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= rt && (this.k0 = 0.5 * (1 + La(this.lat0) * Math.sin(this.lat_ts))) : (Math.abs(this.coslat0) <= rt && (this.lat0 > 0 ? this.con = 1 : this.con = -1), this.cons = Math.sqrt(Math.pow(1 + this.e, 1 + this.e) * Math.pow(1 - this.e, 1 - this.e)), this.k0 === 1 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= rt && Math.abs(Math.cos(this.lat_ts)) > rt && (this.k0 = 0.5 * this.cons * Jn(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)) / Fn(this.e, this.con * this.lat_ts, this.con * Math.sin(this.lat_ts))), this.ms1 = Jn(this.e, this.sinlat0, this.coslat0), this.X0 = 2 * Math.atan(bl(this.lat0, this.sinlat0, this.e)) - Q, this.cosX0 = Math.cos(this.X0), this.sinX0 = Math.sin(this.X0));
}
function L2(n) {
  var i = n.x, a = n.y, h = Math.sin(a), f = Math.cos(a), v, d, g, p, M, S, x = at(i - this.long0, this.over);
  return Math.abs(Math.abs(i - this.long0) - Math.PI) <= rt && Math.abs(a + this.lat0) <= rt ? (n.x = NaN, n.y = NaN, n) : this.sphere ? (v = 2 * this.k0 / (1 + this.sinlat0 * h + this.coslat0 * f * Math.cos(x)), n.x = this.a * v * f * Math.sin(x) + this.x0, n.y = this.a * v * (this.coslat0 * h - this.sinlat0 * f * Math.cos(x)) + this.y0, n) : (d = 2 * Math.atan(bl(a, h, this.e)) - Q, p = Math.cos(d), g = Math.sin(d), Math.abs(this.coslat0) <= rt ? (M = Fn(this.e, a * this.con, this.con * h), S = 2 * this.a * this.k0 * M / this.cons, n.x = this.x0 + S * Math.sin(i - this.long0), n.y = this.y0 - this.con * S * Math.cos(i - this.long0), n) : (Math.abs(this.sinlat0) < rt ? (v = 2 * this.a * this.k0 / (1 + p * Math.cos(x)), n.y = v * g) : (v = 2 * this.a * this.k0 * this.ms1 / (this.cosX0 * (1 + this.sinX0 * g + this.cosX0 * p * Math.cos(x))), n.y = v * (this.cosX0 * g - this.sinX0 * p * Math.cos(x)) + this.y0), n.x = v * p * Math.sin(x) + this.x0, n));
}
function O2(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i, a, h, f, v, d = Math.sqrt(n.x * n.x + n.y * n.y);
  if (this.sphere) {
    var g = 2 * Math.atan(d / (2 * this.a * this.k0));
    return i = this.long0, a = this.lat0, d <= rt ? (n.x = i, n.y = a, n) : (a = Math.asin(Math.cos(g) * this.sinlat0 + n.y * Math.sin(g) * this.coslat0 / d), Math.abs(this.coslat0) < rt ? this.lat0 > 0 ? i = at(this.long0 + Math.atan2(n.x, -1 * n.y), this.over) : i = at(this.long0 + Math.atan2(n.x, n.y), this.over) : i = at(this.long0 + Math.atan2(n.x * Math.sin(g), d * this.coslat0 * Math.cos(g) - n.y * this.sinlat0 * Math.sin(g)), this.over), n.x = i, n.y = a, n);
  } else if (Math.abs(this.coslat0) <= rt) {
    if (d <= rt)
      return a = this.lat0, i = this.long0, n.x = i, n.y = a, n;
    n.x *= this.con, n.y *= this.con, h = d * this.cons / (2 * this.a * this.k0), a = this.con * ba(this.e, h), i = this.con * at(this.con * this.long0 + Math.atan2(n.x, -1 * n.y), this.over);
  } else
    f = 2 * Math.atan(d * this.cosX0 / (2 * this.a * this.k0 * this.ms1)), i = this.long0, d <= rt ? v = this.X0 : (v = Math.asin(Math.cos(f) * this.sinX0 + n.y * Math.sin(f) * this.cosX0 / d), i = at(this.long0 + Math.atan2(n.x * Math.sin(f), d * this.cosX0 * Math.cos(f) - n.y * this.sinX0 * Math.sin(f)), this.over)), a = -1 * ba(this.e, Math.tan(0.5 * (Q + v)));
  return n.x = i, n.y = a, n;
}
var G2 = ["stere", "Stereographic_South_Pole", "Polar_Stereographic_variant_A", "Polar_Stereographic_variant_B", "Polar_Stereographic"];
const D2 = {
  init: A2,
  forward: L2,
  inverse: O2,
  names: G2,
  ssfn_: bl
};
function F2() {
  var n = this.lat0;
  this.lambda0 = this.long0;
  var i = Math.sin(n), a = this.a, h = this.rf, f = 1 / h, v = 2 * f - Math.pow(f, 2), d = this.e = Math.sqrt(v);
  this.R = this.k0 * a * Math.sqrt(1 - v) / (1 - v * Math.pow(i, 2)), this.alpha = Math.sqrt(1 + v / (1 - v) * Math.pow(Math.cos(n), 4)), this.b0 = Math.asin(i / this.alpha);
  var g = Math.log(Math.tan(Math.PI / 4 + this.b0 / 2)), p = Math.log(Math.tan(Math.PI / 4 + n / 2)), M = Math.log((1 + d * i) / (1 - d * i));
  this.K = g - this.alpha * p + this.alpha * d / 2 * M;
}
function q2(n) {
  var i = Math.log(Math.tan(Math.PI / 4 - n.y / 2)), a = this.e / 2 * Math.log((1 + this.e * Math.sin(n.y)) / (1 - this.e * Math.sin(n.y))), h = -this.alpha * (i + a) + this.K, f = 2 * (Math.atan(Math.exp(h)) - Math.PI / 4), v = this.alpha * (n.x - this.lambda0), d = Math.atan(Math.sin(v) / (Math.sin(this.b0) * Math.tan(f) + Math.cos(this.b0) * Math.cos(v))), g = Math.asin(Math.cos(this.b0) * Math.sin(f) - Math.sin(this.b0) * Math.cos(f) * Math.cos(v));
  return n.y = this.R / 2 * Math.log((1 + Math.sin(g)) / (1 - Math.sin(g))) + this.y0, n.x = this.R * d + this.x0, n;
}
function B2(n) {
  for (var i = n.x - this.x0, a = n.y - this.y0, h = i / this.R, f = 2 * (Math.atan(Math.exp(a / this.R)) - Math.PI / 4), v = Math.asin(Math.cos(this.b0) * Math.sin(f) + Math.sin(this.b0) * Math.cos(f) * Math.cos(h)), d = Math.atan(Math.sin(h) / (Math.cos(this.b0) * Math.cos(h) - Math.sin(this.b0) * Math.tan(f))), g = this.lambda0 + d / this.alpha, p = 0, M = v, S = -1e3, x = 0; Math.abs(M - S) > 1e-7; ) {
    if (++x > 20)
      return;
    p = 1 / this.alpha * (Math.log(Math.tan(Math.PI / 4 + v / 2)) - this.K) + this.e * Math.log(Math.tan(Math.PI / 4 + Math.asin(this.e * Math.sin(M)) / 2)), S = M, M = 2 * Math.atan(Math.exp(p)) - Math.PI / 2;
  }
  return n.x = g, n.y = M, n;
}
var U2 = ["somerc"];
const z2 = {
  init: F2,
  forward: q2,
  inverse: B2,
  names: U2
};
var Jr = 1e-7;
function Y2(n) {
  var i = ["Hotine_Oblique_Mercator", "Hotine_Oblique_Mercator_variant_A", "Hotine_Oblique_Mercator_Azimuth_Natural_Origin"], a = typeof n.projName == "object" ? Object.keys(n.projName)[0] : n.projName;
  return "no_uoff" in n || "no_off" in n || i.indexOf(a) !== -1 || i.indexOf(Ag(a)) !== -1;
}
function X2() {
  var n, i, a, h, f, v, d, g, p, M, S = 0, x, w = 0, b = 0, C = 0, G = 0, O = 0, B = 0;
  this.no_off = Y2(this), this.no_rot = "no_rot" in this;
  var z = !1;
  "alpha" in this && (z = !0);
  var Y = !1;
  if ("rectified_grid_angle" in this && (Y = !0), z && (B = this.alpha), Y && (S = this.rectified_grid_angle), z || Y)
    w = this.longc;
  else if (b = this.long1, G = this.lat1, C = this.long2, O = this.lat2, Math.abs(G - O) <= Jr || (n = Math.abs(G)) <= Jr || Math.abs(n - Q) <= Jr || Math.abs(Math.abs(this.lat0) - Q) <= Jr || Math.abs(Math.abs(O) - Q) <= Jr)
    throw new Error();
  var W = 1 - this.es;
  i = Math.sqrt(W), Math.abs(this.lat0) > rt ? (g = Math.sin(this.lat0), a = Math.cos(this.lat0), n = 1 - this.es * g * g, this.B = a * a, this.B = Math.sqrt(1 + this.es * this.B * this.B / W), this.A = this.B * this.k0 * i / n, h = this.B * i / (a * Math.sqrt(n)), f = h * h - 1, f <= 0 ? f = 0 : (f = Math.sqrt(f), this.lat0 < 0 && (f = -f)), this.E = f += h, this.E *= Math.pow(Fn(this.e, this.lat0, g), this.B)) : (this.B = 1 / i, this.A = this.k0, this.E = h = f = 1), z || Y ? (z ? (x = Math.asin(Math.sin(B) / h), Y || (S = B)) : (x = S, B = Math.asin(h * Math.sin(x))), this.lam0 = w - Math.asin(0.5 * (f - 1 / f) * Math.tan(x)) / this.B) : (v = Math.pow(Fn(this.e, G, Math.sin(G)), this.B), d = Math.pow(Fn(this.e, O, Math.sin(O)), this.B), f = this.E / v, p = (d - v) / (d + v), M = this.E * this.E, M = (M - d * v) / (M + d * v), n = b - C, n < -Math.PI ? C -= Pa : n > Math.PI && (C += Pa), this.lam0 = at(0.5 * (b + C) - Math.atan(M * Math.tan(0.5 * this.B * (b - C)) / p) / this.B, this.over), x = Math.atan(2 * Math.sin(this.B * at(b - this.lam0, this.over)) / (f - 1 / f)), S = B = Math.asin(h * Math.sin(x))), this.singam = Math.sin(x), this.cosgam = Math.cos(x), this.sinrot = Math.sin(S), this.cosrot = Math.cos(S), this.rB = 1 / this.B, this.ArB = this.A * this.rB, this.BrA = 1 / this.ArB, this.no_off ? this.u_0 = 0 : (this.u_0 = Math.abs(this.ArB * Math.atan(Math.sqrt(h * h - 1) / Math.cos(B))), this.lat0 < 0 && (this.u_0 = -this.u_0)), f = 0.5 * x, this.v_pole_n = this.ArB * Math.log(Math.tan(zt - f)), this.v_pole_s = this.ArB * Math.log(Math.tan(zt + f));
}
function W2(n) {
  var i = {}, a, h, f, v, d, g, p, M;
  if (n.x = n.x - this.lam0, Math.abs(Math.abs(n.y) - Q) > rt) {
    if (d = this.E / Math.pow(Fn(this.e, n.y, Math.sin(n.y)), this.B), g = 1 / d, a = 0.5 * (d - g), h = 0.5 * (d + g), v = Math.sin(this.B * n.x), f = (a * this.singam - v * this.cosgam) / h, Math.abs(Math.abs(f) - 1) < rt)
      throw new Error();
    M = 0.5 * this.ArB * Math.log((1 - f) / (1 + f)), g = Math.cos(this.B * n.x), Math.abs(g) < Jr ? p = this.A * n.x : p = this.ArB * Math.atan2(a * this.cosgam + v * this.singam, g);
  } else
    M = n.y > 0 ? this.v_pole_n : this.v_pole_s, p = this.ArB * n.y;
  return this.no_rot ? (i.x = p, i.y = M) : (p -= this.u_0, i.x = M * this.cosrot + p * this.sinrot, i.y = p * this.cosrot - M * this.sinrot), i.x = this.a * i.x + this.x0, i.y = this.a * i.y + this.y0, i;
}
function $2(n) {
  var i, a, h, f, v, d, g, p = {};
  if (n.x = (n.x - this.x0) * (1 / this.a), n.y = (n.y - this.y0) * (1 / this.a), this.no_rot ? (a = n.y, i = n.x) : (a = n.x * this.cosrot - n.y * this.sinrot, i = n.y * this.cosrot + n.x * this.sinrot + this.u_0), h = Math.exp(-this.BrA * a), f = 0.5 * (h - 1 / h), v = 0.5 * (h + 1 / h), d = Math.sin(this.BrA * i), g = (d * this.cosgam + f * this.singam) / v, Math.abs(Math.abs(g) - 1) < rt)
    p.x = 0, p.y = g < 0 ? -Q : Q;
  else {
    if (p.y = this.E / Math.sqrt((1 + g) / (1 - g)), p.y = ba(this.e, Math.pow(p.y, 1 / this.B)), p.y === 1 / 0)
      throw new Error();
    p.x = -this.rB * Math.atan2(f * this.cosgam - d * this.singam, Math.cos(this.BrA * i));
  }
  return p.x += this.lam0, p;
}
var H2 = ["Hotine_Oblique_Mercator", "Hotine Oblique Mercator", "Hotine_Oblique_Mercator_variant_A", "Hotine_Oblique_Mercator_Variant_B", "Hotine_Oblique_Mercator_Azimuth_Natural_Origin", "Hotine_Oblique_Mercator_Two_Point_Natural_Origin", "Hotine_Oblique_Mercator_Azimuth_Center", "Oblique_Mercator", "omerc"];
const V2 = {
  init: X2,
  forward: W2,
  inverse: $2,
  names: H2
};
function Z2() {
  if (this.lat2 || (this.lat2 = this.lat1), this.k0 || (this.k0 = 1), this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, !(Math.abs(this.lat1 + this.lat2) < rt)) {
    var n = this.b / this.a;
    this.e = Math.sqrt(1 - n * n);
    var i = Math.sin(this.lat1), a = Math.cos(this.lat1), h = Jn(this.e, i, a), f = Fn(this.e, this.lat1, i), v = Math.sin(this.lat2), d = Math.cos(this.lat2), g = Jn(this.e, v, d), p = Fn(this.e, this.lat2, v), M = Math.abs(Math.abs(this.lat0) - Q) < rt ? 0 : Fn(this.e, this.lat0, Math.sin(this.lat0));
    Math.abs(this.lat1 - this.lat2) > rt ? this.ns = Math.log(h / g) / Math.log(f / p) : this.ns = i, isNaN(this.ns) && (this.ns = i), this.f0 = h / (this.ns * Math.pow(f, this.ns)), this.rh = this.a * this.f0 * Math.pow(M, this.ns), this.title || (this.title = "Lambert Conformal Conic");
  }
}
function K2(n) {
  var i = n.x, a = n.y;
  Math.abs(2 * Math.abs(a) - Math.PI) <= rt && (a = La(a) * (Q - 2 * rt));
  var h = Math.abs(Math.abs(a) - Q), f, v;
  if (h > rt)
    f = Fn(this.e, a, Math.sin(a)), v = this.a * this.f0 * Math.pow(f, this.ns);
  else {
    if (h = a * this.ns, h <= 0)
      return null;
    v = 0;
  }
  var d = this.ns * at(i - this.long0, this.over);
  return n.x = this.k0 * (v * Math.sin(d)) + this.x0, n.y = this.k0 * (this.rh - v * Math.cos(d)) + this.y0, n;
}
function J2(n) {
  var i, a, h, f, v, d = (n.x - this.x0) / this.k0, g = this.rh - (n.y - this.y0) / this.k0;
  this.ns > 0 ? (i = Math.sqrt(d * d + g * g), a = 1) : (i = -Math.sqrt(d * d + g * g), a = -1);
  var p = 0;
  if (i !== 0 && (p = Math.atan2(a * d, a * g)), i !== 0 || this.ns > 0) {
    if (a = 1 / this.ns, h = Math.pow(i / (this.a * this.f0), a), f = ba(this.e, h), f === -9999)
      return null;
  } else
    f = -Q;
  return v = at(p / this.ns + this.long0, this.over), n.x = v, n.y = f, n;
}
var Q2 = [
  "Lambert Tangential Conformal Conic Projection",
  "Lambert_Conformal_Conic",
  "Lambert_Conformal_Conic_1SP",
  "Lambert_Conformal_Conic_2SP",
  "lcc",
  "Lambert Conic Conformal (1SP)",
  "Lambert Conic Conformal (2SP)"
];
const j2 = {
  init: Z2,
  forward: K2,
  inverse: J2,
  names: Q2
};
function tE() {
  this.a = 6377397155e-3, this.es = 0.006674372230614, this.e = Math.sqrt(this.es), this.lat0 || (this.lat0 = 0.863937979737193), this.long0 || (this.long0 = 0.7417649320975901 - 0.308341501185665), this.k0 || (this.k0 = 0.9999), this.s45 = 0.785398163397448, this.s90 = 2 * this.s45, this.fi0 = this.lat0, this.e2 = this.es, this.e = Math.sqrt(this.e2), this.alfa = Math.sqrt(1 + this.e2 * Math.pow(Math.cos(this.fi0), 4) / (1 - this.e2)), this.uq = 1.04216856380474, this.u0 = Math.asin(Math.sin(this.fi0) / this.alfa), this.g = Math.pow((1 + this.e * Math.sin(this.fi0)) / (1 - this.e * Math.sin(this.fi0)), this.alfa * this.e / 2), this.k = Math.tan(this.u0 / 2 + this.s45) / Math.pow(Math.tan(this.fi0 / 2 + this.s45), this.alfa) * this.g, this.k1 = this.k0, this.n0 = this.a * Math.sqrt(1 - this.e2) / (1 - this.e2 * Math.pow(Math.sin(this.fi0), 2)), this.s0 = 1.37008346281555, this.n = Math.sin(this.s0), this.ro0 = this.k1 * this.n0 / Math.tan(this.s0), this.ad = this.s90 - this.uq;
}
function eE(n) {
  var i, a, h, f, v, d, g, p = n.x, M = n.y, S = at(p - this.long0, this.over);
  return i = Math.pow((1 + this.e * Math.sin(M)) / (1 - this.e * Math.sin(M)), this.alfa * this.e / 2), a = 2 * (Math.atan(this.k * Math.pow(Math.tan(M / 2 + this.s45), this.alfa) / i) - this.s45), h = -S * this.alfa, f = Math.asin(Math.cos(this.ad) * Math.sin(a) + Math.sin(this.ad) * Math.cos(a) * Math.cos(h)), v = Math.asin(Math.cos(a) * Math.sin(h) / Math.cos(f)), d = this.n * v, g = this.ro0 * Math.pow(Math.tan(this.s0 / 2 + this.s45), this.n) / Math.pow(Math.tan(f / 2 + this.s45), this.n), n.y = g * Math.cos(d) / 1, n.x = g * Math.sin(d) / 1, this.czech || (n.y *= -1, n.x *= -1), n;
}
function nE(n) {
  var i, a, h, f, v, d, g, p, M = n.x;
  n.x = n.y, n.y = M, this.czech || (n.y *= -1, n.x *= -1), d = Math.sqrt(n.x * n.x + n.y * n.y), v = Math.atan2(n.y, n.x), f = v / Math.sin(this.s0), h = 2 * (Math.atan(Math.pow(this.ro0 / d, 1 / this.n) * Math.tan(this.s0 / 2 + this.s45)) - this.s45), i = Math.asin(Math.cos(this.ad) * Math.sin(h) - Math.sin(this.ad) * Math.cos(h) * Math.cos(f)), a = Math.asin(Math.cos(h) * Math.sin(f) / Math.cos(i)), n.x = this.long0 - a / this.alfa, g = i, p = 0;
  var S = 0;
  do
    n.y = 2 * (Math.atan(Math.pow(this.k, -1 / this.alfa) * Math.pow(Math.tan(i / 2 + this.s45), 1 / this.alfa) * Math.pow((1 + this.e * Math.sin(g)) / (1 - this.e * Math.sin(g)), this.e / 2)) - this.s45), Math.abs(g - n.y) < 1e-10 && (p = 1), g = n.y, S += 1;
  while (p === 0 && S < 15);
  return S >= 15 ? null : n;
}
var iE = ["Krovak", "krovak"];
const rE = {
  init: tE,
  forward: eE,
  inverse: nE,
  names: iE
};
function Fe(n, i, a, h, f) {
  return n * f - i * Math.sin(2 * f) + a * Math.sin(4 * f) - h * Math.sin(6 * f);
}
function Oa(n) {
  return 1 - 0.25 * n * (1 + n / 16 * (3 + 1.25 * n));
}
function Ga(n) {
  return 0.375 * n * (1 + 0.25 * n * (1 + 0.46875 * n));
}
function Da(n) {
  return 0.05859375 * n * n * (1 + 0.75 * n);
}
function Fa(n) {
  return n * n * n * (35 / 3072);
}
function Rl(n, i, a) {
  var h = i * a;
  return n / Math.sqrt(1 - h * h);
}
function Wi(n) {
  return Math.abs(n) < Q ? n : n - La(n) * Math.PI;
}
function Su(n, i, a, h, f) {
  var v, d;
  v = n / i;
  for (var g = 0; g < 15; g++)
    if (d = (n - (i * v - a * Math.sin(2 * v) + h * Math.sin(4 * v) - f * Math.sin(6 * v))) / (i - 2 * a * Math.cos(2 * v) + 4 * h * Math.cos(4 * v) - 6 * f * Math.cos(6 * v)), v += d, Math.abs(d) <= 1e-10)
      return v;
  return NaN;
}
function sE() {
  this.sphere || (this.e0 = Oa(this.es), this.e1 = Ga(this.es), this.e2 = Da(this.es), this.e3 = Fa(this.es), this.ml0 = this.a * Fe(this.e0, this.e1, this.e2, this.e3, this.lat0));
}
function aE(n) {
  var i, a, h = n.x, f = n.y;
  if (h = at(h - this.long0, this.over), this.sphere)
    i = this.a * Math.asin(Math.cos(f) * Math.sin(h)), a = this.a * (Math.atan2(Math.tan(f), Math.cos(h)) - this.lat0);
  else {
    var v = Math.sin(f), d = Math.cos(f), g = Rl(this.a, this.e, v), p = Math.tan(f) * Math.tan(f), M = h * Math.cos(f), S = M * M, x = this.es * d * d / (1 - this.es), w = this.a * Fe(this.e0, this.e1, this.e2, this.e3, f);
    i = g * M * (1 - S * p * (1 / 6 - (8 - p + 8 * x) * S / 120)), a = w - this.ml0 + g * v / d * S * (0.5 + (5 - p + 6 * x) * S / 24);
  }
  return n.x = i + this.x0, n.y = a + this.y0, n;
}
function oE(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i = n.x / this.a, a = n.y / this.a, h, f;
  if (this.sphere) {
    var v = a + this.lat0;
    h = Math.asin(Math.sin(v) * Math.cos(i)), f = Math.atan2(Math.tan(i), Math.cos(v));
  } else {
    var d = this.ml0 / this.a + a, g = Su(d, this.e0, this.e1, this.e2, this.e3);
    if (Math.abs(Math.abs(g) - Q) <= rt)
      return n.x = this.long0, n.y = Q, a < 0 && (n.y *= -1), n;
    var p = Rl(this.a, this.e, Math.sin(g)), M = p * p * p / this.a / this.a * (1 - this.es), S = Math.pow(Math.tan(g), 2), x = i * this.a / p, w = x * x;
    h = g - p * Math.tan(g) / M * x * x * (0.5 - (1 + 3 * S) * x * x / 24), f = x * (1 - w * (S / 3 + (1 + 3 * S) * S * w / 15)) / Math.cos(g);
  }
  return n.x = at(f + this.long0, this.over), n.y = Wi(h), n;
}
var uE = ["Cassini", "Cassini_Soldner", "cass"];
const hE = {
  init: sE,
  forward: aE,
  inverse: oE,
  names: uE
};
function qi(n, i) {
  var a;
  return n > 1e-7 ? (a = n * i, (1 - n * n) * (i / (1 - a * a) - 0.5 / n * Math.log((1 - a) / (1 + a)))) : 2 * i;
}
var fl = 1, cl = 2, gl = 3, du = 4;
function lE() {
  var n = Math.abs(this.lat0);
  if (Math.abs(n - Q) < rt ? this.mode = this.lat0 < 0 ? fl : cl : Math.abs(n) < rt ? this.mode = gl : this.mode = du, this.es > 0) {
    var i;
    switch (this.qp = qi(this.e, 1), this.mmf = 0.5 / (1 - this.es), this.apa = pE(this.es), this.mode) {
      case cl:
        this.dd = 1;
        break;
      case fl:
        this.dd = 1;
        break;
      case gl:
        this.rq = Math.sqrt(0.5 * this.qp), this.dd = 1 / this.rq, this.xmf = 1, this.ymf = 0.5 * this.qp;
        break;
      case du:
        this.rq = Math.sqrt(0.5 * this.qp), i = Math.sin(this.lat0), this.sinb1 = qi(this.e, i) / this.qp, this.cosb1 = Math.sqrt(1 - this.sinb1 * this.sinb1), this.dd = Math.cos(this.lat0) / (Math.sqrt(1 - this.es * i * i) * this.rq * this.cosb1), this.ymf = (this.xmf = this.rq) / this.dd, this.xmf *= this.dd;
        break;
    }
  } else
    this.mode === du && (this.sinph0 = Math.sin(this.lat0), this.cosph0 = Math.cos(this.lat0));
}
function fE(n) {
  var i, a, h, f, v, d, g, p, M, S, x = n.x, w = n.y;
  if (x = at(x - this.long0, this.over), this.sphere) {
    if (v = Math.sin(w), S = Math.cos(w), h = Math.cos(x), this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      if (a = this.mode === this.EQUIT ? 1 + S * h : 1 + this.sinph0 * v + this.cosph0 * S * h, a <= rt)
        return null;
      a = Math.sqrt(2 / a), i = a * S * Math.sin(x), a *= this.mode === this.EQUIT ? v : this.cosph0 * v - this.sinph0 * S * h;
    } else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
      if (this.mode === this.N_POLE && (h = -h), Math.abs(w + this.lat0) < rt)
        return null;
      a = zt - w * 0.5, a = 2 * (this.mode === this.S_POLE ? Math.cos(a) : Math.sin(a)), i = a * Math.sin(x), a *= h;
    }
  } else {
    switch (g = 0, p = 0, M = 0, h = Math.cos(x), f = Math.sin(x), v = Math.sin(w), d = qi(this.e, v), (this.mode === this.OBLIQ || this.mode === this.EQUIT) && (g = d / this.qp, p = Math.sqrt(1 - g * g)), this.mode) {
      case this.OBLIQ:
        M = 1 + this.sinb1 * g + this.cosb1 * p * h;
        break;
      case this.EQUIT:
        M = 1 + p * h;
        break;
      case this.N_POLE:
        M = Q + w, d = this.qp - d;
        break;
      case this.S_POLE:
        M = w - Q, d = this.qp + d;
        break;
    }
    if (Math.abs(M) < rt)
      return null;
    switch (this.mode) {
      case this.OBLIQ:
      case this.EQUIT:
        M = Math.sqrt(2 / M), this.mode === this.OBLIQ ? a = this.ymf * M * (this.cosb1 * g - this.sinb1 * p * h) : a = (M = Math.sqrt(2 / (1 + p * h))) * g * this.ymf, i = this.xmf * M * p * f;
        break;
      case this.N_POLE:
      case this.S_POLE:
        d >= 0 ? (i = (M = Math.sqrt(d)) * f, a = h * (this.mode === this.S_POLE ? M : -M)) : i = a = 0;
        break;
    }
  }
  return n.x = this.a * i + this.x0, n.y = this.a * a + this.y0, n;
}
function cE(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i = n.x / this.a, a = n.y / this.a, h, f, v, d, g, p, M;
  if (this.sphere) {
    var S = 0, x, w = 0;
    if (x = Math.sqrt(i * i + a * a), f = x * 0.5, f > 1)
      return null;
    switch (f = 2 * Math.asin(f), (this.mode === this.OBLIQ || this.mode === this.EQUIT) && (w = Math.sin(f), S = Math.cos(f)), this.mode) {
      case this.EQUIT:
        f = Math.abs(x) <= rt ? 0 : Math.asin(a * w / x), i *= w, a = S * x;
        break;
      case this.OBLIQ:
        f = Math.abs(x) <= rt ? this.lat0 : Math.asin(S * this.sinph0 + a * w * this.cosph0 / x), i *= w * this.cosph0, a = (S - Math.sin(f) * this.sinph0) * x;
        break;
      case this.N_POLE:
        a = -a, f = Q - f;
        break;
      case this.S_POLE:
        f -= Q;
        break;
    }
    h = a === 0 && (this.mode === this.EQUIT || this.mode === this.OBLIQ) ? 0 : Math.atan2(i, a);
  } else {
    if (M = 0, this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      if (i /= this.dd, a *= this.dd, p = Math.sqrt(i * i + a * a), p < rt)
        return n.x = this.long0, n.y = this.lat0, n;
      d = 2 * Math.asin(0.5 * p / this.rq), v = Math.cos(d), i *= d = Math.sin(d), this.mode === this.OBLIQ ? (M = v * this.sinb1 + a * d * this.cosb1 / p, g = this.qp * M, a = p * this.cosb1 * v - a * this.sinb1 * d) : (M = a * d / p, g = this.qp * M, a = p * v);
    } else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
      if (this.mode === this.N_POLE && (a = -a), g = i * i + a * a, !g)
        return n.x = this.long0, n.y = this.lat0, n;
      M = 1 - g / this.qp, this.mode === this.S_POLE && (M = -M);
    }
    h = Math.atan2(i, a), f = EE(Math.asin(M), this.apa);
  }
  return n.x = at(this.long0 + h, this.over), n.y = f, n;
}
var gE = 0.3333333333333333, vE = 0.17222222222222222, _E = 0.10257936507936508, dE = 0.06388888888888888, mE = 0.0664021164021164, yE = 0.016415012942191543;
function pE(n) {
  var i, a = [];
  return a[0] = n * gE, i = n * n, a[0] += i * vE, a[1] = i * dE, i *= n, a[0] += i * _E, a[1] += i * mE, a[2] = i * yE, a;
}
function EE(n, i) {
  var a = n + n;
  return n + i[0] * Math.sin(a) + i[1] * Math.sin(a + a) + i[2] * Math.sin(a + a + a);
}
var xE = ["Lambert Azimuthal Equal Area", "Lambert_Azimuthal_Equal_Area", "laea"];
const ME = {
  init: lE,
  forward: fE,
  inverse: cE,
  names: xE,
  S_POLE: fl,
  N_POLE: cl,
  EQUIT: gl,
  OBLIQ: du
};
function zi(n) {
  return Math.abs(n) > 1 && (n = n > 1 ? 1 : -1), Math.asin(n);
}
function wE() {
  Math.abs(this.lat1 + this.lat2) < rt || (this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e3 = Math.sqrt(this.es), this.sin_po = Math.sin(this.lat1), this.cos_po = Math.cos(this.lat1), this.t1 = this.sin_po, this.con = this.sin_po, this.ms1 = Jn(this.e3, this.sin_po, this.cos_po), this.qs1 = qi(this.e3, this.sin_po), this.sin_po = Math.sin(this.lat2), this.cos_po = Math.cos(this.lat2), this.t2 = this.sin_po, this.ms2 = Jn(this.e3, this.sin_po, this.cos_po), this.qs2 = qi(this.e3, this.sin_po), this.sin_po = Math.sin(this.lat0), this.cos_po = Math.cos(this.lat0), this.t3 = this.sin_po, this.qs0 = qi(this.e3, this.sin_po), Math.abs(this.lat1 - this.lat2) > rt ? this.ns0 = (this.ms1 * this.ms1 - this.ms2 * this.ms2) / (this.qs2 - this.qs1) : this.ns0 = this.con, this.c = this.ms1 * this.ms1 + this.ns0 * this.qs1, this.rh = this.a * Math.sqrt(this.c - this.ns0 * this.qs0) / this.ns0);
}
function SE(n) {
  var i = n.x, a = n.y;
  this.sin_phi = Math.sin(a), this.cos_phi = Math.cos(a);
  var h = qi(this.e3, this.sin_phi), f = this.a * Math.sqrt(this.c - this.ns0 * h) / this.ns0, v = this.ns0 * at(i - this.long0, this.over), d = f * Math.sin(v) + this.x0, g = this.rh - f * Math.cos(v) + this.y0;
  return n.x = d, n.y = g, n;
}
function IE(n) {
  var i, a, h, f, v, d;
  return n.x -= this.x0, n.y = this.rh - n.y + this.y0, this.ns0 >= 0 ? (i = Math.sqrt(n.x * n.x + n.y * n.y), h = 1) : (i = -Math.sqrt(n.x * n.x + n.y * n.y), h = -1), f = 0, i !== 0 && (f = Math.atan2(h * n.x, h * n.y)), h = i * this.ns0 / this.a, this.sphere ? d = Math.asin((this.c - h * h) / (2 * this.ns0)) : (a = (this.c - h * h) / this.ns0, d = this.phi1z(this.e3, a)), v = at(f / this.ns0 + this.long0, this.over), n.x = v, n.y = d, n;
}
function NE(n, i) {
  var a, h, f, v, d, g = zi(0.5 * i);
  if (n < rt)
    return g;
  for (var p = n * n, M = 1; M <= 25; M++)
    if (a = Math.sin(g), h = Math.cos(g), f = n * a, v = 1 - f * f, d = 0.5 * v * v / h * (i / (1 - p) - a / v + 0.5 / n * Math.log((1 - f) / (1 + f))), g = g + d, Math.abs(d) <= 1e-7)
      return g;
  return null;
}
var kE = ["Albers_Conic_Equal_Area", "Albers_Equal_Area", "Albers", "aea"];
const PE = {
  init: wE,
  forward: SE,
  inverse: IE,
  names: kE,
  phi1z: NE
};
function CE() {
  this.sin_p14 = Math.sin(this.lat0), this.cos_p14 = Math.cos(this.lat0), this.infinity_dist = 1e3 * this.a, this.rc = 1;
}
function bE(n) {
  var i, a, h, f, v, d, g, p, M = n.x, S = n.y;
  return h = at(M - this.long0, this.over), i = Math.sin(S), a = Math.cos(S), f = Math.cos(h), d = this.sin_p14 * i + this.cos_p14 * a * f, v = 1, d > 0 || Math.abs(d) <= rt ? (g = this.x0 + this.a * v * a * Math.sin(h) / d, p = this.y0 + this.a * v * (this.cos_p14 * i - this.sin_p14 * a * f) / d) : (g = this.x0 + this.infinity_dist * a * Math.sin(h), p = this.y0 + this.infinity_dist * (this.cos_p14 * i - this.sin_p14 * a * f)), n.x = g, n.y = p, n;
}
function RE(n) {
  var i, a, h, f, v, d;
  return n.x = (n.x - this.x0) / this.a, n.y = (n.y - this.y0) / this.a, n.x /= this.k0, n.y /= this.k0, (i = Math.sqrt(n.x * n.x + n.y * n.y)) ? (f = Math.atan2(i, this.rc), a = Math.sin(f), h = Math.cos(f), d = zi(h * this.sin_p14 + n.y * a * this.cos_p14 / i), v = Math.atan2(n.x * a, i * this.cos_p14 * h - n.y * this.sin_p14 * a), v = at(this.long0 + v, this.over)) : (d = this.phic0, v = 0), n.x = v, n.y = d, n;
}
var TE = ["gnom"];
const AE = {
  init: CE,
  forward: bE,
  inverse: RE,
  names: TE
};
function LE(n, i) {
  var a = 1 - (1 - n * n) / (2 * n) * Math.log((1 - n) / (1 + n));
  if (Math.abs(Math.abs(i) - a) < 1e-6)
    return i < 0 ? -1 * Q : Q;
  for (var h = Math.asin(0.5 * i), f, v, d, g, p = 0; p < 30; p++)
    if (v = Math.sin(h), d = Math.cos(h), g = n * v, f = Math.pow(1 - g * g, 2) / (2 * d) * (i / (1 - n * n) - v / (1 - g * g) + 0.5 / n * Math.log((1 - g) / (1 + g))), h += f, Math.abs(f) <= 1e-10)
      return h;
  return NaN;
}
function OE() {
  this.sphere || (this.k0 = Jn(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)));
}
function GE(n) {
  var i = n.x, a = n.y, h, f, v = at(i - this.long0, this.over);
  if (this.sphere)
    h = this.x0 + this.a * v * Math.cos(this.lat_ts), f = this.y0 + this.a * Math.sin(a) / Math.cos(this.lat_ts);
  else {
    var d = qi(this.e, Math.sin(a));
    h = this.x0 + this.a * this.k0 * v, f = this.y0 + this.a * d * 0.5 / this.k0;
  }
  return n.x = h, n.y = f, n;
}
function DE(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i, a;
  return this.sphere ? (i = at(this.long0 + n.x / this.a / Math.cos(this.lat_ts), this.over), a = Math.asin(n.y / this.a * Math.cos(this.lat_ts))) : (a = LE(this.e, 2 * n.y * this.k0 / this.a), i = at(this.long0 + n.x / (this.a * this.k0), this.over)), n.x = i, n.y = a, n;
}
var FE = ["cea"];
const qE = {
  init: OE,
  forward: GE,
  inverse: DE,
  names: FE
};
function BE() {
  this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.lat0 = this.lat0 || 0, this.long0 = this.long0 || 0, this.lat_ts = this.lat_ts || 0, this.title = this.title || "Equidistant Cylindrical (Plate Carre)", this.rc = Math.cos(this.lat_ts);
}
function UE(n) {
  var i = n.x, a = n.y, h = at(i - this.long0, this.over), f = Wi(a - this.lat0);
  return n.x = this.x0 + this.a * h * this.rc, n.y = this.y0 + this.a * f, n;
}
function zE(n) {
  var i = n.x, a = n.y;
  return n.x = at(this.long0 + (i - this.x0) / (this.a * this.rc), this.over), n.y = Wi(this.lat0 + (a - this.y0) / this.a), n;
}
var YE = ["Equirectangular", "Equidistant_Cylindrical", "Equidistant_Cylindrical_Spherical", "eqc"];
const XE = {
  init: BE,
  forward: UE,
  inverse: zE,
  names: YE
};
var Xc = 20;
function WE() {
  this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e = Math.sqrt(this.es), this.e0 = Oa(this.es), this.e1 = Ga(this.es), this.e2 = Da(this.es), this.e3 = Fa(this.es), this.ml0 = this.a * Fe(this.e0, this.e1, this.e2, this.e3, this.lat0);
}
function $E(n) {
  var i = n.x, a = n.y, h, f, v, d = at(i - this.long0, this.over);
  if (v = d * Math.sin(a), this.sphere)
    Math.abs(a) <= rt ? (h = this.a * d, f = -1 * this.a * this.lat0) : (h = this.a * Math.sin(v) / Math.tan(a), f = this.a * (Wi(a - this.lat0) + (1 - Math.cos(v)) / Math.tan(a)));
  else if (Math.abs(a) <= rt)
    h = this.a * d, f = -1 * this.ml0;
  else {
    var g = Rl(this.a, this.e, Math.sin(a)) / Math.tan(a);
    h = g * Math.sin(v), f = this.a * Fe(this.e0, this.e1, this.e2, this.e3, a) - this.ml0 + g * (1 - Math.cos(v));
  }
  return n.x = h + this.x0, n.y = f + this.y0, n;
}
function HE(n) {
  var i, a, h, f, v, d, g, p, M;
  if (h = n.x - this.x0, f = n.y - this.y0, this.sphere)
    if (Math.abs(f + this.a * this.lat0) <= rt)
      i = at(h / this.a + this.long0, this.over), a = 0;
    else {
      d = this.lat0 + f / this.a, g = h * h / this.a / this.a + d * d, p = d;
      var S;
      for (v = Xc; v; --v)
        if (S = Math.tan(p), M = -1 * (d * (p * S + 1) - p - 0.5 * (p * p + g) * S) / ((p - d) / S - 1), p += M, Math.abs(M) <= rt) {
          a = p;
          break;
        }
      i = at(this.long0 + Math.asin(h * Math.tan(p) / this.a) / Math.sin(a), this.over);
    }
  else if (Math.abs(f + this.ml0) <= rt)
    a = 0, i = at(this.long0 + h / this.a, this.over);
  else {
    d = (this.ml0 + f) / this.a, g = h * h / this.a / this.a + d * d, p = d;
    var x, w, b, C, G;
    for (v = Xc; v; --v)
      if (G = this.e * Math.sin(p), x = Math.sqrt(1 - G * G) * Math.tan(p), w = this.a * Fe(this.e0, this.e1, this.e2, this.e3, p), b = this.e0 - 2 * this.e1 * Math.cos(2 * p) + 4 * this.e2 * Math.cos(4 * p) - 6 * this.e3 * Math.cos(6 * p), C = w / this.a, M = (d * (x * C + 1) - C - 0.5 * x * (C * C + g)) / (this.es * Math.sin(2 * p) * (C * C + g - 2 * d * C) / (4 * x) + (d - C) * (x * b - 2 / Math.sin(2 * p)) - b), p -= M, Math.abs(M) <= rt) {
        a = p;
        break;
      }
    x = Math.sqrt(1 - this.es * Math.pow(Math.sin(a), 2)) * Math.tan(a), i = at(this.long0 + Math.asin(h * x / this.a) / Math.sin(a), this.over);
  }
  return n.x = i, n.y = a, n;
}
var VE = ["Polyconic", "American_Polyconic", "poly"];
const ZE = {
  init: WE,
  forward: $E,
  inverse: HE,
  names: VE
};
function KE() {
  this.A = [], this.A[1] = 0.6399175073, this.A[2] = -0.1358797613, this.A[3] = 0.063294409, this.A[4] = -0.02526853, this.A[5] = 0.0117879, this.A[6] = -55161e-7, this.A[7] = 26906e-7, this.A[8] = -1333e-6, this.A[9] = 67e-5, this.A[10] = -34e-5, this.B_re = [], this.B_im = [], this.B_re[1] = 0.7557853228, this.B_im[1] = 0, this.B_re[2] = 0.249204646, this.B_im[2] = 3371507e-9, this.B_re[3] = -1541739e-9, this.B_im[3] = 0.04105856, this.B_re[4] = -0.10162907, this.B_im[4] = 0.01727609, this.B_re[5] = -0.26623489, this.B_im[5] = -0.36249218, this.B_re[6] = -0.6870983, this.B_im[6] = -1.1651967, this.C_re = [], this.C_im = [], this.C_re[1] = 1.3231270439, this.C_im[1] = 0, this.C_re[2] = -0.577245789, this.C_im[2] = -7809598e-9, this.C_re[3] = 0.508307513, this.C_im[3] = -0.112208952, this.C_re[4] = -0.15094762, this.C_im[4] = 0.18200602, this.C_re[5] = 1.01418179, this.C_im[5] = 1.64497696, this.C_re[6] = 1.9660549, this.C_im[6] = 2.5127645, this.D = [], this.D[1] = 1.5627014243, this.D[2] = 0.5185406398, this.D[3] = -0.03333098, this.D[4] = -0.1052906, this.D[5] = -0.0368594, this.D[6] = 7317e-6, this.D[7] = 0.0122, this.D[8] = 394e-5, this.D[9] = -13e-4;
}
function JE(n) {
  var i, a = n.x, h = n.y, f = h - this.lat0, v = a - this.long0, d = f / wa * 1e-5, g = v, p = 1, M = 0;
  for (i = 1; i <= 10; i++)
    p = p * d, M = M + this.A[i] * p;
  var S = M, x = g, w = 1, b = 0, C, G, O = 0, B = 0;
  for (i = 1; i <= 6; i++)
    C = w * S - b * x, G = b * S + w * x, w = C, b = G, O = O + this.B_re[i] * w - this.B_im[i] * b, B = B + this.B_im[i] * w + this.B_re[i] * b;
  return n.x = B * this.a + this.x0, n.y = O * this.a + this.y0, n;
}
function QE(n) {
  var i, a = n.x, h = n.y, f = a - this.x0, v = h - this.y0, d = v / this.a, g = f / this.a, p = 1, M = 0, S, x, w = 0, b = 0;
  for (i = 1; i <= 6; i++)
    S = p * d - M * g, x = M * d + p * g, p = S, M = x, w = w + this.C_re[i] * p - this.C_im[i] * M, b = b + this.C_im[i] * p + this.C_re[i] * M;
  for (var C = 0; C < this.iterations; C++) {
    var G = w, O = b, B, z, Y = d, W = g;
    for (i = 2; i <= 6; i++)
      B = G * w - O * b, z = O * w + G * b, G = B, O = z, Y = Y + (i - 1) * (this.B_re[i] * G - this.B_im[i] * O), W = W + (i - 1) * (this.B_im[i] * G + this.B_re[i] * O);
    G = 1, O = 0;
    var X = this.B_re[1], V = this.B_im[1];
    for (i = 2; i <= 6; i++)
      B = G * w - O * b, z = O * w + G * b, G = B, O = z, X = X + i * (this.B_re[i] * G - this.B_im[i] * O), V = V + i * (this.B_im[i] * G + this.B_re[i] * O);
    var K = X * X + V * V;
    w = (Y * X + W * V) / K, b = (W * X - Y * V) / K;
  }
  var et = w, j = b, vt = 1, _t = 0;
  for (i = 1; i <= 9; i++)
    vt = vt * et, _t = _t + this.D[i] * vt;
  var Mt = this.lat0 + _t * wa * 1e5, kt = this.long0 + j;
  return n.x = kt, n.y = Mt, n;
}
var jE = ["New_Zealand_Map_Grid", "nzmg"];
const tx = {
  init: KE,
  forward: JE,
  inverse: QE,
  names: jE
};
function ex() {
}
function nx(n) {
  var i = n.x, a = n.y, h = at(i - this.long0, this.over), f = this.x0 + this.a * h, v = this.y0 + this.a * Math.log(Math.tan(Math.PI / 4 + a / 2.5)) * 1.25;
  return n.x = f, n.y = v, n;
}
function ix(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i = at(this.long0 + n.x / this.a, this.over), a = 2.5 * (Math.atan(Math.exp(0.8 * n.y / this.a)) - Math.PI / 4);
  return n.x = i, n.y = a, n;
}
var rx = ["Miller_Cylindrical", "mill"];
const sx = {
  init: ex,
  forward: nx,
  inverse: ix,
  names: rx
};
var ax = 20;
function ox() {
  this.sphere ? (this.n = 1, this.m = 0, this.es = 0, this.C_y = Math.sqrt((this.m + 1) / this.n), this.C_x = this.C_y / (this.m + 1)) : this.en = Il(this.es);
}
function ux(n) {
  var i, a, h = n.x, f = n.y;
  if (h = at(h - this.long0, this.over), this.sphere) {
    if (!this.m)
      f = this.n !== 1 ? Math.asin(this.n * Math.sin(f)) : f;
    else
      for (var v = this.n * Math.sin(f), d = ax; d; --d) {
        var g = (this.m * f + Math.sin(f) - v) / (this.m + Math.cos(f));
        if (f -= g, Math.abs(g) < rt)
          break;
      }
    i = this.a * this.C_x * h * (this.m + Math.cos(f)), a = this.a * this.C_y * f;
  } else {
    var p = Math.sin(f), M = Math.cos(f);
    a = this.a * gs(f, p, M, this.en), i = this.a * h * M / Math.sqrt(1 - this.es * p * p);
  }
  return n.x = i, n.y = a, n;
}
function hx(n) {
  var i, a, h, f;
  return n.x -= this.x0, h = n.x / this.a, n.y -= this.y0, i = n.y / this.a, this.sphere ? (i /= this.C_y, h = h / (this.C_x * (this.m + Math.cos(i))), this.m ? i = zi((this.m * i + Math.sin(i)) / this.n) : this.n !== 1 && (i = zi(Math.sin(i) / this.n)), h = at(h + this.long0, this.over), i = Wi(i)) : (i = Nl(n.y / this.a, this.es, this.en), f = Math.abs(i), f < Q ? (f = Math.sin(i), a = this.long0 + n.x * Math.sqrt(1 - this.es * f * f) / (this.a * Math.cos(i)), h = at(a, this.over)) : f - rt < Q && (h = this.long0)), n.x = h, n.y = i, n;
}
var lx = ["Sinusoidal", "sinu"];
const fx = {
  init: ox,
  forward: ux,
  inverse: hx,
  names: lx
};
function cx() {
  this.x0 = this.x0 !== void 0 ? this.x0 : 0, this.y0 = this.y0 !== void 0 ? this.y0 : 0, this.long0 = this.long0 !== void 0 ? this.long0 : 0;
}
function gx(n) {
  for (var i = n.x, a = n.y, h = at(i - this.long0, this.over), f = a, v = Math.PI * Math.sin(a); ; ) {
    var d = -(f + Math.sin(f) - v) / (1 + Math.cos(f));
    if (f += d, Math.abs(d) < rt)
      break;
  }
  f /= 2, Math.PI / 2 - Math.abs(a) < rt && (h = 0);
  var g = 0.900316316158 * this.a * h * Math.cos(f) + this.x0, p = 1.4142135623731 * this.a * Math.sin(f) + this.y0;
  return n.x = g, n.y = p, n;
}
function vx(n) {
  var i, a;
  n.x -= this.x0, n.y -= this.y0, a = n.y / (1.4142135623731 * this.a), Math.abs(a) > 0.999999999999 && (a = 0.999999999999), i = Math.asin(a);
  var h = at(this.long0 + n.x / (0.900316316158 * this.a * Math.cos(i)), this.over);
  h < -Math.PI && (h = -Math.PI), h > Math.PI && (h = Math.PI), a = (2 * i + Math.sin(2 * i)) / Math.PI, Math.abs(a) > 1 && (a = 1);
  var f = Math.asin(a);
  return n.x = h, n.y = f, n;
}
var _x = ["Mollweide", "moll"];
const dx = {
  init: cx,
  forward: gx,
  inverse: vx,
  names: _x
};
function mx() {
  Math.abs(this.lat1 + this.lat2) < rt || (this.lat2 = this.lat2 || this.lat1, this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e = Math.sqrt(this.es), this.e0 = Oa(this.es), this.e1 = Ga(this.es), this.e2 = Da(this.es), this.e3 = Fa(this.es), this.sin_phi = Math.sin(this.lat1), this.cos_phi = Math.cos(this.lat1), this.ms1 = Jn(this.e, this.sin_phi, this.cos_phi), this.ml1 = Fe(this.e0, this.e1, this.e2, this.e3, this.lat1), Math.abs(this.lat1 - this.lat2) < rt ? this.ns = this.sin_phi : (this.sin_phi = Math.sin(this.lat2), this.cos_phi = Math.cos(this.lat2), this.ms2 = Jn(this.e, this.sin_phi, this.cos_phi), this.ml2 = Fe(this.e0, this.e1, this.e2, this.e3, this.lat2), this.ns = (this.ms1 - this.ms2) / (this.ml2 - this.ml1)), this.g = this.ml1 + this.ms1 / this.ns, this.ml0 = Fe(this.e0, this.e1, this.e2, this.e3, this.lat0), this.rh = this.a * (this.g - this.ml0));
}
function yx(n) {
  var i = n.x, a = n.y, h;
  if (this.sphere)
    h = this.a * (this.g - a);
  else {
    var f = Fe(this.e0, this.e1, this.e2, this.e3, a);
    h = this.a * (this.g - f);
  }
  var v = this.ns * at(i - this.long0, this.over), d = this.x0 + h * Math.sin(v), g = this.y0 + this.rh - h * Math.cos(v);
  return n.x = d, n.y = g, n;
}
function px(n) {
  n.x -= this.x0, n.y = this.rh - n.y + this.y0;
  var i, a, h, f;
  this.ns >= 0 ? (a = Math.sqrt(n.x * n.x + n.y * n.y), i = 1) : (a = -Math.sqrt(n.x * n.x + n.y * n.y), i = -1);
  var v = 0;
  if (a !== 0 && (v = Math.atan2(i * n.x, i * n.y)), this.sphere)
    return f = at(this.long0 + v / this.ns, this.over), h = Wi(this.g - a / this.a), n.x = f, n.y = h, n;
  var d = this.g - a / this.a;
  return h = Su(d, this.e0, this.e1, this.e2, this.e3), f = at(this.long0 + v / this.ns, this.over), n.x = f, n.y = h, n;
}
var Ex = ["Equidistant_Conic", "eqdc"];
const xx = {
  init: mx,
  forward: yx,
  inverse: px,
  names: Ex
};
function Mx() {
  this.R = this.a;
}
function wx(n) {
  var i = n.x, a = n.y, h = at(i - this.long0, this.over), f, v;
  Math.abs(a) <= rt && (f = this.x0 + this.R * h, v = this.y0);
  var d = zi(2 * Math.abs(a / Math.PI));
  (Math.abs(h) <= rt || Math.abs(Math.abs(a) - Q) <= rt) && (f = this.x0, a >= 0 ? v = this.y0 + Math.PI * this.R * Math.tan(0.5 * d) : v = this.y0 + Math.PI * this.R * -Math.tan(0.5 * d));
  var g = 0.5 * Math.abs(Math.PI / h - h / Math.PI), p = g * g, M = Math.sin(d), S = Math.cos(d), x = S / (M + S - 1), w = x * x, b = x * (2 / M - 1), C = b * b, G = Math.PI * this.R * (g * (x - C) + Math.sqrt(p * (x - C) * (x - C) - (C + p) * (w - C))) / (C + p);
  h < 0 && (G = -G), f = this.x0 + G;
  var O = p + x;
  return G = Math.PI * this.R * (b * O - g * Math.sqrt((C + p) * (p + 1) - O * O)) / (C + p), a >= 0 ? v = this.y0 + G : v = this.y0 - G, n.x = f, n.y = v, n;
}
function Sx(n) {
  var i, a, h, f, v, d, g, p, M, S, x, w, b;
  return n.x -= this.x0, n.y -= this.y0, x = Math.PI * this.R, h = n.x / x, f = n.y / x, v = h * h + f * f, d = -Math.abs(f) * (1 + v), g = d - 2 * f * f + h * h, p = -2 * d + 1 + 2 * f * f + v * v, b = f * f / p + (2 * g * g * g / p / p / p - 9 * d * g / p / p) / 27, M = (d - g * g / 3 / p) / p, S = 2 * Math.sqrt(-M / 3), x = 3 * b / M / S, Math.abs(x) > 1 && (x >= 0 ? x = 1 : x = -1), w = Math.acos(x) / 3, n.y >= 0 ? a = (-S * Math.cos(w + Math.PI / 3) - g / 3 / p) * Math.PI : a = -(-S * Math.cos(w + Math.PI / 3) - g / 3 / p) * Math.PI, Math.abs(h) < rt ? i = this.long0 : i = at(this.long0 + Math.PI * (v - 1 + Math.sqrt(1 + 2 * (h * h - f * f) + v * v)) / 2 / h, this.over), n.x = i, n.y = a, n;
}
var Ix = ["Van_der_Grinten_I", "VanDerGrinten", "Van_der_Grinten", "vandg"];
const Nx = {
  init: Mx,
  forward: wx,
  inverse: Sx,
  names: Ix
};
function kx(n, i, a, h, f, v) {
  const d = h - i, g = Math.atan((1 - v) * Math.tan(n)), p = Math.atan((1 - v) * Math.tan(a)), M = Math.sin(g), S = Math.cos(g), x = Math.sin(p), w = Math.cos(p);
  let b = d, C, G = 100, O, B, z, Y, W, X, V, K, et, j, vt, _t, Mt, kt;
  do {
    if (O = Math.sin(b), B = Math.cos(b), z = Math.sqrt(
      w * O * (w * O) + (S * x - M * w * B) * (S * x - M * w * B)
    ), z === 0)
      return { azi1: 0, s12: 0 };
    Y = M * x + S * w * B, W = Math.atan2(z, Y), X = S * w * O / z, V = 1 - X * X, K = V !== 0 ? Y - 2 * M * x / V : 0, et = v / 16 * V * (4 + v * (4 - 3 * V)), C = b, b = d + (1 - et) * v * X * (W + et * z * (K + et * Y * (-1 + 2 * K * K)));
  } while (Math.abs(b - C) > 1e-12 && --G > 0);
  return G === 0 ? { azi1: NaN, s12: NaN } : (j = V * (f * f - f * (1 - v) * (f * (1 - v))) / (f * (1 - v) * (f * (1 - v))), vt = 1 + j / 16384 * (4096 + j * (-768 + j * (320 - 175 * j))), _t = j / 1024 * (256 + j * (-128 + j * (74 - 47 * j))), Mt = _t * z * (K + _t / 4 * (Y * (-1 + 2 * K * K) - _t / 6 * K * (-3 + 4 * z * z) * (-3 + 4 * K * K))), kt = f * (1 - v) * vt * (W - Mt), { azi1: Math.atan2(w * O, S * x - M * w * B), s12: kt });
}
function Px(n, i, a, h, f, v) {
  const d = Math.atan((1 - v) * Math.tan(n)), g = Math.sin(d), p = Math.cos(d), M = Math.sin(a), S = Math.cos(a), x = Math.atan2(g, p * S), w = p * M, b = 1 - w * w, C = b * (f * f - f * (1 - v) * (f * (1 - v))) / (f * (1 - v) * (f * (1 - v))), G = 1 + C / 16384 * (4096 + C * (-768 + C * (320 - 175 * C))), O = C / 1024 * (256 + C * (-128 + C * (74 - 47 * C)));
  let B = h / (f * (1 - v) * G), z, Y = 100, W, X, V, K;
  do
    W = Math.cos(2 * x + B), X = Math.sin(B), V = Math.cos(B), K = O * X * (W + O / 4 * (V * (-1 + 2 * W * W) - O / 6 * W * (-3 + 4 * X * X) * (-3 + 4 * W * W))), z = B, B = h / (f * (1 - v) * G) + K;
  while (Math.abs(B - z) > 1e-12 && --Y > 0);
  if (Y === 0)
    return { lat2: NaN, lon2: NaN };
  const et = g * X - p * V * S, j = Math.atan2(
    g * V + p * X * S,
    (1 - v) * Math.sqrt(w * w + et * et)
  ), vt = Math.atan2(
    X * M,
    p * V - g * X * S
  ), _t = v / 16 * b * (4 + v * (4 - 3 * b)), Mt = vt - (1 - _t) * v * w * (B + _t * X * (W + _t * V * (-1 + 2 * W * W))), kt = i + Mt;
  return { lat2: j, lon2: kt };
}
function Cx() {
  this.sin_p12 = Math.sin(this.lat0), this.cos_p12 = Math.cos(this.lat0), this.f = this.es / (1 + Math.sqrt(1 - this.es));
}
function bx(n) {
  var i = n.x, a = n.y, h = Math.sin(n.y), f = Math.cos(n.y), v = at(i - this.long0, this.over), d, g, p, M, S, x, w, b, C, G, O;
  return this.sphere ? Math.abs(this.sin_p12 - 1) <= rt ? (n.x = this.x0 + this.a * (Q - a) * Math.sin(v), n.y = this.y0 - this.a * (Q - a) * Math.cos(v), n) : Math.abs(this.sin_p12 + 1) <= rt ? (n.x = this.x0 + this.a * (Q + a) * Math.sin(v), n.y = this.y0 + this.a * (Q + a) * Math.cos(v), n) : (C = this.sin_p12 * h + this.cos_p12 * f * Math.cos(v), w = Math.acos(C), b = w ? w / Math.sin(w) : 1, n.x = this.x0 + this.a * b * f * Math.sin(v), n.y = this.y0 + this.a * b * (this.cos_p12 * h - this.sin_p12 * f * Math.cos(v)), n) : (d = Oa(this.es), g = Ga(this.es), p = Da(this.es), M = Fa(this.es), Math.abs(this.sin_p12 - 1) <= rt ? (S = this.a * Fe(d, g, p, M, Q), x = this.a * Fe(d, g, p, M, a), n.x = this.x0 + (S - x) * Math.sin(v), n.y = this.y0 - (S - x) * Math.cos(v), n) : Math.abs(this.sin_p12 + 1) <= rt ? (S = this.a * Fe(d, g, p, M, Q), x = this.a * Fe(d, g, p, M, a), n.x = this.x0 + (S + x) * Math.sin(v), n.y = this.y0 + (S + x) * Math.cos(v), n) : Math.abs(i) < rt && Math.abs(a - this.lat0) < rt ? (n.x = n.y = 0, n) : (G = kx(this.lat0, this.long0, a, i, this.a, this.f), O = G.azi1, n.x = G.s12 * Math.sin(O), n.y = G.s12 * Math.cos(O), n));
}
function Rx(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i, a, h, f, v, d, g, p, M, S, x, w, b, C, G, O;
  return this.sphere ? (i = Math.sqrt(n.x * n.x + n.y * n.y), i > 2 * Q * this.a ? void 0 : (a = i / this.a, h = Math.sin(a), f = Math.cos(a), v = this.long0, Math.abs(i) <= rt ? d = this.lat0 : (d = zi(f * this.sin_p12 + n.y * h * this.cos_p12 / i), g = Math.abs(this.lat0) - Q, Math.abs(g) <= rt ? this.lat0 >= 0 ? v = at(this.long0 + Math.atan2(n.x, -n.y), this.over) : v = at(this.long0 - Math.atan2(-n.x, n.y), this.over) : v = at(this.long0 + Math.atan2(n.x * h, i * this.cos_p12 * f - n.y * this.sin_p12 * h), this.over)), n.x = v, n.y = d, n)) : (p = Oa(this.es), M = Ga(this.es), S = Da(this.es), x = Fa(this.es), Math.abs(this.sin_p12 - 1) <= rt ? (w = this.a * Fe(p, M, S, x, Q), i = Math.sqrt(n.x * n.x + n.y * n.y), b = w - i, d = Su(b / this.a, p, M, S, x), v = at(this.long0 + Math.atan2(n.x, -1 * n.y), this.over), n.x = v, n.y = d, n) : Math.abs(this.sin_p12 + 1) <= rt ? (w = this.a * Fe(p, M, S, x, Q), i = Math.sqrt(n.x * n.x + n.y * n.y), b = i - w, d = Su(b / this.a, p, M, S, x), v = at(this.long0 + Math.atan2(n.x, n.y), this.over), n.x = v, n.y = d, n) : (C = Math.atan2(n.x, n.y), G = Math.sqrt(n.x * n.x + n.y * n.y), O = Px(this.lat0, this.long0, C, G, this.a, this.f), n.x = O.lon2, n.y = O.lat2, n));
}
var Tx = ["Azimuthal_Equidistant", "aeqd"];
const Ax = {
  init: Cx,
  forward: bx,
  inverse: Rx,
  names: Tx
};
function Lx() {
  this.sin_p14 = Math.sin(this.lat0), this.cos_p14 = Math.cos(this.lat0);
}
function Ox(n) {
  var i, a, h, f, v, d, g, p, M = n.x, S = n.y;
  return h = at(M - this.long0, this.over), i = Math.sin(S), a = Math.cos(S), f = Math.cos(h), d = this.sin_p14 * i + this.cos_p14 * a * f, v = 1, (d > 0 || Math.abs(d) <= rt) && (g = this.a * v * a * Math.sin(h), p = this.y0 + this.a * v * (this.cos_p14 * i - this.sin_p14 * a * f)), n.x = g, n.y = p, n;
}
function Gx(n) {
  var i, a, h, f, v, d, g;
  return n.x -= this.x0, n.y -= this.y0, i = Math.sqrt(n.x * n.x + n.y * n.y), a = zi(i / this.a), h = Math.sin(a), f = Math.cos(a), d = this.long0, Math.abs(i) <= rt ? (g = this.lat0, n.x = d, n.y = g, n) : (g = zi(f * this.sin_p14 + n.y * h * this.cos_p14 / i), v = Math.abs(this.lat0) - Q, Math.abs(v) <= rt ? (this.lat0 >= 0 ? d = at(this.long0 + Math.atan2(n.x, -n.y), this.over) : d = at(this.long0 - Math.atan2(-n.x, n.y), this.over), n.x = d, n.y = g, n) : (d = at(this.long0 + Math.atan2(n.x * h, i * this.cos_p14 * f - n.y * this.sin_p14 * h), this.over), n.x = d, n.y = g, n));
}
var Dx = ["ortho"];
const Fx = {
  init: Lx,
  forward: Ox,
  inverse: Gx,
  names: Dx
};
var jt = {
  FRONT: 1,
  RIGHT: 2,
  BACK: 3,
  LEFT: 4,
  TOP: 5,
  BOTTOM: 6
}, Yt = {
  AREA_0: 1,
  AREA_1: 2,
  AREA_2: 3,
  AREA_3: 4
};
function qx() {
  this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.lat0 = this.lat0 || 0, this.long0 = this.long0 || 0, this.lat_ts = this.lat_ts || 0, this.title = this.title || "Quadrilateralized Spherical Cube", this.lat0 >= Q - zt / 2 ? this.face = jt.TOP : this.lat0 <= -(Q - zt / 2) ? this.face = jt.BOTTOM : Math.abs(this.long0) <= zt ? this.face = jt.FRONT : Math.abs(this.long0) <= Q + zt ? this.face = this.long0 > 0 ? jt.RIGHT : jt.LEFT : this.face = jt.BACK, this.es !== 0 && (this.one_minus_f = 1 - (this.a - this.b) / this.a, this.one_minus_f_squared = this.one_minus_f * this.one_minus_f);
}
function Bx(n) {
  var i = { x: 0, y: 0 }, a, h, f, v, d, g, p = { value: 0 };
  if (n.x -= this.long0, this.es !== 0 ? a = Math.atan(this.one_minus_f_squared * Math.tan(n.y)) : a = n.y, h = n.x, this.face === jt.TOP)
    v = Q - a, h >= zt && h <= Q + zt ? (p.value = Yt.AREA_0, f = h - Q) : h > Q + zt || h <= -(Q + zt) ? (p.value = Yt.AREA_1, f = h > 0 ? h - ue : h + ue) : h > -(Q + zt) && h <= -zt ? (p.value = Yt.AREA_2, f = h + Q) : (p.value = Yt.AREA_3, f = h);
  else if (this.face === jt.BOTTOM)
    v = Q + a, h >= zt && h <= Q + zt ? (p.value = Yt.AREA_0, f = -h + Q) : h < zt && h >= -zt ? (p.value = Yt.AREA_1, f = -h) : h < -zt && h >= -(Q + zt) ? (p.value = Yt.AREA_2, f = -h - Q) : (p.value = Yt.AREA_3, f = h > 0 ? -h + ue : -h - ue);
  else {
    var M, S, x, w, b, C, G;
    this.face === jt.RIGHT ? h = ss(h, +Q) : this.face === jt.BACK ? h = ss(h, +ue) : this.face === jt.LEFT && (h = ss(h, -Q)), w = Math.sin(a), b = Math.cos(a), C = Math.sin(h), G = Math.cos(h), M = b * G, S = b * C, x = w, this.face === jt.FRONT ? (v = Math.acos(M), f = jo(v, x, S, p)) : this.face === jt.RIGHT ? (v = Math.acos(S), f = jo(v, x, -M, p)) : this.face === jt.BACK ? (v = Math.acos(-M), f = jo(v, x, -S, p)) : this.face === jt.LEFT ? (v = Math.acos(-S), f = jo(v, x, M, p)) : (v = f = 0, p.value = Yt.AREA_0);
  }
  return g = Math.atan(12 / ue * (f + Math.acos(Math.sin(f) * Math.cos(zt)) - Q)), d = Math.sqrt((1 - Math.cos(v)) / (Math.cos(g) * Math.cos(g)) / (1 - Math.cos(Math.atan(1 / Math.cos(f))))), p.value === Yt.AREA_1 ? g += Q : p.value === Yt.AREA_2 ? g += ue : p.value === Yt.AREA_3 && (g += 1.5 * ue), i.x = d * Math.cos(g), i.y = d * Math.sin(g), i.x = i.x * this.a + this.x0, i.y = i.y * this.a + this.y0, n.x = i.x, n.y = i.y, n;
}
function Ux(n) {
  var i = { lam: 0, phi: 0 }, a, h, f, v, d, g, p, M, S, x = { value: 0 };
  if (n.x = (n.x - this.x0) / this.a, n.y = (n.y - this.y0) / this.a, h = Math.atan(Math.sqrt(n.x * n.x + n.y * n.y)), a = Math.atan2(n.y, n.x), n.x >= 0 && n.x >= Math.abs(n.y) ? x.value = Yt.AREA_0 : n.y >= 0 && n.y >= Math.abs(n.x) ? (x.value = Yt.AREA_1, a -= Q) : n.x < 0 && -n.x >= Math.abs(n.y) ? (x.value = Yt.AREA_2, a = a < 0 ? a + ue : a - ue) : (x.value = Yt.AREA_3, a += Q), S = ue / 12 * Math.tan(a), d = Math.sin(S) / (Math.cos(S) - 1 / Math.sqrt(2)), g = Math.atan(d), f = Math.cos(a), v = Math.tan(h), p = 1 - f * f * v * v * (1 - Math.cos(Math.atan(1 / Math.cos(g)))), p < -1 ? p = -1 : p > 1 && (p = 1), this.face === jt.TOP)
    M = Math.acos(p), i.phi = Q - M, x.value === Yt.AREA_0 ? i.lam = g + Q : x.value === Yt.AREA_1 ? i.lam = g < 0 ? g + ue : g - ue : x.value === Yt.AREA_2 ? i.lam = g - Q : i.lam = g;
  else if (this.face === jt.BOTTOM)
    M = Math.acos(p), i.phi = M - Q, x.value === Yt.AREA_0 ? i.lam = -g + Q : x.value === Yt.AREA_1 ? i.lam = -g : x.value === Yt.AREA_2 ? i.lam = -g - Q : i.lam = g < 0 ? -g - ue : -g + ue;
  else {
    var w, b, C;
    w = p, S = w * w, S >= 1 ? C = 0 : C = Math.sqrt(1 - S) * Math.sin(g), S += C * C, S >= 1 ? b = 0 : b = Math.sqrt(1 - S), x.value === Yt.AREA_1 ? (S = b, b = -C, C = S) : x.value === Yt.AREA_2 ? (b = -b, C = -C) : x.value === Yt.AREA_3 && (S = b, b = C, C = -S), this.face === jt.RIGHT ? (S = w, w = -b, b = S) : this.face === jt.BACK ? (w = -w, b = -b) : this.face === jt.LEFT && (S = w, w = b, b = -S), i.phi = Math.acos(-C) - Q, i.lam = Math.atan2(b, w), this.face === jt.RIGHT ? i.lam = ss(i.lam, -Q) : this.face === jt.BACK ? i.lam = ss(i.lam, -ue) : this.face === jt.LEFT && (i.lam = ss(i.lam, +Q));
  }
  if (this.es !== 0) {
    var G, O, B;
    G = i.phi < 0 ? 1 : 0, O = Math.tan(i.phi), B = this.b / Math.sqrt(O * O + this.one_minus_f_squared), i.phi = Math.atan(Math.sqrt(this.a * this.a - B * B) / (this.one_minus_f * B)), G && (i.phi = -i.phi);
  }
  return i.lam += this.long0, n.x = i.lam, n.y = i.phi, n;
}
function jo(n, i, a, h) {
  var f;
  return n < rt ? (h.value = Yt.AREA_0, f = 0) : (f = Math.atan2(i, a), Math.abs(f) <= zt ? h.value = Yt.AREA_0 : f > zt && f <= Q + zt ? (h.value = Yt.AREA_1, f -= Q) : f > Q + zt || f <= -(Q + zt) ? (h.value = Yt.AREA_2, f = f >= 0 ? f - ue : f + ue) : (h.value = Yt.AREA_3, f += Q)), f;
}
function ss(n, i) {
  var a = n + i;
  return a < -ue ? a += Pa : a > +ue && (a -= Pa), a;
}
var zx = ["Quadrilateralized Spherical Cube", "Quadrilateralized_Spherical_Cube", "qsc"];
const Yx = {
  init: qx,
  forward: Bx,
  inverse: Ux,
  names: zx
};
var vl = [
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
], ma = [
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
], $g = 0.8487, Hg = 1.3523, Vg = Vn / 5, Xx = 1 / Vg, ns = 18, Iu = function(n, i) {
  return n[0] + i * (n[1] + i * (n[2] + i * n[3]));
}, Wx = function(n, i) {
  return n[1] + i * (2 * n[2] + i * 3 * n[3]);
};
function $x(n, i, a, h) {
  for (var f = i; h; --h) {
    var v = n(f);
    if (f -= v, Math.abs(v) < a)
      break;
  }
  return f;
}
function Hx() {
  this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.long0 = this.long0 || 0, this.es = 0, this.title = this.title || "Robinson";
}
function Vx(n) {
  var i = at(n.x - this.long0, this.over), a = Math.abs(n.y), h = Math.floor(a * Vg);
  h < 0 ? h = 0 : h >= ns && (h = ns - 1), a = Vn * (a - Xx * h);
  var f = {
    x: Iu(vl[h], a) * i,
    y: Iu(ma[h], a)
  };
  return n.y < 0 && (f.y = -f.y), f.x = f.x * this.a * $g + this.x0, f.y = f.y * this.a * Hg + this.y0, f;
}
function Zx(n) {
  var i = {
    x: (n.x - this.x0) / (this.a * $g),
    y: Math.abs(n.y - this.y0) / (this.a * Hg)
  };
  if (i.y >= 1)
    i.x /= vl[ns][0], i.y = n.y < 0 ? -Q : Q;
  else {
    var a = Math.floor(i.y * ns);
    for (a < 0 ? a = 0 : a >= ns && (a = ns - 1); ; )
      if (ma[a][0] > i.y)
        --a;
      else if (ma[a + 1][0] <= i.y)
        ++a;
      else
        break;
    var h = ma[a], f = 5 * (i.y - h[0]) / (ma[a + 1][0] - h[0]);
    f = $x(function(v) {
      return (Iu(h, v) - i.y) / Wx(h, v);
    }, f, rt, 100), i.x /= Iu(vl[a], f), i.y = (5 * a + f) * me, n.y < 0 && (i.y = -i.y);
  }
  return i.x = at(i.x + this.long0, this.over), i;
}
var Kx = ["Robinson", "robin"];
const Jx = {
  init: Hx,
  forward: Vx,
  inverse: Zx,
  names: Kx
};
function Qx() {
  this.name = "geocent";
}
function jx(n) {
  var i = Og(n, this.es, this.a);
  return i;
}
function tM(n) {
  var i = Gg(n, this.es, this.a, this.b);
  return i;
}
var eM = ["Geocentric", "geocentric", "geocent", "Geocent"];
const nM = {
  init: Qx,
  forward: jx,
  inverse: tM,
  names: eM
};
var Ce = {
  N_POLE: 0,
  S_POLE: 1,
  EQUIT: 2,
  OBLIQ: 3
}, ga = {
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
function iM() {
  if (Object.keys(ga).forEach((function(a) {
    if (typeof this[a] > "u")
      this[a] = ga[a].def;
    else {
      if (ga[a].num && isNaN(this[a]))
        throw new Error("Invalid parameter value, must be numeric " + a + " = " + this[a]);
      ga[a].num && (this[a] = parseFloat(this[a]));
    }
    ga[a].degrees && (this[a] = this[a] * me);
  }).bind(this)), Math.abs(Math.abs(this.lat0) - Q) < rt ? this.mode = this.lat0 < 0 ? Ce.S_POLE : Ce.N_POLE : Math.abs(this.lat0) < rt ? this.mode = Ce.EQUIT : (this.mode = Ce.OBLIQ, this.sinph0 = Math.sin(this.lat0), this.cosph0 = Math.cos(this.lat0)), this.pn1 = this.h / this.a, this.pn1 <= 0 || this.pn1 > 1e10)
    throw new Error("Invalid height");
  this.p = 1 + this.pn1, this.rp = 1 / this.p, this.h1 = 1 / this.pn1, this.pfact = (this.p + 1) * this.h1, this.es = 0;
  var n = this.tilt, i = this.azi;
  this.cg = Math.cos(i), this.sg = Math.sin(i), this.cw = Math.cos(n), this.sw = Math.sin(n);
}
function rM(n) {
  n.x -= this.long0;
  var i = Math.sin(n.y), a = Math.cos(n.y), h = Math.cos(n.x), f, v;
  switch (this.mode) {
    case Ce.OBLIQ:
      v = this.sinph0 * i + this.cosph0 * a * h;
      break;
    case Ce.EQUIT:
      v = a * h;
      break;
    case Ce.S_POLE:
      v = -i;
      break;
    case Ce.N_POLE:
      v = i;
      break;
  }
  switch (v = this.pn1 / (this.p - v), f = v * a * Math.sin(n.x), this.mode) {
    case Ce.OBLIQ:
      v *= this.cosph0 * i - this.sinph0 * a * h;
      break;
    case Ce.EQUIT:
      v *= i;
      break;
    case Ce.N_POLE:
      v *= -(a * h);
      break;
    case Ce.S_POLE:
      v *= a * h;
      break;
  }
  var d, g;
  return d = v * this.cg + f * this.sg, g = 1 / (d * this.sw * this.h1 + this.cw), f = (f * this.cg - v * this.sg) * this.cw * g, v = d * g, n.x = f * this.a, n.y = v * this.a, n;
}
function sM(n) {
  n.x /= this.a, n.y /= this.a;
  var i = { x: n.x, y: n.y }, a, h, f;
  f = 1 / (this.pn1 - n.y * this.sw), a = this.pn1 * n.x * f, h = this.pn1 * n.y * this.cw * f, n.x = a * this.cg + h * this.sg, n.y = h * this.cg - a * this.sg;
  var v = je(n.x, n.y);
  if (Math.abs(v) < rt)
    i.x = 0, i.y = n.y;
  else {
    var d, g;
    switch (g = 1 - v * v * this.pfact, g = (this.p - Math.sqrt(g)) / (this.pn1 / v + v / this.pn1), d = Math.sqrt(1 - g * g), this.mode) {
      case Ce.OBLIQ:
        i.y = Math.asin(d * this.sinph0 + n.y * g * this.cosph0 / v), n.y = (d - this.sinph0 * Math.sin(i.y)) * v, n.x *= g * this.cosph0;
        break;
      case Ce.EQUIT:
        i.y = Math.asin(n.y * g / v), n.y = d * v, n.x *= g;
        break;
      case Ce.N_POLE:
        i.y = Math.asin(d), n.y = -n.y;
        break;
      case Ce.S_POLE:
        i.y = -Math.asin(d);
        break;
    }
    i.x = Math.atan2(n.x, n.y);
  }
  return n.x = i.x + this.long0, n.y = i.y, n;
}
var aM = ["Tilted_Perspective", "tpers"];
const oM = {
  init: iM,
  forward: rM,
  inverse: sM,
  names: aM
};
function uM() {
  if (this.flip_axis = this.sweep === "x" ? 1 : 0, this.h = Number(this.h), this.radius_g_1 = this.h / this.a, this.radius_g_1 <= 0 || this.radius_g_1 > 1e10)
    throw new Error();
  if (this.radius_g = 1 + this.radius_g_1, this.C = this.radius_g * this.radius_g - 1, this.es !== 0) {
    var n = 1 - this.es, i = 1 / n;
    this.radius_p = Math.sqrt(n), this.radius_p2 = n, this.radius_p_inv2 = i, this.shape = "ellipse";
  } else
    this.radius_p = 1, this.radius_p2 = 1, this.radius_p_inv2 = 1, this.shape = "sphere";
  this.title || (this.title = "Geostationary Satellite View");
}
function hM(n) {
  var i = n.x, a = n.y, h, f, v, d;
  if (i = i - this.long0, this.shape === "ellipse") {
    a = Math.atan(this.radius_p2 * Math.tan(a));
    var g = this.radius_p / je(this.radius_p * Math.cos(a), Math.sin(a));
    if (f = g * Math.cos(i) * Math.cos(a), v = g * Math.sin(i) * Math.cos(a), d = g * Math.sin(a), (this.radius_g - f) * f - v * v - d * d * this.radius_p_inv2 < 0)
      return n.x = Number.NaN, n.y = Number.NaN, n;
    h = this.radius_g - f, this.flip_axis ? (n.x = this.radius_g_1 * Math.atan(v / je(d, h)), n.y = this.radius_g_1 * Math.atan(d / h)) : (n.x = this.radius_g_1 * Math.atan(v / h), n.y = this.radius_g_1 * Math.atan(d / je(v, h)));
  } else this.shape === "sphere" && (h = Math.cos(a), f = Math.cos(i) * h, v = Math.sin(i) * h, d = Math.sin(a), h = this.radius_g - f, this.flip_axis ? (n.x = this.radius_g_1 * Math.atan(v / je(d, h)), n.y = this.radius_g_1 * Math.atan(d / h)) : (n.x = this.radius_g_1 * Math.atan(v / h), n.y = this.radius_g_1 * Math.atan(d / je(v, h))));
  return n.x = n.x * this.a, n.y = n.y * this.a, n;
}
function lM(n) {
  var i = -1, a = 0, h = 0, f, v, d, g;
  if (n.x = n.x / this.a, n.y = n.y / this.a, this.shape === "ellipse") {
    this.flip_axis ? (h = Math.tan(n.y / this.radius_g_1), a = Math.tan(n.x / this.radius_g_1) * je(1, h)) : (a = Math.tan(n.x / this.radius_g_1), h = Math.tan(n.y / this.radius_g_1) * je(1, a));
    var p = h / this.radius_p;
    if (f = a * a + p * p + i * i, v = 2 * this.radius_g * i, d = v * v - 4 * f * this.C, d < 0)
      return n.x = Number.NaN, n.y = Number.NaN, n;
    g = (-v - Math.sqrt(d)) / (2 * f), i = this.radius_g + g * i, a *= g, h *= g, n.x = Math.atan2(a, i), n.y = Math.atan(h * Math.cos(n.x) / i), n.y = Math.atan(this.radius_p_inv2 * Math.tan(n.y));
  } else if (this.shape === "sphere") {
    if (this.flip_axis ? (h = Math.tan(n.y / this.radius_g_1), a = Math.tan(n.x / this.radius_g_1) * Math.sqrt(1 + h * h)) : (a = Math.tan(n.x / this.radius_g_1), h = Math.tan(n.y / this.radius_g_1) * Math.sqrt(1 + a * a)), f = a * a + h * h + i * i, v = 2 * this.radius_g * i, d = v * v - 4 * f * this.C, d < 0)
      return n.x = Number.NaN, n.y = Number.NaN, n;
    g = (-v - Math.sqrt(d)) / (2 * f), i = this.radius_g + g * i, a *= g, h *= g, n.x = Math.atan2(a, i), n.y = Math.atan(h * Math.cos(n.x) / i);
  }
  return n.x = n.x + this.long0, n;
}
var fM = ["Geostationary Satellite View", "Geostationary_Satellite", "geos"];
const cM = {
  init: uM,
  forward: hM,
  inverse: lM,
  names: fM
};
var Sa = 1.340264, Ia = -0.081106, Na = 893e-6, ka = 3796e-6, Nu = Math.sqrt(3) / 2;
function gM() {
  this.es = 0, this.long0 = this.long0 !== void 0 ? this.long0 : 0, this.x0 = this.x0 !== void 0 ? this.x0 : 0, this.y0 = this.y0 !== void 0 ? this.y0 : 0;
}
function vM(n) {
  var i = at(n.x - this.long0, this.over), a = n.y, h = Math.asin(Nu * Math.sin(a)), f = h * h, v = f * f * f;
  return n.x = i * Math.cos(h) / (Nu * (Sa + 3 * Ia * f + v * (7 * Na + 9 * ka * f))), n.y = h * (Sa + Ia * f + v * (Na + ka * f)), n.x = this.a * n.x + this.x0, n.y = this.a * n.y + this.y0, n;
}
function _M(n) {
  n.x = (n.x - this.x0) / this.a, n.y = (n.y - this.y0) / this.a;
  var i = 1e-9, a = 12, h = n.y, f, v, d, g, p, M;
  for (M = 0; M < a && (f = h * h, v = f * f * f, d = h * (Sa + Ia * f + v * (Na + ka * f)) - n.y, g = Sa + 3 * Ia * f + v * (7 * Na + 9 * ka * f), h -= p = d / g, !(Math.abs(p) < i)); ++M)
    ;
  return f = h * h, v = f * f * f, n.x = Nu * n.x * (Sa + 3 * Ia * f + v * (7 * Na + 9 * ka * f)) / Math.cos(h), n.y = Math.asin(Math.sin(h) / Nu), n.x = at(n.x + this.long0, this.over), n;
}
var dM = ["eqearth", "Equal Earth", "Equal_Earth"];
const mM = {
  init: gM,
  forward: vM,
  inverse: _M,
  names: dM
};
var Ra = 1e-10;
function yM() {
  var n;
  if (this.phi1 = this.lat1, Math.abs(this.phi1) < Ra)
    throw new Error();
  this.es ? (this.en = Il(this.es), this.m1 = gs(
    this.phi1,
    this.am1 = Math.sin(this.phi1),
    n = Math.cos(this.phi1),
    this.en
  ), this.am1 = n / (Math.sqrt(1 - this.es * this.am1 * this.am1) * this.am1), this.inverse = EM, this.forward = pM) : (Math.abs(this.phi1) + Ra >= Q ? this.cphi1 = 0 : this.cphi1 = 1 / Math.tan(this.phi1), this.inverse = MM, this.forward = xM);
}
function pM(n) {
  var i = at(n.x - (this.long0 || 0), this.over), a = n.y, h, f, v;
  return h = this.am1 + this.m1 - gs(a, f = Math.sin(a), v = Math.cos(a), this.en), f = v * i / (h * Math.sqrt(1 - this.es * f * f)), n.x = h * Math.sin(f), n.y = this.am1 - h * Math.cos(f), n.x = this.a * n.x + (this.x0 || 0), n.y = this.a * n.y + (this.y0 || 0), n;
}
function EM(n) {
  n.x = (n.x - (this.x0 || 0)) / this.a, n.y = (n.y - (this.y0 || 0)) / this.a;
  var i, a, h, f;
  if (a = je(n.x, n.y = this.am1 - n.y), f = Nl(this.am1 + this.m1 - a, this.es, this.en), (i = Math.abs(f)) < Q)
    i = Math.sin(f), h = a * Math.atan2(n.x, n.y) * Math.sqrt(1 - this.es * i * i) / Math.cos(f);
  else if (Math.abs(i - Q) <= Ra)
    h = 0;
  else
    throw new Error();
  return n.x = at(h + (this.long0 || 0), this.over), n.y = Wi(f), n;
}
function xM(n) {
  var i = at(n.x - (this.long0 || 0), this.over), a = n.y, h, f;
  return f = this.cphi1 + this.phi1 - a, Math.abs(f) > Ra ? (n.x = f * Math.sin(h = i * Math.cos(a) / f), n.y = this.cphi1 - f * Math.cos(h)) : n.x = n.y = 0, n.x = this.a * n.x + (this.x0 || 0), n.y = this.a * n.y + (this.y0 || 0), n;
}
function MM(n) {
  n.x = (n.x - (this.x0 || 0)) / this.a, n.y = (n.y - (this.y0 || 0)) / this.a;
  var i, a, h = je(n.x, n.y = this.cphi1 - n.y);
  if (a = this.cphi1 + this.phi1 - h, Math.abs(a) > Q)
    throw new Error();
  return Math.abs(Math.abs(a) - Q) <= Ra ? i = 0 : i = h * Math.atan2(n.x, n.y) / Math.cos(a), n.x = at(i + (this.long0 || 0), this.over), n.y = Wi(a), n;
}
var wM = ["bonne", "Bonne (Werner lat_1=90)"];
const SM = {
  init: yM,
  names: wM
}, Wc = {
  OBLIQUE: {
    forward: CM,
    inverse: RM
  },
  TRANSVERSE: {
    forward: bM,
    inverse: TM
  }
}, ku = {
  ROTATE: {
    o_alpha: "oAlpha",
    o_lon_c: "oLongC",
    o_lat_c: "oLatC"
  },
  NEW_POLE: {
    o_lat_p: "oLatP",
    o_lon_p: "oLongP"
  },
  NEW_EQUATOR: {
    o_lon_1: "oLong1",
    o_lat_1: "oLat1",
    o_lon_2: "oLong2",
    o_lat_2: "oLat2"
  }
};
function IM() {
  if (this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.long0 = this.long0 || 0, this.title = this.title || "General Oblique Transformation", !this.o_proj)
    throw new Error("Missing parameter: o_proj");
  if (this.o_proj === "ob_tran")
    throw new Error("Invalid value for o_proj: " + this.o_proj);
  const n = this.projStr.replace("+proj=ob_tran", "").replace("+o_proj=", "+proj=").trim(), i = Pn(n);
  if (!i)
    throw new Error("Invalid parameter: o_proj. Unknown projection " + this.o_proj);
  i.long0 = 0, this.obliqueProjection = i;
  let a;
  const h = Object.keys(ku), f = (g) => {
    if (typeof this[g] > "u")
      return;
    const p = parseFloat(this[g]) * me;
    if (isNaN(p))
      throw new Error("Invalid value for " + g + ": " + this[g]);
    return p;
  };
  for (let g = 0; g < h.length; g++) {
    const p = h[g], M = ku[p], S = Object.entries(M);
    if (S.some(
      ([w]) => typeof this[w] < "u"
    )) {
      a = M;
      for (let w = 0; w < S.length; w++) {
        const [b, C] = S[w], G = f(b);
        if (typeof G > "u")
          throw new Error("Missing parameter: " + b + ".");
        this[C] = G;
      }
      break;
    }
  }
  if (!a)
    throw new Error("No valid parameters provided for ob_tran projection.");
  const { lamp: v, phip: d } = PM(this, a);
  this.lamp = v, Math.abs(d) > rt ? (this.cphip = Math.cos(d), this.sphip = Math.sin(d), this.projectionType = Wc.OBLIQUE) : this.projectionType = Wc.TRANSVERSE;
}
function NM(n) {
  return this.projectionType.forward(this, n);
}
function kM(n) {
  return this.projectionType.inverse(this, n);
}
function PM(n, i) {
  let a, h;
  if (i === ku.ROTATE) {
    let f = n.oLongC, v = n.oLatC, d = n.oAlpha;
    if (Math.abs(Math.abs(v) - Q) <= rt)
      throw new Error("Invalid value for o_lat_c: " + n.o_lat_c + " should be < 90°");
    h = f + Math.atan2(-1 * Math.cos(d), -1 * Math.sin(d) * Math.sin(v)), a = Math.asin(Math.cos(v) * Math.sin(d));
  } else if (i === ku.NEW_POLE)
    h = n.oLongP, a = n.oLatP;
  else {
    let f = n.oLong1, v = n.oLat1, d = n.oLong2, g = n.oLat2, p = Math.abs(v);
    if (Math.abs(v) > Q - rt)
      throw new Error("Invalid value for o_lat_1: " + n.o_lat_1 + " should be < 90°");
    if (Math.abs(g) > Q - rt)
      throw new Error("Invalid value for o_lat_2: " + n.o_lat_2 + " should be < 90°");
    if (Math.abs(v - g) < rt)
      throw new Error("Invalid value for o_lat_1 and o_lat_2: o_lat_1 should be different from o_lat_2");
    if (p < rt)
      throw new Error("Invalid value for o_lat_1: o_lat_1 should be different from zero");
    h = Math.atan2(
      Math.cos(v) * Math.sin(g) * Math.cos(f) - Math.sin(v) * Math.cos(g) * Math.cos(d),
      Math.sin(v) * Math.cos(g) * Math.sin(d) - Math.cos(v) * Math.sin(g) * Math.sin(f)
    ), a = Math.atan(-1 * Math.cos(h - f) / Math.tan(v));
  }
  return { lamp: h, phip: a };
}
function CM(n, i) {
  let { x: a, y: h } = i;
  a += n.long0;
  const f = Math.cos(a), v = Math.sin(h), d = Math.cos(h);
  return i.x = at(
    Math.atan2(
      d * Math.sin(a),
      n.sphip * d * f + n.cphip * v
    ) + n.lamp
  ), i.y = Math.asin(
    n.sphip * v - n.cphip * d * f
  ), n.obliqueProjection.forward(i);
}
function bM(n, i) {
  let { x: a, y: h } = i;
  a += n.long0;
  const f = Math.cos(h), v = Math.cos(a);
  return i.x = at(
    Math.atan2(
      f * Math.sin(a),
      Math.sin(h)
    ) + n.lamp
  ), i.y = Math.asin(-1 * f * v), n.obliqueProjection.forward(i);
}
function RM(n, i) {
  const a = n.obliqueProjection.inverse(i);
  let { x: h, y: f } = a;
  if (h < Number.MAX_VALUE) {
    h -= n.lamp;
    const v = Math.cos(h), d = Math.sin(f), g = Math.cos(f);
    i.x = Math.atan2(
      g * Math.sin(h),
      n.sphip * g * v - n.cphip * d
    ), i.y = Math.asin(
      n.sphip * d + n.cphip * g * v
    );
  }
  return i.x = at(i.x + n.long0), i;
}
function TM(n, i) {
  const a = n.obliqueProjection.inverse(i);
  let { x: h, y: f } = a;
  if (h < Number.MAX_VALUE) {
    const v = Math.cos(f);
    h -= n.lamp, i.x = Math.atan2(
      v * Math.sin(h),
      -1 * Math.sin(f)
    ), i.y = Math.asin(
      v * Math.cos(h)
    );
  }
  return i.x = at(i.x + n.long0), i;
}
var AM = ["General Oblique Transformation", "General_Oblique_Transformation", "ob_tran"];
const LM = {
  init: IM,
  forward: NM,
  inverse: kM,
  names: AM
};
function OM(n) {
  n.Proj.projections.add(vu), n.Proj.projections.add(_u), n.Proj.projections.add(w2), n.Proj.projections.add(T2), n.Proj.projections.add(D2), n.Proj.projections.add(z2), n.Proj.projections.add(V2), n.Proj.projections.add(j2), n.Proj.projections.add(rE), n.Proj.projections.add(hE), n.Proj.projections.add(ME), n.Proj.projections.add(PE), n.Proj.projections.add(AE), n.Proj.projections.add(qE), n.Proj.projections.add(XE), n.Proj.projections.add(ZE), n.Proj.projections.add(tx), n.Proj.projections.add(sx), n.Proj.projections.add(fx), n.Proj.projections.add(dx), n.Proj.projections.add(xx), n.Proj.projections.add(Nx), n.Proj.projections.add(Ax), n.Proj.projections.add(Fx), n.Proj.projections.add(Yx), n.Proj.projections.add(Jx), n.Proj.projections.add(nM), n.Proj.projections.add(oM), n.Proj.projections.add(cM), n.Proj.projections.add(mM), n.Proj.projections.add(SM), n.Proj.projections.add(LM);
}
const _n = Object.assign(Bp, {
  defaultDatum: "WGS84",
  Proj: Pn,
  WGS84: new Pn("WGS84"),
  Point: os,
  toPoint: Dg,
  defs: Pe,
  nadgrid: Mp,
  transform: wu,
  mgrs: Up,
  version: "__VERSION__"
});
OM(_n);
function Yi(n, i = 0) {
  if (!Tl(n))
    return Number.NaN;
  if (i === 0)
    return Math.round(n);
  const a = Math.pow(10, i);
  return Math.round(n * a) / a;
}
function GM(n, i) {
  if (Array.isArray(i) && i.length > 2) {
    const a = i.map((v) => Math.abs(n - v)), h = a.reduce(
      (v, d) => v > d ? d : v
    ), f = a.indexOf(h);
    return typeof i[f] != "number" || isNaN(i[f]) ? n : i[f];
  }
  return n;
}
function Tl(n) {
  return n != null && !Number.isNaN(Number(n)) && (typeof n != "string" || n.length !== 0);
}
const DM = /\B(?=(\d{3})+(?!\d))/g;
function FM(n, i = "'") {
  const a = ".", h = `${n}`.split(a);
  return typeof h[0] != "string" || h[0].length === 0 ? `${n}` : (h[0] = h[0].replace(DM, i), h.join(a));
}
var De = 63710088e-1, Zg = {
  centimeters: De * 100,
  centimetres: De * 100,
  degrees: 360 / (2 * Math.PI),
  feet: De * 3.28084,
  inches: De * 39.37,
  kilometers: De / 1e3,
  kilometres: De / 1e3,
  meters: De,
  metres: De,
  miles: De / 1609.344,
  millimeters: De * 1e3,
  millimetres: De * 1e3,
  nauticalmiles: De / 1852,
  radians: 1,
  yards: De * 1.0936
};
function Xi(n, i, a = {}) {
  const h = { type: "Feature" };
  return (a.id === 0 || a.id) && (h.id = a.id), a.bbox && (h.bbox = a.bbox), h.properties = i || {}, h.geometry = n, h;
}
function Fi(n, i, a = {}) {
  if (!n)
    throw new Error("coordinates is required");
  if (!Array.isArray(n))
    throw new Error("coordinates must be an Array");
  if (n.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!Hc(n[0]) || !Hc(n[1]))
    throw new Error("coordinates must contain numbers");
  return Xi({
    type: "Point",
    coordinates: n
  }, i, a);
}
function qM(n, i, a = {}) {
  return tn(
    n.map((h) => Fi(h, i)),
    a
  );
}
function BM(n, i, a = {}) {
  for (const f of n) {
    if (f.length < 4)
      throw new Error(
        "Each LinearRing of a Polygon must have 4 or more Positions."
      );
    if (f[f.length - 1].length !== f[0].length)
      throw new Error("First and last Position are not equivalent.");
    for (let v = 0; v < f[f.length - 1].length; v++)
      if (f[f.length - 1][v] !== f[0][v])
        throw new Error("First and last Position are not equivalent.");
  }
  return Xi({
    type: "Polygon",
    coordinates: n
  }, i, a);
}
function Pu(n, i, a = {}) {
  if (n.length < 2)
    throw new Error("coordinates must be an array of two or more positions");
  return Xi({
    type: "LineString",
    coordinates: n
  }, i, a);
}
function tn(n, i = {}) {
  const a = { type: "FeatureCollection" };
  return i.id && (a.id = i.id), i.bbox && (a.bbox = i.bbox), a.features = n, a;
}
function Kg(n, i = "kilometers") {
  const a = Zg[i];
  if (!a)
    throw new Error(i + " units is invalid");
  return n * a;
}
function UM(n, i = "kilometers") {
  const a = Zg[i];
  if (!a)
    throw new Error(i + " units is invalid");
  return n / a;
}
function $c(n) {
  return n % (2 * Math.PI) * 180 / Math.PI;
}
function is(n) {
  return n % 360 * Math.PI / 180;
}
function Hc(n) {
  return !isNaN(n) && n !== null && !Array.isArray(n);
}
function zM(n) {
  return n !== null && typeof n == "object" && !Array.isArray(n);
}
function Zn(n) {
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
function as(n) {
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
function YM(n) {
  return n.type === "Feature" ? n.geometry : n;
}
function Vc(n, i) {
  return n.type === "FeatureCollection" ? "FeatureCollection" : n.type === "GeometryCollection" ? "GeometryCollection" : n.type === "Feature" && n.geometry !== null ? n.geometry.type : n.type;
}
function Hn(n, i, a = {}) {
  var h = Zn(n), f = Zn(i), v = is(f[1] - h[1]), d = is(f[0] - h[0]), g = is(h[1]), p = is(f[1]), M = Math.pow(Math.sin(v / 2), 2) + Math.pow(Math.sin(d / 2), 2) * Math.cos(g) * Math.cos(p);
  return Kg(
    2 * Math.atan2(Math.sqrt(M), Math.sqrt(1 - M)),
    a.units
  );
}
function Al(n, i, a) {
  if (n !== null)
    for (var h, f, v, d, g, p, M, S = 0, x = 0, w, b = n.type, C = b === "FeatureCollection", G = b === "Feature", O = C ? n.features.length : 1, B = 0; B < O; B++) {
      M = C ? n.features[B].geometry : G ? n.geometry : n, w = M ? M.type === "GeometryCollection" : !1, g = w ? M.geometries.length : 1;
      for (var z = 0; z < g; z++) {
        var Y = 0, W = 0;
        if (d = w ? M.geometries[z] : M, d !== null) {
          p = d.coordinates;
          var X = d.type;
          switch (S = 0, X) {
            case null:
              break;
            case "Point":
              if (i(
                p,
                x,
                B,
                Y,
                W
              ) === !1)
                return !1;
              x++, Y++;
              break;
            case "LineString":
            case "MultiPoint":
              for (h = 0; h < p.length; h++) {
                if (i(
                  p[h],
                  x,
                  B,
                  Y,
                  W
                ) === !1)
                  return !1;
                x++, X === "MultiPoint" && Y++;
              }
              X === "LineString" && Y++;
              break;
            case "Polygon":
            case "MultiLineString":
              for (h = 0; h < p.length; h++) {
                for (f = 0; f < p[h].length - S; f++) {
                  if (i(
                    p[h][f],
                    x,
                    B,
                    Y,
                    W
                  ) === !1)
                    return !1;
                  x++;
                }
                X === "MultiLineString" && Y++, X === "Polygon" && W++;
              }
              X === "Polygon" && Y++;
              break;
            case "MultiPolygon":
              for (h = 0; h < p.length; h++) {
                for (W = 0, f = 0; f < p[h].length; f++) {
                  for (v = 0; v < p[h][f].length - S; v++) {
                    if (i(
                      p[h][f][v],
                      x,
                      B,
                      Y,
                      W
                    ) === !1)
                      return !1;
                    x++;
                  }
                  W++;
                }
                Y++;
              }
              break;
            case "GeometryCollection":
              for (h = 0; h < d.geometries.length; h++)
                if (Al(d.geometries[h], i) === !1)
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
function XM(n, i, a) {
  var h = a;
  return us(n, function(f, v) {
    v === 0 && a === void 0 ? h = f : h = i(h, f, v);
  }), h;
}
function Ll(n, i) {
  var a, h, f, v, d, g, p, M, S, x, w = 0, b = n.type === "FeatureCollection", C = n.type === "Feature", G = b ? n.features.length : 1;
  for (a = 0; a < G; a++) {
    for (g = b ? n.features[a].geometry : C ? n.geometry : n, M = b ? n.features[a].properties : C ? n.properties : {}, S = b ? n.features[a].bbox : C ? n.bbox : void 0, x = b ? n.features[a].id : C ? n.id : void 0, p = g ? g.type === "GeometryCollection" : !1, d = p ? g.geometries.length : 1, f = 0; f < d; f++) {
      if (v = p ? g.geometries[f] : g, v === null) {
        if (i(
          null,
          w,
          M,
          S,
          x
        ) === !1)
          return !1;
        continue;
      }
      switch (v.type) {
        case "Point":
        case "LineString":
        case "MultiPoint":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon": {
          if (i(
            v,
            w,
            M,
            S,
            x
          ) === !1)
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (h = 0; h < v.geometries.length; h++)
            if (i(
              v.geometries[h],
              w,
              M,
              S,
              x
            ) === !1)
              return !1;
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    w++;
  }
}
function Ol(n, i) {
  Ll(n, function(a, h, f, v, d) {
    var g = a === null ? null : a.type;
    switch (g) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return i(
          Xi(a, f, { bbox: v, id: d }),
          h,
          0
        ) === !1 ? !1 : void 0;
    }
    var p;
    switch (g) {
      case "MultiPoint":
        p = "Point";
        break;
      case "MultiLineString":
        p = "LineString";
        break;
      case "MultiPolygon":
        p = "Polygon";
        break;
    }
    for (var M = 0; M < a.coordinates.length; M++) {
      var S = a.coordinates[M], x = {
        type: p,
        coordinates: S
      };
      if (i(Xi(x, f), h, M) === !1)
        return !1;
    }
  });
}
function xi(n, i = {}) {
  if (n.bbox != null && i.recompute !== !0)
    return n.bbox;
  const a = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  return Al(n, (h) => {
    a[0] > h[0] && (a[0] = h[0]), a[1] > h[1] && (a[1] = h[1]), a[2] < h[0] && (a[2] = h[0]), a[3] < h[1] && (a[3] = h[1]);
  }), a;
}
function WM(n, i = {}) {
  const a = Number(n[0]), h = Number(n[1]), f = Number(n[2]), v = Number(n[3]);
  if (n.length === 6)
    throw new Error(
      "@turf/bbox-polygon does not support BBox with 6 positions"
    );
  const d = [a, h];
  return BM(
    [[d, [f, h], [f, v], [a, v], d]],
    i.properties,
    { bbox: n, id: i.id }
  );
}
const Mi = 11102230246251565e-32, ke = 134217729, $M = (3 + 8 * Mi) * Mi;
function el(n, i, a, h, f) {
  let v, d, g, p, M = i[0], S = h[0], x = 0, w = 0;
  S > M == S > -M ? (v = M, M = i[++x]) : (v = S, S = h[++w]);
  let b = 0;
  if (x < n && w < a)
    for (S > M == S > -M ? (d = M + v, g = v - (d - M), M = i[++x]) : (d = S + v, g = v - (d - S), S = h[++w]), v = d, g !== 0 && (f[b++] = g); x < n && w < a; )
      S > M == S > -M ? (d = v + M, p = d - v, g = v - (d - p) + (M - p), M = i[++x]) : (d = v + S, p = d - v, g = v - (d - p) + (S - p), S = h[++w]), v = d, g !== 0 && (f[b++] = g);
  for (; x < n; )
    d = v + M, p = d - v, g = v - (d - p) + (M - p), M = i[++x], v = d, g !== 0 && (f[b++] = g);
  for (; w < a; )
    d = v + S, p = d - v, g = v - (d - p) + (S - p), S = h[++w], v = d, g !== 0 && (f[b++] = g);
  return (v !== 0 || b === 0) && (f[b++] = v), b;
}
function HM(n, i) {
  let a = i[0];
  for (let h = 1; h < n; h++) a += i[h];
  return a;
}
function qa(n) {
  return new Float64Array(n);
}
const VM = (3 + 16 * Mi) * Mi, ZM = (2 + 12 * Mi) * Mi, KM = (9 + 64 * Mi) * Mi * Mi, Zr = qa(4), Zc = qa(8), Kc = qa(12), Jc = qa(16), Ge = qa(4);
function JM(n, i, a, h, f, v, d) {
  let g, p, M, S, x, w, b, C, G, O, B, z, Y, W, X, V, K, et;
  const j = n - f, vt = a - f, _t = i - v, Mt = h - v;
  W = j * Mt, w = ke * j, b = w - (w - j), C = j - b, w = ke * Mt, G = w - (w - Mt), O = Mt - G, X = C * O - (W - b * G - C * G - b * O), V = _t * vt, w = ke * _t, b = w - (w - _t), C = _t - b, w = ke * vt, G = w - (w - vt), O = vt - G, K = C * O - (V - b * G - C * G - b * O), B = X - K, x = X - B, Zr[0] = X - (B + x) + (x - K), z = W + B, x = z - W, Y = W - (z - x) + (B - x), B = Y - V, x = Y - B, Zr[1] = Y - (B + x) + (x - V), et = z + B, x = et - z, Zr[2] = z - (et - x) + (B - x), Zr[3] = et;
  let kt = HM(4, Zr), it = ZM * d;
  if (kt >= it || -kt >= it || (x = n - j, g = n - (j + x) + (x - f), x = a - vt, M = a - (vt + x) + (x - f), x = i - _t, p = i - (_t + x) + (x - v), x = h - Mt, S = h - (Mt + x) + (x - v), g === 0 && p === 0 && M === 0 && S === 0) || (it = KM * d + $M * Math.abs(kt), kt += j * S + Mt * g - (_t * M + vt * p), kt >= it || -kt >= it)) return kt;
  W = g * Mt, w = ke * g, b = w - (w - g), C = g - b, w = ke * Mt, G = w - (w - Mt), O = Mt - G, X = C * O - (W - b * G - C * G - b * O), V = p * vt, w = ke * p, b = w - (w - p), C = p - b, w = ke * vt, G = w - (w - vt), O = vt - G, K = C * O - (V - b * G - C * G - b * O), B = X - K, x = X - B, Ge[0] = X - (B + x) + (x - K), z = W + B, x = z - W, Y = W - (z - x) + (B - x), B = Y - V, x = Y - B, Ge[1] = Y - (B + x) + (x - V), et = z + B, x = et - z, Ge[2] = z - (et - x) + (B - x), Ge[3] = et;
  const St = el(4, Zr, 4, Ge, Zc);
  W = j * S, w = ke * j, b = w - (w - j), C = j - b, w = ke * S, G = w - (w - S), O = S - G, X = C * O - (W - b * G - C * G - b * O), V = _t * M, w = ke * _t, b = w - (w - _t), C = _t - b, w = ke * M, G = w - (w - M), O = M - G, K = C * O - (V - b * G - C * G - b * O), B = X - K, x = X - B, Ge[0] = X - (B + x) + (x - K), z = W + B, x = z - W, Y = W - (z - x) + (B - x), B = Y - V, x = Y - B, Ge[1] = Y - (B + x) + (x - V), et = z + B, x = et - z, Ge[2] = z - (et - x) + (B - x), Ge[3] = et;
  const Gt = el(St, Zc, 4, Ge, Kc);
  W = g * S, w = ke * g, b = w - (w - g), C = g - b, w = ke * S, G = w - (w - S), O = S - G, X = C * O - (W - b * G - C * G - b * O), V = p * M, w = ke * p, b = w - (w - p), C = p - b, w = ke * M, G = w - (w - M), O = M - G, K = C * O - (V - b * G - C * G - b * O), B = X - K, x = X - B, Ge[0] = X - (B + x) + (x - K), z = W + B, x = z - W, Y = W - (z - x) + (B - x), B = Y - V, x = Y - B, Ge[1] = Y - (B + x) + (x - V), et = z + B, x = et - z, Ge[2] = z - (et - x) + (B - x), Ge[3] = et;
  const Dt = el(Gt, Kc, 4, Ge, Jc);
  return Jc[Dt - 1];
}
function QM(n, i, a, h, f, v) {
  const d = (i - v) * (a - f), g = (n - f) * (h - v), p = d - g, M = Math.abs(d + g);
  return Math.abs(p) >= VM * M ? p : -JM(n, i, a, h, f, v, M);
}
function jM(n, i) {
  var a, h, f = 0, v, d, g, p, M, S, x, w = n[0], b = n[1], C = i.length;
  for (a = 0; a < C; a++) {
    h = 0;
    var G = i[a], O = G.length - 1;
    if (S = G[0], S[0] !== G[O][0] && S[1] !== G[O][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (d = S[0] - w, g = S[1] - b, h; h < O; h++) {
      if (x = G[h + 1], p = x[0] - w, M = x[1] - b, g === 0 && M === 0) {
        if (p <= 0 && d >= 0 || d <= 0 && p >= 0)
          return 0;
      } else if (M >= 0 && g <= 0 || M <= 0 && g >= 0) {
        if (v = QM(d, p, g, M, 0, 0), v === 0)
          return 0;
        (v > 0 && M > 0 && g <= 0 || v < 0 && M <= 0 && g > 0) && f++;
      }
      S = x, g = M, d = p;
    }
  }
  return f % 2 !== 0;
}
function t4(n, i, a = {}) {
  if (!n)
    throw new Error("point is required");
  if (!i)
    throw new Error("polygon is required");
  const h = Zn(n), f = YM(i), v = f.type, d = i.bbox;
  let g = f.coordinates;
  if (d && e4(h, d) === !1)
    return !1;
  v === "Polygon" && (g = [g]);
  let p = !1;
  for (var M = 0; M < g.length; ++M) {
    const S = jM(h, g[M]);
    if (S === 0) return !a.ignoreBoundary;
    S && (p = !0);
  }
  return p;
}
function e4(n, i) {
  return i[0] <= n[0] && i[1] <= n[1] && i[2] >= n[0] && i[3] >= n[1];
}
class Jg {
  constructor(i = [], a = n4) {
    if (this.data = i, this.length = this.data.length, this.compare = a, this.length > 0)
      for (let h = (this.length >> 1) - 1; h >= 0; h--) this._down(h);
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
    const { data: a, compare: h } = this, f = a[i];
    for (; i > 0; ) {
      const v = i - 1 >> 1, d = a[v];
      if (h(f, d) >= 0) break;
      a[i] = d, i = v;
    }
    a[i] = f;
  }
  _down(i) {
    const { data: a, compare: h } = this, f = this.length >> 1, v = a[i];
    for (; i < f; ) {
      let d = (i << 1) + 1, g = a[d];
      const p = d + 1;
      if (p < this.length && h(a[p], g) < 0 && (d = p, g = a[p]), h(g, v) >= 0) break;
      a[i] = g, i = d;
    }
    a[i] = v;
  }
}
function n4(n, i) {
  return n < i ? -1 : n > i ? 1 : 0;
}
function Qg(n, i) {
  return n.p.x > i.p.x ? 1 : n.p.x < i.p.x ? -1 : n.p.y !== i.p.y ? n.p.y > i.p.y ? 1 : -1 : 1;
}
function i4(n, i) {
  return n.rightSweepEvent.p.x > i.rightSweepEvent.p.x ? 1 : n.rightSweepEvent.p.x < i.rightSweepEvent.p.x ? -1 : n.rightSweepEvent.p.y !== i.rightSweepEvent.p.y ? n.rightSweepEvent.p.y < i.rightSweepEvent.p.y ? 1 : -1 : 1;
}
class Qc {
  constructor(i, a, h, f) {
    this.p = {
      x: i[0],
      y: i[1]
    }, this.featureId = a, this.ringId = h, this.eventId = f, this.otherEvent = null, this.isLeftEndpoint = null;
  }
  isSamePoint(i) {
    return this.p.x === i.p.x && this.p.y === i.p.y;
  }
}
function r4(n, i) {
  if (n.type === "FeatureCollection") {
    const a = n.features;
    for (let h = 0; h < a.length; h++)
      jc(a[h], i);
  } else
    jc(n, i);
}
let tu = 0, eu = 0, nu = 0;
function jc(n, i) {
  const a = n.type === "Feature" ? n.geometry : n;
  let h = a.coordinates;
  (a.type === "Polygon" || a.type === "MultiLineString") && (h = [h]), a.type === "LineString" && (h = [[h]]);
  for (let f = 0; f < h.length; f++)
    for (let v = 0; v < h[f].length; v++) {
      let d = h[f][v][0], g = null;
      eu = eu + 1;
      for (let p = 0; p < h[f][v].length - 1; p++) {
        g = h[f][v][p + 1];
        const M = new Qc(d, tu, eu, nu), S = new Qc(g, tu, eu, nu + 1);
        M.otherEvent = S, S.otherEvent = M, Qg(M, S) > 0 ? (S.isLeftEndpoint = !0, M.isLeftEndpoint = !1) : (M.isLeftEndpoint = !0, S.isLeftEndpoint = !1), i.push(M), i.push(S), d = g, nu = nu + 1;
      }
    }
  tu = tu + 1;
}
class s4 {
  constructor(i) {
    this.leftSweepEvent = i, this.rightSweepEvent = i.otherEvent;
  }
}
function a4(n, i) {
  if (n === null || i === null || n.leftSweepEvent.ringId === i.leftSweepEvent.ringId && (n.rightSweepEvent.isSamePoint(i.leftSweepEvent) || n.rightSweepEvent.isSamePoint(i.leftSweepEvent) || n.rightSweepEvent.isSamePoint(i.rightSweepEvent) || n.leftSweepEvent.isSamePoint(i.leftSweepEvent) || n.leftSweepEvent.isSamePoint(i.rightSweepEvent))) return !1;
  const a = n.leftSweepEvent.p.x, h = n.leftSweepEvent.p.y, f = n.rightSweepEvent.p.x, v = n.rightSweepEvent.p.y, d = i.leftSweepEvent.p.x, g = i.leftSweepEvent.p.y, p = i.rightSweepEvent.p.x, M = i.rightSweepEvent.p.y, S = (M - g) * (f - a) - (p - d) * (v - h), x = (p - d) * (h - g) - (M - g) * (a - d), w = (f - a) * (h - g) - (v - h) * (a - d);
  if (S === 0)
    return !1;
  const b = x / S, C = w / S;
  if (b >= 0 && b <= 1 && C >= 0 && C <= 1) {
    const G = a + b * (f - a), O = h + b * (v - h);
    return [G, O];
  }
  return !1;
}
function o4(n, i) {
  i = i || !1;
  const a = [], h = new Jg([], i4);
  for (; n.length; ) {
    const f = n.pop();
    if (f.isLeftEndpoint) {
      const v = new s4(f);
      for (let d = 0; d < h.data.length; d++) {
        const g = h.data[d];
        if (i && g.leftSweepEvent.featureId === f.featureId)
          continue;
        const p = a4(v, g);
        p !== !1 && a.push(p);
      }
      h.push(v);
    } else f.isLeftEndpoint === !1 && h.pop();
  }
  return a;
}
function u4(n, i) {
  const a = new Jg([], Qg);
  return r4(n, a), o4(a, i);
}
var h4 = u4;
function l4(n, i, a = {}) {
  const { removeDuplicates: h = !0, ignoreSelfIntersections: f = !0 } = a;
  let v = [];
  n.type === "FeatureCollection" ? v = v.concat(n.features) : n.type === "Feature" ? v.push(n) : (n.type === "LineString" || n.type === "Polygon" || n.type === "MultiLineString" || n.type === "MultiPolygon") && v.push(Xi(n)), i.type === "FeatureCollection" ? v = v.concat(i.features) : i.type === "Feature" ? v.push(i) : (i.type === "LineString" || i.type === "Polygon" || i.type === "MultiLineString" || i.type === "MultiPolygon") && v.push(Xi(i));
  const d = h4(
    tn(v),
    f
  );
  let g = [];
  if (h) {
    const p = {};
    d.forEach((M) => {
      const S = M.join(",");
      p[S] || (p[S] = !0, g.push(M));
    });
  } else
    g = d;
  return tn(g.map((p) => Fi(p)));
}
function f4(n, i, a, h, f) {
  jg(n, i, a || 0, h || n.length - 1, f || c4);
}
function jg(n, i, a, h, f) {
  for (; h > a; ) {
    if (h - a > 600) {
      var v = h - a + 1, d = i - a + 1, g = Math.log(v), p = 0.5 * Math.exp(2 * g / 3), M = 0.5 * Math.sqrt(g * p * (v - p) / v) * (d - v / 2 < 0 ? -1 : 1), S = Math.max(a, Math.floor(i - d * p / v + M)), x = Math.min(h, Math.floor(i + (v - d) * p / v + M));
      jg(n, i, S, x, f);
    }
    var w = n[i], b = a, C = h;
    for (va(n, a, i), f(n[h], w) > 0 && va(n, a, h); b < C; ) {
      for (va(n, b, C), b++, C--; f(n[b], w) < 0; ) b++;
      for (; f(n[C], w) > 0; ) C--;
    }
    f(n[a], w) === 0 ? va(n, a, C) : (C++, va(n, C, h)), C <= i && (a = C + 1), i <= C && (h = C - 1);
  }
}
function va(n, i, a) {
  var h = n[i];
  n[i] = n[a], n[a] = h;
}
function c4(n, i) {
  return n < i ? -1 : n > i ? 1 : 0;
}
class Wn {
  constructor(i = 9) {
    this._maxEntries = Math.max(4, i), this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4)), this.clear();
  }
  all() {
    return this._all(this.data, []);
  }
  search(i) {
    let a = this.data;
    const h = [];
    if (!ru(i, a)) return h;
    const f = this.toBBox, v = [];
    for (; a; ) {
      for (let d = 0; d < a.children.length; d++) {
        const g = a.children[d], p = a.leaf ? f(g) : g;
        ru(i, p) && (a.leaf ? h.push(g) : il(i, p) ? this._all(g, h) : v.push(g));
      }
      a = v.pop();
    }
    return h;
  }
  collides(i) {
    let a = this.data;
    if (!ru(i, a)) return !1;
    const h = [];
    for (; a; ) {
      for (let f = 0; f < a.children.length; f++) {
        const v = a.children[f], d = a.leaf ? this.toBBox(v) : v;
        if (ru(i, d)) {
          if (a.leaf || il(i, d)) return !0;
          h.push(v);
        }
      }
      a = h.pop();
    }
    return !1;
  }
  load(i) {
    if (!(i && i.length)) return this;
    if (i.length < this._minEntries) {
      for (let h = 0; h < i.length; h++)
        this.insert(i[h]);
      return this;
    }
    let a = this._build(i.slice(), 0, i.length - 1, 0);
    if (!this.data.children.length)
      this.data = a;
    else if (this.data.height === a.height)
      this._splitRoot(this.data, a);
    else {
      if (this.data.height < a.height) {
        const h = this.data;
        this.data = a, a = h;
      }
      this._insert(a, this.data.height - a.height - 1, !0);
    }
    return this;
  }
  insert(i) {
    return i && this._insert(i, this.data.height - 1), this;
  }
  clear() {
    return this.data = Qr([]), this;
  }
  remove(i, a) {
    if (!i) return this;
    let h = this.data;
    const f = this.toBBox(i), v = [], d = [];
    let g, p, M;
    for (; h || v.length; ) {
      if (h || (h = v.pop(), p = v[v.length - 1], g = d.pop(), M = !0), h.leaf) {
        const S = g4(i, h.children, a);
        if (S !== -1)
          return h.children.splice(S, 1), v.push(h), this._condense(v), this;
      }
      !M && !h.leaf && il(h, f) ? (v.push(h), d.push(g), g = 0, p = h, h = h.children[0]) : p ? (g++, h = p.children[g], M = !1) : h = null;
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
    const h = [];
    for (; i; )
      i.leaf ? a.push(...i.children) : h.push(...i.children), i = h.pop();
    return a;
  }
  _build(i, a, h, f) {
    const v = h - a + 1;
    let d = this._maxEntries, g;
    if (v <= d)
      return g = Qr(i.slice(a, h + 1)), Kr(g, this.toBBox), g;
    f || (f = Math.ceil(Math.log(v) / Math.log(d)), d = Math.ceil(v / Math.pow(d, f - 1))), g = Qr([]), g.leaf = !1, g.height = f;
    const p = Math.ceil(v / d), M = p * Math.ceil(Math.sqrt(d));
    tg(i, a, h, M, this.compareMinX);
    for (let S = a; S <= h; S += M) {
      const x = Math.min(S + M - 1, h);
      tg(i, S, x, p, this.compareMinY);
      for (let w = S; w <= x; w += p) {
        const b = Math.min(w + p - 1, x);
        g.children.push(this._build(i, w, b, f - 1));
      }
    }
    return Kr(g, this.toBBox), g;
  }
  _chooseSubtree(i, a, h, f) {
    for (; f.push(a), !(a.leaf || f.length - 1 === h); ) {
      let v = 1 / 0, d = 1 / 0, g;
      for (let p = 0; p < a.children.length; p++) {
        const M = a.children[p], S = nl(M), x = d4(i, M) - S;
        x < d ? (d = x, v = S < v ? S : v, g = M) : x === d && S < v && (v = S, g = M);
      }
      a = g || a.children[0];
    }
    return a;
  }
  _insert(i, a, h) {
    const f = h ? i : this.toBBox(i), v = [], d = this._chooseSubtree(f, this.data, a, v);
    for (d.children.push(i), pa(d, f); a >= 0 && v[a].children.length > this._maxEntries; )
      this._split(v, a), a--;
    this._adjustParentBBoxes(f, v, a);
  }
  // split overflowed node into two
  _split(i, a) {
    const h = i[a], f = h.children.length, v = this._minEntries;
    this._chooseSplitAxis(h, v, f);
    const d = this._chooseSplitIndex(h, v, f), g = Qr(h.children.splice(d, h.children.length - d));
    g.height = h.height, g.leaf = h.leaf, Kr(h, this.toBBox), Kr(g, this.toBBox), a ? i[a - 1].children.push(g) : this._splitRoot(h, g);
  }
  _splitRoot(i, a) {
    this.data = Qr([i, a]), this.data.height = i.height + 1, this.data.leaf = !1, Kr(this.data, this.toBBox);
  }
  _chooseSplitIndex(i, a, h) {
    let f, v = 1 / 0, d = 1 / 0;
    for (let g = a; g <= h - a; g++) {
      const p = ya(i, 0, g, this.toBBox), M = ya(i, g, h, this.toBBox), S = m4(p, M), x = nl(p) + nl(M);
      S < v ? (v = S, f = g, d = x < d ? x : d) : S === v && x < d && (d = x, f = g);
    }
    return f || h - a;
  }
  // sorts node children by the best axis for split
  _chooseSplitAxis(i, a, h) {
    const f = i.leaf ? this.compareMinX : v4, v = i.leaf ? this.compareMinY : _4, d = this._allDistMargin(i, a, h, f), g = this._allDistMargin(i, a, h, v);
    d < g && i.children.sort(f);
  }
  // total margin of all possible split distributions where each node is at least m full
  _allDistMargin(i, a, h, f) {
    i.children.sort(f);
    const v = this.toBBox, d = ya(i, 0, a, v), g = ya(i, h - a, h, v);
    let p = iu(d) + iu(g);
    for (let M = a; M < h - a; M++) {
      const S = i.children[M];
      pa(d, i.leaf ? v(S) : S), p += iu(d);
    }
    for (let M = h - a - 1; M >= a; M--) {
      const S = i.children[M];
      pa(g, i.leaf ? v(S) : S), p += iu(g);
    }
    return p;
  }
  _adjustParentBBoxes(i, a, h) {
    for (let f = h; f >= 0; f--)
      pa(a[f], i);
  }
  _condense(i) {
    for (let a = i.length - 1, h; a >= 0; a--)
      i[a].children.length === 0 ? a > 0 ? (h = i[a - 1].children, h.splice(h.indexOf(i[a]), 1)) : this.clear() : Kr(i[a], this.toBBox);
  }
}
function g4(n, i, a) {
  if (!a) return i.indexOf(n);
  for (let h = 0; h < i.length; h++)
    if (a(n, i[h])) return h;
  return -1;
}
function Kr(n, i) {
  ya(n, 0, n.children.length, i, n);
}
function ya(n, i, a, h, f) {
  f || (f = Qr(null)), f.minX = 1 / 0, f.minY = 1 / 0, f.maxX = -1 / 0, f.maxY = -1 / 0;
  for (let v = i; v < a; v++) {
    const d = n.children[v];
    pa(f, n.leaf ? h(d) : d);
  }
  return f;
}
function pa(n, i) {
  return n.minX = Math.min(n.minX, i.minX), n.minY = Math.min(n.minY, i.minY), n.maxX = Math.max(n.maxX, i.maxX), n.maxY = Math.max(n.maxY, i.maxY), n;
}
function v4(n, i) {
  return n.minX - i.minX;
}
function _4(n, i) {
  return n.minY - i.minY;
}
function nl(n) {
  return (n.maxX - n.minX) * (n.maxY - n.minY);
}
function iu(n) {
  return n.maxX - n.minX + (n.maxY - n.minY);
}
function d4(n, i) {
  return (Math.max(i.maxX, n.maxX) - Math.min(i.minX, n.minX)) * (Math.max(i.maxY, n.maxY) - Math.min(i.minY, n.minY));
}
function m4(n, i) {
  const a = Math.max(n.minX, i.minX), h = Math.max(n.minY, i.minY), f = Math.min(n.maxX, i.maxX), v = Math.min(n.maxY, i.maxY);
  return Math.max(0, f - a) * Math.max(0, v - h);
}
function il(n, i) {
  return n.minX <= i.minX && n.minY <= i.minY && i.maxX <= n.maxX && i.maxY <= n.maxY;
}
function ru(n, i) {
  return i.minX <= n.maxX && i.minY <= n.maxY && i.maxX >= n.minX && i.maxY >= n.minY;
}
function Qr(n) {
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
function tg(n, i, a, h, f) {
  const v = [i, a];
  for (; v.length; ) {
    if (a = v.pop(), i = v.pop(), a - i <= h) continue;
    const d = i + Math.ceil((a - i) / h / 2) * h;
    f4(n, d, i, a, f), v.push(i, d, d, a);
  }
}
function t0(n) {
  var i = new Wn(n);
  return i.insert = function(a) {
    if (a.type !== "Feature") throw new Error("invalid feature");
    return a.bbox = a.bbox ? a.bbox : xi(a), Wn.prototype.insert.call(this, a);
  }, i.load = function(a) {
    var h = [];
    return Array.isArray(a) ? a.forEach(function(f) {
      if (f.type !== "Feature") throw new Error("invalid features");
      f.bbox = f.bbox ? f.bbox : xi(f), h.push(f);
    }) : us(a, function(f) {
      if (f.type !== "Feature") throw new Error("invalid features");
      f.bbox = f.bbox ? f.bbox : xi(f), h.push(f);
    }), Wn.prototype.load.call(this, h);
  }, i.remove = function(a, h) {
    if (a.type !== "Feature") throw new Error("invalid feature");
    return a.bbox = a.bbox ? a.bbox : xi(a), Wn.prototype.remove.call(this, a, h);
  }, i.clear = function() {
    return Wn.prototype.clear.call(this);
  }, i.search = function(a) {
    var h = Wn.prototype.search.call(this, this.toBBox(a));
    return tn(h);
  }, i.collides = function(a) {
    return Wn.prototype.collides.call(this, this.toBBox(a));
  }, i.all = function() {
    var a = Wn.prototype.all.call(this);
    return tn(a);
  }, i.toJSON = function() {
    return Wn.prototype.toJSON.call(this);
  }, i.fromJSON = function(a) {
    return Wn.prototype.fromJSON.call(this, a);
  }, i.toBBox = function(a) {
    var h;
    if (a.bbox) h = a.bbox;
    else if (Array.isArray(a) && a.length === 4) h = a;
    else if (Array.isArray(a) && a.length === 6)
      h = [a[0], a[1], a[3], a[4]];
    else if (a.type === "Feature") h = xi(a);
    else if (a.type === "FeatureCollection") h = xi(a);
    else throw new Error("invalid geojson");
    return {
      minX: h[0],
      minY: h[1],
      maxX: h[2],
      maxY: h[3]
    };
  }, i;
}
function y4(n) {
  if (!n)
    throw new Error("geojson is required");
  const i = [];
  return Ol(n, (a) => {
    p4(a, i);
  }), tn(i);
}
function p4(n, i) {
  let a = [];
  const h = n.geometry;
  if (h !== null) {
    switch (h.type) {
      case "Polygon":
        a = as(h);
        break;
      case "LineString":
        a = [as(h)];
    }
    a.forEach((f) => {
      E4(f, n.properties).forEach((d) => {
        d.id = i.length, i.push(d);
      });
    });
  }
}
function E4(n, i) {
  const a = [];
  return n.reduce((h, f) => {
    const v = Pu([h, f], i);
    return v.bbox = x4(h, f), a.push(v), f;
  }), a;
}
function x4(n, i) {
  const a = n[0], h = n[1], f = i[0], v = i[1], d = a < f ? a : f, g = h < v ? h : v, p = a > f ? a : f, M = h > v ? h : v;
  return [d, g, p, M];
}
var M4 = Object.defineProperty, w4 = Object.defineProperties, S4 = Object.getOwnPropertyDescriptors, eg = Object.getOwnPropertySymbols, I4 = Object.prototype.hasOwnProperty, N4 = Object.prototype.propertyIsEnumerable, ng = (n, i, a) => i in n ? M4(n, i, { enumerable: !0, configurable: !0, writable: !0, value: a }) : n[i] = a, ig = (n, i) => {
  for (var a in i || (i = {}))
    I4.call(i, a) && ng(n, a, i[a]);
  if (eg)
    for (var a of eg(i))
      N4.call(i, a) && ng(n, a, i[a]);
  return n;
}, rg = (n, i) => w4(n, S4(i));
function k4(n, i, a = {}) {
  if (!n || !i)
    throw new Error("lines and pt are required arguments");
  const h = Zn(i);
  let f = Fi([1 / 0, 1 / 0], {
    dist: 1 / 0,
    index: -1,
    multiFeatureIndex: -1,
    location: -1
  }), v = 0;
  return Ol(
    n,
    function(d, g, p) {
      const M = as(d);
      for (let S = 0; S < M.length - 1; S++) {
        const x = Fi(M[S]);
        x.properties.dist = Hn(i, x, a);
        const w = Zn(x), b = Fi(M[S + 1]);
        b.properties.dist = Hn(i, b, a);
        const C = Zn(b), G = Hn(x, b, a);
        let O, B;
        w[0] === h[0] && w[1] === h[1] ? [O, , B] = [w, void 0, !1] : C[0] === h[0] && C[1] === h[1] ? [O, , B] = [C, void 0, !0] : [O, , B] = b4(
          x.geometry.coordinates,
          b.geometry.coordinates,
          Zn(i)
        );
        let z;
        O && (z = Fi(O, {
          dist: Hn(i, O, a),
          multiFeatureIndex: p,
          location: v + Hn(x, O, a)
        })), z && z.properties.dist < f.properties.dist && (f = rg(ig({}, z), {
          properties: rg(ig({}, z.properties), {
            // Legacy behaviour where index progresses to next segment # if we
            // went with the end point this iteration.
            index: B ? S + 1 : S
          })
        })), v += G;
      }
    }
  ), f;
}
function P4(n, i) {
  const [a, h, f] = n, [v, d, g] = i;
  return a * v + h * d + f * g;
}
function C4(n, i) {
  const [a, h, f] = n, [v, d, g] = i;
  return [h * g - f * d, f * v - a * g, a * d - h * v];
}
function sg(n) {
  return Math.sqrt(Math.pow(n[0], 2) + Math.pow(n[1], 2) + Math.pow(n[2], 2));
}
function _r(n, i) {
  const a = P4(n, i) / (sg(n) * sg(i));
  return Math.acos(Math.min(Math.max(a, -1), 1));
}
function rl(n) {
  const i = is(n[1]), a = is(n[0]);
  return [
    Math.cos(i) * Math.cos(a),
    Math.cos(i) * Math.sin(a),
    Math.sin(i)
  ];
}
function dr(n) {
  const [i, a, h] = n, f = $c(Math.asin(h));
  return [$c(Math.atan2(a, i)), f];
}
function b4(n, i, a) {
  const h = rl(n), f = rl(i), v = rl(a), [d, g, p] = v, [M, S, x] = C4(h, f), w = S * p - x * g, b = x * d - M * p, C = M * g - S * d, G = C * S - b * x, O = w * x - C * M, B = b * M - w * S, z = 1 / Math.sqrt(Math.pow(G, 2) + Math.pow(O, 2) + Math.pow(B, 2)), Y = [G * z, O * z, B * z], W = [-1 * G * z, -1 * O * z, -1 * B * z], X = _r(h, f), V = _r(h, Y), K = _r(f, Y), et = _r(h, W), j = _r(f, W);
  let vt;
  return V < et && V < j || K < et && K < j ? vt = Y : vt = W, _r(h, vt) > X || _r(f, vt) > X ? Hn(dr(vt), dr(h)) <= Hn(dr(vt), dr(f)) ? [dr(h), !0, !1] : [dr(f), !1, !0] : [dr(vt), !1, !1];
}
var su = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function R4(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
function T4(n, i = {}) {
  const a = xi(n), h = (a[0] + a[2]) / 2, f = (a[1] + a[3]) / 2;
  return Fi([h, f], i.properties, i);
}
var mu = { exports: {} }, A4 = mu.exports, ag;
function L4() {
  return ag || (ag = 1, function(n, i) {
    (function(a, h) {
      n.exports = h();
    })(A4, function() {
      function a(o, t) {
        (t == null || t > o.length) && (t = o.length);
        for (var e = 0, s = Array(t); e < t; e++) s[e] = o[e];
        return s;
      }
      function h(o, t, e) {
        return t = S(t), function(s, l) {
          if (l && (typeof l == "object" || typeof l == "function")) return l;
          if (l !== void 0) throw new TypeError("Derived constructors may only return object or undefined");
          return function(_) {
            if (_ === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return _;
          }(s);
        }(o, w() ? Reflect.construct(t, e || [], S(o).constructor) : t.apply(o, e));
      }
      function f(o, t) {
        if (!(o instanceof t)) throw new TypeError("Cannot call a class as a function");
      }
      function v(o, t, e) {
        if (w()) return Reflect.construct.apply(null, arguments);
        var s = [null];
        s.push.apply(s, t);
        var l = new (o.bind.apply(o, s))();
        return e && b(l, e.prototype), l;
      }
      function d(o, t) {
        for (var e = 0; e < t.length; e++) {
          var s = t[e];
          s.enumerable = s.enumerable || !1, s.configurable = !0, "value" in s && (s.writable = !0), Object.defineProperty(o, O(s.key), s);
        }
      }
      function g(o, t, e) {
        return t && d(o.prototype, t), e && d(o, e), Object.defineProperty(o, "prototype", { writable: !1 }), o;
      }
      function p(o, t) {
        var e = typeof Symbol < "u" && o[Symbol.iterator] || o["@@iterator"];
        if (!e) {
          if (Array.isArray(o) || (e = B(o)) || t) {
            e && (o = e);
            var s = 0, l = function() {
            };
            return { s: l, n: function() {
              return s >= o.length ? { done: !0 } : { done: !1, value: o[s++] };
            }, e: function(N) {
              throw N;
            }, f: l };
          }
          throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
        }
        var _, m = !0, E = !1;
        return { s: function() {
          e = e.call(o);
        }, n: function() {
          var N = e.next();
          return m = N.done, N;
        }, e: function(N) {
          E = !0, _ = N;
        }, f: function() {
          try {
            m || e.return == null || e.return();
          } finally {
            if (E) throw _;
          }
        } };
      }
      function M() {
        return M = typeof Reflect < "u" && Reflect.get ? Reflect.get.bind() : function(o, t, e) {
          var s = function(_, m) {
            for (; !{}.hasOwnProperty.call(_, m) && (_ = S(_)) !== null; ) ;
            return _;
          }(o, t);
          if (s) {
            var l = Object.getOwnPropertyDescriptor(s, t);
            return l.get ? l.get.call(arguments.length < 3 ? o : e) : l.value;
          }
        }, M.apply(null, arguments);
      }
      function S(o) {
        return S = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t) {
          return t.__proto__ || Object.getPrototypeOf(t);
        }, S(o);
      }
      function x(o, t) {
        if (typeof t != "function" && t !== null) throw new TypeError("Super expression must either be null or a function");
        o.prototype = Object.create(t && t.prototype, { constructor: { value: o, writable: !0, configurable: !0 } }), Object.defineProperty(o, "prototype", { writable: !1 }), t && b(o, t);
      }
      function w() {
        try {
          var o = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
          }));
        } catch {
        }
        return (w = function() {
          return !!o;
        })();
      }
      function b(o, t) {
        return b = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(e, s) {
          return e.__proto__ = s, e;
        }, b(o, t);
      }
      function C(o, t, e, s) {
        var l = M(S(1 & s ? o.prototype : o), t, e);
        return 2 & s && typeof l == "function" ? function(_) {
          return l.apply(e, _);
        } : l;
      }
      function G(o) {
        return function(t) {
          if (Array.isArray(t)) return a(t);
        }(o) || function(t) {
          if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
        }(o) || B(o) || function() {
          throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
        }();
      }
      function O(o) {
        var t = function(e, s) {
          if (typeof e != "object" || !e) return e;
          var l = e[Symbol.toPrimitive];
          if (l !== void 0) {
            var _ = l.call(e, s);
            if (typeof _ != "object") return _;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return String(e);
        }(o, "string");
        return typeof t == "symbol" ? t : t + "";
      }
      function B(o, t) {
        if (o) {
          if (typeof o == "string") return a(o, t);
          var e = {}.toString.call(o).slice(8, -1);
          return e === "Object" && o.constructor && (e = o.constructor.name), e === "Map" || e === "Set" ? Array.from(o) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? a(o, t) : void 0;
        }
      }
      function z(o) {
        var t = typeof Map == "function" ? /* @__PURE__ */ new Map() : void 0;
        return z = function(e) {
          if (e === null || !function(l) {
            try {
              return Function.toString.call(l).indexOf("[native code]") !== -1;
            } catch {
              return typeof l == "function";
            }
          }(e)) return e;
          if (typeof e != "function") throw new TypeError("Super expression must either be null or a function");
          if (t !== void 0) {
            if (t.has(e)) return t.get(e);
            t.set(e, s);
          }
          function s() {
            return v(e, arguments, S(this).constructor);
          }
          return s.prototype = Object.create(e.prototype, { constructor: { value: s, enumerable: !1, writable: !0, configurable: !0 } }), b(s, e);
        }, z(o);
      }
      var Y = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "getEndCapStyle", value: function() {
          return this._endCapStyle;
        } }, { key: "isSingleSided", value: function() {
          return this._isSingleSided;
        } }, { key: "setQuadrantSegments", value: function(t) {
          this._quadrantSegments = t, this._quadrantSegments === 0 && (this._joinStyle = o.JOIN_BEVEL), this._quadrantSegments < 0 && (this._joinStyle = o.JOIN_MITRE, this._mitreLimit = Math.abs(this._quadrantSegments)), t <= 0 && (this._quadrantSegments = 1), this._joinStyle !== o.JOIN_ROUND && (this._quadrantSegments = o.DEFAULT_QUADRANT_SEGMENTS);
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
          if (this._quadrantSegments = o.DEFAULT_QUADRANT_SEGMENTS, this._endCapStyle = o.CAP_ROUND, this._joinStyle = o.JOIN_ROUND, this._mitreLimit = o.DEFAULT_MITRE_LIMIT, this._isSingleSided = !1, this._simplifyFactor = o.DEFAULT_SIMPLIFY_FACTOR, arguments.length !== 0) {
            if (arguments.length === 1) {
              var t = arguments[0];
              this.setQuadrantSegments(t);
            } else if (arguments.length === 2) {
              var e = arguments[0], s = arguments[1];
              this.setQuadrantSegments(e), this.setEndCapStyle(s);
            } else if (arguments.length === 4) {
              var l = arguments[0], _ = arguments[1], m = arguments[2], E = arguments[3];
              this.setQuadrantSegments(l), this.setEndCapStyle(_), this.setJoinStyle(m), this.setMitreLimit(E);
            }
          }
        } }, { key: "bufferDistanceError", value: function(t) {
          var e = Math.PI / 2 / t;
          return 1 - Math.cos(e / 2);
        } }]);
      }();
      Y.CAP_ROUND = 1, Y.CAP_FLAT = 2, Y.CAP_SQUARE = 3, Y.JOIN_ROUND = 1, Y.JOIN_MITRE = 2, Y.JOIN_BEVEL = 3, Y.DEFAULT_QUADRANT_SEGMENTS = 8, Y.DEFAULT_MITRE_LIMIT = 5, Y.DEFAULT_SIMPLIFY_FACTOR = 0.01;
      var W = function(o) {
        function t(e) {
          var s;
          return f(this, t), (s = h(this, t, [e])).name = Object.keys({ Exception: t })[0], s;
        }
        return x(t, o), g(t, [{ key: "toString", value: function() {
          return this.message;
        } }]);
      }(z(Error)), X = function(o) {
        function t(e) {
          var s;
          return f(this, t), (s = h(this, t, [e])).name = Object.keys({ IllegalArgumentException: t })[0], s;
        }
        return x(t, o), g(t);
      }(W), V = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "filter", value: function(o) {
        } }]);
      }();
      function K() {
      }
      function et() {
      }
      function j() {
      }
      var vt, _t, Mt, kt, it, St, Gt, Dt, $t = function() {
        return g(function o() {
          f(this, o);
        }, null, [{ key: "equalsWithTolerance", value: function(o, t, e) {
          return Math.abs(o - t) <= e;
        } }]);
      }(), he = function() {
        return g(function o(t, e) {
          f(this, o), this.low = e || 0, this.high = t || 0;
        }, null, [{ key: "toBinaryString", value: function(o) {
          var t, e = "";
          for (t = 2147483648; t > 0; t >>>= 1) e += (o.high & t) === t ? "1" : "0";
          for (t = 2147483648; t > 0; t >>>= 1) e += (o.low & t) === t ? "1" : "0";
          return e;
        } }]);
      }();
      function ht() {
      }
      function Zt() {
      }
      ht.NaN = NaN, ht.isNaN = function(o) {
        return Number.isNaN(o);
      }, ht.isInfinite = function(o) {
        return !Number.isFinite(o);
      }, ht.MAX_VALUE = Number.MAX_VALUE, ht.POSITIVE_INFINITY = Number.POSITIVE_INFINITY, ht.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY, typeof Float64Array == "function" && typeof Int32Array == "function" ? (St = 2146435072, Gt = new Float64Array(1), Dt = new Int32Array(Gt.buffer), ht.doubleToLongBits = function(o) {
        Gt[0] = o;
        var t = 0 | Dt[0], e = 0 | Dt[1];
        return (e & St) === St && 1048575 & e && t !== 0 && (t = 0, e = 2146959360), new he(e, t);
      }, ht.longBitsToDouble = function(o) {
        return Dt[0] = o.low, Dt[1] = o.high, Gt[0];
      }) : (vt = 1023, _t = Math.log2, Mt = Math.floor, kt = Math.pow, it = function() {
        for (var o = 53; o > 0; o--) {
          var t = kt(2, o) - 1;
          if (Mt(_t(t)) + 1 === o) return t;
        }
        return 0;
      }(), ht.doubleToLongBits = function(o) {
        var t, e, s, l, _, m, E, N, R;
        if (o < 0 || 1 / o === Number.NEGATIVE_INFINITY ? (m = 1 << 31, o = -o) : m = 0, o === 0) return new he(N = m, R = 0);
        if (o === 1 / 0) return new he(N = 2146435072 | m, R = 0);
        if (o != o) return new he(N = 2146959360, R = 0);
        if (l = 0, R = 0, (t = Mt(o)) > 1) if (t <= it) (l = Mt(_t(t))) <= 20 ? (R = 0, N = t << 20 - l & 1048575) : (R = t % (e = kt(2, s = l - 20)) << 32 - s, N = t / e & 1048575);
        else for (s = t, R = 0; (s = Mt(e = s / 2)) !== 0; ) l++, R >>>= 1, R |= (1 & N) << 31, N >>>= 1, e !== s && (N |= 524288);
        if (E = l + vt, _ = t === 0, t = o - t, l < 52 && t !== 0) for (s = 0; ; ) {
          if ((e = 2 * t) >= 1 ? (t = e - 1, _ ? (E--, _ = !1) : (s <<= 1, s |= 1, l++)) : (t = e, _ ? --E == 0 && (l++, _ = !1) : (s <<= 1, l++)), l === 20) N |= s, s = 0;
          else if (l === 52) {
            R |= s;
            break;
          }
          if (e === 1) {
            l < 20 ? N |= s << 20 - l : l < 52 && (R |= s << 52 - l);
            break;
          }
        }
        return N |= E << 20, new he(N |= m, R);
      }, ht.longBitsToDouble = function(o) {
        var t, e, s, l, _ = o.high, m = o.low, E = _ & 1 << 31 ? -1 : 1;
        for (s = ((2146435072 & _) >> 20) - vt, l = 0, e = 1 << 19, t = 1; t <= 20; t++) _ & e && (l += kt(2, -t)), e >>>= 1;
        for (e = 1 << 31, t = 21; t <= 52; t++) m & e && (l += kt(2, -t)), e >>>= 1;
        if (s === -1023) {
          if (l === 0) return 0 * E;
          s = -1022;
        } else {
          if (s === 1024) return l === 0 ? E / 0 : NaN;
          l += 1;
        }
        return E * l * kt(2, s);
      });
      var le = function(o) {
        function t(e) {
          var s;
          return f(this, t), (s = h(this, t, [e])).name = Object.keys({ RuntimeException: t })[0], s;
        }
        return x(t, o), g(t);
      }(W), Me = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, null, [{ key: "constructor_", value: function() {
          if (arguments.length === 0) le.constructor_.call(this);
          else if (arguments.length === 1) {
            var e = arguments[0];
            le.constructor_.call(this, e);
          }
        } }]);
      }(le), Nt = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "shouldNeverReachHere", value: function() {
          if (arguments.length === 0) o.shouldNeverReachHere(null);
          else if (arguments.length === 1) {
            var t = arguments[0];
            throw new Me("Should never reach here" + (t !== null ? ": " + t : ""));
          }
        } }, { key: "isTrue", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            o.isTrue(t, null);
          } else if (arguments.length === 2) {
            var e = arguments[1];
            if (!arguments[0]) throw e === null ? new Me() : new Me(e);
          }
        } }, { key: "equals", value: function() {
          if (arguments.length === 2) {
            var t = arguments[0], e = arguments[1];
            o.equals(t, e, null);
          } else if (arguments.length === 3) {
            var s = arguments[0], l = arguments[1], _ = arguments[2];
            if (!l.equals(s)) throw new Me("Expected " + s + " but encountered " + l + (_ !== null ? ": " + _ : ""));
          }
        } }]);
      }(), we = new ArrayBuffer(8), xr = new Float64Array(we), Ua = new Int32Array(we), U = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "getM", value: function() {
          return ht.NaN;
        } }, { key: "setOrdinate", value: function(t, e) {
          switch (t) {
            case o.X:
              this.x = e;
              break;
            case o.Y:
              this.y = e;
              break;
            case o.Z:
              this.setZ(e);
              break;
            default:
              throw new X("Invalid ordinate index: " + t);
          }
        } }, { key: "equals2D", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return this.x === t.x && this.y === t.y;
          }
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            return !!$t.equalsWithTolerance(this.x, e.x, s) && !!$t.equalsWithTolerance(this.y, e.y, s);
          }
        } }, { key: "setM", value: function(t) {
          throw new X("Invalid ordinate index: " + o.M);
        } }, { key: "getZ", value: function() {
          return this.z;
        } }, { key: "getOrdinate", value: function(t) {
          switch (t) {
            case o.X:
              return this.x;
            case o.Y:
              return this.y;
            case o.Z:
              return this.getZ();
          }
          throw new X("Invalid ordinate index: " + t);
        } }, { key: "equals3D", value: function(t) {
          return this.x === t.x && this.y === t.y && (this.getZ() === t.getZ() || ht.isNaN(this.getZ()) && ht.isNaN(t.getZ()));
        } }, { key: "equals", value: function(t) {
          return t instanceof o && this.equals2D(t);
        } }, { key: "equalInZ", value: function(t, e) {
          return $t.equalsWithTolerance(this.getZ(), t.getZ(), e);
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
            if (t instanceof CloneNotSupportedException) return Nt.shouldNeverReachHere("this shouldn't happen because this class is Cloneable"), null;
            throw t;
          }
        } }, { key: "copy", value: function() {
          return new o(this);
        } }, { key: "toString", value: function() {
          return "(" + this.x + ", " + this.y + ", " + this.getZ() + ")";
        } }, { key: "distance3D", value: function(t) {
          var e = this.x - t.x, s = this.y - t.y, l = this.getZ() - t.getZ();
          return Math.sqrt(e * e + s * s + l * l);
        } }, { key: "getY", value: function() {
          return this.y;
        } }, { key: "setY", value: function(t) {
          this.y = t;
        } }, { key: "distance", value: function(t) {
          var e = this.x - t.x, s = this.y - t.y;
          return Math.sqrt(e * e + s * s);
        } }, { key: "hashCode", value: function() {
          var t = 17;
          return t = 37 * (t = 37 * t + o.hashCode(this.x)) + o.hashCode(this.y);
        } }, { key: "setCoordinate", value: function(t) {
          this.x = t.x, this.y = t.y, this.z = t.getZ();
        } }, { key: "interfaces_", get: function() {
          return [K, et, j];
        } }], [{ key: "constructor_", value: function() {
          if (this.x = null, this.y = null, this.z = null, arguments.length === 0) o.constructor_.call(this, 0, 0);
          else if (arguments.length === 1) {
            var t = arguments[0];
            o.constructor_.call(this, t.x, t.y, t.getZ());
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            o.constructor_.call(this, e, s, o.NULL_ORDINATE);
          } else if (arguments.length === 3) {
            var l = arguments[0], _ = arguments[1], m = arguments[2];
            this.x = l, this.y = _, this.z = m;
          }
        } }, { key: "hashCode", value: function(t) {
          return xr[0] = t, Ua[0] ^ Ua[1];
        } }]);
      }(), Hi = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "compare", value: function(t, e) {
          var s = o.compare(t.x, e.x);
          if (s !== 0) return s;
          var l = o.compare(t.y, e.y);
          return l !== 0 ? l : this._dimensionsToTest <= 2 ? 0 : o.compare(t.getZ(), e.getZ());
        } }, { key: "interfaces_", get: function() {
          return [Zt];
        } }], [{ key: "constructor_", value: function() {
          if (this._dimensionsToTest = 2, arguments.length === 0) o.constructor_.call(this, 2);
          else if (arguments.length === 1) {
            var t = arguments[0];
            if (t !== 2 && t !== 3) throw new X("only 2 or 3 dimensions may be specified");
            this._dimensionsToTest = t;
          }
        } }, { key: "compare", value: function(t, e) {
          return t < e ? -1 : t > e ? 1 : ht.isNaN(t) ? ht.isNaN(e) ? 0 : -1 : ht.isNaN(e) ? 1 : 0;
        } }]);
      }();
      U.DimensionalComparator = Hi, U.NULL_ORDINATE = ht.NaN, U.X = 0, U.Y = 1, U.Z = 2, U.M = 3;
      var Ht = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "getArea", value: function() {
          return this.getWidth() * this.getHeight();
        } }, { key: "equals", value: function(t) {
          if (!(t instanceof o)) return !1;
          var e = t;
          return this.isNull() ? e.isNull() : this._maxx === e.getMaxX() && this._maxy === e.getMaxY() && this._minx === e.getMinX() && this._miny === e.getMinY();
        } }, { key: "intersection", value: function(t) {
          if (this.isNull() || t.isNull() || !this.intersects(t)) return new o();
          var e = this._minx > t._minx ? this._minx : t._minx, s = this._miny > t._miny ? this._miny : t._miny;
          return new o(e, this._maxx < t._maxx ? this._maxx : t._maxx, s, this._maxy < t._maxy ? this._maxy : t._maxy);
        } }, { key: "isNull", value: function() {
          return this._maxx < this._minx;
        } }, { key: "getMaxX", value: function() {
          return this._maxx;
        } }, { key: "covers", value: function() {
          if (arguments.length === 1) {
            if (arguments[0] instanceof U) {
              var t = arguments[0];
              return this.covers(t.x, t.y);
            }
            if (arguments[0] instanceof o) {
              var e = arguments[0];
              return !this.isNull() && !e.isNull() && e.getMinX() >= this._minx && e.getMaxX() <= this._maxx && e.getMinY() >= this._miny && e.getMaxY() <= this._maxy;
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], l = arguments[1];
            return !this.isNull() && s >= this._minx && s <= this._maxx && l >= this._miny && l <= this._maxy;
          }
        } }, { key: "intersects", value: function() {
          if (arguments.length === 1) {
            if (arguments[0] instanceof o) {
              var t = arguments[0];
              return !this.isNull() && !t.isNull() && !(t._minx > this._maxx || t._maxx < this._minx || t._miny > this._maxy || t._maxy < this._miny);
            }
            if (arguments[0] instanceof U) {
              var e = arguments[0];
              return this.intersects(e.x, e.y);
            }
          } else if (arguments.length === 2) {
            if (arguments[0] instanceof U && arguments[1] instanceof U) {
              var s = arguments[0], l = arguments[1];
              return !this.isNull() && !((s.x < l.x ? s.x : l.x) > this._maxx) && !((s.x > l.x ? s.x : l.x) < this._minx) && !((s.y < l.y ? s.y : l.y) > this._maxy) && !((s.y > l.y ? s.y : l.y) < this._miny);
            }
            if (typeof arguments[0] == "number" && typeof arguments[1] == "number") {
              var _ = arguments[0], m = arguments[1];
              return !this.isNull() && !(_ > this._maxx || _ < this._minx || m > this._maxy || m < this._miny);
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
            if (arguments[0] instanceof U) {
              var t = arguments[0];
              this.expandToInclude(t.x, t.y);
            } else if (arguments[0] instanceof o) {
              var e = arguments[0];
              if (e.isNull()) return null;
              this.isNull() ? (this._minx = e.getMinX(), this._maxx = e.getMaxX(), this._miny = e.getMinY(), this._maxy = e.getMaxY()) : (e._minx < this._minx && (this._minx = e._minx), e._maxx > this._maxx && (this._maxx = e._maxx), e._miny < this._miny && (this._miny = e._miny), e._maxy > this._maxy && (this._maxy = e._maxy));
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], l = arguments[1];
            this.isNull() ? (this._minx = s, this._maxx = s, this._miny = l, this._maxy = l) : (s < this._minx && (this._minx = s), s > this._maxx && (this._maxx = s), l < this._miny && (this._miny = l), l > this._maxy && (this._maxy = l));
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
          return new o(this);
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
            if (arguments[0] instanceof o) {
              var t = arguments[0];
              return this.covers(t);
            }
            if (arguments[0] instanceof U) {
              var e = arguments[0];
              return this.covers(e);
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], l = arguments[1];
            return this.covers(s, l);
          }
        } }, { key: "centre", value: function() {
          return this.isNull() ? null : new U((this.getMinX() + this.getMaxX()) / 2, (this.getMinY() + this.getMaxY()) / 2);
        } }, { key: "init", value: function() {
          if (arguments.length === 0) this.setToNull();
          else if (arguments.length === 1) {
            if (arguments[0] instanceof U) {
              var t = arguments[0];
              this.init(t.x, t.x, t.y, t.y);
            } else if (arguments[0] instanceof o) {
              var e = arguments[0];
              this._minx = e._minx, this._maxx = e._maxx, this._miny = e._miny, this._maxy = e._maxy;
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], l = arguments[1];
            this.init(s.x, l.x, s.y, l.y);
          } else if (arguments.length === 4) {
            var _ = arguments[0], m = arguments[1], E = arguments[2], N = arguments[3];
            _ < m ? (this._minx = _, this._maxx = m) : (this._minx = m, this._maxx = _), E < N ? (this._miny = E, this._maxy = N) : (this._miny = N, this._maxy = E);
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
          return t = 37 * (t = 37 * (t = 37 * (t = 37 * t + U.hashCode(this._minx)) + U.hashCode(this._maxx)) + U.hashCode(this._miny)) + U.hashCode(this._maxy);
        } }, { key: "interfaces_", get: function() {
          return [K, j];
        } }], [{ key: "constructor_", value: function() {
          if (this._minx = null, this._maxx = null, this._miny = null, this._maxy = null, arguments.length === 0) this.init();
          else if (arguments.length === 1) {
            if (arguments[0] instanceof U) {
              var t = arguments[0];
              this.init(t.x, t.x, t.y, t.y);
            } else if (arguments[0] instanceof o) {
              var e = arguments[0];
              this.init(e);
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], l = arguments[1];
            this.init(s.x, l.x, s.y, l.y);
          } else if (arguments.length === 4) {
            var _ = arguments[0], m = arguments[1], E = arguments[2], N = arguments[3];
            this.init(_, m, E, N);
          }
        } }, { key: "intersects", value: function() {
          if (arguments.length === 3) {
            var t = arguments[0], e = arguments[1], s = arguments[2];
            return s.x >= (t.x < e.x ? t.x : e.x) && s.x <= (t.x > e.x ? t.x : e.x) && s.y >= (t.y < e.y ? t.y : e.y) && s.y <= (t.y > e.y ? t.y : e.y);
          }
          if (arguments.length === 4) {
            var l = arguments[0], _ = arguments[1], m = arguments[2], E = arguments[3], N = Math.min(m.x, E.x), R = Math.max(m.x, E.x), D = Math.min(l.x, _.x), q = Math.max(l.x, _.x);
            return !(D > R) && !(q < N) && (N = Math.min(m.y, E.y), R = Math.max(m.y, E.y), D = Math.min(l.y, _.y), q = Math.max(l.y, _.y), !(D > R) && !(q < N));
          }
        } }]);
      }(), ft = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "isGeometryCollection", value: function() {
          return this.getTypeCode() === o.TYPECODE_GEOMETRYCOLLECTION;
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
          this.apply(o.geometryChangedFilter);
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
            var s = arguments[0], l = arguments[1];
            return t = s, this.getTypeCode() !== t.getTypeCode() ? this.getTypeCode() - t.getTypeCode() : this.isEmpty() && t.isEmpty() ? 0 : this.isEmpty() ? -1 : t.isEmpty() ? 1 : this.compareToSameClass(s, l);
          }
        } }, { key: "getUserData", value: function() {
          return this._userData;
        } }, { key: "getSRID", value: function() {
          return this._SRID;
        } }, { key: "getEnvelope", value: function() {
          return this.getFactory().toGeometry(this.getEnvelopeInternal());
        } }, { key: "checkNotGeometryCollection", value: function(t) {
          if (t.getTypeCode() === o.TYPECODE_GEOMETRYCOLLECTION) throw new X("This method does not support GeometryCollection arguments");
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
          return this._envelope === null && (this._envelope = this.computeEnvelopeInternal()), new Ht(this._envelope);
        } }, { key: "setSRID", value: function(t) {
          this._SRID = t;
        } }, { key: "setUserData", value: function(t) {
          this._userData = t;
        } }, { key: "compare", value: function(t, e) {
          for (var s = t.iterator(), l = e.iterator(); s.hasNext() && l.hasNext(); ) {
            var _ = s.next(), m = l.next(), E = _.compareTo(m);
            if (E !== 0) return E;
          }
          return s.hasNext() ? 1 : l.hasNext() ? -1 : 0;
        } }, { key: "hashCode", value: function() {
          return this.getEnvelopeInternal().hashCode();
        } }, { key: "isEquivalentClass", value: function(t) {
          return this.getClass() === t.getClass();
        } }, { key: "isGeometryCollectionOrDerived", value: function() {
          return this.getTypeCode() === o.TYPECODE_GEOMETRYCOLLECTION || this.getTypeCode() === o.TYPECODE_MULTIPOINT || this.getTypeCode() === o.TYPECODE_MULTILINESTRING || this.getTypeCode() === o.TYPECODE_MULTIPOLYGON;
        } }, { key: "interfaces_", get: function() {
          return [et, K, j];
        } }, { key: "getClass", value: function() {
          return o;
        } }], [{ key: "hasNonEmptyElements", value: function(t) {
          for (var e = 0; e < t.length; e++) if (!t[e].isEmpty()) return !0;
          return !1;
        } }, { key: "hasNullElements", value: function(t) {
          for (var e = 0; e < t.length; e++) if (t[e] === null) return !0;
          return !1;
        } }]);
      }();
      ft.constructor_ = function(o) {
        o && (this._envelope = null, this._userData = null, this._factory = o, this._SRID = o.getSRID());
      }, ft.TYPECODE_POINT = 0, ft.TYPECODE_MULTIPOINT = 1, ft.TYPECODE_LINESTRING = 2, ft.TYPECODE_LINEARRING = 3, ft.TYPECODE_MULTILINESTRING = 4, ft.TYPECODE_POLYGON = 5, ft.TYPECODE_MULTIPOLYGON = 6, ft.TYPECODE_GEOMETRYCOLLECTION = 7, ft.TYPENAME_POINT = "Point", ft.TYPENAME_MULTIPOINT = "MultiPoint", ft.TYPENAME_LINESTRING = "LineString", ft.TYPENAME_LINEARRING = "LinearRing", ft.TYPENAME_MULTILINESTRING = "MultiLineString", ft.TYPENAME_POLYGON = "Polygon", ft.TYPENAME_MULTIPOLYGON = "MultiPolygon", ft.TYPENAME_GEOMETRYCOLLECTION = "GeometryCollection", ft.geometryChangedFilter = { get interfaces_() {
        return [V];
      }, filter: function(o) {
        o.geometryChangedAction();
      } };
      var A = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "toLocationSymbol", value: function(t) {
          switch (t) {
            case o.EXTERIOR:
              return "e";
            case o.BOUNDARY:
              return "b";
            case o.INTERIOR:
              return "i";
            case o.NONE:
              return "-";
          }
          throw new X("Unknown location value: " + t);
        } }]);
      }();
      A.INTERIOR = 0, A.BOUNDARY = 1, A.EXTERIOR = 2, A.NONE = -1;
      var nn = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "add", value: function() {
        } }, { key: "addAll", value: function() {
        } }, { key: "isEmpty", value: function() {
        } }, { key: "iterator", value: function() {
        } }, { key: "size", value: function() {
        } }, { key: "toArray", value: function() {
        } }, { key: "remove", value: function() {
        } }]);
      }(), Se = function(o) {
        function t(e) {
          var s;
          return f(this, t), (s = h(this, t, [e])).name = Object.keys({ NoSuchElementException: t })[0], s;
        }
        return x(t, o), g(t);
      }(W), qe = function(o) {
        function t(e) {
          var s;
          return f(this, t), (s = h(this, t, [e])).name = Object.keys({ UnsupportedOperationException: t })[0], s;
        }
        return x(t, o), g(t);
      }(W), za = function(o) {
        function t() {
          return f(this, t), h(this, t, arguments);
        }
        return x(t, o), g(t, [{ key: "contains", value: function() {
        } }]);
      }(nn), rn = function(o) {
        function t(e) {
          var s;
          return f(this, t), (s = h(this, t)).map = /* @__PURE__ */ new Map(), e instanceof nn && s.addAll(e), s;
        }
        return x(t, o), g(t, [{ key: "contains", value: function(e) {
          var s = e.hashCode ? e.hashCode() : e;
          return !!this.map.has(s);
        } }, { key: "add", value: function(e) {
          var s = e.hashCode ? e.hashCode() : e;
          return !this.map.has(s) && !!this.map.set(s, e);
        } }, { key: "addAll", value: function(e) {
          var s, l = p(e);
          try {
            for (l.s(); !(s = l.n()).done; ) {
              var _ = s.value;
              this.add(_);
            }
          } catch (m) {
            l.e(m);
          } finally {
            l.f();
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
          return new Ya(this.map);
        } }, { key: Symbol.iterator, value: function() {
          return this.map;
        } }]);
      }(za), Ya = function() {
        return g(function o(t) {
          f(this, o), this.iterator = t.values();
          var e = this.iterator.next(), s = e.done, l = e.value;
          this.done = s, this.value = l;
        }, [{ key: "next", value: function() {
          if (this.done) throw new Se();
          var o = this.value, t = this.iterator.next(), e = t.done, s = t.value;
          return this.done = e, this.value = s, o;
        } }, { key: "hasNext", value: function() {
          return !this.done;
        } }, { key: "remove", value: function() {
          throw new qe();
        } }]);
      }(), tt = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "opposite", value: function(t) {
          return t === o.LEFT ? o.RIGHT : t === o.RIGHT ? o.LEFT : t;
        } }]);
      }();
      tt.ON = 0, tt.LEFT = 1, tt.RIGHT = 2;
      var Si = function(o) {
        function t(e) {
          var s;
          return f(this, t), (s = h(this, t, [e])).name = Object.keys({ EmptyStackException: t })[0], s;
        }
        return x(t, o), g(t);
      }(W), Be = function(o) {
        function t(e) {
          var s;
          return f(this, t), (s = h(this, t, [e])).name = Object.keys({ IndexOutOfBoundsException: t })[0], s;
        }
        return x(t, o), g(t);
      }(W), sn = function(o) {
        function t() {
          return f(this, t), h(this, t, arguments);
        }
        return x(t, o), g(t, [{ key: "get", value: function() {
        } }, { key: "set", value: function() {
        } }, { key: "isEmpty", value: function() {
        } }]);
      }(nn), Mr = function(o) {
        function t() {
          var e;
          return f(this, t), (e = h(this, t)).array = [], e;
        }
        return x(t, o), g(t, [{ key: "add", value: function(e) {
          return this.array.push(e), !0;
        } }, { key: "get", value: function(e) {
          if (e < 0 || e >= this.size()) throw new Be();
          return this.array[e];
        } }, { key: "push", value: function(e) {
          return this.array.push(e), e;
        } }, { key: "pop", value: function() {
          if (this.array.length === 0) throw new Si();
          return this.array.pop();
        } }, { key: "peek", value: function() {
          if (this.array.length === 0) throw new Si();
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
      function wt(o, t) {
        return o.interfaces_ && o.interfaces_.indexOf(t) > -1;
      }
      var Cn = function() {
        return g(function o(t) {
          f(this, o), this.str = t;
        }, [{ key: "append", value: function(o) {
          this.str += o;
        } }, { key: "setCharAt", value: function(o, t) {
          this.str = this.str.substr(0, o) + t + this.str.substr(o + 1);
        } }, { key: "toString", value: function() {
          return this.str;
        } }]);
      }(), wr = function() {
        function o(t) {
          f(this, o), this.value = t;
        }
        return g(o, [{ key: "intValue", value: function() {
          return this.value;
        } }, { key: "compareTo", value: function(t) {
          return this.value < t ? -1 : this.value > t ? 1 : 0;
        } }], [{ key: "compare", value: function(t, e) {
          return t < e ? -1 : t > e ? 1 : 0;
        } }, { key: "isNan", value: function(t) {
          return Number.isNaN(t);
        } }, { key: "valueOf", value: function(t) {
          return new o(t);
        } }]);
      }(), jn = function() {
        return g(function o() {
          f(this, o);
        }, null, [{ key: "isWhitespace", value: function(o) {
          return o <= 32 && o >= 0 || o === 127;
        } }, { key: "toUpperCase", value: function(o) {
          return o.toUpperCase();
        } }]);
      }(), dt = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "le", value: function(t) {
          return this._hi < t._hi || this._hi === t._hi && this._lo <= t._lo;
        } }, { key: "extractSignificantDigits", value: function(t, e) {
          var s = this.abs(), l = o.magnitude(s._hi), _ = o.TEN.pow(l);
          (s = s.divide(_)).gt(o.TEN) ? (s = s.divide(o.TEN), l += 1) : s.lt(o.ONE) && (s = s.multiply(o.TEN), l -= 1);
          for (var m = l + 1, E = new Cn(), N = o.MAX_PRINT_DIGITS - 1, R = 0; R <= N; R++) {
            t && R === m && E.append(".");
            var D = Math.trunc(s._hi);
            if (D < 0) break;
            var q = !1, Z = 0;
            D > 9 ? (q = !0, Z = "9") : Z = "0" + D, E.append(Z), s = s.subtract(o.valueOf(D)).multiply(o.TEN), q && s.selfAdd(o.TEN);
            var st = !0, ut = o.magnitude(s._hi);
            if (ut < 0 && Math.abs(ut) >= N - R && (st = !1), !st) break;
          }
          return e[0] = l, E.toString();
        } }, { key: "sqr", value: function() {
          return this.multiply(this);
        } }, { key: "doubleValue", value: function() {
          return this._hi + this._lo;
        } }, { key: "subtract", value: function() {
          if (arguments[0] instanceof o) {
            var t = arguments[0];
            return this.add(t.negate());
          }
          if (typeof arguments[0] == "number") {
            var e = arguments[0];
            return this.add(-e);
          }
        } }, { key: "equals", value: function() {
          if (arguments.length === 1 && arguments[0] instanceof o) {
            var t = arguments[0];
            return this._hi === t._hi && this._lo === t._lo;
          }
        } }, { key: "isZero", value: function() {
          return this._hi === 0 && this._lo === 0;
        } }, { key: "selfSubtract", value: function() {
          if (arguments[0] instanceof o) {
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
            if (arguments[0] instanceof o) {
              var t = arguments[0];
              return this.selfDivide(t._hi, t._lo);
            }
            if (typeof arguments[0] == "number") {
              var e = arguments[0];
              return this.selfDivide(e, 0);
            }
          } else if (arguments.length === 2) {
            var s, l, _, m, E = arguments[0], N = arguments[1], R = null, D = null, q = null, Z = null;
            return _ = this._hi / E, Z = (R = (q = o.SPLIT * _) - (R = q - _)) * (D = (Z = o.SPLIT * E) - (D = Z - E)) - (m = _ * E) + R * (l = E - D) + (s = _ - R) * D + s * l, Z = _ + (q = (this._hi - m - Z + this._lo - _ * N) / E), this._hi = Z, this._lo = _ - Z + q, this;
          }
        } }, { key: "dump", value: function() {
          return "DD<" + this._hi + ", " + this._lo + ">";
        } }, { key: "divide", value: function() {
          if (arguments[0] instanceof o) {
            var t, e, s, l, _ = arguments[0], m = null, E = null, N = null, R = null;
            return t = (s = this._hi / _._hi) - (m = (N = o.SPLIT * s) - (m = N - s)), R = m * (E = (R = o.SPLIT * _._hi) - (E = R - _._hi)) - (l = s * _._hi) + m * (e = _._hi - E) + t * E + t * e, new o(R = s + (N = (this._hi - l - R + this._lo - s * _._lo) / _._hi), s - R + N);
          }
          if (typeof arguments[0] == "number") {
            var D = arguments[0];
            return ht.isNaN(D) ? o.createNaN() : o.copy(this).selfDivide(D, 0);
          }
        } }, { key: "ge", value: function(t) {
          return this._hi > t._hi || this._hi === t._hi && this._lo >= t._lo;
        } }, { key: "pow", value: function(t) {
          if (t === 0) return o.valueOf(1);
          var e = new o(this), s = o.valueOf(1), l = Math.abs(t);
          if (l > 1) for (; l > 0; ) l % 2 == 1 && s.selfMultiply(e), (l /= 2) > 0 && (e = e.sqr());
          else s = e;
          return t < 0 ? s.reciprocal() : s;
        } }, { key: "ceil", value: function() {
          if (this.isNaN()) return o.NaN;
          var t = Math.ceil(this._hi), e = 0;
          return t === this._hi && (e = Math.ceil(this._lo)), new o(t, e);
        } }, { key: "compareTo", value: function(t) {
          var e = t;
          return this._hi < e._hi ? -1 : this._hi > e._hi ? 1 : this._lo < e._lo ? -1 : this._lo > e._lo ? 1 : 0;
        } }, { key: "rint", value: function() {
          return this.isNaN() ? this : this.add(0.5).floor();
        } }, { key: "setValue", value: function() {
          if (arguments[0] instanceof o) {
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
          if (this.isZero()) return o.valueOf(0);
          if (this.isNegative()) return o.NaN;
          var t = 1 / Math.sqrt(this._hi), e = this._hi * t, s = o.valueOf(e), l = this.subtract(s.sqr())._hi * (0.5 * t);
          return s.add(l);
        } }, { key: "selfAdd", value: function() {
          if (arguments.length === 1) {
            if (arguments[0] instanceof o) {
              var t = arguments[0];
              return this.selfAdd(t._hi, t._lo);
            }
            if (typeof arguments[0] == "number") {
              var e, s, l, _, m, E = arguments[0], N = null;
              return N = (l = this._hi + E) - (_ = l - this._hi), s = (m = (N = E - _ + (this._hi - N)) + this._lo) + (l - (e = l + m)), this._hi = e + s, this._lo = s + (e - this._hi), this;
            }
          } else if (arguments.length === 2) {
            var R, D, q, Z, st = arguments[0], ut = arguments[1], gt = null, bt = null, lt = null;
            q = this._hi + st, D = this._lo + ut, bt = q - (lt = q - this._hi), gt = D - (Z = D - this._lo);
            var Wt = (R = q + (lt = (bt = st - lt + (this._hi - bt)) + D)) + (lt = (gt = ut - Z + (this._lo - gt)) + (lt + (q - R))), ce = lt + (R - Wt);
            return this._hi = Wt, this._lo = ce, this;
          }
        } }, { key: "selfMultiply", value: function() {
          if (arguments.length === 1) {
            if (arguments[0] instanceof o) {
              var t = arguments[0];
              return this.selfMultiply(t._hi, t._lo);
            }
            if (typeof arguments[0] == "number") {
              var e = arguments[0];
              return this.selfMultiply(e, 0);
            }
          } else if (arguments.length === 2) {
            var s, l, _ = arguments[0], m = arguments[1], E = null, N = null, R = null, D = null;
            E = (R = o.SPLIT * this._hi) - this._hi, D = o.SPLIT * _, E = R - E, s = this._hi - E, N = D - _;
            var q = (R = this._hi * _) + (D = E * (N = D - N) - R + E * (l = _ - N) + s * N + s * l + (this._hi * m + this._lo * _)), Z = D + (E = R - q);
            return this._hi = q, this._lo = Z, this;
          }
        } }, { key: "selfSqr", value: function() {
          return this.selfMultiply(this);
        } }, { key: "floor", value: function() {
          if (this.isNaN()) return o.NaN;
          var t = Math.floor(this._hi), e = 0;
          return t === this._hi && (e = Math.floor(this._lo)), new o(t, e);
        } }, { key: "negate", value: function() {
          return this.isNaN() ? this : new o(-this._hi, -this._lo);
        } }, { key: "clone", value: function() {
          try {
            return null;
          } catch (t) {
            if (t instanceof CloneNotSupportedException) return null;
            throw t;
          }
        } }, { key: "multiply", value: function() {
          if (arguments[0] instanceof o) {
            var t = arguments[0];
            return t.isNaN() ? o.createNaN() : o.copy(this).selfMultiply(t);
          }
          if (typeof arguments[0] == "number") {
            var e = arguments[0];
            return ht.isNaN(e) ? o.createNaN() : o.copy(this).selfMultiply(e, 0);
          }
        } }, { key: "isNaN", value: function() {
          return ht.isNaN(this._hi);
        } }, { key: "intValue", value: function() {
          return Math.trunc(this._hi);
        } }, { key: "toString", value: function() {
          var t = o.magnitude(this._hi);
          return t >= -3 && t <= 20 ? this.toStandardNotation() : this.toSciNotation();
        } }, { key: "toStandardNotation", value: function() {
          var t = this.getSpecialNumberString();
          if (t !== null) return t;
          var e = new Array(1).fill(null), s = this.extractSignificantDigits(!0, e), l = e[0] + 1, _ = s;
          if (s.charAt(0) === ".") _ = "0" + s;
          else if (l < 0) _ = "0." + o.stringOfChar("0", -l) + s;
          else if (s.indexOf(".") === -1) {
            var m = l - s.length;
            _ = s + o.stringOfChar("0", m) + ".0";
          }
          return this.isNegative() ? "-" + _ : _;
        } }, { key: "reciprocal", value: function() {
          var t, e, s, l, _ = null, m = null, E = null, N = null;
          t = (s = 1 / this._hi) - (_ = (E = o.SPLIT * s) - (_ = E - s)), m = (N = o.SPLIT * this._hi) - this._hi;
          var R = s + (E = (1 - (l = s * this._hi) - (N = _ * (m = N - m) - l + _ * (e = this._hi - m) + t * m + t * e) - s * this._lo) / this._hi);
          return new o(R, s - R + E);
        } }, { key: "toSciNotation", value: function() {
          if (this.isZero()) return o.SCI_NOT_ZERO;
          var t = this.getSpecialNumberString();
          if (t !== null) return t;
          var e = new Array(1).fill(null), s = this.extractSignificantDigits(!1, e), l = o.SCI_NOT_EXPONENT_CHAR + e[0];
          if (s.charAt(0) === "0") throw new IllegalStateException("Found leading zero: " + s);
          var _ = "";
          s.length > 1 && (_ = s.substring(1));
          var m = s.charAt(0) + "." + _;
          return this.isNegative() ? "-" + m + l : m + l;
        } }, { key: "abs", value: function() {
          return this.isNaN() ? o.NaN : this.isNegative() ? this.negate() : new o(this);
        } }, { key: "isPositive", value: function() {
          return this._hi > 0 || this._hi === 0 && this._lo > 0;
        } }, { key: "lt", value: function(t) {
          return this._hi < t._hi || this._hi === t._hi && this._lo < t._lo;
        } }, { key: "add", value: function() {
          if (arguments[0] instanceof o) {
            var t = arguments[0];
            return o.copy(this).selfAdd(t);
          }
          if (typeof arguments[0] == "number") {
            var e = arguments[0];
            return o.copy(this).selfAdd(e);
          }
        } }, { key: "init", value: function() {
          if (arguments.length === 1) {
            if (typeof arguments[0] == "number") {
              var t = arguments[0];
              this._hi = t, this._lo = 0;
            } else if (arguments[0] instanceof o) {
              var e = arguments[0];
              this._hi = e._hi, this._lo = e._lo;
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], l = arguments[1];
            this._hi = s, this._lo = l;
          }
        } }, { key: "gt", value: function(t) {
          return this._hi > t._hi || this._hi === t._hi && this._lo > t._lo;
        } }, { key: "isNegative", value: function() {
          return this._hi < 0 || this._hi === 0 && this._lo < 0;
        } }, { key: "trunc", value: function() {
          return this.isNaN() ? o.NaN : this.isPositive() ? this.floor() : this.ceil();
        } }, { key: "signum", value: function() {
          return this._hi > 0 ? 1 : this._hi < 0 ? -1 : this._lo > 0 ? 1 : this._lo < 0 ? -1 : 0;
        } }, { key: "interfaces_", get: function() {
          return [j, K, et];
        } }], [{ key: "constructor_", value: function() {
          if (this._hi = 0, this._lo = 0, arguments.length === 0) this.init(0);
          else if (arguments.length === 1) {
            if (typeof arguments[0] == "number") {
              var t = arguments[0];
              this.init(t);
            } else if (arguments[0] instanceof o) {
              var e = arguments[0];
              this.init(e);
            } else if (typeof arguments[0] == "string") {
              var s = arguments[0];
              o.constructor_.call(this, o.parse(s));
            }
          } else if (arguments.length === 2) {
            var l = arguments[0], _ = arguments[1];
            this.init(l, _);
          }
        } }, { key: "determinant", value: function() {
          if (typeof arguments[3] == "number" && typeof arguments[2] == "number" && typeof arguments[0] == "number" && typeof arguments[1] == "number") {
            var t = arguments[0], e = arguments[1], s = arguments[2], l = arguments[3];
            return o.determinant(o.valueOf(t), o.valueOf(e), o.valueOf(s), o.valueOf(l));
          }
          if (arguments[3] instanceof o && arguments[2] instanceof o && arguments[0] instanceof o && arguments[1] instanceof o) {
            var _ = arguments[1], m = arguments[2], E = arguments[3];
            return arguments[0].multiply(E).selfSubtract(_.multiply(m));
          }
        } }, { key: "sqr", value: function(t) {
          return o.valueOf(t).selfMultiply(t);
        } }, { key: "valueOf", value: function() {
          if (typeof arguments[0] == "string") {
            var t = arguments[0];
            return o.parse(t);
          }
          if (typeof arguments[0] == "number") return new o(arguments[0]);
        } }, { key: "sqrt", value: function(t) {
          return o.valueOf(t).sqrt();
        } }, { key: "parse", value: function(t) {
          for (var e = 0, s = t.length; jn.isWhitespace(t.charAt(e)); ) e++;
          var l = !1;
          if (e < s) {
            var _ = t.charAt(e);
            _ !== "-" && _ !== "+" || (e++, _ === "-" && (l = !0));
          }
          for (var m = new o(), E = 0, N = 0, R = 0, D = !1; !(e >= s); ) {
            var q = t.charAt(e);
            if (e++, jn.isDigit(q)) {
              var Z = q - "0";
              m.selfMultiply(o.TEN), m.selfAdd(Z), E++;
            } else {
              if (q !== ".") {
                if (q === "e" || q === "E") {
                  var st = t.substring(e);
                  try {
                    R = wr.parseInt(st);
                  } catch (Wt) {
                    throw Wt instanceof NumberFormatException ? new NumberFormatException("Invalid exponent " + st + " in string " + t) : Wt;
                  }
                  break;
                }
                throw new NumberFormatException("Unexpected character '" + q + "' at position " + e + " in string " + t);
              }
              N = E, D = !0;
            }
          }
          var ut = m;
          D || (N = E);
          var gt = E - N - R;
          if (gt === 0) ut = m;
          else if (gt > 0) {
            var bt = o.TEN.pow(gt);
            ut = m.divide(bt);
          } else if (gt < 0) {
            var lt = o.TEN.pow(-gt);
            ut = m.multiply(lt);
          }
          return l ? ut.negate() : ut;
        } }, { key: "createNaN", value: function() {
          return new o(ht.NaN, ht.NaN);
        } }, { key: "copy", value: function(t) {
          return new o(t);
        } }, { key: "magnitude", value: function(t) {
          var e = Math.abs(t), s = Math.log(e) / Math.log(10), l = Math.trunc(Math.floor(s));
          return 10 * Math.pow(10, l) <= e && (l += 1), l;
        } }, { key: "stringOfChar", value: function(t, e) {
          for (var s = new Cn(), l = 0; l < e; l++) s.append(t);
          return s.toString();
        } }]);
      }();
      dt.PI = new dt(3.141592653589793, 12246467991473532e-32), dt.TWO_PI = new dt(6.283185307179586, 24492935982947064e-32), dt.PI_2 = new dt(1.5707963267948966, 6123233995736766e-32), dt.E = new dt(2.718281828459045, 14456468917292502e-32), dt.NaN = new dt(ht.NaN, ht.NaN), dt.EPS = 123259516440783e-46, dt.SPLIT = 134217729, dt.MAX_PRINT_DIGITS = 32, dt.TEN = dt.valueOf(10), dt.ONE = dt.valueOf(1), dt.SCI_NOT_EXPONENT_CHAR = "E", dt.SCI_NOT_ZERO = "0.0E0";
      var Vi = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "orientationIndex", value: function(t, e, s) {
          var l = o.orientationIndexFilter(t, e, s);
          if (l <= 1) return l;
          var _ = dt.valueOf(e.x).selfAdd(-t.x), m = dt.valueOf(e.y).selfAdd(-t.y), E = dt.valueOf(s.x).selfAdd(-e.x), N = dt.valueOf(s.y).selfAdd(-e.y);
          return _.selfMultiply(N).selfSubtract(m.selfMultiply(E)).signum();
        } }, { key: "signOfDet2x2", value: function() {
          if (arguments[3] instanceof dt && arguments[2] instanceof dt && arguments[0] instanceof dt && arguments[1] instanceof dt) {
            var t = arguments[1], e = arguments[2], s = arguments[3];
            return arguments[0].multiply(s).selfSubtract(t.multiply(e)).signum();
          }
          if (typeof arguments[3] == "number" && typeof arguments[2] == "number" && typeof arguments[0] == "number" && typeof arguments[1] == "number") {
            var l = arguments[0], _ = arguments[1], m = arguments[2], E = arguments[3], N = dt.valueOf(l), R = dt.valueOf(_), D = dt.valueOf(m), q = dt.valueOf(E);
            return N.multiply(q).selfSubtract(R.multiply(D)).signum();
          }
        } }, { key: "intersection", value: function(t, e, s, l) {
          var _ = new dt(t.y).selfSubtract(e.y), m = new dt(e.x).selfSubtract(t.x), E = new dt(t.x).selfMultiply(e.y).selfSubtract(new dt(e.x).selfMultiply(t.y)), N = new dt(s.y).selfSubtract(l.y), R = new dt(l.x).selfSubtract(s.x), D = new dt(s.x).selfMultiply(l.y).selfSubtract(new dt(l.x).selfMultiply(s.y)), q = m.multiply(D).selfSubtract(R.multiply(E)), Z = N.multiply(E).selfSubtract(_.multiply(D)), st = _.multiply(R).selfSubtract(N.multiply(m)), ut = q.selfDivide(st).doubleValue(), gt = Z.selfDivide(st).doubleValue();
          return ht.isNaN(ut) || ht.isInfinite(ut) || ht.isNaN(gt) || ht.isInfinite(gt) ? null : new U(ut, gt);
        } }, { key: "orientationIndexFilter", value: function(t, e, s) {
          var l = null, _ = (t.x - s.x) * (e.y - s.y), m = (t.y - s.y) * (e.x - s.x), E = _ - m;
          if (_ > 0) {
            if (m <= 0) return o.signum(E);
            l = _ + m;
          } else {
            if (!(_ < 0) || m >= 0) return o.signum(E);
            l = -_ - m;
          }
          var N = o.DP_SAFE_EPSILON * l;
          return E >= N || -E >= N ? o.signum(E) : 2;
        } }, { key: "signum", value: function(t) {
          return t > 0 ? 1 : t < 0 ? -1 : 0;
        } }]);
      }();
      Vi.DP_SAFE_EPSILON = 1e-15;
      var Tt = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "getM", value: function(o) {
          if (this.hasM()) {
            var t = this.getDimension() - this.getMeasures();
            return this.getOrdinate(o, t);
          }
          return ht.NaN;
        } }, { key: "setOrdinate", value: function(o, t, e) {
        } }, { key: "getZ", value: function(o) {
          return this.hasZ() ? this.getOrdinate(o, 2) : ht.NaN;
        } }, { key: "size", value: function() {
        } }, { key: "getOrdinate", value: function(o, t) {
        } }, { key: "getCoordinate", value: function() {
        } }, { key: "getCoordinateCopy", value: function(o) {
        } }, { key: "createCoordinate", value: function() {
        } }, { key: "getDimension", value: function() {
        } }, { key: "hasM", value: function() {
          return this.getMeasures() > 0;
        } }, { key: "getX", value: function(o) {
        } }, { key: "hasZ", value: function() {
          return this.getDimension() - this.getMeasures() > 2;
        } }, { key: "getMeasures", value: function() {
          return 0;
        } }, { key: "expandEnvelope", value: function(o) {
        } }, { key: "copy", value: function() {
        } }, { key: "getY", value: function(o) {
        } }, { key: "toCoordinateArray", value: function() {
        } }, { key: "interfaces_", get: function() {
          return [et];
        } }]);
      }();
      Tt.X = 0, Tt.Y = 1, Tt.Z = 2, Tt.M = 3;
      var pt = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "index", value: function(t, e, s) {
          return Vi.orientationIndex(t, e, s);
        } }, { key: "isCCW", value: function() {
          if (arguments[0] instanceof Array) {
            var t = arguments[0], e = t.length - 1;
            if (e < 3) throw new X("Ring has fewer than 4 points, so orientation cannot be determined");
            for (var s = t[0], l = 0, _ = 1; _ <= e; _++) {
              var m = t[_];
              m.y > s.y && (s = m, l = _);
            }
            var E = l;
            do
              (E -= 1) < 0 && (E = e);
            while (t[E].equals2D(s) && E !== l);
            var N = l;
            do
              N = (N + 1) % e;
            while (t[N].equals2D(s) && N !== l);
            var R = t[E], D = t[N];
            if (R.equals2D(s) || D.equals2D(s) || R.equals2D(D)) return !1;
            var q = o.index(R, s, D);
            return q === 0 ? R.x > D.x : q > 0;
          }
          if (wt(arguments[0], Tt)) {
            var Z = arguments[0], st = Z.size() - 1;
            if (st < 3) throw new X("Ring has fewer than 4 points, so orientation cannot be determined");
            for (var ut = Z.getCoordinate(0), gt = 0, bt = 1; bt <= st; bt++) {
              var lt = Z.getCoordinate(bt);
              lt.y > ut.y && (ut = lt, gt = bt);
            }
            var Wt = null, ce = gt;
            do
              (ce -= 1) < 0 && (ce = st), Wt = Z.getCoordinate(ce);
            while (Wt.equals2D(ut) && ce !== gt);
            var se = null, fi = gt;
            do
              fi = (fi + 1) % st, se = Z.getCoordinate(fi);
            while (se.equals2D(ut) && fi !== gt);
            if (Wt.equals2D(ut) || se.equals2D(ut) || Wt.equals2D(se)) return !1;
            var ir = o.index(Wt, ut, se);
            return ir === 0 ? Wt.x > se.x : ir > 0;
          }
        } }]);
      }();
      pt.CLOCKWISE = -1, pt.RIGHT = pt.CLOCKWISE, pt.COUNTERCLOCKWISE = 1, pt.LEFT = pt.COUNTERCLOCKWISE, pt.COLLINEAR = 0, pt.STRAIGHT = pt.COLLINEAR;
      var _s = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "getCoordinate", value: function() {
          return this._minCoord;
        } }, { key: "getRightmostSide", value: function(o, t) {
          var e = this.getRightmostSideOfSegment(o, t);
          return e < 0 && (e = this.getRightmostSideOfSegment(o, t - 1)), e < 0 && (this._minCoord = null, this.checkForRightmostCoordinate(o)), e;
        } }, { key: "findRightmostEdgeAtVertex", value: function() {
          var o = this._minDe.getEdge().getCoordinates();
          Nt.isTrue(this._minIndex > 0 && this._minIndex < o.length, "rightmost point expected to be interior vertex of edge");
          var t = o[this._minIndex - 1], e = o[this._minIndex + 1], s = pt.index(this._minCoord, e, t), l = !1;
          (t.y < this._minCoord.y && e.y < this._minCoord.y && s === pt.COUNTERCLOCKWISE || t.y > this._minCoord.y && e.y > this._minCoord.y && s === pt.CLOCKWISE) && (l = !0), l && (this._minIndex = this._minIndex - 1);
        } }, { key: "getRightmostSideOfSegment", value: function(o, t) {
          var e = o.getEdge().getCoordinates();
          if (t < 0 || t + 1 >= e.length || e[t].y === e[t + 1].y) return -1;
          var s = tt.LEFT;
          return e[t].y < e[t + 1].y && (s = tt.RIGHT), s;
        } }, { key: "getEdge", value: function() {
          return this._orientedDe;
        } }, { key: "checkForRightmostCoordinate", value: function(o) {
          for (var t = o.getEdge().getCoordinates(), e = 0; e < t.length - 1; e++) (this._minCoord === null || t[e].x > this._minCoord.x) && (this._minDe = o, this._minIndex = e, this._minCoord = t[e]);
        } }, { key: "findRightmostEdgeAtNode", value: function() {
          var o = this._minDe.getNode().getEdges();
          this._minDe = o.getRightmostEdge(), this._minDe.isForward() || (this._minDe = this._minDe.getSym(), this._minIndex = this._minDe.getEdge().getCoordinates().length - 1);
        } }, { key: "findEdge", value: function(o) {
          for (var t = o.iterator(); t.hasNext(); ) {
            var e = t.next();
            e.isForward() && this.checkForRightmostCoordinate(e);
          }
          Nt.isTrue(this._minIndex !== 0 || this._minCoord.equals(this._minDe.getCoordinate()), "inconsistency in rightmost processing"), this._minIndex === 0 ? this.findRightmostEdgeAtNode() : this.findRightmostEdgeAtVertex(), this._orientedDe = this._minDe, this.getRightmostSide(this._minDe, this._minIndex) === tt.LEFT && (this._orientedDe = this._minDe.getSym());
        } }], [{ key: "constructor_", value: function() {
          this._minIndex = -1, this._minCoord = null, this._minDe = null, this._orientedDe = null;
        } }]);
      }(), an = function(o) {
        function t(e, s) {
          var l;
          return f(this, t), (l = h(this, t, [s ? e + " [ " + s + " ]" : e])).pt = s ? new U(s) : void 0, l.name = Object.keys({ TopologyException: t })[0], l;
        }
        return x(t, o), g(t, [{ key: "getCoordinate", value: function() {
          return this.pt;
        } }]);
      }(le), ds = function() {
        return g(function o() {
          f(this, o), this.array = [];
        }, [{ key: "addLast", value: function(o) {
          this.array.push(o);
        } }, { key: "removeFirst", value: function() {
          return this.array.shift();
        } }, { key: "isEmpty", value: function() {
          return this.array.length === 0;
        } }]);
      }(), mt = function(o) {
        function t(e) {
          var s;
          return f(this, t), (s = h(this, t)).array = [], e instanceof nn && s.addAll(e), s;
        }
        return x(t, o), g(t, [{ key: "interfaces_", get: function() {
          return [sn, nn];
        } }, { key: "ensureCapacity", value: function() {
        } }, { key: "add", value: function(e) {
          return arguments.length === 1 ? this.array.push(e) : this.array.splice(arguments[0], 0, arguments[1]), !0;
        } }, { key: "clear", value: function() {
          this.array = [];
        } }, { key: "addAll", value: function(e) {
          var s, l = p(e);
          try {
            for (l.s(); !(s = l.n()).done; ) {
              var _ = s.value;
              this.array.push(_);
            }
          } catch (m) {
            l.e(m);
          } finally {
            l.f();
          }
        } }, { key: "set", value: function(e, s) {
          var l = this.array[e];
          return this.array[e] = s, l;
        } }, { key: "iterator", value: function() {
          return new ms(this);
        } }, { key: "get", value: function(e) {
          if (e < 0 || e >= this.size()) throw new Be();
          return this.array[e];
        } }, { key: "isEmpty", value: function() {
          return this.array.length === 0;
        } }, { key: "sort", value: function(e) {
          e ? this.array.sort(function(s, l) {
            return e.compare(s, l);
          }) : this.array.sort();
        } }, { key: "size", value: function() {
          return this.array.length;
        } }, { key: "toArray", value: function() {
          return this.array.slice();
        } }, { key: "remove", value: function(e) {
          for (var s = 0, l = this.array.length; s < l; s++) if (this.array[s] === e) return !!this.array.splice(s, 1);
          return !1;
        } }, { key: Symbol.iterator, value: function() {
          return this.array.values();
        } }]);
      }(sn), ms = function() {
        return g(function o(t) {
          f(this, o), this.arrayList = t, this.position = 0;
        }, [{ key: "next", value: function() {
          if (this.position === this.arrayList.size()) throw new Se();
          return this.arrayList.get(this.position++);
        } }, { key: "hasNext", value: function() {
          return this.position < this.arrayList.size();
        } }, { key: "set", value: function(o) {
          return this.arrayList.set(this.position - 1, o);
        } }, { key: "remove", value: function() {
          this.arrayList.remove(this.arrayList.get(this.position));
        } }]);
      }(), ys = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "clearVisitedEdges", value: function() {
          for (var o = this._dirEdgeList.iterator(); o.hasNext(); )
            o.next().setVisited(!1);
        } }, { key: "getRightmostCoordinate", value: function() {
          return this._rightMostCoord;
        } }, { key: "computeNodeDepth", value: function(o) {
          for (var t = null, e = o.getEdges().iterator(); e.hasNext(); ) {
            var s = e.next();
            if (s.isVisited() || s.getSym().isVisited()) {
              t = s;
              break;
            }
          }
          if (t === null) throw new an("unable to find edge to compute depths at " + o.getCoordinate());
          o.getEdges().computeDepths(t);
          for (var l = o.getEdges().iterator(); l.hasNext(); ) {
            var _ = l.next();
            _.setVisited(!0), this.copySymDepths(_);
          }
        } }, { key: "computeDepth", value: function(o) {
          this.clearVisitedEdges();
          var t = this._finder.getEdge();
          t.getNode(), t.getLabel(), t.setEdgeDepths(tt.RIGHT, o), this.copySymDepths(t), this.computeDepths(t);
        } }, { key: "create", value: function(o) {
          this.addReachable(o), this._finder.findEdge(this._dirEdgeList), this._rightMostCoord = this._finder.getCoordinate();
        } }, { key: "findResultEdges", value: function() {
          for (var o = this._dirEdgeList.iterator(); o.hasNext(); ) {
            var t = o.next();
            t.getDepth(tt.RIGHT) >= 1 && t.getDepth(tt.LEFT) <= 0 && !t.isInteriorAreaEdge() && t.setInResult(!0);
          }
        } }, { key: "computeDepths", value: function(o) {
          var t = new rn(), e = new ds(), s = o.getNode();
          for (e.addLast(s), t.add(s), o.setVisited(!0); !e.isEmpty(); ) {
            var l = e.removeFirst();
            t.add(l), this.computeNodeDepth(l);
            for (var _ = l.getEdges().iterator(); _.hasNext(); ) {
              var m = _.next().getSym();
              if (!m.isVisited()) {
                var E = m.getNode();
                t.contains(E) || (e.addLast(E), t.add(E));
              }
            }
          }
        } }, { key: "compareTo", value: function(o) {
          var t = o;
          return this._rightMostCoord.x < t._rightMostCoord.x ? -1 : this._rightMostCoord.x > t._rightMostCoord.x ? 1 : 0;
        } }, { key: "getEnvelope", value: function() {
          if (this._env === null) {
            for (var o = new Ht(), t = this._dirEdgeList.iterator(); t.hasNext(); ) for (var e = t.next().getEdge().getCoordinates(), s = 0; s < e.length - 1; s++) o.expandToInclude(e[s]);
            this._env = o;
          }
          return this._env;
        } }, { key: "addReachable", value: function(o) {
          var t = new Mr();
          for (t.add(o); !t.empty(); ) {
            var e = t.pop();
            this.add(e, t);
          }
        } }, { key: "copySymDepths", value: function(o) {
          var t = o.getSym();
          t.setDepth(tt.LEFT, o.getDepth(tt.RIGHT)), t.setDepth(tt.RIGHT, o.getDepth(tt.LEFT));
        } }, { key: "add", value: function(o, t) {
          o.setVisited(!0), this._nodes.add(o);
          for (var e = o.getEdges().iterator(); e.hasNext(); ) {
            var s = e.next();
            this._dirEdgeList.add(s);
            var l = s.getSym().getNode();
            l.isVisited() || t.push(l);
          }
        } }, { key: "getNodes", value: function() {
          return this._nodes;
        } }, { key: "getDirectedEdges", value: function() {
          return this._dirEdgeList;
        } }, { key: "interfaces_", get: function() {
          return [K];
        } }], [{ key: "constructor_", value: function() {
          this._finder = null, this._dirEdgeList = new mt(), this._nodes = new mt(), this._rightMostCoord = null, this._env = null, this._finder = new _s();
        } }]);
      }(), ps = function() {
        return g(function o() {
          f(this, o);
        }, null, [{ key: "intersection", value: function(o, t, e, s) {
          var l = o.x < t.x ? o.x : t.x, _ = o.y < t.y ? o.y : t.y, m = o.x > t.x ? o.x : t.x, E = o.y > t.y ? o.y : t.y, N = e.x < s.x ? e.x : s.x, R = e.y < s.y ? e.y : s.y, D = e.x > s.x ? e.x : s.x, q = e.y > s.y ? e.y : s.y, Z = ((l > N ? l : N) + (m < D ? m : D)) / 2, st = ((_ > R ? _ : R) + (E < q ? E : q)) / 2, ut = o.x - Z, gt = o.y - st, bt = t.x - Z, lt = t.y - st, Wt = e.x - Z, ce = e.y - st, se = s.x - Z, fi = s.y - st, ir = gt - lt, xo = bt - ut, rr = ut * lt - bt * gt, An = ce - fi, sr = se - Wt, Qs = Wt * fi - se * ce, ar = ir * sr - An * xo, qr = (xo * Qs - sr * rr) / ar, Br = (An * rr - ir * Qs) / ar;
          return ht.isNaN(qr) || ht.isInfinite(qr) || ht.isNaN(Br) || ht.isInfinite(Br) ? null : new U(qr + Z, Br + st);
        } }]);
      }(), Ue = function() {
        return g(function o() {
          f(this, o);
        }, null, [{ key: "arraycopy", value: function(o, t, e, s, l) {
          for (var _ = 0, m = t; m < t + l; m++) e[s + _] = o[m], _++;
        } }, { key: "getProperty", value: function(o) {
          return { "line.separator": `
` }[o];
        } }]);
      }(), Zi = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "log10", value: function(t) {
          var e = Math.log(t);
          return ht.isInfinite(e) || ht.isNaN(e) ? e : e / o.LOG_10;
        } }, { key: "min", value: function(t, e, s, l) {
          var _ = t;
          return e < _ && (_ = e), s < _ && (_ = s), l < _ && (_ = l), _;
        } }, { key: "clamp", value: function() {
          if (typeof arguments[2] == "number" && typeof arguments[0] == "number" && typeof arguments[1] == "number") {
            var t = arguments[0], e = arguments[1], s = arguments[2];
            return t < e ? e : t > s ? s : t;
          }
          if (Number.isInteger(arguments[2]) && Number.isInteger(arguments[0]) && Number.isInteger(arguments[1])) {
            var l = arguments[0], _ = arguments[1], m = arguments[2];
            return l < _ ? _ : l > m ? m : l;
          }
        } }, { key: "wrap", value: function(t, e) {
          return t < 0 ? e - -t % e : t % e;
        } }, { key: "max", value: function() {
          if (arguments.length === 3) {
            var t = arguments[1], e = arguments[2], s = arguments[0];
            return t > s && (s = t), e > s && (s = e), s;
          }
          if (arguments.length === 4) {
            var l = arguments[1], _ = arguments[2], m = arguments[3], E = arguments[0];
            return l > E && (E = l), _ > E && (E = _), m > E && (E = m), E;
          }
        } }, { key: "average", value: function(t, e) {
          return (t + e) / 2;
        } }]);
      }();
      Zi.LOG_10 = Math.log(10);
      var on = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "segmentToSegment", value: function(t, e, s, l) {
          if (t.equals(e)) return o.pointToSegment(t, s, l);
          if (s.equals(l)) return o.pointToSegment(l, t, e);
          var _ = !1;
          if (Ht.intersects(t, e, s, l)) {
            var m = (e.x - t.x) * (l.y - s.y) - (e.y - t.y) * (l.x - s.x);
            if (m === 0) _ = !0;
            else {
              var E = (t.y - s.y) * (l.x - s.x) - (t.x - s.x) * (l.y - s.y), N = ((t.y - s.y) * (e.x - t.x) - (t.x - s.x) * (e.y - t.y)) / m, R = E / m;
              (R < 0 || R > 1 || N < 0 || N > 1) && (_ = !0);
            }
          } else _ = !0;
          return _ ? Zi.min(o.pointToSegment(t, s, l), o.pointToSegment(e, s, l), o.pointToSegment(s, t, e), o.pointToSegment(l, t, e)) : 0;
        } }, { key: "pointToSegment", value: function(t, e, s) {
          if (e.x === s.x && e.y === s.y) return t.distance(e);
          var l = (s.x - e.x) * (s.x - e.x) + (s.y - e.y) * (s.y - e.y), _ = ((t.x - e.x) * (s.x - e.x) + (t.y - e.y) * (s.y - e.y)) / l;
          if (_ <= 0) return t.distance(e);
          if (_ >= 1) return t.distance(s);
          var m = ((e.y - t.y) * (s.x - e.x) - (e.x - t.x) * (s.y - e.y)) / l;
          return Math.abs(m) * Math.sqrt(l);
        } }, { key: "pointToLinePerpendicular", value: function(t, e, s) {
          var l = (s.x - e.x) * (s.x - e.x) + (s.y - e.y) * (s.y - e.y), _ = ((e.y - t.y) * (s.x - e.x) - (e.x - t.x) * (s.y - e.y)) / l;
          return Math.abs(_) * Math.sqrt(l);
        } }, { key: "pointToSegmentString", value: function(t, e) {
          if (e.length === 0) throw new X("Line array must contain at least one vertex");
          for (var s = t.distance(e[0]), l = 0; l < e.length - 1; l++) {
            var _ = o.pointToSegment(t, e[l], e[l + 1]);
            _ < s && (s = _);
          }
          return s;
        } }]);
      }(), Es = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "create", value: function() {
          if (arguments.length === 1) arguments[0] instanceof Array || wt(arguments[0], Tt);
          else if (arguments.length !== 2) {
            if (arguments.length === 3) {
              var o = arguments[0], t = arguments[1];
              return this.create(o, t);
            }
          }
        } }]);
      }(), Sr = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "filter", value: function(o) {
        } }]);
      }(), Gu = function() {
        return g(function o() {
          f(this, o);
        }, null, [{ key: "ofLine", value: function(o) {
          var t = o.size();
          if (t <= 1) return 0;
          var e = 0, s = new U();
          o.getCoordinate(0, s);
          for (var l = s.x, _ = s.y, m = 1; m < t; m++) {
            o.getCoordinate(m, s);
            var E = s.x, N = s.y, R = E - l, D = N - _;
            e += Math.sqrt(R * R + D * D), l = E, _ = N;
          }
          return e;
        } }]);
      }(), Xa = g(function o() {
        f(this, o);
      }), ti = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "copyCoord", value: function(t, e, s, l) {
          for (var _ = Math.min(t.getDimension(), s.getDimension()), m = 0; m < _; m++) s.setOrdinate(l, m, t.getOrdinate(e, m));
        } }, { key: "isRing", value: function(t) {
          var e = t.size();
          return e === 0 || !(e <= 3) && t.getOrdinate(0, Tt.X) === t.getOrdinate(e - 1, Tt.X) && t.getOrdinate(0, Tt.Y) === t.getOrdinate(e - 1, Tt.Y);
        } }, { key: "scroll", value: function() {
          if (arguments.length === 2) {
            if (wt(arguments[0], Tt) && Number.isInteger(arguments[1])) {
              var t = arguments[0], e = arguments[1];
              o.scroll(t, e, o.isRing(t));
            } else if (wt(arguments[0], Tt) && arguments[1] instanceof U) {
              var s = arguments[0], l = arguments[1], _ = o.indexOf(l, s);
              if (_ <= 0) return null;
              o.scroll(s, _);
            }
          } else if (arguments.length === 3) {
            var m = arguments[0], E = arguments[1], N = arguments[2];
            if (E <= 0) return null;
            for (var R = m.copy(), D = N ? m.size() - 1 : m.size(), q = 0; q < D; q++) for (var Z = 0; Z < m.getDimension(); Z++) m.setOrdinate(q, Z, R.getOrdinate((E + q) % D, Z));
            if (N) for (var st = 0; st < m.getDimension(); st++) m.setOrdinate(D, st, m.getOrdinate(0, st));
          }
        } }, { key: "isEqual", value: function(t, e) {
          var s = t.size();
          if (s !== e.size()) return !1;
          for (var l = Math.min(t.getDimension(), e.getDimension()), _ = 0; _ < s; _++) for (var m = 0; m < l; m++) {
            var E = t.getOrdinate(_, m), N = e.getOrdinate(_, m);
            if (t.getOrdinate(_, m) !== e.getOrdinate(_, m) && (!ht.isNaN(E) || !ht.isNaN(N))) return !1;
          }
          return !0;
        } }, { key: "minCoordinateIndex", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return o.minCoordinateIndex(t, 0, t.size() - 1);
          }
          if (arguments.length === 3) {
            for (var e = arguments[0], s = arguments[2], l = -1, _ = null, m = arguments[1]; m <= s; m++) {
              var E = e.getCoordinate(m);
              (_ === null || _.compareTo(E) > 0) && (_ = E, l = m);
            }
            return l;
          }
        } }, { key: "extend", value: function(t, e, s) {
          var l = t.create(s, e.getDimension()), _ = e.size();
          if (o.copy(e, 0, l, 0, _), _ > 0) for (var m = _; m < s; m++) o.copy(e, _ - 1, l, m, 1);
          return l;
        } }, { key: "reverse", value: function(t) {
          for (var e = t.size() - 1, s = Math.trunc(e / 2), l = 0; l <= s; l++) o.swap(t, l, e - l);
        } }, { key: "swap", value: function(t, e, s) {
          if (e === s) return null;
          for (var l = 0; l < t.getDimension(); l++) {
            var _ = t.getOrdinate(e, l);
            t.setOrdinate(e, l, t.getOrdinate(s, l)), t.setOrdinate(s, l, _);
          }
        } }, { key: "copy", value: function(t, e, s, l, _) {
          for (var m = 0; m < _; m++) o.copyCoord(t, e + m, s, l + m);
        } }, { key: "ensureValidRing", value: function(t, e) {
          var s = e.size();
          return s === 0 ? e : s <= 3 ? o.createClosedRing(t, e, 4) : e.getOrdinate(0, Tt.X) === e.getOrdinate(s - 1, Tt.X) && e.getOrdinate(0, Tt.Y) === e.getOrdinate(s - 1, Tt.Y) ? e : o.createClosedRing(t, e, s + 1);
        } }, { key: "indexOf", value: function(t, e) {
          for (var s = 0; s < e.size(); s++) if (t.x === e.getOrdinate(s, Tt.X) && t.y === e.getOrdinate(s, Tt.Y)) return s;
          return -1;
        } }, { key: "createClosedRing", value: function(t, e, s) {
          var l = t.create(s, e.getDimension()), _ = e.size();
          o.copy(e, 0, l, 0, _);
          for (var m = _; m < s; m++) o.copy(e, 0, l, m, 1);
          return l;
        } }, { key: "minCoordinate", value: function(t) {
          for (var e = null, s = 0; s < t.size(); s++) {
            var l = t.getCoordinate(s);
            (e === null || e.compareTo(l) > 0) && (e = l);
          }
          return e;
        } }]);
      }(), nt = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "toDimensionSymbol", value: function(t) {
          switch (t) {
            case o.FALSE:
              return o.SYM_FALSE;
            case o.TRUE:
              return o.SYM_TRUE;
            case o.DONTCARE:
              return o.SYM_DONTCARE;
            case o.P:
              return o.SYM_P;
            case o.L:
              return o.SYM_L;
            case o.A:
              return o.SYM_A;
          }
          throw new X("Unknown dimension value: " + t);
        } }, { key: "toDimensionValue", value: function(t) {
          switch (jn.toUpperCase(t)) {
            case o.SYM_FALSE:
              return o.FALSE;
            case o.SYM_TRUE:
              return o.TRUE;
            case o.SYM_DONTCARE:
              return o.DONTCARE;
            case o.SYM_P:
              return o.P;
            case o.SYM_L:
              return o.L;
            case o.SYM_A:
              return o.A;
          }
          throw new X("Unknown dimension symbol: " + t);
        } }]);
      }();
      nt.P = 0, nt.L = 1, nt.A = 2, nt.FALSE = -1, nt.TRUE = -2, nt.DONTCARE = -3, nt.SYM_FALSE = "F", nt.SYM_TRUE = "T", nt.SYM_DONTCARE = "*", nt.SYM_P = "0", nt.SYM_L = "1", nt.SYM_A = "2";
      var Ir = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "filter", value: function(o) {
        } }]);
      }(), Nr = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "filter", value: function(o, t) {
        } }, { key: "isDone", value: function() {
        } }, { key: "isGeometryChanged", value: function() {
        } }]);
      }(), Ki = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "computeEnvelopeInternal", value: function() {
          return this.isEmpty() ? new Ht() : this._points.expandEnvelope(new Ht());
        } }, { key: "isRing", value: function() {
          return this.isClosed() && this.isSimple();
        } }, { key: "getCoordinates", value: function() {
          return this._points.toCoordinateArray();
        } }, { key: "copyInternal", value: function() {
          return new t(this._points.copy(), this._factory);
        } }, { key: "equalsExact", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "number" && arguments[0] instanceof ft) {
            var e = arguments[0], s = arguments[1];
            if (!this.isEquivalentClass(e)) return !1;
            var l = e;
            if (this._points.size() !== l._points.size()) return !1;
            for (var _ = 0; _ < this._points.size(); _++) if (!this.equal(this._points.getCoordinate(_), l._points.getCoordinate(_), s)) return !1;
            return !0;
          }
          return C(t, "equalsExact", this, 1).apply(this, arguments);
        } }, { key: "normalize", value: function() {
          for (var e = 0; e < Math.trunc(this._points.size() / 2); e++) {
            var s = this._points.size() - 1 - e;
            if (!this._points.getCoordinate(e).equals(this._points.getCoordinate(s))) {
              if (this._points.getCoordinate(e).compareTo(this._points.getCoordinate(s)) > 0) {
                var l = this._points.copy();
                ti.reverse(l), this._points = l;
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
          return ti.reverse(e), this.getFactory().createLineString(e);
        } }, { key: "getEndPoint", value: function() {
          return this.isEmpty() ? null : this.getPointN(this.getNumPoints() - 1);
        } }, { key: "getTypeCode", value: function() {
          return ft.TYPECODE_LINESTRING;
        } }, { key: "getDimension", value: function() {
          return 1;
        } }, { key: "getLength", value: function() {
          return Gu.ofLine(this._points);
        } }, { key: "getNumPoints", value: function() {
          return this._points.size();
        } }, { key: "compareToSameClass", value: function() {
          if (arguments.length === 1) {
            for (var e = arguments[0], s = 0, l = 0; s < this._points.size() && l < e._points.size(); ) {
              var _ = this._points.getCoordinate(s).compareTo(e._points.getCoordinate(l));
              if (_ !== 0) return _;
              s++, l++;
            }
            return s < this._points.size() ? 1 : l < e._points.size() ? -1 : 0;
          }
          if (arguments.length === 2) {
            var m = arguments[0];
            return arguments[1].compare(this._points, m._points);
          }
        } }, { key: "apply", value: function() {
          if (wt(arguments[0], Sr)) for (var e = arguments[0], s = 0; s < this._points.size(); s++) e.filter(this._points.getCoordinate(s));
          else if (wt(arguments[0], Nr)) {
            var l = arguments[0];
            if (this._points.size() === 0) return null;
            for (var _ = 0; _ < this._points.size() && (l.filter(this._points, _), !l.isDone()); _++) ;
            l.isGeometryChanged() && this.geometryChanged();
          } else wt(arguments[0], Ir) ? arguments[0].filter(this) : wt(arguments[0], V) && arguments[0].filter(this);
        } }, { key: "getBoundary", value: function() {
          throw new qe();
        } }, { key: "isEquivalentClass", value: function(e) {
          return e instanceof t;
        } }, { key: "getCoordinateN", value: function(e) {
          return this._points.getCoordinate(e);
        } }, { key: "getGeometryType", value: function() {
          return ft.TYPENAME_LINESTRING;
        } }, { key: "getCoordinateSequence", value: function() {
          return this._points;
        } }, { key: "isEmpty", value: function() {
          return this._points.size() === 0;
        } }, { key: "init", value: function(e) {
          if (e === null && (e = this.getFactory().getCoordinateSequenceFactory().create([])), e.size() === 1) throw new X("Invalid number of points in LineString (found " + e.size() + " - must be 0 or >= 2)");
          this._points = e;
        } }, { key: "isCoordinate", value: function(e) {
          for (var s = 0; s < this._points.size(); s++) if (this._points.getCoordinate(s).equals(e)) return !0;
          return !1;
        } }, { key: "getStartPoint", value: function() {
          return this.isEmpty() ? null : this.getPointN(0);
        } }, { key: "getPointN", value: function(e) {
          return this.getFactory().createPoint(this._points.getCoordinate(e));
        } }, { key: "interfaces_", get: function() {
          return [Xa];
        } }], [{ key: "constructor_", value: function() {
          if (this._points = null, arguments.length !== 0) {
            if (arguments.length === 2) {
              var e = arguments[0], s = arguments[1];
              ft.constructor_.call(this, s), this.init(e);
            }
          }
        } }]);
      }(ft), kr = g(function o() {
        f(this, o);
      }), xs = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "computeEnvelopeInternal", value: function() {
          if (this.isEmpty()) return new Ht();
          var e = new Ht();
          return e.expandToInclude(this._coordinates.getX(0), this._coordinates.getY(0)), e;
        } }, { key: "getCoordinates", value: function() {
          return this.isEmpty() ? [] : [this.getCoordinate()];
        } }, { key: "copyInternal", value: function() {
          return new t(this._coordinates.copy(), this._factory);
        } }, { key: "equalsExact", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "number" && arguments[0] instanceof ft) {
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
          return ft.TYPECODE_POINT;
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
          if (wt(arguments[0], Sr)) {
            var e = arguments[0];
            if (this.isEmpty()) return null;
            e.filter(this.getCoordinate());
          } else if (wt(arguments[0], Nr)) {
            var s = arguments[0];
            if (this.isEmpty()) return null;
            s.filter(this._coordinates, 0), s.isGeometryChanged() && this.geometryChanged();
          } else wt(arguments[0], Ir) ? arguments[0].filter(this) : wt(arguments[0], V) && arguments[0].filter(this);
        } }, { key: "getBoundary", value: function() {
          return this.getFactory().createGeometryCollection();
        } }, { key: "getGeometryType", value: function() {
          return ft.TYPENAME_POINT;
        } }, { key: "getCoordinateSequence", value: function() {
          return this._coordinates;
        } }, { key: "getY", value: function() {
          if (this.getCoordinate() === null) throw new IllegalStateException("getY called on empty Point");
          return this.getCoordinate().y;
        } }, { key: "isEmpty", value: function() {
          return this._coordinates.size() === 0;
        } }, { key: "init", value: function(e) {
          e === null && (e = this.getFactory().getCoordinateSequenceFactory().create([])), Nt.isTrue(e.size() <= 1), this._coordinates = e;
        } }, { key: "isSimple", value: function() {
          return !0;
        } }, { key: "interfaces_", get: function() {
          return [kr];
        } }], [{ key: "constructor_", value: function() {
          this._coordinates = null;
          var e = arguments[0], s = arguments[1];
          ft.constructor_.call(this, s), this.init(e);
        } }]);
      }(ft), Pr = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "ofRing", value: function() {
          if (arguments[0] instanceof Array) {
            var t = arguments[0];
            return Math.abs(o.ofRingSigned(t));
          }
          if (wt(arguments[0], Tt)) {
            var e = arguments[0];
            return Math.abs(o.ofRingSigned(e));
          }
        } }, { key: "ofRingSigned", value: function() {
          if (arguments[0] instanceof Array) {
            var t = arguments[0];
            if (t.length < 3) return 0;
            for (var e = 0, s = t[0].x, l = 1; l < t.length - 1; l++) {
              var _ = t[l].x - s, m = t[l + 1].y;
              e += _ * (t[l - 1].y - m);
            }
            return e / 2;
          }
          if (wt(arguments[0], Tt)) {
            var E = arguments[0], N = E.size();
            if (N < 3) return 0;
            var R = new U(), D = new U(), q = new U();
            E.getCoordinate(0, D), E.getCoordinate(1, q);
            var Z = D.x;
            q.x -= Z;
            for (var st = 0, ut = 1; ut < N - 1; ut++) R.y = D.y, D.x = q.x, D.y = q.y, E.getCoordinate(ut + 1, q), q.x -= Z, st += D.x * (R.y - q.y);
            return st / 2;
          }
        } }]);
      }(), ei = function() {
        return g(function o() {
          f(this, o);
        }, null, [{ key: "sort", value: function() {
          var o = arguments, t = arguments[0];
          if (arguments.length === 1) t.sort(function(Z, st) {
            return Z.compareTo(st);
          });
          else if (arguments.length === 2) t.sort(function(Z, st) {
            return o[1].compare(Z, st);
          });
          else if (arguments.length === 3) {
            var e = t.slice(arguments[1], arguments[2]);
            e.sort();
            var s = t.slice(0, arguments[1]).concat(e, t.slice(arguments[2], t.length));
            t.splice(0, t.length);
            var l, _ = p(s);
            try {
              for (_.s(); !(l = _.n()).done; ) {
                var m = l.value;
                t.push(m);
              }
            } catch (Z) {
              _.e(Z);
            } finally {
              _.f();
            }
          } else if (arguments.length === 4) {
            var E = t.slice(arguments[1], arguments[2]);
            E.sort(function(Z, st) {
              return o[3].compare(Z, st);
            });
            var N = t.slice(0, arguments[1]).concat(E, t.slice(arguments[2], t.length));
            t.splice(0, t.length);
            var R, D = p(N);
            try {
              for (D.s(); !(R = D.n()).done; ) {
                var q = R.value;
                t.push(q);
              }
            } catch (Z) {
              D.e(Z);
            } finally {
              D.f();
            }
          }
        } }, { key: "asList", value: function(o) {
          var t, e = new mt(), s = p(o);
          try {
            for (s.s(); !(t = s.n()).done; ) {
              var l = t.value;
              e.add(l);
            }
          } catch (_) {
            s.e(_);
          } finally {
            s.f();
          }
          return e;
        } }, { key: "copyOf", value: function(o, t) {
          return o.slice(0, t);
        } }]);
      }(), Wa = g(function o() {
        f(this, o);
      }), Cr = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "computeEnvelopeInternal", value: function() {
          return this._shell.getEnvelopeInternal();
        } }, { key: "getCoordinates", value: function() {
          if (this.isEmpty()) return [];
          for (var e = new Array(this.getNumPoints()).fill(null), s = -1, l = this._shell.getCoordinates(), _ = 0; _ < l.length; _++) e[++s] = l[_];
          for (var m = 0; m < this._holes.length; m++) for (var E = this._holes[m].getCoordinates(), N = 0; N < E.length; N++) e[++s] = E[N];
          return e;
        } }, { key: "getArea", value: function() {
          var e = 0;
          e += Pr.ofRing(this._shell.getCoordinateSequence());
          for (var s = 0; s < this._holes.length; s++) e -= Pr.ofRing(this._holes[s].getCoordinateSequence());
          return e;
        } }, { key: "copyInternal", value: function() {
          for (var e = this._shell.copy(), s = new Array(this._holes.length).fill(null), l = 0; l < this._holes.length; l++) s[l] = this._holes[l].copy();
          return new t(e, s, this._factory);
        } }, { key: "isRectangle", value: function() {
          if (this.getNumInteriorRing() !== 0 || this._shell === null || this._shell.getNumPoints() !== 5) return !1;
          for (var e = this._shell.getCoordinateSequence(), s = this.getEnvelopeInternal(), l = 0; l < 5; l++) {
            var _ = e.getX(l);
            if (_ !== s.getMinX() && _ !== s.getMaxX()) return !1;
            var m = e.getY(l);
            if (m !== s.getMinY() && m !== s.getMaxY()) return !1;
          }
          for (var E = e.getX(0), N = e.getY(0), R = 1; R <= 4; R++) {
            var D = e.getX(R), q = e.getY(R);
            if (D !== E == (q !== N)) return !1;
            E = D, N = q;
          }
          return !0;
        } }, { key: "equalsExact", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "number" && arguments[0] instanceof ft) {
            var e = arguments[0], s = arguments[1];
            if (!this.isEquivalentClass(e)) return !1;
            var l = e, _ = this._shell, m = l._shell;
            if (!_.equalsExact(m, s) || this._holes.length !== l._holes.length) return !1;
            for (var E = 0; E < this._holes.length; E++) if (!this._holes[E].equalsExact(l._holes[E], s)) return !1;
            return !0;
          }
          return C(t, "equalsExact", this, 1).apply(this, arguments);
        } }, { key: "normalize", value: function() {
          if (arguments.length === 0) {
            this._shell = this.normalized(this._shell, !0);
            for (var e = 0; e < this._holes.length; e++) this._holes[e] = this.normalized(this._holes[e], !1);
            ei.sort(this._holes);
          } else if (arguments.length === 2) {
            var s = arguments[0], l = arguments[1];
            if (s.isEmpty()) return null;
            var _ = s.getCoordinateSequence(), m = ti.minCoordinateIndex(_, 0, _.size() - 2);
            ti.scroll(_, m, !0), pt.isCCW(_) === l && ti.reverse(_);
          }
        } }, { key: "getCoordinate", value: function() {
          return this._shell.getCoordinate();
        } }, { key: "getNumInteriorRing", value: function() {
          return this._holes.length;
        } }, { key: "getBoundaryDimension", value: function() {
          return 1;
        } }, { key: "reverseInternal", value: function() {
          for (var e = this.getExteriorRing().reverse(), s = new Array(this.getNumInteriorRing()).fill(null), l = 0; l < s.length; l++) s[l] = this.getInteriorRingN(l).reverse();
          return this.getFactory().createPolygon(e, s);
        } }, { key: "getTypeCode", value: function() {
          return ft.TYPECODE_POLYGON;
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
          var l = e.copy();
          return this.normalize(l, s), l;
        } }, { key: "compareToSameClass", value: function() {
          if (arguments.length === 1) {
            var e = arguments[0], s = this._shell, l = e._shell;
            return s.compareToSameClass(l);
          }
          if (arguments.length === 2) {
            var _ = arguments[1], m = arguments[0], E = this._shell, N = m._shell, R = E.compareToSameClass(N, _);
            if (R !== 0) return R;
            for (var D = this.getNumInteriorRing(), q = m.getNumInteriorRing(), Z = 0; Z < D && Z < q; ) {
              var st = this.getInteriorRingN(Z), ut = m.getInteriorRingN(Z), gt = st.compareToSameClass(ut, _);
              if (gt !== 0) return gt;
              Z++;
            }
            return Z < D ? 1 : Z < q ? -1 : 0;
          }
        } }, { key: "apply", value: function() {
          if (wt(arguments[0], Sr)) {
            var e = arguments[0];
            this._shell.apply(e);
            for (var s = 0; s < this._holes.length; s++) this._holes[s].apply(e);
          } else if (wt(arguments[0], Nr)) {
            var l = arguments[0];
            if (this._shell.apply(l), !l.isDone()) for (var _ = 0; _ < this._holes.length && (this._holes[_].apply(l), !l.isDone()); _++) ;
            l.isGeometryChanged() && this.geometryChanged();
          } else if (wt(arguments[0], Ir))
            arguments[0].filter(this);
          else if (wt(arguments[0], V)) {
            var m = arguments[0];
            m.filter(this), this._shell.apply(m);
            for (var E = 0; E < this._holes.length; E++) this._holes[E].apply(m);
          }
        } }, { key: "getBoundary", value: function() {
          if (this.isEmpty()) return this.getFactory().createMultiLineString();
          var e = new Array(this._holes.length + 1).fill(null);
          e[0] = this._shell;
          for (var s = 0; s < this._holes.length; s++) e[s + 1] = this._holes[s];
          return e.length <= 1 ? this.getFactory().createLinearRing(e[0].getCoordinateSequence()) : this.getFactory().createMultiLineString(e);
        } }, { key: "getGeometryType", value: function() {
          return ft.TYPENAME_POLYGON;
        } }, { key: "getExteriorRing", value: function() {
          return this._shell;
        } }, { key: "isEmpty", value: function() {
          return this._shell.isEmpty();
        } }, { key: "getInteriorRingN", value: function(e) {
          return this._holes[e];
        } }, { key: "interfaces_", get: function() {
          return [Wa];
        } }], [{ key: "constructor_", value: function() {
          this._shell = null, this._holes = null;
          var e = arguments[0], s = arguments[1], l = arguments[2];
          if (ft.constructor_.call(this, l), e === null && (e = this.getFactory().createLinearRing()), s === null && (s = []), ft.hasNullElements(s)) throw new X("holes must not contain null elements");
          if (e.isEmpty() && ft.hasNonEmptyElements(s)) throw new X("shell is empty but holes are not");
          this._shell = e, this._holes = s;
        } }]);
      }(ft), Du = function(o) {
        function t() {
          return f(this, t), h(this, t, arguments);
        }
        return x(t, o), g(t);
      }(za), $a = function(o) {
        function t(e) {
          var s;
          return f(this, t), (s = h(this, t)).array = [], e instanceof nn && s.addAll(e), s;
        }
        return x(t, o), g(t, [{ key: "contains", value: function(e) {
          var s, l = p(this.array);
          try {
            for (l.s(); !(s = l.n()).done; )
              if (s.value.compareTo(e) === 0) return !0;
          } catch (_) {
            l.e(_);
          } finally {
            l.f();
          }
          return !1;
        } }, { key: "add", value: function(e) {
          if (this.contains(e)) return !1;
          for (var s = 0, l = this.array.length; s < l; s++)
            if (this.array[s].compareTo(e) === 1) return !!this.array.splice(s, 0, e);
          return this.array.push(e), !0;
        } }, { key: "addAll", value: function(e) {
          var s, l = p(e);
          try {
            for (l.s(); !(s = l.n()).done; ) {
              var _ = s.value;
              this.add(_);
            }
          } catch (m) {
            l.e(m);
          } finally {
            l.f();
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
          return new Fu(this.array);
        } }]);
      }(Du), Fu = function() {
        return g(function o(t) {
          f(this, o), this.array = t, this.position = 0;
        }, [{ key: "next", value: function() {
          if (this.position === this.array.length) throw new Se();
          return this.array[this.position++];
        } }, { key: "hasNext", value: function() {
          return this.position < this.array.length;
        } }, { key: "remove", value: function() {
          throw new qe();
        } }]);
      }(), be = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "computeEnvelopeInternal", value: function() {
          for (var e = new Ht(), s = 0; s < this._geometries.length; s++) e.expandToInclude(this._geometries[s].getEnvelopeInternal());
          return e;
        } }, { key: "getGeometryN", value: function(e) {
          return this._geometries[e];
        } }, { key: "getCoordinates", value: function() {
          for (var e = new Array(this.getNumPoints()).fill(null), s = -1, l = 0; l < this._geometries.length; l++) for (var _ = this._geometries[l].getCoordinates(), m = 0; m < _.length; m++) e[++s] = _[m];
          return e;
        } }, { key: "getArea", value: function() {
          for (var e = 0, s = 0; s < this._geometries.length; s++) e += this._geometries[s].getArea();
          return e;
        } }, { key: "copyInternal", value: function() {
          for (var e = new Array(this._geometries.length).fill(null), s = 0; s < e.length; s++) e[s] = this._geometries[s].copy();
          return new t(e, this._factory);
        } }, { key: "equalsExact", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "number" && arguments[0] instanceof ft) {
            var e = arguments[0], s = arguments[1];
            if (!this.isEquivalentClass(e)) return !1;
            var l = e;
            if (this._geometries.length !== l._geometries.length) return !1;
            for (var _ = 0; _ < this._geometries.length; _++) if (!this._geometries[_].equalsExact(l._geometries[_], s)) return !1;
            return !0;
          }
          return C(t, "equalsExact", this, 1).apply(this, arguments);
        } }, { key: "normalize", value: function() {
          for (var e = 0; e < this._geometries.length; e++) this._geometries[e].normalize();
          ei.sort(this._geometries);
        } }, { key: "getCoordinate", value: function() {
          return this.isEmpty() ? null : this._geometries[0].getCoordinate();
        } }, { key: "getBoundaryDimension", value: function() {
          for (var e = nt.FALSE, s = 0; s < this._geometries.length; s++) e = Math.max(e, this._geometries[s].getBoundaryDimension());
          return e;
        } }, { key: "reverseInternal", value: function() {
          for (var e = this._geometries.length, s = new mt(e), l = 0; l < e; l++) s.add(this._geometries[l].reverse());
          return this.getFactory().buildGeometry(s);
        } }, { key: "getTypeCode", value: function() {
          return ft.TYPECODE_GEOMETRYCOLLECTION;
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
            var e = arguments[0], s = new $a(ei.asList(this._geometries)), l = new $a(ei.asList(e._geometries));
            return this.compare(s, l);
          }
          if (arguments.length === 2) {
            for (var _ = arguments[1], m = arguments[0], E = this.getNumGeometries(), N = m.getNumGeometries(), R = 0; R < E && R < N; ) {
              var D = this.getGeometryN(R), q = m.getGeometryN(R), Z = D.compareToSameClass(q, _);
              if (Z !== 0) return Z;
              R++;
            }
            return R < E ? 1 : R < N ? -1 : 0;
          }
        } }, { key: "apply", value: function() {
          if (wt(arguments[0], Sr)) for (var e = arguments[0], s = 0; s < this._geometries.length; s++) this._geometries[s].apply(e);
          else if (wt(arguments[0], Nr)) {
            var l = arguments[0];
            if (this._geometries.length === 0) return null;
            for (var _ = 0; _ < this._geometries.length && (this._geometries[_].apply(l), !l.isDone()); _++) ;
            l.isGeometryChanged() && this.geometryChanged();
          } else if (wt(arguments[0], Ir)) {
            var m = arguments[0];
            m.filter(this);
            for (var E = 0; E < this._geometries.length; E++) this._geometries[E].apply(m);
          } else if (wt(arguments[0], V)) {
            var N = arguments[0];
            N.filter(this);
            for (var R = 0; R < this._geometries.length; R++) this._geometries[R].apply(N);
          }
        } }, { key: "getBoundary", value: function() {
          return ft.checkNotGeometryCollection(this), Nt.shouldNeverReachHere(), null;
        } }, { key: "getGeometryType", value: function() {
          return ft.TYPENAME_GEOMETRYCOLLECTION;
        } }, { key: "isEmpty", value: function() {
          for (var e = 0; e < this._geometries.length; e++) if (!this._geometries[e].isEmpty()) return !1;
          return !0;
        } }], [{ key: "constructor_", value: function() {
          if (this._geometries = null, arguments.length !== 0) {
            if (arguments.length === 2) {
              var e = arguments[0], s = arguments[1];
              if (ft.constructor_.call(this, s), e === null && (e = []), ft.hasNullElements(e)) throw new X("geometries must not contain null elements");
              this._geometries = e;
            }
          }
        } }]);
      }(ft), Ms = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "copyInternal", value: function() {
          for (var e = new Array(this._geometries.length).fill(null), s = 0; s < e.length; s++) e[s] = this._geometries[s].copy();
          return new t(e, this._factory);
        } }, { key: "isValid", value: function() {
          return !0;
        } }, { key: "equalsExact", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "number" && arguments[0] instanceof ft) {
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
          return ft.TYPECODE_MULTIPOINT;
        } }, { key: "getDimension", value: function() {
          return 0;
        } }, { key: "getBoundary", value: function() {
          return this.getFactory().createGeometryCollection();
        } }, { key: "getGeometryType", value: function() {
          return ft.TYPENAME_MULTIPOINT;
        } }, { key: "interfaces_", get: function() {
          return [kr];
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0], s = arguments[1];
          be.constructor_.call(this, e, s);
        } }]);
      }(be), Ii = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "copyInternal", value: function() {
          return new t(this._points.copy(), this._factory);
        } }, { key: "getBoundaryDimension", value: function() {
          return nt.FALSE;
        } }, { key: "isClosed", value: function() {
          return !!this.isEmpty() || C(t, "isClosed", this, 1).call(this);
        } }, { key: "reverseInternal", value: function() {
          var e = this._points.copy();
          return ti.reverse(e), this.getFactory().createLinearRing(e);
        } }, { key: "getTypeCode", value: function() {
          return ft.TYPECODE_LINEARRING;
        } }, { key: "validateConstruction", value: function() {
          if (!this.isEmpty() && !C(t, "isClosed", this, 1).call(this)) throw new X("Points of LinearRing do not form a closed linestring");
          if (this.getCoordinateSequence().size() >= 1 && this.getCoordinateSequence().size() < t.MINIMUM_VALID_SIZE) throw new X("Invalid number of points in LinearRing (found " + this.getCoordinateSequence().size() + " - must be 0 or >= 4)");
        } }, { key: "getGeometryType", value: function() {
          return ft.TYPENAME_LINEARRING;
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0], s = arguments[1];
          Ki.constructor_.call(this, e, s), this.validateConstruction();
        } }]);
      }(Ki);
      Ii.MINIMUM_VALID_SIZE = 4;
      var ni = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "setOrdinate", value: function(e, s) {
          switch (e) {
            case t.X:
              this.x = s;
              break;
            case t.Y:
              this.y = s;
              break;
            default:
              throw new X("Invalid ordinate index: " + e);
          }
        } }, { key: "getZ", value: function() {
          return U.NULL_ORDINATE;
        } }, { key: "getOrdinate", value: function(e) {
          switch (e) {
            case t.X:
              return this.x;
            case t.Y:
              return this.y;
          }
          throw new X("Invalid ordinate index: " + e);
        } }, { key: "setZ", value: function(e) {
          throw new X("CoordinateXY dimension 2 does not support z-ordinate");
        } }, { key: "copy", value: function() {
          return new t(this);
        } }, { key: "toString", value: function() {
          return "(" + this.x + ", " + this.y + ")";
        } }, { key: "setCoordinate", value: function(e) {
          this.x = e.x, this.y = e.y, this.z = e.getZ();
        } }], [{ key: "constructor_", value: function() {
          if (arguments.length === 0) U.constructor_.call(this);
          else if (arguments.length === 1) {
            if (arguments[0] instanceof t) {
              var e = arguments[0];
              U.constructor_.call(this, e.x, e.y);
            } else if (arguments[0] instanceof U) {
              var s = arguments[0];
              U.constructor_.call(this, s.x, s.y);
            }
          } else if (arguments.length === 2) {
            var l = arguments[0], _ = arguments[1];
            U.constructor_.call(this, l, _, U.NULL_ORDINATE);
          }
        } }]);
      }(U);
      ni.X = 0, ni.Y = 1, ni.Z = -1, ni.M = -1;
      var ii = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "getM", value: function() {
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
              throw new X("Invalid ordinate index: " + e);
          }
        } }, { key: "setM", value: function(e) {
          this._m = e;
        } }, { key: "getZ", value: function() {
          return U.NULL_ORDINATE;
        } }, { key: "getOrdinate", value: function(e) {
          switch (e) {
            case t.X:
              return this.x;
            case t.Y:
              return this.y;
            case t.M:
              return this._m;
          }
          throw new X("Invalid ordinate index: " + e);
        } }, { key: "setZ", value: function(e) {
          throw new X("CoordinateXY dimension 2 does not support z-ordinate");
        } }, { key: "copy", value: function() {
          return new t(this);
        } }, { key: "toString", value: function() {
          return "(" + this.x + ", " + this.y + " m=" + this.getM() + ")";
        } }, { key: "setCoordinate", value: function(e) {
          this.x = e.x, this.y = e.y, this.z = e.getZ(), this._m = e.getM();
        } }], [{ key: "constructor_", value: function() {
          if (this._m = null, arguments.length === 0) U.constructor_.call(this), this._m = 0;
          else if (arguments.length === 1) {
            if (arguments[0] instanceof t) {
              var e = arguments[0];
              U.constructor_.call(this, e.x, e.y), this._m = e._m;
            } else if (arguments[0] instanceof U) {
              var s = arguments[0];
              U.constructor_.call(this, s.x, s.y), this._m = this.getM();
            }
          } else if (arguments.length === 3) {
            var l = arguments[0], _ = arguments[1], m = arguments[2];
            U.constructor_.call(this, l, _, U.NULL_ORDINATE), this._m = m;
          }
        } }]);
      }(U);
      ii.X = 0, ii.Y = 1, ii.Z = -1, ii.M = 2;
      var ws = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "getM", value: function() {
          return this._m;
        } }, { key: "setOrdinate", value: function(e, s) {
          switch (e) {
            case U.X:
              this.x = s;
              break;
            case U.Y:
              this.y = s;
              break;
            case U.Z:
              this.z = s;
              break;
            case U.M:
              this._m = s;
              break;
            default:
              throw new X("Invalid ordinate index: " + e);
          }
        } }, { key: "setM", value: function(e) {
          this._m = e;
        } }, { key: "getOrdinate", value: function(e) {
          switch (e) {
            case U.X:
              return this.x;
            case U.Y:
              return this.y;
            case U.Z:
              return this.getZ();
            case U.M:
              return this.getM();
          }
          throw new X("Invalid ordinate index: " + e);
        } }, { key: "copy", value: function() {
          return new t(this);
        } }, { key: "toString", value: function() {
          return "(" + this.x + ", " + this.y + ", " + this.getZ() + " m=" + this.getM() + ")";
        } }, { key: "setCoordinate", value: function(e) {
          this.x = e.x, this.y = e.y, this.z = e.getZ(), this._m = e.getM();
        } }], [{ key: "constructor_", value: function() {
          if (this._m = null, arguments.length === 0) U.constructor_.call(this), this._m = 0;
          else if (arguments.length === 1) {
            if (arguments[0] instanceof t) {
              var e = arguments[0];
              U.constructor_.call(this, e), this._m = e._m;
            } else if (arguments[0] instanceof U) {
              var s = arguments[0];
              U.constructor_.call(this, s), this._m = this.getM();
            }
          } else if (arguments.length === 4) {
            var l = arguments[0], _ = arguments[1], m = arguments[2], E = arguments[3];
            U.constructor_.call(this, l, _, m), this._m = E;
          }
        } }]);
      }(U), br = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "measures", value: function(t) {
          return t instanceof ni ? 0 : t instanceof ii || t instanceof ws ? 1 : 0;
        } }, { key: "dimension", value: function(t) {
          return t instanceof ni ? 2 : t instanceof ii ? 3 : t instanceof ws ? 4 : 3;
        } }, { key: "create", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return o.create(t, 0);
          }
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            return e === 2 ? new ni() : e === 3 && s === 0 ? new U() : e === 3 && s === 1 ? new ii() : e === 4 && s === 1 ? new ws() : new U();
          }
        } }]);
      }(), Ji = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "getCoordinate", value: function(e) {
          return this.get(e);
        } }, { key: "addAll", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "boolean" && wt(arguments[0], nn)) {
            for (var e = arguments[1], s = !1, l = arguments[0].iterator(); l.hasNext(); ) this.add(l.next(), e), s = !0;
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
            for (var e = this.size(), s = new Array(e).fill(null), l = 0; l < e; l++) s[l] = this.get(e - l - 1);
            return s;
          }
        } }, { key: "add", value: function() {
          if (arguments.length === 1) {
            var e = arguments[0];
            return C(t, "add", this, 1).call(this, e);
          }
          if (arguments.length === 2) {
            if (arguments[0] instanceof Array && typeof arguments[1] == "boolean") {
              var s = arguments[0], l = arguments[1];
              return this.add(s, l, !0), !0;
            }
            if (arguments[0] instanceof U && typeof arguments[1] == "boolean") {
              var _ = arguments[0];
              if (!arguments[1] && this.size() >= 1 && this.get(this.size() - 1).equals2D(_)) return null;
              C(t, "add", this, 1).call(this, _);
            } else if (arguments[0] instanceof Object && typeof arguments[1] == "boolean") {
              var m = arguments[0], E = arguments[1];
              return this.add(m, E), !0;
            }
          } else if (arguments.length === 3) {
            if (typeof arguments[2] == "boolean" && arguments[0] instanceof Array && typeof arguments[1] == "boolean") {
              var N = arguments[0], R = arguments[1];
              if (arguments[2]) for (var D = 0; D < N.length; D++) this.add(N[D], R);
              else for (var q = N.length - 1; q >= 0; q--) this.add(N[q], R);
              return !0;
            }
            if (typeof arguments[2] == "boolean" && Number.isInteger(arguments[0]) && arguments[1] instanceof U) {
              var Z = arguments[0], st = arguments[1];
              if (!arguments[2]) {
                var ut = this.size();
                if (ut > 0 && (Z > 0 && this.get(Z - 1).equals2D(st) || Z < ut && this.get(Z).equals2D(st)))
                  return null;
              }
              C(t, "add", this, 1).call(this, Z, st);
            }
          } else if (arguments.length === 4) {
            var gt = arguments[0], bt = arguments[1], lt = arguments[2], Wt = arguments[3], ce = 1;
            lt > Wt && (ce = -1);
            for (var se = lt; se !== Wt; se += ce) this.add(gt[se], bt);
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
              var s = arguments[0], l = arguments[1];
              this.ensureCapacity(s.length), this.add(s, l);
            }
          }
        } }]);
      }(mt);
      Ji.coordArrayType = new Array(0).fill(null);
      var re = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "isRing", value: function(t) {
          return !(t.length < 4) && !!t[0].equals2D(t[t.length - 1]);
        } }, { key: "ptNotInList", value: function(t, e) {
          for (var s = 0; s < t.length; s++) {
            var l = t[s];
            if (o.indexOf(l, e) < 0) return l;
          }
          return null;
        } }, { key: "scroll", value: function(t, e) {
          var s = o.indexOf(e, t);
          if (s < 0) return null;
          var l = new Array(t.length).fill(null);
          Ue.arraycopy(t, s, l, 0, t.length - s), Ue.arraycopy(t, 0, l, t.length - s, s), Ue.arraycopy(l, 0, t, 0, t.length);
        } }, { key: "equals", value: function() {
          if (arguments.length === 2) {
            var t = arguments[0], e = arguments[1];
            if (t === e) return !0;
            if (t === null || e === null || t.length !== e.length) return !1;
            for (var s = 0; s < t.length; s++) if (!t[s].equals(e[s])) return !1;
            return !0;
          }
          if (arguments.length === 3) {
            var l = arguments[0], _ = arguments[1], m = arguments[2];
            if (l === _) return !0;
            if (l === null || _ === null || l.length !== _.length) return !1;
            for (var E = 0; E < l.length; E++) if (m.compare(l[E], _[E]) !== 0) return !1;
            return !0;
          }
        } }, { key: "intersection", value: function(t, e) {
          for (var s = new Ji(), l = 0; l < t.length; l++) e.intersects(t[l]) && s.add(t[l], !0);
          return s.toCoordinateArray();
        } }, { key: "measures", value: function(t) {
          if (t === null || t.length === 0) return 0;
          var e, s = 0, l = p(t);
          try {
            for (l.s(); !(e = l.n()).done; ) {
              var _ = e.value;
              s = Math.max(s, br.measures(_));
            }
          } catch (m) {
            l.e(m);
          } finally {
            l.f();
          }
          return s;
        } }, { key: "hasRepeatedPoints", value: function(t) {
          for (var e = 1; e < t.length; e++) if (t[e - 1].equals(t[e])) return !0;
          return !1;
        } }, { key: "removeRepeatedPoints", value: function(t) {
          return o.hasRepeatedPoints(t) ? new Ji(t, !1).toCoordinateArray() : t;
        } }, { key: "reverse", value: function(t) {
          for (var e = t.length - 1, s = Math.trunc(e / 2), l = 0; l <= s; l++) {
            var _ = t[l];
            t[l] = t[e - l], t[e - l] = _;
          }
        } }, { key: "removeNull", value: function(t) {
          for (var e = 0, s = 0; s < t.length; s++) t[s] !== null && e++;
          var l = new Array(e).fill(null);
          if (e === 0) return l;
          for (var _ = 0, m = 0; m < t.length; m++) t[m] !== null && (l[_++] = t[m]);
          return l;
        } }, { key: "copyDeep", value: function() {
          if (arguments.length === 1) {
            for (var t = arguments[0], e = new Array(t.length).fill(null), s = 0; s < t.length; s++) e[s] = t[s].copy();
            return e;
          }
          if (arguments.length === 5) for (var l = arguments[0], _ = arguments[1], m = arguments[2], E = arguments[3], N = arguments[4], R = 0; R < N; R++) m[E + R] = l[_ + R].copy();
        } }, { key: "isEqualReversed", value: function(t, e) {
          for (var s = 0; s < t.length; s++) {
            var l = t[s], _ = e[t.length - s - 1];
            if (l.compareTo(_) !== 0) return !1;
          }
          return !0;
        } }, { key: "envelope", value: function(t) {
          for (var e = new Ht(), s = 0; s < t.length; s++) e.expandToInclude(t[s]);
          return e;
        } }, { key: "toCoordinateArray", value: function(t) {
          return t.toArray(o.coordArrayType);
        } }, { key: "dimension", value: function(t) {
          if (t === null || t.length === 0) return 3;
          var e, s = 0, l = p(t);
          try {
            for (l.s(); !(e = l.n()).done; ) {
              var _ = e.value;
              s = Math.max(s, br.dimension(_));
            }
          } catch (m) {
            l.e(m);
          } finally {
            l.f();
          }
          return s;
        } }, { key: "atLeastNCoordinatesOrNothing", value: function(t, e) {
          return e.length >= t ? e : [];
        } }, { key: "indexOf", value: function(t, e) {
          for (var s = 0; s < e.length; s++) if (t.equals(e[s])) return s;
          return -1;
        } }, { key: "increasingDirection", value: function(t) {
          for (var e = 0; e < Math.trunc(t.length / 2); e++) {
            var s = t.length - 1 - e, l = t[e].compareTo(t[s]);
            if (l !== 0) return l;
          }
          return 1;
        } }, { key: "compare", value: function(t, e) {
          for (var s = 0; s < t.length && s < e.length; ) {
            var l = t[s].compareTo(e[s]);
            if (l !== 0) return l;
            s++;
          }
          return s < e.length ? -1 : s < t.length ? 1 : 0;
        } }, { key: "minCoordinate", value: function(t) {
          for (var e = null, s = 0; s < t.length; s++) (e === null || e.compareTo(t[s]) > 0) && (e = t[s]);
          return e;
        } }, { key: "extract", value: function(t, e, s) {
          e = Zi.clamp(e, 0, t.length);
          var l = (s = Zi.clamp(s, -1, t.length)) - e + 1;
          s < 0 && (l = 0), e >= t.length && (l = 0), s < e && (l = 0);
          var _ = new Array(l).fill(null);
          if (l === 0) return _;
          for (var m = 0, E = e; E <= s; E++) _[m++] = t[E];
          return _;
        } }]);
      }(), Rr = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "compare", value: function(o, t) {
          var e = o, s = t;
          return re.compare(e, s);
        } }, { key: "interfaces_", get: function() {
          return [Zt];
        } }]);
      }(), qu = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "compare", value: function(o, t) {
          var e = o, s = t;
          if (e.length < s.length) return -1;
          if (e.length > s.length) return 1;
          if (e.length === 0) return 0;
          var l = re.compare(e, s);
          return re.isEqualReversed(e, s) ? 0 : l;
        } }, { key: "OLDcompare", value: function(o, t) {
          var e = o, s = t;
          if (e.length < s.length) return -1;
          if (e.length > s.length) return 1;
          if (e.length === 0) return 0;
          for (var l = re.increasingDirection(e), _ = re.increasingDirection(s), m = l > 0 ? 0 : e.length - 1, E = _ > 0 ? 0 : e.length - 1, N = 0; N < e.length; N++) {
            var R = e[m].compareTo(s[E]);
            if (R !== 0) return R;
            m += l, E += _;
          }
          return 0;
        } }, { key: "interfaces_", get: function() {
          return [Zt];
        } }]);
      }();
      re.ForwardComparator = Rr, re.BidirectionalComparator = qu, re.coordArrayType = new Array(0).fill(null);
      var ri = function() {
        return g(function o(t) {
          f(this, o), this.str = t;
        }, [{ key: "append", value: function(o) {
          this.str += o;
        } }, { key: "setCharAt", value: function(o, t) {
          this.str = this.str.substr(0, o) + t + this.str.substr(o + 1);
        } }, { key: "toString", value: function() {
          return this.str;
        } }]);
      }(), Qi = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "getM", value: function(t) {
          return this.hasM() ? this._coordinates[t].getM() : ht.NaN;
        } }, { key: "setOrdinate", value: function(t, e, s) {
          switch (e) {
            case Tt.X:
              this._coordinates[t].x = s;
              break;
            case Tt.Y:
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
            case Tt.X:
              return this._coordinates[t].x;
            case Tt.Y:
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
          return br.create(this.getDimension(), this.getMeasures());
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
          return new o(t, this._dimension, this._measures);
        } }, { key: "toString", value: function() {
          if (this._coordinates.length > 0) {
            var t = new ri(17 * this._coordinates.length);
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
          return [Tt, j];
        } }], [{ key: "constructor_", value: function() {
          if (this._dimension = 3, this._measures = 0, this._coordinates = null, arguments.length === 1) {
            if (arguments[0] instanceof Array) {
              var t = arguments[0];
              o.constructor_.call(this, t, re.dimension(t), re.measures(t));
            } else if (Number.isInteger(arguments[0])) {
              var e = arguments[0];
              this._coordinates = new Array(e).fill(null);
              for (var s = 0; s < e; s++) this._coordinates[s] = new U();
            } else if (wt(arguments[0], Tt)) {
              var l = arguments[0];
              if (l === null) return this._coordinates = new Array(0).fill(null), null;
              this._dimension = l.getDimension(), this._measures = l.getMeasures(), this._coordinates = new Array(l.size()).fill(null);
              for (var _ = 0; _ < this._coordinates.length; _++) this._coordinates[_] = l.getCoordinateCopy(_);
            }
          } else if (arguments.length === 2) {
            if (arguments[0] instanceof Array && Number.isInteger(arguments[1])) {
              var m = arguments[0], E = arguments[1];
              o.constructor_.call(this, m, E, re.measures(m));
            } else if (Number.isInteger(arguments[0]) && Number.isInteger(arguments[1])) {
              var N = arguments[0], R = arguments[1];
              this._coordinates = new Array(N).fill(null), this._dimension = R;
              for (var D = 0; D < N; D++) this._coordinates[D] = br.create(R);
            }
          } else if (arguments.length === 3) {
            if (Number.isInteger(arguments[2]) && arguments[0] instanceof Array && Number.isInteger(arguments[1])) {
              var q = arguments[0], Z = arguments[1], st = arguments[2];
              this._dimension = Z, this._measures = st, this._coordinates = q === null ? new Array(0).fill(null) : q;
            } else if (Number.isInteger(arguments[2]) && Number.isInteger(arguments[0]) && Number.isInteger(arguments[1])) {
              var ut = arguments[0], gt = arguments[1], bt = arguments[2];
              this._coordinates = new Array(ut).fill(null), this._dimension = gt, this._measures = bt;
              for (var lt = 0; lt < ut; lt++) this._coordinates[lt] = this.createCoordinate();
            }
          }
        } }]);
      }(), Ss = function() {
        function o() {
          f(this, o);
        }
        return g(o, [{ key: "readResolve", value: function() {
          return o.instance();
        } }, { key: "create", value: function() {
          if (arguments.length === 1) {
            if (arguments[0] instanceof Array) return new Qi(arguments[0]);
            if (wt(arguments[0], Tt)) return new Qi(arguments[0]);
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
          return [Es, j];
        } }], [{ key: "instance", value: function() {
          return o.instanceObject;
        } }]);
      }();
      Ss.instanceObject = new Ss();
      var Is = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "copyInternal", value: function() {
          for (var e = new Array(this._geometries.length).fill(null), s = 0; s < e.length; s++) e[s] = this._geometries[s].copy();
          return new t(e, this._factory);
        } }, { key: "equalsExact", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "number" && arguments[0] instanceof ft) {
            var e = arguments[0], s = arguments[1];
            return !!this.isEquivalentClass(e) && C(t, "equalsExact", this, 1).call(this, e, s);
          }
          return C(t, "equalsExact", this, 1).apply(this, arguments);
        } }, { key: "getBoundaryDimension", value: function() {
          return 1;
        } }, { key: "getTypeCode", value: function() {
          return ft.TYPECODE_MULTIPOLYGON;
        } }, { key: "getDimension", value: function() {
          return 2;
        } }, { key: "getBoundary", value: function() {
          if (this.isEmpty()) return this.getFactory().createMultiLineString();
          for (var e = new mt(), s = 0; s < this._geometries.length; s++) for (var l = this._geometries[s].getBoundary(), _ = 0; _ < l.getNumGeometries(); _++) e.add(l.getGeometryN(_));
          var m = new Array(e.size()).fill(null);
          return this.getFactory().createMultiLineString(e.toArray(m));
        } }, { key: "getGeometryType", value: function() {
          return ft.TYPENAME_MULTIPOLYGON;
        } }, { key: "interfaces_", get: function() {
          return [Wa];
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0], s = arguments[1];
          be.constructor_.call(this, e, s);
        } }]);
      }(be), Ns = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "get", value: function() {
        } }, { key: "put", value: function() {
        } }, { key: "size", value: function() {
        } }, { key: "values", value: function() {
        } }, { key: "entrySet", value: function() {
        } }]);
      }(), Ha = function(o) {
        function t() {
          var e;
          return f(this, t), (e = h(this, t)).map = /* @__PURE__ */ new Map(), e;
        }
        return x(t, o), g(t, [{ key: "get", value: function(e) {
          return this.map.get(e) || null;
        } }, { key: "put", value: function(e, s) {
          return this.map.set(e, s), s;
        } }, { key: "values", value: function() {
          for (var e = new mt(), s = this.map.values(), l = s.next(); !l.done; ) e.add(l.value), l = s.next();
          return e;
        } }, { key: "entrySet", value: function() {
          var e = new rn();
          return this.map.entries().forEach(function(s) {
            return e.add(s);
          }), e;
        } }, { key: "size", value: function() {
          return this.map.size();
        } }]);
      }(Ns), ze = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "equals", value: function(t) {
          if (!(t instanceof o)) return !1;
          var e = t;
          return this._modelType === e._modelType && this._scale === e._scale;
        } }, { key: "compareTo", value: function(t) {
          var e = t, s = this.getMaximumSignificantDigits(), l = e.getMaximumSignificantDigits();
          return wr.compare(s, l);
        } }, { key: "getScale", value: function() {
          return this._scale;
        } }, { key: "isFloating", value: function() {
          return this._modelType === o.FLOATING || this._modelType === o.FLOATING_SINGLE;
        } }, { key: "getType", value: function() {
          return this._modelType;
        } }, { key: "toString", value: function() {
          var t = "UNKNOWN";
          return this._modelType === o.FLOATING ? t = "Floating" : this._modelType === o.FLOATING_SINGLE ? t = "Floating-Single" : this._modelType === o.FIXED && (t = "Fixed (Scale=" + this.getScale() + ")"), t;
        } }, { key: "makePrecise", value: function() {
          if (typeof arguments[0] == "number") {
            var t = arguments[0];
            return ht.isNaN(t) || this._modelType === o.FLOATING_SINGLE ? t : this._modelType === o.FIXED ? Math.round(t * this._scale) / this._scale : t;
          }
          if (arguments[0] instanceof U) {
            var e = arguments[0];
            if (this._modelType === o.FLOATING) return null;
            e.x = this.makePrecise(e.x), e.y = this.makePrecise(e.y);
          }
        } }, { key: "getMaximumSignificantDigits", value: function() {
          var t = 16;
          return this._modelType === o.FLOATING ? t = 16 : this._modelType === o.FLOATING_SINGLE ? t = 6 : this._modelType === o.FIXED && (t = 1 + Math.trunc(Math.ceil(Math.log(this.getScale()) / Math.log(10)))), t;
        } }, { key: "setScale", value: function(t) {
          this._scale = Math.abs(t);
        } }, { key: "interfaces_", get: function() {
          return [j, K];
        } }], [{ key: "constructor_", value: function() {
          if (this._modelType = null, this._scale = null, arguments.length === 0) this._modelType = o.FLOATING;
          else if (arguments.length === 1) {
            if (arguments[0] instanceof Ni) {
              var t = arguments[0];
              this._modelType = t, t === o.FIXED && this.setScale(1);
            } else if (typeof arguments[0] == "number") {
              var e = arguments[0];
              this._modelType = o.FIXED, this.setScale(e);
            } else if (arguments[0] instanceof o) {
              var s = arguments[0];
              this._modelType = s._modelType, this._scale = s._scale;
            }
          }
        } }, { key: "mostPrecise", value: function(t, e) {
          return t.compareTo(e) >= 0 ? t : e;
        } }]);
      }(), Ni = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "readResolve", value: function() {
          return o.nameToTypeMap.get(this._name);
        } }, { key: "toString", value: function() {
          return this._name;
        } }, { key: "interfaces_", get: function() {
          return [j];
        } }], [{ key: "constructor_", value: function() {
          this._name = null;
          var t = arguments[0];
          this._name = t, o.nameToTypeMap.put(t, this);
        } }]);
      }();
      Ni.nameToTypeMap = new Ha(), ze.Type = Ni, ze.FIXED = new Ni("FIXED"), ze.FLOATING = new Ni("FLOATING"), ze.FLOATING_SINGLE = new Ni("FLOATING SINGLE"), ze.maximumPreciseValue = 9007199254740992;
      var ks = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "copyInternal", value: function() {
          for (var e = new Array(this._geometries.length).fill(null), s = 0; s < e.length; s++) e[s] = this._geometries[s].copy();
          return new t(e, this._factory);
        } }, { key: "equalsExact", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "number" && arguments[0] instanceof ft) {
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
          return ft.TYPECODE_MULTILINESTRING;
        } }, { key: "getDimension", value: function() {
          return 1;
        } }, { key: "getBoundary", value: function() {
          throw new qe();
        } }, { key: "getGeometryType", value: function() {
          return ft.TYPENAME_MULTILINESTRING;
        } }, { key: "interfaces_", get: function() {
          return [Xa];
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0], s = arguments[1];
          be.constructor_.call(this, e, s);
        } }]);
      }(be), ki = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "createEmpty", value: function(t) {
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
              throw new X("Invalid dimension: " + t);
          }
        } }, { key: "toGeometry", value: function(t) {
          return t.isNull() ? this.createPoint() : t.getMinX() === t.getMaxX() && t.getMinY() === t.getMaxY() ? this.createPoint(new U(t.getMinX(), t.getMinY())) : t.getMinX() === t.getMaxX() || t.getMinY() === t.getMaxY() ? this.createLineString([new U(t.getMinX(), t.getMinY()), new U(t.getMaxX(), t.getMaxY())]) : this.createPolygon(this.createLinearRing([new U(t.getMinX(), t.getMinY()), new U(t.getMinX(), t.getMaxY()), new U(t.getMaxX(), t.getMaxY()), new U(t.getMaxX(), t.getMinY()), new U(t.getMinX(), t.getMinY())]), null);
        } }, { key: "createLineString", value: function() {
          if (arguments.length === 0) return this.createLineString(this.getCoordinateSequenceFactory().create([]));
          if (arguments.length === 1) {
            if (arguments[0] instanceof Array) {
              var t = arguments[0];
              return this.createLineString(t !== null ? this.getCoordinateSequenceFactory().create(t) : null);
            }
            if (wt(arguments[0], Tt)) return new Ki(arguments[0], this);
          }
        } }, { key: "createMultiLineString", value: function() {
          return arguments.length === 0 ? new ks(null, this) : arguments.length === 1 ? new ks(arguments[0], this) : void 0;
        } }, { key: "buildGeometry", value: function(t) {
          for (var e = null, s = !1, l = !1, _ = t.iterator(); _.hasNext(); ) {
            var m = _.next(), E = m.getTypeCode();
            e === null && (e = E), E !== e && (s = !0), m instanceof be && (l = !0);
          }
          if (e === null) return this.createGeometryCollection();
          if (s || l) return this.createGeometryCollection(o.toGeometryArray(t));
          var N = t.iterator().next();
          if (t.size() > 1) {
            if (N instanceof Cr) return this.createMultiPolygon(o.toPolygonArray(t));
            if (N instanceof Ki) return this.createMultiLineString(o.toLineStringArray(t));
            if (N instanceof xs) return this.createMultiPoint(o.toPointArray(t));
            Nt.shouldNeverReachHere("Unhandled geometry type: " + N.getGeometryType());
          }
          return N;
        } }, { key: "createMultiPointFromCoords", value: function(t) {
          return this.createMultiPoint(t !== null ? this.getCoordinateSequenceFactory().create(t) : null);
        } }, { key: "createPoint", value: function() {
          if (arguments.length === 0) return this.createPoint(this.getCoordinateSequenceFactory().create([]));
          if (arguments.length === 1) {
            if (arguments[0] instanceof U) {
              var t = arguments[0];
              return this.createPoint(t !== null ? this.getCoordinateSequenceFactory().create([t]) : null);
            }
            if (wt(arguments[0], Tt)) return new xs(arguments[0], this);
          }
        } }, { key: "getCoordinateSequenceFactory", value: function() {
          return this._coordinateSequenceFactory;
        } }, { key: "createPolygon", value: function() {
          if (arguments.length === 0) return this.createPolygon(null, null);
          if (arguments.length === 1) {
            if (wt(arguments[0], Tt)) {
              var t = arguments[0];
              return this.createPolygon(this.createLinearRing(t));
            }
            if (arguments[0] instanceof Array) {
              var e = arguments[0];
              return this.createPolygon(this.createLinearRing(e));
            }
            if (arguments[0] instanceof Ii) {
              var s = arguments[0];
              return this.createPolygon(s, null);
            }
          } else if (arguments.length === 2)
            return new Cr(arguments[0], arguments[1], this);
        } }, { key: "getSRID", value: function() {
          return this._SRID;
        } }, { key: "createGeometryCollection", value: function() {
          return arguments.length === 0 ? new be(null, this) : arguments.length === 1 ? new be(arguments[0], this) : void 0;
        } }, { key: "getPrecisionModel", value: function() {
          return this._precisionModel;
        } }, { key: "createLinearRing", value: function() {
          if (arguments.length === 0) return this.createLinearRing(this.getCoordinateSequenceFactory().create([]));
          if (arguments.length === 1) {
            if (arguments[0] instanceof Array) {
              var t = arguments[0];
              return this.createLinearRing(t !== null ? this.getCoordinateSequenceFactory().create(t) : null);
            }
            if (wt(arguments[0], Tt)) return new Ii(arguments[0], this);
          }
        } }, { key: "createMultiPolygon", value: function() {
          return arguments.length === 0 ? new Is(null, this) : arguments.length === 1 ? new Is(arguments[0], this) : void 0;
        } }, { key: "createMultiPoint", value: function() {
          if (arguments.length === 0) return new Ms(null, this);
          if (arguments.length === 1) {
            if (arguments[0] instanceof Array) return new Ms(arguments[0], this);
            if (wt(arguments[0], Tt)) {
              var t = arguments[0];
              if (t === null) return this.createMultiPoint(new Array(0).fill(null));
              for (var e = new Array(t.size()).fill(null), s = 0; s < t.size(); s++) {
                var l = this.getCoordinateSequenceFactory().create(1, t.getDimension(), t.getMeasures());
                ti.copy(t, s, l, 0, 1), e[s] = this.createPoint(l);
              }
              return this.createMultiPoint(e);
            }
          }
        } }, { key: "interfaces_", get: function() {
          return [j];
        } }], [{ key: "constructor_", value: function() {
          if (this._precisionModel = null, this._coordinateSequenceFactory = null, this._SRID = null, arguments.length === 0) o.constructor_.call(this, new ze(), 0);
          else if (arguments.length === 1) {
            if (wt(arguments[0], Es)) {
              var t = arguments[0];
              o.constructor_.call(this, new ze(), 0, t);
            } else if (arguments[0] instanceof ze) {
              var e = arguments[0];
              o.constructor_.call(this, e, 0, o.getDefaultCoordinateSequenceFactory());
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], l = arguments[1];
            o.constructor_.call(this, s, l, o.getDefaultCoordinateSequenceFactory());
          } else if (arguments.length === 3) {
            var _ = arguments[0], m = arguments[1], E = arguments[2];
            this._precisionModel = _, this._coordinateSequenceFactory = E, this._SRID = m;
          }
        } }, { key: "toMultiPolygonArray", value: function(t) {
          var e = new Array(t.size()).fill(null);
          return t.toArray(e);
        } }, { key: "toGeometryArray", value: function(t) {
          if (t === null) return null;
          var e = new Array(t.size()).fill(null);
          return t.toArray(e);
        } }, { key: "getDefaultCoordinateSequenceFactory", value: function() {
          return Ss.instance();
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
      }(), Ps = "XY", Va = "XYZ", Za = "XYM", Ka = "XYZM", Tr = { POINT: "Point", LINE_STRING: "LineString", LINEAR_RING: "LinearRing", POLYGON: "Polygon", MULTI_POINT: "MultiPoint", MULTI_LINE_STRING: "MultiLineString", MULTI_POLYGON: "MultiPolygon", GEOMETRY_COLLECTION: "GeometryCollection", CIRCLE: "Circle" }, Ja = "EMPTY", ji = 1, Ye = 2, bn = 3, Qa = 4, si = 5, ja = 6;
      for (var Cs in Tr) Tr[Cs].toUpperCase();
      var Bu = function() {
        return g(function o(t) {
          f(this, o), this.wkt = t, this.index_ = -1;
        }, [{ key: "isAlpha_", value: function(o) {
          return o >= "a" && o <= "z" || o >= "A" && o <= "Z";
        } }, { key: "isNumeric_", value: function(o, t) {
          return o >= "0" && o <= "9" || o == "." && !(t !== void 0 && t);
        } }, { key: "isWhiteSpace_", value: function(o) {
          return o == " " || o == "	" || o == "\r" || o == `
`;
        } }, { key: "nextChar_", value: function() {
          return this.wkt.charAt(++this.index_);
        } }, { key: "nextToken", value: function() {
          var o, t = this.nextChar_(), e = this.index_, s = t;
          if (t == "(") o = Ye;
          else if (t == ",") o = si;
          else if (t == ")") o = bn;
          else if (this.isNumeric_(t) || t == "-") o = Qa, s = this.readNumber_();
          else if (this.isAlpha_(t)) o = ji, s = this.readText_();
          else {
            if (this.isWhiteSpace_(t)) return this.nextToken();
            if (t !== "") throw new Error("Unexpected character: " + t);
            o = ja;
          }
          return { position: e, value: s, type: o };
        } }, { key: "readNumber_", value: function() {
          var o, t = this.index_, e = !1, s = !1;
          do
            o == "." ? e = !0 : o != "e" && o != "E" || (s = !0), o = this.nextChar_();
          while (this.isNumeric_(o, e) || !s && (o == "e" || o == "E") || s && (o == "-" || o == "+"));
          return parseFloat(this.wkt.substring(t, this.index_--));
        } }, { key: "readText_", value: function() {
          var o, t = this.index_;
          do
            o = this.nextChar_();
          while (this.isAlpha_(o));
          return this.wkt.substring(t, this.index_--).toUpperCase();
        } }]);
      }(), to = function() {
        return g(function o(t, e) {
          f(this, o), this.lexer_ = t, this.token_, this.layout_ = Ps, this.factory = e;
        }, [{ key: "consume_", value: function() {
          this.token_ = this.lexer_.nextToken();
        } }, { key: "isTokenType", value: function(o) {
          return this.token_.type == o;
        } }, { key: "match", value: function(o) {
          var t = this.isTokenType(o);
          return t && this.consume_(), t;
        } }, { key: "parse", value: function() {
          return this.consume_(), this.parseGeometry_();
        } }, { key: "parseGeometryLayout_", value: function() {
          var o = Ps, t = this.token_;
          if (this.isTokenType(ji)) {
            var e = t.value;
            e === "Z" ? o = Va : e === "M" ? o = Za : e === "ZM" && (o = Ka), o !== Ps && this.consume_();
          }
          return o;
        } }, { key: "parseGeometryCollectionText_", value: function() {
          if (this.match(Ye)) {
            var o = [];
            do
              o.push(this.parseGeometry_());
            while (this.match(si));
            if (this.match(bn)) return o;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parsePointText_", value: function() {
          if (this.match(Ye)) {
            var o = this.parsePoint_();
            if (this.match(bn)) return o;
          } else if (this.isEmptyGeometry_()) return null;
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parseLineStringText_", value: function() {
          if (this.match(Ye)) {
            var o = this.parsePointList_();
            if (this.match(bn)) return o;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parsePolygonText_", value: function() {
          if (this.match(Ye)) {
            var o = this.parseLineStringTextList_();
            if (this.match(bn)) return o;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parseMultiPointText_", value: function() {
          var o;
          if (this.match(Ye)) {
            if (o = this.token_.type == Ye ? this.parsePointTextList_() : this.parsePointList_(), this.match(bn)) return o;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parseMultiLineStringText_", value: function() {
          if (this.match(Ye)) {
            var o = this.parseLineStringTextList_();
            if (this.match(bn)) return o;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parseMultiPolygonText_", value: function() {
          if (this.match(Ye)) {
            var o = this.parsePolygonTextList_();
            if (this.match(bn)) return o;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parsePoint_", value: function() {
          for (var o = [], t = this.layout_.length, e = 0; e < t; ++e) {
            var s = this.token_;
            if (!this.match(Qa)) break;
            o.push(s.value);
          }
          if (o.length == t) return o;
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parsePointList_", value: function() {
          for (var o = [this.parsePoint_()]; this.match(si); ) o.push(this.parsePoint_());
          return o;
        } }, { key: "parsePointTextList_", value: function() {
          for (var o = [this.parsePointText_()]; this.match(si); ) o.push(this.parsePointText_());
          return o;
        } }, { key: "parseLineStringTextList_", value: function() {
          for (var o = [this.parseLineStringText_()]; this.match(si); ) o.push(this.parseLineStringText_());
          return o;
        } }, { key: "parsePolygonTextList_", value: function() {
          for (var o = [this.parsePolygonText_()]; this.match(si); ) o.push(this.parsePolygonText_());
          return o;
        } }, { key: "isEmptyGeometry_", value: function() {
          var o = this.isTokenType(ji) && this.token_.value == Ja;
          return o && this.consume_(), o;
        } }, { key: "formatErrorMessage_", value: function() {
          return "Unexpected `" + this.token_.value + "` at position " + this.token_.position + " in `" + this.lexer_.wkt + "`";
        } }, { key: "parseGeometry_", value: function() {
          var o = this.factory, t = function(gt) {
            return v(U, G(gt));
          }, e = function(gt) {
            var bt = gt.map(function(lt) {
              return o.createLinearRing(lt.map(t));
            });
            return bt.length > 1 ? o.createPolygon(bt[0], bt.slice(1)) : o.createPolygon(bt[0]);
          }, s = this.token_;
          if (this.match(ji)) {
            var l = s.value;
            if (this.layout_ = this.parseGeometryLayout_(), l == "GEOMETRYCOLLECTION") {
              var _ = this.parseGeometryCollectionText_();
              return o.createGeometryCollection(_);
            }
            switch (l) {
              case "POINT":
                var m = this.parsePointText_();
                return m ? o.createPoint(v(U, G(m))) : o.createPoint();
              case "LINESTRING":
                var E = this.parseLineStringText_().map(t);
                return o.createLineString(E);
              case "LINEARRING":
                var N = this.parseLineStringText_().map(t);
                return o.createLinearRing(N);
              case "POLYGON":
                var R = this.parsePolygonText_();
                return R && R.length !== 0 ? e(R) : o.createPolygon();
              case "MULTIPOINT":
                var D = this.parseMultiPointText_();
                if (!D || D.length === 0) return o.createMultiPoint();
                var q = D.map(t).map(function(gt) {
                  return o.createPoint(gt);
                });
                return o.createMultiPoint(q);
              case "MULTILINESTRING":
                var Z = this.parseMultiLineStringText_().map(function(gt) {
                  return o.createLineString(gt.map(t));
                });
                return o.createMultiLineString(Z);
              case "MULTIPOLYGON":
                var st = this.parseMultiPolygonText_();
                if (!st || st.length === 0) return o.createMultiPolygon();
                var ut = st.map(e);
                return o.createMultiPolygon(ut);
              default:
                throw new Error("Invalid geometry type: " + l);
            }
          }
          throw new Error(this.formatErrorMessage_());
        } }]);
      }();
      function Ar(o) {
        if (o.isEmpty()) return "";
        var t = o.getCoordinate(), e = [t.x, t.y];
        return t.z === void 0 || Number.isNaN(t.z) || e.push(t.z), t.m === void 0 || Number.isNaN(t.m) || e.push(t.m), e.join(" ");
      }
      function ai(o) {
        for (var t = o.getCoordinates().map(function(_) {
          var m = [_.x, _.y];
          return _.z === void 0 || Number.isNaN(_.z) || m.push(_.z), _.m === void 0 || Number.isNaN(_.m) || m.push(_.m), m;
        }), e = [], s = 0, l = t.length; s < l; ++s) e.push(t[s].join(" "));
        return e.join(", ");
      }
      function oi(o) {
        var t = [];
        t.push("(" + ai(o.getExteriorRing()) + ")");
        for (var e = 0, s = o.getNumInteriorRing(); e < s; ++e) t.push("(" + ai(o.getInteriorRingN(e)) + ")");
        return t.join(", ");
      }
      var eo = { Point: Ar, LineString: ai, LinearRing: ai, Polygon: oi, MultiPoint: function(o) {
        for (var t = [], e = 0, s = o.getNumGeometries(); e < s; ++e) t.push("(" + Ar(o.getGeometryN(e)) + ")");
        return t.join(", ");
      }, MultiLineString: function(o) {
        for (var t = [], e = 0, s = o.getNumGeometries(); e < s; ++e) t.push("(" + ai(o.getGeometryN(e)) + ")");
        return t.join(", ");
      }, MultiPolygon: function(o) {
        for (var t = [], e = 0, s = o.getNumGeometries(); e < s; ++e) t.push("(" + oi(o.getGeometryN(e)) + ")");
        return t.join(", ");
      }, GeometryCollection: function(o) {
        for (var t = [], e = 0, s = o.getNumGeometries(); e < s; ++e) t.push(bs(o.getGeometryN(e)));
        return t.join(", ");
      } };
      function bs(o) {
        var t = o.getGeometryType(), e = eo[t];
        t = t.toUpperCase();
        var s = function(l) {
          var _ = "";
          if (l.isEmpty()) return _;
          var m = l.getCoordinate();
          return m.z === void 0 || Number.isNaN(m.z) || (_ += "Z"), m.m === void 0 || Number.isNaN(m.m) || (_ += "M"), _;
        }(o);
        return s.length > 0 && (t += " " + s), o.isEmpty() ? t + " " + Ja : t + " (" + e(o) + ")";
      }
      var Uu = function() {
        return g(function o(t) {
          f(this, o), this.geometryFactory = t || new ki(), this.precisionModel = this.geometryFactory.getPrecisionModel();
        }, [{ key: "read", value: function(o) {
          var t = new Bu(o);
          return new to(t, this.geometryFactory).parse();
        } }, { key: "write", value: function(o) {
          return bs(o);
        } }]);
      }(), Lr = function() {
        return g(function o(t) {
          f(this, o), this.parser = new Uu(t);
        }, [{ key: "write", value: function(o) {
          return this.parser.write(o);
        } }], [{ key: "toLineString", value: function(o, t) {
          if (arguments.length !== 2) throw new Error("Not implemented");
          return "LINESTRING ( " + o.x + " " + o.y + ", " + t.x + " " + t.y + " )";
        } }]);
      }(), Vt = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "getIndexAlongSegment", value: function(t, e) {
          return this.computeIntLineIndex(), this._intLineIndex[t][e];
        } }, { key: "getTopologySummary", value: function() {
          var t = new ri();
          return this.isEndPoint() && t.append(" endpoint"), this._isProper && t.append(" proper"), this.isCollinear() && t.append(" collinear"), t.toString();
        } }, { key: "computeIntersection", value: function(t, e, s, l) {
          this._inputLines[0][0] = t, this._inputLines[0][1] = e, this._inputLines[1][0] = s, this._inputLines[1][1] = l, this._result = this.computeIntersect(t, e, s, l);
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
          return this._result !== o.NO_INTERSECTION;
        } }, { key: "getEdgeDistance", value: function(t, e) {
          return o.computeEdgeDistance(this._intPt[e], this._inputLines[t][0], this._inputLines[t][1]);
        } }, { key: "isCollinear", value: function() {
          return this._result === o.COLLINEAR_INTERSECTION;
        } }, { key: "toString", value: function() {
          return Lr.toLineString(this._inputLines[0][0], this._inputLines[0][1]) + " - " + Lr.toLineString(this._inputLines[1][0], this._inputLines[1][1]) + this.getTopologySummary();
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
          }), this._intPt = new Array(2).fill(null), this._intLineIndex = null, this._isProper = null, this._pa = null, this._pb = null, this._precisionModel = null, this._intPt[0] = new U(), this._intPt[1] = new U(), this._pa = this._intPt[0], this._pb = this._intPt[1], this._result = 0;
        } }, { key: "computeEdgeDistance", value: function(t, e, s) {
          var l = Math.abs(s.x - e.x), _ = Math.abs(s.y - e.y), m = -1;
          if (t.equals(e)) m = 0;
          else if (t.equals(s)) m = l > _ ? l : _;
          else {
            var E = Math.abs(t.x - e.x), N = Math.abs(t.y - e.y);
            (m = l > _ ? E : N) !== 0 || t.equals(e) || (m = Math.max(E, N));
          }
          return Nt.isTrue(!(m === 0 && !t.equals(e)), "Bad distance calculation"), m;
        } }, { key: "nonRobustComputeEdgeDistance", value: function(t, e, s) {
          var l = t.x - e.x, _ = t.y - e.y, m = Math.sqrt(l * l + _ * _);
          return Nt.isTrue(!(m === 0 && !t.equals(e)), "Invalid distance calculation"), m;
        } }]);
      }();
      Vt.DONT_INTERSECT = 0, Vt.DO_INTERSECT = 1, Vt.COLLINEAR = 2, Vt.NO_INTERSECTION = 0, Vt.POINT_INTERSECTION = 1, Vt.COLLINEAR_INTERSECTION = 2;
      var qn = function(o) {
        function t() {
          return f(this, t), h(this, t);
        }
        return x(t, o), g(t, [{ key: "isInSegmentEnvelopes", value: function(e) {
          var s = new Ht(this._inputLines[0][0], this._inputLines[0][1]), l = new Ht(this._inputLines[1][0], this._inputLines[1][1]);
          return s.contains(e) && l.contains(e);
        } }, { key: "computeIntersection", value: function() {
          if (arguments.length !== 3) return C(t, "computeIntersection", this, 1).apply(this, arguments);
          var e = arguments[0], s = arguments[1], l = arguments[2];
          if (this._isProper = !1, Ht.intersects(s, l, e) && pt.index(s, l, e) === 0 && pt.index(l, s, e) === 0) return this._isProper = !0, (e.equals(s) || e.equals(l)) && (this._isProper = !1), this._result = Vt.POINT_INTERSECTION, null;
          this._result = Vt.NO_INTERSECTION;
        } }, { key: "intersection", value: function(e, s, l, _) {
          var m = this.intersectionSafe(e, s, l, _);
          return this.isInSegmentEnvelopes(m) || (m = new U(t.nearestEndpoint(e, s, l, _))), this._precisionModel !== null && this._precisionModel.makePrecise(m), m;
        } }, { key: "checkDD", value: function(e, s, l, _, m) {
          var E = Vi.intersection(e, s, l, _), N = this.isInSegmentEnvelopes(E);
          Ue.out.println("DD in env = " + N + "  --------------------- " + E), m.distance(E) > 1e-4 && Ue.out.println("Distance = " + m.distance(E));
        } }, { key: "intersectionSafe", value: function(e, s, l, _) {
          var m = ps.intersection(e, s, l, _);
          return m === null && (m = t.nearestEndpoint(e, s, l, _)), m;
        } }, { key: "computeCollinearIntersection", value: function(e, s, l, _) {
          var m = Ht.intersects(e, s, l), E = Ht.intersects(e, s, _), N = Ht.intersects(l, _, e), R = Ht.intersects(l, _, s);
          return m && E ? (this._intPt[0] = l, this._intPt[1] = _, Vt.COLLINEAR_INTERSECTION) : N && R ? (this._intPt[0] = e, this._intPt[1] = s, Vt.COLLINEAR_INTERSECTION) : m && N ? (this._intPt[0] = l, this._intPt[1] = e, !l.equals(e) || E || R ? Vt.COLLINEAR_INTERSECTION : Vt.POINT_INTERSECTION) : m && R ? (this._intPt[0] = l, this._intPt[1] = s, !l.equals(s) || E || N ? Vt.COLLINEAR_INTERSECTION : Vt.POINT_INTERSECTION) : E && N ? (this._intPt[0] = _, this._intPt[1] = e, !_.equals(e) || m || R ? Vt.COLLINEAR_INTERSECTION : Vt.POINT_INTERSECTION) : E && R ? (this._intPt[0] = _, this._intPt[1] = s, !_.equals(s) || m || N ? Vt.COLLINEAR_INTERSECTION : Vt.POINT_INTERSECTION) : Vt.NO_INTERSECTION;
        } }, { key: "computeIntersect", value: function(e, s, l, _) {
          if (this._isProper = !1, !Ht.intersects(e, s, l, _)) return Vt.NO_INTERSECTION;
          var m = pt.index(e, s, l), E = pt.index(e, s, _);
          if (m > 0 && E > 0 || m < 0 && E < 0) return Vt.NO_INTERSECTION;
          var N = pt.index(l, _, e), R = pt.index(l, _, s);
          return N > 0 && R > 0 || N < 0 && R < 0 ? Vt.NO_INTERSECTION : m === 0 && E === 0 && N === 0 && R === 0 ? this.computeCollinearIntersection(e, s, l, _) : (m === 0 || E === 0 || N === 0 || R === 0 ? (this._isProper = !1, e.equals2D(l) || e.equals2D(_) ? this._intPt[0] = e : s.equals2D(l) || s.equals2D(_) ? this._intPt[0] = s : m === 0 ? this._intPt[0] = new U(l) : E === 0 ? this._intPt[0] = new U(_) : N === 0 ? this._intPt[0] = new U(e) : R === 0 && (this._intPt[0] = new U(s))) : (this._isProper = !0, this._intPt[0] = this.intersection(e, s, l, _)), Vt.POINT_INTERSECTION);
        } }], [{ key: "nearestEndpoint", value: function(e, s, l, _) {
          var m = e, E = on.pointToSegment(e, l, _), N = on.pointToSegment(s, l, _);
          return N < E && (E = N, m = s), (N = on.pointToSegment(l, e, s)) < E && (E = N, m = l), (N = on.pointToSegment(_, e, s)) < E && (E = N, m = _), m;
        } }]);
      }(Vt), no = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "countSegment", value: function(t, e) {
          if (t.x < this._p.x && e.x < this._p.x) return null;
          if (this._p.x === e.x && this._p.y === e.y) return this._isPointOnSegment = !0, null;
          if (t.y === this._p.y && e.y === this._p.y) {
            var s = t.x, l = e.x;
            return s > l && (s = e.x, l = t.x), this._p.x >= s && this._p.x <= l && (this._isPointOnSegment = !0), null;
          }
          if (t.y > this._p.y && e.y <= this._p.y || e.y > this._p.y && t.y <= this._p.y) {
            var _ = pt.index(t, e, this._p);
            if (_ === pt.COLLINEAR) return this._isPointOnSegment = !0, null;
            e.y < t.y && (_ = -_), _ === pt.LEFT && this._crossingCount++;
          }
        } }, { key: "isPointInPolygon", value: function() {
          return this.getLocation() !== A.EXTERIOR;
        } }, { key: "getLocation", value: function() {
          return this._isPointOnSegment ? A.BOUNDARY : this._crossingCount % 2 == 1 ? A.INTERIOR : A.EXTERIOR;
        } }, { key: "isOnSegment", value: function() {
          return this._isPointOnSegment;
        } }], [{ key: "constructor_", value: function() {
          this._p = null, this._crossingCount = 0, this._isPointOnSegment = !1;
          var t = arguments[0];
          this._p = t;
        } }, { key: "locatePointInRing", value: function() {
          if (arguments[0] instanceof U && wt(arguments[1], Tt)) {
            for (var t = arguments[1], e = new o(arguments[0]), s = new U(), l = new U(), _ = 1; _ < t.size(); _++) if (t.getCoordinate(_, s), t.getCoordinate(_ - 1, l), e.countSegment(s, l), e.isOnSegment()) return e.getLocation();
            return e.getLocation();
          }
          if (arguments[0] instanceof U && arguments[1] instanceof Array) {
            for (var m = arguments[1], E = new o(arguments[0]), N = 1; N < m.length; N++) {
              var R = m[N], D = m[N - 1];
              if (E.countSegment(R, D), E.isOnSegment()) return E.getLocation();
            }
            return E.getLocation();
          }
        } }]);
      }(), Rs = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "isOnLine", value: function() {
          if (arguments[0] instanceof U && wt(arguments[1], Tt)) {
            for (var t = arguments[0], e = arguments[1], s = new qn(), l = new U(), _ = new U(), m = e.size(), E = 1; E < m; E++) if (e.getCoordinate(E - 1, l), e.getCoordinate(E, _), s.computeIntersection(t, l, _), s.hasIntersection()) return !0;
            return !1;
          }
          if (arguments[0] instanceof U && arguments[1] instanceof Array) {
            for (var N = arguments[0], R = arguments[1], D = new qn(), q = 1; q < R.length; q++) {
              var Z = R[q - 1], st = R[q];
              if (D.computeIntersection(N, Z, st), D.hasIntersection()) return !0;
            }
            return !1;
          }
        } }, { key: "locateInRing", value: function(t, e) {
          return no.locatePointInRing(t, e);
        } }, { key: "isInRing", value: function(t, e) {
          return o.locateInRing(t, e) !== A.EXTERIOR;
        } }]);
      }(), Xe = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "setAllLocations", value: function(t) {
          for (var e = 0; e < this.location.length; e++) this.location[e] = t;
        } }, { key: "isNull", value: function() {
          for (var t = 0; t < this.location.length; t++) if (this.location[t] !== A.NONE) return !1;
          return !0;
        } }, { key: "setAllLocationsIfNull", value: function(t) {
          for (var e = 0; e < this.location.length; e++) this.location[e] === A.NONE && (this.location[e] = t);
        } }, { key: "isLine", value: function() {
          return this.location.length === 1;
        } }, { key: "merge", value: function(t) {
          if (t.location.length > this.location.length) {
            var e = new Array(3).fill(null);
            e[tt.ON] = this.location[tt.ON], e[tt.LEFT] = A.NONE, e[tt.RIGHT] = A.NONE, this.location = e;
          }
          for (var s = 0; s < this.location.length; s++) this.location[s] === A.NONE && s < t.location.length && (this.location[s] = t.location[s]);
        } }, { key: "getLocations", value: function() {
          return this.location;
        } }, { key: "flip", value: function() {
          if (this.location.length <= 1) return null;
          var t = this.location[tt.LEFT];
          this.location[tt.LEFT] = this.location[tt.RIGHT], this.location[tt.RIGHT] = t;
        } }, { key: "toString", value: function() {
          var t = new Cn();
          return this.location.length > 1 && t.append(A.toLocationSymbol(this.location[tt.LEFT])), t.append(A.toLocationSymbol(this.location[tt.ON])), this.location.length > 1 && t.append(A.toLocationSymbol(this.location[tt.RIGHT])), t.toString();
        } }, { key: "setLocations", value: function(t, e, s) {
          this.location[tt.ON] = t, this.location[tt.LEFT] = e, this.location[tt.RIGHT] = s;
        } }, { key: "get", value: function(t) {
          return t < this.location.length ? this.location[t] : A.NONE;
        } }, { key: "isArea", value: function() {
          return this.location.length > 1;
        } }, { key: "isAnyNull", value: function() {
          for (var t = 0; t < this.location.length; t++) if (this.location[t] === A.NONE) return !0;
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
          this.location = new Array(t).fill(null), this.setAllLocations(A.NONE);
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
            } else if (arguments[0] instanceof o) {
              var s = arguments[0];
              if (this.init(s.location.length), s !== null) for (var l = 0; l < this.location.length; l++) this.location[l] = s.location[l];
            }
          } else if (arguments.length === 3) {
            var _ = arguments[0], m = arguments[1], E = arguments[2];
            this.init(3), this.location[tt.ON] = _, this.location[tt.LEFT] = m, this.location[tt.RIGHT] = E;
          }
        } }]);
      }(), We = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "getGeometryCount", value: function() {
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
          for (var e = 0; e < 2; e++) this.elt[e] === null && t.elt[e] !== null ? this.elt[e] = new Xe(t.elt[e]) : this.elt[e].merge(t.elt[e]);
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
          var t = new Cn();
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
            var s = arguments[0], l = arguments[1], _ = arguments[2];
            this.elt[s].setLocation(l, _);
          }
        } }, { key: "isEqualOnSide", value: function(t, e) {
          return this.elt[0].isEqualOnSide(t.elt[0], e) && this.elt[1].isEqualOnSide(t.elt[1], e);
        } }, { key: "allPositionsEqual", value: function(t, e) {
          return this.elt[t].allPositionsEqual(e);
        } }, { key: "toLine", value: function(t) {
          this.elt[t].isArea() && (this.elt[t] = new Xe(this.elt[t].location[0]));
        } }], [{ key: "constructor_", value: function() {
          if (this.elt = new Array(2).fill(null), arguments.length === 1) {
            if (Number.isInteger(arguments[0])) {
              var t = arguments[0];
              this.elt[0] = new Xe(t), this.elt[1] = new Xe(t);
            } else if (arguments[0] instanceof o) {
              var e = arguments[0];
              this.elt[0] = new Xe(e.elt[0]), this.elt[1] = new Xe(e.elt[1]);
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], l = arguments[1];
            this.elt[0] = new Xe(A.NONE), this.elt[1] = new Xe(A.NONE), this.elt[s].setLocation(l);
          } else if (arguments.length === 3) {
            var _ = arguments[0], m = arguments[1], E = arguments[2];
            this.elt[0] = new Xe(_, m, E), this.elt[1] = new Xe(_, m, E);
          } else if (arguments.length === 4) {
            var N = arguments[0], R = arguments[1], D = arguments[2], q = arguments[3];
            this.elt[0] = new Xe(A.NONE, A.NONE, A.NONE), this.elt[1] = new Xe(A.NONE, A.NONE, A.NONE), this.elt[N].setLocations(R, D, q);
          }
        } }, { key: "toLineLabel", value: function(t) {
          for (var e = new o(A.NONE), s = 0; s < 2; s++) e.setLocation(s, t.getLocation(s));
          return e;
        } }]);
      }(), tr = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "computeRing", value: function() {
          if (this._ring !== null) return null;
          for (var o = new Array(this._pts.size()).fill(null), t = 0; t < this._pts.size(); t++) o[t] = this._pts.get(t);
          this._ring = this._geometryFactory.createLinearRing(o), this._isHole = pt.isCCW(this._ring.getCoordinates());
        } }, { key: "isIsolated", value: function() {
          return this._label.getGeometryCount() === 1;
        } }, { key: "computePoints", value: function(o) {
          this._startDe = o;
          var t = o, e = !0;
          do {
            if (t === null) throw new an("Found null DirectedEdge");
            if (t.getEdgeRing() === this) throw new an("Directed Edge visited twice during ring-building at " + t.getCoordinate());
            this._edges.add(t);
            var s = t.getLabel();
            Nt.isTrue(s.isArea()), this.mergeLabel(s), this.addPoints(t.getEdge(), t.isForward(), e), e = !1, this.setEdgeRing(t, this), t = this.getNext(t);
          } while (t !== this._startDe);
        } }, { key: "getLinearRing", value: function() {
          return this._ring;
        } }, { key: "getCoordinate", value: function(o) {
          return this._pts.get(o);
        } }, { key: "computeMaxNodeDegree", value: function() {
          this._maxNodeDegree = 0;
          var o = this._startDe;
          do {
            var t = o.getNode().getEdges().getOutgoingDegree(this);
            t > this._maxNodeDegree && (this._maxNodeDegree = t), o = this.getNext(o);
          } while (o !== this._startDe);
          this._maxNodeDegree *= 2;
        } }, { key: "addPoints", value: function(o, t, e) {
          var s = o.getCoordinates();
          if (t) {
            var l = 1;
            e && (l = 0);
            for (var _ = l; _ < s.length; _++) this._pts.add(s[_]);
          } else {
            var m = s.length - 2;
            e && (m = s.length - 1);
            for (var E = m; E >= 0; E--) this._pts.add(s[E]);
          }
        } }, { key: "isHole", value: function() {
          return this._isHole;
        } }, { key: "setInResult", value: function() {
          var o = this._startDe;
          do
            o.getEdge().setInResult(!0), o = o.getNext();
          while (o !== this._startDe);
        } }, { key: "containsPoint", value: function(o) {
          var t = this.getLinearRing();
          if (!t.getEnvelopeInternal().contains(o) || !Rs.isInRing(o, t.getCoordinates())) return !1;
          for (var e = this._holes.iterator(); e.hasNext(); )
            if (e.next().containsPoint(o)) return !1;
          return !0;
        } }, { key: "addHole", value: function(o) {
          this._holes.add(o);
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
            var o = arguments[0];
            this.mergeLabel(o, 0), this.mergeLabel(o, 1);
          } else if (arguments.length === 2) {
            var t = arguments[1], e = arguments[0].getLocation(t, tt.RIGHT);
            if (e === A.NONE) return null;
            if (this._label.getLocation(t) === A.NONE) return this._label.setLocation(t, e), null;
          }
        } }, { key: "setShell", value: function(o) {
          this._shell = o, o !== null && o.addHole(this);
        } }, { key: "toPolygon", value: function(o) {
          for (var t = new Array(this._holes.size()).fill(null), e = 0; e < this._holes.size(); e++) t[e] = this._holes.get(e).getLinearRing();
          return o.createPolygon(this.getLinearRing(), t);
        } }], [{ key: "constructor_", value: function() {
          if (this._startDe = null, this._maxNodeDegree = -1, this._edges = new mt(), this._pts = new mt(), this._label = new We(A.NONE), this._ring = null, this._isHole = null, this._shell = null, this._holes = new mt(), this._geometryFactory = null, arguments.length !== 0) {
            if (arguments.length === 2) {
              var o = arguments[0], t = arguments[1];
              this._geometryFactory = t, this.computePoints(o), this.computeRing();
            }
          }
        } }]);
      }(), zu = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "setEdgeRing", value: function(e, s) {
          e.setMinEdgeRing(s);
        } }, { key: "getNext", value: function(e) {
          return e.getNextMin();
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0], s = arguments[1];
          tr.constructor_.call(this, e, s);
        } }]);
      }(tr), Yu = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "buildMinimalRings", value: function() {
          var e = new mt(), s = this._startDe;
          do {
            if (s.getMinEdgeRing() === null) {
              var l = new zu(s, this._geometryFactory);
              e.add(l);
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
          tr.constructor_.call(this, e, s);
        } }]);
      }(tr), io = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "setVisited", value: function(o) {
          this._isVisited = o;
        } }, { key: "setInResult", value: function(o) {
          this._isInResult = o;
        } }, { key: "isCovered", value: function() {
          return this._isCovered;
        } }, { key: "isCoveredSet", value: function() {
          return this._isCoveredSet;
        } }, { key: "setLabel", value: function(o) {
          this._label = o;
        } }, { key: "getLabel", value: function() {
          return this._label;
        } }, { key: "setCovered", value: function(o) {
          this._isCovered = o, this._isCoveredSet = !0;
        } }, { key: "updateIM", value: function(o) {
          Nt.isTrue(this._label.getGeometryCount() >= 2, "found partial label"), this.computeIM(o);
        } }, { key: "isInResult", value: function() {
          return this._isInResult;
        } }, { key: "isVisited", value: function() {
          return this._isVisited;
        } }], [{ key: "constructor_", value: function() {
          if (this._label = null, this._isInResult = !1, this._isCovered = !1, this._isCoveredSet = !1, this._isVisited = !1, arguments.length !== 0) {
            if (arguments.length === 1) {
              var o = arguments[0];
              this._label = o;
            }
          }
        } }]);
      }(), Or = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "isIncidentEdgeInResult", value: function() {
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
          var l = A.NONE;
          if (l = this._label.getLocation(s), !e.isNull(s)) {
            var _ = e.getLocation(s);
            l !== A.BOUNDARY && (l = _);
          }
          return l;
        } }, { key: "setLabel", value: function() {
          if (arguments.length !== 2 || !Number.isInteger(arguments[1]) || !Number.isInteger(arguments[0])) return C(t, "setLabel", this, 1).apply(this, arguments);
          var e = arguments[0], s = arguments[1];
          this._label === null ? this._label = new We(e, s) : this._label.setLocation(e, s);
        } }, { key: "getEdges", value: function() {
          return this._edges;
        } }, { key: "mergeLabel", value: function() {
          if (arguments[0] instanceof t) {
            var e = arguments[0];
            this.mergeLabel(e._label);
          } else if (arguments[0] instanceof We) for (var s = arguments[0], l = 0; l < 2; l++) {
            var _ = this.computeMergedLocation(s, l);
            this._label.getLocation(l) === A.NONE && this._label.setLocation(l, _);
          }
        } }, { key: "add", value: function(e) {
          this._edges.insert(e), e.setNode(this);
        } }, { key: "setLabelBoundary", value: function(e) {
          if (this._label === null) return null;
          var s = A.NONE;
          this._label !== null && (s = this._label.getLocation(e));
          var l = null;
          switch (s) {
            case A.BOUNDARY:
              l = A.INTERIOR;
              break;
            case A.INTERIOR:
            default:
              l = A.BOUNDARY;
          }
          this._label.setLocation(e, l);
        } }], [{ key: "constructor_", value: function() {
          this._coord = null, this._edges = null;
          var e = arguments[0], s = arguments[1];
          this._coord = e, this._edges = s, this._label = new We(0, A.NONE);
        } }]);
      }(io), Ts = function(o) {
        function t() {
          return f(this, t), h(this, t, arguments);
        }
        return x(t, o), g(t);
      }(Ns);
      function ro(o) {
        return o == null ? 0 : o.color;
      }
      function Ft(o) {
        return o == null ? null : o.parent;
      }
      function dn(o, t) {
        o !== null && (o.color = t);
      }
      function As(o) {
        return o == null ? null : o.left;
      }
      function so(o) {
        return o == null ? null : o.right;
      }
      var Bt = function(o) {
        function t() {
          var e;
          return f(this, t), (e = h(this, t)).root_ = null, e.size_ = 0, e;
        }
        return x(t, o), g(t, [{ key: "get", value: function(e) {
          for (var s = this.root_; s !== null; ) {
            var l = e.compareTo(s.key);
            if (l < 0) s = s.left;
            else {
              if (!(l > 0)) return s.value;
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
          var l, _, m = this.root_;
          do
            if (l = m, (_ = e.compareTo(m.key)) < 0) m = m.left;
            else {
              if (!(_ > 0)) {
                var E = m.value;
                return m.value = s, E;
              }
              m = m.right;
            }
          while (m !== null);
          var N = { key: e, left: null, right: null, value: s, parent: l, color: 0, getValue: function() {
            return this.value;
          }, getKey: function() {
            return this.key;
          } };
          return _ < 0 ? l.left = N : l.right = N, this.fixAfterInsertion(N), this.size_++, null;
        } }, { key: "fixAfterInsertion", value: function(e) {
          var s;
          for (e.color = 1; e != null && e !== this.root_ && e.parent.color === 1; ) Ft(e) === As(Ft(Ft(e))) ? ro(s = so(Ft(Ft(e)))) === 1 ? (dn(Ft(e), 0), dn(s, 0), dn(Ft(Ft(e)), 1), e = Ft(Ft(e))) : (e === so(Ft(e)) && (e = Ft(e), this.rotateLeft(e)), dn(Ft(e), 0), dn(Ft(Ft(e)), 1), this.rotateRight(Ft(Ft(e)))) : ro(s = As(Ft(Ft(e)))) === 1 ? (dn(Ft(e), 0), dn(s, 0), dn(Ft(Ft(e)), 1), e = Ft(Ft(e))) : (e === As(Ft(e)) && (e = Ft(e), this.rotateRight(e)), dn(Ft(e), 0), dn(Ft(Ft(e)), 1), this.rotateLeft(Ft(Ft(e))));
          this.root_.color = 0;
        } }, { key: "values", value: function() {
          var e = new mt(), s = this.getFirstEntry();
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
            var l = e.compareTo(s.key);
            if (l < 0) s = s.left;
            else {
              if (!(l > 0)) return !0;
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
          for (var l = e; s !== null && l === s.right; ) l = s, s = s.parent;
          return s;
        } }]);
      }(Ts), Xt = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "find", value: function(o) {
          return this.nodeMap.get(o);
        } }, { key: "addNode", value: function() {
          if (arguments[0] instanceof U) {
            var o = arguments[0], t = this.nodeMap.get(o);
            return t === null && (t = this.nodeFact.createNode(o), this.nodeMap.put(o, t)), t;
          }
          if (arguments[0] instanceof Or) {
            var e = arguments[0], s = this.nodeMap.get(e.getCoordinate());
            return s === null ? (this.nodeMap.put(e.getCoordinate(), e), e) : (s.mergeLabel(e), s);
          }
        } }, { key: "print", value: function(o) {
          for (var t = this.iterator(); t.hasNext(); )
            t.next().print(o);
        } }, { key: "iterator", value: function() {
          return this.nodeMap.values().iterator();
        } }, { key: "values", value: function() {
          return this.nodeMap.values();
        } }, { key: "getBoundaryNodes", value: function(o) {
          for (var t = new mt(), e = this.iterator(); e.hasNext(); ) {
            var s = e.next();
            s.getLabel().getLocation(o) === A.BOUNDARY && t.add(s);
          }
          return t;
        } }, { key: "add", value: function(o) {
          var t = o.getCoordinate();
          this.addNode(t).add(o);
        } }], [{ key: "constructor_", value: function() {
          this.nodeMap = new Bt(), this.nodeFact = null;
          var o = arguments[0];
          this.nodeFact = o;
        } }]);
      }(), pe = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "isNorthern", value: function(t) {
          return t === o.NE || t === o.NW;
        } }, { key: "isOpposite", value: function(t, e) {
          return t !== e && (t - e + 4) % 4 === 2;
        } }, { key: "commonHalfPlane", value: function(t, e) {
          if (t === e) return t;
          if ((t - e + 4) % 4 === 2) return -1;
          var s = t < e ? t : e;
          return s === 0 && (t > e ? t : e) === 3 ? 3 : s;
        } }, { key: "isInHalfPlane", value: function(t, e) {
          return e === o.SE ? t === o.SE || t === o.SW : t === e || t === e + 1;
        } }, { key: "quadrant", value: function() {
          if (typeof arguments[0] == "number" && typeof arguments[1] == "number") {
            var t = arguments[0], e = arguments[1];
            if (t === 0 && e === 0) throw new X("Cannot compute the quadrant for point ( " + t + ", " + e + " )");
            return t >= 0 ? e >= 0 ? o.NE : o.SE : e >= 0 ? o.NW : o.SW;
          }
          if (arguments[0] instanceof U && arguments[1] instanceof U) {
            var s = arguments[0], l = arguments[1];
            if (l.x === s.x && l.y === s.y) throw new X("Cannot compute the quadrant for two identical points " + s);
            return l.x >= s.x ? l.y >= s.y ? o.NE : o.SE : l.y >= s.y ? o.NW : o.SW;
          }
        } }]);
      }();
      pe.NE = 0, pe.NW = 1, pe.SW = 2, pe.SE = 3;
      var ao = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "compareDirection", value: function(t) {
          return this._dx === t._dx && this._dy === t._dy ? 0 : this._quadrant > t._quadrant ? 1 : this._quadrant < t._quadrant ? -1 : pt.index(t._p0, t._p1, this._p1);
        } }, { key: "getDy", value: function() {
          return this._dy;
        } }, { key: "getCoordinate", value: function() {
          return this._p0;
        } }, { key: "setNode", value: function(t) {
          this._node = t;
        } }, { key: "print", value: function(t) {
          var e = Math.atan2(this._dy, this._dx), s = this.getClass().getName(), l = s.lastIndexOf("."), _ = s.substring(l + 1);
          t.print("  " + _ + ": " + this._p0 + " - " + this._p1 + " " + this._quadrant + ":" + e + "   " + this._label);
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
          this._p0 = t, this._p1 = e, this._dx = e.x - t.x, this._dy = e.y - t.y, this._quadrant = pe.quadrant(this._dx, this._dy), Nt.isTrue(!(this._dx === 0 && this._dy === 0), "EdgeEnd with identical endpoints found");
        } }, { key: "interfaces_", get: function() {
          return [K];
        } }], [{ key: "constructor_", value: function() {
          if (this._edge = null, this._label = null, this._node = null, this._p0 = null, this._p1 = null, this._dx = null, this._dy = null, this._quadrant = null, arguments.length === 1) {
            var t = arguments[0];
            this._edge = t;
          } else if (arguments.length === 3) {
            var e = arguments[0], s = arguments[1], l = arguments[2];
            o.constructor_.call(this, e, s, l, null);
          } else if (arguments.length === 4) {
            var _ = arguments[0], m = arguments[1], E = arguments[2], N = arguments[3];
            o.constructor_.call(this, _), this.init(m, E), this._label = N;
          }
        } }]);
      }(), Ls = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "getNextMin", value: function() {
          return this._nextMin;
        } }, { key: "getDepth", value: function(e) {
          return this._depth[e];
        } }, { key: "setVisited", value: function(e) {
          this._isVisited = e;
        } }, { key: "computeDirectedLabel", value: function() {
          this._label = new We(this._edge.getLabel()), this._isForward || this._label.flip();
        } }, { key: "getNext", value: function() {
          return this._next;
        } }, { key: "setDepth", value: function(e, s) {
          if (this._depth[e] !== -999 && this._depth[e] !== s) throw new an("assigned depths do not match", this.getCoordinate());
          this._depth[e] = s;
        } }, { key: "isInteriorAreaEdge", value: function() {
          for (var e = !0, s = 0; s < 2; s++) this._label.isArea(s) && this._label.getLocation(s, tt.LEFT) === A.INTERIOR && this._label.getLocation(s, tt.RIGHT) === A.INTERIOR || (e = !1);
          return e;
        } }, { key: "setNextMin", value: function(e) {
          this._nextMin = e;
        } }, { key: "print", value: function(e) {
          C(t, "print", this, 1).call(this, e), e.print(" " + this._depth[tt.LEFT] + "/" + this._depth[tt.RIGHT]), e.print(" (" + this.getDepthDelta() + ")"), this._isInResult && e.print(" inResult");
        } }, { key: "setMinEdgeRing", value: function(e) {
          this._minEdgeRing = e;
        } }, { key: "isLineEdge", value: function() {
          var e = this._label.isLine(0) || this._label.isLine(1), s = !this._label.isArea(0) || this._label.allPositionsEqual(0, A.EXTERIOR), l = !this._label.isArea(1) || this._label.allPositionsEqual(1, A.EXTERIOR);
          return e && s && l;
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
          var l = this.getEdge().getDepthDelta();
          this._isForward || (l = -l);
          var _ = 1;
          e === tt.LEFT && (_ = -1);
          var m = tt.opposite(e), E = s + l * _;
          this.setDepth(e, s), this.setDepth(m, E);
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
          if (ao.constructor_.call(this, e), this._isForward = s, s) this.init(e.getCoordinate(0), e.getCoordinate(1));
          else {
            var l = e.getNumPoints() - 1;
            this.init(e.getCoordinate(l), e.getCoordinate(l - 1));
          }
          this.computeDirectedLabel();
        } }, { key: "depthFactor", value: function(e, s) {
          return e === A.EXTERIOR && s === A.INTERIOR ? 1 : e === A.INTERIOR && s === A.EXTERIOR ? -1 : 0;
        } }]);
      }(ao), oo = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "createNode", value: function(o) {
          return new Or(o, null);
        } }]);
      }(), uo = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "printEdges", value: function(o) {
          o.println("Edges:");
          for (var t = 0; t < this._edges.size(); t++) {
            o.println("edge " + t + ":");
            var e = this._edges.get(t);
            e.print(o), e.eiList.print(o);
          }
        } }, { key: "find", value: function(o) {
          return this._nodes.find(o);
        } }, { key: "addNode", value: function() {
          if (arguments[0] instanceof Or) {
            var o = arguments[0];
            return this._nodes.addNode(o);
          }
          if (arguments[0] instanceof U) {
            var t = arguments[0];
            return this._nodes.addNode(t);
          }
        } }, { key: "getNodeIterator", value: function() {
          return this._nodes.iterator();
        } }, { key: "linkResultDirectedEdges", value: function() {
          for (var o = this._nodes.iterator(); o.hasNext(); )
            o.next().getEdges().linkResultDirectedEdges();
        } }, { key: "debugPrintln", value: function(o) {
          Ue.out.println(o);
        } }, { key: "isBoundaryNode", value: function(o, t) {
          var e = this._nodes.find(t);
          if (e === null) return !1;
          var s = e.getLabel();
          return s !== null && s.getLocation(o) === A.BOUNDARY;
        } }, { key: "linkAllDirectedEdges", value: function() {
          for (var o = this._nodes.iterator(); o.hasNext(); )
            o.next().getEdges().linkAllDirectedEdges();
        } }, { key: "matchInSameDirection", value: function(o, t, e, s) {
          return !!o.equals(e) && pt.index(o, t, s) === pt.COLLINEAR && pe.quadrant(o, t) === pe.quadrant(e, s);
        } }, { key: "getEdgeEnds", value: function() {
          return this._edgeEndList;
        } }, { key: "debugPrint", value: function(o) {
          Ue.out.print(o);
        } }, { key: "getEdgeIterator", value: function() {
          return this._edges.iterator();
        } }, { key: "findEdgeInSameDirection", value: function(o, t) {
          for (var e = 0; e < this._edges.size(); e++) {
            var s = this._edges.get(e), l = s.getCoordinates();
            if (this.matchInSameDirection(o, t, l[0], l[1]) || this.matchInSameDirection(o, t, l[l.length - 1], l[l.length - 2])) return s;
          }
          return null;
        } }, { key: "insertEdge", value: function(o) {
          this._edges.add(o);
        } }, { key: "findEdgeEnd", value: function(o) {
          for (var t = this.getEdgeEnds().iterator(); t.hasNext(); ) {
            var e = t.next();
            if (e.getEdge() === o) return e;
          }
          return null;
        } }, { key: "addEdges", value: function(o) {
          for (var t = o.iterator(); t.hasNext(); ) {
            var e = t.next();
            this._edges.add(e);
            var s = new Ls(e, !0), l = new Ls(e, !1);
            s.setSym(l), l.setSym(s), this.add(s), this.add(l);
          }
        } }, { key: "add", value: function(o) {
          this._nodes.add(o), this._edgeEndList.add(o);
        } }, { key: "getNodes", value: function() {
          return this._nodes.values();
        } }, { key: "findEdge", value: function(o, t) {
          for (var e = 0; e < this._edges.size(); e++) {
            var s = this._edges.get(e), l = s.getCoordinates();
            if (o.equals(l[0]) && t.equals(l[1])) return s;
          }
          return null;
        } }], [{ key: "constructor_", value: function() {
          if (this._edges = new mt(), this._nodes = null, this._edgeEndList = new mt(), arguments.length === 0) this._nodes = new Xt(new oo());
          else if (arguments.length === 1) {
            var o = arguments[0];
            this._nodes = new Xt(o);
          }
        } }, { key: "linkResultDirectedEdges", value: function(o) {
          for (var t = o.iterator(); t.hasNext(); )
            t.next().getEdges().linkResultDirectedEdges();
        } }]);
      }(), Xu = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "sortShellsAndHoles", value: function(t, e, s) {
          for (var l = t.iterator(); l.hasNext(); ) {
            var _ = l.next();
            _.isHole() ? s.add(_) : e.add(_);
          }
        } }, { key: "computePolygons", value: function(t) {
          for (var e = new mt(), s = t.iterator(); s.hasNext(); ) {
            var l = s.next().toPolygon(this._geometryFactory);
            e.add(l);
          }
          return e;
        } }, { key: "placeFreeHoles", value: function(t, e) {
          for (var s = e.iterator(); s.hasNext(); ) {
            var l = s.next();
            if (l.getShell() === null) {
              var _ = o.findEdgeRingContaining(l, t);
              if (_ === null) throw new an("unable to assign hole to a shell", l.getCoordinate(0));
              l.setShell(_);
            }
          }
        } }, { key: "buildMinimalEdgeRings", value: function(t, e, s) {
          for (var l = new mt(), _ = t.iterator(); _.hasNext(); ) {
            var m = _.next();
            if (m.getMaxNodeDegree() > 2) {
              m.linkDirectedEdgesForMinimalEdgeRings();
              var E = m.buildMinimalRings(), N = this.findShell(E);
              N !== null ? (this.placePolygonHoles(N, E), e.add(N)) : s.addAll(E);
            } else l.add(m);
          }
          return l;
        } }, { key: "buildMaximalEdgeRings", value: function(t) {
          for (var e = new mt(), s = t.iterator(); s.hasNext(); ) {
            var l = s.next();
            if (l.isInResult() && l.getLabel().isArea() && l.getEdgeRing() === null) {
              var _ = new Yu(l, this._geometryFactory);
              e.add(_), _.setInResult();
            }
          }
          return e;
        } }, { key: "placePolygonHoles", value: function(t, e) {
          for (var s = e.iterator(); s.hasNext(); ) {
            var l = s.next();
            l.isHole() && l.setShell(t);
          }
        } }, { key: "getPolygons", value: function() {
          return this.computePolygons(this._shellList);
        } }, { key: "findShell", value: function(t) {
          for (var e = 0, s = null, l = t.iterator(); l.hasNext(); ) {
            var _ = l.next();
            _.isHole() || (s = _, e++);
          }
          return Nt.isTrue(e <= 1, "found two shells in MinimalEdgeRing list"), s;
        } }, { key: "add", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            this.add(t.getEdgeEnds(), t.getNodes());
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            uo.linkResultDirectedEdges(s);
            var l = this.buildMaximalEdgeRings(e), _ = new mt(), m = this.buildMinimalEdgeRings(l, this._shellList, _);
            this.sortShellsAndHoles(m, this._shellList, _), this.placeFreeHoles(this._shellList, _);
          }
        } }], [{ key: "constructor_", value: function() {
          this._geometryFactory = null, this._shellList = new mt();
          var t = arguments[0];
          this._geometryFactory = t;
        } }, { key: "findEdgeRingContaining", value: function(t, e) {
          for (var s = t.getLinearRing(), l = s.getEnvelopeInternal(), _ = s.getCoordinateN(0), m = null, E = null, N = e.iterator(); N.hasNext(); ) {
            var R = N.next(), D = R.getLinearRing(), q = D.getEnvelopeInternal();
            if (!q.equals(l) && q.contains(l)) {
              _ = re.ptNotInList(s.getCoordinates(), D.getCoordinates());
              var Z = !1;
              Rs.isInRing(_, D.getCoordinates()) && (Z = !0), Z && (m === null || E.contains(q)) && (E = (m = R).getLinearRing().getEnvelopeInternal());
            }
          }
          return m;
        } }]);
      }(), Os = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "getBounds", value: function() {
        } }]);
      }(), Rn = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "getItem", value: function() {
          return this._item;
        } }, { key: "getBounds", value: function() {
          return this._bounds;
        } }, { key: "interfaces_", get: function() {
          return [Os, j];
        } }], [{ key: "constructor_", value: function() {
          this._bounds = null, this._item = null;
          var o = arguments[0], t = arguments[1];
          this._bounds = o, this._item = t;
        } }]);
      }(), ne = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "poll", value: function() {
          if (this.isEmpty()) return null;
          var o = this._items.get(1);
          return this._items.set(1, this._items.get(this._size)), this._size -= 1, this.reorder(1), o;
        } }, { key: "size", value: function() {
          return this._size;
        } }, { key: "reorder", value: function(o) {
          for (var t = null, e = this._items.get(o); 2 * o <= this._size && ((t = 2 * o) !== this._size && this._items.get(t + 1).compareTo(this._items.get(t)) < 0 && t++, this._items.get(t).compareTo(e) < 0); o = t) this._items.set(o, this._items.get(t));
          this._items.set(o, e);
        } }, { key: "clear", value: function() {
          this._size = 0, this._items.clear();
        } }, { key: "peek", value: function() {
          return this.isEmpty() ? null : this._items.get(1);
        } }, { key: "isEmpty", value: function() {
          return this._size === 0;
        } }, { key: "add", value: function(o) {
          this._items.add(null), this._size += 1;
          var t = this._size;
          for (this._items.set(0, o); o.compareTo(this._items.get(Math.trunc(t / 2))) < 0; t /= 2) this._items.set(t, this._items.get(Math.trunc(t / 2)));
          this._items.set(t, o);
        } }], [{ key: "constructor_", value: function() {
          this._size = null, this._items = null, this._size = 0, this._items = new mt(), this._items.add(null);
        } }]);
      }(), Gs = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "insert", value: function(o, t) {
        } }, { key: "remove", value: function(o, t) {
        } }, { key: "query", value: function() {
        } }]);
      }(), fe = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "getLevel", value: function() {
          return this._level;
        } }, { key: "size", value: function() {
          return this._childBoundables.size();
        } }, { key: "getChildBoundables", value: function() {
          return this._childBoundables;
        } }, { key: "addChildBoundable", value: function(o) {
          Nt.isTrue(this._bounds === null), this._childBoundables.add(o);
        } }, { key: "isEmpty", value: function() {
          return this._childBoundables.isEmpty();
        } }, { key: "getBounds", value: function() {
          return this._bounds === null && (this._bounds = this.computeBounds()), this._bounds;
        } }, { key: "interfaces_", get: function() {
          return [Os, j];
        } }], [{ key: "constructor_", value: function() {
          if (this._childBoundables = new mt(), this._bounds = null, this._level = null, arguments.length !== 0) {
            if (arguments.length === 1) {
              var o = arguments[0];
              this._level = o;
            }
          }
        } }]);
      }(), ui = { reverseOrder: function() {
        return { compare: function(o, t) {
          return t.compareTo(o);
        } };
      }, min: function(o) {
        return ui.sort(o), o.get(0);
      }, sort: function(o, t) {
        var e = o.toArray();
        t ? ei.sort(e, t) : ei.sort(e);
        for (var s = o.iterator(), l = 0, _ = e.length; l < _; l++) s.next(), s.set(e[l]);
      }, singletonList: function(o) {
        var t = new mt();
        return t.add(o), t;
      } }, Ds = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "maxDistance", value: function(t, e, s, l, _, m, E, N) {
          var R = o.distance(t, e, _, m);
          return R = Math.max(R, o.distance(t, e, E, N)), R = Math.max(R, o.distance(s, l, _, m)), R = Math.max(R, o.distance(s, l, E, N));
        } }, { key: "distance", value: function(t, e, s, l) {
          var _ = s - t, m = l - e;
          return Math.sqrt(_ * _ + m * m);
        } }, { key: "maximumDistance", value: function(t, e) {
          var s = Math.min(t.getMinX(), e.getMinX()), l = Math.min(t.getMinY(), e.getMinY()), _ = Math.max(t.getMaxX(), e.getMaxX()), m = Math.max(t.getMaxY(), e.getMaxY());
          return o.distance(s, l, _, m);
        } }, { key: "minMaxDistance", value: function(t, e) {
          var s = t.getMinX(), l = t.getMinY(), _ = t.getMaxX(), m = t.getMaxY(), E = e.getMinX(), N = e.getMinY(), R = e.getMaxX(), D = e.getMaxY(), q = o.maxDistance(s, l, s, m, E, N, E, D);
          return q = Math.min(q, o.maxDistance(s, l, s, m, E, N, R, N)), q = Math.min(q, o.maxDistance(s, l, s, m, R, D, E, D)), q = Math.min(q, o.maxDistance(s, l, s, m, R, D, R, N)), q = Math.min(q, o.maxDistance(s, l, _, l, E, N, E, D)), q = Math.min(q, o.maxDistance(s, l, _, l, E, N, R, N)), q = Math.min(q, o.maxDistance(s, l, _, l, R, D, E, D)), q = Math.min(q, o.maxDistance(s, l, _, l, R, D, R, N)), q = Math.min(q, o.maxDistance(_, m, s, m, E, N, E, D)), q = Math.min(q, o.maxDistance(_, m, s, m, E, N, R, N)), q = Math.min(q, o.maxDistance(_, m, s, m, R, D, E, D)), q = Math.min(q, o.maxDistance(_, m, s, m, R, D, R, N)), q = Math.min(q, o.maxDistance(_, m, _, l, E, N, E, D)), q = Math.min(q, o.maxDistance(_, m, _, l, E, N, R, N)), q = Math.min(q, o.maxDistance(_, m, _, l, R, D, E, D)), q = Math.min(q, o.maxDistance(_, m, _, l, R, D, R, N));
        } }]);
      }(), ge = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "maximumDistance", value: function() {
          return Ds.maximumDistance(this._boundable1.getBounds(), this._boundable2.getBounds());
        } }, { key: "expandToQueue", value: function(t, e) {
          var s = o.isComposite(this._boundable1), l = o.isComposite(this._boundable2);
          if (s && l) return o.area(this._boundable1) > o.area(this._boundable2) ? (this.expand(this._boundable1, this._boundable2, !1, t, e), null) : (this.expand(this._boundable2, this._boundable1, !0, t, e), null);
          if (s) return this.expand(this._boundable1, this._boundable2, !1, t, e), null;
          if (l) return this.expand(this._boundable2, this._boundable1, !0, t, e), null;
          throw new X("neither boundable is composite");
        } }, { key: "isLeaves", value: function() {
          return !(o.isComposite(this._boundable1) || o.isComposite(this._boundable2));
        } }, { key: "compareTo", value: function(t) {
          var e = t;
          return this._distance < e._distance ? -1 : this._distance > e._distance ? 1 : 0;
        } }, { key: "expand", value: function(t, e, s, l, _) {
          for (var m = t.getChildBoundables().iterator(); m.hasNext(); ) {
            var E = m.next(), N = null;
            (N = s ? new o(e, E, this._itemDistance) : new o(E, e, this._itemDistance)).getDistance() < _ && l.add(N);
          }
        } }, { key: "getBoundable", value: function(t) {
          return t === 0 ? this._boundable1 : this._boundable2;
        } }, { key: "getDistance", value: function() {
          return this._distance;
        } }, { key: "distance", value: function() {
          return this.isLeaves() ? this._itemDistance.distance(this._boundable1, this._boundable2) : this._boundable1.getBounds().distance(this._boundable2.getBounds());
        } }, { key: "interfaces_", get: function() {
          return [K];
        } }], [{ key: "constructor_", value: function() {
          this._boundable1 = null, this._boundable2 = null, this._distance = null, this._itemDistance = null;
          var t = arguments[0], e = arguments[1], s = arguments[2];
          this._boundable1 = t, this._boundable2 = e, this._itemDistance = s, this._distance = this.distance();
        } }, { key: "area", value: function(t) {
          return t.getBounds().getArea();
        } }, { key: "isComposite", value: function(t) {
          return t instanceof fe;
        } }]);
      }(), Fs = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "visitItem", value: function(o) {
        } }]);
      }(), hi = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "queryInternal", value: function() {
          if (wt(arguments[2], Fs) && arguments[0] instanceof Object && arguments[1] instanceof fe) for (var t = arguments[0], e = arguments[2], s = arguments[1].getChildBoundables(), l = 0; l < s.size(); l++) {
            var _ = s.get(l);
            this.getIntersectsOp().intersects(_.getBounds(), t) && (_ instanceof fe ? this.queryInternal(t, _, e) : _ instanceof Rn ? e.visitItem(_.getItem()) : Nt.shouldNeverReachHere());
          }
          else if (wt(arguments[2], sn) && arguments[0] instanceof Object && arguments[1] instanceof fe) for (var m = arguments[0], E = arguments[2], N = arguments[1].getChildBoundables(), R = 0; R < N.size(); R++) {
            var D = N.get(R);
            this.getIntersectsOp().intersects(D.getBounds(), m) && (D instanceof fe ? this.queryInternal(m, D, E) : D instanceof Rn ? E.add(D.getItem()) : Nt.shouldNeverReachHere());
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
              s instanceof fe ? t += this.size(s) : s instanceof Rn && (t += 1);
            }
            return t;
          }
        } }, { key: "removeItem", value: function(t, e) {
          for (var s = null, l = t.getChildBoundables().iterator(); l.hasNext(); ) {
            var _ = l.next();
            _ instanceof Rn && _.getItem() === e && (s = _);
          }
          return s !== null && (t.getChildBoundables().remove(s), !0);
        } }, { key: "itemsTree", value: function() {
          if (arguments.length === 0) {
            this.build();
            var t = this.itemsTree(this._root);
            return t === null ? new mt() : t;
          }
          if (arguments.length === 1) {
            for (var e = arguments[0], s = new mt(), l = e.getChildBoundables().iterator(); l.hasNext(); ) {
              var _ = l.next();
              if (_ instanceof fe) {
                var m = this.itemsTree(_);
                m !== null && s.add(m);
              } else _ instanceof Rn ? s.add(_.getItem()) : Nt.shouldNeverReachHere();
            }
            return s.size() <= 0 ? null : s;
          }
        } }, { key: "insert", value: function(t, e) {
          Nt.isTrue(!this._built, "Cannot insert items into an STR packed R-tree after it has been built."), this._itemBoundables.add(new Rn(t, e));
        } }, { key: "boundablesAtLevel", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0], e = new mt();
            return this.boundablesAtLevel(t, this._root, e), e;
          }
          if (arguments.length === 3) {
            var s = arguments[0], l = arguments[1], _ = arguments[2];
            if (Nt.isTrue(s > -2), l.getLevel() === s) return _.add(l), null;
            for (var m = l.getChildBoundables().iterator(); m.hasNext(); ) {
              var E = m.next();
              E instanceof fe ? this.boundablesAtLevel(s, E, _) : (Nt.isTrue(E instanceof Rn), s === -1 && _.add(E));
            }
            return null;
          }
        } }, { key: "query", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            this.build();
            var e = new mt();
            return this.isEmpty() || this.getIntersectsOp().intersects(this._root.getBounds(), t) && this.queryInternal(t, this._root, e), e;
          }
          if (arguments.length === 2) {
            var s = arguments[0], l = arguments[1];
            if (this.build(), this.isEmpty()) return null;
            this.getIntersectsOp().intersects(this._root.getBounds(), s) && this.queryInternal(s, this._root, l);
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
            var s = arguments[0], l = arguments[1], _ = arguments[2], m = this.removeItem(l, _);
            if (m) return !0;
            for (var E = null, N = l.getChildBoundables().iterator(); N.hasNext(); ) {
              var R = N.next();
              if (this.getIntersectsOp().intersects(R.getBounds(), s) && R instanceof fe && (m = this.remove(s, R, _))) {
                E = R;
                break;
              }
            }
            return E !== null && E.getChildBoundables().isEmpty() && l.getChildBoundables().remove(E), m;
          }
        } }, { key: "createHigherLevels", value: function(t, e) {
          Nt.isTrue(!t.isEmpty());
          var s = this.createParentBoundables(t, e + 1);
          return s.size() === 1 ? s.get(0) : this.createHigherLevels(s, e + 1);
        } }, { key: "depth", value: function() {
          if (arguments.length === 0) return this.isEmpty() ? 0 : (this.build(), this.depth(this._root));
          if (arguments.length === 1) {
            for (var t = 0, e = arguments[0].getChildBoundables().iterator(); e.hasNext(); ) {
              var s = e.next();
              if (s instanceof fe) {
                var l = this.depth(s);
                l > t && (t = l);
              }
            }
            return t + 1;
          }
        } }, { key: "createParentBoundables", value: function(t, e) {
          Nt.isTrue(!t.isEmpty());
          var s = new mt();
          s.add(this.createNode(e));
          var l = new mt(t);
          ui.sort(l, this.getComparator());
          for (var _ = l.iterator(); _.hasNext(); ) {
            var m = _.next();
            this.lastNode(s).getChildBoundables().size() === this.getNodeCapacity() && s.add(this.createNode(e)), this.lastNode(s).addChildBoundable(m);
          }
          return s;
        } }, { key: "isEmpty", value: function() {
          return this._built ? this._root.isEmpty() : this._itemBoundables.isEmpty();
        } }, { key: "interfaces_", get: function() {
          return [j];
        } }], [{ key: "constructor_", value: function() {
          if (this._root = null, this._built = !1, this._itemBoundables = new mt(), this._nodeCapacity = null, arguments.length === 0) o.constructor_.call(this, o.DEFAULT_NODE_CAPACITY);
          else if (arguments.length === 1) {
            var t = arguments[0];
            Nt.isTrue(t > 1, "Node capacity must be greater than 1"), this._nodeCapacity = t;
          }
        } }, { key: "compareDoubles", value: function(t, e) {
          return t > e ? 1 : t < e ? -1 : 0;
        } }]);
      }();
      hi.IntersectsOp = function() {
      }, hi.DEFAULT_NODE_CAPACITY = 10;
      var ho = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "distance", value: function(o, t) {
        } }]);
      }(), un = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "createParentBoundablesFromVerticalSlices", value: function(e, s) {
          Nt.isTrue(e.length > 0);
          for (var l = new mt(), _ = 0; _ < e.length; _++) l.addAll(this.createParentBoundablesFromVerticalSlice(e[_], s));
          return l;
        } }, { key: "nearestNeighbourK", value: function() {
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            return this.nearestNeighbourK(e, ht.POSITIVE_INFINITY, s);
          }
          if (arguments.length === 3) {
            var l = arguments[0], _ = arguments[2], m = arguments[1], E = new ne();
            E.add(l);
            for (var N = new ne(); !E.isEmpty() && m >= 0; ) {
              var R = E.poll(), D = R.getDistance();
              if (D >= m) break;
              R.isLeaves() ? N.size() < _ ? N.add(R) : (N.peek().getDistance() > D && (N.poll(), N.add(R)), m = N.peek().getDistance()) : R.expandToQueue(E, m);
            }
            return t.getItems(N);
          }
        } }, { key: "createNode", value: function(e) {
          return new qs(e);
        } }, { key: "size", value: function() {
          return arguments.length === 0 ? C(t, "size", this, 1).call(this) : C(t, "size", this, 1).apply(this, arguments);
        } }, { key: "insert", value: function() {
          if (!(arguments.length === 2 && arguments[1] instanceof Object && arguments[0] instanceof Ht)) return C(t, "insert", this, 1).apply(this, arguments);
          var e = arguments[0], s = arguments[1];
          if (e.isNull()) return null;
          C(t, "insert", this, 1).call(this, e, s);
        } }, { key: "getIntersectsOp", value: function() {
          return t.intersectsOp;
        } }, { key: "verticalSlices", value: function(e, s) {
          for (var l = Math.trunc(Math.ceil(e.size() / s)), _ = new Array(s).fill(null), m = e.iterator(), E = 0; E < s; E++) {
            _[E] = new mt();
            for (var N = 0; m.hasNext() && N < l; ) {
              var R = m.next();
              _[E].add(R), N++;
            }
          }
          return _;
        } }, { key: "query", value: function() {
          if (arguments.length === 1) {
            var e = arguments[0];
            return C(t, "query", this, 1).call(this, e);
          }
          if (arguments.length === 2) {
            var s = arguments[0], l = arguments[1];
            C(t, "query", this, 1).call(this, s, l);
          }
        } }, { key: "getComparator", value: function() {
          return t.yComparator;
        } }, { key: "createParentBoundablesFromVerticalSlice", value: function(e, s) {
          return C(t, "createParentBoundables", this, 1).call(this, e, s);
        } }, { key: "remove", value: function() {
          if (arguments.length === 2 && arguments[1] instanceof Object && arguments[0] instanceof Ht) {
            var e = arguments[0], s = arguments[1];
            return C(t, "remove", this, 1).call(this, e, s);
          }
          return C(t, "remove", this, 1).apply(this, arguments);
        } }, { key: "depth", value: function() {
          return arguments.length === 0 ? C(t, "depth", this, 1).call(this) : C(t, "depth", this, 1).apply(this, arguments);
        } }, { key: "createParentBoundables", value: function(e, s) {
          Nt.isTrue(!e.isEmpty());
          var l = Math.trunc(Math.ceil(e.size() / this.getNodeCapacity())), _ = new mt(e);
          ui.sort(_, t.xComparator);
          var m = this.verticalSlices(_, Math.trunc(Math.ceil(Math.sqrt(l))));
          return this.createParentBoundablesFromVerticalSlices(m, s);
        } }, { key: "nearestNeighbour", value: function() {
          if (arguments.length === 1) {
            if (wt(arguments[0], ho)) {
              var e = arguments[0];
              if (this.isEmpty()) return null;
              var s = new ge(this.getRoot(), this.getRoot(), e);
              return this.nearestNeighbour(s);
            }
            if (arguments[0] instanceof ge) {
              var l = arguments[0], _ = ht.POSITIVE_INFINITY, m = null, E = new ne();
              for (E.add(l); !E.isEmpty() && _ > 0; ) {
                var N = E.poll(), R = N.getDistance();
                if (R >= _) break;
                N.isLeaves() ? (_ = R, m = N) : N.expandToQueue(E, _);
              }
              return m === null ? null : [m.getBoundable(0).getItem(), m.getBoundable(1).getItem()];
            }
          } else {
            if (arguments.length === 2) {
              var D = arguments[0], q = arguments[1];
              if (this.isEmpty() || D.isEmpty()) return null;
              var Z = new ge(this.getRoot(), D.getRoot(), q);
              return this.nearestNeighbour(Z);
            }
            if (arguments.length === 3) {
              var st = arguments[2], ut = new Rn(arguments[0], arguments[1]), gt = new ge(this.getRoot(), ut, st);
              return this.nearestNeighbour(gt)[0];
            }
            if (arguments.length === 4) {
              var bt = arguments[2], lt = arguments[3], Wt = new Rn(arguments[0], arguments[1]), ce = new ge(this.getRoot(), Wt, bt);
              return this.nearestNeighbourK(ce, lt);
            }
          }
        } }, { key: "isWithinDistance", value: function() {
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1], l = ht.POSITIVE_INFINITY, _ = new ne();
            for (_.add(e); !_.isEmpty(); ) {
              var m = _.poll(), E = m.getDistance();
              if (E > s) return !1;
              if (m.maximumDistance() <= s) return !0;
              if (m.isLeaves()) {
                if ((l = E) <= s) return !0;
              } else m.expandToQueue(_, l);
            }
            return !1;
          }
          if (arguments.length === 3) {
            var N = arguments[0], R = arguments[1], D = arguments[2], q = new ge(this.getRoot(), N.getRoot(), R);
            return this.isWithinDistance(q, D);
          }
        } }, { key: "interfaces_", get: function() {
          return [Gs, j];
        } }], [{ key: "constructor_", value: function() {
          if (arguments.length === 0) t.constructor_.call(this, t.DEFAULT_NODE_CAPACITY);
          else if (arguments.length === 1) {
            var e = arguments[0];
            hi.constructor_.call(this, e);
          }
        } }, { key: "centreX", value: function(e) {
          return t.avg(e.getMinX(), e.getMaxX());
        } }, { key: "avg", value: function(e, s) {
          return (e + s) / 2;
        } }, { key: "getItems", value: function(e) {
          for (var s = new Array(e.size()).fill(null), l = 0; !e.isEmpty(); ) {
            var _ = e.poll();
            s[l] = _.getBoundable(0).getItem(), l++;
          }
          return s;
        } }, { key: "centreY", value: function(e) {
          return t.avg(e.getMinY(), e.getMaxY());
        } }]);
      }(hi), qs = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "computeBounds", value: function() {
          for (var e = null, s = this.getChildBoundables().iterator(); s.hasNext(); ) {
            var l = s.next();
            e === null ? e = new Ht(l.getBounds()) : e.expandToInclude(l.getBounds());
          }
          return e;
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0];
          fe.constructor_.call(this, e);
        } }]);
      }(fe);
      un.STRtreeNode = qs, un.xComparator = new (function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "interfaces_", get: function() {
          return [Zt];
        } }, { key: "compare", value: function(o, t) {
          return hi.compareDoubles(un.centreX(o.getBounds()), un.centreX(t.getBounds()));
        } }]);
      }())(), un.yComparator = new (function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "interfaces_", get: function() {
          return [Zt];
        } }, { key: "compare", value: function(o, t) {
          return hi.compareDoubles(un.centreY(o.getBounds()), un.centreY(t.getBounds()));
        } }]);
      }())(), un.intersectsOp = new (function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "interfaces_", get: function() {
          return [IntersectsOp];
        } }, { key: "intersects", value: function(o, t) {
          return o.intersects(t);
        } }]);
      }())(), un.DEFAULT_NODE_CAPACITY = 10;
      var lo = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "relativeSign", value: function(t, e) {
          return t < e ? -1 : t > e ? 1 : 0;
        } }, { key: "compare", value: function(t, e, s) {
          if (e.equals2D(s)) return 0;
          var l = o.relativeSign(e.x, s.x), _ = o.relativeSign(e.y, s.y);
          switch (t) {
            case 0:
              return o.compareValue(l, _);
            case 1:
              return o.compareValue(_, l);
            case 2:
              return o.compareValue(_, -l);
            case 3:
              return o.compareValue(-l, _);
            case 4:
              return o.compareValue(-l, -_);
            case 5:
              return o.compareValue(-_, -l);
            case 6:
              return o.compareValue(-_, l);
            case 7:
              return o.compareValue(l, -_);
          }
          return Nt.shouldNeverReachHere("invalid octant value"), 0;
        } }, { key: "compareValue", value: function(t, e) {
          return t < 0 ? -1 : t > 0 ? 1 : e < 0 ? -1 : e > 0 ? 1 : 0;
        } }]);
      }(), Re = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "getCoordinate", value: function() {
          return this.coord;
        } }, { key: "print", value: function(o) {
          o.print(this.coord), o.print(" seg # = " + this.segmentIndex);
        } }, { key: "compareTo", value: function(o) {
          var t = o;
          return this.segmentIndex < t.segmentIndex ? -1 : this.segmentIndex > t.segmentIndex ? 1 : this.coord.equals2D(t.coord) ? 0 : this._isInterior ? t._isInterior ? lo.compare(this._segmentOctant, this.coord, t.coord) : 1 : -1;
        } }, { key: "isEndPoint", value: function(o) {
          return this.segmentIndex === 0 && !this._isInterior || this.segmentIndex === o;
        } }, { key: "toString", value: function() {
          return this.segmentIndex + ":" + this.coord.toString();
        } }, { key: "isInterior", value: function() {
          return this._isInterior;
        } }, { key: "interfaces_", get: function() {
          return [K];
        } }], [{ key: "constructor_", value: function() {
          this._segString = null, this.coord = null, this.segmentIndex = null, this._segmentOctant = null, this._isInterior = null;
          var o = arguments[0], t = arguments[1], e = arguments[2], s = arguments[3];
          this._segString = o, this.coord = new U(t), this.segmentIndex = e, this._segmentOctant = s, this._isInterior = !t.equals2D(o.getCoordinate(e));
        } }]);
      }(), Wu = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "hasNext", value: function() {
        } }, { key: "next", value: function() {
        } }, { key: "remove", value: function() {
        } }]);
      }(), $e = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "getSplitCoordinates", value: function() {
          var o = new Ji();
          this.addEndpoints();
          for (var t = this.iterator(), e = t.next(); t.hasNext(); ) {
            var s = t.next();
            this.addEdgeCoordinates(e, s, o), e = s;
          }
          return o.toCoordinateArray();
        } }, { key: "addCollapsedNodes", value: function() {
          var o = new mt();
          this.findCollapsesFromInsertedNodes(o), this.findCollapsesFromExistingVertices(o);
          for (var t = o.iterator(); t.hasNext(); ) {
            var e = t.next().intValue();
            this.add(this._edge.getCoordinate(e), e);
          }
        } }, { key: "createSplitEdgePts", value: function(o, t) {
          var e = t.segmentIndex - o.segmentIndex + 2;
          if (e === 2) return [new U(o.coord), new U(t.coord)];
          var s = this._edge.getCoordinate(t.segmentIndex), l = t.isInterior() || !t.coord.equals2D(s);
          l || e--;
          var _ = new Array(e).fill(null), m = 0;
          _[m++] = new U(o.coord);
          for (var E = o.segmentIndex + 1; E <= t.segmentIndex; E++) _[m++] = this._edge.getCoordinate(E);
          return l && (_[m] = new U(t.coord)), _;
        } }, { key: "print", value: function(o) {
          o.println("Intersections:");
          for (var t = this.iterator(); t.hasNext(); )
            t.next().print(o);
        } }, { key: "findCollapsesFromExistingVertices", value: function(o) {
          for (var t = 0; t < this._edge.size() - 2; t++) {
            var e = this._edge.getCoordinate(t);
            this._edge.getCoordinate(t + 1);
            var s = this._edge.getCoordinate(t + 2);
            e.equals2D(s) && o.add(wr.valueOf(t + 1));
          }
        } }, { key: "addEdgeCoordinates", value: function(o, t, e) {
          var s = this.createSplitEdgePts(o, t);
          e.add(s, !1);
        } }, { key: "iterator", value: function() {
          return this._nodeMap.values().iterator();
        } }, { key: "addSplitEdges", value: function(o) {
          this.addEndpoints(), this.addCollapsedNodes();
          for (var t = this.iterator(), e = t.next(); t.hasNext(); ) {
            var s = t.next(), l = this.createSplitEdge(e, s);
            o.add(l), e = s;
          }
        } }, { key: "findCollapseIndex", value: function(o, t, e) {
          if (!o.coord.equals2D(t.coord)) return !1;
          var s = t.segmentIndex - o.segmentIndex;
          return t.isInterior() || s--, s === 1 && (e[0] = o.segmentIndex + 1, !0);
        } }, { key: "findCollapsesFromInsertedNodes", value: function(o) {
          for (var t = new Array(1).fill(null), e = this.iterator(), s = e.next(); e.hasNext(); ) {
            var l = e.next();
            this.findCollapseIndex(s, l, t) && o.add(wr.valueOf(t[0])), s = l;
          }
        } }, { key: "getEdge", value: function() {
          return this._edge;
        } }, { key: "addEndpoints", value: function() {
          var o = this._edge.size() - 1;
          this.add(this._edge.getCoordinate(0), 0), this.add(this._edge.getCoordinate(o), o);
        } }, { key: "createSplitEdge", value: function(o, t) {
          var e = this.createSplitEdgePts(o, t);
          return new mn(e, this._edge.getData());
        } }, { key: "add", value: function(o, t) {
          var e = new Re(this._edge, o, t, this._edge.getSegmentOctant(t)), s = this._nodeMap.get(e);
          return s !== null ? (Nt.isTrue(s.coord.equals2D(o), "Found equal nodes with different coordinates"), s) : (this._nodeMap.put(e, e), e);
        } }, { key: "checkSplitEdgesCorrectness", value: function(o) {
          var t = this._edge.getCoordinates(), e = o.get(0).getCoordinate(0);
          if (!e.equals2D(t[0])) throw new le("bad split edge start point at " + e);
          var s = o.get(o.size() - 1).getCoordinates(), l = s[s.length - 1];
          if (!l.equals2D(t[t.length - 1])) throw new le("bad split edge end point at " + l);
        } }], [{ key: "constructor_", value: function() {
          this._nodeMap = new Bt(), this._edge = null;
          var o = arguments[0];
          this._edge = o;
        } }]);
      }(), $u = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "octant", value: function() {
          if (typeof arguments[0] == "number" && typeof arguments[1] == "number") {
            var t = arguments[0], e = arguments[1];
            if (t === 0 && e === 0) throw new X("Cannot compute the octant for point ( " + t + ", " + e + " )");
            var s = Math.abs(t), l = Math.abs(e);
            return t >= 0 ? e >= 0 ? s >= l ? 0 : 1 : s >= l ? 7 : 6 : e >= 0 ? s >= l ? 3 : 2 : s >= l ? 4 : 5;
          }
          if (arguments[0] instanceof U && arguments[1] instanceof U) {
            var _ = arguments[0], m = arguments[1], E = m.x - _.x, N = m.y - _.y;
            if (E === 0 && N === 0) throw new X("Cannot compute the octant for two identical points " + _);
            return o.octant(E, N);
          }
        } }]);
      }(), fo = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "getCoordinates", value: function() {
        } }, { key: "size", value: function() {
        } }, { key: "getCoordinate", value: function(o) {
        } }, { key: "isClosed", value: function() {
        } }, { key: "setData", value: function(o) {
        } }, { key: "getData", value: function() {
        } }]);
      }(), Bn = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "addIntersection", value: function(o, t) {
        } }, { key: "interfaces_", get: function() {
          return [fo];
        } }]);
      }(), mn = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "getCoordinates", value: function() {
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
          return t.equals2D(e) ? 0 : $u.octant(t, e);
        } }, { key: "getData", value: function() {
          return this._data;
        } }, { key: "addIntersection", value: function() {
          if (arguments.length === 2) {
            var t = arguments[0], e = arguments[1];
            this.addIntersectionNode(t, e);
          } else if (arguments.length === 4) {
            var s = arguments[1], l = arguments[3], _ = new U(arguments[0].getIntersection(l));
            this.addIntersection(_, s);
          }
        } }, { key: "toString", value: function() {
          return Lr.toLineString(new Qi(this._pts));
        } }, { key: "getNodeList", value: function() {
          return this._nodeList;
        } }, { key: "addIntersectionNode", value: function(t, e) {
          var s = e, l = s + 1;
          if (l < this._pts.length) {
            var _ = this._pts[l];
            t.equals2D(_) && (s = l);
          }
          return this._nodeList.add(t, s);
        } }, { key: "addIntersections", value: function(t, e, s) {
          for (var l = 0; l < t.getIntersectionNum(); l++) this.addIntersection(t, e, s, l);
        } }, { key: "interfaces_", get: function() {
          return [Bn];
        } }], [{ key: "constructor_", value: function() {
          this._nodeList = new $e(this), this._pts = null, this._data = null;
          var t = arguments[0], e = arguments[1];
          this._pts = t, this._data = e;
        } }, { key: "getNodedSubstrings", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0], e = new mt();
            return o.getNodedSubstrings(t, e), e;
          }
          if (arguments.length === 2) for (var s = arguments[1], l = arguments[0].iterator(); l.hasNext(); )
            l.next().getNodeList().addSplitEdges(s);
        } }]);
      }(), Ee = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "minX", value: function() {
          return Math.min(this.p0.x, this.p1.x);
        } }, { key: "orientationIndex", value: function() {
          if (arguments[0] instanceof o) {
            var t = arguments[0], e = pt.index(this.p0, this.p1, t.p0), s = pt.index(this.p0, this.p1, t.p1);
            return e >= 0 && s >= 0 || e <= 0 && s <= 0 ? Math.max(e, s) : 0;
          }
          if (arguments[0] instanceof U) {
            var l = arguments[0];
            return pt.index(this.p0, this.p1, l);
          }
        } }, { key: "toGeometry", value: function(t) {
          return t.createLineString([this.p0, this.p1]);
        } }, { key: "isVertical", value: function() {
          return this.p0.x === this.p1.x;
        } }, { key: "equals", value: function(t) {
          if (!(t instanceof o)) return !1;
          var e = t;
          return this.p0.equals(e.p0) && this.p1.equals(e.p1);
        } }, { key: "intersection", value: function(t) {
          var e = new qn();
          return e.computeIntersection(this.p0, this.p1, t.p0, t.p1), e.hasIntersection() ? e.getIntersection(0) : null;
        } }, { key: "project", value: function() {
          if (arguments[0] instanceof U) {
            var t = arguments[0];
            if (t.equals(this.p0) || t.equals(this.p1)) return new U(t);
            var e = this.projectionFactor(t), s = new U();
            return s.x = this.p0.x + e * (this.p1.x - this.p0.x), s.y = this.p0.y + e * (this.p1.y - this.p0.y), s;
          }
          if (arguments[0] instanceof o) {
            var l = arguments[0], _ = this.projectionFactor(l.p0), m = this.projectionFactor(l.p1);
            if (_ >= 1 && m >= 1 || _ <= 0 && m <= 0) return null;
            var E = this.project(l.p0);
            _ < 0 && (E = this.p0), _ > 1 && (E = this.p1);
            var N = this.project(l.p1);
            return m < 0 && (N = this.p0), m > 1 && (N = this.p1), new o(E, N);
          }
        } }, { key: "normalize", value: function() {
          this.p1.compareTo(this.p0) < 0 && this.reverse();
        } }, { key: "angle", value: function() {
          return Math.atan2(this.p1.y - this.p0.y, this.p1.x - this.p0.x);
        } }, { key: "getCoordinate", value: function(t) {
          return t === 0 ? this.p0 : this.p1;
        } }, { key: "distancePerpendicular", value: function(t) {
          return on.pointToLinePerpendicular(t, this.p0, this.p1);
        } }, { key: "minY", value: function() {
          return Math.min(this.p0.y, this.p1.y);
        } }, { key: "midPoint", value: function() {
          return o.midPoint(this.p0, this.p1);
        } }, { key: "projectionFactor", value: function(t) {
          if (t.equals(this.p0)) return 0;
          if (t.equals(this.p1)) return 1;
          var e = this.p1.x - this.p0.x, s = this.p1.y - this.p0.y, l = e * e + s * s;
          return l <= 0 ? ht.NaN : ((t.x - this.p0.x) * e + (t.y - this.p0.y) * s) / l;
        } }, { key: "closestPoints", value: function(t) {
          var e = this.intersection(t);
          if (e !== null) return [e, e];
          var s = new Array(2).fill(null), l = ht.MAX_VALUE, _ = null, m = this.closestPoint(t.p0);
          l = m.distance(t.p0), s[0] = m, s[1] = t.p0;
          var E = this.closestPoint(t.p1);
          (_ = E.distance(t.p1)) < l && (l = _, s[0] = E, s[1] = t.p1);
          var N = t.closestPoint(this.p0);
          (_ = N.distance(this.p0)) < l && (l = _, s[0] = this.p0, s[1] = N);
          var R = t.closestPoint(this.p1);
          return (_ = R.distance(this.p1)) < l && (l = _, s[0] = this.p1, s[1] = R), s;
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
          return ps.intersection(this.p0, this.p1, t.p0, t.p1);
        } }, { key: "maxY", value: function() {
          return Math.max(this.p0.y, this.p1.y);
        } }, { key: "pointAlongOffset", value: function(t, e) {
          var s = this.p0.x + t * (this.p1.x - this.p0.x), l = this.p0.y + t * (this.p1.y - this.p0.y), _ = this.p1.x - this.p0.x, m = this.p1.y - this.p0.y, E = Math.sqrt(_ * _ + m * m), N = 0, R = 0;
          if (e !== 0) {
            if (E <= 0) throw new IllegalStateException("Cannot compute offset from zero-length line segment");
            N = e * _ / E, R = e * m / E;
          }
          return new U(s - R, l + N);
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
          var e = this.p1.getY() - this.p0.getY(), s = this.p0.getX() - this.p1.getX(), l = this.p0.getY() * (this.p1.getX() - this.p0.getX()) - this.p0.getX() * (this.p1.getY() - this.p0.getY()), _ = e * e + s * s, m = e * e - s * s, E = t.getX(), N = t.getY();
          return new U((-m * E - 2 * e * s * N - 2 * e * l) / _, (m * N - 2 * e * s * E - 2 * s * l) / _);
        } }, { key: "distance", value: function() {
          if (arguments[0] instanceof o) {
            var t = arguments[0];
            return on.segmentToSegment(this.p0, this.p1, t.p0, t.p1);
          }
          if (arguments[0] instanceof U) {
            var e = arguments[0];
            return on.pointToSegment(e, this.p0, this.p1);
          }
        } }, { key: "pointAlong", value: function(t) {
          var e = new U();
          return e.x = this.p0.x + t * (this.p1.x - this.p0.x), e.y = this.p0.y + t * (this.p1.y - this.p0.y), e;
        } }, { key: "hashCode", value: function() {
          var t = ht.doubleToLongBits(this.p0.x);
          t ^= 31 * ht.doubleToLongBits(this.p0.y);
          var e = Math.trunc(t) ^ Math.trunc(t >> 32), s = ht.doubleToLongBits(this.p1.x);
          return s ^= 31 * ht.doubleToLongBits(this.p1.y), e ^ (Math.trunc(s) ^ Math.trunc(s >> 32));
        } }, { key: "interfaces_", get: function() {
          return [K, j];
        } }], [{ key: "constructor_", value: function() {
          if (this.p0 = null, this.p1 = null, arguments.length === 0) o.constructor_.call(this, new U(), new U());
          else if (arguments.length === 1) {
            var t = arguments[0];
            o.constructor_.call(this, t.p0, t.p1);
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            this.p0 = e, this.p1 = s;
          } else if (arguments.length === 4) {
            var l = arguments[0], _ = arguments[1], m = arguments[2], E = arguments[3];
            o.constructor_.call(this, new U(l, _), new U(m, E));
          }
        } }, { key: "midPoint", value: function(t, e) {
          return new U((t.x + e.x) / 2, (t.y + e.y) / 2);
        } }]);
      }(), Kt = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "overlap", value: function() {
          if (arguments.length !== 2) {
            if (arguments.length === 4) {
              var o = arguments[1], t = arguments[2], e = arguments[3];
              arguments[0].getLineSegment(o, this._overlapSeg1), t.getLineSegment(e, this._overlapSeg2), this.overlap(this._overlapSeg1, this._overlapSeg2);
            }
          }
        } }], [{ key: "constructor_", value: function() {
          this._overlapSeg1 = new Ee(), this._overlapSeg2 = new Ee();
        } }]);
      }(), Tn = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "getLineSegment", value: function(o, t) {
          t.p0 = this._pts[o], t.p1 = this._pts[o + 1];
        } }, { key: "computeSelect", value: function(o, t, e, s) {
          var l = this._pts[t], _ = this._pts[e];
          if (e - t == 1) return s.select(this, t), null;
          if (!o.intersects(l, _)) return null;
          var m = Math.trunc((t + e) / 2);
          t < m && this.computeSelect(o, t, m, s), m < e && this.computeSelect(o, m, e, s);
        } }, { key: "getCoordinates", value: function() {
          for (var o = new Array(this._end - this._start + 1).fill(null), t = 0, e = this._start; e <= this._end; e++) o[t++] = this._pts[e];
          return o;
        } }, { key: "computeOverlaps", value: function() {
          if (arguments.length === 2) {
            var o = arguments[0], t = arguments[1];
            this.computeOverlaps(this._start, this._end, o, o._start, o._end, t);
          } else if (arguments.length === 6) {
            var e = arguments[0], s = arguments[1], l = arguments[2], _ = arguments[3], m = arguments[4], E = arguments[5];
            if (s - e == 1 && m - _ == 1) return E.overlap(this, e, l, _), null;
            if (!this.overlaps(e, s, l, _, m)) return null;
            var N = Math.trunc((e + s) / 2), R = Math.trunc((_ + m) / 2);
            e < N && (_ < R && this.computeOverlaps(e, N, l, _, R, E), R < m && this.computeOverlaps(e, N, l, R, m, E)), N < s && (_ < R && this.computeOverlaps(N, s, l, _, R, E), R < m && this.computeOverlaps(N, s, l, R, m, E));
          }
        } }, { key: "setId", value: function(o) {
          this._id = o;
        } }, { key: "select", value: function(o, t) {
          this.computeSelect(o, this._start, this._end, t);
        } }, { key: "getEnvelope", value: function() {
          if (this._env === null) {
            var o = this._pts[this._start], t = this._pts[this._end];
            this._env = new Ht(o, t);
          }
          return this._env;
        } }, { key: "overlaps", value: function(o, t, e, s, l) {
          return Ht.intersects(this._pts[o], this._pts[t], e._pts[s], e._pts[l]);
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
          var o = arguments[0], t = arguments[1], e = arguments[2], s = arguments[3];
          this._pts = o, this._start = t, this._end = e, this._context = s;
        } }]);
      }(), Bs = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "findChainEnd", value: function(t, e) {
          for (var s = e; s < t.length - 1 && t[s].equals2D(t[s + 1]); ) s++;
          if (s >= t.length - 1) return t.length - 1;
          for (var l = pe.quadrant(t[s], t[s + 1]), _ = e + 1; _ < t.length && !(!t[_ - 1].equals2D(t[_]) && pe.quadrant(t[_ - 1], t[_]) !== l); )
            _++;
          return _ - 1;
        } }, { key: "getChains", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return o.getChains(t, null);
          }
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1], l = new mt(), _ = 0;
            do {
              var m = o.findChainEnd(e, _), E = new Tn(e, _, m, s);
              l.add(E), _ = m;
            } while (_ < e.length - 1);
            return l;
          }
        } }]);
      }(), Us = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "computeNodes", value: function(o) {
        } }, { key: "getNodedSubstrings", value: function() {
        } }]);
      }(), Gr = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "setSegmentIntersector", value: function(o) {
          this._segInt = o;
        } }, { key: "interfaces_", get: function() {
          return [Us];
        } }], [{ key: "constructor_", value: function() {
          if (this._segInt = null, arguments.length !== 0) {
            if (arguments.length === 1) {
              var o = arguments[0];
              this.setSegmentIntersector(o);
            }
          }
        } }]);
      }(), zs = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "getMonotoneChains", value: function() {
          return this._monoChains;
        } }, { key: "getNodedSubstrings", value: function() {
          return mn.getNodedSubstrings(this._nodedSegStrings);
        } }, { key: "getIndex", value: function() {
          return this._index;
        } }, { key: "add", value: function(e) {
          for (var s = Bs.getChains(e.getCoordinates(), e).iterator(); s.hasNext(); ) {
            var l = s.next();
            l.setId(this._idCounter++), this._index.insert(l.getEnvelope(), l), this._monoChains.add(l);
          }
        } }, { key: "computeNodes", value: function(e) {
          this._nodedSegStrings = e;
          for (var s = e.iterator(); s.hasNext(); ) this.add(s.next());
          this.intersectChains();
        } }, { key: "intersectChains", value: function() {
          for (var e = new co(this._segInt), s = this._monoChains.iterator(); s.hasNext(); ) for (var l = s.next(), _ = this._index.query(l.getEnvelope()).iterator(); _.hasNext(); ) {
            var m = _.next();
            if (m.getId() > l.getId() && (l.computeOverlaps(m, e), this._nOverlaps++), this._segInt.isDone()) return null;
          }
        } }], [{ key: "constructor_", value: function() {
          if (this._monoChains = new mt(), this._index = new un(), this._idCounter = 0, this._nodedSegStrings = null, this._nOverlaps = 0, arguments.length !== 0) {
            if (arguments.length === 1) {
              var e = arguments[0];
              Gr.constructor_.call(this, e);
            }
          }
        } }]);
      }(Gr), co = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "overlap", value: function() {
          if (arguments.length !== 4) return C(t, "overlap", this, 1).apply(this, arguments);
          var e = arguments[1], s = arguments[2], l = arguments[3], _ = arguments[0].getContext(), m = s.getContext();
          this._si.processIntersections(_, e, m, l);
        } }], [{ key: "constructor_", value: function() {
          this._si = null;
          var e = arguments[0];
          this._si = e;
        } }]);
      }(Kt);
      zs.SegmentOverlapAction = co;
      var hn = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "isDeletable", value: function(t, e, s, l) {
          var _ = this._inputLine[t], m = this._inputLine[e], E = this._inputLine[s];
          return !!this.isConcave(_, m, E) && !!this.isShallow(_, m, E, l) && this.isShallowSampled(_, m, t, s, l);
        } }, { key: "deleteShallowConcavities", value: function() {
          for (var t = 1, e = this.findNextNonDeletedIndex(t), s = this.findNextNonDeletedIndex(e), l = !1; s < this._inputLine.length; ) {
            var _ = !1;
            this.isDeletable(t, e, s, this._distanceTol) && (this._isDeleted[e] = o.DELETE, _ = !0, l = !0), t = _ ? s : e, e = this.findNextNonDeletedIndex(t), s = this.findNextNonDeletedIndex(e);
          }
          return l;
        } }, { key: "isShallowConcavity", value: function(t, e, s, l) {
          return pt.index(t, e, s) === this._angleOrientation && on.pointToSegment(e, t, s) < l;
        } }, { key: "isShallowSampled", value: function(t, e, s, l, _) {
          var m = Math.trunc((l - s) / o.NUM_PTS_TO_CHECK);
          m <= 0 && (m = 1);
          for (var E = s; E < l; E += m) if (!this.isShallow(t, e, this._inputLine[E], _)) return !1;
          return !0;
        } }, { key: "isConcave", value: function(t, e, s) {
          var l = pt.index(t, e, s) === this._angleOrientation;
          return l;
        } }, { key: "simplify", value: function(t) {
          this._distanceTol = Math.abs(t), t < 0 && (this._angleOrientation = pt.CLOCKWISE), this._isDeleted = new Array(this._inputLine.length).fill(null);
          var e = !1;
          do
            e = this.deleteShallowConcavities();
          while (e);
          return this.collapseLine();
        } }, { key: "findNextNonDeletedIndex", value: function(t) {
          for (var e = t + 1; e < this._inputLine.length && this._isDeleted[e] === o.DELETE; ) e++;
          return e;
        } }, { key: "isShallow", value: function(t, e, s, l) {
          return on.pointToSegment(e, t, s) < l;
        } }, { key: "collapseLine", value: function() {
          for (var t = new Ji(), e = 0; e < this._inputLine.length; e++) this._isDeleted[e] !== o.DELETE && t.add(this._inputLine[e]);
          return t.toCoordinateArray();
        } }], [{ key: "constructor_", value: function() {
          this._inputLine = null, this._distanceTol = null, this._isDeleted = null, this._angleOrientation = pt.COUNTERCLOCKWISE;
          var t = arguments[0];
          this._inputLine = t;
        } }, { key: "simplify", value: function(t, e) {
          return new o(t).simplify(e);
        } }]);
      }();
      hn.INIT = 0, hn.DELETE = 1, hn.KEEP = 1, hn.NUM_PTS_TO_CHECK = 10;
      var Ys = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "getCoordinates", value: function() {
          return this._ptList.toArray(o.COORDINATE_ARRAY_TYPE);
        } }, { key: "setPrecisionModel", value: function(t) {
          this._precisionModel = t;
        } }, { key: "addPt", value: function(t) {
          var e = new U(t);
          if (this._precisionModel.makePrecise(e), this.isRedundant(e)) return null;
          this._ptList.add(e);
        } }, { key: "reverse", value: function() {
        } }, { key: "addPts", value: function(t, e) {
          if (e) for (var s = 0; s < t.length; s++) this.addPt(t[s]);
          else for (var l = t.length - 1; l >= 0; l--) this.addPt(t[l]);
        } }, { key: "isRedundant", value: function(t) {
          if (this._ptList.size() < 1) return !1;
          var e = this._ptList.get(this._ptList.size() - 1);
          return t.distance(e) < this._minimimVertexDistance;
        } }, { key: "toString", value: function() {
          return new ki().createLineString(this.getCoordinates()).toString();
        } }, { key: "closeRing", value: function() {
          if (this._ptList.size() < 1) return null;
          var t = new U(this._ptList.get(0)), e = this._ptList.get(this._ptList.size() - 1);
          if (t.equals(e)) return null;
          this._ptList.add(t);
        } }, { key: "setMinimumVertexDistance", value: function(t) {
          this._minimimVertexDistance = t;
        } }], [{ key: "constructor_", value: function() {
          this._ptList = null, this._precisionModel = null, this._minimimVertexDistance = 0, this._ptList = new mt();
        } }]);
      }();
      Ys.COORDINATE_ARRAY_TYPE = new Array(0).fill(null);
      var _e = function() {
        function o() {
          f(this, o);
        }
        return g(o, null, [{ key: "toDegrees", value: function(t) {
          return 180 * t / Math.PI;
        } }, { key: "normalize", value: function(t) {
          for (; t > Math.PI; ) t -= o.PI_TIMES_2;
          for (; t <= -Math.PI; ) t += o.PI_TIMES_2;
          return t;
        } }, { key: "angle", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return Math.atan2(t.y, t.x);
          }
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1], l = s.x - e.x, _ = s.y - e.y;
            return Math.atan2(_, l);
          }
        } }, { key: "isAcute", value: function(t, e, s) {
          var l = t.x - e.x, _ = t.y - e.y;
          return l * (s.x - e.x) + _ * (s.y - e.y) > 0;
        } }, { key: "isObtuse", value: function(t, e, s) {
          var l = t.x - e.x, _ = t.y - e.y;
          return l * (s.x - e.x) + _ * (s.y - e.y) < 0;
        } }, { key: "interiorAngle", value: function(t, e, s) {
          var l = o.angle(e, t), _ = o.angle(e, s);
          return Math.abs(_ - l);
        } }, { key: "normalizePositive", value: function(t) {
          if (t < 0) {
            for (; t < 0; ) t += o.PI_TIMES_2;
            t >= o.PI_TIMES_2 && (t = 0);
          } else {
            for (; t >= o.PI_TIMES_2; ) t -= o.PI_TIMES_2;
            t < 0 && (t = 0);
          }
          return t;
        } }, { key: "angleBetween", value: function(t, e, s) {
          var l = o.angle(e, t), _ = o.angle(e, s);
          return o.diff(l, _);
        } }, { key: "diff", value: function(t, e) {
          var s = null;
          return (s = t < e ? e - t : t - e) > Math.PI && (s = 2 * Math.PI - s), s;
        } }, { key: "toRadians", value: function(t) {
          return t * Math.PI / 180;
        } }, { key: "getTurn", value: function(t, e) {
          var s = Math.sin(e - t);
          return s > 0 ? o.COUNTERCLOCKWISE : s < 0 ? o.CLOCKWISE : o.NONE;
        } }, { key: "angleBetweenOriented", value: function(t, e, s) {
          var l = o.angle(e, t), _ = o.angle(e, s) - l;
          return _ <= -Math.PI ? _ + o.PI_TIMES_2 : _ > Math.PI ? _ - o.PI_TIMES_2 : _;
        } }]);
      }();
      _e.PI_TIMES_2 = 2 * Math.PI, _e.PI_OVER_2 = Math.PI / 2, _e.PI_OVER_4 = Math.PI / 4, _e.COUNTERCLOCKWISE = pt.COUNTERCLOCKWISE, _e.CLOCKWISE = pt.CLOCKWISE, _e.NONE = pt.COLLINEAR;
      var yn = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "addNextSegment", value: function(t, e) {
          if (this._s0 = this._s1, this._s1 = this._s2, this._s2 = t, this._seg0.setCoordinates(this._s0, this._s1), this.computeOffsetSegment(this._seg0, this._side, this._distance, this._offset0), this._seg1.setCoordinates(this._s1, this._s2), this.computeOffsetSegment(this._seg1, this._side, this._distance, this._offset1), this._s1.equals(this._s2)) return null;
          var s = pt.index(this._s0, this._s1, this._s2), l = s === pt.CLOCKWISE && this._side === tt.LEFT || s === pt.COUNTERCLOCKWISE && this._side === tt.RIGHT;
          s === 0 ? this.addCollinear(e) : l ? this.addOutsideTurn(s, e) : this.addInsideTurn(s, e);
        } }, { key: "addLineEndCap", value: function(t, e) {
          var s = new Ee(t, e), l = new Ee();
          this.computeOffsetSegment(s, tt.LEFT, this._distance, l);
          var _ = new Ee();
          this.computeOffsetSegment(s, tt.RIGHT, this._distance, _);
          var m = e.x - t.x, E = e.y - t.y, N = Math.atan2(E, m);
          switch (this._bufParams.getEndCapStyle()) {
            case Y.CAP_ROUND:
              this._segList.addPt(l.p1), this.addDirectedFillet(e, N + Math.PI / 2, N - Math.PI / 2, pt.CLOCKWISE, this._distance), this._segList.addPt(_.p1);
              break;
            case Y.CAP_FLAT:
              this._segList.addPt(l.p1), this._segList.addPt(_.p1);
              break;
            case Y.CAP_SQUARE:
              var R = new U();
              R.x = Math.abs(this._distance) * Math.cos(N), R.y = Math.abs(this._distance) * Math.sin(N);
              var D = new U(l.p1.x + R.x, l.p1.y + R.y), q = new U(_.p1.x + R.x, _.p1.y + R.y);
              this._segList.addPt(D), this._segList.addPt(q);
          }
        } }, { key: "getCoordinates", value: function() {
          return this._segList.getCoordinates();
        } }, { key: "addMitreJoin", value: function(t, e, s, l) {
          var _ = ps.intersection(e.p0, e.p1, s.p0, s.p1);
          if (_ !== null && (l <= 0 ? 1 : _.distance(t) / Math.abs(l)) <= this._bufParams.getMitreLimit()) return this._segList.addPt(_), null;
          this.addLimitedMitreJoin(e, s, l, this._bufParams.getMitreLimit());
        } }, { key: "addOutsideTurn", value: function(t, e) {
          if (this._offset0.p1.distance(this._offset1.p0) < this._distance * o.OFFSET_SEGMENT_SEPARATION_FACTOR) return this._segList.addPt(this._offset0.p1), null;
          this._bufParams.getJoinStyle() === Y.JOIN_MITRE ? this.addMitreJoin(this._s1, this._offset0, this._offset1, this._distance) : this._bufParams.getJoinStyle() === Y.JOIN_BEVEL ? this.addBevelJoin(this._offset0, this._offset1) : (e && this._segList.addPt(this._offset0.p1), this.addCornerFillet(this._s1, this._offset0.p1, this._offset1.p0, t, this._distance), this._segList.addPt(this._offset1.p0));
        } }, { key: "createSquare", value: function(t) {
          this._segList.addPt(new U(t.x + this._distance, t.y + this._distance)), this._segList.addPt(new U(t.x + this._distance, t.y - this._distance)), this._segList.addPt(new U(t.x - this._distance, t.y - this._distance)), this._segList.addPt(new U(t.x - this._distance, t.y + this._distance)), this._segList.closeRing();
        } }, { key: "addSegments", value: function(t, e) {
          this._segList.addPts(t, e);
        } }, { key: "addFirstSegment", value: function() {
          this._segList.addPt(this._offset1.p0);
        } }, { key: "addCornerFillet", value: function(t, e, s, l, _) {
          var m = e.x - t.x, E = e.y - t.y, N = Math.atan2(E, m), R = s.x - t.x, D = s.y - t.y, q = Math.atan2(D, R);
          l === pt.CLOCKWISE ? N <= q && (N += 2 * Math.PI) : N >= q && (N -= 2 * Math.PI), this._segList.addPt(e), this.addDirectedFillet(t, N, q, l, _), this._segList.addPt(s);
        } }, { key: "addLastSegment", value: function() {
          this._segList.addPt(this._offset1.p1);
        } }, { key: "initSideSegments", value: function(t, e, s) {
          this._s1 = t, this._s2 = e, this._side = s, this._seg1.setCoordinates(t, e), this.computeOffsetSegment(this._seg1, s, this._distance, this._offset1);
        } }, { key: "addLimitedMitreJoin", value: function(t, e, s, l) {
          var _ = this._seg0.p1, m = _e.angle(_, this._seg0.p0), E = _e.angleBetweenOriented(this._seg0.p0, _, this._seg1.p1) / 2, N = _e.normalize(m + E), R = _e.normalize(N + Math.PI), D = l * s, q = s - D * Math.abs(Math.sin(E)), Z = _.x + D * Math.cos(R), st = _.y + D * Math.sin(R), ut = new U(Z, st), gt = new Ee(_, ut), bt = gt.pointAlongOffset(1, q), lt = gt.pointAlongOffset(1, -q);
          this._side === tt.LEFT ? (this._segList.addPt(bt), this._segList.addPt(lt)) : (this._segList.addPt(lt), this._segList.addPt(bt));
        } }, { key: "addDirectedFillet", value: function(t, e, s, l, _) {
          var m = l === pt.CLOCKWISE ? -1 : 1, E = Math.abs(e - s), N = Math.trunc(E / this._filletAngleQuantum + 0.5);
          if (N < 1) return null;
          for (var R = E / N, D = new U(), q = 0; q < N; q++) {
            var Z = e + m * q * R;
            D.x = t.x + _ * Math.cos(Z), D.y = t.y + _ * Math.sin(Z), this._segList.addPt(D);
          }
        } }, { key: "computeOffsetSegment", value: function(t, e, s, l) {
          var _ = e === tt.LEFT ? 1 : -1, m = t.p1.x - t.p0.x, E = t.p1.y - t.p0.y, N = Math.sqrt(m * m + E * E), R = _ * s * m / N, D = _ * s * E / N;
          l.p0.x = t.p0.x - D, l.p0.y = t.p0.y + R, l.p1.x = t.p1.x - D, l.p1.y = t.p1.y + R;
        } }, { key: "addInsideTurn", value: function(t, e) {
          if (this._li.computeIntersection(this._offset0.p0, this._offset0.p1, this._offset1.p0, this._offset1.p1), this._li.hasIntersection()) this._segList.addPt(this._li.getIntersection(0));
          else if (this._hasNarrowConcaveAngle = !0, this._offset0.p1.distance(this._offset1.p0) < this._distance * o.INSIDE_TURN_VERTEX_SNAP_DISTANCE_FACTOR) this._segList.addPt(this._offset0.p1);
          else {
            if (this._segList.addPt(this._offset0.p1), this._closingSegLengthFactor > 0) {
              var s = new U((this._closingSegLengthFactor * this._offset0.p1.x + this._s1.x) / (this._closingSegLengthFactor + 1), (this._closingSegLengthFactor * this._offset0.p1.y + this._s1.y) / (this._closingSegLengthFactor + 1));
              this._segList.addPt(s);
              var l = new U((this._closingSegLengthFactor * this._offset1.p0.x + this._s1.x) / (this._closingSegLengthFactor + 1), (this._closingSegLengthFactor * this._offset1.p0.y + this._s1.y) / (this._closingSegLengthFactor + 1));
              this._segList.addPt(l);
            } else this._segList.addPt(this._s1);
            this._segList.addPt(this._offset1.p0);
          }
        } }, { key: "createCircle", value: function(t) {
          var e = new U(t.x + this._distance, t.y);
          this._segList.addPt(e), this.addDirectedFillet(t, 0, 2 * Math.PI, -1, this._distance), this._segList.closeRing();
        } }, { key: "addBevelJoin", value: function(t, e) {
          this._segList.addPt(t.p1), this._segList.addPt(e.p0);
        } }, { key: "init", value: function(t) {
          this._distance = t, this._maxCurveSegmentError = t * (1 - Math.cos(this._filletAngleQuantum / 2)), this._segList = new Ys(), this._segList.setPrecisionModel(this._precisionModel), this._segList.setMinimumVertexDistance(t * o.CURVE_VERTEX_SNAP_DISTANCE_FACTOR);
        } }, { key: "addCollinear", value: function(t) {
          this._li.computeIntersection(this._s0, this._s1, this._s1, this._s2), this._li.getIntersectionNum() >= 2 && (this._bufParams.getJoinStyle() === Y.JOIN_BEVEL || this._bufParams.getJoinStyle() === Y.JOIN_MITRE ? (t && this._segList.addPt(this._offset0.p1), this._segList.addPt(this._offset1.p0)) : this.addCornerFillet(this._s1, this._offset0.p1, this._offset1.p0, pt.CLOCKWISE, this._distance));
        } }, { key: "closeRing", value: function() {
          this._segList.closeRing();
        } }, { key: "hasNarrowConcaveAngle", value: function() {
          return this._hasNarrowConcaveAngle;
        } }], [{ key: "constructor_", value: function() {
          this._maxCurveSegmentError = 0, this._filletAngleQuantum = null, this._closingSegLengthFactor = 1, this._segList = null, this._distance = 0, this._precisionModel = null, this._bufParams = null, this._li = null, this._s0 = null, this._s1 = null, this._s2 = null, this._seg0 = new Ee(), this._seg1 = new Ee(), this._offset0 = new Ee(), this._offset1 = new Ee(), this._side = 0, this._hasNarrowConcaveAngle = !1;
          var t = arguments[0], e = arguments[1], s = arguments[2];
          this._precisionModel = t, this._bufParams = e, this._li = new qn(), this._filletAngleQuantum = Math.PI / 2 / e.getQuadrantSegments(), e.getQuadrantSegments() >= 8 && e.getJoinStyle() === Y.JOIN_ROUND && (this._closingSegLengthFactor = o.MAX_CLOSING_SEG_LEN_FACTOR), this.init(s);
        } }]);
      }();
      yn.OFFSET_SEGMENT_SEPARATION_FACTOR = 1e-3, yn.INSIDE_TURN_VERTEX_SNAP_DISTANCE_FACTOR = 1e-3, yn.CURVE_VERTEX_SNAP_DISTANCE_FACTOR = 1e-6, yn.MAX_CLOSING_SEG_LEN_FACTOR = 80;
      var Hu = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "getOffsetCurve", value: function(t, e) {
          if (this._distance = e, e === 0) return null;
          var s = e < 0, l = Math.abs(e), _ = this.getSegGen(l);
          t.length <= 1 ? this.computePointCurve(t[0], _) : this.computeOffsetCurve(t, s, _);
          var m = _.getCoordinates();
          return s && re.reverse(m), m;
        } }, { key: "computeSingleSidedBufferCurve", value: function(t, e, s) {
          var l = this.simplifyTolerance(this._distance);
          if (e) {
            s.addSegments(t, !0);
            var _ = hn.simplify(t, -l), m = _.length - 1;
            s.initSideSegments(_[m], _[m - 1], tt.LEFT), s.addFirstSegment();
            for (var E = m - 2; E >= 0; E--) s.addNextSegment(_[E], !0);
          } else {
            s.addSegments(t, !1);
            var N = hn.simplify(t, l), R = N.length - 1;
            s.initSideSegments(N[0], N[1], tt.LEFT), s.addFirstSegment();
            for (var D = 2; D <= R; D++) s.addNextSegment(N[D], !0);
          }
          s.addLastSegment(), s.closeRing();
        } }, { key: "computeRingBufferCurve", value: function(t, e, s) {
          var l = this.simplifyTolerance(this._distance);
          e === tt.RIGHT && (l = -l);
          var _ = hn.simplify(t, l), m = _.length - 1;
          s.initSideSegments(_[m - 1], _[0], e);
          for (var E = 1; E <= m; E++) {
            var N = E !== 1;
            s.addNextSegment(_[E], N);
          }
          s.closeRing();
        } }, { key: "computeLineBufferCurve", value: function(t, e) {
          var s = this.simplifyTolerance(this._distance), l = hn.simplify(t, s), _ = l.length - 1;
          e.initSideSegments(l[0], l[1], tt.LEFT);
          for (var m = 2; m <= _; m++) e.addNextSegment(l[m], !0);
          e.addLastSegment(), e.addLineEndCap(l[_ - 1], l[_]);
          var E = hn.simplify(t, -s), N = E.length - 1;
          e.initSideSegments(E[N], E[N - 1], tt.LEFT);
          for (var R = N - 2; R >= 0; R--) e.addNextSegment(E[R], !0);
          e.addLastSegment(), e.addLineEndCap(E[1], E[0]), e.closeRing();
        } }, { key: "computePointCurve", value: function(t, e) {
          switch (this._bufParams.getEndCapStyle()) {
            case Y.CAP_ROUND:
              e.createCircle(t);
              break;
            case Y.CAP_SQUARE:
              e.createSquare(t);
          }
        } }, { key: "getLineCurve", value: function(t, e) {
          if (this._distance = e, this.isLineOffsetEmpty(e)) return null;
          var s = Math.abs(e), l = this.getSegGen(s);
          if (t.length <= 1) this.computePointCurve(t[0], l);
          else if (this._bufParams.isSingleSided()) {
            var _ = e < 0;
            this.computeSingleSidedBufferCurve(t, _, l);
          } else this.computeLineBufferCurve(t, l);
          return l.getCoordinates();
        } }, { key: "getBufferParameters", value: function() {
          return this._bufParams;
        } }, { key: "simplifyTolerance", value: function(t) {
          return t * this._bufParams.getSimplifyFactor();
        } }, { key: "getRingCurve", value: function(t, e, s) {
          if (this._distance = s, t.length <= 2) return this.getLineCurve(t, s);
          if (s === 0) return o.copyCoordinates(t);
          var l = this.getSegGen(s);
          return this.computeRingBufferCurve(t, e, l), l.getCoordinates();
        } }, { key: "computeOffsetCurve", value: function(t, e, s) {
          var l = this.simplifyTolerance(this._distance);
          if (e) {
            var _ = hn.simplify(t, -l), m = _.length - 1;
            s.initSideSegments(_[m], _[m - 1], tt.LEFT), s.addFirstSegment();
            for (var E = m - 2; E >= 0; E--) s.addNextSegment(_[E], !0);
          } else {
            var N = hn.simplify(t, l), R = N.length - 1;
            s.initSideSegments(N[0], N[1], tt.LEFT), s.addFirstSegment();
            for (var D = 2; D <= R; D++) s.addNextSegment(N[D], !0);
          }
          s.addLastSegment();
        } }, { key: "isLineOffsetEmpty", value: function(t) {
          return t === 0 || t < 0 && !this._bufParams.isSingleSided();
        } }, { key: "getSegGen", value: function(t) {
          return new yn(this._precisionModel, this._bufParams, t);
        } }], [{ key: "constructor_", value: function() {
          this._distance = 0, this._precisionModel = null, this._bufParams = null;
          var t = arguments[0], e = arguments[1];
          this._precisionModel = t, this._bufParams = e;
        } }, { key: "copyCoordinates", value: function(t) {
          for (var e = new Array(t.length).fill(null), s = 0; s < e.length; s++) e[s] = new U(t[s]);
          return e;
        } }]);
      }(), Xs = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "findStabbedSegments", value: function() {
          if (arguments.length === 1) {
            for (var o = arguments[0], t = new mt(), e = this._subgraphs.iterator(); e.hasNext(); ) {
              var s = e.next(), l = s.getEnvelope();
              o.y < l.getMinY() || o.y > l.getMaxY() || this.findStabbedSegments(o, s.getDirectedEdges(), t);
            }
            return t;
          }
          if (arguments.length === 3) {
            if (wt(arguments[2], sn) && arguments[0] instanceof U && arguments[1] instanceof Ls) {
              for (var _ = arguments[0], m = arguments[1], E = arguments[2], N = m.getEdge().getCoordinates(), R = 0; R < N.length - 1; R++)
                if (this._seg.p0 = N[R], this._seg.p1 = N[R + 1], this._seg.p0.y > this._seg.p1.y && this._seg.reverse(), !(Math.max(this._seg.p0.x, this._seg.p1.x) < _.x || this._seg.isHorizontal() || _.y < this._seg.p0.y || _.y > this._seg.p1.y || pt.index(this._seg.p0, this._seg.p1, _) === pt.RIGHT)) {
                  var D = m.getDepth(tt.LEFT);
                  this._seg.p0.equals(N[R]) || (D = m.getDepth(tt.RIGHT));
                  var q = new Ws(this._seg, D);
                  E.add(q);
                }
            } else if (wt(arguments[2], sn) && arguments[0] instanceof U && wt(arguments[1], sn)) for (var Z = arguments[0], st = arguments[2], ut = arguments[1].iterator(); ut.hasNext(); ) {
              var gt = ut.next();
              gt.isForward() && this.findStabbedSegments(Z, gt, st);
            }
          }
        } }, { key: "getDepth", value: function(o) {
          var t = this.findStabbedSegments(o);
          return t.size() === 0 ? 0 : ui.min(t)._leftDepth;
        } }], [{ key: "constructor_", value: function() {
          this._subgraphs = null, this._seg = new Ee();
          var o = arguments[0];
          this._subgraphs = o;
        } }]);
      }(), Ws = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "compareTo", value: function(o) {
          var t = o;
          if (this._upwardSeg.minX() >= t._upwardSeg.maxX()) return 1;
          if (this._upwardSeg.maxX() <= t._upwardSeg.minX()) return -1;
          var e = this._upwardSeg.orientationIndex(t._upwardSeg);
          return e !== 0 || (e = -1 * t._upwardSeg.orientationIndex(this._upwardSeg)) !== 0 ? e : this._upwardSeg.compareTo(t._upwardSeg);
        } }, { key: "compareX", value: function(o, t) {
          var e = o.p0.compareTo(t.p0);
          return e !== 0 ? e : o.p1.compareTo(t.p1);
        } }, { key: "toString", value: function() {
          return this._upwardSeg.toString();
        } }, { key: "interfaces_", get: function() {
          return [K];
        } }], [{ key: "constructor_", value: function() {
          this._upwardSeg = null, this._leftDepth = null;
          var o = arguments[0], t = arguments[1];
          this._upwardSeg = new Ee(o), this._leftDepth = t;
        } }]);
      }();
      Xs.DepthSegment = Ws;
      var Dr = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, null, [{ key: "constructor_", value: function() {
          W.constructor_.call(this, "Projective point not representable on the Cartesian plane.");
        } }]);
      }(W), er = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "getY", value: function() {
          var t = this.y / this.w;
          if (ht.isNaN(t) || ht.isInfinite(t)) throw new Dr();
          return t;
        } }, { key: "getX", value: function() {
          var t = this.x / this.w;
          if (ht.isNaN(t) || ht.isInfinite(t)) throw new Dr();
          return t;
        } }, { key: "getCoordinate", value: function() {
          var t = new U();
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
            } else if (arguments[0] instanceof o && arguments[1] instanceof o) {
              var l = arguments[0], _ = arguments[1];
              this.x = l.y * _.w - _.y * l.w, this.y = _.x * l.w - l.x * _.w, this.w = l.x * _.y - _.x * l.y;
            } else if (arguments[0] instanceof U && arguments[1] instanceof U) {
              var m = arguments[0], E = arguments[1];
              this.x = m.y - E.y, this.y = E.x - m.x, this.w = m.x * E.y - E.x * m.y;
            }
          } else if (arguments.length === 3) {
            var N = arguments[0], R = arguments[1], D = arguments[2];
            this.x = N, this.y = R, this.w = D;
          } else if (arguments.length === 4) {
            var q = arguments[0], Z = arguments[1], st = arguments[2], ut = arguments[3], gt = q.y - Z.y, bt = Z.x - q.x, lt = q.x * Z.y - Z.x * q.y, Wt = st.y - ut.y, ce = ut.x - st.x, se = st.x * ut.y - ut.x * st.y;
            this.x = bt * se - ce * lt, this.y = Wt * lt - gt * se, this.w = gt * ce - Wt * bt;
          }
        } }]);
      }(), go = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "area", value: function() {
          return o.area(this.p0, this.p1, this.p2);
        } }, { key: "signedArea", value: function() {
          return o.signedArea(this.p0, this.p1, this.p2);
        } }, { key: "interpolateZ", value: function(t) {
          if (t === null) throw new X("Supplied point is null.");
          return o.interpolateZ(t, this.p0, this.p1, this.p2);
        } }, { key: "longestSideLength", value: function() {
          return o.longestSideLength(this.p0, this.p1, this.p2);
        } }, { key: "isAcute", value: function() {
          return o.isAcute(this.p0, this.p1, this.p2);
        } }, { key: "circumcentre", value: function() {
          return o.circumcentre(this.p0, this.p1, this.p2);
        } }, { key: "area3D", value: function() {
          return o.area3D(this.p0, this.p1, this.p2);
        } }, { key: "centroid", value: function() {
          return o.centroid(this.p0, this.p1, this.p2);
        } }, { key: "inCentre", value: function() {
          return o.inCentre(this.p0, this.p1, this.p2);
        } }], [{ key: "constructor_", value: function() {
          this.p0 = null, this.p1 = null, this.p2 = null;
          var t = arguments[0], e = arguments[1], s = arguments[2];
          this.p0 = t, this.p1 = e, this.p2 = s;
        } }, { key: "area", value: function(t, e, s) {
          return Math.abs(((s.x - t.x) * (e.y - t.y) - (e.x - t.x) * (s.y - t.y)) / 2);
        } }, { key: "signedArea", value: function(t, e, s) {
          return ((s.x - t.x) * (e.y - t.y) - (e.x - t.x) * (s.y - t.y)) / 2;
        } }, { key: "det", value: function(t, e, s, l) {
          return t * l - e * s;
        } }, { key: "interpolateZ", value: function(t, e, s, l) {
          var _ = e.x, m = e.y, E = s.x - _, N = l.x - _, R = s.y - m, D = l.y - m, q = E * D - N * R, Z = t.x - _, st = t.y - m, ut = (D * Z - N * st) / q, gt = (-R * Z + E * st) / q;
          return e.getZ() + ut * (s.getZ() - e.getZ()) + gt * (l.getZ() - e.getZ());
        } }, { key: "longestSideLength", value: function(t, e, s) {
          var l = t.distance(e), _ = e.distance(s), m = s.distance(t), E = l;
          return _ > E && (E = _), m > E && (E = m), E;
        } }, { key: "circumcentreDD", value: function(t, e, s) {
          var l = dt.valueOf(t.x).subtract(s.x), _ = dt.valueOf(t.y).subtract(s.y), m = dt.valueOf(e.x).subtract(s.x), E = dt.valueOf(e.y).subtract(s.y), N = dt.determinant(l, _, m, E).multiply(2), R = l.sqr().add(_.sqr()), D = m.sqr().add(E.sqr()), q = dt.determinant(_, R, E, D), Z = dt.determinant(l, R, m, D), st = dt.valueOf(s.x).subtract(q.divide(N)).doubleValue(), ut = dt.valueOf(s.y).add(Z.divide(N)).doubleValue();
          return new U(st, ut);
        } }, { key: "isAcute", value: function(t, e, s) {
          return !!_e.isAcute(t, e, s) && !!_e.isAcute(e, s, t) && !!_e.isAcute(s, t, e);
        } }, { key: "circumcentre", value: function(t, e, s) {
          var l = s.x, _ = s.y, m = t.x - l, E = t.y - _, N = e.x - l, R = e.y - _, D = 2 * o.det(m, E, N, R), q = o.det(E, m * m + E * E, R, N * N + R * R), Z = o.det(m, m * m + E * E, N, N * N + R * R);
          return new U(l - q / D, _ + Z / D);
        } }, { key: "perpendicularBisector", value: function(t, e) {
          var s = e.x - t.x, l = e.y - t.y, _ = new er(t.x + s / 2, t.y + l / 2, 1), m = new er(t.x - l + s / 2, t.y + s + l / 2, 1);
          return new er(_, m);
        } }, { key: "angleBisector", value: function(t, e, s) {
          var l = e.distance(t), _ = l / (l + e.distance(s)), m = s.x - t.x, E = s.y - t.y;
          return new U(t.x + _ * m, t.y + _ * E);
        } }, { key: "area3D", value: function(t, e, s) {
          var l = e.x - t.x, _ = e.y - t.y, m = e.getZ() - t.getZ(), E = s.x - t.x, N = s.y - t.y, R = s.getZ() - t.getZ(), D = _ * R - m * N, q = m * E - l * R, Z = l * N - _ * E, st = D * D + q * q + Z * Z, ut = Math.sqrt(st) / 2;
          return ut;
        } }, { key: "centroid", value: function(t, e, s) {
          var l = (t.x + e.x + s.x) / 3, _ = (t.y + e.y + s.y) / 3;
          return new U(l, _);
        } }, { key: "inCentre", value: function(t, e, s) {
          var l = e.distance(s), _ = t.distance(s), m = t.distance(e), E = l + _ + m, N = (l * t.x + _ * e.x + m * s.x) / E, R = (l * t.y + _ * e.y + m * s.y) / E;
          return new U(N, R);
        } }]);
      }(), Vu = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "addRingSide", value: function(o, t, e, s, l) {
          if (t === 0 && o.length < Ii.MINIMUM_VALID_SIZE) return null;
          var _ = s, m = l;
          o.length >= Ii.MINIMUM_VALID_SIZE && pt.isCCW(o) && (_ = l, m = s, e = tt.opposite(e));
          var E = this._curveBuilder.getRingCurve(o, e, t);
          this.addCurve(E, _, m);
        } }, { key: "addRingBothSides", value: function(o, t) {
          this.addRingSide(o, t, tt.LEFT, A.EXTERIOR, A.INTERIOR), this.addRingSide(o, t, tt.RIGHT, A.INTERIOR, A.EXTERIOR);
        } }, { key: "addPoint", value: function(o) {
          if (this._distance <= 0) return null;
          var t = o.getCoordinates(), e = this._curveBuilder.getLineCurve(t, this._distance);
          this.addCurve(e, A.EXTERIOR, A.INTERIOR);
        } }, { key: "addPolygon", value: function(o) {
          var t = this._distance, e = tt.LEFT;
          this._distance < 0 && (t = -this._distance, e = tt.RIGHT);
          var s = o.getExteriorRing(), l = re.removeRepeatedPoints(s.getCoordinates());
          if (this._distance < 0 && this.isErodedCompletely(s, this._distance) || this._distance <= 0 && l.length < 3) return null;
          this.addRingSide(l, t, e, A.EXTERIOR, A.INTERIOR);
          for (var _ = 0; _ < o.getNumInteriorRing(); _++) {
            var m = o.getInteriorRingN(_), E = re.removeRepeatedPoints(m.getCoordinates());
            this._distance > 0 && this.isErodedCompletely(m, -this._distance) || this.addRingSide(E, t, tt.opposite(e), A.INTERIOR, A.EXTERIOR);
          }
        } }, { key: "isTriangleErodedCompletely", value: function(o, t) {
          var e = new go(o[0], o[1], o[2]), s = e.inCentre();
          return on.pointToSegment(s, e.p0, e.p1) < Math.abs(t);
        } }, { key: "addLineString", value: function(o) {
          if (this._curveBuilder.isLineOffsetEmpty(this._distance)) return null;
          var t = re.removeRepeatedPoints(o.getCoordinates());
          if (re.isRing(t) && !this._curveBuilder.getBufferParameters().isSingleSided()) this.addRingBothSides(t, this._distance);
          else {
            var e = this._curveBuilder.getLineCurve(t, this._distance);
            this.addCurve(e, A.EXTERIOR, A.INTERIOR);
          }
        } }, { key: "addCurve", value: function(o, t, e) {
          if (o === null || o.length < 2) return null;
          var s = new mn(o, new We(0, A.BOUNDARY, t, e));
          this._curveList.add(s);
        } }, { key: "getCurves", value: function() {
          return this.add(this._inputGeom), this._curveList;
        } }, { key: "add", value: function(o) {
          if (o.isEmpty()) return null;
          if (o instanceof Cr) this.addPolygon(o);
          else if (o instanceof Ki) this.addLineString(o);
          else if (o instanceof xs) this.addPoint(o);
          else if (o instanceof Ms) this.addCollection(o);
          else if (o instanceof ks) this.addCollection(o);
          else if (o instanceof Is) this.addCollection(o);
          else {
            if (!(o instanceof be)) throw new qe(o.getGeometryType());
            this.addCollection(o);
          }
        } }, { key: "isErodedCompletely", value: function(o, t) {
          var e = o.getCoordinates();
          if (e.length < 4) return t < 0;
          if (e.length === 4) return this.isTriangleErodedCompletely(e, t);
          var s = o.getEnvelopeInternal(), l = Math.min(s.getHeight(), s.getWidth());
          return t < 0 && 2 * Math.abs(t) > l;
        } }, { key: "addCollection", value: function(o) {
          for (var t = 0; t < o.getNumGeometries(); t++) {
            var e = o.getGeometryN(t);
            this.add(e);
          }
        } }], [{ key: "constructor_", value: function() {
          this._inputGeom = null, this._distance = null, this._curveBuilder = null, this._curveList = new mt();
          var o = arguments[0], t = arguments[1], e = arguments[2];
          this._inputGeom = o, this._distance = t, this._curveBuilder = e;
        } }]);
      }(), $s = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "locate", value: function(o) {
        } }]);
      }(), Hs = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "next", value: function() {
          if (this._atStart) return this._atStart = !1, o.isAtomic(this._parent) && this._index++, this._parent;
          if (this._subcollectionIterator !== null) {
            if (this._subcollectionIterator.hasNext()) return this._subcollectionIterator.next();
            this._subcollectionIterator = null;
          }
          if (this._index >= this._max) throw new Se();
          var t = this._parent.getGeometryN(this._index++);
          return t instanceof be ? (this._subcollectionIterator = new o(t), this._subcollectionIterator.next()) : t;
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
          return [Wu];
        } }], [{ key: "constructor_", value: function() {
          this._parent = null, this._atStart = null, this._max = null, this._index = null, this._subcollectionIterator = null;
          var t = arguments[0];
          this._parent = t, this._atStart = !0, this._index = 0, this._max = t.getNumGeometries();
        } }, { key: "isAtomic", value: function(t) {
          return !(t instanceof be);
        } }]);
      }(), Zu = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "locate", value: function(t) {
          return o.locate(t, this._geom);
        } }, { key: "interfaces_", get: function() {
          return [$s];
        } }], [{ key: "constructor_", value: function() {
          this._geom = null;
          var t = arguments[0];
          this._geom = t;
        } }, { key: "locatePointInPolygon", value: function(t, e) {
          if (e.isEmpty()) return A.EXTERIOR;
          var s = e.getExteriorRing(), l = o.locatePointInRing(t, s);
          if (l !== A.INTERIOR) return l;
          for (var _ = 0; _ < e.getNumInteriorRing(); _++) {
            var m = e.getInteriorRingN(_), E = o.locatePointInRing(t, m);
            if (E === A.BOUNDARY) return A.BOUNDARY;
            if (E === A.INTERIOR) return A.EXTERIOR;
          }
          return A.INTERIOR;
        } }, { key: "locatePointInRing", value: function(t, e) {
          return e.getEnvelopeInternal().intersects(t) ? Rs.locateInRing(t, e.getCoordinates()) : A.EXTERIOR;
        } }, { key: "containsPointInPolygon", value: function(t, e) {
          return A.EXTERIOR !== o.locatePointInPolygon(t, e);
        } }, { key: "locateInGeometry", value: function(t, e) {
          if (e instanceof Cr) return o.locatePointInPolygon(t, e);
          if (e instanceof be) for (var s = new Hs(e); s.hasNext(); ) {
            var l = s.next();
            if (l !== e) {
              var _ = o.locateInGeometry(t, l);
              if (_ !== A.EXTERIOR) return _;
            }
          }
          return A.EXTERIOR;
        } }, { key: "isContained", value: function(t, e) {
          return A.EXTERIOR !== o.locate(t, e);
        } }, { key: "locate", value: function(t, e) {
          return e.isEmpty() ? A.EXTERIOR : e.getEnvelopeInternal().intersects(t) ? o.locateInGeometry(t, e) : A.EXTERIOR;
        } }]);
      }(), vo = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "getNextCW", value: function(o) {
          this.getEdges();
          var t = this._edgeList.indexOf(o), e = t - 1;
          return t === 0 && (e = this._edgeList.size() - 1), this._edgeList.get(e);
        } }, { key: "propagateSideLabels", value: function(o) {
          for (var t = A.NONE, e = this.iterator(); e.hasNext(); ) {
            var s = e.next().getLabel();
            s.isArea(o) && s.getLocation(o, tt.LEFT) !== A.NONE && (t = s.getLocation(o, tt.LEFT));
          }
          if (t === A.NONE) return null;
          for (var l = t, _ = this.iterator(); _.hasNext(); ) {
            var m = _.next(), E = m.getLabel();
            if (E.getLocation(o, tt.ON) === A.NONE && E.setLocation(o, tt.ON, l), E.isArea(o)) {
              var N = E.getLocation(o, tt.LEFT), R = E.getLocation(o, tt.RIGHT);
              if (R !== A.NONE) {
                if (R !== l) throw new an("side location conflict", m.getCoordinate());
                N === A.NONE && Nt.shouldNeverReachHere("found single null side (at " + m.getCoordinate() + ")"), l = N;
              } else Nt.isTrue(E.getLocation(o, tt.LEFT) === A.NONE, "found single null side"), E.setLocation(o, tt.RIGHT, l), E.setLocation(o, tt.LEFT, l);
            }
          }
        } }, { key: "getCoordinate", value: function() {
          var o = this.iterator();
          return o.hasNext() ? o.next().getCoordinate() : null;
        } }, { key: "print", value: function(o) {
          Ue.out.println("EdgeEndStar:   " + this.getCoordinate());
          for (var t = this.iterator(); t.hasNext(); )
            t.next().print(o);
        } }, { key: "isAreaLabelsConsistent", value: function(o) {
          return this.computeEdgeEndLabels(o.getBoundaryNodeRule()), this.checkAreaLabelsConsistent(0);
        } }, { key: "checkAreaLabelsConsistent", value: function(o) {
          var t = this.getEdges();
          if (t.size() <= 0) return !0;
          var e = t.size() - 1, s = t.get(e).getLabel().getLocation(o, tt.LEFT);
          Nt.isTrue(s !== A.NONE, "Found unlabelled area edge");
          for (var l = s, _ = this.iterator(); _.hasNext(); ) {
            var m = _.next().getLabel();
            Nt.isTrue(m.isArea(o), "Found non-area edge");
            var E = m.getLocation(o, tt.LEFT), N = m.getLocation(o, tt.RIGHT);
            if (E === N || N !== l) return !1;
            l = E;
          }
          return !0;
        } }, { key: "findIndex", value: function(o) {
          this.iterator();
          for (var t = 0; t < this._edgeList.size(); t++)
            if (this._edgeList.get(t) === o) return t;
          return -1;
        } }, { key: "iterator", value: function() {
          return this.getEdges().iterator();
        } }, { key: "getEdges", value: function() {
          return this._edgeList === null && (this._edgeList = new mt(this._edgeMap.values())), this._edgeList;
        } }, { key: "getLocation", value: function(o, t, e) {
          return this._ptInAreaLocation[o] === A.NONE && (this._ptInAreaLocation[o] = Zu.locate(t, e[o].getGeometry())), this._ptInAreaLocation[o];
        } }, { key: "toString", value: function() {
          var o = new Cn();
          o.append("EdgeEndStar:   " + this.getCoordinate()), o.append(`
`);
          for (var t = this.iterator(); t.hasNext(); ) {
            var e = t.next();
            o.append(e), o.append(`
`);
          }
          return o.toString();
        } }, { key: "computeEdgeEndLabels", value: function(o) {
          for (var t = this.iterator(); t.hasNext(); )
            t.next().computeLabel(o);
        } }, { key: "computeLabelling", value: function(o) {
          this.computeEdgeEndLabels(o[0].getBoundaryNodeRule()), this.propagateSideLabels(0), this.propagateSideLabels(1);
          for (var t = [!1, !1], e = this.iterator(); e.hasNext(); ) for (var s = e.next().getLabel(), l = 0; l < 2; l++) s.isLine(l) && s.getLocation(l) === A.BOUNDARY && (t[l] = !0);
          for (var _ = this.iterator(); _.hasNext(); ) for (var m = _.next(), E = m.getLabel(), N = 0; N < 2; N++) if (E.isAnyNull(N)) {
            var R = A.NONE;
            if (t[N]) R = A.EXTERIOR;
            else {
              var D = m.getCoordinate();
              R = this.getLocation(N, D, o);
            }
            E.setAllLocationsIfNull(N, R);
          }
        } }, { key: "getDegree", value: function() {
          return this._edgeMap.size();
        } }, { key: "insertEdgeEnd", value: function(o, t) {
          this._edgeMap.put(o, t), this._edgeList = null;
        } }], [{ key: "constructor_", value: function() {
          this._edgeMap = new Bt(), this._edgeList = null, this._ptInAreaLocation = [A.NONE, A.NONE];
        } }]);
      }(), Te = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "linkResultDirectedEdges", value: function() {
          this.getResultAreaEdges();
          for (var e = null, s = null, l = this._SCANNING_FOR_INCOMING, _ = 0; _ < this._resultAreaEdgeList.size(); _++) {
            var m = this._resultAreaEdgeList.get(_), E = m.getSym();
            if (m.getLabel().isArea()) switch (e === null && m.isInResult() && (e = m), l) {
              case this._SCANNING_FOR_INCOMING:
                if (!E.isInResult()) continue;
                s = E, l = this._LINKING_TO_OUTGOING;
                break;
              case this._LINKING_TO_OUTGOING:
                if (!m.isInResult()) continue;
                s.setNext(m), l = this._SCANNING_FOR_INCOMING;
            }
          }
          if (l === this._LINKING_TO_OUTGOING) {
            if (e === null) throw new an("no outgoing dirEdge found", this.getCoordinate());
            Nt.isTrue(e.isInResult(), "unable to link last incoming dirEdge"), s.setNext(e);
          }
        } }, { key: "insert", value: function(e) {
          var s = e;
          this.insertEdgeEnd(s, s);
        } }, { key: "getRightmostEdge", value: function() {
          var e = this.getEdges(), s = e.size();
          if (s < 1) return null;
          var l = e.get(0);
          if (s === 1) return l;
          var _ = e.get(s - 1), m = l.getQuadrant(), E = _.getQuadrant();
          return pe.isNorthern(m) && pe.isNorthern(E) ? l : pe.isNorthern(m) || pe.isNorthern(E) ? l.getDy() !== 0 ? l : _.getDy() !== 0 ? _ : (Nt.shouldNeverReachHere("found two horizontal edges incident on node"), null) : _;
        } }, { key: "print", value: function(e) {
          Ue.out.println("DirectedEdgeStar: " + this.getCoordinate());
          for (var s = this.iterator(); s.hasNext(); ) {
            var l = s.next();
            e.print("out "), l.print(e), e.println(), e.print("in "), l.getSym().print(e), e.println();
          }
        } }, { key: "getResultAreaEdges", value: function() {
          if (this._resultAreaEdgeList !== null) return this._resultAreaEdgeList;
          this._resultAreaEdgeList = new mt();
          for (var e = this.iterator(); e.hasNext(); ) {
            var s = e.next();
            (s.isInResult() || s.getSym().isInResult()) && this._resultAreaEdgeList.add(s);
          }
          return this._resultAreaEdgeList;
        } }, { key: "updateLabelling", value: function(e) {
          for (var s = this.iterator(); s.hasNext(); ) {
            var l = s.next().getLabel();
            l.setAllLocationsIfNull(0, e.getLocation(0)), l.setAllLocationsIfNull(1, e.getLocation(1));
          }
        } }, { key: "linkAllDirectedEdges", value: function() {
          this.getEdges();
          for (var e = null, s = null, l = this._edgeList.size() - 1; l >= 0; l--) {
            var _ = this._edgeList.get(l), m = _.getSym();
            s === null && (s = m), e !== null && m.setNext(e), e = _;
          }
          s.setNext(e);
        } }, { key: "computeDepths", value: function() {
          if (arguments.length === 1) {
            var e = arguments[0], s = this.findIndex(e), l = e.getDepth(tt.LEFT), _ = e.getDepth(tt.RIGHT), m = this.computeDepths(s + 1, this._edgeList.size(), l);
            if (this.computeDepths(0, s, m) !== _) throw new an("depth mismatch at " + e.getCoordinate());
          } else if (arguments.length === 3) {
            for (var E = arguments[1], N = arguments[2], R = arguments[0]; R < E; R++) {
              var D = this._edgeList.get(R);
              D.setEdgeDepths(tt.RIGHT, N), N = D.getDepth(tt.LEFT);
            }
            return N;
          }
        } }, { key: "mergeSymLabels", value: function() {
          for (var e = this.iterator(); e.hasNext(); ) {
            var s = e.next();
            s.getLabel().merge(s.getSym().getLabel());
          }
        } }, { key: "linkMinimalDirectedEdges", value: function(e) {
          for (var s = null, l = null, _ = this._SCANNING_FOR_INCOMING, m = this._resultAreaEdgeList.size() - 1; m >= 0; m--) {
            var E = this._resultAreaEdgeList.get(m), N = E.getSym();
            switch (s === null && E.getEdgeRing() === e && (s = E), _) {
              case this._SCANNING_FOR_INCOMING:
                if (N.getEdgeRing() !== e) continue;
                l = N, _ = this._LINKING_TO_OUTGOING;
                break;
              case this._LINKING_TO_OUTGOING:
                if (E.getEdgeRing() !== e) continue;
                l.setNextMin(E), _ = this._SCANNING_FOR_INCOMING;
            }
          }
          _ === this._LINKING_TO_OUTGOING && (Nt.isTrue(s !== null, "found null for first outgoing dirEdge"), Nt.isTrue(s.getEdgeRing() === e, "unable to link last incoming dirEdge"), l.setNextMin(s));
        } }, { key: "getOutgoingDegree", value: function() {
          if (arguments.length === 0) {
            for (var e = 0, s = this.iterator(); s.hasNext(); )
              s.next().isInResult() && e++;
            return e;
          }
          if (arguments.length === 1) {
            for (var l = arguments[0], _ = 0, m = this.iterator(); m.hasNext(); )
              m.next().getEdgeRing() === l && _++;
            return _;
          }
        } }, { key: "getLabel", value: function() {
          return this._label;
        } }, { key: "findCoveredLineEdges", value: function() {
          for (var e = A.NONE, s = this.iterator(); s.hasNext(); ) {
            var l = s.next(), _ = l.getSym();
            if (!l.isLineEdge()) {
              if (l.isInResult()) {
                e = A.INTERIOR;
                break;
              }
              if (_.isInResult()) {
                e = A.EXTERIOR;
                break;
              }
            }
          }
          if (e === A.NONE) return null;
          for (var m = e, E = this.iterator(); E.hasNext(); ) {
            var N = E.next(), R = N.getSym();
            N.isLineEdge() ? N.getEdge().setCovered(m === A.INTERIOR) : (N.isInResult() && (m = A.EXTERIOR), R.isInResult() && (m = A.INTERIOR));
          }
        } }, { key: "computeLabelling", value: function(e) {
          C(t, "computeLabelling", this, 1).call(this, e), this._label = new We(A.NONE);
          for (var s = this.iterator(); s.hasNext(); ) for (var l = s.next().getEdge().getLabel(), _ = 0; _ < 2; _++) {
            var m = l.getLocation(_);
            m !== A.INTERIOR && m !== A.BOUNDARY || this._label.setLocation(_, A.INTERIOR);
          }
        } }], [{ key: "constructor_", value: function() {
          this._resultAreaEdgeList = null, this._label = null, this._SCANNING_FOR_INCOMING = 1, this._LINKING_TO_OUTGOING = 2;
        } }]);
      }(vo), Vs = function(o) {
        function t() {
          return f(this, t), h(this, t);
        }
        return x(t, o), g(t, [{ key: "createNode", value: function(e) {
          return new Or(e, new Te());
        } }]);
      }(oo), Pi = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "compareTo", value: function(t) {
          var e = t;
          return o.compareOriented(this._pts, this._orientation, e._pts, e._orientation);
        } }, { key: "interfaces_", get: function() {
          return [K];
        } }], [{ key: "constructor_", value: function() {
          this._pts = null, this._orientation = null;
          var t = arguments[0];
          this._pts = t, this._orientation = o.orientation(t);
        } }, { key: "orientation", value: function(t) {
          return re.increasingDirection(t) === 1;
        } }, { key: "compareOriented", value: function(t, e, s, l) {
          for (var _ = e ? 1 : -1, m = l ? 1 : -1, E = e ? t.length : -1, N = l ? s.length : -1, R = e ? 0 : t.length - 1, D = l ? 0 : s.length - 1; ; ) {
            var q = t[R].compareTo(s[D]);
            if (q !== 0) return q;
            var Z = (R += _) === E, st = (D += m) === N;
            if (Z && !st) return -1;
            if (!Z && st) return 1;
            if (Z && st) return 0;
          }
        } }]);
      }(), _o = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "print", value: function(o) {
          o.print("MULTILINESTRING ( ");
          for (var t = 0; t < this._edges.size(); t++) {
            var e = this._edges.get(t);
            t > 0 && o.print(","), o.print("(");
            for (var s = e.getCoordinates(), l = 0; l < s.length; l++) l > 0 && o.print(","), o.print(s[l].x + " " + s[l].y);
            o.println(")");
          }
          o.print(")  ");
        } }, { key: "addAll", value: function(o) {
          for (var t = o.iterator(); t.hasNext(); ) this.add(t.next());
        } }, { key: "findEdgeIndex", value: function(o) {
          for (var t = 0; t < this._edges.size(); t++) if (this._edges.get(t).equals(o)) return t;
          return -1;
        } }, { key: "iterator", value: function() {
          return this._edges.iterator();
        } }, { key: "getEdges", value: function() {
          return this._edges;
        } }, { key: "get", value: function(o) {
          return this._edges.get(o);
        } }, { key: "findEqualEdge", value: function(o) {
          var t = new Pi(o.getCoordinates());
          return this._ocaMap.get(t);
        } }, { key: "add", value: function(o) {
          this._edges.add(o);
          var t = new Pi(o.getCoordinates());
          this._ocaMap.put(t, o);
        } }], [{ key: "constructor_", value: function() {
          this._edges = new mt(), this._ocaMap = new Bt();
        } }]);
      }(), Zs = function() {
        return g(function o() {
          f(this, o);
        }, [{ key: "processIntersections", value: function(o, t, e, s) {
        } }, { key: "isDone", value: function() {
        } }]);
      }(), Ku = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "isTrivialIntersection", value: function(t, e, s, l) {
          if (t === s && this._li.getIntersectionNum() === 1) {
            if (o.isAdjacentSegments(e, l)) return !0;
            if (t.isClosed()) {
              var _ = t.size() - 1;
              if (e === 0 && l === _ || l === 0 && e === _) return !0;
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
        } }, { key: "processIntersections", value: function(t, e, s, l) {
          if (t === s && e === l) return null;
          this.numTests++;
          var _ = t.getCoordinates()[e], m = t.getCoordinates()[e + 1], E = s.getCoordinates()[l], N = s.getCoordinates()[l + 1];
          this._li.computeIntersection(_, m, E, N), this._li.hasIntersection() && (this.numIntersections++, this._li.isInteriorIntersection() && (this.numInteriorIntersections++, this._hasInterior = !0), this.isTrivialIntersection(t, e, s, l) || (this._hasIntersection = !0, t.addIntersections(this._li, e, 0), s.addIntersections(this._li, l, 1), this._li.isProper() && (this.numProperIntersections++, this._hasProper = !0, this._hasProperInterior = !0)));
        } }, { key: "hasIntersection", value: function() {
          return this._hasIntersection;
        } }, { key: "isDone", value: function() {
          return !1;
        } }, { key: "hasInteriorIntersection", value: function() {
          return this._hasInterior;
        } }, { key: "interfaces_", get: function() {
          return [Zs];
        } }], [{ key: "constructor_", value: function() {
          this._hasIntersection = !1, this._hasProper = !1, this._hasProperInterior = !1, this._hasInterior = !1, this._properIntersectionPoint = null, this._li = null, this._isSelfIntersection = null, this.numIntersections = 0, this.numInteriorIntersections = 0, this.numProperIntersections = 0, this.numTests = 0;
          var t = arguments[0];
          this._li = t;
        } }, { key: "isAdjacentSegments", value: function(t, e) {
          return Math.abs(t - e) === 1;
        } }]);
      }(), Ju = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "getSegmentIndex", value: function() {
          return this.segmentIndex;
        } }, { key: "getCoordinate", value: function() {
          return this.coord;
        } }, { key: "print", value: function(o) {
          o.print(this.coord), o.print(" seg # = " + this.segmentIndex), o.println(" dist = " + this.dist);
        } }, { key: "compareTo", value: function(o) {
          var t = o;
          return this.compare(t.segmentIndex, t.dist);
        } }, { key: "isEndPoint", value: function(o) {
          return this.segmentIndex === 0 && this.dist === 0 || this.segmentIndex === o;
        } }, { key: "toString", value: function() {
          return this.coord + " seg # = " + this.segmentIndex + " dist = " + this.dist;
        } }, { key: "getDistance", value: function() {
          return this.dist;
        } }, { key: "compare", value: function(o, t) {
          return this.segmentIndex < o ? -1 : this.segmentIndex > o ? 1 : this.dist < t ? -1 : this.dist > t ? 1 : 0;
        } }, { key: "interfaces_", get: function() {
          return [K];
        } }], [{ key: "constructor_", value: function() {
          this.coord = null, this.segmentIndex = null, this.dist = null;
          var o = arguments[0], t = arguments[1], e = arguments[2];
          this.coord = new U(o), this.segmentIndex = t, this.dist = e;
        } }]);
      }(), Qu = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "print", value: function(o) {
          o.println("Intersections:");
          for (var t = this.iterator(); t.hasNext(); )
            t.next().print(o);
        } }, { key: "iterator", value: function() {
          return this._nodeMap.values().iterator();
        } }, { key: "addSplitEdges", value: function(o) {
          this.addEndpoints();
          for (var t = this.iterator(), e = t.next(); t.hasNext(); ) {
            var s = t.next(), l = this.createSplitEdge(e, s);
            o.add(l), e = s;
          }
        } }, { key: "addEndpoints", value: function() {
          var o = this.edge.pts.length - 1;
          this.add(this.edge.pts[0], 0, 0), this.add(this.edge.pts[o], o, 0);
        } }, { key: "createSplitEdge", value: function(o, t) {
          var e = t.segmentIndex - o.segmentIndex + 2, s = this.edge.pts[t.segmentIndex], l = t.dist > 0 || !t.coord.equals2D(s);
          l || e--;
          var _ = new Array(e).fill(null), m = 0;
          _[m++] = new U(o.coord);
          for (var E = o.segmentIndex + 1; E <= t.segmentIndex; E++) _[m++] = this.edge.pts[E];
          return l && (_[m] = t.coord), new Fr(_, new We(this.edge._label));
        } }, { key: "add", value: function(o, t, e) {
          var s = new Ju(o, t, e), l = this._nodeMap.get(s);
          return l !== null ? l : (this._nodeMap.put(s, s), s);
        } }, { key: "isIntersection", value: function(o) {
          for (var t = this.iterator(); t.hasNext(); )
            if (t.next().coord.equals(o)) return !0;
          return !1;
        } }], [{ key: "constructor_", value: function() {
          this._nodeMap = new Bt(), this.edge = null;
          var o = arguments[0];
          this.edge = o;
        } }]);
      }(), ju = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "isIntersects", value: function() {
          return !this.isDisjoint();
        } }, { key: "isCovers", value: function() {
          return (o.isTrue(this._matrix[A.INTERIOR][A.INTERIOR]) || o.isTrue(this._matrix[A.INTERIOR][A.BOUNDARY]) || o.isTrue(this._matrix[A.BOUNDARY][A.INTERIOR]) || o.isTrue(this._matrix[A.BOUNDARY][A.BOUNDARY])) && this._matrix[A.EXTERIOR][A.INTERIOR] === nt.FALSE && this._matrix[A.EXTERIOR][A.BOUNDARY] === nt.FALSE;
        } }, { key: "isCoveredBy", value: function() {
          return (o.isTrue(this._matrix[A.INTERIOR][A.INTERIOR]) || o.isTrue(this._matrix[A.INTERIOR][A.BOUNDARY]) || o.isTrue(this._matrix[A.BOUNDARY][A.INTERIOR]) || o.isTrue(this._matrix[A.BOUNDARY][A.BOUNDARY])) && this._matrix[A.INTERIOR][A.EXTERIOR] === nt.FALSE && this._matrix[A.BOUNDARY][A.EXTERIOR] === nt.FALSE;
        } }, { key: "set", value: function() {
          if (arguments.length === 1) for (var t = arguments[0], e = 0; e < t.length; e++) {
            var s = Math.trunc(e / 3), l = e % 3;
            this._matrix[s][l] = nt.toDimensionValue(t.charAt(e));
          }
          else if (arguments.length === 3) {
            var _ = arguments[0], m = arguments[1], E = arguments[2];
            this._matrix[_][m] = E;
          }
        } }, { key: "isContains", value: function() {
          return o.isTrue(this._matrix[A.INTERIOR][A.INTERIOR]) && this._matrix[A.EXTERIOR][A.INTERIOR] === nt.FALSE && this._matrix[A.EXTERIOR][A.BOUNDARY] === nt.FALSE;
        } }, { key: "setAtLeast", value: function() {
          if (arguments.length === 1) for (var t = arguments[0], e = 0; e < t.length; e++) {
            var s = Math.trunc(e / 3), l = e % 3;
            this.setAtLeast(s, l, nt.toDimensionValue(t.charAt(e)));
          }
          else if (arguments.length === 3) {
            var _ = arguments[0], m = arguments[1], E = arguments[2];
            this._matrix[_][m] < E && (this._matrix[_][m] = E);
          }
        } }, { key: "setAtLeastIfValid", value: function(t, e, s) {
          t >= 0 && e >= 0 && this.setAtLeast(t, e, s);
        } }, { key: "isWithin", value: function() {
          return o.isTrue(this._matrix[A.INTERIOR][A.INTERIOR]) && this._matrix[A.INTERIOR][A.EXTERIOR] === nt.FALSE && this._matrix[A.BOUNDARY][A.EXTERIOR] === nt.FALSE;
        } }, { key: "isTouches", value: function(t, e) {
          return t > e ? this.isTouches(e, t) : (t === nt.A && e === nt.A || t === nt.L && e === nt.L || t === nt.L && e === nt.A || t === nt.P && e === nt.A || t === nt.P && e === nt.L) && this._matrix[A.INTERIOR][A.INTERIOR] === nt.FALSE && (o.isTrue(this._matrix[A.INTERIOR][A.BOUNDARY]) || o.isTrue(this._matrix[A.BOUNDARY][A.INTERIOR]) || o.isTrue(this._matrix[A.BOUNDARY][A.BOUNDARY]));
        } }, { key: "isOverlaps", value: function(t, e) {
          return t === nt.P && e === nt.P || t === nt.A && e === nt.A ? o.isTrue(this._matrix[A.INTERIOR][A.INTERIOR]) && o.isTrue(this._matrix[A.INTERIOR][A.EXTERIOR]) && o.isTrue(this._matrix[A.EXTERIOR][A.INTERIOR]) : t === nt.L && e === nt.L && this._matrix[A.INTERIOR][A.INTERIOR] === 1 && o.isTrue(this._matrix[A.INTERIOR][A.EXTERIOR]) && o.isTrue(this._matrix[A.EXTERIOR][A.INTERIOR]);
        } }, { key: "isEquals", value: function(t, e) {
          return t === e && o.isTrue(this._matrix[A.INTERIOR][A.INTERIOR]) && this._matrix[A.INTERIOR][A.EXTERIOR] === nt.FALSE && this._matrix[A.BOUNDARY][A.EXTERIOR] === nt.FALSE && this._matrix[A.EXTERIOR][A.INTERIOR] === nt.FALSE && this._matrix[A.EXTERIOR][A.BOUNDARY] === nt.FALSE;
        } }, { key: "toString", value: function() {
          for (var t = new ri("123456789"), e = 0; e < 3; e++) for (var s = 0; s < 3; s++) t.setCharAt(3 * e + s, nt.toDimensionSymbol(this._matrix[e][s]));
          return t.toString();
        } }, { key: "setAll", value: function(t) {
          for (var e = 0; e < 3; e++) for (var s = 0; s < 3; s++) this._matrix[e][s] = t;
        } }, { key: "get", value: function(t, e) {
          return this._matrix[t][e];
        } }, { key: "transpose", value: function() {
          var t = this._matrix[1][0];
          return this._matrix[1][0] = this._matrix[0][1], this._matrix[0][1] = t, t = this._matrix[2][0], this._matrix[2][0] = this._matrix[0][2], this._matrix[0][2] = t, t = this._matrix[2][1], this._matrix[2][1] = this._matrix[1][2], this._matrix[1][2] = t, this;
        } }, { key: "matches", value: function(t) {
          if (t.length !== 9) throw new X("Should be length 9: " + t);
          for (var e = 0; e < 3; e++) for (var s = 0; s < 3; s++) if (!o.matches(this._matrix[e][s], t.charAt(3 * e + s))) return !1;
          return !0;
        } }, { key: "add", value: function(t) {
          for (var e = 0; e < 3; e++) for (var s = 0; s < 3; s++) this.setAtLeast(e, s, t.get(e, s));
        } }, { key: "isDisjoint", value: function() {
          return this._matrix[A.INTERIOR][A.INTERIOR] === nt.FALSE && this._matrix[A.INTERIOR][A.BOUNDARY] === nt.FALSE && this._matrix[A.BOUNDARY][A.INTERIOR] === nt.FALSE && this._matrix[A.BOUNDARY][A.BOUNDARY] === nt.FALSE;
        } }, { key: "isCrosses", value: function(t, e) {
          return t === nt.P && e === nt.L || t === nt.P && e === nt.A || t === nt.L && e === nt.A ? o.isTrue(this._matrix[A.INTERIOR][A.INTERIOR]) && o.isTrue(this._matrix[A.INTERIOR][A.EXTERIOR]) : t === nt.L && e === nt.P || t === nt.A && e === nt.P || t === nt.A && e === nt.L ? o.isTrue(this._matrix[A.INTERIOR][A.INTERIOR]) && o.isTrue(this._matrix[A.EXTERIOR][A.INTERIOR]) : t === nt.L && e === nt.L && this._matrix[A.INTERIOR][A.INTERIOR] === 0;
        } }, { key: "interfaces_", get: function() {
          return [et];
        } }], [{ key: "constructor_", value: function() {
          if (this._matrix = null, arguments.length === 0) this._matrix = Array(3).fill().map(function() {
            return Array(3);
          }), this.setAll(nt.FALSE);
          else if (arguments.length === 1) {
            if (typeof arguments[0] == "string") {
              var t = arguments[0];
              o.constructor_.call(this), this.set(t);
            } else if (arguments[0] instanceof o) {
              var e = arguments[0];
              o.constructor_.call(this), this._matrix[A.INTERIOR][A.INTERIOR] = e._matrix[A.INTERIOR][A.INTERIOR], this._matrix[A.INTERIOR][A.BOUNDARY] = e._matrix[A.INTERIOR][A.BOUNDARY], this._matrix[A.INTERIOR][A.EXTERIOR] = e._matrix[A.INTERIOR][A.EXTERIOR], this._matrix[A.BOUNDARY][A.INTERIOR] = e._matrix[A.BOUNDARY][A.INTERIOR], this._matrix[A.BOUNDARY][A.BOUNDARY] = e._matrix[A.BOUNDARY][A.BOUNDARY], this._matrix[A.BOUNDARY][A.EXTERIOR] = e._matrix[A.BOUNDARY][A.EXTERIOR], this._matrix[A.EXTERIOR][A.INTERIOR] = e._matrix[A.EXTERIOR][A.INTERIOR], this._matrix[A.EXTERIOR][A.BOUNDARY] = e._matrix[A.EXTERIOR][A.BOUNDARY], this._matrix[A.EXTERIOR][A.EXTERIOR] = e._matrix[A.EXTERIOR][A.EXTERIOR];
            }
          }
        } }, { key: "matches", value: function() {
          if (Number.isInteger(arguments[0]) && typeof arguments[1] == "string") {
            var t = arguments[0], e = arguments[1];
            return e === nt.SYM_DONTCARE || e === nt.SYM_TRUE && (t >= 0 || t === nt.TRUE) || e === nt.SYM_FALSE && t === nt.FALSE || e === nt.SYM_P && t === nt.P || e === nt.SYM_L && t === nt.L || e === nt.SYM_A && t === nt.A;
          }
          if (typeof arguments[0] == "string" && typeof arguments[1] == "string") {
            var s = arguments[1];
            return new o(arguments[0]).matches(s);
          }
        } }, { key: "isTrue", value: function(t) {
          return t >= 0 || t === nt.TRUE;
        } }]);
      }(), th = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "size", value: function() {
          return this._size;
        } }, { key: "addAll", value: function(t) {
          return t === null || t.length === 0 ? null : (this.ensureCapacity(this._size + t.length), Ue.arraycopy(t, 0, this._data, this._size, t.length), void (this._size += t.length));
        } }, { key: "ensureCapacity", value: function(t) {
          if (t <= this._data.length) return null;
          var e = Math.max(t, 2 * this._data.length);
          this._data = ei.copyOf(this._data, e);
        } }, { key: "toArray", value: function() {
          var t = new Array(this._size).fill(null);
          return Ue.arraycopy(this._data, 0, t, 0, this._size), t;
        } }, { key: "add", value: function(t) {
          this.ensureCapacity(this._size + 1), this._data[this._size] = t, ++this._size;
        } }], [{ key: "constructor_", value: function() {
          if (this._data = null, this._size = 0, arguments.length === 0) o.constructor_.call(this, 10);
          else if (arguments.length === 1) {
            var t = arguments[0];
            this._data = new Array(t).fill(null);
          }
        } }]);
      }(), Ci = function() {
        function o() {
          f(this, o);
        }
        return g(o, [{ key: "getChainStartIndices", value: function(t) {
          var e = 0, s = new th(Math.trunc(t.length / 2));
          s.add(e);
          do {
            var l = this.findChainEnd(t, e);
            s.add(l), e = l;
          } while (e < t.length - 1);
          return s.toArray();
        } }, { key: "findChainEnd", value: function(t, e) {
          for (var s = pe.quadrant(t[e], t[e + 1]), l = e + 1; l < t.length && pe.quadrant(t[l - 1], t[l]) === s; )
            l++;
          return l - 1;
        } }, { key: "OLDgetChainStartIndices", value: function(t) {
          var e = 0, s = new mt();
          s.add(e);
          do {
            var l = this.findChainEnd(t, e);
            s.add(l), e = l;
          } while (e < t.length - 1);
          return o.toIntArray(s);
        } }], [{ key: "toIntArray", value: function(t) {
          for (var e = new Array(t.size()).fill(null), s = 0; s < e.length; s++) e[s] = t.get(s).intValue();
          return e;
        } }]);
      }(), eh = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "getCoordinates", value: function() {
          return this.pts;
        } }, { key: "getMaxX", value: function(o) {
          var t = this.pts[this.startIndex[o]].x, e = this.pts[this.startIndex[o + 1]].x;
          return t > e ? t : e;
        } }, { key: "getMinX", value: function(o) {
          var t = this.pts[this.startIndex[o]].x, e = this.pts[this.startIndex[o + 1]].x;
          return t < e ? t : e;
        } }, { key: "computeIntersectsForChain", value: function() {
          if (arguments.length === 4) {
            var o = arguments[0], t = arguments[1], e = arguments[2], s = arguments[3];
            this.computeIntersectsForChain(this.startIndex[o], this.startIndex[o + 1], t, t.startIndex[e], t.startIndex[e + 1], s);
          } else if (arguments.length === 6) {
            var l = arguments[0], _ = arguments[1], m = arguments[2], E = arguments[3], N = arguments[4], R = arguments[5];
            if (_ - l == 1 && N - E == 1) return R.addIntersections(this.e, l, m.e, E), null;
            if (!this.overlaps(l, _, m, E, N)) return null;
            var D = Math.trunc((l + _) / 2), q = Math.trunc((E + N) / 2);
            l < D && (E < q && this.computeIntersectsForChain(l, D, m, E, q, R), q < N && this.computeIntersectsForChain(l, D, m, q, N, R)), D < _ && (E < q && this.computeIntersectsForChain(D, _, m, E, q, R), q < N && this.computeIntersectsForChain(D, _, m, q, N, R));
          }
        } }, { key: "overlaps", value: function(o, t, e, s, l) {
          return Ht.intersects(this.pts[o], this.pts[t], e.pts[s], e.pts[l]);
        } }, { key: "getStartIndexes", value: function() {
          return this.startIndex;
        } }, { key: "computeIntersects", value: function(o, t) {
          for (var e = 0; e < this.startIndex.length - 1; e++) for (var s = 0; s < o.startIndex.length - 1; s++) this.computeIntersectsForChain(e, o, s, t);
        } }], [{ key: "constructor_", value: function() {
          this.e = null, this.pts = null, this.startIndex = null;
          var o = arguments[0];
          this.e = o, this.pts = o.getCoordinates();
          var t = new Ci();
          this.startIndex = t.getChainStartIndices(this.pts);
        } }]);
      }(), mo = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "getDepth", value: function(t, e) {
          return this._depth[t][e];
        } }, { key: "setDepth", value: function(t, e, s) {
          this._depth[t][e] = s;
        } }, { key: "isNull", value: function() {
          if (arguments.length === 0) {
            for (var t = 0; t < 2; t++) for (var e = 0; e < 3; e++) if (this._depth[t][e] !== o.NULL_VALUE) return !1;
            return !0;
          }
          if (arguments.length === 1) {
            var s = arguments[0];
            return this._depth[s][1] === o.NULL_VALUE;
          }
          if (arguments.length === 2) {
            var l = arguments[0], _ = arguments[1];
            return this._depth[l][_] === o.NULL_VALUE;
          }
        } }, { key: "normalize", value: function() {
          for (var t = 0; t < 2; t++) if (!this.isNull(t)) {
            var e = this._depth[t][1];
            this._depth[t][2] < e && (e = this._depth[t][2]), e < 0 && (e = 0);
            for (var s = 1; s < 3; s++) {
              var l = 0;
              this._depth[t][s] > e && (l = 1), this._depth[t][s] = l;
            }
          }
        } }, { key: "getDelta", value: function(t) {
          return this._depth[t][tt.RIGHT] - this._depth[t][tt.LEFT];
        } }, { key: "getLocation", value: function(t, e) {
          return this._depth[t][e] <= 0 ? A.EXTERIOR : A.INTERIOR;
        } }, { key: "toString", value: function() {
          return "A: " + this._depth[0][1] + "," + this._depth[0][2] + " B: " + this._depth[1][1] + "," + this._depth[1][2];
        } }, { key: "add", value: function() {
          if (arguments.length === 1) for (var t = arguments[0], e = 0; e < 2; e++) for (var s = 1; s < 3; s++) {
            var l = t.getLocation(e, s);
            l !== A.EXTERIOR && l !== A.INTERIOR || (this.isNull(e, s) ? this._depth[e][s] = o.depthAtLocation(l) : this._depth[e][s] += o.depthAtLocation(l));
          }
          else if (arguments.length === 3) {
            var _ = arguments[0], m = arguments[1];
            arguments[2] === A.INTERIOR && this._depth[_][m]++;
          }
        } }], [{ key: "constructor_", value: function() {
          this._depth = Array(2).fill().map(function() {
            return Array(3);
          });
          for (var t = 0; t < 2; t++) for (var e = 0; e < 3; e++) this._depth[t][e] = o.NULL_VALUE;
        } }, { key: "depthAtLocation", value: function(t) {
          return t === A.EXTERIOR ? 0 : t === A.INTERIOR ? 1 : o.NULL_VALUE;
        } }]);
      }();
      mo.NULL_VALUE = -1;
      var Fr = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "getDepth", value: function() {
          return this._depth;
        } }, { key: "getCollapsedEdge", value: function() {
          var e = new Array(2).fill(null);
          return e[0] = this.pts[0], e[1] = this.pts[1], new t(e, We.toLineLabel(this._label));
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
          for (var l = !0, _ = !0, m = this.pts.length, E = 0; E < this.pts.length; E++) if (this.pts[E].equals2D(s.pts[E]) || (l = !1), this.pts[E].equals2D(s.pts[--m]) || (_ = !1), !l && !_) return !1;
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
          return this._mce === null && (this._mce = new eh(this)), this._mce;
        } }, { key: "getEnvelope", value: function() {
          if (this._env === null) {
            this._env = new Ht();
            for (var e = 0; e < this.pts.length; e++) this._env.expandToInclude(this.pts[e]);
          }
          return this._env;
        } }, { key: "addIntersection", value: function(e, s, l, _) {
          var m = new U(e.getIntersection(_)), E = s, N = e.getEdgeDistance(l, _), R = E + 1;
          if (R < this.pts.length) {
            var D = this.pts[R];
            m.equals2D(D) && (E = R, N = 0);
          }
          this.eiList.add(m, E, N);
        } }, { key: "toString", value: function() {
          var e = new ri();
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
        } }, { key: "addIntersections", value: function(e, s, l) {
          for (var _ = 0; _ < e.getIntersectionNum(); _++) this.addIntersection(e, s, l, _);
        } }], [{ key: "constructor_", value: function() {
          if (this.pts = null, this._env = null, this.eiList = new Qu(this), this._name = null, this._mce = null, this._isIsolated = !0, this._depth = new mo(), this._depthDelta = 0, arguments.length === 1) {
            var e = arguments[0];
            t.constructor_.call(this, e, null);
          } else if (arguments.length === 2) {
            var s = arguments[0], l = arguments[1];
            this.pts = s, this._label = l;
          }
        } }, { key: "updateIM", value: function() {
          if (!(arguments.length === 2 && arguments[1] instanceof ju && arguments[0] instanceof We)) return C(t, "updateIM", this).apply(this, arguments);
          var e = arguments[0], s = arguments[1];
          s.setAtLeastIfValid(e.getLocation(0, tt.ON), e.getLocation(1, tt.ON), 1), e.isArea() && (s.setAtLeastIfValid(e.getLocation(0, tt.LEFT), e.getLocation(1, tt.LEFT), 2), s.setAtLeastIfValid(e.getLocation(0, tt.RIGHT), e.getLocation(1, tt.RIGHT), 2));
        } }]);
      }(io), Ks = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "setWorkingPrecisionModel", value: function(t) {
          this._workingPrecisionModel = t;
        } }, { key: "insertUniqueEdge", value: function(t) {
          var e = this._edgeList.findEqualEdge(t);
          if (e !== null) {
            var s = e.getLabel(), l = t.getLabel();
            e.isPointwiseEqual(t) || (l = new We(t.getLabel())).flip(), s.merge(l);
            var _ = o.depthDelta(l), m = e.getDepthDelta() + _;
            e.setDepthDelta(m);
          } else this._edgeList.add(t), t.setDepthDelta(o.depthDelta(t.getLabel()));
        } }, { key: "buildSubgraphs", value: function(t, e) {
          for (var s = new mt(), l = t.iterator(); l.hasNext(); ) {
            var _ = l.next(), m = _.getRightmostCoordinate(), E = new Xs(s).getDepth(m);
            _.computeDepth(E), _.findResultEdges(), s.add(_), e.add(_.getDirectedEdges(), _.getNodes());
          }
        } }, { key: "createSubgraphs", value: function(t) {
          for (var e = new mt(), s = t.getNodes().iterator(); s.hasNext(); ) {
            var l = s.next();
            if (!l.isVisited()) {
              var _ = new ys();
              _.create(l), e.add(_);
            }
          }
          return ui.sort(e, ui.reverseOrder()), e;
        } }, { key: "createEmptyResultGeometry", value: function() {
          return this._geomFact.createPolygon();
        } }, { key: "getNoder", value: function(t) {
          if (this._workingNoder !== null) return this._workingNoder;
          var e = new zs(), s = new qn();
          return s.setPrecisionModel(t), e.setSegmentIntersector(new Ku(s)), e;
        } }, { key: "buffer", value: function(t, e) {
          var s = this._workingPrecisionModel;
          s === null && (s = t.getPrecisionModel()), this._geomFact = t.getFactory();
          var l = new Hu(s, this._bufParams), _ = new Vu(t, e, l).getCurves();
          if (_.size() <= 0) return this.createEmptyResultGeometry();
          this.computeNodedEdges(_, s), this._graph = new uo(new Vs()), this._graph.addEdges(this._edgeList.getEdges());
          var m = this.createSubgraphs(this._graph), E = new Xu(this._geomFact);
          this.buildSubgraphs(m, E);
          var N = E.getPolygons();
          return N.size() <= 0 ? this.createEmptyResultGeometry() : this._geomFact.buildGeometry(N);
        } }, { key: "computeNodedEdges", value: function(t, e) {
          var s = this.getNoder(e);
          s.computeNodes(t);
          for (var l = s.getNodedSubstrings().iterator(); l.hasNext(); ) {
            var _ = l.next(), m = _.getCoordinates();
            if (m.length !== 2 || !m[0].equals2D(m[1])) {
              var E = _.getData(), N = new Fr(_.getCoordinates(), new We(E));
              this.insertUniqueEdge(N);
            }
          }
        } }, { key: "setNoder", value: function(t) {
          this._workingNoder = t;
        } }], [{ key: "constructor_", value: function() {
          this._bufParams = null, this._workingPrecisionModel = null, this._workingNoder = null, this._geomFact = null, this._graph = null, this._edgeList = new _o();
          var t = arguments[0];
          this._bufParams = t;
        } }, { key: "depthDelta", value: function(t) {
          var e = t.getLocation(0, tt.LEFT), s = t.getLocation(0, tt.RIGHT);
          return e === A.INTERIOR && s === A.EXTERIOR ? 1 : e === A.EXTERIOR && s === A.INTERIOR ? -1 : 0;
        } }, { key: "convertSegStrings", value: function(t) {
          for (var e = new ki(), s = new mt(); t.hasNext(); ) {
            var l = t.next(), _ = e.createLineString(l.getCoordinates());
            s.add(_);
          }
          return e.buildGeometry(s);
        } }]);
      }(), Un = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "rescale", value: function() {
          if (wt(arguments[0], nn)) for (var t = arguments[0].iterator(); t.hasNext(); ) {
            var e = t.next();
            this.rescale(e.getCoordinates());
          }
          else if (arguments[0] instanceof Array) {
            for (var s = arguments[0], l = 0; l < s.length; l++) s[l].x = s[l].x / this._scaleFactor + this._offsetX, s[l].y = s[l].y / this._scaleFactor + this._offsetY;
            s.length === 2 && s[0].equals2D(s[1]) && Ue.out.println(s);
          }
        } }, { key: "scale", value: function() {
          if (wt(arguments[0], nn)) {
            for (var t = arguments[0], e = new mt(t.size()), s = t.iterator(); s.hasNext(); ) {
              var l = s.next();
              e.add(new mn(this.scale(l.getCoordinates()), l.getData()));
            }
            return e;
          }
          if (arguments[0] instanceof Array) {
            for (var _ = arguments[0], m = new Array(_.length).fill(null), E = 0; E < _.length; E++) m[E] = new U(Math.round((_[E].x - this._offsetX) * this._scaleFactor), Math.round((_[E].y - this._offsetY) * this._scaleFactor), _[E].getZ());
            return re.removeRepeatedPoints(m);
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
          return [Us];
        } }], [{ key: "constructor_", value: function() {
          if (this._noder = null, this._scaleFactor = null, this._offsetX = null, this._offsetY = null, this._isScaled = !1, arguments.length === 2) {
            var t = arguments[0], e = arguments[1];
            o.constructor_.call(this, t, e, 0, 0);
          } else if (arguments.length === 4) {
            var s = arguments[0], l = arguments[1];
            this._noder = s, this._scaleFactor = l, this._isScaled = !this.isIntegerPrecision();
          }
        } }]);
      }(), nr = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "checkEndPtVertexIntersections", value: function() {
          if (arguments.length === 0) for (var t = this._segStrings.iterator(); t.hasNext(); ) {
            var e = t.next().getCoordinates();
            this.checkEndPtVertexIntersections(e[0], this._segStrings), this.checkEndPtVertexIntersections(e[e.length - 1], this._segStrings);
          }
          else if (arguments.length === 2) {
            for (var s = arguments[0], l = arguments[1].iterator(); l.hasNext(); ) for (var _ = l.next().getCoordinates(), m = 1; m < _.length - 1; m++) if (_[m].equals(s)) throw new le("found endpt/interior pt intersection at index " + m + " :pt " + s);
          }
        } }, { key: "checkInteriorIntersections", value: function() {
          if (arguments.length === 0) for (var t = this._segStrings.iterator(); t.hasNext(); ) for (var e = t.next(), s = this._segStrings.iterator(); s.hasNext(); ) {
            var l = s.next();
            this.checkInteriorIntersections(e, l);
          }
          else if (arguments.length === 2) for (var _ = arguments[0], m = arguments[1], E = _.getCoordinates(), N = m.getCoordinates(), R = 0; R < E.length - 1; R++) for (var D = 0; D < N.length - 1; D++) this.checkInteriorIntersections(_, R, m, D);
          else if (arguments.length === 4) {
            var q = arguments[0], Z = arguments[1], st = arguments[2], ut = arguments[3];
            if (q === st && Z === ut) return null;
            var gt = q.getCoordinates()[Z], bt = q.getCoordinates()[Z + 1], lt = st.getCoordinates()[ut], Wt = st.getCoordinates()[ut + 1];
            if (this._li.computeIntersection(gt, bt, lt, Wt), this._li.hasIntersection() && (this._li.isProper() || this.hasInteriorIntersection(this._li, gt, bt) || this.hasInteriorIntersection(this._li, lt, Wt))) throw new le("found non-noded intersection at " + gt + "-" + bt + " and " + lt + "-" + Wt);
          }
        } }, { key: "checkValid", value: function() {
          this.checkEndPtVertexIntersections(), this.checkInteriorIntersections(), this.checkCollapses();
        } }, { key: "checkCollapses", value: function() {
          if (arguments.length === 0) for (var t = this._segStrings.iterator(); t.hasNext(); ) {
            var e = t.next();
            this.checkCollapses(e);
          }
          else if (arguments.length === 1) for (var s = arguments[0].getCoordinates(), l = 0; l < s.length - 2; l++) this.checkCollapse(s[l], s[l + 1], s[l + 2]);
        } }, { key: "hasInteriorIntersection", value: function(t, e, s) {
          for (var l = 0; l < t.getIntersectionNum(); l++) {
            var _ = t.getIntersection(l);
            if (!_.equals(e) && !_.equals(s)) return !0;
          }
          return !1;
        } }, { key: "checkCollapse", value: function(t, e, s) {
          if (t.equals(s)) throw new le("found non-noded collapse at " + o.fact.createLineString([t, e, s]));
        } }], [{ key: "constructor_", value: function() {
          this._li = new qn(), this._segStrings = null;
          var t = arguments[0];
          this._segStrings = t;
        } }]);
      }();
      nr.fact = new ki();
      var Js = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "intersectsScaled", value: function(t, e) {
          var s = Math.min(t.x, e.x), l = Math.max(t.x, e.x), _ = Math.min(t.y, e.y), m = Math.max(t.y, e.y), E = this._maxx < s || this._minx > l || this._maxy < _ || this._miny > m;
          if (E) return !1;
          var N = this.intersectsToleranceSquare(t, e);
          return Nt.isTrue(!(E && N), "Found bad envelope test"), N;
        } }, { key: "initCorners", value: function(t) {
          var e = 0.5;
          this._minx = t.x - e, this._maxx = t.x + e, this._miny = t.y - e, this._maxy = t.y + e, this._corner[0] = new U(this._maxx, this._maxy), this._corner[1] = new U(this._minx, this._maxy), this._corner[2] = new U(this._minx, this._miny), this._corner[3] = new U(this._maxx, this._miny);
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
            var t = o.SAFE_ENV_EXPANSION_FACTOR / this._scaleFactor;
            this._safeEnv = new Ht(this._originalPt.x - t, this._originalPt.x + t, this._originalPt.y - t, this._originalPt.y + t);
          }
          return this._safeEnv;
        } }, { key: "intersectsPixelClosure", value: function(t, e) {
          return this._li.computeIntersection(t, e, this._corner[0], this._corner[1]), !!this._li.hasIntersection() || (this._li.computeIntersection(t, e, this._corner[1], this._corner[2]), !!this._li.hasIntersection() || (this._li.computeIntersection(t, e, this._corner[2], this._corner[3]), !!this._li.hasIntersection() || (this._li.computeIntersection(t, e, this._corner[3], this._corner[0]), !!this._li.hasIntersection())));
        } }, { key: "intersectsToleranceSquare", value: function(t, e) {
          var s = !1, l = !1;
          return this._li.computeIntersection(t, e, this._corner[0], this._corner[1]), !!this._li.isProper() || (this._li.computeIntersection(t, e, this._corner[1], this._corner[2]), !!this._li.isProper() || (this._li.hasIntersection() && (s = !0), this._li.computeIntersection(t, e, this._corner[2], this._corner[3]), !!this._li.isProper() || (this._li.hasIntersection() && (l = !0), this._li.computeIntersection(t, e, this._corner[3], this._corner[0]), !!this._li.isProper() || !(!s || !l) || !!t.equals(this._pt) || !!e.equals(this._pt))));
        } }, { key: "addSnappedNode", value: function(t, e) {
          var s = t.getCoordinate(e), l = t.getCoordinate(e + 1);
          return !!this.intersects(s, l) && (t.addIntersection(this.getCoordinate(), e), !0);
        } }], [{ key: "constructor_", value: function() {
          this._li = null, this._pt = null, this._originalPt = null, this._ptScaled = null, this._p0Scaled = null, this._p1Scaled = null, this._scaleFactor = null, this._minx = null, this._maxx = null, this._miny = null, this._maxy = null, this._corner = new Array(4).fill(null), this._safeEnv = null;
          var t = arguments[0], e = arguments[1], s = arguments[2];
          if (this._originalPt = t, this._pt = t, this._scaleFactor = e, this._li = s, e <= 0) throw new X("Scale factor must be non-zero");
          e !== 1 && (this._pt = new U(this.scale(t.x), this.scale(t.y)), this._p0Scaled = new U(), this._p1Scaled = new U()), this.initCorners(this._pt);
        } }]);
      }();
      Js.SAFE_ENV_EXPANSION_FACTOR = 0.75;
      var nh = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "select", value: function() {
          if (arguments.length !== 1) {
            if (arguments.length === 2) {
              var o = arguments[1];
              arguments[0].getLineSegment(o, this.selectedSegment), this.select(this.selectedSegment);
            }
          }
        } }], [{ key: "constructor_", value: function() {
          this.selectedSegment = new Ee();
        } }]);
      }(), yo = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "snap", value: function() {
          if (arguments.length === 1) {
            var o = arguments[0];
            return this.snap(o, null, -1);
          }
          if (arguments.length === 3) {
            var t = arguments[0], e = arguments[1], s = arguments[2], l = t.getSafeEnvelope(), _ = new li(t, e, s);
            return this._index.query(l, new (function() {
              return g(function m() {
                f(this, m);
              }, [{ key: "interfaces_", get: function() {
                return [Fs];
              } }, { key: "visitItem", value: function(m) {
                m.select(l, _);
              } }]);
            }())()), _.isNodeAdded();
          }
        } }], [{ key: "constructor_", value: function() {
          this._index = null;
          var o = arguments[0];
          this._index = o;
        } }]);
      }(), li = function(o) {
        function t() {
          var e;
          return f(this, t), e = h(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, o), g(t, [{ key: "isNodeAdded", value: function() {
          return this._isNodeAdded;
        } }, { key: "select", value: function() {
          if (!(arguments.length === 2 && Number.isInteger(arguments[1]) && arguments[0] instanceof Tn)) return C(t, "select", this, 1).apply(this, arguments);
          var e = arguments[1], s = arguments[0].getContext();
          if (this._parentEdge === s && (e === this._hotPixelVertexIndex || e + 1 === this._hotPixelVertexIndex)) return null;
          this._isNodeAdded |= this._hotPixel.addSnappedNode(s, e);
        } }], [{ key: "constructor_", value: function() {
          this._hotPixel = null, this._parentEdge = null, this._hotPixelVertexIndex = null, this._isNodeAdded = !1;
          var e = arguments[0], s = arguments[1], l = arguments[2];
          this._hotPixel = e, this._parentEdge = s, this._hotPixelVertexIndex = l;
        } }]);
      }(nh);
      yo.HotPixelSnapAction = li;
      var ln = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "processIntersections", value: function(o, t, e, s) {
          if (o === e && t === s) return null;
          var l = o.getCoordinates()[t], _ = o.getCoordinates()[t + 1], m = e.getCoordinates()[s], E = e.getCoordinates()[s + 1];
          if (this._li.computeIntersection(l, _, m, E), this._li.hasIntersection() && this._li.isInteriorIntersection()) {
            for (var N = 0; N < this._li.getIntersectionNum(); N++) this._interiorIntersections.add(this._li.getIntersection(N));
            o.addIntersections(this._li, t, 0), e.addIntersections(this._li, s, 1);
          }
        } }, { key: "isDone", value: function() {
          return !1;
        } }, { key: "getInteriorIntersections", value: function() {
          return this._interiorIntersections;
        } }, { key: "interfaces_", get: function() {
          return [Zs];
        } }], [{ key: "constructor_", value: function() {
          this._li = null, this._interiorIntersections = null;
          var o = arguments[0];
          this._li = o, this._interiorIntersections = new mt();
        } }]);
      }(), po = function() {
        return g(function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }, [{ key: "checkCorrectness", value: function(o) {
          var t = mn.getNodedSubstrings(o), e = new nr(t);
          try {
            e.checkValid();
          } catch (s) {
            if (!(s instanceof W)) throw s;
            s.printStackTrace();
          }
        } }, { key: "getNodedSubstrings", value: function() {
          return mn.getNodedSubstrings(this._nodedSegStrings);
        } }, { key: "snapRound", value: function(o, t) {
          var e = this.findInteriorIntersections(o, t);
          this.computeIntersectionSnaps(e), this.computeVertexSnaps(o);
        } }, { key: "findInteriorIntersections", value: function(o, t) {
          var e = new ln(t);
          return this._noder.setSegmentIntersector(e), this._noder.computeNodes(o), e.getInteriorIntersections();
        } }, { key: "computeVertexSnaps", value: function() {
          if (wt(arguments[0], nn)) for (var o = arguments[0].iterator(); o.hasNext(); ) {
            var t = o.next();
            this.computeVertexSnaps(t);
          }
          else if (arguments[0] instanceof mn) for (var e = arguments[0], s = e.getCoordinates(), l = 0; l < s.length; l++) {
            var _ = new Js(s[l], this._scaleFactor, this._li);
            this._pointSnapper.snap(_, e, l) && e.addIntersection(s[l], l);
          }
        } }, { key: "computeNodes", value: function(o) {
          this._nodedSegStrings = o, this._noder = new zs(), this._pointSnapper = new yo(this._noder.getIndex()), this.snapRound(o, this._li);
        } }, { key: "computeIntersectionSnaps", value: function(o) {
          for (var t = o.iterator(); t.hasNext(); ) {
            var e = t.next(), s = new Js(e, this._scaleFactor, this._li);
            this._pointSnapper.snap(s);
          }
        } }, { key: "interfaces_", get: function() {
          return [Us];
        } }], [{ key: "constructor_", value: function() {
          this._pm = null, this._li = null, this._scaleFactor = null, this._noder = null, this._pointSnapper = null, this._nodedSegStrings = null;
          var o = arguments[0];
          this._pm = o, this._li = new qn(), this._li.setPrecisionModel(o), this._scaleFactor = o.getScale();
        } }]);
      }(), bi = function() {
        function o() {
          f(this, o), o.constructor_.apply(this, arguments);
        }
        return g(o, [{ key: "bufferFixedPrecision", value: function(t) {
          var e = new Un(new po(new ze(1)), t.getScale()), s = new Ks(this._bufParams);
          s.setWorkingPrecisionModel(t), s.setNoder(e), this._resultGeometry = s.buffer(this._argGeom, this._distance);
        } }, { key: "bufferReducedPrecision", value: function() {
          if (arguments.length === 0) {
            for (var t = o.MAX_PRECISION_DIGITS; t >= 0; t--) {
              try {
                this.bufferReducedPrecision(t);
              } catch (_) {
                if (!(_ instanceof an)) throw _;
                this._saveException = _;
              }
              if (this._resultGeometry !== null) return null;
            }
            throw this._saveException;
          }
          if (arguments.length === 1) {
            var e = arguments[0], s = o.precisionScaleFactor(this._argGeom, this._distance, e), l = new ze(s);
            this.bufferFixedPrecision(l);
          }
        } }, { key: "computeGeometry", value: function() {
          if (this.bufferOriginalPrecision(), this._resultGeometry !== null) return null;
          var t = this._argGeom.getFactory().getPrecisionModel();
          t.getType() === ze.FIXED ? this.bufferFixedPrecision(t) : this.bufferReducedPrecision();
        } }, { key: "setQuadrantSegments", value: function(t) {
          this._bufParams.setQuadrantSegments(t);
        } }, { key: "bufferOriginalPrecision", value: function() {
          try {
            var t = new Ks(this._bufParams);
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
          if (this._argGeom = null, this._distance = null, this._bufParams = new Y(), this._resultGeometry = null, this._saveException = null, arguments.length === 1) {
            var t = arguments[0];
            this._argGeom = t;
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            this._argGeom = e, this._bufParams = s;
          }
        } }, { key: "bufferOp", value: function() {
          if (arguments.length === 2) {
            var t = arguments[1];
            return new o(arguments[0]).getResultGeometry(t);
          }
          if (arguments.length === 3) {
            if (Number.isInteger(arguments[2]) && arguments[0] instanceof ft && typeof arguments[1] == "number") {
              var e = arguments[1], s = arguments[2], l = new o(arguments[0]);
              return l.setQuadrantSegments(s), l.getResultGeometry(e);
            }
            if (arguments[2] instanceof Y && arguments[0] instanceof ft && typeof arguments[1] == "number") {
              var _ = arguments[1];
              return new o(arguments[0], arguments[2]).getResultGeometry(_);
            }
          } else if (arguments.length === 4) {
            var m = arguments[1], E = arguments[2], N = arguments[3], R = new o(arguments[0]);
            return R.setQuadrantSegments(E), R.setEndCapStyle(N), R.getResultGeometry(m);
          }
        } }, { key: "precisionScaleFactor", value: function(t, e, s) {
          var l = t.getEnvelopeInternal(), _ = Zi.max(Math.abs(l.getMaxX()), Math.abs(l.getMaxY()), Math.abs(l.getMinX()), Math.abs(l.getMinY())) + 2 * (e > 0 ? e : 0), m = s - Math.trunc(Math.log(_) / Math.log(10) + 1);
          return Math.pow(10, m);
        } }]);
      }();
      bi.CAP_ROUND = Y.CAP_ROUND, bi.CAP_BUTT = Y.CAP_FLAT, bi.CAP_FLAT = Y.CAP_FLAT, bi.CAP_SQUARE = Y.CAP_SQUARE, bi.MAX_PRECISION_DIGITS = 12;
      var ih = ["Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"], Eo = function() {
        return g(function o(t) {
          f(this, o), this.geometryFactory = t || new ki();
        }, [{ key: "read", value: function(o) {
          var t, e = (t = typeof o == "string" ? JSON.parse(o) : o).type;
          if (!He[e]) throw new Error("Unknown GeoJSON type: " + t.type);
          return ih.indexOf(e) !== -1 ? He[e].call(this, t.coordinates) : e === "GeometryCollection" ? He[e].call(this, t.geometries) : He[e].call(this, t);
        } }, { key: "write", value: function(o) {
          var t = o.getGeometryType();
          if (!pn[t]) throw new Error("Geometry is not supported");
          return pn[t].call(this, o);
        } }]);
      }(), He = { Feature: function(o) {
        var t = {};
        for (var e in o) t[e] = o[e];
        if (o.geometry) {
          var s = o.geometry.type;
          if (!He[s]) throw new Error("Unknown GeoJSON type: " + o.type);
          t.geometry = this.read(o.geometry);
        }
        return o.bbox && (t.bbox = He.bbox.call(this, o.bbox)), t;
      }, FeatureCollection: function(o) {
        var t = {};
        if (o.features) {
          t.features = [];
          for (var e = 0; e < o.features.length; ++e) t.features.push(this.read(o.features[e]));
        }
        return o.bbox && (t.bbox = this.parse.bbox.call(this, o.bbox)), t;
      }, coordinates: function(o) {
        for (var t = [], e = 0; e < o.length; ++e) {
          var s = o[e];
          t.push(v(U, G(s)));
        }
        return t;
      }, bbox: function(o) {
        return this.geometryFactory.createLinearRing([new U(o[0], o[1]), new U(o[2], o[1]), new U(o[2], o[3]), new U(o[0], o[3]), new U(o[0], o[1])]);
      }, Point: function(o) {
        var t = v(U, G(o));
        return this.geometryFactory.createPoint(t);
      }, MultiPoint: function(o) {
        for (var t = [], e = 0; e < o.length; ++e) t.push(He.Point.call(this, o[e]));
        return this.geometryFactory.createMultiPoint(t);
      }, LineString: function(o) {
        var t = He.coordinates.call(this, o);
        return this.geometryFactory.createLineString(t);
      }, MultiLineString: function(o) {
        for (var t = [], e = 0; e < o.length; ++e) t.push(He.LineString.call(this, o[e]));
        return this.geometryFactory.createMultiLineString(t);
      }, Polygon: function(o) {
        for (var t = He.coordinates.call(this, o[0]), e = this.geometryFactory.createLinearRing(t), s = [], l = 1; l < o.length; ++l) {
          var _ = o[l], m = He.coordinates.call(this, _), E = this.geometryFactory.createLinearRing(m);
          s.push(E);
        }
        return this.geometryFactory.createPolygon(e, s);
      }, MultiPolygon: function(o) {
        for (var t = [], e = 0; e < o.length; ++e) {
          var s = o[e];
          t.push(He.Polygon.call(this, s));
        }
        return this.geometryFactory.createMultiPolygon(t);
      }, GeometryCollection: function(o) {
        for (var t = [], e = 0; e < o.length; ++e) {
          var s = o[e];
          t.push(this.read(s));
        }
        return this.geometryFactory.createGeometryCollection(t);
      } }, pn = { coordinate: function(o) {
        var t = [o.x, o.y];
        return o.z && t.push(o.z), o.m && t.push(o.m), t;
      }, Point: function(o) {
        return { type: "Point", coordinates: pn.coordinate.call(this, o.getCoordinate()) };
      }, MultiPoint: function(o) {
        for (var t = [], e = 0; e < o._geometries.length; ++e) {
          var s = o._geometries[e], l = pn.Point.call(this, s);
          t.push(l.coordinates);
        }
        return { type: "MultiPoint", coordinates: t };
      }, LineString: function(o) {
        for (var t = [], e = o.getCoordinates(), s = 0; s < e.length; ++s) {
          var l = e[s];
          t.push(pn.coordinate.call(this, l));
        }
        return { type: "LineString", coordinates: t };
      }, MultiLineString: function(o) {
        for (var t = [], e = 0; e < o._geometries.length; ++e) {
          var s = o._geometries[e], l = pn.LineString.call(this, s);
          t.push(l.coordinates);
        }
        return { type: "MultiLineString", coordinates: t };
      }, Polygon: function(o) {
        var t = [], e = pn.LineString.call(this, o._shell);
        t.push(e.coordinates);
        for (var s = 0; s < o._holes.length; ++s) {
          var l = o._holes[s], _ = pn.LineString.call(this, l);
          t.push(_.coordinates);
        }
        return { type: "Polygon", coordinates: t };
      }, MultiPolygon: function(o) {
        for (var t = [], e = 0; e < o._geometries.length; ++e) {
          var s = o._geometries[e], l = pn.Polygon.call(this, s);
          t.push(l.coordinates);
        }
        return { type: "MultiPolygon", coordinates: t };
      }, GeometryCollection: function(o) {
        for (var t = [], e = 0; e < o._geometries.length; ++e) {
          var s = o._geometries[e], l = s.getGeometryType();
          t.push(pn[l].call(this, s));
        }
        return { type: "GeometryCollection", geometries: t };
      } };
      return { BufferOp: bi, GeoJSONReader: function() {
        return g(function o(t) {
          f(this, o), this.parser = new Eo(t || new ki());
        }, [{ key: "read", value: function(o) {
          return this.parser.read(o);
        } }]);
      }(), GeoJSONWriter: function() {
        return g(function o() {
          f(this, o), this.parser = new Eo(this.geometryFactory);
        }, [{ key: "write", value: function(o) {
          return this.parser.write(o);
        } }]);
      }() };
    });
  }(mu)), mu.exports;
}
var O4 = L4();
const G4 = /* @__PURE__ */ R4(O4);
function $i() {
  return new Cu();
}
function Cu() {
  this.reset();
}
Cu.prototype = {
  constructor: Cu,
  reset: function() {
    this.s = // rounded value
    this.t = 0;
  },
  add: function(n) {
    og(au, n, this.t), og(this, au.s, this.s), this.s ? this.t += au.t : this.s = au.t;
  },
  valueOf: function() {
    return this.s;
  }
};
var au = new Cu();
function og(n, i, a) {
  var h = n.s = i + a, f = h - i, v = h - f;
  n.t = i - v + (a - f);
}
var Jt = 1e-6, qt = Math.PI, Kn = qt / 2, ug = qt / 4, Qn = qt * 2, Gi = 180 / qt, kn = qt / 180, ye = Math.abs, D4 = Math.atan, hs = Math.atan2, te = Math.cos, ee = Math.sin, vs = Math.sqrt;
function e0(n) {
  return n > 1 ? 0 : n < -1 ? qt : Math.acos(n);
}
function Er(n) {
  return n > 1 ? Kn : n < -1 ? -Kn : Math.asin(n);
}
function Ea() {
}
function bu(n, i) {
  n && lg.hasOwnProperty(n.type) && lg[n.type](n, i);
}
var hg = {
  Feature: function(n, i) {
    bu(n.geometry, i);
  },
  FeatureCollection: function(n, i) {
    for (var a = n.features, h = -1, f = a.length; ++h < f; ) bu(a[h].geometry, i);
  }
}, lg = {
  Sphere: function(n, i) {
    i.sphere();
  },
  Point: function(n, i) {
    n = n.coordinates, i.point(n[0], n[1], n[2]);
  },
  MultiPoint: function(n, i) {
    for (var a = n.coordinates, h = -1, f = a.length; ++h < f; ) n = a[h], i.point(n[0], n[1], n[2]);
  },
  LineString: function(n, i) {
    _l(n.coordinates, i, 0);
  },
  MultiLineString: function(n, i) {
    for (var a = n.coordinates, h = -1, f = a.length; ++h < f; ) _l(a[h], i, 0);
  },
  Polygon: function(n, i) {
    fg(n.coordinates, i);
  },
  MultiPolygon: function(n, i) {
    for (var a = n.coordinates, h = -1, f = a.length; ++h < f; ) fg(a[h], i);
  },
  GeometryCollection: function(n, i) {
    for (var a = n.geometries, h = -1, f = a.length; ++h < f; ) bu(a[h], i);
  }
};
function _l(n, i, a) {
  var h = -1, f = n.length - a, v;
  for (i.lineStart(); ++h < f; ) v = n[h], i.point(v[0], v[1], v[2]);
  i.lineEnd();
}
function fg(n, i) {
  var a = -1, h = n.length;
  for (i.polygonStart(); ++a < h; ) _l(n[a], i, 1);
  i.polygonEnd();
}
function F4(n, i) {
  n && hg.hasOwnProperty(n.type) ? hg[n.type](n, i) : bu(n, i);
}
$i();
$i();
function dl(n) {
  return [hs(n[1], n[0]), Er(n[2])];
}
function ls(n) {
  var i = n[0], a = n[1], h = te(a);
  return [h * te(i), h * ee(i), ee(a)];
}
function ou(n, i) {
  return n[0] * i[0] + n[1] * i[1] + n[2] * i[2];
}
function Ru(n, i) {
  return [n[1] * i[2] - n[2] * i[1], n[2] * i[0] - n[0] * i[2], n[0] * i[1] - n[1] * i[0]];
}
function sl(n, i) {
  n[0] += i[0], n[1] += i[1], n[2] += i[2];
}
function uu(n, i) {
  return [n[0] * i, n[1] * i, n[2] * i];
}
function ml(n) {
  var i = vs(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
  n[0] /= i, n[1] /= i, n[2] /= i;
}
$i();
function n0(n, i) {
  function a(h, f) {
    return h = n(h, f), i(h[0], h[1]);
  }
  return n.invert && i.invert && (a.invert = function(h, f) {
    return h = i.invert(h, f), h && n.invert(h[0], h[1]);
  }), a;
}
function yl(n, i) {
  return [n > qt ? n - Qn : n < -qt ? n + Qn : n, i];
}
yl.invert = yl;
function q4(n, i, a) {
  return (n %= Qn) ? i || a ? n0(gg(n), vg(i, a)) : gg(n) : i || a ? vg(i, a) : yl;
}
function cg(n) {
  return function(i, a) {
    return i += n, [i > qt ? i - Qn : i < -qt ? i + Qn : i, a];
  };
}
function gg(n) {
  var i = cg(n);
  return i.invert = cg(-n), i;
}
function vg(n, i) {
  var a = te(n), h = ee(n), f = te(i), v = ee(i);
  function d(g, p) {
    var M = te(p), S = te(g) * M, x = ee(g) * M, w = ee(p), b = w * a + S * h;
    return [
      hs(x * f - b * v, S * a - w * h),
      Er(b * f + x * v)
    ];
  }
  return d.invert = function(g, p) {
    var M = te(p), S = te(g) * M, x = ee(g) * M, w = ee(p), b = w * f - x * v;
    return [
      hs(x * f + w * v, S * a + b * h),
      Er(b * a - S * h)
    ];
  }, d;
}
function B4(n, i, a, h, f, v) {
  if (a) {
    var d = te(i), g = ee(i), p = h * a;
    f == null ? (f = i + h * Qn, v = i - p / 2) : (f = _g(d, f), v = _g(d, v), (h > 0 ? f < v : f > v) && (f += h * Qn));
    for (var M, S = f; h > 0 ? S > v : S < v; S -= p)
      M = dl([d, -g * te(S), -g * ee(S)]), n.point(M[0], M[1]);
  }
}
function _g(n, i) {
  i = ls(i), i[0] -= n, ml(i);
  var a = e0(-i[1]);
  return ((-i[2] < 0 ? -a : a) + Qn - Jt) % Qn;
}
function i0() {
  var n = [], i;
  return {
    point: function(a, h) {
      i.push([a, h]);
    },
    lineStart: function() {
      n.push(i = []);
    },
    lineEnd: Ea,
    rejoin: function() {
      n.length > 1 && n.push(n.pop().concat(n.shift()));
    },
    result: function() {
      var a = n;
      return n = [], i = null, a;
    }
  };
}
function U4(n, i, a, h, f, v) {
  var d = n[0], g = n[1], p = i[0], M = i[1], S = 0, x = 1, w = p - d, b = M - g, C;
  if (C = a - d, !(!w && C > 0)) {
    if (C /= w, w < 0) {
      if (C < S) return;
      C < x && (x = C);
    } else if (w > 0) {
      if (C > x) return;
      C > S && (S = C);
    }
    if (C = f - d, !(!w && C < 0)) {
      if (C /= w, w < 0) {
        if (C > x) return;
        C > S && (S = C);
      } else if (w > 0) {
        if (C < S) return;
        C < x && (x = C);
      }
      if (C = h - g, !(!b && C > 0)) {
        if (C /= b, b < 0) {
          if (C < S) return;
          C < x && (x = C);
        } else if (b > 0) {
          if (C > x) return;
          C > S && (S = C);
        }
        if (C = v - g, !(!b && C < 0)) {
          if (C /= b, b < 0) {
            if (C > x) return;
            C > S && (S = C);
          } else if (b > 0) {
            if (C < S) return;
            C < x && (x = C);
          }
          return S > 0 && (n[0] = d + S * w, n[1] = g + S * b), x < 1 && (i[0] = d + x * w, i[1] = g + x * b), !0;
        }
      }
    }
  }
}
function yu(n, i) {
  return ye(n[0] - i[0]) < Jt && ye(n[1] - i[1]) < Jt;
}
function hu(n, i, a, h) {
  this.x = n, this.z = i, this.o = a, this.e = h, this.v = !1, this.n = this.p = null;
}
function r0(n, i, a, h, f) {
  var v = [], d = [], g, p;
  if (n.forEach(function(C) {
    if (!((G = C.length - 1) <= 0)) {
      var G, O = C[0], B = C[G], z;
      if (yu(O, B)) {
        for (f.lineStart(), g = 0; g < G; ++g) f.point((O = C[g])[0], O[1]);
        f.lineEnd();
        return;
      }
      v.push(z = new hu(O, C, null, !0)), d.push(z.o = new hu(O, null, z, !1)), v.push(z = new hu(B, C, null, !1)), d.push(z.o = new hu(B, null, z, !0));
    }
  }), !!v.length) {
    for (d.sort(i), dg(v), dg(d), g = 0, p = d.length; g < p; ++g)
      d[g].e = a = !a;
    for (var M = v[0], S, x; ; ) {
      for (var w = M, b = !0; w.v; ) if ((w = w.n) === M) return;
      S = w.z, f.lineStart();
      do {
        if (w.v = w.o.v = !0, w.e) {
          if (b)
            for (g = 0, p = S.length; g < p; ++g) f.point((x = S[g])[0], x[1]);
          else
            h(w.x, w.n.x, 1, f);
          w = w.n;
        } else {
          if (b)
            for (S = w.p.z, g = S.length - 1; g >= 0; --g) f.point((x = S[g])[0], x[1]);
          else
            h(w.x, w.p.x, -1, f);
          w = w.p;
        }
        w = w.o, S = w.z, b = !b;
      } while (!w.v);
      f.lineEnd();
    }
  }
}
function dg(n) {
  if (i = n.length) {
    for (var i, a = 0, h = n[0], f; ++a < i; )
      h.n = f = n[a], f.p = h, h = f;
    h.n = f = n[0], f.p = h;
  }
}
function s0(n, i) {
  return n < i ? -1 : n > i ? 1 : n >= i ? 0 : NaN;
}
function z4(n) {
  return n.length === 1 && (n = Y4(n)), {
    left: function(i, a, h, f) {
      for (h == null && (h = 0), f == null && (f = i.length); h < f; ) {
        var v = h + f >>> 1;
        n(i[v], a) < 0 ? h = v + 1 : f = v;
      }
      return h;
    },
    right: function(i, a, h, f) {
      for (h == null && (h = 0), f == null && (f = i.length); h < f; ) {
        var v = h + f >>> 1;
        n(i[v], a) > 0 ? f = v : h = v + 1;
      }
      return h;
    }
  };
}
function Y4(n) {
  return function(i, a) {
    return s0(n(i), a);
  };
}
z4(s0);
function a0(n) {
  for (var i = n.length, a, h = -1, f = 0, v, d; ++h < i; ) f += n[h].length;
  for (v = new Array(f); --i >= 0; )
    for (d = n[i], a = d.length; --a >= 0; )
      v[--f] = d[a];
  return v;
}
var xa = 1e9, lu = -xa;
function X4(n, i, a, h) {
  function f(M, S) {
    return n <= M && M <= a && i <= S && S <= h;
  }
  function v(M, S, x, w) {
    var b = 0, C = 0;
    if (M == null || (b = d(M, x)) !== (C = d(S, x)) || p(M, S) < 0 ^ x > 0)
      do
        w.point(b === 0 || b === 3 ? n : a, b > 1 ? h : i);
      while ((b = (b + x + 4) % 4) !== C);
    else
      w.point(S[0], S[1]);
  }
  function d(M, S) {
    return ye(M[0] - n) < Jt ? S > 0 ? 0 : 3 : ye(M[0] - a) < Jt ? S > 0 ? 2 : 1 : ye(M[1] - i) < Jt ? S > 0 ? 1 : 0 : S > 0 ? 3 : 2;
  }
  function g(M, S) {
    return p(M.x, S.x);
  }
  function p(M, S) {
    var x = d(M, 1), w = d(S, 1);
    return x !== w ? x - w : x === 0 ? S[1] - M[1] : x === 1 ? M[0] - S[0] : x === 2 ? M[1] - S[1] : S[0] - M[0];
  }
  return function(M) {
    var S = M, x = i0(), w, b, C, G, O, B, z, Y, W, X, V, K = {
      point: et,
      lineStart: Mt,
      lineEnd: kt,
      polygonStart: vt,
      polygonEnd: _t
    };
    function et(St, Gt) {
      f(St, Gt) && S.point(St, Gt);
    }
    function j() {
      for (var St = 0, Gt = 0, Dt = b.length; Gt < Dt; ++Gt)
        for (var $t = b[Gt], he = 1, ht = $t.length, Zt = $t[0], le, Me, Nt = Zt[0], we = Zt[1]; he < ht; ++he)
          le = Nt, Me = we, Zt = $t[he], Nt = Zt[0], we = Zt[1], Me <= h ? we > h && (Nt - le) * (h - Me) > (we - Me) * (n - le) && ++St : we <= h && (Nt - le) * (h - Me) < (we - Me) * (n - le) && --St;
      return St;
    }
    function vt() {
      S = x, w = [], b = [], V = !0;
    }
    function _t() {
      var St = j(), Gt = V && St, Dt = (w = a0(w)).length;
      (Gt || Dt) && (M.polygonStart(), Gt && (M.lineStart(), v(null, null, 1, M), M.lineEnd()), Dt && r0(w, g, St, v, M), M.polygonEnd()), S = M, w = b = C = null;
    }
    function Mt() {
      K.point = it, b && b.push(C = []), X = !0, W = !1, z = Y = NaN;
    }
    function kt() {
      w && (it(G, O), B && W && x.rejoin(), w.push(x.result())), K.point = et, W && S.lineEnd();
    }
    function it(St, Gt) {
      var Dt = f(St, Gt);
      if (b && C.push([St, Gt]), X)
        G = St, O = Gt, B = Dt, X = !1, Dt && (S.lineStart(), S.point(St, Gt));
      else if (Dt && W) S.point(St, Gt);
      else {
        var $t = [z = Math.max(lu, Math.min(xa, z)), Y = Math.max(lu, Math.min(xa, Y))], he = [St = Math.max(lu, Math.min(xa, St)), Gt = Math.max(lu, Math.min(xa, Gt))];
        U4($t, he, n, i, a, h) ? (W || (S.lineStart(), S.point($t[0], $t[1])), S.point(he[0], he[1]), Dt || S.lineEnd(), V = !1) : Dt && (S.lineStart(), S.point(St, Gt), V = !1);
      }
      z = St, Y = Gt, W = Dt;
    }
    return K;
  };
}
var al = $i();
function W4(n, i) {
  var a = i[0], h = i[1], f = [ee(a), -te(a), 0], v = 0, d = 0;
  al.reset();
  for (var g = 0, p = n.length; g < p; ++g)
    if (S = (M = n[g]).length)
      for (var M, S, x = M[S - 1], w = x[0], b = x[1] / 2 + ug, C = ee(b), G = te(b), O = 0; O < S; ++O, w = z, C = W, G = X, x = B) {
        var B = M[O], z = B[0], Y = B[1] / 2 + ug, W = ee(Y), X = te(Y), V = z - w, K = V >= 0 ? 1 : -1, et = K * V, j = et > qt, vt = C * W;
        if (al.add(hs(vt * K * ee(et), G * X + vt * te(et))), v += j ? V + K * Qn : V, j ^ w >= a ^ z >= a) {
          var _t = Ru(ls(x), ls(B));
          ml(_t);
          var Mt = Ru(f, _t);
          ml(Mt);
          var kt = (j ^ V >= 0 ? -1 : 1) * Er(Mt[2]);
          (h > kt || h === kt && (_t[0] || _t[1])) && (d += j ^ V >= 0 ? 1 : -1);
        }
      }
  return (v < -Jt || v < Jt && al < -Jt) ^ d & 1;
}
$i();
function mg(n) {
  return n;
}
$i();
$i();
var fs = 1 / 0, Tu = fs, Ta = -fs, Au = Ta, yg = {
  point: $4,
  lineStart: Ea,
  lineEnd: Ea,
  polygonStart: Ea,
  polygonEnd: Ea,
  result: function() {
    var n = [[fs, Tu], [Ta, Au]];
    return Ta = Au = -(Tu = fs = 1 / 0), n;
  }
};
function $4(n, i) {
  n < fs && (fs = n), n > Ta && (Ta = n), i < Tu && (Tu = i), i > Au && (Au = i);
}
$i();
function o0(n, i, a, h) {
  return function(f, v) {
    var d = i(v), g = f.invert(h[0], h[1]), p = i0(), M = i(p), S = !1, x, w, b, C = {
      point: G,
      lineStart: B,
      lineEnd: z,
      polygonStart: function() {
        C.point = Y, C.lineStart = W, C.lineEnd = X, w = [], x = [];
      },
      polygonEnd: function() {
        C.point = G, C.lineStart = B, C.lineEnd = z, w = a0(w);
        var V = W4(x, g);
        w.length ? (S || (v.polygonStart(), S = !0), r0(w, V4, V, a, v)) : V && (S || (v.polygonStart(), S = !0), v.lineStart(), a(null, null, 1, v), v.lineEnd()), S && (v.polygonEnd(), S = !1), w = x = null;
      },
      sphere: function() {
        v.polygonStart(), v.lineStart(), a(null, null, 1, v), v.lineEnd(), v.polygonEnd();
      }
    };
    function G(V, K) {
      var et = f(V, K);
      n(V = et[0], K = et[1]) && v.point(V, K);
    }
    function O(V, K) {
      var et = f(V, K);
      d.point(et[0], et[1]);
    }
    function B() {
      C.point = O, d.lineStart();
    }
    function z() {
      C.point = G, d.lineEnd();
    }
    function Y(V, K) {
      b.push([V, K]);
      var et = f(V, K);
      M.point(et[0], et[1]);
    }
    function W() {
      M.lineStart(), b = [];
    }
    function X() {
      Y(b[0][0], b[0][1]), M.lineEnd();
      var V = M.clean(), K = p.result(), et, j = K.length, vt, _t, Mt;
      if (b.pop(), x.push(b), b = null, !!j) {
        if (V & 1) {
          if (_t = K[0], (vt = _t.length - 1) > 0) {
            for (S || (v.polygonStart(), S = !0), v.lineStart(), et = 0; et < vt; ++et) v.point((Mt = _t[et])[0], Mt[1]);
            v.lineEnd();
          }
          return;
        }
        j > 1 && V & 2 && K.push(K.pop().concat(K.shift())), w.push(K.filter(H4));
      }
    }
    return C;
  };
}
function H4(n) {
  return n.length > 1;
}
function V4(n, i) {
  return ((n = n.x)[0] < 0 ? n[1] - Kn - Jt : Kn - n[1]) - ((i = i.x)[0] < 0 ? i[1] - Kn - Jt : Kn - i[1]);
}
const pg = o0(
  function() {
    return !0;
  },
  Z4,
  J4,
  [-qt, -Kn]
);
function Z4(n) {
  var i = NaN, a = NaN, h = NaN, f;
  return {
    lineStart: function() {
      n.lineStart(), f = 1;
    },
    point: function(v, d) {
      var g = v > 0 ? qt : -qt, p = ye(v - i);
      ye(p - qt) < Jt ? (n.point(i, a = (a + d) / 2 > 0 ? Kn : -Kn), n.point(h, a), n.lineEnd(), n.lineStart(), n.point(g, a), n.point(v, a), f = 0) : h !== g && p >= qt && (ye(i - h) < Jt && (i -= h * Jt), ye(v - g) < Jt && (v -= g * Jt), a = K4(i, a, v, d), n.point(h, a), n.lineEnd(), n.lineStart(), n.point(g, a), f = 0), n.point(i = v, a = d), h = g;
    },
    lineEnd: function() {
      n.lineEnd(), i = a = NaN;
    },
    clean: function() {
      return 2 - f;
    }
  };
}
function K4(n, i, a, h) {
  var f, v, d = ee(n - a);
  return ye(d) > Jt ? D4((ee(i) * (v = te(h)) * ee(a) - ee(h) * (f = te(i)) * ee(n)) / (f * v * d)) : (i + h) / 2;
}
function J4(n, i, a, h) {
  var f;
  if (n == null)
    f = a * Kn, h.point(-qt, f), h.point(0, f), h.point(qt, f), h.point(qt, 0), h.point(qt, -f), h.point(0, -f), h.point(-qt, -f), h.point(-qt, 0), h.point(-qt, f);
  else if (ye(n[0] - i[0]) > Jt) {
    var v = n[0] < i[0] ? qt : -qt;
    f = a * v / 2, h.point(-v, f), h.point(0, f), h.point(v, f);
  } else
    h.point(i[0], i[1]);
}
function Q4(n, i) {
  var a = te(n), h = a > 0, f = ye(a) > Jt;
  function v(S, x, w, b) {
    B4(b, n, i, w, S, x);
  }
  function d(S, x) {
    return te(S) * te(x) > a;
  }
  function g(S) {
    var x, w, b, C, G;
    return {
      lineStart: function() {
        C = b = !1, G = 1;
      },
      point: function(O, B) {
        var z = [O, B], Y, W = d(O, B), X = h ? W ? 0 : M(O, B) : W ? M(O + (O < 0 ? qt : -qt), B) : 0;
        if (!x && (C = b = W) && S.lineStart(), W !== b && (Y = p(x, z), (!Y || yu(x, Y) || yu(z, Y)) && (z[0] += Jt, z[1] += Jt, W = d(z[0], z[1]))), W !== b)
          G = 0, W ? (S.lineStart(), Y = p(z, x), S.point(Y[0], Y[1])) : (Y = p(x, z), S.point(Y[0], Y[1]), S.lineEnd()), x = Y;
        else if (f && x && h ^ W) {
          var V;
          !(X & w) && (V = p(z, x, !0)) && (G = 0, h ? (S.lineStart(), S.point(V[0][0], V[0][1]), S.point(V[1][0], V[1][1]), S.lineEnd()) : (S.point(V[1][0], V[1][1]), S.lineEnd(), S.lineStart(), S.point(V[0][0], V[0][1])));
        }
        W && (!x || !yu(x, z)) && S.point(z[0], z[1]), x = z, b = W, w = X;
      },
      lineEnd: function() {
        b && S.lineEnd(), x = null;
      },
      // Rejoin first and last segments if there were intersections and the first
      // and last points were visible.
      clean: function() {
        return G | (C && b) << 1;
      }
    };
  }
  function p(S, x, w) {
    var b = ls(S), C = ls(x), G = [1, 0, 0], O = Ru(b, C), B = ou(O, O), z = O[0], Y = B - z * z;
    if (!Y) return !w && S;
    var W = a * B / Y, X = -a * z / Y, V = Ru(G, O), K = uu(G, W), et = uu(O, X);
    sl(K, et);
    var j = V, vt = ou(K, j), _t = ou(j, j), Mt = vt * vt - _t * (ou(K, K) - 1);
    if (!(Mt < 0)) {
      var kt = vs(Mt), it = uu(j, (-vt - kt) / _t);
      if (sl(it, K), it = dl(it), !w) return it;
      var St = S[0], Gt = x[0], Dt = S[1], $t = x[1], he;
      Gt < St && (he = St, St = Gt, Gt = he);
      var ht = Gt - St, Zt = ye(ht - qt) < Jt, le = Zt || ht < Jt;
      if (!Zt && $t < Dt && (he = Dt, Dt = $t, $t = he), le ? Zt ? Dt + $t > 0 ^ it[1] < (ye(it[0] - St) < Jt ? Dt : $t) : Dt <= it[1] && it[1] <= $t : ht > qt ^ (St <= it[0] && it[0] <= Gt)) {
        var Me = uu(j, (-vt + kt) / _t);
        return sl(Me, K), [it, dl(Me)];
      }
    }
  }
  function M(S, x) {
    var w = h ? n : qt - n, b = 0;
    return S < -w ? b |= 1 : S > w && (b |= 2), x < -w ? b |= 4 : x > w && (b |= 8), b;
  }
  return o0(d, g, v, h ? [0, -n] : [-qt, n - qt]);
}
function u0(n) {
  return function(i) {
    var a = new pl();
    for (var h in n) a[h] = n[h];
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
function h0(n, i, a) {
  var h = i[1][0] - i[0][0], f = i[1][1] - i[0][1], v = n.clipExtent && n.clipExtent();
  n.scale(150).translate([0, 0]), v != null && n.clipExtent(null), F4(a, n.stream(yg));
  var d = yg.result(), g = Math.min(h / (d[1][0] - d[0][0]), f / (d[1][1] - d[0][1])), p = +i[0][0] + (h - g * (d[1][0] + d[0][0])) / 2, M = +i[0][1] + (f - g * (d[1][1] + d[0][1])) / 2;
  return v != null && n.clipExtent(v), n.scale(g * 150).translate([p, M]);
}
function j4(n, i, a) {
  return h0(n, [[0, 0], i], a);
}
var Eg = 16, tw = te(30 * kn);
function xg(n, i) {
  return +i ? nw(n, i) : ew(n);
}
function ew(n) {
  return u0({
    point: function(i, a) {
      i = n(i, a), this.stream.point(i[0], i[1]);
    }
  });
}
function nw(n, i) {
  function a(h, f, v, d, g, p, M, S, x, w, b, C, G, O) {
    var B = M - h, z = S - f, Y = B * B + z * z;
    if (Y > 4 * i && G--) {
      var W = d + w, X = g + b, V = p + C, K = vs(W * W + X * X + V * V), et = Er(V /= K), j = ye(ye(V) - 1) < Jt || ye(v - x) < Jt ? (v + x) / 2 : hs(X, W), vt = n(j, et), _t = vt[0], Mt = vt[1], kt = _t - h, it = Mt - f, St = z * kt - B * it;
      (St * St / Y > i || ye((B * kt + z * it) / Y - 0.5) > 0.3 || d * w + g * b + p * C < tw) && (a(h, f, v, d, g, p, _t, Mt, j, W /= K, X /= K, V, G, O), O.point(_t, Mt), a(_t, Mt, j, W, X, V, M, S, x, w, b, C, G, O));
    }
  }
  return function(h) {
    var f, v, d, g, p, M, S, x, w, b, C, G, O = {
      point: B,
      lineStart: z,
      lineEnd: W,
      polygonStart: function() {
        h.polygonStart(), O.lineStart = X;
      },
      polygonEnd: function() {
        h.polygonEnd(), O.lineStart = z;
      }
    };
    function B(et, j) {
      et = n(et, j), h.point(et[0], et[1]);
    }
    function z() {
      x = NaN, O.point = Y, h.lineStart();
    }
    function Y(et, j) {
      var vt = ls([et, j]), _t = n(et, j);
      a(x, w, S, b, C, G, x = _t[0], w = _t[1], S = et, b = vt[0], C = vt[1], G = vt[2], Eg, h), h.point(x, w);
    }
    function W() {
      O.point = B, h.lineEnd();
    }
    function X() {
      z(), O.point = V, O.lineEnd = K;
    }
    function V(et, j) {
      Y(f = et, j), v = x, d = w, g = b, p = C, M = G, O.point = Y;
    }
    function K() {
      a(x, w, S, b, C, G, v, d, f, g, p, M, Eg, h), O.lineEnd = W, W();
    }
    return O;
  };
}
var iw = u0({
  point: function(n, i) {
    this.stream.point(n * kn, i * kn);
  }
});
function rw(n) {
  return sw(function() {
    return n;
  })();
}
function sw(n) {
  var i, a = 150, h = 480, f = 250, v, d, g = 0, p = 0, M = 0, S = 0, x = 0, w, b, C = null, G = pg, O = null, B, z, Y, W = mg, X = 0.5, V = xg(_t, X), K, et;
  function j(it) {
    return it = b(it[0] * kn, it[1] * kn), [it[0] * a + v, d - it[1] * a];
  }
  function vt(it) {
    return it = b.invert((it[0] - v) / a, (d - it[1]) / a), it && [it[0] * Gi, it[1] * Gi];
  }
  function _t(it, St) {
    return it = i(it, St), [it[0] * a + v, d - it[1] * a];
  }
  j.stream = function(it) {
    return K && et === it ? K : K = iw(G(w, V(W(et = it))));
  }, j.clipAngle = function(it) {
    return arguments.length ? (G = +it ? Q4(C = it * kn, 6 * kn) : (C = null, pg), kt()) : C * Gi;
  }, j.clipExtent = function(it) {
    return arguments.length ? (W = it == null ? (O = B = z = Y = null, mg) : X4(O = +it[0][0], B = +it[0][1], z = +it[1][0], Y = +it[1][1]), kt()) : O == null ? null : [[O, B], [z, Y]];
  }, j.scale = function(it) {
    return arguments.length ? (a = +it, Mt()) : a;
  }, j.translate = function(it) {
    return arguments.length ? (h = +it[0], f = +it[1], Mt()) : [h, f];
  }, j.center = function(it) {
    return arguments.length ? (g = it[0] % 360 * kn, p = it[1] % 360 * kn, Mt()) : [g * Gi, p * Gi];
  }, j.rotate = function(it) {
    return arguments.length ? (M = it[0] % 360 * kn, S = it[1] % 360 * kn, x = it.length > 2 ? it[2] % 360 * kn : 0, Mt()) : [M * Gi, S * Gi, x * Gi];
  }, j.precision = function(it) {
    return arguments.length ? (V = xg(_t, X = it * it), kt()) : vs(X);
  }, j.fitExtent = function(it, St) {
    return h0(j, it, St);
  }, j.fitSize = function(it, St) {
    return j4(j, it, St);
  };
  function Mt() {
    b = n0(w = q4(M, S, x), i);
    var it = i(g, p);
    return v = h - it[0] * a, d = f + it[1] * a, kt();
  }
  function kt() {
    return K = et = null, j;
  }
  return function() {
    return i = n.apply(this, arguments), j.invert = i.invert && vt, Mt();
  };
}
function l0(n) {
  return function(i, a) {
    var h = te(i), f = te(a), v = n(h * f);
    return [
      v * f * ee(i),
      v * ee(a)
    ];
  };
}
function f0(n) {
  return function(i, a) {
    var h = vs(i * i + a * a), f = n(h), v = ee(f), d = te(f);
    return [
      hs(i * v, h * d),
      Er(h && a * v / h)
    ];
  };
}
var aw = l0(function(n) {
  return vs(2 / (1 + n));
});
aw.invert = f0(function(n) {
  return 2 * Er(n / 2);
});
var c0 = l0(function(n) {
  return (n = e0(n)) && n / ee(n);
});
c0.invert = f0(function(n) {
  return n;
});
function ow() {
  return rw(c0).scale(79.4188).clipAngle(180 - 1e-3);
}
function Mg(n, i) {
  return [n, i];
}
Mg.invert = Mg;
var { BufferOp: uw, GeoJSONReader: hw, GeoJSONWriter: lw } = G4;
function fw(n, i, a) {
  a = a || {};
  var h = a.units || "kilometers", f = a.steps || 8;
  if (!n) throw new Error("geojson is required");
  if (typeof a != "object") throw new Error("options must be an object");
  if (typeof f != "number") throw new Error("steps must be an number");
  if (i === void 0) throw new Error("radius is required");
  if (f <= 0) throw new Error("steps must be greater than 0");
  var v = [];
  switch (n.type) {
    case "GeometryCollection":
      return Ll(n, function(d) {
        var g = pu(d, i, h, f);
        g && v.push(g);
      }), tn(v);
    case "FeatureCollection":
      return us(n, function(d) {
        var g = pu(d, i, h, f);
        g && us(g, function(p) {
          p && v.push(p);
        });
      }), tn(v);
  }
  return pu(n, i, h, f);
}
function pu(n, i, a, h) {
  var f = n.properties || {}, v = n.type === "Feature" ? n.geometry : n;
  if (v.type === "GeometryCollection") {
    var d = [];
    return Ll(n, function(G) {
      var O = pu(G, i, a, h);
      O && d.push(O);
    }), tn(d);
  }
  var g = cw(v), p = {
    type: v.type,
    coordinates: v0(v.coordinates, g)
  }, M = new hw(), S = M.read(p), x = Kg(UM(i, a), "meters"), w = uw.bufferOp(S, x, h), b = new lw();
  if (w = b.write(w), !g0(w.coordinates)) {
    var C = {
      type: w.type,
      coordinates: _0(w.coordinates, g)
    };
    return Xi(C, f);
  }
}
function g0(n) {
  return Array.isArray(n[0]) ? g0(n[0]) : isNaN(n[0]);
}
function v0(n, i) {
  return typeof n[0] != "object" ? i(n) : n.map(function(a) {
    return v0(a, i);
  });
}
function _0(n, i) {
  return typeof n[0] != "object" ? i.invert(n) : n.map(function(a) {
    return _0(a, i);
  });
}
function cw(n) {
  var i = T4(n).geometry.coordinates, a = [-i[0], -i[1]];
  return ow().rotate(a).scale(De);
}
function gw(n) {
  var i = n[0], a = n[1], h = n[2], f = n[3], v = Hn(n.slice(0, 2), [h, a]), d = Hn(n.slice(0, 2), [i, f]);
  if (v >= d) {
    var g = (a + f) / 2;
    return [
      i,
      g - (h - i) / 2,
      h,
      g + (h - i) / 2
    ];
  } else {
    var p = (i + h) / 2;
    return [
      p - (f - a) / 2,
      a,
      p + (f - a) / 2,
      f
    ];
  }
}
function vw(n, i) {
  if (i = i ?? {}, !zM(i)) throw new Error("options is invalid");
  var a = i.precision, h = i.coordinates, f = i.mutate;
  if (a = a == null || isNaN(a) ? 6 : a, h = h == null || isNaN(h) ? 3 : h, !n) throw new Error("<geojson> is required");
  if (typeof a != "number")
    throw new Error("<precision> must be a number");
  if (typeof h != "number")
    throw new Error("<coordinates> must be a number");
  (f === !1 || f === void 0) && (n = JSON.parse(JSON.stringify(n)));
  var v = Math.pow(10, a);
  return Al(n, function(d) {
    _w(d, v, h);
  }), n;
}
function _w(n, i, a) {
  n.length > a && n.splice(a, n.length);
  for (var h = 0; h < n.length; h++)
    n[h] = Math.round(n[h] * i) / i;
  return n;
}
function dw(n, i) {
  if (!n) throw new Error("line is required");
  if (!i) throw new Error("splitter is required");
  var a = Vc(n), h = Vc(i);
  if (a !== "LineString") throw new Error("line must be LineString");
  if (h === "FeatureCollection")
    throw new Error("splitter cannot be a FeatureCollection");
  if (h === "GeometryCollection")
    throw new Error("splitter cannot be a GeometryCollection");
  var f = vw(i, { precision: 7 });
  switch (h) {
    case "Point":
      return El(n, f);
    case "MultiPoint":
      return wg(n, f);
    case "LineString":
    case "MultiLineString":
    case "Polygon":
    case "MultiPolygon":
      return wg(
        n,
        l4(n, f, {
          ignoreSelfIntersections: !0
        })
      );
  }
}
function wg(n, i) {
  var a = [], h = t0();
  return Ol(i, function(f) {
    if (a.forEach(function(g, p) {
      g.id = p;
    }), !a.length)
      a = El(n, f).features, a.forEach(function(g) {
        g.bbox || (g.bbox = gw(xi(g)));
      }), h.load(tn(a));
    else {
      var v = h.search(f);
      if (v.features.length) {
        var d = d0(f, v);
        a = a.filter(function(g) {
          return g.id !== d.id;
        }), h.remove(d), us(El(d, f), function(g) {
          a.push(g), h.insert(g);
        });
      }
    }
  }), tn(a);
}
function El(n, i) {
  var a = [], h = as(n)[0], f = as(n)[n.geometry.coordinates.length - 1];
  if (ol(h, Zn(i)) || ol(f, Zn(i)))
    return tn([n]);
  var v = t0(), d = y4(n);
  v.load(d);
  var g = v.search(i);
  if (!g.features.length) return tn([n]);
  var p = d0(i, g), M = [h], S = XM(
    d,
    function(x, w, b) {
      var C = as(w)[1], G = Zn(i);
      return b === p.id ? (x.push(G), a.push(Pu(x)), ol(G, C) ? [G] : [G, C]) : (x.push(C), x);
    },
    M
  );
  return S.length > 1 && a.push(Pu(S)), tn(a);
}
function d0(n, i) {
  if (!i.features.length) throw new Error("lines must contain features");
  if (i.features.length === 1) return i.features[0];
  var a, h = 1 / 0;
  return us(i, function(f) {
    var v = k4(f, n), d = v.properties.dist;
    d < h && (a = f, h = d);
  }), a;
}
function ol(n, i) {
  return n[0] === i[0] && n[1] === i[1];
}
var Ma = { exports: {} };
var mw = Ma.exports, Sg;
function yw() {
  return Sg || (Sg = 1, function(n, i) {
    (function() {
      var a, h = "4.17.21", f = 200, v = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", d = "Expected a function", g = "Invalid `variable` option passed into `_.template`", p = "__lodash_hash_undefined__", M = 500, S = "__lodash_placeholder__", x = 1, w = 2, b = 4, C = 1, G = 2, O = 1, B = 2, z = 4, Y = 8, W = 16, X = 32, V = 64, K = 128, et = 256, j = 512, vt = 30, _t = "...", Mt = 800, kt = 16, it = 1, St = 2, Gt = 3, Dt = 1 / 0, $t = 9007199254740991, he = 17976931348623157e292, ht = NaN, Zt = 4294967295, le = Zt - 1, Me = Zt >>> 1, Nt = [
        ["ary", K],
        ["bind", O],
        ["bindKey", B],
        ["curry", Y],
        ["curryRight", W],
        ["flip", j],
        ["partial", X],
        ["partialRight", V],
        ["rearg", et]
      ], we = "[object Arguments]", xr = "[object Array]", Ua = "[object AsyncFunction]", U = "[object Boolean]", Hi = "[object Date]", Ht = "[object DOMException]", ft = "[object Error]", A = "[object Function]", nn = "[object GeneratorFunction]", Se = "[object Map]", qe = "[object Number]", za = "[object Null]", rn = "[object Object]", Ya = "[object Promise]", tt = "[object Proxy]", Si = "[object RegExp]", Be = "[object Set]", sn = "[object String]", Mr = "[object Symbol]", wt = "[object Undefined]", Cn = "[object WeakMap]", wr = "[object WeakSet]", jn = "[object ArrayBuffer]", dt = "[object DataView]", Vi = "[object Float32Array]", Tt = "[object Float64Array]", pt = "[object Int8Array]", _s = "[object Int16Array]", an = "[object Int32Array]", ds = "[object Uint8Array]", mt = "[object Uint8ClampedArray]", ms = "[object Uint16Array]", ys = "[object Uint32Array]", ps = /\b__p \+= '';/g, Ue = /\b(__p \+=) '' \+/g, Zi = /(__e\(.*?\)|\b__t\)) \+\n'';/g, on = /&(?:amp|lt|gt|quot|#39);/g, Es = /[&<>"']/g, Sr = RegExp(on.source), Gu = RegExp(Es.source), Xa = /<%-([\s\S]+?)%>/g, ti = /<%([\s\S]+?)%>/g, nt = /<%=([\s\S]+?)%>/g, Ir = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, Nr = /^\w*$/, Ki = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, kr = /[\\^$.*+?()[\]{}|]/g, xs = RegExp(kr.source), Pr = /^\s+/, ei = /\s/, Wa = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, Cr = /\{\n\/\* \[wrapped with (.+)\] \*/, Du = /,? & /, $a = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, Fu = /[()=,{}\[\]\/\s]/, be = /\\(\\)?/g, Ms = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, Ii = /\w*$/, ni = /^[-+]0x[0-9a-f]+$/i, ii = /^0b[01]+$/i, ws = /^\[object .+?Constructor\]$/, br = /^0o[0-7]+$/i, Ji = /^(?:0|[1-9]\d*)$/, re = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Rr = /($^)/, qu = /['\n\r\u2028\u2029\\]/g, ri = "\\ud800-\\udfff", Qi = "\\u0300-\\u036f", Ss = "\\ufe20-\\ufe2f", Is = "\\u20d0-\\u20ff", Ns = Qi + Ss + Is, Ha = "\\u2700-\\u27bf", ze = "a-z\\xdf-\\xf6\\xf8-\\xff", Ni = "\\xac\\xb1\\xd7\\xf7", ks = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", ki = "\\u2000-\\u206f", Ps = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", Va = "A-Z\\xc0-\\xd6\\xd8-\\xde", Za = "\\ufe0e\\ufe0f", Ka = Ni + ks + ki + Ps, Tr = "['’]", Ja = "[" + ri + "]", ji = "[" + Ka + "]", Ye = "[" + Ns + "]", bn = "\\d+", Qa = "[" + Ha + "]", si = "[" + ze + "]", ja = "[^" + ri + Ka + bn + Ha + ze + Va + "]", Cs = "\\ud83c[\\udffb-\\udfff]", Bu = "(?:" + Ye + "|" + Cs + ")", to = "[^" + ri + "]", Ar = "(?:\\ud83c[\\udde6-\\uddff]){2}", ai = "[\\ud800-\\udbff][\\udc00-\\udfff]", oi = "[" + Va + "]", eo = "\\u200d", bs = "(?:" + si + "|" + ja + ")", Uu = "(?:" + oi + "|" + ja + ")", Lr = "(?:" + Tr + "(?:d|ll|m|re|s|t|ve))?", Vt = "(?:" + Tr + "(?:D|LL|M|RE|S|T|VE))?", qn = Bu + "?", no = "[" + Za + "]?", Rs = "(?:" + eo + "(?:" + [to, Ar, ai].join("|") + ")" + no + qn + ")*", Xe = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", We = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", tr = no + qn + Rs, zu = "(?:" + [Qa, Ar, ai].join("|") + ")" + tr, Yu = "(?:" + [to + Ye + "?", Ye, Ar, ai, Ja].join("|") + ")", io = RegExp(Tr, "g"), Or = RegExp(Ye, "g"), Ts = RegExp(Cs + "(?=" + Cs + ")|" + Yu + tr, "g"), ro = RegExp([
        oi + "?" + si + "+" + Lr + "(?=" + [ji, oi, "$"].join("|") + ")",
        Uu + "+" + Vt + "(?=" + [ji, oi + bs, "$"].join("|") + ")",
        oi + "?" + bs + "+" + Lr,
        oi + "+" + Vt,
        We,
        Xe,
        bn,
        zu
      ].join("|"), "g"), Ft = RegExp("[" + eo + ri + Ns + Za + "]"), dn = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, As = [
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
      ], so = -1, Bt = {};
      Bt[Vi] = Bt[Tt] = Bt[pt] = Bt[_s] = Bt[an] = Bt[ds] = Bt[mt] = Bt[ms] = Bt[ys] = !0, Bt[we] = Bt[xr] = Bt[jn] = Bt[U] = Bt[dt] = Bt[Hi] = Bt[ft] = Bt[A] = Bt[Se] = Bt[qe] = Bt[rn] = Bt[Si] = Bt[Be] = Bt[sn] = Bt[Cn] = !1;
      var Xt = {};
      Xt[we] = Xt[xr] = Xt[jn] = Xt[dt] = Xt[U] = Xt[Hi] = Xt[Vi] = Xt[Tt] = Xt[pt] = Xt[_s] = Xt[an] = Xt[Se] = Xt[qe] = Xt[rn] = Xt[Si] = Xt[Be] = Xt[sn] = Xt[Mr] = Xt[ds] = Xt[mt] = Xt[ms] = Xt[ys] = !0, Xt[ft] = Xt[A] = Xt[Cn] = !1;
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
      }, ao = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }, Ls = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
      }, oo = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      }, uo = parseFloat, Xu = parseInt, Os = typeof su == "object" && su && su.Object === Object && su, Rn = typeof self == "object" && self && self.Object === Object && self, ne = Os || Rn || Function("return this")(), Gs = i && !i.nodeType && i, fe = Gs && !0 && n && !n.nodeType && n, ui = fe && fe.exports === Gs, Ds = ui && Os.process, ge = function() {
        try {
          var t = fe && fe.require && fe.require("util").types;
          return t || Ds && Ds.binding && Ds.binding("util");
        } catch {
        }
      }(), Fs = ge && ge.isArrayBuffer, hi = ge && ge.isDate, ho = ge && ge.isMap, un = ge && ge.isRegExp, qs = ge && ge.isSet, lo = ge && ge.isTypedArray;
      function Re(t, e, s) {
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
      function Wu(t, e, s, l) {
        for (var _ = -1, m = t == null ? 0 : t.length; ++_ < m; ) {
          var E = t[_];
          e(l, E, s(E), t);
        }
        return l;
      }
      function $e(t, e) {
        for (var s = -1, l = t == null ? 0 : t.length; ++s < l && e(t[s], s, t) !== !1; )
          ;
        return t;
      }
      function $u(t, e) {
        for (var s = t == null ? 0 : t.length; s-- && e(t[s], s, t) !== !1; )
          ;
        return t;
      }
      function fo(t, e) {
        for (var s = -1, l = t == null ? 0 : t.length; ++s < l; )
          if (!e(t[s], s, t))
            return !1;
        return !0;
      }
      function Bn(t, e) {
        for (var s = -1, l = t == null ? 0 : t.length, _ = 0, m = []; ++s < l; ) {
          var E = t[s];
          e(E, s, t) && (m[_++] = E);
        }
        return m;
      }
      function mn(t, e) {
        var s = t == null ? 0 : t.length;
        return !!s && yn(t, e, 0) > -1;
      }
      function Ee(t, e, s) {
        for (var l = -1, _ = t == null ? 0 : t.length; ++l < _; )
          if (s(e, t[l]))
            return !0;
        return !1;
      }
      function Kt(t, e) {
        for (var s = -1, l = t == null ? 0 : t.length, _ = Array(l); ++s < l; )
          _[s] = e(t[s], s, t);
        return _;
      }
      function Tn(t, e) {
        for (var s = -1, l = e.length, _ = t.length; ++s < l; )
          t[_ + s] = e[s];
        return t;
      }
      function Bs(t, e, s, l) {
        var _ = -1, m = t == null ? 0 : t.length;
        for (l && m && (s = t[++_]); ++_ < m; )
          s = e(s, t[_], _, t);
        return s;
      }
      function Us(t, e, s, l) {
        var _ = t == null ? 0 : t.length;
        for (l && _ && (s = t[--_]); _--; )
          s = e(s, t[_], _, t);
        return s;
      }
      function Gr(t, e) {
        for (var s = -1, l = t == null ? 0 : t.length; ++s < l; )
          if (e(t[s], s, t))
            return !0;
        return !1;
      }
      var zs = Dr("length");
      function co(t) {
        return t.split("");
      }
      function hn(t) {
        return t.match($a) || [];
      }
      function Ys(t, e, s) {
        var l;
        return s(t, function(_, m, E) {
          if (e(_, m, E))
            return l = m, !1;
        }), l;
      }
      function _e(t, e, s, l) {
        for (var _ = t.length, m = s + (l ? 1 : -1); l ? m-- : ++m < _; )
          if (e(t[m], m, t))
            return m;
        return -1;
      }
      function yn(t, e, s) {
        return e === e ? nh(t, e, s) : _e(t, Xs, s);
      }
      function Hu(t, e, s, l) {
        for (var _ = s - 1, m = t.length; ++_ < m; )
          if (l(t[_], e))
            return _;
        return -1;
      }
      function Xs(t) {
        return t !== t;
      }
      function Ws(t, e) {
        var s = t == null ? 0 : t.length;
        return s ? $s(t, e) / s : ht;
      }
      function Dr(t) {
        return function(e) {
          return e == null ? a : e[t];
        };
      }
      function er(t) {
        return function(e) {
          return t == null ? a : t[e];
        };
      }
      function go(t, e, s, l, _) {
        return _(t, function(m, E, N) {
          s = l ? (l = !1, m) : e(s, m, E, N);
        }), s;
      }
      function Vu(t, e) {
        var s = t.length;
        for (t.sort(e); s--; )
          t[s] = t[s].value;
        return t;
      }
      function $s(t, e) {
        for (var s, l = -1, _ = t.length; ++l < _; ) {
          var m = e(t[l]);
          m !== a && (s = s === a ? m : s + m);
        }
        return s;
      }
      function Hs(t, e) {
        for (var s = -1, l = Array(t); ++s < t; )
          l[s] = e(s);
        return l;
      }
      function Zu(t, e) {
        return Kt(e, function(s) {
          return [s, t[s]];
        });
      }
      function vo(t) {
        return t && t.slice(0, po(t) + 1).replace(Pr, "");
      }
      function Te(t) {
        return function(e) {
          return t(e);
        };
      }
      function Vs(t, e) {
        return Kt(e, function(s) {
          return t[s];
        });
      }
      function Pi(t, e) {
        return t.has(e);
      }
      function _o(t, e) {
        for (var s = -1, l = t.length; ++s < l && yn(e, t[s], 0) > -1; )
          ;
        return s;
      }
      function Zs(t, e) {
        for (var s = t.length; s-- && yn(e, t[s], 0) > -1; )
          ;
        return s;
      }
      function Ku(t, e) {
        for (var s = t.length, l = 0; s--; )
          t[s] === e && ++l;
        return l;
      }
      var Ju = er(pe), Qu = er(ao);
      function ju(t) {
        return "\\" + oo[t];
      }
      function th(t, e) {
        return t == null ? a : t[e];
      }
      function Ci(t) {
        return Ft.test(t);
      }
      function eh(t) {
        return dn.test(t);
      }
      function mo(t) {
        for (var e, s = []; !(e = t.next()).done; )
          s.push(e.value);
        return s;
      }
      function Fr(t) {
        var e = -1, s = Array(t.size);
        return t.forEach(function(l, _) {
          s[++e] = [_, l];
        }), s;
      }
      function Ks(t, e) {
        return function(s) {
          return t(e(s));
        };
      }
      function Un(t, e) {
        for (var s = -1, l = t.length, _ = 0, m = []; ++s < l; ) {
          var E = t[s];
          (E === e || E === S) && (t[s] = S, m[_++] = s);
        }
        return m;
      }
      function nr(t) {
        var e = -1, s = Array(t.size);
        return t.forEach(function(l) {
          s[++e] = l;
        }), s;
      }
      function Js(t) {
        var e = -1, s = Array(t.size);
        return t.forEach(function(l) {
          s[++e] = [l, l];
        }), s;
      }
      function nh(t, e, s) {
        for (var l = s - 1, _ = t.length; ++l < _; )
          if (t[l] === e)
            return l;
        return -1;
      }
      function yo(t, e, s) {
        for (var l = s + 1; l--; )
          if (t[l] === e)
            return l;
        return l;
      }
      function li(t) {
        return Ci(t) ? ih(t) : zs(t);
      }
      function ln(t) {
        return Ci(t) ? Eo(t) : co(t);
      }
      function po(t) {
        for (var e = t.length; e-- && ei.test(t.charAt(e)); )
          ;
        return e;
      }
      var bi = er(Ls);
      function ih(t) {
        for (var e = Ts.lastIndex = 0; Ts.test(t); )
          ++e;
        return e;
      }
      function Eo(t) {
        return t.match(Ts) || [];
      }
      function He(t) {
        return t.match(ro) || [];
      }
      var pn = function t(e) {
        e = e == null ? ne : o.defaults(ne.Object(), e, o.pick(ne, As));
        var s = e.Array, l = e.Date, _ = e.Error, m = e.Function, E = e.Math, N = e.Object, R = e.RegExp, D = e.String, q = e.TypeError, Z = s.prototype, st = m.prototype, ut = N.prototype, gt = e["__core-js_shared__"], bt = st.toString, lt = ut.hasOwnProperty, Wt = 0, ce = function() {
          var r = /[^.]+$/.exec(gt && gt.keys && gt.keys.IE_PROTO || "");
          return r ? "Symbol(src)_1." + r : "";
        }(), se = ut.toString, fi = bt.call(N), ir = ne._, xo = R(
          "^" + bt.call(lt).replace(kr, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), rr = ui ? e.Buffer : a, An = e.Symbol, sr = e.Uint8Array, Qs = rr ? rr.allocUnsafe : a, ar = Ks(N.getPrototypeOf, N), qr = N.create, Br = ut.propertyIsEnumerable, Mo = Z.splice, ql = An ? An.isConcatSpreadable : a, js = An ? An.iterator : a, or = An ? An.toStringTag : a, wo = function() {
          try {
            var r = cr(N, "defineProperty");
            return r({}, "", {}), r;
          } catch {
          }
        }(), b0 = e.clearTimeout !== ne.clearTimeout && e.clearTimeout, R0 = l && l.now !== ne.Date.now && l.now, T0 = e.setTimeout !== ne.setTimeout && e.setTimeout, So = E.ceil, Io = E.floor, rh = N.getOwnPropertySymbols, A0 = rr ? rr.isBuffer : a, Bl = e.isFinite, L0 = Z.join, O0 = Ks(N.keys, N), ve = E.max, Ie = E.min, G0 = l.now, D0 = e.parseInt, Ul = E.random, F0 = Z.reverse, sh = cr(e, "DataView"), ta = cr(e, "Map"), ah = cr(e, "Promise"), Ur = cr(e, "Set"), ea = cr(e, "WeakMap"), na = cr(N, "create"), No = ea && new ea(), zr = {}, q0 = gr(sh), B0 = gr(ta), U0 = gr(ah), z0 = gr(Ur), Y0 = gr(ea), ko = An ? An.prototype : a, ia = ko ? ko.valueOf : a, zl = ko ? ko.toString : a;
        function k(r) {
          if (ie(r) && !It(r) && !(r instanceof Lt)) {
            if (r instanceof En)
              return r;
            if (lt.call(r, "__wrapped__"))
              return Xf(r);
          }
          return new En(r);
        }
        var Yr = /* @__PURE__ */ function() {
          function r() {
          }
          return function(u) {
            if (!Qt(u))
              return {};
            if (qr)
              return qr(u);
            r.prototype = u;
            var c = new r();
            return r.prototype = a, c;
          };
        }();
        function Po() {
        }
        function En(r, u) {
          this.__wrapped__ = r, this.__actions__ = [], this.__chain__ = !!u, this.__index__ = 0, this.__values__ = a;
        }
        k.templateSettings = {
          /**
           * Used to detect `data` property values to be HTML-escaped.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          escape: Xa,
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          evaluate: ti,
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
            _: k
          }
        }, k.prototype = Po.prototype, k.prototype.constructor = k, En.prototype = Yr(Po.prototype), En.prototype.constructor = En;
        function Lt(r) {
          this.__wrapped__ = r, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = Zt, this.__views__ = [];
        }
        function X0() {
          var r = new Lt(this.__wrapped__);
          return r.__actions__ = Ve(this.__actions__), r.__dir__ = this.__dir__, r.__filtered__ = this.__filtered__, r.__iteratees__ = Ve(this.__iteratees__), r.__takeCount__ = this.__takeCount__, r.__views__ = Ve(this.__views__), r;
        }
        function W0() {
          if (this.__filtered__) {
            var r = new Lt(this);
            r.__dir__ = -1, r.__filtered__ = !0;
          } else
            r = this.clone(), r.__dir__ *= -1;
          return r;
        }
        function $0() {
          var r = this.__wrapped__.value(), u = this.__dir__, c = It(r), y = u < 0, I = c ? r.length : 0, P = r_(0, I, this.__views__), T = P.start, L = P.end, F = L - T, $ = y ? L : T - 1, H = this.__iteratees__, J = H.length, ot = 0, ct = Ie(F, this.__takeCount__);
          if (!c || !y && I == F && ct == F)
            return gf(r, this.__actions__);
          var Et = [];
          t:
            for (; F-- && ot < ct; ) {
              $ += u;
              for (var Ct = -1, xt = r[$]; ++Ct < J; ) {
                var At = H[Ct], Ot = At.iteratee, gn = At.type, Oe = Ot(xt);
                if (gn == St)
                  xt = Oe;
                else if (!Oe) {
                  if (gn == it)
                    continue t;
                  break t;
                }
              }
              Et[ot++] = xt;
            }
          return Et;
        }
        Lt.prototype = Yr(Po.prototype), Lt.prototype.constructor = Lt;
        function ur(r) {
          var u = -1, c = r == null ? 0 : r.length;
          for (this.clear(); ++u < c; ) {
            var y = r[u];
            this.set(y[0], y[1]);
          }
        }
        function H0() {
          this.__data__ = na ? na(null) : {}, this.size = 0;
        }
        function V0(r) {
          var u = this.has(r) && delete this.__data__[r];
          return this.size -= u ? 1 : 0, u;
        }
        function Z0(r) {
          var u = this.__data__;
          if (na) {
            var c = u[r];
            return c === p ? a : c;
          }
          return lt.call(u, r) ? u[r] : a;
        }
        function K0(r) {
          var u = this.__data__;
          return na ? u[r] !== a : lt.call(u, r);
        }
        function J0(r, u) {
          var c = this.__data__;
          return this.size += this.has(r) ? 0 : 1, c[r] = na && u === a ? p : u, this;
        }
        ur.prototype.clear = H0, ur.prototype.delete = V0, ur.prototype.get = Z0, ur.prototype.has = K0, ur.prototype.set = J0;
        function ci(r) {
          var u = -1, c = r == null ? 0 : r.length;
          for (this.clear(); ++u < c; ) {
            var y = r[u];
            this.set(y[0], y[1]);
          }
        }
        function Q0() {
          this.__data__ = [], this.size = 0;
        }
        function j0(r) {
          var u = this.__data__, c = Co(u, r);
          if (c < 0)
            return !1;
          var y = u.length - 1;
          return c == y ? u.pop() : Mo.call(u, c, 1), --this.size, !0;
        }
        function tv(r) {
          var u = this.__data__, c = Co(u, r);
          return c < 0 ? a : u[c][1];
        }
        function ev(r) {
          return Co(this.__data__, r) > -1;
        }
        function nv(r, u) {
          var c = this.__data__, y = Co(c, r);
          return y < 0 ? (++this.size, c.push([r, u])) : c[y][1] = u, this;
        }
        ci.prototype.clear = Q0, ci.prototype.delete = j0, ci.prototype.get = tv, ci.prototype.has = ev, ci.prototype.set = nv;
        function gi(r) {
          var u = -1, c = r == null ? 0 : r.length;
          for (this.clear(); ++u < c; ) {
            var y = r[u];
            this.set(y[0], y[1]);
          }
        }
        function iv() {
          this.size = 0, this.__data__ = {
            hash: new ur(),
            map: new (ta || ci)(),
            string: new ur()
          };
        }
        function rv(r) {
          var u = Uo(this, r).delete(r);
          return this.size -= u ? 1 : 0, u;
        }
        function sv(r) {
          return Uo(this, r).get(r);
        }
        function av(r) {
          return Uo(this, r).has(r);
        }
        function ov(r, u) {
          var c = Uo(this, r), y = c.size;
          return c.set(r, u), this.size += c.size == y ? 0 : 1, this;
        }
        gi.prototype.clear = iv, gi.prototype.delete = rv, gi.prototype.get = sv, gi.prototype.has = av, gi.prototype.set = ov;
        function hr(r) {
          var u = -1, c = r == null ? 0 : r.length;
          for (this.__data__ = new gi(); ++u < c; )
            this.add(r[u]);
        }
        function uv(r) {
          return this.__data__.set(r, p), this;
        }
        function hv(r) {
          return this.__data__.has(r);
        }
        hr.prototype.add = hr.prototype.push = uv, hr.prototype.has = hv;
        function Ln(r) {
          var u = this.__data__ = new ci(r);
          this.size = u.size;
        }
        function lv() {
          this.__data__ = new ci(), this.size = 0;
        }
        function fv(r) {
          var u = this.__data__, c = u.delete(r);
          return this.size = u.size, c;
        }
        function cv(r) {
          return this.__data__.get(r);
        }
        function gv(r) {
          return this.__data__.has(r);
        }
        function vv(r, u) {
          var c = this.__data__;
          if (c instanceof ci) {
            var y = c.__data__;
            if (!ta || y.length < f - 1)
              return y.push([r, u]), this.size = ++c.size, this;
            c = this.__data__ = new gi(y);
          }
          return c.set(r, u), this.size = c.size, this;
        }
        Ln.prototype.clear = lv, Ln.prototype.delete = fv, Ln.prototype.get = cv, Ln.prototype.has = gv, Ln.prototype.set = vv;
        function Yl(r, u) {
          var c = It(r), y = !c && vr(r), I = !c && !y && Oi(r), P = !c && !y && !I && Hr(r), T = c || y || I || P, L = T ? Hs(r.length, D) : [], F = L.length;
          for (var $ in r)
            (u || lt.call(r, $)) && !(T && // Safari 9 has enumerable `arguments.length` in strict mode.
            ($ == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            I && ($ == "offset" || $ == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            P && ($ == "buffer" || $ == "byteLength" || $ == "byteOffset") || // Skip index properties.
            mi($, F))) && L.push($);
          return L;
        }
        function Xl(r) {
          var u = r.length;
          return u ? r[mh(0, u - 1)] : a;
        }
        function _v(r, u) {
          return zo(Ve(r), lr(u, 0, r.length));
        }
        function dv(r) {
          return zo(Ve(r));
        }
        function oh(r, u, c) {
          (c !== a && !On(r[u], c) || c === a && !(u in r)) && vi(r, u, c);
        }
        function ra(r, u, c) {
          var y = r[u];
          (!(lt.call(r, u) && On(y, c)) || c === a && !(u in r)) && vi(r, u, c);
        }
        function Co(r, u) {
          for (var c = r.length; c--; )
            if (On(r[c][0], u))
              return c;
          return -1;
        }
        function mv(r, u, c, y) {
          return Ri(r, function(I, P, T) {
            u(y, I, c(I), T);
          }), y;
        }
        function Wl(r, u) {
          return r && Yn(u, de(u), r);
        }
        function yv(r, u) {
          return r && Yn(u, Ke(u), r);
        }
        function vi(r, u, c) {
          u == "__proto__" && wo ? wo(r, u, {
            configurable: !0,
            enumerable: !0,
            value: c,
            writable: !0
          }) : r[u] = c;
        }
        function uh(r, u) {
          for (var c = -1, y = u.length, I = s(y), P = r == null; ++c < y; )
            I[c] = P ? a : zh(r, u[c]);
          return I;
        }
        function lr(r, u, c) {
          return r === r && (c !== a && (r = r <= c ? r : c), u !== a && (r = r >= u ? r : u)), r;
        }
        function xn(r, u, c, y, I, P) {
          var T, L = u & x, F = u & w, $ = u & b;
          if (c && (T = I ? c(r, y, I, P) : c(r)), T !== a)
            return T;
          if (!Qt(r))
            return r;
          var H = It(r);
          if (H) {
            if (T = a_(r), !L)
              return Ve(r, T);
          } else {
            var J = Ne(r), ot = J == A || J == nn;
            if (Oi(r))
              return df(r, L);
            if (J == rn || J == we || ot && !I) {
              if (T = F || ot ? {} : Of(r), !L)
                return F ? Zv(r, yv(T, r)) : Vv(r, Wl(T, r));
            } else {
              if (!Xt[J])
                return I ? r : {};
              T = o_(r, J, L);
            }
          }
          P || (P = new Ln());
          var ct = P.get(r);
          if (ct)
            return ct;
          P.set(r, T), lc(r) ? r.forEach(function(xt) {
            T.add(xn(xt, u, c, xt, r, P));
          }) : uc(r) && r.forEach(function(xt, At) {
            T.set(At, xn(xt, u, c, At, r, P));
          });
          var Et = $ ? F ? Ph : kh : F ? Ke : de, Ct = H ? a : Et(r);
          return $e(Ct || r, function(xt, At) {
            Ct && (At = xt, xt = r[At]), ra(T, At, xn(xt, u, c, At, r, P));
          }), T;
        }
        function pv(r) {
          var u = de(r);
          return function(c) {
            return $l(c, r, u);
          };
        }
        function $l(r, u, c) {
          var y = c.length;
          if (r == null)
            return !y;
          for (r = N(r); y--; ) {
            var I = c[y], P = u[I], T = r[I];
            if (T === a && !(I in r) || !P(T))
              return !1;
          }
          return !0;
        }
        function Hl(r, u, c) {
          if (typeof r != "function")
            throw new q(d);
          return fa(function() {
            r.apply(a, c);
          }, u);
        }
        function sa(r, u, c, y) {
          var I = -1, P = mn, T = !0, L = r.length, F = [], $ = u.length;
          if (!L)
            return F;
          c && (u = Kt(u, Te(c))), y ? (P = Ee, T = !1) : u.length >= f && (P = Pi, T = !1, u = new hr(u));
          t:
            for (; ++I < L; ) {
              var H = r[I], J = c == null ? H : c(H);
              if (H = y || H !== 0 ? H : 0, T && J === J) {
                for (var ot = $; ot--; )
                  if (u[ot] === J)
                    continue t;
                F.push(H);
              } else P(u, J, y) || F.push(H);
            }
          return F;
        }
        var Ri = xf(zn), Vl = xf(lh, !0);
        function Ev(r, u) {
          var c = !0;
          return Ri(r, function(y, I, P) {
            return c = !!u(y, I, P), c;
          }), c;
        }
        function bo(r, u, c) {
          for (var y = -1, I = r.length; ++y < I; ) {
            var P = r[y], T = u(P);
            if (T != null && (L === a ? T === T && !cn(T) : c(T, L)))
              var L = T, F = P;
          }
          return F;
        }
        function xv(r, u, c, y) {
          var I = r.length;
          for (c = Pt(c), c < 0 && (c = -c > I ? 0 : I + c), y = y === a || y > I ? I : Pt(y), y < 0 && (y += I), y = c > y ? 0 : cc(y); c < y; )
            r[c++] = u;
          return r;
        }
        function Zl(r, u) {
          var c = [];
          return Ri(r, function(y, I, P) {
            u(y, I, P) && c.push(y);
          }), c;
        }
        function xe(r, u, c, y, I) {
          var P = -1, T = r.length;
          for (c || (c = h_), I || (I = []); ++P < T; ) {
            var L = r[P];
            u > 0 && c(L) ? u > 1 ? xe(L, u - 1, c, y, I) : Tn(I, L) : y || (I[I.length] = L);
          }
          return I;
        }
        var hh = Mf(), Kl = Mf(!0);
        function zn(r, u) {
          return r && hh(r, u, de);
        }
        function lh(r, u) {
          return r && Kl(r, u, de);
        }
        function Ro(r, u) {
          return Bn(u, function(c) {
            return yi(r[c]);
          });
        }
        function fr(r, u) {
          u = Ai(u, r);
          for (var c = 0, y = u.length; r != null && c < y; )
            r = r[Xn(u[c++])];
          return c && c == y ? r : a;
        }
        function Jl(r, u, c) {
          var y = u(r);
          return It(r) ? y : Tn(y, c(r));
        }
        function Ae(r) {
          return r == null ? r === a ? wt : za : or && or in N(r) ? i_(r) : d_(r);
        }
        function fh(r, u) {
          return r > u;
        }
        function Mv(r, u) {
          return r != null && lt.call(r, u);
        }
        function wv(r, u) {
          return r != null && u in N(r);
        }
        function Sv(r, u, c) {
          return r >= Ie(u, c) && r < ve(u, c);
        }
        function ch(r, u, c) {
          for (var y = c ? Ee : mn, I = r[0].length, P = r.length, T = P, L = s(P), F = 1 / 0, $ = []; T--; ) {
            var H = r[T];
            T && u && (H = Kt(H, Te(u))), F = Ie(H.length, F), L[T] = !c && (u || I >= 120 && H.length >= 120) ? new hr(T && H) : a;
          }
          H = r[0];
          var J = -1, ot = L[0];
          t:
            for (; ++J < I && $.length < F; ) {
              var ct = H[J], Et = u ? u(ct) : ct;
              if (ct = c || ct !== 0 ? ct : 0, !(ot ? Pi(ot, Et) : y($, Et, c))) {
                for (T = P; --T; ) {
                  var Ct = L[T];
                  if (!(Ct ? Pi(Ct, Et) : y(r[T], Et, c)))
                    continue t;
                }
                ot && ot.push(Et), $.push(ct);
              }
            }
          return $;
        }
        function Iv(r, u, c, y) {
          return zn(r, function(I, P, T) {
            u(y, c(I), P, T);
          }), y;
        }
        function aa(r, u, c) {
          u = Ai(u, r), r = qf(r, u);
          var y = r == null ? r : r[Xn(wn(u))];
          return y == null ? a : Re(y, r, c);
        }
        function Ql(r) {
          return ie(r) && Ae(r) == we;
        }
        function Nv(r) {
          return ie(r) && Ae(r) == jn;
        }
        function kv(r) {
          return ie(r) && Ae(r) == Hi;
        }
        function oa(r, u, c, y, I) {
          return r === u ? !0 : r == null || u == null || !ie(r) && !ie(u) ? r !== r && u !== u : Pv(r, u, c, y, oa, I);
        }
        function Pv(r, u, c, y, I, P) {
          var T = It(r), L = It(u), F = T ? xr : Ne(r), $ = L ? xr : Ne(u);
          F = F == we ? rn : F, $ = $ == we ? rn : $;
          var H = F == rn, J = $ == rn, ot = F == $;
          if (ot && Oi(r)) {
            if (!Oi(u))
              return !1;
            T = !0, H = !1;
          }
          if (ot && !H)
            return P || (P = new Ln()), T || Hr(r) ? Tf(r, u, c, y, I, P) : e_(r, u, F, c, y, I, P);
          if (!(c & C)) {
            var ct = H && lt.call(r, "__wrapped__"), Et = J && lt.call(u, "__wrapped__");
            if (ct || Et) {
              var Ct = ct ? r.value() : r, xt = Et ? u.value() : u;
              return P || (P = new Ln()), I(Ct, xt, c, y, P);
            }
          }
          return ot ? (P || (P = new Ln()), n_(r, u, c, y, I, P)) : !1;
        }
        function Cv(r) {
          return ie(r) && Ne(r) == Se;
        }
        function gh(r, u, c, y) {
          var I = c.length, P = I, T = !y;
          if (r == null)
            return !P;
          for (r = N(r); I--; ) {
            var L = c[I];
            if (T && L[2] ? L[1] !== r[L[0]] : !(L[0] in r))
              return !1;
          }
          for (; ++I < P; ) {
            L = c[I];
            var F = L[0], $ = r[F], H = L[1];
            if (T && L[2]) {
              if ($ === a && !(F in r))
                return !1;
            } else {
              var J = new Ln();
              if (y)
                var ot = y($, H, F, r, u, J);
              if (!(ot === a ? oa(H, $, C | G, y, J) : ot))
                return !1;
            }
          }
          return !0;
        }
        function jl(r) {
          if (!Qt(r) || f_(r))
            return !1;
          var u = yi(r) ? xo : ws;
          return u.test(gr(r));
        }
        function bv(r) {
          return ie(r) && Ae(r) == Si;
        }
        function Rv(r) {
          return ie(r) && Ne(r) == Be;
        }
        function Tv(r) {
          return ie(r) && Vo(r.length) && !!Bt[Ae(r)];
        }
        function tf(r) {
          return typeof r == "function" ? r : r == null ? Je : typeof r == "object" ? It(r) ? rf(r[0], r[1]) : nf(r) : wc(r);
        }
        function vh(r) {
          if (!la(r))
            return O0(r);
          var u = [];
          for (var c in N(r))
            lt.call(r, c) && c != "constructor" && u.push(c);
          return u;
        }
        function Av(r) {
          if (!Qt(r))
            return __(r);
          var u = la(r), c = [];
          for (var y in r)
            y == "constructor" && (u || !lt.call(r, y)) || c.push(y);
          return c;
        }
        function _h(r, u) {
          return r < u;
        }
        function ef(r, u) {
          var c = -1, y = Ze(r) ? s(r.length) : [];
          return Ri(r, function(I, P, T) {
            y[++c] = u(I, P, T);
          }), y;
        }
        function nf(r) {
          var u = bh(r);
          return u.length == 1 && u[0][2] ? Df(u[0][0], u[0][1]) : function(c) {
            return c === r || gh(c, r, u);
          };
        }
        function rf(r, u) {
          return Th(r) && Gf(u) ? Df(Xn(r), u) : function(c) {
            var y = zh(c, r);
            return y === a && y === u ? Yh(c, r) : oa(u, y, C | G);
          };
        }
        function To(r, u, c, y, I) {
          r !== u && hh(u, function(P, T) {
            if (I || (I = new Ln()), Qt(P))
              Lv(r, u, T, c, To, y, I);
            else {
              var L = y ? y(Lh(r, T), P, T + "", r, u, I) : a;
              L === a && (L = P), oh(r, T, L);
            }
          }, Ke);
        }
        function Lv(r, u, c, y, I, P, T) {
          var L = Lh(r, c), F = Lh(u, c), $ = T.get(F);
          if ($) {
            oh(r, c, $);
            return;
          }
          var H = P ? P(L, F, c + "", r, u, T) : a, J = H === a;
          if (J) {
            var ot = It(F), ct = !ot && Oi(F), Et = !ot && !ct && Hr(F);
            H = F, ot || ct || Et ? It(L) ? H = L : ae(L) ? H = Ve(L) : ct ? (J = !1, H = df(F, !0)) : Et ? (J = !1, H = mf(F, !0)) : H = [] : ca(F) || vr(F) ? (H = L, vr(L) ? H = gc(L) : (!Qt(L) || yi(L)) && (H = Of(F))) : J = !1;
          }
          J && (T.set(F, H), I(H, F, y, P, T), T.delete(F)), oh(r, c, H);
        }
        function sf(r, u) {
          var c = r.length;
          if (c)
            return u += u < 0 ? c : 0, mi(u, c) ? r[u] : a;
        }
        function af(r, u, c) {
          u.length ? u = Kt(u, function(P) {
            return It(P) ? function(T) {
              return fr(T, P.length === 1 ? P[0] : P);
            } : P;
          }) : u = [Je];
          var y = -1;
          u = Kt(u, Te(yt()));
          var I = ef(r, function(P, T, L) {
            var F = Kt(u, function($) {
              return $(P);
            });
            return { criteria: F, index: ++y, value: P };
          });
          return Vu(I, function(P, T) {
            return Hv(P, T, c);
          });
        }
        function Ov(r, u) {
          return of(r, u, function(c, y) {
            return Yh(r, y);
          });
        }
        function of(r, u, c) {
          for (var y = -1, I = u.length, P = {}; ++y < I; ) {
            var T = u[y], L = fr(r, T);
            c(L, T) && ua(P, Ai(T, r), L);
          }
          return P;
        }
        function Gv(r) {
          return function(u) {
            return fr(u, r);
          };
        }
        function dh(r, u, c, y) {
          var I = y ? Hu : yn, P = -1, T = u.length, L = r;
          for (r === u && (u = Ve(u)), c && (L = Kt(r, Te(c))); ++P < T; )
            for (var F = 0, $ = u[P], H = c ? c($) : $; (F = I(L, H, F, y)) > -1; )
              L !== r && Mo.call(L, F, 1), Mo.call(r, F, 1);
          return r;
        }
        function uf(r, u) {
          for (var c = r ? u.length : 0, y = c - 1; c--; ) {
            var I = u[c];
            if (c == y || I !== P) {
              var P = I;
              mi(I) ? Mo.call(r, I, 1) : Eh(r, I);
            }
          }
          return r;
        }
        function mh(r, u) {
          return r + Io(Ul() * (u - r + 1));
        }
        function Dv(r, u, c, y) {
          for (var I = -1, P = ve(So((u - r) / (c || 1)), 0), T = s(P); P--; )
            T[y ? P : ++I] = r, r += c;
          return T;
        }
        function yh(r, u) {
          var c = "";
          if (!r || u < 1 || u > $t)
            return c;
          do
            u % 2 && (c += r), u = Io(u / 2), u && (r += r);
          while (u);
          return c;
        }
        function Rt(r, u) {
          return Oh(Ff(r, u, Je), r + "");
        }
        function Fv(r) {
          return Xl(Vr(r));
        }
        function qv(r, u) {
          var c = Vr(r);
          return zo(c, lr(u, 0, c.length));
        }
        function ua(r, u, c, y) {
          if (!Qt(r))
            return r;
          u = Ai(u, r);
          for (var I = -1, P = u.length, T = P - 1, L = r; L != null && ++I < P; ) {
            var F = Xn(u[I]), $ = c;
            if (F === "__proto__" || F === "constructor" || F === "prototype")
              return r;
            if (I != T) {
              var H = L[F];
              $ = y ? y(H, F, L) : a, $ === a && ($ = Qt(H) ? H : mi(u[I + 1]) ? [] : {});
            }
            ra(L, F, $), L = L[F];
          }
          return r;
        }
        var hf = No ? function(r, u) {
          return No.set(r, u), r;
        } : Je, Bv = wo ? function(r, u) {
          return wo(r, "toString", {
            configurable: !0,
            enumerable: !1,
            value: Wh(u),
            writable: !0
          });
        } : Je;
        function Uv(r) {
          return zo(Vr(r));
        }
        function Mn(r, u, c) {
          var y = -1, I = r.length;
          u < 0 && (u = -u > I ? 0 : I + u), c = c > I ? I : c, c < 0 && (c += I), I = u > c ? 0 : c - u >>> 0, u >>>= 0;
          for (var P = s(I); ++y < I; )
            P[y] = r[y + u];
          return P;
        }
        function zv(r, u) {
          var c;
          return Ri(r, function(y, I, P) {
            return c = u(y, I, P), !c;
          }), !!c;
        }
        function Ao(r, u, c) {
          var y = 0, I = r == null ? y : r.length;
          if (typeof u == "number" && u === u && I <= Me) {
            for (; y < I; ) {
              var P = y + I >>> 1, T = r[P];
              T !== null && !cn(T) && (c ? T <= u : T < u) ? y = P + 1 : I = P;
            }
            return I;
          }
          return ph(r, u, Je, c);
        }
        function ph(r, u, c, y) {
          var I = 0, P = r == null ? 0 : r.length;
          if (P === 0)
            return 0;
          u = c(u);
          for (var T = u !== u, L = u === null, F = cn(u), $ = u === a; I < P; ) {
            var H = Io((I + P) / 2), J = c(r[H]), ot = J !== a, ct = J === null, Et = J === J, Ct = cn(J);
            if (T)
              var xt = y || Et;
            else $ ? xt = Et && (y || ot) : L ? xt = Et && ot && (y || !ct) : F ? xt = Et && ot && !ct && (y || !Ct) : ct || Ct ? xt = !1 : xt = y ? J <= u : J < u;
            xt ? I = H + 1 : P = H;
          }
          return Ie(P, le);
        }
        function lf(r, u) {
          for (var c = -1, y = r.length, I = 0, P = []; ++c < y; ) {
            var T = r[c], L = u ? u(T) : T;
            if (!c || !On(L, F)) {
              var F = L;
              P[I++] = T === 0 ? 0 : T;
            }
          }
          return P;
        }
        function ff(r) {
          return typeof r == "number" ? r : cn(r) ? ht : +r;
        }
        function fn(r) {
          if (typeof r == "string")
            return r;
          if (It(r))
            return Kt(r, fn) + "";
          if (cn(r))
            return zl ? zl.call(r) : "";
          var u = r + "";
          return u == "0" && 1 / r == -Dt ? "-0" : u;
        }
        function Ti(r, u, c) {
          var y = -1, I = mn, P = r.length, T = !0, L = [], F = L;
          if (c)
            T = !1, I = Ee;
          else if (P >= f) {
            var $ = u ? null : jv(r);
            if ($)
              return nr($);
            T = !1, I = Pi, F = new hr();
          } else
            F = u ? [] : L;
          t:
            for (; ++y < P; ) {
              var H = r[y], J = u ? u(H) : H;
              if (H = c || H !== 0 ? H : 0, T && J === J) {
                for (var ot = F.length; ot--; )
                  if (F[ot] === J)
                    continue t;
                u && F.push(J), L.push(H);
              } else I(F, J, c) || (F !== L && F.push(J), L.push(H));
            }
          return L;
        }
        function Eh(r, u) {
          return u = Ai(u, r), r = qf(r, u), r == null || delete r[Xn(wn(u))];
        }
        function cf(r, u, c, y) {
          return ua(r, u, c(fr(r, u)), y);
        }
        function Lo(r, u, c, y) {
          for (var I = r.length, P = y ? I : -1; (y ? P-- : ++P < I) && u(r[P], P, r); )
            ;
          return c ? Mn(r, y ? 0 : P, y ? P + 1 : I) : Mn(r, y ? P + 1 : 0, y ? I : P);
        }
        function gf(r, u) {
          var c = r;
          return c instanceof Lt && (c = c.value()), Bs(u, function(y, I) {
            return I.func.apply(I.thisArg, Tn([y], I.args));
          }, c);
        }
        function xh(r, u, c) {
          var y = r.length;
          if (y < 2)
            return y ? Ti(r[0]) : [];
          for (var I = -1, P = s(y); ++I < y; )
            for (var T = r[I], L = -1; ++L < y; )
              L != I && (P[I] = sa(P[I] || T, r[L], u, c));
          return Ti(xe(P, 1), u, c);
        }
        function vf(r, u, c) {
          for (var y = -1, I = r.length, P = u.length, T = {}; ++y < I; ) {
            var L = y < P ? u[y] : a;
            c(T, r[y], L);
          }
          return T;
        }
        function Mh(r) {
          return ae(r) ? r : [];
        }
        function wh(r) {
          return typeof r == "function" ? r : Je;
        }
        function Ai(r, u) {
          return It(r) ? r : Th(r, u) ? [r] : Yf(Ut(r));
        }
        var Yv = Rt;
        function Li(r, u, c) {
          var y = r.length;
          return c = c === a ? y : c, !u && c >= y ? r : Mn(r, u, c);
        }
        var _f = b0 || function(r) {
          return ne.clearTimeout(r);
        };
        function df(r, u) {
          if (u)
            return r.slice();
          var c = r.length, y = Qs ? Qs(c) : new r.constructor(c);
          return r.copy(y), y;
        }
        function Sh(r) {
          var u = new r.constructor(r.byteLength);
          return new sr(u).set(new sr(r)), u;
        }
        function Xv(r, u) {
          var c = u ? Sh(r.buffer) : r.buffer;
          return new r.constructor(c, r.byteOffset, r.byteLength);
        }
        function Wv(r) {
          var u = new r.constructor(r.source, Ii.exec(r));
          return u.lastIndex = r.lastIndex, u;
        }
        function $v(r) {
          return ia ? N(ia.call(r)) : {};
        }
        function mf(r, u) {
          var c = u ? Sh(r.buffer) : r.buffer;
          return new r.constructor(c, r.byteOffset, r.length);
        }
        function yf(r, u) {
          if (r !== u) {
            var c = r !== a, y = r === null, I = r === r, P = cn(r), T = u !== a, L = u === null, F = u === u, $ = cn(u);
            if (!L && !$ && !P && r > u || P && T && F && !L && !$ || y && T && F || !c && F || !I)
              return 1;
            if (!y && !P && !$ && r < u || $ && c && I && !y && !P || L && c && I || !T && I || !F)
              return -1;
          }
          return 0;
        }
        function Hv(r, u, c) {
          for (var y = -1, I = r.criteria, P = u.criteria, T = I.length, L = c.length; ++y < T; ) {
            var F = yf(I[y], P[y]);
            if (F) {
              if (y >= L)
                return F;
              var $ = c[y];
              return F * ($ == "desc" ? -1 : 1);
            }
          }
          return r.index - u.index;
        }
        function pf(r, u, c, y) {
          for (var I = -1, P = r.length, T = c.length, L = -1, F = u.length, $ = ve(P - T, 0), H = s(F + $), J = !y; ++L < F; )
            H[L] = u[L];
          for (; ++I < T; )
            (J || I < P) && (H[c[I]] = r[I]);
          for (; $--; )
            H[L++] = r[I++];
          return H;
        }
        function Ef(r, u, c, y) {
          for (var I = -1, P = r.length, T = -1, L = c.length, F = -1, $ = u.length, H = ve(P - L, 0), J = s(H + $), ot = !y; ++I < H; )
            J[I] = r[I];
          for (var ct = I; ++F < $; )
            J[ct + F] = u[F];
          for (; ++T < L; )
            (ot || I < P) && (J[ct + c[T]] = r[I++]);
          return J;
        }
        function Ve(r, u) {
          var c = -1, y = r.length;
          for (u || (u = s(y)); ++c < y; )
            u[c] = r[c];
          return u;
        }
        function Yn(r, u, c, y) {
          var I = !c;
          c || (c = {});
          for (var P = -1, T = u.length; ++P < T; ) {
            var L = u[P], F = y ? y(c[L], r[L], L, c, r) : a;
            F === a && (F = r[L]), I ? vi(c, L, F) : ra(c, L, F);
          }
          return c;
        }
        function Vv(r, u) {
          return Yn(r, Rh(r), u);
        }
        function Zv(r, u) {
          return Yn(r, Af(r), u);
        }
        function Oo(r, u) {
          return function(c, y) {
            var I = It(c) ? Wu : mv, P = u ? u() : {};
            return I(c, r, yt(y, 2), P);
          };
        }
        function Xr(r) {
          return Rt(function(u, c) {
            var y = -1, I = c.length, P = I > 1 ? c[I - 1] : a, T = I > 2 ? c[2] : a;
            for (P = r.length > 3 && typeof P == "function" ? (I--, P) : a, T && Le(c[0], c[1], T) && (P = I < 3 ? a : P, I = 1), u = N(u); ++y < I; ) {
              var L = c[y];
              L && r(u, L, y, P);
            }
            return u;
          });
        }
        function xf(r, u) {
          return function(c, y) {
            if (c == null)
              return c;
            if (!Ze(c))
              return r(c, y);
            for (var I = c.length, P = u ? I : -1, T = N(c); (u ? P-- : ++P < I) && y(T[P], P, T) !== !1; )
              ;
            return c;
          };
        }
        function Mf(r) {
          return function(u, c, y) {
            for (var I = -1, P = N(u), T = y(u), L = T.length; L--; ) {
              var F = T[r ? L : ++I];
              if (c(P[F], F, P) === !1)
                break;
            }
            return u;
          };
        }
        function Kv(r, u, c) {
          var y = u & O, I = ha(r);
          function P() {
            var T = this && this !== ne && this instanceof P ? I : r;
            return T.apply(y ? c : this, arguments);
          }
          return P;
        }
        function wf(r) {
          return function(u) {
            u = Ut(u);
            var c = Ci(u) ? ln(u) : a, y = c ? c[0] : u.charAt(0), I = c ? Li(c, 1).join("") : u.slice(1);
            return y[r]() + I;
          };
        }
        function Wr(r) {
          return function(u) {
            return Bs(xc(Ec(u).replace(io, "")), r, "");
          };
        }
        function ha(r) {
          return function() {
            var u = arguments;
            switch (u.length) {
              case 0:
                return new r();
              case 1:
                return new r(u[0]);
              case 2:
                return new r(u[0], u[1]);
              case 3:
                return new r(u[0], u[1], u[2]);
              case 4:
                return new r(u[0], u[1], u[2], u[3]);
              case 5:
                return new r(u[0], u[1], u[2], u[3], u[4]);
              case 6:
                return new r(u[0], u[1], u[2], u[3], u[4], u[5]);
              case 7:
                return new r(u[0], u[1], u[2], u[3], u[4], u[5], u[6]);
            }
            var c = Yr(r.prototype), y = r.apply(c, u);
            return Qt(y) ? y : c;
          };
        }
        function Jv(r, u, c) {
          var y = ha(r);
          function I() {
            for (var P = arguments.length, T = s(P), L = P, F = $r(I); L--; )
              T[L] = arguments[L];
            var $ = P < 3 && T[0] !== F && T[P - 1] !== F ? [] : Un(T, F);
            if (P -= $.length, P < c)
              return Pf(
                r,
                u,
                Go,
                I.placeholder,
                a,
                T,
                $,
                a,
                a,
                c - P
              );
            var H = this && this !== ne && this instanceof I ? y : r;
            return Re(H, this, T);
          }
          return I;
        }
        function Sf(r) {
          return function(u, c, y) {
            var I = N(u);
            if (!Ze(u)) {
              var P = yt(c, 3);
              u = de(u), c = function(L) {
                return P(I[L], L, I);
              };
            }
            var T = r(u, c, y);
            return T > -1 ? I[P ? u[T] : T] : a;
          };
        }
        function If(r) {
          return di(function(u) {
            var c = u.length, y = c, I = En.prototype.thru;
            for (r && u.reverse(); y--; ) {
              var P = u[y];
              if (typeof P != "function")
                throw new q(d);
              if (I && !T && Bo(P) == "wrapper")
                var T = new En([], !0);
            }
            for (y = T ? y : c; ++y < c; ) {
              P = u[y];
              var L = Bo(P), F = L == "wrapper" ? Ch(P) : a;
              F && Ah(F[0]) && F[1] == (K | Y | X | et) && !F[4].length && F[9] == 1 ? T = T[Bo(F[0])].apply(T, F[3]) : T = P.length == 1 && Ah(P) ? T[L]() : T.thru(P);
            }
            return function() {
              var $ = arguments, H = $[0];
              if (T && $.length == 1 && It(H))
                return T.plant(H).value();
              for (var J = 0, ot = c ? u[J].apply(this, $) : H; ++J < c; )
                ot = u[J].call(this, ot);
              return ot;
            };
          });
        }
        function Go(r, u, c, y, I, P, T, L, F, $) {
          var H = u & K, J = u & O, ot = u & B, ct = u & (Y | W), Et = u & j, Ct = ot ? a : ha(r);
          function xt() {
            for (var At = arguments.length, Ot = s(At), gn = At; gn--; )
              Ot[gn] = arguments[gn];
            if (ct)
              var Oe = $r(xt), vn = Ku(Ot, Oe);
            if (y && (Ot = pf(Ot, y, I, ct)), P && (Ot = Ef(Ot, P, T, ct)), At -= vn, ct && At < $) {
              var oe = Un(Ot, Oe);
              return Pf(
                r,
                u,
                Go,
                xt.placeholder,
                c,
                Ot,
                oe,
                L,
                F,
                $ - At
              );
            }
            var Gn = J ? c : this, Ei = ot ? Gn[r] : r;
            return At = Ot.length, L ? Ot = m_(Ot, L) : Et && At > 1 && Ot.reverse(), H && F < At && (Ot.length = F), this && this !== ne && this instanceof xt && (Ei = Ct || ha(Ei)), Ei.apply(Gn, Ot);
          }
          return xt;
        }
        function Nf(r, u) {
          return function(c, y) {
            return Iv(c, r, u(y), {});
          };
        }
        function Do(r, u) {
          return function(c, y) {
            var I;
            if (c === a && y === a)
              return u;
            if (c !== a && (I = c), y !== a) {
              if (I === a)
                return y;
              typeof c == "string" || typeof y == "string" ? (c = fn(c), y = fn(y)) : (c = ff(c), y = ff(y)), I = r(c, y);
            }
            return I;
          };
        }
        function Ih(r) {
          return di(function(u) {
            return u = Kt(u, Te(yt())), Rt(function(c) {
              var y = this;
              return r(u, function(I) {
                return Re(I, y, c);
              });
            });
          });
        }
        function Fo(r, u) {
          u = u === a ? " " : fn(u);
          var c = u.length;
          if (c < 2)
            return c ? yh(u, r) : u;
          var y = yh(u, So(r / li(u)));
          return Ci(u) ? Li(ln(y), 0, r).join("") : y.slice(0, r);
        }
        function Qv(r, u, c, y) {
          var I = u & O, P = ha(r);
          function T() {
            for (var L = -1, F = arguments.length, $ = -1, H = y.length, J = s(H + F), ot = this && this !== ne && this instanceof T ? P : r; ++$ < H; )
              J[$] = y[$];
            for (; F--; )
              J[$++] = arguments[++L];
            return Re(ot, I ? c : this, J);
          }
          return T;
        }
        function kf(r) {
          return function(u, c, y) {
            return y && typeof y != "number" && Le(u, c, y) && (c = y = a), u = pi(u), c === a ? (c = u, u = 0) : c = pi(c), y = y === a ? u < c ? 1 : -1 : pi(y), Dv(u, c, y, r);
          };
        }
        function qo(r) {
          return function(u, c) {
            return typeof u == "string" && typeof c == "string" || (u = Sn(u), c = Sn(c)), r(u, c);
          };
        }
        function Pf(r, u, c, y, I, P, T, L, F, $) {
          var H = u & Y, J = H ? T : a, ot = H ? a : T, ct = H ? P : a, Et = H ? a : P;
          u |= H ? X : V, u &= ~(H ? V : X), u & z || (u &= -4);
          var Ct = [
            r,
            u,
            I,
            ct,
            J,
            Et,
            ot,
            L,
            F,
            $
          ], xt = c.apply(a, Ct);
          return Ah(r) && Bf(xt, Ct), xt.placeholder = y, Uf(xt, r, u);
        }
        function Nh(r) {
          var u = E[r];
          return function(c, y) {
            if (c = Sn(c), y = y == null ? 0 : Ie(Pt(y), 292), y && Bl(c)) {
              var I = (Ut(c) + "e").split("e"), P = u(I[0] + "e" + (+I[1] + y));
              return I = (Ut(P) + "e").split("e"), +(I[0] + "e" + (+I[1] - y));
            }
            return u(c);
          };
        }
        var jv = Ur && 1 / nr(new Ur([, -0]))[1] == Dt ? function(r) {
          return new Ur(r);
        } : Vh;
        function Cf(r) {
          return function(u) {
            var c = Ne(u);
            return c == Se ? Fr(u) : c == Be ? Js(u) : Zu(u, r(u));
          };
        }
        function _i(r, u, c, y, I, P, T, L) {
          var F = u & B;
          if (!F && typeof r != "function")
            throw new q(d);
          var $ = y ? y.length : 0;
          if ($ || (u &= -97, y = I = a), T = T === a ? T : ve(Pt(T), 0), L = L === a ? L : Pt(L), $ -= I ? I.length : 0, u & V) {
            var H = y, J = I;
            y = I = a;
          }
          var ot = F ? a : Ch(r), ct = [
            r,
            u,
            c,
            y,
            I,
            H,
            J,
            P,
            T,
            L
          ];
          if (ot && v_(ct, ot), r = ct[0], u = ct[1], c = ct[2], y = ct[3], I = ct[4], L = ct[9] = ct[9] === a ? F ? 0 : r.length : ve(ct[9] - $, 0), !L && u & (Y | W) && (u &= -25), !u || u == O)
            var Et = Kv(r, u, c);
          else u == Y || u == W ? Et = Jv(r, u, L) : (u == X || u == (O | X)) && !I.length ? Et = Qv(r, u, c, y) : Et = Go.apply(a, ct);
          var Ct = ot ? hf : Bf;
          return Uf(Ct(Et, ct), r, u);
        }
        function bf(r, u, c, y) {
          return r === a || On(r, ut[c]) && !lt.call(y, c) ? u : r;
        }
        function Rf(r, u, c, y, I, P) {
          return Qt(r) && Qt(u) && (P.set(u, r), To(r, u, a, Rf, P), P.delete(u)), r;
        }
        function t_(r) {
          return ca(r) ? a : r;
        }
        function Tf(r, u, c, y, I, P) {
          var T = c & C, L = r.length, F = u.length;
          if (L != F && !(T && F > L))
            return !1;
          var $ = P.get(r), H = P.get(u);
          if ($ && H)
            return $ == u && H == r;
          var J = -1, ot = !0, ct = c & G ? new hr() : a;
          for (P.set(r, u), P.set(u, r); ++J < L; ) {
            var Et = r[J], Ct = u[J];
            if (y)
              var xt = T ? y(Ct, Et, J, u, r, P) : y(Et, Ct, J, r, u, P);
            if (xt !== a) {
              if (xt)
                continue;
              ot = !1;
              break;
            }
            if (ct) {
              if (!Gr(u, function(At, Ot) {
                if (!Pi(ct, Ot) && (Et === At || I(Et, At, c, y, P)))
                  return ct.push(Ot);
              })) {
                ot = !1;
                break;
              }
            } else if (!(Et === Ct || I(Et, Ct, c, y, P))) {
              ot = !1;
              break;
            }
          }
          return P.delete(r), P.delete(u), ot;
        }
        function e_(r, u, c, y, I, P, T) {
          switch (c) {
            case dt:
              if (r.byteLength != u.byteLength || r.byteOffset != u.byteOffset)
                return !1;
              r = r.buffer, u = u.buffer;
            case jn:
              return !(r.byteLength != u.byteLength || !P(new sr(r), new sr(u)));
            case U:
            case Hi:
            case qe:
              return On(+r, +u);
            case ft:
              return r.name == u.name && r.message == u.message;
            case Si:
            case sn:
              return r == u + "";
            case Se:
              var L = Fr;
            case Be:
              var F = y & C;
              if (L || (L = nr), r.size != u.size && !F)
                return !1;
              var $ = T.get(r);
              if ($)
                return $ == u;
              y |= G, T.set(r, u);
              var H = Tf(L(r), L(u), y, I, P, T);
              return T.delete(r), H;
            case Mr:
              if (ia)
                return ia.call(r) == ia.call(u);
          }
          return !1;
        }
        function n_(r, u, c, y, I, P) {
          var T = c & C, L = kh(r), F = L.length, $ = kh(u), H = $.length;
          if (F != H && !T)
            return !1;
          for (var J = F; J--; ) {
            var ot = L[J];
            if (!(T ? ot in u : lt.call(u, ot)))
              return !1;
          }
          var ct = P.get(r), Et = P.get(u);
          if (ct && Et)
            return ct == u && Et == r;
          var Ct = !0;
          P.set(r, u), P.set(u, r);
          for (var xt = T; ++J < F; ) {
            ot = L[J];
            var At = r[ot], Ot = u[ot];
            if (y)
              var gn = T ? y(Ot, At, ot, u, r, P) : y(At, Ot, ot, r, u, P);
            if (!(gn === a ? At === Ot || I(At, Ot, c, y, P) : gn)) {
              Ct = !1;
              break;
            }
            xt || (xt = ot == "constructor");
          }
          if (Ct && !xt) {
            var Oe = r.constructor, vn = u.constructor;
            Oe != vn && "constructor" in r && "constructor" in u && !(typeof Oe == "function" && Oe instanceof Oe && typeof vn == "function" && vn instanceof vn) && (Ct = !1);
          }
          return P.delete(r), P.delete(u), Ct;
        }
        function di(r) {
          return Oh(Ff(r, a, Hf), r + "");
        }
        function kh(r) {
          return Jl(r, de, Rh);
        }
        function Ph(r) {
          return Jl(r, Ke, Af);
        }
        var Ch = No ? function(r) {
          return No.get(r);
        } : Vh;
        function Bo(r) {
          for (var u = r.name + "", c = zr[u], y = lt.call(zr, u) ? c.length : 0; y--; ) {
            var I = c[y], P = I.func;
            if (P == null || P == r)
              return I.name;
          }
          return u;
        }
        function $r(r) {
          var u = lt.call(k, "placeholder") ? k : r;
          return u.placeholder;
        }
        function yt() {
          var r = k.iteratee || $h;
          return r = r === $h ? tf : r, arguments.length ? r(arguments[0], arguments[1]) : r;
        }
        function Uo(r, u) {
          var c = r.__data__;
          return l_(u) ? c[typeof u == "string" ? "string" : "hash"] : c.map;
        }
        function bh(r) {
          for (var u = de(r), c = u.length; c--; ) {
            var y = u[c], I = r[y];
            u[c] = [y, I, Gf(I)];
          }
          return u;
        }
        function cr(r, u) {
          var c = th(r, u);
          return jl(c) ? c : a;
        }
        function i_(r) {
          var u = lt.call(r, or), c = r[or];
          try {
            r[or] = a;
            var y = !0;
          } catch {
          }
          var I = se.call(r);
          return y && (u ? r[or] = c : delete r[or]), I;
        }
        var Rh = rh ? function(r) {
          return r == null ? [] : (r = N(r), Bn(rh(r), function(u) {
            return Br.call(r, u);
          }));
        } : Zh, Af = rh ? function(r) {
          for (var u = []; r; )
            Tn(u, Rh(r)), r = ar(r);
          return u;
        } : Zh, Ne = Ae;
        (sh && Ne(new sh(new ArrayBuffer(1))) != dt || ta && Ne(new ta()) != Se || ah && Ne(ah.resolve()) != Ya || Ur && Ne(new Ur()) != Be || ea && Ne(new ea()) != Cn) && (Ne = function(r) {
          var u = Ae(r), c = u == rn ? r.constructor : a, y = c ? gr(c) : "";
          if (y)
            switch (y) {
              case q0:
                return dt;
              case B0:
                return Se;
              case U0:
                return Ya;
              case z0:
                return Be;
              case Y0:
                return Cn;
            }
          return u;
        });
        function r_(r, u, c) {
          for (var y = -1, I = c.length; ++y < I; ) {
            var P = c[y], T = P.size;
            switch (P.type) {
              case "drop":
                r += T;
                break;
              case "dropRight":
                u -= T;
                break;
              case "take":
                u = Ie(u, r + T);
                break;
              case "takeRight":
                r = ve(r, u - T);
                break;
            }
          }
          return { start: r, end: u };
        }
        function s_(r) {
          var u = r.match(Cr);
          return u ? u[1].split(Du) : [];
        }
        function Lf(r, u, c) {
          u = Ai(u, r);
          for (var y = -1, I = u.length, P = !1; ++y < I; ) {
            var T = Xn(u[y]);
            if (!(P = r != null && c(r, T)))
              break;
            r = r[T];
          }
          return P || ++y != I ? P : (I = r == null ? 0 : r.length, !!I && Vo(I) && mi(T, I) && (It(r) || vr(r)));
        }
        function a_(r) {
          var u = r.length, c = new r.constructor(u);
          return u && typeof r[0] == "string" && lt.call(r, "index") && (c.index = r.index, c.input = r.input), c;
        }
        function Of(r) {
          return typeof r.constructor == "function" && !la(r) ? Yr(ar(r)) : {};
        }
        function o_(r, u, c) {
          var y = r.constructor;
          switch (u) {
            case jn:
              return Sh(r);
            case U:
            case Hi:
              return new y(+r);
            case dt:
              return Xv(r, c);
            case Vi:
            case Tt:
            case pt:
            case _s:
            case an:
            case ds:
            case mt:
            case ms:
            case ys:
              return mf(r, c);
            case Se:
              return new y();
            case qe:
            case sn:
              return new y(r);
            case Si:
              return Wv(r);
            case Be:
              return new y();
            case Mr:
              return $v(r);
          }
        }
        function u_(r, u) {
          var c = u.length;
          if (!c)
            return r;
          var y = c - 1;
          return u[y] = (c > 1 ? "& " : "") + u[y], u = u.join(c > 2 ? ", " : " "), r.replace(Wa, `{
/* [wrapped with ` + u + `] */
`);
        }
        function h_(r) {
          return It(r) || vr(r) || !!(ql && r && r[ql]);
        }
        function mi(r, u) {
          var c = typeof r;
          return u = u ?? $t, !!u && (c == "number" || c != "symbol" && Ji.test(r)) && r > -1 && r % 1 == 0 && r < u;
        }
        function Le(r, u, c) {
          if (!Qt(c))
            return !1;
          var y = typeof u;
          return (y == "number" ? Ze(c) && mi(u, c.length) : y == "string" && u in c) ? On(c[u], r) : !1;
        }
        function Th(r, u) {
          if (It(r))
            return !1;
          var c = typeof r;
          return c == "number" || c == "symbol" || c == "boolean" || r == null || cn(r) ? !0 : Nr.test(r) || !Ir.test(r) || u != null && r in N(u);
        }
        function l_(r) {
          var u = typeof r;
          return u == "string" || u == "number" || u == "symbol" || u == "boolean" ? r !== "__proto__" : r === null;
        }
        function Ah(r) {
          var u = Bo(r), c = k[u];
          if (typeof c != "function" || !(u in Lt.prototype))
            return !1;
          if (r === c)
            return !0;
          var y = Ch(c);
          return !!y && r === y[0];
        }
        function f_(r) {
          return !!ce && ce in r;
        }
        var c_ = gt ? yi : Kh;
        function la(r) {
          var u = r && r.constructor, c = typeof u == "function" && u.prototype || ut;
          return r === c;
        }
        function Gf(r) {
          return r === r && !Qt(r);
        }
        function Df(r, u) {
          return function(c) {
            return c == null ? !1 : c[r] === u && (u !== a || r in N(c));
          };
        }
        function g_(r) {
          var u = $o(r, function(y) {
            return c.size === M && c.clear(), y;
          }), c = u.cache;
          return u;
        }
        function v_(r, u) {
          var c = r[1], y = u[1], I = c | y, P = I < (O | B | K), T = y == K && c == Y || y == K && c == et && r[7].length <= u[8] || y == (K | et) && u[7].length <= u[8] && c == Y;
          if (!(P || T))
            return r;
          y & O && (r[2] = u[2], I |= c & O ? 0 : z);
          var L = u[3];
          if (L) {
            var F = r[3];
            r[3] = F ? pf(F, L, u[4]) : L, r[4] = F ? Un(r[3], S) : u[4];
          }
          return L = u[5], L && (F = r[5], r[5] = F ? Ef(F, L, u[6]) : L, r[6] = F ? Un(r[5], S) : u[6]), L = u[7], L && (r[7] = L), y & K && (r[8] = r[8] == null ? u[8] : Ie(r[8], u[8])), r[9] == null && (r[9] = u[9]), r[0] = u[0], r[1] = I, r;
        }
        function __(r) {
          var u = [];
          if (r != null)
            for (var c in N(r))
              u.push(c);
          return u;
        }
        function d_(r) {
          return se.call(r);
        }
        function Ff(r, u, c) {
          return u = ve(u === a ? r.length - 1 : u, 0), function() {
            for (var y = arguments, I = -1, P = ve(y.length - u, 0), T = s(P); ++I < P; )
              T[I] = y[u + I];
            I = -1;
            for (var L = s(u + 1); ++I < u; )
              L[I] = y[I];
            return L[u] = c(T), Re(r, this, L);
          };
        }
        function qf(r, u) {
          return u.length < 2 ? r : fr(r, Mn(u, 0, -1));
        }
        function m_(r, u) {
          for (var c = r.length, y = Ie(u.length, c), I = Ve(r); y--; ) {
            var P = u[y];
            r[y] = mi(P, c) ? I[P] : a;
          }
          return r;
        }
        function Lh(r, u) {
          if (!(u === "constructor" && typeof r[u] == "function") && u != "__proto__")
            return r[u];
        }
        var Bf = zf(hf), fa = T0 || function(r, u) {
          return ne.setTimeout(r, u);
        }, Oh = zf(Bv);
        function Uf(r, u, c) {
          var y = u + "";
          return Oh(r, u_(y, y_(s_(y), c)));
        }
        function zf(r) {
          var u = 0, c = 0;
          return function() {
            var y = G0(), I = kt - (y - c);
            if (c = y, I > 0) {
              if (++u >= Mt)
                return arguments[0];
            } else
              u = 0;
            return r.apply(a, arguments);
          };
        }
        function zo(r, u) {
          var c = -1, y = r.length, I = y - 1;
          for (u = u === a ? y : u; ++c < u; ) {
            var P = mh(c, I), T = r[P];
            r[P] = r[c], r[c] = T;
          }
          return r.length = u, r;
        }
        var Yf = g_(function(r) {
          var u = [];
          return r.charCodeAt(0) === 46 && u.push(""), r.replace(Ki, function(c, y, I, P) {
            u.push(I ? P.replace(be, "$1") : y || c);
          }), u;
        });
        function Xn(r) {
          if (typeof r == "string" || cn(r))
            return r;
          var u = r + "";
          return u == "0" && 1 / r == -Dt ? "-0" : u;
        }
        function gr(r) {
          if (r != null) {
            try {
              return bt.call(r);
            } catch {
            }
            try {
              return r + "";
            } catch {
            }
          }
          return "";
        }
        function y_(r, u) {
          return $e(Nt, function(c) {
            var y = "_." + c[0];
            u & c[1] && !mn(r, y) && r.push(y);
          }), r.sort();
        }
        function Xf(r) {
          if (r instanceof Lt)
            return r.clone();
          var u = new En(r.__wrapped__, r.__chain__);
          return u.__actions__ = Ve(r.__actions__), u.__index__ = r.__index__, u.__values__ = r.__values__, u;
        }
        function p_(r, u, c) {
          (c ? Le(r, u, c) : u === a) ? u = 1 : u = ve(Pt(u), 0);
          var y = r == null ? 0 : r.length;
          if (!y || u < 1)
            return [];
          for (var I = 0, P = 0, T = s(So(y / u)); I < y; )
            T[P++] = Mn(r, I, I += u);
          return T;
        }
        function E_(r) {
          for (var u = -1, c = r == null ? 0 : r.length, y = 0, I = []; ++u < c; ) {
            var P = r[u];
            P && (I[y++] = P);
          }
          return I;
        }
        function x_() {
          var r = arguments.length;
          if (!r)
            return [];
          for (var u = s(r - 1), c = arguments[0], y = r; y--; )
            u[y - 1] = arguments[y];
          return Tn(It(c) ? Ve(c) : [c], xe(u, 1));
        }
        var M_ = Rt(function(r, u) {
          return ae(r) ? sa(r, xe(u, 1, ae, !0)) : [];
        }), w_ = Rt(function(r, u) {
          var c = wn(u);
          return ae(c) && (c = a), ae(r) ? sa(r, xe(u, 1, ae, !0), yt(c, 2)) : [];
        }), S_ = Rt(function(r, u) {
          var c = wn(u);
          return ae(c) && (c = a), ae(r) ? sa(r, xe(u, 1, ae, !0), a, c) : [];
        });
        function I_(r, u, c) {
          var y = r == null ? 0 : r.length;
          return y ? (u = c || u === a ? 1 : Pt(u), Mn(r, u < 0 ? 0 : u, y)) : [];
        }
        function N_(r, u, c) {
          var y = r == null ? 0 : r.length;
          return y ? (u = c || u === a ? 1 : Pt(u), u = y - u, Mn(r, 0, u < 0 ? 0 : u)) : [];
        }
        function k_(r, u) {
          return r && r.length ? Lo(r, yt(u, 3), !0, !0) : [];
        }
        function P_(r, u) {
          return r && r.length ? Lo(r, yt(u, 3), !0) : [];
        }
        function C_(r, u, c, y) {
          var I = r == null ? 0 : r.length;
          return I ? (c && typeof c != "number" && Le(r, u, c) && (c = 0, y = I), xv(r, u, c, y)) : [];
        }
        function Wf(r, u, c) {
          var y = r == null ? 0 : r.length;
          if (!y)
            return -1;
          var I = c == null ? 0 : Pt(c);
          return I < 0 && (I = ve(y + I, 0)), _e(r, yt(u, 3), I);
        }
        function $f(r, u, c) {
          var y = r == null ? 0 : r.length;
          if (!y)
            return -1;
          var I = y - 1;
          return c !== a && (I = Pt(c), I = c < 0 ? ve(y + I, 0) : Ie(I, y - 1)), _e(r, yt(u, 3), I, !0);
        }
        function Hf(r) {
          var u = r == null ? 0 : r.length;
          return u ? xe(r, 1) : [];
        }
        function b_(r) {
          var u = r == null ? 0 : r.length;
          return u ? xe(r, Dt) : [];
        }
        function R_(r, u) {
          var c = r == null ? 0 : r.length;
          return c ? (u = u === a ? 1 : Pt(u), xe(r, u)) : [];
        }
        function T_(r) {
          for (var u = -1, c = r == null ? 0 : r.length, y = {}; ++u < c; ) {
            var I = r[u];
            y[I[0]] = I[1];
          }
          return y;
        }
        function Vf(r) {
          return r && r.length ? r[0] : a;
        }
        function A_(r, u, c) {
          var y = r == null ? 0 : r.length;
          if (!y)
            return -1;
          var I = c == null ? 0 : Pt(c);
          return I < 0 && (I = ve(y + I, 0)), yn(r, u, I);
        }
        function L_(r) {
          var u = r == null ? 0 : r.length;
          return u ? Mn(r, 0, -1) : [];
        }
        var O_ = Rt(function(r) {
          var u = Kt(r, Mh);
          return u.length && u[0] === r[0] ? ch(u) : [];
        }), G_ = Rt(function(r) {
          var u = wn(r), c = Kt(r, Mh);
          return u === wn(c) ? u = a : c.pop(), c.length && c[0] === r[0] ? ch(c, yt(u, 2)) : [];
        }), D_ = Rt(function(r) {
          var u = wn(r), c = Kt(r, Mh);
          return u = typeof u == "function" ? u : a, u && c.pop(), c.length && c[0] === r[0] ? ch(c, a, u) : [];
        });
        function F_(r, u) {
          return r == null ? "" : L0.call(r, u);
        }
        function wn(r) {
          var u = r == null ? 0 : r.length;
          return u ? r[u - 1] : a;
        }
        function q_(r, u, c) {
          var y = r == null ? 0 : r.length;
          if (!y)
            return -1;
          var I = y;
          return c !== a && (I = Pt(c), I = I < 0 ? ve(y + I, 0) : Ie(I, y - 1)), u === u ? yo(r, u, I) : _e(r, Xs, I, !0);
        }
        function B_(r, u) {
          return r && r.length ? sf(r, Pt(u)) : a;
        }
        var U_ = Rt(Zf);
        function Zf(r, u) {
          return r && r.length && u && u.length ? dh(r, u) : r;
        }
        function z_(r, u, c) {
          return r && r.length && u && u.length ? dh(r, u, yt(c, 2)) : r;
        }
        function Y_(r, u, c) {
          return r && r.length && u && u.length ? dh(r, u, a, c) : r;
        }
        var X_ = di(function(r, u) {
          var c = r == null ? 0 : r.length, y = uh(r, u);
          return uf(r, Kt(u, function(I) {
            return mi(I, c) ? +I : I;
          }).sort(yf)), y;
        });
        function W_(r, u) {
          var c = [];
          if (!(r && r.length))
            return c;
          var y = -1, I = [], P = r.length;
          for (u = yt(u, 3); ++y < P; ) {
            var T = r[y];
            u(T, y, r) && (c.push(T), I.push(y));
          }
          return uf(r, I), c;
        }
        function Gh(r) {
          return r == null ? r : F0.call(r);
        }
        function $_(r, u, c) {
          var y = r == null ? 0 : r.length;
          return y ? (c && typeof c != "number" && Le(r, u, c) ? (u = 0, c = y) : (u = u == null ? 0 : Pt(u), c = c === a ? y : Pt(c)), Mn(r, u, c)) : [];
        }
        function H_(r, u) {
          return Ao(r, u);
        }
        function V_(r, u, c) {
          return ph(r, u, yt(c, 2));
        }
        function Z_(r, u) {
          var c = r == null ? 0 : r.length;
          if (c) {
            var y = Ao(r, u);
            if (y < c && On(r[y], u))
              return y;
          }
          return -1;
        }
        function K_(r, u) {
          return Ao(r, u, !0);
        }
        function J_(r, u, c) {
          return ph(r, u, yt(c, 2), !0);
        }
        function Q_(r, u) {
          var c = r == null ? 0 : r.length;
          if (c) {
            var y = Ao(r, u, !0) - 1;
            if (On(r[y], u))
              return y;
          }
          return -1;
        }
        function j_(r) {
          return r && r.length ? lf(r) : [];
        }
        function td(r, u) {
          return r && r.length ? lf(r, yt(u, 2)) : [];
        }
        function ed(r) {
          var u = r == null ? 0 : r.length;
          return u ? Mn(r, 1, u) : [];
        }
        function nd(r, u, c) {
          return r && r.length ? (u = c || u === a ? 1 : Pt(u), Mn(r, 0, u < 0 ? 0 : u)) : [];
        }
        function id(r, u, c) {
          var y = r == null ? 0 : r.length;
          return y ? (u = c || u === a ? 1 : Pt(u), u = y - u, Mn(r, u < 0 ? 0 : u, y)) : [];
        }
        function rd(r, u) {
          return r && r.length ? Lo(r, yt(u, 3), !1, !0) : [];
        }
        function sd(r, u) {
          return r && r.length ? Lo(r, yt(u, 3)) : [];
        }
        var ad = Rt(function(r) {
          return Ti(xe(r, 1, ae, !0));
        }), od = Rt(function(r) {
          var u = wn(r);
          return ae(u) && (u = a), Ti(xe(r, 1, ae, !0), yt(u, 2));
        }), ud = Rt(function(r) {
          var u = wn(r);
          return u = typeof u == "function" ? u : a, Ti(xe(r, 1, ae, !0), a, u);
        });
        function hd(r) {
          return r && r.length ? Ti(r) : [];
        }
        function ld(r, u) {
          return r && r.length ? Ti(r, yt(u, 2)) : [];
        }
        function fd(r, u) {
          return u = typeof u == "function" ? u : a, r && r.length ? Ti(r, a, u) : [];
        }
        function Dh(r) {
          if (!(r && r.length))
            return [];
          var u = 0;
          return r = Bn(r, function(c) {
            if (ae(c))
              return u = ve(c.length, u), !0;
          }), Hs(u, function(c) {
            return Kt(r, Dr(c));
          });
        }
        function Kf(r, u) {
          if (!(r && r.length))
            return [];
          var c = Dh(r);
          return u == null ? c : Kt(c, function(y) {
            return Re(u, a, y);
          });
        }
        var cd = Rt(function(r, u) {
          return ae(r) ? sa(r, u) : [];
        }), gd = Rt(function(r) {
          return xh(Bn(r, ae));
        }), vd = Rt(function(r) {
          var u = wn(r);
          return ae(u) && (u = a), xh(Bn(r, ae), yt(u, 2));
        }), _d = Rt(function(r) {
          var u = wn(r);
          return u = typeof u == "function" ? u : a, xh(Bn(r, ae), a, u);
        }), dd = Rt(Dh);
        function md(r, u) {
          return vf(r || [], u || [], ra);
        }
        function yd(r, u) {
          return vf(r || [], u || [], ua);
        }
        var pd = Rt(function(r) {
          var u = r.length, c = u > 1 ? r[u - 1] : a;
          return c = typeof c == "function" ? (r.pop(), c) : a, Kf(r, c);
        });
        function Jf(r) {
          var u = k(r);
          return u.__chain__ = !0, u;
        }
        function Ed(r, u) {
          return u(r), r;
        }
        function Yo(r, u) {
          return u(r);
        }
        var xd = di(function(r) {
          var u = r.length, c = u ? r[0] : 0, y = this.__wrapped__, I = function(P) {
            return uh(P, r);
          };
          return u > 1 || this.__actions__.length || !(y instanceof Lt) || !mi(c) ? this.thru(I) : (y = y.slice(c, +c + (u ? 1 : 0)), y.__actions__.push({
            func: Yo,
            args: [I],
            thisArg: a
          }), new En(y, this.__chain__).thru(function(P) {
            return u && !P.length && P.push(a), P;
          }));
        });
        function Md() {
          return Jf(this);
        }
        function wd() {
          return new En(this.value(), this.__chain__);
        }
        function Sd() {
          this.__values__ === a && (this.__values__ = fc(this.value()));
          var r = this.__index__ >= this.__values__.length, u = r ? a : this.__values__[this.__index__++];
          return { done: r, value: u };
        }
        function Id() {
          return this;
        }
        function Nd(r) {
          for (var u, c = this; c instanceof Po; ) {
            var y = Xf(c);
            y.__index__ = 0, y.__values__ = a, u ? I.__wrapped__ = y : u = y;
            var I = y;
            c = c.__wrapped__;
          }
          return I.__wrapped__ = r, u;
        }
        function kd() {
          var r = this.__wrapped__;
          if (r instanceof Lt) {
            var u = r;
            return this.__actions__.length && (u = new Lt(this)), u = u.reverse(), u.__actions__.push({
              func: Yo,
              args: [Gh],
              thisArg: a
            }), new En(u, this.__chain__);
          }
          return this.thru(Gh);
        }
        function Pd() {
          return gf(this.__wrapped__, this.__actions__);
        }
        var Cd = Oo(function(r, u, c) {
          lt.call(r, c) ? ++r[c] : vi(r, c, 1);
        });
        function bd(r, u, c) {
          var y = It(r) ? fo : Ev;
          return c && Le(r, u, c) && (u = a), y(r, yt(u, 3));
        }
        function Rd(r, u) {
          var c = It(r) ? Bn : Zl;
          return c(r, yt(u, 3));
        }
        var Td = Sf(Wf), Ad = Sf($f);
        function Ld(r, u) {
          return xe(Xo(r, u), 1);
        }
        function Od(r, u) {
          return xe(Xo(r, u), Dt);
        }
        function Gd(r, u, c) {
          return c = c === a ? 1 : Pt(c), xe(Xo(r, u), c);
        }
        function Qf(r, u) {
          var c = It(r) ? $e : Ri;
          return c(r, yt(u, 3));
        }
        function jf(r, u) {
          var c = It(r) ? $u : Vl;
          return c(r, yt(u, 3));
        }
        var Dd = Oo(function(r, u, c) {
          lt.call(r, c) ? r[c].push(u) : vi(r, c, [u]);
        });
        function Fd(r, u, c, y) {
          r = Ze(r) ? r : Vr(r), c = c && !y ? Pt(c) : 0;
          var I = r.length;
          return c < 0 && (c = ve(I + c, 0)), Zo(r) ? c <= I && r.indexOf(u, c) > -1 : !!I && yn(r, u, c) > -1;
        }
        var qd = Rt(function(r, u, c) {
          var y = -1, I = typeof u == "function", P = Ze(r) ? s(r.length) : [];
          return Ri(r, function(T) {
            P[++y] = I ? Re(u, T, c) : aa(T, u, c);
          }), P;
        }), Bd = Oo(function(r, u, c) {
          vi(r, c, u);
        });
        function Xo(r, u) {
          var c = It(r) ? Kt : ef;
          return c(r, yt(u, 3));
        }
        function Ud(r, u, c, y) {
          return r == null ? [] : (It(u) || (u = u == null ? [] : [u]), c = y ? a : c, It(c) || (c = c == null ? [] : [c]), af(r, u, c));
        }
        var zd = Oo(function(r, u, c) {
          r[c ? 0 : 1].push(u);
        }, function() {
          return [[], []];
        });
        function Yd(r, u, c) {
          var y = It(r) ? Bs : go, I = arguments.length < 3;
          return y(r, yt(u, 4), c, I, Ri);
        }
        function Xd(r, u, c) {
          var y = It(r) ? Us : go, I = arguments.length < 3;
          return y(r, yt(u, 4), c, I, Vl);
        }
        function Wd(r, u) {
          var c = It(r) ? Bn : Zl;
          return c(r, Ho(yt(u, 3)));
        }
        function $d(r) {
          var u = It(r) ? Xl : Fv;
          return u(r);
        }
        function Hd(r, u, c) {
          (c ? Le(r, u, c) : u === a) ? u = 1 : u = Pt(u);
          var y = It(r) ? _v : qv;
          return y(r, u);
        }
        function Vd(r) {
          var u = It(r) ? dv : Uv;
          return u(r);
        }
        function Zd(r) {
          if (r == null)
            return 0;
          if (Ze(r))
            return Zo(r) ? li(r) : r.length;
          var u = Ne(r);
          return u == Se || u == Be ? r.size : vh(r).length;
        }
        function Kd(r, u, c) {
          var y = It(r) ? Gr : zv;
          return c && Le(r, u, c) && (u = a), y(r, yt(u, 3));
        }
        var Jd = Rt(function(r, u) {
          if (r == null)
            return [];
          var c = u.length;
          return c > 1 && Le(r, u[0], u[1]) ? u = [] : c > 2 && Le(u[0], u[1], u[2]) && (u = [u[0]]), af(r, xe(u, 1), []);
        }), Wo = R0 || function() {
          return ne.Date.now();
        };
        function Qd(r, u) {
          if (typeof u != "function")
            throw new q(d);
          return r = Pt(r), function() {
            if (--r < 1)
              return u.apply(this, arguments);
          };
        }
        function tc(r, u, c) {
          return u = c ? a : u, u = r && u == null ? r.length : u, _i(r, K, a, a, a, a, u);
        }
        function ec(r, u) {
          var c;
          if (typeof u != "function")
            throw new q(d);
          return r = Pt(r), function() {
            return --r > 0 && (c = u.apply(this, arguments)), r <= 1 && (u = a), c;
          };
        }
        var Fh = Rt(function(r, u, c) {
          var y = O;
          if (c.length) {
            var I = Un(c, $r(Fh));
            y |= X;
          }
          return _i(r, y, u, c, I);
        }), nc = Rt(function(r, u, c) {
          var y = O | B;
          if (c.length) {
            var I = Un(c, $r(nc));
            y |= X;
          }
          return _i(u, y, r, c, I);
        });
        function ic(r, u, c) {
          u = c ? a : u;
          var y = _i(r, Y, a, a, a, a, a, u);
          return y.placeholder = ic.placeholder, y;
        }
        function rc(r, u, c) {
          u = c ? a : u;
          var y = _i(r, W, a, a, a, a, a, u);
          return y.placeholder = rc.placeholder, y;
        }
        function sc(r, u, c) {
          var y, I, P, T, L, F, $ = 0, H = !1, J = !1, ot = !0;
          if (typeof r != "function")
            throw new q(d);
          u = Sn(u) || 0, Qt(c) && (H = !!c.leading, J = "maxWait" in c, P = J ? ve(Sn(c.maxWait) || 0, u) : P, ot = "trailing" in c ? !!c.trailing : ot);
          function ct(oe) {
            var Gn = y, Ei = I;
            return y = I = a, $ = oe, T = r.apply(Ei, Gn), T;
          }
          function Et(oe) {
            return $ = oe, L = fa(At, u), H ? ct(oe) : T;
          }
          function Ct(oe) {
            var Gn = oe - F, Ei = oe - $, Sc = u - Gn;
            return J ? Ie(Sc, P - Ei) : Sc;
          }
          function xt(oe) {
            var Gn = oe - F, Ei = oe - $;
            return F === a || Gn >= u || Gn < 0 || J && Ei >= P;
          }
          function At() {
            var oe = Wo();
            if (xt(oe))
              return Ot(oe);
            L = fa(At, Ct(oe));
          }
          function Ot(oe) {
            return L = a, ot && y ? ct(oe) : (y = I = a, T);
          }
          function gn() {
            L !== a && _f(L), $ = 0, y = F = I = L = a;
          }
          function Oe() {
            return L === a ? T : Ot(Wo());
          }
          function vn() {
            var oe = Wo(), Gn = xt(oe);
            if (y = arguments, I = this, F = oe, Gn) {
              if (L === a)
                return Et(F);
              if (J)
                return _f(L), L = fa(At, u), ct(F);
            }
            return L === a && (L = fa(At, u)), T;
          }
          return vn.cancel = gn, vn.flush = Oe, vn;
        }
        var jd = Rt(function(r, u) {
          return Hl(r, 1, u);
        }), tm = Rt(function(r, u, c) {
          return Hl(r, Sn(u) || 0, c);
        });
        function em(r) {
          return _i(r, j);
        }
        function $o(r, u) {
          if (typeof r != "function" || u != null && typeof u != "function")
            throw new q(d);
          var c = function() {
            var y = arguments, I = u ? u.apply(this, y) : y[0], P = c.cache;
            if (P.has(I))
              return P.get(I);
            var T = r.apply(this, y);
            return c.cache = P.set(I, T) || P, T;
          };
          return c.cache = new ($o.Cache || gi)(), c;
        }
        $o.Cache = gi;
        function Ho(r) {
          if (typeof r != "function")
            throw new q(d);
          return function() {
            var u = arguments;
            switch (u.length) {
              case 0:
                return !r.call(this);
              case 1:
                return !r.call(this, u[0]);
              case 2:
                return !r.call(this, u[0], u[1]);
              case 3:
                return !r.call(this, u[0], u[1], u[2]);
            }
            return !r.apply(this, u);
          };
        }
        function nm(r) {
          return ec(2, r);
        }
        var im = Yv(function(r, u) {
          u = u.length == 1 && It(u[0]) ? Kt(u[0], Te(yt())) : Kt(xe(u, 1), Te(yt()));
          var c = u.length;
          return Rt(function(y) {
            for (var I = -1, P = Ie(y.length, c); ++I < P; )
              y[I] = u[I].call(this, y[I]);
            return Re(r, this, y);
          });
        }), qh = Rt(function(r, u) {
          var c = Un(u, $r(qh));
          return _i(r, X, a, u, c);
        }), ac = Rt(function(r, u) {
          var c = Un(u, $r(ac));
          return _i(r, V, a, u, c);
        }), rm = di(function(r, u) {
          return _i(r, et, a, a, a, u);
        });
        function sm(r, u) {
          if (typeof r != "function")
            throw new q(d);
          return u = u === a ? u : Pt(u), Rt(r, u);
        }
        function am(r, u) {
          if (typeof r != "function")
            throw new q(d);
          return u = u == null ? 0 : ve(Pt(u), 0), Rt(function(c) {
            var y = c[u], I = Li(c, 0, u);
            return y && Tn(I, y), Re(r, this, I);
          });
        }
        function om(r, u, c) {
          var y = !0, I = !0;
          if (typeof r != "function")
            throw new q(d);
          return Qt(c) && (y = "leading" in c ? !!c.leading : y, I = "trailing" in c ? !!c.trailing : I), sc(r, u, {
            leading: y,
            maxWait: u,
            trailing: I
          });
        }
        function um(r) {
          return tc(r, 1);
        }
        function hm(r, u) {
          return qh(wh(u), r);
        }
        function lm() {
          if (!arguments.length)
            return [];
          var r = arguments[0];
          return It(r) ? r : [r];
        }
        function fm(r) {
          return xn(r, b);
        }
        function cm(r, u) {
          return u = typeof u == "function" ? u : a, xn(r, b, u);
        }
        function gm(r) {
          return xn(r, x | b);
        }
        function vm(r, u) {
          return u = typeof u == "function" ? u : a, xn(r, x | b, u);
        }
        function _m(r, u) {
          return u == null || $l(r, u, de(u));
        }
        function On(r, u) {
          return r === u || r !== r && u !== u;
        }
        var dm = qo(fh), mm = qo(function(r, u) {
          return r >= u;
        }), vr = Ql(/* @__PURE__ */ function() {
          return arguments;
        }()) ? Ql : function(r) {
          return ie(r) && lt.call(r, "callee") && !Br.call(r, "callee");
        }, It = s.isArray, ym = Fs ? Te(Fs) : Nv;
        function Ze(r) {
          return r != null && Vo(r.length) && !yi(r);
        }
        function ae(r) {
          return ie(r) && Ze(r);
        }
        function pm(r) {
          return r === !0 || r === !1 || ie(r) && Ae(r) == U;
        }
        var Oi = A0 || Kh, Em = hi ? Te(hi) : kv;
        function xm(r) {
          return ie(r) && r.nodeType === 1 && !ca(r);
        }
        function Mm(r) {
          if (r == null)
            return !0;
          if (Ze(r) && (It(r) || typeof r == "string" || typeof r.splice == "function" || Oi(r) || Hr(r) || vr(r)))
            return !r.length;
          var u = Ne(r);
          if (u == Se || u == Be)
            return !r.size;
          if (la(r))
            return !vh(r).length;
          for (var c in r)
            if (lt.call(r, c))
              return !1;
          return !0;
        }
        function wm(r, u) {
          return oa(r, u);
        }
        function Sm(r, u, c) {
          c = typeof c == "function" ? c : a;
          var y = c ? c(r, u) : a;
          return y === a ? oa(r, u, a, c) : !!y;
        }
        function Bh(r) {
          if (!ie(r))
            return !1;
          var u = Ae(r);
          return u == ft || u == Ht || typeof r.message == "string" && typeof r.name == "string" && !ca(r);
        }
        function Im(r) {
          return typeof r == "number" && Bl(r);
        }
        function yi(r) {
          if (!Qt(r))
            return !1;
          var u = Ae(r);
          return u == A || u == nn || u == Ua || u == tt;
        }
        function oc(r) {
          return typeof r == "number" && r == Pt(r);
        }
        function Vo(r) {
          return typeof r == "number" && r > -1 && r % 1 == 0 && r <= $t;
        }
        function Qt(r) {
          var u = typeof r;
          return r != null && (u == "object" || u == "function");
        }
        function ie(r) {
          return r != null && typeof r == "object";
        }
        var uc = ho ? Te(ho) : Cv;
        function Nm(r, u) {
          return r === u || gh(r, u, bh(u));
        }
        function km(r, u, c) {
          return c = typeof c == "function" ? c : a, gh(r, u, bh(u), c);
        }
        function Pm(r) {
          return hc(r) && r != +r;
        }
        function Cm(r) {
          if (c_(r))
            throw new _(v);
          return jl(r);
        }
        function bm(r) {
          return r === null;
        }
        function Rm(r) {
          return r == null;
        }
        function hc(r) {
          return typeof r == "number" || ie(r) && Ae(r) == qe;
        }
        function ca(r) {
          if (!ie(r) || Ae(r) != rn)
            return !1;
          var u = ar(r);
          if (u === null)
            return !0;
          var c = lt.call(u, "constructor") && u.constructor;
          return typeof c == "function" && c instanceof c && bt.call(c) == fi;
        }
        var Uh = un ? Te(un) : bv;
        function Tm(r) {
          return oc(r) && r >= -$t && r <= $t;
        }
        var lc = qs ? Te(qs) : Rv;
        function Zo(r) {
          return typeof r == "string" || !It(r) && ie(r) && Ae(r) == sn;
        }
        function cn(r) {
          return typeof r == "symbol" || ie(r) && Ae(r) == Mr;
        }
        var Hr = lo ? Te(lo) : Tv;
        function Am(r) {
          return r === a;
        }
        function Lm(r) {
          return ie(r) && Ne(r) == Cn;
        }
        function Om(r) {
          return ie(r) && Ae(r) == wr;
        }
        var Gm = qo(_h), Dm = qo(function(r, u) {
          return r <= u;
        });
        function fc(r) {
          if (!r)
            return [];
          if (Ze(r))
            return Zo(r) ? ln(r) : Ve(r);
          if (js && r[js])
            return mo(r[js]());
          var u = Ne(r), c = u == Se ? Fr : u == Be ? nr : Vr;
          return c(r);
        }
        function pi(r) {
          if (!r)
            return r === 0 ? r : 0;
          if (r = Sn(r), r === Dt || r === -Dt) {
            var u = r < 0 ? -1 : 1;
            return u * he;
          }
          return r === r ? r : 0;
        }
        function Pt(r) {
          var u = pi(r), c = u % 1;
          return u === u ? c ? u - c : u : 0;
        }
        function cc(r) {
          return r ? lr(Pt(r), 0, Zt) : 0;
        }
        function Sn(r) {
          if (typeof r == "number")
            return r;
          if (cn(r))
            return ht;
          if (Qt(r)) {
            var u = typeof r.valueOf == "function" ? r.valueOf() : r;
            r = Qt(u) ? u + "" : u;
          }
          if (typeof r != "string")
            return r === 0 ? r : +r;
          r = vo(r);
          var c = ii.test(r);
          return c || br.test(r) ? Xu(r.slice(2), c ? 2 : 8) : ni.test(r) ? ht : +r;
        }
        function gc(r) {
          return Yn(r, Ke(r));
        }
        function Fm(r) {
          return r ? lr(Pt(r), -$t, $t) : r === 0 ? r : 0;
        }
        function Ut(r) {
          return r == null ? "" : fn(r);
        }
        var qm = Xr(function(r, u) {
          if (la(u) || Ze(u)) {
            Yn(u, de(u), r);
            return;
          }
          for (var c in u)
            lt.call(u, c) && ra(r, c, u[c]);
        }), vc = Xr(function(r, u) {
          Yn(u, Ke(u), r);
        }), Ko = Xr(function(r, u, c, y) {
          Yn(u, Ke(u), r, y);
        }), Bm = Xr(function(r, u, c, y) {
          Yn(u, de(u), r, y);
        }), Um = di(uh);
        function zm(r, u) {
          var c = Yr(r);
          return u == null ? c : Wl(c, u);
        }
        var Ym = Rt(function(r, u) {
          r = N(r);
          var c = -1, y = u.length, I = y > 2 ? u[2] : a;
          for (I && Le(u[0], u[1], I) && (y = 1); ++c < y; )
            for (var P = u[c], T = Ke(P), L = -1, F = T.length; ++L < F; ) {
              var $ = T[L], H = r[$];
              (H === a || On(H, ut[$]) && !lt.call(r, $)) && (r[$] = P[$]);
            }
          return r;
        }), Xm = Rt(function(r) {
          return r.push(a, Rf), Re(_c, a, r);
        });
        function Wm(r, u) {
          return Ys(r, yt(u, 3), zn);
        }
        function $m(r, u) {
          return Ys(r, yt(u, 3), lh);
        }
        function Hm(r, u) {
          return r == null ? r : hh(r, yt(u, 3), Ke);
        }
        function Vm(r, u) {
          return r == null ? r : Kl(r, yt(u, 3), Ke);
        }
        function Zm(r, u) {
          return r && zn(r, yt(u, 3));
        }
        function Km(r, u) {
          return r && lh(r, yt(u, 3));
        }
        function Jm(r) {
          return r == null ? [] : Ro(r, de(r));
        }
        function Qm(r) {
          return r == null ? [] : Ro(r, Ke(r));
        }
        function zh(r, u, c) {
          var y = r == null ? a : fr(r, u);
          return y === a ? c : y;
        }
        function jm(r, u) {
          return r != null && Lf(r, u, Mv);
        }
        function Yh(r, u) {
          return r != null && Lf(r, u, wv);
        }
        var t1 = Nf(function(r, u, c) {
          u != null && typeof u.toString != "function" && (u = se.call(u)), r[u] = c;
        }, Wh(Je)), e1 = Nf(function(r, u, c) {
          u != null && typeof u.toString != "function" && (u = se.call(u)), lt.call(r, u) ? r[u].push(c) : r[u] = [c];
        }, yt), n1 = Rt(aa);
        function de(r) {
          return Ze(r) ? Yl(r) : vh(r);
        }
        function Ke(r) {
          return Ze(r) ? Yl(r, !0) : Av(r);
        }
        function i1(r, u) {
          var c = {};
          return u = yt(u, 3), zn(r, function(y, I, P) {
            vi(c, u(y, I, P), y);
          }), c;
        }
        function r1(r, u) {
          var c = {};
          return u = yt(u, 3), zn(r, function(y, I, P) {
            vi(c, I, u(y, I, P));
          }), c;
        }
        var s1 = Xr(function(r, u, c) {
          To(r, u, c);
        }), _c = Xr(function(r, u, c, y) {
          To(r, u, c, y);
        }), a1 = di(function(r, u) {
          var c = {};
          if (r == null)
            return c;
          var y = !1;
          u = Kt(u, function(P) {
            return P = Ai(P, r), y || (y = P.length > 1), P;
          }), Yn(r, Ph(r), c), y && (c = xn(c, x | w | b, t_));
          for (var I = u.length; I--; )
            Eh(c, u[I]);
          return c;
        });
        function o1(r, u) {
          return dc(r, Ho(yt(u)));
        }
        var u1 = di(function(r, u) {
          return r == null ? {} : Ov(r, u);
        });
        function dc(r, u) {
          if (r == null)
            return {};
          var c = Kt(Ph(r), function(y) {
            return [y];
          });
          return u = yt(u), of(r, c, function(y, I) {
            return u(y, I[0]);
          });
        }
        function h1(r, u, c) {
          u = Ai(u, r);
          var y = -1, I = u.length;
          for (I || (I = 1, r = a); ++y < I; ) {
            var P = r == null ? a : r[Xn(u[y])];
            P === a && (y = I, P = c), r = yi(P) ? P.call(r) : P;
          }
          return r;
        }
        function l1(r, u, c) {
          return r == null ? r : ua(r, u, c);
        }
        function f1(r, u, c, y) {
          return y = typeof y == "function" ? y : a, r == null ? r : ua(r, u, c, y);
        }
        var mc = Cf(de), yc = Cf(Ke);
        function c1(r, u, c) {
          var y = It(r), I = y || Oi(r) || Hr(r);
          if (u = yt(u, 4), c == null) {
            var P = r && r.constructor;
            I ? c = y ? new P() : [] : Qt(r) ? c = yi(P) ? Yr(ar(r)) : {} : c = {};
          }
          return (I ? $e : zn)(r, function(T, L, F) {
            return u(c, T, L, F);
          }), c;
        }
        function g1(r, u) {
          return r == null ? !0 : Eh(r, u);
        }
        function v1(r, u, c) {
          return r == null ? r : cf(r, u, wh(c));
        }
        function _1(r, u, c, y) {
          return y = typeof y == "function" ? y : a, r == null ? r : cf(r, u, wh(c), y);
        }
        function Vr(r) {
          return r == null ? [] : Vs(r, de(r));
        }
        function d1(r) {
          return r == null ? [] : Vs(r, Ke(r));
        }
        function m1(r, u, c) {
          return c === a && (c = u, u = a), c !== a && (c = Sn(c), c = c === c ? c : 0), u !== a && (u = Sn(u), u = u === u ? u : 0), lr(Sn(r), u, c);
        }
        function y1(r, u, c) {
          return u = pi(u), c === a ? (c = u, u = 0) : c = pi(c), r = Sn(r), Sv(r, u, c);
        }
        function p1(r, u, c) {
          if (c && typeof c != "boolean" && Le(r, u, c) && (u = c = a), c === a && (typeof u == "boolean" ? (c = u, u = a) : typeof r == "boolean" && (c = r, r = a)), r === a && u === a ? (r = 0, u = 1) : (r = pi(r), u === a ? (u = r, r = 0) : u = pi(u)), r > u) {
            var y = r;
            r = u, u = y;
          }
          if (c || r % 1 || u % 1) {
            var I = Ul();
            return Ie(r + I * (u - r + uo("1e-" + ((I + "").length - 1))), u);
          }
          return mh(r, u);
        }
        var E1 = Wr(function(r, u, c) {
          return u = u.toLowerCase(), r + (c ? pc(u) : u);
        });
        function pc(r) {
          return Xh(Ut(r).toLowerCase());
        }
        function Ec(r) {
          return r = Ut(r), r && r.replace(re, Ju).replace(Or, "");
        }
        function x1(r, u, c) {
          r = Ut(r), u = fn(u);
          var y = r.length;
          c = c === a ? y : lr(Pt(c), 0, y);
          var I = c;
          return c -= u.length, c >= 0 && r.slice(c, I) == u;
        }
        function M1(r) {
          return r = Ut(r), r && Gu.test(r) ? r.replace(Es, Qu) : r;
        }
        function w1(r) {
          return r = Ut(r), r && xs.test(r) ? r.replace(kr, "\\$&") : r;
        }
        var S1 = Wr(function(r, u, c) {
          return r + (c ? "-" : "") + u.toLowerCase();
        }), I1 = Wr(function(r, u, c) {
          return r + (c ? " " : "") + u.toLowerCase();
        }), N1 = wf("toLowerCase");
        function k1(r, u, c) {
          r = Ut(r), u = Pt(u);
          var y = u ? li(r) : 0;
          if (!u || y >= u)
            return r;
          var I = (u - y) / 2;
          return Fo(Io(I), c) + r + Fo(So(I), c);
        }
        function P1(r, u, c) {
          r = Ut(r), u = Pt(u);
          var y = u ? li(r) : 0;
          return u && y < u ? r + Fo(u - y, c) : r;
        }
        function C1(r, u, c) {
          r = Ut(r), u = Pt(u);
          var y = u ? li(r) : 0;
          return u && y < u ? Fo(u - y, c) + r : r;
        }
        function b1(r, u, c) {
          return c || u == null ? u = 0 : u && (u = +u), D0(Ut(r).replace(Pr, ""), u || 0);
        }
        function R1(r, u, c) {
          return (c ? Le(r, u, c) : u === a) ? u = 1 : u = Pt(u), yh(Ut(r), u);
        }
        function T1() {
          var r = arguments, u = Ut(r[0]);
          return r.length < 3 ? u : u.replace(r[1], r[2]);
        }
        var A1 = Wr(function(r, u, c) {
          return r + (c ? "_" : "") + u.toLowerCase();
        });
        function L1(r, u, c) {
          return c && typeof c != "number" && Le(r, u, c) && (u = c = a), c = c === a ? Zt : c >>> 0, c ? (r = Ut(r), r && (typeof u == "string" || u != null && !Uh(u)) && (u = fn(u), !u && Ci(r)) ? Li(ln(r), 0, c) : r.split(u, c)) : [];
        }
        var O1 = Wr(function(r, u, c) {
          return r + (c ? " " : "") + Xh(u);
        });
        function G1(r, u, c) {
          return r = Ut(r), c = c == null ? 0 : lr(Pt(c), 0, r.length), u = fn(u), r.slice(c, c + u.length) == u;
        }
        function D1(r, u, c) {
          var y = k.templateSettings;
          c && Le(r, u, c) && (u = a), r = Ut(r), u = Ko({}, u, y, bf);
          var I = Ko({}, u.imports, y.imports, bf), P = de(I), T = Vs(I, P), L, F, $ = 0, H = u.interpolate || Rr, J = "__p += '", ot = R(
            (u.escape || Rr).source + "|" + H.source + "|" + (H === nt ? Ms : Rr).source + "|" + (u.evaluate || Rr).source + "|$",
            "g"
          ), ct = "//# sourceURL=" + (lt.call(u, "sourceURL") ? (u.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++so + "]") + `
`;
          r.replace(ot, function(xt, At, Ot, gn, Oe, vn) {
            return Ot || (Ot = gn), J += r.slice($, vn).replace(qu, ju), At && (L = !0, J += `' +
__e(` + At + `) +
'`), Oe && (F = !0, J += `';
` + Oe + `;
__p += '`), Ot && (J += `' +
((__t = (` + Ot + `)) == null ? '' : __t) +
'`), $ = vn + xt.length, xt;
          }), J += `';
`;
          var Et = lt.call(u, "variable") && u.variable;
          if (!Et)
            J = `with (obj) {
` + J + `
}
`;
          else if (Fu.test(Et))
            throw new _(g);
          J = (F ? J.replace(ps, "") : J).replace(Ue, "$1").replace(Zi, "$1;"), J = "function(" + (Et || "obj") + `) {
` + (Et ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (L ? ", __e = _.escape" : "") + (F ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + J + `return __p
}`;
          var Ct = Mc(function() {
            return m(P, ct + "return " + J).apply(a, T);
          });
          if (Ct.source = J, Bh(Ct))
            throw Ct;
          return Ct;
        }
        function F1(r) {
          return Ut(r).toLowerCase();
        }
        function q1(r) {
          return Ut(r).toUpperCase();
        }
        function B1(r, u, c) {
          if (r = Ut(r), r && (c || u === a))
            return vo(r);
          if (!r || !(u = fn(u)))
            return r;
          var y = ln(r), I = ln(u), P = _o(y, I), T = Zs(y, I) + 1;
          return Li(y, P, T).join("");
        }
        function U1(r, u, c) {
          if (r = Ut(r), r && (c || u === a))
            return r.slice(0, po(r) + 1);
          if (!r || !(u = fn(u)))
            return r;
          var y = ln(r), I = Zs(y, ln(u)) + 1;
          return Li(y, 0, I).join("");
        }
        function z1(r, u, c) {
          if (r = Ut(r), r && (c || u === a))
            return r.replace(Pr, "");
          if (!r || !(u = fn(u)))
            return r;
          var y = ln(r), I = _o(y, ln(u));
          return Li(y, I).join("");
        }
        function Y1(r, u) {
          var c = vt, y = _t;
          if (Qt(u)) {
            var I = "separator" in u ? u.separator : I;
            c = "length" in u ? Pt(u.length) : c, y = "omission" in u ? fn(u.omission) : y;
          }
          r = Ut(r);
          var P = r.length;
          if (Ci(r)) {
            var T = ln(r);
            P = T.length;
          }
          if (c >= P)
            return r;
          var L = c - li(y);
          if (L < 1)
            return y;
          var F = T ? Li(T, 0, L).join("") : r.slice(0, L);
          if (I === a)
            return F + y;
          if (T && (L += F.length - L), Uh(I)) {
            if (r.slice(L).search(I)) {
              var $, H = F;
              for (I.global || (I = R(I.source, Ut(Ii.exec(I)) + "g")), I.lastIndex = 0; $ = I.exec(H); )
                var J = $.index;
              F = F.slice(0, J === a ? L : J);
            }
          } else if (r.indexOf(fn(I), L) != L) {
            var ot = F.lastIndexOf(I);
            ot > -1 && (F = F.slice(0, ot));
          }
          return F + y;
        }
        function X1(r) {
          return r = Ut(r), r && Sr.test(r) ? r.replace(on, bi) : r;
        }
        var W1 = Wr(function(r, u, c) {
          return r + (c ? " " : "") + u.toUpperCase();
        }), Xh = wf("toUpperCase");
        function xc(r, u, c) {
          return r = Ut(r), u = c ? a : u, u === a ? eh(r) ? He(r) : hn(r) : r.match(u) || [];
        }
        var Mc = Rt(function(r, u) {
          try {
            return Re(r, a, u);
          } catch (c) {
            return Bh(c) ? c : new _(c);
          }
        }), $1 = di(function(r, u) {
          return $e(u, function(c) {
            c = Xn(c), vi(r, c, Fh(r[c], r));
          }), r;
        });
        function H1(r) {
          var u = r == null ? 0 : r.length, c = yt();
          return r = u ? Kt(r, function(y) {
            if (typeof y[1] != "function")
              throw new q(d);
            return [c(y[0]), y[1]];
          }) : [], Rt(function(y) {
            for (var I = -1; ++I < u; ) {
              var P = r[I];
              if (Re(P[0], this, y))
                return Re(P[1], this, y);
            }
          });
        }
        function V1(r) {
          return pv(xn(r, x));
        }
        function Wh(r) {
          return function() {
            return r;
          };
        }
        function Z1(r, u) {
          return r == null || r !== r ? u : r;
        }
        var K1 = If(), J1 = If(!0);
        function Je(r) {
          return r;
        }
        function $h(r) {
          return tf(typeof r == "function" ? r : xn(r, x));
        }
        function Q1(r) {
          return nf(xn(r, x));
        }
        function j1(r, u) {
          return rf(r, xn(u, x));
        }
        var ty = Rt(function(r, u) {
          return function(c) {
            return aa(c, r, u);
          };
        }), ey = Rt(function(r, u) {
          return function(c) {
            return aa(r, c, u);
          };
        });
        function Hh(r, u, c) {
          var y = de(u), I = Ro(u, y);
          c == null && !(Qt(u) && (I.length || !y.length)) && (c = u, u = r, r = this, I = Ro(u, de(u)));
          var P = !(Qt(c) && "chain" in c) || !!c.chain, T = yi(r);
          return $e(I, function(L) {
            var F = u[L];
            r[L] = F, T && (r.prototype[L] = function() {
              var $ = this.__chain__;
              if (P || $) {
                var H = r(this.__wrapped__), J = H.__actions__ = Ve(this.__actions__);
                return J.push({ func: F, args: arguments, thisArg: r }), H.__chain__ = $, H;
              }
              return F.apply(r, Tn([this.value()], arguments));
            });
          }), r;
        }
        function ny() {
          return ne._ === this && (ne._ = ir), this;
        }
        function Vh() {
        }
        function iy(r) {
          return r = Pt(r), Rt(function(u) {
            return sf(u, r);
          });
        }
        var ry = Ih(Kt), sy = Ih(fo), ay = Ih(Gr);
        function wc(r) {
          return Th(r) ? Dr(Xn(r)) : Gv(r);
        }
        function oy(r) {
          return function(u) {
            return r == null ? a : fr(r, u);
          };
        }
        var uy = kf(), hy = kf(!0);
        function Zh() {
          return [];
        }
        function Kh() {
          return !1;
        }
        function ly() {
          return {};
        }
        function fy() {
          return "";
        }
        function cy() {
          return !0;
        }
        function gy(r, u) {
          if (r = Pt(r), r < 1 || r > $t)
            return [];
          var c = Zt, y = Ie(r, Zt);
          u = yt(u), r -= Zt;
          for (var I = Hs(y, u); ++c < r; )
            u(c);
          return I;
        }
        function vy(r) {
          return It(r) ? Kt(r, Xn) : cn(r) ? [r] : Ve(Yf(Ut(r)));
        }
        function _y(r) {
          var u = ++Wt;
          return Ut(r) + u;
        }
        var dy = Do(function(r, u) {
          return r + u;
        }, 0), my = Nh("ceil"), yy = Do(function(r, u) {
          return r / u;
        }, 1), py = Nh("floor");
        function Ey(r) {
          return r && r.length ? bo(r, Je, fh) : a;
        }
        function xy(r, u) {
          return r && r.length ? bo(r, yt(u, 2), fh) : a;
        }
        function My(r) {
          return Ws(r, Je);
        }
        function wy(r, u) {
          return Ws(r, yt(u, 2));
        }
        function Sy(r) {
          return r && r.length ? bo(r, Je, _h) : a;
        }
        function Iy(r, u) {
          return r && r.length ? bo(r, yt(u, 2), _h) : a;
        }
        var Ny = Do(function(r, u) {
          return r * u;
        }, 1), ky = Nh("round"), Py = Do(function(r, u) {
          return r - u;
        }, 0);
        function Cy(r) {
          return r && r.length ? $s(r, Je) : 0;
        }
        function by(r, u) {
          return r && r.length ? $s(r, yt(u, 2)) : 0;
        }
        return k.after = Qd, k.ary = tc, k.assign = qm, k.assignIn = vc, k.assignInWith = Ko, k.assignWith = Bm, k.at = Um, k.before = ec, k.bind = Fh, k.bindAll = $1, k.bindKey = nc, k.castArray = lm, k.chain = Jf, k.chunk = p_, k.compact = E_, k.concat = x_, k.cond = H1, k.conforms = V1, k.constant = Wh, k.countBy = Cd, k.create = zm, k.curry = ic, k.curryRight = rc, k.debounce = sc, k.defaults = Ym, k.defaultsDeep = Xm, k.defer = jd, k.delay = tm, k.difference = M_, k.differenceBy = w_, k.differenceWith = S_, k.drop = I_, k.dropRight = N_, k.dropRightWhile = k_, k.dropWhile = P_, k.fill = C_, k.filter = Rd, k.flatMap = Ld, k.flatMapDeep = Od, k.flatMapDepth = Gd, k.flatten = Hf, k.flattenDeep = b_, k.flattenDepth = R_, k.flip = em, k.flow = K1, k.flowRight = J1, k.fromPairs = T_, k.functions = Jm, k.functionsIn = Qm, k.groupBy = Dd, k.initial = L_, k.intersection = O_, k.intersectionBy = G_, k.intersectionWith = D_, k.invert = t1, k.invertBy = e1, k.invokeMap = qd, k.iteratee = $h, k.keyBy = Bd, k.keys = de, k.keysIn = Ke, k.map = Xo, k.mapKeys = i1, k.mapValues = r1, k.matches = Q1, k.matchesProperty = j1, k.memoize = $o, k.merge = s1, k.mergeWith = _c, k.method = ty, k.methodOf = ey, k.mixin = Hh, k.negate = Ho, k.nthArg = iy, k.omit = a1, k.omitBy = o1, k.once = nm, k.orderBy = Ud, k.over = ry, k.overArgs = im, k.overEvery = sy, k.overSome = ay, k.partial = qh, k.partialRight = ac, k.partition = zd, k.pick = u1, k.pickBy = dc, k.property = wc, k.propertyOf = oy, k.pull = U_, k.pullAll = Zf, k.pullAllBy = z_, k.pullAllWith = Y_, k.pullAt = X_, k.range = uy, k.rangeRight = hy, k.rearg = rm, k.reject = Wd, k.remove = W_, k.rest = sm, k.reverse = Gh, k.sampleSize = Hd, k.set = l1, k.setWith = f1, k.shuffle = Vd, k.slice = $_, k.sortBy = Jd, k.sortedUniq = j_, k.sortedUniqBy = td, k.split = L1, k.spread = am, k.tail = ed, k.take = nd, k.takeRight = id, k.takeRightWhile = rd, k.takeWhile = sd, k.tap = Ed, k.throttle = om, k.thru = Yo, k.toArray = fc, k.toPairs = mc, k.toPairsIn = yc, k.toPath = vy, k.toPlainObject = gc, k.transform = c1, k.unary = um, k.union = ad, k.unionBy = od, k.unionWith = ud, k.uniq = hd, k.uniqBy = ld, k.uniqWith = fd, k.unset = g1, k.unzip = Dh, k.unzipWith = Kf, k.update = v1, k.updateWith = _1, k.values = Vr, k.valuesIn = d1, k.without = cd, k.words = xc, k.wrap = hm, k.xor = gd, k.xorBy = vd, k.xorWith = _d, k.zip = dd, k.zipObject = md, k.zipObjectDeep = yd, k.zipWith = pd, k.entries = mc, k.entriesIn = yc, k.extend = vc, k.extendWith = Ko, Hh(k, k), k.add = dy, k.attempt = Mc, k.camelCase = E1, k.capitalize = pc, k.ceil = my, k.clamp = m1, k.clone = fm, k.cloneDeep = gm, k.cloneDeepWith = vm, k.cloneWith = cm, k.conformsTo = _m, k.deburr = Ec, k.defaultTo = Z1, k.divide = yy, k.endsWith = x1, k.eq = On, k.escape = M1, k.escapeRegExp = w1, k.every = bd, k.find = Td, k.findIndex = Wf, k.findKey = Wm, k.findLast = Ad, k.findLastIndex = $f, k.findLastKey = $m, k.floor = py, k.forEach = Qf, k.forEachRight = jf, k.forIn = Hm, k.forInRight = Vm, k.forOwn = Zm, k.forOwnRight = Km, k.get = zh, k.gt = dm, k.gte = mm, k.has = jm, k.hasIn = Yh, k.head = Vf, k.identity = Je, k.includes = Fd, k.indexOf = A_, k.inRange = y1, k.invoke = n1, k.isArguments = vr, k.isArray = It, k.isArrayBuffer = ym, k.isArrayLike = Ze, k.isArrayLikeObject = ae, k.isBoolean = pm, k.isBuffer = Oi, k.isDate = Em, k.isElement = xm, k.isEmpty = Mm, k.isEqual = wm, k.isEqualWith = Sm, k.isError = Bh, k.isFinite = Im, k.isFunction = yi, k.isInteger = oc, k.isLength = Vo, k.isMap = uc, k.isMatch = Nm, k.isMatchWith = km, k.isNaN = Pm, k.isNative = Cm, k.isNil = Rm, k.isNull = bm, k.isNumber = hc, k.isObject = Qt, k.isObjectLike = ie, k.isPlainObject = ca, k.isRegExp = Uh, k.isSafeInteger = Tm, k.isSet = lc, k.isString = Zo, k.isSymbol = cn, k.isTypedArray = Hr, k.isUndefined = Am, k.isWeakMap = Lm, k.isWeakSet = Om, k.join = F_, k.kebabCase = S1, k.last = wn, k.lastIndexOf = q_, k.lowerCase = I1, k.lowerFirst = N1, k.lt = Gm, k.lte = Dm, k.max = Ey, k.maxBy = xy, k.mean = My, k.meanBy = wy, k.min = Sy, k.minBy = Iy, k.stubArray = Zh, k.stubFalse = Kh, k.stubObject = ly, k.stubString = fy, k.stubTrue = cy, k.multiply = Ny, k.nth = B_, k.noConflict = ny, k.noop = Vh, k.now = Wo, k.pad = k1, k.padEnd = P1, k.padStart = C1, k.parseInt = b1, k.random = p1, k.reduce = Yd, k.reduceRight = Xd, k.repeat = R1, k.replace = T1, k.result = h1, k.round = ky, k.runInContext = t, k.sample = $d, k.size = Zd, k.snakeCase = A1, k.some = Kd, k.sortedIndex = H_, k.sortedIndexBy = V_, k.sortedIndexOf = Z_, k.sortedLastIndex = K_, k.sortedLastIndexBy = J_, k.sortedLastIndexOf = Q_, k.startCase = O1, k.startsWith = G1, k.subtract = Py, k.sum = Cy, k.sumBy = by, k.template = D1, k.times = gy, k.toFinite = pi, k.toInteger = Pt, k.toLength = cc, k.toLower = F1, k.toNumber = Sn, k.toSafeInteger = Fm, k.toString = Ut, k.toUpper = q1, k.trim = B1, k.trimEnd = U1, k.trimStart = z1, k.truncate = Y1, k.unescape = X1, k.uniqueId = _y, k.upperCase = W1, k.upperFirst = Xh, k.each = Qf, k.eachRight = jf, k.first = Vf, Hh(k, function() {
          var r = {};
          return zn(k, function(u, c) {
            lt.call(k.prototype, c) || (r[c] = u);
          }), r;
        }(), { chain: !1 }), k.VERSION = h, $e(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(r) {
          k[r].placeholder = k;
        }), $e(["drop", "take"], function(r, u) {
          Lt.prototype[r] = function(c) {
            c = c === a ? 1 : ve(Pt(c), 0);
            var y = this.__filtered__ && !u ? new Lt(this) : this.clone();
            return y.__filtered__ ? y.__takeCount__ = Ie(c, y.__takeCount__) : y.__views__.push({
              size: Ie(c, Zt),
              type: r + (y.__dir__ < 0 ? "Right" : "")
            }), y;
          }, Lt.prototype[r + "Right"] = function(c) {
            return this.reverse()[r](c).reverse();
          };
        }), $e(["filter", "map", "takeWhile"], function(r, u) {
          var c = u + 1, y = c == it || c == Gt;
          Lt.prototype[r] = function(I) {
            var P = this.clone();
            return P.__iteratees__.push({
              iteratee: yt(I, 3),
              type: c
            }), P.__filtered__ = P.__filtered__ || y, P;
          };
        }), $e(["head", "last"], function(r, u) {
          var c = "take" + (u ? "Right" : "");
          Lt.prototype[r] = function() {
            return this[c](1).value()[0];
          };
        }), $e(["initial", "tail"], function(r, u) {
          var c = "drop" + (u ? "" : "Right");
          Lt.prototype[r] = function() {
            return this.__filtered__ ? new Lt(this) : this[c](1);
          };
        }), Lt.prototype.compact = function() {
          return this.filter(Je);
        }, Lt.prototype.find = function(r) {
          return this.filter(r).head();
        }, Lt.prototype.findLast = function(r) {
          return this.reverse().find(r);
        }, Lt.prototype.invokeMap = Rt(function(r, u) {
          return typeof r == "function" ? new Lt(this) : this.map(function(c) {
            return aa(c, r, u);
          });
        }), Lt.prototype.reject = function(r) {
          return this.filter(Ho(yt(r)));
        }, Lt.prototype.slice = function(r, u) {
          r = Pt(r);
          var c = this;
          return c.__filtered__ && (r > 0 || u < 0) ? new Lt(c) : (r < 0 ? c = c.takeRight(-r) : r && (c = c.drop(r)), u !== a && (u = Pt(u), c = u < 0 ? c.dropRight(-u) : c.take(u - r)), c);
        }, Lt.prototype.takeRightWhile = function(r) {
          return this.reverse().takeWhile(r).reverse();
        }, Lt.prototype.toArray = function() {
          return this.take(Zt);
        }, zn(Lt.prototype, function(r, u) {
          var c = /^(?:filter|find|map|reject)|While$/.test(u), y = /^(?:head|last)$/.test(u), I = k[y ? "take" + (u == "last" ? "Right" : "") : u], P = y || /^find/.test(u);
          I && (k.prototype[u] = function() {
            var T = this.__wrapped__, L = y ? [1] : arguments, F = T instanceof Lt, $ = L[0], H = F || It(T), J = function(At) {
              var Ot = I.apply(k, Tn([At], L));
              return y && ot ? Ot[0] : Ot;
            };
            H && c && typeof $ == "function" && $.length != 1 && (F = H = !1);
            var ot = this.__chain__, ct = !!this.__actions__.length, Et = P && !ot, Ct = F && !ct;
            if (!P && H) {
              T = Ct ? T : new Lt(this);
              var xt = r.apply(T, L);
              return xt.__actions__.push({ func: Yo, args: [J], thisArg: a }), new En(xt, ot);
            }
            return Et && Ct ? r.apply(this, L) : (xt = this.thru(J), Et ? y ? xt.value()[0] : xt.value() : xt);
          });
        }), $e(["pop", "push", "shift", "sort", "splice", "unshift"], function(r) {
          var u = Z[r], c = /^(?:push|sort|unshift)$/.test(r) ? "tap" : "thru", y = /^(?:pop|shift)$/.test(r);
          k.prototype[r] = function() {
            var I = arguments;
            if (y && !this.__chain__) {
              var P = this.value();
              return u.apply(It(P) ? P : [], I);
            }
            return this[c](function(T) {
              return u.apply(It(T) ? T : [], I);
            });
          };
        }), zn(Lt.prototype, function(r, u) {
          var c = k[u];
          if (c) {
            var y = c.name + "";
            lt.call(zr, y) || (zr[y] = []), zr[y].push({ name: u, func: c });
          }
        }), zr[Go(a, B).name] = [{
          name: "wrapper",
          func: a
        }], Lt.prototype.clone = X0, Lt.prototype.reverse = W0, Lt.prototype.value = $0, k.prototype.at = xd, k.prototype.chain = Md, k.prototype.commit = wd, k.prototype.next = Sd, k.prototype.plant = Nd, k.prototype.reverse = kd, k.prototype.toJSON = k.prototype.valueOf = k.prototype.value = Pd, k.prototype.first = k.prototype.head, js && (k.prototype[js] = Id), k;
      }, o = pn();
      fe ? ((fe.exports = o)._ = o, Gs._ = o) : ne._ = o;
    }).call(mw);
  }(Ma, Ma.exports)), Ma.exports;
}
var pw = yw();
function Ew(n, i) {
  let a = i.features;
  const h = [];
  for (; a.length > 0; ) {
    a = pw.sortBy(a, (d) => {
      if (d.geometry && d.geometry.coordinates && d.geometry.coordinates[0])
        return Hn(n, d.geometry.coordinates[0]);
      throw new Error("Feature missing geometry");
    });
    const f = a.shift(), v = f.geometry.coordinates[f.geometry.coordinates.length - 1];
    v && (n = v), h.push(f);
  }
  return h;
}
class Ba {
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
    const { lowerX: a, upperX: h, lowerY: f, upperY: v, customCenter: d } = i;
    this.lowerX = a, this.upperX = h, this.lowerY = f, this.upperY = v, this.customCenter = d, this.bottomLeft = [this.lowerX, this.lowerY], this.bottomRight = [this.upperX, this.lowerY], this.topLeft = [this.lowerX, this.upperY], this.topRight = [this.upperX, this.upperY], this.center = this.customCenter ?? [
      (this.lowerX + this.upperX) / 2,
      (this.lowerY + this.upperY) / 2
    ], this.flatten = [this.lowerX, this.lowerY, this.upperX, this.upperY];
  }
  isInBounds(i, a) {
    return typeof i == "number" ? i >= this.lowerX && i <= this.upperX && a >= this.lowerY && a <= this.upperY : this.isInBounds(i[0], i[1]);
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
      if (i.find((a) => !this.isInBounds(a))) {
        const a = WM(this.flatten), h = dw(Pu(i), a);
        return i[0] && (h.features = Ew(i[0], h)), h.features.map((f) => ({
          coordinates: f.geometry.coordinates,
          isWithinBounds: qM(f.geometry.coordinates).features.every(
            (v) => t4(v, a)
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
const cs = 15.5, m0 = 8, Aa = 2 * Math.PI * De / 256;
class y0 {
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
      label: h,
      proj4transformationMatrix: f,
      bounds: v,
      technicalName: d,
      usesMercatorPyramid: g = !1
    } = i;
    this.epsgNumber = a, this.epsg = `EPSG:${a}`, this.label = h, this.proj4transformationMatrix = f, this.bounds = v, this.technicalName = d, this.usesMercatorPyramid = g;
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
      const a = _n(this.epsg, i.epsg, this.bounds.bottomLeft), h = _n(this.epsg, i.epsg, this.bounds.topRight);
      let f;
      return this.bounds.customCenter && (f = _n(this.epsg, i.epsg, this.bounds.customCenter)), new Ba({
        lowerX: a[0],
        lowerY: a[1],
        upperX: h[0],
        upperY: h[1],
        customCenter: f
      });
    }
  }
  /**
   * Tells if a coordinate is in bound of this coordinate system.
   *
   * Will return false if no bounds are defined for this coordinate system
   */
  isInBounds(i, a) {
    return this.bounds ? typeof i == "number" ? this.bounds.isInBounds(i, a) : this.bounds.isInBounds(i[0], i[1]) : !1;
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
    return Yi(i, 3);
  }
  /**
   * A (descending) list of all the available resolution steps for this coordinate system. If this
   * is not the behavior you want, you have to override this function.
   */
  getResolutionSteps(i) {
    if (!this.bounds)
      return [];
    const a = Aa, h = [], f = (i ?? 0) * Math.PI / 180;
    for (let v = 0; v < 21; ++v)
      h.push({
        resolution: a * Math.cos(f) / Math.pow(2, v),
        zoom: v
      });
    return h;
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
class xw extends y0 {
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
const $n = [
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
], p0 = [
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
  ...$n.slice(0, 10),
  // see table https://api3.geo.admin.ch/services/sdiservices.html#gettile
  // LV95 doesn't support zoom level 10 at 1.5 resolution, so we need to split
  // the resolution and add it here
  1.5,
  ...$n.slice(10)
], In = [
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
  cs,
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
], Mw = [
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
], ww = In.map(
  (n, i) => i
);
class E0 extends xw {
  getResolutionSteps() {
    return p0.map((i) => {
      const a = $n.indexOf(i) ?? void 0;
      let h;
      return a && (h = Mw[a]), {
        zoom: a,
        label: h,
        resolution: i
      };
    });
  }
  get1_25000ZoomLevel() {
    return m0;
  }
  getDefaultZoom() {
    return 1;
  }
  transformStandardZoomLevelToCustom(i) {
    return typeof In[0] == "number" && typeof In[14] == "number" && i >= In[0] && i <= In[14] ? In.filter(
      (a) => a < i
    ).length : typeof In[0] == "number" && i < In[0] ? 0 : typeof In[14] == "number" && i > In[14] ? 14 : this.get1_25000ZoomLevel();
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
    return In.length - 1 >= a ? In[a] ?? cs : cs;
  }
  getResolutionForZoomAndCenter(i) {
    const a = Math.round(i);
    return typeof $n[a] != "number" ? 0 : $n[a];
  }
  getZoomForResolutionAndCenter(i) {
    const a = $n.find(
      (f) => f <= i
    );
    if (a)
      return $n.indexOf(a);
    const h = $n.slice(-1)[0];
    return h && h > i ? $n.indexOf(h) : 0;
  }
  roundCoordinateValue(i) {
    return Yi(i, 2);
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
    return a ? GM(i, ww) : super.roundZoomLevel(i);
  }
}
class Sw extends E0 {
  constructor() {
    super({
      epsgNumber: 21781,
      label: "CH1903 / LV03",
      technicalName: "LV03",
      // matrix is coming fom https://epsg.io/21781.proj4
      proj4transformationMatrix: "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs",
      // bound is coming from https://epsg.io/21781
      bounds: new Ba({
        lowerX: 485071.58,
        upperX: 837119.8,
        lowerY: 74261.72,
        upperY: 299941.79
      }),
      usesMercatorPyramid: !1
    });
  }
}
class Iw extends E0 {
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
      bounds: new Ba({
        lowerX: 242e4,
        upperX: 29e5,
        lowerY: 103e4,
        upperY: 135e4
      }),
      usesMercatorPyramid: !1
    });
  }
}
class x0 extends y0 {
  /** The index in the resolution list where the 1:25000 zoom level is */
  get1_25000ZoomLevel() {
    return cs;
  }
  getDefaultZoom() {
    return cs;
  }
}
class Nw extends x0 {
  constructor() {
    super({
      epsgNumber: 3857,
      label: "WebMercator",
      // matrix comes from https://epsg.io/3857.proj4
      proj4transformationMatrix: "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=proj",
      // bounds are coming from https://github.com/geoadmin/lib-gatilegrid/blob/58d6e574b69d32740a24edbc086d97897d4b41dc/gatilegrid/tilegrids.py#L122-L125
      bounds: new Ba({
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
    return Yi(i, 2);
  }
  /**
   * Formula comes from
   * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
   *
   *          resolution = 156543.03 meters / pixel * cos(latitude) / (2 ^ zoom level)
   */
  getResolutionForZoomAndCenter(i, a) {
    const h = _n(this.epsg, Bi.epsg, a).map(
      (f) => f * Math.PI / 180
    );
    return typeof h[1] != "number" ? 0 : Yi(
      Math.abs(
        Aa * Math.cos(h[1]) / Math.pow(2, i)
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
    const h = _n(this.epsg, Bi.epsg, a).map(
      (f) => f * Math.PI / 180
    );
    return typeof h[1] != "number" ? 0 : Math.abs(
      Math.log2(
        i / Aa / Math.cos(h[1])
      )
    );
  }
}
class kw extends x0 {
  constructor() {
    super({
      epsgNumber: 4326,
      label: "WGS 84 (lat/lon)",
      // matrix comes from https://epsg.io/4326.proj4
      proj4transformationMatrix: "+proj=longlat +datum=WGS84 +no_defs +type=proj",
      bounds: new Ba({
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
    return Yi(i, 6);
  }
  /**
   * Formula comes from
   * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
   *
   *          resolution = 156543.03 meters / pixel * cos(latitude) / (2 ^ zoom level)
   */
  getResolutionForZoomAndCenter(i, a) {
    return Yi(
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
const Gl = new Iw(), Dl = new Sw(), Bi = new kw(), Fl = new Nw(), M0 = [Gl, Dl, Bi, Fl], Yw = {
  STANDARD_ZOOM_LEVEL_1_25000_MAP: cs,
  SWISS_ZOOM_LEVEL_1_25000_MAP: m0,
  LV95_RESOLUTIONS: $n,
  SWISSTOPO_TILEGRID_RESOLUTIONS: p0
}, Pw = {
  LV95: Gl,
  LV03: Dl,
  WGS84: Bi,
  WEBMERCATOR: Fl,
  allCoordinateSystems: M0
};
function w0(n) {
  return !Array.isArray(n) || n.length === 0 ? !1 : typeof n[0] == "number" && typeof n[1] == "number";
}
function Cw(n, i, a = !0, h = !1) {
  if (!(!Array.isArray(n) || n.length !== 2 || !n.every(Tl) || n.some(
    (f) => f === Number.POSITIVE_INFINITY || f === Number.NEGATIVE_INFINITY
  )))
    return n.map((f) => {
      const v = Yi(f, i);
      let d;
      return h ? d = v.toFixed(i) : d = v.toString(), a ? FM(d) : d;
    }).join(", ");
}
function S0(n, i) {
  if (i.usesMercatorPyramid && i.bounds && Array.isArray(n)) {
    if (n.length === 2 && n.every(Tl)) {
      const [a, h] = n;
      if (a >= i.bounds.lowerX && a <= i.bounds.upperX)
        return n;
      const f = i.bounds.upperX - i.bounds.lowerX, d = Math.floor((a - i.bounds.lowerX) / f) * f;
      return [a - d, h];
    } else if (n.every(Array.isArray))
      return n.map(
        (a) => S0(a, i)
      );
  }
  return n;
}
function I0(n) {
  return n ? n.every((i) => w0(i)) ? n : I0(
    n[0]
  ) : [];
}
function bw(n) {
  if (Array.isArray(n)) {
    if (n.every((i) => i.length === 2))
      return n;
    if (n.some((i) => i.length > 2))
      return n.map((i) => [i[0], i[1]]);
  }
  throw new Error("Invalid coordinates received, cannot remove Z values");
}
function N0(n, i, a) {
  if (!n || !i)
    throw new Error("Invalid arguments, must receive two CRS");
  if (!w0(a))
    throw new Error(
      "Invalid coordinates received, must be an array of number or an array of coordinates"
    );
  const h = a[0];
  return Array.isArray(h) ? a.map(
    (f) => N0(n, i, f)
  ) : _n(n.epsg, i.epsg, a).map(
    (f) => i.roundCoordinateValue(f)
  );
}
function Rw(n) {
  const i = n?.split(":").pop();
  if (i)
    return i === "WGS84" ? Bi : M0.find((a) => a.epsg === `EPSG:${i}`);
}
const Tw = {
  toRoundedString: Cw,
  wrapXCoordinates: S0,
  unwrapGeometryCoordinates: I0,
  removeZValues: bw,
  reprojectAndRound: N0,
  parseCRS: Rw
};
function Aw() {
  return [1 / 0, 1 / 0, -1 / 0, -1 / 0];
}
function Lw(n, i, a, h, f) {
  return f ? (f[0] = n, f[1] = i, f[2] = a, f[3] = h, f) : [n, i, a, h];
}
function Ow(n) {
  return Lw(1 / 0, 1 / 0, -1 / 0, -1 / 0, n);
}
function Gw(n, i, a) {
  const h = Aw();
  return Dw(n, i) ? (n[0] > i[0] ? h[0] = n[0] : h[0] = i[0], n[1] > i[1] ? h[1] = n[1] : h[1] = i[1], n[2] < i[2] ? h[2] = n[2] : h[2] = i[2], n[3] < i[3] ? h[3] = n[3] : h[3] = i[3]) : Ow(h), h;
}
function Dw(n, i) {
  return n[0] <= i[2] && n[2] >= i[0] && n[1] <= i[3] && n[3] >= i[1];
}
function Lu(n, i, a) {
  if (a.length === 4) {
    const h = _n(n.epsg, i.epsg, [
      a[0],
      a[1]
    ]), f = _n(n.epsg, i.epsg, [
      a[2],
      a[3]
    ]);
    return [...h, ...f].map((v) => i.roundCoordinateValue(v));
  } else if (a.length === 2) {
    const h = _n(n.epsg, i.epsg, a[0]).map(
      (v) => i.roundCoordinateValue(v)
    ), f = _n(n.epsg, i.epsg, a[1]).map(
      (v) => i.roundCoordinateValue(v)
    );
    return [h, f];
  }
  return a;
}
function k0(n) {
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
function Fw(n, i, a) {
  if (n?.length !== 4 && n?.length !== 2 || !i || !a || !a.bounds)
    return;
  let h = a.bounds.flatten;
  i.epsg !== a.epsg && (h = Lu(
    a,
    i,
    h
  ));
  let f = Gw(
    xl(n),
    h
  );
  if (!(!f || // OL now populates the extent with Infinity when nothing is in common, instead returning a null value
  f.every((v) => Math.abs(v) === 1 / 0)))
    return i.epsg !== a.epsg && (f = Lu(i, a, f)), xl(f);
}
function qw(n) {
  const [i, a] = k0(n);
  return [(i[0] + a[0]) / 2, (i[1] + a[1]) / 2];
}
function Bw(n) {
  const { size: i, coordinate: a, projection: h, resolution: f, rounded: v = !1 } = n;
  if (!i || !a || !h || !f)
    return;
  let d = a;
  h.epsg !== Bi.epsg && (d = _n(h.epsg, Bi.epsg, a));
  const g = fw(
    Fi(d),
    // sphere of the wanted number of pixels as radius around the coordinate
    i * f,
    { units: "meters" }
  );
  if (!g)
    return;
  const p = Lu(Bi, h, xi(g));
  return v ? p.map((M) => Yi(M)) : p;
}
const Uw = {
  projExtent: Lu,
  normalizeExtent: k0,
  flattenExtent: xl,
  getExtentIntersectionWithCurrentProjection: Fw,
  createPixelExtentAround: Bw,
  getExtentCenter: qw
};
function zw(n) {
  return `color: #000; font-weight: bold; background-color: ${n}; padding: 2px 4px; border-radius: 4px;`;
}
function fu(n) {
  return n.flatMap((i) => {
    if (i && typeof i == "object" && "messages" in i && Array.isArray(i.messages)) {
      const a = [];
      if ("title" in i && typeof i.title == "string") {
        a.push(`%c[${i.title}]%c`);
        let h = "oklch(55.4% 0.046 257.417)";
        "titleColor" in i && typeof i.titleColor == "string" && (h = i.titleColor), a.push(zw(h)), a.push("");
      }
      return a.push(...i.messages), a;
    }
    return i;
  });
}
function cu(n, i) {
  if (P0.wantedLevels.includes(n))
    switch (n) {
      case 0:
        console.error(...fu(i));
        break;
      case 1:
        console.warn(...fu(i));
        break;
      case 2:
        console.info(...fu(i));
        break;
      case 3:
        console.debug(...fu(i));
        break;
    }
}
const P0 = {
  wantedLevels: [
    0,
    1
    /* Warn */
  ],
  error: (...n) => cu(0, n),
  warn: (...n) => cu(1, n),
  info: (...n) => cu(2, n),
  debug: (...n) => cu(3, n)
}, C0 = (n, i = [Fl, Gl, Dl]) => {
  i.filter((a) => a.proj4transformationMatrix).forEach((a) => {
    try {
      n.defs(a.epsg, a.proj4transformationMatrix);
    } catch (h) {
      const f = h || new Error("Unknown error");
      throw P0.error("Error while setting up projection in proj4", a.epsg, f), f;
    }
  });
};
C0(_n);
const Xw = { ...Pw, coordinatesUtils: Tw, extentUtils: Uw, registerProj4: C0 };
export {
  y0 as CoordinateSystem,
  Ba as CoordinateSystemBounds,
  xw as CustomCoordinateSystem,
  Dl as LV03,
  Gl as LV95,
  x0 as StandardCoordinateSystem,
  E0 as SwissCoordinateSystem,
  Fl as WEBMERCATOR,
  Bi as WGS84,
  M0 as allCoordinateSystems,
  Yw as constants,
  Tw as coordinatesUtils,
  Bw as createPixelExtentAround,
  Pw as crs,
  Xw as default,
  Uw as extentUtils,
  xl as flattenExtent,
  qw as getExtentCenter,
  Fw as getExtentIntersectionWithCurrentProjection,
  k0 as normalizeExtent,
  Lu as projExtent,
  C0 as registerProj4
};
