/**
 * A description of one URL param that needs synchronization with the app {@link Vuex.Store}
 */
class ParamConfig {
  /**
   * @param {String} urlParamName the name of the param found in the URL (e.g. 'lat' will then be https://.../?lat=value in the URL
   * @param {String} mutationToWatch the name of the Vuex's store mutation to watch for value synchronization
   * @param {String} dispatchChangeTo the name of the Vuex's store action where to publish changes made in the URL
   * @param {Function} extractValueFromStore a function taking the store in param that needs to return the value of this param found in the store
   * @param {NumberConstructor|StringConstructor|BooleanConstructor} valueType
   */
  constructor(
    urlParamName,
    mutationToWatch,
    dispatchChangeTo,
    extractValueFromStore,
    valueType = String
  ) {
    this.urlParamName = urlParamName
    this.mutationToWatch = mutationToWatch
    this.dispatchChangeTo = dispatchChangeTo
    this.extractValueFromStore = extractValueFromStore
    this.valueType = valueType
  }

  /**
   * Reads the value from the given Vue router query (part of {@link RouterLink})
   * @param query an object describing the route URL param
   * @returns {undefined|number|string|boolean} the value casted in the type given to the config (see constructor)
   */
  readValueFromQuery(query) {
    if (query && query[this.urlParamName]) {
      // Edge case here in Javascript with Boolean constructor, Boolean('false') returns true as the "object" we passed
      // to the constructor is valid and non-null. So we manage that "the old way" for booleans
      if (this.valueType === Boolean) {
        return query[this.urlParamName] === 'true'
      } else {
        // if not a boolean, we can trust the other constructor (Number, String) to return a valid value whenever it is possible with the input
        return this.valueType(query[this.urlParamName])
      }
    }
    return undefined
  }

  /**
   * Reads the value from the given Vue store, and cast it in the type given in the constructor
   * @param store a {@link Vuex.Store}
   * @returns {undefined|number|string} the value casted in the type given in the config (see constructor)
   */
  readValueFromStore(store) {
    if (store && this.extractValueFromStore) {
      return this.valueType(this.extractValueFromStore(store))
    }
    return undefined
  }

  valuesAreDifferentBetweenQueryAndStore(query, store) {
    const queryValue = this.readValueFromQuery(query)
    const storeValue = this.readValueFromStore(store)
    return queryValue !== storeValue
  }

  populateQueryWithStoreValue(query, store) {
    if (query && this.urlParamName && this.urlParamName.length > 0) {
      query[this.urlParamName] = this.readValueFromStore(store)
    }
  }
}

/**
 * Configuration for all URL parameters of this app.
 * @type Array<ParamConfig>
 */
const urlParamsConfig = [
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
]
const watchedMutations = [
  ...new Set(urlParamsConfig.map((paramConfig) => paramConfig.mutationToWatch)),
]

/**
 * Checks all param in the current route and the store to see if there's a difference in values
 * @param {Vuex.Store} store
 * @param {RouterLink} currentRoute
 * @returns {boolean} true if a value is different between the store and the URL
 */
const isRoutePushNeeded = (store, currentRoute) => {
  let aRoutePushIsNeeded = false
  urlParamsConfig.forEach(
    (paramConfig) =>
      (aRoutePushIsNeeded |= paramConfig.valuesAreDifferentBetweenQueryAndStore(
        currentRoute.query,
        store
      ))
  )
  return aRoutePushIsNeeded
}

const pendingMutationTriggeredByThisModule = []

const storeToUrlManagement = (router, store) => {
  // flag to distinguish URL change originated by this module or by another source
  let routeChangeIsTriggeredByThisModule = false
  // listening to store mutation in order to update URL
  store.subscribe((mutation) => {
    // if this mutation has been triggered by router.beforeEach below, we ignore it
    if (
      pendingMutationTriggeredByThisModule.indexOf(mutation.type) === -1 &&
      watchedMutations.includes(mutation.type)
    ) {
      // if the value in the store differs from the one in the URL
      if (isRoutePushNeeded(store, router.currentRoute)) {
        routeChangeIsTriggeredByThisModule = true
        const query = {}
        // extracting all param from the store
        urlParamsConfig.forEach((paramConfig) =>
          paramConfig.populateQueryWithStoreValue(query, store)
        )
        router.replace({
          name: 'MapView',
          query,
        })
      }
    }
  })
  // listening to URL change (independent of this module) in order to update the store
  router.beforeEach((to, _, next) => {
    if (routeChangeIsTriggeredByThisModule) {
      routeChangeIsTriggeredByThisModule = false
    } else if (store.state.app.isReady) {
      // if the route change is not made by this module we need to check if a store change is needed
      urlParamsConfig.forEach((paramConfig) => {
        const queryValue = paramConfig.readValueFromQuery(to.query)
        if (queryValue && paramConfig.valuesAreDifferentBetweenQueryAndStore(to.query, store)) {
          // preventing store.subscribe above to change what is in the URL while dispatching this change
          // if we don't ignore this next mutation, all other param than the one treated here could go back
          // to default/store value even though they could be defined differently in the URL.
          pendingMutationTriggeredByThisModule.push(paramConfig.mutationToWatch)
          // dispatching URL value to the store
          store.dispatch(paramConfig.dispatchChangeTo, queryValue).then(() => {
            // removing mutation name from the pending ones
            pendingMutationTriggeredByThisModule.splice(
              pendingMutationTriggeredByThisModule.indexOf(paramConfig.dispatchChangeTo),
              1
            )
          })
        }
      })
    }
    next()
  })
}

export default storeToUrlManagement
