const encodeReserveRE = /[!'()*]/g
const encodeReserveReplacer = (c) => '%' + c.charCodeAt(0).toString(16)
const commaRE = /%2C/g

// fixed encodeURIComponent which is more conformant to RFC3986:
// - escapes [!'()*]
// - preserve commas
const encode = (str) =>
    encodeURIComponent(str).replace(encodeReserveRE, encodeReserveReplacer).replace(commaRE, ',')

/**
 * This is in essence a copy past from
 * https://github.com/vuejs/vue-router/blob/f597959b14887cf0535aa895b6325a2f9348c5cf/src/util/query.js#L78-L113
 * so that we can overwrite its behavior for `layers` URL param (we don't want any URL encode on
 * this specific URL param, otherwise semicolons, at sign and equal signs are encoded which hinder
 * readability)
 *
 * @param query
 * @returns {string | string}
 */
const stringifyQuery = (query) => {
    const res = query
        ? Object.keys(query)
              .map((key) => {
                  const val = query[key]

                  if (val === undefined) {
                      return ''
                  }

                  if (val === null) {
                      return encode(key)
                  }

                  if (Array.isArray(val)) {
                      const result = []
                      val.forEach((val2) => {
                          if (val2 === undefined) {
                              return
                          }
                          if (val2 === null) {
                              result.push(encode(key))
                          } else {
                              result.push(encode(key) + '=' + encode(val2))
                          }
                      })
                      return result.join('&')
                  }
                  // main change from the original method is this if/else block
                  if (key === 'layers') {
                      return encode(key) + '=' + val
                  } else {
                      return encode(key) + '=' + encode(val)
                  }
              })
              .filter((x) => x.length > 0)
              .join('&')
        : null
    return res ? res : ''
}
export default stringifyQuery
