import { Y as Zl, L as Me, b as Py, c as Bl, K as ll } from "./index-C9BI3pET.js";
import { InvalidLayerDataError as Ln } from "./validation.js";
class ln extends Error {
}
class Zy extends ln {
  constructor(n) {
    super(`Invalid DateTime: ${n.toMessage()}`);
  }
}
class By extends ln {
  constructor(n) {
    super(`Invalid Interval: ${n.toMessage()}`);
  }
}
class Gy extends ln {
  constructor(n) {
    super(`Invalid Duration: ${n.toMessage()}`);
  }
}
class bn extends ln {
}
class Gl extends ln {
  constructor(n) {
    super(`Invalid unit ${n}`);
  }
}
class Te extends ln {
}
class Pt extends ln {
  constructor() {
    super("Zone is an abstract class");
  }
}
const k = "numeric", ht = "short", $e = "long", Si = {
  year: k,
  month: k,
  day: k
}, Hl = {
  year: k,
  month: ht,
  day: k
}, Hy = {
  year: k,
  month: ht,
  day: k,
  weekday: ht
}, zl = {
  year: k,
  month: $e,
  day: k
}, ql = {
  year: k,
  month: $e,
  day: k,
  weekday: $e
}, Yl = {
  hour: k,
  minute: k
}, Jl = {
  hour: k,
  minute: k,
  second: k
}, Kl = {
  hour: k,
  minute: k,
  second: k,
  timeZoneName: ht
}, Xl = {
  hour: k,
  minute: k,
  second: k,
  timeZoneName: $e
}, Ql = {
  hour: k,
  minute: k,
  hourCycle: "h23"
}, jl = {
  hour: k,
  minute: k,
  second: k,
  hourCycle: "h23"
}, ef = {
  hour: k,
  minute: k,
  second: k,
  hourCycle: "h23",
  timeZoneName: ht
}, tf = {
  hour: k,
  minute: k,
  second: k,
  hourCycle: "h23",
  timeZoneName: $e
}, nf = {
  year: k,
  month: k,
  day: k,
  hour: k,
  minute: k
}, rf = {
  year: k,
  month: k,
  day: k,
  hour: k,
  minute: k,
  second: k
}, sf = {
  year: k,
  month: ht,
  day: k,
  hour: k,
  minute: k
}, uf = {
  year: k,
  month: ht,
  day: k,
  hour: k,
  minute: k,
  second: k
}, zy = {
  year: k,
  month: ht,
  day: k,
  weekday: ht,
  hour: k,
  minute: k
}, af = {
  year: k,
  month: $e,
  day: k,
  hour: k,
  minute: k,
  timeZoneName: ht
}, of = {
  year: k,
  month: $e,
  day: k,
  hour: k,
  minute: k,
  second: k,
  timeZoneName: ht
}, lf = {
  year: k,
  month: $e,
  day: k,
  weekday: $e,
  hour: k,
  minute: k,
  timeZoneName: $e
}, ff = {
  year: k,
  month: $e,
  day: k,
  weekday: $e,
  hour: k,
  minute: k,
  second: k,
  timeZoneName: $e
};
class mr {
  /**
   * The type of zone
   * @abstract
   * @type {string}
   */
  get type() {
    throw new Pt();
  }
  /**
   * The name of this zone.
   * @abstract
   * @type {string}
   */
  get name() {
    throw new Pt();
  }
  /**
   * The IANA name of this zone.
   * Defaults to `name` if not overwritten by a subclass.
   * @abstract
   * @type {string}
   */
  get ianaName() {
    return this.name;
  }
  /**
   * Returns whether the offset is known to be fixed for the whole year.
   * @abstract
   * @type {boolean}
   */
  get isUniversal() {
    throw new Pt();
  }
  /**
   * Returns the offset's common name (such as EST) at the specified timestamp
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the name
   * @param {Object} opts - Options to affect the format
   * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
   * @param {string} opts.locale - What locale to return the offset name in.
   * @return {string}
   */
  offsetName(n, i) {
    throw new Pt();
  }
  /**
   * Returns the offset's value as a string
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(n, i) {
    throw new Pt();
  }
  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  offset(n) {
    throw new Pt();
  }
  /**
   * Return whether this Zone is equal to another zone
   * @abstract
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(n) {
    throw new Pt();
  }
  /**
   * Return whether this Zone is valid.
   * @abstract
   * @type {boolean}
   */
  get isValid() {
    throw new Pt();
  }
}
let js = null;
class Ii extends mr {
  /**
   * Get a singleton instance of the local zone
   * @return {SystemZone}
   */
  static get instance() {
    return js === null && (js = new Ii()), js;
  }
  /** @override **/
  get type() {
    return "system";
  }
  /** @override **/
  get name() {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  /** @override **/
  get isUniversal() {
    return !1;
  }
  /** @override **/
  offsetName(n, { format: i, locale: a }) {
    return Tf(n, i, a);
  }
  /** @override **/
  formatOffset(n, i) {
    return cr(this.offset(n), i);
  }
  /** @override **/
  offset(n) {
    return -new Date(n).getTimezoneOffset();
  }
  /** @override **/
  equals(n) {
    return n.type === "system";
  }
  /** @override **/
  get isValid() {
    return !0;
  }
}
const fu = /* @__PURE__ */ new Map();
function qy(s) {
  let n = fu.get(s);
  return n === void 0 && (n = new Intl.DateTimeFormat("en-US", {
    hour12: !1,
    timeZone: s,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    era: "short"
  }), fu.set(s, n)), n;
}
const Yy = {
  year: 0,
  month: 1,
  day: 2,
  era: 3,
  hour: 4,
  minute: 5,
  second: 6
};
function Jy(s, n) {
  const i = s.format(n).replace(/\u200E/g, ""), a = /(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(i), [, l, h, m, p, v, E, D] = a;
  return [m, l, h, p, v, E, D];
}
function Ky(s, n) {
  const i = s.formatToParts(n), a = [];
  for (let l = 0; l < i.length; l++) {
    const { type: h, value: m } = i[l], p = Yy[h];
    h === "era" ? a[p] = m : W(p) || (a[p] = parseInt(m, 10));
  }
  return a;
}
const eu = /* @__PURE__ */ new Map();
class bt extends mr {
  /**
   * @param {string} name - Zone name
   * @return {IANAZone}
   */
  static create(n) {
    let i = eu.get(n);
    return i === void 0 && eu.set(n, i = new bt(n)), i;
  }
  /**
   * Reset local caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCache() {
    eu.clear(), fu.clear();
  }
  /**
   * Returns whether the provided string is a valid specifier. This only checks the string's format, not that the specifier identifies a known zone; see isValidZone for that.
   * @param {string} s - The string to check validity on
   * @example IANAZone.isValidSpecifier("America/New_York") //=> true
   * @example IANAZone.isValidSpecifier("Sport~~blorp") //=> false
   * @deprecated For backward compatibility, this forwards to isValidZone, better use `isValidZone()` directly instead.
   * @return {boolean}
   */
  static isValidSpecifier(n) {
    return this.isValidZone(n);
  }
  /**
   * Returns whether the provided string identifies a real zone
   * @param {string} zone - The string to check
   * @example IANAZone.isValidZone("America/New_York") //=> true
   * @example IANAZone.isValidZone("Fantasia/Castle") //=> false
   * @example IANAZone.isValidZone("Sport~~blorp") //=> false
   * @return {boolean}
   */
  static isValidZone(n) {
    if (!n)
      return !1;
    try {
      return new Intl.DateTimeFormat("en-US", { timeZone: n }).format(), !0;
    } catch {
      return !1;
    }
  }
  constructor(n) {
    super(), this.zoneName = n, this.valid = bt.isValidZone(n);
  }
  /**
   * The type of zone. `iana` for all instances of `IANAZone`.
   * @override
   * @type {string}
   */
  get type() {
    return "iana";
  }
  /**
   * The name of this zone (i.e. the IANA zone name).
   * @override
   * @type {string}
   */
  get name() {
    return this.zoneName;
  }
  /**
   * Returns whether the offset is known to be fixed for the whole year:
   * Always returns false for all IANA zones.
   * @override
   * @type {boolean}
   */
  get isUniversal() {
    return !1;
  }
  /**
   * Returns the offset's common name (such as EST) at the specified timestamp
   * @override
   * @param {number} ts - Epoch milliseconds for which to get the name
   * @param {Object} opts - Options to affect the format
   * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
   * @param {string} opts.locale - What locale to return the offset name in.
   * @return {string}
   */
  offsetName(n, { format: i, locale: a }) {
    return Tf(n, i, a, this.name);
  }
  /**
   * Returns the offset's value as a string
   * @override
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(n, i) {
    return cr(this.offset(n), i);
  }
  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @override
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  offset(n) {
    if (!this.valid) return NaN;
    const i = new Date(n);
    if (isNaN(i)) return NaN;
    const a = qy(this.name);
    let [l, h, m, p, v, E, D] = a.formatToParts ? Ky(a, i) : Jy(a, i);
    p === "BC" && (l = -Math.abs(l) + 1);
    const J = Mi({
      year: l,
      month: h,
      day: m,
      hour: v === 24 ? 0 : v,
      minute: E,
      second: D,
      millisecond: 0
    });
    let C = +i;
    const j = C % 1e3;
    return C -= j >= 0 ? j : 1e3 + j, (J - C) / (60 * 1e3);
  }
  /**
   * Return whether this Zone is equal to another zone
   * @override
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(n) {
    return n.type === "iana" && n.name === this.name;
  }
  /**
   * Return whether this Zone is valid.
   * @override
   * @type {boolean}
   */
  get isValid() {
    return this.valid;
  }
}
let fl = {};
function Xy(s, n = {}) {
  const i = JSON.stringify([s, n]);
  let a = fl[i];
  return a || (a = new Intl.ListFormat(s, n), fl[i] = a), a;
}
const cu = /* @__PURE__ */ new Map();
function hu(s, n = {}) {
  const i = JSON.stringify([s, n]);
  let a = cu.get(i);
  return a === void 0 && (a = new Intl.DateTimeFormat(s, n), cu.set(i, a)), a;
}
const du = /* @__PURE__ */ new Map();
function Qy(s, n = {}) {
  const i = JSON.stringify([s, n]);
  let a = du.get(i);
  return a === void 0 && (a = new Intl.NumberFormat(s, n), du.set(i, a)), a;
}
const mu = /* @__PURE__ */ new Map();
function jy(s, n = {}) {
  const { base: i, ...a } = n, l = JSON.stringify([s, a]);
  let h = mu.get(l);
  return h === void 0 && (h = new Intl.RelativeTimeFormat(s, n), mu.set(l, h)), h;
}
let ar = null;
function e1() {
  return ar || (ar = new Intl.DateTimeFormat().resolvedOptions().locale, ar);
}
const gu = /* @__PURE__ */ new Map();
function cf(s) {
  let n = gu.get(s);
  return n === void 0 && (n = new Intl.DateTimeFormat(s).resolvedOptions(), gu.set(s, n)), n;
}
const pu = /* @__PURE__ */ new Map();
function t1(s) {
  let n = pu.get(s);
  if (!n) {
    const i = new Intl.Locale(s);
    n = "getWeekInfo" in i ? i.getWeekInfo() : i.weekInfo, "minimalDays" in n || (n = { ...hf, ...n }), pu.set(s, n);
  }
  return n;
}
function n1(s) {
  const n = s.indexOf("-x-");
  n !== -1 && (s = s.substring(0, n));
  const i = s.indexOf("-u-");
  if (i === -1)
    return [s];
  {
    let a, l;
    try {
      a = hu(s).resolvedOptions(), l = s;
    } catch {
      const v = s.substring(0, i);
      a = hu(v).resolvedOptions(), l = v;
    }
    const { numberingSystem: h, calendar: m } = a;
    return [l, h, m];
  }
}
function r1(s, n, i) {
  return (i || n) && (s.includes("-u-") || (s += "-u"), i && (s += `-ca-${i}`), n && (s += `-nu-${n}`)), s;
}
function i1(s) {
  const n = [];
  for (let i = 1; i <= 12; i++) {
    const a = R.utc(2009, i, 1);
    n.push(s(a));
  }
  return n;
}
function s1(s) {
  const n = [];
  for (let i = 1; i <= 7; i++) {
    const a = R.utc(2016, 11, 13 + i);
    n.push(s(a));
  }
  return n;
}
function ci(s, n, i, a) {
  const l = s.listingMode();
  return l === "error" ? null : l === "en" ? i(n) : a(n);
}
function u1(s) {
  return s.numberingSystem && s.numberingSystem !== "latn" ? !1 : s.numberingSystem === "latn" || !s.locale || s.locale.startsWith("en") || cf(s.locale).numberingSystem === "latn";
}
class a1 {
  constructor(n, i, a) {
    this.padTo = a.padTo || 0, this.floor = a.floor || !1;
    const { padTo: l, floor: h, ...m } = a;
    if (!i || Object.keys(m).length > 0) {
      const p = { useGrouping: !1, ...a };
      a.padTo > 0 && (p.minimumIntegerDigits = a.padTo), this.inf = Qy(n, p);
    }
  }
  format(n) {
    if (this.inf) {
      const i = this.floor ? Math.floor(n) : n;
      return this.inf.format(i);
    } else {
      const i = this.floor ? Math.floor(n) : Iu(n, 3);
      return ce(i, this.padTo);
    }
  }
}
class o1 {
  constructor(n, i, a) {
    this.opts = a, this.originalZone = void 0;
    let l;
    if (this.opts.timeZone)
      this.dt = n;
    else if (n.zone.type === "fixed") {
      const m = -1 * (n.offset / 60), p = m >= 0 ? `Etc/GMT+${m}` : `Etc/GMT${m}`;
      n.offset !== 0 && bt.create(p).valid ? (l = p, this.dt = n) : (l = "UTC", this.dt = n.offset === 0 ? n : n.setZone("UTC").plus({ minutes: n.offset }), this.originalZone = n.zone);
    } else n.zone.type === "system" ? this.dt = n : n.zone.type === "iana" ? (this.dt = n, l = n.zone.name) : (l = "UTC", this.dt = n.setZone("UTC").plus({ minutes: n.offset }), this.originalZone = n.zone);
    const h = { ...this.opts };
    h.timeZone = h.timeZone || l, this.dtf = hu(i, h);
  }
  format() {
    return this.originalZone ? this.formatToParts().map(({ value: n }) => n).join("") : this.dtf.format(this.dt.toJSDate());
  }
  formatToParts() {
    const n = this.dtf.formatToParts(this.dt.toJSDate());
    return this.originalZone ? n.map((i) => {
      if (i.type === "timeZoneName") {
        const a = this.originalZone.offsetName(this.dt.ts, {
          locale: this.dt.locale,
          format: this.opts.timeZoneName
        });
        return {
          ...i,
          value: a
        };
      } else
        return i;
    }) : n;
  }
  resolvedOptions() {
    return this.dtf.resolvedOptions();
  }
}
class l1 {
  constructor(n, i, a) {
    this.opts = { style: "long", ...a }, !i && vf() && (this.rtf = jy(n, a));
  }
  format(n, i) {
    return this.rtf ? this.rtf.format(n, i) : C1(i, n, this.opts.numeric, this.opts.style !== "long");
  }
  formatToParts(n, i) {
    return this.rtf ? this.rtf.formatToParts(n, i) : [];
  }
}
const hf = {
  firstDay: 1,
  minimalDays: 4,
  weekend: [6, 7]
};
class X {
  static fromOpts(n) {
    return X.create(
      n.locale,
      n.numberingSystem,
      n.outputCalendar,
      n.weekSettings,
      n.defaultToEN
    );
  }
  static create(n, i, a, l, h = !1) {
    const m = n || oe.defaultLocale, p = m || (h ? "en-US" : e1()), v = i || oe.defaultNumberingSystem, E = a || oe.defaultOutputCalendar, D = wu(l) || oe.defaultWeekSettings;
    return new X(p, v, E, D, m);
  }
  static resetCache() {
    ar = null, cu.clear(), du.clear(), mu.clear(), gu.clear(), pu.clear();
  }
  static fromObject({ locale: n, numberingSystem: i, outputCalendar: a, weekSettings: l } = {}) {
    return X.create(n, i, a, l);
  }
  constructor(n, i, a, l, h) {
    const [m, p, v] = n1(n);
    this.locale = m, this.numberingSystem = i || p || null, this.outputCalendar = a || v || null, this.weekSettings = l, this.intl = r1(this.locale, this.numberingSystem, this.outputCalendar), this.weekdaysCache = { format: {}, standalone: {} }, this.monthsCache = { format: {}, standalone: {} }, this.meridiemCache = null, this.eraCache = {}, this.specifiedLocale = h, this.fastNumbersCached = null;
  }
  get fastNumbers() {
    return this.fastNumbersCached == null && (this.fastNumbersCached = u1(this)), this.fastNumbersCached;
  }
  listingMode() {
    const n = this.isEnglish(), i = (this.numberingSystem === null || this.numberingSystem === "latn") && (this.outputCalendar === null || this.outputCalendar === "gregory");
    return n && i ? "en" : "intl";
  }
  clone(n) {
    return !n || Object.getOwnPropertyNames(n).length === 0 ? this : X.create(
      n.locale || this.specifiedLocale,
      n.numberingSystem || this.numberingSystem,
      n.outputCalendar || this.outputCalendar,
      wu(n.weekSettings) || this.weekSettings,
      n.defaultToEN || !1
    );
  }
  redefaultToEN(n = {}) {
    return this.clone({ ...n, defaultToEN: !0 });
  }
  redefaultToSystem(n = {}) {
    return this.clone({ ...n, defaultToEN: !1 });
  }
  months(n, i = !1) {
    return ci(this, n, Of, () => {
      const a = this.intl === "ja" || this.intl.startsWith("ja-");
      i &= !a;
      const l = i ? { month: n, day: "numeric" } : { month: n }, h = i ? "format" : "standalone";
      if (!this.monthsCache[h][n]) {
        const m = a ? (p) => this.dtFormatter(p, l).format() : (p) => this.extract(p, l, "month");
        this.monthsCache[h][n] = i1(m);
      }
      return this.monthsCache[h][n];
    });
  }
  weekdays(n, i = !1) {
    return ci(this, n, kf, () => {
      const a = i ? { weekday: n, year: "numeric", month: "long", day: "numeric" } : { weekday: n }, l = i ? "format" : "standalone";
      return this.weekdaysCache[l][n] || (this.weekdaysCache[l][n] = s1(
        (h) => this.extract(h, a, "weekday")
      )), this.weekdaysCache[l][n];
    });
  }
  meridiems() {
    return ci(
      this,
      void 0,
      () => Mf,
      () => {
        if (!this.meridiemCache) {
          const n = { hour: "numeric", hourCycle: "h12" };
          this.meridiemCache = [R.utc(2016, 11, 13, 9), R.utc(2016, 11, 13, 19)].map(
            (i) => this.extract(i, n, "dayperiod")
          );
        }
        return this.meridiemCache;
      }
    );
  }
  eras(n) {
    return ci(this, n, bf, () => {
      const i = { era: n };
      return this.eraCache[n] || (this.eraCache[n] = [R.utc(-40, 1, 1), R.utc(2017, 1, 1)].map(
        (a) => this.extract(a, i, "era")
      )), this.eraCache[n];
    });
  }
  extract(n, i, a) {
    const l = this.dtFormatter(n, i), h = l.formatToParts(), m = h.find((p) => p.type.toLowerCase() === a);
    return m ? m.value : null;
  }
  numberFormatter(n = {}) {
    return new a1(this.intl, n.forceSimple || this.fastNumbers, n);
  }
  dtFormatter(n, i = {}) {
    return new o1(n, this.intl, i);
  }
  relFormatter(n = {}) {
    return new l1(this.intl, this.isEnglish(), n);
  }
  listFormatter(n = {}) {
    return Xy(this.intl, n);
  }
  isEnglish() {
    return this.locale === "en" || this.locale.toLowerCase() === "en-us" || cf(this.intl).locale.startsWith("en-us");
  }
  getWeekSettings() {
    return this.weekSettings ? this.weekSettings : _f() ? t1(this.locale) : hf;
  }
  getStartOfWeek() {
    return this.getWeekSettings().firstDay;
  }
  getMinDaysInFirstWeek() {
    return this.getWeekSettings().minimalDays;
  }
  getWeekendDays() {
    return this.getWeekSettings().weekend;
  }
  equals(n) {
    return this.locale === n.locale && this.numberingSystem === n.numberingSystem && this.outputCalendar === n.outputCalendar;
  }
  toString() {
    return `Locale(${this.locale}, ${this.numberingSystem}, ${this.outputCalendar})`;
  }
}
let tu = null;
class Ie extends mr {
  /**
   * Get a singleton instance of UTC
   * @return {FixedOffsetZone}
   */
  static get utcInstance() {
    return tu === null && (tu = new Ie(0)), tu;
  }
  /**
   * Get an instance with a specified offset
   * @param {number} offset - The offset in minutes
   * @return {FixedOffsetZone}
   */
  static instance(n) {
    return n === 0 ? Ie.utcInstance : new Ie(n);
  }
  /**
   * Get an instance of FixedOffsetZone from a UTC offset string, like "UTC+6"
   * @param {string} s - The offset string to parse
   * @example FixedOffsetZone.parseSpecifier("UTC+6")
   * @example FixedOffsetZone.parseSpecifier("UTC+06")
   * @example FixedOffsetZone.parseSpecifier("UTC-6:00")
   * @return {FixedOffsetZone}
   */
  static parseSpecifier(n) {
    if (n) {
      const i = n.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
      if (i)
        return new Ie(bi(i[1], i[2]));
    }
    return null;
  }
  constructor(n) {
    super(), this.fixed = n;
  }
  /**
   * The type of zone. `fixed` for all instances of `FixedOffsetZone`.
   * @override
   * @type {string}
   */
  get type() {
    return "fixed";
  }
  /**
   * The name of this zone.
   * All fixed zones' names always start with "UTC" (plus optional offset)
   * @override
   * @type {string}
   */
  get name() {
    return this.fixed === 0 ? "UTC" : `UTC${cr(this.fixed, "narrow")}`;
  }
  /**
   * The IANA name of this zone, i.e. `Etc/UTC` or `Etc/GMT+/-nn`
   *
   * @override
   * @type {string}
   */
  get ianaName() {
    return this.fixed === 0 ? "Etc/UTC" : `Etc/GMT${cr(-this.fixed, "narrow")}`;
  }
  /**
   * Returns the offset's common name at the specified timestamp.
   *
   * For fixed offset zones this equals to the zone name.
   * @override
   */
  offsetName() {
    return this.name;
  }
  /**
   * Returns the offset's value as a string
   * @override
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(n, i) {
    return cr(this.fixed, i);
  }
  /**
   * Returns whether the offset is known to be fixed for the whole year:
   * Always returns true for all fixed offset zones.
   * @override
   * @type {boolean}
   */
  get isUniversal() {
    return !0;
  }
  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   *
   * For fixed offset zones, this is constant and does not depend on a timestamp.
   * @override
   * @return {number}
   */
  offset() {
    return this.fixed;
  }
  /**
   * Return whether this Zone is equal to another zone (i.e. also fixed and same offset)
   * @override
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(n) {
    return n.type === "fixed" && n.fixed === this.fixed;
  }
  /**
   * Return whether this Zone is valid:
   * All fixed offset zones are valid.
   * @override
   * @type {boolean}
   */
  get isValid() {
    return !0;
  }
}
class f1 extends mr {
  constructor(n) {
    super(), this.zoneName = n;
  }
  /** @override **/
  get type() {
    return "invalid";
  }
  /** @override **/
  get name() {
    return this.zoneName;
  }
  /** @override **/
  get isUniversal() {
    return !1;
  }
  /** @override **/
  offsetName() {
    return null;
  }
  /** @override **/
  formatOffset() {
    return "";
  }
  /** @override **/
  offset() {
    return NaN;
  }
  /** @override **/
  equals() {
    return !1;
  }
  /** @override **/
  get isValid() {
    return !1;
  }
}
function Bt(s, n) {
  if (W(s) || s === null)
    return n;
  if (s instanceof mr)
    return s;
  if (p1(s)) {
    const i = s.toLowerCase();
    return i === "default" ? n : i === "local" || i === "system" ? Ii.instance : i === "utc" || i === "gmt" ? Ie.utcInstance : Ie.parseSpecifier(i) || bt.create(s);
  } else return Gt(s) ? Ie.instance(s) : typeof s == "object" && "offset" in s && typeof s.offset == "function" ? s : new f1(s);
}
const Su = {
  arab: "[٠-٩]",
  arabext: "[۰-۹]",
  bali: "[᭐-᭙]",
  beng: "[০-৯]",
  deva: "[०-९]",
  fullwide: "[０-９]",
  gujr: "[૦-૯]",
  hanidec: "[〇|一|二|三|四|五|六|七|八|九]",
  khmr: "[០-៩]",
  knda: "[೦-೯]",
  laoo: "[໐-໙]",
  limb: "[᥆-᥏]",
  mlym: "[൦-൯]",
  mong: "[᠐-᠙]",
  mymr: "[၀-၉]",
  orya: "[୦-୯]",
  tamldec: "[௦-௯]",
  telu: "[౦-౯]",
  thai: "[๐-๙]",
  tibt: "[༠-༩]",
  latn: "\\d"
}, cl = {
  arab: [1632, 1641],
  arabext: [1776, 1785],
  bali: [6992, 7001],
  beng: [2534, 2543],
  deva: [2406, 2415],
  fullwide: [65296, 65303],
  gujr: [2790, 2799],
  khmr: [6112, 6121],
  knda: [3302, 3311],
  laoo: [3792, 3801],
  limb: [6470, 6479],
  mlym: [3430, 3439],
  mong: [6160, 6169],
  mymr: [4160, 4169],
  orya: [2918, 2927],
  tamldec: [3046, 3055],
  telu: [3174, 3183],
  thai: [3664, 3673],
  tibt: [3872, 3881]
}, c1 = Su.hanidec.replace(/[\[|\]]/g, "").split("");
function h1(s) {
  let n = parseInt(s, 10);
  if (isNaN(n)) {
    n = "";
    for (let i = 0; i < s.length; i++) {
      const a = s.charCodeAt(i);
      if (s[i].search(Su.hanidec) !== -1)
        n += c1.indexOf(s[i]);
      else
        for (const l in cl) {
          const [h, m] = cl[l];
          a >= h && a <= m && (n += a - h);
        }
    }
    return parseInt(n, 10);
  } else
    return n;
}
const yu = /* @__PURE__ */ new Map();
function d1() {
  yu.clear();
}
function lt({ numberingSystem: s }, n = "") {
  const i = s || "latn";
  let a = yu.get(i);
  a === void 0 && (a = /* @__PURE__ */ new Map(), yu.set(i, a));
  let l = a.get(n);
  return l === void 0 && (l = new RegExp(`${Su[i]}${n}`), a.set(n, l)), l;
}
let hl = () => Date.now(), dl = "system", ml = null, gl = null, pl = null, yl = 60, wl, vl = null;
class oe {
  /**
   * Get the callback for returning the current timestamp.
   * @type {function}
   */
  static get now() {
    return hl;
  }
  /**
   * Set the callback for returning the current timestamp.
   * The function should return a number, which will be interpreted as an Epoch millisecond count
   * @type {function}
   * @example Settings.now = () => Date.now() + 3000 // pretend it is 3 seconds in the future
   * @example Settings.now = () => 0 // always pretend it's Jan 1, 1970 at midnight in UTC time
   */
  static set now(n) {
    hl = n;
  }
  /**
   * Set the default time zone to create DateTimes in. Does not affect existing instances.
   * Use the value "system" to reset this value to the system's time zone.
   * @type {string}
   */
  static set defaultZone(n) {
    dl = n;
  }
  /**
   * Get the default time zone object currently used to create DateTimes. Does not affect existing instances.
   * The default value is the system's time zone (the one set on the machine that runs this code).
   * @type {Zone}
   */
  static get defaultZone() {
    return Bt(dl, Ii.instance);
  }
  /**
   * Get the default locale to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultLocale() {
    return ml;
  }
  /**
   * Set the default locale to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultLocale(n) {
    ml = n;
  }
  /**
   * Get the default numbering system to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultNumberingSystem() {
    return gl;
  }
  /**
   * Set the default numbering system to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultNumberingSystem(n) {
    gl = n;
  }
  /**
   * Get the default output calendar to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultOutputCalendar() {
    return pl;
  }
  /**
   * Set the default output calendar to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultOutputCalendar(n) {
    pl = n;
  }
  /**
   * @typedef {Object} WeekSettings
   * @property {number} firstDay
   * @property {number} minimalDays
   * @property {number[]} weekend
   */
  /**
   * @return {WeekSettings|null}
   */
  static get defaultWeekSettings() {
    return vl;
  }
  /**
   * Allows overriding the default locale week settings, i.e. the start of the week, the weekend and
   * how many days are required in the first week of a year.
   * Does not affect existing instances.
   *
   * @param {WeekSettings|null} weekSettings
   */
  static set defaultWeekSettings(n) {
    vl = wu(n);
  }
  /**
   * Get the cutoff year for whether a 2-digit year string is interpreted in the current or previous century. Numbers higher than the cutoff will be considered to mean 19xx and numbers lower or equal to the cutoff will be considered 20xx.
   * @type {number}
   */
  static get twoDigitCutoffYear() {
    return yl;
  }
  /**
   * Set the cutoff year for whether a 2-digit year string is interpreted in the current or previous century. Numbers higher than the cutoff will be considered to mean 19xx and numbers lower or equal to the cutoff will be considered 20xx.
   * @type {number}
   * @example Settings.twoDigitCutoffYear = 0 // all 'yy' are interpreted as 20th century
   * @example Settings.twoDigitCutoffYear = 99 // all 'yy' are interpreted as 21st century
   * @example Settings.twoDigitCutoffYear = 50 // '49' -> 2049; '50' -> 1950
   * @example Settings.twoDigitCutoffYear = 1950 // interpreted as 50
   * @example Settings.twoDigitCutoffYear = 2050 // ALSO interpreted as 50
   */
  static set twoDigitCutoffYear(n) {
    yl = n % 100;
  }
  /**
   * Get whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
   * @type {boolean}
   */
  static get throwOnInvalid() {
    return wl;
  }
  /**
   * Set whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
   * @type {boolean}
   */
  static set throwOnInvalid(n) {
    wl = n;
  }
  /**
   * Reset Luxon's global caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCaches() {
    X.resetCache(), bt.resetCache(), R.resetCache(), d1();
  }
}
class ct {
  constructor(n, i) {
    this.reason = n, this.explanation = i;
  }
  toMessage() {
    return this.explanation ? `${this.reason}: ${this.explanation}` : this.reason;
  }
}
const df = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], mf = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
function et(s, n) {
  return new ct(
    "unit out of range",
    `you specified ${n} (of type ${typeof n}) as a ${s}, which is invalid`
  );
}
function xu(s, n, i) {
  const a = new Date(Date.UTC(s, n - 1, i));
  s < 100 && s >= 0 && a.setUTCFullYear(a.getUTCFullYear() - 1900);
  const l = a.getUTCDay();
  return l === 0 ? 7 : l;
}
function gf(s, n, i) {
  return i + (gr(s) ? mf : df)[n - 1];
}
function pf(s, n) {
  const i = gr(s) ? mf : df, a = i.findIndex((h) => h < n), l = n - i[a];
  return { month: a + 1, day: l };
}
function Ou(s, n) {
  return (s - n + 7) % 7 + 1;
}
function xi(s, n = 4, i = 1) {
  const { year: a, month: l, day: h } = s, m = gf(a, l, h), p = Ou(xu(a, l, h), i);
  let v = Math.floor((m - p + 14 - n) / 7), E;
  return v < 1 ? (E = a - 1, v = hr(E, n, i)) : v > hr(a, n, i) ? (E = a + 1, v = 1) : E = a, { weekYear: E, weekNumber: v, weekday: p, ...Di(s) };
}
function _l(s, n = 4, i = 1) {
  const { weekYear: a, weekNumber: l, weekday: h } = s, m = Ou(xu(a, 1, n), i), p = Dn(a);
  let v = l * 7 + h - m - 7 + n, E;
  v < 1 ? (E = a - 1, v += Dn(E)) : v > p ? (E = a + 1, v -= Dn(a)) : E = a;
  const { month: D, day: A } = pf(E, v);
  return { year: E, month: D, day: A, ...Di(s) };
}
function nu(s) {
  const { year: n, month: i, day: a } = s, l = gf(n, i, a);
  return { year: n, ordinal: l, ...Di(s) };
}
function Tl(s) {
  const { year: n, ordinal: i } = s, { month: a, day: l } = pf(n, i);
  return { year: n, month: a, day: l, ...Di(s) };
}
function Sl(s, n) {
  if (!W(s.localWeekday) || !W(s.localWeekNumber) || !W(s.localWeekYear)) {
    if (!W(s.weekday) || !W(s.weekNumber) || !W(s.weekYear))
      throw new bn(
        "Cannot mix locale-based week fields with ISO-based week fields"
      );
    return W(s.localWeekday) || (s.weekday = s.localWeekday), W(s.localWeekNumber) || (s.weekNumber = s.localWeekNumber), W(s.localWeekYear) || (s.weekYear = s.localWeekYear), delete s.localWeekday, delete s.localWeekNumber, delete s.localWeekYear, {
      minDaysInFirstWeek: n.getMinDaysInFirstWeek(),
      startOfWeek: n.getStartOfWeek()
    };
  } else
    return { minDaysInFirstWeek: 4, startOfWeek: 1 };
}
function m1(s, n = 4, i = 1) {
  const a = ki(s.weekYear), l = tt(
    s.weekNumber,
    1,
    hr(s.weekYear, n, i)
  ), h = tt(s.weekday, 1, 7);
  return a ? l ? h ? !1 : et("weekday", s.weekday) : et("week", s.weekNumber) : et("weekYear", s.weekYear);
}
function g1(s) {
  const n = ki(s.year), i = tt(s.ordinal, 1, Dn(s.year));
  return n ? i ? !1 : et("ordinal", s.ordinal) : et("year", s.year);
}
function yf(s) {
  const n = ki(s.year), i = tt(s.month, 1, 12), a = tt(s.day, 1, Oi(s.year, s.month));
  return n ? i ? a ? !1 : et("day", s.day) : et("month", s.month) : et("year", s.year);
}
function wf(s) {
  const { hour: n, minute: i, second: a, millisecond: l } = s, h = tt(n, 0, 23) || n === 24 && i === 0 && a === 0 && l === 0, m = tt(i, 0, 59), p = tt(a, 0, 59), v = tt(l, 0, 999);
  return h ? m ? p ? v ? !1 : et("millisecond", l) : et("second", a) : et("minute", i) : et("hour", n);
}
function W(s) {
  return typeof s > "u";
}
function Gt(s) {
  return typeof s == "number";
}
function ki(s) {
  return typeof s == "number" && s % 1 === 0;
}
function p1(s) {
  return typeof s == "string";
}
function y1(s) {
  return Object.prototype.toString.call(s) === "[object Date]";
}
function vf() {
  try {
    return typeof Intl < "u" && !!Intl.RelativeTimeFormat;
  } catch {
    return !1;
  }
}
function _f() {
  try {
    return typeof Intl < "u" && !!Intl.Locale && ("weekInfo" in Intl.Locale.prototype || "getWeekInfo" in Intl.Locale.prototype);
  } catch {
    return !1;
  }
}
function w1(s) {
  return Array.isArray(s) ? s : [s];
}
function xl(s, n, i) {
  if (s.length !== 0)
    return s.reduce((a, l) => {
      const h = [n(l), l];
      return a && i(a[0], h[0]) === a[0] ? a : h;
    }, null)[1];
}
function v1(s, n) {
  return n.reduce((i, a) => (i[a] = s[a], i), {});
}
function An(s, n) {
  return Object.prototype.hasOwnProperty.call(s, n);
}
function wu(s) {
  if (s == null)
    return null;
  if (typeof s != "object")
    throw new Te("Week settings must be an object");
  if (!tt(s.firstDay, 1, 7) || !tt(s.minimalDays, 1, 7) || !Array.isArray(s.weekend) || s.weekend.some((n) => !tt(n, 1, 7)))
    throw new Te("Invalid week settings");
  return {
    firstDay: s.firstDay,
    minimalDays: s.minimalDays,
    weekend: Array.from(s.weekend)
  };
}
function tt(s, n, i) {
  return ki(s) && s >= n && s <= i;
}
function _1(s, n) {
  return s - n * Math.floor(s / n);
}
function ce(s, n = 2) {
  const i = s < 0;
  let a;
  return i ? a = "-" + ("" + -s).padStart(n, "0") : a = ("" + s).padStart(n, "0"), a;
}
function Zt(s) {
  if (!(W(s) || s === null || s === ""))
    return parseInt(s, 10);
}
function un(s) {
  if (!(W(s) || s === null || s === ""))
    return parseFloat(s);
}
function Eu(s) {
  if (!(W(s) || s === null || s === "")) {
    const n = parseFloat("0." + s) * 1e3;
    return Math.floor(n);
  }
}
function Iu(s, n, i = "round") {
  const a = 10 ** n;
  switch (i) {
    case "expand":
      return s > 0 ? Math.ceil(s * a) / a : Math.floor(s * a) / a;
    case "trunc":
      return Math.trunc(s * a) / a;
    case "round":
      return Math.round(s * a) / a;
    case "floor":
      return Math.floor(s * a) / a;
    case "ceil":
      return Math.ceil(s * a) / a;
    default:
      throw new RangeError(`Value rounding ${i} is out of range`);
  }
}
function gr(s) {
  return s % 4 === 0 && (s % 100 !== 0 || s % 400 === 0);
}
function Dn(s) {
  return gr(s) ? 366 : 365;
}
function Oi(s, n) {
  const i = _1(n - 1, 12) + 1, a = s + (n - i) / 12;
  return i === 2 ? gr(a) ? 29 : 28 : [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i - 1];
}
function Mi(s) {
  let n = Date.UTC(
    s.year,
    s.month - 1,
    s.day,
    s.hour,
    s.minute,
    s.second,
    s.millisecond
  );
  return s.year < 100 && s.year >= 0 && (n = new Date(n), n.setUTCFullYear(s.year, s.month - 1, s.day)), +n;
}
function Ol(s, n, i) {
  return -Ou(xu(s, 1, n), i) + n - 1;
}
function hr(s, n = 4, i = 1) {
  const a = Ol(s, n, i), l = Ol(s + 1, n, i);
  return (Dn(s) - a + l) / 7;
}
function vu(s) {
  return s > 99 ? s : s > oe.twoDigitCutoffYear ? 1900 + s : 2e3 + s;
}
function Tf(s, n, i, a = null) {
  const l = new Date(s), h = {
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  };
  a && (h.timeZone = a);
  const m = { timeZoneName: n, ...h }, p = new Intl.DateTimeFormat(i, m).formatToParts(l).find((v) => v.type.toLowerCase() === "timezonename");
  return p ? p.value : null;
}
function bi(s, n) {
  let i = parseInt(s, 10);
  Number.isNaN(i) && (i = 0);
  const a = parseInt(n, 10) || 0, l = i < 0 || Object.is(i, -0) ? -a : a;
  return i * 60 + l;
}
function Sf(s) {
  const n = Number(s);
  if (typeof s == "boolean" || s === "" || !Number.isFinite(n))
    throw new Te(`Invalid unit value ${s}`);
  return n;
}
function Ei(s, n) {
  const i = {};
  for (const a in s)
    if (An(s, a)) {
      const l = s[a];
      if (l == null) continue;
      i[n(a)] = Sf(l);
    }
  return i;
}
function cr(s, n) {
  const i = Math.trunc(Math.abs(s / 60)), a = Math.trunc(Math.abs(s % 60)), l = s >= 0 ? "+" : "-";
  switch (n) {
    case "short":
      return `${l}${ce(i, 2)}:${ce(a, 2)}`;
    case "narrow":
      return `${l}${i}${a > 0 ? `:${a}` : ""}`;
    case "techie":
      return `${l}${ce(i, 2)}${ce(a, 2)}`;
    default:
      throw new RangeError(`Value format ${n} is out of range for property format`);
  }
}
function Di(s) {
  return v1(s, ["hour", "minute", "second", "millisecond"]);
}
const T1 = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
], xf = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
], S1 = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
function Of(s) {
  switch (s) {
    case "narrow":
      return [...S1];
    case "short":
      return [...xf];
    case "long":
      return [...T1];
    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    case "2-digit":
      return ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    default:
      return null;
  }
}
const Ef = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
], If = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], x1 = ["M", "T", "W", "T", "F", "S", "S"];
function kf(s) {
  switch (s) {
    case "narrow":
      return [...x1];
    case "short":
      return [...If];
    case "long":
      return [...Ef];
    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7"];
    default:
      return null;
  }
}
const Mf = ["AM", "PM"], O1 = ["Before Christ", "Anno Domini"], E1 = ["BC", "AD"], I1 = ["B", "A"];
function bf(s) {
  switch (s) {
    case "narrow":
      return [...I1];
    case "short":
      return [...E1];
    case "long":
      return [...O1];
    default:
      return null;
  }
}
function k1(s) {
  return Mf[s.hour < 12 ? 0 : 1];
}
function M1(s, n) {
  return kf(n)[s.weekday - 1];
}
function b1(s, n) {
  return Of(n)[s.month - 1];
}
function D1(s, n) {
  return bf(n)[s.year < 0 ? 0 : 1];
}
function C1(s, n, i = "always", a = !1) {
  const l = {
    years: ["year", "yr."],
    quarters: ["quarter", "qtr."],
    months: ["month", "mo."],
    weeks: ["week", "wk."],
    days: ["day", "day", "days"],
    hours: ["hour", "hr."],
    minutes: ["minute", "min."],
    seconds: ["second", "sec."]
  }, h = ["hours", "minutes", "seconds"].indexOf(s) === -1;
  if (i === "auto" && h) {
    const A = s === "days";
    switch (n) {
      case 1:
        return A ? "tomorrow" : `next ${l[s][0]}`;
      case -1:
        return A ? "yesterday" : `last ${l[s][0]}`;
      case 0:
        return A ? "today" : `this ${l[s][0]}`;
    }
  }
  const m = Object.is(n, -0) || n < 0, p = Math.abs(n), v = p === 1, E = l[s], D = a ? v ? E[1] : E[2] || E[1] : v ? l[s][0] : s;
  return m ? `${p} ${D} ago` : `in ${p} ${D}`;
}
function El(s, n) {
  let i = "";
  for (const a of s)
    a.literal ? i += a.val : i += n(a.val);
  return i;
}
const L1 = {
  D: Si,
  DD: Hl,
  DDD: zl,
  DDDD: ql,
  t: Yl,
  tt: Jl,
  ttt: Kl,
  tttt: Xl,
  T: Ql,
  TT: jl,
  TTT: ef,
  TTTT: tf,
  f: nf,
  ff: sf,
  fff: af,
  ffff: lf,
  F: rf,
  FF: uf,
  FFF: of,
  FFFF: ff
};
class Se {
  static create(n, i = {}) {
    return new Se(n, i);
  }
  static parseFormat(n) {
    let i = null, a = "", l = !1;
    const h = [];
    for (let m = 0; m < n.length; m++) {
      const p = n.charAt(m);
      p === "'" ? ((a.length > 0 || l) && h.push({
        literal: l || /^\s+$/.test(a),
        val: a === "" ? "'" : a
      }), i = null, a = "", l = !l) : l || p === i ? a += p : (a.length > 0 && h.push({ literal: /^\s+$/.test(a), val: a }), a = p, i = p);
    }
    return a.length > 0 && h.push({ literal: l || /^\s+$/.test(a), val: a }), h;
  }
  static macroTokenToFormatOpts(n) {
    return L1[n];
  }
  constructor(n, i) {
    this.opts = i, this.loc = n, this.systemLoc = null;
  }
  formatWithSystemDefault(n, i) {
    return this.systemLoc === null && (this.systemLoc = this.loc.redefaultToSystem()), this.systemLoc.dtFormatter(n, { ...this.opts, ...i }).format();
  }
  dtFormatter(n, i = {}) {
    return this.loc.dtFormatter(n, { ...this.opts, ...i });
  }
  formatDateTime(n, i) {
    return this.dtFormatter(n, i).format();
  }
  formatDateTimeParts(n, i) {
    return this.dtFormatter(n, i).formatToParts();
  }
  formatInterval(n, i) {
    return this.dtFormatter(n.start, i).dtf.formatRange(n.start.toJSDate(), n.end.toJSDate());
  }
  resolvedOptions(n, i) {
    return this.dtFormatter(n, i).resolvedOptions();
  }
  num(n, i = 0, a = void 0) {
    if (this.opts.forceSimple)
      return ce(n, i);
    const l = { ...this.opts };
    return i > 0 && (l.padTo = i), a && (l.signDisplay = a), this.loc.numberFormatter(l).format(n);
  }
  formatDateTimeFromString(n, i) {
    const a = this.loc.listingMode() === "en", l = this.loc.outputCalendar && this.loc.outputCalendar !== "gregory", h = (C, j) => this.loc.extract(n, C, j), m = (C) => n.isOffsetFixed && n.offset === 0 && C.allowZ ? "Z" : n.isValid ? n.zone.formatOffset(n.ts, C.format) : "", p = () => a ? k1(n) : h({ hour: "numeric", hourCycle: "h12" }, "dayperiod"), v = (C, j) => a ? b1(n, C) : h(j ? { month: C } : { month: C, day: "numeric" }, "month"), E = (C, j) => a ? M1(n, C) : h(
      j ? { weekday: C } : { weekday: C, month: "long", day: "numeric" },
      "weekday"
    ), D = (C) => {
      const j = Se.macroTokenToFormatOpts(C);
      return j ? this.formatWithSystemDefault(n, j) : C;
    }, A = (C) => a ? D1(n, C) : h({ era: C }, "era"), J = (C) => {
      switch (C) {
        // ms
        case "S":
          return this.num(n.millisecond);
        case "u":
        // falls through
        case "SSS":
          return this.num(n.millisecond, 3);
        // seconds
        case "s":
          return this.num(n.second);
        case "ss":
          return this.num(n.second, 2);
        // fractional seconds
        case "uu":
          return this.num(Math.floor(n.millisecond / 10), 2);
        case "uuu":
          return this.num(Math.floor(n.millisecond / 100));
        // minutes
        case "m":
          return this.num(n.minute);
        case "mm":
          return this.num(n.minute, 2);
        // hours
        case "h":
          return this.num(n.hour % 12 === 0 ? 12 : n.hour % 12);
        case "hh":
          return this.num(n.hour % 12 === 0 ? 12 : n.hour % 12, 2);
        case "H":
          return this.num(n.hour);
        case "HH":
          return this.num(n.hour, 2);
        // offset
        case "Z":
          return m({ format: "narrow", allowZ: this.opts.allowZ });
        case "ZZ":
          return m({ format: "short", allowZ: this.opts.allowZ });
        case "ZZZ":
          return m({ format: "techie", allowZ: this.opts.allowZ });
        case "ZZZZ":
          return n.zone.offsetName(n.ts, { format: "short", locale: this.loc.locale });
        case "ZZZZZ":
          return n.zone.offsetName(n.ts, { format: "long", locale: this.loc.locale });
        // zone
        case "z":
          return n.zoneName;
        // meridiems
        case "a":
          return p();
        // dates
        case "d":
          return l ? h({ day: "numeric" }, "day") : this.num(n.day);
        case "dd":
          return l ? h({ day: "2-digit" }, "day") : this.num(n.day, 2);
        // weekdays - standalone
        case "c":
          return this.num(n.weekday);
        case "ccc":
          return E("short", !0);
        case "cccc":
          return E("long", !0);
        case "ccccc":
          return E("narrow", !0);
        // weekdays - format
        case "E":
          return this.num(n.weekday);
        case "EEE":
          return E("short", !1);
        case "EEEE":
          return E("long", !1);
        case "EEEEE":
          return E("narrow", !1);
        // months - standalone
        case "L":
          return l ? h({ month: "numeric", day: "numeric" }, "month") : this.num(n.month);
        case "LL":
          return l ? h({ month: "2-digit", day: "numeric" }, "month") : this.num(n.month, 2);
        case "LLL":
          return v("short", !0);
        case "LLLL":
          return v("long", !0);
        case "LLLLL":
          return v("narrow", !0);
        // months - format
        case "M":
          return l ? h({ month: "numeric" }, "month") : this.num(n.month);
        case "MM":
          return l ? h({ month: "2-digit" }, "month") : this.num(n.month, 2);
        case "MMM":
          return v("short", !1);
        case "MMMM":
          return v("long", !1);
        case "MMMMM":
          return v("narrow", !1);
        // years
        case "y":
          return l ? h({ year: "numeric" }, "year") : this.num(n.year);
        case "yy":
          return l ? h({ year: "2-digit" }, "year") : this.num(n.year.toString().slice(-2), 2);
        case "yyyy":
          return l ? h({ year: "numeric" }, "year") : this.num(n.year, 4);
        case "yyyyyy":
          return l ? h({ year: "numeric" }, "year") : this.num(n.year, 6);
        // eras
        case "G":
          return A("short");
        case "GG":
          return A("long");
        case "GGGGG":
          return A("narrow");
        case "kk":
          return this.num(n.weekYear.toString().slice(-2), 2);
        case "kkkk":
          return this.num(n.weekYear, 4);
        case "W":
          return this.num(n.weekNumber);
        case "WW":
          return this.num(n.weekNumber, 2);
        case "n":
          return this.num(n.localWeekNumber);
        case "nn":
          return this.num(n.localWeekNumber, 2);
        case "ii":
          return this.num(n.localWeekYear.toString().slice(-2), 2);
        case "iiii":
          return this.num(n.localWeekYear, 4);
        case "o":
          return this.num(n.ordinal);
        case "ooo":
          return this.num(n.ordinal, 3);
        case "q":
          return this.num(n.quarter);
        case "qq":
          return this.num(n.quarter, 2);
        case "X":
          return this.num(Math.floor(n.ts / 1e3));
        case "x":
          return this.num(n.ts);
        default:
          return D(C);
      }
    };
    return El(Se.parseFormat(i), J);
  }
  formatDurationFromString(n, i) {
    const a = this.opts.signMode === "negativeLargestOnly" ? -1 : 1, l = (D) => {
      switch (D[0]) {
        case "S":
          return "milliseconds";
        case "s":
          return "seconds";
        case "m":
          return "minutes";
        case "h":
          return "hours";
        case "d":
          return "days";
        case "w":
          return "weeks";
        case "M":
          return "months";
        case "y":
          return "years";
        default:
          return null;
      }
    }, h = (D, A) => (J) => {
      const C = l(J);
      if (C) {
        const j = A.isNegativeDuration && C !== A.largestUnit ? a : 1;
        let we;
        return this.opts.signMode === "negativeLargestOnly" && C !== A.largestUnit ? we = "never" : this.opts.signMode === "all" ? we = "always" : we = "auto", this.num(D.get(C) * j, J.length, we);
      } else
        return J;
    }, m = Se.parseFormat(i), p = m.reduce(
      (D, { literal: A, val: J }) => A ? D : D.concat(J),
      []
    ), v = n.shiftTo(...p.map(l).filter((D) => D)), E = {
      isNegativeDuration: v < 0,
      // this relies on "collapsed" being based on "shiftTo", which builds up the object
      // in order
      largestUnit: Object.keys(v.values)[0]
    };
    return El(m, h(v, E));
  }
}
const Df = /[A-Za-z_+-]{1,256}(?::?\/[A-Za-z0-9_+-]{1,256}(?:\/[A-Za-z0-9_+-]{1,256})?)?/;
function Nn(...s) {
  const n = s.reduce((i, a) => i + a.source, "");
  return RegExp(`^${n}$`);
}
function Fn(...s) {
  return (n) => s.reduce(
    ([i, a, l], h) => {
      const [m, p, v] = h(n, l);
      return [{ ...i, ...m }, p || a, v];
    },
    [{}, null, 1]
  ).slice(0, 2);
}
function Wn(s, ...n) {
  if (s == null)
    return [null, null];
  for (const [i, a] of n) {
    const l = i.exec(s);
    if (l)
      return a(l);
  }
  return [null, null];
}
function Cf(...s) {
  return (n, i) => {
    const a = {};
    let l;
    for (l = 0; l < s.length; l++)
      a[s[l]] = Zt(n[i + l]);
    return [a, null, i + l];
  };
}
const Lf = /(?:([Zz])|([+-]\d\d)(?::?(\d\d))?)/, A1 = `(?:${Lf.source}?(?:\\[(${Df.source})\\])?)?`, ku = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/, Af = RegExp(`${ku.source}${A1}`), Mu = RegExp(`(?:[Tt]${Af.source})?`), N1 = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/, F1 = /(\d{4})-?W(\d\d)(?:-?(\d))?/, W1 = /(\d{4})-?(\d{3})/, R1 = Cf("weekYear", "weekNumber", "weekDay"), U1 = Cf("year", "ordinal"), V1 = /(\d{4})-(\d\d)-(\d\d)/, Nf = RegExp(
  `${ku.source} ?(?:${Lf.source}|(${Df.source}))?`
), $1 = RegExp(`(?: ${Nf.source})?`);
function Cn(s, n, i) {
  const a = s[n];
  return W(a) ? i : Zt(a);
}
function P1(s, n) {
  return [{
    year: Cn(s, n),
    month: Cn(s, n + 1, 1),
    day: Cn(s, n + 2, 1)
  }, null, n + 3];
}
function Rn(s, n) {
  return [{
    hours: Cn(s, n, 0),
    minutes: Cn(s, n + 1, 0),
    seconds: Cn(s, n + 2, 0),
    milliseconds: Eu(s[n + 3])
  }, null, n + 4];
}
function pr(s, n) {
  const i = !s[n] && !s[n + 1], a = bi(s[n + 1], s[n + 2]), l = i ? null : Ie.instance(a);
  return [{}, l, n + 3];
}
function yr(s, n) {
  const i = s[n] ? bt.create(s[n]) : null;
  return [{}, i, n + 1];
}
const Z1 = RegExp(`^T?${ku.source}$`), B1 = /^-?P(?:(?:(-?\d{1,20}(?:\.\d{1,20})?)Y)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20}(?:\.\d{1,20})?)W)?(?:(-?\d{1,20}(?:\.\d{1,20})?)D)?(?:T(?:(-?\d{1,20}(?:\.\d{1,20})?)H)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,20}))?S)?)?)$/;
function G1(s) {
  const [n, i, a, l, h, m, p, v, E] = s, D = n[0] === "-", A = v && v[0] === "-", J = (C, j = !1) => C !== void 0 && (j || C && D) ? -C : C;
  return [
    {
      years: J(un(i)),
      months: J(un(a)),
      weeks: J(un(l)),
      days: J(un(h)),
      hours: J(un(m)),
      minutes: J(un(p)),
      seconds: J(un(v), v === "-0"),
      milliseconds: J(Eu(E), A)
    }
  ];
}
const H1 = {
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: -5 * 60,
  CST: -6 * 60,
  MDT: -6 * 60,
  MST: -7 * 60,
  PDT: -7 * 60,
  PST: -8 * 60
};
function bu(s, n, i, a, l, h, m) {
  const p = {
    year: n.length === 2 ? vu(Zt(n)) : Zt(n),
    month: xf.indexOf(i) + 1,
    day: Zt(a),
    hour: Zt(l),
    minute: Zt(h)
  };
  return m && (p.second = Zt(m)), s && (p.weekday = s.length > 3 ? Ef.indexOf(s) + 1 : If.indexOf(s) + 1), p;
}
const z1 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;
function q1(s) {
  const [
    ,
    n,
    i,
    a,
    l,
    h,
    m,
    p,
    v,
    E,
    D,
    A
  ] = s, J = bu(n, l, a, i, h, m, p);
  let C;
  return v ? C = H1[v] : E ? C = 0 : C = bi(D, A), [J, new Ie(C)];
}
function Y1(s) {
  return s.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").trim();
}
const J1 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/, K1 = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/, X1 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;
function Il(s) {
  const [, n, i, a, l, h, m, p] = s;
  return [bu(n, l, a, i, h, m, p), Ie.utcInstance];
}
function Q1(s) {
  const [, n, i, a, l, h, m, p] = s;
  return [bu(n, p, i, a, l, h, m), Ie.utcInstance];
}
const j1 = Nn(N1, Mu), ew = Nn(F1, Mu), tw = Nn(W1, Mu), nw = Nn(Af), Ff = Fn(
  P1,
  Rn,
  pr,
  yr
), rw = Fn(
  R1,
  Rn,
  pr,
  yr
), iw = Fn(
  U1,
  Rn,
  pr,
  yr
), sw = Fn(
  Rn,
  pr,
  yr
);
function uw(s) {
  return Wn(
    s,
    [j1, Ff],
    [ew, rw],
    [tw, iw],
    [nw, sw]
  );
}
function aw(s) {
  return Wn(Y1(s), [z1, q1]);
}
function ow(s) {
  return Wn(
    s,
    [J1, Il],
    [K1, Il],
    [X1, Q1]
  );
}
function lw(s) {
  return Wn(s, [B1, G1]);
}
const fw = Fn(Rn);
function cw(s) {
  return Wn(s, [Z1, fw]);
}
const hw = Nn(V1, $1), dw = Nn(Nf), mw = Fn(
  Rn,
  pr,
  yr
);
function gw(s) {
  return Wn(
    s,
    [hw, Ff],
    [dw, mw]
  );
}
const kl = "Invalid Duration", Wf = {
  weeks: {
    days: 7,
    hours: 7 * 24,
    minutes: 7 * 24 * 60,
    seconds: 7 * 24 * 60 * 60,
    milliseconds: 7 * 24 * 60 * 60 * 1e3
  },
  days: {
    hours: 24,
    minutes: 24 * 60,
    seconds: 24 * 60 * 60,
    milliseconds: 24 * 60 * 60 * 1e3
  },
  hours: { minutes: 60, seconds: 60 * 60, milliseconds: 60 * 60 * 1e3 },
  minutes: { seconds: 60, milliseconds: 60 * 1e3 },
  seconds: { milliseconds: 1e3 }
}, pw = {
  years: {
    quarters: 4,
    months: 12,
    weeks: 52,
    days: 365,
    hours: 365 * 24,
    minutes: 365 * 24 * 60,
    seconds: 365 * 24 * 60 * 60,
    milliseconds: 365 * 24 * 60 * 60 * 1e3
  },
  quarters: {
    months: 3,
    weeks: 13,
    days: 91,
    hours: 91 * 24,
    minutes: 91 * 24 * 60,
    seconds: 91 * 24 * 60 * 60,
    milliseconds: 91 * 24 * 60 * 60 * 1e3
  },
  months: {
    weeks: 4,
    days: 30,
    hours: 30 * 24,
    minutes: 30 * 24 * 60,
    seconds: 30 * 24 * 60 * 60,
    milliseconds: 30 * 24 * 60 * 60 * 1e3
  },
  ...Wf
}, je = 146097 / 400, In = 146097 / 4800, yw = {
  years: {
    quarters: 4,
    months: 12,
    weeks: je / 7,
    days: je,
    hours: je * 24,
    minutes: je * 24 * 60,
    seconds: je * 24 * 60 * 60,
    milliseconds: je * 24 * 60 * 60 * 1e3
  },
  quarters: {
    months: 3,
    weeks: je / 28,
    days: je / 4,
    hours: je * 24 / 4,
    minutes: je * 24 * 60 / 4,
    seconds: je * 24 * 60 * 60 / 4,
    milliseconds: je * 24 * 60 * 60 * 1e3 / 4
  },
  months: {
    weeks: In / 7,
    days: In,
    hours: In * 24,
    minutes: In * 24 * 60,
    seconds: In * 24 * 60 * 60,
    milliseconds: In * 24 * 60 * 60 * 1e3
  },
  ...Wf
}, on = [
  "years",
  "quarters",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
  "milliseconds"
], ww = on.slice(0).reverse();
function Mt(s, n, i = !1) {
  const a = {
    values: i ? n.values : { ...s.values, ...n.values || {} },
    loc: s.loc.clone(n.loc),
    conversionAccuracy: n.conversionAccuracy || s.conversionAccuracy,
    matrix: n.matrix || s.matrix
  };
  return new z(a);
}
function Rf(s, n) {
  let i = n.milliseconds ?? 0;
  for (const a of ww.slice(1))
    n[a] && (i += n[a] * s[a].milliseconds);
  return i;
}
function Ml(s, n) {
  const i = Rf(s, n) < 0 ? -1 : 1;
  on.reduceRight((a, l) => {
    if (W(n[l]))
      return a;
    if (a) {
      const h = n[a] * i, m = s[l][a], p = Math.floor(h / m);
      n[l] += p * i, n[a] -= p * m * i;
    }
    return l;
  }, null), on.reduce((a, l) => {
    if (W(n[l]))
      return a;
    if (a) {
      const h = n[a] % 1;
      n[a] -= h, n[l] += h * s[a][l];
    }
    return l;
  }, null);
}
function bl(s) {
  const n = {};
  for (const [i, a] of Object.entries(s))
    a !== 0 && (n[i] = a);
  return n;
}
class z {
  /**
   * @private
   */
  constructor(n) {
    const i = n.conversionAccuracy === "longterm" || !1;
    let a = i ? yw : pw;
    n.matrix && (a = n.matrix), this.values = n.values, this.loc = n.loc || X.create(), this.conversionAccuracy = i ? "longterm" : "casual", this.invalid = n.invalid || null, this.matrix = a, this.isLuxonDuration = !0;
  }
  /**
   * Create Duration from a number of milliseconds.
   * @param {number} count of milliseconds
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  static fromMillis(n, i) {
    return z.fromObject({ milliseconds: n }, i);
  }
  /**
   * Create a Duration from a JavaScript object with keys like 'years' and 'hours'.
   * If this object is empty then a zero milliseconds duration is returned.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.years
   * @param {number} obj.quarters
   * @param {number} obj.months
   * @param {number} obj.weeks
   * @param {number} obj.days
   * @param {number} obj.hours
   * @param {number} obj.minutes
   * @param {number} obj.seconds
   * @param {number} obj.milliseconds
   * @param {Object} [opts=[]] - options for creating this Duration
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
   * @param {string} [opts.matrix=Object] - the custom conversion system to use
   * @return {Duration}
   */
  static fromObject(n, i = {}) {
    if (n == null || typeof n != "object")
      throw new Te(
        `Duration.fromObject: argument expected to be an object, got ${n === null ? "null" : typeof n}`
      );
    return new z({
      values: Ei(n, z.normalizeUnit),
      loc: X.fromObject(i),
      conversionAccuracy: i.conversionAccuracy,
      matrix: i.matrix
    });
  }
  /**
   * Create a Duration from DurationLike.
   *
   * @param {Object | number | Duration} durationLike
   * One of:
   * - object with keys like 'years' and 'hours'.
   * - number representing milliseconds
   * - Duration instance
   * @return {Duration}
   */
  static fromDurationLike(n) {
    if (Gt(n))
      return z.fromMillis(n);
    if (z.isDuration(n))
      return n;
    if (typeof n == "object")
      return z.fromObject(n);
    throw new Te(
      `Unknown duration argument ${n} of type ${typeof n}`
    );
  }
  /**
   * Create a Duration from an ISO 8601 duration string.
   * @param {string} text - text to parse
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
   * @param {string} [opts.matrix=Object] - the preset conversion system to use
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromISO('P3Y6M1W4DT12H30M5S').toObject() //=> { years: 3, months: 6, weeks: 1, days: 4, hours: 12, minutes: 30, seconds: 5 }
   * @example Duration.fromISO('PT23H').toObject() //=> { hours: 23 }
   * @example Duration.fromISO('P5Y3M').toObject() //=> { years: 5, months: 3 }
   * @return {Duration}
   */
  static fromISO(n, i) {
    const [a] = lw(n);
    return a ? z.fromObject(a, i) : z.invalid("unparsable", `the input "${n}" can't be parsed as ISO 8601`);
  }
  /**
   * Create a Duration from an ISO 8601 time string.
   * @param {string} text - text to parse
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
   * @param {string} [opts.matrix=Object] - the conversion system to use
   * @see https://en.wikipedia.org/wiki/ISO_8601#Times
   * @example Duration.fromISOTime('11:22:33.444').toObject() //=> { hours: 11, minutes: 22, seconds: 33, milliseconds: 444 }
   * @example Duration.fromISOTime('11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('T11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('T1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @return {Duration}
   */
  static fromISOTime(n, i) {
    const [a] = cw(n);
    return a ? z.fromObject(a, i) : z.invalid("unparsable", `the input "${n}" can't be parsed as ISO 8601`);
  }
  /**
   * Create an invalid Duration.
   * @param {string} reason - simple string of why this datetime is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {Duration}
   */
  static invalid(n, i = null) {
    if (!n)
      throw new Te("need to specify a reason the Duration is invalid");
    const a = n instanceof ct ? n : new ct(n, i);
    if (oe.throwOnInvalid)
      throw new Gy(a);
    return new z({ invalid: a });
  }
  /**
   * @private
   */
  static normalizeUnit(n) {
    const i = {
      year: "years",
      years: "years",
      quarter: "quarters",
      quarters: "quarters",
      month: "months",
      months: "months",
      week: "weeks",
      weeks: "weeks",
      day: "days",
      days: "days",
      hour: "hours",
      hours: "hours",
      minute: "minutes",
      minutes: "minutes",
      second: "seconds",
      seconds: "seconds",
      millisecond: "milliseconds",
      milliseconds: "milliseconds"
    }[n && n.toLowerCase()];
    if (!i) throw new Gl(n);
    return i;
  }
  /**
   * Check if an object is a Duration. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isDuration(n) {
    return n && n.isLuxonDuration || !1;
  }
  /**
   * Get  the locale of a Duration, such 'en-GB'
   * @type {string}
   */
  get locale() {
    return this.isValid ? this.loc.locale : null;
  }
  /**
   * Get the numbering system of a Duration, such 'beng'. The numbering system is used when formatting the Duration
   *
   * @type {string}
   */
  get numberingSystem() {
    return this.isValid ? this.loc.numberingSystem : null;
  }
  /**
   * Returns a string representation of this Duration formatted according to the specified format string. You may use these tokens:
   * * `S` for milliseconds
   * * `s` for seconds
   * * `m` for minutes
   * * `h` for hours
   * * `d` for days
   * * `w` for weeks
   * * `M` for months
   * * `y` for years
   * Notes:
   * * Add padding by repeating the token, e.g. "yy" pads the years to two digits, "hhhh" pads the hours out to four digits
   * * Tokens can be escaped by wrapping with single quotes.
   * * The duration will be converted to the set of units in the format string using {@link Duration#shiftTo} and the Durations's conversion accuracy setting.
   * @param {string} fmt - the format string
   * @param {Object} opts - options
   * @param {boolean} [opts.floor=true] - floor numerical values
   * @param {'negative'|'all'|'negativeLargestOnly'} [opts.signMode=negative] - How to handle signs
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("y d s") //=> "1 6 2"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("yy dd sss") //=> "01 06 002"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("M S") //=> "12 518402000"
   * @example Duration.fromObject({ days: 6, seconds: 2 }).toFormat("d s", { signMode: "all" }) //=> "+6 +2"
   * @example Duration.fromObject({ days: -6, seconds: -2 }).toFormat("d s", { signMode: "all" }) //=> "-6 -2"
   * @example Duration.fromObject({ days: -6, seconds: -2 }).toFormat("d s", { signMode: "negativeLargestOnly" }) //=> "-6 2"
   * @return {string}
   */
  toFormat(n, i = {}) {
    const a = {
      ...i,
      floor: i.round !== !1 && i.floor !== !1
    };
    return this.isValid ? Se.create(this.loc, a).formatDurationFromString(this, n) : kl;
  }
  /**
   * Returns a string representation of a Duration with all units included.
   * To modify its behavior, use `listStyle` and any Intl.NumberFormat option, though `unitDisplay` is especially relevant.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options
   * @param {Object} opts - Formatting options. Accepts the same keys as the options parameter of the native `Intl.NumberFormat` constructor, as well as `listStyle`.
   * @param {string} [opts.listStyle='narrow'] - How to format the merged list. Corresponds to the `style` property of the options parameter of the native `Intl.ListFormat` constructor.
   * @param {boolean} [opts.showZeros=true] - Show all units previously used by the duration even if they are zero
   * @example
   * ```js
   * var dur = Duration.fromObject({ months: 1, weeks: 0, hours: 5, minutes: 6 })
   * dur.toHuman() //=> '1 month, 0 weeks, 5 hours, 6 minutes'
   * dur.toHuman({ listStyle: "long" }) //=> '1 month, 0 weeks, 5 hours, and 6 minutes'
   * dur.toHuman({ unitDisplay: "short" }) //=> '1 mth, 0 wks, 5 hr, 6 min'
   * dur.toHuman({ showZeros: false }) //=> '1 month, 5 hours, 6 minutes'
   * ```
   */
  toHuman(n = {}) {
    if (!this.isValid) return kl;
    const i = n.showZeros !== !1, a = on.map((l) => {
      const h = this.values[l];
      return W(h) || h === 0 && !i ? null : this.loc.numberFormatter({ style: "unit", unitDisplay: "long", ...n, unit: l.slice(0, -1) }).format(h);
    }).filter((l) => l);
    return this.loc.listFormatter({ type: "conjunction", style: n.listStyle || "narrow", ...n }).format(a);
  }
  /**
   * Returns a JavaScript object with this Duration's values.
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toObject() //=> { years: 1, days: 6, seconds: 2 }
   * @return {Object}
   */
  toObject() {
    return this.isValid ? { ...this.values } : {};
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Duration.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromObject({ years: 3, seconds: 45 }).toISO() //=> 'P3YT45S'
   * @example Duration.fromObject({ months: 4, seconds: 45 }).toISO() //=> 'P4MT45S'
   * @example Duration.fromObject({ months: 5 }).toISO() //=> 'P5M'
   * @example Duration.fromObject({ minutes: 5 }).toISO() //=> 'PT5M'
   * @example Duration.fromObject({ milliseconds: 6 }).toISO() //=> 'PT0.006S'
   * @return {string}
   */
  toISO() {
    if (!this.isValid) return null;
    let n = "P";
    return this.years !== 0 && (n += this.years + "Y"), (this.months !== 0 || this.quarters !== 0) && (n += this.months + this.quarters * 3 + "M"), this.weeks !== 0 && (n += this.weeks + "W"), this.days !== 0 && (n += this.days + "D"), (this.hours !== 0 || this.minutes !== 0 || this.seconds !== 0 || this.milliseconds !== 0) && (n += "T"), this.hours !== 0 && (n += this.hours + "H"), this.minutes !== 0 && (n += this.minutes + "M"), (this.seconds !== 0 || this.milliseconds !== 0) && (n += Iu(this.seconds + this.milliseconds / 1e3, 3) + "S"), n === "P" && (n += "T0S"), n;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Duration, formatted as a time of day.
   * Note that this will return null if the duration is invalid, negative, or equal to or greater than 24 hours.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Times
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example Duration.fromObject({ hours: 11 }).toISOTime() //=> '11:00:00.000'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressMilliseconds: true }) //=> '11:00:00'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressSeconds: true }) //=> '11:00'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ includePrefix: true }) //=> 'T11:00:00.000'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ format: 'basic' }) //=> '110000.000'
   * @return {string}
   */
  toISOTime(n = {}) {
    if (!this.isValid) return null;
    const i = this.toMillis();
    return i < 0 || i >= 864e5 ? null : (n = {
      suppressMilliseconds: !1,
      suppressSeconds: !1,
      includePrefix: !1,
      format: "extended",
      ...n,
      includeOffset: !1
    }, R.fromMillis(i, { zone: "UTC" }).toISOTime(n));
  }
  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in JSON.
   * @return {string}
   */
  toJSON() {
    return this.toISO();
  }
  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in debugging.
   * @return {string}
   */
  toString() {
    return this.toISO();
  }
  /**
   * Returns a string representation of this Duration appropriate for the REPL.
   * @return {string}
   */
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.isValid ? `Duration { values: ${JSON.stringify(this.values)} }` : `Duration { Invalid, reason: ${this.invalidReason} }`;
  }
  /**
   * Returns an milliseconds value of this Duration.
   * @return {number}
   */
  toMillis() {
    return this.isValid ? Rf(this.matrix, this.values) : NaN;
  }
  /**
   * Returns an milliseconds value of this Duration. Alias of {@link toMillis}
   * @return {number}
   */
  valueOf() {
    return this.toMillis();
  }
  /**
   * Make this Duration longer by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  plus(n) {
    if (!this.isValid) return this;
    const i = z.fromDurationLike(n), a = {};
    for (const l of on)
      (An(i.values, l) || An(this.values, l)) && (a[l] = i.get(l) + this.get(l));
    return Mt(this, { values: a }, !0);
  }
  /**
   * Make this Duration shorter by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  minus(n) {
    if (!this.isValid) return this;
    const i = z.fromDurationLike(n);
    return this.plus(i.negate());
  }
  /**
   * Scale this Duration by the specified amount. Return a newly-constructed Duration.
   * @param {function} fn - The function to apply to each unit. Arity is 1 or 2: the value of the unit and, optionally, the unit name. Must return a number.
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits(x => x * 2) //=> { hours: 2, minutes: 60 }
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits((x, u) => u === "hours" ? x * 2 : x) //=> { hours: 2, minutes: 30 }
   * @return {Duration}
   */
  mapUnits(n) {
    if (!this.isValid) return this;
    const i = {};
    for (const a of Object.keys(this.values))
      i[a] = Sf(n(this.values[a], a));
    return Mt(this, { values: i }, !0);
  }
  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example Duration.fromObject({years: 2, days: 3}).get('years') //=> 2
   * @example Duration.fromObject({years: 2, days: 3}).get('months') //=> 0
   * @example Duration.fromObject({years: 2, days: 3}).get('days') //=> 3
   * @return {number}
   */
  get(n) {
    return this[z.normalizeUnit(n)];
  }
  /**
   * "Set" the values of specified units. Return a newly-constructed Duration.
   * @param {Object} values - a mapping of units to numbers
   * @example dur.set({ years: 2017 })
   * @example dur.set({ hours: 8, minutes: 30 })
   * @return {Duration}
   */
  set(n) {
    if (!this.isValid) return this;
    const i = { ...this.values, ...Ei(n, z.normalizeUnit) };
    return Mt(this, { values: i });
  }
  /**
   * "Set" the locale and/or numberingSystem.  Returns a newly-constructed Duration.
   * @example dur.reconfigure({ locale: 'en-GB' })
   * @return {Duration}
   */
  reconfigure({ locale: n, numberingSystem: i, conversionAccuracy: a, matrix: l } = {}) {
    const m = { loc: this.loc.clone({ locale: n, numberingSystem: i }), matrix: l, conversionAccuracy: a };
    return Mt(this, m);
  }
  /**
   * Return the length of the duration in the specified unit.
   * @param {string} unit - a unit such as 'minutes' or 'days'
   * @example Duration.fromObject({years: 1}).as('days') //=> 365
   * @example Duration.fromObject({years: 1}).as('months') //=> 12
   * @example Duration.fromObject({hours: 60}).as('days') //=> 2.5
   * @return {number}
   */
  as(n) {
    return this.isValid ? this.shiftTo(n).get(n) : NaN;
  }
  /**
   * Reduce this Duration to its canonical representation in its current units.
   * Assuming the overall value of the Duration is positive, this means:
   * - excessive values for lower-order units are converted to higher-order units (if possible, see first and second example)
   * - negative lower-order units are converted to higher order units (there must be such a higher order unit, otherwise
   *   the overall value would be negative, see third example)
   * - fractional values for higher-order units are converted to lower-order units (if possible, see fourth example)
   *
   * If the overall value is negative, the result of this method is equivalent to `this.negate().normalize().negate()`.
   * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { years: 15, days: 255 }
   * @example Duration.fromObject({ days: 5000 }).normalize().toObject() //=> { days: 5000 }
   * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hours: 11, minutes: 15 }
   * @example Duration.fromObject({ years: 2.5, days: 0, hours: 0 }).normalize().toObject() //=> { years: 2, days: 182, hours: 12 }
   * @return {Duration}
   */
  normalize() {
    if (!this.isValid) return this;
    const n = this.toObject();
    return Ml(this.matrix, n), Mt(this, { values: n }, !0);
  }
  /**
   * Rescale units to its largest representation
   * @example Duration.fromObject({ milliseconds: 90000 }).rescale().toObject() //=> { minutes: 1, seconds: 30 }
   * @return {Duration}
   */
  rescale() {
    if (!this.isValid) return this;
    const n = bl(this.normalize().shiftToAll().toObject());
    return Mt(this, { values: n }, !0);
  }
  /**
   * Convert this Duration into its representation in a different set of units.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds').toObject() //=> { minutes: 60, milliseconds: 30000 }
   * @return {Duration}
   */
  shiftTo(...n) {
    if (!this.isValid) return this;
    if (n.length === 0)
      return this;
    n = n.map((m) => z.normalizeUnit(m));
    const i = {}, a = {}, l = this.toObject();
    let h;
    for (const m of on)
      if (n.indexOf(m) >= 0) {
        h = m;
        let p = 0;
        for (const E in a)
          p += this.matrix[E][m] * a[E], a[E] = 0;
        Gt(l[m]) && (p += l[m]);
        const v = Math.trunc(p);
        i[m] = v, a[m] = (p * 1e3 - v * 1e3) / 1e3;
      } else Gt(l[m]) && (a[m] = l[m]);
    for (const m in a)
      a[m] !== 0 && (i[h] += m === h ? a[m] : a[m] / this.matrix[h][m]);
    return Ml(this.matrix, i), Mt(this, { values: i }, !0);
  }
  /**
   * Shift this Duration to all available units.
   * Same as shiftTo("years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds")
   * @return {Duration}
   */
  shiftToAll() {
    return this.isValid ? this.shiftTo(
      "years",
      "months",
      "weeks",
      "days",
      "hours",
      "minutes",
      "seconds",
      "milliseconds"
    ) : this;
  }
  /**
   * Return the negative of this Duration.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).negate().toObject() //=> { hours: -1, seconds: -30 }
   * @return {Duration}
   */
  negate() {
    if (!this.isValid) return this;
    const n = {};
    for (const i of Object.keys(this.values))
      n[i] = this.values[i] === 0 ? 0 : -this.values[i];
    return Mt(this, { values: n }, !0);
  }
  /**
   * Removes all units with values equal to 0 from this Duration.
   * @example Duration.fromObject({ years: 2, days: 0, hours: 0, minutes: 0 }).removeZeros().toObject() //=> { years: 2 }
   * @return {Duration}
   */
  removeZeros() {
    if (!this.isValid) return this;
    const n = bl(this.values);
    return Mt(this, { values: n }, !0);
  }
  /**
   * Get the years.
   * @type {number}
   */
  get years() {
    return this.isValid ? this.values.years || 0 : NaN;
  }
  /**
   * Get the quarters.
   * @type {number}
   */
  get quarters() {
    return this.isValid ? this.values.quarters || 0 : NaN;
  }
  /**
   * Get the months.
   * @type {number}
   */
  get months() {
    return this.isValid ? this.values.months || 0 : NaN;
  }
  /**
   * Get the weeks
   * @type {number}
   */
  get weeks() {
    return this.isValid ? this.values.weeks || 0 : NaN;
  }
  /**
   * Get the days.
   * @type {number}
   */
  get days() {
    return this.isValid ? this.values.days || 0 : NaN;
  }
  /**
   * Get the hours.
   * @type {number}
   */
  get hours() {
    return this.isValid ? this.values.hours || 0 : NaN;
  }
  /**
   * Get the minutes.
   * @type {number}
   */
  get minutes() {
    return this.isValid ? this.values.minutes || 0 : NaN;
  }
  /**
   * Get the seconds.
   * @return {number}
   */
  get seconds() {
    return this.isValid ? this.values.seconds || 0 : NaN;
  }
  /**
   * Get the milliseconds.
   * @return {number}
   */
  get milliseconds() {
    return this.isValid ? this.values.milliseconds || 0 : NaN;
  }
  /**
   * Returns whether the Duration is invalid. Invalid durations are returned by diff operations
   * on invalid DateTimes or Intervals.
   * @return {boolean}
   */
  get isValid() {
    return this.invalid === null;
  }
  /**
   * Returns an error code if this Duration became invalid, or null if the Duration is valid
   * @return {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  /**
   * Returns an explanation of why this Duration became invalid, or null if the Duration is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  /**
   * Equality check
   * Two Durations are equal iff they have the same units and the same values for each unit.
   * @param {Duration} other
   * @return {boolean}
   */
  equals(n) {
    if (!this.isValid || !n.isValid || !this.loc.equals(n.loc))
      return !1;
    function i(a, l) {
      return a === void 0 || a === 0 ? l === void 0 || l === 0 : a === l;
    }
    for (const a of on)
      if (!i(this.values[a], n.values[a]))
        return !1;
    return !0;
  }
}
const kn = "Invalid Interval";
function vw(s, n) {
  return !s || !s.isValid ? ne.invalid("missing or invalid start") : !n || !n.isValid ? ne.invalid("missing or invalid end") : n < s ? ne.invalid(
    "end before start",
    `The end of an interval must be after its start, but you had start=${s.toISO()} and end=${n.toISO()}`
  ) : null;
}
class ne {
  /**
   * @private
   */
  constructor(n) {
    this.s = n.start, this.e = n.end, this.invalid = n.invalid || null, this.isLuxonInterval = !0;
  }
  /**
   * Create an invalid Interval.
   * @param {string} reason - simple string of why this Interval is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {Interval}
   */
  static invalid(n, i = null) {
    if (!n)
      throw new Te("need to specify a reason the Interval is invalid");
    const a = n instanceof ct ? n : new ct(n, i);
    if (oe.throwOnInvalid)
      throw new By(a);
    return new ne({ invalid: a });
  }
  /**
   * Create an Interval from a start DateTime and an end DateTime. Inclusive of the start but not the end.
   * @param {DateTime|Date|Object} start
   * @param {DateTime|Date|Object} end
   * @return {Interval}
   */
  static fromDateTimes(n, i) {
    const a = ur(n), l = ur(i), h = vw(a, l);
    return h ?? new ne({
      start: a,
      end: l
    });
  }
  /**
   * Create an Interval from a start DateTime and a Duration to extend to.
   * @param {DateTime|Date|Object} start
   * @param {Duration|Object|number} duration - the length of the Interval.
   * @return {Interval}
   */
  static after(n, i) {
    const a = z.fromDurationLike(i), l = ur(n);
    return ne.fromDateTimes(l, l.plus(a));
  }
  /**
   * Create an Interval from an end DateTime and a Duration to extend backwards to.
   * @param {DateTime|Date|Object} end
   * @param {Duration|Object|number} duration - the length of the Interval.
   * @return {Interval}
   */
  static before(n, i) {
    const a = z.fromDurationLike(i), l = ur(n);
    return ne.fromDateTimes(l.minus(a), l);
  }
  /**
   * Create an Interval from an ISO 8601 string.
   * Accepts `<start>/<end>`, `<start>/<duration>`, and `<duration>/<end>` formats.
   * @param {string} text - the ISO string to parse
   * @param {Object} [opts] - options to pass {@link DateTime#fromISO} and optionally {@link Duration#fromISO}
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {Interval}
   */
  static fromISO(n, i) {
    const [a, l] = (n || "").split("/", 2);
    if (a && l) {
      let h, m;
      try {
        h = R.fromISO(a, i), m = h.isValid;
      } catch {
        m = !1;
      }
      let p, v;
      try {
        p = R.fromISO(l, i), v = p.isValid;
      } catch {
        v = !1;
      }
      if (m && v)
        return ne.fromDateTimes(h, p);
      if (m) {
        const E = z.fromISO(l, i);
        if (E.isValid)
          return ne.after(h, E);
      } else if (v) {
        const E = z.fromISO(a, i);
        if (E.isValid)
          return ne.before(p, E);
      }
    }
    return ne.invalid("unparsable", `the input "${n}" can't be parsed as ISO 8601`);
  }
  /**
   * Check if an object is an Interval. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isInterval(n) {
    return n && n.isLuxonInterval || !1;
  }
  /**
   * Returns the start of the Interval
   * @type {DateTime}
   */
  get start() {
    return this.isValid ? this.s : null;
  }
  /**
   * Returns the end of the Interval. This is the first instant which is not part of the interval
   * (Interval is half-open).
   * @type {DateTime}
   */
  get end() {
    return this.isValid ? this.e : null;
  }
  /**
   * Returns the last DateTime included in the interval (since end is not part of the interval)
   * @type {DateTime}
   */
  get lastDateTime() {
    return this.isValid && this.e ? this.e.minus(1) : null;
  }
  /**
   * Returns whether this Interval's end is at least its start, meaning that the Interval isn't 'backwards'.
   * @type {boolean}
   */
  get isValid() {
    return this.invalidReason === null;
  }
  /**
   * Returns an error code if this Interval is invalid, or null if the Interval is valid
   * @type {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  /**
   * Returns an explanation of why this Interval became invalid, or null if the Interval is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  /**
   * Returns the length of the Interval in the specified unit.
   * @param {string} unit - the unit (such as 'hours' or 'days') to return the length in.
   * @return {number}
   */
  length(n = "milliseconds") {
    return this.isValid ? this.toDuration(n).get(n) : NaN;
  }
  /**
   * Returns the count of minutes, hours, days, months, or years included in the Interval, even in part.
   * Unlike {@link Interval#length} this counts sections of the calendar, not periods of time, e.g. specifying 'day'
   * asks 'what dates are included in this interval?', not 'how many days long is this interval?'
   * @param {string} [unit='milliseconds'] - the unit of time to count.
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week; this operation will always use the locale of the start DateTime
   * @return {number}
   */
  count(n = "milliseconds", i) {
    if (!this.isValid) return NaN;
    const a = this.start.startOf(n, i);
    let l;
    return i?.useLocaleWeeks ? l = this.end.reconfigure({ locale: a.locale }) : l = this.end, l = l.startOf(n, i), Math.floor(l.diff(a, n).get(n)) + (l.valueOf() !== this.end.valueOf());
  }
  /**
   * Returns whether this Interval's start and end are both in the same unit of time
   * @param {string} unit - the unit of time to check sameness on
   * @return {boolean}
   */
  hasSame(n) {
    return this.isValid ? this.isEmpty() || this.e.minus(1).hasSame(this.s, n) : !1;
  }
  /**
   * Return whether this Interval has the same start and end DateTimes.
   * @return {boolean}
   */
  isEmpty() {
    return this.s.valueOf() === this.e.valueOf();
  }
  /**
   * Return whether this Interval's start is after the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  isAfter(n) {
    return this.isValid ? this.s > n : !1;
  }
  /**
   * Return whether this Interval's end is before the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  isBefore(n) {
    return this.isValid ? this.e <= n : !1;
  }
  /**
   * Return whether this Interval contains the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  contains(n) {
    return this.isValid ? this.s <= n && this.e > n : !1;
  }
  /**
   * "Sets" the start and/or end dates. Returns a newly-constructed Interval.
   * @param {Object} values - the values to set
   * @param {DateTime} values.start - the starting DateTime
   * @param {DateTime} values.end - the ending DateTime
   * @return {Interval}
   */
  set({ start: n, end: i } = {}) {
    return this.isValid ? ne.fromDateTimes(n || this.s, i || this.e) : this;
  }
  /**
   * Split this Interval at each of the specified DateTimes
   * @param {...DateTime} dateTimes - the unit of time to count.
   * @return {Array}
   */
  splitAt(...n) {
    if (!this.isValid) return [];
    const i = n.map(ur).filter((m) => this.contains(m)).sort((m, p) => m.toMillis() - p.toMillis()), a = [];
    let { s: l } = this, h = 0;
    for (; l < this.e; ) {
      const m = i[h] || this.e, p = +m > +this.e ? this.e : m;
      a.push(ne.fromDateTimes(l, p)), l = p, h += 1;
    }
    return a;
  }
  /**
   * Split this Interval into smaller Intervals, each of the specified length.
   * Left over time is grouped into a smaller interval
   * @param {Duration|Object|number} duration - The length of each resulting interval.
   * @return {Array}
   */
  splitBy(n) {
    const i = z.fromDurationLike(n);
    if (!this.isValid || !i.isValid || i.as("milliseconds") === 0)
      return [];
    let { s: a } = this, l = 1, h;
    const m = [];
    for (; a < this.e; ) {
      const p = this.start.plus(i.mapUnits((v) => v * l));
      h = +p > +this.e ? this.e : p, m.push(ne.fromDateTimes(a, h)), a = h, l += 1;
    }
    return m;
  }
  /**
   * Split this Interval into the specified number of smaller intervals.
   * @param {number} numberOfParts - The number of Intervals to divide the Interval into.
   * @return {Array}
   */
  divideEqually(n) {
    return this.isValid ? this.splitBy(this.length() / n).slice(0, n) : [];
  }
  /**
   * Return whether this Interval overlaps with the specified Interval
   * @param {Interval} other
   * @return {boolean}
   */
  overlaps(n) {
    return this.e > n.s && this.s < n.e;
  }
  /**
   * Return whether this Interval's end is adjacent to the specified Interval's start.
   * @param {Interval} other
   * @return {boolean}
   */
  abutsStart(n) {
    return this.isValid ? +this.e == +n.s : !1;
  }
  /**
   * Return whether this Interval's start is adjacent to the specified Interval's end.
   * @param {Interval} other
   * @return {boolean}
   */
  abutsEnd(n) {
    return this.isValid ? +n.e == +this.s : !1;
  }
  /**
   * Returns true if this Interval fully contains the specified Interval, specifically if the intersect (of this Interval and the other Interval) is equal to the other Interval; false otherwise.
   * @param {Interval} other
   * @return {boolean}
   */
  engulfs(n) {
    return this.isValid ? this.s <= n.s && this.e >= n.e : !1;
  }
  /**
   * Return whether this Interval has the same start and end as the specified Interval.
   * @param {Interval} other
   * @return {boolean}
   */
  equals(n) {
    return !this.isValid || !n.isValid ? !1 : this.s.equals(n.s) && this.e.equals(n.e);
  }
  /**
   * Return an Interval representing the intersection of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the maximum start time and the minimum end time of the two Intervals.
   * Returns null if the intersection is empty, meaning, the intervals don't intersect.
   * @param {Interval} other
   * @return {Interval}
   */
  intersection(n) {
    if (!this.isValid) return this;
    const i = this.s > n.s ? this.s : n.s, a = this.e < n.e ? this.e : n.e;
    return i >= a ? null : ne.fromDateTimes(i, a);
  }
  /**
   * Return an Interval representing the union of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the minimum start time and the maximum end time of the two Intervals.
   * @param {Interval} other
   * @return {Interval}
   */
  union(n) {
    if (!this.isValid) return this;
    const i = this.s < n.s ? this.s : n.s, a = this.e > n.e ? this.e : n.e;
    return ne.fromDateTimes(i, a);
  }
  /**
   * Merge an array of Intervals into an equivalent minimal set of Intervals.
   * Combines overlapping and adjacent Intervals.
   * The resulting array will contain the Intervals in ascending order, that is, starting with the earliest Interval
   * and ending with the latest.
   *
   * @param {Array} intervals
   * @return {Array}
   */
  static merge(n) {
    const [i, a] = n.sort((l, h) => l.s - h.s).reduce(
      ([l, h], m) => h ? h.overlaps(m) || h.abutsStart(m) ? [l, h.union(m)] : [l.concat([h]), m] : [l, m],
      [[], null]
    );
    return a && i.push(a), i;
  }
  /**
   * Return an array of Intervals representing the spans of time that only appear in one of the specified Intervals.
   * @param {Array} intervals
   * @return {Array}
   */
  static xor(n) {
    let i = null, a = 0;
    const l = [], h = n.map((v) => [
      { time: v.s, type: "s" },
      { time: v.e, type: "e" }
    ]), m = Array.prototype.concat(...h), p = m.sort((v, E) => v.time - E.time);
    for (const v of p)
      a += v.type === "s" ? 1 : -1, a === 1 ? i = v.time : (i && +i != +v.time && l.push(ne.fromDateTimes(i, v.time)), i = null);
    return ne.merge(l);
  }
  /**
   * Return an Interval representing the span of time in this Interval that doesn't overlap with any of the specified Intervals.
   * @param {...Interval} intervals
   * @return {Array}
   */
  difference(...n) {
    return ne.xor([this].concat(n)).map((i) => this.intersection(i)).filter((i) => i && !i.isEmpty());
  }
  /**
   * Returns a string representation of this Interval appropriate for debugging.
   * @return {string}
   */
  toString() {
    return this.isValid ? `[${this.s.toISO()} – ${this.e.toISO()})` : kn;
  }
  /**
   * Returns a string representation of this Interval appropriate for the REPL.
   * @return {string}
   */
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.isValid ? `Interval { start: ${this.s.toISO()}, end: ${this.e.toISO()} }` : `Interval { Invalid, reason: ${this.invalidReason} }`;
  }
  /**
   * Returns a localized string representing this Interval. Accepts the same options as the
   * Intl.DateTimeFormat constructor and any presets defined by Luxon, such as
   * {@link DateTime.DATE_FULL} or {@link DateTime.TIME_SIMPLE}. The exact behavior of this method
   * is browser-specific, but in general it will return an appropriate representation of the
   * Interval in the assigned locale. Defaults to the system's locale if no locale has been
   * specified.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {Object} [formatOpts=DateTime.DATE_SHORT] - Either a DateTime preset or
   * Intl.DateTimeFormat constructor options.
   * @param {Object} opts - Options to override the configuration of the start DateTime.
   * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(); //=> 11/7/2022 – 11/8/2022
   * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(DateTime.DATE_FULL); //=> November 7 – 8, 2022
   * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(DateTime.DATE_FULL, { locale: 'fr-FR' }); //=> 7–8 novembre 2022
   * @example Interval.fromISO('2022-11-07T17:00Z/2022-11-07T19:00Z').toLocaleString(DateTime.TIME_SIMPLE); //=> 6:00 – 8:00 PM
   * @example Interval.fromISO('2022-11-07T17:00Z/2022-11-07T19:00Z').toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> Mon, Nov 07, 6:00 – 8:00 p
   * @return {string}
   */
  toLocaleString(n = Si, i = {}) {
    return this.isValid ? Se.create(this.s.loc.clone(i), n).formatInterval(this) : kn;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Interval.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} opts - The same options as {@link DateTime#toISO}
   * @return {string}
   */
  toISO(n) {
    return this.isValid ? `${this.s.toISO(n)}/${this.e.toISO(n)}` : kn;
  }
  /**
   * Returns an ISO 8601-compliant string representation of date of this Interval.
   * The time components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {string}
   */
  toISODate() {
    return this.isValid ? `${this.s.toISODate()}/${this.e.toISODate()}` : kn;
  }
  /**
   * Returns an ISO 8601-compliant string representation of time of this Interval.
   * The date components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} opts - The same options as {@link DateTime#toISO}
   * @return {string}
   */
  toISOTime(n) {
    return this.isValid ? `${this.s.toISOTime(n)}/${this.e.toISOTime(n)}` : kn;
  }
  /**
   * Returns a string representation of this Interval formatted according to the specified format
   * string. **You may not want this.** See {@link Interval#toLocaleString} for a more flexible
   * formatting tool.
   * @param {string} dateFormat - The format string. This string formats the start and end time.
   * See {@link DateTime#toFormat} for details.
   * @param {Object} opts - Options.
   * @param {string} [opts.separator =  ' – '] - A separator to place between the start and end
   * representations.
   * @return {string}
   */
  toFormat(n, { separator: i = " – " } = {}) {
    return this.isValid ? `${this.s.toFormat(n)}${i}${this.e.toFormat(n)}` : kn;
  }
  /**
   * Return a Duration representing the time spanned by this interval.
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @example Interval.fromDateTimes(dt1, dt2).toDuration().toObject() //=> { milliseconds: 88489257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('days').toObject() //=> { days: 1.0241812152777778 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes']).toObject() //=> { hours: 24, minutes: 34.82095 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes', 'seconds']).toObject() //=> { hours: 24, minutes: 34, seconds: 49.257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('seconds').toObject() //=> { seconds: 88489.257 }
   * @return {Duration}
   */
  toDuration(n, i) {
    return this.isValid ? this.e.diff(this.s, n, i) : z.invalid(this.invalidReason);
  }
  /**
   * Run mapFn on the interval start and end, returning a new Interval from the resulting DateTimes
   * @param {function} mapFn
   * @return {Interval}
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.toUTC())
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.plus({ hours: 2 }))
   */
  mapEndpoints(n) {
    return ne.fromDateTimes(n(this.s), n(this.e));
  }
}
class hi {
  /**
   * Return whether the specified zone contains a DST.
   * @param {string|Zone} [zone='local'] - Zone to check. Defaults to the environment's local zone.
   * @return {boolean}
   */
  static hasDST(n = oe.defaultZone) {
    const i = R.now().setZone(n).set({ month: 12 });
    return !n.isUniversal && i.offset !== i.set({ month: 6 }).offset;
  }
  /**
   * Return whether the specified zone is a valid IANA specifier.
   * @param {string} zone - Zone to check
   * @return {boolean}
   */
  static isValidIANAZone(n) {
    return bt.isValidZone(n);
  }
  /**
   * Converts the input into a {@link Zone} instance.
   *
   * * If `input` is already a Zone instance, it is returned unchanged.
   * * If `input` is a string containing a valid time zone name, a Zone instance
   *   with that name is returned.
   * * If `input` is a string that doesn't refer to a known time zone, a Zone
   *   instance with {@link Zone#isValid} == false is returned.
   * * If `input is a number, a Zone instance with the specified fixed offset
   *   in minutes is returned.
   * * If `input` is `null` or `undefined`, the default zone is returned.
   * @param {string|Zone|number} [input] - the value to be converted
   * @return {Zone}
   */
  static normalizeZone(n) {
    return Bt(n, oe.defaultZone);
  }
  /**
   * Get the weekday on which the week starts according to the given locale.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @returns {number} the start of the week, 1 for Monday through 7 for Sunday
   */
  static getStartOfWeek({ locale: n = null, locObj: i = null } = {}) {
    return (i || X.create(n)).getStartOfWeek();
  }
  /**
   * Get the minimum number of days necessary in a week before it is considered part of the next year according
   * to the given locale.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @returns {number}
   */
  static getMinimumDaysInFirstWeek({ locale: n = null, locObj: i = null } = {}) {
    return (i || X.create(n)).getMinDaysInFirstWeek();
  }
  /**
   * Get the weekdays, which are considered the weekend according to the given locale
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @returns {number[]} an array of weekdays, 1 for Monday through 7 for Sunday
   */
  static getWeekendWeekdays({ locale: n = null, locObj: i = null } = {}) {
    return (i || X.create(n)).getWeekendDays().slice();
  }
  /**
   * Return an array of standalone month names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @example Info.months()[0] //=> 'January'
   * @example Info.months('short')[0] //=> 'Jan'
   * @example Info.months('numeric')[0] //=> '1'
   * @example Info.months('short', { locale: 'fr-CA' } )[0] //=> 'janv.'
   * @example Info.months('numeric', { locale: 'ar' })[0] //=> '١'
   * @example Info.months('long', { outputCalendar: 'islamic' })[0] //=> 'Rabiʻ I'
   * @return {Array}
   */
  static months(n = "long", { locale: i = null, numberingSystem: a = null, locObj: l = null, outputCalendar: h = "gregory" } = {}) {
    return (l || X.create(i, a, h)).months(n);
  }
  /**
   * Return an array of format month names.
   * Format months differ from standalone months in that they're meant to appear next to the day of the month. In some languages, that
   * changes the string.
   * See {@link Info#months}
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @return {Array}
   */
  static monthsFormat(n = "long", { locale: i = null, numberingSystem: a = null, locObj: l = null, outputCalendar: h = "gregory" } = {}) {
    return (l || X.create(i, a, h)).months(n, !0);
  }
  /**
   * Return an array of standalone week names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the weekday representation, such as "narrow", "short", "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @example Info.weekdays()[0] //=> 'Monday'
   * @example Info.weekdays('short')[0] //=> 'Mon'
   * @example Info.weekdays('short', { locale: 'fr-CA' })[0] //=> 'lun.'
   * @example Info.weekdays('short', { locale: 'ar' })[0] //=> 'الاثنين'
   * @return {Array}
   */
  static weekdays(n = "long", { locale: i = null, numberingSystem: a = null, locObj: l = null } = {}) {
    return (l || X.create(i, a, null)).weekdays(n);
  }
  /**
   * Return an array of format week names.
   * Format weekdays differ from standalone weekdays in that they're meant to appear next to more date information. In some languages, that
   * changes the string.
   * See {@link Info#weekdays}
   * @param {string} [length='long'] - the length of the month representation, such as "narrow", "short", "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale=null] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @return {Array}
   */
  static weekdaysFormat(n = "long", { locale: i = null, numberingSystem: a = null, locObj: l = null } = {}) {
    return (l || X.create(i, a, null)).weekdays(n, !0);
  }
  /**
   * Return an array of meridiems.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.meridiems() //=> [ 'AM', 'PM' ]
   * @example Info.meridiems({ locale: 'my' }) //=> [ 'နံနက်', 'ညနေ' ]
   * @return {Array}
   */
  static meridiems({ locale: n = null } = {}) {
    return X.create(n).meridiems();
  }
  /**
   * Return an array of eras, such as ['BC', 'AD']. The locale can be specified, but the calendar system is always Gregorian.
   * @param {string} [length='short'] - the length of the era representation, such as "short" or "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.eras() //=> [ 'BC', 'AD' ]
   * @example Info.eras('long') //=> [ 'Before Christ', 'Anno Domini' ]
   * @example Info.eras('long', { locale: 'fr' }) //=> [ 'avant Jésus-Christ', 'après Jésus-Christ' ]
   * @return {Array}
   */
  static eras(n = "short", { locale: i = null } = {}) {
    return X.create(i, null, "gregory").eras(n);
  }
  /**
   * Return the set of available features in this environment.
   * Some features of Luxon are not available in all environments. For example, on older browsers, relative time formatting support is not available. Use this function to figure out if that's the case.
   * Keys:
   * * `relative`: whether this environment supports relative time formatting
   * * `localeWeek`: whether this environment supports different weekdays for the start of the week based on the locale
   * @example Info.features() //=> { relative: false, localeWeek: true }
   * @return {Object}
   */
  static features() {
    return { relative: vf(), localeWeek: _f() };
  }
}
function Dl(s, n) {
  const i = (l) => l.toUTC(0, { keepLocalTime: !0 }).startOf("day").valueOf(), a = i(n) - i(s);
  return Math.floor(z.fromMillis(a).as("days"));
}
function _w(s, n, i) {
  const a = [
    ["years", (v, E) => E.year - v.year],
    ["quarters", (v, E) => E.quarter - v.quarter + (E.year - v.year) * 4],
    ["months", (v, E) => E.month - v.month + (E.year - v.year) * 12],
    [
      "weeks",
      (v, E) => {
        const D = Dl(v, E);
        return (D - D % 7) / 7;
      }
    ],
    ["days", Dl]
  ], l = {}, h = s;
  let m, p;
  for (const [v, E] of a)
    i.indexOf(v) >= 0 && (m = v, l[v] = E(s, n), p = h.plus(l), p > n ? (l[v]--, s = h.plus(l), s > n && (p = s, l[v]--, s = h.plus(l))) : s = p);
  return [s, l, p, m];
}
function Tw(s, n, i, a) {
  let [l, h, m, p] = _w(s, n, i);
  const v = n - l, E = i.filter(
    (A) => ["hours", "minutes", "seconds", "milliseconds"].indexOf(A) >= 0
  );
  E.length === 0 && (m < n && (m = l.plus({ [p]: 1 })), m !== l && (h[p] = (h[p] || 0) + v / (m - l)));
  const D = z.fromObject(h, a);
  return E.length > 0 ? z.fromMillis(v, a).shiftTo(...E).plus(D) : D;
}
const Sw = "missing Intl.DateTimeFormat.formatToParts support";
function Y(s, n = (i) => i) {
  return { regex: s, deser: ([i]) => n(h1(i)) };
}
const xw = " ", Uf = `[ ${xw}]`, Vf = new RegExp(Uf, "g");
function Ow(s) {
  return s.replace(/\./g, "\\.?").replace(Vf, Uf);
}
function Cl(s) {
  return s.replace(/\./g, "").replace(Vf, " ").toLowerCase();
}
function ft(s, n) {
  return s === null ? null : {
    regex: RegExp(s.map(Ow).join("|")),
    deser: ([i]) => s.findIndex((a) => Cl(i) === Cl(a)) + n
  };
}
function Ll(s, n) {
  return { regex: s, deser: ([, i, a]) => bi(i, a), groups: n };
}
function di(s) {
  return { regex: s, deser: ([n]) => n };
}
function Ew(s) {
  return s.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}
function Iw(s, n) {
  const i = lt(n), a = lt(n, "{2}"), l = lt(n, "{3}"), h = lt(n, "{4}"), m = lt(n, "{6}"), p = lt(n, "{1,2}"), v = lt(n, "{1,3}"), E = lt(n, "{1,6}"), D = lt(n, "{1,9}"), A = lt(n, "{2,4}"), J = lt(n, "{4,6}"), C = (ue) => ({ regex: RegExp(Ew(ue.val)), deser: ([Ae]) => Ae, literal: !0 }), we = ((ue) => {
    if (s.literal)
      return C(ue);
    switch (ue.val) {
      // era
      case "G":
        return ft(n.eras("short"), 0);
      case "GG":
        return ft(n.eras("long"), 0);
      // years
      case "y":
        return Y(E);
      case "yy":
        return Y(A, vu);
      case "yyyy":
        return Y(h);
      case "yyyyy":
        return Y(J);
      case "yyyyyy":
        return Y(m);
      // months
      case "M":
        return Y(p);
      case "MM":
        return Y(a);
      case "MMM":
        return ft(n.months("short", !0), 1);
      case "MMMM":
        return ft(n.months("long", !0), 1);
      case "L":
        return Y(p);
      case "LL":
        return Y(a);
      case "LLL":
        return ft(n.months("short", !1), 1);
      case "LLLL":
        return ft(n.months("long", !1), 1);
      // dates
      case "d":
        return Y(p);
      case "dd":
        return Y(a);
      // ordinals
      case "o":
        return Y(v);
      case "ooo":
        return Y(l);
      // time
      case "HH":
        return Y(a);
      case "H":
        return Y(p);
      case "hh":
        return Y(a);
      case "h":
        return Y(p);
      case "mm":
        return Y(a);
      case "m":
        return Y(p);
      case "q":
        return Y(p);
      case "qq":
        return Y(a);
      case "s":
        return Y(p);
      case "ss":
        return Y(a);
      case "S":
        return Y(v);
      case "SSS":
        return Y(l);
      case "u":
        return di(D);
      case "uu":
        return di(p);
      case "uuu":
        return Y(i);
      // meridiem
      case "a":
        return ft(n.meridiems(), 0);
      // weekYear (k)
      case "kkkk":
        return Y(h);
      case "kk":
        return Y(A, vu);
      // weekNumber (W)
      case "W":
        return Y(p);
      case "WW":
        return Y(a);
      // weekdays
      case "E":
      case "c":
        return Y(i);
      case "EEE":
        return ft(n.weekdays("short", !1), 1);
      case "EEEE":
        return ft(n.weekdays("long", !1), 1);
      case "ccc":
        return ft(n.weekdays("short", !0), 1);
      case "cccc":
        return ft(n.weekdays("long", !0), 1);
      // offset/zone
      case "Z":
      case "ZZ":
        return Ll(new RegExp(`([+-]${p.source})(?::(${a.source}))?`), 2);
      case "ZZZ":
        return Ll(new RegExp(`([+-]${p.source})(${a.source})?`), 2);
      // we don't support ZZZZ (PST) or ZZZZZ (Pacific Standard Time) in parsing
      // because we don't have any way to figure out what they are
      case "z":
        return di(/[a-z_+-/]{1,256}?/i);
      // this special-case "token" represents a place where a macro-token expanded into a white-space literal
      // in this case we accept any non-newline white-space
      case " ":
        return di(/[^\S\n\r]/);
      default:
        return C(ue);
    }
  })(s) || {
    invalidReason: Sw
  };
  return we.token = s, we;
}
const kw = {
  year: {
    "2-digit": "yy",
    numeric: "yyyyy"
  },
  month: {
    numeric: "M",
    "2-digit": "MM",
    short: "MMM",
    long: "MMMM"
  },
  day: {
    numeric: "d",
    "2-digit": "dd"
  },
  weekday: {
    short: "EEE",
    long: "EEEE"
  },
  dayperiod: "a",
  dayPeriod: "a",
  hour12: {
    numeric: "h",
    "2-digit": "hh"
  },
  hour24: {
    numeric: "H",
    "2-digit": "HH"
  },
  minute: {
    numeric: "m",
    "2-digit": "mm"
  },
  second: {
    numeric: "s",
    "2-digit": "ss"
  },
  timeZoneName: {
    long: "ZZZZZ",
    short: "ZZZ"
  }
};
function Mw(s, n, i) {
  const { type: a, value: l } = s;
  if (a === "literal") {
    const v = /^\s+$/.test(l);
    return {
      literal: !v,
      val: v ? " " : l
    };
  }
  const h = n[a];
  let m = a;
  a === "hour" && (n.hour12 != null ? m = n.hour12 ? "hour12" : "hour24" : n.hourCycle != null ? n.hourCycle === "h11" || n.hourCycle === "h12" ? m = "hour12" : m = "hour24" : m = i.hour12 ? "hour12" : "hour24");
  let p = kw[m];
  if (typeof p == "object" && (p = p[h]), p)
    return {
      literal: !1,
      val: p
    };
}
function bw(s) {
  return [`^${s.map((i) => i.regex).reduce((i, a) => `${i}(${a.source})`, "")}$`, s];
}
function Dw(s, n, i) {
  const a = s.match(n);
  if (a) {
    const l = {};
    let h = 1;
    for (const m in i)
      if (An(i, m)) {
        const p = i[m], v = p.groups ? p.groups + 1 : 1;
        !p.literal && p.token && (l[p.token.val[0]] = p.deser(a.slice(h, h + v))), h += v;
      }
    return [a, l];
  } else
    return [a, {}];
}
function Cw(s) {
  const n = (h) => {
    switch (h) {
      case "S":
        return "millisecond";
      case "s":
        return "second";
      case "m":
        return "minute";
      case "h":
      case "H":
        return "hour";
      case "d":
        return "day";
      case "o":
        return "ordinal";
      case "L":
      case "M":
        return "month";
      case "y":
        return "year";
      case "E":
      case "c":
        return "weekday";
      case "W":
        return "weekNumber";
      case "k":
        return "weekYear";
      case "q":
        return "quarter";
      default:
        return null;
    }
  };
  let i = null, a;
  return W(s.z) || (i = bt.create(s.z)), W(s.Z) || (i || (i = new Ie(s.Z)), a = s.Z), W(s.q) || (s.M = (s.q - 1) * 3 + 1), W(s.h) || (s.h < 12 && s.a === 1 ? s.h += 12 : s.h === 12 && s.a === 0 && (s.h = 0)), s.G === 0 && s.y && (s.y = -s.y), W(s.u) || (s.S = Eu(s.u)), [Object.keys(s).reduce((h, m) => {
    const p = n(m);
    return p && (h[p] = s[m]), h;
  }, {}), i, a];
}
let ru = null;
function Lw() {
  return ru || (ru = R.fromMillis(1555555555555)), ru;
}
function Aw(s, n) {
  if (s.literal)
    return s;
  const i = Se.macroTokenToFormatOpts(s.val), a = Bf(i, n);
  return a == null || a.includes(void 0) ? s : a;
}
function $f(s, n) {
  return Array.prototype.concat(...s.map((i) => Aw(i, n)));
}
class Pf {
  constructor(n, i) {
    if (this.locale = n, this.format = i, this.tokens = $f(Se.parseFormat(i), n), this.units = this.tokens.map((a) => Iw(a, n)), this.disqualifyingUnit = this.units.find((a) => a.invalidReason), !this.disqualifyingUnit) {
      const [a, l] = bw(this.units);
      this.regex = RegExp(a, "i"), this.handlers = l;
    }
  }
  explainFromTokens(n) {
    if (this.isValid) {
      const [i, a] = Dw(n, this.regex, this.handlers), [l, h, m] = a ? Cw(a) : [null, null, void 0];
      if (An(a, "a") && An(a, "H"))
        throw new bn(
          "Can't include meridiem when specifying 24-hour format"
        );
      return {
        input: n,
        tokens: this.tokens,
        regex: this.regex,
        rawMatches: i,
        matches: a,
        result: l,
        zone: h,
        specificOffset: m
      };
    } else
      return { input: n, tokens: this.tokens, invalidReason: this.invalidReason };
  }
  get isValid() {
    return !this.disqualifyingUnit;
  }
  get invalidReason() {
    return this.disqualifyingUnit ? this.disqualifyingUnit.invalidReason : null;
  }
}
function Zf(s, n, i) {
  return new Pf(s, i).explainFromTokens(n);
}
function Nw(s, n, i) {
  const { result: a, zone: l, specificOffset: h, invalidReason: m } = Zf(s, n, i);
  return [a, l, h, m];
}
function Bf(s, n) {
  if (!s)
    return null;
  const a = Se.create(n, s).dtFormatter(Lw()), l = a.formatToParts(), h = a.resolvedOptions();
  return l.map((m) => Mw(m, s, h));
}
const iu = "Invalid DateTime", Al = 864e13;
function or(s) {
  return new ct("unsupported zone", `the zone "${s.name}" is not supported`);
}
function su(s) {
  return s.weekData === null && (s.weekData = xi(s.c)), s.weekData;
}
function uu(s) {
  return s.localWeekData === null && (s.localWeekData = xi(
    s.c,
    s.loc.getMinDaysInFirstWeek(),
    s.loc.getStartOfWeek()
  )), s.localWeekData;
}
function an(s, n) {
  const i = {
    ts: s.ts,
    zone: s.zone,
    c: s.c,
    o: s.o,
    loc: s.loc,
    invalid: s.invalid
  };
  return new R({ ...i, ...n, old: i });
}
function Gf(s, n, i) {
  let a = s - n * 60 * 1e3;
  const l = i.offset(a);
  if (n === l)
    return [a, n];
  a -= (l - n) * 60 * 1e3;
  const h = i.offset(a);
  return l === h ? [a, l] : [s - Math.min(l, h) * 60 * 1e3, Math.max(l, h)];
}
function mi(s, n) {
  s += n * 60 * 1e3;
  const i = new Date(s);
  return {
    year: i.getUTCFullYear(),
    month: i.getUTCMonth() + 1,
    day: i.getUTCDate(),
    hour: i.getUTCHours(),
    minute: i.getUTCMinutes(),
    second: i.getUTCSeconds(),
    millisecond: i.getUTCMilliseconds()
  };
}
function vi(s, n, i) {
  return Gf(Mi(s), n, i);
}
function Nl(s, n) {
  const i = s.o, a = s.c.year + Math.trunc(n.years), l = s.c.month + Math.trunc(n.months) + Math.trunc(n.quarters) * 3, h = {
    ...s.c,
    year: a,
    month: l,
    day: Math.min(s.c.day, Oi(a, l)) + Math.trunc(n.days) + Math.trunc(n.weeks) * 7
  }, m = z.fromObject({
    years: n.years - Math.trunc(n.years),
    quarters: n.quarters - Math.trunc(n.quarters),
    months: n.months - Math.trunc(n.months),
    weeks: n.weeks - Math.trunc(n.weeks),
    days: n.days - Math.trunc(n.days),
    hours: n.hours,
    minutes: n.minutes,
    seconds: n.seconds,
    milliseconds: n.milliseconds
  }).as("milliseconds"), p = Mi(h);
  let [v, E] = Gf(p, i, s.zone);
  return m !== 0 && (v += m, E = s.zone.offset(v)), { ts: v, o: E };
}
function Mn(s, n, i, a, l, h) {
  const { setZone: m, zone: p } = i;
  if (s && Object.keys(s).length !== 0 || n) {
    const v = n || p, E = R.fromObject(s, {
      ...i,
      zone: v,
      specificOffset: h
    });
    return m ? E : E.setZone(p);
  } else
    return R.invalid(
      new ct("unparsable", `the input "${l}" can't be parsed as ${a}`)
    );
}
function gi(s, n, i = !0) {
  return s.isValid ? Se.create(X.create("en-US"), {
    allowZ: i,
    forceSimple: !0
  }).formatDateTimeFromString(s, n) : null;
}
function au(s, n, i) {
  const a = s.c.year > 9999 || s.c.year < 0;
  let l = "";
  if (a && s.c.year >= 0 && (l += "+"), l += ce(s.c.year, a ? 6 : 4), i === "year") return l;
  if (n) {
    if (l += "-", l += ce(s.c.month), i === "month") return l;
    l += "-";
  } else if (l += ce(s.c.month), i === "month") return l;
  return l += ce(s.c.day), l;
}
function Fl(s, n, i, a, l, h, m) {
  let p = !i || s.c.millisecond !== 0 || s.c.second !== 0, v = "";
  switch (m) {
    case "day":
    case "month":
    case "year":
      break;
    default:
      if (v += ce(s.c.hour), m === "hour") break;
      if (n) {
        if (v += ":", v += ce(s.c.minute), m === "minute") break;
        p && (v += ":", v += ce(s.c.second));
      } else {
        if (v += ce(s.c.minute), m === "minute") break;
        p && (v += ce(s.c.second));
      }
      if (m === "second") break;
      p && (!a || s.c.millisecond !== 0) && (v += ".", v += ce(s.c.millisecond, 3));
  }
  return l && (s.isOffsetFixed && s.offset === 0 && !h ? v += "Z" : s.o < 0 ? (v += "-", v += ce(Math.trunc(-s.o / 60)), v += ":", v += ce(Math.trunc(-s.o % 60))) : (v += "+", v += ce(Math.trunc(s.o / 60)), v += ":", v += ce(Math.trunc(s.o % 60)))), h && (v += "[" + s.zone.ianaName + "]"), v;
}
const Hf = {
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
}, Fw = {
  weekNumber: 1,
  weekday: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
}, Ww = {
  ordinal: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
}, _i = ["year", "month", "day", "hour", "minute", "second", "millisecond"], Rw = [
  "weekYear",
  "weekNumber",
  "weekday",
  "hour",
  "minute",
  "second",
  "millisecond"
], Uw = ["year", "ordinal", "hour", "minute", "second", "millisecond"];
function Ti(s) {
  const n = {
    year: "year",
    years: "year",
    month: "month",
    months: "month",
    day: "day",
    days: "day",
    hour: "hour",
    hours: "hour",
    minute: "minute",
    minutes: "minute",
    quarter: "quarter",
    quarters: "quarter",
    second: "second",
    seconds: "second",
    millisecond: "millisecond",
    milliseconds: "millisecond",
    weekday: "weekday",
    weekdays: "weekday",
    weeknumber: "weekNumber",
    weeksnumber: "weekNumber",
    weeknumbers: "weekNumber",
    weekyear: "weekYear",
    weekyears: "weekYear",
    ordinal: "ordinal"
  }[s.toLowerCase()];
  if (!n) throw new Gl(s);
  return n;
}
function Wl(s) {
  switch (s.toLowerCase()) {
    case "localweekday":
    case "localweekdays":
      return "localWeekday";
    case "localweeknumber":
    case "localweeknumbers":
      return "localWeekNumber";
    case "localweekyear":
    case "localweekyears":
      return "localWeekYear";
    default:
      return Ti(s);
  }
}
function Vw(s) {
  if (lr === void 0 && (lr = oe.now()), s.type !== "iana")
    return s.offset(lr);
  const n = s.name;
  let i = _u.get(n);
  return i === void 0 && (i = s.offset(lr), _u.set(n, i)), i;
}
function Rl(s, n) {
  const i = Bt(n.zone, oe.defaultZone);
  if (!i.isValid)
    return R.invalid(or(i));
  const a = X.fromObject(n);
  let l, h;
  if (W(s.year))
    l = oe.now();
  else {
    for (const v of _i)
      W(s[v]) && (s[v] = Hf[v]);
    const m = yf(s) || wf(s);
    if (m)
      return R.invalid(m);
    const p = Vw(i);
    [l, h] = vi(s, p, i);
  }
  return new R({ ts: l, zone: i, loc: a, o: h });
}
function Ul(s, n, i) {
  const a = W(i.round) ? !0 : i.round, l = W(i.rounding) ? "trunc" : i.rounding, h = (p, v) => (p = Iu(p, a || i.calendary ? 0 : 2, i.calendary ? "round" : l), n.loc.clone(i).relFormatter(i).format(p, v)), m = (p) => i.calendary ? n.hasSame(s, p) ? 0 : n.startOf(p).diff(s.startOf(p), p).get(p) : n.diff(s, p).get(p);
  if (i.unit)
    return h(m(i.unit), i.unit);
  for (const p of i.units) {
    const v = m(p);
    if (Math.abs(v) >= 1)
      return h(v, p);
  }
  return h(s > n ? -0 : 0, i.units[i.units.length - 1]);
}
function Vl(s) {
  let n = {}, i;
  return s.length > 0 && typeof s[s.length - 1] == "object" ? (n = s[s.length - 1], i = Array.from(s).slice(0, s.length - 1)) : i = Array.from(s), [n, i];
}
let lr;
const _u = /* @__PURE__ */ new Map();
class R {
  /**
   * @access private
   */
  constructor(n) {
    const i = n.zone || oe.defaultZone;
    let a = n.invalid || (Number.isNaN(n.ts) ? new ct("invalid input") : null) || (i.isValid ? null : or(i));
    this.ts = W(n.ts) ? oe.now() : n.ts;
    let l = null, h = null;
    if (!a)
      if (n.old && n.old.ts === this.ts && n.old.zone.equals(i))
        [l, h] = [n.old.c, n.old.o];
      else {
        const p = Gt(n.o) && !n.old ? n.o : i.offset(this.ts);
        l = mi(this.ts, p), a = Number.isNaN(l.year) ? new ct("invalid input") : null, l = a ? null : l, h = a ? null : p;
      }
    this._zone = i, this.loc = n.loc || X.create(), this.invalid = a, this.weekData = null, this.localWeekData = null, this.c = l, this.o = h, this.isLuxonDateTime = !0;
  }
  // CONSTRUCT
  /**
   * Create a DateTime for the current instant, in the system's time zone.
   *
   * Use Settings to override these default values if needed.
   * @example DateTime.now().toISO() //~> now in the ISO format
   * @return {DateTime}
   */
  static now() {
    return new R({});
  }
  /**
   * Create a local DateTime
   * @param {number} [year] - The calendar year. If omitted (as in, call `local()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month, 1-indexed
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
   * @example DateTime.local()                                  //~> now
   * @example DateTime.local({ zone: "America/New_York" })      //~> now, in US east coast time
   * @example DateTime.local(2017)                              //~> 2017-01-01T00:00:00
   * @example DateTime.local(2017, 3)                           //~> 2017-03-01T00:00:00
   * @example DateTime.local(2017, 3, 12, { locale: "fr" })     //~> 2017-03-12T00:00:00, with a French locale
   * @example DateTime.local(2017, 3, 12, 5)                    //~> 2017-03-12T05:00:00
   * @example DateTime.local(2017, 3, 12, 5, { zone: "utc" })   //~> 2017-03-12T05:00:00, in UTC
   * @example DateTime.local(2017, 3, 12, 5, 45)                //~> 2017-03-12T05:45:00
   * @example DateTime.local(2017, 3, 12, 5, 45, 10)            //~> 2017-03-12T05:45:10
   * @example DateTime.local(2017, 3, 12, 5, 45, 10, 765)       //~> 2017-03-12T05:45:10.765
   * @return {DateTime}
   */
  static local() {
    const [n, i] = Vl(arguments), [a, l, h, m, p, v, E] = i;
    return Rl({ year: a, month: l, day: h, hour: m, minute: p, second: v, millisecond: E }, n);
  }
  /**
   * Create a DateTime in UTC
   * @param {number} [year] - The calendar year. If omitted (as in, call `utc()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
   * @param {Object} options - configuration options for the DateTime
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} [options.outputCalendar] - the output calendar to set on the resulting DateTime instance
   * @param {string} [options.numberingSystem] - the numbering system to set on the resulting DateTime instance
   * @param {string} [options.weekSettings] - the week settings to set on the resulting DateTime instance
   * @example DateTime.utc()                                              //~> now
   * @example DateTime.utc(2017)                                          //~> 2017-01-01T00:00:00Z
   * @example DateTime.utc(2017, 3)                                       //~> 2017-03-01T00:00:00Z
   * @example DateTime.utc(2017, 3, 12)                                   //~> 2017-03-12T00:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5)                                //~> 2017-03-12T05:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45)                            //~> 2017-03-12T05:45:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, { locale: "fr" })          //~> 2017-03-12T05:45:00Z with a French locale
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10)                        //~> 2017-03-12T05:45:10Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10, 765, { locale: "fr" }) //~> 2017-03-12T05:45:10.765Z with a French locale
   * @return {DateTime}
   */
  static utc() {
    const [n, i] = Vl(arguments), [a, l, h, m, p, v, E] = i;
    return n.zone = Ie.utcInstance, Rl({ year: a, month: l, day: h, hour: m, minute: p, second: v, millisecond: E }, n);
  }
  /**
   * Create a DateTime from a JavaScript Date object. Uses the default zone.
   * @param {Date} date - a JavaScript Date object
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @return {DateTime}
   */
  static fromJSDate(n, i = {}) {
    const a = y1(n) ? n.valueOf() : NaN;
    if (Number.isNaN(a))
      return R.invalid("invalid input");
    const l = Bt(i.zone, oe.defaultZone);
    return l.isValid ? new R({
      ts: a,
      zone: l,
      loc: X.fromObject(i)
    }) : R.invalid(or(l));
  }
  /**
   * Create a DateTime from a number of milliseconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
   * @param {number} milliseconds - a number of milliseconds since 1970 UTC
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} options.weekSettings - the week settings to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromMillis(n, i = {}) {
    if (Gt(n))
      return n < -Al || n > Al ? R.invalid("Timestamp out of range") : new R({
        ts: n,
        zone: Bt(i.zone, oe.defaultZone),
        loc: X.fromObject(i)
      });
    throw new Te(
      `fromMillis requires a numerical input, but received a ${typeof n} with value ${n}`
    );
  }
  /**
   * Create a DateTime from a number of seconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
   * @param {number} seconds - a number of seconds since 1970 UTC
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} options.weekSettings - the week settings to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromSeconds(n, i = {}) {
    if (Gt(n))
      return new R({
        ts: n * 1e3,
        zone: Bt(i.zone, oe.defaultZone),
        loc: X.fromObject(i)
      });
    throw new Te("fromSeconds requires a numerical input");
  }
  /**
   * Create a DateTime from a JavaScript object with keys like 'year' and 'hour' with reasonable defaults.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.year - a year, such as 1987
   * @param {number} obj.month - a month, 1-12
   * @param {number} obj.day - a day of the month, 1-31, depending on the month
   * @param {number} obj.ordinal - day of the year, 1-365 or 366
   * @param {number} obj.weekYear - an ISO week year
   * @param {number} obj.weekNumber - an ISO week number, between 1 and 52 or 53, depending on the year
   * @param {number} obj.weekday - an ISO weekday, 1-7, where 1 is Monday and 7 is Sunday
   * @param {number} obj.localWeekYear - a week year, according to the locale
   * @param {number} obj.localWeekNumber - a week number, between 1 and 52 or 53, depending on the year, according to the locale
   * @param {number} obj.localWeekday - a weekday, 1-7, where 1 is the first and 7 is the last day of the week, according to the locale
   * @param {number} obj.hour - hour of the day, 0-23
   * @param {number} obj.minute - minute of the hour, 0-59
   * @param {number} obj.second - second of the minute, 0-59
   * @param {number} obj.millisecond - millisecond of the second, 0-999
   * @param {Object} opts - options for creating this DateTime
   * @param {string|Zone} [opts.zone='local'] - interpret the numbers in the context of a particular zone. Can take any value taken as the first argument to setZone()
   * @param {string} [opts.locale='system\'s locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @example DateTime.fromObject({ year: 1982, month: 5, day: 25}).toISODate() //=> '1982-05-25'
   * @example DateTime.fromObject({ year: 1982 }).toISODate() //=> '1982-01-01'
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }) //~> today at 10:26:06
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'utc' }),
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'local' })
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'America/New_York' })
   * @example DateTime.fromObject({ weekYear: 2016, weekNumber: 2, weekday: 3 }).toISODate() //=> '2016-01-13'
   * @example DateTime.fromObject({ localWeekYear: 2022, localWeekNumber: 1, localWeekday: 1 }, { locale: "en-US" }).toISODate() //=> '2021-12-26'
   * @return {DateTime}
   */
  static fromObject(n, i = {}) {
    n = n || {};
    const a = Bt(i.zone, oe.defaultZone);
    if (!a.isValid)
      return R.invalid(or(a));
    const l = X.fromObject(i), h = Ei(n, Wl), { minDaysInFirstWeek: m, startOfWeek: p } = Sl(h, l), v = oe.now(), E = W(i.specificOffset) ? a.offset(v) : i.specificOffset, D = !W(h.ordinal), A = !W(h.year), J = !W(h.month) || !W(h.day), C = A || J, j = h.weekYear || h.weekNumber;
    if ((C || D) && j)
      throw new bn(
        "Can't mix weekYear/weekNumber units with year/month/day or ordinals"
      );
    if (J && D)
      throw new bn("Can't mix ordinal dates with month/day");
    const we = j || h.weekday && !C;
    let ue, Ae, Dt = mi(v, E);
    we ? (ue = Rw, Ae = Fw, Dt = xi(Dt, m, p)) : D ? (ue = Uw, Ae = Ww, Dt = nu(Dt)) : (ue = _i, Ae = Hf);
    let Be = !1;
    for (const Yt of ue) {
      const Ci = h[Yt];
      W(Ci) ? Be ? h[Yt] = Ae[Yt] : h[Yt] = Dt[Yt] : Be = !0;
    }
    const Ht = we ? m1(h, m, p) : D ? g1(h) : yf(h), Ge = Ht || wf(h);
    if (Ge)
      return R.invalid(Ge);
    const zt = we ? _l(h, m, p) : D ? Tl(h) : h, [nt, qt] = vi(zt, E, a), yt = new R({
      ts: nt,
      zone: a,
      o: qt,
      loc: l
    });
    return h.weekday && C && n.weekday !== yt.weekday ? R.invalid(
      "mismatched weekday",
      `you can't specify both a weekday of ${h.weekday} and a date of ${yt.toISO()}`
    ) : yt.isValid ? yt : R.invalid(yt.invalid);
  }
  /**
   * Create a DateTime from an ISO 8601 string
   * @param {string} text - the ISO string
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the time to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} [opts.outputCalendar] - the output calendar to set on the resulting DateTime instance
   * @param {string} [opts.numberingSystem] - the numbering system to set on the resulting DateTime instance
   * @param {string} [opts.weekSettings] - the week settings to set on the resulting DateTime instance
   * @example DateTime.fromISO('2016-05-25T09:08:34.123')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00', {setZone: true})
   * @example DateTime.fromISO('2016-05-25T09:08:34.123', {zone: 'utc'})
   * @example DateTime.fromISO('2016-W05-4')
   * @return {DateTime}
   */
  static fromISO(n, i = {}) {
    const [a, l] = uw(n);
    return Mn(a, l, i, "ISO 8601", n);
  }
  /**
   * Create a DateTime from an RFC 2822 string
   * @param {string} text - the RFC 2822 string
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since the offset is always specified in the string itself, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23:12 GMT')
   * @example DateTime.fromRFC2822('Fri, 25 Nov 2016 13:23:12 +0600')
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23 Z')
   * @return {DateTime}
   */
  static fromRFC2822(n, i = {}) {
    const [a, l] = aw(n);
    return Mn(a, l, i, "RFC 2822", n);
  }
  /**
   * Create a DateTime from an HTTP header date
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @param {string} text - the HTTP header date
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since HTTP dates are always in UTC, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [opts.setZone=false] - override the zone with the fixed-offset zone specified in the string. For HTTP dates, this is always UTC, so this option is equivalent to setting the `zone` option to 'utc', but this option is included for consistency with similar methods.
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @example DateTime.fromHTTP('Sun, 06 Nov 1994 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sunday, 06-Nov-94 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sun Nov  6 08:49:37 1994')
   * @return {DateTime}
   */
  static fromHTTP(n, i = {}) {
    const [a, l] = ow(n);
    return Mn(a, l, i, "HTTP", i);
  }
  /**
   * Create a DateTime from an input string and format string.
   * Defaults to en-US if no locale has been specified, regardless of the system's locale. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/parsing?id=table-of-tokens).
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see the link below for the formats)
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
   * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromFormat(n, i, a = {}) {
    if (W(n) || W(i))
      throw new Te("fromFormat requires an input string and a format");
    const { locale: l = null, numberingSystem: h = null } = a, m = X.fromOpts({
      locale: l,
      numberingSystem: h,
      defaultToEN: !0
    }), [p, v, E, D] = Nw(m, n, i);
    return D ? R.invalid(D) : Mn(p, v, a, `format ${i}`, n, E);
  }
  /**
   * @deprecated use fromFormat instead
   */
  static fromString(n, i, a = {}) {
    return R.fromFormat(n, i, a);
  }
  /**
   * Create a DateTime from a SQL date, time, or datetime
   * Defaults to en-US if no locale has been specified, regardless of the system's locale
   * @param {string} text - the string to parse
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
   * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @example DateTime.fromSQL('2017-05-15')
   * @example DateTime.fromSQL('2017-05-15 09:12:34')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342+06:00')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles', { setZone: true })
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342', { zone: 'America/Los_Angeles' })
   * @example DateTime.fromSQL('09:12:34.342')
   * @return {DateTime}
   */
  static fromSQL(n, i = {}) {
    const [a, l] = gw(n);
    return Mn(a, l, i, "SQL", n);
  }
  /**
   * Create an invalid DateTime.
   * @param {string} reason - simple string of why this DateTime is invalid. Should not contain parameters or anything else data-dependent.
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {DateTime}
   */
  static invalid(n, i = null) {
    if (!n)
      throw new Te("need to specify a reason the DateTime is invalid");
    const a = n instanceof ct ? n : new ct(n, i);
    if (oe.throwOnInvalid)
      throw new Zy(a);
    return new R({ invalid: a });
  }
  /**
   * Check if an object is an instance of DateTime. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isDateTime(n) {
    return n && n.isLuxonDateTime || !1;
  }
  /**
   * Produce the format string for a set of options
   * @param formatOpts
   * @param localeOpts
   * @returns {string}
   */
  static parseFormatForOpts(n, i = {}) {
    const a = Bf(n, X.fromObject(i));
    return a ? a.map((l) => l ? l.val : null).join("") : null;
  }
  /**
   * Produce the the fully expanded format token for the locale
   * Does NOT quote characters, so quoted tokens will not round trip correctly
   * @param fmt
   * @param localeOpts
   * @returns {string}
   */
  static expandFormat(n, i = {}) {
    return $f(Se.parseFormat(n), X.fromObject(i)).map((l) => l.val).join("");
  }
  static resetCache() {
    lr = void 0, _u.clear();
  }
  // INFO
  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example DateTime.local(2017, 7, 4).get('month'); //=> 7
   * @example DateTime.local(2017, 7, 4).get('day'); //=> 4
   * @return {number}
   */
  get(n) {
    return this[n];
  }
  /**
   * Returns whether the DateTime is valid. Invalid DateTimes occur when:
   * * The DateTime was created from invalid calendar information, such as the 13th month or February 30
   * * The DateTime was created by an operation on another invalid date
   * @type {boolean}
   */
  get isValid() {
    return this.invalid === null;
  }
  /**
   * Returns an error code if this DateTime is invalid, or null if the DateTime is valid
   * @type {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  /**
   * Returns an explanation of why this DateTime became invalid, or null if the DateTime is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  /**
   * Get the locale of a DateTime, such 'en-GB'. The locale is used when formatting the DateTime
   *
   * @type {string}
   */
  get locale() {
    return this.isValid ? this.loc.locale : null;
  }
  /**
   * Get the numbering system of a DateTime, such 'beng'. The numbering system is used when formatting the DateTime
   *
   * @type {string}
   */
  get numberingSystem() {
    return this.isValid ? this.loc.numberingSystem : null;
  }
  /**
   * Get the output calendar of a DateTime, such 'islamic'. The output calendar is used when formatting the DateTime
   *
   * @type {string}
   */
  get outputCalendar() {
    return this.isValid ? this.loc.outputCalendar : null;
  }
  /**
   * Get the time zone associated with this DateTime.
   * @type {Zone}
   */
  get zone() {
    return this._zone;
  }
  /**
   * Get the name of the time zone.
   * @type {string}
   */
  get zoneName() {
    return this.isValid ? this.zone.name : null;
  }
  /**
   * Get the year
   * @example DateTime.local(2017, 5, 25).year //=> 2017
   * @type {number}
   */
  get year() {
    return this.isValid ? this.c.year : NaN;
  }
  /**
   * Get the quarter
   * @example DateTime.local(2017, 5, 25).quarter //=> 2
   * @type {number}
   */
  get quarter() {
    return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
  }
  /**
   * Get the month (1-12).
   * @example DateTime.local(2017, 5, 25).month //=> 5
   * @type {number}
   */
  get month() {
    return this.isValid ? this.c.month : NaN;
  }
  /**
   * Get the day of the month (1-30ish).
   * @example DateTime.local(2017, 5, 25).day //=> 25
   * @type {number}
   */
  get day() {
    return this.isValid ? this.c.day : NaN;
  }
  /**
   * Get the hour of the day (0-23).
   * @example DateTime.local(2017, 5, 25, 9).hour //=> 9
   * @type {number}
   */
  get hour() {
    return this.isValid ? this.c.hour : NaN;
  }
  /**
   * Get the minute of the hour (0-59).
   * @example DateTime.local(2017, 5, 25, 9, 30).minute //=> 30
   * @type {number}
   */
  get minute() {
    return this.isValid ? this.c.minute : NaN;
  }
  /**
   * Get the second of the minute (0-59).
   * @example DateTime.local(2017, 5, 25, 9, 30, 52).second //=> 52
   * @type {number}
   */
  get second() {
    return this.isValid ? this.c.second : NaN;
  }
  /**
   * Get the millisecond of the second (0-999).
   * @example DateTime.local(2017, 5, 25, 9, 30, 52, 654).millisecond //=> 654
   * @type {number}
   */
  get millisecond() {
    return this.isValid ? this.c.millisecond : NaN;
  }
  /**
   * Get the week year
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2014, 12, 31).weekYear //=> 2015
   * @type {number}
   */
  get weekYear() {
    return this.isValid ? su(this).weekYear : NaN;
  }
  /**
   * Get the week number of the week year (1-52ish).
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2017, 5, 25).weekNumber //=> 21
   * @type {number}
   */
  get weekNumber() {
    return this.isValid ? su(this).weekNumber : NaN;
  }
  /**
   * Get the day of the week.
   * 1 is Monday and 7 is Sunday
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2014, 11, 31).weekday //=> 4
   * @type {number}
   */
  get weekday() {
    return this.isValid ? su(this).weekday : NaN;
  }
  /**
   * Returns true if this date is on a weekend according to the locale, false otherwise
   * @returns {boolean}
   */
  get isWeekend() {
    return this.isValid && this.loc.getWeekendDays().includes(this.weekday);
  }
  /**
   * Get the day of the week according to the locale.
   * 1 is the first day of the week and 7 is the last day of the week.
   * If the locale assigns Sunday as the first day of the week, then a date which is a Sunday will return 1,
   * @returns {number}
   */
  get localWeekday() {
    return this.isValid ? uu(this).weekday : NaN;
  }
  /**
   * Get the week number of the week year according to the locale. Different locales assign week numbers differently,
   * because the week can start on different days of the week (see localWeekday) and because a different number of days
   * is required for a week to count as the first week of a year.
   * @returns {number}
   */
  get localWeekNumber() {
    return this.isValid ? uu(this).weekNumber : NaN;
  }
  /**
   * Get the week year according to the locale. Different locales assign week numbers (and therefor week years)
   * differently, see localWeekNumber.
   * @returns {number}
   */
  get localWeekYear() {
    return this.isValid ? uu(this).weekYear : NaN;
  }
  /**
   * Get the ordinal (meaning the day of the year)
   * @example DateTime.local(2017, 5, 25).ordinal //=> 145
   * @type {number|DateTime}
   */
  get ordinal() {
    return this.isValid ? nu(this.c).ordinal : NaN;
  }
  /**
   * Get the human readable short month name, such as 'Oct'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).monthShort //=> Oct
   * @type {string}
   */
  get monthShort() {
    return this.isValid ? hi.months("short", { locObj: this.loc })[this.month - 1] : null;
  }
  /**
   * Get the human readable long month name, such as 'October'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).monthLong //=> October
   * @type {string}
   */
  get monthLong() {
    return this.isValid ? hi.months("long", { locObj: this.loc })[this.month - 1] : null;
  }
  /**
   * Get the human readable short weekday, such as 'Mon'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).weekdayShort //=> Mon
   * @type {string}
   */
  get weekdayShort() {
    return this.isValid ? hi.weekdays("short", { locObj: this.loc })[this.weekday - 1] : null;
  }
  /**
   * Get the human readable long weekday, such as 'Monday'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).weekdayLong //=> Monday
   * @type {string}
   */
  get weekdayLong() {
    return this.isValid ? hi.weekdays("long", { locObj: this.loc })[this.weekday - 1] : null;
  }
  /**
   * Get the UTC offset of this DateTime in minutes
   * @example DateTime.now().offset //=> -240
   * @example DateTime.utc().offset //=> 0
   * @type {number}
   */
  get offset() {
    return this.isValid ? +this.o : NaN;
  }
  /**
   * Get the short human name for the zone's current offset, for example "EST" or "EDT".
   * Defaults to the system's locale if no locale has been specified
   * @type {string}
   */
  get offsetNameShort() {
    return this.isValid ? this.zone.offsetName(this.ts, {
      format: "short",
      locale: this.locale
    }) : null;
  }
  /**
   * Get the long human name for the zone's current offset, for example "Eastern Standard Time" or "Eastern Daylight Time".
   * Defaults to the system's locale if no locale has been specified
   * @type {string}
   */
  get offsetNameLong() {
    return this.isValid ? this.zone.offsetName(this.ts, {
      format: "long",
      locale: this.locale
    }) : null;
  }
  /**
   * Get whether this zone's offset ever changes, as in a DST.
   * @type {boolean}
   */
  get isOffsetFixed() {
    return this.isValid ? this.zone.isUniversal : null;
  }
  /**
   * Get whether the DateTime is in a DST.
   * @type {boolean}
   */
  get isInDST() {
    return this.isOffsetFixed ? !1 : this.offset > this.set({ month: 1, day: 1 }).offset || this.offset > this.set({ month: 5 }).offset;
  }
  /**
   * Get those DateTimes which have the same local time as this DateTime, but a different offset from UTC
   * in this DateTime's zone. During DST changes local time can be ambiguous, for example
   * `2023-10-29T02:30:00` in `Europe/Berlin` can have offset `+01:00` or `+02:00`.
   * This method will return both possible DateTimes if this DateTime's local time is ambiguous.
   * @returns {DateTime[]}
   */
  getPossibleOffsets() {
    if (!this.isValid || this.isOffsetFixed)
      return [this];
    const n = 864e5, i = 6e4, a = Mi(this.c), l = this.zone.offset(a - n), h = this.zone.offset(a + n), m = this.zone.offset(a - l * i), p = this.zone.offset(a - h * i);
    if (m === p)
      return [this];
    const v = a - m * i, E = a - p * i, D = mi(v, m), A = mi(E, p);
    return D.hour === A.hour && D.minute === A.minute && D.second === A.second && D.millisecond === A.millisecond ? [an(this, { ts: v }), an(this, { ts: E })] : [this];
  }
  /**
   * Returns true if this DateTime is in a leap year, false otherwise
   * @example DateTime.local(2016).isInLeapYear //=> true
   * @example DateTime.local(2013).isInLeapYear //=> false
   * @type {boolean}
   */
  get isInLeapYear() {
    return gr(this.year);
  }
  /**
   * Returns the number of days in this DateTime's month
   * @example DateTime.local(2016, 2).daysInMonth //=> 29
   * @example DateTime.local(2016, 3).daysInMonth //=> 31
   * @type {number}
   */
  get daysInMonth() {
    return Oi(this.year, this.month);
  }
  /**
   * Returns the number of days in this DateTime's year
   * @example DateTime.local(2016).daysInYear //=> 366
   * @example DateTime.local(2013).daysInYear //=> 365
   * @type {number}
   */
  get daysInYear() {
    return this.isValid ? Dn(this.year) : NaN;
  }
  /**
   * Returns the number of weeks in this DateTime's year
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2004).weeksInWeekYear //=> 53
   * @example DateTime.local(2013).weeksInWeekYear //=> 52
   * @type {number}
   */
  get weeksInWeekYear() {
    return this.isValid ? hr(this.weekYear) : NaN;
  }
  /**
   * Returns the number of weeks in this DateTime's local week year
   * @example DateTime.local(2020, 6, {locale: 'en-US'}).weeksInLocalWeekYear //=> 52
   * @example DateTime.local(2020, 6, {locale: 'de-DE'}).weeksInLocalWeekYear //=> 53
   * @type {number}
   */
  get weeksInLocalWeekYear() {
    return this.isValid ? hr(
      this.localWeekYear,
      this.loc.getMinDaysInFirstWeek(),
      this.loc.getStartOfWeek()
    ) : NaN;
  }
  /**
   * Returns the resolved Intl options for this DateTime.
   * This is useful in understanding the behavior of formatting methods
   * @param {Object} opts - the same options as toLocaleString
   * @return {Object}
   */
  resolvedLocaleOptions(n = {}) {
    const { locale: i, numberingSystem: a, calendar: l } = Se.create(
      this.loc.clone(n),
      n
    ).resolvedOptions(this);
    return { locale: i, numberingSystem: a, outputCalendar: l };
  }
  // TRANSFORM
  /**
   * "Set" the DateTime's zone to UTC. Returns a newly-constructed DateTime.
   *
   * Equivalent to {@link DateTime#setZone}('utc')
   * @param {number} [offset=0] - optionally, an offset from UTC in minutes
   * @param {Object} [opts={}] - options to pass to `setZone()`
   * @return {DateTime}
   */
  toUTC(n = 0, i = {}) {
    return this.setZone(Ie.instance(n), i);
  }
  /**
   * "Set" the DateTime's zone to the host's local zone. Returns a newly-constructed DateTime.
   *
   * Equivalent to `setZone('local')`
   * @return {DateTime}
   */
  toLocal() {
    return this.setZone(oe.defaultZone);
  }
  /**
   * "Set" the DateTime's zone to specified zone. Returns a newly-constructed DateTime.
   *
   * By default, the setter keeps the underlying time the same (as in, the same timestamp), but the new instance will report different local times and consider DSTs when making computations, as with {@link DateTime#plus}. You may wish to use {@link DateTime#toLocal} and {@link DateTime#toUTC} which provide simple convenience wrappers for commonly used zones.
   * @param {string|Zone} [zone='local'] - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the strings 'local' or 'utc'. You may also supply an instance of a {@link DateTime#Zone} class.
   * @param {Object} opts - options
   * @param {boolean} [opts.keepLocalTime=false] - If true, adjust the underlying time so that the local time stays the same, but in the target zone. You should rarely need this.
   * @return {DateTime}
   */
  setZone(n, { keepLocalTime: i = !1, keepCalendarTime: a = !1 } = {}) {
    if (n = Bt(n, oe.defaultZone), n.equals(this.zone))
      return this;
    if (n.isValid) {
      let l = this.ts;
      if (i || a) {
        const h = n.offset(this.ts), m = this.toObject();
        [l] = vi(m, h, n);
      }
      return an(this, { ts: l, zone: n });
    } else
      return R.invalid(or(n));
  }
  /**
   * "Set" the locale, numberingSystem, or outputCalendar. Returns a newly-constructed DateTime.
   * @param {Object} properties - the properties to set
   * @example DateTime.local(2017, 5, 25).reconfigure({ locale: 'en-GB' })
   * @return {DateTime}
   */
  reconfigure({ locale: n, numberingSystem: i, outputCalendar: a } = {}) {
    const l = this.loc.clone({ locale: n, numberingSystem: i, outputCalendar: a });
    return an(this, { loc: l });
  }
  /**
   * "Set" the locale. Returns a newly-constructed DateTime.
   * Just a convenient alias for reconfigure({ locale })
   * @example DateTime.local(2017, 5, 25).setLocale('en-GB')
   * @return {DateTime}
   */
  setLocale(n) {
    return this.reconfigure({ locale: n });
  }
  /**
   * "Set" the values of specified units. Returns a newly-constructed DateTime.
   * You can only set units with this method; for "setting" metadata, see {@link DateTime#reconfigure} and {@link DateTime#setZone}.
   *
   * This method also supports setting locale-based week units, i.e. `localWeekday`, `localWeekNumber` and `localWeekYear`.
   * They cannot be mixed with ISO-week units like `weekday`.
   * @param {Object} values - a mapping of units to numbers
   * @example dt.set({ year: 2017 })
   * @example dt.set({ hour: 8, minute: 30 })
   * @example dt.set({ weekday: 5 })
   * @example dt.set({ year: 2005, ordinal: 234 })
   * @return {DateTime}
   */
  set(n) {
    if (!this.isValid) return this;
    const i = Ei(n, Wl), { minDaysInFirstWeek: a, startOfWeek: l } = Sl(i, this.loc), h = !W(i.weekYear) || !W(i.weekNumber) || !W(i.weekday), m = !W(i.ordinal), p = !W(i.year), v = !W(i.month) || !W(i.day), E = p || v, D = i.weekYear || i.weekNumber;
    if ((E || m) && D)
      throw new bn(
        "Can't mix weekYear/weekNumber units with year/month/day or ordinals"
      );
    if (v && m)
      throw new bn("Can't mix ordinal dates with month/day");
    let A;
    h ? A = _l(
      { ...xi(this.c, a, l), ...i },
      a,
      l
    ) : W(i.ordinal) ? (A = { ...this.toObject(), ...i }, W(i.day) && (A.day = Math.min(Oi(A.year, A.month), A.day))) : A = Tl({ ...nu(this.c), ...i });
    const [J, C] = vi(A, this.o, this.zone);
    return an(this, { ts: J, o: C });
  }
  /**
   * Add a period of time to this DateTime and return the resulting DateTime
   *
   * Adding hours, minutes, seconds, or milliseconds increases the timestamp by the right number of milliseconds. Adding days, months, or years shifts the calendar, accounting for DSTs and leap years along the way. Thus, `dt.plus({ hours: 24 })` may result in a different time than `dt.plus({ days: 1 })` if there's a DST shift in between.
   * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @example DateTime.now().plus(123) //~> in 123 milliseconds
   * @example DateTime.now().plus({ minutes: 15 }) //~> in 15 minutes
   * @example DateTime.now().plus({ days: 1 }) //~> this time tomorrow
   * @example DateTime.now().plus({ days: -1 }) //~> this time yesterday
   * @example DateTime.now().plus({ hours: 3, minutes: 13 }) //~> in 3 hr, 13 min
   * @example DateTime.now().plus(Duration.fromObject({ hours: 3, minutes: 13 })) //~> in 3 hr, 13 min
   * @return {DateTime}
   */
  plus(n) {
    if (!this.isValid) return this;
    const i = z.fromDurationLike(n);
    return an(this, Nl(this, i));
  }
  /**
   * Subtract a period of time to this DateTime and return the resulting DateTime
   * See {@link DateTime#plus}
   * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   @return {DateTime}
   */
  minus(n) {
    if (!this.isValid) return this;
    const i = z.fromDurationLike(n).negate();
    return an(this, Nl(this, i));
  }
  /**
   * "Set" this DateTime to the beginning of a unit of time.
   * @param {string} unit - The unit to go to the beginning of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week
   * @example DateTime.local(2014, 3, 3).startOf('month').toISODate(); //=> '2014-03-01'
   * @example DateTime.local(2014, 3, 3).startOf('year').toISODate(); //=> '2014-01-01'
   * @example DateTime.local(2014, 3, 3).startOf('week').toISODate(); //=> '2014-03-03', weeks always start on Mondays
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('day').toISOTime(); //=> '00:00.000-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('hour').toISOTime(); //=> '05:00:00.000-05:00'
   * @return {DateTime}
   */
  startOf(n, { useLocaleWeeks: i = !1 } = {}) {
    if (!this.isValid) return this;
    const a = {}, l = z.normalizeUnit(n);
    switch (l) {
      case "years":
        a.month = 1;
      // falls through
      case "quarters":
      case "months":
        a.day = 1;
      // falls through
      case "weeks":
      case "days":
        a.hour = 0;
      // falls through
      case "hours":
        a.minute = 0;
      // falls through
      case "minutes":
        a.second = 0;
      // falls through
      case "seconds":
        a.millisecond = 0;
        break;
    }
    if (l === "weeks")
      if (i) {
        const h = this.loc.getStartOfWeek(), { weekday: m } = this;
        m < h && (a.weekNumber = this.weekNumber - 1), a.weekday = h;
      } else
        a.weekday = 1;
    if (l === "quarters") {
      const h = Math.ceil(this.month / 3);
      a.month = (h - 1) * 3 + 1;
    }
    return this.set(a);
  }
  /**
   * "Set" this DateTime to the end (meaning the last millisecond) of a unit of time
   * @param {string} unit - The unit to go to the end of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week
   * @example DateTime.local(2014, 3, 3).endOf('month').toISO(); //=> '2014-03-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3).endOf('year').toISO(); //=> '2014-12-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3).endOf('week').toISO(); // => '2014-03-09T23:59:59.999-05:00', weeks start on Mondays
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('day').toISO(); //=> '2014-03-03T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('hour').toISO(); //=> '2014-03-03T05:59:59.999-05:00'
   * @return {DateTime}
   */
  endOf(n, i) {
    return this.isValid ? this.plus({ [n]: 1 }).startOf(n, i).minus(1) : this;
  }
  // OUTPUT
  /**
   * Returns a string representation of this DateTime formatted according to the specified format string.
   * **You may not want this.** See {@link DateTime#toLocaleString} for a more flexible formatting tool. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).
   * Defaults to en-US if no locale has been specified, regardless of the system's locale.
   * @param {string} fmt - the format string
   * @param {Object} opts - opts to override the configuration options on this DateTime
   * @example DateTime.now().toFormat('yyyy LLL dd') //=> '2017 Apr 22'
   * @example DateTime.now().setLocale('fr').toFormat('yyyy LLL dd') //=> '2017 avr. 22'
   * @example DateTime.now().toFormat('yyyy LLL dd', { locale: "fr" }) //=> '2017 avr. 22'
   * @example DateTime.now().toFormat("HH 'hours and' mm 'minutes'") //=> '20 hours and 55 minutes'
   * @return {string}
   */
  toFormat(n, i = {}) {
    return this.isValid ? Se.create(this.loc.redefaultToEN(i)).formatDateTimeFromString(this, n) : iu;
  }
  /**
   * Returns a localized string representing this date. Accepts the same options as the Intl.DateTimeFormat constructor and any presets defined by Luxon, such as `DateTime.DATE_FULL` or `DateTime.TIME_SIMPLE`.
   * The exact behavior of this method is browser-specific, but in general it will return an appropriate representation
   * of the DateTime in the assigned locale.
   * Defaults to the system's locale if no locale has been specified
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param formatOpts {Object} - Intl.DateTimeFormat constructor options and configuration options
   * @param {Object} opts - opts to override the configuration options on this DateTime
   * @example DateTime.now().toLocaleString(); //=> 4/20/2017
   * @example DateTime.now().setLocale('en-gb').toLocaleString(); //=> '20/04/2017'
   * @example DateTime.now().toLocaleString(DateTime.DATE_FULL); //=> 'April 20, 2017'
   * @example DateTime.now().toLocaleString(DateTime.DATE_FULL, { locale: 'fr' }); //=> '28 août 2022'
   * @example DateTime.now().toLocaleString(DateTime.TIME_SIMPLE); //=> '11:32 AM'
   * @example DateTime.now().toLocaleString(DateTime.DATETIME_SHORT); //=> '4/20/2017, 11:32 AM'
   * @example DateTime.now().toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' }); //=> 'Thursday, April 20'
   * @example DateTime.now().toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> 'Thu, Apr 20, 11:27 AM'
   * @example DateTime.now().toLocaleString({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); //=> '11:32'
   * @return {string}
   */
  toLocaleString(n = Si, i = {}) {
    return this.isValid ? Se.create(this.loc.clone(i), n).formatDateTime(this) : iu;
  }
  /**
   * Returns an array of format "parts", meaning individual tokens along with metadata. This is allows callers to post-process individual sections of the formatted output.
   * Defaults to the system's locale if no locale has been specified
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts
   * @param opts {Object} - Intl.DateTimeFormat constructor options, same as `toLocaleString`.
   * @example DateTime.now().toLocaleParts(); //=> [
   *                                   //=>   { type: 'day', value: '25' },
   *                                   //=>   { type: 'literal', value: '/' },
   *                                   //=>   { type: 'month', value: '05' },
   *                                   //=>   { type: 'literal', value: '/' },
   *                                   //=>   { type: 'year', value: '1982' }
   *                                   //=> ]
   */
  toLocaleParts(n = {}) {
    return this.isValid ? Se.create(this.loc.clone(n), n).formatDateTimeParts(this) : [];
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.extendedZone=false] - add the time zone format extension
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @param {string} [opts.precision='milliseconds'] - truncate output to desired presicion: 'years', 'months', 'days', 'hours', 'minutes', 'seconds' or 'milliseconds'. When precision and suppressSeconds or suppressMilliseconds are used together, precision sets the maximum unit shown in the output, however seconds or milliseconds will still be suppressed if they are 0.
   * @example DateTime.utc(1983, 5, 25).toISO() //=> '1982-05-25T00:00:00.000Z'
   * @example DateTime.now().toISO() //=> '2017-04-22T20:47:05.335-04:00'
   * @example DateTime.now().toISO({ includeOffset: false }) //=> '2017-04-22T20:47:05.335'
   * @example DateTime.now().toISO({ format: 'basic' }) //=> '20170422T204705.335-0400'
   * @example DateTime.now().toISO({ precision: 'day' }) //=> '2017-04-22Z'
   * @example DateTime.now().toISO({ precision: 'minute' }) //=> '2017-04-22T20:47Z'
   * @return {string|null}
   */
  toISO({
    format: n = "extended",
    suppressSeconds: i = !1,
    suppressMilliseconds: a = !1,
    includeOffset: l = !0,
    extendedZone: h = !1,
    precision: m = "milliseconds"
  } = {}) {
    if (!this.isValid)
      return null;
    m = Ti(m);
    const p = n === "extended";
    let v = au(this, p, m);
    return _i.indexOf(m) >= 3 && (v += "T"), v += Fl(
      this,
      p,
      i,
      a,
      l,
      h,
      m
    ), v;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's date component
   * @param {Object} opts - options
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @param {string} [opts.precision='day'] - truncate output to desired precision: 'years', 'months', or 'days'.
   * @example DateTime.utc(1982, 5, 25).toISODate() //=> '1982-05-25'
   * @example DateTime.utc(1982, 5, 25).toISODate({ format: 'basic' }) //=> '19820525'
   * @example DateTime.utc(1982, 5, 25).toISODate({ precision: 'month' }) //=> '1982-05'
   * @return {string|null}
   */
  toISODate({ format: n = "extended", precision: i = "day" } = {}) {
    return this.isValid ? au(this, n === "extended", Ti(i)) : null;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's week date
   * @example DateTime.utc(1982, 5, 25).toISOWeekDate() //=> '1982-W21-2'
   * @return {string}
   */
  toISOWeekDate() {
    return gi(this, "kkkk-'W'WW-c");
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's time component
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.extendedZone=true] - add the time zone format extension
   * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @param {string} [opts.precision='milliseconds'] - truncate output to desired presicion: 'hours', 'minutes', 'seconds' or 'milliseconds'. When precision and suppressSeconds or suppressMilliseconds are used together, precision sets the maximum unit shown in the output, however seconds or milliseconds will still be suppressed if they are 0.
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime() //=> '07:34:19.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34, seconds: 0, milliseconds: 0 }).toISOTime({ suppressSeconds: true }) //=> '07:34Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ format: 'basic' }) //=> '073419.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ includePrefix: true }) //=> 'T07:34:19.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34, second: 56 }).toISOTime({ precision: 'minute' }) //=> '07:34Z'
   * @return {string}
   */
  toISOTime({
    suppressMilliseconds: n = !1,
    suppressSeconds: i = !1,
    includeOffset: a = !0,
    includePrefix: l = !1,
    extendedZone: h = !1,
    format: m = "extended",
    precision: p = "milliseconds"
  } = {}) {
    return this.isValid ? (p = Ti(p), (l && _i.indexOf(p) >= 3 ? "T" : "") + Fl(
      this,
      m === "extended",
      i,
      n,
      a,
      h,
      p
    )) : null;
  }
  /**
   * Returns an RFC 2822-compatible string representation of this DateTime
   * @example DateTime.utc(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 +0000'
   * @example DateTime.local(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 -0400'
   * @return {string}
   */
  toRFC2822() {
    return gi(this, "EEE, dd LLL yyyy HH:mm:ss ZZZ", !1);
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in HTTP headers. The output is always expressed in GMT.
   * Specifically, the string conforms to RFC 1123.
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @example DateTime.utc(2014, 7, 13).toHTTP() //=> 'Sun, 13 Jul 2014 00:00:00 GMT'
   * @example DateTime.utc(2014, 7, 13, 19).toHTTP() //=> 'Sun, 13 Jul 2014 19:00:00 GMT'
   * @return {string}
   */
  toHTTP() {
    return gi(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL Date
   * @example DateTime.utc(2014, 7, 13).toSQLDate() //=> '2014-07-13'
   * @return {string|null}
   */
  toSQLDate() {
    return this.isValid ? au(this, !0) : null;
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL Time
   * @param {Object} opts - options
   * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.includeOffsetSpace=true] - include the space between the time and the offset, such as '05:15:16.345 -04:00'
   * @example DateTime.utc().toSQL() //=> '05:15:16.345'
   * @example DateTime.now().toSQL() //=> '05:15:16.345 -04:00'
   * @example DateTime.now().toSQL({ includeOffset: false }) //=> '05:15:16.345'
   * @example DateTime.now().toSQL({ includeZone: false }) //=> '05:15:16.345 America/New_York'
   * @return {string}
   */
  toSQLTime({ includeOffset: n = !0, includeZone: i = !1, includeOffsetSpace: a = !0 } = {}) {
    let l = "HH:mm:ss.SSS";
    return (i || n) && (a && (l += " "), i ? l += "z" : n && (l += "ZZ")), gi(this, l, !0);
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL DateTime
   * @param {Object} opts - options
   * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.includeOffsetSpace=true] - include the space between the time and the offset, such as '05:15:16.345 -04:00'
   * @example DateTime.utc(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 Z'
   * @example DateTime.local(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 -04:00'
   * @example DateTime.local(2014, 7, 13).toSQL({ includeOffset: false }) //=> '2014-07-13 00:00:00.000'
   * @example DateTime.local(2014, 7, 13).toSQL({ includeZone: true }) //=> '2014-07-13 00:00:00.000 America/New_York'
   * @return {string}
   */
  toSQL(n = {}) {
    return this.isValid ? `${this.toSQLDate()} ${this.toSQLTime(n)}` : null;
  }
  /**
   * Returns a string representation of this DateTime appropriate for debugging
   * @return {string}
   */
  toString() {
    return this.isValid ? this.toISO() : iu;
  }
  /**
   * Returns a string representation of this DateTime appropriate for the REPL.
   * @return {string}
   */
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.isValid ? `DateTime { ts: ${this.toISO()}, zone: ${this.zone.name}, locale: ${this.locale} }` : `DateTime { Invalid, reason: ${this.invalidReason} }`;
  }
  /**
   * Returns the epoch milliseconds of this DateTime. Alias of {@link DateTime#toMillis}
   * @return {number}
   */
  valueOf() {
    return this.toMillis();
  }
  /**
   * Returns the epoch milliseconds of this DateTime.
   * @return {number}
   */
  toMillis() {
    return this.isValid ? this.ts : NaN;
  }
  /**
   * Returns the epoch seconds (including milliseconds in the fractional part) of this DateTime.
   * @return {number}
   */
  toSeconds() {
    return this.isValid ? this.ts / 1e3 : NaN;
  }
  /**
   * Returns the epoch seconds (as a whole number) of this DateTime.
   * @return {number}
   */
  toUnixInteger() {
    return this.isValid ? Math.floor(this.ts / 1e3) : NaN;
  }
  /**
   * Returns an ISO 8601 representation of this DateTime appropriate for use in JSON.
   * @return {string}
   */
  toJSON() {
    return this.toISO();
  }
  /**
   * Returns a BSON serializable equivalent to this DateTime.
   * @return {Date}
   */
  toBSON() {
    return this.toJSDate();
  }
  /**
   * Returns a JavaScript object with this DateTime's year, month, day, and so on.
   * @param opts - options for generating the object
   * @param {boolean} [opts.includeConfig=false] - include configuration attributes in the output
   * @example DateTime.now().toObject() //=> { year: 2017, month: 4, day: 22, hour: 20, minute: 49, second: 42, millisecond: 268 }
   * @return {Object}
   */
  toObject(n = {}) {
    if (!this.isValid) return {};
    const i = { ...this.c };
    return n.includeConfig && (i.outputCalendar = this.outputCalendar, i.numberingSystem = this.loc.numberingSystem, i.locale = this.loc.locale), i;
  }
  /**
   * Returns a JavaScript Date equivalent to this DateTime.
   * @return {Date}
   */
  toJSDate() {
    return new Date(this.isValid ? this.ts : NaN);
  }
  // COMPARE
  /**
   * Return the difference between two DateTimes as a Duration.
   * @param {DateTime} otherDateTime - the DateTime to compare this one to
   * @param {string|string[]} [unit=['milliseconds']] - the unit or array of units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @example
   * var i1 = DateTime.fromISO('1982-05-25T09:45'),
   *     i2 = DateTime.fromISO('1983-10-14T10:30');
   * i2.diff(i1).toObject() //=> { milliseconds: 43807500000 }
   * i2.diff(i1, 'hours').toObject() //=> { hours: 12168.75 }
   * i2.diff(i1, ['months', 'days']).toObject() //=> { months: 16, days: 19.03125 }
   * i2.diff(i1, ['months', 'days', 'hours']).toObject() //=> { months: 16, days: 19, hours: 0.75 }
   * @return {Duration}
   */
  diff(n, i = "milliseconds", a = {}) {
    if (!this.isValid || !n.isValid)
      return z.invalid("created by diffing an invalid DateTime");
    const l = { locale: this.locale, numberingSystem: this.numberingSystem, ...a }, h = w1(i).map(z.normalizeUnit), m = n.valueOf() > this.valueOf(), p = m ? this : n, v = m ? n : this, E = Tw(p, v, h, l);
    return m ? E.negate() : E;
  }
  /**
   * Return the difference between this DateTime and right now.
   * See {@link DateTime#diff}
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units units (such as 'hours' or 'days') to include in the duration
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  diffNow(n = "milliseconds", i = {}) {
    return this.diff(R.now(), n, i);
  }
  /**
   * Return an Interval spanning between this DateTime and another DateTime
   * @param {DateTime} otherDateTime - the other end point of the Interval
   * @return {Interval|DateTime}
   */
  until(n) {
    return this.isValid ? ne.fromDateTimes(this, n) : this;
  }
  /**
   * Return whether this DateTime is in the same unit of time as another DateTime.
   * Higher-order units must also be identical for this function to return `true`.
   * Note that time zones are **ignored** in this comparison, which compares the **local** calendar time. Use {@link DateTime#setZone} to convert one of the dates if needed.
   * @param {DateTime} otherDateTime - the other DateTime
   * @param {string} unit - the unit of time to check sameness on
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week; only the locale of this DateTime is used
   * @example DateTime.now().hasSame(otherDT, 'day'); //~> true if otherDT is in the same current calendar day
   * @return {boolean}
   */
  hasSame(n, i, a) {
    if (!this.isValid) return !1;
    const l = n.valueOf(), h = this.setZone(n.zone, { keepLocalTime: !0 });
    return h.startOf(i, a) <= l && l <= h.endOf(i, a);
  }
  /**
   * Equality check
   * Two DateTimes are equal if and only if they represent the same millisecond, have the same zone and location, and are both valid.
   * To compare just the millisecond values, use `+dt1 === +dt2`.
   * @param {DateTime} other - the other DateTime
   * @return {boolean}
   */
  equals(n) {
    return this.isValid && n.isValid && this.valueOf() === n.valueOf() && this.zone.equals(n.zone) && this.loc.equals(n.loc);
  }
  /**
   * Returns a string representation of a this time relative to now, such as "in two days". Can only internationalize if your
   * platform supports Intl.RelativeTimeFormat. Rounds towards zero by default.
   * @param {Object} options - options that affect the output
   * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
   * @param {string} [options.style="long"] - the style of units, must be "long", "short", or "narrow"
   * @param {string|string[]} options.unit - use a specific unit or array of units; if omitted, or an array, the method will pick the best unit. Use an array or one of "years", "quarters", "months", "weeks", "days", "hours", "minutes", or "seconds"
   * @param {boolean} [options.round=true] - whether to round the numbers in the output.
   * @param {string} [options.rounding="trunc"] - rounding method to use when rounding the numbers in the output. Can be "trunc" (toward zero), "expand" (away from zero), "round", "floor", or "ceil".
   * @param {number} [options.padding=0] - padding in milliseconds. This allows you to round up the result if it fits inside the threshold. Don't use in combination with {round: false} because the decimal output will include the padding.
   * @param {string} options.locale - override the locale of this DateTime
   * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
   * @example DateTime.now().plus({ days: 1 }).toRelative() //=> "in 1 day"
   * @example DateTime.now().setLocale("es").toRelative({ days: 1 }) //=> "dentro de 1 día"
   * @example DateTime.now().plus({ days: 1 }).toRelative({ locale: "fr" }) //=> "dans 23 heures"
   * @example DateTime.now().minus({ days: 2 }).toRelative() //=> "2 days ago"
   * @example DateTime.now().minus({ days: 2 }).toRelative({ unit: "hours" }) //=> "48 hours ago"
   * @example DateTime.now().minus({ hours: 36 }).toRelative({ round: false }) //=> "1.5 days ago"
   */
  toRelative(n = {}) {
    if (!this.isValid) return null;
    const i = n.base || R.fromObject({}, { zone: this.zone }), a = n.padding ? this < i ? -n.padding : n.padding : 0;
    let l = ["years", "months", "days", "hours", "minutes", "seconds"], h = n.unit;
    return Array.isArray(n.unit) && (l = n.unit, h = void 0), Ul(i, this.plus(a), {
      ...n,
      numeric: "always",
      units: l,
      unit: h
    });
  }
  /**
   * Returns a string representation of this date relative to today, such as "yesterday" or "next month".
   * Only internationalizes on platforms that supports Intl.RelativeTimeFormat.
   * @param {Object} options - options that affect the output
   * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
   * @param {string} options.locale - override the locale of this DateTime
   * @param {string} options.unit - use a specific unit; if omitted, the method will pick the unit. Use one of "years", "quarters", "months", "weeks", or "days"
   * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
   * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar() //=> "tomorrow"
   * @example DateTime.now().setLocale("es").plus({ days: 1 }).toRelative() //=> ""mañana"
   * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar({ locale: "fr" }) //=> "demain"
   * @example DateTime.now().minus({ days: 2 }).toRelativeCalendar() //=> "2 days ago"
   */
  toRelativeCalendar(n = {}) {
    return this.isValid ? Ul(n.base || R.fromObject({}, { zone: this.zone }), this, {
      ...n,
      numeric: "auto",
      units: ["years", "months", "days"],
      calendary: !0
    }) : null;
  }
  /**
   * Return the min of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the minimum
   * @return {DateTime} the min DateTime, or undefined if called with no argument
   */
  static min(...n) {
    if (!n.every(R.isDateTime))
      throw new Te("min requires all arguments be DateTimes");
    return xl(n, (i) => i.valueOf(), Math.min);
  }
  /**
   * Return the max of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the maximum
   * @return {DateTime} the max DateTime, or undefined if called with no argument
   */
  static max(...n) {
    if (!n.every(R.isDateTime))
      throw new Te("max requires all arguments be DateTimes");
    return xl(n, (i) => i.valueOf(), Math.max);
  }
  // MISC
  /**
   * Explain how a string would be parsed by fromFormat()
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see description)
   * @param {Object} options - options taken by fromFormat()
   * @return {Object}
   */
  static fromFormatExplain(n, i, a = {}) {
    const { locale: l = null, numberingSystem: h = null } = a, m = X.fromOpts({
      locale: l,
      numberingSystem: h,
      defaultToEN: !0
    });
    return Zf(m, n, i);
  }
  /**
   * @deprecated use fromFormatExplain instead
   */
  static fromStringExplain(n, i, a = {}) {
    return R.fromFormatExplain(n, i, a);
  }
  /**
   * Build a parser for `fmt` using the given locale. This parser can be passed
   * to {@link DateTime.fromFormatParser} to a parse a date in this format. This
   * can be used to optimize cases where many dates need to be parsed in a
   * specific format.
   *
   * @param {String} fmt - the format the string is expected to be in (see
   * description)
   * @param {Object} options - options used to set locale and numberingSystem
   * for parser
   * @returns {TokenParser} - opaque object to be used
   */
  static buildFormatParser(n, i = {}) {
    const { locale: a = null, numberingSystem: l = null } = i, h = X.fromOpts({
      locale: a,
      numberingSystem: l,
      defaultToEN: !0
    });
    return new Pf(h, n);
  }
  /**
   * Create a DateTime from an input string and format parser.
   *
   * The format parser must have been created with the same locale as this call.
   *
   * @param {String} text - the string to parse
   * @param {TokenParser} formatParser - parser from {@link DateTime.buildFormatParser}
   * @param {Object} opts - options taken by fromFormat()
   * @returns {DateTime}
   */
  static fromFormatParser(n, i, a = {}) {
    if (W(n) || W(i))
      throw new Te(
        "fromFormatParser requires an input string and a format parser"
      );
    const { locale: l = null, numberingSystem: h = null } = a, m = X.fromOpts({
      locale: l,
      numberingSystem: h,
      defaultToEN: !0
    });
    if (!m.equals(i.locale))
      throw new Te(
        `fromFormatParser called with a locale of ${m}, but the format parser was created for ${i.locale}`
      );
    const { result: p, zone: v, specificOffset: E, invalidReason: D } = i.explainFromTokens(n);
    return D ? R.invalid(D) : Mn(
      p,
      v,
      a,
      `format ${i.format}`,
      n,
      E
    );
  }
  // FORMAT PRESETS
  /**
   * {@link DateTime#toLocaleString} format like 10/14/1983
   * @type {Object}
   */
  static get DATE_SHORT() {
    return Si;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Oct 14, 1983'
   * @type {Object}
   */
  static get DATE_MED() {
    return Hl;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Fri, Oct 14, 1983'
   * @type {Object}
   */
  static get DATE_MED_WITH_WEEKDAY() {
    return Hy;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'October 14, 1983'
   * @type {Object}
   */
  static get DATE_FULL() {
    return zl;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Tuesday, October 14, 1983'
   * @type {Object}
   */
  static get DATE_HUGE() {
    return ql;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_SIMPLE() {
    return Yl;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_SECONDS() {
    return Jl;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_SHORT_OFFSET() {
    return Kl;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_LONG_OFFSET() {
    return Xl;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_SIMPLE() {
    return Ql;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_SECONDS() {
    return jl;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 EDT', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_SHORT_OFFSET() {
    return ef;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 Eastern Daylight Time', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_LONG_OFFSET() {
    return tf;
  }
  /**
   * {@link DateTime#toLocaleString} format like '10/14/1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_SHORT() {
    return nf;
  }
  /**
   * {@link DateTime#toLocaleString} format like '10/14/1983, 9:30:33 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_SHORT_WITH_SECONDS() {
    return rf;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Oct 14, 1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED() {
    return sf;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Oct 14, 1983, 9:30:33 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED_WITH_SECONDS() {
    return uf;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Fri, 14 Oct 1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED_WITH_WEEKDAY() {
    return zy;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'October 14, 1983, 9:30 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_FULL() {
    return af;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'October 14, 1983, 9:30:33 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_FULL_WITH_SECONDS() {
    return of;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Friday, October 14, 1983, 9:30 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_HUGE() {
    return lf;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Friday, October 14, 1983, 9:30:33 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_HUGE_WITH_SECONDS() {
    return ff;
  }
}
function ur(s) {
  if (R.isDateTime(s))
    return s;
  if (s && s.valueOf && Gt(s.valueOf()))
    return R.fromJSDate(s);
  if (s && typeof s == "object")
    return R.fromObject(s);
  throw new Te(
    `Unknown datetime argument: ${s}, of type ${typeof s}`
  );
}
var $w = /* @__PURE__ */ ((s) => (s.Red = "oklch(63.7% 0.237 25.331)", s.Orange = "oklch(70.5% 0.213 47.604)", s.Amber = "oklch(76.9% 0.188 70.08)", s.Yellow = "oklch(79.5% 0.184 86.047)", s.Lime = "oklch(76.8% 0.233 130.85)", s.Green = "oklch(72.3% 0.219 149.579)", s.Emerald = "oklch(69.6% 0.17 162.48)", s.Teal = "oklch(70.4% 0.14 182.503)", s.Cyan = "oklch(71.5% 0.143 215.221)", s.Sky = "oklch(68.5% 0.169 237.323)", s.Blue = "oklch(62.3% 0.214 259.815)", s.Indigo = "oklch(58.5% 0.233 277.117)", s.Violet = "oklch(60.6% 0.25 292.717)", s.Purple = "oklch(62.7% 0.265 303.9)", s.Fuchsia = "oklch(66.7% 0.295 322.15)", s.Pink = "oklch(65.6% 0.241 354.308)", s.Rose = "oklch(64.5% 0.246 16.439)", s.Slate = "oklch(55.4% 0.046 257.417)", s.Gray = "oklch(55.1% 0.027 264.364)", s.Zinc = "oklch(55.2% 0.016 285.938)", s.Neutral = "oklch(55.6% 0 0)", s.Stone = "oklch(55.3% 0.013 58.071)", s))($w || {});
function Pw(s) {
  return `color: #000; font-weight: bold; background-color: ${s}; padding: 2px 4px; border-radius: 4px;`;
}
function pi(s) {
  return s.flatMap((n) => {
    if (n && typeof n == "object" && "messages" in n && Array.isArray(n.messages)) {
      const i = [];
      if ("title" in n && typeof n.title == "string") {
        i.push(`%c[${n.title}]%c`);
        let a = "oklch(55.4% 0.046 257.417)";
        "titleColor" in n && typeof n.titleColor == "string" && (a = n.titleColor), i.push(Pw(a)), i.push("");
      }
      return i.push(...n.messages), i;
    }
    return n;
  });
}
function yi(s, n) {
  if (zf.wantedLevels.includes(s))
    switch (s) {
      case 0:
        console.error(...pi(n));
        break;
      case 1:
        console.warn(...pi(n));
        break;
      case 2:
        console.info(...pi(n));
        break;
      case 3:
        console.debug(...pi(n));
        break;
    }
}
const zf = {
  wantedLevels: [
    0,
    1
    /* Warn */
  ],
  error: (...s) => yi(0, s),
  warn: (...s) => yi(1, s),
  info: (...s) => yi(2, s),
  debug: (...s) => yi(3, s)
}, ou = {
  /**
   * Default WMTS base part of the URL to use when requesting tiles (e.g. for prod
   * https://wmts.geo.admin.ch/).
   *
   * @see https://github.com/geoadmin/service-wmts
   */
  wmts: {
    development: "https://sys-wmts.dev.bgdi.ch/",
    integration: "https://sys-wmts.int.bgdi.ch/",
    production: "https://wmts.geo.admin.ch/"
  },
  /**
   * Base part of the URL to use when requesting api3 (mf-chsdi3)
   *
   * @see https://github.com/geoadmin/mf-chsdi3
   */
  api3: {
    development: "https://sys-api3.dev.bgdi.ch/",
    integration: "https://sys-api3.int.bgdi.ch/",
    production: "https://api3.geo.admin.ch/"
  },
  /**
   * Base part of the URL to use for saving, updating or getting kml files.
   *
   * @see https://github.com/geoadmin/service-kml
   */
  kml: {
    development: "https://sys-public.dev.bgdi.ch/",
    integration: "https://sys-public.int.bgdi.ch/",
    production: "https://public.geo.admin.ch/"
  }
}, Zw = 0.5;
var wi = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, fr = { exports: {} };
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var Bw = fr.exports, $l;
function Gw() {
  return $l || ($l = 1, function(s, n) {
    (function() {
      var i, a = "4.17.21", l = 200, h = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", m = "Expected a function", p = "Invalid `variable` option passed into `_.template`", v = "__lodash_hash_undefined__", E = 500, D = "__lodash_placeholder__", A = 1, J = 2, C = 4, j = 1, we = 2, ue = 1, Ae = 2, Dt = 4, Be = 8, Ht = 16, Ge = 32, zt = 64, nt = 128, qt = 256, yt = 512, Yt = 30, Ci = "...", Yf = 800, Jf = 16, Du = 1, Kf = 2, Xf = 3, Jt = 1 / 0, Ct = 9007199254740991, Qf = 17976931348623157e292, wr = NaN, dt = 4294967295, jf = dt - 1, ec = dt >>> 1, tc = [
        ["ary", nt],
        ["bind", ue],
        ["bindKey", Ae],
        ["curry", Be],
        ["curryRight", Ht],
        ["flip", yt],
        ["partial", Ge],
        ["partialRight", zt],
        ["rearg", qt]
      ], fn = "[object Arguments]", vr = "[object Array]", nc = "[object AsyncFunction]", Un = "[object Boolean]", Vn = "[object Date]", rc = "[object DOMException]", _r = "[object Error]", Tr = "[object Function]", Cu = "[object GeneratorFunction]", rt = "[object Map]", $n = "[object Number]", ic = "[object Null]", wt = "[object Object]", Lu = "[object Promise]", sc = "[object Proxy]", Pn = "[object RegExp]", it = "[object Set]", Zn = "[object String]", Sr = "[object Symbol]", uc = "[object Undefined]", Bn = "[object WeakMap]", ac = "[object WeakSet]", Gn = "[object ArrayBuffer]", cn = "[object DataView]", Li = "[object Float32Array]", Ai = "[object Float64Array]", Ni = "[object Int8Array]", Fi = "[object Int16Array]", Wi = "[object Int32Array]", Ri = "[object Uint8Array]", Ui = "[object Uint8ClampedArray]", Vi = "[object Uint16Array]", $i = "[object Uint32Array]", oc = /\b__p \+= '';/g, lc = /\b(__p \+=) '' \+/g, fc = /(__e\(.*?\)|\b__t\)) \+\n'';/g, Au = /&(?:amp|lt|gt|quot|#39);/g, Nu = /[&<>"']/g, cc = RegExp(Au.source), hc = RegExp(Nu.source), dc = /<%-([\s\S]+?)%>/g, mc = /<%([\s\S]+?)%>/g, Fu = /<%=([\s\S]+?)%>/g, gc = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, pc = /^\w*$/, yc = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Pi = /[\\^$.*+?()[\]{}|]/g, wc = RegExp(Pi.source), Zi = /^\s+/, vc = /\s/, _c = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, Tc = /\{\n\/\* \[wrapped with (.+)\] \*/, Sc = /,? & /, xc = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, Oc = /[()=,{}\[\]\/\s]/, Ec = /\\(\\)?/g, Ic = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, Wu = /\w*$/, kc = /^[-+]0x[0-9a-f]+$/i, Mc = /^0b[01]+$/i, bc = /^\[object .+?Constructor\]$/, Dc = /^0o[0-7]+$/i, Cc = /^(?:0|[1-9]\d*)$/, Lc = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, xr = /($^)/, Ac = /['\n\r\u2028\u2029\\]/g, Or = "\\ud800-\\udfff", Nc = "\\u0300-\\u036f", Fc = "\\ufe20-\\ufe2f", Wc = "\\u20d0-\\u20ff", Ru = Nc + Fc + Wc, Uu = "\\u2700-\\u27bf", Vu = "a-z\\xdf-\\xf6\\xf8-\\xff", Rc = "\\xac\\xb1\\xd7\\xf7", Uc = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", Vc = "\\u2000-\\u206f", $c = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", $u = "A-Z\\xc0-\\xd6\\xd8-\\xde", Pu = "\\ufe0e\\ufe0f", Zu = Rc + Uc + Vc + $c, Bi = "['’]", Pc = "[" + Or + "]", Bu = "[" + Zu + "]", Er = "[" + Ru + "]", Gu = "\\d+", Zc = "[" + Uu + "]", Hu = "[" + Vu + "]", zu = "[^" + Or + Zu + Gu + Uu + Vu + $u + "]", Gi = "\\ud83c[\\udffb-\\udfff]", Bc = "(?:" + Er + "|" + Gi + ")", qu = "[^" + Or + "]", Hi = "(?:\\ud83c[\\udde6-\\uddff]){2}", zi = "[\\ud800-\\udbff][\\udc00-\\udfff]", hn = "[" + $u + "]", Yu = "\\u200d", Ju = "(?:" + Hu + "|" + zu + ")", Gc = "(?:" + hn + "|" + zu + ")", Ku = "(?:" + Bi + "(?:d|ll|m|re|s|t|ve))?", Xu = "(?:" + Bi + "(?:D|LL|M|RE|S|T|VE))?", Qu = Bc + "?", ju = "[" + Pu + "]?", Hc = "(?:" + Yu + "(?:" + [qu, Hi, zi].join("|") + ")" + ju + Qu + ")*", zc = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", qc = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", ea = ju + Qu + Hc, Yc = "(?:" + [Zc, Hi, zi].join("|") + ")" + ea, Jc = "(?:" + [qu + Er + "?", Er, Hi, zi, Pc].join("|") + ")", Kc = RegExp(Bi, "g"), Xc = RegExp(Er, "g"), qi = RegExp(Gi + "(?=" + Gi + ")|" + Jc + ea, "g"), Qc = RegExp([
        hn + "?" + Hu + "+" + Ku + "(?=" + [Bu, hn, "$"].join("|") + ")",
        Gc + "+" + Xu + "(?=" + [Bu, hn + Ju, "$"].join("|") + ")",
        hn + "?" + Ju + "+" + Ku,
        hn + "+" + Xu,
        qc,
        zc,
        Gu,
        Yc
      ].join("|"), "g"), jc = RegExp("[" + Yu + Or + Ru + Pu + "]"), eh = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, th = [
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
      ], nh = -1, re = {};
      re[Li] = re[Ai] = re[Ni] = re[Fi] = re[Wi] = re[Ri] = re[Ui] = re[Vi] = re[$i] = !0, re[fn] = re[vr] = re[Gn] = re[Un] = re[cn] = re[Vn] = re[_r] = re[Tr] = re[rt] = re[$n] = re[wt] = re[Pn] = re[it] = re[Zn] = re[Bn] = !1;
      var te = {};
      te[fn] = te[vr] = te[Gn] = te[cn] = te[Un] = te[Vn] = te[Li] = te[Ai] = te[Ni] = te[Fi] = te[Wi] = te[rt] = te[$n] = te[wt] = te[Pn] = te[it] = te[Zn] = te[Sr] = te[Ri] = te[Ui] = te[Vi] = te[$i] = !0, te[_r] = te[Tr] = te[Bn] = !1;
      var rh = {
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
      }, ih = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }, sh = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
      }, uh = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      }, ah = parseFloat, oh = parseInt, ta = typeof wi == "object" && wi && wi.Object === Object && wi, lh = typeof self == "object" && self && self.Object === Object && self, ge = ta || lh || Function("return this")(), Yi = n && !n.nodeType && n, Kt = Yi && !0 && s && !s.nodeType && s, na = Kt && Kt.exports === Yi, Ji = na && ta.process, He = function() {
        try {
          var y = Kt && Kt.require && Kt.require("util").types;
          return y || Ji && Ji.binding && Ji.binding("util");
        } catch {
        }
      }(), ra = He && He.isArrayBuffer, ia = He && He.isDate, sa = He && He.isMap, ua = He && He.isRegExp, aa = He && He.isSet, oa = He && He.isTypedArray;
      function Ne(y, T, _) {
        switch (_.length) {
          case 0:
            return y.call(T);
          case 1:
            return y.call(T, _[0]);
          case 2:
            return y.call(T, _[0], _[1]);
          case 3:
            return y.call(T, _[0], _[1], _[2]);
        }
        return y.apply(T, _);
      }
      function fh(y, T, _, M) {
        for (var U = -1, q = y == null ? 0 : y.length; ++U < q; ) {
          var he = y[U];
          T(M, he, _(he), y);
        }
        return M;
      }
      function ze(y, T) {
        for (var _ = -1, M = y == null ? 0 : y.length; ++_ < M && T(y[_], _, y) !== !1; )
          ;
        return y;
      }
      function ch(y, T) {
        for (var _ = y == null ? 0 : y.length; _-- && T(y[_], _, y) !== !1; )
          ;
        return y;
      }
      function la(y, T) {
        for (var _ = -1, M = y == null ? 0 : y.length; ++_ < M; )
          if (!T(y[_], _, y))
            return !1;
        return !0;
      }
      function Lt(y, T) {
        for (var _ = -1, M = y == null ? 0 : y.length, U = 0, q = []; ++_ < M; ) {
          var he = y[_];
          T(he, _, y) && (q[U++] = he);
        }
        return q;
      }
      function Ir(y, T) {
        var _ = y == null ? 0 : y.length;
        return !!_ && dn(y, T, 0) > -1;
      }
      function Ki(y, T, _) {
        for (var M = -1, U = y == null ? 0 : y.length; ++M < U; )
          if (_(T, y[M]))
            return !0;
        return !1;
      }
      function ie(y, T) {
        for (var _ = -1, M = y == null ? 0 : y.length, U = Array(M); ++_ < M; )
          U[_] = T(y[_], _, y);
        return U;
      }
      function At(y, T) {
        for (var _ = -1, M = T.length, U = y.length; ++_ < M; )
          y[U + _] = T[_];
        return y;
      }
      function Xi(y, T, _, M) {
        var U = -1, q = y == null ? 0 : y.length;
        for (M && q && (_ = y[++U]); ++U < q; )
          _ = T(_, y[U], U, y);
        return _;
      }
      function hh(y, T, _, M) {
        var U = y == null ? 0 : y.length;
        for (M && U && (_ = y[--U]); U--; )
          _ = T(_, y[U], U, y);
        return _;
      }
      function Qi(y, T) {
        for (var _ = -1, M = y == null ? 0 : y.length; ++_ < M; )
          if (T(y[_], _, y))
            return !0;
        return !1;
      }
      var dh = ji("length");
      function mh(y) {
        return y.split("");
      }
      function gh(y) {
        return y.match(xc) || [];
      }
      function fa(y, T, _) {
        var M;
        return _(y, function(U, q, he) {
          if (T(U, q, he))
            return M = q, !1;
        }), M;
      }
      function kr(y, T, _, M) {
        for (var U = y.length, q = _ + (M ? 1 : -1); M ? q-- : ++q < U; )
          if (T(y[q], q, y))
            return q;
        return -1;
      }
      function dn(y, T, _) {
        return T === T ? kh(y, T, _) : kr(y, ca, _);
      }
      function ph(y, T, _, M) {
        for (var U = _ - 1, q = y.length; ++U < q; )
          if (M(y[U], T))
            return U;
        return -1;
      }
      function ca(y) {
        return y !== y;
      }
      function ha(y, T) {
        var _ = y == null ? 0 : y.length;
        return _ ? ts(y, T) / _ : wr;
      }
      function ji(y) {
        return function(T) {
          return T == null ? i : T[y];
        };
      }
      function es(y) {
        return function(T) {
          return y == null ? i : y[T];
        };
      }
      function da(y, T, _, M, U) {
        return U(y, function(q, he, ee) {
          _ = M ? (M = !1, q) : T(_, q, he, ee);
        }), _;
      }
      function yh(y, T) {
        var _ = y.length;
        for (y.sort(T); _--; )
          y[_] = y[_].value;
        return y;
      }
      function ts(y, T) {
        for (var _, M = -1, U = y.length; ++M < U; ) {
          var q = T(y[M]);
          q !== i && (_ = _ === i ? q : _ + q);
        }
        return _;
      }
      function ns(y, T) {
        for (var _ = -1, M = Array(y); ++_ < y; )
          M[_] = T(_);
        return M;
      }
      function wh(y, T) {
        return ie(T, function(_) {
          return [_, y[_]];
        });
      }
      function ma(y) {
        return y && y.slice(0, wa(y) + 1).replace(Zi, "");
      }
      function Fe(y) {
        return function(T) {
          return y(T);
        };
      }
      function rs(y, T) {
        return ie(T, function(_) {
          return y[_];
        });
      }
      function Hn(y, T) {
        return y.has(T);
      }
      function ga(y, T) {
        for (var _ = -1, M = y.length; ++_ < M && dn(T, y[_], 0) > -1; )
          ;
        return _;
      }
      function pa(y, T) {
        for (var _ = y.length; _-- && dn(T, y[_], 0) > -1; )
          ;
        return _;
      }
      function vh(y, T) {
        for (var _ = y.length, M = 0; _--; )
          y[_] === T && ++M;
        return M;
      }
      var _h = es(rh), Th = es(ih);
      function Sh(y) {
        return "\\" + uh[y];
      }
      function xh(y, T) {
        return y == null ? i : y[T];
      }
      function mn(y) {
        return jc.test(y);
      }
      function Oh(y) {
        return eh.test(y);
      }
      function Eh(y) {
        for (var T, _ = []; !(T = y.next()).done; )
          _.push(T.value);
        return _;
      }
      function is(y) {
        var T = -1, _ = Array(y.size);
        return y.forEach(function(M, U) {
          _[++T] = [U, M];
        }), _;
      }
      function ya(y, T) {
        return function(_) {
          return y(T(_));
        };
      }
      function Nt(y, T) {
        for (var _ = -1, M = y.length, U = 0, q = []; ++_ < M; ) {
          var he = y[_];
          (he === T || he === D) && (y[_] = D, q[U++] = _);
        }
        return q;
      }
      function Mr(y) {
        var T = -1, _ = Array(y.size);
        return y.forEach(function(M) {
          _[++T] = M;
        }), _;
      }
      function Ih(y) {
        var T = -1, _ = Array(y.size);
        return y.forEach(function(M) {
          _[++T] = [M, M];
        }), _;
      }
      function kh(y, T, _) {
        for (var M = _ - 1, U = y.length; ++M < U; )
          if (y[M] === T)
            return M;
        return -1;
      }
      function Mh(y, T, _) {
        for (var M = _ + 1; M--; )
          if (y[M] === T)
            return M;
        return M;
      }
      function gn(y) {
        return mn(y) ? Dh(y) : dh(y);
      }
      function st(y) {
        return mn(y) ? Ch(y) : mh(y);
      }
      function wa(y) {
        for (var T = y.length; T-- && vc.test(y.charAt(T)); )
          ;
        return T;
      }
      var bh = es(sh);
      function Dh(y) {
        for (var T = qi.lastIndex = 0; qi.test(y); )
          ++T;
        return T;
      }
      function Ch(y) {
        return y.match(qi) || [];
      }
      function Lh(y) {
        return y.match(Qc) || [];
      }
      var Ah = function y(T) {
        T = T == null ? ge : pn.defaults(ge.Object(), T, pn.pick(ge, th));
        var _ = T.Array, M = T.Date, U = T.Error, q = T.Function, he = T.Math, ee = T.Object, ss = T.RegExp, Nh = T.String, qe = T.TypeError, br = _.prototype, Fh = q.prototype, yn = ee.prototype, Dr = T["__core-js_shared__"], Cr = Fh.toString, Q = yn.hasOwnProperty, Wh = 0, va = function() {
          var e = /[^.]+$/.exec(Dr && Dr.keys && Dr.keys.IE_PROTO || "");
          return e ? "Symbol(src)_1." + e : "";
        }(), Lr = yn.toString, Rh = Cr.call(ee), Uh = ge._, Vh = ss(
          "^" + Cr.call(Q).replace(Pi, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), Ar = na ? T.Buffer : i, Ft = T.Symbol, Nr = T.Uint8Array, _a = Ar ? Ar.allocUnsafe : i, Fr = ya(ee.getPrototypeOf, ee), Ta = ee.create, Sa = yn.propertyIsEnumerable, Wr = br.splice, xa = Ft ? Ft.isConcatSpreadable : i, zn = Ft ? Ft.iterator : i, Xt = Ft ? Ft.toStringTag : i, Rr = function() {
          try {
            var e = nn(ee, "defineProperty");
            return e({}, "", {}), e;
          } catch {
          }
        }(), $h = T.clearTimeout !== ge.clearTimeout && T.clearTimeout, Ph = M && M.now !== ge.Date.now && M.now, Zh = T.setTimeout !== ge.setTimeout && T.setTimeout, Ur = he.ceil, Vr = he.floor, us = ee.getOwnPropertySymbols, Bh = Ar ? Ar.isBuffer : i, Oa = T.isFinite, Gh = br.join, Hh = ya(ee.keys, ee), de = he.max, ve = he.min, zh = M.now, qh = T.parseInt, Ea = he.random, Yh = br.reverse, as = nn(T, "DataView"), qn = nn(T, "Map"), os = nn(T, "Promise"), wn = nn(T, "Set"), Yn = nn(T, "WeakMap"), Jn = nn(ee, "create"), $r = Yn && new Yn(), vn = {}, Jh = rn(as), Kh = rn(qn), Xh = rn(os), Qh = rn(wn), jh = rn(Yn), Pr = Ft ? Ft.prototype : i, Kn = Pr ? Pr.valueOf : i, Ia = Pr ? Pr.toString : i;
        function f(e) {
          if (ae(e) && !V(e) && !(e instanceof G)) {
            if (e instanceof Ye)
              return e;
            if (Q.call(e, "__wrapped__"))
              return Mo(e);
          }
          return new Ye(e);
        }
        var _n = /* @__PURE__ */ function() {
          function e() {
          }
          return function(t) {
            if (!se(t))
              return {};
            if (Ta)
              return Ta(t);
            e.prototype = t;
            var r = new e();
            return e.prototype = i, r;
          };
        }();
        function Zr() {
        }
        function Ye(e, t) {
          this.__wrapped__ = e, this.__actions__ = [], this.__chain__ = !!t, this.__index__ = 0, this.__values__ = i;
        }
        f.templateSettings = {
          /**
           * Used to detect `data` property values to be HTML-escaped.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          escape: dc,
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          evaluate: mc,
          /**
           * Used to detect `data` property values to inject.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          interpolate: Fu,
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
            _: f
          }
        }, f.prototype = Zr.prototype, f.prototype.constructor = f, Ye.prototype = _n(Zr.prototype), Ye.prototype.constructor = Ye;
        function G(e) {
          this.__wrapped__ = e, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = dt, this.__views__ = [];
        }
        function ed() {
          var e = new G(this.__wrapped__);
          return e.__actions__ = be(this.__actions__), e.__dir__ = this.__dir__, e.__filtered__ = this.__filtered__, e.__iteratees__ = be(this.__iteratees__), e.__takeCount__ = this.__takeCount__, e.__views__ = be(this.__views__), e;
        }
        function td() {
          if (this.__filtered__) {
            var e = new G(this);
            e.__dir__ = -1, e.__filtered__ = !0;
          } else
            e = this.clone(), e.__dir__ *= -1;
          return e;
        }
        function nd() {
          var e = this.__wrapped__.value(), t = this.__dir__, r = V(e), u = t < 0, o = r ? e.length : 0, c = mm(0, o, this.__views__), d = c.start, g = c.end, w = g - d, S = u ? g : d - 1, x = this.__iteratees__, O = x.length, I = 0, b = ve(w, this.__takeCount__);
          if (!r || !u && o == w && b == w)
            return Ka(e, this.__actions__);
          var N = [];
          e:
            for (; w-- && I < b; ) {
              S += t;
              for (var P = -1, F = e[S]; ++P < O; ) {
                var B = x[P], H = B.iteratee, Ue = B.type, Ee = H(F);
                if (Ue == Kf)
                  F = Ee;
                else if (!Ee) {
                  if (Ue == Du)
                    continue e;
                  break e;
                }
              }
              N[I++] = F;
            }
          return N;
        }
        G.prototype = _n(Zr.prototype), G.prototype.constructor = G;
        function Qt(e) {
          var t = -1, r = e == null ? 0 : e.length;
          for (this.clear(); ++t < r; ) {
            var u = e[t];
            this.set(u[0], u[1]);
          }
        }
        function rd() {
          this.__data__ = Jn ? Jn(null) : {}, this.size = 0;
        }
        function id(e) {
          var t = this.has(e) && delete this.__data__[e];
          return this.size -= t ? 1 : 0, t;
        }
        function sd(e) {
          var t = this.__data__;
          if (Jn) {
            var r = t[e];
            return r === v ? i : r;
          }
          return Q.call(t, e) ? t[e] : i;
        }
        function ud(e) {
          var t = this.__data__;
          return Jn ? t[e] !== i : Q.call(t, e);
        }
        function ad(e, t) {
          var r = this.__data__;
          return this.size += this.has(e) ? 0 : 1, r[e] = Jn && t === i ? v : t, this;
        }
        Qt.prototype.clear = rd, Qt.prototype.delete = id, Qt.prototype.get = sd, Qt.prototype.has = ud, Qt.prototype.set = ad;
        function vt(e) {
          var t = -1, r = e == null ? 0 : e.length;
          for (this.clear(); ++t < r; ) {
            var u = e[t];
            this.set(u[0], u[1]);
          }
        }
        function od() {
          this.__data__ = [], this.size = 0;
        }
        function ld(e) {
          var t = this.__data__, r = Br(t, e);
          if (r < 0)
            return !1;
          var u = t.length - 1;
          return r == u ? t.pop() : Wr.call(t, r, 1), --this.size, !0;
        }
        function fd(e) {
          var t = this.__data__, r = Br(t, e);
          return r < 0 ? i : t[r][1];
        }
        function cd(e) {
          return Br(this.__data__, e) > -1;
        }
        function hd(e, t) {
          var r = this.__data__, u = Br(r, e);
          return u < 0 ? (++this.size, r.push([e, t])) : r[u][1] = t, this;
        }
        vt.prototype.clear = od, vt.prototype.delete = ld, vt.prototype.get = fd, vt.prototype.has = cd, vt.prototype.set = hd;
        function _t(e) {
          var t = -1, r = e == null ? 0 : e.length;
          for (this.clear(); ++t < r; ) {
            var u = e[t];
            this.set(u[0], u[1]);
          }
        }
        function dd() {
          this.size = 0, this.__data__ = {
            hash: new Qt(),
            map: new (qn || vt)(),
            string: new Qt()
          };
        }
        function md(e) {
          var t = ti(this, e).delete(e);
          return this.size -= t ? 1 : 0, t;
        }
        function gd(e) {
          return ti(this, e).get(e);
        }
        function pd(e) {
          return ti(this, e).has(e);
        }
        function yd(e, t) {
          var r = ti(this, e), u = r.size;
          return r.set(e, t), this.size += r.size == u ? 0 : 1, this;
        }
        _t.prototype.clear = dd, _t.prototype.delete = md, _t.prototype.get = gd, _t.prototype.has = pd, _t.prototype.set = yd;
        function jt(e) {
          var t = -1, r = e == null ? 0 : e.length;
          for (this.__data__ = new _t(); ++t < r; )
            this.add(e[t]);
        }
        function wd(e) {
          return this.__data__.set(e, v), this;
        }
        function vd(e) {
          return this.__data__.has(e);
        }
        jt.prototype.add = jt.prototype.push = wd, jt.prototype.has = vd;
        function ut(e) {
          var t = this.__data__ = new vt(e);
          this.size = t.size;
        }
        function _d() {
          this.__data__ = new vt(), this.size = 0;
        }
        function Td(e) {
          var t = this.__data__, r = t.delete(e);
          return this.size = t.size, r;
        }
        function Sd(e) {
          return this.__data__.get(e);
        }
        function xd(e) {
          return this.__data__.has(e);
        }
        function Od(e, t) {
          var r = this.__data__;
          if (r instanceof vt) {
            var u = r.__data__;
            if (!qn || u.length < l - 1)
              return u.push([e, t]), this.size = ++r.size, this;
            r = this.__data__ = new _t(u);
          }
          return r.set(e, t), this.size = r.size, this;
        }
        ut.prototype.clear = _d, ut.prototype.delete = Td, ut.prototype.get = Sd, ut.prototype.has = xd, ut.prototype.set = Od;
        function ka(e, t) {
          var r = V(e), u = !r && sn(e), o = !r && !u && $t(e), c = !r && !u && !o && On(e), d = r || u || o || c, g = d ? ns(e.length, Nh) : [], w = g.length;
          for (var S in e)
            (t || Q.call(e, S)) && !(d && // Safari 9 has enumerable `arguments.length` in strict mode.
            (S == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            o && (S == "offset" || S == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            c && (S == "buffer" || S == "byteLength" || S == "byteOffset") || // Skip index properties.
            Ot(S, w))) && g.push(S);
          return g;
        }
        function Ma(e) {
          var t = e.length;
          return t ? e[vs(0, t - 1)] : i;
        }
        function Ed(e, t) {
          return ni(be(e), en(t, 0, e.length));
        }
        function Id(e) {
          return ni(be(e));
        }
        function ls(e, t, r) {
          (r !== i && !at(e[t], r) || r === i && !(t in e)) && Tt(e, t, r);
        }
        function Xn(e, t, r) {
          var u = e[t];
          (!(Q.call(e, t) && at(u, r)) || r === i && !(t in e)) && Tt(e, t, r);
        }
        function Br(e, t) {
          for (var r = e.length; r--; )
            if (at(e[r][0], t))
              return r;
          return -1;
        }
        function kd(e, t, r, u) {
          return Wt(e, function(o, c, d) {
            t(u, o, r(o), d);
          }), u;
        }
        function ba(e, t) {
          return e && gt(t, me(t), e);
        }
        function Md(e, t) {
          return e && gt(t, Ce(t), e);
        }
        function Tt(e, t, r) {
          t == "__proto__" && Rr ? Rr(e, t, {
            configurable: !0,
            enumerable: !0,
            value: r,
            writable: !0
          }) : e[t] = r;
        }
        function fs(e, t) {
          for (var r = -1, u = t.length, o = _(u), c = e == null; ++r < u; )
            o[r] = c ? i : Gs(e, t[r]);
          return o;
        }
        function en(e, t, r) {
          return e === e && (r !== i && (e = e <= r ? e : r), t !== i && (e = e >= t ? e : t)), e;
        }
        function Je(e, t, r, u, o, c) {
          var d, g = t & A, w = t & J, S = t & C;
          if (r && (d = o ? r(e, u, o, c) : r(e)), d !== i)
            return d;
          if (!se(e))
            return e;
          var x = V(e);
          if (x) {
            if (d = pm(e), !g)
              return be(e, d);
          } else {
            var O = _e(e), I = O == Tr || O == Cu;
            if ($t(e))
              return ja(e, g);
            if (O == wt || O == fn || I && !o) {
              if (d = w || I ? {} : vo(e), !g)
                return w ? sm(e, Md(d, e)) : im(e, ba(d, e));
            } else {
              if (!te[O])
                return o ? e : {};
              d = ym(e, O, g);
            }
          }
          c || (c = new ut());
          var b = c.get(e);
          if (b)
            return b;
          c.set(e, d), Yo(e) ? e.forEach(function(F) {
            d.add(Je(F, t, r, F, e, c));
          }) : zo(e) && e.forEach(function(F, B) {
            d.set(B, Je(F, t, r, B, e, c));
          });
          var N = S ? w ? Ds : bs : w ? Ce : me, P = x ? i : N(e);
          return ze(P || e, function(F, B) {
            P && (B = F, F = e[B]), Xn(d, B, Je(F, t, r, B, e, c));
          }), d;
        }
        function bd(e) {
          var t = me(e);
          return function(r) {
            return Da(r, e, t);
          };
        }
        function Da(e, t, r) {
          var u = r.length;
          if (e == null)
            return !u;
          for (e = ee(e); u--; ) {
            var o = r[u], c = t[o], d = e[o];
            if (d === i && !(o in e) || !c(d))
              return !1;
          }
          return !0;
        }
        function Ca(e, t, r) {
          if (typeof e != "function")
            throw new qe(m);
          return ir(function() {
            e.apply(i, r);
          }, t);
        }
        function Qn(e, t, r, u) {
          var o = -1, c = Ir, d = !0, g = e.length, w = [], S = t.length;
          if (!g)
            return w;
          r && (t = ie(t, Fe(r))), u ? (c = Ki, d = !1) : t.length >= l && (c = Hn, d = !1, t = new jt(t));
          e:
            for (; ++o < g; ) {
              var x = e[o], O = r == null ? x : r(x);
              if (x = u || x !== 0 ? x : 0, d && O === O) {
                for (var I = S; I--; )
                  if (t[I] === O)
                    continue e;
                w.push(x);
              } else c(t, O, u) || w.push(x);
            }
          return w;
        }
        var Wt = io(mt), La = io(hs, !0);
        function Dd(e, t) {
          var r = !0;
          return Wt(e, function(u, o, c) {
            return r = !!t(u, o, c), r;
          }), r;
        }
        function Gr(e, t, r) {
          for (var u = -1, o = e.length; ++u < o; ) {
            var c = e[u], d = t(c);
            if (d != null && (g === i ? d === d && !Re(d) : r(d, g)))
              var g = d, w = c;
          }
          return w;
        }
        function Cd(e, t, r, u) {
          var o = e.length;
          for (r = $(r), r < 0 && (r = -r > o ? 0 : o + r), u = u === i || u > o ? o : $(u), u < 0 && (u += o), u = r > u ? 0 : Ko(u); r < u; )
            e[r++] = t;
          return e;
        }
        function Aa(e, t) {
          var r = [];
          return Wt(e, function(u, o, c) {
            t(u, o, c) && r.push(u);
          }), r;
        }
        function pe(e, t, r, u, o) {
          var c = -1, d = e.length;
          for (r || (r = vm), o || (o = []); ++c < d; ) {
            var g = e[c];
            t > 0 && r(g) ? t > 1 ? pe(g, t - 1, r, u, o) : At(o, g) : u || (o[o.length] = g);
          }
          return o;
        }
        var cs = so(), Na = so(!0);
        function mt(e, t) {
          return e && cs(e, t, me);
        }
        function hs(e, t) {
          return e && Na(e, t, me);
        }
        function Hr(e, t) {
          return Lt(t, function(r) {
            return Et(e[r]);
          });
        }
        function tn(e, t) {
          t = Ut(t, e);
          for (var r = 0, u = t.length; e != null && r < u; )
            e = e[pt(t[r++])];
          return r && r == u ? e : i;
        }
        function Fa(e, t, r) {
          var u = t(e);
          return V(e) ? u : At(u, r(e));
        }
        function xe(e) {
          return e == null ? e === i ? uc : ic : Xt && Xt in ee(e) ? dm(e) : Im(e);
        }
        function ds(e, t) {
          return e > t;
        }
        function Ld(e, t) {
          return e != null && Q.call(e, t);
        }
        function Ad(e, t) {
          return e != null && t in ee(e);
        }
        function Nd(e, t, r) {
          return e >= ve(t, r) && e < de(t, r);
        }
        function ms(e, t, r) {
          for (var u = r ? Ki : Ir, o = e[0].length, c = e.length, d = c, g = _(c), w = 1 / 0, S = []; d--; ) {
            var x = e[d];
            d && t && (x = ie(x, Fe(t))), w = ve(x.length, w), g[d] = !r && (t || o >= 120 && x.length >= 120) ? new jt(d && x) : i;
          }
          x = e[0];
          var O = -1, I = g[0];
          e:
            for (; ++O < o && S.length < w; ) {
              var b = x[O], N = t ? t(b) : b;
              if (b = r || b !== 0 ? b : 0, !(I ? Hn(I, N) : u(S, N, r))) {
                for (d = c; --d; ) {
                  var P = g[d];
                  if (!(P ? Hn(P, N) : u(e[d], N, r)))
                    continue e;
                }
                I && I.push(N), S.push(b);
              }
            }
          return S;
        }
        function Fd(e, t, r, u) {
          return mt(e, function(o, c, d) {
            t(u, r(o), c, d);
          }), u;
        }
        function jn(e, t, r) {
          t = Ut(t, e), e = xo(e, t);
          var u = e == null ? e : e[pt(Xe(t))];
          return u == null ? i : Ne(u, e, r);
        }
        function Wa(e) {
          return ae(e) && xe(e) == fn;
        }
        function Wd(e) {
          return ae(e) && xe(e) == Gn;
        }
        function Rd(e) {
          return ae(e) && xe(e) == Vn;
        }
        function er(e, t, r, u, o) {
          return e === t ? !0 : e == null || t == null || !ae(e) && !ae(t) ? e !== e && t !== t : Ud(e, t, r, u, er, o);
        }
        function Ud(e, t, r, u, o, c) {
          var d = V(e), g = V(t), w = d ? vr : _e(e), S = g ? vr : _e(t);
          w = w == fn ? wt : w, S = S == fn ? wt : S;
          var x = w == wt, O = S == wt, I = w == S;
          if (I && $t(e)) {
            if (!$t(t))
              return !1;
            d = !0, x = !1;
          }
          if (I && !x)
            return c || (c = new ut()), d || On(e) ? po(e, t, r, u, o, c) : cm(e, t, w, r, u, o, c);
          if (!(r & j)) {
            var b = x && Q.call(e, "__wrapped__"), N = O && Q.call(t, "__wrapped__");
            if (b || N) {
              var P = b ? e.value() : e, F = N ? t.value() : t;
              return c || (c = new ut()), o(P, F, r, u, c);
            }
          }
          return I ? (c || (c = new ut()), hm(e, t, r, u, o, c)) : !1;
        }
        function Vd(e) {
          return ae(e) && _e(e) == rt;
        }
        function gs(e, t, r, u) {
          var o = r.length, c = o, d = !u;
          if (e == null)
            return !c;
          for (e = ee(e); o--; ) {
            var g = r[o];
            if (d && g[2] ? g[1] !== e[g[0]] : !(g[0] in e))
              return !1;
          }
          for (; ++o < c; ) {
            g = r[o];
            var w = g[0], S = e[w], x = g[1];
            if (d && g[2]) {
              if (S === i && !(w in e))
                return !1;
            } else {
              var O = new ut();
              if (u)
                var I = u(S, x, w, e, t, O);
              if (!(I === i ? er(x, S, j | we, u, O) : I))
                return !1;
            }
          }
          return !0;
        }
        function Ra(e) {
          if (!se(e) || Tm(e))
            return !1;
          var t = Et(e) ? Vh : bc;
          return t.test(rn(e));
        }
        function $d(e) {
          return ae(e) && xe(e) == Pn;
        }
        function Pd(e) {
          return ae(e) && _e(e) == it;
        }
        function Zd(e) {
          return ae(e) && oi(e.length) && !!re[xe(e)];
        }
        function Ua(e) {
          return typeof e == "function" ? e : e == null ? Le : typeof e == "object" ? V(e) ? Pa(e[0], e[1]) : $a(e) : al(e);
        }
        function ps(e) {
          if (!rr(e))
            return Hh(e);
          var t = [];
          for (var r in ee(e))
            Q.call(e, r) && r != "constructor" && t.push(r);
          return t;
        }
        function Bd(e) {
          if (!se(e))
            return Em(e);
          var t = rr(e), r = [];
          for (var u in e)
            u == "constructor" && (t || !Q.call(e, u)) || r.push(u);
          return r;
        }
        function ys(e, t) {
          return e < t;
        }
        function Va(e, t) {
          var r = -1, u = De(e) ? _(e.length) : [];
          return Wt(e, function(o, c, d) {
            u[++r] = t(o, c, d);
          }), u;
        }
        function $a(e) {
          var t = Ls(e);
          return t.length == 1 && t[0][2] ? To(t[0][0], t[0][1]) : function(r) {
            return r === e || gs(r, e, t);
          };
        }
        function Pa(e, t) {
          return Ns(e) && _o(t) ? To(pt(e), t) : function(r) {
            var u = Gs(r, e);
            return u === i && u === t ? Hs(r, e) : er(t, u, j | we);
          };
        }
        function zr(e, t, r, u, o) {
          e !== t && cs(t, function(c, d) {
            if (o || (o = new ut()), se(c))
              Gd(e, t, d, r, zr, u, o);
            else {
              var g = u ? u(Ws(e, d), c, d + "", e, t, o) : i;
              g === i && (g = c), ls(e, d, g);
            }
          }, Ce);
        }
        function Gd(e, t, r, u, o, c, d) {
          var g = Ws(e, r), w = Ws(t, r), S = d.get(w);
          if (S) {
            ls(e, r, S);
            return;
          }
          var x = c ? c(g, w, r + "", e, t, d) : i, O = x === i;
          if (O) {
            var I = V(w), b = !I && $t(w), N = !I && !b && On(w);
            x = w, I || b || N ? V(g) ? x = g : le(g) ? x = be(g) : b ? (O = !1, x = ja(w, !0)) : N ? (O = !1, x = eo(w, !0)) : x = [] : sr(w) || sn(w) ? (x = g, sn(g) ? x = Xo(g) : (!se(g) || Et(g)) && (x = vo(w))) : O = !1;
          }
          O && (d.set(w, x), o(x, w, u, c, d), d.delete(w)), ls(e, r, x);
        }
        function Za(e, t) {
          var r = e.length;
          if (r)
            return t += t < 0 ? r : 0, Ot(t, r) ? e[t] : i;
        }
        function Ba(e, t, r) {
          t.length ? t = ie(t, function(c) {
            return V(c) ? function(d) {
              return tn(d, c.length === 1 ? c[0] : c);
            } : c;
          }) : t = [Le];
          var u = -1;
          t = ie(t, Fe(L()));
          var o = Va(e, function(c, d, g) {
            var w = ie(t, function(S) {
              return S(c);
            });
            return { criteria: w, index: ++u, value: c };
          });
          return yh(o, function(c, d) {
            return rm(c, d, r);
          });
        }
        function Hd(e, t) {
          return Ga(e, t, function(r, u) {
            return Hs(e, u);
          });
        }
        function Ga(e, t, r) {
          for (var u = -1, o = t.length, c = {}; ++u < o; ) {
            var d = t[u], g = tn(e, d);
            r(g, d) && tr(c, Ut(d, e), g);
          }
          return c;
        }
        function zd(e) {
          return function(t) {
            return tn(t, e);
          };
        }
        function ws(e, t, r, u) {
          var o = u ? ph : dn, c = -1, d = t.length, g = e;
          for (e === t && (t = be(t)), r && (g = ie(e, Fe(r))); ++c < d; )
            for (var w = 0, S = t[c], x = r ? r(S) : S; (w = o(g, x, w, u)) > -1; )
              g !== e && Wr.call(g, w, 1), Wr.call(e, w, 1);
          return e;
        }
        function Ha(e, t) {
          for (var r = e ? t.length : 0, u = r - 1; r--; ) {
            var o = t[r];
            if (r == u || o !== c) {
              var c = o;
              Ot(o) ? Wr.call(e, o, 1) : Ss(e, o);
            }
          }
          return e;
        }
        function vs(e, t) {
          return e + Vr(Ea() * (t - e + 1));
        }
        function qd(e, t, r, u) {
          for (var o = -1, c = de(Ur((t - e) / (r || 1)), 0), d = _(c); c--; )
            d[u ? c : ++o] = e, e += r;
          return d;
        }
        function _s(e, t) {
          var r = "";
          if (!e || t < 1 || t > Ct)
            return r;
          do
            t % 2 && (r += e), t = Vr(t / 2), t && (e += e);
          while (t);
          return r;
        }
        function Z(e, t) {
          return Rs(So(e, t, Le), e + "");
        }
        function Yd(e) {
          return Ma(En(e));
        }
        function Jd(e, t) {
          var r = En(e);
          return ni(r, en(t, 0, r.length));
        }
        function tr(e, t, r, u) {
          if (!se(e))
            return e;
          t = Ut(t, e);
          for (var o = -1, c = t.length, d = c - 1, g = e; g != null && ++o < c; ) {
            var w = pt(t[o]), S = r;
            if (w === "__proto__" || w === "constructor" || w === "prototype")
              return e;
            if (o != d) {
              var x = g[w];
              S = u ? u(x, w, g) : i, S === i && (S = se(x) ? x : Ot(t[o + 1]) ? [] : {});
            }
            Xn(g, w, S), g = g[w];
          }
          return e;
        }
        var za = $r ? function(e, t) {
          return $r.set(e, t), e;
        } : Le, Kd = Rr ? function(e, t) {
          return Rr(e, "toString", {
            configurable: !0,
            enumerable: !1,
            value: qs(t),
            writable: !0
          });
        } : Le;
        function Xd(e) {
          return ni(En(e));
        }
        function Ke(e, t, r) {
          var u = -1, o = e.length;
          t < 0 && (t = -t > o ? 0 : o + t), r = r > o ? o : r, r < 0 && (r += o), o = t > r ? 0 : r - t >>> 0, t >>>= 0;
          for (var c = _(o); ++u < o; )
            c[u] = e[u + t];
          return c;
        }
        function Qd(e, t) {
          var r;
          return Wt(e, function(u, o, c) {
            return r = t(u, o, c), !r;
          }), !!r;
        }
        function qr(e, t, r) {
          var u = 0, o = e == null ? u : e.length;
          if (typeof t == "number" && t === t && o <= ec) {
            for (; u < o; ) {
              var c = u + o >>> 1, d = e[c];
              d !== null && !Re(d) && (r ? d <= t : d < t) ? u = c + 1 : o = c;
            }
            return o;
          }
          return Ts(e, t, Le, r);
        }
        function Ts(e, t, r, u) {
          var o = 0, c = e == null ? 0 : e.length;
          if (c === 0)
            return 0;
          t = r(t);
          for (var d = t !== t, g = t === null, w = Re(t), S = t === i; o < c; ) {
            var x = Vr((o + c) / 2), O = r(e[x]), I = O !== i, b = O === null, N = O === O, P = Re(O);
            if (d)
              var F = u || N;
            else S ? F = N && (u || I) : g ? F = N && I && (u || !b) : w ? F = N && I && !b && (u || !P) : b || P ? F = !1 : F = u ? O <= t : O < t;
            F ? o = x + 1 : c = x;
          }
          return ve(c, jf);
        }
        function qa(e, t) {
          for (var r = -1, u = e.length, o = 0, c = []; ++r < u; ) {
            var d = e[r], g = t ? t(d) : d;
            if (!r || !at(g, w)) {
              var w = g;
              c[o++] = d === 0 ? 0 : d;
            }
          }
          return c;
        }
        function Ya(e) {
          return typeof e == "number" ? e : Re(e) ? wr : +e;
        }
        function We(e) {
          if (typeof e == "string")
            return e;
          if (V(e))
            return ie(e, We) + "";
          if (Re(e))
            return Ia ? Ia.call(e) : "";
          var t = e + "";
          return t == "0" && 1 / e == -Jt ? "-0" : t;
        }
        function Rt(e, t, r) {
          var u = -1, o = Ir, c = e.length, d = !0, g = [], w = g;
          if (r)
            d = !1, o = Ki;
          else if (c >= l) {
            var S = t ? null : lm(e);
            if (S)
              return Mr(S);
            d = !1, o = Hn, w = new jt();
          } else
            w = t ? [] : g;
          e:
            for (; ++u < c; ) {
              var x = e[u], O = t ? t(x) : x;
              if (x = r || x !== 0 ? x : 0, d && O === O) {
                for (var I = w.length; I--; )
                  if (w[I] === O)
                    continue e;
                t && w.push(O), g.push(x);
              } else o(w, O, r) || (w !== g && w.push(O), g.push(x));
            }
          return g;
        }
        function Ss(e, t) {
          return t = Ut(t, e), e = xo(e, t), e == null || delete e[pt(Xe(t))];
        }
        function Ja(e, t, r, u) {
          return tr(e, t, r(tn(e, t)), u);
        }
        function Yr(e, t, r, u) {
          for (var o = e.length, c = u ? o : -1; (u ? c-- : ++c < o) && t(e[c], c, e); )
            ;
          return r ? Ke(e, u ? 0 : c, u ? c + 1 : o) : Ke(e, u ? c + 1 : 0, u ? o : c);
        }
        function Ka(e, t) {
          var r = e;
          return r instanceof G && (r = r.value()), Xi(t, function(u, o) {
            return o.func.apply(o.thisArg, At([u], o.args));
          }, r);
        }
        function xs(e, t, r) {
          var u = e.length;
          if (u < 2)
            return u ? Rt(e[0]) : [];
          for (var o = -1, c = _(u); ++o < u; )
            for (var d = e[o], g = -1; ++g < u; )
              g != o && (c[o] = Qn(c[o] || d, e[g], t, r));
          return Rt(pe(c, 1), t, r);
        }
        function Xa(e, t, r) {
          for (var u = -1, o = e.length, c = t.length, d = {}; ++u < o; ) {
            var g = u < c ? t[u] : i;
            r(d, e[u], g);
          }
          return d;
        }
        function Os(e) {
          return le(e) ? e : [];
        }
        function Es(e) {
          return typeof e == "function" ? e : Le;
        }
        function Ut(e, t) {
          return V(e) ? e : Ns(e, t) ? [e] : ko(K(e));
        }
        var jd = Z;
        function Vt(e, t, r) {
          var u = e.length;
          return r = r === i ? u : r, !t && r >= u ? e : Ke(e, t, r);
        }
        var Qa = $h || function(e) {
          return ge.clearTimeout(e);
        };
        function ja(e, t) {
          if (t)
            return e.slice();
          var r = e.length, u = _a ? _a(r) : new e.constructor(r);
          return e.copy(u), u;
        }
        function Is(e) {
          var t = new e.constructor(e.byteLength);
          return new Nr(t).set(new Nr(e)), t;
        }
        function em(e, t) {
          var r = t ? Is(e.buffer) : e.buffer;
          return new e.constructor(r, e.byteOffset, e.byteLength);
        }
        function tm(e) {
          var t = new e.constructor(e.source, Wu.exec(e));
          return t.lastIndex = e.lastIndex, t;
        }
        function nm(e) {
          return Kn ? ee(Kn.call(e)) : {};
        }
        function eo(e, t) {
          var r = t ? Is(e.buffer) : e.buffer;
          return new e.constructor(r, e.byteOffset, e.length);
        }
        function to(e, t) {
          if (e !== t) {
            var r = e !== i, u = e === null, o = e === e, c = Re(e), d = t !== i, g = t === null, w = t === t, S = Re(t);
            if (!g && !S && !c && e > t || c && d && w && !g && !S || u && d && w || !r && w || !o)
              return 1;
            if (!u && !c && !S && e < t || S && r && o && !u && !c || g && r && o || !d && o || !w)
              return -1;
          }
          return 0;
        }
        function rm(e, t, r) {
          for (var u = -1, o = e.criteria, c = t.criteria, d = o.length, g = r.length; ++u < d; ) {
            var w = to(o[u], c[u]);
            if (w) {
              if (u >= g)
                return w;
              var S = r[u];
              return w * (S == "desc" ? -1 : 1);
            }
          }
          return e.index - t.index;
        }
        function no(e, t, r, u) {
          for (var o = -1, c = e.length, d = r.length, g = -1, w = t.length, S = de(c - d, 0), x = _(w + S), O = !u; ++g < w; )
            x[g] = t[g];
          for (; ++o < d; )
            (O || o < c) && (x[r[o]] = e[o]);
          for (; S--; )
            x[g++] = e[o++];
          return x;
        }
        function ro(e, t, r, u) {
          for (var o = -1, c = e.length, d = -1, g = r.length, w = -1, S = t.length, x = de(c - g, 0), O = _(x + S), I = !u; ++o < x; )
            O[o] = e[o];
          for (var b = o; ++w < S; )
            O[b + w] = t[w];
          for (; ++d < g; )
            (I || o < c) && (O[b + r[d]] = e[o++]);
          return O;
        }
        function be(e, t) {
          var r = -1, u = e.length;
          for (t || (t = _(u)); ++r < u; )
            t[r] = e[r];
          return t;
        }
        function gt(e, t, r, u) {
          var o = !r;
          r || (r = {});
          for (var c = -1, d = t.length; ++c < d; ) {
            var g = t[c], w = u ? u(r[g], e[g], g, r, e) : i;
            w === i && (w = e[g]), o ? Tt(r, g, w) : Xn(r, g, w);
          }
          return r;
        }
        function im(e, t) {
          return gt(e, As(e), t);
        }
        function sm(e, t) {
          return gt(e, yo(e), t);
        }
        function Jr(e, t) {
          return function(r, u) {
            var o = V(r) ? fh : kd, c = t ? t() : {};
            return o(r, e, L(u, 2), c);
          };
        }
        function Tn(e) {
          return Z(function(t, r) {
            var u = -1, o = r.length, c = o > 1 ? r[o - 1] : i, d = o > 2 ? r[2] : i;
            for (c = e.length > 3 && typeof c == "function" ? (o--, c) : i, d && Oe(r[0], r[1], d) && (c = o < 3 ? i : c, o = 1), t = ee(t); ++u < o; ) {
              var g = r[u];
              g && e(t, g, u, c);
            }
            return t;
          });
        }
        function io(e, t) {
          return function(r, u) {
            if (r == null)
              return r;
            if (!De(r))
              return e(r, u);
            for (var o = r.length, c = t ? o : -1, d = ee(r); (t ? c-- : ++c < o) && u(d[c], c, d) !== !1; )
              ;
            return r;
          };
        }
        function so(e) {
          return function(t, r, u) {
            for (var o = -1, c = ee(t), d = u(t), g = d.length; g--; ) {
              var w = d[e ? g : ++o];
              if (r(c[w], w, c) === !1)
                break;
            }
            return t;
          };
        }
        function um(e, t, r) {
          var u = t & ue, o = nr(e);
          function c() {
            var d = this && this !== ge && this instanceof c ? o : e;
            return d.apply(u ? r : this, arguments);
          }
          return c;
        }
        function uo(e) {
          return function(t) {
            t = K(t);
            var r = mn(t) ? st(t) : i, u = r ? r[0] : t.charAt(0), o = r ? Vt(r, 1).join("") : t.slice(1);
            return u[e]() + o;
          };
        }
        function Sn(e) {
          return function(t) {
            return Xi(sl(il(t).replace(Kc, "")), e, "");
          };
        }
        function nr(e) {
          return function() {
            var t = arguments;
            switch (t.length) {
              case 0:
                return new e();
              case 1:
                return new e(t[0]);
              case 2:
                return new e(t[0], t[1]);
              case 3:
                return new e(t[0], t[1], t[2]);
              case 4:
                return new e(t[0], t[1], t[2], t[3]);
              case 5:
                return new e(t[0], t[1], t[2], t[3], t[4]);
              case 6:
                return new e(t[0], t[1], t[2], t[3], t[4], t[5]);
              case 7:
                return new e(t[0], t[1], t[2], t[3], t[4], t[5], t[6]);
            }
            var r = _n(e.prototype), u = e.apply(r, t);
            return se(u) ? u : r;
          };
        }
        function am(e, t, r) {
          var u = nr(e);
          function o() {
            for (var c = arguments.length, d = _(c), g = c, w = xn(o); g--; )
              d[g] = arguments[g];
            var S = c < 3 && d[0] !== w && d[c - 1] !== w ? [] : Nt(d, w);
            if (c -= S.length, c < r)
              return co(
                e,
                t,
                Kr,
                o.placeholder,
                i,
                d,
                S,
                i,
                i,
                r - c
              );
            var x = this && this !== ge && this instanceof o ? u : e;
            return Ne(x, this, d);
          }
          return o;
        }
        function ao(e) {
          return function(t, r, u) {
            var o = ee(t);
            if (!De(t)) {
              var c = L(r, 3);
              t = me(t), r = function(g) {
                return c(o[g], g, o);
              };
            }
            var d = e(t, r, u);
            return d > -1 ? o[c ? t[d] : d] : i;
          };
        }
        function oo(e) {
          return xt(function(t) {
            var r = t.length, u = r, o = Ye.prototype.thru;
            for (e && t.reverse(); u--; ) {
              var c = t[u];
              if (typeof c != "function")
                throw new qe(m);
              if (o && !d && ei(c) == "wrapper")
                var d = new Ye([], !0);
            }
            for (u = d ? u : r; ++u < r; ) {
              c = t[u];
              var g = ei(c), w = g == "wrapper" ? Cs(c) : i;
              w && Fs(w[0]) && w[1] == (nt | Be | Ge | qt) && !w[4].length && w[9] == 1 ? d = d[ei(w[0])].apply(d, w[3]) : d = c.length == 1 && Fs(c) ? d[g]() : d.thru(c);
            }
            return function() {
              var S = arguments, x = S[0];
              if (d && S.length == 1 && V(x))
                return d.plant(x).value();
              for (var O = 0, I = r ? t[O].apply(this, S) : x; ++O < r; )
                I = t[O].call(this, I);
              return I;
            };
          });
        }
        function Kr(e, t, r, u, o, c, d, g, w, S) {
          var x = t & nt, O = t & ue, I = t & Ae, b = t & (Be | Ht), N = t & yt, P = I ? i : nr(e);
          function F() {
            for (var B = arguments.length, H = _(B), Ue = B; Ue--; )
              H[Ue] = arguments[Ue];
            if (b)
              var Ee = xn(F), Ve = vh(H, Ee);
            if (u && (H = no(H, u, o, b)), c && (H = ro(H, c, d, b)), B -= Ve, b && B < S) {
              var fe = Nt(H, Ee);
              return co(
                e,
                t,
                Kr,
                F.placeholder,
                r,
                H,
                fe,
                g,
                w,
                S - B
              );
            }
            var ot = O ? r : this, kt = I ? ot[e] : e;
            return B = H.length, g ? H = km(H, g) : N && B > 1 && H.reverse(), x && w < B && (H.length = w), this && this !== ge && this instanceof F && (kt = P || nr(kt)), kt.apply(ot, H);
          }
          return F;
        }
        function lo(e, t) {
          return function(r, u) {
            return Fd(r, e, t(u), {});
          };
        }
        function Xr(e, t) {
          return function(r, u) {
            var o;
            if (r === i && u === i)
              return t;
            if (r !== i && (o = r), u !== i) {
              if (o === i)
                return u;
              typeof r == "string" || typeof u == "string" ? (r = We(r), u = We(u)) : (r = Ya(r), u = Ya(u)), o = e(r, u);
            }
            return o;
          };
        }
        function ks(e) {
          return xt(function(t) {
            return t = ie(t, Fe(L())), Z(function(r) {
              var u = this;
              return e(t, function(o) {
                return Ne(o, u, r);
              });
            });
          });
        }
        function Qr(e, t) {
          t = t === i ? " " : We(t);
          var r = t.length;
          if (r < 2)
            return r ? _s(t, e) : t;
          var u = _s(t, Ur(e / gn(t)));
          return mn(t) ? Vt(st(u), 0, e).join("") : u.slice(0, e);
        }
        function om(e, t, r, u) {
          var o = t & ue, c = nr(e);
          function d() {
            for (var g = -1, w = arguments.length, S = -1, x = u.length, O = _(x + w), I = this && this !== ge && this instanceof d ? c : e; ++S < x; )
              O[S] = u[S];
            for (; w--; )
              O[S++] = arguments[++g];
            return Ne(I, o ? r : this, O);
          }
          return d;
        }
        function fo(e) {
          return function(t, r, u) {
            return u && typeof u != "number" && Oe(t, r, u) && (r = u = i), t = It(t), r === i ? (r = t, t = 0) : r = It(r), u = u === i ? t < r ? 1 : -1 : It(u), qd(t, r, u, e);
          };
        }
        function jr(e) {
          return function(t, r) {
            return typeof t == "string" && typeof r == "string" || (t = Qe(t), r = Qe(r)), e(t, r);
          };
        }
        function co(e, t, r, u, o, c, d, g, w, S) {
          var x = t & Be, O = x ? d : i, I = x ? i : d, b = x ? c : i, N = x ? i : c;
          t |= x ? Ge : zt, t &= ~(x ? zt : Ge), t & Dt || (t &= -4);
          var P = [
            e,
            t,
            o,
            b,
            O,
            N,
            I,
            g,
            w,
            S
          ], F = r.apply(i, P);
          return Fs(e) && Oo(F, P), F.placeholder = u, Eo(F, e, t);
        }
        function Ms(e) {
          var t = he[e];
          return function(r, u) {
            if (r = Qe(r), u = u == null ? 0 : ve($(u), 292), u && Oa(r)) {
              var o = (K(r) + "e").split("e"), c = t(o[0] + "e" + (+o[1] + u));
              return o = (K(c) + "e").split("e"), +(o[0] + "e" + (+o[1] - u));
            }
            return t(r);
          };
        }
        var lm = wn && 1 / Mr(new wn([, -0]))[1] == Jt ? function(e) {
          return new wn(e);
        } : Ks;
        function ho(e) {
          return function(t) {
            var r = _e(t);
            return r == rt ? is(t) : r == it ? Ih(t) : wh(t, e(t));
          };
        }
        function St(e, t, r, u, o, c, d, g) {
          var w = t & Ae;
          if (!w && typeof e != "function")
            throw new qe(m);
          var S = u ? u.length : 0;
          if (S || (t &= -97, u = o = i), d = d === i ? d : de($(d), 0), g = g === i ? g : $(g), S -= o ? o.length : 0, t & zt) {
            var x = u, O = o;
            u = o = i;
          }
          var I = w ? i : Cs(e), b = [
            e,
            t,
            r,
            u,
            o,
            x,
            O,
            c,
            d,
            g
          ];
          if (I && Om(b, I), e = b[0], t = b[1], r = b[2], u = b[3], o = b[4], g = b[9] = b[9] === i ? w ? 0 : e.length : de(b[9] - S, 0), !g && t & (Be | Ht) && (t &= -25), !t || t == ue)
            var N = um(e, t, r);
          else t == Be || t == Ht ? N = am(e, t, g) : (t == Ge || t == (ue | Ge)) && !o.length ? N = om(e, t, r, u) : N = Kr.apply(i, b);
          var P = I ? za : Oo;
          return Eo(P(N, b), e, t);
        }
        function mo(e, t, r, u) {
          return e === i || at(e, yn[r]) && !Q.call(u, r) ? t : e;
        }
        function go(e, t, r, u, o, c) {
          return se(e) && se(t) && (c.set(t, e), zr(e, t, i, go, c), c.delete(t)), e;
        }
        function fm(e) {
          return sr(e) ? i : e;
        }
        function po(e, t, r, u, o, c) {
          var d = r & j, g = e.length, w = t.length;
          if (g != w && !(d && w > g))
            return !1;
          var S = c.get(e), x = c.get(t);
          if (S && x)
            return S == t && x == e;
          var O = -1, I = !0, b = r & we ? new jt() : i;
          for (c.set(e, t), c.set(t, e); ++O < g; ) {
            var N = e[O], P = t[O];
            if (u)
              var F = d ? u(P, N, O, t, e, c) : u(N, P, O, e, t, c);
            if (F !== i) {
              if (F)
                continue;
              I = !1;
              break;
            }
            if (b) {
              if (!Qi(t, function(B, H) {
                if (!Hn(b, H) && (N === B || o(N, B, r, u, c)))
                  return b.push(H);
              })) {
                I = !1;
                break;
              }
            } else if (!(N === P || o(N, P, r, u, c))) {
              I = !1;
              break;
            }
          }
          return c.delete(e), c.delete(t), I;
        }
        function cm(e, t, r, u, o, c, d) {
          switch (r) {
            case cn:
              if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset)
                return !1;
              e = e.buffer, t = t.buffer;
            case Gn:
              return !(e.byteLength != t.byteLength || !c(new Nr(e), new Nr(t)));
            case Un:
            case Vn:
            case $n:
              return at(+e, +t);
            case _r:
              return e.name == t.name && e.message == t.message;
            case Pn:
            case Zn:
              return e == t + "";
            case rt:
              var g = is;
            case it:
              var w = u & j;
              if (g || (g = Mr), e.size != t.size && !w)
                return !1;
              var S = d.get(e);
              if (S)
                return S == t;
              u |= we, d.set(e, t);
              var x = po(g(e), g(t), u, o, c, d);
              return d.delete(e), x;
            case Sr:
              if (Kn)
                return Kn.call(e) == Kn.call(t);
          }
          return !1;
        }
        function hm(e, t, r, u, o, c) {
          var d = r & j, g = bs(e), w = g.length, S = bs(t), x = S.length;
          if (w != x && !d)
            return !1;
          for (var O = w; O--; ) {
            var I = g[O];
            if (!(d ? I in t : Q.call(t, I)))
              return !1;
          }
          var b = c.get(e), N = c.get(t);
          if (b && N)
            return b == t && N == e;
          var P = !0;
          c.set(e, t), c.set(t, e);
          for (var F = d; ++O < w; ) {
            I = g[O];
            var B = e[I], H = t[I];
            if (u)
              var Ue = d ? u(H, B, I, t, e, c) : u(B, H, I, e, t, c);
            if (!(Ue === i ? B === H || o(B, H, r, u, c) : Ue)) {
              P = !1;
              break;
            }
            F || (F = I == "constructor");
          }
          if (P && !F) {
            var Ee = e.constructor, Ve = t.constructor;
            Ee != Ve && "constructor" in e && "constructor" in t && !(typeof Ee == "function" && Ee instanceof Ee && typeof Ve == "function" && Ve instanceof Ve) && (P = !1);
          }
          return c.delete(e), c.delete(t), P;
        }
        function xt(e) {
          return Rs(So(e, i, Co), e + "");
        }
        function bs(e) {
          return Fa(e, me, As);
        }
        function Ds(e) {
          return Fa(e, Ce, yo);
        }
        var Cs = $r ? function(e) {
          return $r.get(e);
        } : Ks;
        function ei(e) {
          for (var t = e.name + "", r = vn[t], u = Q.call(vn, t) ? r.length : 0; u--; ) {
            var o = r[u], c = o.func;
            if (c == null || c == e)
              return o.name;
          }
          return t;
        }
        function xn(e) {
          var t = Q.call(f, "placeholder") ? f : e;
          return t.placeholder;
        }
        function L() {
          var e = f.iteratee || Ys;
          return e = e === Ys ? Ua : e, arguments.length ? e(arguments[0], arguments[1]) : e;
        }
        function ti(e, t) {
          var r = e.__data__;
          return _m(t) ? r[typeof t == "string" ? "string" : "hash"] : r.map;
        }
        function Ls(e) {
          for (var t = me(e), r = t.length; r--; ) {
            var u = t[r], o = e[u];
            t[r] = [u, o, _o(o)];
          }
          return t;
        }
        function nn(e, t) {
          var r = xh(e, t);
          return Ra(r) ? r : i;
        }
        function dm(e) {
          var t = Q.call(e, Xt), r = e[Xt];
          try {
            e[Xt] = i;
            var u = !0;
          } catch {
          }
          var o = Lr.call(e);
          return u && (t ? e[Xt] = r : delete e[Xt]), o;
        }
        var As = us ? function(e) {
          return e == null ? [] : (e = ee(e), Lt(us(e), function(t) {
            return Sa.call(e, t);
          }));
        } : Xs, yo = us ? function(e) {
          for (var t = []; e; )
            At(t, As(e)), e = Fr(e);
          return t;
        } : Xs, _e = xe;
        (as && _e(new as(new ArrayBuffer(1))) != cn || qn && _e(new qn()) != rt || os && _e(os.resolve()) != Lu || wn && _e(new wn()) != it || Yn && _e(new Yn()) != Bn) && (_e = function(e) {
          var t = xe(e), r = t == wt ? e.constructor : i, u = r ? rn(r) : "";
          if (u)
            switch (u) {
              case Jh:
                return cn;
              case Kh:
                return rt;
              case Xh:
                return Lu;
              case Qh:
                return it;
              case jh:
                return Bn;
            }
          return t;
        });
        function mm(e, t, r) {
          for (var u = -1, o = r.length; ++u < o; ) {
            var c = r[u], d = c.size;
            switch (c.type) {
              case "drop":
                e += d;
                break;
              case "dropRight":
                t -= d;
                break;
              case "take":
                t = ve(t, e + d);
                break;
              case "takeRight":
                e = de(e, t - d);
                break;
            }
          }
          return { start: e, end: t };
        }
        function gm(e) {
          var t = e.match(Tc);
          return t ? t[1].split(Sc) : [];
        }
        function wo(e, t, r) {
          t = Ut(t, e);
          for (var u = -1, o = t.length, c = !1; ++u < o; ) {
            var d = pt(t[u]);
            if (!(c = e != null && r(e, d)))
              break;
            e = e[d];
          }
          return c || ++u != o ? c : (o = e == null ? 0 : e.length, !!o && oi(o) && Ot(d, o) && (V(e) || sn(e)));
        }
        function pm(e) {
          var t = e.length, r = new e.constructor(t);
          return t && typeof e[0] == "string" && Q.call(e, "index") && (r.index = e.index, r.input = e.input), r;
        }
        function vo(e) {
          return typeof e.constructor == "function" && !rr(e) ? _n(Fr(e)) : {};
        }
        function ym(e, t, r) {
          var u = e.constructor;
          switch (t) {
            case Gn:
              return Is(e);
            case Un:
            case Vn:
              return new u(+e);
            case cn:
              return em(e, r);
            case Li:
            case Ai:
            case Ni:
            case Fi:
            case Wi:
            case Ri:
            case Ui:
            case Vi:
            case $i:
              return eo(e, r);
            case rt:
              return new u();
            case $n:
            case Zn:
              return new u(e);
            case Pn:
              return tm(e);
            case it:
              return new u();
            case Sr:
              return nm(e);
          }
        }
        function wm(e, t) {
          var r = t.length;
          if (!r)
            return e;
          var u = r - 1;
          return t[u] = (r > 1 ? "& " : "") + t[u], t = t.join(r > 2 ? ", " : " "), e.replace(_c, `{
/* [wrapped with ` + t + `] */
`);
        }
        function vm(e) {
          return V(e) || sn(e) || !!(xa && e && e[xa]);
        }
        function Ot(e, t) {
          var r = typeof e;
          return t = t ?? Ct, !!t && (r == "number" || r != "symbol" && Cc.test(e)) && e > -1 && e % 1 == 0 && e < t;
        }
        function Oe(e, t, r) {
          if (!se(r))
            return !1;
          var u = typeof t;
          return (u == "number" ? De(r) && Ot(t, r.length) : u == "string" && t in r) ? at(r[t], e) : !1;
        }
        function Ns(e, t) {
          if (V(e))
            return !1;
          var r = typeof e;
          return r == "number" || r == "symbol" || r == "boolean" || e == null || Re(e) ? !0 : pc.test(e) || !gc.test(e) || t != null && e in ee(t);
        }
        function _m(e) {
          var t = typeof e;
          return t == "string" || t == "number" || t == "symbol" || t == "boolean" ? e !== "__proto__" : e === null;
        }
        function Fs(e) {
          var t = ei(e), r = f[t];
          if (typeof r != "function" || !(t in G.prototype))
            return !1;
          if (e === r)
            return !0;
          var u = Cs(r);
          return !!u && e === u[0];
        }
        function Tm(e) {
          return !!va && va in e;
        }
        var Sm = Dr ? Et : Qs;
        function rr(e) {
          var t = e && e.constructor, r = typeof t == "function" && t.prototype || yn;
          return e === r;
        }
        function _o(e) {
          return e === e && !se(e);
        }
        function To(e, t) {
          return function(r) {
            return r == null ? !1 : r[e] === t && (t !== i || e in ee(r));
          };
        }
        function xm(e) {
          var t = ui(e, function(u) {
            return r.size === E && r.clear(), u;
          }), r = t.cache;
          return t;
        }
        function Om(e, t) {
          var r = e[1], u = t[1], o = r | u, c = o < (ue | Ae | nt), d = u == nt && r == Be || u == nt && r == qt && e[7].length <= t[8] || u == (nt | qt) && t[7].length <= t[8] && r == Be;
          if (!(c || d))
            return e;
          u & ue && (e[2] = t[2], o |= r & ue ? 0 : Dt);
          var g = t[3];
          if (g) {
            var w = e[3];
            e[3] = w ? no(w, g, t[4]) : g, e[4] = w ? Nt(e[3], D) : t[4];
          }
          return g = t[5], g && (w = e[5], e[5] = w ? ro(w, g, t[6]) : g, e[6] = w ? Nt(e[5], D) : t[6]), g = t[7], g && (e[7] = g), u & nt && (e[8] = e[8] == null ? t[8] : ve(e[8], t[8])), e[9] == null && (e[9] = t[9]), e[0] = t[0], e[1] = o, e;
        }
        function Em(e) {
          var t = [];
          if (e != null)
            for (var r in ee(e))
              t.push(r);
          return t;
        }
        function Im(e) {
          return Lr.call(e);
        }
        function So(e, t, r) {
          return t = de(t === i ? e.length - 1 : t, 0), function() {
            for (var u = arguments, o = -1, c = de(u.length - t, 0), d = _(c); ++o < c; )
              d[o] = u[t + o];
            o = -1;
            for (var g = _(t + 1); ++o < t; )
              g[o] = u[o];
            return g[t] = r(d), Ne(e, this, g);
          };
        }
        function xo(e, t) {
          return t.length < 2 ? e : tn(e, Ke(t, 0, -1));
        }
        function km(e, t) {
          for (var r = e.length, u = ve(t.length, r), o = be(e); u--; ) {
            var c = t[u];
            e[u] = Ot(c, r) ? o[c] : i;
          }
          return e;
        }
        function Ws(e, t) {
          if (!(t === "constructor" && typeof e[t] == "function") && t != "__proto__")
            return e[t];
        }
        var Oo = Io(za), ir = Zh || function(e, t) {
          return ge.setTimeout(e, t);
        }, Rs = Io(Kd);
        function Eo(e, t, r) {
          var u = t + "";
          return Rs(e, wm(u, Mm(gm(u), r)));
        }
        function Io(e) {
          var t = 0, r = 0;
          return function() {
            var u = zh(), o = Jf - (u - r);
            if (r = u, o > 0) {
              if (++t >= Yf)
                return arguments[0];
            } else
              t = 0;
            return e.apply(i, arguments);
          };
        }
        function ni(e, t) {
          var r = -1, u = e.length, o = u - 1;
          for (t = t === i ? u : t; ++r < t; ) {
            var c = vs(r, o), d = e[c];
            e[c] = e[r], e[r] = d;
          }
          return e.length = t, e;
        }
        var ko = xm(function(e) {
          var t = [];
          return e.charCodeAt(0) === 46 && t.push(""), e.replace(yc, function(r, u, o, c) {
            t.push(o ? c.replace(Ec, "$1") : u || r);
          }), t;
        });
        function pt(e) {
          if (typeof e == "string" || Re(e))
            return e;
          var t = e + "";
          return t == "0" && 1 / e == -Jt ? "-0" : t;
        }
        function rn(e) {
          if (e != null) {
            try {
              return Cr.call(e);
            } catch {
            }
            try {
              return e + "";
            } catch {
            }
          }
          return "";
        }
        function Mm(e, t) {
          return ze(tc, function(r) {
            var u = "_." + r[0];
            t & r[1] && !Ir(e, u) && e.push(u);
          }), e.sort();
        }
        function Mo(e) {
          if (e instanceof G)
            return e.clone();
          var t = new Ye(e.__wrapped__, e.__chain__);
          return t.__actions__ = be(e.__actions__), t.__index__ = e.__index__, t.__values__ = e.__values__, t;
        }
        function bm(e, t, r) {
          (r ? Oe(e, t, r) : t === i) ? t = 1 : t = de($(t), 0);
          var u = e == null ? 0 : e.length;
          if (!u || t < 1)
            return [];
          for (var o = 0, c = 0, d = _(Ur(u / t)); o < u; )
            d[c++] = Ke(e, o, o += t);
          return d;
        }
        function Dm(e) {
          for (var t = -1, r = e == null ? 0 : e.length, u = 0, o = []; ++t < r; ) {
            var c = e[t];
            c && (o[u++] = c);
          }
          return o;
        }
        function Cm() {
          var e = arguments.length;
          if (!e)
            return [];
          for (var t = _(e - 1), r = arguments[0], u = e; u--; )
            t[u - 1] = arguments[u];
          return At(V(r) ? be(r) : [r], pe(t, 1));
        }
        var Lm = Z(function(e, t) {
          return le(e) ? Qn(e, pe(t, 1, le, !0)) : [];
        }), Am = Z(function(e, t) {
          var r = Xe(t);
          return le(r) && (r = i), le(e) ? Qn(e, pe(t, 1, le, !0), L(r, 2)) : [];
        }), Nm = Z(function(e, t) {
          var r = Xe(t);
          return le(r) && (r = i), le(e) ? Qn(e, pe(t, 1, le, !0), i, r) : [];
        });
        function Fm(e, t, r) {
          var u = e == null ? 0 : e.length;
          return u ? (t = r || t === i ? 1 : $(t), Ke(e, t < 0 ? 0 : t, u)) : [];
        }
        function Wm(e, t, r) {
          var u = e == null ? 0 : e.length;
          return u ? (t = r || t === i ? 1 : $(t), t = u - t, Ke(e, 0, t < 0 ? 0 : t)) : [];
        }
        function Rm(e, t) {
          return e && e.length ? Yr(e, L(t, 3), !0, !0) : [];
        }
        function Um(e, t) {
          return e && e.length ? Yr(e, L(t, 3), !0) : [];
        }
        function Vm(e, t, r, u) {
          var o = e == null ? 0 : e.length;
          return o ? (r && typeof r != "number" && Oe(e, t, r) && (r = 0, u = o), Cd(e, t, r, u)) : [];
        }
        function bo(e, t, r) {
          var u = e == null ? 0 : e.length;
          if (!u)
            return -1;
          var o = r == null ? 0 : $(r);
          return o < 0 && (o = de(u + o, 0)), kr(e, L(t, 3), o);
        }
        function Do(e, t, r) {
          var u = e == null ? 0 : e.length;
          if (!u)
            return -1;
          var o = u - 1;
          return r !== i && (o = $(r), o = r < 0 ? de(u + o, 0) : ve(o, u - 1)), kr(e, L(t, 3), o, !0);
        }
        function Co(e) {
          var t = e == null ? 0 : e.length;
          return t ? pe(e, 1) : [];
        }
        function $m(e) {
          var t = e == null ? 0 : e.length;
          return t ? pe(e, Jt) : [];
        }
        function Pm(e, t) {
          var r = e == null ? 0 : e.length;
          return r ? (t = t === i ? 1 : $(t), pe(e, t)) : [];
        }
        function Zm(e) {
          for (var t = -1, r = e == null ? 0 : e.length, u = {}; ++t < r; ) {
            var o = e[t];
            u[o[0]] = o[1];
          }
          return u;
        }
        function Lo(e) {
          return e && e.length ? e[0] : i;
        }
        function Bm(e, t, r) {
          var u = e == null ? 0 : e.length;
          if (!u)
            return -1;
          var o = r == null ? 0 : $(r);
          return o < 0 && (o = de(u + o, 0)), dn(e, t, o);
        }
        function Gm(e) {
          var t = e == null ? 0 : e.length;
          return t ? Ke(e, 0, -1) : [];
        }
        var Hm = Z(function(e) {
          var t = ie(e, Os);
          return t.length && t[0] === e[0] ? ms(t) : [];
        }), zm = Z(function(e) {
          var t = Xe(e), r = ie(e, Os);
          return t === Xe(r) ? t = i : r.pop(), r.length && r[0] === e[0] ? ms(r, L(t, 2)) : [];
        }), qm = Z(function(e) {
          var t = Xe(e), r = ie(e, Os);
          return t = typeof t == "function" ? t : i, t && r.pop(), r.length && r[0] === e[0] ? ms(r, i, t) : [];
        });
        function Ym(e, t) {
          return e == null ? "" : Gh.call(e, t);
        }
        function Xe(e) {
          var t = e == null ? 0 : e.length;
          return t ? e[t - 1] : i;
        }
        function Jm(e, t, r) {
          var u = e == null ? 0 : e.length;
          if (!u)
            return -1;
          var o = u;
          return r !== i && (o = $(r), o = o < 0 ? de(u + o, 0) : ve(o, u - 1)), t === t ? Mh(e, t, o) : kr(e, ca, o, !0);
        }
        function Km(e, t) {
          return e && e.length ? Za(e, $(t)) : i;
        }
        var Xm = Z(Ao);
        function Ao(e, t) {
          return e && e.length && t && t.length ? ws(e, t) : e;
        }
        function Qm(e, t, r) {
          return e && e.length && t && t.length ? ws(e, t, L(r, 2)) : e;
        }
        function jm(e, t, r) {
          return e && e.length && t && t.length ? ws(e, t, i, r) : e;
        }
        var eg = xt(function(e, t) {
          var r = e == null ? 0 : e.length, u = fs(e, t);
          return Ha(e, ie(t, function(o) {
            return Ot(o, r) ? +o : o;
          }).sort(to)), u;
        });
        function tg(e, t) {
          var r = [];
          if (!(e && e.length))
            return r;
          var u = -1, o = [], c = e.length;
          for (t = L(t, 3); ++u < c; ) {
            var d = e[u];
            t(d, u, e) && (r.push(d), o.push(u));
          }
          return Ha(e, o), r;
        }
        function Us(e) {
          return e == null ? e : Yh.call(e);
        }
        function ng(e, t, r) {
          var u = e == null ? 0 : e.length;
          return u ? (r && typeof r != "number" && Oe(e, t, r) ? (t = 0, r = u) : (t = t == null ? 0 : $(t), r = r === i ? u : $(r)), Ke(e, t, r)) : [];
        }
        function rg(e, t) {
          return qr(e, t);
        }
        function ig(e, t, r) {
          return Ts(e, t, L(r, 2));
        }
        function sg(e, t) {
          var r = e == null ? 0 : e.length;
          if (r) {
            var u = qr(e, t);
            if (u < r && at(e[u], t))
              return u;
          }
          return -1;
        }
        function ug(e, t) {
          return qr(e, t, !0);
        }
        function ag(e, t, r) {
          return Ts(e, t, L(r, 2), !0);
        }
        function og(e, t) {
          var r = e == null ? 0 : e.length;
          if (r) {
            var u = qr(e, t, !0) - 1;
            if (at(e[u], t))
              return u;
          }
          return -1;
        }
        function lg(e) {
          return e && e.length ? qa(e) : [];
        }
        function fg(e, t) {
          return e && e.length ? qa(e, L(t, 2)) : [];
        }
        function cg(e) {
          var t = e == null ? 0 : e.length;
          return t ? Ke(e, 1, t) : [];
        }
        function hg(e, t, r) {
          return e && e.length ? (t = r || t === i ? 1 : $(t), Ke(e, 0, t < 0 ? 0 : t)) : [];
        }
        function dg(e, t, r) {
          var u = e == null ? 0 : e.length;
          return u ? (t = r || t === i ? 1 : $(t), t = u - t, Ke(e, t < 0 ? 0 : t, u)) : [];
        }
        function mg(e, t) {
          return e && e.length ? Yr(e, L(t, 3), !1, !0) : [];
        }
        function gg(e, t) {
          return e && e.length ? Yr(e, L(t, 3)) : [];
        }
        var pg = Z(function(e) {
          return Rt(pe(e, 1, le, !0));
        }), yg = Z(function(e) {
          var t = Xe(e);
          return le(t) && (t = i), Rt(pe(e, 1, le, !0), L(t, 2));
        }), wg = Z(function(e) {
          var t = Xe(e);
          return t = typeof t == "function" ? t : i, Rt(pe(e, 1, le, !0), i, t);
        });
        function vg(e) {
          return e && e.length ? Rt(e) : [];
        }
        function _g(e, t) {
          return e && e.length ? Rt(e, L(t, 2)) : [];
        }
        function Tg(e, t) {
          return t = typeof t == "function" ? t : i, e && e.length ? Rt(e, i, t) : [];
        }
        function Vs(e) {
          if (!(e && e.length))
            return [];
          var t = 0;
          return e = Lt(e, function(r) {
            if (le(r))
              return t = de(r.length, t), !0;
          }), ns(t, function(r) {
            return ie(e, ji(r));
          });
        }
        function No(e, t) {
          if (!(e && e.length))
            return [];
          var r = Vs(e);
          return t == null ? r : ie(r, function(u) {
            return Ne(t, i, u);
          });
        }
        var Sg = Z(function(e, t) {
          return le(e) ? Qn(e, t) : [];
        }), xg = Z(function(e) {
          return xs(Lt(e, le));
        }), Og = Z(function(e) {
          var t = Xe(e);
          return le(t) && (t = i), xs(Lt(e, le), L(t, 2));
        }), Eg = Z(function(e) {
          var t = Xe(e);
          return t = typeof t == "function" ? t : i, xs(Lt(e, le), i, t);
        }), Ig = Z(Vs);
        function kg(e, t) {
          return Xa(e || [], t || [], Xn);
        }
        function Mg(e, t) {
          return Xa(e || [], t || [], tr);
        }
        var bg = Z(function(e) {
          var t = e.length, r = t > 1 ? e[t - 1] : i;
          return r = typeof r == "function" ? (e.pop(), r) : i, No(e, r);
        });
        function Fo(e) {
          var t = f(e);
          return t.__chain__ = !0, t;
        }
        function Dg(e, t) {
          return t(e), e;
        }
        function ri(e, t) {
          return t(e);
        }
        var Cg = xt(function(e) {
          var t = e.length, r = t ? e[0] : 0, u = this.__wrapped__, o = function(c) {
            return fs(c, e);
          };
          return t > 1 || this.__actions__.length || !(u instanceof G) || !Ot(r) ? this.thru(o) : (u = u.slice(r, +r + (t ? 1 : 0)), u.__actions__.push({
            func: ri,
            args: [o],
            thisArg: i
          }), new Ye(u, this.__chain__).thru(function(c) {
            return t && !c.length && c.push(i), c;
          }));
        });
        function Lg() {
          return Fo(this);
        }
        function Ag() {
          return new Ye(this.value(), this.__chain__);
        }
        function Ng() {
          this.__values__ === i && (this.__values__ = Jo(this.value()));
          var e = this.__index__ >= this.__values__.length, t = e ? i : this.__values__[this.__index__++];
          return { done: e, value: t };
        }
        function Fg() {
          return this;
        }
        function Wg(e) {
          for (var t, r = this; r instanceof Zr; ) {
            var u = Mo(r);
            u.__index__ = 0, u.__values__ = i, t ? o.__wrapped__ = u : t = u;
            var o = u;
            r = r.__wrapped__;
          }
          return o.__wrapped__ = e, t;
        }
        function Rg() {
          var e = this.__wrapped__;
          if (e instanceof G) {
            var t = e;
            return this.__actions__.length && (t = new G(this)), t = t.reverse(), t.__actions__.push({
              func: ri,
              args: [Us],
              thisArg: i
            }), new Ye(t, this.__chain__);
          }
          return this.thru(Us);
        }
        function Ug() {
          return Ka(this.__wrapped__, this.__actions__);
        }
        var Vg = Jr(function(e, t, r) {
          Q.call(e, r) ? ++e[r] : Tt(e, r, 1);
        });
        function $g(e, t, r) {
          var u = V(e) ? la : Dd;
          return r && Oe(e, t, r) && (t = i), u(e, L(t, 3));
        }
        function Pg(e, t) {
          var r = V(e) ? Lt : Aa;
          return r(e, L(t, 3));
        }
        var Zg = ao(bo), Bg = ao(Do);
        function Gg(e, t) {
          return pe(ii(e, t), 1);
        }
        function Hg(e, t) {
          return pe(ii(e, t), Jt);
        }
        function zg(e, t, r) {
          return r = r === i ? 1 : $(r), pe(ii(e, t), r);
        }
        function Wo(e, t) {
          var r = V(e) ? ze : Wt;
          return r(e, L(t, 3));
        }
        function Ro(e, t) {
          var r = V(e) ? ch : La;
          return r(e, L(t, 3));
        }
        var qg = Jr(function(e, t, r) {
          Q.call(e, r) ? e[r].push(t) : Tt(e, r, [t]);
        });
        function Yg(e, t, r, u) {
          e = De(e) ? e : En(e), r = r && !u ? $(r) : 0;
          var o = e.length;
          return r < 0 && (r = de(o + r, 0)), li(e) ? r <= o && e.indexOf(t, r) > -1 : !!o && dn(e, t, r) > -1;
        }
        var Jg = Z(function(e, t, r) {
          var u = -1, o = typeof t == "function", c = De(e) ? _(e.length) : [];
          return Wt(e, function(d) {
            c[++u] = o ? Ne(t, d, r) : jn(d, t, r);
          }), c;
        }), Kg = Jr(function(e, t, r) {
          Tt(e, r, t);
        });
        function ii(e, t) {
          var r = V(e) ? ie : Va;
          return r(e, L(t, 3));
        }
        function Xg(e, t, r, u) {
          return e == null ? [] : (V(t) || (t = t == null ? [] : [t]), r = u ? i : r, V(r) || (r = r == null ? [] : [r]), Ba(e, t, r));
        }
        var Qg = Jr(function(e, t, r) {
          e[r ? 0 : 1].push(t);
        }, function() {
          return [[], []];
        });
        function jg(e, t, r) {
          var u = V(e) ? Xi : da, o = arguments.length < 3;
          return u(e, L(t, 4), r, o, Wt);
        }
        function e0(e, t, r) {
          var u = V(e) ? hh : da, o = arguments.length < 3;
          return u(e, L(t, 4), r, o, La);
        }
        function t0(e, t) {
          var r = V(e) ? Lt : Aa;
          return r(e, ai(L(t, 3)));
        }
        function n0(e) {
          var t = V(e) ? Ma : Yd;
          return t(e);
        }
        function r0(e, t, r) {
          (r ? Oe(e, t, r) : t === i) ? t = 1 : t = $(t);
          var u = V(e) ? Ed : Jd;
          return u(e, t);
        }
        function i0(e) {
          var t = V(e) ? Id : Xd;
          return t(e);
        }
        function s0(e) {
          if (e == null)
            return 0;
          if (De(e))
            return li(e) ? gn(e) : e.length;
          var t = _e(e);
          return t == rt || t == it ? e.size : ps(e).length;
        }
        function u0(e, t, r) {
          var u = V(e) ? Qi : Qd;
          return r && Oe(e, t, r) && (t = i), u(e, L(t, 3));
        }
        var a0 = Z(function(e, t) {
          if (e == null)
            return [];
          var r = t.length;
          return r > 1 && Oe(e, t[0], t[1]) ? t = [] : r > 2 && Oe(t[0], t[1], t[2]) && (t = [t[0]]), Ba(e, pe(t, 1), []);
        }), si = Ph || function() {
          return ge.Date.now();
        };
        function o0(e, t) {
          if (typeof t != "function")
            throw new qe(m);
          return e = $(e), function() {
            if (--e < 1)
              return t.apply(this, arguments);
          };
        }
        function Uo(e, t, r) {
          return t = r ? i : t, t = e && t == null ? e.length : t, St(e, nt, i, i, i, i, t);
        }
        function Vo(e, t) {
          var r;
          if (typeof t != "function")
            throw new qe(m);
          return e = $(e), function() {
            return --e > 0 && (r = t.apply(this, arguments)), e <= 1 && (t = i), r;
          };
        }
        var $s = Z(function(e, t, r) {
          var u = ue;
          if (r.length) {
            var o = Nt(r, xn($s));
            u |= Ge;
          }
          return St(e, u, t, r, o);
        }), $o = Z(function(e, t, r) {
          var u = ue | Ae;
          if (r.length) {
            var o = Nt(r, xn($o));
            u |= Ge;
          }
          return St(t, u, e, r, o);
        });
        function Po(e, t, r) {
          t = r ? i : t;
          var u = St(e, Be, i, i, i, i, i, t);
          return u.placeholder = Po.placeholder, u;
        }
        function Zo(e, t, r) {
          t = r ? i : t;
          var u = St(e, Ht, i, i, i, i, i, t);
          return u.placeholder = Zo.placeholder, u;
        }
        function Bo(e, t, r) {
          var u, o, c, d, g, w, S = 0, x = !1, O = !1, I = !0;
          if (typeof e != "function")
            throw new qe(m);
          t = Qe(t) || 0, se(r) && (x = !!r.leading, O = "maxWait" in r, c = O ? de(Qe(r.maxWait) || 0, t) : c, I = "trailing" in r ? !!r.trailing : I);
          function b(fe) {
            var ot = u, kt = o;
            return u = o = i, S = fe, d = e.apply(kt, ot), d;
          }
          function N(fe) {
            return S = fe, g = ir(B, t), x ? b(fe) : d;
          }
          function P(fe) {
            var ot = fe - w, kt = fe - S, ol = t - ot;
            return O ? ve(ol, c - kt) : ol;
          }
          function F(fe) {
            var ot = fe - w, kt = fe - S;
            return w === i || ot >= t || ot < 0 || O && kt >= c;
          }
          function B() {
            var fe = si();
            if (F(fe))
              return H(fe);
            g = ir(B, P(fe));
          }
          function H(fe) {
            return g = i, I && u ? b(fe) : (u = o = i, d);
          }
          function Ue() {
            g !== i && Qa(g), S = 0, u = w = o = g = i;
          }
          function Ee() {
            return g === i ? d : H(si());
          }
          function Ve() {
            var fe = si(), ot = F(fe);
            if (u = arguments, o = this, w = fe, ot) {
              if (g === i)
                return N(w);
              if (O)
                return Qa(g), g = ir(B, t), b(w);
            }
            return g === i && (g = ir(B, t)), d;
          }
          return Ve.cancel = Ue, Ve.flush = Ee, Ve;
        }
        var l0 = Z(function(e, t) {
          return Ca(e, 1, t);
        }), f0 = Z(function(e, t, r) {
          return Ca(e, Qe(t) || 0, r);
        });
        function c0(e) {
          return St(e, yt);
        }
        function ui(e, t) {
          if (typeof e != "function" || t != null && typeof t != "function")
            throw new qe(m);
          var r = function() {
            var u = arguments, o = t ? t.apply(this, u) : u[0], c = r.cache;
            if (c.has(o))
              return c.get(o);
            var d = e.apply(this, u);
            return r.cache = c.set(o, d) || c, d;
          };
          return r.cache = new (ui.Cache || _t)(), r;
        }
        ui.Cache = _t;
        function ai(e) {
          if (typeof e != "function")
            throw new qe(m);
          return function() {
            var t = arguments;
            switch (t.length) {
              case 0:
                return !e.call(this);
              case 1:
                return !e.call(this, t[0]);
              case 2:
                return !e.call(this, t[0], t[1]);
              case 3:
                return !e.call(this, t[0], t[1], t[2]);
            }
            return !e.apply(this, t);
          };
        }
        function h0(e) {
          return Vo(2, e);
        }
        var d0 = jd(function(e, t) {
          t = t.length == 1 && V(t[0]) ? ie(t[0], Fe(L())) : ie(pe(t, 1), Fe(L()));
          var r = t.length;
          return Z(function(u) {
            for (var o = -1, c = ve(u.length, r); ++o < c; )
              u[o] = t[o].call(this, u[o]);
            return Ne(e, this, u);
          });
        }), Ps = Z(function(e, t) {
          var r = Nt(t, xn(Ps));
          return St(e, Ge, i, t, r);
        }), Go = Z(function(e, t) {
          var r = Nt(t, xn(Go));
          return St(e, zt, i, t, r);
        }), m0 = xt(function(e, t) {
          return St(e, qt, i, i, i, t);
        });
        function g0(e, t) {
          if (typeof e != "function")
            throw new qe(m);
          return t = t === i ? t : $(t), Z(e, t);
        }
        function p0(e, t) {
          if (typeof e != "function")
            throw new qe(m);
          return t = t == null ? 0 : de($(t), 0), Z(function(r) {
            var u = r[t], o = Vt(r, 0, t);
            return u && At(o, u), Ne(e, this, o);
          });
        }
        function y0(e, t, r) {
          var u = !0, o = !0;
          if (typeof e != "function")
            throw new qe(m);
          return se(r) && (u = "leading" in r ? !!r.leading : u, o = "trailing" in r ? !!r.trailing : o), Bo(e, t, {
            leading: u,
            maxWait: t,
            trailing: o
          });
        }
        function w0(e) {
          return Uo(e, 1);
        }
        function v0(e, t) {
          return Ps(Es(t), e);
        }
        function _0() {
          if (!arguments.length)
            return [];
          var e = arguments[0];
          return V(e) ? e : [e];
        }
        function T0(e) {
          return Je(e, C);
        }
        function S0(e, t) {
          return t = typeof t == "function" ? t : i, Je(e, C, t);
        }
        function x0(e) {
          return Je(e, A | C);
        }
        function O0(e, t) {
          return t = typeof t == "function" ? t : i, Je(e, A | C, t);
        }
        function E0(e, t) {
          return t == null || Da(e, t, me(t));
        }
        function at(e, t) {
          return e === t || e !== e && t !== t;
        }
        var I0 = jr(ds), k0 = jr(function(e, t) {
          return e >= t;
        }), sn = Wa(/* @__PURE__ */ function() {
          return arguments;
        }()) ? Wa : function(e) {
          return ae(e) && Q.call(e, "callee") && !Sa.call(e, "callee");
        }, V = _.isArray, M0 = ra ? Fe(ra) : Wd;
        function De(e) {
          return e != null && oi(e.length) && !Et(e);
        }
        function le(e) {
          return ae(e) && De(e);
        }
        function b0(e) {
          return e === !0 || e === !1 || ae(e) && xe(e) == Un;
        }
        var $t = Bh || Qs, D0 = ia ? Fe(ia) : Rd;
        function C0(e) {
          return ae(e) && e.nodeType === 1 && !sr(e);
        }
        function L0(e) {
          if (e == null)
            return !0;
          if (De(e) && (V(e) || typeof e == "string" || typeof e.splice == "function" || $t(e) || On(e) || sn(e)))
            return !e.length;
          var t = _e(e);
          if (t == rt || t == it)
            return !e.size;
          if (rr(e))
            return !ps(e).length;
          for (var r in e)
            if (Q.call(e, r))
              return !1;
          return !0;
        }
        function A0(e, t) {
          return er(e, t);
        }
        function N0(e, t, r) {
          r = typeof r == "function" ? r : i;
          var u = r ? r(e, t) : i;
          return u === i ? er(e, t, i, r) : !!u;
        }
        function Zs(e) {
          if (!ae(e))
            return !1;
          var t = xe(e);
          return t == _r || t == rc || typeof e.message == "string" && typeof e.name == "string" && !sr(e);
        }
        function F0(e) {
          return typeof e == "number" && Oa(e);
        }
        function Et(e) {
          if (!se(e))
            return !1;
          var t = xe(e);
          return t == Tr || t == Cu || t == nc || t == sc;
        }
        function Ho(e) {
          return typeof e == "number" && e == $(e);
        }
        function oi(e) {
          return typeof e == "number" && e > -1 && e % 1 == 0 && e <= Ct;
        }
        function se(e) {
          var t = typeof e;
          return e != null && (t == "object" || t == "function");
        }
        function ae(e) {
          return e != null && typeof e == "object";
        }
        var zo = sa ? Fe(sa) : Vd;
        function W0(e, t) {
          return e === t || gs(e, t, Ls(t));
        }
        function R0(e, t, r) {
          return r = typeof r == "function" ? r : i, gs(e, t, Ls(t), r);
        }
        function U0(e) {
          return qo(e) && e != +e;
        }
        function V0(e) {
          if (Sm(e))
            throw new U(h);
          return Ra(e);
        }
        function $0(e) {
          return e === null;
        }
        function P0(e) {
          return e == null;
        }
        function qo(e) {
          return typeof e == "number" || ae(e) && xe(e) == $n;
        }
        function sr(e) {
          if (!ae(e) || xe(e) != wt)
            return !1;
          var t = Fr(e);
          if (t === null)
            return !0;
          var r = Q.call(t, "constructor") && t.constructor;
          return typeof r == "function" && r instanceof r && Cr.call(r) == Rh;
        }
        var Bs = ua ? Fe(ua) : $d;
        function Z0(e) {
          return Ho(e) && e >= -Ct && e <= Ct;
        }
        var Yo = aa ? Fe(aa) : Pd;
        function li(e) {
          return typeof e == "string" || !V(e) && ae(e) && xe(e) == Zn;
        }
        function Re(e) {
          return typeof e == "symbol" || ae(e) && xe(e) == Sr;
        }
        var On = oa ? Fe(oa) : Zd;
        function B0(e) {
          return e === i;
        }
        function G0(e) {
          return ae(e) && _e(e) == Bn;
        }
        function H0(e) {
          return ae(e) && xe(e) == ac;
        }
        var z0 = jr(ys), q0 = jr(function(e, t) {
          return e <= t;
        });
        function Jo(e) {
          if (!e)
            return [];
          if (De(e))
            return li(e) ? st(e) : be(e);
          if (zn && e[zn])
            return Eh(e[zn]());
          var t = _e(e), r = t == rt ? is : t == it ? Mr : En;
          return r(e);
        }
        function It(e) {
          if (!e)
            return e === 0 ? e : 0;
          if (e = Qe(e), e === Jt || e === -Jt) {
            var t = e < 0 ? -1 : 1;
            return t * Qf;
          }
          return e === e ? e : 0;
        }
        function $(e) {
          var t = It(e), r = t % 1;
          return t === t ? r ? t - r : t : 0;
        }
        function Ko(e) {
          return e ? en($(e), 0, dt) : 0;
        }
        function Qe(e) {
          if (typeof e == "number")
            return e;
          if (Re(e))
            return wr;
          if (se(e)) {
            var t = typeof e.valueOf == "function" ? e.valueOf() : e;
            e = se(t) ? t + "" : t;
          }
          if (typeof e != "string")
            return e === 0 ? e : +e;
          e = ma(e);
          var r = Mc.test(e);
          return r || Dc.test(e) ? oh(e.slice(2), r ? 2 : 8) : kc.test(e) ? wr : +e;
        }
        function Xo(e) {
          return gt(e, Ce(e));
        }
        function Y0(e) {
          return e ? en($(e), -Ct, Ct) : e === 0 ? e : 0;
        }
        function K(e) {
          return e == null ? "" : We(e);
        }
        var J0 = Tn(function(e, t) {
          if (rr(t) || De(t)) {
            gt(t, me(t), e);
            return;
          }
          for (var r in t)
            Q.call(t, r) && Xn(e, r, t[r]);
        }), Qo = Tn(function(e, t) {
          gt(t, Ce(t), e);
        }), fi = Tn(function(e, t, r, u) {
          gt(t, Ce(t), e, u);
        }), K0 = Tn(function(e, t, r, u) {
          gt(t, me(t), e, u);
        }), X0 = xt(fs);
        function Q0(e, t) {
          var r = _n(e);
          return t == null ? r : ba(r, t);
        }
        var j0 = Z(function(e, t) {
          e = ee(e);
          var r = -1, u = t.length, o = u > 2 ? t[2] : i;
          for (o && Oe(t[0], t[1], o) && (u = 1); ++r < u; )
            for (var c = t[r], d = Ce(c), g = -1, w = d.length; ++g < w; ) {
              var S = d[g], x = e[S];
              (x === i || at(x, yn[S]) && !Q.call(e, S)) && (e[S] = c[S]);
            }
          return e;
        }), ep = Z(function(e) {
          return e.push(i, go), Ne(jo, i, e);
        });
        function tp(e, t) {
          return fa(e, L(t, 3), mt);
        }
        function np(e, t) {
          return fa(e, L(t, 3), hs);
        }
        function rp(e, t) {
          return e == null ? e : cs(e, L(t, 3), Ce);
        }
        function ip(e, t) {
          return e == null ? e : Na(e, L(t, 3), Ce);
        }
        function sp(e, t) {
          return e && mt(e, L(t, 3));
        }
        function up(e, t) {
          return e && hs(e, L(t, 3));
        }
        function ap(e) {
          return e == null ? [] : Hr(e, me(e));
        }
        function op(e) {
          return e == null ? [] : Hr(e, Ce(e));
        }
        function Gs(e, t, r) {
          var u = e == null ? i : tn(e, t);
          return u === i ? r : u;
        }
        function lp(e, t) {
          return e != null && wo(e, t, Ld);
        }
        function Hs(e, t) {
          return e != null && wo(e, t, Ad);
        }
        var fp = lo(function(e, t, r) {
          t != null && typeof t.toString != "function" && (t = Lr.call(t)), e[t] = r;
        }, qs(Le)), cp = lo(function(e, t, r) {
          t != null && typeof t.toString != "function" && (t = Lr.call(t)), Q.call(e, t) ? e[t].push(r) : e[t] = [r];
        }, L), hp = Z(jn);
        function me(e) {
          return De(e) ? ka(e) : ps(e);
        }
        function Ce(e) {
          return De(e) ? ka(e, !0) : Bd(e);
        }
        function dp(e, t) {
          var r = {};
          return t = L(t, 3), mt(e, function(u, o, c) {
            Tt(r, t(u, o, c), u);
          }), r;
        }
        function mp(e, t) {
          var r = {};
          return t = L(t, 3), mt(e, function(u, o, c) {
            Tt(r, o, t(u, o, c));
          }), r;
        }
        var gp = Tn(function(e, t, r) {
          zr(e, t, r);
        }), jo = Tn(function(e, t, r, u) {
          zr(e, t, r, u);
        }), pp = xt(function(e, t) {
          var r = {};
          if (e == null)
            return r;
          var u = !1;
          t = ie(t, function(c) {
            return c = Ut(c, e), u || (u = c.length > 1), c;
          }), gt(e, Ds(e), r), u && (r = Je(r, A | J | C, fm));
          for (var o = t.length; o--; )
            Ss(r, t[o]);
          return r;
        });
        function yp(e, t) {
          return el(e, ai(L(t)));
        }
        var wp = xt(function(e, t) {
          return e == null ? {} : Hd(e, t);
        });
        function el(e, t) {
          if (e == null)
            return {};
          var r = ie(Ds(e), function(u) {
            return [u];
          });
          return t = L(t), Ga(e, r, function(u, o) {
            return t(u, o[0]);
          });
        }
        function vp(e, t, r) {
          t = Ut(t, e);
          var u = -1, o = t.length;
          for (o || (o = 1, e = i); ++u < o; ) {
            var c = e == null ? i : e[pt(t[u])];
            c === i && (u = o, c = r), e = Et(c) ? c.call(e) : c;
          }
          return e;
        }
        function _p(e, t, r) {
          return e == null ? e : tr(e, t, r);
        }
        function Tp(e, t, r, u) {
          return u = typeof u == "function" ? u : i, e == null ? e : tr(e, t, r, u);
        }
        var tl = ho(me), nl = ho(Ce);
        function Sp(e, t, r) {
          var u = V(e), o = u || $t(e) || On(e);
          if (t = L(t, 4), r == null) {
            var c = e && e.constructor;
            o ? r = u ? new c() : [] : se(e) ? r = Et(c) ? _n(Fr(e)) : {} : r = {};
          }
          return (o ? ze : mt)(e, function(d, g, w) {
            return t(r, d, g, w);
          }), r;
        }
        function xp(e, t) {
          return e == null ? !0 : Ss(e, t);
        }
        function Op(e, t, r) {
          return e == null ? e : Ja(e, t, Es(r));
        }
        function Ep(e, t, r, u) {
          return u = typeof u == "function" ? u : i, e == null ? e : Ja(e, t, Es(r), u);
        }
        function En(e) {
          return e == null ? [] : rs(e, me(e));
        }
        function Ip(e) {
          return e == null ? [] : rs(e, Ce(e));
        }
        function kp(e, t, r) {
          return r === i && (r = t, t = i), r !== i && (r = Qe(r), r = r === r ? r : 0), t !== i && (t = Qe(t), t = t === t ? t : 0), en(Qe(e), t, r);
        }
        function Mp(e, t, r) {
          return t = It(t), r === i ? (r = t, t = 0) : r = It(r), e = Qe(e), Nd(e, t, r);
        }
        function bp(e, t, r) {
          if (r && typeof r != "boolean" && Oe(e, t, r) && (t = r = i), r === i && (typeof t == "boolean" ? (r = t, t = i) : typeof e == "boolean" && (r = e, e = i)), e === i && t === i ? (e = 0, t = 1) : (e = It(e), t === i ? (t = e, e = 0) : t = It(t)), e > t) {
            var u = e;
            e = t, t = u;
          }
          if (r || e % 1 || t % 1) {
            var o = Ea();
            return ve(e + o * (t - e + ah("1e-" + ((o + "").length - 1))), t);
          }
          return vs(e, t);
        }
        var Dp = Sn(function(e, t, r) {
          return t = t.toLowerCase(), e + (r ? rl(t) : t);
        });
        function rl(e) {
          return zs(K(e).toLowerCase());
        }
        function il(e) {
          return e = K(e), e && e.replace(Lc, _h).replace(Xc, "");
        }
        function Cp(e, t, r) {
          e = K(e), t = We(t);
          var u = e.length;
          r = r === i ? u : en($(r), 0, u);
          var o = r;
          return r -= t.length, r >= 0 && e.slice(r, o) == t;
        }
        function Lp(e) {
          return e = K(e), e && hc.test(e) ? e.replace(Nu, Th) : e;
        }
        function Ap(e) {
          return e = K(e), e && wc.test(e) ? e.replace(Pi, "\\$&") : e;
        }
        var Np = Sn(function(e, t, r) {
          return e + (r ? "-" : "") + t.toLowerCase();
        }), Fp = Sn(function(e, t, r) {
          return e + (r ? " " : "") + t.toLowerCase();
        }), Wp = uo("toLowerCase");
        function Rp(e, t, r) {
          e = K(e), t = $(t);
          var u = t ? gn(e) : 0;
          if (!t || u >= t)
            return e;
          var o = (t - u) / 2;
          return Qr(Vr(o), r) + e + Qr(Ur(o), r);
        }
        function Up(e, t, r) {
          e = K(e), t = $(t);
          var u = t ? gn(e) : 0;
          return t && u < t ? e + Qr(t - u, r) : e;
        }
        function Vp(e, t, r) {
          e = K(e), t = $(t);
          var u = t ? gn(e) : 0;
          return t && u < t ? Qr(t - u, r) + e : e;
        }
        function $p(e, t, r) {
          return r || t == null ? t = 0 : t && (t = +t), qh(K(e).replace(Zi, ""), t || 0);
        }
        function Pp(e, t, r) {
          return (r ? Oe(e, t, r) : t === i) ? t = 1 : t = $(t), _s(K(e), t);
        }
        function Zp() {
          var e = arguments, t = K(e[0]);
          return e.length < 3 ? t : t.replace(e[1], e[2]);
        }
        var Bp = Sn(function(e, t, r) {
          return e + (r ? "_" : "") + t.toLowerCase();
        });
        function Gp(e, t, r) {
          return r && typeof r != "number" && Oe(e, t, r) && (t = r = i), r = r === i ? dt : r >>> 0, r ? (e = K(e), e && (typeof t == "string" || t != null && !Bs(t)) && (t = We(t), !t && mn(e)) ? Vt(st(e), 0, r) : e.split(t, r)) : [];
        }
        var Hp = Sn(function(e, t, r) {
          return e + (r ? " " : "") + zs(t);
        });
        function zp(e, t, r) {
          return e = K(e), r = r == null ? 0 : en($(r), 0, e.length), t = We(t), e.slice(r, r + t.length) == t;
        }
        function qp(e, t, r) {
          var u = f.templateSettings;
          r && Oe(e, t, r) && (t = i), e = K(e), t = fi({}, t, u, mo);
          var o = fi({}, t.imports, u.imports, mo), c = me(o), d = rs(o, c), g, w, S = 0, x = t.interpolate || xr, O = "__p += '", I = ss(
            (t.escape || xr).source + "|" + x.source + "|" + (x === Fu ? Ic : xr).source + "|" + (t.evaluate || xr).source + "|$",
            "g"
          ), b = "//# sourceURL=" + (Q.call(t, "sourceURL") ? (t.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++nh + "]") + `
`;
          e.replace(I, function(F, B, H, Ue, Ee, Ve) {
            return H || (H = Ue), O += e.slice(S, Ve).replace(Ac, Sh), B && (g = !0, O += `' +
__e(` + B + `) +
'`), Ee && (w = !0, O += `';
` + Ee + `;
__p += '`), H && (O += `' +
((__t = (` + H + `)) == null ? '' : __t) +
'`), S = Ve + F.length, F;
          }), O += `';
`;
          var N = Q.call(t, "variable") && t.variable;
          if (!N)
            O = `with (obj) {
` + O + `
}
`;
          else if (Oc.test(N))
            throw new U(p);
          O = (w ? O.replace(oc, "") : O).replace(lc, "$1").replace(fc, "$1;"), O = "function(" + (N || "obj") + `) {
` + (N ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (g ? ", __e = _.escape" : "") + (w ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + O + `return __p
}`;
          var P = ul(function() {
            return q(c, b + "return " + O).apply(i, d);
          });
          if (P.source = O, Zs(P))
            throw P;
          return P;
        }
        function Yp(e) {
          return K(e).toLowerCase();
        }
        function Jp(e) {
          return K(e).toUpperCase();
        }
        function Kp(e, t, r) {
          if (e = K(e), e && (r || t === i))
            return ma(e);
          if (!e || !(t = We(t)))
            return e;
          var u = st(e), o = st(t), c = ga(u, o), d = pa(u, o) + 1;
          return Vt(u, c, d).join("");
        }
        function Xp(e, t, r) {
          if (e = K(e), e && (r || t === i))
            return e.slice(0, wa(e) + 1);
          if (!e || !(t = We(t)))
            return e;
          var u = st(e), o = pa(u, st(t)) + 1;
          return Vt(u, 0, o).join("");
        }
        function Qp(e, t, r) {
          if (e = K(e), e && (r || t === i))
            return e.replace(Zi, "");
          if (!e || !(t = We(t)))
            return e;
          var u = st(e), o = ga(u, st(t));
          return Vt(u, o).join("");
        }
        function jp(e, t) {
          var r = Yt, u = Ci;
          if (se(t)) {
            var o = "separator" in t ? t.separator : o;
            r = "length" in t ? $(t.length) : r, u = "omission" in t ? We(t.omission) : u;
          }
          e = K(e);
          var c = e.length;
          if (mn(e)) {
            var d = st(e);
            c = d.length;
          }
          if (r >= c)
            return e;
          var g = r - gn(u);
          if (g < 1)
            return u;
          var w = d ? Vt(d, 0, g).join("") : e.slice(0, g);
          if (o === i)
            return w + u;
          if (d && (g += w.length - g), Bs(o)) {
            if (e.slice(g).search(o)) {
              var S, x = w;
              for (o.global || (o = ss(o.source, K(Wu.exec(o)) + "g")), o.lastIndex = 0; S = o.exec(x); )
                var O = S.index;
              w = w.slice(0, O === i ? g : O);
            }
          } else if (e.indexOf(We(o), g) != g) {
            var I = w.lastIndexOf(o);
            I > -1 && (w = w.slice(0, I));
          }
          return w + u;
        }
        function ey(e) {
          return e = K(e), e && cc.test(e) ? e.replace(Au, bh) : e;
        }
        var ty = Sn(function(e, t, r) {
          return e + (r ? " " : "") + t.toUpperCase();
        }), zs = uo("toUpperCase");
        function sl(e, t, r) {
          return e = K(e), t = r ? i : t, t === i ? Oh(e) ? Lh(e) : gh(e) : e.match(t) || [];
        }
        var ul = Z(function(e, t) {
          try {
            return Ne(e, i, t);
          } catch (r) {
            return Zs(r) ? r : new U(r);
          }
        }), ny = xt(function(e, t) {
          return ze(t, function(r) {
            r = pt(r), Tt(e, r, $s(e[r], e));
          }), e;
        });
        function ry(e) {
          var t = e == null ? 0 : e.length, r = L();
          return e = t ? ie(e, function(u) {
            if (typeof u[1] != "function")
              throw new qe(m);
            return [r(u[0]), u[1]];
          }) : [], Z(function(u) {
            for (var o = -1; ++o < t; ) {
              var c = e[o];
              if (Ne(c[0], this, u))
                return Ne(c[1], this, u);
            }
          });
        }
        function iy(e) {
          return bd(Je(e, A));
        }
        function qs(e) {
          return function() {
            return e;
          };
        }
        function sy(e, t) {
          return e == null || e !== e ? t : e;
        }
        var uy = oo(), ay = oo(!0);
        function Le(e) {
          return e;
        }
        function Ys(e) {
          return Ua(typeof e == "function" ? e : Je(e, A));
        }
        function oy(e) {
          return $a(Je(e, A));
        }
        function ly(e, t) {
          return Pa(e, Je(t, A));
        }
        var fy = Z(function(e, t) {
          return function(r) {
            return jn(r, e, t);
          };
        }), cy = Z(function(e, t) {
          return function(r) {
            return jn(e, r, t);
          };
        });
        function Js(e, t, r) {
          var u = me(t), o = Hr(t, u);
          r == null && !(se(t) && (o.length || !u.length)) && (r = t, t = e, e = this, o = Hr(t, me(t)));
          var c = !(se(r) && "chain" in r) || !!r.chain, d = Et(e);
          return ze(o, function(g) {
            var w = t[g];
            e[g] = w, d && (e.prototype[g] = function() {
              var S = this.__chain__;
              if (c || S) {
                var x = e(this.__wrapped__), O = x.__actions__ = be(this.__actions__);
                return O.push({ func: w, args: arguments, thisArg: e }), x.__chain__ = S, x;
              }
              return w.apply(e, At([this.value()], arguments));
            });
          }), e;
        }
        function hy() {
          return ge._ === this && (ge._ = Uh), this;
        }
        function Ks() {
        }
        function dy(e) {
          return e = $(e), Z(function(t) {
            return Za(t, e);
          });
        }
        var my = ks(ie), gy = ks(la), py = ks(Qi);
        function al(e) {
          return Ns(e) ? ji(pt(e)) : zd(e);
        }
        function yy(e) {
          return function(t) {
            return e == null ? i : tn(e, t);
          };
        }
        var wy = fo(), vy = fo(!0);
        function Xs() {
          return [];
        }
        function Qs() {
          return !1;
        }
        function _y() {
          return {};
        }
        function Ty() {
          return "";
        }
        function Sy() {
          return !0;
        }
        function xy(e, t) {
          if (e = $(e), e < 1 || e > Ct)
            return [];
          var r = dt, u = ve(e, dt);
          t = L(t), e -= dt;
          for (var o = ns(u, t); ++r < e; )
            t(r);
          return o;
        }
        function Oy(e) {
          return V(e) ? ie(e, pt) : Re(e) ? [e] : be(ko(K(e)));
        }
        function Ey(e) {
          var t = ++Wh;
          return K(e) + t;
        }
        var Iy = Xr(function(e, t) {
          return e + t;
        }, 0), ky = Ms("ceil"), My = Xr(function(e, t) {
          return e / t;
        }, 1), by = Ms("floor");
        function Dy(e) {
          return e && e.length ? Gr(e, Le, ds) : i;
        }
        function Cy(e, t) {
          return e && e.length ? Gr(e, L(t, 2), ds) : i;
        }
        function Ly(e) {
          return ha(e, Le);
        }
        function Ay(e, t) {
          return ha(e, L(t, 2));
        }
        function Ny(e) {
          return e && e.length ? Gr(e, Le, ys) : i;
        }
        function Fy(e, t) {
          return e && e.length ? Gr(e, L(t, 2), ys) : i;
        }
        var Wy = Xr(function(e, t) {
          return e * t;
        }, 1), Ry = Ms("round"), Uy = Xr(function(e, t) {
          return e - t;
        }, 0);
        function Vy(e) {
          return e && e.length ? ts(e, Le) : 0;
        }
        function $y(e, t) {
          return e && e.length ? ts(e, L(t, 2)) : 0;
        }
        return f.after = o0, f.ary = Uo, f.assign = J0, f.assignIn = Qo, f.assignInWith = fi, f.assignWith = K0, f.at = X0, f.before = Vo, f.bind = $s, f.bindAll = ny, f.bindKey = $o, f.castArray = _0, f.chain = Fo, f.chunk = bm, f.compact = Dm, f.concat = Cm, f.cond = ry, f.conforms = iy, f.constant = qs, f.countBy = Vg, f.create = Q0, f.curry = Po, f.curryRight = Zo, f.debounce = Bo, f.defaults = j0, f.defaultsDeep = ep, f.defer = l0, f.delay = f0, f.difference = Lm, f.differenceBy = Am, f.differenceWith = Nm, f.drop = Fm, f.dropRight = Wm, f.dropRightWhile = Rm, f.dropWhile = Um, f.fill = Vm, f.filter = Pg, f.flatMap = Gg, f.flatMapDeep = Hg, f.flatMapDepth = zg, f.flatten = Co, f.flattenDeep = $m, f.flattenDepth = Pm, f.flip = c0, f.flow = uy, f.flowRight = ay, f.fromPairs = Zm, f.functions = ap, f.functionsIn = op, f.groupBy = qg, f.initial = Gm, f.intersection = Hm, f.intersectionBy = zm, f.intersectionWith = qm, f.invert = fp, f.invertBy = cp, f.invokeMap = Jg, f.iteratee = Ys, f.keyBy = Kg, f.keys = me, f.keysIn = Ce, f.map = ii, f.mapKeys = dp, f.mapValues = mp, f.matches = oy, f.matchesProperty = ly, f.memoize = ui, f.merge = gp, f.mergeWith = jo, f.method = fy, f.methodOf = cy, f.mixin = Js, f.negate = ai, f.nthArg = dy, f.omit = pp, f.omitBy = yp, f.once = h0, f.orderBy = Xg, f.over = my, f.overArgs = d0, f.overEvery = gy, f.overSome = py, f.partial = Ps, f.partialRight = Go, f.partition = Qg, f.pick = wp, f.pickBy = el, f.property = al, f.propertyOf = yy, f.pull = Xm, f.pullAll = Ao, f.pullAllBy = Qm, f.pullAllWith = jm, f.pullAt = eg, f.range = wy, f.rangeRight = vy, f.rearg = m0, f.reject = t0, f.remove = tg, f.rest = g0, f.reverse = Us, f.sampleSize = r0, f.set = _p, f.setWith = Tp, f.shuffle = i0, f.slice = ng, f.sortBy = a0, f.sortedUniq = lg, f.sortedUniqBy = fg, f.split = Gp, f.spread = p0, f.tail = cg, f.take = hg, f.takeRight = dg, f.takeRightWhile = mg, f.takeWhile = gg, f.tap = Dg, f.throttle = y0, f.thru = ri, f.toArray = Jo, f.toPairs = tl, f.toPairsIn = nl, f.toPath = Oy, f.toPlainObject = Xo, f.transform = Sp, f.unary = w0, f.union = pg, f.unionBy = yg, f.unionWith = wg, f.uniq = vg, f.uniqBy = _g, f.uniqWith = Tg, f.unset = xp, f.unzip = Vs, f.unzipWith = No, f.update = Op, f.updateWith = Ep, f.values = En, f.valuesIn = Ip, f.without = Sg, f.words = sl, f.wrap = v0, f.xor = xg, f.xorBy = Og, f.xorWith = Eg, f.zip = Ig, f.zipObject = kg, f.zipObjectDeep = Mg, f.zipWith = bg, f.entries = tl, f.entriesIn = nl, f.extend = Qo, f.extendWith = fi, Js(f, f), f.add = Iy, f.attempt = ul, f.camelCase = Dp, f.capitalize = rl, f.ceil = ky, f.clamp = kp, f.clone = T0, f.cloneDeep = x0, f.cloneDeepWith = O0, f.cloneWith = S0, f.conformsTo = E0, f.deburr = il, f.defaultTo = sy, f.divide = My, f.endsWith = Cp, f.eq = at, f.escape = Lp, f.escapeRegExp = Ap, f.every = $g, f.find = Zg, f.findIndex = bo, f.findKey = tp, f.findLast = Bg, f.findLastIndex = Do, f.findLastKey = np, f.floor = by, f.forEach = Wo, f.forEachRight = Ro, f.forIn = rp, f.forInRight = ip, f.forOwn = sp, f.forOwnRight = up, f.get = Gs, f.gt = I0, f.gte = k0, f.has = lp, f.hasIn = Hs, f.head = Lo, f.identity = Le, f.includes = Yg, f.indexOf = Bm, f.inRange = Mp, f.invoke = hp, f.isArguments = sn, f.isArray = V, f.isArrayBuffer = M0, f.isArrayLike = De, f.isArrayLikeObject = le, f.isBoolean = b0, f.isBuffer = $t, f.isDate = D0, f.isElement = C0, f.isEmpty = L0, f.isEqual = A0, f.isEqualWith = N0, f.isError = Zs, f.isFinite = F0, f.isFunction = Et, f.isInteger = Ho, f.isLength = oi, f.isMap = zo, f.isMatch = W0, f.isMatchWith = R0, f.isNaN = U0, f.isNative = V0, f.isNil = P0, f.isNull = $0, f.isNumber = qo, f.isObject = se, f.isObjectLike = ae, f.isPlainObject = sr, f.isRegExp = Bs, f.isSafeInteger = Z0, f.isSet = Yo, f.isString = li, f.isSymbol = Re, f.isTypedArray = On, f.isUndefined = B0, f.isWeakMap = G0, f.isWeakSet = H0, f.join = Ym, f.kebabCase = Np, f.last = Xe, f.lastIndexOf = Jm, f.lowerCase = Fp, f.lowerFirst = Wp, f.lt = z0, f.lte = q0, f.max = Dy, f.maxBy = Cy, f.mean = Ly, f.meanBy = Ay, f.min = Ny, f.minBy = Fy, f.stubArray = Xs, f.stubFalse = Qs, f.stubObject = _y, f.stubString = Ty, f.stubTrue = Sy, f.multiply = Wy, f.nth = Km, f.noConflict = hy, f.noop = Ks, f.now = si, f.pad = Rp, f.padEnd = Up, f.padStart = Vp, f.parseInt = $p, f.random = bp, f.reduce = jg, f.reduceRight = e0, f.repeat = Pp, f.replace = Zp, f.result = vp, f.round = Ry, f.runInContext = y, f.sample = n0, f.size = s0, f.snakeCase = Bp, f.some = u0, f.sortedIndex = rg, f.sortedIndexBy = ig, f.sortedIndexOf = sg, f.sortedLastIndex = ug, f.sortedLastIndexBy = ag, f.sortedLastIndexOf = og, f.startCase = Hp, f.startsWith = zp, f.subtract = Uy, f.sum = Vy, f.sumBy = $y, f.template = qp, f.times = xy, f.toFinite = It, f.toInteger = $, f.toLength = Ko, f.toLower = Yp, f.toNumber = Qe, f.toSafeInteger = Y0, f.toString = K, f.toUpper = Jp, f.trim = Kp, f.trimEnd = Xp, f.trimStart = Qp, f.truncate = jp, f.unescape = ey, f.uniqueId = Ey, f.upperCase = ty, f.upperFirst = zs, f.each = Wo, f.eachRight = Ro, f.first = Lo, Js(f, function() {
          var e = {};
          return mt(f, function(t, r) {
            Q.call(f.prototype, r) || (e[r] = t);
          }), e;
        }(), { chain: !1 }), f.VERSION = a, ze(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(e) {
          f[e].placeholder = f;
        }), ze(["drop", "take"], function(e, t) {
          G.prototype[e] = function(r) {
            r = r === i ? 1 : de($(r), 0);
            var u = this.__filtered__ && !t ? new G(this) : this.clone();
            return u.__filtered__ ? u.__takeCount__ = ve(r, u.__takeCount__) : u.__views__.push({
              size: ve(r, dt),
              type: e + (u.__dir__ < 0 ? "Right" : "")
            }), u;
          }, G.prototype[e + "Right"] = function(r) {
            return this.reverse()[e](r).reverse();
          };
        }), ze(["filter", "map", "takeWhile"], function(e, t) {
          var r = t + 1, u = r == Du || r == Xf;
          G.prototype[e] = function(o) {
            var c = this.clone();
            return c.__iteratees__.push({
              iteratee: L(o, 3),
              type: r
            }), c.__filtered__ = c.__filtered__ || u, c;
          };
        }), ze(["head", "last"], function(e, t) {
          var r = "take" + (t ? "Right" : "");
          G.prototype[e] = function() {
            return this[r](1).value()[0];
          };
        }), ze(["initial", "tail"], function(e, t) {
          var r = "drop" + (t ? "" : "Right");
          G.prototype[e] = function() {
            return this.__filtered__ ? new G(this) : this[r](1);
          };
        }), G.prototype.compact = function() {
          return this.filter(Le);
        }, G.prototype.find = function(e) {
          return this.filter(e).head();
        }, G.prototype.findLast = function(e) {
          return this.reverse().find(e);
        }, G.prototype.invokeMap = Z(function(e, t) {
          return typeof e == "function" ? new G(this) : this.map(function(r) {
            return jn(r, e, t);
          });
        }), G.prototype.reject = function(e) {
          return this.filter(ai(L(e)));
        }, G.prototype.slice = function(e, t) {
          e = $(e);
          var r = this;
          return r.__filtered__ && (e > 0 || t < 0) ? new G(r) : (e < 0 ? r = r.takeRight(-e) : e && (r = r.drop(e)), t !== i && (t = $(t), r = t < 0 ? r.dropRight(-t) : r.take(t - e)), r);
        }, G.prototype.takeRightWhile = function(e) {
          return this.reverse().takeWhile(e).reverse();
        }, G.prototype.toArray = function() {
          return this.take(dt);
        }, mt(G.prototype, function(e, t) {
          var r = /^(?:filter|find|map|reject)|While$/.test(t), u = /^(?:head|last)$/.test(t), o = f[u ? "take" + (t == "last" ? "Right" : "") : t], c = u || /^find/.test(t);
          o && (f.prototype[t] = function() {
            var d = this.__wrapped__, g = u ? [1] : arguments, w = d instanceof G, S = g[0], x = w || V(d), O = function(B) {
              var H = o.apply(f, At([B], g));
              return u && I ? H[0] : H;
            };
            x && r && typeof S == "function" && S.length != 1 && (w = x = !1);
            var I = this.__chain__, b = !!this.__actions__.length, N = c && !I, P = w && !b;
            if (!c && x) {
              d = P ? d : new G(this);
              var F = e.apply(d, g);
              return F.__actions__.push({ func: ri, args: [O], thisArg: i }), new Ye(F, I);
            }
            return N && P ? e.apply(this, g) : (F = this.thru(O), N ? u ? F.value()[0] : F.value() : F);
          });
        }), ze(["pop", "push", "shift", "sort", "splice", "unshift"], function(e) {
          var t = br[e], r = /^(?:push|sort|unshift)$/.test(e) ? "tap" : "thru", u = /^(?:pop|shift)$/.test(e);
          f.prototype[e] = function() {
            var o = arguments;
            if (u && !this.__chain__) {
              var c = this.value();
              return t.apply(V(c) ? c : [], o);
            }
            return this[r](function(d) {
              return t.apply(V(d) ? d : [], o);
            });
          };
        }), mt(G.prototype, function(e, t) {
          var r = f[t];
          if (r) {
            var u = r.name + "";
            Q.call(vn, u) || (vn[u] = []), vn[u].push({ name: t, func: r });
          }
        }), vn[Kr(i, Ae).name] = [{
          name: "wrapper",
          func: i
        }], G.prototype.clone = ed, G.prototype.reverse = td, G.prototype.value = nd, f.prototype.at = Cg, f.prototype.chain = Lg, f.prototype.commit = Ag, f.prototype.next = Ng, f.prototype.plant = Wg, f.prototype.reverse = Rg, f.prototype.toJSON = f.prototype.valueOf = f.prototype.value = Ug, f.prototype.first = f.prototype.head, zn && (f.prototype[zn] = Fg), f;
      }, pn = Ah();
      Kt ? ((Kt.exports = pn)._ = pn, Yi._ = pn) : ge._ = pn;
    }).call(Bw);
  }(fr, fr.exports)), fr.exports;
}
var ke = Gw();
const ye = [];
for (let s = 0; s < 256; ++s)
  ye.push((s + 256).toString(16).slice(1));
function Hw(s, n = 0) {
  return (ye[s[n + 0]] + ye[s[n + 1]] + ye[s[n + 2]] + ye[s[n + 3]] + "-" + ye[s[n + 4]] + ye[s[n + 5]] + "-" + ye[s[n + 6]] + ye[s[n + 7]] + "-" + ye[s[n + 8]] + ye[s[n + 9]] + "-" + ye[s[n + 10]] + ye[s[n + 11]] + ye[s[n + 12]] + ye[s[n + 13]] + ye[s[n + 14]] + ye[s[n + 15]]).toLowerCase();
}
let lu;
const zw = new Uint8Array(16);
function qw() {
  if (!lu) {
    if (typeof crypto > "u" || !crypto.getRandomValues)
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    lu = crypto.getRandomValues.bind(crypto);
  }
  return lu(zw);
}
const Yw = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), Pl = { randomUUID: Yw };
function Jw(s, n, i) {
  s = s || {};
  const a = s.random ?? s.rng?.() ?? qw();
  if (a.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return a[6] = a[6] & 15 | 64, a[8] = a[8] & 63 | 128, Hw(a);
}
function Pe(s, n, i) {
  return Pl.randomUUID && !s ? Pl.randomUUID() : Jw(s);
}
function Kw(s) {
  return /^\d{4}(1[0-2]|0[1-9])(0[1-9]|[1-2][0-9]|3[0-1])$/.test(s);
}
const Xw = (s, n) => s.timeEntries.some((i) => i.timestamp === n), Qw = (s, n) => {
  const i = ne.fromISO(`${n}-01-01/P1Y`);
  return s.timeEntries.find((a) => a.nonTimeBasedValue && ["all", "current"].includes(a.nonTimeBasedValue) ? n === Zl : i.isValid && a.interval ? i.intersection(a.interval) !== null : !1);
}, Tu = (s, n) => {
  let i;
  typeof n == "string" ? i = s.timeEntries.find((a) => a.timestamp === n) : i = n, s.currentTimeEntry = i;
}, jw = (s) => {
  let n, i;
  if (s.startsWith("9999"))
    i = "all";
  else {
    let a, l, h;
    if (Kw(s))
      a = s.substring(0, 4), l = s.substring(4, 6), h = s.substring(6, 8);
    else {
      const m = new Date(s);
      isNaN(m.getFullYear()) || (a = m.getFullYear().toString().padStart(4, "0")), isNaN(m.getMonth()) || (l = (m.getMonth() + 1).toString().padStart(2, "0")), isNaN(m.getDate()) || (h = m.getDate().toString().padStart(2, "0"));
    }
    a !== void 0 && l !== void 0 && h !== void 0 ? n = ne.fromISO(`${a}-${l}-${h}/P1D`) : a !== void 0 && l !== void 0 ? n = ne.fromISO(`${a}-${l}-01/P1M`) : a !== void 0 && (n = ne.fromISO(`${a}-01-01/P1Y`));
  }
  return (n === void 0 || !n.isValid) && (i = s), n && !n.isValid && (zf.debug("[@swissgeo/layers] invalid interval for timestamp", s), n = void 0), {
    timestamp: s,
    interval: n,
    nonTimeBasedValue: i
  };
}, ev = (s, n) => {
  if (!n || n.length === 0)
    return;
  const i = {
    timeEntries: n,
    behaviour: s
  };
  return (s === "last" || !s) && n.length > 0 ? Tu(i, n[0]) : s && Tu(i, s), i;
}, tv = (s) => (s.timeConfig?.timeEntries?.length || 0) > 1;
function nv(s) {
  if (s.nonTimeBasedValue && ["all", "current"].includes(s.nonTimeBasedValue))
    return Zl;
  if (s.interval && s.interval.start?.year !== void 0)
    return s.interval.start.year;
}
const rv = (s, n) => {
  if (!(!n?.isValid || !s.timeConfig?.timeEntries?.length))
    return s.timeConfig.timeEntries.find((i) => i.interval ? i.interval.overlaps(n) : !1);
};
function iv(s) {
  let n = s.timeConfig?.currentTimeEntry?.timestamp;
  return !n && s.type === Me.WMTS && (n = "current"), n;
}
const dr = {
  hasTimestamp: Xw,
  getTimeEntryForYear: Qw,
  updateCurrentTimeEntry: Tu,
  makeTimeConfigEntry: jw,
  makeTimeConfig: ev,
  hasMultipleTimestamps: tv,
  getYearFromLayerTimeEntry: nv,
  getTimeEntryForInterval: rv,
  getTimestampFromConfig: iv
}, sv = "<kml></kml>", uv = "%7C";
function av(s) {
  return Object.values(Me).includes(s) ? s : void 0;
}
function qf(s) {
  return s.replace("|", uv);
}
const Ze = (s) => {
  if (!s.name)
    throw new Ln("Missing layer name", s);
  if (!s.id)
    throw new Ln("Missing layer ID", s);
};
function ov(s) {
  const n = {
    uuid: Pe(),
    isExternal: !1,
    type: Me.WMS,
    opacity: Bl,
    isVisible: !0,
    isLoading: !1,
    gutter: 0,
    wmsVersion: "1.3.0",
    lang: "en",
    isHighlightable: !1,
    hasTooltip: !1,
    topics: [],
    hasLegend: !1,
    searchable: !1,
    format: "png",
    technicalName: "",
    isSpecificFor3d: !1,
    attributions: [],
    hasDescription: !0,
    hasError: !1,
    hasWarning: !1,
    isBackground: !1,
    timeConfig: {
      timeEntries: []
    }
  }, i = ke.merge(n, s);
  return Ze(i), i;
}
function lv(s) {
  const n = {
    uuid: Pe(),
    type: Me.WMTS,
    idIn3d: void 0,
    technicalName: void 0,
    opacity: 1,
    isVisible: !0,
    format: "png",
    isBackground: !1,
    isHighlightable: !1,
    hasTooltip: !1,
    topics: [],
    hasLegend: !1,
    searchable: !1,
    maxResolution: Zw,
    isSpecificFor3d: !1,
    attributions: [],
    hasDescription: !0,
    isExternal: !1,
    isLoading: !1,
    hasError: !1,
    hasWarning: !1,
    timeConfig: { timeEntries: [] }
  }, i = ke.merge(n, s);
  return Ze(i), i;
}
function fv(s) {
  const n = (s?.abstract?.length ?? 0) > 0 || (s?.legends?.length ?? 0) > 0, i = [], a = (s?.legends ?? []).length > 0;
  s?.baseUrl && i.push({ name: new URL(s.baseUrl).hostname });
  const l = {
    uuid: Pe(),
    isExternal: !0,
    type: Me.WMTS,
    opacity: Bl,
    isVisible: !0,
    abstract: "",
    legends: [],
    availableProjections: [],
    getTileEncoding: Py.REST,
    urlTemplate: "",
    style: "",
    tileMatrixSets: [],
    dimensions: [],
    hasTooltip: !1,
    hasDescription: n,
    hasLegend: a,
    isLoading: !0,
    hasError: !1,
    currentYear: void 0,
    attributions: i,
    hasWarning: !1,
    timeConfig: {
      timeEntries: []
    }
  };
  if (s.currentYear && s.timeConfig) {
    const m = dr.getTimeEntryForYear(s.timeConfig, s.currentYear);
    m && dr.updateCurrentTimeEntry(s.timeConfig, m);
  }
  const h = ke.merge(l, s);
  return Ze(h), h;
}
function cv(s) {
  const n = (s?.abstract?.length ?? 0) > 0 || (s?.legends?.length ?? 0) > 0, i = [{ name: new URL(s.baseUrl).hostname }], a = (s?.legends ?? []).length > 0, l = {
    uuid: Pe(),
    opacity: 1,
    isVisible: !0,
    layers: [],
    attributions: i,
    hasDescription: n,
    wmsVersion: "1.3.0",
    format: "png",
    hasLegend: a,
    abstract: "",
    extent: void 0,
    legends: [],
    isLoading: !0,
    availableProjections: [],
    hasTooltip: !1,
    getFeatureInfoCapability: void 0,
    dimensions: [],
    currentYear: void 0,
    customAttributes: void 0,
    type: Me.WMS,
    isExternal: !0,
    hasError: !1,
    hasWarning: !1,
    timeConfig: {
      timeEntries: []
    }
  };
  if (s.currentYear && s.timeConfig) {
    const m = dr.getTimeEntryForYear(s.timeConfig, s.currentYear);
    m && dr.updateCurrentTimeEntry(s.timeConfig, m);
  }
  const h = ke.merge(l, s);
  return Ze(h), h;
}
function hv(s) {
  if (!s.kmlFileUrl)
    throw new Ln("Missing KML file URL", s);
  const n = s.kmlFileUrl;
  let i = !0;
  s.isExternal !== void 0 ? i = s.isExternal : i = ![
    ou.kml.development,
    ou.kml.integration,
    ou.kml.production
  ].some(
    (E) => n.startsWith(E)
  );
  let a;
  s.clampToGround !== void 0 ? a = s.clampToGround : a = !i;
  let l;
  s.style !== void 0 ? l = s.style : l = i ? ll.DEFAULT : ll.GEOADMIN;
  let h = s.fileId;
  !h && !i && (h = n.split("/").pop());
  const m = {
    kmlFileUrl: "",
    uuid: Pe(),
    opacity: 1,
    isVisible: !0,
    extent: void 0,
    id: `KML|${qf(n)}`,
    name: "KML",
    clampToGround: a,
    isExternal: i,
    baseUrl: n,
    fileId: h,
    kmlData: void 0,
    kmlMetadata: void 0,
    isLocalFile: !1,
    attributions: [],
    style: l,
    type: Me.KML,
    hasTooltip: !1,
    hasError: !1,
    hasWarning: !1,
    hasDescription: !1,
    hasLegend: !1,
    isLoading: !0,
    adminId: void 0,
    internalFiles: {},
    timeConfig: {
      timeEntries: []
    }
  }, p = ke.merge(m, s);
  return Ze(p), p;
}
function dv(s) {
  const n = !s.gpxFileUrl?.startsWith("http");
  if (!s.gpxFileUrl)
    throw new Ln("Missing GPX file URL", s);
  const a = [{ name: n ? s.gpxFileUrl : new URL(s.gpxFileUrl).hostname }], l = s.gpxMetadata?.name ?? "GPX", h = {
    uuid: Pe(),
    baseUrl: s.gpxFileUrl,
    gpxFileUrl: void 0,
    gpxData: void 0,
    gpxMetadata: void 0,
    extent: void 0,
    name: l,
    id: `GPX|${qf(s.gpxFileUrl)}`,
    type: Me.GPX,
    opacity: 0,
    isVisible: !1,
    attributions: a,
    hasTooltip: !1,
    hasDescription: !1,
    hasLegend: !1,
    isExternal: !0,
    hasError: !1,
    hasWarning: !1,
    isLoading: !s.gpxData,
    timeConfig: {
      timeEntries: []
    }
  }, m = ke.merge(h, s);
  return Ze(m), m;
}
function mv(s) {
  const n = [
    ...s.attributions ? s.attributions : [],
    { name: "swisstopo", url: "https://www.swisstopo.admin.ch/en/home.html" }
  ], i = {
    uuid: Pe(),
    type: Me.VECTOR,
    technicalName: "",
    attributions: n,
    opacity: 0,
    isVisible: !1,
    hasTooltip: !1,
    hasDescription: !1,
    hasLegend: !1,
    isBackground: !0,
    isExternal: !1,
    isLoading: !1,
    hasError: !1,
    hasWarning: !1,
    isHighlightable: !1,
    timeConfig: {
      timeEntries: []
    },
    topics: [],
    searchable: !1,
    isSpecificFor3d: !1
  }, a = ke.merge(i, ke.omit(s, "attributions"));
  return Ze(a), a;
}
function gv(s) {
  const n = [{ name: "swisstopo", url: "https://www.swisstopo.admin.ch/en/home.html" }], i = {
    baseUrl: "",
    id: "",
    uuid: Pe(),
    technicalName: "",
    use3dTileSubFolder: !1,
    urlTimestampToUse: void 0,
    name: s.name ?? s.id ?? "3D layer",
    type: Me.VECTOR,
    opacity: 1,
    isVisible: !0,
    attributions: n,
    hasTooltip: !1,
    hasDescription: !1,
    hasLegend: !1,
    isExternal: !1,
    isLoading: !1,
    hasError: !1,
    hasWarning: !1,
    isHighlightable: !1,
    topics: [],
    searchable: !1,
    isSpecificFor3d: !1,
    isBackground: !1,
    timeConfig: {
      timeEntries: []
    }
  }, a = ke.merge(i, s);
  return Ze(a), a;
}
function pv(s) {
  if (s.fileSource === null || s.fileSource === void 0)
    throw new Ln("Missing COG file source", s);
  const n = s.fileSource, i = !n?.startsWith("http"), l = [{ name: i ? n : new URL(n).hostname }], h = i ? n : n?.substring(n.lastIndexOf("/") + 1), m = {
    uuid: Pe(),
    baseUrl: n,
    type: Me.COG,
    isLocalFile: i,
    fileSource: void 0,
    data: void 0,
    extent: void 0,
    name: h,
    id: n,
    opacity: 1,
    isVisible: !1,
    attributions: l,
    hasTooltip: !1,
    hasDescription: !1,
    hasLegend: !1,
    isExternal: !1,
    isLoading: !1,
    hasError: !1,
    hasWarning: !1,
    timeConfig: {
      timeEntries: []
    }
  }, p = ke.merge(m, s);
  return Ze(p), p;
}
function yv(s) {
  const n = {
    uuid: Pe(),
    type: Me.AGGREGATE,
    subLayers: [],
    opacity: 1,
    isVisible: !0,
    attributions: [],
    hasTooltip: !1,
    hasDescription: !1,
    hasLegend: !1,
    isExternal: !1,
    isLoading: !1,
    hasError: !1,
    hasWarning: !1,
    timeConfig: {
      timeEntries: []
    },
    isHighlightable: !1,
    topics: [],
    searchable: !1,
    isSpecificFor3d: !1,
    isBackground: !1
  }, i = ke.merge(n, s);
  return Ze(i), i;
}
function wv(s) {
  const n = {
    uuid: Pe(),
    type: Me.GEOJSON,
    updateDelay: 0,
    styleUrl: "",
    geoJsonUrl: "",
    technicalName: "",
    isExternal: !1,
    opacity: 1,
    isVisible: !0,
    attributions: [],
    hasTooltip: !1,
    hasDescription: !1,
    hasLegend: !1,
    isLoading: !1,
    hasError: !1,
    hasWarning: !1,
    geoJsonStyle: void 0,
    geoJsonData: void 0,
    timeConfig: {
      timeEntries: []
    },
    isHighlightable: !1,
    searchable: !1,
    topics: [],
    isSpecificFor3d: !1,
    isBackground: !1
  }, i = ke.merge(n, s);
  return Ze(i), i;
}
function vv(s) {
  const n = {
    uuid: Pe(),
    layers: [],
    type: Me.GROUP,
    opacity: 1,
    isVisible: !0,
    attributions: [],
    hasTooltip: !1,
    hasDescription: !1,
    hasLegend: !1,
    isExternal: !1,
    isLoading: !1,
    timeConfig: {
      timeEntries: []
    },
    hasError: !1,
    hasWarning: !1
  }, i = ke.merge(n, s);
  return Ze(i), i;
}
function _v(s) {
  if (s.layer === void 0 || s.subLayerId === void 0)
    throw new Ln("Must provide a layer for the aggregate sublayer", s);
  const n = {
    minResolution: 0,
    maxResolution: 0
  };
  return ke.merge(n, s);
}
function Tv(s) {
  return s.kmlMetadata?.author !== "web-mapviewer";
}
function Sv(s) {
  return !s.kmlData || s.kmlData === sv;
}
function xv(s) {
  if (s.isExternal)
    return "ech";
  const n = s;
  return n.topics.length === 0 || n.topics.indexOf("ech") !== -1 ? "ech" : n.topics[0];
}
function Ov(s) {
  Ze(s);
  const n = ke.cloneDeep(s);
  return n.uuid = Pe(), n;
}
function Ev(s, n, i) {
  const { addTimestamp: a = !1, baseUrlOverride: l } = i ?? {};
  if (s?.type === Me.WMTS && n) {
    let h = "{Time}";
    a && (h = dr.getTimestampFromConfig(s) ?? "{Time}");
    let m, p;
    if (s.isExternal) {
      const v = s;
      m = v.options?.format, p = v.id;
    } else {
      const v = s;
      m = v.format, p = v.technicalName ?? v.id;
    }
    return `${l ?? s.baseUrl}1.0.0/${p}/default/${h}/${n.epsgNumber}/{z}/{x}/{y}.${m ?? "jpeg"}`;
  }
}
const Mv = {
  transformToLayerTypeEnum: av,
  makeGPXLayer: dv,
  makeKMLLayer: hv,
  makeGeoAdminWMSLayer: ov,
  makeGeoAdminWMTSLayer: lv,
  makeExternalWMTSLayer: fv,
  makeExternalWMSLayer: cv,
  makeGeoAdminVectorLayer: mv,
  makeGeoAdmin3DLayer: gv,
  makeCloudOptimizedGeoTIFFLayer: pv,
  makeGeoAdminAggregateLayer: yv,
  makeGeoAdminGeoJSONLayer: wv,
  makeGeoAdminGroupOfLayers: vv,
  makeAggregateSubLayer: _v,
  isKmlLayerLegacy: Tv,
  isKmlLayerEmpty: Sv,
  getTopicForIdentifyAndTooltipRequests: xv,
  cloneLayer: Ov,
  getWmtsXyzUrl: Ev
};
export {
  Zw as D,
  sv as E,
  ou as a,
  $w as b,
  ke as c,
  ev as d,
  Qw as e,
  tv as f,
  Ev as g,
  Xw as h,
  nv as i,
  rv as j,
  iv as k,
  Mv as l,
  jw as m,
  zf as p,
  dr as t,
  Tu as u
};
