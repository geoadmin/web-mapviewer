import { t as M, p as d, l, D, a as k } from "./index-CftWVgXE.js";
import { a as R } from "./external-Duds-Re_.js";
import { E as J, g as H, f as X, p as q, e as z, r as K, d as Q, s as Y, b as Z, c as F } from "./external-Duds-Re_.js";
import { L as w } from "./index-C9BI3pET.js";
function N(e) {
  return e.startsWith("//") ? `https:${e}` : e;
}
const P = (e) => e && !e.endsWith("/") ? e + "/" : e;
function v(e, s, n, r, i = "production") {
  if (!e)
    return;
  const {
    serverLayerName: t,
    label: a,
    type: p,
    opacity: o,
    format: W,
    background: x,
    highlightable: b,
    tooltip: f,
    attribution: A,
    attributionUrl: g,
    hasLegend: u,
    searchable: y
  } = e;
  let T;
  if (g)
    try {
      new URL(g), T = g;
    } catch {
    }
  let S = [];
  Array.isArray(e.timestamps) && e.timestamps.length > 0 && (S = e.timestamps.map(
    (c) => M.makeTimeConfigEntry(c)
  ));
  const L = M.makeTimeConfig(e.timeBehaviour, S), E = e.topics ? e.topics.split(",") : [], m = [];
  switch (A && m.push({ name: A, url: T }), p.toLowerCase()) {
    case "vector":
      d.info("Vector layer format is TBD in our backends");
      break;
    case "wmts":
      return l.makeGeoAdminWMTSLayer({
        type: w.WMTS,
        name: a,
        id: s,
        baseUrl: P(k.wmts[i]),
        idIn3d: e.config3d,
        technicalName: t,
        opacity: o,
        attributions: m,
        format: W,
        timeConfig: L,
        isBackground: x,
        isHighlightable: b,
        hasTooltip: f,
        topics: E,
        hasLegend: u,
        searchable: y,
        maxResolution: e.resolutions?.slice(-1)[0] ?? D,
        hasDescription: !0
      });
    case "wms":
      return l.makeGeoAdminWMSLayer({
        type: w.WMS,
        name: a,
        id: s,
        idIn3d: e.config3d,
        technicalName: Array.isArray(e.wmsLayers) ? e.wmsLayers.join(",") : e.wmsLayers ?? t,
        opacity: o,
        attributions: m,
        baseUrl: e.wmsUrl,
        format: W,
        timeConfig: L,
        wmsVersion: "1.3.0",
        lang: r,
        gutter: e.gutter,
        isHighlightable: b,
        hasTooltip: f,
        topics: E,
        hasLegend: u,
        searchable: y
      });
    case "geojson":
      return l.makeGeoAdminGeoJSONLayer({
        type: w.GEOJSON,
        name: a,
        id: s,
        opacity: o,
        isVisible: !1,
        attributions: m,
        geoJsonUrl: N(e.geojsonUrl),
        styleUrl: N(e.styleUrl),
        updateDelay: e.updateDelay,
        hasLegend: u,
        hasTooltip: !1,
        technicalName: s,
        hasDescription: !0,
        isExternal: !1,
        isLoading: !0,
        hasError: !1,
        hasWarning: !1
      });
    case "aggregate": {
      const c = [];
      return e.subLayersIds.forEach((G) => {
        const h = n[G], U = v(
          h,
          h.serverLayerName,
          n,
          r,
          i
        );
        U && c.push(
          l.makeAggregateSubLayer({
            subLayerId: G,
            layer: U,
            minResolution: h.minResolution,
            maxResolution: h.maxResolution
          })
        );
      }), l.makeGeoAdminAggregateLayer({
        name: a,
        id: s,
        opacity: o,
        isVisible: !1,
        attributions: m,
        timeConfig: L,
        isHighlightable: b,
        hasTooltip: f,
        topics: E,
        subLayers: c,
        hasLegend: !!u,
        searchable: y
      });
    }
    default:
      d.error("Unknown layer type", p);
  }
}
function j(e, s, n = "production") {
  return new Promise((r, i) => {
    R.get(
      `${k.api3[n]}rest/services/all/MapServer/${s}/legend?lang=${e}`
    ).then((t) => r(t.data)).catch((t) => {
      d.error("Error while retrieving the legend for the layer", s, t), i(new Error(t));
    });
  });
}
function V(e, s = "production") {
  return new Promise((n, r) => {
    const i = [];
    R.get(
      `${k.api3[s]}rest/services/all/MapServer/layersConfig?lang=${e}`
    ).then(({ data: t }) => {
      Object.keys(t).length > 0 ? (Object.keys(t).forEach((a) => {
        const p = t[a], o = v(
          p,
          a,
          t,
          e
        );
        o && i.push(o);
      }), n(i)) : r(new Error("LayersConfig loaded from backend is not defined or is empty"));
    }).catch((t) => {
      const a = "Error while loading layers config from backend";
      d.error(a, t), r(new Error(a));
    });
  });
}
export {
  J as EXTERNAL_SERVER_TIMEOUT,
  H as decodeExternalLayerParam,
  X as encodeExternalLayerParam,
  v as generateLayerObject,
  j as getGeoadminLayerDescription,
  V as loadGeoadminLayersConfig,
  q as parseWmsCapabilities,
  z as parseWmtsCapabilities,
  K as readWmsCapabilities,
  Q as readWmtsCapabilities,
  Y as setWmsGetCapabilitiesParams,
  Z as setWmsGetMapParams,
  F as setWmtsGetCapParams
};
