class o extends Error {
  data;
  constructor(r, e) {
    super(r), this.data = e, this.name = "InvalidLayerDataError";
  }
}
const n = (s, r) => s.errorMessages ? s.errorMessages.some((e) => e.isEqual(r)) : !1, t = (s) => {
  if (s.errorMessages && s.errorMessages.length > 0)
    return s.errorMessages[0];
}, g = (s, r) => {
  s.errorMessages || (s.errorMessages = []), n(s, r) || (s.errorMessages.push(r), s.hasError = !0);
}, i = (s, r) => {
  !s.errorMessages || !n(s, r) || (s.errorMessages = s.errorMessages.filter((e) => e.isEqual(r)), s.hasError = s.errorMessages.length > 0);
}, M = (s) => {
  s.errorMessages && (s.errorMessages = []), s.hasError = !1;
}, a = (s, r) => s.warningMessages ? s.warningMessages.some((e) => !e.isEqual(r)) : !1, u = (s) => {
  if (s.warningMessages && s.warningMessages.length > 0)
    return s.warningMessages[0];
}, c = (s, r) => {
  s.warningMessages || (s.warningMessages = []), a(s, r) || (s.warningMessages.push(r), s.hasWarning = !0);
}, f = (s, r) => {
  !s.warningMessages || !a(s, r) || (s.warningMessages = s.warningMessages.filter(
    (e) => !e.isEqual(r)
  ), s.hasWarning = s.warningMessages.length > 0);
}, E = (s) => {
  s.warningMessages = [], s.hasWarning = !1;
};
class h extends Error {
  key;
  constructor(r, e) {
    super(r), this.name = "CapabilitiesError", this.key = e;
  }
}
const d = (s) => {
  const r = ["id", "type", "baseUrl", "name"];
  for (const e of r)
    if (!(e in s))
      return !1;
  return !0;
};
export {
  h as CapabilitiesError,
  o as InvalidLayerDataError,
  g as addErrorMessageToLayer,
  c as addWarningMessageToLayer,
  M as clearErrorMessages,
  E as clearWarningMessages,
  t as getFirstErrorMessage,
  u as getFirstWarningMessage,
  n as layerContainsErrorMessage,
  a as layerContainsWarningMessage,
  i as removeErrorMessageFromLayer,
  f as removeWarningMessageFromLayer,
  d as validateLayerProp
};
