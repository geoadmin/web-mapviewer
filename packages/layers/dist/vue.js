import { p as c } from "./index-CftWVgXE.js";
import { c as f, s as l, a as m, E as w, A as h, e as C } from "./external-Duds-Re_.js";
import { toValue as o } from "vue";
import { wmsCapabilitiesParser as p, wmtsCapabilitiesParser as y } from "./parsers.js";
import { CapabilitiesError as n } from "./validation.js";
function d(t) {
  return /<(WMT_MS_Capabilities|WMS_Capabilities)/.test(t);
}
function b(t) {
  return /<Capabilities/.test(t);
}
function E(t) {
  return /(wms|map=|\.map)/i.test(t);
}
function S(t) {
  return /wmts/i.test(t);
}
function W(t, e) {
  return S(t) ? f(new URL(t), e) : E(t) ? l(new URL(t), e) : l(new URL(t), e);
}
function _(t, e, s, a) {
  if (d(t))
    return x(t, e, s);
  if (b(t))
    return M(t, e, s);
  throw new n(
    `Unsupported url ${e} response content; Content-Type=${a}`,
    "unsupported_content_type"
  );
}
function x(t, e, s) {
  let a;
  const i = p.parse(t, e);
  return i.Service.MaxWidth && i.Service.MaxHeight && (a = {
    width: i.Service.MaxWidth,
    height: i.Service.MaxHeight
  }), {
    layers: p.getAllExternalLayers(i, {
      outputProjection: s,
      initialValues: {
        opacity: 1,
        isVisible: !0
      }
    }),
    wmsMaxSize: a
  };
}
function M(t, e, s) {
  return {
    layers: y.getAllExternalLayers(
      C(t, e),
      {
        outputProjection: s,
        initialValues: {
          isVisible: !0,
          opacity: 1
        }
      }
    )
  };
}
function R(t, e, s) {
  async function a() {
    const i = W(o(t), o(s));
    try {
      const r = await m.get(i.toString(), {
        timeout: w
      });
      if (!r || r.status !== 200 || !r.headers)
        throw new n(
          `Failed to fetch ${i.toString()}; status_code=${r.status}`,
          "network_error"
        );
      const u = _(
        r.data,
        i,
        o(e),
        r.headers["Content-Type"]
      );
      if (u?.layers?.length === 0)
        throw new n(
          `No valid layer found in ${i.toString()}`,
          "no_layer_found"
        );
      return u;
    } catch (r) {
      throw r instanceof Error ? (c.error(`Failed to fetch url ${i}`, r), r instanceof h ? new n(r.message, "network_error") : r) : new Error("Unknown error", { cause: r });
    }
  }
  return { loadCapabilities: a };
}
export {
  R as useCapabilities
};
