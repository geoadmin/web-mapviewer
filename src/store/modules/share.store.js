import { getShortLink } from '@/api/shortlink.api'

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
         * Flag telling if the short link should be updated anytime the URL changes.
         *
         * This will be true when the share section of the menu is shown so that the short link is
         * always in sync with the app state. But as soon as the share section in the menu is closed
         * we can stop updating the link (otherwise we create a lot of unwanted/unused short links)
         */
        keepUpdatingShortLink: false,
    },
    getters: {},
    actions: {
        async generateShortLink({ commit }) {
            const shortLink = await getShortLink(window.location.href)
            if (shortLink) {
                commit('setShortLink', shortLink)
            }
        },
        setKeepUpdatingShortLink({ commit }, flagValue) {
            commit('setKeepUpdatingShortLink', flagValue)
        },
    },
    mutations: {
        setShortLink(state, shortLink) {
            state.shortLink = shortLink
        },
        setKeepUpdatingShortLink(state, flagValue) {
            state.keepUpdatingShortLink = flagValue
        },
    },
}
