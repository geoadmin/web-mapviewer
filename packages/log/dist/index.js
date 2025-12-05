var u = /* @__PURE__ */ ((c) => (c[c.Error = 0] = "Error", c[c.Warn = 1] = "Warn", c[c.Info = 2] = "Info", c[c.Debug = 3] = "Debug", c))(u || {}), a = /* @__PURE__ */ ((c) => (c.Red = "oklch(63.7% 0.237 25.331)", c.Orange = "oklch(70.5% 0.213 47.604)", c.Amber = "oklch(76.9% 0.188 70.08)", c.Yellow = "oklch(79.5% 0.184 86.047)", c.Lime = "oklch(76.8% 0.233 130.85)", c.Green = "oklch(72.3% 0.219 149.579)", c.Emerald = "oklch(69.6% 0.17 162.48)", c.Teal = "oklch(70.4% 0.14 182.503)", c.Cyan = "oklch(71.5% 0.143 215.221)", c.Sky = "oklch(68.5% 0.169 237.323)", c.Blue = "oklch(62.3% 0.214 259.815)", c.Indigo = "oklch(58.5% 0.233 277.117)", c.Violet = "oklch(60.6% 0.25 292.717)", c.Purple = "oklch(62.7% 0.265 303.9)", c.Fuchsia = "oklch(66.7% 0.295 322.15)", c.Pink = "oklch(65.6% 0.241 354.308)", c.Rose = "oklch(64.5% 0.246 16.439)", c.Slate = "oklch(55.4% 0.046 257.417)", c.Gray = "oklch(55.1% 0.027 264.364)", c.Zinc = "oklch(55.2% 0.016 285.938)", c.Neutral = "oklch(55.6% 0 0)", c.Stone = "oklch(55.3% 0.013 58.071)", c))(a || {});
function r(c) {
  return `color: #000; font-weight: bold; background-color: ${c}; padding: 2px 4px; border-radius: 4px;`;
}
function l(c) {
  return c.flatMap((t) => {
    if (t && typeof t == "object" && "messages" in t && Array.isArray(t.messages)) {
      const k = [];
      if ("title" in t && typeof t.title == "string") {
        k.push(`%c[${t.title}]%c`);
        let n = "oklch(55.4% 0.046 257.417)";
        "titleColor" in t && typeof t.titleColor == "string" && (n = t.titleColor), k.push(r(n)), k.push("");
      }
      return k.push(...t.messages), k;
    }
    return t;
  });
}
function h(c, t) {
  if (p.wantedLevels.includes(c))
    switch (c) {
      case 0:
        console.error(...l(t));
        break;
      case 1:
        console.warn(...l(t));
        break;
      case 2:
        console.info(...l(t));
        break;
      case 3:
        console.debug(...l(t));
        break;
    }
}
const p = {
  wantedLevels: [
    0,
    1
    /* Warn */
  ],
  error: (...c) => h(0, c),
  warn: (...c) => h(1, c),
  info: (...c) => h(2, c),
  debug: (...c) => h(3, c)
};
export {
  u as LogLevel,
  a as LogPreDefinedColor,
  p as default
};
