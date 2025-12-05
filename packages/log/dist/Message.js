class r {
  msg;
  params;
  /**
   * @param msg Translation key message
   * @param params Translation params to pass to i18n (used for message formatting)
   */
  constructor(s, a) {
    this.msg = s, this.params = a ?? {};
  }
  isEqual(s) {
    return s.msg === this.msg && Object.keys(this.params).length === Object.keys(s.params).length && Object.keys(this.params).every((a) => this.params[a] === s.params[a]);
  }
}
class t extends r {
}
class m extends r {
}
export {
  t as ErrorMessage,
  r as Message,
  m as WarningMessage
};
