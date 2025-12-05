function Cy(n) {
  n("EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"), n("EPSG:4269", "+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees"), n("EPSG:3857", "+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs");
  for (var i = 1; i <= 60; ++i)
    n("EPSG:" + (32600 + i), "+proj=utm +zone=" + i + " +datum=WGS84 +units=m"), n("EPSG:" + (32700 + i), "+proj=utm +zone=" + i + " +south +datum=WGS84 +units=m");
  n.WGS84 = n["EPSG:4326"], n["EPSG:3785"] = n["EPSG:3857"], n.GOOGLE = n["EPSG:3857"], n["EPSG:900913"] = n["EPSG:3857"], n["EPSG:102113"] = n["EPSG:3857"];
}
var yr = 1, pr = 2, rs = 3, by = 4, al = 5, Sc = 6378137, Ry = 6356752314e-3, Ic = 0.0066943799901413165, wa = 484813681109536e-20, Q = Math.PI / 2, Ay = 0.16666666666666666, Ty = 0.04722222222222222, Ly = 0.022156084656084655, st = 1e-10, xe = 0.017453292519943295, Vn = 57.29577951308232, zt = Math.PI / 4, Pa = Math.PI * 2, oe = 3.14159265359, en = {};
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
const Oy = {
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
var Nc = /[\s_\-\/\(\)]/g;
function Ui(n, i) {
  if (n[i])
    return n[i];
  for (var a = Object.keys(n), l = i.toLowerCase().replace(Nc, ""), f = -1, _, d; ++f < a.length; )
    if (_ = a[f], d = _.toLowerCase().replace(Nc, ""), d === l)
      return n[_];
}
function ul(n) {
  var i = {}, a = n.split("+").map(function(g) {
    return g.trim();
  }).filter(function(g) {
    return g;
  }).reduce(function(g, p) {
    var M = p.split("=");
    return M.push(!0), g[M[0].toLowerCase()] = M[1], g;
  }, {}), l, f, _, d = {
    proj: "projName",
    datum: "datumCode",
    rf: function(g) {
      i.rf = parseFloat(g);
    },
    lat_0: function(g) {
      i.lat0 = g * xe;
    },
    lat_1: function(g) {
      i.lat1 = g * xe;
    },
    lat_2: function(g) {
      i.lat2 = g * xe;
    },
    lat_ts: function(g) {
      i.lat_ts = g * xe;
    },
    lon_0: function(g) {
      i.long0 = g * xe;
    },
    lon_1: function(g) {
      i.long1 = g * xe;
    },
    lon_2: function(g) {
      i.long2 = g * xe;
    },
    alpha: function(g) {
      i.alpha = parseFloat(g) * xe;
    },
    gamma: function(g) {
      i.rectified_grid_angle = parseFloat(g) * xe;
    },
    lonc: function(g) {
      i.longc = g * xe;
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
      var p = Ui(Oy, g);
      p && (i.to_meter = p.to_meter);
    },
    from_greenwich: function(g) {
      i.from_greenwich = g * xe;
    },
    pm: function(g) {
      var p = Ui(en, g);
      i.from_greenwich = (p || parseFloat(g)) * xe;
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
    }
  };
  for (l in a)
    f = a[l], l in d ? (_ = d[l], typeof _ == "function" ? _(f) : i[_] = f) : i[l] = f;
  return typeof i.datumCode == "string" && i.datumCode !== "WGS84" && (i.datumCode = i.datumCode.toLowerCase()), i;
}
class wg {
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
    const l = i[1], f = parseFloat(i[2]) || null, _ = i.find((g) => Array.isArray(g) && g[0] === "ID"), d = _ ? {
      authority: _[1],
      code: parseInt(_[2], 10)
    } : null;
    return {
      type: a,
      name: l,
      conversion_factor: f,
      id: d
    };
  }
  static convertAxis(i) {
    const a = i[1] || "Unknown";
    let l;
    const f = a.match(/^\((.)\)$/);
    if (f) {
      const M = f[1].toUpperCase();
      if (M === "E") l = "east";
      else if (M === "N") l = "north";
      else if (M === "U") l = "up";
      else throw new Error(`Unknown axis abbreviation: ${M}`);
    } else
      l = i[2] ? i[2].toLowerCase() : "unknown";
    const _ = i.find((M) => Array.isArray(M) && M[0] === "ORDER"), d = _ ? parseInt(_[1], 10) : null, g = i.find(
      (M) => Array.isArray(M) && (M[0] === "LENGTHUNIT" || M[0] === "ANGLEUNIT" || M[0] === "SCALEUNIT")
    ), p = this.convertUnit(g);
    return {
      name: a,
      direction: l,
      // Use the valid PROJJSON direction value
      unit: p,
      order: d
    };
  }
  static extractAxes(i) {
    return i.filter((a) => Array.isArray(a) && a[0] === "AXIS").map((a) => this.convertAxis(a)).sort((a, l) => (a.order || 0) - (l.order || 0));
  }
  static convert(i, a = {}) {
    switch (i[0]) {
      case "PROJCRS":
        a.type = "ProjectedCRS", a.name = i[1], a.base_crs = i.find((w) => Array.isArray(w) && w[0] === "BASEGEOGCRS") ? this.convert(i.find((w) => Array.isArray(w) && w[0] === "BASEGEOGCRS")) : null, a.conversion = i.find((w) => Array.isArray(w) && w[0] === "CONVERSION") ? this.convert(i.find((w) => Array.isArray(w) && w[0] === "CONVERSION")) : null;
        const l = i.find((w) => Array.isArray(w) && w[0] === "CS");
        l && (a.coordinate_system = {
          type: l[1],
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
        const _ = i.find(
          (w) => Array.isArray(w) && (w[0] === "DATUM" || w[0] === "ENSEMBLE")
        );
        if (_) {
          const w = this.convert(_);
          _[0] === "ENSEMBLE" ? a.datum_ensemble = w : a.datum = w;
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
class Gy extends wg {
  static convert(i, a = {}) {
    return super.convert(i, a), a.coordinate_system && a.coordinate_system.subtype === "Cartesian" && delete a.coordinate_system, a.usage && delete a.usage, a;
  }
}
class Dy extends wg {
  static convert(i, a = {}) {
    super.convert(i, a);
    const l = i.find((_) => Array.isArray(_) && _[0] === "CS");
    l && (a.coordinate_system = {
      subtype: l[1],
      axis: this.extractAxes(i)
    });
    const f = i.find((_) => Array.isArray(_) && _[0] === "USAGE");
    if (f) {
      const _ = f.find((p) => Array.isArray(p) && p[0] === "SCOPE"), d = f.find((p) => Array.isArray(p) && p[0] === "AREA"), g = f.find((p) => Array.isArray(p) && p[0] === "BBOX");
      a.usage = {}, _ && (a.usage.scope = _[1]), d && (a.usage.area = d[1]), g && (a.usage.bbox = g.slice(1));
    }
    return a;
  }
}
function Fy(n) {
  return n.find((i) => Array.isArray(i) && i[0] === "USAGE") ? "2019" : (n.find((i) => Array.isArray(i) && i[0] === "CS") || n[0] === "BOUNDCRS" || n[0] === "PROJCRS" || n[0] === "GEOGCRS", "2015");
}
function qy(n) {
  return (Fy(n) === "2019" ? Dy : Gy).convert(n);
}
function By(n) {
  const i = n.toUpperCase();
  return i.includes("PROJCRS") || i.includes("GEOGCRS") || i.includes("BOUNDCRS") || i.includes("VERTCRS") || i.includes("LENGTHUNIT") || i.includes("ANGLEUNIT") || i.includes("SCALEUNIT") ? "WKT2" : (i.includes("PROJCS") || i.includes("GEOGCS") || i.includes("LOCAL_CS") || i.includes("VERT_CS") || i.includes("UNIT"), "WKT1");
}
var Ca = 1, Sg = 2, Ig = 3, Eo = 4, Ng = 5, xl = -1, Uy = /\s/, zy = /[A-Za-z]/, Yy = /[A-Za-z84_]/, To = /[,\]]/, kg = /[\d\.E\-\+]/;
function wi(n) {
  if (typeof n != "string")
    throw new Error("not a string");
  this.text = n.trim(), this.level = 0, this.place = 0, this.root = null, this.stack = [], this.currentObject = null, this.state = Ca;
}
wi.prototype.readCharicter = function() {
  var n = this.text[this.place++];
  if (this.state !== Eo)
    for (; Uy.test(n); ) {
      if (this.place >= this.text.length)
        return;
      n = this.text[this.place++];
    }
  switch (this.state) {
    case Ca:
      return this.neutral(n);
    case Sg:
      return this.keyword(n);
    case Eo:
      return this.quoted(n);
    case Ng:
      return this.afterquote(n);
    case Ig:
      return this.number(n);
    case xl:
      return;
  }
};
wi.prototype.afterquote = function(n) {
  if (n === '"') {
    this.word += '"', this.state = Eo;
    return;
  }
  if (To.test(n)) {
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
    this.level--, this.word !== null && (this.currentObject.push(this.word), this.word = null), this.state = Ca, this.currentObject = this.stack.pop(), this.currentObject || (this.state = xl);
    return;
  }
};
wi.prototype.number = function(n) {
  if (kg.test(n)) {
    this.word += n;
    return;
  }
  if (To.test(n)) {
    this.word = parseFloat(this.word), this.afterItem(n);
    return;
  }
  throw new Error(`havn't handled "` + n + '" in number yet, index ' + this.place);
};
wi.prototype.quoted = function(n) {
  if (n === '"') {
    this.state = Ng;
    return;
  }
  this.word += n;
};
wi.prototype.keyword = function(n) {
  if (Yy.test(n)) {
    this.word += n;
    return;
  }
  if (n === "[") {
    var i = [];
    i.push(this.word), this.level++, this.root === null ? this.root = i : this.currentObject.push(i), this.stack.push(this.currentObject), this.currentObject = i, this.state = Ca;
    return;
  }
  if (To.test(n)) {
    this.afterItem(n);
    return;
  }
  throw new Error(`havn't handled "` + n + '" in keyword yet, index ' + this.place);
};
wi.prototype.neutral = function(n) {
  if (zy.test(n)) {
    this.word = n, this.state = Sg;
    return;
  }
  if (n === '"') {
    this.word = "", this.state = Eo;
    return;
  }
  if (kg.test(n)) {
    this.word = n, this.state = Ig;
    return;
  }
  if (To.test(n)) {
    this.afterItem(n);
    return;
  }
  throw new Error(`havn't handled "` + n + '" in neutral yet, index ' + this.place);
};
wi.prototype.output = function() {
  for (; this.place < this.text.length; )
    this.readCharicter();
  if (this.state === xl)
    return this.root;
  throw new Error('unable to parse string "' + this.text + '". State is ' + this.state);
};
function Xy(n) {
  var i = new wi(n);
  return i.output();
}
function Zh(n, i, a) {
  Array.isArray(i) && (a.unshift(i), i = null);
  var l = i ? {} : n, f = a.reduce(function(_, d) {
    return jr(d, _), _;
  }, l);
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
  var l;
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
      n[0] = ["name", n[0]], Zh(i, a, n);
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
      n[0] = ["name", n[0]], Zh(i, a, n), i[a].type = a;
      return;
    default:
      for (l = -1; ++l < n.length; )
        if (!Array.isArray(n[l]))
          return jr(n, i[a]);
      return Zh(i, a, n);
  }
}
var Wy = 0.017453292519943295;
function Gn(n) {
  return n * Wy;
}
function Pg(n) {
  const i = (n.projName || "").toLowerCase().replace(/_/g, " ");
  !n.long0 && n.longc && (i === "albers conic equal area" || i === "lambert azimuthal equal area") && (n.long0 = n.longc), !n.lat_ts && n.lat1 && (i === "stereographic south pole" || i === "polar stereographic (variant b)") ? (n.lat0 = Gn(n.lat1 > 0 ? 90 : -90), n.lat_ts = n.lat1, delete n.lat1) : !n.lat_ts && n.lat0 && (i === "polar stereographic" || i === "polar stereographic (variant a)") && (n.lat_ts = n.lat0, n.lat0 = Gn(n.lat0 > 0 ? 90 : -90), delete n.lat1);
}
function kc(n) {
  let i = { units: null, to_meter: void 0 };
  return typeof n == "string" ? (i.units = n.toLowerCase(), i.units === "metre" && (i.units = "meter"), i.units === "meter" && (i.to_meter = 1)) : n && n.name && (i.units = n.name.toLowerCase(), i.units === "metre" && (i.units = "meter"), i.to_meter = n.conversion_factor), i;
}
function Pc(n) {
  return typeof n == "object" ? n.value * n.unit.conversion_factor : n;
}
function Cc(n, i) {
  n.ellipsoid.radius ? (i.a = n.ellipsoid.radius, i.rf = 0) : (i.a = Pc(n.ellipsoid.semi_major_axis), n.ellipsoid.inverse_flattening !== void 0 ? i.rf = n.ellipsoid.inverse_flattening : n.ellipsoid.semi_major_axis !== void 0 && n.ellipsoid.semi_minor_axis !== void 0 && (i.rf = i.a / (i.a - Pc(n.ellipsoid.semi_minor_axis))));
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
          l.ellipsoid && (i.ellps = l.ellipsoid.name, Cc(l, i)), l.prime_meridian && (i.from_greenwich = l.prime_meridian.longitude * Math.PI / 180);
          break;
        case "ellipsoid":
          i.ellps = l.name, Cc(l, i);
          break;
        case "prime_meridian":
          i.long0 = (l.longitude || 0) * Math.PI / 180;
          break;
        case "coordinate_system":
          if (l.axis) {
            if (i.axis = l.axis.map((f) => {
              const _ = f.direction;
              if (_ === "east") return "e";
              if (_ === "north") return "n";
              if (_ === "west") return "w";
              if (_ === "south") return "s";
              throw new Error(`Unknown axis direction: ${_}`);
            }).join("") + "u", l.unit) {
              const { units: f, to_meter: _ } = kc(l.unit);
              i.units = f, i.to_meter = _;
            } else if (l.axis[0] && l.axis[0].unit) {
              const { units: f, to_meter: _ } = kc(l.axis[0].unit);
              i.units = f, i.to_meter = _;
            }
          }
          break;
        case "id":
          l.authority && l.code && (i.title = l.authority + ":" + l.code);
          break;
        case "conversion":
          l.method && l.method.name && (i.projName = l.method.name), l.parameters && l.parameters.forEach((f) => {
            const _ = f.name.toLowerCase().replace(/\s+/g, "_"), d = f.value;
            f.unit && f.unit.conversion_factor ? i[_] = d * f.unit.conversion_factor : f.unit === "degree" ? i[_] = d * Math.PI / 180 : i[_] = d;
          });
          break;
        case "unit":
          l.name && (i.units = l.name.toLowerCase(), i.units === "metre" && (i.units = "meter")), l.conversion_factor && (i.to_meter = l.conversion_factor);
          break;
        case "base_crs":
          xo(l, i), i.datumCode = l.id ? l.id.authority + "_" + l.id.code : l.name;
          break;
      }
  }), i.latitude_of_false_origin !== void 0 && (i.lat0 = i.latitude_of_false_origin), i.longitude_of_false_origin !== void 0 && (i.long0 = i.longitude_of_false_origin), i.latitude_of_standard_parallel !== void 0 && (i.lat0 = i.latitude_of_standard_parallel, i.lat1 = i.latitude_of_standard_parallel), i.latitude_of_1st_standard_parallel !== void 0 && (i.lat1 = i.latitude_of_1st_standard_parallel), i.latitude_of_2nd_standard_parallel !== void 0 && (i.lat2 = i.latitude_of_2nd_standard_parallel), i.latitude_of_projection_centre !== void 0 && (i.lat0 = i.latitude_of_projection_centre), i.longitude_of_projection_centre !== void 0 && (i.longc = i.longitude_of_projection_centre), i.easting_at_false_origin !== void 0 && (i.x0 = i.easting_at_false_origin), i.northing_at_false_origin !== void 0 && (i.y0 = i.northing_at_false_origin), i.latitude_of_natural_origin !== void 0 && (i.lat0 = i.latitude_of_natural_origin), i.longitude_of_natural_origin !== void 0 && (i.long0 = i.longitude_of_natural_origin), i.longitude_of_origin !== void 0 && (i.long0 = i.longitude_of_origin), i.false_easting !== void 0 && (i.x0 = i.false_easting), i.easting_at_projection_centre && (i.x0 = i.easting_at_projection_centre), i.false_northing !== void 0 && (i.y0 = i.false_northing), i.northing_at_projection_centre && (i.y0 = i.northing_at_projection_centre), i.standard_parallel_1 !== void 0 && (i.lat1 = i.standard_parallel_1), i.standard_parallel_2 !== void 0 && (i.lat2 = i.standard_parallel_2), i.scale_factor_at_natural_origin !== void 0 && (i.k0 = i.scale_factor_at_natural_origin), i.scale_factor_at_projection_centre !== void 0 && (i.k0 = i.scale_factor_at_projection_centre), i.scale_factor_on_pseudo_standard_parallel !== void 0 && (i.k0 = i.scale_factor_on_pseudo_standard_parallel), i.azimuth !== void 0 && (i.alpha = i.azimuth), i.azimuth_at_projection_centre !== void 0 && (i.alpha = i.azimuth_at_projection_centre), i.angle_from_rectified_to_skew_grid && (i.rectified_grid_angle = i.angle_from_rectified_to_skew_grid), Pg(i), i);
}
var $y = [
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
function Hy(n, i) {
  var a = i[0], l = i[1];
  !(a in n) && l in n && (n[a] = n[l], i.length === 3 && (n[a] = i[2](n[a])));
}
function Cg(n) {
  for (var i = Object.keys(n), a = 0, l = i.length; a < l; ++a) {
    var f = i[a];
    $y.indexOf(f) !== -1 && Vy(n[f]), typeof n[f] == "object" && Cg(n[f]);
  }
}
function Vy(n) {
  if (n.AUTHORITY) {
    var i = Object.keys(n.AUTHORITY)[0];
    i && i in n.AUTHORITY && (n.title = i + ":" + n.AUTHORITY[i]);
  }
  if (n.type === "GEOGCS" ? n.projName = "longlat" : n.type === "LOCAL_CS" ? (n.projName = "identity", n.local = !0) : typeof n.PROJECTION == "object" ? n.projName = Object.keys(n.PROJECTION)[0] : n.projName = n.PROJECTION, n.AXIS) {
    for (var a = "", l = 0, f = n.AXIS.length; l < f; ++l) {
      var _ = [n.AXIS[l][0].toLowerCase(), n.AXIS[l][1].toLowerCase()];
      _[0].indexOf("north") !== -1 || (_[0] === "y" || _[0] === "lat") && _[1] === "north" ? a += "n" : _[0].indexOf("south") !== -1 || (_[0] === "y" || _[0] === "lat") && _[1] === "south" ? a += "s" : _[0].indexOf("east") !== -1 || (_[0] === "x" || _[0] === "lon") && _[1] === "east" ? a += "e" : (_[0].indexOf("west") !== -1 || (_[0] === "x" || _[0] === "lon") && _[1] === "west") && (a += "w");
    }
    a.length === 2 && (a += "u"), a.length === 3 && (n.axis = a);
  }
  n.UNIT && (n.units = n.UNIT.name.toLowerCase(), n.units === "metre" && (n.units = "meter"), n.UNIT.convert && (n.type === "GEOGCS" ? n.DATUM && n.DATUM.SPHEROID && (n.to_meter = n.UNIT.convert * n.DATUM.SPHEROID.a) : n.to_meter = n.UNIT.convert));
  var d = n.GEOGCS;
  n.type === "GEOGCS" && (d = n), d && (d.DATUM ? n.datumCode = d.DATUM.name.toLowerCase() : n.datumCode = d.name.toLowerCase(), n.datumCode.slice(0, 2) === "d_" && (n.datumCode = n.datumCode.slice(2)), n.datumCode === "new_zealand_1949" && (n.datumCode = "nzgd49"), (n.datumCode === "wgs_1984" || n.datumCode === "world_geodetic_system_1984") && (n.PROJECTION === "Mercator_Auxiliary_Sphere" && (n.sphere = !0), n.datumCode = "wgs84"), n.datumCode === "belge_1972" && (n.datumCode = "rnb72"), d.DATUM && d.DATUM.SPHEROID && (n.ellps = d.DATUM.SPHEROID.name.replace("_19", "").replace(/[Cc]larke\_18/, "clrk"), n.ellps.toLowerCase().slice(0, 13) === "international" && (n.ellps = "intl"), n.a = d.DATUM.SPHEROID.a, n.rf = parseFloat(d.DATUM.SPHEROID.rf, 10)), d.DATUM && d.DATUM.TOWGS84 && (n.datum_params = d.DATUM.TOWGS84), ~n.datumCode.indexOf("osgb_1936") && (n.datumCode = "osgb36"), ~n.datumCode.indexOf("osni_1952") && (n.datumCode = "osni52"), (~n.datumCode.indexOf("tm65") || ~n.datumCode.indexOf("geodetic_datum_of_1965")) && (n.datumCode = "ire65"), n.datumCode === "ch1903+" && (n.datumCode = "ch1903"), ~n.datumCode.indexOf("israel") && (n.datumCode = "isr93")), n.b && !isFinite(n.b) && (n.b = n.a), n.rectified_grid_angle && (n.rectified_grid_angle = Gn(n.rectified_grid_angle));
  function g(S) {
    var x = n.to_meter || 1;
    return S * x;
  }
  var p = function(S) {
    return Hy(n, S);
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
  M.forEach(p), Pg(n);
}
function ol(n) {
  if (typeof n == "object")
    return xo(n);
  const i = By(n);
  var a = Xy(n);
  if (i === "WKT2") {
    const _ = qy(a);
    return xo(_);
  }
  var l = a[0], f = {};
  return jr(a, f), Cg(f), f[l];
}
function De(n) {
  var i = this;
  if (arguments.length === 2) {
    var a = arguments[1];
    typeof a == "string" ? a.charAt(0) === "+" ? De[
      /** @type {string} */
      n
    ] = ul(arguments[1]) : De[
      /** @type {string} */
      n
    ] = ol(arguments[1]) : De[
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
Cy(De);
function Zy(n) {
  return typeof n == "string";
}
function Ky(n) {
  return n in De;
}
function Jy(n) {
  return n.indexOf("+") !== 0 && n.indexOf("[") !== -1 || typeof n == "object" && !("srsCode" in n);
}
var Qy = ["3857", "900913", "3785", "102113"];
function jy(n) {
  var i = Ui(n, "authority");
  if (i) {
    var a = Ui(i, "epsg");
    return a && Qy.indexOf(a) > -1;
  }
}
function tp(n) {
  var i = Ui(n, "extension");
  if (i)
    return Ui(i, "proj4");
}
function ep(n) {
  return n[0] === "+";
}
function np(n) {
  if (Zy(n)) {
    if (Ky(n))
      return De[n];
    if (Jy(n)) {
      var i = ol(n);
      if (jy(i))
        return De["EPSG:3857"];
      var a = tp(i);
      return a ? ul(a) : i;
    }
    if (ep(n))
      return ul(n);
  } else return "projName" in n ? n : ol(n);
}
function bc(n, i) {
  n = n || {};
  var a, l;
  if (!i)
    return n;
  for (l in i)
    a = i[l], a !== void 0 && (n[l] = a);
  return n;
}
function Jn(n, i, a) {
  var l = n * i;
  return a / Math.sqrt(1 - l * l);
}
function La(n) {
  return n < 0 ? -1 : 1;
}
function ut(n) {
  return Math.abs(n) <= oe ? n : n - La(n) * Pa;
}
function Dn(n, i, a) {
  var l = n * a, f = 0.5 * n;
  return l = Math.pow((1 - l) / (1 + l), f), Math.tan(0.5 * (Q - i)) / l;
}
function ba(n, i) {
  for (var a = 0.5 * n, l, f, _ = Q - 2 * Math.atan(i), d = 0; d <= 15; d++)
    if (l = n * Math.sin(_), f = Q - 2 * Math.atan(i * Math.pow((1 - l) / (1 + l), a)) - _, _ += f, Math.abs(f) <= 1e-10)
      return _;
  return -9999;
}
function ip() {
  var n = this.b / this.a;
  this.es = 1 - n * n, "x0" in this || (this.x0 = 0), "y0" in this || (this.y0 = 0), this.e = Math.sqrt(this.es), this.lat_ts ? this.sphere ? this.k0 = Math.cos(this.lat_ts) : this.k0 = Jn(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)) : this.k0 || (this.k ? this.k0 = this.k : this.k0 = 1);
}
function rp(n) {
  var i = n.x, a = n.y;
  if (a * Vn > 90 && a * Vn < -90 && i * Vn > 180 && i * Vn < -180)
    return null;
  var l, f;
  if (Math.abs(Math.abs(a) - Q) <= st)
    return null;
  if (this.sphere)
    l = this.x0 + this.a * this.k0 * ut(i - this.long0), f = this.y0 + this.a * this.k0 * Math.log(Math.tan(zt + 0.5 * a));
  else {
    var _ = Math.sin(a), d = Dn(this.e, a, _);
    l = this.x0 + this.a * this.k0 * ut(i - this.long0), f = this.y0 - this.a * this.k0 * Math.log(d);
  }
  return n.x = l, n.y = f, n;
}
function sp(n) {
  var i = n.x - this.x0, a = n.y - this.y0, l, f;
  if (this.sphere)
    f = Q - 2 * Math.atan(Math.exp(-a / (this.a * this.k0)));
  else {
    var _ = Math.exp(-a / (this.a * this.k0));
    if (f = ba(this.e, _), f === -9999)
      return null;
  }
  return l = ut(this.long0 + i / (this.a * this.k0)), n.x = l, n.y = f, n;
}
var ap = ["Mercator", "Popular Visualisation Pseudo Mercator", "Mercator_1SP", "Mercator_Auxiliary_Sphere", "Mercator_Variant_A", "merc"];
const up = {
  init: ip,
  forward: rp,
  inverse: sp,
  names: ap
};
function op() {
}
function Rc(n) {
  return n;
}
var hp = ["longlat", "identity"];
const lp = {
  init: op,
  forward: Rc,
  inverse: Rc,
  names: hp
};
var fp = [up, lp], mr = {}, ts = [];
function bg(n, i) {
  var a = ts.length;
  return n.names ? (ts[a] = n, n.names.forEach(function(l) {
    mr[l.toLowerCase()] = a;
  }), this) : (console.log(i), !0);
}
function Rg(n) {
  return n.replace(/[-\(\)\s]+/g, " ").trim().replace(/ /g, "_");
}
function cp(n) {
  if (!n)
    return !1;
  var i = n.toLowerCase();
  if (typeof mr[i] < "u" && ts[mr[i]] || (i = Rg(i), i in mr && ts[mr[i]]))
    return ts[mr[i]];
}
function gp() {
  fp.forEach(bg);
}
const vp = {
  start: gp,
  add: bg,
  get: cp
};
var Ag = {
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
const _p = Ag.WGS84;
function dp(n, i, a, l) {
  var f = n * n, _ = i * i, d = (f - _) / f, g = 0;
  l ? (n *= 1 - d * (Ay + d * (Ty + d * Ly)), f = n * n, d = 0) : g = Math.sqrt(d);
  var p = (f - _) / _;
  return {
    es: d,
    e: g,
    ep2: p
  };
}
function mp(n, i, a, l, f) {
  if (!n) {
    var _ = Ui(Ag, l);
    _ || (_ = _p), n = _.a, i = _.b, a = _.rf;
  }
  return a && !i && (i = (1 - 1 / a) * n), (a === 0 || Math.abs(n - i) < st) && (f = !0, i = n), {
    a: n,
    b: i,
    rf: a,
    sphere: f
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
for (var yp in co) {
  var Kh = co[yp];
  Kh.datumName && (co[Kh.datumName] = Kh);
}
function pp(n, i, a, l, f, _, d) {
  var g = {};
  return n === void 0 || n === "none" ? g.datum_type = al : g.datum_type = by, i && (g.datum_params = i.map(parseFloat), (g.datum_params[0] !== 0 || g.datum_params[1] !== 0 || g.datum_params[2] !== 0) && (g.datum_type = yr), g.datum_params.length > 3 && (g.datum_params[3] !== 0 || g.datum_params[4] !== 0 || g.datum_params[5] !== 0 || g.datum_params[6] !== 0) && (g.datum_type = pr, g.datum_params[3] *= wa, g.datum_params[4] *= wa, g.datum_params[5] *= wa, g.datum_params[6] = g.datum_params[6] / 1e6 + 1)), d && (g.datum_type = rs, g.grids = d), g.a = a, g.b = l, g.es = f, g.ep2 = _, g;
}
var Ml = {};
function Ep(n, i, a) {
  return i instanceof ArrayBuffer ? xp(n, i, a) : { ready: Mp(n, i) };
}
function xp(n, i, a) {
  var l = !0;
  a !== void 0 && a.includeErrorFields === !1 && (l = !1);
  var f = new DataView(i), _ = Ip(f), d = Np(f, _), g = kp(f, d, _, l), p = { header: d, subgrids: g };
  return Ml[n] = p, p;
}
async function Mp(n, i) {
  for (var a = [], l = await i.getImageCount(), f = l - 1; f >= 0; f--) {
    var _ = await i.getImage(f), d = await _.readRasters(), g = d, p = [_.getWidth(), _.getHeight()], M = _.getBoundingBox().map(Ac), S = [_.fileDirectory.ModelPixelScale[0], _.fileDirectory.ModelPixelScale[1]].map(Ac), x = M[0] + (p[0] - 1) * S[0], w = M[3] - (p[1] - 1) * S[1], b = g[0], C = g[1], G = [];
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
      nSubgrids: l
    },
    subgrids: a
  };
  return Ml[n] = B, B;
}
function wp(n) {
  if (n === void 0)
    return null;
  var i = n.split(",");
  return i.map(Sp);
}
function Sp(n) {
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
function Ac(n) {
  return n * Math.PI / 180;
}
function Di(n) {
  return n / 3600 * Math.PI / 180;
}
function Ip(n) {
  var i = n.getInt32(8, !1);
  return i === 11 ? !1 : (i = n.getInt32(8, !0), i !== 11 && console.warn("Failed to detect nadgrid endian-ness, defaulting to little-endian"), !0);
}
function Np(n, i) {
  return {
    nFields: n.getInt32(8, i),
    nSubgridFields: n.getInt32(24, i),
    nSubgrids: n.getInt32(40, i),
    shiftType: hl(n, 56, 64).trim(),
    fromSemiMajorAxis: n.getFloat64(120, i),
    fromSemiMinorAxis: n.getFloat64(136, i),
    toSemiMajorAxis: n.getFloat64(152, i),
    toSemiMinorAxis: n.getFloat64(168, i)
  };
}
function hl(n, i, a) {
  return String.fromCharCode.apply(null, new Uint8Array(n.buffer.slice(i, a)));
}
function kp(n, i, a, l) {
  for (var f = 176, _ = [], d = 0; d < i.nSubgrids; d++) {
    var g = Cp(n, f, a), p = bp(n, f, g, a, l), M = Math.round(
      1 + (g.upperLongitude - g.lowerLongitude) / g.longitudeInterval
    ), S = Math.round(
      1 + (g.upperLatitude - g.lowerLatitude) / g.latitudeInterval
    );
    _.push({
      ll: [Di(g.lowerLongitude), Di(g.lowerLatitude)],
      del: [Di(g.longitudeInterval), Di(g.latitudeInterval)],
      lim: [M, S],
      count: g.gridNodeCount,
      cvs: Pp(p)
    });
    var x = 16;
    l === !1 && (x = 8), f += 176 + g.gridNodeCount * x;
  }
  return _;
}
function Pp(n) {
  return n.map(function(i) {
    return [Di(i.longitudeShift), Di(i.latitudeShift)];
  });
}
function Cp(n, i, a) {
  return {
    name: hl(n, i + 8, i + 16).trim(),
    parent: hl(n, i + 24, i + 24 + 8).trim(),
    lowerLatitude: n.getFloat64(i + 72, a),
    upperLatitude: n.getFloat64(i + 88, a),
    lowerLongitude: n.getFloat64(i + 104, a),
    upperLongitude: n.getFloat64(i + 120, a),
    latitudeInterval: n.getFloat64(i + 136, a),
    longitudeInterval: n.getFloat64(i + 152, a),
    gridNodeCount: n.getInt32(i + 168, a)
  };
}
function bp(n, i, a, l, f) {
  var _ = i + 176, d = 16;
  f === !1 && (d = 8);
  for (var g = [], p = 0; p < a.gridNodeCount; p++) {
    var M = {
      latitudeShift: n.getFloat32(_ + p * d, l),
      longitudeShift: n.getFloat32(_ + p * d + 4, l)
    };
    f !== !1 && (M.latitudeAccuracy = n.getFloat32(_ + p * d + 8, l), M.longitudeAccuracy = n.getFloat32(_ + p * d + 12, l)), g.push(M);
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
  var a = np(n);
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
    var f = Ui(co, a.datumCode);
    f && (a.datum_params = a.datum_params || (f.towgs84 ? f.towgs84.split(",") : null), a.ellps = f.ellipse, a.datumName = f.datumName ? f.datumName : a.datumCode);
  }
  a.k0 = a.k0 || 1, a.axis = a.axis || "enu", a.ellps = a.ellps || "wgs84", a.lat1 = a.lat1 || a.lat0;
  var _ = mp(a.a, a.b, a.rf, a.ellps, a.sphere), d = dp(_.a, _.b, _.rf, a.R_A), g = wp(a.nadgrids), p = a.datum || pp(
    a.datumCode,
    a.datum_params,
    _.a,
    _.b,
    d.es,
    d.ep2,
    g
  );
  bc(this, a), bc(this, l), this.a = _.a, this.b = _.b, this.rf = _.rf, this.sphere = _.sphere, this.es = d.es, this.e = d.e, this.ep2 = d.ep2, this.datum = p, "init" in this && typeof this.init == "function" && this.init(), i(null, this);
}
Fn.projections = vp;
Fn.projections.start();
function Rp(n, i) {
  return n.datum_type !== i.datum_type || n.a !== i.a || Math.abs(n.es - i.es) > 5e-11 ? !1 : n.datum_type === yr ? n.datum_params[0] === i.datum_params[0] && n.datum_params[1] === i.datum_params[1] && n.datum_params[2] === i.datum_params[2] : n.datum_type === pr ? n.datum_params[0] === i.datum_params[0] && n.datum_params[1] === i.datum_params[1] && n.datum_params[2] === i.datum_params[2] && n.datum_params[3] === i.datum_params[3] && n.datum_params[4] === i.datum_params[4] && n.datum_params[5] === i.datum_params[5] && n.datum_params[6] === i.datum_params[6] : !0;
}
function Tg(n, i, a) {
  var l = n.x, f = n.y, _ = n.z ? n.z : 0, d, g, p, M;
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
  return l > Math.PI && (l -= 2 * Math.PI), g = Math.sin(f), M = Math.cos(f), p = g * g, d = a / Math.sqrt(1 - i * p), {
    x: (d + _) * M * Math.cos(l),
    y: (d + _) * M * Math.sin(l),
    z: (d * (1 - i) + _) * g
  };
}
function Lg(n, i, a, l) {
  var f = 1e-12, _ = f * f, d = 30, g, p, M, S, x, w, b, C, G, O, B, z, Y, W = n.x, X = n.y, V = n.z ? n.z : 0, K, et, j;
  if (g = Math.sqrt(W * W + X * X), p = Math.sqrt(W * W + X * X + V * V), g / a < f) {
    if (K = 0, p / a < f)
      return et = Q, j = -l, {
        x: n.x,
        y: n.y,
        z: n.z
      };
  } else
    K = Math.atan2(X, W);
  M = V / p, S = g / p, x = 1 / Math.sqrt(1 - i * (2 - i) * S * S), C = S * (1 - i) * x, G = M * x, Y = 0;
  do
    Y++, b = a / Math.sqrt(1 - i * G * G), j = g * C + V * G - b * (1 - i * G * G), w = i * b / (b + j), x = 1 / Math.sqrt(1 - w * (2 - w) * S * S), O = S * (1 - w) * x, B = M * x, z = B * C - O * G, C = O, G = B;
  while (z * z > _ && Y < d);
  return et = Math.atan(B / Math.abs(O)), {
    x: K,
    y: et,
    z: j
  };
}
function Ap(n, i, a) {
  if (i === yr)
    return {
      x: n.x + a[0],
      y: n.y + a[1],
      z: n.z + a[2]
    };
  if (i === pr) {
    var l = a[0], f = a[1], _ = a[2], d = a[3], g = a[4], p = a[5], M = a[6];
    return {
      x: M * (n.x - p * n.y + g * n.z) + l,
      y: M * (p * n.x + n.y - d * n.z) + f,
      z: M * (-g * n.x + d * n.y + n.z) + _
    };
  }
}
function Tp(n, i, a) {
  if (i === yr)
    return {
      x: n.x - a[0],
      y: n.y - a[1],
      z: n.z - a[2]
    };
  if (i === pr) {
    var l = a[0], f = a[1], _ = a[2], d = a[3], g = a[4], p = a[5], M = a[6], S = (n.x - l) / M, x = (n.y - f) / M, w = (n.z - _) / M;
    return {
      x: S + p * x - g * w,
      y: -p * S + x + d * w,
      z: g * S - d * x + w
    };
  }
}
function Ku(n) {
  return n === yr || n === pr;
}
function Lp(n, i, a) {
  if (Rp(n, i) || n.datum_type === al || i.datum_type === al)
    return a;
  var l = n.a, f = n.es;
  if (n.datum_type === rs) {
    var _ = Tc(n, !1, a);
    if (_ !== 0)
      return;
    l = Sc, f = Ic;
  }
  var d = i.a, g = i.b, p = i.es;
  if (i.datum_type === rs && (d = Sc, g = Ry, p = Ic), f === p && l === d && !Ku(n.datum_type) && !Ku(i.datum_type))
    return a;
  if (a = Tg(a, f, l), Ku(n.datum_type) && (a = Ap(a, n.datum_type, n.datum_params)), Ku(i.datum_type) && (a = Tp(a, i.datum_type, i.datum_params)), a = Lg(a, p, d, g), i.datum_type === rs) {
    var M = Tc(i, !0, a);
    if (M !== 0)
      return;
  }
  return a;
}
function Tc(n, i, a) {
  if (n.grids === null || n.grids.length === 0)
    return console.log("Grid shift grids not found"), -1;
  var l = { x: -a.x, y: a.y }, f = { x: Number.NaN, y: Number.NaN }, _ = [];
  t:
    for (var d = 0; d < n.grids.length; d++) {
      var g = n.grids[d];
      if (_.push(g.name), g.isNull) {
        f = l;
        break;
      }
      if (g.grid === null) {
        if (g.mandatory)
          return console.log("Unable to find mandatory grid '" + g.name + "'"), -1;
        continue;
      }
      for (var p = g.grid.subgrids, M = 0, S = p.length; M < S; M++) {
        var x = p[M], w = (Math.abs(x.del[1]) + Math.abs(x.del[0])) / 1e4, b = x.ll[0] - w, C = x.ll[1] - w, G = x.ll[0] + (x.lim[0] - 1) * x.del[0] + w, O = x.ll[1] + (x.lim[1] - 1) * x.del[1] + w;
        if (!(C > l.y || b > l.x || O < l.y || G < l.x) && (f = Op(l, i, x), !isNaN(f.x)))
          break t;
      }
    }
  return isNaN(f.x) ? (console.log("Failed to find a grid shift table for location '" + -l.x * Vn + " " + l.y * Vn + " tried: '" + _ + "'"), -1) : (a.x = -f.x, a.y = f.y, 0);
}
function Op(n, i, a) {
  var l = { x: Number.NaN, y: Number.NaN };
  if (isNaN(n.x))
    return l;
  var f = { x: n.x, y: n.y };
  f.x -= a.ll[0], f.y -= a.ll[1], f.x = ut(f.x - Math.PI) + Math.PI;
  var _ = Lc(f, a);
  if (i) {
    if (isNaN(_.x))
      return l;
    _.x = f.x - _.x, _.y = f.y - _.y;
    var d = 9, g = 1e-12, p, M;
    do {
      if (M = Lc(_, a), isNaN(M.x)) {
        console.log("Inverse grid shift iteration failed, presumably at grid edge.  Using first approximation.");
        break;
      }
      p = { x: f.x - (M.x + _.x), y: f.y - (M.y + _.y) }, _.x += p.x, _.y += p.y;
    } while (d-- && Math.abs(p.x) > g && Math.abs(p.y) > g);
    if (d < 0)
      return console.log("Inverse grid shift iterator failed to converge."), l;
    l.x = ut(_.x + a.ll[0]), l.y = _.y + a.ll[1];
  } else
    isNaN(_.x) || (l.x = n.x + _.x, l.y = n.y + _.y);
  return l;
}
function Lc(n, i) {
  var a = { x: n.x / i.del[0], y: n.y / i.del[1] }, l = { x: Math.floor(a.x), y: Math.floor(a.y) }, f = { x: a.x - 1 * l.x, y: a.y - 1 * l.y }, _ = { x: Number.NaN, y: Number.NaN }, d;
  if (l.x < 0 || l.x >= i.lim[0] || l.y < 0 || l.y >= i.lim[1])
    return _;
  d = l.y * i.lim[0] + l.x;
  var g = { x: i.cvs[d][0], y: i.cvs[d][1] };
  d++;
  var p = { x: i.cvs[d][0], y: i.cvs[d][1] };
  d += i.lim[0];
  var M = { x: i.cvs[d][0], y: i.cvs[d][1] };
  d--;
  var S = { x: i.cvs[d][0], y: i.cvs[d][1] }, x = f.x * f.y, w = f.x * (1 - f.y), b = (1 - f.x) * (1 - f.y), C = (1 - f.x) * f.y;
  return _.x = b * g.x + w * p.x + C * S.x + x * M.x, _.y = b * g.y + w * p.y + C * S.y + x * M.y, _;
}
function Oc(n, i, a) {
  var l = a.x, f = a.y, _ = a.z || 0, d, g, p, M = {};
  for (p = 0; p < 3; p++)
    if (!(i && p === 2 && a.z === void 0))
      switch (p === 0 ? (d = l, "ew".indexOf(n.axis[p]) !== -1 ? g = "x" : g = "y") : p === 1 ? (d = f, "ns".indexOf(n.axis[p]) !== -1 ? g = "y" : g = "x") : (d = _, g = "z"), n.axis[p]) {
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
function Og(n) {
  var i = {
    x: n[0],
    y: n[1]
  };
  return n.length > 2 && (i.z = n[2]), n.length > 3 && (i.m = n[3]), i;
}
function Gp(n) {
  Gc(n.x), Gc(n.y);
}
function Gc(n) {
  if (typeof Number.isFinite == "function") {
    if (Number.isFinite(n))
      return;
    throw new TypeError("coordinates must be finite numbers");
  }
  if (typeof n != "number" || n !== n || !isFinite(n))
    throw new TypeError("coordinates must be finite numbers");
}
function Dp(n, i) {
  return (n.datum.datum_type === yr || n.datum.datum_type === pr || n.datum.datum_type === rs) && i.datumCode !== "WGS84" || (i.datum.datum_type === yr || i.datum.datum_type === pr || i.datum.datum_type === rs) && n.datumCode !== "WGS84";
}
function Mo(n, i, a, l) {
  var f;
  Array.isArray(a) ? a = Og(a) : a = {
    x: a.x,
    y: a.y,
    z: a.z,
    m: a.m
  };
  var _ = a.z !== void 0;
  if (Gp(a), n.datum && i.datum && Dp(n, i) && (f = new Fn("WGS84"), a = Mo(n, f, a, l), n = f), l && n.axis !== "enu" && (a = Oc(n, !1, a)), n.projName === "longlat")
    a = {
      x: a.x * xe,
      y: a.y * xe,
      z: a.z || 0
    };
  else if (n.to_meter && (a = {
    x: a.x * n.to_meter,
    y: a.y * n.to_meter,
    z: a.z || 0
  }), a = n.inverse(a), !a)
    return;
  if (n.from_greenwich && (a.x += n.from_greenwich), a = Lp(n.datum, i.datum, a), !!a)
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
    })), l && i.axis !== "enu" ? Oc(i, !0, a) : (a && !_ && delete a.z, a);
}
var Dc = Fn("WGS84");
function Jh(n, i, a, l) {
  var f, _, d;
  return Array.isArray(a) ? (f = Mo(n, i, a, l) || { x: NaN, y: NaN }, a.length > 2 ? typeof n.name < "u" && n.name === "geocent" || typeof i.name < "u" && i.name === "geocent" ? typeof f.z == "number" ? (
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
  )) : (_ = Mo(n, i, a, l), d = Object.keys(a), d.length === 2 || d.forEach(function(g) {
    if (typeof n.name < "u" && n.name === "geocent" || typeof i.name < "u" && i.name === "geocent") {
      if (g === "x" || g === "y" || g === "z")
        return;
    } else if (g === "x" || g === "y")
      return;
    _[g] = a[g];
  }), /** @type {T} */
  _);
}
function Ju(n) {
  return n instanceof Fn ? n : typeof n == "object" && "oProj" in n ? n.oProj : Fn(
    /** @type {string | PROJJSONDefinition} */
    n
  );
}
function Fp(n, i, a) {
  var l, f, _ = !1, d;
  return typeof i > "u" ? (f = Ju(n), l = Dc, _ = !0) : (typeof /** @type {?} */
  i.x < "u" || Array.isArray(i)) && (a = /** @type {T} */
  /** @type {?} */
  i, f = Ju(n), l = Dc, _ = !0), l || (l = Ju(n)), f || (f = Ju(
    /** @type {string | PROJJSONDefinition | proj } */
    i
  )), a ? Jh(l, f, a) : (d = {
    /**
     * @template {TemplateCoordinates} T
     * @param {T} coords
     * @param {boolean=} enforceAxis
     * @returns {T}
     */
    forward: function(g, p) {
      return Jh(l, f, g, p);
    },
    /**
     * @template {TemplateCoordinates} T
     * @param {T} coords
     * @param {boolean=} enforceAxis
     * @returns {T}
     */
    inverse: function(g, p) {
      return Jh(f, l, g, p);
    }
  }, _ && (d.oProj = f), d);
}
var Fc = 6, Gg = "AJSAJS", Dg = "AFAFAF", es = 65, Qe = 73, Nn = 79, _a = 86, da = 90;
const qp = {
  forward: Fg,
  inverse: Bp,
  toPoint: qg
};
function Fg(n, i) {
  return i = i || 5, Yp(Up({
    lat: n[1],
    lon: n[0]
  }), i);
}
function Bp(n) {
  var i = wl(Ug(n.toUpperCase()));
  return i.lat && i.lon ? [i.lon, i.lat, i.lon, i.lat] : [i.left, i.bottom, i.right, i.top];
}
function qg(n) {
  var i = wl(Ug(n.toUpperCase()));
  return i.lat && i.lon ? [i.lon, i.lat] : [(i.left + i.right) / 2, (i.top + i.bottom) / 2];
}
function Qh(n) {
  return n * (Math.PI / 180);
}
function qc(n) {
  return 180 * (n / Math.PI);
}
function Up(n) {
  var i = n.lat, a = n.lon, l = 6378137, f = 669438e-8, _ = 0.9996, d, g, p, M, S, x, w, b = Qh(i), C = Qh(a), G, O;
  O = Math.floor((a + 180) / 6) + 1, a === 180 && (O = 60), i >= 56 && i < 64 && a >= 3 && a < 12 && (O = 32), i >= 72 && i < 84 && (a >= 0 && a < 9 ? O = 31 : a >= 9 && a < 21 ? O = 33 : a >= 21 && a < 33 ? O = 35 : a >= 33 && a < 42 && (O = 37)), d = (O - 1) * 6 - 180 + 3, G = Qh(d), g = f / (1 - f), p = l / Math.sqrt(1 - f * Math.sin(b) * Math.sin(b)), M = Math.tan(b) * Math.tan(b), S = g * Math.cos(b) * Math.cos(b), x = Math.cos(b) * (C - G), w = l * ((1 - f / 4 - 3 * f * f / 64 - 5 * f * f * f / 256) * b - (3 * f / 8 + 3 * f * f / 32 + 45 * f * f * f / 1024) * Math.sin(2 * b) + (15 * f * f / 256 + 45 * f * f * f / 1024) * Math.sin(4 * b) - 35 * f * f * f / 3072 * Math.sin(6 * b));
  var B = _ * p * (x + (1 - M + S) * x * x * x / 6 + (5 - 18 * M + M * M + 72 * S - 58 * g) * x * x * x * x * x / 120) + 5e5, z = _ * (w + p * Math.tan(b) * (x * x / 2 + (5 - M + 9 * S + 4 * S * S) * x * x * x * x / 24 + (61 - 58 * M + M * M + 600 * S - 330 * g) * x * x * x * x * x * x / 720));
  return i < 0 && (z += 1e7), {
    northing: Math.round(z),
    easting: Math.round(B),
    zoneNumber: O,
    zoneLetter: zp(i)
  };
}
function wl(n) {
  var i = n.northing, a = n.easting, l = n.zoneLetter, f = n.zoneNumber;
  if (f < 0 || f > 60)
    return null;
  var _ = 0.9996, d = 6378137, g = 669438e-8, p, M = (1 - Math.sqrt(1 - g)) / (1 + Math.sqrt(1 - g)), S, x, w, b, C, G, O, B, z, Y = a - 5e5, W = i;
  l < "N" && (W -= 1e7), O = (f - 1) * 6 - 180 + 3, p = g / (1 - g), G = W / _, B = G / (d * (1 - g / 4 - 3 * g * g / 64 - 5 * g * g * g / 256)), z = B + (3 * M / 2 - 27 * M * M * M / 32) * Math.sin(2 * B) + (21 * M * M / 16 - 55 * M * M * M * M / 32) * Math.sin(4 * B) + 151 * M * M * M / 96 * Math.sin(6 * B), S = d / Math.sqrt(1 - g * Math.sin(z) * Math.sin(z)), x = Math.tan(z) * Math.tan(z), w = p * Math.cos(z) * Math.cos(z), b = d * (1 - g) / Math.pow(1 - g * Math.sin(z) * Math.sin(z), 1.5), C = Y / (S * _);
  var X = z - S * Math.tan(z) / b * (C * C / 2 - (5 + 3 * x + 10 * w - 4 * w * w - 9 * p) * C * C * C * C / 24 + (61 + 90 * x + 298 * w + 45 * x * x - 252 * p - 3 * w * w) * C * C * C * C * C * C / 720);
  X = qc(X);
  var V = (C - (1 + 2 * x + w) * C * C * C / 6 + (5 - 2 * w + 28 * x - 3 * w * w + 8 * p + 24 * x * x) * C * C * C * C * C / 120) / Math.cos(z);
  V = O + qc(V);
  var K;
  if (n.accuracy) {
    var et = wl({
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
function zp(n) {
  var i = "Z";
  return 84 >= n && n >= 72 ? i = "X" : 72 > n && n >= 64 ? i = "W" : 64 > n && n >= 56 ? i = "V" : 56 > n && n >= 48 ? i = "U" : 48 > n && n >= 40 ? i = "T" : 40 > n && n >= 32 ? i = "S" : 32 > n && n >= 24 ? i = "R" : 24 > n && n >= 16 ? i = "Q" : 16 > n && n >= 8 ? i = "P" : 8 > n && n >= 0 ? i = "N" : 0 > n && n >= -8 ? i = "M" : -8 > n && n >= -16 ? i = "L" : -16 > n && n >= -24 ? i = "K" : -24 > n && n >= -32 ? i = "J" : -32 > n && n >= -40 ? i = "H" : -40 > n && n >= -48 ? i = "G" : -48 > n && n >= -56 ? i = "F" : -56 > n && n >= -64 ? i = "E" : -64 > n && n >= -72 ? i = "D" : -72 > n && n >= -80 && (i = "C"), i;
}
function Yp(n, i) {
  var a = "00000" + n.easting, l = "00000" + n.northing;
  return n.zoneNumber + n.zoneLetter + Xp(n.easting, n.northing, n.zoneNumber) + a.substr(a.length - 5, i) + l.substr(l.length - 5, i);
}
function Xp(n, i, a) {
  var l = Bg(a), f = Math.floor(n / 1e5), _ = Math.floor(i / 1e5) % 20;
  return Wp(f, _, l);
}
function Bg(n) {
  var i = n % Fc;
  return i === 0 && (i = Fc), i;
}
function Wp(n, i, a) {
  var l = a - 1, f = Gg.charCodeAt(l), _ = Dg.charCodeAt(l), d = f + n - 1, g = _ + i, p = !1;
  d > da && (d = d - da + es - 1, p = !0), (d === Qe || f < Qe && d > Qe || (d > Qe || f < Qe) && p) && d++, (d === Nn || f < Nn && d > Nn || (d > Nn || f < Nn) && p) && (d++, d === Qe && d++), d > da && (d = d - da + es - 1), g > _a ? (g = g - _a + es - 1, p = !0) : p = !1, (g === Qe || _ < Qe && g > Qe || (g > Qe || _ < Qe) && p) && g++, (g === Nn || _ < Nn && g > Nn || (g > Nn || _ < Nn) && p) && (g++, g === Qe && g++), g > _a && (g = g - _a + es - 1);
  var M = String.fromCharCode(d) + String.fromCharCode(g);
  return M;
}
function Ug(n) {
  if (n && n.length === 0)
    throw "MGRSPoint coverting from nothing";
  for (var i = n.length, a = null, l = "", f, _ = 0; !/[A-Z]/.test(f = n.charAt(_)); ) {
    if (_ >= 2)
      throw "MGRSPoint bad conversion from: " + n;
    l += f, _++;
  }
  var d = parseInt(l, 10);
  if (_ === 0 || _ + 3 > i)
    throw "MGRSPoint bad conversion from: " + n;
  var g = n.charAt(_++);
  if (g <= "A" || g === "B" || g === "Y" || g >= "Z" || g === "I" || g === "O")
    throw "MGRSPoint zone letter " + g + " not handled: " + n;
  a = n.substring(_, _ += 2);
  for (var p = Bg(d), M = $p(a.charAt(0), p), S = Hp(a.charAt(1), p); S < Vp(g); )
    S += 2e6;
  var x = i - _;
  if (x % 2 !== 0)
    throw `MGRSPoint has to have an even number 
of digits after the zone letter and two 100km letters - front 
half for easting meters, second half for 
northing meters` + n;
  var w = x / 2, b = 0, C = 0, G, O, B, z, Y;
  return w > 0 && (G = 1e5 / Math.pow(10, w), O = n.substring(_, _ + w), b = parseFloat(O) * G, B = n.substring(_ + w), C = parseFloat(B) * G), z = b + M, Y = C + S, {
    easting: z,
    northing: Y,
    zoneLetter: g,
    zoneNumber: d,
    accuracy: G
  };
}
function $p(n, i) {
  for (var a = Gg.charCodeAt(i - 1), l = 1e5, f = !1; a !== n.charCodeAt(0); ) {
    if (a++, a === Qe && a++, a === Nn && a++, a > da) {
      if (f)
        throw "Bad character: " + n;
      a = es, f = !0;
    }
    l += 1e5;
  }
  return l;
}
function Hp(n, i) {
  if (n > "V")
    throw "MGRSPoint given invalid Northing " + n;
  for (var a = Dg.charCodeAt(i - 1), l = 0, f = !1; a !== n.charCodeAt(0); ) {
    if (a++, a === Qe && a++, a === Nn && a++, a > _a) {
      if (f)
        throw "Bad character: " + n;
      a = es, f = !0;
    }
    l += 1e5;
  }
  return l;
}
function Vp(n) {
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
function us(n, i, a) {
  if (!(this instanceof us))
    return new us(n, i, a);
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
us.fromMGRS = function(n) {
  return new us(qg(n));
};
us.prototype.toMGRS = function(n) {
  return Fg([this.x, this.y], n);
};
var Zp = 1, Kp = 0.25, Bc = 0.046875, Uc = 0.01953125, zc = 0.01068115234375, Jp = 0.75, Qp = 0.46875, jp = 0.013020833333333334, t2 = 0.007120768229166667, e2 = 0.3645833333333333, n2 = 0.005696614583333333, i2 = 0.3076171875;
function Sl(n) {
  var i = [];
  i[0] = Zp - n * (Kp + n * (Bc + n * (Uc + n * zc))), i[1] = n * (Jp - n * (Bc + n * (Uc + n * zc)));
  var a = n * n;
  return i[2] = a * (Qp - n * (jp + n * t2)), a *= n, i[3] = a * (e2 - n * n2), i[4] = a * n * i2, i;
}
function gs(n, i, a, l) {
  return a *= i, i *= i, l[0] * n - a * (l[1] + i * (l[2] + i * (l[3] + i * l[4])));
}
var r2 = 20;
function Il(n, i, a) {
  for (var l = 1 / (1 - i), f = n, _ = r2; _; --_) {
    var d = Math.sin(f), g = 1 - i * d * d;
    if (g = (gs(f, d, Math.cos(f), a) - n) * (g * Math.sqrt(g)) * l, f -= g, Math.abs(g) < st)
      return f;
  }
  return f;
}
function s2() {
  this.x0 = this.x0 !== void 0 ? this.x0 : 0, this.y0 = this.y0 !== void 0 ? this.y0 : 0, this.long0 = this.long0 !== void 0 ? this.long0 : 0, this.lat0 = this.lat0 !== void 0 ? this.lat0 : 0, this.es && (this.en = Sl(this.es), this.ml0 = gs(this.lat0, Math.sin(this.lat0), Math.cos(this.lat0), this.en));
}
function a2(n) {
  var i = n.x, a = n.y, l = ut(i - this.long0), f, _, d, g = Math.sin(a), p = Math.cos(a);
  if (this.es) {
    var S = p * l, x = Math.pow(S, 2), w = this.ep2 * Math.pow(p, 2), b = Math.pow(w, 2), C = Math.abs(p) > st ? Math.tan(a) : 0, G = Math.pow(C, 2), O = Math.pow(G, 2);
    f = 1 - this.es * Math.pow(g, 2), S = S / Math.sqrt(f);
    var B = gs(a, g, p, this.en);
    _ = this.a * (this.k0 * S * (1 + x / 6 * (1 - G + w + x / 20 * (5 - 18 * G + O + 14 * w - 58 * G * w + x / 42 * (61 + 179 * O - O * G - 479 * G))))) + this.x0, d = this.a * (this.k0 * (B - this.ml0 + g * l * S / 2 * (1 + x / 12 * (5 - G + 9 * w + 4 * b + x / 30 * (61 + O - 58 * G + 270 * w - 330 * G * w + x / 56 * (1385 + 543 * O - O * G - 3111 * G)))))) + this.y0;
  } else {
    var M = p * Math.sin(l);
    if (Math.abs(Math.abs(M) - 1) < st)
      return 93;
    if (_ = 0.5 * this.a * this.k0 * Math.log((1 + M) / (1 - M)) + this.x0, d = p * Math.cos(l) / Math.sqrt(1 - Math.pow(M, 2)), M = Math.abs(d), M >= 1) {
      if (M - 1 > st)
        return 93;
      d = 0;
    } else
      d = Math.acos(d);
    a < 0 && (d = -d), d = this.a * this.k0 * (d - this.lat0) + this.y0;
  }
  return n.x = _, n.y = d, n;
}
function u2(n) {
  var i, a, l, f, _ = (n.x - this.x0) * (1 / this.a), d = (n.y - this.y0) * (1 / this.a);
  if (this.es)
    if (i = this.ml0 + d / this.k0, a = Il(i, this.es, this.en), Math.abs(a) < Q) {
      var x = Math.sin(a), w = Math.cos(a), b = Math.abs(w) > st ? Math.tan(a) : 0, C = this.ep2 * Math.pow(w, 2), G = Math.pow(C, 2), O = Math.pow(b, 2), B = Math.pow(O, 2);
      i = 1 - this.es * Math.pow(x, 2);
      var z = _ * Math.sqrt(i) / this.k0, Y = Math.pow(z, 2);
      i = i * b, l = a - i * Y / (1 - this.es) * 0.5 * (1 - Y / 12 * (5 + 3 * O - 9 * C * O + C - 4 * G - Y / 30 * (61 + 90 * O - 252 * C * O + 45 * B + 46 * C - Y / 56 * (1385 + 3633 * O + 4095 * B + 1574 * B * O)))), f = ut(this.long0 + z * (1 - Y / 6 * (1 + 2 * O + C - Y / 20 * (5 + 28 * O + 24 * B + 8 * C * O + 6 * C - Y / 42 * (61 + 662 * O + 1320 * B + 720 * B * O)))) / w);
    } else
      l = Q * La(d), f = 0;
  else {
    var g = Math.exp(_ / this.k0), p = 0.5 * (g - 1 / g), M = this.lat0 + d / this.k0, S = Math.cos(M);
    i = Math.sqrt((1 - Math.pow(S, 2)) / (1 + Math.pow(p, 2))), l = Math.asin(i), d < 0 && (l = -l), p === 0 && S === 0 ? f = 0 : f = ut(Math.atan2(p, S) + this.long0);
  }
  return n.x = f, n.y = l, n;
}
var o2 = ["Fast_Transverse_Mercator", "Fast Transverse Mercator"];
const go = {
  init: s2,
  forward: a2,
  inverse: u2,
  names: o2
};
function zg(n) {
  var i = Math.exp(n);
  return i = (i - 1 / i) / 2, i;
}
function je(n, i) {
  n = Math.abs(n), i = Math.abs(i);
  var a = Math.max(n, i), l = Math.min(n, i) / (a || 1);
  return a * Math.sqrt(1 + Math.pow(l, 2));
}
function h2(n) {
  var i = 1 + n, a = i - 1;
  return a === 0 ? n : n * Math.log(i) / a;
}
function l2(n) {
  var i = Math.abs(n);
  return i = h2(i * (1 + i / (je(1, i) + 1))), n < 0 ? -i : i;
}
function Nl(n, i) {
  for (var a = 2 * Math.cos(2 * i), l = n.length - 1, f = n[l], _ = 0, d; --l >= 0; )
    d = -_ + a * f + n[l], _ = f, f = d;
  return i + d * Math.sin(2 * i);
}
function f2(n, i) {
  for (var a = 2 * Math.cos(i), l = n.length - 1, f = n[l], _ = 0, d; --l >= 0; )
    d = -_ + a * f + n[l], _ = f, f = d;
  return Math.sin(i) * d;
}
function c2(n) {
  var i = Math.exp(n);
  return i = (i + 1 / i) / 2, i;
}
function Yg(n, i, a) {
  for (var l = Math.sin(i), f = Math.cos(i), _ = zg(a), d = c2(a), g = 2 * f * d, p = -2 * l * _, M = n.length - 1, S = n[M], x = 0, w = 0, b = 0, C, G; --M >= 0; )
    C = w, G = x, w = S, x = b, S = -C + g * w - p * x + n[M], b = -G + p * w + g * x;
  return g = l * d, p = f * _, [g * S - p * b, g * b + p * S];
}
function g2() {
  if (!this.approx && (isNaN(this.es) || this.es <= 0))
    throw new Error('Incorrect elliptical usage. Try using the +approx option in the proj string, or PROJECTION["Fast_Transverse_Mercator"] in the WKT.');
  this.approx && (go.init.apply(this), this.forward = go.forward, this.inverse = go.inverse), this.x0 = this.x0 !== void 0 ? this.x0 : 0, this.y0 = this.y0 !== void 0 ? this.y0 : 0, this.long0 = this.long0 !== void 0 ? this.long0 : 0, this.lat0 = this.lat0 !== void 0 ? this.lat0 : 0, this.cgb = [], this.cbg = [], this.utg = [], this.gtu = [];
  var n = this.es / (1 + Math.sqrt(1 - this.es)), i = n / (2 - n), a = i;
  this.cgb[0] = i * (2 + i * (-2 / 3 + i * (-2 + i * (116 / 45 + i * (26 / 45 + i * (-2854 / 675)))))), this.cbg[0] = i * (-2 + i * (2 / 3 + i * (4 / 3 + i * (-82 / 45 + i * (32 / 45 + i * (4642 / 4725)))))), a = a * i, this.cgb[1] = a * (7 / 3 + i * (-8 / 5 + i * (-227 / 45 + i * (2704 / 315 + i * (2323 / 945))))), this.cbg[1] = a * (5 / 3 + i * (-16 / 15 + i * (-13 / 9 + i * (904 / 315 + i * (-1522 / 945))))), a = a * i, this.cgb[2] = a * (56 / 15 + i * (-136 / 35 + i * (-1262 / 105 + i * (73814 / 2835)))), this.cbg[2] = a * (-26 / 15 + i * (34 / 21 + i * (8 / 5 + i * (-12686 / 2835)))), a = a * i, this.cgb[3] = a * (4279 / 630 + i * (-332 / 35 + i * (-399572 / 14175))), this.cbg[3] = a * (1237 / 630 + i * (-12 / 5 + i * (-24832 / 14175))), a = a * i, this.cgb[4] = a * (4174 / 315 + i * (-144838 / 6237)), this.cbg[4] = a * (-734 / 315 + i * (109598 / 31185)), a = a * i, this.cgb[5] = a * (601676 / 22275), this.cbg[5] = a * (444337 / 155925), a = Math.pow(i, 2), this.Qn = this.k0 / (1 + i) * (1 + a * (1 / 4 + a * (1 / 64 + a / 256))), this.utg[0] = i * (-0.5 + i * (2 / 3 + i * (-37 / 96 + i * (1 / 360 + i * (81 / 512 + i * (-96199 / 604800)))))), this.gtu[0] = i * (0.5 + i * (-2 / 3 + i * (5 / 16 + i * (41 / 180 + i * (-127 / 288 + i * (7891 / 37800)))))), this.utg[1] = a * (-1 / 48 + i * (-1 / 15 + i * (437 / 1440 + i * (-46 / 105 + i * (1118711 / 3870720))))), this.gtu[1] = a * (13 / 48 + i * (-3 / 5 + i * (557 / 1440 + i * (281 / 630 + i * (-1983433 / 1935360))))), a = a * i, this.utg[2] = a * (-17 / 480 + i * (37 / 840 + i * (209 / 4480 + i * (-5569 / 90720)))), this.gtu[2] = a * (61 / 240 + i * (-103 / 140 + i * (15061 / 26880 + i * (167603 / 181440)))), a = a * i, this.utg[3] = a * (-4397 / 161280 + i * (11 / 504 + i * (830251 / 7257600))), this.gtu[3] = a * (49561 / 161280 + i * (-179 / 168 + i * (6601661 / 7257600))), a = a * i, this.utg[4] = a * (-4583 / 161280 + i * (108847 / 3991680)), this.gtu[4] = a * (34729 / 80640 + i * (-3418889 / 1995840)), a = a * i, this.utg[5] = a * (-20648693 / 638668800), this.gtu[5] = a * (212378941 / 319334400);
  var l = Nl(this.cbg, this.lat0);
  this.Zb = -this.Qn * (l + f2(this.gtu, 2 * l));
}
function v2(n) {
  var i = ut(n.x - this.long0), a = n.y;
  a = Nl(this.cbg, a);
  var l = Math.sin(a), f = Math.cos(a), _ = Math.sin(i), d = Math.cos(i);
  a = Math.atan2(l, d * f), i = Math.atan2(_ * f, je(l, f * d)), i = l2(Math.tan(i));
  var g = Yg(this.gtu, 2 * a, 2 * i);
  a = a + g[0], i = i + g[1];
  var p, M;
  return Math.abs(i) <= 2.623395162778 ? (p = this.a * (this.Qn * i) + this.x0, M = this.a * (this.Qn * a + this.Zb) + this.y0) : (p = 1 / 0, M = 1 / 0), n.x = p, n.y = M, n;
}
function _2(n) {
  var i = (n.x - this.x0) * (1 / this.a), a = (n.y - this.y0) * (1 / this.a);
  a = (a - this.Zb) / this.Qn, i = i / this.Qn;
  var l, f;
  if (Math.abs(i) <= 2.623395162778) {
    var _ = Yg(this.utg, 2 * a, 2 * i);
    a = a + _[0], i = i + _[1], i = Math.atan(zg(i));
    var d = Math.sin(a), g = Math.cos(a), p = Math.sin(i), M = Math.cos(i);
    a = Math.atan2(d * M, je(p, M * g)), i = Math.atan2(p, M * g), l = ut(i + this.long0), f = Nl(this.cgb, a);
  } else
    l = 1 / 0, f = 1 / 0;
  return n.x = l, n.y = f, n;
}
var d2 = ["Extended_Transverse_Mercator", "Extended Transverse Mercator", "etmerc", "Transverse_Mercator", "Transverse Mercator", "Gauss Kruger", "Gauss_Kruger", "tmerc"];
const vo = {
  init: g2,
  forward: v2,
  inverse: _2,
  names: d2
};
function m2(n, i) {
  if (n === void 0) {
    if (n = Math.floor((ut(i) + Math.PI) * 30 / Math.PI) + 1, n < 0)
      return 0;
    if (n > 60)
      return 60;
  }
  return n;
}
var y2 = "etmerc";
function p2() {
  var n = m2(this.zone, this.long0);
  if (n === void 0)
    throw new Error("unknown utm zone");
  this.lat0 = 0, this.long0 = (6 * Math.abs(n) - 183) * xe, this.x0 = 5e5, this.y0 = this.utmSouth ? 1e7 : 0, this.k0 = 0.9996, vo.init.apply(this), this.forward = vo.forward, this.inverse = vo.inverse;
}
var E2 = ["Universal Transverse Mercator System", "utm"];
const x2 = {
  init: p2,
  names: E2,
  dependsOn: y2
};
function kl(n, i) {
  return Math.pow((1 - n) / (1 + n), i);
}
var M2 = 20;
function w2() {
  var n = Math.sin(this.lat0), i = Math.cos(this.lat0);
  i *= i, this.rc = Math.sqrt(1 - this.es) / (1 - this.es * n * n), this.C = Math.sqrt(1 + this.es * i * i / (1 - this.es)), this.phic0 = Math.asin(n / this.C), this.ratexp = 0.5 * this.C * this.e, this.K = Math.tan(0.5 * this.phic0 + zt) / (Math.pow(Math.tan(0.5 * this.lat0 + zt), this.C) * kl(this.e * n, this.ratexp));
}
function S2(n) {
  var i = n.x, a = n.y;
  return n.y = 2 * Math.atan(this.K * Math.pow(Math.tan(0.5 * a + zt), this.C) * kl(this.e * Math.sin(a), this.ratexp)) - Q, n.x = this.C * i, n;
}
function I2(n) {
  for (var i = 1e-14, a = n.x / this.C, l = n.y, f = Math.pow(Math.tan(0.5 * l + zt) / this.K, 1 / this.C), _ = M2; _ > 0 && (l = 2 * Math.atan(f * kl(this.e * Math.sin(n.y), -0.5 * this.e)) - Q, !(Math.abs(l - n.y) < i)); --_)
    n.y = l;
  return _ ? (n.x = a, n.y = l, n) : null;
}
const Pl = {
  init: w2,
  forward: S2,
  inverse: I2
};
function N2() {
  Pl.init.apply(this), this.rc && (this.sinc0 = Math.sin(this.phic0), this.cosc0 = Math.cos(this.phic0), this.R2 = 2 * this.rc, this.title || (this.title = "Oblique Stereographic Alternative"));
}
function k2(n) {
  var i, a, l, f;
  return n.x = ut(n.x - this.long0), Pl.forward.apply(this, [n]), i = Math.sin(n.y), a = Math.cos(n.y), l = Math.cos(n.x), f = this.k0 * this.R2 / (1 + this.sinc0 * i + this.cosc0 * a * l), n.x = f * a * Math.sin(n.x), n.y = f * (this.cosc0 * i - this.sinc0 * a * l), n.x = this.a * n.x + this.x0, n.y = this.a * n.y + this.y0, n;
}
function P2(n) {
  var i, a, l, f, _;
  if (n.x = (n.x - this.x0) / this.a, n.y = (n.y - this.y0) / this.a, n.x /= this.k0, n.y /= this.k0, _ = je(n.x, n.y)) {
    var d = 2 * Math.atan2(_, this.R2);
    i = Math.sin(d), a = Math.cos(d), f = Math.asin(a * this.sinc0 + n.y * i * this.cosc0 / _), l = Math.atan2(n.x * i, _ * this.cosc0 * a - n.y * this.sinc0 * i);
  } else
    f = this.phic0, l = 0;
  return n.x = l, n.y = f, Pl.inverse.apply(this, [n]), n.x = ut(n.x + this.long0), n;
}
var C2 = ["Stereographic_North_Pole", "Oblique_Stereographic", "sterea", "Oblique Stereographic Alternative", "Double_Stereographic"];
const b2 = {
  init: N2,
  forward: k2,
  inverse: P2,
  names: C2
};
function Cl(n, i, a) {
  return i *= a, Math.tan(0.5 * (Q + n)) * Math.pow((1 - i) / (1 + i), 0.5 * a);
}
function R2() {
  this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.lat0 = this.lat0 || 0, this.long0 = this.long0 || 0, this.coslat0 = Math.cos(this.lat0), this.sinlat0 = Math.sin(this.lat0), this.sphere ? this.k0 === 1 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= st && (this.k0 = 0.5 * (1 + La(this.lat0) * Math.sin(this.lat_ts))) : (Math.abs(this.coslat0) <= st && (this.lat0 > 0 ? this.con = 1 : this.con = -1), this.cons = Math.sqrt(Math.pow(1 + this.e, 1 + this.e) * Math.pow(1 - this.e, 1 - this.e)), this.k0 === 1 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= st && Math.abs(Math.cos(this.lat_ts)) > st && (this.k0 = 0.5 * this.cons * Jn(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)) / Dn(this.e, this.con * this.lat_ts, this.con * Math.sin(this.lat_ts))), this.ms1 = Jn(this.e, this.sinlat0, this.coslat0), this.X0 = 2 * Math.atan(Cl(this.lat0, this.sinlat0, this.e)) - Q, this.cosX0 = Math.cos(this.X0), this.sinX0 = Math.sin(this.X0));
}
function A2(n) {
  var i = n.x, a = n.y, l = Math.sin(a), f = Math.cos(a), _, d, g, p, M, S, x = ut(i - this.long0);
  return Math.abs(Math.abs(i - this.long0) - Math.PI) <= st && Math.abs(a + this.lat0) <= st ? (n.x = NaN, n.y = NaN, n) : this.sphere ? (_ = 2 * this.k0 / (1 + this.sinlat0 * l + this.coslat0 * f * Math.cos(x)), n.x = this.a * _ * f * Math.sin(x) + this.x0, n.y = this.a * _ * (this.coslat0 * l - this.sinlat0 * f * Math.cos(x)) + this.y0, n) : (d = 2 * Math.atan(Cl(a, l, this.e)) - Q, p = Math.cos(d), g = Math.sin(d), Math.abs(this.coslat0) <= st ? (M = Dn(this.e, a * this.con, this.con * l), S = 2 * this.a * this.k0 * M / this.cons, n.x = this.x0 + S * Math.sin(i - this.long0), n.y = this.y0 - this.con * S * Math.cos(i - this.long0), n) : (Math.abs(this.sinlat0) < st ? (_ = 2 * this.a * this.k0 / (1 + p * Math.cos(x)), n.y = _ * g) : (_ = 2 * this.a * this.k0 * this.ms1 / (this.cosX0 * (1 + this.sinX0 * g + this.cosX0 * p * Math.cos(x))), n.y = _ * (this.cosX0 * g - this.sinX0 * p * Math.cos(x)) + this.y0), n.x = _ * p * Math.sin(x) + this.x0, n));
}
function T2(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i, a, l, f, _, d = Math.sqrt(n.x * n.x + n.y * n.y);
  if (this.sphere) {
    var g = 2 * Math.atan(d / (2 * this.a * this.k0));
    return i = this.long0, a = this.lat0, d <= st ? (n.x = i, n.y = a, n) : (a = Math.asin(Math.cos(g) * this.sinlat0 + n.y * Math.sin(g) * this.coslat0 / d), Math.abs(this.coslat0) < st ? this.lat0 > 0 ? i = ut(this.long0 + Math.atan2(n.x, -1 * n.y)) : i = ut(this.long0 + Math.atan2(n.x, n.y)) : i = ut(this.long0 + Math.atan2(n.x * Math.sin(g), d * this.coslat0 * Math.cos(g) - n.y * this.sinlat0 * Math.sin(g))), n.x = i, n.y = a, n);
  } else if (Math.abs(this.coslat0) <= st) {
    if (d <= st)
      return a = this.lat0, i = this.long0, n.x = i, n.y = a, n;
    n.x *= this.con, n.y *= this.con, l = d * this.cons / (2 * this.a * this.k0), a = this.con * ba(this.e, l), i = this.con * ut(this.con * this.long0 + Math.atan2(n.x, -1 * n.y));
  } else
    f = 2 * Math.atan(d * this.cosX0 / (2 * this.a * this.k0 * this.ms1)), i = this.long0, d <= st ? _ = this.X0 : (_ = Math.asin(Math.cos(f) * this.sinX0 + n.y * Math.sin(f) * this.cosX0 / d), i = ut(this.long0 + Math.atan2(n.x * Math.sin(f), d * this.cosX0 * Math.cos(f) - n.y * this.sinX0 * Math.sin(f)))), a = -1 * ba(this.e, Math.tan(0.5 * (Q + _)));
  return n.x = i, n.y = a, n;
}
var L2 = ["stere", "Stereographic_South_Pole", "Polar_Stereographic_variant_A", "Polar_Stereographic_variant_B", "Polar_Stereographic"];
const O2 = {
  init: R2,
  forward: A2,
  inverse: T2,
  names: L2,
  ssfn_: Cl
};
function G2() {
  var n = this.lat0;
  this.lambda0 = this.long0;
  var i = Math.sin(n), a = this.a, l = this.rf, f = 1 / l, _ = 2 * f - Math.pow(f, 2), d = this.e = Math.sqrt(_);
  this.R = this.k0 * a * Math.sqrt(1 - _) / (1 - _ * Math.pow(i, 2)), this.alpha = Math.sqrt(1 + _ / (1 - _) * Math.pow(Math.cos(n), 4)), this.b0 = Math.asin(i / this.alpha);
  var g = Math.log(Math.tan(Math.PI / 4 + this.b0 / 2)), p = Math.log(Math.tan(Math.PI / 4 + n / 2)), M = Math.log((1 + d * i) / (1 - d * i));
  this.K = g - this.alpha * p + this.alpha * d / 2 * M;
}
function D2(n) {
  var i = Math.log(Math.tan(Math.PI / 4 - n.y / 2)), a = this.e / 2 * Math.log((1 + this.e * Math.sin(n.y)) / (1 - this.e * Math.sin(n.y))), l = -this.alpha * (i + a) + this.K, f = 2 * (Math.atan(Math.exp(l)) - Math.PI / 4), _ = this.alpha * (n.x - this.lambda0), d = Math.atan(Math.sin(_) / (Math.sin(this.b0) * Math.tan(f) + Math.cos(this.b0) * Math.cos(_))), g = Math.asin(Math.cos(this.b0) * Math.sin(f) - Math.sin(this.b0) * Math.cos(f) * Math.cos(_));
  return n.y = this.R / 2 * Math.log((1 + Math.sin(g)) / (1 - Math.sin(g))) + this.y0, n.x = this.R * d + this.x0, n;
}
function F2(n) {
  for (var i = n.x - this.x0, a = n.y - this.y0, l = i / this.R, f = 2 * (Math.atan(Math.exp(a / this.R)) - Math.PI / 4), _ = Math.asin(Math.cos(this.b0) * Math.sin(f) + Math.sin(this.b0) * Math.cos(f) * Math.cos(l)), d = Math.atan(Math.sin(l) / (Math.cos(this.b0) * Math.cos(l) - Math.sin(this.b0) * Math.tan(f))), g = this.lambda0 + d / this.alpha, p = 0, M = _, S = -1e3, x = 0; Math.abs(M - S) > 1e-7; ) {
    if (++x > 20)
      return;
    p = 1 / this.alpha * (Math.log(Math.tan(Math.PI / 4 + _ / 2)) - this.K) + this.e * Math.log(Math.tan(Math.PI / 4 + Math.asin(this.e * Math.sin(M)) / 2)), S = M, M = 2 * Math.atan(Math.exp(p)) - Math.PI / 2;
  }
  return n.x = g, n.y = M, n;
}
var q2 = ["somerc"];
const B2 = {
  init: G2,
  forward: D2,
  inverse: F2,
  names: q2
};
var Jr = 1e-7;
function U2(n) {
  var i = ["Hotine_Oblique_Mercator", "Hotine_Oblique_Mercator_variant_A", "Hotine_Oblique_Mercator_Azimuth_Natural_Origin"], a = typeof n.projName == "object" ? Object.keys(n.projName)[0] : n.projName;
  return "no_uoff" in n || "no_off" in n || i.indexOf(a) !== -1 || i.indexOf(Rg(a)) !== -1;
}
function z2() {
  var n, i, a, l, f, _, d, g, p, M, S = 0, x, w = 0, b = 0, C = 0, G = 0, O = 0, B = 0;
  this.no_off = U2(this), this.no_rot = "no_rot" in this;
  var z = !1;
  "alpha" in this && (z = !0);
  var Y = !1;
  if ("rectified_grid_angle" in this && (Y = !0), z && (B = this.alpha), Y && (S = this.rectified_grid_angle), z || Y)
    w = this.longc;
  else if (b = this.long1, G = this.lat1, C = this.long2, O = this.lat2, Math.abs(G - O) <= Jr || (n = Math.abs(G)) <= Jr || Math.abs(n - Q) <= Jr || Math.abs(Math.abs(this.lat0) - Q) <= Jr || Math.abs(Math.abs(O) - Q) <= Jr)
    throw new Error();
  var W = 1 - this.es;
  i = Math.sqrt(W), Math.abs(this.lat0) > st ? (g = Math.sin(this.lat0), a = Math.cos(this.lat0), n = 1 - this.es * g * g, this.B = a * a, this.B = Math.sqrt(1 + this.es * this.B * this.B / W), this.A = this.B * this.k0 * i / n, l = this.B * i / (a * Math.sqrt(n)), f = l * l - 1, f <= 0 ? f = 0 : (f = Math.sqrt(f), this.lat0 < 0 && (f = -f)), this.E = f += l, this.E *= Math.pow(Dn(this.e, this.lat0, g), this.B)) : (this.B = 1 / i, this.A = this.k0, this.E = l = f = 1), z || Y ? (z ? (x = Math.asin(Math.sin(B) / l), Y || (S = B)) : (x = S, B = Math.asin(l * Math.sin(x))), this.lam0 = w - Math.asin(0.5 * (f - 1 / f) * Math.tan(x)) / this.B) : (_ = Math.pow(Dn(this.e, G, Math.sin(G)), this.B), d = Math.pow(Dn(this.e, O, Math.sin(O)), this.B), f = this.E / _, p = (d - _) / (d + _), M = this.E * this.E, M = (M - d * _) / (M + d * _), n = b - C, n < -Math.PI ? C -= Pa : n > Math.PI && (C += Pa), this.lam0 = ut(0.5 * (b + C) - Math.atan(M * Math.tan(0.5 * this.B * (b - C)) / p) / this.B), x = Math.atan(2 * Math.sin(this.B * ut(b - this.lam0)) / (f - 1 / f)), S = B = Math.asin(l * Math.sin(x))), this.singam = Math.sin(x), this.cosgam = Math.cos(x), this.sinrot = Math.sin(S), this.cosrot = Math.cos(S), this.rB = 1 / this.B, this.ArB = this.A * this.rB, this.BrA = 1 / this.ArB, this.no_off ? this.u_0 = 0 : (this.u_0 = Math.abs(this.ArB * Math.atan(Math.sqrt(l * l - 1) / Math.cos(B))), this.lat0 < 0 && (this.u_0 = -this.u_0)), f = 0.5 * x, this.v_pole_n = this.ArB * Math.log(Math.tan(zt - f)), this.v_pole_s = this.ArB * Math.log(Math.tan(zt + f));
}
function Y2(n) {
  var i = {}, a, l, f, _, d, g, p, M;
  if (n.x = n.x - this.lam0, Math.abs(Math.abs(n.y) - Q) > st) {
    if (d = this.E / Math.pow(Dn(this.e, n.y, Math.sin(n.y)), this.B), g = 1 / d, a = 0.5 * (d - g), l = 0.5 * (d + g), _ = Math.sin(this.B * n.x), f = (a * this.singam - _ * this.cosgam) / l, Math.abs(Math.abs(f) - 1) < st)
      throw new Error();
    M = 0.5 * this.ArB * Math.log((1 - f) / (1 + f)), g = Math.cos(this.B * n.x), Math.abs(g) < Jr ? p = this.A * n.x : p = this.ArB * Math.atan2(a * this.cosgam + _ * this.singam, g);
  } else
    M = n.y > 0 ? this.v_pole_n : this.v_pole_s, p = this.ArB * n.y;
  return this.no_rot ? (i.x = p, i.y = M) : (p -= this.u_0, i.x = M * this.cosrot + p * this.sinrot, i.y = p * this.cosrot - M * this.sinrot), i.x = this.a * i.x + this.x0, i.y = this.a * i.y + this.y0, i;
}
function X2(n) {
  var i, a, l, f, _, d, g, p = {};
  if (n.x = (n.x - this.x0) * (1 / this.a), n.y = (n.y - this.y0) * (1 / this.a), this.no_rot ? (a = n.y, i = n.x) : (a = n.x * this.cosrot - n.y * this.sinrot, i = n.y * this.cosrot + n.x * this.sinrot + this.u_0), l = Math.exp(-this.BrA * a), f = 0.5 * (l - 1 / l), _ = 0.5 * (l + 1 / l), d = Math.sin(this.BrA * i), g = (d * this.cosgam + f * this.singam) / _, Math.abs(Math.abs(g) - 1) < st)
    p.x = 0, p.y = g < 0 ? -Q : Q;
  else {
    if (p.y = this.E / Math.sqrt((1 + g) / (1 - g)), p.y = ba(this.e, Math.pow(p.y, 1 / this.B)), p.y === 1 / 0)
      throw new Error();
    p.x = -this.rB * Math.atan2(f * this.cosgam - d * this.singam, Math.cos(this.BrA * i));
  }
  return p.x += this.lam0, p;
}
var W2 = ["Hotine_Oblique_Mercator", "Hotine Oblique Mercator", "Hotine_Oblique_Mercator_variant_A", "Hotine_Oblique_Mercator_Variant_B", "Hotine_Oblique_Mercator_Azimuth_Natural_Origin", "Hotine_Oblique_Mercator_Two_Point_Natural_Origin", "Hotine_Oblique_Mercator_Azimuth_Center", "Oblique_Mercator", "omerc"];
const $2 = {
  init: z2,
  forward: Y2,
  inverse: X2,
  names: W2
};
function H2() {
  if (this.lat2 || (this.lat2 = this.lat1), this.k0 || (this.k0 = 1), this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, !(Math.abs(this.lat1 + this.lat2) < st)) {
    var n = this.b / this.a;
    this.e = Math.sqrt(1 - n * n);
    var i = Math.sin(this.lat1), a = Math.cos(this.lat1), l = Jn(this.e, i, a), f = Dn(this.e, this.lat1, i), _ = Math.sin(this.lat2), d = Math.cos(this.lat2), g = Jn(this.e, _, d), p = Dn(this.e, this.lat2, _), M = Math.abs(Math.abs(this.lat0) - Q) < st ? 0 : Dn(this.e, this.lat0, Math.sin(this.lat0));
    Math.abs(this.lat1 - this.lat2) > st ? this.ns = Math.log(l / g) / Math.log(f / p) : this.ns = i, isNaN(this.ns) && (this.ns = i), this.f0 = l / (this.ns * Math.pow(f, this.ns)), this.rh = this.a * this.f0 * Math.pow(M, this.ns), this.title || (this.title = "Lambert Conformal Conic");
  }
}
function V2(n) {
  var i = n.x, a = n.y;
  Math.abs(2 * Math.abs(a) - Math.PI) <= st && (a = La(a) * (Q - 2 * st));
  var l = Math.abs(Math.abs(a) - Q), f, _;
  if (l > st)
    f = Dn(this.e, a, Math.sin(a)), _ = this.a * this.f0 * Math.pow(f, this.ns);
  else {
    if (l = a * this.ns, l <= 0)
      return null;
    _ = 0;
  }
  var d = this.ns * ut(i - this.long0);
  return n.x = this.k0 * (_ * Math.sin(d)) + this.x0, n.y = this.k0 * (this.rh - _ * Math.cos(d)) + this.y0, n;
}
function Z2(n) {
  var i, a, l, f, _, d = (n.x - this.x0) / this.k0, g = this.rh - (n.y - this.y0) / this.k0;
  this.ns > 0 ? (i = Math.sqrt(d * d + g * g), a = 1) : (i = -Math.sqrt(d * d + g * g), a = -1);
  var p = 0;
  if (i !== 0 && (p = Math.atan2(a * d, a * g)), i !== 0 || this.ns > 0) {
    if (a = 1 / this.ns, l = Math.pow(i / (this.a * this.f0), a), f = ba(this.e, l), f === -9999)
      return null;
  } else
    f = -Q;
  return _ = ut(p / this.ns + this.long0), n.x = _, n.y = f, n;
}
var K2 = [
  "Lambert Tangential Conformal Conic Projection",
  "Lambert_Conformal_Conic",
  "Lambert_Conformal_Conic_1SP",
  "Lambert_Conformal_Conic_2SP",
  "lcc",
  "Lambert Conic Conformal (1SP)",
  "Lambert Conic Conformal (2SP)"
];
const J2 = {
  init: H2,
  forward: V2,
  inverse: Z2,
  names: K2
};
function Q2() {
  this.a = 6377397155e-3, this.es = 0.006674372230614, this.e = Math.sqrt(this.es), this.lat0 || (this.lat0 = 0.863937979737193), this.long0 || (this.long0 = 0.7417649320975901 - 0.308341501185665), this.k0 || (this.k0 = 0.9999), this.s45 = 0.785398163397448, this.s90 = 2 * this.s45, this.fi0 = this.lat0, this.e2 = this.es, this.e = Math.sqrt(this.e2), this.alfa = Math.sqrt(1 + this.e2 * Math.pow(Math.cos(this.fi0), 4) / (1 - this.e2)), this.uq = 1.04216856380474, this.u0 = Math.asin(Math.sin(this.fi0) / this.alfa), this.g = Math.pow((1 + this.e * Math.sin(this.fi0)) / (1 - this.e * Math.sin(this.fi0)), this.alfa * this.e / 2), this.k = Math.tan(this.u0 / 2 + this.s45) / Math.pow(Math.tan(this.fi0 / 2 + this.s45), this.alfa) * this.g, this.k1 = this.k0, this.n0 = this.a * Math.sqrt(1 - this.e2) / (1 - this.e2 * Math.pow(Math.sin(this.fi0), 2)), this.s0 = 1.37008346281555, this.n = Math.sin(this.s0), this.ro0 = this.k1 * this.n0 / Math.tan(this.s0), this.ad = this.s90 - this.uq;
}
function j2(n) {
  var i, a, l, f, _, d, g, p = n.x, M = n.y, S = ut(p - this.long0);
  return i = Math.pow((1 + this.e * Math.sin(M)) / (1 - this.e * Math.sin(M)), this.alfa * this.e / 2), a = 2 * (Math.atan(this.k * Math.pow(Math.tan(M / 2 + this.s45), this.alfa) / i) - this.s45), l = -S * this.alfa, f = Math.asin(Math.cos(this.ad) * Math.sin(a) + Math.sin(this.ad) * Math.cos(a) * Math.cos(l)), _ = Math.asin(Math.cos(a) * Math.sin(l) / Math.cos(f)), d = this.n * _, g = this.ro0 * Math.pow(Math.tan(this.s0 / 2 + this.s45), this.n) / Math.pow(Math.tan(f / 2 + this.s45), this.n), n.y = g * Math.cos(d) / 1, n.x = g * Math.sin(d) / 1, this.czech || (n.y *= -1, n.x *= -1), n;
}
function tE(n) {
  var i, a, l, f, _, d, g, p, M = n.x;
  n.x = n.y, n.y = M, this.czech || (n.y *= -1, n.x *= -1), d = Math.sqrt(n.x * n.x + n.y * n.y), _ = Math.atan2(n.y, n.x), f = _ / Math.sin(this.s0), l = 2 * (Math.atan(Math.pow(this.ro0 / d, 1 / this.n) * Math.tan(this.s0 / 2 + this.s45)) - this.s45), i = Math.asin(Math.cos(this.ad) * Math.sin(l) - Math.sin(this.ad) * Math.cos(l) * Math.cos(f)), a = Math.asin(Math.cos(l) * Math.sin(f) / Math.cos(i)), n.x = this.long0 - a / this.alfa, g = i, p = 0;
  var S = 0;
  do
    n.y = 2 * (Math.atan(Math.pow(this.k, -1 / this.alfa) * Math.pow(Math.tan(i / 2 + this.s45), 1 / this.alfa) * Math.pow((1 + this.e * Math.sin(g)) / (1 - this.e * Math.sin(g)), this.e / 2)) - this.s45), Math.abs(g - n.y) < 1e-10 && (p = 1), g = n.y, S += 1;
  while (p === 0 && S < 15);
  return S >= 15 ? null : n;
}
var eE = ["Krovak", "krovak"];
const nE = {
  init: Q2,
  forward: j2,
  inverse: tE,
  names: eE
};
function Fe(n, i, a, l, f) {
  return n * f - i * Math.sin(2 * f) + a * Math.sin(4 * f) - l * Math.sin(6 * f);
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
function bl(n, i, a) {
  var l = i * a;
  return n / Math.sqrt(1 - l * l);
}
function Wi(n) {
  return Math.abs(n) < Q ? n : n - La(n) * Math.PI;
}
function wo(n, i, a, l, f) {
  var _, d;
  _ = n / i;
  for (var g = 0; g < 15; g++)
    if (d = (n - (i * _ - a * Math.sin(2 * _) + l * Math.sin(4 * _) - f * Math.sin(6 * _))) / (i - 2 * a * Math.cos(2 * _) + 4 * l * Math.cos(4 * _) - 6 * f * Math.cos(6 * _)), _ += d, Math.abs(d) <= 1e-10)
      return _;
  return NaN;
}
function iE() {
  this.sphere || (this.e0 = Oa(this.es), this.e1 = Ga(this.es), this.e2 = Da(this.es), this.e3 = Fa(this.es), this.ml0 = this.a * Fe(this.e0, this.e1, this.e2, this.e3, this.lat0));
}
function rE(n) {
  var i, a, l = n.x, f = n.y;
  if (l = ut(l - this.long0), this.sphere)
    i = this.a * Math.asin(Math.cos(f) * Math.sin(l)), a = this.a * (Math.atan2(Math.tan(f), Math.cos(l)) - this.lat0);
  else {
    var _ = Math.sin(f), d = Math.cos(f), g = bl(this.a, this.e, _), p = Math.tan(f) * Math.tan(f), M = l * Math.cos(f), S = M * M, x = this.es * d * d / (1 - this.es), w = this.a * Fe(this.e0, this.e1, this.e2, this.e3, f);
    i = g * M * (1 - S * p * (1 / 6 - (8 - p + 8 * x) * S / 120)), a = w - this.ml0 + g * _ / d * S * (0.5 + (5 - p + 6 * x) * S / 24);
  }
  return n.x = i + this.x0, n.y = a + this.y0, n;
}
function sE(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i = n.x / this.a, a = n.y / this.a, l, f;
  if (this.sphere) {
    var _ = a + this.lat0;
    l = Math.asin(Math.sin(_) * Math.cos(i)), f = Math.atan2(Math.tan(i), Math.cos(_));
  } else {
    var d = this.ml0 / this.a + a, g = wo(d, this.e0, this.e1, this.e2, this.e3);
    if (Math.abs(Math.abs(g) - Q) <= st)
      return n.x = this.long0, n.y = Q, a < 0 && (n.y *= -1), n;
    var p = bl(this.a, this.e, Math.sin(g)), M = p * p * p / this.a / this.a * (1 - this.es), S = Math.pow(Math.tan(g), 2), x = i * this.a / p, w = x * x;
    l = g - p * Math.tan(g) / M * x * x * (0.5 - (1 + 3 * S) * x * x / 24), f = x * (1 - w * (S / 3 + (1 + 3 * S) * S * w / 15)) / Math.cos(g);
  }
  return n.x = ut(f + this.long0), n.y = Wi(l), n;
}
var aE = ["Cassini", "Cassini_Soldner", "cass"];
const uE = {
  init: iE,
  forward: rE,
  inverse: sE,
  names: aE
};
function qi(n, i) {
  var a;
  return n > 1e-7 ? (a = n * i, (1 - n * n) * (i / (1 - a * a) - 0.5 / n * Math.log((1 - a) / (1 + a)))) : 2 * i;
}
var ll = 1, fl = 2, cl = 3, _o = 4;
function oE() {
  var n = Math.abs(this.lat0);
  if (Math.abs(n - Q) < st ? this.mode = this.lat0 < 0 ? ll : fl : Math.abs(n) < st ? this.mode = cl : this.mode = _o, this.es > 0) {
    var i;
    switch (this.qp = qi(this.e, 1), this.mmf = 0.5 / (1 - this.es), this.apa = mE(this.es), this.mode) {
      case fl:
        this.dd = 1;
        break;
      case ll:
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
function hE(n) {
  var i, a, l, f, _, d, g, p, M, S, x = n.x, w = n.y;
  if (x = ut(x - this.long0), this.sphere) {
    if (_ = Math.sin(w), S = Math.cos(w), l = Math.cos(x), this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      if (a = this.mode === this.EQUIT ? 1 + S * l : 1 + this.sinph0 * _ + this.cosph0 * S * l, a <= st)
        return null;
      a = Math.sqrt(2 / a), i = a * S * Math.sin(x), a *= this.mode === this.EQUIT ? _ : this.cosph0 * _ - this.sinph0 * S * l;
    } else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
      if (this.mode === this.N_POLE && (l = -l), Math.abs(w + this.lat0) < st)
        return null;
      a = zt - w * 0.5, a = 2 * (this.mode === this.S_POLE ? Math.cos(a) : Math.sin(a)), i = a * Math.sin(x), a *= l;
    }
  } else {
    switch (g = 0, p = 0, M = 0, l = Math.cos(x), f = Math.sin(x), _ = Math.sin(w), d = qi(this.e, _), (this.mode === this.OBLIQ || this.mode === this.EQUIT) && (g = d / this.qp, p = Math.sqrt(1 - g * g)), this.mode) {
      case this.OBLIQ:
        M = 1 + this.sinb1 * g + this.cosb1 * p * l;
        break;
      case this.EQUIT:
        M = 1 + p * l;
        break;
      case this.N_POLE:
        M = Q + w, d = this.qp - d;
        break;
      case this.S_POLE:
        M = w - Q, d = this.qp + d;
        break;
    }
    if (Math.abs(M) < st)
      return null;
    switch (this.mode) {
      case this.OBLIQ:
      case this.EQUIT:
        M = Math.sqrt(2 / M), this.mode === this.OBLIQ ? a = this.ymf * M * (this.cosb1 * g - this.sinb1 * p * l) : a = (M = Math.sqrt(2 / (1 + p * l))) * g * this.ymf, i = this.xmf * M * p * f;
        break;
      case this.N_POLE:
      case this.S_POLE:
        d >= 0 ? (i = (M = Math.sqrt(d)) * f, a = l * (this.mode === this.S_POLE ? M : -M)) : i = a = 0;
        break;
    }
  }
  return n.x = this.a * i + this.x0, n.y = this.a * a + this.y0, n;
}
function lE(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i = n.x / this.a, a = n.y / this.a, l, f, _, d, g, p, M;
  if (this.sphere) {
    var S = 0, x, w = 0;
    if (x = Math.sqrt(i * i + a * a), f = x * 0.5, f > 1)
      return null;
    switch (f = 2 * Math.asin(f), (this.mode === this.OBLIQ || this.mode === this.EQUIT) && (w = Math.sin(f), S = Math.cos(f)), this.mode) {
      case this.EQUIT:
        f = Math.abs(x) <= st ? 0 : Math.asin(a * w / x), i *= w, a = S * x;
        break;
      case this.OBLIQ:
        f = Math.abs(x) <= st ? this.lat0 : Math.asin(S * this.sinph0 + a * w * this.cosph0 / x), i *= w * this.cosph0, a = (S - Math.sin(f) * this.sinph0) * x;
        break;
      case this.N_POLE:
        a = -a, f = Q - f;
        break;
      case this.S_POLE:
        f -= Q;
        break;
    }
    l = a === 0 && (this.mode === this.EQUIT || this.mode === this.OBLIQ) ? 0 : Math.atan2(i, a);
  } else {
    if (M = 0, this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      if (i /= this.dd, a *= this.dd, p = Math.sqrt(i * i + a * a), p < st)
        return n.x = this.long0, n.y = this.lat0, n;
      d = 2 * Math.asin(0.5 * p / this.rq), _ = Math.cos(d), i *= d = Math.sin(d), this.mode === this.OBLIQ ? (M = _ * this.sinb1 + a * d * this.cosb1 / p, g = this.qp * M, a = p * this.cosb1 * _ - a * this.sinb1 * d) : (M = a * d / p, g = this.qp * M, a = p * _);
    } else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
      if (this.mode === this.N_POLE && (a = -a), g = i * i + a * a, !g)
        return n.x = this.long0, n.y = this.lat0, n;
      M = 1 - g / this.qp, this.mode === this.S_POLE && (M = -M);
    }
    l = Math.atan2(i, a), f = yE(Math.asin(M), this.apa);
  }
  return n.x = ut(this.long0 + l), n.y = f, n;
}
var fE = 0.3333333333333333, cE = 0.17222222222222222, gE = 0.10257936507936508, vE = 0.06388888888888888, _E = 0.0664021164021164, dE = 0.016415012942191543;
function mE(n) {
  var i, a = [];
  return a[0] = n * fE, i = n * n, a[0] += i * cE, a[1] = i * vE, i *= n, a[0] += i * gE, a[1] += i * _E, a[2] = i * dE, a;
}
function yE(n, i) {
  var a = n + n;
  return n + i[0] * Math.sin(a) + i[1] * Math.sin(a + a) + i[2] * Math.sin(a + a + a);
}
var pE = ["Lambert Azimuthal Equal Area", "Lambert_Azimuthal_Equal_Area", "laea"];
const EE = {
  init: oE,
  forward: hE,
  inverse: lE,
  names: pE,
  S_POLE: ll,
  N_POLE: fl,
  EQUIT: cl,
  OBLIQ: _o
};
function zi(n) {
  return Math.abs(n) > 1 && (n = n > 1 ? 1 : -1), Math.asin(n);
}
function xE() {
  Math.abs(this.lat1 + this.lat2) < st || (this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e3 = Math.sqrt(this.es), this.sin_po = Math.sin(this.lat1), this.cos_po = Math.cos(this.lat1), this.t1 = this.sin_po, this.con = this.sin_po, this.ms1 = Jn(this.e3, this.sin_po, this.cos_po), this.qs1 = qi(this.e3, this.sin_po), this.sin_po = Math.sin(this.lat2), this.cos_po = Math.cos(this.lat2), this.t2 = this.sin_po, this.ms2 = Jn(this.e3, this.sin_po, this.cos_po), this.qs2 = qi(this.e3, this.sin_po), this.sin_po = Math.sin(this.lat0), this.cos_po = Math.cos(this.lat0), this.t3 = this.sin_po, this.qs0 = qi(this.e3, this.sin_po), Math.abs(this.lat1 - this.lat2) > st ? this.ns0 = (this.ms1 * this.ms1 - this.ms2 * this.ms2) / (this.qs2 - this.qs1) : this.ns0 = this.con, this.c = this.ms1 * this.ms1 + this.ns0 * this.qs1, this.rh = this.a * Math.sqrt(this.c - this.ns0 * this.qs0) / this.ns0);
}
function ME(n) {
  var i = n.x, a = n.y;
  this.sin_phi = Math.sin(a), this.cos_phi = Math.cos(a);
  var l = qi(this.e3, this.sin_phi), f = this.a * Math.sqrt(this.c - this.ns0 * l) / this.ns0, _ = this.ns0 * ut(i - this.long0), d = f * Math.sin(_) + this.x0, g = this.rh - f * Math.cos(_) + this.y0;
  return n.x = d, n.y = g, n;
}
function wE(n) {
  var i, a, l, f, _, d;
  return n.x -= this.x0, n.y = this.rh - n.y + this.y0, this.ns0 >= 0 ? (i = Math.sqrt(n.x * n.x + n.y * n.y), l = 1) : (i = -Math.sqrt(n.x * n.x + n.y * n.y), l = -1), f = 0, i !== 0 && (f = Math.atan2(l * n.x, l * n.y)), l = i * this.ns0 / this.a, this.sphere ? d = Math.asin((this.c - l * l) / (2 * this.ns0)) : (a = (this.c - l * l) / this.ns0, d = this.phi1z(this.e3, a)), _ = ut(f / this.ns0 + this.long0), n.x = _, n.y = d, n;
}
function SE(n, i) {
  var a, l, f, _, d, g = zi(0.5 * i);
  if (n < st)
    return g;
  for (var p = n * n, M = 1; M <= 25; M++)
    if (a = Math.sin(g), l = Math.cos(g), f = n * a, _ = 1 - f * f, d = 0.5 * _ * _ / l * (i / (1 - p) - a / _ + 0.5 / n * Math.log((1 - f) / (1 + f))), g = g + d, Math.abs(d) <= 1e-7)
      return g;
  return null;
}
var IE = ["Albers_Conic_Equal_Area", "Albers_Equal_Area", "Albers", "aea"];
const NE = {
  init: xE,
  forward: ME,
  inverse: wE,
  names: IE,
  phi1z: SE
};
function kE() {
  this.sin_p14 = Math.sin(this.lat0), this.cos_p14 = Math.cos(this.lat0), this.infinity_dist = 1e3 * this.a, this.rc = 1;
}
function PE(n) {
  var i, a, l, f, _, d, g, p, M = n.x, S = n.y;
  return l = ut(M - this.long0), i = Math.sin(S), a = Math.cos(S), f = Math.cos(l), d = this.sin_p14 * i + this.cos_p14 * a * f, _ = 1, d > 0 || Math.abs(d) <= st ? (g = this.x0 + this.a * _ * a * Math.sin(l) / d, p = this.y0 + this.a * _ * (this.cos_p14 * i - this.sin_p14 * a * f) / d) : (g = this.x0 + this.infinity_dist * a * Math.sin(l), p = this.y0 + this.infinity_dist * (this.cos_p14 * i - this.sin_p14 * a * f)), n.x = g, n.y = p, n;
}
function CE(n) {
  var i, a, l, f, _, d;
  return n.x = (n.x - this.x0) / this.a, n.y = (n.y - this.y0) / this.a, n.x /= this.k0, n.y /= this.k0, (i = Math.sqrt(n.x * n.x + n.y * n.y)) ? (f = Math.atan2(i, this.rc), a = Math.sin(f), l = Math.cos(f), d = zi(l * this.sin_p14 + n.y * a * this.cos_p14 / i), _ = Math.atan2(n.x * a, i * this.cos_p14 * l - n.y * this.sin_p14 * a), _ = ut(this.long0 + _)) : (d = this.phic0, _ = 0), n.x = _, n.y = d, n;
}
var bE = ["gnom"];
const RE = {
  init: kE,
  forward: PE,
  inverse: CE,
  names: bE
};
function AE(n, i) {
  var a = 1 - (1 - n * n) / (2 * n) * Math.log((1 - n) / (1 + n));
  if (Math.abs(Math.abs(i) - a) < 1e-6)
    return i < 0 ? -1 * Q : Q;
  for (var l = Math.asin(0.5 * i), f, _, d, g, p = 0; p < 30; p++)
    if (_ = Math.sin(l), d = Math.cos(l), g = n * _, f = Math.pow(1 - g * g, 2) / (2 * d) * (i / (1 - n * n) - _ / (1 - g * g) + 0.5 / n * Math.log((1 - g) / (1 + g))), l += f, Math.abs(f) <= 1e-10)
      return l;
  return NaN;
}
function TE() {
  this.sphere || (this.k0 = Jn(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)));
}
function LE(n) {
  var i = n.x, a = n.y, l, f, _ = ut(i - this.long0);
  if (this.sphere)
    l = this.x0 + this.a * _ * Math.cos(this.lat_ts), f = this.y0 + this.a * Math.sin(a) / Math.cos(this.lat_ts);
  else {
    var d = qi(this.e, Math.sin(a));
    l = this.x0 + this.a * this.k0 * _, f = this.y0 + this.a * d * 0.5 / this.k0;
  }
  return n.x = l, n.y = f, n;
}
function OE(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i, a;
  return this.sphere ? (i = ut(this.long0 + n.x / this.a / Math.cos(this.lat_ts)), a = Math.asin(n.y / this.a * Math.cos(this.lat_ts))) : (a = AE(this.e, 2 * n.y * this.k0 / this.a), i = ut(this.long0 + n.x / (this.a * this.k0))), n.x = i, n.y = a, n;
}
var GE = ["cea"];
const DE = {
  init: TE,
  forward: LE,
  inverse: OE,
  names: GE
};
function FE() {
  this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.lat0 = this.lat0 || 0, this.long0 = this.long0 || 0, this.lat_ts = this.lat_ts || 0, this.title = this.title || "Equidistant Cylindrical (Plate Carre)", this.rc = Math.cos(this.lat_ts);
}
function qE(n) {
  var i = n.x, a = n.y, l = ut(i - this.long0), f = Wi(a - this.lat0);
  return n.x = this.x0 + this.a * l * this.rc, n.y = this.y0 + this.a * f, n;
}
function BE(n) {
  var i = n.x, a = n.y;
  return n.x = ut(this.long0 + (i - this.x0) / (this.a * this.rc)), n.y = Wi(this.lat0 + (a - this.y0) / this.a), n;
}
var UE = ["Equirectangular", "Equidistant_Cylindrical", "Equidistant_Cylindrical_Spherical", "eqc"];
const zE = {
  init: FE,
  forward: qE,
  inverse: BE,
  names: UE
};
var Yc = 20;
function YE() {
  this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e = Math.sqrt(this.es), this.e0 = Oa(this.es), this.e1 = Ga(this.es), this.e2 = Da(this.es), this.e3 = Fa(this.es), this.ml0 = this.a * Fe(this.e0, this.e1, this.e2, this.e3, this.lat0);
}
function XE(n) {
  var i = n.x, a = n.y, l, f, _, d = ut(i - this.long0);
  if (_ = d * Math.sin(a), this.sphere)
    Math.abs(a) <= st ? (l = this.a * d, f = -1 * this.a * this.lat0) : (l = this.a * Math.sin(_) / Math.tan(a), f = this.a * (Wi(a - this.lat0) + (1 - Math.cos(_)) / Math.tan(a)));
  else if (Math.abs(a) <= st)
    l = this.a * d, f = -1 * this.ml0;
  else {
    var g = bl(this.a, this.e, Math.sin(a)) / Math.tan(a);
    l = g * Math.sin(_), f = this.a * Fe(this.e0, this.e1, this.e2, this.e3, a) - this.ml0 + g * (1 - Math.cos(_));
  }
  return n.x = l + this.x0, n.y = f + this.y0, n;
}
function WE(n) {
  var i, a, l, f, _, d, g, p, M;
  if (l = n.x - this.x0, f = n.y - this.y0, this.sphere)
    if (Math.abs(f + this.a * this.lat0) <= st)
      i = ut(l / this.a + this.long0), a = 0;
    else {
      d = this.lat0 + f / this.a, g = l * l / this.a / this.a + d * d, p = d;
      var S;
      for (_ = Yc; _; --_)
        if (S = Math.tan(p), M = -1 * (d * (p * S + 1) - p - 0.5 * (p * p + g) * S) / ((p - d) / S - 1), p += M, Math.abs(M) <= st) {
          a = p;
          break;
        }
      i = ut(this.long0 + Math.asin(l * Math.tan(p) / this.a) / Math.sin(a));
    }
  else if (Math.abs(f + this.ml0) <= st)
    a = 0, i = ut(this.long0 + l / this.a);
  else {
    d = (this.ml0 + f) / this.a, g = l * l / this.a / this.a + d * d, p = d;
    var x, w, b, C, G;
    for (_ = Yc; _; --_)
      if (G = this.e * Math.sin(p), x = Math.sqrt(1 - G * G) * Math.tan(p), w = this.a * Fe(this.e0, this.e1, this.e2, this.e3, p), b = this.e0 - 2 * this.e1 * Math.cos(2 * p) + 4 * this.e2 * Math.cos(4 * p) - 6 * this.e3 * Math.cos(6 * p), C = w / this.a, M = (d * (x * C + 1) - C - 0.5 * x * (C * C + g)) / (this.es * Math.sin(2 * p) * (C * C + g - 2 * d * C) / (4 * x) + (d - C) * (x * b - 2 / Math.sin(2 * p)) - b), p -= M, Math.abs(M) <= st) {
        a = p;
        break;
      }
    x = Math.sqrt(1 - this.es * Math.pow(Math.sin(a), 2)) * Math.tan(a), i = ut(this.long0 + Math.asin(l * x / this.a) / Math.sin(a));
  }
  return n.x = i, n.y = a, n;
}
var $E = ["Polyconic", "American_Polyconic", "poly"];
const HE = {
  init: YE,
  forward: XE,
  inverse: WE,
  names: $E
};
function VE() {
  this.A = [], this.A[1] = 0.6399175073, this.A[2] = -0.1358797613, this.A[3] = 0.063294409, this.A[4] = -0.02526853, this.A[5] = 0.0117879, this.A[6] = -55161e-7, this.A[7] = 26906e-7, this.A[8] = -1333e-6, this.A[9] = 67e-5, this.A[10] = -34e-5, this.B_re = [], this.B_im = [], this.B_re[1] = 0.7557853228, this.B_im[1] = 0, this.B_re[2] = 0.249204646, this.B_im[2] = 3371507e-9, this.B_re[3] = -1541739e-9, this.B_im[3] = 0.04105856, this.B_re[4] = -0.10162907, this.B_im[4] = 0.01727609, this.B_re[5] = -0.26623489, this.B_im[5] = -0.36249218, this.B_re[6] = -0.6870983, this.B_im[6] = -1.1651967, this.C_re = [], this.C_im = [], this.C_re[1] = 1.3231270439, this.C_im[1] = 0, this.C_re[2] = -0.577245789, this.C_im[2] = -7809598e-9, this.C_re[3] = 0.508307513, this.C_im[3] = -0.112208952, this.C_re[4] = -0.15094762, this.C_im[4] = 0.18200602, this.C_re[5] = 1.01418179, this.C_im[5] = 1.64497696, this.C_re[6] = 1.9660549, this.C_im[6] = 2.5127645, this.D = [], this.D[1] = 1.5627014243, this.D[2] = 0.5185406398, this.D[3] = -0.03333098, this.D[4] = -0.1052906, this.D[5] = -0.0368594, this.D[6] = 7317e-6, this.D[7] = 0.0122, this.D[8] = 394e-5, this.D[9] = -13e-4;
}
function ZE(n) {
  var i, a = n.x, l = n.y, f = l - this.lat0, _ = a - this.long0, d = f / wa * 1e-5, g = _, p = 1, M = 0;
  for (i = 1; i <= 10; i++)
    p = p * d, M = M + this.A[i] * p;
  var S = M, x = g, w = 1, b = 0, C, G, O = 0, B = 0;
  for (i = 1; i <= 6; i++)
    C = w * S - b * x, G = b * S + w * x, w = C, b = G, O = O + this.B_re[i] * w - this.B_im[i] * b, B = B + this.B_im[i] * w + this.B_re[i] * b;
  return n.x = B * this.a + this.x0, n.y = O * this.a + this.y0, n;
}
function KE(n) {
  var i, a = n.x, l = n.y, f = a - this.x0, _ = l - this.y0, d = _ / this.a, g = f / this.a, p = 1, M = 0, S, x, w = 0, b = 0;
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
var JE = ["New_Zealand_Map_Grid", "nzmg"];
const QE = {
  init: VE,
  forward: ZE,
  inverse: KE,
  names: JE
};
function jE() {
}
function tx(n) {
  var i = n.x, a = n.y, l = ut(i - this.long0), f = this.x0 + this.a * l, _ = this.y0 + this.a * Math.log(Math.tan(Math.PI / 4 + a / 2.5)) * 1.25;
  return n.x = f, n.y = _, n;
}
function ex(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i = ut(this.long0 + n.x / this.a), a = 2.5 * (Math.atan(Math.exp(0.8 * n.y / this.a)) - Math.PI / 4);
  return n.x = i, n.y = a, n;
}
var nx = ["Miller_Cylindrical", "mill"];
const ix = {
  init: jE,
  forward: tx,
  inverse: ex,
  names: nx
};
var rx = 20;
function sx() {
  this.sphere ? (this.n = 1, this.m = 0, this.es = 0, this.C_y = Math.sqrt((this.m + 1) / this.n), this.C_x = this.C_y / (this.m + 1)) : this.en = Sl(this.es);
}
function ax(n) {
  var i, a, l = n.x, f = n.y;
  if (l = ut(l - this.long0), this.sphere) {
    if (!this.m)
      f = this.n !== 1 ? Math.asin(this.n * Math.sin(f)) : f;
    else
      for (var _ = this.n * Math.sin(f), d = rx; d; --d) {
        var g = (this.m * f + Math.sin(f) - _) / (this.m + Math.cos(f));
        if (f -= g, Math.abs(g) < st)
          break;
      }
    i = this.a * this.C_x * l * (this.m + Math.cos(f)), a = this.a * this.C_y * f;
  } else {
    var p = Math.sin(f), M = Math.cos(f);
    a = this.a * gs(f, p, M, this.en), i = this.a * l * M / Math.sqrt(1 - this.es * p * p);
  }
  return n.x = i, n.y = a, n;
}
function ux(n) {
  var i, a, l, f;
  return n.x -= this.x0, l = n.x / this.a, n.y -= this.y0, i = n.y / this.a, this.sphere ? (i /= this.C_y, l = l / (this.C_x * (this.m + Math.cos(i))), this.m ? i = zi((this.m * i + Math.sin(i)) / this.n) : this.n !== 1 && (i = zi(Math.sin(i) / this.n)), l = ut(l + this.long0), i = Wi(i)) : (i = Il(n.y / this.a, this.es, this.en), f = Math.abs(i), f < Q ? (f = Math.sin(i), a = this.long0 + n.x * Math.sqrt(1 - this.es * f * f) / (this.a * Math.cos(i)), l = ut(a)) : f - st < Q && (l = this.long0)), n.x = l, n.y = i, n;
}
var ox = ["Sinusoidal", "sinu"];
const hx = {
  init: sx,
  forward: ax,
  inverse: ux,
  names: ox
};
function lx() {
}
function fx(n) {
  for (var i = n.x, a = n.y, l = ut(i - this.long0), f = a, _ = Math.PI * Math.sin(a); ; ) {
    var d = -(f + Math.sin(f) - _) / (1 + Math.cos(f));
    if (f += d, Math.abs(d) < st)
      break;
  }
  f /= 2, Math.PI / 2 - Math.abs(a) < st && (l = 0);
  var g = 0.900316316158 * this.a * l * Math.cos(f) + this.x0, p = 1.4142135623731 * this.a * Math.sin(f) + this.y0;
  return n.x = g, n.y = p, n;
}
function cx(n) {
  var i, a;
  n.x -= this.x0, n.y -= this.y0, a = n.y / (1.4142135623731 * this.a), Math.abs(a) > 0.999999999999 && (a = 0.999999999999), i = Math.asin(a);
  var l = ut(this.long0 + n.x / (0.900316316158 * this.a * Math.cos(i)));
  l < -Math.PI && (l = -Math.PI), l > Math.PI && (l = Math.PI), a = (2 * i + Math.sin(2 * i)) / Math.PI, Math.abs(a) > 1 && (a = 1);
  var f = Math.asin(a);
  return n.x = l, n.y = f, n;
}
var gx = ["Mollweide", "moll"];
const vx = {
  init: lx,
  forward: fx,
  inverse: cx,
  names: gx
};
function _x() {
  Math.abs(this.lat1 + this.lat2) < st || (this.lat2 = this.lat2 || this.lat1, this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e = Math.sqrt(this.es), this.e0 = Oa(this.es), this.e1 = Ga(this.es), this.e2 = Da(this.es), this.e3 = Fa(this.es), this.sin_phi = Math.sin(this.lat1), this.cos_phi = Math.cos(this.lat1), this.ms1 = Jn(this.e, this.sin_phi, this.cos_phi), this.ml1 = Fe(this.e0, this.e1, this.e2, this.e3, this.lat1), Math.abs(this.lat1 - this.lat2) < st ? this.ns = this.sin_phi : (this.sin_phi = Math.sin(this.lat2), this.cos_phi = Math.cos(this.lat2), this.ms2 = Jn(this.e, this.sin_phi, this.cos_phi), this.ml2 = Fe(this.e0, this.e1, this.e2, this.e3, this.lat2), this.ns = (this.ms1 - this.ms2) / (this.ml2 - this.ml1)), this.g = this.ml1 + this.ms1 / this.ns, this.ml0 = Fe(this.e0, this.e1, this.e2, this.e3, this.lat0), this.rh = this.a * (this.g - this.ml0));
}
function dx(n) {
  var i = n.x, a = n.y, l;
  if (this.sphere)
    l = this.a * (this.g - a);
  else {
    var f = Fe(this.e0, this.e1, this.e2, this.e3, a);
    l = this.a * (this.g - f);
  }
  var _ = this.ns * ut(i - this.long0), d = this.x0 + l * Math.sin(_), g = this.y0 + this.rh - l * Math.cos(_);
  return n.x = d, n.y = g, n;
}
function mx(n) {
  n.x -= this.x0, n.y = this.rh - n.y + this.y0;
  var i, a, l, f;
  this.ns >= 0 ? (a = Math.sqrt(n.x * n.x + n.y * n.y), i = 1) : (a = -Math.sqrt(n.x * n.x + n.y * n.y), i = -1);
  var _ = 0;
  if (a !== 0 && (_ = Math.atan2(i * n.x, i * n.y)), this.sphere)
    return f = ut(this.long0 + _ / this.ns), l = Wi(this.g - a / this.a), n.x = f, n.y = l, n;
  var d = this.g - a / this.a;
  return l = wo(d, this.e0, this.e1, this.e2, this.e3), f = ut(this.long0 + _ / this.ns), n.x = f, n.y = l, n;
}
var yx = ["Equidistant_Conic", "eqdc"];
const px = {
  init: _x,
  forward: dx,
  inverse: mx,
  names: yx
};
function Ex() {
  this.R = this.a;
}
function xx(n) {
  var i = n.x, a = n.y, l = ut(i - this.long0), f, _;
  Math.abs(a) <= st && (f = this.x0 + this.R * l, _ = this.y0);
  var d = zi(2 * Math.abs(a / Math.PI));
  (Math.abs(l) <= st || Math.abs(Math.abs(a) - Q) <= st) && (f = this.x0, a >= 0 ? _ = this.y0 + Math.PI * this.R * Math.tan(0.5 * d) : _ = this.y0 + Math.PI * this.R * -Math.tan(0.5 * d));
  var g = 0.5 * Math.abs(Math.PI / l - l / Math.PI), p = g * g, M = Math.sin(d), S = Math.cos(d), x = S / (M + S - 1), w = x * x, b = x * (2 / M - 1), C = b * b, G = Math.PI * this.R * (g * (x - C) + Math.sqrt(p * (x - C) * (x - C) - (C + p) * (w - C))) / (C + p);
  l < 0 && (G = -G), f = this.x0 + G;
  var O = p + x;
  return G = Math.PI * this.R * (b * O - g * Math.sqrt((C + p) * (p + 1) - O * O)) / (C + p), a >= 0 ? _ = this.y0 + G : _ = this.y0 - G, n.x = f, n.y = _, n;
}
function Mx(n) {
  var i, a, l, f, _, d, g, p, M, S, x, w, b;
  return n.x -= this.x0, n.y -= this.y0, x = Math.PI * this.R, l = n.x / x, f = n.y / x, _ = l * l + f * f, d = -Math.abs(f) * (1 + _), g = d - 2 * f * f + l * l, p = -2 * d + 1 + 2 * f * f + _ * _, b = f * f / p + (2 * g * g * g / p / p / p - 9 * d * g / p / p) / 27, M = (d - g * g / 3 / p) / p, S = 2 * Math.sqrt(-M / 3), x = 3 * b / M / S, Math.abs(x) > 1 && (x >= 0 ? x = 1 : x = -1), w = Math.acos(x) / 3, n.y >= 0 ? a = (-S * Math.cos(w + Math.PI / 3) - g / 3 / p) * Math.PI : a = -(-S * Math.cos(w + Math.PI / 3) - g / 3 / p) * Math.PI, Math.abs(l) < st ? i = this.long0 : i = ut(this.long0 + Math.PI * (_ - 1 + Math.sqrt(1 + 2 * (l * l - f * f) + _ * _)) / 2 / l), n.x = i, n.y = a, n;
}
var wx = ["Van_der_Grinten_I", "VanDerGrinten", "Van_der_Grinten", "vandg"];
const Sx = {
  init: Ex,
  forward: xx,
  inverse: Mx,
  names: wx
};
function Ix(n, i, a, l, f, _) {
  const d = l - i, g = Math.atan((1 - _) * Math.tan(n)), p = Math.atan((1 - _) * Math.tan(a)), M = Math.sin(g), S = Math.cos(g), x = Math.sin(p), w = Math.cos(p);
  let b = d, C, G = 100, O, B, z, Y, W, X, V, K, et, j, vt, _t, Mt, kt;
  do {
    if (O = Math.sin(b), B = Math.cos(b), z = Math.sqrt(
      w * O * (w * O) + (S * x - M * w * B) * (S * x - M * w * B)
    ), z === 0)
      return { azi1: 0, s12: 0 };
    Y = M * x + S * w * B, W = Math.atan2(z, Y), X = S * w * O / z, V = 1 - X * X, K = V !== 0 ? Y - 2 * M * x / V : 0, et = _ / 16 * V * (4 + _ * (4 - 3 * V)), C = b, b = d + (1 - et) * _ * X * (W + et * z * (K + et * Y * (-1 + 2 * K * K)));
  } while (Math.abs(b - C) > 1e-12 && --G > 0);
  return G === 0 ? { azi1: NaN, s12: NaN } : (j = V * (f * f - f * (1 - _) * (f * (1 - _))) / (f * (1 - _) * (f * (1 - _))), vt = 1 + j / 16384 * (4096 + j * (-768 + j * (320 - 175 * j))), _t = j / 1024 * (256 + j * (-128 + j * (74 - 47 * j))), Mt = _t * z * (K + _t / 4 * (Y * (-1 + 2 * K * K) - _t / 6 * K * (-3 + 4 * z * z) * (-3 + 4 * K * K))), kt = f * (1 - _) * vt * (W - Mt), { azi1: Math.atan2(w * O, S * x - M * w * B), s12: kt });
}
function Nx(n, i, a, l, f, _) {
  const d = Math.atan((1 - _) * Math.tan(n)), g = Math.sin(d), p = Math.cos(d), M = Math.sin(a), S = Math.cos(a), x = Math.atan2(g, p * S), w = p * M, b = 1 - w * w, C = b * (f * f - f * (1 - _) * (f * (1 - _))) / (f * (1 - _) * (f * (1 - _))), G = 1 + C / 16384 * (4096 + C * (-768 + C * (320 - 175 * C))), O = C / 1024 * (256 + C * (-128 + C * (74 - 47 * C)));
  let B = l / (f * (1 - _) * G), z, Y = 100, W, X, V, K;
  do
    W = Math.cos(2 * x + B), X = Math.sin(B), V = Math.cos(B), K = O * X * (W + O / 4 * (V * (-1 + 2 * W * W) - O / 6 * W * (-3 + 4 * X * X) * (-3 + 4 * W * W))), z = B, B = l / (f * (1 - _) * G) + K;
  while (Math.abs(B - z) > 1e-12 && --Y > 0);
  if (Y === 0)
    return { lat2: NaN, lon2: NaN };
  const et = g * X - p * V * S, j = Math.atan2(
    g * V + p * X * S,
    (1 - _) * Math.sqrt(w * w + et * et)
  ), vt = Math.atan2(
    X * M,
    p * V - g * X * S
  ), _t = _ / 16 * b * (4 + _ * (4 - 3 * b)), Mt = vt - (1 - _t) * _ * w * (B + _t * X * (W + _t * V * (-1 + 2 * W * W))), kt = i + Mt;
  return { lat2: j, lon2: kt };
}
function kx() {
  this.sin_p12 = Math.sin(this.lat0), this.cos_p12 = Math.cos(this.lat0), this.f = this.es / (1 + Math.sqrt(1 - this.es));
}
function Px(n) {
  var i = n.x, a = n.y, l = Math.sin(n.y), f = Math.cos(n.y), _ = ut(i - this.long0), d, g, p, M, S, x, w, b, C, G, O;
  return this.sphere ? Math.abs(this.sin_p12 - 1) <= st ? (n.x = this.x0 + this.a * (Q - a) * Math.sin(_), n.y = this.y0 - this.a * (Q - a) * Math.cos(_), n) : Math.abs(this.sin_p12 + 1) <= st ? (n.x = this.x0 + this.a * (Q + a) * Math.sin(_), n.y = this.y0 + this.a * (Q + a) * Math.cos(_), n) : (C = this.sin_p12 * l + this.cos_p12 * f * Math.cos(_), w = Math.acos(C), b = w ? w / Math.sin(w) : 1, n.x = this.x0 + this.a * b * f * Math.sin(_), n.y = this.y0 + this.a * b * (this.cos_p12 * l - this.sin_p12 * f * Math.cos(_)), n) : (d = Oa(this.es), g = Ga(this.es), p = Da(this.es), M = Fa(this.es), Math.abs(this.sin_p12 - 1) <= st ? (S = this.a * Fe(d, g, p, M, Q), x = this.a * Fe(d, g, p, M, a), n.x = this.x0 + (S - x) * Math.sin(_), n.y = this.y0 - (S - x) * Math.cos(_), n) : Math.abs(this.sin_p12 + 1) <= st ? (S = this.a * Fe(d, g, p, M, Q), x = this.a * Fe(d, g, p, M, a), n.x = this.x0 + (S + x) * Math.sin(_), n.y = this.y0 + (S + x) * Math.cos(_), n) : Math.abs(i) < st && Math.abs(a - this.lat0) < st ? (n.x = n.y = 0, n) : (G = Ix(this.lat0, this.long0, a, i, this.a, this.f), O = G.azi1, n.x = G.s12 * Math.sin(O), n.y = G.s12 * Math.cos(O), n));
}
function Cx(n) {
  n.x -= this.x0, n.y -= this.y0;
  var i, a, l, f, _, d, g, p, M, S, x, w, b, C, G, O;
  return this.sphere ? (i = Math.sqrt(n.x * n.x + n.y * n.y), i > 2 * Q * this.a ? void 0 : (a = i / this.a, l = Math.sin(a), f = Math.cos(a), _ = this.long0, Math.abs(i) <= st ? d = this.lat0 : (d = zi(f * this.sin_p12 + n.y * l * this.cos_p12 / i), g = Math.abs(this.lat0) - Q, Math.abs(g) <= st ? this.lat0 >= 0 ? _ = ut(this.long0 + Math.atan2(n.x, -n.y)) : _ = ut(this.long0 - Math.atan2(-n.x, n.y)) : _ = ut(this.long0 + Math.atan2(n.x * l, i * this.cos_p12 * f - n.y * this.sin_p12 * l))), n.x = _, n.y = d, n)) : (p = Oa(this.es), M = Ga(this.es), S = Da(this.es), x = Fa(this.es), Math.abs(this.sin_p12 - 1) <= st ? (w = this.a * Fe(p, M, S, x, Q), i = Math.sqrt(n.x * n.x + n.y * n.y), b = w - i, d = wo(b / this.a, p, M, S, x), _ = ut(this.long0 + Math.atan2(n.x, -1 * n.y)), n.x = _, n.y = d, n) : Math.abs(this.sin_p12 + 1) <= st ? (w = this.a * Fe(p, M, S, x, Q), i = Math.sqrt(n.x * n.x + n.y * n.y), b = i - w, d = wo(b / this.a, p, M, S, x), _ = ut(this.long0 + Math.atan2(n.x, n.y)), n.x = _, n.y = d, n) : (C = Math.atan2(n.x, n.y), G = Math.sqrt(n.x * n.x + n.y * n.y), O = Nx(this.lat0, this.long0, C, G, this.a, this.f), n.x = O.lon2, n.y = O.lat2, n));
}
var bx = ["Azimuthal_Equidistant", "aeqd"];
const Rx = {
  init: kx,
  forward: Px,
  inverse: Cx,
  names: bx
};
function Ax() {
  this.sin_p14 = Math.sin(this.lat0), this.cos_p14 = Math.cos(this.lat0);
}
function Tx(n) {
  var i, a, l, f, _, d, g, p, M = n.x, S = n.y;
  return l = ut(M - this.long0), i = Math.sin(S), a = Math.cos(S), f = Math.cos(l), d = this.sin_p14 * i + this.cos_p14 * a * f, _ = 1, (d > 0 || Math.abs(d) <= st) && (g = this.a * _ * a * Math.sin(l), p = this.y0 + this.a * _ * (this.cos_p14 * i - this.sin_p14 * a * f)), n.x = g, n.y = p, n;
}
function Lx(n) {
  var i, a, l, f, _, d, g;
  return n.x -= this.x0, n.y -= this.y0, i = Math.sqrt(n.x * n.x + n.y * n.y), a = zi(i / this.a), l = Math.sin(a), f = Math.cos(a), d = this.long0, Math.abs(i) <= st ? (g = this.lat0, n.x = d, n.y = g, n) : (g = zi(f * this.sin_p14 + n.y * l * this.cos_p14 / i), _ = Math.abs(this.lat0) - Q, Math.abs(_) <= st ? (this.lat0 >= 0 ? d = ut(this.long0 + Math.atan2(n.x, -n.y)) : d = ut(this.long0 - Math.atan2(-n.x, n.y)), n.x = d, n.y = g, n) : (d = ut(this.long0 + Math.atan2(n.x * l, i * this.cos_p14 * f - n.y * this.sin_p14 * l)), n.x = d, n.y = g, n));
}
var Ox = ["ortho"];
const Gx = {
  init: Ax,
  forward: Tx,
  inverse: Lx,
  names: Ox
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
function Dx() {
  this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.lat0 = this.lat0 || 0, this.long0 = this.long0 || 0, this.lat_ts = this.lat_ts || 0, this.title = this.title || "Quadrilateralized Spherical Cube", this.lat0 >= Q - zt / 2 ? this.face = jt.TOP : this.lat0 <= -(Q - zt / 2) ? this.face = jt.BOTTOM : Math.abs(this.long0) <= zt ? this.face = jt.FRONT : Math.abs(this.long0) <= Q + zt ? this.face = this.long0 > 0 ? jt.RIGHT : jt.LEFT : this.face = jt.BACK, this.es !== 0 && (this.one_minus_f = 1 - (this.a - this.b) / this.a, this.one_minus_f_squared = this.one_minus_f * this.one_minus_f);
}
function Fx(n) {
  var i = { x: 0, y: 0 }, a, l, f, _, d, g, p = { value: 0 };
  if (n.x -= this.long0, this.es !== 0 ? a = Math.atan(this.one_minus_f_squared * Math.tan(n.y)) : a = n.y, l = n.x, this.face === jt.TOP)
    _ = Q - a, l >= zt && l <= Q + zt ? (p.value = Yt.AREA_0, f = l - Q) : l > Q + zt || l <= -(Q + zt) ? (p.value = Yt.AREA_1, f = l > 0 ? l - oe : l + oe) : l > -(Q + zt) && l <= -zt ? (p.value = Yt.AREA_2, f = l + Q) : (p.value = Yt.AREA_3, f = l);
  else if (this.face === jt.BOTTOM)
    _ = Q + a, l >= zt && l <= Q + zt ? (p.value = Yt.AREA_0, f = -l + Q) : l < zt && l >= -zt ? (p.value = Yt.AREA_1, f = -l) : l < -zt && l >= -(Q + zt) ? (p.value = Yt.AREA_2, f = -l - Q) : (p.value = Yt.AREA_3, f = l > 0 ? -l + oe : -l - oe);
  else {
    var M, S, x, w, b, C, G;
    this.face === jt.RIGHT ? l = ss(l, +Q) : this.face === jt.BACK ? l = ss(l, +oe) : this.face === jt.LEFT && (l = ss(l, -Q)), w = Math.sin(a), b = Math.cos(a), C = Math.sin(l), G = Math.cos(l), M = b * G, S = b * C, x = w, this.face === jt.FRONT ? (_ = Math.acos(M), f = Qu(_, x, S, p)) : this.face === jt.RIGHT ? (_ = Math.acos(S), f = Qu(_, x, -M, p)) : this.face === jt.BACK ? (_ = Math.acos(-M), f = Qu(_, x, -S, p)) : this.face === jt.LEFT ? (_ = Math.acos(-S), f = Qu(_, x, M, p)) : (_ = f = 0, p.value = Yt.AREA_0);
  }
  return g = Math.atan(12 / oe * (f + Math.acos(Math.sin(f) * Math.cos(zt)) - Q)), d = Math.sqrt((1 - Math.cos(_)) / (Math.cos(g) * Math.cos(g)) / (1 - Math.cos(Math.atan(1 / Math.cos(f))))), p.value === Yt.AREA_1 ? g += Q : p.value === Yt.AREA_2 ? g += oe : p.value === Yt.AREA_3 && (g += 1.5 * oe), i.x = d * Math.cos(g), i.y = d * Math.sin(g), i.x = i.x * this.a + this.x0, i.y = i.y * this.a + this.y0, n.x = i.x, n.y = i.y, n;
}
function qx(n) {
  var i = { lam: 0, phi: 0 }, a, l, f, _, d, g, p, M, S, x = { value: 0 };
  if (n.x = (n.x - this.x0) / this.a, n.y = (n.y - this.y0) / this.a, l = Math.atan(Math.sqrt(n.x * n.x + n.y * n.y)), a = Math.atan2(n.y, n.x), n.x >= 0 && n.x >= Math.abs(n.y) ? x.value = Yt.AREA_0 : n.y >= 0 && n.y >= Math.abs(n.x) ? (x.value = Yt.AREA_1, a -= Q) : n.x < 0 && -n.x >= Math.abs(n.y) ? (x.value = Yt.AREA_2, a = a < 0 ? a + oe : a - oe) : (x.value = Yt.AREA_3, a += Q), S = oe / 12 * Math.tan(a), d = Math.sin(S) / (Math.cos(S) - 1 / Math.sqrt(2)), g = Math.atan(d), f = Math.cos(a), _ = Math.tan(l), p = 1 - f * f * _ * _ * (1 - Math.cos(Math.atan(1 / Math.cos(g)))), p < -1 ? p = -1 : p > 1 && (p = 1), this.face === jt.TOP)
    M = Math.acos(p), i.phi = Q - M, x.value === Yt.AREA_0 ? i.lam = g + Q : x.value === Yt.AREA_1 ? i.lam = g < 0 ? g + oe : g - oe : x.value === Yt.AREA_2 ? i.lam = g - Q : i.lam = g;
  else if (this.face === jt.BOTTOM)
    M = Math.acos(p), i.phi = M - Q, x.value === Yt.AREA_0 ? i.lam = -g + Q : x.value === Yt.AREA_1 ? i.lam = -g : x.value === Yt.AREA_2 ? i.lam = -g - Q : i.lam = g < 0 ? -g - oe : -g + oe;
  else {
    var w, b, C;
    w = p, S = w * w, S >= 1 ? C = 0 : C = Math.sqrt(1 - S) * Math.sin(g), S += C * C, S >= 1 ? b = 0 : b = Math.sqrt(1 - S), x.value === Yt.AREA_1 ? (S = b, b = -C, C = S) : x.value === Yt.AREA_2 ? (b = -b, C = -C) : x.value === Yt.AREA_3 && (S = b, b = C, C = -S), this.face === jt.RIGHT ? (S = w, w = -b, b = S) : this.face === jt.BACK ? (w = -w, b = -b) : this.face === jt.LEFT && (S = w, w = b, b = -S), i.phi = Math.acos(-C) - Q, i.lam = Math.atan2(b, w), this.face === jt.RIGHT ? i.lam = ss(i.lam, -Q) : this.face === jt.BACK ? i.lam = ss(i.lam, -oe) : this.face === jt.LEFT && (i.lam = ss(i.lam, +Q));
  }
  if (this.es !== 0) {
    var G, O, B;
    G = i.phi < 0 ? 1 : 0, O = Math.tan(i.phi), B = this.b / Math.sqrt(O * O + this.one_minus_f_squared), i.phi = Math.atan(Math.sqrt(this.a * this.a - B * B) / (this.one_minus_f * B)), G && (i.phi = -i.phi);
  }
  return i.lam += this.long0, n.x = i.lam, n.y = i.phi, n;
}
function Qu(n, i, a, l) {
  var f;
  return n < st ? (l.value = Yt.AREA_0, f = 0) : (f = Math.atan2(i, a), Math.abs(f) <= zt ? l.value = Yt.AREA_0 : f > zt && f <= Q + zt ? (l.value = Yt.AREA_1, f -= Q) : f > Q + zt || f <= -(Q + zt) ? (l.value = Yt.AREA_2, f = f >= 0 ? f - oe : f + oe) : (l.value = Yt.AREA_3, f += Q)), f;
}
function ss(n, i) {
  var a = n + i;
  return a < -oe ? a += Pa : a > +oe && (a -= Pa), a;
}
var Bx = ["Quadrilateralized Spherical Cube", "Quadrilateralized_Spherical_Cube", "qsc"];
const Ux = {
  init: Dx,
  forward: Fx,
  inverse: qx,
  names: Bx
};
var gl = [
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
], Xg = 0.8487, Wg = 1.3523, $g = Vn / 5, zx = 1 / $g, ns = 18, So = function(n, i) {
  return n[0] + i * (n[1] + i * (n[2] + i * n[3]));
}, Yx = function(n, i) {
  return n[1] + i * (2 * n[2] + i * 3 * n[3]);
};
function Xx(n, i, a, l) {
  for (var f = i; l; --l) {
    var _ = n(f);
    if (f -= _, Math.abs(_) < a)
      break;
  }
  return f;
}
function Wx() {
  this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.long0 = this.long0 || 0, this.es = 0, this.title = this.title || "Robinson";
}
function $x(n) {
  var i = ut(n.x - this.long0), a = Math.abs(n.y), l = Math.floor(a * $g);
  l < 0 ? l = 0 : l >= ns && (l = ns - 1), a = Vn * (a - zx * l);
  var f = {
    x: So(gl[l], a) * i,
    y: So(ma[l], a)
  };
  return n.y < 0 && (f.y = -f.y), f.x = f.x * this.a * Xg + this.x0, f.y = f.y * this.a * Wg + this.y0, f;
}
function Hx(n) {
  var i = {
    x: (n.x - this.x0) / (this.a * Xg),
    y: Math.abs(n.y - this.y0) / (this.a * Wg)
  };
  if (i.y >= 1)
    i.x /= gl[ns][0], i.y = n.y < 0 ? -Q : Q;
  else {
    var a = Math.floor(i.y * ns);
    for (a < 0 ? a = 0 : a >= ns && (a = ns - 1); ; )
      if (ma[a][0] > i.y)
        --a;
      else if (ma[a + 1][0] <= i.y)
        ++a;
      else
        break;
    var l = ma[a], f = 5 * (i.y - l[0]) / (ma[a + 1][0] - l[0]);
    f = Xx(function(_) {
      return (So(l, _) - i.y) / Yx(l, _);
    }, f, st, 100), i.x /= So(gl[a], f), i.y = (5 * a + f) * xe, n.y < 0 && (i.y = -i.y);
  }
  return i.x = ut(i.x + this.long0), i;
}
var Vx = ["Robinson", "robin"];
const Zx = {
  init: Wx,
  forward: $x,
  inverse: Hx,
  names: Vx
};
function Kx() {
  this.name = "geocent";
}
function Jx(n) {
  var i = Tg(n, this.es, this.a);
  return i;
}
function Qx(n) {
  var i = Lg(n, this.es, this.a, this.b);
  return i;
}
var jx = ["Geocentric", "geocentric", "geocent", "Geocent"];
const t4 = {
  init: Kx,
  forward: Jx,
  inverse: Qx,
  names: jx
};
var Pe = {
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
function e4() {
  if (Object.keys(ga).forEach((function(a) {
    if (typeof this[a] > "u")
      this[a] = ga[a].def;
    else {
      if (ga[a].num && isNaN(this[a]))
        throw new Error("Invalid parameter value, must be numeric " + a + " = " + this[a]);
      ga[a].num && (this[a] = parseFloat(this[a]));
    }
    ga[a].degrees && (this[a] = this[a] * xe);
  }).bind(this)), Math.abs(Math.abs(this.lat0) - Q) < st ? this.mode = this.lat0 < 0 ? Pe.S_POLE : Pe.N_POLE : Math.abs(this.lat0) < st ? this.mode = Pe.EQUIT : (this.mode = Pe.OBLIQ, this.sinph0 = Math.sin(this.lat0), this.cosph0 = Math.cos(this.lat0)), this.pn1 = this.h / this.a, this.pn1 <= 0 || this.pn1 > 1e10)
    throw new Error("Invalid height");
  this.p = 1 + this.pn1, this.rp = 1 / this.p, this.h1 = 1 / this.pn1, this.pfact = (this.p + 1) * this.h1, this.es = 0;
  var n = this.tilt, i = this.azi;
  this.cg = Math.cos(i), this.sg = Math.sin(i), this.cw = Math.cos(n), this.sw = Math.sin(n);
}
function n4(n) {
  n.x -= this.long0;
  var i = Math.sin(n.y), a = Math.cos(n.y), l = Math.cos(n.x), f, _;
  switch (this.mode) {
    case Pe.OBLIQ:
      _ = this.sinph0 * i + this.cosph0 * a * l;
      break;
    case Pe.EQUIT:
      _ = a * l;
      break;
    case Pe.S_POLE:
      _ = -i;
      break;
    case Pe.N_POLE:
      _ = i;
      break;
  }
  switch (_ = this.pn1 / (this.p - _), f = _ * a * Math.sin(n.x), this.mode) {
    case Pe.OBLIQ:
      _ *= this.cosph0 * i - this.sinph0 * a * l;
      break;
    case Pe.EQUIT:
      _ *= i;
      break;
    case Pe.N_POLE:
      _ *= -(a * l);
      break;
    case Pe.S_POLE:
      _ *= a * l;
      break;
  }
  var d, g;
  return d = _ * this.cg + f * this.sg, g = 1 / (d * this.sw * this.h1 + this.cw), f = (f * this.cg - _ * this.sg) * this.cw * g, _ = d * g, n.x = f * this.a, n.y = _ * this.a, n;
}
function i4(n) {
  n.x /= this.a, n.y /= this.a;
  var i = { x: n.x, y: n.y }, a, l, f;
  f = 1 / (this.pn1 - n.y * this.sw), a = this.pn1 * n.x * f, l = this.pn1 * n.y * this.cw * f, n.x = a * this.cg + l * this.sg, n.y = l * this.cg - a * this.sg;
  var _ = je(n.x, n.y);
  if (Math.abs(_) < st)
    i.x = 0, i.y = n.y;
  else {
    var d, g;
    switch (g = 1 - _ * _ * this.pfact, g = (this.p - Math.sqrt(g)) / (this.pn1 / _ + _ / this.pn1), d = Math.sqrt(1 - g * g), this.mode) {
      case Pe.OBLIQ:
        i.y = Math.asin(d * this.sinph0 + n.y * g * this.cosph0 / _), n.y = (d - this.sinph0 * Math.sin(i.y)) * _, n.x *= g * this.cosph0;
        break;
      case Pe.EQUIT:
        i.y = Math.asin(n.y * g / _), n.y = d * _, n.x *= g;
        break;
      case Pe.N_POLE:
        i.y = Math.asin(d), n.y = -n.y;
        break;
      case Pe.S_POLE:
        i.y = -Math.asin(d);
        break;
    }
    i.x = Math.atan2(n.x, n.y);
  }
  return n.x = i.x + this.long0, n.y = i.y, n;
}
var r4 = ["Tilted_Perspective", "tpers"];
const s4 = {
  init: e4,
  forward: n4,
  inverse: i4,
  names: r4
};
function a4() {
  if (this.flip_axis = this.sweep === "x" ? 1 : 0, this.h = Number(this.h), this.radius_g_1 = this.h / this.a, this.radius_g_1 <= 0 || this.radius_g_1 > 1e10)
    throw new Error();
  if (this.radius_g = 1 + this.radius_g_1, this.C = this.radius_g * this.radius_g - 1, this.es !== 0) {
    var n = 1 - this.es, i = 1 / n;
    this.radius_p = Math.sqrt(n), this.radius_p2 = n, this.radius_p_inv2 = i, this.shape = "ellipse";
  } else
    this.radius_p = 1, this.radius_p2 = 1, this.radius_p_inv2 = 1, this.shape = "sphere";
  this.title || (this.title = "Geostationary Satellite View");
}
function u4(n) {
  var i = n.x, a = n.y, l, f, _, d;
  if (i = i - this.long0, this.shape === "ellipse") {
    a = Math.atan(this.radius_p2 * Math.tan(a));
    var g = this.radius_p / je(this.radius_p * Math.cos(a), Math.sin(a));
    if (f = g * Math.cos(i) * Math.cos(a), _ = g * Math.sin(i) * Math.cos(a), d = g * Math.sin(a), (this.radius_g - f) * f - _ * _ - d * d * this.radius_p_inv2 < 0)
      return n.x = Number.NaN, n.y = Number.NaN, n;
    l = this.radius_g - f, this.flip_axis ? (n.x = this.radius_g_1 * Math.atan(_ / je(d, l)), n.y = this.radius_g_1 * Math.atan(d / l)) : (n.x = this.radius_g_1 * Math.atan(_ / l), n.y = this.radius_g_1 * Math.atan(d / je(_, l)));
  } else this.shape === "sphere" && (l = Math.cos(a), f = Math.cos(i) * l, _ = Math.sin(i) * l, d = Math.sin(a), l = this.radius_g - f, this.flip_axis ? (n.x = this.radius_g_1 * Math.atan(_ / je(d, l)), n.y = this.radius_g_1 * Math.atan(d / l)) : (n.x = this.radius_g_1 * Math.atan(_ / l), n.y = this.radius_g_1 * Math.atan(d / je(_, l))));
  return n.x = n.x * this.a, n.y = n.y * this.a, n;
}
function o4(n) {
  var i = -1, a = 0, l = 0, f, _, d, g;
  if (n.x = n.x / this.a, n.y = n.y / this.a, this.shape === "ellipse") {
    this.flip_axis ? (l = Math.tan(n.y / this.radius_g_1), a = Math.tan(n.x / this.radius_g_1) * je(1, l)) : (a = Math.tan(n.x / this.radius_g_1), l = Math.tan(n.y / this.radius_g_1) * je(1, a));
    var p = l / this.radius_p;
    if (f = a * a + p * p + i * i, _ = 2 * this.radius_g * i, d = _ * _ - 4 * f * this.C, d < 0)
      return n.x = Number.NaN, n.y = Number.NaN, n;
    g = (-_ - Math.sqrt(d)) / (2 * f), i = this.radius_g + g * i, a *= g, l *= g, n.x = Math.atan2(a, i), n.y = Math.atan(l * Math.cos(n.x) / i), n.y = Math.atan(this.radius_p_inv2 * Math.tan(n.y));
  } else if (this.shape === "sphere") {
    if (this.flip_axis ? (l = Math.tan(n.y / this.radius_g_1), a = Math.tan(n.x / this.radius_g_1) * Math.sqrt(1 + l * l)) : (a = Math.tan(n.x / this.radius_g_1), l = Math.tan(n.y / this.radius_g_1) * Math.sqrt(1 + a * a)), f = a * a + l * l + i * i, _ = 2 * this.radius_g * i, d = _ * _ - 4 * f * this.C, d < 0)
      return n.x = Number.NaN, n.y = Number.NaN, n;
    g = (-_ - Math.sqrt(d)) / (2 * f), i = this.radius_g + g * i, a *= g, l *= g, n.x = Math.atan2(a, i), n.y = Math.atan(l * Math.cos(n.x) / i);
  }
  return n.x = n.x + this.long0, n;
}
var h4 = ["Geostationary Satellite View", "Geostationary_Satellite", "geos"];
const l4 = {
  init: a4,
  forward: u4,
  inverse: o4,
  names: h4
};
var Sa = 1.340264, Ia = -0.081106, Na = 893e-6, ka = 3796e-6, Io = Math.sqrt(3) / 2;
function f4() {
  this.es = 0, this.long0 = this.long0 !== void 0 ? this.long0 : 0;
}
function c4(n) {
  var i = ut(n.x - this.long0), a = n.y, l = Math.asin(Io * Math.sin(a)), f = l * l, _ = f * f * f;
  return n.x = i * Math.cos(l) / (Io * (Sa + 3 * Ia * f + _ * (7 * Na + 9 * ka * f))), n.y = l * (Sa + Ia * f + _ * (Na + ka * f)), n.x = this.a * n.x + this.x0, n.y = this.a * n.y + this.y0, n;
}
function g4(n) {
  n.x = (n.x - this.x0) / this.a, n.y = (n.y - this.y0) / this.a;
  var i = 1e-9, a = 12, l = n.y, f, _, d, g, p, M;
  for (M = 0; M < a && (f = l * l, _ = f * f * f, d = l * (Sa + Ia * f + _ * (Na + ka * f)) - n.y, g = Sa + 3 * Ia * f + _ * (7 * Na + 9 * ka * f), l -= p = d / g, !(Math.abs(p) < i)); ++M)
    ;
  return f = l * l, _ = f * f * f, n.x = Io * n.x * (Sa + 3 * Ia * f + _ * (7 * Na + 9 * ka * f)) / Math.cos(l), n.y = Math.asin(Math.sin(l) / Io), n.x = ut(n.x + this.long0), n;
}
var v4 = ["eqearth", "Equal Earth", "Equal_Earth"];
const _4 = {
  init: f4,
  forward: c4,
  inverse: g4,
  names: v4
};
var Ra = 1e-10;
function d4() {
  var n;
  if (this.phi1 = this.lat1, Math.abs(this.phi1) < Ra)
    throw new Error();
  this.es ? (this.en = Sl(this.es), this.m1 = gs(
    this.phi1,
    this.am1 = Math.sin(this.phi1),
    n = Math.cos(this.phi1),
    this.en
  ), this.am1 = n / (Math.sqrt(1 - this.es * this.am1 * this.am1) * this.am1), this.inverse = y4, this.forward = m4) : (Math.abs(this.phi1) + Ra >= Q ? this.cphi1 = 0 : this.cphi1 = 1 / Math.tan(this.phi1), this.inverse = E4, this.forward = p4);
}
function m4(n) {
  var i = ut(n.x - (this.long0 || 0)), a = n.y, l, f, _;
  return l = this.am1 + this.m1 - gs(a, f = Math.sin(a), _ = Math.cos(a), this.en), f = _ * i / (l * Math.sqrt(1 - this.es * f * f)), n.x = l * Math.sin(f), n.y = this.am1 - l * Math.cos(f), n.x = this.a * n.x + (this.x0 || 0), n.y = this.a * n.y + (this.y0 || 0), n;
}
function y4(n) {
  n.x = (n.x - (this.x0 || 0)) / this.a, n.y = (n.y - (this.y0 || 0)) / this.a;
  var i, a, l, f;
  if (a = je(n.x, n.y = this.am1 - n.y), f = Il(this.am1 + this.m1 - a, this.es, this.en), (i = Math.abs(f)) < Q)
    i = Math.sin(f), l = a * Math.atan2(n.x, n.y) * Math.sqrt(1 - this.es * i * i) / Math.cos(f);
  else if (Math.abs(i - Q) <= Ra)
    l = 0;
  else
    throw new Error();
  return n.x = ut(l + (this.long0 || 0)), n.y = Wi(f), n;
}
function p4(n) {
  var i = ut(n.x - (this.long0 || 0)), a = n.y, l, f;
  return f = this.cphi1 + this.phi1 - a, Math.abs(f) > Ra ? (n.x = f * Math.sin(l = i * Math.cos(a) / f), n.y = this.cphi1 - f * Math.cos(l)) : n.x = n.y = 0, n.x = this.a * n.x + (this.x0 || 0), n.y = this.a * n.y + (this.y0 || 0), n;
}
function E4(n) {
  n.x = (n.x - (this.x0 || 0)) / this.a, n.y = (n.y - (this.y0 || 0)) / this.a;
  var i, a, l = je(n.x, n.y = this.cphi1 - n.y);
  if (a = this.cphi1 + this.phi1 - l, Math.abs(a) > Q)
    throw new Error();
  return Math.abs(Math.abs(a) - Q) <= Ra ? i = 0 : i = l * Math.atan2(n.x, n.y) / Math.cos(a), n.x = ut(i + (this.long0 || 0)), n.y = Wi(a), n;
}
var x4 = ["bonne", "Bonne (Werner lat_1=90)"];
const M4 = {
  init: d4,
  names: x4
};
function w4(n) {
  n.Proj.projections.add(go), n.Proj.projections.add(vo), n.Proj.projections.add(x2), n.Proj.projections.add(b2), n.Proj.projections.add(O2), n.Proj.projections.add(B2), n.Proj.projections.add($2), n.Proj.projections.add(J2), n.Proj.projections.add(nE), n.Proj.projections.add(uE), n.Proj.projections.add(EE), n.Proj.projections.add(NE), n.Proj.projections.add(RE), n.Proj.projections.add(DE), n.Proj.projections.add(zE), n.Proj.projections.add(HE), n.Proj.projections.add(QE), n.Proj.projections.add(ix), n.Proj.projections.add(hx), n.Proj.projections.add(vx), n.Proj.projections.add(px), n.Proj.projections.add(Sx), n.Proj.projections.add(Rx), n.Proj.projections.add(Gx), n.Proj.projections.add(Ux), n.Proj.projections.add(Zx), n.Proj.projections.add(t4), n.Proj.projections.add(s4), n.Proj.projections.add(l4), n.Proj.projections.add(_4), n.Proj.projections.add(M4);
}
const _n = Object.assign(Fp, {
  defaultDatum: "WGS84",
  Proj: Fn,
  WGS84: new Fn("WGS84"),
  Point: us,
  toPoint: Og,
  defs: De,
  nadgrid: Ep,
  transform: Mo,
  mgrs: qp,
  version: "__VERSION__"
});
w4(_n);
function Yi(n, i = 0) {
  if (!Rl(n))
    return Number.NaN;
  if (i === 0)
    return Math.round(n);
  const a = Math.pow(10, i);
  return Math.round(n * a) / a;
}
function S4(n, i) {
  if (Array.isArray(i) && i.length > 2) {
    const a = i.map((_) => Math.abs(n - _)), l = a.reduce(
      (_, d) => _ > d ? d : _
    ), f = a.indexOf(l);
    return typeof i[f] != "number" || isNaN(i[f]) ? n : i[f];
  }
  return n;
}
function Rl(n) {
  return n != null && !Number.isNaN(Number(n)) && (typeof n != "string" || n.length !== 0);
}
const I4 = /\B(?=(\d{3})+(?!\d))/g;
function N4(n, i = "'") {
  const a = ".", l = `${n}`.split(a);
  return typeof l[0] != "string" || l[0].length === 0 ? `${n}` : (l[0] = l[0].replace(I4, i), l.join(a));
}
var Ge = 63710088e-1, Hg = {
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
function Xi(n, i, a = {}) {
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
  if (!Wc(n[0]) || !Wc(n[1]))
    throw new Error("coordinates must contain numbers");
  return Xi({
    type: "Point",
    coordinates: n
  }, i, a);
}
function k4(n, i, a = {}) {
  return tn(
    n.map((l) => Fi(l, i)),
    a
  );
}
function P4(n, i, a = {}) {
  for (const f of n) {
    if (f.length < 4)
      throw new Error(
        "Each LinearRing of a Polygon must have 4 or more Positions."
      );
    if (f[f.length - 1].length !== f[0].length)
      throw new Error("First and last Position are not equivalent.");
    for (let _ = 0; _ < f[f.length - 1].length; _++)
      if (f[f.length - 1][_] !== f[0][_])
        throw new Error("First and last Position are not equivalent.");
  }
  return Xi({
    type: "Polygon",
    coordinates: n
  }, i, a);
}
function No(n, i, a = {}) {
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
function Vg(n, i = "kilometers") {
  const a = Hg[i];
  if (!a)
    throw new Error(i + " units is invalid");
  return n * a;
}
function C4(n, i = "kilometers") {
  const a = Hg[i];
  if (!a)
    throw new Error(i + " units is invalid");
  return n / a;
}
function Xc(n) {
  return n % (2 * Math.PI) * 180 / Math.PI;
}
function is(n) {
  return n % 360 * Math.PI / 180;
}
function Wc(n) {
  return !isNaN(n) && n !== null && !Array.isArray(n);
}
function b4(n) {
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
function R4(n) {
  return n.type === "Feature" ? n.geometry : n;
}
function $c(n, i) {
  return n.type === "FeatureCollection" ? "FeatureCollection" : n.type === "GeometryCollection" ? "GeometryCollection" : n.type === "Feature" && n.geometry !== null ? n.geometry.type : n.type;
}
function Hn(n, i, a = {}) {
  var l = Zn(n), f = Zn(i), _ = is(f[1] - l[1]), d = is(f[0] - l[0]), g = is(l[1]), p = is(f[1]), M = Math.pow(Math.sin(_ / 2), 2) + Math.pow(Math.sin(d / 2), 2) * Math.cos(g) * Math.cos(p);
  return Vg(
    2 * Math.atan2(Math.sqrt(M), Math.sqrt(1 - M)),
    a.units
  );
}
function Al(n, i, a) {
  if (n !== null)
    for (var l, f, _, d, g, p, M, S = 0, x = 0, w, b = n.type, C = b === "FeatureCollection", G = b === "Feature", O = C ? n.features.length : 1, B = 0; B < O; B++) {
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
              for (l = 0; l < p.length; l++) {
                if (i(
                  p[l],
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
              for (l = 0; l < p.length; l++) {
                for (f = 0; f < p[l].length - S; f++) {
                  if (i(
                    p[l][f],
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
              for (l = 0; l < p.length; l++) {
                for (W = 0, f = 0; f < p[l].length; f++) {
                  for (_ = 0; _ < p[l][f].length - S; _++) {
                    if (i(
                      p[l][f][_],
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
              for (l = 0; l < d.geometries.length; l++)
                if (Al(d.geometries[l], i) === !1)
                  return !1;
              break;
            default:
              throw new Error("Unknown Geometry Type");
          }
        }
      }
    }
}
function os(n, i) {
  if (n.type === "Feature")
    i(n, 0);
  else if (n.type === "FeatureCollection")
    for (var a = 0; a < n.features.length && i(n.features[a], a) !== !1; a++)
      ;
}
function A4(n, i, a) {
  var l = a;
  return os(n, function(f, _) {
    _ === 0 && a === void 0 ? l = f : l = i(l, f, _);
  }), l;
}
function Tl(n, i) {
  var a, l, f, _, d, g, p, M, S, x, w = 0, b = n.type === "FeatureCollection", C = n.type === "Feature", G = b ? n.features.length : 1;
  for (a = 0; a < G; a++) {
    for (g = b ? n.features[a].geometry : C ? n.geometry : n, M = b ? n.features[a].properties : C ? n.properties : {}, S = b ? n.features[a].bbox : C ? n.bbox : void 0, x = b ? n.features[a].id : C ? n.id : void 0, p = g ? g.type === "GeometryCollection" : !1, d = p ? g.geometries.length : 1, f = 0; f < d; f++) {
      if (_ = p ? g.geometries[f] : g, _ === null) {
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
      switch (_.type) {
        case "Point":
        case "LineString":
        case "MultiPoint":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon": {
          if (i(
            _,
            w,
            M,
            S,
            x
          ) === !1)
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (l = 0; l < _.geometries.length; l++)
            if (i(
              _.geometries[l],
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
function Ll(n, i) {
  Tl(n, function(a, l, f, _, d) {
    var g = a === null ? null : a.type;
    switch (g) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return i(
          Xi(a, f, { bbox: _, id: d }),
          l,
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
      if (i(Xi(x, f), l, M) === !1)
        return !1;
    }
  });
}
function xi(n, i = {}) {
  if (n.bbox != null && i.recompute !== !0)
    return n.bbox;
  const a = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  return Al(n, (l) => {
    a[0] > l[0] && (a[0] = l[0]), a[1] > l[1] && (a[1] = l[1]), a[2] < l[0] && (a[2] = l[0]), a[3] < l[1] && (a[3] = l[1]);
  }), a;
}
function T4(n, i = {}) {
  const a = Number(n[0]), l = Number(n[1]), f = Number(n[2]), _ = Number(n[3]);
  if (n.length === 6)
    throw new Error(
      "@turf/bbox-polygon does not support BBox with 6 positions"
    );
  const d = [a, l];
  return P4(
    [[d, [f, l], [f, _], [a, _], d]],
    i.properties,
    { bbox: n, id: i.id }
  );
}
const Mi = 11102230246251565e-32, ke = 134217729, L4 = (3 + 8 * Mi) * Mi;
function jh(n, i, a, l, f) {
  let _, d, g, p, M = i[0], S = l[0], x = 0, w = 0;
  S > M == S > -M ? (_ = M, M = i[++x]) : (_ = S, S = l[++w]);
  let b = 0;
  if (x < n && w < a)
    for (S > M == S > -M ? (d = M + _, g = _ - (d - M), M = i[++x]) : (d = S + _, g = _ - (d - S), S = l[++w]), _ = d, g !== 0 && (f[b++] = g); x < n && w < a; )
      S > M == S > -M ? (d = _ + M, p = d - _, g = _ - (d - p) + (M - p), M = i[++x]) : (d = _ + S, p = d - _, g = _ - (d - p) + (S - p), S = l[++w]), _ = d, g !== 0 && (f[b++] = g);
  for (; x < n; )
    d = _ + M, p = d - _, g = _ - (d - p) + (M - p), M = i[++x], _ = d, g !== 0 && (f[b++] = g);
  for (; w < a; )
    d = _ + S, p = d - _, g = _ - (d - p) + (S - p), S = l[++w], _ = d, g !== 0 && (f[b++] = g);
  return (_ !== 0 || b === 0) && (f[b++] = _), b;
}
function O4(n, i) {
  let a = i[0];
  for (let l = 1; l < n; l++) a += i[l];
  return a;
}
function qa(n) {
  return new Float64Array(n);
}
const G4 = (3 + 16 * Mi) * Mi, D4 = (2 + 12 * Mi) * Mi, F4 = (9 + 64 * Mi) * Mi * Mi, Zr = qa(4), Hc = qa(8), Vc = qa(12), Zc = qa(16), Oe = qa(4);
function q4(n, i, a, l, f, _, d) {
  let g, p, M, S, x, w, b, C, G, O, B, z, Y, W, X, V, K, et;
  const j = n - f, vt = a - f, _t = i - _, Mt = l - _;
  W = j * Mt, w = ke * j, b = w - (w - j), C = j - b, w = ke * Mt, G = w - (w - Mt), O = Mt - G, X = C * O - (W - b * G - C * G - b * O), V = _t * vt, w = ke * _t, b = w - (w - _t), C = _t - b, w = ke * vt, G = w - (w - vt), O = vt - G, K = C * O - (V - b * G - C * G - b * O), B = X - K, x = X - B, Zr[0] = X - (B + x) + (x - K), z = W + B, x = z - W, Y = W - (z - x) + (B - x), B = Y - V, x = Y - B, Zr[1] = Y - (B + x) + (x - V), et = z + B, x = et - z, Zr[2] = z - (et - x) + (B - x), Zr[3] = et;
  let kt = O4(4, Zr), it = D4 * d;
  if (kt >= it || -kt >= it || (x = n - j, g = n - (j + x) + (x - f), x = a - vt, M = a - (vt + x) + (x - f), x = i - _t, p = i - (_t + x) + (x - _), x = l - Mt, S = l - (Mt + x) + (x - _), g === 0 && p === 0 && M === 0 && S === 0) || (it = F4 * d + L4 * Math.abs(kt), kt += j * S + Mt * g - (_t * M + vt * p), kt >= it || -kt >= it)) return kt;
  W = g * Mt, w = ke * g, b = w - (w - g), C = g - b, w = ke * Mt, G = w - (w - Mt), O = Mt - G, X = C * O - (W - b * G - C * G - b * O), V = p * vt, w = ke * p, b = w - (w - p), C = p - b, w = ke * vt, G = w - (w - vt), O = vt - G, K = C * O - (V - b * G - C * G - b * O), B = X - K, x = X - B, Oe[0] = X - (B + x) + (x - K), z = W + B, x = z - W, Y = W - (z - x) + (B - x), B = Y - V, x = Y - B, Oe[1] = Y - (B + x) + (x - V), et = z + B, x = et - z, Oe[2] = z - (et - x) + (B - x), Oe[3] = et;
  const St = jh(4, Zr, 4, Oe, Hc);
  W = j * S, w = ke * j, b = w - (w - j), C = j - b, w = ke * S, G = w - (w - S), O = S - G, X = C * O - (W - b * G - C * G - b * O), V = _t * M, w = ke * _t, b = w - (w - _t), C = _t - b, w = ke * M, G = w - (w - M), O = M - G, K = C * O - (V - b * G - C * G - b * O), B = X - K, x = X - B, Oe[0] = X - (B + x) + (x - K), z = W + B, x = z - W, Y = W - (z - x) + (B - x), B = Y - V, x = Y - B, Oe[1] = Y - (B + x) + (x - V), et = z + B, x = et - z, Oe[2] = z - (et - x) + (B - x), Oe[3] = et;
  const Gt = jh(St, Hc, 4, Oe, Vc);
  W = g * S, w = ke * g, b = w - (w - g), C = g - b, w = ke * S, G = w - (w - S), O = S - G, X = C * O - (W - b * G - C * G - b * O), V = p * M, w = ke * p, b = w - (w - p), C = p - b, w = ke * M, G = w - (w - M), O = M - G, K = C * O - (V - b * G - C * G - b * O), B = X - K, x = X - B, Oe[0] = X - (B + x) + (x - K), z = W + B, x = z - W, Y = W - (z - x) + (B - x), B = Y - V, x = Y - B, Oe[1] = Y - (B + x) + (x - V), et = z + B, x = et - z, Oe[2] = z - (et - x) + (B - x), Oe[3] = et;
  const Dt = jh(Gt, Vc, 4, Oe, Zc);
  return Zc[Dt - 1];
}
function B4(n, i, a, l, f, _) {
  const d = (i - _) * (a - f), g = (n - f) * (l - _), p = d - g, M = Math.abs(d + g);
  return Math.abs(p) >= G4 * M ? p : -q4(n, i, a, l, f, _, M);
}
function U4(n, i) {
  var a, l, f = 0, _, d, g, p, M, S, x, w = n[0], b = n[1], C = i.length;
  for (a = 0; a < C; a++) {
    l = 0;
    var G = i[a], O = G.length - 1;
    if (S = G[0], S[0] !== G[O][0] && S[1] !== G[O][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (d = S[0] - w, g = S[1] - b, l; l < O; l++) {
      if (x = G[l + 1], p = x[0] - w, M = x[1] - b, g === 0 && M === 0) {
        if (p <= 0 && d >= 0 || d <= 0 && p >= 0)
          return 0;
      } else if (M >= 0 && g <= 0 || M <= 0 && g >= 0) {
        if (_ = B4(d, p, g, M, 0, 0), _ === 0)
          return 0;
        (_ > 0 && M > 0 && g <= 0 || _ < 0 && M <= 0 && g > 0) && f++;
      }
      S = x, g = M, d = p;
    }
  }
  return f % 2 !== 0;
}
function z4(n, i, a = {}) {
  if (!n)
    throw new Error("point is required");
  if (!i)
    throw new Error("polygon is required");
  const l = Zn(n), f = R4(i), _ = f.type, d = i.bbox;
  let g = f.coordinates;
  if (d && Y4(l, d) === !1)
    return !1;
  _ === "Polygon" && (g = [g]);
  let p = !1;
  for (var M = 0; M < g.length; ++M) {
    const S = U4(l, g[M]);
    if (S === 0) return !a.ignoreBoundary;
    S && (p = !0);
  }
  return p;
}
function Y4(n, i) {
  return i[0] <= n[0] && i[1] <= n[1] && i[2] >= n[0] && i[3] >= n[1];
}
class Zg {
  constructor(i = [], a = X4) {
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
    const { data: a, compare: l } = this, f = a[i];
    for (; i > 0; ) {
      const _ = i - 1 >> 1, d = a[_];
      if (l(f, d) >= 0) break;
      a[i] = d, i = _;
    }
    a[i] = f;
  }
  _down(i) {
    const { data: a, compare: l } = this, f = this.length >> 1, _ = a[i];
    for (; i < f; ) {
      let d = (i << 1) + 1, g = a[d];
      const p = d + 1;
      if (p < this.length && l(a[p], g) < 0 && (d = p, g = a[p]), l(g, _) >= 0) break;
      a[i] = g, i = d;
    }
    a[i] = _;
  }
}
function X4(n, i) {
  return n < i ? -1 : n > i ? 1 : 0;
}
function Kg(n, i) {
  return n.p.x > i.p.x ? 1 : n.p.x < i.p.x ? -1 : n.p.y !== i.p.y ? n.p.y > i.p.y ? 1 : -1 : 1;
}
function W4(n, i) {
  return n.rightSweepEvent.p.x > i.rightSweepEvent.p.x ? 1 : n.rightSweepEvent.p.x < i.rightSweepEvent.p.x ? -1 : n.rightSweepEvent.p.y !== i.rightSweepEvent.p.y ? n.rightSweepEvent.p.y < i.rightSweepEvent.p.y ? 1 : -1 : 1;
}
class Kc {
  constructor(i, a, l, f) {
    this.p = {
      x: i[0],
      y: i[1]
    }, this.featureId = a, this.ringId = l, this.eventId = f, this.otherEvent = null, this.isLeftEndpoint = null;
  }
  isSamePoint(i) {
    return this.p.x === i.p.x && this.p.y === i.p.y;
  }
}
function $4(n, i) {
  if (n.type === "FeatureCollection") {
    const a = n.features;
    for (let l = 0; l < a.length; l++)
      Jc(a[l], i);
  } else
    Jc(n, i);
}
let ju = 0, to = 0, eo = 0;
function Jc(n, i) {
  const a = n.type === "Feature" ? n.geometry : n;
  let l = a.coordinates;
  (a.type === "Polygon" || a.type === "MultiLineString") && (l = [l]), a.type === "LineString" && (l = [[l]]);
  for (let f = 0; f < l.length; f++)
    for (let _ = 0; _ < l[f].length; _++) {
      let d = l[f][_][0], g = null;
      to = to + 1;
      for (let p = 0; p < l[f][_].length - 1; p++) {
        g = l[f][_][p + 1];
        const M = new Kc(d, ju, to, eo), S = new Kc(g, ju, to, eo + 1);
        M.otherEvent = S, S.otherEvent = M, Kg(M, S) > 0 ? (S.isLeftEndpoint = !0, M.isLeftEndpoint = !1) : (M.isLeftEndpoint = !0, S.isLeftEndpoint = !1), i.push(M), i.push(S), d = g, eo = eo + 1;
      }
    }
  ju = ju + 1;
}
class H4 {
  constructor(i) {
    this.leftSweepEvent = i, this.rightSweepEvent = i.otherEvent;
  }
}
function V4(n, i) {
  if (n === null || i === null || n.leftSweepEvent.ringId === i.leftSweepEvent.ringId && (n.rightSweepEvent.isSamePoint(i.leftSweepEvent) || n.rightSweepEvent.isSamePoint(i.leftSweepEvent) || n.rightSweepEvent.isSamePoint(i.rightSweepEvent) || n.leftSweepEvent.isSamePoint(i.leftSweepEvent) || n.leftSweepEvent.isSamePoint(i.rightSweepEvent))) return !1;
  const a = n.leftSweepEvent.p.x, l = n.leftSweepEvent.p.y, f = n.rightSweepEvent.p.x, _ = n.rightSweepEvent.p.y, d = i.leftSweepEvent.p.x, g = i.leftSweepEvent.p.y, p = i.rightSweepEvent.p.x, M = i.rightSweepEvent.p.y, S = (M - g) * (f - a) - (p - d) * (_ - l), x = (p - d) * (l - g) - (M - g) * (a - d), w = (f - a) * (l - g) - (_ - l) * (a - d);
  if (S === 0)
    return !1;
  const b = x / S, C = w / S;
  if (b >= 0 && b <= 1 && C >= 0 && C <= 1) {
    const G = a + b * (f - a), O = l + b * (_ - l);
    return [G, O];
  }
  return !1;
}
function Z4(n, i) {
  i = i || !1;
  const a = [], l = new Zg([], W4);
  for (; n.length; ) {
    const f = n.pop();
    if (f.isLeftEndpoint) {
      const _ = new H4(f);
      for (let d = 0; d < l.data.length; d++) {
        const g = l.data[d];
        if (i && g.leftSweepEvent.featureId === f.featureId)
          continue;
        const p = V4(_, g);
        p !== !1 && a.push(p);
      }
      l.push(_);
    } else f.isLeftEndpoint === !1 && l.pop();
  }
  return a;
}
function K4(n, i) {
  const a = new Zg([], Kg);
  return $4(n, a), Z4(a, i);
}
var J4 = K4;
function Q4(n, i, a = {}) {
  const { removeDuplicates: l = !0, ignoreSelfIntersections: f = !0 } = a;
  let _ = [];
  n.type === "FeatureCollection" ? _ = _.concat(n.features) : n.type === "Feature" ? _.push(n) : (n.type === "LineString" || n.type === "Polygon" || n.type === "MultiLineString" || n.type === "MultiPolygon") && _.push(Xi(n)), i.type === "FeatureCollection" ? _ = _.concat(i.features) : i.type === "Feature" ? _.push(i) : (i.type === "LineString" || i.type === "Polygon" || i.type === "MultiLineString" || i.type === "MultiPolygon") && _.push(Xi(i));
  const d = J4(
    tn(_),
    f
  );
  let g = [];
  if (l) {
    const p = {};
    d.forEach((M) => {
      const S = M.join(",");
      p[S] || (p[S] = !0, g.push(M));
    });
  } else
    g = d;
  return tn(g.map((p) => Fi(p)));
}
function j4(n, i, a, l, f) {
  Jg(n, i, a || 0, l || n.length - 1, f || tM);
}
function Jg(n, i, a, l, f) {
  for (; l > a; ) {
    if (l - a > 600) {
      var _ = l - a + 1, d = i - a + 1, g = Math.log(_), p = 0.5 * Math.exp(2 * g / 3), M = 0.5 * Math.sqrt(g * p * (_ - p) / _) * (d - _ / 2 < 0 ? -1 : 1), S = Math.max(a, Math.floor(i - d * p / _ + M)), x = Math.min(l, Math.floor(i + (_ - d) * p / _ + M));
      Jg(n, i, S, x, f);
    }
    var w = n[i], b = a, C = l;
    for (va(n, a, i), f(n[l], w) > 0 && va(n, a, l); b < C; ) {
      for (va(n, b, C), b++, C--; f(n[b], w) < 0; ) b++;
      for (; f(n[C], w) > 0; ) C--;
    }
    f(n[a], w) === 0 ? va(n, a, C) : (C++, va(n, C, l)), C <= i && (a = C + 1), i <= C && (l = C - 1);
  }
}
function va(n, i, a) {
  var l = n[i];
  n[i] = n[a], n[a] = l;
}
function tM(n, i) {
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
    const l = [];
    if (!io(i, a)) return l;
    const f = this.toBBox, _ = [];
    for (; a; ) {
      for (let d = 0; d < a.children.length; d++) {
        const g = a.children[d], p = a.leaf ? f(g) : g;
        io(i, p) && (a.leaf ? l.push(g) : el(i, p) ? this._all(g, l) : _.push(g));
      }
      a = _.pop();
    }
    return l;
  }
  collides(i) {
    let a = this.data;
    if (!io(i, a)) return !1;
    const l = [];
    for (; a; ) {
      for (let f = 0; f < a.children.length; f++) {
        const _ = a.children[f], d = a.leaf ? this.toBBox(_) : _;
        if (io(i, d)) {
          if (a.leaf || el(i, d)) return !0;
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
    return this.data = Qr([]), this;
  }
  remove(i, a) {
    if (!i) return this;
    let l = this.data;
    const f = this.toBBox(i), _ = [], d = [];
    let g, p, M;
    for (; l || _.length; ) {
      if (l || (l = _.pop(), p = _[_.length - 1], g = d.pop(), M = !0), l.leaf) {
        const S = eM(i, l.children, a);
        if (S !== -1)
          return l.children.splice(S, 1), _.push(l), this._condense(_), this;
      }
      !M && !l.leaf && el(l, f) ? (_.push(l), d.push(g), g = 0, p = l, l = l.children[0]) : p ? (g++, l = p.children[g], M = !1) : l = null;
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
  _build(i, a, l, f) {
    const _ = l - a + 1;
    let d = this._maxEntries, g;
    if (_ <= d)
      return g = Qr(i.slice(a, l + 1)), Kr(g, this.toBBox), g;
    f || (f = Math.ceil(Math.log(_) / Math.log(d)), d = Math.ceil(_ / Math.pow(d, f - 1))), g = Qr([]), g.leaf = !1, g.height = f;
    const p = Math.ceil(_ / d), M = p * Math.ceil(Math.sqrt(d));
    Qc(i, a, l, M, this.compareMinX);
    for (let S = a; S <= l; S += M) {
      const x = Math.min(S + M - 1, l);
      Qc(i, S, x, p, this.compareMinY);
      for (let w = S; w <= x; w += p) {
        const b = Math.min(w + p - 1, x);
        g.children.push(this._build(i, w, b, f - 1));
      }
    }
    return Kr(g, this.toBBox), g;
  }
  _chooseSubtree(i, a, l, f) {
    for (; f.push(a), !(a.leaf || f.length - 1 === l); ) {
      let _ = 1 / 0, d = 1 / 0, g;
      for (let p = 0; p < a.children.length; p++) {
        const M = a.children[p], S = tl(M), x = rM(i, M) - S;
        x < d ? (d = x, _ = S < _ ? S : _, g = M) : x === d && S < _ && (_ = S, g = M);
      }
      a = g || a.children[0];
    }
    return a;
  }
  _insert(i, a, l) {
    const f = l ? i : this.toBBox(i), _ = [], d = this._chooseSubtree(f, this.data, a, _);
    for (d.children.push(i), pa(d, f); a >= 0 && _[a].children.length > this._maxEntries; )
      this._split(_, a), a--;
    this._adjustParentBBoxes(f, _, a);
  }
  // split overflowed node into two
  _split(i, a) {
    const l = i[a], f = l.children.length, _ = this._minEntries;
    this._chooseSplitAxis(l, _, f);
    const d = this._chooseSplitIndex(l, _, f), g = Qr(l.children.splice(d, l.children.length - d));
    g.height = l.height, g.leaf = l.leaf, Kr(l, this.toBBox), Kr(g, this.toBBox), a ? i[a - 1].children.push(g) : this._splitRoot(l, g);
  }
  _splitRoot(i, a) {
    this.data = Qr([i, a]), this.data.height = i.height + 1, this.data.leaf = !1, Kr(this.data, this.toBBox);
  }
  _chooseSplitIndex(i, a, l) {
    let f, _ = 1 / 0, d = 1 / 0;
    for (let g = a; g <= l - a; g++) {
      const p = ya(i, 0, g, this.toBBox), M = ya(i, g, l, this.toBBox), S = sM(p, M), x = tl(p) + tl(M);
      S < _ ? (_ = S, f = g, d = x < d ? x : d) : S === _ && x < d && (d = x, f = g);
    }
    return f || l - a;
  }
  // sorts node children by the best axis for split
  _chooseSplitAxis(i, a, l) {
    const f = i.leaf ? this.compareMinX : nM, _ = i.leaf ? this.compareMinY : iM, d = this._allDistMargin(i, a, l, f), g = this._allDistMargin(i, a, l, _);
    d < g && i.children.sort(f);
  }
  // total margin of all possible split distributions where each node is at least m full
  _allDistMargin(i, a, l, f) {
    i.children.sort(f);
    const _ = this.toBBox, d = ya(i, 0, a, _), g = ya(i, l - a, l, _);
    let p = no(d) + no(g);
    for (let M = a; M < l - a; M++) {
      const S = i.children[M];
      pa(d, i.leaf ? _(S) : S), p += no(d);
    }
    for (let M = l - a - 1; M >= a; M--) {
      const S = i.children[M];
      pa(g, i.leaf ? _(S) : S), p += no(g);
    }
    return p;
  }
  _adjustParentBBoxes(i, a, l) {
    for (let f = l; f >= 0; f--)
      pa(a[f], i);
  }
  _condense(i) {
    for (let a = i.length - 1, l; a >= 0; a--)
      i[a].children.length === 0 ? a > 0 ? (l = i[a - 1].children, l.splice(l.indexOf(i[a]), 1)) : this.clear() : Kr(i[a], this.toBBox);
  }
}
function eM(n, i, a) {
  if (!a) return i.indexOf(n);
  for (let l = 0; l < i.length; l++)
    if (a(n, i[l])) return l;
  return -1;
}
function Kr(n, i) {
  ya(n, 0, n.children.length, i, n);
}
function ya(n, i, a, l, f) {
  f || (f = Qr(null)), f.minX = 1 / 0, f.minY = 1 / 0, f.maxX = -1 / 0, f.maxY = -1 / 0;
  for (let _ = i; _ < a; _++) {
    const d = n.children[_];
    pa(f, n.leaf ? l(d) : d);
  }
  return f;
}
function pa(n, i) {
  return n.minX = Math.min(n.minX, i.minX), n.minY = Math.min(n.minY, i.minY), n.maxX = Math.max(n.maxX, i.maxX), n.maxY = Math.max(n.maxY, i.maxY), n;
}
function nM(n, i) {
  return n.minX - i.minX;
}
function iM(n, i) {
  return n.minY - i.minY;
}
function tl(n) {
  return (n.maxX - n.minX) * (n.maxY - n.minY);
}
function no(n) {
  return n.maxX - n.minX + (n.maxY - n.minY);
}
function rM(n, i) {
  return (Math.max(i.maxX, n.maxX) - Math.min(i.minX, n.minX)) * (Math.max(i.maxY, n.maxY) - Math.min(i.minY, n.minY));
}
function sM(n, i) {
  const a = Math.max(n.minX, i.minX), l = Math.max(n.minY, i.minY), f = Math.min(n.maxX, i.maxX), _ = Math.min(n.maxY, i.maxY);
  return Math.max(0, f - a) * Math.max(0, _ - l);
}
function el(n, i) {
  return n.minX <= i.minX && n.minY <= i.minY && i.maxX <= n.maxX && i.maxY <= n.maxY;
}
function io(n, i) {
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
function Qc(n, i, a, l, f) {
  const _ = [i, a];
  for (; _.length; ) {
    if (a = _.pop(), i = _.pop(), a - i <= l) continue;
    const d = i + Math.ceil((a - i) / l / 2) * l;
    j4(n, d, i, a, f), _.push(i, d, d, a);
  }
}
function Qg(n) {
  var i = new Wn(n);
  return i.insert = function(a) {
    if (a.type !== "Feature") throw new Error("invalid feature");
    return a.bbox = a.bbox ? a.bbox : xi(a), Wn.prototype.insert.call(this, a);
  }, i.load = function(a) {
    var l = [];
    return Array.isArray(a) ? a.forEach(function(f) {
      if (f.type !== "Feature") throw new Error("invalid features");
      f.bbox = f.bbox ? f.bbox : xi(f), l.push(f);
    }) : os(a, function(f) {
      if (f.type !== "Feature") throw new Error("invalid features");
      f.bbox = f.bbox ? f.bbox : xi(f), l.push(f);
    }), Wn.prototype.load.call(this, l);
  }, i.remove = function(a, l) {
    if (a.type !== "Feature") throw new Error("invalid feature");
    return a.bbox = a.bbox ? a.bbox : xi(a), Wn.prototype.remove.call(this, a, l);
  }, i.clear = function() {
    return Wn.prototype.clear.call(this);
  }, i.search = function(a) {
    var l = Wn.prototype.search.call(this, this.toBBox(a));
    return tn(l);
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
    var l;
    if (a.bbox) l = a.bbox;
    else if (Array.isArray(a) && a.length === 4) l = a;
    else if (Array.isArray(a) && a.length === 6)
      l = [a[0], a[1], a[3], a[4]];
    else if (a.type === "Feature") l = xi(a);
    else if (a.type === "FeatureCollection") l = xi(a);
    else throw new Error("invalid geojson");
    return {
      minX: l[0],
      minY: l[1],
      maxX: l[2],
      maxY: l[3]
    };
  }, i;
}
function aM(n) {
  if (!n)
    throw new Error("geojson is required");
  const i = [];
  return Ll(n, (a) => {
    uM(a, i);
  }), tn(i);
}
function uM(n, i) {
  let a = [];
  const l = n.geometry;
  if (l !== null) {
    switch (l.type) {
      case "Polygon":
        a = as(l);
        break;
      case "LineString":
        a = [as(l)];
    }
    a.forEach((f) => {
      oM(f, n.properties).forEach((d) => {
        d.id = i.length, i.push(d);
      });
    });
  }
}
function oM(n, i) {
  const a = [];
  return n.reduce((l, f) => {
    const _ = No([l, f], i);
    return _.bbox = hM(l, f), a.push(_), f;
  }), a;
}
function hM(n, i) {
  const a = n[0], l = n[1], f = i[0], _ = i[1], d = a < f ? a : f, g = l < _ ? l : _, p = a > f ? a : f, M = l > _ ? l : _;
  return [d, g, p, M];
}
var lM = Object.defineProperty, fM = Object.defineProperties, cM = Object.getOwnPropertyDescriptors, jc = Object.getOwnPropertySymbols, gM = Object.prototype.hasOwnProperty, vM = Object.prototype.propertyIsEnumerable, tg = (n, i, a) => i in n ? lM(n, i, { enumerable: !0, configurable: !0, writable: !0, value: a }) : n[i] = a, eg = (n, i) => {
  for (var a in i || (i = {}))
    gM.call(i, a) && tg(n, a, i[a]);
  if (jc)
    for (var a of jc(i))
      vM.call(i, a) && tg(n, a, i[a]);
  return n;
}, ng = (n, i) => fM(n, cM(i));
function _M(n, i, a = {}) {
  if (!n || !i)
    throw new Error("lines and pt are required arguments");
  const l = Zn(i);
  let f = Fi([1 / 0, 1 / 0], {
    dist: 1 / 0,
    index: -1,
    multiFeatureIndex: -1,
    location: -1
  }), _ = 0;
  return Ll(
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
        w[0] === l[0] && w[1] === l[1] ? [O, , B] = [w, void 0, !1] : C[0] === l[0] && C[1] === l[1] ? [O, , B] = [C, void 0, !0] : [O, , B] = yM(
          x.geometry.coordinates,
          b.geometry.coordinates,
          Zn(i)
        );
        let z;
        O && (z = Fi(O, {
          dist: Hn(i, O, a),
          multiFeatureIndex: p,
          location: _ + Hn(x, O, a)
        })), z && z.properties.dist < f.properties.dist && (f = ng(eg({}, z), {
          properties: ng(eg({}, z.properties), {
            // Legacy behaviour where index progresses to next segment # if we
            // went with the end point this iteration.
            index: B ? S + 1 : S
          })
        })), _ += G;
      }
    }
  ), f;
}
function dM(n, i) {
  const [a, l, f] = n, [_, d, g] = i;
  return a * _ + l * d + f * g;
}
function mM(n, i) {
  const [a, l, f] = n, [_, d, g] = i;
  return [l * g - f * d, f * _ - a * g, a * d - l * _];
}
function ig(n) {
  return Math.sqrt(Math.pow(n[0], 2) + Math.pow(n[1], 2) + Math.pow(n[2], 2));
}
function _r(n, i) {
  const a = dM(n, i) / (ig(n) * ig(i));
  return Math.acos(Math.min(Math.max(a, -1), 1));
}
function nl(n) {
  const i = is(n[1]), a = is(n[0]);
  return [
    Math.cos(i) * Math.cos(a),
    Math.cos(i) * Math.sin(a),
    Math.sin(i)
  ];
}
function dr(n) {
  const [i, a, l] = n, f = Xc(Math.asin(l));
  return [Xc(Math.atan2(a, i)), f];
}
function yM(n, i, a) {
  const l = nl(n), f = nl(i), _ = nl(a), [d, g, p] = _, [M, S, x] = mM(l, f), w = S * p - x * g, b = x * d - M * p, C = M * g - S * d, G = C * S - b * x, O = w * x - C * M, B = b * M - w * S, z = 1 / Math.sqrt(Math.pow(G, 2) + Math.pow(O, 2) + Math.pow(B, 2)), Y = [G * z, O * z, B * z], W = [-1 * G * z, -1 * O * z, -1 * B * z], X = _r(l, f), V = _r(l, Y), K = _r(f, Y), et = _r(l, W), j = _r(f, W);
  let vt;
  return V < et && V < j || K < et && K < j ? vt = Y : vt = W, _r(l, vt) > X || _r(f, vt) > X ? Hn(dr(vt), dr(l)) <= Hn(dr(vt), dr(f)) ? [dr(l), !0, !1] : [dr(f), !1, !0] : [dr(vt), !1, !1];
}
var ro = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function pM(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
function EM(n, i = {}) {
  const a = xi(n), l = (a[0] + a[2]) / 2, f = (a[1] + a[3]) / 2;
  return Fi([l, f], i.properties, i);
}
var mo = { exports: {} }, xM = mo.exports, rg;
function MM() {
  return rg || (rg = 1, function(n, i) {
    (function(a, l) {
      n.exports = l();
    })(xM, function() {
      function a(u, t) {
        (t == null || t > u.length) && (t = u.length);
        for (var e = 0, s = Array(t); e < t; e++) s[e] = u[e];
        return s;
      }
      function l(u, t, e) {
        return t = S(t), function(s, h) {
          if (h && (typeof h == "object" || typeof h == "function")) return h;
          if (h !== void 0) throw new TypeError("Derived constructors may only return object or undefined");
          return function(v) {
            if (v === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return v;
          }(s);
        }(u, w() ? Reflect.construct(t, e || [], S(u).constructor) : t.apply(u, e));
      }
      function f(u, t) {
        if (!(u instanceof t)) throw new TypeError("Cannot call a class as a function");
      }
      function _(u, t, e) {
        if (w()) return Reflect.construct.apply(null, arguments);
        var s = [null];
        s.push.apply(s, t);
        var h = new (u.bind.apply(u, s))();
        return e && b(h, e.prototype), h;
      }
      function d(u, t) {
        for (var e = 0; e < t.length; e++) {
          var s = t[e];
          s.enumerable = s.enumerable || !1, s.configurable = !0, "value" in s && (s.writable = !0), Object.defineProperty(u, O(s.key), s);
        }
      }
      function g(u, t, e) {
        return t && d(u.prototype, t), e && d(u, e), Object.defineProperty(u, "prototype", { writable: !1 }), u;
      }
      function p(u, t) {
        var e = typeof Symbol < "u" && u[Symbol.iterator] || u["@@iterator"];
        if (!e) {
          if (Array.isArray(u) || (e = B(u)) || t) {
            e && (u = e);
            var s = 0, h = function() {
            };
            return { s: h, n: function() {
              return s >= u.length ? { done: !0 } : { done: !1, value: u[s++] };
            }, e: function(N) {
              throw N;
            }, f: h };
          }
          throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
        }
        var v, m = !0, E = !1;
        return { s: function() {
          e = e.call(u);
        }, n: function() {
          var N = e.next();
          return m = N.done, N;
        }, e: function(N) {
          E = !0, v = N;
        }, f: function() {
          try {
            m || e.return == null || e.return();
          } finally {
            if (E) throw v;
          }
        } };
      }
      function M() {
        return M = typeof Reflect < "u" && Reflect.get ? Reflect.get.bind() : function(u, t, e) {
          var s = function(v, m) {
            for (; !{}.hasOwnProperty.call(v, m) && (v = S(v)) !== null; ) ;
            return v;
          }(u, t);
          if (s) {
            var h = Object.getOwnPropertyDescriptor(s, t);
            return h.get ? h.get.call(arguments.length < 3 ? u : e) : h.value;
          }
        }, M.apply(null, arguments);
      }
      function S(u) {
        return S = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t) {
          return t.__proto__ || Object.getPrototypeOf(t);
        }, S(u);
      }
      function x(u, t) {
        if (typeof t != "function" && t !== null) throw new TypeError("Super expression must either be null or a function");
        u.prototype = Object.create(t && t.prototype, { constructor: { value: u, writable: !0, configurable: !0 } }), Object.defineProperty(u, "prototype", { writable: !1 }), t && b(u, t);
      }
      function w() {
        try {
          var u = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
          }));
        } catch {
        }
        return (w = function() {
          return !!u;
        })();
      }
      function b(u, t) {
        return b = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(e, s) {
          return e.__proto__ = s, e;
        }, b(u, t);
      }
      function C(u, t, e, s) {
        var h = M(S(1 & s ? u.prototype : u), t, e);
        return 2 & s && typeof h == "function" ? function(v) {
          return h.apply(e, v);
        } : h;
      }
      function G(u) {
        return function(t) {
          if (Array.isArray(t)) return a(t);
        }(u) || function(t) {
          if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
        }(u) || B(u) || function() {
          throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
        }();
      }
      function O(u) {
        var t = function(e, s) {
          if (typeof e != "object" || !e) return e;
          var h = e[Symbol.toPrimitive];
          if (h !== void 0) {
            var v = h.call(e, s);
            if (typeof v != "object") return v;
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
      function z(u) {
        var t = typeof Map == "function" ? /* @__PURE__ */ new Map() : void 0;
        return z = function(e) {
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
            return _(e, arguments, S(this).constructor);
          }
          return s.prototype = Object.create(e.prototype, { constructor: { value: s, enumerable: !1, writable: !0, configurable: !0 } }), b(s, e);
        }, z(u);
      }
      var Y = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
              var h = arguments[0], v = arguments[1], m = arguments[2], E = arguments[3];
              this.setQuadrantSegments(h), this.setEndCapStyle(v), this.setJoinStyle(m), this.setMitreLimit(E);
            }
          }
        } }, { key: "bufferDistanceError", value: function(t) {
          var e = Math.PI / 2 / t;
          return 1 - Math.cos(e / 2);
        } }]);
      }();
      Y.CAP_ROUND = 1, Y.CAP_FLAT = 2, Y.CAP_SQUARE = 3, Y.JOIN_ROUND = 1, Y.JOIN_MITRE = 2, Y.JOIN_BEVEL = 3, Y.DEFAULT_QUADRANT_SEGMENTS = 8, Y.DEFAULT_MITRE_LIMIT = 5, Y.DEFAULT_SIMPLIFY_FACTOR = 0.01;
      var W = function(u) {
        function t(e) {
          var s;
          return f(this, t), (s = l(this, t, [e])).name = Object.keys({ Exception: t })[0], s;
        }
        return x(t, u), g(t, [{ key: "toString", value: function() {
          return this.message;
        } }]);
      }(z(Error)), X = function(u) {
        function t(e) {
          var s;
          return f(this, t), (s = l(this, t, [e])).name = Object.keys({ IllegalArgumentException: t })[0], s;
        }
        return x(t, u), g(t);
      }(W), V = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "filter", value: function(u) {
        } }]);
      }();
      function K() {
      }
      function et() {
      }
      function j() {
      }
      var vt, _t, Mt, kt, it, St, Gt, Dt, $t = function() {
        return g(function u() {
          f(this, u);
        }, null, [{ key: "equalsWithTolerance", value: function(u, t, e) {
          return Math.abs(u - t) <= e;
        } }]);
      }(), he = function() {
        return g(function u(t, e) {
          f(this, u), this.low = e || 0, this.high = t || 0;
        }, null, [{ key: "toBinaryString", value: function(u) {
          var t, e = "";
          for (t = 2147483648; t > 0; t >>>= 1) e += (u.high & t) === t ? "1" : "0";
          for (t = 2147483648; t > 0; t >>>= 1) e += (u.low & t) === t ? "1" : "0";
          return e;
        } }]);
      }();
      function ht() {
      }
      function Zt() {
      }
      ht.NaN = NaN, ht.isNaN = function(u) {
        return Number.isNaN(u);
      }, ht.isInfinite = function(u) {
        return !Number.isFinite(u);
      }, ht.MAX_VALUE = Number.MAX_VALUE, ht.POSITIVE_INFINITY = Number.POSITIVE_INFINITY, ht.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY, typeof Float64Array == "function" && typeof Int32Array == "function" ? (St = 2146435072, Gt = new Float64Array(1), Dt = new Int32Array(Gt.buffer), ht.doubleToLongBits = function(u) {
        Gt[0] = u;
        var t = 0 | Dt[0], e = 0 | Dt[1];
        return (e & St) === St && 1048575 & e && t !== 0 && (t = 0, e = 2146959360), new he(e, t);
      }, ht.longBitsToDouble = function(u) {
        return Dt[0] = u.low, Dt[1] = u.high, Gt[0];
      }) : (vt = 1023, _t = Math.log2, Mt = Math.floor, kt = Math.pow, it = function() {
        for (var u = 53; u > 0; u--) {
          var t = kt(2, u) - 1;
          if (Mt(_t(t)) + 1 === u) return t;
        }
        return 0;
      }(), ht.doubleToLongBits = function(u) {
        var t, e, s, h, v, m, E, N, R;
        if (u < 0 || 1 / u === Number.NEGATIVE_INFINITY ? (m = 1 << 31, u = -u) : m = 0, u === 0) return new he(N = m, R = 0);
        if (u === 1 / 0) return new he(N = 2146435072 | m, R = 0);
        if (u != u) return new he(N = 2146959360, R = 0);
        if (h = 0, R = 0, (t = Mt(u)) > 1) if (t <= it) (h = Mt(_t(t))) <= 20 ? (R = 0, N = t << 20 - h & 1048575) : (R = t % (e = kt(2, s = h - 20)) << 32 - s, N = t / e & 1048575);
        else for (s = t, R = 0; (s = Mt(e = s / 2)) !== 0; ) h++, R >>>= 1, R |= (1 & N) << 31, N >>>= 1, e !== s && (N |= 524288);
        if (E = h + vt, v = t === 0, t = u - t, h < 52 && t !== 0) for (s = 0; ; ) {
          if ((e = 2 * t) >= 1 ? (t = e - 1, v ? (E--, v = !1) : (s <<= 1, s |= 1, h++)) : (t = e, v ? --E == 0 && (h++, v = !1) : (s <<= 1, h++)), h === 20) N |= s, s = 0;
          else if (h === 52) {
            R |= s;
            break;
          }
          if (e === 1) {
            h < 20 ? N |= s << 20 - h : h < 52 && (R |= s << 52 - h);
            break;
          }
        }
        return N |= E << 20, new he(N |= m, R);
      }, ht.longBitsToDouble = function(u) {
        var t, e, s, h, v = u.high, m = u.low, E = v & 1 << 31 ? -1 : 1;
        for (s = ((2146435072 & v) >> 20) - vt, h = 0, e = 1 << 19, t = 1; t <= 20; t++) v & e && (h += kt(2, -t)), e >>>= 1;
        for (e = 1 << 31, t = 21; t <= 52; t++) m & e && (h += kt(2, -t)), e >>>= 1;
        if (s === -1023) {
          if (h === 0) return 0 * E;
          s = -1022;
        } else {
          if (s === 1024) return h === 0 ? E / 0 : NaN;
          h += 1;
        }
        return E * h * kt(2, s);
      });
      var le = function(u) {
        function t(e) {
          var s;
          return f(this, t), (s = l(this, t, [e])).name = Object.keys({ RuntimeException: t })[0], s;
        }
        return x(t, u), g(t);
      }(W), Me = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, null, [{ key: "constructor_", value: function() {
          if (arguments.length === 0) le.constructor_.call(this);
          else if (arguments.length === 1) {
            var e = arguments[0];
            le.constructor_.call(this, e);
          }
        } }]);
      }(le), Nt = function() {
        function u() {
          f(this, u);
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
            var s = arguments[0], h = arguments[1], v = arguments[2];
            if (!h.equals(s)) throw new Me("Expected " + s + " but encountered " + h + (v !== null ? ": " + v : ""));
          }
        } }]);
      }(), we = new ArrayBuffer(8), xr = new Float64Array(we), Ua = new Int32Array(we), U = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
          throw new X("Invalid ordinate index: " + u.M);
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
          throw new X("Invalid ordinate index: " + t);
        } }, { key: "equals3D", value: function(t) {
          return this.x === t.x && this.y === t.y && (this.getZ() === t.getZ() || ht.isNaN(this.getZ()) && ht.isNaN(t.getZ()));
        } }, { key: "equals", value: function(t) {
          return t instanceof u && this.equals2D(t);
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
          return [K, et, j];
        } }], [{ key: "constructor_", value: function() {
          if (this.x = null, this.y = null, this.z = null, arguments.length === 0) u.constructor_.call(this, 0, 0);
          else if (arguments.length === 1) {
            var t = arguments[0];
            u.constructor_.call(this, t.x, t.y, t.getZ());
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            u.constructor_.call(this, e, s, u.NULL_ORDINATE);
          } else if (arguments.length === 3) {
            var h = arguments[0], v = arguments[1], m = arguments[2];
            this.x = h, this.y = v, this.z = m;
          }
        } }, { key: "hashCode", value: function(t) {
          return xr[0] = t, Ua[0] ^ Ua[1];
        } }]);
      }(), Hi = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "compare", value: function(t, e) {
          var s = u.compare(t.x, e.x);
          if (s !== 0) return s;
          var h = u.compare(t.y, e.y);
          return h !== 0 ? h : this._dimensionsToTest <= 2 ? 0 : u.compare(t.getZ(), e.getZ());
        } }, { key: "interfaces_", get: function() {
          return [Zt];
        } }], [{ key: "constructor_", value: function() {
          if (this._dimensionsToTest = 2, arguments.length === 0) u.constructor_.call(this, 2);
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
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
            if (arguments[0] instanceof U) {
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
            if (arguments[0] instanceof U) {
              var e = arguments[0];
              return this.intersects(e.x, e.y);
            }
          } else if (arguments.length === 2) {
            if (arguments[0] instanceof U && arguments[1] instanceof U) {
              var s = arguments[0], h = arguments[1];
              return !this.isNull() && !((s.x < h.x ? s.x : h.x) > this._maxx) && !((s.x > h.x ? s.x : h.x) < this._minx) && !((s.y < h.y ? s.y : h.y) > this._maxy) && !((s.y > h.y ? s.y : h.y) < this._miny);
            }
            if (typeof arguments[0] == "number" && typeof arguments[1] == "number") {
              var v = arguments[0], m = arguments[1];
              return !this.isNull() && !(v > this._maxx || v < this._minx || m > this._maxy || m < this._miny);
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
            if (arguments[0] instanceof U) {
              var e = arguments[0];
              return this.covers(e);
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            return this.covers(s, h);
          }
        } }, { key: "centre", value: function() {
          return this.isNull() ? null : new U((this.getMinX() + this.getMaxX()) / 2, (this.getMinY() + this.getMaxY()) / 2);
        } }, { key: "init", value: function() {
          if (arguments.length === 0) this.setToNull();
          else if (arguments.length === 1) {
            if (arguments[0] instanceof U) {
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
            var v = arguments[0], m = arguments[1], E = arguments[2], N = arguments[3];
            v < m ? (this._minx = v, this._maxx = m) : (this._minx = m, this._maxx = v), E < N ? (this._miny = E, this._maxy = N) : (this._miny = N, this._maxy = E);
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
            } else if (arguments[0] instanceof u) {
              var e = arguments[0];
              this.init(e);
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            this.init(s.x, h.x, s.y, h.y);
          } else if (arguments.length === 4) {
            var v = arguments[0], m = arguments[1], E = arguments[2], N = arguments[3];
            this.init(v, m, E, N);
          }
        } }, { key: "intersects", value: function() {
          if (arguments.length === 3) {
            var t = arguments[0], e = arguments[1], s = arguments[2];
            return s.x >= (t.x < e.x ? t.x : e.x) && s.x <= (t.x > e.x ? t.x : e.x) && s.y >= (t.y < e.y ? t.y : e.y) && s.y <= (t.y > e.y ? t.y : e.y);
          }
          if (arguments.length === 4) {
            var h = arguments[0], v = arguments[1], m = arguments[2], E = arguments[3], N = Math.min(m.x, E.x), R = Math.max(m.x, E.x), D = Math.min(h.x, v.x), q = Math.max(h.x, v.x);
            return !(D > R) && !(q < N) && (N = Math.min(m.y, E.y), R = Math.max(m.y, E.y), D = Math.min(h.y, v.y), q = Math.max(h.y, v.y), !(D > R) && !(q < N));
          }
        } }]);
      }(), ft = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
          if (t.getTypeCode() === u.TYPECODE_GEOMETRYCOLLECTION) throw new X("This method does not support GeometryCollection arguments");
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
          for (var s = t.iterator(), h = e.iterator(); s.hasNext() && h.hasNext(); ) {
            var v = s.next(), m = h.next(), E = v.compareTo(m);
            if (E !== 0) return E;
          }
          return s.hasNext() ? 1 : h.hasNext() ? -1 : 0;
        } }, { key: "hashCode", value: function() {
          return this.getEnvelopeInternal().hashCode();
        } }, { key: "isEquivalentClass", value: function(t) {
          return this.getClass() === t.getClass();
        } }, { key: "isGeometryCollectionOrDerived", value: function() {
          return this.getTypeCode() === u.TYPECODE_GEOMETRYCOLLECTION || this.getTypeCode() === u.TYPECODE_MULTIPOINT || this.getTypeCode() === u.TYPECODE_MULTILINESTRING || this.getTypeCode() === u.TYPECODE_MULTIPOLYGON;
        } }, { key: "interfaces_", get: function() {
          return [et, K, j];
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
      ft.constructor_ = function(u) {
        u && (this._envelope = null, this._userData = null, this._factory = u, this._SRID = u.getSRID());
      }, ft.TYPECODE_POINT = 0, ft.TYPECODE_MULTIPOINT = 1, ft.TYPECODE_LINESTRING = 2, ft.TYPECODE_LINEARRING = 3, ft.TYPECODE_MULTILINESTRING = 4, ft.TYPECODE_POLYGON = 5, ft.TYPECODE_MULTIPOLYGON = 6, ft.TYPECODE_GEOMETRYCOLLECTION = 7, ft.TYPENAME_POINT = "Point", ft.TYPENAME_MULTIPOINT = "MultiPoint", ft.TYPENAME_LINESTRING = "LineString", ft.TYPENAME_LINEARRING = "LinearRing", ft.TYPENAME_MULTILINESTRING = "MultiLineString", ft.TYPENAME_POLYGON = "Polygon", ft.TYPENAME_MULTIPOLYGON = "MultiPolygon", ft.TYPENAME_GEOMETRYCOLLECTION = "GeometryCollection", ft.geometryChangedFilter = { get interfaces_() {
        return [V];
      }, filter: function(u) {
        u.geometryChangedAction();
      } };
      var T = function() {
        function u() {
          f(this, u);
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
          throw new X("Unknown location value: " + t);
        } }]);
      }();
      T.INTERIOR = 0, T.BOUNDARY = 1, T.EXTERIOR = 2, T.NONE = -1;
      var nn = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "add", value: function() {
        } }, { key: "addAll", value: function() {
        } }, { key: "isEmpty", value: function() {
        } }, { key: "iterator", value: function() {
        } }, { key: "size", value: function() {
        } }, { key: "toArray", value: function() {
        } }, { key: "remove", value: function() {
        } }]);
      }(), Se = function(u) {
        function t(e) {
          var s;
          return f(this, t), (s = l(this, t, [e])).name = Object.keys({ NoSuchElementException: t })[0], s;
        }
        return x(t, u), g(t);
      }(W), qe = function(u) {
        function t(e) {
          var s;
          return f(this, t), (s = l(this, t, [e])).name = Object.keys({ UnsupportedOperationException: t })[0], s;
        }
        return x(t, u), g(t);
      }(W), za = function(u) {
        function t() {
          return f(this, t), l(this, t, arguments);
        }
        return x(t, u), g(t, [{ key: "contains", value: function() {
        } }]);
      }(nn), rn = function(u) {
        function t(e) {
          var s;
          return f(this, t), (s = l(this, t)).map = /* @__PURE__ */ new Map(), e instanceof nn && s.addAll(e), s;
        }
        return x(t, u), g(t, [{ key: "contains", value: function(e) {
          var s = e.hashCode ? e.hashCode() : e;
          return !!this.map.has(s);
        } }, { key: "add", value: function(e) {
          var s = e.hashCode ? e.hashCode() : e;
          return !this.map.has(s) && !!this.map.set(s, e);
        } }, { key: "addAll", value: function(e) {
          var s, h = p(e);
          try {
            for (h.s(); !(s = h.n()).done; ) {
              var v = s.value;
              this.add(v);
            }
          } catch (m) {
            h.e(m);
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
          return new Ya(this.map);
        } }, { key: Symbol.iterator, value: function() {
          return this.map;
        } }]);
      }(za), Ya = function() {
        return g(function u(t) {
          f(this, u), this.iterator = t.values();
          var e = this.iterator.next(), s = e.done, h = e.value;
          this.done = s, this.value = h;
        }, [{ key: "next", value: function() {
          if (this.done) throw new Se();
          var u = this.value, t = this.iterator.next(), e = t.done, s = t.value;
          return this.done = e, this.value = s, u;
        } }, { key: "hasNext", value: function() {
          return !this.done;
        } }, { key: "remove", value: function() {
          throw new qe();
        } }]);
      }(), tt = function() {
        function u() {
          f(this, u);
        }
        return g(u, null, [{ key: "opposite", value: function(t) {
          return t === u.LEFT ? u.RIGHT : t === u.RIGHT ? u.LEFT : t;
        } }]);
      }();
      tt.ON = 0, tt.LEFT = 1, tt.RIGHT = 2;
      var Si = function(u) {
        function t(e) {
          var s;
          return f(this, t), (s = l(this, t, [e])).name = Object.keys({ EmptyStackException: t })[0], s;
        }
        return x(t, u), g(t);
      }(W), Be = function(u) {
        function t(e) {
          var s;
          return f(this, t), (s = l(this, t, [e])).name = Object.keys({ IndexOutOfBoundsException: t })[0], s;
        }
        return x(t, u), g(t);
      }(W), sn = function(u) {
        function t() {
          return f(this, t), l(this, t, arguments);
        }
        return x(t, u), g(t, [{ key: "get", value: function() {
        } }, { key: "set", value: function() {
        } }, { key: "isEmpty", value: function() {
        } }]);
      }(nn), Mr = function(u) {
        function t() {
          var e;
          return f(this, t), (e = l(this, t)).array = [], e;
        }
        return x(t, u), g(t, [{ key: "add", value: function(e) {
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
      function wt(u, t) {
        return u.interfaces_ && u.interfaces_.indexOf(t) > -1;
      }
      var Pn = function() {
        return g(function u(t) {
          f(this, u), this.str = t;
        }, [{ key: "append", value: function(u) {
          this.str += u;
        } }, { key: "setCharAt", value: function(u, t) {
          this.str = this.str.substr(0, u) + t + this.str.substr(u + 1);
        } }, { key: "toString", value: function() {
          return this.str;
        } }]);
      }(), wr = function() {
        function u(t) {
          f(this, u), this.value = t;
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
      }(), jn = function() {
        return g(function u() {
          f(this, u);
        }, null, [{ key: "isWhitespace", value: function(u) {
          return u <= 32 && u >= 0 || u === 127;
        } }, { key: "toUpperCase", value: function(u) {
          return u.toUpperCase();
        } }]);
      }(), dt = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "le", value: function(t) {
          return this._hi < t._hi || this._hi === t._hi && this._lo <= t._lo;
        } }, { key: "extractSignificantDigits", value: function(t, e) {
          var s = this.abs(), h = u.magnitude(s._hi), v = u.TEN.pow(h);
          (s = s.divide(v)).gt(u.TEN) ? (s = s.divide(u.TEN), h += 1) : s.lt(u.ONE) && (s = s.multiply(u.TEN), h -= 1);
          for (var m = h + 1, E = new Pn(), N = u.MAX_PRINT_DIGITS - 1, R = 0; R <= N; R++) {
            t && R === m && E.append(".");
            var D = Math.trunc(s._hi);
            if (D < 0) break;
            var q = !1, Z = 0;
            D > 9 ? (q = !0, Z = "9") : Z = "0" + D, E.append(Z), s = s.subtract(u.valueOf(D)).multiply(u.TEN), q && s.selfAdd(u.TEN);
            var rt = !0, ot = u.magnitude(s._hi);
            if (ot < 0 && Math.abs(ot) >= N - R && (rt = !1), !rt) break;
          }
          return e[0] = h, E.toString();
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
            var s, h, v, m, E = arguments[0], N = arguments[1], R = null, D = null, q = null, Z = null;
            return v = this._hi / E, Z = (R = (q = u.SPLIT * v) - (R = q - v)) * (D = (Z = u.SPLIT * E) - (D = Z - E)) - (m = v * E) + R * (h = E - D) + (s = v - R) * D + s * h, Z = v + (q = (this._hi - m - Z + this._lo - v * N) / E), this._hi = Z, this._lo = v - Z + q, this;
          }
        } }, { key: "dump", value: function() {
          return "DD<" + this._hi + ", " + this._lo + ">";
        } }, { key: "divide", value: function() {
          if (arguments[0] instanceof u) {
            var t, e, s, h, v = arguments[0], m = null, E = null, N = null, R = null;
            return t = (s = this._hi / v._hi) - (m = (N = u.SPLIT * s) - (m = N - s)), R = m * (E = (R = u.SPLIT * v._hi) - (E = R - v._hi)) - (h = s * v._hi) + m * (e = v._hi - E) + t * E + t * e, new u(R = s + (N = (this._hi - h - R + this._lo - s * v._lo) / v._hi), s - R + N);
          }
          if (typeof arguments[0] == "number") {
            var D = arguments[0];
            return ht.isNaN(D) ? u.createNaN() : u.copy(this).selfDivide(D, 0);
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
              var e, s, h, v, m, E = arguments[0], N = null;
              return N = (h = this._hi + E) - (v = h - this._hi), s = (m = (N = E - v + (this._hi - N)) + this._lo) + (h - (e = h + m)), this._hi = e + s, this._lo = s + (e - this._hi), this;
            }
          } else if (arguments.length === 2) {
            var R, D, q, Z, rt = arguments[0], ot = arguments[1], gt = null, bt = null, lt = null;
            q = this._hi + rt, D = this._lo + ot, bt = q - (lt = q - this._hi), gt = D - (Z = D - this._lo);
            var Wt = (R = q + (lt = (bt = rt - lt + (this._hi - bt)) + D)) + (lt = (gt = ot - Z + (this._lo - gt)) + (lt + (q - R))), ce = lt + (R - Wt);
            return this._hi = Wt, this._lo = ce, this;
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
            var s, h, v = arguments[0], m = arguments[1], E = null, N = null, R = null, D = null;
            E = (R = u.SPLIT * this._hi) - this._hi, D = u.SPLIT * v, E = R - E, s = this._hi - E, N = D - v;
            var q = (R = this._hi * v) + (D = E * (N = D - N) - R + E * (h = v - N) + s * N + s * h + (this._hi * m + this._lo * v)), Z = D + (E = R - q);
            return this._hi = q, this._lo = Z, this;
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
          var e = new Array(1).fill(null), s = this.extractSignificantDigits(!0, e), h = e[0] + 1, v = s;
          if (s.charAt(0) === ".") v = "0" + s;
          else if (h < 0) v = "0." + u.stringOfChar("0", -h) + s;
          else if (s.indexOf(".") === -1) {
            var m = h - s.length;
            v = s + u.stringOfChar("0", m) + ".0";
          }
          return this.isNegative() ? "-" + v : v;
        } }, { key: "reciprocal", value: function() {
          var t, e, s, h, v = null, m = null, E = null, N = null;
          t = (s = 1 / this._hi) - (v = (E = u.SPLIT * s) - (v = E - s)), m = (N = u.SPLIT * this._hi) - this._hi;
          var R = s + (E = (1 - (h = s * this._hi) - (N = v * (m = N - m) - h + v * (e = this._hi - m) + t * m + t * e) - s * this._lo) / this._hi);
          return new u(R, s - R + E);
        } }, { key: "toSciNotation", value: function() {
          if (this.isZero()) return u.SCI_NOT_ZERO;
          var t = this.getSpecialNumberString();
          if (t !== null) return t;
          var e = new Array(1).fill(null), s = this.extractSignificantDigits(!1, e), h = u.SCI_NOT_EXPONENT_CHAR + e[0];
          if (s.charAt(0) === "0") throw new IllegalStateException("Found leading zero: " + s);
          var v = "";
          s.length > 1 && (v = s.substring(1));
          var m = s.charAt(0) + "." + v;
          return this.isNegative() ? "-" + m + h : m + h;
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
          return [j, K, et];
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
            var h = arguments[0], v = arguments[1];
            this.init(h, v);
          }
        } }, { key: "determinant", value: function() {
          if (typeof arguments[3] == "number" && typeof arguments[2] == "number" && typeof arguments[0] == "number" && typeof arguments[1] == "number") {
            var t = arguments[0], e = arguments[1], s = arguments[2], h = arguments[3];
            return u.determinant(u.valueOf(t), u.valueOf(e), u.valueOf(s), u.valueOf(h));
          }
          if (arguments[3] instanceof u && arguments[2] instanceof u && arguments[0] instanceof u && arguments[1] instanceof u) {
            var v = arguments[1], m = arguments[2], E = arguments[3];
            return arguments[0].multiply(E).selfSubtract(v.multiply(m));
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
          for (var e = 0, s = t.length; jn.isWhitespace(t.charAt(e)); ) e++;
          var h = !1;
          if (e < s) {
            var v = t.charAt(e);
            v !== "-" && v !== "+" || (e++, v === "-" && (h = !0));
          }
          for (var m = new u(), E = 0, N = 0, R = 0, D = !1; !(e >= s); ) {
            var q = t.charAt(e);
            if (e++, jn.isDigit(q)) {
              var Z = q - "0";
              m.selfMultiply(u.TEN), m.selfAdd(Z), E++;
            } else {
              if (q !== ".") {
                if (q === "e" || q === "E") {
                  var rt = t.substring(e);
                  try {
                    R = wr.parseInt(rt);
                  } catch (Wt) {
                    throw Wt instanceof NumberFormatException ? new NumberFormatException("Invalid exponent " + rt + " in string " + t) : Wt;
                  }
                  break;
                }
                throw new NumberFormatException("Unexpected character '" + q + "' at position " + e + " in string " + t);
              }
              N = E, D = !0;
            }
          }
          var ot = m;
          D || (N = E);
          var gt = E - N - R;
          if (gt === 0) ot = m;
          else if (gt > 0) {
            var bt = u.TEN.pow(gt);
            ot = m.divide(bt);
          } else if (gt < 0) {
            var lt = u.TEN.pow(-gt);
            ot = m.multiply(lt);
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
          for (var s = new Pn(), h = 0; h < e; h++) s.append(t);
          return s.toString();
        } }]);
      }();
      dt.PI = new dt(3.141592653589793, 12246467991473532e-32), dt.TWO_PI = new dt(6.283185307179586, 24492935982947064e-32), dt.PI_2 = new dt(1.5707963267948966, 6123233995736766e-32), dt.E = new dt(2.718281828459045, 14456468917292502e-32), dt.NaN = new dt(ht.NaN, ht.NaN), dt.EPS = 123259516440783e-46, dt.SPLIT = 134217729, dt.MAX_PRINT_DIGITS = 32, dt.TEN = dt.valueOf(10), dt.ONE = dt.valueOf(1), dt.SCI_NOT_EXPONENT_CHAR = "E", dt.SCI_NOT_ZERO = "0.0E0";
      var Vi = function() {
        function u() {
          f(this, u);
        }
        return g(u, null, [{ key: "orientationIndex", value: function(t, e, s) {
          var h = u.orientationIndexFilter(t, e, s);
          if (h <= 1) return h;
          var v = dt.valueOf(e.x).selfAdd(-t.x), m = dt.valueOf(e.y).selfAdd(-t.y), E = dt.valueOf(s.x).selfAdd(-e.x), N = dt.valueOf(s.y).selfAdd(-e.y);
          return v.selfMultiply(N).selfSubtract(m.selfMultiply(E)).signum();
        } }, { key: "signOfDet2x2", value: function() {
          if (arguments[3] instanceof dt && arguments[2] instanceof dt && arguments[0] instanceof dt && arguments[1] instanceof dt) {
            var t = arguments[1], e = arguments[2], s = arguments[3];
            return arguments[0].multiply(s).selfSubtract(t.multiply(e)).signum();
          }
          if (typeof arguments[3] == "number" && typeof arguments[2] == "number" && typeof arguments[0] == "number" && typeof arguments[1] == "number") {
            var h = arguments[0], v = arguments[1], m = arguments[2], E = arguments[3], N = dt.valueOf(h), R = dt.valueOf(v), D = dt.valueOf(m), q = dt.valueOf(E);
            return N.multiply(q).selfSubtract(R.multiply(D)).signum();
          }
        } }, { key: "intersection", value: function(t, e, s, h) {
          var v = new dt(t.y).selfSubtract(e.y), m = new dt(e.x).selfSubtract(t.x), E = new dt(t.x).selfMultiply(e.y).selfSubtract(new dt(e.x).selfMultiply(t.y)), N = new dt(s.y).selfSubtract(h.y), R = new dt(h.x).selfSubtract(s.x), D = new dt(s.x).selfMultiply(h.y).selfSubtract(new dt(h.x).selfMultiply(s.y)), q = m.multiply(D).selfSubtract(R.multiply(E)), Z = N.multiply(E).selfSubtract(v.multiply(D)), rt = v.multiply(R).selfSubtract(N.multiply(m)), ot = q.selfDivide(rt).doubleValue(), gt = Z.selfDivide(rt).doubleValue();
          return ht.isNaN(ot) || ht.isInfinite(ot) || ht.isNaN(gt) || ht.isInfinite(gt) ? null : new U(ot, gt);
        } }, { key: "orientationIndexFilter", value: function(t, e, s) {
          var h = null, v = (t.x - s.x) * (e.y - s.y), m = (t.y - s.y) * (e.x - s.x), E = v - m;
          if (v > 0) {
            if (m <= 0) return u.signum(E);
            h = v + m;
          } else {
            if (!(v < 0) || m >= 0) return u.signum(E);
            h = -v - m;
          }
          var N = u.DP_SAFE_EPSILON * h;
          return E >= N || -E >= N ? u.signum(E) : 2;
        } }, { key: "signum", value: function(t) {
          return t > 0 ? 1 : t < 0 ? -1 : 0;
        } }]);
      }();
      Vi.DP_SAFE_EPSILON = 1e-15;
      var At = function() {
        return g(function u() {
          f(this, u);
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
      var pt = function() {
        function u() {
          f(this, u);
        }
        return g(u, null, [{ key: "index", value: function(t, e, s) {
          return Vi.orientationIndex(t, e, s);
        } }, { key: "isCCW", value: function() {
          if (arguments[0] instanceof Array) {
            var t = arguments[0], e = t.length - 1;
            if (e < 3) throw new X("Ring has fewer than 4 points, so orientation cannot be determined");
            for (var s = t[0], h = 0, v = 1; v <= e; v++) {
              var m = t[v];
              m.y > s.y && (s = m, h = v);
            }
            var E = h;
            do
              (E -= 1) < 0 && (E = e);
            while (t[E].equals2D(s) && E !== h);
            var N = h;
            do
              N = (N + 1) % e;
            while (t[N].equals2D(s) && N !== h);
            var R = t[E], D = t[N];
            if (R.equals2D(s) || D.equals2D(s) || R.equals2D(D)) return !1;
            var q = u.index(R, s, D);
            return q === 0 ? R.x > D.x : q > 0;
          }
          if (wt(arguments[0], At)) {
            var Z = arguments[0], rt = Z.size() - 1;
            if (rt < 3) throw new X("Ring has fewer than 4 points, so orientation cannot be determined");
            for (var ot = Z.getCoordinate(0), gt = 0, bt = 1; bt <= rt; bt++) {
              var lt = Z.getCoordinate(bt);
              lt.y > ot.y && (ot = lt, gt = bt);
            }
            var Wt = null, ce = gt;
            do
              (ce -= 1) < 0 && (ce = rt), Wt = Z.getCoordinate(ce);
            while (Wt.equals2D(ot) && ce !== gt);
            var se = null, fi = gt;
            do
              fi = (fi + 1) % rt, se = Z.getCoordinate(fi);
            while (se.equals2D(ot) && fi !== gt);
            if (Wt.equals2D(ot) || se.equals2D(ot) || Wt.equals2D(se)) return !1;
            var ir = u.index(Wt, ot, se);
            return ir === 0 ? Wt.x > se.x : ir > 0;
          }
        } }]);
      }();
      pt.CLOCKWISE = -1, pt.RIGHT = pt.CLOCKWISE, pt.COUNTERCLOCKWISE = 1, pt.LEFT = pt.COUNTERCLOCKWISE, pt.COLLINEAR = 0, pt.STRAIGHT = pt.COLLINEAR;
      var _s = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getCoordinate", value: function() {
          return this._minCoord;
        } }, { key: "getRightmostSide", value: function(u, t) {
          var e = this.getRightmostSideOfSegment(u, t);
          return e < 0 && (e = this.getRightmostSideOfSegment(u, t - 1)), e < 0 && (this._minCoord = null, this.checkForRightmostCoordinate(u)), e;
        } }, { key: "findRightmostEdgeAtVertex", value: function() {
          var u = this._minDe.getEdge().getCoordinates();
          Nt.isTrue(this._minIndex > 0 && this._minIndex < u.length, "rightmost point expected to be interior vertex of edge");
          var t = u[this._minIndex - 1], e = u[this._minIndex + 1], s = pt.index(this._minCoord, e, t), h = !1;
          (t.y < this._minCoord.y && e.y < this._minCoord.y && s === pt.COUNTERCLOCKWISE || t.y > this._minCoord.y && e.y > this._minCoord.y && s === pt.CLOCKWISE) && (h = !0), h && (this._minIndex = this._minIndex - 1);
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
          Nt.isTrue(this._minIndex !== 0 || this._minCoord.equals(this._minDe.getCoordinate()), "inconsistency in rightmost processing"), this._minIndex === 0 ? this.findRightmostEdgeAtNode() : this.findRightmostEdgeAtVertex(), this._orientedDe = this._minDe, this.getRightmostSide(this._minDe, this._minIndex) === tt.LEFT && (this._orientedDe = this._minDe.getSym());
        } }], [{ key: "constructor_", value: function() {
          this._minIndex = -1, this._minCoord = null, this._minDe = null, this._orientedDe = null;
        } }]);
      }(), an = function(u) {
        function t(e, s) {
          var h;
          return f(this, t), (h = l(this, t, [s ? e + " [ " + s + " ]" : e])).pt = s ? new U(s) : void 0, h.name = Object.keys({ TopologyException: t })[0], h;
        }
        return x(t, u), g(t, [{ key: "getCoordinate", value: function() {
          return this.pt;
        } }]);
      }(le), ds = function() {
        return g(function u() {
          f(this, u), this.array = [];
        }, [{ key: "addLast", value: function(u) {
          this.array.push(u);
        } }, { key: "removeFirst", value: function() {
          return this.array.shift();
        } }, { key: "isEmpty", value: function() {
          return this.array.length === 0;
        } }]);
      }(), mt = function(u) {
        function t(e) {
          var s;
          return f(this, t), (s = l(this, t)).array = [], e instanceof nn && s.addAll(e), s;
        }
        return x(t, u), g(t, [{ key: "interfaces_", get: function() {
          return [sn, nn];
        } }, { key: "ensureCapacity", value: function() {
        } }, { key: "add", value: function(e) {
          return arguments.length === 1 ? this.array.push(e) : this.array.splice(arguments[0], 0, arguments[1]), !0;
        } }, { key: "clear", value: function() {
          this.array = [];
        } }, { key: "addAll", value: function(e) {
          var s, h = p(e);
          try {
            for (h.s(); !(s = h.n()).done; ) {
              var v = s.value;
              this.array.push(v);
            }
          } catch (m) {
            h.e(m);
          } finally {
            h.f();
          }
        } }, { key: "set", value: function(e, s) {
          var h = this.array[e];
          return this.array[e] = s, h;
        } }, { key: "iterator", value: function() {
          return new ms(this);
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
      }(sn), ms = function() {
        return g(function u(t) {
          f(this, u), this.arrayList = t, this.position = 0;
        }, [{ key: "next", value: function() {
          if (this.position === this.arrayList.size()) throw new Se();
          return this.arrayList.get(this.position++);
        } }, { key: "hasNext", value: function() {
          return this.position < this.arrayList.size();
        } }, { key: "set", value: function(u) {
          return this.arrayList.set(this.position - 1, u);
        } }, { key: "remove", value: function() {
          this.arrayList.remove(this.arrayList.get(this.position));
        } }]);
      }(), ys = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
            var v = h.next();
            v.setVisited(!0), this.copySymDepths(v);
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
            for (var v = h.getEdges().iterator(); v.hasNext(); ) {
              var m = v.next().getSym();
              if (!m.isVisited()) {
                var E = m.getNode();
                t.contains(E) || (e.addLast(E), t.add(E));
              }
            }
          }
        } }, { key: "compareTo", value: function(u) {
          var t = u;
          return this._rightMostCoord.x < t._rightMostCoord.x ? -1 : this._rightMostCoord.x > t._rightMostCoord.x ? 1 : 0;
        } }, { key: "getEnvelope", value: function() {
          if (this._env === null) {
            for (var u = new Ht(), t = this._dirEdgeList.iterator(); t.hasNext(); ) for (var e = t.next().getEdge().getCoordinates(), s = 0; s < e.length - 1; s++) u.expandToInclude(e[s]);
            this._env = u;
          }
          return this._env;
        } }, { key: "addReachable", value: function(u) {
          var t = new Mr();
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
          return [K];
        } }], [{ key: "constructor_", value: function() {
          this._finder = null, this._dirEdgeList = new mt(), this._nodes = new mt(), this._rightMostCoord = null, this._env = null, this._finder = new _s();
        } }]);
      }(), ps = function() {
        return g(function u() {
          f(this, u);
        }, null, [{ key: "intersection", value: function(u, t, e, s) {
          var h = u.x < t.x ? u.x : t.x, v = u.y < t.y ? u.y : t.y, m = u.x > t.x ? u.x : t.x, E = u.y > t.y ? u.y : t.y, N = e.x < s.x ? e.x : s.x, R = e.y < s.y ? e.y : s.y, D = e.x > s.x ? e.x : s.x, q = e.y > s.y ? e.y : s.y, Z = ((h > N ? h : N) + (m < D ? m : D)) / 2, rt = ((v > R ? v : R) + (E < q ? E : q)) / 2, ot = u.x - Z, gt = u.y - rt, bt = t.x - Z, lt = t.y - rt, Wt = e.x - Z, ce = e.y - rt, se = s.x - Z, fi = s.y - rt, ir = gt - lt, Eu = bt - ot, rr = ot * lt - bt * gt, An = ce - fi, sr = se - Wt, Qs = Wt * fi - se * ce, ar = ir * sr - An * Eu, qr = (Eu * Qs - sr * rr) / ar, Br = (An * rr - ir * Qs) / ar;
          return ht.isNaN(qr) || ht.isInfinite(qr) || ht.isNaN(Br) || ht.isInfinite(Br) ? null : new U(qr + Z, Br + rt);
        } }]);
      }(), Ue = function() {
        return g(function u() {
          f(this, u);
        }, null, [{ key: "arraycopy", value: function(u, t, e, s, h) {
          for (var v = 0, m = t; m < t + h; m++) e[s + v] = u[m], v++;
        } }, { key: "getProperty", value: function(u) {
          return { "line.separator": `
` }[u];
        } }]);
      }(), Zi = function() {
        function u() {
          f(this, u);
        }
        return g(u, null, [{ key: "log10", value: function(t) {
          var e = Math.log(t);
          return ht.isInfinite(e) || ht.isNaN(e) ? e : e / u.LOG_10;
        } }, { key: "min", value: function(t, e, s, h) {
          var v = t;
          return e < v && (v = e), s < v && (v = s), h < v && (v = h), v;
        } }, { key: "clamp", value: function() {
          if (typeof arguments[2] == "number" && typeof arguments[0] == "number" && typeof arguments[1] == "number") {
            var t = arguments[0], e = arguments[1], s = arguments[2];
            return t < e ? e : t > s ? s : t;
          }
          if (Number.isInteger(arguments[2]) && Number.isInteger(arguments[0]) && Number.isInteger(arguments[1])) {
            var h = arguments[0], v = arguments[1], m = arguments[2];
            return h < v ? v : h > m ? m : h;
          }
        } }, { key: "wrap", value: function(t, e) {
          return t < 0 ? e - -t % e : t % e;
        } }, { key: "max", value: function() {
          if (arguments.length === 3) {
            var t = arguments[1], e = arguments[2], s = arguments[0];
            return t > s && (s = t), e > s && (s = e), s;
          }
          if (arguments.length === 4) {
            var h = arguments[1], v = arguments[2], m = arguments[3], E = arguments[0];
            return h > E && (E = h), v > E && (E = v), m > E && (E = m), E;
          }
        } }, { key: "average", value: function(t, e) {
          return (t + e) / 2;
        } }]);
      }();
      Zi.LOG_10 = Math.log(10);
      var un = function() {
        function u() {
          f(this, u);
        }
        return g(u, null, [{ key: "segmentToSegment", value: function(t, e, s, h) {
          if (t.equals(e)) return u.pointToSegment(t, s, h);
          if (s.equals(h)) return u.pointToSegment(h, t, e);
          var v = !1;
          if (Ht.intersects(t, e, s, h)) {
            var m = (e.x - t.x) * (h.y - s.y) - (e.y - t.y) * (h.x - s.x);
            if (m === 0) v = !0;
            else {
              var E = (t.y - s.y) * (h.x - s.x) - (t.x - s.x) * (h.y - s.y), N = ((t.y - s.y) * (e.x - t.x) - (t.x - s.x) * (e.y - t.y)) / m, R = E / m;
              (R < 0 || R > 1 || N < 0 || N > 1) && (v = !0);
            }
          } else v = !0;
          return v ? Zi.min(u.pointToSegment(t, s, h), u.pointToSegment(e, s, h), u.pointToSegment(s, t, e), u.pointToSegment(h, t, e)) : 0;
        } }, { key: "pointToSegment", value: function(t, e, s) {
          if (e.x === s.x && e.y === s.y) return t.distance(e);
          var h = (s.x - e.x) * (s.x - e.x) + (s.y - e.y) * (s.y - e.y), v = ((t.x - e.x) * (s.x - e.x) + (t.y - e.y) * (s.y - e.y)) / h;
          if (v <= 0) return t.distance(e);
          if (v >= 1) return t.distance(s);
          var m = ((e.y - t.y) * (s.x - e.x) - (e.x - t.x) * (s.y - e.y)) / h;
          return Math.abs(m) * Math.sqrt(h);
        } }, { key: "pointToLinePerpendicular", value: function(t, e, s) {
          var h = (s.x - e.x) * (s.x - e.x) + (s.y - e.y) * (s.y - e.y), v = ((e.y - t.y) * (s.x - e.x) - (e.x - t.x) * (s.y - e.y)) / h;
          return Math.abs(v) * Math.sqrt(h);
        } }, { key: "pointToSegmentString", value: function(t, e) {
          if (e.length === 0) throw new X("Line array must contain at least one vertex");
          for (var s = t.distance(e[0]), h = 0; h < e.length - 1; h++) {
            var v = u.pointToSegment(t, e[h], e[h + 1]);
            v < s && (s = v);
          }
          return s;
        } }]);
      }(), Es = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "create", value: function() {
          if (arguments.length === 1) arguments[0] instanceof Array || wt(arguments[0], At);
          else if (arguments.length !== 2) {
            if (arguments.length === 3) {
              var u = arguments[0], t = arguments[1];
              return this.create(u, t);
            }
          }
        } }]);
      }(), Sr = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "filter", value: function(u) {
        } }]);
      }(), Lo = function() {
        return g(function u() {
          f(this, u);
        }, null, [{ key: "ofLine", value: function(u) {
          var t = u.size();
          if (t <= 1) return 0;
          var e = 0, s = new U();
          u.getCoordinate(0, s);
          for (var h = s.x, v = s.y, m = 1; m < t; m++) {
            u.getCoordinate(m, s);
            var E = s.x, N = s.y, R = E - h, D = N - v;
            e += Math.sqrt(R * R + D * D), h = E, v = N;
          }
          return e;
        } }]);
      }(), Xa = g(function u() {
        f(this, u);
      }), ti = function() {
        function u() {
          f(this, u);
        }
        return g(u, null, [{ key: "copyCoord", value: function(t, e, s, h) {
          for (var v = Math.min(t.getDimension(), s.getDimension()), m = 0; m < v; m++) s.setOrdinate(h, m, t.getOrdinate(e, m));
        } }, { key: "isRing", value: function(t) {
          var e = t.size();
          return e === 0 || !(e <= 3) && t.getOrdinate(0, At.X) === t.getOrdinate(e - 1, At.X) && t.getOrdinate(0, At.Y) === t.getOrdinate(e - 1, At.Y);
        } }, { key: "scroll", value: function() {
          if (arguments.length === 2) {
            if (wt(arguments[0], At) && Number.isInteger(arguments[1])) {
              var t = arguments[0], e = arguments[1];
              u.scroll(t, e, u.isRing(t));
            } else if (wt(arguments[0], At) && arguments[1] instanceof U) {
              var s = arguments[0], h = arguments[1], v = u.indexOf(h, s);
              if (v <= 0) return null;
              u.scroll(s, v);
            }
          } else if (arguments.length === 3) {
            var m = arguments[0], E = arguments[1], N = arguments[2];
            if (E <= 0) return null;
            for (var R = m.copy(), D = N ? m.size() - 1 : m.size(), q = 0; q < D; q++) for (var Z = 0; Z < m.getDimension(); Z++) m.setOrdinate(q, Z, R.getOrdinate((E + q) % D, Z));
            if (N) for (var rt = 0; rt < m.getDimension(); rt++) m.setOrdinate(D, rt, m.getOrdinate(0, rt));
          }
        } }, { key: "isEqual", value: function(t, e) {
          var s = t.size();
          if (s !== e.size()) return !1;
          for (var h = Math.min(t.getDimension(), e.getDimension()), v = 0; v < s; v++) for (var m = 0; m < h; m++) {
            var E = t.getOrdinate(v, m), N = e.getOrdinate(v, m);
            if (t.getOrdinate(v, m) !== e.getOrdinate(v, m) && (!ht.isNaN(E) || !ht.isNaN(N))) return !1;
          }
          return !0;
        } }, { key: "minCoordinateIndex", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return u.minCoordinateIndex(t, 0, t.size() - 1);
          }
          if (arguments.length === 3) {
            for (var e = arguments[0], s = arguments[2], h = -1, v = null, m = arguments[1]; m <= s; m++) {
              var E = e.getCoordinate(m);
              (v === null || v.compareTo(E) > 0) && (v = E, h = m);
            }
            return h;
          }
        } }, { key: "extend", value: function(t, e, s) {
          var h = t.create(s, e.getDimension()), v = e.size();
          if (u.copy(e, 0, h, 0, v), v > 0) for (var m = v; m < s; m++) u.copy(e, v - 1, h, m, 1);
          return h;
        } }, { key: "reverse", value: function(t) {
          for (var e = t.size() - 1, s = Math.trunc(e / 2), h = 0; h <= s; h++) u.swap(t, h, e - h);
        } }, { key: "swap", value: function(t, e, s) {
          if (e === s) return null;
          for (var h = 0; h < t.getDimension(); h++) {
            var v = t.getOrdinate(e, h);
            t.setOrdinate(e, h, t.getOrdinate(s, h)), t.setOrdinate(s, h, v);
          }
        } }, { key: "copy", value: function(t, e, s, h, v) {
          for (var m = 0; m < v; m++) u.copyCoord(t, e + m, s, h + m);
        } }, { key: "ensureValidRing", value: function(t, e) {
          var s = e.size();
          return s === 0 ? e : s <= 3 ? u.createClosedRing(t, e, 4) : e.getOrdinate(0, At.X) === e.getOrdinate(s - 1, At.X) && e.getOrdinate(0, At.Y) === e.getOrdinate(s - 1, At.Y) ? e : u.createClosedRing(t, e, s + 1);
        } }, { key: "indexOf", value: function(t, e) {
          for (var s = 0; s < e.size(); s++) if (t.x === e.getOrdinate(s, At.X) && t.y === e.getOrdinate(s, At.Y)) return s;
          return -1;
        } }, { key: "createClosedRing", value: function(t, e, s) {
          var h = t.create(s, e.getDimension()), v = e.size();
          u.copy(e, 0, h, 0, v);
          for (var m = v; m < s; m++) u.copy(e, 0, h, m, 1);
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
          f(this, u);
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
          throw new X("Unknown dimension value: " + t);
        } }, { key: "toDimensionValue", value: function(t) {
          switch (jn.toUpperCase(t)) {
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
          throw new X("Unknown dimension symbol: " + t);
        } }]);
      }();
      nt.P = 0, nt.L = 1, nt.A = 2, nt.FALSE = -1, nt.TRUE = -2, nt.DONTCARE = -3, nt.SYM_FALSE = "F", nt.SYM_TRUE = "T", nt.SYM_DONTCARE = "*", nt.SYM_P = "0", nt.SYM_L = "1", nt.SYM_A = "2";
      var Ir = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "filter", value: function(u) {
        } }]);
      }(), Nr = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "filter", value: function(u, t) {
        } }, { key: "isDone", value: function() {
        } }, { key: "isGeometryChanged", value: function() {
        } }]);
      }(), Ki = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "computeEnvelopeInternal", value: function() {
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
            var h = e;
            if (this._points.size() !== h._points.size()) return !1;
            for (var v = 0; v < this._points.size(); v++) if (!this.equal(this._points.getCoordinate(v), h._points.getCoordinate(v), s)) return !1;
            return !0;
          }
          return C(t, "equalsExact", this, 1).apply(this, arguments);
        } }, { key: "normalize", value: function() {
          for (var e = 0; e < Math.trunc(this._points.size() / 2); e++) {
            var s = this._points.size() - 1 - e;
            if (!this._points.getCoordinate(e).equals(this._points.getCoordinate(s))) {
              if (this._points.getCoordinate(e).compareTo(this._points.getCoordinate(s)) > 0) {
                var h = this._points.copy();
                ti.reverse(h), this._points = h;
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
          return Lo.ofLine(this._points);
        } }, { key: "getNumPoints", value: function() {
          return this._points.size();
        } }, { key: "compareToSameClass", value: function() {
          if (arguments.length === 1) {
            for (var e = arguments[0], s = 0, h = 0; s < this._points.size() && h < e._points.size(); ) {
              var v = this._points.getCoordinate(s).compareTo(e._points.getCoordinate(h));
              if (v !== 0) return v;
              s++, h++;
            }
            return s < this._points.size() ? 1 : h < e._points.size() ? -1 : 0;
          }
          if (arguments.length === 2) {
            var m = arguments[0];
            return arguments[1].compare(this._points, m._points);
          }
        } }, { key: "apply", value: function() {
          if (wt(arguments[0], Sr)) for (var e = arguments[0], s = 0; s < this._points.size(); s++) e.filter(this._points.getCoordinate(s));
          else if (wt(arguments[0], Nr)) {
            var h = arguments[0];
            if (this._points.size() === 0) return null;
            for (var v = 0; v < this._points.size() && (h.filter(this._points, v), !h.isDone()); v++) ;
            h.isGeometryChanged() && this.geometryChanged();
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
      }(ft), kr = g(function u() {
        f(this, u);
      }), xs = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "computeEnvelopeInternal", value: function() {
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
        function u() {
          f(this, u);
        }
        return g(u, null, [{ key: "ofRing", value: function() {
          if (arguments[0] instanceof Array) {
            var t = arguments[0];
            return Math.abs(u.ofRingSigned(t));
          }
          if (wt(arguments[0], At)) {
            var e = arguments[0];
            return Math.abs(u.ofRingSigned(e));
          }
        } }, { key: "ofRingSigned", value: function() {
          if (arguments[0] instanceof Array) {
            var t = arguments[0];
            if (t.length < 3) return 0;
            for (var e = 0, s = t[0].x, h = 1; h < t.length - 1; h++) {
              var v = t[h].x - s, m = t[h + 1].y;
              e += v * (t[h - 1].y - m);
            }
            return e / 2;
          }
          if (wt(arguments[0], At)) {
            var E = arguments[0], N = E.size();
            if (N < 3) return 0;
            var R = new U(), D = new U(), q = new U();
            E.getCoordinate(0, D), E.getCoordinate(1, q);
            var Z = D.x;
            q.x -= Z;
            for (var rt = 0, ot = 1; ot < N - 1; ot++) R.y = D.y, D.x = q.x, D.y = q.y, E.getCoordinate(ot + 1, q), q.x -= Z, rt += D.x * (R.y - q.y);
            return rt / 2;
          }
        } }]);
      }(), ei = function() {
        return g(function u() {
          f(this, u);
        }, null, [{ key: "sort", value: function() {
          var u = arguments, t = arguments[0];
          if (arguments.length === 1) t.sort(function(Z, rt) {
            return Z.compareTo(rt);
          });
          else if (arguments.length === 2) t.sort(function(Z, rt) {
            return u[1].compare(Z, rt);
          });
          else if (arguments.length === 3) {
            var e = t.slice(arguments[1], arguments[2]);
            e.sort();
            var s = t.slice(0, arguments[1]).concat(e, t.slice(arguments[2], t.length));
            t.splice(0, t.length);
            var h, v = p(s);
            try {
              for (v.s(); !(h = v.n()).done; ) {
                var m = h.value;
                t.push(m);
              }
            } catch (Z) {
              v.e(Z);
            } finally {
              v.f();
            }
          } else if (arguments.length === 4) {
            var E = t.slice(arguments[1], arguments[2]);
            E.sort(function(Z, rt) {
              return u[3].compare(Z, rt);
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
        } }, { key: "asList", value: function(u) {
          var t, e = new mt(), s = p(u);
          try {
            for (s.s(); !(t = s.n()).done; ) {
              var h = t.value;
              e.add(h);
            }
          } catch (v) {
            s.e(v);
          } finally {
            s.f();
          }
          return e;
        } }, { key: "copyOf", value: function(u, t) {
          return u.slice(0, t);
        } }]);
      }(), Wa = g(function u() {
        f(this, u);
      }), Cr = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "computeEnvelopeInternal", value: function() {
          return this._shell.getEnvelopeInternal();
        } }, { key: "getCoordinates", value: function() {
          if (this.isEmpty()) return [];
          for (var e = new Array(this.getNumPoints()).fill(null), s = -1, h = this._shell.getCoordinates(), v = 0; v < h.length; v++) e[++s] = h[v];
          for (var m = 0; m < this._holes.length; m++) for (var E = this._holes[m].getCoordinates(), N = 0; N < E.length; N++) e[++s] = E[N];
          return e;
        } }, { key: "getArea", value: function() {
          var e = 0;
          e += Pr.ofRing(this._shell.getCoordinateSequence());
          for (var s = 0; s < this._holes.length; s++) e -= Pr.ofRing(this._holes[s].getCoordinateSequence());
          return e;
        } }, { key: "copyInternal", value: function() {
          for (var e = this._shell.copy(), s = new Array(this._holes.length).fill(null), h = 0; h < this._holes.length; h++) s[h] = this._holes[h].copy();
          return new t(e, s, this._factory);
        } }, { key: "isRectangle", value: function() {
          if (this.getNumInteriorRing() !== 0 || this._shell === null || this._shell.getNumPoints() !== 5) return !1;
          for (var e = this._shell.getCoordinateSequence(), s = this.getEnvelopeInternal(), h = 0; h < 5; h++) {
            var v = e.getX(h);
            if (v !== s.getMinX() && v !== s.getMaxX()) return !1;
            var m = e.getY(h);
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
            var h = e, v = this._shell, m = h._shell;
            if (!v.equalsExact(m, s) || this._holes.length !== h._holes.length) return !1;
            for (var E = 0; E < this._holes.length; E++) if (!this._holes[E].equalsExact(h._holes[E], s)) return !1;
            return !0;
          }
          return C(t, "equalsExact", this, 1).apply(this, arguments);
        } }, { key: "normalize", value: function() {
          if (arguments.length === 0) {
            this._shell = this.normalized(this._shell, !0);
            for (var e = 0; e < this._holes.length; e++) this._holes[e] = this.normalized(this._holes[e], !1);
            ei.sort(this._holes);
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            if (s.isEmpty()) return null;
            var v = s.getCoordinateSequence(), m = ti.minCoordinateIndex(v, 0, v.size() - 2);
            ti.scroll(v, m, !0), pt.isCCW(v) === h && ti.reverse(v);
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
          var h = e.copy();
          return this.normalize(h, s), h;
        } }, { key: "compareToSameClass", value: function() {
          if (arguments.length === 1) {
            var e = arguments[0], s = this._shell, h = e._shell;
            return s.compareToSameClass(h);
          }
          if (arguments.length === 2) {
            var v = arguments[1], m = arguments[0], E = this._shell, N = m._shell, R = E.compareToSameClass(N, v);
            if (R !== 0) return R;
            for (var D = this.getNumInteriorRing(), q = m.getNumInteriorRing(), Z = 0; Z < D && Z < q; ) {
              var rt = this.getInteriorRingN(Z), ot = m.getInteriorRingN(Z), gt = rt.compareToSameClass(ot, v);
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
            var h = arguments[0];
            if (this._shell.apply(h), !h.isDone()) for (var v = 0; v < this._holes.length && (this._holes[v].apply(h), !h.isDone()); v++) ;
            h.isGeometryChanged() && this.geometryChanged();
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
          var e = arguments[0], s = arguments[1], h = arguments[2];
          if (ft.constructor_.call(this, h), e === null && (e = this.getFactory().createLinearRing()), s === null && (s = []), ft.hasNullElements(s)) throw new X("holes must not contain null elements");
          if (e.isEmpty() && ft.hasNonEmptyElements(s)) throw new X("shell is empty but holes are not");
          this._shell = e, this._holes = s;
        } }]);
      }(ft), Oo = function(u) {
        function t() {
          return f(this, t), l(this, t, arguments);
        }
        return x(t, u), g(t);
      }(za), $a = function(u) {
        function t(e) {
          var s;
          return f(this, t), (s = l(this, t)).array = [], e instanceof nn && s.addAll(e), s;
        }
        return x(t, u), g(t, [{ key: "contains", value: function(e) {
          var s, h = p(this.array);
          try {
            for (h.s(); !(s = h.n()).done; )
              if (s.value.compareTo(e) === 0) return !0;
          } catch (v) {
            h.e(v);
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
          var s, h = p(e);
          try {
            for (h.s(); !(s = h.n()).done; ) {
              var v = s.value;
              this.add(v);
            }
          } catch (m) {
            h.e(m);
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
          return new Go(this.array);
        } }]);
      }(Oo), Go = function() {
        return g(function u(t) {
          f(this, u), this.array = t, this.position = 0;
        }, [{ key: "next", value: function() {
          if (this.position === this.array.length) throw new Se();
          return this.array[this.position++];
        } }, { key: "hasNext", value: function() {
          return this.position < this.array.length;
        } }, { key: "remove", value: function() {
          throw new qe();
        } }]);
      }(), Ce = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "computeEnvelopeInternal", value: function() {
          for (var e = new Ht(), s = 0; s < this._geometries.length; s++) e.expandToInclude(this._geometries[s].getEnvelopeInternal());
          return e;
        } }, { key: "getGeometryN", value: function(e) {
          return this._geometries[e];
        } }, { key: "getCoordinates", value: function() {
          for (var e = new Array(this.getNumPoints()).fill(null), s = -1, h = 0; h < this._geometries.length; h++) for (var v = this._geometries[h].getCoordinates(), m = 0; m < v.length; m++) e[++s] = v[m];
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
            var h = e;
            if (this._geometries.length !== h._geometries.length) return !1;
            for (var v = 0; v < this._geometries.length; v++) if (!this._geometries[v].equalsExact(h._geometries[v], s)) return !1;
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
          for (var e = this._geometries.length, s = new mt(e), h = 0; h < e; h++) s.add(this._geometries[h].reverse());
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
            var e = arguments[0], s = new $a(ei.asList(this._geometries)), h = new $a(ei.asList(e._geometries));
            return this.compare(s, h);
          }
          if (arguments.length === 2) {
            for (var v = arguments[1], m = arguments[0], E = this.getNumGeometries(), N = m.getNumGeometries(), R = 0; R < E && R < N; ) {
              var D = this.getGeometryN(R), q = m.getGeometryN(R), Z = D.compareToSameClass(q, v);
              if (Z !== 0) return Z;
              R++;
            }
            return R < E ? 1 : R < N ? -1 : 0;
          }
        } }, { key: "apply", value: function() {
          if (wt(arguments[0], Sr)) for (var e = arguments[0], s = 0; s < this._geometries.length; s++) this._geometries[s].apply(e);
          else if (wt(arguments[0], Nr)) {
            var h = arguments[0];
            if (this._geometries.length === 0) return null;
            for (var v = 0; v < this._geometries.length && (this._geometries[v].apply(h), !h.isDone()); v++) ;
            h.isGeometryChanged() && this.geometryChanged();
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
      }(ft), Ms = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "copyInternal", value: function() {
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
          Ce.constructor_.call(this, e, s);
        } }]);
      }(Ce), Ii = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "copyInternal", value: function() {
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
      var ni = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "setOrdinate", value: function(e, s) {
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
            var h = arguments[0], v = arguments[1];
            U.constructor_.call(this, h, v, U.NULL_ORDINATE);
          }
        } }]);
      }(U);
      ni.X = 0, ni.Y = 1, ni.Z = -1, ni.M = -1;
      var ii = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "getM", value: function() {
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
            var h = arguments[0], v = arguments[1], m = arguments[2];
            U.constructor_.call(this, h, v, U.NULL_ORDINATE), this._m = m;
          }
        } }]);
      }(U);
      ii.X = 0, ii.Y = 1, ii.Z = -1, ii.M = 2;
      var ws = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "getM", value: function() {
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
            var h = arguments[0], v = arguments[1], m = arguments[2], E = arguments[3];
            U.constructor_.call(this, h, v, m), this._m = E;
          }
        } }]);
      }(U), br = function() {
        function u() {
          f(this, u);
        }
        return g(u, null, [{ key: "measures", value: function(t) {
          return t instanceof ni ? 0 : t instanceof ii || t instanceof ws ? 1 : 0;
        } }, { key: "dimension", value: function(t) {
          return t instanceof ni ? 2 : t instanceof ii ? 3 : t instanceof ws ? 4 : 3;
        } }, { key: "create", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return u.create(t, 0);
          }
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            return e === 2 ? new ni() : e === 3 && s === 0 ? new U() : e === 3 && s === 1 ? new ii() : e === 4 && s === 1 ? new ws() : new U();
          }
        } }]);
      }(), Ji = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "getCoordinate", value: function(e) {
          return this.get(e);
        } }, { key: "addAll", value: function() {
          if (arguments.length === 2 && typeof arguments[1] == "boolean" && wt(arguments[0], nn)) {
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
            if (arguments[0] instanceof U && typeof arguments[1] == "boolean") {
              var v = arguments[0];
              if (!arguments[1] && this.size() >= 1 && this.get(this.size() - 1).equals2D(v)) return null;
              C(t, "add", this, 1).call(this, v);
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
              var Z = arguments[0], rt = arguments[1];
              if (!arguments[2]) {
                var ot = this.size();
                if (ot > 0 && (Z > 0 && this.get(Z - 1).equals2D(rt) || Z < ot && this.get(Z).equals2D(rt)))
                  return null;
              }
              C(t, "add", this, 1).call(this, Z, rt);
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
              var s = arguments[0], h = arguments[1];
              this.ensureCapacity(s.length), this.add(s, h);
            }
          }
        } }]);
      }(mt);
      Ji.coordArrayType = new Array(0).fill(null);
      var re = function() {
        function u() {
          f(this, u);
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
          Ue.arraycopy(t, s, h, 0, t.length - s), Ue.arraycopy(t, 0, h, t.length - s, s), Ue.arraycopy(h, 0, t, 0, t.length);
        } }, { key: "equals", value: function() {
          if (arguments.length === 2) {
            var t = arguments[0], e = arguments[1];
            if (t === e) return !0;
            if (t === null || e === null || t.length !== e.length) return !1;
            for (var s = 0; s < t.length; s++) if (!t[s].equals(e[s])) return !1;
            return !0;
          }
          if (arguments.length === 3) {
            var h = arguments[0], v = arguments[1], m = arguments[2];
            if (h === v) return !0;
            if (h === null || v === null || h.length !== v.length) return !1;
            for (var E = 0; E < h.length; E++) if (m.compare(h[E], v[E]) !== 0) return !1;
            return !0;
          }
        } }, { key: "intersection", value: function(t, e) {
          for (var s = new Ji(), h = 0; h < t.length; h++) e.intersects(t[h]) && s.add(t[h], !0);
          return s.toCoordinateArray();
        } }, { key: "measures", value: function(t) {
          if (t === null || t.length === 0) return 0;
          var e, s = 0, h = p(t);
          try {
            for (h.s(); !(e = h.n()).done; ) {
              var v = e.value;
              s = Math.max(s, br.measures(v));
            }
          } catch (m) {
            h.e(m);
          } finally {
            h.f();
          }
          return s;
        } }, { key: "hasRepeatedPoints", value: function(t) {
          for (var e = 1; e < t.length; e++) if (t[e - 1].equals(t[e])) return !0;
          return !1;
        } }, { key: "removeRepeatedPoints", value: function(t) {
          return u.hasRepeatedPoints(t) ? new Ji(t, !1).toCoordinateArray() : t;
        } }, { key: "reverse", value: function(t) {
          for (var e = t.length - 1, s = Math.trunc(e / 2), h = 0; h <= s; h++) {
            var v = t[h];
            t[h] = t[e - h], t[e - h] = v;
          }
        } }, { key: "removeNull", value: function(t) {
          for (var e = 0, s = 0; s < t.length; s++) t[s] !== null && e++;
          var h = new Array(e).fill(null);
          if (e === 0) return h;
          for (var v = 0, m = 0; m < t.length; m++) t[m] !== null && (h[v++] = t[m]);
          return h;
        } }, { key: "copyDeep", value: function() {
          if (arguments.length === 1) {
            for (var t = arguments[0], e = new Array(t.length).fill(null), s = 0; s < t.length; s++) e[s] = t[s].copy();
            return e;
          }
          if (arguments.length === 5) for (var h = arguments[0], v = arguments[1], m = arguments[2], E = arguments[3], N = arguments[4], R = 0; R < N; R++) m[E + R] = h[v + R].copy();
        } }, { key: "isEqualReversed", value: function(t, e) {
          for (var s = 0; s < t.length; s++) {
            var h = t[s], v = e[t.length - s - 1];
            if (h.compareTo(v) !== 0) return !1;
          }
          return !0;
        } }, { key: "envelope", value: function(t) {
          for (var e = new Ht(), s = 0; s < t.length; s++) e.expandToInclude(t[s]);
          return e;
        } }, { key: "toCoordinateArray", value: function(t) {
          return t.toArray(u.coordArrayType);
        } }, { key: "dimension", value: function(t) {
          if (t === null || t.length === 0) return 3;
          var e, s = 0, h = p(t);
          try {
            for (h.s(); !(e = h.n()).done; ) {
              var v = e.value;
              s = Math.max(s, br.dimension(v));
            }
          } catch (m) {
            h.e(m);
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
          e = Zi.clamp(e, 0, t.length);
          var h = (s = Zi.clamp(s, -1, t.length)) - e + 1;
          s < 0 && (h = 0), e >= t.length && (h = 0), s < e && (h = 0);
          var v = new Array(h).fill(null);
          if (h === 0) return v;
          for (var m = 0, E = e; E <= s; E++) v[m++] = t[E];
          return v;
        } }]);
      }(), Rr = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "compare", value: function(u, t) {
          var e = u, s = t;
          return re.compare(e, s);
        } }, { key: "interfaces_", get: function() {
          return [Zt];
        } }]);
      }(), Do = function() {
        return g(function u() {
          f(this, u);
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
          for (var h = re.increasingDirection(e), v = re.increasingDirection(s), m = h > 0 ? 0 : e.length - 1, E = v > 0 ? 0 : e.length - 1, N = 0; N < e.length; N++) {
            var R = e[m].compareTo(s[E]);
            if (R !== 0) return R;
            m += h, E += v;
          }
          return 0;
        } }, { key: "interfaces_", get: function() {
          return [Zt];
        } }]);
      }();
      re.ForwardComparator = Rr, re.BidirectionalComparator = Do, re.coordArrayType = new Array(0).fill(null);
      var ri = function() {
        return g(function u(t) {
          f(this, u), this.str = t;
        }, [{ key: "append", value: function(u) {
          this.str += u;
        } }, { key: "setCharAt", value: function(u, t) {
          this.str = this.str.substr(0, u) + t + this.str.substr(u + 1);
        } }, { key: "toString", value: function() {
          return this.str;
        } }]);
      }(), Qi = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
          return new u(t, this._dimension, this._measures);
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
          return [At, j];
        } }], [{ key: "constructor_", value: function() {
          if (this._dimension = 3, this._measures = 0, this._coordinates = null, arguments.length === 1) {
            if (arguments[0] instanceof Array) {
              var t = arguments[0];
              u.constructor_.call(this, t, re.dimension(t), re.measures(t));
            } else if (Number.isInteger(arguments[0])) {
              var e = arguments[0];
              this._coordinates = new Array(e).fill(null);
              for (var s = 0; s < e; s++) this._coordinates[s] = new U();
            } else if (wt(arguments[0], At)) {
              var h = arguments[0];
              if (h === null) return this._coordinates = new Array(0).fill(null), null;
              this._dimension = h.getDimension(), this._measures = h.getMeasures(), this._coordinates = new Array(h.size()).fill(null);
              for (var v = 0; v < this._coordinates.length; v++) this._coordinates[v] = h.getCoordinateCopy(v);
            }
          } else if (arguments.length === 2) {
            if (arguments[0] instanceof Array && Number.isInteger(arguments[1])) {
              var m = arguments[0], E = arguments[1];
              u.constructor_.call(this, m, E, re.measures(m));
            } else if (Number.isInteger(arguments[0]) && Number.isInteger(arguments[1])) {
              var N = arguments[0], R = arguments[1];
              this._coordinates = new Array(N).fill(null), this._dimension = R;
              for (var D = 0; D < N; D++) this._coordinates[D] = br.create(R);
            }
          } else if (arguments.length === 3) {
            if (Number.isInteger(arguments[2]) && arguments[0] instanceof Array && Number.isInteger(arguments[1])) {
              var q = arguments[0], Z = arguments[1], rt = arguments[2];
              this._dimension = Z, this._measures = rt, this._coordinates = q === null ? new Array(0).fill(null) : q;
            } else if (Number.isInteger(arguments[2]) && Number.isInteger(arguments[0]) && Number.isInteger(arguments[1])) {
              var ot = arguments[0], gt = arguments[1], bt = arguments[2];
              this._coordinates = new Array(ot).fill(null), this._dimension = gt, this._measures = bt;
              for (var lt = 0; lt < ot; lt++) this._coordinates[lt] = this.createCoordinate();
            }
          }
        } }]);
      }(), Ss = function() {
        function u() {
          f(this, u);
        }
        return g(u, [{ key: "readResolve", value: function() {
          return u.instance();
        } }, { key: "create", value: function() {
          if (arguments.length === 1) {
            if (arguments[0] instanceof Array) return new Qi(arguments[0]);
            if (wt(arguments[0], At)) return new Qi(arguments[0]);
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
          return u.instanceObject;
        } }]);
      }();
      Ss.instanceObject = new Ss();
      var Is = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "copyInternal", value: function() {
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
          for (var e = new mt(), s = 0; s < this._geometries.length; s++) for (var h = this._geometries[s].getBoundary(), v = 0; v < h.getNumGeometries(); v++) e.add(h.getGeometryN(v));
          var m = new Array(e.size()).fill(null);
          return this.getFactory().createMultiLineString(e.toArray(m));
        } }, { key: "getGeometryType", value: function() {
          return ft.TYPENAME_MULTIPOLYGON;
        } }, { key: "interfaces_", get: function() {
          return [Wa];
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0], s = arguments[1];
          Ce.constructor_.call(this, e, s);
        } }]);
      }(Ce), Ns = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "get", value: function() {
        } }, { key: "put", value: function() {
        } }, { key: "size", value: function() {
        } }, { key: "values", value: function() {
        } }, { key: "entrySet", value: function() {
        } }]);
      }(), Ha = function(u) {
        function t() {
          var e;
          return f(this, t), (e = l(this, t)).map = /* @__PURE__ */ new Map(), e;
        }
        return x(t, u), g(t, [{ key: "get", value: function(e) {
          return this.map.get(e) || null;
        } }, { key: "put", value: function(e, s) {
          return this.map.set(e, s), s;
        } }, { key: "values", value: function() {
          for (var e = new mt(), s = this.map.values(), h = s.next(); !h.done; ) e.add(h.value), h = s.next();
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
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "equals", value: function(t) {
          if (!(t instanceof u)) return !1;
          var e = t;
          return this._modelType === e._modelType && this._scale === e._scale;
        } }, { key: "compareTo", value: function(t) {
          var e = t, s = this.getMaximumSignificantDigits(), h = e.getMaximumSignificantDigits();
          return wr.compare(s, h);
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
          if (arguments[0] instanceof U) {
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
          return [j, K];
        } }], [{ key: "constructor_", value: function() {
          if (this._modelType = null, this._scale = null, arguments.length === 0) this._modelType = u.FLOATING;
          else if (arguments.length === 1) {
            if (arguments[0] instanceof Ni) {
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
      }(), Ni = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "readResolve", value: function() {
          return u.nameToTypeMap.get(this._name);
        } }, { key: "toString", value: function() {
          return this._name;
        } }, { key: "interfaces_", get: function() {
          return [j];
        } }], [{ key: "constructor_", value: function() {
          this._name = null;
          var t = arguments[0];
          this._name = t, u.nameToTypeMap.put(t, this);
        } }]);
      }();
      Ni.nameToTypeMap = new Ha(), ze.Type = Ni, ze.FIXED = new Ni("FIXED"), ze.FLOATING = new Ni("FLOATING"), ze.FLOATING_SINGLE = new Ni("FLOATING SINGLE"), ze.maximumPreciseValue = 9007199254740992;
      var ks = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "copyInternal", value: function() {
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
          Ce.constructor_.call(this, e, s);
        } }]);
      }(Ce), ki = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
            if (wt(arguments[0], At)) return new Ki(arguments[0], this);
          }
        } }, { key: "createMultiLineString", value: function() {
          return arguments.length === 0 ? new ks(null, this) : arguments.length === 1 ? new ks(arguments[0], this) : void 0;
        } }, { key: "buildGeometry", value: function(t) {
          for (var e = null, s = !1, h = !1, v = t.iterator(); v.hasNext(); ) {
            var m = v.next(), E = m.getTypeCode();
            e === null && (e = E), E !== e && (s = !0), m instanceof Ce && (h = !0);
          }
          if (e === null) return this.createGeometryCollection();
          if (s || h) return this.createGeometryCollection(u.toGeometryArray(t));
          var N = t.iterator().next();
          if (t.size() > 1) {
            if (N instanceof Cr) return this.createMultiPolygon(u.toPolygonArray(t));
            if (N instanceof Ki) return this.createMultiLineString(u.toLineStringArray(t));
            if (N instanceof xs) return this.createMultiPoint(u.toPointArray(t));
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
            if (wt(arguments[0], At)) return new xs(arguments[0], this);
          }
        } }, { key: "getCoordinateSequenceFactory", value: function() {
          return this._coordinateSequenceFactory;
        } }, { key: "createPolygon", value: function() {
          if (arguments.length === 0) return this.createPolygon(null, null);
          if (arguments.length === 1) {
            if (wt(arguments[0], At)) {
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
            if (wt(arguments[0], At)) return new Ii(arguments[0], this);
          }
        } }, { key: "createMultiPolygon", value: function() {
          return arguments.length === 0 ? new Is(null, this) : arguments.length === 1 ? new Is(arguments[0], this) : void 0;
        } }, { key: "createMultiPoint", value: function() {
          if (arguments.length === 0) return new Ms(null, this);
          if (arguments.length === 1) {
            if (arguments[0] instanceof Array) return new Ms(arguments[0], this);
            if (wt(arguments[0], At)) {
              var t = arguments[0];
              if (t === null) return this.createMultiPoint(new Array(0).fill(null));
              for (var e = new Array(t.size()).fill(null), s = 0; s < t.size(); s++) {
                var h = this.getCoordinateSequenceFactory().create(1, t.getDimension(), t.getMeasures());
                ti.copy(t, s, h, 0, 1), e[s] = this.createPoint(h);
              }
              return this.createMultiPoint(e);
            }
          }
        } }, { key: "interfaces_", get: function() {
          return [j];
        } }], [{ key: "constructor_", value: function() {
          if (this._precisionModel = null, this._coordinateSequenceFactory = null, this._SRID = null, arguments.length === 0) u.constructor_.call(this, new ze(), 0);
          else if (arguments.length === 1) {
            if (wt(arguments[0], Es)) {
              var t = arguments[0];
              u.constructor_.call(this, new ze(), 0, t);
            } else if (arguments[0] instanceof ze) {
              var e = arguments[0];
              u.constructor_.call(this, e, 0, u.getDefaultCoordinateSequenceFactory());
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            u.constructor_.call(this, s, h, u.getDefaultCoordinateSequenceFactory());
          } else if (arguments.length === 3) {
            var v = arguments[0], m = arguments[1], E = arguments[2];
            this._precisionModel = v, this._coordinateSequenceFactory = E, this._SRID = m;
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
      }(), Ps = "XY", Va = "XYZ", Za = "XYM", Ka = "XYZM", Ar = { POINT: "Point", LINE_STRING: "LineString", LINEAR_RING: "LinearRing", POLYGON: "Polygon", MULTI_POINT: "MultiPoint", MULTI_LINE_STRING: "MultiLineString", MULTI_POLYGON: "MultiPolygon", GEOMETRY_COLLECTION: "GeometryCollection", CIRCLE: "Circle" }, Ja = "EMPTY", ji = 1, Ye = 2, Cn = 3, Qa = 4, si = 5, ja = 6;
      for (var Cs in Ar) Ar[Cs].toUpperCase();
      var Fo = function() {
        return g(function u(t) {
          f(this, u), this.wkt = t, this.index_ = -1;
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
          if (t == "(") u = Ye;
          else if (t == ",") u = si;
          else if (t == ")") u = Cn;
          else if (this.isNumeric_(t) || t == "-") u = Qa, s = this.readNumber_();
          else if (this.isAlpha_(t)) u = ji, s = this.readText_();
          else {
            if (this.isWhiteSpace_(t)) return this.nextToken();
            if (t !== "") throw new Error("Unexpected character: " + t);
            u = ja;
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
      }(), tu = function() {
        return g(function u(t, e) {
          f(this, u), this.lexer_ = t, this.token_, this.layout_ = Ps, this.factory = e;
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
          var u = Ps, t = this.token_;
          if (this.isTokenType(ji)) {
            var e = t.value;
            e === "Z" ? u = Va : e === "M" ? u = Za : e === "ZM" && (u = Ka), u !== Ps && this.consume_();
          }
          return u;
        } }, { key: "parseGeometryCollectionText_", value: function() {
          if (this.match(Ye)) {
            var u = [];
            do
              u.push(this.parseGeometry_());
            while (this.match(si));
            if (this.match(Cn)) return u;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parsePointText_", value: function() {
          if (this.match(Ye)) {
            var u = this.parsePoint_();
            if (this.match(Cn)) return u;
          } else if (this.isEmptyGeometry_()) return null;
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parseLineStringText_", value: function() {
          if (this.match(Ye)) {
            var u = this.parsePointList_();
            if (this.match(Cn)) return u;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parsePolygonText_", value: function() {
          if (this.match(Ye)) {
            var u = this.parseLineStringTextList_();
            if (this.match(Cn)) return u;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parseMultiPointText_", value: function() {
          var u;
          if (this.match(Ye)) {
            if (u = this.token_.type == Ye ? this.parsePointTextList_() : this.parsePointList_(), this.match(Cn)) return u;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parseMultiLineStringText_", value: function() {
          if (this.match(Ye)) {
            var u = this.parseLineStringTextList_();
            if (this.match(Cn)) return u;
          } else if (this.isEmptyGeometry_()) return [];
          throw new Error(this.formatErrorMessage_());
        } }, { key: "parseMultiPolygonText_", value: function() {
          if (this.match(Ye)) {
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
          for (var u = [this.parsePoint_()]; this.match(si); ) u.push(this.parsePoint_());
          return u;
        } }, { key: "parsePointTextList_", value: function() {
          for (var u = [this.parsePointText_()]; this.match(si); ) u.push(this.parsePointText_());
          return u;
        } }, { key: "parseLineStringTextList_", value: function() {
          for (var u = [this.parseLineStringText_()]; this.match(si); ) u.push(this.parseLineStringText_());
          return u;
        } }, { key: "parsePolygonTextList_", value: function() {
          for (var u = [this.parsePolygonText_()]; this.match(si); ) u.push(this.parsePolygonText_());
          return u;
        } }, { key: "isEmptyGeometry_", value: function() {
          var u = this.isTokenType(ji) && this.token_.value == Ja;
          return u && this.consume_(), u;
        } }, { key: "formatErrorMessage_", value: function() {
          return "Unexpected `" + this.token_.value + "` at position " + this.token_.position + " in `" + this.lexer_.wkt + "`";
        } }, { key: "parseGeometry_", value: function() {
          var u = this.factory, t = function(gt) {
            return _(U, G(gt));
          }, e = function(gt) {
            var bt = gt.map(function(lt) {
              return u.createLinearRing(lt.map(t));
            });
            return bt.length > 1 ? u.createPolygon(bt[0], bt.slice(1)) : u.createPolygon(bt[0]);
          }, s = this.token_;
          if (this.match(ji)) {
            var h = s.value;
            if (this.layout_ = this.parseGeometryLayout_(), h == "GEOMETRYCOLLECTION") {
              var v = this.parseGeometryCollectionText_();
              return u.createGeometryCollection(v);
            }
            switch (h) {
              case "POINT":
                var m = this.parsePointText_();
                return m ? u.createPoint(_(U, G(m))) : u.createPoint();
              case "LINESTRING":
                var E = this.parseLineStringText_().map(t);
                return u.createLineString(E);
              case "LINEARRING":
                var N = this.parseLineStringText_().map(t);
                return u.createLinearRing(N);
              case "POLYGON":
                var R = this.parsePolygonText_();
                return R && R.length !== 0 ? e(R) : u.createPolygon();
              case "MULTIPOINT":
                var D = this.parseMultiPointText_();
                if (!D || D.length === 0) return u.createMultiPoint();
                var q = D.map(t).map(function(gt) {
                  return u.createPoint(gt);
                });
                return u.createMultiPoint(q);
              case "MULTILINESTRING":
                var Z = this.parseMultiLineStringText_().map(function(gt) {
                  return u.createLineString(gt.map(t));
                });
                return u.createMultiLineString(Z);
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
      function Tr(u) {
        if (u.isEmpty()) return "";
        var t = u.getCoordinate(), e = [t.x, t.y];
        return t.z === void 0 || Number.isNaN(t.z) || e.push(t.z), t.m === void 0 || Number.isNaN(t.m) || e.push(t.m), e.join(" ");
      }
      function ai(u) {
        for (var t = u.getCoordinates().map(function(v) {
          var m = [v.x, v.y];
          return v.z === void 0 || Number.isNaN(v.z) || m.push(v.z), v.m === void 0 || Number.isNaN(v.m) || m.push(v.m), m;
        }), e = [], s = 0, h = t.length; s < h; ++s) e.push(t[s].join(" "));
        return e.join(", ");
      }
      function ui(u) {
        var t = [];
        t.push("(" + ai(u.getExteriorRing()) + ")");
        for (var e = 0, s = u.getNumInteriorRing(); e < s; ++e) t.push("(" + ai(u.getInteriorRingN(e)) + ")");
        return t.join(", ");
      }
      var eu = { Point: Tr, LineString: ai, LinearRing: ai, Polygon: ui, MultiPoint: function(u) {
        for (var t = [], e = 0, s = u.getNumGeometries(); e < s; ++e) t.push("(" + Tr(u.getGeometryN(e)) + ")");
        return t.join(", ");
      }, MultiLineString: function(u) {
        for (var t = [], e = 0, s = u.getNumGeometries(); e < s; ++e) t.push("(" + ai(u.getGeometryN(e)) + ")");
        return t.join(", ");
      }, MultiPolygon: function(u) {
        for (var t = [], e = 0, s = u.getNumGeometries(); e < s; ++e) t.push("(" + ui(u.getGeometryN(e)) + ")");
        return t.join(", ");
      }, GeometryCollection: function(u) {
        for (var t = [], e = 0, s = u.getNumGeometries(); e < s; ++e) t.push(bs(u.getGeometryN(e)));
        return t.join(", ");
      } };
      function bs(u) {
        var t = u.getGeometryType(), e = eu[t];
        t = t.toUpperCase();
        var s = function(h) {
          var v = "";
          if (h.isEmpty()) return v;
          var m = h.getCoordinate();
          return m.z === void 0 || Number.isNaN(m.z) || (v += "Z"), m.m === void 0 || Number.isNaN(m.m) || (v += "M"), v;
        }(u);
        return s.length > 0 && (t += " " + s), u.isEmpty() ? t + " " + Ja : t + " (" + e(u) + ")";
      }
      var qo = function() {
        return g(function u(t) {
          f(this, u), this.geometryFactory = t || new ki(), this.precisionModel = this.geometryFactory.getPrecisionModel();
        }, [{ key: "read", value: function(u) {
          var t = new Fo(u);
          return new tu(t, this.geometryFactory).parse();
        } }, { key: "write", value: function(u) {
          return bs(u);
        } }]);
      }(), Lr = function() {
        return g(function u(t) {
          f(this, u), this.parser = new qo(t);
        }, [{ key: "write", value: function(u) {
          return this.parser.write(u);
        } }], [{ key: "toLineString", value: function(u, t) {
          if (arguments.length !== 2) throw new Error("Not implemented");
          return "LINESTRING ( " + u.x + " " + u.y + ", " + t.x + " " + t.y + " )";
        } }]);
      }(), Vt = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getIndexAlongSegment", value: function(t, e) {
          return this.computeIntLineIndex(), this._intLineIndex[t][e];
        } }, { key: "getTopologySummary", value: function() {
          var t = new ri();
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
          var h = Math.abs(s.x - e.x), v = Math.abs(s.y - e.y), m = -1;
          if (t.equals(e)) m = 0;
          else if (t.equals(s)) m = h > v ? h : v;
          else {
            var E = Math.abs(t.x - e.x), N = Math.abs(t.y - e.y);
            (m = h > v ? E : N) !== 0 || t.equals(e) || (m = Math.max(E, N));
          }
          return Nt.isTrue(!(m === 0 && !t.equals(e)), "Bad distance calculation"), m;
        } }, { key: "nonRobustComputeEdgeDistance", value: function(t, e, s) {
          var h = t.x - e.x, v = t.y - e.y, m = Math.sqrt(h * h + v * v);
          return Nt.isTrue(!(m === 0 && !t.equals(e)), "Invalid distance calculation"), m;
        } }]);
      }();
      Vt.DONT_INTERSECT = 0, Vt.DO_INTERSECT = 1, Vt.COLLINEAR = 2, Vt.NO_INTERSECTION = 0, Vt.POINT_INTERSECTION = 1, Vt.COLLINEAR_INTERSECTION = 2;
      var qn = function(u) {
        function t() {
          return f(this, t), l(this, t);
        }
        return x(t, u), g(t, [{ key: "isInSegmentEnvelopes", value: function(e) {
          var s = new Ht(this._inputLines[0][0], this._inputLines[0][1]), h = new Ht(this._inputLines[1][0], this._inputLines[1][1]);
          return s.contains(e) && h.contains(e);
        } }, { key: "computeIntersection", value: function() {
          if (arguments.length !== 3) return C(t, "computeIntersection", this, 1).apply(this, arguments);
          var e = arguments[0], s = arguments[1], h = arguments[2];
          if (this._isProper = !1, Ht.intersects(s, h, e) && pt.index(s, h, e) === 0 && pt.index(h, s, e) === 0) return this._isProper = !0, (e.equals(s) || e.equals(h)) && (this._isProper = !1), this._result = Vt.POINT_INTERSECTION, null;
          this._result = Vt.NO_INTERSECTION;
        } }, { key: "intersection", value: function(e, s, h, v) {
          var m = this.intersectionSafe(e, s, h, v);
          return this.isInSegmentEnvelopes(m) || (m = new U(t.nearestEndpoint(e, s, h, v))), this._precisionModel !== null && this._precisionModel.makePrecise(m), m;
        } }, { key: "checkDD", value: function(e, s, h, v, m) {
          var E = Vi.intersection(e, s, h, v), N = this.isInSegmentEnvelopes(E);
          Ue.out.println("DD in env = " + N + "  --------------------- " + E), m.distance(E) > 1e-4 && Ue.out.println("Distance = " + m.distance(E));
        } }, { key: "intersectionSafe", value: function(e, s, h, v) {
          var m = ps.intersection(e, s, h, v);
          return m === null && (m = t.nearestEndpoint(e, s, h, v)), m;
        } }, { key: "computeCollinearIntersection", value: function(e, s, h, v) {
          var m = Ht.intersects(e, s, h), E = Ht.intersects(e, s, v), N = Ht.intersects(h, v, e), R = Ht.intersects(h, v, s);
          return m && E ? (this._intPt[0] = h, this._intPt[1] = v, Vt.COLLINEAR_INTERSECTION) : N && R ? (this._intPt[0] = e, this._intPt[1] = s, Vt.COLLINEAR_INTERSECTION) : m && N ? (this._intPt[0] = h, this._intPt[1] = e, !h.equals(e) || E || R ? Vt.COLLINEAR_INTERSECTION : Vt.POINT_INTERSECTION) : m && R ? (this._intPt[0] = h, this._intPt[1] = s, !h.equals(s) || E || N ? Vt.COLLINEAR_INTERSECTION : Vt.POINT_INTERSECTION) : E && N ? (this._intPt[0] = v, this._intPt[1] = e, !v.equals(e) || m || R ? Vt.COLLINEAR_INTERSECTION : Vt.POINT_INTERSECTION) : E && R ? (this._intPt[0] = v, this._intPt[1] = s, !v.equals(s) || m || N ? Vt.COLLINEAR_INTERSECTION : Vt.POINT_INTERSECTION) : Vt.NO_INTERSECTION;
        } }, { key: "computeIntersect", value: function(e, s, h, v) {
          if (this._isProper = !1, !Ht.intersects(e, s, h, v)) return Vt.NO_INTERSECTION;
          var m = pt.index(e, s, h), E = pt.index(e, s, v);
          if (m > 0 && E > 0 || m < 0 && E < 0) return Vt.NO_INTERSECTION;
          var N = pt.index(h, v, e), R = pt.index(h, v, s);
          return N > 0 && R > 0 || N < 0 && R < 0 ? Vt.NO_INTERSECTION : m === 0 && E === 0 && N === 0 && R === 0 ? this.computeCollinearIntersection(e, s, h, v) : (m === 0 || E === 0 || N === 0 || R === 0 ? (this._isProper = !1, e.equals2D(h) || e.equals2D(v) ? this._intPt[0] = e : s.equals2D(h) || s.equals2D(v) ? this._intPt[0] = s : m === 0 ? this._intPt[0] = new U(h) : E === 0 ? this._intPt[0] = new U(v) : N === 0 ? this._intPt[0] = new U(e) : R === 0 && (this._intPt[0] = new U(s))) : (this._isProper = !0, this._intPt[0] = this.intersection(e, s, h, v)), Vt.POINT_INTERSECTION);
        } }], [{ key: "nearestEndpoint", value: function(e, s, h, v) {
          var m = e, E = un.pointToSegment(e, h, v), N = un.pointToSegment(s, h, v);
          return N < E && (E = N, m = s), (N = un.pointToSegment(h, e, s)) < E && (E = N, m = h), (N = un.pointToSegment(v, e, s)) < E && (E = N, m = v), m;
        } }]);
      }(Vt), nu = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "countSegment", value: function(t, e) {
          if (t.x < this._p.x && e.x < this._p.x) return null;
          if (this._p.x === e.x && this._p.y === e.y) return this._isPointOnSegment = !0, null;
          if (t.y === this._p.y && e.y === this._p.y) {
            var s = t.x, h = e.x;
            return s > h && (s = e.x, h = t.x), this._p.x >= s && this._p.x <= h && (this._isPointOnSegment = !0), null;
          }
          if (t.y > this._p.y && e.y <= this._p.y || e.y > this._p.y && t.y <= this._p.y) {
            var v = pt.index(t, e, this._p);
            if (v === pt.COLLINEAR) return this._isPointOnSegment = !0, null;
            e.y < t.y && (v = -v), v === pt.LEFT && this._crossingCount++;
          }
        } }, { key: "isPointInPolygon", value: function() {
          return this.getLocation() !== T.EXTERIOR;
        } }, { key: "getLocation", value: function() {
          return this._isPointOnSegment ? T.BOUNDARY : this._crossingCount % 2 == 1 ? T.INTERIOR : T.EXTERIOR;
        } }, { key: "isOnSegment", value: function() {
          return this._isPointOnSegment;
        } }], [{ key: "constructor_", value: function() {
          this._p = null, this._crossingCount = 0, this._isPointOnSegment = !1;
          var t = arguments[0];
          this._p = t;
        } }, { key: "locatePointInRing", value: function() {
          if (arguments[0] instanceof U && wt(arguments[1], At)) {
            for (var t = arguments[1], e = new u(arguments[0]), s = new U(), h = new U(), v = 1; v < t.size(); v++) if (t.getCoordinate(v, s), t.getCoordinate(v - 1, h), e.countSegment(s, h), e.isOnSegment()) return e.getLocation();
            return e.getLocation();
          }
          if (arguments[0] instanceof U && arguments[1] instanceof Array) {
            for (var m = arguments[1], E = new u(arguments[0]), N = 1; N < m.length; N++) {
              var R = m[N], D = m[N - 1];
              if (E.countSegment(R, D), E.isOnSegment()) return E.getLocation();
            }
            return E.getLocation();
          }
        } }]);
      }(), Rs = function() {
        function u() {
          f(this, u);
        }
        return g(u, null, [{ key: "isOnLine", value: function() {
          if (arguments[0] instanceof U && wt(arguments[1], At)) {
            for (var t = arguments[0], e = arguments[1], s = new qn(), h = new U(), v = new U(), m = e.size(), E = 1; E < m; E++) if (e.getCoordinate(E - 1, h), e.getCoordinate(E, v), s.computeIntersection(t, h, v), s.hasIntersection()) return !0;
            return !1;
          }
          if (arguments[0] instanceof U && arguments[1] instanceof Array) {
            for (var N = arguments[0], R = arguments[1], D = new qn(), q = 1; q < R.length; q++) {
              var Z = R[q - 1], rt = R[q];
              if (D.computeIntersection(N, Z, rt), D.hasIntersection()) return !0;
            }
            return !1;
          }
        } }, { key: "locateInRing", value: function(t, e) {
          return nu.locatePointInRing(t, e);
        } }, { key: "isInRing", value: function(t, e) {
          return u.locateInRing(t, e) !== T.EXTERIOR;
        } }]);
      }(), Xe = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "setAllLocations", value: function(t) {
          for (var e = 0; e < this.location.length; e++) this.location[e] = t;
        } }, { key: "isNull", value: function() {
          for (var t = 0; t < this.location.length; t++) if (this.location[t] !== T.NONE) return !1;
          return !0;
        } }, { key: "setAllLocationsIfNull", value: function(t) {
          for (var e = 0; e < this.location.length; e++) this.location[e] === T.NONE && (this.location[e] = t);
        } }, { key: "isLine", value: function() {
          return this.location.length === 1;
        } }, { key: "merge", value: function(t) {
          if (t.location.length > this.location.length) {
            var e = new Array(3).fill(null);
            e[tt.ON] = this.location[tt.ON], e[tt.LEFT] = T.NONE, e[tt.RIGHT] = T.NONE, this.location = e;
          }
          for (var s = 0; s < this.location.length; s++) this.location[s] === T.NONE && s < t.location.length && (this.location[s] = t.location[s]);
        } }, { key: "getLocations", value: function() {
          return this.location;
        } }, { key: "flip", value: function() {
          if (this.location.length <= 1) return null;
          var t = this.location[tt.LEFT];
          this.location[tt.LEFT] = this.location[tt.RIGHT], this.location[tt.RIGHT] = t;
        } }, { key: "toString", value: function() {
          var t = new Pn();
          return this.location.length > 1 && t.append(T.toLocationSymbol(this.location[tt.LEFT])), t.append(T.toLocationSymbol(this.location[tt.ON])), this.location.length > 1 && t.append(T.toLocationSymbol(this.location[tt.RIGHT])), t.toString();
        } }, { key: "setLocations", value: function(t, e, s) {
          this.location[tt.ON] = t, this.location[tt.LEFT] = e, this.location[tt.RIGHT] = s;
        } }, { key: "get", value: function(t) {
          return t < this.location.length ? this.location[t] : T.NONE;
        } }, { key: "isArea", value: function() {
          return this.location.length > 1;
        } }, { key: "isAnyNull", value: function() {
          for (var t = 0; t < this.location.length; t++) if (this.location[t] === T.NONE) return !0;
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
          this.location = new Array(t).fill(null), this.setAllLocations(T.NONE);
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
            var v = arguments[0], m = arguments[1], E = arguments[2];
            this.init(3), this.location[tt.ON] = v, this.location[tt.LEFT] = m, this.location[tt.RIGHT] = E;
          }
        } }]);
      }(), We = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
          var t = new Pn();
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
            var s = arguments[0], h = arguments[1], v = arguments[2];
            this.elt[s].setLocation(h, v);
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
            } else if (arguments[0] instanceof u) {
              var e = arguments[0];
              this.elt[0] = new Xe(e.elt[0]), this.elt[1] = new Xe(e.elt[1]);
            }
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            this.elt[0] = new Xe(T.NONE), this.elt[1] = new Xe(T.NONE), this.elt[s].setLocation(h);
          } else if (arguments.length === 3) {
            var v = arguments[0], m = arguments[1], E = arguments[2];
            this.elt[0] = new Xe(v, m, E), this.elt[1] = new Xe(v, m, E);
          } else if (arguments.length === 4) {
            var N = arguments[0], R = arguments[1], D = arguments[2], q = arguments[3];
            this.elt[0] = new Xe(T.NONE, T.NONE, T.NONE), this.elt[1] = new Xe(T.NONE, T.NONE, T.NONE), this.elt[N].setLocations(R, D, q);
          }
        } }, { key: "toLineLabel", value: function(t) {
          for (var e = new u(T.NONE), s = 0; s < 2; s++) e.setLocation(s, t.getLocation(s));
          return e;
        } }]);
      }(), tr = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "computeRing", value: function() {
          if (this._ring !== null) return null;
          for (var u = new Array(this._pts.size()).fill(null), t = 0; t < this._pts.size(); t++) u[t] = this._pts.get(t);
          this._ring = this._geometryFactory.createLinearRing(u), this._isHole = pt.isCCW(this._ring.getCoordinates());
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
            Nt.isTrue(s.isArea()), this.mergeLabel(s), this.addPoints(t.getEdge(), t.isForward(), e), e = !1, this.setEdgeRing(t, this), t = this.getNext(t);
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
            for (var v = h; v < s.length; v++) this._pts.add(s[v]);
          } else {
            var m = s.length - 2;
            e && (m = s.length - 1);
            for (var E = m; E >= 0; E--) this._pts.add(s[E]);
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
          if (!t.getEnvelopeInternal().contains(u) || !Rs.isInRing(u, t.getCoordinates())) return !1;
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
            if (e === T.NONE) return null;
            if (this._label.getLocation(t) === T.NONE) return this._label.setLocation(t, e), null;
          }
        } }, { key: "setShell", value: function(u) {
          this._shell = u, u !== null && u.addHole(this);
        } }, { key: "toPolygon", value: function(u) {
          for (var t = new Array(this._holes.size()).fill(null), e = 0; e < this._holes.size(); e++) t[e] = this._holes.get(e).getLinearRing();
          return u.createPolygon(this.getLinearRing(), t);
        } }], [{ key: "constructor_", value: function() {
          if (this._startDe = null, this._maxNodeDegree = -1, this._edges = new mt(), this._pts = new mt(), this._label = new We(T.NONE), this._ring = null, this._isHole = null, this._shell = null, this._holes = new mt(), this._geometryFactory = null, arguments.length !== 0) {
            if (arguments.length === 2) {
              var u = arguments[0], t = arguments[1];
              this._geometryFactory = t, this.computePoints(u), this.computeRing();
            }
          }
        } }]);
      }(), Bo = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "setEdgeRing", value: function(e, s) {
          e.setMinEdgeRing(s);
        } }, { key: "getNext", value: function(e) {
          return e.getNextMin();
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0], s = arguments[1];
          tr.constructor_.call(this, e, s);
        } }]);
      }(tr), Uo = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "buildMinimalRings", value: function() {
          var e = new mt(), s = this._startDe;
          do {
            if (s.getMinEdgeRing() === null) {
              var h = new Bo(s, this._geometryFactory);
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
          tr.constructor_.call(this, e, s);
        } }]);
      }(tr), iu = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
          Nt.isTrue(this._label.getGeometryCount() >= 2, "found partial label"), this.computeIM(u);
        } }, { key: "isInResult", value: function() {
          return this._isInResult;
        } }, { key: "isVisited", value: function() {
          return this._isVisited;
        } }], [{ key: "constructor_", value: function() {
          if (this._label = null, this._isInResult = !1, this._isCovered = !1, this._isCoveredSet = !1, this._isVisited = !1, arguments.length !== 0) {
            if (arguments.length === 1) {
              var u = arguments[0];
              this._label = u;
            }
          }
        } }]);
      }(), Or = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "isIncidentEdgeInResult", value: function() {
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
          var h = T.NONE;
          if (h = this._label.getLocation(s), !e.isNull(s)) {
            var v = e.getLocation(s);
            h !== T.BOUNDARY && (h = v);
          }
          return h;
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
          } else if (arguments[0] instanceof We) for (var s = arguments[0], h = 0; h < 2; h++) {
            var v = this.computeMergedLocation(s, h);
            this._label.getLocation(h) === T.NONE && this._label.setLocation(h, v);
          }
        } }, { key: "add", value: function(e) {
          this._edges.insert(e), e.setNode(this);
        } }, { key: "setLabelBoundary", value: function(e) {
          if (this._label === null) return null;
          var s = T.NONE;
          this._label !== null && (s = this._label.getLocation(e));
          var h = null;
          switch (s) {
            case T.BOUNDARY:
              h = T.INTERIOR;
              break;
            case T.INTERIOR:
            default:
              h = T.BOUNDARY;
          }
          this._label.setLocation(e, h);
        } }], [{ key: "constructor_", value: function() {
          this._coord = null, this._edges = null;
          var e = arguments[0], s = arguments[1];
          this._coord = e, this._edges = s, this._label = new We(0, T.NONE);
        } }]);
      }(iu), As = function(u) {
        function t() {
          return f(this, t), l(this, t, arguments);
        }
        return x(t, u), g(t);
      }(Ns);
      function ru(u) {
        return u == null ? 0 : u.color;
      }
      function Ft(u) {
        return u == null ? null : u.parent;
      }
      function dn(u, t) {
        u !== null && (u.color = t);
      }
      function Ts(u) {
        return u == null ? null : u.left;
      }
      function su(u) {
        return u == null ? null : u.right;
      }
      var Bt = function(u) {
        function t() {
          var e;
          return f(this, t), (e = l(this, t)).root_ = null, e.size_ = 0, e;
        }
        return x(t, u), g(t, [{ key: "get", value: function(e) {
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
          var h, v, m = this.root_;
          do
            if (h = m, (v = e.compareTo(m.key)) < 0) m = m.left;
            else {
              if (!(v > 0)) {
                var E = m.value;
                return m.value = s, E;
              }
              m = m.right;
            }
          while (m !== null);
          var N = { key: e, left: null, right: null, value: s, parent: h, color: 0, getValue: function() {
            return this.value;
          }, getKey: function() {
            return this.key;
          } };
          return v < 0 ? h.left = N : h.right = N, this.fixAfterInsertion(N), this.size_++, null;
        } }, { key: "fixAfterInsertion", value: function(e) {
          var s;
          for (e.color = 1; e != null && e !== this.root_ && e.parent.color === 1; ) Ft(e) === Ts(Ft(Ft(e))) ? ru(s = su(Ft(Ft(e)))) === 1 ? (dn(Ft(e), 0), dn(s, 0), dn(Ft(Ft(e)), 1), e = Ft(Ft(e))) : (e === su(Ft(e)) && (e = Ft(e), this.rotateLeft(e)), dn(Ft(e), 0), dn(Ft(Ft(e)), 1), this.rotateRight(Ft(Ft(e)))) : ru(s = Ts(Ft(Ft(e)))) === 1 ? (dn(Ft(e), 0), dn(s, 0), dn(Ft(Ft(e)), 1), e = Ft(Ft(e))) : (e === Ts(Ft(e)) && (e = Ft(e), this.rotateRight(e)), dn(Ft(e), 0), dn(Ft(Ft(e)), 1), this.rotateLeft(Ft(Ft(e))));
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
      }(As), Xt = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "find", value: function(u) {
          return this.nodeMap.get(u);
        } }, { key: "addNode", value: function() {
          if (arguments[0] instanceof U) {
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
          for (var t = new mt(), e = this.iterator(); e.hasNext(); ) {
            var s = e.next();
            s.getLabel().getLocation(u) === T.BOUNDARY && t.add(s);
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
      }(), ye = function() {
        function u() {
          f(this, u);
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
            if (t === 0 && e === 0) throw new X("Cannot compute the quadrant for point ( " + t + ", " + e + " )");
            return t >= 0 ? e >= 0 ? u.NE : u.SE : e >= 0 ? u.NW : u.SW;
          }
          if (arguments[0] instanceof U && arguments[1] instanceof U) {
            var s = arguments[0], h = arguments[1];
            if (h.x === s.x && h.y === s.y) throw new X("Cannot compute the quadrant for two identical points " + s);
            return h.x >= s.x ? h.y >= s.y ? u.NE : u.SE : h.y >= s.y ? u.NW : u.SW;
          }
        } }]);
      }();
      ye.NE = 0, ye.NW = 1, ye.SW = 2, ye.SE = 3;
      var au = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "compareDirection", value: function(t) {
          return this._dx === t._dx && this._dy === t._dy ? 0 : this._quadrant > t._quadrant ? 1 : this._quadrant < t._quadrant ? -1 : pt.index(t._p0, t._p1, this._p1);
        } }, { key: "getDy", value: function() {
          return this._dy;
        } }, { key: "getCoordinate", value: function() {
          return this._p0;
        } }, { key: "setNode", value: function(t) {
          this._node = t;
        } }, { key: "print", value: function(t) {
          var e = Math.atan2(this._dy, this._dx), s = this.getClass().getName(), h = s.lastIndexOf("."), v = s.substring(h + 1);
          t.print("  " + v + ": " + this._p0 + " - " + this._p1 + " " + this._quadrant + ":" + e + "   " + this._label);
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
          this._p0 = t, this._p1 = e, this._dx = e.x - t.x, this._dy = e.y - t.y, this._quadrant = ye.quadrant(this._dx, this._dy), Nt.isTrue(!(this._dx === 0 && this._dy === 0), "EdgeEnd with identical endpoints found");
        } }, { key: "interfaces_", get: function() {
          return [K];
        } }], [{ key: "constructor_", value: function() {
          if (this._edge = null, this._label = null, this._node = null, this._p0 = null, this._p1 = null, this._dx = null, this._dy = null, this._quadrant = null, arguments.length === 1) {
            var t = arguments[0];
            this._edge = t;
          } else if (arguments.length === 3) {
            var e = arguments[0], s = arguments[1], h = arguments[2];
            u.constructor_.call(this, e, s, h, null);
          } else if (arguments.length === 4) {
            var v = arguments[0], m = arguments[1], E = arguments[2], N = arguments[3];
            u.constructor_.call(this, v), this.init(m, E), this._label = N;
          }
        } }]);
      }(), Ls = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "getNextMin", value: function() {
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
          for (var e = !0, s = 0; s < 2; s++) this._label.isArea(s) && this._label.getLocation(s, tt.LEFT) === T.INTERIOR && this._label.getLocation(s, tt.RIGHT) === T.INTERIOR || (e = !1);
          return e;
        } }, { key: "setNextMin", value: function(e) {
          this._nextMin = e;
        } }, { key: "print", value: function(e) {
          C(t, "print", this, 1).call(this, e), e.print(" " + this._depth[tt.LEFT] + "/" + this._depth[tt.RIGHT]), e.print(" (" + this.getDepthDelta() + ")"), this._isInResult && e.print(" inResult");
        } }, { key: "setMinEdgeRing", value: function(e) {
          this._minEdgeRing = e;
        } }, { key: "isLineEdge", value: function() {
          var e = this._label.isLine(0) || this._label.isLine(1), s = !this._label.isArea(0) || this._label.allPositionsEqual(0, T.EXTERIOR), h = !this._label.isArea(1) || this._label.allPositionsEqual(1, T.EXTERIOR);
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
          var v = 1;
          e === tt.LEFT && (v = -1);
          var m = tt.opposite(e), E = s + h * v;
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
          if (au.constructor_.call(this, e), this._isForward = s, s) this.init(e.getCoordinate(0), e.getCoordinate(1));
          else {
            var h = e.getNumPoints() - 1;
            this.init(e.getCoordinate(h), e.getCoordinate(h - 1));
          }
          this.computeDirectedLabel();
        } }, { key: "depthFactor", value: function(e, s) {
          return e === T.EXTERIOR && s === T.INTERIOR ? 1 : e === T.INTERIOR && s === T.EXTERIOR ? -1 : 0;
        } }]);
      }(au), uu = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "createNode", value: function(u) {
          return new Or(u, null);
        } }]);
      }(), ou = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
          if (arguments[0] instanceof U) {
            var t = arguments[0];
            return this._nodes.addNode(t);
          }
        } }, { key: "getNodeIterator", value: function() {
          return this._nodes.iterator();
        } }, { key: "linkResultDirectedEdges", value: function() {
          for (var u = this._nodes.iterator(); u.hasNext(); )
            u.next().getEdges().linkResultDirectedEdges();
        } }, { key: "debugPrintln", value: function(u) {
          Ue.out.println(u);
        } }, { key: "isBoundaryNode", value: function(u, t) {
          var e = this._nodes.find(t);
          if (e === null) return !1;
          var s = e.getLabel();
          return s !== null && s.getLocation(u) === T.BOUNDARY;
        } }, { key: "linkAllDirectedEdges", value: function() {
          for (var u = this._nodes.iterator(); u.hasNext(); )
            u.next().getEdges().linkAllDirectedEdges();
        } }, { key: "matchInSameDirection", value: function(u, t, e, s) {
          return !!u.equals(e) && pt.index(u, t, s) === pt.COLLINEAR && ye.quadrant(u, t) === ye.quadrant(e, s);
        } }, { key: "getEdgeEnds", value: function() {
          return this._edgeEndList;
        } }, { key: "debugPrint", value: function(u) {
          Ue.out.print(u);
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
            var s = new Ls(e, !0), h = new Ls(e, !1);
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
          if (this._edges = new mt(), this._nodes = null, this._edgeEndList = new mt(), arguments.length === 0) this._nodes = new Xt(new uu());
          else if (arguments.length === 1) {
            var u = arguments[0];
            this._nodes = new Xt(u);
          }
        } }, { key: "linkResultDirectedEdges", value: function(u) {
          for (var t = u.iterator(); t.hasNext(); )
            t.next().getEdges().linkResultDirectedEdges();
        } }]);
      }(), zo = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "sortShellsAndHoles", value: function(t, e, s) {
          for (var h = t.iterator(); h.hasNext(); ) {
            var v = h.next();
            v.isHole() ? s.add(v) : e.add(v);
          }
        } }, { key: "computePolygons", value: function(t) {
          for (var e = new mt(), s = t.iterator(); s.hasNext(); ) {
            var h = s.next().toPolygon(this._geometryFactory);
            e.add(h);
          }
          return e;
        } }, { key: "placeFreeHoles", value: function(t, e) {
          for (var s = e.iterator(); s.hasNext(); ) {
            var h = s.next();
            if (h.getShell() === null) {
              var v = u.findEdgeRingContaining(h, t);
              if (v === null) throw new an("unable to assign hole to a shell", h.getCoordinate(0));
              h.setShell(v);
            }
          }
        } }, { key: "buildMinimalEdgeRings", value: function(t, e, s) {
          for (var h = new mt(), v = t.iterator(); v.hasNext(); ) {
            var m = v.next();
            if (m.getMaxNodeDegree() > 2) {
              m.linkDirectedEdgesForMinimalEdgeRings();
              var E = m.buildMinimalRings(), N = this.findShell(E);
              N !== null ? (this.placePolygonHoles(N, E), e.add(N)) : s.addAll(E);
            } else h.add(m);
          }
          return h;
        } }, { key: "buildMaximalEdgeRings", value: function(t) {
          for (var e = new mt(), s = t.iterator(); s.hasNext(); ) {
            var h = s.next();
            if (h.isInResult() && h.getLabel().isArea() && h.getEdgeRing() === null) {
              var v = new Uo(h, this._geometryFactory);
              e.add(v), v.setInResult();
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
            var v = h.next();
            v.isHole() || (s = v, e++);
          }
          return Nt.isTrue(e <= 1, "found two shells in MinimalEdgeRing list"), s;
        } }, { key: "add", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            this.add(t.getEdgeEnds(), t.getNodes());
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            ou.linkResultDirectedEdges(s);
            var h = this.buildMaximalEdgeRings(e), v = new mt(), m = this.buildMinimalEdgeRings(h, this._shellList, v);
            this.sortShellsAndHoles(m, this._shellList, v), this.placeFreeHoles(this._shellList, v);
          }
        } }], [{ key: "constructor_", value: function() {
          this._geometryFactory = null, this._shellList = new mt();
          var t = arguments[0];
          this._geometryFactory = t;
        } }, { key: "findEdgeRingContaining", value: function(t, e) {
          for (var s = t.getLinearRing(), h = s.getEnvelopeInternal(), v = s.getCoordinateN(0), m = null, E = null, N = e.iterator(); N.hasNext(); ) {
            var R = N.next(), D = R.getLinearRing(), q = D.getEnvelopeInternal();
            if (!q.equals(h) && q.contains(h)) {
              v = re.ptNotInList(s.getCoordinates(), D.getCoordinates());
              var Z = !1;
              Rs.isInRing(v, D.getCoordinates()) && (Z = !0), Z && (m === null || E.contains(q)) && (E = (m = R).getLinearRing().getEnvelopeInternal());
            }
          }
          return m;
        } }]);
      }(), Os = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "getBounds", value: function() {
        } }]);
      }(), bn = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getItem", value: function() {
          return this._item;
        } }, { key: "getBounds", value: function() {
          return this._bounds;
        } }, { key: "interfaces_", get: function() {
          return [Os, j];
        } }], [{ key: "constructor_", value: function() {
          this._bounds = null, this._item = null;
          var u = arguments[0], t = arguments[1];
          this._bounds = u, this._item = t;
        } }]);
      }(), ne = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
          this._size = null, this._items = null, this._size = 0, this._items = new mt(), this._items.add(null);
        } }]);
      }(), Gs = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "insert", value: function(u, t) {
        } }, { key: "remove", value: function(u, t) {
        } }, { key: "query", value: function() {
        } }]);
      }(), fe = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getLevel", value: function() {
          return this._level;
        } }, { key: "size", value: function() {
          return this._childBoundables.size();
        } }, { key: "getChildBoundables", value: function() {
          return this._childBoundables;
        } }, { key: "addChildBoundable", value: function(u) {
          Nt.isTrue(this._bounds === null), this._childBoundables.add(u);
        } }, { key: "isEmpty", value: function() {
          return this._childBoundables.isEmpty();
        } }, { key: "getBounds", value: function() {
          return this._bounds === null && (this._bounds = this.computeBounds()), this._bounds;
        } }, { key: "interfaces_", get: function() {
          return [Os, j];
        } }], [{ key: "constructor_", value: function() {
          if (this._childBoundables = new mt(), this._bounds = null, this._level = null, arguments.length !== 0) {
            if (arguments.length === 1) {
              var u = arguments[0];
              this._level = u;
            }
          }
        } }]);
      }(), oi = { reverseOrder: function() {
        return { compare: function(u, t) {
          return t.compareTo(u);
        } };
      }, min: function(u) {
        return oi.sort(u), u.get(0);
      }, sort: function(u, t) {
        var e = u.toArray();
        t ? ei.sort(e, t) : ei.sort(e);
        for (var s = u.iterator(), h = 0, v = e.length; h < v; h++) s.next(), s.set(e[h]);
      }, singletonList: function(u) {
        var t = new mt();
        return t.add(u), t;
      } }, Ds = function() {
        function u() {
          f(this, u);
        }
        return g(u, null, [{ key: "maxDistance", value: function(t, e, s, h, v, m, E, N) {
          var R = u.distance(t, e, v, m);
          return R = Math.max(R, u.distance(t, e, E, N)), R = Math.max(R, u.distance(s, h, v, m)), R = Math.max(R, u.distance(s, h, E, N));
        } }, { key: "distance", value: function(t, e, s, h) {
          var v = s - t, m = h - e;
          return Math.sqrt(v * v + m * m);
        } }, { key: "maximumDistance", value: function(t, e) {
          var s = Math.min(t.getMinX(), e.getMinX()), h = Math.min(t.getMinY(), e.getMinY()), v = Math.max(t.getMaxX(), e.getMaxX()), m = Math.max(t.getMaxY(), e.getMaxY());
          return u.distance(s, h, v, m);
        } }, { key: "minMaxDistance", value: function(t, e) {
          var s = t.getMinX(), h = t.getMinY(), v = t.getMaxX(), m = t.getMaxY(), E = e.getMinX(), N = e.getMinY(), R = e.getMaxX(), D = e.getMaxY(), q = u.maxDistance(s, h, s, m, E, N, E, D);
          return q = Math.min(q, u.maxDistance(s, h, s, m, E, N, R, N)), q = Math.min(q, u.maxDistance(s, h, s, m, R, D, E, D)), q = Math.min(q, u.maxDistance(s, h, s, m, R, D, R, N)), q = Math.min(q, u.maxDistance(s, h, v, h, E, N, E, D)), q = Math.min(q, u.maxDistance(s, h, v, h, E, N, R, N)), q = Math.min(q, u.maxDistance(s, h, v, h, R, D, E, D)), q = Math.min(q, u.maxDistance(s, h, v, h, R, D, R, N)), q = Math.min(q, u.maxDistance(v, m, s, m, E, N, E, D)), q = Math.min(q, u.maxDistance(v, m, s, m, E, N, R, N)), q = Math.min(q, u.maxDistance(v, m, s, m, R, D, E, D)), q = Math.min(q, u.maxDistance(v, m, s, m, R, D, R, N)), q = Math.min(q, u.maxDistance(v, m, v, h, E, N, E, D)), q = Math.min(q, u.maxDistance(v, m, v, h, E, N, R, N)), q = Math.min(q, u.maxDistance(v, m, v, h, R, D, E, D)), q = Math.min(q, u.maxDistance(v, m, v, h, R, D, R, N));
        } }]);
      }(), ge = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "maximumDistance", value: function() {
          return Ds.maximumDistance(this._boundable1.getBounds(), this._boundable2.getBounds());
        } }, { key: "expandToQueue", value: function(t, e) {
          var s = u.isComposite(this._boundable1), h = u.isComposite(this._boundable2);
          if (s && h) return u.area(this._boundable1) > u.area(this._boundable2) ? (this.expand(this._boundable1, this._boundable2, !1, t, e), null) : (this.expand(this._boundable2, this._boundable1, !0, t, e), null);
          if (s) return this.expand(this._boundable1, this._boundable2, !1, t, e), null;
          if (h) return this.expand(this._boundable2, this._boundable1, !0, t, e), null;
          throw new X("neither boundable is composite");
        } }, { key: "isLeaves", value: function() {
          return !(u.isComposite(this._boundable1) || u.isComposite(this._boundable2));
        } }, { key: "compareTo", value: function(t) {
          var e = t;
          return this._distance < e._distance ? -1 : this._distance > e._distance ? 1 : 0;
        } }, { key: "expand", value: function(t, e, s, h, v) {
          for (var m = t.getChildBoundables().iterator(); m.hasNext(); ) {
            var E = m.next(), N = null;
            (N = s ? new u(e, E, this._itemDistance) : new u(E, e, this._itemDistance)).getDistance() < v && h.add(N);
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
        return g(function u() {
          f(this, u);
        }, [{ key: "visitItem", value: function(u) {
        } }]);
      }(), hi = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "queryInternal", value: function() {
          if (wt(arguments[2], Fs) && arguments[0] instanceof Object && arguments[1] instanceof fe) for (var t = arguments[0], e = arguments[2], s = arguments[1].getChildBoundables(), h = 0; h < s.size(); h++) {
            var v = s.get(h);
            this.getIntersectsOp().intersects(v.getBounds(), t) && (v instanceof fe ? this.queryInternal(t, v, e) : v instanceof bn ? e.visitItem(v.getItem()) : Nt.shouldNeverReachHere());
          }
          else if (wt(arguments[2], sn) && arguments[0] instanceof Object && arguments[1] instanceof fe) for (var m = arguments[0], E = arguments[2], N = arguments[1].getChildBoundables(), R = 0; R < N.size(); R++) {
            var D = N.get(R);
            this.getIntersectsOp().intersects(D.getBounds(), m) && (D instanceof fe ? this.queryInternal(m, D, E) : D instanceof bn ? E.add(D.getItem()) : Nt.shouldNeverReachHere());
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
              s instanceof fe ? t += this.size(s) : s instanceof bn && (t += 1);
            }
            return t;
          }
        } }, { key: "removeItem", value: function(t, e) {
          for (var s = null, h = t.getChildBoundables().iterator(); h.hasNext(); ) {
            var v = h.next();
            v instanceof bn && v.getItem() === e && (s = v);
          }
          return s !== null && (t.getChildBoundables().remove(s), !0);
        } }, { key: "itemsTree", value: function() {
          if (arguments.length === 0) {
            this.build();
            var t = this.itemsTree(this._root);
            return t === null ? new mt() : t;
          }
          if (arguments.length === 1) {
            for (var e = arguments[0], s = new mt(), h = e.getChildBoundables().iterator(); h.hasNext(); ) {
              var v = h.next();
              if (v instanceof fe) {
                var m = this.itemsTree(v);
                m !== null && s.add(m);
              } else v instanceof bn ? s.add(v.getItem()) : Nt.shouldNeverReachHere();
            }
            return s.size() <= 0 ? null : s;
          }
        } }, { key: "insert", value: function(t, e) {
          Nt.isTrue(!this._built, "Cannot insert items into an STR packed R-tree after it has been built."), this._itemBoundables.add(new bn(t, e));
        } }, { key: "boundablesAtLevel", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0], e = new mt();
            return this.boundablesAtLevel(t, this._root, e), e;
          }
          if (arguments.length === 3) {
            var s = arguments[0], h = arguments[1], v = arguments[2];
            if (Nt.isTrue(s > -2), h.getLevel() === s) return v.add(h), null;
            for (var m = h.getChildBoundables().iterator(); m.hasNext(); ) {
              var E = m.next();
              E instanceof fe ? this.boundablesAtLevel(s, E, v) : (Nt.isTrue(E instanceof bn), s === -1 && v.add(E));
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
            var s = arguments[0], h = arguments[1], v = arguments[2], m = this.removeItem(h, v);
            if (m) return !0;
            for (var E = null, N = h.getChildBoundables().iterator(); N.hasNext(); ) {
              var R = N.next();
              if (this.getIntersectsOp().intersects(R.getBounds(), s) && R instanceof fe && (m = this.remove(s, R, v))) {
                E = R;
                break;
              }
            }
            return E !== null && E.getChildBoundables().isEmpty() && h.getChildBoundables().remove(E), m;
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
                var h = this.depth(s);
                h > t && (t = h);
              }
            }
            return t + 1;
          }
        } }, { key: "createParentBoundables", value: function(t, e) {
          Nt.isTrue(!t.isEmpty());
          var s = new mt();
          s.add(this.createNode(e));
          var h = new mt(t);
          oi.sort(h, this.getComparator());
          for (var v = h.iterator(); v.hasNext(); ) {
            var m = v.next();
            this.lastNode(s).getChildBoundables().size() === this.getNodeCapacity() && s.add(this.createNode(e)), this.lastNode(s).addChildBoundable(m);
          }
          return s;
        } }, { key: "isEmpty", value: function() {
          return this._built ? this._root.isEmpty() : this._itemBoundables.isEmpty();
        } }, { key: "interfaces_", get: function() {
          return [j];
        } }], [{ key: "constructor_", value: function() {
          if (this._root = null, this._built = !1, this._itemBoundables = new mt(), this._nodeCapacity = null, arguments.length === 0) u.constructor_.call(this, u.DEFAULT_NODE_CAPACITY);
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
      var hu = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "distance", value: function(u, t) {
        } }]);
      }(), on = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "createParentBoundablesFromVerticalSlices", value: function(e, s) {
          Nt.isTrue(e.length > 0);
          for (var h = new mt(), v = 0; v < e.length; v++) h.addAll(this.createParentBoundablesFromVerticalSlice(e[v], s));
          return h;
        } }, { key: "nearestNeighbourK", value: function() {
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            return this.nearestNeighbourK(e, ht.POSITIVE_INFINITY, s);
          }
          if (arguments.length === 3) {
            var h = arguments[0], v = arguments[2], m = arguments[1], E = new ne();
            E.add(h);
            for (var N = new ne(); !E.isEmpty() && m >= 0; ) {
              var R = E.poll(), D = R.getDistance();
              if (D >= m) break;
              R.isLeaves() ? N.size() < v ? N.add(R) : (N.peek().getDistance() > D && (N.poll(), N.add(R)), m = N.peek().getDistance()) : R.expandToQueue(E, m);
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
          for (var h = Math.trunc(Math.ceil(e.size() / s)), v = new Array(s).fill(null), m = e.iterator(), E = 0; E < s; E++) {
            v[E] = new mt();
            for (var N = 0; m.hasNext() && N < h; ) {
              var R = m.next();
              v[E].add(R), N++;
            }
          }
          return v;
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
          if (arguments.length === 2 && arguments[1] instanceof Object && arguments[0] instanceof Ht) {
            var e = arguments[0], s = arguments[1];
            return C(t, "remove", this, 1).call(this, e, s);
          }
          return C(t, "remove", this, 1).apply(this, arguments);
        } }, { key: "depth", value: function() {
          return arguments.length === 0 ? C(t, "depth", this, 1).call(this) : C(t, "depth", this, 1).apply(this, arguments);
        } }, { key: "createParentBoundables", value: function(e, s) {
          Nt.isTrue(!e.isEmpty());
          var h = Math.trunc(Math.ceil(e.size() / this.getNodeCapacity())), v = new mt(e);
          oi.sort(v, t.xComparator);
          var m = this.verticalSlices(v, Math.trunc(Math.ceil(Math.sqrt(h))));
          return this.createParentBoundablesFromVerticalSlices(m, s);
        } }, { key: "nearestNeighbour", value: function() {
          if (arguments.length === 1) {
            if (wt(arguments[0], hu)) {
              var e = arguments[0];
              if (this.isEmpty()) return null;
              var s = new ge(this.getRoot(), this.getRoot(), e);
              return this.nearestNeighbour(s);
            }
            if (arguments[0] instanceof ge) {
              var h = arguments[0], v = ht.POSITIVE_INFINITY, m = null, E = new ne();
              for (E.add(h); !E.isEmpty() && v > 0; ) {
                var N = E.poll(), R = N.getDistance();
                if (R >= v) break;
                N.isLeaves() ? (v = R, m = N) : N.expandToQueue(E, v);
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
              var rt = arguments[2], ot = new bn(arguments[0], arguments[1]), gt = new ge(this.getRoot(), ot, rt);
              return this.nearestNeighbour(gt)[0];
            }
            if (arguments.length === 4) {
              var bt = arguments[2], lt = arguments[3], Wt = new bn(arguments[0], arguments[1]), ce = new ge(this.getRoot(), Wt, bt);
              return this.nearestNeighbourK(ce, lt);
            }
          }
        } }, { key: "isWithinDistance", value: function() {
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1], h = ht.POSITIVE_INFINITY, v = new ne();
            for (v.add(e); !v.isEmpty(); ) {
              var m = v.poll(), E = m.getDistance();
              if (E > s) return !1;
              if (m.maximumDistance() <= s) return !0;
              if (m.isLeaves()) {
                if ((h = E) <= s) return !0;
              } else m.expandToQueue(v, h);
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
          for (var s = new Array(e.size()).fill(null), h = 0; !e.isEmpty(); ) {
            var v = e.poll();
            s[h] = v.getBoundable(0).getItem(), h++;
          }
          return s;
        } }, { key: "centreY", value: function(e) {
          return t.avg(e.getMinY(), e.getMaxY());
        } }]);
      }(hi), qs = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "computeBounds", value: function() {
          for (var e = null, s = this.getChildBoundables().iterator(); s.hasNext(); ) {
            var h = s.next();
            e === null ? e = new Ht(h.getBounds()) : e.expandToInclude(h.getBounds());
          }
          return e;
        } }], [{ key: "constructor_", value: function() {
          var e = arguments[0];
          fe.constructor_.call(this, e);
        } }]);
      }(fe);
      on.STRtreeNode = qs, on.xComparator = new (function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "interfaces_", get: function() {
          return [Zt];
        } }, { key: "compare", value: function(u, t) {
          return hi.compareDoubles(on.centreX(u.getBounds()), on.centreX(t.getBounds()));
        } }]);
      }())(), on.yComparator = new (function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "interfaces_", get: function() {
          return [Zt];
        } }, { key: "compare", value: function(u, t) {
          return hi.compareDoubles(on.centreY(u.getBounds()), on.centreY(t.getBounds()));
        } }]);
      }())(), on.intersectsOp = new (function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "interfaces_", get: function() {
          return [IntersectsOp];
        } }, { key: "intersects", value: function(u, t) {
          return u.intersects(t);
        } }]);
      }())(), on.DEFAULT_NODE_CAPACITY = 10;
      var lu = function() {
        function u() {
          f(this, u);
        }
        return g(u, null, [{ key: "relativeSign", value: function(t, e) {
          return t < e ? -1 : t > e ? 1 : 0;
        } }, { key: "compare", value: function(t, e, s) {
          if (e.equals2D(s)) return 0;
          var h = u.relativeSign(e.x, s.x), v = u.relativeSign(e.y, s.y);
          switch (t) {
            case 0:
              return u.compareValue(h, v);
            case 1:
              return u.compareValue(v, h);
            case 2:
              return u.compareValue(v, -h);
            case 3:
              return u.compareValue(-h, v);
            case 4:
              return u.compareValue(-h, -v);
            case 5:
              return u.compareValue(-v, -h);
            case 6:
              return u.compareValue(-v, h);
            case 7:
              return u.compareValue(h, -v);
          }
          return Nt.shouldNeverReachHere("invalid octant value"), 0;
        } }, { key: "compareValue", value: function(t, e) {
          return t < 0 ? -1 : t > 0 ? 1 : e < 0 ? -1 : e > 0 ? 1 : 0;
        } }]);
      }(), be = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getCoordinate", value: function() {
          return this.coord;
        } }, { key: "print", value: function(u) {
          u.print(this.coord), u.print(" seg # = " + this.segmentIndex);
        } }, { key: "compareTo", value: function(u) {
          var t = u;
          return this.segmentIndex < t.segmentIndex ? -1 : this.segmentIndex > t.segmentIndex ? 1 : this.coord.equals2D(t.coord) ? 0 : this._isInterior ? t._isInterior ? lu.compare(this._segmentOctant, this.coord, t.coord) : 1 : -1;
        } }, { key: "isEndPoint", value: function(u) {
          return this.segmentIndex === 0 && !this._isInterior || this.segmentIndex === u;
        } }, { key: "toString", value: function() {
          return this.segmentIndex + ":" + this.coord.toString();
        } }, { key: "isInterior", value: function() {
          return this._isInterior;
        } }, { key: "interfaces_", get: function() {
          return [K];
        } }], [{ key: "constructor_", value: function() {
          this._segString = null, this.coord = null, this.segmentIndex = null, this._segmentOctant = null, this._isInterior = null;
          var u = arguments[0], t = arguments[1], e = arguments[2], s = arguments[3];
          this._segString = u, this.coord = new U(t), this.segmentIndex = e, this._segmentOctant = s, this._isInterior = !t.equals2D(u.getCoordinate(e));
        } }]);
      }(), Yo = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "hasNext", value: function() {
        } }, { key: "next", value: function() {
        } }, { key: "remove", value: function() {
        } }]);
      }(), $e = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getSplitCoordinates", value: function() {
          var u = new Ji();
          this.addEndpoints();
          for (var t = this.iterator(), e = t.next(); t.hasNext(); ) {
            var s = t.next();
            this.addEdgeCoordinates(e, s, u), e = s;
          }
          return u.toCoordinateArray();
        } }, { key: "addCollapsedNodes", value: function() {
          var u = new mt();
          this.findCollapsesFromInsertedNodes(u), this.findCollapsesFromExistingVertices(u);
          for (var t = u.iterator(); t.hasNext(); ) {
            var e = t.next().intValue();
            this.add(this._edge.getCoordinate(e), e);
          }
        } }, { key: "createSplitEdgePts", value: function(u, t) {
          var e = t.segmentIndex - u.segmentIndex + 2;
          if (e === 2) return [new U(u.coord), new U(t.coord)];
          var s = this._edge.getCoordinate(t.segmentIndex), h = t.isInterior() || !t.coord.equals2D(s);
          h || e--;
          var v = new Array(e).fill(null), m = 0;
          v[m++] = new U(u.coord);
          for (var E = u.segmentIndex + 1; E <= t.segmentIndex; E++) v[m++] = this._edge.getCoordinate(E);
          return h && (v[m] = new U(t.coord)), v;
        } }, { key: "print", value: function(u) {
          u.println("Intersections:");
          for (var t = this.iterator(); t.hasNext(); )
            t.next().print(u);
        } }, { key: "findCollapsesFromExistingVertices", value: function(u) {
          for (var t = 0; t < this._edge.size() - 2; t++) {
            var e = this._edge.getCoordinate(t);
            this._edge.getCoordinate(t + 1);
            var s = this._edge.getCoordinate(t + 2);
            e.equals2D(s) && u.add(wr.valueOf(t + 1));
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
            this.findCollapseIndex(s, h, t) && u.add(wr.valueOf(t[0])), s = h;
          }
        } }, { key: "getEdge", value: function() {
          return this._edge;
        } }, { key: "addEndpoints", value: function() {
          var u = this._edge.size() - 1;
          this.add(this._edge.getCoordinate(0), 0), this.add(this._edge.getCoordinate(u), u);
        } }, { key: "createSplitEdge", value: function(u, t) {
          var e = this.createSplitEdgePts(u, t);
          return new mn(e, this._edge.getData());
        } }, { key: "add", value: function(u, t) {
          var e = new be(this._edge, u, t, this._edge.getSegmentOctant(t)), s = this._nodeMap.get(e);
          return s !== null ? (Nt.isTrue(s.coord.equals2D(u), "Found equal nodes with different coordinates"), s) : (this._nodeMap.put(e, e), e);
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
      }(), Xo = function() {
        function u() {
          f(this, u);
        }
        return g(u, null, [{ key: "octant", value: function() {
          if (typeof arguments[0] == "number" && typeof arguments[1] == "number") {
            var t = arguments[0], e = arguments[1];
            if (t === 0 && e === 0) throw new X("Cannot compute the octant for point ( " + t + ", " + e + " )");
            var s = Math.abs(t), h = Math.abs(e);
            return t >= 0 ? e >= 0 ? s >= h ? 0 : 1 : s >= h ? 7 : 6 : e >= 0 ? s >= h ? 3 : 2 : s >= h ? 4 : 5;
          }
          if (arguments[0] instanceof U && arguments[1] instanceof U) {
            var v = arguments[0], m = arguments[1], E = m.x - v.x, N = m.y - v.y;
            if (E === 0 && N === 0) throw new X("Cannot compute the octant for two identical points " + v);
            return u.octant(E, N);
          }
        } }]);
      }(), fu = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "getCoordinates", value: function() {
        } }, { key: "size", value: function() {
        } }, { key: "getCoordinate", value: function(u) {
        } }, { key: "isClosed", value: function() {
        } }, { key: "setData", value: function(u) {
        } }, { key: "getData", value: function() {
        } }]);
      }(), Bn = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "addIntersection", value: function(u, t) {
        } }, { key: "interfaces_", get: function() {
          return [fu];
        } }]);
      }(), mn = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
          return t.equals2D(e) ? 0 : Xo.octant(t, e);
        } }, { key: "getData", value: function() {
          return this._data;
        } }, { key: "addIntersection", value: function() {
          if (arguments.length === 2) {
            var t = arguments[0], e = arguments[1];
            this.addIntersectionNode(t, e);
          } else if (arguments.length === 4) {
            var s = arguments[1], h = arguments[3], v = new U(arguments[0].getIntersection(h));
            this.addIntersection(v, s);
          }
        } }, { key: "toString", value: function() {
          return Lr.toLineString(new Qi(this._pts));
        } }, { key: "getNodeList", value: function() {
          return this._nodeList;
        } }, { key: "addIntersectionNode", value: function(t, e) {
          var s = e, h = s + 1;
          if (h < this._pts.length) {
            var v = this._pts[h];
            t.equals2D(v) && (s = h);
          }
          return this._nodeList.add(t, s);
        } }, { key: "addIntersections", value: function(t, e, s) {
          for (var h = 0; h < t.getIntersectionNum(); h++) this.addIntersection(t, e, s, h);
        } }, { key: "interfaces_", get: function() {
          return [Bn];
        } }], [{ key: "constructor_", value: function() {
          this._nodeList = new $e(this), this._pts = null, this._data = null;
          var t = arguments[0], e = arguments[1];
          this._pts = t, this._data = e;
        } }, { key: "getNodedSubstrings", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0], e = new mt();
            return u.getNodedSubstrings(t, e), e;
          }
          if (arguments.length === 2) for (var s = arguments[1], h = arguments[0].iterator(); h.hasNext(); )
            h.next().getNodeList().addSplitEdges(s);
        } }]);
      }(), pe = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "minX", value: function() {
          return Math.min(this.p0.x, this.p1.x);
        } }, { key: "orientationIndex", value: function() {
          if (arguments[0] instanceof u) {
            var t = arguments[0], e = pt.index(this.p0, this.p1, t.p0), s = pt.index(this.p0, this.p1, t.p1);
            return e >= 0 && s >= 0 || e <= 0 && s <= 0 ? Math.max(e, s) : 0;
          }
          if (arguments[0] instanceof U) {
            var h = arguments[0];
            return pt.index(this.p0, this.p1, h);
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
          if (arguments[0] instanceof U) {
            var t = arguments[0];
            if (t.equals(this.p0) || t.equals(this.p1)) return new U(t);
            var e = this.projectionFactor(t), s = new U();
            return s.x = this.p0.x + e * (this.p1.x - this.p0.x), s.y = this.p0.y + e * (this.p1.y - this.p0.y), s;
          }
          if (arguments[0] instanceof u) {
            var h = arguments[0], v = this.projectionFactor(h.p0), m = this.projectionFactor(h.p1);
            if (v >= 1 && m >= 1 || v <= 0 && m <= 0) return null;
            var E = this.project(h.p0);
            v < 0 && (E = this.p0), v > 1 && (E = this.p1);
            var N = this.project(h.p1);
            return m < 0 && (N = this.p0), m > 1 && (N = this.p1), new u(E, N);
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
          var s = new Array(2).fill(null), h = ht.MAX_VALUE, v = null, m = this.closestPoint(t.p0);
          h = m.distance(t.p0), s[0] = m, s[1] = t.p0;
          var E = this.closestPoint(t.p1);
          (v = E.distance(t.p1)) < h && (h = v, s[0] = E, s[1] = t.p1);
          var N = t.closestPoint(this.p0);
          (v = N.distance(this.p0)) < h && (h = v, s[0] = this.p0, s[1] = N);
          var R = t.closestPoint(this.p1);
          return (v = R.distance(this.p1)) < h && (h = v, s[0] = this.p1, s[1] = R), s;
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
          var s = this.p0.x + t * (this.p1.x - this.p0.x), h = this.p0.y + t * (this.p1.y - this.p0.y), v = this.p1.x - this.p0.x, m = this.p1.y - this.p0.y, E = Math.sqrt(v * v + m * m), N = 0, R = 0;
          if (e !== 0) {
            if (E <= 0) throw new IllegalStateException("Cannot compute offset from zero-length line segment");
            N = e * v / E, R = e * m / E;
          }
          return new U(s - R, h + N);
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
          var e = this.p1.getY() - this.p0.getY(), s = this.p0.getX() - this.p1.getX(), h = this.p0.getY() * (this.p1.getX() - this.p0.getX()) - this.p0.getX() * (this.p1.getY() - this.p0.getY()), v = e * e + s * s, m = e * e - s * s, E = t.getX(), N = t.getY();
          return new U((-m * E - 2 * e * s * N - 2 * e * h) / v, (m * N - 2 * e * s * E - 2 * s * h) / v);
        } }, { key: "distance", value: function() {
          if (arguments[0] instanceof u) {
            var t = arguments[0];
            return un.segmentToSegment(this.p0, this.p1, t.p0, t.p1);
          }
          if (arguments[0] instanceof U) {
            var e = arguments[0];
            return un.pointToSegment(e, this.p0, this.p1);
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
          if (this.p0 = null, this.p1 = null, arguments.length === 0) u.constructor_.call(this, new U(), new U());
          else if (arguments.length === 1) {
            var t = arguments[0];
            u.constructor_.call(this, t.p0, t.p1);
          } else if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1];
            this.p0 = e, this.p1 = s;
          } else if (arguments.length === 4) {
            var h = arguments[0], v = arguments[1], m = arguments[2], E = arguments[3];
            u.constructor_.call(this, new U(h, v), new U(m, E));
          }
        } }, { key: "midPoint", value: function(t, e) {
          return new U((t.x + e.x) / 2, (t.y + e.y) / 2);
        } }]);
      }(), Kt = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "overlap", value: function() {
          if (arguments.length !== 2) {
            if (arguments.length === 4) {
              var u = arguments[1], t = arguments[2], e = arguments[3];
              arguments[0].getLineSegment(u, this._overlapSeg1), t.getLineSegment(e, this._overlapSeg2), this.overlap(this._overlapSeg1, this._overlapSeg2);
            }
          }
        } }], [{ key: "constructor_", value: function() {
          this._overlapSeg1 = new pe(), this._overlapSeg2 = new pe();
        } }]);
      }(), Rn = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getLineSegment", value: function(u, t) {
          t.p0 = this._pts[u], t.p1 = this._pts[u + 1];
        } }, { key: "computeSelect", value: function(u, t, e, s) {
          var h = this._pts[t], v = this._pts[e];
          if (e - t == 1) return s.select(this, t), null;
          if (!u.intersects(h, v)) return null;
          var m = Math.trunc((t + e) / 2);
          t < m && this.computeSelect(u, t, m, s), m < e && this.computeSelect(u, m, e, s);
        } }, { key: "getCoordinates", value: function() {
          for (var u = new Array(this._end - this._start + 1).fill(null), t = 0, e = this._start; e <= this._end; e++) u[t++] = this._pts[e];
          return u;
        } }, { key: "computeOverlaps", value: function() {
          if (arguments.length === 2) {
            var u = arguments[0], t = arguments[1];
            this.computeOverlaps(this._start, this._end, u, u._start, u._end, t);
          } else if (arguments.length === 6) {
            var e = arguments[0], s = arguments[1], h = arguments[2], v = arguments[3], m = arguments[4], E = arguments[5];
            if (s - e == 1 && m - v == 1) return E.overlap(this, e, h, v), null;
            if (!this.overlaps(e, s, h, v, m)) return null;
            var N = Math.trunc((e + s) / 2), R = Math.trunc((v + m) / 2);
            e < N && (v < R && this.computeOverlaps(e, N, h, v, R, E), R < m && this.computeOverlaps(e, N, h, R, m, E)), N < s && (v < R && this.computeOverlaps(N, s, h, v, R, E), R < m && this.computeOverlaps(N, s, h, R, m, E));
          }
        } }, { key: "setId", value: function(u) {
          this._id = u;
        } }, { key: "select", value: function(u, t) {
          this.computeSelect(u, this._start, this._end, t);
        } }, { key: "getEnvelope", value: function() {
          if (this._env === null) {
            var u = this._pts[this._start], t = this._pts[this._end];
            this._env = new Ht(u, t);
          }
          return this._env;
        } }, { key: "overlaps", value: function(u, t, e, s, h) {
          return Ht.intersects(this._pts[u], this._pts[t], e._pts[s], e._pts[h]);
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
      }(), Bs = function() {
        function u() {
          f(this, u);
        }
        return g(u, null, [{ key: "findChainEnd", value: function(t, e) {
          for (var s = e; s < t.length - 1 && t[s].equals2D(t[s + 1]); ) s++;
          if (s >= t.length - 1) return t.length - 1;
          for (var h = ye.quadrant(t[s], t[s + 1]), v = e + 1; v < t.length && !(!t[v - 1].equals2D(t[v]) && ye.quadrant(t[v - 1], t[v]) !== h); )
            v++;
          return v - 1;
        } }, { key: "getChains", value: function() {
          if (arguments.length === 1) {
            var t = arguments[0];
            return u.getChains(t, null);
          }
          if (arguments.length === 2) {
            var e = arguments[0], s = arguments[1], h = new mt(), v = 0;
            do {
              var m = u.findChainEnd(e, v), E = new Rn(e, v, m, s);
              h.add(E), v = m;
            } while (v < e.length - 1);
            return h;
          }
        } }]);
      }(), Us = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "computeNodes", value: function(u) {
        } }, { key: "getNodedSubstrings", value: function() {
        } }]);
      }(), Gr = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "setSegmentIntersector", value: function(u) {
          this._segInt = u;
        } }, { key: "interfaces_", get: function() {
          return [Us];
        } }], [{ key: "constructor_", value: function() {
          if (this._segInt = null, arguments.length !== 0) {
            if (arguments.length === 1) {
              var u = arguments[0];
              this.setSegmentIntersector(u);
            }
          }
        } }]);
      }(), zs = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "getMonotoneChains", value: function() {
          return this._monoChains;
        } }, { key: "getNodedSubstrings", value: function() {
          return mn.getNodedSubstrings(this._nodedSegStrings);
        } }, { key: "getIndex", value: function() {
          return this._index;
        } }, { key: "add", value: function(e) {
          for (var s = Bs.getChains(e.getCoordinates(), e).iterator(); s.hasNext(); ) {
            var h = s.next();
            h.setId(this._idCounter++), this._index.insert(h.getEnvelope(), h), this._monoChains.add(h);
          }
        } }, { key: "computeNodes", value: function(e) {
          this._nodedSegStrings = e;
          for (var s = e.iterator(); s.hasNext(); ) this.add(s.next());
          this.intersectChains();
        } }, { key: "intersectChains", value: function() {
          for (var e = new cu(this._segInt), s = this._monoChains.iterator(); s.hasNext(); ) for (var h = s.next(), v = this._index.query(h.getEnvelope()).iterator(); v.hasNext(); ) {
            var m = v.next();
            if (m.getId() > h.getId() && (h.computeOverlaps(m, e), this._nOverlaps++), this._segInt.isDone()) return null;
          }
        } }], [{ key: "constructor_", value: function() {
          if (this._monoChains = new mt(), this._index = new on(), this._idCounter = 0, this._nodedSegStrings = null, this._nOverlaps = 0, arguments.length !== 0) {
            if (arguments.length === 1) {
              var e = arguments[0];
              Gr.constructor_.call(this, e);
            }
          }
        } }]);
      }(Gr), cu = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "overlap", value: function() {
          if (arguments.length !== 4) return C(t, "overlap", this, 1).apply(this, arguments);
          var e = arguments[1], s = arguments[2], h = arguments[3], v = arguments[0].getContext(), m = s.getContext();
          this._si.processIntersections(v, e, m, h);
        } }], [{ key: "constructor_", value: function() {
          this._si = null;
          var e = arguments[0];
          this._si = e;
        } }]);
      }(Kt);
      zs.SegmentOverlapAction = cu;
      var hn = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "isDeletable", value: function(t, e, s, h) {
          var v = this._inputLine[t], m = this._inputLine[e], E = this._inputLine[s];
          return !!this.isConcave(v, m, E) && !!this.isShallow(v, m, E, h) && this.isShallowSampled(v, m, t, s, h);
        } }, { key: "deleteShallowConcavities", value: function() {
          for (var t = 1, e = this.findNextNonDeletedIndex(t), s = this.findNextNonDeletedIndex(e), h = !1; s < this._inputLine.length; ) {
            var v = !1;
            this.isDeletable(t, e, s, this._distanceTol) && (this._isDeleted[e] = u.DELETE, v = !0, h = !0), t = v ? s : e, e = this.findNextNonDeletedIndex(t), s = this.findNextNonDeletedIndex(e);
          }
          return h;
        } }, { key: "isShallowConcavity", value: function(t, e, s, h) {
          return pt.index(t, e, s) === this._angleOrientation && un.pointToSegment(e, t, s) < h;
        } }, { key: "isShallowSampled", value: function(t, e, s, h, v) {
          var m = Math.trunc((h - s) / u.NUM_PTS_TO_CHECK);
          m <= 0 && (m = 1);
          for (var E = s; E < h; E += m) if (!this.isShallow(t, e, this._inputLine[E], v)) return !1;
          return !0;
        } }, { key: "isConcave", value: function(t, e, s) {
          var h = pt.index(t, e, s) === this._angleOrientation;
          return h;
        } }, { key: "simplify", value: function(t) {
          this._distanceTol = Math.abs(t), t < 0 && (this._angleOrientation = pt.CLOCKWISE), this._isDeleted = new Array(this._inputLine.length).fill(null);
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
          for (var t = new Ji(), e = 0; e < this._inputLine.length; e++) this._isDeleted[e] !== u.DELETE && t.add(this._inputLine[e]);
          return t.toCoordinateArray();
        } }], [{ key: "constructor_", value: function() {
          this._inputLine = null, this._distanceTol = null, this._isDeleted = null, this._angleOrientation = pt.COUNTERCLOCKWISE;
          var t = arguments[0];
          this._inputLine = t;
        } }, { key: "simplify", value: function(t, e) {
          return new u(t).simplify(e);
        } }]);
      }();
      hn.INIT = 0, hn.DELETE = 1, hn.KEEP = 1, hn.NUM_PTS_TO_CHECK = 10;
      var Ys = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getCoordinates", value: function() {
          return this._ptList.toArray(u.COORDINATE_ARRAY_TYPE);
        } }, { key: "setPrecisionModel", value: function(t) {
          this._precisionModel = t;
        } }, { key: "addPt", value: function(t) {
          var e = new U(t);
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
        function u() {
          f(this, u);
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
            var e = arguments[0], s = arguments[1], h = s.x - e.x, v = s.y - e.y;
            return Math.atan2(v, h);
          }
        } }, { key: "isAcute", value: function(t, e, s) {
          var h = t.x - e.x, v = t.y - e.y;
          return h * (s.x - e.x) + v * (s.y - e.y) > 0;
        } }, { key: "isObtuse", value: function(t, e, s) {
          var h = t.x - e.x, v = t.y - e.y;
          return h * (s.x - e.x) + v * (s.y - e.y) < 0;
        } }, { key: "interiorAngle", value: function(t, e, s) {
          var h = u.angle(e, t), v = u.angle(e, s);
          return Math.abs(v - h);
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
          var h = u.angle(e, t), v = u.angle(e, s);
          return u.diff(h, v);
        } }, { key: "diff", value: function(t, e) {
          var s = null;
          return (s = t < e ? e - t : t - e) > Math.PI && (s = 2 * Math.PI - s), s;
        } }, { key: "toRadians", value: function(t) {
          return t * Math.PI / 180;
        } }, { key: "getTurn", value: function(t, e) {
          var s = Math.sin(e - t);
          return s > 0 ? u.COUNTERCLOCKWISE : s < 0 ? u.CLOCKWISE : u.NONE;
        } }, { key: "angleBetweenOriented", value: function(t, e, s) {
          var h = u.angle(e, t), v = u.angle(e, s) - h;
          return v <= -Math.PI ? v + u.PI_TIMES_2 : v > Math.PI ? v - u.PI_TIMES_2 : v;
        } }]);
      }();
      _e.PI_TIMES_2 = 2 * Math.PI, _e.PI_OVER_2 = Math.PI / 2, _e.PI_OVER_4 = Math.PI / 4, _e.COUNTERCLOCKWISE = pt.COUNTERCLOCKWISE, _e.CLOCKWISE = pt.CLOCKWISE, _e.NONE = pt.COLLINEAR;
      var yn = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "addNextSegment", value: function(t, e) {
          if (this._s0 = this._s1, this._s1 = this._s2, this._s2 = t, this._seg0.setCoordinates(this._s0, this._s1), this.computeOffsetSegment(this._seg0, this._side, this._distance, this._offset0), this._seg1.setCoordinates(this._s1, this._s2), this.computeOffsetSegment(this._seg1, this._side, this._distance, this._offset1), this._s1.equals(this._s2)) return null;
          var s = pt.index(this._s0, this._s1, this._s2), h = s === pt.CLOCKWISE && this._side === tt.LEFT || s === pt.COUNTERCLOCKWISE && this._side === tt.RIGHT;
          s === 0 ? this.addCollinear(e) : h ? this.addOutsideTurn(s, e) : this.addInsideTurn(s, e);
        } }, { key: "addLineEndCap", value: function(t, e) {
          var s = new pe(t, e), h = new pe();
          this.computeOffsetSegment(s, tt.LEFT, this._distance, h);
          var v = new pe();
          this.computeOffsetSegment(s, tt.RIGHT, this._distance, v);
          var m = e.x - t.x, E = e.y - t.y, N = Math.atan2(E, m);
          switch (this._bufParams.getEndCapStyle()) {
            case Y.CAP_ROUND:
              this._segList.addPt(h.p1), this.addDirectedFillet(e, N + Math.PI / 2, N - Math.PI / 2, pt.CLOCKWISE, this._distance), this._segList.addPt(v.p1);
              break;
            case Y.CAP_FLAT:
              this._segList.addPt(h.p1), this._segList.addPt(v.p1);
              break;
            case Y.CAP_SQUARE:
              var R = new U();
              R.x = Math.abs(this._distance) * Math.cos(N), R.y = Math.abs(this._distance) * Math.sin(N);
              var D = new U(h.p1.x + R.x, h.p1.y + R.y), q = new U(v.p1.x + R.x, v.p1.y + R.y);
              this._segList.addPt(D), this._segList.addPt(q);
          }
        } }, { key: "getCoordinates", value: function() {
          return this._segList.getCoordinates();
        } }, { key: "addMitreJoin", value: function(t, e, s, h) {
          var v = ps.intersection(e.p0, e.p1, s.p0, s.p1);
          if (v !== null && (h <= 0 ? 1 : v.distance(t) / Math.abs(h)) <= this._bufParams.getMitreLimit()) return this._segList.addPt(v), null;
          this.addLimitedMitreJoin(e, s, h, this._bufParams.getMitreLimit());
        } }, { key: "addOutsideTurn", value: function(t, e) {
          if (this._offset0.p1.distance(this._offset1.p0) < this._distance * u.OFFSET_SEGMENT_SEPARATION_FACTOR) return this._segList.addPt(this._offset0.p1), null;
          this._bufParams.getJoinStyle() === Y.JOIN_MITRE ? this.addMitreJoin(this._s1, this._offset0, this._offset1, this._distance) : this._bufParams.getJoinStyle() === Y.JOIN_BEVEL ? this.addBevelJoin(this._offset0, this._offset1) : (e && this._segList.addPt(this._offset0.p1), this.addCornerFillet(this._s1, this._offset0.p1, this._offset1.p0, t, this._distance), this._segList.addPt(this._offset1.p0));
        } }, { key: "createSquare", value: function(t) {
          this._segList.addPt(new U(t.x + this._distance, t.y + this._distance)), this._segList.addPt(new U(t.x + this._distance, t.y - this._distance)), this._segList.addPt(new U(t.x - this._distance, t.y - this._distance)), this._segList.addPt(new U(t.x - this._distance, t.y + this._distance)), this._segList.closeRing();
        } }, { key: "addSegments", value: function(t, e) {
          this._segList.addPts(t, e);
        } }, { key: "addFirstSegment", value: function() {
          this._segList.addPt(this._offset1.p0);
        } }, { key: "addCornerFillet", value: function(t, e, s, h, v) {
          var m = e.x - t.x, E = e.y - t.y, N = Math.atan2(E, m), R = s.x - t.x, D = s.y - t.y, q = Math.atan2(D, R);
          h === pt.CLOCKWISE ? N <= q && (N += 2 * Math.PI) : N >= q && (N -= 2 * Math.PI), this._segList.addPt(e), this.addDirectedFillet(t, N, q, h, v), this._segList.addPt(s);
        } }, { key: "addLastSegment", value: function() {
          this._segList.addPt(this._offset1.p1);
        } }, { key: "initSideSegments", value: function(t, e, s) {
          this._s1 = t, this._s2 = e, this._side = s, this._seg1.setCoordinates(t, e), this.computeOffsetSegment(this._seg1, s, this._distance, this._offset1);
        } }, { key: "addLimitedMitreJoin", value: function(t, e, s, h) {
          var v = this._seg0.p1, m = _e.angle(v, this._seg0.p0), E = _e.angleBetweenOriented(this._seg0.p0, v, this._seg1.p1) / 2, N = _e.normalize(m + E), R = _e.normalize(N + Math.PI), D = h * s, q = s - D * Math.abs(Math.sin(E)), Z = v.x + D * Math.cos(R), rt = v.y + D * Math.sin(R), ot = new U(Z, rt), gt = new pe(v, ot), bt = gt.pointAlongOffset(1, q), lt = gt.pointAlongOffset(1, -q);
          this._side === tt.LEFT ? (this._segList.addPt(bt), this._segList.addPt(lt)) : (this._segList.addPt(lt), this._segList.addPt(bt));
        } }, { key: "addDirectedFillet", value: function(t, e, s, h, v) {
          var m = h === pt.CLOCKWISE ? -1 : 1, E = Math.abs(e - s), N = Math.trunc(E / this._filletAngleQuantum + 0.5);
          if (N < 1) return null;
          for (var R = E / N, D = new U(), q = 0; q < N; q++) {
            var Z = e + m * q * R;
            D.x = t.x + v * Math.cos(Z), D.y = t.y + v * Math.sin(Z), this._segList.addPt(D);
          }
        } }, { key: "computeOffsetSegment", value: function(t, e, s, h) {
          var v = e === tt.LEFT ? 1 : -1, m = t.p1.x - t.p0.x, E = t.p1.y - t.p0.y, N = Math.sqrt(m * m + E * E), R = v * s * m / N, D = v * s * E / N;
          h.p0.x = t.p0.x - D, h.p0.y = t.p0.y + R, h.p1.x = t.p1.x - D, h.p1.y = t.p1.y + R;
        } }, { key: "addInsideTurn", value: function(t, e) {
          if (this._li.computeIntersection(this._offset0.p0, this._offset0.p1, this._offset1.p0, this._offset1.p1), this._li.hasIntersection()) this._segList.addPt(this._li.getIntersection(0));
          else if (this._hasNarrowConcaveAngle = !0, this._offset0.p1.distance(this._offset1.p0) < this._distance * u.INSIDE_TURN_VERTEX_SNAP_DISTANCE_FACTOR) this._segList.addPt(this._offset0.p1);
          else {
            if (this._segList.addPt(this._offset0.p1), this._closingSegLengthFactor > 0) {
              var s = new U((this._closingSegLengthFactor * this._offset0.p1.x + this._s1.x) / (this._closingSegLengthFactor + 1), (this._closingSegLengthFactor * this._offset0.p1.y + this._s1.y) / (this._closingSegLengthFactor + 1));
              this._segList.addPt(s);
              var h = new U((this._closingSegLengthFactor * this._offset1.p0.x + this._s1.x) / (this._closingSegLengthFactor + 1), (this._closingSegLengthFactor * this._offset1.p0.y + this._s1.y) / (this._closingSegLengthFactor + 1));
              this._segList.addPt(h);
            } else this._segList.addPt(this._s1);
            this._segList.addPt(this._offset1.p0);
          }
        } }, { key: "createCircle", value: function(t) {
          var e = new U(t.x + this._distance, t.y);
          this._segList.addPt(e), this.addDirectedFillet(t, 0, 2 * Math.PI, -1, this._distance), this._segList.closeRing();
        } }, { key: "addBevelJoin", value: function(t, e) {
          this._segList.addPt(t.p1), this._segList.addPt(e.p0);
        } }, { key: "init", value: function(t) {
          this._distance = t, this._maxCurveSegmentError = t * (1 - Math.cos(this._filletAngleQuantum / 2)), this._segList = new Ys(), this._segList.setPrecisionModel(this._precisionModel), this._segList.setMinimumVertexDistance(t * u.CURVE_VERTEX_SNAP_DISTANCE_FACTOR);
        } }, { key: "addCollinear", value: function(t) {
          this._li.computeIntersection(this._s0, this._s1, this._s1, this._s2), this._li.getIntersectionNum() >= 2 && (this._bufParams.getJoinStyle() === Y.JOIN_BEVEL || this._bufParams.getJoinStyle() === Y.JOIN_MITRE ? (t && this._segList.addPt(this._offset0.p1), this._segList.addPt(this._offset1.p0)) : this.addCornerFillet(this._s1, this._offset0.p1, this._offset1.p0, pt.CLOCKWISE, this._distance));
        } }, { key: "closeRing", value: function() {
          this._segList.closeRing();
        } }, { key: "hasNarrowConcaveAngle", value: function() {
          return this._hasNarrowConcaveAngle;
        } }], [{ key: "constructor_", value: function() {
          this._maxCurveSegmentError = 0, this._filletAngleQuantum = null, this._closingSegLengthFactor = 1, this._segList = null, this._distance = 0, this._precisionModel = null, this._bufParams = null, this._li = null, this._s0 = null, this._s1 = null, this._s2 = null, this._seg0 = new pe(), this._seg1 = new pe(), this._offset0 = new pe(), this._offset1 = new pe(), this._side = 0, this._hasNarrowConcaveAngle = !1;
          var t = arguments[0], e = arguments[1], s = arguments[2];
          this._precisionModel = t, this._bufParams = e, this._li = new qn(), this._filletAngleQuantum = Math.PI / 2 / e.getQuadrantSegments(), e.getQuadrantSegments() >= 8 && e.getJoinStyle() === Y.JOIN_ROUND && (this._closingSegLengthFactor = u.MAX_CLOSING_SEG_LEN_FACTOR), this.init(s);
        } }]);
      }();
      yn.OFFSET_SEGMENT_SEPARATION_FACTOR = 1e-3, yn.INSIDE_TURN_VERTEX_SNAP_DISTANCE_FACTOR = 1e-3, yn.CURVE_VERTEX_SNAP_DISTANCE_FACTOR = 1e-6, yn.MAX_CLOSING_SEG_LEN_FACTOR = 80;
      var Wo = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getOffsetCurve", value: function(t, e) {
          if (this._distance = e, e === 0) return null;
          var s = e < 0, h = Math.abs(e), v = this.getSegGen(h);
          t.length <= 1 ? this.computePointCurve(t[0], v) : this.computeOffsetCurve(t, s, v);
          var m = v.getCoordinates();
          return s && re.reverse(m), m;
        } }, { key: "computeSingleSidedBufferCurve", value: function(t, e, s) {
          var h = this.simplifyTolerance(this._distance);
          if (e) {
            s.addSegments(t, !0);
            var v = hn.simplify(t, -h), m = v.length - 1;
            s.initSideSegments(v[m], v[m - 1], tt.LEFT), s.addFirstSegment();
            for (var E = m - 2; E >= 0; E--) s.addNextSegment(v[E], !0);
          } else {
            s.addSegments(t, !1);
            var N = hn.simplify(t, h), R = N.length - 1;
            s.initSideSegments(N[0], N[1], tt.LEFT), s.addFirstSegment();
            for (var D = 2; D <= R; D++) s.addNextSegment(N[D], !0);
          }
          s.addLastSegment(), s.closeRing();
        } }, { key: "computeRingBufferCurve", value: function(t, e, s) {
          var h = this.simplifyTolerance(this._distance);
          e === tt.RIGHT && (h = -h);
          var v = hn.simplify(t, h), m = v.length - 1;
          s.initSideSegments(v[m - 1], v[0], e);
          for (var E = 1; E <= m; E++) {
            var N = E !== 1;
            s.addNextSegment(v[E], N);
          }
          s.closeRing();
        } }, { key: "computeLineBufferCurve", value: function(t, e) {
          var s = this.simplifyTolerance(this._distance), h = hn.simplify(t, s), v = h.length - 1;
          e.initSideSegments(h[0], h[1], tt.LEFT);
          for (var m = 2; m <= v; m++) e.addNextSegment(h[m], !0);
          e.addLastSegment(), e.addLineEndCap(h[v - 1], h[v]);
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
          var s = Math.abs(e), h = this.getSegGen(s);
          if (t.length <= 1) this.computePointCurve(t[0], h);
          else if (this._bufParams.isSingleSided()) {
            var v = e < 0;
            this.computeSingleSidedBufferCurve(t, v, h);
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
            var v = hn.simplify(t, -h), m = v.length - 1;
            s.initSideSegments(v[m], v[m - 1], tt.LEFT), s.addFirstSegment();
            for (var E = m - 2; E >= 0; E--) s.addNextSegment(v[E], !0);
          } else {
            var N = hn.simplify(t, h), R = N.length - 1;
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
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "findStabbedSegments", value: function() {
          if (arguments.length === 1) {
            for (var u = arguments[0], t = new mt(), e = this._subgraphs.iterator(); e.hasNext(); ) {
              var s = e.next(), h = s.getEnvelope();
              u.y < h.getMinY() || u.y > h.getMaxY() || this.findStabbedSegments(u, s.getDirectedEdges(), t);
            }
            return t;
          }
          if (arguments.length === 3) {
            if (wt(arguments[2], sn) && arguments[0] instanceof U && arguments[1] instanceof Ls) {
              for (var v = arguments[0], m = arguments[1], E = arguments[2], N = m.getEdge().getCoordinates(), R = 0; R < N.length - 1; R++)
                if (this._seg.p0 = N[R], this._seg.p1 = N[R + 1], this._seg.p0.y > this._seg.p1.y && this._seg.reverse(), !(Math.max(this._seg.p0.x, this._seg.p1.x) < v.x || this._seg.isHorizontal() || v.y < this._seg.p0.y || v.y > this._seg.p1.y || pt.index(this._seg.p0, this._seg.p1, v) === pt.RIGHT)) {
                  var D = m.getDepth(tt.LEFT);
                  this._seg.p0.equals(N[R]) || (D = m.getDepth(tt.RIGHT));
                  var q = new Ws(this._seg, D);
                  E.add(q);
                }
            } else if (wt(arguments[2], sn) && arguments[0] instanceof U && wt(arguments[1], sn)) for (var Z = arguments[0], rt = arguments[2], ot = arguments[1].iterator(); ot.hasNext(); ) {
              var gt = ot.next();
              gt.isForward() && this.findStabbedSegments(Z, gt, rt);
            }
          }
        } }, { key: "getDepth", value: function(u) {
          var t = this.findStabbedSegments(u);
          return t.size() === 0 ? 0 : oi.min(t)._leftDepth;
        } }], [{ key: "constructor_", value: function() {
          this._subgraphs = null, this._seg = new pe();
          var u = arguments[0];
          this._subgraphs = u;
        } }]);
      }(), Ws = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
          return [K];
        } }], [{ key: "constructor_", value: function() {
          this._upwardSeg = null, this._leftDepth = null;
          var u = arguments[0], t = arguments[1];
          this._upwardSeg = new pe(u), this._leftDepth = t;
        } }]);
      }();
      Xs.DepthSegment = Ws;
      var Dr = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, null, [{ key: "constructor_", value: function() {
          W.constructor_.call(this, "Projective point not representable on the Cartesian plane.");
        } }]);
      }(W), er = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "getY", value: function() {
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
            } else if (arguments[0] instanceof u && arguments[1] instanceof u) {
              var h = arguments[0], v = arguments[1];
              this.x = h.y * v.w - v.y * h.w, this.y = v.x * h.w - h.x * v.w, this.w = h.x * v.y - v.x * h.y;
            } else if (arguments[0] instanceof U && arguments[1] instanceof U) {
              var m = arguments[0], E = arguments[1];
              this.x = m.y - E.y, this.y = E.x - m.x, this.w = m.x * E.y - E.x * m.y;
            }
          } else if (arguments.length === 3) {
            var N = arguments[0], R = arguments[1], D = arguments[2];
            this.x = N, this.y = R, this.w = D;
          } else if (arguments.length === 4) {
            var q = arguments[0], Z = arguments[1], rt = arguments[2], ot = arguments[3], gt = q.y - Z.y, bt = Z.x - q.x, lt = q.x * Z.y - Z.x * q.y, Wt = rt.y - ot.y, ce = ot.x - rt.x, se = rt.x * ot.y - ot.x * rt.y;
            this.x = bt * se - ce * lt, this.y = Wt * lt - gt * se, this.w = gt * ce - Wt * bt;
          }
        } }]);
      }(), gu = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "area", value: function() {
          return u.area(this.p0, this.p1, this.p2);
        } }, { key: "signedArea", value: function() {
          return u.signedArea(this.p0, this.p1, this.p2);
        } }, { key: "interpolateZ", value: function(t) {
          if (t === null) throw new X("Supplied point is null.");
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
          var v = e.x, m = e.y, E = s.x - v, N = h.x - v, R = s.y - m, D = h.y - m, q = E * D - N * R, Z = t.x - v, rt = t.y - m, ot = (D * Z - N * rt) / q, gt = (-R * Z + E * rt) / q;
          return e.getZ() + ot * (s.getZ() - e.getZ()) + gt * (h.getZ() - e.getZ());
        } }, { key: "longestSideLength", value: function(t, e, s) {
          var h = t.distance(e), v = e.distance(s), m = s.distance(t), E = h;
          return v > E && (E = v), m > E && (E = m), E;
        } }, { key: "circumcentreDD", value: function(t, e, s) {
          var h = dt.valueOf(t.x).subtract(s.x), v = dt.valueOf(t.y).subtract(s.y), m = dt.valueOf(e.x).subtract(s.x), E = dt.valueOf(e.y).subtract(s.y), N = dt.determinant(h, v, m, E).multiply(2), R = h.sqr().add(v.sqr()), D = m.sqr().add(E.sqr()), q = dt.determinant(v, R, E, D), Z = dt.determinant(h, R, m, D), rt = dt.valueOf(s.x).subtract(q.divide(N)).doubleValue(), ot = dt.valueOf(s.y).add(Z.divide(N)).doubleValue();
          return new U(rt, ot);
        } }, { key: "isAcute", value: function(t, e, s) {
          return !!_e.isAcute(t, e, s) && !!_e.isAcute(e, s, t) && !!_e.isAcute(s, t, e);
        } }, { key: "circumcentre", value: function(t, e, s) {
          var h = s.x, v = s.y, m = t.x - h, E = t.y - v, N = e.x - h, R = e.y - v, D = 2 * u.det(m, E, N, R), q = u.det(E, m * m + E * E, R, N * N + R * R), Z = u.det(m, m * m + E * E, N, N * N + R * R);
          return new U(h - q / D, v + Z / D);
        } }, { key: "perpendicularBisector", value: function(t, e) {
          var s = e.x - t.x, h = e.y - t.y, v = new er(t.x + s / 2, t.y + h / 2, 1), m = new er(t.x - h + s / 2, t.y + s + h / 2, 1);
          return new er(v, m);
        } }, { key: "angleBisector", value: function(t, e, s) {
          var h = e.distance(t), v = h / (h + e.distance(s)), m = s.x - t.x, E = s.y - t.y;
          return new U(t.x + v * m, t.y + v * E);
        } }, { key: "area3D", value: function(t, e, s) {
          var h = e.x - t.x, v = e.y - t.y, m = e.getZ() - t.getZ(), E = s.x - t.x, N = s.y - t.y, R = s.getZ() - t.getZ(), D = v * R - m * N, q = m * E - h * R, Z = h * N - v * E, rt = D * D + q * q + Z * Z, ot = Math.sqrt(rt) / 2;
          return ot;
        } }, { key: "centroid", value: function(t, e, s) {
          var h = (t.x + e.x + s.x) / 3, v = (t.y + e.y + s.y) / 3;
          return new U(h, v);
        } }, { key: "inCentre", value: function(t, e, s) {
          var h = e.distance(s), v = t.distance(s), m = t.distance(e), E = h + v + m, N = (h * t.x + v * e.x + m * s.x) / E, R = (h * t.y + v * e.y + m * s.y) / E;
          return new U(N, R);
        } }]);
      }(), $o = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "addRingSide", value: function(u, t, e, s, h) {
          if (t === 0 && u.length < Ii.MINIMUM_VALID_SIZE) return null;
          var v = s, m = h;
          u.length >= Ii.MINIMUM_VALID_SIZE && pt.isCCW(u) && (v = h, m = s, e = tt.opposite(e));
          var E = this._curveBuilder.getRingCurve(u, e, t);
          this.addCurve(E, v, m);
        } }, { key: "addRingBothSides", value: function(u, t) {
          this.addRingSide(u, t, tt.LEFT, T.EXTERIOR, T.INTERIOR), this.addRingSide(u, t, tt.RIGHT, T.INTERIOR, T.EXTERIOR);
        } }, { key: "addPoint", value: function(u) {
          if (this._distance <= 0) return null;
          var t = u.getCoordinates(), e = this._curveBuilder.getLineCurve(t, this._distance);
          this.addCurve(e, T.EXTERIOR, T.INTERIOR);
        } }, { key: "addPolygon", value: function(u) {
          var t = this._distance, e = tt.LEFT;
          this._distance < 0 && (t = -this._distance, e = tt.RIGHT);
          var s = u.getExteriorRing(), h = re.removeRepeatedPoints(s.getCoordinates());
          if (this._distance < 0 && this.isErodedCompletely(s, this._distance) || this._distance <= 0 && h.length < 3) return null;
          this.addRingSide(h, t, e, T.EXTERIOR, T.INTERIOR);
          for (var v = 0; v < u.getNumInteriorRing(); v++) {
            var m = u.getInteriorRingN(v), E = re.removeRepeatedPoints(m.getCoordinates());
            this._distance > 0 && this.isErodedCompletely(m, -this._distance) || this.addRingSide(E, t, tt.opposite(e), T.INTERIOR, T.EXTERIOR);
          }
        } }, { key: "isTriangleErodedCompletely", value: function(u, t) {
          var e = new gu(u[0], u[1], u[2]), s = e.inCentre();
          return un.pointToSegment(s, e.p0, e.p1) < Math.abs(t);
        } }, { key: "addLineString", value: function(u) {
          if (this._curveBuilder.isLineOffsetEmpty(this._distance)) return null;
          var t = re.removeRepeatedPoints(u.getCoordinates());
          if (re.isRing(t) && !this._curveBuilder.getBufferParameters().isSingleSided()) this.addRingBothSides(t, this._distance);
          else {
            var e = this._curveBuilder.getLineCurve(t, this._distance);
            this.addCurve(e, T.EXTERIOR, T.INTERIOR);
          }
        } }, { key: "addCurve", value: function(u, t, e) {
          if (u === null || u.length < 2) return null;
          var s = new mn(u, new We(0, T.BOUNDARY, t, e));
          this._curveList.add(s);
        } }, { key: "getCurves", value: function() {
          return this.add(this._inputGeom), this._curveList;
        } }, { key: "add", value: function(u) {
          if (u.isEmpty()) return null;
          if (u instanceof Cr) this.addPolygon(u);
          else if (u instanceof Ki) this.addLineString(u);
          else if (u instanceof xs) this.addPoint(u);
          else if (u instanceof Ms) this.addCollection(u);
          else if (u instanceof ks) this.addCollection(u);
          else if (u instanceof Is) this.addCollection(u);
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
          this._inputGeom = null, this._distance = null, this._curveBuilder = null, this._curveList = new mt();
          var u = arguments[0], t = arguments[1], e = arguments[2];
          this._inputGeom = u, this._distance = t, this._curveBuilder = e;
        } }]);
      }(), $s = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "locate", value: function(u) {
        } }]);
      }(), Hs = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "next", value: function() {
          if (this._atStart) return this._atStart = !1, u.isAtomic(this._parent) && this._index++, this._parent;
          if (this._subcollectionIterator !== null) {
            if (this._subcollectionIterator.hasNext()) return this._subcollectionIterator.next();
            this._subcollectionIterator = null;
          }
          if (this._index >= this._max) throw new Se();
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
          return [Yo];
        } }], [{ key: "constructor_", value: function() {
          this._parent = null, this._atStart = null, this._max = null, this._index = null, this._subcollectionIterator = null;
          var t = arguments[0];
          this._parent = t, this._atStart = !0, this._index = 0, this._max = t.getNumGeometries();
        } }, { key: "isAtomic", value: function(t) {
          return !(t instanceof Ce);
        } }]);
      }(), Ho = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "locate", value: function(t) {
          return u.locate(t, this._geom);
        } }, { key: "interfaces_", get: function() {
          return [$s];
        } }], [{ key: "constructor_", value: function() {
          this._geom = null;
          var t = arguments[0];
          this._geom = t;
        } }, { key: "locatePointInPolygon", value: function(t, e) {
          if (e.isEmpty()) return T.EXTERIOR;
          var s = e.getExteriorRing(), h = u.locatePointInRing(t, s);
          if (h !== T.INTERIOR) return h;
          for (var v = 0; v < e.getNumInteriorRing(); v++) {
            var m = e.getInteriorRingN(v), E = u.locatePointInRing(t, m);
            if (E === T.BOUNDARY) return T.BOUNDARY;
            if (E === T.INTERIOR) return T.EXTERIOR;
          }
          return T.INTERIOR;
        } }, { key: "locatePointInRing", value: function(t, e) {
          return e.getEnvelopeInternal().intersects(t) ? Rs.locateInRing(t, e.getCoordinates()) : T.EXTERIOR;
        } }, { key: "containsPointInPolygon", value: function(t, e) {
          return T.EXTERIOR !== u.locatePointInPolygon(t, e);
        } }, { key: "locateInGeometry", value: function(t, e) {
          if (e instanceof Cr) return u.locatePointInPolygon(t, e);
          if (e instanceof Ce) for (var s = new Hs(e); s.hasNext(); ) {
            var h = s.next();
            if (h !== e) {
              var v = u.locateInGeometry(t, h);
              if (v !== T.EXTERIOR) return v;
            }
          }
          return T.EXTERIOR;
        } }, { key: "isContained", value: function(t, e) {
          return T.EXTERIOR !== u.locate(t, e);
        } }, { key: "locate", value: function(t, e) {
          return e.isEmpty() ? T.EXTERIOR : e.getEnvelopeInternal().intersects(t) ? u.locateInGeometry(t, e) : T.EXTERIOR;
        } }]);
      }(), vu = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "getNextCW", value: function(u) {
          this.getEdges();
          var t = this._edgeList.indexOf(u), e = t - 1;
          return t === 0 && (e = this._edgeList.size() - 1), this._edgeList.get(e);
        } }, { key: "propagateSideLabels", value: function(u) {
          for (var t = T.NONE, e = this.iterator(); e.hasNext(); ) {
            var s = e.next().getLabel();
            s.isArea(u) && s.getLocation(u, tt.LEFT) !== T.NONE && (t = s.getLocation(u, tt.LEFT));
          }
          if (t === T.NONE) return null;
          for (var h = t, v = this.iterator(); v.hasNext(); ) {
            var m = v.next(), E = m.getLabel();
            if (E.getLocation(u, tt.ON) === T.NONE && E.setLocation(u, tt.ON, h), E.isArea(u)) {
              var N = E.getLocation(u, tt.LEFT), R = E.getLocation(u, tt.RIGHT);
              if (R !== T.NONE) {
                if (R !== h) throw new an("side location conflict", m.getCoordinate());
                N === T.NONE && Nt.shouldNeverReachHere("found single null side (at " + m.getCoordinate() + ")"), h = N;
              } else Nt.isTrue(E.getLocation(u, tt.LEFT) === T.NONE, "found single null side"), E.setLocation(u, tt.RIGHT, h), E.setLocation(u, tt.LEFT, h);
            }
          }
        } }, { key: "getCoordinate", value: function() {
          var u = this.iterator();
          return u.hasNext() ? u.next().getCoordinate() : null;
        } }, { key: "print", value: function(u) {
          Ue.out.println("EdgeEndStar:   " + this.getCoordinate());
          for (var t = this.iterator(); t.hasNext(); )
            t.next().print(u);
        } }, { key: "isAreaLabelsConsistent", value: function(u) {
          return this.computeEdgeEndLabels(u.getBoundaryNodeRule()), this.checkAreaLabelsConsistent(0);
        } }, { key: "checkAreaLabelsConsistent", value: function(u) {
          var t = this.getEdges();
          if (t.size() <= 0) return !0;
          var e = t.size() - 1, s = t.get(e).getLabel().getLocation(u, tt.LEFT);
          Nt.isTrue(s !== T.NONE, "Found unlabelled area edge");
          for (var h = s, v = this.iterator(); v.hasNext(); ) {
            var m = v.next().getLabel();
            Nt.isTrue(m.isArea(u), "Found non-area edge");
            var E = m.getLocation(u, tt.LEFT), N = m.getLocation(u, tt.RIGHT);
            if (E === N || N !== h) return !1;
            h = E;
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
          return this._edgeList === null && (this._edgeList = new mt(this._edgeMap.values())), this._edgeList;
        } }, { key: "getLocation", value: function(u, t, e) {
          return this._ptInAreaLocation[u] === T.NONE && (this._ptInAreaLocation[u] = Ho.locate(t, e[u].getGeometry())), this._ptInAreaLocation[u];
        } }, { key: "toString", value: function() {
          var u = new Pn();
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
          for (var t = [!1, !1], e = this.iterator(); e.hasNext(); ) for (var s = e.next().getLabel(), h = 0; h < 2; h++) s.isLine(h) && s.getLocation(h) === T.BOUNDARY && (t[h] = !0);
          for (var v = this.iterator(); v.hasNext(); ) for (var m = v.next(), E = m.getLabel(), N = 0; N < 2; N++) if (E.isAnyNull(N)) {
            var R = T.NONE;
            if (t[N]) R = T.EXTERIOR;
            else {
              var D = m.getCoordinate();
              R = this.getLocation(N, D, u);
            }
            E.setAllLocationsIfNull(N, R);
          }
        } }, { key: "getDegree", value: function() {
          return this._edgeMap.size();
        } }, { key: "insertEdgeEnd", value: function(u, t) {
          this._edgeMap.put(u, t), this._edgeList = null;
        } }], [{ key: "constructor_", value: function() {
          this._edgeMap = new Bt(), this._edgeList = null, this._ptInAreaLocation = [T.NONE, T.NONE];
        } }]);
      }(), Re = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "linkResultDirectedEdges", value: function() {
          this.getResultAreaEdges();
          for (var e = null, s = null, h = this._SCANNING_FOR_INCOMING, v = 0; v < this._resultAreaEdgeList.size(); v++) {
            var m = this._resultAreaEdgeList.get(v), E = m.getSym();
            if (m.getLabel().isArea()) switch (e === null && m.isInResult() && (e = m), h) {
              case this._SCANNING_FOR_INCOMING:
                if (!E.isInResult()) continue;
                s = E, h = this._LINKING_TO_OUTGOING;
                break;
              case this._LINKING_TO_OUTGOING:
                if (!m.isInResult()) continue;
                s.setNext(m), h = this._SCANNING_FOR_INCOMING;
            }
          }
          if (h === this._LINKING_TO_OUTGOING) {
            if (e === null) throw new an("no outgoing dirEdge found", this.getCoordinate());
            Nt.isTrue(e.isInResult(), "unable to link last incoming dirEdge"), s.setNext(e);
          }
        } }, { key: "insert", value: function(e) {
          var s = e;
          this.insertEdgeEnd(s, s);
        } }, { key: "getRightmostEdge", value: function() {
          var e = this.getEdges(), s = e.size();
          if (s < 1) return null;
          var h = e.get(0);
          if (s === 1) return h;
          var v = e.get(s - 1), m = h.getQuadrant(), E = v.getQuadrant();
          return ye.isNorthern(m) && ye.isNorthern(E) ? h : ye.isNorthern(m) || ye.isNorthern(E) ? h.getDy() !== 0 ? h : v.getDy() !== 0 ? v : (Nt.shouldNeverReachHere("found two horizontal edges incident on node"), null) : v;
        } }, { key: "print", value: function(e) {
          Ue.out.println("DirectedEdgeStar: " + this.getCoordinate());
          for (var s = this.iterator(); s.hasNext(); ) {
            var h = s.next();
            e.print("out "), h.print(e), e.println(), e.print("in "), h.getSym().print(e), e.println();
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
            var h = s.next().getLabel();
            h.setAllLocationsIfNull(0, e.getLocation(0)), h.setAllLocationsIfNull(1, e.getLocation(1));
          }
        } }, { key: "linkAllDirectedEdges", value: function() {
          this.getEdges();
          for (var e = null, s = null, h = this._edgeList.size() - 1; h >= 0; h--) {
            var v = this._edgeList.get(h), m = v.getSym();
            s === null && (s = m), e !== null && m.setNext(e), e = v;
          }
          s.setNext(e);
        } }, { key: "computeDepths", value: function() {
          if (arguments.length === 1) {
            var e = arguments[0], s = this.findIndex(e), h = e.getDepth(tt.LEFT), v = e.getDepth(tt.RIGHT), m = this.computeDepths(s + 1, this._edgeList.size(), h);
            if (this.computeDepths(0, s, m) !== v) throw new an("depth mismatch at " + e.getCoordinate());
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
          for (var s = null, h = null, v = this._SCANNING_FOR_INCOMING, m = this._resultAreaEdgeList.size() - 1; m >= 0; m--) {
            var E = this._resultAreaEdgeList.get(m), N = E.getSym();
            switch (s === null && E.getEdgeRing() === e && (s = E), v) {
              case this._SCANNING_FOR_INCOMING:
                if (N.getEdgeRing() !== e) continue;
                h = N, v = this._LINKING_TO_OUTGOING;
                break;
              case this._LINKING_TO_OUTGOING:
                if (E.getEdgeRing() !== e) continue;
                h.setNextMin(E), v = this._SCANNING_FOR_INCOMING;
            }
          }
          v === this._LINKING_TO_OUTGOING && (Nt.isTrue(s !== null, "found null for first outgoing dirEdge"), Nt.isTrue(s.getEdgeRing() === e, "unable to link last incoming dirEdge"), h.setNextMin(s));
        } }, { key: "getOutgoingDegree", value: function() {
          if (arguments.length === 0) {
            for (var e = 0, s = this.iterator(); s.hasNext(); )
              s.next().isInResult() && e++;
            return e;
          }
          if (arguments.length === 1) {
            for (var h = arguments[0], v = 0, m = this.iterator(); m.hasNext(); )
              m.next().getEdgeRing() === h && v++;
            return v;
          }
        } }, { key: "getLabel", value: function() {
          return this._label;
        } }, { key: "findCoveredLineEdges", value: function() {
          for (var e = T.NONE, s = this.iterator(); s.hasNext(); ) {
            var h = s.next(), v = h.getSym();
            if (!h.isLineEdge()) {
              if (h.isInResult()) {
                e = T.INTERIOR;
                break;
              }
              if (v.isInResult()) {
                e = T.EXTERIOR;
                break;
              }
            }
          }
          if (e === T.NONE) return null;
          for (var m = e, E = this.iterator(); E.hasNext(); ) {
            var N = E.next(), R = N.getSym();
            N.isLineEdge() ? N.getEdge().setCovered(m === T.INTERIOR) : (N.isInResult() && (m = T.EXTERIOR), R.isInResult() && (m = T.INTERIOR));
          }
        } }, { key: "computeLabelling", value: function(e) {
          C(t, "computeLabelling", this, 1).call(this, e), this._label = new We(T.NONE);
          for (var s = this.iterator(); s.hasNext(); ) for (var h = s.next().getEdge().getLabel(), v = 0; v < 2; v++) {
            var m = h.getLocation(v);
            m !== T.INTERIOR && m !== T.BOUNDARY || this._label.setLocation(v, T.INTERIOR);
          }
        } }], [{ key: "constructor_", value: function() {
          this._resultAreaEdgeList = null, this._label = null, this._SCANNING_FOR_INCOMING = 1, this._LINKING_TO_OUTGOING = 2;
        } }]);
      }(vu), Vs = function(u) {
        function t() {
          return f(this, t), l(this, t);
        }
        return x(t, u), g(t, [{ key: "createNode", value: function(e) {
          return new Or(e, new Re());
        } }]);
      }(uu), Pi = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "compareTo", value: function(t) {
          var e = t;
          return u.compareOriented(this._pts, this._orientation, e._pts, e._orientation);
        } }, { key: "interfaces_", get: function() {
          return [K];
        } }], [{ key: "constructor_", value: function() {
          this._pts = null, this._orientation = null;
          var t = arguments[0];
          this._pts = t, this._orientation = u.orientation(t);
        } }, { key: "orientation", value: function(t) {
          return re.increasingDirection(t) === 1;
        } }, { key: "compareOriented", value: function(t, e, s, h) {
          for (var v = e ? 1 : -1, m = h ? 1 : -1, E = e ? t.length : -1, N = h ? s.length : -1, R = e ? 0 : t.length - 1, D = h ? 0 : s.length - 1; ; ) {
            var q = t[R].compareTo(s[D]);
            if (q !== 0) return q;
            var Z = (R += v) === E, rt = (D += m) === N;
            if (Z && !rt) return -1;
            if (!Z && rt) return 1;
            if (Z && rt) return 0;
          }
        } }]);
      }(), _u = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
          var t = new Pi(u.getCoordinates());
          return this._ocaMap.get(t);
        } }, { key: "add", value: function(u) {
          this._edges.add(u);
          var t = new Pi(u.getCoordinates());
          this._ocaMap.put(t, u);
        } }], [{ key: "constructor_", value: function() {
          this._edges = new mt(), this._ocaMap = new Bt();
        } }]);
      }(), Zs = function() {
        return g(function u() {
          f(this, u);
        }, [{ key: "processIntersections", value: function(u, t, e, s) {
        } }, { key: "isDone", value: function() {
        } }]);
      }(), Vo = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "isTrivialIntersection", value: function(t, e, s, h) {
          if (t === s && this._li.getIntersectionNum() === 1) {
            if (u.isAdjacentSegments(e, h)) return !0;
            if (t.isClosed()) {
              var v = t.size() - 1;
              if (e === 0 && h === v || h === 0 && e === v) return !0;
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
          var v = t.getCoordinates()[e], m = t.getCoordinates()[e + 1], E = s.getCoordinates()[h], N = s.getCoordinates()[h + 1];
          this._li.computeIntersection(v, m, E, N), this._li.hasIntersection() && (this.numIntersections++, this._li.isInteriorIntersection() && (this.numInteriorIntersections++, this._hasInterior = !0), this.isTrivialIntersection(t, e, s, h) || (this._hasIntersection = !0, t.addIntersections(this._li, e, 0), s.addIntersections(this._li, h, 1), this._li.isProper() && (this.numProperIntersections++, this._hasProper = !0, this._hasProperInterior = !0)));
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
      }(), Zo = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
          return [K];
        } }], [{ key: "constructor_", value: function() {
          this.coord = null, this.segmentIndex = null, this.dist = null;
          var u = arguments[0], t = arguments[1], e = arguments[2];
          this.coord = new U(u), this.segmentIndex = t, this.dist = e;
        } }]);
      }(), Ko = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
          var v = new Array(e).fill(null), m = 0;
          v[m++] = new U(u.coord);
          for (var E = u.segmentIndex + 1; E <= t.segmentIndex; E++) v[m++] = this.edge.pts[E];
          return h && (v[m] = t.coord), new Fr(v, new We(this.edge._label));
        } }, { key: "add", value: function(u, t, e) {
          var s = new Zo(u, t, e), h = this._nodeMap.get(s);
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
      }(), Jo = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "isIntersects", value: function() {
          return !this.isDisjoint();
        } }, { key: "isCovers", value: function() {
          return (u.isTrue(this._matrix[T.INTERIOR][T.INTERIOR]) || u.isTrue(this._matrix[T.INTERIOR][T.BOUNDARY]) || u.isTrue(this._matrix[T.BOUNDARY][T.INTERIOR]) || u.isTrue(this._matrix[T.BOUNDARY][T.BOUNDARY])) && this._matrix[T.EXTERIOR][T.INTERIOR] === nt.FALSE && this._matrix[T.EXTERIOR][T.BOUNDARY] === nt.FALSE;
        } }, { key: "isCoveredBy", value: function() {
          return (u.isTrue(this._matrix[T.INTERIOR][T.INTERIOR]) || u.isTrue(this._matrix[T.INTERIOR][T.BOUNDARY]) || u.isTrue(this._matrix[T.BOUNDARY][T.INTERIOR]) || u.isTrue(this._matrix[T.BOUNDARY][T.BOUNDARY])) && this._matrix[T.INTERIOR][T.EXTERIOR] === nt.FALSE && this._matrix[T.BOUNDARY][T.EXTERIOR] === nt.FALSE;
        } }, { key: "set", value: function() {
          if (arguments.length === 1) for (var t = arguments[0], e = 0; e < t.length; e++) {
            var s = Math.trunc(e / 3), h = e % 3;
            this._matrix[s][h] = nt.toDimensionValue(t.charAt(e));
          }
          else if (arguments.length === 3) {
            var v = arguments[0], m = arguments[1], E = arguments[2];
            this._matrix[v][m] = E;
          }
        } }, { key: "isContains", value: function() {
          return u.isTrue(this._matrix[T.INTERIOR][T.INTERIOR]) && this._matrix[T.EXTERIOR][T.INTERIOR] === nt.FALSE && this._matrix[T.EXTERIOR][T.BOUNDARY] === nt.FALSE;
        } }, { key: "setAtLeast", value: function() {
          if (arguments.length === 1) for (var t = arguments[0], e = 0; e < t.length; e++) {
            var s = Math.trunc(e / 3), h = e % 3;
            this.setAtLeast(s, h, nt.toDimensionValue(t.charAt(e)));
          }
          else if (arguments.length === 3) {
            var v = arguments[0], m = arguments[1], E = arguments[2];
            this._matrix[v][m] < E && (this._matrix[v][m] = E);
          }
        } }, { key: "setAtLeastIfValid", value: function(t, e, s) {
          t >= 0 && e >= 0 && this.setAtLeast(t, e, s);
        } }, { key: "isWithin", value: function() {
          return u.isTrue(this._matrix[T.INTERIOR][T.INTERIOR]) && this._matrix[T.INTERIOR][T.EXTERIOR] === nt.FALSE && this._matrix[T.BOUNDARY][T.EXTERIOR] === nt.FALSE;
        } }, { key: "isTouches", value: function(t, e) {
          return t > e ? this.isTouches(e, t) : (t === nt.A && e === nt.A || t === nt.L && e === nt.L || t === nt.L && e === nt.A || t === nt.P && e === nt.A || t === nt.P && e === nt.L) && this._matrix[T.INTERIOR][T.INTERIOR] === nt.FALSE && (u.isTrue(this._matrix[T.INTERIOR][T.BOUNDARY]) || u.isTrue(this._matrix[T.BOUNDARY][T.INTERIOR]) || u.isTrue(this._matrix[T.BOUNDARY][T.BOUNDARY]));
        } }, { key: "isOverlaps", value: function(t, e) {
          return t === nt.P && e === nt.P || t === nt.A && e === nt.A ? u.isTrue(this._matrix[T.INTERIOR][T.INTERIOR]) && u.isTrue(this._matrix[T.INTERIOR][T.EXTERIOR]) && u.isTrue(this._matrix[T.EXTERIOR][T.INTERIOR]) : t === nt.L && e === nt.L && this._matrix[T.INTERIOR][T.INTERIOR] === 1 && u.isTrue(this._matrix[T.INTERIOR][T.EXTERIOR]) && u.isTrue(this._matrix[T.EXTERIOR][T.INTERIOR]);
        } }, { key: "isEquals", value: function(t, e) {
          return t === e && u.isTrue(this._matrix[T.INTERIOR][T.INTERIOR]) && this._matrix[T.INTERIOR][T.EXTERIOR] === nt.FALSE && this._matrix[T.BOUNDARY][T.EXTERIOR] === nt.FALSE && this._matrix[T.EXTERIOR][T.INTERIOR] === nt.FALSE && this._matrix[T.EXTERIOR][T.BOUNDARY] === nt.FALSE;
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
          for (var e = 0; e < 3; e++) for (var s = 0; s < 3; s++) if (!u.matches(this._matrix[e][s], t.charAt(3 * e + s))) return !1;
          return !0;
        } }, { key: "add", value: function(t) {
          for (var e = 0; e < 3; e++) for (var s = 0; s < 3; s++) this.setAtLeast(e, s, t.get(e, s));
        } }, { key: "isDisjoint", value: function() {
          return this._matrix[T.INTERIOR][T.INTERIOR] === nt.FALSE && this._matrix[T.INTERIOR][T.BOUNDARY] === nt.FALSE && this._matrix[T.BOUNDARY][T.INTERIOR] === nt.FALSE && this._matrix[T.BOUNDARY][T.BOUNDARY] === nt.FALSE;
        } }, { key: "isCrosses", value: function(t, e) {
          return t === nt.P && e === nt.L || t === nt.P && e === nt.A || t === nt.L && e === nt.A ? u.isTrue(this._matrix[T.INTERIOR][T.INTERIOR]) && u.isTrue(this._matrix[T.INTERIOR][T.EXTERIOR]) : t === nt.L && e === nt.P || t === nt.A && e === nt.P || t === nt.A && e === nt.L ? u.isTrue(this._matrix[T.INTERIOR][T.INTERIOR]) && u.isTrue(this._matrix[T.EXTERIOR][T.INTERIOR]) : t === nt.L && e === nt.L && this._matrix[T.INTERIOR][T.INTERIOR] === 0;
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
              u.constructor_.call(this), this._matrix[T.INTERIOR][T.INTERIOR] = e._matrix[T.INTERIOR][T.INTERIOR], this._matrix[T.INTERIOR][T.BOUNDARY] = e._matrix[T.INTERIOR][T.BOUNDARY], this._matrix[T.INTERIOR][T.EXTERIOR] = e._matrix[T.INTERIOR][T.EXTERIOR], this._matrix[T.BOUNDARY][T.INTERIOR] = e._matrix[T.BOUNDARY][T.INTERIOR], this._matrix[T.BOUNDARY][T.BOUNDARY] = e._matrix[T.BOUNDARY][T.BOUNDARY], this._matrix[T.BOUNDARY][T.EXTERIOR] = e._matrix[T.BOUNDARY][T.EXTERIOR], this._matrix[T.EXTERIOR][T.INTERIOR] = e._matrix[T.EXTERIOR][T.INTERIOR], this._matrix[T.EXTERIOR][T.BOUNDARY] = e._matrix[T.EXTERIOR][T.BOUNDARY], this._matrix[T.EXTERIOR][T.EXTERIOR] = e._matrix[T.EXTERIOR][T.EXTERIOR];
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
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "size", value: function() {
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
          if (this._data = null, this._size = 0, arguments.length === 0) u.constructor_.call(this, 10);
          else if (arguments.length === 1) {
            var t = arguments[0];
            this._data = new Array(t).fill(null);
          }
        } }]);
      }(), Ci = function() {
        function u() {
          f(this, u);
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
          for (var s = ye.quadrant(t[e], t[e + 1]), h = e + 1; h < t.length && ye.quadrant(t[h - 1], t[h]) === s; )
            h++;
          return h - 1;
        } }, { key: "OLDgetChainStartIndices", value: function(t) {
          var e = 0, s = new mt();
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
      }(), jo = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
            var h = arguments[0], v = arguments[1], m = arguments[2], E = arguments[3], N = arguments[4], R = arguments[5];
            if (v - h == 1 && N - E == 1) return R.addIntersections(this.e, h, m.e, E), null;
            if (!this.overlaps(h, v, m, E, N)) return null;
            var D = Math.trunc((h + v) / 2), q = Math.trunc((E + N) / 2);
            h < D && (E < q && this.computeIntersectsForChain(h, D, m, E, q, R), q < N && this.computeIntersectsForChain(h, D, m, q, N, R)), D < v && (E < q && this.computeIntersectsForChain(D, v, m, E, q, R), q < N && this.computeIntersectsForChain(D, v, m, q, N, R));
          }
        } }, { key: "overlaps", value: function(u, t, e, s, h) {
          return Ht.intersects(this.pts[u], this.pts[t], e.pts[s], e.pts[h]);
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
      }(), du = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
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
            var h = arguments[0], v = arguments[1];
            return this._depth[h][v] === u.NULL_VALUE;
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
          return this._depth[t][e] <= 0 ? T.EXTERIOR : T.INTERIOR;
        } }, { key: "toString", value: function() {
          return "A: " + this._depth[0][1] + "," + this._depth[0][2] + " B: " + this._depth[1][1] + "," + this._depth[1][2];
        } }, { key: "add", value: function() {
          if (arguments.length === 1) for (var t = arguments[0], e = 0; e < 2; e++) for (var s = 1; s < 3; s++) {
            var h = t.getLocation(e, s);
            h !== T.EXTERIOR && h !== T.INTERIOR || (this.isNull(e, s) ? this._depth[e][s] = u.depthAtLocation(h) : this._depth[e][s] += u.depthAtLocation(h));
          }
          else if (arguments.length === 3) {
            var v = arguments[0], m = arguments[1];
            arguments[2] === T.INTERIOR && this._depth[v][m]++;
          }
        } }], [{ key: "constructor_", value: function() {
          this._depth = Array(2).fill().map(function() {
            return Array(3);
          });
          for (var t = 0; t < 2; t++) for (var e = 0; e < 3; e++) this._depth[t][e] = u.NULL_VALUE;
        } }, { key: "depthAtLocation", value: function(t) {
          return t === T.EXTERIOR ? 0 : t === T.INTERIOR ? 1 : u.NULL_VALUE;
        } }]);
      }();
      du.NULL_VALUE = -1;
      var Fr = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "getDepth", value: function() {
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
          for (var h = !0, v = !0, m = this.pts.length, E = 0; E < this.pts.length; E++) if (this.pts[E].equals2D(s.pts[E]) || (h = !1), this.pts[E].equals2D(s.pts[--m]) || (v = !1), !h && !v) return !1;
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
          return this._mce === null && (this._mce = new jo(this)), this._mce;
        } }, { key: "getEnvelope", value: function() {
          if (this._env === null) {
            this._env = new Ht();
            for (var e = 0; e < this.pts.length; e++) this._env.expandToInclude(this.pts[e]);
          }
          return this._env;
        } }, { key: "addIntersection", value: function(e, s, h, v) {
          var m = new U(e.getIntersection(v)), E = s, N = e.getEdgeDistance(h, v), R = E + 1;
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
        } }, { key: "addIntersections", value: function(e, s, h) {
          for (var v = 0; v < e.getIntersectionNum(); v++) this.addIntersection(e, s, h, v);
        } }], [{ key: "constructor_", value: function() {
          if (this.pts = null, this._env = null, this.eiList = new Ko(this), this._name = null, this._mce = null, this._isIsolated = !0, this._depth = new du(), this._depthDelta = 0, arguments.length === 1) {
            var e = arguments[0];
            t.constructor_.call(this, e, null);
          } else if (arguments.length === 2) {
            var s = arguments[0], h = arguments[1];
            this.pts = s, this._label = h;
          }
        } }, { key: "updateIM", value: function() {
          if (!(arguments.length === 2 && arguments[1] instanceof Jo && arguments[0] instanceof We)) return C(t, "updateIM", this).apply(this, arguments);
          var e = arguments[0], s = arguments[1];
          s.setAtLeastIfValid(e.getLocation(0, tt.ON), e.getLocation(1, tt.ON), 1), e.isArea() && (s.setAtLeastIfValid(e.getLocation(0, tt.LEFT), e.getLocation(1, tt.LEFT), 2), s.setAtLeastIfValid(e.getLocation(0, tt.RIGHT), e.getLocation(1, tt.RIGHT), 2));
        } }]);
      }(iu), Ks = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "setWorkingPrecisionModel", value: function(t) {
          this._workingPrecisionModel = t;
        } }, { key: "insertUniqueEdge", value: function(t) {
          var e = this._edgeList.findEqualEdge(t);
          if (e !== null) {
            var s = e.getLabel(), h = t.getLabel();
            e.isPointwiseEqual(t) || (h = new We(t.getLabel())).flip(), s.merge(h);
            var v = u.depthDelta(h), m = e.getDepthDelta() + v;
            e.setDepthDelta(m);
          } else this._edgeList.add(t), t.setDepthDelta(u.depthDelta(t.getLabel()));
        } }, { key: "buildSubgraphs", value: function(t, e) {
          for (var s = new mt(), h = t.iterator(); h.hasNext(); ) {
            var v = h.next(), m = v.getRightmostCoordinate(), E = new Xs(s).getDepth(m);
            v.computeDepth(E), v.findResultEdges(), s.add(v), e.add(v.getDirectedEdges(), v.getNodes());
          }
        } }, { key: "createSubgraphs", value: function(t) {
          for (var e = new mt(), s = t.getNodes().iterator(); s.hasNext(); ) {
            var h = s.next();
            if (!h.isVisited()) {
              var v = new ys();
              v.create(h), e.add(v);
            }
          }
          return oi.sort(e, oi.reverseOrder()), e;
        } }, { key: "createEmptyResultGeometry", value: function() {
          return this._geomFact.createPolygon();
        } }, { key: "getNoder", value: function(t) {
          if (this._workingNoder !== null) return this._workingNoder;
          var e = new zs(), s = new qn();
          return s.setPrecisionModel(t), e.setSegmentIntersector(new Vo(s)), e;
        } }, { key: "buffer", value: function(t, e) {
          var s = this._workingPrecisionModel;
          s === null && (s = t.getPrecisionModel()), this._geomFact = t.getFactory();
          var h = new Wo(s, this._bufParams), v = new $o(t, e, h).getCurves();
          if (v.size() <= 0) return this.createEmptyResultGeometry();
          this.computeNodedEdges(v, s), this._graph = new ou(new Vs()), this._graph.addEdges(this._edgeList.getEdges());
          var m = this.createSubgraphs(this._graph), E = new zo(this._geomFact);
          this.buildSubgraphs(m, E);
          var N = E.getPolygons();
          return N.size() <= 0 ? this.createEmptyResultGeometry() : this._geomFact.buildGeometry(N);
        } }, { key: "computeNodedEdges", value: function(t, e) {
          var s = this.getNoder(e);
          s.computeNodes(t);
          for (var h = s.getNodedSubstrings().iterator(); h.hasNext(); ) {
            var v = h.next(), m = v.getCoordinates();
            if (m.length !== 2 || !m[0].equals2D(m[1])) {
              var E = v.getData(), N = new Fr(v.getCoordinates(), new We(E));
              this.insertUniqueEdge(N);
            }
          }
        } }, { key: "setNoder", value: function(t) {
          this._workingNoder = t;
        } }], [{ key: "constructor_", value: function() {
          this._bufParams = null, this._workingPrecisionModel = null, this._workingNoder = null, this._geomFact = null, this._graph = null, this._edgeList = new _u();
          var t = arguments[0];
          this._bufParams = t;
        } }, { key: "depthDelta", value: function(t) {
          var e = t.getLocation(0, tt.LEFT), s = t.getLocation(0, tt.RIGHT);
          return e === T.INTERIOR && s === T.EXTERIOR ? 1 : e === T.EXTERIOR && s === T.INTERIOR ? -1 : 0;
        } }, { key: "convertSegStrings", value: function(t) {
          for (var e = new ki(), s = new mt(); t.hasNext(); ) {
            var h = t.next(), v = e.createLineString(h.getCoordinates());
            s.add(v);
          }
          return e.buildGeometry(s);
        } }]);
      }(), Un = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "rescale", value: function() {
          if (wt(arguments[0], nn)) for (var t = arguments[0].iterator(); t.hasNext(); ) {
            var e = t.next();
            this.rescale(e.getCoordinates());
          }
          else if (arguments[0] instanceof Array) {
            for (var s = arguments[0], h = 0; h < s.length; h++) s[h].x = s[h].x / this._scaleFactor + this._offsetX, s[h].y = s[h].y / this._scaleFactor + this._offsetY;
            s.length === 2 && s[0].equals2D(s[1]) && Ue.out.println(s);
          }
        } }, { key: "scale", value: function() {
          if (wt(arguments[0], nn)) {
            for (var t = arguments[0], e = new mt(t.size()), s = t.iterator(); s.hasNext(); ) {
              var h = s.next();
              e.add(new mn(this.scale(h.getCoordinates()), h.getData()));
            }
            return e;
          }
          if (arguments[0] instanceof Array) {
            for (var v = arguments[0], m = new Array(v.length).fill(null), E = 0; E < v.length; E++) m[E] = new U(Math.round((v[E].x - this._offsetX) * this._scaleFactor), Math.round((v[E].y - this._offsetY) * this._scaleFactor), v[E].getZ());
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
            u.constructor_.call(this, t, e, 0, 0);
          } else if (arguments.length === 4) {
            var s = arguments[0], h = arguments[1];
            this._noder = s, this._scaleFactor = h, this._isScaled = !this.isIntegerPrecision();
          }
        } }]);
      }(), nr = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "checkEndPtVertexIntersections", value: function() {
          if (arguments.length === 0) for (var t = this._segStrings.iterator(); t.hasNext(); ) {
            var e = t.next().getCoordinates();
            this.checkEndPtVertexIntersections(e[0], this._segStrings), this.checkEndPtVertexIntersections(e[e.length - 1], this._segStrings);
          }
          else if (arguments.length === 2) {
            for (var s = arguments[0], h = arguments[1].iterator(); h.hasNext(); ) for (var v = h.next().getCoordinates(), m = 1; m < v.length - 1; m++) if (v[m].equals(s)) throw new le("found endpt/interior pt intersection at index " + m + " :pt " + s);
          }
        } }, { key: "checkInteriorIntersections", value: function() {
          if (arguments.length === 0) for (var t = this._segStrings.iterator(); t.hasNext(); ) for (var e = t.next(), s = this._segStrings.iterator(); s.hasNext(); ) {
            var h = s.next();
            this.checkInteriorIntersections(e, h);
          }
          else if (arguments.length === 2) for (var v = arguments[0], m = arguments[1], E = v.getCoordinates(), N = m.getCoordinates(), R = 0; R < E.length - 1; R++) for (var D = 0; D < N.length - 1; D++) this.checkInteriorIntersections(v, R, m, D);
          else if (arguments.length === 4) {
            var q = arguments[0], Z = arguments[1], rt = arguments[2], ot = arguments[3];
            if (q === rt && Z === ot) return null;
            var gt = q.getCoordinates()[Z], bt = q.getCoordinates()[Z + 1], lt = rt.getCoordinates()[ot], Wt = rt.getCoordinates()[ot + 1];
            if (this._li.computeIntersection(gt, bt, lt, Wt), this._li.hasIntersection() && (this._li.isProper() || this.hasInteriorIntersection(this._li, gt, bt) || this.hasInteriorIntersection(this._li, lt, Wt))) throw new le("found non-noded intersection at " + gt + "-" + bt + " and " + lt + "-" + Wt);
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
            var v = t.getIntersection(h);
            if (!v.equals(e) && !v.equals(s)) return !0;
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
      nr.fact = new ki();
      var Js = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "intersectsScaled", value: function(t, e) {
          var s = Math.min(t.x, e.x), h = Math.max(t.x, e.x), v = Math.min(t.y, e.y), m = Math.max(t.y, e.y), E = this._maxx < s || this._minx > h || this._maxy < v || this._miny > m;
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
            var t = u.SAFE_ENV_EXPANSION_FACTOR / this._scaleFactor;
            this._safeEnv = new Ht(this._originalPt.x - t, this._originalPt.x + t, this._originalPt.y - t, this._originalPt.y + t);
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
          if (this._originalPt = t, this._pt = t, this._scaleFactor = e, this._li = s, e <= 0) throw new X("Scale factor must be non-zero");
          e !== 1 && (this._pt = new U(this.scale(t.x), this.scale(t.y)), this._p0Scaled = new U(), this._p1Scaled = new U()), this.initCorners(this._pt);
        } }]);
      }();
      Js.SAFE_ENV_EXPANSION_FACTOR = 0.75;
      var th = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "select", value: function() {
          if (arguments.length !== 1) {
            if (arguments.length === 2) {
              var u = arguments[1];
              arguments[0].getLineSegment(u, this.selectedSegment), this.select(this.selectedSegment);
            }
          }
        } }], [{ key: "constructor_", value: function() {
          this.selectedSegment = new pe();
        } }]);
      }(), mu = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "snap", value: function() {
          if (arguments.length === 1) {
            var u = arguments[0];
            return this.snap(u, null, -1);
          }
          if (arguments.length === 3) {
            var t = arguments[0], e = arguments[1], s = arguments[2], h = t.getSafeEnvelope(), v = new li(t, e, s);
            return this._index.query(h, new (function() {
              return g(function m() {
                f(this, m);
              }, [{ key: "interfaces_", get: function() {
                return [Fs];
              } }, { key: "visitItem", value: function(m) {
                m.select(h, v);
              } }]);
            }())()), v.isNodeAdded();
          }
        } }], [{ key: "constructor_", value: function() {
          this._index = null;
          var u = arguments[0];
          this._index = u;
        } }]);
      }(), li = function(u) {
        function t() {
          var e;
          return f(this, t), e = l(this, t), t.constructor_.apply(e, arguments), e;
        }
        return x(t, u), g(t, [{ key: "isNodeAdded", value: function() {
          return this._isNodeAdded;
        } }, { key: "select", value: function() {
          if (!(arguments.length === 2 && Number.isInteger(arguments[1]) && arguments[0] instanceof Rn)) return C(t, "select", this, 1).apply(this, arguments);
          var e = arguments[1], s = arguments[0].getContext();
          if (this._parentEdge === s && (e === this._hotPixelVertexIndex || e + 1 === this._hotPixelVertexIndex)) return null;
          this._isNodeAdded |= this._hotPixel.addSnappedNode(s, e);
        } }], [{ key: "constructor_", value: function() {
          this._hotPixel = null, this._parentEdge = null, this._hotPixelVertexIndex = null, this._isNodeAdded = !1;
          var e = arguments[0], s = arguments[1], h = arguments[2];
          this._hotPixel = e, this._parentEdge = s, this._hotPixelVertexIndex = h;
        } }]);
      }(th);
      mu.HotPixelSnapAction = li;
      var ln = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "processIntersections", value: function(u, t, e, s) {
          if (u === e && t === s) return null;
          var h = u.getCoordinates()[t], v = u.getCoordinates()[t + 1], m = e.getCoordinates()[s], E = e.getCoordinates()[s + 1];
          if (this._li.computeIntersection(h, v, m, E), this._li.hasIntersection() && this._li.isInteriorIntersection()) {
            for (var N = 0; N < this._li.getIntersectionNum(); N++) this._interiorIntersections.add(this._li.getIntersection(N));
            u.addIntersections(this._li, t, 0), e.addIntersections(this._li, s, 1);
          }
        } }, { key: "isDone", value: function() {
          return !1;
        } }, { key: "getInteriorIntersections", value: function() {
          return this._interiorIntersections;
        } }, { key: "interfaces_", get: function() {
          return [Zs];
        } }], [{ key: "constructor_", value: function() {
          this._li = null, this._interiorIntersections = null;
          var u = arguments[0];
          this._li = u, this._interiorIntersections = new mt();
        } }]);
      }(), yu = function() {
        return g(function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }, [{ key: "checkCorrectness", value: function(u) {
          var t = mn.getNodedSubstrings(u), e = new nr(t);
          try {
            e.checkValid();
          } catch (s) {
            if (!(s instanceof W)) throw s;
            s.printStackTrace();
          }
        } }, { key: "getNodedSubstrings", value: function() {
          return mn.getNodedSubstrings(this._nodedSegStrings);
        } }, { key: "snapRound", value: function(u, t) {
          var e = this.findInteriorIntersections(u, t);
          this.computeIntersectionSnaps(e), this.computeVertexSnaps(u);
        } }, { key: "findInteriorIntersections", value: function(u, t) {
          var e = new ln(t);
          return this._noder.setSegmentIntersector(e), this._noder.computeNodes(u), e.getInteriorIntersections();
        } }, { key: "computeVertexSnaps", value: function() {
          if (wt(arguments[0], nn)) for (var u = arguments[0].iterator(); u.hasNext(); ) {
            var t = u.next();
            this.computeVertexSnaps(t);
          }
          else if (arguments[0] instanceof mn) for (var e = arguments[0], s = e.getCoordinates(), h = 0; h < s.length; h++) {
            var v = new Js(s[h], this._scaleFactor, this._li);
            this._pointSnapper.snap(v, e, h) && e.addIntersection(s[h], h);
          }
        } }, { key: "computeNodes", value: function(u) {
          this._nodedSegStrings = u, this._noder = new zs(), this._pointSnapper = new mu(this._noder.getIndex()), this.snapRound(u, this._li);
        } }, { key: "computeIntersectionSnaps", value: function(u) {
          for (var t = u.iterator(); t.hasNext(); ) {
            var e = t.next(), s = new Js(e, this._scaleFactor, this._li);
            this._pointSnapper.snap(s);
          }
        } }, { key: "interfaces_", get: function() {
          return [Us];
        } }], [{ key: "constructor_", value: function() {
          this._pm = null, this._li = null, this._scaleFactor = null, this._noder = null, this._pointSnapper = null, this._nodedSegStrings = null;
          var u = arguments[0];
          this._pm = u, this._li = new qn(), this._li.setPrecisionModel(u), this._scaleFactor = u.getScale();
        } }]);
      }(), bi = function() {
        function u() {
          f(this, u), u.constructor_.apply(this, arguments);
        }
        return g(u, [{ key: "bufferFixedPrecision", value: function(t) {
          var e = new Un(new yu(new ze(1)), t.getScale()), s = new Ks(this._bufParams);
          s.setWorkingPrecisionModel(t), s.setNoder(e), this._resultGeometry = s.buffer(this._argGeom, this._distance);
        } }, { key: "bufferReducedPrecision", value: function() {
          if (arguments.length === 0) {
            for (var t = u.MAX_PRECISION_DIGITS; t >= 0; t--) {
              try {
                this.bufferReducedPrecision(t);
              } catch (v) {
                if (!(v instanceof an)) throw v;
                this._saveException = v;
              }
              if (this._resultGeometry !== null) return null;
            }
            throw this._saveException;
          }
          if (arguments.length === 1) {
            var e = arguments[0], s = u.precisionScaleFactor(this._argGeom, this._distance, e), h = new ze(s);
            this.bufferFixedPrecision(h);
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
            return new u(arguments[0]).getResultGeometry(t);
          }
          if (arguments.length === 3) {
            if (Number.isInteger(arguments[2]) && arguments[0] instanceof ft && typeof arguments[1] == "number") {
              var e = arguments[1], s = arguments[2], h = new u(arguments[0]);
              return h.setQuadrantSegments(s), h.getResultGeometry(e);
            }
            if (arguments[2] instanceof Y && arguments[0] instanceof ft && typeof arguments[1] == "number") {
              var v = arguments[1];
              return new u(arguments[0], arguments[2]).getResultGeometry(v);
            }
          } else if (arguments.length === 4) {
            var m = arguments[1], E = arguments[2], N = arguments[3], R = new u(arguments[0]);
            return R.setQuadrantSegments(E), R.setEndCapStyle(N), R.getResultGeometry(m);
          }
        } }, { key: "precisionScaleFactor", value: function(t, e, s) {
          var h = t.getEnvelopeInternal(), v = Zi.max(Math.abs(h.getMaxX()), Math.abs(h.getMaxY()), Math.abs(h.getMinX()), Math.abs(h.getMinY())) + 2 * (e > 0 ? e : 0), m = s - Math.trunc(Math.log(v) / Math.log(10) + 1);
          return Math.pow(10, m);
        } }]);
      }();
      bi.CAP_ROUND = Y.CAP_ROUND, bi.CAP_BUTT = Y.CAP_FLAT, bi.CAP_FLAT = Y.CAP_FLAT, bi.CAP_SQUARE = Y.CAP_SQUARE, bi.MAX_PRECISION_DIGITS = 12;
      var eh = ["Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"], pu = function() {
        return g(function u(t) {
          f(this, u), this.geometryFactory = t || new ki();
        }, [{ key: "read", value: function(u) {
          var t, e = (t = typeof u == "string" ? JSON.parse(u) : u).type;
          if (!He[e]) throw new Error("Unknown GeoJSON type: " + t.type);
          return eh.indexOf(e) !== -1 ? He[e].call(this, t.coordinates) : e === "GeometryCollection" ? He[e].call(this, t.geometries) : He[e].call(this, t);
        } }, { key: "write", value: function(u) {
          var t = u.getGeometryType();
          if (!pn[t]) throw new Error("Geometry is not supported");
          return pn[t].call(this, u);
        } }]);
      }(), He = { Feature: function(u) {
        var t = {};
        for (var e in u) t[e] = u[e];
        if (u.geometry) {
          var s = u.geometry.type;
          if (!He[s]) throw new Error("Unknown GeoJSON type: " + u.type);
          t.geometry = this.read(u.geometry);
        }
        return u.bbox && (t.bbox = He.bbox.call(this, u.bbox)), t;
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
          t.push(_(U, G(s)));
        }
        return t;
      }, bbox: function(u) {
        return this.geometryFactory.createLinearRing([new U(u[0], u[1]), new U(u[2], u[1]), new U(u[2], u[3]), new U(u[0], u[3]), new U(u[0], u[1])]);
      }, Point: function(u) {
        var t = _(U, G(u));
        return this.geometryFactory.createPoint(t);
      }, MultiPoint: function(u) {
        for (var t = [], e = 0; e < u.length; ++e) t.push(He.Point.call(this, u[e]));
        return this.geometryFactory.createMultiPoint(t);
      }, LineString: function(u) {
        var t = He.coordinates.call(this, u);
        return this.geometryFactory.createLineString(t);
      }, MultiLineString: function(u) {
        for (var t = [], e = 0; e < u.length; ++e) t.push(He.LineString.call(this, u[e]));
        return this.geometryFactory.createMultiLineString(t);
      }, Polygon: function(u) {
        for (var t = He.coordinates.call(this, u[0]), e = this.geometryFactory.createLinearRing(t), s = [], h = 1; h < u.length; ++h) {
          var v = u[h], m = He.coordinates.call(this, v), E = this.geometryFactory.createLinearRing(m);
          s.push(E);
        }
        return this.geometryFactory.createPolygon(e, s);
      }, MultiPolygon: function(u) {
        for (var t = [], e = 0; e < u.length; ++e) {
          var s = u[e];
          t.push(He.Polygon.call(this, s));
        }
        return this.geometryFactory.createMultiPolygon(t);
      }, GeometryCollection: function(u) {
        for (var t = [], e = 0; e < u.length; ++e) {
          var s = u[e];
          t.push(this.read(s));
        }
        return this.geometryFactory.createGeometryCollection(t);
      } }, pn = { coordinate: function(u) {
        var t = [u.x, u.y];
        return u.z && t.push(u.z), u.m && t.push(u.m), t;
      }, Point: function(u) {
        return { type: "Point", coordinates: pn.coordinate.call(this, u.getCoordinate()) };
      }, MultiPoint: function(u) {
        for (var t = [], e = 0; e < u._geometries.length; ++e) {
          var s = u._geometries[e], h = pn.Point.call(this, s);
          t.push(h.coordinates);
        }
        return { type: "MultiPoint", coordinates: t };
      }, LineString: function(u) {
        for (var t = [], e = u.getCoordinates(), s = 0; s < e.length; ++s) {
          var h = e[s];
          t.push(pn.coordinate.call(this, h));
        }
        return { type: "LineString", coordinates: t };
      }, MultiLineString: function(u) {
        for (var t = [], e = 0; e < u._geometries.length; ++e) {
          var s = u._geometries[e], h = pn.LineString.call(this, s);
          t.push(h.coordinates);
        }
        return { type: "MultiLineString", coordinates: t };
      }, Polygon: function(u) {
        var t = [], e = pn.LineString.call(this, u._shell);
        t.push(e.coordinates);
        for (var s = 0; s < u._holes.length; ++s) {
          var h = u._holes[s], v = pn.LineString.call(this, h);
          t.push(v.coordinates);
        }
        return { type: "Polygon", coordinates: t };
      }, MultiPolygon: function(u) {
        for (var t = [], e = 0; e < u._geometries.length; ++e) {
          var s = u._geometries[e], h = pn.Polygon.call(this, s);
          t.push(h.coordinates);
        }
        return { type: "MultiPolygon", coordinates: t };
      }, GeometryCollection: function(u) {
        for (var t = [], e = 0; e < u._geometries.length; ++e) {
          var s = u._geometries[e], h = s.getGeometryType();
          t.push(pn[h].call(this, s));
        }
        return { type: "GeometryCollection", geometries: t };
      } };
      return { BufferOp: bi, GeoJSONReader: function() {
        return g(function u(t) {
          f(this, u), this.parser = new pu(t || new ki());
        }, [{ key: "read", value: function(u) {
          return this.parser.read(u);
        } }]);
      }(), GeoJSONWriter: function() {
        return g(function u() {
          f(this, u), this.parser = new pu(this.geometryFactory);
        }, [{ key: "write", value: function(u) {
          return this.parser.write(u);
        } }]);
      }() };
    });
  }(mo)), mo.exports;
}
var wM = MM();
const SM = /* @__PURE__ */ pM(wM);
function $i() {
  return new ko();
}
function ko() {
  this.reset();
}
ko.prototype = {
  constructor: ko,
  reset: function() {
    this.s = // rounded value
    this.t = 0;
  },
  add: function(n) {
    sg(so, n, this.t), sg(this, so.s, this.s), this.s ? this.t += so.t : this.s = so.t;
  },
  valueOf: function() {
    return this.s;
  }
};
var so = new ko();
function sg(n, i, a) {
  var l = n.s = i + a, f = l - i, _ = l - f;
  n.t = i - _ + (a - f);
}
var Jt = 1e-6, qt = Math.PI, Kn = qt / 2, ag = qt / 4, Qn = qt * 2, Gi = 180 / qt, kn = qt / 180, me = Math.abs, IM = Math.atan, hs = Math.atan2, te = Math.cos, ee = Math.sin, vs = Math.sqrt;
function jg(n) {
  return n > 1 ? 0 : n < -1 ? qt : Math.acos(n);
}
function Er(n) {
  return n > 1 ? Kn : n < -1 ? -Kn : Math.asin(n);
}
function Ea() {
}
function Po(n, i) {
  n && og.hasOwnProperty(n.type) && og[n.type](n, i);
}
var ug = {
  Feature: function(n, i) {
    Po(n.geometry, i);
  },
  FeatureCollection: function(n, i) {
    for (var a = n.features, l = -1, f = a.length; ++l < f; ) Po(a[l].geometry, i);
  }
}, og = {
  Sphere: function(n, i) {
    i.sphere();
  },
  Point: function(n, i) {
    n = n.coordinates, i.point(n[0], n[1], n[2]);
  },
  MultiPoint: function(n, i) {
    for (var a = n.coordinates, l = -1, f = a.length; ++l < f; ) n = a[l], i.point(n[0], n[1], n[2]);
  },
  LineString: function(n, i) {
    vl(n.coordinates, i, 0);
  },
  MultiLineString: function(n, i) {
    for (var a = n.coordinates, l = -1, f = a.length; ++l < f; ) vl(a[l], i, 0);
  },
  Polygon: function(n, i) {
    hg(n.coordinates, i);
  },
  MultiPolygon: function(n, i) {
    for (var a = n.coordinates, l = -1, f = a.length; ++l < f; ) hg(a[l], i);
  },
  GeometryCollection: function(n, i) {
    for (var a = n.geometries, l = -1, f = a.length; ++l < f; ) Po(a[l], i);
  }
};
function vl(n, i, a) {
  var l = -1, f = n.length - a, _;
  for (i.lineStart(); ++l < f; ) _ = n[l], i.point(_[0], _[1], _[2]);
  i.lineEnd();
}
function hg(n, i) {
  var a = -1, l = n.length;
  for (i.polygonStart(); ++a < l; ) vl(n[a], i, 1);
  i.polygonEnd();
}
function NM(n, i) {
  n && ug.hasOwnProperty(n.type) ? ug[n.type](n, i) : Po(n, i);
}
$i();
$i();
function _l(n) {
  return [hs(n[1], n[0]), Er(n[2])];
}
function ls(n) {
  var i = n[0], a = n[1], l = te(a);
  return [l * te(i), l * ee(i), ee(a)];
}
function ao(n, i) {
  return n[0] * i[0] + n[1] * i[1] + n[2] * i[2];
}
function Co(n, i) {
  return [n[1] * i[2] - n[2] * i[1], n[2] * i[0] - n[0] * i[2], n[0] * i[1] - n[1] * i[0]];
}
function il(n, i) {
  n[0] += i[0], n[1] += i[1], n[2] += i[2];
}
function uo(n, i) {
  return [n[0] * i, n[1] * i, n[2] * i];
}
function dl(n) {
  var i = vs(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
  n[0] /= i, n[1] /= i, n[2] /= i;
}
$i();
function t0(n, i) {
  function a(l, f) {
    return l = n(l, f), i(l[0], l[1]);
  }
  return n.invert && i.invert && (a.invert = function(l, f) {
    return l = i.invert(l, f), l && n.invert(l[0], l[1]);
  }), a;
}
function ml(n, i) {
  return [n > qt ? n - Qn : n < -qt ? n + Qn : n, i];
}
ml.invert = ml;
function kM(n, i, a) {
  return (n %= Qn) ? i || a ? t0(fg(n), cg(i, a)) : fg(n) : i || a ? cg(i, a) : ml;
}
function lg(n) {
  return function(i, a) {
    return i += n, [i > qt ? i - Qn : i < -qt ? i + Qn : i, a];
  };
}
function fg(n) {
  var i = lg(n);
  return i.invert = lg(-n), i;
}
function cg(n, i) {
  var a = te(n), l = ee(n), f = te(i), _ = ee(i);
  function d(g, p) {
    var M = te(p), S = te(g) * M, x = ee(g) * M, w = ee(p), b = w * a + S * l;
    return [
      hs(x * f - b * _, S * a - w * l),
      Er(b * f + x * _)
    ];
  }
  return d.invert = function(g, p) {
    var M = te(p), S = te(g) * M, x = ee(g) * M, w = ee(p), b = w * f - x * _;
    return [
      hs(x * f + w * _, S * a + b * l),
      Er(b * a - S * l)
    ];
  }, d;
}
function PM(n, i, a, l, f, _) {
  if (a) {
    var d = te(i), g = ee(i), p = l * a;
    f == null ? (f = i + l * Qn, _ = i - p / 2) : (f = gg(d, f), _ = gg(d, _), (l > 0 ? f < _ : f > _) && (f += l * Qn));
    for (var M, S = f; l > 0 ? S > _ : S < _; S -= p)
      M = _l([d, -g * te(S), -g * ee(S)]), n.point(M[0], M[1]);
  }
}
function gg(n, i) {
  i = ls(i), i[0] -= n, dl(i);
  var a = jg(-i[1]);
  return ((-i[2] < 0 ? -a : a) + Qn - Jt) % Qn;
}
function e0() {
  var n = [], i;
  return {
    point: function(a, l) {
      i.push([a, l]);
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
function CM(n, i, a, l, f, _) {
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
      if (C = l - g, !(!b && C > 0)) {
        if (C /= b, b < 0) {
          if (C < S) return;
          C < x && (x = C);
        } else if (b > 0) {
          if (C > x) return;
          C > S && (S = C);
        }
        if (C = _ - g, !(!b && C < 0)) {
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
function yo(n, i) {
  return me(n[0] - i[0]) < Jt && me(n[1] - i[1]) < Jt;
}
function oo(n, i, a, l) {
  this.x = n, this.z = i, this.o = a, this.e = l, this.v = !1, this.n = this.p = null;
}
function n0(n, i, a, l, f) {
  var _ = [], d = [], g, p;
  if (n.forEach(function(C) {
    if (!((G = C.length - 1) <= 0)) {
      var G, O = C[0], B = C[G], z;
      if (yo(O, B)) {
        for (f.lineStart(), g = 0; g < G; ++g) f.point((O = C[g])[0], O[1]);
        f.lineEnd();
        return;
      }
      _.push(z = new oo(O, C, null, !0)), d.push(z.o = new oo(O, null, z, !1)), _.push(z = new oo(B, C, null, !1)), d.push(z.o = new oo(B, null, z, !0));
    }
  }), !!_.length) {
    for (d.sort(i), vg(_), vg(d), g = 0, p = d.length; g < p; ++g)
      d[g].e = a = !a;
    for (var M = _[0], S, x; ; ) {
      for (var w = M, b = !0; w.v; ) if ((w = w.n) === M) return;
      S = w.z, f.lineStart();
      do {
        if (w.v = w.o.v = !0, w.e) {
          if (b)
            for (g = 0, p = S.length; g < p; ++g) f.point((x = S[g])[0], x[1]);
          else
            l(w.x, w.n.x, 1, f);
          w = w.n;
        } else {
          if (b)
            for (S = w.p.z, g = S.length - 1; g >= 0; --g) f.point((x = S[g])[0], x[1]);
          else
            l(w.x, w.p.x, -1, f);
          w = w.p;
        }
        w = w.o, S = w.z, b = !b;
      } while (!w.v);
      f.lineEnd();
    }
  }
}
function vg(n) {
  if (i = n.length) {
    for (var i, a = 0, l = n[0], f; ++a < i; )
      l.n = f = n[a], f.p = l, l = f;
    l.n = f = n[0], f.p = l;
  }
}
function i0(n, i) {
  return n < i ? -1 : n > i ? 1 : n >= i ? 0 : NaN;
}
function bM(n) {
  return n.length === 1 && (n = RM(n)), {
    left: function(i, a, l, f) {
      for (l == null && (l = 0), f == null && (f = i.length); l < f; ) {
        var _ = l + f >>> 1;
        n(i[_], a) < 0 ? l = _ + 1 : f = _;
      }
      return l;
    },
    right: function(i, a, l, f) {
      for (l == null && (l = 0), f == null && (f = i.length); l < f; ) {
        var _ = l + f >>> 1;
        n(i[_], a) > 0 ? f = _ : l = _ + 1;
      }
      return l;
    }
  };
}
function RM(n) {
  return function(i, a) {
    return i0(n(i), a);
  };
}
bM(i0);
function r0(n) {
  for (var i = n.length, a, l = -1, f = 0, _, d; ++l < i; ) f += n[l].length;
  for (_ = new Array(f); --i >= 0; )
    for (d = n[i], a = d.length; --a >= 0; )
      _[--f] = d[a];
  return _;
}
var xa = 1e9, ho = -xa;
function AM(n, i, a, l) {
  function f(M, S) {
    return n <= M && M <= a && i <= S && S <= l;
  }
  function _(M, S, x, w) {
    var b = 0, C = 0;
    if (M == null || (b = d(M, x)) !== (C = d(S, x)) || p(M, S) < 0 ^ x > 0)
      do
        w.point(b === 0 || b === 3 ? n : a, b > 1 ? l : i);
      while ((b = (b + x + 4) % 4) !== C);
    else
      w.point(S[0], S[1]);
  }
  function d(M, S) {
    return me(M[0] - n) < Jt ? S > 0 ? 0 : 3 : me(M[0] - a) < Jt ? S > 0 ? 2 : 1 : me(M[1] - i) < Jt ? S > 0 ? 1 : 0 : S > 0 ? 3 : 2;
  }
  function g(M, S) {
    return p(M.x, S.x);
  }
  function p(M, S) {
    var x = d(M, 1), w = d(S, 1);
    return x !== w ? x - w : x === 0 ? S[1] - M[1] : x === 1 ? M[0] - S[0] : x === 2 ? M[1] - S[1] : S[0] - M[0];
  }
  return function(M) {
    var S = M, x = e0(), w, b, C, G, O, B, z, Y, W, X, V, K = {
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
          le = Nt, Me = we, Zt = $t[he], Nt = Zt[0], we = Zt[1], Me <= l ? we > l && (Nt - le) * (l - Me) > (we - Me) * (n - le) && ++St : we <= l && (Nt - le) * (l - Me) < (we - Me) * (n - le) && --St;
      return St;
    }
    function vt() {
      S = x, w = [], b = [], V = !0;
    }
    function _t() {
      var St = j(), Gt = V && St, Dt = (w = r0(w)).length;
      (Gt || Dt) && (M.polygonStart(), Gt && (M.lineStart(), _(null, null, 1, M), M.lineEnd()), Dt && n0(w, g, St, _, M), M.polygonEnd()), S = M, w = b = C = null;
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
        var $t = [z = Math.max(ho, Math.min(xa, z)), Y = Math.max(ho, Math.min(xa, Y))], he = [St = Math.max(ho, Math.min(xa, St)), Gt = Math.max(ho, Math.min(xa, Gt))];
        CM($t, he, n, i, a, l) ? (W || (S.lineStart(), S.point($t[0], $t[1])), S.point(he[0], he[1]), Dt || S.lineEnd(), V = !1) : Dt && (S.lineStart(), S.point(St, Gt), V = !1);
      }
      z = St, Y = Gt, W = Dt;
    }
    return K;
  };
}
var rl = $i();
function TM(n, i) {
  var a = i[0], l = i[1], f = [ee(a), -te(a), 0], _ = 0, d = 0;
  rl.reset();
  for (var g = 0, p = n.length; g < p; ++g)
    if (S = (M = n[g]).length)
      for (var M, S, x = M[S - 1], w = x[0], b = x[1] / 2 + ag, C = ee(b), G = te(b), O = 0; O < S; ++O, w = z, C = W, G = X, x = B) {
        var B = M[O], z = B[0], Y = B[1] / 2 + ag, W = ee(Y), X = te(Y), V = z - w, K = V >= 0 ? 1 : -1, et = K * V, j = et > qt, vt = C * W;
        if (rl.add(hs(vt * K * ee(et), G * X + vt * te(et))), _ += j ? V + K * Qn : V, j ^ w >= a ^ z >= a) {
          var _t = Co(ls(x), ls(B));
          dl(_t);
          var Mt = Co(f, _t);
          dl(Mt);
          var kt = (j ^ V >= 0 ? -1 : 1) * Er(Mt[2]);
          (l > kt || l === kt && (_t[0] || _t[1])) && (d += j ^ V >= 0 ? 1 : -1);
        }
      }
  return (_ < -Jt || _ < Jt && rl < -Jt) ^ d & 1;
}
$i();
function _g(n) {
  return n;
}
$i();
$i();
var fs = 1 / 0, bo = fs, Aa = -fs, Ro = Aa, dg = {
  point: LM,
  lineStart: Ea,
  lineEnd: Ea,
  polygonStart: Ea,
  polygonEnd: Ea,
  result: function() {
    var n = [[fs, bo], [Aa, Ro]];
    return Aa = Ro = -(bo = fs = 1 / 0), n;
  }
};
function LM(n, i) {
  n < fs && (fs = n), n > Aa && (Aa = n), i < bo && (bo = i), i > Ro && (Ro = i);
}
$i();
function s0(n, i, a, l) {
  return function(f, _) {
    var d = i(_), g = f.invert(l[0], l[1]), p = e0(), M = i(p), S = !1, x, w, b, C = {
      point: G,
      lineStart: B,
      lineEnd: z,
      polygonStart: function() {
        C.point = Y, C.lineStart = W, C.lineEnd = X, w = [], x = [];
      },
      polygonEnd: function() {
        C.point = G, C.lineStart = B, C.lineEnd = z, w = r0(w);
        var V = TM(x, g);
        w.length ? (S || (_.polygonStart(), S = !0), n0(w, GM, V, a, _)) : V && (S || (_.polygonStart(), S = !0), _.lineStart(), a(null, null, 1, _), _.lineEnd()), S && (_.polygonEnd(), S = !1), w = x = null;
      },
      sphere: function() {
        _.polygonStart(), _.lineStart(), a(null, null, 1, _), _.lineEnd(), _.polygonEnd();
      }
    };
    function G(V, K) {
      var et = f(V, K);
      n(V = et[0], K = et[1]) && _.point(V, K);
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
            for (S || (_.polygonStart(), S = !0), _.lineStart(), et = 0; et < vt; ++et) _.point((Mt = _t[et])[0], Mt[1]);
            _.lineEnd();
          }
          return;
        }
        j > 1 && V & 2 && K.push(K.pop().concat(K.shift())), w.push(K.filter(OM));
      }
    }
    return C;
  };
}
function OM(n) {
  return n.length > 1;
}
function GM(n, i) {
  return ((n = n.x)[0] < 0 ? n[1] - Kn - Jt : Kn - n[1]) - ((i = i.x)[0] < 0 ? i[1] - Kn - Jt : Kn - i[1]);
}
const mg = s0(
  function() {
    return !0;
  },
  DM,
  qM,
  [-qt, -Kn]
);
function DM(n) {
  var i = NaN, a = NaN, l = NaN, f;
  return {
    lineStart: function() {
      n.lineStart(), f = 1;
    },
    point: function(_, d) {
      var g = _ > 0 ? qt : -qt, p = me(_ - i);
      me(p - qt) < Jt ? (n.point(i, a = (a + d) / 2 > 0 ? Kn : -Kn), n.point(l, a), n.lineEnd(), n.lineStart(), n.point(g, a), n.point(_, a), f = 0) : l !== g && p >= qt && (me(i - l) < Jt && (i -= l * Jt), me(_ - g) < Jt && (_ -= g * Jt), a = FM(i, a, _, d), n.point(l, a), n.lineEnd(), n.lineStart(), n.point(g, a), f = 0), n.point(i = _, a = d), l = g;
    },
    lineEnd: function() {
      n.lineEnd(), i = a = NaN;
    },
    clean: function() {
      return 2 - f;
    }
  };
}
function FM(n, i, a, l) {
  var f, _, d = ee(n - a);
  return me(d) > Jt ? IM((ee(i) * (_ = te(l)) * ee(a) - ee(l) * (f = te(i)) * ee(n)) / (f * _ * d)) : (i + l) / 2;
}
function qM(n, i, a, l) {
  var f;
  if (n == null)
    f = a * Kn, l.point(-qt, f), l.point(0, f), l.point(qt, f), l.point(qt, 0), l.point(qt, -f), l.point(0, -f), l.point(-qt, -f), l.point(-qt, 0), l.point(-qt, f);
  else if (me(n[0] - i[0]) > Jt) {
    var _ = n[0] < i[0] ? qt : -qt;
    f = a * _ / 2, l.point(-_, f), l.point(0, f), l.point(_, f);
  } else
    l.point(i[0], i[1]);
}
function BM(n, i) {
  var a = te(n), l = a > 0, f = me(a) > Jt;
  function _(S, x, w, b) {
    PM(b, n, i, w, S, x);
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
        var z = [O, B], Y, W = d(O, B), X = l ? W ? 0 : M(O, B) : W ? M(O + (O < 0 ? qt : -qt), B) : 0;
        if (!x && (C = b = W) && S.lineStart(), W !== b && (Y = p(x, z), (!Y || yo(x, Y) || yo(z, Y)) && (z[0] += Jt, z[1] += Jt, W = d(z[0], z[1]))), W !== b)
          G = 0, W ? (S.lineStart(), Y = p(z, x), S.point(Y[0], Y[1])) : (Y = p(x, z), S.point(Y[0], Y[1]), S.lineEnd()), x = Y;
        else if (f && x && l ^ W) {
          var V;
          !(X & w) && (V = p(z, x, !0)) && (G = 0, l ? (S.lineStart(), S.point(V[0][0], V[0][1]), S.point(V[1][0], V[1][1]), S.lineEnd()) : (S.point(V[1][0], V[1][1]), S.lineEnd(), S.lineStart(), S.point(V[0][0], V[0][1])));
        }
        W && (!x || !yo(x, z)) && S.point(z[0], z[1]), x = z, b = W, w = X;
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
    var b = ls(S), C = ls(x), G = [1, 0, 0], O = Co(b, C), B = ao(O, O), z = O[0], Y = B - z * z;
    if (!Y) return !w && S;
    var W = a * B / Y, X = -a * z / Y, V = Co(G, O), K = uo(G, W), et = uo(O, X);
    il(K, et);
    var j = V, vt = ao(K, j), _t = ao(j, j), Mt = vt * vt - _t * (ao(K, K) - 1);
    if (!(Mt < 0)) {
      var kt = vs(Mt), it = uo(j, (-vt - kt) / _t);
      if (il(it, K), it = _l(it), !w) return it;
      var St = S[0], Gt = x[0], Dt = S[1], $t = x[1], he;
      Gt < St && (he = St, St = Gt, Gt = he);
      var ht = Gt - St, Zt = me(ht - qt) < Jt, le = Zt || ht < Jt;
      if (!Zt && $t < Dt && (he = Dt, Dt = $t, $t = he), le ? Zt ? Dt + $t > 0 ^ it[1] < (me(it[0] - St) < Jt ? Dt : $t) : Dt <= it[1] && it[1] <= $t : ht > qt ^ (St <= it[0] && it[0] <= Gt)) {
        var Me = uo(j, (-vt + kt) / _t);
        return il(Me, K), [it, _l(Me)];
      }
    }
  }
  function M(S, x) {
    var w = l ? n : qt - n, b = 0;
    return S < -w ? b |= 1 : S > w && (b |= 2), x < -w ? b |= 4 : x > w && (b |= 8), b;
  }
  return s0(d, g, _, l ? [0, -n] : [-qt, n - qt]);
}
function a0(n) {
  return function(i) {
    var a = new yl();
    for (var l in n) a[l] = n[l];
    return a.stream = i, a;
  };
}
function yl() {
}
yl.prototype = {
  constructor: yl,
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
function u0(n, i, a) {
  var l = i[1][0] - i[0][0], f = i[1][1] - i[0][1], _ = n.clipExtent && n.clipExtent();
  n.scale(150).translate([0, 0]), _ != null && n.clipExtent(null), NM(a, n.stream(dg));
  var d = dg.result(), g = Math.min(l / (d[1][0] - d[0][0]), f / (d[1][1] - d[0][1])), p = +i[0][0] + (l - g * (d[1][0] + d[0][0])) / 2, M = +i[0][1] + (f - g * (d[1][1] + d[0][1])) / 2;
  return _ != null && n.clipExtent(_), n.scale(g * 150).translate([p, M]);
}
function UM(n, i, a) {
  return u0(n, [[0, 0], i], a);
}
var yg = 16, zM = te(30 * kn);
function pg(n, i) {
  return +i ? XM(n, i) : YM(n);
}
function YM(n) {
  return a0({
    point: function(i, a) {
      i = n(i, a), this.stream.point(i[0], i[1]);
    }
  });
}
function XM(n, i) {
  function a(l, f, _, d, g, p, M, S, x, w, b, C, G, O) {
    var B = M - l, z = S - f, Y = B * B + z * z;
    if (Y > 4 * i && G--) {
      var W = d + w, X = g + b, V = p + C, K = vs(W * W + X * X + V * V), et = Er(V /= K), j = me(me(V) - 1) < Jt || me(_ - x) < Jt ? (_ + x) / 2 : hs(X, W), vt = n(j, et), _t = vt[0], Mt = vt[1], kt = _t - l, it = Mt - f, St = z * kt - B * it;
      (St * St / Y > i || me((B * kt + z * it) / Y - 0.5) > 0.3 || d * w + g * b + p * C < zM) && (a(l, f, _, d, g, p, _t, Mt, j, W /= K, X /= K, V, G, O), O.point(_t, Mt), a(_t, Mt, j, W, X, V, M, S, x, w, b, C, G, O));
    }
  }
  return function(l) {
    var f, _, d, g, p, M, S, x, w, b, C, G, O = {
      point: B,
      lineStart: z,
      lineEnd: W,
      polygonStart: function() {
        l.polygonStart(), O.lineStart = X;
      },
      polygonEnd: function() {
        l.polygonEnd(), O.lineStart = z;
      }
    };
    function B(et, j) {
      et = n(et, j), l.point(et[0], et[1]);
    }
    function z() {
      x = NaN, O.point = Y, l.lineStart();
    }
    function Y(et, j) {
      var vt = ls([et, j]), _t = n(et, j);
      a(x, w, S, b, C, G, x = _t[0], w = _t[1], S = et, b = vt[0], C = vt[1], G = vt[2], yg, l), l.point(x, w);
    }
    function W() {
      O.point = B, l.lineEnd();
    }
    function X() {
      z(), O.point = V, O.lineEnd = K;
    }
    function V(et, j) {
      Y(f = et, j), _ = x, d = w, g = b, p = C, M = G, O.point = Y;
    }
    function K() {
      a(x, w, S, b, C, G, _, d, f, g, p, M, yg, l), O.lineEnd = W, W();
    }
    return O;
  };
}
var WM = a0({
  point: function(n, i) {
    this.stream.point(n * kn, i * kn);
  }
});
function $M(n) {
  return HM(function() {
    return n;
  })();
}
function HM(n) {
  var i, a = 150, l = 480, f = 250, _, d, g = 0, p = 0, M = 0, S = 0, x = 0, w, b, C = null, G = mg, O = null, B, z, Y, W = _g, X = 0.5, V = pg(_t, X), K, et;
  function j(it) {
    return it = b(it[0] * kn, it[1] * kn), [it[0] * a + _, d - it[1] * a];
  }
  function vt(it) {
    return it = b.invert((it[0] - _) / a, (d - it[1]) / a), it && [it[0] * Gi, it[1] * Gi];
  }
  function _t(it, St) {
    return it = i(it, St), [it[0] * a + _, d - it[1] * a];
  }
  j.stream = function(it) {
    return K && et === it ? K : K = WM(G(w, V(W(et = it))));
  }, j.clipAngle = function(it) {
    return arguments.length ? (G = +it ? BM(C = it * kn, 6 * kn) : (C = null, mg), kt()) : C * Gi;
  }, j.clipExtent = function(it) {
    return arguments.length ? (W = it == null ? (O = B = z = Y = null, _g) : AM(O = +it[0][0], B = +it[0][1], z = +it[1][0], Y = +it[1][1]), kt()) : O == null ? null : [[O, B], [z, Y]];
  }, j.scale = function(it) {
    return arguments.length ? (a = +it, Mt()) : a;
  }, j.translate = function(it) {
    return arguments.length ? (l = +it[0], f = +it[1], Mt()) : [l, f];
  }, j.center = function(it) {
    return arguments.length ? (g = it[0] % 360 * kn, p = it[1] % 360 * kn, Mt()) : [g * Gi, p * Gi];
  }, j.rotate = function(it) {
    return arguments.length ? (M = it[0] % 360 * kn, S = it[1] % 360 * kn, x = it.length > 2 ? it[2] % 360 * kn : 0, Mt()) : [M * Gi, S * Gi, x * Gi];
  }, j.precision = function(it) {
    return arguments.length ? (V = pg(_t, X = it * it), kt()) : vs(X);
  }, j.fitExtent = function(it, St) {
    return u0(j, it, St);
  }, j.fitSize = function(it, St) {
    return UM(j, it, St);
  };
  function Mt() {
    b = t0(w = kM(M, S, x), i);
    var it = i(g, p);
    return _ = l - it[0] * a, d = f + it[1] * a, kt();
  }
  function kt() {
    return K = et = null, j;
  }
  return function() {
    return i = n.apply(this, arguments), j.invert = i.invert && vt, Mt();
  };
}
function o0(n) {
  return function(i, a) {
    var l = te(i), f = te(a), _ = n(l * f);
    return [
      _ * f * ee(i),
      _ * ee(a)
    ];
  };
}
function h0(n) {
  return function(i, a) {
    var l = vs(i * i + a * a), f = n(l), _ = ee(f), d = te(f);
    return [
      hs(i * _, l * d),
      Er(l && a * _ / l)
    ];
  };
}
var VM = o0(function(n) {
  return vs(2 / (1 + n));
});
VM.invert = h0(function(n) {
  return 2 * Er(n / 2);
});
var l0 = o0(function(n) {
  return (n = jg(n)) && n / ee(n);
});
l0.invert = h0(function(n) {
  return n;
});
function ZM() {
  return $M(l0).scale(79.4188).clipAngle(180 - 1e-3);
}
function Eg(n, i) {
  return [n, i];
}
Eg.invert = Eg;
var { BufferOp: KM, GeoJSONReader: JM, GeoJSONWriter: QM } = SM;
function jM(n, i, a) {
  a = a || {};
  var l = a.units || "kilometers", f = a.steps || 8;
  if (!n) throw new Error("geojson is required");
  if (typeof a != "object") throw new Error("options must be an object");
  if (typeof f != "number") throw new Error("steps must be an number");
  if (i === void 0) throw new Error("radius is required");
  if (f <= 0) throw new Error("steps must be greater than 0");
  var _ = [];
  switch (n.type) {
    case "GeometryCollection":
      return Tl(n, function(d) {
        var g = po(d, i, l, f);
        g && _.push(g);
      }), tn(_);
    case "FeatureCollection":
      return os(n, function(d) {
        var g = po(d, i, l, f);
        g && os(g, function(p) {
          p && _.push(p);
        });
      }), tn(_);
  }
  return po(n, i, l, f);
}
function po(n, i, a, l) {
  var f = n.properties || {}, _ = n.type === "Feature" ? n.geometry : n;
  if (_.type === "GeometryCollection") {
    var d = [];
    return Tl(n, function(G) {
      var O = po(G, i, a, l);
      O && d.push(O);
    }), tn(d);
  }
  var g = tw(_), p = {
    type: _.type,
    coordinates: c0(_.coordinates, g)
  }, M = new JM(), S = M.read(p), x = Vg(C4(i, a), "meters"), w = KM.bufferOp(S, x, l), b = new QM();
  if (w = b.write(w), !f0(w.coordinates)) {
    var C = {
      type: w.type,
      coordinates: g0(w.coordinates, g)
    };
    return Xi(C, f);
  }
}
function f0(n) {
  return Array.isArray(n[0]) ? f0(n[0]) : isNaN(n[0]);
}
function c0(n, i) {
  return typeof n[0] != "object" ? i(n) : n.map(function(a) {
    return c0(a, i);
  });
}
function g0(n, i) {
  return typeof n[0] != "object" ? i.invert(n) : n.map(function(a) {
    return g0(a, i);
  });
}
function tw(n) {
  var i = EM(n).geometry.coordinates, a = [-i[0], -i[1]];
  return ZM().rotate(a).scale(Ge);
}
function ew(n) {
  var i = n[0], a = n[1], l = n[2], f = n[3], _ = Hn(n.slice(0, 2), [l, a]), d = Hn(n.slice(0, 2), [i, f]);
  if (_ >= d) {
    var g = (a + f) / 2;
    return [
      i,
      g - (l - i) / 2,
      l,
      g + (l - i) / 2
    ];
  } else {
    var p = (i + l) / 2;
    return [
      p - (f - a) / 2,
      a,
      p + (f - a) / 2,
      f
    ];
  }
}
function nw(n, i) {
  if (i = i ?? {}, !b4(i)) throw new Error("options is invalid");
  var a = i.precision, l = i.coordinates, f = i.mutate;
  if (a = a == null || isNaN(a) ? 6 : a, l = l == null || isNaN(l) ? 3 : l, !n) throw new Error("<geojson> is required");
  if (typeof a != "number")
    throw new Error("<precision> must be a number");
  if (typeof l != "number")
    throw new Error("<coordinates> must be a number");
  (f === !1 || f === void 0) && (n = JSON.parse(JSON.stringify(n)));
  var _ = Math.pow(10, a);
  return Al(n, function(d) {
    iw(d, _, l);
  }), n;
}
function iw(n, i, a) {
  n.length > a && n.splice(a, n.length);
  for (var l = 0; l < n.length; l++)
    n[l] = Math.round(n[l] * i) / i;
  return n;
}
function rw(n, i) {
  if (!n) throw new Error("line is required");
  if (!i) throw new Error("splitter is required");
  var a = $c(n), l = $c(i);
  if (a !== "LineString") throw new Error("line must be LineString");
  if (l === "FeatureCollection")
    throw new Error("splitter cannot be a FeatureCollection");
  if (l === "GeometryCollection")
    throw new Error("splitter cannot be a GeometryCollection");
  var f = nw(i, { precision: 7 });
  switch (l) {
    case "Point":
      return pl(n, f);
    case "MultiPoint":
      return xg(n, f);
    case "LineString":
    case "MultiLineString":
    case "Polygon":
    case "MultiPolygon":
      return xg(
        n,
        Q4(n, f, {
          ignoreSelfIntersections: !0
        })
      );
  }
}
function xg(n, i) {
  var a = [], l = Qg();
  return Ll(i, function(f) {
    if (a.forEach(function(g, p) {
      g.id = p;
    }), !a.length)
      a = pl(n, f).features, a.forEach(function(g) {
        g.bbox || (g.bbox = ew(xi(g)));
      }), l.load(tn(a));
    else {
      var _ = l.search(f);
      if (_.features.length) {
        var d = v0(f, _);
        a = a.filter(function(g) {
          return g.id !== d.id;
        }), l.remove(d), os(pl(d, f), function(g) {
          a.push(g), l.insert(g);
        });
      }
    }
  }), tn(a);
}
function pl(n, i) {
  var a = [], l = as(n)[0], f = as(n)[n.geometry.coordinates.length - 1];
  if (sl(l, Zn(i)) || sl(f, Zn(i)))
    return tn([n]);
  var _ = Qg(), d = aM(n);
  _.load(d);
  var g = _.search(i);
  if (!g.features.length) return tn([n]);
  var p = v0(i, g), M = [l], S = A4(
    d,
    function(x, w, b) {
      var C = as(w)[1], G = Zn(i);
      return b === p.id ? (x.push(G), a.push(No(x)), sl(G, C) ? [G] : [G, C]) : (x.push(C), x);
    },
    M
  );
  return S.length > 1 && a.push(No(S)), tn(a);
}
function v0(n, i) {
  if (!i.features.length) throw new Error("lines must contain features");
  if (i.features.length === 1) return i.features[0];
  var a, l = 1 / 0;
  return os(i, function(f) {
    var _ = _M(f, n), d = _.properties.dist;
    d < l && (a = f, l = d);
  }), a;
}
function sl(n, i) {
  return n[0] === i[0] && n[1] === i[1];
}
var Ma = { exports: {} };
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var sw = Ma.exports, Mg;
function aw() {
  return Mg || (Mg = 1, function(n, i) {
    (function() {
      var a, l = "4.17.21", f = 200, _ = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", d = "Expected a function", g = "Invalid `variable` option passed into `_.template`", p = "__lodash_hash_undefined__", M = 500, S = "__lodash_placeholder__", x = 1, w = 2, b = 4, C = 1, G = 2, O = 1, B = 2, z = 4, Y = 8, W = 16, X = 32, V = 64, K = 128, et = 256, j = 512, vt = 30, _t = "...", Mt = 800, kt = 16, it = 1, St = 2, Gt = 3, Dt = 1 / 0, $t = 9007199254740991, he = 17976931348623157e292, ht = NaN, Zt = 4294967295, le = Zt - 1, Me = Zt >>> 1, Nt = [
        ["ary", K],
        ["bind", O],
        ["bindKey", B],
        ["curry", Y],
        ["curryRight", W],
        ["flip", j],
        ["partial", X],
        ["partialRight", V],
        ["rearg", et]
      ], we = "[object Arguments]", xr = "[object Array]", Ua = "[object AsyncFunction]", U = "[object Boolean]", Hi = "[object Date]", Ht = "[object DOMException]", ft = "[object Error]", T = "[object Function]", nn = "[object GeneratorFunction]", Se = "[object Map]", qe = "[object Number]", za = "[object Null]", rn = "[object Object]", Ya = "[object Promise]", tt = "[object Proxy]", Si = "[object RegExp]", Be = "[object Set]", sn = "[object String]", Mr = "[object Symbol]", wt = "[object Undefined]", Pn = "[object WeakMap]", wr = "[object WeakSet]", jn = "[object ArrayBuffer]", dt = "[object DataView]", Vi = "[object Float32Array]", At = "[object Float64Array]", pt = "[object Int8Array]", _s = "[object Int16Array]", an = "[object Int32Array]", ds = "[object Uint8Array]", mt = "[object Uint8ClampedArray]", ms = "[object Uint16Array]", ys = "[object Uint32Array]", ps = /\b__p \+= '';/g, Ue = /\b(__p \+=) '' \+/g, Zi = /(__e\(.*?\)|\b__t\)) \+\n'';/g, un = /&(?:amp|lt|gt|quot|#39);/g, Es = /[&<>"']/g, Sr = RegExp(un.source), Lo = RegExp(Es.source), Xa = /<%-([\s\S]+?)%>/g, ti = /<%([\s\S]+?)%>/g, nt = /<%=([\s\S]+?)%>/g, Ir = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, Nr = /^\w*$/, Ki = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, kr = /[\\^$.*+?()[\]{}|]/g, xs = RegExp(kr.source), Pr = /^\s+/, ei = /\s/, Wa = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, Cr = /\{\n\/\* \[wrapped with (.+)\] \*/, Oo = /,? & /, $a = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, Go = /[()=,{}\[\]\/\s]/, Ce = /\\(\\)?/g, Ms = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, Ii = /\w*$/, ni = /^[-+]0x[0-9a-f]+$/i, ii = /^0b[01]+$/i, ws = /^\[object .+?Constructor\]$/, br = /^0o[0-7]+$/i, Ji = /^(?:0|[1-9]\d*)$/, re = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Rr = /($^)/, Do = /['\n\r\u2028\u2029\\]/g, ri = "\\ud800-\\udfff", Qi = "\\u0300-\\u036f", Ss = "\\ufe20-\\ufe2f", Is = "\\u20d0-\\u20ff", Ns = Qi + Ss + Is, Ha = "\\u2700-\\u27bf", ze = "a-z\\xdf-\\xf6\\xf8-\\xff", Ni = "\\xac\\xb1\\xd7\\xf7", ks = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", ki = "\\u2000-\\u206f", Ps = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", Va = "A-Z\\xc0-\\xd6\\xd8-\\xde", Za = "\\ufe0e\\ufe0f", Ka = Ni + ks + ki + Ps, Ar = "['’]", Ja = "[" + ri + "]", ji = "[" + Ka + "]", Ye = "[" + Ns + "]", Cn = "\\d+", Qa = "[" + Ha + "]", si = "[" + ze + "]", ja = "[^" + ri + Ka + Cn + Ha + ze + Va + "]", Cs = "\\ud83c[\\udffb-\\udfff]", Fo = "(?:" + Ye + "|" + Cs + ")", tu = "[^" + ri + "]", Tr = "(?:\\ud83c[\\udde6-\\uddff]){2}", ai = "[\\ud800-\\udbff][\\udc00-\\udfff]", ui = "[" + Va + "]", eu = "\\u200d", bs = "(?:" + si + "|" + ja + ")", qo = "(?:" + ui + "|" + ja + ")", Lr = "(?:" + Ar + "(?:d|ll|m|re|s|t|ve))?", Vt = "(?:" + Ar + "(?:D|LL|M|RE|S|T|VE))?", qn = Fo + "?", nu = "[" + Za + "]?", Rs = "(?:" + eu + "(?:" + [tu, Tr, ai].join("|") + ")" + nu + qn + ")*", Xe = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", We = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", tr = nu + qn + Rs, Bo = "(?:" + [Qa, Tr, ai].join("|") + ")" + tr, Uo = "(?:" + [tu + Ye + "?", Ye, Tr, ai, Ja].join("|") + ")", iu = RegExp(Ar, "g"), Or = RegExp(Ye, "g"), As = RegExp(Cs + "(?=" + Cs + ")|" + Uo + tr, "g"), ru = RegExp([
        ui + "?" + si + "+" + Lr + "(?=" + [ji, ui, "$"].join("|") + ")",
        qo + "+" + Vt + "(?=" + [ji, ui + bs, "$"].join("|") + ")",
        ui + "?" + bs + "+" + Lr,
        ui + "+" + Vt,
        We,
        Xe,
        Cn,
        Bo
      ].join("|"), "g"), Ft = RegExp("[" + eu + ri + Ns + Za + "]"), dn = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, Ts = [
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
      ], su = -1, Bt = {};
      Bt[Vi] = Bt[At] = Bt[pt] = Bt[_s] = Bt[an] = Bt[ds] = Bt[mt] = Bt[ms] = Bt[ys] = !0, Bt[we] = Bt[xr] = Bt[jn] = Bt[U] = Bt[dt] = Bt[Hi] = Bt[ft] = Bt[T] = Bt[Se] = Bt[qe] = Bt[rn] = Bt[Si] = Bt[Be] = Bt[sn] = Bt[Pn] = !1;
      var Xt = {};
      Xt[we] = Xt[xr] = Xt[jn] = Xt[dt] = Xt[U] = Xt[Hi] = Xt[Vi] = Xt[At] = Xt[pt] = Xt[_s] = Xt[an] = Xt[Se] = Xt[qe] = Xt[rn] = Xt[Si] = Xt[Be] = Xt[sn] = Xt[Mr] = Xt[ds] = Xt[mt] = Xt[ms] = Xt[ys] = !0, Xt[ft] = Xt[T] = Xt[Pn] = !1;
      var ye = {
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
      }, au = {
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
      }, uu = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      }, ou = parseFloat, zo = parseInt, Os = typeof ro == "object" && ro && ro.Object === Object && ro, bn = typeof self == "object" && self && self.Object === Object && self, ne = Os || bn || Function("return this")(), Gs = i && !i.nodeType && i, fe = Gs && !0 && n && !n.nodeType && n, oi = fe && fe.exports === Gs, Ds = oi && Os.process, ge = function() {
        try {
          var t = fe && fe.require && fe.require("util").types;
          return t || Ds && Ds.binding && Ds.binding("util");
        } catch {
        }
      }(), Fs = ge && ge.isArrayBuffer, hi = ge && ge.isDate, hu = ge && ge.isMap, on = ge && ge.isRegExp, qs = ge && ge.isSet, lu = ge && ge.isTypedArray;
      function be(t, e, s) {
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
      function Yo(t, e, s, h) {
        for (var v = -1, m = t == null ? 0 : t.length; ++v < m; ) {
          var E = t[v];
          e(h, E, s(E), t);
        }
        return h;
      }
      function $e(t, e) {
        for (var s = -1, h = t == null ? 0 : t.length; ++s < h && e(t[s], s, t) !== !1; )
          ;
        return t;
      }
      function Xo(t, e) {
        for (var s = t == null ? 0 : t.length; s-- && e(t[s], s, t) !== !1; )
          ;
        return t;
      }
      function fu(t, e) {
        for (var s = -1, h = t == null ? 0 : t.length; ++s < h; )
          if (!e(t[s], s, t))
            return !1;
        return !0;
      }
      function Bn(t, e) {
        for (var s = -1, h = t == null ? 0 : t.length, v = 0, m = []; ++s < h; ) {
          var E = t[s];
          e(E, s, t) && (m[v++] = E);
        }
        return m;
      }
      function mn(t, e) {
        var s = t == null ? 0 : t.length;
        return !!s && yn(t, e, 0) > -1;
      }
      function pe(t, e, s) {
        for (var h = -1, v = t == null ? 0 : t.length; ++h < v; )
          if (s(e, t[h]))
            return !0;
        return !1;
      }
      function Kt(t, e) {
        for (var s = -1, h = t == null ? 0 : t.length, v = Array(h); ++s < h; )
          v[s] = e(t[s], s, t);
        return v;
      }
      function Rn(t, e) {
        for (var s = -1, h = e.length, v = t.length; ++s < h; )
          t[v + s] = e[s];
        return t;
      }
      function Bs(t, e, s, h) {
        var v = -1, m = t == null ? 0 : t.length;
        for (h && m && (s = t[++v]); ++v < m; )
          s = e(s, t[v], v, t);
        return s;
      }
      function Us(t, e, s, h) {
        var v = t == null ? 0 : t.length;
        for (h && v && (s = t[--v]); v--; )
          s = e(s, t[v], v, t);
        return s;
      }
      function Gr(t, e) {
        for (var s = -1, h = t == null ? 0 : t.length; ++s < h; )
          if (e(t[s], s, t))
            return !0;
        return !1;
      }
      var zs = Dr("length");
      function cu(t) {
        return t.split("");
      }
      function hn(t) {
        return t.match($a) || [];
      }
      function Ys(t, e, s) {
        var h;
        return s(t, function(v, m, E) {
          if (e(v, m, E))
            return h = m, !1;
        }), h;
      }
      function _e(t, e, s, h) {
        for (var v = t.length, m = s + (h ? 1 : -1); h ? m-- : ++m < v; )
          if (e(t[m], m, t))
            return m;
        return -1;
      }
      function yn(t, e, s) {
        return e === e ? th(t, e, s) : _e(t, Xs, s);
      }
      function Wo(t, e, s, h) {
        for (var v = s - 1, m = t.length; ++v < m; )
          if (h(t[v], e))
            return v;
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
      function gu(t, e, s, h, v) {
        return v(t, function(m, E, N) {
          s = h ? (h = !1, m) : e(s, m, E, N);
        }), s;
      }
      function $o(t, e) {
        var s = t.length;
        for (t.sort(e); s--; )
          t[s] = t[s].value;
        return t;
      }
      function $s(t, e) {
        for (var s, h = -1, v = t.length; ++h < v; ) {
          var m = e(t[h]);
          m !== a && (s = s === a ? m : s + m);
        }
        return s;
      }
      function Hs(t, e) {
        for (var s = -1, h = Array(t); ++s < t; )
          h[s] = e(s);
        return h;
      }
      function Ho(t, e) {
        return Kt(e, function(s) {
          return [s, t[s]];
        });
      }
      function vu(t) {
        return t && t.slice(0, yu(t) + 1).replace(Pr, "");
      }
      function Re(t) {
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
      function _u(t, e) {
        for (var s = -1, h = t.length; ++s < h && yn(e, t[s], 0) > -1; )
          ;
        return s;
      }
      function Zs(t, e) {
        for (var s = t.length; s-- && yn(e, t[s], 0) > -1; )
          ;
        return s;
      }
      function Vo(t, e) {
        for (var s = t.length, h = 0; s--; )
          t[s] === e && ++h;
        return h;
      }
      var Zo = er(ye), Ko = er(au);
      function Jo(t) {
        return "\\" + uu[t];
      }
      function Qo(t, e) {
        return t == null ? a : t[e];
      }
      function Ci(t) {
        return Ft.test(t);
      }
      function jo(t) {
        return dn.test(t);
      }
      function du(t) {
        for (var e, s = []; !(e = t.next()).done; )
          s.push(e.value);
        return s;
      }
      function Fr(t) {
        var e = -1, s = Array(t.size);
        return t.forEach(function(h, v) {
          s[++e] = [v, h];
        }), s;
      }
      function Ks(t, e) {
        return function(s) {
          return t(e(s));
        };
      }
      function Un(t, e) {
        for (var s = -1, h = t.length, v = 0, m = []; ++s < h; ) {
          var E = t[s];
          (E === e || E === S) && (t[s] = S, m[v++] = s);
        }
        return m;
      }
      function nr(t) {
        var e = -1, s = Array(t.size);
        return t.forEach(function(h) {
          s[++e] = h;
        }), s;
      }
      function Js(t) {
        var e = -1, s = Array(t.size);
        return t.forEach(function(h) {
          s[++e] = [h, h];
        }), s;
      }
      function th(t, e, s) {
        for (var h = s - 1, v = t.length; ++h < v; )
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
      function li(t) {
        return Ci(t) ? eh(t) : zs(t);
      }
      function ln(t) {
        return Ci(t) ? pu(t) : cu(t);
      }
      function yu(t) {
        for (var e = t.length; e-- && ei.test(t.charAt(e)); )
          ;
        return e;
      }
      var bi = er(Ls);
      function eh(t) {
        for (var e = As.lastIndex = 0; As.test(t); )
          ++e;
        return e;
      }
      function pu(t) {
        return t.match(As) || [];
      }
      function He(t) {
        return t.match(ru) || [];
      }
      var pn = function t(e) {
        e = e == null ? ne : u.defaults(ne.Object(), e, u.pick(ne, Ts));
        var s = e.Array, h = e.Date, v = e.Error, m = e.Function, E = e.Math, N = e.Object, R = e.RegExp, D = e.String, q = e.TypeError, Z = s.prototype, rt = m.prototype, ot = N.prototype, gt = e["__core-js_shared__"], bt = rt.toString, lt = ot.hasOwnProperty, Wt = 0, ce = function() {
          var r = /[^.]+$/.exec(gt && gt.keys && gt.keys.IE_PROTO || "");
          return r ? "Symbol(src)_1." + r : "";
        }(), se = ot.toString, fi = bt.call(N), ir = ne._, Eu = R(
          "^" + bt.call(lt).replace(kr, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), rr = oi ? e.Buffer : a, An = e.Symbol, sr = e.Uint8Array, Qs = rr ? rr.allocUnsafe : a, ar = Ks(N.getPrototypeOf, N), qr = N.create, Br = ot.propertyIsEnumerable, xu = Z.splice, Fl = An ? An.isConcatSpreadable : a, js = An ? An.iterator : a, ur = An ? An.toStringTag : a, Mu = function() {
          try {
            var r = cr(N, "defineProperty");
            return r({}, "", {}), r;
          } catch {
          }
        }(), P0 = e.clearTimeout !== ne.clearTimeout && e.clearTimeout, C0 = h && h.now !== ne.Date.now && h.now, b0 = e.setTimeout !== ne.setTimeout && e.setTimeout, wu = E.ceil, Su = E.floor, nh = N.getOwnPropertySymbols, R0 = rr ? rr.isBuffer : a, ql = e.isFinite, A0 = Z.join, T0 = Ks(N.keys, N), ve = E.max, Ie = E.min, L0 = h.now, O0 = e.parseInt, Bl = E.random, G0 = Z.reverse, ih = cr(e, "DataView"), ta = cr(e, "Map"), rh = cr(e, "Promise"), Ur = cr(e, "Set"), ea = cr(e, "WeakMap"), na = cr(N, "create"), Iu = ea && new ea(), zr = {}, D0 = gr(ih), F0 = gr(ta), q0 = gr(rh), B0 = gr(Ur), U0 = gr(ea), Nu = An ? An.prototype : a, ia = Nu ? Nu.valueOf : a, Ul = Nu ? Nu.toString : a;
        function k(r) {
          if (ie(r) && !It(r) && !(r instanceof Lt)) {
            if (r instanceof En)
              return r;
            if (lt.call(r, "__wrapped__"))
              return Yf(r);
          }
          return new En(r);
        }
        var Yr = /* @__PURE__ */ function() {
          function r() {
          }
          return function(o) {
            if (!Qt(o))
              return {};
            if (qr)
              return qr(o);
            r.prototype = o;
            var c = new r();
            return r.prototype = a, c;
          };
        }();
        function ku() {
        }
        function En(r, o) {
          this.__wrapped__ = r, this.__actions__ = [], this.__chain__ = !!o, this.__index__ = 0, this.__values__ = a;
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
        }, k.prototype = ku.prototype, k.prototype.constructor = k, En.prototype = Yr(ku.prototype), En.prototype.constructor = En;
        function Lt(r) {
          this.__wrapped__ = r, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = Zt, this.__views__ = [];
        }
        function z0() {
          var r = new Lt(this.__wrapped__);
          return r.__actions__ = Ve(this.__actions__), r.__dir__ = this.__dir__, r.__filtered__ = this.__filtered__, r.__iteratees__ = Ve(this.__iteratees__), r.__takeCount__ = this.__takeCount__, r.__views__ = Ve(this.__views__), r;
        }
        function Y0() {
          if (this.__filtered__) {
            var r = new Lt(this);
            r.__dir__ = -1, r.__filtered__ = !0;
          } else
            r = this.clone(), r.__dir__ *= -1;
          return r;
        }
        function X0() {
          var r = this.__wrapped__.value(), o = this.__dir__, c = It(r), y = o < 0, I = c ? r.length : 0, P = n_(0, I, this.__views__), A = P.start, L = P.end, F = L - A, $ = y ? L : A - 1, H = this.__iteratees__, J = H.length, at = 0, ct = Ie(F, this.__takeCount__);
          if (!c || !y && I == F && ct == F)
            return cf(r, this.__actions__);
          var Et = [];
          t:
            for (; F-- && at < ct; ) {
              $ += o;
              for (var Ct = -1, xt = r[$]; ++Ct < J; ) {
                var Tt = H[Ct], Ot = Tt.iteratee, gn = Tt.type, Le = Ot(xt);
                if (gn == St)
                  xt = Le;
                else if (!Le) {
                  if (gn == it)
                    continue t;
                  break t;
                }
              }
              Et[at++] = xt;
            }
          return Et;
        }
        Lt.prototype = Yr(ku.prototype), Lt.prototype.constructor = Lt;
        function or(r) {
          var o = -1, c = r == null ? 0 : r.length;
          for (this.clear(); ++o < c; ) {
            var y = r[o];
            this.set(y[0], y[1]);
          }
        }
        function W0() {
          this.__data__ = na ? na(null) : {}, this.size = 0;
        }
        function $0(r) {
          var o = this.has(r) && delete this.__data__[r];
          return this.size -= o ? 1 : 0, o;
        }
        function H0(r) {
          var o = this.__data__;
          if (na) {
            var c = o[r];
            return c === p ? a : c;
          }
          return lt.call(o, r) ? o[r] : a;
        }
        function V0(r) {
          var o = this.__data__;
          return na ? o[r] !== a : lt.call(o, r);
        }
        function Z0(r, o) {
          var c = this.__data__;
          return this.size += this.has(r) ? 0 : 1, c[r] = na && o === a ? p : o, this;
        }
        or.prototype.clear = W0, or.prototype.delete = $0, or.prototype.get = H0, or.prototype.has = V0, or.prototype.set = Z0;
        function ci(r) {
          var o = -1, c = r == null ? 0 : r.length;
          for (this.clear(); ++o < c; ) {
            var y = r[o];
            this.set(y[0], y[1]);
          }
        }
        function K0() {
          this.__data__ = [], this.size = 0;
        }
        function J0(r) {
          var o = this.__data__, c = Pu(o, r);
          if (c < 0)
            return !1;
          var y = o.length - 1;
          return c == y ? o.pop() : xu.call(o, c, 1), --this.size, !0;
        }
        function Q0(r) {
          var o = this.__data__, c = Pu(o, r);
          return c < 0 ? a : o[c][1];
        }
        function j0(r) {
          return Pu(this.__data__, r) > -1;
        }
        function tv(r, o) {
          var c = this.__data__, y = Pu(c, r);
          return y < 0 ? (++this.size, c.push([r, o])) : c[y][1] = o, this;
        }
        ci.prototype.clear = K0, ci.prototype.delete = J0, ci.prototype.get = Q0, ci.prototype.has = j0, ci.prototype.set = tv;
        function gi(r) {
          var o = -1, c = r == null ? 0 : r.length;
          for (this.clear(); ++o < c; ) {
            var y = r[o];
            this.set(y[0], y[1]);
          }
        }
        function ev() {
          this.size = 0, this.__data__ = {
            hash: new or(),
            map: new (ta || ci)(),
            string: new or()
          };
        }
        function nv(r) {
          var o = Bu(this, r).delete(r);
          return this.size -= o ? 1 : 0, o;
        }
        function iv(r) {
          return Bu(this, r).get(r);
        }
        function rv(r) {
          return Bu(this, r).has(r);
        }
        function sv(r, o) {
          var c = Bu(this, r), y = c.size;
          return c.set(r, o), this.size += c.size == y ? 0 : 1, this;
        }
        gi.prototype.clear = ev, gi.prototype.delete = nv, gi.prototype.get = iv, gi.prototype.has = rv, gi.prototype.set = sv;
        function hr(r) {
          var o = -1, c = r == null ? 0 : r.length;
          for (this.__data__ = new gi(); ++o < c; )
            this.add(r[o]);
        }
        function av(r) {
          return this.__data__.set(r, p), this;
        }
        function uv(r) {
          return this.__data__.has(r);
        }
        hr.prototype.add = hr.prototype.push = av, hr.prototype.has = uv;
        function Tn(r) {
          var o = this.__data__ = new ci(r);
          this.size = o.size;
        }
        function ov() {
          this.__data__ = new ci(), this.size = 0;
        }
        function hv(r) {
          var o = this.__data__, c = o.delete(r);
          return this.size = o.size, c;
        }
        function lv(r) {
          return this.__data__.get(r);
        }
        function fv(r) {
          return this.__data__.has(r);
        }
        function cv(r, o) {
          var c = this.__data__;
          if (c instanceof ci) {
            var y = c.__data__;
            if (!ta || y.length < f - 1)
              return y.push([r, o]), this.size = ++c.size, this;
            c = this.__data__ = new gi(y);
          }
          return c.set(r, o), this.size = c.size, this;
        }
        Tn.prototype.clear = ov, Tn.prototype.delete = hv, Tn.prototype.get = lv, Tn.prototype.has = fv, Tn.prototype.set = cv;
        function zl(r, o) {
          var c = It(r), y = !c && vr(r), I = !c && !y && Oi(r), P = !c && !y && !I && Hr(r), A = c || y || I || P, L = A ? Hs(r.length, D) : [], F = L.length;
          for (var $ in r)
            (o || lt.call(r, $)) && !(A && // Safari 9 has enumerable `arguments.length` in strict mode.
            ($ == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            I && ($ == "offset" || $ == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            P && ($ == "buffer" || $ == "byteLength" || $ == "byteOffset") || // Skip index properties.
            mi($, F))) && L.push($);
          return L;
        }
        function Yl(r) {
          var o = r.length;
          return o ? r[_h(0, o - 1)] : a;
        }
        function gv(r, o) {
          return Uu(Ve(r), lr(o, 0, r.length));
        }
        function vv(r) {
          return Uu(Ve(r));
        }
        function sh(r, o, c) {
          (c !== a && !Ln(r[o], c) || c === a && !(o in r)) && vi(r, o, c);
        }
        function ra(r, o, c) {
          var y = r[o];
          (!(lt.call(r, o) && Ln(y, c)) || c === a && !(o in r)) && vi(r, o, c);
        }
        function Pu(r, o) {
          for (var c = r.length; c--; )
            if (Ln(r[c][0], o))
              return c;
          return -1;
        }
        function _v(r, o, c, y) {
          return Ri(r, function(I, P, A) {
            o(y, I, c(I), A);
          }), y;
        }
        function Xl(r, o) {
          return r && Yn(o, de(o), r);
        }
        function dv(r, o) {
          return r && Yn(o, Ke(o), r);
        }
        function vi(r, o, c) {
          o == "__proto__" && Mu ? Mu(r, o, {
            configurable: !0,
            enumerable: !0,
            value: c,
            writable: !0
          }) : r[o] = c;
        }
        function ah(r, o) {
          for (var c = -1, y = o.length, I = s(y), P = r == null; ++c < y; )
            I[c] = P ? a : Bh(r, o[c]);
          return I;
        }
        function lr(r, o, c) {
          return r === r && (c !== a && (r = r <= c ? r : c), o !== a && (r = r >= o ? r : o)), r;
        }
        function xn(r, o, c, y, I, P) {
          var A, L = o & x, F = o & w, $ = o & b;
          if (c && (A = I ? c(r, y, I, P) : c(r)), A !== a)
            return A;
          if (!Qt(r))
            return r;
          var H = It(r);
          if (H) {
            if (A = r_(r), !L)
              return Ve(r, A);
          } else {
            var J = Ne(r), at = J == T || J == nn;
            if (Oi(r))
              return _f(r, L);
            if (J == rn || J == we || at && !I) {
              if (A = F || at ? {} : Lf(r), !L)
                return F ? Hv(r, dv(A, r)) : $v(r, Xl(A, r));
            } else {
              if (!Xt[J])
                return I ? r : {};
              A = s_(r, J, L);
            }
          }
          P || (P = new Tn());
          var ct = P.get(r);
          if (ct)
            return ct;
          P.set(r, A), hc(r) ? r.forEach(function(xt) {
            A.add(xn(xt, o, c, xt, r, P));
          }) : uc(r) && r.forEach(function(xt, Tt) {
            A.set(Tt, xn(xt, o, c, Tt, r, P));
          });
          var Et = $ ? F ? Nh : Ih : F ? Ke : de, Ct = H ? a : Et(r);
          return $e(Ct || r, function(xt, Tt) {
            Ct && (Tt = xt, xt = r[Tt]), ra(A, Tt, xn(xt, o, c, Tt, r, P));
          }), A;
        }
        function mv(r) {
          var o = de(r);
          return function(c) {
            return Wl(c, r, o);
          };
        }
        function Wl(r, o, c) {
          var y = c.length;
          if (r == null)
            return !y;
          for (r = N(r); y--; ) {
            var I = c[y], P = o[I], A = r[I];
            if (A === a && !(I in r) || !P(A))
              return !1;
          }
          return !0;
        }
        function $l(r, o, c) {
          if (typeof r != "function")
            throw new q(d);
          return fa(function() {
            r.apply(a, c);
          }, o);
        }
        function sa(r, o, c, y) {
          var I = -1, P = mn, A = !0, L = r.length, F = [], $ = o.length;
          if (!L)
            return F;
          c && (o = Kt(o, Re(c))), y ? (P = pe, A = !1) : o.length >= f && (P = Pi, A = !1, o = new hr(o));
          t:
            for (; ++I < L; ) {
              var H = r[I], J = c == null ? H : c(H);
              if (H = y || H !== 0 ? H : 0, A && J === J) {
                for (var at = $; at--; )
                  if (o[at] === J)
                    continue t;
                F.push(H);
              } else P(o, J, y) || F.push(H);
            }
          return F;
        }
        var Ri = Ef(zn), Hl = Ef(oh, !0);
        function yv(r, o) {
          var c = !0;
          return Ri(r, function(y, I, P) {
            return c = !!o(y, I, P), c;
          }), c;
        }
        function Cu(r, o, c) {
          for (var y = -1, I = r.length; ++y < I; ) {
            var P = r[y], A = o(P);
            if (A != null && (L === a ? A === A && !cn(A) : c(A, L)))
              var L = A, F = P;
          }
          return F;
        }
        function pv(r, o, c, y) {
          var I = r.length;
          for (c = Pt(c), c < 0 && (c = -c > I ? 0 : I + c), y = y === a || y > I ? I : Pt(y), y < 0 && (y += I), y = c > y ? 0 : fc(y); c < y; )
            r[c++] = o;
          return r;
        }
        function Vl(r, o) {
          var c = [];
          return Ri(r, function(y, I, P) {
            o(y, I, P) && c.push(y);
          }), c;
        }
        function Ee(r, o, c, y, I) {
          var P = -1, A = r.length;
          for (c || (c = u_), I || (I = []); ++P < A; ) {
            var L = r[P];
            o > 0 && c(L) ? o > 1 ? Ee(L, o - 1, c, y, I) : Rn(I, L) : y || (I[I.length] = L);
          }
          return I;
        }
        var uh = xf(), Zl = xf(!0);
        function zn(r, o) {
          return r && uh(r, o, de);
        }
        function oh(r, o) {
          return r && Zl(r, o, de);
        }
        function bu(r, o) {
          return Bn(o, function(c) {
            return yi(r[c]);
          });
        }
        function fr(r, o) {
          o = Ti(o, r);
          for (var c = 0, y = o.length; r != null && c < y; )
            r = r[Xn(o[c++])];
          return c && c == y ? r : a;
        }
        function Kl(r, o, c) {
          var y = o(r);
          return It(r) ? y : Rn(y, c(r));
        }
        function Ae(r) {
          return r == null ? r === a ? wt : za : ur && ur in N(r) ? e_(r) : v_(r);
        }
        function hh(r, o) {
          return r > o;
        }
        function Ev(r, o) {
          return r != null && lt.call(r, o);
        }
        function xv(r, o) {
          return r != null && o in N(r);
        }
        function Mv(r, o, c) {
          return r >= Ie(o, c) && r < ve(o, c);
        }
        function lh(r, o, c) {
          for (var y = c ? pe : mn, I = r[0].length, P = r.length, A = P, L = s(P), F = 1 / 0, $ = []; A--; ) {
            var H = r[A];
            A && o && (H = Kt(H, Re(o))), F = Ie(H.length, F), L[A] = !c && (o || I >= 120 && H.length >= 120) ? new hr(A && H) : a;
          }
          H = r[0];
          var J = -1, at = L[0];
          t:
            for (; ++J < I && $.length < F; ) {
              var ct = H[J], Et = o ? o(ct) : ct;
              if (ct = c || ct !== 0 ? ct : 0, !(at ? Pi(at, Et) : y($, Et, c))) {
                for (A = P; --A; ) {
                  var Ct = L[A];
                  if (!(Ct ? Pi(Ct, Et) : y(r[A], Et, c)))
                    continue t;
                }
                at && at.push(Et), $.push(ct);
              }
            }
          return $;
        }
        function wv(r, o, c, y) {
          return zn(r, function(I, P, A) {
            o(y, c(I), P, A);
          }), y;
        }
        function aa(r, o, c) {
          o = Ti(o, r), r = Ff(r, o);
          var y = r == null ? r : r[Xn(wn(o))];
          return y == null ? a : be(y, r, c);
        }
        function Jl(r) {
          return ie(r) && Ae(r) == we;
        }
        function Sv(r) {
          return ie(r) && Ae(r) == jn;
        }
        function Iv(r) {
          return ie(r) && Ae(r) == Hi;
        }
        function ua(r, o, c, y, I) {
          return r === o ? !0 : r == null || o == null || !ie(r) && !ie(o) ? r !== r && o !== o : Nv(r, o, c, y, ua, I);
        }
        function Nv(r, o, c, y, I, P) {
          var A = It(r), L = It(o), F = A ? xr : Ne(r), $ = L ? xr : Ne(o);
          F = F == we ? rn : F, $ = $ == we ? rn : $;
          var H = F == rn, J = $ == rn, at = F == $;
          if (at && Oi(r)) {
            if (!Oi(o))
              return !1;
            A = !0, H = !1;
          }
          if (at && !H)
            return P || (P = new Tn()), A || Hr(r) ? Rf(r, o, c, y, I, P) : jv(r, o, F, c, y, I, P);
          if (!(c & C)) {
            var ct = H && lt.call(r, "__wrapped__"), Et = J && lt.call(o, "__wrapped__");
            if (ct || Et) {
              var Ct = ct ? r.value() : r, xt = Et ? o.value() : o;
              return P || (P = new Tn()), I(Ct, xt, c, y, P);
            }
          }
          return at ? (P || (P = new Tn()), t_(r, o, c, y, I, P)) : !1;
        }
        function kv(r) {
          return ie(r) && Ne(r) == Se;
        }
        function fh(r, o, c, y) {
          var I = c.length, P = I, A = !y;
          if (r == null)
            return !P;
          for (r = N(r); I--; ) {
            var L = c[I];
            if (A && L[2] ? L[1] !== r[L[0]] : !(L[0] in r))
              return !1;
          }
          for (; ++I < P; ) {
            L = c[I];
            var F = L[0], $ = r[F], H = L[1];
            if (A && L[2]) {
              if ($ === a && !(F in r))
                return !1;
            } else {
              var J = new Tn();
              if (y)
                var at = y($, H, F, r, o, J);
              if (!(at === a ? ua(H, $, C | G, y, J) : at))
                return !1;
            }
          }
          return !0;
        }
        function Ql(r) {
          if (!Qt(r) || h_(r))
            return !1;
          var o = yi(r) ? Eu : ws;
          return o.test(gr(r));
        }
        function Pv(r) {
          return ie(r) && Ae(r) == Si;
        }
        function Cv(r) {
          return ie(r) && Ne(r) == Be;
        }
        function bv(r) {
          return ie(r) && Hu(r.length) && !!Bt[Ae(r)];
        }
        function jl(r) {
          return typeof r == "function" ? r : r == null ? Je : typeof r == "object" ? It(r) ? nf(r[0], r[1]) : ef(r) : Mc(r);
        }
        function ch(r) {
          if (!la(r))
            return T0(r);
          var o = [];
          for (var c in N(r))
            lt.call(r, c) && c != "constructor" && o.push(c);
          return o;
        }
        function Rv(r) {
          if (!Qt(r))
            return g_(r);
          var o = la(r), c = [];
          for (var y in r)
            y == "constructor" && (o || !lt.call(r, y)) || c.push(y);
          return c;
        }
        function gh(r, o) {
          return r < o;
        }
        function tf(r, o) {
          var c = -1, y = Ze(r) ? s(r.length) : [];
          return Ri(r, function(I, P, A) {
            y[++c] = o(I, P, A);
          }), y;
        }
        function ef(r) {
          var o = Ph(r);
          return o.length == 1 && o[0][2] ? Gf(o[0][0], o[0][1]) : function(c) {
            return c === r || fh(c, r, o);
          };
        }
        function nf(r, o) {
          return bh(r) && Of(o) ? Gf(Xn(r), o) : function(c) {
            var y = Bh(c, r);
            return y === a && y === o ? Uh(c, r) : ua(o, y, C | G);
          };
        }
        function Ru(r, o, c, y, I) {
          r !== o && uh(o, function(P, A) {
            if (I || (I = new Tn()), Qt(P))
              Av(r, o, A, c, Ru, y, I);
            else {
              var L = y ? y(Ah(r, A), P, A + "", r, o, I) : a;
              L === a && (L = P), sh(r, A, L);
            }
          }, Ke);
        }
        function Av(r, o, c, y, I, P, A) {
          var L = Ah(r, c), F = Ah(o, c), $ = A.get(F);
          if ($) {
            sh(r, c, $);
            return;
          }
          var H = P ? P(L, F, c + "", r, o, A) : a, J = H === a;
          if (J) {
            var at = It(F), ct = !at && Oi(F), Et = !at && !ct && Hr(F);
            H = F, at || ct || Et ? It(L) ? H = L : ae(L) ? H = Ve(L) : ct ? (J = !1, H = _f(F, !0)) : Et ? (J = !1, H = df(F, !0)) : H = [] : ca(F) || vr(F) ? (H = L, vr(L) ? H = cc(L) : (!Qt(L) || yi(L)) && (H = Lf(F))) : J = !1;
          }
          J && (A.set(F, H), I(H, F, y, P, A), A.delete(F)), sh(r, c, H);
        }
        function rf(r, o) {
          var c = r.length;
          if (c)
            return o += o < 0 ? c : 0, mi(o, c) ? r[o] : a;
        }
        function sf(r, o, c) {
          o.length ? o = Kt(o, function(P) {
            return It(P) ? function(A) {
              return fr(A, P.length === 1 ? P[0] : P);
            } : P;
          }) : o = [Je];
          var y = -1;
          o = Kt(o, Re(yt()));
          var I = tf(r, function(P, A, L) {
            var F = Kt(o, function($) {
              return $(P);
            });
            return { criteria: F, index: ++y, value: P };
          });
          return $o(I, function(P, A) {
            return Wv(P, A, c);
          });
        }
        function Tv(r, o) {
          return af(r, o, function(c, y) {
            return Uh(r, y);
          });
        }
        function af(r, o, c) {
          for (var y = -1, I = o.length, P = {}; ++y < I; ) {
            var A = o[y], L = fr(r, A);
            c(L, A) && oa(P, Ti(A, r), L);
          }
          return P;
        }
        function Lv(r) {
          return function(o) {
            return fr(o, r);
          };
        }
        function vh(r, o, c, y) {
          var I = y ? Wo : yn, P = -1, A = o.length, L = r;
          for (r === o && (o = Ve(o)), c && (L = Kt(r, Re(c))); ++P < A; )
            for (var F = 0, $ = o[P], H = c ? c($) : $; (F = I(L, H, F, y)) > -1; )
              L !== r && xu.call(L, F, 1), xu.call(r, F, 1);
          return r;
        }
        function uf(r, o) {
          for (var c = r ? o.length : 0, y = c - 1; c--; ) {
            var I = o[c];
            if (c == y || I !== P) {
              var P = I;
              mi(I) ? xu.call(r, I, 1) : yh(r, I);
            }
          }
          return r;
        }
        function _h(r, o) {
          return r + Su(Bl() * (o - r + 1));
        }
        function Ov(r, o, c, y) {
          for (var I = -1, P = ve(wu((o - r) / (c || 1)), 0), A = s(P); P--; )
            A[y ? P : ++I] = r, r += c;
          return A;
        }
        function dh(r, o) {
          var c = "";
          if (!r || o < 1 || o > $t)
            return c;
          do
            o % 2 && (c += r), o = Su(o / 2), o && (r += r);
          while (o);
          return c;
        }
        function Rt(r, o) {
          return Th(Df(r, o, Je), r + "");
        }
        function Gv(r) {
          return Yl(Vr(r));
        }
        function Dv(r, o) {
          var c = Vr(r);
          return Uu(c, lr(o, 0, c.length));
        }
        function oa(r, o, c, y) {
          if (!Qt(r))
            return r;
          o = Ti(o, r);
          for (var I = -1, P = o.length, A = P - 1, L = r; L != null && ++I < P; ) {
            var F = Xn(o[I]), $ = c;
            if (F === "__proto__" || F === "constructor" || F === "prototype")
              return r;
            if (I != A) {
              var H = L[F];
              $ = y ? y(H, F, L) : a, $ === a && ($ = Qt(H) ? H : mi(o[I + 1]) ? [] : {});
            }
            ra(L, F, $), L = L[F];
          }
          return r;
        }
        var of = Iu ? function(r, o) {
          return Iu.set(r, o), r;
        } : Je, Fv = Mu ? function(r, o) {
          return Mu(r, "toString", {
            configurable: !0,
            enumerable: !1,
            value: Yh(o),
            writable: !0
          });
        } : Je;
        function qv(r) {
          return Uu(Vr(r));
        }
        function Mn(r, o, c) {
          var y = -1, I = r.length;
          o < 0 && (o = -o > I ? 0 : I + o), c = c > I ? I : c, c < 0 && (c += I), I = o > c ? 0 : c - o >>> 0, o >>>= 0;
          for (var P = s(I); ++y < I; )
            P[y] = r[y + o];
          return P;
        }
        function Bv(r, o) {
          var c;
          return Ri(r, function(y, I, P) {
            return c = o(y, I, P), !c;
          }), !!c;
        }
        function Au(r, o, c) {
          var y = 0, I = r == null ? y : r.length;
          if (typeof o == "number" && o === o && I <= Me) {
            for (; y < I; ) {
              var P = y + I >>> 1, A = r[P];
              A !== null && !cn(A) && (c ? A <= o : A < o) ? y = P + 1 : I = P;
            }
            return I;
          }
          return mh(r, o, Je, c);
        }
        function mh(r, o, c, y) {
          var I = 0, P = r == null ? 0 : r.length;
          if (P === 0)
            return 0;
          o = c(o);
          for (var A = o !== o, L = o === null, F = cn(o), $ = o === a; I < P; ) {
            var H = Su((I + P) / 2), J = c(r[H]), at = J !== a, ct = J === null, Et = J === J, Ct = cn(J);
            if (A)
              var xt = y || Et;
            else $ ? xt = Et && (y || at) : L ? xt = Et && at && (y || !ct) : F ? xt = Et && at && !ct && (y || !Ct) : ct || Ct ? xt = !1 : xt = y ? J <= o : J < o;
            xt ? I = H + 1 : P = H;
          }
          return Ie(P, le);
        }
        function hf(r, o) {
          for (var c = -1, y = r.length, I = 0, P = []; ++c < y; ) {
            var A = r[c], L = o ? o(A) : A;
            if (!c || !Ln(L, F)) {
              var F = L;
              P[I++] = A === 0 ? 0 : A;
            }
          }
          return P;
        }
        function lf(r) {
          return typeof r == "number" ? r : cn(r) ? ht : +r;
        }
        function fn(r) {
          if (typeof r == "string")
            return r;
          if (It(r))
            return Kt(r, fn) + "";
          if (cn(r))
            return Ul ? Ul.call(r) : "";
          var o = r + "";
          return o == "0" && 1 / r == -Dt ? "-0" : o;
        }
        function Ai(r, o, c) {
          var y = -1, I = mn, P = r.length, A = !0, L = [], F = L;
          if (c)
            A = !1, I = pe;
          else if (P >= f) {
            var $ = o ? null : Jv(r);
            if ($)
              return nr($);
            A = !1, I = Pi, F = new hr();
          } else
            F = o ? [] : L;
          t:
            for (; ++y < P; ) {
              var H = r[y], J = o ? o(H) : H;
              if (H = c || H !== 0 ? H : 0, A && J === J) {
                for (var at = F.length; at--; )
                  if (F[at] === J)
                    continue t;
                o && F.push(J), L.push(H);
              } else I(F, J, c) || (F !== L && F.push(J), L.push(H));
            }
          return L;
        }
        function yh(r, o) {
          return o = Ti(o, r), r = Ff(r, o), r == null || delete r[Xn(wn(o))];
        }
        function ff(r, o, c, y) {
          return oa(r, o, c(fr(r, o)), y);
        }
        function Tu(r, o, c, y) {
          for (var I = r.length, P = y ? I : -1; (y ? P-- : ++P < I) && o(r[P], P, r); )
            ;
          return c ? Mn(r, y ? 0 : P, y ? P + 1 : I) : Mn(r, y ? P + 1 : 0, y ? I : P);
        }
        function cf(r, o) {
          var c = r;
          return c instanceof Lt && (c = c.value()), Bs(o, function(y, I) {
            return I.func.apply(I.thisArg, Rn([y], I.args));
          }, c);
        }
        function ph(r, o, c) {
          var y = r.length;
          if (y < 2)
            return y ? Ai(r[0]) : [];
          for (var I = -1, P = s(y); ++I < y; )
            for (var A = r[I], L = -1; ++L < y; )
              L != I && (P[I] = sa(P[I] || A, r[L], o, c));
          return Ai(Ee(P, 1), o, c);
        }
        function gf(r, o, c) {
          for (var y = -1, I = r.length, P = o.length, A = {}; ++y < I; ) {
            var L = y < P ? o[y] : a;
            c(A, r[y], L);
          }
          return A;
        }
        function Eh(r) {
          return ae(r) ? r : [];
        }
        function xh(r) {
          return typeof r == "function" ? r : Je;
        }
        function Ti(r, o) {
          return It(r) ? r : bh(r, o) ? [r] : zf(Ut(r));
        }
        var Uv = Rt;
        function Li(r, o, c) {
          var y = r.length;
          return c = c === a ? y : c, !o && c >= y ? r : Mn(r, o, c);
        }
        var vf = P0 || function(r) {
          return ne.clearTimeout(r);
        };
        function _f(r, o) {
          if (o)
            return r.slice();
          var c = r.length, y = Qs ? Qs(c) : new r.constructor(c);
          return r.copy(y), y;
        }
        function Mh(r) {
          var o = new r.constructor(r.byteLength);
          return new sr(o).set(new sr(r)), o;
        }
        function zv(r, o) {
          var c = o ? Mh(r.buffer) : r.buffer;
          return new r.constructor(c, r.byteOffset, r.byteLength);
        }
        function Yv(r) {
          var o = new r.constructor(r.source, Ii.exec(r));
          return o.lastIndex = r.lastIndex, o;
        }
        function Xv(r) {
          return ia ? N(ia.call(r)) : {};
        }
        function df(r, o) {
          var c = o ? Mh(r.buffer) : r.buffer;
          return new r.constructor(c, r.byteOffset, r.length);
        }
        function mf(r, o) {
          if (r !== o) {
            var c = r !== a, y = r === null, I = r === r, P = cn(r), A = o !== a, L = o === null, F = o === o, $ = cn(o);
            if (!L && !$ && !P && r > o || P && A && F && !L && !$ || y && A && F || !c && F || !I)
              return 1;
            if (!y && !P && !$ && r < o || $ && c && I && !y && !P || L && c && I || !A && I || !F)
              return -1;
          }
          return 0;
        }
        function Wv(r, o, c) {
          for (var y = -1, I = r.criteria, P = o.criteria, A = I.length, L = c.length; ++y < A; ) {
            var F = mf(I[y], P[y]);
            if (F) {
              if (y >= L)
                return F;
              var $ = c[y];
              return F * ($ == "desc" ? -1 : 1);
            }
          }
          return r.index - o.index;
        }
        function yf(r, o, c, y) {
          for (var I = -1, P = r.length, A = c.length, L = -1, F = o.length, $ = ve(P - A, 0), H = s(F + $), J = !y; ++L < F; )
            H[L] = o[L];
          for (; ++I < A; )
            (J || I < P) && (H[c[I]] = r[I]);
          for (; $--; )
            H[L++] = r[I++];
          return H;
        }
        function pf(r, o, c, y) {
          for (var I = -1, P = r.length, A = -1, L = c.length, F = -1, $ = o.length, H = ve(P - L, 0), J = s(H + $), at = !y; ++I < H; )
            J[I] = r[I];
          for (var ct = I; ++F < $; )
            J[ct + F] = o[F];
          for (; ++A < L; )
            (at || I < P) && (J[ct + c[A]] = r[I++]);
          return J;
        }
        function Ve(r, o) {
          var c = -1, y = r.length;
          for (o || (o = s(y)); ++c < y; )
            o[c] = r[c];
          return o;
        }
        function Yn(r, o, c, y) {
          var I = !c;
          c || (c = {});
          for (var P = -1, A = o.length; ++P < A; ) {
            var L = o[P], F = y ? y(c[L], r[L], L, c, r) : a;
            F === a && (F = r[L]), I ? vi(c, L, F) : ra(c, L, F);
          }
          return c;
        }
        function $v(r, o) {
          return Yn(r, Ch(r), o);
        }
        function Hv(r, o) {
          return Yn(r, Af(r), o);
        }
        function Lu(r, o) {
          return function(c, y) {
            var I = It(c) ? Yo : _v, P = o ? o() : {};
            return I(c, r, yt(y, 2), P);
          };
        }
        function Xr(r) {
          return Rt(function(o, c) {
            var y = -1, I = c.length, P = I > 1 ? c[I - 1] : a, A = I > 2 ? c[2] : a;
            for (P = r.length > 3 && typeof P == "function" ? (I--, P) : a, A && Te(c[0], c[1], A) && (P = I < 3 ? a : P, I = 1), o = N(o); ++y < I; ) {
              var L = c[y];
              L && r(o, L, y, P);
            }
            return o;
          });
        }
        function Ef(r, o) {
          return function(c, y) {
            if (c == null)
              return c;
            if (!Ze(c))
              return r(c, y);
            for (var I = c.length, P = o ? I : -1, A = N(c); (o ? P-- : ++P < I) && y(A[P], P, A) !== !1; )
              ;
            return c;
          };
        }
        function xf(r) {
          return function(o, c, y) {
            for (var I = -1, P = N(o), A = y(o), L = A.length; L--; ) {
              var F = A[r ? L : ++I];
              if (c(P[F], F, P) === !1)
                break;
            }
            return o;
          };
        }
        function Vv(r, o, c) {
          var y = o & O, I = ha(r);
          function P() {
            var A = this && this !== ne && this instanceof P ? I : r;
            return A.apply(y ? c : this, arguments);
          }
          return P;
        }
        function Mf(r) {
          return function(o) {
            o = Ut(o);
            var c = Ci(o) ? ln(o) : a, y = c ? c[0] : o.charAt(0), I = c ? Li(c, 1).join("") : o.slice(1);
            return y[r]() + I;
          };
        }
        function Wr(r) {
          return function(o) {
            return Bs(Ec(pc(o).replace(iu, "")), r, "");
          };
        }
        function ha(r) {
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
            var c = Yr(r.prototype), y = r.apply(c, o);
            return Qt(y) ? y : c;
          };
        }
        function Zv(r, o, c) {
          var y = ha(r);
          function I() {
            for (var P = arguments.length, A = s(P), L = P, F = $r(I); L--; )
              A[L] = arguments[L];
            var $ = P < 3 && A[0] !== F && A[P - 1] !== F ? [] : Un(A, F);
            if (P -= $.length, P < c)
              return kf(
                r,
                o,
                Ou,
                I.placeholder,
                a,
                A,
                $,
                a,
                a,
                c - P
              );
            var H = this && this !== ne && this instanceof I ? y : r;
            return be(H, this, A);
          }
          return I;
        }
        function wf(r) {
          return function(o, c, y) {
            var I = N(o);
            if (!Ze(o)) {
              var P = yt(c, 3);
              o = de(o), c = function(L) {
                return P(I[L], L, I);
              };
            }
            var A = r(o, c, y);
            return A > -1 ? I[P ? o[A] : A] : a;
          };
        }
        function Sf(r) {
          return di(function(o) {
            var c = o.length, y = c, I = En.prototype.thru;
            for (r && o.reverse(); y--; ) {
              var P = o[y];
              if (typeof P != "function")
                throw new q(d);
              if (I && !A && qu(P) == "wrapper")
                var A = new En([], !0);
            }
            for (y = A ? y : c; ++y < c; ) {
              P = o[y];
              var L = qu(P), F = L == "wrapper" ? kh(P) : a;
              F && Rh(F[0]) && F[1] == (K | Y | X | et) && !F[4].length && F[9] == 1 ? A = A[qu(F[0])].apply(A, F[3]) : A = P.length == 1 && Rh(P) ? A[L]() : A.thru(P);
            }
            return function() {
              var $ = arguments, H = $[0];
              if (A && $.length == 1 && It(H))
                return A.plant(H).value();
              for (var J = 0, at = c ? o[J].apply(this, $) : H; ++J < c; )
                at = o[J].call(this, at);
              return at;
            };
          });
        }
        function Ou(r, o, c, y, I, P, A, L, F, $) {
          var H = o & K, J = o & O, at = o & B, ct = o & (Y | W), Et = o & j, Ct = at ? a : ha(r);
          function xt() {
            for (var Tt = arguments.length, Ot = s(Tt), gn = Tt; gn--; )
              Ot[gn] = arguments[gn];
            if (ct)
              var Le = $r(xt), vn = Vo(Ot, Le);
            if (y && (Ot = yf(Ot, y, I, ct)), P && (Ot = pf(Ot, P, A, ct)), Tt -= vn, ct && Tt < $) {
              var ue = Un(Ot, Le);
              return kf(
                r,
                o,
                Ou,
                xt.placeholder,
                c,
                Ot,
                ue,
                L,
                F,
                $ - Tt
              );
            }
            var On = J ? c : this, Ei = at ? On[r] : r;
            return Tt = Ot.length, L ? Ot = __(Ot, L) : Et && Tt > 1 && Ot.reverse(), H && F < Tt && (Ot.length = F), this && this !== ne && this instanceof xt && (Ei = Ct || ha(Ei)), Ei.apply(On, Ot);
          }
          return xt;
        }
        function If(r, o) {
          return function(c, y) {
            return wv(c, r, o(y), {});
          };
        }
        function Gu(r, o) {
          return function(c, y) {
            var I;
            if (c === a && y === a)
              return o;
            if (c !== a && (I = c), y !== a) {
              if (I === a)
                return y;
              typeof c == "string" || typeof y == "string" ? (c = fn(c), y = fn(y)) : (c = lf(c), y = lf(y)), I = r(c, y);
            }
            return I;
          };
        }
        function wh(r) {
          return di(function(o) {
            return o = Kt(o, Re(yt())), Rt(function(c) {
              var y = this;
              return r(o, function(I) {
                return be(I, y, c);
              });
            });
          });
        }
        function Du(r, o) {
          o = o === a ? " " : fn(o);
          var c = o.length;
          if (c < 2)
            return c ? dh(o, r) : o;
          var y = dh(o, wu(r / li(o)));
          return Ci(o) ? Li(ln(y), 0, r).join("") : y.slice(0, r);
        }
        function Kv(r, o, c, y) {
          var I = o & O, P = ha(r);
          function A() {
            for (var L = -1, F = arguments.length, $ = -1, H = y.length, J = s(H + F), at = this && this !== ne && this instanceof A ? P : r; ++$ < H; )
              J[$] = y[$];
            for (; F--; )
              J[$++] = arguments[++L];
            return be(at, I ? c : this, J);
          }
          return A;
        }
        function Nf(r) {
          return function(o, c, y) {
            return y && typeof y != "number" && Te(o, c, y) && (c = y = a), o = pi(o), c === a ? (c = o, o = 0) : c = pi(c), y = y === a ? o < c ? 1 : -1 : pi(y), Ov(o, c, y, r);
          };
        }
        function Fu(r) {
          return function(o, c) {
            return typeof o == "string" && typeof c == "string" || (o = Sn(o), c = Sn(c)), r(o, c);
          };
        }
        function kf(r, o, c, y, I, P, A, L, F, $) {
          var H = o & Y, J = H ? A : a, at = H ? a : A, ct = H ? P : a, Et = H ? a : P;
          o |= H ? X : V, o &= ~(H ? V : X), o & z || (o &= -4);
          var Ct = [
            r,
            o,
            I,
            ct,
            J,
            Et,
            at,
            L,
            F,
            $
          ], xt = c.apply(a, Ct);
          return Rh(r) && qf(xt, Ct), xt.placeholder = y, Bf(xt, r, o);
        }
        function Sh(r) {
          var o = E[r];
          return function(c, y) {
            if (c = Sn(c), y = y == null ? 0 : Ie(Pt(y), 292), y && ql(c)) {
              var I = (Ut(c) + "e").split("e"), P = o(I[0] + "e" + (+I[1] + y));
              return I = (Ut(P) + "e").split("e"), +(I[0] + "e" + (+I[1] - y));
            }
            return o(c);
          };
        }
        var Jv = Ur && 1 / nr(new Ur([, -0]))[1] == Dt ? function(r) {
          return new Ur(r);
        } : $h;
        function Pf(r) {
          return function(o) {
            var c = Ne(o);
            return c == Se ? Fr(o) : c == Be ? Js(o) : Ho(o, r(o));
          };
        }
        function _i(r, o, c, y, I, P, A, L) {
          var F = o & B;
          if (!F && typeof r != "function")
            throw new q(d);
          var $ = y ? y.length : 0;
          if ($ || (o &= -97, y = I = a), A = A === a ? A : ve(Pt(A), 0), L = L === a ? L : Pt(L), $ -= I ? I.length : 0, o & V) {
            var H = y, J = I;
            y = I = a;
          }
          var at = F ? a : kh(r), ct = [
            r,
            o,
            c,
            y,
            I,
            H,
            J,
            P,
            A,
            L
          ];
          if (at && c_(ct, at), r = ct[0], o = ct[1], c = ct[2], y = ct[3], I = ct[4], L = ct[9] = ct[9] === a ? F ? 0 : r.length : ve(ct[9] - $, 0), !L && o & (Y | W) && (o &= -25), !o || o == O)
            var Et = Vv(r, o, c);
          else o == Y || o == W ? Et = Zv(r, o, L) : (o == X || o == (O | X)) && !I.length ? Et = Kv(r, o, c, y) : Et = Ou.apply(a, ct);
          var Ct = at ? of : qf;
          return Bf(Ct(Et, ct), r, o);
        }
        function Cf(r, o, c, y) {
          return r === a || Ln(r, ot[c]) && !lt.call(y, c) ? o : r;
        }
        function bf(r, o, c, y, I, P) {
          return Qt(r) && Qt(o) && (P.set(o, r), Ru(r, o, a, bf, P), P.delete(o)), r;
        }
        function Qv(r) {
          return ca(r) ? a : r;
        }
        function Rf(r, o, c, y, I, P) {
          var A = c & C, L = r.length, F = o.length;
          if (L != F && !(A && F > L))
            return !1;
          var $ = P.get(r), H = P.get(o);
          if ($ && H)
            return $ == o && H == r;
          var J = -1, at = !0, ct = c & G ? new hr() : a;
          for (P.set(r, o), P.set(o, r); ++J < L; ) {
            var Et = r[J], Ct = o[J];
            if (y)
              var xt = A ? y(Ct, Et, J, o, r, P) : y(Et, Ct, J, r, o, P);
            if (xt !== a) {
              if (xt)
                continue;
              at = !1;
              break;
            }
            if (ct) {
              if (!Gr(o, function(Tt, Ot) {
                if (!Pi(ct, Ot) && (Et === Tt || I(Et, Tt, c, y, P)))
                  return ct.push(Ot);
              })) {
                at = !1;
                break;
              }
            } else if (!(Et === Ct || I(Et, Ct, c, y, P))) {
              at = !1;
              break;
            }
          }
          return P.delete(r), P.delete(o), at;
        }
        function jv(r, o, c, y, I, P, A) {
          switch (c) {
            case dt:
              if (r.byteLength != o.byteLength || r.byteOffset != o.byteOffset)
                return !1;
              r = r.buffer, o = o.buffer;
            case jn:
              return !(r.byteLength != o.byteLength || !P(new sr(r), new sr(o)));
            case U:
            case Hi:
            case qe:
              return Ln(+r, +o);
            case ft:
              return r.name == o.name && r.message == o.message;
            case Si:
            case sn:
              return r == o + "";
            case Se:
              var L = Fr;
            case Be:
              var F = y & C;
              if (L || (L = nr), r.size != o.size && !F)
                return !1;
              var $ = A.get(r);
              if ($)
                return $ == o;
              y |= G, A.set(r, o);
              var H = Rf(L(r), L(o), y, I, P, A);
              return A.delete(r), H;
            case Mr:
              if (ia)
                return ia.call(r) == ia.call(o);
          }
          return !1;
        }
        function t_(r, o, c, y, I, P) {
          var A = c & C, L = Ih(r), F = L.length, $ = Ih(o), H = $.length;
          if (F != H && !A)
            return !1;
          for (var J = F; J--; ) {
            var at = L[J];
            if (!(A ? at in o : lt.call(o, at)))
              return !1;
          }
          var ct = P.get(r), Et = P.get(o);
          if (ct && Et)
            return ct == o && Et == r;
          var Ct = !0;
          P.set(r, o), P.set(o, r);
          for (var xt = A; ++J < F; ) {
            at = L[J];
            var Tt = r[at], Ot = o[at];
            if (y)
              var gn = A ? y(Ot, Tt, at, o, r, P) : y(Tt, Ot, at, r, o, P);
            if (!(gn === a ? Tt === Ot || I(Tt, Ot, c, y, P) : gn)) {
              Ct = !1;
              break;
            }
            xt || (xt = at == "constructor");
          }
          if (Ct && !xt) {
            var Le = r.constructor, vn = o.constructor;
            Le != vn && "constructor" in r && "constructor" in o && !(typeof Le == "function" && Le instanceof Le && typeof vn == "function" && vn instanceof vn) && (Ct = !1);
          }
          return P.delete(r), P.delete(o), Ct;
        }
        function di(r) {
          return Th(Df(r, a, $f), r + "");
        }
        function Ih(r) {
          return Kl(r, de, Ch);
        }
        function Nh(r) {
          return Kl(r, Ke, Af);
        }
        var kh = Iu ? function(r) {
          return Iu.get(r);
        } : $h;
        function qu(r) {
          for (var o = r.name + "", c = zr[o], y = lt.call(zr, o) ? c.length : 0; y--; ) {
            var I = c[y], P = I.func;
            if (P == null || P == r)
              return I.name;
          }
          return o;
        }
        function $r(r) {
          var o = lt.call(k, "placeholder") ? k : r;
          return o.placeholder;
        }
        function yt() {
          var r = k.iteratee || Xh;
          return r = r === Xh ? jl : r, arguments.length ? r(arguments[0], arguments[1]) : r;
        }
        function Bu(r, o) {
          var c = r.__data__;
          return o_(o) ? c[typeof o == "string" ? "string" : "hash"] : c.map;
        }
        function Ph(r) {
          for (var o = de(r), c = o.length; c--; ) {
            var y = o[c], I = r[y];
            o[c] = [y, I, Of(I)];
          }
          return o;
        }
        function cr(r, o) {
          var c = Qo(r, o);
          return Ql(c) ? c : a;
        }
        function e_(r) {
          var o = lt.call(r, ur), c = r[ur];
          try {
            r[ur] = a;
            var y = !0;
          } catch {
          }
          var I = se.call(r);
          return y && (o ? r[ur] = c : delete r[ur]), I;
        }
        var Ch = nh ? function(r) {
          return r == null ? [] : (r = N(r), Bn(nh(r), function(o) {
            return Br.call(r, o);
          }));
        } : Hh, Af = nh ? function(r) {
          for (var o = []; r; )
            Rn(o, Ch(r)), r = ar(r);
          return o;
        } : Hh, Ne = Ae;
        (ih && Ne(new ih(new ArrayBuffer(1))) != dt || ta && Ne(new ta()) != Se || rh && Ne(rh.resolve()) != Ya || Ur && Ne(new Ur()) != Be || ea && Ne(new ea()) != Pn) && (Ne = function(r) {
          var o = Ae(r), c = o == rn ? r.constructor : a, y = c ? gr(c) : "";
          if (y)
            switch (y) {
              case D0:
                return dt;
              case F0:
                return Se;
              case q0:
                return Ya;
              case B0:
                return Be;
              case U0:
                return Pn;
            }
          return o;
        });
        function n_(r, o, c) {
          for (var y = -1, I = c.length; ++y < I; ) {
            var P = c[y], A = P.size;
            switch (P.type) {
              case "drop":
                r += A;
                break;
              case "dropRight":
                o -= A;
                break;
              case "take":
                o = Ie(o, r + A);
                break;
              case "takeRight":
                r = ve(r, o - A);
                break;
            }
          }
          return { start: r, end: o };
        }
        function i_(r) {
          var o = r.match(Cr);
          return o ? o[1].split(Oo) : [];
        }
        function Tf(r, o, c) {
          o = Ti(o, r);
          for (var y = -1, I = o.length, P = !1; ++y < I; ) {
            var A = Xn(o[y]);
            if (!(P = r != null && c(r, A)))
              break;
            r = r[A];
          }
          return P || ++y != I ? P : (I = r == null ? 0 : r.length, !!I && Hu(I) && mi(A, I) && (It(r) || vr(r)));
        }
        function r_(r) {
          var o = r.length, c = new r.constructor(o);
          return o && typeof r[0] == "string" && lt.call(r, "index") && (c.index = r.index, c.input = r.input), c;
        }
        function Lf(r) {
          return typeof r.constructor == "function" && !la(r) ? Yr(ar(r)) : {};
        }
        function s_(r, o, c) {
          var y = r.constructor;
          switch (o) {
            case jn:
              return Mh(r);
            case U:
            case Hi:
              return new y(+r);
            case dt:
              return zv(r, c);
            case Vi:
            case At:
            case pt:
            case _s:
            case an:
            case ds:
            case mt:
            case ms:
            case ys:
              return df(r, c);
            case Se:
              return new y();
            case qe:
            case sn:
              return new y(r);
            case Si:
              return Yv(r);
            case Be:
              return new y();
            case Mr:
              return Xv(r);
          }
        }
        function a_(r, o) {
          var c = o.length;
          if (!c)
            return r;
          var y = c - 1;
          return o[y] = (c > 1 ? "& " : "") + o[y], o = o.join(c > 2 ? ", " : " "), r.replace(Wa, `{
/* [wrapped with ` + o + `] */
`);
        }
        function u_(r) {
          return It(r) || vr(r) || !!(Fl && r && r[Fl]);
        }
        function mi(r, o) {
          var c = typeof r;
          return o = o ?? $t, !!o && (c == "number" || c != "symbol" && Ji.test(r)) && r > -1 && r % 1 == 0 && r < o;
        }
        function Te(r, o, c) {
          if (!Qt(c))
            return !1;
          var y = typeof o;
          return (y == "number" ? Ze(c) && mi(o, c.length) : y == "string" && o in c) ? Ln(c[o], r) : !1;
        }
        function bh(r, o) {
          if (It(r))
            return !1;
          var c = typeof r;
          return c == "number" || c == "symbol" || c == "boolean" || r == null || cn(r) ? !0 : Nr.test(r) || !Ir.test(r) || o != null && r in N(o);
        }
        function o_(r) {
          var o = typeof r;
          return o == "string" || o == "number" || o == "symbol" || o == "boolean" ? r !== "__proto__" : r === null;
        }
        function Rh(r) {
          var o = qu(r), c = k[o];
          if (typeof c != "function" || !(o in Lt.prototype))
            return !1;
          if (r === c)
            return !0;
          var y = kh(c);
          return !!y && r === y[0];
        }
        function h_(r) {
          return !!ce && ce in r;
        }
        var l_ = gt ? yi : Vh;
        function la(r) {
          var o = r && r.constructor, c = typeof o == "function" && o.prototype || ot;
          return r === c;
        }
        function Of(r) {
          return r === r && !Qt(r);
        }
        function Gf(r, o) {
          return function(c) {
            return c == null ? !1 : c[r] === o && (o !== a || r in N(c));
          };
        }
        function f_(r) {
          var o = Wu(r, function(y) {
            return c.size === M && c.clear(), y;
          }), c = o.cache;
          return o;
        }
        function c_(r, o) {
          var c = r[1], y = o[1], I = c | y, P = I < (O | B | K), A = y == K && c == Y || y == K && c == et && r[7].length <= o[8] || y == (K | et) && o[7].length <= o[8] && c == Y;
          if (!(P || A))
            return r;
          y & O && (r[2] = o[2], I |= c & O ? 0 : z);
          var L = o[3];
          if (L) {
            var F = r[3];
            r[3] = F ? yf(F, L, o[4]) : L, r[4] = F ? Un(r[3], S) : o[4];
          }
          return L = o[5], L && (F = r[5], r[5] = F ? pf(F, L, o[6]) : L, r[6] = F ? Un(r[5], S) : o[6]), L = o[7], L && (r[7] = L), y & K && (r[8] = r[8] == null ? o[8] : Ie(r[8], o[8])), r[9] == null && (r[9] = o[9]), r[0] = o[0], r[1] = I, r;
        }
        function g_(r) {
          var o = [];
          if (r != null)
            for (var c in N(r))
              o.push(c);
          return o;
        }
        function v_(r) {
          return se.call(r);
        }
        function Df(r, o, c) {
          return o = ve(o === a ? r.length - 1 : o, 0), function() {
            for (var y = arguments, I = -1, P = ve(y.length - o, 0), A = s(P); ++I < P; )
              A[I] = y[o + I];
            I = -1;
            for (var L = s(o + 1); ++I < o; )
              L[I] = y[I];
            return L[o] = c(A), be(r, this, L);
          };
        }
        function Ff(r, o) {
          return o.length < 2 ? r : fr(r, Mn(o, 0, -1));
        }
        function __(r, o) {
          for (var c = r.length, y = Ie(o.length, c), I = Ve(r); y--; ) {
            var P = o[y];
            r[y] = mi(P, c) ? I[P] : a;
          }
          return r;
        }
        function Ah(r, o) {
          if (!(o === "constructor" && typeof r[o] == "function") && o != "__proto__")
            return r[o];
        }
        var qf = Uf(of), fa = b0 || function(r, o) {
          return ne.setTimeout(r, o);
        }, Th = Uf(Fv);
        function Bf(r, o, c) {
          var y = o + "";
          return Th(r, a_(y, d_(i_(y), c)));
        }
        function Uf(r) {
          var o = 0, c = 0;
          return function() {
            var y = L0(), I = kt - (y - c);
            if (c = y, I > 0) {
              if (++o >= Mt)
                return arguments[0];
            } else
              o = 0;
            return r.apply(a, arguments);
          };
        }
        function Uu(r, o) {
          var c = -1, y = r.length, I = y - 1;
          for (o = o === a ? y : o; ++c < o; ) {
            var P = _h(c, I), A = r[P];
            r[P] = r[c], r[c] = A;
          }
          return r.length = o, r;
        }
        var zf = f_(function(r) {
          var o = [];
          return r.charCodeAt(0) === 46 && o.push(""), r.replace(Ki, function(c, y, I, P) {
            o.push(I ? P.replace(Ce, "$1") : y || c);
          }), o;
        });
        function Xn(r) {
          if (typeof r == "string" || cn(r))
            return r;
          var o = r + "";
          return o == "0" && 1 / r == -Dt ? "-0" : o;
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
        function d_(r, o) {
          return $e(Nt, function(c) {
            var y = "_." + c[0];
            o & c[1] && !mn(r, y) && r.push(y);
          }), r.sort();
        }
        function Yf(r) {
          if (r instanceof Lt)
            return r.clone();
          var o = new En(r.__wrapped__, r.__chain__);
          return o.__actions__ = Ve(r.__actions__), o.__index__ = r.__index__, o.__values__ = r.__values__, o;
        }
        function m_(r, o, c) {
          (c ? Te(r, o, c) : o === a) ? o = 1 : o = ve(Pt(o), 0);
          var y = r == null ? 0 : r.length;
          if (!y || o < 1)
            return [];
          for (var I = 0, P = 0, A = s(wu(y / o)); I < y; )
            A[P++] = Mn(r, I, I += o);
          return A;
        }
        function y_(r) {
          for (var o = -1, c = r == null ? 0 : r.length, y = 0, I = []; ++o < c; ) {
            var P = r[o];
            P && (I[y++] = P);
          }
          return I;
        }
        function p_() {
          var r = arguments.length;
          if (!r)
            return [];
          for (var o = s(r - 1), c = arguments[0], y = r; y--; )
            o[y - 1] = arguments[y];
          return Rn(It(c) ? Ve(c) : [c], Ee(o, 1));
        }
        var E_ = Rt(function(r, o) {
          return ae(r) ? sa(r, Ee(o, 1, ae, !0)) : [];
        }), x_ = Rt(function(r, o) {
          var c = wn(o);
          return ae(c) && (c = a), ae(r) ? sa(r, Ee(o, 1, ae, !0), yt(c, 2)) : [];
        }), M_ = Rt(function(r, o) {
          var c = wn(o);
          return ae(c) && (c = a), ae(r) ? sa(r, Ee(o, 1, ae, !0), a, c) : [];
        });
        function w_(r, o, c) {
          var y = r == null ? 0 : r.length;
          return y ? (o = c || o === a ? 1 : Pt(o), Mn(r, o < 0 ? 0 : o, y)) : [];
        }
        function S_(r, o, c) {
          var y = r == null ? 0 : r.length;
          return y ? (o = c || o === a ? 1 : Pt(o), o = y - o, Mn(r, 0, o < 0 ? 0 : o)) : [];
        }
        function I_(r, o) {
          return r && r.length ? Tu(r, yt(o, 3), !0, !0) : [];
        }
        function N_(r, o) {
          return r && r.length ? Tu(r, yt(o, 3), !0) : [];
        }
        function k_(r, o, c, y) {
          var I = r == null ? 0 : r.length;
          return I ? (c && typeof c != "number" && Te(r, o, c) && (c = 0, y = I), pv(r, o, c, y)) : [];
        }
        function Xf(r, o, c) {
          var y = r == null ? 0 : r.length;
          if (!y)
            return -1;
          var I = c == null ? 0 : Pt(c);
          return I < 0 && (I = ve(y + I, 0)), _e(r, yt(o, 3), I);
        }
        function Wf(r, o, c) {
          var y = r == null ? 0 : r.length;
          if (!y)
            return -1;
          var I = y - 1;
          return c !== a && (I = Pt(c), I = c < 0 ? ve(y + I, 0) : Ie(I, y - 1)), _e(r, yt(o, 3), I, !0);
        }
        function $f(r) {
          var o = r == null ? 0 : r.length;
          return o ? Ee(r, 1) : [];
        }
        function P_(r) {
          var o = r == null ? 0 : r.length;
          return o ? Ee(r, Dt) : [];
        }
        function C_(r, o) {
          var c = r == null ? 0 : r.length;
          return c ? (o = o === a ? 1 : Pt(o), Ee(r, o)) : [];
        }
        function b_(r) {
          for (var o = -1, c = r == null ? 0 : r.length, y = {}; ++o < c; ) {
            var I = r[o];
            y[I[0]] = I[1];
          }
          return y;
        }
        function Hf(r) {
          return r && r.length ? r[0] : a;
        }
        function R_(r, o, c) {
          var y = r == null ? 0 : r.length;
          if (!y)
            return -1;
          var I = c == null ? 0 : Pt(c);
          return I < 0 && (I = ve(y + I, 0)), yn(r, o, I);
        }
        function A_(r) {
          var o = r == null ? 0 : r.length;
          return o ? Mn(r, 0, -1) : [];
        }
        var T_ = Rt(function(r) {
          var o = Kt(r, Eh);
          return o.length && o[0] === r[0] ? lh(o) : [];
        }), L_ = Rt(function(r) {
          var o = wn(r), c = Kt(r, Eh);
          return o === wn(c) ? o = a : c.pop(), c.length && c[0] === r[0] ? lh(c, yt(o, 2)) : [];
        }), O_ = Rt(function(r) {
          var o = wn(r), c = Kt(r, Eh);
          return o = typeof o == "function" ? o : a, o && c.pop(), c.length && c[0] === r[0] ? lh(c, a, o) : [];
        });
        function G_(r, o) {
          return r == null ? "" : A0.call(r, o);
        }
        function wn(r) {
          var o = r == null ? 0 : r.length;
          return o ? r[o - 1] : a;
        }
        function D_(r, o, c) {
          var y = r == null ? 0 : r.length;
          if (!y)
            return -1;
          var I = y;
          return c !== a && (I = Pt(c), I = I < 0 ? ve(y + I, 0) : Ie(I, y - 1)), o === o ? mu(r, o, I) : _e(r, Xs, I, !0);
        }
        function F_(r, o) {
          return r && r.length ? rf(r, Pt(o)) : a;
        }
        var q_ = Rt(Vf);
        function Vf(r, o) {
          return r && r.length && o && o.length ? vh(r, o) : r;
        }
        function B_(r, o, c) {
          return r && r.length && o && o.length ? vh(r, o, yt(c, 2)) : r;
        }
        function U_(r, o, c) {
          return r && r.length && o && o.length ? vh(r, o, a, c) : r;
        }
        var z_ = di(function(r, o) {
          var c = r == null ? 0 : r.length, y = ah(r, o);
          return uf(r, Kt(o, function(I) {
            return mi(I, c) ? +I : I;
          }).sort(mf)), y;
        });
        function Y_(r, o) {
          var c = [];
          if (!(r && r.length))
            return c;
          var y = -1, I = [], P = r.length;
          for (o = yt(o, 3); ++y < P; ) {
            var A = r[y];
            o(A, y, r) && (c.push(A), I.push(y));
          }
          return uf(r, I), c;
        }
        function Lh(r) {
          return r == null ? r : G0.call(r);
        }
        function X_(r, o, c) {
          var y = r == null ? 0 : r.length;
          return y ? (c && typeof c != "number" && Te(r, o, c) ? (o = 0, c = y) : (o = o == null ? 0 : Pt(o), c = c === a ? y : Pt(c)), Mn(r, o, c)) : [];
        }
        function W_(r, o) {
          return Au(r, o);
        }
        function $_(r, o, c) {
          return mh(r, o, yt(c, 2));
        }
        function H_(r, o) {
          var c = r == null ? 0 : r.length;
          if (c) {
            var y = Au(r, o);
            if (y < c && Ln(r[y], o))
              return y;
          }
          return -1;
        }
        function V_(r, o) {
          return Au(r, o, !0);
        }
        function Z_(r, o, c) {
          return mh(r, o, yt(c, 2), !0);
        }
        function K_(r, o) {
          var c = r == null ? 0 : r.length;
          if (c) {
            var y = Au(r, o, !0) - 1;
            if (Ln(r[y], o))
              return y;
          }
          return -1;
        }
        function J_(r) {
          return r && r.length ? hf(r) : [];
        }
        function Q_(r, o) {
          return r && r.length ? hf(r, yt(o, 2)) : [];
        }
        function j_(r) {
          var o = r == null ? 0 : r.length;
          return o ? Mn(r, 1, o) : [];
        }
        function td(r, o, c) {
          return r && r.length ? (o = c || o === a ? 1 : Pt(o), Mn(r, 0, o < 0 ? 0 : o)) : [];
        }
        function ed(r, o, c) {
          var y = r == null ? 0 : r.length;
          return y ? (o = c || o === a ? 1 : Pt(o), o = y - o, Mn(r, o < 0 ? 0 : o, y)) : [];
        }
        function nd(r, o) {
          return r && r.length ? Tu(r, yt(o, 3), !1, !0) : [];
        }
        function id(r, o) {
          return r && r.length ? Tu(r, yt(o, 3)) : [];
        }
        var rd = Rt(function(r) {
          return Ai(Ee(r, 1, ae, !0));
        }), sd = Rt(function(r) {
          var o = wn(r);
          return ae(o) && (o = a), Ai(Ee(r, 1, ae, !0), yt(o, 2));
        }), ad = Rt(function(r) {
          var o = wn(r);
          return o = typeof o == "function" ? o : a, Ai(Ee(r, 1, ae, !0), a, o);
        });
        function ud(r) {
          return r && r.length ? Ai(r) : [];
        }
        function od(r, o) {
          return r && r.length ? Ai(r, yt(o, 2)) : [];
        }
        function hd(r, o) {
          return o = typeof o == "function" ? o : a, r && r.length ? Ai(r, a, o) : [];
        }
        function Oh(r) {
          if (!(r && r.length))
            return [];
          var o = 0;
          return r = Bn(r, function(c) {
            if (ae(c))
              return o = ve(c.length, o), !0;
          }), Hs(o, function(c) {
            return Kt(r, Dr(c));
          });
        }
        function Zf(r, o) {
          if (!(r && r.length))
            return [];
          var c = Oh(r);
          return o == null ? c : Kt(c, function(y) {
            return be(o, a, y);
          });
        }
        var ld = Rt(function(r, o) {
          return ae(r) ? sa(r, o) : [];
        }), fd = Rt(function(r) {
          return ph(Bn(r, ae));
        }), cd = Rt(function(r) {
          var o = wn(r);
          return ae(o) && (o = a), ph(Bn(r, ae), yt(o, 2));
        }), gd = Rt(function(r) {
          var o = wn(r);
          return o = typeof o == "function" ? o : a, ph(Bn(r, ae), a, o);
        }), vd = Rt(Oh);
        function _d(r, o) {
          return gf(r || [], o || [], ra);
        }
        function dd(r, o) {
          return gf(r || [], o || [], oa);
        }
        var md = Rt(function(r) {
          var o = r.length, c = o > 1 ? r[o - 1] : a;
          return c = typeof c == "function" ? (r.pop(), c) : a, Zf(r, c);
        });
        function Kf(r) {
          var o = k(r);
          return o.__chain__ = !0, o;
        }
        function yd(r, o) {
          return o(r), r;
        }
        function zu(r, o) {
          return o(r);
        }
        var pd = di(function(r) {
          var o = r.length, c = o ? r[0] : 0, y = this.__wrapped__, I = function(P) {
            return ah(P, r);
          };
          return o > 1 || this.__actions__.length || !(y instanceof Lt) || !mi(c) ? this.thru(I) : (y = y.slice(c, +c + (o ? 1 : 0)), y.__actions__.push({
            func: zu,
            args: [I],
            thisArg: a
          }), new En(y, this.__chain__).thru(function(P) {
            return o && !P.length && P.push(a), P;
          }));
        });
        function Ed() {
          return Kf(this);
        }
        function xd() {
          return new En(this.value(), this.__chain__);
        }
        function Md() {
          this.__values__ === a && (this.__values__ = lc(this.value()));
          var r = this.__index__ >= this.__values__.length, o = r ? a : this.__values__[this.__index__++];
          return { done: r, value: o };
        }
        function wd() {
          return this;
        }
        function Sd(r) {
          for (var o, c = this; c instanceof ku; ) {
            var y = Yf(c);
            y.__index__ = 0, y.__values__ = a, o ? I.__wrapped__ = y : o = y;
            var I = y;
            c = c.__wrapped__;
          }
          return I.__wrapped__ = r, o;
        }
        function Id() {
          var r = this.__wrapped__;
          if (r instanceof Lt) {
            var o = r;
            return this.__actions__.length && (o = new Lt(this)), o = o.reverse(), o.__actions__.push({
              func: zu,
              args: [Lh],
              thisArg: a
            }), new En(o, this.__chain__);
          }
          return this.thru(Lh);
        }
        function Nd() {
          return cf(this.__wrapped__, this.__actions__);
        }
        var kd = Lu(function(r, o, c) {
          lt.call(r, c) ? ++r[c] : vi(r, c, 1);
        });
        function Pd(r, o, c) {
          var y = It(r) ? fu : yv;
          return c && Te(r, o, c) && (o = a), y(r, yt(o, 3));
        }
        function Cd(r, o) {
          var c = It(r) ? Bn : Vl;
          return c(r, yt(o, 3));
        }
        var bd = wf(Xf), Rd = wf(Wf);
        function Ad(r, o) {
          return Ee(Yu(r, o), 1);
        }
        function Td(r, o) {
          return Ee(Yu(r, o), Dt);
        }
        function Ld(r, o, c) {
          return c = c === a ? 1 : Pt(c), Ee(Yu(r, o), c);
        }
        function Jf(r, o) {
          var c = It(r) ? $e : Ri;
          return c(r, yt(o, 3));
        }
        function Qf(r, o) {
          var c = It(r) ? Xo : Hl;
          return c(r, yt(o, 3));
        }
        var Od = Lu(function(r, o, c) {
          lt.call(r, c) ? r[c].push(o) : vi(r, c, [o]);
        });
        function Gd(r, o, c, y) {
          r = Ze(r) ? r : Vr(r), c = c && !y ? Pt(c) : 0;
          var I = r.length;
          return c < 0 && (c = ve(I + c, 0)), Vu(r) ? c <= I && r.indexOf(o, c) > -1 : !!I && yn(r, o, c) > -1;
        }
        var Dd = Rt(function(r, o, c) {
          var y = -1, I = typeof o == "function", P = Ze(r) ? s(r.length) : [];
          return Ri(r, function(A) {
            P[++y] = I ? be(o, A, c) : aa(A, o, c);
          }), P;
        }), Fd = Lu(function(r, o, c) {
          vi(r, c, o);
        });
        function Yu(r, o) {
          var c = It(r) ? Kt : tf;
          return c(r, yt(o, 3));
        }
        function qd(r, o, c, y) {
          return r == null ? [] : (It(o) || (o = o == null ? [] : [o]), c = y ? a : c, It(c) || (c = c == null ? [] : [c]), sf(r, o, c));
        }
        var Bd = Lu(function(r, o, c) {
          r[c ? 0 : 1].push(o);
        }, function() {
          return [[], []];
        });
        function Ud(r, o, c) {
          var y = It(r) ? Bs : gu, I = arguments.length < 3;
          return y(r, yt(o, 4), c, I, Ri);
        }
        function zd(r, o, c) {
          var y = It(r) ? Us : gu, I = arguments.length < 3;
          return y(r, yt(o, 4), c, I, Hl);
        }
        function Yd(r, o) {
          var c = It(r) ? Bn : Vl;
          return c(r, $u(yt(o, 3)));
        }
        function Xd(r) {
          var o = It(r) ? Yl : Gv;
          return o(r);
        }
        function Wd(r, o, c) {
          (c ? Te(r, o, c) : o === a) ? o = 1 : o = Pt(o);
          var y = It(r) ? gv : Dv;
          return y(r, o);
        }
        function $d(r) {
          var o = It(r) ? vv : qv;
          return o(r);
        }
        function Hd(r) {
          if (r == null)
            return 0;
          if (Ze(r))
            return Vu(r) ? li(r) : r.length;
          var o = Ne(r);
          return o == Se || o == Be ? r.size : ch(r).length;
        }
        function Vd(r, o, c) {
          var y = It(r) ? Gr : Bv;
          return c && Te(r, o, c) && (o = a), y(r, yt(o, 3));
        }
        var Zd = Rt(function(r, o) {
          if (r == null)
            return [];
          var c = o.length;
          return c > 1 && Te(r, o[0], o[1]) ? o = [] : c > 2 && Te(o[0], o[1], o[2]) && (o = [o[0]]), sf(r, Ee(o, 1), []);
        }), Xu = C0 || function() {
          return ne.Date.now();
        };
        function Kd(r, o) {
          if (typeof o != "function")
            throw new q(d);
          return r = Pt(r), function() {
            if (--r < 1)
              return o.apply(this, arguments);
          };
        }
        function jf(r, o, c) {
          return o = c ? a : o, o = r && o == null ? r.length : o, _i(r, K, a, a, a, a, o);
        }
        function tc(r, o) {
          var c;
          if (typeof o != "function")
            throw new q(d);
          return r = Pt(r), function() {
            return --r > 0 && (c = o.apply(this, arguments)), r <= 1 && (o = a), c;
          };
        }
        var Gh = Rt(function(r, o, c) {
          var y = O;
          if (c.length) {
            var I = Un(c, $r(Gh));
            y |= X;
          }
          return _i(r, y, o, c, I);
        }), ec = Rt(function(r, o, c) {
          var y = O | B;
          if (c.length) {
            var I = Un(c, $r(ec));
            y |= X;
          }
          return _i(o, y, r, c, I);
        });
        function nc(r, o, c) {
          o = c ? a : o;
          var y = _i(r, Y, a, a, a, a, a, o);
          return y.placeholder = nc.placeholder, y;
        }
        function ic(r, o, c) {
          o = c ? a : o;
          var y = _i(r, W, a, a, a, a, a, o);
          return y.placeholder = ic.placeholder, y;
        }
        function rc(r, o, c) {
          var y, I, P, A, L, F, $ = 0, H = !1, J = !1, at = !0;
          if (typeof r != "function")
            throw new q(d);
          o = Sn(o) || 0, Qt(c) && (H = !!c.leading, J = "maxWait" in c, P = J ? ve(Sn(c.maxWait) || 0, o) : P, at = "trailing" in c ? !!c.trailing : at);
          function ct(ue) {
            var On = y, Ei = I;
            return y = I = a, $ = ue, A = r.apply(Ei, On), A;
          }
          function Et(ue) {
            return $ = ue, L = fa(Tt, o), H ? ct(ue) : A;
          }
          function Ct(ue) {
            var On = ue - F, Ei = ue - $, wc = o - On;
            return J ? Ie(wc, P - Ei) : wc;
          }
          function xt(ue) {
            var On = ue - F, Ei = ue - $;
            return F === a || On >= o || On < 0 || J && Ei >= P;
          }
          function Tt() {
            var ue = Xu();
            if (xt(ue))
              return Ot(ue);
            L = fa(Tt, Ct(ue));
          }
          function Ot(ue) {
            return L = a, at && y ? ct(ue) : (y = I = a, A);
          }
          function gn() {
            L !== a && vf(L), $ = 0, y = F = I = L = a;
          }
          function Le() {
            return L === a ? A : Ot(Xu());
          }
          function vn() {
            var ue = Xu(), On = xt(ue);
            if (y = arguments, I = this, F = ue, On) {
              if (L === a)
                return Et(F);
              if (J)
                return vf(L), L = fa(Tt, o), ct(F);
            }
            return L === a && (L = fa(Tt, o)), A;
          }
          return vn.cancel = gn, vn.flush = Le, vn;
        }
        var Jd = Rt(function(r, o) {
          return $l(r, 1, o);
        }), Qd = Rt(function(r, o, c) {
          return $l(r, Sn(o) || 0, c);
        });
        function jd(r) {
          return _i(r, j);
        }
        function Wu(r, o) {
          if (typeof r != "function" || o != null && typeof o != "function")
            throw new q(d);
          var c = function() {
            var y = arguments, I = o ? o.apply(this, y) : y[0], P = c.cache;
            if (P.has(I))
              return P.get(I);
            var A = r.apply(this, y);
            return c.cache = P.set(I, A) || P, A;
          };
          return c.cache = new (Wu.Cache || gi)(), c;
        }
        Wu.Cache = gi;
        function $u(r) {
          if (typeof r != "function")
            throw new q(d);
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
        function tm(r) {
          return tc(2, r);
        }
        var em = Uv(function(r, o) {
          o = o.length == 1 && It(o[0]) ? Kt(o[0], Re(yt())) : Kt(Ee(o, 1), Re(yt()));
          var c = o.length;
          return Rt(function(y) {
            for (var I = -1, P = Ie(y.length, c); ++I < P; )
              y[I] = o[I].call(this, y[I]);
            return be(r, this, y);
          });
        }), Dh = Rt(function(r, o) {
          var c = Un(o, $r(Dh));
          return _i(r, X, a, o, c);
        }), sc = Rt(function(r, o) {
          var c = Un(o, $r(sc));
          return _i(r, V, a, o, c);
        }), nm = di(function(r, o) {
          return _i(r, et, a, a, a, o);
        });
        function im(r, o) {
          if (typeof r != "function")
            throw new q(d);
          return o = o === a ? o : Pt(o), Rt(r, o);
        }
        function rm(r, o) {
          if (typeof r != "function")
            throw new q(d);
          return o = o == null ? 0 : ve(Pt(o), 0), Rt(function(c) {
            var y = c[o], I = Li(c, 0, o);
            return y && Rn(I, y), be(r, this, I);
          });
        }
        function sm(r, o, c) {
          var y = !0, I = !0;
          if (typeof r != "function")
            throw new q(d);
          return Qt(c) && (y = "leading" in c ? !!c.leading : y, I = "trailing" in c ? !!c.trailing : I), rc(r, o, {
            leading: y,
            maxWait: o,
            trailing: I
          });
        }
        function am(r) {
          return jf(r, 1);
        }
        function um(r, o) {
          return Dh(xh(o), r);
        }
        function om() {
          if (!arguments.length)
            return [];
          var r = arguments[0];
          return It(r) ? r : [r];
        }
        function hm(r) {
          return xn(r, b);
        }
        function lm(r, o) {
          return o = typeof o == "function" ? o : a, xn(r, b, o);
        }
        function fm(r) {
          return xn(r, x | b);
        }
        function cm(r, o) {
          return o = typeof o == "function" ? o : a, xn(r, x | b, o);
        }
        function gm(r, o) {
          return o == null || Wl(r, o, de(o));
        }
        function Ln(r, o) {
          return r === o || r !== r && o !== o;
        }
        var vm = Fu(hh), _m = Fu(function(r, o) {
          return r >= o;
        }), vr = Jl(/* @__PURE__ */ function() {
          return arguments;
        }()) ? Jl : function(r) {
          return ie(r) && lt.call(r, "callee") && !Br.call(r, "callee");
        }, It = s.isArray, dm = Fs ? Re(Fs) : Sv;
        function Ze(r) {
          return r != null && Hu(r.length) && !yi(r);
        }
        function ae(r) {
          return ie(r) && Ze(r);
        }
        function mm(r) {
          return r === !0 || r === !1 || ie(r) && Ae(r) == U;
        }
        var Oi = R0 || Vh, ym = hi ? Re(hi) : Iv;
        function pm(r) {
          return ie(r) && r.nodeType === 1 && !ca(r);
        }
        function Em(r) {
          if (r == null)
            return !0;
          if (Ze(r) && (It(r) || typeof r == "string" || typeof r.splice == "function" || Oi(r) || Hr(r) || vr(r)))
            return !r.length;
          var o = Ne(r);
          if (o == Se || o == Be)
            return !r.size;
          if (la(r))
            return !ch(r).length;
          for (var c in r)
            if (lt.call(r, c))
              return !1;
          return !0;
        }
        function xm(r, o) {
          return ua(r, o);
        }
        function Mm(r, o, c) {
          c = typeof c == "function" ? c : a;
          var y = c ? c(r, o) : a;
          return y === a ? ua(r, o, a, c) : !!y;
        }
        function Fh(r) {
          if (!ie(r))
            return !1;
          var o = Ae(r);
          return o == ft || o == Ht || typeof r.message == "string" && typeof r.name == "string" && !ca(r);
        }
        function wm(r) {
          return typeof r == "number" && ql(r);
        }
        function yi(r) {
          if (!Qt(r))
            return !1;
          var o = Ae(r);
          return o == T || o == nn || o == Ua || o == tt;
        }
        function ac(r) {
          return typeof r == "number" && r == Pt(r);
        }
        function Hu(r) {
          return typeof r == "number" && r > -1 && r % 1 == 0 && r <= $t;
        }
        function Qt(r) {
          var o = typeof r;
          return r != null && (o == "object" || o == "function");
        }
        function ie(r) {
          return r != null && typeof r == "object";
        }
        var uc = hu ? Re(hu) : kv;
        function Sm(r, o) {
          return r === o || fh(r, o, Ph(o));
        }
        function Im(r, o, c) {
          return c = typeof c == "function" ? c : a, fh(r, o, Ph(o), c);
        }
        function Nm(r) {
          return oc(r) && r != +r;
        }
        function km(r) {
          if (l_(r))
            throw new v(_);
          return Ql(r);
        }
        function Pm(r) {
          return r === null;
        }
        function Cm(r) {
          return r == null;
        }
        function oc(r) {
          return typeof r == "number" || ie(r) && Ae(r) == qe;
        }
        function ca(r) {
          if (!ie(r) || Ae(r) != rn)
            return !1;
          var o = ar(r);
          if (o === null)
            return !0;
          var c = lt.call(o, "constructor") && o.constructor;
          return typeof c == "function" && c instanceof c && bt.call(c) == fi;
        }
        var qh = on ? Re(on) : Pv;
        function bm(r) {
          return ac(r) && r >= -$t && r <= $t;
        }
        var hc = qs ? Re(qs) : Cv;
        function Vu(r) {
          return typeof r == "string" || !It(r) && ie(r) && Ae(r) == sn;
        }
        function cn(r) {
          return typeof r == "symbol" || ie(r) && Ae(r) == Mr;
        }
        var Hr = lu ? Re(lu) : bv;
        function Rm(r) {
          return r === a;
        }
        function Am(r) {
          return ie(r) && Ne(r) == Pn;
        }
        function Tm(r) {
          return ie(r) && Ae(r) == wr;
        }
        var Lm = Fu(gh), Om = Fu(function(r, o) {
          return r <= o;
        });
        function lc(r) {
          if (!r)
            return [];
          if (Ze(r))
            return Vu(r) ? ln(r) : Ve(r);
          if (js && r[js])
            return du(r[js]());
          var o = Ne(r), c = o == Se ? Fr : o == Be ? nr : Vr;
          return c(r);
        }
        function pi(r) {
          if (!r)
            return r === 0 ? r : 0;
          if (r = Sn(r), r === Dt || r === -Dt) {
            var o = r < 0 ? -1 : 1;
            return o * he;
          }
          return r === r ? r : 0;
        }
        function Pt(r) {
          var o = pi(r), c = o % 1;
          return o === o ? c ? o - c : o : 0;
        }
        function fc(r) {
          return r ? lr(Pt(r), 0, Zt) : 0;
        }
        function Sn(r) {
          if (typeof r == "number")
            return r;
          if (cn(r))
            return ht;
          if (Qt(r)) {
            var o = typeof r.valueOf == "function" ? r.valueOf() : r;
            r = Qt(o) ? o + "" : o;
          }
          if (typeof r != "string")
            return r === 0 ? r : +r;
          r = vu(r);
          var c = ii.test(r);
          return c || br.test(r) ? zo(r.slice(2), c ? 2 : 8) : ni.test(r) ? ht : +r;
        }
        function cc(r) {
          return Yn(r, Ke(r));
        }
        function Gm(r) {
          return r ? lr(Pt(r), -$t, $t) : r === 0 ? r : 0;
        }
        function Ut(r) {
          return r == null ? "" : fn(r);
        }
        var Dm = Xr(function(r, o) {
          if (la(o) || Ze(o)) {
            Yn(o, de(o), r);
            return;
          }
          for (var c in o)
            lt.call(o, c) && ra(r, c, o[c]);
        }), gc = Xr(function(r, o) {
          Yn(o, Ke(o), r);
        }), Zu = Xr(function(r, o, c, y) {
          Yn(o, Ke(o), r, y);
        }), Fm = Xr(function(r, o, c, y) {
          Yn(o, de(o), r, y);
        }), qm = di(ah);
        function Bm(r, o) {
          var c = Yr(r);
          return o == null ? c : Xl(c, o);
        }
        var Um = Rt(function(r, o) {
          r = N(r);
          var c = -1, y = o.length, I = y > 2 ? o[2] : a;
          for (I && Te(o[0], o[1], I) && (y = 1); ++c < y; )
            for (var P = o[c], A = Ke(P), L = -1, F = A.length; ++L < F; ) {
              var $ = A[L], H = r[$];
              (H === a || Ln(H, ot[$]) && !lt.call(r, $)) && (r[$] = P[$]);
            }
          return r;
        }), zm = Rt(function(r) {
          return r.push(a, bf), be(vc, a, r);
        });
        function Ym(r, o) {
          return Ys(r, yt(o, 3), zn);
        }
        function Xm(r, o) {
          return Ys(r, yt(o, 3), oh);
        }
        function Wm(r, o) {
          return r == null ? r : uh(r, yt(o, 3), Ke);
        }
        function $m(r, o) {
          return r == null ? r : Zl(r, yt(o, 3), Ke);
        }
        function Hm(r, o) {
          return r && zn(r, yt(o, 3));
        }
        function Vm(r, o) {
          return r && oh(r, yt(o, 3));
        }
        function Zm(r) {
          return r == null ? [] : bu(r, de(r));
        }
        function Km(r) {
          return r == null ? [] : bu(r, Ke(r));
        }
        function Bh(r, o, c) {
          var y = r == null ? a : fr(r, o);
          return y === a ? c : y;
        }
        function Jm(r, o) {
          return r != null && Tf(r, o, Ev);
        }
        function Uh(r, o) {
          return r != null && Tf(r, o, xv);
        }
        var Qm = If(function(r, o, c) {
          o != null && typeof o.toString != "function" && (o = se.call(o)), r[o] = c;
        }, Yh(Je)), jm = If(function(r, o, c) {
          o != null && typeof o.toString != "function" && (o = se.call(o)), lt.call(r, o) ? r[o].push(c) : r[o] = [c];
        }, yt), t1 = Rt(aa);
        function de(r) {
          return Ze(r) ? zl(r) : ch(r);
        }
        function Ke(r) {
          return Ze(r) ? zl(r, !0) : Rv(r);
        }
        function e1(r, o) {
          var c = {};
          return o = yt(o, 3), zn(r, function(y, I, P) {
            vi(c, o(y, I, P), y);
          }), c;
        }
        function n1(r, o) {
          var c = {};
          return o = yt(o, 3), zn(r, function(y, I, P) {
            vi(c, I, o(y, I, P));
          }), c;
        }
        var i1 = Xr(function(r, o, c) {
          Ru(r, o, c);
        }), vc = Xr(function(r, o, c, y) {
          Ru(r, o, c, y);
        }), r1 = di(function(r, o) {
          var c = {};
          if (r == null)
            return c;
          var y = !1;
          o = Kt(o, function(P) {
            return P = Ti(P, r), y || (y = P.length > 1), P;
          }), Yn(r, Nh(r), c), y && (c = xn(c, x | w | b, Qv));
          for (var I = o.length; I--; )
            yh(c, o[I]);
          return c;
        });
        function s1(r, o) {
          return _c(r, $u(yt(o)));
        }
        var a1 = di(function(r, o) {
          return r == null ? {} : Tv(r, o);
        });
        function _c(r, o) {
          if (r == null)
            return {};
          var c = Kt(Nh(r), function(y) {
            return [y];
          });
          return o = yt(o), af(r, c, function(y, I) {
            return o(y, I[0]);
          });
        }
        function u1(r, o, c) {
          o = Ti(o, r);
          var y = -1, I = o.length;
          for (I || (I = 1, r = a); ++y < I; ) {
            var P = r == null ? a : r[Xn(o[y])];
            P === a && (y = I, P = c), r = yi(P) ? P.call(r) : P;
          }
          return r;
        }
        function o1(r, o, c) {
          return r == null ? r : oa(r, o, c);
        }
        function h1(r, o, c, y) {
          return y = typeof y == "function" ? y : a, r == null ? r : oa(r, o, c, y);
        }
        var dc = Pf(de), mc = Pf(Ke);
        function l1(r, o, c) {
          var y = It(r), I = y || Oi(r) || Hr(r);
          if (o = yt(o, 4), c == null) {
            var P = r && r.constructor;
            I ? c = y ? new P() : [] : Qt(r) ? c = yi(P) ? Yr(ar(r)) : {} : c = {};
          }
          return (I ? $e : zn)(r, function(A, L, F) {
            return o(c, A, L, F);
          }), c;
        }
        function f1(r, o) {
          return r == null ? !0 : yh(r, o);
        }
        function c1(r, o, c) {
          return r == null ? r : ff(r, o, xh(c));
        }
        function g1(r, o, c, y) {
          return y = typeof y == "function" ? y : a, r == null ? r : ff(r, o, xh(c), y);
        }
        function Vr(r) {
          return r == null ? [] : Vs(r, de(r));
        }
        function v1(r) {
          return r == null ? [] : Vs(r, Ke(r));
        }
        function _1(r, o, c) {
          return c === a && (c = o, o = a), c !== a && (c = Sn(c), c = c === c ? c : 0), o !== a && (o = Sn(o), o = o === o ? o : 0), lr(Sn(r), o, c);
        }
        function d1(r, o, c) {
          return o = pi(o), c === a ? (c = o, o = 0) : c = pi(c), r = Sn(r), Mv(r, o, c);
        }
        function m1(r, o, c) {
          if (c && typeof c != "boolean" && Te(r, o, c) && (o = c = a), c === a && (typeof o == "boolean" ? (c = o, o = a) : typeof r == "boolean" && (c = r, r = a)), r === a && o === a ? (r = 0, o = 1) : (r = pi(r), o === a ? (o = r, r = 0) : o = pi(o)), r > o) {
            var y = r;
            r = o, o = y;
          }
          if (c || r % 1 || o % 1) {
            var I = Bl();
            return Ie(r + I * (o - r + ou("1e-" + ((I + "").length - 1))), o);
          }
          return _h(r, o);
        }
        var y1 = Wr(function(r, o, c) {
          return o = o.toLowerCase(), r + (c ? yc(o) : o);
        });
        function yc(r) {
          return zh(Ut(r).toLowerCase());
        }
        function pc(r) {
          return r = Ut(r), r && r.replace(re, Zo).replace(Or, "");
        }
        function p1(r, o, c) {
          r = Ut(r), o = fn(o);
          var y = r.length;
          c = c === a ? y : lr(Pt(c), 0, y);
          var I = c;
          return c -= o.length, c >= 0 && r.slice(c, I) == o;
        }
        function E1(r) {
          return r = Ut(r), r && Lo.test(r) ? r.replace(Es, Ko) : r;
        }
        function x1(r) {
          return r = Ut(r), r && xs.test(r) ? r.replace(kr, "\\$&") : r;
        }
        var M1 = Wr(function(r, o, c) {
          return r + (c ? "-" : "") + o.toLowerCase();
        }), w1 = Wr(function(r, o, c) {
          return r + (c ? " " : "") + o.toLowerCase();
        }), S1 = Mf("toLowerCase");
        function I1(r, o, c) {
          r = Ut(r), o = Pt(o);
          var y = o ? li(r) : 0;
          if (!o || y >= o)
            return r;
          var I = (o - y) / 2;
          return Du(Su(I), c) + r + Du(wu(I), c);
        }
        function N1(r, o, c) {
          r = Ut(r), o = Pt(o);
          var y = o ? li(r) : 0;
          return o && y < o ? r + Du(o - y, c) : r;
        }
        function k1(r, o, c) {
          r = Ut(r), o = Pt(o);
          var y = o ? li(r) : 0;
          return o && y < o ? Du(o - y, c) + r : r;
        }
        function P1(r, o, c) {
          return c || o == null ? o = 0 : o && (o = +o), O0(Ut(r).replace(Pr, ""), o || 0);
        }
        function C1(r, o, c) {
          return (c ? Te(r, o, c) : o === a) ? o = 1 : o = Pt(o), dh(Ut(r), o);
        }
        function b1() {
          var r = arguments, o = Ut(r[0]);
          return r.length < 3 ? o : o.replace(r[1], r[2]);
        }
        var R1 = Wr(function(r, o, c) {
          return r + (c ? "_" : "") + o.toLowerCase();
        });
        function A1(r, o, c) {
          return c && typeof c != "number" && Te(r, o, c) && (o = c = a), c = c === a ? Zt : c >>> 0, c ? (r = Ut(r), r && (typeof o == "string" || o != null && !qh(o)) && (o = fn(o), !o && Ci(r)) ? Li(ln(r), 0, c) : r.split(o, c)) : [];
        }
        var T1 = Wr(function(r, o, c) {
          return r + (c ? " " : "") + zh(o);
        });
        function L1(r, o, c) {
          return r = Ut(r), c = c == null ? 0 : lr(Pt(c), 0, r.length), o = fn(o), r.slice(c, c + o.length) == o;
        }
        function O1(r, o, c) {
          var y = k.templateSettings;
          c && Te(r, o, c) && (o = a), r = Ut(r), o = Zu({}, o, y, Cf);
          var I = Zu({}, o.imports, y.imports, Cf), P = de(I), A = Vs(I, P), L, F, $ = 0, H = o.interpolate || Rr, J = "__p += '", at = R(
            (o.escape || Rr).source + "|" + H.source + "|" + (H === nt ? Ms : Rr).source + "|" + (o.evaluate || Rr).source + "|$",
            "g"
          ), ct = "//# sourceURL=" + (lt.call(o, "sourceURL") ? (o.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++su + "]") + `
`;
          r.replace(at, function(xt, Tt, Ot, gn, Le, vn) {
            return Ot || (Ot = gn), J += r.slice($, vn).replace(Do, Jo), Tt && (L = !0, J += `' +
__e(` + Tt + `) +
'`), Le && (F = !0, J += `';
` + Le + `;
__p += '`), Ot && (J += `' +
((__t = (` + Ot + `)) == null ? '' : __t) +
'`), $ = vn + xt.length, xt;
          }), J += `';
`;
          var Et = lt.call(o, "variable") && o.variable;
          if (!Et)
            J = `with (obj) {
` + J + `
}
`;
          else if (Go.test(Et))
            throw new v(g);
          J = (F ? J.replace(ps, "") : J).replace(Ue, "$1").replace(Zi, "$1;"), J = "function(" + (Et || "obj") + `) {
` + (Et ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (L ? ", __e = _.escape" : "") + (F ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + J + `return __p
}`;
          var Ct = xc(function() {
            return m(P, ct + "return " + J).apply(a, A);
          });
          if (Ct.source = J, Fh(Ct))
            throw Ct;
          return Ct;
        }
        function G1(r) {
          return Ut(r).toLowerCase();
        }
        function D1(r) {
          return Ut(r).toUpperCase();
        }
        function F1(r, o, c) {
          if (r = Ut(r), r && (c || o === a))
            return vu(r);
          if (!r || !(o = fn(o)))
            return r;
          var y = ln(r), I = ln(o), P = _u(y, I), A = Zs(y, I) + 1;
          return Li(y, P, A).join("");
        }
        function q1(r, o, c) {
          if (r = Ut(r), r && (c || o === a))
            return r.slice(0, yu(r) + 1);
          if (!r || !(o = fn(o)))
            return r;
          var y = ln(r), I = Zs(y, ln(o)) + 1;
          return Li(y, 0, I).join("");
        }
        function B1(r, o, c) {
          if (r = Ut(r), r && (c || o === a))
            return r.replace(Pr, "");
          if (!r || !(o = fn(o)))
            return r;
          var y = ln(r), I = _u(y, ln(o));
          return Li(y, I).join("");
        }
        function U1(r, o) {
          var c = vt, y = _t;
          if (Qt(o)) {
            var I = "separator" in o ? o.separator : I;
            c = "length" in o ? Pt(o.length) : c, y = "omission" in o ? fn(o.omission) : y;
          }
          r = Ut(r);
          var P = r.length;
          if (Ci(r)) {
            var A = ln(r);
            P = A.length;
          }
          if (c >= P)
            return r;
          var L = c - li(y);
          if (L < 1)
            return y;
          var F = A ? Li(A, 0, L).join("") : r.slice(0, L);
          if (I === a)
            return F + y;
          if (A && (L += F.length - L), qh(I)) {
            if (r.slice(L).search(I)) {
              var $, H = F;
              for (I.global || (I = R(I.source, Ut(Ii.exec(I)) + "g")), I.lastIndex = 0; $ = I.exec(H); )
                var J = $.index;
              F = F.slice(0, J === a ? L : J);
            }
          } else if (r.indexOf(fn(I), L) != L) {
            var at = F.lastIndexOf(I);
            at > -1 && (F = F.slice(0, at));
          }
          return F + y;
        }
        function z1(r) {
          return r = Ut(r), r && Sr.test(r) ? r.replace(un, bi) : r;
        }
        var Y1 = Wr(function(r, o, c) {
          return r + (c ? " " : "") + o.toUpperCase();
        }), zh = Mf("toUpperCase");
        function Ec(r, o, c) {
          return r = Ut(r), o = c ? a : o, o === a ? jo(r) ? He(r) : hn(r) : r.match(o) || [];
        }
        var xc = Rt(function(r, o) {
          try {
            return be(r, a, o);
          } catch (c) {
            return Fh(c) ? c : new v(c);
          }
        }), X1 = di(function(r, o) {
          return $e(o, function(c) {
            c = Xn(c), vi(r, c, Gh(r[c], r));
          }), r;
        });
        function W1(r) {
          var o = r == null ? 0 : r.length, c = yt();
          return r = o ? Kt(r, function(y) {
            if (typeof y[1] != "function")
              throw new q(d);
            return [c(y[0]), y[1]];
          }) : [], Rt(function(y) {
            for (var I = -1; ++I < o; ) {
              var P = r[I];
              if (be(P[0], this, y))
                return be(P[1], this, y);
            }
          });
        }
        function $1(r) {
          return mv(xn(r, x));
        }
        function Yh(r) {
          return function() {
            return r;
          };
        }
        function H1(r, o) {
          return r == null || r !== r ? o : r;
        }
        var V1 = Sf(), Z1 = Sf(!0);
        function Je(r) {
          return r;
        }
        function Xh(r) {
          return jl(typeof r == "function" ? r : xn(r, x));
        }
        function K1(r) {
          return ef(xn(r, x));
        }
        function J1(r, o) {
          return nf(r, xn(o, x));
        }
        var Q1 = Rt(function(r, o) {
          return function(c) {
            return aa(c, r, o);
          };
        }), j1 = Rt(function(r, o) {
          return function(c) {
            return aa(r, c, o);
          };
        });
        function Wh(r, o, c) {
          var y = de(o), I = bu(o, y);
          c == null && !(Qt(o) && (I.length || !y.length)) && (c = o, o = r, r = this, I = bu(o, de(o)));
          var P = !(Qt(c) && "chain" in c) || !!c.chain, A = yi(r);
          return $e(I, function(L) {
            var F = o[L];
            r[L] = F, A && (r.prototype[L] = function() {
              var $ = this.__chain__;
              if (P || $) {
                var H = r(this.__wrapped__), J = H.__actions__ = Ve(this.__actions__);
                return J.push({ func: F, args: arguments, thisArg: r }), H.__chain__ = $, H;
              }
              return F.apply(r, Rn([this.value()], arguments));
            });
          }), r;
        }
        function ty() {
          return ne._ === this && (ne._ = ir), this;
        }
        function $h() {
        }
        function ey(r) {
          return r = Pt(r), Rt(function(o) {
            return rf(o, r);
          });
        }
        var ny = wh(Kt), iy = wh(fu), ry = wh(Gr);
        function Mc(r) {
          return bh(r) ? Dr(Xn(r)) : Lv(r);
        }
        function sy(r) {
          return function(o) {
            return r == null ? a : fr(r, o);
          };
        }
        var ay = Nf(), uy = Nf(!0);
        function Hh() {
          return [];
        }
        function Vh() {
          return !1;
        }
        function oy() {
          return {};
        }
        function hy() {
          return "";
        }
        function ly() {
          return !0;
        }
        function fy(r, o) {
          if (r = Pt(r), r < 1 || r > $t)
            return [];
          var c = Zt, y = Ie(r, Zt);
          o = yt(o), r -= Zt;
          for (var I = Hs(y, o); ++c < r; )
            o(c);
          return I;
        }
        function cy(r) {
          return It(r) ? Kt(r, Xn) : cn(r) ? [r] : Ve(zf(Ut(r)));
        }
        function gy(r) {
          var o = ++Wt;
          return Ut(r) + o;
        }
        var vy = Gu(function(r, o) {
          return r + o;
        }, 0), _y = Sh("ceil"), dy = Gu(function(r, o) {
          return r / o;
        }, 1), my = Sh("floor");
        function yy(r) {
          return r && r.length ? Cu(r, Je, hh) : a;
        }
        function py(r, o) {
          return r && r.length ? Cu(r, yt(o, 2), hh) : a;
        }
        function Ey(r) {
          return Ws(r, Je);
        }
        function xy(r, o) {
          return Ws(r, yt(o, 2));
        }
        function My(r) {
          return r && r.length ? Cu(r, Je, gh) : a;
        }
        function wy(r, o) {
          return r && r.length ? Cu(r, yt(o, 2), gh) : a;
        }
        var Sy = Gu(function(r, o) {
          return r * o;
        }, 1), Iy = Sh("round"), Ny = Gu(function(r, o) {
          return r - o;
        }, 0);
        function ky(r) {
          return r && r.length ? $s(r, Je) : 0;
        }
        function Py(r, o) {
          return r && r.length ? $s(r, yt(o, 2)) : 0;
        }
        return k.after = Kd, k.ary = jf, k.assign = Dm, k.assignIn = gc, k.assignInWith = Zu, k.assignWith = Fm, k.at = qm, k.before = tc, k.bind = Gh, k.bindAll = X1, k.bindKey = ec, k.castArray = om, k.chain = Kf, k.chunk = m_, k.compact = y_, k.concat = p_, k.cond = W1, k.conforms = $1, k.constant = Yh, k.countBy = kd, k.create = Bm, k.curry = nc, k.curryRight = ic, k.debounce = rc, k.defaults = Um, k.defaultsDeep = zm, k.defer = Jd, k.delay = Qd, k.difference = E_, k.differenceBy = x_, k.differenceWith = M_, k.drop = w_, k.dropRight = S_, k.dropRightWhile = I_, k.dropWhile = N_, k.fill = k_, k.filter = Cd, k.flatMap = Ad, k.flatMapDeep = Td, k.flatMapDepth = Ld, k.flatten = $f, k.flattenDeep = P_, k.flattenDepth = C_, k.flip = jd, k.flow = V1, k.flowRight = Z1, k.fromPairs = b_, k.functions = Zm, k.functionsIn = Km, k.groupBy = Od, k.initial = A_, k.intersection = T_, k.intersectionBy = L_, k.intersectionWith = O_, k.invert = Qm, k.invertBy = jm, k.invokeMap = Dd, k.iteratee = Xh, k.keyBy = Fd, k.keys = de, k.keysIn = Ke, k.map = Yu, k.mapKeys = e1, k.mapValues = n1, k.matches = K1, k.matchesProperty = J1, k.memoize = Wu, k.merge = i1, k.mergeWith = vc, k.method = Q1, k.methodOf = j1, k.mixin = Wh, k.negate = $u, k.nthArg = ey, k.omit = r1, k.omitBy = s1, k.once = tm, k.orderBy = qd, k.over = ny, k.overArgs = em, k.overEvery = iy, k.overSome = ry, k.partial = Dh, k.partialRight = sc, k.partition = Bd, k.pick = a1, k.pickBy = _c, k.property = Mc, k.propertyOf = sy, k.pull = q_, k.pullAll = Vf, k.pullAllBy = B_, k.pullAllWith = U_, k.pullAt = z_, k.range = ay, k.rangeRight = uy, k.rearg = nm, k.reject = Yd, k.remove = Y_, k.rest = im, k.reverse = Lh, k.sampleSize = Wd, k.set = o1, k.setWith = h1, k.shuffle = $d, k.slice = X_, k.sortBy = Zd, k.sortedUniq = J_, k.sortedUniqBy = Q_, k.split = A1, k.spread = rm, k.tail = j_, k.take = td, k.takeRight = ed, k.takeRightWhile = nd, k.takeWhile = id, k.tap = yd, k.throttle = sm, k.thru = zu, k.toArray = lc, k.toPairs = dc, k.toPairsIn = mc, k.toPath = cy, k.toPlainObject = cc, k.transform = l1, k.unary = am, k.union = rd, k.unionBy = sd, k.unionWith = ad, k.uniq = ud, k.uniqBy = od, k.uniqWith = hd, k.unset = f1, k.unzip = Oh, k.unzipWith = Zf, k.update = c1, k.updateWith = g1, k.values = Vr, k.valuesIn = v1, k.without = ld, k.words = Ec, k.wrap = um, k.xor = fd, k.xorBy = cd, k.xorWith = gd, k.zip = vd, k.zipObject = _d, k.zipObjectDeep = dd, k.zipWith = md, k.entries = dc, k.entriesIn = mc, k.extend = gc, k.extendWith = Zu, Wh(k, k), k.add = vy, k.attempt = xc, k.camelCase = y1, k.capitalize = yc, k.ceil = _y, k.clamp = _1, k.clone = hm, k.cloneDeep = fm, k.cloneDeepWith = cm, k.cloneWith = lm, k.conformsTo = gm, k.deburr = pc, k.defaultTo = H1, k.divide = dy, k.endsWith = p1, k.eq = Ln, k.escape = E1, k.escapeRegExp = x1, k.every = Pd, k.find = bd, k.findIndex = Xf, k.findKey = Ym, k.findLast = Rd, k.findLastIndex = Wf, k.findLastKey = Xm, k.floor = my, k.forEach = Jf, k.forEachRight = Qf, k.forIn = Wm, k.forInRight = $m, k.forOwn = Hm, k.forOwnRight = Vm, k.get = Bh, k.gt = vm, k.gte = _m, k.has = Jm, k.hasIn = Uh, k.head = Hf, k.identity = Je, k.includes = Gd, k.indexOf = R_, k.inRange = d1, k.invoke = t1, k.isArguments = vr, k.isArray = It, k.isArrayBuffer = dm, k.isArrayLike = Ze, k.isArrayLikeObject = ae, k.isBoolean = mm, k.isBuffer = Oi, k.isDate = ym, k.isElement = pm, k.isEmpty = Em, k.isEqual = xm, k.isEqualWith = Mm, k.isError = Fh, k.isFinite = wm, k.isFunction = yi, k.isInteger = ac, k.isLength = Hu, k.isMap = uc, k.isMatch = Sm, k.isMatchWith = Im, k.isNaN = Nm, k.isNative = km, k.isNil = Cm, k.isNull = Pm, k.isNumber = oc, k.isObject = Qt, k.isObjectLike = ie, k.isPlainObject = ca, k.isRegExp = qh, k.isSafeInteger = bm, k.isSet = hc, k.isString = Vu, k.isSymbol = cn, k.isTypedArray = Hr, k.isUndefined = Rm, k.isWeakMap = Am, k.isWeakSet = Tm, k.join = G_, k.kebabCase = M1, k.last = wn, k.lastIndexOf = D_, k.lowerCase = w1, k.lowerFirst = S1, k.lt = Lm, k.lte = Om, k.max = yy, k.maxBy = py, k.mean = Ey, k.meanBy = xy, k.min = My, k.minBy = wy, k.stubArray = Hh, k.stubFalse = Vh, k.stubObject = oy, k.stubString = hy, k.stubTrue = ly, k.multiply = Sy, k.nth = F_, k.noConflict = ty, k.noop = $h, k.now = Xu, k.pad = I1, k.padEnd = N1, k.padStart = k1, k.parseInt = P1, k.random = m1, k.reduce = Ud, k.reduceRight = zd, k.repeat = C1, k.replace = b1, k.result = u1, k.round = Iy, k.runInContext = t, k.sample = Xd, k.size = Hd, k.snakeCase = R1, k.some = Vd, k.sortedIndex = W_, k.sortedIndexBy = $_, k.sortedIndexOf = H_, k.sortedLastIndex = V_, k.sortedLastIndexBy = Z_, k.sortedLastIndexOf = K_, k.startCase = T1, k.startsWith = L1, k.subtract = Ny, k.sum = ky, k.sumBy = Py, k.template = O1, k.times = fy, k.toFinite = pi, k.toInteger = Pt, k.toLength = fc, k.toLower = G1, k.toNumber = Sn, k.toSafeInteger = Gm, k.toString = Ut, k.toUpper = D1, k.trim = F1, k.trimEnd = q1, k.trimStart = B1, k.truncate = U1, k.unescape = z1, k.uniqueId = gy, k.upperCase = Y1, k.upperFirst = zh, k.each = Jf, k.eachRight = Qf, k.first = Hf, Wh(k, function() {
          var r = {};
          return zn(k, function(o, c) {
            lt.call(k.prototype, c) || (r[c] = o);
          }), r;
        }(), { chain: !1 }), k.VERSION = l, $e(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(r) {
          k[r].placeholder = k;
        }), $e(["drop", "take"], function(r, o) {
          Lt.prototype[r] = function(c) {
            c = c === a ? 1 : ve(Pt(c), 0);
            var y = this.__filtered__ && !o ? new Lt(this) : this.clone();
            return y.__filtered__ ? y.__takeCount__ = Ie(c, y.__takeCount__) : y.__views__.push({
              size: Ie(c, Zt),
              type: r + (y.__dir__ < 0 ? "Right" : "")
            }), y;
          }, Lt.prototype[r + "Right"] = function(c) {
            return this.reverse()[r](c).reverse();
          };
        }), $e(["filter", "map", "takeWhile"], function(r, o) {
          var c = o + 1, y = c == it || c == Gt;
          Lt.prototype[r] = function(I) {
            var P = this.clone();
            return P.__iteratees__.push({
              iteratee: yt(I, 3),
              type: c
            }), P.__filtered__ = P.__filtered__ || y, P;
          };
        }), $e(["head", "last"], function(r, o) {
          var c = "take" + (o ? "Right" : "");
          Lt.prototype[r] = function() {
            return this[c](1).value()[0];
          };
        }), $e(["initial", "tail"], function(r, o) {
          var c = "drop" + (o ? "" : "Right");
          Lt.prototype[r] = function() {
            return this.__filtered__ ? new Lt(this) : this[c](1);
          };
        }), Lt.prototype.compact = function() {
          return this.filter(Je);
        }, Lt.prototype.find = function(r) {
          return this.filter(r).head();
        }, Lt.prototype.findLast = function(r) {
          return this.reverse().find(r);
        }, Lt.prototype.invokeMap = Rt(function(r, o) {
          return typeof r == "function" ? new Lt(this) : this.map(function(c) {
            return aa(c, r, o);
          });
        }), Lt.prototype.reject = function(r) {
          return this.filter($u(yt(r)));
        }, Lt.prototype.slice = function(r, o) {
          r = Pt(r);
          var c = this;
          return c.__filtered__ && (r > 0 || o < 0) ? new Lt(c) : (r < 0 ? c = c.takeRight(-r) : r && (c = c.drop(r)), o !== a && (o = Pt(o), c = o < 0 ? c.dropRight(-o) : c.take(o - r)), c);
        }, Lt.prototype.takeRightWhile = function(r) {
          return this.reverse().takeWhile(r).reverse();
        }, Lt.prototype.toArray = function() {
          return this.take(Zt);
        }, zn(Lt.prototype, function(r, o) {
          var c = /^(?:filter|find|map|reject)|While$/.test(o), y = /^(?:head|last)$/.test(o), I = k[y ? "take" + (o == "last" ? "Right" : "") : o], P = y || /^find/.test(o);
          I && (k.prototype[o] = function() {
            var A = this.__wrapped__, L = y ? [1] : arguments, F = A instanceof Lt, $ = L[0], H = F || It(A), J = function(Tt) {
              var Ot = I.apply(k, Rn([Tt], L));
              return y && at ? Ot[0] : Ot;
            };
            H && c && typeof $ == "function" && $.length != 1 && (F = H = !1);
            var at = this.__chain__, ct = !!this.__actions__.length, Et = P && !at, Ct = F && !ct;
            if (!P && H) {
              A = Ct ? A : new Lt(this);
              var xt = r.apply(A, L);
              return xt.__actions__.push({ func: zu, args: [J], thisArg: a }), new En(xt, at);
            }
            return Et && Ct ? r.apply(this, L) : (xt = this.thru(J), Et ? y ? xt.value()[0] : xt.value() : xt);
          });
        }), $e(["pop", "push", "shift", "sort", "splice", "unshift"], function(r) {
          var o = Z[r], c = /^(?:push|sort|unshift)$/.test(r) ? "tap" : "thru", y = /^(?:pop|shift)$/.test(r);
          k.prototype[r] = function() {
            var I = arguments;
            if (y && !this.__chain__) {
              var P = this.value();
              return o.apply(It(P) ? P : [], I);
            }
            return this[c](function(A) {
              return o.apply(It(A) ? A : [], I);
            });
          };
        }), zn(Lt.prototype, function(r, o) {
          var c = k[o];
          if (c) {
            var y = c.name + "";
            lt.call(zr, y) || (zr[y] = []), zr[y].push({ name: o, func: c });
          }
        }), zr[Ou(a, B).name] = [{
          name: "wrapper",
          func: a
        }], Lt.prototype.clone = z0, Lt.prototype.reverse = Y0, Lt.prototype.value = X0, k.prototype.at = pd, k.prototype.chain = Ed, k.prototype.commit = xd, k.prototype.next = Md, k.prototype.plant = Sd, k.prototype.reverse = Id, k.prototype.toJSON = k.prototype.valueOf = k.prototype.value = Nd, k.prototype.first = k.prototype.head, js && (k.prototype[js] = wd), k;
      }, u = pn();
      fe ? ((fe.exports = u)._ = u, Gs._ = u) : ne._ = u;
    }).call(sw);
  }(Ma, Ma.exports)), Ma.exports;
}
var uw = aw();
function ow(n, i) {
  let a = i.features;
  const l = [];
  for (; a.length > 0; ) {
    a = uw.sortBy(a, (d) => {
      if (d.geometry && d.geometry.coordinates && d.geometry.coordinates[0])
        return Hn(n, d.geometry.coordinates[0]);
      throw new Error("Feature missing geometry");
    });
    const f = a.shift(), _ = f.geometry.coordinates[f.geometry.coordinates.length - 1];
    _ && (n = _), l.push(f);
  }
  return l;
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
    const { lowerX: a, upperX: l, lowerY: f, upperY: _, customCenter: d } = i;
    this.lowerX = a, this.upperX = l, this.lowerY = f, this.upperY = _, this.customCenter = d, this.bottomLeft = [this.lowerX, this.lowerY], this.bottomRight = [this.upperX, this.lowerY], this.topLeft = [this.lowerX, this.upperY], this.topRight = [this.upperX, this.upperY], this.center = this.customCenter ?? [
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
        const a = T4(this.flatten), l = rw(No(i), a);
        return i[0] && (l.features = ow(i[0], l)), l.features.map((f) => ({
          coordinates: f.geometry.coordinates,
          isWithinBounds: k4(f.geometry.coordinates).features.every(
            (_) => z4(_, a)
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
const cs = 15.5, _0 = 8, Ta = 2 * Math.PI * Ge / 256;
class d0 {
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
      proj4transformationMatrix: f,
      bounds: _,
      technicalName: d,
      usesMercatorPyramid: g = !1
    } = i;
    this.epsgNumber = a, this.epsg = `EPSG:${a}`, this.label = l, this.proj4transformationMatrix = f, this.bounds = _, this.technicalName = d, this.usesMercatorPyramid = g;
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
      let f;
      return this.bounds.customCenter && (f = _n(this.epsg, i.epsg, this.bounds.customCenter)), new Ba({
        lowerX: a[0],
        lowerY: a[1],
        upperX: l[0],
        upperY: l[1],
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
    const a = Ta, l = [], f = (i ?? 0) * Math.PI / 180;
    for (let _ = 0; _ < 21; ++_)
      l.push({
        resolution: a * Math.cos(f) / Math.pow(2, _),
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
class hw extends d0 {
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
], m0 = [
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
], lw = [
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
], fw = In.map(
  (n, i) => i
);
class y0 extends hw {
  getResolutionSteps() {
    return m0.map((i) => {
      const a = $n.indexOf(i) ?? void 0;
      let l;
      return a && (l = lw[a]), {
        zoom: a,
        label: l,
        resolution: i
      };
    });
  }
  get1_25000ZoomLevel() {
    return _0;
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
    const l = $n.slice(-1)[0];
    return l && l > i ? $n.indexOf(l) : 0;
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
    return a ? S4(i, fw) : super.roundZoomLevel(i);
  }
}
class cw extends y0 {
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
class gw extends y0 {
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
class p0 extends d0 {
  /** The index in the resolution list where the 1:25000 zoom level is */
  get1_25000ZoomLevel() {
    return cs;
  }
  getDefaultZoom() {
    return cs;
  }
}
class vw extends p0 {
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
    const l = _n(this.epsg, Bi.epsg, a).map(
      (f) => f * Math.PI / 180
    );
    return typeof l[1] != "number" ? 0 : Yi(
      Math.abs(
        Ta * Math.cos(l[1]) / Math.pow(2, i)
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
    const l = _n(this.epsg, Bi.epsg, a).map(
      (f) => f * Math.PI / 180
    );
    return typeof l[1] != "number" ? 0 : Math.abs(
      Math.log2(
        i / Ta / Math.cos(l[1])
      )
    );
  }
}
class _w extends p0 {
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
        Ta * Math.cos(a[1] * Math.PI / 180) / Math.pow(2, i)
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
        i / Ta / Math.cos(a[1] * Math.PI / 180)
      )
    );
  }
}
const Ol = new gw(), Gl = new cw(), Bi = new _w(), Dl = new vw(), E0 = [Ol, Gl, Bi, Dl], Rw = {
  STANDARD_ZOOM_LEVEL_1_25000_MAP: cs,
  SWISS_ZOOM_LEVEL_1_25000_MAP: _0,
  LV95_RESOLUTIONS: $n,
  SWISSTOPO_TILEGRID_RESOLUTIONS: m0
}, dw = {
  LV95: Ol,
  LV03: Gl,
  WGS84: Bi,
  WEBMERCATOR: Dl,
  allCoordinateSystems: E0
};
function x0(n) {
  return !Array.isArray(n) || n.length === 0 ? !1 : typeof n[0] == "number" && typeof n[1] == "number";
}
function mw(n, i, a = !0, l = !1) {
  if (!(!Array.isArray(n) || n.length !== 2 || !n.every(Rl) || n.some(
    (f) => f === Number.POSITIVE_INFINITY || f === Number.NEGATIVE_INFINITY
  )))
    return n.map((f) => {
      const _ = Yi(f, i);
      let d;
      return l ? d = _.toFixed(i) : d = _.toString(), a ? N4(d) : d;
    }).join(", ");
}
function M0(n, i) {
  if (i.usesMercatorPyramid && i.bounds && Array.isArray(n)) {
    if (n.length === 2 && n.every(Rl)) {
      const [a, l] = n;
      if (a >= i.bounds.lowerX && a <= i.bounds.upperX)
        return n;
      const f = i.bounds.upperX - i.bounds.lowerX, d = Math.floor((a - i.bounds.lowerX) / f) * f;
      return [a - d, l];
    } else if (n.every(Array.isArray))
      return n.map(
        (a) => M0(a, i)
      );
  }
  return n;
}
function w0(n) {
  return n ? n.every((i) => x0(i)) ? n : w0(
    n[0]
  ) : [];
}
function yw(n) {
  if (Array.isArray(n)) {
    if (n.every((i) => i.length === 2))
      return n;
    if (n.some((i) => i.length > 2))
      return n.map((i) => [i[0], i[1]]);
  }
  throw new Error("Invalid coordinates received, cannot remove Z values");
}
function S0(n, i, a) {
  if (!n || !i)
    throw new Error("Invalid arguments, must receive two CRS");
  if (!x0(a))
    throw new Error(
      "Invalid coordinates received, must be an array of number or an array of coordinates"
    );
  const l = a[0];
  return Array.isArray(l) ? a.map(
    (f) => S0(n, i, f)
  ) : _n(n.epsg, i.epsg, a).map(
    (f) => i.roundCoordinateValue(f)
  );
}
function pw(n) {
  const i = n?.split(":").pop();
  if (i)
    return i === "WGS84" ? Bi : E0.find((a) => a.epsg === `EPSG:${i}`);
}
const Ew = {
  toRoundedString: mw,
  wrapXCoordinates: M0,
  unwrapGeometryCoordinates: w0,
  removeZValues: yw,
  reprojectAndRound: S0,
  parseCRS: pw
};
function xw() {
  return [1 / 0, 1 / 0, -1 / 0, -1 / 0];
}
function Mw(n, i, a, l, f) {
  return f ? (f[0] = n, f[1] = i, f[2] = a, f[3] = l, f) : [n, i, a, l];
}
function ww(n) {
  return Mw(1 / 0, 1 / 0, -1 / 0, -1 / 0, n);
}
function Sw(n, i, a) {
  const l = xw();
  return Iw(n, i) ? (n[0] > i[0] ? l[0] = n[0] : l[0] = i[0], n[1] > i[1] ? l[1] = n[1] : l[1] = i[1], n[2] < i[2] ? l[2] = n[2] : l[2] = i[2], n[3] < i[3] ? l[3] = n[3] : l[3] = i[3]) : ww(l), l;
}
function Iw(n, i) {
  return n[0] <= i[2] && n[2] >= i[0] && n[1] <= i[3] && n[3] >= i[1];
}
function Ao(n, i, a) {
  if (a.length === 4) {
    const l = _n(n.epsg, i.epsg, [
      a[0],
      a[1]
    ]), f = _n(n.epsg, i.epsg, [
      a[2],
      a[3]
    ]);
    return [...l, ...f].map((_) => i.roundCoordinateValue(_));
  } else if (a.length === 2) {
    const l = _n(n.epsg, i.epsg, a[0]).map(
      (_) => i.roundCoordinateValue(_)
    ), f = _n(n.epsg, i.epsg, a[1]).map(
      (_) => i.roundCoordinateValue(_)
    );
    return [l, f];
  }
  return a;
}
function I0(n) {
  let i = n;
  return n?.length === 4 && (i = [
    [n[0], n[1]],
    [n[2], n[3]]
  ]), i;
}
function El(n) {
  let i = n;
  return n?.length === 2 && (i = [...n[0], ...n[1]]), i;
}
function Nw(n, i, a) {
  if (n?.length !== 4 && n?.length !== 2 || !i || !a || !a.bounds)
    return;
  let l = a.bounds.flatten;
  i.epsg !== a.epsg && (l = Ao(
    a,
    i,
    l
  ));
  let f = Sw(
    El(n),
    l
  );
  if (!(!f || // OL now populates the extent with Infinity when nothing is in common, instead returning a null value
  f.every((_) => Math.abs(_) === 1 / 0)))
    return i.epsg !== a.epsg && (f = Ao(i, a, f)), El(f);
}
function kw(n) {
  const [i, a] = I0(n);
  return [(i[0] + a[0]) / 2, (i[1] + a[1]) / 2];
}
function Pw(n) {
  const { size: i, coordinate: a, projection: l, resolution: f, rounded: _ = !1 } = n;
  if (!i || !a || !l || !f)
    return;
  let d = a;
  l.epsg !== Bi.epsg && (d = _n(l.epsg, Bi.epsg, a));
  const g = jM(
    Fi(d),
    // sphere of the wanted number of pixels as radius around the coordinate
    i * f,
    { units: "meters" }
  );
  if (!g)
    return;
  const p = Ao(Bi, l, xi(g));
  return _ ? p.map((M) => Yi(M)) : p;
}
const Cw = {
  projExtent: Ao,
  normalizeExtent: I0,
  flattenExtent: El,
  getExtentIntersectionWithCurrentProjection: Nw,
  createPixelExtentAround: Pw,
  getExtentCenter: kw
};
function bw(n) {
  return `color: #000; font-weight: bold; background-color: ${n}; padding: 2px 4px; border-radius: 4px;`;
}
function lo(n) {
  return n.flatMap((i) => {
    if (i && typeof i == "object" && "messages" in i && Array.isArray(i.messages)) {
      const a = [];
      if ("title" in i && typeof i.title == "string") {
        a.push(`%c[${i.title}]%c`);
        let l = "oklch(55.4% 0.046 257.417)";
        "titleColor" in i && typeof i.titleColor == "string" && (l = i.titleColor), a.push(bw(l)), a.push("");
      }
      return a.push(...i.messages), a;
    }
    return i;
  });
}
function fo(n, i) {
  if (N0.wantedLevels.includes(n))
    switch (n) {
      case 0:
        console.error(...lo(i));
        break;
      case 1:
        console.warn(...lo(i));
        break;
      case 2:
        console.info(...lo(i));
        break;
      case 3:
        console.debug(...lo(i));
        break;
    }
}
const N0 = {
  wantedLevels: [
    0,
    1
    /* Warn */
  ],
  error: (...n) => fo(0, n),
  warn: (...n) => fo(1, n),
  info: (...n) => fo(2, n),
  debug: (...n) => fo(3, n)
}, k0 = (n, i = [Dl, Ol, Gl]) => {
  i.filter((a) => a.proj4transformationMatrix).forEach((a) => {
    try {
      n.defs(a.epsg, a.proj4transformationMatrix);
    } catch (l) {
      const f = l || new Error("Unknown error");
      throw N0.error("Error while setting up projection in proj4", a.epsg, f), f;
    }
  });
};
k0(_n);
const Aw = { ...dw, coordinatesUtils: Ew, extentUtils: Cw, registerProj4: k0 };
export {
  d0 as CoordinateSystem,
  Ba as CoordinateSystemBounds,
  hw as CustomCoordinateSystem,
  Gl as LV03,
  Ol as LV95,
  p0 as StandardCoordinateSystem,
  y0 as SwissCoordinateSystem,
  Dl as WEBMERCATOR,
  Bi as WGS84,
  E0 as allCoordinateSystems,
  Rw as constants,
  Ew as coordinatesUtils,
  Pw as createPixelExtentAround,
  dw as crs,
  Aw as default,
  Cw as extentUtils,
  El as flattenExtent,
  kw as getExtentCenter,
  Nw as getExtentIntersectionWithCurrentProjection,
  I0 as normalizeExtent,
  Ao as projExtent,
  k0 as registerProj4
};
