/**
 * A description of one URL param that needs synchronization with the app {@link Vuex.Store} with
 * some helper functions
 */
export class ParamConfig {
  /**
   * @param {String} urlParamName The name of the param found in the URL (e.g. 'lat' will then be
   *   https://.../?lat=value in the URL
   * @param {String} mutationsToWatch The names of the Vuex's store mutations to watch for value
   *   synchronization (separated by a coma)
   * @param {String} dispatchChangeTo The name of the Vuex's store action where to publish changes
   *   made in the URL
   * @param {Function} extractValueFromStore A function taking the store in param that needs to
   *   return the value of this param found in the store
   * @param {NumberConstructor | StringConstructor | BooleanConstructor} valueType
   */
  constructor(
    urlParamName,
    mutationsToWatch,
    dispatchChangeTo,
    extractValueFromStore,
    valueType = String
  ) {
    this.urlParamName = urlParamName
    this.mutationsToWatch = mutationsToWatch
    this.dispatchChangeTo = dispatchChangeTo
    this.extractValueFromStore = extractValueFromStore
    this.valueType = valueType
  }

  /**
   * Reads the value from the given Vue router query (part of {@link RouterLink})
   *
   * @param {Object} query An object describing the route URL param
   * @returns {undefined | number | string | boolean} The value casted in the type given to the
   *   config (see constructor)
   */
  readValueFromQuery(query) {
    if (query && this.urlParamName in query) {
      const queryValue = query[this.urlParamName]
      // Edge case here in Javascript with Boolean constructor, Boolean('false') returns true as the "object" we passed
      // to the constructor is valid and non-null. So we manage that "the old way" for booleans
      if (this.valueType === Boolean) {
        return (
          (typeof queryValue === 'string' && queryValue === 'true') ||
          (typeof queryValue === 'boolean' && !!queryValue)
        )
      } else {
        // if not a boolean, we can trust the other constructor (Number, String) to return a valid value whenever it is possible with the String input
        return this.valueType(queryValue)
      }
    }
    return undefined
  }

  /**
   * Reads the value from the given Vue store, and cast it in the type given in the constructor
   *
   * @param store A {@link Vuex.Store}
   * @returns {undefined | number | string | boolean} The value casted in the type given in the
   *   config (see constructor)
   */
  readValueFromStore(store) {
    if (store && this.extractValueFromStore) {
      return this.valueType(this.extractValueFromStore(store))
    }
    return undefined
  }

  valuesAreDifferentBetweenQueryAndStore(query, store) {
    return this.readValueFromQuery(query) !== this.readValueFromStore(store)
  }

  /**
   * Adds the value of the store to the query object
   *
   * @param {Object} query Simple Object that holds all URL parameters (key is the name of param in
   *   the URL, value is its value)
   * @param {Vuex.Store} store
   */
  populateQueryWithStoreValue(query, store) {
    if (query && this.urlParamName && this.urlParamName.length > 0) {
      const valueFromStore = this.readValueFromStore(store)
      // with boolean, if the value of the flag is false we simply don't add it to the URL's param (or remove it if present)
      // with String, if the value is an empty string, we also don't add it to the URL (or remove it if present)
      if (
        (this.valueType === Boolean && !valueFromStore) ||
        (this.valueType === String && valueFromStore === '')
      ) {
        if (this.urlParamName in query) {
          delete query[this.urlParamName]
        }
      } else {
        // for other type than boolean, we add the value of the store to the URL regardless of the actual value
        query[this.urlParamName] = valueFromStore
      }
    }
  }
}

/**
 * Configuration for all URL parameters of this app that need syncing with the store (and vice-versa)
 *
 * @type Array<ParamConfig>
 */
const storeToUrlManagementConfig = [
  new ParamConfig(
    'lat',
    'setCenter',
    'setLatitude',
    (store) => store.getters.centerEpsg4326[1],
    Number
  ),
  new ParamConfig(
    'lon',
    'setCenter',
    'setLongitude',
    (store) => store.getters.centerEpsg4326[0],
    Number
  ),
  new ParamConfig('z', 'setZoom', 'setZoom', (store) => store.state.position.zoom, Number),
  new ParamConfig(
    'geolocation',
    'setGeolocationActive',
    'toggleGeolocation',
    (store) => store.state.geolocation.active,
    Boolean
  ),
  new ParamConfig(
    'layers',
    'toggleLayerVisibility,addLayer,removeLayer,moveActiveLayerFromIndexToIndex',
    'setVisibleLayersByIds',
    (store) => store.getters.jointVisibleLayerIds,
    String
  ),
]

export default storeToUrlManagementConfig
