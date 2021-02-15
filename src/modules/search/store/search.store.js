import search, { CombinedSearchResults, RESULT_TYPE } from '@/api/search.api'
import { coordinateFromString } from '@/utils/coordinateUtils'
import { isWhat3WordsString, retrieveWhat3WordsLocation } from '@/api/what3words.api'
import { ZOOM_LEVEL_1_25000_MAP } from '@/utils/zoomLevelUtils'

const state = {
  /**
   * Flag telling if a search requesting is ongoing with the backend
   *
   * @type Boolean
   */
  pending: false,
  /**
   * The search query, will trigger a search to the backend if it contains 3 or more characters
   *
   * @type String
   */
  query: '',
  /**
   * Search results from the backend for the current query
   *
   * @type CombinedSearchResults
   */
  results: new CombinedSearchResults(),
  /**
   * Flag telling if search results should visible
   *
   * @type Boolean
   */
  show: false,
}

const getters = {}

const actions = {
  /**
   * @param {vuex} vuex
   * @param {Object} payload
   * @param {String} payload.query
   * @param {Boolean} payload.showResultsAfterRequest
   */
  setSearchQuery: (
    { commit, rootState, dispatch },
    { query = '', showResultsAfterRequest = true }
  ) => {
    commit('setSearchQuery', query)
    commit('setSearchResults', new CombinedSearchResults())
    // only firing search if query is longer than 2 chars
    if (query.length > 2) {
      // checking first if this corresponds to a set of coordinates (or a what3words)
      const coordinate = coordinateFromString(query)
      if (coordinate) {
        dispatch('setCenter', coordinate)
        dispatch('setZoom', ZOOM_LEVEL_1_25000_MAP)
        dispatch('setPinnedLocation', coordinate)
      } else if (isWhat3WordsString(query)) {
        retrieveWhat3WordsLocation(query).then((what3wordLocation) => {
          dispatch('setCenter', what3wordLocation)
          dispatch('setZoom', ZOOM_LEVEL_1_25000_MAP)
          dispatch('setPinnedLocation', what3wordLocation)
        })
      } else {
        search(query, rootState.i18n.lang).then((searchResults) => {
          if (searchResults) {
            commit('setSearchResults', searchResults)
            if (showResultsAfterRequest && searchResults.count() > 0) {
              commit('showSearchResults')
            }
          }
        })
      }
    } else if (query.length === 0) {
      dispatch('setPinnedLocation', null)
    }
  },
  setSearchResults: ({ commit }, results) => commit('setSearchResults', results),
  showSearchResults: ({ commit }) => commit('showSearchResults'),
  hideSearchResults: ({ commit }) => commit('hideSearchResults'),
  /**
   * @param commit
   * @param dispatch
   * @param {SearchResult | LayerSearchResult | FeatureSearchResult} entry
   */
  selectResultEntry: ({ commit, dispatch }, entry) => {
    switch (entry.resultType) {
      case RESULT_TYPE.LAYER:
        dispatch('addLayer', entry.layerId)
        break
      case RESULT_TYPE.LOCATION:
        if (entry.extent.length === 2) {
          dispatch('zoomToExtent', entry.extent)
        } else if (entry.zoom) {
          dispatch('setCenter', entry.coordinates)
          dispatch('setZoom', entry.zoom)
        }
        dispatch('setPinnedLocation', entry.coordinates)
        break
    }
    commit('setSearchQuery', entry.getSimpleTitle())
    commit('hideSearchResults')
  },
}

const mutations = {
  setSearchQuery: (state, query) => (state.query = query),
  setSearchResults: (state, results) => (state.results = results ? results : []),
  showSearchResults: (state) => (state.show = true),
  hideSearchResults: (state) => (state.show = false),
}

export default {
  state,
  getters,
  actions,
  mutations,
}
