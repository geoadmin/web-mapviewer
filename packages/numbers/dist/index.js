function s(n, r = 0) {
  if (!i(n))
    return Number.NaN;
  if (r === 0)
    return Math.round(n);
  const t = Math.pow(10, r);
  return Math.round(n * t) / t;
}
function f(n, r) {
  if (Array.isArray(r) && r.length > 2) {
    const t = r.map((u) => Math.abs(n - u)), e = t.reduce(
      (u, c) => u > c ? c : u
    ), o = t.indexOf(e);
    return typeof r[o] != "number" || isNaN(r[o]) ? n : r[o];
  }
  return n;
}
function i(n) {
  return n != null && !Number.isNaN(Number(n)) && (typeof n != "string" || n.length !== 0);
}
function h(n, r) {
  return !Number.isInteger(n) || !Number.isInteger(r) || r < n ? 0 : Math.floor(Math.random() * (r - n + 1) + n);
}
const a = /\B(?=(\d{3})+(?!\d))/g;
function p(n, r = 2) {
  return i(n) ? `${s(n, r)}`.replace(a, "'") : "";
}
function d(n, r = "'") {
  const t = ".", e = `${n}`.split(t);
  return typeof e[0] != "string" || e[0].length === 0 ? `${n}` : (e[0] = e[0].replace(a, r), e.join(t));
}
function m(n) {
  const r = Math.sign(n), t = Math.abs(n);
  return t > 360 ? r * (t % 360) : t === 360 ? 0 : n;
}
function M(n) {
  return /^\d{4}(1[0-2]|0[1-9])(0[1-9]|[1-2][0-9]|3[0-1])$/.test(n);
}
function N(n) {
  if (!Array.isArray(n) || n.some((o) => !i(o)))
    return;
  const r = n.reduce((o, u) => o + Math.cos(u), 0), t = n.reduce((o, u) => o + Math.sin(u), 0);
  let e = Math.atan2(t, r);
  return e < 0 && (e = 6.2831853 + e), e;
}
const b = {
  round: s,
  closest: f,
  isNumber: i,
  randomIntBetween: h,
  format: p,
  formatThousand: d,
  wrapDegrees: m,
  isTimestampYYYYMMDD: M,
  circularMean: N
};
export {
  N as circularMean,
  f as closest,
  b as default,
  p as format,
  d as formatThousand,
  i as isNumber,
  M as isTimestampYYYYMMDD,
  b as numbers,
  h as randomIntBetween,
  s as round,
  m as wrapDegrees
};
