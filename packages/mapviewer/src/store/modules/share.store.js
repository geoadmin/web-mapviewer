import log from '@geoadmin/log'

import { createShortLink } from '@/api/shortlink.api'

export default {
    state: {
        /**
         * Short link version of the current map position (and layers, and all...). This will not be
         * defined each time, but only when the share menu is opened first (it will then be updated
         * whenever the URL changes to match it)
         *
         * @type String
         */
        shortLink: null,
        /**
         * The state of the shortlink share menu section. As we need to be able to change this
         * whenever the user moves the map, and it should only be done within mutations.
         *
         * @type Boolean
         */
        isMenuSectionShown: false,
    },
    getters: {},
    actions: {
        async generateShortLinks({ commit }, { withCrosshair = false, dispatcher }) {
            try {
                const shortLink = await createShortLink(window.location.href, withCrosshair)
                if (shortLink) {
                    commit('setShortLink', { shortLink, dispatcher })
                }
            } catch (err) {
                log.error('Error while creating short link for', window.location.href, err)
                commit('setShortLink', { shortLink: window.location.href, dispatcher })
            }
        },
        closeShareMenuAndRemoveShortLinks({ commit, dispatch }, { dispatcher }) {
            commit('setIsMenuSectionShown', { show: false, dispatcher })
            dispatch('clearShortLinks', { dispatcher })
        },
        toggleShareMenuSection({ commit, state }, { dispatcher }) {
            commit('setIsMenuSectionShown', { show: !state.isMenuSectionShown, dispatcher })
        },
        clearShortLinks({ commit }, { dispatcher }) {
            commit('setShortLink', { shortLink: null, dispatcher })
        },
    },
    mutations: {
        setShortLink(state, { shortLink }) {
            state.shortLink = shortLink
        },
        setIsMenuSectionShown(state, { show }) {
            state.isMenuSectionShown = show
        },
    },
}
